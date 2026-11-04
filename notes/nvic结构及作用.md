---
layout: note
title: "NVIC结构及作用"
category: "嵌入式系统"
level: "核心设计"
order: 16
permalink: /notes/nvic结构及作用/
summary: "NVIC 优先级编码、抢占分组、Pending/Active 状态与 FreeRTOS 中断阈值核对。"
source: "笔记/soft/MCU基础知识/中断/NVIC结构及作用"
---

# NVIC结构及作用

NVIC 按中断使能、挂起状态、优先级和内核屏蔽寄存器决定是否进入异常。它只负责处理器侧仲裁，不能替代外设内部的状态位清除和错误恢复。
<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-026.png' | relative_url }}" alt="附件：Pasted image 20250701233329.png"><figcaption>Pasted image 20250701233329.png</figcaption></figure>

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-027.png' | relative_url }}" alt="附件：Pasted image 20250701233429.png"><figcaption>Pasted image 20250701233429.png</figcaption></figure>

## 逻辑优先级到寄存器编码

NVIC 的优先级字段通常为 8 位宽，但芯片只实现其中最高的若干位。若 __NVIC_PRIO_BITS 为 4，逻辑值 6 编码为 $6\times2^{8-4}=0x60$。CMSIS NVIC_SetPriority 通常代为左移，直接写优先级寄存器时则需要正确编码。写入不存在的低位不会获得额外优先级。

逻辑数值越小，紧迫度越高；FreeRTOS 任务优先级数值方向相反。PRIGROUP 划分抢占优先级与子优先级：只有抢占部分能打断当前 ISR，子优先级仅在多个待处理中断中决定先后。同抢占优先级的 ISR 不能互相嵌套。

## 与内核屏蔽的关系

| 机制 | 影响范围 | 使用边界 |
|---|---|---|
| NVIC IRQ Disable | 特定外设 IRQ 不再进入 | 可能仍积累 Pending，外设标志未必清除 |
| BASEPRI | 屏蔽编码达到阈值的普通异常 | 设置为 0 表示不屏蔽，不能用它屏蔽优先级 0 |
| PRIMASK | 阻止可配置优先级异常激活 | NMI、HardFault 不受其屏蔽 |
| 外设 IE 位 | 阻止该外设源向 NVIC 发请求 | 外设原始事件是否继续记录由手册决定 |

在采用 4 位抢占优先级、syscall 阈值为 5 的项目中，允许使用内核 FromISR API 的普通 IRQ 必须设为逻辑 5–15。若外设优先级未初始化而保留复位值 0，再调用队列 API，可能破坏内核链表；“中断能正常执行”不足以证明优先级合法。

## 配置后怎样证明有效

为每个 IRQ 建立包含“触发源、最小间隔、WCET、逻辑优先级、是否调用内核、共享资源”的表格。运行时读取 AIRCR、IPR、PRIMASK、BASEPRI、ICSR，与编译时常量比对。构造低优先级 ISR 被高优先级事件打断的波形，再交换优先级验证行为改变。

尾链可以减少相邻异常之间重复出栈/入栈开销，晚到中断也可能改变实际进入顺序；两者是性能优化，不能作为应用严格延迟上限的替代。共享 IRQ 中逐项确认所有置位源，并限定循环次数，避免一个持续故障源饿死整个系统。
