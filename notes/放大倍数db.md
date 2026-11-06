---
layout: note
title: "放大倍数与 dB"
category: "硬件基础与电源"
level: "核心设计"
order: 30
permalink: /notes/放大倍数db/
summary: "功率、电压分贝与绝对电平的换算，说明阻抗和测量基准。"
source: "笔记/硬件/公式相关/放大倍数dB"
---

# 放大倍数与 dB

## 比值的定义与阻抗条件

功率增益 $G_P=10\log_{10}(P_o/P_i)$。电压增益常定义为 $G_V=20\log_{10}\lvert V_o/V_i\rvert$，但它与功率增益相等需要输入输出阻抗条件相同。对实电阻 $P=V_{rms}^2/R$，可得 $G_P=20\log_{10}(V_o/V_i)+10\log_{10}(R_i/R_o)$。

因此 −3.0103 dB 对应功率一半；同阻抗时电压比为 $1/\sqrt2\approx0.7071$。电压减半为 −6.0206 dB。若阻抗不同，不能从电压减半直接推出功率减少四倍。

## dBm、dBV 与谱密度

dBm 以 1 mW 为基准：$P_{mW}=10^{P_{dBm}/10}$；dBV 以 1 V RMS 为基准。0 dBm 在 50 Ω 上对应 223.6 mV RMS，在 600 Ω 上则为 774.6 mV RMS。仪器显示的 dBm 转换成电压时必须知道端口阻抗和正弦/脉冲测量方式。

噪声密度 dBm/Hz 需积分带宽才能成为总噪声功率；白噪声近似增加 $10\log_{10}B$。改变 RBW 后噪声底变化并不一定意味着被测电路改变。

## 测试中的常见偏差

50 Ω 信号源面板幅度可能按 50 Ω 负载校准，接高阻示波器时电压可能加倍。测增益应记录输入实际电压而非只抄信号源设置。多级增益 dB 可相加，但压缩、限幅和带宽变化会破坏线性假设；先用小信号扫频，再测目标幅度的失真与裕量。

## 原始图示

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-021.png' | relative_url }}" alt="附件：Pasted image 20250529140737.png"><figcaption>Pasted image 20250529140737.png</figcaption></figure>

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-022.png' | relative_url }}" alt="附件：Pasted image 20250529140748.png"><figcaption>Pasted image 20250529140748.png</figcaption></figure>

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-023.png' | relative_url }}" alt="附件：Pasted image 20250529141630.png"><figcaption>Pasted image 20250529141630.png</figcaption></figure>
