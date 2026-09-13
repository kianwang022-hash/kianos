# Lexical Semantic Audit Packs

This directory stores package-level independent semantic Audit Packs.

Canonical audit rules live in:

- `content/lexical/INDEPENDENT_SEMANTIC_AUDIT_CONTRACT.md`
- `content/lexical/SEMANTIC_AUDIT_RISK_ROUTER_SPEC.md`

Reusable Audit Pack shape:

- `content/lexical/semantic-audit/AUDIT_PACK_TEMPLATE.md`

Audit Packs are evidence, not semantic authority by themselves. They must record the contract/spec blob SHAs used for the batch, normalized strata coverage, unique mandatory-owner closure, risk-family/severity metrics, blind-first status, delta-only findings, and final `PASS / PASS_WITH_CORRECTIONS / HOLD_FOR_SOL`.

A prior Audit Pack does not override Current canonical truth or a later contract revision.

## Machine risk manifests

`tools/lexical_audit_risk_router.py` generates the deterministic machine lower
bound described by `SEMANTIC_AUDIT_RISK_ROUTER_SPEC.md`. It reads Current Word
Natural Owners and bounded production operation labels, but never edits
canonical content or emits semantic audit verdicts.

Example:

```sh
python3 tools/lexical_audit_risk_router.py \
  --start 875 --end 1124 \
  --semantic-handoff content/lexical/semantic-review/o0875-o1124.md \
  --output content/lexical/semantic-audit/risk-manifests/o0875-o1124.json \
  --blind-output content/lexical/semantic-audit/risk-manifests/o0875-o1124.blind.json \
  --sample-output content/lexical/semantic-audit/risk-manifests/o0875-o1124.simple-sample.json
```

The full manifest retains operation metadata for engineering validation. The
blind projection withholds production operation/quality and rationale. Any
objectively unverifiable semantic boundary is represented conservatively as a
risk floor; the router does not infer correctness from wording, labels, or
learner state.
