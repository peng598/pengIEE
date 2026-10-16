(() => {
  const endpoint = (document.body.dataset.submissionEndpoint || '').trim().replace(/\/+$/, '');
  const tokenKey = 'pengiee-session-v2:' + endpoint;
  // The old persistent credential is deliberately not reused across backends.
  try { localStorage.removeItem('pengiee-session'); } catch { /* Storage may be disabled. */ }
  let token = '';
  try { token = sessionStorage.getItem(tokenKey) || ''; } catch { /* Fall back to memory. */ }
  const setToken = value => {
    token = value || '';
    try {
      if (token) sessionStorage.setItem(tokenKey, token);
      else sessionStorage.removeItem(tokenKey);
    } catch { /* This page still works with memory-only login. */ }
  };
  function validEndpoint() {
    try {
      const url = new URL(endpoint);
      return !url.username && !url.password && !url.search && !url.hash &&
        (url.protocol === 'https:' || (url.protocol === 'http:' && ['localhost','127.0.0.1'].includes(url.hostname)));
    } catch { return false; }
  }
  async function request(path, { method = 'GET', body, binary = false } = {}) {
    if (!validEndpoint()) throw new Error('账号与私密上传暂未开通，站长需先配置腾讯云服务地址。');
    const headers = new Headers();
    if (token) headers.set('Authorization', 'Bearer ' + token);
    if (body && !(body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify(body);
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60000);
    try {
      const response = await fetch(endpoint + path, {
        method, headers, body, signal: controller.signal, cache: 'no-store', credentials: 'omit', redirect: 'error'
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const error = new Error(typeof data.error === 'string' ? data.error : data.error?.message || '请求失败（' + response.status + '）。');
        error.status = response.status;
        // Wrong current password is a 400; a 401 always invalidates the session.
        if (response.status === 401) setToken('');
        throw error;
      }
      return binary ? response.blob() : response.json();
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('请求超时。上传超时时请勿立即重复提交，可联系站长确认是否收到。');
      if (error instanceof TypeError) throw new Error('无法连接服务，请检查网络或稍后重试。');
      throw error;
    } finally { clearTimeout(timer); }
  }
  window.PengieeSubmission = { request, setToken, hasToken: () => Boolean(token), configured: validEndpoint };
})();
