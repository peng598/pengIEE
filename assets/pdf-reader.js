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

export function createPdfReader(dialog) {
  const get = (name) => dialog.querySelector(`[data-reader-${name}]`);
  const ui = Object.fromEntries(['title', 'download', 'close', 'prev', 'next', 'number',
    'total', 'zoom', 'rotate', 'stage', 'page', 'notice', 'error-title', 'error',
    'retry', 'status'].map((name) => [name, get(name)]));
  let documentTask, pdf, renderTask, currentFile, opener, previousPage;
  let session = 0, renderVersion = 0, pageNumber = 1, rotation = 0;
  let loadTimer, resizeTimer, stageWidth = 0;

  function controls() {
    ui.prev.disabled = !pdf || pageNumber <= 1;
    ui.next.disabled = !pdf || pageNumber >= pdf.numPages;
    ui.number.disabled = ui.zoom.disabled = ui.rotate.disabled = !pdf;
    ui.number.value = String(pageNumber);
    ui.number.max = String(pdf?.numPages || 1);
    ui.total.textContent = pdf ? String(pdf.numPages) : '—';
  }

  function stop() {
    session += 1;
    renderVersion += 1;
    clearTimeout(loadTimer);
    clearTimeout(resizeTimer);
    renderTask?.cancel();
    renderTask = null;
    // Destroying the loading task also terminates its worker and range requests.
    documentTask?.destroy().catch(() => {});
    documentTask = pdf = previousPage = null;
    ui.page.replaceChildren();
    ui.page.hidden = true;
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

  async function renderPage() {
    if (!pdf) return;
    const activeSession = session;
    const version = ++renderVersion;
    const activePdf = pdf;
    const requestedPage = pageNumber;
    renderTask?.cancel();
    ui.notice.hidden = true;
    ui.stage.setAttribute('aria-busy', 'true');
    ui.status.textContent = `正在显示第 ${requestedPage} 页…`;
    controls();
    try {
      const page = await activePdf.getPage(requestedPage);
      if (activeSession !== session || version !== renderVersion) return;
      const angle = (page.rotate + rotation) % 360;
      const original = page.getViewport({ scale: 1, rotation: angle });
      const scale = ui.zoom.value === 'fit'
        ? Math.max(0.1, (ui.stage.clientWidth - 32) / original.width)
        : Number(ui.zoom.value) * 96 / 72;
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
      canvas.setAttribute('aria-label', `${currentFile.title}，第 ${requestedPage} 页`);
      const task = page.render({
        canvasContext: canvas.getContext('2d'), viewport,
        transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0]
      });
      renderTask = task;
      await task.promise;
      if (activeSession !== session || version !== renderVersion) return;
      renderTask = null;
      ui.page.replaceChildren(canvas);
      ui.page.hidden = false;
      ui.page.dataset.pageNumber = String(requestedPage);
      ui.stage.scrollTop = ui.stage.scrollLeft = 0;
      ui.stage.setAttribute('aria-busy', 'false');
      ui.status.textContent = `第 ${requestedPage} / ${activePdf.numPages} 页 · ${Math.round(scale * 72 / 96 * 100)}%`;
      if (previousPage && previousPage !== page) previousPage.cleanup();
      previousPage = page;
    } catch (error) {
      if (activeSession !== session || version !== renderVersion || error?.name === 'RenderingCancelledException') return;
      showError(error);
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
    ui.download.href = file.cosUrl;
    ui.download.setAttribute('download', `${file.title}.pdf`);
    ui.notice.hidden = true;
    ui.zoom.value = 'fit';
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
      documentTask = engine.getDocument({
        url: file.cosUrl,
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
      controls();
      await renderPage();
    } catch (error) {
      if (activeSession !== session) return;
      stop();
      showError(error);
    }
  }

  function changePage(next) {
    if (!pdf || !Number.isFinite(next)) { controls(); return; }
    const value = Math.max(1, Math.min(pdf.numPages, Math.trunc(next)));
    if (value === pageNumber) { controls(); return; }
    pageNumber = value;
    renderPage();
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
  ui.prev.addEventListener('click', () => changePage(pageNumber - 1));
  ui.next.addEventListener('click', () => changePage(pageNumber + 1));
  ui.number.addEventListener('change', () => changePage(ui.number.valueAsNumber));
  ui.number.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { changePage(ui.number.valueAsNumber); ui.stage.focus(); }
  });
  ui.zoom.addEventListener('change', renderPage);
  ui.rotate.addEventListener('click', () => { rotation = (rotation + 90) % 360; renderPage(); });
  ui.retry.addEventListener('click', () => open(currentFile));
  dialog.addEventListener('keydown', (event) => {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      changePage(pageNumber + (event.key === 'ArrowRight' ? 1 : -1));
    }
    if (event.key === 'Escape' && dialog.classList.contains('pdf-fallback')) close();
  });
  new ResizeObserver(() => {
    const width = ui.stage.clientWidth;
    if (!dialog.open || Math.abs(width - stageWidth) < 2) return;
    stageWidth = width;
    clearTimeout(resizeTimer);
    if (pdf && ui.zoom.value === 'fit') resizeTimer = setTimeout(renderPage, 160);
  }).observe(ui.stage);
  return { open, close };
}
