---
layout: note
title: "RC 充放电与门限延时"
category: "硬件基础与电源"
level: "核心设计"
order: 63
permalink: /notes/rc充放电公式/
summary: "由一阶方程推导任意初值 RC 响应、门限延时、容差与负载影响。"
source: "笔记/硬件/公式相关/RC充放电公式"
---

# RC 充放电与门限延时

## 通用解与时间常数

把电容所见外部线性网络化为戴维南源 $V_\infty$ 和电阻 $R_{th}$，则 $C\,dv/dt=(V_\infty-v)/R_{th}$，解为：

$$
v(t)=V_\infty+[V(0)-V_\infty]e^{-t/\tau},\qquad \tau=R_{th}C.
$$

充电到终值的 50%、63.2%、86.5%、95.0%、99.3% 分别约需 0.693、1、2、3、5 个时间常数。原笔记中“5τ=98%”应为约 99.3%。$10$ kΩ 与 $1$ μF 对应 10 ms；10 kΩ 与 100 μF 对应 1 s。

## 门限延时推导

令 $v(t)=V_{th}$ 可得 $t=-\tau\ln[(V_{th}-V_\infty)/(V(0)-V_\infty)]$，要求门限位于初值和终值之间。0 V 经 10 kΩ/1 μF 充向 3.3 V，门限 2 V 时约需 9.32 ms；改成 5 V 电源则仅约 5.11 ms，所以时间常数相同不等于固定门限延时相同。

R、C 容差和门限分散要按最坏组合核算。若 R 为 ±1%、C 有 ±20% 初始偏差，尚未计偏压与温度时 $\tau$ 已约在标称值的 0.792～1.212 倍之间。RC 适合粗略延时，不应替代有精度要求的复位/时序监控。

## 负载、泄漏和重复上电

输出负载会同时改变终值和 $R_{th}$。以输入经 R 供电、节点并联负载 $R_L$ 为例，$V_\infty=V_sR_L/(R+R_L)$，$\tau=(R\parallel R_L)C$。输入漏电还会使门限偏移，甚至永远无法到达目标电压。

重复上电时电容可能尚未放空，$V(0)\ne0$，延时会缩短。若增加快速放电二极管，要核实掉电时的反灌路径与引脚允许电流。缓慢边沿进入普通数字输入也可能产生抖动和静态电流，应核对是否施密特输入。

## 测量

示波器同时记录源电压、电容节点与后级输出，测量门限 crossing 而非仅看波形“差不多到位”。检查探头输入电阻/电容对高阻 RC 的加载，并覆盖冷启动、热重启、棕断和不同断电间隔。

## 原始图示

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-032.png' | relative_url }}" alt="附件：Pasted image 20251103184809.png"><figcaption>Pasted image 20251103184809.png</figcaption></figure>

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-031.png' | relative_url }}" alt="附件：Pasted image 20251103183453.png"><figcaption>Pasted image 20251103183453.png</figcaption></figure>
