# KianOS Authority Inheritance Contract

**Status:** CURRENT — canonical KianOS authority / inheritance contract  
**Scope:** KianOS-internal authority hierarchy, ownership, derivation, synchronization and shared implementation boundaries

This contract owns one KianOS system question:

> **How may KianOS have layered rules without allowing two inconsistent truths for the same fact?**

Cross-system responsibility/interface questions inherit the frozen mother architecture through `PROJECT_DEFINITION.md` → `kianwang022-hash/kian-personal-os/KERNEL.md §2`; this file does not restate or supersede that owner.

It refines `PROJECT_DEFINITION.md`, `ARCHITECTURE.md`, `SYSTEM_CONTRACT.md`, `PROJECT_MANAGEMENT_CONTRACT.md`, and `BRANCH_LIFECYCLE.md`. It does not replace any domain Learning Contract or scoped Acceptance Truth.

---

## 1. Core invariant

KianOS allows hierarchy. KianOS does not allow contradiction.

```text
higher authority
→ narrower authority may refine it
→ implementation may project it
→ runtime may execute it
→ UI may render it
```

A child may add detail inside its owned scope. It may not redefine an upstream invariant, duplicate the same decision as a second mutable owner, or silently infer missing semantics downstream.

Hard rule:

> **One fact has one canonical owner. Other layers reference, derive, adapt, or refine that owner; they do not maintain a competing copy.**

When two artifacts appear to own the same fact, resolve the duplication at the earliest responsible authority. Do not add synchronization glue between two competing owners.

---

## 2. Authority versus work assignment

Authority and current writer are different concepts.

- **Authority owner**: durable artifact that defines the rule or fact.
- **Implementation owner**: durable code/data path that realizes an accepted contract.
- **Current writer**: temporary branch/Chat allowed to change an owned surface during active work.
- **Consumer**: downstream surface that reads the owner without becoming a second owner.

Therefore:

```text
English Chat may be the current writer for Shared Shell
≠ English owns Shared Shell semantics
```

Temporary writer assignments belong in `CURRENT.md` routing. Durable shared ownership belongs in this contract plus `AUTHORITY_OWNERSHIP.json` and the relevant platform contract.

A temporary branch, PR, Chat, or CURRENT work cursor never becomes canonical truth merely because it is active.

---

## 3. Refinement rule

A lower-level rule is legal only when all of the following are true:

1. its scope is narrower than the parent scope;
2. it preserves every applicable parent invariant;
3. it adds information the parent intentionally leaves local;
4. it names or can resolve its upstream owner when the relationship is not obvious;
5. downstream consumers can distinguish canonical input from derived output.

Examples:

- global visual rule → subject-specific composition detail: **allowed**;
- global navigation tree → subject-local second-level navigation: **allowed**;
- domain Learning semantics → module-specific learning sequence: **allowed**;
- subject UI deciding a new global rail entry independently: **forbidden**;
- UI turning ambiguous data into a causal arrow because it "looks like a chain": **forbidden**;
- Home reimplementing English Resume priority by reading English internals: **forbidden**.

When a local need conflicts with a parent rule, return the issue upstream. Do not patch around the parent in CSS, Runtime, projection, or local state.

---

### 3.1 Change continuity

When inheriting or improving an existing scope, establish a bounded working basis
from current owners before choosing the edit:

- the user outcome and the design reason behind the relevant existing behavior;
- the responsibilities and identities that must survive this change;
- the exact object being changed and the consumers that depend on its meaning;
- the observable result needed to justify this task's completion claim.

This is working context, not a new manifest, mandatory report or user form. Follow
only relevant parent/consumer links. Do not read the whole repository, reconstruct
old Chats, or ask Kian to repeat decisions already present in current owners.
Do not invent rationale when the owner does not record it: distinguish an explicit
decision from an inference, and resolve only ambiguities that affect this change.

Before writing, refresh the exact owner revision and conflicting active work.
An accepted current basis may be reused within the task; a changed owner requires
reconciliation of the affected basis, not ritual rereading of every document.
If an entry cannot reach the required design, repair its link to the existing
owner. Do not fill the gap by creating a second summary of that design.

An optimization is a delta against this basis. Structural simplification may not
silently remove a cognitive job, change a Source boundary, or replace a learning
decision with a convenient UI/schema shape. A material change to those decisions
must be explicit in the appropriate semantic owner and within authorization.

