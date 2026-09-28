# Politics Learning Contract

Status: CURRENT

This file owns durable Politics learning semantics. It defines how Current Politics content should be learned and projected. It does not own source facts, exam questions, or private learner state.

## 0. Exam objective function — the reason this lane exists

Politics is not being built to become a complete political-theory knowledge system. Its learner-facing purpose is narrower:

> **Help Kian reach a reliable 70+ Politics score, with 75+ as the working target, while consuming the least study time compatible with durable exam performance.**

Every Politics learning, content, UI, Runtime, Review, Memory, and engineering decision is subordinate to that outcome.

The optimization target is therefore not maximum coverage, maximum explanation, maximum source integration, or maximum product polish. It is:

```text
expected exam points gained or protected
÷
learner time + future review debt + switching/friction cost
```

A learner-facing action or asset earns its place only when it materially improves at least one of:

1. answer accuracy;
2. discrimination of confusable options/statements;
3. retrieval speed under exam conditions;
4. transfer from known principles to unfamiliar material;
5. analysis-answer generation later in the preparation cycle;
6. repair efficiency after real Wrong / Uncertain evidence.

If it does none of these, it is not required merely because the architecture can support it.

### 0.1 Score architecture

Current preparation uses a reliability-first score model for the national Politics paper:

```text
70+ floor strategy
≈ objective 40+ / 50
+ analysis 30+ / 50

75+ working strategy
≈ objective 42–44 / 50
+ analysis 31–34 / 50
```

These are **planning targets, not score guarantees**. The reason to bias early learning toward objective accuracy is that objective scoring is deterministic and depends heavily on exact distinctions, relations, chronology, scope and option discrimination. Analysis performance becomes a separate later output task; it must not force first-round study to become premature recitation.

If the official exam structure materially changes, this score model must be revalidated rather than treated as timeless truth.

### 0.2 Phase responsibility — do not make every phase do everything

Politics learning is deliberately asymmetric across time:

1. **First-round understanding / objective engine**  
   Build the smallest coherent model needed to understand Chengfeng, distinguish options and use Xiao1000 as transfer evidence. Heavy answer-template memorization is out of scope here.
2. **Consolidation / evidence repair**  
   Revisit Wrong / Uncertain evidence, compress recurring distinctions and admit only justified Memory/Precision debt.
3. **Analysis-output phase**  
   Use approved later-phase recitation/current-affairs sources to build source-grounded answer frameworks, fixed formulations and material-to-principle output skill. This is a real score channel and must not be left as a vague consequence of first-round understanding.
4. **Mock / final compression**  
   Train time-bounded retrieval, whole-paper switching, answer completion and last-mile high-yield memory.

A strong first round should make later memorization smaller and more structured; it does not eliminate later memorization.

### 0.3 Hard stop / anti-overengineering rule

Engineering is allowed only to reduce learner cost or protect score-relevant behavior.

Once a learner path is technically sufficient for real use:

```text
real study / U evidence
>
more architecture
>
more polish
```

Do not delay actual study in order to perfect a schema, page, component family, semantic asset, or governance layer whose incremental exam value has not been demonstrated.

Before expanding a reference implementation, ask:

- What concrete learner friction or score failure does this prevent?
- How much future study/review time does it remove?
- Could the same gain be achieved by simply studying or doing questions?
- What real-use evidence would justify keeping or deleting it?

If those questions do not have a convincing answer, stop building.

### 0.4 Compression means fewer future operations

A Politics compression asset is valuable only when it removes future learner work. Useful compression should reduce at least one of:

- rereading source pages;
- rebuilding the same relation from scratch;
- repeated confusion between near-neighbor options;
- time spent locating the repair source;
- future memorization volume;
- time needed to generate a structured analysis answer later.

Shorter text alone is not compression. A beautiful framework that creates an extra course is negative compression.

## 1. Product model

Politics follows the repository-wide causal chain:

