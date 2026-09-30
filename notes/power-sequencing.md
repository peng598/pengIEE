---
layout: note
title: "多电源上电时序"
category: "硬件基础与电源"
level: "基础"
order: 13
permalink: /notes/power-sequencing/
summary: "多电源系统的上电时序、复位和监控。"
source: "笔记/硬件/05设计/上电时序/多电源上电时序"
---

# 多电源上电时序

1.直接级联使能;
	如:1.2V上电,1.2V出来后接3.3V使能脚
	
	缺电:可能会因为使能脚电压低,不能正常使能

==注意点：DC-DC与LDO混用时，爬升速率不一样，可能会出现DC-DC在升压时，LDO因为低且快是使导致ＬＤＯ比DC-DC更先上电==

2.RC延迟
		[RC充放电公式]()

	缺点:时间不精确

3 .电源芯片PG使能
		与使能脚不同

4:时序芯片
		不同时序输出,接到使能
		不同时序,不同间隔,选择不同芯片
		缺点:灵活性差

5:利用GPIO来使能
		灵活性高,稳定,但需要考虑低功耗场景

6:负载开关/PMOS
	部分电源芯片有CT电容,可调整CT电容来实现软启动功能, 同时QOD上的电阻用来放电,可以实现放电时序

大功率下：
调整C349，来改变MOS开启时间

<figure class="note-figure"><img src="{{ '/assets/attachments/attachment-033.png' | relative_url }}" alt="附件：Pasted image 20251103191301.png"><figcaption>Pasted image 20251103191301.png</figcaption></figure>
