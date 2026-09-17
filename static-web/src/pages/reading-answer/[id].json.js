import { listReadingSets, loadReadingAnswersById } from '../../lib/englishReading.mjs';
import {
  listExternalReadingObjects,
  loadExternalReadingAnswersById
} from '../../lib/englishExternalReading.mjs';

export const prerender = true;

export function getStaticPaths() {
  const reading = listReadingSets().map((item) => ({
    params: { id: item.id },
    props: { kind: 'reading-a', objectId: item.id }
  }));
  const external = listExternalReadingObjects()
    .filter((item) => item.questionCount > 0)
    .map((item) => ({
      params: { id: item.runtimeId },
      props: { kind: 'external', objectId: item.id }
    }));
  return [...reading, ...external];
}

export function GET({ props }) {
  const payload = props.kind === 'external'
    ? loadExternalReadingAnswersById(props.objectId)
    : loadReadingAnswersById(props.objectId);
  return new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300'
    }
  });
}
