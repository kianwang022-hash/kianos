import { catalog } from '../../../../catalog.mjs';
import { practiceFacePack } from '@runtime/lib/politicsPracticeView.mjs';

export function getStaticPaths() {
  return catalog.subjects.map(({ id }) => ({
    params: { subject: id },
    props: { payload: practiceFacePack(catalog, id) }
  }));
}

export function GET({ props }) {
  return new Response(JSON.stringify(props.payload), {
    headers: { 'Content-Type': 'application/json' }
  });
}
