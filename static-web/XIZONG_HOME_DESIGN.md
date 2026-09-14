# Xizong Home — accepted surface design

Status: **ACTIVE SURFACE DESIGN — MAC HOME COMPOSITION ACCEPTED**  
Parent: `static-web/XIZONG_PRODUCT_BRIEF.md`  
Review safety: `static-web/XIZONG_UI_REVIEW_PROTOCOL.md`

This file records the accepted learner-facing Xizong Home product design only. It does not change medical Content, learner state, Runtime, Evidence, or System eligibility.

## 1｜Home responsibility

Home answers three learner questions:

```text
1. 我现在接着学什么？
2. 我想自由进入哪个 Current System？
3. 有没有真实需要我处理的问题？
```

It is not a repository dashboard, curriculum explanation page, or giant macro-domain card wall.

## 2｜Mac-wide composition — ACCEPTED

Primary order:

```text
Continue
→ Current Systems
→ conditional Needs Attention
→ compact global Knowledge Map
```

Recommended wide layout:

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Xizong                                                        学习 / 真题*   │
├──────────────────────────────────────────────────────────────────────────────┤
│ CONTINUE                                                                     │
│ A1 · 循环系统                                                                │
│ B7 · …                                                                       │
│ LG06 · …                          current learner stage / local progress      │
│                                                        继续 →                │
├──────────────────────────────────────┬───────────────────────────────────────┤
│ CURRENT SYSTEMS                      │ NEEDS ATTENTION                       │
│ A1 循环系统                          │ only when real evidence exists        │
│ A2 呼吸系统                          │ Memory / Marked / Chat repair etc.    │
│ A3 泌尿系统                          │                                       │
├──────────────────────────────────────┴───────────────────────────────────────┤
│ KNOWLEDGE MAP  A · B · C · D · E · F                                       │
└──────────────────────────────────────────────────────────────────────────────┘
```

If `Needs Attention` is empty, remove that region and let Current Systems expand. Do not render a congratulatory empty-state card.

`* 真题` refers to the accepted future Xizong-wide practice owner; whole-paper runtime must not be presented as already implemented before its own Runtime is built and accepted.

## 3｜Continue — ACCEPTED

`Continue` is the dominant Home object.

Use existing browser-local last-location state plus the relevant Block local state to translate the saved location into useful learner language where available, e.g.:

```text
A1 · 循环系统
B7 · …
LG06 · …
本节 Recall · 3 / 5
```

The click still returns to the existing System/Block route; the owning Runtime resumes the real stage. Home does not invent progress or mutate learner state.

Do not reduce Continue to only a repository-style label such as `12 Blocks · 312 KP`.

Visual direction:

- strong typography and alignment rather than a giant rounded card;
- meaningful local stage / progress when supported by real state;
- one obvious `继续 →` action;
- no fake percentage progress inferred from engineering readiness.

## 4｜Current Systems — ACCEPTED

Current learner-facing Systems should be direct Home entries rather than being buried inside large macro-domain cards.

For the currently projectable A Systems, show:

```text
A1  循环系统
A2  呼吸系统
A3  泌尿系统
```

Each row/region may include a very short Current-derived cognitive identity, for example a compressed System spine / mission cue supported by that System's Current owner.

The identity is orientation, not an AI-authored slogan. Do not invent medical relations for visual symmetry.

Block/KP counts may remain secondary metadata but should not dominate System choice.

## 5｜Needs Attention — ACCEPTED

Only real learner evidence may populate this region.

Possible entries include, where the corresponding Current Runtime actually owns them:

- Memory items;
- learner-marked questions;
- imported Chat repair plans / repair inbox items;
- other genuine pending repair/return states.

Do not derive attention debt from a merely non-perfect first Recall if the learning contract does not make it a blocking task.

Do not display backend S/K/L/P/R/E/U, source hashes, build status, or engineering readiness as learner attention.

## 6｜Global A–F Knowledge Map — ACCEPTED

Preserve the macro-domain taxonomy as a compact global-position layer.

It should communicate location such as:

```text
A 心肺肾
B 消化·代谢·内分泌·肿瘤
C 血液·免疫·感染
D 神经·感觉·运动·骨科
E 生殖·乳腺
F 其余临床整合
```

The map is not an additional mandatory learning layer.

Domains without a current learner-facing System should remain low-prominence map positions rather than consuming large Home cards or pretending to be actionable courses.

## 7｜Demotions from current Home

Demote from the primary repeated-use surface:

- permanent `How it works` explanation;
- `Macro domain` / repository-style labels;
- large cards for non-actionable pending domains;
- Block/KP counts as primary decision information;
- method copy that is useful once but repetitive on every daily visit.

Onboarding / help may still expose learning-method guidance when wanted.

## 8｜Mac visual direction

Home must follow Dense Calm:

- minimal but not empty;
- use most of the Mac width intentionally;
- rely on typography, rows, dividers, alignment and real learner state rather than card piles;
- Continue carries the strongest visual weight;
- Current Systems are simultaneously scannable;
- conditional attention content uses horizontal space only when it exists;
- compact A–F map provides a complete global frame without overwhelming the main task.

## 9｜Audit disposition

### KEEP

- meaningful Continue;
- free entry to any Current System;
- A–F global position;
- browser-local last-location state.

### OPTIMIZE

- translate Continue to the real learner stage where Current local state supports it;
- direct Current System entry;
- Mac horizontal composition;
- conditional Needs Attention.

### DEMOTE

- permanent method explainer;
- pending macro-domain card wall;
- engineering-like counts/chrome as primary Home information.

### RESTORE_FROM_CURRENT

- short learner-facing System identities derived from each System's own Current model rather than only displaying names/counts.

## 10｜Implementation boundary

Do not implement yet. Final UI implementation follows the broader Xizong surface freeze and must be reviewed in real Mac-wide screenshots before acceptance.
