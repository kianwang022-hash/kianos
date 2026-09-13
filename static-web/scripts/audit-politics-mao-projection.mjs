import { listPoliticsSubjectsCurrent, loadPoliticsChapterCurrent } from '../src/lib/politicsCurrent.mjs';

function fail(message) {
  console.error(`POLITICS_MAO_PROJECTION_FAIL: ${message}`);
  process.exitCode = 1;
}

const mao = listPoliticsSubjectsCurrent().find((subject) => subject.subject === 'mao');
if (!mao) fail('Mao subject missing from Current');
if (mao && mao.chapters.length !== 9) fail(`Mao chapter count ${mao.chapters.length}/9`);

let units = 0;
let projectedAnswers = 0;
let pluralAnswerUnits = 0;

for (const meta of mao?.chapters || []) {
  const chapter = loadPoliticsChapterCurrent('mao', meta.code);
  if (!chapter?.orientation?.question) fail(`${meta.code} orientation question missing`);
  if (!chapter?.orientation?.answer) fail(`${meta.code} orientation answer missing`);
  if (!chapter?.units?.length) fail(`${meta.code} has no projected Natural Units`);

  for (const unit of chapter?.units || []) {
    units += 1;
    if (!unit?.teaching?.question) fail(`${meta.code}/${unit.unitId} learner problem missing`);

    const rawHasSingularAnswer = Boolean(String(unit?.raw?.answer || unit?.raw?.core_answer || unit?.raw?.evaluation || '').trim());
    const rawPluralAnswers = Array.isArray(unit?.raw?.answers)
      ? unit.raw.answers.map((item) => String(item || '').trim()).filter(Boolean)
      : [];
    const projectedAnswer = String(unit?.teaching?.answer || '').trim();

    if ((rawHasSingularAnswer || rawPluralAnswers.length) && !projectedAnswer) {
      fail(`${meta.code}/${unit.unitId} accepted core answer is missing from Projection`);
    }
    if (projectedAnswer) projectedAnswers += 1;

    if (rawPluralAnswers.length) {
      pluralAnswerUnits += 1;
      if (unit?.maoProjection?.preservedPluralAnswers !== rawPluralAnswers.length) {
        fail(`${meta.code}/${unit.unitId} plural-answer projection ${unit?.maoProjection?.preservedPluralAnswers || 0}/${rawPluralAnswers.length}`);
      }
      for (const answer of rawPluralAnswers) {
        if (!projectedAnswer.includes(answer)) fail(`${meta.code}/${unit.unitId} projected answer lost a plural answer segment`);
      }
    }
  }
}

if (pluralAnswerUnits !== 1) fail(`expected exactly one Current Mao plural-answer unit, found ${pluralAnswerUnits}`);

if (!process.exitCode) {
  console.log('POLITICS_MAO_PROJECTION_PASS');
  console.log(JSON.stringify({ chapters: mao.chapters.length, units, projectedAnswers, pluralAnswerUnits }));
}
