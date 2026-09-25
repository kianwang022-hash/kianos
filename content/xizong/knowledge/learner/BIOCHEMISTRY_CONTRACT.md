# Xizong Biochemistry Learning & Content Contract

Status: **CURRENT**  
Scope: **Biochemistry only — M1–M10 + G1–G5**  
Parent authority:
- root `LEARNING_ASSET_STANDARD.md`;
- `content/xizong/LEARNING_CONTRACT.md`;
- `content/xizong/knowledge/learner/BLOCK_PREENTRY_CONTENT_CONTRACT.md`;
- `content/xizong/knowledge/learner/BEGINNER_GUIDE_CONTRACT.md`.

Machine execution owners:
- B learning owner → `content/xizong/knowledge/learner/b-digestive-metabolic-endocrine-tumor-learning.json`;
- current Source-lane map → `content/xizong/knowledge/learner/biochemistry-27-source-map.json`;
- current authoritative Source-revision task → `content/xizong/knowledge/learner/xizong-2027-biochemistry-delta-slot.json`.

Medical truth remains owned by the canonical M/G Block Markdown and B `system.json`.  
This contract does **not** own medical facts, exact Source page truth, official Question Truth, Question→Knowledge relations, learner progress, Runtime state or Acceptance verdicts.

---

# 0｜Why Biochemistry gets a scoped contract

Biochemistry has a learning geometry that is materially different from most organ / disease content:

- the current Lecture is a long continuous **pathway / information-flow source**;
- one canonical Block may be formed from multiple non-contiguous Source units;
- a concept encountered early may need only a tiny just-in-time explanation before its formal Block appears later;
- the most durable memory is often a **state variable, switch, conserved carrier, compartment or boundary**, not a paragraph or pathway name;
- understanding improves sharply when Source order and canonical Knowledge order are allowed to differ.

Therefore Biochemistry keeps the shared Xizong construction standard, but specializes **first-pass Source continuity, reconstruction, Recall, Memory and question repair**.

Hard distinction:

```text
teacher Source order
≠ canonical M/G Knowledge order
≠ Logic Group order
≠ Recall order
≠ official-question order
```

## Architecture boundary｜Biochemistry is an execution specialization, not a second content architecture

Biochemistry inherits the **same canonical hierarchy as every mature Xizong System**:

```text
System
→ Block
→ Logic Group
→ KP
```

This scoped contract may specialize **how the Source is contacted, when local retrieval is released, how state reconstruction works, and how cross-System connections are timed**. It may not create another canonical level such as:

```text
Block → Layer → Logic Group / KP
Block → pathway band → KP
Source unit → canonical layer
```

A biochemical “mother model”, pathway family, state model or submodel is a **Framework / compression object** owned by the existing System or Block. If it groups the same KPs as an existing Logic Group, the Logic Group remains the canonical local learning unit; do not duplicate it with a second topology.

Likewise, the following remain content jobs around the same Block/LG/KP owners:

```text
Framework
Core
Boundary / Confusable
Precision
Visual
Connection
Memory Routing
MI-G / MI-D
Recall / Closure
Compression
Question Probe / Repair
```

They may be rendered or scheduled differently, but they are not new Knowledge hierarchy.

**Dedicated Biochemistry lane ≠ isolated Biochemistry Knowledge.**

The lane may be Source-continuous; the Knowledge must remain integrated with digestive, endocrine, hematology, hepatobiliary and tumor owners through reviewed Connection / Recall / Reconstruction semantics.


---

# 1｜Top-level learning decision

## 1.1 First pass is a dedicated Biochemistry Source lane

Normal Biochemistry first learning is:

```text
current authoritative Biochemistry Source
→ continuous Source contact in teacher order
→ map Source segments to existing canonical Block / Logic Group / KP owners
→ local KP/LG retrieval only when the owning material has actually been formed
→ Block closure only after its last required current-Source segment is complete
→ state-based cross-Block reconstruction
→ official questions
→ smallest-sufficient repair
→ progressively thinner Memory
```

Biochemistry is **not routinely interleaved** with digestive / endocrine / organ Blocks during first-pass Source formation.

