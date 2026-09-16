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
- maximizing KP count, page count, question count, Visual count or review debt;
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
- how first learning, Recall, Lecture-attached TTSX, official questions, Repair, later review and transfer relate;
- what KianOS should and should not do beside the Lecture;
- where shared rules end and System-specific guidance begins.

### Detailed shared execution policy

`content/xizong/knowledge/learner/study-policy.json` owns the **detailed machine-readable shared policy** inside this constitution, including stage responsibilities, mastery/precision fields, exact first-pass gates, content timing, memory admission, TTSX checkpoint behavior, question reuse, compression and lossless scheduling.

It is not a second lane constitution. Constitutional decisions live here; executable policy detail lives there. If the two ever appear to disagree, fail closed and reconcile the owners rather than guessing.

### System-specific learning support

System-specific `*-learning.json` / selective cue assets under `content/xizong/knowledge/learner/` may define the learner order, Logic Group goals, closure cues, Recall skeletons, Source-contact granularity and selective timing guidance for that System.

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

The Block is the main coherent first-learning problem. It should feel like one medical model, not an arbitrary folder or a pile of KPs.

### Logic Group

A Logic Group is a **retrieval / local-closure unit** inside a Block. It groups the KPs that must be understood together to answer one local causal question.

A Logic Group is **not automatically a Lecture Source-contact unit**. One continuous Lecture contact may cover one LG, several LGs, or a natural source subsection that crosses an internal LG boundary when the accepted System-specific Learning owner says this preserves continuity better.

### KP

A KP is a **stable canonical knowledge identity**, not automatically the learner-facing interaction unit and not necessarily the learner order.

Stable KP identity may remain fixed while learner order follows causal understanding. A System-specific learning owner may therefore reorder KPs without renumbering or redefining them.

### Source-contact segment / natural Lecture subsection

A Source-contact segment is an **execution unit for continuous original-Lecture learning**, not a fifth canonical knowledge hierarchy.

It exists only to answer:

> **From where to where should Kian read continuously before the next useful return / checkpoint?**

Its boundary may be determined by a natural Lecture subsection, accepted whole-LG contact, accepted whole-Block contact, or another explicitly reviewed System-specific learning decision. Projection / Runtime must consume this decision; it must not force `Source-contact segment = Logic Group` for implementation convenience.

Hard rule:

> **Canonical identity ≠ learner order ≠ Logic Group ≠ Source-contact segment ≠ page order ≠ question taxonomy.**

---

## 4｜First learning: Lecture-first, KianOS-guided

The Lecture remains the first-pass teaching material: its explanation sequence, figures/tables, examples, source context, attached questions and question-side expansions must not be replaced by a second KianOS textbook.

### First-pass surface ownership

For Kian's Current Xizong workflow, **continuous first-pass Lecture consumption is external-primary on iPad / MarginNote using the original Lecture/source material**. This is a Learning decision, not a Runtime convenience.

Surface roles are therefore:

- **iPad / MarginNote — primary Lecture surface:** continuous original-source reading, figures/tables, annotation, source-local examples, Lecture-attached TTSX, answer/options, question-side explanation and expansions;
- **KianOS — primary orientation / attention / retrieval / compression surface:** System and Block orientation, current causal target, attention allocation, Source-contact / boundary guidance, selective Visual/Precision support, TTSX release checkpoint, active Recall, Logic Group closure, Block/System compression, Wrong/Uncertain routing and later review;
- **Chat — adaptive companion / repair surface:** explanation when the current model is unclear, mechanism linking, smallest-sufficient repair, personalized clarification, cross-System reasoning and later review of learner-selected notes / expansions when useful.

Hard rules:

- KianOS must not silently become a second primary Lecture reader merely because it can render source text or KP detail.
- A normal first-pass path is **KianOS orientation / attention cue → continuous original Lecture in MarginNote → optional KianOS checkpoint at a real Source boundary → retrieval / closure at the accepted return point**.
- The accepted System-specific Learning owner controls Source-contact granularity. Runtime must not impose a per-LG source trip when the accepted route uses a larger natural Source unit.
- Lecture-attached TTSX stay on the original Lecture/MarginNote surface and are completed there, including answer checking, all options and question-side expansions.
- KianOS may surface the **TTSX checkpoint** when a reviewed natural subsection boundary is reached: show that the real bound questions are now due, allow a low-friction completion confirmation, and optionally let Kian select particular questions worth retaining and leave a short note / reason.
- The TTSX checkpoint does **not** require Kian to re-answer the questions in KianOS and does not automatically create a full Question Attempt. It records only the minimal checkpoint / learner-selected evidence justified by the interaction.
- A learner-selected TTSX note may later route to Wrong / Uncertain repair, Memory / Precision, Connection, Chat debrief or a reviewed canonical candidate; it is not automatically medical truth or mastery evidence.
- The later official System question sweep is a different learning action from Lecture-attached TTSX and belongs after the System model and pre-question System Recall exist.
- If the user's primary original-source reader/device changes in the future, that is an L-level surface-ownership change. P/Runtime must not infer a replacement from whatever component already exists.

