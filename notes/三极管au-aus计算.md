---
layout: note
title: "三极管AU,AUS计算"
category: "硬件基础与电源"
level: "核心设计"
order: 40
permalink: /notes/三极管au-aus计算/
summary: "先假设三极管工作在放大区,此时利用已知参数计算IEQ"
source: "笔记/硬件/02元器件/三极管/三极管AU,AUS计算"
---

# 三极管AU,AUS计算

## 静态工作点与小信号模型

先求直流工作点 $I_{CQ}$ 并验证放大区，再在该点线性化。$g_m=I_C/V_T$，$r_\pi=\beta/g_m$；室温 $I_C=1$ mA 时 $g_m\approx38.6$ mS，若 $\beta=100$，则 $r_\pi\approx2.59$ kΩ。温度与电流改变后，小信号参数也要更新。

共射极、射极充分交流旁路、忽略 Early 效应时，$A_u=v_o/v_b\approx-g_m(R_C\parallel R_L)$。未旁路射极电阻 $R_E$ 提供局部负反馈，可近似为 $A_u\approx-(R_C\parallel R_L)/(R_E+1/g_m)$，更精确分析应计入有限 $\beta$、$r_o$ 和偏置网络。

## 信号源到输出的总增益

输入电阻 $R_{in}\approx R_B\parallel[r_\pi+(\beta+1)R_E]$，总增益为 $A_{us}=A_uR_{in}/(R_s+R_{in})$。例如 $R_C\parallel R_L=2$ kΩ、$R_E=220\,\Omega$、$I_C=1$ mA，级内增益约 −8.14；若 $R_{in}=10$ kΩ、源电阻 2 kΩ，总增益仅约 −6.78。

该推导限于中频小信号。低频检查耦合/旁路电容，高频检查米勒效应与寄生电容。调试分别测源端、基极和输出幅度，避免把输入分压误判成晶体管增益不足；增加幅度直到刚出现削顶可验证工作点与可用动态范围。
<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-093.png' | relative_url }}" alt="附件：Pasted image 20251208092922.png"><figcaption>Pasted image 20251208092922.png</figcaption></figure>
