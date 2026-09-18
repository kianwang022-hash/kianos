# Xizong System Completion — accepted surface design

Status: **CURRENT CANDIDATE — PRODUCT COMPOSITION FROZEN 2026-09-18 · IMPLEMENTATION / HUMAN GATE ACTIVE**  
Parent: `static-web/XIZONG_PRODUCT_BRIEF.md`  
Review safety: `static-web/XIZONG_UI_REVIEW_PROTOCOL.md`

This file records accepted learner-facing System Completion product decisions only. It does not change medical Content, Question Truth, Runtime, Evidence, holdout semantics, Repair/Return contracts, or existing S/K/L/P/R/E/U claims.

## 1｜Learner-facing completion path

The System-level learner path is kept simple:

```text
System learned
→ System Recall
→ System Questions
→ concentrated Wrong / Marked review
→ post-question System Recall
```

Whole-paper holdout remains a small question-entry setting rather than a peer learner stage.

Final composition is now frozen as **one phase-aware System Completion workbench**. System Recall, official System questions, W/U review and later question rounds are states of the same workbench; they are not separate product pages.

Keep the existing hard prerequisites and Evidence semantics:

- System Recall is not available until the whole System's Blocks are actually complete;
- holdout years remain private browser-local strategy and are excluded wholesale from ordinary System sweep;
- stable/correct work stays cheap;
- Wrong and learner-marked items are retained for later review when correctness is being revealed;
- precise Block/KP repair uses reviewed repository relations only; missing relations remain missing;
- post-question System Recall remains distinguishishable from pre-question System Recall.

## 2｜Official Question Sweep is a high-throughput workbench — ACCEPTED

The sweep must optimize for the real case where Kian may know many questions and answer them very quickly.

Hard principle:

> **A known question should cost approximately one answer action. Only a wrong or deliberately marked question should demand more attention.**

The question surface is therefore a stable Mac-wide workbench rather than a sequence of success cards / modal confirmations / repeated next-question buttons.

## 3｜Keyboard grammar — ACCEPTED

### Normal mode

```text
1–5   select A–E
Enter submit / continue
M     mark / unmark
← →   previous / next question
```

### Fast Sweep mode

Fast Sweep is a lightweight persistent preference, not a different page.

For single-choice questions:

```text
1–5 = choose + submit immediately
```

Therefore a run of known questions may behave like:

```text
3 → next
1 → next
4 → next
2 → next
```

For question types where one answer key cannot safely imply complete submission (e.g. multiple-choice / multi-select), the surface automatically fails safe to:

```text
1–5 = toggle options
Enter = submit
```

The learner should not have to manually change modes for question type safety.

Fast Sweep may be remembered as a user preference across System question sessions.

## 4｜Result visibility is independent from answer speed — ACCEPTED

`Fast Sweep` controls **how quickly answers are entered**. It must not decide whether correctness is revealed.

The question workbench therefore has an independent learner-facing result-visibility state.

### Immediate-feedback mode

Use when Kian wants system-by-system coverage practice with live correction.

```text
answer
→ reveal correctness
→ correct: near-zero-cost progression
→ wrong: Quick Review
```

### Hidden-result mode

Use when Kian wants to preserve whole-paper / exam-like integrity.

**Opening a whole paper should default to Hidden results.**

In this mode:

```text
answer
→ record learner choice
→ do NOT show correct / wrong
→ do NOT show correct answer
→ do NOT show explanation / repair
→ advance according to the chosen speed mode
```

A selected answer before reveal means only `my answer`, never correctness.

Fast Sweep can therefore coexist with Hidden results:

```text
whole paper + Hidden results + Fast Sweep
→ single-choice: 1–5 records answer and moves on
→ multi-select: 1–5 toggles; Enter records and moves on
→ no correctness feedback during the run
```

`M` remains available and independent from correctness visibility.

### Learner-controlled reveal

Hidden-result mode must not trap the learner. Kian may deliberately choose to inspect correctness when he wants.

