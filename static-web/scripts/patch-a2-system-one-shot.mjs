import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), '..');
const systemPath = path.join(root, 'content/xizong/knowledge/systems/a2-respiratory/system.json');
const pathwaysPath = path.join(root, 'content/xizong/knowledge/learner/a2-respiratory-pathways.json');

const system = JSON.parse(fs.readFileSync(systemPath, 'utf8'));
system.failure_modes = [
  ['FM1', '气道阻塞', '空气进出肺泡受阻'],
  ['FM2', '通气机械/泵扩张失败', '肺、胸廓、胸膜或呼吸肌不能建立足够肺泡扩张 → 有效肺泡通气下降；严重时低氧并可出现CO2潴留'],
  ['FM3', '肺泡充填或塌陷', '有血流但肺泡通气显著下降，形成低VA/Q或分流样改变'],
  ['FM4', '呼吸膜增厚或有效面积减少', '弥散受限'],
  ['FM5', 'VA/Q失配', '高VA/Q为死腔样，低VA/Q为分流样'],
  ['FM6', '肺血管阻力或通路异常', '肺血流减少或右心后负荷升高'],
  ['FM7', '呼吸控制器/神经驱动异常', '呼吸驱动不足或调节失常 → 肺泡通气与PaCO2控制失稳'],
  ['FM8', '血液携氧/氧含量失败', 'PaO2可正常，但Hb数量、Hb-O2结合或SaO2异常可使CaO2与组织氧输送下降；完整贫血/中毒病因归对应System']
];
const contentAxis = 'PaO2/SaO2低氧血症 vs Hb/CaO2携氧失败';
system.judgment_axes = (system.judgment_axes || []).filter((x) => x !== contentAxis);
system.judgment_axes.splice(1, 0, contentAxis);
fs.writeFileSync(systemPath, JSON.stringify(system, null, 2) + '\n');

const pathways = JSON.parse(fs.readFileSync(pathwaysPath, 'utf8'));
pathways.system_failure_views.FM2 = {
  focus_nodes: [3, 4],
  chain: '肺/胸廓/胸膜/呼吸肌的机械耦联或泵力失败 → 肺扩张不足 → 有效肺泡通气下降 → 低氧，严重时CO2潴留',
  variables: ['VA↓', '呼吸功可↑', 'PaO2↓', 'PaCO2严重时↑']
};
pathways.system_failure_views.FM7 = {
  focus_nodes: [4],
  parallel_focus: '呼吸控制器',
  chain: '呼吸控制器或神经驱动异常 → 通气频率/深度失配 → 有效肺泡通气下降 → PaCO2控制失稳',
  variables: ['VA↓', 'PaCO2可↑', 'pH可↓', 'PaO2可↓']
};
pathways.system_failure_views.FM8 = {
  focus_nodes: [7, 8],
  chain: '肺泡PaO2可以正常 → Hb数量/结合或SaO2异常 → CaO2下降 → 组织氧输送下降；完整病因调用血液/中毒等外部owner',
  variables: ['PaO2可正常', 'Hb/SaO2/CaO2异常', '组织氧供↓']
};
fs.writeFileSync(pathwaysPath, JSON.stringify(pathways, null, 2) + '\n');

console.log('A2 system semantic patch complete');
