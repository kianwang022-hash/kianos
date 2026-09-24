# Xizong Block Workspace — accepted design

Status: **CURRENT — ACCEPTED BLOCK WORKSPACE DESIGN**
Parent: `static-web/XIZONG_PRODUCT_BRIEF.md`
Review safety: `static-web/XIZONG_UI_REVIEW_PROTOCOL.md`

This file records the accepted Mac-wide Block Workspace design only. It does not change Xizong medical Content, Learning Logic, Runtime, Evidence, Repair, Return, or existing S/K/L/P/R/E/U claims.

## 1｜Baseline: optimize the accepted loop, do not redesign it

Preserve the existing mature learner chain:

```text
Block orientation
→ current Logic Group purpose / closure shown inside the persistent Logic Map
→ iPad / MarginNote continuous original-Lecture study while Mac stays on KP Learn
→ at a real reviewed Source boundary, when a reviewed Lecture-attached TTSX binding exists: lightweight TTSX checkpoint
→ current KP marked learned as the learner advances
→ that Logic Group's KP Recall on the same KP card with Core hidden
→ last KP rating automatically closes the Logic Group in the Logic Map
→ next Logic Group
→ final Logic Group closes directly into Block Recall
→ Reveal Block model
→ complete Block Recall
→ lightweight same-surface confirmation of Block first-pass completion
→ After Learn when useful
```

The shared Block UI is a Projection optimization of this accepted loop, not a new learner flow.

## 2｜Mac-wide workspace skeleton — ACCEPTED

```text
┌───────────────────────────────────────────────────────────────────────────────┐
│ Location / Block identity / thin learning-state line                         │
├──────────────────────┬───────────────────────────────────────┬────────────────┤
│ Logic Group Map      │ Primary Cognitive Stage               │ Context        │
│ persistent local map │ current Block/Logic/Recall object     │ conditional    │
├──────────────────────┴───────────────────────────────────────┴────────────────┤
│ current meaningful next action / MarginNote handoff / return                 │
└───────────────────────────────────────────────────────────────────────────────┘
```

Roles:

- **top**: location + a thin learner-stage line; do not spend a full permanent column on the Learning Chain;
- **left**: Logic Group Map, preserving free navigation and local position;
- **center**: the current dominant cognitive object; geometry may vary with Current Block semantics;
- **right**: conditional Context only when useful now — e.g. source locator, Visual, Precision, Connection/Reserve, repair context;
- when no contextual object exists, the center expands instead of leaving an empty permanent rail.

Hard rule:

> The workspace geometry is shared; the cognitive geometry inside the center is not forced into one generic template.

Visual ownership rule:

> Runtime may publish state such as `outline-collapsed` or `auxWeight`, but it must not write pixel widths or `grid-template-columns` inline. Logic Map / Stage / Context geometry belongs to the Block visual owner (`xizong-block-workspace.css`).

## 3｜Current implementation audit disposition — ACCEPTED DIRECTION

### KEEP

Preserve semantically:

- Logic Group navigation;
- accepted System-specific continuous Source-contact model;
- one return at the accepted Source boundary, not an automatic trip per LG;
- same-card KP Recall with Core-only reveal gating;
- KP Recall evidence semantics;
- Logic Group closure;
- Block Recall and completion gate;
- learner-state guards;
- existing Memory / Repair / Evidence / Return semantics;
- timing semantics of Visual / Precision / Connection / Reserve where Current owns them.

### OPTIMIZE

- full Block orientation should not be hidden behind `需要时看完整 Block 定位` on the primary Mac Guide;
- the Logic Group's KP coverage / return roadmap should not require an extra reveal click when it is useful for the current handoff;
- replace the permanent right-side Learning Chain with a thin state line;
- make the right context region dynamic rather than permanent;
- keep After-Learn processing from competing with unfinished first-pass mainline;
- improve Mac-wide typography, density, hierarchy and spatial use without changing content semantics.

