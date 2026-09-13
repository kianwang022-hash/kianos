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
R  UNTESTED   ← earliest unresolved
E  UNTESTED   ← downstream-frozen
U  UNTESTED   ← learner-only
```

Supplemental content conclusion: `C00–C06 Current content closure PASS`.

Allowed conclusion:

> **Ethics-Law has accepted Current Source/Knowledge, complete first-round content, whole-book Learning Logic and learner-facing Projection. Subject-specific Runtime/Evidence and real learner validation remain unaccepted.**

Do not promote this to module-ready or learner-validated before R/E are independently accepted and U comes from real Kian use.

---

## Accepted upstream｜S/K + Content

All seven chapters were freshly source-grounded against canonical Natural Unit intent and readable Chengfeng source semantics, with Suyi only as a compact cross-check.

```text
C00–C06 REPAIRED
7 reviewed / 7 repaired / 0 blocked
Content closure PASS
```

High-value identities, relations, boundaries and fixed structures are represented without duplicating the Chengfeng lecture. Unsupported exact wording remains source-primary/deferred; C05 deliberately does not invent morality-function names that Current source does not expose cleanly.

---

## L｜Fresh Learning Logic — PASS

Review owner: `learning-review.json`.

```text
C00–C06 = 7 KEEP / 0 REPAIR / 0 BLOCKED
```

Accepted learner rule:

> **先判断概念/规范处在哪一层，再分清最近边界，最后放回具体关系或情境做判断。**

The accepted chain moves from moral/legal regulation through life-value judgment, ideals/beliefs, Chinese spirit, common values, morality practice and finally legal governance/personal legal practice. Dense fixed structures remain subordinate to semantic role and situational discrimination.

---

## P｜Fresh Projection re-acceptance — PASS after one repair

Review owner: `projection-review.json`.  
Executable guard: `static-web/scripts/audit-politics-ethics-projection.mjs`.

Fresh scope:

```text
7 chapters
21 learner Units
164 Current Xiao1000 questions
C01 REPAIR
C00,C02–C06 KEEP
0 BLOCKED
```

### First real P defect

Accepted C01 Unit `POL27-CF-ETHICS-C01-K03` owns `evaluation_anchor`:

> 人生价值不能只按主观感受或个人收益评价，而要回到社会历史实践尺度。

The generic Politics adapter did not map that field, so the learner-facing page preserved the Unit problem/answer and boundary but silently lost the decisive evaluation scale.

This was a **Projection defect**, not a Content/Learning defect.

### Narrow repair

`static-web/src/lib/politicsEthicsProjection.mjs` now:

- preserves `evaluation_anchor` as learner Projection data;
- surfaces it as a progressive-disclosure `评价尺度` teaching beat;
- leaves accepted C01 teaching content unchanged;
- changes no sibling subject semantics.

### Executed P evidence

First fresh Ethics Projection audit failed only on:

```text
ETHICS_EVALUATION_ANCHOR_DROPPED
ETHICS_EVALUATION_ANCHOR_PARITY 0/1
```

After the narrow repair, the same audit passed with evaluation-anchor parity `1/1`, and its runtime validation/build also passed.

The accepted Projection guard covers:

1. C00–C06 Orientation survives;
2. Natural Unit problem + answer survive;
3. high-value boundaries survive;
4. accepted evaluation scale survives;
5. backend `content_support` does not enter the generic learner component;
6. Chengfeng remains external-primary on iPad/MarginNote;
7. guide/closure remain progressive disclosure.

---

## P boundary / negative space

S/K/L/P PASS does **not** mean:

- every fixed list is visible at once;
- the eleven rule-of-law items or other dense structures become mandatory round-one recall;
- unsupported exact wording may be model-filled;
- Chengfeng becomes a second web lecture;
- shared Politics or Xi/Mao journeys count as Ethics Runtime/Evidence acceptance;
- Kian has studied or mastered Ethics-Law.

---

## Stage boundary

```text
S/K/L/P  PASS
R        UNTESTED / earliest unresolved
E        downstream-frozen
U        UNTESTED / learner-only
```

Next legitimate whole-module work is **R｜Runtime** using Ethics-specific executed learner journeys. Do not reopen accepted S/K/L/P without new source truth, question evidence, real learner friction, or a concrete responsible defect.

---

## Truth boundaries

### Artifact Truth
- teaching/review assets → `content/politics/learning/ethics-law/`
- Ethics Projection adapter → `static-web/src/lib/politicsEthicsProjection.mjs`
- P guard → `static-web/scripts/audit-politics-ethics-projection.mjs`
- shared contracts → `content/politics/LEARNING_CONTRACT.md` + `content/politics/INTERACTION_CONTRACT.md`

### Acceptance Truth
This file.

### Learner Truth
Private browser / Return Packet / conversation evidence only.

> **Accepted Projection is not Ethics-Law Runtime/Evidence acceptance, mastery, or U evidence.**
