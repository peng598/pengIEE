---
layout: note
title: "实时并发与数据安全"
category: "嵌入式系统"
level: "核心设计"
order: 5
permalink: /notes/realtime-concurrency/
summary: "从竞态与数据一致性到临界区、快照和实时性评估。"
source: "soft/MCU基础知识/05-实时并发与数据安全"
---

# 实时并发与数据安全

## 1. 本项目有哪些执行上下文

```mermaid
flowchart TD
    MAIN["启动阶段 main"]
    TASK["BalanceTask / App_1ms"]
    ADC["ADC1_2_IRQHandler"]
    UART["USART1/2 IRQ"]
    DMA["DMA完成IRQ"]
    MAIN --> TASK
    ADC --> FOC["闭源FOC库与M1/M2_Control"]
    UART --> BUFFER["串口接收缓冲和标志"]
    DMA --> FLAGS["发送/灯带完成标志"]
```

这些上下文不是按源码顺序执行。任务执行到任意指令时，都可能被更高优先级中断打断。

## 2. 什么是竞态条件

```c
uint32_t count;

/* 任务 */
count++;

/* 中断 */
count++;
```

`count++`通常被编译为：

```text
读取count → 加1 → 写回count
```

可能发生：

```text
任务读取10
中断读取10、写入11
任务恢复、写入11
```

预期结果12，实际结果11，这就是丢失更新。

## 3. 原子性不等于一致性

Cortex-M4对对齐的32位读写通常是单条指令，因此一个 `float` 写入通常不会出现“半个旧值、半个新值”。

但是两个字段不构成一个原子整体：

```c
ControlOut_L = new_left;
/* ADC中断可能在这里发生 */
ControlOut_R = new_right;
```

ADC中断可能看到“新左轮目标 + 旧右轮目标”。这称为一致性问题。

## 4. `volatile`不能解决竞态

```c
volatile float target_speed;
```

`volatile`只能要求编译器真实读写，不会：

- 禁止中断抢占。
- 保证复合运算原子。
- 保证多个变量同时更新。
- 建立任务之间的互斥。
- 自动刷新DMA缓存或解决内存顺序。

## 5. 单一所有者原则

最简单可靠的并发设计是让一个执行上下文拥有一类数据。

```text
RcTask拥有串口协议解析状态
ControlTask拥有整车目标和保护状态
ADC/FOC中断拥有瞬时电流采样和PWM更新
ServiceTask拥有灯光状态
```

其他模块通过队列、任务通知或只读快照交换数据，而不是到处直接修改全局变量。

## 6. 短全局临界区

当任务需要同时发布左右目标，且优先级0 ADC必须读取它们时，可以使用极短的PRIMASK临界区：

```c
void PublishMotorTargets(float left, float right)
{
    uint32_t primask = __get_PRIMASK();
    __disable_irq();

    ControlOut_L = left;
    ControlOut_R = right;

    __set_PRIMASK(primask);
}
```

临界区只包含两个赋值，通常是可接受的。下面这种写法不可接受：

```c
__disable_irq();
CalculatePID();
printf("debug");
WriteFlash();
__enable_irq();
```

它会直接阻塞FOC电流采样和PWM更新。

## 7. FreeRTOS临界区的边界

```c
taskENTER_CRITICAL();
shared_state = new_state;
taskEXIT_CRITICAL();
```

FreeRTOS临界区通过BASEPRI屏蔽数值5及更低紧迫度的中断，优先级0 ADC仍然可以抢占。因此：

- 适合保护任务之间或RTOS管理范围内的中断共享数据。
- 不足以保护被FOC高优先级中断访问的数据。

## 8. 序列锁的抢占方向限制

序列锁用奇数表示写入中，偶数表示稳定版本；读者比较前后序列号，不一致便重读。但若任务写到一半后被高优先级 ADC ISR 抢占，ISR 发现奇数并无限重试，写者永远不能恢复，系统会死锁。原先“在 ISR 内循环直到稳定”的简化做法不能用于这种执行关系。

高优先级读者应使用有界尝试，失败则沿用上一份已验证快照并增加陈旧计数，或采用第 6 节极短 PRIMASK 发布。即便改成有界重试，也必须证明载荷读取的原子性、编译器与 CPU 顺序、版本号回绕边界；标准 C 中的多线程数据竞争不能仅靠 volatile 合法化。

若读者是可被写者 ISR 抢占的普通任务，单写者序列锁才有不同的进展条件。仍要限制重试次数，避免高频写入让低优先级读者饥饿。应在文档中画出“谁能抢占谁”，再选择算法，而非只比较是否关中断。

## 9. 双缓冲的所有权与重用

双缓冲的正确性来自“读者使用期间，写者不会重写该缓冲区”，不是来自索引切换本身。两个任务异步运行时，写者可能连续发布两次，在慢读者尚未完成时再次覆盖旧缓冲；索引是原子的也无法保护载荷。

