# English Visual / Surface Blueprint

Status: **CURRENT — ACCEPTED ENGLISH VISUAL / SURFACE BLUEPRINT OWNER**  
Parent Visual authority: `static-web/PRESENTATION_CONTRACT.md`  
Control router: `content/english/CURRENT.md` + `static-web/CURRENT.md`  
Scope: learner-visible English family composition, task geometry and presentation decisions only.  

This file owns the accepted English subject/task Visual blueprint under Architecture v2. It consumes approved Rule / Model and canonical Content, and constrains Engineering presentation without changing English learning semantics, Content truth, Runtime behavior, Evidence meaning or learner progress. Accepted task geometry is reused rather than re-derived unless Kian explicitly reopens it or upstream Rule / Model materially changes the task.

## Shared boundary

### Navigation hierarchy

English uses the shared three-level learner navigation contract:

```text
L1  KianOS
    Home | 西综 | 政治 | English

L2  English
    Overview | Objective | Translation | Writing | Vocabulary

L3  Objective
    Reading A | Cloze | Part B

L3  Vocabulary
    Overview | Learn | Repair | Research
```

Ownership rules:

- Reading A / Cloze / Part B are task forms inside one Objective capability; they do not each become an L2 destination.
- Vocabulary is one English L2 capability. Its local Overview / Learn / Repair / Research modes are L3 and remain owned by Lexical.
- A local `← English` control is a parent return/breadcrumb, not another navigation level.
- Objective L3 belongs on the Objective landing/workspace context; it must not become another full Subject Bar.
- Once the learner enters a complete attempt object, the immersive Runtime may suppress the English L2 bar to protect vertical working height. This is a presentation exception only; task ownership does not change.

- Primary environment: Mac wide landscape.
- English remains Digital Workbook + Adaptive Coach.
- Preserve each task's native cognitive geometry; do not force one template across Reading A / Cloze / Part B / Translation / Writing.
- Stable work stays quiet and fast; deeper help appears only after a real problem.
- Existing task state, answer gating, Uncertain, trajectory, attempt timing, whole-unit submit/review, optional Chat escalation, Resume semantics and owner boundaries must be preserved unless explicitly changed below.
- Lexical lookup is read-only routing to Current LexicalOS truth; lookup alone does not create Repair/evidence/mastery state.

---

## Reading A — accepted direction

Preserve existing whole-passage clean attempt, local state/trajectory/Uncertain, timer, continuous-practice behavior, answer gating, optional problem review and whole-passage Chat escalation.

Change learner presentation from `Passage + one visible current question` to:

```text
Mac landscape
Passage left, independently scrollable
|
full question set right, all questions visible in natural order and independently scrollable
```

Active/focused question may remain only for keyboard targeting; it must not gate visibility of the other questions. Remove dependence on a top Q1–Q5 navigator / Previous–Next just to see questions.

Before submit, selected option uses a quiet outlined row and checkmark only; it means `my current choice`, never correctness.

```text
  1   option A

  2   option B

╭──────────────────────────────╮
│ 3   option C              ✓ │
╰──────────────────────────────╯

  4   option D
```

Preserve total attempt time in the deep-review packet together with score, Wrong/Uncertain, trajectory, optional cause and selected passage context.

Passage selection menu:
- exact single lexical token → `Lexical 查词` primary + `高亮` + `Chat 上下文`;
- phrase/span → `高亮` + `Chat 上下文`; only expose a Lexical construction action when exact Current resolution exists;
- sentence/paragraph → `高亮` + `Chat 上下文`.

No Reading-local dictionary and no learner-state mutation from lookup.

After submit, Wrong/Uncertain review expands in place while passage + full question set remain available.

---

## External Reading — Reading Growth content lane

External Reading is an ongoing English Content lane, analogous to Vocabulary in longevity but not in cognition. It exists to add high-quality reading volume after English-I papers stop providing enough new stimulus.

Current source order:

```text
TPO 56–65
→ IELTS Academic 17–19
→ later high-value additions only when they expand useful reading range
```

### Visual / interaction model

Reuse the accepted Reading workspace skeleton where it helps:

