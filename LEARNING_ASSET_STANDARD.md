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
K SEMANTIC FALSIFICATION / ACCEPTANCE
attack the model; repair real defects; use fresh readback when material
        ↓
LEARNING LOGIC
how this learner should form / retrieve / apply the capability
        ↓
L SELF-ADVERSARIAL + FRESH INDEPENDENT ACCEPTANCE
for substantial reconstructed Learning, attack before PASS
        ↓
CONTENT REALIZATION
materialize the accepted Knowledge + Learning decisions
        ↓
CONTENT CLOSURE READBACK
prove realization did not drift for schema / UI convenience
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

### Adversarial Knowledge reconstruction

For a **new or materially reconstructed Knowledge owner**, a coherent first draft is not enough. Before K can close, attack the candidate against the strongest plausible failure modes.

Use a bounded sequence:

```text
Knowledge candidate
→ semantic self-falsification / adversarial audit
→ repair real defects
→ independent / fresh readback when the reconstruction is material enough to justify it
→ K PASS / PASS_WITH_DEBT
```

The attack should be domain-native, not schema-native. Depending on the asset, test the relevant risks:

- source wording or historical precision silently generalized into timeless truth;
- teacher/file/question order mistaken for ontology;
- classification/list replacing mechanism or decision structure;
- one marker / antibody / formula / label replacing the full evidence role;
- negative-space leakage into a second course or external modern-guideline curriculum;
- duplicate ownership across Systems / modules;
- missing decisive relation / boundary hidden by complete counts;
- AI-generated relation or exactness without Source support;
- over-compression that destroys the learner-worthy model;
- over-expansion that turns canonical Knowledge into an encyclopedia.

For substantial new System/module Knowledge, acceptance should include a bounded independent or fresh readback when practical. It need not mimic the exact Learning-audit protocol, but builder completeness claims and validators alone are not sufficient evidence.

A small correction inside an already accepted owner does not require ritual re-acceptance unless it materially changes the model, scope, ownership, or source-grounded exactness.

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

### Adversarial Learning construction and fresh acceptance

For a **substantial reconstructed Learning asset**—for example a new System/module learner route, a material repartition of learner units, a new prerequisite graph, a new Recall/verification timing model, or a change in primary surface ownership—the builder's first coherent candidate is **not** enough to close Learning.

Use this bounded production sequence:

```text
Learning candidate
→ builder self-adversarial attack
→ repair any real red points
→ fresh independent semantic audit
→ repair if needed
→ fresh readback / re-audit
→ only then L PASS / PASS_AFTER_REPAIR
```

The self-adversarial attack should try the strongest plausible alternatives rather than merely inspect field completeness. Depending on the domain, attack at least the relevant dimensions:

- different natural-unit / grouping / partition;
- different learner order or prerequisite structure;
- continuous versus fragmented learning;
- different primary / companion surface ownership;
- Recall / verification timing;
- negative-space leakage and accidental second-course expansion;
- overfitting to one previous module, teacher order, question order or current renderer;
- later-pass compression and manufactured review debt.

For the fresh independent audit, anti-anchoring matters:

1. read Current Rule / Source / Knowledge owners first;
2. form and record a provisional learner model **before** opening the builder candidate / receipts when practical;
3. then challenge the candidate against that independent model;
4. structural QA may support the audit but cannot substitute for semantic judgment.

Hard rule:

> **Builder self-review ≠ fresh independent L acceptance.**

A small local repair to an already accepted Learning model does **not** require ritual fresh audit merely because text changed. Re-run the independent Learning attack when the change can materially alter learner order, natural units, continuity, prerequisite structure, Recall/verification timing, surface ownership, compression, or review debt.

Until the affected Learning dependency is accepted, downstream Presentation / Runtime work may inspect the defect but must not patch around it as if L were settled.

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

### Content closure readback before Presentation

For substantial Content realization, materialization is not the end of the stage.

Before downstream Presentation / Projection becomes eligible, perform a bounded **Content Closure readback** against the accepted Knowledge + Learning decisions:

```text
accepted K + L
→ Content realization
→ Content closure audit / readback
→ repair real semantic or hierarchy drift
→ only then downstream Presentation / Projection
```

The closure audit should attack the failures that commonly appear during realization:

- accepted Knowledge relation / boundary changed for storage or renderer convenience;
- accepted Learning timing/order leaked into duplicated medical/domain truth;
- rich backend objects were flattened, over-expanded, or made uniform for schema symmetry;
- low-value/reference material was promoted because a field/component exists;
- a required learner-worthy explanation/bridge/boundary disappeared despite object-count completeness;
- Source evidence/provenance became a second learner course;
- optional/conditional content was turned into mandatory learner debt;
- Content began encoding page geometry / cards / columns / component choices;
- cross-owner truth was copied rather than referenced;
- "all fields present" was substituted for "this object is sufficient for its learner job".

When the realization is broad or high-risk, use a fresh/independent readback or heterogeneous sample attack rather than relying only on the builder's own checklist.

A small additive correction to already accepted Content may use a bounded owner-level readback instead of a full ritual re-audit.

Hard rule:

> **Projection/UI may expose a Content defect, but must not repair it downstream.**

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
