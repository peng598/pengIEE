---
layout: note
title: "ADC 分压电阻：热噪声与建立时间"
category: "硬件基础与电源"
level: "核心设计"
order: 14
permalink: /notes/adc-divider-noise/
summary: "推导分压热噪声、带宽与采样建立条件，并计算泄漏和比例误差。"
source: "笔记/硬件/05设计/ADC设计/常规分压电阻设计---热噪声"
---

# ADC 分压电阻：热噪声与建立时间

## 等效电阻和噪声密度

上臂 $R_1$、下臂 $R_2$，输入源在分析频段可视为低阻时，输出等效电阻 $R_{th}=R_1\parallel R_2$，空载比例 $k=R_2/(R_1+R_2)$。两个不相关电阻的输出噪声功率相加得到：

$$
e_n=\sqrt{4k_BT(R_1\parallel R_2)}\quad[\mathrm{V}/\sqrt{\mathrm{Hz}}],\qquad
v_{n,rms}=\sqrt{4k_BTR_{th}B_n}.
$$

这里 $B_n$ 是等效噪声带宽，不一定是 −3 dB 带宽。单极点 RC 有 $B_n=\pi f_c/2$。相同比例下把电阻放大 N 倍，在固定测量带宽内噪声增加 $\sqrt N$；若同时由同一固定电容限制带宽，积分到无限频率的理想结果趋于 $\sqrt{k_BT/C}$，不能继续套“噪声总是按 $\sqrt R$ 增长”。

## 数值例子

取 300 K、$R_1=20$ kΩ、$R_2=10$ kΩ，$R_{th}=6.67$ kΩ，噪声密度约 10.5 nV/√Hz。在 10 kHz 平坦噪声带宽内约 1.05 μV RMS；这远低于 12 位 3.3 V ADC 的 0.806 mV 码宽。此时更值得检查参考误差、输入漏电与采样电容充电，而不是盲目降低阻值。

12 V 经此分压会输出 4 V，不能直接接 3.3 V ADC；分压比例必须由最大输入和 ADC 允许范围决定。若改为 30 kΩ/10 kΩ，12 V 标称输出 3 V，还要计算输入过压与电阻容差的最坏组合。

## 泄漏、比例和采样窗口

输入漏电近似带来 $\Delta V=I_{leak}R_{th}$，应取全温最大值并计入 TVS、PCB 表面和模拟开关。20 kΩ/10 kΩ 网络若漏电 1 μA，误差约 6.67 mV，已超过 8 个 12 位码宽。

比例误差一阶近似 $\Delta k/k\approx(1-k)(\delta_2-\delta_1)$，其中 $\delta_i$ 为各电阻相对误差；匹配温漂网络往往比单独选低 TCR 更有效。采样建立需满足残差预算，增加滤波电容可以提供瞬态电荷，但通道切换和连续采样下仍应检查恢复时间。

## 设计与调试决策

先按输入范围和功耗定比例与总阻值，再检查全温泄漏、带宽、采样时间、噪声和保护钳位。缓冲放大器能降低 ADC 所见源阻抗，却不会消除分压器已有噪声，还会增加偏置、失调和自身噪声。

用已知源扫输入并比较不同采样时间；若延长采样后均值改善，先解决建立问题。固定输入记录噪声分布，同时记录参考电压和温度。高阻节点保持清洁，防护环的电位应与被保护节点匹配，不能一律接地。

## 原始图示

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-108.png' | relative_url }}" alt="附件：Pasted image 20260114151836.png"><figcaption>Pasted image 20260114151836.png</figcaption></figure>

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-109.png' | relative_url }}" alt="附件：Pasted image 20260114151907.png"><figcaption>Pasted image 20260114151907.png</figcaption></figure>

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-110.png' | relative_url }}" alt="附件：Pasted image 20260114151941.png"><figcaption>Pasted image 20260114151941.png</figcaption></figure>

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-111.png' | relative_url }}" alt="附件：Pasted image 20260114152324.png"><figcaption>Pasted image 20260114152324.png</figcaption></figure>

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-112.png' | relative_url }}" alt="附件：Pasted image 20260114152429.png"><figcaption>Pasted image 20260114152429.png</figcaption></figure>
