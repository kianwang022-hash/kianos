// Install in static-web/scripts/ with fixtures/a3-reviewed-memory-browser.json.
// This is an isolated GitHub CI test, not a local/Work/user-computer browser task.
// It neither starts a server nor uses a persistent profile. All private state
// and adversarial fixtures are synthetic; no real learner or Source proof.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { descriptorAtFrozenPackaging } from './xizong-calibration-test-support.mjs';

assert.equal(process.env.GITHUB_ACTIONS, 'true', 'A3 browser may execute only in existing GitHub CI');
assert.equal(process.env.CI, 'true', 'A3 browser requires existing isolated CI');
assert.match(process.env.GITHUB_RUN_ID || '', /^\d+$/, 'a real CI run is required');
const base = new URL(process.env.KIANOS_PREPARED_MEMORY_TEST_BASE || 'http://127.0.0.1:4338/');
assert.equal(base.origin, 'http://127.0.0.1:4338', 'reuse existing 4338 built-site CI preview, never Stable/Candidate');
const out = path.resolve(process.env.KIANOS_A3_PREPARED_MEMORY_TEST_OUTPUT
  || path.join(process.env.KIANOS_PREPARED_MEMORY_TEST_OUTPUT || '.qa/xizong-prepared-memory-browser', 'a3'));
fs.mkdirSync(out, { recursive: true });
const oracle = JSON.parse(fs.readFileSync(new URL('./fixtures/a3-reviewed-memory-browser.json', import.meta.url), 'utf8'));
const repoFile = relative => new URL(`../../${relative}`, import.meta.url);
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const stable = value => Array.isArray(value) ? value.map(stable) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])])) : value;
const normalized = value => String(value || '').replace(/\s+/g, ' ').trim();
const clone = value => JSON.parse(JSON.stringify(value));
const memoryKey = 'kianos-xizong-memory-v1';
const studyKeyFor = slug => `kianos-xizong-astro-v2:xizong:urinary-${slug}`;
const recallKeyFor = slug => `kianos-xizong-memory-review-v2:xizong:urinary-${slug}`;
const blockUrl = slug => new URL(`/xizong/urinary/${slug}/`, base).href;
const preparedUrl = slug => new URL(`/xizong/memory/?view=precision&block=urinary-${slug}`, base).href;
const read = (page, key) => page.evaluate(key => JSON.parse(localStorage.getItem(key) || 'null'), key);
const raw = (page, key) => page.evaluate(key => localStorage.getItem(key), key);
const flatten = object => [...object.kps, ...object.logicGroups].flatMap(owner => (owner.precision || []).map(cue => ({ owner, cue })));
const ids = cards => cards.map(card => card.id).sort();
const bySlug = new Map(Array.from({ length: 14 }, (_, index) => {
  const slug = `b${String(index + 1).padStart(2, '0')}`;
  return [slug, oracle.rows.filter(row => row.anchor.block_id === `urinary-${slug}`)];
}));
const claims = state => ({ sourceContactDone: state?.sourceContactDone === true,
  sourceContactEvidence: state?.sourceContactEvidence || [], learned: state?.learned || {},
  blockRecallDone: state?.blockRecallDone === true, completed: state?.completed === true,
  ttsxEvidence: state?.ttsxEvidence || {} });
const emptyClaims = claims(null);
const checks = [], errors = [];
const report = { status: 'RUNNING', started_at: new Date().toISOString(), base: base.href,
  ci_commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  ci_event_sha: process.env.GITHUB_SHA, ci_run_id: process.env.GITHUB_RUN_ID,
  independent_oracle_frozen_main: oracle.frozen_main, independent_oracle_sources: oracle.source_hashes,
  scope: 'Actual A3 prepared-Memory/post-Chat transport in existing isolated CI; declared synthetic state and one declared TTSX-response fixture. Not medical acceptance, Source pixels, Stable, release, or real learner U.',
  checks, errors };