`Source Truth → Chat semantic/learning judgment → GitHub Current content → approved learner surfaces → learner`

Politics should optimize the learner's actual study path, not maximize visible metadata, governance, page count, or the amount of source material rendered inside Astro.

Hard Politics surface rule:

```text
Source ownership ≠ Surface ownership.
Chengfeng mainline ownership ≠ Astro lecture-reader ownership.
```

The learner path may cross Chat, Astro, and the original iPad/MarginNote lecture surface. The fact that Astro can load source text does not authorize Astro to replace the original continuous-learning surface.

## 2. Active first-round learning chain

The active first-round chain is:

`Chat/Astro Orientation → Chengfeng Natural Unit continuous learning on original iPad/MarginNote lecture surface → natural checkpoint/closure when it adds retrieval value → Xiao1000 verification in the single KianOS Workbench → prebuilt refined backside Content + learner Evidence/cause/note → continue → learner-triggered batch Review packet → Chat diagnosis only when the learner chooses to review → later Memory/analysis-output/Mock`

This supersedes learner-facing flows that treat Suyi, Chengfeng, and Xiao1000 as parallel courses, and it also supersedes any implementation that turns Astro into a substitute continuous Chengfeng lecture reader.

Natural Unit identity does not require completion in one sitting; original-source position may be paused and resumed without generating progress, a checkpoint, or review debt. A checkpoint is not mandatory after every small source fragment. Preserve Chengfeng continuity and interrupt only at a genuine Natural Unit/natural subsection closure or when retrieval/verification value justifies the switch. A simple stable Unit may move almost directly from source closure to Xiao1000 verification.

### Source roles

- **Chengfeng** is the only continuous first-round learning mainline. Natural Unit existence, identity, boundary, and order follow the approved Chengfeng structure.
- **Suyi** is a framework/reference source for Chat. Its useful mind-map structure should be semantically absorbed into Chat-approved Orientation / Bridge / Compression assets. The learner is not required to read Suyi separately, and Politics must not create a second Suyi learning mainline merely to preserve its original presentation.
- **Xiao1000** is validation and transfer evidence. It may bind to one or more Natural Units/KPs but must not determine first-round learning order.
- Different teachers may use different frameworks. Distinguish factual conflict, wording difference, and method preference. Chat decides the learner-facing result; do not hard-merge teachers into a false unified framework.

### Surface roles

Politics first-round learning uses explicit surface ownership rather than inferring it from implementation capability.

| Learner action | Primary surface | Companion / boundary |
| --- | --- | --- |
| Chapter / Unit Orientation | Chat and/or Astro | Short map / WHY NOW only; not a second lecture |
| Chengfeng continuous first study | **iPad / MarginNote original lecture surface** | Astro may hold position/checkpoint/bridge/locator, but must not substitute a continuous lecture reader |
| Natural Unit position / checkpoint / closure cue | Astro | May tell the learner where they are and what to do next without duplicating the lecture |
| Xiao1000 verification | **single KianOS Politics Workbench** | Original question/options/official answer remain source-owned; the Workbench is the only learner-facing attempt/evidence writer |
| Backside explanation Content | Workbench after submit | `takeaway` + refined explanation are prebuilt question-bound Content, not a runtime Chat call |
| Wrong / Uncertain evidence capture | Workbench | Record outcome, learner cause/note/favorite/discussion when useful; do not force an immediate repair ritual |
| Chengfeng locator / optional return | Workbench backside | Show the exact safest Current locator as reference; learner may return when useful, but W/U does not automatically interrupt the question session |
| Batch Review → Chat | Review → Chat, learner-triggered | Export accumulated W/U + learner annotations as one packet when the learner chooses to review; Chat diagnoses patterns and decides the smallest durable follow-up |
| Resume | Home / Review / Workbench | Preserve the meaningful unfinished question session or learning position without inventing scheduler debt |