Close against the original user outcome and the affected inherited behavior,
not merely the new files. Object counts, Source mappings, validator PASS and
prior acceptance receipts prove only their own scope. For content changes, inspect
the affected Source / Knowledge / Learning responsibilities; for a claim of website
availability, trace and verify the actual consumer. Do not require unchanged layers
to repeat acceptance ceremonies. Unsupported dependent claims stay unverified and
must not be converted into a whole-system COMPLETE label.

Persist changed decisions once in their existing semantic owner, and progress
only in its existing cursor. Other entrypoints retain references, not copied
status or design. A handoff should resume from those owners without needing the
originating Chat. If only a local candidate exists, say so; repository presence,
live Project prompt installation and observed fresh-Chat behavior are different proofs.

### 3.2 Change propagation and dependency freshness

Change continuity answers **what must be understood before a change**. Change propagation answers **what becomes stale after a canonical owner changes**.

Do not solve propagation with a hand-maintained global dependency graph by default. Prefer dependency edges that are already explicit in the consumer, import, manifest, schema or exact owner reference.

Every material dependency must fit one of four modes:

#### A. LIVE_REFERENCE

The consumer resolves the canonical owner at use time and stores no competing semantic snapshot.

```text
owner changes
→ next read/use sees Current
```

No revision witness is required unless the consumer also persists a derived decision that must later explain its basis.

#### B. DERIVED_PROJECTION

The consumer is mechanically derivable from one or more named owners.

Freshness must be proved by either:

- deterministic regeneration from Current owners; or
- a validator that recomputes/compares the projection against the Current source on every relevant source/projection change.

A Git SHA may be carried as provenance, but SHA equality is not required when semantic equivalence is mechanically checked from the Current owner. The projection must remain non-authoritative and independently edited semantic fields are invalid.

#### C. REVIEWED_DERIVATION

The consumer contains a human/Chat-reviewed semantic judgment that cannot be regenerated safely by syntax alone.

It must keep distinct:

```text
stable upstream identity
current upstream revision
reviewed-against revision / provenance witness
current review status
```

A blob/commit hash is a **revision witness**, never the semantic identity itself.

When the upstream revision changes:

```text
no material dependency
→ preserve consumer after bounded reconciliation

possible material dependency
→ consumer becomes stale / provisional
→ exact semantic re-review
→ preserve / revise / retire
```

Do not silently advance a review witness merely because the target identity stayed the same.

#### D. BOUNDED_SNAPSHOT

A plan, command, packet or current-day decision may intentionally freeze a momentary basis.

It must carry enough identity/freshness information to reject stale replay: source/basis reference, revision or equivalent witness when material, generation time/study day, and expiry/reconciliation behavior as applicable.

A bounded snapshot is execution state, not a new durable semantic owner.

### 3.3 Current / history isolation and closure consistency

Historical evidence may remain useful, but it must not participate in Current resolution.

Allowed shapes include Git history, explicit archive/evidence owners, or fields whose semantics are unambiguously historical/provenance-only. A Current resolver/validator must ignore those fields as lifecycle authority.

For any owner that declares a Current lifecycle, `CLOSED` is a hard state:

```text
CLOSED
→ no live required next_action
→ no live blocker required before closeout
→ no live required acceptance still pending
→ no live active concurrency/dependency claim
```

Historical `previous_*` / `historical_*` evidence may describe former pending work, but a Current consumer must never treat it as a live instruction.

If one object needs a large implementation diary to explain how it became CLOSED, that diary belongs in Git history or bounded evidence—not in the Current control surface.

The correct repair for contradictory Current state is to identify the single lifecycle owner and make other views derived/reference-only. Do not synchronize several writable lifecycle mirrors.

---
## 4. Truth classes must not collapse

These remain separate:

```text
Artifact Truth
Acceptance Truth
Learner Truth
Work Cursor
Derived Read Model
Presentation
```

- **Artifact Truth** lives in the natural source/content/runtime owner.
- **Acceptance Truth** lives in the narrowest applicable acceptance owner.
- **Learner / execution evidence** is private runtime evidence of observed/reported activity and bounded derivations; it is never inferred from repository progress and does not by itself authorize broader interpretations such as stable mastery, preference or strategy.
- **Work Cursor** routes active construction; it is not a durable semantic owner.
- **Derived Read Model** is a read-only projection for another surface.
- **Presentation** renders accepted meaning; it does not invent it.

A derived artifact must be reproducible from its named owner(s) or fail closed. If a derived artifact becomes independently edited, it has become a competing truth and is invalid.