Cross-System material appears only as:

- a just-in-time explanation that materially improves the current biochemical model;
- a short Recall of already learned neighboring Knowledge;
- a deferred Connection to one formal Current owner.

A connection is not permission to leave the Biochemistry lane and learn the neighboring course in full.

## 1.2 Current Source continuity wins over canonical Block order

Canonical Block identity remains stable, but Block numbering does not control Source reading order.

If the Source teaches metabolism before formal enzyme theory, Kian continues with the Source. The system may provide the smallest sufficient language needed to understand the current page, without falsely declaring the later Block complete.

Likewise, if one canonical Block is distributed across early and late Source units, the earlier segment may form partial Knowledge, while formal closure waits for the last required Source unit.

---

# 2｜Source policy

## 2.1 One continuous current Source

At any moment, the current authoritative continuous Source is resolved by the active Source-lane owner.

For the current 27-cycle rebase, the binding is in:

`biochemistry-27-source-map.json`.

The learner should not be asked to read two full Biochemistry courses in parallel.

## 2.2 Historical / refined material is reconstruction substrate

A previous refined Source may contribute explanation only after re-verification.

A historical explanation is admitted only when all are true:

1. it is compatible with current Source truth;
2. it materially clarifies a mechanism, direction, compartment, state variable or boundary;
3. it reduces future memorization load or prevents a high-value category error;
4. it can be routed to the existing canonical Block/KP or an explicit external owner.

Reject or demote it when it is:

- merely repetitive prose;
- a mnemonic with no durable cognitive value;
- contradicted by current Source;
- unsupported precision;
- a reason to create a second textbook / second Source path / second medical owner.

The durable result is the **reconstructed meaning**, not preservation of the old paragraph.

## 2.3 Source ambiguity stays explicit

Decision-relevant ambiguity in:

- direction / negation / exception;
- enzyme / substrate / product / cofactor relation;
- numeric / threshold / timing;
- table row-column relation;
- handwritten symbol / image relation;
- answer / option identity;

stays `UNKNOWN / CONFLICT / SOURCE_BOUND` until verified.

Current-year novelty never authorizes guessing.

---

# 3｜Biochemistry Knowledge model

Biochemistry should compress into two durable mother models.

## 3.1 Metabolism = material–energy network

Default coordinates:

```text
carbon flow
+ ATP / high-energy transfer
+ NADH / FADH2 vs NADPH redox role
+ group carriers
+ compartment
+ tissue identity
+ physiologic state
```

High-reuse hubs include:

```text
G-6-P
pyruvate
acetyl-CoA
oxaloacetate / TCA
ATP / GTP
NADH / FADH2
NADPH
CoA
FH4
SAM
PRPP
```

The preferred learner question is not only “what is the pathway?” but:

> Where does the substrate come from, where can it go, what energy/redox currency changes, which control point determines direction, where does it occur, and what physiologic state changes the flow?

## 3.2 Molecular Biochemistry = information lifecycle

Default spine:

```text
DNA identity / packaging
→ replication
→ transcription
→ RNA processing
→ translation
→ expression control
→ damage / repair
→ oncogene / tumor-suppressor control failure
→ molecular tools
```

The learner should locate a defect or technique on this lifecycle before memorizing isolated labels.

---

# 4｜Just-in-time Prelude

When current Source order requires language that has not yet reached its formal canonical Block, Chat / KianOS may supply a **minimal non-canonical, non-gating Prelude**.

Typical early metabolic language:

- key / irreversible control point;
- ATP / GTP and high-energy bond;
- NADH / FADH2 as oxidative-energy carriers;
- NADPH as reductive-synthesis / antioxidant / biotransformation currency;
- CoA as acyl-group carrier;
- cytosol vs mitochondrion;
- liver / muscle / RBC / brain boundaries.

Hard rules:

- Prelude is only the smallest explanation needed now;
- it is not a new KP or Logic Group;
- it is not M1 completion;
- it creates no automatic Memory debt;
- formal Source later replaces / strengthens the provisional language.

---

# 5｜Content generation — inherit the shared standard, then optimize for Biochemistry

