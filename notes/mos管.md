---
layout: note
title: "MOS管"
category: "硬件基础与电源"
level: "核心设计"
order: 61
permalink: /notes/mos管/
summary: "来自 笔记/硬件/02元器件/MOS管/MOS管"
source: "笔记/硬件/02元器件/MOS管/MOS管"
---

# MOS管

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-014.png' | relative_url }}" alt="附件：Pasted image 20250513190927.png"><figcaption>Pasted image 20250513190927.png</figcaption></figure>
## 损耗模型与计算边界

导通损耗必须使用导通时段的电流平方积分：$P_{cond}=R_{DS(on),hot}\int_0^T i^2(t)dt/T$。矩形电流可化为 $I^2RD$；不要对全周期 RMS 电流再乘一次占空比。硬开关初估 $P_{sw}\approx V_{DS}I_D(t_r+t_f)f_s/2$，但二极管恢复、电容非线性及软开关会使误差较大。

例如高边管承受 24 V、3 A、导通占空比 0.25、热态电阻 30 mΩ、总交叠时间 30 ns、200 kHz，矩形近似导通损耗 0.0675 W，交叠损耗约 0.216 W。再加入 $E_{oss}f_s$、反向恢复等项，并注意这些能量项不能与已积分的开关损耗重复计入。

## 电热闭环

$R_{DS(on)}$ 随结温上升，先估损耗和结温，再更新热态电阻迭代；封装额定电流通常受理想散热条件约束。脉冲热过程使用瞬态热阻 $Z_\theta(t)$，稳态才用热阻。线性限流/热插拔须查 SOA 中二次击穿或热不稳定限制。

实测可用同步电压、电流波形计算 $\int v_{DS}i_Ddt$，必须校正两探头时延，几纳秒偏差就会显著改变开关能量。用相同输入、负载、温度和驱动电阻比较替代料；仅测外壳温度不能证明芯片热点安全。
