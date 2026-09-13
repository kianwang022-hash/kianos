# Lexical Semantic Audit Packs

This directory stores package-level independent semantic Audit Packs.

Canonical audit rules live in:

- `content/lexical/INDEPENDENT_SEMANTIC_AUDIT_CONTRACT.md`
- `content/lexical/SEMANTIC_AUDIT_RISK_ROUTER_SPEC.md`

Reusable Audit Pack shape:

- `content/lexical/semantic-audit/AUDIT_PACK_TEMPLATE.md`

Audit Packs are evidence, not semantic authority by themselves. They must record the contract/spec blob SHAs used for the batch, normalized strata coverage, unique mandatory-owner closure, risk-family/severity metrics, blind-first status, delta-only findings, and final `PASS / PASS_WITH_CORRECTIONS / HOLD_FOR_SOL`.

A prior Audit Pack does not override Current canonical truth or a later contract revision.

## Pre-contract evidence

`o0675-o0874.audit.md` predates the current `INDEPENDENT_SEMANTIC_AUDIT_CONTRACT.md`. Its 30-owner findings remain valid calibration/sentinel evidence, but the file is **PRE-CONTRACT / CALIBRATION-ONLY**: it does not close the 200-owner package under the current STRICT contract, does not satisfy current denominator/coverage requirements, and is not scale-up evidence. The range must be re-audited under the current contract before it can count as current independent-audit closure.

## Router manifests

Deterministic routing manifests belong under `content/lexical/semantic-audit/manifests/`. They establish minimum audit depth and reproducible strata; they never constitute semantic PASS by themselves.
