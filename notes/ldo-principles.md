---
layout: note
title: "LDO原理"
category: "硬件基础与电源"
order: 5
permalink: /notes/ldo-principles/
summary: "LDO 的基本结构、压差、稳定性与热设计。"
source: "硬件/02元器件/LDO/LDO原理.md"
---

# LDO原理

最简单的概括：MOS管的等效电阻分压，让输出的电压减少了　；这也是为什么LDO做不了大压降的现场，电阻分压有限，而且压差越大，发热越严重．

原理:误差放大器控制VGS电压,在VGS大于VTH且远仅大于VTH一点的时候,等效电阻会非常大,LDO就是利用这一点,来分压,让输入产生压降.同时,这也是为什么LDO纹波干净的原因.

<p class="attachment-note">附件未随公开版发布：Pasted image 20251203200144.png</p>

<p class="attachment-note">附件未随公开版发布：Pasted image 20251203200153.png</p>

<p class="attachment-note">附件未随公开版发布：Pasted image 20251203200202.png</p>
<p class="attachment-note">附件未随公开版发布：Pasted image 20251203200213.png</p>
