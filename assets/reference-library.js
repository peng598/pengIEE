import { createPdfReader } from './pdf-reader.js?v=range-queue-1';

(() => {
  const root = document.querySelector('[data-reference-library]');
  if (!root) return;

  const nodes = {
    categories: root.querySelector('[data-category-list]'),
    results: root.querySelector('[data-reference-results]'),
    subfolders: root.querySelector('[data-subfolders]'),
    search: root.querySelector('[data-reference-search]'),
    sort: root.querySelector('[data-reference-sort]'),
    categoryTitle: root.querySelector('[data-current-category]'),
    count: root.querySelector('[data-result-count]'),
    pagination: root.querySelector('[data-reference-pagination]'),
    error: root.querySelector('[data-reference-error]'),
    cloudStatus: root.querySelector('[data-cloud-status]'),
    statPdfs: root.querySelector('[data-stat-pdfs]'),
    statFolders: root.querySelector('[data-stat-folders]'),
    statSize: root.querySelector('[data-stat-size]'),
    clearCategory: root.querySelector('[data-clear-category]'),
    reader: root.querySelector('[data-reference-reader]')
  };
  const pageSize = 40;
  const state = { catalog: null, category: '', folder: '', query: '', sort: 'name', page: 1, serviceReady: false };
  const number = new Intl.NumberFormat('zh-CN');
  const referenceEndpoint = (root.dataset.referenceApi || '').trim().replace(/\/+$/, '');
  const isLive = (file) => Boolean(referenceEndpoint && state.serviceReady && file.published && file.id);

  const reader = createPdfReader(nodes.reader);
  const openReader = async (file) => {
    const readUrl = isLive(file)
      ? `${referenceEndpoint}/api/reference/${encodeURIComponent(file.id)}/read`
      : file.readUrl;
    if (!readUrl) return;
    reader.open({ ...file, readUrl });
  };
  document.querySelectorAll('[data-reader-url]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      openReader({ title: link.dataset.readerName, readUrl: link.dataset.readerUrl || link.href });
    });
  });

  const formatSize = (bytes) => {
    if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GiB`;
    if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MiB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KiB`;
    return `${number.format(bytes)} B`;
  };

  function setCloudStatus() {
    const liveCount = state.catalog.files.filter(isLive).length;
    nodes.cloudStatus.textContent = liveCount
      ? `${number.format(liveCount)} 份资料已上线`
      : referenceEndpoint && state.serviceReady ? '腾讯云 COS 待接入' : '阅读服务待配置';
    root.classList.toggle('has-live-files', liveCount > 0);
  }

  function renderCategories() {
    nodes.categories.replaceChildren();
    for (const category of state.catalog.categories) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'reference-category';
      button.classList.toggle('is-active', state.category === category.title);
      button.setAttribute('aria-pressed', String(state.category === category.title));
      const marker = document.createElement('span');
      marker.className = 'reference-category-marker';
      marker.textContent = category.title.match(/^\d+/)?.[0]?.slice(-2) || '•';
      const label = document.createElement('span');
      label.className = 'reference-category-label';
      const name = document.createElement('strong');
      name.textContent = category.title.replace(/^\d+[.、]?/, '');
      const subline = document.createElement('small');
      subline.textContent = category.withheld
        ? `${number.format(category.pdfs)} 份 · 未公开`
        : category.pdfs
          ? `${number.format(category.pdfs)} 份 PDF`
          : `${number.format(category.files)} 个非 PDF 文件`;
      label.append(name, subline);
      const arrow = document.createElement('span');
      arrow.className = 'reference-category-arrow';
      arrow.textContent = category.withheld ? '•' : '›';
      button.append(marker, label, arrow);
      button.addEventListener('click', () => {
        state.category = state.category === category.title ? '' : category.title;
        state.folder = '';
        state.page = 1;
        render();
      });
      nodes.categories.append(button);
    }
  }

  function renderFolders(categoryFiles) {
    nodes.subfolders.replaceChildren();
    if (!state.category || !categoryFiles.length) return;
    const nextFolders = new Set();
    for (const file of categoryFiles) {
      const parts = file.folder.split('/').filter(Boolean);
      const selectedParts = state.folder.split('/').filter(Boolean);
      if (selectedParts.some((part, index) => parts[index] !== part)) continue;
      if (parts.length > selectedParts.length) nextFolders.add(parts.slice(0, selectedParts.length + 1).join('/'));
    }
    if (!nextFolders.size && !state.folder) return;

    const allButton = document.createElement('button');
    allButton.type = 'button';
    allButton.className = 'reference-folder-chip';
    allButton.classList.toggle('is-active', !state.folder);
    allButton.textContent = '全部';
    allButton.addEventListener('click', () => { state.folder = ''; state.page = 1; render(); });
    nodes.subfolders.append(allButton);

    if (state.folder) {
      const parentButton = document.createElement('button');
      parentButton.type = 'button';
      parentButton.className = 'reference-folder-chip reference-folder-parent';
      parentButton.textContent = `↑ ${state.folder.split('/').slice(0, -1).at(-1) || '上一级'}`;
      parentButton.addEventListener('click', () => {
        state.folder = state.folder.split('/').slice(0, -1).join('/');
        state.page = 1;
        render();
      });
      nodes.subfolders.append(parentButton);
    }

    for (const folder of nextFolders) {
      const name = folder.split('/').at(-1);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'reference-folder-chip';
      button.classList.toggle('is-active', state.folder === folder);
      button.textContent = name;
      button.addEventListener('click', () => { state.folder = folder; state.page = 1; render(); });
      nodes.subfolders.append(button);
    }
  }

  function makeFileCard(file) {
    const card = document.createElement('article');
    card.className = 'reference-file';
    const icon = document.createElement('span');
    icon.className = 'reference-file-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 2.75h8l4.5 4.5v14H6z"/><path d="M14 2.75v5h4.5M8.5 13h7M8.5 16h7"/></svg><small>PDF</small>';
    const body = document.createElement('div');
    body.className = 'reference-file-body';
    const title = document.createElement('strong');
    title.className = 'reference-file-title';
    title.textContent = file.title;
    const path = document.createElement('small');
    path.className = 'reference-file-path';
    path.textContent = [file.category.replace(/^\d+[.、]?/, ''), file.folder].filter(Boolean).join(' / ');
    body.append(title, path);
    const meta = document.createElement('span');
    meta.className = 'reference-file-size';
    meta.textContent = formatSize(file.bytes);
    const action = isLive(file) ? document.createElement('button') : document.createElement('span');
    action.className = `reference-file-action${isLive(file) ? ' is-live' : ''}`;
    action.textContent = isLive(file) ? '在线阅读' : (file.published ? '阅读服务待配置' : '待上架');
    if (isLive(file)) {
      action.type = 'button';
      action.setAttribute('aria-label', `在线阅读：${file.title}`);
      action.addEventListener('click', () => openReader(file));
    } else {
      action.title = file.published
        ? '网站维护者尚未配置受保护阅读服务。'
        : (file.publicationStatus || '完成公开来源确认并上传到 COS 后开放');
    }
    card.append(icon, body, meta, action);
    return card;
  }

  function filteredFiles() {
    const query = state.query.trim().toLocaleLowerCase('zh-CN');
    const files = state.catalog.files.filter((file) => {
      if (state.category && file.category !== state.category) return false;
      if (state.folder && file.folder !== state.folder && !file.folder.startsWith(`${state.folder}/`)) return false;
      if (!query) return true;
      return `${file.title} ${file.category} ${file.folder}`.toLocaleLowerCase('zh-CN').includes(query);
    });
    if (state.sort === 'size-desc') files.sort((a, b) => b.bytes - a.bytes || a.title.localeCompare(b.title, 'zh-CN'));
    else if (state.sort === 'folder') files.sort((a, b) => a.category.localeCompare(b.category, 'zh-CN') || a.folder.localeCompare(b.folder, 'zh-CN', { numeric: true }) || a.title.localeCompare(b.title, 'zh-CN', { numeric: true }));
    else files.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN', { numeric: true }));
    return files;
  }

  function renderPagination(total) {
    nodes.pagination.replaceChildren();
    const pageCount = Math.ceil(total / pageSize);
    if (pageCount <= 1) return;
    const info = document.createElement('span');
    info.className = 'reference-page-info';
    info.textContent = `${state.page} / ${pageCount}`;
    const previous = document.createElement('button');
    previous.type = 'button';
    previous.textContent = '← 上一页';
    previous.disabled = state.page <= 1;
    previous.addEventListener('click', () => { state.page -= 1; render(); });
    const next = document.createElement('button');
    next.type = 'button';
    next.textContent = '下一页 →';
    next.disabled = state.page >= pageCount;
    next.addEventListener('click', () => { state.page += 1; render(); });
    nodes.pagination.append(previous, info, next);
  }

  function render() {
    if (!state.catalog) return;
    renderCategories();
    const category = state.catalog.categories.find((item) => item.title === state.category);
    const categoryFiles = state.category ? state.catalog.files.filter((file) => file.category === state.category) : [];
    renderFolders(categoryFiles);
    nodes.categoryTitle.textContent = state.folder.split('/').at(-1) || category?.title.replace(/^\d+[.、]?/, '') || '全部资料';
    const files = filteredFiles();
    const pageCount = Math.max(1, Math.ceil(files.length / pageSize));
    state.page = Math.min(state.page, pageCount);
    nodes.count.textContent = `${number.format(files.length)} 份 PDF${files.some(isLive) ? ' · 含在线资料' : ''}`;
    nodes.results.replaceChildren();
    if (!files.length) {
      const empty = document.createElement('div');
      empty.className = 'reference-no-results';
      empty.textContent = category?.withheld
        ? category.reason
        : category && !category.pdfs
          ? `该目录含 ${number.format(category.files)} 个非 PDF 文件；本页面当前只索引 PDF，相关安装包和图片尚未上架。`
          : '没有找到匹配的 PDF。试试更短的关键词，或清除筛选条件。';
      nodes.results.append(empty);
    } else {
      const start = (state.page - 1) * pageSize;
      for (const file of files.slice(start, start + pageSize)) nodes.results.append(makeFileCard(file));
    }
    renderPagination(files.length);
  }

  async function start() {
    try {
      const response = await fetch(root.dataset.catalogUrl, { credentials: 'same-origin' });
      if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);
      state.catalog = await response.json();
      nodes.statPdfs.textContent = number.format(state.catalog.summary.pdfs);
      nodes.statFolders.textContent = number.format(state.catalog.summary.categories);
      nodes.statSize.textContent = formatSize(state.catalog.summary.pdfBytes);
      if (referenceEndpoint) {
        try {
          const health = await fetch(`${referenceEndpoint}/api/reference/health`, { cache: 'no-store' });
          state.serviceReady = health.ok;
        } catch { state.serviceReady = false; }
      }
      setCloudStatus();
      nodes.results.setAttribute('aria-busy', 'false');
      render();
    } catch (error) {
      nodes.results.setAttribute('aria-busy', 'false');
      nodes.error.hidden = false;
      nodes.count.textContent = '索引读取失败';
    }
  }

  nodes.search.addEventListener('input', () => { state.query = nodes.search.value; state.page = 1; render(); });
  nodes.sort.addEventListener('change', () => { state.sort = nodes.sort.value; state.page = 1; render(); });
  nodes.clearCategory.addEventListener('click', () => { state.category = ''; state.folder = ''; state.page = 1; render(); });
  document.addEventListener('keydown', (event) => {
    if (nodes.reader.open) return;
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
      event.preventDefault();
      nodes.search.focus();
    }
    if (event.key === 'Escape' && document.activeElement === nodes.search) {
      nodes.search.value = '';
      state.query = '';
      state.page = 1;
      render();
    }
  });
  start();
})();
