# KianOS Project Definition

Status: DRAFT — governance redesign branch

This document is the highest-level product-definition owner for KianOS.

It answers one question:

> **What kind of system must KianOS be for Kian's real long-term use?**

It does **not** define file layout, `CURRENT.md` schema, continuation format, branch mechanics, domain cognition, learning-asset construction stages, or S/K/L/P/R/E/U acceptance details. Those are downstream Architecture / Contract / Standard decisions and must justify themselves against this definition.

---

# 1｜Purpose

KianOS is a **long-lived personal learning operating system** for Kian.

Its purpose is not to maximize files, pages, automation, metadata, or governance. Its purpose is to let Kian use AI and durable learning assets continuously over long periods while preserving:

- high learning quality;
- low-friction continuation across replaceable Chats;
- independent parallel progress across learning domains;
- clear ownership of current truth;
- strict separation between product state, validation evidence, and Kian's real learner state;
- bounded recovery cost as the repository grows;
- maintainability that does not degrade simply because the system has been used for months.

Compact product statement:

> **KianOS is a long-lived, restartable, federated, concurrent personal learning operating system with bounded context recovery, strict truth separation, and evidence-based learning quality.**

---

# 2｜Primary usage model

The normal operating reality is:

- Chat / Agent / worker instances are replaceable and may reach context limits;
- multiple learning domains may be worked on in parallel;
- the repository is the durable shared product/learning-asset authority, not the Chat transcript;
- Kian's private learner state is distinct from shared repository construction state;
- learning assets may evolve through repeated design, implementation, acceptance, real use, and revision;
- old history may remain recoverable without being part of normal Current reasoning.

KianOS must be designed for this usage pattern by default rather than treating it as an exceptional case.

---

# 3｜Core requirements

## R1｜Restartability — Chats are replaceable

A fresh Chat continuing a known scope must be able to recover the current work accurately from durable Current authority rather than conversational memory.

Target:

> **Once the target scope is known, ordinary continuation should normally reach effective work in roughly 2–4 precise reads.**

Failure modes include requiring prior-chat recall, broad repository archaeology, or rereading long historical narratives just to know what to do next.

## R2｜Local autonomy — independently continued scopes can stand on their own

A learning scope that is important enough to be entered and continued independently must have enough local authority and routing to resume without loading unrelated domains.

KianOS must support recursive autonomy where it reduces continuation cost, while avoiding hierarchy for hierarchy's sake.

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
3. what Kian has actually learned, attempted, repaired, transferred, or used;
4. what the current worker is trying to do next.

Hard invariant:

> **No category above may be silently inferred from another.**

Examples:

- implemented runtime ≠ accepted learning path;
- accepted module ≠ Kian has learned the module;
- worker plans learner testing ≠ Kian is already at that learner stage;
- build green ≠ learning acceptance PASS.

Architecture may choose names/owners for these distinctions, but it may not collapse them.

## R6｜Concurrency by default — parallel work is normal

Multiple Chats may work on different domains or independently continued scopes at the same time.

Normal local work should therefore:

- avoid unnecessary writes to shared high-contention root owners;
- minimize write-set overlap between sibling scopes;
- remain valid when `main` advances for unrelated work;
- require reconciliation because of actual authority/write-set conflicts, not merely because another branch moved first.

## R7｜Scope containment — one task must not spread across the project by convenience

A worker authorized for one bounded scope should work only within that scope unless an upstream blocker genuinely requires escalation.

Discovering an issue in another scope permits reporting, blocking, or escalation; it does not automatically authorize opportunistic repair.

For staged learning-asset work, downstream implementation must not outrun the earliest unresolved upstream learning question.

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
- learner state leaking into shared product state;
- temporary execution structures becoming permanent authorities.

## R9｜Learning quality outranks engineering completion

KianOS is a learning system, not merely a content repository or web application.

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

---

# 4｜Project invariants

The following are stronger than ordinary implementation preferences. Architecture must preserve them unless this Project Definition is explicitly revised from new real requirements.

## I1｜Chat is a worker, not project memory

No critical current state may require one specific Chat transcript to remain available.

## I2｜Current reasoning is present-focused

Normal work reasons from current canonical authority.

Historical repositories, old commits, retired branches, migration records, and prior implementations may support explicit bounded recovery/history tasks, but must not silently become normal Current authority.

## I3｜Stable rules and high-frequency work state are different responsibilities

Low-frequency standards/contracts and high-frequency work position must not be forced into one owner merely for convenience.

## I4｜Rules inherit; they do not multiply

Repository-wide invariants belong upstream. Child scopes add only genuine differences rather than copying parent rules.

## I5｜Private learner truth remains private learner truth

Shared engineering/product progress must never manufacture personal learning progress, mastery, review debt, or learner next-action claims.

## I6｜Complexity requires a requirement owner

Every durable new governance layer, file class, registry, cursor, manifest, automation, or abstraction must answer:

> **Which real Project Requirement does this complexity satisfy that the simpler structure cannot satisfy reliably enough?**

If no requirement owner exists, the complexity is presumptively unnecessary.

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
- a place where legacy or migration completeness is valued above current learning usability.

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
- which facts must not be inferred as learner progress.

If it requires broad search or history reconstruction, the design fails this test.

## T2｜Parallel Chat Test

Several unrelated lanes/scopes should be able to advance concurrently with little or no ordinary write contention.

Unrelated `main` progress must not force workers to restart merely because the branch is behind.

## T3｜Truth Separation Test

For one scope, the system must be able to answer separately and unambiguously:

- what actually exists;
- what has actually been accepted/proven;
- what Kian has actually learned/done;
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
- shared product state being mistaken for Kian's learner state.

If the likely answer is that these problems will recur, the architecture is not yet sufficient.

## T6｜Learning Closure Test

For learner-facing modules, the strongest readiness language must match actual learning evidence.

A build, page, content inventory, or simulated journey may support a gate, but may not replace the learning-acceptance standard or real user validation where required.

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
