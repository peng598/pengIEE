---
layout: note
title: "项目源码导读与练习"
category: "嵌入式系统"
order: 12
permalink: /notes/project-code-reading/
summary: "按信号链阅读平衡车固件，并通过实验验证控制与保护逻辑。"
source: "soft/MCU基础知识/12-项目源码导读与练习"
---

# 项目源码导读与练习

## 1. 目录职责

| 目录 | 作用 |
|---|---|
| `USER` | Keil/EIDE工程、main、系统时钟、异常处理 |
| `UserFile` | 应用、控制算法和板级驱动 |
| `CORE` | Cortex-M启动文件、CMSIS和芯片定义 |
| `AT32F413_StdPeriph_Driver` | AT32标准外设驱动 |
| `Middlewares/FreeRTOS-Kernel` | FreeRTOS V11.3.0及ARM_CM4F端口 |
| `ESP32C3_Receiver` | 蓝牙手柄到UART的接收端 |
| `bin` | 最终二进制固件 |
| `_backup` | FreeRTOS迁移前完整备份 |

## 2. 第一条阅读链：启动与调度

```text
startup_at32f413.s
→ main.c
→ system_clock_config
→ delay_init
→ Peripherals_Init
→ FreeRTOS_AppInit
→ vTaskStartScheduler
→ BalanceTask
→ App_1ms
```

文件：

- startup_at32f413.s
- main.c
- at32f413_clock.c
- freertos_app.c
- app.c

阅读问题：

1. 哪些初始化在调度器启动前完成？
2. 哪个函数开始后正常情况下不再返回？
3. 1 ms周期由谁产生？
4. TMR5为什么仍有源码但不再初始化？

## 3. 第二条阅读链：姿态和平衡

```text
App_1ms
→ Get_mpu6500
→ IMU_handle
→ MotorControl
→ UprightPID + SpeedPID + TurnPID
→ ControlOut_L / ControlOut_R
```

文件：

- MPU6500.c
- AHRS.c
- Control.c

阅读问题：

1. 原始加速度和角速度如何变成物理单位？
2. 互补滤波的两个权重是多少？
3. 直立环和速度/转向环的更新周期是否相同？
4. 哪些条件会让 `ControlOut_L/R` 清零？

## 4. 第三条阅读链：FOC实时路径

```text
TMR1/TMR8中心对齐PWM
→ ADC抢占通道硬件触发
→ ADC1_2_IRQHandler
→ Read_M1/M2_Encoder
→ M1/M2_FOC_handle
→ M1/M2_Control
→ 速度PI
→ Id/Iq电流PI
→ Vd/Vq
→ 闭源库更新三相PWM
```

文件：

- timer.c
- adc.c
- Encoder.c
- AT32F413RC_FOC_LIB.h
- Control.c

阅读问题：

1. ADC1和ADC2分别由哪个定时器触发？
2. 为什么编码器读取发生在ADC中断中？
3. 哪些FOC步骤不可见，为什么？
4. 电机速度环和电流环分别输出什么量？

## 5. 第四条阅读链：通信

```text
BLE手柄Notify
→ ESP32 UART1
→ AT32 USART1 DMA
→ USART1 IDLE中断
→ GET_USART1_Data
→ RcData
→ Rc.x / Rc.z
→ Car.ControlY / Car.ControlZ
```

文件：

- ESP32C3_Receiver.ino
- usart.c
- RcData.c

阅读问题：

1. UART1和UART2的波特率分别是多少？
2. DMA如何判断实际收到的长度？
3. 手柄包和小程序包如何区分？
4. 通信超时后目标量如何衰减？

## 6. 第五条阅读链：校准与持久化

```text
USART2校准命令
→ Car_Cali
→ Gyro_Cali 或 FOC Cali_flag
→ 组织CaliData
→ 两级校验
→ flash_write(0x0803E800)
```

文件：

- Calibration.c
- flash.c

阅读问题：

1. 哪些参数必须同时有效才允许整车控制？
2. Flash读写函数长度参数的单位是什么？
3. 固定地址是否处于芯片合法Flash范围？
4. 写Flash时FOC中断是否仍可能运行？

## 7. 核心参数速查

| 参数 | 当前值 | 影响 |
|---|---:|---|
| CPU时钟 | 200 MHz | SysTick、DWT和外设时钟基础 |
| RTOS tick | 1 kHz | 1 tick = 1 ms |
| BalanceTask优先级 | 5 | 业务任务抢占关系 |
| BalanceTask栈 | 768 words | 约3072字节 |
| FreeRTOS heap | 12 KB | 动态任务/对象内存 |
| 电机极对数 | 4 | 机械角到电角度换算 |
| 采样电阻 | 0.05 Ω | 相电流换算 |
| 低电量阈值 | 7.0 V | WS2812告警 |
| 倾角运行限制 | 约70° | 超出后停止控制 |
| 倾倒保护阈值 | 约75° | 强制保护 |
| 堵转持续时间 | 约1 s | Iq长期接近上限触发 |

