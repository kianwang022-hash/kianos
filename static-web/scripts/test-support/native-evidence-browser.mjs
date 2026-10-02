import assert from 'node:assert/strict';

// Mounts whole production Astro components. No copied handler/phase algorithm.
export async function verifyNativeEvidenceBrowser(page) {
  const studyKey = 'kianos-xizong-astro-v2:xizong:synthetic-evidence-b01';
  const evidenceKey = 'kianos-xizong-memory-review-v2:xizong:synthetic-evidence-b01';
  const systemKey = 'kianos:xizong:system-evidence:synthetic-evidence:v1';
  const sweepKey = 'kianos:xizong:system-question-sweep:synthetic-evidence:v1';
  await page.waitForFunction(key => JSON.parse(localStorage.getItem(key) || 'null')?.evidenceHistory?.length === 0, evidenceKey);
  const read = key => page.evaluate(key => JSON.parse(localStorage.getItem(key) || 'null'), key);
  // Synthetic admitted preconditions; production writer remains active.
  await page.evaluate(key => localStorage.setItem(key, JSON.stringify({ stage: 'kp_recall', learned: { 'synthetic-kp': true } })), studyKey);
  await page.locator('[data-rating]').click(); await page.locator('[data-rating]').click();
  const prior = await read(evidenceKey);
  assert.equal(prior.evidenceHistory.length, 2, 'KP_REPEATED_NATIVE_ATTEMPTS');
  assert.ok(prior.evidenceHistory.every(row => row.type === 'KP_RECALL' && row.rating === 'unknown' && row.evidence_origin === 'USER_RECALL_ATTEMPT'));
  await page.locator('[data-kp-answer]').evaluate(node => { node.hidden = true; });
  await page.locator('[data-rating]').click();
  assert.deepEqual(await read(evidenceKey), prior, 'KP_UNREVEALED_MUST_NOT_WRITE');
  await page.locator('[data-kp-answer]').evaluate(node => { node.hidden = false; });

  for (const [results, phase] of [[{}, 'PRE_QUESTION'], [{ 'SYNTHETIC-Q1': { status: 'wrong' } }, 'MID_SWEEP'], [{ 'SYNTHETIC-Q1': { status: 'wrong' }, 'SYNTHETIC-Q2': { status: 'correct' } }, 'POST_QUESTION']]) {
    await page.evaluate(({ key, results }) => localStorage.setItem(key, JSON.stringify({ results })), { key: sweepKey, results });
    await page.locator('[data-complete-recall]').click();
    assert.equal((await read(systemKey)).events.at(-1).phase, phase, 'SYSTEM_NATIVE_PHASE_' + phase);
  }
  const systemPrior = await read(systemKey);
  assert.equal(systemPrior.events.length, 3);
  await page.locator('[data-recall-reveal]').evaluate(node => { node.hidden = true; });
  await page.locator('[data-complete-recall]').click();
  assert.deepEqual(await read(systemKey), systemPrior, 'SYSTEM_UNREVEALED_MUST_NOT_WRITE');

  // Add a storage failure in front of the existing writer, never remove it.
  await page.evaluate(key => {
    const nativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) {
      if (name === key) throw new DOMException('synthetic quota fault', 'QuotaExceededError');
      return nativeSetItem.call(this, name, value);
    };
  }, evidenceKey);
  await page.locator('[data-rating]').click();
  await page.locator('[data-xizong-evidence-save-error]').waitFor({ state: 'visible' });
  assert.deepEqual(await read(evidenceKey), prior, 'KP_QUOTA_FAILURE_PRESERVES_HISTORY');
  assert.equal(await page.locator('[data-xizong-v6-block]').evaluate(node => node.inert), true, 'KP_QUOTA_FAILURE_BLOCKS_ADVANCE');
  return { kpAttempts: 2, phases: systemPrior.events.map(row => row.phase), unrevealedWrites: 0, quotaFailure: 'history preserved; native advance blocked' };
}
