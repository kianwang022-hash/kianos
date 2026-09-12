# KianOS Governance Acceptance

Status: CURRENT on `governance/federated-current-v2-20260912`  
Scope: Project Definition / Architecture / routing-governance redesign  
Standards: `PROJECT_DEFINITION.md` §6 + `ARCHITECTURE.md` §12

This file owns **governance acceptance evidence and merge-readiness claims** for the redesign.

It does not own project requirements, architecture, lane Artifact Truth, lane Acceptance Truth, learner state, or the root Work Cursor.

---

## Current governance readiness

```text
A1 Fresh Chat            PASS
A2 Truth Separation      PASS
A3 Parallel Chat         PASS
A4 Owner Uniqueness      PASS
A5 Three-month Entropy   BLOCKED_BY_EXECUTION_ENVIRONMENT
A6 Learning Closure      PASS

MERGE TO MAIN            NOT_READY
```

Current blocker to governance landing:

> the minimal anti-entropy gate exists, but GitHub-hosted execution has twice failed before runner allocation (`steps=[]`), and the current container cannot resolve GitHub DNS for an exact local checkout. No lint assertion has executed yet.

Do not convert this environment blocker into either PASS or a governance defect.

---

# A1｜Fresh Chat Test — PASS

Requirement:

> known scope → effective work in roughly 2–4 precise reads, without prior-chat recall or repository-wide archaeology.

Current restart paths after migration:

| Known scope | Normal startup path | Reads before exact work |
| --- | --- | ---: |
| English Writing | Writing `CURRENT` → Writing `ACCEPTANCE` → exact active runtime/evidence owner(s) | 3–4 |
| English Objective | Objective `CURRENT` → Objective `ACCEPTANCE` → acceptance workflow / exact pending gate | 3 |
| English Translation | Translation `CURRENT` → Translation `ACCEPTANCE` → canonical learning / QA entry needed by audit | 3 |
| Xizong A2 | Xizong `CURRENT` → Xizong `ACCEPTANCE` → A2 System → exact Block slice | 3–4 |
| Lexical K reacceptance | Lexical `CURRENT` → Lexical `ACCEPTANCE` → current Issue #6 checkpoint → exact Natural/Relation owner | 4 |
| Politics History | Politics `CURRENT` → Politics `ACCEPTANCE` → History content audit → exact review exception | 4 |
| Politics Marxism seal | Politics `CURRENT` → Politics `ACCEPTANCE` → Politics QA / exact pending gate | 3 |

The Lexical re-entry was explicitly reduced from five routine reads by making the knowledge-reacceptance README a method reference rather than a mandatory startup hop.

Retired lane continuation narratives are not normal reads.

Evidence owners:

- `content/english/CURRENT.md` + sub-lane Currents;
- `content/xizong/CURRENT.md`;
- `content/lexical/CURRENT.md`;
- `content/politics/CURRENT.md`.

---

# A2｜Truth Separation Test — PASS

Every migrated first-class lane now exposes four separate answers:

```text
Artifact Truth   → real natural/canonical source/content/runtime owners
Acceptance Truth → scoped ACCEPTANCE owner
Learner Truth    → private learner/browser/conversation state only
Work Cursor      → scoped CURRENT.md
```

Concrete safeguards now present:

- English Objective / Translation / Writing have independent `CURRENT + ACCEPTANCE` owners;
- Xizong A1 `S–E PASS` explicitly cannot become “Kian should do System Recall”; A2 K is a worker acceptance task, not learner progress;
- Lexical full-catalog runtime existence cannot outrun reopened `K BLOCKED` semantic fidelity;
- Politics teaching-projection completeness cannot become whole-subject acceptance, and K03 acceptance cannot become learner progress;
- no-start CI is neither PASS nor product failure;
- module-ready claims keep U separate from engineering acceptance.

No shared repository Work Cursor owns private learner progress.

---

# A3｜Parallel Chat Test — PASS

The redesign permits lane-local work and does not require root status writes for ordinary lane progress. A branch being behind `main` is not itself a defect.

## Real concurrency case exercised

While governance work continued, `main` advanced by 18 commits. The true main-side overlap was concentrated in Politics:

- Politics QA workflow;
- Politics continuation;
- Marxism/History audit and learning evidence;
- Politics Unit Return runtime/evidence implementation.

English / Xizong / Lexical were not in that latest-main overlap set.

The conflict was reconciled without restarting the governance work:

1. governance routing/owner tree remained the base;
2. 13 exact Politics Artifact blobs from main commit `3409db7acfe74fdd8205927f6d39c285970811a7` were overlaid unchanged;
3. `content/politics/continuation.json` was intentionally not restored because its latest current facts had already been extracted into `content/politics/CURRENT.md` and `content/politics/ACCEPTANCE.md`;
4. merge commit `2e4b7b978bc87a6514e472bed6684af73ba44909` has both the governance head and latest-main head as parents.

Post-reconciliation evidence:

```text
governance branch vs main: ahead 46 / behind 0
PR #21 mergeable: true
```

