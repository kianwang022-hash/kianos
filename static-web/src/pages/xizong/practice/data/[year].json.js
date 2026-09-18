import { listXizongQuestionYears, loadXizongQuestionYear } from '../../../../lib/xizongQuestions.mjs';

export function getStaticPaths() {
  return listXizongQuestionYears().map((year) => ({ params: { year } }));
}

export function GET({ params }) {
  const year = String(params.year || '');
  const questions = loadXizongQuestionYear(year);
  return new Response(JSON.stringify({
    schema: 'kianos.xizong.question_year_projection.v1',
    year,
    question_count: questions.length,
    questions
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate'
    }
  });
}
