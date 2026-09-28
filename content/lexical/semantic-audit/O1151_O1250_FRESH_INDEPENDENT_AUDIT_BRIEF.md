# Lexical Baseline-v2 o1151–o1250 — Fresh Independent Audit Brief

Status: READY_FOR_FRESH_INDEPENDENT_AUDIT  
Production candidate: PR #520  
Candidate branch: `work/lexical-continuous-o1151-o1250`

This brief is an entrypoint only. It is not semantic authority and must not leak Production reasoning into blind-first Pass A.

## 0. Mission

Perform the required **fresh Independent Semantic Audit** for the already Human-Gate-approved Baseline-v2 candidate o1151–o1250.

Do not rebuild Production. Do not ask Kian to re-review the 100 owners. Do not edit canonical Word / Relation / Form truth while auditing.

The audit must end with an Audit Pack only. Final semantic reconciliation remains a later step.

## 1. Freeze the measuring head

At audit start:

1. read current `main@HEAD`;
2. read PR #520 current head;
3. freeze the PR head as `owner_read_head`;
4. confirm no relevant contract or candidate write-set drift occurred after the head you freeze.

If unrelated main work advanced, do not restart the audit. Only changed relevant read/write sets or contract instruments invalidate affected conclusions.

## 2. Authority order

Read from current main unless noted:

1. `content/lexical/CONTENT_ASSET_CONTRACT.md`
2. `content/lexical/INDEPENDENT_SEMANTIC_AUDIT_CONTRACT.md`
3. `content/lexical/SEMANTIC_AUDIT_RISK_ROUTER_SPEC.md`
4. `content/lexical/CONTENT_EXECUTION.md`
5. calibration sentinels required by the Audit Contract
6. candidate Word owners + mandatory Relation/Form dependencies from PR #520

Do **not** read Production's detailed handoff before Pass A.

## 3. Blind-first Pass A

Before opening the Production handoff:

- inspect the candidate owners in o1151–o1250 and mandatory dependencies;
- form provisional desired semantic states;
- apply STRICT risk routing;
- record provisional routing/judgment evidence durably enough to prove it predates Production comparison.

Required audit vocabulary:

`PASS / FLIP_TO_UPGRADE / FLIP_TO_NO_CHANGE / REFINE_UPGRADE / IDENTITY_RISK / BLOCKED`

Production upgrades, Form/identity cases, Relation/anchor/Core↔sense cases and complex NO_CHANGE are mandatory review. Simple NO_CHANGE follows the deterministic fast-gate + deep-sample rule.

## 4. Pass B

Only after Pass A, open:

`content/lexical/execution/manifests/o1151-o1250.production-handoff.md`

Then compare the provisional judgments with Production and emit final audit verdicts.

Do not inherit Production rationale as evidence.

## 5. Candidate facts already authorized by Human Gate

These are **not audit conclusions**; they describe the scope that Kian already authorized Production to materialize:

- 100/100 owners fresh-read in Production;
- 24 Word owners mutated;
- 76 Word owners NO_CHANGE;
- 5 new Relation owners;
- 8 Repair Test blueprints;
- 0 BLOCKED;
- 0 learner UI/runtime changes;
- Final Learner Objects rebuilt successfully to 7,946 objects.

The Independent Auditor must still challenge every required stratum.

## 6. New-scope rule

If audit finds a defect that only narrows/removes/refines the already approved learner intent, report the correction normally.

If audit discovers **genuinely new material semantic scope** that was absent from the Human-Gate report:

- do not mutate it;
- mark it as a bounded delta requiring a small extra Human Gate;
- do not reopen the whole o1151–o1250 batch.

## 7. Output

Write one Audit Pack under:

`content/lexical/semantic-audit/`

It must satisfy the coverage denominators and instrument hashes required by `INDEPENDENT_SEMANTIC_AUDIT_CONTRACT.md`, including:

- scope owners;
- production UPGRADE reverse-review coverage;
- Form/identity coverage;
- Relation/anchor/Core↔sense coverage;
- complex NO_CHANGE coverage;
- simple NO_CHANGE fast-gate + deterministic deep sample;
- unique mandatory owners;
- false-pass / over-upgrade / refine rates;
- LOCAL / MATERIAL / IDENTITY finding counts;
- blind-first status;
- content/audit/router instrument SHAs;
- Production handoff blob SHA;
- owner_read_head and pre_write_head;
- final batch result: `PASS / PASS_WITH_CORRECTIONS / HOLD_FOR_SOL`.

Stop after the Audit Pack. Do not reconcile or merge PR #520 in the auditor Chat.
