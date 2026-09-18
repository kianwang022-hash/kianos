import { listPoliticsSubjectsCurrent, loadPoliticsChapterCurrent } from '../src/lib/politicsCurrent.mjs';
import { loadPoliticsCompiledPresentation } from '../src/lib/politicsCompiledPresentation.mjs';

function fail(message) {
  console.error(`POLITICS_MAO_PROJECTION_FAIL: ${message}`);
  process.exitCode = 1;
}

function finalText(finalObject, state = 'ORIENT') {
  return JSON.stringify(finalObject?.states?.[state] || []);
}

const mao = listPoliticsSubjectsCurrent().find((subject) => subject.subject === 'mao');
if (!mao) fail('Mao subject missing from Current');
if (mao && mao.chapters.length !== 9) fail(`Mao chapter count ${mao.chapters.length}/9`);

let units = 0;
let finalObjects = 0;
let pluralAnswerUnits = 0;

for (const meta of mao?.chapters || []) {
  const chapter = loadPoliticsChapterCurrent('mao', meta.code);
  const compiled = loadPoliticsCompiledPresentation('mao', meta.code);
  if (!chapter?.orientation?.question) fail(`${meta.code} orientation question missing`);
  if (!chapter?.orientation?.answer) fail(`${meta.code} orientation answer missing`);
  if (!chapter?.units?.length) fail(`${meta.code} has no projected Natural Units`);
  if (!(compiled instanceof Map)) fail(`${meta.code} compiled presentation missing`);

  for (const unit of chapter?.units || []) {
    units += 1;
    if (!unit?.teaching?.question) fail(`${meta.code}/${unit.unitId} learner problem missing`);

    const finalObject = compiled instanceof Map ? compiled.get(unit.unitId)?.finalLearnerObject : null;
    if (!finalObject?.states?.ORIENT?.length) {
      fail(`${meta.code}/${unit.unitId} Final Learner Object ORIENT missing`);
      continue;
    }
    finalObjects += 1;

    const rawPluralAnswers = Array.isArray(unit?.raw?.answers)
      ? unit.raw.answers.map((item) => String(item || '').trim()).filter(Boolean)
      : [];

    if (rawPluralAnswers.length) {
      pluralAnswerUnits += 1;
      const orientText = finalText(finalObject, 'ORIENT');
      for (const answer of rawPluralAnswers) {
        if (!orientText.includes(answer)) {
          fail(`${meta.code}/${unit.unitId} Final Learner Object lost a plural answer segment`);
        }
      }

      const groups = finalObject.states.ORIENT || [];
      const pluralGroup = groups.find((group) =>
        group.primitive === 'PARALLEL_SET'
        && rawPluralAnswers.every((answer) => JSON.stringify(group).includes(answer))
      );
      if (!pluralGroup) {
        fail(`${meta.code}/${unit.unitId} plural answers are not preserved as one explicit PARALLEL_SET`);
      }
    }
  }
}

if (pluralAnswerUnits !== 1) fail(`expected exactly one Current Mao plural-answer unit, found ${pluralAnswerUnits}`);
if (finalObjects !== units) fail(`Final Learner Object coverage ${finalObjects}/${units}`);

if (!process.exitCode) {
  console.log('POLITICS_MAO_PROJECTION_PASS');
  console.log(JSON.stringify({ chapters: mao.chapters.length, units, finalObjects, pluralAnswerUnits }));
}
