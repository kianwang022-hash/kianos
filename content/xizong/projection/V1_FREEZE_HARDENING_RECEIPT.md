# Xizong Cognitive Projection v1 — Independent Freeze Hardening Receipt

Status: **CANDIDATE — FINAL PR CI REQUIRED BEFORE FREEZE CLAIM**  
Final validation PR: `#111`  
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
7. adversarial CI exposed one real schema-completeness gap: 31 `BASELINE_CURRENT` BlockProjection assets lacked the required stable `kp_set` identity.

## Candidate hardening

- `validate_projection_v1.py` is the authoritative v1 acceptance entrypoint. It normalizes representational differences in Current System-owner packaging before delegating to the generic binding/freshness/neutral-front/OWNER_REF/mutation validation library; upstream Current owners are not rewritten merely to satisfy validator packaging assumptions;
- exact selectors reject ambiguity; malformed `INDEX_MATCH` predicate paths fail even though a well-formed optional query may legally resolve to zero matches;
- protected fronts fail closed, including explicit `NO_ANSWER_LEAK` for optional enrichment;
- manifest coverage and Block accounting are derived from manifest-linked Current System routes rather than hard-coded A1/A2/A3 topic counts;
- repository knowledge System owners are accounted exactly once as compiled or currently not eligible;
- manifest accounts all 38 eligible Current Blocks exactly once as `PASS / FRESH`, with 7 `RICH_CURRENT` and 31 `BASELINE_CURRENT` assets;
- all 31 baseline assets now carry `kp_set: OWNER_REF(KP_SET, block_id)`; this repair adds only stable Projection identity and changes no medical content, learning semantics, role, geometry or view behavior;
- B remains not eligible because its Current says Learning is active and P/R/E are downstream-frozen; C–F remain not eligible because the Current natural System roots do not yet provide the accepted System-level + System-specific learning authority needed for derived compilation;
- CI watches the Xizong Projection root, all System roots, all learner-support owners and the knowledge owner manifest so future System eligibility/content evolution cannot silently bypass Projection validation.

## Existing integration safety evidence

The earlier PR candidate's `Static Web Xizong QA` run `34796512719` completed successfully, including the Astro build and existing Xizong contract/browser checks. This is compatibility evidence only; it is not a substitute for the final authoritative Projection v1 validator on the exact current candidate.

## Acceptance still pending

This candidate is not final until the exact current PR head passes:

```text
python3 content/xizong/projection/tools/validate_projection_v1.py --self-test
```

through GitHub PR CI against current main. The v1 entrypoint includes the generic Projection validation suite rather than requiring a second legacy entrypoint whose packaging assumptions previously produced a false A1 identity failure.

Passing this hardening means only that the **Projection v1 contract and current A1/A2/A3 asset compilation are structurally / mutation validated as derived Current inputs**. It does not mean Astro consumes them, Mac UI is accepted, Runtime changed, learner evidence changed, or Kian has learned the material.
