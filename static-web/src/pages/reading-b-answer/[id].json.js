import { listReadingBSets, loadReadingBAnswersById } from '../../lib/englishObjective.mjs';

export const prerender = true;

export function getStaticPaths() {
  return listReadingBSets().map((item) => ({
    params: { id: item.id },
    props: { objectId: item.id }
  }));
}

export function GET({ props }) {
  const payload = loadReadingBAnswersById(props.objectId);
  return new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300'
    }
  });
}
