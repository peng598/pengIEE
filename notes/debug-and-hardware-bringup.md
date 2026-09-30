---
layout: note
title: "调试、故障与上板流程"
category: "嵌入式系统"
level: "工程实战"
order: 11
permalink: /notes/debug-and-hardware-bringup/
summary: "嵌入式调试工具、故障定位和分阶段安全上板流程。"
source: "soft/MCU基础知识/11-调试故障与上板流程"
---

# 调试、故障与上板流程

## 1. 调试工具分工

| 工具 | 适合观察 |
|---|---|
| 编译器警告 | 类型、未使用变量、隐式转换、可疑代码 |
| MAP文件 | Flash/RAM、符号来源、链接结果 |
| J-Link调试器 | 断点、寄存器、内存、调用栈 |
| 串口上位机 | 慢速状态、参数、趋势 |
| 示波器 | PWM、电流、模拟噪声、执行脉冲 |
| 逻辑分析仪 | SPI、UART、数字时序 |
| DWT CYCCNT | 函数执行时间和抖动 |
| FreeRTOS诊断 | 任务状态、栈余量、堆余量、超期计数 |

不要试图用串口打印解决所有问题。打印本身会改变实时系统的时序。

## 2. 编译结果

当前FreeRTOS版本构建结果：

```text
Code=33824
RO-data=83960
RW-data=328
ZI-data=18928
0 Error(s), 0 Warning(s)
```

含义：

| 字段 | 含义 |
|---|---|
| Code | 机器指令大小 |
| RO-data | 只读常量和闭源库常量 |
| RW-data | 有非零初值、启动时复制到RAM的数据 |
| ZI-data | 启动时清零的数据，包括12 KB FreeRTOS heap |

ROM大致为Code + RO-data + RW-data；RAM大致为RW-data + ZI-data，任务运行时从已经计入ZI的FreeRTOS heap中分配栈和TCB。

## 3. 阅读MAP文件

MAP文件位置：`USER/Listings/AT32F413_Demo.map`。

重点搜索：

```text
Total RO Size
Total RW Size
ucHeap
Stack_Mem
BalanceTask
SVC_Handler
PendSV_Handler
SysTick_Handler
```

当前应该确认：

- `ucHeap`大小为12288字节。
- `SVC_Handler/PendSV_Handler/SysTick_Handler`来自 `port.o`。
- `BalanceTask`来自 `freertos_app.o`。
- 没有重复定义或未解析符号。

## 4. 运行时关键变量

| 变量 | 正常期望 |
|---|---|
| `RTOS_ControlOverrunCount` | 正常控制期间保持0 |
| `RTOS_ControlStackMinWords` | 建议至少大于128 words |
| `mpu6500.gyroAngle.y` | 静止直立附近约0° |
| `M1_Foc.Id/M2_Foc.Id` | 表贴电机正常运行时接近0目标 |
| `M1_Foc.Iq/M2_Foc.Iq` | 随转矩变化，不应长期饱和 |
| `Car.BatVin_filter` | 接近万用表实测电压 |
| `Car.Protect_flag` | 运行时0，保护时1 |
| `FaultBit.all` | 正常为0 |

## 5. GPIO执行时间探针

用空闲GPIO包围被测代码：

```c
gpio_bits_set(GPIOA, GPIO_PINS_3);
App_1ms();
gpio_bits_reset(GPIOA, GPIO_PINS_3);
```

示波器看到的高电平宽度就是执行时间。优点是不会像串口打印那样产生大量额外负载，还能观察周期抖动。

可测：

- `App_1ms()`总执行时间。
- `ADC1_2_IRQHandler()`执行时间。
- SPI编码器读取时间。
- Flash保存期间的最长阻塞。
> **注意：> 不要在FOC中断中频繁调用复杂GPIO库函数。可直接使用置位/清零寄存器减小探针开销。**
## 6. 逻辑分析仪检查SPI

检查项目：

- CS是否在一帧期间保持有效。
- 时钟频率是否超过传感器上限。
- CPOL/CPHA是否正确。
- 数据是MSB还是LSB先发。
- 16位帧之间是否需要额外延时。
- 两个编码器片选是否发生重叠。

如果WHO_AM_I总是 `0x00` 或 `0xFF`，优先检查电源、CS、SPI模式和MISO连接，不要先怀疑滤波算法。

## 7. 示波器检查PWM

上电但不开功率前：

1. 确认TMR1/TMR8频率。
2. 确认三相通道周期一致。
3. 确认中心对齐计数行为。
4. 确认驱动关闭时GPIO处于安全状态。

开功率后使用合适的差分探头检查：

- 上下管是否存在死区。
- 是否出现直通迹象。
- 占空比是否超出允许范围。
- ADC触发点是否避开开关边沿。

## 8. HardFault寄存器

