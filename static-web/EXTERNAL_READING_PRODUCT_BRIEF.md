# KianOS External Reading Product Brief

Status: **CURRENT implementation brief — 2026-09-17**  
Scope: learner-facing English External Reading under the shared KianOS shell  
Canonical content owner: `content/english/external/`  
Interaction parent: accepted Reading A runtime semantics

## Acceptance question

Can a Chat-authored external reading object land in `content/english/external/objects/`, appear automatically in the learner site after `main` sync, and run through the same Reading A clean-attempt / Uncertain / Submit / review interaction semantics without creating a second Reading runtime?

## Product shape

English subject navigation owns **External Reading** as a peer of Reading A / Cloze / Part B / Translation / Writing / Vocabulary.

External Reading has two learner surfaces:

1. `/english/external/` — inventory / choose an available materialized object;
2. `/english/external/<id>/` — the shared Reading workspace projected from an External object.

The content path is:

```text
Chat
→ content/english/external/objects/<object_id>.json
→ GitHub main
→ existing Current delivery sync / Astro restart
→ /english/external/
→ shared Reading workspace
```

No frontend source edit is required when a new valid object is added.

## Reuse contract

Do **not** copy Reading A into a second runtime.

The existing `ReadingWorkspace` remains the interaction owner. External Reading may parameterize only surface identity, routing, and capabilities explicitly exposed by that owner for safe reuse, such as:

- runtime namespace / localStorage key prefix;
- route prefix for next/review navigation;
- header label and return destination;
- answer endpoint prefix;
- continuous-session participation (`Reading A = enabled`, `External = disabled`);
- review packet surface identity;
- optional external source provenance.

Reading A behavior must remain unchanged after extraction.

Hard ownership rule:

> The External adapter passes owner-supported parameters. It does not rewrite ReadingWorkspace DOM after render, read/write Reading A private continuous-session storage, or temporarily patch foreign Runtime state around Submit.

If External needs a behavior difference that is legitimately part of shared Reading execution, add a narrow capability at `ReadingWorkspace` first and consume it from the adapter.

## Clean-attempt and answer boundary

For External objects with questions:

- passage + full question set are visible together;
- answer keys are not embedded in the clean-attempt HTML;
- learner can answer, change answers, mark Uncertain, use keyboard navigation and local History;
- Submit loads the answer payload through a separate answer endpoint;
- Wrong / meaningful Uncertain can reveal repair context after submission;
- External attempts use their own storage namespace and never collide with Reading A attempts;
- External does not join, mutate, suspend, or restore Reading A's multi-passage continuous session.

Questionless periodical objects remain allowed by the canonical schema, but they are not part of this first runtime slice. The first slice lists them as reading-only / not-yet-performable rather than inventing fake questions.

## Content adapter

The web adapter reads `content/english/external/objects/*.json` at build time and validates the minimum executable shape against the existing canonical schema intent:

- correct object schema id;
- stable `object_id`;
- non-empty source identity;
- non-empty paragraphs;
- unique question IDs;
- question prompt and options when a question exists;
- answer present only in the answer projection, never in the clean attempt projection.

The adapter normalizes a materialized object into the same learner object shape consumed by `ReadingWorkspace`.

## Non-goals

- no corpus-completeness project;
- no automatic web scraping inside Astro;
- no second practice engine;
- no change to Reading A Learning / Runtime / Evidence semantics;
- no consumption of unseen TPO / IELTS inventory merely to demonstrate the UI;
- no private learner attempt data committed to GitHub;
- no new sync daemon — the accepted Current delivery path already owns GitHub `main` → local site delivery.

## Acceptance

Before merge:

1. existing Reading A / English Family checks remain green;
2. one synthetic non-protected External fixture proves build-time discovery and normalized projection;
3. browser acceptance proves passage + full questions + Uncertain + Submit + Wrong/review on the shared workspace;
4. clean-attempt HTML does not contain formal answers;
5. adding another valid object file requires no route/code edit;
6. subject top bar exposes External Reading without restoring duplicate global navigation;
7. External adapter contains no Reading A private continuous-session key or post-render Runtime patch; the ReadingWorkspace owner itself enforces the disabled capability.
