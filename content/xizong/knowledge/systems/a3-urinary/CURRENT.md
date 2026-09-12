# Xizong A3 Urinary Current

Role: independently continued Xizong System Work Cursor + restart entry  
Parent: `content/xizong/CURRENT.md`

This file does not own medical Core, Xizong learning semantics, Acceptance Truth, or Kian's learner progress.

---

## Work Cursor

**Scope:** A3 Urinary  
**Active / earliest unresolved stage:** `E — learner Evidence acceptance`  
**S status:** PASS — bounded Current reconstruction; 243 official questions, inventory SHA256 `bd8082bf9b82d00411f5d3dcaa09f56626c0c08b688e108f728f7da6e2f9b84e`.  
**K status:** PASS — Current System owner preserves 14 Blocks / 257 stable KPs / 75 Logic Groups.  
**L status:** PASS — original Lecture is external-primary on iPad / MarginNote; KianOS owns orientation / Recall / closure / compression / repair; Chat is adaptive companion.  
**P status:** PASS — A3 projects honestly through shared System/Block surfaces without duplicating the original Lecture or fabricating Question→KP mappings.  
**R status:** PASS — executable Block/System Runtime, source-contact gates, Recall/completion guards, 243-question sweep, reviewed-only W/U repair, browser resume and content-version invalidation are accepted; A3 Runtime probe + A1/A2 regressions + Astro build passed in run `34718165223` (#176).  
**Blocker:** no S/K/L/P/R blocker remains. Evidence semantics have not been accepted merely because Runtime can persist events and review plans.  
**Next action:** audit whether the evidence recorded by the accepted Runtime means the right thing. Verify first evidence vs repair evidence, W/U durability, review granularity, System/Block closure evidence, stale-evidence invalidation, fresh/holdout semantics, privacy, and that stable correct work creates no manufactured debt. Fix only concrete E mismatches; do not reopen Runtime mechanics unless evidence semantics require it.

---

## Accepted R closure

Runtime owners accepted for A3 include:

- `static-web/src/components/XizongBlockV6.astro`
- `static-web/src/components/XizongStudyEnhancer.astro`
- `static-web/src/components/XizongRuntimeStageGuard.astro`
- `static-web/src/components/XizongBlockEvidenceGuard.astro`
- `static-web/src/components/XizongSystemExitRuntime.astro`
- `static-web/src/components/XizongSystemRepairReturn.astro`
- `static-web/src/components/XizongSystemEvidenceGuard.astro`
- `static-web/src/components/XizongMemoryReviewV6.astro`
- `static-web/src/components/XizongLastLocation.astro`
- `static-web/scripts/validate-xizong-a3-runtime.mjs`

Accepted Runtime invariants:

- browser-local state is resumable but is not misrepresented as cross-device/server progress;
- original Lecture/MarginNote contact is a manual learner checkpoint, not inferred telemetry;
- KP Recall evidence cannot be recorded before that KP has formal learning contact;
- Block Recall evidence requires complete KP Learn + Recall;
- final Block completion additionally requires original-Lecture contact;
- System Recall completion requires all 14 Blocks complete;
- starting the System question sweep re-checks 14/14 Block completion and separately requires current System Recall + learner-selected holdout;
- stable correct question work has a direct pass path;
- W/U only enter repair;
- precise repair is reviewed-relation-only and missing mappings stay missing;
- repair tasks execute back at the owning Block and record `REPAIR_ONLY` rather than overwriting first-pass Recall;
- Block/System content version changes archive stale learner evidence instead of letting old completion survive Current truth changes.

R defect closed:

> System evidence versioning now includes Current System hash + A3 learning-support hash + deterministic hash of all 14 projected Block id/path/source contents + question scope/inventory/explanation/relation evidence. A changed Block therefore invalidates old System Recall/sweep/repair evidence rather than leaving it falsely current.

Validation:

GitHub Actions run `34718165223` (#176) on PR #45 branch head `f79957276c7682c424b880c419f3b53188e7bf12` passed:

- A1 learner contract;
- all A3 Source validators;
- A2 runtime contracts;
- **A3 runtime contracts**;
- Astro build.

---

## Frozen accepted substrate for E

Unless concrete evidence reopens an earlier dependency, E treats these as frozen:

- S/K/L/P/R = PASS;
- Source scope = 243 official questions across 2005–2026;
- 14 Blocks / 257 stable KPs / 75 Logic Groups;
- original Lecture/MarginNote remains primary continuous source surface;
- Block learner-facing unit remains Block / Logic Group continuity rather than isolated-card workflow;
- every stable KP receives first-pass active Recall before Block completion;
- System Recall occurs before the official System sweep and again after the question phase as required by the learning policy;
- learner-selected full-paper holdout remains protected;
- stable correct/reasoned question work may pass without forced repair;
- W/U repair is reviewed-only and smallest-sufficient;
- repair evidence is already technically separated from original Recall as `REPAIR_ONLY`;
- browser learner state is private/local and must not become shared Artifact or Acceptance Truth;
- content-version invalidation is already executable at Block and System level.

---

## Evidence questions that E must answer

1. **Review granularity** — is the learner-facing review unit appropriate for Xizong cognition, even when internal evidence is KP/question-level?
2. **First meaningful evidence** — is the learner's first-pass Recall / question result preserved instead of being overwritten by later repair or re-rating?
3. **Wrong / Uncertain semantics** — do W/U become durable evidence only when useful, without forcing stable correct items into debt?
4. **Repair ≠ mastery** — can successful repair improve the repair record without falsely rewriting the original learning/mastery evidence?
5. **Root cause vs cascade** — does reviewed Question→Knowledge routing avoid spreading one failure into unrelated KP/Block debt?
6. **Closure evidence** — do Block/System completion and System Recall rely on meaningful prerequisites rather than counters detached from learning?
7. **Fresh / holdout evidence** — are learner-selected protected whole-paper years kept out of normal System sweep, and is later fresh evidence distinguishable from remembered-item correction?
8. **Version validity** — are stale Block/System evidence and question-derived repair plans clearly archived/invalidated when Current truth changes?
9. **Privacy / truth separation** — do learner progress, W/U history, notes, holdout choice and review state stay private learner evidence rather than shared product truth?
10. **No manufactured confirmation** — can later irrelevant material neither falsely close nor reopen a pending target without relevant evidence?

---

## Likely Evidence owners

Read only as needed:

- `static-web/src/components/XizongMemoryReviewV6.astro`
- `static-web/src/components/XizongBlockEvidenceGuard.astro`
- `static-web/src/components/XizongSystemEvidenceGuard.astro`
- `static-web/src/components/XizongSystemExitRuntime.astro`
- `static-web/src/components/XizongSystemRepairReturn.astro`
- `static-web/scripts/validate-xizong-a2-evidence.mjs`
- `static-web/scripts/validate-xizong-a3-runtime.mjs`
- shared study policy evidence / memory sections only when required.

Do not load medical Blocks or historical Source assets during ordinary E work unless a specific evidence claim requires them.

---

## Frozen / out of scope during E

- do not reopen S/K/L/P/R without concrete contradictory evidence;
- do not change medical Core to simplify evidence bookkeeping;
- do not convert internal KP/question evidence into a compulsory card-by-card learner workflow;
- do not hard-code Kian's personal holdout years, progress, W/U history, notes or review schedule into shared Current;
- do not infer mastery from repair success;
- do not infer Kian has started A3;
- do not claim learner-ready until E passes;
- U remains real learner validation only.

---

## Truth references

### Artifact Truth

- Source scope → `content/xizong/knowledge/learner/a3-urinary-question-scope.json`
- System Knowledge → `content/xizong/knowledge/systems/a3-urinary/system.json`
- medical Core → `content/xizong/knowledge/systems/a3-urinary/blocks/`
- lane Learning constitution → `content/xizong/LEARNING_CONTRACT.md`
- shared study policy → `content/xizong/knowledge/learner/study-policy.json`
- A3 learning support → `content/xizong/knowledge/learner/a3-urinary-learning.json`
- Projection / Runtime / evidence mechanics → `static-web/`

### Acceptance Truth

`content/xizong/knowledge/systems/a3-urinary/ACCEPTANCE.md`

### Learner Truth

Private learner/browser/conversation evidence only.