发生HardFault时重点寄存器：

| 寄存器 | 作用 |
|---|---|
| HFSR | HardFault总状态 |
| CFSR | MemManage、BusFault、UsageFault细分原因 |
| MMFAR | 内存管理错误地址 |
| BFAR | 总线错误地址 |
| LR | 异常返回信息或调用返回地址 |
| PC | 出错指令地址 |

简化HardFault栈捕获：

```c
volatile uint32_t hardfault_r0;
volatile uint32_t hardfault_lr;
volatile uint32_t hardfault_pc;
volatile uint32_t hardfault_xpsr;

void HardFault_C(uint32_t *stack)
{
    hardfault_r0 = stack[0];
    hardfault_lr = stack[5];
    hardfault_pc = stack[6];
    hardfault_xpsr = stack[7];

    __disable_irq();
    for(;;) {}
}
```

实际入口还要根据EXC_RETURN判断故障前使用MSP还是PSP，并用一小段汇编把对应栈指针传给C函数。

## 9. 常见故障定位表

| 现象 | 优先检查 |
|---|---|
| 上电卡死 | IMU WHO_AM_I循环、时钟稳定等待、ADC校准等待 |
| 调度器不启动 | heap不足、异常向量、FPU编译选项、FreeRTOS断言 |
| 一启电机就复位 | 电源压降、EMI、HardFault、栈溢出、看门狗 |
| 电机高频尖叫 | PWM频率、FOC角度、相序、电流环振荡 |
| 车体快速发散 | 倾角符号、电机方向、直立Kp符号 |
| 缓慢前后摆动 | 速度环过强、积分过大、滤波延迟 |
| 遥控偶发跳变 | DMA帧边界、短包、缓冲区竞争、无CRC |
| WS2812颜色错乱 | GRB顺序、DMA长度、PWM时序、并发更新 |

## 10. 分层排错法

不要同时调所有模块。按以下顺序：

```text
电源/时钟
→ GPIO与驱动使能
→ SPI/UART数字通信
→ ADC原始值
→ 编码器角度与方向
→ FOC电流环
→ 单电机速度环
→ IMU单位和倾角
→ 直立环
→ 整车速度/转向环
→ RTOS多任务拆分
```

每层都应有明确输入、输出和通过标准。

## 11. 安全上板流程

### 阶段A：不接电机功率

- [ ] 核对主控和驱动电源电压。
- [ ] 确认驱动使能默认关闭。
- [ ] 验证系统时钟和FreeRTOS tick。
- [ ] 验证IMU、编码器、串口原始数据。
- [ ] 检查PWM频率和三相输出逻辑。

### 阶段B：架空车轮并限流

- [ ] 使用限流电源或串联合适保护。
- [ ] 将电流目标和Vd/Vq限制降到较小值。
- [ ] 校准单个电机，另一个保持关闭。
- [ ] 验证正命令对应正确转向。
- [ ] 验证急停、倾倒和通信超时能关闭输出。

### 阶段C：扶持平衡测试

- [ ] 先关闭整车速度环和转向环。
- [ ] 小角度前后倾斜，确认车轮追赶重心。
- [ ] 从小Kp开始调直立环。
- [ ] 记录电流峰值、倾角和恢复时间。

### 阶段D：落地测试

- [ ] 预留物理急停和足够空间。
- [ ] 加入速度环后先测试低速。
- [ ] 验证蓝牙断开、欠压和堵转。
- [ ] 持续观察控制超期和栈高水位。

## 12. 回归测试

每次修改后至少复测：

- 正常上电和关机。
- 无IMU、无编码器、蓝牙断开。
- 校准数据有效和无效两种启动。
- 电池正常和欠压。
- 车体倾倒保护。
- 左右轮堵转。
- 串口持续高负载。
- WS2812持续刷新。
- 运行十分钟后的温升和零偏。

## 本章练习

1. 用GPIO探针测量 `App_1ms()` 最大执行时间。
2. 人为把任务栈调小，验证栈溢出钩子关闭电机。
3. 断开MPU6500，记录当前启动行为并设计超时改进。
4. 构造短串口包和错误CRC，确认系统不产生控制跳变。
5. 把HardFault PC地址映射回MAP文件中的具体函数。

## 掌握检查

- [ ] 能选择正确的调试工具而不是只依赖printf。
- [ ] 能从MAP文件确认内存和异常向量。
- [ ] 能捕获并解释HardFault关键寄存器。
- [ ] 能按分层顺序定位电机和控制问题。
- [ ] 能执行安全、可回退的上板流程。

上一章：[10-串口-DMA与BLE协议]({{ '/notes/uart-dma-ble/' | relative_url }})  下一章：[12-项目源码导读与练习]({{ '/notes/project-code-reading/' | relative_url }})
