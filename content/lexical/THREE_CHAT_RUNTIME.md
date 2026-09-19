# LexicalOS Three-Chat Semantic Runtime

Status: **ACTIVE orchestration authority for final-standard backfill**  
Semantic authority remains: `CONTENT_ASSET_CONTRACT.md`  
Execution authority remains: `CONTENT_EXECUTION.md`  
Independent audit authority remains: `INDEPENDENT_SEMANTIC_AUDIT_CONTRACT.md`  
Live allocation board: `content/lexical/execution/three-chat-board.json`

This file exists so Kian can open a fresh Chat and say only:

- **词义A**
- **词义B**
- **词义C**

The Chat must recover its exact role and current assignment from GitHub. Kian must not have to restate the batch, rules, or previous progress.

## 1. The three roles

### 词义A — Production A + frontier integration

A is a semantic Production lane, not a mechanical worker.

A:
- performs final-standard fresh owner/module judgment;
- performs mandatory same-Chat Self-Adversarial Attack;
- prepares the smallest post-attack delta proposal;
- asks Kian only for genuinely new material semantic scope;
- owns reconciliation/materialization/merge for A-owned batches after a fresh B audit;
- during bootstrap, A also owns reconciliation of the already-created o0001–o0100 candidate after B audits PR #525.

A does **not** independently audit its own candidate.

### 词义B — Fresh Independent Audit

B is a semantic adversarial reviewer, not a mechanical executor.

B:
- audits exactly one candidate batch per fresh Chat;
- uses blind-first Pass A before opening Production's detailed reasoning;
- writes only the Audit Pack allowed by `INDEPENDENT_SEMANTIC_AUDIT_CONTRACT.md`;
- does not mutate canonical Word / Relation / Form truth;
- does not reconcile or merge;
- stops after the Audit Pack.

**One B Chat = one batch.**  
For the next candidate, open a brand-new Chat and say **词义B** again.

This preserves reviewer freshness while keeping the user-facing trigger stable.

### 词义C — Production C + one-batch lookahead

C is a second semantic Production lane using the same ruler as A.

C:
- fresh-reads its allocated disjoint batch;
- performs Self-Adversarial Attack;
- prepares the post-attack delta proposal;
- may reach the Human Gate while another batch is being audited;
- owns reconciliation/materialization/merge for C-owned batches after their fresh B audit.

C does **not** independently audit its own candidate.

## 2. Why A and C may work together without corrupting main

A and C may perform semantic review in parallel, but canonical semantic mutation is **frontier-serialized**.

**Important:** assigning A from the low end and C from the high end reduces ordinary Word-batch overlap only. It does **not** solve cross-word Relation/Form concurrency. A Relation can connect any two ordinals, so Relation/Form truth follows the shared-owner protocol below, never lane geography.

Rule:

```text
parallel:
A semantic review of frontier / near-frontier batch
C semantic review of one lookahead batch
B fresh audit of already-materialized candidate

serialized:
main mutation / shared Relation reconciliation / FLOB acceptance
```

Only the batch marked `MATERIALIZE_ALLOWED` on the live board may write canonical semantic owners.

A later batch may proceed through:

```text
review bundle
→ fresh judgment
→ Self Attack
→ stabilized proposal
→ bounded Human delta Gate
→ WAIT_FOR_FRONTIER
```

It must then re-freeze against the latest main before materialization. This prevents stale candidate branches from overwriting earlier Relation, Form, manifest, or Final Learner Object changes.

## 3. Producer allocation during o0001–o1150 backfill

The semantic review lanes now approach from opposite ends to reduce ordinary Word-batch collision:

- **A moves low → high**.
- **C moves high → low**.
- the already-completed C lookahead `o0201–o0300` is preserved and is **not** redone.

Current review allocation after the preserved batches:

```text
A: o0101–o0200 → o0301–o0400 → o0401–o0500 → o0501–o0600 → o0601–o0700
C: o1101–o1150 → o1001–o1100 → o0901–o1000 → o0801–o0900 → o0701–o0800
preserved C work: o0201–o0300
```

Allocation is only about who performs the fresh Word review. It never grants ownership of a cross-word Relation/Form object and never authorizes stale canonical mutation.

## 4. Human Gate rule

Backfill is not a full re-approval of old content.

For each batch:

- old accepted Current is PRESERVE by default;
- bounded corrections inside already-approved learner intent do not require a new broad Human Gate;
- genuinely new material semantic scope is shown to Kian as a small delta;
- one `p` approves only that explicit delta plus its stated Test changes and mechanical closure;
- no routine second Human Gate is inserted.

## 5. Test rule

Every producer must apply:

> worth knowing ≠ worth prebuilding Test ≠ future Repair debt

Backfill must actively challenge old blueprint inflation. Removing a prebuilt Test does not delete canonical Content.

## 6. Shared semantic dependency concurrency rule

A/C ordinal allocation owns only the **primary Word review range**. It does not give either lane private ownership of semantically related truth elsewhere.

A shared semantic dependency includes any current truth whose change could invalidate a batch judgment, including:

- another Word or Sense used to define a boundary;
- Family / morphology target;
- Form / identity or regional spelling boundary;
- Construction / phraseology ownership;
- Relation / confusable / semantic-neighbor truth;
- Repair Test target identity;
- shared layer-placement or lifecycle truth that a proposal relies on.

