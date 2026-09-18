# Xizong Practice Workbench — accepted design

Status: **ACCEPTED FOR MAIN — FUNCTION / RUNTIME / PRACTICE L3 VISUAL 2026-09-18 · REAL LEARNER U PENDING**

Parent: `static-web/XIZONG_PRODUCT_BRIEF.md`  
Visual L2: `static-web/XIZONG_VISUAL_LANGUAGE.md`  
Learning authority: `content/xizong/LEARNING_CONTRACT.md`  
Question Truth: `content/xizong/questions/`  
Explanation Truth: `content/xizong/explanations/`  
Evidence Runtime: shared Xizong Question Attempt model

## 1｜One question product

All formal Xizong practice uses one learner-facing Practice Workbench.

```text
Practice Workbench
├─ Scope
│  ├─ one System
│  ├─ Wrong / Uncertain / Marked
│  ├─ whole paper / year
│  ├─ CHAT_SET — explicit qids selected by Chat
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

**Chat owns strategic judgment.** Practice does not decide when Xizong moves from FIRST_PASS to SECOND_PASS or LATE_REVIEW, does not diagnose the cause of a Wrong/Uncertain result, and does not manufacture the next learning task. It executes an explicit learner/Chat plan and preserves the resulting evidence.

System Recall hands into Practice with `scope=SYSTEM:<id>`; whole paper later uses the same Workbench with `scope=PAPER:<year>`; Chat-guided review uses `scope=CHAT_SET:<set-id>` and an explicit ordered qid list.

## 2｜Mac-wide L3 geometry — front / back

Practice uses one stable **front/back task surface**.

### Front｜作答

```text
┌───────────────────────────────────────┬─────────────────────┐
│                                       │                     │
│              Question                 │      Progress       │
│                                       │                     │
│  stem + options                       │  group progress     │
│                                       │  question navigator │
└───────────────────────────────────────┴─────────────────────┘
```

Front owns only answering and orientation.

### Back｜复盘

Wrong / Uncertain automatically flips to the back.

```text
┌──────────────────────────────┬────────────────────────────────────────┐
│ Quick learner feedback       │ Knowledge Review                       │
│                              │                                        │
│ result                       │ Current explanation                     │
│ learner / correct answer     │ reasoning / distractors / transfer     │
│ cause picker                 │ reviewed knowledge return when owned    │
│ optional note                │                                        │
└──────────────────────────────┴────────────────────────────────────────┘
```

Back follows the same interaction grammar already proven in Politics Practice:

- left = quick learner evidence;
- right = knowledge review;
- `Space` toggles Front ↔ Back;
- `Enter` submits on Front and advances on Back;
- Stable correct remains cheap and normally advances without forcing Back;
- revisiting an attempted question may use Space / Review to inspect the Back;
- learner cause/note is evidence only; Website does not diagnose the failure.

Quick learner evidence uses the shared labels:

```text
没记住
没想明白
选项没辨清
看错 / 粗心
```

These labels do not imply a medical diagnosis or automatic repair action.

Visual rules:

- Front uses two large mature surfaces: dominant Question + quieter Progress.
- Back uses one mature review surface with a roughly 32% / 68% internal split.
- Chinese typography, radius, spacing and panel treatment inherit Xizong L2 / shared visual rules.
- Do not reintroduce the old Map | Question | Explanation three-column composition.
- Linux CI validates geometry/runtime only; it is not typography evidence.
- Mac typography/aesthetic evidence comes from the dedicated macOS Visual Gate, which must prove real PingFang availability/rendering before screenshots are accepted.

## 3｜Explanation is adaptive, not a field checklist

The UI consumes the Current explanation owner faithfully. **Explanation generation/review belongs to the neighboring Content lane, not this UI/Runtime lane.**

Recovered Current production semantics:

```text
FAST_OWNER
= an accepted sufficient explanation for a straightforward question
= APPROVED / NO_CHANGE can be a final state
≠ unfinished deep-explanation debt
```

A Current explanation may own:

- `exam_target`
- `decision_axis`
- `reasoning_chain`
- `transfer_rule`

and, only where useful/owned:

- `correct_option_reason`
- `valuable_distractors`
- `common_failure_node`

Hard rule:

> **Simple questions stay simple. Richer questions may expose richer explanation. Missing optional fields are not UI debt.**

The Workbench therefore renders only fields that actually exist. It never pads a simple question to make the right rail visually symmetrical and never synthesizes missing medical explanation.

If Source truth is insufficient, Current explanation may explicitly fail closed. UI must preserve that boundary rather than infer the missing subquestion or answer logic.

## 4｜Stable correct / Wrong / Marked

A known stable question should cost approximately one answer action.

Immediate mode:

```text
correct + unmarked
→ minimal feedback
→ automatic next

