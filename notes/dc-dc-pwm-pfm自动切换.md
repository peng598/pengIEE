---
layout: note
title: "DC-DC PWM,PFM自动切换"
category: "硬件基础与电源"
level: "核心设计"
order: 51
permalink: /notes/dc-dc-pwm-pfm自动切换/
summary: "现代很多DC-DC芯片为了兼顾重载效率和轻载效率，采用了 “PWM/PFM自动切换模式”（也叫“节能模式”、“ECO模式”、“自动模式”）。"
source: "笔记/硬件/02元器件/DC-DC/DC-DC PWM,PFM自动切换"
---

# DC-DC PWM,PFM自动切换

现代很多DC-DC芯片为了兼顾重载效率和轻载效率，采用了 **“PWM/PFM自动切换模式”**（也叫“节能模式”、“ECO模式”、“自动模式”）。

PFM/省电模式通常通过降低平均开关频率或采用间歇脉冲包来减少轻载开关损耗；并非“提高频率节能”。具体脉冲宽度、峰值电流和模式名称由控制器实现决定。

强制 PWM 可以保持近似固定频率，并可能允许负电感电流；自动模式可在轻载转入跳脉冲、PFM 或突发模式。不能仅凭 PWM/PFM 标签判断负电流、频谱和瞬态性能。

## 模式切换的量化判断

同步 Buck 在二极管仿真模式下，当 $I_o\lesssim\Delta I_L/2$ 时电感电流有机会降到零，常成为省电模式的边界附近，但实际控制器还可能使用独立阈值和迟滞。轻载损耗可拆为静态功耗 $V_{in}I_q$、栅极驱动 $Q_gV_gf_s$ 与每周期开关能量 $E_{sw}f_s$；减少脉冲次数主要降低后两项。

例如 $Q_g=10$ nC、驱动 5 V、500 kHz 时，单路栅驱动功耗约 25 mW，对数瓦输出影响不大，对 10 mW 待机负载却不可忽略。PFM 的脉冲包会使低频纹波及可闻声增加，敏感 ADC、音频或 RF 电源应结合频谱预算决定是否强制 PWM。

验收时缓慢扫负载观察模式迟滞，再做跨越切换点的负载阶跃；同时记录 SW 脉冲间隔、最低输出电压、纹波频谱和电感声噪。示波器采样窗口需覆盖毫秒级突发间隔，不能只截取几个开关周期。

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-096.png' | relative_url }}" alt="附件：Pasted image 20251208104235.png"><figcaption>Pasted image 20251208104235.png</figcaption></figure>
<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-097.png' | relative_url }}" alt="附件：Pasted image 20251208104245.png"><figcaption>Pasted image 20251208104245.png</figcaption></figure>
