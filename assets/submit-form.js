(() => {
  const form = document.querySelector('[data-submit-form]');
  if (!form) return;

  const fileInput = form.elements.file;
  const fileName = form.querySelector('[data-file-name]');
  const status = form.querySelector('[data-submit-status]');

  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!fileName) return;
    fileName.textContent = file
      ? `已选择：${file.name}（打开 GitHub 草稿后请再次拖入）`
      : '未选择文件。打开 GitHub 草稿后，需要再次拖入文件。';
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const title = String(data.get('title') || '').trim();
    const category = String(data.get('category') || '').trim();
    const level = String(data.get('level') || '').trim();
    const description = String(data.get('description') || '').trim();
    const source = String(data.get('source') || '').trim();
    const file = fileInput?.files?.[0];
    const fileLabel = file ? file.name : '提交者将在 GitHub 草稿中附加';
    const issueTitle = `[资料提交] ${title}`;
    const issueBody = [
      '## 资料信息',
      '',
      `- **标题**：${title}`,
      `- **知识方向**：${category}`,
      `- **学习层级**：${level}`,
      `- **文件名**：${fileLabel}`,
      '',
      '## 资料简介',
      '',
      description,
      '',
      '## 来源与授权说明',
      '',
      source,
      '',
      '## 提交检查',
      '',
      '- [ ] 已在本 Issue 中附加文件',
      '- [ ] 我确认资料来源清楚，且允许公开分享或由维护者进一步确认授权',
      '- [ ] 我确认资料中不包含密码、密钥、个人隐私或未公开的项目文件',
      '',
      '感谢贡献。请等待维护者审核、分类和发布。'
    ].join('\n');
    const issueUrl = 'https://github.com/peng598/PENGIEE/issues/new?title='
      + encodeURIComponent(issueTitle)
      + '&body=' + encodeURIComponent(issueBody);

    window.open(issueUrl, '_blank', 'noopener');
    if (status) status.textContent = '已打开 GitHub 草稿，请在其中附加文件并提交。';
  });
})();
