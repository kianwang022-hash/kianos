import { HOME_SUBJECT_IDS } from './homeSubjectIdentity.mjs';
import { englishNavigation } from './sharedNavigation.mjs';
import { buildXizongHomeProjection } from './xizongHomeProjection.mjs';
import { buildPoliticsHomeProjection } from './politicsHomeProjection.mjs';

export { HOME_SUBJECT_IDS } from './homeSubjectIdentity.mjs';

function buildEnglishHomeProjection(base = '/') {
  const quickLinks = englishNavigation(base)
    .filter((item) => item.key !== 'overview')
    .map(({ key, label, href }) => ({ key, label, href }));
  return {
    id: 'english',
    label: 'English',
    href: `${base}english/`,
    resume: { adapter: 'english' },
    quickLinks
  };
}

export function buildHomeSubjectProjections(base = '/') {
  const definitions = {
    xizong: buildXizongHomeProjection(base),
    politics: buildPoliticsHomeProjection(base),
    english: buildEnglishHomeProjection(base)
  };

  return HOME_SUBJECT_IDS.map((id, index) => ({
    ...definitions[id],
    ordinal: String(index + 1).padStart(2, '0')
  }));
}
