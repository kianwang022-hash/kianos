const roundScore = (value) => Math.round((Number(value) + Number.EPSILON) * 10) / 10;

export function xizongPaperPointsForNumber(format, number) {
  const n = Number(number);
  if (!Number.isInteger(n) || n < 1) return 0;
  const row = (Array.isArray(format?.scoring_segments) ? format.scoring_segments : [])
    .find((segment) => n >= Number(segment?.start) && n <= Number(segment?.end));
  return row ? Number(row.points || 0) : 0;
}

export function xizongPaperRuleTotal(format) {
  return roundScore((Array.isArray(format?.scoring_segments) ? format.scoring_segments : [])
    .reduce((sum, row) => {
      const start = Number(row?.start);
      const end = Number(row?.end);
      const points = Number(row?.points || 0);
      if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start || !Number.isFinite(points) || points <= 0) return sum;
      return sum + (end - start + 1) * points;
    }, 0));
}

const letters = (value) => (String(value || '').toUpperCase().match(/[A-Z]/g) || []).sort();
const same = (a, b) => a.length === b.length && a.every((value, index) => value === b[index]);

export function xizongPaperQuestionIsCorrect(question, result) {
  if (!question || !result) return false;
  return same(letters(result.selected), letters(question.correctAnswer));
}

export function scoreXizongPaperResults(format, questions, results = {}) {
  const rows = Array.isArray(questions) ? questions : [];
  let earnedScore = 0;
  let answeredCount = 0;
  let correctCount = 0;
  let wrongCount = 0;

  for (const question of rows) {
    const id = String(question?.questionId || '');
    const result = results?.[id];
    if (!result) continue;
    answeredCount += 1;
    if (xizongPaperQuestionIsCorrect(question, result)) {
      correctCount += 1;
      earnedScore += xizongPaperPointsForNumber(format, question?.number);
    } else {
      wrongCount += 1;
    }
  }

  const questionCount = rows.length;
  const maxScore = Number(format?.max_score || xizongPaperRuleTotal(format) || 0);
  return {
    answeredCount,
    correctCount,
    wrongCount,
    unansweredCount: Math.max(0, questionCount - answeredCount),
    questionCount,
    earnedScore: roundScore(earnedScore),
    maxScore: roundScore(maxScore)
  };
}

export function sealXizongPaperState(state, summary, now = new Date().toISOString()) {
  return {
    ...(state && typeof state === 'object' ? state : {}),
    paperSeal: {
      sealedAt: String(now),
      reviewUnlockedAt: '',
      summary: {
        answeredCount: Number(summary?.answeredCount || 0),
        correctCount: Number(summary?.correctCount || 0),
        wrongCount: Number(summary?.wrongCount || 0),
        unansweredCount: Number(summary?.unansweredCount || 0),
        questionCount: Number(summary?.questionCount || 0),
        earnedScore: Number(summary?.earnedScore || 0),
        maxScore: Number(summary?.maxScore || 0)
      }
    }
  };
}

export function unlockXizongPaperReview(state, now = new Date().toISOString()) {
  if (!state?.paperSeal?.sealedAt) return state;
  return {
    ...state,
    paperSeal: {
      ...state.paperSeal,
      reviewUnlockedAt: String(now)
    }
  };
}
