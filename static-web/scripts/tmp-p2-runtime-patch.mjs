import fs from 'node:fs';

const runtimePath = 'static-web/src/components/XizongSystemExitRuntime.astro';
const browserPath = 'static-web/scripts/test-xizong-a2-functional-journey.mjs';

function replaceOnce(text, before, after, label) {
  const count = text.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected 1 match, got ${count}`);
  return text.replace(before, after);
}

let runtime = fs.readFileSync(runtimePath, 'utf8');
runtime = replaceOnce(runtime,
`    startNextXizongQuestionRound,\n    xizongStudyPhaseLabel\n`,
`    startNextXizongQuestionRound,\n    deriveXizongSecondPassQuestionIds,\n    deriveXizongQuestionIdsForCurrentRound,\n    xizongStudyPhaseLabel\n`,
'import queue helpers');

runtime = replaceOnce(runtime,
`        <button type="button" data-start-next-round>开始第二轮（保留本轮记录）</button>\n`,
`        <button type="button" data-start-next-round>开始第二轮重点队列</button>\n        <button type="button" class="secondary" data-start-next-round-full>完整重刷本 System</button>\n`,
'add full resweep control');

runtime = replaceOnce(runtime,
`    const nextRoundButton = root.querySelector('[data-start-next-round]');\n`,
`    const nextRoundButton = root.querySelector('[data-start-next-round]');\n    const nextRoundFullButton = root.querySelector('[data-start-next-round-full]');\n`,
'query full resweep control');

runtime = replaceOnce(runtime,
`    const computeActive = () => data.questions.filter((question) => !holdoutYears.includes(Number(question.year)));\n`,
`    const eligibleQuestions = () => data.questions.filter((question) => !holdoutYears.includes(Number(question.year)));\n    const computeActive = () => {\n      const eligible = eligibleQuestions();\n      const activeIds = new Set(deriveXizongQuestionIdsForCurrentRound(sweepState, eligible, []));\n      return eligible.filter((question) => activeIds.has(String(question.questionId)));\n    };\n`,
'derive current round questions');

runtime = replaceOnce(runtime,
`      const summary = root.querySelector('[data-sweep-summary]');\n      if (summary) summary.textContent = holdoutYears.length\n        ? \`已保留整卷：\${holdoutYears.join('、')}。\${phaseLabel}实际可用 \${activeQuestions.length} / \${data.questionCount} 道。\`\n        : \`锁定整卷后，系统会自动排除这些年份；剩余题按\${phaseLabel}任务做 sweep。\`;\n      if (nextRoundButton) {\n        nextRoundButton.textContent = phase === 'FIRST_PASS'\n          ? '开始第二轮（保留本轮记录）'\n          : phase === 'SECOND_PASS'\n            ? '开始后期复习轮（保留此前记录）'\n            : '再开一轮后期复习（保留此前记录）';\n      }\n`,
`      const summary = root.querySelector('[data-sweep-summary]');\n      if (summary) {\n        if (phase === 'SECOND_PASS' && sweepState.round?.queueMode !== 'FULL_RESWEEP') {\n          summary.textContent = \`二轮默认只回收一轮 Wrong / Uncertain；当前重点队列 \${activeQuestions.length} 道。没有 reviewed Mapping 也不会阻塞作答。\`;\n        } else {\n          summary.textContent = holdoutYears.length\n            ? \`已保留整卷：\${holdoutYears.join('、')}。\${phaseLabel}实际可用 \${activeQuestions.length} / \${data.questionCount} 道。\`\n            : \`锁定整卷后，系统会自动排除这些年份；剩余题按\${phaseLabel}任务做 sweep。\`;\n        }\n      }\n      if (nextRoundButton) {\n        if (phase === 'FIRST_PASS') {\n          const targetCount = deriveXizongSecondPassQuestionIds(sweepState, data.questions, holdoutYears).length;\n          nextRoundButton.textContent = targetCount\n            ? \`开始第二轮重点队列（\${targetCount} 题）\`\n            : '二轮重点队列为空';\n          nextRoundButton.disabled = targetCount === 0;\n        } else {\n          nextRoundButton.disabled = false;\n          nextRoundButton.textContent = phase === 'SECOND_PASS'\n            ? '开始后期复习轮（保留此前记录）'\n            : '再开一轮后期复习（保留此前记录）';\n        }\n      }\n      if (nextRoundFullButton) {\n        nextRoundFullButton.hidden = phase !== 'FIRST_PASS';\n        nextRoundFullButton.textContent = '二轮完整重刷（显式选择）';\n      }\n`,
'render targeted queue state');

