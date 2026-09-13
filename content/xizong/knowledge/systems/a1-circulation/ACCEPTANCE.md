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
R  PASS — fresh browser Runtime journey executed
E  PASS — fresh browser Evidence journey executed
U  UNTESTED — real learner use only
```

`Content` is a construction stage, not an eighth acceptance gate; A1 Content is **CLOSED**.

Allowed current conclusion:

> **A1 engineering is closed through Evidence. S/K/L/P/R/E are accepted on the current learning contract. U is intentionally UNTESTED and cannot be inferred from engineering fixtures, CI, browser automation, seeded local state, or prior acceptance history.**

---

## Final engineering closure receipt

Fresh closeout revision:

`97ec341f3fe510fd0cb4b5e2aeffa94a292fa6ff`

Standard workflow:

- `Static Web Xizong QA #365`
- run `34775611247`
- conclusion: **SUCCESS**

Executed evidence on that revision:

```text
A1 learner contract                 PASS
A1 Projection contract              PASS
A1 persistence / Evidence contract  PASS
A2/A3 shared contract regressions   PASS
Astro build                         PASS
A1 browser Runtime journey          PASS
A1 Runtime evidence upload          PASS
A1 Evidence validation              PASS
A1 browser Evidence journey         PASS
A1 Evidence artifact upload         PASS
Evidence build                      PASS
Final static build                  PASS
```

This is the closing R/E receipt. Older workflow reds and older SHAs are historical evidence only and do not override this fresh executed result.

---

## S｜PASS after fresh attack

Evidence mode: **STRUCTURAL + ADVERSARIAL**  
Independence: **SELF + AUTHORITATIVE_PROJECT_SOURCE_BOUNDARY**

Accepted Source boundary:

- current formal AI-readable Lecture layer = Physiology / Pathology / Internal Medicine / Surgery / Biochemistry MD sources;
- frozen Global coverage assigns **850 unique Primary Outline items** to A1 with `orphan_scope = 0` and `duplicate_primary = 0` at that layer;
- A1 retains **12 natural Blocks / 312 stable KPs**;
- retained locator state remains **158 `SOURCE_EXACT` + 154 `SOURCE_PENDING`**;
- pending locator debt remains explicit and is not represented as fictitious page-level provenance.

S PASS means the current Source/coverage boundary is usable without silent guessing. It does not mean all 312 KPs have exact page locators.

---

## K｜PASS after fresh repair

Evidence mode: **STRUCTURAL + ADVERSARIAL + EXECUTED_COMPATIBILITY**  
Independence: **SELF**

Fresh K falsification retained the 12-Block / 312-KP architecture and repaired the System mother model without architecture growth.

Accepted high-level result:

- duplicate System-level `outflow_obstruction` primitive demoted;
- filling restriction covers intrinsic relaxation/compliance failure and external pericardial restriction;
- resistance/pathway failure absorbs fixed narrowing/obstruction;
- microcirculation-exchange / lymph-return failure is represented where already supported by B1 Core;
- **7 System Failure Modes** retained.

K PASS is a Knowledge/System-model claim, not learner mastery.

---

## L｜PASS after fresh attack

Evidence mode: **STRUCTURAL + ADVERSARIAL**  
Independence: **SELF**

Accepted learner model:

```text
KianOS System / Block orientation + selective cue
→ iPad / MarginNote original Lecture continuous learning
→ KianOS Logic Group active retrieval / closure
→ Block Recall
→ after real completion of all A1 Blocks: pre-question System Recall
→ official System question sweep
→ Wrong / Uncertain smallest-sufficient repair
→ short post-question System reconstruction
```

Rejected models remain rejected:

1. KianOS as a continuous second Lecture reader;
2. KP-card-first learning before continuous original-Lecture contact.

---

## Content Closure｜CLOSED

Evidence mode: **STRUCTURAL + ADVERSARIAL + AUTHORITATIVE_SOURCE_RECONCILIATION**

Fresh Content attack closed all three bounded batches:

```text
C1  B1–B4   PASS
C2  B5–B9   PASS
C3  B10–B12 PASS
```

Closure verdict:

- **12 / 12 Blocks closed**;
- **312 stable KPs preserved**;
- no justified Block/KP split, merge, renumber, or broad medical rewrite;
- no material new Lecture/Outline hole remained after bounded repairs;
- `158 SOURCE_EXACT / 154 SOURCE_PENDING` remains explicit locator debt.

---

## P｜PASS after fresh repair

Evidence mode: **STRUCTURAL + ADVERSARIAL + EXECUTED_COMPATIBILITY**

Fresh P repaired learner-facing projection defects while preserving medical ownership and stable KP identities.

Accepted Projection contract:

```text
学习节定位
→ MarginNote 原讲义连续完成这一节
→ 一次回 KianOS
→ 本节 KP Recall
→ 本节 closure
→ 下一学习节
```