The Xiao1000 answer-surface binding preserves the existing approved PoliticsWorkbench practice chain: Unit learning closes, Astro launches the Unit's ready questions, records the attempt/evidence, and returns the learner to the Unit path. This binding does **not** authorize Astro to absorb Chengfeng continuous reading.

## 3. Teaching projection

Politics may add a durable Chat-approved learning layer under `content/politics/learning/`.

That layer may contain high-value teaching semantics such as:

- Chapter / subject orientation;
- why-now and from-previous bridges;
- the core problem a Natural Unit is solving;
- internal teaching beats anchored to the owning Chengfeng unit without changing its identity;
- high-value boundaries and contrasts;
- short closure cues;
- Unit / Block / Chapter compression;
- source-repair guidance for wrong or uncertain questions.

It must not duplicate the Chengfeng source into a second AI textbook or a second continuous reader.

### Default teaching asset types

1. **Chapter Orientation** — where this chapter sits, what question it solves, and how its major parts connect.
2. **NU Teaching Bridge** — a short `FROM_PREVIOUS → WHY_NOW → CORE_PROBLEM → NEXT` transition before/inside the owning Natural Unit.
3. **Compression** — reconstructs a completed Unit/Block/Chapter into a small number of durable relations and should reduce later rereading/reconstruction cost.
4. **Repair Guidance** — sends a wrong/uncertain answer back to the smallest sufficient owning source location.

Only create an asset when it improves learning or removes future work. Do not materialize empty module structures for completeness.

## 4. First-round interaction principles

- **Score/time first:** the shortest path that preserves exam-relevant understanding, discrimination and transfer beats a richer path with no demonstrated score benefit.
- **One mainline only:** the learner should feel that they are continuously learning Chengfeng, not switching among three teachers or maintaining two lecture readers.
- **Original-surface continuity:** continuous Chengfeng reading/study belongs to the original iPad/MarginNote lecture surface. Astro surrounds that action; it does not absorb it.
- **Low friction:** stable correct understanding should pass quickly. Extra content appears only when it adds value.
- **Content-rich, display-precise:** backend source/learning assets may be rich; each learner surface should show only the current cognitive action it actually owns.
- **Progressive disclosure:** explanation, boundary, source evidence, and repair depth expand only when needed.
- **Smallest sufficient repair:** Wrong/Uncertain first records Evidence and permits continuation. When the learner elects a source return or batch Review/Chat determines repair is warranted, choose the shallowest repair that resolves the real failure; a Wrong/Uncertain event alone is not an immediate source-switch command.
- **Repair depth matches failure depth:** a hat/wording confusion should not reopen an entire Natural Unit; a broken concept relation may reopen a Teaching Bridge; a broken unit model may reopen the owning Chengfeng unit on its original source surface.
- **Question-bank subordination:** question counts, unlock counts, and coverage must not dominate first-round attention hierarchy.
- **Memory later:** first-round display should not make static memory counts a primary task. Precision/Memory becomes prominent when the learning phase actually requires it.
- **No mandatory ritual:** Orientation, Recall, closure, source handoff and UI state transitions are tools, not ceremonies. Skip or compress them when they do not materially improve retrieval or transfer.
- **No learner-facing scheduler internals:** fixed labels such as D1/D3/D7/D14 are not an active Politics learner contract. Review should present useful tasks and reasons, not scheduler implementation details.

## 5. Xiao1000 verification, backside Content, and batch review

Xiao1000 appears in the **single KianOS Politics Workbench** after the relevant Natural Unit / natural subsection has been learned on the original Chengfeng surface.

First-ready means the **whole item** can be judged from already learned Current content, including decisive distractor boundaries; a current-unit hit or a correct-option match alone is insufficient. An embedded checkpoint must defer a question when its remaining option discrimination needs later Source. Source ownership, first-ready timing, and actual learner completion are separate facts.

