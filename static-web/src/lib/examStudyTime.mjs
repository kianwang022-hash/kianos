import { SUBJECTS } from './examOrchestrator.mjs';
import { aggregateStudyTime, buildStudyTimerReviewCandidates } from './studyTimer.mjs';
import { readPendingStudyTimerReviews } from './studyTimerReview.mjs';

const sum = (values) => values.reduce((total, value) => total + value, 0);

export function buildExamStudyTimeOverlay(storage, profile, day, now = Date.now()) {
  const baseProfile = structuredClone(profile);
  const timer = aggregateStudyTime(storage, { day, now });
  const reviewCandidates = [
    ...readPendingStudyTimerReviews(storage),
    ...buildStudyTimerReviewCandidates(storage, now)
  ];
  const manualBySubject = Object.fromEntries(SUBJECTS.map((subject) => [subject,
    sum(baseProfile.observations
      .filter((observation) => observation.day === day && observation.subject === subject)
      .map((observation) => observation.minutes))
  ]));
  const timerBySubject = Object.fromEntries(SUBJECTS.map((subject) => [subject,
    Math.max(0, Math.round((timer.bySubject[subject]?.ms || 0) / 60000))
  ]));

  const effectiveBySubject = {};
  const sourceBySubject = {};
  const nextObservations = baseProfile.observations.filter((observation) => observation.day !== day);

  for (const subject of SUBJECTS) {
    const manual = manualBySubject[subject] || 0;
    const automatic = timerBySubject[subject] || 0;
    const effective = Math.max(manual, automatic);
    effectiveBySubject[subject] = effective;
    sourceBySubject[subject] = automatic > manual ? 'timer' : manual > automatic ? 'manual' : automatic > 0 ? 'timer+manual-equal' : 'none';
    if (effective > 0) {
      nextObservations.push({
        id: `effective-${day}-${subject}`,
        day,
        subject,
        minutes: effective,
        confirmed: true
      });
    }
  }

  baseProfile.observations = nextObservations;
  const timerTotal = sum(Object.values(timerBySubject));
  const manualTotal = sum(Object.values(manualBySubject));
  const effectiveTotal = sum(Object.values(effectiveBySubject));

  return {
    profile: baseProfile,
    day,
    timerBySubject,
    manualBySubject,
    effectiveBySubject,
    timerTotal,
    manualTotal,
    effectiveTotal,
    sourceBySubject,
    usesTimer: timerTotal > 0,
    reviewCandidates
  };
}