---

## 5. Shared Platform ownership

Shared Platform is a cross-domain owner. It is not owned semantically by English, Xizong, Politics, or Lexical.

Current implementation owners are registered in `AUTHORITY_OWNERSHIP.json`.

### Shared Shell

The learner-facing global shell has one implementation chain:

```text
shared platform contract
→ static-web/src/layouts/Base.astro (style/import entry)
→ static-web/src/layouts/BaseFrame.astro (global shell markup/runtime host)
→ static-web/src/lib/sharedNavigation.mjs
→ static-web/src/styles/shared-shell.css
→ subject surfaces consume it
```

Subject surfaces may own second-level information architecture and local composition. They must not recreate the global `K` rail, maintain a second top-level product tree, or locally override global route identity.

The concrete Current L1 membership is **not duplicated in this contract**.

`ARCHITECTURE.md` owns the durable product-responsibility model; `static-web/PRODUCT_SURFACE_CONTRACT.md` owns the current product surface split; `static-web/STEWARD_PRODUCT_CONTRACT.md` owns Steward product interaction / reality-capture semantics and product acceptance; `AUTHORITY_OWNERSHIP.json` registers these durable product owners plus the one shared navigation implementation owner at `static-web/src/lib/sharedNavigation.mjs`; `static-web/CURRENT.md` owns current website implementation/status. This contract owns only the inheritance/one-owner invariants; it does not duplicate those product semantics.

Learner-product placement such as English child functions is resolved from the current Architecture / exact product owner, not restated here as another mutable navigation list.

### Shared capability runtime

A cross-domain capability has one runtime owner. Subject-specific behavior attaches through narrow adapters/read models rather than copied stores, duplicated reducers, or DOM patches that mutate another runtime's private state.

If two lanes make the same learner decision, shared infrastructure may own the common mechanism. If the learner decision differs, keep semantics local and share only neutral infrastructure.

A shared capability that already exists must have its durable owner registered. A capability that is not yet on `main` may be predeclared only as a **conditional capability**: its topology is inactive until the trigger owner exists, then CI requires the complete declared owner set before merge. This prevents both fake Current ownership and unregistered shared runtimes.

---

## 6. Home is a consumer, not a second brain

Home may aggregate only stable, read-only subject projections plus genuine cross-subject orchestration output.

```text
subject owner
→ pure Resume / Demand / entry projection
→ Home composition
```

Home may mount a subject-owned **read-only Resume / entry projection component** when that component remains the subject's own opaque projection surface. Home must not inspect that component's private state/DOM to discover meaning, recreate its priority rules, or mutate subject-private learner state.

A narrower Home integration contract may be registered when needed, but absence of one does not authorize Home to infer subject semantics.

Cross-subject scheduling is not Home-owned cognition. `EXAM_ORCHESTRATOR_CONTRACT.md` owns orchestration policy; its checked Current projection is a derived runtime input, not a second mutable policy owner.

---

## 7. Current and synchronization topology

There is one durable repository Current authority:

```text
GitHub main@HEAD
```

For the learner's local Current site, the approved delivery path is:

```text
origin/main
→ dedicated Current mirror
→ static-web/scripts/kianos-current-sync.mjs
→ local main reset to origin/main
→ Astro reads the local repository
→ browser reloads when __kianos-current.json SHA advances
```

This synchronization is repository-wide. English, Xizong, Politics, Lexical, Home, and support assets do **not** own separate GitHub→localhost sync daemons.

A separate private control mirror may exist only for private Chat control transport. It must:
- be registered as a distinct Shared Platform owner;
- live outside the disposable public Current mirror;
- carry control instructions rather than learner/canonical content;
- never reset or mutate the public KianOS repository;
- fail closed when its private source cannot be read.

Current registered implementation: `static-web/scripts/privateControlRelaySync.mjs`.

Local personal-development worktrees may intentionally diverge, but they are not the automatic Current mirror and must not be presented as if GitHub changes automatically mutate that workspace.

A sync status file is transport evidence, not semantic Current Truth.

---

## 8. CURRENT scope rule

`CURRENT.md` files are routers/work cursors, not history logs and not mirrors of every child fact.

Therefore consistency does **not** mean copying every subject change into root CURRENT.

Correct model:

```text
root CURRENT
→ cross-system scope / active coordination only

subject CURRENT
→ subject-local work cursor

module CURRENT
→ independently continued module cursor when useful
```

