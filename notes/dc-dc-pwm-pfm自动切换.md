---
layout: note
title: "DC-DC PWM,PFM自动切换"
category: "硬件基础与电源"
level: "进阶"
order: 51
permalink: /notes/dc-dc-pwm-pfm自动切换/
summary: "现代很多DC-DC芯片为了兼顾重载效率和轻载效率，采用了 “PWM/PFM自动切换模式”（也叫“节能模式”、“ECO模式”、“自动模式”）。"
source: "笔记/硬件/02元器件/DC-DC/DC-DC PWM,PFM自动切换"
---

# DC-DC PWM,PFM自动切换

现代很多DC-DC芯片为了兼顾重载效率和轻载效率，采用了 **“PWM/PFM自动切换模式”**（也叫“节能模式”、“ECO模式”、“自动模式”）。

PFM模式:提高工作频率,可以有效降低在轻载情况下的功耗问题

一般只有PWM模式的DC-DC轻载情况下会进入**跳周期模式**,详见DC-DC轻载时跳周期模式(突发模式)

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-096.png' | relative_url }}" alt="附件：Pasted image 20251208104235.png"><figcaption>Pasted image 20251208104235.png</figcaption></figure>
<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-097.png' | relative_url }}" alt="附件：Pasted image 20251208104245.png"><figcaption>Pasted image 20251208104245.png</figcaption></figure>
