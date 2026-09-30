---
layout: note
title: "术语表"
category: "嵌入式系统"
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
| Tick | RTOS时间的最小节拍单位 |
| WCET | 最坏情况执行时间 |
| Watchdog | 看门狗，程序未按期喂狗时复位系统 |

返回：[00-教程总览]({{ '/notes/learning-roadmap/' | relative_url }})
