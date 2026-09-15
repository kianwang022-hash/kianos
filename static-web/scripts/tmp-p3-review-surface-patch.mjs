import fs from 'node:fs';

function replaceOnce(text, before, after, label) {
  const count = text.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected 1 match, got ${count}`);
  return text.replace(before, after);
}

// 1) Project already-reviewed valuable distractors into the runtime question view.
{
  const path = 'static-web/src/lib/xizongQuestions.mjs';
  let text = fs.readFileSync(path, 'utf8');
  const before = `function normalizeExplanation(row) {\n  if (!row) return null;\n  return {\n    examTarget: String(row.exam_target || ''),\n    decisionAxis: String(row.decision_axis || ''),\n    correctOptionReason: String(row.correct_option_reason || ''),\n    commonFailureNode: String(row.common_failure_node || ''),\n    transferRule: String(row.transfer_rule || '')\n  };\n}`;
  const after = `function normalizeExplanation(row) {\n  if (!row) return null;\n  const valuableDistractors = Array.isArray(row.valuable_distractors)\n    ? row.valuable_distractors.map((item) => ({\n        option: String(item?.option || ''),\n        reason: String(item?.reason || '')\n      })).filter((item) => item.option && item.reason)\n    : [];\n  return {\n    examTarget: String(row.exam_target || ''),\n    decisionAxis: String(row.decision_axis || ''),\n    correctOptionReason: String(row.correct_option_reason || ''),\n    commonFailureNode: String(row.common_failure_node || ''),\n    transferRule: String(row.transfer_rule || ''),\n    valuableDistractors\n  };\n}`;
  text = replaceOnce(text, before, after, 'normalize explanation');
  fs.writeFileSync(path, text);
}

// 2) Add a SECOND_PASS-only, post-submit review surface to the existing Runtime.
{
  const path = 'static-web/src/components/XizongSystemExitRuntime.astro';
  let text = fs.readFileSync(path, 'utf8');

  text = replaceOnce(text,
`      <div class="xseAnswerTop">\n        <strong data-answer-result></strong>\n        <span>官方答案：<b data-correct-answer></b></span>\n      </div>\n      <div class="xseRepair" data-repair-panel hidden>`,
`      <div class="xseAnswerTop">\n        <strong data-answer-result></strong>\n        <span>官方答案：<b data-correct-answer></b></span>\n      </div>\n      <section class="xseSecondPassReview" data-second-pass-review hidden>\n        <span>二轮核对</span>\n        <strong data-second-pass-axis></strong>\n        <details data-second-pass-distractor-details hidden>\n          <summary>高价值干扰项</summary>\n          <ul data-second-pass-distractors></ul>\n        </details>\n        <p data-second-pass-transfer></p>\n        <p data-second-pass-empty hidden>当前没有审核过的二轮解析；保留这次作答证据，必要时交给 Chat，不补猜内容。</p>\n      </section>\n      <div class="xseRepair" data-repair-panel hidden>`,
'insert second-pass review markup');

  text = replaceOnce(text,
`    const correctAnswerNode = root.querySelector('[data-correct-answer]');\n    const repairPanel = root.querySelector('[data-repair-panel]');`,
`    const correctAnswerNode = root.querySelector('[data-correct-answer]');\n    const secondPassReview = root.querySelector('[data-second-pass-review]');\n    const secondPassAxis = root.querySelector('[data-second-pass-axis]');\n    const secondPassDistractorDetails = root.querySelector('[data-second-pass-distractor-details]');\n    const secondPassDistractors = root.querySelector('[data-second-pass-distractors]');\n    const secondPassTransfer = root.querySelector('[data-second-pass-transfer]');\n    const secondPassEmpty = root.querySelector('[data-second-pass-empty]');\n    const repairPanel = root.querySelector('[data-repair-panel]');`,
'bind second-pass review nodes');

  text = replaceOnce(text,
`    const showRepair = (question) => {\n      const explanation = question.explanation || {};\n      repairPanel.hidden = false;\n      repairAxis.textContent = explanation.decisionAxis ? \`判断轴：\${explanation.decisionAxis}\` : '这题先保留为 W/U，详细原因交给 Chat 继续判断。';\n      repairReason.textContent = explanation.correctOptionReason ? \`为什么：\${explanation.correctOptionReason}\` : '';\n      repairFailure.textContent = explanation.commonFailureNode ? \`常见断点：\${explanation.commonFailureNode}\` : '';\n      repairTransfer.textContent = explanation.transferRule ? \`迁移：\${explanation.transferRule}\` : '';`,
`    const showSecondPassReview = (question) => {\n      const isSecondPass = sweepState.round?.studyPhase === 'SECOND_PASS';\n      secondPassReview.hidden = !isSecondPass;\n      if (!isSecondPass) return;\n\n      const explanation = question?.explanation || null;\n      const distractors = Array.isArray(explanation?.valuableDistractors) ? explanation.valuableDistractors : [];\n      const hasReviewedReview = Boolean(explanation && (explanation.decisionAxis || distractors.length || explanation.transferRule));\n      secondPassAxis.textContent = explanation?.decisionAxis ? \`决定点：\${explanation.decisionAxis}\` : '';\n      secondPassTransfer.textContent = explanation?.transferRule ? \`迁移 / 条件变化：\${explanation.transferRule}\` : '';\n      secondPassDistractors.replaceChildren();\n      distractors.forEach((item) => {\n        const row = document.createElement('li');\n        row.textContent = \`\${item.option}：\${item.reason}\`;\n        secondPassDistractors.appendChild(row);\n      });\n      secondPassDistractorDetails.hidden = distractors.length === 0;\n      secondPassEmpty.hidden = hasReviewedReview;\n    };\n\n    const showRepair = (question) => {\n      const explanation = question.explanation || {};\n      const isSecondPass = sweepState.round?.studyPhase === 'SECOND_PASS';\n      repairPanel.hidden = false;\n      repairAxis.textContent = isSecondPass\n        ? (explanation.commonFailureNode ? \`修补点：\${explanation.commonFailureNode}\` : '这题继续保留为 W/U，交给 Chat 做最小修补。')\n        : (explanation.decisionAxis ? \`判断轴：\${explanation.decisionAxis}\` : '这题先保留为 W/U，详细原因交给 Chat 继续判断。');\n      repairReason.textContent = explanation.correctOptionReason ? \`为什么：\${explanation.correctOptionReason}\` : '';\n      repairFailure.textContent = !isSecondPass && explanation.commonFailureNode ? \`常见断点：\${explanation.commonFailureNode}\` : '';\n      repairTransfer.textContent = !isSecondPass && explanation.transferRule ? \`迁移：\${explanation.transferRule}\` : '';`,
'add phase-aware second-pass review and thin repair');

  text = replaceOnce(text,
`      answerPanel.hidden = true;\n      repairPanel.hidden = true;\n      correctJudge.hidden = true;`,
`      answerPanel.hidden = true;\n      secondPassReview.hidden = true;\n      secondPassDistractorDetails.hidden = true;\n      secondPassDistractors.replaceChildren();\n      secondPassEmpty.hidden = true;\n      repairPanel.hidden = true;\n      correctJudge.hidden = true;`,
'reset second-pass review before each question');

  text = replaceOnce(text,
`      submit.disabled = true;\n      if (currentCorrect) {`,
`      submit.disabled = true;\n      showSecondPassReview(currentQuestion);\n      if (currentCorrect) {`,
'show second-pass review only after submit');

  text = replaceOnce(text,
`.xseAnswerTop strong.isWrong{color:#a4473d}.xseRepair{`,
`.xseAnswerTop strong.isWrong{color:#a4473d}.xseSecondPassReview{display:grid;gap:7px;margin-top:10px;padding:11px 12px;border:1px solid #d7e4df;border-radius:10px;background:#f5f9f7}.xseSecondPassReview>span{color:#286c57;font-size:9px;font-weight:850;letter-spacing:.06em}.xseSecondPassReview>strong{font-size:12px;line-height:1.55}.xseSecondPassReview p{margin:0;color:#5f6d66;font-size:11px;line-height:1.55}.xseSecondPassReview details{font-size:11px}.xseSecondPassReview summary{cursor:pointer;color:#286c57;font-weight:800}.xseSecondPassReview ul{margin:6px 0 0;padding-left:20px;display:grid;gap:4px;line-height:1.5}.xseRepair{`,
'style second-pass review');

  fs.writeFileSync(path, text);
}

