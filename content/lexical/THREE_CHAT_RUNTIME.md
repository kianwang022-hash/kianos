# LexicalOS Live Batch Runtime

Status: **ACTIVE canonical execution runtime**  
Semantic authority: `CONTENT_ASSET_CONTRACT.md` + `FINAL_SEMANTIC_FREEZE.md`  
Mechanical live cursor: `content/lexical/execution/live-batch.json`

The old `execution/three-chat-board.json` is retained as historical/compatibility evidence only. **Normal Chats do not read it.**

## 1. User-facing rule

Kian should normally need only:

```text
继续词汇
```

`p` remains an optional explicit approval control when an exceptional Gate is surfaced, but it is no longer required between routine batches under the standing delegation recorded in `CONTENT_EXECUTION.md §3B`.

A/B/C role names may still be used internally, but they are no longer required user controls.

Normal continuation is:

```text
CURRENT.md
→ live-batch.json
→ exact proposal / review bundle / audit pack named by the cursor
→ act
```

Target: **2–3 precise GitHub reads before effective work.** Do not recover state from history or broad repo search when the live cursor resolves it.

## 2. One 100-owner semantic atom

The frozen semantic sequence remains unchanged:

```text
100/100 Fresh Read
→ Self Attack
→ smallest Production proposal
→ standing delegated approval when eligible / exceptional bounded Human Gate otherwise
→ materialize approved/existing-truth delta
→ rebuild 7,946 Final Learner Objects
→ B readback / independent audit
→ bounded reconciliation when needed
→ merge
→ advance
```

Architecture simplification changes **only mechanical handoff**, never the semantic ruler.

## 3. Compact live states

The frontier uses only decision-relevant states:

```text
REVIEW_REQUIRED
HUMAN_GATE_REQUIRED
MATERIALIZE_ALLOWED
READY_FOR_B_READBACK
RECONCILE_ALLOWED
READY_TO_MERGE
BLOCKED
COMPLETE
```

`live-batch.json` owns:

- current frontier;
- at most one lookahead batch;
- Human Gate status;
- materialization receipt pointer;
- B Audit Pack/result pointer;
- next action;
- last closed batch.

Historical batches, old shared claims and execution diaries stay out of the live cursor.

## 4. Delegated approval / exceptional Human Gate

The compact cursor keeps the existing `HUMAN_GATE_REQUIRED` / `APPROVED` mechanics for compatibility, but the normal resolver is now Kian's **standing delegation dated 2026-09-22**. After a batch proposal is frozen and passes Production Self Attack, Chat may record `APPROVED` with that standing approval reference and continue without waiting for a fresh `p`.

A fresh `p` is required only when Chat explicitly surfaces an exceptional Gate because the frozen ruler cannot safely resolve a material new policy boundary, meaning ambiguity or identity ambiguity.

Routine existing-truth corrections, background Form / Identity facts, approved-scope narrowing, FLOB rebuild, validation, audit reconciliation inside the frozen ruler and cursor advancement do not create a new user gate.

## 5. Mechanical automation

### Materialization

`lexical-apply-final-mutation-package.yml`:

- keeps stale-file and semantic-dependency hash guards;
- applies only the explicit approved package;
- rebuilds all 7,946 Final Learner Objects;
- validates duplicates and write scope;
- updates `live-batch.json` to `READY_FOR_B_READBACK` in the same candidate commit.

Chat must not manually poll several intermediate states.

### B result

B writes:

1. one Audit Pack under `content/lexical/semantic-audit/`;
2. one tiny `content/lexical/execution/audit-result.json`.

The audit-result request is mechanical metadata only:

```json
{
  "schema": "kianos.lexical.audit_result.v1",
  "candidate_id": "BFxx",
  "result": "PASS | PASS_WITH_CORRECTIONS | HOLD_FOR_SOL",
  "audit_pack": "content/lexical/semantic-audit/...",
  "correction_ordinals": [],
  "blind_first": "ENFORCED | NOT_ENFORCED"
}
```

The orchestrator:

- PASS → cursor `READY_TO_MERGE`; merge through the normal authorized GitHub writer, then main advances automatically;
- PASS_WITH_CORRECTIONS → cursor `RECONCILE_ALLOWED`; Chat supplies only the exact bounded correction package;
- HOLD_FOR_SOL → fail closed and return to Chat.

Automation never invents semantic corrections.

### Main advance

After a `READY_TO_MERGE` candidate is merged through the normal authorized GitHub writer, main automatically:

- records `last_closed`;
- promotes the one lookahead batch if present;
- otherwise creates the next sequential `REVIEW_REQUIRED` placeholder;
- keeps at most one additional lookahead placeholder.

## 6. B role

B still audits one batch at a time and never mutates Word / Relation / Form truth.

Blind-first independence is used when the Independent Audit Contract requires it. A same-Chat changed-owner readback must label itself `NOT_ENFORCED` and cannot be used as strongest independence evidence.

B's durable output is Audit Pack + audit-result request. B does not reconcile or merge.

## 7. Production roles

A/C remain optional internal producer labels. Both use the same semantic ruler.

They may close multiple consecutive batches in one Chat **serially**, but the live runtime still keeps only the current frontier plus at most one lookahead batch. They do not maintain a multi-batch live backlog or pre-authorize unseen batches. Once a proposal is frozen:

- new material inside the frozen ruler → record the exact delta and use standing delegated approval;
- no new material → mark `NOT_REQUIRED`;
- unresolved material policy/meaning/identity ambiguity → surface one exceptional bounded Gate;
- non-frontier lookahead stays proposal-only;
- canonical mutation remains frontier-serialized.

## 8. Failure behavior

Any of these stops automatically:

- stale Word/Relation/Form hash;
- stale declared semantic dependency;
- exact approval reference missing where required;
- candidate/range mismatch;
- B HOLD;
- merge conflict;
- FLOB count != 7,946;
- write outside the lexical allowlist.

A failure records one compact blocker. Do not create another controller, retry loop, or parallel board.

## 9. Legacy board

`three-chat-board.json` remains readable for historical recovery only during migration. It is not a normal synchronization barrier and must not be loaded on every continuation.

Once all pre-migration branches are retired, it may be archived or deleted in a separate bounded cleanup.

## 10. Merge permission boundary

The repository currently forbids GitHub Actions from creating or approving pull requests.

Therefore the mechanical boundary is intentionally:

```text
B PASS
→ workflow records READY_TO_MERGE
→ normal authorized GitHub writer performs the merge
→ main workflow advances live-batch automatically
```

Do not add a second bot, token workaround, or direct semantic push to main merely to bypass that repository permission. A failed attempt to auto-create a PR is an execution-design defect, not a reason to weaken the permission boundary.