```text
private source library / collection tree
→ select one stable External object
→ passage left
→ source-native questions right when safely adapted
→ or passage-only Reading mode
```

Do not reuse English-I Reading-A semantic labels merely because the screen has the same two-column geometry.

- TPO keeps legacy TOEFL/TPO identity.
- IELTS keeps IELTS Academic identity.
- unsupported source-native question structures remain source-bound/free-text or reading-only; never invent multiple-choice controls.
- questionless future material remains questionless.
- all imported/current questions stay visible as one source set when the source interaction permits it; local focus may support keyboard use without hiding the rest.
- formal answers remain protected before Submit.
- pure Reading is a legitimate completion path and must not manufacture a quiz or review debt.
- Wrong / Uncertain remain evidence only.
- source-quality warnings may appear as a quiet optional Source note; engineering/source debt must not dominate the learner workspace.

### Content / private boundary

The learner must never see a manual JSON-import workflow as the normal product.

```text
public GitHub identity / manifest / compiler
+
private Mac source bundle
→ local read-only bridge
→ External Reading workspace
```

The public repository does not redistribute copyrighted TPO / Cambridge source bytes. Learner exposure/answers/timing remain in the same private English evidence/checkpoint system as other English tasks.

### Cross-task boundary

External Reading may use the same exact Lexical lookup/return affordance as Reading A, but lookup remains state-neutral and return restores the exact External object.

Chat may choose an External object as an explicit next task when the factual catalog is available. Website code must not rank TPO/IELTS passages or infer a cross-task next action by itself.

Material learner-facing changes to this new surface require a real Mac Human Gate before final visual acceptance.

---

## Cloze — accepted direction

### Preserve existing functions

Keep the existing Cloze semantics/runtime:
- complete passage remains visible;
- all 20 blanks belong to one clean-attempt unit;
- each blank supports Uncertain;
- selections may be changed and trajectory stays recorded;
- no correctness reveal before whole-passage submit;
- whole passage submits as one attempt;
- start/submission timestamps and total duration remain available;
- submitted result keeps whole-passage score/formal answers;
- optional `整篇给 Chat` deep review remains problem-only and retains passage, time, Wrong/Uncertain, all-blank outcome map and answer trajectories.

### Visual correction: full exam-paper layout on Mac

The previous presentation assumption `complete passage + one visible active blank decision surface` is intentionally replaced for the learner surface. This is a Visual / presentation change only; Cloze learning/evidence logic stays unchanged.

Kian's required Mac-wide model is the natural **exam-paper typesetting**:

```text
complete Cloze passage left
|
ALL 20 blank rows right, visible in natural order inside one scrollable question sheet
```

Each blank row keeps its four candidates horizontally arranged like the printed paper, not four stacked full-width cards.

Target shape:

```text
┌────────────────────────────────────────┬──────────────────────────────────────────────────┐
│ Complete Passage                       │ 01  A ...      B ...      C ...      D ...       │
│                                        │                                                  │
│ ... ____1____ ...                      │ 02  A ...      B ...      C ...      D ...       │
│ ... ____2____ ...                      │                                                  │
│ ... ____3____ ...                      │ 03  A ...      B ...      C ...      D ...       │
│                                        │                                                  │
│ ... ____8____ ...                      │ ...                                              │
│                                        │ 08  A despite  B although  C therefore  D however│
│                                        │                                                  │
│                                        │ ...                                              │
│                                        │ 20  A ...      B ...      C ...      D ...       │
│             passage scroll ↓           │                         question sheet scroll ↓   │
└────────────────────────────────────────┴──────────────────────────────────────────────────┘
```

### Exam-paper behavior

- all 20 rows remain visible in the right question sheet; no blank is hidden merely because it is not active;
- passage and 20-row question sheet scroll independently;
- question number is the natural navigation; do not require a separate 01–20 navigator merely to reveal a hidden blank;
- clicking `____8____` in the passage scrolls/focuses row 08 on the right;
- clicking/focusing row 08 may lightly locate/highlight `____8____` in the passage;
- local `active blank` may still exist only for keyboard targeting / focus state, never for visibility gating;
- `1–4 = A/B/C/D` for the focused blank;
- answer selection never scores locally and must preserve easy backtracking;
- auto-focus to the next row after selection may be used as an accelerator if it does not force scroll jumps or wizard behavior.

