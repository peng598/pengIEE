---
layout: note
title: "8 Gbps 及以上链路设计"
category: "PCB与信号完整性"
level: "核心设计"
order: 32
permalink: /notes/工作速率大于8gbps/
summary: "以 UI、通道损耗和阻抗不连续评估高速链路，而非用单一速率划线。"
source: "笔记/硬件/其他/工作速率大于8Gbps"
---

# 8 Gbps 及以上链路设计

## 速率转换成可验证预算

8 Gbps NRZ 的 UI 为 125 ps，奈奎斯特频率为 4 GHz；有效边沿频谱还延伸到更高频。编码、调制和均衡不同，所需通道预算也不同，不能把 8 Gbps 作为是否需要连续参考地的分界线。任何足够快的边沿都应检查参考与不连续结构。

通道需同时评估插入损耗、回波损耗、串扰、模式转换和时延偏斜。PAM4 的码元率与比特率不同，不能直接沿用上述 NRZ 换算。

## 焊盘、过孔和残桩

宽焊盘增加局部电容，窄颈与过孔增加电感；连接器或 BGA 扇出区域需结合参考平面开窗、反焊盘与走线过渡做模型优化。不能机械禁止“从焊盘附近走线”，而应分析该信号所见的阻抗与参考变化。

四分之一波长残桩谐振可初估 $f_r\approx v/(4l)$。若等效波速为 150 mm/ns、残桩 5 mm，谐振约 7.5 GHz；这是简化值，实际过孔结构应由模型或测量确认。背钻需求取决于该共振相对通道频谱和损耗预算的位置。

## 调试与签核

使用与协议一致的发射预加重、接收均衡和测试码型，记录 BER、眼图、通道 S 参数及连接器状态。固定探头或夹具并去嵌，避免把测试结构损耗算到 PCB 上。参考平面连续、差分对对称和电源噪声控制要与长度匹配一起审查。

## 原始图示

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-049.png' | relative_url }}" alt="附件：Pasted image 20251114202958.png"><figcaption>Pasted image 20251114202958.png</figcaption></figure>

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-050.png' | relative_url }}" alt="附件：Pasted image 20251114203016.png"><figcaption>Pasted image 20251114203016.png</figcaption></figure>

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-051.png' | relative_url }}" alt="附件：Pasted image 20251114203028.png"><figcaption>Pasted image 20251114203028.png</figcaption></figure>

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-052.png' | relative_url }}" alt="附件：Pasted image 20251114203038.png"><figcaption>Pasted image 20251114203038.png</figcaption></figure>

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-053.png' | relative_url }}" alt="附件：Pasted image 20251114203101.png"><figcaption>Pasted image 20251114203101.png</figcaption></figure>

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-054.png' | relative_url }}" alt="附件：Pasted image 20251114203111.png"><figcaption>Pasted image 20251114203111.png</figcaption></figure>

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-055.png' | relative_url }}" alt="附件：Pasted image 20251114203131.png"><figcaption>Pasted image 20251114203131.png</figcaption></figure>

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-056.png' | relative_url }}" alt="附件：Pasted image 20251114203141.png"><figcaption>Pasted image 20251114203141.png</figcaption></figure>
