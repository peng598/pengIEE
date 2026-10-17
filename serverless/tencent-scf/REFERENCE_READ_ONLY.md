# 无数据库的私有 COS 在线阅读

该模式只为公开索引中的 PDF 提供匿名分段阅读，不提供网站账号或管理员下载接口。管理员使用腾讯云 COS 控制台登录后下载原文件。`SUBMISSIONS_ENABLED` 保持关闭，不需要购买 MySQL。

1. 保持桶 `pengiee-1502711662` 为私有读写，并将已发布的每个 PDF 对象 ACL 设为私有。仅修改顶层目录标记不够；上线前应对整个索引做匿名 HEAD 抽查或全量验证，期望全部返回 403。
2. 给 SCF 函数绑定专用执行角色。角色只需对该桶允许 `name/cos:GetBucketACL`、`name/cos:GetBucketPolicy`，对该桶已发布的 PDF 前缀允许 `name/cos:GetObject`、`name/cos:HeadObject`。不要授予写入、删除、公开读或整个账户的 COS 管理权限。SCF 使用角色自动注入的临时凭据，不在网站或函数环境变量中保存长期 SecretId/SecretKey。
3. 用 `python serverless/tencent-scf/package.py` 生成并上传 `tmp/pengiee-tencent-scf.zip` 到现有 Node.js 20 Web 函数。保持 `scf_bootstrap`、端口 9000 与原有 AI 环境变量。
4. 新增环境变量：`REFERENCE_READ_ENABLED=true`、`COS_BUCKET=pengiee-1502711662`、`COS_REGION=ap-guangzhou`、`ALLOWED_ORIGINS=https://peng598.github.io`。不必启用 `SUBMISSIONS_ENABLED` 或配置数据库。
5. `GET /api/reference/health` 应返回 `200 {"status":"ready"}`；匿名浏览器发起 `GET /api/reference/{id}/read`（带网站 Origin、Range）应返回 206、`application/pdf`、`Content-Disposition: inline`。匿名访问 COS 原地址应返回 403；`/api/admin/reference/{id}/download` 不应对访客开放。

网页使用 PDF.js 按需读取固定 256 KiB 分段，不提供下载按钮。浏览器获得了可显示的内容，用户仍可通过开发者工具、截图或逐段保存重建 PDF；这不是 DRM。该方案保护 COS 原文件直链并限制网站的下载功能，不能保证可阅读内容无法被另存。
