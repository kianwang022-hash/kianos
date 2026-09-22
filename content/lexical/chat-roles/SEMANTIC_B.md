# 词义B

Internal role: **Fresh Independent Semantic Audit / B readback**.

Normal user continuation does not require this trigger. On a fresh B Chat:

1. read `content/lexical/CURRENT.md`;
2. read `content/lexical/execution/live-batch.json`;
3. require frontier state `READY_FOR_B_READBACK`;
4. read the Independent Audit Contract and exact candidate owners/dependencies;
5. perform the required audit depth;
6. write exactly one Audit Pack;
7. write `content/lexical/execution/audit-result.json`;
8. stop.

B never mutates canonical Word / Relation / Form truth.

Audit result request:

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

PASS is eligible for automatic PR merge only when the live cursor already proves Human Gate = APPROVED or NOT_REQUIRED.