对本文特定的单核关系——唯一写者是任务，唯一读者是更高优先级 ISR，读者在 ISR 内完成整个快照复制，写者不被其他写者重入——写后备缓冲再发布索引可以成立，因为 ISR 执行期间任务不会再次写入。发布前要有编译器/处理器所需的顺序保证，ISR 只读一次活动索引；DMA 或另一处理器不受此证明约束。

对于更一般场景，采用 FreeRTOS 队列复制小型结构，或为缓冲区建立 FREE → FILLING → READY → READING → FREE 的所有权状态，只有读者显式归还后才能重用。队列里传指针不等于复制载荷，指针指向的生命周期也要一起管理。

## 10. 优先级反转

```text
高优先级ControlTask等待互斥量
低优先级DebugTask持有互斥量
中优先级任务不断抢占DebugTask
ControlTask长时间无法运行
```

FreeRTOS Mutex提供优先级继承：低优先级持有者临时提升到等待者优先级，以便尽快释放资源。

二值信号量不提供同样的所有权语义，不应替代Mutex保护任务共享资源。

## 11. 阻塞函数

高优先级控制任务中应避免：

- 无限等待SPI或I2C标志。
- Flash整扇区擦写。
- 阻塞式串口打印。
- 长时间动态内存分配。
- 未设置超时的设备初始化循环。

当前 `IMU_Init()` 会持续等待正确的WHO_AM_I，应改成带次数限制的初始化状态机。

```c
bool IMU_InitWithTimeout(uint32_t retries)
{
    while(retries-- > 0U)
    {
        if(IMU_Read_Reg(MPU6500_WHO_AM_I) == 0x70U)
        {
            return true;
        }
        delay_ms(1U);
    }
    return false;
}
```

## 12. 周期、执行时间和截止时间

| 概念 | 含义 |
|---|---|
| Period | 任务多久释放一次，例如1 ms |
| Execution time | 一次实际用了多少CPU时间 |
| WCET | 最坏情况下的最大执行时间 |
| Deadline | 必须完成的最晚时间 |
| Jitter | 实际开始时间相对计划时间的波动 |

如果控制任务周期1 ms、截止时间1 ms，最坏执行时间必须显著小于1 ms，还要给ADC等中断预留CPU时间。

## 13. DWT测量例程

```c
uint32_t start = DWT->CYCCNT;
App_1ms();
uint32_t cycles = DWT->CYCCNT - start;

float elapsed_us = cycles / 200.0f;
```

建议记录：平均执行时间、最大执行时间、触发校准命令时的最大时间、开启调试输出时的最大时间。

## 14. CPU利用率粗略估算

```text
利用率 = 执行时间 / 周期
```

例如：

```text
1ms任务平均执行200us → 20%
FOC中断每100us执行20us → 20%
其他中断和Idle → 剩余60%
```

真实系统需要把中断嵌套、最坏情况和缓存/Flash等待考虑进去。

## 15. 共享数据的发布协议与验收

为每个共享对象记录写者、读者、更新周期、最大读时长、允许陈旧时间和丢弃策略。对“只要最新值”的遥控目标，可使用长度为 1 的覆盖队列；对必须逐条执行的校准命令，则使用有界消息队列并报告满队列。两者不能混用。

若生产者每 $1\,ms$ 发布一次，消费者可能因总线占用停顿 $8\,ms$，逐条保存至少需要覆盖该期间的到达量并加上边界裕量；无论队列多大，长期平均服务率低于到达率都会最终溢出。把满队列策略写成丢旧、丢新或拒绝命令，而非静默覆盖。

测试时在两个字段之间插入可控延迟，随机增加 ISR 负载，检查左右目标版本号是否相同、是否出现奇数版本长期停留。进一步用工具链原子实现或明确屏蔽方案验证 C 语言层和硬件层的同步；读取 DWT 得到的是观测最大耗时，仍需覆盖冷启动、Flash 等待、异常分支和最大中断负载才能支撑 WCET 结论。

## 设计复核

1. 列出 `ControlOut_L/R`、`M1_Foc/M2_Foc`、USART标志分别由谁读写。
2. 给左右电机目标增加一个一致性发布函数。
3. 使用DWT测量普通运行、串口打印和Flash保存时的 `App_1ms()` 时间。
4. 解释为什么在1 ms控制任务中直接擦除Flash会造成超期。

## 验收检查

- [ ] 明确每个共享对象的读写者、生命周期和允许陈旧时间。
- [ ] 核验 PRIMASK、BASEPRI、Mutex 或所有权协议覆盖全部访问者。
- [ ] 检查锁顺序、最大持锁时长与优先级反转路径。
- [ ] 记录任务响应、最长屏蔽与最大压力下的抖动。
- [ ] 注入抢占与缓冲区满条件，验证无死锁、撕裂或静默覆盖。

上一章：[04-FreeRTOS实时系统]({{ '/notes/freertos-realtime/' | relative_url }})  下一章：[06-PID与数字控制]({{ '/notes/pid-digital-control/' | relative_url }})
