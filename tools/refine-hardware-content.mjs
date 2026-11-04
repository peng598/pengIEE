// Remove only known generic prose repeated by the earlier enrichment generator.
// Device-specific calculations and measurements remain in the topic records.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const target = path.join(root, '_data/hardware_topics.json');
const topics = JSON.parse(fs.readFileSync(target, 'utf8'));
const referenceFiles = JSON.parse(fs.readFileSync(path.join(root, 'assets/reference-library.json'), 'utf8')).files;
const normalizedTitle = (title) => title.replace(/\.pdf$/i, '').replace(/\s+/g, '').toLowerCase();
const genericPrefixes = [
  '公式只在所述拓扑、工作区和波形假设下成立。',
  '额定最大值描述生存边界，不代表可持续设计点。',
  '测量结果需注明实际器件端条件、探头/夹具、仪器带宽、环境温度和等待时间。',
  '表格值必须还原到测试电路：端子定义、偏置方向、脉冲波形、脉宽/占空比、温度和散热条件缺一不可。',
  '对每个关键参数记录随温度、电压、电流、频率、老化和安装条件的变化方向；',
  '建立最坏情况表，覆盖电源/负载范围、容差、启动瞬态、故障波形、环境与自热。',
  '测量报告记录仪器型号、量程、带宽、探头/夹具、校准状态、样品数量和统计范围；',
  '先把系统需求转成器件端电压、电流、功率、频谱、温度和寿命边界，',
  '评审时分别追踪功率换流环路、敏感采样路径、快速边沿节点和机壳/保护地泄放路径。',
  '每项验证记录输入、负载、温度、仪器带宽/探头、触发定义、样品数和判定阈值。'
];
let removed = 0;
const formulaRepairs = new Map([
  [String.raw`2\pi fV_papprox1.26`, String.raw`2\pi fV_p\approx1.26`],
  [String.raw`P_{sw}approx`, String.raw`P_{sw}\approx`],
  [String.raw`-20log_{10}(2\pi f_{in}sigma_t)`, String.raw`-20\log_{10}(2\pi f_{in}\sigma_t)`],
  [String.raw`-IR_0-sum V_{RC}`, String.raw`-IR_0-\sum V_{RC}`],
  [String.raw`R_{\int}`, String.raw`R_{int}`],
  [String.raw`v=L\\,di/dt`, String.raw`v=L\,di/dt`]
]);
for (const topic of topics.filter((entry) => entry.root === '电子基础知识')) {
  topic.content = topic.content.replace(/^## 工程分析与验证\s*\n+/, '').split(/\n\n+/).filter((paragraph) => {
    if (!genericPrefixes.some((prefix) => paragraph.startsWith(prefix))) return true;
    removed += 1;
    return false;
  }).join('\n\n').trim() + '\n';
  for (const [before, after] of formulaRepairs) topic.content = topic.content.replaceAll(before, after);
  topic.content = topic.content.replaceAll(
    '总损耗至少约 0.99 W，尚未包含结电容、热反馈和布局尖峰。',
    '这 0.24 W 是与恢复电荷相关的换流回路损耗量级，不一定全部耗散在二极管内；不能直接与 0.75 W 相加作为二极管结温计算依据。应分别积分器件端电压与电流，并计及结电容、热反馈和布局尖峰。'
  );
  if (topic.branch === '电阻') topic.pdfs = topic.pdfs.filter((pdf) => pdf.title !== '功率损耗.pdf');
  for (const pdf of topic.pdfs || []) {
    if (pdf.url) continue;
    if (pdf.title === '保护以太网端口免受浪涌事件的影响') {
      pdf.title = 'How to select a Surge Diode-TI.pdf';
      pdf.description = '浪涌二极管选型参考；结合实际波形、源阻抗和保护路径核对器件。';
    }
    const query = normalizedTitle(pdf.title);
    const exact = referenceFiles.filter((file) => normalizedTitle(file.title) === query);
    const matches = exact.length ? exact : referenceFiles.filter((file) => normalizedTitle(file.title).includes(query));
    const preferred = matches.filter((file) => file.key.startsWith('01.元器件基础/'));
    const match = matches.length === 1 ? matches[0] : preferred.length === 1 ? preferred[0] : null;
    if (!match) continue;
    pdf.title = match.key.split('/').at(-1);
    pdf.reference_id = match.id;
    pdf.catalog_key = match.key;
    pdf.status = match.published ? '资料库已上线' : '资料库待上架';
  }
}
fs.writeFileSync(target, JSON.stringify(topics, null, 2) + '\n');
console.log(`Removed ${removed} generic repeated paragraphs; kept ${topics.length} topic records.`);
