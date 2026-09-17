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

Shared Visual + Shared Shell are landed.  
Home is now Human-Gate accepted and merged via **#390** (`main@4a8aa0c5`).

The launch has moved into **three subject UI vertical slices in parallel**.

---

## Parallel UI lanes

All three lanes start from the same accepted Home/shared baseline `4a8aa0c5`.

| Lane | Branch | Owns | Must not change |
| --- | --- | --- | --- |
| Xizong UI | `work/ui-xizong-vertical-20260918` | Xizong subject/task presentation + narrow runtime wiring | Shared Visual, Shared Shell, Home, other subjects |
| Politics UI | `work/ui-politics-vertical-20260918` | Politics Natural Unit / question / review presentation + narrow wiring | Shared Visual, Shared Shell, Home, other subjects |
| English UI | `work/ui-english-vertical-20260918` | English task-family presentation + narrow wiring | Shared Visual, Shared Shell, Home, other subjects |

Lexical remains an English learner-product child. Its backend canonical root may stay independent; learner-facing global navigation must not promote it into a fourth subject.

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

For launch work report only:

```text
Stage
Done
Real blocker
Next
Human Gate
```

Hide branch/SHA/CI detail unless it changes the decision.

---

## Hard freeze until launch

Do not:
- add new architecture layers/contracts for completeness;
- reopen accepted Learning Logic for visual convenience;
- redesign accepted visual baselines by default;
- let one subject lane edit shared shell/global visual ownership;
- expose engineering/debug state as learner content;
- block launch on unfinished optional content enrichment.

**Optimization target:** a finished learning website that is cheap to keep filling with better Content.
