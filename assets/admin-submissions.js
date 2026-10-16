(() => {
  const page = document.querySelector('[data-admin-page]');
  const api = window.PengieeSubmission;
  if (!page || !api) return;
  const status = page.querySelector('[data-admin-status]');
  const list = page.querySelector('[data-admin-list]');
  const next = page.querySelector('[data-admin-next]');
  const refresh = page.querySelector('[data-admin-refresh]');
  let offset = 0, nextOffset = null, busy = false;
  const node = (tag, text, className) => {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  function render(items, append) {
    if (!append) list.replaceChildren();
    if (!items.length && !append) list.append(node('p','暂无提交。','resource-note'));
    for (const item of items) {
      const article = node('article','','admin-item');
      const copy = node('div','');
      copy.append(node('strong',item.title), node('small',item.email + ' · ' + item.category + ' · ' + item.level),
        node('small',new Date(item.created_at).toLocaleString('zh-CN') + ' · ' + (item.file_size / 1048576).toFixed(2) + ' MB · ' + (item.status === 'reviewed' ? '已查阅' : '待查阅')),
        node('p',item.description),node('p','来源与授权：' + item.source));
      const controls = node('div','','admin-item-actions');
      const download = node('button','下载 ' + item.file_name,'text-button');
      download.type = 'button';
      download.addEventListener('click', async () => {
        download.disabled = true;
        try {
          const blob = await api.request('/api/admin/submissions/' + encodeURIComponent(item.id) + '/download',{ binary:true });
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url; anchor.download = item.file_name; document.body.append(anchor); anchor.click(); anchor.remove();
          setTimeout(() => URL.revokeObjectURL(url),60000);
        } catch (error) { failure(error); }
        finally { download.disabled = false; }
      });
      controls.append(download);
      if (item.status !== 'reviewed') {
        const review = node('button','标记已查阅','text-button'); review.type = 'button';
        review.addEventListener('click',async () => {
          review.disabled = true;
          try {
            await api.request('/api/admin/submissions/' + encodeURIComponent(item.id) + '/review',{ method:'POST' });
            review.textContent = '已查阅（仍为私有）';
          } catch (error) { review.disabled = false; failure(error); }
        });
        controls.append(review);
      }
      article.append(copy, controls); list.append(article);
    }
  }
  function failure(error) {
    status.textContent = error.message;
    if (error.status === 401 || error.status === 403) { list.replaceChildren(); next.hidden = true; }
  }
  async function load(append = false) {
    if (busy) return;
    busy = true; next.disabled = true; refresh.disabled = true;
    if (!append) { offset = 0; list.replaceChildren(); next.hidden = true; }
    status.textContent = '正在验证管理员权限…';
    try {
      if (!api.hasToken()) throw new Error('请先在本标签页使用管理员账号登录。');
      const body = await api.request('/api/admin/submissions?offset=' + offset);
      render(body.submissions,append);
      nextOffset = body.next_offset; next.hidden = nextOffset === null;
      status.textContent = '已加载 ' + list.querySelectorAll('.admin-item').length + ' 条；所有资料仍为私有，标记查阅不会公开。';
    } catch (error) { failure(error); }
    finally { busy = false; next.disabled = false; refresh.disabled = false; }
  }
  next.addEventListener('click', () => { offset = nextOffset; load(true); });
  refresh.addEventListener('click', () => load());
  // Do not leave private records visible in the back/forward cache.
  window.addEventListener('pagehide', () => { list.replaceChildren(); });
  window.addEventListener('pageshow', event => { if (event.persisted) load(); });
  load();
})();
