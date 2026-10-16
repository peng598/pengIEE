# PENGIEE

个人嵌入式与电子技术笔记，内容来自 Obsidian 笔记的整理版。目前整理了 156 篇公开页面，网站按“一级主题 → 二级专题 → 三级内容”整理硬件文档目录，并分为嵌入式系统、实时系统与软件、硬件基础与电源、PCB 与信号完整性、模拟/音频与声学、测试与工程经验六个笔记方向。笔记中实际引用的图片和 PDF 附件已恢复，另整理了 19 份硬件参考资料放在[资料库](https://peng598.github.io/pengIEE/resources/)中。面试/求职相关内容、空白笔记、Obsidian 配置和企业自查资料未发布。

网站：<https://peng598.github.io/pengIEE/>

资料库：<https://peng598.github.io/pengIEE/resources/>

## 安卓使用

网站已配置为可安装的 PWA。用 Android Chrome 打开网站后，在地址栏或浏览器菜单中选择“安装应用”或“添加到主屏幕”，桌面会出现 PENGIEE 图标。之后直接点击图标即可在独立窗口中访问网站；首次打开后，已访问过的页面外壳也可在网络不稳定时加载。

## 本地预览

这是一个 GitHub Pages / Jekyll 网站。安装 Ruby 和 Bundler 后运行：

```sh
bundle exec jekyll serve
```

首次发布前，在仓库的 **Settings → Pages → Build and deployment** 中把来源设为 **GitHub Actions**。之后每次推送到 `main`，Actions 会自动构建并部署网站。

## AI 笔记助手

网站已加入 AI 笔记助手入口。它会把当前文章的标题、分类和正文摘录发送到你配置的服务端接口，用于围绕当前笔记提问。

GitHub Pages 是静态托管，不能安全保存 DeepSeek API Key。仓库已提供腾讯云云函数（SCF）代理，部署配置完成后网站即可通过它调用 DeepSeek。源码与[完整部署说明](serverless/tencent-scf/README.md)在 `serverless/tencent-scf`；接口使用腾讯云 Web 函数，Node.js 20，监听 9000 端口。

在腾讯云函数的“函数配置 → 环境变量”中配置以下变量。`DEEPSEEK_API_KEY` 只在腾讯云控制台填写，不要写入仓库、网页源码或聊天消息：

```text
DEEPSEEK_API_KEY=只放在腾讯云服务端的密钥
DEEPSEEK_MODEL=接口实际接受的模型 ID
DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions
ALLOWED_ORIGINS=https://peng598.github.io
UPSTREAM_TIMEOUT_MS=50000
MAX_OUTPUT_TOKENS=2048
MAX_CONCURRENT_REQUESTS=2
```

`DeepSeek V4-FLASH` 可能是产品展示名称，实际 API 的 `model` 字段需要以你购买的服务商文档为准。后端会忽略网页传来的模型值，只使用腾讯云环境变量中的 `DEEPSEEK_MODEL`。

部署步骤：

1. 登录腾讯云控制台，进入 **云函数 → 函数服务 → 新建**，选择 **Web 函数 / Node.js 20**。
2. 运行 `python serverless/tencent-scf/package.py` 生成 `tmp/pengiee-tencent-scf.zip`，再上传 ZIP。压缩包已设置启动文件 `scf_bootstrap` 的执行权限，端口为 9000。
3. 在 **函数配置 → 环境变量** 中填写上面的变量。`DEEPSEEK_API_KEY` 只在此处填写。
4. 函数执行超时设为 70 秒，允许访问公网，配置“函数 URL”触发器。先访问 HTTPS 地址的 `/health`，再按部署说明测试真实问答。`ready` 只代表配置格式通过，不代表密钥和模型已验证。
5. 把腾讯云函数的 HTTPS 访问地址填入 `_config.yml` 的 `ai_endpoint`，再推送网站：

```yaml
ai_endpoint: "https://你的腾讯云函数访问地址"
ai_model: "网页显示的模型名称"
```

代理会校验网站来源、限制请求体和并发、设置上游超时，并只返回模型回答。CORS 不是身份验证；正式使用时仍应在腾讯云配置调用频率、费用告警或更严格的访问控制，避免公开接口被滥用。腾讯云函数按调用次数、资源使用量和外网出流量计费，具体以控制台为准。

不要把真实 API Key 写入仓库、网页源码或聊天消息。当前未配置 `ai_endpoint` 时，网站会保留助手界面，但不会发起请求。

腾讯云官方文档：[`Web 函数相关问题`](https://cloud.tencent.com/document/product/583/56129)、[`Node.js 部署方法`](https://cloud.tencent.com/document/product/583/67791)、[`环境变量`](https://cloud.tencent.com/document/product/583/30228)。

## 私密账号与资料提交

账号与上传功能现已实现腾讯云版本：SCF + MySQL 8 + COS 私有桶。包含邮箱账号注册、登录、服务端会话注销、密码修改、私密上传，以及管理员分页查阅和下载。参考资料也通过 SCF 从私有 COS 分段读取，普通用户只能在线阅读，管理员才有原文件下载接口。所有注册默认普通用户，管理员只能在数据库后台按核实的账号 ID 指定；没有自动公开发布功能。

详见 [腾讯云私密资料部署说明](serverless/tencent-scf/PRIVATE_UPLOADS.md)。尚未配置云端数据库和存储时，页面会禁用注册/上传并提示待开通。`submission_endpoint` 必须在云端验收后单独填写，不能仅凭现有 AI 可用就认为注册上传也已可用。

部署包现在包含运行依赖，打包前先安装：

```powershell
pnpm --dir serverless/tencent-scf install --prod --frozen-lockfile --config.node-linker=hoisted --ignore-scripts
python serverless/tencent-scf/package.py
```

当前单文件最多 4 MiB，每用户默认 100 MiB / 100 份资料。文件和提交记录仅管理员可读取，普通用户只有提交权限。邮箱暂作为登录名，未启用邮件验证或邮件找回密码。旧 Cloudflare 实现留作历史参考，不用于本次部署。
