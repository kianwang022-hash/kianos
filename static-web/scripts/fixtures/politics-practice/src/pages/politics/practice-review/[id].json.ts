import { catalog } from '../../../../catalog.mjs';
import { practiceReviewPayload } from '@runtime/lib/politicsPracticeView.mjs';
export function getStaticPaths() { return catalog.questions.map(({ id }) => ({ params: { id }, props: { payload: practiceReviewPayload(catalog, id) } })); }
export function GET({ props }) { return new Response(JSON.stringify(props.payload), { headers: { 'Content-Type': 'application/json' } }); }