This demonstrates the intended rule:

> unrelated main progress does not invalidate the whole branch; reconcile only actual overlapping owners/write-sets while preserving newer parallel Artifact work.

A3 therefore passes.

---

# A4｜Owner Uniqueness Test — PASS

Current owner model after migration:

## Root

- project requirements → `PROJECT_DEFINITION.md`
- architecture → `ARCHITECTURE.md`
- worker operating rules → `AGENTS.md`
- governance acceptance evidence → `GOVERNANCE_ACCEPTANCE.md`
- root Work Cursor → `CURRENT.md`

## English

- lane Work Cursor → `content/english/CURRENT.md`
- Objective / Translation / Writing Work Cursors → local `CURRENT.md`
- corresponding readiness → local `ACCEPTANCE.md`
- old English continuation → retired tombstone, `authority=NONE`, removed from manifest owner map

## Xizong

- Work Cursor → `content/xizong/CURRENT.md`
- Acceptance Truth → `content/xizong/ACCEPTANCE.md`
- old `learner/continuation.json` → retired tombstone
- old mixed `learner/acceptance-status.json` → retired tombstone
- medical Core / learning support remain in natural owners

## LexicalOS

- Work Cursor → `content/lexical/CURRENT.md`
- Acceptance Truth → `content/lexical/ACCEPTANCE.md`
- semantic owners → Natural Word / Relation owners
- active K audit evidence → Issue #6 + knowledge-reacceptance audit tree
- old continuation → retired tombstone and removed from manifest owner map

## Politics

- Work Cursor → `content/politics/CURRENT.md`
- Acceptance Truth → `content/politics/ACCEPTANCE.md`
- source/learning/runtime remain natural Artifact owners
- old continuation → retired tombstone and removed from manifest owner map

Retired compatibility paths are pointers only and are not competing owners.

---

# A5｜Three-month Entropy Test — BLOCKED_BY_EXECUTION_ENVIRONMENT

The structural redesign directly removes the observed entropy mechanisms:

- 10–20 KB narrative continuation files are no longer startup authorities;
- root Current no longer aggregates lane progress;
- acceptance evidence no longer lives inside Work Cursor narratives;
- learner state is explicitly separated from engineering Current;
- known scopes have bounded read paths;
- rules inherit from root rather than being copied into each lane;
- Git history preserves retired narrative without keeping it hot in normal reasoning.

## Minimal anti-entropy guard now implemented

- script → `tools/governance_current_audit.py`
- workflow → `.github/workflows/governance-anti-entropy.yml`

The guard deliberately checks only observed failure classes:

1. required Current / Acceptance owners exist;
2. Current files remain bounded and do not regain known narrative-status-log structures;
3. retired continuation / legacy acceptance paths remain `RETIRED`, `authority=NONE`, `normal_read=false`;
4. Current manifests do not point back to retired continuation / acceptance paths;
5. numbered Required-reads lists do not make continuation a mandatory hop.

It does not inspect domain semantics or learner mastery.

## Execution evidence

PR #21 head initially triggered Governance Anti-Entropy run `34678774566`.

First job:

```text
job 103513328146
conclusion: failure
steps: []
logs: unavailable
```

One bounded rerun was requested. Rerun job:

```text
job 103513462017
conclusion: failure
steps: []
```

No checkout, Python setup, or audit assertion executed in either attempt.

A local exact-head fallback was also attempted, but the current container could not resolve `github.com`, so the branch could not be checked out for truthful local execution.

Therefore:

> **A5 is not a lint failure. A5 is also not PASS. It is blocked because no execution environment has actually run the gate.**

Do not weaken the acceptance rule merely to finish governance.

---

# A6｜Learning Closure Test — PASS

Governance simplification has not weakened learning acceptance.

Observed safeguards:

- root `LEARNING_ASSET_STANDARD.md` still owns construction order;
- root `LEARNING_ACCEPTANCE.md` still owns S/K/L/P/R/E/U semantics;
- Translation refuses to promote rich implementation/validators into formal PASS without reacceptance;
- Lexical downstream P/R/E are blocked by upstream K semantic-fidelity defects despite mature runtime Artifact;
- Politics whole-subject gates remain UNTESTED despite complete teaching projection and implemented acceptance candidates;
- Xizong A1 engineering acceptance preserves U as path-scoped UNTESTED;
- English Objective distinguishes known shared-browser evidence from still-pending task-browser seal.

Therefore governance routing did not convert engineering completion into learning closure.

---

# Merge rule

PR #21 remains draft and mergeable, but **not merge-ready**.

Required remaining evidence:

```text
an execution environment actually runs Governance Anti-Entropy
→ audit assertions PASS
→ reread exact governance owners at that head
→ confirm A1–A6 still hold
→ only then mark governance merge-ready
```

If `main` advances again before that point, repeat only the bounded overlap reconciliation required by changed owner/write-sets; do not restart unrelated lane governance.

`main@HEAD` remains the durable shared Current after accepted landing. This draft branch is an execution surface only.
