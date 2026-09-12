# KianOS Learning Asset Standard

This document defines **how formal learning assets are designed and rebuilt** inside KianOS.

It is deliberately separate from `LEARNING_ACCEPTANCE.md`.

- `LEARNING_ASSET_STANDARD.md` answers: **How should we build the learning asset?**
- `LEARNING_ACCEPTANCE.md` answers: **What evidence permits us to say it is ready?**
- domain `LEARNING_CONTRACT.md` files answer: **How should this particular learner form this particular capability?**

Do not collapse these into one framework.

---

# 1｜Governing direction

Formal learning assets follow this causal construction order:

```text
Truth / Knowledge Boundary
→ Learning Logic
→ Content Realization / Optimization
→ Projection / Interaction
→ Runtime Loop
→ Evidence / Acceptance
```

This order exists to prevent a recurring failure mode:

```text
materials exist
→ write lots of content
→ build a page
→ add buttons
→ build passes
→ declare completion
```

Engineering progress is downstream evidence. It cannot settle an upstream learning question.

The governing question is always:

> **How does this capability actually form in the learner?**

Tools, files, page layouts, question banks, taxonomies, and runtime components are selected only after the relevant upstream learning need is understood.

---

# 2｜Hard stage-gate rule

## 2.1 One active construction stage by default

For a formal learning-asset rebuild, only the earliest unresolved construction stage is ACTIVE by default.

Downstream stages are **FROZEN_PENDING_UPSTREAM**.

Example:

```text
Truth / Knowledge Boundary   ACTIVE
Learning Logic              FROZEN_PENDING_UPSTREAM
Content                     FROZEN_PENDING_UPSTREAM
Projection / Interaction    FROZEN_PENDING_UPSTREAM
Runtime Loop                FROZEN_PENDING_UPSTREAM
Evidence / Acceptance       FROZEN_PENDING_UPSTREAM
```

This is a work-order rule, not a claim that downstream files do not exist.

Existing downstream assets may remain in Current while upstream work is reopened, but they must not be treated as requirements that force the upstream answer.

## 2.2 No downstream-by-convenience

While an upstream stage is unresolved, do not “also” optimize the next stage merely because:

- the page already exists;
- a component is easy to edit;
- a runtime contract already has a field for it;
- a question bank or taxonomy suggests a structure;
- a build can validate it;
- the UI would look cleaner if the content conformed to it.

A broken Knowledge asset is not repaired by better Projection. A wrong Learning Logic is not repaired by more Runtime.

## 2.3 Existing downstream implementation does not constrain upstream truth

When Knowledge or Learning is reopened:

- UI fields are not semantic requirements;
- runtime enums are not domain ontology;
- existing card layouts are not content schemas;
- generated questions are not semantic owners;
- review schedulers do not determine what deserves learning;
- current implementation effort is a sunk cost, not evidence that the model is correct.

If correct upstream work requires later P/R/E changes, those changes happen **after** the upstream stage is accepted.

## 2.4 Downstream defects cause upstream rollback, not parallel development

A Projection, Runtime, Evidence, or learner-use defect may reveal an upstream problem.

When that happens:

1. identify the earliest stage that actually explains the defect;
2. mark that stage REOPENED;
3. freeze affected downstream development;
4. repair and accept the reopened stage;
5. then re-walk the downstream stages in order.

Do not repair all touched layers at once merely because they are causally connected.

---

# 3｜Stage 0 — Truth / Knowledge Boundary

Goal:

> **Determine what is true, what the capability/knowledge actually consists of, what belongs in scope, and what must not be taught.**

Typical questions:

- What is Source Truth?
- What is Current semantic/content authority?
- What is factual/source material versus Chat teaching reconstruction?
- What are the real concepts, mechanisms, relations, boundaries, or abilities?
- Which distinctions are genuine and which are duplicated taxonomy?
- Which important pieces are missing?
- Which material is obsolete, low-value, wrong, or merely reference-level?
- What must remain protected/unseen?
- What should be routed to another owner rather than copied?

