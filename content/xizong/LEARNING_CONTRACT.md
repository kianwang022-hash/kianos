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

### Formal Boundary / Connection adoption is Source-explicit

General explanation may reorganize trustworthy Source into a clearer mechanism. Formal learner support objects are stricter. An author-labeled `Boundary / 易错 / 易混` or formal `Connection / //串联` must follow:

```text
Source explicit signal
→ canonical/adopted Content decision
→ reviewed support / Connection owner
→ learner consumption
```

Hard rules:

- semantic similarity, keyword presence, cross-System symmetry or a pedagogically attractive relation is **not** enough to create a formal Boundary or Connection;
- a Source-explicit signal is an eligibility gate, not automatic adoption; if it is not yet adopted, classify it as `SOURCE_EXPLICIT_NOT_ADOPTED` and send it to the existing Content owner for review;
- if canonical/reviewed Content already adopted the support but the learner object / Website does not consume it, that is `ADOPTED_NOT_CONSUMED`, an implementation defect rather than new medical authoring;
- ordinary prose containing words such as “边界” does not become a formal support object unless the authoring/owner marks it as such;
- counts of Boundary, `//串联`, Precision, MedicalVisual or other support families across Systems are not maturity scores and must not drive mechanical normalization.

This constraint does not forbid Source-backed Knowledge reconstruction inside Core. It prevents Runtime, audit tooling or a later editor from inventing **formal** support/relationship truth that no Source/adopted owner established.

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

## 4｜First learning: Chat-led, Source-constrained, system-backed

First-pass learning may be **Chat-led**. Canonical Source and Knowledge assets define the accuracy, mandatory coverage, provenance and ownership boundary; they do **not** dictate the teaching order.

Surface roles:

### Source / Knowledge owners

They provide:

- the current System / Block / Logic Group / KP truth and ownership;
- Source provenance, figures, tables, examples and exact details;
- the coverage boundary that first-pass teaching must not silently omit;
- reviewed Precision / Visual / Connection / Extension when those support objects actually exist.

Source contact is evidence. If the corresponding Source has not been read or inspected, Chat must not claim full Source-level coverage.

### Chat

Primary adaptive teaching surface when Kian chooses Chat-led first learning.

Before teaching a Block, Chat should read the current Block Knowledge, relevant Learning owner and the Source boundary needed to know what must be covered. It may then reorganize teaching around the medical mechanism, causal problem and Kian's live questions rather than reciting KP order.

For each material Logic Group, Chat should normally:

```text
locate the LG inside the Block problem
→ establish the LG's local mechanism/framework
→ teach the continuous causal model
→ embed the owning KP exam points at the relevant mechanism node
→ resolve reasoning-changing questions immediately
→ compress to a retrievable scaffold
```

Hard rules:

- teaching may cross KP boundaries; coverage and durable ownership may not lose the owning KP;
- a receptor, pathway, threshold, number or exact distinction that changes understanding, judgment or inference is taught **now**, even if it also has a Precision/Memory role;
- precision facts that mainly require exact retention should still be encountered, understood in context and tied to their owning KP before later Memory review; a prior wrong answer is not required before they become reviewable;
- downstream drugs, diseases or other Blocks may be used as bounded interfaces, but their full teaching stays with the original responsible Block/System;
- Chat may add explanation, examples and clinically useful model knowledge, but must distinguish those from Source-backed formal Knowledge and may not invent formal Boundary/Connection truth;
- a learner question during first learning is not automatically a weakness or review debt.

### KianOS / Website

KianOS provides the canonical learner objects and the existing execution/evidence surfaces for:

- System / Block orientation and learner display;
- active Recall and question work;
- Memory / Precision / later review;
- Resume / Return and private learner evidence;
- actual attempt / Wrong / Uncertain / Recall recording.

The Website renders accepted owners, executes the accepted arrangement and records actual learner feedback. It does not independently invent a new learning strategy or upgrade teaching discussion into learner evidence.

### Original Lecture / MarginNote

The original Lecture remains an authoritative Source surface, but it is **not required to control first-pass teaching order**.

Kian may defer a broad Lecture sweep until the whole System has a usable model, then use it to calibrate figures/tables, exact numbers, special exceptions and omissions while also gaining a second exposure.

