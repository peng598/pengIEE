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

## AI 学习助手

网站已加入 AI 学习助手入口。它会把当前文章的标题、分类和正文摘录发送到你配置的服务端接口，用于围绕当前笔记提问。

GitHub Pages 是静态托管，不能安全保存 DeepSeek API Key。因此请使用服务端代理，仓库中提供了可直接部署的 Cloudflare Worker 示例：[`serverless/cloudflare-worker.js`](serverless/cloudflare-worker.js)。在 Worker 中配置以下环境变量：

```text
DEEPSEEK_API_KEY=只放在服务端的密钥
DEEPSEEK_MODEL=接口实际接受的模型 ID
DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions
ALLOWED_ORIGIN=https://peng598.github.io
```

`DeepSeek V4-FLASH` 可能是产品展示名称，实际 API 的 `model` 字段需要以你购买的服务商文档为准。确认 Worker 地址后，把 `_config.yml` 中的 `ai_endpoint` 改为该地址，再推送一次网站即可：

```yaml
ai_endpoint: "https://你的-worker.example.workers.dev"
ai_model: "接口实际模型 ID"
```

Worker 会校验 `Origin`、限制请求体大小，并只转发最近的对话消息。正式使用时还应在 Cloudflare 控制台为 Worker 配置访问频率限制或登录鉴权，避免公开接口被滥用。

不要把真实 API Key 写入仓库、网页源码或聊天消息。当前未配置 `ai_endpoint` 时，网站会保留助手界面，但会提示先完成代理配置。
