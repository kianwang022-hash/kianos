# KianOS Root Current

**Role:** Control Tower + root engineering router  
**Rule:** this file reports current work only. It is not project history, semantic Truth, Acceptance Truth or learner progress.

---

## Current outcome

**Today:** land the KianOS learner website as a stable, visually accepted, directly usable shell for continuously growing canonical Content.

The permanent top-level architecture is now:

```text
RULE / MODEL
CONTENT
VISUAL
ENGINEERING
CONTROL
```

Website is a learner execution surface, not a second Content owner.

Cross-cutting guards:

```text
Source Truth
Learner Truth
Acceptance Truth
```

`S/K/L/P/R/E/U` is acceptance language, not another architecture stack.

---

## Current stage

**Shared Visual + Shared Shell:** LANDED on `main` via #389 and passed Kian's direction-level Human Gate.  
**Current launch stage:** Home + accepted subject/task blueprints inheriting the shared foundation.  
**Root blocker:** none.

Do not reopen the architecture unless a real use defect proves one of the five responsibility boundaries wrong.

---

## Five-layer status

| Responsibility | Current state | Next relevant action |
| --- | --- | --- |
| **Rule / Model** | top-level architecture aligned; English/Lexical/Xizong rules cleaned; Politics already strong | change only from real semantic need |
| **Content** | Source/Knowledge ownership clear across English, Politics, Lexical and Xizong | continue domain content work independently; do not make launch wait for unfinished D/E/F etc. |
| **Visual** | shared foundation + shell landed; Presentation contract now freezes accepted blueprints | apply existing accepted task/surface blueprints; no redesign by default |
| **Engineering** | repo-wide Current sync, shared navigation, major runtimes exist; engineering boundary now explicit | converge only launch-visible implementation debt; broad CSS cleanup is later unless blocking |
| **Control** | this file is the compact root status/router | keep current, small and decision-relevant |

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

Lexical retains an independent backend owner root (`content/lexical/`) because its canonical asset scale and semantics justify it, but it is an **English learner-product function**, not a fourth subject.

---

## Normal change paths

### Content

```text
Kian + Chat
→ exact canonical Content owner
→ edit
→ main
→ repository-wide Current mirror sync
→ existing renderer consumes new Current
```

Routine Content change must not require duplicate page edits.

### Visual

```text
global visual change → shared visual owner
subject-wide visual change → subject owner
accepted task geometry → existing frozen Surface Blueprint
```

A new Chat does not get permission to redesign an accepted surface.

### Engineering

```text
approved learner behavior
→ narrow renderer/runtime owner
→ targeted validation
```

Shared Base should converge toward shared-only CSS/runtime. Subject/task CSS belongs at the narrowest subject/task boundary rather than accumulating globally.

---

## Current launch candidates

Open PRs are candidates/evidence, not automatic merge obligations.

### Home #387

- contains useful Home read-model/function work;
- current branch is behind newer `main` and not mergeable as-is;
- old visual Human Gate was not passed;
- **action:** replay/reconcile only the useful Home behavior onto current shared foundation, then review the real first viewport.

### Politics #386

- preserves useful Natural Unit geometry/convergence evidence;
- built before current shared visual foundation and is not mergeable as-is;
- **action:** reuse accepted geometry under current Visual; do not let its old CSS redefine shared style.

### Xizong #385

- useful single-owner Block-presentation cleanup;
- not a prerequisite for launch unless a real learner-visible defect proves the current competing CSS owners are blocking the accepted Block surface;
- **action:** defer broad ownership cleanup unless needed for the launch-visible Block path.

### English External Reading #373

- runtime idea is correct: External objects normalize into the existing Reading task family; no second Reading runtime;
- current branch is old/non-mergeable as-is;
- inventory UI is not an independent design project;
- **action:** later replay the shared-runtime/data-source value onto current `main`; External uses the same accepted Reading blueprint.

---

## Known Engineering debt that is NOT a new architecture problem

Current `Base.astro` still globally imports many historical subject/polish/convergence styles.

Target architecture is already fixed:

```text
Base
→ shared foundation + shell + truly global runtime only

subject entry
→ subject visual/runtime

task workspace
→ task-specific geometry/interaction
```

Do not add new subject-specific global Base imports. Consolidate existing ones only in bounded slices with browser proof; do not turn launch day into broad CSS archaeology unless the cascade causes a visible blocker.

---

## Launch acceptance

Launch closes when the real learner site satisfies all of these:

### Visual
- Home first viewport accepted by Kian;
- shared typography/weight/contrast/spacing remains accepted;
- representative mature English / Politics / Xizong / Lexical surfaces retain their accepted task geometry;
- no obvious generic dashboard/card-pile regression;
- no obvious required narrow-screen overflow.

### Functional
- global rail + subject strip work;
- Home Continue/Resume paths work;
- representative mature learner paths open and execute normally;
- Reading / Question / Recall / Translation / Writing / Lexical behaviors remain intact where applicable;
- Timer does not block task interaction.

### Delivery

```text
main changes
→ dedicated Current mirror reaches exact main
→ Astro serves it
→ browser sees the change without manual Git sync
```

### Change cost
- a global typography change resolves upstream;
- subject geometry stays local;
- canonical Content stays direct-editable;
- compatible new content objects use existing renderers/runtime rather than new pages.

### Human Gate
Material learner-facing Visual is accepted by Kian in the real browser. CI/build alone cannot close launch.

---

## Hard freeze until launch

Do not:

- add new architecture layers / Contracts / registries for completeness;
- reopen accepted learning logic for visual convenience;
- redesign already accepted surface blueprints without explicit Kian direction;
- make unfinished Xizong content or optional enrichment a website-launch blocker;
- merge stale branches merely because much work exists in them;
- spend launch time on broad cleanup that does not change learner experience or launch safety.

---

## Router

| Scope | Engineering Work Cursor |
| --- | --- |
| Xizong | `content/xizong/CURRENT.md` |
| English | `content/english/CURRENT.md` |
| Politics | `content/politics/CURRENT.md` |
| Lexical backend | `content/lexical/CURRENT.md` |
| Cross-subject scheduling | `EXAM_ORCHESTRATOR_CONTRACT.md` |

A bare `继续英语 / 继续政治 / 继续循环` is a learner request unless the current Chat is clearly in BUILD / UI / CONTROL work.

---

## Control reporting format

For root launch work, report only:

```text
Stage
Done
Real blocker
Next
Human Gate
```

Hide branch/SHA/CI detail unless it changes the decision.

---

## Root operating rule

```text
Kian intent
→ exact owner
→ smallest correct change
→ representative proof
→ Human Gate when visual
→ land
→ stop
```

**Optimization target: a finished learning website that is cheap to keep filling with better Content.**