However, when current understanding genuinely depends on an original figure, table, spatial relation, waveform or other Source visual, inspect that Source during the current learning step rather than deferring it by rule. Lecture-attached TTSX remains attached to actual Source contact when that contact occurs.

---

## 5｜First-pass learner flow

The normal Chat-led flow is:

```text
optional Guide when genuinely useful
→ read current Block Knowledge + Learning boundary + needed Source scope
→ System / Block Framework
→ Logic Group teaching by mechanism, with KP ownership preserved
→ resolve understanding-changing detail in the moment
→ compress each LG / Block to a retrievable scaffold
→ at a natural breakpoint or Block teaching end:
   audit coverage against canonical KP + readable Source
   route exact Precision / Memory candidates to their owning assets
   preserve unresolved questions and explicit downstream interfaces
→ existing KP Prompt Recall / expanded check and Block mechanism reconstruction
   when actual learner work reaches those actions
→ Logic Group / Block closure only from the required learner evidence
→ release reusable Memory assets under the existing Memory rules
→ after the whole System has a usable model:
   System Recall + optional concentrated Lecture calibration + official System question sweep
→ smallest-sufficient Repair / exact Return
→ rolling Memory / Precision / later-pass reuse
```

This flow separates **teaching closure** from **learner evidence**. A Chat summary that says material was explained or understood does not itself create native KP Learned, Recall, Source-contact or Block Complete evidence.

### Guide

Small, skippable first-learning entrance. It explains why the System/Block is organized this way or which intuitive mistake to avoid.

Guide is not a recurring gate and must not become a second Lecture.

### System / Block Framework

Thin recurring model of the major mechanism, failure structure, judgment axes, boundaries and route.

Framework exists to orient cognition, not to become a prose course.

### KP Learn

KP Learn remains the canonical learner object for the KP. Chat may teach across several KPs or an entire Logic Group, but the resulting coverage, precision and later review routing must still resolve back to those existing KP owners.

The learner should not be forced to bounce between Chat and Website merely to prove that teaching occurred.

### KP Recall

Core-protected active retrieval after the owning material has actually been learned.

Learn and Recall remain the same KP learner object. Recall changes **Core visibility**, not the identity of the card or its surrounding workspace.

Before Reveal, the canonical KP Core stays hidden. The KP title, active Prompt, Source / Outline locators and Current-owned Context such as Precision / Visual / Connection may remain visible when useful. Reveal opens the same canonical Core; it does not switch to a second answer card.

KP Prompt Recall, expanded comparison/check and Block-level mechanism reconstruction remain valid retrieval jobs. Their recorded evidence comes from actual Recall interaction, not from Chat having taught the content.

This protection rule is specific to KP Recall. Block/System Recall may still use stricter neutral-front protection where their accepted reconstruction contract requires it.

### Logic Group closure

A lightweight state inside the persistent Logic Map, not a standalone learner stage.

When all KPs in the Logic Group have the required real Recall evidence, the map marks that group closed and the learner proceeds directly to the next Logic Group. The existing `goal / closure` text remains the local model target; no extra confirmation page, rating or click is required.

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

Keep these states distinct:

```text
Chat taught / covered
≠ Kian reports understanding
≠ actual Recall correct
≠ later stable retrieval / application
≠ long-term mastery
```

A teaching summary may preserve useful interpretation and unresolved work, but it must not manufacture native learner evidence.

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

- Core Memory from canonical KPs, including mechanism content worth later reconstruction;
- current-owner Precision items;
- learner-marked Prompt/Core fragments.

A Precision/Core item does **not** need a prior Wrong/Uncertain event to be eligible for Memory. If it is an accepted asset, Kian has encountered it in its owning learning context, and the existing Memory routing admits it, it may become available for later review.

Release means **available**, not automatically due today. Availability, scheduling priority and today's due set remain different decisions.

Weakness is normally an evidence/priority state over an existing asset, not a duplicate card corpus. Wrong answers may raise priority or trigger Repair, but they are not the only doorway into Memory.

Repair remains a bounded active task queue, not a second Memory library.

Kian may keep private learner state such as:

- personal Prompt override;
- anchored fragment marking/highlighting; the mark is reversible learner state: reselecting the same anchored fragment and choosing the same mark kind again removes that mark, without changing canonical Core or other mark kinds;
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

