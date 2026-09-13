# Politics UI Review Protocol — closed-projection optimization first

Status: **CURRENT DESIGN / IMPLEMENTATION SAFETY PROTOCOL**  
Scope: learner-facing Politics UI implementation / Projection optimization  
Learning authority: `content/politics/LEARNING_CONTRACT.md`  
Interaction authority: `content/politics/INTERACTION_CONTRACT.md`  
Product status: `static-web/POLITICS_PRODUCT_STATUS.md`  
Detailed accepted UI decisions: `static-web/POLITICS_PRODUCT_BRIEF.md` + five subject design files  
Derived Projection ledger: `content/politics/projection/manifest.json`

This file does not own Politics knowledge, Current Content, Learning Logic, Runtime semantics, Evidence semantics, learner progress, or new UI design. It owns one narrower rule:

> **Politics UI productization starts from the already-closed Current → Projection → Runtime / Evidence / Repair / Return loop. Optimize the accepted Projection; do not redesign it from raw Content.**

---

# 1｜Hard rule: accepted Projection is the product baseline

Politics is not a blank-slate Projection project.

Current state:

```text
Current Politics Content / Learning Logic
        ↓
accepted subject-specific Projection semantics
        ↓
53 compiled chapter Projection owners
        ↓
160 Current Natural Unit owners accounted
        ↓
existing Runtime / Evidence / Repair / Return
        ↓
Mac-wide UI implementation / optimization
```

Not:

```text
raw chapter JSON
→ UI / Codex invents a new cognitive shape
→ reconnect Runtime afterward
```

All five Politics subjects are already accepted through `S/K/L/P/R/E`; `U` remains learner-only. Normal UI implementation therefore does **not** reopen Learning / Projection / Runtime / Evidence merely because a cleaner layout can be imagined.

A reopen requires fresh contradictory evidence and must identify the earliest responsible owner/gate.

---

# 2｜Whole learner loop before local UI optimization

Before changing a local Politics learner surface, reconstruct the relevant live loop far enough to understand what comes before and after it.

Shared first-round loop:

```text
Politics Home / meaningful Continue
→ subject / chapter / current Natural Unit orientation
→ Chengfeng continuous study on original iPad / MarginNote surface
→ return / optional close or checkpoint
→ Xiao1000 clean verification in Astro
→ stable correct → continue cheaply
   OR Wrong / meaningful Uncertain
   → smallest sufficient repair
   → owning Chengfeng source and/or Chat when appropriate
   → exact return to interrupted question / Unit path
→ next question / Natural Unit / meaningful Resume
```

Later phases may add selective Memory, compression, analysis-output practice and Mock transfer when their owning phase makes them relevant.

Do not optimize a local page in isolation if the change can break:

- Chengfeng surface ownership;
- Natural Unit identity / position;
- clean-attempt answer protection;
- stable-correct fast path;
- Wrong / Uncertain admission;
- repair provenance;
- Return Packet semantics;
- question identity / Workbench behavior;
- later Memory / analysis-output timing;
- private learner-state boundaries.

---

# 3｜Required four-way UI / Projection audit

Before proposing or implementing a material Politics UI change, classify the existing learner-facing element as one of:

## `KEEP`

The existing Projection / Runtime behavior already expresses the accepted cognition or interaction and must survive materially unchanged.

Typical examples:

- Chengfeng continuous-learning handoff to iPad / MarginNote;
- one Natural Unit owning the main cognitive stage at a time;
- clean Xiao1000 attempt without answer leakage;
- stable correct → cheap continue;
- Wrong / Uncertain → bounded repair;
- Return to the interrupted Unit / question;
- first-attempt evidence preservation;
- accepted historical Politics Workbench information architecture and interaction burden.

## `OPTIMIZE`

The semantic object and learner behavior are correct, but Mac-wide geometry, density, typography, hierarchy, simultaneous visibility, interaction cost or visual polish can improve.

Examples:

- use wide horizontal geometry for truly parallel relations;
- reduce narrow article-column carryover;
- keep decisive first-round structure visible without unnecessary reveal controls;
- demote chrome while keeping the same action/state semantics;
- modernize the preserved Politics Workbench visually without adding learner steps.

`OPTIMIZE` must not mutate Politics Content, learning order, state gating, evidence meaning or source ownership.

## `RESTORE_FROM_PROJECTION`

The compiled Cognitive Projection owner already contains an accepted learner-facing semantic object, but the current UI drops it, over-compresses it, hides it behind unnecessary interaction, or falls back to a lossy generic adapter.

Restoration source:

```text
content/politics/projection/manifest.json
→ corresponding subject/chapter *.projection.json
→ referenced Current field(s)
```

The UI must restore the **compiled Projection disposition**, not re-read raw Current and invent a new shape.

Examples include restoring an accepted:

- History cause layer / evaluation / turning-point geometry;
- Marxism topology / reasoning chain / simultaneous multi-map visibility;
- Mao role / theory-response geometry;
- Xi hierarchy / identity / fixed-formulation boundary;
- Ethics-Law evaluation anchor / concept-boundary / scene matrix;
- `REFERENCE_ONLY` disposition that must remain non-teaching payload;
- `first_round_exact` boundary that must remain Current-owned only.

## `DEMOTE`

The surface exposes something legitimate but it should not compete with the current cognitive action.

Examples:

- source / engineering metadata;
- chapter/unit counts as learner chrome;
- Runtime state labels that are implementation detail;
- deep provenance;
- later precision/reference material shown too early;
- repeated explanation of Suyi / Chengfeng / Xiao1000 architecture;
- stable/correct review information that creates unnecessary process burden.

Demotion changes prominence/timing, not ownership or capability.

---

# 4｜Politics-specific protected behaviors

The following are not redesign targets during normal UI implementation.

## 4.1 Surface ownership

```text
Suyi       framework / orientation / exactness cross-check input
Chengfeng  continuous first-round mainline on original iPad / MarginNote
Xiao1000   verification / transfer evidence in Astro
KianOS     orientation / selective projection / verification / repair companion
Chat       adaptive semantic repair when earned
```

`Source ownership ≠ Surface ownership.`

Astro must not become a second continuous Chengfeng reader because Projection assets are richer now.

## 4.2 Cognitive state chain

Preserve:

```text
ORIENT
→ EXTERNAL_LEARN
→ RETURN / CLOSE
→ VERIFY
→ stable correct → CONTINUE
→ Wrong / Uncertain → REPAIR → VERIFY or CONTINUE
```

These states may share one continuous workspace; they are not permission to manufacture extra pages or mandatory confirmations.

## 4.3 Projection authority

Compiled Projection assets are the accepted learner-facing representation layer.

Hard UI consumer rules:

- consume `content/politics/projection/**` for cognitive shape;
- resolve only the Current refs explicitly carried by the Projection owner;
- null / empty means do not synthesize a missing teaching value;
- selector scope must not be widened;
- `first_round_exact` may only render accepted Current-owned first-round exact objects;
- `REFERENCE_ONLY` must not become an independent learner teaching Unit;
- Chengfeng handoff remains `IPAD_MARGINNOTE`;
- unsupported / stale Projection must fail closed rather than falling back to raw-Current shape inference.

The durable validator `static-web/scripts/validate-politics-cognitive-projection-assets.mjs` protects these bindings in Politics QA.

## 4.4 Xiao1000 Workbench

The accepted historical Politics Workbench is a protected interaction/reference asset, not a Cognitive Projection redesign target.

Preserve materially:

- clean full-width question attempt;
- 2×2 Mac options when appropriate;
- Normal / Fast behavior;
- Uncertain / favorite / mark;
- no correctness leak before submission;
- submitted result left summary/evidence + right knowledge/source review composition;
- `一句话带走`, answer delta, optional cause/note, refined explanation/source/original Xiao explanation where legally available;
- Next / Return behavior;
- zero new mandatory `结构 / 易混 / diagnosis` process.

