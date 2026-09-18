import {
  POLITICS_SESSION_KEYS,
  normalizePoliticsSessionInstruction,
  validatePoliticsSessionEvidence,
  emptyPoliticsSessionEvidence,
  appendPoliticsSessionEvidence
} from './politicsSession.mjs';
import { PRACTICE_KEYS } from './politicsPracticeState.mjs';

const RUNTIME_SCHEMA = 'kianos.politics.session-runtime.v1';

function readJson(storage, key, fallback = null) {
  const raw = storage.getItem(key);
  if (raw === null) return fallback;
  return JSON.parse(raw);
}

function writeJson(storage, key, value) {
  storage.setItem(key, JSON.stringify(value));
}

function now() { return new Date().toISOString(); }

function safeRuntime(value, instruction) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {
      schema: RUNTIME_SCHEMA,
      session_id: instruction.session_id,
      step_index: 0,
      status: 'ACTIVE',
      response: '',
      revealed: false,
      elapsed_ms: 0,
      active_since: now()
    };
  }
  if (value.schema !== RUNTIME_SCHEMA || value.session_id !== instruction.session_id) {
    throw new Error('当前 Session 的恢复记录与任务单不一致；没有覆盖原记录。');
  }
  if (!Number.isInteger(value.step_index) || value.step_index < 0 || value.step_index > instruction.steps.length) {
    throw new Error('当前 Session 的步骤位置无效；没有跳到其他步骤。');
  }
  if (!['ACTIVE', 'COMPLETED', 'PAUSED_CHAT'].includes(value.status)) {
    throw new Error('当前 Session 的状态无效；没有替换任务。');
  }
  return {
    schema: RUNTIME_SCHEMA,
    session_id: instruction.session_id,
    step_index: value.step_index,
    status: value.status,
    response: String(value.response || ''),
    revealed: Boolean(value.revealed),
    elapsed_ms: Number.isFinite(value.elapsed_ms) ? Math.max(0, value.elapsed_ms) : 0,
    active_since: value.status === 'ACTIVE' ? now() : null
  };
}

