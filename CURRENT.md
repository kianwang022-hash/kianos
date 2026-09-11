# KianOS Current

**Repository:** `kianwang022-hash/kianos`  
**Branch:** `main`

## Active product model

`Source Truth → Chat-approved GitHub Current content → Astro learner runtime → local learner state`

## Current owners

- Xizong: `content/xizong/`
- English: `content/english/`
- LexicalOS: `content/lexical/`
- Politics: `content/politics/`
- Learner UI/function runtime: `static-web/`

## Legacy boundary

`kianwang022-hash/kianos-legacy` is recovery/reference only. It is not a normal continuation source, build dependency, semantic fallback, UI data source, or governance authority.

## Rebuild status

Clean-room source pin: `kianos-legacy@40e0fdefb9150fc011b37b303f3f24720ef61186`.

**Phase 1 clean-room baseline: CLOSED.**

- Xizong representative Current: **READY** — B1 canonical Markdown migrated unchanged.
- Lexical representative Current: **READY** — `word:answer` migrated as its natural word owner at `content/lexical/words/answer.json`; migration did not repair or reinterpret its semantics.
- Astro learner runtime: **READY AS BASELINE** — clean product shell plus the migrated B1 / Vocabulary / Reading learner-facing interactions, with no old React/API/cache/fallback dependency.
- English Reading representative Current: **READY** — `manifest.json`, `question_bank.v1.json`, and `reading_corpus.v1.json` were transferred byte-identically from the pinned legacy Current, passed Git-blob and SHA-256 identity checks, passed the runtime source gate, and produced a successful Astro static build. Reading does not read legacy or a historical Read Plane fallback.
- Politics: **PENDING FULL SOURCE TRANSFER (PHASE 2)**.

Accepted content is transported without semantic re-review. Any semantic repair is a later Chat-owned content change, not part of migration.

Known inherited source-asset gap: B1 Markdown references `Block1_正常机械循环_v6_assets/*`, but that media directory is absent from the pinned tracked legacy Block tree. The clean rebuild neither fabricates nor silently removes those references.
