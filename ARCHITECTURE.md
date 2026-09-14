# KianOS Architecture

Status: CURRENT — accepted top-level architecture
Version: 1.2

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

Architecture is downstream of Project Definition. If this structure fails Fresh Chat, Truth Separation, Parallel Chat, Three-month Entropy, Learning Closure, or Content Change Absorption tests, Architecture changes; the Requirement does not bend to preserve implementation convenience.

---

# 1｜Core architecture model

KianOS is a **federated, restartable, concurrent learning workspace** with recursive local autonomy.

Default ownership hierarchy:

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

## 1.1 Hierarchy is ownership, not scheduling

The hierarchy answers:

> **Who owns this scope, which rules does it inherit, and where should a worker enter?**

It does **not** answer:

> **Which scope must wait for which other scope?**

Scheduling follows real dependency.

```text
ownership / routing hierarchy ≠ construction dependency ≠ learner order
```

Examples:

- Politics Marxism and History may both be nested under Politics and still progress concurrently;
- Xizong A1/A2/A3 may be sibling Systems and progress concurrently when their current construction work is independent;
- two Blocks may be constructed concurrently even when the approved learner path later consumes them in sequence;
- a parent integration task may depend on several child results, but that dependency must be explicit rather than inferred from parenthood.

Hard rule:

> **Independent scopes may progress concurrently at any justified depth. Within a real dependency chain, downstream work waits for the earliest unresolved dependency.**

A containment edge creates inheritance/routing. It does not create a work-order edge by itself.

---

# 2｜Project Definition, Architecture, and Operating Cycle

KianOS uses three different levels:

```text
Project Definition
what / why / requirements / invariants
        ↓
Architecture
owners / hierarchy / boundaries / inheritance / dependency scheduling
        ↓
Operating Cycle
Design → Implement → Accept → Use → Observe → Revise
```

The Operating Cycle runs repeatedly inside the Architecture and may run concurrently in multiple independent scopes.

A downstream defect may reopen the earliest responsible upstream layer on its own dependency chain, but ordinary implementation work does not rewrite Project Definition or Architecture.

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

> **For this scope, what is the active / earliest unresolved point on the current dependency chain, blocker, and next action?**

The canonical human/Chat-facing Work Cursor is `CURRENT.md` at the relevant independent scope.

`CURRENT` is a navigation/control surface, not a historical log and not a second Truth owner.

A local Current controls only its own scope. It must not serialize independent sibling scopes merely because they share a parent.

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
active / earliest unresolved stage when genuine lane-level work exists
blocker
next action
frozen / out-of-scope
required reads
references to relevant Artifact / Acceptance / Learner boundaries
```

When the lane is acting only as a router, it should **not** appoint one independent child as the lane's globally active child. Each child owns its own Work Cursor and may progress concurrently with independent siblings.

A parent lane may have its own active integration Work Cursor at the same time as child scopes only when that parent work is itself a genuine independent scope and does not depend on unresolved child results. If it does depend on them, the dependency must be stated explicitly.

A lane Current must not contain:

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

A justified sub-lane may be active concurrently with other justified sub-lanes at the same or different hierarchy depth when no real dependency links their current work.

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

Learner order defined by a lane contract is a learner-path fact. It does not automatically serialize artifact construction unless a real construction dependency also exists.

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

Within one declared dependency chain, only the earliest unresolved construction stage is ACTIVE by default; affected downstream stages remain frozen.

This does **not** create a repository-wide or parent-lane waterfall. Independent scopes may each have their own active stage concurrently, including nested sibling subjects, Systems, modules, or bounded batches when their work does not depend on one another.

Readiness is then judged independently through `LEARNING_ACCEPTANCE.md`:

```text
S / K / L / P / R / E / U
```

Acceptance gate state is local to the audited scope. An unresolved gate in one scope does not freeze an independent sibling scope.

Construction stage and acceptance gate must not substitute for each other.

Most importantly:

```text
Artifact exists
≠ Acceptance PASS
≠ Kian learned it
```

## 7.1 Content-evolution architecture

To satisfy Project Requirement R10, KianOS separates **stable identity / ownership** from **evolving content and representation** and from **reusable product/runtime behavior**.

Default flow:

```text
Canonical / Natural Owner
        ↓
