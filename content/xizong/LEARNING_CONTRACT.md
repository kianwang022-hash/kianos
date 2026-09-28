# Xizong Learning Contract

Status: **CURRENT**  
Role: highest learner-facing Rule / Model for Xizong

Parent standards:
- root `ARCHITECTURE.md`;
- `LEARNING_ASSET_STANDARD.md`;
- `LEARNING_ACCEPTANCE.md`;
- `SYSTEM_CONTRACT.md`.

This file owns the stable Xizong cognition and learning model.

It answers:

> **What should AI turn medical Source into, and how should Kian understand, retrieve, apply, repair and compress that Knowledge for the 306 exam?**

It does not own medical facts, exact Source provenance, page layout, Runtime fields, Acceptance Truth, or Kian's private learner state.

---

## 0｜Purpose

Xizong exists to turn a very large medical syllabus into a **lossless but progressively compressed, mechanism-centered, retrievable and applicable knowledge system**.

The target capability develops as:

```text
understand the medical model
→ actively reconstruct it
→ locate real gaps
→ repair the smallest failed object
→ apply in questions / cases
→ stabilize high-value precision
→ compress without losing decisive information
```

Xizong is not optimized for:

- copying every Lecture paragraph into KianOS;
- maximizing KP / page / question / Visual count;
- memorizing isolated facts before their owning model exists;
- turning every first exposure into future review debt;
- using engineering completion as evidence that Kian learned anything.

---

## 1｜K — what counts as good medical Knowledge

The original Lecture / textbook / question source is **Source**, not finished Knowledge.

AI must transform reliable Source into learner-worthy medical Knowledge.

A high-quality Xizong Knowledge asset should, when material:

- expose the **mechanism / causal model**, not only list facts;
- show how variables, structures and processes relate;
- distinguish cause, consequence, compensation, feedback and failure;
- state decisive **boundaries / differentials / confusable conditions**;
- preserve high-value exact facts such as thresholds, drugs, markers, classifications, timelines and procedures without mixing them into mechanism prose;
- connect physiology, pathology, internal medicine, surgery and biochemistry when the relation genuinely improves the model;
- preserve clinically/exam-relevant discrimination without letting question taxonomy dictate the Knowledge structure;
- keep Source locators and provenance available without copying the Lecture as a second textbook;
- demote low-value detail or reference material without silently deleting valid truth.

Hard rules:

```text
teacher order ≠ canonical Knowledge order
question taxonomy ≠ Knowledge ontology
page layout ≠ Knowledge structure
KP identity ≠ learner order
```

A good Core should still be coherent and useful if the current webpage disappeared.

The AI role is to **reconstruct the medical model**, not reformat the source.

---

## 2｜Ownership

### Medical / Knowledge Truth

Canonical medical content belongs to:

- `content/xizong/knowledge/systems/**`;
- `content/xizong/knowledge/manifest.json` for ownership/routing;
- dedicated question / explanation / reviewed-relation owners for those facts.

Neither this contract nor Runtime may silently rewrite medical Core.

### Learning Rule

This contract owns:

- natural learner units;
- first-learning / Recall / question / Repair / later-pass relationships;
- Source-surface ownership;
- TTSX role;
- Memory / compression principles;
- shared Xizong learning boundaries.

`content/xizong/knowledge/learner/study-policy.json` may hold detailed machine-executable policy inside this constitution. It is not a second learning constitution.

System-specific `*-learning.json` assets may refine learner order, Source-contact granularity, Logic Group goals and closure cues for that System. They may reorganize **when/how** medical objects are learned; they may not change **what** those medical objects mean.

### Engineering / learner truth

Runtime executes approved semantics. It is not a medical or Learning owner.

Kian's actual learning, attempts, Wrong/Uncertain, notes and review state remain private learner evidence.

---

## 3｜Natural learning units

Xizong uses different granularities because they solve different cognitive problems:

```text
System
→ Block
→ Logic Group
→ KP
```

### System

Large causal model and natural scope for integration, System Recall, broad official-question coverage and later cross-Block reconstruction.

### Block

Main coherent first-learning problem. A Block should feel like one medical model, not a folder or pile of KPs.

### Logic Group

Retrieval / local-closure unit inside a Block. It groups KPs that must be understood together to resolve one local causal problem.

