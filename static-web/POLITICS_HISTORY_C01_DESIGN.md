# Politics History C01 — Cognitive Projection Pilot

Status: ACTIVE DESIGN PILOT  
Parent: `static-web/POLITICS_PRODUCT_BRIEF.md`  
Preference owner: `static-web/KIAN_UI_PREFERENCES.md`  
Current content owner: `content/politics/learning/history/ch01.json`

This file owns the learner-visible design decisions for the History C01 Cognitive Projection pilot. It does not change Politics Learning Logic, Current Content, Natural Unit ownership/order, Xiao1000 ownership, Evidence, Repair, or Return semantics.

---

## Accepted global interaction constraint

Design origin is Mac wide landscape. Important first-round structure should be visible by default when the viewport can carry it comfortably. Do not use repeated accordions/details/cards merely to keep the page visually tidy. Interaction should primarily switch the current cognitive object / task state, not reveal information that should already be visible.

---

## ORIENT — ACCEPTED

### Geometry

- one Chapter / Natural Unit workspace, not one continuously expanded Chapter document;
- chapter-level historical map remains visible as orientation;
- only one Natural Unit owns the main stage at a time;
- all Natural Units remain directly navigable; focused Unit does not become a restrictive wizard;
- main stage uses the larger left area for understanding/relations;
- right Inspector is strictly secondary and must not become another text wall.

### Attention order

```text
current question
→ decisive cause / stage / turning-point structure
→ current takeaways
→ next historical bridge
→ source handoff
```

### History C01 / Unit 01 Current fields projected

```text
stage_question
cause
turning_point
what_to_hold
next
```

No learner-facing political content is invented. Projection reorganizes Current fields only.

### Chapter orientation projected

Use Current chapter-level `stage_story`, `attention_rule`, `timeline`, and where appropriate `causal_chain` to keep the learner located in the chapter's historical movie. The chapter map is a structural orientation device, not a second lecture.

### Accepted Mac-wide frame

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ ← Politics / 史纲                 第一章｜近代中国为什么被迫进入民族救亡                     │
│                                                                                              │
│  01 鸦片战争前后      02 列强侵略      03 反侵略斗争      04 失败与民族意识觉醒              │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│  本章在讲什么                                                                                │
│                                                                                              │
│  鸦片战争            社会性质变化           列强多层侵略          持续反抗          失败/觉醒 │
│      ─────────────→       ─────────────→        ─────────────→       ─────────────→           │
│                                                                                              │
│  国情变了 → 主要矛盾和历史任务变了 → 后面所有探索都在回应这个新局面                         │
├───────────────────────────────────────────────────────────────┬──────────────────────────────┤
│                                                               │                              │
│  01 · 鸦片战争前后的中国与世界                               │  这一段带走什么               │
│                                                               │                              │
│  为什么 1840 不是普通年份，                                  │  ① 半殖民地半封建社会         │
│  而是中国历史性质发生转折的入口？                             │     是后续政治探索的共同背景   │
│                                                               │                              │
│       国内封建社会衰落          西方资本主义扩张               │  ② 民族独立、人民解放         │
│                ╲                  ╱                            │     国家富强、人民幸福         │
│                 ╲                ╱                             │     成为必须解决的历史任务     │
│                  └─── 相遇 ─────┘                              │                              │
│                         ↓                                     │──────────────────────────────│
│                  列强以战争打开市场                           │  下一步                      │
│                         ↓                                     │                              │
│             中国社会性质逐渐发生重大变化                      │  社会性质既然改变，           │
│                         ↓                                     │  接着看列强怎样把控制         │
│             基本国情 / 主要矛盾 / 历史任务形成                │  具体化。                     │
├───────────────────────────────────────────────────────────────┴──────────────────────────────┤
│                                                    [ 去 iPad / MarginNote 学这一节 → ]        │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Explicit non-goals for ORIENT

