// Copy to static-web/scripts/test-xizong-a2-prepared-memory-browser.mjs.
// Run only against the existing isolated built-site CI preview. This script does
// not start a server, use Stable, use a persistent profile, or contact learners.
// All evidence/history/failure fixtures below are explicitly synthetic.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import { loadXizongBlock } from '../src/lib/xizong.mjs';
import { resolveXizongLearnerProjection } from '../src/lib/xizongLearnerProjection.mjs';
import { projectKpCore } from '../src/lib/xizongProjection.mjs';
import {
  buildXizongPreparedMemoryAvailability as describe,
  buildXizongMemoryReleaseDescriptorFromLearnerObject as describeFull,
  buildXizongBlockMemoryReleaseDescriptor as describeCompatibility,
  supportsXizongPreparedMemoryBlock
} from '../src/lib/xizongMemoryRelease.mjs';
import {
  createXizongMemoryState, makePreparedMemoryAvailable, releasedMemoryCards
} from '../src/lib/xizongMemoryModel.mjs';

const base = new URL(process.env.KIANOS_PREPARED_MEMORY_TEST_BASE || 'http://127.0.0.1:4338/');
assert.equal(base.hostname, '127.0.0.1');
assert.ok(base.port && base.port !== '4321', 'never run against Stable');
const out = path.resolve(process.env.KIANOS_A2_PREPARED_MEMORY_TEST_OUTPUT
  || path.join(process.env.KIANOS_PREPARED_MEMORY_TEST_OUTPUT || '.qa/xizong-prepared-memory-browser', 'a2'));
fs.mkdirSync(out, { recursive: true });
const memoryKey = 'kianos-xizong-memory-v1';
const checks = [], errors = [];
const report = {
  status: 'RUNNING', base: base.href, started_at: new Date().toISOString(),
  ci_commit: process.env.GITHUB_SHA || null, ci_run_id: process.env.GITHUB_RUN_ID || null,
  scope: 'Actual A2 prepared-Memory/post-Chat journeys in an isolated CI built-site browser; synthetic evidence only, not real learner, medical acceptance, or Stable proof',
  checks, errors
};

