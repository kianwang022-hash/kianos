# Politics Mac-wide Implementation Audit — S/K/L/P/R/E → UI

Status: **CURRENT IMPLEMENTATION DELTA AUDIT / NOT A NEW SEMANTIC OWNER**  
Program: GitHub Issue #113  
Product owner: `static-web/POLITICS_PRODUCT_STATUS.md`  
UI review protocol: `static-web/POLITICS_UI_REVIEW_PROTOCOL.md`  
Learning authority: `content/politics/LEARNING_CONTRACT.md`  
Interaction authority: `content/politics/INTERACTION_CONTRACT.md`  
Projection ledger: `content/politics/projection/manifest.json`

This document records a bounded Current implementation audit requested before Politics closure. It does not reopen S/K/L/P/R/E, change political content, create a new Projection grammar, or own learner state. Product/semantic decisions remain in the owners above.

## 1｜Whole-flow conclusion

Current Politics is already closed through engineering Evidence:

```text
S/K  Current source + content closed
L    Chengfeng = only continuous first-round mainline on original iPad/MarginNote
     Suyi = framework/exactness cross-check input, absorbed rather than a second course
     Xiao1000 = verification/evidence, not learning order
P    five subject-native grammars compiled into 53 chapter / 160 NU Projection owners
R    Continue / Unit Return / source repair / exact return executable
E    immutable first attempt + WRONG/UNCERTAIN distinction + event-local repair provenance + fail-closed persistence
U    real Kian use only; still UNTESTED for current productized paths
```

Therefore normal Politics productization is a **Projection-consumer/UI migration**, not a new learning architecture.

## 2｜Current content shapes verified against real owners

Representative Current owners were re-read rather than assuming the design documents were correct.

### Marxism
`content/politics/learning/marxism/ch02.json` owns a relation model:

```text
联系网络
→ 发展
→ 矛盾提供动力
→ 量变/质变解释跃迁
→ 否定之否定解释发展形式
→ 方法论
```

The learner risk is relation responsibility and boundary confusion, not a list of equal definition cards.

### History
`content/politics/learning/history/ch06.json` owns stage/chronology plus parallel mechanisms, evaluation and turning points. Example: CCP wartime mechanisms are parallel contributors to long-war capability; they must not be serialized into a fake chain.

### Mao
`content/politics/learning/mao/ch04.json` owns one historical construction problem with parallel theoretical responses: Ten Major Relationships, socialist contradiction theory, handling different contradiction types and a Chinese industrialization road. Position/boundary is the main learner task.

### Xi
`content/politics/learning/xi/ch02.json` explicitly distinguishes goal expression, road formation, road characteristics, essential requirements, advancement principles, practice relationships and civilizational significance. First-round role/hierarchy must precede full-list exactness.

### Ethics-Law
`content/politics/learning/ethics-law/ch05.json` owns concept/norm identity + nearest boundary + application scene. Core/principle, scene identity and fixed hats must be visible as one judgment object when useful.

These five shapes agree with the accepted compiled Projection grammar; no S/K/L/P reopen is justified by this audit.

## 3｜Material Current implementation deltas

### A. Compiled Projection is not the normal production consumer — RESTORE_FROM_PROJECTION

Current route `static-web/src/pages/politics/[subject]/[chapter].astro` uses `PoliticsCognitiveWorkspace` only for Marxism `ch00`. Every other chapter still uses `PoliticsChapterRuntime`.

The page loads chapter data through `politicsCurrent.mjs` / historical first-ready adapters rather than resolving the compiled `content/politics/projection/**` chapter owner as the learner-facing cognitive-shape authority.

Required migration:

```text
projection manifest
→ exact chapter projection owner
→ only refs selected by that projection
→ subject-native geometry renderer
→ existing Runtime/Evidence/Repair/Return
```

No raw-Current semantic inference fallback when Projection is absent/stale/REFERENCE_ONLY.

### B. Generic whole-chapter long document remains active — RESTORE_FROM_PROJECTION

`PoliticsChapterRuntime.astro` currently renders:

- chapter orientation;
- every Natural Unit vertically;
- primary guide cognition inside `<details>`;
- source locators inside `<details>`;
- closure inside `<details>`;
- generic teaching shapes.

This contradicts the accepted product grammar where one Natural Unit owns the main cognitive stage, important first-round structure is visible by default, and subject-native geometry varies.

Replace the long-document experience with one continuous NU workspace and free NU switching. Chapter context stays visible at low weight; the current NU owns the main stage.

### C. Marxism C00 pilot still exposes retired product friction — OPTIMIZE / DEMOTE

The current `PoliticsCognitiveWorkspace.astro` is useful as a runtime calibration but must not be mass-rolled unchanged.

Observed issues:

- visible engineering chrome: `STATE`, `MAP 01`, `INSPECTOR`;
- multiple maps use tabs/hide one even when Current Projection says simultaneous visibility;
- permanent ~25% right inspector even when no contextual payload is useful;
- mandatory button chain `去 iPad → 我学完这一 Unit 了 → RECALL → 能重建 → VERIFY`;
- many learner-facing semantic labels/content rendered at roughly 8–12 px;
- substantial bordered/panel treatment.

Accepted correction:

- semantic states remain internal/runtime states but do not become a learner wizard;
- ORIENT and Chengfeng handoff stay in one stable workspace;
- returning from Chengfeng does not require a mandatory Recall page or “学完” confirmation;
- optional lightweight mental close is enough when Current owns one;
- genuine multiple first-round maps may be simultaneously visible on Mac;
- Context is conditional, not a permanently reserved rail;
- engineering state labels/provenance stay out of normal chrome;
- increase learner typography and reduce card/panel density.

### D. Politics Home foregrounds architecture/health instead of learner action — OPTIMIZE / DEMOTE

Current `politics/index.astro` foregrounds:

- method explanation;
- `Current 已接通` health wording;
- subject/chapter counts;
- five large subject cards with every chapter link expanded.

Accepted Politics Home should instead answer:

```text
我现在继续什么？
→ 我想自由进哪一科？
→ 今天是否有真实 Wrong/Uncertain 需要处理？
```

Target priority:

```text
Politics
Continue / exact Resume if present
five subject entries
conditional Wrong/Uncertain handoff only when real evidence exists
secondary chapter selection
```

No repo health, no fake mastery/progress, no permanent explanation of Suyi/Chengfeng/Xiao architecture, no card wall.

### E. Current static quiz is not the accepted Politics Workbench — RESTORE protected interaction

The current Astro quiz is a simplified one-question card. It does not reproduce the accepted bounded Politics Workbench information architecture.

The authorized historical reference is only:

- `kianos-legacy/runtime/frontend/src/learning/PoliticsWorkbench.jsx`
- matching CSS

Restore materially, against Current question truth/evidence rather than Legacy truth:

Clean attempt:

- full-width stem;
- 2×2 options on Mac when readable;
- Normal / Fast;
- `1–4`;
- fast single-choice immediate submit;
- multiple choice confirmed submit;
- optional Uncertain / Favorite / mark;
- no correctness leak.

Submitted result:

```text
left summary / evidence
  result
  一句话带走
  learner answer vs formal answer
  missing / extra choice delta
  optional cause
  optional note

right knowledge / source review
  理解这道题
  exact Current source refs / admissible source gap
  original Xiao explanation where Current owns it
  bounded refined explanation only when Current legally owns it
  Next / Return
```

Do not restore Legacy scheduler/due/mastery semantics. Do not add new mandatory diagnosis/结构/易混 stages.

### F. Runtime/Evidence data is good; stable learner chrome is too heavy — DEMOTE UI, KEEP semantics

`PoliticsUnitReturnEnhancer` correctly protects:

- immutable first attempt;
- exact question/unit identity;
- persistence fail-closed;
- source repair return;
- no mastery manufacture;
- Resume.

But its visible stable-path node ledger, evidence counts, precision mode and repeated “STABLE is not mastery” guard are backend-rich learner chrome.

UI rule:

```text
stable + complete
→ near-zero-cost continue; no evidence dashboard

Wrong / Uncertain
→ show only affected object(s), source return and exact continuation
```

Keep the full internal evidence model unchanged.