### Option layout

Mac default = one row of four candidates:

```text
08    A despite      B although      C therefore      D however
```

Selected candidate uses a restrained exam-like treatment; it means only `my current choice` before submit. If one candidate is long, its own cell may wrap to two lines. A 2×2 fallback is acceptable only when four columns become genuinely unreadable. Do not default to four vertically stacked cards.

### Submit / review

Whole-passage Submit remains one action. Before submit, no formal answers appear.

After submit:
- keep the same passage + full 20-row sheet;
- stable correct rows stay quiet;
- Wrong rows show `my answer` versus `formal answer` in place and may expose the smallest optional triage/actions beneath that row;
- Uncertain-correct is lighter than Wrong and may offer only a cheap confirmation such as `现在明白了 / 仍然不确定`;
- selecting a problem row may locate its blank in the passage;
- an optional `只看问题 / 完整试卷` filter may accelerate review, but the default remains the complete exam-paper view;
- do not switch into a one-blank review wizard;
- optional whole-passage Chat escalation remains secondary after quick understanding fails or problems appear coupled/recurring.

### Lexical

Single-word passage selection may offer read-only `Lexical 查词`, plus highlight / Chat context, under the same owner boundary as Reading A.

---

## Part B — accepted direction

### Preserve existing functions and native forms

Part B keeps its existing native structure because the cognitive object is the **complete discourse / placement map**, not isolated questions.

Preserve:
- all four real Current forms: gap matching, heading matching, paragraph ordering, comment–statement matching;
- original DIRECTIONS where available;
- full source material / comments / candidate paragraphs;
- complete candidate inventory;
- complete 41–45 placement / match map visible together;
- fixed givens in ordering tasks;
- source-owned repeat/single-use candidate policy;
- actual single-use enforcement and candidate locking where required;
- no invented restriction when Current does not know a repeat rule;
- per-target Uncertain;
- answer trajectory;
- whole-set submit and answer gating;
- whole-set score / formal map after submit;
- optional whole-set Chat escalation with task form, directions, candidate inventory, ordering skeleton/fixed givens, time, Wrong/Uncertain and complete learner map.

### Mac-wide presentation

Keep the information architecture; optimize presentation only.

Normal matching family:

```text
┌────────────────────────────────────────┬──────────────────────────────────────┐
│ Full Material                          │ Candidate Pool                       │
│                                        │ A ...                               │
│ paragraph / comment / source...        │ B ...                               │
│                                        │ C ...        used → 41              │
│                                        │ D ...                               │
│                                        │ E ...                               │
│                                        │                                     │
│                                        │ Complete Map                        │
│                                        │ 41   [ C ]   ○ uncertain            │
│                                        │ 42   [ F ]                          │
│                                        │ 43   [ A ]                          │
│                                        │ 44   [   ]                          │
│                                        │ 45   [   ]                          │
│                      scroll ↓          │                       Submit        │
└────────────────────────────────────────┴──────────────────────────────────────┘
```

Ordering form keeps a dedicated Order Map rather than being flattened into generic matching:

```text
Candidate Paragraphs                 ORDER MAP
A ...                                Fixed A
B ...                                   ↓
C ...                                41 [ C ]
D ...  fixed                            ↓
E ...                                42 [ F ]
F ...                                   ↓
G ...                                Fixed D
                                       ↓
                                    43 [...] → 44 [...] → 45 [...]
```

Use typography/alignment/status rather than giant cards. Used candidates may quiet/dim and show where they are used. Fixed givens, single-use and duplicate warnings remain visually clear because they are task constraints.

### Submit / review

After submit, keep the full material + candidate pool + complete map. Correct placements stay quiet. Wrong/Uncertain placements gain restrained in-place delta/triage.

Part B review must preserve coupled-error visibility: a wrong 42 may be caused by a swap/cascade elsewhere. Do not extract one target into an isolated review page. `整组给 Chat` remains the optional escalation when the complete map is needed to diagnose a swap/coupled/structure failure.

---

## Translation — accepted direction

### Preserve existing functions

