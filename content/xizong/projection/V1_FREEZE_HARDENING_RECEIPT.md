# Xizong Cognitive Projection v1 — Independent Freeze Hardening Receipt

Status: **CANDIDATE — CI REQUIRED BEFORE FINAL FREEZE CLAIM**  
Base Current closure inspected: `main@5ddfd87d8b757c25d134f2bba4eb7aa6a19fc3b1`  
Original full compilation: `3cb882691ace183d46f771b910b354d0419e9d07`  
Source/Product snapshot immediately before compilation: `49acc3e850c25e4ef70b764860e2d93ba544e7f0`

## Why this hardening exists

An independent review of the already-landed A1/A2/A3 compilation found that the first validator was green but still had fail-open / evolvability gaps. This hardening does not recompile medical content and does not change Learning, Runtime, Evidence or learner state. It strengthens only Projection contract/accounting/validation.

## Defects attacked

1. `INDEX_MATCH` could previously return success even when an exact predicate path was malformed.
2. `NEUTRAL_FRONT` enrichment could previously pass without an explicit `NO_ANSWER_LEAK` policy.
3. structural selectors needed unique / occurrence-aware fail-closed resolution rather than nearby-presence checks.
4. validator coverage was tied to named A1/A2/A3 counts rather than Current manifest-driven System routes.
5. the Projection manifest did not give one explicit disposition + stale state for every eligible Block.
6. repository-level eligibility did not explicitly distinguish compiled A1/A2/A3 from currently noneligible B–F scopes.

## Candidate hardening

- baseline validator now resolves structured selectors uniquely, rejects malformed exact-index predicates, validates owner refs against Current System identity, requires explicit protected-view safety, and derives Block counts from manifest-linked Current `system.json` owners;
- `validate_projection_v1.py` independently checks the repository knowledge owner map against Projection eligibility accounting, verifies block disposition summaries, verifies exact `STRUCTURE_AFTER_ANCHOR` occurrence semantics, and verifies source/compile commit ancestry;
- manifest accounts all 38 eligible Current Blocks exactly once as `PASS / FRESH`, with 7 `RICH_CURRENT` and 31 `BASELINE_CURRENT` assets;
- B remains not eligible because its Current says Learning is active and P/R/E are downstream-frozen; C–F remain not eligible because the Current natural System roots do not yet provide the accepted System-level + System-specific learning authority needed for derived compilation;
- CI watches the Xizong Projection root, all System roots, all learner-support owners and the knowledge owner manifest so future System eligibility/content evolution cannot silently bypass Projection validation.

## Acceptance still pending

This candidate is not final until the exact branch head passes both:

```text
validate_projection.py --self-test
validate_projection_v1.py --self-test
```

through GitHub PR CI against current main.

Passing this hardening means only that the **Projection v1 contract and current A1/A2/A3 asset compilation are structurally / mutation validated as derived Current inputs**. It does not mean Astro consumes them, Mac UI is accepted, Runtime changed, learner evidence changed, or Kian has learned the material.
