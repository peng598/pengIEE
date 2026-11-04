---
layout: note
title: "晶振负载电容与起振裕量"
category: "硬件基础与电源"
level: "核心设计"
order: 10
permalink: /notes/crystal-load-capacitor/
summary: "负载电容的等效计算、频率牵引、负阻裕量与调试方法。"
source: "笔记/硬件/02元器件/晶振/晶振的匹配电容"
---

# 晶振负载电容与起振裕量

## 负载电容并非任意两只相等电容

Pierce 振荡器的晶体两端通常各有一只对地电容。常用近似 $C_L=C_1C_2/(C_1+C_2)+C_{stray}$，其中寄生项包含引脚、封装和 PCB；不同厂商对内部电容的计入方式不同。若 $C_1=C_2=C$，则 $C\approx2(C_L-C_{stray})$。例如晶体指定 12 pF、估计总寄生 3 pF，可从两只 18 pF 开始，再实测牵引与起振。

两电容与晶体、放大器输出阻抗共同决定回路相位和增益，不能把它们单独当成固定 180° 移相器。对小动电容近似，负载谐振频率 $f_L\approx f_s\sqrt{1+C_m/(C_0+C_L)}$；增加负载电容通常使频率向串联谐振靠近，同时可能降低起振裕量。

## 电阻的不同作用

跨放大器输入输出的大电阻常用于设置直流工作点；串联小电阻可限制晶体驱动等级和改变环路增益。数值应依据芯片推荐与负阻测量，不能仅凭波形振幅随意增减。串入测试电阻寻找临界起振点的方法需按芯片厂商流程进行，并在最低电压、冷热和多次启动下确认。

## 验证条件

频率误差预算包括初始容差、温漂、老化、负载牵引和电源影响；测量仪器时基误差也应足够小。用低电容探头、缓冲输出或非接触方法测量，记录探头接入前后是否改变启动。量产替换晶体时，即使频率和封装相同，也要重新检查 $C_L$、ESR、驱动等级和寄生电容。

## 原始图示

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-090.png' | relative_url }}" alt="附件：Pasted image 20251204201810.png"><figcaption>Pasted image 20251204201810.png</figcaption></figure>

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-091.png' | relative_url }}" alt="附件：Pasted image 20251204202047.png"><figcaption>Pasted image 20251204202047.png</figcaption></figure>

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-092.png' | relative_url }}" alt="附件：Pasted image 20251204202154.png"><figcaption>Pasted image 20251204202154.png</figcaption></figure>