Learning-support / reviewed relation / question assets when applicable
        ↓
Cognitive Projection asset / semantic presentation objects
        ↓
shared or domain-appropriate learner workspace / renderer
        ↓
Runtime / Evidence / Return
```

This is a responsibility chain, not a requirement that every lane use the same file schema or renderer.

### Stable identity vs mutable realization

When the semantic object remains the same, ordinary refinement should preserve its stable identity even if the following evolve:

- wording / explanation depth;
- learner ordering inside an approved boundary;
- cognitive geometry / projection metadata;
- optional Visual / Precision / Boundary / Connection enrichment;
- question explanation / reviewed relation detail;
- stage-specific visibility or compression.

Identity must not be renumbered or replaced merely because a page layout or projection shape changes.

If the semantic object itself splits, merges, changes meaning, or moves ownership, that is a real upstream change and must be handled by the responsible owner rather than hidden behind compatibility code.

### Asset-driven change by default

Routine content evolution should normally be absorbed here:

```text
Current asset changes
→ rebuild / update affected Projection asset when needed
→ targeted validation
→ existing workspace consumes the result
```

Shared/product code must not encode current domain content as a hidden ontology merely because hard-coding is convenient.

Avoid patterns such as:

```text
if specific named topic → special semantic truth in page code
if one current asset is absent → renderer guesses the missing relation
all sibling assets must copy optional fields for schema symmetry
```

Domain-specific renderers/components remain legitimate when the **cognitive geometry itself** is genuinely domain-specific. The prohibition is against moving canonical truth or ordinary content variation into implementation code.

### Optional enrichment is first-class

A lane/scope may have additional reviewed assets—e.g. Visual, Precision, Connection, pathway, comparison, case, source-local or other projection support—without forcing every sibling to manufacture matching files.

Rules:

- supported enrichment may project;
- unsupported enrichment stays absent;
- absence must not be filled by inference;
- a new enrichment class should integrate through a bounded semantic role/capability when possible rather than requiring page-by-page branching;
- only add a shared abstraction when multiple real learner needs justify it.

### Multi-stage / multi-pass reuse

Where one canonical cognitive object is reused across learning stages or later passes, prefer state-specific Projection over duplicated content owners.

Conceptually:

```text
same canonical cognition
├─ ORIENT / first learning
├─ RECALL / closure
├─ later REVIEW / application / transfer
└─ late compressed use
```

The domain Learning Contract decides which stages/passes actually exist and what they mean. Architecture only requires that a later pass should not need a duplicate canonical knowledge system merely because its learner-facing representation becomes thinner, more discriminative, more applied, or more selective.

### When Product / Runtime must change

An asset-only update is **not** sufficient when the change alters:

- Learning Logic or natural learner unit;
- task geometry / interaction semantics;
- surface ownership or cross-surface handoff;
- evidence meaning / attempt semantics;
- canonical identity/ownership;
- a genuine domain behavior that no accepted runtime capability can express.

Then reopen the earliest responsible construction stage and re-walk affected downstream stages. R10 protects evolvability; it does not authorize semantic changes to bypass stage gates.

---

# 8｜Dependency-driven concurrency and write boundaries

Concurrency is normal.

The scheduler asks first:

> **Does this work depend on an unresolved decision/artifact/evidence owned elsewhere?**

- **No** → the scope may progress concurrently.
- **Yes** → state the dependency and freeze only the affected downstream chain.

Hierarchy depth, sibling status, parent ownership, or learner-facing sequence is not enough by itself to answer that question.

## 8.1 Scope-local default

Ordinary lane/sub-lane work writes only:

- the active scope's canonical Artifact owner(s);
- its local Acceptance owner when acceptance evidence changes;
- its local Work Cursor when the next action changes;
- exact runtime files in the authorized scope.

It does not update root governance merely to record ordinary progress.

Independent sibling scopes should avoid writing parent routers merely to announce local progress; that would recreate false serialization and write contention.

## 8.2 Branch semantics

`main@HEAD` is the durable shared Current repository state.

Temporary branches are execution surfaces, not truth owners.

A branch becoming behind `main` is not itself a defect.

Reconcile only when:

- intended write-sets overlap;
- authority/owner definitions changed;
- inherited parent rules materially changed for the child scope;
- a newly discovered real dependency makes the previous independent assumption invalid.

Branch landing / retirement follows `BRANCH_LIFECYCLE.md`.

## 8.3 Scope containment

A worker acts only within the authorized scope.

Cross-scope defects may be reported or may block the current task. They are not permission for opportunistic unrelated repair.

When a cross-scope issue is a genuine dependency, escalate only to the narrow owner of that dependency. Do not freeze or repair unrelated siblings.

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

The lint exists to defend requirements R1–R10, not to create a second governance platform.

---

# 11｜Requirement traceability

Every durable architecture choice must map to at least one real Project Requirement.

| Architecture decision | Primary requirement owner |
| --- | --- |
| Predictable scope Current entry | R1 Restartability, R3 Bounded context |
| Lane/sub-lane federation | R2 Local autonomy, R6 Concurrency |
| Hierarchy separated from dependency scheduling | R2 Local autonomy, R6 Concurrency, R7 Scope containment |
| Single canonical owner | R4 Single authority, R8 Anti-entropy |
| Artifact / Acceptance / Learner separation | R5 Truth separation, R9 Learning quality |
| CURRENT as Work Cursor only | R1, R3, R5, R8 |
| continuation not mandatory | R3, R4, R8 |
| inherited rules instead of copies | R4, R8 |
| scope-local write sets | R6, R7 |
| earliest unresolved stage per dependency chain | R7, R9 |
| history excluded from normal fallback | R3, R8 |
| lightweight entropy lint | R8 |
| temporary branches not truth owners | R4, R6, R8 |
| stable identity + asset-driven content evolution | R4, R8, R10 |
| optional enrichment without sibling schema mimicry | R4, R8, R10 |
| multi-stage projection reuse instead of duplicate canonical content | R4, R9, R10 |

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

Independent scopes at any justified hierarchy depth can proceed concurrently with minimal ordinary write contention.

A parent/sibling relationship alone must not serialize them. Only real dependency, authority, or write-set overlap should require coordination.

## A4｜Owner Uniqueness Test

Important current facts/rules have one canonical owner.

## A5｜Three-month Entropy Test

Continued use should not recreate ballooning Current/continuation files, duplicate rules/status, broad searches, root-contention, false parent-level child serialization, or learner/product state leakage.

## A6｜Learning Closure Test

Learner-facing readiness claims still require the learning construction and acceptance standards; governance simplification and concurrency must not weaken learning evidence or allow downstream stages to outrun unresolved dependencies.

## A7｜Content Change Absorption Test

For a representative accepted surface, make a legitimate Current-only content/projection change that does not alter learner behavior—for example add/remove/reorder a semantic object, add an optional reviewed enrichment, refine a relation, or change stage visibility.

PASS requires that the normal change path is primarily:

```text
responsible asset owner
→ affected Projection/representation
→ validation
→ existing learner surface
```

without copying domain truth into page code, forcing unrelated sibling schema changes, or inventing a new Runtime state machine.

A legitimate cognition/interaction/evidence change may require Product/Runtime work; the test fails only when **ordinary asset evolution** repeatedly does.

---

# 13｜Change discipline

The accepted architecture is a baseline, not a license to keep expanding governance.

Normal lower-level upgrades proceed from their own local `CURRENT` and earliest unresolved dependency. Root Architecture changes only when real use demonstrates that an existing Project Requirement is not being satisfied reliably enough.

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

Likewise, no learner page or runtime state machine should be rewritten merely because ordinary Current content/projection assets evolve; first ask whether the responsible asset layer can absorb the change under R10.