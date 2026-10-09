# PENGIEE 腾讯云 AI 代理

这是一个无第三方依赖的腾讯云 SCF Web 函数。它把网站的 OpenAI 兼容聊天请求转发到 DeepSeek，并将 API Key 保留在腾讯云函数环境变量中。

## 控制台部署

1. 新建 **Web 函数**，运行环境选择 **Node.js 20**。
2. 在仓库根目录运行 `python serverless/tencent-scf/package.py`，上传生成的 `tmp/pengiee-tencent-scf.zip`。包中仅含 `server.js` 和 `scf_bootstrap`，没有密钥或依赖。打包器会保留 Linux 执行权限和 LF 换行；不要用 Windows 普通压缩工具重新打包启动文件。
3. 启动文件选择 `scf_bootstrap`；Web 函数端口固定为 9000。
4. 在函数配置的环境变量中填写：

```text
DEEPSEEK_API_KEY=你的密钥
DEEPSEEK_MODEL=供应商文档中的准确模型 ID
DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions
ALLOWED_ORIGINS=https://peng598.github.io
UPSTREAM_TIMEOUT_MS=50000
MAX_OUTPUT_TOKENS=2048
MAX_CONCURRENT_REQUESTS=2
```

`DEEPSEEK_API_URL` 必须是 HTTPS 且不带查询参数。若使用其他 DeepSeek 兼容服务商，只替换完整的聊天接口地址和模型 ID。

前三项是模型配置；后三项超时、输出 token 上限、并发都有上面列出的默认值，可以不填。`ALLOWED_ORIGINS` 默认已经允许 `https://peng598.github.io`，不要加网站路径 `/pengIEE`。如果要本地联调，显式填写 `https://peng598.github.io,http://127.0.0.1:4173`。

5. 函数执行超时设为 **70 秒**（必须大于代理上游超时 50 秒）；内存可从 128 MB 开始，以当前控制台允许的值为准。允许函数访问公网以连接 DeepSeek，不需要 D1、R2 或数据库。不要配置预置并发等持续运行资源。
6. 触发器优先选择 **函数 URL**，复制控制台给出的 HTTPS 访问路径。当前网页不做腾讯云签名认证，公开使用需要可匿名调用的 URL；若账户要求签名，不要在网页中填腾讯云 SecretKey，应先增加登录鉴权方案。代码负责 CORS，不要在网关重复添加 `*` 跨域响应头。
7. 新部署使用函数 URL，不使用已下线的 API 网关触发器。腾讯云控制台公告说明 API 网关触发器已于 2025 年 6 月 30 日下线。函数接收的聊天路径为 `/`、`/chat` 或 `/chat/completions`，健康检查路径为 `/health`。

云函数、外网流量、Web 响应流量及启用的日志服务可能分别产生费用，以控制台账单规则为准。新用户免费试用套餐需要领取，以账户实际显示的有效套餐为准，不能仅凭新注册就假定已获得额度。上线时设置费用告警，并限制函数最大实例数；公开使用应增加入口限流或登录鉴权。代码的并发上限只针对单个实例，CORS 也不等于登录鉴权，不能保证防止他人消耗接口额度。

首次使用时，控制台可能要求在“访问管理”创建 `SCF_QcsRole` 服务角色，关联 `QcloudAccessForScfRole` 预设策略。先核对授权范围并完成账号所有者确认，再继续创建函数；该授权与领取试用套餐、填写 DeepSeek 密钥是不同步骤。

## 验证并接入网站

访问函数 URL 加 `/health`，正确配置时返回 `{"status":"ready"}`，未配置时为 HTTP 503。此检查只验证配置存在、格式有效，**不会请求 DeepSeek，不代表密钥或模型已验证**。

在 PowerShell 中测试一次真实问答（会消耗少量模型额度，不需要在命令中填密钥）：

```powershell
$aiFunctionUrl = '替换为腾讯云函数的完整 HTTPS 访问路径'
$aiBody = @{ messages = @(@{ role = 'user'; content = '请用一句话解释什么是电容。' }) } | ConvertTo-Json -Depth 4
Invoke-RestMethod -Uri $aiFunctionUrl -Method Post -ContentType 'application/json; charset=utf-8' -Headers @{ Origin = 'https://peng598.github.io' } -Body ([System.Text.Encoding]::UTF8.GetBytes($aiBody))
```

返回 `choices[0].message.content` 后，将 `_config.yml` 的 `ai_endpoint` 填为该完整 URL，推送 GitHub 并等待 Pages 部署成功，然后从网页 AI 助手验证跨域请求。`ai_endpoint` 不是 DeepSeek 官方地址，也不是腾讯云控制台网址。网页 `ai_model` 仅作显示，真实模型由后端 `DEEPSEEK_MODEL` 决定。

当前只迁移 AI 代理；Cloudflare 的账号、私密上传接口不在此函数中。仓库和部署包准备好不表示云端已创建函数或网站已接通。

## 本地测试

```powershell
node --test tests/tencent-scf.test.cjs
node serverless/tencent-scf/server.js
```

在仓库根目录执行，使用 Node.js 20 或更高版本。测试模拟上游，不会调用真实的 DeepSeek 接口。直接启动且未配置环境变量时，`http://127.0.0.1:9000/health` 返回 503，这是正常的待配置状态。

启动入口是 `scf_bootstrap`，不是事件函数的 `index.main_handler`。当前入口使用 `/var/lang/node20/bin/node`，因此控制台应选 Node.js 20.19，而非 Node.js 16 或 18。

官方参考：[创建 Web 函数](https://cloud.tencent.com/document/product/583/56125)、[Web 函数与 9000 端口](https://cloud.tencent.com/document/product/583/56129)、[Node.js 运行环境](https://cloud.tencent.com/document/product/583/11060)、[环境变量](https://cloud.tencent.com/document/product/583/30228)。
