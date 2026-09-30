---
layout: default
title: 公式与计算
summary: 常用电子、电源、PCB 与信号完整性计算工具。
permalink: /formulas/
---

<div class="formula-page">
  <header class="formula-heading">
    <p class="eyebrow">PENGIEE <span class="eyebrow-divider">/</span> 工程工具</p>
    <h1>公式与计算</h1>
    <p>把常用的硬件计算集中在一页，输入参数后即可得到结果。每个工具都标注了计算依据，适合快速估算与复核。</p>
  </header>

  <div class="formula-controls">
    <label class="formula-search" for="formula-search"><span aria-hidden="true">⌕</span><input id="formula-search" type="search" placeholder="搜索工具，例如：电阻、滤波、PCB" autocomplete="off"></label>
    <div class="formula-categories" aria-label="工具分类">
      <button class="formula-category" type="button" aria-pressed="true" data-category="全部">全部</button>
      <button class="formula-category" type="button" aria-pressed="false" data-category="基础电路">基础电路</button>
      <button class="formula-category" type="button" aria-pressed="false" data-category="电源与滤波">电源与滤波</button>
      <button class="formula-category" type="button" aria-pressed="false" data-category="信号与 PCB">信号与 PCB</button>
      <button class="formula-category" type="button" aria-pressed="false" data-category="音频与系统">音频与系统</button>
    </div>
  </div>

  <div class="formula-grid" id="formula-grid">
    <button class="formula-card" type="button" data-tool="resistor" data-category="基础电路" data-search="色环电阻 电阻 阻值">
      <span class="formula-card-category">基础电路</span><strong>四色环电阻</strong><small>根据四条色环读取阻值、倍率和误差。</small>
    </button>
    <button class="formula-card" type="button" data-tool="ohm" data-category="基础电路" data-search="欧姆定律 电压 电流 电阻">
      <span class="formula-card-category">基础电路</span><strong>欧姆定律</strong><small>在电压、电流和电阻之间选择一个未知量。</small>
    </button>
    <button class="formula-card" type="button" data-tool="divider" data-category="基础电路" data-search="电阻分压 分压">
      <span class="formula-card-category">基础电路</span><strong>电阻分压</strong><small>计算分压输出，以及达到目标电压所需的电阻。</small>
    </button>
    <button class="formula-card" type="button" data-tool="led" data-category="基础电路" data-search="LED 限流 电阻 功耗">
      <span class="formula-card-category">基础电路</span><strong>LED 限流电阻</strong><small>用供电电压、正向压降和目标电流选限流电阻。</small>
    </button>
    <button class="formula-card" type="button" data-tool="rc" data-category="电源与滤波" data-search="RC 低通 截止频率 滤波">
      <span class="formula-card-category">电源与滤波</span><strong>RC 截止频率</strong><small>计算一阶 RC 低通或高通的截止频率。</small>
    </button>
    <button class="formula-card" type="button" data-tool="lc" data-category="电源与滤波" data-search="LC 谐振 频率">
      <span class="formula-card-category">电源与滤波</span><strong>LC 谐振频率</strong><small>根据电感与电容计算理想 LC 谐振点。</small>
    </button>
    <button class="formula-card" type="button" data-tool="tau" data-category="电源与滤波" data-search="电容 时间常数 RC 充放电">
      <span class="formula-card-category">电源与滤波</span><strong>RC 时间常数</strong><small>计算电阻、电容组成电路的时间常数。</small>
    </button>
    <button class="formula-card" type="button" data-tool="dspower" data-category="信号与 PCB" data-search="dBm dBW 功率 分贝">
      <span class="formula-card-category">信号与 PCB</span><strong>W、dBW、dBm 换算</strong><small>在功率单位之间快速换算，默认参考阻抗为 50 Ω。</small>
    </button>
    <button class="formula-card" type="button" data-tool="wavelength" data-category="信号与 PCB" data-search="波长 频率 传播速度">
      <span class="formula-card-category">信号与 PCB</span><strong>频率与波长</strong><small>根据频率和传播速度计算波长。</small>
    </button>
    <button class="formula-card" type="button" data-tool="trace" data-category="信号与 PCB" data-search="PCB 走线 载流 电流">
      <span class="formula-card-category">信号与 PCB</span><strong>PCB 走线载流</strong><small>用 IPC-2221 外层近似估算线宽或载流能力。</small>
    </button>
    <button class="formula-card" type="button" data-tool="battery" data-category="音频与系统" data-search="电池 续航 容量 电流">
      <span class="formula-card-category">音频与系统</span><strong>电池续航</strong><small>按容量、负载电流和效率估算运行时间。</small>
    </button>
    <button class="formula-card" type="button" data-tool="opamp" data-category="音频与系统" data-search="运放 增益 同相 反相">
      <span class="formula-card-category">音频与系统</span><strong>运放闭环增益</strong><small>计算同相或反相运放的理想闭环增益。</small>
    </button>
  </div>
  <p class="formula-empty" id="formula-empty" hidden>没有找到匹配的工具。</p>
  <p class="formula-note">计算结果用于前期估算。器件容差、温升、布局、寄生参数和数据手册限制仍需在设计评审与实测中确认。</p>

  <section class="formula-handbook" aria-labelledby="formula-handbook-heading">
    <div class="section-heading"><h2 id="formula-handbook-heading">公式推导手册</h2><span>从公式到工程判断</span></div>
    <p class="formula-handbook-intro">下面按硬件设计的实际工作流整理公式。每一节都先给出模型，再说明它为什么成立、什么时候不能直接套用。</p>
    <details class="formula-handbook-section" open><summary>01 · 单位、波形与分贝</summary><div class="formula-handbook-body"><p>正弦波 <code>v(t)=Vpk sin(ωt+φ)</code> 的有效值为 <code>Vrms=Vpk/√2</code>，峰峰值为 <code>Vpp=2√2 Vrms</code>。功放功率使用负载上的 RMS 电压，示波器过压和器件耐压通常检查峰值或峰峰值。</p><p>电压/电流幅度比使用 <code>20log10(V2/V1)</code>，功率比使用 <code>10log10(P2/P1)</code>。两者只有在阻抗相同或阻抗关系已明确时才能互换。</p><p>角频率 <code>ω=2πf</code>，周期 <code>T=1/f</code>。把 Hz 直接代入以 rad/s 表示的公式，是滤波和控制计算中最常见的单位错误。</p></div></details>
    <details class="formula-handbook-section"><summary>02 · 直流电路与等效模型</summary><div class="formula-handbook-body"><p><code>V=IR</code> 可由 <code>J=σE</code>、<code>E=V/l</code> 和 <code>J=I/A</code> 推出，得到 <code>R=ρl/A</code>。它只适用于工作点附近近似线性的器件，不能把二极管、LED 或 NTC 当作全范围固定电阻。</p><p>KCL 来自节点电荷守恒：<code>ΣI=0</code>；KVL 来自回路电势变化的代数和：<code>ΣV=0</code>。串联电阻相加，并联电阻满足 <code>1/Req=Σ(1/Ri)</code>。</p><p>分压公式 <code>Vout=Vin·R2/(R1+R2)</code> 假定输出没有明显负载。接入 <code>RL</code> 后，应先算 <code>R2'=R2||RL</code>，再用 <code>Vout=Vin·R2'/(R1+R2')</code>。戴维南等效则把复杂网络化成 <code>Vth</code> 与 <code>Rth</code>，适合分析 ADC、传感器和接口负载。</p><p>功率关系为 <code>P=VI=I²R=V²/R</code>。长期功率还要乘以降额系数，脉冲能量则需要单独检查器件的 SOA 和热阻。</p></div></details>
    <details class="formula-handbook-section"><summary>03 · 电容、电感与瞬态</summary><div class="formula-handbook-body"><p>电容的定义 <code>Q=CV</code> 对时间求导得到 <code>I=C·dV/dt</code>，储能为 <code>Wc=1/2·CV²</code>。所以电容不能让电压瞬间变化，瞬态压降可先用 <code>ΔV≈IΔt/C</code> 估算。</p><p>电感满足 <code>V=L·di/dt</code>，储能为 <code>WL=1/2·LI²</code>。电感不能让电流瞬间改变，继电器、电机和变压器关断时必须提供续流、TVS 或吸收路径。</p><p>RC 充电由 <code>Vs=Ri+Vc</code> 与 <code>i=C·dVc/dt</code> 得到 <code>Vc(t)=Vs[1-e^(-t/RC)]</code>，时间常数为 <code>τ=RC</code>。达到目标比例时应反推 <code>t=-RC ln(1-Vtarget/Vs)</code>，而不是只写一个经验延时。</p><p>RL 电路的时间常数是 <code>τ=L/R</code>。二阶 RLC 的理想谐振频率为 <code>f0=1/(2π√LC)</code>，串联 RLC 的品质因数近似为 <code>Q=(1/R)√(L/C)</code>。</p></div></details>
    <details class="formula-handbook-section"><summary>04 · 交流阻抗与功率</summary><div class="formula-handbook-body"><p>在正弦稳态下，<code>ZR=R</code>、<code>ZL=jωL</code>、<code>ZC=1/(jωC)</code>。复阻抗 <code>Z=R+jX</code> 的幅值为 <code>|Z|=√(R²+X²)</code>，相位为 <code>φ=atan(X/R)</code>。只看阻抗幅值而忽略相位，会误判扬声器、电源滤波器和运放负载。</p><p>交流功率使用 RMS 值：<code>S=VrmsIrms</code>（VA）、<code>P=VrmsIrms cosφ</code>（W）、<code>Q=VrmsIrms sinφ</code>（var），功率因数 <code>PF=P/S</code>。低功率因数会提高同样有功功率下的 RMS 电流和导体损耗。</p></div></details>
    <details class="formula-handbook-section"><summary>05 · 二极管、BJT 与 MOSFET</summary><div class="formula-handbook-body"><p>二极管的 Shockley 近似为 <code>ID=IS[e^(VD/(nVT))-1]</code>，其中室温 <code>VT≈25.85mV</code>。小信号动态电阻约为 <code>rd=nVT/ID</code>，电流越大，动态电阻越小。</p><p>LED 限流电阻来自 KVL：<code>R=(Vs-VF-Vdriver)/I</code>，功耗为 <code>PR=I²R</code>。必须同时检查最高供电、最低正向压降、GPIO 电流和电阻脉冲能力。</p><p>BJT 的基础关系为 <code>IC≈βIB</code>、<code>gm=IC/VT</code>、<code>rπ=β/gm</code>。MOSFET 导通损耗为 <code>Pcond=Irms²RDS(on)</code>，开关损耗可先估 <code>Psw≈1/2·VDS·ID·(tr+tf)·fsw</code>，再加入栅极驱动、反向恢复和寄生参数。</p></div></details>
    <details class="formula-handbook-section"><summary>06 · 运放、反馈与稳定性</summary><div class="formula-handbook-body"><p>理想运放的“虚短、虚断”只在线性负反馈且未饱和时成立。反相放大器 <code>Av=-Rf/Rin</code>，同相放大器 <code>Av=1+Rf/Rg</code>，差分放大器还要求电阻比匹配，否则 CMRR 会明显下降。</p><p>单极点近似下，闭环带宽约为 <code>f-3dB≈GBW/NG</code>，其中 <code>NG</code> 是噪声增益，不一定等于信号增益。正弦输出不失真还要满足 <code>SR≥2πfmaxVpk</code>。</p><p>反馈闭环关系为 <code>Acl=A/(1+Aβ)</code>。环路增益越大，闭环增益越接近 <code>1/β</code>，但相位裕量可能下降；环路稳定性最终应通过 Bode、仿真或注入测量确认。</p></div></details>
    <details class="formula-handbook-section"><summary>07 · 滤波器与频率响应</summary><div class="formula-handbook-body"><p>一阶 RC 低通的传递函数为 <code>H(s)=1/(1+sRC)</code>，高通为 <code>H(s)=sRC/(1+sRC)</code>，两者的截止频率都是 <code>fc=1/(2πRC)</code>。截止点对应幅度降为通带的 <code>1/√2</code>，即约 -3.01 dB。</p><p>无缓冲级联时，后级会加载前级，不能简单地把各级截止频率相乘；应把负载纳入节点方程，或使用缓冲器和仿真验证。二阶标准形式中的 <code>Q</code> 决定峰化、带宽和振铃。</p></div></details>
    <details class="formula-handbook-section"><summary>08 · ADC、采样与噪声</summary><div class="formula-handbook-body"><p>N 位 ADC 的理想量化步进约为 <code>LSB=Vref/2^N</code>，量化噪声 RMS 约为 <code>LSB/√12</code>。采样频率至少要高于信号最高频率的两倍，并在 ADC 前加入抗混叠滤波。</p><p>分压给 ADC 时，比例为 <code>k=R2/(R1+R2)</code>，ADC 看到的戴维南阻抗为 <code>RTH=R1||R2</code>。采样电容充电误差与 <code>RTH·Csample</code> 相关，不能只检查静态分压比例。</p><p>电阻热噪声的均方根电压密度为 <code>en=√(4kTR)</code>。噪声预算要按带宽积分，并区分输入等效噪声、输出噪声、1/f 噪声和电源耦合。</p></div></details>
    <details class="formula-handbook-section"><summary>09 · 电源、功耗与热</summary><div class="formula-handbook-body"><p>Buck 在理想连续导通模式下 <code>Vout≈D·Vin</code>；电感纹波可按 <code>ΔIL≈(Vin-Vout)D/(Lfsw)</code> 估算。实际设计还要检查峰值电流、最小导通时间、补偿网络、输出电容 ESR 和布局回路。</p><p>LDO 损耗近似为 <code>PLDO=(Vin-Vout)Iout</code>，结温估算为 <code>Tj≈Ta+PθJA</code>。若使用散热片或铜箔，应该采用数据手册给出的完整热阻链，而不是套一个固定数值。</p><p>PCB 走线载流、过孔温升和铜箔热扩散都属于经验模型；计算值只能用于初选，最终必须结合铜厚、内外层、环境温度和热测试修正。</p></div></details>
    <details class="formula-handbook-section"><summary>10 · 传输线、EMC 与测量</summary><div class="formula-handbook-body"><p>电磁波波长为 <code>λ=v/f</code>，传输线延时为 <code>tpd≈l/v</code>。当走线传播延时相对于边沿时间不可忽略时，即使时钟频率不高，也需要按传输线分析阻抗、回流和端接。</p><p>源端串联端接通常放在驱动器附近，用于降低反射和振铃；端接值、走线阻抗、封装寄生和探头接地必须一起考虑。EMC 问题常从回流路径、环路面积、共模电流和屏蔽缝隙开始排查。</p><p>FFT 频率分辨率为 <code>Δf=Fs/N=1/Tobs</code>。补零只增加频谱显示点，不会提高真实分辨率；窗函数还需要考虑 coherent gain 和 ENBW，不能直接把 FFT 峰值当作校准后的 RMS。</p></div></details>
    <details class="formula-handbook-section"><summary>11 · 公式使用检查清单</summary><div class="formula-handbook-body"><ol><li>确认变量是瞬时值、峰值、峰峰值、平均值还是 RMS。</li><li>统一单位，尤其检查 Hz 与 rad/s、摄氏度与开尔文、mA 与 A。</li><li>写清楚公式的模型：DC、正弦稳态、小信号、理想器件、一阶近似或连续导通。</li><li>把源阻抗、负载、探头、布线寄生、温升和测量带宽列入误差项。</li><li>用最小/典型/最大参数分别检查工作点，最后用仿真和实测修正。</li></ol></div></details>
  </section>
</div>

<dialog class="formula-dialog" id="formula-dialog" aria-labelledby="formula-dialog-title">
  <div class="formula-dialog-header"><div><h2 id="formula-dialog-title"></h2><p id="formula-dialog-subtitle"></p></div><button class="formula-close" type="button" aria-label="关闭计算器">×</button></div>
  <div class="formula-dialog-detail" id="formula-dialog-detail"></div>
  <form class="formula-form" id="formula-form"></form>
  <div class="formula-result" id="formula-result"><span class="formula-result-label">计算结果</span><strong id="formula-result-value">请输入参数</strong><p id="formula-result-note"></p></div>
</dialog>

<script>
(() => {
  const colors = [
    ['黑', 0, '#252927'], ['棕', 1, '#805434'], ['红', 2, '#bd4b45'], ['橙', 3, '#d77a2f'], ['黄', 4, '#c8a33b'],
    ['绿', 5, '#56815e'], ['蓝', 6, '#4d709d'], ['紫', 7, '#765a9c'], ['灰', 8, '#838883'], ['白', 9, '#f4f4f1']
  ];
  const tolerance = [['±1%', 1], ['±2%', 2], ['±5%', 5], ['±10%', 10]];
  const tools = {
    resistor: { title: '四色环电阻', subtitle: 'R = (10 × 第一环 + 第二环) × 10^倍率', fields: [
      ['a', '第一环', 'select', colors.map(x => [x[0], x[1]])], ['b', '第二环', 'select', colors.map(x => [x[0], x[1]])], ['m', '倍率环', 'select', colors.map(x => [x[0], x[1]])], ['tol', '误差', 'select', tolerance]
    ], calc: v => { const r = (10 * v.a + v.b) * 10 ** v.m; return { value: format(r, 'Ω'), note: `标称值 ${format(r, 'Ω')}，误差 ${v.tol}%` }; } },
    ohm: { title: '欧姆定律', subtitle: 'V = I × R', fields: [['mode', '计算量', 'select', [['电压 V', 'v'], ['电流 I', 'i'], ['电阻 R', 'r']]], ['v', '电压 V（V）', 'number'], ['i', '电流 I（A）', 'number'], ['r', '电阻 R（Ω）', 'number']], calc: v => { if (v.mode === 'v') return { value: format(v.i * v.r, 'V'), note: 'V = I × R' }; if (v.mode === 'i') return { value: format(v.v / v.r, 'A'), note: 'I = V ÷ R' }; return { value: format(v.v / v.i, 'Ω'), note: 'R = V ÷ I' }; } },
    divider: { title: '电阻分压', subtitle: 'Vout = Vin × R2 ÷ (R1 + R2)', fields: [['vin', '输入电压 Vin（V）', 'number'], ['r1', '上臂电阻 R1（Ω）', 'number'], ['r2', '下臂电阻 R2（Ω）', 'number']], calc: v => ({ value: format(v.vin * v.r2 / (v.r1 + v.r2), 'V'), note: '输出端默认高阻，未计入负载影响。' }) },
    led: { title: 'LED 限流电阻', subtitle: 'R = (Vcc - Vf) ÷ I', fields: [['vcc', '供电电压 Vcc（V）', 'number'], ['vf', 'LED 正向压降 Vf（V）', 'number'], ['i', '目标电流 I（A）', 'number']], calc: v => { const r = (v.vcc - v.vf) / v.i; return { value: format(r, 'Ω'), note: `电阻功耗约 ${format(v.i * v.i * r, 'W')}，建议留出余量。` }; } },
    rc: { title: 'RC 截止频率', subtitle: 'fc = 1 ÷ (2πRC)', fields: [['r', '电阻 R（Ω）', 'number'], ['c', '电容 C（F）', 'number']], calc: v => ({ value: format(1 / (2 * Math.PI * v.r * v.c), 'Hz'), note: '一阶 RC 低通/高通的 -3 dB 截止频率。' }) },
    lc: { title: 'LC 谐振频率', subtitle: 'f0 = 1 ÷ (2π√(LC))', fields: [['l', '电感 L（H）', 'number'], ['c', '电容 C（F）', 'number']], calc: v => ({ value: format(1 / (2 * Math.PI * Math.sqrt(v.l * v.c)), 'Hz'), note: '理想 LC 模型，实际频率会受寄生参数和负载影响。' }) },
    tau: { title: 'RC 时间常数', subtitle: 'τ = R × C', fields: [['r', '电阻 R（Ω）', 'number'], ['c', '电容 C（F）', 'number']], calc: v => ({ value: format(v.r * v.c, 's'), note: '充电约 1τ 达到 63.2%，约 5τ 接近稳态。' }) },
    dspower: { title: 'W、dBW、dBm 换算', subtitle: 'dBW = 10log10(P / 1W)，dBm = 10log10(P / 1mW)', fields: [['p', '功率 P（W）', 'number']], calc: v => ({ value: `${format(10 * Math.log10(v.p), 'dBW')} · ${format(10 * Math.log10(v.p * 1000), 'dBm')}`, note: `功率 ${format(v.p, 'W')}` }) },
    wavelength: { title: '频率与波长', subtitle: 'λ = v ÷ f', fields: [['f', '频率 f（Hz）', 'number'], ['speed', '传播速度 v（m/s）', 'number']], calc: v => ({ value: format(v.speed / v.f, 'm'), note: '自由空间默认速度约为 3×10^8 m/s；PCB 介质中需使用实际传播速度。' }) },
    trace: { title: 'PCB 走线载流', subtitle: 'IPC-2221 外层近似：I = k × ΔT^0.44 × (W×T)^0.725', fields: [['w', '线宽 W（mil）', 'number'], ['t', '铜厚 T（mil）', 'number'], ['dt', '温升 ΔT（°C）', 'number']], calc: v => ({ value: format(0.048 * v.dt ** 0.44 * (v.w * v.t) ** 0.725, 'A'), note: '这是经验估算，内层、散热条件、铜箔形状和标准版本会改变结果。' }) },
    battery: { title: '电池续航', subtitle: 't = 容量 Ah × 效率 ÷ 负载电流 A', fields: [['cap', '电池容量（Ah）', 'number'], ['i', '平均负载电流（A）', 'number'], ['eff', '可用效率（%）', 'number']], calc: v => ({ value: format(v.cap * v.eff / 100 / v.i, 'h'), note: '未计入温度、老化、峰值电流和保护截止电压。' }) },
    opamp: { title: '运放闭环增益', subtitle: '同相：Av = 1 + Rf/Rg；反相：Av = -Rf/Rin', fields: [['mode', '拓扑', 'select', [['同相', 'non'], ['反相', 'inv']]], ['rf', '反馈电阻 Rf（Ω）', 'number'], ['rg', '接地/输入电阻（Ω）', 'number']], calc: v => ({ value: format(v.mode === 'non' ? 1 + v.rf / v.rg : -v.rf / v.rg, '倍'), note: v.mode === 'non' ? '同相输入，理想闭环增益为正。' : '反相输入，理想闭环增益带负号。' }) }
  };
  const dialog = document.querySelector('#formula-dialog');
  const form = document.querySelector('#formula-form');
  const result = document.querySelector('#formula-result');
  const detail = document.querySelector('#formula-dialog-detail');
  const value = document.querySelector('#formula-result-value');
  const note = document.querySelector('#formula-result-note');
  const fieldId = (name) => `formula-${name}`;
  const derivations = {
    resistor: '十进制阻值 =（第一环×10 + 第二环）× 10^倍率；误差环只描述容差，不改变标称阻值。',
    ohm: '由 V=IR 变形得到未知量。仅适用于该工作点附近可近似线性的器件或等效电阻。',
    divider: '串联电流 I=Vin/(R1+R2)，输出 Vout=I×R2；接入负载时应把 R2 换成 R2||RL。',
    led: '由 KVL：Vcc=I×R+Vf+Vdriver，移项得到限流电阻；最大电流要按电源和 Vf 的最坏组合检查。',
    rc: 'RC 低通 H(s)=1/(1+sRC)，令 |H|=1/√2 得 ωcRC=1，因此 fc=1/(2πRC)。',
    lc: 'RLC 阻抗虚部为 ωL-1/(ωC)，令虚部为零得到 ω0=1/√(LC)。',
    tau: '由电容充放电微分方程得到指数响应；τ=RC 是电压变化到最终值 63.2% 的时间尺度。',
    dspower: 'dBW 以 1 W 为参考，dBm 以 1 mW 为参考；两者相差 30 dB。',
    wavelength: '一个周期内波传播的距离为 λ=vT，代入 T=1/f 得 λ=v/f。',
    trace: 'IPC-2221 外层经验式把截面积、温升与允许电流联系起来，实际还需按铜厚、层别和热路径修正。',
    battery: '可用能量按容量与效率折算，再除以平均负载电流；峰值电流和截止电压会使实际时间缩短。',
    opamp: '负反馈使 V−≈V+ 且输入电流近似为零；由电阻网络 KCL 分别得到同相与反相增益。'
  };
  const format = (number, unit) => { if (!Number.isFinite(number)) throw new Error('请检查输入参数'); const abs = Math.abs(number); const scale = abs && (abs >= 1e9 ? [1e9, 'G'] : abs >= 1e6 ? [1e6, 'M'] : abs >= 1e3 ? [1e3, 'k'] : abs < 1e-9 ? [1e-9, 'n'] : abs < 1e-6 ? [1e-6, 'μ'] : abs < 1e-3 ? [1e-3, 'm'] : [1, '']); const shown = (number / scale[0]).toPrecision(5).replace(/\.0+$|(?<=\.\d)0+$/, ''); return `${shown} ${scale[1]}${unit}`; };
  const renderForm = (key) => { const tool = tools[key]; document.querySelector('#formula-dialog-title').textContent = tool.title; document.querySelector('#formula-dialog-subtitle').textContent = tool.subtitle; detail.textContent = derivations[key]; form.innerHTML = tool.fields.map(([name, label, type, options]) => type === 'select' ? `<label class="formula-field" for="${fieldId(name)}"><span>${label}</span><select id="${fieldId(name)}" name="${name}">${options.map(([text, option]) => `<option value="${option}">${text}</option>`).join('')}</select></label>` : `<label class="formula-field" for="${fieldId(name)}"><span>${label}</span><input id="${fieldId(name)}" name="${name}" type="number" step="any" inputmode="decimal" required></label>`).join('');
    const defaults = { resistor: { a: 2, b: 7, m: 2, tol: 5 }, ohm: { mode: 'v', v: 5, i: 0.01, r: 500 }, divider: { vin: 5, r1: 10000, r2: 10000 }, led: { vcc: 5, vf: 2, i: 0.01 }, rc: { r: 10000, c: 1e-7 }, lc: { l: 1e-3, c: 1e-6 }, tau: { r: 10000, c: 1e-6 }, dspower: { p: 1 }, wavelength: { f: 1e8, speed: 3e8 }, trace: { w: 10, t: 1.4, dt: 10 }, battery: { cap: 2, i: 0.2, eff: 85 }, opamp: { mode: 'non', rf: 10000, rg: 1000 } }[key]; Object.entries(defaults).forEach(([name, initial]) => { const input = form.elements[name]; if (input) input.value = initial; }); form.oninput = () => calculate(key); calculate(key); };
  const calculate = (key) => { const tool = tools[key]; const values = Object.fromEntries(tool.fields.map(([name, , type]) => [name, type === 'select' ? form.elements[name].value : Number(form.elements[name].value)])); try { const output = tool.calc({ ...values, a: Number(values.a), b: Number(values.b), m: Number(values.m), tol: Number(values.tol) }); result.dataset.state = 'ok'; value.textContent = output.value; note.textContent = output.note; } catch (error) { result.dataset.state = 'error'; value.textContent = error.message; note.textContent = ''; } };
  document.querySelectorAll('.formula-card').forEach((card) => card.addEventListener('click', () => { renderForm(card.dataset.tool); dialog.showModal(); }));
  document.querySelector('.formula-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  const search = document.querySelector('#formula-search'); let category = '全部';
  const filter = () => { const query = search.value.trim().toLocaleLowerCase(); let count = 0; document.querySelectorAll('.formula-card').forEach((card) => { const match = (category === '全部' || card.dataset.category === category) && (!query || `${card.dataset.search} ${card.textContent}`.toLocaleLowerCase().includes(query)); card.hidden = !match; if (match) count += 1; }); document.querySelector('#formula-empty').hidden = count > 0; };
  search.addEventListener('input', filter); document.querySelectorAll('.formula-category').forEach((button) => button.addEventListener('click', () => { category = button.dataset.category; document.querySelectorAll('.formula-category').forEach((item) => item.setAttribute('aria-pressed', String(item === button))); filter(); }));
})();
</script>