KianOS adds what the Lecture alone does not reliably provide at scale:

- System / Block orientation;
- the current causal question and attention boundary;
- explicit stop-lines so future material does not invade the current owner;
- Source-contact / return guidance without unnecessary device bouncing;
- TTSX boundary/release bookkeeping without duplicating the Lecture question surface;
- Logic Group continuity and active retrieval after learning;
- compression from KP → Block → System;
- routing of learner-selected TTSX notes and Wrong / Uncertain evidence back to the smallest responsible owner;
- later review and transfer organization.

The abstract first-pass chain is:

```text
System / Block orientation
→ continuous original-Lecture Source contact at accepted granularity
→ when a real natural subsection closes: TTSX checkpoint if a reviewed binding exists
     ├─ questions are completed in Lecture / MarginNote
     ├─ read answer + all options + question-side expansions
     └─ KianOS optionally records selected question / note / W-U evidence
→ continue Source contact or return at the accepted retrieval point
→ active KP retrieval inside the learned model
→ Logic Group closure
→ Block Recall
→ Block Complete
→ after the System has actually been learned: System Recall
→ official System question sweep in KianOS
→ Wrong / Uncertain smallest sufficient repair
→ short post-question System reconstruction
```

A Source boundary may occur before the final LG closure, and an LG closure may occur without a new Source re-entry. Boundary controls and retrieval controls therefore must remain separate in Runtime.

Exact executable gates and timing remain in `study-policy.json` and System-specific learning owners; this contract intentionally does not duplicate their local details.

Crucial learner-state rule:

> **A runtime capability or accepted module never authorizes a Recall step that Kian has not actually reached in learning.**

---

## 5｜Questions, TTSX, Repair and return to the mainline

Xizong has two different first-pass question actions and they must not be collapsed.

### Lecture-attached TTSX / local probe

TTSX belongs to the Lecture learning flow.

```text
Boundary decides WHEN
reviewed Binding decides WHICH
```

- no real binding → no invented question release;
- questions are answered and expanded in the original Lecture / MarginNote surface;
- KianOS records only a low-friction checkpoint and optional learner-selected evidence / notes;
- a correct TTSX with no useful delta may leave no durable question-level debt;
- question-side expansion may remain source-local, become a personal note, enter Memory / Precision / Connection, or become a canonical candidate only after the appropriate review.

### Official Question Runtime

Official questions are reusable learning evidence, not a separate curriculum and not the owner of learning order.

During first learning, the official System sweep exposes coverage gaps only after the relevant System model exists. Later passes may reuse the same questions for discrimination, decisive conditions, distractors, condition changes, cases, speed and cross-System transfer.

Official KianOS question attempts are append-preserved evidence. Lecture-attached TTSX checkpoints are not silently promoted into the same attempt semantics merely because they may reference the same stable question identity.

Stable correct official-question work should pass quickly.

### Evidence interpretation discipline

A Recall rating, TTSX note, Wrong / Uncertain result, or correct answer is an **observation under the current task and conditions**, not an automatic diagnosis of the cause and not a blanket mastery claim.

- Wrong / Uncertain / fuzzy evidence may justify Memory or repair attention, but does not by itself mean the underlying medical model is missing or authorize reopening a whole KP / Block.
- A learner-selected question-side expansion is attention evidence first; it does not automatically become canonical Core.
- Diagnose only when plausible causes would lead to materially different next actions; when diagnosis matters, use the smallest discriminating check that can change the repair.
- Repair should target the smallest sufficient failed object and then return to the interrupted mainline.
- Repair evidence does not erase the original observation and does not by itself prove later Recall, application, transfer or stable mastery.

Detailed executable evidence fields and next-action policy remain in `study-policy.json`; this contract owns only the stable interpretation rule above.

For Wrong / Uncertain evidence:

```text
question / Recall / selected TTSX evidence
→ locate first meaningful failure
→ repair the smallest sufficient medical / boundary / precision object
→ reconstruct when needed
→ return to the interrupted System path
```

