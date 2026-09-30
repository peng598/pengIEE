---
layout: note
title: "TSPI Cast 使用说明"
category: "嵌入式系统"
level: "工程实战"
order: 17
permalink: /notes/tspi-cast-使用说明/
summary: "TSPI Cast 用于把 Android 手机画面通过手机热点投到立创泰山派 RK3566 的 HDMI 显示器。"
source: "soft/MCU基础知识/TSPI-Cast-使用说明"
---

# TSPI Cast 使用说明

TSPI Cast 用于把 Android 手机画面通过手机热点投到立创泰山派 RK3566 的 HDMI 显示器。

## 已完成

- 手机端系统录屏授权
- H.264 硬件编码，最高长边 1280 像素、30 FPS
- 手机热点局域网传输
- 自动发现泰山派接收端
- 手动输入板卡 IP 作为备用方式
- 泰山派 H.264 硬件解码和全屏显示
- 断线后自动回到等待状态

## 使用步骤

1. 在 Android 手机上安装 `TSPI-Cast-Sender-Android.apk`。
2. 打开手机热点。
3. 泰山派接收端已安装并运行；点击屏幕上的 `WI-FI SETTINGS`，连接手机热点。
4. 接收端会显示泰山派在热点中的 IP 地址。
5. 打开手机上的 `TSPI Cast Sender`，点击 `FIND RECEIVER`。
6. 如果自动发现失败，在输入框中填写接收端显示的 IP 地址。
7. 点击 `START CASTING`，在 Android 系统弹窗中允许录制屏幕。
8. 点击手机 App 中的 `STOP`，或通过通知栏停止投屏。

## 网络端口

- `53516/TCP`：H.264 视频流
- `53517/UDP`：接收端自动发现

所有数据只在手机热点局域网内传输，不需要互联网。

## 第一版限制

- 只支持 Android 手机发送端。
- 当前只传输画面，不传输声音。
- 手机旋转屏幕后，建议停止并重新开始投屏。
- 当前没有连接密码，仅建议在个人热点中使用。
