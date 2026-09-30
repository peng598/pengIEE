---
layout: note
title: "写数据"
category: "实时系统与软件"
order: 6
permalink: /notes/software-bit-banging/
summary: "OLED I2C 模拟时序的字节发送示例。"
source: "soft/软件散装笔记/写数据"
---

# 写数据

void OLED_I2C_SendByte(uint8_t Byte)

{

    uint8_t i;

    for (i = 0; i < 8; i++)

    {

        OLED_W_SDA(Byte & (0x80 >> i));

        OLED_W_SCL(1);

        OLED_W_SCL(0);

    }

    OLED_W_SCL(1);  //额外的一个时钟，不处理应答信号

    OLED_W_SCL(0);

}
