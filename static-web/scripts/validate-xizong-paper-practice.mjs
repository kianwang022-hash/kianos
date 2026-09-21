import {
  listXizongPaperSummaries,
  loadXizongWholePaper,
  xizongQuestionSemanticRevisions
} from '../src/lib/xizongQuestions.mjs';
import {
  xizongPaperRuleTotal,
  xizongPaperPointsForNumber,
  scoreXizongPaperResults,
  sealXizongPaperState
} from '../src/lib/xizongPaperScoring.mjs';
import { collectXizongRetainedEvidence } from '../src/lib/xizongRetainedPractice.mjs';

const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`XIZONG_PAPER_PRACTICE_FAIL:${name}${detail ? `:${detail}` : ''}`);
  console.log(`PASS ${name}${detail ? ` · ${detail}` : ''}`);
};

const papers = listXizongPaperSummaries();
check(papers.length === 22, 'paper_year_count', String(papers.length));
check(papers[0]?.year === 2026 && papers.at(-1)?.year === 2005, 'paper_year_range');

for (const row of papers) {
  const paper = loadXizongWholePaper(row.year);
  check(paper.questionCount === row.questionCount, `paper_count_${row.year}`, String(paper.questionCount));
  check(paper.questions.length === row.questionCount, `paper_truth_count_${row.year}`);
  check(xizongPaperRuleTotal(paper.paperFormat) === row.maxScore, `paper_rule_total_${row.year}`, String(row.maxScore));
  check(paper.resultVisibility === 'hidden', `paper_hidden_${row.year}`);
}

check(papers.find((row) => row.year === 2006)?.questionCount === 150, 'era_2006_count');
check(papers.find((row) => row.year === 2006)?.maxScore === 150, 'era_2006_score');
check(papers.find((row) => row.year === 2007)?.questionCount === 180, 'era_2007_count');
check(papers.find((row) => row.year === 2007)?.maxScore === 300, 'era_2007_score');
check(papers.find((row) => row.year === 2016)?.questionCount === 180, 'era_2016_count');
check(papers.find((row) => row.year === 2017)?.questionCount === 165, 'era_2017_count');
check(papers.find((row) => row.year === 2026)?.questionCount === 165, 'era_2026_count');

const paper2026 = loadXizongWholePaper(2026);
const q1 = paper2026.questions.find((q) => q.number === 1);
const q2 = paper2026.questions.find((q) => q.number === 2);
const q41 = paper2026.questions.find((q) => q.number === 41);
const wrongFor = (question) => question.options.find((option) => !String(question.correctAnswer).includes(option.label))?.label;
const results2026 = {
  [q1.questionId]: { selected: [String(q1.correctAnswer)] },
  [q2.questionId]: { selected: [wrongFor(q2)] },
  [q41.questionId]: { selected: [String(q41.correctAnswer)] }
};
const summary2026 = scoreXizongPaperResults(paper2026.paperFormat, paper2026.questions, results2026);
check(summary2026.earnedScore === 3.5, 'score_2026_segment_weights', String(summary2026.earnedScore));
check(summary2026.correctCount === 2 && summary2026.wrongCount === 1, 'score_2026_counts');
check(summary2026.unansweredCount === 162, 'score_2026_unanswered', String(summary2026.unansweredCount));

const paper2007 = loadXizongWholePaper(2007);
check(xizongPaperPointsForNumber(paper2007.paperFormat, 1) === 1.6, 'score_2007_common_weight');
check(xizongPaperPointsForNumber(paper2007.paperFormat, 151) === 2, 'score_2007_clinical_tail_weight');
const paper2006 = loadXizongWholePaper(2006);
check(xizongPaperPointsForNumber(paper2006.paperFormat, 150) === 1, 'score_2006_weight');

const hiddenQid = q1.questionId;
const questionSemanticRevisions = xizongQuestionSemanticRevisions([q1]);
const hiddenState = {
  attemptHistory: [{
    type:'QUESTION_ATTEMPT',
    question_id:hiddenQid,
    question_semantic_revision:q1.semanticRevision,
    current_revision_valid:true,
    status:'wrong',
    result_visibility:'hidden',
    submitted_at:'2026-09-18T01:00:00.000Z'
  }]
};
const beforeSeal = collectXizongRetainedEvidence([
  ['kianos:xizong:paper-question-sweep:paper-2026:v1', JSON.stringify(hiddenState)]
], { questionSemanticRevisions });
check(!beforeSeal.wrongUncertainIds.includes(hiddenQid), 'unsealed_hidden_attempt_excluded_from_retained');

const sealedState = sealXizongPaperState(hiddenState, {
  answeredCount:1, correctCount:0, wrongCount:1, unansweredCount:164, questionCount:165, earnedScore:0, maxScore:300
}, '2026-09-18T02:00:00.000Z', {
  paperYear:2026,
  internalHoldoutProtectedBeforeSeal:true,
  externalExposureStatus:'UNKNOWN',
  scopeHash:'fixture-exam-format-hash',
  questionInventoryHash:'fixture-question-inventory-hash',
  examFormatSourceHash:'fixture-exam-format-hash',
  examFormat:{
    year:2026,
    era_id:'2017-2026',
    question_count:165,
    max_score:300,
    scoring_segments:[
      {start:1,end:40,points:1.5},
      {start:41,end:165,points:2}
    ]
  }
});
check(sealedState.paperSeal.evidenceContext.internalHoldoutProtectedBeforeSeal === true, 'seal_preserves_internal_holdout_identity');
check(sealedState.paperSeal.evidenceContext.externalExposureStatus === 'UNKNOWN', 'internal_holdout_does_not_claim_external_freshness');
check(sealedState.paperSeal.evidenceContext.scopeHash === 'fixture-exam-format-hash', 'seal_preserves_scope_hash');
check(sealedState.paperSeal.evidenceContext.questionInventoryHash === 'fixture-question-inventory-hash', 'seal_preserves_question_inventory_hash');
check(sealedState.paperSeal.evidenceContext.examFormatSourceHash === 'fixture-exam-format-hash', 'seal_preserves_exam_format_hash');
check(sealedState.paperSeal.evidenceContext.examFormat.question_count === 165, 'seal_preserves_exam_geometry');

const afterSeal = collectXizongRetainedEvidence([
  ['kianos:xizong:paper-question-sweep:paper-2026:v1', JSON.stringify(sealedState)]
], { questionSemanticRevisions });
check(afterSeal.wrongUncertainIds.includes(hiddenQid), 'sealed_hidden_attempt_enters_retained');
check(!collectXizongRetainedEvidence([
  ['kianos:xizong:paper-question-sweep:paper-2026:v1', JSON.stringify(sealedState)]
]).wrongUncertainIds.includes(hiddenQid), 'sealed_unknown_revision_excluded_from_current_retained');

console.log('XIZONG_PAPER_PRACTICE_PASS');
