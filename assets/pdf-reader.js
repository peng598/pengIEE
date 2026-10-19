// PDF bytes are fetched by PDF.js and painted to canvas. Never navigate an
// iframe/window to COS: its default domain deliberately forces downloads.
const vendor = new URL('./vendor/pdfjs-6.4.299/', import.meta.url);
let enginePromise;

function loadEngine() {
  if (!enginePromise) {
    enginePromise = import(new URL('pdf.min.mjs', vendor).href).then((engine) => {
      engine.GlobalWorkerOptions.workerSrc = new URL('pdf.worker.min.mjs', vendor).href;
      return engine;
    }).catch((error) => {
      enginePromise = null;
      throw error;
    });
  }
  return enginePromise;
}

async function protectedTransport(engine, file, onFailure) {
  const chunkSize = 262144;
  const controllers = new Set();
  async function request(begin, end) {
    const controller = new AbortController();
    controllers.add(controller);
    try {
      const response = await fetch(file.readUrl, {
        headers: { Range: `bytes=${begin}-${end - 1}` },
        signal: controller.signal,
        cache: 'no-store'
      });
      if (response.status !== 206 ||
          response.headers.get('Content-Range') !== `bytes ${begin}-${end - 1}/${file.bytes}`) {
        throw new Error(`PDF range request failed: ${response.status}`);
      }
      const data = new Uint8Array(await response.arrayBuffer());
      if (data.length !== end - begin) throw new Error('PDF range length mismatch');
      return data;
    } finally { controllers.delete(controller); }
  }
  const initialEnd = Math.min(chunkSize, file.bytes);
  const initialData = await request(0, initialEnd);
  class ReferenceTransport extends engine.PDFDataRangeTransport {
    requestDataRange(begin, end) {
      request(begin, end).then((data) => this.onDataRange(begin, data)).catch(onFailure);
    }
    abort() { for (const controller of controllers) controller.abort(); }
  }
  return new ReferenceTransport(file.bytes, initialData, initialEnd === file.bytes);
}

