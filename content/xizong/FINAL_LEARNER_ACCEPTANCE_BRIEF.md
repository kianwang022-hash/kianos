# Xizong Final Learner Acceptance — Fresh Independent Audit Brief

Status: **ACTIVE — Kian-requested final acceptance upgrade**
Role: durable execution brief for a fresh, independent, lane-wide Xizong learner acceptance
Acceptance owner: `content/xizong/ACCEPTANCE.md`
Work cursor: `content/xizong/CURRENT.md`

This task exists because Kian explicitly requested a **higher-quality final acceptance**, not merely more CI.

It is not a continuation of PR #458, not a rerun of historical PASS labels, and not a UI redesign project.

The goal is:

> **Independently determine whether the Current Xizong learning system is actually coherent, truthful, executable, durable and pleasant enough for sustained real study through the exam — and identify the earliest real owner when it is not.**

---

## 1｜Core acceptance principle

Do not equate test volume with acceptance quality.

The audit must distinguish:

```text
Artifact Truth
≠ Acceptance Truth
≠ Learner Truth
≠ Work Cursor
```

Existing CI, prior Human Gates, old Acceptance PASS labels, PR #458 and historical audit reports are **evidence for later reconciliation**, not the answer key.

Real learner `U` remains real-use-only.

The strongest pre-U conclusion is path-scoped **ready for learner test**.

---

## 2｜Authority entry

At execution time, start from current `main@HEAD`.

Read in this order, only expanding when the task actually crosses that owner:

```text
PROJECT_DEFINITION.md
→ ARCHITECTURE.md
→ LEARNING_ACCEPTANCE.md
→ content/xizong/LEARNING_CONTRACT.md
→ content/xizong/knowledge/learner/study-policy.json
→ exact Current System Knowledge / Learning owners needed for the tested path
→ content/xizong/LEARNER_OBJECT_CONTRACT.md
→ content/xizong/projection/PROJECTION_CONTRACT.md
→ static-web/PRESENTATION_CONTRACT.md
→ static-web/XIZONG_UI_REVIEW_PROTOCOL.md
→ accepted Xizong surface owners
→ SYSTEM_CONTRACT.md
→ actual Current renderer/runtime/evidence/handoff implementation
```

Do **not** read old PR conclusions / prior PASS summaries first when forming the independent model.

---

## 3｜Anti-anchoring protocol

### Phase A — independent model first

Before reading PR #458 conclusions or old detailed acceptance evidence:

1. reconstruct the intended Xizong learner loop from Current Rule + canonical owners;
2. identify the strongest plausible failure modes;
3. choose heterogeneous representative Systems / Blocks;
4. record a short pre-evidence checkpoint:
   - expected learner journey;
   - required surface ownership;
   - evidence semantics;
   - likely semantic/runtime/visual failure points.

Only then inspect implementation and prior evidence.

### Phase B — attack Current implementation

Attempt to falsify the Current product.

Do not ask only whether expected buttons/pages exist.

Attack whether the system is **wrong in a way a learner would feel or that corrupts evidence**.

### Phase C — reconcile prior evidence last

Only after independent findings exist:

- inspect scoped Acceptance;
- inspect relevant CI;
- inspect PR #458 and other historical evidence;
- retain prior evidence only where it still proves the Current claim;
- reject stale or proxy evidence.

---

## 4｜Scope model — mature path + honest negative space

This is a lane-wide integration audit, **not** a synthetic aggregate S/K/L/P/R/E score for all A–F.

### Mature representative path

Use materially different Current-ready Systems to pressure-test shared architecture, normally including:

- **A1 Circulation** — mechanism / formulas / comparison / failure logic;
- **A2 Respiratory** — different System cognition plus Visual / Precision / Connection support;
- **A3 Urinary** — different cognitive geometry and accepted external/source-support cases.

Do not assume one representative System proves the others.

### Negative-space path

