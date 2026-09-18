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

`Chat/Astro Orientation → Chengfeng Natural Unit continuous learning on original iPad/MarginNote lecture surface → natural checkpoint/closure when it adds retrieval value → Xiao1000 verification in Astro/KianOS web → wrong/uncertain source repair → Unit/Block compression when it removes future work → later Memory/analysis-output/Mock`

This supersedes learner-facing flows that treat Suyi, Chengfeng, and Xiao1000 as parallel courses, and it also supersedes any implementation that turns Astro into a substitute continuous Chengfeng lecture reader.

A checkpoint is not mandatory after every small source fragment. Preserve Chengfeng continuity and interrupt only at a genuine Natural Unit/natural subsection closure or when retrieval/verification value justifies the switch. A simple stable Unit may move almost directly from source closure to Xiao1000 verification.

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
| Xiao1000 verification | **Astro / KianOS web Politics question surface** | Original question/options/official answer remain source-owned; the web surface owns attempt/evidence interaction, not learning order |
| Wrong / Uncertain evidence capture | Astro | Preserve only evidence needed for repair/return |
| Exact Chengfeng source repair | Original Chengfeng lecture surface by default | Astro may show a locator or minimal decisive excerpt; it must not expand into a second full lecture |
| Deep semantic / relation repair | Chat | Adaptive diagnosis/repair; return to the owning learner path afterward |
| Unit Return / handoff | Astro ↔ Chat as approved | Preserve Natural Unit / question identity and next action |

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
- **Smallest sufficient repair:** wrong/uncertain evidence should trigger the shallowest repair that resolves the real failure.
- **Repair depth matches failure depth:** a hat/wording confusion should not reopen an entire Natural Unit; a broken concept relation may reopen a Teaching Bridge; a broken unit model may reopen the owning Chengfeng unit on its original source surface.
- **Question-bank subordination:** question counts, unlock counts, and coverage must not dominate first-round attention hierarchy.
- **Memory later:** first-round display should not make static memory counts a primary task. Precision/Memory becomes prominent when the learning phase actually requires it.
- **No mandatory ritual:** Orientation, Recall, closure, source handoff and UI state transitions are tools, not ceremonies. Skip or compress them when they do not materially improve retrieval or transfer.
- **No learner-facing scheduler internals:** fixed labels such as D1/D3/D7/D14 are not an active Politics learner contract. Review should present useful tasks and reasons, not scheduler implementation details.

## 5. Xiao1000 verification and repair

Xiao1000 appears in **Astro/KianOS web** as the verification checkpoint after the relevant Natural Unit / natural subsection has been learned on the original Chengfeng surface.

Astro owns the learner's question-attempt interaction, Wrong/Uncertain capture, fast correct continuation, and Unit return. It does not own Xiao1000's source truth and does not use Xiao1000 to organize first learning.

For a stable correct answer:

`✓ → continue`

For wrong or uncertain evidence:

`question evidence → first meaningful failure → smallest sufficient repair → owning Chengfeng source → continue`

Default repair hierarchy:

1. wording / hat / fixed-boundary confusion → show the decisive distinction and minimal source evidence;
2. concept relation unclear → reopen the relevant Teaching Bridge / boundary;
3. Natural Unit model broken → return to the owning Chengfeng segment on the original source surface;
4. persistent cross-unit confusion → use Unit/Block compression or targeted review.

Do not replace this with a second full AI explanation textbook.

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

The current learning chain repairs the **current-unit failure** first. Cross-unit hits are retained as evidence/context, not used to inflate the current Unit.

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

### 6.1 Later-stage consolidation fast path

Politics later-stage consolidation is **not a miniature Xizong** and must not inherit a high-friction per-item recall workflow.

Politics has a smaller time budget and lower overall exam priority than Xizong. Its default later-stage learning unit is therefore the **chapter or another genuinely large chapter-level memory structure**, not every Natural Unit, K object, reconstruction target, or Memory candidate.

Default consolidation path:

```text
CHAPTER_RECONSTRUCT
→ CORE_CONTENT_RECALL
→ ACTIVE_PRECISION when justified
→ PRIOR_WRONG / meaningful UNCERTAIN when present
→ SELECTIVE_RETEST when useful
→ SMALLEST_REPAIR only if still unstable
→ CLOSE
```

This is a **fast path by default**:

- reconstruct the chapter in one bounded operation rather than one prompt per K target;
- use the framework to organize a substantial amount of chapter content, not to replace all memory work;
- recall core content in a small number of meaningful groups rather than item-by-item ceremony;
- allow the learner's own wording when the relation, conclusion, scope and decisive qualifiers remain correct;
- require exact wording/list/identity/timeline/legal precision only when the point is actually active/admitted;
- use historical Wrong / meaningful Uncertain evidence to earn depth;
- use Xiao1000 as selective verification, not as an automatic whole-bank rerun;
- reopen only the smallest broken relation/source segment;
- let stable chapters exit cheaply.

