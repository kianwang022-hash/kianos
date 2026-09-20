# Politics Maturity Package

Status: **F-01 REPAIRED FREEZE CANDIDATE · BUILDER CLOSURE COMPLETE · FINAL AUTOMATIC FRESH AUDIT REQUIRED**
Owner: PR #638 / work/politics-later-readiness-20260920
Upstream bar: EXAM_SUBJECT_MATURITY_STANDARD.md
Subject adaptation: MATURITY_REQUIREMENTS.md

This is the single practical package for Politics whole-cycle maturity. It summarizes current truth and points to exact owners; it does not duplicate Source, Learning, Forecast, runtime or learner state.

## 0. Truth boundary

~~~text
BUILDER_CLOSURE_COMPLETE
!=
SYSTEM_LOGIC_ACCEPTED
!=
KIAN_SPECIFIC_CALIBRATED
!=
CURRENT_YEAR_SOURCE_READY
~~~

Current top-level truth:

- BUILDER_CLOSURE_COMPLETE: **YES** — builder-owned implementation, reconciliation and targeted adversarial proof are complete enough to enter freeze audit.
- SYSTEM_LOGIC_ACCEPTED: **NO / FRESH INDEPENDENT AUDIT REQUIRED** — shared standard §23 forbids Builder self-certification.
- KIAN_SPECIFIC_CALIBRATED: **NO / REAL-U GATED**.
- current-year handbook/current affairs/Xiao8/Xiao4 authority: **SOURCE GATED**.

Do not collapse these into one “Politics mature” badge.

## 0.1 Fresh audit v4 finding and bounded repair

Fresh Independent v4 returned **FAIL**, not INVALID.

Material blocker:

~~~text
raw Chengfeng node has text
+ verification_status is needs-review OR a known misclassification
→ old Runtime treated Boolean(text) as resolved
→ learner-facing Runtime / Practice / Review could admit unsafe OCR
~~~

Concrete audit example:

`POL27-CF-MARX-C00-K04-N02-I01`

contained the actor-level OCR corruption “我们觉坚定信仰信念…” while raw status still said `source_bound_cross_engine_ocr`.

Smallest repair:

- Source-owned classification override: `source/nodes/fidelity-overrides.v1.json`;
- common admission policy: `static-web/src/lib/politicsSourceFidelity.mjs`;
- production scoped Runtime + legacy Runtime filter unsafe descendants before source-text merge;
- Practice exact Chengfeng locator uses the same fidelity gate;
- blocked source text cannot enter Practice/Review source context;
- raw monolith↔shard parity is preserved;
- dedicated regression: `test-politics-source-fidelity.mjs`.

Builder proof after repair:

- Static Web Politics QA run `35542360736`: **PASS**;
- source-fidelity fail-closed regression: **PASS**;
- scoped-source loading/parity: **PASS**;
- Marxism Runtime/Evidence, Current bindings and Astro build: **PASS**.

This repair does **not** promote `SYSTEM_LOGIC_ACCEPTED`. The material change invalidates v4 for freeze purposes and requires a new Fresh Independent audit.

## 0.2 Fresh audit v5 finding and bounded F-01 repair

Fresh Independent v5 returned **FAIL**, not INVALID, with exactly one material freeze blocker:

~~~text
Daily Packet / learner evidence snapshot E0
→ Chat creates same-day plan from E0
→ learner performs more Politics work and durable evidence advances to E1
→ old E0 plan could still import because it had no evidence-basis identity
~~~

That failure could create both:
- false Secure: a newly exposed Protect-70 blocker at E1 while the E0 plan kept running;
- false Unstable: newer stable/completed evidence at E1 while the E0 plan reopened Build / Repair / Memory.

Smallest responsible owner:

- shared Chat Plan schema/runtime: `static-web/src/lib/examChatPlan.mjs`;
- import enforcement edge: `static-web/src/lib/privateControlRuntime.mjs`;
- existing Daily Learning Packet reused as the evidence handoff; **no second learner-state/revision system was created**.

Bounded repair:

- Daily Learning Packet carries deterministic `learner_evidence_basis`;
- Chat Plan returns that basis unchanged;
- Home read/import and private-control import recompute current durable learner evidence + explicit planning facts and reject stale/missing basis;
- navigation/control-only state is excluded so page movement does not create false staleness;
- stale heavy plans are invalidated by newer stability evidence as well as by newer blocker evidence.

Shared repair landed through PR #668 / main `9dcc15be4fa282e3c459ff8c0cccefb1a66fe4d7`.

Proof boundary:

- #668 shared product proof: Exam Orchestrator, Final Cross-subject, Mac Visual, Politics Functional, Authority/Semantic and Xizong Forecast all PASS on the repaired product code;
- #638 reconcile proof: Static Web Politics QA, Exam Orchestrator, Politics Functional, Politics Final Fresh Execution and Mac Visual passed on the reconciled product code;
- a later #638 Final Cross-subject failure was traced to the synthetic test consuming the live private-control relay, not to product semantics;
- the latest #638 change isolates that synthetic harness from live control. Because GitHub did not schedule a new run for that test-only commit, it is **not** counted as an additional PASS.

This builder repair **does not** promote `SYSTEM_LOGIC_ACCEPTED`. One new sealed candidate and one final Fresh Independent audit are still required.

Audit-loop stop rule:

- this is the **last automatically launched Fresh audit** for this closure cycle;
- if it PASSes, broad Politics maturity engineering freezes;
- if it FAILs only because F-01 is incomplete, return to that exact shared owner;
- if it finds a new unrelated material blocker, stop automatic repair/reseal/re-audit and report to Kian for a decision.

## 1. Score → Ability → Material → Method → Evidence

Canonical owner: SCORE_ABILITY_MATRIX.md.

Canonical target authority: root `EXAM_ORCHESTRATOR_CONTRACT.md`.

~~~text
Cross-subject target authority
→ Total 425+
→ Politics 70+

Politics protect floor
→ 70

Politics working-target semantics
→ keep a robust 70+ path viable
→ Objective 40+ / 50 + Analysis 30+ / 50 is the current planning decomposition
→ no invented numeric buffer before real variance/mock evidence exists

Politics elastic upside
→ Push 75
→ Objective 42–44 / 50 + Analysis 31–34 / 50
→ may consume capacity only when marginal value remains competitive cross-subject
~~~

The local Push-75 signal must never silently override the canonical 425+/Politics-70 cross-subject target. These are control targets, not guarantees.

| Channel | System capability state | Material state | Evidence state | Score inference |
| --- | --- | --- | --- | --- |
| Objective first-round | strong / accepted path | ready | learner evidence accumulates from real attempts | no direct Xiao1000→exam-score conversion |
| Objective current-year transfer | future/current-year | source-gated | unavailable | UNKNOWN |
| Analysis structural | bounded ready baseline | 104-task bank across seven families | durable diagnostic evidence path exists | diagnostic only |
| Analysis current-year exact | future/current-year | source-gated | unavailable | UNKNOWN |
| Timed whole-paper | later phase | Mock/final structure ready | Real U/current-year paper required | UNKNOWN |

## 2. Full Material Inventory

Canonical owner: MATERIAL_INVENTORY.md.

Current summary:

- Chengfeng 160 Natural Units: ready first-round mainline.
- Xiao1000 1,148: full learning asset; 528 single + 620 multiple; not a clean holdout.
- Memory candidate system: ready selective source-grounded candidate pool; candidate != debt.
- Analysis bank: **104 tasks / READY stable baseline**, with:
  - Principle Retrieval 30
  - Skeleton 30
  - Material Binding 8
  - Complete Analysis 8
  - Stress Variant 8
  - Formulation Retrieval 8
  - Material Segmentation 12
- current-year exact Analysis/current affairs: source-gated.
- handbook/current affairs/Xiao8/Xiao4: future-source slots prepared.
- Mock/final: structure ready; authentic current-year material remains gated.

## 3. Dynamic Control

Canonical owner: SCORE_ABILITY_MATRIX.md Politics-native control policy.

