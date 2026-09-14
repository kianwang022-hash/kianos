# B Source Gate — STATUS_MINI

Branch: `xizong-b-fresh-s-reset`
Gate: `S — Source`
Current sub-gate: `S2 — Internal Medicine exact official-question membership`
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

Closure included:
- second-pass Current tag readback (`2014N133`, `2014N167`, `2025N153` recovered);
- 2026 bounded Current reconstruction (`2026N36`, `N37`, `N39`);
- G5-vs-O9 adjudication (`2013N48`, `2016N51`, `2016N166`, `2024N148` → B G5);
- general injury/repair, infection, other-organ and tumor-general false-positive attacks;
- deterministic dedupe.

Evidence owner: `SOURCE_AUDIT_PATHOLOGY_CLOSURE.md`.

Counts are evidence results, never reconstruction targets.

## Current task — Internal Medicine

Construct B-System exact official-question membership from Current Internal Medicine Source and Current Question Truth.

Primary B Internal regions expected to include:
- esophageal / gastric / intestinal disease and GI bleeding as assigned to B;
- liver disease, cirrhosis, portal hypertension, hepatic encephalopathy, HCC interfaces to Current Source depth;
- biliary / pancreatic medical disease where Internal Medicine is Source owner;
- diabetes and B-assigned endocrine disease (thyroid / adrenal / calcium-PTH / GH) to Current Source depth;
- B organ-specific tumor diagnosis/medical-management interfaces where actually taught.

Hard boundaries:
- renal water/electrolyte/acid-base/CKD-MBD complete model → A3;
- complete hematology/coagulation → C;
- complete infection/immune → owning System;
- reproductive endocrine → E/later;
- tumor-general → O9;
- Surgery-owned operative decisions remain Surgery, not imported from an Internal differential merely because the same disease appears.

Method:
1. recover exact official qids from Current Internal Medicine Source regions;
2. resolve every included qid in Current Question Truth;
3. judge by tested construct, not disease-name occurrence;
4. reconstruct older years where current Lecture tags are sparse;
5. run whole-Internal negative-space and neighboring-System collision attacks;
6. dedupe against the already closed Physiology/Pathology qids before subject closure.

## Hard stop

Do **not** resume `b-learning-upgrade` from this lane. That branch is isolated non-authoritative work from a mistaken detour and is not the current Source mainline.
