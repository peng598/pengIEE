# PENGIEE

个人嵌入式与电子技术笔记，内容来自 Obsidian 笔记的整理版。目前整理了 156 篇公开页面，按基础、核心、进阶、实战四个层级分为嵌入式系统、实时系统与软件、硬件基础与电源、PCB 与信号完整性、模拟/音频与声学、测试与工程经验六个方向。笔记中实际引用的图片和 PDF 附件已恢复，另整理了 19 份硬件参考资料放在[资料库](https://peng598.github.io/pengIEE/resources/)中。面试/求职相关内容、空白笔记、Obsidian 配置和企业自查资料未发布。

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
