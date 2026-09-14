# Xizong Cognitive Projection v1 — Independent Freeze Hardening Receipt

Status: **V1 FROZEN / VALIDATED**  
Final validation PR: `#111`  
Validated candidate head: `98d4ec267a9dcd354374f24ac824ce8f6eaf2803`  
Authoritative Projection validation run: `34798725841` — `success`  
Existing Xizong integration QA run: `34796512719` — `success`  
Original full compilation: `3cb882691ace183d46f771b910b354d0419e9d07`  
Source/Product snapshot immediately before compilation: `49acc3e850c25e4ef70b764860e2d93ba544e7f0`

## Closure

The A1/A2/A3 Cognitive Projection v1 compilation is frozen as validated derived Current input. Current eligible coverage is:

```text
3 SystemProjection
38 BlockProjection
41 total Projection assets
```

All 38 eligible Blocks are accounted exactly once as `PASS / FRESH`:

- 7 `RICH_CURRENT` calibration Blocks;
- 31 `BASELINE_CURRENT` Blocks;
- 0 `REFERENCE_ONLY`;
- 0 `BLOCKED`;
- 0 `STALE`.

B–F are not treated as missing compilation debt. They are explicitly accounted as currently not Projection-eligible under Current authority. B still has Learning active / downstream Projection frozen; C–F do not yet provide the accepted System-level + System-specific learning authority required for derived compilation.

## What the independent hardening changed

The review did not rewrite medical Core, Xizong Learning, learner state, Runtime, Evidence, Question Truth, Astro UI, role/geometry semantics, or accepted learning order.

It hardened the Projection layer itself:

1. exact selector resolution now fails on ambiguity instead of accepting nearby matches;
2. malformed `INDEX_MATCH` predicate paths fail closed while legitimate optional zero-match enrichment remains legal;
3. protected neutral fronts require explicit safety policy and cannot silently expose answer-bearing support;
4. shared structured owners use binding-aware freshness rather than sibling-wide whole-file invalidation;
5. manifest coverage is driven by Current System owners rather than hard-coded A1/A2/A3 topic counts;
6. all repository Xizong System owner roots are accounted exactly once as compiled or currently not eligible;
7. every eligible Block has explicit disposition + stale state;
8. adversarial validation found one real schema-completeness gap: 31 baseline assets lacked required stable `kp_set` identity. Those assets now carry only `OWNER_REF(KP_SET, block_id)`; no medical or learning semantics changed;
9. Projection feature branches can now run their own validation directly instead of depending only on PR-event triggering.

## Validation evidence

The authoritative v1 validator ran on head `98d4ec267a9dcd354374f24ac824ce8f6eaf2803` and reported:

```text
XIZONG_PROJECTION_V1_VALIDATION: PASS
coverage: 3 systems / 38 blocks / 41 assets
current_system_identity_normalization: PASS
eligibility_owner_accounting: PASS
block_disposition_accounting: PASS
freshness: STRICT_BLOB + RESOLVE_BINDING
selector_exactness: PASS
neutral_front: PASS
structure_occurrence_exactness: PASS
commit_provenance_ancestry: PASS
r10_and_hardening_self_tests: PASS
```

The existing Static Web Xizong QA also passed after the asset hardening, including Astro build and current Xizong contract/browser checks. That is regression-safety evidence only; it does not make Projection Runtime authority.

The final metadata-only freeze commit is accepted only if the same branch Projection CI remains green before merge.

## Product boundary after freeze

Projection v1 is **not** Runtime adoption and is **not** Mac visual acceptance.

The next handoff remains:

```text
Projection compiled + independently hardened
→ Codex / product implementation consumes Projection
→ real Mac screenshots
→ Sol architecture / visual review
→ Kian product acceptance
```

Runtime adoption remains a separate decision. Question-attempt history / multi-pass productization remains outside this Projection freeze.
