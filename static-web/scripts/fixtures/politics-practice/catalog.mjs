// Entirely synthetic. No Current corpus, held-out question or learner profile.
const unit = (n) => ({
  key: `fixture/ch01/NU${n}`, id: `NU${n}`, title: `合成学习单元 ${n}`, subject: 'fixture', chapter: 'ch01',
  href: `/politics/fixture/ch01/#unit-${n}`, source: [{ id: `SYNTHETIC-SOURCE-${n}`, title: '合成来源定位', text: 'SOURCE_ONLY_AFTER_SUBMIT\n合成来源文本，仅用于验证从复盘返回当前题。' }],
  questionIds: []
});
const units = [unit(1), unit(2)];
const questions = Array.from({ length: 8 }, (_, i) => {
  const multiple = i === 1 || i === 6, u = units[i < 5 ? 0 : 1], id = `SYNTHETIC-${multiple ? 'M' : 'S'}-${i + 1}`;
  u.questionIds.push(id);
  const long = i === 4;
  return {
    id, sourceId: `synthetic_source_${i + 1}`, number: i + 1, subject: 'fixture', subjectLabel: '合成科目', chapter: 'ch01', chapterTitle: '工作台浏览器样本', unitKey: u.key, unitId: u.id, unitTitle: u.title, unitHref: u.href,
    type: multiple ? 'multiple' : 'single',
    stem: long ? '长内容压力样本：在一个多步骤的材料核对过程中，需要同时保留记录、修订和原始位置。\n' + '这一段是合成题面，使用同一通用表示检查长中文材料的行长、换行与滚动。'.repeat(12) : `合成题 ${i + 1}：按题面选择对应的记录方式。${multiple ? '本题可选择多个选项。' : '本题只选择一个选项。'}`,
    options: ['A', 'B', 'C', 'D'].map((label, j) => ({ label, text: long ? `${label}：` + '在保留原始记录的前提下检查当前材料，沿明确的来源路径继续操作。'.repeat(3 + j) : ['保留最初记录', '沿确切位置继续', '取消所有来源', '建立另一份原题'][j] })),
    answer: multiple ? 'AB' : 'B', refined: { takeaway: 'TAKEAWAY_PROTECTED · 合成记录应保留第一次作答。', chatExplanation: 'EXPLANATION_PROTECTED\n这是一份合成解析，不含真实政治知识或题库内容。\n' + (long ? '完整段落必须可以连续阅读。保留句子之间的关系，不用摘要取代全文。\n'.repeat(30) : '选择、首答、修复分别保存。返回应保留题组与原题。'), contentVersion: 'synthetic-v1' }
  };
});
for (const u of units) u.returnConfig = { schema: 'kianos.politics.unit_return_projection.v1', unit_key: u.key, subject: u.subject, chapter: u.chapter, natural_unit_id: u.id, runtime_unit_id: u.id, source_anchor: `source-${u.id}`, expected_question_ids: [...u.questionIds], expected_question_count: u.questionIds.length };
export const catalog = { schema: 'kianos.politics.practice_catalog.v1', revision: 'isolated-synthetic-v1', reviewBase: '/politics/practice-review/', subjects: [{ id: 'fixture', label: '合成科目' }], chapters: [{ key: 'fixture/ch01', subject: 'fixture', code: 'ch01', title: '工作台浏览器样本', questionIds: questions.map((q) => q.id) }], units, questions };
export const chapter = { subject: 'fixture', code: 'ch01', units: units.map((u) => ({ unitId: u.id, title: u.title, questions: questions.filter((q) => q.unitKey === u.key) })), repairProjection: {} };
