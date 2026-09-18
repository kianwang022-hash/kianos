import {
  listEnglishExamPapers,
  loadEnglishExamPaper
} from '../../../lib/englishExamPaper.mjs';
import { loadReadingAnswersById } from '../../../lib/englishReadingSourceTruth.mjs';
import {
  loadClozeAnswersById,
  loadReadingBAnswersById
} from '../../../lib/englishObjectiveSourceTruth.mjs';
import { ENGLISH_EXAM_ANSWER_SCHEMA } from '../../../lib/englishExamSession.mjs';

export function getStaticPaths() {
  return listEnglishExamPapers().map((paper) => ({
    params: { id: paper.paperId },
    props: { paperId: paper.paperId }
  }));
}

export function GET({ props }) {
  const paper = loadEnglishExamPaper(props.paperId);
  const steps = {};

  for (const step of paper.steps) {
    let packet = null;
    if (step.task === 'reading_a') packet = loadReadingAnswersById(step.object_id);
    else if (step.task === 'cloze') packet = loadClozeAnswersById(step.object_id);
    else if (step.task === 'reading_b') packet = loadReadingBAnswersById(step.object_id);
    else continue;

    steps[step.step_id] = {
      task: step.task,
      object_id: step.object_id,
      answers: packet.answers
    };
  }

  return new Response(JSON.stringify({
    schema: ENGLISH_EXAM_ANSWER_SCHEMA,
    paper_id: paper.paper_id,
    year: paper.year,
    steps
  }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}