Explicitly test incomplete / differently mature scopes such as B/C/D/E/F as applicable on current `main`.

Required property:

> **The learner website must not promote unavailable Content, Projection, Practice scope, learner stage, mapping or readiness merely because shared Runtime can technically render it.**

Incomplete scope must fail closed without fake progress, fake qids, guessed mapping, placeholder cognition or misleading Home readiness.

---

## 5｜Required acceptance attacks

### A. Learning-model attack

Freshly challenge whether the Current lane model is still optimal:

```text
System Framework
→ Block Framework
→ original Lecture / MarginNote external-primary learning
→ KP Recall / Logic Group closure
→ Block Recall / Complete
→ Memory release
→ System Recall
→ official Practice
→ W/U
→ smallest useful Repair
→ exact Return
→ later compression
```

Attack at minimum:

- KianOS drifting into a second Lecture;
- Source-contact granularity being incorrectly equated with LG/KP;
- too much surface switching;
- unnecessary first-pass ceremony;
- weak Recall causing forced debt;
- later passes becoming thicker rather than thinner;
- Runtime capability exposing a learner stage before learner eligibility.

If a real learning-model defect exists, reopen the earliest L owner explicitly. Do not hide it as UI polish.

### B. Projection / representation attack

Verify that heterogeneous medical cognition survives Projection and rendering:

- no invented causality/hierarchy/grouping;
- no semantic thinning of canonical Core;
- answer-bearing content cannot leak through map/context/tooltip/hidden DOM before Reveal;
- optional Visual / Precision / Extension stays optional;
- absent support remains absent rather than symmetrical placeholder UI;
- content evolution is normally absorbed by assets/Projection, not topic-name page conditionals.

### C. Runtime / Evidence attack

Prove realistic state transitions, including:

- stable work stays cheap;
- Recall evidence is append-preserved;
- weak evidence does not equal diagnosis/mastery;
- repair does not overwrite original evidence;
- Block Complete and System eligibility use real learner state;
- refresh/restart/navigation does not create impossible state;
- repeated actions are idempotent where required;
- stale content/evidence invalidation fails safely.

### D. External-surface handoff attack

Test the real multi-surface path:

```text
KianOS orientation
→ MarginNote original Lecture
→ real reviewed TTSX checkpoint only when bound
→ one natural return
→ Recall
```

Verify no fake locator, guessed TTSX binding, duplicate web question attempt or manual “where was I?” reconstruction.

### E. Practice / whole-paper attack

Use the same Practice family to test:

- System scope;
- W/U / Marked;
- SECOND_PASS reuse;
- Chat-selected qids;
- whole-paper/year Hidden → Seal → score → same-Workbench Review.

Attack:

- answer/result leakage before legitimate Reveal/Seal;
- formal Attempt creation before Seal;
- wrong historical scoring;
- stale W/U after later Stable attempt;
- Marked being mistaken for automatic debt;
- guessed Question→Knowledge mapping;
- holdout being consumed accidentally;
- separate shadow question/evidence stores.

### F. Chat bridge / repair return attack

This is mandatory for final closure.

Required round trip:

```text
real private learner evidence
→ subject-owned Xizong packet
→ shared Daily Learning Packet when appropriate
→ Chat
→ typed Xizong Return
→ validated import
→ exact learner object / Repair
→ Resume the interrupted mainline
```

Attack:

- packet lacks enough state for Chat to understand what happened;
- Chat must reconstruct state from prose;
- Return can target the wrong Block/KP/question;
- importer accepts malformed/unknown identity;
- repair success is promoted to mastery;
- learner data leaks into public GitHub;
- browser reset / Current sync / Astro restart destroys the only durable learner checkpoint.

If shared Learner Data / Chat Handoff closure is not yet Current, final lane acceptance remains blocked on that exact shared dependency rather than inventing a Xizong-specific replacement.

### G. Visual / Human Gate attack

Inspect real Mac-wide learner output, not only Linux CI screenshots.

