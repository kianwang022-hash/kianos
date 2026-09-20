import { listExecutableClozeSets, loadClozeAnswersById } from '../../lib/englishObjectiveSourceTruth.mjs';

export const prerender = true;

export function getStaticPaths() {
  return listExecutableClozeSets().map((item) => ({
    params: { id: item.id },
    props: { objectId: item.id }
  }));
}

export function GET({ props }) {
  const payload = loadClozeAnswersById(props.objectId);
  return new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300'
    }
  });
}
