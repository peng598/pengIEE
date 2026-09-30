---
layout: note
title: "阻抗匹配"
category: "PCB与信号完整性"
level: "进阶"
order: 11
permalink: /notes/impedance-matching/
summary: "阻抗匹配、功率传输和数字信号端接。"
source: "笔记/硬件/专业名词/阻抗匹配"
---

# 阻抗匹配

反射系数:
<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-036.png' | relative_url }}" alt="附件：Pasted image 20251106150347.png"><figcaption>Pasted image 20251106150347.png</figcaption></figure>

反射电压:
<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-037.png' | relative_url }}" alt="附件：Pasted image 20251106150407.png"><figcaption>Pasted image 20251106150407.png</figcaption></figure>

- **阻抗匹配**：当传输线的终端负载阻抗（Z_L）等于其特性阻抗（Z₀）时，能量会被负载完全吸收，没有反射。这是信号完整性的理想状态。
    
    - `Z_L = Z₀` → 无反射，能量被吸收。
        
- **阻抗失配**：当终端负载阻抗不等于特性阻抗时，部分能量或全部能量会被反射回去。
    
    - **反射系数（Γ）** 公式：`Γ = (Z_L - Z₀) / (Z_L + Z₀)`

100kΩ电阻作为终端
- **特性阻抗 Z₀** ≈ 50Ω
    
- **负载阻抗 Z_L** = 100,000Ω
    
- **计算反射系数**：  
    `Γ = (100000 - 50) / (100000 + 50) ≈ 99950 / 100050 ≈ 0.999`  
    **Γ ≈ 1**（非常接近完全正反射）
    

**Γ = 1 意味着什么？**  
这意味着
- **全部电压**都会被反射回来。
- **反射电压的极性**与入射电压相同。
