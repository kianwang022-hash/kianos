# KianOS Project Definition

Status: CURRENT — accepted top-level project definition

This document is the highest-level product-definition owner for KianOS.

It answers one question:

> **What kind of system must KianOS be for Kian's real long-term use?**

It does **not** define file layout, `CURRENT.md` schema, continuation format, branch mechanics, domain cognition, learning-asset construction stages, or S/K/L/P/R/E/U acceptance details. Those are downstream Architecture / Contract / Standard decisions and must justify themselves against this definition.

---

# 1｜Purpose

KianOS is Kian's **long-lived durable knowledge, learning, visual and runtime product extension to Chat**.

Chat remains the open-ended cognition layer: discussion, interpretation, research synthesis, strategy, personal meaning and major design judgment happen through Chat / its specialized roles. KianOS exists where durable assets or executable product behavior add value that ordinary conversation alone cannot provide well.

Its responsibilities include:
- high-quality processed Knowledge / Content worth keeping and reusing;
- formal learning assets when Kian actually needs to form a capability;
- stable Visual / Presentation for content that benefits from better display than chat text;
- interactive workspaces and Runtime for actions that need immediate stateful behavior;
- private execution / learner evidence and bounded reality feedback that can return to Chat for later interpretation;
- durable rules and product assets needed to keep those experiences restartable and cheap to evolve.

Raw PDFs, videos, transcripts, files and other unprocessed reference material do **not** enter KianOS merely because they may be useful later. They may remain in Drive, Library, Files or their original source until a real need justifies research or durable Knowledge reconstruction.

KianOS does not become a second open-ended strategy brain. Runtime may execute bounded approved logic, projections, state transitions, validation and adaptation whose semantics are already owned by the applicable Rule / Model. When evidence requires interpretation, personal calibration, a new strategy or a change in values/trade-offs, that reasoning returns to Chat.

Its purpose is not to maximize files, pages, automation, metadata, or governance. Its purpose is to let Chat + Kian build and use durable knowledge/product capabilities continuously over long periods while preserving:

- high knowledge and learning quality where learning is the goal;
- strong presentation and interaction where Chat alone is insufficient;
- reality evidence that can improve later Chat judgment without becoming automatic personal inference;
- low-friction continuation across replaceable Chats;
- independent parallel progress across domains and independently continuable scopes;
- clear ownership of current truth;
- strict separation between product state, validation evidence, and Kian's real use/learner state;
- bounded recovery cost as the repository grows;
- maintainability that does not degrade simply because the system has been used for months;
- evolvability in which normal Rule / Content / Visual change can usually be absorbed without rewriting unrelated product/runtime architecture.

Compact product statement:

> **KianOS is Chat's durable knowledge + visual + runtime + reality-feedback extension: a restartable, federated and evolvable product system whose approved Rules and assets can be rendered, interacted with and observed in reality without creating a second autonomous strategy brain.**

---

# 2｜Primary usage model

The normal operating reality is:

- Chat / Agent / worker instances are replaceable and may reach context limits;
- Chat supplies open-ended reasoning; KianOS supplies durable assets, visual/product behavior, Runtime and reality evidence;
- multiple knowledge/learning domains and independently continuable product scopes may be worked on in parallel;
- GitHub is the durable canonical authority for shared KianOS Rules, Content, Visual and Engineering assets, not the Chat transcript;
- private learner/execution state is distinct from shared repository construction state;
- assets may evolve through repeated discussion, design, implementation, acceptance, real use and revision;
- real-use evidence may return to Chat without being auto-promoted into Personal conclusions;
- old history may remain recoverable without becoming normal Current reasoning.

KianOS must be designed for this usage pattern by default rather than treating it as an exceptional case.

---

# 3｜Core requirements

## R1｜Restartability — Chats are replaceable

A fresh Chat continuing a known scope must be able to recover the current work accurately from durable Current authority rather than conversational memory.

Target:

> **Once the target scope is known, ordinary continuation should normally reach effective work in roughly 2–4 precise reads.**

Failure modes include requiring prior-chat recall, broad repository archaeology, or rereading long historical narratives just to know what to do next.

