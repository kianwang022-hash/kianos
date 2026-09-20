import {
  listExecutableTranslationSets,
  loadTranslationReferencesById
} from '../../lib/englishTranslationSourceTruth.mjs';

export const prerender = true;

export function getStaticPaths() {
  return listExecutableTranslationSets().map((item) => ({
    params: { id: item.id },
    props: { translationId: item.id }
  }));
}

export function GET({ props }) {
  const payload = loadTranslationReferencesById(props.translationId);
  return new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate'
    }
  });
}
