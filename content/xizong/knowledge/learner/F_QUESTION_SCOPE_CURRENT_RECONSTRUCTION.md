# F Question Scope — Current Reconstruction

Status: **PASS_AFTER_EXTERNAL_OWNER_REPAIR / CLOSED**  
Date: 2026-09-20  
Scope: F — Remaining Clinical exact official System-question membership

Canonical owner:

`content/xizong/knowledge/learner/f-remaining-clinical-question-scope.json`

## 1｜原来的真实问题是什么？

F medical Content 已经是 accepted / closed：

```text
9 Blocks
121 canonical KP
40 accepted LG
medical Content closed
```

但这不能推出官方真题 scope 已闭合。

历史 frozen resolver 只得到：

```text
final-clinical-modules = 27 qids
```

而 27 道全部来自内科中毒。它漏掉 Current F 的烧伤、围术期、麻醉、无菌/创伤、切口/伤口和残余微型外科内容。

因此真实 defect 是：

> **F Content closed，但 Question → F System membership 仍未 exact closure。**

这是 routing defect，不是 121 KP 医学内容缺失。

## 2｜为什么会影响 275+？

如果 F official scope 少算，真实结果不是“repo 少一个文件”，而是：

- F 学完以后 official sweep 会漏题；
- Wrong / Uncertain 无法完整回收；
- 题目覆盖度和材料 readiness 被低估；
- 后续 Material / Forecast 若使用 scope count，会建立在错误题池之上。

相反，若把 F9 的外部 Recall 题全部塞回 F，又会：

- 重复抢占 C / O9 owner；
- 破坏 Current ownership split；
- 把 Integration Primary 误读成“F 重拥有所有外部医学内容”。

## 3｜Authority chain

本轮沿用 B/C/D/E 已证明的方法：

```text
Current Question Truth
← exact historical question namespace / reviewed Lecture locator
→ historical resolver evidence
→ Current F Source / Learning / Content owner
→ external-owner reconciliation
→ exact Question → F membership
```

Historical evidence:

- resolver: `app/learning/xizong-question-pool.js`
  - blob `8b73c9e0a49e02ad3cf296832f90dd19fe4da161`
  - `resolveSystemClosureFromSourceUnion`
- routing:
  - `public/xizong-system-source-routing.v1.local.json`
  - blob `e184f0fc899de0a6bf47c5b194fe328d2f1977de`
  - 3750 rows
- Source/collision contract:
  - `public/xizong-system-official-scope.v2.local.json`
  - blob `b239dba8e3e2969b47a534be9d5daa3e001ab5d3`

Current F owners:

- `content/xizong/knowledge/systems/f-remaining-clinical/system.json`
- `content/xizong/knowledge/learner/f-remaining-clinical-learning.json`
- `content/xizong/knowledge/learner/f-remaining-clinical-content.json`

## 4｜为什么旧 27 不是 Current F？

旧 resolver 的 27 道全部来自：

`internal_medicine|第七章 中毒|1.中毒`

Current F 的外科 Source 已经重建为：

- F3 无菌 / 开放伤；
- F4 烧伤；
- F5/F6 围术期；
- F7/F8 麻醉；
- F9 ownership-first residual tail。

历史 routing 中这些题大量仍以旧外科 Lecture scope + null/legacy page 形式存在，旧 page-union resolver 没有把它们完整提升进 frozen F pool。

所以：

```text
historical frozen F = 27
≠ Current exact F target
```

## 5｜Current candidate reconstruction

按 Current F Source boundary 恢复出的 reviewed candidate：

```text
中毒                         27
烧伤                          9
围术期                       10
麻醉                         14
常考伤口小结                  4
其它外科总论                  8
------------------------------
reviewed Current candidates  72
```

没有从 Block 位置、LG 位置或 Outline 数量反推 qid。

## 6｜F9 external-owner attack

Current F9 的 Learning/Content 定义明确是：

```text
INTEGRATION_PRIMARY
→ ownership split first
→ external-owner Recall / Apply
→ targeted Source return only for residual Micro Primary
```

并明确：

- 移植 → H14 Recall；
- 癌症预防 / 癌痛 / 抗肿瘤药 → Tumor Gate Recall / Integration；
- F9 真正新 Primary 只保留腹腔镜 + 体表肿物残余 Micro Primary。

因此历史 `其它外科总论` 的 8 道候选不能机械全部归 F。

