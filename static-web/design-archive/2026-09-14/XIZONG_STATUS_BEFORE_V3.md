# Xizong Product / UI Status

Status: **PRODUCT / INTERACTION DESIGN FROZEN · PROJECTION V1 FROZEN / VALIDATED FOR CURRENT ELIGIBLE A1/A2/A3 · PRODUCTIZATION IMPLEMENTATION / MAC ACCEPTANCE OPEN**  
Role: current Xizong learner-facing productization status / Codex handoff router  
Lane cursor: `content/xizong/CURRENT.md`  
Detailed design owner: `static-web/XIZONG_PRODUCT_BRIEF.md` + accepted surface design files  
Projection authority: `content/xizong/projection/PROJECTION_CONTRACT.md` + `content/xizong/projection/manifest.json`  
Projection freeze receipt: `content/xizong/projection/V1_FREEZE_RECONCILIATION_RECEIPT.md`  
Shared presentation grammar: `static-web/PRESENTATION_CONTRACT.md`  
Preference owner: `static-web/KIAN_UI_PREFERENCES.md`  
Style owner: `static-web/UI_STYLE_BRIEF.md`

This file supersedes only stale stage/cursor wording in `XIZONG_PRODUCT_BRIEF.md`, especially wording that says Projection calibration is still open. It does not replace accepted detailed product decisions, medical Content, Learning semantics, Runtime/Evidence semantics or scoped System Acceptance.

## Current product closure

The learner-facing Xizong product family has already been discussed and accepted at responsibility / interaction / Mac-wide composition level:

```text
Xizong Home
System Guide / orientation
Block / Logic Group workspace
MarginNote Lecture handoff / return
KP Recall
Logic Group closure
Block Recall
System Recall / completion
System question workbench
Wrong / meaningful Uncertain repair / return
Xizong-wide whole-paper direction
```

Detailed owners:

- `static-web/XIZONG_HOME_DESIGN.md`
- `static-web/XIZONG_SYSTEM_GUIDE_DESIGN.md`
- `static-web/XIZONG_BLOCK_WORKSPACE_DESIGN.md`
- `static-web/XIZONG_SYSTEM_COMPLETION_DESIGN.md`

No normal downstream implementation task should reopen those product decisions without fresh contradictory evidence.

## Projection v1 closure

Current eligible Projection scope is frozen and executable-validated:

```text
A1 Circulation   12 BlockProjection
A2 Respiratory   12 BlockProjection
A3 Urinary       14 BlockProjection

3 SystemProjection + 38 BlockProjection = 41 assets
PASS 38 / REFERENCE_ONLY 0 / BLOCKED 0
FRESH 38 / STALE 0 / BLOCKED 0
805 canonical KP identities
396 resolved bindings
86 / 86 mutation + control tests PASS
```

B–F are explicitly outside the current v1 eligible scope under their own Current authority. They are not hidden Projection debt and must not be bulk-projected merely for symmetry.

The v1 freeze receipt explicitly says not to restart bulk A1/A2/A3 Projection compilation unless a Current owner change makes a specific asset stale or downstream content-to-view review identifies a concrete local gap.

## Frozen learner/product model

First pass remains:

```text
System orientation
→ Block
→ Logic Group orientation
→ original Lecture continuously in iPad / MarginNote
→ one return
→ KP Recall for that Logic Group
→ Logic Group closure
→ next Logic Group
→ Block Recall
→ Block Complete
```

Later eligible System flow remains:

```text
System Recall
→ official System question sweep
→ Wrong / meaningful Uncertain smallest repair
→ post-question System reconstruction
```

Hard boundaries:

- original Lecture remains the continuous first-learning owner;
- KianOS is not a second medical textbook;
- neutral Recall fronts remain answer-safe;
- stable/correct paths stay cheap;
- one Block may contain multiple cognitive objects/geometries;
- generic renderer must not embed named medical truth;
- engineering readiness never equals learner progress.

## Current handoff

```text
accepted Xizong Product / Interaction design
+ frozen validated Projection v1 for current eligible scope
+ existing Runtime / Evidence / Repair / Return
+ Kian UI preferences / shared style
→ bounded Codex renderer / UI implementation
→ real Mac browser screenshots / behavior evidence
→ independent Chat/Pro architecture + product review
→ same-PR fixes
→ Kian acceptance
→ zero-semantic-diff merge
→ Xizong SUBJECT_CLOSED_FOR_HOME for the implemented eligible product scope
```

Future System eligibility continues under each System's own S/K/L/P/R/E governance. It does not reopen already-frozen product design by default.
