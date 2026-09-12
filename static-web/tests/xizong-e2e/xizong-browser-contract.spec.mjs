import { test, expect } from '@playwright/test';

const systems = [
  { systemId: 'circulation', blockSlug: 'b01', blockId: 'circulation-b01' },
  { systemId: 'respiratory', blockSlug: 'r01', blockId: 'respiratory-r01' },
  { systemId: 'urinary', blockSlug: 'b01', blockId: 'urinary-b01' }
];

const blockStateKey = (blockId) => `kianos-xizong-astro-v2:xizong:${blockId}`;
const blockEvidenceKey = (blockId) => `kianos-xizong-memory-review-v2:xizong:${blockId}`;

async function readLocalJson(page, key, fallback = null) {
  return page.evaluate(({ key, fallback }) => {
    try { return JSON.parse(localStorage.getItem(key) || '') || fallback; } catch { return fallback; }
  }, { key, fallback });
}

async function openSystemExit(page) {
  const later = page.locator('[data-xizong-later-stage="system-exit"]');
  await later.locator(':scope > summary').click();
  await expect(later).toHaveAttribute('open', '');
}

async function completeSystemRecall(page) {
  await page.locator('[data-start-recall]').click();
  await expect(page.locator('[data-recall-dialog]')).toBeVisible();
  await page.locator('[data-reveal-recall]').click();
  await page.locator('[data-complete-recall]').click();
}

for (const spec of systems) {
  test.describe(`${spec.systemId} browser contract`, () => {
    test('premature Recall cannot manufacture learner evidence', async ({ page }) => {
      await page.goto(`/xizong/${spec.systemId}/${spec.blockSlug}/`);
      await expect(page.locator('[data-xizong-v6-block]')).toBeVisible();

      await page.locator('[data-stage-target="kp_recall"]').click();
      const firstRecall = page.locator('[data-kp-recall-card="0"]');
      await expect(firstRecall).toBeVisible();
      await firstRecall.locator('[data-kp-reveal]').click();
      await firstRecall.locator('[data-rating="fuzzy"]').click();

      await expect(page.locator('[data-study-local-status]')).toContainText('先完成这个 KP 的正式学习');
      const study = await readLocalJson(page, blockStateKey(spec.blockId), {});
      expect(Object.keys(study?.ratings || {})).toHaveLength(0);

      const evidence = await readLocalJson(page, blockEvidenceKey(spec.blockId), {});
      const recallEvents = (evidence?.evidenceHistory || []).filter((row) => row?.type === 'KP_RECALL');
      expect(recallEvents).toHaveLength(0);
    });

    test('real repeated identical Recall attempts remain separate evidence and survive reload', async ({ page }) => {
      await page.goto(`/xizong/${spec.systemId}/${spec.blockSlug}/`);
      await page.locator('[data-stage-target="kp_learn"]').click();

      const firstLearn = page.locator('[data-kp-learn-card="0"]');
      await expect(firstLearn).toBeVisible();
      const kpId = await firstLearn.locator('[data-kp-learned]').getAttribute('data-kp-learned');
      expect(kpId).toBeTruthy();
      await firstLearn.locator('[data-kp-learned]').click();

      await page.locator('[data-stage-target="kp_recall"]').click();
      await page.locator('[data-kp-target="0"]').click();
      const firstRecall = page.locator('[data-kp-recall-card="0"]');
      await expect(firstRecall).toBeVisible();
      await firstRecall.locator('[data-kp-reveal]').click();
      await firstRecall.locator('[data-rating="fuzzy"]').click();

      await page.waitForTimeout(180);
      await page.locator('[data-kp-target="0"]').click();
      await expect(firstRecall).toBeVisible();
      await firstRecall.locator('[data-rating="fuzzy"]').click();

      const evidence = await readLocalJson(page, blockEvidenceKey(spec.blockId), {});
      const realAttempts = (evidence?.evidenceHistory || []).filter((row) =>
        row?.type === 'KP_RECALL' &&
        row?.kp_id === kpId &&
        row?.rating === 'fuzzy' &&
        row?.evidence_origin === 'USER_RECALL_ATTEMPT'
      );
      expect(realAttempts).toHaveLength(2);

      await page.reload();
      const studyAfterReload = await readLocalJson(page, blockStateKey(spec.blockId), {});
      expect(studyAfterReload?.learned?.[kpId]).toBe(true);
      expect(studyAfterReload?.ratings?.[kpId]).toBe('fuzzy');

      const evidenceAfterReload = await readLocalJson(page, blockEvidenceKey(spec.blockId), {});
      const attemptsAfterReload = (evidenceAfterReload?.evidenceHistory || []).filter((row) =>
        row?.type === 'KP_RECALL' && row?.kp_id === kpId && row?.evidence_origin === 'USER_RECALL_ATTEMPT'
      );
      expect(attemptsAfterReload).toHaveLength(2);
    });

    test('System Recall completion is blocked until every Block is complete', async ({ page }) => {
      await page.goto(`/xizong/${spec.systemId}/`);
      await openSystemExit(page);
      await completeSystemRecall(page);

      await expect(page.locator('[data-recall-status]')).toContainText('需先完成整个系统');
      const recall = await readLocalJson(page, `kianos:xizong:system-recall:${spec.systemId}:v1`, {});
      expect(recall?.completedAt || null).toBeNull();
    });
  });
}

