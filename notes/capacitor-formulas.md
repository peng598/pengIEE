---
layout: note
title: "电容公式"
category: "硬件基础与电源"
level: "基础"
order: 12
permalink: /notes/capacitor-formulas/
summary: "电容、电抗和储能的常用计算关系。"
source: "笔记/硬件/02元器件/电容/电容公式"
---

# 电容公式

==I=C*dU/dt==　，得知，==dU/dt=I/C==，故电容两端电压从0升到VDD时，取决于电流和电容的比值。容值一定时，电流越大，电压上升的越快。电流一定时，容值越小，电压上升的越快。

电容充放电，与输入电压无关
具体可见[RC充放电公式]({{ '/notes/rc充放电公式/' | relative_url }})

充电的快慢与电流有关

$τ = R × C$

τ值越小，充电越快，电容的电压上升就越快