## 8. 实验一：确认RTOS周期

目标：验证 `App_1ms()`确实每1 ms运行。

步骤：

1. 用GPIO包围 `App_1ms()`。
2. 示波器观察相邻脉冲起点间隔。
3. 记录脉冲宽度最小值、平均值和最大值。
4. 开启串口打印后重新测量。
5. 检查 `RTOS_ControlOverrunCount`。

通过标准：正常运行无超期，最大执行时间留有足够余量。

## 9. 实验二：验证IMU

目标：确认单位、方向、零偏和互补滤波。

步骤：

1. 静止记录10秒陀螺原始值。
2. 计算均值、标准差和漂移。
3. 前倾约10°，对比实际角度和 `gyroAngle.y`。
4. 快速晃动车体，比较加速度角与融合角。
5. 改变滤波alpha，预测并观察响应差异。

## 10. 实验三：验证编码器

目标：确认分辨率、回绕和左右方向。

步骤：

1. 手动缓慢转动一圈，确认计数变化约32768。
2. 跨越零点，确认速度没有巨大尖峰。
3. 同时向前转动左右轮，记录两个速度符号。
4. 验证 `Car.Speed` 组合后同向运动为正确符号。

## 11. 实验四：验证通信健壮性

目标：确认错误数据不会变成危险控制命令。

测试包：

- 长度为0、1、14、15、128字节。
- 正确帧头但错误来源类型。
- 正确帧头但随机Payload。
- 连续两个包无间隔。
- 从帧中间开始的数据流。
- 蓝牙突然断开。

通过标准：不会越界，不会保持永久前进命令，能够重新同步。

## 12. 实验五：PID离线验证

先不连接电机，用人工反馈序列测试PID：

```c
float feedback[] = { 0, 0, 1, 2, 4, 7, 9, 10 };
float target = 10.0f;

for(uint32_t i = 0U; i < ARRAY_SIZE(feedback); i++)
{
    float output = PID_Update(&pid, target, feedback[i]);
    Log(output);
}
```

验证：比例方向、积分累积、输出限幅和误差反向后的积分释放。

## 13. 实验六：保护故障注入

逐项模拟：

- IMU故障标志。
- 倾角超过75°。
- 电池电压低于阈值。
- Iq持续饱和。
- 编码器不变化。
- RTOS栈溢出。
- heap分配失败。

每项记录：检测时间、输出关闭时间、灯光提示、恢复条件和是否需要人工确认。

## 14. 推荐重构练习

按风险从低到高：

1. 给IMU初始化增加超时，不改变正常路径。
2. 给串口协议增加长度检查。
3. 将魔法数字整理成有单位的配置宏。
4. 给校准数据增加版本和CRC。
5. 增加统一故障状态机。
6. 将灯光/调试拆到ServiceTask。
7. 将串口解析拆到RcTask并使用任务通知。
8. 为任务和FOC中断共享目标增加一致性发布机制。

## 15. 四周复习计划

| 周 | 重点 | 输出成果 |
|---|---|---|
| 第1周 | C、内存、Cortex-M、外设 | 手写GPIO/Timer/ADC/DMA最小例程 |
| 第2周 | FreeRTOS、并发、调试 | 周期任务、通知、栈和执行时间报告 |
| 第3周 | PID、滤波、IMU、编码器 | 离线曲线和单位/方向验证表 |
| 第4周 | FOC、串级控制、保护 | 完整信号链图和安全测试记录 |

## 最终自测题

1. 从遥控前推开始，逐函数说明最终如何改变三相PWM。
2. 为什么 `volatile` 无法保护左右轮目标的一致性？
3. 为什么FreeRTOS临界区无法屏蔽优先级0 ADC？
4. 为什么改变控制周期后Ki通常需要修改？
5. 为什么电角度偏差会造成大电流但小转矩？
6. 为什么加速度计不能单独用于动态平衡？
7. 为什么串口短包必须先验证长度再访问 `data[14]`？
8. 如何证明控制任务没有超过1 ms截止时间？
9. 如何从HardFault的PC定位到源码函数？
10. 如果小车前倾时车轮向后转，应该按什么顺序排查符号？

上一章：[11-调试故障与上板流程]({{ '/notes/debug-and-hardware-bringup/' | relative_url }})  返回：[00-教程总览]({{ '/notes/learning-roadmap/' | relative_url }})