The UI should provide a quiet result control such as:

```text
结果：隐藏 / 即时
```

and/or a current-question reveal action after an answer has been recorded.

Revealing a question may show the same Current correctness / Quick Review used by immediate-feedback mode. Do not require a modal confirmation ritual merely to reveal an answer.

When an intact whole-paper simulation is the current goal, the normal path remains:

```text
complete paper with results hidden
→ submit / end paper
→ then review correctness and retained marks
```

The exact private evidence metadata for `revealed during paper` vs `revealed after paper` may be decided during Runtime/Evidence compatibility review; learner-facing design must not silently claim an unrevealed paper remained pristine after its answers were intentionally exposed.

## 5｜Marking — ACCEPTED

`M` is the learner's explicit low-friction signal that a question is worth returning to later.

It may be applied:

- before choosing an answer;
- after choosing but before submitting;
- after seeing the result when results are visible;
- after navigating back to an earlier question.

Marking is orthogonal to correctness and must not block automatic progression.

When correctness is visible, accepted learner-visible states include:

```text
correct + unmarked
correct + marked
wrong + unmarked
wrong + marked
```

When results are hidden, only learner-owned state should be visible:

```text
answered / unanswered
marked / unmarked
current
```

Do **not** ask a separate post-correctness question such as `稳吗？ / 确定吗？ / Uncertain?` on every correct item.

Correctness plus learner marking provides the low-friction task signal. Internal evidence implementation may preserve compatible existing state as needed, but learner-facing interaction must not require an extra metacognitive confirmation after ordinary correct answers.

## 6｜Correct answer path — ACCEPTED

This applies when correctness is being revealed.

For a correct unmarked answer:

```text
submit
→ minimal transient success feedback
→ automatic next question
```

No extra `next`, `stable`, or `uncertain` decision is required.

For a correct marked answer:

```text
submit
→ retain Marked state
→ automatic next question
```

Do not force explanation reading on stable correct work.

In Hidden-result mode, the learner is not told that an answer is correct at this stage; the surface simply records the answer and proceeds.

## 7｜Wrong answer path / Quick Review — ACCEPTED

This applies when correctness is being revealed.

A Wrong result is saved automatically.

The default Wrong path is a short **Quick Review**, not a mandatory deep repair session.

First view should foreground only the smallest useful Current explanation:

```text
learner answer
correct answer
+ decision axis when available
+ why / correct-option reason when available
```

Accepted interaction:

```text
Enter  continue to next question
Space  expand / collapse deeper Current explanation
M      mark / unmark for later concentrated review
```

When expanded, additional Current explanation may include:

- common failure node;
- transfer rule;
- reviewed relation / location when explicitly owned.

Do not invent missing explanation or mapping.

Hard rule:

> **Wrong evidence does not automatically become a mandatory future task.**

A learner may recognize the error immediately in Quick Review and continue. Wrong remains evidence; Mark is the explicit learner signal that the item is worth returning to deliberately.

In Hidden-result mode, Wrong is not learner-visible during the run because correctness has not yet been revealed.

## 8｜Concentrated Wrong / Marked review — ACCEPTED

After or during an immediate-feedback sweep, or after a hidden-result paper is submitted/revealed, provide a low-friction review workspace over the retained states.

Useful filters after correctness is available:

```text
All retained
Wrong
Marked
Wrong + Marked
```

A selected item may show:

```text
original question
learner answer + correct answer
Current explanation layers
learner Mark state
Chat / deeper repair entry only when needed
```

This workspace is where the learner may slow down. The primary sweep should remain fast.

### Chat / deeper repair boundary

Wrong does not automatically trigger Chat.

Use Chat when the learner actually needs deeper explanation or targeted repair.

When Current has an explicitly reviewed Question→Block/KP relation, the repair path may use it. If no reviewed relation exists, keep the repair question-scoped and do not infer a Block/KP owner.

Existing Repair Inbox / Evidence / Return semantics remain unchanged unless separately reviewed.

