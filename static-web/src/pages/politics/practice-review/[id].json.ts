import { buildPoliticsPracticeCatalogCurrent } from '../../../lib/politicsPractice.mjs';
import { practiceReady, practiceReviewPayload } from '../../../lib/politicsPracticeView.mjs';

export function getStaticPaths() {
  // Uses the same strict Current loader as the workbench; no fixture/fallback.
  const catalog = buildPoliticsPracticeCatalogCurrent(import.meta.env.BASE_URL);
  return catalog.questions.filter(practiceReady).map(({ id }) => ({ params: { id }, props: { payload: practiceReviewPayload(catalog, id) } }));
}

export function GET({ props }) {
  return new Response(JSON.stringify(props.payload), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
