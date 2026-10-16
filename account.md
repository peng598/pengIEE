---
layout: default
title: 账号登录
summary: 注册或登录 PENGIEE 资料提交账号。
permalink: /account/
---

<article class="submit-page account-page" data-submission-page>
  <header class="submit-heading"><p class="eyebrow">PENGIEE <span class="eyebrow-divider">/</span> 账号</p><h1>注册或登录</h1><p>登录后才能提交资料。上传内容放在私有存储中，普通用户之间互不可见。</p></header>
  <p class="submit-status" data-service-status role="status">账号服务检查中，请启用 JavaScript。</p>
  <noscript><p>请启用 JavaScript 后注册、登录或上传。文件不会通过公开 Issue 提交。</p></noscript>
  <section class="account-panel" data-auth-panel>
    <div class="account-panel-heading"><div><strong data-auth-title>登录</strong><span data-auth-subtitle>使用邮箱和密码登录。</span></div><a href="{{ '/submit/' | relative_url }}">提交资料 →</a></div>
    <form class="auth-form" data-login-form><label class="submit-field"><span>邮箱</span><input name="email" type="email" autocomplete="email" required placeholder="name@example.com"></label><label class="submit-field"><span>密码</span><input name="password" type="password" autocomplete="current-password" minlength="10" maxlength="128" required placeholder="至少 10 位"></label><div class="submit-actions"><button class="submit-button" type="submit">登录</button><button class="text-button" type="button" data-show-register>注册新账号</button><span class="submit-status" data-auth-status aria-live="polite"></span></div></form>
    <form class="auth-form" data-register-form hidden><label class="submit-field"><span>邮箱</span><input name="email" type="email" autocomplete="email" required placeholder="name@example.com"></label><label class="submit-field"><span>密码</span><input name="password" type="password" autocomplete="new-password" minlength="10" maxlength="128" required placeholder="至少 10 位"></label><label class="submit-field"><span>确认密码</span><input name="passwordConfirm" type="password" autocomplete="new-password" minlength="10" maxlength="128" required placeholder="再次输入密码"></label><div class="submit-actions"><button class="submit-button" type="submit">创建账号</button><button class="text-button" type="button" data-show-login>返回登录</button><span class="submit-status" data-auth-status aria-live="polite"></span></div></form>
    <div class="account-logged-in" data-logged-in hidden><span>已登录：<strong data-user-email></strong></span><a class="text-button" href="{{ '/admin/' | relative_url }}" data-admin-link hidden>管理提交</a><button class="text-button" type="button" data-logout>退出登录</button></div>
  </section>
  <form class="auth-form account-panel" data-password-form hidden>
    <h2>修改密码</h2>
    <label class="submit-field"><span>当前密码</span><input name="current_password" type="password" minlength="10" maxlength="128" autocomplete="current-password" required></label>
    <label class="submit-field"><span>新密码</span><input name="new_password" type="password" minlength="10" maxlength="128" autocomplete="new-password" required></label>
    <label class="submit-field"><span>再次输入新密码</span><input name="confirm_password" type="password" minlength="10" maxlength="128" autocomplete="new-password" required></label>
    <button class="submit-button" type="submit">修改密码并退出所有设备</button>
    <p class="submit-status" data-password-status role="status"></p>
  </form>
  <p class="submit-help">当前使用邮箱作为登录名，尚未启用邮件验证或邮件找回密码。请使用独立密码妥善保存；忘记密码请联系站长。上传的资料不会自动公开发布。</p>
</article>
<script defer src="{{ '/assets/submission-api.js' | relative_url }}"></script>
<script defer src="{{ '/assets/submit-form.js' | relative_url }}"></script>
