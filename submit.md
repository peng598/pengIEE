---
layout: default
title: 提交资料
summary: 登录后向 PENGIEE 提交电子、嵌入式与硬件工程资料。
permalink: /submit/
---

<article class="submit-page" data-submission-page>
  <header class="submit-heading">
    <p class="eyebrow">PENGIEE <span class="eyebrow-divider">/</span> 私密提交</p>
    <h1>提交一份资料</h1>
    <p>注册并登录后上传。资料会进入私有存储，其他用户不能查看，只有维护者可以审核。</p>
  </header>

  <section class="account-panel" data-auth-panel>
    <div class="account-panel-heading"><div><strong data-auth-title>登录后提交</strong><span data-auth-subtitle>已有账号？登录后即可上传资料。</span></div><a href="{{ '/account/' | relative_url }}">账号页面 →</a></div>
    <form class="auth-form" data-login-form>
      <label class="submit-field"><span>邮箱</span><input name="email" type="email" autocomplete="email" required placeholder="name@example.com"></label>
      <label class="submit-field"><span>密码</span><input name="password" type="password" autocomplete="current-password" minlength="8" required placeholder="至少 8 位"></label>
      <div class="submit-actions"><button class="submit-button" type="submit">登录</button><button class="text-button" type="button" data-show-register>注册新账号</button><span class="submit-status" data-auth-status aria-live="polite"></span></div>
    </form>
    <form class="auth-form" data-register-form hidden>
      <label class="submit-field"><span>邮箱</span><input name="email" type="email" autocomplete="email" required placeholder="name@example.com"></label>
      <label class="submit-field"><span>密码</span><input name="password" type="password" autocomplete="new-password" minlength="8" required placeholder="至少 8 位"></label>
      <label class="submit-field"><span>确认密码</span><input name="passwordConfirm" type="password" autocomplete="new-password" minlength="8" required placeholder="再次输入密码"></label>
      <div class="submit-actions"><button class="submit-button" type="submit">创建账号</button><button class="text-button" type="button" data-show-login>返回登录</button><span class="submit-status" data-auth-status aria-live="polite"></span></div>
    </form>
    <div class="account-logged-in" data-logged-in hidden><span>已登录：<strong data-user-email></strong></span><button class="text-button" type="button" data-logout>退出登录</button></div>
  </section>

  <form class="submit-form" data-submit-form hidden>
    <div class="submit-intro"><strong>私有存储</strong><span>文件只对你和维护者可见，不会生成公开 Issue，也不会出现在 GitHub 仓库。</span></div>
    <label class="submit-field"><span>资料标题 <b aria-hidden="true">*</b></span><input name="title" type="text" maxlength="120" required placeholder="例如：USB 2.0 高速信号完整性设计指南"></label>
    <div class="submit-field-grid"><label class="submit-field"><span>知识方向 <b aria-hidden="true">*</b></span><select name="category" required><option value="">请选择方向</option><option>嵌入式系统</option><option>实时系统与软件</option><option>硬件基础与电源</option><option>PCB 与信号完整性</option><option>模拟、音频与声学</option><option>测试与工程经验</option><option>其他</option></select></label><label class="submit-field"><span>学习层级 <b aria-hidden="true">*</b></span><select name="level" required><option value="">请选择层级</option><option>基础</option><option>核心设计</option><option>工程实战</option></select></label></div>
    <label class="submit-field"><span>资料简介 <b aria-hidden="true">*</b></span><textarea name="description" rows="5" maxlength="1000" required placeholder="说明资料解决什么问题、适合谁阅读，以及与现有笔记的关联。"></textarea></label>
    <label class="submit-field"><span>来源与授权说明 <b aria-hidden="true">*</b></span><textarea name="source" rows="3" maxlength="600" required placeholder="说明来源和再分发授权情况。请不要提交密码、密钥或不应公开的项目资料。"></textarea></label>
    <label class="submit-field"><span>选择文件 <b aria-hidden="true">*</b></span><input name="file" type="file" accept=".pdf,.md,.txt,.zip,.png,.jpg,.jpeg,.webp,.gif" required><small class="submit-help" data-file-name>支持 PDF、Markdown、文本、压缩包和常见图片，单文件大小由服务端限制。</small></label>
    <div class="submit-actions"><button class="submit-button" type="submit">私密提交资料 <span aria-hidden="true">↗</span></button><span class="submit-status" data-submit-status aria-live="polite"></span></div>
  </form>

  <section class="submit-steps" aria-labelledby="submit-steps-heading"><div class="section-heading"><h2 id="submit-steps-heading">提交流程</h2><span>登录 → 上传 → 审核</span></div><ol><li><strong>注册并登录</strong><span>账号只用于识别提交者，不会公开显示密码。</span></li><li><strong>上传资料</strong><span>文件和表单内容传到私有后端存储。</span></li><li><strong>等待审核</strong><span>只有维护者能在管理入口查看并下载提交。</span></li></ol></section>
</article>
<script defer src="{{ '/assets/submit-form.js' | relative_url }}"></script>
