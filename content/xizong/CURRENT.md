# Xizong Current

Role: Xizong lane Work Cursor + independently continued System router  
Parent: root `CURRENT.md`

This file does not own medical Core, lane learning semantics, scoped Acceptance Truth, or Kian's learner progress.

---

## Lane Work Cursor

**Active lane-level scope:** none — router-only baseline  
**Blocker:** none at lane-routing level  
**Next action:** route work directly to the requested independently continued System `CURRENT.md`. Do not appoint one System as Xizong's global active child merely because it was worked on most recently.

Current independently continued Systems:

| Scope | Work Cursor | Acceptance Truth |
| --- | --- | --- |
| A1 Circulation | `content/xizong/knowledge/systems/a1-circulation/CURRENT.md` | `content/xizong/knowledge/systems/a1-circulation/ACCEPTANCE.md` |
| A2 Respiratory | `content/xizong/knowledge/systems/a2-respiratory/CURRENT.md` | `content/xizong/knowledge/systems/a2-respiratory/ACCEPTANCE.md` |
| A3 Urinary | `content/xizong/knowledge/systems/a3-urinary/CURRENT.md` | `content/xizong/knowledge/systems/a3-urinary/ACCEPTANCE.md` |

A1/A2/A3 current stages and gate claims belong only to those local owners. Do not copy their detailed state back into this lane router.

These Systems may be worked on concurrently when their current tasks are independent. If a shared Xizong owner/runtime creates a real dependency, name that dependency explicitly and coordinate only the affected scopes.

Hard scheduling boundary:

```text
System hierarchy
= ownership / learning-domain structure

System construction dependency
= whether one System's current artifact/decision is required by another

Kian learner order
= the sequence Kian should actually study
```

These are not automatically the same.

---

## Independent re-acceptance directive｜anti-cocoon audit

This is a **user-requested re-acceptance instruction**, not a new eighth gate and not an automatic revocation of existing PASS claims.

Purpose:

> prevent a self-confirming loop in which the same implementation / validator / Acceptance chain defines the expected answer and then proves itself internally consistent without enough independent challenge.

When Kian asks to **重新验收 / independent audit / fresh acceptance** for an Xizong System, apply this directive to that System independently. A1/A2/A3 may be re-audited in parallel; this parent router must not serialize them.

### Anti-anchoring entry

For the first-pass audit:

1. use this lane `CURRENT.md` only to route to the target System and identify inherited Xizong owners;
2. resolve the target's actual Source / medical Core / learning-support / runtime owners;
3. treat the target System's existing `CURRENT.md`, `ACCEPTANCE.md`, prior PR summaries and old PASS language as **claims to be tested, not evidence**;
4. if the local `CURRENT.md` must be read for paths, ignore its verdict/status prose as proof;
5. before using the old scoped `ACCEPTANCE.md` to reconcile history, form a provisional S–E judgment from actual artifacts, inherited contracts and independent evidence;
6. only then read the old Acceptance and explain agreement/delta explicitly.

The auditor should be a **fresh Chat / fresh auditor when practical**. A builder Chat that designed or repaired the same gate is `SELF` evidence, not independent review merely because it changes tone and says it is being critical.

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

- **S:** count/hash/schema is not enough by itself. Independently sample provenance, omissions, boundary cases and protected/fresh material; ask whether Source and current taxonomy could be jointly missing the same area.
- **K:** construct an expected high-value concept/mechanism map before using the current Core as the answer key; explicitly inspect **negative space** — what should exist but is absent. Use authoritative medical/exam evidence when the Current source boundary cannot independently settle the question.
- **L:** generate at least one plausible alternative learner route/surface allocation and ask why the accepted route is better for Kian. Re-test `iPad / MarginNote original Lecture = external-primary` versus KianOS companion behavior rather than inheriting it from existing Astro implementation.
- **P:** material learner-facing claims require inspection of the rendered/interactive surface where practical. Static string/component presence alone is STRUCTURAL evidence, not full Projection behavior evidence.
- **R:** execute material state transitions under realistic private/browser state. Static `includes(...)` checks may guard contracts but cannot alone establish Runtime PASS.
- **E:** adversarially test overwrite, stale-version invalidation, repeated evidence, root-cause/cascade debt, repair≠mastery, fresh/holdout protection and cross-tab/state handoff. Critical guards should demonstrate that at least one targeted mutation/negative case would actually turn the acceptance red.
- **U:** real learner use only; never upgraded by synthetic audit.

