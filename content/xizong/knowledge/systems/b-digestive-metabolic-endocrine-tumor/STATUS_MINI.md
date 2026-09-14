# B Source Gate — STATUS_MINI

Branch: `xizong-b-fresh-s-reset`
Gate: `S — Source`
Current sub-gate: `S2 — Internal Medicine old-era / 2026 reconstruction + negative-space closure`
Authority: working engineering cursor only; `SOURCE.md` remains B Source owner; Project Source/Lecture remains medical Source Truth.

## Stable assets

- Existing System / 38 Blocks / 600 canonical KPs are hard assets for later K/L; do not rebuild them here.
- K/L/P/R/E are frozen until overall S closes.
- Question membership is System scope evidence only; it must not create Question→Block/KP mappings.

## Physiology — CLOSED / PASS_BOUNDED

```text
GI + energy/temperature         96
Endocrine                       60
Vitamin/one-carbon cross-unit    1
-----------------------------------
unique Physiology B total      157
```

Evidence owner: `SOURCE_AUDIT_PHYSIOLOGY_CLOSURE.md`.

## Pathology — CLOSED / PASS_BOUNDED

```text
2005–2012 organ reconstruction  17
2013–2025 Current-source organ  51
2026 Current reconstruction      3
G5 molecular from tumor pages    4
-----------------------------------
unique Pathology-derived B total 75
```

Evidence owner: `SOURCE_AUDIT_PATHOLOGY_CLOSURE.md`.

Counts are evidence results, never reconstruction targets.

## Internal Medicine — Current-source batches CLOSED_BOUNDED

### Endocrine 2013–2025

`SOURCE_AUDIT_INTERNAL_ENDOCRINE_CURRENT.md`

- `77` unique exact qids.
- Graves / hypothyroidism / primary aldosteronism / pheochromocytoma / Cushing / endocrine-common localization / diabetes represented.
- `2019N52` repaired as a source-adjacency false positive: hepatic encephalopathy, not endocrine.

### GI / liver / pancreas 2013–2025

`SOURCE_AUDIT_INTERNAL_GI_CURRENT.md`

- `110` unique exact Internal-evidence qids.
- GERD / gastritis / PUD-UGIB / intestinal TB-TB peritonitis / IBD / IBS / hepatic encephalopathy / HCC medical layer / cirrhosis / acute pancreatitis represented.
- Surgery-oriented qids printed as cross-links were deliberately deferred to Surgery S2 rather than double-counted here.

Current-source Internal subtotal:

```text
endocrine  77
GI/liver  110
-------------
subtotal   187
```

`187` is not final Internal unique closure yet.

## Current task

1. reconstruct older sparse Internal Medicine B membership (especially 2005–2012) against Current Source;
2. reconstruct 2026 Current Question Truth where the readable Internal Lecture lacks stable 2026 tags;
3. whole-Internal negative-space / false-negative sweep;
4. attack renal / hematology / infection / reproductive / O9 / Surgery-owner collisions;
5. dedupe against closed Physiology / Pathology and the later Surgery tranche;
6. only then declare Internal Medicine PASS_BOUNDED.

## Hard stop

Do **not** resume `b-learning-upgrade` from this lane. That branch is isolated non-authoritative work from a mistaken detour and is not the current Source mainline.