// Independent review acceptance oracle, not a runtime admission registry.
const admittedBySlug = {
  r01: ['a2-r01-kp01-precision', 'a2-r01-kp02-precision'],
  r02: ['a2-r02-kp03-precision', 'a2-r02-lg04-precision'],
  r03: ['a2-r03-lg03-precision', 'a2-r03-lg05-precision'],
  r04: [],
  r05: ['a2-r05-lg01-precision', 'a2-r05-lg03-precision'],
  r06: ['a2-r06-lg02-precision', 'a2-r06-lg03-precision'],
  r07: [],
  r08: ['a2-r08-lg03-precision'],
  r09: ['a2-r09-lg05-precision'],
  r10: ['a2-r10-kp02-precision', 'a2-r10-kp04-precision', 'a2-r10-kp08-precision', 'a2-r10-kp16-precision', 'a2-r10-kp19-precision'],
  r11: ['a2-r11-kp21-precision', 'a2-r11-kp22-precision', 'a2-r11-lg05-precision'],
  r12: ['a2-r12-kp08-precision', 'a2-r12-kp09-precision', 'a2-r12-kp12-precision', 'a2-r12-kp13-precision', 'a2-r12-kp16-precision', 'a2-r12-kp17-precision']
};
const heldBySlug = {
  r04: ['a2-r04-lg03-precision', 'a2-r04-lg05-precision'],
  r07: ['a2-r07-lg05-precision', 'a2-r07-lg06-precision'],
  r08: ['a2-r08-lg05-precision'],
  r09: ['a2-r09-kp18-precision']
};
// These literal original cue/anchor/member records are generated from the frozen
// independent review. They catch rewording, reanchoring and an invented 27th card.
const originalCues = [
  {
    "id": "a2-r01-kp01-precision",
    "cue": "肺容积 / 肺容量的常用数值与组合公式最终需要精确恢复。",
    "anchor": {
      "block_id": "respiratory-r01",
      "kp_id": "respiratory-r01-kp01"
    },
    "members": [
      "respiratory-r01-kp01"
    ]
  },
  {
    "id": "a2-r01-kp02-precision",
    "cue": "FEV1–3 的百分比与一秒率相关数字最终需要精确恢复。",
    "anchor": {
      "block_id": "respiratory-r01",
      "kp_id": "respiratory-r01-kp02"
    },
    "members": [
      "respiratory-r01-kp02"
    ]
  },
  {
    "id": "a2-r02-kp03-precision",
    "cue": "全肺平均、肺尖与肺底 VA/Q 的数值最终需要精确恢复。",
    "anchor": {
      "block_id": "respiratory-r02",
      "kp_id": "respiratory-r02-kp03"
    },
    "members": [
      "respiratory-r02-kp03"
    ]
  },
  {
    "id": "a2-r02-lg04-precision",
    "cue": "P50、Hb 氧容量与氧解离曲线的关键数字 / 移动边界最终需要精确恢复。",
    "anchor": {
      "block_id": "respiratory-r02",
      "logic_group_id": "respiratory-r02-lg04"
    },
    "members": [
      "respiratory-r02-kp07",
      "respiratory-r02-kp08",
      "respiratory-r02-kp09",
      "respiratory-r02-kp10",
      "respiratory-r02-kp11"
    ]
  },
  {
    "id": "a2-r03-lg03-precision",
    "cue": "持续气流受限的诊断边界与 GOLD 严重度数字最终需要精确恢复。",
    "anchor": {
      "block_id": "respiratory-r03",
      "logic_group_id": "respiratory-r03-lg03"
    },
    "members": [
      "respiratory-r03-kp09",
      "respiratory-r03-kp10",
      "respiratory-r03-kp11"
    ]
  },
  {
    "id": "a2-r03-lg05-precision",
    "cue": "长期家庭氧疗与 AECOPD 的关键阈值 / 用药边界最终需要精确恢复。",
    "anchor": {
      "block_id": "respiratory-r03",
      "logic_group_id": "respiratory-r03-lg05"
    },
    "members": [
      "respiratory-r03-kp16",
      "respiratory-r03-kp17",
      "respiratory-r03-kp18",
      "respiratory-r03-kp19",
      "respiratory-r03-kp20"
    ]
  },
  {
    "id": "a2-r04-lg03-precision",
    "cue": "舒张试验、激发试验与 PEF / FeNO 等客观证据的精确阈值最终需要恢复。",
    "anchor": {
      "block_id": "respiratory-r04",
      "logic_group_id": "respiratory-r04-lg03"
    },
    "members": [
      "respiratory-r04-kp06",
      "respiratory-r04-kp07",
      "respiratory-r04-kp08",
      "respiratory-r04-kp09"
    ]
  },
  {
    "id": "a2-r04-lg05-precision",
    "cue": "急性发作严重度分级中的关键数值边界最终需要精确恢复。",
    "anchor": {
      "block_id": "respiratory-r04",
      "logic_group_id": "respiratory-r04-lg05"
    },
    "members": [
      "respiratory-r04-kp15",
      "respiratory-r04-kp16",
      "respiratory-r04-kp17"
    ]
  },
  {
    "id": "a2-r05-lg01-precision",
    "cue": "CAP / HAP 时间边界与 CURB-65 五项阈值最终需要精确恢复。",
    "anchor": {
      "block_id": "respiratory-r05",
      "logic_group_id": "respiratory-r05-lg01"
    },
    "members": [
      "respiratory-r05-kp01",
      "respiratory-r05-kp02",
      "respiratory-r05-kp03",
      "respiratory-r05-kp04"
    ]
  },
  {
    "id": "a2-r05-lg03-precision",
    "cue": "高频病原—治疗药物的精确配对按当前 Study 口径最终需要稳定。",
    "anchor": {
      "block_id": "respiratory-r05",
      "logic_group_id": "respiratory-r05-lg03"
    },
    "members": [
      "respiratory-r05-kp09",
      "respiratory-r05-kp10",
      "respiratory-r05-kp11",
      "respiratory-r05-kp12",
      "respiratory-r05-kp13",
      "respiratory-r05-kp14"
    ]
  },
  {
    "id": "a2-r06-lg02-precision",
    "cue": "大咯血数值边界与止血药禁忌最终需要精确恢复。",
    "anchor": {
      "block_id": "respiratory-r06",
      "logic_group_id": "respiratory-r06-lg02"
    },
    "members": [
      "respiratory-r06-kp07",
      "respiratory-r06-kp08",
      "respiratory-r06-kp09",
      "respiratory-r06-kp10"
    ]
  },
  {
    "id": "a2-r06-lg03-precision",
    "cue": "误吸体位对应肺段与关键抗感染配对最终需要精确恢复。",
    "anchor": {
      "block_id": "respiratory-r06",
      "logic_group_id": "respiratory-r06-lg03"
    },
    "members": [
      "respiratory-r06-kp11",
      "respiratory-r06-kp12",
      "respiratory-r06-kp13",
      "respiratory-r06-kp14",
      "respiratory-r06-kp15"
    ]
  },
  {
    "id": "a2-r07-lg05-precision",
    "cue": "PPD、痰涂片等阈值及活动性 / 传染性证据边界最终需要精确恢复。",
    "anchor": {
      "block_id": "respiratory-r07",
      "logic_group_id": "respiratory-r07-lg05"
    },
    "members": [
      "respiratory-r07-kp17",
      "respiratory-r07-kp18",
      "respiratory-r07-kp19"
    ]
  },
  {
    "id": "a2-r07-lg06-precision",
    "cue": "初治方案、核心药不良反应与 RR/MDR 组别 / 疗程最终需要精确恢复。",
    "anchor": {
      "block_id": "respiratory-r07",
      "logic_group_id": "respiratory-r07-lg06"
    },
    "members": [
      "respiratory-r07-kp20",
      "respiratory-r07-kp21",
      "respiratory-r07-kp22",
      "respiratory-r07-kp23",
      "respiratory-r07-kp24"
    ]
  },
  {
    "id": "a2-r08-lg03-precision",
    "cue": "结节病分期的精确影像组合最终需要精确恢复。",
    "anchor": {
      "block_id": "respiratory-r08",
      "logic_group_id": "respiratory-r08-lg03"
    },
    "members": [
      "respiratory-r08-kp07",
      "respiratory-r08-kp08",
      "respiratory-r08-kp09"
    ]
  },
  {
    "id": "a2-r08-lg05-precision",
    "cue": "SiO₂ 粒径、硅肺分期与低频影像数字最终需要精确恢复。",
    "anchor": {
      "block_id": "respiratory-r08",
      "logic_group_id": "respiratory-r08-lg05"
    },
    "members": [
      "respiratory-r08-kp13",
      "respiratory-r08-kp14",
      "respiratory-r08-kp15",
      "respiratory-r08-kp16"
    ]
  },
  {
    "id": "a2-r09-kp18-precision",
    "cue": "D-dimer 阈值、血气方向与 ECG 右心征中的精确数字最终需要恢复。",
    "anchor": {
      "block_id": "respiratory-r09",
      "kp_id": "respiratory-r09-kp18"
    },
    "members": [
      "respiratory-r09-kp18"
    ]
  },
  {
    "id": "a2-r09-lg05-precision",
    "cue": "PE 危险分层、溶栓时间窗与抗凝疗程边界最终需要精确恢复。",
    "anchor": {
      "block_id": "respiratory-r09",
      "logic_group_id": "respiratory-r09-lg05"
    },
    "members": [
      "respiratory-r09-kp20",
      "respiratory-r09-kp21",
      "respiratory-r09-kp22"
    ]
  },
  {
    "id": "a2-r10-kp02-precision",
    "cue": "进行性血胸的持续引流阈值与判定数字最终需要精确恢复。",
    "anchor": {
      "block_id": "respiratory-r10",
      "kp_id": "respiratory-r10-kp02"
    },
    "members": [
      "respiratory-r10-kp02"
    ]
  },
  {
    "id": "a2-r10-kp04-precision",
    "cue": "胸水化验比值、梯度与 Light 判定边界最终需要精确恢复。",
    "anchor": {
      "block_id": "respiratory-r10",
      "kp_id": "respiratory-r10-kp04"
    },
    "members": [
      "respiratory-r10-kp04"
    ]
  },
  {
    "id": "a2-r10-kp08-precision",
    "cue": "胸穿首次 / 后续容量、频率与相关边界最终需要精确恢复。",
    "anchor": {
      "block_id": "respiratory-r10",
      "kp_id": "respiratory-r10-kp08"
    },
    "members": [
      "respiratory-r10-kp08"
    ]
  },
  {
    "id": "a2-r10-kp16-precision",
    "cue": "闭合性气胸压缩比例与观察 / 抽气边界最终需要精确恢复。",
    "anchor": {
      "block_id": "respiratory-r10",
      "kp_id": "respiratory-r10-kp16"
    },
    "members": [
      "respiratory-r10-kp16"
    ]
  },
  {
    "id": "a2-r10-kp19-precision",
    "cue": "胸管位置、插拔呼吸时相与拔管组合最终需要精确恢复。",
    "anchor": {
      "block_id": "respiratory-r10",
      "kp_id": "respiratory-r10-kp19"
    },
    "members": [
      "respiratory-r10-kp19"
    ]
  },
  {
    "id": "a2-r11-kp21-precision",
    "cue": "T 分期的三个直径边界与等号归属最终需要精确恢复。",
    "anchor": {
      "block_id": "respiratory-r11",
      "kp_id": "respiratory-r11-kp21"
    },
    "members": [
      "respiratory-r11-kp21"
    ]
  },
  {
    "id": "a2-r11-kp22-precision",
    "cue": "N / M 分层的空间边界与 M1 细分最终需要精确恢复。",
    "anchor": {
      "block_id": "respiratory-r11",
      "kp_id": "respiratory-r11-kp22"
    },
    "members": [
      "respiratory-r11-kp22"
    ]
  },
  {
    "id": "a2-r11-lg05-precision",
    "cue": "靶点—药物配对与 SCLC / NSCLC 治疗边界最终需要稳定精确。",
    "anchor": {
      "block_id": "respiratory-r11",
      "logic_group_id": "respiratory-r11-lg05"
    },
    "members": [
      "respiratory-r11-kp19",
      "respiratory-r11-kp20",
      "respiratory-r11-kp21",
      "respiratory-r11-kp22"
    ]
  },
  {
    "id": "a2-r12-kp08-precision",
    "cue": "P/F 定义与三档分度最终需要精确恢复。",
    "anchor": {
      "block_id": "respiratory-r12",
      "kp_id": "respiratory-r12-kp08"
    },
    "members": [
      "respiratory-r12-kp08"
    ]
  },
  {
    "id": "a2-r12-kp09-precision",
    "cue": "PAWP 鉴别阈值与可并存边界最终需要精确恢复。",
    "anchor": {
      "block_id": "respiratory-r12",
      "kp_id": "respiratory-r12-kp09"
    },
    "members": [
      "respiratory-r12-kp09"
    ]
  },
  {
    "id": "a2-r12-kp12-precision",
    "cue": "PEEP 起始 / 目标范围与容量门槛最终需要精确恢复。",
    "anchor": {
      "block_id": "respiratory-r12",
      "kp_id": "respiratory-r12-kp12"
    },
    "members": [
      "respiratory-r12-kp12"
    ]
  },
  {
    "id": "a2-r12-kp13-precision",
    "cue": "潮气量、平台压、允许性高碳酸血症与 pH 范围最终需要精确恢复。",
    "anchor": {
      "block_id": "respiratory-r12",
      "kp_id": "respiratory-r12-kp13"
    },
    "members": [
      "respiratory-r12-kp13"
    ]
  },
  {
    "id": "a2-r12-kp16-precision",
    "cue": "Ⅰ / Ⅱ型呼衰的血气边界最终需要精确恢复。",
    "anchor": {
      "block_id": "respiratory-r12",
      "kp_id": "respiratory-r12-kp16"
    },
    "members": [
      "respiratory-r12-kp16"
    ]
  },
  {
    "id": "a2-r12-kp17-precision",
    "cue": "慢性Ⅱ型呼衰氧疗浓度边界与急性哮喘例外最终需要精确恢复。",
    "anchor": {
      "block_id": "respiratory-r12",
      "kp_id": "respiratory-r12-kp17"
    },
    "members": [
      "respiratory-r12-kp17"
    ]
  }
];
const flattenCues = object => [...object.kps, ...object.logicGroups].flatMap(owner =>
  (owner.precision || []).map(cue => ({ owner, cue })));
