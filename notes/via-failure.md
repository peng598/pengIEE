---
layout: note
title: "过孔失效"
category: "PCB与信号完整性"
level: "核心设计"
order: 15
permalink: /notes/via-failure/
summary: "过孔失效模式、热应力和制造可靠性。"
source: "笔记/硬件/PCB工艺及相关问题/过孔失效"
---

# 过孔失效

PCB在用户端使用一段时候后，出现个别孔开路；

疑问扩展:
[PCB寿命影响有哪些原因]({{ '/notes/pcb-life-factors/' | relative_url }});怎么增加寿命;三防漆,灌胶是不是从什么方向去保护的

原因分析：

针对某PCB板通孔孔铜断裂的情况，本文通过[剖面分析](https://zhida.zhihu.com/search?content_id=230535923&content_type=Article&match_order=1&q=%E5%89%96%E9%9D%A2%E5%88%86%E6%9E%90&zhida_source=entity)、热性能分析、吸水率验证等分析手段查找分析[失效原因](https://zhida.zhihu.com/search?content_id=230535923&content_type=Article&match_order=1&q=%E5%A4%B1%E6%95%88%E5%8E%9F%E5%9B%A0&zhida_source=entity)，分析结果显示，导致该失效样品通孔孔铜断裂的原因为：板材的[耐热性](https://zhida.zhihu.com/search?content_id=230535923&content_type=Article&match_order=1&q=%E8%80%90%E7%83%AD%E6%80%A7&zhida_source=entity)不足，加之通孔在电镀铜工艺存在问题，使铜晶粒异常，导致孔铜的抗拉强度和延伸能力严重不足，在焊接组装受热过程中，孔铜易受[应力开裂](https://zhida.zhihu.com/search?content_id=230535923&content_type=Article&match_order=1&q=%E5%BA%94%E5%8A%9B%E5%BC%80%E8%A3%82&zhida_source=entity)。

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-001.png' | relative_url }}" alt="附件：1759998489305.png"><figcaption>1759998489305.png</figcaption></figure>
<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-002.jpg' | relative_url }}" alt="附件：1759998507940.jpg"><figcaption>1759998507940.jpg</figcaption></figure>
<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-003.jpg' | relative_url }}" alt="附件：1759998534305.jpg"><figcaption>1759998534305.jpg</figcaption></figure>

### 1. 电化学迁移（ECM）—— 最主要和常见的原因

这是过孔失效的“头号杀手”，尤其是在非理想的应用环境中。

- **过程**：
    
    1. **污染物**：PCB在制造或组装过程中，如果清洗不彻底，表面或层压板内部可能会残留离子性污染物（如助焊剂、指纹、灰尘中的盐分）。
        
    2. **潮湿**：环境湿气被PCB吸收，在电压作用下，这些离子污染物会在水中电离，形成电解质。
        
    3. **迁移**：在直流电场的作用下，金属离子（主要是铜离子Cu²⁺）从阳极（高电势）通过电解质向阴极（低电势）迁移。
        
    4. **枝晶生长**：铜离子在阴极还原成金属铜，并逐渐堆积，形成树突状或须状的铜枝晶。
        
    5. **短路与腐蚀**：这些枝晶会生长在过孔的内壁之间，首先可能引起绝缘电阻下降和轻微短路。更严重的是，**生长过程会消耗过孔孔壁上的铜**，导致铜层变薄，最终完全断裂，造成开路。
        
- **表象**：通常伴随着电路板绝缘性能下降，可能先出现信号异常，然后才完全开路。
    

### 2. 热应力与热疲劳

过孔，尤其是连接大功率器件或平面层的过孔，会因电流和环境温度变化而经历反复的热胀冷缩。

- **过程**：
    
    1. **CTE不匹配**：PCB的基材（FR-4）和铜的热膨胀系数（CTE）不同。FR-4在Z轴（厚度方向）的膨胀系数远高于铜。
        
    2. **应力循环**：每当电路板经历一次大的温度波动（如设备开关机、环境温度变化、大电流通过），PCB基材在Z轴方向的膨胀和收缩会比对铜剧烈得多。
        
    3. **机械疲劳**：这种反复的应力会作用于过孔孔壁最薄弱的位置——通常是过孔拐角处。长期下来，铜层会产生微裂纹。
        
    4. **断裂**：微裂纹逐渐扩展、连接，最终导致过孔铜壁完全断裂。
        
- **表象**：在显微镜下，通常能在过孔的中间或端头位置看到环状裂纹。
    

### 3. 制造工艺缺陷

这些是先天不足的问题，在使用中暴露出来。

- **孔壁铜厚不足**：电镀过程中，如果工艺控制不当，导致过孔内壁的铜层太薄。这样的过孔在承受正常电流或热应力时非常脆弱，容易过早失效。
    
- **孔内有钻屑或空洞**：钻孔后，孔内可能有未清理干净的钻屑，或者电镀时孔内产生气泡，导致局部没有铜覆盖。这些薄弱点在长期使用中会成为故障的起点。
    
- **层压板与铜箔结合不良**：如果PCB材料的粘结片或半固化片质量不好，或压合工艺不当，可能导致过孔铜壁与基材结合力不足，在应力下剥离。
    

### 4. 化学腐蚀

在某些恶劣的工业环境中，空气中可能含有硫化物、氯气等腐蚀性气体。如果PCB的阻焊层或表面处理层有瑕疵（如针孔、划伤），腐蚀性气体和湿气会共同作用，直接腐蚀裸露的铜，导致过孔铜壁逐渐变薄直至断开。

### 5. 过电流冲击

如果电路发生短路或异常，瞬间的大电流通过载流能力不足的过孔，可能会像保险丝一样将其熔断。
