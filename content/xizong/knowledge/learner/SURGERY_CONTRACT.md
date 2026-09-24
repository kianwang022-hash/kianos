# Xizong Surgery Contract

Status: **CURRENT**  
Role: Surgery-specific Source rebase / Knowledge + Learning upgrade rule

Parent standards:

- `LEARNING_ASSET_STANDARD.md`
- `content/xizong/LEARNING_CONTRACT.md`
- `content/xizong/CONTENT_MAINLINE.md`

Task owner:

- `content/xizong/knowledge/learner/xizong-2027-surgery-rebase-slot.json`

Source map:

- `content/xizong/knowledge/learner/surgery-27-source-map.json`

This contract answers one question:

> **When the 27 Surgery refined lecture adds large amounts of “理顺知识点 / 解释 / 总结 / 做题切入点”, which canonical layer should absorb each increment?**

It does not own medical truth. Exact medical meaning stays in the responsible Current System / Block / KP owner.

---

## 1｜Source authority

Current Surgery Source truth:

`27外科精编版【带导图】.pdf`

Stable identity:

- SHA-256: `523cc9111b69f7eb77b928234d2e86f7e2ba9949e962eac2c5a240219b5cd9a0`
- PDF pages: 285
- auditable snapshot: `content/xizong/source-snapshots/27/外科学讲义_AI阅读版_27精编_UnifiedSource_v1.md`

The old 27 follow-along Surgery PDF / legacy `外科学讲义_AI阅读版.md` is historical provenance / explanatory substrate only.

After an affected Block closes in this rebase, it may not still present the old follow-along file as Current Primary Study.

Original PDF remains the highest-fidelity Source for diagrams, tables, anatomy and spatial relations.

---

## 2｜Refined-note routing rule

The 27 refined lecture is **not** treated as “more text to copy into KP Core”.

Every meaningful increment is classified by learner responsibility.

### A｜Knowledge / KP Core / Framework

Send the increment to canonical Block/KP Knowledge when it materially improves **what the medical model means**:

- mechanism or causal explanation;
- a missing causal bridge;
- cause → consequence → compensation / failure;
- decisive differential / confusable boundary;
- why a sign, test, procedure or treatment follows from anatomy/pathophysiology;
- a decision condition that changes the correct next action;
- a cross-System connection that materially improves the owning model.

Examples:

- why flail chest causes paradoxical motion;
- why thyroid cystic hemorrhage can enlarge rapidly but does not automatically mandate surgery;
- why a particular operative complication follows from anatomic injury.

Rule:

> If removing the note would make the canonical medical model materially worse or misleading, it belongs in Knowledge.

Do not create new KP merely because the teacher added another explanatory paragraph. Prefer enriching the existing Framework / detailed expansion / boundary of the smallest responsible KP.

### B｜Learning / Guide / Logic Group / Content realization

Send the increment to the Current Learning owner when it mainly improves **how Kian should understand, retrieve or apply already-valid Knowledge**:

- “整体认识” / “理顺知识点”;
- what to look at first in a case;
- branch order / discrimination order;
- high-value comparison structure;
- chapter-level mental model;
- “先定位什么，再判断什么”;
- recall spine / compression;
- teacher summaries that reorganize stable facts into a better decision model.

Possible targets:

- `first_pass_focus`
- `stop_line`
- `recall_spine`
- Logic Group `goal` / `closure`
- accepted Source-contact natural units
- learner-facing Content / compression cues

Rule:

> If the medical facts were already correct but the refined note makes them easier to form, retrieve or apply, upgrade Learning/Guide rather than bloating KP Core.

Do not revive historical System Guides as Current owners. Current `system.json`, `*-learning.json`, canonical Block Markdown and accepted Content owners remain authoritative.

### C｜Precision

Use Precision / MI-D style storage for exact details whose value is mainly exact retention:

- thresholds;
- dates / weeks / hours;
- operative margins / resection ranges;
- doses;
- staging cutoffs;
- long lists;
- named procedures or classification rows.

Promote exact detail into Core only when it is necessary to understand the decision model itself.

### D｜Visual