Construction order remains:

```text
Source boundary
→ Knowledge reconstruction
→ independent K acceptance
→ Learning Logic
→ independent L acceptance
→ Content Realization
→ LG-by-LG sufficiency / density audit
→ fresh Content closure
→ downstream P / R / E only when needed
```

Content Realization must still satisfy the shared responsibility set:

```text
ORIENTATION
SOURCE_CONTACT
RETRIEVAL
CORE_CHECK
BOUNDARY
COMPRESSION
```

These are responsibilities, not mandatory headings.

## 5.1 ORIENTATION

Use the smallest map that makes the upcoming Source navigable.

Prefer:

- flow / branch / state switch;
- conserved carrier;
- compartment / tissue coordinate;
- comparison axis;
- information-lifecycle position.

Do not create a prose mini-textbook before the learner meets the Source.

## 5.2 SOURCE_CONTACT

Use natural continuous Source units from the current Source map.

A Source unit may:

- contribute to several canonical Blocks;
- complete only part of a Block;
- revisit a Block later.

Logic Group count must not manufacture Source-contact count.

## 5.3 RETRIEVAL

Recall fronts should expose **coordinates**, not the answer.

Good prompts ask the learner to reconstruct:

- direction;
- causal link;
- compartment;
- tissue;
- physiologic state;
- decisive boundary;
- exact item when Precision is actually required.

Do not leak the accepted closure in the title / prompt before Reveal.

## 5.4 CORE_CHECK

Canonical KP Core should favor:

```text
causal order
→ direction / branch
→ compartment / tissue / state
→ decisive boundary
→ exact high-value precision
```

Valid 26 refined explanation may improve the Core only after current-Source re-verification.

## 5.5 BOUNDARY

Explicitly preserve:

- what this Block owns;
- what is only Recall / Connection;
- what is Source-visual only;
- what is conflict / uncertain;
- what belongs to another System.

Do not duplicate neighboring clinical or physiology Core merely because the biochemical mechanism connects to it.

## 5.6 COMPRESSION

The desired compression unit is usually a **reconstructable switch / state model**, not a shortened pathway paragraph.

A later-pass asset should become thinner while preserving the variable that determines the answer.

---

# 6｜Framework, Logic Group and KP roles

Biochemistry does not change the shared hierarchy. The roles below operate **inside**:

```text
System → Block → Logic Group → KP
```

## Framework

Framework = canonical System/Block-owned cognitive map that makes the Block or current Source segment navigable.

For Biochemistry it should usually expose:

- input / output;
- decisive branch or switch;
- energy / redox currency;
- compartment / tissue;
- physiologic-state control;
- one or two confusable boundaries.

A Framework can be rich and answer-bearing. It is still a **content job**, not a level between Block and Logic Group.

Explicit Block Framework content remains canonical Block content and must not be demoted to a disposable derived layer.

## Logic Group

Logic Group = the canonical local reconstruction / retrieval / closure unit inside a Block.

A Biochemistry LG should group KPs that answer one causal job such as:

- carbon-entry branching;
- redox defense;
- storage-output decision;
- lipoprotein transport;
- nitrogen handling;
- DNA replication execution.

It does not automatically equal a continuous Source segment.

If a proposed “layer” has the same KP membership and cognitive job as an existing LG, **use the LG**. Do not create a parallel layer.

## KP

KP = stable canonical Knowledge identity.

A KP may own or receive:

- Prompt;
- canonical Core mechanism;
- current Source Precision;
- verified explanatory reconstruction;
- Boundary / Confusable;
- Visual;
- Connection / Extension.

It does not dictate first-pass Source order or learner order.

## Block-owned content jobs

When current canonical Block content explicitly contains them, preserve:

- center question / ownership boundary;
- first-pass route;
- Framework;
- high-density comparisons;
- Memory Routing;
- MI-G / MI-D;
- Visual / exactness gates;
- coverage / routing ledgers;
- Lecture-attached question checkpoint;
- Block Exit / Recall target.

These jobs are part of durable Content Realization. They are not a second Lecture, but neither are they disposable engineering metadata.

---