// 3) Extend Current acceptance with source-projection and fail-closed checks.
{
  const path = 'static-web/scripts/validate-xizong-learning.mjs';
  let text = fs.readFileSync(path, 'utf8');
  text = replaceOnce(text,
`assert(sweep.questions.length === 376, \`loaded-questions:\${sweep.questions.length}\`);\n\nconst testYear = sweep.years[0];`,
`assert(sweep.questions.length === 376, \`loaded-questions:\${sweep.questions.length}\`);\nconst richExplanation = sweep.questions.find((q) => q.explanation?.decisionAxis && q.explanation?.valuableDistractors?.length && q.explanation?.transferRule);\nassert(Boolean(richExplanation), 'reviewed-second-pass-explanation-not-projected');\nassert(richExplanation.explanation.valuableDistractors.every((item) => item.option && item.reason), 'valuable-distractor-projection-malformed');\nassert(sweep.questions.some((q) => !q.explanation), 'missing-explanation-path-not-represented');\n\nconst testYear = sweep.years[0];`,
'validate rich and missing explanation paths');

  text = replaceOnce(text,
`has(exitUi, 'deriveXizongQuestionIdsForCurrentRound(sweepState, eligible, [])', 'phase-aware-question-queue-derivation-missing');\nmatches(exitUi, /startSweep\\.disabled`,
`has(exitUi, 'deriveXizongQuestionIdsForCurrentRound(sweepState, eligible, [])', 'phase-aware-question-queue-derivation-missing');\nhas(questionLib, 'valuable_distractors', 'valuable-distractor-source-projection-missing');\nhas(questionLib, 'valuableDistractors', 'valuable-distractor-runtime-field-missing');\nhas(exitUi, 'data-second-pass-review hidden', 'second-pass-review-not-hidden-by-default');\nhas(exitUi, "sweepState.round?.studyPhase === 'SECOND_PASS'", 'second-pass-review-not-phase-gated');\nhas(exitUi, 'showSecondPassReview(currentQuestion);', 'second-pass-review-not-bound-to-submit');\nhas(exitUi, 'secondPassReview.hidden = true;', 'second-pass-review-not-reset-before-question');\nhas(exitUi, '当前没有审核过的二轮解析；保留这次作答证据，必要时交给 Chat，不补猜内容。', 'missing-explanation-does-not-fail-closed');\nmatches(exitUi, /startSweep\\.disabled`,
'validate phase-aware runtime source');
  fs.writeFileSync(path, text);
}

