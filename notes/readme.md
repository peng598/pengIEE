---
layout: note
title: "Mini Balance Car 嵌入式与控制教程"
category: "嵌入式系统"
level: "进阶"
order: 15
permalink: /notes/readme/
summary: "这是一个可以直接用 Obsidian 打开的教程库，内容围绕当前 AT32F413 双轮平衡车工程展开。"
source: "soft/MCU基础知识/README"
---

# Mini Balance Car 嵌入式与控制教程

这是一个可以直接用 Obsidian 打开的教程库，内容围绕当前 AT32F413 双轮平衡车工程展开。

## 打开方式

1. 启动 Obsidian。
2. 选择“打开本地仓库”。
3. 选择目录 `Docs/BalanceCar_Obsidian_Vault`。
4. 从 [00-教程总览]({{ '/notes/learning-roadmap/' | relative_url }}) 开始阅读。
> **重点：> 教程中的示例用于理解原理。修改电机、PWM、ADC或保护逻辑后，上板前必须架空车轮并关闭功率输出。**
## 教程特点

- 每一章先解释基础概念，再解释参数含义。
- 每一章提供小型例程，而不是只给定义。
- 每一章标出当前项目中的对应源码。
- 每一章末尾有检查清单和练习题。
- 不依赖 Dataview 等第三方插件。

## 快速导航

- [01-C语言与嵌入式内存]({{ '/notes/c-language-memory/' | relative_url }})
- [02-Cortex-M4与中断系统]({{ '/notes/cortex-m4-interrupts/' | relative_url }})
- [03-AT32外设驱动基础]({{ '/notes/at32-peripherals/' | relative_url }})
- [04-FreeRTOS实时系统]({{ '/notes/freertos-realtime/' | relative_url }})
- [05-实时并发与数据安全]({{ '/notes/realtime-concurrency/' | relative_url }})
- [06-PID与数字控制]({{ '/notes/pid-digital-control/' | relative_url }})
- [07-FOC无刷电机控制]({{ '/notes/foc-motor-control/' | relative_url }})
- [08-平衡车姿态与串级控制]({{ '/notes/balance-car-cascade-control/' | relative_url }})
- [09-传感器与数字滤波]({{ '/notes/sensors-digital-filtering/' | relative_url }})
- [10-串口-DMA与BLE协议]({{ '/notes/uart-dma-ble/' | relative_url }})
- [11-调试故障与上板流程]({{ '/notes/debug-and-hardware-bringup/' | relative_url }})
- [12-项目源码导读与练习]({{ '/notes/project-code-reading/' | relative_url }})
- [术语表]({{ '/notes/embedded-glossary/' | relative_url }})