A Logic Group is **not automatically a Source-contact segment**.

### KP

Stable canonical Knowledge identity. A KP is not automatically the learner interaction unit and does not dictate learner order.

### Source-contact segment

Execution unit for continuous original-Lecture learning.

It answers:

> **From where to where should Kian read continuously before the next useful checkpoint/return?**

It is not a fifth canonical Knowledge hierarchy.

Hard distinction:

```text
canonical identity
≠ learner order
≠ Logic Group
≠ Source-contact segment
≠ page order
≠ question taxonomy
```

### Architecture invariant｜one hierarchy, many content jobs

The **only formal canonical learner/knowledge hierarchy** in Xizong is:

```text
System
→ Block
→ Logic Group
→ KP
```

Do not insert another semantic layer between Block, Logic Group and KP merely because a subject benefits from a mother model, submodel, pathway family, chapter band, phase, arc, layer or Source unit.

In particular:

- a Framework / mother model is a **Block/System-owned cognitive map**, not a new canonical level;
- a Source-contact segment is an **execution unit**, not a Knowledge level;
- learner order is a **Learning relation**, not canonical identity;
- stable file/KP order may differ from learner order;
- Projection views and Runtime states are **presentation / interaction states**, not Knowledge levels.

The following are **content jobs / semantic families around the same canonical owners**, not extra hierarchy:

```text
Guide
Framework
Center Question / Orientation
Prompt
Core
Boundary / Confusable
Precision
Visual
Connection / Extension
Memory Routing
MI-G / MI-D
Recall / Closure
Compression
Question Probe
Repair
Projection
```

Where explicit canonical Block content already owns Framework / Memory Routing / MI-G / MI-D, those jobs remain canonical Block content semantics. They must not be demoted to disposable “derived support” merely because a renderer or Learning owner consumes them later.

A mature Block may therefore contain, when genuinely supported:

```text
scope / owner boundary
→ first-pass route
→ Block Framework
→ KP Core package(s)
→ high-density comparison / decisive boundary
→ Memory Routing (MI-G / MI-D)
→ Visual / exactness gate
→ coverage / routing ledger
→ Lecture-attached question checkpoint
→ Block Exit / Recall target
```

This is **content realization around one Block**, not a second hierarchy.

Downstream resolution remains:

```text
canonical System / Block / LG / KP truth
+ accepted Learning owner
+ reviewed Precision / Visual / Connection / Extension
+ Cognitive Projection when needed
→ one learner object
→ shared renderer
```

The website must consume those owners; page structure must never be used to reconstruct or redefine the hierarchy.


---

## 4｜First learning: Lecture-primary, KianOS-guided

Continuous first-pass Lecture study remains **external-primary on the original iPad / MarginNote source**.

This is a Learning decision, not an implementation preference.

Surface roles:

### iPad / MarginNote

Primary continuous Source-learning surface for:

- original Lecture sequence;
- figures / tables;
- source-local examples;
- annotation;
- Lecture-attached TTSX;
- answer/options/question-side expansion.

### KianOS

Primary surface for:

- System / Block orientation;
- current causal target and attention boundary;
- KP Learn companion support;
- active Recall;
- Logic Group / Block / System closure;
- selective Precision / Visual support;
- official questions;
- Wrong / Uncertain routing;
- Memory / compression / later review.

### Chat

Adaptive companion for:

- mechanism clarification;
- cross-System linking;
- diagnosis when it changes the next action;
- smallest-sufficient repair;
- personalized explanation / review.

Hard rules:

- KianOS must not become a second primary Lecture reader merely because it can render source text;
- the learner should not bounce between devices for artificial workflow ceremonies;
- Source-contact granularity is owned by accepted learning logic, not by KP/LG/page structure;
- a runtime capability never authorizes a learner action Kian has not actually reached.

---

## 5｜Locked first-pass learner flow

Normal first-pass flow is:

```text
optional Guide when genuinely useful
→ System Framework
→ Block Framework
→ continuous original-Lecture learning on iPad / MarginNote
   while KianOS stays on the relevant KP Learn companion surface(s)
→ lightweight TTSX checkpoint only at a real reviewed Source boundary when bound questions exist
→ KP Recall after the owning material has actually been learned
→ Logic Group closure
→ Block Recall
→ Block Complete
→ release reusable Block Memory assets
→ after the whole System is actually learned: System Recall
→ official System question sweep
→ smallest-sufficient Repair / exact Return
→ rolling Memory / Precision / later-pass reuse
```

