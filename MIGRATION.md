# Clean-room Migration Whitelist

Source repository: `kianwang022-hash/kianos-legacy`  
Pinned source commit: `40e0fdefb9150fc011b37b303f3f24720ef61186`

Only explicitly admitted Current assets may enter the new repository. Legacy governance/runtime/release trees are excluded by default. Existing or newer new-repository Current wins on any path/content conflict.

## Phase 1 — transferred

### Astro runtime

- `static-web/**` is the new learner-facing Astro UI/function baseline.
- Useful Local UI/behavior was ported, but old React APIs, caches, Site runtime, fallback logic, and server learner state are not dependencies.

### Xizong representative Current

- `content/xizong/knowledge/systems/a1-circulation/blocks/Block1_正常机械循环_学习阅读版_v7_最终执行版.md`

### Lexical representative Current

- `content/lexical/words/answer.json`

`word:answer` was transported as its natural word owner. Its accepted/source record was preserved; migration itself performed no semantic repair.

### English Reading representative Current

The following Current owners were transferred mechanically and byte-identically:

- `content/english/manifest.json`
- `content/english/source/question_bank.v1.json`
- `content/english/source/reading_corpus.v1.json`

Transfer identity proof:

- `manifest.json` Git blob: `c4ba991e28bd9b0f50f7444ea6bfced774a47d19`
- `question_bank.v1.json` Git blob: `c10b936beb1864715b59f2ef2028d9cc67cce31e`
- `question_bank.v1.json` SHA-256: `c82b8daa93962cc39a9a4f09a0ba16057914edb6f96a2888c3be455928784986`
- `reading_corpus.v1.json` Git blob: `e7347eec936a57914eafa4369f61d9f8e2dfb89d`
- `reading_corpus.v1.json` SHA-256: `97d3204e7b6141652a3ed196914f74236e13ca24ef03de692f4b969d1a839f4a`

The new runtime verifies the manifest/source hashes before `loadReading()` is allowed to project a learner object. A clean validation resolved `english1-2000-reading-a-text1` with non-empty passage/questions and completed the Astro static build, including `/reading/index.html`. No legacy or historical Read Plane fallback is used.

**Phase 1 clean-room baseline is closed.**

## Phase 2 — Politics Current transferred

Politics was admitted only after the pinned legacy owner manifest had already resolved the durable source roles. Migration did not re-interpret political content and did not promote generated projections.

Transferred Current owners:

- `content/politics/manifest.json`
- `content/politics/provenance.json`
- `content/politics/source/politics_unified_regions.v1.jsonl`
- `content/politics/source/question_knowledge_links.jsonl`
- `content/politics/source/source_node_registry.v2.jsonl`
- `content/politics/source/xiao_2027_explanation_provenance.v1.json`
- `content/politics/source/xiao_2027_question_assets.json`
- `content/politics/source/xiao_2027_questions.jsonl`

Destination admission commit: `42a76bb11b5ef27c80b6261460da9e181b0a64cd`.

Exact identity proof:

- `manifest.json` — Git blob `da00efadff3e870e3b4259c68f0fbca1e78949b8`; SHA-256 `e28c9cd622f85ab8581b86990257bc06a15a174b7cc974f0db0dcd7b0e532dcb`
- `provenance.json` — Git blob `07f78fce8505550f34e34deb0864692642009b2a`; SHA-256 `38c30180fa37cd5fd7b5a1d2980b721207cf62883ba7e80a76ae1c4ef8309bf5`
- `politics_unified_regions.v1.jsonl` — Git blob `7a850bd96c6263302c9b53dd0a1b73801538857f`; SHA-256 `2e2cfa21d189fce984f97bcaea714875e51309ccef4522e42d0d5847e5ca2054`
- `question_knowledge_links.jsonl` — Git blob `5b7600e523cab3cfe736cd8e5baf89a048a0b65a`; SHA-256 `b0e6a21cf682f6aad4974cbf27cf23c787e1acfb5549d78e3981c55fa93a6e1a`
- `source_node_registry.v2.jsonl` — Git blob `6199f1dfc8af72470a76145aedf92f840e331cfc`; SHA-256 `0675bb9378d23cb50de483abe093bc71196e8a5955b8945bf728f76637d2dc38`
- `xiao_2027_explanation_provenance.v1.json` — Git blob `24b97cbb13c85359b82fa531058ff546593c3b48`; SHA-256 `f42582cf21e44f2c9bb19c01988e45b5c27e431f45a728ee2ed335ba2c55e899`
- `xiao_2027_question_assets.json` — Git blob `eb97f07022157c4d4714c4be5b6d8045ad070e0c`; SHA-256 `8995be1e40fe9a75fae46693dc0179ac6d27bb6255464387cae85fe1bd62aef1`
- `xiao_2027_questions.jsonl` — Git blob `47d372d73efceef82222a2d418e97a4d8538ba97`; SHA-256 `67cdd96c6fe53eb8b5e879c9e9ed487f58cea60c648e53cd720bd8a2fda9e40d`

