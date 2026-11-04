---
layout: note
title: "术语表"
category: "嵌入式系统"
level: "核心设计"
order: 13
permalink: /notes/embedded-glossary/
summary: "嵌入式、实时系统和电机控制中常用术语的快速索引。"
source: "soft/MCU基础知识/术语表"
---

# 术语表

| 术语 | 含义 |
|---|---|
| ADC | 模数转换器，把模拟电压转换为数字值 |
| AHRS | 姿态航向参考系统，本项目实际采用简化互补滤波 |
| Anti-windup | PID抗积分饱和机制 |
| APB/AHB | Cortex-M微控制器外设和系统总线 |
| BASEPRI | Cortex-M按优先级屏蔽中断的寄存器 |
| BLDC | 无刷直流电机 |
| BSS/ZI | 未初始化或零初始化的全局/静态RAM区 |
| Clarke变换 | 三相ABC电流到静止αβ坐标的变换 |
| CRC | 循环冗余校验，用于检测数据错误 |
| DMA | 外设和内存之间自动搬运数据的控制器 |
| DWT | Cortex-M调试与跟踪单元，CYCCNT可测CPU周期 |
| Electrical angle | 电角度，机械角乘极对数并加零偏 |
| FOC | 磁场定向控制 |
| Id | dq坐标中沿转子磁链方向的电流 |
| Iq | dq坐标中主要产生转矩的电流 |
| ISR | 中断服务程序 |
| Jitter | 周期任务或中断开始时间的波动 |
| MSP | Cortex-M主栈指针 |
| Mutex | 带所有权和优先级继承的互斥量 |
| NVIC | Cortex-M嵌套向量中断控制器 |
| Park变换 | 静止αβ坐标到旋转dq坐标的变换 |
| PendSV | FreeRTOS用于上下文切换的异常 |
| PMSM | 永磁同步电机 |
| Pole pairs | 电机极对数 |
| PRIMASK | Cortex-M全局屏蔽普通中断的寄存器 |
| PSP | Cortex-M进程栈指针，FreeRTOS任务使用 |
| PWM | 脉宽调制 |
| RTOS | 实时操作系统 |
| Semaphore | 用于事件或资源计数的同步对象 |
| SVPWM | 空间矢量PWM |
| SVC | Supervisor Call，FreeRTOS用于启动首任务 |
| SysTick | Cortex-M系统节拍定时器 |
| TCB | 任务控制块，保存任务状态和栈信息 |
| Tick | RTOS 延时与超时计数的节拍单位，不是所有硬件事件的时间分辨率 |
| WCET | 最坏情况执行时间 |
| Watchdog | 看门狗，程序未按期喂狗时复位系统 |

## 容易混用的工程概念

| 概念对 | 精确区别 | 验证方式 |
|---|---|---|
| Latency / Jitter | 延迟是事件到动作的时间；抖动是该时间或周期的变化 | 同时记录均值、最大值和分布，不能只报平均周期 |
| Deadline / Period | 截止时间限制一次工作何时结束；周期描述释放间隔 | 明确相对释放时刻，允许 $D<T$ |
| Atomicity / Visibility | 原子性避免半写或交错；可见性要求观察到写入 | 检查指令、内存模型和发布协议 |
| Bandwidth / Sampling rate | 带宽是闭环/信号频域特性；采样率是观测频次 | 用幅相响应验证带宽，不能把 PWM 频率当带宽 |
| Resolution / Accuracy | 分辨率是可分辨步长；准确度包含偏置、增益与非线性 | 用已知参考源标定，检查全温全量程 |
| Phase margin / Gain margin | 前者在单位环路增益处衡量相位余量；后者在相位交越处衡量增益余量 | 用一致的开环符号约定与扫频数据 |
| Cache clean / Invalidate | Clean 将脏缓存写回；Invalidate 丢弃缓存副本 | DMA 所有权交接时按传输方向处理 |

## 量纲与归一化的核对规则

把接口量写成“名称、单位、正方向、比例、更新时间、有效范围”。例如 Iq 为 A、速度为 rad/s、角度为 rad；若某闭源库使用标幺值，必须额外写明基值 $I_b,V_b,\omega_b$，并用 $i_\mathrm{pu}=i/I_b$ 恢复物理意义。FOC 的幅值不变与功率不变变换采用不同系数，转矩公式和增益也必须随之匹配。

“实时”表示在规定截止时间内得到正确结果；“平均很快”不能替代最坏情况证据。“无锁”也不代表 ISR 适用：自旋等待被该 ISR 抢占的写者会永远等不到完成。术语检查最终应落实到可测指标，例如最大事件响应 $35\,\mu s$、环路交越 $500\,Hz$、电流总误差 $1\%$；这些只是指标写法示例，实际数值由项目需求确定。

返回：[工程总览]({{ '/notes/learning-roadmap/' | relative_url }})。
