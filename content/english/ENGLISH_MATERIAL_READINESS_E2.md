# English E2 — Material / Source Fidelity / Ready Inventory

Status: **ACTIVE CANDIDATE**
Date: 2026-09-20
Parent: `ENGLISH_HIGHEST_MATURITY_STAGE_PLAN.md#E2`

Purpose:

> Prove that English material required by the 85+ path is not merely present but fidelity-safe, correctly role-labeled, answer/reference-gated and executable through an accepted learner path.

Readiness states:

- `READY_EXECUTABLE`
- `PREPARED_NOT_EXECUTABLE`
- `BLOCKED_FIDELITY`
- `REFERENCE_ONLY / DEFER`

---

## 1. Current readiness snapshot

| Material family | Current readiness | Evidence / reason |
| --- | --- | --- |
| Official Reading A | READY_EXECUTABLE | Current official source/runtime exists; answer gate + attempt evidence accepted |
| Official Cloze | READY_EXECUTABLE | Current official source/runtime exists; complete-set attempt + answer gate accepted |
| Official Part B | READY_EXECUTABLE | Current four-form source/runtime accepted |
| Official Translation | READY_EXECUTABLE | Current source/runtime + post-attempt reference path accepted |
| Official Writing | READY_EXECUTABLE | Current source/runtime accepted; recovered Big visuals explicitly source-equivalent where local bytes were lost |
| Whole Paper | READY_EXECUTABLE for execution | 180-min runtime / Seal / Objective scoring accepted; clean score-validity still depends on E4/E8 exposure + productive scoring |
| Lexical | READY_EXECUTABLE | Current Lexical runtime/owner accepted |
| Objective synthetic baseline | **PREPARED_NOT_EXECUTABLE** | Content + sealed key exist, but normal Reading/Cloze/Part B static routes and English Session Catalog do not currently address these object IDs |
| Translation synthetic baseline | **PREPARED_NOT_EXECUTABLE** | 5 complete sections + sealed references exist, but normal Translation route/catalog does not address these object IDs |
| Writing synthetic bank | **PREPARED_NOT_EXECUTABLE** | Content owner has 4 Small + 6 Big tasks, but current loader rejects any bank whose task count is not exactly 2 |
| External Reading TPO/IELTS | READY_EXECUTABLE for growth | Current pipeline/runtime exists |
| External Reading as formal English-I score evidence | **REFERENCE_ONLY / DEFER** | source-native task cognition differs; current source-quality owner is not corpus-wide proven clean; not English-I score equivalent |

---

## 2. Reproduced E2 defects

### E2-D1 — Writing synthetic exact-count drift

Current owner:
`content/english/modules/writing/synthetic-tasks.v1.json`

Current inventory:
- Small = 4
- Big = 6
- total = 10

Current loader:
`static-web/src/lib/englishWritingSynthetic.mjs`

Reproduced stale invariant:

```text
owner.tasks.length !== 2
→ TASK_COUNT issue
→ source status invalid
→ tasks = []
```

Current true-exam entry validator/runtime also assumes the historical two-task calibration gate.

Learner impact:

> the ready Writing calibration/transfer/maintenance/stress inventory cannot be trusted as executable.

Responsible owner:
existing Writing synthetic loader/runtime validator only.

Repair boundary:
replace exact historical count with capability/shape invariants; do not create another Writing runtime.

---

### E2-D2 — Objective synthetic inventory not in accepted execution path

Current owner:
`content/english/modules/objective/synthetic-baseline.v1.json`

Inventory:
- Reading A: 4 complete passages / 20 questions;
- Cloze: 2 complete 20-blank sets;
- Part B: 8 complete sets, Calibration + Transfer for all four forms.

Current English Session Catalog projects only official Reading/Cloze/Part B objects plus existing Writing/Full Paper/External flows.

Learner impact:

> Chat cannot reliably return an exact synthetic Objective object ID + source hash and have the existing Website execute it through the ordinary task route.

Responsible repair:
small synthetic source adapter into the existing Reading/Cloze/Part B task geometry + current routes/catalog.

Hard boundary:
- synthetic must not be inserted into official `global_source_truth`;
- answer key remains sealed until submit;
- evidence role remains synthetic/non-score-equivalent.