### DEMOTE

- duplicate Outline mode when the Logic Group Map already provides the needed local map;
- permanent keyboard/help chrome;
- engineering/provenance/source-hash chrome;
- learner-irrelevant KP/Outline counts as primary navigation information;
- persistent empty After-Learn panels before they are useful.

### RESTORE FROM CURRENT

Where the existing Projection hides or over-compresses accepted Current Block orientation, restore it to learner-visible Guide form without rewriting the medical content.

Examples already pressure-tested:

- A1 B1: mechanism spine + formulas + Framework;
- A2 R1: measurement language + mechanics + resistance model + Framework + accepted Visual/Precision timing;
- A3 B1: spatial/direction/measurement/control language + Framework + source-local study references;
- heterogeneous A1 disease Blocks may contain multiple cognitive objects rather than one `projection_shape`.

## 4｜Cross-System rule

A1 / A2 / A3 may store Projection-support information differently. The learner-facing Block Workspace should still provide one coherent capability set.

Do not force identical upstream files merely for symmetry. Use only relations / Visual / Precision / source locators that the relevant System's Current owners actually support; absent data stays absent rather than being guessed.

A shared Block change must not silently lose A2's Current Visual / Precision / Connection timing or A3's richer source-local/Core orientation merely because A1 has a simpler enrichment set.

## 5｜Interaction rule

> **把点击用在切换认知对象，不要用在获得本来就该看到的信息。**

Legitimate clicks/state changes include switching Logic Group, entering external Lecture, returning for Recall, moving through KP Recall, Block Recall, or an actually useful After-Learn task. Logic Group closure itself is derived automatically from completed KP Recall evidence.

Important first-round Block Guide structure should normally be visible on Mac without repeated accordion/detail opening. Protected answers and truly secondary/later reference remain progressively disclosed.

## 6｜Logic Group Map — ACCEPTED

Logic Group no longer requires a large standalone orientation page in the normal Mac path.

The persistent left map owns lightweight local orientation:

```text
current Logic Group
├─ goal: this group solves what problem
├─ closure: what should be possible after learning
└─ real KP rows
   ├─ KP id
   ├─ real Current title
   └─ current / learned / recalled state
```

Rules:

- `goal` and `closure` remain Current learning-support text; UI does not rewrite their meaning;
- KP rows use real Current titles rather than bare 01/02/03 numbering;
- no inferred arrows / topology are drawn from KP order;
- the map is collapsible; collapsing it returns the width to the primary KP work surface;
- entering another Logic Group changes the active KP / learning object directly rather than forcing a separate orientation ceremony;
- group-level Visual / Connection / Precision remain conditional Context when Current owns them;
- no permanent empty Context rail when no contextual object exists.

## 7｜MarginNote handoff / bound TTSX checkpoint / one return — ACCEPTED

Source-contact authority remains `LEARNING_CONTRACT.md` plus the exact System Learning owner. This workspace consumes that decision; it does not set whole-LG as a lane-wide default.

Before leaving, expose the exact owned Source locator / bounded instruction and the retrieval return map. Missing exact locators stay explicitly unavailable; do not infer ranges from KP order.

- Whole-LG source mode: one group confirmation covers that accepted segment's exact KP IDs.
- Block / canonical Source-unit mode: continuous Source contact may span multiple retrieval LGs. Returning starts the accepted retrieval order, without reopening Source for every LG.
- Multiple natural sections may be studied across sittings. A Block-wide completion confirmation means all owned Source coverage is complete, not that any arbitrary partial section covers the whole Block.

Formal Lecture contact is per-KP evidence, but may be derived from confirmed accepted Source coverage. The normal path must not require one click per KP or per retrieval LG. Optional per-KP companion navigation/marking never replaces the one-source-unit confirmation.

