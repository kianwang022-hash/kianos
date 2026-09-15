# Xizong legacy System Guides

Status: **NON-CURRENT BY DEFAULT / TRANSITIONAL OR HISTORICAL ONLY**

This directory is **not** a normal Current routing entry for Xizong learning, UI design, continuation, or semantic authority.

## Normal Current routing

Use the narrow Current owners instead:

```text
content/xizong/CURRENT.md
→ requested System CURRENT.md
→ System system.json for Current System Knowledge / cognitive model
→ content/xizong/knowledge/learner/*-learning.json for accepted System-specific learner guidance when present
→ canonical Block Markdown for medical Core
→ scoped ACCEPTANCE.md for readiness claims
```

## What belongs here

Files in this directory are older System Guide substrates created before the Current owner split stabilized. They may be retained only when a Current System owner explicitly names one as a bounded transitional/reference substrate.

They are never allowed to silently outrank or supplement Current owners merely because they contain more prose or appear more complete.

`TRANSITIONAL` does **not** mean “second Current”. It means the Guide temporarily owns only the System-level layer for a System that does not yet have an accepted replacement `system.json` / learner owner set. Once those replacement owners are accepted, the Guide must leave the live semantic path.

## Migration rule

Once a System has accepted replacement owners for the relevant layers (for example Current `system.json` plus accepted learner support), its old full Guide must leave the live semantic path:

- replace the old file with a short `RETIRED / NON-CURRENT` tombstone when a live provenance path must remain resolvable; or
- delete it when no Current reference requires the path.

Full historical prose belongs in Git history, not beside Current learner assets.

## Current cleanup state

- A1 Circulation legacy full Guide → **RETIRED tombstone**; use `systems/a1-circulation/system.json` + `learner/a1-circulation-learning.json`.
- A2 Respiratory legacy full Guide → **RETIRED tombstone**; use `systems/a2-respiratory/system.json` + `learner/a2-respiratory-learning.json` (+ selective cues where relevant).
- A3 Urinary legacy full Guide → **RETIRED tombstone**; use `systems/a3-urinary/system.json` + `learner/a3-urinary-learning.json`.
- B Digestive / Metabolic / Endocrine / Tumor legacy full Guide → **RETIRED tombstone**; use `systems/b-digestive-metabolic-endocrine-tumor/system.json` + `learner/b-digestive-metabolic-endocrine-tumor-learning.json`.
- C Hematology / Immunity / Infection Guide → **TRANSITIONAL System-level substrate only**; no accepted `system.json` replacement exists yet, so do not retire it prematurely.
- D Neuro / Sensory / Motor / Orthopedics Guide → **TRANSITIONAL System-level substrate only**; no accepted `system.json` replacement exists yet, so do not retire it prematurely.
- E Reproductive / Breast Guide → **TRANSITIONAL System-level substrate only**; no accepted `system.json` replacement exists yet, so do not retire it prematurely.
- F Remaining Clinical Guide → **TRANSITIONAL System-level substrate only**; no accepted `system.json` replacement exists yet, so do not retire it prematurely.

The target end-state is not “eight files with the same shape”. It is **one live owner per responsibility**. A1/A2/A3/B have completed the System-owner cutover; C/D/E/F have not, so their transitional Guides remain bounded Current substrate for that layer only.

## Hard rule for agents / Chats

> Do not read `content/xizong/knowledge/system-guides/**` during ordinary Xizong continuation, learner UI design, or study unless the requested System's Current owner explicitly names a specific file as still-required transitional evidence.