~~~text
REACTIVATE
→ BUILD
→ VERIFY
→ STABILIZE
→ MAINTAIN
→ ELASTIC
~~~

Rules:

- stable work gets cheaper;
- Wrong/Uncertain is observation, not automatic debt;
- same-item repair is not fresh transfer;
- no heavy Build reopen without newer contradiction;
- Protect-70 blockers outrank Push-75 Elastic work;
- cross-subject opportunity cost remains Chat/Exam-Orchestrator owned.

Current status: **SYSTEM SEMANTICS READY; thresholds remain Real-U calibrated.**

## 4. Forecast

Owners:
- FORECAST_MODEL.md
- FORECAST_STRESS_REPORT.md
- static-web/src/lib/politicsForecast.mjs

Current valid outputs:

- structural remaining-work cases;
- single/multiple attempt evidence;
- Review pressure;
- stress-grid workload range;
- sensitivity;
- capacity robustness;
- score-path uncertainty state.

Hard boundaries:

- P20/P50/P80 stay null until typed Kian-specific evidence supports a real distribution;
- Forecast never chooses today's task;
- Xiao1000 learning accuracy never directly becomes an exam score;
- Analysis/current-year missing evidence keeps total-score confidence wide.

Current status: **BUILDER-PROVEN MODEL; explicit decision-flip surfaces and whole-cycle workload envelope exist; freeze acceptance awaits Fresh Independent Audit; personal calibration is REAL-U GATED.**

## 5. Adversarial / Lifecycle

Builder-owned system-logic closure is complete enough to enter the mother-standard freeze audit. It is not yet independently accepted.

Closed proof includes:

- machine-validated Analysis bank quality/coverage;
- explicit Forecast decision-flip and metamorphic attacks;
- whole-lifecycle scenarios covering bad week, relapse, source delay/v2, evidence loss, false Secure and false Unstable;
- explicit Fresh-Chat and No-Website closure;
- exact Analysis material identity / freshness gates;
- whole-cycle workload and later-source reserve stress.

Real learner scenarios cannot be fabricated. They remain Real-U gated and do not reopen broad engineering by themselves.

Current verdict:

~~~text
BUILDER_CLOSURE_COMPLETE = YES
SYSTEM_LOGIC_ACCEPTED = NO / FRESH_INDEPENDENT_AUDIT_REQUIRED
KIAN_SPECIFIC_CALIBRATED = NO / REAL_U_GATED
~~~

## 6. Chat ↔ Website Proof

Current accepted control loop:

~~~text
Current durable assets
+ private learner evidence
→ Chat decision
→ typed plan / return
→ Website execution
→ learner evidence
→ Daily/Review handoff
→ Chat re-decision
~~~

Politics does not own a second scheduler. Analysis remains Chat-primary unless real friction proves a helper is needed.

Current status: **FIRST-ROUND SYSTEM LOGIC ACCEPTED. Whole-cycle later-phase execution remains source/Real-U gated.**

## 7. Future Source Readiness

Owners:
- later-stage/INGESTION_RULES.md
- later-stage/manifest.json
- mock-final/README.md

Known families:

1. memory/sprint handbook;
2. current affairs;
3. Xiao8;
4. Xiao4.

Prepared lifecycle:

~~~text
real source
→ identity/provenance
→ fidelity gate
→ delta vs Current + prior-year baseline
→ responsible derived owner only
→ transitive invalidation
→ targeted validation
→ learner use
~~~

Current status: **SYSTEM READY / CONTENT SOURCE-GATED.**

## 8. Real Learner U

Current state:

~~~text
BUILDER_CLOSURE_COMPLETE     YES
SYSTEM_LOGIC_ACCEPTED        NO / FRESH_INDEPENDENT_AUDIT_REQUIRED
KIAN_SPECIFIC_CALIBRATED     NO / REAL_U_GATED
~~~

Real study must calibrate:

- NU/reactivation throughput;
- single/multiple W/U;
- Repair compression;
- Memory admission/retention/relapse;
- Analysis first-output and transfer;
- timing/handwriting;
- learner-visible friction.

