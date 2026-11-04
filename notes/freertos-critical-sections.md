---
layout: note
title: "进出临界区"
category: "实时系统与软件"
level: "核心设计"
order: 3
permalink: /notes/freertos-critical-sections/
summary: "Cortex-M4F 的 BASEPRI 屏蔽边界、临界区嵌套、ISR API 与延迟预算。"
source: "soft/FreeRTOS/进出临界区"
---

# 进出临界区

临界区保护的是一组共享状态的不变量，保护范围由端口的中断屏蔽机制决定。本文限定单核 Cortex-M4F 与 FreeRTOS ARM_CM4F 端口；更高紧迫度的中断、NMI 和 DMA 仍可能活动，因此进入临界区不等于整个系统停止并发。

## 屏蔽阈值与参与者

本工程若实现 4 个 NVIC 优先级位、全部用于抢占优先级，且库级系统调用阈值为 5，则 BASEPRI 使用的编码通常为 $5\ll(8-4)=0x50$。逻辑优先级 5–15 的中断会被屏蔽；0–4 仍可执行，且不得调用会访问内核状态的 FromISR API。CMSIS 的 NVIC_SetPriority 接收未左移逻辑值，FreeRTOS 的 configMAX_SYSCALL_INTERRUPT_PRIORITY 通常使用已左移编码，两者不能混填。

| 数据的读写者 | 合适保护方式 | 约束 |
|---|---|---|
| 两个普通任务 | Mutex 或短任务临界区 | Mutex 可阻塞，临界区不能阻塞 |
| 任务与符合阈值的 ISR | 任务临界区与相应 ISR 临界区 | 共享访问必须全部遵守协议 |
| 任务与优先级 0 的 ADC ISR | 极短 PRIMASK 保护或证明有效的数据发布协议 | BASEPRI 不能覆盖此 ISR |
| CPU 与 DMA | 缓冲区所有权、DMA 停止/完成握手 | 关中断不停止 DMA 写内存 |

## 任务与 ISR 的进入、退出

~~~c
/* 任务上下文：嵌套次数由端口管理。 */
taskENTER_CRITICAL();
shared_state.sequence++;
shared_state.value = new_value;
taskEXIT_CRITICAL();

/* ISR 上下文：保存并恢复进入前的屏蔽状态。 */
UBaseType_t saved = taskENTER_CRITICAL_FROM_ISR();
shared_counter++;
taskEXIT_CRITICAL_FROM_ISR(saved);
~~~

ISR 宏名称及支持情况应以所用 FreeRTOS 版本和端口为准。不得从同一临界区中途 return 而跳过退出，也不能用无条件开中断替代“恢复原屏蔽状态”。互斥量、延时、等待 DMA、等待串口以及可能阻塞的库调用均不应放入临界区。

## 把互斥时间计入实时预算

若控制中断周期为 $T=50\,\mu s$，进入后的最坏执行时间为 $C=18\,\mu s$，其硬件事件到结束的截止时间为 $D=35\,\mu s$，则所有阻塞与更高优先级干扰的总预算最多为 $D-C=17\,\mu s$。一个 $20\,\mu s$ 的全局关中断段即使 CPU 平均占用很低，也已破坏此截止时间。

调试时用 GPIO 分别标记临界区与 ADC ISR，测量最长屏蔽时间、最坏事件到 ISR 延迟和控制更新时刻；DWT 测出的代码耗时需要注明是否包含抢占。验收同时覆盖嵌套调用、错误返回、持续串口中断和 DMA 满负载，不能只测空载平均值。

相关机制：[列表和列表项]({{ '/notes/列表和列表项/' | relative_url }})、[实时并发与数据安全]({{ '/notes/realtime-concurrency/' | relative_url }})。
