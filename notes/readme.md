---
layout: note
title: "Mini Balance Car 控制系统技术索引"
category: "嵌入式系统"
level: "核心设计"
order: 15
permalink: /notes/readme/
summary: "AT32F413 平衡车的固件架构、实时约束、信号链路与工程验证入口。"
source: "soft/MCU基础知识/README"
---

# Mini Balance Car 控制系统技术索引

这是一个可以直接用 Obsidian 打开的教程库，内容围绕当前 AT32F413 双轮平衡车工程展开。

## 打开方式

1. 启动 Obsidian。
2. 选择“打开本地仓库”。
3. 选择目录 `Docs/BalanceCar_Obsidian_Vault`。
4. 从 [系统工程总览]({{ '/notes/learning-roadmap/' | relative_url }}) 开始阅读。
> **重点：** 文中示例用于说明模型与实现。修改电机、PWM、ADC或保护逻辑后，上板前必须架空车轮并关闭功率输出。
## 工程使用方式

文档以原 AT32F413 双轮平衡车工程为案例，覆盖传感器到 PWM 的完整链路。既有代码、参数与构建数据是源笔记中的快照；本次补充提供模型、计算和验证方法，不能视为对当前硬件的重新实测。

| 工程问题 | 优先阅读 | 需要形成的输出 |
|---|---|---|
| 控制超期或偶发卡死 | Cortex-M、FreeRTOS、实时并发 | 最长响应、屏蔽时间与共享数据所有权 |
| 电流大而转矩小 | FOC、传感器、PID | 电角度、采样比例和限幅状态记录 |
| 平衡振荡或缓慢漂移 | 姿态串级、数字滤波 | 对象模型、延迟预算、扰动响应 |
| 断线/短包导致目标跳变 | UART/DMA/BLE | 字节流测试向量、命令新鲜度与故障策略 |
| 移植后启动失败 | C 内存、外设、调试 | 构建清单、向量表、MAP 与故障帧 |

参数修改先追踪量纲和依赖：改变采样周期会影响离散积分、微分、滤波、超时和最坏执行预算；更换传感器或电机则需要重新验证符号、比例与模型。通过阈值由系统需求确定，并保留异常工况和恢复路径的原始波形。

## 快速导航

- [01-C语言与嵌入式内存]({{ '/notes/c-language-memory/' | relative_url }})
- [02-Cortex-M4与中断系统]({{ '/notes/cortex-m4-interrupts/' | relative_url }})
- [03-AT32外设驱动与时序设计]({{ '/notes/at32-peripherals/' | relative_url }})
- [04-FreeRTOS实时系统]({{ '/notes/freertos-realtime/' | relative_url }})
- [05-实时并发与数据安全]({{ '/notes/realtime-concurrency/' | relative_url }})
- [06-PID与数字控制]({{ '/notes/pid-digital-control/' | relative_url }})
- [07-FOC无刷电机控制]({{ '/notes/foc-motor-control/' | relative_url }})
- [08-平衡车姿态与串级控制]({{ '/notes/balance-car-cascade-control/' | relative_url }})
- [09-传感器与数字滤波]({{ '/notes/sensors-digital-filtering/' | relative_url }})
- [10-串口-DMA与BLE协议]({{ '/notes/uart-dma-ble/' | relative_url }})
- [11-调试故障与上板流程]({{ '/notes/debug-and-hardware-bringup/' | relative_url }})
- [12-项目固件架构与验证]({{ '/notes/project-code-reading/' | relative_url }})
- [术语表]({{ '/notes/embedded-glossary/' | relative_url }})
