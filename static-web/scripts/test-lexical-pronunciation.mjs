import assert from 'node:assert/strict';
import { pronunciationFrontText, pronunciationRows, pronunciationScopeText } from '../src/lib/lexicalPronunciation.mjs';
const support = {
  readings: [
    { ipa: '/noun/', locales: ['en-US'], applicability: [{ sense_ids: ['noun'], pos: ['noun'] }] },
    { ipa: '/verb/', locales: ['en-GB'], applicability: [{ sense_ids: ['verb'], pos: ['verb'] }] },
    { ipa: '/weak/', locales: [], applicability: [{ conditions: { source_sound_qualifiers_raw: { note: 'weak form before consonants' } } }] },
  ],
  sense_readings: { noun: [0], verb: [1] },
};
assert.equal(pronunciationFrontText(support, 'en-US'), '/noun/');
assert.equal(pronunciationFrontText(support, 'en-GB'), '/verb/');
assert.equal(pronunciationFrontText(support, 'unknown'), '/weak/');
assert.equal(pronunciationFrontText(null, 'en-US'), '音标暂缺');
assert.equal(pronunciationFrontText({ readings: [support.readings[0]] }, 'en-GB'), '音标暂缺');
assert.deepEqual(pronunciationRows(support, 'adjective'), []);
assert.equal(pronunciationRows(support, 'noun')[0].ipa, '/noun/');
assert.match(pronunciationScopeText(support.readings[2]), /weak form before consonants/);
assert.match(pronunciationScopeText({ evidence_basis: 'derived_moby' }), /未确认标准或首选/);
assert.doesNotMatch(pronunciationFrontText(support, 'unknown'), /weak form before consonants/);
console.log('PASS pronunciation formatting: regions, exact placement, front scope isolation and unknown fallback');