Do not reopen a whole Block when one boundary failed. Do not invent Question→KP links from model intuition, title similarity or proximity; precise routing requires reviewed authority.

Protected full-paper / unseen material remains diagnostic capital and must not be consumed merely because runtime can display it.

---

## 6｜Attention, Memory, later passes and transfer

First exposure does not automatically create future review debt.

The learner-facing workspace should separate the **primary cognitive path** from **attention allocation**.

KianOS may know many backend semantics, but the learner-facing attention projection should answer only questions such as:

- what must be carried away this round;
- what support is useful only if needed now;
- what precise / low-coupling material may be deferred without blocking the mainline;
- what future connection should be noticed now but learned later.

Attention projection is not a second curriculum and not a workflow-state dump. Backend labels such as `MI-G`, `MI-D`, `CURRENT_CORE`, `RESERVE_LEARNING`, `CONNECTION_HOOK`, `DEFERRED`, Projection roles or geometry should normally be translated into natural learner-facing actions rather than exposed as engineering metadata.

Memory / review admission is selective. It should be driven by meaningful evidence such as unstable formally learned Core, high-value Precision, Recall weakness, Wrong / Uncertain evidence, learner-selected useful TTSX expansion, or explicit learner need.

Later learning should become **thinner, not longer**:

```text
first pass: build the full model
second pass: discrimination + precision + application + cases
late review: compressed causal skeleton + high-value boundaries / precision + real weak points
```

Successful later fresh application is stronger evidence than repeatedly proving a memorized item. New contradictory evidence may reopen only the smallest affected object.

The goal is not permanent proof of every KP. The goal is a compact model that still supports correct retrieval and application under exam conditions.

---

## 7｜Visual / Extension relationship to learning

Visual is a **conditional support inside the same learning chain**, not an independent learning program.

A Visual Gate means the current medical relationship genuinely depends on seeing a source figure / image / curve / spatial arrangement and that the owning object plus source location are known. It does not by itself require a copied web asset.

The generic Extension layer may persist a high-value source visual, structured table or reviewed summary when that materially improves repeated learning or recall. Extension coverage is deliberately sparse and may remain incomplete by design.

Hard rules:

- Source Visual Truth remains in the original Lecture / PDF / reviewed source;
- Visual Gate ≠ screenshot backlog ≠ completion requirement;
- missing Extension asset ≠ learner failure or unfinished Block;
- existing Extension assets may be replaced under the same stable learner-role slot when a better reviewed asset appears;
- future Visual/Extension work should normally be driven by real learning value / friction, not by system-wide coverage symmetry.

---

## 8｜Sub-lane qualification

A Xizong System may receive its own durable `CURRENT.md`, local contract or scoped Acceptance owner **only when independent continuation actually justifies it**.

Create a first-class System sub-lane when all are true:

- workers routinely enter/continue it independently of the lane's active System;
- it owns a distinct Work Cursor or acceptance boundary;
- its normal re-entry can be bounded locally;
- the new owner removes ambiguity rather than copying parent state.

Do not create one file set per System merely for symmetry.

System / Block / KP hierarchy is a medical/learning structure; it does not automatically imply a governance hierarchy.

---

## 9｜Engineering readiness vs Kian's real learning

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

## 10｜Fresh-Chat rule

For ordinary known Xizong work, do not load the whole lane constitution as ritual.

Normal continuation is:

```text
Xizong CURRENT
→ task-class router
→ exact Current owner(s)
→ work
```

Read this `LEARNING_CONTRACT.md` when the question is about Xizong cognition, learner order, phase linkage, Source-contact / Logic-Group boundaries, TTSX role, attention allocation or learning-rule design.

Read `study-policy.json` only when the task needs its detailed shared execution policy. Read a System-specific learning asset only when that System's learner order / closure / Source-contact policy is material.

Product / display work should also read `static-web/XIZONG_PRODUCT_STATUS.md`; Visual / Precision / Extension work should read its current capability / Extension contract. Historical Frozen files may provide provenance but must not overrule these Current owners.

Normal Current work must not require prior Chats, migration history, legacy repositories or broad repository archaeology.

---

## 11｜Change rule

This contract should change only when real evidence shows that the **Xizong learning model itself** is wrong or incomplete.

A single content defect, runtime bug, bad mapping, UI friction or question error should be repaired at its actual owner unless it demonstrates a lane-level cognition failure.

The durable direction is:

> **medical truth first → causal learning continuity → source-faithful study → selective checkpoint/evidence → active reconstruction → evidence-driven repair → progressively thinner mastery.**
