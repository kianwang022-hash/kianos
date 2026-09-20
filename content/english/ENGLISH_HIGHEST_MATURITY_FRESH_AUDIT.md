# English Highest Maturity — Fresh Independent / Anti-Anchored Re-audit #4

Date: 2026-09-21  
Repository: `kianwang022-hash/kianos`  
PR: #640  
Audit brief: `content/english/ENGLISH_HIGHEST_MATURITY_FRESH_AUDIT_BRIEF.md`

## Locked candidate

Fresh #4 locked the pre-audit candidate at:

`7e83a256ea15e6617d44268c9958a52e3a7b25bb`

The audit began from current canonical owners and performed the required novel all-green failure search before using prior defect families as re-attack dimensions.

## Verdict

```text
FAIL — material system-logic blind spots remain
```

```text
SYSTEM_LOGIC_ACCEPTED = NO
KIAN_SPECIFIC_CALIBRATED = NO
```

This is a system-logic FAIL. It is not caused by missing current score, throughput, 7-day retention, handwriting cost, paper fatigue, marker variance, or any other legitimate Real Learner U unknown.

## Material novel all-green failure

### Whole Paper productive-scoring closure was one-way

The pre-audit system could execute and seal a 100-point Whole Paper, but after release it only produced the 60-point Objective score:

```text
release.objective = scored / 60
release.productive.status = CHAT_REVIEW_REQUIRED
```

There was no typed return path from the Chat-owned Translation / Small Writing / Big Writing scoring result back into the existing Whole Paper session, and therefore no durable integrated 100-point score evidence produced by the real learner loop.

At the same time:

- the Whole Paper validator explicitly treated `CHAT_REVIEW_REQUIRED` after the /60 release as PASS;
- the browser acceptance treated “/60 is shown and productive work is routed to Chat” as PASS;
- `englishStepIsComplete(... full_paper ...)` treated `RELEASED` as complete;
- Forecast could accept an integrated `whole_paper.score_range`, but its validator supplied that object directly as synthetic test input rather than receiving it from an actual Whole Paper evidence producer.

So every local check could be green while the cross-layer closure remained broken.

## Why this is material

This failure could affect future Real Learner U in three ways.

1. **Wrong workflow completion / evidence interpretation**  
   A Whole Paper could be considered complete immediately after the 60-point Objective release even though 40 productive points were still unresolved.

2. **Manual hidden state / Fresh-Chat loss**  
   To carry a real integrated score forward, Kian or Chat would have to maintain productive score state outside the existing Whole Paper session. That violates the no-extra-score-sheet / no-manual-evidence-state attention-cost boundary and is vulnerable to Fresh-Chat loss.

3. **False aggregate confidence or constituent masking**  
   A manually supplied 100-point range could reach Forecast without the actual Whole Paper runtime proving how Translation / Small Writing / Big Writing scores were bound to that sealed attempt. Conversely, keeping only an aggregate range would hide a weak productive constituent behind the total.

This is therefore not “missing Kian calibration”. It is a defect in how future real evidence would be transported and interpreted.

## Smallest responsible owner

Primary responsible owner:

`static-web/src/lib/englishExamSession.mjs`

Direct completion / learner-surface consumers:

- `static-web/src/lib/englishSessionControl.mjs`
- `static-web/src/pages/english-exam/[id].astro`

Exact proof surfaces:

- `static-web/scripts/validate-english-exam-session.mjs`
- `static-web/scripts/test-english-exam-session-browser.mjs`

No new learner ledger, scheduler, mastery score, second Forecast, Home state, memory engine, or Website strategy owner was added.

## Bounded repair

Repaired code proof head:

`b6e3116e39a8cfb338debf327798dc3ccca6d914`

The existing Whole Paper session now has a bounded second evidence state:

```text
ACTIVE
→ SEALED
→ RELEASED          # Objective /60 available; productive score still unresolved
→ SCORED            # productive score return is bound and integrated evidence exists
```

The productive-score return is bound to:

- Whole Paper `session_id`;
- `paper_id`;
- paper `source_hash`;
- current productive-scoring identity `english.productive-scoring.v2`;
- Translation / Small Writing / Big Writing step identity;
- each productive step `source_hash`;
- explicit score ranges and confidence;
- explicit review mode;
- explicit resolved independent-rescore state.

Fail-closed behavior rejects:

- wrong session / paper / paper source;
- wrong productive step / source;
- stale or unbound productive-scoring version;
- out-of-range scores;
- invalid confidence / review mode;
- `requires_independent_rescore = true`;
- missing `requires_independent_rescore` state.

After a valid return:

- the same existing session stores productive constituent score ranges;
- Objective + productive ranges form the integrated 100-point range;
- English summary / Daily evidence projection preserves both constituent productive ranges and the integrated range;
- `full_paper` no longer counts as complete at Objective-only `RELEASED`;
- browser Whole Paper evidence remains `modality = TYPED` and `score_eligible = false`, so a typed 91–95 diagnostic range cannot manufacture protected paper-mode 85+ confidence.

The learner interaction is one bounded return into the existing exam session, not a manually maintained score sheet.

## Targeted proof

Exact code proof head:

`b6e3116e39a8cfb338debf327798dc3ccca6d914`

`English Exam Session` GitHub Actions result:

```text
SUCCESS
```

Passing affected proof includes:

- full-paper semantic validator;
- stale productive-scoring revision rejection;
- wrong productive source-identity rejection;
- unresolved or missing independent-rescore state rejection;
- Objective-only `RELEASED` does not close `full_paper`;
- valid productive score return moves the session to `SCORED`;
- productive constituent ranges survive the existing exam summary;
- integrated range survives the evidence packet;
- learner-site build;
- real browser Whole Paper journey;
- browser score-return persistence;
- integrated /100 display;
- typed Whole Paper remains formally score-ineligible.

On the same repaired line, previously accepted English evidence-fidelity, Forecast, Chat-control, productive-scoring and English↔Lexical validators also remained green before the final code freeze.

## Re-attack of earlier defect families

After the novel search, earlier defect families were re-attacked as ordinary dimensions rather than as search anchors.

No reopening was found for:

- learner-semantic source identity vs exact revision identity;
- Part B four-form coverage projection;
- Lexical delayed-retention / real-English transfer projection;
- stale productive-scoring revision fail-closed behavior in Forecast.

Fresh #4 nevertheless FAILS because the novel Whole Paper cross-layer closure defect above is independently material.

## Final state allowed in this Chat

This Chat has seen the Fresh #4 defect and its repair implementation. It is therefore ineligible to issue a Fresh PASS.

```text
SYSTEM_LOGIC_CANDIDATE = YES
FINAL_FRESH_REAUDIT #4 = FAIL @ 7e83a256ea15e6617d44268c9958a52e3a7b25bb
BOUNDED_REPAIR_PROOF #4 = PASS @ b6e3116e39a8cfb338debf327798dc3ccca6d914
FINAL_FRESH_REAUDIT #5 = REQUIRED
SYSTEM_LOGIC_ACCEPTED = NOT YET
KIAN_SPECIFIC_CALIBRATED = NO
```

Next mandatory gate:

> Run a genuinely new anti-anchored Fresh Independent re-audit #5 against the then-current candidate HEAD. Do not treat this repaired Chat as acceptance evidence.
