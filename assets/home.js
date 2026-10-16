(() => {
  const search = document.querySelector('[data-note-search]');
  const login = document.querySelector('[data-home-login]');
  if (!search || !login) return;

  const searchForm = search.querySelector('[data-search-form]');
  const searchInput = search.querySelector('[data-search-input]');
  const searchStatus = search.querySelector('[data-search-status]');
  const searchResults = search.querySelector('[data-search-results]');
  let indexPromise;
  let searchSerial = 0;
  const normal = value => String(value || '').normalize('NFKC').toLocaleLowerCase();
  const loadIndex = () => indexPromise ||= fetch(search.dataset.indexUrl, { cache: 'force-cache' })
    .then(response => {
      if (!response.ok) throw new Error('索引加载失败');
      return response.json();
    })
    .then(items => {
      if (!Array.isArray(items)) throw new Error('索引格式错误');
      return items.map(item => ({
        ...item,
        titleText: normal(item.title),
        categoryText: normal(item.category),
        summaryText: normal(item.summary),
        contentText: normal(item.content)
      }));
    });

  const snippet = (item, terms) => {
    const raw = String(item.summary || item.content || '');
    const clean = raw.replace(/<[^>]+>/g, ' ').replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/[#*`>|\[\]{}]/g, ' ').replace(/\s+/g, ' ').trim();
    const found = terms.map(term => normal(clean).indexOf(term)).find(position => position >= 0) ?? 0;
    const start = Math.max(0, found - 28);
    return (start ? '…' : '') + clean.slice(start, start + 110) + (clean.length > start + 110 ? '…' : '');
  };

  async function runSearch() {
    const serial = ++searchSerial;
    const terms = normal(searchInput.value).trim().split(/\s+/).filter(Boolean);
    searchResults.replaceChildren();
    searchResults.hidden = true;
    if (!terms.length) {
      searchStatus.textContent = '输入关键词，即可检索已发布的笔记。';
      searchStatus.dataset.state = '';
      return;
    }
    searchStatus.textContent = '正在搜索笔记…';
    searchStatus.dataset.state = '';
    try {
      const items = await loadIndex();
      if (serial !== searchSerial) return;
      const matches = items.map(item => {
        const fields = [item.titleText, item.categoryText, item.summaryText, item.contentText];
        if (!terms.every(term => fields.some(field => field.includes(term)))) return null;
        const score = terms.reduce((total, term) => total +
          (item.titleText.includes(term) ? 8 : 0) +
          (item.categoryText.includes(term) ? 4 : 0) +
          (item.summaryText.includes(term) ? 3 : 0) +
          (item.contentText.includes(term) ? 1 : 0), 0);
        return { item, score };
      }).filter(Boolean).sort((a, b) => b.score - a.score || String(a.item.title).localeCompare(String(b.item.title), 'zh-CN'));
      searchStatus.textContent = matches.length ? `找到 ${matches.length} 篇笔记，显示前 ${Math.min(matches.length, 10)} 篇。` : '没有找到匹配的笔记，请换个关键词。';
      for (const { item } of matches.slice(0, 10)) {
        const row = document.createElement('li');
        const link = document.createElement('a');
        const title = document.createElement('strong');
        const category = document.createElement('small');
        const excerpt = document.createElement('span');
        link.href = item.url;
        title.textContent = item.title;
        category.textContent = item.category;
        excerpt.textContent = snippet(item, terms);
        link.append(title, category, excerpt);
        row.append(link);
        searchResults.append(row);
      }
      searchResults.hidden = !matches.length;
    } catch {
      if (serial !== searchSerial) return;
      searchStatus.textContent = '搜索暂时不可用，请稍后重试。';
      searchStatus.dataset.state = 'error';
      indexPromise = null;
    }
  }

  let debounce;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(runSearch, 140);
  });
  searchForm.addEventListener('submit', event => { event.preventDefault(); clearTimeout(debounce); runSearch(); });
  document.addEventListener('keydown', event => {
    if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return;
    const active = document.activeElement;
    if (active?.matches('input, textarea, select') || active?.isContentEditable) return;
    event.preventDefault();
    searchInput.focus();
  });

  const endpoint = (document.body.dataset.submissionEndpoint || '').trim().replace(/\/+$/, '');
  const tokenKey = 'pengiee-session-v2:' + endpoint;
  const form = login.querySelector('[data-home-login-form]');
  const status = login.querySelector('[data-home-auth-status]');
  const userBox = login.querySelector('[data-home-user]');
  const userEmail = login.querySelector('[data-home-user-email]');
  const logout = login.querySelector('[data-home-logout]');
  let ready = false;
  let busy = false;
  let token = '';
  try { token = sessionStorage.getItem(tokenKey) || ''; } catch { /* Memory-only session. */ }

  function validEndpoint() {
    try {
      const url = new URL(endpoint);
      return !url.username && !url.password && !url.search && !url.hash &&
        (url.protocol === 'https:' || (url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)));
    } catch { return false; }
  }
  function setToken(value) {
    token = value || '';
    try {
      if (token) sessionStorage.setItem(tokenKey, token);
      else sessionStorage.removeItem(tokenKey);
    } catch { /* Memory-only session. */ }
  }
  function setStatus(text, error = false) {
    status.textContent = text;
    status.dataset.state = error ? 'error' : 'ok';
  }
  function display(user) {
    form.hidden = Boolean(user);
    userBox.hidden = !user;
    userEmail.textContent = user?.email || '';
  }
  function lock() {
    form.querySelectorAll('input, button').forEach(node => { node.disabled = !ready || busy; });
    logout.disabled = busy;
  }
  async function request(path, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(endpoint + path, {
        method: options.method || 'GET',
        headers: {
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
          ...(options.body ? { 'Content-Type': 'application/json' } : {})
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        credentials: 'omit', redirect: 'error', cache: 'no-store', signal: controller.signal
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401) setToken('');
        throw new Error(typeof data.error === 'string' ? data.error : data.error?.message || `请求失败（${response.status}）。`);
      }
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('连接超时，请稍后重试。');
      if (error instanceof TypeError) throw new Error('无法连接账号服务，请稍后重试。');
      throw error;
    } finally { clearTimeout(timer); }
  }
  async function initializeLogin() {
    ready = false;
    display(null);
    lock();
    if (!validEndpoint()) {
      setStatus('账号服务暂未开通；公开笔记可直接阅读。');
      return;
    }
    setStatus('正在连接账号服务…');
    try {
      await request('/api/health');
      if (token) {
        try { display((await request('/api/auth/me')).user); }
        catch { setToken(''); display(null); }
      }
      ready = true;
      setStatus(token ? '本次登录仅保留在当前浏览器标签页。' : '账号服务已连接。');
    } catch (error) { setStatus(error.message, true); }
    finally { lock(); }
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!ready || busy || !form.reportValidity()) return;
    busy = true; lock(); setStatus('正在登录…');
    try {
      const data = Object.fromEntries(new FormData(form));
      const result = await request('/api/auth/login', { method: 'POST', body: data });
      if (!result.token || !result.user?.email) throw new Error('登录响应不完整，请稍后重试。');
      setToken(result.token);
      form.reset(); display(result.user);
      setStatus('登录成功，本次会话仅在当前标签页有效。');
    } catch (error) { setStatus(error.message, true); }
    finally { busy = false; lock(); }
  });
  logout.addEventListener('click', async () => {
    if (busy || !token) return;
    busy = true; lock(); setStatus('正在退出…');
    try {
      await request('/api/auth/logout', { method: 'POST' });
      setToken(''); display(null); setStatus('已退出登录。');
    } catch (error) { setStatus(error.message, true); }
    finally { busy = false; lock(); }
  });
  window.addEventListener('pageshow', event => { if (event.persisted) initializeLogin(); });
  initializeLogin();
})();
