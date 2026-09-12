# Xizong Learning Contract

Status: CURRENT  
Role: Xizong lane-level learning constitution  
Parent standards: root `LEARNING_ASSET_STANDARD.md`, `LEARNING_ACCEPTANCE.md`, `SYSTEM_CONTRACT.md`

This file owns the **stable lane-level cognition and learning architecture of Xizong**.

It answers:

> **How should Kian form, retrieve, apply, repair, compress, and later stabilize a very large medical knowledge system?**

It does not own medical facts, source provenance, System-specific teaching detail, exact runtime fields, Acceptance Truth, or Kian's private learner progress.

---

## 1｜Purpose and target capability

Xizong exists to turn a very large medical syllabus into a **lossless but progressively compressed, mechanism-centered, retrievable and applicable knowledge system** for the 306 exam.

The lane is not optimized for:

- reading every repository field;
- turning KianOS into a second long lecture;
- maximizing KP count, page count, question count, or review debt;
- memorizing isolated facts before their owning model exists;
- using engineering completion as evidence that Kian has learned anything.

The target capability develops across repeated passes:

```text
understand the medical model
→ actively reconstruct it
→ locate and repair real gaps
→ apply it in questions / cases
→ stabilize high-value precision
→ compress the model without losing decisive information
```

Attention, continuity and compression are therefore design constraints, not UI decoration.

---

## 2｜Authority and ownership

Xizong keeps one owner per responsibility.

### Medical / Knowledge Truth

Canonical medical content belongs to the Current medical Core under:

- `content/xizong/knowledge/systems/**`
- the lane owner map in `content/xizong/knowledge/manifest.json`
- reviewed official question / explanation / relation owners in their dedicated Xizong roots.

Neither this contract nor learner runtime may silently rewrite medical Core.

### Lane learning constitution

This `LEARNING_CONTRACT.md` owns the stable Xizong learning model:

- what the natural learner units are;
- how first learning, Recall, questions, Repair, later review and transfer relate;
- what KianOS should and should not do beside the Lecture;
- where shared rules end and System-specific guidance begins.

### Detailed shared execution policy

`content/xizong/knowledge/learner/study-policy.json` owns the **detailed machine-readable shared policy** inside this constitution, including stage responsibilities, mastery/precision fields, exact first-pass gates, content timing, memory admission, question reuse, compression and lossless scheduling.

It is not a second lane constitution. Constitutional decisions live here; executable policy detail lives there. If the two ever appear to disagree, fail closed and reconcile the owners rather than guessing.

### System-specific learning support

System-specific `*-learning.json` / selective cue assets under `content/xizong/knowledge/learner/` may define the learner order, Logic Group goals, closure cues, Recall skeletons and selective timing guidance for that System.

They may reorganize **when/how** Current medical objects are learned. They may not change **what** the medical objects mean.

### Projection / Runtime

Xizong learner surfaces under `static-web/` execute approved semantics. Runtime may preserve private learner interaction evidence, but it is not a medical or learning-semantic owner.

### Acceptance and learner truth

- Xizong readiness claims → `content/xizong/ACCEPTANCE.md` or a narrower justified future Acceptance owner.
- Kian's actual learning / attempts / Wrong-Uncertain / notes / review state → private learner/browser/conversation state only.

```text
Artifact Truth ≠ Acceptance Truth ≠ Learner Truth ≠ Work Cursor
```

---

## 3｜Natural learning units

Xizong uses several different granularities because they solve different cognitive problems.

```text
System
→ Block
→ Logic Group
→ KP
```

### System

The System is the large causal model and the natural scope for integration, full question coverage and later cross-Block reconstruction.

### Block

The Block is the main continuous first-learning unit. It should feel like one coherent medical problem, not an arbitrary folder or a pile of KPs.

### Logic Group

A Logic Group is a continuity / closure unit inside a Block. It groups the KPs that must be understood together to answer one local causal question.

It exists to protect coherent learning from excessive fragmentation.

### KP

A KP is a **stable canonical knowledge identity**, not automatically the learner-facing interaction unit and not necessarily the learner order.

Stable KP identity may remain fixed while learner order follows causal understanding. A System-specific learning owner may therefore reorder KPs without renumbering or redefining them.

Hard rule:

> **Canonical identity ≠ learner order ≠ page order ≠ question taxonomy.**

---

## 4｜First learning: Lecture-first, KianOS-guided

The Lecture remains the first-pass teaching material: its explanation sequence, figures/tables, examples, source context and attached teaching value must not be replaced by a second KianOS textbook.

### First-pass surface ownership

For Kian's Current Xizong workflow, **continuous first-pass Lecture consumption is external-primary on iPad / MarginNote using the original Lecture/source material**. This is a Learning decision, not a Runtime convenience.

Surface roles are therefore:

- **iPad / MarginNote — primary Lecture surface:** continuous original-source reading, figures/tables, annotation, source-local examples and Lecture-attached questions;
- **KianOS — primary orientation / retrieval / compression surface:** System and Block orientation, current causal target, attention boundary, selective visual/precision cues, active Recall, Logic Group closure, Block/System compression, Wrong/Uncertain routing and later review;
- **Chat — adaptive companion / repair surface:** explanation when the current model is unclear, mechanism linking, smallest-sufficient repair, personalized clarification and cross-System reasoning when needed.

Hard rules:

- KianOS must not silently become a second primary Lecture reader merely because it can render source text or KP detail.
- A normal first-pass handoff is **KianOS orientation/cue → original Lecture in MarginNote → return to KianOS for retrieval/closure**. Projection/Runtime should make this handoff low-friction rather than duplicate the Lecture.
- Lecture-attached companion questions stay on the original Lecture/MarginNote surface and are completed there; KianOS only needs durable evidence when they create a meaningful Wrong / Uncertain / repair need.
- The later official System question sweep is a different learning action from Lecture-attached questions and belongs after the System model and pre-question System Recall exist.
- If the user's primary original-source reader/device changes in the future, that is an L-level surface-ownership change. P/Runtime must not infer a replacement from whatever component already exists.

KianOS adds what the Lecture alone does not reliably provide at scale:

- System / Block orientation;
- the current causal question and attention boundary;
- explicit stop-lines so future material does not invade the current owner;
- Logic Group continuity;
- active retrieval after learning;
- compression from KP → Block → System;
- routing of Wrong / Uncertain evidence back to the smallest responsible owner;
- later review and transfer organization.

The abstract first-pass chain is:

```text
System orientation
→ Block / Logic Group continuous learning with full required Lecture contact
→ active KP retrieval inside the learned model
→ Logic Group closure
→ Block Recall
→ after the System has actually been learned: System Recall
→ official System question sweep
→ Wrong / Uncertain smallest sufficient repair
→ short post-question System reconstruction
```

Exact executable gates and timing remain in `study-policy.json` and System-specific learning owners; this contract intentionally does not duplicate them.

Crucial learner-state rule:

> **A runtime capability or accepted module never authorizes a Recall step that Kian has not actually reached in learning.**

---

## 5｜Questions, Repair and return to the mainline

Official questions are reusable learning evidence, not a separate curriculum and not the owner of learning order.

During first learning, they primarily expose coverage gaps after the relevant System model exists. Later passes may reuse the same questions for discrimination, decisive conditions, distractors, condition changes, cases, speed and cross-System transfer.

Stable correct work should pass quickly.

For Wrong / Uncertain evidence:

```text
question evidence
→ locate first meaningful failure
→ repair the smallest sufficient medical / boundary / precision object
→ reconstruct when needed
→ return to the interrupted System path
```

Do not reopen a whole Block when one boundary failed. Do not invent Question→KP links from model intuition, title similarity or proximity; precise routing requires reviewed authority.

Protected full-paper / unseen material remains diagnostic capital and must not be consumed merely because runtime can display it.

---

## 6｜Memory, review, later passes and transfer

First exposure does not automatically create future review debt.

Memory / review admission is selective. It should be driven by meaningful evidence such as unstable formally learned Core, high-value Precision, Recall weakness, Wrong / Uncertain evidence, or explicit learner need.

Later learning should become **thinner, not longer**:

```text
first pass: build the full model
second pass: discrimination + precision + application + cases
late review: compressed causal skeleton + high-value boundaries / precision + real weak points
```

Successful later fresh application is stronger evidence than repeatedly proving a memorized item. New contradictory evidence may reopen only the smallest affected object.

The goal is not permanent proof of every KP. The goal is a compact model that still supports correct retrieval and application under exam conditions.

---

## 7｜Sub-lane qualification

A Xizong System may receive its own durable `CURRENT.md`, local contract or scoped Acceptance owner **only when independent continuation actually justifies it**.

Create a first-class System sub-lane when all are true:

- workers routinely enter/continue it independently of the lane's active System;
- it owns a distinct Work Cursor or acceptance boundary;
- its normal re-entry can be bounded locally;
- the new owner removes ambiguity rather than copying parent state.

Do not create one file set per System merely for symmetry.

System / Block / KP hierarchy is a medical/learning structure; it does not automatically imply a governance hierarchy.

---

## 8｜Engineering readiness vs Kian's real learning

Xizong follows root S/K/L/P/R/E/U acceptance.

A System may be:

> **Module ready for learner test**

when S–E are accepted for the named scope.

That statement still proves nothing about whether Kian has studied the System, performed its Recall, attempted its questions, or validated its learner paths.

Only Kian's real use can create U evidence, and U remains path-scoped.

Do not manufacture learner progress from:

- canonical content existing;
- a Learning route existing;
- Runtime supporting Recall;
- official questions being mapped;
- CI/build passing;
- S–E acceptance.

---

## 9｜Fresh-Chat rule

For ordinary known Xizong work, do not load the whole lane constitution as ritual.

Normal continuation is:

```text
Xizong CURRENT
→ Xizong ACCEPTANCE
→ exact System / Block / Artifact owner named by the Work Cursor
→ work
```

Read this `LEARNING_CONTRACT.md` when the question is about Xizong cognition, learner order, phase linkage, unit boundaries or learning-rule design.

Read `study-policy.json` only when the task needs its detailed shared execution policy. Read a System-specific learning asset only when that System's learning order / closure is material.

Normal Current work must not require retired continuation files, prior Chats, migration history, legacy repositories or broad repository archaeology.

---

## 10｜Change rule

This contract should change only when real evidence shows that the **Xizong learning model itself** is wrong or incomplete.

A single content defect, runtime bug, bad mapping, UI friction or question error should be repaired at its actual owner unless it demonstrates a lane-level cognition failure.

The durable direction is:

> **medical truth first → causal learning continuity → active reconstruction → evidence-driven repair → progressively thinner mastery.**