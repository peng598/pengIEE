---
layout: note
title: "USART与UART区别和怎么用"
category: "硬件基础与电源"
level: "进阶"
order: 65
permalink: /notes/usart与uart区别和怎么用/
summary: "USART（即通用同步异步收发器）和 UART（即通用异步收发"
source: "笔记/硬件/疑问/USART与UART区别和怎么用"
---

# USART与UART区别和怎么用

USART（即通用同步异步收发器）和 UART（即通用异步收发

器）。UART 是在 USART 基础上裁剪掉了同步通信功能，只剩下异步通信功能。简单区分同步

和异步就是看通信时需不需要对外提供时钟输出，我们平时用串口通信基本都是异步通信。

并不是USART速度比UART快，需要看外设挂载在哪个时钟源上

疑问点：怎么用，要怎么体现
