# Lexical Quality-First Execution Rule — 2026-09-22

Status: **ACTIVE / CANONICAL EXECUTION RULE**

This rule optimizes throughput without reducing the semantic standard in `FINAL_SEMANTIC_FREEZE.md`.

## 1. Semantic atomic unit

**100 ordinals is the fixed semantic atomic batch.**

Every 100-word checkpoint must independently complete:

```text
100/100 Fresh Read
→ Self Attack
→ per-owner PRESERVE / affected judgment
→ bounded Production proposal
→ exact Human Gate only if genuinely new learner material exists
```

No 500-word or 1,000-word block may replace these independent 100-word judgments.

The final catalog tail may be shorter than 100.

## 2. Quality takes precedence over throughput

Speed may come from reducing duplicated engineering work, never from:

- sampling instead of reviewing all owners;
- combining 500 words into one semantic judgment;
- weakening Self Attack;
- skipping Human Gate for new knowledge;
- skipping post-materialization B readback;
- treating workflow green as semantic PASS;
- mutating PRESERVE owners for stylistic symmetry.

When quality and speed conflict, **quality wins**.

## 3. 500-word campaign is progress grouping only

A 500-word campaign may group five consecutive 100-word checkpoints for progress reporting.

It is **not**:

- one Fresh Read unit;
- one Self Attack unit;
- one Production judgment surface;
- one undifferentiated B-audit unit.

Each internal 100-word checkpoint retains its own manifest/matrix and defect accounting.

## 4. Engineering aggregation

Default safe path remains one 100-word checkpoint per materialization.

Adjacent completed checkpoints may share one engineering materialization/rebuild only when **all** of the following are true:

- every included 100-word checkpoint already has frozen 100/100 Production judgment;
- no included checkpoint is waiting for Human Gate;
- no included checkpoint introduces a new canonical Relation owner;
- no included checkpoint has unresolved remote/shared dependency risk;
- no checkpoint has unresolved Production ambiguity or BLOCKED owner.

Engineering aggregation limit: **200–300 words maximum**.

Aggregation does not merge semantic records: receipts and B readback must still identify results by their original 100-word checkpoint.

Any checkpoint with Human Gate, new Relation, material cross-owner dependency, or unusually complex reconciliation remains standalone.

## 5. B audit remains checkpoint-specific

After materialization:

- read back every changed owner, not a sample;
- evaluate each original 100-word checkpoint separately;
- automatic postcondition checks may accelerate detection but cannot replace semantic readback;
- if one checkpoint fails B, reconcile only the responsible checkpoint/owners;
- do not reopen adjacent PASS checkpoints merely because they shared an engineering rebuild.

A shared rebuild therefore never creates a shared semantic PASS.

## 6. Review-ahead window

To use CI/GitHub waiting time efficiently, Review may lead Materialization by at most:

```text
2 atomic checkpoints = 200 words
```

Review-ahead may create frozen proposals only.

It may **not**:
- bypass an earlier Human Gate;
- materialize or merge beyond the blocked canonical frontier;
- cause later review judgments to rewrite an earlier checkpoint's frozen ruler.

If the backlog reaches two reviewed-but-unmaterialized checkpoints, stop review-ahead and close the earlier frontier first.

## 7. Human Gate semantics

Human Gate remains exact-scope:

- existing-truth correction/migration does not require repeated approval;
- genuinely new learner knowledge does require Kian approval;
- approval token `p` covers only the explicitly presented new-knowledge items for that checkpoint;
- silence or unrelated approval does not authorize new material.

## 8. Fixed stop rule

This quality-first rule remains active through `o7946` unless Kian explicitly changes it.

Do not optimize further by enlarging the semantic atomic batch beyond 100 without a new explicit Kian instruction.
