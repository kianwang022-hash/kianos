# Politics Xi Acceptance

Status: CURRENT  
Scope: 习近平新时代中国特色社会主义思想 C00–C17  
Standard: root `LEARNING_ACCEPTANCE.md`  
Role: Xi scoped Acceptance Truth

This file owns current acceptance claims for the independently continued Xi subject. It does not own Source Truth, Politics-wide contracts, Work Cursor, runtime code, or Kian's private learner progress.

---

## Gate status

```text
S  PASS
K  PASS
L  PASS
P  PASS
R  UNTESTED   ← earliest unresolved
E  UNTESTED   ← downstream-frozen
U  UNTESTED   ← learner-only
```

Supplemental content conclusion: `C00–C17 Current content closure PASS`.

Allowed conclusion:

> **Xi now has accepted Current Source/Knowledge, complete first-round content, whole-book hierarchy-first Learning Logic, and learner-facing Projection. Xi-specific Runtime/Evidence and real learner validation remain unaccepted.**

Do not promote this to module-ready or learner-validated before R/E are independently accepted and U comes from real Kian use.

---

## Accepted upstream｜S/K + Content

Fresh Source/Knowledge closure repaired all 18 chapter assets without turning KianOS into a duplicate Chengfeng course.

Current Xi contains 60 canonical Natural Units:

```text
ordinary P0  6
ordinary P1  36
ordinary P2  12
C02 frozen-pilot units without ordinary priority  6
```

P2 remains canonical/source-bound but may stay source-primary/deferred. P0/P1 ownership is not render entitlement or permanent Memory admission.

Source boundary:

```text
Chengfeng  continuous first-round mainline + semantic authority
Suyi       compact framework / exactness / past-exam cross-check only
Xiao1000   verification / transfer evidence, not first-learning order
KianOS     hierarchy / role / boundary / selective precision companion
```

Bounded upstream decisions remain accepted:

- C02 uses Suyi only as an exactness cross-check; Chengfeng remains semantic owner.
- C08's political-system/CPPCC passage is bound to real owner `POL27-CF-XI-C08-K06-N01-TBL01`; nonexistent `K06-N02` is rejected.

Executed S/K evidence:

- Static Web Politics QA #521 (`34763032552`) → PASS;
- 18/18 chapters and 60/60 Natural Units represented;
- source-review snapshot, canonical coverage, Xiao1000 routing, scoped source loading, Current bindings and Astro build → PASS.

---

## L｜Fresh Learning Logic re-acceptance — PASS

Review owner: `content/politics/learning/xi/learning-review.json`.

Fresh disposition:

```text
C00–C17 = 18 KEEP / 0 REPAIR / 0 BLOCKED
material delta = NO_CHAPTER_LOGIC_REWRITE_REQUIRED
```

Accepted Xi first-round rule:

> **先分层级和身份，再做固定表述精确化。**

Whole-subject learner architecture:

```text
theory identity / method
→ direction + historical position
→ national rejuvenation / Chinese modernization
→ Party leadership / people standpoint / reform driving force
→ development + education/science/talent
→ democracy / rule of law / culture / livelihood / ecology
→ security / military / reunification / diplomacy
→ strict Party governance / self-revolution
```

Strongest L attacks were C02 four-list collision, C07 duplication of C06, C15 Taiwan ten-item memorization-wall risk, and C17 overlap with C03. Fresh readback found existing role/layer/boundary semantics already controlled those risks without adding learner operations.

L PASS does not promote dense backend content into mandatory first-round recall or Memory debt.

---

## P｜Fresh Projection re-acceptance — PASS after one repair

Review owner: `content/politics/learning/xi/projection-review.json`.  
Executable guard: `static-web/scripts/audit-politics-xi-projection.mjs`.

Fresh disposition:

```text
C00  REPAIR
C01–C17 KEEP
0 BLOCKED
```

### Real P defect

Accepted C00 owns hierarchy as a structured array of `{role, meaning}` rows. The generic scoped adapter correctly preserved that structure, but the generic learner component rendered hierarchy with:

```text
Object.entries(hierarchy) + String(value)
```

For array entries whose values are objects, this is not render-safe and can surface `[object Object]` instead of the accepted role meaning.

This was classified as a **Projection defect**, not a Content or Learning defect.

### Narrow repair

`static-web/src/lib/politicsXiProjection.mjs` now normalizes Xi structured hierarchy arrays into render-safe `role → meaning` entries only at Projection.

```text
accepted Xi Content/L unchanged
→ Xi Projection adapter normalizes structured hierarchy
→ C00 role/meaning becomes learner-readable
→ ordinary C01–C17 hierarchy objects remain unchanged
```

No chapter teaching asset was rewritten to fit the generic component.

### Accepted projection behavior

The Current generic Xi projection is accepted because:

1. chapter Orientation foregrounds current role/problem rather than a fixed-formulation list;
2. each Natural Unit foregrounds learner problem + core answer;
3. hierarchy detail lives behind progressive disclosure;
4. dense `content_support` is not read by the generic learner component;
5. Chengfeng is explicitly handed off to iPad/MarginNote and continuous text is not duplicated into Astro;
6. short closure remains collapsible rather than mandatory;
7. Xiao1000 stays downstream of owning content;
8. the page does not promote P0/P1/P2 ownership into review/Memory semantics.

### Executed P evidence

First fresh Xi Projection run failed only at the new Xi Projection audit while upstream/sibling checks remained green. After the Xi-only normalization repair, `Audit Xi Projection closure` passed, alongside Xi content closure, canonical coverage, Mao projection and History/Marxism regressions on the repaired head.

The audit explicitly guards:

- C00–C17 Orientation survives Projection;
- Natural Unit learner problems survive Projection;
- structured hierarchy is render-safe;
- backend `content_support` does not leak into `PoliticsChapterRuntime`;
- Chengfeng external-primary handoff remains explicit;
- guide and closure stay progressively disclosed.

---

## L/P boundary / negative space

S/K/L/P PASS does **not** mean:

- every fixed identity is visible at once;
- restored backend content becomes active recall or Memory debt;
- Xi's dense C02/C15/C17 structures must be memorized wholesale in round one;
- Chengfeng has moved into Astro as a continuous reader;
- shared Politics browser journeys can be relabeled as Xi Runtime/Evidence acceptance;
- Kian has studied or mastered Xi.

---

## Stage boundary

```text
S/K/L/P  PASS
R        UNTESTED / earliest unresolved
E        downstream-frozen
U        UNTESTED / learner-only
```

Next legitimate Xi whole-module work is **R｜Runtime** using Xi-specific executed learner journeys. Do not reopen accepted S/K/L/P without new source truth, question evidence, real learner friction, or a concrete upstream defect.

---

## Truth boundaries

### Artifact Truth
- teaching assets → `content/politics/learning/xi/ch00.json` … `ch17.json`
- subject map / semantic / source / learning / projection reviews → `content/politics/learning/xi/`
- Xi Projection adapter → `static-web/src/lib/politicsXiProjection.mjs`
- P guard → `static-web/scripts/audit-politics-xi-projection.mjs`
- shared contracts → `content/politics/LEARNING_CONTRACT.md` + `content/politics/INTERACTION_CONTRACT.md`

### Acceptance Truth
This file.

### Learner Truth
Private browser / Return Packet / conversation evidence only.

> **Accepted Projection is not Xi Runtime/Evidence acceptance, mastery, or U evidence.**
