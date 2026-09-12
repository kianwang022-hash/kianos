# English Current

Role: English lane Work Cursor + independently continued scope router  
Parent: root `CURRENT.md`

This file does not duplicate English content, learning semantics, scoped acceptance evidence, or learner progress.

---

## Lane Work Cursor

**Active lane-level scope:** none — router-only baseline  
**Blocker:** none at lane-rule level  
**Next action:** route work to the narrowest independently continued English scope. Do not appoint one module as English's global active child merely because it was worked on most recently.

English currently has three independently continued learner-facing scopes with their own Work Cursor and Acceptance Truth:

| Scope | Work Cursor | Acceptance Truth |
| --- | --- | --- |
| Objective — Reading A / Cloze / Reading B | `content/english/modules/objective/CURRENT.md` | `content/english/modules/objective/ACCEPTANCE.md` |
| Translation | `content/english/modules/translation/CURRENT.md` | `content/english/modules/translation/ACCEPTANCE.md` |
| Writing | `content/english/modules/writing/CURRENT.md` | `content/english/modules/writing/ACCEPTANCE.md` |

Their current stages belong only to those local `CURRENT.md` owners. Do not copy them into this lane router.

Objective, Translation and Writing may progress concurrently when their current work is independent. A blocker in one module does not freeze the others unless a genuine shared English/runtime/integration dependency links them.

English has no lane-level `ACCEPTANCE.md` at present: current Acceptance Truth already belongs to the three independently continued scopes above. Do not add an aggregate Acceptance owner unless a future English-wide claim has its own distinct evidence responsibility.

Hard scheduling boundary:

```text
English capability hierarchy
= ownership / routing

Construction dependency
= what one module actually needs from another to proceed correctly

Kian learner order
= the sequence Kian should actually study/use
```

These are not automatically the same.

---

## Independent re-acceptance directive｜anti-cocoon audit

This is a **user-requested re-acceptance instruction**, not a new eighth gate and not an automatic revocation of existing PASS claims.

Purpose:

> prevent a self-confirming loop in which the same implementation / validator / Acceptance chain defines the expected answer and then proves itself internally consistent without enough independent challenge.

When Kian asks to **重新验收 / independent audit / fresh acceptance** for Objective, Translation or Writing, apply this directive to that module independently. These modules may be re-audited in parallel when their evidence chains are independent.

### Anti-anchoring entry

For the first-pass audit:

1. use this lane `CURRENT.md` only to route to the target module and identify inherited English owners;
2. resolve the target's actual Source / canonical module asset / learning contract / runtime owners;
3. treat existing module `CURRENT.md`, `ACCEPTANCE.md`, prior PR summaries and old PASS language as **claims to be tested, not evidence**;
4. if the local `CURRENT.md` must be read for paths, ignore its verdict/status prose as proof;
5. before using the old scoped `ACCEPTANCE.md` to reconcile history, form a provisional S–E judgment from actual artifacts, inherited contracts and independent evidence;
6. only then read the old Acceptance and explain agreement/delta explicitly.

The auditor should be a **fresh Chat / fresh auditor when practical**. A builder Chat that designed or repaired the same gate is `SELF` evidence, not independent review merely because it changes tone.

### Evidence declaration

Every re-accepted gate must state the evidence actually supporting it. Do not collapse these into one score.

Evidence modes:

```text
STRUCTURAL   schema / identity / static source inspection / contract presence
EXECUTED     the claimed behavior was actually executed through the relevant path
ADVERSARIAL  deliberate negative / edge / mutation / contradiction challenge survived
REAL_USE     Kian actually used the path
TRANSFER     later fresh / unseen evidence survived across time/context
```

Independence labels:

```text
SELF                    builder / same reasoning chain
FRESH_AUDITOR           fresh audit not anchored to the old verdict
AUTHORITATIVE_EXTERNAL  independent authoritative source / benchmark where applicable
REAL_USER               Kian's observed real use
```

`REAL_USE` / `TRANSFER` cannot be simulated by CI or another model and remain U / later real-evidence territory.

### Minimum challenge floor by gate

- **S:** inventory/count/hash is not enough by itself. Independently sample passages/questions/prompts/options/official answers/provenance and verify that protected unseen material has not leaked into ordinary learning/review surfaces.
- **K:** construct an expected ability/content map before using the current module asset as the answer key; inspect **negative space** — important reading/cloze/translation/writing ability that could be absent even if current taxonomy and validators agree with each other.
- **L:** generate at least one plausible alternative learner route and review unit; challenge passage/set/essay-level cognition versus item/segment-level internal evidence. Re-test when official/fresh material enters, when Chat adapts, and when stable correct work should simply pass.
- **P:** inspect the rendered learner surface for answer/reference leakage, premature diagnosis/model-output exposure, density/friction, skip behavior and whole-unit continuity. Static component/string presence alone is STRUCTURAL evidence.
- **R:** execute clean PASS, wrong/uncertain, repair/return, resume and protected-holdout/fresh paths where applicable. Source inspection alone cannot establish Runtime PASS.
- **E:** adversarially test first-attempt preservation, item/segment evidence versus learner-facing unit, diagnosis≠repair, repair≠mastery, cascade/root-cause routing, durable debt admission and fresh/unseen transfer semantics. Critical guards should demonstrate detection power through targeted negative/mutation cases.
- **U:** real learner use only; never upgraded by synthetic audit.

