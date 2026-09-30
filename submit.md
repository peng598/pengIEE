---
layout: default
title: 提交资料
summary: 向 PENGIEE 提交电子、嵌入式与硬件工程资料。
permalink: /submit/
---

<article class="submit-page">
  <header class="submit-heading">
    <p class="eyebrow">PENGIEE <span class="eyebrow-divider">/</span> 社区协作</p>
    <h1>提交一份资料</h1>
    <p>把你认为值得整理的笔记、数据手册、应用笔记或工程经验提交到资料库。</p>
  </header>

  <div class="submit-intro">
    <strong>提交方式</strong>
    <span>填写信息后会打开一个 GitHub Issue 草稿。请在草稿中再次拖入文件并提交，管理员审核后才会合并到网站。</span>
  </div>

  <form class="submit-form" data-submit-form>
    <label class="submit-field">
      <span>资料标题 <b aria-hidden="true">*</b></span>
      <input name="title" type="text" maxlength="120" required placeholder="例如：USB 2.0 高速信号完整性设计指南">
    </label>

    <div class="submit-field-grid">
      <label class="submit-field">
        <span>知识方向 <b aria-hidden="true">*</b></span>
        <select name="category" required>
          <option value="">请选择方向</option>
          <option>嵌入式系统</option>
          <option>实时系统与软件</option>
          <option>硬件基础与电源</option>
          <option>PCB 与信号完整性</option>
          <option>模拟、音频与声学</option>
          <option>测试与工程经验</option>
          <option>其他</option>
        </select>
      </label>
      <label class="submit-field">
        <span>学习层级 <b aria-hidden="true">*</b></span>
        <select name="level" required>
          <option value="">请选择层级</option>
          <option>基础</option>
          <option>核心设计</option>
          <option>工程实战</option>
        </select>
      </label>
    </div>

    <label class="submit-field">
      <span>资料简介 <b aria-hidden="true">*</b></span>
      <textarea name="description" rows="5" maxlength="1000" required placeholder="说明资料解决什么问题、适合谁阅读，以及与现有笔记的关联。"></textarea>
    </label>

    <label class="submit-field">
      <span>来源与授权说明 <b aria-hidden="true">*</b></span>
      <textarea name="source" rows="3" maxlength="600" required placeholder="例如：本人原创；或来自 TI 官方网站并允许公开分享的链接。请不要提交来源不明或明确禁止再分发的资料。"></textarea>
    </label>

    <label class="submit-field">
      <span>选择文件</span>
      <input name="file" type="file" accept=".pdf,.md,.txt,.zip,.png,.jpg,.jpeg,.webp,.gif">
      <small class="submit-help" data-file-name>未选择文件。打开 GitHub 草稿后，需要再次拖入文件。</small>
    </label>

    <div class="submit-actions">
      <button class="submit-button" type="submit">生成 GitHub 提交草稿 <span aria-hidden="true">↗</span></button>
      <span class="submit-status" data-submit-status aria-live="polite"></span>
    </div>
  </form>

  <section class="submit-steps" aria-labelledby="submit-steps-heading">
    <div class="section-heading"><h2 id="submit-steps-heading">提交流程</h2><span>三步完成</span></div>
    <ol>
      <li><strong>填写资料信息</strong><span>标题、分类和简介会自动带入 GitHub 草稿。</span></li>
      <li><strong>附加文件</strong><span>在 Issue 编辑器中拖入 PDF、图片或 Markdown 文件。</span></li>
      <li><strong>等待审核</strong><span>维护者会检查内容、版权和分类，再整理进网站。</span></li>
    </ol>
  </section>
</article>
<script defer src="{{ '/assets/submit-form.js' | relative_url }}"></script>