A/C may discover the same dependency independently. The first durable action is to publish a **shared semantic claim** on the live board. Claims are keyed by the semantic boundary/participants, not merely by one JSON file.

Rules:

1. before freezing a proposal, read `shared_semantic_claims` and the other lane's declared dependency/write set;
2. if an equivalent boundary is already claimed, do not invent a competing semantic model from stale context;
3. compatible discoveries coalesce as consumers of one shared truth;
4. material disagreement becomes `SHARED_SEMANTIC_RECONCILE_REQUIRED`; neither lane lands the affected dependency before reconciliation;
5. a claim is not permanent ownership; it is only a coordination record;
6. actual semantic mutation remains serialized at the live frontier and must refreeze against latest `main`;
7. the Final Mutation Package must include a `semantic_dependency_read_set` of exact file SHA256 values for every dependency whose current truth materially supports the mutation;
8. the executor rejects the package with `STALE_SEMANTIC_DEPENDENCY` if any declared dependency changed after reconciliation, even when the changed file is not itself in the write set;
9. after one batch lands shared truth, later batches reread latest main and reuse/drop/revise their stale duplicate intent.

Thus:

```text
parallel semantic review
→ declare semantic dependencies / shared claims
→ coalesce or reconcile
→ latest-main refreeze
→ one serialized write
→ dependency-hash guard
→ later lanes follow accepted truth
```

Opposite-direction A/C review reduces ordinary Word overlap. **Dependency reconciliation + latest-main refreeze + executor dependency hashes are the correctness mechanism.**

## 6A. `p` is a synchronization barrier

A user message `p` never means “blindly continue from this Chat's cached state”.

Before A or C consumes a `p`, it must freshly read:

1. current `main@HEAD`;
2. `content/lexical/execution/three-chat-board.json`;
3. the current frontier candidate PR head;
4. the current B audit target branch/PR for a newer Audit Pack, even if the board is stale;
5. the other Production lane's current write-set / semantic dependency set / shared semantic claims;
6. its own frozen proposal identity.

Then resolve in this order:

```text
record the user's approval against the still-current proposal
→ if B has completed the live frontier audit, switch first to frontier reconciliation
→ if any shared semantic dependency changed, coalesce/reconcile before materialization
→ only then materialize a candidate that is currently allowed
```

If the proposal itself materially changed since it was shown to Kian, the old `p` cannot authorize the changed semantic delta; show only the new bounded delta.

This synchronization barrier exists specifically because separate Chats do not receive each other's messages in real time. GitHub is the rendezvous point.

## 7. Fresh-chat boot sequence

For **词义A** or **词义C**:

1. read `AGENTS.md` if present;
2. read `content/lexical/CURRENT.md`;
3. read this runtime;
4. read `execution/three-chat-board.json`;
5. read `CONTENT_ASSET_CONTRACT.md`, `CONTENT_EXECUTION.md`, and current batch owners;
6. execute the assigned action without asking Kian to repeat the batch.

For **词义B**:

1. read `AGENTS.md` if present;
2. read `content/lexical/CURRENT.md`;
3. read this runtime and the live board;
4. read `INDEPENDENT_SEMANTIC_AUDIT_CONTRACT.md` and calibration sentinels;
5. freeze the current audit target from the board;
6. perform blind-first Pass A **before** opening Production's detailed handoff;
7. write the Audit Pack and stop.

## 8. Current bootstrap order

The live board is authoritative, but the intended starting pipeline is:

```text
B: audit o0001–o0100 candidate PR #525
A: prepare o0101–o0200 under final standard
C: prepare o0201–o0300 under final standard
```

After B finishes o0001–o0100, A reconciles/merges that candidate and advances the board.

The already-built o1151–o1250 candidate PR #520 remains preserved and must receive its own fresh B audit/reconciliation before merge. It must be re-materialized against the then-current main if prior accepted backfill changed relevant owners or derived Final Learner Objects.

## 9. Mechanical executor is not a fourth semantic Chat

Mechanical GitHub workflows/scripts do not count as a semantic reviewer and may not decide meanings, layer placement, owner placement, or Test worth.

The normal mechanical path is now used at **both** write stages:

```text
A/C Production
→ Kian bounded delta Gate
→ when frontier allows: Final Mutation Package
→ GitHub mechanical executor
→ approved candidate + 7,946 FLOB rebuild
→ fresh B Independent Audit
→ A/C semantic reconciliation
→ if corrections are needed: second bounded Final Mutation Package
→ GitHub mechanical executor
→ corrected candidate + 7,946 FLOB rebuild
→ candidate PR / explicit final merge
```

If B returns a clean PASS with no semantic mutation required, the second package is unnecessary.

The mechanical executor is:

- `tools/lexical_apply_final_mutation_package.py`
- `.github/workflows/lexical-apply-final-mutation-package.yml`

It is deliberately fail-closed and never merges `main`.

Therefore A/C should not spend normal semantic turns manually transporting many JSON files either after Human approval or after reconciliation. They emit one exact mutation package for each actually needed write stage; GitHub performs the mechanical landing. Direct Chat writes are a fallback for executor defects, not the normal path.
