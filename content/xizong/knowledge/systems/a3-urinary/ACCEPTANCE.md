# Xizong A3 Urinary Acceptance

Status: CURRENT  
Scope: A3 Urinary  
Standard: root `LEARNING_ACCEPTANCE.md`  
Role: A3 scoped Acceptance Truth

This file owns current S/K/L/P/R/E/U readiness claims for A3 Urinary.

It does not own medical Core, lane learning semantics, Work Cursor, or Kian's private learner state.

---

## Gate status

```text
S  PASS — CURRENT_RECONSTRUCTION
K  UNTESTED at System level
L  UNTESTED
P  UNTESTED
R  UNTESTED
E  UNTESTED
U  UNTESTED by every real learner path
```

Current allowed conclusion:

> **A3 Source is accepted. Current official-question System scope is a deterministic 243-question owner reconciled against Current Question Truth, with inventory SHA256 `bd8082bf9b82d00411f5d3dcaa09f56626c0c08b688e108f728f7da6e2f9b84e`. The accepted system-below Knowledge substrate remains 14 Blocks / 257 stable KPs / 75 Logic Groups. A3 as a whole is not yet System-ready because System-level K and every downstream gate remain untested.**

---

## Current evidence boundary

- Current System question-scope owner → `content/xizong/knowledge/learner/a3-urinary-question-scope.json`.
- Owner authority → `CHAT_APPROVED_CURRENT_RECONSTRUCTION`; this is explicitly not a claim that the old historical bytes were recovered exactly.
- Accepted Current membership → **243 unique official-question IDs, 2005–2026**.
- Runtime-sorted membership inventory SHA256 → `bd8082bf9b82d00411f5d3dcaa09f56626c0c08b688e108f728f7da6e2f9b84e`.
- Current Question Truth → **3750 immutable IDs**, inventory SHA256 `0abc1a3cadbb41b36808fe86ff58c21ede6f4297312e9fb4c2da62b865ef2c82`.
- The Current owner preserves System membership only. It does **not** infer Question→Block, Question→LogicGroup or Question→KP relations.
- The 14 canonical urinary Blocks remain the accepted System-below boundary: **14 Blocks / 257 stable KPs / 75 Logic Groups**.
- Historical HLK evidence is retained as reconstruction/reconciliation provenance: reviewed urinary range count 243, reviewed one-primary-route / no-ownership-violation / no-source-gap guarantees, and recovered 243-question candidate membership.
- `HLK_SYSTEM_QUESTION_INDEX_v1.jsonl` raw bytes were located but could not be materialized for a fresh re-hash because the source transport returned 403. The Current owner records that limitation and does not promote the locator into exact Current authority.

---

## Gate boundary

### S — PASS

Closure path used: **Path B — bounded Current reconstruction**.

Accepted owner:

`content/xizong/knowledge/learner/a3-urinary-question-scope.json`

Acceptance basis:

1. the recovered reviewed HLK resolver candidate supplies the exact 243-question membership set rather than a count-only guess;
2. historical urinary range/source authority covers the same 2005–2026 official-question window and all 14 accepted A3 Block identities;
3. historical QA records one primary route per canonical ID, no ownership violation, no source-gap violation and unchanged canonical content;
4. the recovered candidate is reconciled to the Current immutable `xizong-official-YYYY-nNNN` namespace;
5. the Current owner defines explicit inclusion/exclusion rules and records zero unresolved membership ambiguities and zero delta from the recovered candidate;
6. Current runtime validation expands the owner deterministically and resolves every selected ID from Current Question Truth.

Validation evidence on branch commit `e5f3afc34844e3a168e98c2d0f4fd8f157ef99c2`, GitHub Actions run `34713324100`:

- `Validate A1 learner contract` → PASS;
- `Validate A3 owner and inventory` → PASS;
- `Validate A3 Current Question Truth resolution` → PASS;
- `Validate A3 boundary and provenance` → PASS;
- `Validate A2 runtime contracts` → PASS;
- `Build Astro` → PASS.

Important gate-order invariant discovered during closure:

> **S must not require accepted System-level K.** A3 `system.json` correctly remains `K_WORKING_SYSTEM_TOP / WORKING_A3_SYSTEM_K_NOT_ACCEPTED`; Source validation therefore uses the stable System identity from the S owner rather than requiring the K-level System owner to be `CHAT_APPROVED` first.

This preserves the intended order `S → K → L → P → R → E → U` and prevents Source acceptance from silently depending on a later gate.

### K — UNTESTED at System level

Earliest unresolved gate.

The 14 Blocks are accepted substrate, but the urinary mother model / failure modes / judgment axes / dependency route / System Recall skeleton have not yet received formal System-level K acceptance. The working `system.json` remains a candidate until it is audited against the accepted Blocks and promoted deliberately.

S closure does not itself authorize K promotion.

### L / P / R / E / U — UNTESTED

Frozen downstream. Do not treat A3 as learner-ready and do not infer that Kian has started Urinary.

---

## Truth boundaries

### Artifact Truth

- accepted Source scope owner → `content/xizong/knowledge/learner/a3-urinary-question-scope.json`
- transitional System substrate → `content/xizong/knowledge/system-guides/西综泌尿系统_System_Guide_v1_完整导学_认知依赖与学习顺序.md`
- working System-top candidate → `content/xizong/knowledge/systems/a3-urinary/system.json`
- canonical medical Core → `content/xizong/knowledge/systems/a3-urinary/blocks/`
- consolidated system-below learning support → `content/xizong/knowledge/learner/a3-urinary-learning.json`
- B5 admitted external source boundary → `content/xizong/knowledge/learner/a3-urinary-b05-external-source-contract.json`
- Current Question Truth → `content/xizong/questions/`

### Learner Truth

Private learner/browser/conversation evidence only. This acceptance does not mean Kian has started Urinary.
