import { buildPoliticsPracticeCatalogCurrent } from '../../../lib/politicsPractice.mjs';
import { practiceFacePack } from '../../../lib/politicsPracticeView.mjs';

export function getStaticPaths() {
  const catalog = buildPoliticsPracticeCatalogCurrent(import.meta.env.BASE_URL);
  return catalog.subjects.map(({ id }) => ({
    params: { subject: id },
    props: { payload: practiceFacePack(catalog, id) }
  }));
}

export function GET({ props }) {
  return new Response(JSON.stringify(props.payload), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}
