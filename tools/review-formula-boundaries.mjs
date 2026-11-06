// Idempotent corrections from the 2026-11-06 dimensional/model review.
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const catalog = read('_data/formula_catalog.json');
const expansion = read('_data/formula_expansion.json');
const guides = read('_data/formula_guides.json');
const deep = read('_data/formula_deep.json');
const lookup = new Map([...catalog, ...expansion].flatMap(d => d.formulas).map(f => [f.id, f]));
const changes = {
  '02.04': { conditions: '线性、可逆且 C 不随电压变化；非线性电容应积分 E=∫v·Cd(v)dv，迟滞损耗另计。' },
  '03.09': { expression: 'Igate,avg≈Qg/tcharge；IMiller,avg≈Qgd/tMiller；Pgate≈Qg·Vgate·fs；Cboot≥Qtotal/ΔVboot', conditions: '总栅极充电与漏极电压转换是不同时间段；Qtotal 含驱动消耗和漏电，自举还需检查周期刷新。' },
  '09.06': { expression: 'Lsec=NΦ/I；Linc=N·dΦ/dI；线性磁路 L=N²/ℜ≈ALN²', conditions: '存在直流偏置或磁芯非线性时，割线与增量电感不相等；AL 取对应气隙与测量条件。' },
  '17.03': { expression: 'yk=ayk-1+(1-a)xk；a=e^(-Ts/τ)；H(z)=(1-a)/(1-az^-1)', conditions: '当前输入指数平滑；精确 ZOH 状态递推为 y[k+1]=ay[k]+(1-a)x[k]，两者索引/延时不可混用。τ 的连续截止频率不等于所有采样率下的数字 -3 dB 点。' },
  '18.09': { title: '恒定失效率与平均失效前时间', expression: 'R(t)=e^(-λt)；MTTF=1/λ', conditions: '不可修复件的恒定危险率指数模型；可修复系统 MTBF 的统计定义需另声明，平均值不是保证寿命。' },
  '02.14': { guide: ['用峰值电流而非平均电流检查电感饱和。', 'Iavg：平均电流；ΔIpp：峰峰纹波；Isat：规定降感比例与温度下的电流；margin：倍率余量。', '开关电源电感选型与故障峰值审查。', '对输入范围逐点计算：固定输出 Buck 的纹波通常随输入升高增大；Boost 重载平均电流常在低输入更大。还要计入限流最大值和传播延迟。'] },
  '02.16': { expression: '零初始电压且中点无净电荷：Q相同，Vi=Q/Ci；一般增量 ΔVi=ΔQ/Ci', conditions: '浮置中间节点电荷守恒。存在预充或初始中点净电荷时，绝对电压不必按容量反比分配；漏电与均压另算。', guide: ['由中间节点电荷守恒求串联电容的瞬态分压。', 'Ci：线性电容；Vi：端电压；ΔQ：串联支路增加的电荷；初始电压需给定。', '串联耐压、预充与热插拔状态审查。', '先列初始电压与总电压变化，求共同增量电荷，再加回各自初值；只在零初始等条件下用 Vi/Vj=Cj/Ci。'], deep: [['零初值算例','1 μF 与 2 μF 均未充电、浮置中点无净电荷，串接 30 V 后为 20 V/10 V；长期直流分配仍受漏电影响。'], ['预充反例','若初始两端电压按相同串联极性分别为 10 V、0 V，再把总电压由 10 V 升至 30 V，新增电荷为 13.33 μC，最终约 23.33 V/6.67 V，不是 20 V/10 V。']] },
  '03.13': { title: 'MOSFET 总栅极充电与米勒转换时间', expression: 'tcharge≈Qg/Igate,avg；tMiller≈Qgd/IMiller；IMiller≈(Vdriver-Vplateau)/(Rdriver+Rg,ext+Rg,int)', conditions: '第一式要求全充电过程的平均电流；平台电流仅近似适用于米勒区间，Qgd 与 Qg 不可混用。', guide: ['区分整个栅极充电过程与漏极电压转换区间。', 'Qg：总栅极电荷；Qgd：米勒区电荷；tcharge、tMiller：对应时间；三个 R 分别为驱动器、外部和内部栅阻。', '驱动器选型、损耗估算和 EMI 边沿调节。', '按实际 VDS、ID、温度读取电荷曲线；平台平均电流配 Qgd，总平均电流配 Qg。最终用局部 VGS/VDS 和驱动电流核验。'], deep: [['算例','假设总 Qg=30 nC、Qgd=8 nC、平台平均电流0.20 A，米勒转换约40 ns；30 nC/0.20 A=150 ns不能直接作为漏极转换时间，且全程电流未必恒定。']] },
  '03.16': { expression: 'Qrr=∫abs(irev(t))dt；Ecomm,est≈Qrr·VR；Pcomm,est≈Ecomm,est·fs', conditions: '积分选取恢复区间，电荷为正的幅值；VR·Qrr 是换流回路量级，不能自动全计入二极管结温或与已含恢复的 Eon 重复相加。' },
  '05.16': { expression: '高频渐近斜率≈20(Nz-Np) dB/dec；n 阶全极点低通为 -20n dB/dec', conditions: '有理传递函数且已越过相关拐点；Np、Nz 计入重数。高通、含零点滤波器不能仅凭阶数套 -20n。' },
  '06.13': { conditions: '平均电感电流等于输出电流，且控制器在电流到零后停止反向续流；强制 PWM 同步 Buck 可维持负谷值，不因此必然转 DCM。' },
  '07.15': { expression: 'Ii=(Ei-Vbus)/Ri；Vbus=[Σ(Ei/Ri)-Itotal]/Σ(1/Ri)', conditions: 'Ei 为同一时间尺度的等效开路电压、Ri 含连接阻抗；Ei 完全相同时才简化为按电导分流。否则空载也可有环流。', guide: ['求并联电芯在不同开路电压和连接阻抗下的支路电流。', 'Ei：各支路等效电压；Ri：等效串联电阻；Vbus：共同端电压；Itotal：外部放电电流为正。', '电池并联、均流和连接瞬态的模型初筛。', '先由节点电流和等于 Itotal 求 Vbus，再逐支路求 Ii；负值表示支路被充电，须核对电芯允许条件和预充。'], deep: [['环流例','两电芯开路电压相差20 mV、各支路总电阻20 mΩ，外部空载时环流为20 mV/(40 mΩ)=0.50 A。此准静态模型不含连接电感和保护器件状态，不代表允许直接并接。']] },
  '08.16': { conditions: 'Foster 型阶跃热阻抗拟合：τi=RiCi 为拟合支路时间常数。Cauer 梯形网络的物理元件不能直接逐项代入此和式，需先求响应或转换模型。' },
  '13.15': { expression: 'UI=1/Rsymbol；未编码 M 电平码 Rraw,bit=Rsymbol·log2(M)', conditions: 'NRZ 二进制时 UI=1/Rbit；PAM4 的 UI=2/Rraw,bit。净吞吐还含编码/FEC开销，眼宽需按目标 BER、CDR 和协议时序规则评估。', guide: ['用符号时间而非无条件用比特时间定义眼图 UI。', 'Rsymbol：每秒码元数；Rraw,bit：未扣编码开销的线侧比特率；M：调制电平数。', 'NRZ/PAM4 眼图、抖动和链路时序预算。', '先确认调制和线侧码元率，再把抖动按规定 BER 或峰峰定义换算；不能把 RMS 抖动、ISI 和 setup 直接随意相减。'], deep: [['算例','20 Gb/s 线侧原始比特率的 PAM4 对应10 GBd，UI=100 ps；误用1/20 Gb/s会得到50 ps。FEC后的有效信息速率不用于直接求UI。']] }
};
for (const [id, fields] of Object.entries(changes)) {
  if (!lookup.has(id)) throw new Error('Unknown formula: ' + id);
  Object.assign(lookup.get(id), fields);
}
guides['03.09'] = ['分别估算总栅极充电、米勒转换、驱动功率与自举容量。', 'Qg、Qgd：总电荷与米勒电荷；tcharge、tMiller：各自对应时间；Vgate：驱动电压；Qtotal：自举每周期电荷。', '选择驱动器、设定开关速度并核对高边供电。', '平台电流配 Qgd，全程平均电流配 Qg；再分别检查驱动器峰值电流、功率、容量和自举刷新。'];
guides['09.06'] = ['区分线性电感、割线电感与工作点增量电感。', 'Φ：磁通；I：偏置电流；N：匝数；Lsec：磁链/电流；Linc：磁链对电流导数；ℜ：磁阻。', '偏置磁性件、非线性瞬态和匝数设计。', '先确认数据给出哪种 L；小纹波斜率用工作点 Linc，线性磁路才可把 NΦ/I 与 N²/ℜ 等同。'];
guides['18.09'] = ['在恒定危险率模型下计算生存概率与平均失效前时间。', 'λ：恒定危险率；t：累计应力时间；R(t)：生存概率；MTTF：不可修复件平均失效前时间。', '可靠性统计的特定指数模型。', '先确认失效机制与恒定危险率假设，再计算；不可用平均时间宣称某个产品一定能运行这么久。'];
deep['02.04'] = [['非线性','若 Cd=dQ/dv 随电压变化，Q(V)=∫Cd(v)dv，E(V)=∫vCd(v)dv；零偏容量、Q/V 和某偏置点微分电容不能任意互换。'],['边界','只有可逆线性定值电容才直接用 CV²/2。实际保持能量还要扣除最低允许电压以下的储能、ESR 损耗与转换损耗。']];
deep['09.06'] = [['模型','在工作点附近，电压决定磁链变化率，小纹波斜率用增量电感。以末端增量电感代入 LI²/2 不会自动得到非线性电感储能。'],['能量','可逆无磁滞模型的磁能为 ∫i dλ，λ=NΦ；磁滞回线损耗与此储能积分是不同的量。']];
deep['17.03'] = [['时序','连续一阶系统在区间[kTs,(k+1)Ts)保持输入x[k]时，精确状态式为y[k+1]=ay[k]+(1-a)x[k]。直接用当前样本更新输出的指数平滑式，在同一索引下少一个单位延时，闭环相位预算必须写清。'],['数字截止点','对H(z)=(1-a)/(1-az^-1)，cos Ω3dB=(4a-1-a²)/(2a)。仅当右侧在[-1,1]内时，Nyquist以内存在-3 dB交点。fs=1 kHz、按连续100 Hz选a=e^(-2π·0.1)，实际数字截止约103.47 Hz。']];
guides['17.03'][3] = '先声明当前样本更新或精确 ZOH 状态时序；由目标数字截止点求系数，再核验实际幅相。只有低归一化频率时才直接用连续极点近似。';
deep['03.09'][0] = ['电流', 'Qg/tcharge 对应全程平均栅极充电电流；漏极转换的米勒区间用 Qgd/IMiller。驱动器峰值源/灌能力还取决于工作电压、输出阻抗和温度。'];
deep['18.09'][0] = ['解释', '不可修复件的指数寿命模型具有恒定危险率 λ，平均失效前时间 MTTF=1/λ；它是总体统计均值，不代表任一设备的保证工作时间。'];
lookup.get('03.16').guide[3] = '取与 IF、di/dt、VR、温度匹配的 Qrr；估算换流回路损耗后按器件端口积分分配，避免与已含恢复的开通能量重复计算。';
lookup.get('05.16').guide = ['按极点与零点的数量差估计高频渐近斜率。', 'Np、Nz：极点与零点数量，按重数计；dec：频率十倍变化。', '评估阻带渐近衰减并识别含零点网络。', '先写传递函数，确认已越过相关拐点；全极点低通才按总阶数直接用 -20n dB/dec。'];
lookup.get('06.13').guide[3] = '先确认控制模式，再算电感谷值；二极管仿真模式谷值到零后可能进入 DCM，强制 PWM 则可能继续负向导通。';
lookup.get('08.16').guide = ['以 Foster 拟合模型描述多个热时间尺度。', 'Ri、Ci：Foster 拟合支路参数；τi：拟合时间常数；Zth：指定热边界下的阶跃热阻抗。', '分析单个热 RC 无法描述的短脉冲与长期响应。', '使用同一热边界下的厂商拟合参数求阶跃响应；任意功率波形需叠加/卷积，Cauer 元件不能直接代入指数和式。'];
const compactExpansion = '[\n' + expansion.map(d => '  {\n    "id": ' + JSON.stringify(d.id) + ',\n    "formulas": [\n' + d.formulas.map(f => '      ' + JSON.stringify(f)).join(',\n') + '\n    ]\n  }').join(',\n') + '\n]\n';
let previousGroup;
const compactGuides = '{\n' + Object.entries(guides).map(([id, v]) => { const group = id.split('.')[0]; const gap = previousGroup && previousGroup !== group ? '\n' : ''; previousGroup = group; return gap + '  ' + JSON.stringify(id) + ': [' + v.map(x => JSON.stringify(x)).join(', ') + ']'; }).join(',\n') + '\n}\n';
const compactDeep = '{\n' + Object.entries(deep).map(([id,v]) => '  ' + JSON.stringify(id) + ': ' + JSON.stringify(v)).join(',\n') + '\n}\n';
for (const [file, source] of [['_data/formula_catalog.json', JSON.stringify(catalog, null, 2) + '\n'], ['_data/formula_expansion.json', compactExpansion], ['_data/formula_guides.json', compactGuides], ['_data/formula_deep.json', compactDeep]]) fs.writeFileSync(path.join(root, file), source);
console.log(`Reviewed and updated ${Object.keys(changes).length} formula definitions; updated linked guidance.`);
