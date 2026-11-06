// Original, deterministic engineering figures. Values are declared examples,
// never digitized device specifications or measurements.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'assets', 'engineering');
fs.mkdirSync(out, { recursive: true });
const C = { ink: '#263b43', muted: '#657981', grid: '#e2e9ec', blue: '#167a9b', red: '#c45842', green: '#347d61', gold: '#b27a23' };
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const text = (x, y, value, size = 18, fill = C.ink, anchor = 'start') => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" text-anchor="${anchor}">${esc(value)}</text>`;
const line = (x1, y1, x2, y2, color = C.ink, width = 2, dash = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
const arrow = (x1, y1, x2, y2, color = C.blue) => `<path d="M${x1},${y1} L${x2},${y2}" fill="none" stroke="${color}" stroke-width="2.5" marker-end="url(#arrow)"/>`;
const rect = (x, y, w, h, fill = '#f3f7f8', stroke = C.grid, radius = 5) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="${stroke}"/>`;
const dot = (x, y, color = C.ink) => `<circle cx="${x}" cy="${y}" r="4" fill="${color}"/>`;
const poly = (points, color = C.blue, width = 3, dash = '') => `<polyline points="${points.map(p => p.map(v => Number(v.toFixed(2))).join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
const gnd = (x, y) => line(x, y, x, y + 10) + line(x - 16, y + 10, x + 16, y + 10) + line(x - 10, y + 17, x + 10, y + 17) + line(x - 4, y + 24, x + 4, y + 24);
const resistor = (x1, y, x2, label, color = C.ink) => {
  const center = (x1 + x2) / 2;
  return line(x1, y, center - 32, y, color) + rect(center - 32, y - 12, 64, 24, '#fff', color, 0) + line(center + 32, y, x2, y, color) + text(center, y - 24, label, 18, color, 'middle');
};
const capacitor = (x, y1, y2, label) => {
  const m = (y1 + y2) / 2;
  return line(x, y1, x, m - 5) + line(x - 20, m - 5, x + 20, m - 5) + line(x - 20, m + 5, x + 20, m + 5) + line(x, m + 5, x, y2) + text(x + 28, m + 6, label);
};
const footer = (a, b) => rect(30, 447, 900, 70, '#f1f6f6', 'none') + text(48, 473, a, 17) + text(48, 500, b, 17, C.muted);
const legend = (items, y = 110) => items.map(([label, color], i) => line(100 + i * 255, y - 5, 131 + i * 255, y - 5, color, 3) + text(140 + i * 255, y, label, 17)).join('');
function chart({ xmin, xmax, ymin, ymax, xticks, yticks, logX = false, logY = false, xLabel, yLabel }) {
  const f = (v, a, b, log) => log ? (Math.log10(v) - Math.log10(a)) / (Math.log10(b) - Math.log10(a)) : (v - a) / (b - a);
  const x = (v) => 100 + 750 * f(v, xmin, xmax, logX);
  const y = (v) => 400 - 250 * f(v, ymin, ymax, logY);
  let svg = '';
  for (const [v, label] of xticks) svg += line(x(v), 150, x(v), 400, C.grid, 1) + text(x(v), 425, label, 16, C.muted, 'middle');
  for (const [v, label] of yticks) svg += line(100, y(v), 850, y(v), C.grid, 1) + text(88, y(v) + 6, label, 16, C.muted, 'end');
  svg += line(100, 150, 100, 400) + line(100, 400, 850, 400) + text(30, 134, yLabel, 16, C.muted) + text(920, 425, xLabel, 16, C.muted, 'end');
  const curve = (fn, color, dash = '') => poly(Array.from({ length: 401 }, (_, i) => {
    const v = logX ? xmin * (xmax / xmin) ** (i / 400) : xmin + (xmax - xmin) * i / 400;
    return [x(v), y(Math.max(ymin, Math.min(ymax, fn(v))))];
  }), color, 3, dash);
  return { svg, x, y, curve };
}
const figures = [];
function save(id, title, subtitle, body, description, pages, explanation) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" width="960" height="540" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)}</title><desc id="desc">${esc(description)}</desc>
<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10Z" fill="#507880"/></marker></defs>
<rect width="960" height="540" fill="#fff"/><g font-family="Segoe UI, Microsoft YaHei, sans-serif">${text(30, 43, title, 28)}${text(30, 77, subtitle, 17, C.muted)}${body}</g></svg>\n`;
  fs.writeFileSync(path.join(out, `${id}.svg`), svg);
  figures.push({ id, title, src: `/assets/engineering/${id}.svg`, alt: description, caption: '原创工程示意；图中参数为声明的假设条件。窄屏可左右滑动，或打开大图。', pages, explanation });
}

// 01: A loaded divider and a finite acquisition window.
{
  let s = text(70, 170, 'Vin', 22) + line(105, 180, 200, 180);
  s += resistor(200, 180, 380, 'R1 = 90 kΩ') + line(380, 180, 520, 180) + dot(420, 180);
  s += line(420, 180, 420, 230) + rect(408, 230, 24, 64, '#fff', C.ink, 0) + line(420, 294, 420, 330) + gnd(420, 330) + text(455, 267, 'R2 = 10 kΩ');
  s += dot(550, 180) + line(520, 180, 550, 180) + line(550, 180, 602, 155) + dot(616, 180) + line(616, 180, 730, 180);
  s += text(548, 130, '采样开关') + capacitor(730, 180, 315, 'Cs = 20 pF') + gnd(730, 315);
  s += text(160, 390, 'V∞ = 0.1 Vin', 21, C.blue) + text(470, 390, 'Rth = R1 ∥ R2 = 9 kΩ', 21, C.blue);
  s += footer('假设 Ron = 0，源阻抗为零：τ = Rth Cs = 180 ns；满量程阶跃按单极点建立。', '12 位、误差 ≤ 0.5 LSB：tacq ≥ τ ln(8192) ≈ 1.62 μs；真实前端还要计入开关与驱动器。');
  save('divider-acquisition', '分压精度还受采样建立时间限制', '电阻比决定静态增益；Thevenin 电阻决定对采样电容的充电速度。', s,
    '90千欧与10千欧分压的输出通过采样开关连接20皮法电容。等效电阻9千欧，时间常数180纳秒，12位满幅建立需约1.62微秒。',
    ['/hardware/electronic-basics/resistor/basics/', '/hardware/electronic-basics/data-converters/adc/', '/notes/adc精度/'],
    '图中的 1.62 μs 是**满量程跳变、单极点且采样电容初态最坏**时的计算值。多路复用 ADC 切换通道可能触发这个条件；固定直流输入连续采样却可能掩盖问题。将采样窗口加倍后误差显著下降，提示建立不足；改变分压阻值而保持比例不变，可进一步区分静态比例误差与驱动问题。');
}
// 02: Computed impedance, not a hand-drawn promise of damping.
{
  const z = (f, cap, esl, esr) => [esr, 2 * Math.PI * f * esl - 1 / (2 * Math.PI * f * cap)];
  const mag = ([r, x]) => Math.hypot(r, x);
  const za = f => z(f, 10e-6, 1e-9, 8e-3), zb = f => z(f, 100e-9, .5e-9, 20e-3);
  const total = (f) => { const a = za(f), b = zb(f), da = mag(a) ** 2, db = mag(b) ** 2; return 1 / Math.hypot(a[0] / da + b[0] / db, -a[1] / da - b[1] / db); };
  const p = chart({ xmin: 1e5, xmax: 1e8, ymin: .001, ymax: 20, logX: true, logY: true, xticks: [[1e5, '100 k'], [1e6, '1 M'], [1e7, '10 M'], [1e8, '100 M']], yticks: [[.001, '0.001'], [.01, '0.01'], [.1, '0.1'], [1, '1'], [10, '10']], xLabel: 'Hz', yLabel: '|Z| / Ω' });
  let s = legend([['10 μF 支路', C.blue], ['100 nF 支路', C.gold], ['两支路并联', C.red]]) + p.svg + p.curve(f => mag(za(f)), C.blue) + p.curve(f => mag(zb(f)), C.gold) + p.curve(total, C.red);
  s += footer('10 μF：ESL 1 nH、ESR 8 mΩ；100 nF：ESL 0.5 nH、ESR 20 mΩ。', '并联支路的电纳可能相消，形成反谐振峰；此图未计 DC Bias、平面与安装寄生的频率依赖。');
  save('capacitor-antiresonance', '不同电容并联后的反谐振', '以复阻抗计算 Ztotal = 1 / (1/Z1 + 1/Z2)，不能把两条幅度曲线直接相加。', s,
    '对数坐标展示10微法与100纳法电容的串联RLC阻抗及并联总阻抗，红线在两支路的自谐振频率之间出现反谐振峰。',
    ['/hardware/electronic-basics/capacitor/basics/', '/hardware/electronic-basics/ferrite-bead/applications/', '/notes/ferrite-bead-selection/', '/notes/lc-filter-design/'],
    '蓝、金两支路各有低阻抗点，红色总阻抗却可能在中间频段上升。关注**峰值幅度、频率和负载激励频谱是否重合**，再决定增加损耗、改变安装位置或调整容量。给某一支路串阻会同时改变损耗与谷值；应使用带偏置的阻抗模型复算，并以实际测试板确认。');
}
// 03: Exact linear CCM example.
{
  const period = 2, duty = 5 / 12, delta = 7 / 10e-6 * duty / 500e3;
  const p = chart({ xmin: 0, xmax: 4, ymin: 2.6, ymax: 3.4, xticks: [[0, '0'], [duty * 2, '0.833'], [2, '2.0'], [2 + duty * 2, '2.833'], [4, '4.0']], yticks: [[2.7, '2.7'], [3, '3.0'], [3.3, '3.3']], xLabel: 'μs', yLabel: 'iL / A' });
  let s = p.svg;
  for (let n = 0; n < 2; n++) s += rect(p.x(n * period), 150, p.x(n * period + duty * period) - p.x(n * period), 250, '#167a9b0d', 'none', 0);
  const pts = [[0, 3 - delta / 2], [duty * period, 3 + delta / 2], [period, 3 - delta / 2], [period * (1 + duty), 3 + delta / 2], [period * 2, 3 - delta / 2]];
  s += poly(pts.map(([t, i]) => [p.x(t), p.y(i)]), C.blue) + line(100, p.y(3), 850, p.y(3), C.muted, 1.5, '6 5');
  s += text(102, 120, '导通斜率 +0.7 A/μs', 18, C.blue) + text(490, 120, '关断斜率 −0.5 A/μs', 18, C.red);
  s += footer('理想 CCM：12 V → 5 V，500 kHz，10 μH，负载 3 A；ΔIL ≈ 0.583 A。', '峰值 3.292 A、谷值 2.708 A；IL,rms = √(Io² + ΔIL²/12) ≈ 3.005 A。');
  save('buck-current', 'Buck 电感电流：斜率、峰值与 RMS', '阴影为高侧开关导通区间；忽略压降、死区、饱和及控制器频率变化。', s,
    'Buck电感电流在2.708安与3.292安之间呈三角波，导通0.833微秒，周期2微秒，虚线表示3安平均值。',
    ['/hardware/electronic-basics/inductor/basics/', '/hardware/power-design/power-basics/topology/', '/notes/dc-dc/'],
    '把实测上升斜率与 $(V_{in}-V_o)/L$ 对照，再看峰值是否接近限流。若同一导通段越往后斜率越陡，应排查偏置降感、饱和和探头带宽，而不是只改补偿。导通损耗使用 RMS，限流与饱和使用峰值，磁芯损耗还取决于波形和磁通摆幅。');
}
// 04: Conceptual charge axis, explicitly not a measured timing plot.
{
  let s = text(55, 132, 'VGS', 21, C.blue) + text(55, 286, 'VDS', 21, C.red);
  s += line(120, 240, 875, 240) + line(120, 390, 875, 390) + line(120, 140, 120, 390, C.grid);
  s += rect(350, 140, 230, 250, '#b27a2312', 'none', 0);
  s += poly([[120, 235], [350, 185], [580, 185], [830, 142]], C.blue);
  s += poly([[120, 285], [350, 285], [580, 380], [830, 380]], C.red);
  s += text(205, 270, 'Qgs', 19) + text(460, 270, 'Qgd', 19, C.gold, 'middle') + text(740, 270, '后续充电', 18);
  s += text(465, 165, '米勒平台（示意）', 18, C.gold, 'middle') + text(875, 420, '累计栅极电荷 Qg →', 18, C.muted, 'end');
  s += footer('假设平台电荷 Qgd = 8 nC，平台平均栅极电流 0.20 A：转换段约 40 ns。', 'Qgd、平台电压与 VDS / ID 有关；图中平台高度和宽度不代表任何具体 MOSFET。');
  save('mosfet-miller', '米勒平台对应漏极电压转换', '横轴是栅极电荷，不能直接把图中的水平宽度读作时间。', s,
    '上方栅源电压曲线在米勒段形成平台，下方漏源电压在同一电荷区间下降。Qgd除以平台栅极电流可估转换时间。',
    ['/hardware/electronic-basics/mosfet/basics/', '/hardware/electronic-basics/mosfet/applications/', '/notes/mos/'],
    String.raw`平台期间栅极电流主要用于改变栅漏电荷。计算 $t\approx Q_{gd}/I_g$ 时，$I_g$ 应由驱动电压减平台电压后，除以驱动器、外部栅阻与内部栅阻之和来估计。缩小栅阻会加快转换，也会增加振铃、共源电感反馈和误导通风险，必须同时测量器件引脚处的 VGS 与 VDS。`);
}
// 05: A consistent load-line intersection.
{
  const current = (48 - 24) / (2 + .3), voltage = 24 + .3 * current;
  const p = chart({ xmin: 0, xmax: 16, ymin: 0, ymax: 55, xticks: [[0, '0'], [4, '4'], [8, '8'], [12, '12'], [16, '16']], yticks: [[0, '0'], [12, '12'], [24, '24'], [36, '36'], [48, '48']], xLabel: 'I / A', yLabel: 'V / V' });
  let s = legend([['源负载线 48 − 2I', C.blue], ['TVS 近似 24 + 0.3I', C.red]]) + p.svg + p.curve(i => 48 - 2 * i, C.blue) + p.curve(i => 24 + .3 * i, C.red);
  s += dot(p.x(current), p.y(voltage), C.green) + text(p.x(current) + 12, p.y(voltage) - 20, '10.43 A / 27.13 V', 19, C.green);
  s += footer('假设浪涌源瞬时为 48 V、源阻抗 2 Ω；TVS 脉冲区线性化为 V = 24 + 0.3I。', '实际引脚电压还包含走线 L·di/dt；不能仅以 VRWM 或 VBR 判断后级是否得到保护。');
  save('tvs-load-line', 'TVS 钳位必须与浪涌源共同求解', '负载线交点表示同一时刻的近似工作点，不替代完整浪涌能量与热分析。', s,
    '蓝色浪涌源负载线与红色TVS近似伏安曲线相交于10.43安、27.13伏，说明钳位电压取决于浪涌源阻抗和动态电阻。',
    ['/hardware/electronic-basics/tvs/parameters/', '/hardware/electronic-basics/tvs/applications/', '/notes/电源输入保护/'],
    String.raw`把后级可承受电压、TVS 电压公差和安装电感一起放进保护预算。该图只取单个瞬时点；评估吸收能量需要积分 $\int v(t)i(t)\,dt$，还要使用对应脉宽、温度和重复率的额定曲线。减小 TVS 到回流点的环路，往往比单纯更换更大峰值功率器件更直接。`);
}
// 06: TIA noise gain and a one-pole amplifier model.
{
  const rf = 100e3, cin = 20e-12, cf = 2e-12;
  const ng = f => 20 * Math.log10(Math.hypot(1, 2 * Math.PI * f * rf * (cin + cf)) / Math.hypot(1, 2 * Math.PI * f * rf * cf));
  const a = f => 20 * Math.log10(1e5 / Math.hypot(1, f / 100));
  const p = chart({ xmin: 1e3, xmax: 1e8, ymin: -20, ymax: 85, logX: true, xticks: [[1e3, '1 k'], [1e4, '10 k'], [1e5, '100 k'], [1e6, '1 M'], [1e7, '10 M'], [1e8, '100 M']], yticks: [[-20, '−20'], [0, '0'], [20, '20'], [40, '40'], [60, '60'], [80, '80']], xLabel: 'Hz', yLabel: 'dB' });
  let s = legend([['开环增益 |A|', C.blue], ['噪声增益 |1/β|', C.red]]) + p.svg + p.curve(a, C.blue) + p.curve(ng, C.red);
  s += footer('示例 TIA：Rf = 100 kΩ，Cin = 20 pF，Cf = 2 pF；NG = (1+sRf(Cin+Cf))/(1+sRfCf)。', '运放仅用 A0 = 100000、主极点 100 Hz 模型；实际稳定性必须加入额外极点和相位。');
  save('opamp-noise-gain', '跨阻放大器的噪声增益与交越', '输入电容改变反馈因子；只看信号增益或 GBW，不能得出相位裕量。', s,
    '开环增益随频率下降，跨阻反馈噪声增益从0dB上升并趋于20.83dB，反馈电容限制高频噪声增益。',
    ['/hardware/electronic-basics/op-amp/applications/', '/notes/负反馈电容/', '/notes/op-amp-phase-shift/'],
    String.raw`此例噪声增益零点约 72.3 kHz、极点约 795.8 kHz，高频渐近值为 $1+C_{in}/C_f=11$。交越附近要查看 $A\beta$ 的相位，不能用两条幅值曲线的交点单独宣告稳定。增大 Cf 通常降低信号带宽，也改变噪声积分；应连同上升时间、过冲和输出噪声一起验收。`);
}
// 07: Lossless source termination, including the return arrival.
{
  let s = text(180, 125, '源端：Rdriver + Rs = Z0', 20, C.blue, 'middle') + text(740, 125, '接收端：高阻', 20, C.red, 'middle');
  s += line(180, 145, 180, 420, C.muted, 1.5, '5 5') + line(740, 145, 740, 420, C.muted, 1.5, '5 5');
  s += arrow(185, 175, 735, 285) + arrow(735, 285, 185, 395, C.red);
  s += text(155, 181, '0', 18, C.muted, 'end') + text(765, 291, 'td', 18, C.muted) + text(155, 401, '2td', 18, C.muted, 'end');
  s += text(455, 205, '发出 1.65 V 行波 →', 20, C.blue, 'middle') + text(450, 370, '← 反射 +1.65 V（ΓL = +1）', 20, C.red, 'middle');
  s += rect(560, 300, 350, 42, '#f9efeb', 'none') + text(575, 328, '接收端在 td 时达到 3.3 V', 19, C.red);
  s += footer('理想条件：3.3 V 阶跃，Rdriver = 15 Ω，Rs = 35 Ω，Z0 = 50 Ω，接收端开路。', '源端反射系数 ΓS = 0，返回波在源端被吸收；途中分支或多个接收端会改变这一结论。');
  save('source-termination', '源端串联端接的行波往返', '纵向表示传播时间；图中两条竖线是源端和负载位置，不是电流方向。', s,
    '匹配源端发出1.65伏行波，高阻接收端在单程延迟td时反射相同幅度并达到3.3伏，反射波在2td回到源端后被匹配吸收。',
    ['/notes/源端匹配/', '/notes/impedance-matching/', '/notes/termination-resistor-placement/'],
    '接收端看到完整电平，并不意味着线上所有位置同时达到该电平。中途挂接负载可能看到较长的半幅平台，所以源端端接适合相应的点到点拓扑。串联电阻靠近驱动器放置；调试时同时记录驱动器输出阻抗的工作点、边沿、线长和接收端输入电容。');
}
// 08: Sense connections are explicitly separated from force current.
{
  let s = arrow(70, 210, 210, 210, C.red) + text(70, 180, '功率电流 5 A', 20, C.red);
  s += resistor(210, 210, 390, '铜箔 2 mΩ', C.red) + resistor(390, 210, 670, '分流器 10 mΩ', C.red) + arrow(670, 210, 880, 210, C.red);
  s += dot(430, 210) + dot(630, 210) + line(430, 210, 430, 290, C.blue) + line(630, 210, 630, 290, C.blue);
  s += line(430, 290, 485, 290, C.blue) + line(630, 290, 575, 290, C.blue) + rect(485, 265, 90, 80, '#eff7fa', C.blue) + text(530, 300, '检测', 20, C.blue, 'middle') + text(530, 326, '50 mV', 18, C.blue, 'middle');
  s += text(230, 386, '若把左侧铜箔压降计入：+10 mV → +20% 读数误差', 21, C.red);
  s += footer('四线采样从器件规定的 Kelvin 感测点引出；功率焊盘与细采样线的连接位置不可随意替代。', '此图说明直流连接误差；高速电流检测还要分析共模阶跃、寄生电感、放大器建立与滤波。');
  save('kelvin-sensing', 'Kelvin 采样把功率压降排除在测量之外', '红线输送负载电流；蓝线为高输入阻抗的独立感测连接。', s,
    '5安功率电流流过2毫欧铜箔和10毫欧分流器。独立蓝色感测线只取分流器两端50毫伏，避免铜箔10毫伏导致20%误差。',
    ['/hardware/electronic-basics/resistor/applications/', '/hardware/power-design/power-test/efficiency-thermal/', '/notes/adc-divider-noise/'],
    '示意图忽略感测输入偏置电流与热电势。毫欧测量不仅要四线连接，还要限制热梯度、保持两侧滤波对称，并区分电流零点与增益误差。验证时以已知正负电流拟合斜率和偏置，在冷态、热稳态与实际共模电压下重复比较。');
}
// 09: Half-buffer handoff, not a claim that a flag protects DMA memory.
{
  let s = text(50, 142, '循环缓冲区', 20);
  for (let i = 0; i < 16; i++) s += rect(50 + i * 53, 165, 50, 65, i < 8 ? '#e5f1f7' : '#e9f3eb', '#fff', 0) + text(75 + i * 53, 204, String(i), 18, C.ink, 'middle');
  s += text(255, 260, 'A 半区：已完成，CPU 消费', 21, C.blue, 'middle') + text(685, 260, 'B 半区：DMA 正在写入', 21, C.green, 'middle');
  const labels = ['DMA 写 A', 'A 完成 / 发布', 'CPU 读 A', 'A 已消费'];
  labels.forEach((v, i) => { s += rect(50 + i * 225, 315, 185, 57, '#f4f7f8', C.grid) + text(143 + i * 225, 350, v, 19, C.ink, 'middle'); if (i < 3) s += arrow(240 + i * 225, 343, 270 + i * 225, 343); });
  s += text(50, 412, '截止时间：DMA 写完 B、再次回到 A 之前，CPU 必须完成读取或复制。', 20, C.red);
  s += footer('例：UART 1 Mbaud、8N1，数据率约 100 kB/s；512 B 半区对应约 5.12 ms。', '5.12 ms 还要扣除中断、调度和抢占延迟；带 Cache 的 MCU 另需保证 DMA 与 CPU 一致性。');
  save('dma-ownership', 'DMA 半缓冲交接的所有权与截止时间', '完成标志只能发布状态；它不能阻止 DMA 绕回并覆盖尚未处理的数据。', s,
    '16格循环缓冲分为A和B两个半区。CPU读取已完成的A时DMA写B，CPU必须在DMA再次回到A前读完，否则发生覆盖。',
    ['/notes/uart-dma-ble/', '/notes/realtime-concurrency/'],
    '时间预算使用**最坏调度延迟与最坏处理时间**，不能仅用平均处理速度。若预算不足，应加大缓冲、把数据复制到拥有明确生命周期的队列、降低生产速率或按协议施加背压。出现覆盖时应累计溢出计数并显式丢弃无效帧，不能让消费者把半新半旧数据当成完整包。');
}
// 10: Voltage deficit before the regulator replenishes charge.
{
  const p = chart({ xmin: 0, xmax: 20, ymin: 0, ymax: 250, xticks: [[0, '0'], [5, '5'], [10, '10'], [15, '15'], [20, '20']], yticks: [[0, '0'], [50, '50'], [100, '100'], [150, '150'], [200, '200'], [250, '250']], xLabel: 'μs', yLabel: '跌落 / mV' });
  let s = legend([['ESR：20 mV', C.gold], ['电荷缺口：10t mV', C.blue], ['两项合计', C.red]]) + p.svg + p.curve(() => 20, C.gold) + p.curve(t => 10 * t, C.blue) + p.curve(t => 20 + 10 * t, C.red);
  s += footer('假设负载增加 1 A、有效 C = 100 μF、ESR = 20 mΩ，20 μs 内供电电流尚未补足。', '若安装 ESL = 1 nH、边沿 100 ns，另有约 10 mV 初始尖峰；其时间尺度未在曲线中展开。');
  save('load-step-budget', '负载阶跃中的 ESR 台阶与电荷缺口', '纵轴取电压跌落的正值；只画控制环尚未补足电流的假设区间。', s,
    '在1安电流缺口下，100微法电容以每微秒10毫伏的速度放电，20毫欧ESR额外造成20毫伏台阶，20微秒时合计跌落220毫伏。',
    ['/hardware/electronic-basics/capacitor/applications/', '/hardware/power-design/power-test/load-transient/', '/notes/ldo-output-capacitor/'],
    '实际电流缺口一般不是理想矩形，应从负载电流与电感/稳压器输出电流之差积分。最初窄尖峰对安装电感和测量回路敏感；随后台阶对 ESR 敏感；较慢的斜率包含电容量和控制响应。把不同时间尺度分开看，比仅记录一个峰峰值更容易定位问题。');
}
// 11: A declared single-pole thermal example.
{
  const p = chart({ xmin: 0, xmax: 25, ymin: 0, ymax: 45, xticks: [[0, '0'], [5, '5'], [10, '10'], [15, '15'], [20, '20'], [25, '25']], yticks: [[0, '0'], [10, '10'], [20, '20'], [30, '30'], [40, '40']], xLabel: 's', yLabel: '温升 / K' });
  let s = p.svg + p.curve(t => 40 * (1 - Math.exp(-t / 5)), C.red) + line(100, p.y(40), 850, p.y(40), C.muted, 1.5, '6 5');
  s += text(475, 122, '稳态温升 P·Rθ = 40 K', 20, C.red) + text(475, 275, 't = τ = 5 s 时约 25.3 K', 20);
  s += footer('仅作模型示例：P = 2 W，Rθ = 20 K/W，τ = 5 s；ΔT(t) = PRθ[1 − exp(−t/τ)]。', '单个 100 ms 脉冲末温升约 0.79 K；真实器件用多时间常数 Zθ(t)，重复脉冲还要累积。');
  save('thermal-transient', '热稳态与短脉冲温升不是同一问题', '曲线为单阶热网络计算，不代表某器件的瞬态热阻曲线。', s,
    '2瓦阶跃作用于20开尔文每瓦、5秒时间常数的单阶热模型，温升指数趋近40开尔文，5秒时达到25.3开尔文。',
    ['/hardware/power-design/power-test/efficiency-thermal/', '/hardware/electronic-basics/mosfet/parameters/', '/notes/ldo/'],
    '结温必须带上初始温度和实际热边界。一次短脉冲温升小，不能推出高重复率下也安全；应按脉冲序列叠加或使用厂商重复脉冲曲线。还要独立检查电气 SOA，尤其 MOSFET 在线性区可能在达到平均结温上限前发生局部热点失效。');
}
// 12: Two-terminal BVD equivalent with an external effective load.
{
  let s = line(90, 230, 170, 230) + line(170, 150, 170, 330) + line(800, 150, 800, 330) + line(800, 230, 875, 230) + dot(170, 230) + dot(800, 230);
  s += resistor(170, 150, 360, 'Rm');
  s += line(360, 150, 400, 150) + `<path d="M400 150 c0 -32 30 -32 30 0 c0 -32 30 -32 30 0 c0 -32 30 -32 30 0 c0 -32 30 -32 30 0" fill="none" stroke="${C.ink}" stroke-width="2"/>` + line(520, 150, 590, 150) + text(460, 111, 'Lm', 19, C.ink, 'middle');
  s += line(590, 150, 645, 150) + line(645, 128, 645, 172) + line(657, 128, 657, 172) + line(657, 150, 800, 150) + text(651, 111, 'Cm', 19, C.ink, 'middle');
  s += line(170, 330, 470, 330) + line(470, 308, 470, 352) + line(482, 308, 482, 352) + line(482, 330, 800, 330) + text(477, 297, 'C0：静态电容', 19, C.ink, 'middle');
  s += text(200, 225, '运动支路：机械损耗 / 惯性 / 弹性', 20, C.blue) + text(200, 395, '外部有效负载 CL 跨接两端后，加载谐振频率向 fs 靠近。', 19, C.muted);
  s += footer('低损耗近似：fs = 1/(2π√(LmCm))；fL ≈ fs√[1 + Cm/(C0 + CL)]。', '例：fs = 16 MHz，Cm = 10 fF，C0 = 3 pF，CL = 12 pF，则 fL ≈ 16.00533 MHz。');
  save('crystal-bvd', '石英晶体的 BVD 等效模型', '运动支路 Rm / Lm / Cm 与静态电容 C0 并联；元件值来自等效拟合而非封装几何直接值。', s,
    '两端晶体由串联Rm、Lm、Cm的运动支路与静态电容C0并联构成。外部负载电容改变加载谐振频率，不能把标称负载频率直接当串联频率。',
    ['/hardware/electronic-basics/crystal/basics/', '/hardware/electronic-basics/crystal/parameters/', '/notes/crystal-structure/'],
    '数据手册的标称频率通常对应指定负载条件；图中把 fs 指定为 16 MHz 只是为了说明拉频方向。CL 是晶体看到的**有效负载**，不能把每个外接电容的标称值直接当成 CL。校核起振时还需要负阻裕量、驱动电平、偏置和温度，频率正确不等于启动一定可靠。');
}

// 13: Numerical energy comparison, not a manufacturer DC-bias curve.
{
  const p = chart({ xmin: 0, xmax: 10, ymin: 0, ymax: 500, xticks: [[0,'0'],[2,'2'],[4,'4'],[6,'6'],[8,'8'],[10,'10']], yticks: [[0,'0'],[100,'100'],[200,'200'],[300,'300'],[400,'400'],[500,'500']], xLabel:'V', yLabel:'储能 / μJ' });
  let s = legend([['固定 C = 10 μF', C.red], ['Cd = 10/(1+V/5) μF', C.blue]]) + p.svg;
  s += p.curve(v => 5*v*v, C.red) + p.curve(v => 50*(v-5*Math.log1p(v/5)), C.blue);
  s += text(500, 210, '零偏容量代入：500 μJ', 19, C.red) + text(500, 375, '积分储能：225.35 μJ', 19, C.blue);
  s += footer('电荷 Q = ∫Cd(v)dv；可逆储能 E = ∫vCd(v)dv，不能把两种等效容量混用。', '假设无迟滞，曲线仅解释模型差异；实际器件应使用对应温度、偏压和频率的数据。');
  save('nonlinear-capacitor-energy', '非线性电容：标称容量为何会高估储能', '两条曲线的零偏容量相同；蓝线把偏压下的微分容量变化积分进储能。', s,
    '固定10微法在10伏储能500微焦，而示例微分电容随电压下降的模型仅储能225.35微焦。',
    ['/notes/capacitor-formulas/', '/hardware/electronic-basics/capacitor/basics/'],
    '比较同一横坐标下的两条曲线，而不是把蓝线当作某款 MLCC 的实测指标。有效保持能量还需取初始电压与最低工作电压之间的能量差；漏电、ESR 和转换损耗会进一步减少可用能量。');
}
// 14: Arrival/service accounting with explicitly separate FIFO bytes.
{
  const p = chart({ xmin:0,xmax:8,ymin:0,ymax:1100,xticks:[[0,'0'],[2,'2'],[4,'4'],[5,'5'],[7,'7'],[8,'8']],yticks:[[0,'0'],[256,'256'],[512,'512'],[768,'768'],[1024,'1024']],xLabel:'ms',yLabel:'占用 / B' });
  let s = p.svg + line(100,p.y(1024),850,p.y(1024),C.red,2,'6 5');
  s += poly([[p.x(0),p.y(0)],[p.x(5),p.y(460.8)],[p.x(7),p.y(645.12)],[p.x(7),p.y(709.12)],[p.x(8),p.y(709.12)]],C.blue);
  s += line(p.x(5),150,p.x(5),400,C.gold,1.5,'5 5') + text(145,156,'容量 1024 B',18,C.red);
  s += text(140,280,'5 ms 暂停：约 461 B',18,C.blue) + text(600,205,'最终预算 ≥710 B',18,C.blue);
  s += text(500,365,'发停止请求',17,C.gold);
  s += footer('921600 baud、8N1；停止响应额外 2 ms，再加未计入该时延的 64 B 在途数据。', '为展示最坏积压，图中暂停服务；64 B 在终点汇总示意，不表示 UART 能瞬间传送。');
  save('uart-backlog-budget','UART 缓存必须容纳流控生效前的数据','假设发送始终满速；停止请求发出后仍有数据到达，不能等缓冲已满才拉流控。',s,
    '缓存先在5毫秒内积压461字节，停止等待2毫秒和另计64字节在途数据后，向上取整需710字节。',
    ['/notes/芯片之间为什么用串口多/','/notes/uart-dma-ble/'],
    '图中“发停止请求”与“对端停止发送”是两个事件。真实门限需根据实测最长响应、FIFO、DMA 和任务调度计算；如果停止延迟已包含 FIFO 排空，则不能再加同一批字节。持续接收时，还要证明长期服务速率足够。');
}
// 15: Same digital pole, one sample difference in phase.
{
  const a = Math.exp(-2*Math.PI*.1);
  const phase = f => -Math.atan2(a*Math.sin(2*Math.PI*f/1000),1-a*Math.cos(2*Math.PI*f/1000))*180/Math.PI;
  const p = chart({xmin:0,xmax:200,ymin:-120,ymax:0,xticks:[[0,'0'],[40,'40'],[80,'80'],[120,'120'],[160,'160'],[200,'200']],yticks:[[-120,'−120'],[-90,'−90'],[-60,'−60'],[-30,'−30'],[0,'0']],xLabel:'Hz',yLabel:'相位 / °'});
  let s = legend([['当前样本更新 H(z)',C.blue],['增加一个 z⁻¹',C.red]]) + p.svg + p.curve(phase,C.blue) + p.curve(f=>phase(f)-.36*f,C.red);
  s += line(p.x(80),p.y(phase(80)),p.x(80),p.y(phase(80)-28.8),C.gold,3) + text(430,240,'80 Hz：相差 28.8°',19,C.gold);
  s += footer('fs = 1 kHz，a = exp(−2π×100/1000)；两者幅频完全相同，数字 −3 dB 点约 103.47 Hz。', '额外 1 ms 纯延迟只改变相位；真实闭环还须计入采样保持、计算和执行器更新。');
  save('filter-sample-delay','极点相同，采样时序不同：相位仍会改变','曲线对比 H(z) 与 z⁻¹H(z)，没有把软件时间标记差异藏在滤波系数中。',s,
    '一千赫采样的一阶滤波器增加一个采样延迟后，80赫相位额外滞后28.8度，幅频响应不变。',
    ['/notes/sensors-digital-filtering/','/notes/balance-car-cascade-control/'],
    '推导时应给输入采样和输出更新标注同一时间轴。图中的相差只是额外纯延迟的贡献，不是整套控制环的相位裕量；环路交越和传感器内部滤波还需一起计算。');
}
// 16: Exact one-sided binomial zero-failure bound.
{
  const p = chart({xmin:10,xmax:10000,ymin:.01,ymax:30,logX:true,logY:true,xticks:[[10,'10'],[100,'100'],[1000,'1000'],[10000,'10000']],yticks:[[.01,'0.01'],[.1,'0.1'],[1,'1'],[10,'10'],[30,'30']],xLabel:'n',yLabel:'上界 / %'});
  let s = p.svg + p.curve(n=>100*(-Math.expm1(Math.log(.05)/n)),C.blue);
  s += dot(p.x(300),p.y(100*(1-.05**(1/300))),C.gold) + text(435,220,'n = 300 → 0.994%',19,C.gold);
  s += dot(p.x(2995),p.y(100*(1-.05**(1/2995))),C.green) + text(440,370,'n = 2995 → 不超过 0.1%',19,C.green);
  s += footer('独立同分布、同一试验条件、零失效：单侧 95% 上界 p = 1 − 0.05^(1/n)。', '这是规定试验的失效概率上界，不是每小时失效率，也不能直接外推到现场十年。');
  save('zero-failure-confidence','零失效不等于失效概率为零','横纵轴均为对数刻度；样本增加会收紧上界，前提是抽样和独立性假设成立。',s,
    '零失效二项置信上界随样本数增多而降低，300个样本对应约0.994%，2995个样本才能低于0.1%。',
    ['/notes/pcb-lifetime/','/notes/工艺与良率控制/'],
    '看曲线时先确定“失效”对应多长时间、何种应力和哪一批总体。来自同一异常批次或共同环境的样品可能相关；只增加同类重复测量，不能自动获得图中假设的独立样本数量。');
}

fs.writeFileSync(path.join(root, '_data', 'engineering_figures.json'), JSON.stringify(figures, null, 2) + '\n');
console.log(`Generated ${figures.length} original engineering figures and their page mappings.`);
