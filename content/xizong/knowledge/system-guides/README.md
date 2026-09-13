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

## Migration rule

Once a System has accepted replacement owners for the relevant layers (for example Current `system.json` plus accepted learner support), its old full Guide must leave the live semantic path:

- replace the old file with a short `RETIRED / NON-CURRENT` tombstone when a live provenance path must remain resolvable; or
- delete it when no Current reference requires the path.

Full historical prose belongs in Git history, not beside Current learner assets.

## Current cleanup state

- A1 Circulation legacy full Guide → **RETIRED tombstone**; use `systems/a1-circulation/system.json` + `learner/a1-circulation-learning.json`.
- A2 Respiratory legacy full Guide → **RETIRED tombstone**; use `systems/a2-respiratory/system.json` + `learner/a2-respiratory-learning.json` (+ selective cues where relevant).
- A3 Urinary legacy full Guide → **RETIRED tombstone**; use `systems/a3-urinary/system.json` + `learner/a3-urinary-learning.json`.
- Other files in this directory remain transitional only until their own Current migration state explicitly permits retirement. Their presence is not permission for normal readers to use them as Current truth.

## Hard rule for agents / Chats

> Do not read `content/xizong/knowledge/system-guides/**` during ordinary Xizong continuation, learner UI design, or study unless the requested System's Current owner explicitly names a specific file as still-required transitional evidence.
