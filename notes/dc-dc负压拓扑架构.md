---
layout: note
title: "DC-DC负压拓扑架构"
category: "硬件基础与电源"
level: "核心设计"
order: 52
permalink: /notes/dc-dc负压拓扑架构/
summary: "一个DC-DC,要变成负压输出,由原来BUCK,变成BUCK-BOOST结构"
source: "笔记/硬件/02元器件/DC-DC/DC-DC负压拓扑架构"
---

# DC-DC负压拓扑架构

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-035.png' | relative_url }}" alt="附件：Pasted image 20251103201005.png"><figcaption>Pasted image 20251103201005.png</figcaption></figure>

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-034.png' | relative_url }}" alt="附件：Pasted image 20251103200936.png"><figcaption>Pasted image 20251103200936.png</figcaption></figure>

## 将 Buck 控制器接成反相 Buck-Boost

若把原 Buck 输出节点定义为系统地、控制器地接负输出，可形成反相 Buck-Boost。该方法必须得到器件厂商支持：控制器实际承受的输入电压是 $V_{in}+\lvert V_o\rvert$，EN、PG、同步和调试接口也随负输出浮动，不能直接接系统地逻辑。

理想 CCM 中，电感导通阶段加 $V_{in}$，关断阶段加 $-\lvert V_o\rvert$，伏秒平衡给出 $\lvert V_o\rvert=V_{in}D/(1-D)$。由于输出只在关断区间接收电感电流，$I_{L,avg}=I_o/(1-D)$。例如 +12 V 转 −5 V/1 A，$D=5/17\approx0.294$，平均电感电流约 1.42 A，峰值还需加半个纹波；开关节点器件需考虑至少 17 V 的静态电压应力再叠加尖峰。

## 环路和调试边界

反相拓扑在 CCM 中具有右半平面零点：占空比增加先缩短向输出供能的时间，输出会暂时向相反方向变化。环路带宽应按厂商反相应用方法设计，不能直接沿用普通 Buck 的补偿。启动时浮动地变化也会影响使能门限和输入偏置电源。

测量分别记录相对系统地的输出以及相对控制器地的 VIN、EN、FB。示波器接地夹不可接到负输出形成意外短路；使用满足共模范围的差分探头。测试空载、预偏置、关机放电和短路恢复，核实所有接口引脚未超过相对其本地地的绝对最大额定值。
