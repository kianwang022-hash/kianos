import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pronunciationHeaderRestriction as label,pronunciationFrontText as front,pronunciationLocaleLabel,pronunciationRows} from '../src/lib/lexicalPronunciation.mjs';
const senses=[{id:'n',pos:'noun'},{id:'n2',pos:'noun'},{id:'v',pos:'verb'}];
const reading=scope=>({ipa:'/test/',locales:[],applicability:scope});
for(const scopes of [[{pos:['noun']}],[{sense_ids:['n']}],[{}],[{scope_note:'INTERNAL'}],[{pos:['verb'],grammatical_forms:['unknown']}],[{pos:['verb'],grammatical_forms:['past'],case_sensitive:true}]])assert.equal(label(reading(scopes),senses,{},0),'');
const restricted=reading([{sense_ids:['n'],conditions:{owner_identity_condition:'明确名词限定'}}]);
assert.equal(label(restricted,senses,{},0),'明确名词限定');
assert.equal(label(restricted,senses,{sense_readings:{v:[0]}},0),'');
assert.equal(label(reading([{pos:['verb'],grammatical_forms:['past','past_participle']}]),senses,{},0),'过去式/过去分词');
assert.equal(front({readings:[restricted,reading([{}])]},'unknown',{senses,showRestriction:true}),'/test/');
assert.equal(front({readings:[restricted]},'en-US',{senses,showRestriction:true}),'该地区读音未确认；另有其他或未注明地区的读音');
console.log('PASS no inferred POS; explicit conditions/forms; generic/mixed/unknown conservative; truthful locale placeholder');

assert.equal(pronunciationLocaleLabel('en-US'),'美音');
assert.equal(pronunciationLocaleLabel('en-GB'),'英音');
assert.equal(pronunciationLocaleLabel('unknown'),'其他／未注明地区');
const australia={ipa:'/example/',locales:[],applicability:[{surface:'example',conditions:[{kind:'original_source_sound_qualifiers',raw:{tags:['Australia']}}]}]};
const original=JSON.stringify(australia);
assert.equal(pronunciationRows({readings:[australia]})[0].locale,'unknown');
assert.equal(front({readings:[australia]},'en-US'),'该地区读音未确认；另有其他或未注明地区的读音');
assert.equal(JSON.stringify(australia),original);

// The renderer's summary row must use the same locale label as detail rows.
const component=fs.readFileSync(new URL('../src/components/LexicalPronunciation.astro',import.meta.url),'utf8');
assert.ok(component.includes('`${pronunciationLocaleLabel(locale)} ${text}`'));
assert.ok(!component.includes('`地区未注明 ${text}`'));
