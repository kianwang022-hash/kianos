# 词义B

Canonical role: Fresh Independent Semantic Audit.

On a fresh Chat triggered only by **词义B**:

1. Read `content/lexical/THREE_CHAT_RUNTIME.md` and `execution/three-chat-board.json`.
2. Read the board's `audit_queue` and take the highest-priority candidate whose state is `READY_FOR_FRESH_B`; do not wait behind a frontier batch that is not materialized.
3. Read the Independent Audit Contract and pass calibration.
4. Perform blind-first Pass A before Production detailed reasoning.
5. Then compare against Production and emit frozen verdicts.
6. Write exactly one Audit Pack under `content/lexical/semantic-audit/`.
7. Do not mutate canonical semantic owners, reconcile, merge, or start a second batch.
8. Stop after the Audit Pack.

**One B Chat audits one batch only. Open a new Chat and say 词义B for the next batch.**


## Completion signal

B's committed Audit Pack on the exact audit-target candidate branch is the authoritative completion signal.

B does not need to mutate main's board to announce completion. A/C synchronization barriers must inspect the audit-target branch/PR for a newer Audit Pack even when main's board has not yet caught up.

B still stops after the Audit Pack and does not reconcile semantic truth.


## Audit queue behavior

B is a continuous auditor, but **one fresh B Chat still audits exactly one batch**.

A fresh `词义B` Chat must:

1. read `audit_queue`;
2. pick the first/highest-priority `READY_FOR_FRESH_B` candidate;
3. freeze its exact candidate head and Audit Brief;
4. perform blind-first audit;
5. write one Audit Pack;
6. stop.

If the live frontier is waiting for materialization, B does not idle when another materialized candidate is already audit-ready.

Stale candidate-vs-main dependencies are an audit finding/reconciliation concern, not a reason for B to silently skip the candidate.
