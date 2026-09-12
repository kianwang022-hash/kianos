# KianOS Architecture

Status: CURRENT — accepted top-level architecture
Version: 1.0

This document defines **how KianOS is structurally organized to satisfy the project requirements**.

Authority order:

```text
PROJECT_DEFINITION.md
→ ARCHITECTURE.md
→ repository-wide Standards / Contracts
→ lane / sub-lane Contracts
→ Artifact / Acceptance / Learner owners
→ CURRENT Work Cursors
→ temporary worker / branch execution
```

Architecture is downstream of Project Definition. If this structure fails Fresh Chat, Truth Separation, Parallel Chat, or Three-month Entropy tests, Architecture changes; the Requirement does not bend to preserve implementation convenience.

---

# 1｜Core architecture model

KianOS is a **federated, restartable, concurrent learning workspace** with recursive local autonomy.

Default hierarchy:

```text
KianOS Root
→ Lane
→ independently-continuable Sub-lane when justified
→ Natural / Canonical Owners
→ Learner-facing Runtime
```

Examples of first-class lanes include Xizong, English, LexicalOS, and Politics.

A sub-lane becomes first-class only when independent entry/continuation is common enough that a local Work Cursor materially reduces read cost or ambiguity.

Do **not** create hierarchy merely because a directory exists.

---

# 2｜Project Definition, Architecture, and Operating Cycle

KianOS uses three different levels:

```text
Project Definition
what / why / requirements / invariants
        ↓
Architecture
owners / hierarchy / boundaries / inheritance
        ↓
Operating Cycle
Design → Implement → Accept → Use → Observe → Revise
```

The Operating Cycle runs repeatedly inside the Architecture.

A downstream defect may reopen the earliest responsible upstream layer, but ordinary implementation work does not rewrite Project Definition or Architecture.

---

# 3｜Three Truths + One Cursor

KianOS separates three kinds of reality from one kind of action pointer.

## 3.1 Artifact Truth｜what actually exists

Artifact Truth answers:

> **What source, content, semantic owner, code, runtime, page, capability, or product asset actually exists now?**

Artifact Truth is distributed across the real canonical assets that own those facts.

Typical owners include:

- source / provenance owners;
- Natural Owners / canonical content assets;
- manifests only where routing/identity is their real responsibility;
- actual runtime/source code;
- learner-facing projection implementation.

Do not create a second central “artifact status database” merely to summarize what the real owners already prove.

## 3.2 Acceptance Truth｜what has actually been demonstrated

Acceptance Truth answers:

> **What readiness / quality claim is supported by current evidence?**

`LEARNING_ACCEPTANCE.md` defines the repository-wide S/K/L/P/R/E/U standard. It is a **standard**, not the current evidence ledger itself.

Actual Acceptance Truth belongs to the narrowest scope that needs durable acceptance tracking, for example a lane, independently entered sub-lane, or bounded module acceptance owner.

Acceptance owners may reference build/schema/E2E evidence, but must not copy Artifact Truth wholesale or infer Learner Truth.

## 3.3 Learner Truth｜what Kian has actually learned or done

Learner Truth answers:

> **What has Kian actually studied, attempted, repaired, transferred, forgotten, deferred, or demonstrated?**

Private learner state is **not shared repository Artifact Current**.

Its owner may be learner/runtime-local storage or another explicitly authorized private learner-state owner. Shared repository engineering state must never manufacture Learner Truth.

Hard rule:

```text
Artifact Truth ≠ Acceptance Truth ≠ Learner Truth
```

No one may be silently inferred from another.

## 3.4 Work Cursor｜what the current worker should do next

Work Cursor is not a fourth Truth.

It answers:

> **For this scope, what is the active / earliest unresolved stage, blocker, and next action?**

The canonical human/Chat-facing Work Cursor is `CURRENT.md` at the relevant independent scope.

`CURRENT` is a navigation/control surface, not a historical log and not a second Truth owner.

---

# 4｜CURRENT architecture

## 4.1 Root `CURRENT.md`

Root Current has two narrow responsibilities:

1. route a worker to the correct independently continued scope when the target scope is not already known;
2. hold the root-level Work Cursor only when genuine repository-wide governance/integration work is active.

Root Current must not aggregate detailed lane progress or duplicate lane Truth.

If the target lane is already known and repository governance is already understood, a worker may go directly to the lane Current.

