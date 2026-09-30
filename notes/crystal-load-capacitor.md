---
layout: note
title: "晶振的匹配电容"
category: "硬件基础与电源"
level: "基础"
order: 10
permalink: /notes/crystal-load-capacitor/
summary: "晶振负载电容的计算与调试。"
source: "笔记/硬件/02元器件/晶振/晶振的匹配电容"
---

# 晶振的匹配电容

匹配电容关键点是要输入输出移相180  其中放大器的作用是为了保证震荡==不衰减==  寄生参数会让输出信号缓慢衰减

芯片内部结构

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-090.png' | relative_url }}" alt="附件：Pasted image 20251204201810.png"><figcaption>Pasted image 20251204201810.png</figcaption></figure>

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-091.png' | relative_url }}" alt="附件：Pasted image 20251204202047.png"><figcaption>Pasted image 20251204202047.png</figcaption></figure>

晶振两旁的电容,是在皮尔斯振荡电路中与放大器输出电阻构成RC充电使包括晶振在内的反馈环路发送180度移相,从而满足震荡条件

从而可以推论出,为什么有些晶振需要串联或者并联电阻

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-092.png' | relative_url }}" alt="附件：Pasted image 20251204202154.png"><figcaption>Pasted image 20251204202154.png</figcaption></figure>
