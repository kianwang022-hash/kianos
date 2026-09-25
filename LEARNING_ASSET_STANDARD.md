# KianOS Learning Asset Standard

Status: **CURRENT**  
Role: repository-wide standard for building formal learning assets

This document answers:

> **How should a learning asset be built from raw material into something Kian can actually learn and use?**

It is deliberately separate from:

- `ARCHITECTURE.md` — permanent KianOS responsibilities;
- domain `LEARNING_CONTRACT.md` — how a particular capability should be learned;
- `LEARNING_ACCEPTANCE.md` — what evidence permits a readiness claim.

Do not use engineering progress, page existence or build success to settle an upstream Source / Knowledge / Learning question.

---

# 1｜Causal construction order

Default construction direction:

```text
SOURCE
reliable raw material / provenance / question truth
        ↓
KNOWLEDGE RECONSTRUCTION
AI turns Source into coherent learner-worthy Knowledge
        ↓
LEARNING LOGIC
how this learner should form / retrieve / apply the capability
        ↓
CONTENT REALIZATION
materialize the approved Knowledge + Learning decisions
        ↓
PRESENTATION / INTERACTION when needed
how the accepted meaning should appear at the current learner state
        ↓
ENGINEERING / RUNTIME
make the approved behavior executable
        ↓
EVIDENCE / ACCEPTANCE
prove only what the evidence actually supports
```

This is a causal order **inside one real dependency chain**.

It is not a repository-wide waterfall. Independent scopes may progress concurrently when they do not depend on one another.

---

# 2｜Stage 0 — Source boundary

Question:

> **What reliable material are we allowed to learn from?**

Resolve, when relevant:

- authoritative source / provenance;
- stable object identity;
- exact question / prompt / answer truth;
- source coverage and gaps;
- protected unseen material;
- what is factual source versus later AI teaching reconstruction;
- what must remain unavailable rather than guessed.

Hard rules:

- missing Source is not repaired by UI or model intuition;
- historical material is not automatic Current authority;
- official wording / answer / mapping must not be fabricated;
- Source ownership does not itself decide learner order or learner surface.

Output: a trustworthy Source boundary sufficient for Knowledge work.

### External-research escalation boundary

KianOS may proceed directly from Source to Knowledge when the source boundary is already trustworthy and the task is to build an approved learner/product capability.

If the underlying external-world truth itself still requires open-ended discovery, source-family comparison, competing explanations, adversarial verification or durable research synthesis, that research belongs upstream in StudyHub. KianOS should consume the accepted research output rather than recreate a parallel research project.

When StudyHub has already produced a mature human-readable Report / Deep Reading whose purpose is still to explain the external world, that Report remains canonical in StudyHub. KianOS should normally reference/render it and add only the product or learner-specific behavior actually needed. Presentation, navigation, Resume, interaction or Evidence do not by themselves justify copying or re-owning the Report's semantic content.

This distinction is about the **state of the external question**, not the file type:

```text
bounded trustworthy Source
+ learner/product need
→ KianOS Knowledge Reconstruction

open external research question
→ StudyHub research
→ accepted output
→ KianOS only if a learner/product capability is later needed
```



---

# 3｜Stage 1 — Knowledge Reconstruction

Question:

> **Has AI transformed reliable Source into genuinely high-quality Knowledge, rather than merely copying or reorganizing the source?**

This is the core KianOS AI-learning value.

A good Knowledge asset should:

- identify the real concepts / capabilities / mechanisms / relations;
- make decisive distinctions explicit;
- preserve source truth while reorganizing it for understanding;
- separate exact retention from broad conceptual understanding when useful;
- expose hidden branches, boundaries or failure points that matter to the learner;
- route truth to the correct canonical owner rather than duplicating it;
- demote valid but low-value reference material without deleting it;
- remain coherent if the current webpage disappears.

Hard rules:

```text
source order ≠ canonical Knowledge order
teacher chapter structure ≠ Knowledge ontology
question taxonomy ≠ Knowledge ontology
page/component structure ≠ Knowledge ontology
```

Domain-specific Knowledge quality belongs in the domain's Rule / Content owner.

Examples:

- Xizong → mechanism / causal model / boundaries / precision / cross-system relation;
- Politics → concept relation / historical logic / hierarchy / boundary / source-grounded exactness;
- English → transferable task decision models / Representation / execution rules;
- Lexical → Core / senses / familiar-new branches / constructions / phraseology / confusables.

Output: trustworthy canonical Knowledge / capability assets.

---

# 4｜Stage 2 — Learning Logic

Question:

> **How should Kian actually form this capability from his real starting point?**

Decide only what materially changes learning:

- natural learner-facing unit;
- prerequisite versus enrichment;
- continuous versus fragmented learning;
- when retrieval/output first becomes useful;
- when fresh / official tasks should enter;
- what stable success looks like;
- what should happen after failure;
- what static assets teach versus what Chat adapts;
- which surface owns each material learner action when surface choice changes continuity or cognition.

Hard distinction:

```text
Source ownership ≠ surface ownership
Runtime capability ≠ learner-surface authority
learner order ≠ construction scheduling
```

Output: domain Learning Contract or equivalent durable learner-path decision.

## 4.1｜Shared learner geometry: orient → form → deepen → compress → use → repair

Across very different domains, one higher-order cognition pattern recurs:

```text
ORIENTATION
where am I / what exists / why this structure
↓
GUIDE / EXPANDED MODEL
first coherent model that actually runs
↓
DEEPENING
mechanisms / distinctions / Source contact / cases / application
↓
COMPRESSION
smallest callable model that preserves correct action
↓
USE / TRANSFER / EVIDENCE
real or changed-context use reveals what survives
↓
LOOP
reopen only the smallest failed relation / layer
→ repair
→ re-compress when needed
→ use again
```

This is a **shared learning geometry**, not a universal page sequence, mandatory course template or new Acceptance ladder.

### Orientation

Orientation answers:
- what terrain / system / capability am I entering?
- why is it organized this way?
- what prerequisites or major branches matter?
- what model should I expect to form?

Orientation should be **thin enough not to pretend to teach the whole subject**.

It reduces disorientation; it does not create mastery.

### Guide / Expanded Model

The next job is to form the first **coherent runnable mental model**.

A Guide may be short or substantial depending on the domain. It is not defined by length.

It succeeds when the learner can roughly reconstruct:
- the main structure;
- the important relations / flow;
- why the pieces connect;
- what the major boundaries or failure points are.

Hard rule:

> **A Guide is not a glossary and not a list of headings. It should make the system internally legible.**

### Deepening

Deep learning makes the initial model more accurate, discriminating and transferable through whatever the domain actually requires, such as:

- stronger Source contact;
- mechanism work;
- contrasting cases;
- exact facts;
- confusable near-neighbors;
- questions / problems;
- reconstruction;
- application;
- real tasks;
- counterexamples.

Deepening is not permanent expansion. Add detail only when it improves explanation, discrimination, action or future transfer.

### Compression

Compression comes **after enough model formation and deepening**.

It is not an early summary.

It preserves the smallest structure that still supports correct reconstruction / judgment / action, for example:
- causal skeleton;
- system loop;
- contrast matrix;
- decision tree;
- protocol;
- compact operating model.

Hard distinction:

```text
early brevity
≠ mature Compression
```

A one-screen model written before the learner has formed the expanded model is merely short; it is not evidence-based Compression.

### Use / Transfer / Evidence

A model becomes trustworthy only when it survives the kind of use the capability exists for.

The geometry of use remains domain-specific:
- medicine → retrieval / cases / discrimination / clinical or exam use;
- software → build / debug / ship;
- judgment → contrasted cases / decisions / later outcomes;
- communication → real production / interaction;
- world/domain understanding → explain a new case, locate a mechanism, compare systems, or reason through a changed real-world problem.

Use may reveal that:
- the orientation was wrong;
- the Guide omitted a decisive relation;
- deepening focused on the wrong distinction;
- Compression deleted something load-bearing.

### Loop / smallest reopen

When evidence exposes a defect:

```text
failure
→ locate earliest responsible relation / layer
→ reopen only that scope
→ repair
→ re-run the interrupted cognition step
→ update Compression only if the repaired relation changes it
```

Do not restart the whole subject because one downstream application failed.

### Recursive scale

The same geometry may recur at different scales:

```text
Unit
→ System / Domain
→ Direction / multi-domain structure
→ whole-world / whole-capability synthesis
```

A larger Guide should not integrate child systems that are still empty labels for the learner.

Likewise, the learner does **not** need every child domain to be complete before useful higher-level integration begins. Integrate only the dependencies required for the current larger model.

### Relationship to the construction pipeline

Keep these two dimensions distinct:

```text
BUILD DIMENSION
Source → Knowledge → Learning Logic → Content → Presentation / Runtime → Evidence

LEARNER DIMENSION
Orientation → Guide / Expanded Model → Deepening → Compression → Use / Transfer → Repair loop
```

The first explains **how trustworthy learning assets are built**.

The second explains **how learner cognition changes resolution over time**.

Do not collapse one into the other.

### Domain specialization rule

Every domain may specialize, merge, skip or rename learner steps when its real capability demands it.

The shared invariant is only:

> **orient before forcing integration; form a coherent model before premature compression; deepen with domain-native evidence/tasks; compress only what has earned compression; let use reopen the smallest failed part.**

---



# 5｜Stage 3 — Content Realization

Question:

> **Have the accepted Knowledge and Learning decisions been materialized into usable canonical learning assets?**

Possible forms include:

- orientation;
- Core explanation;
- mechanism / relation chain;
- comparison / boundary;
- exact object;
- example;
- learner-worthy expansion;
- compression / mental model;
- repair guidance;
- reference-only material.

Rule:

> **Content-rich, learning-selective.**

Do not maximize length, metadata, question count, sense count, or apparent completeness.

### Website-disappearance test

Before downstream presentation work, ask:

> **If the current website disappeared, would this learning asset still be correct, coherent and useful?**

If no, Content is not closed.

Output: canonical Content that can be consumed by any valid future surface.

---

# 6｜Stage 4 — Presentation / Interaction, only when needed

Presentation is **not automatically a new semantic asset layer**.

If an existing renderer can consume the canonical Content directly without losing learning meaning:

```text
Canonical Content
→ renderer
```

That is sufficient.

A derived presentation / projection is justified when learner state materially changes what should be visible or interactive, for example:

```text
same Knowledge
├─ Learn: full explanation
├─ Recall: answer-bearing content hidden
├─ Repair: failed relation foregrounded
└─ Review: compressed form
```

Then:

```text
Canonical Content
→ derived presentation
→ renderer
```

Hard rules:

- derived presentation is not a second Knowledge owner;
- it may hide / foreground / reorder approved meaning, not invent it;
- missing semantics stay missing rather than being guessed;
- accepted Surface Blueprints should be reused rather than redesigned every implementation cycle;
- page geometry belongs to Visual owners, not Content.

Output: the smallest representation needed for the approved learner action.

---

# 7｜Stage 5 — Engineering / Runtime

Question:

> **Can the approved Rule + Content + Visual behavior actually run end to end?**

Engineering may include:

- loaders / adapters;
- renderer/workspace;
- Runtime/state;
- clean attempt / Submit / Recall / Reveal;
- persistence;
- Return/Handoff;
- answer gating;
- navigation / keyboard;
- Current sync;
- browser validation.

Hard principles:

> **Stable correct work must be able to pass fast.**

> **Repair only the smallest thing that actually failed.**

Engineering must not invent Learning Logic, Knowledge or Content merely because implementation is easier that way.

When two data sources share the same learner task semantics, prefer one Runtime / renderer rather than duplicate products.

Output: executable learner behavior.

---

# 8｜Stage 6 — Evidence / Acceptance

Question:

> **What has actually been demonstrated?**

Use `LEARNING_ACCEPTANCE.md` for S/K/L/P/R/E/U readiness claims.

Construction stage and acceptance gate are different concepts:

```text
this standard
= how to build

S / K / L / P / R / E / U
= what evidence proves
```

Never infer learner mastery from:

- accepted Content;
- Runtime capability;
- CI / build;
- screenshots;
- synthetic journeys;
- engineering Current.

Only real learner use creates U evidence.

---

# 9｜Dependency rule

Within one dependency chain, downstream work waits for the earliest unresolved upstream decision.

Example:

```text
Source unresolved
→ Knowledge / Learning / Presentation / Runtime cannot guess

Knowledge reopened
→ affected downstream work freezes
→ correct Knowledge first
→ then revalidate dependent layers
```

But this does **not** freeze independent siblings.

Hierarchy is ownership. Dependency is scheduling.

---

# 10｜Existing mature downstream work

When an upstream defect is found, do not delete mature downstream work by default.

Use:

```text
reopen earliest responsible stage
→ freeze only affected downstream chain
→ preserve existing downstream implementation as provisional
→ repair upstream
→ revalidate downstream in order
→ retain / modify / retire based on the accepted result
```

Do not preserve a wrong upstream model merely because downstream implementation was expensive.

---

# 11｜Fresh-Chat construction test

For a known learning-asset scope, a fresh Chat should be able to answer quickly:

```text
What is the Source?
What is the canonical Knowledge owner?
What K-quality rule applies?
What Learning Logic applies?
What exact stage is unresolved?
What downstream work is frozen?
```

If this requires broad repository archaeology, the ownership/routing design is defective.

---

# 12｜Change rule

Do not add another construction stage merely because a new file type or implementation technique appears.

A durable stage/owner is justified only when it represents a genuinely different responsibility that cannot be expressed clearly by the existing model.

KianOS should converge toward:

> **reliable Source → excellent AI Knowledge → correct Learning Logic → durable Content → minimal necessary presentation → reusable Engineering → evidence-based revision.**