# 7｜Recall and reconstruction

## 7.1 Local Recall

Release KP / LG Recall only after:

- the owning current-Source material has actually been encountered;
- the minimum prerequisite language is available.

Do not wait for unrelated formal Block closure when the local cognitive object is already valid.

## 7.2 Block Recall

Block Recall reconstructs the Block model, not all KP wording.

For distributed Blocks, Block Recall waits until the last required Source unit has completed the model.

## 7.3 Cross-Block state reconstruction

Biochemistry must deliberately use state-based reconstruction because it compresses multiple pathways into one model.

High-value states include:

- fed vs fasting;
- mature RBC;
- hypoxia / respiratory-chain inhibition / uncoupling;
- diabetes / glucose-utilization failure;
- lipid storage vs mobilization;
- DNA expression / regulation / repair state.

Example form:

```text
state variable changes
→ control point changes
→ substrate flow changes
→ energy/redox consequence
→ expected metabolite / phenotype
```

Prefer this over reciting multiple isolated pathways.

---

# 8｜Memory policy

The target is **high-reuse switches and decisive boundaries**, plus explicit canonical Precision.

Examples:

- NADH vs NADPH;
- cytosol vs mitochondrion;
- liver vs muscle;
- mitochondria-present vs absent;
- fed vs fasting;
- malonyl-CoA ↔ CPT-I;
- LPL vs HSL;
- LCAT vs ACAT;
- HMG-CoA cholesterol vs ketone branch;
- reversible vs irreversible control;
- substrate-level vs oxidative phosphorylation.

Hard rule:

> Do not create duplicate whole-pathway Memory debt when the pathway can be reconstructed from a smaller model.

`MI-G / MI-D` remains governed by the Block Pre-entry Content Contract:

- only explicit Current Block ownership may assign membership;
- importance / frequency / exam yield alone cannot infer it;
- Memory availability is not scheduled review debt.

---

# 9｜Questions

## 9.1 Lecture-attached TTSX

Lecture-attached questions remain inside the Source flow and obey reviewed Source boundaries.

They do not become the official System question sweep.

## 9.2 Official questions

Official questions test the model after the relevant Knowledge exists.

Question order does not own learning order.

Precise Question→Block/KP routing requires reviewed relation authority.

## 9.3 Diagnostic axes for Biochemistry repair

When a question / Recall fails, diagnose the smallest useful axis:

```text
IDENTITY
DIRECTION
COMPARTMENT_OR_TISSUE_LOCALIZATION
PHYSIOLOGIC_STATE
BOUNDARY_OR_CONFUSABLE
MECHANISM
PRECISION
```

Repair the failed axis / relation, not the whole chapter by default.

## 9.4 Source revision and mappings

A current Source / Knowledge revision triggers bounded review of:

- reviewed Question→Knowledge relations whose target meaning or owner boundary changed;
- learner-facing explanations whose reasoning, terminology, precision or boundary depends on changed Knowledge.

System-level official-question membership is reopened only when corpus / ownership evidence actually changes.

Missing mapping remains legal; never infer one from title similarity.

---

# 10｜Cross-System integration

Biochemistry should connect aggressively in **meaning**, but conservatively in **ownership and Source switching**.

The default integration ladder is:

```text
1. JIT Connection during current Biochemistry Source
   → only the minimum outside idea needed to understand the current biochemical mechanism
   → no course switch

2. Connection Hook / Recall at Block or Logic Group level
   → already learned target owner: Recall it
   → not-yet-learned target owner: mark the formal future owner
   → no duplicate external Core

3. Post-formation cross-Block / cross-System Reconstruction
   → combine biochemical mechanism with digestive / endocrine / clinical state
   → use shared state variables rather than rereading both courses
```

Therefore Biochemistry may keep a dedicated continuous Source lane **without becoming an isolated knowledge island**.

High-value integration examples include:

- M4 glucose output ↔ D7 fed/fasting and insulin/glucagon control;
- M7 storage/mobilization/ketogenesis ↔ D7/D8 fasting, diabetes and glucose-utilization failure;
- M5 lipoprotein transport ↔ D3/D4 intestinal lipid digestion/absorption;
- M6 bile-acid synthesis ↔ D3/D4 digestion/absorption ↔ D19 hepatobiliary disease;
- M8 ammonia/urea ↔ D17 hepatic failure / hyperammonemia;
- M10 bilirubin handling ↔ D17/D19 jaundice localization;
- RBC / folate / B12 / heme ↔ hematology;
- HIF / nuclear receptor ↔ physiology / endocrine;
- oncogene / repair ↔ tumor-general.

Rules:

- Connection may Recall or preview one external idea;
- external medical Core stays in its formal owner;
- a durable deferred hook requires one formal Current target owner;
- no full-course switching merely because a connection exists;
- after the relevant owners are learned, Reconstruction should actively **recombine** them rather than leaving the knowledge graph as isolated subjects.

A useful summary is:

> **Source continuity can be domain-specific; Knowledge integration must remain System-wide.**

---

# 11｜Visual / exactness

Use Source Visual when cognition depends on:

- pathway geometry;
- multi-branch maps;
- enzyme kinetic curves;
- molecular structure / binding;
- table row-column identity;
- handwritten symbol / arrow relation.

Visual support is selective, not a coverage quota.

Exact Source ambiguity must remain fail-closed.

---

# 12｜Acceptance for a Biochemistry rebuild

A Biochemistry Source revision is not closed merely because new Source text has been ingested.

Minimum closure chain:

```text
S  current Source identity / locators / gaps current
K  M1–M10 + G1–G5 Core + System/cross-System model reaccepted
L  Source-contact / learner route / LG / closure semantics reaccepted
C  Content responsibilities and Recall-front protection reaccepted
G  bound Beginner Guide / Orientation revalidated against Current System + Learning + Source-lane semantics
Q  affected Question→Knowledge relations revalidated
X  affected learner-facing question explanations revalidated
E  historical learner evidence classified against the new Source revision
A  scoped Current / Acceptance reconciled
```

Unchanged objects should be preserved rather than rebuilt for symmetry.

Additional architecture gates:

- canonical hierarchy remains exactly `System → Block → Logic Group → KP`;
- no Source unit, pathway family, “L1/L2/L3 layer”, mother model or Framework is promoted into a parallel hierarchy;
- Source maps bind current Source to existing Block/LG/KP identities or explicit support/Connection roles;
- learner order may differ from stable KP/file order without physically reordering canonical identity;
- explicit Framework / Memory Routing / MI-G / MI-D and other Block-owned content jobs survive Content revalidation;
- any bound Beginner Guide remains explanation-only but is revalidated when Source order, mother-model orientation or first-pass handoff semantics change;
- for the Current B Guide, learner-facing orientation must preserve the distinction `teacher Source order ≠ canonical M/G order`, the JIT Prelude rule, the two Biochemistry mother models, and the one-current-Source / historical-explanation-substrate boundary;
- digestive/endocrine/clinical connections are preserved through JIT / Connection / Recall / Reconstruction rather than routine Source switching.


---

# 13｜Fresh-Chat / restart rule

For a Biochemistry learning / construction continuation:

```text
content/xizong/CURRENT.md
→ content/xizong/LEARNING_CONTRACT.md
→ this BIOCHEMISTRY_CONTRACT.md
→ current B learning owner
→ current Biochemistry Source map
→ exact active Block / Question / Source owner only as needed
```

For the current 27 rebase, also read the active delta/task owner named by the Mainline.

Do not reconstruct the Biochemistry learning model from:

- historical Block order;
- old 26 page order;
- question order;
- UI layout;
- retired System Guide prose.

---

# 14｜Change rule

Change this contract only when evidence shows the **Biochemistry-specific learning / content model** is wrong or incomplete.

Do not change it for:

- one new drug;
- one revised threshold;
- one bad mapping;
- one UI bug;
- one Source page correction.

Those belong to the smallest responsible owner.

Durable direction:

> **one current continuous Source → mechanism reconstruction → stable canonical M/G Knowledge → state-based retrieval → high-value exactness → official application → smallest repair → progressively thinner biochemical model.**