// 4) Make the real A2 browser journey exercise a rich reviewed explanation in SECOND_PASS.
{
  const path = 'static-web/scripts/test-xizong-a2-functional-journey.mjs';
  let text = fs.readFileSync(path, 'utf8');
  text = replaceOnce(text,
`  const target = payload.questions.find((q) => q?.relation?.primaryKpId && q?.relation?.blockId);\n  check(Boolean(target), 'reviewed_relation_question_exists');`,
`  const target = payload.questions.find((q) => q?.relation?.primaryKpId && q?.relation?.blockId && q?.explanation?.decisionAxis && q?.explanation?.valuableDistractors?.length && q?.explanation?.transferRule);\n  check(Boolean(target), 'reviewed_relation_second_pass_explanation_question_exists');`,
'target rich second-pass question');

  text = replaceOnce(text,
`  await exit.locator('[data-submit-answer]').click();\n  await exit.locator('[data-mark-uncertain]').click();\n  const firstPassState`,
`  await exit.locator('[data-submit-answer]').click();\n  check(!(await exit.locator('[data-second-pass-review]').isVisible()), 'first_pass_does_not_show_second_pass_review');\n  await exit.locator('[data-mark-uncertain]').click();\n  const firstPassState`,
'first pass review remains hidden');

  text = replaceOnce(text,
`  check((await exit.locator('[data-sweep-count]').textContent() || '').trim() === '1', 'stable_first_pass_questions_excluded_from_default_second_pass');\n\n  for (const letter of correctLetters) await exit.locator(\`[data-question-options] [data-option="\${letter}"]\`).click();\n  await exit.locator('[data-submit-answer]').click();\n  await exit.locator('[data-mark-stable]').click();`,
`  check((await exit.locator('[data-sweep-count]').textContent() || '').trim() === '1', 'stable_first_pass_questions_excluded_from_default_second_pass');\n  const secondPassReview = exit.locator('[data-second-pass-review]');\n  check(!(await secondPassReview.isVisible()), 'second_pass_review_hidden_before_submit');\n\n  for (const letter of correctLetters) await exit.locator(\`[data-question-options] [data-option="\${letter}"]\`).click();\n  await exit.locator('[data-submit-answer]').click();\n  check(await secondPassReview.isVisible(), 'second_pass_review_visible_only_after_submit');\n  check((await exit.locator('[data-second-pass-axis]').textContent() || '').includes(target.explanation.decisionAxis), 'second_pass_decision_axis_is_reviewed_source');\n  check(await exit.locator('[data-second-pass-distractors] li').count() === target.explanation.valuableDistractors.length, 'second_pass_valuable_distractors_projected');\n  check((await exit.locator('[data-second-pass-transfer]').textContent() || '').includes(target.explanation.transferRule), 'second_pass_transfer_rule_projected');\n  await exit.locator('[data-mark-stable]').click();`,
'browser phase-aware second-pass review');

  fs.writeFileSync(path, text);
}