If the relationship is inherently spatial or visual, preserve it as real Source Visual contact rather than forcing prose to substitute:

- anatomy;
- surgical planes;
- incision direction;
- image morphology;
- tables whose row/column geometry carries meaning;
- flow / staging diagrams.

Text may orient and test later retrieval. It may not certify a never-seen spatial model.

### E｜Do not canonicalize

Do not preserve merely because it appears in the refined notes:

- repeated slogans;
- redundant mnemonics;
- jokes;
- duplicated explanation that adds no new learner value;
- low-value teacher commentary;
- model-inferred completion of an ambiguous Source.

---

## 3｜Dual-layer rebase rule

A Surgery Source unit is not closed merely because medical Core is unchanged.

For every affected unit:

```text
27 refined Source
→ compare with Current canonical Knowledge
→ classify PRESERVE / UPDATE / NEW / RETIRE / CONFLICT
→ rebind stale Surgery Source locator
→ decide Knowledge increment
→ decide Learning/Guide increment
→ decide Precision / Visual implication
→ only then close the unit
```

Therefore:

`PRESERVE Core` can still require a Learning/Guide upgrade or Source rebind.

`UPDATE Core` does not automatically require changing learner order.

---

## 4｜Website propagation boundary

Current website architecture already derives Xizong learner content from the canonical GitHub owners.

In particular, `static-web/src/lib/xizong.mjs` reads canonical Block Markdown together with the Current System/Learning owners and hashes those sources into the learner-facing payload/evidence version.

Therefore this Surgery rebase is primarily a **content-owner update**:

```text
canonical Block Markdown / system.json / *-learning.json / cues / visuals
→ existing Xizong loader / projection
→ website content changes
```

No UI redesign or renderer change is authorized or required merely because Surgery content is upgraded.

Touch `static-web` implementation only if a concrete rendering/runtime defect prevents accepted canonical content from appearing correctly.

---

## 5｜Evidence / revision boundary

Repository construction is not learner mastery.

When an affected canonical Block changes its semantic source revision:

- historical learner observations remain historical observations;
- Current authorization must follow existing source-revision semantics;
- classify affected evidence as `PRESERVE / MIGRATE / STALE / INVALID` only where needed;
- do not invalidate unrelated Blocks merely because the Surgery Source file changed.

Avoid cosmetic rewrites that churn Block hashes without learner value.

---

## 6｜Cross-System ownership

Surgery Source spans A1 / A2 / A3 / B / C / D / E / F.

The Source chapter does not become a new Surgery mega-System.

Route each increment to the smallest existing canonical owner.

Examples:

- thyroid surgery → B D21 / D23;
- thoracic trauma / mediastinum → A2;
- breast → E;
- urinary surgery → A3;
- orthopedics → D;
- transfusion / surgical infection → C;
- perioperative / anesthesia → F;
- vascular / shock → A1;
- GI / hepatobiliary / pancreas → B.

One fact should have one canonical owner.

---

## 6A｜Reprocess v2 override

The 2026-09-24 first pass mixed three different states: Source rebind, quick Core screening, and true refined-note absorption. That ambiguity is superseded.

For **SUR27-U01–U38**, no earlier label such as `SOURCE_REBOUND`, `CORE_PRESERVE`, or `LEARNING_REVALIDATED` counts as closure by itself.

Every unit must be re-opened once and reviewed explicitly across four lanes:

```text
Knowledge / Framework
Learning / Guide
Precision
Visual
```

Only then may it close. This override exists specifically to clean prior over-claims and stale source bindings.

## 7｜Acceptance rule

A bounded Surgery batch closes only when:

1. Source identity/page scope is verified;
2. medical semantic delta is classified;
3. stale Surgery Primary Study locators are removed/rebound;
4. high-value refined explanations are routed to Knowledge vs Learning correctly;
5. relevant Precision / Visual consequences are reconciled;
6. affected downstream relation/explanation/evidence work is either revalidated or explicitly queued at the same task owner;
7. no unrelated UI or System topology work is manufactured.

The full Surgery rebase closes only when all 38 Source units in `surgery-27-source-map.json` satisfy this rule.