### Stage-0 outputs

The output should be a trustworthy knowledge/capability model and source boundary, not a polished learner page.

Depending on the lane, this may be:

- source ownership / provenance boundary;
- canonical concept or skill structure;
- Natural Owner semantic audit;
- mechanism/relation model;
- question-source coverage map;
- explicit exclusions and unresolved gaps.

### Stage-0 prohibition

Do not design learner-facing UI around unresolved knowledge.

Do not use the existence of a current runtime schema to decide what the domain truth must contain.

---

# 4｜Stage 1 — Learning Logic

Goal:

> **Determine how this learner should actually form the target capability from the learner's real starting point.**

This stage answers questions such as:

- What does the learner already know?
- What is the natural learner-facing unit?
- What must be continuous rather than fragmented?
- What may safely be skipped?
- What is prerequisite versus later enrichment?
- What is the causal learning order?
- When should retrieval/output first occur?
- When should official/fresh tasks enter?
- What constitutes a natural local closure?
- What does stable success look like?
- After failure, where should the learner return?
- What should static Current teach and what should adaptive Chat decide?

A question bank must not determine learning order merely because questions are easy to count.

A teacher/source order must not be inherited automatically when learner cognition requires another order.

### Stage-1 output

A domain-specific learning contract or equivalent durable learning-path decision.

The learning logic must be able to stand independently of a particular UI implementation.

---

# 5｜Stage 2 — Content Realization / Optimization

Goal:

> **Realize the approved truth through the approved learning logic.**

Content is now organized for learning rather than for archival completeness.

Possible content forms include:

- orientation;
- core explanation;
- mechanism / relation chain;
- bridge;
- boundary;
- example;
- learner-worthy expansion;
- compression / mental model;
- repair guidance;
- reference-only material outside the main path.

The rule is:

> **Content-rich, learning-selective.**

Do not maximize length, metadata, sense count, question count, or apparent completeness.

The content must contain everything required by the Learning Logic while excluding material that creates cognitive noise without meaningful learning value.

### Page-disappearance test

Before entering Projection, ask:

> **If the webpage disappeared, would the learning asset itself still be correct, coherent, and sufficient for its intended role?**

If not, Content is not closed.

---

# 6｜Stage 3 — Projection / Interaction

Goal:

> **At this exact moment in the learning path, what should the learner see and what decision/action should be easy?**

Content structure is not page structure.

Projection decides:

- what is foregrounded now;
- what is progressively disclosed;
- what is folded into reference/explore;
- what is hidden before a clean attempt;
- what can be skipped quickly;
- where attention should land;
- which learner actions deserve controls;
- how much interaction is necessary to preserve evidence without turning learning into UI work.

### Projection rule

**Content-rich, display-precise.**

A rich backend asset may project to a very small learner surface when that is cognitively correct.

### Interaction quality test

Every learner-facing element must earn its place by doing at least one of:

1. improving retrieval/encoding without leaking the answer;
2. exposing a meaningful hidden gap;
3. reducing friction in a real learner decision;
4. producing a cleaner verification/repair judgment;
5. preserving evidence that changes the next action.

Otherwise remove or demote it.

---

# 7｜Stage 4 — Runtime Loop

Goal:

> **Make the approved learning behavior executable end to end.**

A runtime loop is domain-specific. Shared platform capabilities do not imply one common cognitive loop.

A typical shape may be:

```text
Learn
→ natural closure
→ Attempt / Verify
→ stable correct → continue
→ wrong / uncertain
→ diagnose first meaningful failure
→ smallest sufficient repair
→ return
→ later transfer
```

Two KianOS-wide runtime principles are mandatory:

> **Stable correct work must be able to pass fast.**

> **Repair only the smallest thing that actually failed.**