The Workbench owns the learner's question-attempt interaction, first-attempt Evidence, Uncertain/cause/note/favorite/discussion signals, fast continuation, and submitted backside. It does not own Xiao1000 Source Truth and does not use Xiao1000 to organize first learning.

The submitted backside is **Content**, not an on-demand Chat interaction:

```text
question_id
→ takeaway                 prebuilt refined Content
→ refined explanation      prebuilt refined Content
→ Current Chengfeng locator/reference
→ learner cause / note / signals
→ next question by default
```

For stable correct:

`✓ → continue cheaply`

For Wrong / Uncertain:

`show the same prebuilt backside Content → record learner Evidence/cause/note → optional Chengfeng reference/return → continue`

Wrong / Uncertain does **not** automatically open Chat, force source repair, or insert a diagnosis ceremony between questions.

When the learner chooses to review a batch:

`accumulated W/U + learner annotations → Review packet → Chat pattern diagnosis → smallest justified follow-up`

That later follow-up may be no action, one source return, a boundary/relation reconstruction, a Memory/Precision admission, a retest, or a durable Content correction. Chat should compress many question events into the fewest real underlying problems rather than re-explain every question.

Do not create a second inline Xiao1000 attempt surface inside Politics learning pages. Learning pages hand the exact Natural Unit to the formal Workbench.

### 5.1 Question-repair semantic authority

Question Repair must preserve the distinction between **question provenance** and **semantic authority**. Freeze the default source priority as:

1. Current `politics_unified_regions` and approved continuous Natural Unit ownership;
2. Xiao1000 original stem/options/official answer/original explanation;
3. Chengfeng `source_node_registry` source text;
4. Suyi or another explicitly approved support source;
5. legacy `question_knowledge_links` as provenance/audit evidence only.

Legacy `question_knowledge_links` must never override Current Unit ownership, create a new tested node, or make an old mapping semantically authoritative merely because the row exists.

A question may test more than one knowledge node. Repair therefore distinguishes:

- `current_unit_hits` — the part being learned/repaired in the current Natural Unit;
- `cross_unit_hits` — legitimate other knowledge hits in the same question that must not be pulled into the current Unit's teaching content merely because the option exists.

When batch Review/Chat determines that repair is actually warranted, repair the **current-unit failure** first. Cross-unit hits are retained as evidence/context, not used to inflate the current Unit.

## 6. Review / Memory / Analysis Output / Mock

Review is evidence-driven and may use elapsed time, but no fixed Politics cadence is frozen as learner-facing truth.

Later review may include:

- short NU recall;
- Unit / Block / Chapter reconstruction;
- boundary / hat / list / timeline / identity recall;
- wrong/uncertain question retest;
- exact source repair;
- later precision-memory work;
- analysis-answer framework / material-to-principle output practice;
- timed Mock transfer.

The learner should see **what to do and why**, not scheduler internals.

### 6.1 Memory admission: understanding may expand; Memory may not

Politics teaching projection may synthesize, reorder, and explain source material when that improves understanding. Durable Memory/Precision has a stricter rule:

`NO SOURCE SUPPORT → NO MEMORY ADMISSION`

A rich explanation, a useful analogy, or a Chat-generated relation is not by itself a reason to create future review debt.

Memory candidates should preferentially come from a **designated memory source/handbook** when one is available and approved for the learner. The designated source is a memory-admission/cross-check source, not a replacement continuous course. If that source has not been bound or inspected, mark handbook alignment as pending; never claim that a point appears there from model memory.

A source-grounded candidate becomes durable review debt when at least one of these is true:

1. the designated memory/analysis-output source explicitly confirms it as a fixed retention target;
2. Wrong/Uncertain evidence shows that exact retention of this source-grounded boundary/hat/list/identity/timeline/legal wording is needed; or
3. the later analysis-output phase requires that exact source-grounded formulation/framework for reliable written production.

Default non-admission cases include:

- explanation richness alone;
- a single stable correct answer;
- a broad conceptual relation that is better reconstructed than memorized;
- AI-generated extensions without explicit source grounding.

Precision is narrower still. A question may produce conceptual repair without producing any Precision candidate.

Optional chapter-level `*.memory.json` sidecars may hold sparse, source-grounded candidates without making them first-round learner-facing content. Sidecars exist only where validation demonstrates a real need; do not materialize them across every chapter for schema completeness.

### 6.1.1 Cross-day Memory evidence profile

Politics Memory scheduling remains **Chat-owned**. The Website records exact Recall evidence and may export a bounded cross-day profile so a fresh Chat does not forget yesterday's `FORGOT / FUZZY / STABLE` history.

This profile is evidence compression, not a scheduler and not a second learner ledger.

Hard rules:

- raw Recall events remain private learner truth;
- Current Memory candidate catalog remains the semantic owner of what can be selected today;
- an old event may inform Current planning only when its candidate still exists **and** its saved candidate snapshot still matches the Current candidate;
- a global catalog revision change alone does not erase unchanged candidate evidence;
- deleted or semantically changed candidates become stale/history-only and must not silently select a Current task;
- the Daily Packet carries only bounded unstable/current-state summaries, a bounded stable sample and bounded recent events; overflow counts remain explicit;
- `FORGOT / FUZZY / STABLE` are Recall evidence, not mastery labels;
- elapsed time may be exposed as a fact, but Politics does not freeze a D1/D3/D7 learner-facing cadence;
- the profile may not create `due`, `next_review`, mastery scores or priority scores;
- Chat chooses today's Memory items from Current candidates using phase, real learner evidence and current study needs;
- no historical Memory evidence can authorize unsupported analysis-output/current-affairs recitation before the required later Source is actually available.

The intended loop is:

```text
private full Recall history
→ Current-bound bounded Memory profile
→ Daily Learning Packet
→ Chat chooses today's small Memory plan
→ Website executes
→ new Recall evidence returns
```

This closes cross-day continuity without turning the Website into an autonomous spaced-repetition scheduler.

### 6.2 Analysis-output is a separate score channel

First-round understanding and Xiao1000 performance do not by themselves prove that the learner can produce high-scoring analysis answers.

Later analysis preparation must deliberately train:

```text
material cue
→ identify owning principle / political position
→ choose a small answer framework
→ retrieve source-grounded formulation
→ connect formulation back to the material
→ produce complete time-bounded prose
```

The later phase may proactively admit source-grounded formulations from an approved recitation/current-affairs source even before a Wrong event, because written production has different retrieval requirements from multiple-choice recognition.

Do not import the full later recitation burden into first-round Chengfeng study merely to feel safe.

## 7. Astro boundary

Astro renders and interacts with Current assets **only for learner actions assigned to the Astro surface by this Learning Contract**.

For Politics first-round learning, appropriate reusable primitives include:

- orientation;
- current Natural Unit / source locator;
- external-primary study checkpoint / return;
- short closure cue;
- recall / reveal when approved;
- Xiao1000 question attempt;
- wrong / uncertain marking;
- minimal source-repair excerpt / exact source jump;
- highlight / note / next when they serve an approved Astro-owned action.

A generic `continuous source reader` capability is **not** a Politics first-round primitive for Chengfeng. If shared runtime contains such a component for another lane or reference mode, Politics must not use it to replace Chengfeng continuous study on iPad/MarginNote.

Astro must not hard-code political knowledge that belongs in `content/politics/`.

If a better explanation, orientation, bridge, boundary, or compression can be expressed as content, update the natural learning owner rather than embedding it in a page component.

## 8. Private interaction state

Current content is learner-independent. Answers, progress, wrong/uncertain history, timing, notes, highlights, last external-source position, and similar private state may exist in browser/session/device storage only when it materially improves learning. It is not shared Current authority.
