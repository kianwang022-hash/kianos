# Skill Library Learning Contract

Status: CURRENT  
Role: shared cognition / learning rule for promoted non-exam Skills.

Parent standards:
- root `LEARNING_ASSET_STANDARD.md`;
- root `LEARNING_ACCEPTANCE.md`;
- root `ARCHITECTURE.md`.

This contract adds only the Skill-specific cognition model. It does not create a second Acceptance system.

---

## 0｜One integrated learning chain

A Skill is not a folder of notes and not a mini-course.

The durable chain is:

```text
real demand / success condition
→ reliable Source
→ AI Knowledge reconstruction
→ Learning Logic
→ learner Content
→ bounded self-attack / Content closure
→ Projection / Runtime
→ learner cognition
→ Evidence
→ progressive Compression
→ real use / calibration
→ evidence-based revision
```

This is **one causal chain**.

The self-attack before release and the learner's later use are different evidence moments inside the same chain, not two separate products.

Hard rule:

> Kian is the learner, not the QA department.

Kian may notice a defect, but the system must not depend on Kian discovering basic content errors, missing boundaries, answer leakage, broken routing or bad learning geometry.

---

## 1｜Source → Knowledge → Content

Raw papers, documentation, courses, standards, expert material, repositories and prior internal assets are Source / evidence, not finished Knowledge.

AI must reconstruct learner-worthy Knowledge.

Good Skill Knowledge should, when material:

- translate Source into **learner language before learner display**: use the plainest wording that preserves the decision-relevant truth;
- introduce unavoidable technical terms only when they earn their cognitive cost, and pair them with an immediately understandable meaning;
- expose the causal / decision / execution model;
- identify decisive distinctions, boundaries and failure modes;
- preserve exact high-value facts without burying the model;
- show confusable near-neighbors and counterexamples;
- state uncertainty and escalation boundaries;
- use a representation suited to the domain;
- demote low-value detail without silently deleting truth;
- remain coherent if the current webpage disappears.

### Learner-language rule

K is not finished when the facts are merely correct. Before a learner-facing asset is realized, the reconstructed Knowledge must also be cognitively usable:

```text
source wording
≠ learner wording

precision
≠ jargon density

plain language
≠ loss of truth
```

Default transformation:

```text
accurate source claim
→ causal / decision meaning
→ plain learner explanation
→ exact term / boundary where needed
```

Do not make Kian decode paper language, guideline language, repository language or model-internal abstractions unless that vocabulary itself is part of the capability.

Hard distinctions:

```text
source order ≠ knowledge order
topic heading ≠ Unit boundary
page layout ≠ cognition
question taxonomy ≠ knowledge ontology
file existence ≠ readiness
```


---

## 1.5｜Upstream deep research and Deep Reading content

KianOS does not rediscover or re-summarize an external domain merely because a learner/product surface exists here.

When StudyHub or another authorized research owner has already built a mature external research basis, keep two cases distinct.

### A. Mature StudyHub Report already exists

If StudyHub already owns a high-quality human-readable Report / Deep Reading whose job is to explain the external world:

```text
StudyHub Source / evidence / synthesis
→ canonical StudyHub Report / Deep Reading
→ KianOS reference / projection when needed
→ presentation / navigation / Resume / interaction / Evidence
```

Hard rules:

- the external-world Report remains canonical in StudyHub;
- KianOS does **not** perform a second semantic rewrite merely to make it "KianOS-native";
- a KianOS renderer/projection may hide, foreground, reorder or navigate accepted meaning when learner state requires it, but it does not become a second owner of that Report;
- website availability, reading state, navigation, interaction and Evidence are downstream product/learning semantics, not ownership of the upstream research prose;
- if the Report itself is weak or wrong, repair it upstream in StudyHub rather than masking the defect in KianOS.

### B. KianOS adds genuinely new learner-specific meaning

KianOS may create new canonical learner assets only for meaning that StudyHub does not own, for example:

- Learning Logic;
- protected Verify / practice geometry;
- learner-specific Compression;
- reconstruction / repair prompts;
- learner-state-dependent projections;
- Evidence semantics.

Then:

```text
StudyHub research / Report
→ KianOS adds only learner-specific meaning
→ new KianOS owner references upstream StudyHub
```

The new learner asset does not replace or silently copy the StudyHub Report.

### If StudyHub has research substrate but no final readable Report

When a final external-world explanation is still needed, Chat authors that explanation into the StudyHub-owned Report first if its purpose remains external-world understanding. KianOS joins only for the additional product/learning function.

### Framework and Deep Reading are different content roles

A learner Framework provides coordinates:

- where a concept sits;
- its parent / siblings / neighbors;
- its role in the larger system;
- important flows / mechanisms / interfaces.

A Deep Reading provides a coherent explanatory path through one important question. It may cross multiple Framework branches, Units or Skills when the real causal chain requires it.

Therefore:

> **Framework boundaries must not dictate the narrative boundary of a Deep Reading.**

Do not cut a high-value explanation into artificial chapters merely to preserve one Skill / Unit hierarchy.

### Deep Reading and Unit are different

A Deep Reading is an expanded understanding asset.

A Unit remains the smallest coherent capability slice that can be reconstructed, applied, demonstrated, transferred and repaired.

One Deep Reading may support several Units; one Unit may draw on several readings or cases.

Do not infer:

```text
Deep Reading read
→ Unit mastered
```

Compression still comes later, after learner evidence shows which relations are decisive enough to preserve in a smaller callable model.


## 2｜Pre-release content closure is mandatory

Before new or materially changed learner Content is released to Kian, AI performs one bounded adversarial closure pass at the earliest responsible owner.

The attack asks, as applicable:

- Is any claim unsupported, overstated or stale?
- Is a decisive distinction missing?
- Is a confusable case collapsed into the wrong rule?
- Does the content overgeneralize from one example?
- Is exact detail mixed into mechanism in a way that hides the model?
- Is there answer leakage into a protected Verify?
- Is the learner being asked to infer a relation the asset should teach?
- Does the representation fit the real task, or is it merely prose?
- Does Compression delete information needed for a real decision?
- Is a high-consequence boundary missing?
- Is the asset duplicating another owner or creating future review debt without evidence?

Default closure shape:

```text
Draft
→ adversarial attack
→ concrete defect list only
→ smallest repair
→ fresh re-read against Source + Learning Logic
→ release or remain blocked
```

Do not run endless audits.

One bounded closure is enough unless:
- the repair materially changes the model;
- a new contradiction appears;
- downstream testing exposes a new responsible defect;
- or real learner evidence reopens the owner.

This pre-release closure contributes to S/K/L/P/R/E readiness. It never creates U.

---

## 3｜Learning Logic includes attention design

L owns not only the order of cognitive actions, but also **what deserves Kian's attention at each moment**.

For every learner-facing step, decide:

- what must be foregrounded now;
- what can be delayed, folded or omitted;
- the useful information density for focused study;
- whether a table / contrast / diagram / protocol is cheaper than prose;
- whether an example adds discrimination or only length;
- what should disappear after the model is compressed;
- whether switching to Chat / another surface is worth the attention cost.

Hard rule:

> Kian's attention is a constrained learning resource. Content that is true but poorly timed, poorly structured or unnecessarily difficult to parse is an L defect, not merely a styling issue.

The learner-facing target is:

```text
maximum decision-relevant understanding
---------------------------------------
attention + switching + rereading cost
```

Projection may control spacing, layout, disclosure and interaction, but P must not be forced to rescue dense jargon or a badly sequenced learner model that should have been solved in K/L.

---

## 4｜Cognition hierarchy: expanded → demonstrated → compressed → used

A mature Skill deliberately moves through different cognitive resolutions.

### C0 · Orientation

**Guide / Framework**

Answers:
- What capability is this?
- Why is it structured this way?
- What model should I expect?

Orientation is small and skippable when unnecessary.

It is not capability evidence.

### C1 · Expanded Model

**Learn**

The richest learner representation of the decision-relevant model:
- relations;
- distinctions;
- boundaries;
- examples;
- exact facts;
- source-grounded support.

This is where complexity is allowed when it reduces later confusion.

### C2 · Reconstruction