Private learner truth stays private and does not get committed into shared Current.

## 9. Remaining Unknowns

Allowed remaining unknowns are limited to:

- unpublished/unbound current-year source content;
- Kian-specific Real U not yet produced;
- authentic current-year timed/whole-paper performance;
- precise Analysis score calibration without accepted anchors/current-year evidence.

Any other unknown that can change current learning action is a reopen condition.

## 9.1 Politics-specific requirements 30–39 boundary

`MATURITY_REQUIREMENTS.md` extends the shared mother standard with Politics-specific phase gates 30–39.

They are **not** silently collapsed into the mother-standard 1–29 validator:

- Shared mother-standard §23 requires a Fresh Independent / Anti-Anchored Audit **before SYSTEM_LOGIC_ACCEPTED can freeze**. Politics Requirement 30 adds a stronger later whole-subject falsification obligation; it does not weaken the shared freeze gate.
- authentic-modality / whole-paper requirements remain REAL-U and current-year Mock gated;
- Day-1, lifecycle, stale-state, source-invalidation, anti-homogenization and causal-Repair semantics have current system-level owners and targeted proof;
- none of these gates authorizes synthetic learner capability or invented 2027 Source.

This distinction prevents `SYSTEM_LOGIC_ACCEPTED` from being misread as `WHOLE_SUBJECT_MATURE`.

## 10. Mother-standard crosswalk

This crosswalk follows the shared standard's **actual section numbers 0–28**, not a locally renumbered checklist.

| § | Shared requirement | Current Politics status | Exact owner / next proof |
| ---: | --- | --- | --- |
| 0 | Score closure | BUILDER CLOSED; learner score calibration gated | SCORE_ABILITY_MATRIX |
| 1 | Ability closure | BUILDER CLOSED | SCORE_ABILITY_MATRIX |
| 2 | Material closure | BUILDER REPAIRED after v4 Source-fidelity FAIL; new Fresh audit required; future bytes source-gated | MATERIAL_INVENTORY + source fidelity gate |
| 3 | Method closure | BUILDER CLOSED | LEARNING_CONTRACT + SCORE_ABILITY_MATRIX |
| 4 | Evidence closure | BUILDER CLOSED semantics; Real U pending | Workbench / Memory / Analysis evidence |
| 5 | Forecast closure | BUILDER CLOSED logic; personal calibration Real-U gated | FORECAST_MODEL / FORECAST_STRESS_REPORT |
| 6 | Dynamic control closure | BUILDER CLOSED semantics; learner thresholds Real-U calibrated | SCORE_ABILITY_MATRIX |
| 7 | Future-source lifecycle closure | BUILDER CLOSED preparation | later-stage/INGESTION_RULES |
| 8 | Execution / transport closure | BUILDER CLOSED for current first-round path; authentic final modality later | typed plan/return/checkpoint + final regression |
| 9 | Adversarial / failure closure | BUILDER CLOSED; independent falsification still required | MATURITY_ADVERSARIAL_REPORT + tests |
| 10 | Attention-cost closure | BUILDER CLOSED design | Home/Chat boundary + no learner ledger |
| 11 | Ownership / maintainability closure | BUILDER CLOSED | CURRENT + exact owners |
| 12 | Fresh-Chat / no-Website falsification | BUILDER CLOSED semantics | CURRENT route + durable owners |
| 13 | Real learner U closure | REAL-U GATED | real study only |
| 14 | Target authority / score semantics | BUILDER CLOSED | EXAM_ORCHESTRATOR_CONTRACT + SCORE_ABILITY_MATRIX |
| 15 | Construct coverage / negative space | BUILDER CLOSED semantics; untested learner regions stay UNKNOWN | SCORE_ABILITY_MATRIX + Analysis bank |
| 16 | Measurement / scoring validity | DIAGNOSTIC SYSTEM READY; narrow score conversion SOURCE/REAL-U gated | analysis-output/SCORING_RUBRIC |
| 17 | Decision quality / semantic safety | BUILDER REPAIRED after v4 learner-admission finding; new Fresh audit required | source fidelity + freshness/stale guards |
| 18 | Evidence observability / revision / material identity | BUILDER REPAIRED: unsafe OCR no longer enters source_context/Review | Analysis identity + source fidelity + practice evidence |
| 19 | Adaptive generated-asset lifecycle | BUILDER CLOSED for current Analysis bank | analysis-output bank/manifest/validator |
| 20 | Value of information / latency / latest useful date | BUILDER CLOSED semantics | MATURITY_REQUIREMENTS + mock/final + ingestion |
| 21 | Future-source failure / supersession / rollback | BUILDER CLOSED preparation | later-stage/INGESTION_RULES |
| 22 | Concurrent state / bounded context | BUILDER CLOSED for current transport | stale/replay/checkpoint tests + CURRENT route |
| 23 | Independent anti-anchored audit | **OPEN — HARD FREEZE BLOCKER** | MATURITY_FRESH_INDEPENDENT_AUDIT_BRIEF.md → fresh evaluator result |
| 24 | Adversarial methodology | BUILDER CLOSED candidate: full Cartesian stress grid + decision flips + metamorphic checks | Forecast tests + MATURITY_ADVERSARIAL_REPORT |
| 25 | Causal repair / discrimination | BUILDER CLOSED policy | CAUSAL_REPAIR_POLICY.md |
| 26 | Subject specificity / anti-homogenization | BUILDER CLOSED | Politics-native owners |
| 27 | Stop rule | DEFINED; activates only after §23 passes | MATURITY_STAGE_PLAN |
| 28 | Cross-subject composition / joint feasibility | **SHARED OWNER GATE — not duplicated in Politics** | EXAM_ORCHESTRATOR_CONTRACT / shared acceptance owner |