Translation keeps its Current learning/runtime semantics:
- whole Translation set is one learner-facing attempt/review context;
- full source stays visible;
- each segment has its own learner translation input;
- first translation for each segment is preserved;
- the whole first attempt can be frozen so revision does not overwrite first evidence;
- Reference is protected during clean attempt and appears only after an explicit post-attempt action;
- stable work may PASS directly;
- Need Review is optional and only when a real issue remains;
- whole-set Chat diagnosis remains available;
- diagnosis may locate a smaller affected sentence/clause/scope;
- learner performs Reconstruction rather than receiving an AI-written replacement as the repair action;
- same-item Reconstruction is repair evidence, not mastery;
- local history/reset/previous-next set behavior remains available but secondary;
- pending transfer/evidence state stays silent on normal clean work.

### Mac-wide presentation

Keep the correct existing spatial skeleton, but remove state-machine dominance:

```text
┌──────────────────────────────────────┬────────────────────────────────────────┐
│ Source Passage                       │ Your Translation                       │
│                                      │                                        │
│ paragraph...                         │ 46                                     │
│ underlined / target sentence 46      │ [ learner translation .............. ] │
│                                      │                                        │
│ paragraph...                         │ 47                                     │
│ underlined / target sentence 47      │ [ learner translation .............. ] │
│                                      │                                        │
│ ...                                  │ 48 ...                                 │
│                       scroll ↓       │ 49 ...                                 │
│                                      │ 50 ...                      Submit     │
└──────────────────────────────────────┴────────────────────────────────────────┘
```

Mac origin may favor roughly 40–45% source / 55–60% work area when that improves writing comfort.

Segment linkage:
- focusing translation 47 lightly locates/highlights source 47;
- selecting/clicking the source target may focus its translation field;
- keep the whole-set context instead of swapping to a single-segment page.

### Learner-facing simplification

Normal work should feel like `I am translating`, not `I am traversing a runtime state machine`.

Demote engineering/state labels such as `01 Clean Attempt / 02 PASS or Review / 03 Whole-set Review / 04 Reconstruction / TRANSFER_PENDING / REPAIR_COMPLETE`, provenance and ledger/history details. These internal states may still protect runtime/evidence semantics without becoming primary learner chrome.

After clean completion:
- stable → cheap PASS / next-set exit;
- problem → in-place affected-segment diagnosis + Reconstruction;
- Reference expands locally/on demand and remains explicitly non-unique;
- whole-set Chat is secondary escalation, not mandatory review.

### Lexical

Single-word selection in the English source may offer read-only `Lexical 查词` plus contextual Chat/highlight actions. Translation does not duplicate lexical truth or create Lexical learner state merely from lookup.

---

## Writing — accepted direction

### Preserve existing functions

Writing keeps its Current learning/runtime semantics:
- one complete essay is the learner-facing task unit;
- prompt/task requirements stay visible while writing;
- planned mode remains available, but Direct mode is equally valid and the system must not force a plan;
- first meaningful plan/content evidence and the complete first draft are preserved when present;
- later revision must not overwrite the first draft;
- no model answer is revealed during clean production;
- whole-essay Chat review remains available when useful;
- PASS / ACCEPTABLE is a real exit and creates no manufactured repair/transfer debt;
- when a real problem exists, feedback should identify the smallest high-value failure rather than rewrite the essay for the learner;
- learner performs the revision/re-generation;
- same-prompt correction proves repair, not mastery;
- protected true-exam material remains protected from engineering/testing consumption;
- local history/reset/Resume semantics remain available but secondary.

### Mac-wide presentation

Use the screen primarily as a writing workspace:

```text
┌──────────────────────────────────┬──────────────────────────────────────────┐
│ Prompt / visual / requirements   │ Your Essay                               │
│                                  │                                          │
│ role / audience / directions     │                                          │
│ or chart / image prompt          │                                          │
│                                  │                                          │
│ Optional Plan                    │                                          │
│ [ short real plan ]              │                                          │
│                                  │                                          │
│                                  │                        183 words · 18:24 │
│                                  │                               Submit     │
└──────────────────────────────────┴──────────────────────────────────────────┘
```

