# Xizong Question Crosswalk — Relation Model Calibration

Status: CURRENT  
Stage: C0 PASS  
Date: 2026-09-16  
Authority: `content/xizong/question-relations/` + Current Question Truth + Current Knowledge owners

## Result

The existing `schema.json` is sufficient for progressive Question→Knowledge compilation. C0 does **not** add a new relation schema or a second truth owner.

Canonical direction remains:

```text
Question
  → System
  → Block
  → Logic Group (when reviewed and useful)
  → primary KP
  → supporting KP(s) (when independently justified)
  → reviewed bridge target ref(s) (rare, reviewed only)
```

Reverse discovery is always derived from these reviewed rows by the product consumer. It is never authored as a second mapping database.

## What belongs in this owner

A relation row may carry only reviewed Question→Knowledge routing facts:

- `system_id`
- `block_id`
- `logic_group_id`
- `primary_kp_id`
- `supporting_kp_ids`
- `reviewed_bridge_target_refs`
- provenance and review basis

These target fields remain optional because **no safe mapping is a legal Current state**.

The following do not belong here:

- question/task type — already owned by Question Truth;
- answer/exam decision axis/transfer rule — already owned by Explanation;
- option-level misconception graphs — deferred unless real learner U earns them;
- inferred targets from titles, nearby pages, source proximity, legacy labels, or model priors.

## Explanation `mapping_decision` boundary

`content/xizong/explanations/**.mapping_decision` is a review-routing snapshot, not canonical relation state.

Rules:

1. A Current `REVIEWED` row under `question-relations/` is the only positive mapping truth.
2. `NEEDS_CHAT_MAPPING_REVIEW` may be used only as a mechanical backlog-selection hint. It does not enter the anti-anchored default packet, does not itself create a relation, and must not bias the reviewer toward a target.
3. `NO_SAFE_MATCH` remains absent by default.
4. A former `NO_SAFE_MATCH` may be explicitly re-reviewed when Current Knowledge changes or an explicit high-value need reopens it. If a safe target is then approved, the new relation row must record that re-review basis rather than pretending the old judgment never existed.
5. Review tooling must always exclude already-reviewed qids, even if an older Explanation still contains a stale routing hint.

This prevents Explanation from becoming a shadow Mapping Truth.

## Heterogeneous calibration set

| Case | Calibration role | Outcome |
| --- | --- | --- |
| `xizong-official-2005-n008` | simple single-target relation | existing reviewed Respiratory Block/KP route proves the minimal row works |
| `xizong-official-2005-n033` | primary + supporting KP | existing row uses `primary_kp_id` plus one independently justified `supporting_kp_id`; no extra schema required |
| `xizong-official-2005-n126` | shared-option B-type clinical mechanism question | Question Truth owns `shared_option_group`; relation stays focused on the knowledge return target |
| `xizong-official-2005-n134` | X-type multi-select | Question Truth owns multi-select task semantics; relation remains ordinary reviewed routing |
| `xizong-official-2005-n143` | discrimination / differential boundary | one reviewed owner can route a multi-option discrimination problem without duplicating distractor semantics into Crosswalk |
| `xizong-official-2005-n131` | cross-axis / potentially cross-Block candidate | stays unmapped until Chat review identifies a smallest sufficient owner; cross-system breadth is not permission to guess several targets |
| `xizong-official-2005-n037` | no-safe-match negative sample | remains absent; lack of a canonical owner is represented by no relation row |
| `xizong-official-2005-n042` | explicit re-review after Knowledge evolution | old `NO_SAFE_MATCH` is reopened because Current B4 now has stable projectable KP18 with the exact embolus-definition boundary |
| `xizong-official-2005-n044` | ordinary C1 review candidate | `NEEDS_CHAT_MAPPING_REVIEW` resolves cleanly to Current B5 KP26 (LAD most common) |

The sample set deliberately contains both positive and negative cases. C0 is a decision-boundary calibration, not a coverage exercise.

## C0 decisions

### D1 — schema v1 stays frozen

No field addition is required before broader compilation.

### D2 — semantic depth is selective

Most questions need only one primary KP. Supporting KPs and bridges are added only when the question genuinely depends on independently reviewable knowledge targets.

### D3 — no-safe remains first-class

A missing relation is not debt by itself and never blocks practice. It only withholds precise routing and reverse lookup for that question.

### D4 — candidate generation may automate discovery, never semantics

C1 may use old Explanation routing state only to find backlog candidates. The **anti-anchored default packet** shown to the reviewer contains Question Truth plus non-semantic workflow/provenance metadata, while withholding old Explanation semantics, old `mapping_decision`, and prior System/Block/LG/KP targets until the reviewer has formed an independent provisional judgment.

The required review order is:

```text
Question Truth
→ independent solve / provisional exam target + decision axis
→ exact Current Knowledge owner
→ smallest sufficient System / Block / LG / KP target
→ self-attack
→ optional post-decision conflict check against old Explanation
→ REVIEWED relation
```

C1 tooling may **not** emit suggested System/Block/KP targets. Old Explanation is never mapping authority.

### D5 — content growth must be product-independent

Adding reviewed rows should make the existing P4 consumer expose more precise links and reverse lookup automatically. Mapping batches must not require UI redevelopment.

## Exit

```text
C0 relation-model calibration  ✅ PASS
schema expansion               ❌ not needed
second mapping truth           ❌ forbidden
C1 review pipeline             ✅ unblocked
broad coverage                 ⏭ after C1 pipeline acceptance
```
