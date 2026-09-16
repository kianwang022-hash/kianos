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
→ content/xizong/knowledge/learner/*-guide.md for accepted Current beginner explanation where present
→ canonical Block Markdown for medical Core
→ scoped ACCEPTANCE.md for readiness claims
```

Current `*-guide.md` files under `knowledge/learner/` are **new derived explanation assets governed by `BEGINNER_GUIDE_CONTRACT.md`**. They do not make this legacy directory Current again.

## What belongs here

Files in this directory are older System Guide substrates created before the Current owner split stabilized. They may be retained only when a Current System owner explicitly names one as a bounded transitional/reference substrate.

They are never allowed to silently outrank or supplement Current owners merely because they contain more prose or appear more complete.

`TRANSITIONAL` does **not** mean “second Current”. It means the Guide temporarily owns only the System-level layer for a System that does not yet have an accepted replacement `system.json` / learner owner set. Once those replacement owners are accepted, the Guide must leave the live semantic path.

## Migration rule

Once a System has accepted replacement owners for the relevant layers (for example Current `system.json` plus accepted learner support), its old full Guide must leave the live semantic path:

- replace the old file with a short `RETIRED / NON-CURRENT` tombstone when a live provenance path must remain resolvable; or
- delete it when no Current reference requires the path.

Full historical prose belongs in Git history, not beside Current learner assets.

If a later content audit discovers that retirement also removed a genuinely useful **explanation pattern**, recover that pattern through the Current Beginner Guide contract:

```text
Current owners first
+ last pre-retirement Guide as bounded provenance only
→ re-verify the explanatory move
→ rewrite into knowledge/learner/*-guide.md
```

Do **not** repopulate a retired tombstone with full Guide prose merely to restore beginner explanation.

## 2026-09-17 explanation migration

A1 / A2 / A3 / B now have separate Current Beginner Guide assets:

- `content/xizong/knowledge/learner/a1-circulation-guide.md`
- `content/xizong/knowledge/learner/a2-respiratory-guide.md`
- `content/xizong/knowledge/learner/a3-urinary-guide.md`
- `content/xizong/knowledge/learner/b-digestive-metabolic-endocrine-tumor-guide.md`

Those assets use the last full pre-retirement Guide only to recover bounded, Current-reverified explanation patterns such as a useful mother-model metaphor, failure-localization frame or DAG explanation. Historical page maps, implementation state, old scope ownership and stale source policy remain historical.

The retired A1 / A2 / A3 / B files in this directory therefore stay **tombstones**.

## Current cleanup state

- A1 Circulation legacy full Guide → **RETIRED tombstone**; use `systems/a1-circulation/system.json` + `learner/a1-circulation-learning.json` + Current `learner/a1-circulation-guide.md` for beginner explanation.
- A2 Respiratory legacy full Guide → **RETIRED tombstone**; use `systems/a2-respiratory/system.json` + `learner/a2-respiratory-learning.json` (+ selective cues where relevant) + Current `learner/a2-respiratory-guide.md` for beginner explanation.
- A3 Urinary legacy full Guide → **RETIRED tombstone**; use `systems/a3-urinary/system.json` + `learner/a3-urinary-learning.json` + Current `learner/a3-urinary-guide.md` for beginner explanation.
- B Digestive / Metabolic / Endocrine / Tumor legacy full Guide → **RETIRED tombstone**; use `systems/b-digestive-metabolic-endocrine-tumor/system.json` + `learner/b-digestive-metabolic-endocrine-tumor-learning.json` + Current `learner/b-digestive-metabolic-endocrine-tumor-guide.md` for beginner explanation.
- C Hematology / Immunity / Infection Guide → **TRANSITIONAL System-level substrate only**; no accepted `system.json` replacement exists yet, so do not retire it prematurely.
- D Neuro / Sensory / Motor / Orthopedics Guide → **TRANSITIONAL System-level substrate only**; no accepted `system.json` replacement exists yet, so do not retire it prematurely.
- E Reproductive / Breast Guide → **TRANSITIONAL System-level substrate only**; no accepted `system.json` replacement exists yet, so do not retire it prematurely.
- F Remaining Clinical Guide → **TRANSITIONAL System-level substrate only**; no accepted `system.json` replacement exists yet, so do not retire it prematurely.

The target end-state is not “eight files with the same shape”. It is **one live owner per responsibility**. A1/A2/A3/B have completed the System-owner cutover; C/D/E/F have not, so their transitional Guides remain bounded Current substrate for that layer only.

## Hard rule for agents / Chats

> Do not read `content/xizong/knowledge/system-guides/**` during ordinary Xizong continuation, learner UI design, or study unless the requested System's Current owner explicitly names a specific file as still-required transitional evidence, or an explicit bounded historical-provenance audit authorizes reading one exact pre-retirement revision.