let browser, lastPage;
try {
  const { marked } = await import('marked');
  const { loadXizongBlock, loadXizongSystem, resolveXizongKnowledgeView } = await import('../src/lib/xizong.mjs');
  const { resolveXizongLearnerProjection } = await import('../src/lib/xizongLearnerProjection.mjs');
  const { projectKpCore } = await import('../src/lib/xizongProjection.mjs');
  const { buildXizongProductionBlock } = await import('../src/lib/xizongProductionProjection.mjs');
  const { loadXizongLearningCues, learningCuesForBlock, preparedMemoryDigest } = await import('../src/lib/xizongLearningCues.mjs');
  const { buildXizongLearnerObject } = await import('../src/lib/xizongLearnerObject.mjs');
  const { buildXizongRevisionWitness } = await import('../src/lib/xizongRevisionWitness.mjs');
  const { buildXizongPreparedMemoryAvailability: describe,
    buildXizongMemoryReleaseDescriptorFromLearnerObject: describeFull,
    buildXizongBlockMemoryReleaseDescriptor: describeCompatibility, supportsXizongPreparedMemoryBlock } = await import('../src/lib/xizongMemoryRelease.mjs');
  const { createXizongMemoryState, makePreparedMemoryAvailable, releasedMemoryCards } = await import('../src/lib/xizongMemoryModel.mjs');
  const { revalidateXizongUnit, xizongSourceContactCovered, revisionRequiresAction } = await import('../src/lib/xizongContentRevision.mjs');
  const { inspectXizongBlockCompletion } = await import('../src/lib/xizongMemoryAutoRelease.mjs');
  const project = (system, slug) => resolveXizongLearnerProjection(loadXizongBlock(system, slug), {
    enrichBlock: block => ({ ...block, kpRecords: block.kpRecords.map(kp => ({
      ...kp, detailHtml: marked.parse(projectKpCore(kp.detailMarkdown))
    })) })
  });

  // The oracle was extracted only from reviewed answers/raw Current preentry.
  // No A3 answer text is ever obtained from the authored index as an expectation.
  assert.equal(oracle.rows.length, 28); assert.equal(oracle.rows.filter(row => row.owner_kind === 'KP').length, 20);
  assert.equal(oracle.rows.filter(row => row.owner_kind === 'LG').length, 8);
  assert.equal(new Set(oracle.rows.map(row => row.id)).size, 28);
  assert.equal(oracle.held.id, null); assert.equal(oracle.held.native_owner, 'urinary-b03-kp03');
  for (const row of oracle.rows) {
    assert.equal(sha(row.answer), row.answer_sha256, `${row.id}: independent answer seal`);
    assert.equal(sha(row.mnemonic), row.mnemonic_sha256, `${row.id}: independent aid seal`);
  }
  const shared = JSON.parse(fs.readFileSync(repoFile('content/xizong/knowledge/learner/shared-fields.json'), 'utf8'));
  // Compare the original frozen values after inverting only B1's explicit
  // archival field renames. Current canonical answer equality is sealed below.
  const historicalShared = clone(shared);
  const orientation = historicalShared.block_fields['circulation-b01'];
  assert.ok(!Object.hasOwn(orientation, 'initial_orientation'));
  orientation.initial_orientation = orientation.historical_initial_orientation;
  delete orientation.historical_initial_orientation;
  for (let n = 1; n <= 32; n++) {
    const fields = historicalShared.kp_fields[`circulation-b01-kp${String(n).padStart(3, '0')}`]?.retention_metadata;
    if (!fields) continue;
    for (const key of ['memory_items', 'gate_knowledge']) if (Object.hasOwn(fields, `historical_${key}`)) {
      assert.ok(!Object.hasOwn(fields, key));
      fields[key] = fields[`historical_${key}`]; delete fields[`historical_${key}`];
    }
  }
  for (const [collection, entries] of Object.entries(oracle.protected_shared_entries)) {
    for (const [key, hash] of Object.entries(entries)) {
      assert.equal(sha(JSON.stringify(stable(historicalShared[collection]?.[key]))), hash, `${collection}/${key}: frozen pre-A3 owner changed`);
    }
  }
  for (const [canonical, baseline] of Object.entries(oracle.regression)) {
    let indexBytes = fs.readFileSync(repoFile(baseline.cue_index_path));
    if (canonical === 'A1') {
      const index = JSON.parse(indexBytes), b1 = loadXizongBlock('circulation', 'circulation-b01');
      const relocated = index.precision_index.filter(row => row.prepared_memory_ref?.collection === 'canonical_exact_items');
      assert.equal(relocated.length, 13);
      for (const row of relocated) {
        assert.equal(row.anchor.block_id, b1.blockId);
        assert.equal(row.prepared_memory_ref.source_path, b1.sourcePath);
        assert.ok(!Object.hasOwn(row, 'cue'));
        const fieldKey = `circulation-b01-kp${row.anchor.kp_id.slice(-2).padStart(3, '0')}`;
        const item = historicalShared.kp_fields[fieldKey].retention_metadata.memory_items.find(item => item.memory_id === row.prepared_memory_ref.memory_id);
        const exact = b1.knowledge.exact_items.find(value => value.item.memory_id === item.memory_id);
        const resolved = { ...exact.item, answer: resolveXizongKnowledgeView(b1, exact.answer_view) };
        if (exact.anchor_field === 'anchor') resolved.anchor = resolveXizongKnowledgeView(b1, exact.anchor_views[0]);
        else if (exact.anchor_field === 'anchors') resolved.anchors = exact.anchor_views.map(view => resolveXizongKnowledgeView(b1, view));
        assert.deepEqual(resolved, item);
        assert.equal(exact.kp_ordinal, Number(row.anchor.kp_id.slice(-2)));
        // Restore the original insertion order as well as its frozen values.
        const restored = { id: row.id, anchor: row.anchor, cue: item.cue,
          ...Object.fromEntries(Object.entries(row).filter(([key]) => !['id', 'anchor', 'cue', 'prepared_memory_ref'].includes(key))),
          prepared_memory_ref: { kp_field_key: fieldKey, collection: 'memory_items', memory_id: item.memory_id,
            kp_core_sha256: preparedMemoryDigest(b1.kpRecords.find(kp => kp.kpId === row.anchor.kp_id).detailMarkdown),
            item_sha256: preparedMemoryDigest(item) } };
        index.precision_index[index.precision_index.indexOf(row)] = restored;
      }
      indexBytes = JSON.stringify(index, null, 2) + '\n';
    }
    assert.equal(sha(indexBytes), baseline.cue_index_sha256, `${canonical}: prior complete cue owner unchanged after exact B1 relocation inverse`);
    const actual = [];
    const system = loadXizongSystem(baseline.system_id), learningCues = loadXizongLearningCues(system);
    for (let n = 1; n <= 12; n++) {
      const slug = `${canonical === 'A1' ? 'b' : 'r'}${String(n).padStart(2, '0')}`;
      // Recompute through the same un-enriched native construction used by
      // the independent pre-edit baseline; enriched HTML is tested separately
      // by the preserved A1/A2 actual browser journeys.
      const block = buildXizongProductionBlock(loadXizongBlock(baseline.system_id, slug));
      const migratedB1 = block.blockId === 'circulation-b01';
      const object = migratedB1 ? resolveXizongLearnerProjection({ systemId: baseline.system_id, blockId: block.blockId }).learnerObject
        : buildXizongLearnerObject({ block, learningCues: learningCuesForBlock(learningCues, block) });
      object.revisionWitness = buildXizongRevisionWitness(object);
      const descriptor = supportsXizongPreparedMemoryBlock(block.blockId) ? describe(object) : null;
      if (migratedB1) {
        assert.equal(descriptor.precisionCards.length, 13);
        assert.equal(sha(JSON.stringify(descriptor.precisionCards.map(card => Object.fromEntries(
          ['id', 'precisionCueId', 'kpId', 'answerHtml', 'semanticRevision'].map(key => [key, card[key]]))))),
        '0af414c1310ec3e53c91d2eb3dce3804d76a4d02dc2d3b2cd107413e598f9144', 'B1: independent frozen card semantics after canonical relocation');
      } else assert.equal(sha(JSON.stringify(stable(descriptor ? descriptorAtFrozenPackaging(descriptor,
        fs.readFileSync(repoFile(block.sourcePath), 'utf8')) : null))), baseline.descriptor_sha256_by_block[block.blockId],
      `${canonical}/${slug}: full frozen native descriptor after additive Prompt packaging normalization`);
      if (descriptor) actual.push(...descriptor.precisionCards.map(card => card.precisionCueId));
    }
    assert.deepEqual(actual.sort(), [...baseline.admitted_ids].sort(), `${canonical}: exact previous descriptor identities`);
    assert.equal(actual.length, canonical === 'A1' ? 176 : 26);
  }
  checks.push('independent 28-answer/aid seals; previous shared entries and complete A1/A2 cue-index bytes preserved after exact B1 archive/relocation inverse; 23 full native descriptor values plus frozen B1 card semantics and exact 176 A1 + 26 A2 identities');

  const projections = new Map(), cardsBySlug = new Map();
  const assertPreentry = (object, slug) => {
    const expected = oracle.preentry.find(row => row.block_id === `urinary-${slug}`);
    const actual = object.blockPreentry;
    assert.ok(actual?.memoryRouting?.present, `${slug}: top-level Memory Routing present`);
    for (const key of ['ownerPath', 'anchor', 'miGAnchor', 'miDAnchor', 'miG', 'miD']) assert.deepEqual(actual.memoryRouting[key], expected[key], `${slug}: exact preentry ${key}`);
    assert.equal(actual.framework.present, expected.framework_present, `${slug}: literal existing Framework restoration only`);
    for (const [key, source, role] of [['miG', 'BLOCK_PREENTRY_MI_G', 'CURRENT_TAKEAWAY'], ['miD', 'BLOCK_PREENTRY_MI_D', 'DEFERRED_MEMORY']]) {
      const attention = object.slots.blockAttention.filter(row => row.raw?.source === source);
      assert.deepEqual(attention.map(row => row.cue), [...new Set(expected[key])], `${slug}: all ${key} delivered as attention in owner order`);
      assert.ok(attention.every(row => row.kind === 'ATTENTION' && row.attentionRole === role));
    }
  };
  const assertOwners = (object, reviewed) => {
    assert.equal(object.identity.systemId, 'urinary'); assert.equal(object.identity.canonicalId, 'A3');
    assert.deepEqual(flatten(object).filter(row => row.cue.raw?.prepared_memory_ref).map(row => row.cue.id).sort(), reviewed.map(row => row.id).sort());
    for (const row of reviewed) {
      const matches = flatten(object).filter(candidate => candidate.cue.id === row.id);
      assert.equal(matches.length, 1, `${row.id}: exactly one native owner`);
      const { owner, cue } = matches[0];
      assert.equal(cue.cue, row.cue); assert.deepEqual(cue.anchor, row.anchor);
      assert.equal(cue.answerBearing, true); assert.equal(cue.displayPolicy.timing, 'POST_REVEAL');
      if (row.owner_kind === 'LG') {
        assert.equal(owner.identity.logicGroupId, row.anchor.logic_group_id); assert.deepEqual(owner.kpIds, row.owner_kp_ids);
      } else assert.equal(owner.identity.kpId, row.anchor.kp_id);
      assert.deepEqual(cue.raw.prepared_memory_ref.owner_kp_ids, row.owner_kp_ids);
      assert.deepEqual(cue.raw.prepared_memory_ref.core_refs.map(({ kp_core_sha256, ...ref }) => ref), row.required_core_refs);
    }
  };
  for (const [slug, reviewed] of bySlug) {
    const projection = project('urinary', slug), object = projection.learnerObject;
    projections.set(slug, projection); assertOwners(object, reviewed); assertPreentry(object, slug);
    const counts = oracle.reader_counts.find(row => row.block_id === object.identity.blockId);
    assert.equal(object.kps.length, counts.kp_count); assert.equal(object.logicGroups.length, counts.lg_count);
    for (const descriptor of [describeFull(object), describeCompatibility(projection.block, projection.learningCues)]) {
      assert.deepEqual(ids(descriptor.precisionCards), reviewed.map(row => `precision:${row.id}`).sort());
      assert.equal(descriptor.coreCards.length, object.kps.length);
      assert.ok(!descriptor.precisionCards.some(card => card.kpId === 'urinary-b03-kp03'));
    }
    const descriptor = describe(object);
    assert.deepEqual(ids(descriptor.precisionCards), reviewed.map(row => `precision:${row.id}`).sort());
    assert.deepEqual(descriptor.coreCards, []); assert.deepEqual(descriptor.attentionSignals, []);
    assert.deepEqual(descriptor.promptOverrides, {}); assert.deepEqual(descriptor.markedFragments, []);
    const state = makePreparedMemoryAvailable(createXizongMemoryState(), descriptor, '2026-10-01T00:00:00Z');
    const cards = releasedMemoryCards(state, 'PRECISION');
    for (const card of cards) {
      const row = reviewed.find(row => row.id === card.precisionCueId);
      assert.equal(card.answerResolution, 'EXACT_CURRENT_OWNER'); assert.equal(card.kpId, row.anchor.kp_id || '');
      if (row.owner_kind === 'LG') assert.equal(card.logicGroupId, row.anchor.logic_group_id);
    }
    cardsBySlug.set(slug, cards);
  }
  assert.equal([...cardsBySlug.values()].flat().length, 28);
  assert.equal(oracle.preentry.reduce((n, row) => n + row.miG.length, 0), 199);
  assert.equal(oracle.preentry.reduce((n, row) => n + row.miD.length, 0), 141);
  checks.push('all 14 native A3 owners: 28 exact cards (20 KP/8 LG), ordered LG/Core refs, both full-release selectors, held B3 KP03 excluded, repaired 199 MI-G/141 MI-D and 11 literal Frameworks');

  const { chromium } = await import('playwright');
  browser = await chromium.launch({ headless: true });
  const newContext = async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
    await context.route('**/*', route => new URL(route.request().url()).origin === base.origin ? route.continue() : route.abort());
    context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
    return context;
  };
  const newPage = async context => { lastPage = await context.newPage(); return lastPage; };
  const ready = async page => {
    await page.bringToFront();
    await page.waitForFunction(() => document.documentElement.dataset.learnerWriter === 'active', {}, { timeout: 30000 });
  };
  const blockReady = async (page, slug) => {
    await ready(page);
    await page.waitForFunction(key => Boolean(JSON.parse(localStorage.getItem(key) || 'null')?.contentRevision?.witness?.block), studyKeyFor(slug));
  };
  const openPrepared = async (page, slug) => {
    await page.locator('[data-open-prepared-memory]').click();
    await page.waitForURL(url => url.pathname.endsWith('/xizong/memory/') && url.searchParams.get('block') === `urinary-${slug}` && url.searchParams.get('view') === 'precision');
    await ready(page);
    await page.waitForFunction(count => document.querySelector('[data-memory-queue]')?.querySelectorAll('button').length === count, bySlug.get(slug).length);
  };
  const choose = async (page, slug, id) => {
    const cards = cardsBySlug.get(slug), index = cards.findIndex(card => card.precisionCueId === id);
    assert.ok(index >= 0, id); await page.locator('[data-memory-queue] button').nth(index).click(); return cards[index];
  };
  const noDependencyState = async (page, slug) => {
    const keys = await page.evaluate(() => Object.keys(localStorage).filter(key => /^kianos-xizong-(?:astro-v2|memory-review-v2):xizong:/.test(key)));
    assert.ok(keys.every(key => [studyKeyFor(slug), recallKeyFor(slug)].includes(key)), `no phantom prerequisite/dependency learner state: ${keys}`);
  };
  const assertAnswer = async (page, row) => {
    const answer = page.locator(`[data-memory-answer] [data-prepared-memory="${row.id}"]`);
    assert.equal(await answer.count(), 1); assert.equal(await answer.isVisible(), true);
    // The view groups only authored boundaries; the independent reviewed raw
    // answer remains byte-for-byte text, never a new stored answer or oracle.
    const body = answer.locator(':scope > [data-memory-prepared-answer]');
    assert.equal(await body.count(), 1); assert.equal(await body.isVisible(), true);
    assert.equal(await body.textContent(), row.answer, `${row.id}: exact raw answer, every operator/unit/condition and authored newline preserved`);
    assert.equal(await body.locator('details').count(), 0, `${row.id}: no answer/condition hidden after Reveal`);
    const visibility = await answer.evaluate(root => ({
      hiddenQualifications: [...root.querySelectorAll('p')].filter(p => /^(?:适用范围：|来源差异：|处理边界：|助记（不能代替答案）：)/u.test(p.textContent || ''))
        .filter(p => !p.getClientRects().length).map(p => p.textContent),
      openProvenance: root.querySelectorAll('[data-memory-provenance][open]').length,
      visible: root.innerText
    }));
    assert.deepEqual(visibility.hiddenQualifications, [], `${row.id}: all qualifications and aids visible`);
    assert.equal(visibility.openProvenance, 0, `${row.id}: audit detail starts closed`);
    assert.ok(normalized(visibility.visible).includes(normalized(row.mnemonic)), `${row.id}: aid stays next to answer`);
    for (const ref of row.source_refs) assert.ok(!visibility.visible.includes(ref), `${row.id}: long audit URL deferred`);
    if (row.id === 'a3-b03-lg05-precision') {
      const groups = body.locator(':scope > [data-memory-answer-group]');
      assert.deepEqual(await groups.locator(':scope > p > strong').allTextContents(), ['PCT：', 'TAL：', 'DCT：', '集合管主细胞：']);
      assert.deepEqual(await groups.evaluateAll(nodes => nodes.map(node => node.querySelectorAll('li').length)), [2, 1, 1, 3]);
      assert.equal(await body.locator('li').count(), 7);
    }
    if (row.id === 'a3-b05-lg06-precision') {
      assert.deepEqual(await body.locator(':scope > p').allTextContents(), row.answer.split('\n'), 'six authored diagnostic steps preserve their entire conditions');
    }
    const text = normalized(await answer.textContent());
    assert.ok(text.includes(normalized(row.mnemonic)), `${row.id}: complete reviewed aid`);
    for (const ref of row.source_refs) assert.ok(text.includes(normalized(ref)), `${row.id}: provenance retained after Reveal`);
    assert.ok(text.includes('来源（保留记录，非本次原文核验）'), `${row.id}: no fresh Source-contact claim`);
    assert.match(await page.locator('[data-memory-precision-resolution]').textContent(), /已绑定精确答案/);
    if (['a3-b03-lg05-precision', 'a3-b05-lg06-precision'].includes(row.id)) {
      const before = await raw(page, memoryKey);
      const details = answer.locator('[data-memory-provenance]');
      for (let n = 0; n < await details.count(); n++) await details.nth(n).locator(':scope > summary').click();
      for (const ref of row.source_refs) assert.ok((await answer.innerText()).includes(ref), `${row.id}: original provenance reachable on demand`);
      for (let n = 0; n < await details.count(); n++) await details.nth(n).locator(':scope > summary').click();
      assert.equal(await raw(page, memoryKey), before, `${row.id}: disclosure never changes raw card, identity, refs, ratings or history`);
      assert.equal(await body.textContent(), row.answer);
    }
  };
  const assertCleanFront = async (page, slug, selected) => {
    const reviewed = bySlug.get(slug), cards = cardsBySlug.get(slug);
    const workspace = page.locator('[data-xizong-memory-workspace]');
    assert.equal(await page.locator('[data-memory-answer]').isVisible(), false);
    assert.equal(await page.locator('[data-memory-ratings]').isVisible(), false);
    assert.equal(normalized(await page.locator('[data-memory-card-title]').textContent()), selected.cue);
    assert.equal(normalized(await page.locator('[data-memory-precision-text]').textContent()), selected.cue);
    assert.deepEqual(await page.locator('[data-memory-queue] button > span').allTextContents(), cards.map(card => card.cue));
    // Real accessibility snapshot plus tooltip/ARIA references: hidden answer
    // DOM is permissible, exposure via a visible title or labelledby is not.
    const a11y = await workspace.ariaSnapshot();
    const attributes = await workspace.evaluate(root => [...root.querySelectorAll('*')].filter(node => {
      const style = getComputedStyle(node); return node.getClientRects().length && style.visibility !== 'hidden' && style.display !== 'none';
    }).flatMap(node => [node.getAttribute('title'), node.getAttribute('aria-label'), node.getAttribute('alt'),
      ...['aria-labelledby', 'aria-describedby'].flatMap(attr => (node.getAttribute(attr) || '').split(/\s+/).filter(Boolean).map(id => document.getElementById(id)?.textContent || ''))]).filter(Boolean).join('\n'));
    let exposed = normalized(`${await workspace.innerText()}\n${a11y}\n${attributes}`);
    for (const row of reviewed) exposed = exposed.split(normalized(row.cue)).join('');
    const forbidden = reviewed.flatMap(row => [row.answer, row.mnemonic, ...row.source_refs,
      ...row.answer.split(/[。；\n]/).filter(fragment => fragment.length >= 12)])
      .concat(cards.flatMap(card => [card.title, card.groupLabel]));
    for (const value of forbidden.map(normalized).filter(value => value.length >= 6)) {
      if (reviewed.some(row => normalized(row.cue).includes(value))) continue;
      assert.ok(!exposed.includes(value), `${selected.id}: visible/front/rail/tooltip/accessibility answer leakage: ${value}`);
    }
  };

  // Real journeys for all fourteen Blocks; this transports every reviewed
  // answer through Browse, clean Recall, and explicit Reveal at least once.
  for (const [slug, reviewed] of bySlug) {
    const context = await newContext(), page = await newPage(context);
    await page.goto(blockUrl(slug), { waitUntil: 'domcontentloaded' }); await blockReady(page, slug);
    const host = page.locator('[data-xizong-v6-block]');
    const object = JSON.parse(await page.locator('[data-xizong-learner-object-payload]').textContent());
    assertOwners(object, reviewed); assertPreentry(object, slug);
    assert.deepEqual(ids(describe(object).precisionCards), reviewed.map(row => `precision:${row.id}`).sort());
    assert.deepEqual(object.sourceContact.hardReadinessBlockIds, []); assert.deepEqual(object.sourceContact.requiredPriorBlockIds, []);
    assert.equal(await host.getAttribute('data-post-chat-recall-available'), 'true');
    assert.equal(await host.getAttribute('data-kp-title-only'), 'true');
    const initial = await read(page, studyKeyFor(slug));
    assert.deepEqual(claims(initial), emptyClaims); assert.equal(await read(page, memoryKey), null);
    if (slug === 'b03') {
      // Capture the real, still-deferred MI-D destination before entering
      // Recall. Never synthesize a prepared card or a new ID for this hold.
      const deferred = host.locator('[data-learner-object-slot="block_orientation"] [data-attention-section="DEFERRED_MEMORY"]');
      await deferred.waitFor({ state: 'visible' });
      const heldTopic = oracle.preentry.find(row => row.block_id === 'urinary-b03').miD.find(text => text.startsWith('尿素40%'));
      assert.ok(heldTopic, 'independent held-ratio MI-D topic');
      const support = deferred.locator('[data-learner-asset="attention"]').filter({ hasText: heldTopic });
      assert.equal(await support.count(), 1); await support.scrollIntoViewIfNeeded();
      assert.equal(await support.isVisible(), true);
      await page.screenshot({ path: path.join(out, 'b03-held-mi-d-preentry.png'), fullPage: true });
      await deferred.screenshot({ path: path.join(out, 'b03-held-ratio-support.png') });
      assert.deepEqual(claims(await read(page, studyKeyFor(slug))), emptyClaims); assert.equal(await read(page, memoryKey), null);
      checks.push('B3 CI screenshots show the real deferred MI-D ratio support destination before post-Chat, with no held-card admission or learner evidence');
    }
    if (slug === 'b10') {
      // The accepted reader owns this visible hold. Read/screenshot it in
      // place; never follow a task, Source, bundle or image link.
      const mismatch = host.locator('[data-study-stage="block_learn"] .source-visual.hold[data-cue-id="a3-b10-lg01-visual"]').first();
      if (await mismatch.count() && await mismatch.isVisible()) {
        const text = await mismatch.innerText(); assert.match(text, /P195/); assert.match(text, /P197/); assert.match(text, /HOLD/);
        await mismatch.scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(out, 'b10-source-mismatch-context.png'), fullPage: true });
        await mismatch.screenshot({ path: path.join(out, 'b10-source-mismatch-hold.png') });
        assert.deepEqual(claims(await read(page, studyKeyFor(slug))), emptyClaims); assert.equal(await read(page, memoryKey), null);
        checks.push('B10 CI screenshots preserve visible P195-task/P197-bundle HOLD text in the reader; no Source link/contact or gate closure');
      } else checks.push('B10 initial reader has no visible mismatch context to screenshot without extra navigation; native task/bundle metadata assertions remain required');
    }
    await page.evaluate(() => { window.__a3CompletionEvents = []; window.addEventListener('kianos:xizong-block-complete', event => window.__a3CompletionEvents.push(event.detail)); });
    await host.locator('[data-study-stage="block_learn"] [data-post-chat-recall]').click();
    await host.locator('[data-study-stage="kp_recall"]').waitFor({ state: 'visible' });
    const entered = await read(page, studyKeyFor(slug));
    assert.equal(entered.recallEntryMode, 'POST_CHAT_RECALL'); assert.deepEqual(claims(entered), emptyClaims);
    const front = host.locator('[data-kp-recall-card]:visible').first(), firstId = await front.getAttribute('data-kp-id');
    const first = object.kps.find(kp => kp.identity.kpId === firstId); assert.ok(first);
    assert.equal(normalized(await front.locator(':scope > header > h3').textContent()), normalized(first.identity.title));
    assert.equal(normalized(await front.locator(':scope > header > p').textContent()), normalized(first.prompt.canonical));
    assert.equal(await front.locator('[data-kp-answer]').isVisible(), false);
    assert.equal(await host.locator('[data-prepared-memory]:visible').count(), 0);
    await page.keyboard.press('3'); assert.deepEqual((await read(page, studyKeyFor(slug))).ratings, {});
    assert.equal((await read(page, recallKeyFor(slug))).evidenceHistory.length, 0);
    await front.locator('[data-kp-reveal]').click();
    await front.locator('[data-rating="known"]').click();
    await page.waitForFunction(({ key, kpId, index }) => { const state = JSON.parse(localStorage.getItem(key) || 'null'); return state?.ratings?.[kpId] === 'known' && state.kpIndex !== index; }, { key: studyKeyFor(slug), kpId: firstId, index: entered.kpIndex });
    const kpState = await read(page, studyKeyFor(slug)), kpHistory = await read(page, recallKeyFor(slug));
    assert.equal(kpHistory.evidenceHistory.length, 1); assert.equal(kpHistory.evidenceHistory[0].kp_id, firstId);
    assert.equal(kpHistory.evidenceHistory[0].evidence_origin, 'USER_RECALL_ATTEMPT'); assert.deepEqual(claims(kpState), emptyClaims);
    // Forced lower-level completion events still cannot convert retrieval to learning.
    for (const selector of ['[data-block-recall-reveal]', '[data-block-recall-complete]', '[data-block-complete]']) await host.locator(selector).dispatchEvent('click');
    assert.equal(await host.locator('[data-block-complete]').isDisabled(), true);
    assert.deepEqual(await page.evaluate(() => window.__a3CompletionEvents), []); assert.equal(await read(page, memoryKey), null);
    await page.reload({ waitUntil: 'domcontentloaded' }); await blockReady(page, slug);
    assert.equal((await read(page, studyKeyFor(slug))).resumeKpId, kpState.resumeKpId);
    assert.deepEqual((await read(page, recallKeyFor(slug))).evidenceHistory, kpHistory.evidenceHistory);
    assert.equal(await host.locator('[data-kp-recall-card]:visible [data-kp-answer]').isVisible(), false);
    if (['b01', 'b05', 'b10'].includes(slug)) {
      await host.locator('[data-study-stage="kp_recall"] [data-stage-target="source_contact"]').click();
      await host.locator('[data-study-stage="source_contact"]').waitFor({ state: 'visible' });
      await page.reload({ waitUntil: 'domcontentloaded' }); await blockReady(page, slug);
      await host.locator('[data-study-stage="source_contact"] [data-post-chat-recall]').click();
      await host.locator('[data-study-stage="kp_recall"]').waitFor({ state: 'visible' });
      assert.equal((await read(page, studyKeyFor(slug))).resumeKpId, kpState.resumeKpId);
      assert.deepEqual(claims(await read(page, studyKeyFor(slug))), emptyClaims);
    }
    if (slug === 'b03') {
      const held = object.kps.find(kp => kp.identity.kpId === oracle.held.native_owner);
      assert.ok(held.core.markdown); assert.equal(held.precision.length, 0, 'held proposal has no invented awareness/Memory ID');
      assert.ok(object.blockPreentry.memoryRouting.miD.some(text => /尿素|比例/.test(text)), 'held ratio scope retains its preentry destination');
    }
    if (slug === 'b10') {
      // Transport existing task/asset metadata; do not contact the Source URLs,
      // reinterpret original pixels, or claim this mismatch has been closed.
      const visuals = [...object.kps, ...object.logicGroups].flatMap(owner => owner.visual || []);
      const scoped = visuals.filter(cue => cue.anchor.logic_group_id === 'urinary-b10-lg01');
      assert.ok(scoped.length, 'B10 LG01 existing visual task retained');
      assert.match(JSON.stringify(scoped), /195/); assert.match(JSON.stringify(scoped), /197/);
    }
    await openPrepared(page, slug);
    const available = await read(page, memoryKey), cards = cardsBySlug.get(slug);
    assert.deepEqual(Object.keys(available.cards).sort(), reviewed.map(row => `precision:${row.id}`).sort());
    for (const key of ['releasedBlocks', 'attention', 'marks', 'promptOverrides']) assert.deepEqual(available[key], {});
    assert.deepEqual(available.evidence, []); assert.deepEqual(available.repairTasks, []);
    assert.equal(normalized(await page.locator('[data-memory-summary-core]').textContent()), '0');
    assert.equal(normalized(await page.locator('[data-memory-summary-today]').textContent()), '0');
    for (const row of reviewed) {
      await choose(page, slug, row.id); await assertAnswer(page, row);
      assert.equal(normalized(await page.locator('[data-memory-card-title]').textContent()), normalized(cards.find(card => card.precisionCueId === row.id).title), 'Browse retains original native title');
    }
    await page.locator('[data-memory-rating="known"]').dispatchEvent('click');
    assert.deepEqual((await read(page, memoryKey)).evidence, [], 'Browse cannot rate');
    await page.locator('[data-precision-mode="RECALL"]').click();
    for (const row of reviewed) {
      await choose(page, slug, row.id); await assertCleanFront(page, slug, row);
      await page.locator('[data-memory-rating="known"]').dispatchEvent('click');
      assert.deepEqual((await read(page, memoryKey)).evidence, [], 'unrevealed Recall cannot rate');
      if (['a3-b01-kp14-precision', 'a3-b03-lg05-precision', 'a3-b05-lg06-precision', 'a3-b05-kp13-precision', 'a3-b12-kp16-precision'].includes(row.id)) await page.screenshot({ path: path.join(out, `${row.id}-front.png`), fullPage: true });
      await page.locator('[data-memory-reveal]').click(); await assertAnswer(page, row);
      if (['a3-b01-kp14-precision', 'a3-b03-lg05-precision', 'a3-b05-lg06-precision', 'a3-b05-kp13-precision', 'a3-b12-kp16-precision'].includes(row.id)) await page.screenshot({ path: path.join(out, `${row.id}-reveal.png`), fullPage: true });
    }
    const selected = reviewed.find(row => row.external_contract_required) || reviewed[0];
    await choose(page, slug, selected.id); await assertCleanFront(page, slug, selected);
    await page.locator('[data-memory-reveal]').click(); await page.locator('[data-memory-rating="known"]').click();
    const rated = await read(page, memoryKey);
    assert.equal(rated.evidence.length, 1); assert.equal(rated.evidence[0].cardId, `precision:${selected.id}`);
    assert.deepEqual(rated.releasedBlocks, {});
    await page.reload({ waitUntil: 'domcontentloaded' }); await ready(page); assert.deepEqual(await read(page, memoryKey), rated);
    await page.goBack({ waitUntil: 'domcontentloaded' }); await blockReady(page, slug);
    assert.equal(page.url(), blockUrl(slug)); assert.deepEqual(claims(await read(page, studyKeyFor(slug))), emptyClaims);
    await page.goForward({ waitUntil: 'domcontentloaded' }); await ready(page); assert.deepEqual(await read(page, memoryKey), rated);
    await page.goto(blockUrl(slug), { waitUntil: 'domcontentloaded' }); await blockReady(page, slug);
    await openPrepared(page, slug); assert.deepEqual(await read(page, memoryKey), rated, 'reopen is idempotent');
    assert.deepEqual((await read(page, recallKeyFor(slug))).evidenceHistory, kpHistory.evidenceHistory);
    await noDependencyState(page, slug);
    checks.push(`${slug}: actual served preentry/native ownership; full reviewed Browse + answer-free Recall/rail/ARIA + full Reveal; explicit KP/Memory rating once, reload/Back/Forward/reopen; no Source/learning/completion/Core/Today/dependency debt`);
    await context.close();
  }

  // Historical same-ID content is synthetic and intentionally differs. The
  // real open-prepared action must append old content and preserve prior evidence.
  {
    const slug = 'b05', context = await newContext(), page = await newPage(context);
    await page.goto(blockUrl(slug), { waitUntil: 'domcontentloaded' }); await blockReady(page, slug);
    const descriptor = describe(projections.get(slug).learnerObject);
    const prior = makePreparedMemoryAvailable(createXizongMemoryState(), descriptor, '2026-09-01T00:00:00Z');
    const id = 'precision:a3-b05-lg06-precision', old = prior.cards[id];
    Object.assign(old, { answerHtml: '<p>Declared historical answer fixture; no clinical authority.</p>',
      ownerContextHtml: '<p>Declared previous owner context.</p>', answerResolution: 'OWNER_CONTEXT_ONLY',
      semanticRevision: 'declared-old-semantic-revision', sourceHash: 'declared-old-source',
      contentHistory: [{ answerHtml: '<p>Declared even earlier answer.</p>', at: '2026-08-01T00:00:00Z' }] });
    prior.evidence = [{ id: 'declared-old-lg-rating', cardId: id, family: 'PRECISION', rating: 'fuzzy', origin: 'DECLARED_BROWSER_FIXTURE', at: '2026-09-01T01:00:00Z' }];
    prior.attention[id] = { reviewRequested: true, reason: 'DECLARED_BROWSER_FIXTURE', updatedAt: '2026-09-01T01:00:00Z' };
    prior.marks = { declared: { id: 'declared', text: 'Preserve synthetic private history.' } };
    await page.evaluate(({ key, state }) => localStorage.setItem(key, JSON.stringify(state)), { key: memoryKey, state: prior });
    const beforeStudy = await raw(page, studyKeyFor(slug));
    await openPrepared(page, slug); const refreshed = await read(page, memoryKey), current = refreshed.cards[id];
    assert.equal(current.contentHistory.length, 2); assert.equal(current.revisionReview, 'LOCAL_SEMANTIC_CHANGE');
    for (const key of ['answerHtml', 'ownerContextHtml', 'answerResolution', 'systemId', 'canonicalId', 'blockId', 'kpId', 'logicGroupId', 'cue']) assert.equal(current.contentHistory.at(-1)[key], old[key], `native prior ${key} history retained`);
    assert.deepEqual(refreshed.evidence, prior.evidence); assert.deepEqual(refreshed.attention, prior.attention); assert.deepEqual(refreshed.marks, prior.marks);
    assert.equal(current.releasedAt, old.releasedAt); assert.equal(await raw(page, studyKeyFor(slug)), beforeStudy);
    await choose(page, slug, 'a3-b05-lg06-precision'); await assertAnswer(page, bySlug.get(slug).find(row => row.external_contract_required));
    await page.locator('[data-memory-answer]').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(out, 'b05-history-refresh-current-qualified.png'), fullPage: true });
    await page.reload({ waitUntil: 'domcontentloaded' }); await ready(page);
    await page.goto(blockUrl(slug), { waitUntil: 'domcontentloaded' }); await blockReady(page, slug);
    await openPrepared(page, slug); assert.deepEqual(await read(page, memoryKey), refreshed, 'identical refresh appends no second revision');
    checks.push('B5 same-ID historical answer/context/resolution/owner preserved in contentHistory; old ratings/attention/marks/releasedAt retained; current reviewed answer installed once, reload/reopen idempotent');
    await context.close();
  }
  {
    const slug = 'b03', context = await newContext(), page = await newPage(context);
    await page.goto(blockUrl(slug), { waitUntil: 'domcontentloaded' }); await blockReady(page, slug);
    const prior = createXizongMemoryState(), kp = projections.get(slug).learnerObject.kps.find(kp => kp.identity.kpId === oracle.held.native_owner);
    // This name is explicitly synthetic historical storage, never a cue-owner
    // ID for the held B3 proposal (which remains null in the acceptance oracle).
    const id = 'precision:declared-unadmitted-historical-a3-fixture';
    prior.cards[id] = { id, family: 'PRECISION', systemId: 'urinary', canonicalId: 'A3', blockId: 'urinary-b03',
      blockLabel: 'B3', blockTitle: 'Declared historical fixture', kpId: kp.identity.kpId, logicGroupId: kp.identity.logicGroupId,
      title: 'Declared private historical context', cue: 'Declared historical cue; no admitted precision identity',
      precisionCueId: 'declared-unadmitted-historical-a3-fixture', answerHtml: '', ownerContextHtml: '<p>Declared prior context, not a ratio answer.</p>',
      answerResolution: 'OWNER_CONTEXT_ONLY', sourceHash: 'declared-history', semanticRevision: 'declared-history',
      releasedAt: '2026-09-01T00:00:00Z', contentHistory: [] };
    prior.evidence = [{ id: 'declared-history-evidence', cardId: id, family: 'PRECISION', rating: 'unknown', origin: 'DECLARED_BROWSER_FIXTURE', at: '2026-09-01T01:00:00Z' }];
    await page.evaluate(({ key, state }) => localStorage.setItem(key, JSON.stringify(state)), { key: memoryKey, state: prior });
    await openPrepared(page, slug); const after = await read(page, memoryKey);
    assert.deepEqual(after.cards[id], prior.cards[id]); assert.deepEqual(after.evidence, prior.evidence);
    assert.equal(await page.locator('[data-memory-queue] button').count(), bySlug.get(slug).length);
    await page.locator('[data-memory-view="PRECISION"]').click();
    assert.equal(await page.locator('[data-memory-queue] button').count(), bySlug.get(slug).length + 1, 'general history survives current-admission filtering');
    await page.goto(preparedUrl(slug), { waitUntil: 'domcontentloaded' }); await ready(page);
    assert.equal(await page.locator('[data-memory-queue] button').count(), bySlug.get(slug).length);
    assert.deepEqual(await read(page, memoryKey), after);
    checks.push('held B3 KP03 has no assigned current ID; explicitly synthetic unadmitted historical card/evidence remain stored/general-visible and excluded only from current prepared view');
    await context.close();
  }

  // Isolate every Source completeness conjunct with declared state. Do not
  // store completed=true: that value is passed only to the pure inspector.
  for (const kind of ['source-missing', 'flag-only', 'partial-allSource']) {
    const slug = 'b01', context = await newContext(), page = await newPage(context);
    await page.goto(blockUrl(slug), { waitUntil: 'domcontentloaded' }); await blockReady(page, slug);
    // Bind this adversarial fixture to the same rendered learner object as
    // its fresh saved state. Node-only Extension URLs differ from Vite URLs;
    // comparing those witnesses would test cross-environment revision instead
    // of the intended Source conjunct. Never re-sign or clear pending state.
    const object = JSON.parse(await page.locator('[data-xizong-learner-object-payload]').textContent());
    const kpIds = object.kps.map(kp => kp.identity.kpId);
    const fixture = clone(await read(page, studyKeyFor(slug)));
    assert.deepEqual(fixture.contentRevision.witness, object.revisionWitness, 'Source fixture uses exact served revision witness');
    assert.equal(revisionRequiresAction(fixture), false, 'fresh Source fixture has no unrelated pending revision');
    Object.assign(fixture, { stage: 'block_recall', recallEntryMode: 'POST_CHAT_RECALL', completed: false,
      blockRecallDone: true, learned: Object.fromEntries(kpIds.map(id => [id, true])), ratings: Object.fromEntries(kpIds.map(id => [id, 'known'])),
      sourceContactDone: kind !== 'source-missing', sourceContactEvidence: [] });
    for (const id of kpIds) revalidateXizongUnit(fixture, 'KP', id, '2026-10-01T00:00:00Z');
    for (const group of object.logicGroups) revalidateXizongUnit(fixture, 'GROUP', group.identity.logicGroupId, '2026-10-01T00:00:00Z');
    revalidateXizongUnit(fixture, 'BLOCK', `xizong:urinary-${slug}`, '2026-10-01T00:00:00Z');
    if (kind === 'partial-allSource') fixture.sourceContactEvidence = [{ id: 'declared-partial-coverage', source_hash: object.sourceHash,
      contact_witness: object.revisionWitness.contact, coverage_kind: 'EXPLICIT_BLOCK_CUMULATIVE_CONFIRMATION', kp_ids: kpIds.slice(0, -1), at: '2026-10-01T00:00:00Z' }];
    assert.equal(xizongSourceContactCovered(fixture, object), false);
    assert.equal(inspectXizongBlockCompletion(object, { ...fixture, completed: true }).reason, kind === 'source-missing' ? 'SOURCE_CONTACT_INCOMPLETE' : 'SOURCE_COVERAGE_INCOMPLETE');
    await page.evaluate(({ key, state }) => localStorage.setItem(key, JSON.stringify(state)), { key: studyKeyFor(slug), state: fixture });
    await page.reload({ waitUntil: 'domcontentloaded' }); await blockReady(page, slug);
    assert.equal(await page.locator('[data-block-complete]').isDisabled(), true);
    const before = claims(await read(page, studyKeyFor(slug)));
    await page.locator('[data-block-complete]').dispatchEvent('click');
    assert.deepEqual(claims(await read(page, studyKeyFor(slug))), before); assert.equal(await read(page, memoryKey), null);
    checks.push(`declared ${kind}: all KP learned/rated + Block Recall cannot bypass real Source/allSource coverage in actual completion button and inspector`);
    await context.close();
  }

  // The finite shipped A3 set need not contain a reviewed TTSX or visual GAP.
  // These explicitly labelled response-only fixtures exercise the actual same
  // controller, not a substitute implementation or new native admission.
  const installControllerFixture = async (context, slug, { ttsx = null, visual = false } = {}) => {
    await context.route(blockUrl(slug), async route => {
      const response = await route.fetch(); let html = await response.text();
      const replaceOnce = (pattern, value, label) => {
        assert.equal([...html.matchAll(new RegExp(pattern.source, 'g'))].length, 1, `${label}: exact shipped controller fixture hook`);
        html = html.replace(pattern, value);
      };
      if (ttsx) replaceOnce(/const\s+ttsxData\s*=\s*Array\.isArray\(ttsxPayload\)\s*\?\s*ttsxPayload\s*:\s*\[\];/, `const ttsxData = ${JSON.stringify(ttsx)};`, 'declared TTSX');
      if (visual) {
        replaceOnce(/const\s+groups\s*=\s*groupPayload\s*\|\|\s*\[\];/, 'const groups = (groupPayload || []).map((group, index) => index === 0 ? { ...group, visualRequired: true, visualSourceState: "GAP_NOT_MOUNTED_DECLARED_BROWSER_FIXTURE" } : group);', 'declared visual');
        const scriptPattern = /(<script\b[^>]*data-xizong-completion-input[^>]*>)([\s\S]*?)(<\/script>)/;
        const match = html.match(scriptPattern); assert.ok(match, 'actual completion guard data');
        const input = JSON.parse(match[2]), firstGroup = projections.get(slug).learnerObject.logicGroups[0];
        input.blockingVisualGroups = [{ groupId: firstGroup.identity.logicGroupId, label: 'Declared required visual fixture', visualSourceState: 'GAP_NOT_MOUNTED_DECLARED_BROWSER_FIXTURE', reviewableFromOriginalSource: true }];
        html = html.replace(scriptPattern, (_, start, _old, end) => start + JSON.stringify(input).replaceAll('<', '\\u003c') + end);
      }
      await route.fulfill({ response, body: html });
    });
  };
  {
    const slug = 'b01', context = await newContext(); await installControllerFixture(context, slug, { visual: true });
    const page = await newPage(context); await page.goto(blockUrl(slug), { waitUntil: 'domcontentloaded' }); await blockReady(page, slug);
    const object = JSON.parse(await page.locator('[data-xizong-learner-object-payload]').textContent());
    const kpIds = object.kps.map(kp => kp.identity.kpId), fixture = clone(await read(page, studyKeyFor(slug)));
    assert.deepEqual(fixture.contentRevision.witness, object.revisionWitness, 'visual fixture uses exact served revision witness before declared GAP mutation');
    assert.equal(revisionRequiresAction(fixture), false, 'fresh visual fixture has no unrelated pending revision');
    Object.assign(object.logicGroups[0], { visualRequired: true, visualSourceState: 'GAP_NOT_MOUNTED_DECLARED_BROWSER_FIXTURE' });
    Object.assign(fixture, { stage: 'kp_recall', recallEntryMode: 'POST_CHAT_RECALL', completed: false, blockRecallDone: true,
      learned: Object.fromEntries(kpIds.map(id => [id, true])), ratings: Object.fromEntries(kpIds.map(id => [id, 'known'])), sourceContactDone: true,
      sourceContactEvidence: [{ id: 'declared-allSource-no-visual', source_hash: object.sourceHash, contact_witness: object.revisionWitness.contact,
        coverage_kind: 'EXPLICIT_BLOCK_CUMULATIVE_CONFIRMATION', kp_ids: kpIds, visual_reviewed_lg_ids: [], at: '2026-10-01T00:00:00Z' }] });
    assert.equal(xizongSourceContactCovered(fixture, object), true, 'Source coverage is complete so visual gate is tested independently');
    assert.equal(inspectXizongBlockCompletion(object, { ...fixture, completed: true }).reason, 'VISUAL_EVIDENCE_INCOMPLETE');
    await page.evaluate(({ key, state }) => localStorage.setItem(key, JSON.stringify(state)), { key: studyKeyFor(slug), state: fixture });
    await page.reload({ waitUntil: 'domcontentloaded' }); await blockReady(page, slug);
    assert.equal(await page.locator('[data-block-complete]').isDisabled(), true);
    const before = claims(await read(page, studyKeyFor(slug)));
    for (const selector of ['[data-block-recall-reveal]', '[data-block-recall-complete]', '[data-block-complete]']) await page.locator(selector).dispatchEvent('click');
    assert.deepEqual(claims(await read(page, studyKeyFor(slug))), before); assert.equal(await read(page, memoryKey), null);
    assert.match(await page.locator('[data-study-local-status]').textContent(), /原图门禁未闭合/);
    checks.push('declared response-only required visual GAP: full Source/KP/Recall fixture still cannot Reveal/complete Block or mint Memory; actual controller/guard retain visual evidence requirement');
    await context.close();
  }
  {
    const slug = 'b01', context = await newContext();
    const ttsx = [{ checkpointId: 'declared-reviewed-browser-ttsx', label: 'Declared reviewed Source-boundary fixture', questionRows: [] }];
    await installControllerFixture(context, slug, { ttsx });
    const page = await newPage(context); await page.goto(blockUrl(slug), { waitUntil: 'domcontentloaded' }); await blockReady(page, slug);
    await page.locator('[data-study-stage="block_learn"] [data-post-chat-recall]').click();
    assert.deepEqual(claims(await read(page, studyKeyFor(slug))), emptyClaims, 'post-Chat does not certify TTSX/Source');
    await page.locator('[data-study-stage="kp_recall"] [data-stage-target="source_contact"]').click();
    await page.locator('[data-source-contact-done]').click();
    await page.locator('[data-study-stage="ttsx_checkpoint"]').waitFor({ state: 'visible' });
    const pending = await read(page, studyKeyFor(slug));
    assert.equal(pending.pendingTtsx.key, ttsx[0].checkpointId); assert.deepEqual(pending.ttsxEvidence, {});
    await page.reload({ waitUntil: 'domcontentloaded' }); await blockReady(page, slug);
    // A hidden dispatched navigation is adversarial; it is not a user study action.
    await page.locator('[data-study-stage="block_learn"] [data-post-chat-recall]').dispatchEvent('click');
    assert.equal((await read(page, studyKeyFor(slug))).stage, 'ttsx_checkpoint');
    assert.deepEqual((await read(page, studyKeyFor(slug))).ttsxEvidence, {});
    assert.equal(await page.locator('[data-block-complete]').isDisabled(), true); assert.equal(await read(page, memoryKey), null);
    await page.locator('[data-ttsx-done]').click();
    await page.locator('[data-study-stage="kp_recall"]').waitFor({ state: 'visible' });
    const done = await read(page, studyKeyFor(slug));
    assert.equal(Object.keys(done.ttsxEvidence).length, 1); assert.ok(done.ttsxEvidence[ttsx[0].checkpointId].completedAt);
    assert.equal(done.completed, false); assert.equal(await read(page, memoryKey), null);
    checks.push('declared reviewed TTSX response fixture: explicit Source confirmation queues checkpoint, reload/post-Chat cannot bypass it; only explicit checkpoint action creates one synthetic TTSX record');
    await context.close();
  }

  for (const slug of ['b05', 'b12']) {
    const context = await newContext(), page = await newPage(context);
    await page.goto(blockUrl(slug), { waitUntil: 'domcontentloaded' }); await blockReady(page, slug);
    if (slug === 'b12') await page.evaluate(({ key, state }) => localStorage.setItem(key, JSON.stringify(state)), { key: memoryKey,
      state: { ...createXizongMemoryState(), marks: { declared: { text: 'Existing declared private mark' } } } });
    const beforeMemory = await raw(page, memoryKey), beforeStudy = await raw(page, studyKeyFor(slug));
    await page.evaluate(key => { const set = Storage.prototype.setItem; Storage.prototype.setItem = function (name, value) {
      if (name === key) throw new Error('Declared A3 availability save failure'); return set.call(this, name, value);
    }; }, memoryKey);
    await page.locator('[data-open-prepared-memory]').click();
    await page.waitForFunction(() => document.querySelector('[data-prepared-memory-status]')?.textContent.includes('无法安全打开'));
    assert.equal(page.url(), blockUrl(slug)); assert.equal(await raw(page, memoryKey), beforeMemory); assert.equal(await raw(page, studyKeyFor(slug)), beforeStudy);
    await page.locator('[data-prepared-memory-status]').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(out, `${slug}-availability-save-failure.png`), fullPage: true });
    await noDependencyState(page, slug); await context.close();
  }
  checks.push('actual B5 LG and B12 KP availability save failures preserve null/existing bytes and Block state, refuse navigation, create no dependent learner state');
  {
    const slug = 'b05', context = await newContext(), page = await newPage(context);
    await page.goto(blockUrl(slug), { waitUntil: 'domcontentloaded' }); await blockReady(page, slug); await openPrepared(page, slug);
    await choose(page, slug, 'a3-b05-lg06-precision'); await page.locator('[data-precision-mode="RECALL"]').click(); await page.locator('[data-memory-reveal]').click();
    const beforeMemory = await raw(page, memoryKey), beforeStudy = await raw(page, studyKeyFor(slug));
    await page.evaluate(key => { const set = Storage.prototype.setItem; Storage.prototype.setItem = function (name, value) {
      if (name === key) throw new Error('Declared A3 rating save failure'); return set.call(this, name, value);
    }; }, memoryKey);
    await page.locator('[data-memory-rating="known"]').click();
    await page.waitForFunction(() => document.querySelector('[data-xizong-memory-workspace]')?.dataset.memoryStateBlocked === 'true');
    assert.equal(await raw(page, memoryKey), beforeMemory); assert.equal(await raw(page, studyKeyFor(slug)), beforeStudy);
    assert.deepEqual((await read(page, memoryKey)).evidence, []);
    await page.screenshot({ path: path.join(out, 'b05-rating-save-failure.png'), fullPage: true });
    await page.reload({ waitUntil: 'domcontentloaded' }); await ready(page); assert.equal(await raw(page, memoryKey), beforeMemory);
    checks.push('actual B5 complete LG Reveal followed by failed rating save blocks Memory, preserves old bytes, and creates no evidence after reload');
    await context.close();
  }
  {
    const slug = 'b05', context = await newContext(), page = await newPage(context);
    await page.goto(blockUrl(slug), { waitUntil: 'domcontentloaded' }); await blockReady(page, slug);
    const key = studyKeyFor(slug), beforeStudy = await raw(page, key), beforeRecall = await raw(page, recallKeyFor(slug));
    await page.evaluate(key => { const set = Storage.prototype.setItem; Storage.prototype.setItem = function (name, value) {
      if (name === key) throw new Error('Declared A3 post-Chat Block save failure'); return set.call(this, name, value);
    }; }, key);
    await page.locator('[data-study-stage="block_learn"] [data-post-chat-recall]').click();
    await page.waitForFunction(() => document.querySelector('[data-xizong-v6-block]')?.dataset.xizongStateBlocked === 'true');
    assert.equal(await raw(page, key), beforeStudy); assert.equal(await raw(page, recallKeyFor(slug)), beforeRecall);
    assert.equal(await read(page, memoryKey), null);
    await page.screenshot({ path: path.join(out, 'b05-post-chat-save-failure.png'), fullPage: true });
    await page.reload({ waitUntil: 'domcontentloaded' }); await blockReady(page, slug);
    assert.deepEqual(claims(await read(page, key)), emptyClaims); assert.equal((await read(page, key)).stage, 'block_learn');
    checks.push('actual B5 post-Chat Block save failure blocks the controller; no persisted entry/Recall/Source/Memory success survives reload');
    await context.close();
  }
  {
    const slug = 'b01', context = await newContext();
    await context.addInitScript(() => Object.defineProperty(navigator, 'locks', { configurable: true, value: undefined }));
    const page = await newPage(context); await page.goto(blockUrl(slug), { waitUntil: 'domcontentloaded' }); await page.bringToFront();
    await page.waitForFunction(() => document.documentElement.dataset.learnerWriter === 'unavailable');
    const snapshot = () => page.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter(key => /^kianos[-:]/.test(key)).map(key => [key, localStorage.getItem(key)])));
    const before = await snapshot(); await page.locator('[data-study-stage="block_learn"] [data-post-chat-recall]').click();
    assert.deepEqual(await snapshot(), before); assert.equal(await read(page, memoryKey), null); assert.equal(await read(page, studyKeyFor(slug)), null);
    assert.equal(await page.locator('[data-study-stage="block_learn"]').isVisible(), true);
    checks.push('no-Web-Locks declared read-only A3 reader has no post-Chat writer fallback, Source/learning/ratings/release or debt');
    await context.close();
  }
  assert.deepEqual(errors, []);
  report.status = 'PASS'; report.completed_at = new Date().toISOString();
  console.log(`XIZONG_A3_PREPARED_MEMORY_BROWSER PASS | checks=${checks.length} | 28 independently reviewed answers | CI synthetic evidence only`);
} catch (error) {
  report.status = 'FAIL'; report.completed_at = new Date().toISOString(); report.error = String(error?.stack || error);
  if (lastPage && !lastPage.isClosed()) await lastPage.screenshot({ path: path.join(out, 'failure.png'), fullPage: true }).catch(() => {});
  throw error;
} finally {
  fs.writeFileSync(path.join(out, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  await browser?.close();
}
