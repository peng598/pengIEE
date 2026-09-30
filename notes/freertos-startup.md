---
layout: note
title: "系统启动流程及任务相关函数"
category: "实时系统与软件"
level: "实战"
order: 4
permalink: /notes/freertos-startup/
summary: "vTaskStartScheduler 与任务调度器启动流程。"
source: "soft/FreeRTOS/系统启动流程及任务相关函数"
---

# 系统启动流程及任务相关函数

函数 vTaskStartScheduler()用于启动任务调度器，任务调度器启动后，FreeRTOS 便会开始

进行任务调度，除非调用函数 xTaskEndScheduler()停止任务调度器，否则不会再返回
