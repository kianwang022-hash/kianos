# KianOS Root Current

**Role:** Control Tower + root engineering router  
**Rule:** reports current work only; not semantic Truth, Acceptance Truth or learner progress.

---

## Current stage

Permanent architecture:

```text
RULE / MODEL
→ CONTENT
→ VISUAL
→ ENGINEERING
→ CONTROL
```

Control now tracks **two long-running program streams in parallel**:

```text
A. WEBSITE / UI LAUNCH
B. CONTENT IMPROVEMENT PROGRAM
```

Neither stream is subordinate to the other. Content may continue improving while mature learner surfaces launch; UI may launch without waiting for optional future Content enrichment.

Shared Visual + Shared Shell are landed. Home is Human-Gate accepted. English Architecture-v2 / UI vertical is landed through #394. Politics and Xizong UI remain active learner-surface work.

---

## Website / UI launch stream

| Lane | Current state | Owns | Must not change |
| --- | --- | --- | --- |
| Xizong UI | **ACTIVE** · `work/ui-xizong-vertical-20260918` | Xizong subject/task presentation + narrow runtime wiring | Shared Visual, Shared Shell, other subjects, medical semantics |
| Politics UI | **ACTIVE** · formal #395 + preview #397 | Politics Natural Unit / question / review presentation + narrow wiring | Politics Content/Learning/Surface-Mapping semantics, Shared Shell, other subjects |
| English UI | **LANDED** · #394 | accepted English task geometry + SourceTruth boundary | Shared Shell, other subjects, English Learning semantics |

Lexical remains an English learner-product child. Its backend canonical root may stay independent; learner-facing global navigation must not promote it into a fourth subject.

### UI Human-Gate rule

Material visual work follows:

```text
implementation / preview
→ real browser screenshot
→ Kian Human Gate
→ targeted CI
→ merge
```

An unapproved screenshot is not a visual PASS. CI green alone never authorizes merge of a material learner-facing visual change.

---

## Content improvement stream

Root Control must summarize durable **program-level Content progress**, not only website work.

It does not duplicate every batch or local audit. Exact Content truth and exact work cursors remain in their own owners. Root Control reads those owners and keeps only the current stage / meaningful progress / next durable gate.

### Bound content feeds

```text
Xizong
→ content/xizong/CONTENT_MAINLINE.md
→ exact active System CURRENT when a System has an active stage
→ content/xizong/question-relations/continuation.json for Crosswalk cursor

English
→ content/english/CURRENT.md

Politics
→ content/politics/CURRENT.md

Lexical backend
→ content/lexical/CURRENT.md
```

### Current Content snapshot

| Content lane | Current progress | Next durable step |
| --- | --- | --- |
| **Xizong D · Neuro / Sensory / Motor / Orthopedics** | **Content Realization ACTIVE**. Upstream `S1 / K / L` closed. 27/27 Block wrapper cleanup closed. Neural sufficiency **56/56 LG PASS**. | **Phase 7D:** audit O1–O16 / **72 orthopedic LGs**, then Phase 7E fresh independent Content closure. P/R/E remain frozen until Content closes. |
| **Xizong E · Reproductive / Breast** | Parallel Source / Knowledge groundwork is permitted by the mainline; no program-level accepted K/L closure is claimed here. | Source reconstruction/audit → Knowledge construction → independent K acceptance → Learning. |
| **Xizong F · Remaining Clinical** | Later lane. | Starts after D/E priority unless a real exam/dependency reason reprioritizes it. |
| **Xizong Question→Knowledge Crosswalk** | **C2 broad basic coverage ACTIVE**. Latest durable cursor: **727 REVIEWED relations**; no linear frontier. | Next evidence-driven review packet, default bounded batch 50. |
| **Xizong Visual / Extension** | Continuous selective high-value program; deliberately no percentage-complete target. | Small reviewed batches only where a stable owner and real learner value justify them. |
| **Lexical Content** | **7,946 / 7,946 COMPLETE** + independent semantic audit **7,946 / 7,946 COMPLETE**. | No broad Content rebuild; real learner use, then reopen only exact defects. |
| **English Content** | Objective / Translation / Writing canonical Content accepted for current scope. | No broad Content program; change exact task owner only for concrete semantic defects. |
| **Politics Content** | Five-subject semantic engineering closed through current scoped S/K/L/P/R/E. | No broad semantic program; reopen smallest owner only on concrete defect. |

