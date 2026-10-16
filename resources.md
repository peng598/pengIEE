---
layout: default
title: 参考资料
summary: 按本地硬件文档目录浏览 PDF 资料、搜索文件，并打开已发布到腾讯云 COS 的文档。
permalink: /resources/
---

{% assign resource_categories = site.data.resources | map: "category" | uniq %}
<section class="reference-library" data-reference-library data-catalog-url="{{ '/assets/reference-library.json' | relative_url }}" aria-labelledby="reference-title">
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
      <div class="reference-privacy-note">
        <span class="reference-privacy-icon" aria-hidden="true">↗</span>
        <strong>发布说明</strong>
        <p>按你确认的 01–04 目录整理；文件上传 COS 后才会显示打开链接。付费 VIP 专辑不公开。</p>
      </div>
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
          <a data-reader-open target="_blank" rel="noopener">新标签页打开</a>
          <button type="button" data-reader-close aria-label="关闭阅读器">×</button>
        </div>
      </header>
      <p class="reference-reader-hint">PDF 在网页中加载，不会自动保存到设备；页码、缩放和保存等操作请使用浏览器 PDF 工具栏。</p>
      <div class="reference-reader-frame">
        <iframe data-reader-frame title="PDF 文档阅读器" src="about:blank" loading="lazy" allow="fullscreen"></iframe>
      </div>
    </div>
  </dialog>
</section>

{% if site.data.resources.size > 0 %}
<section class="resource-section reference-featured" aria-labelledby="featured-resources-heading">
  <div class="section-heading"><h2 id="featured-resources-heading">精选在线资料</h2><span>{{ site.data.resources.size }} 份</span></div>
  <p class="resource-note">这些是网站现有的配套资料链接；归档目录内已确认发布的 PDF 通过腾讯云 COS 提供，请遵守原始资料的授权范围。</p>
  <div class="resource-list">
    {% for resource in site.data.resources %}
      <a class="resource-card" href="{{ resource.file | relative_url }}" target="_blank" rel="noopener">
        <span class="resource-level">{{ resource.level }}</span>
        <span class="resource-copy"><strong>{{ resource.title }}</strong><small>{{ resource.description }}</small></span>
        <span class="resource-open" aria-hidden="true">打开 PDF ↗</span>
      </a>
    {% endfor %}
  </div>
</section>
{% endif %}

<script defer src="{{ '/assets/reference-library.js' | relative_url }}"></script>