test('A3 stale Block evidence is archived and removed from current closure', async ({ page }) => {
  const blockId = 'urinary-b01';
  await page.addInitScript(({ blockId }) => {
    const seedKey = 'pw-xizong-stale-evidence-seeded';
    if (sessionStorage.getItem(seedKey) === '1') return;
    sessionStorage.setItem(seedKey, '1');
    const objectId = `xizong:${blockId}`;
    localStorage.setItem(`kianos-xizong-evidence-meta-v1:${objectId}`, JSON.stringify({ version: 'stale-test-version' }));
    localStorage.setItem(`kianos-xizong-astro-v2:${objectId}`, JSON.stringify({
      stage: 'block_complete',
      learned: { [`${blockId}-kp01`]: true },
      ratings: { [`${blockId}-kp01`]: 'mastered' },
      blockRecallDone: true,
      completed: true
    }));
    localStorage.setItem(`kianos-xizong-memory-review-v2:${objectId}`, JSON.stringify({
      evidenceHistory: [{ type: 'KP_RECALL', kp_id: `${blockId}-kp01`, rating: 'mastered' }]
    }));
  }, { blockId });

  await page.goto('/xizong/urinary/b01/');
  await expect(page.locator('[data-xizong-v6-block]')).toBeVisible();
  await expect.poll(async () => {
    return page.evaluate((blockId) => {
      const objectId = `xizong:${blockId}`;
      const state = JSON.parse(localStorage.getItem(`kianos-xizong-astro-v2:${objectId}`) || '{}');
      return Boolean(state.completed);
    }, blockId);
  }).toBe(false);

  const audit = await page.evaluate((blockId) => {
    const objectId = `xizong:${blockId}`;
    const state = JSON.parse(localStorage.getItem(`kianos-xizong-astro-v2:${objectId}`) || '{}');
    const extension = JSON.parse(localStorage.getItem(`kianos-xizong-memory-review-v2:${objectId}`) || '{}');
    const archiveKeys = Object.keys(localStorage).filter((key) => key.startsWith(`kianos-xizong-stale-evidence-v1:${objectId}:`));
    return { state, extension, archiveKeys };
  }, blockId);

  expect(audit.state.completed).not.toBe(true);
  expect(Object.keys(audit.state.ratings || {})).toHaveLength(0);
  expect(audit.extension.evidenceHistory || []).toHaveLength(0);
  expect(audit.archiveKeys.length).toBeGreaterThan(0);
});

test('A3 System Exit enforces private holdout, stable fast-pass, and Wrong-only repair debt', async ({ page }) => {
  const blockIds = Array.from({ length: 14 }, (_, index) => `urinary-b${String(index + 1).padStart(2, '0')}`);
  await page.addInitScript((blockIds) => {
    blockIds.forEach((blockId) => {
      localStorage.setItem(`kianos-xizong-astro-v2:xizong:${blockId}`, JSON.stringify({ completed: true }));
    });
  }, blockIds);

  await page.goto('/xizong/urinary/');
  await openSystemExit(page);
  await completeSystemRecall(page);
  await expect(page.locator('[data-recall-status]')).toContainText('已完成');

  const payload = JSON.parse(await page.locator('[data-sweep-payload]').textContent());
  const expectedActive = payload.questions.filter((question) => Number(question.year) !== 2026);
  expect(expectedActive.length).toBeGreaterThan(2);

  await page.locator('[data-holdout-input]').fill('2026');
  await page.locator('[data-save-holdout]').click();
  await expect(page.locator('[data-holdout-current]')).toContainText('2026');
  await expect(page.locator('[data-sweep-count]')).toHaveText(String(expectedActive.length));
  expect(await readLocalJson(page, 'kianos:xizong:full-paper-holdout-years:v1', [])).toEqual([2026]);

  await expect(page.locator('[data-start-sweep]')).toBeEnabled();
  await page.locator('[data-start-sweep]').click();
  await expect(page.locator('[data-question-workspace]')).toBeVisible();

  const first = expectedActive[0];
  const firstCorrect = String(first.correctAnswer || '').toUpperCase().match(/[A-Z]/g) || [];
  for (const letter of firstCorrect) await page.locator(`.xseOption[data-option="${letter}"]`).click();
  await page.locator('[data-submit-answer]').click();
  await expect(page.locator('[data-answer-result]')).toHaveText('答案正确');
  await page.locator('[data-mark-stable]').click();

  let sweep = await readLocalJson(page, 'kianos:xizong:system-question-sweep:urinary:v1', {});
  expect(sweep?.results?.[first.questionId]?.status).toBe('stable');
  await expect(page.locator('[data-stat-stable]')).toHaveText('1');
  await expect(page.locator('[data-stat-wrong]')).toHaveText('0');
  await expect(page.locator('[data-stat-uncertain]')).toHaveText('0');

  const second = expectedActive[1];
  const secondCorrect = String(second.correctAnswer || '').toUpperCase().match(/[A-Z]/g) || [];
  const labels = second.options.map((option) => option.label);
  const nonCorrect = labels.find((label) => !secondCorrect.includes(label));
  const wrongChoice = nonCorrect || (secondCorrect.length > 1 ? secondCorrect[0] : labels.find((label) => label !== secondCorrect[0]));
  expect(wrongChoice).toBeTruthy();

  await page.locator(`.xseOption[data-option="${wrongChoice}"]`).click();
  await page.locator('[data-submit-answer]').click();
  await expect(page.locator('[data-answer-result]')).toHaveText('答案错误');
  await expect(page.locator('[data-repair-panel]')).toBeVisible();

  sweep = await readLocalJson(page, 'kianos:xizong:system-question-sweep:urinary:v1', {});
  expect(sweep?.results?.[second.questionId]?.status).toBe('wrong');
  await expect(page.locator('[data-stat-wrong]')).toHaveText('1');
});