### G. Precise repair data is valuable but should merge into the problem state — OPTIMIZE

`PoliticsRepairEnhancer` already owns useful tested-node / reasoning / current-unit / cross-unit / traps / lecture-return / transfer data.

Keep this bounded data, but learner-facing presentation should:

- open only after Wrong/meaningful Uncertain;
- prioritize the first meaningful failure and exact return;
- use learner language, not evidence/debug terminology;
- keep cross-unit/deep details secondary;
- not expose `Precision: 不入` or ownership bookkeeping as primary chrome;
- integrate naturally with the Workbench result/review rather than create another card/workflow.

## 4｜Mac-wide target grammar

Shared shell:

```text
thin location / meaningful state
→ current Natural Unit main stage
→ conditional context only when it earns space
→ source / verify / return actions remain in place
```

Subject-native stage:

```text
Marxism    topology / relations / reasoning / boundaries
History    stage / chronology / cause / mechanism / turning / evaluation
Mao        historical problem / parallel theory responses / role-position boundaries
Xi         hierarchy / identity / current list / nearest role contrast
Ethics-Law concept identity / boundary / evaluation / scenario application
```

Hard UI consequences from Kian preferences:

- Mac wide is design origin;
- use width for simultaneous relations, not permanent chrome;
- core learner text must be comfortably readable; 8–12px text is metadata-only territory, not the main cognition;
- important first-round structure visible by default;
- interaction changes cognitive object/state, not merely reveals baseline information;
- no universal card grid;
- no permanent empty inspector;
- no giant whitespace;
- stable/correct path visually quiet and extremely fast;
- Wrong/Uncertain may become heavier because useful information appears;
- preserve exact source/Chat return context.

Exact font/palette/spacing tokens remain screenshot-calibrated; this audit does not freeze pixels without real browser evidence.

## 5｜Optimized learner flow

The learner-visible first-round flow should feel like:

```text
Politics Home
→ Continue or choose subject/chapter
→ current NU cognitive map/structure already visible
→ open/continue Chengfeng on iPad/MarginNote while Mac keeps position/map
→ return to the same NU
→ optional 10–20s mental close if useful; no mandatory confirmation
→ start current NU Xiao1000
→ stable correct: next cheaply
   OR Wrong/Uncertain: result + smallest repair + exact source/Chat return
→ resume exact question / next question / next NU
```

Runtime may retain internal ORIENT / EXTERNAL_LEARN / RETURN/CLOSE / VERIFY / REPAIR states. The learner does not need a page/button ceremony for every state transition.

## 6｜Implementation pressure tests before mass rollout

Before converting all 53 chapters, one implementation slice must prove all five grammars with real compiled Projection assets:

- Marxism: multi-map/topology + reasoning + boundaries;
- History: dense chapter with parallel mechanisms and evaluation;
- Mao: parallel theory responses/role positioning;
- Xi: hierarchy role + dense owning list + nearest confusable role;
- Ethics-Law: concept-boundary-application + scene/role matrix.

Also prove:

- Politics Home clean/no-evidence and W/U-present states;
- Chengfeng handoff/return with no second-textbook rendering;
- Workbench clean Normal/Fast and submitted result;
- stable fast path;
- Wrong and correct-but-Uncertain repair;
- exact source return and return-to-question;
- persistence failure remains fail-closed;
- reload/Resume to the meaningful exact action;
- narrow Mac fallback without shrinking core learner text or collapsing cognition into a generic card list.

Only after screenshot + behavior review should the same renderer grammar expand across all 53 chapter Projection owners.

## 7｜Acceptance boundary

Politics reaches `SUBJECT_CLOSED_FOR_HOME` only after:

```text
compiled Projection consumed in production
→ five-grammar pressure test accepted
→ full 53 chapter rollout
→ current Politics QA / runtime / evidence regressions PASS
→ real Mac-wide + narrow screenshots reviewed
→ independent Chat/Pro product review
→ Kian accepts material visual/structural choices
→ zero-semantic-diff verified
→ merge + main readback + branch retirement
```

This still does not claim U / mastery. Real Kian learning use remains the only U evidence.
