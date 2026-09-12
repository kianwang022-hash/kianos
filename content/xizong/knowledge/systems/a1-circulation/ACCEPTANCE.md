# Xizong A1 Circulation Acceptance

Status: CURRENT  
Scope: A1 Circulation  
Standard: root `LEARNING_ACCEPTANCE.md`  
Role: A1 scoped Acceptance Truth

This file owns current S/K/L/P/R/E/U readiness claims for A1 Circulation.

It does not own medical Core, lane/System learning semantics, Work Cursor, or Kian's private learner state.

---

## Gate status

```text
S  PASS
K  PASS
L  PASS
P  PASS
R  PASS
E  PASS
U  UNTESTED by every real learner path
```

Allowed conclusion:

> **A1 is Module ready for learner test; U remains UNTESTED by path.**

This does **not** mean Kian has started Circulation, reached System Recall, or should perform System Exit now.

---

## Accepted evidence boundary

- **S** — canonical System/Block/KP identity is Current; A1 official System scope is exactly **376** Question Truth IDs; accepted inventory SHA256 `ded191082a6226353d92c05756dfebe4237335e361f7a945e1a2f3b204c457be`; precise Question→Knowledge links remain REVIEWED-only rather than inferred.
- **K** — canonical System + **12 Blocks / 312 stable KPs** were content-closure re-audited from actual medical Core rather than file presence; no unresolved stable medical-Core gap justified expansion.
- **L** — direct 12-Block route + **87 Logic Groups** cover 312/312 KPs exactly once while preserving canonical learner reading order; B5 intentionally separates stable KP identity from learner order (`KP01–03 → KP07–12 → KP04–06`).
- **P** — learner projection strips YAML/frontmatter, omits unavailable Outline metadata, and does not seed private holdout years from shared Runtime.
- **R** — accepted synthetic journey covers clean path, weak Recall, Chat return, private holdout, W/U routing, persistence, idempotency, malformed-input containment and System Exit mechanics. Workflow run `34660072688` passed `validate:xizong` before Astro build; build is compilation evidence, not the reason R passes.
- **E** — weak Memory admission is evidence-based; Chat repair is `REPAIR_ONLY` and cannot overwrite first Recall/mastery; stable official answers create no W/U debt; wrong/uncertain only enter repair; absent precise KP relation fails safe to Question Truth ID instead of guessing.

---

## Real learner U boundary

All named learner paths remain:

- first-learning path — `UNTESTED`
- weak Recall → Memory / Chat return — `UNTESTED`
- System Exit / holdout / official questions — `UNTESTED`
- sustained multi-session use — `UNTESTED`

Only Kian's real use can change these claims.

---

## Reopen rule

Do not reopen A1 S–E because more polish or features can be imagined.

Reopen only when new Source, learner, runtime, or acceptance evidence identifies a concrete defect and then reopen the earliest responsible gate/stage only.

---

## Truth boundaries

### Artifact Truth

- System owner → `content/xizong/knowledge/systems/a1-circulation/system.json`
- medical Core → `content/xizong/knowledge/systems/a1-circulation/blocks/`
- lane learning semantics → `content/xizong/LEARNING_CONTRACT.md`
- shared/System learning support → `content/xizong/knowledge/learner/`
- learner-facing implementation → Xizong surfaces under `static-web/`

### Learner Truth

Private learner/browser/conversation evidence only.

> **S–E PASS cannot manufacture Kian's learning progress or next learner action.**