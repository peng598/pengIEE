---
layout: note
title: "进出临界区"
category: "实时系统与软件"
order: 3
permalink: /notes/freertos-critical-sections/
summary: "任务与中断上下文进入、退出临界区的原则。"
source: "soft/FreeRTOS/进出临界区.md"
---

# 进出临界区

临界区是指那些必须完整运行的区域，在临界区中的代码必须完整运行，不能被打断。例

如一些使用软件模拟的通信协议，通信协议在通信时，必须严格按照通信协议的时序进行，不

能被打断。FreeRTOS 在进出临界区的时候，通过关闭和打开受 FreeRTOS 管理的中断，以保护

临界区中的代码。FreeRTOS 的源码中就包含了许多临界区的代码，这部分代码都是用临界区进

行保护，用户在使用 FreeRTOS 编写应用程序的时候，也要注意一些不能被打断的操作，并为

这部分代码加上临界区进行保护。

taskENTER_CRITICAL() 、 taskENTER_CRITICAL_FROM_ISR() 、 taskEXIT_CRITICAL() 、

taskEXIT_CRITICAL_FROM_ISR(x)，这四个宏定义分别用于在中断和非中断中进出临界区

[列表和列表项]()
