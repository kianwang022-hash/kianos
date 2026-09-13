# Xizong A2 Respiratory Acceptance

Status: CURRENT  
Scope: A2 Respiratory  
Standard: root `LEARNING_ACCEPTANCE.md`  
Role: A2 scoped Acceptance Truth

This file owns current S/K/L/P/R/E/U readiness claims for A2 Respiratory.

It does not own medical Core, lane/System learning semantics, Work Cursor, or Kian's private learner state.

---

## Gate status

```text
S  PASS
K  PASS — fresh bottom-up re-accepted
L  PASS
P  PASS
R  PASS — executed Functional First browser journey
E  PASS — executed state/evidence/repair journey
U  UNTESTED by every real learner path
```

Allowed conclusion:

> **A2 Respiratory is Functional First ready for actual study. S/K/L/P/R/E are accepted for the recorded scope. Every real learner U path remains UNTESTED.**

Not allowed:

> learner-validated / Respiratory learned / System Recall due now / questions due now.

---

## Current evidence boundary

### S — PASS

Current Source scope remains exactly **359 official A2 Question Truth IDs** under the accepted fail-closed source boundary. The fresh audit found no evidence requiring a new A2 Source unit merely because a topic is clinically interesting outside Current 306 scope.

### K — PASS · fresh re-accepted

The fresh audit independently attacked completeness, minimality and ownership rather than treating stable counts or old Acceptance as the answer.

Accepted result:

- **12 canonical Blocks / 236 stable KPs / 62 Logic Groups** remain;
- no Block/KP split, merge or renumber is justified;
- R1/R2/R3/R4/R5/R7 remain coherent natural units;
- the most suspicious combined Blocks also survive minimality attack:
  - R6: chronic suppuration + structural destruction + drainage/cavity discrimination;
  - R8: restrictive–diffusion–hypoxemia discrimination across ILD/silicosis and related alveolar patterns;
  - R9: chronic PVR load vs acute pulmonary vascular obstruction under one RV-load model;
  - R11: lung-cancer Primary with a small mediastinal spatial-localization tail;
  - R12: shared oxygenation/ventilation failure endpoint;
- no new medical Block or broad Content rewrite is required.

A real System-level defect was repaired:

- old failure language omitted **blood O2-carrying / oxygen-content failure**, even though R2 teaches that PaO2/SaO2 does not equal Hb/CaO2 or tissue oxygen delivery;
- broad “persistent structural destruction / occupying lesion” was demoted from primitive status because those diseases compose from more specific functional failures;
- ventilatory mechanics/pump failure is now separated from respiratory controller/neural-drive failure;
- a judgment axis explicitly distinguishes **PaO2/SaO2 hypoxemia vs Hb/CaO2 carrying failure**;
- matching `a2-respiratory-pathways.json` failure views were reconciled.

Current minimal A2 failure language is:

```text
FM1 airway obstruction
FM2 ventilatory mechanics / pump expansion failure
FM3 alveolar filling or collapse
FM4 diffusion-membrane failure
FM5 V/Q mismatch
FM6 pulmonary vascular resistance / pathway failure
FM7 respiratory controller / neural-drive failure
FM8 blood O2-carrying / oxygen-content failure
```

Complete anemia, toxicology and other non-respiratory etiologies remain with their owning Systems; A2 only owns the interface needed to localize oxygen-delivery failure correctly.

### L — PASS

The accepted Xizong learning constitution remains sufficient and was not expanded during this closure:

`System orientation → Block/Logic Group Lecture-first learning → KP Recall → Logic Group closure → Block Recall → System Recall before questions → official System sweep → smallest-sufficient W/U repair → return → post-question reconstruction`.

Continuous Lecture consumption remains external-primary on iPad/MarginNote. KianOS remains orientation, retrieval, compression, evidence and repair rather than a second mandatory Lecture reader.

No new A2 ritual, Recall layer, question set or learner burden was introduced by the fresh audit.

### P — PASS

No visual redesign was required. Current shared System/Block surfaces project the accepted semantics sufficiently for Functional First use. Presentation polish is not part of this gate closure.

### R — PASS · executed browser evidence

The current Runtime was exercised through a real Playwright browser journey rather than accepted from page existence or source inspection alone.

`Xizong A2 Functional First Journey` run `34755440083` passed after correcting an earlier **test-only locator bug**. The successful journey executed:

- R1 first-learning state write;
- refresh resume at the saved stage/KP;
- premature Recall fail-closed behavior;
- Lecture evidence as a hard Block-completion prerequisite;
- successful Block completion only after required evidence;
- home Continue → recent Block;
- completed-System → System Recall;
- learner-selected whole-paper holdout;
- official System question sweep;
- correct-but-Uncertain state transition;
- W/U repair handoff and return path.

`Static Web Xizong QA` run `34755440116` passed Current validators and Astro build on the same repaired candidate.

### E — PASS · executed evidence semantics

The same browser journey verified the critical evidence contracts in execution:

- an unlearned KP cannot manufacture Recall evidence;
- a Block cannot manufacture `completed=true` without Lecture + Learn + Recall + Block Recall evidence;
- question results remain keyed to real Question Truth IDs;
- stable work is not forced into repair;
- repair input accepts only current real Wrong/Uncertain question IDs;
- precise Question→Block/KP routing uses repository-reviewed relations only;
- routed repair reaches the owning Block through the repair inbox;
- imported repair evidence is `REPAIR_ONLY`;
- repair does not rewrite the original question evidence;
- the original sweep tab/mainline remains available for natural return;
- Current-version evidence guards continue to archive/invalidate stale Block/System/question/repair evidence rather than silently reusing it.

Evidence class:

> **EXECUTED BROWSER ENGINEERING EVIDENCE — NOT REAL LEARNER U**

### U — UNTESTED

No repository, CI, fixture or headless browser run can establish real learner validation. Only Kian's actual use can create U evidence, and U remains path-scoped.

---

## Functional First stop rule

A2 engineering is complete for the current scope.

Do not reopen accepted gates for visual polish or speculative improvement. New work requires concrete contradictory Source, medical, state/evidence, Runtime or real learner evidence and must reopen only the smallest responsible owner.

Visual/interaction implementation may later be delegated to Codex. Codex may improve layout, responsiveness, components and micro-interactions, but must not change canonical medical ownership, Block/KP identity or learner order, Lecture-first semantics, completion/state meanings, evidence semantics, Memory admission, Question ownership/reviewed routing, W/U repair semantics, or repair/return progression.

---

## U paths awaiting real evidence

All remain `UNTESTED` until Kian genuinely uses them:

- sustained System orientation → Block first-learning flow;
- real iPad/MarginNote ↔ KianOS handoff;
- real weak KP Recall → Memory / Chat repair → natural return;
- real completed System → System Recall → holdout → question sweep → W/U repair → post-question Recall;
- sustained multi-session Continue/resume behavior.

Passing one later U path must not silently promote the others.

---

## Truth boundaries

### Artifact Truth

- System owner → `content/xizong/knowledge/systems/a2-respiratory/system.json`
- medical Core → `content/xizong/knowledge/systems/a2-respiratory/blocks/`
- lane learning semantics → `content/xizong/LEARNING_CONTRACT.md`
- detailed learning policy/support/pathways → `content/xizong/knowledge/learner/`
- official questions / explanations / reviewed relations → Xizong content roots
- learner Runtime / Functional First journey → `static-web/`

### Learner Truth

Private learner/browser/conversation evidence only.

This Acceptance does not mean Kian has started Respiratory, reached any Recall stage, attempted official questions, created repair/review debt, or validated any U path.
