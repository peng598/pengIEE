---
layout: note
title: "assert函数"
category: "实时系统与软件"
level: "核心设计"
order: 7
permalink: /notes/software-assert/
summary: "调试断言与生产环境错误处理的使用边界。"
source: "soft/软件散装笔记/assert函数"
---

# assert函数

## 用断言表达内部不变量

断言适合验证“按程序设计本不应该失败”的条件，例如队列创建后的有效句柄、索引小于容量、ISR 优先级合法、状态转换前置条件。来自串口的数据长度、外设超时和 Flash 校验失败是运行时可能发生的外部事件，应通过错误返回与状态机处理，不能只靠 assert。

下面仅针对设计已保证不会满的内部队列；普通通信队列满应作为可预期运行错误处理，不应每次触发断言。

~~~c
/* 先执行有副作用的操作，再断言；发布版仍保留错误处理。 */
BaseType_t result = xQueueSend(queue, &message, 0);
configASSERT(result == pdPASS);
if (result != pdPASS) {
    queue_overflow_count++;
    HandleQueueOverflow();
}
~~~

禁止把必须执行的动作放在 assert 参数中，例如 assert(InitDevice())。标准 C assert 在定义 NDEBUG 后可能完全移除表达式；“调试版可用、发布版设备未初始化”正是这种副作用造成的。

## 故障现场应保留哪些内容

| 信息 | 用途 | 捕获约束 |
|---|---|---|
| 断言编号、文件/行号、构建标识 | 对应到正确固件和源码 | 避免只保存地址而丢失版本 |
| IPSR、PRIMASK、BASEPRI | 判断任务/ISR 与屏蔽环境 | 在改变屏蔽状态前尽早记录 |
| 当前任务句柄、栈边界 | 识别任务栈损坏 | 已损坏内存不可盲目信任 |
| 关键状态、队列溢出计数 | 定位违反不变量的前因 | 固定大小缓冲，禁止动态分配 |

故障处理不应依赖可能已损坏的 Mutex、堆或复杂 printf。对电机系统，先采用确定、短路径撤销功率使能，再把小型记录写入预留 RAM；下次启动后检查记录完整性并导出。中断中直接擦写 Flash 既扩大故障范围，也可能永久阻塞。

## 调试与发布版本都要验收

断言响应时间是“检测 → 输出到安全状态 → 记录”的总延迟，应小于系统对故障的允许时间。注入空句柄、队列满、非法状态和栈检查失败，确认处理函数不会递归触发断言、不会持锁等待，并验证发布版关闭 assert 后仍能拒绝非法输入。断言覆盖率只能说明已检查的路径，不构成系统可靠性证明。

## 原笔记图示

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-012.png' | relative_url }}" alt="附件：Pasted image 20250416205734.png"><figcaption>Pasted image 20250416205734.png</figcaption></figure>
<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-013.png' | relative_url }}" alt="附件：Pasted image 20250416205749.png"><figcaption>Pasted image 20250416205749.png</figcaption></figure>合理使用`assert`可显著提升代码可靠性，但需区分调试断言与生产环境的错误处理机制，确保程序的健壮性和用户体验。