Do not foreground:

- source provenance / IDs;
- Evidence terminology;
- Runtime state labels;
- Xiao1000 questions;
- Recall controls;
- engineering metadata;
- repeated hidden panels for first-round useful structure.

Exact/source/deeper material may remain secondary, but first-round decisive relations should not require repeated reveal interactions.

---

## VERIFY / Workbench — accepted merge direction

The C01 pilot must **not replace** the previously recovered Politics question-workbench interaction model with a new simplified quiz. The prior mature Workbench is the functional base; the new Cognitive Projection work adds spatial/contextual repair capability around it.

### Preserve from the historical Workbench asset

The Current UI productization cursor already freezes these as migration targets:

```text
Normal / Fast modes
1–4 = A/B/C/D
Fast single-choice: correct → near-immediate next
wrong → stay on the current question
answer delta: learner answer vs formal answer
一句话带走
optional cause / note
AI-refined 理解这道题 when a legally promoted Current asset exists
Current refs
collapsible Xiao original explanation
fixed/easy Next
```

Do not regress these functions merely because the C01 pilot uses a new Mac-wide workspace shell.

### Add from the Cognitive Projection pilot

The new layer may add:

- Mac-wide question + repair side-by-side layout;
- keep the learner on the original question when Wrong / meaningful Uncertain occurs;
- reuse the Current History cognitive structure in the repair Inspector (cause / turning point / boundary / takeaway) when it is the smallest sufficient repair;
- restore the relevant Unit structure without forcing a full-page mode switch;
- make Wrong / Uncertain visually heavier only when useful;
- keep correct/stable work almost frictionless;
- permit local Inspector scrolling when repair content exceeds the viewport while keeping the question itself stable.

The new Cognitive Projection must **not** create a second competing explanation system. It should orchestrate existing Workbench functions + Current History structure into one lower-friction repair surface.

### Question identity / parity rule

Kian states that the underlying Politics questions have not been intentionally modified during this productization work. Treat this as a strong expectation of parity, **not as sufficient proof by itself**.

Before binding historical Workbench enrichments or historical refined explanations to Current questions, implementation must reconcile identity exactly using the strongest available stable keys, preferably:

```text
canonical question_id
+ normalized stem
+ option set/order
+ formal answer
```

If exact parity is demonstrated, reuse the Current Xiao1000 question object and attach the migrated Workbench behavior/enrichment to it. Do not fork or duplicate the question bank merely to recover the old UI.

If a historical enrichment cannot be proven to belong to the exact Current question, fail closed: keep the Current question and omit that enrichment.

### Historical refined-explanation boundary

The historical 1148-record refined explanation asset remains a separate bounded migration issue. Its known pinned SHA256 is:

`e48d2b06ec1747f97451d147dc172a9b2acf9219d19c5f274c539dc400efbdec`

The old runtime exposed this content as `question_explanation`. It may be used in the future Workbench only after the existing Recovery Contract's durable-role proof and Current promotion are satisfied.

Until then:

- do not hidden-fetch or fallback to Legacy/local snapshots;
- do not treat the 1148 historical rows as Current merely because question parity appears likely;
- preserve a clean fallback using Current answer delta / History structure / Xiao original explanation / Chat;
- never reintroduce old due/mastery/scheduler state alongside the explanation asset.

### Target learner experience

```text
clean question
→ correct = near-immediate continuation

Wrong / meaningful Uncertain
→ stay on exact question
→ show answer delta
→ smallest useful repair in side Inspector
   ├─ 一句话带走
   ├─ relevant Current History structure / boundary
   ├─ optional cause / note
   ├─ Xiao original explanation when needed
   ├─ AI-refined 理解这道题 only when Current-legal
   ├─ Current refs when useful
   └─ Chat / source escalation only when deeper repair is earned
→ continue / return without losing place
```

This is an enhancement of the recovered Workbench, not a new quiz product.