### A. 2012 N081 — 癌症二级预防

`xizong-official-2012-n081`

Current owner:

`content/xizong/knowledge/overlays/o9-tumor-general/`

Verdict:

```text
F candidate → O9 tumor-general overlay
EXCLUDE_FROM_F_SYSTEM_SCOPE
```

这不是把题转给 B；B 自己也明确“不拥有 complete tumor-general overlay beyond B organ application”。

### B. 2018 N058 — 超急性排斥

`xizong-official-2018-n058`

核心判断轴：

> 受者已有 donor-specific antibody → hyperacute rejection

Current F9 明确把移植 Primary 留给 H14。

Verdict:

```text
F candidate → C / H14
EXCLUDE_FROM_F
ADD_TO_C
```

C scope 因此从 289 → **290**。

## 7｜Current exact F identity

最终：

```text
reviewed Current candidates          = 72
external-owner exclusions            = 2
Current exact F scope                = 70
year range                           = 2005–2026
inventory SHA256                     = f99f2ad151fbbf024ecf445447d3fda33d3de83f8ce90d791710b0259605e6b8
cross A1–E overlap after repair      = 0
unresolved membership ambiguity      = 0
```

Accepted route-family accounting:

```text
F1/F2 toxicology                     27
F4 burn                               9
F5/F6 perioperative                  10
F7/F8 anesthesia                     14
F3/F6 wound summary                   4
F3/F6/F9 true other-general-surgery   6
---------------------------------------
total                                70
```

## 8｜Source Fidelity caveats

### 2010 N113

Current Question Truth preserves the shared trauma stem, options and official answer but the exact subquestion sentence is missing.

Current handling:

```text
System membership = retained in F
precise Question→KP = NOT asserted
missing subquestion = NOT reconstructed from answer/options
```

Historical reviewed source routing + Current F3 trauma/open-wound ownership is enough for System membership, but not enough to manufacture finer semantic mapping.

### 2023 N041

The historical question uses an awareness/fever timing clue around organophosphate poisoning.

Current handling:

- Question → F membership is accepted from reviewed toxicology routing;
- unstable historical timing wording is not promoted as Current toxicology diagnostic truth;
- Current diagnosis remains exposure + cholinergic syndrome grounded.

## 9｜修了哪个最小 owner？

Changed owners only:

1. new canonical F question-scope owner  
   `f-remaining-clinical-question-scope.json`;
2. C question-scope owner, for the single H14 transfer;
3. C/F reconstruction receipts and program cursor.

Not changed:

- F 121 KP medical Content;
- Question Truth;
- Explanation Truth;
- Question→KP Crosswalk;
- learner state;
- Review;
- Forecast;
- scheduler.

## 10｜现在能力链多了什么？

Before:

```text
F medical Content closed
→ trusted official F sweep = BLOCKED
```

Now:

```text
F medical Content closed
→ exact 70-qid F membership
→ trusted official F sweep becomes available
→ Wrong / Uncertain can enter existing repair path
→ precise Q→KP remains separate reviewed Crosswalk
```

## 11｜还有什么 UNKNOWN？

For F Question→System membership:

```text
UNKNOWN = none
```

Still separate and not solved by this task:

- learner U;
- sparse Question→KP relations;
- declared exact Source / Visual gaps inside F;
- current-year new source delta.

## 12｜Targeted proof

Required proof:

- deterministic expansion = exactly 70 unique qids;
- inventory SHA256 exact;
- zero overlap with A1/A2/A3/B/C/D/E after C transfer;
- Current Question Truth identity unchanged;
- no Block/LG/KP inference introduced;
- F9 external Recall does not become duplicate Primary ownership.

## 13｜Self-attack

> 有没有一种情况，文件现在看起来齐了，但 learner 实际仍然缺这个能力？

Yes.

Exact membership proves only that the right official F questions are available.

It does **not** prove Kian can:

- recognize the decisive condition;
- switch between toxicology / burn / perioperative / anesthesia;
- handle a new transfer case;
- retrieve precision fields under time pressure.

Those require real learner attempts and remain learner U.

## 14｜Verdict

```text
F exact official-question membership
= PASS_AFTER_EXTERNAL_OWNER_REPAIR / CLOSED

Current F qids = 70
C owner repair = 289 → 290
O9 external overlay exclusion = explicit
Question→KP = unchanged / separate
F medical Content = remains CLOSED
```
