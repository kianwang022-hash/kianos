# Xizong Practice Workbench — accepted design

Status: **CURRENT CANDIDATE — SINGLE QUESTION PRODUCT OWNER 2026-09-18**

Parent: `static-web/XIZONG_PRODUCT_BRIEF.md`
Learning authority: `content/xizong/LEARNING_CONTRACT.md`
Question Truth: `content/xizong/questions/`
Explanation Truth: `content/xizong/explanations/`
Evidence Runtime: shared Xizong Question Attempt model

## 1｜One question product

All formal Xizong question practice uses one learner-facing Practice Workbench.

```text
Practice Workbench
├─ Scope
│  ├─ one System
│  ├─ retained Wrong / Uncertain / Marked
│  ├─ whole paper / year
│  └─ later explicit custom scope
├─ Phase
│  ├─ FIRST_PASS
│  ├─ SECOND_PASS
│  └─ LATE_REVIEW
├─ Speed
│  ├─ Normal
│  └─ Fast Sweep
└─ Result visibility
   ├─ Immediate
   └─ Hidden
```

These are parameters of one task family, not separate question products.

System Completion does not own a private question UI. It finishes System Recall and hands the learner into Practice with `scope=SYSTEM:<id>`.

Whole-paper work later uses the same Workbench with `scope=PAPER:<year>`; it must not create a second answer/evidence runtime.

## 2｜Stable workbench geometry

Mac-wide:

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Scope · Phase · progress · Fast Sweep · Result · Mark                        │
├───────────────────┬──────────────────────────────────────────────────────────┤
│ Question Map      │ Current Question                                         │
│ local scroll      │ stem                                                     │
│ state only        │ options                                                  │
│                   │                                                         │
│                   │ Answer / Explanation after legitimate reveal             │
└───────────────────┴──────────────────────────────────────────────────────────┘
```

Question Map shows only state allowed by the current result-visibility policy.

## 3｜Explanation is one layered object

After legitimate result reveal, the Workbench consumes the Current explanation owner without semantic rewriting.

Preferred hierarchy:

```text
考点 exam_target
→ 判断轴 decision_axis
→ 推理链 reasoning_chain
→ 正确项为什么对 correct_option_reason
→ 高价值干扰项 valuable_distractors
→ 常见断点 common_failure_node
→ 条件变化 / 迁移 transfer_rule
```

Do not show every field merely because it exists. Stable correct work may advance with minimal feedback. Wrong / Marked / deliberate review may expose the complete useful explanation.

Missing fields stay absent. UI never synthesizes substitute medical explanation.

Reviewed Question→Knowledge relation is a separate optional routing layer and never blocks question practice.

## 4｜Evidence

One append-preserved Question Attempt model remains authoritative across scopes and phases.

```text
correctness
≠ Marked
≠ result visibility
≠ question scope
```

Marked is explicit learner state and is orthogonal to correctness.

SECOND_PASS targeted scope may derive from prior Wrong / Uncertain / Marked without creating a second question store.

## 5｜System Completion boundary

System Completion owns:

```text
System completed
→ protected System Recall
→ Recall Reveal
→ complete Recall
→ handoff to Practice(scope=current System)
```

It does not own question rendering, Question Map, explanation layout, Fast Sweep, result visibility or retained-item review.

## 6｜Whole-paper boundary

Whole paper is a scope of Practice, not a separate product.

Default:

```text
scope = paper/year
result visibility = hidden
timer = exam mode when enabled
→ submit/end
→ learner-controlled reveal/review in the same Workbench
```

Score/Evidence compatibility remains a later bounded implementation gate.
