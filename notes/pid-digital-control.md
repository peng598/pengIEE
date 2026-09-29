---
layout: note
title: "PID与数字控制"
category: "嵌入式系统"
order: 6
permalink: /notes/pid-digital-control/
summary: "离散 PID、积分抗饱和、控制环结构与调参实践。"
source: "soft/MCU基础知识/06-PID与数字控制.md"
---

# PID与数字控制

## 1. 反馈控制基本结构

```mermaid
flowchart LR
    R["目标 r"] --> SUM["误差 e=r-y"]
    Y["反馈 y"] --> SUM
    SUM --> C["控制器"]
    C --> U["控制输出 u"]
    U --> P["被控对象"]
    P --> Y
```

控制器根据目标与反馈的误差产生输出。平衡车中有多个嵌套反馈环：角度环、车速环、电机速度环和电流环。

## 2. P、I、D作用

连续形式：

```text
u(t) = Kp·e(t) + Ki·∫e(t)dt + Kd·de(t)/dt
```

| 项 | 作用 | 过大时现象 |
|---|---|---|
| P | 当前误差立即产生纠正 | 振荡、噪声放大 |
| I | 消除长期静差 | 积分饱和、低频摆动 |
| D | 根据变化趋势提供阻尼 | 对噪声敏感、输出抖动 |

## 3. 离散PID

程序每隔固定采样周期 `Ts` 运行一次：

```text
I[k] = I[k-1] + Ki × Ts × e[k]
D[k] = Kd × (e[k] - e[k-1]) / Ts
u[k] = Kp × e[k] + I[k] + D[k]
```

常见实现会把 `Ts`预先乘进Ki，把 `1/Ts`预先乘进Kd：

```text
Ki_discrete = Ki_continuous × Ts
Kd_discrete = Kd_continuous / Ts
```
> **重点：> 本项目的 `PID_Adjust()` 直接执行 `integral += error * Ki`，代码中没有显式Ts。因此参数Ki已经隐含当前调用周期。改变任务或控制环频率后，必须重新换算Ki。**
## 4. 位置式PI例程

```c
typedef struct
{
    float kp;
    float ki;
    float integral;
    float output_min;
    float output_max;
} PI_t;

static float Clamp(float value, float min_value, float max_value)
{
    if(value > max_value) return max_value;
    if(value < min_value) return min_value;
    return value;
}

float PI_Update(PI_t *pi, float target, float feedback)
{
    float error = target - feedback;
    float proportional = pi->kp * error;

    pi->integral += pi->ki * error;
    pi->integral = Clamp(pi->integral,
                         pi->output_min,
                         pi->output_max);

    return Clamp(proportional + pi->integral,
                 pi->output_min,
                 pi->output_max);
}
```

参数含义：

| 参数 | 含义 |
|---|---|
| `kp` | 每单位误差产生多少立即输出 |
| `ki` | 每次调用把多少误差累积进积分 |
| `integral` | 历史误差记忆，是控制器状态 |
| `output_min/max` | 执行器允许的输出范围 |

## 5. 积分饱和

如果执行器最大只能输出1 A，但误差长期很大，积分仍持续增长：

```text
要求输出5 A
实际只能输出1 A
积分继续从1累积到10、20、30
误差反向后仍需很久才能释放积分
```

这会造成严重过冲。常见anti-windup方法：

### 积分限幅

```c
integral = Clamp(integral, integral_min, integral_max);
```

### 条件积分

```c
float unsaturated = proportional + integral;

if((unsaturated < output_max && unsaturated > output_min) ||
   (unsaturated >= output_max && error < 0.0f) ||
   (unsaturated <= output_min && error > 0.0f))
{
    integral += ki * error;
}
```

只有未饱和，或误差方向有助于退出饱和时才积分。

## 6. D项的两种实现

对误差微分：

```text
D = Kd × (error - previous_error)
```

目标突然变化时会产生Derivative Kick。另一种是对测量值微分：

```text
D = -Kd × (feedback - previous_feedback)
```

平衡车直立环可以直接使用陀螺角速度：

```c
D_out = gyro_rate * Kd;
```

它相当于直接测得角度变化率，省去角度差分并降低差分噪声。
> **说明：> D项正负号取决于传感器方向、误差定义和控制输出方向。不能只看公式，必须验证小车前倾时输出是否驱动车轮向前追赶重心。**
## 7. 一阶滤波D项

