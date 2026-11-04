---
layout: note
title: "高速信号串接电阻与并联电阻放置"
category: "PCB与信号完整性"
level: "核心设计"
order: 7
permalink: /notes/termination-resistor-placement/
summary: "根据源端、负载端与双向拓扑分析端接位置，给出反射和直流负载的计算。"
source: "笔记/硬件/经验/高速信号串接电阻与并联电阻放置"
---

# 端接电阻位置与拓扑选择

## 源端串联端接

理想点到点、接收端高阻的网络中，使 $R_{\mathrm{driver}}+R_s\approx Z_0$，可吸收负载返回的反射。电阻应靠近发送端，使驱动引脚到电阻之间的未端接短线在最快边沿下足够短。输出阻抗随电压、电流和工艺变化，应由 IBIS 或输出 I–V 曲线估计，而不是把最大输出电流除到电源电压上。

例如 50 Ω 线，驱动器在目标工作区的等效电阻约 18 Ω，可从 33 Ω 外接电阻开始验证。它不是无需测试的固定答案：过大的电阻会拖慢边沿，过小则保留负的源端反射系数。对多负载或中途采样点，源端端接可能出现持续一个往返延迟的台阶，需要额外分析。

## 负载端并联端接

端接置于互连电气终点，目的是使该端的等效阻抗接近 $Z_0$。电阻到接收引脚之间若形成较长支路，支路仍会反射。直流终端会加载驱动器，例如 3.3 V 对 50 Ω 下拉负载需要约 66 mA，很多 MCU 不具备这种连续驱动能力。

Thevenin 终端由上拉 $R_u$ 与下拉 $R_d$ 构成，交流等效阻抗 $R_u\parallel R_d$，偏置为 $V_{\mathrm{DD}}R_d/(R_u+R_d)$。除阻抗外还要验证逻辑电平、终端供电电流和断电倒灌。专用高速接口应遵循其规定的内部/外部终端方式。

## 双向网络不能默认“放中间”

双向点到点、开漏总线、多点总线与 DDR 的 ODT 策略各不相同。串阻放在几何中点通常会产生两个额外不连续点，不能同时保证两个发送方向的源端匹配。应先画出各工作状态下真正的发送端、负载端和高阻支路，再决定双端串阻、两端终端或动态 ODT。

## 验证闭环

同时观察发送端与接收端，核对首波幅度、$2t_d$ 回波间隔、最大过冲和稳定时间。以接收门限与采样时序验收，并在两个发送方向、驱动档位、电压温度角和最长连接条件下复测。

## 原始图示

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-063.png' | relative_url }}" alt="附件：Pasted image 20251125162437.png"><figcaption>Pasted image 20251125162437.png</figcaption></figure>

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-064.png' | relative_url }}" alt="附件：Pasted image 20251125162458.png"><figcaption>Pasted image 20251125162458.png</figcaption></figure>
