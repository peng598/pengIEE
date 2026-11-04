---
layout: note
title: "软件 I²C 的时序、应答与总线恢复"
category: "实时系统与软件"
level: "核心设计"
order: 6
permalink: /notes/software-bit-banging/
summary: "从 OLED 字节发送片段分析开漏释放、ACK、时钟拉伸、上升时间和故障恢复。"
source: "soft/软件散装笔记/写数据"
---

# 软件 I²C 的时序、应答与总线恢复

原笔记的 OLED 发送片段逐位设置 SDA、翻转 SCL，并产生第九个时钟但不读 ACK。这能表达发送顺序，却不足以构成可靠 I²C 主机：需要明确引脚的开漏语义、SCL 实际高电平、数据建立/保持时间与从机应答。

## 电气约束决定可实现速率

I²C 的逻辑 1 应通过“释放开漏输出”获得，不能主动推挽拉高 SDA。ACK 时主机必须释放 SDA，由从机拉低；推挽高电平会形成输出冲突。SCL 同样要支持释放后读取实际电平，才能识别从机时钟拉伸。

用一阶上拉 RC 近似，30%–70% 上升时间为：

$$t_r\approx0.8473R_pC_b$$

若总线电容估算为 $100\,pF$，设计目标 $t_r\le300\,ns$，则 $R_p\le3.54\,k\Omega$。同时由从机低电平灌电流约束 $R_p\ge(V_{DD}-V_{OL,\max})/I_{OL,\max}$。这些参数需对应实际模式和器件手册；示波器实测电容、线缆和输入阈值造成的边沿才是最终依据。

## 一个字节的完整发送过程

对每一位，在 SCL 低时设置/释放 SDA，等待建立时间；释放 SCL 后轮询实际引脚到高，超时则报错；保持有效高时间后拉低 SCL。第九拍释放 SDA并采样 ACK，低表示应答，高表示 NACK。地址 NACK、数据 NACK 与拉伸超时应有不同状态码，便于区分设备缺失、忙和总线被占用。

~~~c
/* 结构示意；GPIO、定时和错误码由具体平台实现。 */
for (unsigned bit = 0; bit < 8; ++bit) {
    DriveSclLow();
    SetSdaOpenDrain((byte & 0x80u) != 0);
    WaitDataSetup();
    ReleaseScl();
    if (!WaitSclHighUntil(deadline)) return I2C_CLOCK_TIMEOUT;
    WaitClockHigh();
    DriveSclLow();
    byte <<= 1;
}
ReleaseSda();
WaitDataSetup();
ReleaseScl();
if (!WaitSclHighUntil(deadline)) return I2C_CLOCK_TIMEOUT;
bool ack = !ReadSda();
WaitClockHigh();
DriveSclLow();
return ack ? I2C_OK : I2C_NACK;
~~~

此片段不包含 START、STOP、仲裁与事务锁；不能直接当完整驱动。单主机可在整个事务上使用任务互斥，避免其他任务插入 START。普通中断延长 SCL 低/高时间在许多 I²C 器件上可接受，但应检查从机超时限制；没有必要为了每个字节而长时间全局关中断。

## 复位与断线后的恢复

若 SDA 持续低而 SCL 可控制，按器件与 I²C 总线恢复规范尝试有限数量的时钟脉冲（常见为最多九拍），随后生成合法 STOP 并重新初始化状态机。若 SCL 被持续拉低，继续翻转 GPIO 无法解决，需查短路、从机供电或执行受控设备复位。

验收分别拔掉 OLED、降低上拉强度、增加总线电容并在事务中复位主机；记录 ACK、rise/fall、SCL 高低宽度、最长事务时间及恢复结果。逻辑分析仪能确认协议，示波器用于发现慢边沿、毛刺和电平冲突。