## 9｜Mac-wide visual responsibilities — ACCEPTED DIRECTION

The question workbench should feel information-rich rather than empty, while avoiding card piles and noisy chrome.

Prefer a stable spatial composition such as:

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ System · Questions   progress   Fast Sweep   Result visibility   review state│
├───────────────────┬──────────────────────────────────────────────────────────┤
│ Question Map      │ Current Question                                         │
│ compact state map │ question meta + fixed Mark control                       │
│ current / done /  │ stem                                                     │
│ wrong / marked    │ options                                                  │
│ or answered/mark  │ stable answer zone                                       │
└───────────────────┴──────────────────────────────────────────────────────────┘
```

Question Map semantics depend on result visibility:

- immediate-feedback mode may show current / done / wrong / marked;
- hidden-result mode must show only current / answered / unanswered / marked and must not leak correctness through color, icon, ordering, count or filter.

For Wrong Quick Review, Mac width may introduce a temporary contextual review region without destroying the stable question geometry.

UI goals:

- no giant blank success screen;
- no vertical layout jump after ordinary correct answers;
- fixed positions for answer keys / Mark / progress where practical;
- use typography, alignment, thin rules, compact maps and state marks instead of giant cards / excessive padding;
- `Dense Calm`: visually full enough to feel intentional, but low disorder and low interaction tax;
- hidden-result mode must be visually quiet enough that no correctness state is inferable indirectly.

Exact Question Map density, top status composition, Quick Review panel width, typography and visual styling remain open for screenshot-driven design.

## 10｜System Recall workspace — ACCEPTED

System Recall is a protected **System reconstruction workspace**, not a modal floating over the answer-bearing System Guide and not an empty page with one sentence in the middle.

The same System cognitive asset is reused across learning states:

```text
System Guide         = complete orientation
System Recall Front  = protected reconstruction state
System Recall Reveal = compressed Current reconstruction / verification
```

Pre-question and post-question System Recall use the same workspace / cognitive asset with different phase labels and Evidence phases.

### 10.1 Recall Front

Before Reveal, the whole learner workspace must remain answer-safe.

Mac composition may use a restrained Reconstruction Desk:

```text
┌───────────────────────┬──────────────────────────────────────────────────────┐
│ RECONSTRUCTION        │ System neutral recall prompt                         │
│                       │                                                      │
│ 系统主链              │ learner reconstruction / scratch area               │
│ 并行控制              │ optional, not mandatory to fill                     │
│ Failure 定位          │                                                      │
│ 病例判断顺序          │                                  Space → 核对模型    │
└───────────────────────┴──────────────────────────────────────────────────────┘
```

The left labels describe the **dimensions to reconstruct**, not their answer contents.

Do not expose before Reveal:

- mother/spine contents;
- variables / relations;
- Failure chains;
- judgment-axis answers;
- Block routes when they would function as answer scaffolding beyond the accepted neutral prompt;
- answer-bearing System Guide content behind a translucent dialog.

The reconstruction scratch area is optional. Kian may reconstruct mentally, verbally, on paper, or in the surface; UI must not require typed content as a gate.

### 10.2 Recall Reveal

After a genuine reconstruction attempt, use Mac width to restore the System's own Current compressed model rather than a generic three-card summary.

Possible Current-supported regions include, only when owned by that System:

```text
System spine / mother model
parallel controls
core variables / coordinates / relations
Failure Modes / failure views
judgment axes
reverse-case algorithm
Current System Recall free-reconstruction objects
Block route / cross-Block bridges when Current explicitly owns them
```

Presentation may use map / chain / coordinate / failure / decision geometry according to the actual System semantics.

A1 Circulation must not define A2/A3 geometry. For example:

- A1 may spatialize circulation spine + parallel controls + P/Q/R/V / mechanical coordinates + Failure / judgment logic;
- A2 may spatialize air → airway → pump/thorax → alveoli → membrane → VA/Q → Hb → tissue plus its respiratory localization axes;
- A3 may spatialize perfusion → filtration → tubular handling → concentration/hormonal control → fluid/electrolyte/acid-base → urine evidence → urinary outlet plus its renal localization axes.

No System may receive a relation merely because another System's Recall view uses that category.

### 10.3 Dense Calm requirement

A neutral Recall Front must not become visually barren. Use task structure, readable typography, reconstruction workspace, stable alignment and subtle dividers to create an intentional desktop surface without leaking answers.

After Reveal, semantic density should come from the System's actual Current cognition rather than decorative cards or artificial whitespace.

### 10.4 Interaction

Keep interaction low-friction:

```text
Space = reveal / hide System model
C     = focus optional scratch area
Enter = after Reveal, complete this System Recall phase
```

No double confirmation or typed-response requirement.

### 10.5 Pre / Post reuse

Before questions:

```text
SYSTEM RECALL · BEFORE QUESTIONS
```

After questions / needed repair:

```text
SYSTEM RECALL · AFTER QUESTIONS
```

The post-question purpose is to remove concrete question cues again and verify that the learner still owns a coherent System model rather than only remembered question patterns.

Existing Evidence semantics distinguishing `PRE_QUESTION / MID_SWEEP / POST_QUESTION` remain authoritative.

## 11｜Current whole-paper implementation boundary

Current `static-web` has an accepted **System Question Sweep** loader from each System's reviewed question scope. It also has a browser-private whole-paper **holdout** mechanism that excludes selected years wholesale from ordinary System sweeps.

Current does **not yet have a separate learner-facing whole-paper runtime/page** in the accepted Xizong implementation.

Therefore product discussion may design a later whole-paper workbench using Current immutable year/number question identities, but must not describe such a surface as already implemented or Runtime-accepted.

This means:

```text
System Completion
→ owns System Recall + that System's question sweep

