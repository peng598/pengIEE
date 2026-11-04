---
layout: note
title: "任务调度方式"
category: "实时系统与软件"
level: "核心设计"
order: 2
permalink: /notes/freertos-scheduling/
summary: "固定优先级抢占、同优先级时间片与协作式调度的边界及响应时间分析。"
source: "soft/FreeRTOS/任务调度方式"
---

# 任务调度方式

FreeRTOS 任务调度需要分开看两个配置：是否允许高优先级就绪任务抢占，以及是否对同优先级任务按 tick 轮转。“时间片”是抢占调度下的同优先级分配规则；“协作式调度”也不是历史上的 co-routine 功能。<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-008.png' | relative_url }}" alt="附件：Pasted image 20250410100927.png"><figcaption>Pasted image 20250410100927.png</figcaption></figure>
<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-009.png' | relative_url }}" alt="附件：Pasted image 20250410100934.png"><figcaption>Pasted image 20250410100934.png</figcaption></figure>

## 配置如何改变可观测行为

| 配置 | 调度行为 | 设计后果 |
|---|---|---|
| configUSE_PREEMPTION = 1 | 更高优先级任务变为就绪时可抢占 | ISR 唤醒任务后还需按端口请求切换 |
| configUSE_TIME_SLICING = 1 | 同优先级就绪任务可在 tick 时轮转 | 时间片不等于执行时间上限；长临界区仍会推迟切换 |
| configUSE_TIME_SLICING = 0 | 不因 tick 单独触发同优先级轮转 | 阻塞、主动让出等仍会改变运行任务 |
| configUSE_PREEMPTION = 0 | 通常在任务阻塞或主动让出时调度 | 单个不让出的任务可拖延其他任务，须单独分析协作路径 |

taskYIELD 只是在可运行任务间让出，不能保证低优先级任务获得 CPU；高优先级任务持续 Ready 时，低优先级任务仍可能饿死。等待外设应阻塞在事件上，而不是高优先级循环轮询再 yield。

## 响应时间比平均负载更能说明实时性

单核、独立周期/偶发任务、固定优先级抢占，且每个高优先级任务有确定最小到达间隔时，可用迭代式：

$$
R_i^{(n+1)}=C_i+B_i+\sum_{j\in hp(i)}
\left\lceil\frac{R_i^{(n)}}{T_j}\right\rceil C_j
$$

$C_i$ 是目标任务 WCET，$B_i$ 是低优先级资源持有造成的阻塞，$T_j$ 是高优先级任务最小间隔。中断、调度开销和释放抖动要另外纳入，存在自挂起和复杂资源嵌套时不能机械套用此简式。

例：控制任务 $C_i=180\,\mu s$、$B_i=20\,\mu s$；一个高优先级 ISR 每 $100\,\mu s$ 最多执行 $12\,\mu s$。从 $R_0=200\,\mu s$ 开始，得到 $R_1=224\,\mu s$、$R_2=236\,\mu s$，之后收敛为 $236\,\mu s$。若截止时间为 $250\,\mu s$，仅剩 $14\,\mu s$ 未分配预算，不能据“平均 CPU 负载低”继续加入阻塞打印。

调度验收至少记录释放时间、实际开始时间、结束时间、锁等待、队列积压和截止时间违约计数。利用率 $U=\sum C_i/T_i<1$ 仅是必要条件之一，不是一般任务集的充分保证。
