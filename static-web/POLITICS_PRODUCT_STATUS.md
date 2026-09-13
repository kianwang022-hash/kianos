# Politics Product / Projection Status

Status: **UI DESIGN FROZEN · COGNITIVE PROJECTION ASSETS COMPILED · UI IMPLEMENTATION NOT STARTED**  
Role: current Politics productization status / implementation handoff  
Design detail owner: `static-web/POLITICS_PRODUCT_BRIEF.md` + five subject design files  
Derived asset owner: `content/politics/projection/manifest.json`

This file supersedes **only stale Politics stage/cursor wording** in older design/UI cursor documents (for example `ACTIVE DESIGN TARGET`, `History C01 pilot first`, `Politics learning projection REBUILD`, or `mass Projection not yet compiled`). It does not replace or reinterpret the accepted UI/product design decisions in those files.

---

## Current closure

Politics learner-facing design is already frozen at the product/subject-grammar level. The separate Cognitive Projection Asset Compilation lane has also completed from fresh Current reads.

```text
Current Politics Content
        ↓ semantic authority
53 chapter Projection owners
        ↓
160 Current Natural Unit owners accounted
        ↓
151 PASS + 9 REFERENCE_ONLY + 0 BLOCKED
        ↓
subject-specific cognitive geometry preserved
        ↓
ready for the already-designed Mac-wide UI to consume
```

Subject accounting:

| Subject | Chapters | Current NU owners | PASS | REFERENCE_ONLY | BLOCKED |
| --- | ---: | ---: | ---: | ---: | ---: |
| History | 10 | 35 | 31 | 4 | 0 |
| Marxism | 9 | 22 | 21 | 1 | 0 |
| Mao | 9 | 18 | 18 | 0 | 0 |
| Xi | 18 | 60 | 60 | 0 | 0 |
| Ethics-Law | 7 | 25 | 21 | 4 | 0 |
| **Total** | **53** | **160** | **151** | **9** | **0** |

The authoritative machine ledger is `content/politics/projection/manifest.json`.

---

## Authority boundary

```text
Current Content
= semantic authority

content/politics/projection/**
= derived learner-facing Cognitive Projection assets

Politics UI
= consumer of the accepted design + derived Projection assets
```

The UI implementation must not reopen or reinterpret Politics Content merely because raw chapter JSON is available.

Hard rules:

- Current Content remains the semantic authority;
- empty / null Projection values are not permission for UI/Codex to synthesize missing teaching content;
- `first_round_exact` may only come from Current-owned first-round exact objects;
- Chengfeng continuous learning remains on iPad / MarginNote;
- `REFERENCE_ONLY` owners do not become independent learner teaching payloads;
- UI/Codex must consume the compiled Projection layer for cognitive shape instead of re-inferring subject geometry from raw chapter JSON;
- Runtime, Evidence, question ownership and learner progress are unchanged by this compilation.

---

## Durable anti-drift guard

Derived Projection assets are guarded by:

`static-web/scripts/validate-politics-cognitive-projection-assets.mjs`

The validator is part of `Static Web Politics QA` and checks, at minimum:

- every manifest Projection file exists and is `DERIVED_CURRENT`;
- every Projection `source.path` exists;
- stored `source.blob_sha` still matches the exact Current source bytes;
- Current chapter files and manifest chapter files reconcile;
- each chapter's projected Natural Unit owner set reconciles with Current `source_bindings.natural_unit_ids` while allowing Projection-specific display ordering;
- PASS / REFERENCE_ONLY / BLOCKED counts reconcile with the manifest;
- Current field references and selectors resolve rather than silently widening/falling back;
- `first_round_exact` contains Current references rather than synthesized learner content;
- Chengfeng handoff remains `IPAD_MARGINNOTE`;
- `REFERENCE_ONLY` remains non-teaching payload;
- compiled Current contains no unresolved `BLOCKED` unit.

A Current Content change that makes a derived Projection stale must fail closed until the affected Projection is intentionally recompiled.

---

## Next product action

The next Politics productization action is **UI implementation of the already accepted design**, consuming the compiled Projection assets.

```text
accepted Politics UI / subject designs
+ content/politics/projection/manifest.json
+ corresponding chapter Projection owner
        ↓
bounded Astro / CSS / JS implementation
        ↓
Mac-wide browser screenshots
        ↓
product / structural review
        ↓
zero-semantic-diff acceptance
```

Do not start another Politics semantic Projection expansion merely because more structures could be invented. New semantic work requires a concrete Current/source/learner defect with a responsible owner.

This status does not claim learner validation. Politics `U` remains learner-only.
