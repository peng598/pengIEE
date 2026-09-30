---
layout: note
title: "等长差分走线"
category: "PCB与信号完整性"
level: "进阶"
order: 6
permalink: /notes/differential-length-matching/
summary: "差分对等长和走线约束的快速笔记。"
source: "笔记/硬件/其他/等长差分走线"
---

# 等长差分走线

１\在高频信号，如USB　HDMI  屏幕接口MIPI LVDS 灯，数据是差分的．
２＼首先是差分能够增强抗干扰性，一条导线在传输的过程中，会产生电磁辐射，差分走的时候就刚好互相抵消，有助于通过EMC,同时差分走线是以单端信号为参考地，不易被干扰；当差分走线不等长的时候会产生信号延迟，
３＼在等长差分走线出现阻抗不匹配的时候，会产生反射，反射则会产生信号线在电平变换中出现振铃，振铃就是EMC最主要的原因,所以会在源端串电阻来消耗掉部分能量  见[源端匹配]({{ '/notes/源端匹配/' | relative_url }})  ,同时LAYOUT走线过长(见[天线效应]({{ '/notes/天线效应/' | relative_url }})),划分割(见[高频信号回流路径]({{ '/notes/high-frequency-return-path/' | relative_url }}))也会引起阻抗不匹配
