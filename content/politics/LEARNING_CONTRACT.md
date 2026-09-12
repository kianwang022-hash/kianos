# Politics Learning Contract

Status: CURRENT

This file owns durable Politics learning semantics. It defines how Current Politics content should be learned and projected. It does not own source facts, exam questions, or private learner state.

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

`Chat/Astro Orientation → Chengfeng Natural Unit continuous learning on original iPad/MarginNote lecture surface → natural checkpoint/closure → Xiao1000 verification in Astro/KianOS web → wrong/uncertain source repair → Unit/Block compression → later Memory/Mock`

This supersedes learner-facing flows that treat Suyi, Chengfeng, and Xiao1000 as parallel courses, and it also supersedes any implementation that turns Astro into a substitute continuous Chengfeng lecture reader.

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
3. **Compression** — reconstructs a completed Unit/Block/Chapter into a small number of durable relations.
4. **Repair Guidance** — sends a wrong/uncertain answer back to the smallest sufficient owning source location.

Only create an asset when it improves learning. Do not materialize empty module structures for completeness.

## 4. First-round interaction principles

- **One mainline only:** the learner should feel that they are continuously learning Chengfeng, not switching among three teachers or maintaining two lecture readers.
- **Original-surface continuity:** continuous Chengfeng reading/study belongs to the original iPad/MarginNote lecture surface. Astro surrounds that action; it does not absorb it.
- **Low friction:** stable correct understanding should pass quickly. Extra content appears only when it adds value.
- **Content-rich, display-precise:** backend source/learning assets may be rich; each learner surface should show only the current cognitive action it actually owns.
- **Progressive disclosure:** explanation, boundary, source evidence, and repair depth expand only when needed.
- **Smallest sufficient repair:** wrong/uncertain evidence should trigger the shallowest repair that resolves the real failure.
- **Repair depth matches failure depth:** a hat/wording confusion should not reopen an entire Natural Unit; a broken concept relation may reopen a Teaching Bridge; a broken unit model may reopen the owning Chengfeng unit on its original source surface.
- **Question-bank subordination:** question counts, unlock counts, and coverage must not dominate first-round attention hierarchy.
- **Memory later:** first-round display should not make static memory counts a primary task. Precision/Memory becomes prominent when the learning phase actually requires it.
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

## 6. Review / Memory / Mock

Review is evidence-driven and may use elapsed time, but no fixed Politics cadence is frozen as learner-facing truth.

Later review may include:

- short NU recall;
- Unit / Block / Chapter reconstruction;
- boundary / hat / list / timeline / identity recall;
- wrong/uncertain question retest;
- exact source repair;
- later precision-memory work;
- Mock transfer.

The learner should see **what to do and why**, not scheduler internals.

### 6.1 Memory admission: understanding may expand; Memory may not

Politics teaching projection may synthesize, reorder, and explain source material when that improves understanding. Durable Memory/Precision has a stricter rule:

`NO SOURCE SUPPORT → NO MEMORY ADMISSION`

A rich explanation, a useful analogy, or a Chat-generated relation is not by itself a reason to create future review debt.

Memory candidates should preferentially come from a **designated memory source/handbook** when one is available and approved for the learner. The designated source is a memory-admission/cross-check source, not a replacement continuous course. If that source has not been bound or inspected, mark handbook alignment as pending; never claim that a point appears there from model memory.

A source-grounded candidate becomes durable review debt only when at least one of these is true:

1. the designated memory source explicitly confirms it as a fixed retention target; or
2. Wrong/Uncertain evidence shows that exact retention of this source-grounded boundary/hat/list/identity/timeline/legal wording is needed.

Default non-admission cases include:

- explanation richness alone;
- a single stable correct answer;
- a broad conceptual relation that is better reconstructed than memorized;
- AI-generated extensions without explicit source grounding.

Precision is narrower still. A question may produce conceptual repair without producing any Precision candidate.

Optional chapter-level `*.memory.json` sidecars may hold sparse, source-grounded candidates without making them first-round learner-facing content. Sidecars exist only where validation demonstrates a real need; do not materialize them across every chapter for schema completeness.

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
