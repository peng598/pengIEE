---
layout: note
title: "信号在PCB板上的传输速度与延时"
category: "PCB与信号完整性"
level: "基础"
order: 3
permalink: /notes/pcb-propagation-delay/
summary: "PCB 介质中的传播速度、延时和长度估算。"
source: "笔记/硬件/01信号完整性/信号在PCB板上的传输速度与延时"
---

# 信号在PCB板上的传输速度与延时

微带线与带状线传输延迟不一样,同组高速信号走线需要同一层走线,且相同层走线长度要尽量一致;

计算出来的阻抗走线宽度只是减少信号反射,不能解决信号的传输速率;

传输延迟的原因是因为电场的介质不一样,可以理解为:等效模型上([传输线理论]({{ '/notes/传输线理论/' | relative_url }}))L和C的值不一样,导致信号延迟不一样

介质不一样可以延申到板材选型,以及基板的工艺上,见[工作速率大于8Gbps]({{ '/notes/工作速率大于8gbps/' | relative_url }})的板材要求

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-075.png' | relative_url }}" alt="附件：Pasted image 20251201145333.png"><figcaption>Pasted image 20251201145333.png</figcaption></figure>
<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-076.png' | relative_url }}" alt="附件：Pasted image 20251201145341.png"><figcaption>Pasted image 20251201145341.png</figcaption></figure>
<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-077.png' | relative_url }}" alt="附件：Pasted image 20251201145353.png"><figcaption>Pasted image 20251201145353.png</figcaption></figure>
<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-078.png' | relative_url }}" alt="附件：Pasted image 20251201145403.png"><figcaption>Pasted image 20251201145403.png</figcaption></figure>