A child-local change may be absent from root CURRENT and still be consistent. The failure condition is not "root did not repeat it"; the failure condition is "two routers claim incompatible ownership or current execution rules for the same scope."

---

## 9. Branch / PR rule

Branches and PRs are proposals, not Current authority.

Before a PR that touches a shared owner is accepted, it must be reconciled against latest `main` and the current owner registry. A PR may not restore an ownership model that was valid when the branch started but has since been superseded on `main`.

For shared-owner changes:

```text
latest main
→ current authority/ownership registry
→ branch change
→ consistency gate
→ domain/runtime tests
→ merge
→ main becomes Current
```

Open PRs that depend on a shared owner must consume the latest owner after it lands rather than carrying a private fork indefinitely.

---

## 10. Fail-closed implementation rule

Downstream code must fail closed when it lacks enough upstream meaning to act correctly.

Forbidden recovery patterns include:

- UI guessing relation type from field names or DOM shape;
- Home guessing a subject's next action from private state it does not own;
- an adapter mutating another runtime's private storage to suppress behavior temporarily;
- a subject page drawing a replacement global rail because the shared shell lacks an entry;
- a new sync daemon because one feature needs faster refresh;
- compatibility fallback silently becoming a second semantic source.

The fix belongs at the earliest responsible owner.

---

## 11. Machine enforcement

`AUTHORITY_OWNERSHIP.json` is the machine-readable ownership topology. It stores **where an authority lives**, not a duplicate copy of the authority's semantic content.

`tools/authority_consistency_audit.py`, `tools/authority_projection_audit.py`, and `.github/workflows/authority-consistency.yml` enforce structural invariants that can be checked mechanically, including:

- required owner paths exist;
- global rail markup has one owner;
- global-navigation declaration has one owner;
- repository-wide Current sync has one mutation owner;
- subject CURRENT files do not claim semantic ownership of Shared Shell;
- registered derived projections remain bound to their declared source owner and authority class;
- cross-subject Orchestrator runtime remains bound to the Orchestrator Contract through its derived Current projection;
- conditionally declared shared capabilities must materialize their complete owner set when activated;
- Home cannot infer, duplicate or mutate subject-private Resume / learner semantics;
- once External Reading integration exists, its adapter cannot mutate Reading A's private continuous-session store.

The checkers intentionally do **not** interpret learning semantics. Domain semantic acceptance remains with domain owners.

### Enforcement map

Do not build one universal validator that pretends to understand every domain. Enforce each invariant at the narrowest layer that can prove it:

| Invariant | Enforcement point |
| --- | --- |
| Single Current Authority / registered shared owner | `tools/authority_consistency_audit.py` + `AUTHORITY_OWNERSHIP.json` |
| Derived projection binding + declared freshness proof | `tools/authority_projection_audit.py` + the projection's exact validator/workflow |
| Current router size / retired Current paths / history re-entry | `tools/governance_current_audit.py` |
| Reviewed-derivation revision witness | exact domain/content validator that can resolve the stable semantic identity and current owner revision |
| Closure consistency for a lifecycle owner | exact lifecycle validator; structural helper may be shared, but lifecycle meaning stays with the owner |
| Bounded snapshot freshness / stale replay | exact packet/command/runtime validator |
| Domain semantic correctness after upstream change | exact domain Acceptance / semantic validator; never the governance checker |
| Fresh-Chat bounded recovery | Current/router audits plus representative recovery tests in the owning surface |

A reusable structural helper is welcome when several validators need the same syntax-level rule, but the helper does not become a semantic owner.

For `DERIVED_PROJECTION`, the machine registry must declare how freshness is proven. A source path alone is insufficient. Current supported proof mode:

```text
VALIDATED_AGAINST_CURRENT_SOURCE
→ named validator
→ named workflow
→ source + projection + validator changes trigger PR and main gates
```

For `REVIEWED_DERIVATION`, do not require a single universal field name across all domains. The exact owner may choose its schema, but its validator must be able to distinguish stable identity, current revision and reviewed-against witness and must fail closed when a stale witness is still presented as Current/REVIEWED.

---

## 12. Change test

Before adding a rule, state, runtime, navigation entry, sync path, or read model, ask:

1. **What exact fact/decision is being represented?**
2. **Who already owns it?**
3. **Is this a refinement, derivation, adapter, or duplicate owner?**
4. **Can the child remain correct if the owner changes?**
5. **Can CI detect the most likely ownership regression?**

If the answer to #3 is "duplicate owner", do not implement it.
