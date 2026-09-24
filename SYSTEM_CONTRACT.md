# KianOS System Contract

Status: **CURRENT**  
Role: shared Engineering capability + cross-surface boundary

This document answers two questions:

> **What shared capabilities should mature KianOS learner surfaces provide when needed?**
>
> **What must Engineering never take ownership of merely because it can implement it?**

It does not own domain Knowledge, Learning Logic, visual composition, learner progress or acceptance claims.

Upstream:
- architecture → `ARCHITECTURE.md`
- learning-asset construction → `LEARNING_ASSET_STANDARD.md`
- domain cognition → each domain `LEARNING_CONTRACT.md`
- visual/presentation → `static-web/PRESENTATION_CONTRACT.md`
- acceptance → `LEARNING_ACCEPTANCE.md`

---

## 1｜Engineering serves approved learner behavior

`static-web/` is KianOS's shared learner execution layer. It is not automatically the primary learning surface for every action.

Hard invariant:

```text
Source ownership ≠ surface ownership.
Content availability ≠ render entitlement.
Runtime capability ≠ Learning authority.
```

The applicable Learning Contract decides what the learner should do and, when material, where that action belongs. Engineering makes that behavior executable.

Engineering must not:

- invent domain semantics;
- become a second Content owner;
- reinterpret Learning Logic to fit an existing component;
- manufacture learner progress from repository state;
- read Legacy/history as semantic fallback;
- turn optional capability into mandatory ritual;
- duplicate an external-primary learning experience merely because its source can be loaded;
- create two competing primary surfaces for one cognitive action.

---

## 2｜Shared mature capabilities

A learner surface should expose only the capabilities its approved path actually needs.

### Current
Resolve from explicit Current/canonical owners and fail closed on missing or invalid dependencies.

### Continue / Resume
Resume the highest-value unfinished learner action without confusing repository Work Cursor with private learner progress.

### Navigate / Explore
Reach Current learner objects with low friction through domain-appropriate navigation, search, map or index.

### Attempt / Verify / Challenge
Support the domain's real verification object: official question, whole passage, generated challenge, reconstruction, writing task, etc.

### Repair / Review
Stable correct work exits quickly. Wrong/meaningful Uncertain opens only the smallest useful repair justified by evidence.

### Return / Handoff
Preserve enough object identity and learner evidence to leave a surface and return without reconstructing the workflow manually.

### Timer / interaction persistence
Capture only state that improves execution or later learner decisions. Persistence is not semantic authority.

### Validation
Use source/schema/runtime/browser/build validation appropriate to the failure risk. Green Engineering does not equal learning acceptance.

---

## 3｜Reuse task behavior when cognition is actually shared

Shared runtime is justified when the learner is making the same kind of decision.

Example:

```text
Reading A data ───────┐
External Reading data ├→ one Reading Workspace / answer gate / attempt behavior
compatible reading ───┘
```

Different data sources do not justify duplicate Runtime or duplicate UI.

Conversely, similar-looking pages do not justify one Runtime when their cognitive object differs.

### 3.1 Shell / CSS / component ownership

The shared Base Shell should remain thin.

`Base.astro` may globally own/import only genuinely shared concerns such as:

- Shared Visual foundation;
- global shell/navigation;
- truly cross-site runtime/reset/accessibility rules;
- shared Timer or other explicitly global capability.

Subject/task-specific presentation should be owned and loaded by the narrowest subject/task entrypoint or component that needs it.

Hard rule:

```text
shared Base
≠ global dumping ground for English / Politics / Xizong / Lexical CSS
```

Do not add new global imports such as subject-specific `english-*`, `politics-*`, `xizong-*`, or `lexical-*` layers merely for convenience.

Likewise, subject-specific bridges/components should mount at the applicable family/task boundary, not in global Base unless their behavior is genuinely cross-site.

Subject-specific styling now stays on its family/task boundary rather than in the global Base. The stable ownership shape is:

```text
Base
→ shared foundation + shell only

subject entry
→ subject visual/runtime

task workspace
→ task-specific geometry/interaction
```

This boundary exists to keep ordinary visual/content changes local and to prevent CSS cascade order from becoming hidden product logic.

---

## 4｜Shared high-frequency input grammar

Frequent actions should become predictable muscle memory. Exact shortcuts belong to Engineering, not Visual.

General rules:

- focused text inputs/editors suspend global learning shortcuts;
- active semantic object owns ambiguous keys;
- shortcuts must remain discoverable but visually subordinate;
- do not add modifier-key rituals merely to resolve state conflicts;
- wrong/meaningful Uncertain must never auto-skip merely for speed.

### Recall / KP / Core Memory

```text
Space      Reveal / hide answer or model
1          没掌握
2          模糊
3          基本稳定 / 熟练
4          掌握
Enter      commit selected judgment + continue
← / →      previous / next when applicable
```

If no explicit lower score was selected and the surface permits fast pass, `Enter` may act as mastered/pass + next.

`1–4` is interaction shorthand, not a universal mastery ontology.

### Standard A–D question

```text
1 / 2 / 3 / 4  = A / B / C / D
Enter           = confirm / submit when required
```

