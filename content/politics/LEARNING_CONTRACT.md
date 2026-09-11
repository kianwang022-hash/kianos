# Politics Learning Contract

Status: CURRENT

This file owns durable Politics learning semantics. It defines how Current Politics content should be learned and projected. It does not own source facts, exam questions, or private learner state.

## 1. Product model

Politics follows the repository-wide chain:

`Source Truth → Chat semantic/learning judgment → GitHub Current content → Astro display/interaction → learner`

Politics should optimize the learner's actual study path, not maximize visible metadata, governance, or page count.

## 2. Active first-round learning chain

The active first-round chain is:

`Chat Orientation → Chengfeng Natural Unit continuous learning → Xiao1000 verification → wrong/uncertain source repair → Unit/Block compression → later Memory/Mock`

This supersedes learner-facing flows that treat Suyi, Chengfeng, and Xiao1000 as parallel courses.

### Source roles

- **Chengfeng** is the only continuous first-round learning mainline. Natural Unit existence, identity, boundary, and order follow the approved Chengfeng structure.
- **Suyi** is a framework/reference source for Chat. Its useful mind-map structure should be semantically absorbed into Chat-approved Orientation / Bridge / Compression assets. The learner is not required to read Suyi separately, and Politics must not create a second Suyi learning mainline merely to preserve its original presentation.
- **Xiao1000** is validation and transfer evidence. It may bind to one or more Natural Units/KPs but must not determine first-round learning order.
- Different teachers may use different frameworks. Distinguish factual conflict, wording difference, and method preference. Chat decides the learner-facing result; do not hard-merge teachers into a false unified framework.

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

It must not duplicate the Chengfeng source into a second AI textbook.

### Default teaching asset types

1. **Chapter Orientation** — where this chapter sits, what question it solves, and how its major parts connect.
2. **NU Teaching Bridge** — a short `FROM_PREVIOUS → WHY_NOW → CORE_PROBLEM → NEXT` transition before/inside the owning Natural Unit.
3. **Compression** — reconstructs a completed Unit/Block/Chapter into a small number of durable relations.
4. **Repair Guidance** — sends a wrong/uncertain answer back to the smallest sufficient owning source location.

Only create an asset when it improves learning. Do not materialize empty module structures for completeness.

## 4. First-round interaction principles

- **One mainline only:** the learner should feel that they are continuously learning Chengfeng, not switching among three teachers.
- **Low friction:** stable correct understanding should pass quickly. Extra content appears only when it adds value.
- **Content-rich, display-precise:** backend source/learning assets may be rich; the learner surface should show only the current cognitive action.
- **Progressive disclosure:** explanation, boundary, source evidence, and repair depth expand only when needed.
- **Smallest sufficient repair:** wrong/uncertain evidence should trigger the shallowest repair that resolves the real failure.
- **Repair depth matches failure depth:** a hat/wording confusion should not reopen an entire Natural Unit; a broken concept relation may reopen a Teaching Bridge; a broken unit model may reopen the owning Chengfeng unit.
- **Question-bank subordination:** question counts, unlock counts, and coverage must not dominate first-round attention hierarchy.
- **Memory later:** first-round display should not make static memory counts a primary task. Precision/Memory becomes prominent when the learning phase actually requires it.
- **No learner-facing scheduler internals:** fixed labels such as D1/D3/D7/D14 are not an active Politics learner contract. Review should present useful tasks and reasons, not scheduler implementation details.

## 5. Xiao1000 verification and repair

Xiao1000 appears as an inline verification checkpoint after the relevant Natural Unit / natural subsection has been learned.

For a stable correct answer:

`✓ → continue`

For wrong or uncertain evidence:

`question evidence → first meaningful failure → smallest sufficient repair → owning Chengfeng source → continue`

Default repair hierarchy:

1. wording / hat / fixed-boundary confusion → show the decisive distinction and minimal source evidence;
2. concept relation unclear → reopen the relevant Teaching Bridge / boundary;
3. Natural Unit model broken → reopen the owning Chengfeng segment;
4. persistent cross-unit confusion → use Unit/Block compression or targeted review.

Do not replace this with a second full AI explanation textbook.

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

## 7. Astro boundary

Astro renders and interacts with Current assets. It should provide reusable interaction primitives such as:

- orientation;
- continuous source reading;
- checkpoint;
- recall / reveal;
- question attempt;
- wrong / uncertain marking;
- source repair;
- highlight / note / next.

Astro must not hard-code political knowledge that belongs in `content/politics/`.

If a better explanation, orientation, bridge, boundary, or compression can be expressed as content, update the natural learning owner rather than embedding it in a page component.

## 8. Private interaction state

Current content is learner-independent. Answers, progress, wrong/uncertain history, timing, notes, highlights, and similar private state may exist in browser/session/device storage only when it materially improves learning. It is not shared Current authority.