export function createPdfReader(dialog) {
  const get = (name) => dialog.querySelector(`[data-reader-${name}]`);
  const ui = Object.fromEntries(['title', 'close', 'number', 'jump', 'total',
    'zoom', 'rotate', 'stage', 'page', 'notice', 'error-title', 'error', 'retry',
    'status', 'toc-toggle', 'toc-close', 'toc', 'toc-backdrop', 'outline'
  ].map((name) => [name, get(name)]));
  let documentTask, pdf, renderTask, currentFile, opener;
  let session = 0, layoutVersion = 0, pumpId = 0, pageNumber = 1, rotation = 0;
  let loadTimer, resizeTimer, scrollFrame, stageWidth = 0, renderingPage = 0;
  let pageSlots = [], baseSize = { width: 1, height: 1 }, pageSizes = new Map();
  let rendered = new Map(), pending = new Set(), rendering = false, outlineEntries = [];

  function controls() {
    ui.number.disabled = ui.jump.disabled = ui.zoom.disabled = ui.rotate.disabled = !pdf;
    if (document.activeElement !== ui.number) ui.number.value = String(pageNumber);
    ui.number.max = String(pdf?.numPages || 1);
    ui.total.textContent = pdf ? String(pdf.numPages) : '—';
  }

  function setTocOpen(open) {
    ui.toc.hidden = !open;
    ui['toc-backdrop'].hidden = !open;
    ui['toc-toggle'].setAttribute('aria-expanded', String(open));
    ui['toc-toggle'].setAttribute('aria-label', open ? '收起文档目录' : '显示文档目录');
  }

  function stop() {
    session += 1;
    layoutVersion += 1;
    clearTimeout(loadTimer);
    clearTimeout(resizeTimer);
    cancelAnimationFrame(scrollFrame);
    renderTask?.cancel();
    renderTask = null;
    // Destroying the loading task also terminates its worker and range requests.
    documentTask?.destroy().catch(() => {});
    documentTask = pdf = null;
    pageSlots = [];
    pageSizes.clear();
    rendered.clear();
    pending.clear();
    outlineEntries = [];
    pumpId += 1;
    rendering = false;
    renderingPage = 0;
    ui.page.replaceChildren();
    ui.page.hidden = true;
    ui.outline.replaceChildren();
    ui.stage.setAttribute('aria-busy', 'false');
    controls();
  }

  function errorMessage(error) {
    if (error?.name === 'PasswordException') return '这份 PDF 设有密码，请使用有权访问的未加密版本。';
    if (error?.name === 'InvalidPDFException') return '文件不是有效的 PDF，或文件内容已损坏。';
    if (error?.name === 'MissingPDFException' || error?.status === 404) return '云端未找到这份文档，请联系网站维护者检查文件链接。';
    if (error?.status === 401 || error?.status === 403) return '云端拒绝读取此文档，请联系网站维护者检查访问权限。';
    if (error?.name === 'TimeoutError') return '文档读取超时，请检查网络后重试。';
    return '未能读取文档。请检查网络后重试；若持续失败，请联系网站维护者检查云端链接和跨域设置。';
  }

  function showError(error) {
    clearTimeout(loadTimer);
    ui.stage.setAttribute('aria-busy', 'false');
    ui.page.hidden = true;
    ui.notice.hidden = false;
    ui['error-title'].textContent = '文档暂时无法显示';
    ui.error.textContent = errorMessage(error);
    ui.status.textContent = '加载失败 · 可重新加载';
  }

  function scaleFor(size) {
    return ui.zoom.value === 'fit'
      ? Math.max(0.1, (ui.stage.clientWidth - 32) / size.width)
      : Number(ui.zoom.value) * 96 / 72;
  }

  function placeholder(number) {
    const label = document.createElement('span');
    label.className = 'pdf-page-placeholder';
    label.textContent = `第 ${number} 页 · 滑动后加载`;
    return label;
  }

  function sizeSlot(number) {
    const size = pageSizes.get(number) || baseSize;
    const scale = scaleFor(size);
    const slot = pageSlots[number - 1];
    slot.style.width = `${Math.max(1, size.width * scale)}px`;
    slot.style.height = `${Math.max(1, size.height * scale)}px`;
    return scale;
  }

  function releaseDistantPages() {
    for (const [number] of rendered) {
      if (Math.abs(number - pageNumber) <= 3) continue;
      pageSlots[number - 1].replaceChildren(placeholder(number));
      rendered.delete(number);
    }
  }

  function scheduleNearby() {
    if (!pdf) return;
    pending.clear();
    for (let number = Math.max(1, pageNumber - 1);
      number <= Math.min(pdf.numPages, pageNumber + 2); number += 1) {
      if (!rendered.has(number)) pending.add(number);
    }
    if (renderingPage && Math.abs(renderingPage - pageNumber) > 3) renderTask?.cancel();
    releaseDistantPages();
    pump();
  }

  async function renderPage(number, activeSession, version) {
    const slot = pageSlots[number - 1];
    let page, task;
    try {
      page = await pdf.getPage(number);
      if (activeSession !== session || version !== layoutVersion) return;
      const angle = (page.rotate + rotation) % 360;
      const original = page.getViewport({ scale: 1, rotation: angle });
      pageSizes.set(number, { width: original.width, height: original.height });
      const oldHeight = slot.offsetHeight;
      const scale = sizeSlot(number);
      if (number < pageNumber) ui.stage.scrollTop += slot.offsetHeight - oldHeight;
      const viewport = page.getViewport({ scale, rotation: angle });
      // Limit canvas memory on phones and very large engineering drawings.
      const ratio = Math.min(window.devicePixelRatio || 1, 2,
        Math.sqrt(8_000_000 / (viewport.width * viewport.height)));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(viewport.width * ratio));
      canvas.height = Math.max(1, Math.floor(viewport.height * ratio));
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', `${currentFile.title}，第 ${number} 页`);
      task = page.render({
        canvasContext: canvas.getContext('2d'), viewport,
        transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0]
      });
      renderTask = task;
      await task.promise;
      if (activeSession !== session || version !== layoutVersion) return;
      const label = document.createElement('span');
      label.className = 'pdf-page-label';
      label.textContent = `${number} / ${pdf.numPages}`;
      slot.replaceChildren(canvas, label);
      rendered.set(number, canvas);
      ui.stage.setAttribute('aria-busy', 'false');
      updateStatus();
    } catch (error) {
      if (activeSession !== session || version !== layoutVersion || error?.name === 'RenderingCancelledException') return;
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.className = 'pdf-page-retry';
      retry.textContent = `第 ${number} 页加载失败，点击重试`;
      retry.addEventListener('click', () => { pending.add(number); pump(); });
      slot.replaceChildren(retry);
      if (number === pageNumber) {
        ui.stage.setAttribute('aria-busy', 'false');
        ui.status.textContent = `第 ${number} 页加载失败 · 可重试`;
      }
    } finally {
      if (renderTask === task) renderTask = null;
      page?.cleanup();
    }
  }

  async function pump() {
    if (rendering || !pdf) return;
    rendering = true;
    const activePump = ++pumpId;
    const activeSession = session;
    const version = layoutVersion;
    try {
      while (pending.size && activeSession === session && version === layoutVersion) {
        const number = [...pending].sort((a, b) =>
          Math.abs(a - pageNumber) - Math.abs(b - pageNumber))[0];
        pending.delete(number);
        if (rendered.has(number)) continue;
        renderingPage = number;
        await renderPage(number, activeSession, version);
        renderingPage = 0;
      }
    } finally {
      if (activePump !== pumpId) return;
      renderingPage = 0;
      rendering = false;
      if (pending.size && pdf && activeSession === session) pump();
    }
  }

  function updateStatus() {
    if (!pdf) return;
    ui.status.textContent = `第 ${pageNumber} / ${pdf.numPages} 页 · 上下滑动连续阅读`;
    controls();
    let active;
    for (const entry of outlineEntries) {
      if (entry.page <= pageNumber && (!active || entry.page >= active.page)) active = entry;
    }
    for (const entry of outlineEntries) {
      if (entry === active) entry.button.setAttribute('aria-current', 'location');
      else entry.button.removeAttribute('aria-current');
    }
  }

  function visiblePage() {
    if (!pageSlots.length) return 1;
    if (ui.stage.scrollTop > 0 &&
        ui.stage.scrollTop + ui.stage.clientHeight >= ui.stage.scrollHeight - 2) {
      return pageSlots.length;
    }
    const target = ui.stage.scrollTop + ui.stage.clientHeight * 0.35;
    let low = 0, high = pageSlots.length - 1;
    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      if (pageSlots[middle].offsetTop <= target) low = middle;
      else high = middle - 1;
    }
    return low + 1;
  }

  function onScroll() {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => {
      if (!pdf) return;
      const visible = visiblePage();
      if (visible !== pageNumber) {
        pageNumber = visible;
        updateStatus();
      }
      scheduleNearby();
    });
  }

  function jumpToPage(value) {
    if (!pdf || !Number.isFinite(value)) { controls(); return; }
    pageNumber = Math.max(1, Math.min(pdf.numPages, Math.trunc(value)));
    ui.stage.scrollTop = pageSlots[pageNumber - 1].offsetTop - 12;
    ui.stage.scrollLeft = 0;
    updateStatus();
    scheduleNearby();
  }

  function rebuildLayout() {
    if (!pdf) return;
    const anchor = pageNumber;
    layoutVersion += 1;
    renderTask?.cancel();
    pending.clear();
    rendered.clear();
    for (let number = 1; number <= pageSlots.length; number += 1) {
      pageSlots[number - 1].replaceChildren(placeholder(number));
      sizeSlot(number);
    }
    jumpToPage(anchor);
  }

  async function loadOutline(activeSession) {
    ui.outline.textContent = '正在读取章节目录…';
    try {
      const outline = await pdf.getOutline();
      if (activeSession !== session) return;
      if (!outline?.length) {
        ui.outline.textContent = '这份 PDF 没有内置章节书签，可用上方页码跳转。';
        return;
      }
      const list = document.createElement('ul');
      list.className = 'pdf-outline-list';
      async function addItems(items, parent, depth = 0) {
        for (const item of items) {
          if (activeSession !== session) return;
          const row = document.createElement('li');
          let destination = item.dest;
          if (typeof destination === 'string') {
            try { destination = await pdf.getDestination(destination); }
            catch { destination = null; }
          }
          let target;
          if (Array.isArray(destination)) {
            try {
              target = Number.isInteger(destination[0])
                ? destination[0] + 1 : (await pdf.getPageIndex(destination[0])) + 1;
            } catch { /* Some PDFs contain stale bookmarks. */ }
          }
          if (target >= 1 && target <= pdf.numPages) {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = item.title || `第 ${target} 页`;
            button.title = `跳到第 ${target} 页`;
            button.addEventListener('click', () => {
              jumpToPage(target);
              if (window.innerWidth <= 700) setTocOpen(false);
            });
            row.append(button);
            outlineEntries.push({ page: target, button });
          } else {
            const heading = document.createElement('span');
            heading.textContent = item.title || '未命名章节';
            row.append(heading);
          }
          if (item.items?.length && depth < 8) {
            const children = document.createElement('ul');
            await addItems(item.items, children, depth + 1);
            row.append(children);
          }
          parent.append(row);
        }
      }
      await addItems(outline, list);
      if (activeSession !== session) return;
      ui.outline.replaceChildren(list);
      updateStatus();
    } catch {
      if (activeSession === session) ui.outline.textContent = '章节目录暂时无法读取，可用上方页码跳转。';
    }
  }

  async function open(file) {
    if (!dialog.open) opener = document.activeElement;
    stop();
    currentFile = file;
    pageNumber = 1;
    rotation = 0;
    const activeSession = session;
    ui.title.textContent = file.title;
    ui.notice.hidden = true;
    ui.page.hidden = false;
    ui.zoom.value = 'fit';
    setTocOpen(window.innerWidth > 850);
    controls();
    if (!dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else { dialog.setAttribute('open', ''); dialog.classList.add('pdf-fallback'); }
    }
    document.body.classList.add('pdf-reading');
    ui.close.focus();
    ui.stage.setAttribute('aria-busy', 'true');
    ui.status.textContent = '正在连接文档…';
    stageWidth = ui.stage.clientWidth;
    loadTimer = setTimeout(() => {
      if (activeSession !== session || pdf) return;
      stop();
      showError({ name: 'TimeoutError' });
    }, 90000);
    try {
      const engine = await loadEngine();
      if (activeSession !== session) return;
      const protectedFile = /\/api\/reference\/[a-f0-9]{32}\/read$/.test(new URL(file.readUrl).pathname) &&
        Number.isSafeInteger(file.bytes) && file.bytes > 0;
      const transport = protectedFile
        ? await protectedTransport(engine, file, (error) => {
          if (activeSession !== session) return;
          stop();
          showError(error);
        })
        : null;
      if (activeSession !== session) { transport?.abort(); return; }
      documentTask = engine.getDocument({
        ...(transport ? { range: transport } : { url: file.readUrl }),
        withCredentials: false,
        cMapUrl: new URL('cmaps/', vendor).href,
        cMapPacked: true,
        standardFontDataUrl: new URL('standard_fonts/', vendor).href,
        wasmUrl: new URL('wasm/', vendor).href,
        isEvalSupported: false,
        // Large PDFs stay range-based; do not fetch an entire book in the background.
        disableAutoFetch: true,
        disableStream: true,
        rangeChunkSize: 262144
      });
      documentTask.onProgress = ({ loaded }) => {
        if (activeSession !== session || pdf) return;
        const amount = loaded >= 1048576 ? `${(loaded / 1048576).toFixed(1)} MB` : `${Math.ceil(loaded / 1024)} KB`;
        ui.status.textContent = `正在读取文档… 已接收 ${amount}`;
      };
      documentTask.onPassword = () => {
        if (activeSession !== session) return;
        stop();
        showError({ name: 'PasswordException' });
      };
      const loadedPdf = await documentTask.promise;
      if (activeSession !== session) return;
      pdf = loadedPdf;
      clearTimeout(loadTimer);
      const first = await pdf.getPage(1);
      if (activeSession !== session) return;
      const firstViewport = first.getViewport({ scale: 1, rotation: (first.rotate + rotation) % 360 });
      baseSize = { width: firstViewport.width, height: firstViewport.height };
      pageSizes.set(1, baseSize);
      const fragment = document.createDocumentFragment();
      for (let number = 1; number <= pdf.numPages; number += 1) {
        const slot = document.createElement('section');
        slot.className = 'pdf-page';
        slot.dataset.pageNumber = String(number);
        slot.setAttribute('aria-label', `第 ${number} 页`);
        slot.append(placeholder(number));
        pageSlots.push(slot);
        fragment.append(slot);
      }
      ui.page.append(fragment);
      for (let number = 1; number <= pdf.numPages; number += 1) sizeSlot(number);
      ui.stage.scrollTop = ui.stage.scrollLeft = 0;
      controls();
      updateStatus();
      scheduleNearby();
      loadOutline(activeSession);
    } catch (error) {
      if (activeSession !== session) return;
      stop();
      showError(error);
    }
  }

  function closed() {
    stop();
    document.body.classList.remove('pdf-reading');
    opener?.focus();
  }

  function close() {
    if (typeof dialog.close === 'function') dialog.close();
    else { dialog.removeAttribute('open'); closed(); }
  }

  ui.close.addEventListener('click', close);
  dialog.addEventListener('close', closed);
  dialog.addEventListener('click', (event) => { if (event.target === dialog) close(); });
  ui['toc-toggle'].addEventListener('click', () => setTocOpen(ui.toc.hidden));
  ui['toc-close'].addEventListener('click', () => setTocOpen(false));
  ui['toc-backdrop'].addEventListener('click', () => setTocOpen(false));
  ui.stage.addEventListener('scroll', onScroll, { passive: true });
  ui.jump.addEventListener('click', () => jumpToPage(ui.number.valueAsNumber));
  ui.number.addEventListener('change', () => jumpToPage(ui.number.valueAsNumber));
  ui.number.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { jumpToPage(ui.number.valueAsNumber); ui.stage.focus(); }
  });
  ui.zoom.addEventListener('change', rebuildLayout);
  ui.rotate.addEventListener('click', () => {
    rotation = (rotation + 90) % 360;
    pageSizes = new Map();
    baseSize = { width: baseSize.height, height: baseSize.width };
    rebuildLayout();
  });
  ui.retry.addEventListener('click', () => open(currentFile));
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && dialog.classList.contains('pdf-fallback')) close();
  });
  new ResizeObserver(() => {
    const width = ui.stage.clientWidth;
    if (!dialog.open || Math.abs(width - stageWidth) < 2) return;
    stageWidth = width;
    clearTimeout(resizeTimer);
    if (pdf && ui.zoom.value === 'fit') resizeTimer = setTimeout(rebuildLayout, 160);
  }).observe(ui.stage);
  return { open, close };
}