const sortedIds = cards => cards.map(card => card.id).sort();
const claims = state => ({
  sourceContactDone: state?.sourceContactDone === true,
  sourceContactEvidence: state?.sourceContactEvidence || [],
  learned: state?.learned || {}, completed: state?.completed === true,
  blockRecallDone: state?.blockRecallDone === true, ttsxEvidence: state?.ttsxEvidence || {}
});
const emptyClaims = { sourceContactDone: false, sourceContactEvidence: [], learned: {}, completed: false, blockRecallDone: false, ttsxEvidence: {} };
const studyKeyFor = slug => `kianos-xizong-astro-v2:xizong:respiratory-${slug}`;
const recallKeyFor = slug => `kianos-xizong-memory-review-v2:xizong:respiratory-${slug}`;
const read = (page, key) => page.evaluate(key => JSON.parse(localStorage.getItem(key) || 'null'), key);
const raw = (page, key) => page.evaluate(key => localStorage.getItem(key), key);
const ready = async page => {
  await page.bringToFront();
  await page.waitForFunction(() => document.documentElement.dataset.learnerWriter === 'active', {}, { timeout: 30000 });
};
const blockReady = async (page, slug) => {
  await ready(page);
  // Writer readiness precedes the Block controller's async revision import.
  await page.waitForFunction(key => Boolean(JSON.parse(localStorage.getItem(key) || 'null')?.contentRevision?.witness?.block), studyKeyFor(slug));
};
const blockUrl = slug => new URL(`/xizong/respiratory/${slug}/`, base).href;
const preparedUrl = slug => new URL(`/xizong/memory/?view=precision&block=respiratory-${slug}`, base).href;
const normalized = text => String(text || '').replace(/\s+/g, ' ').trim();
const assertNoDependencyState = async (page, slug) => {
  const keys = await page.evaluate(() => Object.keys(localStorage).filter(key =>
    /^kianos-xizong-(?:astro-v2|memory-review-v2):xizong:/.test(key)));
  assert.ok(keys.every(key => [studyKeyFor(slug), recallKeyFor(slug)].includes(key)),
    `dependency lookup must not create another Block's learner state: ${keys.join(',')}`);
};

