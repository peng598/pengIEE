---
layout: note
title: "DDR 接口：分组、约束与调试"
category: "PCB与信号完整性"
level: "核心设计"
order: 53
permalink: /notes/ddr/
summary: "按字节组、参考时钟和训练要求规划 DDR 连接与验证。"
source: "笔记/硬件/02元器件/DDR/DDR"
---

# DDR 接口：分组、约束与调试

## 按器件定义分组

DQ、DQS、DM/DBI 属于数据字节组，地址/命令、时钟和控制信号则有不同拓扑与时序约束。DQS0 通常对应哪个字节必须由控制器与存储器引脚表确认，不能把“高八位配 DQS0”当成固定规则；也不能把地址、控制和时钟简单设成一组绝对等长。

写入通常由控制器提供 DQS，读取由存储器提供 DQS；数据与选通信号的相对时序、训练能力和封装延时共同决定 PCB 约束。不同 DDR/LPDDR 代际、位宽与 rank 的参考设计不能直接混用。

## 从时间预算转换到长度

若传输速率为 3200 MT/s，单位间隔 UI=312.5 ps；这不是可全部分配给 PCB 的偏斜预算。扣除控制器输出误差、接收窗口、抖动、串扰及封装偏斜后，才得到布线剩余预算。若有效传播约 6 ps/mm，10 ps 的走线偏斜仅约 1.67 mm，且层间传播常数不同，物理等长未必电气等时。

蛇形等长应同时考虑自耦合、回流连续性和 DQS 差分平衡；不要仅追求 CAD 长度数字一致。VREF、终端及电源去耦对眼图同样重要。

## 验收

先按控制器指南检查拓扑、阻抗、字节交换许可与训练配置，再记录训练结果、裕量窗口和频率降额对故障的影响。测试温度、不同容量/厂商料号、全地址模式、刷新与低功耗退出。能启动系统不等于内存链路具备稳定裕量。

## 原始图示

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-061.png' | relative_url }}" alt="附件：Pasted image 20251125144841.png"><figcaption>Pasted image 20251125144841.png</figcaption></figure>

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-062.png' | relative_url }}" alt="附件：Pasted image 20251125150504.png"><figcaption>Pasted image 20251125150504.png</figcaption></figure>
