---
layout: note
title: "信号在PCB板上的传输速度与延时"
category: "PCB与信号完整性"
level: "核心设计"
order: 3
permalink: /notes/pcb-propagation-delay/
summary: "分层计算 PCB、过孔及封装的传播延迟，区分相位延迟、群时延与几何等长。"
source: "笔记/硬件/01信号完整性/信号在PCB板上的传输速度与延时"
---

# 信号在PCB板上的传输速度与延时

微带线与带状线传输延迟不一样,同组高速信号优先保持可控的层与过孔结构，并以控制器要求的总传播延迟约束各信号；

计算出来的阻抗走线宽度只是减少信号反射,不能解决信号的传输速率;

传输延迟的原因是因为电场的介质不一样,可以理解为:等效模型上([传输线理论]({{ '/notes/传输线理论/' | relative_url }}))L和C的值不一样,导致信号延迟不一样

介质不一样可以延申到板材选型,以及基板的工艺上,见[工作速率大于8Gbps]({{ '/notes/工作速率大于8gbps/' | relative_url }})的板材要求

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-075.png' | relative_url }}" alt="附件：Pasted image 20251201145333.png"><figcaption>Pasted image 20251201145333.png</figcaption></figure>
<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-076.png' | relative_url }}" alt="附件：Pasted image 20251201145341.png"><figcaption>Pasted image 20251201145341.png</figcaption></figure>
<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-077.png' | relative_url }}" alt="附件：Pasted image 20251201145353.png"><figcaption>Pasted image 20251201145353.png</figcaption></figure>
<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-078.png' | relative_url }}" alt="附件：Pasted image 20251201145403.png"><figcaption>Pasted image 20251201145403.png</figcaption></figure>

## 延迟的量纲与分层计算

准 TEM 近似下，$v=c/\sqrt{\varepsilon_{\mathrm{eff}}}$，$\tau_\ell=\sqrt{\varepsilon_{\mathrm{eff}}}/c$。例如 $\varepsilon_{\mathrm{eff}}=4$ 时，每毫米约 6.67 ps、每厘米约 66.7 ps、每米约 6.67 ns。不要把 ps/mm、ps/cm 与 ps/mil 混用。

若一条路径在外层走 50 mm（5.5 ps/mm）、内层走 40 mm（6.5 ps/mm），仅走线延迟为 $50\times5.5+40\times6.5=535$ ps。另一条几何长度同为 90 mm 但全在内层，延迟为 585 ps，相差 50 ps。还需加入封装、过孔及连接器的贡献。因此同层布线有利于简化约束，但不是保证等延迟的充分条件。

## 色散与群时延

对宽带信号，传播常数的相位项为 $\beta(\omega)$，群时延为 $\tau_g=-d\angle S_{21}/d\omega$。介质色散、连接器谐振与过孔残桩会使不同频率成分延迟不同，从而产生波形展宽和 ISI。把走线变成正确阻抗可以减少失配反射，却不能自动消除损耗或色散。

测延迟时先扣除探头和线缆的通道偏斜。对边沿使用同一幅值定义和同一测量位置；对高速通道可从去嵌后的 S 参数观察群时延与相位连续性。最终以采样窗口/眼图判定，不能只比较布线工具中的长度数字。
