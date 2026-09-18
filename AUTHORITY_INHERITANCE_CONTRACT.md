# KianOS Authority Inheritance Contract

**Status:** canonical cross-system contract  
**Scope:** authority hierarchy, ownership, derivation, synchronization and shared implementation boundaries

This contract owns one system question:

> **How may KianOS have layered rules without allowing two inconsistent truths for the same fact?**

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
- **Learner Truth** is private learner/runtime evidence and is never inferred from repository progress.
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
→ static-web/src/layouts/Base.astro
→ static-web/src/lib/sharedNavigation.mjs
→ static-web/src/styles/shared-shell.css
→ subject surfaces consume it
```

Subject surfaces may own second-level information architecture and local composition. They must not recreate the global `K` rail, maintain a second top-level product tree, or locally override global route identity.

The accepted learner-facing top level is:

```text
Home / Xizong / Politics / English
```

Vocabulary and External Reading are English children at the learner-facing navigation layer even when their backend/canonical ownership is more granular.

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

---

## 12. Change test

Before adding a rule, state, runtime, navigation entry, sync path, or read model, ask:

1. **What exact fact/decision is being represented?**
2. **Who already owns it?**
3. **Is this a refinement, derivation, adapter, or duplicate owner?**
4. **Can the child remain correct if the owner changes?**
5. **Can CI detect the most likely ownership regression?**

If the answer to #3 is "duplicate owner", do not implement it.
