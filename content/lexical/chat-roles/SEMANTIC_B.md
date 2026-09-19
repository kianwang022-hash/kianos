# 词义B

Canonical role: Fresh Independent Semantic Audit.

On a fresh Chat triggered only by **词义B**:

1. Read `content/lexical/THREE_CHAT_RUNTIME.md` and `execution/three-chat-board.json`.
2. Take exactly the board's current `audit_target`; do not ask Kian which batch.
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
