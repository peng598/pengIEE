---
layout: note
title: "眼图"
category: "测试与工程经验"
level: "进阶"
order: 2
permalink: /notes/eye-diagram/
summary: "用眼图观察高速链路抖动、噪声和码间串扰。"
source: "笔记/硬件/经验/示波器使用/眼图"
---

# 眼图

- 眼宽代表抖动与延迟 眼高就是噪声 
- 
- **时域传输（TDT）** / **眼图仿真**：
    
    - 这是**分析延迟影响的核心**。
        
    - **方法**：给驱动器一个伪随机码流（PRBS），在接收端观察信号。
        
    - **看什么**：
        
        1. **眼图张开度**：延迟导致的时序偏移会使“眼”的水平方向变窄（抖动增加）。
            
        2. **信号边沿**：是否因反射而变得缓慢或出现台阶，这会直接影响有效延迟。
            
        3. **时序裕量**：结合接收端的时序窗口，判断信号是否在正确的时间到达。

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-080.png' | relative_url }}" alt="附件：Pasted image 20251202085054.png"><figcaption>Pasted image 20251202085054.png</figcaption></figure>
<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-081.png' | relative_url }}" alt="附件：Pasted image 20251202085105.png"><figcaption>Pasted image 20251202085105.png</figcaption></figure>