At minimum sample:

- Home;
- System Beginner Guide + Framework;
- heterogeneous Block workspaces;
- KP Recall Front / Reveal;
- Block Recall / Complete;
- System Recall;
- Practice Front / Back;
- whole-paper pre-Seal / post-Seal Review;
- Memory / Repair state when meaningful.

Check:

- Dense Calm, not generic dashboard/card wall;
- PingFang-first / substantial readable Chinese;
- useful Mac width;
- no engineering metadata;
- no unexplained empty rails;
- primary cognitive action is obvious;
- no accepted surface geometry drift.

A material visual defect requires Kian Human Gate after repair.

### H. Recovery / evolvability attack

Prove the system survives ordinary change:

- GitHub → Mac Current sync does not corrupt private learner state;
- Current content/projection changes do not require page-specific semantic rewrites;
- learner state survives safe restart/recovery;
- incompatible schema/state fails closed with a recoverable path;
- historical/Legacy assets are not hidden runtime fallback.

---

## 6｜Evidence quality

High-quality acceptance requires more than one evidence class.

Use the smallest sufficient combination of:

- canonical owner readback;
- semantic invariant checks;
- targeted validator tests;
- adversarial/mutation tests;
- real browser E2E;
- persistence/restart tests;
- real macOS visual evidence;
- Kian Human Gate for material visual changes.

Do not multiply broad CI merely for ceremony.

A failing unrelated repository-governance workflow is not automatically a Xizong learner blocker. A passing broad workflow is not automatically learner acceptance.

---

## 7｜Repair rule

When the audit finds a defect:

```text
identify learner-visible / evidence failure
→ locate earliest responsible owner
→ repair smallest responsible scope
→ rerun only affected evidence first
→ run bounded representative regression
→ reconcile lane-wide acceptance
```

Do not opportunistically clean unrelated repository debt.

Do not redesign an accepted surface to solve an ownership/implementation problem.

Do not modify medical Content to make Runtime easier.

---

## 8｜Final acceptance output

Update `content/xizong/ACCEPTANCE.md` only with **genuine lane-wide integration claims** supported by executed evidence.

Do not aggregate child System gates into a fake whole-lane score.

A valid final result may look like:

```text
Lane integration:
- mature Current System first-pass journey: PASS / PASS_WITH_DEBT / BLOCKED
- cross-surface Lecture → Recall return: ...
- shared Practice / W-U / whole-paper: ...
- Chat round trip / durable learner data: ...
- incomplete-System fail-closed behavior: ...
- Mac-wide learner presentation: ...

Scoped System readiness:
→ remains owned by each System ACCEPTANCE.md

U:
→ only paths actually used by Kian may receive learner-validation evidence
```

If A1/A2/A3 are learner-test ready while B/C/D/E/F are at different construction stages, that is legal. The lane passes only the integration properties it actually proves.

---

## 9｜Relationship to PR #458

PR #458 is valuable evidence and may contain valid repairs.

It is **not** this task's authority.

During final reconciliation:

- determine which #458 changes remain necessary under the fresh model;
- keep real fixes;
- reject stale-test churn or historical assumptions that do not prove learner behavior;
- do not count its 121 commits / test volume as acceptance quality;
- do not force this final audit to inherit its exact gate list.

---

## 10｜Stop condition

Stop when all are true:

1. no known blocker remains in the claimed mature Xizong learner paths;
2. incomplete scopes fail closed honestly;
3. Runtime/Evidence/Repair/Return preserve the approved Learning model;
4. Chat handoff and durable learner state are closed or named as the exact remaining blocker;
5. real Mac presentation matches accepted learner geometry;
6. all repaired claims have bounded current-head evidence;
7. `content/xizong/ACCEPTANCE.md` records only truthful lane-wide claims;
8. no learner `U` is manufactured.

Then Xizong engineering returns to **real-use / concrete-defect maintenance**, not periodic broad re-audit.