### Content-Control update rule

Update this root snapshot when a **program-level stage changes**, for example:

- D moves from Phase 7D → Content closure → Projection;
- E passes K and enters Learning;
- Crosswalk reaches a meaningful durable count/stage transition;
- a whole-catalog Content program opens/closes;
- a new System becomes the active medical-content priority.

Do **not** update Root Current for each 50-item batch, one Block edit, one image crop, or one local CI rerun.

This keeps Control useful without turning it into a duplicate Content database.

---

## Required vertical-slice method

Every subject UI lane follows:

```text
RULE
→ CONTENT
→ accepted VISUAL baseline
→ ENGINEERING
→ real-browser screenshot
→ Human Gate
```

Default visual decision is **KEEP / MIGRATE**, not REDESIGN.

A new Chat may redesign an accepted surface only when:
- Kian explicitly rejects it; or
- upstream Rule/Content materially changed and the old geometry is now wrong.

---

## Frozen shared visual baseline

- #389 Shared Visual + Shared Shell remain the shared L1/L2 authority.
- #390 Home is the accepted Home L3 baseline.
- Kian's direct screenshot feedback outranks assistant visual inference.
- Mac-wide first; high useful information density; no generic SaaS/dashboard/card-pile drift.
- Default-visible learner text must remain comfortably readable and substantial.
- Chinese/CJK typography must feel **wide, solid, full and optically substantial**; narrow/condensed-looking, thin or compressed CJK rendering is a Visual FAIL.
- Do not use negative letter-spacing to squeeze Chinese titles/body copy.

Shared writers are frozen during subject parallel work. Subject lanes must not add new global Base CSS imports or reinterpret the shared shell.

---

## Learner product tree

```text
Home
├─ 西综
├─ 政治
└─ English
   ├─ Reading A
   ├─ Cloze
   ├─ Part B
   ├─ Translation
   ├─ Writing
   ├─ Vocabulary / Lexical
   └─ External Reading
```

---

## Subject targets

### Xizong
Preserve accepted System / Block / KP / Recall learning geometry. Use original lecture/iPad source flow where Learning Rule says it is primary. UI work must not turn Logic Group into medical truth or invent new Knowledge.

### Politics
Preserve Natural Unit and Source/Knowledge hierarchy. Chengfeng continuous study remains the original lecture/MarginNote flow; Astro is not a replacement continuous reader.

### English
Preserve native whole-task geometry: Reading passage + full question set, Cloze full passage + 20 items, Part B global reconciliation, Translation source + authored translation, Writing prompt + dominant writing surface. External Reading reuses the Reading task family rather than creating a second runtime.

---

## Engineering boundary

```text
Base
→ shared foundation + shell + truly global runtime only

subject entry
→ subject visual/runtime

task workspace
→ task-specific geometry/interaction
```

Do not turn launch into broad CSS archaeology. Consolidate historical overrides only when they visibly block the accepted subject surface.

UI iteration fast lane:

```text
local/branch implementation
→ real browser screenshot
→ visual correction as one batch
→ Kian Human Gate
→ targeted CI once
→ merge
```

Do not run full GitHub CI after every cosmetic adjustment.

---

## Control reporting

For UI / launch work report:

```text
Stage
Done
Real blocker
Next
Human Gate
```

For Content work report:

```text
Program / System
Current stage
Meaningful progress
Next durable gate
Real blocker
```

For a whole-project status request, show **both streams**. Hide branch/SHA/CI detail unless it changes the decision.

---

## Hard boundaries

Do not:
- add new architecture layers/contracts for completeness;
- reopen accepted Learning Logic for visual convenience;
- redesign accepted visual baselines by default;
- let one subject lane edit shared shell/global visual ownership;
- expose engineering/debug state as learner content;
- block website launch on unfinished optional Content enrichment;
- freeze a valid Content program merely because UI launch work is active;
- infer Content completion from UI/Runtime readiness or learner progress from repository state.

**Optimization target:** a finished learning website **and** a continuously improving canonical Content system, with Control making both visible without duplicating their exact owners.
