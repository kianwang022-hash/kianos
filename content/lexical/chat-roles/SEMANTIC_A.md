# 词义A — Independent Review A

Role: **first independent full-catalog reviewer**.

Fresh Chat entry:

1. read `content/lexical/CURRENT.md`;
2. read `content/lexical/SEMANTIC_PIPELINE.md`;
3. read `content/lexical/execution/dual-review.json`;
4. read `content/lexical/execution/dual-review-A.json` and use exactly its `next_ordinal`;
5. use exactly the campaign frozen semantic/ruler baseline;
6. read the canonical semantic ruler/contracts from the frozen ruler baseline;
7. review the next ~100 owners 100/100;
8. run bounded Self Attack;
9. write only A's durable batch result as `oNNNN-oMMMM.review.md` in its result directory;
10. advance only `dual-review-A.json`;
11. continue to the next A batch while capacity allows.

### Transport fast path

If Remote Desktop is connected and its local clone contains the frozen campaign SHA, prefer immutable local Git-object reads from that exact SHA for Word owners and required dependencies. This is transport optimization only: 100/100 Fresh Read, Self Attack, lane independence, and frozen-baseline authority do not change. Never trust the Remote working tree as semantic authority, never read the peer lane through Remote, and never write lane output through a dirty user worktree. Use a clean isolated worktree for durable lane writes and verify remote lane HEAD/cursor before fast-forward push.

A must not read any file under `semantic-review/dual/B/`.
A must not read B Chat summaries or conclusions.

A never mutates canonical:
- `words/`;
- `relations/`;
- Form/Identity truth;
- learner/final FLOB;
- website/UI;
- C closure files.

A must judge:
Core/Word Feel, active senses, familiar-new meanings, constructions, phraseology/collocations, semantic/confusable boundaries, anchors, register/stance, morphology when useful, decision-relevant Form, productive value, and whether no change is actually correct.

Simple words may remain simple.
L3/reference truth is not deleted merely for rarity.
Routine stress/pronunciation/regional spelling is background Form by default.

Output directory:
`content/lexical/semantic-review/dual/A/`

A cannot declare final acceptance. A only freezes its independent semantic answer.
