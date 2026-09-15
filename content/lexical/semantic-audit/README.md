# Lexical Semantic Audit Packs

This directory stores package-level independent semantic Audit Packs.

Canonical audit rules live in:

- `content/lexical/INDEPENDENT_SEMANTIC_AUDIT_CONTRACT.md`
- `content/lexical/SEMANTIC_AUDIT_RISK_ROUTER_SPEC.md`

Reusable Audit Pack shape:

- `content/lexical/semantic-audit/AUDIT_PACK_TEMPLATE.md`

Audit Packs are evidence, not semantic authority by themselves. They record the contract/spec fingerprints, normalized strata coverage, unique mandatory-owner closure, risk-family/severity metrics, blind-first status, delta-only findings, and terminal `PASS / PASS_WITH_CORRECTIONS / HOLD_FOR_SOL` result for each audited interval.

A prior Audit Pack never overrides newer Current canonical truth or a later contract revision.

## Current catalog audit status

Whole-catalog Independent Semantic Audit ordinal coverage for the current **7,946 Main Words** is complete.

```text
catalog:                       o0001–o7946
authoritative terminal audit:  7946 / 7946
missing audit intervals:       0
broad audit generation:        CLOSED for this catalog generation
```

Canonical coverage reconciliation:

- `content/lexical/semantic-audit/reconciliation/CATALOG_COVERAGE_RECONCILIATION.md`
- `content/lexical/semantic-audit/reconciliation/R1-o0001-o1999.md`
- `content/lexical/semantic-audit/reconciliation/R2-o2000-o3999.md`
- `content/lexical/semantic-audit/reconciliation/R3-o4000-o5999.md`
- `content/lexical/semantic-audit/reconciliation/R4-o6000-o7946.md`

These files own **coverage accounting and supersession**, not lexical semantics. They distinguish authoritative final Packs from stale transport, duplicate, contaminated, incomplete, and blind-first-exception lanes.

Do not start another broad Independent Audit pass merely because historical branch names or old Issue comments still exist. A new audit is justified only by a concrete Current defect, a materially changed audit/content contract, or a genuinely new catalog generation.

## Historical prefix exception

Production semantic-review handoffs begin at `o0025`, so `o0001–o0024` has no Production comparator. That prefix is closed by a dedicated 24/24 Current-only STRICT audit:

- `content/lexical/semantic-audit/o0001-o0024.audit.md`

It counts for semantic audit coverage and concrete defect evidence, but not for Production false-pass / over-upgrade rate measurement.

## Superseded / weaker evidence

`o0675-o0874.audit.md` is an early 30-owner sample. It remains useful calibration/sentinel evidence only. Its ordinal coverage is superseded by the later full STRICT `o0625-o0824.audit.md` + `o0825-o1024.audit.md` packages. **Do not re-audit that range merely because this older sample exists.**

Several final Packs explicitly disclose bounded blind-first exceptions. They remain valid ordinal/defect coverage but are not evidence for reviewer-independence or future audit-density relaxation. The exact list is frozen in `CATALOG_COVERAGE_RECONCILIATION.md`.

## After audit

`7946 / 7946` audit coverage does **not** mean all findings are already canonical content.

The downstream responsibility is:

```text
Audit findings
→ Sol reconciliation
→ bounded corrective implementation
→ final integrated learner-object readback
→ closure
```

Mechanical implementation and corrective-integration frontiers remain owned by `content/lexical/CURRENT.md` and must not be inferred from Audit coverage.

## Router manifests

Deterministic routing manifests establish a minimum audit depth and reproducible strata; they never constitute semantic PASS by themselves. Historical manifests and router experiments are provenance once their audited interval is terminally represented by a final Pack.