Mac origin should favor the authoring side, roughly 35–40% prompt / 60–65% essay when practical. Prompt remains visible; the essay editor is the dominant region.

Timed Delivery is a genuine Writing primitive, so the learner surface should expose a quiet task timer together with word count. Timing is diagnostic/execution context, not mastery by itself.

### Plan behavior

Plan is optional and lightweight. Do not project Writing as a mandatory Step 1 → Step 2 → Step 3 course. Direct mode must remain a first-class clean path for a learner who can generate directly.

### Chat boundary / review simplification

Normal product flow is:

```text
write on the website
→ send/copy the complete essay to Chat for review when wanted/needed
→ discuss the essay directly in Chat
→ Chat identifies/explains the most important issue(s)
→ learner returns to the Writing workspace and revises / rewrites
```

Do **not** make structured Chat Return JSON import a normal learner ritual. The existing machine-readable review/repair return may remain as an internal/optional compatibility mechanism only when required for Resume/evidence state, but the learner should not have to copy Chat analysis back into the website merely so the site can display the same diagnosis again.

The website owns the writing artifact/workspace; Chat owns semantic coaching/review. Avoid duplicating Chat's review surface inside the webpage.

After review, the site may simply preserve first draft + current revision + time/word count + basic task state. Deep diagnosis text stays in Chat unless a small machine-readable state is genuinely required.

### Learner-facing simplification

Demote runtime/state-machine labels such as `Clean Attempt / Whole-Essay Review / Smallest Repair / Repair Check / TRANSFER_PENDING / REPAIR_COMPLETE` from the normal learner surface. These may remain internal states without becoming the visible experience.

Stable work exits cheaply. A real problem leads back to Chat discussion and learner revision, not a forced sequence of JSON handoff/import screens.

---

## First Learning / targeted intervention — accepted direction

### Preserve existing function

Keep all validated First Learning knowledge and task-specific structure:
- Objective keeps Global Map plus Reading A / Cloze / Part B cores and deeper Skill Map/reference material;
- Translation keeps Global Map + Representation / Reconstruction / Execution with Fidelity / deeper repair material available on demand;
- Writing keeps the six genuine primitives, Small / Big specialization, synthetic practice and deeper Skill Map/reference material;
- learner may leave First Learning and return to productive runtime at any point when the missing capability is already sufficient;
- no manual page completion, checkbox or chapter order becomes learner truth/mastery merely because content exists.

First Learning remains a **complete-but-skippable repair reservoir**, not a prerequisite course.

### Entry model

Normal entry should be from a real task need whenever possible:

```text
real Reading / Cloze / Part B / Translation / Writing problem
→ exact relevant First Learning node
→ learn only enough to resolve the current missing capability
→ return to the exact interrupted task
```

Do not force:

```text
English Home
→ First Learning catalogue
→ module
→ chapter hunting
→ target node
```

Browse/catalog access may remain as a secondary reference route, but it should not become the dominant learner path.

### Return behavior

Targeted intervention must preserve origin context. A learner who entered from `2018 Text 2 · Q27` should have an obvious return action back to that exact task/object rather than being dumped at English Home.

The same applies to a Translation segment or Writing task. Cross-surface learning support earns its cost only when return is cheap and precise.

### Mac-wide presentation

A targeted node may use a narrow local navigation rail plus one dominant content stage:

```text
┌──────────────────────────────┬────────────────────────────────────────────┐
│ Reading A                    │ Evidence Boundary                          │
│                              │                                            │
│ Global Map                   │ focused explanation / examples             │
│ Question Demand              │                                            │
│ Evidence Boundary  ←         │                                            │
│ Option Proposition           │                                            │
│ Adjudication                 │                                            │
│ Deep Skills                  │                                            │
│                              │                                            │
│ ← Return to 2018 Text 2 Q27  │                         已经够用，返回 →   │
└──────────────────────────────┴────────────────────────────────────────────┘
```

Do not make the rail a giant course-progress dashboard. It is orientation/reference only. The target node and exact return are the primary experience.

### Chat relationship

Chat may explain or deepen the same targeted issue directly when that is lower friction. First Learning pages remain durable canonical reference/teaching assets; Chat is not required merely because a page exists, and the page should not duplicate a live Chat conversation unnecessarily.

