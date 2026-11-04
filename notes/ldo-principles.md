---
layout: note
title: "LDO原理"
category: "硬件基础与电源"
level: "核心设计"
order: 5
permalink: /notes/ldo-principles/
summary: "LDO 的基本结构、压差、稳定性与热设计。"
source: "笔记/硬件/02元器件/LDO/LDO原理"
---

# LDO原理

## 闭环稳压与热边界

LDO 通过误差放大器控制串联通路晶体管，使反馈电压接近基准。晶体管工作区由器件类型和输入、输出、电流共同决定，不能概括为“栅压始终只高于阈值一点”。输出干净程度由闭环增益、基准噪声、通路管寄生和输出网络共同决定。

忽略较小的地电流时，$P_{loss}\approx(V_{in}-V_o)I_o$、$\eta\approx V_o/V_{in}$。12 V 转 3.3 V/0.3 A 会耗散约 2.61 W；若有效热阻为 50 °C/W，估算温升达 130.5 °C，已不能仅凭“额定 300 mA”判断可用。5 V 转 3.3 V/0.3 A 则约 0.51 W，但仍需验证实际 PCB 散热。

## PSRR 与负载瞬态

$PSRR=20\log_{10}(V_{ripple,in}/V_{ripple,out})$；若指定频率处为 40 dB，100 mV 输入纹波对应理想线性小信号分量约 1 mV。该值随频率、压差、负载及电容变化，不能把低频 PSRR 外推到 MHz 开关尖峰。

负载突增初期，控制环尚未响应，输出电容承担差额电流：$\Delta V\approx\Delta I\,\Delta t/C+\Delta I\cdot ESR$。之后误差放大器恢复输出。通过同时观察输入、输出与负载电流，区分输入塌陷、环路振荡、限流和热保护；用负载边沿速度与探头带宽限定测试可比性。

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-082.png' | relative_url }}" alt="附件：Pasted image 20251203200144.png"><figcaption>Pasted image 20251203200144.png</figcaption></figure>

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-083.png' | relative_url }}" alt="附件：Pasted image 20251203200153.png"><figcaption>Pasted image 20251203200153.png</figcaption></figure>

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-084.png' | relative_url }}" alt="附件：Pasted image 20251203200202.png"><figcaption>Pasted image 20251203200202.png</figcaption></figure>
<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-085.png' | relative_url }}" alt="附件：Pasted image 20251203200213.png"><figcaption>Pasted image 20251203200213.png</figcaption></figure>