### Falsification rule

For each material PASS, the auditor must answer:

> **What is the strongest realistic way this claim could be false even though the current validators are green?**

Then test the highest-value challenge that can materially change the verdict.

Old validators are evidence, not Acceptance Truth. A validator proving that source text contains its expected strings proves a structural contract; it does not prove the composed behavior unless the behavior is independently executed/challenged.

If only `SELF + STRUCTURAL` evidence exists for a material R/E claim, do **not** call the independent re-acceptance complete. Gather executed/adversarial evidence or leave the independent audit explicitly incomplete.

If the audit finds a real defect, reopen only the **earliest responsible gate/object** and freeze only its dependent chain. Do not reopen unrelated Systems for symmetry.

### Xizong-specific challenge focus

For A1/A2/A3, prioritize:

- independent medical/concept negative-space checks rather than deriving completeness only from current KP/question inventories;
- Question Truth / Source scope omissions that current mappings could fail to reveal because both sides share the same blind spot;
- causal System→Block→Logic Group→KP learning structure versus teacher/file/question order;
- external-primary Lecture ownership, cross-device return friction and accidental second-textbook behavior in Astro;
- real browser/state behavior for Recall, completion, holdout, W/U repair, stale-version invalidation and evidence preservation;
- mutation tests for critical Runtime/Evidence guards so green CI demonstrates detection power, not just conformance to current strings.

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

Do not create a second permanent acceptance system. When a re-audit is complete, update the target System's existing `ACCEPTANCE.md` / `CURRENT.md` only if the evidence actually changes its claim or next action.

---

## Systems that are not first-class governance scopes yet

The medical hierarchy contains additional Systems, Blocks and KPs, but hierarchy alone does not justify a local `CURRENT / ACCEPTANCE` pair.

Create a future System sub-lane only when:

- workers routinely enter/continue it independently;
- it owns a distinct Work Cursor or acceptance boundary;
- local routing materially lowers normal read cost or ambiguity;
- the new owner replaces duplication rather than adding another summary.

Until then, those Systems remain canonical medical/learning objects under the lane without extra governance files.

Do not create System-level `LEARNING_CONTRACT.md` files merely for symmetry. Lane cognition remains owned by `content/xizong/LEARNING_CONTRACT.md`; System-specific learner order/closure remains in justified `*-learning.json` support.

Learner order in those owners does not automatically serialize engineering/construction work across Systems.

---

## Stable lane owners

### Artifact / learning owners

- knowledge owner map → `content/xizong/knowledge/manifest.json`
- canonical medical Core → `content/xizong/knowledge/systems/**`
- lane learning constitution → `content/xizong/LEARNING_CONTRACT.md`
- detailed shared learning policy → `content/xizong/knowledge/learner/study-policy.json`
- System-specific learning support → `content/xizong/knowledge/learner/`
- official questions / explanations / reviewed relations → dedicated Xizong roots
- learner runtime → Xizong surfaces under `static-web/`

### Lane Acceptance

`content/xizong/ACCEPTANCE.md` owns only genuine Xizong-wide integration/readiness claims. System readiness belongs to each local Acceptance owner.

A lane-wide integration claim may depend on multiple Systems, but that does not turn the parent lane into a serial scheduler for child construction.

### Learner Truth

Private learner/browser/conversation evidence only. System readiness or lane Work state cannot manufacture Kian's study progress or next learner action.

---

## Fresh-Chat routing

Known A1/A2/A3 ordinary continuation:

```text
requested System CURRENT
→ requested System ACCEPTANCE
→ exact owner required by its earliest unresolved gate
→ work
```

Known A1/A2/A3 **independent re-acceptance**:

```text
Xizong CURRENT anti-cocoon directive
→ target System actual owners + inherited contracts
→ provisional S–E challenge verdict
→ only then old scoped ACCEPTANCE for reconciliation
→ update narrow owner only if evidence changes the claim
```

Xizong lane known but exact System not yet resolved:

```text
Xizong CURRENT
→ choose requested independently continued System when applicable
→ local CURRENT
→ exact required owner(s)
```

Multiple System Chats may use these local paths concurrently. Each System advances only its own earliest unresolved eligible stage/gate along its real dependency chain.

Read the lane Learning Contract only when the task actually concerns Xizong cognition, learner order, phase linkage or System/Block/KP learning boundaries.

Do not read retired continuation/acceptance snapshots, unrelated Systems, history, legacy repositories or prior Chats by default.