**Recall / explain / rebuild / reproduce**

Kian must actively regenerate the important structure instead of only recognizing it.

The exact action follows the domain:
- explain a mechanism;
- redraw a process;
- reconstruct a decision tree;
- reproduce a workflow;
- perform a native step;
- retrieve decisive distinctions.

### C3 · Application / Discrimination

The model is used on cases, tasks, builds, comparisons or decisions.

Practice geometry follows the real capability:

```text
mental model  → retrieve / explain / reconstruct
judgment      → contrasted cases / decisive cues / uncertainty
software      → build / debug / ship
communication → live production / real interaction
physical      → embodied practice / external feedback
decision      → scenarios / real decisions / later outcome review
```

Do not default every Skill to reading + quiz.

### C4 · Direct Demonstration

**Protected Verify or equivalent clean performance**

The learner demonstrates the target capability with minimized answer leakage.

Comfortable discussion, rereading, page completion and same-item correction do not satisfy this layer.

### Repair branch

Failure at C2–C4 does not create a new mandatory stage.

Use:

```text
first meaningful failure
→ diagnose only if causes imply different actions
→ repair smallest failed object
→ reconstruct / re-execute
→ return to interrupted layer
```

Repair evidence is not mastery evidence.

### C5 · Unit Compression

Once the model has survived enough reconstruction / application / direct demonstration, the expanded representation is compressed into a **callable operating object**.

Compression is not a shorter summary.

It should preserve the smallest structure that still supports correct action, for example:
- causal skeleton;
- contrast matrix;
- decision tree;
- branch checklist;
- action protocol;
- one-screen operating model.

Hard rule:

> Do not freeze final Compression before learner evidence reveals which distinctions are actually decisive.

A prebuilt compression candidate may exist, but it remains provisional until evidence supports it.

### C6 · Changed-context Transfer

The compressed model is tested under changed surface cues:
- different wording;
- different context;
- incomplete information;
- competing cues;
- delayed retrieval;
- realistic tools / constraints.

Fresh changed-context success is stronger evidence than same-item correction.

If Transfer fails:

```text
reopen smallest failed relation
→ repair
→ update Compression only if needed
→ transfer again
```

### C7 · Real Use

Use the capability in the environment it actually exists for.

Tool use is allowed when the real capability is tool-mediated.

### C8 · Personal Calibration

Repeated real use may produce Kian-specific priors, triggers, boundaries or exceptions.

```text
generic model
+ repeated personal evidence
→ calibrated personal rule
```

Do not promote one anecdote into a personal law.

### C9 · Skill Compression

After multiple Units mature, the Skill itself compresses into one higher-order operating model.

The final Skill model should reduce future operations:
- less rereading;
- less reconstruction from scratch;
- faster diagnosis;
- faster action selection;
- less repeated confusion.

Shorter text alone is not Compression.

---

## 5｜Progressive compression, not permanent expansion

Skills follow the same mature direction as the exam systems:

```text
first learning
= expanded model

after reconstruction / demonstration
= Unit Compression

after transfer / real use
= calibrated Compression

after multiple Units
= Skill Operating Model
```

Later use should normally become thinner.

New contradictory evidence reopens only the smallest affected object.

Do not force the learner back through the full expanded model when the failure is local.

---

## 6｜Unit semantics

A Unit is the smallest coherent capability slice that can be:

- formed;
- reconstructed;
- applied;
- demonstrated;
- compressed;
- transferred or used;
- and independently repaired when it fails.

A Unit is not a chapter heading.

Detailed minimum design lives in `UNIT_CONTRACT.md`.

---

## 7｜Baseline gate

A clean baseline is useful only when an uninstructed attempt contains real information about current capability.

Use:

```text
CLEAN
→ prior attempt is genuinely diagnostic

SOFT
→ quick probe may help but is not worth consuming protected material

SKIP
→ novice guessing / unsafe task / sufficient existing evidence / no decision impact
```

Do not manufacture a pre-test ritual for every Skill.

---

## 8｜Assistance mode

Each material performance should make assistance semantics explicit when they affect what the evidence means:

```text
NATIVE
TOOL_ALLOWED
AI_ASSISTED
EXPERT_GATED
```

