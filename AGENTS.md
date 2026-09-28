# KianOS Worker Instructions

Role: **worker intent / entry router only**.

This file answers one question:

> **Given Kian's current request, which KianOS owner should the worker enter first?**

It does not own KianOS requirements, architecture, domain semantics, Learning/Product/Visual design, Acceptance Truth, learner state, branch policy, or detailed execution machinery.

## 1｜Resolve intent before repository state

Natural language is authoritative; Kian does not need to name a mode.

```text
LEARN    use / continue a learning capability; inspect actual learner Resume/evidence
USE      use a non-learning KianOS product or private runtime state
CREATE   decide/revise Rule / Content / Learning / Product / Visual meaning
BUILD    implement already accepted meaning in Engineering / Runtime / consumers
UI       implement accepted learner/product presentation or interaction
AUDIT    independently verify BUILD against accepted CREATE truth
CONTROL  inspect/manage engineering/project state, priority, blocker or execution
```

The shared lifecycle semantics are owned upstream in Personal `KERNEL.md §2`; this router does not redefine CBA.

A bare learner continuation stays LEARN unless the active conversation clearly establishes engineering work. A question about what Kian actually learned/attempted/resumed also stays LEARN. Normal product use stays USE unless Kian asks to redesign/debug/manage it.

## 2｜Small read paths

### LEARN

```text
known subject / task
→ native learner/runtime state or Resume owner
→ exact domain Learning/Content owner only when needed
→ learn
```

Do not enter root engineering `CURRENT.md` merely because it exists. Engineering readiness is not learner state. Daily Learning Packet / private runtime evidence remains learner/planning input, not an engineering cursor.

### USE

```text
known product / surface
→ exact product/runtime state
→ Rule / Model owner only when interpretation is needed
→ use
```

If ordinary use exposes a defect, route only that defect to BUILD/UI. Raw/native reality stays with its source owner; open-ended personal interpretation returns to Chat / Personal.

### CREATE

```text
real need / parent outcome
→ exact current Rule / Content / Learning / Product / Visual owner
→ relevant evidence / constraints
→ accepted smallest semantic/design delta
```

For an existing scope, apply `AUTHORITY_INHERITANCE_CONTRACT.md §3.1 Change continuity` before changing meaning. Use `LEARNING_ASSET_STANDARD.md` only when formal learning-asset construction is actually the job. Do not create a second CREATE manual here.

### BUILD

```text
exact current effect / owner
→ accepted semantic/design owner
→ real consumer
→ bounded implementation + affected proof
→ stop
```

For a **concrete reproduced defect with already-accepted behavior**, use `PROJECT_MANAGEMENT_CONTRACT.md → Concrete Repair Fast Lane` by default. Do not create a new Issue, Contract, broad audit, worktree ceremony or full-site verification merely because the change touches learner UI/runtime.

Implementation may not invent missing Product/Learning semantics. Branch/PR/delivery/Codex/Remote/batching mechanics live in `PROJECT_MANAGEMENT_CONTRACT.md`, `BRANCH_LIFECYCLE.md` and `SEMANTIC_BASE_VALIDITY.md` only when the bounded change actually needs them.

A promoted request from Personal / StudyHub / Steward / Review should arrive through the existing owner chain or thin implementation pointer. The source owner keeps the semantic/personal/research truth; KianOS receives only the requested effect and the current target owner chain.

### UI

```text
static-web/README.md
→ shared Website requirements when relevant
→ exact Product / Domain owner
→ exact Surface Blueprint when one exists
→ current implementation owner
→ Website Candidate
→ applicable Human Gate
→ accepted promotion / delivery
```

Shared Visual/representation authority lives in the exact owners routed by `static-web/README.md`. CSS/component order never becomes design authority. Parent/child design conflict is `OWNER_UNRESOLVED` and returns to CREATE.

UI has two paths.

**Concrete correctness repair with accepted appearance/behavior:**