// Independent distinctive content/qualification checks supplement full native
// answer-HTML equality. These are transport checks, not clinical reinterpretation.
const requiredText = {
  'a2-r01-kp01-precision': ['约500 mL', 'FRC＝ERV＋RV', '约2500 mL', '500−150＝350 mL', '四容积', '不能当所有人的实测值'],
  'a2-r02-lg04-precision': ['1.34 mL', '26.5 mmHg', '250倍', '50 g/L', 'PaO₂≥60', '普通SpO₂', '共氧测定', '旧“加5%CO₂”不能当常规操作', '上坡缓，下坡陡', '增高右移'],
  'a2-r09-lg05-precision': ['至少5天', 'INR达治疗要求', '不能第五天自动停肝素', '急性HIT血小板恢复前不得直接启动华法林', 'AHA/ACC 2026 A–E版本分开'],
  'a2-r10-kp02-precision': ['每小时>200 mL', '持续3小时', '一次抽到血不等于进行性出血'],
  'a2-r10-kp04-precision': ['Light三条任一满足', '三条均不满足', '不是Light必备条件', '假性渗出', '所有渗出低糖'],
  'a2-r10-kp08-precision': ['首次<800 mL', '以后每次<1000 mL', 'BTS 2023', '最多1.5 L', '须提前停止', '不能默认利尿激素'],
  'a2-r10-kp16-precision': ['恰好20%', '不能自行补成', '不能等待大小达到阈值'],
  'a2-r10-kp19-precision': ['第2肋间', '第6–7肋间', '液体须超声定位', '堵塞绝不是自动拔管依据', '不删第六行', '不构成完整胸管操作教程'],
  'a2-r11-lg05-precision': ['PD-1', 'PD-L1', '直接靶点是PD-1', '不以PET浓聚代替组织确诊', '第9版', '不代表所有分期现代一线'],
  'a2-r12-kp09-precision': ['通常<18 mmHg', '通常>18 mmHg', '恰好18', '不能添等号'],
  'a2-r12-kp12-precision': ['5 cmH₂O', '8–18 cmH₂O', '不是人人固定目标', '低容量会放大PEEP回心下降'],
  'a2-r12-kp13-precision': ['预测体重PBW', '绝非实际体重', '≤30 cmH₂O', '<30 cmH₂O', '版本符号分别保留', '压力控制本身不保证潮气量安全'],
  'a2-r12-kp16-precision': ['海平面、静息、室内空气', 'PaO₂<60', 'PaCO₂>50', '不要求治疗后PaO₂仍<60'],
  'a2-r12-kp17-precision': ['SpO₂88–92%', '复查血气后调整', '不能放任严重低氧', 'Haldane效应', '不机械套慢性COPD方案']
};
let browser;
try {
  const projections = new Map();
  const expected = new Map();
  for (const [slug, ids] of Object.entries(admittedBySlug)) {
    const projection = resolveXizongLearnerProjection(loadXizongBlock('respiratory', slug), {
      enrichBlock: block => ({ ...block, kpRecords: block.kpRecords.map(kp => ({
        ...kp, detailHtml: marked.parse(projectKpCore(kp.detailMarkdown))
      })) })
    });
    const object = projection.learnerObject;
    projections.set(slug, projection);
    const rows = flattenCues(object);
    const originals = originalCues.filter(row => row.anchor.block_id === object.identity.blockId);
    assert.deepEqual(rows.map(row => row.cue.id).sort(), originals.map(row => row.id).sort());
    for (const original of originals) {
      const matches = rows.filter(row => row.cue.id === original.id);
      assert.equal(matches.length, 1, `${original.id}: exactly one original owner`);
      const { owner, cue } = matches[0];
      assert.equal(cue.cue, original.cue); assert.deepEqual(cue.anchor, original.anchor);
      if (original.anchor.kp_id) assert.equal(owner.identity.kpId, original.anchor.kp_id);
      else {
        assert.equal(owner.identity.logicGroupId, original.anchor.logic_group_id);
        assert.deepEqual(owner.kpIds, original.members);
      }
      assert.equal(Boolean(cue.raw?.prepared_memory_ref), ids.includes(original.id));
      if (!ids.includes(original.id)) {
        assert.equal(cue.answerBearing, false, `${original.id}: held awareness`);
        assert.equal(cue.answerHtml, '');
      }
    }
    assert.equal(supportsXizongPreparedMemoryBlock(object.identity.blockId), ids.length > 0);
    // Both full-release builders must exclude held cues, even though awareness
    // remains present in the unchanged learner object.
    for (const descriptor of [describeFull(object), describeCompatibility(projection.block, projection.learningCues)]) {
      assert.deepEqual(sortedIds(descriptor.precisionCards), ids.map(id => `precision:${id}`).sort());
      assert.equal(descriptor.coreCards.length, object.kps.length);
    }
    if (!ids.length) continue;
    const descriptor = describe(object);
    assert.deepEqual(sortedIds(descriptor.precisionCards), ids.map(id => `precision:${id}`).sort());
    assert.deepEqual(descriptor.coreCards, []); assert.deepEqual(descriptor.attentionSignals, []);
    assert.deepEqual(descriptor.promptOverrides, {}); assert.deepEqual(descriptor.markedFragments, []);
    // Native input is only an expected answer oracle. Browser availability below
    // must be created by the real action, never installed from this fixture.
    const state = makePreparedMemoryAvailable(createXizongMemoryState(), descriptor, '2026-10-01T00:00:00Z');
    expected.set(slug, releasedMemoryCards(state, 'PRECISION'));
  }
  assert.equal([...expected.values()].flat().length, 26);
  assert.equal(originalCues.length, 32);
  const r2Group = projections.get('r02').learnerObject.logicGroups.find(group => group.identity.logicGroupId === 'respiratory-r02-lg04');
  const r2Members = ['respiratory-r02-kp07', 'respiratory-r02-kp08', 'respiratory-r02-kp09', 'respiratory-r02-kp10', 'respiratory-r02-kp11'];
  assert.deepEqual(r2Group.kpIds, r2Members);
  const r2Ref = r2Group.precision.find(cue => cue.id === 'a2-r02-lg04-precision').raw.prepared_memory_ref;
  assert.deepEqual(r2Ref.owner_kp_ids, r2Members);
  assert.ok(r2Ref.core_refs.some(ref => ref.kp_id === 'respiratory-r02-kp05'), 'R2 complete capacity answer retains its extra KP05 dependency');
  const r11Cue = flattenCues(projections.get('r11').learnerObject).find(row => row.cue.id === 'a2-r11-lg05-precision').cue;
  assert.ok(r11Cue.raw.prepared_memory_ref.core_refs.some(ref => ref.kp_id === 'respiratory-r11-kp16'), 'R11 tissue-diagnosis condition retains KP16');
  const r2Card = expected.get('r02').find(card => card.precisionCueId === 'a2-r02-lg04-precision');
  assert.equal(r2Card.kpId, ''); assert.equal(r2Card.logicGroupId, 'respiratory-r02-lg04');
  checks.push('native preflight: exactly26 reviewed admissions, all32 original cue/anchor/member identities, all6 held refs absent, both release builders preserve Core and do not manufacture held Precision');

  const { chromium } = await import(process.env.KIANOS_PLAYWRIGHT_MODULE || 'playwright');
  browser = await chromium.launch({ headless: true, ...(process.env.KIANOS_TEST_CHROME ? { executablePath: process.env.KIANOS_TEST_CHROME } : {}) });
  const newContext = async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
    await context.route('**/*', route => new URL(route.request().url()).origin === base.origin ? route.continue() : route.abort());
    context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
    return context;
  };
  const openPrepared = async (page, slug) => {
    await page.locator('[data-open-prepared-memory]').click();
    await page.waitForURL(url => url.pathname.endsWith('/xizong/memory/')
      && url.searchParams.get('view') === 'precision' && url.searchParams.get('block') === `respiratory-${slug}`);
    await ready(page);
    await page.waitForFunction(count => document.querySelector('[data-memory-queue]')?.querySelectorAll('button').length === count, expected.get(slug).length);
  };
  const choose = async (page, cards, id) => {
    const index = cards.findIndex(card => card.precisionCueId === id); assert.ok(index >= 0, id);
    await page.locator('[data-memory-queue] button').nth(index).click(); return cards[index];
  };
  const assertActualAnswers = async (page, cards) => {
    for (const [index, card] of cards.entries()) {
      await page.locator('[data-memory-queue] button').nth(index).click();
      assert.equal((await page.locator('[data-memory-precision-text]').textContent()).trim(), card.cue);
      const answer = page.locator('[data-memory-answer]'); assert.equal(await answer.isVisible(), true);
      const actual = answer.locator(`[data-prepared-memory="${card.precisionCueId}"]`);
      assert.equal(await actual.count(), 1);
      const expectedText = await page.evaluate(html => {
        const template = document.createElement('template'); template.innerHTML = html;
        return template.content.textContent;
      }, card.answerHtml);
      assert.equal(normalized(await actual.textContent()), normalized(expectedText));
      for (const text of requiredText[card.precisionCueId] || []) {
        assert.ok(normalized(await actual.textContent()).includes(normalized(text)), `${card.precisionCueId}: retained qualification ${text}`);
      }
      assert.match(await page.locator('[data-memory-precision-resolution]').textContent(), /已绑定精确答案/);
    }
  };

  const journeys = [
    { slug: 'r01', select: 'a2-r01-kp01-precision', label: 'original KP volume/value/formula owner' },
    { slug: 'r02', select: 'a2-r02-lg04-precision', label: 'genuine LG04 single card with KP07–11 and empty kpId' },
    { slug: 'r09', select: 'a2-r09-lg05-precision', label: 'qualified anticoagulation with acute-PE KP18 held' },
    { slug: 'r10', select: 'a2-r10-kp08-precision', label: 'qualified course/current procedure values and limits' },
    { slug: 'r11', select: 'a2-r11-lg05-precision', label: 'complete LG drug/target/staging and tissue-diagnosis boundary' },
    { slug: 'r12', select: 'a2-r12-kp13-precision', label: 'ventilation PBW/version bounds plus room-air and oxygen samples' }
  ];
  for (const { slug, select, label } of journeys) {
    const context = await newContext();
    const page = await context.newPage();
    const object = projections.get(slug).learnerObject, cards = expected.get(slug);
    const studyKey = studyKeyFor(slug), recallKey = recallKeyFor(slug);
    await page.goto(blockUrl(slug), { waitUntil: 'domcontentloaded' }); await blockReady(page, slug);
    const host = page.locator('[data-xizong-v6-block]');
    const payload = JSON.parse(await page.locator('[data-xizong-learner-object-payload]').textContent());
    assert.deepEqual(payload.kps.map(kp => kp.identity.kpId), object.kps.map(kp => kp.identity.kpId));
    const servedDescriptor = describe(payload);
    assert.deepEqual(sortedIds(servedDescriptor.precisionCards), cards.map(card => card.id).sort());
    for (const card of cards) {
      const served = servedDescriptor.precisionCards.find(row => row.id === card.id);
      assert.equal(served.answerHtml, card.answerHtml);
      assert.equal(served.kpId, card.kpId); assert.equal(served.logicGroupId, card.logicGroupId);
    }
    assert.deepEqual(flattenCues(payload).map(row => ({ id: row.cue.id, anchor: row.cue.anchor, cue: row.cue.cue })),
      flattenCues(object).map(row => ({ id: row.cue.id, anchor: row.cue.anchor, cue: row.cue.cue })));
    assert.deepEqual(payload.sourceContact.hardReadinessBlockIds, []);
    assert.deepEqual(payload.sourceContact.requiredPriorBlockIds, []);
    assert.equal(await host.getAttribute('data-post-chat-recall-available'), 'true');
    const initial = await read(page, studyKey);
    assert.deepEqual(claims(initial), emptyClaims); assert.equal(await read(page, memoryKey), null);
    await host.locator('[data-study-stage="block_learn"] [data-post-chat-recall]').click();
    await host.locator('[data-study-stage="kp_recall"]').waitFor({ state: 'visible' });
    const entry = await read(page, studyKey);
    assert.equal(entry.recallEntryMode, 'POST_CHAT_RECALL'); assert.deepEqual(claims(entry), claims(initial));
    const front = host.locator('[data-kp-recall-card]:visible').first();
    const firstId = await front.getAttribute('data-kp-id');
    const first = object.kps.find(kp => kp.identity.kpId === firstId); assert.ok(first);
    assert.equal((await front.locator(':scope > header > h3').textContent()).trim(), first.identity.title);
    assert.equal((await front.locator(':scope > header > p').textContent()).trim(), first.prompt.canonical.trim());
    assert.equal(await front.locator('[data-kp-answer]').isVisible(), false);
    assert.equal(await host.locator('[data-prepared-memory]:visible').count(), 0);
    await page.keyboard.press('3'); assert.deepEqual((await read(page, studyKey)).ratings, {});
    assert.equal((await read(page, recallKey)).evidenceHistory.length, 0);
    await front.locator('[data-kp-reveal]').click();
    assert.equal(await front.locator('[data-kp-answer]').isVisible(), true);
    await front.locator('[data-rating="known"]').click();
    await page.waitForFunction(({ key, id, index }) => {
      const state = JSON.parse(localStorage.getItem(key) || 'null');
      return state?.ratings?.[id] === 'known' && state.kpIndex !== index;
    }, { key: studyKey, id: firstId, index: entry.kpIndex });
    const kpState = await read(page, studyKey), kpHistory = await read(page, recallKey);
    assert.equal(kpHistory.evidenceHistory.length, 1);
    assert.equal(kpHistory.evidenceHistory[0].kp_id, firstId);
    assert.equal(kpHistory.evidenceHistory[0].evidence_origin, 'USER_RECALL_ATTEMPT');
    assert.deepEqual(claims(kpState), claims(initial)); assert.equal(await read(page, memoryKey), null);
    assert.equal(await host.locator('[data-block-complete]').isDisabled(), true);
    await page.reload({ waitUntil: 'domcontentloaded' }); await blockReady(page, slug);
    assert.equal((await read(page, studyKey)).resumeKpId, kpState.resumeKpId);
    assert.deepEqual((await read(page, recallKey)).evidenceHistory, kpHistory.evidenceHistory);
    assert.equal(await host.locator('[data-kp-recall-card]:visible [data-kp-answer]').isVisible(), false);
    if (slug === 'r02') {
      await host.locator('[data-study-stage="kp_recall"] [data-stage-target="source_contact"]').click();
      await host.locator('[data-study-stage="source_contact"]').waitFor({ state: 'visible' });
      await page.reload({ waitUntil: 'domcontentloaded' }); await blockReady(page, slug);
      await host.locator('[data-study-stage="source_contact"] [data-post-chat-recall]').click();
      await host.locator('[data-study-stage="kp_recall"]').waitFor({ state: 'visible' });
      assert.equal((await read(page, studyKey)).resumeKpId, kpState.resumeKpId);
      assert.deepEqual(claims(await read(page, studyKey)), claims(initial));
      assert.deepEqual((await read(page, recallKey)).evidenceHistory, kpHistory.evidenceHistory);
    }
    await openPrepared(page, slug);
    const available = await read(page, memoryKey);
    assert.deepEqual(Object.keys(available.cards).sort(), cards.map(card => card.id).sort());
    assert.deepEqual(available.evidence, []); assert.deepEqual(available.releasedBlocks, {});
    assert.deepEqual(available.attention, {}); assert.deepEqual(available.marks, {});
    assert.deepEqual(available.promptOverrides, {}); assert.deepEqual(available.repairTasks, []);
    assert.equal((await page.locator('[data-memory-summary-core]').textContent()).trim(), '0');
    assert.equal((await page.locator('[data-memory-summary-today]').textContent()).trim(), '0');
    assert.ok((await page.locator('[data-memory-view-note]').textContent()).startsWith(`${object.identity.blockLabel} 已准备的精确记忆`));
    for (const id of Object.values(heldBySlug).flat()) assert.ok(!available.cards[`precision:${id}`]);
    if (slug === 'r02') {
      assert.equal(available.cards[`precision:${select}`].kpId, '');
      assert.equal(available.cards[`precision:${select}`].logicGroupId, 'respiratory-r02-lg04');
      const group = payload.logicGroups.find(group => group.identity.logicGroupId === 'respiratory-r02-lg04');
      assert.deepEqual(group.kpIds, r2Members);
      assert.equal(Object.keys(available.cards).filter(id => id === `precision:${select}`).length, 1);
    }
    await assertActualAnswers(page, cards);
    await choose(page, cards, select);
    const answer = page.locator('[data-memory-answer]');
    await page.locator('[data-memory-rating="known"]').dispatchEvent('click');
    assert.deepEqual((await read(page, memoryKey)).evidence, [], 'Browse cannot rate');
    await page.locator('[data-precision-mode="RECALL"]').click();
    assert.equal(await answer.isVisible(), false); assert.equal(await page.locator('[data-memory-ratings]').isVisible(), false);
    await page.locator('[data-memory-rating="known"]').dispatchEvent('click');
    assert.deepEqual((await read(page, memoryKey)).evidence, [], 'Recall cannot rate before Reveal');
    await page.screenshot({ path: path.join(out, `${slug}-prepared-front.png`), fullPage: true });
    await page.locator('[data-memory-reveal]').click(); assert.equal(await answer.isVisible(), true);
    for (const text of requiredText[select] || []) assert.ok(normalized(await answer.textContent()).includes(normalized(text)));
    await page.screenshot({ path: path.join(out, `${slug}-prepared-reveal.png`), fullPage: true });
    await page.locator('[data-memory-rating="known"]').click();
    const rated = await read(page, memoryKey);
    assert.equal(rated.evidence.length, 1); assert.equal(rated.evidence[0].cardId, `precision:${select}`);
    assert.deepEqual(rated.releasedBlocks, {});
    await page.reload({ waitUntil: 'domcontentloaded' }); await ready(page);
    assert.deepEqual(await read(page, memoryKey), rated);
    await page.goto(blockUrl(slug), { waitUntil: 'domcontentloaded' }); await blockReady(page, slug);
    await openPrepared(page, slug); assert.deepEqual(await read(page, memoryKey), rated);
    assert.deepEqual(claims(await read(page, studyKey)), claims(initial));
    assert.deepEqual((await read(page, recallKey)).evidenceHistory, kpHistory.evidenceHistory);
    await assertNoDependencyState(page, slug);
    checks.push(`${slug}: ${label}; all native prepared answers reach Browse/Reveal, actual KP and Memory ratings persist once, reload/reopen preserve evidence and no Source/learning/Core/full release/dependency debt is created`);
    await context.close();
  }

  // Held-only Blocks retain real Core and original LG awareness, including the
  // R7 LG06 supported answer that remains blocked by its Learning/Core conflict.
  for (const slug of ['r04', 'r07', 'r08']) {
    const context = await newContext(), page = await context.newPage();
    await page.goto(blockUrl(slug), { waitUntil: 'domcontentloaded' }); await blockReady(page, slug);
    const payload = JSON.parse(await page.locator('[data-xizong-learner-object-payload]').textContent());
    for (const id of heldBySlug[slug]) {
      const { owner, cue } = flattenCues(payload).find(row => row.cue.id === id) || {};
      assert.ok(owner && cue, `${id}: awareness identity remains`);
      assert.equal(cue.answerBearing, false); assert.equal(cue.answerHtml, '');
      assert.ok(!cue.raw?.prepared_memory_ref);
      for (const kpId of owner.kpIds || []) assert.ok(payload.kps.find(kp => kp.identity.kpId === kpId)?.core?.markdown);
    }
    if (slug !== 'r08') assert.equal(await page.locator('[data-open-prepared-memory]').isVisible(), false);
    assert.equal(await read(page, memoryKey), null);
    assert.deepEqual(claims(await read(page, studyKeyFor(slug))), emptyClaims);
    await page.goto(preparedUrl(slug), { waitUntil: 'domcontentloaded' }); await ready(page);
    assert.equal(await read(page, memoryKey), null, 'a URL cannot create availability or a held answer');
    assert.equal(await page.locator('[data-memory-queue] button').count(), 0);
    await context.close();
  }
  checks.push('actual R4/R7/R8 preserve held native LG/Core awareness and reject URL-manufactured availability; R4 and R7 have no prepared action, including R7 LG06');

  // Synthetic pre-existing same-ID history. No actual completion/Source is seeded.
  {
    const context = await newContext(), page = await context.newPage();
    await page.goto(blockUrl('r09'), { waitUntil: 'domcontentloaded' }); await blockReady(page, 'r09');
    const beforeStudy = await raw(page, studyKeyFor('r09'));
    const object = projections.get('r09').learnerObject;
    const kp = object.kps.find(kp => kp.identity.kpId === 'respiratory-r09-kp18');
    const cue = kp.precision.find(cue => cue.id === 'a2-r09-kp18-precision');
    const id = `precision:${cue.id}`;
    const history = createXizongMemoryState();
    history.cards[id] = {
      id, family: 'PRECISION', systemId: 'respiratory', canonicalId: 'A2', blockId: 'respiratory-r09',
      blockLabel: object.identity.blockLabel, blockTitle: object.identity.title,
      kpId: kp.identity.kpId, logicGroupId: kp.identity.logicGroupId, displayId: kp.identity.displayId,
      title: kp.identity.title, cue: cue.cue, precisionCueId: cue.id,
      answerHtml: '', ownerContextHtml: '<p>Declared synthetic prior owner context. No exact acute-PE ECG answer.</p>',
      answerResolution: 'OWNER_CONTEXT_ONLY', sourceLocator: cue.sourceLocator,
      sourceHash: 'declared-historical-fixture', semanticRevision: 'declared-historical-fixture',
      releasedAt: '2026-09-01T00:00:00Z', contentHistory: [{ answerHtml: '', at: '2026-08-01T00:00:00Z' }]
    };
    history.evidence = [{ id: 'declared-history-r09', cardId: id, family: 'PRECISION', rating: 'unknown', origin: 'DECLARED_BROWSER_FIXTURE', at: '2026-09-01T01:00:00Z' }];
    history.attention[id] = { reviewRequested: true, reason: 'DECLARED_BROWSER_FIXTURE', updatedAt: '2026-09-01T01:00:00Z' };
    history.marks = { declared: { id: 'declared', text: 'Synthetic private history, preserve unchanged' } };
    await page.evaluate(({ key, state }) => localStorage.setItem(key, JSON.stringify(state)), { key: memoryKey, state: history });
    await openPrepared(page, 'r09');
    const after = await read(page, memoryKey);
    assert.deepEqual(after.cards[id], history.cards[id]); assert.deepEqual(after.evidence, history.evidence);
    assert.deepEqual(after.attention, history.attention); assert.deepEqual(after.marks, history.marks);
    assert.deepEqual(after.releasedBlocks, {});
    assert.deepEqual(Object.keys(after.cards).sort(), [id, 'precision:a2-r09-lg05-precision'].sort());
    assert.equal(await raw(page, studyKeyFor('r09')), beforeStudy);
    assert.equal(await page.locator('[data-memory-queue] button').count(), 1, 'selected prepared view excludes old owner-context history');
    assert.equal((await page.locator('[data-memory-precision-text]').textContent()).trim(), expected.get('r09')[0].cue);
    assert.equal(await page.locator('[data-memory-answer] [data-prepared-memory="a2-r09-lg05-precision"]').count(), 1);
    // General Precision retains the historical row. Exclusion is a view filter,
    // not destructive cleanup or reassignment of its original identity/evidence.
    await page.locator('[data-memory-view="PRECISION"]').click();
    assert.equal(await page.locator('[data-memory-queue] button').count(), 2);
    const all = releasedMemoryCards(after, 'PRECISION');
    await page.locator('[data-memory-queue] button').nth(all.findIndex(card => card.id === id)).click();
    assert.match(await page.locator('[data-memory-precision-resolution]').textContent(), /不从正文猜取阈值/);
    await page.goto(preparedUrl('r09'), { waitUntil: 'domcontentloaded' }); await ready(page);
    assert.equal(await page.locator('[data-memory-queue] button').count(), 1);
    assert.deepEqual(await read(page, memoryKey), after);
    checks.push('actual R9 preserves old same-ID OWNER_CONTEXT_ONLY card/evidence/history/attention/marks byte-for-value, keeps it in general Precision, excludes it only from selected prepared view');
    await context.close();
  }

  // Failure injection is confined to empty isolated profiles after real native
  // initialization. Test both an LG and qualified procedure, preserving null or
  // an already-existing stored document rather than claiming a successful save.
  for (const slug of ['r02', 'r10']) {
    const context = await newContext(), page = await context.newPage();
    await page.goto(blockUrl(slug), { waitUntil: 'domcontentloaded' }); await blockReady(page, slug);
    if (slug === 'r10') await page.evaluate(({ key, state }) => localStorage.setItem(key, JSON.stringify(state)), {
      key: memoryKey, state: { ...createXizongMemoryState(), marks: { declared: { text: 'Existing synthetic saved private mark' } } }
    });
    const beforeMemory = await raw(page, memoryKey), beforeStudy = await raw(page, studyKeyFor(slug));
    await page.evaluate(key => {
      const write = Storage.prototype.setItem;
      Storage.prototype.setItem = function (name, value) {
        if (name === key) throw new Error('Declared A2 prepared persistence-failure fixture');
        return write.call(this, name, value);
      };
    }, memoryKey);
    await page.locator('[data-open-prepared-memory]').click();
    await page.waitForFunction(() => document.querySelector('[data-prepared-memory-status]')?.textContent.includes('无法安全打开'));
    assert.equal(page.url(), blockUrl(slug)); assert.equal(await raw(page, memoryKey), beforeMemory);
    assert.equal(await raw(page, studyKeyFor(slug)), beforeStudy);
    await assertNoDependencyState(page, slug); await context.close();
  }
  checks.push('actual R2 LG and R10 procedure failed availability save preserve previous bytes/null and Block state and refuse navigation');

  // Failed explicit rating is a different transaction from failed availability.
  {
    const context = await newContext(), page = await context.newPage();
    await page.goto(blockUrl('r02'), { waitUntil: 'domcontentloaded' }); await blockReady(page, 'r02');
    await openPrepared(page, 'r02'); await choose(page, expected.get('r02'), 'a2-r02-lg04-precision');
    await page.locator('[data-precision-mode="RECALL"]').click(); await page.locator('[data-memory-reveal]').click();
    const beforeMemory = await raw(page, memoryKey), beforeStudy = await raw(page, studyKeyFor('r02'));
    await page.evaluate(key => {
      const write = Storage.prototype.setItem;
      Storage.prototype.setItem = function (name, value) {
        if (name === key) throw new Error('Declared A2 rating persistence-failure fixture');
        return write.call(this, name, value);
      };
    }, memoryKey);
    await page.locator('[data-memory-rating="known"]').click();
    await page.waitForFunction(() => document.querySelector('[data-xizong-memory-workspace]')?.dataset.memoryStateBlocked === 'true');
    assert.equal(await raw(page, memoryKey), beforeMemory); assert.equal(await raw(page, studyKeyFor('r02')), beforeStudy);
    assert.deepEqual((await read(page, memoryKey)).evidence, []);
    await page.reload({ waitUntil: 'domcontentloaded' }); await ready(page);
    assert.equal(await raw(page, memoryKey), beforeMemory);
    checks.push('actual LG Reveal followed by failed rating save blocks the workspace, preserves old bytes and no evidence survives reload');
    await context.close();
  }

  // No unsafe reader-to-writer fallback. Native no-Web-Locks behavior is used;
  // no forged learned/completed flags, writer-ready events or storage are seeded.
  {
    const context = await newContext();
    await context.addInitScript(() => Object.defineProperty(navigator, 'locks', { configurable: true, value: undefined }));
    const page = await context.newPage(); await page.goto(blockUrl('r01'), { waitUntil: 'domcontentloaded' });
    await page.bringToFront(); await page.waitForFunction(() => document.documentElement.dataset.learnerWriter === 'unavailable');
    const nativeStorage = () => page.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter(key => /^kianos[-:]/.test(key)).map(key => [key, localStorage.getItem(key)])));
    const before = await nativeStorage();
    const postChat = page.locator('[data-study-stage="block_learn"] [data-post-chat-recall]');
    assert.equal(await postChat.isVisible(), true);
    await postChat.click();
    assert.deepEqual(await nativeStorage(), before); assert.equal(await read(page, memoryKey), null);
    assert.equal(await read(page, studyKeyFor('r01')), null);
    assert.equal(await page.locator('[data-study-stage="block_learn"]').isVisible(), true);
    checks.push('declared no-Web-Locks read-only A2 reader never turns post-Chat click into Source/learning/rating/release/debt or an unsafe writer fallback');
    await context.close();
  }

  assert.deepEqual(errors, []);
  report.status = 'PASS'; report.completed_at = new Date().toISOString();
  fs.writeFileSync(path.join(out, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`XIZONG_A2_PREPARED_MEMORY_BROWSER PASS | checks=${checks.length} | isolated synthetic evidence only`);
} catch (error) {
  report.status = 'FAIL'; report.completed_at = new Date().toISOString(); report.error = String(error?.stack || error);
  fs.writeFileSync(path.join(out, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  throw error;
} finally {
  await browser?.close();
}