Allowed work is visual modernization and exact Current binding, not learner-process expansion.

---

# 5｜Subject-specific geometry must survive optimization

Shared shell does not authorize shared cognitive shape.

Politics UI implementation must preserve each compiled subject grammar:

```text
Marxism
relation / topology / reasoning / mechanism / boundary

History
stage / chronology / parallel cause / causal chain / turning point / evaluation

Mao
historical problem / theory response / role / position / sequence boundary

Xi
hierarchy / role / identity / goal / principle / path / exact-boundary distinction

Ethics-Law
concept identity / normative boundary / evaluation / situational application
```

Do not convert them into one generic card grid, one universal vertical chain, or one article template.

Mac-wide optimization should increase **simultaneously useful relation visibility**, not simply add panels or text.

---

# 6｜Required read path before local implementation / review

For ordinary Politics UI implementation or review, use the smallest complete Current path:

```text
1. `content/politics/CURRENT.md`
2. `static-web/POLITICS_PRODUCT_STATUS.md`
3. this `POLITICS_UI_REVIEW_PROTOCOL.md`
4. `content/politics/LEARNING_CONTRACT.md`
5. `content/politics/INTERACTION_CONTRACT.md`
6. relevant accepted subject design file
7. `content/politics/projection/manifest.json`
8. exact chapter `*.projection.json`
9. only the Current field refs selected by that Projection owner
10. existing Runtime / Evidence / Repair / Return implementation touched by the change
```

For the Xiao1000 Workbench, also read the accepted historical Workbench reference named in `POLITICS_PRODUCT_BRIEF.md`; do not use Legacy outside that bounded role.

Do not start from raw chapter JSON alone and do not ask Codex to rediscover the subject grammar.

---

# 7｜Global-impact check before accepting a local UI change

Before accepting a Politics UI recommendation or implementation, explicitly check internally:

```text
Learning Logic impact              none / named
Projection semantic impact         none / named
Projection asset binding impact    none / named
Runtime gating impact              none / named
Evidence impact                    none / named
Repair / Return impact             none / named
Chengfeng surface-ownership impact none / named
Xiao1000 clean-attempt impact      none / named
Workbench interaction impact       none / named
Memory / later-phase impact        none / named
```

If a non-trivial impact appears, resolve it before calling the UI change a harmless optimization.

A visually attractive screenshot is not sufficient acceptance evidence.

---

# 8｜Discussion / implementation order

For each Politics learner surface:

```text
A. whole-flow position
B. existing accepted behavior / Projection asset
C. KEEP / OPTIMIZE / RESTORE_FROM_PROJECTION / DEMOTE audit
D. Mac-wide implementation / visual recommendation
E. upstream + downstream safety check
F. browser screenshot / real geometry review
G. zero-semantic-diff acceptance
```

Do not lead with a replacement mockup before A–C are understood.

---

# 9｜Reopen threshold

Normal Politics UI work must not reopen S/K/L/P/R/E.

A redesign/reopen is justified only when fresh evidence can state:

```text
what accepted semantic / learner behavior is wrong
→ which Current / Projection / Runtime owner is responsible
→ which earliest gate must reopen
→ why KEEP / OPTIMIZE / RESTORE_FROM_PROJECTION / DEMOTE is insufficient
```

Without that evidence, continue as Projection optimization.

Real learner validation remains `U`; repository state, screenshots, CI and simulated journeys cannot manufacture it.

---

# 10｜Compact rule

> **政治 UI 不是重新设计 Projection；它是在已经闭合的 Current → Projection → Runtime/Evidence 链上做 Mac-wide 产品化。先看完整闭环，再做局部优化；先消费已编译 Projection，再谈布局；任何漂亮都不能以重新猜语义、破坏 Surface Ownership、Question Evidence 或 Return 为代价。**
