# 腾讯云账号、数据库与私密资料提交

本功能与现有 AI 代理共用 SCF Web 函数，也可部署到独立函数。GitHub Pages 只展示界面：

- SCF Node.js 20.19：注册、登录、会话验证、上传、管理员查阅与下载。
- 腾讯云 MySQL 8：账号、会话、限流计数、提交记录。不是 CloudBase 文档数据库。
- COS 标准存储私有桶：文件，路径为随机 ID；文件名不会成为公开地址。

**代码和本地测试完成不代表腾讯云已部署。** `_config.yml` 已指向现有腾讯云函数地址；只有在该函数上传新 ZIP、配置数据库/COS 并通过 `/api/health` 检查后，资料页才会启用在线阅读。参考资料阅读接口和账号、私密提交共用该函数；普通用户可以在线阅读 PDF，只有管理员会话可以下载参考资料原文件。

## 1. 数据库

在现有腾讯云 MySQL 8 实例中创建 `pengiee` 数据库（utf8mb4）；如果还没有实例，先确认实例、COS、云函数及网络的费用再购买。可以使用已有 MySQL，不必为了测试购买新实例。

用迁移账号执行同目录的 `mysql-schema.sql`。它新建四张表，不迁移 Cloudflare 的旧账号，也不兼容旧 D1 建表文件。旧账号需重新注册，旧资料不要直接复制至公开桶。

创建独立的运行账号，只授予这个数据库的 SELECT、INSERT、UPDATE、DELETE；不使用 root，不授予建表、授权或服务器管理权限。SCF 与数据库使用同地域、同 VPC/可连通子网。安全组仅允许函数来源连接 3306，**不要开启 MySQL 公网访问**。

环境变量 `DB_TLS_CA` 可填写腾讯云提供的 CA（换行可写为 `\n`），启用证书校验。没有配置 TLS 时只能使用受控 VPC 私网地址；不要关闭证书验证来解决连接问题。SCF 入 VPC 后，原 AI 访问 DeepSeek 仍需按腾讯云控制台要求配置公网出站路径，可能涉及 NAT 等额外费用。

## 2. COS 私有桶和执行角色

1. 创建同地域的专用标准存储桶，选择**私有读写**，开启控制台可用的“阻止公有访问”能力。
2. 不启用静态网站、公开读、公开写、CDN 公共访问，也不要创建 Allow 桶策略。此实现保守地拒绝任何 Allow 桶策略，权限通过 CAM 执行角色授予。
3. 给 SCF 绑定专用执行角色，只对本桶授予：
   - 桶：`name/cos:GetBucketACL`、`name/cos:GetBucketPolicy`。
   - `private/*` 对象：`name/cos:PutObject`、`name/cos:GetObject`、`name/cos:DeleteObject`；按控制台要求允许写入 private 对象 ACL。权限资源必须限定桶及前缀，不授予整个账户 COS 全权限。
4. SDK 使用 SCF 自动注入的临时角色凭据 `TENCENTCLOUD_SECRETID`、`TENCENTCLOUD_SECRETKEY`、`TENCENTCLOUD_SESSIONTOKEN`，不向浏览器下发腾讯云密钥，也不需要浏览器到 COS 的 CORS 配置。

上传与下载均通过鉴权后的 SCF，不生成公共或长期签名下载 URL。每个对象显式写为 private。已有参考资料请执行仓库中的 `node tools/lock-reference-library.mjs`，将历史公开对象统一改为 private。健康检查读取桶 ACL/策略，发现公开 ACL 或 Allow 策略就拒绝服务；结果最多缓存 30 秒。还应在腾讯云控制台禁止误改公开权限。

## 3. 函数环境变量

保留已有的 AI 变量；新增配置参照 `.env.example`：

| 变量 | 填写内容 |
| --- | --- |
| SUBMISSIONS_ENABLED | `true`，未启用时账号接口返回 503，AI 可独立运行 |
| AUTH_SECRET | 至少 32 字节的随机密钥，仅保存在 SCF 环境变量/密钥管理中 |
| DB_HOST / DB_PORT | MySQL 私网地址 / 3306 |
| DB_NAME / DB_USER / DB_PASSWORD | 数据库及专用运行账号 |
| COS_BUCKET / COS_REGION | 完整桶名（含 APPID）/ 例如 ap-guangzhou |
| ALLOWED_ORIGINS | `https://peng598.github.io`；本地预览地址需显式追加，不含路径 |
| MAX_UPLOAD_BYTES | 默认 4194304，即 4 MiB，上限同样为 4 MiB |
| MAX_USER_STORAGE_BYTES | 默认 104857600，即每账号 100 MiB |
| MAX_USER_FILES | 默认每账号 100 份 |
| SESSION_HOURS | 默认 12 小时，最多 24 小时 |

`AUTH_SECRET` 用于散列会话凭证和限流键，并非腾讯云 SecretKey。更换它会使全部会话失效。密码为带独立随机盐的 scrypt 哈希；数据库不存明文密码或原始会话 token。

