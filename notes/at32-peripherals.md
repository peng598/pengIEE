---
layout: note
title: "AT32外设驱动基础"
category: "嵌入式系统"
order: 3
permalink: /notes/at32-peripherals/
summary: "AT32 时钟树、GPIO、定时器、ADC、DMA、SPI、UART 与 Flash。"
source: "soft/MCU基础知识/03-AT32外设驱动基础.md"
---

# AT32外设驱动基础

## 1. 时钟树

所有外设配置都依赖时钟。计算定时器、串口或ADC参数前，必须先知道时钟来源。

当前工程使用25 MHz外部晶振，经PLL得到200 MHz系统时钟，参考 `at32f413_clock.c`。

```text
HEXT = 25 MHz
PLL输入 = HEXT / 2 = 12.5 MHz
PLL倍频 = 16
SCLK = 12.5 × 16 = 200 MHz
AHB = 200 MHz
APB1 = 100 MHz
APB2 = 100 MHz
```
> **注意：> 不同MCU在APB分频不为1时，定时器时钟可能自动乘2。计算PWM频率时必须查AT32参考手册并结合实测，不能只照搬STM32经验。**
## 2. GPIO

GPIO配置结构体常见参数：

```c
gpio_init_type gpio;

gpio_default_para_init(&gpio);
gpio.gpio_pins = GPIO_PINS_2;
gpio.gpio_mode = GPIO_MODE_OUTPUT;
gpio.gpio_out_type = GPIO_OUTPUT_PUSH_PULL;
gpio.gpio_pull = GPIO_PULL_NONE;
gpio.gpio_drive_strength = GPIO_DRIVE_STRENGTH_STRONGER;
gpio_init(GPIOB, &gpio);
```

| 参数 | 含义 |
|---|---|
| `gpio_pins` | 要配置的引脚掩码，可用按位或同时选择多个引脚 |
| `gpio_mode` | 输入、输出、复用或模拟 |
| `gpio_out_type` | 推挽或开漏，仅输出/复用输出相关 |
| `gpio_pull` | 无上下拉、上拉、下拉 |
| `gpio_drive_strength` | 输出驱动能力和边沿速度 |

常用操作：

```c
gpio_bits_set(GPIOB, GPIO_PINS_2);    /* 输出高 */
gpio_bits_reset(GPIOB, GPIO_PINS_2);  /* 输出低 */
flag_status key = gpio_input_data_bit_read(GPIOC, GPIO_PINS_13);
```

项目中PB2是电机驱动使能，PC14是电源控制，参考 `Gpio_Config.c`。

## 3. 定时器基础

向上计数模式的基本频率公式：

```text
计数频率 = 定时器输入时钟 / (预分频值 + 1)
更新频率 = 计数频率 / (周期值 + 1)
```

例程：200 MHz输入，预分频199，周期999：

```text
计数频率 = 200 MHz / 200 = 1 MHz
更新频率 = 1 MHz / 1000 = 1 kHz
周期 = 1 ms
```

```c
tmr_base_init(TMR5, 999U, 199U);
tmr_cnt_dir_set(TMR5, TMR_COUNT_UP);
tmr_interrupt_enable(TMR5, TMR_OVF_INT, TRUE);
```

### 中心对齐PWM

FOC通常使用中心对齐PWM：计数器先向上再向下，采样点更对称、谐波较小。

```text
0 → Period → 0 → Period ...
```

中心对齐下，一个完整PWM周期包含向上和向下两段。频率计算通常需要额外除以2，具体以芯片定时器定义为准。

### PWM占空比

```text
占空比约等于 Compare / Period
```

```c
tmr_channel_value_set(TMR1, TMR_SELECT_CHANNEL_1, TMR1->pr / 2U);
```

这表示初始约50%占空比。FOC库运行后会不断更新三个相通道比较值。

### 死区

半桥上、下MOS不能同时导通。死区是在一个MOS关闭后延迟一小段时间再打开另一个MOS。

```c
tmr_brkdt_config_struct.deadtime = 20U;
```

`20`不是固定的纳秒数，而是定时器死区编码。必须根据定时器时钟、寄存器编码和MOS驱动器特性换算。
> **安全警告：> 死区过小可能直通烧毁功率管；死区过大则增加波形失真和低速转矩误差。**
## 4. ADC

12位ADC输出范围通常为0到4095。

```text
引脚电压 = ADC值 × 参考电压 / 4096
```

项目电池电压计算：

```c
float pin_v = ADC2->pdt3_bit.pdt3 * 3.3f / 4096.0f;
Car.BatVin = pin_v * 11.0f;
```

这里 `11.0` 来自电阻分压倍率。假设上臂10 kΩ、下臂1 kΩ：

```text
Vin / Vpin = (10k + 1k) / 1k = 11
```

### 采样时间

```c
adc_preempt_channel_set(ADC1, ADC_CHANNEL_14, 1, ADC_SAMPLETIME_1_5);
```

参数含义：

| 参数 | 含义 |
|---|---|
| `ADC1` | 使用ADC1 |
| `ADC_CHANNEL_14` | 模拟输入通道14 |
| `1` | 抢占序列中的第1次转换 |
| `ADC_SAMPLETIME_1_5` | 采样保持1.5个ADC周期 |

电流采样需要快，但信号源阻抗较高时采样时间太短会导致采样电容充电不足。

### PWM硬件触发ADC

