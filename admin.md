---
layout: default
title: 提交审核
summary: 管理员查看私密资料提交。
permalink: /admin/
---

<article class="submit-page admin-page" data-admin-page>
  <header class="submit-heading"><p class="eyebrow">PENGIEE <span class="eyebrow-divider">/</span> 管理</p><h1>提交审核</h1><p>此页面不会公开提交文件。只有管理员账号可以读取列表和下载文件。</p></header>
  <div class="account-panel"><div class="account-panel-heading"><div><strong>管理员提交列表</strong><span data-admin-status>正在验证登录状态…</span></div><a href="{{ '/submit/' | relative_url }}">返回提交页 →</a></div><div class="admin-list" data-admin-list></div></div>
</article>
<script defer src="{{ '/assets/admin-submissions.js' | relative_url }}"></script>
