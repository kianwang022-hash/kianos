# Audit Risk Router Implementation Checklist

Implementation target: `tools/lexical_semantic_audit_router.py`

Canonical behavior is owned by `content/lexical/SEMANTIC_AUDIT_RISK_ROUTER_SPEC.md`.

Minimum closure:

- [ ] bounded `--start/--end` range input
- [ ] exact one-row-per-owner manifest
- [ ] deterministic objective risk flags
- [ ] non-downgradable `machine_min_depth`
- [ ] mandatory strata + unique mandatory owner count
- [ ] deterministic simple deep-sample list
- [ ] source HEAD + owner/dependency fingerprints
- [ ] content/audit/router spec blob SHAs
- [ ] byte-stable output for identical inputs/version
- [ ] tests for all frozen flag families
- [ ] no semantic PASS/UPGRADE inference
- [ ] no canonical mutation
- [ ] first validation run against an already reviewed batch before use as scale-up evidence
