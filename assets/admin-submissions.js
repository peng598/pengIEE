(() => {
  const page = document.querySelector('[data-admin-page]');
  if (!page) return;
  const endpoint = (document.body.dataset.submissionEndpoint || '').replace(/\/$/, '');
  const token = localStorage.getItem('pengiee-session') || '';
  const status = page.querySelector('[data-admin-status]');
  const list = page.querySelector('[data-admin-list]');
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const render = (items) => { list.innerHTML = items.length ? items.map((item) => `<article class="admin-item"><div><strong>${esc(item.title)}</strong><small>${esc(item.email)} · ${esc(item.category)} · ${esc(item.level)} · ${new Date(item.created_at).toLocaleString('zh-CN')}</small><p>${esc(item.description)}</p></div><button class="text-button" type="button" data-download="${esc(item.id)}" data-file-name="${esc(item.file_name)}">下载 ${esc(item.file_name)}</button></article>`).join('') : '<p class="resource-note">暂无提交。</p>'; };
  if (!endpoint || !token) { status.textContent = '请先使用管理员账号登录。'; return; }
  list.addEventListener('click', async (event) => { const button = event.target.closest('[data-download]'); if (!button) return; button.disabled = true; try { const response = await fetch(`${endpoint}/api/admin/submissions/${encodeURIComponent(button.dataset.download)}/download`, { headers: { Authorization: `Bearer ${token}` } }); if (!response.ok) throw new Error('下载失败。'); const blob = await response.blob(); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = button.dataset.fileName || 'download'; anchor.click(); URL.revokeObjectURL(url); } catch (error) { status.textContent = error.message; } finally { button.disabled = false; } });
  fetch(`${endpoint}/api/admin/submissions`, { headers: { Authorization: `Bearer ${token}` } }).then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.error || '无法读取提交列表。'); status.textContent = `共 ${body.submissions.length} 条提交`; render(body.submissions); }).catch((error) => { status.textContent = error.message; list.innerHTML = ''; });
})();
