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

**Phase 2 Politics Current: CLOSED.**

- Politics Current: **READY** — `manifest.json`, `provenance.json`, and the six durable source owners under `content/politics/source/` were transferred byte-identically from the pinned legacy Current in commit `42a76bb11b5ef27c80b6261460da9e181b0a64cd`.
- Destination `main` independently matches all eight pinned legacy Git blob identities.
- Source cardinality / parse gate: `xiao_2027_questions.jsonl` = 1172 records; `question_knowledge_links.jsonl` = 1148; `politics_unified_regions.v1.jsonl` = 160; `source_node_registry.v2.jsonl` = 19528. JSON owner/provenance sidecars parse successfully.
- Generated Politics projections, legacy recovery contracts, runtime/release trees, and the stale legacy Politics README were not admitted as Current owners.

Accepted content is transported without semantic re-review. Any semantic repair is a later Chat-owned content change, not part of migration.

Known inherited source-asset gap: B1 Markdown references `Block1_正常机械循环_v6_assets/*`, but that media directory is absent from the pinned tracked legacy Block tree. The clean rebuild neither fabricates nor silently removes those references.
