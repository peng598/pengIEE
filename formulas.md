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
</div>

<dialog class="formula-dialog" id="formula-dialog" aria-labelledby="formula-dialog-title">
  <div class="formula-dialog-header"><div><h2 id="formula-dialog-title"></h2><p id="formula-dialog-subtitle"></p></div><button class="formula-close" type="button" aria-label="关闭计算器">×</button></div>
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
  const value = document.querySelector('#formula-result-value');
  const note = document.querySelector('#formula-result-note');
  const fieldId = (name) => `formula-${name}`;
  const format = (number, unit) => { if (!Number.isFinite(number)) throw new Error('请检查输入参数'); const abs = Math.abs(number); const scale = abs && (abs >= 1e9 ? [1e9, 'G'] : abs >= 1e6 ? [1e6, 'M'] : abs >= 1e3 ? [1e3, 'k'] : abs < 1e-9 ? [1e-9, 'n'] : abs < 1e-6 ? [1e-6, 'μ'] : abs < 1e-3 ? [1e-3, 'm'] : [1, '']); const shown = (number / scale[0]).toPrecision(5).replace(/\.0+$|(?<=\.\d)0+$/, ''); return `${shown} ${scale[1]}${unit}`; };
  const renderForm = (key) => { const tool = tools[key]; document.querySelector('#formula-dialog-title').textContent = tool.title; document.querySelector('#formula-dialog-subtitle').textContent = tool.subtitle; form.innerHTML = tool.fields.map(([name, label, type, options]) => type === 'select' ? `<label class="formula-field" for="${fieldId(name)}"><span>${label}</span><select id="${fieldId(name)}" name="${name}">${options.map(([text, option]) => `<option value="${option}">${text}</option>`).join('')}</select></label>` : `<label class="formula-field" for="${fieldId(name)}"><span>${label}</span><input id="${fieldId(name)}" name="${name}" type="number" step="any" inputmode="decimal" required></label>`).join('');
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