### Required subject-level acceptance package

| Item | Required deliverable | Status |
| ---: | --- | --- |
| 1 | Score → Ability → Material → Method → Evidence matrix | READY |
| 2 | Full material inventory | READY |
| 3 | Subject-native dynamic control | READY |
| 4 | Forecast + sensitivity/calibration report | READY; personal calibration REAL-U gated |
| 5 | Adversarial stress report | READY builder candidate |
| 6 | Chat↔Website execution proof | READY current path |
| 7 | Real Learner U status / known unknowns | READY |
| 8 | Explicit blockers / future-source dependencies | READY |
| 9 | Fresh Independent Anti-Anchored Audit result | **MISSING — FREEZE BLOCKER** |
| 10 | Adversarial methodology / interaction & flip report | READY builder candidate |
| 11 | Causal Repair / discrimination policy | READY |
| 12 | SYSTEM_LOGIC_ACCEPTED vs KIAN_SPECIFIC_CALIBRATED state | READY and separated |

## 11. Execution ledger

~~~text
M0 Ownership correction                         DONE
M1 Single Politics Maturity Package             DONE
M2 Reconcile stale Analysis/material status     DONE
M3 Analysis-bank + evidence identity proof       DONE
M4 Forecast decision-flip/adversarial closure   DONE
M5 Lifecycle + Fresh Chat / No-Website          DONE
M6 v4 Source-fidelity finding repair             DONE · Politics QA PASS
M7 Fresh Independent / Anti-Anchored re-audit   OPEN — HARD FREEZE BLOCKER
M8 SYSTEM_LOGIC_ACCEPTED verdict                BLOCKED ON M7
M9 KIAN_SPECIFIC_CALIBRATED                     REAL-U GATED
M10 2027 handbook/current affairs/Xiao8/Xiao4   SOURCE GATED
~~~

Do not resume broad feature construction. The next maturity action is the bounded Fresh Independent Audit required by shared standard §23. Only a material finding from that audit may reopen the smallest responsible owner.

Fresh audit candidate is sealed and immutable for M7:

```text
audit/politics-maturity-freeze-20260921
@ 9da838f38dd025283407c9bf248e9fbf731adcaa
```

A PASS/FAIL may certify only that exact SHA. Any material semantic repair requires a new sealed candidate and a new fresh audit.

