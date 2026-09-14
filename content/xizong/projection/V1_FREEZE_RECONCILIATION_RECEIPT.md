# Xizong Cognitive Projection v1 — Final Reconciliation Receipt

Status: **V1 ASSET CONTRACT FROZEN / VALIDATED — DOWNSTREAM RENDERER / MAC / RUNTIME ACCEPTANCE NOT CLAIMED**

Reconciliation baseline: `7f7bd34225ce8d82daeadde59fe137cc323c11e8`  
Validated reconciliation head: `2e672ea912fffa237d2b71f67c55569b87141fcb`  
Combined Projection validation run: `34799875574` — **SUCCESS**  
Original full compilation: `3cb882691ace183d46f771b910b354d0419e9d07`  
Source/Product snapshot immediately before compilation: `49acc3e850c25e4ef70b764860e2d93ba544e7f0`

## Why this receipt exists

A parallel Xizong Projection validation lane landed on `main` while an independent hardening branch was still open. The parallel Current implementation was stronger in asset-level validation, so the historical hardening branch was **not** forced over `main`.

Final reconciliation started again from latest Current and preserved the stronger main implementation:

- `validate_projection.py` v1.1.0;
- `test_projection.py` adversarial suite;
- 41 existing Projection assets;
- 805 canonical KP identities;
- 396 resolved bindings;
- exact selector / owner / freshness / neutral-front checks;
- 86/86 mutation/control tests;
- in-memory mutation isolation and protected knowledge-worktree verification.

The reconciliation adds only the governance/accounting layer that Current still lacked:

1. repository-wide System eligibility accounting;
2. explicit A1/A2/A3 compiled eligibility and B–F `NOT_ELIGIBLE` reasons;
3. one disposition + stale state for every currently eligible Block;
4. System-level disposition/stale state;
5. source/current/compile/reconciliation commit provenance;
6. an independent companion acceptance gate that checks those claims against Current owner roots and actual Projection assets.

No medical Core, Learning contract, learner state, Question Truth, Runtime/Evidence semantics, Astro/CSS/JS, or Projection medical/view content was changed by this reconciliation.

## Current eligible coverage

```text
A1 Circulation   12 BlockProjection
A2 Respiratory   12 BlockProjection
A3 Urinary       14 BlockProjection

3 SystemProjection + 38 BlockProjection = 41 Projection assets
```

Eligible Block accounting:

```text
PASS            38
REFERENCE_ONLY   0
BLOCKED          0

FRESH           38
STALE             0
BLOCKED           0
```

Seven existing calibration Blocks remain the rich calibration set; the other 31 remain baseline projections. Rich calibration classification is compatible with their earlier schema and does not require retrofitting a new `projection_level` field merely for validator symmetry.

B–F are not hidden debt. They are explicitly accounted as currently not Projection-eligible under Current authority. B still has Learning active/untested with downstream Projection frozen; C–F do not yet provide the accepted System-level plus System-specific learning authority required for derived Projection compilation.

## Executed evidence

Combined run `34799875574` executed on `2e672ea912fffa237d2b71f67c55569b87141fcb` and passed both gates:

```text
XIZONG_PROJECTION_VALIDATION: PASS
coverage: 3 systems / 38 blocks / 41 assets / 805 KP identities
mutation/control tests: 86/86 passed; failed=0

XIZONG_PROJECTION_ACCEPTANCE: PASS
eligibility_owner_accounting: PASS
block_disposition_and_stale_accounting: PASS
commit_provenance: PASS
acceptance_self_tests: PASS
```

The workflow also verifies that `content/xizong/knowledge` remains unchanged by validation and uploads the combined evidence artifact.

The first reconciliation attempt correctly failed because the companion gate assumed every rich calibration asset must carry an explicit `projection_level`. Current rich calibration assets predate that baseline metadata convention. The gate was corrected to validate their existing manifest-owned rich classification instead; no Projection asset was modified to satisfy the validator.

## Freeze boundary

This freeze means:

> Current A1/A2/A3 Projection assets have a stable v1 asset contract, strong executable asset validation, complete eligible-Block accounting, explicit repository-wide eligibility accounting, and reproducible provenance.

It does **not** mean:

- medical-semantic re-acceptance of every derived geometry;
- production renderer adoption;
- browser/DOM answer-leak acceptance;
- Mac visual acceptance;
- Runtime/Evidence migration;
- second-pass question productization;
- learner progress or S/K/L/P/R/E/U promotion.

## Handoff

The next bounded chain is:

```text
Projection v1 frozen / validated
→ implementation consumer (Codex/product lane)
→ real Mac screenshots + browser behavior evidence
→ Sol architecture / visual review
→ Kian product acceptance
```

Do not restart bulk A1/A2/A3 Projection compilation unless a Current owner change makes a specific asset stale or a downstream content-to-view review identifies a concrete local gap.