export function initPoliticsSessionReview(root) {
  if (!(root instanceof HTMLElement)) return;
  const $ = (selector) => root.querySelector(selector);
  const $$ = (selector) => [...root.querySelectorAll(selector)];
  const storage = localStorage;

  const questionNode = $('[data-session-question-catalog]');
  const questionIds = new Set(JSON.parse(questionNode?.textContent || '[]'));
  questionNode?.remove();

  const registry = document.querySelector('[data-politics-session-target-registry]');
  const targetTemplates = new Map(
    [...(registry?.querySelectorAll('template[data-politics-session-target]') || [])]
      .map((template) => [template.dataset.politicsSessionTarget, template])
  );
  const targetRefs = new Set(targetTemplates.keys());
  const targetPolicies = new Map(
    [...targetTemplates.entries()].map(([ref, template]) => [ref, {
      kind: template.dataset.sessionTargetKind || 'FINAL',
      memory_admission: template.dataset.sessionMemoryAdmission || '',
      precision_admission: template.dataset.sessionPrecisionAdmission || '',
      precision_blocker: template.dataset.sessionPrecisionBlocker || ''
    }])
  );

  let instruction = null;
  let evidence = null;
  let runtime = null;
  let instructionBytes = null;

  const setError = (message = '') => {
    const node = $('[data-session-error]');
    node.hidden = !message;
    node.textContent = message;
  };

  const persistEvidence = (next) => {
    writeJson(storage, POLITICS_SESSION_KEYS.evidence, next);
    evidence = next;
  };

  const persistRuntime = (next) => {
    writeJson(storage, POLITICS_SESSION_KEYS.runtime, next);
    runtime = next;
  };

  const ensureInstructionStable = () => {
    if (storage.getItem(POLITICS_SESSION_KEYS.instruction) !== instructionBytes) {
      throw new Error('Chat 任务已在其他页面改变；当前操作没有覆盖它，请刷新。');
    }
  };

  const elapsed = () => {
    if (!runtime) return 0;
    const active = runtime.active_since ? Math.max(0, Date.now() - Date.parse(runtime.active_since)) : 0;
    return Math.max(0, Math.round((runtime.elapsed_ms || 0) + active));
  };

  const currentStep = () => instruction?.steps?.[runtime?.step_index] || null;

  const saveDraft = () => {
    if (!instruction || !runtime || runtime.status !== 'ACTIVE') return;
    ensureInstructionStable();
    persistRuntime({
      ...runtime,
      response: $('[data-session-response]')?.value || runtime.response || '',
      elapsed_ms: elapsed(),
      active_since: now()
    });
  };

  const cloneTargets = (step, destination) => {
    destination.replaceChildren();
    for (const ref of step.target_refs || []) {
      const template = targetTemplates.get(ref);
      if (!template) throw new Error('目标已经变化：' + ref + '；没有寻找相似内容替代。');
      destination.append(template.content.cloneNode(true));
    }
  };

  const copyText = async (value) => {
    const output = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    try { await navigator.clipboard.writeText(output); }
    catch { window.prompt('复制 Politics Session Evidence', output); }
  };

  const nextRuntime = (nextIndex, status = 'ACTIVE') => ({
    schema: RUNTIME_SCHEMA,
    session_id: instruction.session_id,
    step_index: nextIndex,
    status,
    response: '',
    revealed: false,
    elapsed_ms: 0,
    active_since: status === 'ACTIVE' ? now() : null
  });

  const recordAndAdvance = (event, { status = null } = {}) => {
    ensureInstructionStable();
    const step = currentStep();
    if (!step) throw new Error('当前步骤不存在；没有推进。');
    const nextIndex = runtime.step_index + 1;
    const completed = status === 'COMPLETED' || nextIndex >= instruction.steps.length;
    const nextStatus = status || (completed ? 'COMPLETED' : 'ACTIVE');
    const resume = {
      step_index: completed ? instruction.steps.length : nextIndex,
      step_id: completed ? null : instruction.steps[nextIndex]?.step_id || null,
      status: nextStatus
    };
    persistEvidence(appendPoliticsSessionEvidence(
      evidence,
      instruction,
      {
        step_id: step.step_id,
        recipe_type: step.recipe_type,
        target_refs: step.target_refs,
        question_ids: step.question_ids,
        elapsed_ms: elapsed(),
        observed_at: now(),
        ...event
      },
      resume
    ));
    persistRuntime(nextRuntime(completed ? instruction.steps.length : nextIndex, nextStatus));
    render();
  };

  const blockStep = (reason) => {
    $('[data-session-blocked]').hidden = false;
    $('[data-session-blocked-reason]').textContent = reason;
    $('[data-session-step-main]').hidden = true;
  };

  const targetPolicyForStep = (step) => (step?.target_refs || []).map((ref) => ({
    ref,
    ...(targetPolicies.get(ref) || { kind: 'UNKNOWN', memory_admission: '', precision_admission: '', precision_blocker: '' })
  }));

  const memoryStepAllowed = (step) => targetPolicyForStep(step).every((row) =>
    row.kind !== 'MEMORY' || row.memory_admission === 'ADMITTED_STABLE'
  );

  const precisionStepAllowed = (step) => {
    const policies = targetPolicyForStep(step);
    return policies.length > 0 && policies.every((row) =>
      row.kind === 'MEMORY' && row.precision_admission === 'ADMITTED_STABLE'
    );
  };

  const practiceCompletion = (step) => {
    const practice = readJson(storage, PRACTICE_KEYS.session, null);
    if (!practice || practice.status !== 'completed' || practice.endedEarly) return null;
    if (practice.scope?.mode !== 'explicit_retest') return null;
    if (practice.scope?.session_ref !== instruction.session_id || practice.scope?.session_step_id !== step.step_id) return null;
    if (JSON.stringify(practice.ids || []) !== JSON.stringify(step.question_ids || [])) return null;
    const rows = step.question_ids.map((id) => practice.results?.[id]).filter(Boolean);
    if (rows.length !== step.question_ids.length) return null;
    return {
      question_ids: [...step.question_ids],
      results: step.question_ids.map((id) => {
        const row = practice.results[id];
        return {
          question_id: id,
          selected: row.selected || '',
          correct: Boolean(row.correct),
          uncertain: Boolean(row.uncertain),
          outcome: row.outcome || '',
          elapsed_ms: Number.isFinite(row.elapsedMs) ? row.elapsedMs : null
        };
      })
    };
  };

  function render() {
    const activeSession = Boolean(instruction);
    $('[data-session-workspace]').hidden = !activeSession;
    $('[data-review-native]').hidden = activeSession && runtime?.status !== 'COMPLETED';
    $('[data-session-import-open]').textContent = activeSession ? '查看 / 更换 Chat 任务' : '导入 Chat 任务';
    if (!activeSession) return;

    $('[data-session-id]').textContent = instruction.session_id;
    $('[data-session-phase]').textContent = instruction.phase;
    $('[data-session-anchor]').textContent = instruction.anchor_ref;
    $('[data-session-progress]').textContent = runtime.status === 'COMPLETED'
      ? instruction.steps.length + ' / ' + instruction.steps.length
      : Math.min(runtime.step_index + 1, instruction.steps.length) + ' / ' + instruction.steps.length;

    $$('[data-session-mode]').forEach((node) => { node.hidden = true; });
    $('[data-session-complete]').hidden = runtime.status !== 'COMPLETED';
    $('[data-session-step]').hidden = !['ACTIVE', 'PAUSED_CHAT'].includes(runtime.status);
    $('[data-session-blocked]').hidden = true;
    $('[data-session-step-main]').hidden = false;
    $('[data-session-reveal-content]').hidden = true;
    $('[data-session-markers]').hidden = true;
    setError('');

    if (runtime.status === 'COMPLETED') {
      $('[data-session-complete-count]').textContent =
        (evidence?.events?.length || 0) + ' 条执行证据已保存。本页没有生成掌握度或下一步推荐。';
      return;
    }

    if (runtime.status === 'PAUSED_CHAT') {
      $('[data-session-step]').hidden = false;
      $('[data-session-mode="chat"]').hidden = false;
      return;
    }

    const step = currentStep();
    if (!step) {
      setError('当前任务步骤不存在；没有自动选择替代内容。');
      return;
    }

    const recipeLabels = {
      RECONSTRUCT: '想一遍这一块',
      TARGETED_RECALL: '只回忆这个点',
      QUESTION_RETEST: '重做指定题',
      SOURCE_REPAIR: '回源修补',
      PRECISION: '精确记忆',
      CHAT_REPAIR_RETURN: '回 Chat 判断',
      CLOSE: '完成'
    };
    $('[data-session-recipe]').textContent = recipeLabels[step.recipe_type] || '当前任务';
    $('[data-session-prompt]').textContent = step.learner_prompt
      || (step.recipe_type === 'TARGETED_RECALL' ? '只回忆 Chat 指定的这一项。' : '执行 Chat 指定的当前动作。');

    if (step.timer_seconds != null) {
      // timed-task executor 还未验收: fail closed until the generic timed Session recipe is accepted.
      blockStep('这一步需要计时，但通用计时任务还没完成验收；当前先不自动执行。');
      return;
    }

    if (['RECONSTRUCT', 'TARGETED_RECALL'].includes(step.recipe_type)) {
      if (!memoryStepAllowed(step)) {
        blockStep('这个记忆对象还没有通过 Memory admission；网页不会用相邻或相似内容替代。');
        return;
      }
      $('[data-session-mode="recall"]').hidden = false;
      const textarea = $('[data-session-response]');
      textarea.value = runtime.response || '';
      $('[data-session-reveal-content]').hidden = !runtime.revealed;
      $('[data-session-markers]').hidden = !runtime.revealed;
      if (runtime.revealed) cloneTargets(step, $('[data-session-reveal-content]'));
      return;
    }

    if (step.recipe_type === 'QUESTION_RETEST') {
      $('[data-session-mode="questions"]').hidden = false;
      const list = $('[data-session-question-list]');
      list.replaceChildren(...step.question_ids.map((id) => {
        const item = document.createElement('li');
        item.textContent = id;
        return item;
      }));
      const href = new URL((root.dataset.base || '/') + 'politics/practice/', location.origin);
      href.searchParams.set('questions', step.question_ids.join(','));
      href.searchParams.set('sessionRetest', instruction.session_id);
      href.searchParams.set('sessionStep', step.step_id);
      href.searchParams.set('returnTo', location.pathname);
      $('[data-session-question-start]').href = href.pathname + href.search;
      const result = practiceCompletion(step);
      $('[data-session-question-finish]').disabled = !result;
      $('[data-session-question-status]').textContent = result
        ? '这组指定题已经完整做完，可以继续。'
        : '只认这一 Session / 这一步绑定的完整题组；未完成时不会自动推进。';
      return;
    }

    if (step.recipe_type === 'SOURCE_REPAIR') {
      $('[data-session-mode="source"]').hidden = false;
      if (!step.source_href) {
        blockStep('Chat 没有给出可验证的来源定位；网页不会拿相邻内容代替。');
        return;
      }
      $('[data-session-source-link]').href = step.source_href;
      return;
    }

    if (step.recipe_type === 'PRECISION') {
      if (!precisionStepAllowed(step)) {
        const blockers = targetPolicyForStep(step)
          .map((row) => row.precision_blocker)
          .filter(Boolean);
        blockStep(blockers[0] || '这条内容已经可以作为 Memory 回忆，但还没有通过 Precision exactness / freshness admission。');
        return;
      }
      $('[data-session-mode="recall"]').hidden = false;
      const textarea = $('[data-session-response]');
      textarea.value = runtime.response || '';
      $('[data-session-reveal-content]').hidden = !runtime.revealed;
      $('[data-session-markers]').hidden = !runtime.revealed;
      if (runtime.revealed) cloneTargets(step, $('[data-session-reveal-content]'));
      return;
    }

    if (step.recipe_type === 'CHAT_REPAIR_RETURN') {
      $('[data-session-mode="chat"]').hidden = false;
      return;
    }

    if (step.recipe_type === 'CLOSE') {
      $('[data-session-mode="close"]').hidden = false;
      return;
    }

    blockStep('当前 recipe 尚未实现：' + step.recipe_type);
  }

  function load() {
    instruction = null;
    evidence = null;
    runtime = null;
    instructionBytes = storage.getItem(POLITICS_SESSION_KEYS.instruction);
    if (!instructionBytes) { render(); return; }
    try {
      instruction = normalizePoliticsSessionInstruction(
        JSON.parse(instructionBytes),
        { targetRefs, questionIds }
      );
      evidence = readJson(storage, POLITICS_SESSION_KEYS.evidence, null);
      if (evidence) evidence = validatePoliticsSessionEvidence(evidence, instruction);
      else evidence = emptyPoliticsSessionEvidence(instruction);
      runtime = safeRuntime(readJson(storage, POLITICS_SESSION_KEYS.runtime, null), instruction);
      if (runtime.status === 'ACTIVE') persistRuntime(runtime);
      render();
    } catch (error) {
      instruction = null;
      evidence = null;
      runtime = null;
      setError(error.message || 'Session 无法安全恢复。');
      $('[data-session-workspace]').hidden = true;
      $('[data-review-native]').hidden = false;
    }
  }

  $('[data-session-import-open]').addEventListener('click', () => {
    const dialog = $('[data-session-import-dialog]');
    $('[data-session-import-text]').value = instruction ? JSON.stringify(instruction, null, 2) : '';
    $('[data-session-import-error]').hidden = true;
    if (!dialog.open) dialog.showModal();
  });

  $('[data-session-import-close]').addEventListener('click', () => $('[data-session-import-dialog]').close());

  $('[data-session-import-confirm]').addEventListener('click', () => {
    const errorNode = $('[data-session-import-error]');
    try {
      const next = normalizePoliticsSessionInstruction(
        JSON.parse($('[data-session-import-text]').value),
        { targetRefs, questionIds }
      );
      if (instruction) {
        const currentEncoded = JSON.stringify(instruction);
        const nextEncoded = JSON.stringify(next);
        if (instruction.session_id === next.session_id) {
          if (currentEncoded !== nextEncoded) {
            throw new Error('同一个 session_id 的任务内容发生变化；为保护已有 Evidence，请让 Chat 发一个新的 session_id。');
          }
          $('[data-session-import-dialog]').close();
          return;
        }
        if (runtime?.status !== 'COMPLETED') {
          throw new Error('当前 Chat 任务还没完成；为保护 Evidence，不会直接覆盖成另一任务。');
        }
      }
      storage.setItem(POLITICS_SESSION_KEYS.instruction, JSON.stringify(next));
      storage.setItem(POLITICS_SESSION_KEYS.evidence, JSON.stringify(emptyPoliticsSessionEvidence(next)));
      storage.setItem(POLITICS_SESSION_KEYS.runtime, JSON.stringify(safeRuntime(null, next)));
      $('[data-session-import-dialog]').close();
      load();
    } catch (error) {
      errorNode.hidden = false;
      errorNode.textContent = error.message || '任务单无法读取。';
    }
  });

  $('[data-session-response]').addEventListener('input', () => {
    if (!runtime || runtime.status !== 'ACTIVE') return;
    runtime.response = $('[data-session-response]').value;
  });

  $('[data-session-response]').addEventListener('blur', () => {
    try { saveDraft(); } catch (error) { setError(error.message); }
  });

  $('[data-session-reveal]').addEventListener('click', () => {
    try {
      const step = currentStep();
      if (!step || !['RECONSTRUCT', 'TARGETED_RECALL', 'PRECISION'].includes(step.recipe_type)) return;
      saveDraft();
      runtime.revealed = true;
      persistRuntime({ ...runtime, revealed: true, active_since: now() });
      cloneTargets(step, $('[data-session-reveal-content]'));
      $('[data-session-reveal-content]').hidden = false;
      $('[data-session-markers]').hidden = false;
    } catch (error) { setError(error.message); }
  });

  $$('[data-session-mark]').forEach((button) => button.addEventListener('click', () => {
    try {
      if (!runtime?.revealed) throw new Error('先翻面核对，再留下自评证据。');
      recordAndAdvance({
        response: $('[data-session-response]').value,
        mark: button.dataset.sessionMark,
        revealed: true
      });
    } catch (error) { setError(error.message); }
  }));

  $('[data-session-question-finish]').addEventListener('click', () => {
    try {
      const step = currentStep();
      const result = practiceCompletion(step);
      if (!result) throw new Error('指定题组还没有完整完成；不会提前推进。');
      recordAndAdvance({ deterministic_result: result, revealed: true });
    } catch (error) { setError(error.message); }
  });

  $('[data-session-source-finish]').addEventListener('click', () => {
    try { recordAndAdvance({ response: 'SOURCE_RETURNED' }); }
    catch (error) { setError(error.message); }
  });

  $('[data-session-blocked-return]').addEventListener('click', async () => {
    try {
      const step = currentStep();
      const reason = $('[data-session-blocked-reason]').textContent;
      const nextEvidence = appendPoliticsSessionEvidence(
        evidence,
        instruction,
        {
          step_id: step.step_id,
          recipe_type: step.recipe_type,
          target_refs: step.target_refs,
          question_ids: step.question_ids,
          blocked_reason: reason,
          elapsed_ms: elapsed(),
          observed_at: now()
        },
        { step_index: runtime.step_index, step_id: step.step_id, status: 'PAUSED_CHAT' }
      );
      persistEvidence(nextEvidence);
      persistRuntime({ ...runtime, status: 'PAUSED_CHAT', elapsed_ms: elapsed(), active_since: null });
      await copyText(nextEvidence);
      render();
    } catch (error) { setError(error.message); }
  });

  $('[data-session-chat-copy]').addEventListener('click', async () => {
    try {
      const step = currentStep();
      if (runtime.status === 'ACTIVE' && step?.recipe_type === 'CHAT_REPAIR_RETURN') {
        const nextEvidence = appendPoliticsSessionEvidence(
          evidence,
          instruction,
          {
            step_id: step.step_id,
            recipe_type: step.recipe_type,
            target_refs: step.target_refs,
            question_ids: step.question_ids,
            response: $('[data-session-response]')?.value || null,
            elapsed_ms: elapsed(),
            observed_at: now()
          },
          { step_index: runtime.step_index, step_id: step.step_id, status: 'PAUSED_CHAT' }
        );
        persistEvidence(nextEvidence);
        persistRuntime({ ...runtime, status: 'PAUSED_CHAT', elapsed_ms: elapsed(), active_since: null });
      }
      await copyText(evidence);
      render();
    } catch (error) { setError(error.message); }
  });

  $('[data-session-close]').addEventListener('click', () => {
    try { recordAndAdvance({ response: 'CHAT_EXPLICIT_CLOSE' }, { status: 'COMPLETED' }); }
    catch (error) { setError(error.message); }
  });

  $$('[data-session-copy-evidence]').forEach((button) => button.addEventListener('click', async () => {
    try { await copyText(evidence || emptyPoliticsSessionEvidence(instruction)); }
    catch (error) { setError(error.message); }
  }));

  window.addEventListener('keydown', (event) => {
    if (!instruction || runtime?.status !== 'ACTIVE' || event.metaKey || event.ctrlKey || event.altKey || event.repeat || event.isComposing) return;
    const target = event.target;
    if (target instanceof HTMLElement && (target.matches('input, textarea, select, button, a') || target.isContentEditable)) return;
    if (event.code === 'Space') {
      const step = currentStep();
      if (step && ['RECONSTRUCT', 'TARGETED_RECALL', 'PRECISION'].includes(step.recipe_type) && !runtime.revealed) {
        event.preventDefault();
        $('[data-session-reveal]').click();
      }
    }
  });

  window.addEventListener('pagehide', () => {
    try { saveDraft(); } catch {}
  });

  window.addEventListener('focus', render);

  window.addEventListener('storage', (event) => {
    if ([POLITICS_SESSION_KEYS.instruction, POLITICS_SESSION_KEYS.evidence, POLITICS_SESSION_KEYS.runtime, PRACTICE_KEYS.session].includes(event.key)) load();
  });

  load();
}