The learner-facing path must not expose backend recall taxonomies, K object counts, candidate counts, or per-node completion counters. A rich backend exists so repair can become precise when needed; it does not justify a rich default workflow.

#### Framework organizes memory; it does not replace memory

Politics differs from Xizong in one important way: after first-round understanding, a substantial proportion of a chapter may still need active retrieval.

Therefore later consolidation must distinguish:

1. **chapter framework reconstruction** — recover the chapter's organizing logic;
2. **core-content recall** — regenerate the important content hanging from that framework;
3. **precision recall** — exact hats, fixed groups/lists, identities, timelines, legal wording or other source-grounded details that genuinely require exactness.

Compression in Politics therefore means **organizing future memory operations**, not simply deleting detail until only a skeleton remains.

At the same time, "the chapter matters" does not mean "every sentence must be memorized word-for-word". Broad relations may be reconstructed; grouped content may need complete retrieval without fixed prose; only true Precision demands exact retention.

#### Core-content recall scope is a Learning decision

For a chapter to be later-stage L-ready, `CORE_CONTENT_RECALL` must be explicit enough that downstream Projection/Runtime does not have to guess which chapter content should be actively regenerated.

The recall scope should be a **small set of meaningful chapter-level groups** that reference Current Knowledge owners. It may reuse existing chapter compression / active structures / boundaries, but it must not duplicate the full source prose.

Hard boundary:

```text
Current Knowledge
→ L-approved grouped recall scope
→ later Projection / Runtime

not

Current JSON fields
→ UI guesses what looks important
```

A calibration chapter therefore needs to answer:

- what one large reconstruction should be attempted first;
- which few content groups should then be actively recalled;
- which exact candidates are merely available vs actually active;
- what prior evidence can earn deeper review;
- what condition allows the chapter to exit.

This grouping is Learning semantics. Layout, reveal interaction and visual form remain downstream.
#### Candidate availability is not learner debt

Hard rule:

```text
content exists
or K candidate exists
or historical handbook mentions it
≠
learner owes a review task
```

A Precision candidate becomes an active learner task only when one of the Memory-admission conditions in §6.2 is satisfied or when the active later phase explicitly requires it.

Examples:

- History's horizontal candidate inventory is a repair/precision reservoir, not a mandatory scan of every meeting/document/land-policy item on every chapter pass.
- Xi high-delta candidate domains stay dormant until current-year source refresh makes exactness legitimate.
- chapter reconstruction targets may support one chapter-level recall prompt; they do not imply one prompt per target.
- Analysis Output hooks remain dormant during ordinary consolidation unless the analysis-output phase activates them.

#### Subject-specific fast shapes

The path remains chapter-fast while respecting subject cognition:

- **Marxism** — reconstruct one relation/mechanism model, recall the principle content, then exact only decisive boundaries/formulations.
- **Mao** — reconstruct historical problem → theory response → identity/hat structure, then recall the major content groups without turning every theory item into a microcard.
- **Xi / New Thought** — reconstruct role/hierarchy first, then recall the chapter's high-value content under that hierarchy; exact wording/list membership remains current-year-source gated.
- **History** — recover the causal historical movie first; activate only the horizontal meeting/document/land-policy/ideological line that is relevant to the chapter or real evidence.
- **Ethics / Law** — recover concept/boundary/situation structure first; exact legal/normative wording is selectively source-gated.

#### Later-pass shrinkage

The second pass should be cheaper than the first, and later passes cheaper again.

After a chapter has been successfully reconstructed, later review should increasingly target only:

```text
framework gaps
+ content gaps
+ active Precision gaps
+ real Wrong / meaningful Uncertain evidence
```

Do not force a full chapter replay merely because the chapter remains available.

#### Close condition

A chapter may close for the current consolidation pass when:

- no material framework gap remains;
- no material core-content gap remains that would change objective discrimination or later answer generation;
- active/admitted Precision for this pass is stable enough for the current phase;
- selected W/U or retest debt has been resolved or explicitly remains pending for a justified reason.

Closure is phase-scoped evidence, not a mastery claim.

Analysis-output and Mock/final work remain separate later states. Ordinary chapter consolidation must not automatically append answer-writing drills or whole-paper work.

### 6.2 Memory admission: understanding may expand; Memory may not

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

### 6.3 Analysis-output is a separate score channel

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