The purpose is not to ban AI.

It is to prevent:

```text
AI produced a good result
≠
Kian demonstrated the native capability
```

The real-world ceiling may legitimately include tools while the native floor remains separately visible.

---

## 9｜Surface ownership: Website reads, Chat thinks with Kian

For the generic Skill Library, the learner-facing website is primarily a **reading / reference surface**.

### Website owns

- Guide / Framework;
- expanded learner Content;
- stable reference material;
- stable Compression only when it is genuinely ready for learner display;
- navigation and lightweight Resume of the last opened reading asset.

The website should feel like a high-quality handbook, not a workflow engine.

### Chat owns

- deeper explanation and discussion;
- learner Reconstruction;
- Verify / clean demonstration;
- Repair;
- changed-context Transfer;
- Evidence judgment;
- personal Calibration;
- deciding when a provisional Compression is mature enough to become learner-facing;
- upgrading canonical Content when discussion or evidence reveals a real defect.

Hard rule:

> **Do not move an interaction into Astro merely because Runtime can implement it.**

For ordinary Skills:

```text
Website
= read / scan / reference / resume

Chat
= reconstruct / verify / repair / transfer / calibrate / upgrade
```

A protected Verify / Transfer asset may exist in GitHub as Chat-readable Current content without being a learner-visible webpage.

Do not require Kian to:
- type learner answers into the website;
- import/export Chat Return payloads;
- operate evidence state;
- click through cognition stages;
- manage repair workflows;
- understand internal stage names.

If a domain genuinely requires a native interactive surface (for example code execution, speech, embodied feedback, or another real task geometry), that is a separate L decision for that Skill. It is not the generic default.

---

## 10｜Discussion channel

After learner Content, Kian may return to Chat with:

- questions;
- objections;
- personal examples;
- alternative interpretations;
- real-use friction.

Discussion may:
- resolve conceptual friction;
- improve canonical Content;
- form a Repair hypothesis;
- reveal a missing distinction;
- help calibrate the model.

Discussion itself is not Verify and must not silently leak a protected answer before clean performance.

---

## 11｜Evidence / promotion

Capability evidence generally strengthens as cue support and familiarity fall:

```text
ORIENTED
< RECONSTRUCTED
< DIRECTLY_DEMONSTRATED
< CHANGED_CONTEXT_TRANSFER
< REAL_USE
< STABLE
```

Compression is a representation state, not an evidence label.

Never promote capability from:
- file existence;
- page completion;
- “I understand”;
- comfortable discussion;
- same-item correction alone;
- AI-assisted output when native performance is the target.

The success condition decides how high the ladder must go.

---

## 12｜Maintenance

Do not automatically create spaced review debt.

Add maintenance only when:
- the capability decays without use;
- failure is costly;
- real use is too rare to maintain it naturally;
- or evidence shows regression.

If ordinary real use maintains the capability, real use is the maintenance plan.

---

## 13｜Resume / learner surface

A fresh learner entry should cheaply answer:
- what this Skill is for;
- what reading asset was opened most recently;
- where the learner can continue reading;
- when deeper work should return to Chat.

Generic Website Resume is a navigation convenience only:

```text
last opened learner-visible reading asset
→ continue reading
```

It does not expose or ask Kian to operate reconstruction, verification, repair, transfer or evidence state.

Projection remains derived. It does not become a second Knowledge owner.

---

## 14｜Change / stop rule

Revise the system from:
- concrete Source/Knowledge defects;
- failed adversarial closure;
- learner friction;
- failed reconstruction;
- failed transfer;
- repeated real-use evidence.

Do not revise merely because another elegant framework can be imagined.

FAIL when the Skill becomes:
- a second textbook without learner value;
- a status dashboard;
- an engagement feed;
- a universal quiz engine;
- a mandatory logging ritual;
- a Skill-specific frontend without a real geometry need;
- a permanent expansion that never compresses.

Durable direction:

> **reliable Source → excellent AI Knowledge → correct Learning Logic → self-attacked learner Content → reconstruction/application → clean demonstration → progressive Compression → transfer/real use → calibrated revision.**
