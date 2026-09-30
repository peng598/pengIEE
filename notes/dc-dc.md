---
layout: note
title: "DC-DC"
category: "硬件基础与电源"
level: "进阶"
order: 50
permalink: /notes/dc-dc/
summary: "基本拓扑图"
source: "笔记/硬件/其他/DC-DC"
---

# DC-DC

基本拓扑图
画出BOOST 和BUCK最基本原理图

LAYOUT关键
输入环路，输出环路，尽量减少打孔．过孔会有寄生电容，关键是环路要小，这样就能减少开关时候的振铃，从而减少EMI辐射

布局
电源放在电源区域,防止对信号线干扰

功率计算
输入功率 P出=P入  * 效率

FB反馈电压
反馈电压接负载端，远端负载

散热

电感
屏蔽电感不用开窗，非屏蔽需要