---

### E2-D3 — Translation synthetic inventory not in accepted execution path

Current owner:
`content/english/modules/translation/synthetic-tasks.v1.json`

Inventory:
- 2 Calibration;
- 2 Transfer;
- 1 Stress/Edge;
- each = complete 5-segment section;
- sealed reference owner exists separately.

Current accepted Translation route/catalog reads official Translation Source Truth only.

Learner impact:

> Chat cannot use the prepared cold/transfer inventory through the normal Translation workspace without manual task shuttling.

Responsible repair:
small synthetic adapter into the existing Translation geometry + route/reference endpoint + Session Catalog.

Hard boundary:
- reference remains post-attempt;
- synthetic reference is not official;
- first output/evidence semantics stay unchanged.

---

## 3. Source Fidelity status

### Official English-I core

Current Source Truth uses explicit owner hashes / rendered-object hashes and existing learner-safe projection.

No new E2 evidence currently justifies reopening broad official source reconstruction.

Targeted fidelity remains mandatory when:
- a source hash changes;
- option/answer identity changes;
- Reading B geometry changes;
- Translation segment/reference binding changes;
- Writing visual/prompt identity changes.

### Writing recovered visuals

Current English states 2011 / 2026 Big Writing visuals were rebound as explicit source-equivalent web artifacts with their own identities.

E2 rule:
- preserve that label;
- never call them recovered original local bytes.

### External Reading

Current source-quality owner states the corpus is **not corpus-wide proven clean** and some IELTS objects retain OCR-source flags.

Therefore:
- valid for bounded growth use under current intake rules;
- not promoted to formal English-I score calibration.

---

## 4. Fresh-capital sufficiency

Current synthetic inventory is enough to start calibration/one repair-transfer loop in most modules, except possible Cloze verification depth.

Current Cloze synthetic inventory:
- 2 complete sets.

Planning prior in English Learning Contract:
- around 4 complete sets across sessions before a strong Secure claim, subject to learner prior/evidence.

E2 decision:

```text
DO NOT generate more Cloze yet merely to reach “4”.
```

First:
- restore executability;
- obtain Kian real Cloze evidence;
- if official exposure + synthetic coverage cannot support representative Verify, then generate the smallest additional complete set(s).

This preserves Minimum Dose as evidence floor rather than quota.

---

## 5. E2 repair order

```text
R1 Writing synthetic exact-count drift
→ targeted source/runtime proof

R2 Objective synthetic adapter
→ Reading A / Cloze / Part B exact-route + sealed-answer + evidence proof

R3 Translation synthetic adapter
→ exact-route + sealed-reference + first-output evidence proof

R4 cross-family Session Catalog / source-hash proof
→ Chat can address all READY_EXECUTABLE baseline assets

R5 browser learner journey
→ at least one Objective synthetic + one Translation synthetic + one expanded Writing synthetic

R6 E2 fresh self-attack
→ confirm no answer leakage / official-source contamination / duplicate runtime
```

---

## 6. Candidate repair status

Implemented on this ref:

- **R1 Writing synthetic exact-count drift** — loader/runtime validation now protects Small+Big capability coverage instead of historical exact count=2.
- **R2 Objective synthetic adapter** — Reading A / Cloze / Part B synthetic objects are adapted into the existing task geometry, static routes, sealed-answer endpoints and English Session Catalog without entering official Source Truth.
- **R3 Translation synthetic adapter** — complete synthetic sections use the existing Translation workspace, sealed synthetic reference endpoint and English Session Catalog.
- **R4 structural validator** — `validate-english-synthetic-baseline.mjs` checks inventory, answer/reference separation, four-form Part B coverage, source hashes, Writing 10-task readiness and typed Session Instruction addressability.
- Existing English Family Coherence CI now runs the new validator.

Current status:

```text
R1–R4 IMPLEMENTED_CANDIDATE
→ targeted CI / build / browser proof pending
→ E2 NOT CLOSED
```

No evidence currently supports:
- broad Guide rewrite;
- new English scheduler;
- new learner-state system;
- broad official source rebuild;
- immediate large synthetic generation.

The correct next action is **R5 — targeted CI + browser learner journey on representative synthetic Objective / Translation / expanded Writing objects**.
