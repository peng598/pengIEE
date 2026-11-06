---
layout: note
title: "阻抗匹配"
category: "PCB与信号完整性"
level: "核心设计"
order: 11
permalink: /notes/impedance-matching/
summary: "推导反射系数、首波幅度与反射功率，区分数字端接和共轭功率匹配。"
source: "笔记/硬件/专业名词/阻抗匹配"
---

# 阻抗匹配：反射、功率与数字端接

## 反射系数的推导

在终端处，$V_L=V^++V^-$，$I_L=(V^+-V^-)/Z_0$。代入 $V_L=Z_LI_L$，得到 $\Gamma_L=V^-/V^+=(Z_L-Z_0)/(Z_L+Z_0)$。开路为 +1，短路为 −1，负载等于特性阻抗时为 0。对损耗可忽略且 $Z_0$ 为实数的线，反射功率与入射功率比为 $\lvert \Gamma\rvert^2$。

50 Ω 线接 100 kΩ 负载时 $\Gamma\approx0.999$，说明相对于入射波几乎全反射；接收端电压为 $(1+\Gamma)V^+$，约为入射波的两倍。不能把反射电压直接等同于信号源的开路电压。

## 首波与多次往返

初始发射波为 $V^+=V_s Z_0/(R_s+Z_0)$，源端反射系数为 $\Gamma_s=(R_s-Z_0)/(R_s+Z_0)$。返回波每完成一次往返，其幅度近似再乘 $\Gamma_s\Gamma_L$，并乘以线损因子。源端匹配可以让高阻接收端保留电压反射，同时消除后续往返。

示例：3.3 V 阶跃、50 Ω 线、10 Ω 驱动阻抗，首波为 2.75 V；理想开路终端首次达到 5.5 V。真实 IO 可能被 ESD 钳位限制，电压变低不代表风险消失，仍要核验钳位电流和注入能量。增加约 40 Ω 源端电阻可使初始波约为 1.65 V、终端首次到达约 3.3 V。

## 两种“匹配”不可混用

射频最大可用功率传输常讨论共轭匹配 $Z_L=Z_s^*$；无反射终端讨论 $Z_L=Z_0$。二者只有在相应实阻抗条件下才简化成相同数值。数字高阻输入通常重视电压门限与时序，并不追求接收器消耗最大信号功率。

无源衰减垫、串阻、Thevenin 终端、AC 终端和器件 ODT 都会改变幅度、功耗和频响。应根据点到点/多点、单双向、逻辑制式及频带选方案，不能只让电阻读数等于 50 Ω。

## 调试关注量

同时记录接收端过冲、下冲、阈值重复穿越、稳定时间和采样窗口。TDR 定位阻抗不连续，眼图/误码评估整条链路；二者覆盖的问题不同。测量参考面和探头加载必须写入记录，避免把测试夹具反射归因到 PCB。

## 原始图示

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-036.png' | relative_url }}" alt="附件：Pasted image 20251106150347.png"><figcaption>Pasted image 20251106150347.png</figcaption></figure>

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-037.png' | relative_url }}" alt="附件：Pasted image 20251106150407.png"><figcaption>Pasted image 20251106150407.png</figcaption></figure>
