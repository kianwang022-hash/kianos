# English Translation Current

Role: independent Translation Work Cursor + restart entry  
Parent: `content/english/CURRENT.md`

This file does not own Translation content, acceptance evidence, or learner progress.

---

## Work Cursor

**Scope:** English Translation  
**Active / earliest unresolved gate:** `E — Evidence acceptance`  
**Blocker:** none from Runtime. S is `PASS_WITH_DEBT`; K/L/P/R are `PASS`; E is `UNTESTED`; U remains real learner use only.  
**Next action:** run a bounded **E-only** audit of Translation evidence / transfer / closure semantics. If E passes, write the durable transition first; Translation then becomes `Module ready for learner test` with U still `UNTESTED`.

---

## Stage discipline

```text
S  PASS_WITH_DEBT  ← accepted; 3 explicit pending_review Source reference gaps
K  PASS            ← accepted
L  PASS            ← accepted
P  PASS            ← accepted
R  PASS            ← accepted after two fail-closed Runtime blockers were repaired
E  UNTESTED        ← ACTIVE
U  UNTESTED        ← real learner use only
```

`UNTESTED` is evidence status, not a parallel TODO list.

---

## Accepted upstream boundary

### S

27 sets / 135 stable prompts. Three reference rows remain explicit `pending_review` Source debt; missing references stay fail-closed and may not be fabricated.

### K / L

Translation uses a capability-native first-learning path: Representation → Preservation → Reconstruction → Execution → integrated use, then real whole-set Translation. Skill Map/deep leaves are later repair/navigation; clean first output precedes diagnosis/reference; smallest repair requires learner Reconstruction; later fresh transfer outranks same-item correction.

### P

Projection is accepted: pending-target cues stay hidden through Clean Attempt; `HOW YOU LEARN IT` appears before the first-learning exit; Skill/Runtime reference stays progressively disclosed; canonical references do not leak into clean-attempt HTML.

P machine evidence: 161 checks, 27/27 built task pages, 132 available canonical reference rows checked, 0 leaks, 0 issues.

### R

Runtime is accepted after repairing two blockers:

- `REPAIR_NEEDED` may no longer omit `affected_segments` and silently widen repair to the whole set;
- failed Chat-return application is atomic and cannot leave hidden transfer-ledger mutations behind.

R machine evidence from run `34699948489`:

- decision `PASS`
- 40 checks
- 0 issues
- whole-set freeze, clean PASS, immutable first evidence, wrong-task fail-close, required repair slice, atomic failed import, Reconstruction, same-task non-closure, persistence fail-close, and reference non-fabrication all passed.

Full acceptance evidence belongs in `content/english/modules/translation/ACCEPTANCE.md`.

---

## E acceptance target

Judge evidence semantics, not Runtime executability.

Required checks:

- learner-facing review remains whole-set while internal evidence may be segment/clause level;
- first translation remains immutable diagnostic evidence;
- earliest primary failure absorbs explainable cascade effects;
- Reconstruction proves repair execution, not mastery;
- source/same task cannot count as fresh transfer evidence;
- irrelevant later material cannot support or contradict a pending target;
- repeated import from one later task is idempotent, not extra evidence;
- contradictory fresh evidence can reopen an appropriate closed target;
- closure depends on semantically meaningful fresh evidence, not counters;
- only reusable/high-value failures become durable transfer debt;
- private learner evidence stays private/local;
- lexical knowledge debt routes to LexicalOS rather than creating duplicate Translation ownership.

If E passes, readiness becomes:

```text
S  PASS_WITH_DEBT
K  PASS
L  PASS
P  PASS
R  PASS
E  PASS
U  UNTESTED
```

Allowed readiness wording then becomes **Module ready for learner test**.

---

## Required reads

1. `content/english/modules/translation/ACCEPTANCE.md`
2. Evidence hierarchy / memory admission / Frozen Runtime evidence boundary in `content/english/modules/translation/learning.md`
3. transfer/evidence portions of `static-web/src/lib/translationRuntimeModel.mjs`
4. `static-web/src/components/TranslationEvidenceGuard.astro`
5. `static-web/scripts/validate-translation-evidence-guard.mjs`
6. exact Workspace/Storage wiring only when needed to trace evidence ownership or privacy

Do not default-read unrelated Runtime internals, English history, legacy repo, or sibling scopes while E is active.

---

## Frozen / out of scope

During E acceptance:

- U remains real learner use only;
- do not redesign accepted K/L/P/R merely to make Evidence tests pass;
- do not reopen S merely because its explicit reference debt remains;
- do not touch Objective / Writing / other English sibling scopes;
- do not infer or mutate Kian's Learner Truth.

If E exposes a real upstream defect, reopen the earliest responsible gate.

---

## Truth references

**Artifact Truth:** Translation evidence/transfer owners and exact supporting Runtime wiring.  
**Acceptance Truth:** `content/english/modules/translation/ACCEPTANCE.md`.  
**Learner Truth:** private learner/runtime state only; repository state is not Kian's learning progress.

---

## Fresh-Chat target

```text
Translation CURRENT
→ Translation ACCEPTANCE
→ Evidence hierarchy / memory-admission boundary
→ exact Evidence owners
→ E only
```

When E passes, write the local durable transition first; the next fresh Chat should recover Translation as learner-test-ready with U still unresolved.
