# Politics Ethics-Law Acceptance

Status: CURRENT  
Scope: Ethics-Law C00–C06  
Standard: root `LEARNING_ACCEPTANCE.md`  
Role: Ethics-Law scoped Acceptance Truth

This file owns current acceptance claims for the independently continued Ethics-Law subject. It does not own Source Truth, Politics-wide contracts, Work Cursor, runtime code, or Kian's private learner progress.

---

## Gate status

```text
S  PASS
K  PASS
L  PASS
P  PASS
R  PASS
E  UNTESTED   ← earliest unresolved
U  UNTESTED   ← learner-only
```

Supplemental content conclusion: `C00–C06 Current content closure PASS`.

Allowed conclusion:

> **Ethics-Law now has accepted Current Source/Knowledge, first-round content, whole-book Learning Logic, learner-facing Projection and Ethics-specific executed Runtime. Evidence semantics and real learner validation remain unaccepted.**

Do not promote this to learner-validated or mastered before E is independently accepted and U comes from real Kian use.

---

## Accepted upstream｜S/K/L/P

Fresh S/K closure repaired all seven chapter assets while keeping Chengfeng as the continuous mainline and unsupported exact wording source-primary/deferred.

Fresh L review:

```text
C00–C06 = 7 KEEP / 0 REPAIR / 0 BLOCKED
```

Accepted learner rule:

> **先判断概念/规范处在哪一层，再分清最近边界，最后放回具体关系或情境做判断。**

Fresh P review:

```text
7 chapters / 21 Units / 164 questions
C01 REPAIR
C00,C02–C06 KEEP
0 BLOCKED
```

P found one real defect: C01's accepted `evaluation_anchor` was silently dropped by the generic Projection adapter. `politicsEthicsProjection.mjs` now preserves it as a progressive-disclosure `评价尺度` beat without rewriting accepted Content/Learning. The repaired Projection audit confirms parity `1/1`, no backend `content_support` leakage and explicit external Chengfeng handoff.

---

## R｜Fresh Runtime re-acceptance — PASS after one repair

Mode: `EXECUTED + ADVERSARIAL`  
Subject-specific journey: `static-web/scripts/test-politics-ethics-runtime.mjs`  
Review owner: `runtime-review.json`

### First real R failure

The first Ethics-specific browser run passed **28/28 smoke checks** across C00–C06:

- subject/chapter identity;
- Natural Unit presence;
- external-primary Chengfeng handoff;
- intended generic Politics runtime.

It then failed at:

```text
ethics_config_with_1_questions_exists
```

Root cause:

```text
buildPoliticsUnitReturnConfigs
→ conservative NATURAL_UNIT_SAFE_FALLBACK already existed
→ allowlist included Marxism / History / Mao / Xi only
→ Ethics rendered valid Current Xiao1000 questions
→ Ethics received zero executable Unit Return config
```

This was classified as a **Runtime defect**, not a reason to reopen S/K/L/P.

### Narrow repair

`static-web/src/lib/politicsUnitReturn.mjs` now permits `ethics_law` to use the same conservative fallback:

```text
NATURAL_UNIT_SAFE_FALLBACK
mastery_claim = NONE
```

The repair does not invent finer question→node mappings and does not change Ethics teaching/projection assets.

### Executed R evidence

Repair head: `24a3592903734e36cdded84e35951decdba37f9c`

Ethics Runtime artifact: **45/45 checks PASS**.

The journey proves:

1. **C00–C06 runtime identity** — all seven chapters preserve Natural Units and external Chengfeng handoff.
2. **Clean verification** — real Xiao1000 clean attempts record `STABLE`, create no Wrong/Uncertain debt, expose Unit Return, and the UI keeps `不等于长期掌握` explicit.
3. **Meaningful resume** — a real pending question is stored as `VERIFY` and restored active after refresh with subject/chapter/unit identity intact.
4. **Repair route** — a real first attempt (`X1000-ETHICS-M-010`, WRONG, selected A vs correct BCD) routes to owning source and stores `REPAIR_SOURCE`.
5. **Repair return** — original result and repair panel reappear on return to the interrupted question.
6. **First-attempt immutability** — the stored first-attempt object remains unchanged through repair-return.

Shared Politics and sibling-subject journeys remain regression evidence only. Ethics R PASS is owned by the Ethics-specific execution.

---

## R boundary / negative space

R PASS does **not** mean:

- every Ethics question was exhaustively exercised;
- STABLE means mastery;
- repair converts historical Wrong/Uncertain into first-attempt success;
- Return Packet provenance or persistence failure semantics are independently accepted;
- later fresh/holdout transfer has run;
- Kian has studied or mastered Ethics-Law.

---

## Stage boundary

```text
S/K/L/P/R  PASS
E          UNTESTED / earliest unresolved
U          UNTESTED / learner-only
```

Next legitimate whole-module work is **E｜Evidence**. R execution is strong prior evidence, but E must independently attack first-attempt durability, repair provenance, Return Packet meaning, fail-closed persistence and no-mastery boundaries.

Do not reopen accepted S/K/L/P/R without new source truth, question evidence, real learner friction, or a concrete responsible defect.

---

## Truth boundaries

### Artifact Truth
- teaching/review assets → `content/politics/learning/ethics-law/`
- Ethics Projection adapter → `static-web/src/lib/politicsEthicsProjection.mjs`
- Unit Return runtime → `static-web/src/lib/politicsUnitReturn.mjs`
- Ethics Runtime journey → `static-web/scripts/test-politics-ethics-runtime.mjs`
- shared contracts → `content/politics/LEARNING_CONTRACT.md` + `content/politics/INTERACTION_CONTRACT.md`

### Acceptance Truth
This file.

### Learner Truth
Private browser / Return Packet / conversation evidence only.

> **Accepted Runtime is not Ethics-Law Evidence acceptance, mastery, or U evidence.**