correct + marked
→ keep Marked
→ automatic next

wrong
→ save Wrong
→ keep current question visible
→ adaptive explanation / Quick Review
→ Enter continues
```

Marked is orthogonal to correctness.

Do not ask `稳吗 / 确定吗` after every correct answer.

## 5｜Keyboard grammar

Normal:

```text
1–5   select A–E
Enter submit / continue
M     mark / unmark
← →   previous / next
```

Fast Sweep:
- single choice: 1–5 chooses + submits;
- multi-select: 1–5 toggles, Enter submits.

Fast Sweep controls input speed, not result visibility.

## 6｜Second pass and later pass

The same Evidence history is reused.

Default SECOND_PASS targeted scope derives from unresolved prior:

```text
Wrong + Uncertain
```

A later fresh Stable attempt removes that question from the default targeted queue. `Marked` remains an independent learner-selected scope; marking a Stable question must not silently create default second-pass debt.

Stable correct work is skipped by default. Full resweep is explicit opt-in.

No second question store and no second “二轮题库” is created.

LATE_REVIEW remains a thinner mode of the same Runtime. It must not silently become a full System resweep; the learner/Chat must explicitly choose the late-review scope or opt into a full resweep.

## 7｜Chat-selected question set

Chat may create an explicit review/practice set by selecting canonical Question Truth IDs.

```text
Chat judgment
→ ordered canonical qids
→ Practice validates identity only
→ same Workbench executes
→ append-preserved evidence
→ evidence returns to Chat
```

This is a first-class Practice scope, not a recommendation engine.

Minimum handoff semantics:

```text
scope_type = CHAT_SET
set_id
label
question_ids[]        # ordered canonical qids
study_phase           # explicit context from Chat/learner
result_visibility     # immediate / hidden
speed                  # normal / fast
```

Optional execution metadata may include a short learner-facing intent label such as `鉴别回收` or `考前弱项`. The website must not interpret that label into additional questions or medical semantics.

Hard rules:

- Question content/options/answers/explanations are always resolved from Current Question Truth; Chat supplies IDs, not copied medical truth.
- Unknown / malformed qids fail closed and are reported; no fuzzy matching or replacement question is allowed.
- Input order is preserved unless Chat explicitly requests another order.
- Cross-System sets are legal.
- Any set size is legal; the website does not pad to a target count.
- The website never expands a CHAT_SET with “similar”, “recommended” or “related” questions on its own.
- Reviewed Question→Knowledge mapping remains optional and may not be inferred to build the set.
- Chat-selected sets are private learner execution state / handoff data and must not be committed as personal learner state into the public `kianos` repository.
- Completing a CHAT_SET creates attempt evidence only; it does not itself decide the next set, Phase transition or learner diagnosis.

Implementation should reuse the existing Practice Workbench rather than create a separate Chat-review question page.

---

## 8｜Reviewed Question→Knowledge relation

Explanation and mapping are separate owners.

A reviewed relation may provide an exact Block/KP return. Missing mapping is legal and never blocks practice.

UI rules:
- use only repository-owned REVIEWED relation targets;
- if no safe relation exists, keep the question-scoped evidence;
- never infer Block/KP from explanation text, title similarity or model intuition.

## 9｜Whole-paper boundary

Whole paper is a scope of Practice, not a separate product.

Target behavior:

```text
scope = paper/year
result visibility = hidden by default
timer = exam mode when enabled
→ complete / submit paper
→ learner-controlled reveal and review in the same Workbench
```

Hidden-result Evidence/score compatibility remains a later bounded implementation slice. SYSTEM-scope Practice may ship before it.

## 10｜Evidence

One append-preserved Question Attempt model remains authoritative across scopes and phases.

```text
correctness
≠ Marked
≠ result visibility
≠ scope
```

Explanation Content changes are included in evidence freshness/version guards so stale reviewed state is not silently treated as Current.

## 11｜Current implementation slice

Current candidate implements:
- dedicated Xizong `训练` navigation entry;
- SYSTEM scope;
- front/back Practice L3 geometry;
- Front = Question + Progress / original-number navigator;
- Back = quick learner feedback + Knowledge Review;
- Space toggles Front ↔ Back;
- Normal / Fast;
- Immediate result;
- Marked;
- adaptive Current Explanation including restored `reasoning_chain`;
- reviewed relation / fail-closed fallback;
- explicit FIRST_PASS / SECOND_PASS / LATE_REVIEW execution metadata with no automatic phase promotion;
- targeted W/U queue and explicit full-resweep choice;
- Marked preserved independently from the default W/U queue.

Current CHAT_SET slice also implements:
- manual JSON import fallback on Practice entry;
- canonical qid validation with ordered cross-System execution;
- Current Question Truth hydration by year;
- explicit Holdout protection / explicit `allow_holdout=true` override;
- the same Practice Workbench and append-preserved attempt semantics.

Still separate:
- unified typed Chat Return Packet integration beyond the manual CHAT_SET fallback;
- whole-paper scope + Hidden result;
- global retained W/U/Marked entry independent of one System;
- durable learner-data closure;
- real learner U.


---

## Superseded first-candidate visual rejection｜2026-09-18

The first L2/L3 implementation candidate was **REJECTED by Kian at Human Gate**. It is retained here only to prevent regression into that visual model.

The rejection is visual/presentation-specific. Preserve the accepted functional/runtime work unless a separate defect is found.

Observed failures to correct before the next Human Gate:

- Linux/CI Chromium evidence was incorrectly treated as a Mac typography acceptance surface; CI remains useful for geometry/runtime only.
- rendered Chinese typography felt narrow/cheap rather than the required broad/stable/full-bodied Mac reading character;
- the local top bar exposed too much software/status chrome and read like an engineering tool;
- full-height year/question inventory made Structure feel like a data table rather than quiet orientation;
- the bordered rounded workspace + pale surrounding canvas + grid divisions produced SaaS/admin/dashboard smell;
- fixed paper width inside a very large bounded workspace created conspicuous dead space rather than intentional editorial breathing room;
- Explanation read as a sequence of projected fields rather than a coherent medical annotation surface.

Do not repair this by adding more cards, borders, badges, shadows, colors or metadata.

Re-derive Practice presentation from:

```text
L1 shared aesthetic constitution
→ L2 Xizong medical cognition workspace
→ L3 Practice task geometry
```

L3 interaction semantics that remain valid unless separately reopened:

```text
pre-answer: Structure + dominant Main
Wrong / deliberate Review: Conditional Context appears
stable correct remains cheap
same fixed Practice runtime across scopes
```

Replacement accepted for main on 2026-09-18:

```text
shared L1 CJK owner (PingFang-first on Mac; broad CJK QA fallback)
→ Xizong L2 visual language
→ Practice Front: Question | Progress
→ Practice Back: Quick learner feedback | Knowledge Review
→ Space Front ↔ Back
```

The replacement removes the rejected three-column field-viewer composition, preserves low-cost Stable flow, and records learner cause/note without letting Website diagnose the learner.

### Mac Visual Human Gate accepted｜2026-09-18

Kian accepted the real macOS screenshot pair after the dedicated Mac Visual Gate proved:

```text
platform   = MacIntel
fontFamily = "PingFang SC"
fontWeight = 600
fontCheck  = true
```

Accepted Practice visual baseline:
- Front = Question + Progress;
- Back = Quick learner feedback + Knowledge Review;
- Chinese family = shared L1 PingFang-first owner;
- normal learner-facing Chinese is optically substantial rather than thin;
- future Linux screenshots cannot reopen or override this typography decision.
