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

  const owners = new Map();
  [...reading, ...external].forEach((entry) => {
    const id = String(entry.params.id);
    const owner = `${entry.props.kind}:${entry.props.objectId}`;
    const existing = owners.get(id);
    if (existing) throw new Error(`CURRENT_READING_ANSWER_ROUTE_COLLISION:${id}:${existing}:${owner}`);
    owners.set(id, owner);
  });

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