```c
derivative_raw = feedback - previous_feedback;
derivative_filtered += alpha *
    (derivative_raw - derivative_filtered);
```

`alpha`越大跟随越快、滤波越弱；越小越平滑、延迟越大。滤波与采样周期共同决定实际截止频率。

## 8. 本项目PID参数

参数位于 `Control.c` 的 `parameters_Init()`。

| 控制器 | Kp | Ki | Kd | 主要输出 |
|---|---:|---:|---:|---|
| `SpeedPID` | 1.25 | 0.0015 | 0 | 平衡车速度补偿 |
| `TurnPID` | 1.0 | 0 | 5或10 | 左右差速转向量 |
| `UprightPID` | 100 | 0 | 10 | 直立速度目标 |
| `M1/M2SpeedPID` | 0.001 | Kp/50 | 0 | Iq电流目标，约±1 A |
| `M1/M2 Id PID` | 0.1 | Kp/10 | 0 | Vd |
| `M1/M2 Iq PID` | 0.5 | Kp/10 | 0 | Vq |

这些数值只在当前机械结构、电机、采样周期、单位和滤波配置下有意义，不能横向比较数值大小。

## 9. 串级控制的带宽顺序

内环必须比外环快：

```text
电流环 > 电机速度环 > 直立/转向环 > 整车速度环
```

原因是外环把内环近似看成一个能快速跟随的执行器。如果内环太慢，外环会基于错误假设继续增大输出，造成振荡。

经验上相邻环带宽可相差3到10倍，但最终要结合系统模型和实测。

## 10. 调参顺序

### 电流环

1. 架空电机并限制最大电流和电压。
2. 先调Iq/Id的Kp，使响应变快但不高频振荡。
3. 再增加Ki消除静差。
4. 检查不同电角度和转速下的电流波形。

### 电机速度环

1. 电流环稳定后再调速度环。
2. 先Ki设0，增加Kp到响应足够快但不振荡。
3. 增加少量Ki消除负载静差。
4. 检查限流是否频繁触发。

### 直立环

1. 关闭速度环积分和遥控输入。
2. 增大Kp直到小车有明显扶正能力。
3. 增加Kd抑制快速摆动。
4. 方向错误时先修正符号，不要靠负增益碰运气。

### 整车速度环

1. 直立环稳定后启用。
2. 从小Kp开始抑制位置漂移。
3. 少量Ki用于克服重心偏差和地面阻力。
4. 速度环过强会与直立环争夺控制量，产生慢速前后摆动。

## 11. 限幅层次

合理控制器通常具有多级限制：

```text
遥控目标限幅
→ 速度环输出限幅
→ 电流目标限幅
→ Vd/Vq限幅
→ PWM占空比和母线电压物理限制
```

每一级限幅都应有明确物理意义。只在最终PWM处截断而不做anti-windup，会导致上层积分持续累积。

## 12. 单位检查

调试PID前先写出每个量的单位：

| 变量 | 可能单位 |
|---|---|
| 倾角 | degree |
| 陀螺角速度 | degree/s |
| 编码器速度 | degree/s |
| Iq目标 | ampere或归一化电流 |
| Vq | volt或归一化电压 |

如果单位变化10倍，等效Kp通常也要相应变化10倍。

## 本章练习

1. 把连续积分增益 `Ki=2 /s` 换算到1 ms离散周期。
2. 给项目 `PID_Adjust()` 增加条件积分anti-windup。
3. 记录阶跃目标下的上升时间、过冲、稳态误差和饱和时间。
4. 把速度环调用周期从200 us改为400 us，计算保持相同连续Ki时离散Ki如何调整。

## 掌握检查

- [ ] 能写出连续和离散PID公式。
- [ ] 知道Ki、Kd与采样周期的关系。
- [ ] 能解释积分饱和和至少两种anti-windup方法。
- [ ] 能按内环到外环顺序调参。
- [ ] 能为每个控制量标注物理单位。

上一章：[05-实时并发与数据安全]({{ '/notes/realtime-concurrency/' | relative_url }})  下一章：[07-FOC无刷电机控制]({{ '/notes/foc-motor-control/' | relative_url }})
