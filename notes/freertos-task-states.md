---
layout: note
title: "FreeRTOS 任务状态"
category: "实时系统与软件"
level: "核心设计"
order: 1
permalink: /notes/freertos-task-states/
summary: "运行、就绪、阻塞和挂起四种任务状态。"
source: "soft/FreeRTOS/FreeRTOS 任务状态"
---

# FreeRTOS 任务状态

单核 FreeRTOS 中，同一时刻最多一个任务处于 Running；中断运行时，调度器仍有当前任务，但 CPU 正在异常上下文执行。Ready、Blocked 和 Suspended 描述任务为何暂时没有执行资格或没有获得 CPU。诊断 API 还可能报告 Deleted 等状态，不能把“四种主要状态”当成 API 枚举全集。

| 状态 | 离开此状态的条件 | 调试时应检查 |
|---|---|---|
| Running | 抢占、阻塞、让出、挂起或删除 | 当前 PC、任务优先级、持锁情况 |
| Ready | 调度器选择该任务 | 是否有更高优先级任务持续就绪 |
| Blocked | 等待事件发生或有限超时到期 | 等待对象、事件生产者、剩余超时 |
| Suspended | 显式恢复；部分无限等待的内部实现需结合 API 语义判断 | 谁挂起、谁负责恢复、是否丢失恢复时机 |

## 状态转换中的竞争

用 vTaskSuspend/vTaskResume 充当事件握手会丢失唤醒：生产者先调用 Resume，而消费者尚未 Suspend，恢复操作不累计；消费者随后挂起便可能一直等待。需要记忆事件次数时使用计数通知、队列或计数信号量。二值信号量也只保存“至少一次”，不保存多次到达的数量。

Blocked 转为 Ready 不等于立即开始执行。其额外等待由更高优先级任务、中断、屏蔽区和调度开销决定。一次“等待事件后 10 ms 才响应”应分别测事件到解除阻塞、解除阻塞到运行、运行到处理完成三个时间。

## Tick 超时的边界

任务调用 vTaskDelay(N) 后，在 tick 相位不同的情况下，实际阻塞时间约在 $(N-1)T_\text{tick}$ 到 $NT_\text{tick}$ 之间，再叠加就绪等待。1 kHz tick 下延时 1 tick 可能很快解除阻塞，不保证至少 1 ms。需要“至少这么久”的硬件时序，应使用有明确下界的定时器或额外考虑 tick 相位。

使用 portMAX_DELAY 是否代表无限等待，取决于 API 与 INCLUDE_vTaskSuspend 等配置；不能单看参数名称。超时返回后必须检查队列/通知的返回值，区分收到事件与等待到期。

## 状态验收与异常处理

记录每任务的释放计数、完成计数、超时计数和最长 Ready 等待。若任务永久 Blocked，先查生产者是否仍工作；若永久 Ready，查调度饥饿；若运行占比异常升高，查忙等或重复解析。eTaskGetState 只是采样瞬间的状态，返回后可立即变化，不应基于它决定共享缓冲区是否安全。业务停机应采用明确确认协议，保证任务释放互斥量、归还 DMA 缓冲后再进入休眠。

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-007.png' | relative_url }}" alt="附件：Pasted image 20250410095313.png"><figcaption>Pasted image 20250410095313.png</figcaption></figure>
