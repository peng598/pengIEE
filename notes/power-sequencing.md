---
layout: note
title: "多电源上电与掉电时序"
category: "硬件基础与电源"
level: "核心设计"
order: 13
permalink: /notes/power-sequencing/
summary: "把电源门限、复位、斜率、反灌和掉电恢复组合为可验证的时序。"
source: "笔记/硬件/05设计/上电时序/多电源上电时序"
---

# 多电源上电与掉电时序

## 时序不是只看使能先后

SoC/FPGA 规格可能约束电源先后、轨间最大电压差、斜率、单调性、时序间隔及复位释放点。直接用一条电源驱动另一芯片 EN，必须核对 EN 高低门限、耐压和第一路的爬升；1.2 V 轨不一定能可靠使能 3.3 V 器件。

LDO 与 DC-DC 的启动时间取决于软启动、电流限制和负载电容，不能按器件类型认定谁更快。PG 常为开漏并带去抖/延迟，其上拉电源必须在使用时已有效；未供电状态的 PG 行为也需确认。

## RC 与软启动计算

RC 延时应使用门限公式 $t=-RC\ln(1-V_{th}/V_{src})$，其误差包括 R、C、门限及电源幅度。重复上电时残余电压会缩短延时，参见 [RC 充放电]({{ '/notes/rc充放电公式/' | relative_url }})。精确顺序可采用监控/时序器，GPIO 控制则必须考虑 MCU 自己的启动依赖与默认状态。

负载开关充电电流约 $I=C_{load}\,dV/dt+I_{load}$。QOD 放电电阻与负载电容形成掉电斜率，但要核对其功率、允许电压及是否会与另一供电源争用。

## 验证矩阵

同时捕获所有关键电源、EN、PG 与 RESET，测量实际门限 crossing 之间的时间。覆盖冷启动、短暂断电、棕断、预偏置、任一路缺失和最大负载。掉电时经信号脚反灌可能使某轨停留在不确定电压，必须检查跨域接口。

原图中的 C349 属于具体板卡的启动调节参数；修改前应按所用控制器/负载开关的 CT 公式计算，不能把相同电容值直接迁移到另一器件。

## 原始图示

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-033.png' | relative_url }}" alt="附件：Pasted image 20251103191301.png"><figcaption>Pasted image 20251103191301.png</figcaption></figure>
