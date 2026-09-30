---
layout: default
title: 参考资料
summary: 与笔记主题配套的硬件设计、模拟电路、电源、接口和测试资料。
permalink: /resources/
---

{% assign resource_categories = site.data.resources | map: "category" | uniq %}
<header class="collection-heading">
  <p class="eyebrow">PENGIEE <span class="eyebrow-divider">/</span> 资料库</p>
  <h1>参考资料</h1>
  <p class="collection-description">把原始笔记中的附件和硬件资料按方向、层级整理，作为文章的延伸阅读。</p>
  <div class="collection-meta"><span>{{ site.data.resources.size }} 份在线资料</span><span>{{ resource_categories.size }} 个知识方向</span><span>PDF 可直接打开</span></div>
</header>

<section class="resource-intro" aria-label="资料说明">
  <strong>阅读方式</strong>
  <span>先看对应方向的基础笔记，再按“核心、进阶、实战”层级打开资料。</span>
</section>

{% for category in resource_categories %}
  {% assign category_resources = site.data.resources | where: "category", category %}
  <section class="resource-section" aria-labelledby="resource-{{ forloop.index }}">
    <div class="section-heading">
      <h2 id="resource-{{ forloop.index }}">{{ category }}</h2>
      <span>{{ category_resources.size }} 份</span>
    </div>
    <div class="resource-list">
      {% for resource in category_resources %}
        <a class="resource-card" href="{{ resource.file | relative_url }}" target="_blank" rel="noopener">
          <span class="resource-level">{{ resource.level }}</span>
          <span class="resource-copy"><strong>{{ resource.title }}</strong><small>{{ resource.description }}</small></span>
          <span class="resource-open" aria-hidden="true">打开 PDF ↗</span>
        </a>
      {% endfor %}
    </div>
  </section>
{% endfor %}

<section class="resource-section" aria-labelledby="attachments-heading">
  <div class="section-heading"><h2 id="attachments-heading">笔记附件</h2><span>已恢复正文引用</span></div>
  <p class="resource-note">文章中的图片和原始 PDF 附件已经随页面发布，并会在对应笔记正文中显示或提供下载链接。</p>
</section>
