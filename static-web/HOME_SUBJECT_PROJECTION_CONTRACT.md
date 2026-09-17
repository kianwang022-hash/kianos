# Home Subject Projection Contract

Status: **CURRENT HOME INTEGRATION CONTRACT**  
Scope: learner-facing Home aggregation of Xizong / Politics / English only

## 1｜Purpose

Home is the only cross-subject learner aggregation surface.

It consumes a thin derived projection from exactly three subject lanes:

```text
Home
├─ Xizong
├─ Politics
└─ English
```

This contract does **not** create a fourth learning system and does not move canonical ownership out of the subject lanes.

Backend ownership may remain more granular. In particular, LexicalOS may continue to own canonical vocabulary truth while Vocabulary remains learner-facing under **English**.

## 2｜Hard subject set

The Home subject set is closed:

```text
xizong
politics
english
```

`lexical`, `vocabulary`, `external-reading`, guides, review tools, source tools and engineering surfaces must never become top-level Home subjects.

A new English child capability is added to the English projection, not to the Home subject set.

## 3｜Projection shape

Home may consume only the following cross-subject structural fields:

```text
id
ordinal
label
href
resume.adapter
resume.fallbackHref   (optional)
resume.fallbackLabel  (optional)
quickLinks[]          (optional, subject-owned destinations)
```

Home may also consume Exam Orchestrator output separately for cross-subject allocation / next action / Gate presentation.

The projection is a **derived read model**. None of these fields become new Source, Learning, Runtime, Evidence or Learner Truth.

## 4｜Resume boundary

Subject-specific resume meaning stays inside a subject adapter.

Home must not reinterpret:

- what counts as a Xizong learning position;
- what Politics repair/review state means;
- how English chooses the highest-value unfinished task;
- what a Wrong / Uncertain / Repair event means in any subject.

Home only asks each adapter for the learner-facing resume surface and composes those surfaces consistently.

Conceptually:

```text
subject canonical/runtime owners
→ subject Home adapter
→ Home Subject Projection
→ Home composition
```

not:

```text
Home
→ inspect every subject's private internal state
→ recreate subject scheduling/learning logic
```

## 5｜English child rule

English owns its child destinations in learner-facing information architecture.

Current children may include:

```text
Reading A
Cloze
Part B
Translation
Writing
External Reading
Vocabulary
```

Only destinations that actually exist in Current implementation are rendered as links. Adding or removing an English child must not change the top-level Home subject set.

## 6｜Ordering

Home and the shared global rail use the same subject order:

```text
01 Xizong
02 Politics
03 English
```

This avoids a second competing mental model between global navigation and Home.

## 7｜Change rule

If a subject changes internally but can still provide the same Home projection, Home does not change.

If Home needs a new piece of subject meaning, first ask whether it is genuinely cross-subject. If not, keep it inside the subject lane.

Hard rule:

> **Home aggregates subjects; it does not become a shared brain across subjects.**
