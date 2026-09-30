---
layout: note
title: "LDO 输出电容注意点"
category: "硬件基础与电源"
level: "基础"
order: 6
permalink: /notes/ldo-output-capacitor/
summary: "LDO 输出电容对环路稳定性、瞬态和纹波的影响。"
source: "笔记/硬件/02元器件/LDO/LDO 输出电容注意点"
---

# LDO 输出电容注意点

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-086.png' | relative_url }}" alt="附件：Pasted image 20251203200341.png"><figcaption>Pasted image 20251203200341.png</figcaption></figure>

ESR太小可能会导致不工作,具体见规格书;这也是为什么有些LDO输出要用大的电容 甚至是钽电容