```text
existing implementation owner
→ smallest direct fix
→ affected browser proof (Candidate only when useful)
→ durable main change
→ managed Current publishes asynchronously
→ stop
```

No separate Human Gate is required merely to fix a broken/hidden control, leaked backend label, overflow, stale selector, or other implementation defect whose intended behavior is already owned.

**Material visual/product choice:**

```text
exact Product / Visual owner
→ Candidate 127.0.0.1:4322
→ Human Gate
→ accepted durable change
→ managed Current promotion
```

Stable 4321 is never the scratch-preview surface, but ordinary repair work also does not wait for Stable promotion before unrelated work can continue.

### AUDIT

```text
accepted CREATE truth / parent outcome
→ exact candidate / release identity
→ applicable Acceptance owner
→ real consumer / Runtime / browser / state
→ claim-scoped independent verdict
```

AUDIT does not redesign by preference. Reuse still-valid upstream evidence. A concrete defect returns to the earliest responsible BUILD/UI owner; the repair author does not automatically grant the broad Audit PASS. Real learner U remains REAL USE evidence.

### CONTROL

```text
CURRENT.md
→ exact program/domain Current or active Issue
→ PROJECT_MANAGEMENT_CONTRACT.md when coordination/execution mechanics matter
→ exact task owner
```

Current locates work; it does not replace design. If an active Issue owns Phase/Next/Blocker, read it rather than reconstructing project state from old PRs or Chat memory.

For delegated Codex execution, re-read current main + this router + the exact active Issue/owner before writes. Detailed dispatch, batching, worktree/PR, Remote and reporting policy stays in `PROJECT_MANAGEMENT_CONTRACT.md`.

## 3｜Permanent routing boundaries

- current canonical owner outranks stale Chat/history;
- one fact/decision has one canonical owner;
- independent scopes proceed independently unless a real dependency links them;
- missing evidence degrades only the dependent claim;
- History/Legacy/closed PRs are not fallback Current authority;
- learner/runtime evidence never becomes engineering progress by implication;
- implementation cannot strengthen the epistemic claim of its input;
- owner conflict / missing parentage → `OWNER_UNRESOLVED`, not a downstream guess;
- do not create a new Contract / registry / Current / ledger when an existing owner can carry the meaning.

Machine owner topology is `AUTHORITY_OWNERSHIP.json`; inheritance/freshness/history rules are `AUTHORITY_INHERITANCE_CONTRACT.md`.

### Legacy quarantine

KianOS inherits Personal `KERNEL.md §2` **Legacy quarantine / default history blindness**.

Unless Kian explicitly asks for `legacy / 历史 / 追溯 / 旧版本 / 找以前`, normal KianOS work must **not read or search**:
- closed Issues / closed PRs or their comments;
- old branches / superseded candidates;
- git history / old commit narratives to reconstruct current meaning;
- historical PASS / Human-Gate / audit receipts as startup context.

Use current `main@HEAD`, this router, the exact current owner, and only a live active Issue when one is explicitly bound. If current state cannot be recovered that way, report/repair a routing-owner defect; do not fall back to history.

Fresh AUDIT is not a legacy unlock. It starts from current accepted CREATE truth + exact candidate/release + real consumer/runtime/browser/state.


## 4｜Context and stop

For material BUILD / UI / CONTROL work, keep the smallest useful working set:

```text
parent outcome / why
→ current task + exact owner
→ must-preserve behavior / real consumer
→ acceptance / stop condition
```

A Current/Next pointer locates work but is not the design. If the needed design cannot be recovered from the owner chain, repair the routing/ownership defect rather than inventing a summary.

Known-scope work should normally reach the responsible owner in a few precise reads. Broad repository archaeology, implementation diaries and historical PASS narratives stay off the hot path unless the claim genuinely depends on them.

Stop when the requested effect is proved or the exact blocker/owner boundary is clear. No active request implies no background continuation.

## Compact rule

**Resolve intent → enter the exact owner → follow that owner's method → verify the real consumer/effect → stop.**