## 4.2 Lane `CURRENT.md`

Every first-class lane has one predictable local Work Cursor entry:

```text
content/<lane>/CURRENT.md
```

A lane Current should contain only enough to restart current work:

```text
scope
active / earliest unresolved stage
blocker
next action
frozen / out-of-scope
required reads
references to relevant Artifact / Acceptance / Learner boundaries
```

It must not contain:

- historical narrative;
- large completed-work logs;
- copied Contract text;
- copied acceptance evidence;
- copied Artifact Truth inventories already owned elsewhere;
- learner progress inferred from engineering state;
- unrelated sibling-lane status.

## 4.3 Sub-lane `CURRENT.md`

Create a sub-lane Current only when the sub-lane is genuinely independently entered/continued and local routing reduces read cost.

Qualification test:

- workers routinely continue this scope without needing the parent lane's active work;
- it owns a distinct Work Cursor;
- its required read set can be bounded locally;
- creating the Current removes ambiguity rather than duplicating parent state.

If these are false, keep the work under the parent lane Current.

## 4.4 Current is not history

Current describes current work only.

Git history, explicit changelogs, acceptance evidence, recovery artifacts, archived repositories, and retired branches preserve prior events when needed.

Normal Current reasoning does not carry migration narratives or old implementation history forward.

---

# 5｜Continuation policy

`continuation.*` is **not a required architecture layer**.

Each continuation is justified only by a proven narrow machine/process responsibility that Current should not own, such as:

- deterministic structured cursor consumed by automation/runtime;
- stable machine schema/identity state that cannot be represented by simple Current routing;
- another concrete machine dependency proven by current code.

Retire or absorb it when it mainly contains:

- what happened before;
- long progress narrative;
- next-action prose already suitable for Current;
- duplicated acceptance summaries;
- duplicated Contract rules;
- repeated required-read history.

A retained continuation must not become:

- a second Work Cursor;
- a historical journal;
- an Acceptance Truth owner;
- an Artifact Truth owner;
- a learner-state store.

Target fresh-worker path:

```text
known scope
→ scope CURRENT
→ exact required owner(s)
→ work
```

A machine-only continuation may be one of those exact required owners when genuinely necessary, but it is not a mandatory intermediate layer for every scope.

---

# 6｜Rules and inheritance

Repository-wide rules live once at the highest valid owner.

## 6.1 Root standards / contracts

Root owns cross-KianOS rules such as:

- project requirements → `PROJECT_DEFINITION.md`;
- architecture → `ARCHITECTURE.md`;
- worker/repository operating instructions → `AGENTS.md`;
- formal learning-asset construction order → `LEARNING_ASSET_STANDARD.md`;
- S/K/L/P/R/E/U readiness standard → `LEARNING_ACCEPTANCE.md`;
- shared mature learner-surface capabilities → `SYSTEM_CONTRACT.md`;
- temporary branch lifecycle/concurrency mechanics → `BRANCH_LIFECYCLE.md`;
- intentionally postponed repository work → `DEFERRED.md`.

## 6.2 Lane contracts

Lane contracts contain only cognition/rules genuinely different from root standards or parent contracts.

They reference inherited root rules rather than copying them.

## 6.3 Sub-lane contracts

A sub-lane gets a durable local contract only when its cognition or execution semantics genuinely differ enough to require one.

Do not normalize one file per folder.

---

# 7｜Learning-asset construction and acceptance

Formal learning-asset work follows `LEARNING_ASSET_STANDARD.md`.

Construction order:

```text
Truth / Knowledge Boundary
→ Learning Logic
→ Content Realization / Optimization
→ Projection / Interaction
→ Runtime Loop
→ Evidence / Acceptance
```

Only the earliest unresolved construction stage is ACTIVE by default; affected downstream stages remain frozen.

Readiness is then judged independently through `LEARNING_ACCEPTANCE.md`:

```text
S / K / L / P / R / E / U
```

Construction stage and acceptance gate must not substitute for each other.

Most importantly:

```text
Artifact exists
≠ Acceptance PASS
≠ Kian learned it
```

---

# 8｜Concurrency and write boundaries

Concurrency is normal.

## 8.1 Lane-local default

Ordinary lane/sub-lane work writes only:

- the active scope's canonical Artifact owner(s);
- its local Acceptance owner when acceptance evidence changes;
- its local Work Cursor when the next action changes;
- exact runtime files in the authorized scope.

