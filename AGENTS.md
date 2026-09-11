# KianOS Current Instructions

This repository is the clean Current workspace. Do not reconstruct normal work from `kianos-legacy`, old Issues, old commits, retired releases, compatibility snapshots, or historical runtime code.

## Authority

- Source Truth is upstream evidence.
- Chat owns semantic/content judgments and approves shared learning content.
- GitHub `main` is the single editable shared Current repository.
- `content/` owns shared learning assets.
- `static-web/` owns the Astro learner-facing UI/function runtime.
- Learner state (progress, attempts, wrong/uncertain, timing, notes, scheduler/history) stays local-only and must not be written into shared Current content.
- `EXECUTION_AUTONOMY != SEMANTIC_AUTHORITY`.

## Normal chain

`Source Truth → Chat-approved Current content → Astro projection → learner state`

Astro may transform representation and provide interaction. It must not invent, merge, silently repair, or override domain semantics.

## GitHub reads

Use the smallest exact Current path needed. Normal study/review is 0 GitHub reads unless the user asks to work with GitHub-backed engineering/content state.

Never read `kianwang022-hash/kianos-legacy` by default. Read it only when the user explicitly requests historical recovery/reference or during an explicitly approved migration step.

## GitHub writes

GitHub is read-only by default. Before any mutation, present the concrete intended scope and obtain explicit user authorization. Authorization is bounded to the approved scope. Destructive cleanup, production deployment, and real learner-state mutation require separate explicit authorization.

## Content rules

- Preserve stable object identities and provenance where present.
- Do not create a second semantic owner in UI, generated files, releases, caches, or compatibility layers.
- Exam content must preserve supplied/original passage, questions, options, and official answers as factual authority.
- LexicalOS uses L0-first governance for simple words while preserving true polysemy, familiar-new senses, high-value phrases/constructions/contrasts/confusables.
- Different English modules have different learning objects; do not reduce every error to vocabulary.

## Legacy boundary

`kianos-legacy` is frozen recovery/reference. It is not a dependency, continuation authority, semantic fallback, build input, or governance source for this repository.

If Current is missing something needed for normal operation, fail closed and surface the missing Current asset instead of silently falling back to legacy.
