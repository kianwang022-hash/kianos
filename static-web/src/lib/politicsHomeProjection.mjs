import { politicsProductCatalog } from './productCatalog.mjs';

export function buildPoliticsHomeProjection(base = '/') {
  const catalog = politicsProductCatalog(base);
  return {
    id: 'politics',
    label: '政治',
    href: `${base}politics/`,
    resume: {
      adapter: 'politics',
      fallbackHref: `${base}politics/`,
      fallbackLabel: '打开政治工作台',
      payload: catalog
    },
    quickLinks: []
  };
}