Normal single choice selects then confirms. Multiple choice toggles then confirms.

Fast mode may submit a single-choice answer immediately, but a wrong/meaningful Uncertain result stays on the item for bounded repair. Multiple choice still requires confirmation.

### Lexical whole-card routing

```text
1  Unknown  → Depth
2  Fuzzy    → Depth
3  Known    → Fast Pass
4  Mastered → Fast Pass
```

This routes the current whole word. It does not create future Repair debt by itself.

### Lexical Depth

```text
Space      Recall → Reveal; then continue when no nested control owns Space
↑ / ↓      move local target focus
→ / +      add exact local object to Repair
←          undo/remove local Repair admission
S          pronunciation
```

### Spatial Challenge exception

When the visible option geometry itself is the interaction:

```text
← / ↑ / → / ↓  answer matching visible spatial option
Q              report question defect
Space / Enter  continue after feedback / reconstruction
```

If the Challenge is ordinary A–D, use the standard question grammar instead.

### Conflict resolution

```text
Recall / KP active          → Recall grammar
A–D Question active         → Question grammar
Lexical Depth active        → Depth grammar
Spatial Challenge active    → spatial grammar
text/editor focused         → typing wins
```

---

## 5｜Multi-surface paths

A learner path may cross Chat, KianOS web, MarginNote/PDF, or another environment.

When another surface owns the cognitive action, KianOS may provide only the approved companion role: orientation, locator, checkpoint, attempt, evidence capture, repair routing, Resume or Return.

Examples:

- Xizong / Politics continuous source study may remain iPad/MarginNote-primary;
- Writing composition stays in the writing workspace while semantic coaching may happen in Chat;
- English task lexical failure may detour into Lexical and then return to the exact originating task.

Cross-surface handoff should preserve object/position identity and avoid duplicated mainlines.

---

## 6｜Private learner data and Chat handoff

KianOS has two fundamentally different data classes:

```text
canonical shared Artifact / Content / code
→ GitHub Current

private learner state / evidence
→ learner-local private storage
```

The public canonical repository must never become the normal store for Kian's real learner history.

### 6.1 Four persistence levels

```text
A. Ephemeral interaction state
   current tab / disclosure / drag position / temporary draft UI
   → browser-local only

B. Private learner evidence
   attempts / Wrong / Uncertain / Recall evidence / timer ledger / repair state
   → private learner-local store

C. Portable handoff packet
   bounded evidence selected for Chat or another approved surface
   → generated from B; transport only

D. Durable learner checkpoint
   compact daily / periodic recovery snapshot derived from private evidence
   → private local durable store; optional future private backup
```

Do not promote A into durable history merely because it can be persisted. Do not copy all of B into Chat merely because it exists.

### 6.2 Unified Chat bridge

The shared platform already owns `kianos.daily-learning-packet.v1` as the cross-subject envelope for time + schedule + optional subject-owned evidence.

The intended round trip is:

```text
subject-owned private evidence
+ shared study time / current plan
→ subject packet(s)
→ Daily Learning Packet envelope
→ Chat

Chat
→ diagnosis / adaptive decision / bounded repair
→ typed domain Return Packet(s)
→ exact validator / importer
→ private learner state
→ exact Return to interrupted task
```

Shared code may compose packets but must not reinterpret subject evidence. Each subject remains responsible for the semantics of its own Return/import.

Handoff should be **selective**:
- ordinary stable work does not need Chat export;
- unresolved / repeated / high-value evidence may be escalated;
- one daily summary may combine useful cross-subject context without dumping raw browser state;
- Chat output becomes durable only when imported through an accepted typed Return path.

Do not use free-form Chat transcript text as the learner database.

### 6.3 Public GitHub boundary

This public repository may contain:

- packet schemas / contracts;
- validators / importers / exporters;
- synthetic fixtures;
- redacted example packets;
- code for local persistence / recovery.

It must not contain real Kian learner data such as:

- answer/attempt history;
- timer/session history;
- Wrong / Uncertain events;
- personal notes;
- real Daily Learning Packets;
- Chat Return Packets;
- raw Chat transcripts;
- private learner checkpoints.

If cloud backup / cross-device learner-state sync is later desired, use a **separate private store/repository or encrypted sync target**. Do not mix private learner state into canonical `main`.

---

## 7｜Legacy / history firewall

Historical implementations may supply evidence for a bounded recovery, but they are not Current runtime authority.

Safe direction:

```text
Legacy/history
→ bounded human/Chat reconciliation
→ promoted Current asset or Current-facing behavior rule
→ Engineering implementation
```

Never:

```text
Current missing
→ silently fall back to Legacy
```

No current learner runtime may depend on an old repo/path/branch/localhost as hidden semantic fallback.

---

## 8｜Sharing test

Before adding shared Engineering, ask:

> **Is the learner making the same decision, with the same evidence meaning and interaction semantics?**

If yes, sharing may lower change cost.

If no, keep domain behavior separate.

Before moving a learning action to another surface, ask:

> **Did upstream Learning Logic authorize that surface, or is implementation capability being mistaken for learner need?**

Engineering is successful when approved learning behavior becomes fast, stable and cheap to change—not when the number of shared abstractions grows.
