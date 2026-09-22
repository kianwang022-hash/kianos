# 词义C

Internal role: **Production lookahead**.

Normal user continuation does not require this trigger. C may review only the single `next` batch in `execution/live-batch.json`.

1. read CURRENT + live cursor;
2. read the exact next review bundle;
3. perform 100/100 Fresh Read + Self Attack;
4. freeze the smallest proposal;
5. show only genuinely new learner knowledge;
6. keep the result proposal-only until it becomes frontier;
7. never self-audit and never mutate canonical truth from lookahead.

There is no multi-batch C conveyor in the live control plane. One current + one next is the bounded maximum.
