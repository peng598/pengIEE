---
layout: note
title: "LDO 输出电容注意点"
category: "硬件基础与电源"
level: "核心设计"
order: 6
permalink: /notes/ldo-output-capacitor/
summary: "LDO 输出电容对环路稳定性、瞬态和纹波的影响。"
source: "笔记/硬件/02元器件/LDO/LDO 输出电容注意点"
---

# LDO 输出电容注意点

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-086.png' | relative_url }}" alt="附件：Pasted image 20251203200341.png"><figcaption>Pasted image 20251203200341.png</figcaption></figure>

## ESR 的作用必须结合具体补偿结构

某些传统 LDO 利用输出电容的 ESR 零点补偿输出极点，因此规定 ESR 上下限；许多现代陶瓷电容稳定型 LDO 已采用内部补偿，不需要人为加大 ESR。不能把“ESR 太小会振荡”当作所有 LDO 的规则。

一阶估算的输出极点为 $f_p\approx1/(2\pi R_{load}C_o)$，ESR 零点为 $f_z=1/(2\pi ESR\,C_o)$，但通路管输出阻抗及内部极点也参与环路。例如 10 μF、0.2 Ω 的 ESR 零点约 79.6 kHz，换成 0.01 Ω 陶瓷后移至约 1.59 MHz，是否仍稳定取决于内部补偿。

容量约束应使用工作电压、温度和容差后的有效容量。标称 10 μF 的 MLCC 在直流偏置下可能显著降容，须读具体料号曲线。并联电解、长走线或远端大电容都可能增加额外极点和谐振。

调试覆盖空载、最小稳定负载、满载、最小压差及冷热温度；轻载振铃尤其不能遗漏。负载阶跃后持续等幅振荡提示稳定性问题，而瞬时尖峰也可能由探头回路或 ESR 引起。更换输出电容后必须复测启动和关断，确认未增加反灌电流。

## 有效容量如何变成可测的瞬态要求

假设某 22 μF MLCC 在工作偏压下只剩标称值的 55%，再取 −20% 容差，则未计温度和老化时 $C_{eff}=22\times0.55\times0.8=9.68$ μF。若负载突增 100 mA，前 10 μs 近似全由电容供电，ESR 为 10 mΩ，则 $\Delta V\approx0.1\times10\,\mu s/9.68\,\mu F+0.1\times0.01\approx104$ mV。

若该初始时段只允许下降 50 mV，按同一模型需要 $C_{eff}\ge\Delta I\,\Delta t/(\Delta V_{max}-\Delta I\,ESR)\approx20.4$ μF。这里的 55%、10 μs 都是算例假设，必须由具体偏压曲线和控制环实测替换；实际电容电流是“负载变化减去通路器件补充电流”，积分值未必恒定。

阶跃测试需记录电流的 10%～90% 边沿、线缆电感和电容位置，分别读出瞬时 ESR/ESL 跳变与后续下降斜率。若增容后下降改善但恢复振铃更严重，说明储能和稳定性是两个约束，不能用更大电容继续盲目补偿。
