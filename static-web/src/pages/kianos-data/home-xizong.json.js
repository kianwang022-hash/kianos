import { buildHomeXizongProjection } from '../../lib/homeXizongProjection.mjs';

export const prerender = true;

export async function GET() {
  return new Response(JSON.stringify(buildHomeXizongProjection()), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}
