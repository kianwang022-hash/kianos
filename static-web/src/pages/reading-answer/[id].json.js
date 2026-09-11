import { listReadingSets, loadReadingAnswersById } from '../../lib/englishReading.mjs';

export const prerender = true;

export function getStaticPaths() {
  return listReadingSets().map((item) => ({
    params: { id: item.id },
    props: { readingId: item.id }
  }));
}

export function GET({ props }) {
  const payload = loadReadingAnswersById(props.readingId);
  return new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300'
    }
  });
}