Xizong-wide Practice / Questions
→ is the appropriate future owner for whole-paper runs
```

Holdout exists specifically to protect those future whole-paper runs from being silently consumed by System-by-System practice.

## 12｜Final System Completion composition — FROZEN

The learner-facing System Completion surface is one Mac-wide workbench:

```text
System Completion
├─ top status / phase / compact holdout setting
├─ System Recall Front
│  └─ protected reconstruction desk
├─ System Recall Reveal
│  └─ Current compressed System model
├─ System Questions
│  └─ same Question Runtime for FIRST_PASS / SECOND_PASS / LATE_REVIEW
└─ concentrated W/U / Marked review and post-question Recall
```

Hard UI decisions:

- System Recall is **inline inside the workbench**, never a modal over answer-bearing System content;
- `holdout` is a compact question strategy setting, not a numbered learner stage or full-size peer card;
- finishing Recall changes the workbench state and unlocks questions without navigating to another page;
- FIRST_PASS / SECOND_PASS / LATE_REVIEW reuse the same Question Runtime and Evidence history;
- SECOND_PASS may project reviewed decision axis / valuable distractors / transfer rule after submit, but never invent missing content;
- LATE_REVIEW remains a thinner phase of the same Runtime; no second knowledge store or second question product is created;
- System Completion does not own whole-paper runs. Xizong-wide Practice will reuse the same task grammar in a later bounded implementation;
- all medical/System cognition is consumed from Current owners; component markup/CSS may not hard-code System-specific knowledge.

### 12.1 Current implementation slice

The active implementation slice is intentionally bounded to the System Completion surface:

```text
existing modal System Recall
→ inline Recall Front / Reveal
→ compact holdout control
→ same Question workspace / attempt history / W-U / SECOND_PASS
→ browser Human Gate
```

No Question Truth, medical Content, Learning, Evidence meaning, reviewed mapping or learner-state schema changes are authorized in this slice.

Whole-paper Runtime and durable learner-data closure remain subsequent product slices after this System Completion surface is accepted.

If a later hidden-result / whole-paper implementation requires changing stored evidence semantics, perform the dedicated Runtime/Evidence review at that later owner rather than smuggling it into this surface change.
