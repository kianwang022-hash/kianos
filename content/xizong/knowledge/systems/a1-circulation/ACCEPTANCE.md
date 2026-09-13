# Xizong A1 Circulation Acceptance

Status: CURRENT  
Scope: A1 Circulation  
Standard: root `LEARNING_ACCEPTANCE.md`  
Role: A1 scoped Acceptance Truth

This file owns current S/K/L/P/R/E/U readiness claims for A1 Circulation. It does not own medical Core, lane/System learning semantics, Work Cursor, or Kian's private learner state.

---

## Current accepted gate status

```text
S  PASS — fresh re-accepted
K  PASS — fresh re-accepted after semantic repair
L  PASS — fresh re-accepted
P  PASS — fresh re-accepted after Projection repair
R  PASS — prior accepted claim; fresh re-audit ACTIVE
E  PASS — prior accepted claim; fresh re-audit downstream-frozen behind R
U  UNTESTED here — real learner use is owned by another workflow
```

Allowed current conclusion:

> **A1 remains Module-ready for learner test under accepted S–E evidence. The fresh re-acceptance has now re-established S/K/L, closed Content, and re-accepted P after repairing actual learner-facing defects. Fresh Runtime is active. No engineering evidence in this file implies that Kian has learned A1.**

Fresh audit does not automatically revoke an existing PASS; a gate is downgraded only when new evidence demonstrates a material defect.

---

## Fresh re-acceptance progress

```text
S        RE-ACCEPTED
K        RE-ACCEPTED after semantic repair
L        RE-ACCEPTED
Content  CLOSED
P        RE-ACCEPTED after learner-facing repair
R        ACTIVE fresh attack
E        PENDING fresh attack
U        real learner only / external workflow
```

`Content` is a construction stage, not an eighth acceptance gate.

---

## S｜PASS after fresh attack

Evidence mode: **STRUCTURAL + ADVERSARIAL**  
Independence: **SELF + AUTHORITATIVE_PROJECT_SOURCE_BOUNDARY**

Fresh Source-boundary work established:

- current formal AI-readable Lecture layer = Physiology / Pathology / Internal Medicine / Surgery / Biochemistry MD sources;
- frozen Global coverage assigns **850 unique Primary Outline items** to A1 with `orphan_scope = 0` and `duplicate_primary = 0` at that layer;
- no independent current-Source aortic-disease unit authorizes a new A1 Block;
- A1 owns normal hemostasis/thrombosis mechanics and the current-source shock/DIC interface without inventing the complete C/Hematology DIC owner.

Locator boundary remains explicit:

- retained A1 first-pass source pack = **312 KP**;
- **158 `SOURCE_EXACT` + 154 `SOURCE_PENDING`** locator records;
- pending locator debt is not represented as fictitious exact page provenance.

Therefore S PASS means the authoritative Source/coverage boundary is usable without silent guessing; it does not mean all 312 KPs have literal page-level deep links.

---

## K｜PASS after fresh repair

Evidence mode: **STRUCTURAL + ADVERSARIAL + EXECUTED_COMPATIBILITY**  
Independence: **SELF**

Fresh K attack independently challenged the System mother model, 12 natural Block units, cross-System ownership and Failure Modes.

Verdict:

- **KEEP 12 Blocks / 312 stable KPs**;
- demote duplicate System-level `outflow_obstruction` primitive;
- filling restriction covers intrinsic myocardial relaxation/compliance failure and external pericardial restriction;
- resistance/pathway failure absorbs fixed narrowing/obstruction;
- add the previously missing microcirculation-exchange / lymph-return failure already present in B1 Core;
- retain **7** System Failure Modes without architecture growth.

Post-repair falsification covered pump failure, filling restriction, valve disease, high resistance/conduit obstruction, arrhythmia, volume/distribution shock and exchange/lymph edema. Existing Xizong compatibility validators and Astro build passed after repair.

K PASS is a Knowledge/System-model claim, not a substitute for Content closure.

---

## L｜PASS after fresh attack

Evidence mode: **STRUCTURAL + ADVERSARIAL**  
Independence: **SELF**

Owners inspected:

- `content/xizong/LEARNING_CONTRACT.md`;
- `content/xizong/knowledge/learner/study-policy.json`;
- `content/xizong/knowledge/learner/a1-circulation-learning.json`.

Accepted learner model:

```text
KianOS System / Block orientation + selective cue
→ iPad / MarginNote original Lecture continuous learning
→ KianOS active retrieval / Logic Group closure
→ Block Recall
→ after real completion of all A1 Blocks: pre-question System Recall
→ official System question sweep
→ Wrong / Uncertain smallest-sufficient repair
→ short post-question System reconstruction
```

Rejected alternatives:

1. KianOS as a continuous second Lecture reader;
2. KP-card-first learning before continuous Lecture contact.

Both fragment the learner model and violate approved surface ownership. No fresh L defect remains.

---

## Fresh Content Closure｜COMPLETE

Evidence mode: **STRUCTURAL + ADVERSARIAL + AUTHORITATIVE_SOURCE_RECONCILIATION**  
Independence: **SELF + AUTHORITATIVE_PROJECT_SOURCE**

Fresh Content attack followed:

```text
current Study Lecture Source
→ current Outline / Coverage ownership
→ canonical Block / KP asset
→ ownership / burden / negative-space attack
```

