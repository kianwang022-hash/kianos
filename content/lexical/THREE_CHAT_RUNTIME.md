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

After bootstrap o0001–o0100:

- A owns: o0101–o0200, o0301–o0400, o0501–o0600, o0701–o0800, o0901–o1000, o1101–o1150.
- C owns: o0201–o0300, o0401–o0500, o0601–o0700, o0801–o0900, o1001–o1100.

This is an allocation rule only. It does not authorize mutation out of frontier order.

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

## 6. Shared-owner concurrency rule

Before A or C proposes a cross-range Relation/Form mutation:

1. inspect the live board;
2. inspect current main and the other in-flight producer's declared shared write-set if present;
3. if both lanes touch the same shared Word / Relation / Form owner, later lane becomes `SHARED_OWNER_WAIT`;
4. never resolve the collision by independently writing two competing shared-owner versions.

Shared-owner truth is reconciled only against the latest accepted main.

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
