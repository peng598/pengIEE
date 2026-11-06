// Recomputes published examples in SI units. These are model checks, not
// verification of a particular component's datasheet or measured hardware.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const results = [];
function check(name, file, anchors, actual, expected, tolerance) {
  const source = read(file);
  for (const text of anchors) assert.ok(source.includes(text), name + ': published context changed: ' + text);
  assert.ok(Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance,
    name + ': calculated ' + actual + ', published ' + expected + ', tolerance ' + tolerance);
  results.push({ name, calculated: actual, published: expected, tolerance });
}
const note = slug => 'notes/' + slug + '.md';
function integral(fn, start, end, n = 20000) {
  const h = (end - start) / n;
  let sum = fn(start) + fn(end);
  for (let i = 1; i < n; i++) sum += (i % 2 ? 4 : 2) * fn(start + i*h);
  return sum*h/3;
}
function bisect(fn, lo, hi) {
  assert.ok(fn(lo)*fn(hi) <= 0, 'Root must be bracketed');
  for (let i = 0; i < 70; i++) {
    const mid = (lo+hi)/2;
    if (fn(lo)*fn(mid) <= 0) hi = mid; else lo = mid;
  }
  return (lo+hi)/2;
}
function rk4(derivative, initial, t, n = 2000) {
  const h = t/n; let y = initial;
  for (let i = 0; i < n; i++) {
    const k1 = derivative(y), k2 = derivative(y+h*k1/2);
    const k3 = derivative(y+h*k2/2), k4 = derivative(y+h*k3);
    y += h*(k1+2*k2+2*k3+k4)/6;
  }
  return y;
}
check('非线性电容电荷：直接数值积分', note('capacitor-formulas'), ['10 V','54.93 μC'], integral(v=>10e-6/(1+v/5),0,10)*1e6,54.93,.005);
check('非线性电容能量：直接数值积分', note('capacitor-formulas'), ['225.35 μJ'], integral(v=>v*10e-6/(1+v/5),0,10)*1e6,225.35,.005);
const dq = 20/(1/1e-6+1/2e-6);
check('预充电容最终电压', note('capacitor-formulas'), ['初始电压','23.33 V','6.67 V'],10+dq/1e-6,23.33,.005);
check('预充电容总电压守恒', '_data/formula_expansion.json', ['23.33 V/6.67 V'],10+dq/1e-6+dq/2e-6,30,1e-10);
const rc = v => ((3.3-v)/1e6-v/10e6-.2e-6)/100e-9;
const rcT = bisect(t=>rk4(rc,0,t)-2,0,.3);
check('带漏电 RC：积分微分方程求门限',note('rc充放电公式'),['112.43 ms','0.20'],rcT*1e3,112.43,.005);
const release = clamp => bisect(t=>rk4(i=>(-2*i-clamp)/1e-3,2,t),0,.003);
check('低压续流释放时间',note('电机的dcr吸收电路'),['0.952 ms'],release(.7)*1e3,.952,.0005);
check('24 V 钳位释放时间',note('电机的dcr吸收电路'),['0.0771 ms'],release(24)*1e3,.0771,.00005);
const t0 = release(24), current = t=>(2+12)*Math.exp(-2000*t)-12;
check('关断绕组铜损与钳位耗能闭合',note('电机的dcr吸收电路'),['能量闭合'],integral(t=>2*current(t)**2+24*current(t),0,t0),.002,1e-10);
check('回馈母线升压',note('电机的dcr吸收电路'),['470 μF','25.71 V'],Math.sqrt(24**2+2*.020/470e-6),25.71,.005);
check('电容涌入电流',note('power-input-design'),['470 μF','2.82 A'],470e-6*12/.002,2.82,1e-10);
check('限流余量与斜坡时间',note('power-input-design'),['18.8 ms'],470e-6*12/(1-.7)*1000,18.8,1e-10);
check('串联 MOSFET 充电耗能：积分瞬时功率',note('power-input-design'),['33.84 mJ'],integral(v=>(12-v)*470e-6,0,12)*1000,33.84,1e-8);
check('Flash 四页轮转理想寿命',note('单片机内的flash与eeprom作用及区别'),['416.7 天','15 次','10,000 次'],10000*4*15/(60*24),416.7,.05);
check('UART 积压及停止预算',note('芯片之间为什么用串口多'),['710 B','921600','64 B'],Math.ceil(921600/10*.005)+Math.ceil(921600/10*.002)+64,710,0);
check('互感感应电压',note('电磁场'),['2 nH','0.20 V'],2e-9*1/10e-9,.20,1e-12);
check('互容位移电流',note('电磁场'),['0.2 pF','2 mA'],.2e-12*10e9*1000,2,1e-12);
check('有效回路电感压差',note('return-current-path'),['1 nH','0.10 V'],1e-9*.1/1e-9,.1,1e-12);
// Solve outgoing wave b2=S21*a1+S22*a2, a2=GammaL*b2.
const b2 = .8/(1-(-.3)*.5), gt = b2*b2*(1-.5**2);
check('失配两端口实际插入损耗',note('insertion-loss'),['3.15 dB','1.94 dB'],10*Math.log10(.75/gt),3.15,.005);
check('PAM4 符号 UI',note('eye-diagram'),['20 Gb/s','UI 为 100 ps'],1/(20e9/Math.log2(4))*1e12,100,1e-10);
check('抖动模型预算',note('eye-diagram'),['34.07 ps','14.07'],20+14.07*1,34.07,1e-10);
// Solve KCL at the summing junction, then measure source voltage/current.
const vm = (1/10000)/(1/10000+101/100000);
check('有限 A 下反相输入阻抗：节点方程',note('op-amp-input-impedance'),['10.990 kΩ'],1/((1-vm)/10000)/1000,10.990,.0005);
check('不相关分压比例标准差',note('adc-divider-noise'),['0.1061%'],.75*Math.sqrt(2*.001**2)*100,.1061,.00005);
check('相关分压比例标准差',note('adc-divider-noise'),['0.03354%','0.9'],.75*Math.sqrt(2*.001**2-2*.9*.001**2)*100,.03354,.000005);
// Direct binomial probability equation, independent of the closed-form text.
const pUpper=bisect(p=>(1-p)**300-.05,0,.1);
check('300 个零失效的 95% 上界',note('pcb-lifetime'),['300 块','0.994%'],pUpper*100,.994,.0005);
let n=1;while(.999**n>.05)n++;
check('0.1% 上界所需零失效样本',note('pcb-lifetime'),['2995 个'],n,2995,0);
check('偏心过程 Cpk',note('工艺与良率控制'),['52 Ω','1.000'],Math.min((55-52)/3,(52-45)/3),1,1e-12);
check('声学背景功率相减',note('sound-pressure-level'),['60 dB','59 dB','53.13 dB'],10*Math.log10(10**6-10**5.9),53.13,.005);
const r=10**(-.1);
check('声学背景修正不确定度',note('sound-pressure-level'),['1.24 dB','0.2 dB'],.2*Math.hypot(1/(1-r),r/(1-r)),1.24,.005);
check('高通失配共模转换',note('audio-input-capacitor'),['2%','−40 dB'],20*Math.log10(.02/2),-40,1e-10);
const mute=bisect(t=>Math.exp(-t/.1)-.001,0,2);
check('静音残余阈值时间',note('audio-input-capacitor'),['0.691 s'],mute,.691,.0005);
const a=Math.exp(-2*Math.PI*.1);
const omega=bisect(w=>(1-a)**2/(1+a*a-2*a*Math.cos(w))-.5,0,Math.PI);
check('数字滤波截止：直接求幅频交点','_data/formula_deep.json',['103.47 Hz'],omega*1000/(2*Math.PI),103.47,.005);
check('采样延迟相位',note('sensors-digital-filtering'),['80 Hz','28.8°'],360*80*.001,28.8,1e-10);
check('米勒电荷而非总栅极电荷','_data/formula_expansion.json',['Qgd=8 nC','40 ns'],8e-9/.2*1e9,40,1e-10);
check('并联电芯空载环流','_data/formula_expansion.json',['20 mV','0.50 A'],.020/(.020+.020),.50,1e-12);
console.log(JSON.stringify({checked:results.length,results},null,2));