Mechanical validation:

- source-side export verified pinned Git blob identities and source SHA-256 values before transfer;
- the transfer artifact digest was independently verified before extraction;
- destination import re-verified all eight Git blob identities and SHA-256 values before commit;
- JSON owner/provenance sidecars parse successfully;
- JSONL cardinalities: questions `1172`; knowledge links `1148`; unified regions `160`; source nodes `19528`.

Explicit Politics exclusions:

- legacy `content/politics/README.md`
- legacy `content/politics/RECOVERY_CONTRACT.md`
- generated `app/product/politics-continuous-coverage.generated.json`
- generated Politics audit/build/runtime/freeze projections named by the owner manifest
- legacy governance/runtime/release trees

**Phase 2 Politics Current is closed.**

## Phase 3 — remaining accepted knowledge owners admitted

The remaining accepted knowledge-owner trees were admitted to the new repository without turning legacy runtime/governance into dependencies. Destination admission commit:

`cfa0a2e5826ab0d2dc076067d28334e938e0af87` — `migrate(content): admit missing legacy knowledge owners`

### Xizong

The accepted Current roots are present under:

- `content/xizong/knowledge/`
- `content/xizong/questions/`
- `content/xizong/question_explanations/`
- `content/xizong/question-relations/`
- `content/xizong/explanations/`

The migrated knowledge tree preserves the stable 159 Block / 2514 canonical KP identity and the separately retained O9 overlay. Newer Current content already present in the destination remains authoritative.

Xizong System ownership is no longer inferred from the old migration snapshot. It is resolved by `content/xizong/knowledge/manifest.json`: a same-system Current `system.json` is the System-level owner; only systems without one continue to use their old System Guide as transitional substrate. Canonical Block Markdown remains the medical Core owner.

### English

The previously admitted Reading owners remain in place, and the remaining accepted durable English owner/support files now include:

- `content/english/provenance.json`
- `content/english/source/global_source_truth.v1.json`

No legacy recovery product is promoted as a runtime fallback.

### LexicalOS

The accepted canonical natural-owner corpus is present under `content/lexical/canonical/` in addition to the representative `content/lexical/words/answer.json`.

Structural admission is semantic-delta-zero. The Current natural-owner audit and L0-first semantic review remain active work inside the new repository and may continue to update Current owners in place.

## Knowledge-asset transfer closure

**Legacy repository knowledge-asset transport is CLOSED.**

The migration dual-read exception is closed for normal work. `kianos-legacy` returns to recovery/reference-only status.

The following are **not migration** and continue only against the new repository `main@HEAD`:

- Xizong system-by-system v6 natural-owner upgrades;
- Lexical full-corpus natural-owner audit and L0-first semantic review;
- Astro projection expansion and UI/function work;
- source repairs or semantic corrections explicitly approved by Chat;
- global QA of Current assets and runtime projections.

These lanes must never use the legacy snapshot as a silent authority or overwrite newer Current content.

## Explicitly not inherited

- legacy `AGENTS.md` / governance control planes
- legacy `runtime/**`
- legacy `releases/**`
- old Site/release infrastructure
- historical Issues as execution authority
- compatibility/fallback snapshots
- learner state or learner databases
- generated/historical Read Planes unless an exact future Current dependency is explicitly admitted
- historical audit/final-gate/control material as semantic owners

## Migration invariant

If new Astro needs a missing asset, fail closed and admit or create the exact Chat-approved Current dependency. Never solve a missing Current asset by broad-copying legacy, reviving a historical owner, or inventing replacement domain semantics.
