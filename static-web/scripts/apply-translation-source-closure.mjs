import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd(), '..');
const bankPath = path.join(repoRoot, 'content/english/source/question_bank.v1.json');
const manifestPath = path.join(repoRoot, 'content/english/manifest.json');

const targets = {
  'english1-2022-translation-main-q48': {
    promptPrefix: 'he could not analyze carefully what this obscure officer may or may not have contributed to that great struggle between nations or indeed tell us anything much about the man himself.',
    reference: '他无法仔细分析这位默默无闻的军官究竟是否对那场国家之间的重大斗争作出过什么贡献，也无法真正告诉我们多少关于这个人本人的情况。',
    sources: [
      { provider: '新东方在线', url: 'https://kaoyan.koolearn.com/20211225/1483402.html' },
      { provider: '文都考研', url: 'https://kaoyan.wendu.com/2021/1226/199504.shtml' },
      { provider: '华图教育', url: 'https://m.ah.huatu.com/2021/1229/2207931.html' }
    ]
  },
  'english1-2022-translation-main-q49': {
    promptPrefix: 'There may have been many spies and intelligence officers during the Napoleonic Wars, but it is usually extremely difficult to find the material they actually provided or worked on.',
    reference: '拿破仑战争期间可能有过许多间谍和情报人员，但通常极难找到他们实际提供过或处理过的材料。',
    sources: [
      { provider: '新东方在线', url: 'https://kaoyan.koolearn.com/20211225/1483402.html' },
      { provider: '文都考研', url: 'https://kaoyan.wendu.com/2021/1226/199504.shtml' },
      { provider: '233网校', url: 'https://www.233.com/kaoyan/english/zhenti/202112/28090858339183.html' }
    ]
  },
  'english1-2025-translation-main-q46': {
    promptPrefix: 'Recent decades have seen science move into a convention where engagement in the subject can only be done through institutions such as a university.',
    reference: '近几十年来，科学逐渐形成了一种惯例：人们只有通过大学等机构才能参与这一领域。',
    sources: [
      { provider: '新东方在线', url: 'https://kaoyan.koolearn.com/20250103/1795514.html' },
      { provider: '中公考研 / 考研招生在线', url: 'https://www.yanzhaowang.com.cn/beikao/en/202503/2561015.html' },
      { provider: '懒笔记逐句解析', url: 'https://english-exam.lazynote.cn/kaoyan/sections/2025-english-one/section2-part-c/' }
    ]
  }
};

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function objectRange(raw, id) {
  const needle = `{"id":"${id}"`;
  const start = raw.indexOf(needle);
  if (start < 0) throw new Error(`TARGET_ROW_NOT_FOUND:${id}`);
  if (raw.indexOf(needle, start + 1) >= 0) throw new Error(`TARGET_ROW_DUPLICATED:${id}`);

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < raw.length; i += 1) {
    const ch = raw[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return { start, end: i + 1 };
    }
  }
  throw new Error(`TARGET_ROW_UNTERMINATED:${id}`);
}

let bankRaw = fs.readFileSync(bankPath, 'utf8');
const manifestRaw = fs.readFileSync(manifestPath, 'utf8');
const oldBankHash = sha256(bankRaw);
const manifest = JSON.parse(manifestRaw);
if (manifest?.source_identity?.question_bank_sha256 !== oldBankHash) {
  throw new Error(`PREMUTATION_HASH_MISMATCH:${manifest?.source_identity?.question_bank_sha256 || 'missing'}/${oldBankHash}`);
}

for (const [id, spec] of Object.entries(targets)) {
  const { start, end } = objectRange(bankRaw, id);
  const row = JSON.parse(bankRaw.slice(start, end));
  if (row.id !== id) throw new Error(`TARGET_IDENTITY_MISMATCH:${id}/${row.id || 'missing'}`);
  if (row.answer !== null) throw new Error(`TARGET_ANSWER_NOT_NULL:${id}`);
  if (row?.analysis?.analysis_status !== 'pending_review') throw new Error(`TARGET_NOT_PENDING_REVIEW:${id}`);
  if (row?.analysis?.reference_translation) throw new Error(`TARGET_REFERENCE_ALREADY_PRESENT:${id}`);
  if (!String(row.prompt || '').startsWith(spec.promptPrefix)) throw new Error(`TARGET_PROMPT_MISMATCH:${id}`);

  row.analysis = {
    ...row.analysis,
    analysis_status: 'cross_verified_reference',
    reference_translation: spec.reference,
    reference_translation_verification: {
      status: 'cross_verified_public_reference',
      official: false,
      verified_on: '2026-09-12',
      method: 'exact_prompt_identity_plus_independent_public_semantic_crosscheck',
      semantic_rule: 'Normalized Chinese reference is admitted only after exact English prompt identity and core semantics agree across independent public analyses; wording is not represented as an official or unique translation.',
      sources: spec.sources
    }
  };

  bankRaw = `${bankRaw.slice(0, start)}${JSON.stringify(row)}${bankRaw.slice(end)}`;
}

const parsedAfter = JSON.parse(bankRaw);
for (const id of Object.keys(targets)) {
  const row = (parsedAfter.questions_or_prompts || []).find((item) => item?.id === id);
  if (!row?.analysis?.reference_translation) throw new Error(`POSTMUTATION_REFERENCE_MISSING:${id}`);
  if (row?.analysis?.reference_translation_verification?.official !== false) throw new Error(`POSTMUTATION_OFFICIAL_FLAG_INVALID:${id}`);
}

const newBankHash = sha256(bankRaw);
if (newBankHash === oldBankHash) throw new Error('QUESTION_BANK_HASH_UNCHANGED');
const oldHashOccurrences = manifestRaw.split(oldBankHash).length - 1;
if (oldHashOccurrences !== 1) throw new Error(`MANIFEST_OLD_HASH_OCCURRENCES:${oldHashOccurrences}`);
const newManifestRaw = manifestRaw.replace(oldBankHash, newBankHash);

fs.writeFileSync(bankPath, bankRaw, 'utf8');
fs.writeFileSync(manifestPath, newManifestRaw, 'utf8');
console.log(JSON.stringify({ changedPromptIds: Object.keys(targets), oldBankHash, newBankHash }, null, 2));