## R2｜Local autonomy — independently continued scopes can stand on their own

A scope that is important enough to be entered and continued independently must have enough local authority and routing to resume without loading unrelated domains. Formal learning scopes keep their additional Learning/Acceptance owners where applicable.

KianOS must support recursive autonomy where it reduces continuation cost, while avoiding hierarchy for hierarchy's sake.

Local autonomy is recursive: a System under Xizong, a subject under Politics, or another justified nested scope may progress independently of siblings when no real dependency links their current work. Being contained by the same parent does not by itself create a work-order dependency.

This requirement does not prescribe a specific Root/Lane/Sub-lane file structure; Architecture must choose the smallest structure that satisfies it.

## R3｜Bounded context — repository growth must not increase re-entry cost without bound

Recovery of one known scope must use a deterministic, bounded read set.

Normal continuation must not gradually evolve into:

> search the whole repository → inspect old logs → infer which file is newer → reconstruct what the last Chat meant.

If context recovery cost grows materially with months of use, the architecture is failing even if all files still exist.

## R4｜Single authority — one current fact has one owner

Every current fact, rule, semantic object, acceptance claim, or learner-state fact must have one canonical owner for its responsibility.

Other locations may reference that owner but must not maintain a competing copy.

Architecture must prevent long-term drift caused by duplicated status, duplicated rules, duplicated semantics, or parallel continuation narratives.

## R5｜Truth separation — different kinds of reality must never silently substitute for one another

KianOS must keep at least these distinctions permanently explicit:

1. what artifacts/product capabilities actually exist;
2. what quality/readiness has actually been demonstrated by evidence;
3. what Kian has actually done or used in reality; for learning, what he has actually learned, attempted, repaired or transferred;
4. what the current worker is trying to do next.

Hard invariant:

> **No category above may be silently inferred from another.**

Examples:

- implemented runtime ≠ observed real use;
- implemented runtime ≠ accepted learning path;
- accepted module ≠ Kian has learned the module;
- worker plans learner testing ≠ Kian is already at that learner stage;
- a persisted timer/state transition ≠ an inferred personal preference or strategy;
- build green ≠ learning acceptance PASS.

Architecture may choose names/owners for these distinctions, but it may not collapse them.

## R6｜Concurrency by default — independence, not hierarchy, governs parallel work

Multiple Chats may work on different domains or independently continued scopes at the same time.

Concurrency follows **real dependency**, not directory depth, parent/child naming, or which sibling was worked on most recently.

Therefore:

- independently continued scopes may progress concurrently at any justified depth;
- sibling subjects under Politics may advance in parallel when they do not depend on one another;
- sibling Systems under Xizong may advance in parallel when they do not depend on one another;
- a parent router must not serialize independent children merely by naming one child as the lane's global active task;
- one blocked scope must not freeze unrelated siblings unless the blocker is genuinely shared upstream authority/infrastructure.

Normal local work should therefore:

- avoid unnecessary writes to shared high-contention root owners;
- minimize write-set overlap between sibling scopes;
- remain valid when `main` advances for unrelated work;
- require reconciliation because of actual authority/write-set/dependency conflicts, not merely because another branch moved first.

## R7｜Scope containment — one task must not spread across the project by convenience

A worker authorized for one bounded scope should work only within that scope unless an upstream blocker genuinely requires escalation.

Discovering an issue in another scope permits reporting, blocking, or escalation; it does not automatically authorize opportunistic repair.

For staged learning-asset work, downstream implementation must not outrun the earliest unresolved upstream learning question **on the same dependency chain**. This rule does not freeze independent sibling scopes or unrelated construction chains.

## R8｜Anti-entropy — long-term use must not make the project progressively harder to understand

KianOS must resist structural entropy created by repeated use.

The system should remain clear after months of high-frequency work without requiring periodic manual archaeology or wholesale cleanup.

Architecture must specifically resist:

- ever-growing Current/continuation narratives;
- multiple owners for the same current fact;
- root files becoming daily-progress logs;
- repeated rule copies across lanes;
- historical/legacy material returning as normal fallback;
- worker re-entry expanding into repository-wide search;
- private user/learner state leaking into shared product state;
- temporary execution structures becoming permanent authorities.

## R9｜Semantic / learning quality outranks engineering completion

For learning assets, KianOS is a learning system rather than merely a content repository or web application. For non-learning product surfaces, the same principle holds: engineering completion cannot substitute for the upstream Rule / Model or the real user outcome.

A learner-facing module is not considered learning-ready merely because:

- source files exist;
- content is extensive;
- pages render;
- interactions exist;
- CI/build is green;
- synthetic E2E passes.

Formal learning assets must be designed from learning need and learning logic, and readiness claims must be evidence-based.

The implementation of this requirement is owned downstream by:

- `LEARNING_ASSET_STANDARD.md` for construction order;
- `LEARNING_ACCEPTANCE.md` for readiness / user-validation evidence.

This Project Definition owns only the requirement that engineering proxies must never substitute for learning closure.

## R10｜Content evolvability — normal content change must not require product rewrites

KianOS must remain easy to change as durable Content/Knowledge, question assets, product semantics, learning-support metadata and projection needs evolve.

Normal content evolution should usually follow:

```text
canonical Content / semantic or Learning asset changes
→ Projection / representation asset changes when needed
→ validation
→ existing product/runtime consumes the new Current asset
```

not:

```text
content changes
→ page-specific code rewrite
→ duplicated domain logic inside UI
→ runtime schema becomes the hidden content owner
```

Architecture must therefore preserve a useful separation between:

- stable identity / ownership;
- evolving domain semantics, Knowledge and learning assets;
- stage/state-specific Projection;
- reusable product/workspace/runtime behavior.

Hard requirements:

- stable canonical identity should survive ordinary presentation/content refinement when the semantic object itself remains the same;
- domain semantics must not be trapped inside page-specific conditions or component structure as a hidden second owner;
- optional enrichment may appear or disappear without requiring sibling assets to imitate it merely for schema symmetry;
- absent semantic support remains absent rather than being guessed by a renderer;
- repeated passes/stages should reuse the same canonical cognition where possible instead of duplicating first-pass, second-pass and late-review copies;
- a real change in Learning Logic, task geometry, surface ownership, evidence meaning, or domain semantics may legitimately reopen upstream design and require Product/Runtime change.

This requirement does **not** mean pre-building every future feature. It means choosing boundaries so that foreseeable content evolution is usually an asset change rather than an architecture migration.

---

# 4｜Project invariants

The following are stronger than ordinary implementation preferences. Architecture must preserve them unless this Project Definition is explicitly revised from new real requirements.

## I1｜Chat is cognition / worker, not durable project memory

Chat supplies open-ended reasoning and may perform work, but no critical current state may require one specific Chat transcript to remain available.

## I2｜Current reasoning is present-focused

Normal work reasons from current canonical authority.

Historical repositories, old commits, retired branches, migration records, and prior implementations may support explicit bounded recovery/history tasks, but must not silently become normal Current authority.

## I3｜Stable rules and high-frequency work state are different responsibilities

Low-frequency standards/contracts and high-frequency work position must not be forced into one owner merely for convenience.

## I4｜Rules inherit; they do not multiply

Repository-wide invariants belong upstream. Child scopes add only genuine differences rather than copying parent rules.

## I5｜Private reality remains private reality

Shared engineering/product progress must never manufacture personal execution facts, preferences, outcomes or learner progress. For formal learning, mastery, review debt and learner next-action claims remain private learner truth unless supported by the proper evidence owner.

## I6｜Complexity requires a requirement owner

Every durable new governance layer, file class, registry, cursor, manifest, automation, or abstraction must answer:

> **Which real Project Requirement does this complexity satisfy that the simpler structure cannot satisfy reliably enough?**

If no requirement owner exists, the complexity is presumptively unnecessary.

## I7｜Stable product boundary, evolving assets

Routine change in content, questions, learning support, relations, or projection detail should normally be absorbed by the responsible Current asset layer rather than by duplicating domain truth into page/runtime code.

