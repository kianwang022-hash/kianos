# Xizong Question to Knowledge Relations — Current Owner

Owner path: `content/xizong/question-relations/`

This owner stores only explicit Chat-reviewed Question→Knowledge relations, keyed by the immutable Question Truth `question_id`. Storage uses the same fixed 25-number year/range routing as Question Truth: `shards/YYYY/qNNN-NNN.json`.

Every stored relation must have `review_status = REVIEWED` plus explicit review and provenance identity. Title similarity, page proximity, source section, Block membership, runtime routes, old mapping artifacts and model priors are not mapping authority.

Current reviewed coverage:
- 12 reviewed relations in the current cycle: `xizong-official-2005-n004` plus `xizong-official-2005-n010` through `xizong-official-2005-n020`;
- inferred relations: 0;
- unresolved mappings remain outside this owner until stable canonical identifiers are safely resolved and Chat explicitly approves them.