```c
adc_preempt_conversion_trigger_set(
    ADC1,
    ADC12_PREEMPT_TRIG_TMR1CH4,
    TRUE);
```

这样ADC采样点与PWM同步，不受任务调度影响。转换完成后进入 `adc.c` 的 `ADC1_2_IRQHandler()`。

```mermaid
flowchart LR
    PWM["TMR1通道4事件"] --> ADC["ADC1抢占采样"]
    ADC --> IRQ["ADC1_2_IRQHandler"]
    IRQ --> ENC["读取编码器"]
    ENC --> FOC["M1_FOC_handle"]
```

## 5. DMA

DMA让外设和内存之间自动搬运数据，CPU只处理开始和完成事件。

```c
dma_init_type dma;

dma_default_para_init(&dma);
dma.buffer_size = 128U;
dma.direction = DMA_DIR_PERIPHERAL_TO_MEMORY;
dma.memory_base_addr = (uint32_t)rx_buffer;
dma.memory_data_width = DMA_MEMORY_DATA_WIDTH_BYTE;
dma.memory_inc_enable = TRUE;
dma.peripheral_base_addr = (uint32_t)&USART1->dt;
dma.peripheral_data_width = DMA_PERIPHERAL_DATA_WIDTH_BYTE;
dma.peripheral_inc_enable = FALSE;
dma.loop_mode_enable = FALSE;
```

参数解释：

| 参数 | 典型接收配置 |
|---|---|
| `buffer_size` | 最多搬运多少个数据单位 |
| `direction` | 外设到内存 |
| `memory_inc_enable` | 每收一个字节，内存地址加一 |
| `peripheral_inc_enable` | USART数据寄存器地址固定，所以关闭 |
| `data_width` | UART通常为字节，ADC通常为半字 |
| `loop_mode_enable` | 循环采样时开启；变长帧接收常配合空闲中断重装 |

WS2812则是内存到定时器比较寄存器，参考 `WS2812.c`。

## 6. SPI

SPI关键参数：

| 参数 | 含义 |
|---|---|
| Master/Slave | 谁产生时钟 |
| CPOL | 空闲时时钟电平 |
| CPHA | 第几个边沿采样 |
| Prescaler | SPI时钟分频 |
| Frame width | 8位或16位 |
| First bit | MSB或LSB先发 |

```c
spi_init_struct.master_slave_mode = SPI_MODE_MASTER;
spi_init_struct.mclk_freq_division = SPI_MCLK_DIV_8;
spi_init_struct.frame_bit_num = SPI_FRAME_16BIT;
spi_init_struct.clock_polarity = SPI_CLOCK_POLARITY_LOW;
spi_init_struct.clock_phase = SPI_CLOCK_PHASE_2EDGE;
```

项目使用：

- SPI1：8位帧，读取MPU6500。
- SPI2：16位帧，读取两个TLE5012B编码器。

### 阻塞式收发

```c
while(spi_i2s_flag_get(SPI2, SPI_I2S_TDBE_FLAG) == RESET)
{
    if(++timeout > 200U)
    {
        return 0U;
    }
}
SPI2->dt = tx_data;
```

超时是必要保护。没有超时的阻塞轮询可能让任务或中断永久卡死。

## 7. USART与空闲中断

波特率表示每秒传输的符号数。8N1格式每个字节通常占10位：1起始位、8数据位、1停止位。

```text
921600 baud理论最大字节率约为 921600 / 10 = 92160 byte/s
```

DMA不知道变长帧什么时候结束，因此常用USART空闲中断：总线超过一个字符时间没有新数据时触发。

```text
USART接收 → DMA写入缓冲区 → IDLE中断
                             ├─ 计算已接收长度
                             ├─ 复制/交换缓冲区
                             └─ 重装DMA计数器
```

参考 `usart.c` 中的 `USART1_IRQHandler()` 和 `USART2_IRQHandler()`。

## 8. Flash

Flash通常只能把位从1写成0；从0恢复为1必须先擦除整个扇区。

```text
读取 → 检查目标区域 → 必要时备份整扇区 → 擦除 → 重写
```

项目把校准数据放在固定地址 `0x0803E800`，参考 `Calibration.c`。

Flash参数必须确认：

- 地址没有覆盖程序代码。
- 地址满足写入宽度对齐要求。
- 写入长度的单位是字节还是半字。
- 擦除期间是否允许电机继续运行。
- 校验失败时使用安全默认值。

## 本章练习

1. 根据200 MHz时钟计算一个10 kHz向上计数定时器的预分频和周期。
2. 计算8.4 V电池经过11倍分压后的ADC理论值。
3. 解释为什么PWM触发ADC比任务中软件启动ADC更适合FOC。
4. 画出USART DMA加空闲中断的数据流。
5. 用示波器测量TMR1实际PWM频率并与计算值比较。

## 掌握检查

- [ ] 能从时钟树计算外设时钟。
- [ ] 能解释PWM周期、比较值和死区。
- [ ] 能完成ADC原始值到物理电压的换算。
- [ ] 能配置DMA方向、地址自增和数据宽度。
- [ ] 能判断SPI的CPOL/CPHA配置是否匹配器件手册。

上一章：[02-Cortex-M4与中断系统]({{ '/notes/cortex-m4-interrupts/' | relative_url }})  下一章：[04-FreeRTOS实时系统]({{ '/notes/freertos-realtime/' | relative_url }})
