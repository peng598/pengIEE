---
layout: default
title: 参考资料
summary: 按本地硬件文档目录浏览 PDF 资料、搜索文件，并打开已发布到腾讯云 COS 的文档。
permalink: /resources/
---

{% assign resource_categories = site.data.resources | map: "category" | uniq %}
<link rel="stylesheet" href="{{ '/assets/pdf-reader.css' | relative_url }}?v=continuous-1">
<section class="reference-library" data-reference-library data-catalog-url="{{ '/assets/reference-library.json' | relative_url }}?v=2" data-reference-api="{{ site.submission_endpoint | default: '' | escape }}" aria-labelledby="reference-title">
  <header class="reference-hero">
    <div class="reference-hero-copy">
      <p class="eyebrow">PENGIEE <span class="eyebrow-divider">/</span> REFERENCE ARCHIVE</p>
      <h1 id="reference-title">硬件资料库</h1>
      <p>按原始目录整理的工程资料索引。浏览专题、搜索文件；已上架的 PDF 可直接在浏览器中打开。</p>
    </div>
    <div class="reference-hero-mark" aria-hidden="true"><span>R</span><i></i><i></i><i></i></div>
  </header>

  <div class="reference-stats" data-reference-stats aria-live="polite">
    <div><strong data-stat-pdfs>—</strong><span>本地 PDF</span></div>
    <div><strong data-stat-folders>—</strong><span>资料目录</span></div>
    <div><strong data-stat-size>—</strong><span>PDF 体量</span></div>
    <div class="reference-cloud-status"><span class="reference-status-dot"></span><span data-cloud-status>云端链接待接入</span></div>
  </div>

  <div class="reference-browser">
    <aside class="reference-sidebar" aria-label="资料目录">
      <div class="reference-sidebar-heading"><span>目录</span><button type="button" data-clear-category>全部资料</button></div>
      <nav class="reference-category-list" data-category-list aria-label="按资料目录筛选"></nav>
    </aside>

    <div class="reference-main">
      <div class="reference-toolbar">
        <label class="reference-search">
          <span class="sr-only">搜索资料名称或目录</span>
          <span class="reference-search-icon" aria-hidden="true">⌕</span>
          <input type="search" data-reference-search placeholder="搜索元器件、专题或文件名…" autocomplete="off">
          <kbd>/</kbd>
        </label>
        <label class="reference-sort-label"><span class="sr-only">排序方式</span>
          <select data-reference-sort aria-label="资料排序">
            <option value="name">按名称</option>
            <option value="size-desc">体积由大到小</option>
            <option value="folder">按目录</option>
          </select>
        </label>
      </div>
      <div class="reference-context">
        <div><p class="reference-overline">DOCUMENT INDEX</p><h2 data-current-category>全部资料</h2></div>
        <span data-result-count>正在读取本地目录索引…</span>
      </div>
      <div class="reference-subfolders" data-subfolders aria-label="当前目录的子目录"></div>
      <div class="reference-results" data-reference-results aria-live="polite" aria-busy="true"></div>
      <div class="reference-pagination" data-reference-pagination></div>
      <p class="reference-empty" data-reference-error hidden>目录索引暂时无法读取，请稍后刷新页面。</p>
    </div>
  </div>

  <dialog class="reference-reader" data-reference-reader aria-labelledby="reference-reader-title">
    <div class="reference-reader-shell">
      <header class="reference-reader-header">
        <div class="reference-reader-heading">
          <p>PDF READER</p>
          <h2 id="reference-reader-title" data-reader-title>在线阅读</h2>
        </div>
        <div class="reference-reader-actions">
          <button type="button" data-reader-toc-toggle aria-label="显示文档目录" aria-controls="reference-reader-toc" aria-expanded="false">目录</button>
          <button type="button" data-reader-close aria-label="关闭阅读器">×</button>
        </div>
      </header>
      <div class="pdf-toolbar" role="group" aria-label="PDF 阅读操作">
        <div class="pdf-page-controls">
          <label>第 <input type="number" data-reader-number aria-label="页码" min="1" value="1" inputmode="numeric" disabled> / <span data-reader-total>—</span> 页</label>
          <button type="button" data-reader-jump disabled>跳转</button>
        </div>
        <label class="pdf-zoom-label"><span>缩放</span><select data-reader-zoom aria-label="PDF 缩放" disabled>
          <option value="fit">适合宽度</option>
          <option value="0.75">75%</option>
          <option value="1">100%</option>
          <option value="1.25">125%</option>
          <option value="1.5">150%</option>
          <option value="2">200%</option>
        </select></label>
        <button type="button" data-reader-rotate aria-label="顺时针旋转页面" disabled>旋转 ↻</button>
      </div>
      <div class="pdf-reader-content">
        <button type="button" class="pdf-toc-backdrop" data-reader-toc-backdrop aria-label="关闭文档目录" hidden></button>
        <aside class="pdf-toc" id="reference-reader-toc" data-reader-toc aria-label="文档目录" hidden>
          <div class="pdf-toc-heading"><strong>文档目录</strong><button type="button" data-reader-toc-close aria-label="收起文档目录">×</button></div>
          <nav data-reader-outline aria-label="PDF 章节目录"><p class="pdf-toc-empty">打开文档后显示章节。</p></nav>
        </aside>
        <div class="pdf-stage" data-reader-stage tabindex="0" aria-label="PDF 连续阅读区域" aria-busy="false">
          <div class="pdf-notice" data-reader-notice hidden>
            <strong data-reader-error-title>文档暂时无法显示</strong>
            <p data-reader-error></p>
            <button type="button" data-reader-retry>重新加载</button>
          </div>
          <div class="pdf-pages" data-reader-page></div>
        </div>
      </div>
      <div class="pdf-status" data-reader-status role="status" aria-live="polite">上下滑动连续阅读 · 点击目录跳转章节</div>
    </div>
  </dialog>
</section>

{% if site.data.resources.size > 0 %}
<section class="resource-section reference-featured" aria-labelledby="featured-resources-heading">
  <div class="section-heading"><h2 id="featured-resources-heading">精选在线资料</h2><span>{{ site.data.resources.size }} 份</span></div>
      <p class="resource-note">资料通过受保护的阅读接口按需加载；普通用户不会获得原文件下载入口。</p>
  <div class="resource-list">
    {% for resource in site.data.resources %}
      <a class="resource-card" href="{{ resource.file | relative_url }}" data-reader-url="{{ resource.file | relative_url }}" data-reader-name="{{ resource.title | escape }}">
        <span class="resource-level">{{ resource.level }}</span>
        <span class="resource-copy"><strong>{{ resource.title }}</strong><small>{{ resource.description }}</small></span>
        <span class="resource-open" aria-hidden="true">在线阅读 →</span>
      </a>
    {% endfor %}
  </div>
</section>
{% endif %}

<script defer src="{{ '/assets/submission-api.js' | relative_url }}"></script>
<script type="module" src="{{ '/assets/reference-library.js' | relative_url }}?v=folders-1"></script>