Shared stage guards fail closed against future-stage / answer leakage. Learner-facing chrome no longer exposes governance metadata as primary study content.

Durable P validator:

`static-web/scripts/validate-xizong-a1-projection.mjs`

P remains PASS under the final #365 standard QA execution.

---

## R｜PASS — fresh browser execution

Evidence mode: **EXECUTED_BROWSER_RUNTIME**  
Independence: **ENGINEERING_FIXTURE_ONLY; NOT LEARNER_TRUTH**

Fresh execution first exposed a real final-completion defect. The browser journey showed that the fine-grained learning path itself was correct:

- clean start did not manufacture progress;
- Logic Group entry did not imply learning;
- formal original-Lecture contact was recorded at Logic Group scope;
- KP Recall remained group-scoped and complete;
- all owned KPs received formal contact and Recall evidence;
- Block Recall completed;
- legacy Block-level `lectureRead` UI was absent.

The only remaining failure was final completion unlock. Root cause was a hidden legacy localStorage requirement in `XizongBlockV6.astro`:

```text
circulationLectureRead:<objectId> == true
```

That state no longer represented a legitimate learning event, because Logic Group original-Lecture contact is the canonical formal-contact evidence.

Repair removed the hidden dependency. Final completion semantics are now exactly:

```text
all owned KP formal Lecture contact
+ all owned KP Recall evidence
+ Block Recall
= Block completion eligible
```

No duplicate Block-level `lectureRead` confirmation exists in the learner surface or completion gate.

Durable browser journey:

`static-web/scripts/test-xizong-a1-browser-journey.mjs`

Fresh verdict: **R PASS** under QA #365.

---

## E｜PASS — fresh browser Evidence execution

Evidence mode: **EXECUTED_BROWSER_EVIDENCE + CONTRACT_VALIDATION**  
Independence: **ENGINEERING_FIXTURE_ONLY; NOT LEARNER_TRUTH**

Durable owners:

- `static-web/scripts/validate-xizong-a1-evidence.mjs`;
- `static-web/scripts/test-xizong-a1-evidence-journey.mjs`.

Fresh Evidence execution proved the current architecture preserves the required distinctions:

1. repeated real Recall attempts are append-preserved, including repeated identical ratings;
2. latest convenience state may change without erasing historical Recall evidence;
3. Memory / Chat repair evidence is repair-only and does not rewrite original Recall/mastery;
4. stable-correct question evidence creates no repair debt;
5. only Wrong / Uncertain enters repair routing;
6. precise repair requires REVIEWED Question→Block/KP relation; unresolved relations remain unresolved;
7. private full-paper holdout is excluded from ordinary sweep evidence;
8. stale Block/System versions invalidate or quarantine incompatible evidence;
9. System→Block repair inbox is write-before-clear, idempotent and cross-tab safe;
10. repair return preserves original question/Recall evidence;
11. malformed evidence/state fails closed.

Fresh verdict: **E PASS** under QA #365.

---

## Cross-System regression note

The same A1 fix touched shared `XizongBlockV6.astro`, so the independent A2 functional-first workflow was inspected before A1 closure.

Its failure occurred immediately at `A2_FUNCTIONAL_FAIL:r01_kp_count_15`, before any completion behavior was exercised. The A1 patch only removed the obsolete completion-localStorage dependency and did not alter KP inventory/projection. Therefore that A2 count failure is an independent A2 baseline/test issue, not evidence of an A1-caused shared Runtime regression.

This note does not accept, repair, or otherwise change A2.

---

## Known cross-System debt

DIC exposes a C/Hematology reconciliation debt: A1's own shock-DIC interface is sufficient for A1; a complete C disease model remains C's future problem. This does not block A1.

---

## U｜UNTESTED

U is not executed by this engineering closeout.

A real learner session must own any future U result. No CI run, browser simulation, engineering fixture, seeded localStorage state, or acceptance document may write U PASS on Kian's behalf.

Current terminal engineering state:

```text
S PASS → K PASS → L PASS → P PASS → R PASS → E PASS → U UNTESTED
```

---

## Reopen rule

A1 is engineering-closed. Reopen only the earliest responsible gate/object when **fresh contradictory evidence** identifies a concrete defect. Do not reopen for old-SHA failures, historical governance debt, visual polish, simulated learner progress, or unrelated A2/A3 failures.

---

## Truth boundaries

### Artifact Truth

- System owner → `content/xizong/knowledge/systems/a1-circulation/system.json`
- medical Core → `content/xizong/knowledge/systems/a1-circulation/blocks/`
- lane Learning semantics → `content/xizong/LEARNING_CONTRACT.md`
- shared/System Learning support → `content/xizong/knowledge/learner/`
- learner-facing Projection / Runtime / Evidence → Xizong surfaces under `static-web/`

### Work Cursor

`content/xizong/knowledge/systems/a1-circulation/CURRENT.md`

### Learner Truth

Private learner/browser/conversation evidence only.
