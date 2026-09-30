---
layout: note
title: "单片机内的Flash与EEPROM作用及区别"
category: "硬件基础与电源"
level: "基础"
order: 18
permalink: /notes/单片机内的flash与eeprom作用及区别/
summary: "Flash主要用于存储程序，不支持频繁修改，而EEPROM则用于保存用户数据，可在运行时改变。两者的最大区别在于操作方式和寻址机制，Flash按扇区操作，适合程序存储，EEPROM按字节操作，适合数据存储。"
source: "笔记/硬件/03SOC,MCU/MCU/单片机内的Flash与EEPROM作用及区别"
---

# 单片机内的Flash与EEPROM作用及区别

Flash主要用于存储程序，不支持频繁修改，而EEPROM则用于保存用户数据，可在运行时改变。两者的最大区别在于操作方式和寻址机制，Flash按扇区操作，适合程序存储，EEPROM按字节操作，适合数据存储。

芯片内部FLASH也可用作数据存储；及将变量写入FLASH中；但不推荐这个方法，操作不好可能会兆成程序丢失
