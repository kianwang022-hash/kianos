import { listProjectableXizongSystems } from './xizong.mjs';

export function buildXizongHomeProjection(base = '/') {
  const systems = listProjectableXizongSystems();
  const first = systems[0] || null;
  const fallbackHref = first ? `${base}xizong/${first.systemId}/` : `${base}xizong/`;
  const fallbackLabel = first
    ? [first.canonicalId, first.title].filter(Boolean).join(' · ')
    : '打开西综工作台';

  return {
    id: 'xizong',
    label: '西医综合',
    href: `${base}xizong/`,
    resume: {
      adapter: 'xizong',
      fallbackHref,
      fallbackLabel
    },
    quickLinks: []
  };
}