A product/runtime rewrite is justified when user/learner behavior, task geometry, surface ownership, evidence semantics, or the true domain model changes—not merely because one content object gained, lost, reordered, or refined presentation structure.

---

# 5｜Non-goals

KianOS is **not** intended to become:

- a complete archive of all Chat history;
- a repository where normal work requires historical archaeology;
- one universal cognition/UI workflow forced across all subjects;
- a full enterprise project-management suite;
- a hierarchy in which every directory automatically receives its own Current/Contract/status file;
- a system where every possible future requirement is pre-built in advance;
- a second learner-tracking truth inside shared engineering Current;
- a collection of multiple status dashboards that all summarize the same facts;
- a place where legacy or migration completeness is valued above current learning usability;
- a product whose learner pages must be manually rewritten whenever ordinary Current content or projection assets change.

A feature may still exist when a real requirement justifies it; it does not become a default goal merely because it is technically possible.

---

# 6｜Top-level success tests

Architecture is not accepted because it looks elegant. It must satisfy these observable tests.

## T1｜Fresh Chat Test

Given only a known target scope, a fresh Chat should normally recover enough information in roughly 2–4 precise reads to identify:

- the current work scope/stage;
- the next action;
- blockers / frozen downstream work;
- the exact owners required to continue;
- which facts must not be inferred as real use / learner progress.

If it requires broad search or history reconstruction, the design fails this test.

## T2｜Parallel Chat Test

Several independent scopes at any justified depth should be able to advance concurrently with little or no ordinary write contention.

A parent/child or sibling relationship does not itself imply serialization. Unrelated `main` progress must not force workers to restart merely because the branch is behind.

## T3｜Truth Separation Test

For one scope, the system must be able to answer separately and unambiguously:

- what actually exists;
- what has actually been accepted/proven;
- what Kian has actually done/used; for learning, what he has actually learned;
- what the current worker should do next.

If one answer is being guessed from another, the architecture fails.

## T4｜Owner Uniqueness Test

For any important current fact or rule, the question:

> **Who owns this?**

must have one clear answer.

If ordinary maintenance requires synchronizing multiple competing copies, the architecture fails.

## T5｜Three-month Entropy Test

Assume high-frequency use continues for three months.

The architecture should still avoid:

- ballooning continuation/Current files;
- multiple competing status owners;
- root files touched by ordinary lane work;
- history becoming normal fallback;
- repository-wide search for routine continuation;
- rule updates requiring edits across many duplicated child files;
- Work Cursor turning into a historical log;
- shared product state being mistaken for Kian's private real-use / learner state.

If the likely answer is that these problems will recur, the architecture is not yet sufficient.

## T6｜Learning Closure Test

For learner-facing modules, the strongest readiness language must match actual learning evidence.

A build, page, content inventory, or simulated journey may support a gate, but may not replace the learning-acceptance standard or real user validation where required.

## T7｜Content / Semantic Change Absorption Test

Take a representative accepted surface and change only its legitimate Current semantic/content/projection assets without changing the underlying user action—for example add or remove a learning relation, refine a question explanation, reorder an approved cognitive object, or change a product-owned semantic/configuration object that an existing renderer already understands.

The architecture should normally permit that change to reach the consumer through asset/projection updates plus validation, without requiring page-specific domain rewrites or a new runtime state machine.

If routine semantic/content evolution repeatedly requires special-case UI code, duplicated semantic copies, or schema migrations unrelated to user/learner behavior, the architecture fails this test.

---

# 7｜Change rule

This file should change rarely.

Normal implementation discoveries should first revise the downstream Architecture / Contract / Current owner that is insufficient.

Revise `PROJECT_DEFINITION.md` only when real use reveals that Kian's underlying needs, success criteria, invariants, or project boundary were themselves wrong or incomplete.

The governing order is:

```text
Project Definition
→ Architecture
→ Contracts / Standards
→ Implementation
→ Acceptance
→ Real Use / Revision
```

Downstream work may reveal an upstream defect, but downstream convenience may not redefine the requirement.