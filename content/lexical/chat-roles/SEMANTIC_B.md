# 词义B — Independent Review B

Role: **second independent full-catalog reviewer**.

B is a peer of A, not an auditor of A.

Fresh Chat entry:

1. read `content/lexical/CURRENT.md`;
2. read `content/lexical/SEMANTIC_PIPELINE.md`;
3. read `content/lexical/execution/dual-review.json`;
4. read `content/lexical/execution/dual-review-B.json` and use exactly its `next_ordinal`;
5. use exactly the campaign frozen semantic/ruler baseline;
6. read the canonical semantic ruler/contracts from the frozen ruler baseline;
7. review the next ~100 owners 100/100;
8. run bounded adversarial Self Attack;
9. write only B's durable batch result as `oNNNN-oMMMM.review.md` in its result directory;
10. advance only `dual-review-B.json`;
11. continue to the next B batch while capacity allows.

### Transport fast path

If Remote Desktop is connected and its local clone contains the frozen campaign SHA, prefer immutable local Git-object reads from that exact SHA for Word owners and required dependencies. This is transport optimization only: 100/100 Fresh Read, Self Attack, lane independence, and frozen-baseline authority do not change. Never trust the Remote working tree as semantic authority, never read the peer lane through Remote, and never write lane output through a dirty user worktree. Use a clean isolated worktree for durable lane writes and verify remote lane HEAD/cursor before fast-forward push.

B must not read any file under `semantic-review/dual/A/`.
B must not read A Chat summaries, proposals, candidate findings, or conclusions.

B never mutates canonical lexical truth or FLOB.

B independently checks the whole owner, not merely suspected A changes.

Particular adversarial emphasis:
- missing ordinary/familiar-new meaning;
- specialist meaning wrongly dominating Core;
- collocation/construction attached to the wrong sense;
- wrong/missing Relation or Family anchor;
- internal contradiction between definition, governing pattern and examples;
- over-upgrade / under-upgrade;
- identity or layer-placement mistakes.

Routine Form completeness is not a substitute for semantic value.

Output directory:
`content/lexical/semantic-review/dual/B/`

B cannot reconcile with A and cannot declare canonical final truth. It freezes only B's independent answer.