Runtime must not manufacture ritual review, diagnosis, or reconstruction debt simply because a component supports those states.

A written contract is not enough. The learner must be able to execute the path.

---

# 8｜Stage 5 — Evidence / Acceptance

Goal:

> **Preserve the evidence that matters and make only the readiness claim that evidence supports.**

At this stage use `LEARNING_ACCEPTANCE.md` and its S/K/L/P/R/E/U gates.

Do not confuse the construction stages in this document with the acceptance gates.

The two systems answer different questions:

```text
Learning Asset Standard
= how the asset should be built

S / K / L / P / R / E / U
= what has actually been demonstrated about the asset
```

Evidence should reflect the cognition of the lane, not engineering convenience.

Strong real transfer evidence outranks weaker repeated artificial confirmation when the domain contract says so.

User Validation remains real-user evidence and cannot be simulated by Chat, CI, screenshots, or build success.

---

# 9｜Stage transition protocol

A stage may advance only when all of the following are true for the current scope:

1. the current-stage question is explicitly answered;
2. known blockers at that stage are resolved or explicitly fail-closed;
3. the durable owner/output for that stage exists in Current when one is required;
4. the result has been audited against the stage's actual goal;
5. the next stage will not need to guess an unresolved upstream decision.

Then record the next stage as ACTIVE and keep later stages frozen.

Do not advance because:

- implementation momentum is high;
- many files already exist;
- a branch is old;
- a build is green;
- the learner is waiting to test;
- downstream rework would be inconvenient.

---

# 10｜Handling partially mature existing modules

KianOS already contains modules with substantial downstream implementation.

When a serious upstream defect is found, do **not** delete mature downstream work by default.

Instead:

```text
reopen earliest responsible stage
→ freeze affected downstream stages
→ preserve downstream implementation as provisional
→ repair upstream
→ revalidate each downstream stage in order
→ retain, modify, or retire downstream pieces based on the accepted upstream result
```

This prevents both sunk-cost lock-in and needless rewrites.

A frozen downstream asset may be perfectly reusable later. It simply has no authority to decide the active upstream question.

---

# 11｜Scope and batching

Stage gates apply to the **declared learning scope**, not necessarily an entire subject at once.

A scope may be:

- one Xizong System;
- one Politics Natural Unit;
- one Reading passage path;
- one Translation task model;
- one Writing cold-start mechanism;
- one bounded Lexical semantic batch;
- an entire lane when the evidence truly supports it.

Batching exists to control review load, not to bypass stage order.

Within a batch, finish the active stage before beginning downstream work for that batch.

Do not use tiny batches when the actual work is deterministic and bulk-safe; do not use giant batches when semantic judgment is still being calibrated.

---

# 12｜Relationship to domain contracts

This standard does not replace domain learning contracts.

Examples:

- LexicalOS may keep Depth Scan → selective Repair → Challenge → Return Packet;
- Politics may keep Orientation → continuous learning → short closure → Xiao1000 verification → minimal repair;
- Xizong may keep System / Block / KP logic;
- Reading, Translation, Writing, and Cloze may retain their own natural learner units and failure loops.

The standard governs **construction order**.

The domain contract governs **domain cognition and learner behavior**.

`SYSTEM_CONTRACT.md` governs **shared platform capabilities**.

`LEARNING_ACCEPTANCE.md` governs **readiness evidence**.

These layers should reinforce one another without becoming substitutes for one another.

---

# 13｜Compact operating rule

Before doing substantial work on any formal learning asset, state internally:

```text
Active construction stage: <stage>
Upstream accepted for this scope: <yes/no>
Downstream state: FROZEN / eligible
Current-stage exit condition: <concrete condition>
```

Then work only on the active stage unless new evidence forces an upstream rollback.

The durable KianOS principle is:

> **Start from the learning need, not from the available tool.**

> **Resolve the upstream learning question before optimizing its downstream representation.**
