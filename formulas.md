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
    <p>按电子设计领域查公式，也可以直接打开交互计算器估算参数。</p>
    <div class="formula-summary"><span><strong id="formula-count">34</strong> 个交互计算器</span><span><strong>18</strong> 个领域 · 180 组公式</span></div>
  </header>

  <nav class="formula-section-nav" aria-label="公式页面目录">
    <a href="#formula-tools">交互计算器</a>
    <a href="#formula-library">领域公式库</a>
    <a href="#formula-handbook-heading">推导手册</a>
  </nav>

  <h2 class="formula-section-title" id="formula-tools">交互计算器</h2>
  <div class="formula-controls">
    <label class="formula-search" for="formula-search"><span aria-hidden="true">⌕</span><input id="formula-search" type="search" placeholder="搜索工具，例如：电阻、滤波、PCB" autocomplete="off"></label>
    <label class="formula-tool-domain" for="formula-tool-domain"><span>领域</span><select id="formula-tool-domain">
      <option value="全部">全部领域</option>
      {% for domain in site.data.formula_catalog %}<option value="{{ domain.name | escape }}">{{ domain.name | escape }}</option>{% endfor %}
    </select></label>
    <div class="formula-toolbar"><label class="formula-sort" for="formula-sort"><span>排序</span><select id="formula-sort"><option value="default">推荐顺序</option><option value="name">名称</option><option value="category">分类</option></select></label><div class="formula-view" aria-label="显示方式"><button class="formula-view-button is-active" type="button" data-view="grid" aria-pressed="true" title="网格视图" aria-label="网格视图">▦</button><button class="formula-view-button" type="button" data-view="list" aria-pressed="false" title="列表视图" aria-label="列表视图">☷</button></div><button class="formula-reset" type="button" id="formula-reset">清除筛选</button></div>
  </div>

  <div class="formula-result-count" id="formula-visible-count" aria-live="polite">34 个结果</div>
  <div class="formula-grid" id="formula-grid">
    <button class="formula-card" type="button" data-tool="resistor" data-category="电路基础" data-search="色环电阻 电阻 阻值">
      <span class="formula-card-category">电路基础</span><strong>四色环电阻</strong><small>根据四条色环读取阻值、倍率和误差。</small>
    </button>
    <button class="formula-card" type="button" data-tool="ohm" data-category="电路基础" data-search="欧姆定律 电压 电流 电阻">
      <span class="formula-card-category">电路基础</span><strong>欧姆定律</strong><small>在电压、电流和电阻之间选择一个未知量。</small>
    </button>
    <button class="formula-card" type="button" data-tool="divider" data-category="电路基础" data-search="电阻分压 分压">
      <span class="formula-card-category">电路基础</span><strong>电阻分压</strong><small>计算分压输出，以及达到目标电压所需的电阻。</small>
    </button>
    <button class="formula-card" type="button" data-tool="led" data-category="半导体与开关驱动" data-search="LED 限流 电阻 功耗">
      <span class="formula-card-category">半导体与开关驱动</span><strong>LED 限流电阻</strong><small>用供电电压、正向压降和目标电流选限流电阻。</small>
    </button>
    <button class="formula-card" type="button" data-tool="resnet" data-category="电路基础" data-search="串联 并联 电阻 网络 等效">
      <span class="formula-card-category">电路基础</span><strong>电阻串并联</strong><small>计算多个相等电阻或两只电阻的等效值。</small>
    </button>
    <button class="formula-card" type="button" data-tool="respower" data-category="电路基础" data-search="电阻 功率 电流 发热">
      <span class="formula-card-category">电路基础</span><strong>电阻功率与电流</strong><small>根据电压、电流和阻值检查电阻耗散功率。</small>
    </button>
    <button class="formula-card" type="button" data-tool="capenergy" data-category="电容、电感与交流瞬态" data-search="电容 储能 电荷 纹波">
      <span class="formula-card-category">电容、电感与交流瞬态</span><strong>电容电荷与储能</strong><small>计算电容储存的电荷、能量和给定电流下的纹波。</small>
    </button>
    <button class="formula-card" type="button" data-tool="indenergy" data-category="电容、电感与交流瞬态" data-search="电感 储能 电流 能量">
      <span class="formula-card-category">电容、电感与交流瞬态</span><strong>电感储能</strong><small>根据电感量和电流估算磁场储能。</small>
    </button>
    <button class="formula-card" type="button" data-tool="rc" data-category="模拟滤波器与频率响应" data-search="RC 低通 截止频率 滤波">
      <span class="formula-card-category">模拟滤波器与频率响应</span><strong>RC 截止频率</strong><small>计算一阶 RC 低通或高通的截止频率。</small>
    </button>
    <button class="formula-card" type="button" data-tool="lc" data-category="电容、电感与交流瞬态" data-search="LC 谐振 频率">
      <span class="formula-card-category">电容、电感与交流瞬态</span><strong>LC 谐振频率</strong><small>根据电感与电容计算理想 LC 谐振点。</small>
    </button>
    <button class="formula-card" type="button" data-tool="tau" data-category="电容、电感与交流瞬态" data-search="电容 时间常数 RC 充放电">
      <span class="formula-card-category">电容、电感与交流瞬态</span><strong>RC 时间常数</strong><small>计算电阻、电容组成电路的时间常数。</small>
    </button>
    <button class="formula-card" type="button" data-tool="rctime" data-category="电容、电感与交流瞬态" data-search="RC 上升时间 充电 阈值 延时">
      <span class="formula-card-category">电容、电感与交流瞬态</span><strong>RC 阈值时间</strong><small>计算 RC 充电或放电到指定比例所需的时间。</small>
    </button>
    <button class="formula-card" type="button" data-tool="reactance" data-category="电容、电感与交流瞬态" data-search="电抗 电容 电感 交流 阻抗">
      <span class="formula-card-category">电容、电感与交流瞬态</span><strong>电容/电感电抗</strong><small>在指定频率下计算容抗、感抗和相位趋势。</small>
    </button>
    <button class="formula-card" type="button" data-tool="impedance" data-category="电容、电感与交流瞬态" data-search="RLC 阻抗 相位 交流串联">
      <span class="formula-card-category">电容、电感与交流瞬态</span><strong>串联 RLC 阻抗</strong><small>计算串联 RLC 的阻抗幅值、相位与电流。</small>
    </button>
    <button class="formula-card" type="button" data-tool="rlcq" data-category="电容、电感与交流瞬态" data-search="RLC Q 值 品质因数 带宽">
      <span class="formula-card-category">电容、电感与交流瞬态</span><strong>RLC 品质因数与带宽</strong><small>估算串联 RLC 的 Q 值和近似带宽。</small>
    </button>
    <button class="formula-card" type="button" data-tool="diode" data-category="半导体与开关驱动" data-search="二极管 压降 功耗 电流">
      <span class="formula-card-category">半导体与开关驱动</span><strong>二极管功耗</strong><small>根据正向压降和工作电流估算二极管耗散。</small>
    </button>
    <button class="formula-card" type="button" data-tool="bjt" data-category="半导体与开关驱动" data-search="三极管 BJT 基极 电阻 放大倍数">
      <span class="formula-card-category">半导体与开关驱动</span><strong>BJT 基极电阻</strong><small>按目标集电极电流和强制 β 估算基极驱动电阻。</small>
    </button>
    <button class="formula-card" type="button" data-tool="mosfet" data-category="半导体与开关驱动" data-search="MOSFET 导通损耗 RDS 功率">
      <span class="formula-card-category">半导体与开关驱动</span><strong>MOSFET 导通损耗</strong><small>根据 RMS 电流和 RDS(on) 估算导通发热。</small>
    </button>
    <button class="formula-card" type="button" data-tool="opampbw" data-category="运放、比较器与模拟前端" data-search="运放 GBW 带宽 噪声增益 压摆率">
      <span class="formula-card-category">运放、比较器与模拟前端</span><strong>运放带宽与压摆率</strong><small>用 GBW、噪声增益和输出幅度检查速度余量。</small>
    </button>
    <button class="formula-card" type="button" data-tool="dspower" data-category="噪声、分贝与信号质量" data-search="dBm dBW 功率 分贝">
      <span class="formula-card-category">噪声、分贝与信号质量</span><strong>W、dBW、dBm 换算</strong><small>在功率单位之间快速换算，默认参考阻抗为 50 Ω。</small>
    </button>
    <button class="formula-card" type="button" data-tool="wavelength" data-category="射频、通信与 EMC" data-search="波长 频率 传播速度">
      <span class="formula-card-category">射频、通信与 EMC</span><strong>频率与波长</strong><small>根据频率和传播速度计算波长。</small>
    </button>
    <button class="formula-card" type="button" data-tool="trace" data-category="PCB 与信号完整性" data-search="PCB 走线 载流 电流">
      <span class="formula-card-category">PCB 与信号完整性</span><strong>PCB 走线载流</strong><small>用 IPC-2221 外层近似估算线宽或载流能力。</small>
    </button>
    <button class="formula-card" type="button" data-tool="delay" data-category="PCB 与信号完整性" data-search="传输线 延时 走线 长度 高速">
      <span class="formula-card-category">PCB 与信号完整性</span><strong>走线传播延时</strong><small>根据走线长度和介质传播速度估算飞行时间。</small>
    </button>
    <button class="formula-card" type="button" data-tool="adc" data-category="ADC、DAC 与采样" data-search="ADC LSB 分辨率 参考电压 量化">
      <span class="formula-card-category">ADC、DAC 与采样</span><strong>ADC 分辨率与 LSB</strong><small>计算理想步进、量化噪声和输入电压码值。</small>
    </button>
    <button class="formula-card" type="button" data-tool="dbamplitude" data-category="噪声、分贝与信号质量" data-search="dB 电压 电流 幅度 分贝">
      <span class="formula-card-category">噪声、分贝与信号质量</span><strong>电压/电流 dB 换算</strong><small>在幅度比、分贝和增益之间互相换算。</small>
    </button>
    <button class="formula-card" type="button" data-tool="impedancepcb" data-category="PCB 与信号完整性" data-search="PCB 微带 特性阻抗 走线 叠层">
      <span class="formula-card-category">PCB 与信号完整性</span><strong>微带线特性阻抗</strong><small>用常见微带近似式按线宽、介质厚度和介电常数估算阻抗。</small>
    </button>
    <button class="formula-card" type="button" data-tool="pwm" data-category="数字接口、时钟与时序" data-search="PWM 占空比 频率 周期 定时器">
      <span class="formula-card-category">数字接口、时钟与时序</span><strong>PWM 频率与占空比</strong><small>在频率、周期、占空比和高电平时间之间换算。</small>
    </button>
    <button class="formula-card" type="button" data-tool="uart" data-category="数字接口、时钟与时序" data-search="UART 波特率 误差 串口 时钟">
      <span class="formula-card-category">数字接口、时钟与时序</span><strong>UART 波特率误差</strong><small>根据实际时钟和分频值检查串口波特率偏差。</small>
    </button>
    <button class="formula-card" type="button" data-tool="battery" data-category="电池、续航与系统功耗" data-search="电池 续航 容量 电流">
      <span class="formula-card-category">电池、续航与系统功耗</span><strong>电池续航</strong><small>按容量、负载电流和效率估算运行时间。</small>
    </button>
    <button class="formula-card" type="button" data-tool="buck" data-category="电源设计" data-search="Buck 降压 电感 纹波 DC-DC 开关电源">
      <span class="formula-card-category">电源设计</span><strong>Buck 电感纹波</strong><small>估算降压电源的占空比、电感纹波和峰值电流。</small>
    </button>
    <button class="formula-card" type="button" data-tool="ldo" data-category="电源设计" data-search="LDO 压差 功耗 结温 热阻">
      <span class="formula-card-category">电源设计</span><strong>LDO 功耗与结温</strong><small>检查输入输出压差带来的热耗散和结温。</small>
    </button>
    <button class="formula-card" type="button" data-tool="thermal" data-category="热设计与散热" data-search="热阻 结温 散热 功耗 温升">
      <span class="formula-card-category">热设计与散热</span><strong>热阻链与结温</strong><small>按环境温度、功耗和热阻链计算结温。</small>
    </button>
    <button class="formula-card" type="button" data-tool="ripple" data-category="电源设计" data-search="电源 输出纹波 电容 ESR 开关电源">
      <span class="formula-card-category">电源设计</span><strong>Buck 输出开关纹波</strong><small>按电感纹波电流、开关频率、电容和 ESR 估算输出纹波。</small>
    </button>
    <button class="formula-card" type="button" data-tool="opamp" data-category="运放、比较器与模拟前端" data-search="运放 增益 同相 反相">
      <span class="formula-card-category">运放、比较器与模拟前端</span><strong>运放闭环增益</strong><small>计算同相或反相运放的理想闭环增益。</small>
    </button>
  </div>
  <p class="formula-empty" id="formula-empty" hidden>没有找到匹配的工具。</p>
  <p class="formula-note">计算结果用于前期估算。器件容差、温升、布局、寄生参数和数据手册限制仍需在设计评审与实测中确认。</p>

  <section class="formula-library" id="formula-library" aria-labelledby="formula-library-heading">
    <div class="section-heading"><h2 id="formula-library-heading">领域公式库</h2><span>18 个领域 · 180 组公式</span></div>
    <p class="formula-library-intro">选择领域查看公式、适用条件和专题范围；也可按名称、变量或专题搜索。</p>
    <div class="formula-library-controls">
      <label class="formula-search formula-library-search" for="formula-library-search"><span aria-hidden="true">⌕</span><input id="formula-library-search" type="search" placeholder="搜索公式、变量或专题" autocomplete="off"></label>
      <label class="formula-library-domain" for="formula-library-domain"><span>查看领域</span><select id="formula-library-domain">
        <option value="全部">全部领域</option>
        {% for domain in site.data.formula_catalog %}<option value="{{ domain.name | escape }}">{{ domain.id }} · {{ domain.name | escape }}</option>{% endfor %}
      </select></label>
    </div>
    <div class="formula-library-count" id="formula-library-count" aria-live="polite">180 组公式</div>
    <div class="formula-domain-list">
      {% for domain in site.data.formula_catalog %}
      <details class="formula-domain" data-domain="{{ domain.name | escape }}">
        <summary><span class="formula-domain-number">{{ domain.id }}</span><span class="formula-domain-name">{{ domain.name | escape }}</span><span class="formula-domain-count">{{ domain.formulas.size }} 组</span></summary>
        <p class="formula-domain-topics">专题：{{ domain.topics | escape }}</p>
        <div class="formula-entry-list">
          {% for formula in domain.formulas %}
          <article class="formula-entry" data-search="{{ formula.id }} {{ formula.title | escape }} {{ formula.expression | escape }} {{ formula.conditions | escape }} {{ domain.name | escape }} {{ domain.topics | escape }}">
            <div class="formula-entry-heading"><span class="formula-entry-id">{{ formula.id }}</span><h3>{{ formula.title | escape }}</h3></div>
            <code class="formula-entry-expression">{{ formula.expression | escape }}</code>
            <p>{{ formula.conditions | escape }}</p>
          </article>
          {% endfor %}
        </div>
      </details>
      {% endfor %}
    </div>
    <p class="formula-empty" id="formula-library-empty" hidden>没有找到匹配的公式。</p>
  </section>

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
  <div class="formula-dialog-header"><div><h2 id="formula-dialog-title"></h2><p id="formula-dialog-subtitle"></p></div><div class="formula-dialog-actions"><button class="formula-dialog-reset" type="button" aria-label="重置参数">重置</button><button class="formula-close" type="button" aria-label="关闭计算器">×</button></div></div>
  <div class="formula-dialog-detail" id="formula-dialog-detail"></div>
  <form class="formula-form" id="formula-form"></form>
  <div class="formula-result" id="formula-result"><span class="formula-result-label">计算结果</span><strong id="formula-result-value">请输入参数</strong><p id="formula-result-note"></p><button class="formula-dialog-copy" type="button">复制结果</button></div>
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
    resnet: { title: '电阻串并联', subtitle: '串联：Req = R1 + R2；并联：Req = R1R2 ÷ (R1 + R2)', fields: [['mode', '连接方式', 'select', [['串联', 'series'], ['并联', 'parallel']]], ['r1', '电阻 R1（Ω）', 'number'], ['r2', '电阻 R2（Ω）', 'number']], calc: v => ({ value: format(v.mode === 'series' ? v.r1 + v.r2 : v.r1 * v.r2 / (v.r1 + v.r2), 'Ω'), note: v.mode === 'series' ? '串联电流相同，电阻直接相加。' : '并联两端电压相同，等效电阻小于任一支路。' }) },
    respower: { title: '电阻功率与电流', subtitle: 'P = V² ÷ R = I²R', fields: [['v', '电阻两端电压 V（V）', 'number'], ['r', '电阻 R（Ω）', 'number']], calc: v => ({ value: `${format(v.v * v.v / v.r, 'W')} · ${format(v.v / v.r, 'A')}`, note: '结果依次为耗散功率和电流；选型时应留出温升与脉冲余量。' }) },
    capenergy: { title: '电容电荷与储能', subtitle: 'Q = CV；E = 1/2·CV²；ΔV ≈ IΔt/C', fields: [['c', '电容 C（F）', 'number'], ['v', '电压 V（V）', 'number'], ['i', '负载电流 I（A）', 'number'], ['dt', '保持时间 Δt（s）', 'number']], calc: v => ({ value: `Q=${format(v.c * v.v, 'C')} · E=${format(0.5 * v.c * v.v * v.v, 'J')} · ΔV=${format(v.i * v.dt / v.c, 'V')}`, note: '纹波估算未计入 ESR、控制环响应和电容偏置降额。' }) },
    indenergy: { title: '电感储能', subtitle: 'E = 1/2·LI²', fields: [['l', '电感 L（H）', 'number'], ['i', '电流 I（A）', 'number']], calc: v => ({ value: format(0.5 * v.l * v.i * v.i, 'J'), note: '还要核对饱和电流、直流电阻和关断时的能量释放路径。' }) },
    rc: { title: 'RC 截止频率', subtitle: 'fc = 1 ÷ (2πRC)', fields: [['r', '电阻 R（Ω）', 'number'], ['c', '电容 C（F）', 'number']], calc: v => ({ value: format(1 / (2 * Math.PI * v.r * v.c), 'Hz'), note: '一阶 RC 低通/高通的 -3 dB 截止频率。' }) },
    lc: { title: 'LC 谐振频率', subtitle: 'f0 = 1 ÷ (2π√(LC))', fields: [['l', '电感 L（H）', 'number'], ['c', '电容 C（F）', 'number']], calc: v => ({ value: format(1 / (2 * Math.PI * Math.sqrt(v.l * v.c)), 'Hz'), note: '理想 LC 模型，实际频率会受寄生参数和负载影响。' }) },
    tau: { title: 'RC 时间常数', subtitle: 'τ = R × C', fields: [['r', '电阻 R（Ω）', 'number'], ['c', '电容 C（F）', 'number']], calc: v => ({ value: format(v.r * v.c, 's'), note: '充电约 1τ 达到 63.2%，约 5τ 接近稳态。' }) },
    rctime: { title: 'RC 阈值时间', subtitle: '充电：t=-RC·ln(1-a)；放电：t=-RC·ln(a)', fields: [['mode', '过程', 'select', [['充电', 'charge'], ['放电', 'discharge']]], ['r', '电阻 R（Ω）', 'number'], ['c', '电容 C（F）', 'number'], ['ratio', '目标比例 a（%）', 'number']], calc: v => { const a = v.ratio / 100; if (!(a > 0 && a < 1)) throw new Error('目标比例应在 0% 到 100% 之间'); const time = v.mode === 'charge' ? -v.r * v.c * Math.log(1 - a) : -v.r * v.c * Math.log(a); return { value: format(time, 's'), note: '目标比例应在 0% 到 100% 之间；实际阈值还受源阻抗和输入漏电影响。' }; } },
    reactance: { title: '电容/电感电抗', subtitle: 'XC = 1 ÷ (2πfC)，XL = 2πfL', fields: [['mode', '元件类型', 'select', [['电容 C', 'c'], ['电感 L', 'l']]], ['f', '频率 f（Hz）', 'number'], ['component', '元件值（F 或 H）', 'number']], calc: v => { const x = v.mode === 'c' ? 1 / (2 * Math.PI * v.f * v.component) : 2 * Math.PI * v.f * v.component; return { value: format(x, 'Ω'), note: v.mode === 'c' ? '容抗随频率升高而降低，电流相位超前电压。' : '感抗随频率升高而增加，电流相位滞后电压。' }; } },
    impedance: { title: '串联 RLC 阻抗', subtitle: '|Z| = √(R² + (XL - XC)²)', fields: [['r', '电阻 R（Ω）', 'number'], ['l', '电感 L（H）', 'number'], ['c', '电容 C（F）', 'number'], ['f', '频率 f（Hz）', 'number'], ['v', '输入 RMS 电压（V）', 'number']], calc: v => { const xl = 2 * Math.PI * v.f * v.l; const xc = 1 / (2 * Math.PI * v.f * v.c); const x = xl - xc; const z = Math.hypot(v.r, x); return { value: `${format(z, 'Ω')} · ${format(v.v / z, 'A')}`, note: `相位 ${(Math.atan2(x, v.r) * 180 / Math.PI).toFixed(3)}°；XL=${format(xl, 'Ω')}，XC=${format(xc, 'Ω')}。` }; } },
    rlcq: { title: 'RLC 品质因数与带宽', subtitle: 'Q = √(L/C) ÷ R；BW ≈ f0/Q', fields: [['r', '串联电阻 R（Ω）', 'number'], ['l', '电感 L（H）', 'number'], ['c', '电容 C（F）', 'number']], calc: v => { const f0 = 1 / (2 * Math.PI * Math.sqrt(v.l * v.c)); const q = Math.sqrt(v.l / v.c) / v.r; return { value: `f0=${format(f0, 'Hz')} · Q=${q.toPrecision(5)} · BW=${format(f0 / q, 'Hz')}`, note: '串联 RLC 的理想近似；电感 DCR、ESR 和负载会降低实际 Q。' }; } },
    diode: { title: '二极管功耗', subtitle: 'PD = VF × IF', fields: [['vf', '正向压降 Vf（V）', 'number'], ['i', '正向电流 IF（A）', 'number']], calc: v => ({ value: format(v.vf * v.i, 'W'), note: '还应检查反向耐压、浪涌电流和封装允许的结温。' }) },
    bjt: { title: 'BJT 基极电阻', subtitle: 'RB = (Vdrive - VBE) ÷ IB，IB = IC ÷ βforced', fields: [['vdrive', '驱动电压（V）', 'number'], ['vbe', '基极压降 VBE（V）', 'number'], ['ic', '目标集电极电流 IC（A）', 'number'], ['beta', '强制 β', 'number']], calc: v => { const ib = v.ic / v.beta; return { value: `${format((v.vdrive - v.vbe) / ib, 'Ω')} · IB=${format(ib, 'A')}`, note: '开关应用建议使用强制 β，不能直接套用数据手册中的典型放大倍数。' }; } },
    mosfet: { title: 'MOSFET 导通损耗', subtitle: 'Pcond = Irms² × RDS(on)', fields: [['irms', 'RMS 电流（A）', 'number'], ['rds', 'RDS(on)（Ω）', 'number']], calc: v => ({ value: format(v.irms * v.irms * v.rds, 'W'), note: 'RDS(on) 会随结温、栅极驱动电压和器件批次变化。' }) },
    opampbw: { title: '运放带宽与压摆率', subtitle: 'fBW ≈ GBW ÷ NG；SRreq = 2πfVpk', fields: [['gbw', '增益带宽积 GBW（Hz）', 'number'], ['ng', '噪声增益 NG（倍）', 'number'], ['fmax', '最高信号频率（Hz）', 'number'], ['vpk', '输出峰值（V）', 'number']], calc: v => { const bandwidth = v.gbw / v.ng; const sr = 2 * Math.PI * v.fmax * v.vpk; return { value: `${format(bandwidth, 'Hz')} · SR≥${format(sr, 'V/s')}`, note: '带宽按噪声增益估算；还需检查输出摆幅、负载和稳定性。' }; } },
    dspower: { title: 'W、dBW、dBm 换算', subtitle: 'dBW = 10log10(P / 1W)，dBm = 10log10(P / 1mW)', fields: [['p', '功率 P（W）', 'number']], calc: v => ({ value: `${format(10 * Math.log10(v.p), 'dBW')} · ${format(10 * Math.log10(v.p * 1000), 'dBm')}`, note: `功率 ${format(v.p, 'W')}` }) },
    wavelength: { title: '频率与波长', subtitle: 'λ = v ÷ f', fields: [['f', '频率 f（Hz）', 'number'], ['speed', '传播速度 v（m/s）', 'number']], calc: v => ({ value: format(v.speed / v.f, 'm'), note: '自由空间默认速度约为 3×10^8 m/s；PCB 介质中需使用实际传播速度。' }) },
    trace: { title: 'PCB 走线载流', subtitle: 'IPC-2221 外层近似：I = k × ΔT^0.44 × (W×T)^0.725', fields: [['w', '线宽 W（mil）', 'number'], ['t', '铜厚 T（mil）', 'number'], ['dt', '温升 ΔT（°C）', 'number']], calc: v => ({ value: format(0.048 * v.dt ** 0.44 * (v.w * v.t) ** 0.725, 'A'), note: '这是经验估算，内层、散热条件、铜箔形状和标准版本会改变结果。' }) },
    delay: { title: '走线传播延时', subtitle: 'tpd = length ÷ velocity', fields: [['length', '走线长度（mm）', 'number'], ['velocity', '传播速度（m/s）', 'number']], calc: v => ({ value: format(v.length / 1000 / v.velocity, 's'), note: 'FR-4 微带/带状线的传播速度取决于介电常数和叠层，默认值仅用于估算。' }) },
    adc: { title: 'ADC 分辨率与 LSB', subtitle: 'LSB = Vref ÷ 2^N', fields: [['bits', '分辨率 N（bit）', 'number'], ['vref', '参考电压 Vref（V）', 'number'], ['vin', '输入电压 Vin（V）', 'number']], calc: v => { const levels = 2 ** v.bits; const lsb = v.vref / levels; const code = Math.min(levels - 1, Math.max(0, Math.floor(v.vin / lsb))); return { value: `${format(lsb, 'V')} · code ${code}`, note: `理想量化噪声 RMS 约为 ${format(lsb / Math.sqrt(12), 'V')}；未计入 INL、DNL 和参考源噪声。` }; } },
    dbamplitude: { title: '电压/电流 dB 换算', subtitle: 'dB = 20log10(A2 ÷ A1)', fields: [['mode', '输入类型', 'select', [['幅度比', 'ratio'], ['分贝值', 'db']]], ['x', '数值（比值或 dB）', 'number']], calc: v => { const db = v.mode === 'ratio' ? 20 * Math.log10(v.x) : v.x; const ratio = v.mode === 'ratio' ? v.x : 10 ** (v.x / 20); return { value: `${db.toPrecision(5)} dB · ×${ratio.toPrecision(5)}`, note: '电压和电流使用 20log10；功率比应使用 10log10。' }; } },
    impedancepcb: { title: '微带线特性阻抗', subtitle: 'Z0 ≈ 87/√(εr+1.41) · ln(5.98h/(0.8w+t))', fields: [['w', '线宽 w（mm）', 'number'], ['h', '介质厚度 h（mm）', 'number'], ['t', '铜厚 t（mm）', 'number'], ['er', '介电常数 εr', 'number']], calc: v => { const ratio = 5.98 * v.h / (0.8 * v.w + v.t); if (!(ratio > 1) || !(v.er > 0)) throw new Error('请检查线宽、介质厚度和介电常数'); const z = 87 / Math.sqrt(v.er + 1.41) * Math.log(ratio); return { value: format(z, 'Ω'), note: '这是均匀微带的初选近似，最终应以叠层、阻焊和场求解器结果为准。' }; } },
    pwm: { title: 'PWM 频率与占空比', subtitle: 'T = 1/f；Thigh = D·T', fields: [['f', '频率 f（Hz）', 'number'], ['duty', '占空比 D（%）', 'number']], calc: v => { if (v.duty < 0 || v.duty > 100) throw new Error('占空比应在 0% 到 100% 之间'); const period = 1 / v.f; const high = period * v.duty / 100; return { value: `T=${format(period, 's')} · Thigh=${format(high, 's')} · Tlow=${format(period - high, 's')}`, note: '定时器实际分辨率和时钟分频会让占空比存在量化误差。' }; } },
    uart: { title: 'UART 波特率误差', subtitle: 'Baudactual = Fclk ÷ (16·N)', fields: [['clock', '串口时钟 Fclk（Hz）', 'number'], ['divider', '分频值 N', 'number'], ['target', '目标波特率（Bd）', 'number']], calc: v => { const actual = v.clock / (16 * v.divider); const error = (actual - v.target) / v.target * 100; return { value: `${format(actual, 'Bd')} · 误差 ${error.toPrecision(5)}%`, note: '以 16 倍过采样 UART 为例；还应把收发双方时钟误差和采样点纳入预算。' }; } },
    battery: { title: '电池续航', subtitle: 't = 容量 Ah × 效率 ÷ 负载电流 A', fields: [['cap', '电池容量（Ah）', 'number'], ['i', '平均负载电流（A）', 'number'], ['eff', '可用效率（%）', 'number']], calc: v => ({ value: format(v.cap * v.eff / 100 / v.i, 'h'), note: '未计入温度、老化、峰值电流和保护截止电压。' }) },
    buck: { title: 'Buck 电感纹波', subtitle: 'D ≈ Vout ÷ Vin；ΔIL ≈ (Vin - Vout)D ÷ (Lfs)', fields: [['vin', '输入电压 Vin（V）', 'number'], ['vout', '输出电压 Vout（V）', 'number'], ['l', '电感 L（H）', 'number'], ['fs', '开关频率 fs（Hz）', 'number'], ['iout', '输出电流（A）', 'number']], calc: v => { const duty = v.vout / v.vin; const ripple = (v.vin - v.vout) * duty / (v.l * v.fs); return { value: `D=${(duty * 100).toPrecision(4)}% · ΔIL=${format(ripple, 'A')} · Ipk=${format(v.iout + ripple / 2, 'A')}`, note: '理想 CCM 近似；还需检查最小导通时间、饱和电流、ESR 和环路补偿。' }; } },
    ldo: { title: 'LDO 功耗与结温', subtitle: 'P ≈ (Vin - Vout)Iout；Tj ≈ Ta + PθJA', fields: [['vin', '输入电压 Vin（V）', 'number'], ['vout', '输出电压 Vout（V）', 'number'], ['iout', '输出电流（A）', 'number'], ['theta', '结到环境热阻 θJA（°C/W）', 'number']], calc: v => { const p = (v.vin - v.vout) * v.iout; return { value: `${format(p, 'W')} · T rise ${format(p * v.theta, '°C')}`, note: '输入输出压差越大，LDO 越容易受热限制；还需核对最小压差和限流曲线。' }; } },
    thermal: { title: '热阻链与结温', subtitle: 'Tj = Ta + P × (θJC + θCS + θSA)', fields: [['ta', '环境温度 Ta（°C）', 'number'], ['p', '器件功耗 P（W）', 'number'], ['rjc', 'θJC（°C/W）', 'number'], ['rcs', 'θCS（°C/W）', 'number'], ['rsa', 'θSA（°C/W）', 'number']], calc: v => ({ value: `${(v.ta + v.p * (v.rjc + v.rcs + v.rsa)).toPrecision(5)} °C`, note: `总热阻 ${(v.rjc + v.rcs + v.rsa).toPrecision(4)} °C/W；请与最大结温和降额曲线比较。` }) },
    ripple: { title: 'Buck 输出开关纹波', subtitle: 'ΔVC,pp ≈ ΔIL,pp/(8fsC)；ΔVESR,pp ≈ ΔIL,pp·ESR', fields: [['i', '电感纹波电流 ΔIL,pp（A）', 'number'], ['f', '开关频率 fs（Hz）', 'number'], ['c', '输出电容 C（F）', 'number'], ['esr', '电容 ESR（Ω）', 'number']], calc: v => { const capacitive = v.i / (8 * v.f * v.c); const resistive = v.i * v.esr; return { value: `ΔVC,pp=${format(capacitive, 'V')} · ΔVESR,pp=${format(resistive, 'V')}`, note: '这里的 ΔI 是电感三角纹波峰峰值，不是负载阶跃；两项相加可作保守初估，未计 ESL。' }; } },
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
    resnet: '串联支路电流相同，电阻相加；并联支路电压相同，倒数相加。并联等效值必定小于最小支路。',
    respower: '由 P=VI 与 V=IR 得到 P=V²/R。电阻额定功率应高于计算值，并考虑环境温度和脉冲持续时间。',
    capenergy: '电容定义 Q=CV，储能由对电压积分得到 E=1/2·CV²；在短时间内提供负载电流时，电压变化约为 ΔV=IΔt/C。',
    indenergy: '电感储能来自对电流积分，E=1/2·LI²；电流不能突变，关断时必须给能量提供泄放路径。',
    rc: 'RC 低通 H(s)=1/(1+sRC)，令 |H|=1/√2 得 ωcRC=1，因此 fc=1/(2πRC)。',
    lc: 'RLC 阻抗虚部为 ωL-1/(ωC)，令虚部为零得到 ω0=1/√(LC)。',
    tau: '由电容充放电微分方程得到指数响应；τ=RC 是电压变化到最终值 63.2% 的时间尺度。',
    rctime: '充电电压比例 a=1-e^(-t/RC)，放电比例 a=e^(-t/RC)，分别反解得到目标阈值时间。',
    reactance: '由 ZC=1/(jωC) 与 ZL=jωL 得到容抗 XC 和感抗 XL；ω=2πf。',
    impedance: '把 R、XL、XC 的实部和虚部合成复阻抗，|Z| 决定电流幅值，atan(X/R) 决定相位。',
    rlcq: '串联 RLC 的 Q=ω0L/R=√(L/C)/R，半功率带宽近似为 BW=f0/Q。',
    diode: '器件瞬时功耗近似为端电压与电流的乘积；高温下正向压降和允许功耗都会变化。',
    bjt: '先用 IB=IC/βforced 估算基极电流，再由 KVL：Vdrive=IB·RB+VBE 求 RB。',
    mosfet: '导通阶段 MOSFET 近似为电阻，损耗由 I²RDS(on) 决定；RDS(on) 需按实际栅压和温度取值。',
    opampbw: '单极点运放的闭环带宽约为 GBW/噪声增益；大信号正弦还必须满足 SR≥2πfVpk。',
    dspower: 'dBW 以 1 W 为参考，dBm 以 1 mW 为参考；两者相差 30 dB。',
    wavelength: '一个周期内波传播的距离为 λ=vT，代入 T=1/f 得 λ=v/f。',
    trace: 'IPC-2221 外层经验式把截面积、温升与允许电流联系起来，实际还需按铜厚、层别和热路径修正。',
    delay: '传播延时等于距离除以传播速度；高速判断要把 tpd 与信号边沿时间比较，而不是只看时钟频率。',
    adc: 'N 位 ADC 有 2^N 个量化区间，理想步进为 Vref/2^N；实际精度还受 INL、DNL、参考和噪声影响。',
    dbamplitude: '电压或电流是幅度量，使用 20log10；只有功率比才使用 10log10。',
    impedancepcb: '微带线阻抗由线宽、介质厚度、铜厚和介电常数共同决定；该对数公式适合初步叠层估算。',
    pwm: '周期由 T=1/f 得到，高电平时间为占空比乘以周期，低电平时间为二者之差。',
    uart: '用实际时钟除以 16 倍分频值得到波特率，再与目标值比较百分比误差。',
    battery: '可用能量按容量与效率折算，再除以平均负载电流；峰值电流和截止电压会使实际时间缩短。',
    buck: '理想 Buck 的占空比 D≈Vout/Vin；电感伏秒平衡给出纹波电流，峰值电流决定电感和开关管余量。',
    ldo: 'LDO 的压差全部转化为热功耗，结温升高量近似为 P×θJA，必须与热阻和最大结温一起检查。',
    thermal: '热阻链把结、封装、界面和散热器的温差逐段相加，Tj=Ta+PΣθ。',
    ripple: '输出电容承担开关周期内的电荷变化，产生 ΔI/(8fC) 纹波；ESR 产生瞬时 ΔI·ESR 压降。',
    opamp: '负反馈使 V−≈V+ 且输入电流近似为零；由电阻网络 KCL 分别得到同相与反相增益。'
  };
  const format = (number, unit) => { if (!Number.isFinite(number)) throw new Error('请检查输入参数'); const abs = Math.abs(number); const scale = abs && (abs >= 1e9 ? [1e9, 'G'] : abs >= 1e6 ? [1e6, 'M'] : abs >= 1e3 ? [1e3, 'k'] : abs < 1e-9 ? [1e-9, 'n'] : abs < 1e-6 ? [1e-6, 'μ'] : abs < 1e-3 ? [1e-3, 'm'] : [1, '']); const shown = (number / scale[0]).toPrecision(5).replace(/\.0+$|(?<=\.\d)0+$/, ''); return `${shown} ${scale[1]}${unit}`; };
  const renderForm = (key) => { const tool = tools[key]; document.querySelector('#formula-dialog-title').textContent = tool.title; document.querySelector('#formula-dialog-subtitle').textContent = tool.subtitle; detail.textContent = derivations[key]; form.innerHTML = tool.fields.map(([name, label, type, options]) => type === 'select' ? `<label class="formula-field" for="${fieldId(name)}"><span>${label}</span><select id="${fieldId(name)}" name="${name}">${options.map(([text, option]) => `<option value="${option}">${text}</option>`).join('')}</select></label>` : `<label class="formula-field" for="${fieldId(name)}"><span>${label}</span><input id="${fieldId(name)}" name="${name}" type="number" step="any" inputmode="decimal" required></label>`).join('');
    const defaults = { resistor: { a: 2, b: 7, m: 2, tol: 5 }, ohm: { mode: 'v', v: 5, i: 0.01, r: 500 }, divider: { vin: 5, r1: 10000, r2: 10000 }, led: { vcc: 5, vf: 2, i: 0.01 }, resnet: { mode: 'parallel', r1: 10000, r2: 10000 }, respower: { v: 5, r: 1000 }, capenergy: { c: 10e-6, v: 5, i: 0.1, dt: 1e-6 }, indenergy: { l: 10e-6, i: 2 }, rc: { r: 10000, c: 1e-7 }, lc: { l: 1e-3, c: 1e-6 }, tau: { r: 10000, c: 1e-6 }, rctime: { mode: 'charge', r: 10000, c: 1e-6, ratio: 90 }, reactance: { mode: 'c', f: 1000, component: 1e-6 }, impedance: { r: 10, l: 1e-3, c: 1e-6, f: 10000, v: 1 }, rlcq: { r: 10, l: 1e-3, c: 1e-6 }, diode: { vf: 0.7, i: 0.01 }, bjt: { vdrive: 3.3, vbe: 0.8, ic: 0.1, beta: 10 }, mosfet: { irms: 2, rds: 0.05 }, opampbw: { gbw: 1000000, ng: 2, fmax: 10000, vpk: 1 }, dspower: { p: 1 }, wavelength: { f: 1e8, speed: 3e8 }, trace: { w: 10, t: 1.4, dt: 10 }, delay: { length: 100, velocity: 1.5e8 }, adc: { bits: 12, vref: 3.3, vin: 1.65 }, dbamplitude: { mode: 'ratio', x: 2 }, impedancepcb: { w: 0.3, h: 0.18, t: 0.035, er: 4.2 }, pwm: { f: 10000, duty: 50 }, uart: { clock: 48000000, divider: 26, target: 115200 }, battery: { cap: 2, i: 0.2, eff: 85 }, buck: { vin: 12, vout: 5, l: 22e-6, fs: 500000, iout: 1 }, ldo: { vin: 5, vout: 3.3, iout: 0.2, theta: 60 }, thermal: { ta: 40, p: 1, rjc: 5, rcs: 1, rsa: 20 }, ripple: { i: 1, f: 500000, c: 470e-6, esr: 0.02 }, opamp: { mode: 'non', rf: 10000, rg: 1000 } }[key]; Object.entries(defaults).forEach(([name, initial]) => { const input = form.elements[name]; if (input) input.value = initial; }); form.oninput = () => calculate(key); calculate(key); };
  const calculate = (key) => { const tool = tools[key]; const empty = tool.fields.filter(([, , type]) => type !== 'select').some(([name]) => form.elements[name].value.trim() === ''); if (empty) { result.dataset.state = 'error'; value.textContent = '请输入完整参数'; note.textContent = ''; return; } const values = Object.fromEntries(tool.fields.map(([name, , type]) => [name, type === 'select' ? form.elements[name].value : Number(form.elements[name].value)])); try { const output = tool.calc({ ...values, a: Number(values.a), b: Number(values.b), m: Number(values.m), tol: Number(values.tol) }); result.dataset.state = 'ok'; value.textContent = output.value; note.textContent = output.note; } catch (error) { result.dataset.state = 'error'; value.textContent = error.message; note.textContent = ''; } };
  const cards = [...document.querySelectorAll('.formula-card')];
  let activeTool = '';
  cards.forEach((card, index) => { card.dataset.order = String(index); card.addEventListener('click', () => { activeTool = card.dataset.tool; renderForm(activeTool); dialog.showModal(); }); });
  document.querySelector('.formula-close').addEventListener('click', () => dialog.close());
  document.querySelector('.formula-dialog-reset').addEventListener('click', () => { if (activeTool) renderForm(activeTool); });
  document.querySelector('.formula-dialog-copy').addEventListener('click', async () => { const button = document.querySelector('.formula-dialog-copy'); try { await navigator.clipboard.writeText(`${value.textContent}\n${note.textContent}`); button.textContent = '已复制'; setTimeout(() => { button.textContent = '复制结果'; }, 1200); } catch { button.textContent = '复制失败'; setTimeout(() => { button.textContent = '复制结果'; }, 1200); } });
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  const search = document.querySelector('#formula-search'); const grid = document.querySelector('#formula-grid'); const sort = document.querySelector('#formula-sort'); const count = document.querySelector('#formula-count'); const categorySelect = document.querySelector('#formula-tool-domain'); let category = categorySelect.value;
  count.textContent = String(cards.length);
  const filter = () => { const query = search.value.trim().toLocaleLowerCase(); let visible = 0; cards.forEach((card) => { const match = (category === '全部' || card.dataset.category === category) && (!query || `${card.dataset.search} ${card.textContent}`.toLocaleLowerCase().includes(query)); card.hidden = !match; if (match) visible += 1; }); document.querySelector('#formula-empty').hidden = visible > 0; document.querySelector('#formula-visible-count').textContent = `${visible} 个结果`; };
  const reorder = () => { const sorted = [...cards].sort((a, b) => { if (sort.value === 'name') return a.querySelector('strong').textContent.localeCompare(b.querySelector('strong').textContent, 'zh-CN'); if (sort.value === 'category') return a.dataset.category.localeCompare(b.dataset.category, 'zh-CN') || Number(a.dataset.order) - Number(b.dataset.order); return Number(a.dataset.order) - Number(b.dataset.order); }); sorted.forEach((card) => grid.appendChild(card)); filter(); };
  search.addEventListener('input', filter); sort.addEventListener('change', reorder); categorySelect.addEventListener('change', () => { category = categorySelect.value; filter(); });
  const savedView = (() => { try { return localStorage.getItem('formula-view'); } catch { return null; } })(); if (savedView === 'grid' || savedView === 'list') { grid.dataset.view = savedView; document.querySelectorAll('.formula-view-button').forEach((item) => { item.classList.toggle('is-active', item.dataset.view === savedView); item.setAttribute('aria-pressed', String(item.dataset.view === savedView)); }); }
  document.querySelectorAll('.formula-view-button').forEach((button) => button.addEventListener('click', () => { const view = button.dataset.view; grid.dataset.view = view; try { localStorage.setItem('formula-view', view); } catch {} document.querySelectorAll('.formula-view-button').forEach((item) => { item.classList.toggle('is-active', item === button); item.setAttribute('aria-pressed', String(item === button)); }); }));
  document.querySelector('#formula-reset').addEventListener('click', () => { search.value = ''; category = '全部'; categorySelect.value = category; sort.value = 'default'; grid.dataset.view = 'grid'; document.querySelectorAll('.formula-view-button').forEach((item) => { item.classList.toggle('is-active', item.dataset.view === 'grid'); item.setAttribute('aria-pressed', String(item.dataset.view === 'grid')); }); reorder(); search.focus(); });
  filter();
})();
</script>
<script src="{{ '/assets/formula-catalog.js' | relative_url }}" defer></script>
