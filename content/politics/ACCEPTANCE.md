# Politics Acceptance

Status: CURRENT on governance redesign branch  
Standard: root `LEARNING_ACCEPTANCE.md`  
Role: Politics lane Acceptance Truth

This file owns current Politics S/K/L/P/R/E/U readiness claims.

It does not own political Source Truth, teaching projection, runtime code, Work Cursor, or Kian's private learner progress.

---

## Accepted pilot｜Marxism K03

Scope: `POL27-CF-MARX-C02-K03`

```text
S  PASS
K  PASS
L  PASS
P  PASS
R  PASS
E  PASS
U  UNTESTED
```

Allowed conclusion:

> **Marxism K03 is Module ready for learner test; U remains UNTESTED.**

K03 establishes one accepted Natural Unit path. It does not make the whole Marxism subject or all Politics learner-ready.

Accepted path preserves:

- Chengfeng as continuous first-round mainline;
- Suyi as background framework/reference rather than a second learner course;
- Xiao1000 as validation rather than learning-order authority;
- formal first-ready timing separating 11 immediate K03 questions from 4 deferred questions;
- stable-correct zero-debt PASS;
- Wrong/Uncertain smallest repair;
- Unit Return semantics without manufacturing mastery.

---

## Whole-subject Marxism acceptance

Scope: Marxism all Current chapters / **22 Natural Units / 396 unique formal-first-ready Xiao questions**

```text
S  UNTESTED
K  UNTESTED
L  UNTESTED
P  UNTESTED
R  UNTESTED
E  UNTESTED
U  UNTESTED
```

Allowed conclusion:

> **Marxism has a complete current implementation candidate for whole-subject S/K/L/P/R/E acceptance plus an accepted K03 pilot, but the whole-subject gates have not yet executed successfully; U is UNTESTED.**

Do not translate implementation completeness or manual review completion into subject-level PASS.

### Current candidate evidence from latest `main`

- **S candidate** — root Source/OCR and Suyi review dispositions are durable; the manual Suyi review is closed and only C01-S01 / C06-S01 deltas were admitted, both already repaired.
- **K candidate** — whole-Marxism semantic scan is complete; C01-S01 and C06-S01 were the two accepted P0 gaps; no broad stylistic rewrite was justified elsewhere.
- **L/P candidate** — global formal-first-ready derivation covers 22 Natural Units / 396 unique questions, including K03 exact 11 first-ready questions and named deferrals.
- **R/E candidate** — whole-subject Unit Return / first-attempt behavior is implemented without 21 hand-coded sidecars; K03 keeps canonical node precision while other units fail safely to Natural-Unit precision rather than inventing K-level evidence.

These remain candidate Artifact/evidence inputs until the dedicated current gates execute. Recent Politics QA no-start jobs do not promote or refute them.

### U｜UNTESTED

Real learner use is separate. No engineering or CI state may be rewritten as Kian's personal Politics progress.

---

## Whole-subject History acceptance

Scope: History ch01–ch10

```text
S  UNTESTED
K  UNTESTED
L  UNTESTED
P  UNTESTED
R  UNTESTED
E  UNTESTED
U  UNTESTED
```

Allowed conclusion:

> **History has a completed learner-facing semantic mainline scan with five evidence-backed repairs, but Source/Suyi closure and all formal whole-subject acceptance gates remain incomplete; U is UNTESTED.**

### Current candidate evidence from latest `main`

The History semantic scan is complete and its subject-specific teaching shape remains:

> chronology → stage → turning point → cause → evaluation

Five real gaps were repaired:

- C03 — Qing New Policies / preparatory constitutionalism failure restored as the bridge from reform exhaustion to revolutionary ascendancy;
- C04 — October Revolution restored as the bridge from New Culture ideological liberation toward a new revolutionary direction and Marxism spread;
- C06 — victory-cause hierarchy plus Taiwan/Penghu return restored as an important complete-victory marker;
- C08 — *The Ten Major Relationships* and the Eighth Party Congress promoted as anchors for independent socialist-construction exploration;
- C09 — rectification-of-disorder language and the 1992 Southern Talks restored as stage anchors in the reform-opening trajectory.

C01/C02/C05/C07/C10 were intentionally kept rather than rewritten for symmetry.

History S/K are **not yet PASS** because compact Source-root OCR and declared Suyi-delta review remain to be closed and consumed by the History content gate.

L/P must wait for formal first-ready timing from canonical Natural Unit ownership and Xiao1000 dependencies. R/E stay downstream of L/P. Continuous learner Units such as History C04 K03–K07 must remain coherent rather than being split for internal counting.

---

## Current acceptance sequence

### Marxism

```text
existing whole-subject S/K/L/P/R/E candidate implementation
↓
actual executable Politics acceptance gates
↓
PASS only from executed assertions
↓
U only from real named learner paths
```

### History

```text
S — compact Source-root OCR + declared Suyi review
↓
K — History batch content closure
↓
L / P — derive and accept formal whole-subject first-ready timing
↓
R / E — only after L/P close
↓
U — only from real named learner paths
```

Do not jump downstream merely because code or teaching projections already exist.

---

## CI boundary

Current Politics QA workflow on latest `main` includes dedicated checks for:

- canonical coverage;
- Xiao semantic routing;
- scoped source loading;
- K03 K/L/P/R/E audits;
- Marxism batch content closure;
- Marxism global first-ready parity;
- whole-Marxism runtime/evidence behavior;
- History whole-subject content closure;
- Current runtime validation;
- Astro build.

Recent recorded Politics QA jobs failed before runner allocation with no executable steps.

Hard rule:

> **A no-start CI job is neither PASS nor a Politics product failure.**

Do not promote pending gates until their actual assertions execute.

---

## Truth boundaries

### Artifact Truth

- owner map → `content/politics/manifest.json`
- source owners → `content/politics/source/`
- learning semantics → `content/politics/LEARNING_CONTRACT.md`
- interaction semantics → `content/politics/INTERACTION_CONTRACT.md`
- Chat-approved teaching projections / durable review dispositions → `content/politics/learning/`
- learner runtime → Politics surfaces under `static-web/`
- acceptance harness → latest-main `.github/workflows/static-web-politics-qa.yml` + Politics audit scripts

### Learner Truth

Private browser / Return Packet / conversation evidence only.

In particular:

> **Politics content projection COMPLETE does not mean Kian has learned those chapters. K03 S–E PASS does not mean Kian has attempted K03. Whole-subject gate implementation does not mean the gate passed.**

---

## Governance reconciliation note

Latest `main` advanced Politics while this governance branch was open. This Acceptance owner therefore records the latest-main readiness boundary without copying or replaying the new Politics Artifact implementation into the governance branch.

Before governance landing, Politics file conflicts must be reconciled against latest `main`; governance routing/Truth ownership should survive, while main's newer Politics content/runtime/audit work remains authoritative.