### Guide

Small, skippable first-learning entrance. It explains why the System/Block is organized this way or which intuitive mistake to avoid.

Guide is not a recurring gate and must not become a second Lecture.

### System / Block Framework

Thin recurring model of the major mechanism, failure structure, judgment axes, boundaries and route.

Framework exists to orient cognition, not to become a prose course.

### KP Learn

Mac companion while Source learning continues on the original Lecture surface.

It should expose the current Prompt/Core and useful locators/support without requiring Recall behavior during Learn.

### KP Recall

Core-protected active retrieval after the owning material has actually been learned.

Learn and Recall remain the same KP learner object. Recall changes **Core visibility**, not the identity of the card or its surrounding workspace.

Before Reveal, the canonical KP Core stays hidden. The KP title, active Prompt, Source / Outline locators and Current-owned Context such as Precision / Visual / Connection may remain visible when useful. Reveal opens the same canonical Core; it does not switch to a second answer card.

This protection rule is specific to KP Recall. Block/System Recall may still use stricter neutral-front protection where their accepted reconstruction contract requires it.

### Logic Group closure

A lightweight state inside the persistent Logic Map, not a standalone learner stage.

When all KPs in the Logic Group have real Recall evidence, the map marks that group closed and the learner proceeds directly to the next Logic Group. The existing `goal / closure` text remains the local model target; no extra confirmation page, rating or click is required.

---

## 6｜TTSX and official questions are different actions

### Lecture-attached TTSX

TTSX belongs to the Lecture flow.

```text
reviewed boundary decides WHEN
reviewed binding decides WHICH
```

- answer in the original Lecture / MarginNote surface;
- inspect answer, options and question-side expansion there;
- KianOS records only a low-friction checkpoint and optional learner-selected evidence when useful;
- no real binding → no invented release;
- a correct TTSX with no useful delta may create no durable debt.

TTSX is not a second Question Runtime.

### Official System questions

Official questions are a **highest-value reusable learning / verification asset** after the System model exists.

They do not own first-learning order, but “already attempted” does **not** make a true question low value. The same official question may be deliberately reused across passes because each pass can test a different capability:

```text
first pass   → coverage / obvious knowledge gaps
second pass  → decisive condition / distractor discrimination / condition change
late pass    → speed / switching / compressed retrieval / exam execution
```

Evidence meaning must still stay honest: a repeated correct answer is not fully fresh evidence merely because the item is valuable.

Default priority for targeted weakness work is:

```text
high-value official-question reuse when it answers the current learning question
→ otherwise a bounded AI fresh-transfer probe when a precise unseen variant would add real information
→ never generate extra practice merely because the runtime can
```

AI probes are **supplementary transfer diagnostics**, not official Question Truth and not formal score evidence. They must be bound to Current canonical medical owners, use the existing Practice Workbench, and remain small: normally one probe for one unresolved learning question, with a second only when the first genuinely fails to discriminate the cause.

Protected unseen official material remains diagnostic capital and must not be consumed merely because Runtime can display it.

---

## 7｜Evidence and Repair

A Recall rating, TTSX note, Wrong/Uncertain result or correct answer is an **observation**, not an automatic diagnosis or mastery claim.

Hard rules:

- Wrong / Uncertain does not automatically mean the whole KP/Block model is broken;
- diagnosis is worth doing only when plausible causes would lead to different next actions;
- repair targets the smallest sufficient failed object;
- repair returns to the interrupted mainline;
- repair evidence does not erase the original observation;
- same-item correction does not prove later transfer/mastery;
- precise Question→KP routing requires reviewed authority, not title similarity or model intuition.

Default shape:

```text
question / Recall / selected TTSX evidence
→ first meaningful failure
→ smallest sufficient medical / boundary / precision repair
→ reconstruct when useful
→ return to interrupted System path
```

### Score attribution is observed evidence, not predicted point ownership

Official-question evidence may be weighted by the **historical point value of that exact question** and routed through the reviewed Question→Knowledge relation.

Hard rules:

- only official-question attempts may contribute official score-attribution evidence;
- AI transfer probes are `TRANSFER_ONLY` and contribute zero official score weight;
- the attempt freezes the point value and reviewed relation snapshot that existed when the attempt was made;
- one question's point value is counted once, against its reviewed **PRIMARY** owner only;
- supporting KPs remain diagnostic context and never multiply the question's points;
- a reviewed Block-only relation may attribute evidence to the Block, but Runtime must not guess a KP;
- missing / unresolved mapping stays `UNMAPPED`;
- repeated true-question attempts remain valuable, but first-attempt and reuse evidence stay distinguishable;
- `Wrong` / `Uncertain` / `Stable` point weights describe observed evidence under that attempt, not guaranteed future score loss/gain;
- formal score truth still comes from the matching whole-paper scoring owner and sealed exam evidence, not from summing Knowledge weights.

This attribution exists so later scheduling can identify where **observed exam-value evidence** is concentrated without inventing a universal `KP = N points` model.

---

## 8｜Memory and attention

First exposure does not automatically create future review debt.

Separate:

```text
Memory asset availability
≠ scheduled review debt
```

At real Block Complete, reusable assets may be released into persistent Memory:

- Core Memory from canonical KPs;
- current-owner Precision items;
- learner-marked Prompt/Core fragments.

Release means **available**, not automatically due today.

Weakness is normally an evidence/priority state over an existing asset, not a duplicate card corpus.

Repair remains a bounded active task queue, not a second Memory library.

Kian may keep private learner state such as:

- personal Prompt override;
- anchored fragment marking/highlighting;
- learner note where useful;
- Recall / question evidence.

Private state never mutates canonical medical Core.

---

## 9｜Later passes become thinner

Later learning should become **thinner, not longer**:

```text
first pass
= build the full model

second pass
= discrimination + precision + application + cases

late review
= compressed causal skeleton
+ high-value boundaries / precision
+ real weak points
```

Successful later fresh application is stronger evidence than repeatedly proving memorized items.

New contradictory evidence reopens only the smallest affected object.

The goal is not permanent proof of every KP. The goal is a compact model that still supports correct retrieval and application under exam conditions.

---

## 10｜Visual / Extension

Visual is **conditional support inside the same learning chain**, not an independent learning program.

Use strong Visual support when cognition genuinely depends on spatial, anatomical, morphologic, waveform, image-recognition, curve or other visual structure.

Hard rules:

- Source Visual Truth remains source-owned;
- Visual Gate ≠ screenshot backlog;
- missing optional Visual/Extension ≠ unfinished Block;
- Visual coverage is not a symmetry target;
- Visual should be admitted because it lowers learning cost, not because the renderer can display it.

Specific page geometry belongs to Visual owners, not this Learning Contract.

---

## 11｜Sub-lane / ownership rule

A Xizong System gets its own durable `CURRENT`, local contract or scoped Acceptance owner only when independent continuation genuinely benefits from it.

Do not create one file set per System merely for symmetry.

Medical hierarchy and governance hierarchy are different things.

---

## 12｜Engineering readiness ≠ learner progress

A System may be **ready for learner test** when the applicable S–E gates are accepted.

That proves nothing about whether Kian has actually:

- learned the System;
- performed Recall;
- attempted its questions;
- repaired a gap;
- validated the learner path.

Only real learner use creates U evidence.

---

## 13｜Fresh-Chat / non-drift rule

For learner-flow questions, read in this order only as needed:

```text
content/xizong/CURRENT.md
→ this LEARNING_CONTRACT.md
→ study-policy.json when machine execution detail matters
→ exact System-specific Learning owner when local Source/LG differences matter
→ Visual / Engineering owners only for implementation
```

Do not reconstruct a different learner model from:

- old screenshots;
- historical Guides;
- stale PR discussion;
- current DOM quirks;
- implementation convenience.

If Visual / Runtime lacks a capability required by this Rule, that is a downstream implementation defect.

If real learner evidence shows the learning model itself is wrong, reopen this contract explicitly.

---

## 14｜Change rule

This contract changes only when real evidence shows that the **Xizong learning model itself** is wrong or incomplete.

A content defect, bad mapping, UI friction, Runtime bug or question error is repaired at its actual owner unless it demonstrates a lane-level cognition failure.

Durable direction:

> **medical truth → AI mechanism reconstruction → source-faithful continuous learning → active retrieval → smallest repair → application → progressively thinner mastery.**