为了适配函数请求体/响应体限制，当前转存方案单文件最多 4 MiB；部署网关若有更小上限，应进一步调低。不要直接把上限改为 25 MB；大文件需单独实现带大小策略、唯一对象键、完成校验和清理机制的 COS 直传流程。

## 4. 打包和部署

安装 Node.js 20.19 或以上、pnpm 和 Python，然后在仓库根目录执行：

```powershell
pnpm --dir serverless/tencent-scf install --prod --frozen-lockfile --config.node-linker=hoisted --ignore-scripts
python serverless/tencent-scf/package.py
```

上传 `tmp/pengiee-tencent-scf.zip` 更新 Web 函数。ZIP 含后端源码和固定版本依赖，不含 .env、数据库数据或密钥。启动文件仍为 `scf_bootstrap`，端口 9000。新功能有密码散列和文件缓冲，建议内存从 512 MB 起，根据用量调节；函数超时沿用 70 秒，并配置最大实例数和费用提醒。依赖安全检查：`pnpm --dir serverless/tencent-scf audit --prod`。

网站可匿名调用函数 URL，但账号、上传和管理员接口都在代码内部做鉴权。不要把云账号密钥放到前端以解决函数 URL 鉴权问题。

先访问 `https://函数地址/api/health`：只有数据库表可读、COS 私有权限检查通过才返回 `ready` 和上传上限。这**还不证明写入、下载权限完整**，必须完成下一节验收。原 AI 的 `/health` 仍独立检查 AI 配置。

验收通过后，在 `_config.yml` 设置：

```yaml
submission_endpoint: "https://函数的完整访问地址"
```

可与 `ai_endpoint` 使用同一地址，但不要附加 `/api`，也不要放密钥。推送前再次检查日志和配置中没有秘密。

## 5. 安全指定管理员

所有网页注册一律是普通用户，`ADMIN_EMAIL` 或表单里的 `role` 均不赋予管理员权限。邮箱目前只是登录名，**没有邮件验证和自动找回密码**；不把未验证邮箱当作身份凭证或授权依据。

你先注册自己的账号，再在腾讯云数据库控制台查出账号 ID。确认这是你亲自注册的账号（不是他人抢注）后，由数据库管理员按确切 UUID 提升权限：

```sql
SELECT id, email, role, created_at FROM users WHERE email = '你的登录邮箱';
-- 核对 ID 后执行，禁止直接按未验证邮箱自动授予权限
UPDATE users SET role = 'admin' WHERE id = '你核对后的账号UUID';
```

重新进入账号页，会出现“管理提交”入口。管理员页 `/admin/` 的每个请求都会重新从数据库检查角色；改回 user 或 disabled=TRUE 即撤销管理访问。下载强制为附件，不在网站中执行上传的 HTML/脚本。标记“已查阅”不等于发布，也不会改变私有权限。

## 6. 云端验收清单

- 未登录 POST 上传得到 401；注册、重复注册、错误密码和正常登录行为符合预期。
- 普通账号 A 上传一个非敏感测试文本。A、B 均不能访问管理员列表、下载和查阅接口（403），不能通过猜测对象路径读取 COS。
- 你的管理员账号能看到同一条测试记录并下载原文，来源说明和分类显示正确。
- 退出后重放旧 token 得到 401；修改密码后其他设备的旧会话同样失效。
- 上传空文件、伪造扩展名、超大文件被拒绝；超过个人额度和频率得到明确提示。
- COS 匿名 GET 不能读文件。不要只验证管理按钮是否隐藏，也不要在公开聊天粘贴 token。
- 保持 COS 私有，定期备份 MySQL/COS；尚未接病毒扫描，管理员下载后应在隔离环境扫描，不直接执行压缩包里的程序。

本地自动测试使用内存数据库/存储替身，另外检查数据库适配器事务和 SDK 参数；不会创建或改动真实腾讯云资源：

```powershell
node --test tests/tencent-scf.test.cjs tests/tencent-submissions.test.cjs tests/tencent-store.test.cjs
```

## 7. 维护

- 固定窗口限流在 MySQL 中跨实例生效：单邮箱 10 次/15 分钟，全部注册 20 次/小时，认证接口 120 次/分钟，单用户上传 5 次/分钟；单实例最多 3 个账号/文件请求。上线人数增加时需按实际用量调整并配合腾讯云入口防护，不把 CORS 当作安全边界。
- 定期用数据库维护账号清理过期记录，避免表持续增长（可先 SELECT 同条件确认）：

```sql
DELETE FROM sessions WHERE expires_at < UNIX_TIMESTAMP() * 1000;
DELETE FROM rate_limits WHERE expires_at < UNIX_TIMESTAMP() * 1000;
```

- 函数被强制终止，或 COS 清理失败时，会保留 `status='uploading'` 的占额记录。检查一天前的 uploading 记录并核对 COS：确认不再上传后，先删除对应对象，再删那一条记录；不要先删除记录失去追踪。
- 忘记密码目前由站长线下核验身份后处理，不能因对方知道邮箱就授权。无需明文查看密码，也不要让用户发密码给你。
- `serverless/cloudflare-worker.js`、旧 `schema.sql` 是历史实现，不用于这次部署。
