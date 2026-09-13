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
E  PASS
U  UNTESTED   ← real learner only
```

Supplemental content conclusion: `C00–C06 Current content closure PASS`.

Allowed conclusion:

> **Ethics-Law is engineering-accepted through Source / Knowledge / Learning / Projection / Runtime / Evidence for the Current first-round path. Real learner validation, mastery and later transfer are not claimed.**

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
7 chapters / 21 Units / 164 Current Xiao1000 questions
C01 REPAIR
C00,C02–C06 KEEP
0 BLOCKED
```

One real P defect was repaired: C01's accepted life-value `evaluation_anchor` was dropped by the generic Projection adapter. `politicsEthicsProjection.mjs` now preserves it as a progressive-disclosure `评价尺度` beat without rewriting accepted chapter Content/Learning.

---

## R｜Fresh Runtime re-acceptance — PASS after one repair

Review owner: `runtime-review.json`.  
Journey: `static-web/scripts/test-politics-ethics-runtime.mjs`.

First Ethics-specific browser execution passed **28/28 C00–C06 smoke checks** and then failed at:

```text
ethics_config_with_1_questions_exists
```

Root cause was the existing Unit Return safe-fallback allowlist excluding `ethics_law`. The narrow Runtime repair added Ethics-Law to the existing:

```text
NATURAL_UNIT_SAFE_FALLBACK
mastery_claim = NONE
```

No finer question→node mapping was invented and no teaching/projection asset was changed.

Final Ethics Runtime artifact: **45/45 checks PASS**. It independently proves clean verification, no false repair debt, no-mastery UI, real pending-question resume, Wrong/Uncertain → owning-source repair-return, and first-attempt immutability.

A concrete exercised first attempt was:

```text
X1000-ETHICS-M-010
outcome = WRONG
selected = A
correct = BCD
```

Repair-return does not rewrite that historical object.

---

## E｜Fresh Evidence re-acceptance — PASS after one repair

Review owner: `evidence-review.json`.  
Model audit: `static-web/scripts/audit-politics-ethics-evidence.mjs`.  
Browser journey: `static-web/scripts/test-politics-ethics-evidence.mjs`.

### Model layer — PASS before E implementation repair

```text
7 / 7 chapters
20 executable Unit Return configs
164 question evidence slots
209 model checks
0 failures
```

The model audit independently proves:

- first attempt is recorded once and cannot be overwritten by later STABLE;
- WRONG survives to `REPAIR` Unit evidence;
- UNCERTAIN remains distinct from WRONG and STABLE;
- all-STABLE closure still carries `mastery_claim = NONE`;
- evidence precision stays bounded;
- out-of-scope evidence is rejected.

### First real browser E defect

The first browser Evidence run preserved subject/chapter/unit/question/outcome/choice/answer but failed at:

```text
ethics_e_event_repair_source_anchor
```

Root cause:

```text
PoliticsEvidenceEnhancer already existed as generic logic
→ Current page mounted it for Mao / Xi only
→ Ethics W/U events lacked independent repair-source provenance
```

Immediate Runtime repair-return could still work, but a later Return Packet could not independently prove the original repair source after `last_location` changed.

### Narrow Evidence repair

The Politics chapter page now mounts the existing generic `PoliticsEvidenceEnhancer` for:

```text
Mao / Xi / Ethics-Law
```

No evidence schema, first-attempt storage, learning order, source truth or repair semantics were duplicated or rewritten.

### Final browser E evidence

Final Ethics Evidence journey: **28/28 checks PASS**.

It proves:

1. clean STABLE creates no repair debt and the UI keeps no-mastery semantics explicit;
2. a real Ethics Wrong event retains subject/chapter/unit/question plus original selected/correct answer meaning;
3. the event stores `repair_source_anchor` and stable source-owner IDs;
4. repair does not rewrite the first-attempt object or erase debt;
5. after later navigation moves `last_location` to ch06, exported Return Packet still preserves the original ch01 event and repair provenance;
6. UNCERTAIN remains distinct even when the selected answer is correct;
7. forced persistence failure fails closed: visible warning, no manufactured first attempt, no Unit Return, and no fake `UNIT_RETURN` cursor.

---

## Engineering closure boundary

```text
S/K/L/P/R/E  PASS
U            UNTESTED / real learner only
```

This does **not** mean:

- every question has been exhaustively browser-tested;
- STABLE means mastery;
- repair converts prior Wrong/Uncertain into success history;
- later fresh/holdout transfer has been executed;
- Kian has studied or mastered Ethics-Law.

Later transfer evidence may strengthen or challenge earlier evidence but must append rather than overwrite first-attempt truth.

Next legitimate Ethics work is real learner use. Reopen only the earliest responsible owner when concrete source change, question evidence, or real learner friction appears.

---

## Truth boundaries

### Artifact Truth
- teaching/review assets → `content/politics/learning/ethics-law/`
- Ethics Projection adapter → `static-web/src/lib/politicsEthicsProjection.mjs`
- Unit Return runtime → `static-web/src/lib/politicsUnitReturn.mjs`
- Evidence enhancer → `static-web/src/components/PoliticsEvidenceEnhancer.astro`
- Ethics R/E executable tests → `static-web/scripts/test-politics-ethics-runtime.mjs`, `audit-politics-ethics-evidence.mjs`, `test-politics-ethics-evidence.mjs`

### Acceptance Truth
This file.

### Learner Truth
Private browser / Return Packet / conversation evidence only.

> **Engineering acceptance through E is not mastery or U evidence.**
