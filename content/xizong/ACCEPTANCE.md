# Xizong Acceptance

Status: CURRENT  
Standard: root `LEARNING_ACCEPTANCE.md`  
Role: Xizong lane-wide integration Acceptance Truth

This file owns only genuine **Xizong-wide integration/readiness claims** that are broader than one independently continued System.

It does not own medical Core, lane learning semantics, System-scoped readiness, Work Cursor, or Kian's private learner state.

---

## Scoped Acceptance owners

Current independently continued Systems own their own readiness evidence:

| Scope | Acceptance owner |
| --- | --- |
| A1 Circulation | `content/xizong/knowledge/systems/a1-circulation/ACCEPTANCE.md` |
| A2 Respiratory | `content/xizong/knowledge/systems/a2-respiratory/ACCEPTANCE.md` |
| A3 Urinary | `content/xizong/knowledge/systems/a3-urinary/ACCEPTANCE.md` |
| B Digestive / Metabolic / Endocrine / Tumor | `content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/ACCEPTANCE.md` |

This table is **routing only**. It must not cache child gate status, readiness headlines, blocker text, counts, or other System-scoped Acceptance claims.

To answer a System's current readiness, read that System's local `ACCEPTANCE.md` (and its local `CURRENT.md` when the Work Cursor is relevant). A child System advancing does **not** require this parent file to be synchronized unless the routing path itself changes.

Superseded child claims belong in Git history / the child's own evidence history; they must not remain here as live-looking parent summaries.

---

## Lane-wide readiness

No separate whole-Xizong S/K/L/P/R/E/U claim is currently asserted by this owner.

A lane-wide Acceptance claim should be created here only when there is a real cross-System learner journey or integration property that cannot truthfully be established by the System owners independently, for example:

- Xizong home/navigation integration;
- cross-System Continue / return behavior;
- whole-paper or cross-System transfer where the lane itself is the natural acceptance scope;
- another genuinely shared learner-facing path supported by executed evidence.

Do not aggregate child gates into a synthetic whole-lane score merely because they are easy to summarize.

---

## Truth boundaries

### Artifact Truth

- owner map → `content/xizong/knowledge/manifest.json`
- canonical medical Core → `content/xizong/knowledge/systems/**`
- lane learning semantics → `content/xizong/LEARNING_CONTRACT.md`
- detailed shared learning policy / System support → `content/xizong/knowledge/learner/`
- official questions / explanations / reviewed relations → dedicated Xizong roots
- learner-facing implementation → Xizong surfaces under `static-web/`

### Scoped Acceptance Truth

Read the narrowest independent System owner first:

- A1 → `content/xizong/knowledge/systems/a1-circulation/ACCEPTANCE.md`
- A2 → `content/xizong/knowledge/systems/a2-respiratory/ACCEPTANCE.md`
- A3 → `content/xizong/knowledge/systems/a3-urinary/ACCEPTANCE.md`
- B → `content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/ACCEPTANCE.md`

### Learner Truth

Private learner/browser/conversation evidence only.

> **System Acceptance cannot manufacture Kian's learner progress; lane integration Acceptance, if added later, cannot either.**

---

## Change rule

Do not add a System status summary to this file merely because another System becomes active or advances through gates.

When a System qualifies for independent continuation, give that System the narrow local Acceptance owner and leave this file focused on genuinely lane-wide evidence and routing only.