### Falsification rule

For each material PASS, the auditor must answer:

> **What is the strongest realistic way this claim could be false even though the current validators are green?**

Then test the highest-value challenge that can materially change the verdict.

Old validators are evidence, not Acceptance Truth. A validator proving that expected strings/schema exist proves a structural contract; it does not prove the composed learner behavior unless the path is independently executed/challenged.

If only `SELF + STRUCTURAL` evidence exists for a material R/E claim, do **not** call the independent re-acceptance complete. Gather executed/adversarial evidence or leave the independent audit explicitly incomplete.

If the audit finds a real defect, reopen only the **earliest responsible gate/object** and freeze only its dependent chain. Do not reopen unrelated English modules for symmetry.

### English-specific challenge focus

Prioritize:

- whether protected true exams / fresh passages / prompts remain genuinely unseen until their authorized use;
- whether Objective cognition stays passage/set-level even though evidence is per question;
- whether Translation preserves a clean independent attempt before diagnosis/reference and keeps repair local to the actual failed segment/mechanism;
- whether Writing teaches reusable composition mechanisms without burning protected true prompts or letting model output become the primary learner action;
- whether stable correct/confident work has a low-friction PASS path without manufactured diagnosis/review debt;
- whether answer/model/reference leakage can occur through collapsed panels, state restore, history, cross-surface handoff or retry;
- whether current validators can actually detect intentionally injected leakage, forced-debt, wrong-object return or stale-evidence defects.

### Required re-acceptance output

The re-audit should report, per gate:

```text
previous claim
independent provisional verdict
Evidence modes
Independence labels
strongest falsification attempted
material delta / blocker / debt
```

Do not create a second permanent acceptance system. Update the target module's existing `ACCEPTANCE.md` / `CURRENT.md` only if the evidence actually changes its claim or next action.

---

## Retired continuation boundary

`content/english/continuation.json` remains a retired tombstone with `status=RETIRED`, `authority=NONE`, `normal_read=false`.

It is not a Work Cursor, Acceptance owner, Artifact owner, learner-state store, or normal startup read. Do not add new progress/history to it.

---

## Stable English owners

- source / content owner map → `content/english/manifest.json`
- lane learning semantics → `content/english/LEARNING_CONTRACT.md`
- canonical source root → `content/english/source/`
- provenance → `content/english/provenance.json`
- module Artifact owners → `content/english/modules/`
- learner-facing runtime → English surfaces under `static-web/`

Repository-wide requirements, architecture, construction order, acceptance semantics and shared mature platform capability remain inherited from root owners rather than copied here.

Learner sequence defined by English cognition does not automatically serialize independent module construction.

---

## Truth boundary

For any English scope distinguish:

- **Artifact Truth** → actual source/content/module/runtime owners;
- **Acceptance Truth** → the narrowest scoped `ACCEPTANCE.md` / exact evidence owner;
- **Learner Truth** → private learner/runtime state, never inferred from shared repository work;
- **Work Cursor** → the relevant scoped `CURRENT.md`.

A module being implemented/accepted does not mean Kian has studied it.

---

## Fresh-Chat routing

Known independently continued scope — ordinary continuation:

```text
scope CURRENT
→ scoped ACCEPTANCE / exact required owner(s)
→ work
```

Known independently continued scope — **independent re-acceptance**:

```text
English CURRENT anti-cocoon directive
→ target actual owners + inherited English contracts
→ provisional S–E challenge verdict
→ only then old scoped ACCEPTANCE for reconciliation
→ update narrow owner only if evidence changes the claim
```

English lane known but sub-scope not yet named:

```text
English CURRENT
→ choose Objective / Translation / Writing
→ local CURRENT
→ exact required owner(s)
```

Multiple English module Chats may use these local paths concurrently. Each scope advances only its own earliest unresolved eligible stage/gate along its real dependency chain.

Read `content/english/LEARNING_CONTRACT.md` only when the task actually concerns English-wide cognition, capability ownership or learning/evidence relationships.

Do not read retired English continuation, unrelated modules, history, legacy repositories, or prior Chats by default.