runtime = replaceOnce(runtime,
`    nextRoundButton?.addEventListener('click', () => {\n      activeQuestions = computeActive();\n      let nextState;\n      try {\n        nextState = startNextXizongQuestionRound(\n          sweepState,\n          activeQuestions.map((question) => question.questionId)\n        );\n      } catch (error) {\n        console.error(error);\n        return;\n      }\n      if (!writeJson(sweepKey, nextState)) {\n        window.alert('本机保存失败：没有开启下一轮，上一轮记录保持不变。');\n        return;\n      }\n      sweepState = nextState;\n      renderStats();\n      renderQuestion();\n      workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });\n    });\n`,
`    const startNextRound = (queueMode = 'TARGETED') => {\n      activeQuestions = computeActive();\n      let nextState;\n      try {\n        nextState = startNextXizongQuestionRound(\n          sweepState,\n          activeQuestions.map((question) => question.questionId),\n          {},\n          { queueMode }\n        );\n      } catch (error) {\n        console.error(error);\n        return;\n      }\n      if (!writeJson(sweepKey, nextState)) {\n        window.alert('本机保存失败：没有开启下一轮，上一轮记录保持不变。');\n        return;\n      }\n      sweepState = nextState;\n      renderStats();\n      renderQuestion();\n      workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });\n    };\n    nextRoundButton?.addEventListener('click', () => startNextRound('TARGETED'));\n    nextRoundFullButton?.addEventListener('click', () => startNextRound('FULL_RESWEEP'));\n`,
'start targeted/full next round');

fs.writeFileSync(runtimePath, runtime);

let browser = fs.readFileSync(browserPath, 'utf8');
browser = replaceOnce(browser,
`  check((await exit.locator('[data-start-next-round]').textContent() || '').includes('第二轮'), 'done_surface_offers_second_pass_without_new_runtime');\n  await exit.locator('[data-start-next-round]').click();\n\n  const secondRoundStart = await page.evaluate(() => JSON.parse(localStorage.getItem('kianos:xizong:system-question-sweep:respiratory:v1') || '{"results":{}}'));\n  const preservedAfterRoundStart = (secondRoundStart.attemptHistory || []).filter((event) => event.question_id === target.questionId);\n  check(secondRoundStart.round?.studyPhase === 'SECOND_PASS' && secondRoundStart.round?.ordinal === 2, 'second_pass_round_started_in_same_runtime');\n  check(Object.keys(secondRoundStart.results || {}).length === 0, 'next_round_resets_only_session_results');\n  check(preservedAfterRoundStart.length === 1 && JSON.stringify(preservedAfterRoundStart[0]) === firstAttemptSnapshot, 'next_round_preserves_first_attempt');\n\n  // Walk round 2 through the same Runtime until the reviewed target re-enters.\n  // Every prior second-pass result is a real browser attempt, not fixture state.\n  let secondPassTargetReached = false;\n  for (let guard = 0; guard <= payload.questions.length; guard += 1) {\n    const question = await currentPayloadQuestion();\n    if (!question) break;\n    if (question.questionId === target.questionId) {\n      secondPassTargetReached = true;\n      break;\n    }\n    await answerCurrentStable();\n  }\n  check(secondPassTargetReached, 'same_question_reenters_in_second_pass');\n  check((await exit.locator('[data-study-phase]').textContent() || '').includes('二轮'), 'runtime_reports_second_pass');\n`,
`  check((await exit.locator('[data-start-next-round]').textContent() || '').includes('重点队列'), 'done_surface_offers_targeted_second_pass');\n  check(await exit.locator('[data-start-next-round-full]').isVisible(), 'done_surface_keeps_explicit_full_resweep_option');\n  await exit.locator('[data-start-next-round]').click();\n\n  const secondRoundStart = await page.evaluate(() => JSON.parse(localStorage.getItem('kianos:xizong:system-question-sweep:respiratory:v1') || '{"results":{}}'));\n  const preservedAfterRoundStart = (secondRoundStart.attemptHistory || []).filter((event) => event.question_id === target.questionId);\n  check(secondRoundStart.round?.studyPhase === 'SECOND_PASS' && secondRoundStart.round?.ordinal === 2, 'second_pass_round_started_in_same_runtime');\n  check(secondRoundStart.round?.queueMode === 'TARGETED', 'second_pass_defaults_to_targeted_queue');\n  check(Object.keys(secondRoundStart.results || {}).length === 0, 'next_round_resets_only_session_results');\n  check(preservedAfterRoundStart.length === 1 && JSON.stringify(preservedAfterRoundStart[0]) === firstAttemptSnapshot, 'next_round_preserves_first_attempt');\n  check((await exit.locator('[data-study-phase]').textContent() || '').includes('二轮'), 'runtime_reports_second_pass');\n  check((await exit.locator('[data-question-meta]').textContent() || '').includes(String(target.number)), 'targeted_second_pass_opens_prior_uncertain_immediately');\n  check((await exit.locator('[data-sweep-count]').textContent() || '').trim() === '1', 'stable_first_pass_questions_excluded_from_default_second_pass');\n`,
'browser targeted second pass');

fs.writeFileSync(browserPath, browser);
