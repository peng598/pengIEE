---
layout: note
title: "传感器与数字滤波"
category: "嵌入式系统"
level: "核心设计"
order: 9
permalink: /notes/sensors-digital-filtering/
summary: "传感器标定、单位换算、滤波、编码器回绕和数据采样。"
source: "soft/MCU基础知识/09-传感器与数字滤波"
---

# 传感器与数字滤波

## 1. 传感链路

```mermaid
flowchart LR
    PHYSICAL["角度/速度/电流/电压"] --> SENSOR["传感器"]
    SENSOR --> RAW["整数原始值"]
    RAW --> SCALE["比例和零偏换算"]
    SCALE --> FILTER["数字滤波"]
    FILTER --> EST["状态估计"]
    EST --> CONTROL["控制器"]
```

控制器无法区分“真实状态变化”和“传感器错误”。单位、方向、零偏或滤波错误会直接变成错误控制输出。

## 2. MPU6500寄存器配置

项目在 MPU6500.c 中配置：

| 寄存器 | 配置 | 含义 |
|---|---:|---|
| `PWR_MGMT_1` | `0x80`后`0x01` | 复位并选择时钟源 |
| `SIGNAL_PATH_RESET` | `0x07` | 复位传感路径 |
| `CONFIG` | `0x01` | 数字低通配置 |
| `GYRO_CONFIG` | `0x18` | 陀螺±2000 °/s |
| `ACCEL_CONFIG` | `0x10` | 加速度±8 g |
| `WHO_AM_I` | 期望`0x70` | 设备身份检查 |

实际含义必须以MPU6500数据手册位定义为准，不应只记十六进制数。

## 3. 大端原始数据组合

MPU6500先返回高字节：

```c
int16_t raw_x = (int16_t)((data[0] << 8) | data[1]);
```

为什么要转为 `int16_t`：原始数据使用二进制补码表示负数。若保存在 `uint16_t` 中，负角速度会被解释为很大的正数。

推荐避免移位整数提升歧义：

```c
int16_t MakeInt16(uint8_t high, uint8_t low)
{
    uint16_t raw = ((uint16_t)high << 8) | (uint16_t)low;
    return (int16_t)raw;
}
```

## 4. 陀螺零偏

理想静止角速度为0，但实际输出：

```text
gyro_measured = gyro_true + bias + noise
```

静止采样N次：

```c
float sum = 0.0f;
for(uint32_t i = 0U; i < sample_count; i++)
{
    sum += ReadGyroDps();
}
gyro_bias = sum / sample_count;
```

运行时：

```c
gyro_corrected = gyro_measured - gyro_bias;
```

校准条件：车辆静止、没有振动、传感器已完成上电稳定、采样覆盖足够时间。

## 5. 一阶低通滤波

项目大量使用：

```c
filtered += alpha * (input - filtered);
```

等价形式：

```text
y[k] = (1-alpha)y[k-1] + alpha·x[k]
```

| alpha | 响应 | 噪声 |
|---:|---|---|
| 接近1 | 快 | 滤波弱 |
| 接近0 | 慢 | 滤波强 |

按连续极点匹配得到的近似关系（不是所有频率下的精确数字 −3 dB 频率）：

```text
alpha = 1 - exp(-Ts/tau)
f_pole = 1/(2πtau) = -ln(1-alpha)/(2πTs)
```

### 例1：加速度滤波

`alpha=0.01, Ts=1 ms`：

```text
fc ≈ -ln(0.99)/(2π×0.001) ≈ 1.6 Hz
```

这是一种较强的低通，适合获得慢变化重力方向，但会引入明显延迟。

### 例2：陀螺滤波

`alpha=0.5, Ts=1 ms`：

```text
fc ≈ 110 Hz
```

响应较快，保留平衡控制所需动态。
> **重点：** alpha与采样周期绑定。周期从1 ms改到2 ms而alpha不变，截止频率会减半。
## 6. 初始化瞬态

如果滤波器初值为0，而真实输入为1 g：

```text
y[0]=0
y[1]=0.01
y[2]=0.0199
...
```

会产生长时间启动过渡。可在首次有效采样时直接赋值：

```c
if(!filter_initialized)
{
    filtered = input;
    filter_initialized = true;
}
else
{
    filtered += alpha * (input - filtered);
}
```

## 7. 互补滤波

互补滤波把两个频率特性互补的传感器合并：

- 陀螺：高频动态可信，低频会漂移。
- 加速度：低频重力方向可信，高频受振动和运动加速度影响。

```c
angle = alpha * (angle + gyro_rate * dt)
      + (1.0f - alpha) * angle_acc;
```

详细推导和项目参数见 [08-平衡车姿态与串级控制]({{ '/notes/balance-car-cascade-control/' | relative_url }})。

## 8. 编码器回绕

15位编码器范围0到32767。跨零点时直接相减会得到大错误。

```text
上一点32760，当前点5
直接差值 = 5 - 32760 = -32755
真实差值 = 13
```

通用回绕差分：

```c
int32_t EncoderDelta(uint16_t current, uint16_t previous)
{
    int32_t delta = (int32_t)current - (int32_t)previous;

    if(delta > 16384)
        delta -= 32768;
    else if(delta < -16384)
        delta += 32768;

    return delta;
}
```

这里半量程 16384 用于判断更短的旋转路径。前提是两次有效采样之间的机械位移绝对值严格小于半圈；恰好半圈时方向无法唯一判定，发生丢样后也要重新检查这一前提。

## 9. 差分测速

```text
speed_deg_s = delta_count × 360 / counts_per_rev / Ts
```

