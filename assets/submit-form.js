(() => {
  const page = document.querySelector('[data-submission-page]');
  const api = window.PengieeSubmission;
  if (!page || !api) return;
  const login = page.querySelector('[data-login-form]');
  const register = page.querySelector('[data-register-form]');
  const upload = page.querySelector('[data-submit-form]');
  const passwordForm = page.querySelector('[data-password-form]');
  const logged = page.querySelector('[data-logged-in]');
  const serviceStatus = page.querySelector('[data-service-status]');
  const uploadStatus = page.querySelector('[data-submit-status]');
  const authStatuses = page.querySelectorAll('[data-auth-status]');
  const passwordStatus = page.querySelector('[data-password-status]');
  let ready = false, busy = false, currentUser = null, maxBytes = 4 * 1024 * 1024;
  const message = (node, text, error = false) => {
    if (node) { node.textContent = text; node.dataset.state = error ? 'error' : 'ok'; }
  };
  const authMessage = (text, error = false) => authStatuses.forEach(node => message(node,text,error));
  function lock() {
    page.querySelectorAll('form button, form input, form select, form textarea').forEach(node => { node.disabled = busy || !ready; });
    page.querySelector('[data-logout]').disabled = busy;
  }
  function display(user) {
    currentUser = user;
    login.hidden = Boolean(user); register.hidden = true; logged.hidden = !user;
    if (upload) upload.hidden = !user;
    if (passwordForm) passwordForm.hidden = !user;
    page.querySelector('[data-user-email]').textContent = user?.email || '';
    page.querySelector('[data-auth-title]').textContent = user ? '已登录' : '登录后提交';
    page.querySelector('[data-auth-subtitle]').textContent = user ? '本次登录仅保留在当前浏览器标签页中。' : '首次使用请注册邮箱账号，密码至少 10 位。';
    const admin = page.querySelector('[data-admin-link]');
    if (admin) admin.hidden = user?.role !== 'admin';
    if (!user) {
      upload?.reset(); passwordForm?.reset();
      message(uploadStatus, '');
    }
  }
  async function action(work, onError) {
    if (busy || !ready) return;
    busy = true; lock();
    try { await work(); }
    catch (error) {
      if (!api.hasToken() && currentUser) display(null);
      onError(error);
    } finally { busy = false; lock(); }
  }
  page.querySelector('[data-show-register]').addEventListener('click', () => {
    login.reset(); register.reset(); login.hidden = true; register.hidden = false; authMessage('');
    register.elements.email.focus();
  });
  page.querySelector('[data-show-login]').addEventListener('click', () => {
    register.reset(); display(null); authMessage(''); login.elements.email.focus();
  });
  for (const [form, path] of [[login,'login'],[register,'register']]) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = Object.fromEntries(new FormData(form));
      if (path === 'register' && data.password !== data.passwordConfirm) return authMessage('两次密码不一致。',true);
      action(async () => {
        authMessage(path === 'login' ? '正在登录…' : '正在创建账号…');
        const result = await api.request('/api/auth/' + path, { method: 'POST', body: { email: data.email, password: data.password } });
        api.setToken(result.token); login.reset(); register.reset(); authMessage(''); display(result.user);
      }, error => authMessage(error.message,true));
    });
  }
  page.querySelector('[data-logout]').addEventListener('click', () => action(async () => {
    await api.request('/api/auth/logout', { method: 'POST' });
    api.setToken(''); display(null); authMessage('已安全退出，旧会话已失效。');
  }, error => message(serviceStatus, error.message + ' 如网络中断，请恢复后再退出以撤销服务端会话。',true)));
  passwordForm?.addEventListener('submit', event => {
    event.preventDefault();
    if (!passwordForm.reportValidity()) return;
    const data = Object.fromEntries(new FormData(passwordForm));
    if (data.new_password !== data.confirm_password) return message(passwordStatus,'两次新密码不一致。',true);
    action(async () => {
      await api.request('/api/auth/password', { method:'POST', body: { current_password: data.current_password, new_password: data.new_password } });
      api.setToken(''); display(null); authMessage('密码已修改，所有设备需要重新登录。');
    }, error => message(passwordStatus,error.message,true));
  });
  const fileHelp = page.querySelector('[data-file-name]');
  upload?.elements.file.addEventListener('change', () => {
    const file = upload.elements.file.files?.[0];
    message(fileHelp, file ? file.name + ' · ' + (file.size / 1048576).toFixed(2) + ' MB' : '请选择文件。', Boolean(file && file.size > maxBytes));
  });
  upload?.addEventListener('submit', event => {
    event.preventDefault();
    if (!upload.reportValidity()) return;
    const file = upload.elements.file.files?.[0];
    if (!file || !file.size || file.size > maxBytes) return message(uploadStatus,'请选择非空文件，且大小不超过 ' + (maxBytes / 1048576) + ' MB。',true);
    const data = new FormData(upload);
    action(async () => {
      message(uploadStatus,'正在私密上传，请勿重复提交…');
      const result = await api.request('/api/submissions', { method:'POST', body:data });
      upload.reset(); message(fileHelp,'请选择文件。');
      message(uploadStatus,'已提交，编号：' + result.submission.id + '。只有站长可以查看和下载。');
    }, error => { message(uploadStatus,error.message,true); if (!currentUser) authMessage(error.message,true); });
  });
  async function initialize() {
    ready = false; display(null); lock();
    message(serviceStatus,'正在检查账号与私有存储服务…');
    try {
      const health = await api.request('/api/health');
      maxBytes = health.max_upload_bytes;
      if (api.hasToken()) display((await api.request('/api/auth/me')).user);
      ready = true;
      message(serviceStatus,'账号服务已连接 · 单文件上限 ' + (maxBytes / 1048576) + ' MB · 上传后仅站长可查看');
    } catch (error) {
      if (error.status === 401) { ready = true; display(null); authMessage(error.message,true); }
      message(serviceStatus,error.message,true);
    } finally { lock(); }
  }
  window.addEventListener('pageshow', event => { if (event.persisted) initialize(); });
  initialize();
})();