It does not update root governance merely to record ordinary progress.

## 8.2 Branch semantics

`main@HEAD` is the durable shared Current repository state.

Temporary branches are execution surfaces, not truth owners.

A branch becoming behind `main` is not itself a defect.

Reconcile only when:

- intended write-sets overlap;
- authority/owner definitions changed;
- inherited parent rules materially changed for the child scope.

Branch landing / retirement follows `BRANCH_LIFECYCLE.md`.

## 8.3 Scope containment

A worker acts only within the authorized scope.

Cross-scope defects may be reported or may block the current task. They are not permission for opportunistic unrelated repair.

---

# 9｜History and recovery boundary

Normal operation is current-authority-first.

Historical repositories, retired branches, migration records, old Issues, old releases, or prior runtime implementations are not normal semantic fallback.

History may be inspected only for a bounded recovery, rollback, historical comparison, or migration task.

Once the accepted recovery result is represented in Current authority, normal work returns immediately to current-only reasoning.

---

# 10｜Anti-entropy guardrails

KianOS uses lightweight governance checks specifically to prevent recurring structural entropy.

The guard is intentionally narrow and should only expand when a real repeated failure class appears. Current checks defend against:

- Current becoming oversized/narrative;
- required Current / Acceptance owners disappearing;
- retired continuation / legacy acceptance paths returning to authority;
- manifests pointing back to retired owners;
- continuation reappearing as a mandatory required-read hop.

Additional checks are added only when observed failures justify them.

The lint exists to defend requirements R1–R8, not to create a second governance platform.

---

# 11｜Requirement traceability

Every durable architecture choice must map to at least one real Project Requirement.

| Architecture decision | Primary requirement owner |
| --- | --- |
| Predictable scope Current entry | R1 Restartability, R3 Bounded context |
| Lane/sub-lane federation | R2 Local autonomy, R6 Concurrency |
| Single canonical owner | R4 Single authority, R8 Anti-entropy |
| Artifact / Acceptance / Learner separation | R5 Truth separation, R9 Learning quality |
| CURRENT as Work Cursor only | R1, R3, R5, R8 |
| continuation not mandatory | R3, R4, R8 |
| inherited rules instead of copies | R4, R8 |
| lane-local write sets | R6, R7 |
| earliest unresolved learning stage | R7, R9 |
| history excluded from normal fallback | R3, R8 |
| lightweight entropy lint | R8 |
| temporary branches not truth owners | R4, R6, R8 |

If a proposed durable abstraction cannot name a Project Requirement it satisfies, it should not be added by default.

---

# 12｜Architecture acceptance tests

This Architecture remains accepted only while it continues to satisfy:

## A1｜Fresh Chat Test

Known scope → effective work in roughly 2–4 precise reads without prior-chat recall or repository-wide search.

## A2｜Truth Separation Test

For one scope, separately resolve:

- Artifact Truth;
- Acceptance Truth;
- Learner Truth;
- Work Cursor.

No answer may be manufactured from another.

## A3｜Parallel Chat Test

Unrelated lane/sub-lane work can proceed concurrently with minimal ordinary write contention.

## A4｜Owner Uniqueness Test

Important current facts/rules have one canonical owner.

## A5｜Three-month Entropy Test

Continued use should not recreate ballooning Current/continuation files, duplicate rules/status, broad searches, root-contention, or learner/product state leakage.

## A6｜Learning Closure Test

Learner-facing readiness claims still require the learning construction and acceptance standards; governance simplification must not weaken learning evidence.

---

# 13｜Change discipline

The accepted architecture is a baseline, not a license to keep expanding governance.

Normal lower-level upgrades proceed from their own local `CURRENT` and earliest unresolved stage. Root Architecture changes only when real use demonstrates that an existing Project Requirement is not being satisfied reliably enough.

When a new abstraction, registry, automation, status owner, runner layer, dashboard, or shared platform feature is proposed, require this chain:

```text
observed blocker / repeated failure
→ named Project Requirement / Invariant
→ prove the current simpler layer is insufficient
→ choose the smallest reversible architecture change
→ execute / accept / observe
```

If that chain cannot be shown, keep the simpler structure.

No learning content, source semantics, learner evidence, or unrelated runtime behavior should be rewritten merely because governance ownership changes.