```c
float EncoderSpeed(int32_t delta, float dt)
{
    return delta * (360.0f / 32768.0f) / dt;
}
```

差分会放大位置量化噪声。即使位置只跳一个计数，除以很小的Ts后也会变成较大的瞬时速度。

项目使用两级滤波：

```c
Speed_filter += 0.25f * (Speed - Speed_filter);
Speed_filterA += 0.01f * (Speed_filter - Speed_filterA);
```

第一级保留电机速度环所需快速动态；第二级用于整车慢速环。

## 10. ADC电压换算

通用公式：

```text
Vpin = ADC × Vref / ADC_full_scale
Vin = Vpin × divider_ratio
```

误差来源：

- Vref不是精确3.300 V。
- 分压电阻存在误差。
- ADC增益和偏置误差。
- 电机PWM造成电源纹波。
- PCB地线压降。

校准方法：用万用表测真实电压，拟合：

```text
Vreal = gain × Vcalculated + offset
```

## 11. 电流采样

典型链路：

```text
相电流 → 采样电阻Rshunt → 运放增益G → ADC电压
```

若双向电流使用中点偏置：

```text
I = (Vadc - Voffset) / (Rshunt × G)
```

示例：`Rshunt=0.05 Ω`，增益20，1 A产生：

```text
Vsense = 1 × 0.05 × 20 = 1 V
```

必须确认闭源库使用的偏置、增益、ADC参考电压和符号。

## 12. 采样与混叠

当信号频率超过采样频率一半时，会产生混叠：高频噪声伪装成低频信号。

```text
Nyquist频率 = sample_rate / 2
```

数字滤波不能完全修复已经混叠的数据，因此传感器内部DLPF、模拟RC滤波和采样频率都要合理配置。

## 13. 校准数据校验

项目使用两级累加校验：

```c
sumcheck += data[i];
addcheck += sumcheck;
```

读取Flash后重新计算并比较，能检测许多单字节和顺序错误，但不如CRC具有明确的错误检测能力。

校准数据建议包含：

- 固定魔数。
- 数据结构版本号。
- 数据长度。
- 硬件版本。
- CRC32。
- 参数有效范围检查。

## 14. 精确频响、群延迟与抗混叠

一阶递推滤波器的传递函数为 $H(z)=\alpha/[1-(1-\alpha)z^{-1}]$。令 $a=1-\alpha$，则：

$
|H(e^{j\omega})|^2=\frac{\alpha^2}{1+a^2-2a\cos\omega}
$

若在 Nyquist 以内存在 −3 dB 点，则 $\cos\omega_{3dB}=1-\alpha^2/[2(1-\alpha)]$，$f_{3dB}=\omega_{3dB}/(2\pi T_s)$。例如 $\alpha=0.5,T_s=1\,ms$，数字 −3 dB 点约为 $115\,Hz$，前面的连续极点近似为 $110\,Hz$。当 $\alpha$ 很大时，全频段可能都未衰减到 −3 dB，不应继续使用近似式声称一个实际截止点。

低频群延迟为 $T_g\approx[(1-\alpha)/\alpha]T_s$；$\alpha=0.01$、$T_s=1\,ms$ 时约 $99\,ms$。两个一阶滤波串联时，低频延迟近似相加；平滑曲线可能因此牺牲控制相位裕量。估计到的延迟要计入闭环，而不只是观察“噪声变小”。

上述互补滤波必须把融合后的 angle 反馈到下一次预测；若 gyro_angle 独立无限积分、只在输出端与加速度角加权，陀螺零偏造成的长期漂移并未真正被反馈校正。滤波之前还应检查采样时间戳、饱和与新数据标志，重复读取旧样本不能提高有效采样率。

## 15. 标定误差与数据质量验收

电流换算 $I=(V_\mathrm{ADC}-V_0)/(R_sG)$ 中，零点误差造成近似常量误差 $\Delta I_0=\Delta V_0/(R_sG)$，电阻和增益误差则随电流放大。若 $R_s=50\,m\Omega,G=20$，$2\,mV$ 零点误差对应 $2\,mA$；电流接近零时，相对误差百分比会很大，应同时报告绝对误差。

标定至少区分静态零偏、比例、温漂和动态延迟。采集静止段统计均值/标准差，已知正负电流点拟合增益，升温后复测零点，并用阶跃/扫频检查相位。白噪声独立样本均值的标准差按 $1/\sqrt N$ 下降；有色噪声、温漂和连续重复样本不满足这一假设。

## 设计复核

1. 计算 `alpha=0.25, Ts=200 us` 的一阶滤波截止频率。
2. 写一个通用15位编码器回绕差分函数并测试边界。
3. 用静止数据计算陀螺均值、标准差和峰峰值。
4. 用万用表数据标定电池ADC的gain和offset。
5. 比较原始速度、一级滤波速度和二级滤波速度的延迟。

## 验收检查

- [ ] 验证传感器有符号字节组合、量程与数据更新标志。
- [ ] 分别标定零偏、比例、温漂，并保存不确定度条件。
- [ ] 使用精确/近似频响的对应范围核对截止频率和群延迟。
- [ ] 覆盖编码器回绕、最高转速和丢样后的差分边界。
- [ ] 对 ADC 电压/电流换算完成单位、增益和动态建立校核。

上一章：[08-平衡车姿态与串级控制]({{ '/notes/balance-car-cascade-control/' | relative_url }})  下一章：[10-串口-DMA与BLE协议]({{ '/notes/uart-dma-ble/' | relative_url }})
