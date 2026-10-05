import { loadHomeXizongProjectionTransport } from '../../lib/homeXizongProjection.mjs';

export const prerender = true;

export async function GET() {
  const { body } = await loadHomeXizongProjectionTransport();
  return new Response(body, {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}
