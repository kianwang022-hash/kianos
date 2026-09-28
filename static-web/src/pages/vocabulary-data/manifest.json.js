import { lexicalRuntimeManifest } from '../../lib/lexical.mjs';

export const prerender = true;

export function GET() {
  return new Response(JSON.stringify(lexicalRuntimeManifest()), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300'
    }
  });
}