Three bounded batches closed:

```text
C1  B1–B4   PASS   (B1 after existing targeted transfer-boundary repair)
C2  B5–B9   PASS   (B9 locator debt retained, not fabricated)
C3  B10–B12 PASS
```

Strongest attacks included normal mechanics/regulation/electrophysiology/hemostasis; HTN/atherosclerosis/ACS/valves/cardiomyopathy/pericardium/peripheral vascular disease; arrhythmia/HF/shock/arrest. Current Source/Outline ownership supported the retained medical content.

Closure verdict:

- **12 / 12 Blocks closed**;
- **312 stable KPs preserved**;
- no new Block, KP split/merge/renumber or broad medical rewrite justified;
- no material new Lecture/Outline hole found after B1 repair;
- `158 SOURCE_EXACT / 154 SOURCE_PENDING` remains explicit locator debt.

---

## P｜PASS after fresh repair

Evidence mode: **STRUCTURAL + ADVERSARIAL + EXECUTED_COMPATIBILITY**  
Independence: **SELF**

Fresh P inspected actual A1 learner-facing implementation rather than source-string presence alone.

### Defect 1｜KP-by-KP Lecture switching

Previous Block projection implemented:

```text
Logic Group
→ KP1 go to Lecture
→ return / mark learned
→ KP2 go to Lecture
→ ...
```

This contradicted the accepted L requirement for continuous original-Lecture learning within a Logic Group.

Repair in `XizongBlockV6.astro`:

```text
学习节定位
→ MarginNote 原讲义连续完成这一节
→ 一次回 KianOS
→ 本节 KP Recall
→ 本节 closure
→ 下一学习节
```

Stable KP identities and medical content were unchanged.

### Defect 2｜future-stage / answer leakage

The old shared guard blocked recording a Recall rating before formal learning but did not fully block navigation to future Recall/Reveal stages.

Repair in `XizongRuntimeStageGuard.astro` now fails closed before:

- KP Recall stage when no newly learned KP exists;
- `Reveal Core` for an unlearned KP;
- Block Recall until all KP learning-contact + Recall evidence exists;
- Block completion until original-Lecture confirmation + KP Recall + Block Recall exists;
- System Recall/reveal/complete and System sweep until all Blocks are complete.

### Defect 3｜governance metadata in learner chrome

Xizong learner pages previously exposed `Canonical projection`, object IDs, source path/hash and `System Current`. Base layout now keeps those governance/provenance details off the primary Xizong learner chrome while preserving canonical provenance in repository owners and validators.

### Durable P evidence

- `static-web/scripts/validate-xizong-a1-projection.mjs` added to the standard Xizong QA workflow;
- QA #345: A1 learner + A1 fresh Projection PASS; stale A2 validator expectation exposed;
- QA #346: A1 P PASS + updated A2 PASS; stale A3 validator expectation exposed;
- A2/A3 probes were updated to the same shared Logic Group/stage-guard contract without changing their medical/Learning owners;
- **QA #347 / run `34768893981` completed SUCCESS**, including A1 fresh Projection contracts, A2/A3 regressions, shared repair inbox, B probes and Astro build.

Strongest P falsification attempted:

- direct future-stage navigation;
- early formal-answer reveal;
- bypassing original-Lecture contact;
- raw file/question order versus Logic Group order;
- learner-surface governance leakage;
- regression against A2/A3 using the same shared components.

Fresh P verdict: **PASS**. Projection was the earliest responsible defect owner; no L/Content rollback was required.

---

## R｜prior PASS / fresh attack ACTIVE

Fresh R must execute realistic browser-local transitions rather than infer readiness from code shape.

Required journeys:

- clean Block with zero manufactured progress;
- Logic Group entry without implicit learning evidence;
- early KP Recall / Reveal rejection;
- one Logic Group formal Lecture contact marks only that group's KPs learned;
- group-scoped Recall and closure;
- refresh/resume preserving stage/group/KP state;
- full-Block Recall and completion gates;
- Continue return to the last real route;
- System Recall gate before/after all 12 Blocks are complete;
- stale/malformed state containment and version invalidation where applicable.

Engineering fixture state may be used to reach late transitions, but it is test evidence only, never Kian's Learner Truth.

E fresh attack remains downstream-frozen until R closes.

---

## Known cross-System debt

DIC exposes a C/Hematology reconciliation debt: A1's own shock-DIC interface is sufficient for A1; a complete C disease model remains C's future problem. This does not block A1.

---

## U boundary

U is not executed in this Chat. The user has assigned real learner validation to another workflow. No engineering build, validator or browser simulation may write U PASS here.

---

## Reopen rule

Reopen only the earliest responsible gate/object when fresh evidence identifies a concrete defect; freeze only its dependent chain.

---

## Truth boundaries

### Artifact Truth

- System owner → `content/xizong/knowledge/systems/a1-circulation/system.json`
- medical Core → `content/xizong/knowledge/systems/a1-circulation/blocks/`
- lane Learning semantics → `content/xizong/LEARNING_CONTRACT.md`
- shared/System Learning support → `content/xizong/knowledge/learner/`
- learner-facing Projection/Runtime → Xizong surfaces under `static-web/`

### Work Cursor

`content/xizong/knowledge/systems/a1-circulation/CURRENT.md`

### Learner Truth

Private learner/browser/conversation evidence only.
