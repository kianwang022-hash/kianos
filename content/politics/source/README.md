# Politics Source Truth

This directory owns Current source-faithful Politics facts. Learning semantics, repair decisions and private learner state are separate layers.

## Source consumption rule

Large recovery/source monoliths are not runtime APIs. Current exact-ID consumers should use deterministic scoped projections generated from the monoliths and verified losslessly.

### Xiao1000 Question Truth

Canonical recovery input remains `xiao_2027_questions.jsonl` during migration. Its scoped projection lives under:

`questions/shards/<subject>/<kind>/qNNN-NNN.json`

Each question shard has a fixed width of 25 source question numbers and is keyed by immutable source `question_id` such as `xiao_2027_marx_single_028`. Given that ID, the shard path is computable; no repository search or global question-bank scan is required.

Question Truth contains source-faithful question facts only. Natural Unit ownership, Question→node/KP mappings, learner attempts, review debt and mastery do not belong in these shards.

### Source Node Truth

Canonical recovery input remains `source_node_registry.v2.jsonl` during migration. Its scoped projection lives under:

`nodes/shards/<source>/<subject>/<chapter|page|root>.json`

Stable source-node identity determines the smallest practical source partition. Exact Chengfeng owners such as `POL27-CF-MARX-C02-K03` therefore resolve to one chapter-scoped shard instead of requiring a 21 MB registry scan.

## Migration contract

`content/politics/tools/build-source-shards.mjs` is the only generator for these projections.

A shard migration is admissible only when `source-shard-audit.json` proves:

- identical immutable ID count;
- no duplicate or missing IDs;
- canonical row-content digest parity after parse/re-serialization;
- no added learning semantics.

Until runtime/audit consumers are cut over and parity remains green, the monoliths stay recovery authority. After cutover they may remain archival/recovery inputs, but they must not be treated as a competing learner-runtime owner.