For actual learner continuation or progress questions, read native learner evidence, the subject Packet or Resume first. Missing evidence remains UNKNOWN; engineering Current never substitutes for learner progress.

For learning-model interpretation, read only as needed:

```text
this LEARNING_CONTRACT.md
→ study-policy.json when machine execution detail matters
→ exact System-specific Learning owner when local Source/LG differences matter
→ Visual / Engineering owners only for implementation
```

Read `content/xizong/CURRENT.md` only for engineering intent or engineering-status questions.

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


## 15｜2026-10-01 adopted content-generation refinement

This section refines content production for the explicitly opened tasks [#1133](https://github.com/kianwang022-hash/kianos/issues/1133), [#1134](https://github.com/kianwang022-hash/kianos/issues/1134), and [#1135](https://github.com/kianwang022-hash/kianos/issues/1135). It creates no new Knowledge hierarchy, Runtime or learner evidence.

### Two content deliverables, one Knowledge basis

- **Chat teaching asset:** first explain the Block's logical position in its System, prerequisites, central problem and LG handoffs. Teach by the accepted LG sequence; introduce each LG's position, local problem and framework before layered causal teaching. Embed full mandatory KP knowledge, reasoning-changing conditions, counterexamples and clinical intuition at the right nodes. Close understanding gaps and identify precision and downstream interfaces. Chat may adapt language and order inside that scope; the file is not a rigid recital script.
- **Review text-frame asset:** a continuous complete Block mother framework, independent logical mini-models, and original KP names/prompts. It is retrievable directly in Chat; website production is currently out of scope. Compression removes repetition, not the causal steps, conditions, branches or mandatory knowledge needed to read through and reconstruct the model.

The review middle region may contain comparison, failure simulation, reverse localization, cross-node reasoning and necessary extension. It is not a migrated lecture paragraph column and is not restricted to explaining a single left-side arrow. The right region displays canonical KP identity/name and the current original Prompt only; supplementary questions remain explicitly separate. Full precision/reference content has an actual owning location elsewhere in the asset, not merely a coverage claim inferred from a link.

### Prompt and precision

For the admitted A1/A2 authoring review, use compact count-and-category retrieval slots such as `3机制｜2作用`, separated by `｜`, not expanded explanation sentences, a list of interrogative questions or an answer-bearing Core summary. Existing mature examples include `时长2｜干扰2｜容量2｜代表脑区各1｜重复→转化` and `结构5段｜受力→移位｜危险2类｜复位/固定｜功能3层`. Every count must be checked against the full owning Core; do not invent counts, omit decisive conditions or collapse independent classification axes. Preserve valid existing retrieval meaning; do not mechanically replace punctuation or invent formal Boundary/Connection support. New review assets must consume the latest accepted canonical Prompt, not a stale copied version.

KP remains the smallest review ownership unit in these deliverables. A KP's mechanisms may appear at several appropriate model positions without splitting its canonical identity. Precision may use concise tables, receptor/channel matrices, drug target → variable → effect chains, decision trees, timelines and accurate programmatic curves/diagrams where useful. Facts that change current reasoning belong in current teaching even if they also require exact memory.

### Preparation, integration and validation are distinct

Assets may be prepared and source-validated before learner use. This never means the learner has studied or mastered them. Learner-facing integration grows through local teaching models → Block → related-Block cluster → System → cross-System synthesis. Cluster/compression views are not new canonical owners. Unlearned downstream material remains an explicit bounded interface rather than a claimed mature learner model.

Track model scope/integration level separately from validation status and actual learner evidence. Before claiming validation, check canonical/LG/KP coverage, readable Source and necessary visuals, causal direction, parallel processes, feedback, experimental versus in-vivo meaning, decisive exceptions and relevant cross-Block interfaces. Missing evidence blocks only its dependent claim; a known scoped uncertainty need not invalidate unrelated verified content. A stable framework must be corrected when wrong, but adding detail or an interface does not justify gratuitous wholesale reorganization.

A complete-review or Lecture-replacement claim requires actual mandatory-content accounting, not merely all KP IDs being present. Source/PDF or visual material not inspected remains explicitly unverified.