---

## English Home / Resume / navigation — accepted direction

English Home is the **dense English workbench**, not a marketing overview and not a second scheduler.

It should answer, in the first viewport:

1. where English currently is in the exam phase;
2. what exact unfinished object can be resumed now;
3. what today's English work choices are;
4. whether there is meaningful review / repair waiting;
5. what the next important gate is.

### Preserve

- one meaningful Resume / Continue entry that restores the exact unfinished object when one exists;
- direct access to Vocabulary, Reading A, External Reading, true-paper work and Review when they are available in the current phase;
- current phase / Gate context derived from the accepted scheduler/orchestrator owner rather than re-authored locally;
- review counts / problem state derived from real evidence, not fake completion cards;
- First Learning / Guide access as a secondary support route, not the normal task path;
- existing learner state and cross-surface return semantics.

### Dense Mac-wide Home

Use the first viewport for real work, not large empty hero copy.

Target structure:

```text
┌──────────────┬──────────────────────────────────────────────────────────────┐
│ global rail  │ English · current phase / nearest Gate                    │
│ K ⇄ collapse │──────────────────────────────────────────────────────────────│
│              │ Continue / Resume — exact unfinished object                │
│              │──────────────────────────────────────┬───────────────────────│
│              │ Today's English work                 │ Review / Gate / Guide │
│              │ Vocabulary                           │ compact useful rail   │
│              │ Reading A / true paper               │                       │
│              │ External Reading                     │                       │
│              │ other phase-valid work               │                       │
│              │──────────────────────────────────────┴───────────────────────│
│              │ Weekly structure / recent practice / next useful context    │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

- No large `85+` target block or oversized software headline should consume first-viewport area when that space can show actionable study information.
- Phase / Gate is useful context but should be compact, not the dominant visual object.
- Useful rows may be dense and vertically compact as long as the typography remains readable.
- Prefer one continuous workbench with thin rules / aligned columns over a pile of large rounded cards.
- A sparse Home with tiny helper text is a hard failure even if it looks visually clean.

### Navigation rule

English inherits the shared collapsible KianOS left rail.

- `K` toggles compact icon-only vs expanded icon+label global navigation and remembers the user's state.
- Do **not** keep a second full-width English top navigation when it repeats destinations already exposed by the Home workbench or global rail.
- `Today / Vocabulary / true paper / External / Review` should normally appear as direct workbench destinations / task rows, not as a second persistent navigation system plus repeated rows below.
- A top strip may exist only for a genuinely local mode/filter that cannot be expressed more clearly in the workbench itself.
- On focused exam/Guide pages, local navigation may exist for the current object, but should not recreate English Home or the global menu.

### Typography / hierarchy

English Home follows the shared UI floor but should not aim at the floor:

- primary work/task titles should be visually obvious at a glance;
- normal helper / status copy should generally sit around the shared 16px secondary level;
- learner-facing explanatory copy should generally sit around 17–18px;
- no 10–13px gray metadata scattered through large empty areas;
- hierarchy should come from type size/weight, alignment and spacing before card chrome.

### Resume priority

If an unfinished English object exists, Resume is the most important action on Home.

If nothing is unfinished, Home may promote the most relevant current-phase task, but must not manufacture a fake `Continue` or fake progress state.

### Review / Guide rail

The secondary rail may show only information that changes what Kian does now:

- meaningful pending review;
- nearest Gate / phase transition;
- a small Guide entry when the current task genuinely needs model refresh;
- Lexical companion entry when useful.

Do not use the rail as an engineering/status dashboard or duplicate the main task list.

### Acceptance

English Home is not accepted from build success alone. Review a real Mac-wide screenshot and reject it when:

- the first viewport is visibly under-filled despite available useful information;
- navigation is duplicated;
- visible learner text falls below the shared floor;
- typography feels like an engineering/admin console;
- hierarchy depends mainly on rounded cards rather than information structure;
- Resume / today's actual work is visually weaker than decorative phase/target information.

This section closes the previous `Next unresolved English surface` marker. Future English Home changes should refine implementation against this accepted direction rather than reopen the whole English product model.