A real reviewed Source boundary plus reviewed TTSX binding may insert one lightweight checkpoint. Answering, options, explanation and question-side expansion stay in original Lecture / MarginNote. Each bound question may have an optional short note; no default web answer entry, scoring or formal Question Attempt is created. Boundary decides WHEN, binding decides WHICH. Missing binding creates no checkpoint and no guessed question list.

For whole-LG mode, a checkpoint can interrupt the group's return only when its reviewed binding explicitly owns that LG / Source segment. Never spread a Block-wide binding across every LG. After the checkpoint, return to the interrupted retrieval mainline. Do not add a second “I am back” confirmation.

## 8｜Visual / Precision timing boundary — ACCEPTED AT RESPONSIBILITY LEVEL

Preserve Current timing semantics rather than filling spare Mac width:

- a group Visual that helps learning now may appear at Logic Group entry / handoff;
- group Precision whose role is later exactness may remain at/after group closure according to its Current timing;
- KP-level Visual / Precision remains tied to the relevant KP learning/Recall context when Current owns it;
- Reserve / Connection Hook remains timing-sensitive and must not become ordinary first-pass Memory merely because it is visible;
- absent cues remain absent.

## 9｜KP Recall — ACCEPTED

KP Recall remains a two-state learner interaction inside the owning Logic Group:

```text
A. Recall Front
   same KP card / same title / same Active Prompt / same useful Context
   + canonical Core hidden
   → learner reconstructs from memory
   → Reveal

B. Recall Reveal
   same KP card / same Context
   + complete canonical Core visible
   → 1 / 2 / 3 / 4 evidence
   → next unrecalled KP in the same Logic Group
```

### 9.1 Recall Front

Hard rule:

> **KP Recall protects the canonical Core, not the whole workspace.**

Before Reveal:

- keep the same KP identity/title and Active Prompt visible;
- keep the same Logic Map visible, including current LG goal / closure and real KP titles/states;
- keep Current-owned Source / Outline / Precision / Visual / Connection Context visible when useful;
- hide the complete canonical KP Core;
- Reveal opens that same Core in place.

This is intentionally different from Block/System Recall. KP Recall is a lightweight retrieval check inside an already learned local object, so the product does not spend extra interaction cost pretending the surrounding context disappeared.

### 9.2 Recall Reveal

After legitimate Reveal:

- keep the Current KP title and surrounding Context in place;
- reveal the complete canonical Current Core without semantic thinning or AI summarization;
- preserve useful Current internal structure such as chains, tables, formulas, contrasts and headings;
- Mac-wide Projection may improve spatial organization, typography and relation visibility without rewriting medical content;
- relevant KP-level source locator / Visual / Precision may enter the conditional Context region only when Current owns them;
- if no relevant context exists, the Core expands rather than leaving empty chrome.

### 9.3 Evidence / navigation

Preserve current Recall evidence semantics:

```text
1 = 没记住
2 = 模糊
3 = 会了
4 = 稳定
```

A rating is a real Recall attempt and must remain append-preserved evidence. Memory or later repair does not rewrite the original Recall.

Keep the interaction cheap:

- Reveal first;
- rating only after Reveal;
- after rating, move to the next unrecalled KP in the same Logic Group;
- after all owned KP in the Logic Group have real Recall evidence, mark that Logic Group closed in the Logic Map and move directly to the next Logic Group;
- no per-KP `add to Memory`, `confirm answer read`, or other ceremony in the first-pass mainline.

Keyboard / shortcut behavior must fail closed under the same gating: no hidden shortcut may rate or reveal content before the legitimate state permits it.

### 9.4 Information-density rule inside Recall

High-density Core stays complete after Reveal; density is organized spatially rather than deleted.

Do not turn a long accepted KP Core into a thin summary merely because it sits inside a Recall surface. The learner action is still `Recall → verify against canonical Core`, not `Recall → verify against an AI-generated abstract`.

## 10｜Logic Group Closure — ABSORBED INTO LOGIC MAP

Logic Group Closure has no standalone learner page/stage.

After all owned KP in the Logic Group have real Recall evidence:

```text
last KP rating
→ Logic Map marks current LG closed
→ next LG opens directly
→ after final LG closes, enter Block Recall
```

The Current `goal / closure` text remains visible in the Logic Map as the local model target. Weak Recall evidence stays preserved for later Memory/repair, but there is no extra Closure button, rating, checklist or confirmation ceremony.

Timing-appropriate group Precision / outgoing Connection / Reserve may still appear through the normal conditional Context owner when Current explicitly owns them; they do not justify a separate stage.

## 11｜Block Recall / Reconstruction — ACCEPTED

Block Recall is the first formal compression from many KP / Logic Groups back into one Block model.

Hard rule:

> **Block Recall tests whether the Block model can be reconstructed; it does not repeat all KP Recall.**

### 11.1 Block Recall Front

After all Logic Groups have closed, enter a neutral Block-level reconstruction state.

Show:

- Block identity;
- Current `centerQuestion`;
- the Logic Group Map as a high-level structural scaffold;
- a simple instruction to reconstruct / run the Block from memory.

Do not show before Reveal:

- `recallSpine`;
- Logic Group closure text;
- Block Guide body;
- KP titles / canonical Core;
- other answer-revealing contextual objects.

The Logic Group names may remain visible because they are the natural higher-level Block skeleton, not a replay of every KP answer.

### 11.2 Block Recall Reveal

After the learner has genuinely attempted reconstruction, Reveal shows the Current compression assets rather than reopening the full Lecture-like Block text:

```text
centerQuestion
+ recallSpine
+ Logic Group closure targets
+ Current-supported compressed cognitive geometry for this Block
```

The same Block may therefore have different geometry in different learning states:

```text
Block Guide        = complete orientation / first-pass map
Block Recall Front = protected reconstruction prompt
Block Recall Reveal= compressed reconstruction / verification
```

Do not author a second, independent Recall summary. The Recall view must be a state-specific projection of the same Current Block cognition.

### 11.3 Recovery when blocked

If reconstruction exposes a local gap, the learner may navigate back to the responsible Logic Group through the persistent Logic Map.

That navigation must not automatically:

- reopen the whole Block;
- erase existing evidence;
- create Wrong/Uncertain question evidence;
- manufacture review debt;
- reset already completed Logic Groups.

It is learner-controlled local recovery inside the accepted Block mainline.

### 11.4 Block Recall evidence and completion

Preserve the evidence distinction while merging the visual surface:

```text
Block Recall done
≠
Block completed
```

Both writes now live on the **same Block Recall Reveal surface**:

```text
Reveal Block model
→ complete Block Recall
→ confirm Block first-pass complete
→ return to System / continue
```

Current completion semantics remain:

```text
all owned KP formal Lecture contact
+ all owned KP Recall evidence
+ Block Recall
= Block completion eligible
```

The final completion action is visually lightweight but remains a distinct real state write. There is no standalone Block Complete page.

## 12｜After Learn — ACCEPTED

After-Learn responsibilities are preserved but should not compete with an unfinished first-pass mainline.

Hard product rule:

> **Evidence may be recorded immediately; deferred processing UI does not need to become the next mandatory action immediately.**

A weak KP Recall may therefore be admitted to Memory in learner state while the learner continues the current Logic Group / Block. Do not interrupt the mainline after every weak rating with a Memory or repair ceremony.

The mature responsibilities remain distinct:

```text
Memory      = formally learned but still unstable material worth future retrieval
Reserve     = future-important relation intentionally seen early, not ordinary Recall/Memory debt
Chat Repair = explicit adaptive / specialist repair task, not the default queue for every weak KP
```

### 12.1 First-pass timing

During unfinished `kp_recall`, unfinished Logic Groups and Block Recall:

- preserve weak Recall evidence and any legitimate Memory admission in state;
- do not automatically open the full `Memory / 储备 / 回 Chat` workspace after each rating;
- at most use a quiet local indication such as `已留到 Memory` when helpful;
- do not require the learner to resolve Memory before continuing the first-pass mainline;
- immediate Chat remains available for a real current understanding failure, but that is an adaptive repair escape, not automatic After-Learn processing.

The full After-Learn surface becomes first-class after Block completion or when the learner explicitly chooses to open it.

### 12.2 Block-complete After-Learn composition

After Block completion, show only meaningful follow-up objects:

```text
After Learn
├─ Memory      — unstable formally learned items, if any
├─ Reserve     — future reactivation relations, if any
├─ Chat Repair — explicit imported / chosen specialist tasks, if any
└─ Return      — continue to the owning System
```

Empty categories may disappear rather than permanently showing empty-state cards.

This is not a progress dashboard and should not turn counts into the main learner object.

### 12.3 Memory

Preserve the current selective Memory model and evidence separation.

Memory uses the familiar retrieval grammar:

```text
neutral prompt
→ Recall
→ Reveal canonical Core
→ 不稳 / 勉强 / 稳定
```

Rules:

- only formally learned material may enter ordinary Memory;
- stable content exits the active weak queue when appropriate;
- Memory evidence does not rewrite the original KP Recall attempt;
- Precision is an exactness attribute, not identical to the Memory queue;
- Memory is selective future retrieval, not every KP seen today.

Mac-wide Memory may use a weak-item rail + dominant Recall card, but it must remain recognizably the same evidence role rather than a second first-pass course.

### 12.4 Reserve

Reserve stays intentionally lightweight:

- show the Current relation / cue and where it will be formally reactivated;
- no rating;
- no ordinary Memory admission;
- no completion percentage or debt;
- no extra learning queue merely because the relation is visible;
- if the Block has no Reserve, the Reserve entry may disappear rather than showing a permanent empty panel.

### 12.5 Chat roles

Keep two Chat use cases distinct:

```text
Immediate adaptive Chat
= current model is genuinely unclear during learning
→ carry current Block / Logic Group / KP context
→ smallest sufficient clarification
→ return to the interrupted mainline

After-Learn Chat Repair
= explicit specialist repair / imported Chat plan
→ scoped real KP/task identities only
→ REPAIR_ONLY evidence
→ does not overwrite original Recall
```

Do not convert every fuzzy Recall into a Chat task.

### 12.6 Existing mature evidence semantics remain protected

Preserve:

- single-writer Block evidence behavior;
- Memory vs repair evidence distinction;
- `REPAIR_ONLY` imported repair semantics;
- reviewed-relation-only System→Block repair delivery;
- repair inbox / bridge safety;
- stale-evidence invalidation;
- natural return to the interrupted learner path.

UI productization may change timing / prominence / spatial composition but does not rewrite those contracts.

## 13｜Block Workspace implementation / Human Gate state

The accepted first-pass Block mainline is now:

```text
Block Guide
→ Logic Group orientation in Logic Map
→ MarginNote handoff / KP Learn companion
→ bound TTSX checkpoint only where Current owns a real reviewed boundary + binding
→ KP Recall Front / Reveal on the same KP card
→ last KP rating auto-closes the Logic Group in Logic Map
→ next Logic Group
→ final Logic Group closes directly into Block Recall Front
→ Reveal Block model
→ complete Block Recall
→ same-surface lightweight confirmation of Block first-pass completion
→ selective After Learn when useful
→ return to System
```

There is **no standalone Logic Group Closure page** and **no standalone Block Complete page**.

Human Gate acceptance on 2026-09-18 covers the Block Recall Front, Block Recall Reveal, and post-Recall completion-confirmation state on the real Mac-wide Chromium surface. Targeted `Xizong Block Workspace` browser acceptance passed on the final candidate, and PR #422 merged this Block tail into `main`.

Responsive fallback and future Projection compilation work may continue later, but they must preserve this accepted interaction geometry and may not reintroduce the removed closure/completion ceremony.