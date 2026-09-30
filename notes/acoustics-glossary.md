---
layout: note
title: "专业名称"
category: "模拟、音频与声学"
level: "核心设计"
order: 17
permalink: /notes/acoustics-glossary/
summary: "音频与声学处理中常见专业名词。"
source: "笔记/声学/专业名称"
---

# 专业名称

以下是关于音频处理中常见专业名词的解释，以及更多类似术语的整理。你可以将以下内容作为一篇 Obsidian 笔记保存。

---

## 音频处理常见术语释义

| 缩写              | 全称                                              | 中文含义     | 简要说明                                        |
| --------------- | ----------------------------------------------- | -------- | ------------------------------------------- |
| **AGC**         | Automatic Gain Control                          | 自动增益控制   | 自动调整音频信号放大倍数，使输出音量保持稳定，避免因输入信号强弱变化导致声音忽大忽小。 |
| **AEC**         | Acoustic Echo Cancellation                      | 声学回声消除   | 通过算法消除扬声器播放的声音被麦克风再次拾取后产生的回声（例如免提通话中的回声）。   |
| **SNR**         | Signal-to-Noise Ratio                           | 信噪比      | 信号功率与噪声功率之比（单位dB），越高表示信号越纯净，背景噪声越小。         |
| **ANS**         | Ambient Noise Suppression                       | 环境噪声抑制   | 降低背景噪声（如风声、空调声、环境人声），保留目标语音或信号。             |
| **VAD**         | Voice Activity Detection                        | 语音活动检测   | 判断当前音频片段是否包含人声，常用于降低非语音期间的编码速率或抑制噪声。        |
| **DRC**         | Dynamic Range Compression                       | 动态范围压缩   | 将大声音的音量降低、小声音的音量提高，使整体音量范围变窄，便于听清或避免削波。     |
| **EQ**          | Equalization                                    | 均衡器      | 调整不同频段（低频、中频、高频）的增益，用于音色塑形或补偿频响缺陷。          |
| **DSP**         | Digital Signal Processing                       | 数字信号处理   | 用数字芯片（或算法）对音频信号进行滤波、变换、增强等处理。               |
| **THD**         | Total Harmonic Distortion                       | 总谐波失真    | 信号经过系统后产生的谐波成分占总信号的百分比，越低表示保真度越高。           |
| **IMD**         | Intermodulation Distortion                      | 互调失真     | 两个或多个频率信号经非线性系统后产生的新组合频率分量，影响声音清晰度。         |
| **FR**          | Frequency Response                              | 频率响应     | 系统对不同频率信号的增益或衰减特性，常用曲线图表示。                  |
| **SPL**         | Sound Pressure Level                            | 声压级      | 声音的物理强度，单位dB。                               |
| **ADC/DAC**     | Analog-to-Digital / Digital-to-Analog Converter | 模数/数模转换器 | 将模拟音频信号转换为数字信号（ADC），或反之（DAC），采样率和位深决定音质。    |
| **Sample Rate** | —                                               | 采样率      | 每秒采集音频样本的次数（如44100Hz），决定可重现的最高频率。           |
| **Bit Depth**   | —                                               | 位深       | 每个样本的比特数（如16bit、24bit），决定动态范围。              |
| **Latency**     | —                                               | 延迟       | 从音频输入到输出经过处理所需的时间，对于实时应用（通话、直播）越短越好。        |
| **Beamforming** | —                                               | 波束成形     | 利用多个麦克风阵列定向拾取特定方向的声源，抑制其他方向噪声。              |
| **DNR**         | Dynamic Noise Reduction                         | 动态降噪     | 自适应调整降噪强度，对动态变化的背景噪声有效。                     |
| **ANC**         | Active Noise Cancellation                       | 主动降噪     | 通过产生反相声波抵消环境噪声，常见于耳机。                       |

---

### 更多与音频/语音产品设计相关的名词

- **PGA** (Programmable Gain Amplifier)：可编程增益放大器，常用于音频输入端调整灵敏度。
- **HPF / LPF** (High/Low Pass Filter)：高通/低通滤波器，用于切除超低频或超高频噪声。
- **Notch Filter**：陷波滤波器，专门抑制某个特定频率（如50Hz工频）。
- **Codec**：编解码器，集成 ADC/DAC 以及信号处理功能的芯片。
- **TDM / I²S**：数字音频传输总线协议。
- **DRC / Limiter**：动态范围控制和限幅器，防止输出过载。
- **Noise Gate**：噪声门，低于设定阈值时静音，用于去除间隙噪声。
- **Sinc** (Sinc Interpolation)：用于重采样、插值的数学函数，影响音频重建质量。
- **Loopback / Sidetone**：侧音/回路，指通话时能听到自己声音的反馈，用于感知通话状态。
- **ESD** (Echo Suppression/Damping)：回声抑制（较AEC更粗放，常用于对讲系统）。
- **Full Duplex**：全双工，同时支持双向通话，要求AEC性能好。

---

如果需要，我可以将这些内容直接保存为一篇新的 Obsidian 笔记（例如 音频专业名词解释），方便你后续查阅。
