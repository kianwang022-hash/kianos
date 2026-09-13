# KianOS Static-Web Current

Role: learner-facing website / UI Work Cursor + fresh-Chat restart entry  
Parent: root `CURRENT.md`  
Navigation issue: #90 `KianOS UI Productization — Gold Pages & Design System`

This file owns the current UI-productization cursor and the **UI Execution Lifecycle**. Domain cognition/content/evidence remain owned by their canonical contracts and runtime owners.

---

## UI Execution Lifecycle v1.1｜FROZEN

This lifecycle applies to every major learner-facing UI/productization task unless Kian explicitly overrides it.

```text
0. AUTHORITY SYNC
   Chat reads main@HEAD + UI Current + Presentation Contract + exact domain owners.
   No implementation yet.

1. PRODUCT BRIEF
   Chat defines the one active product question:
   - target learner surface
   - cognition / task shape
   - frozen semantic boundaries
   - acceptance criteria
   - what Kian should actually judge

1.5 LEGACY / MIGRATION GATE — only when relevant
   Chat/Sol owns all legacy archaeology, reconciliation and migration.
   Codex does NOT discover project history or decide what old assets mean.

   For legacy interaction:
   legacy implementation / tests
   → Chat extracts the proven behavior
   → reconcile against Current contracts
   → write a clean Current-facing interaction brief

   For legacy content / data:
   exact old asset
   → Chat recovers identity / bytes / provenance
   → reconcile against Current canonical owner
   → deliberately promote/materialize into Current through the correct domain owner
   → only then may UI consume it

   If this gate is unresolved, the UI task is BLOCKED before Codex.
   Never ask Codex to solve ambiguity by browsing old repos or reviving old runtime authority.

2. CODEX HANDOFF
   Codex becomes the sole production implementation owner.
   Codex starts from current main and receives only:
   - Current contracts / runtime owners;
   - the clean Product Brief;
   - any already-reconciled Current migration output.

   Codex opens ONE short-lived implementation branch / Draft PR,
   implements Astro/CSS/interaction, runs build/browser checks,
   and returns real screenshots + a compact receipt.

3. PRODUCT REVIEW
   Chat reviews the browser result against Current contracts and the Product Brief.
   Chat gives product / interaction feedback; it does not become the long-running CSS/Astro implementer.
   Kian is asked only for meaningful direction choices, not engineering ceremony.

4. ITERATION
   Codex iterates on the SAME active implementation PR unless the direction is explicitly abandoned.
   Do not spawn parallel UI branches merely to try tiny visual differences.

5. ACCEPTANCE GATE
   A surface can move forward only when:
   - real browser behavior is usable;
   - Kian accepts the structural direction;
   - Chat verifies zero semantic diff against the owning contracts;
   - every required legacy migration was already reconciled into Current;
   - no hidden legacy/runtime fallback was introduced.

6. MERGE + CLOSURE
   Merge only the accepted implementation.
   In the same work session:
   - advance `static-web/CURRENT.md` to the next exact step/surface;
   - close the implementation PR;
   - retire/delete the merged or abandoned short-lived branch;
   - record only the small acceptance receipt needed for restart.

7. FRESH-CHAT RESUME
   New Chat reads Current first and continues the exact current stage.
   It must not reconstruct the UI program from old branches, old Issues or previous Chat prose.
```

### Role boundary

**Chat / Sol owns:**

- reading current learning logic and product constraints;
- defining the product question;
- all legacy discovery / archaeology / migration / authority reconciliation;
- deciding what must be visible / quiet / interactive;
- protecting semantic authority and the Legacy firewall;
- reviewing screenshots and learner journeys;
- acceptance / rejection and Current reconciliation.

**Codex owns:**

- production Astro/CSS/JS implementation;
- layout/components/tokens/responsiveness;
- browser iteration and screenshot production;
- build/tests and implementation cleanup;
- implementation branch / PR lifecycle.

Codex is **not** the project historian. It should not be expected to infer old owner meaning, choose between legacy/current truth, recover historical data, or decide which historical behavior should survive.

**Kian owns:**

- final learner preference when two structurally valid directions remain;
- real-use `U` evidence;
- explicit override of the frozen workflow.

### Hard hygiene rules

1. Default maximum = **one active UI implementation PR**. Parallel UI implementation requires an explicit reason recorded in Current.
2. Do not open an implementation branch before Product Brief and any required Migration Gate are complete.
3. Chat-authored code sketches are disposable references only; they are never promoted merely because they exist.
4. Codex may not change Learning Logic, evidence/mastery semantics, Repair admission, Resume priority, owner boundaries or canonical content to make UI easier.
5. Codex must not use raw Legacy as a second source of truth. It consumes only Current or an explicit Chat-produced migration brief/output.
6. A screenshot is not acceptance; real interaction/build behavior must be checked.
7. A merged UI branch should not remain as long-lived task state. Current is the restart surface.
8. If implementation reveals upstream semantic ambiguity, stop implementation and return the question to Chat / the owning contract instead of patching around it in UI.

---

## Work Cursor

**Program:** KianOS learner-surface productization  
**Active stage:** `2 · CODEX HANDOFF`  
**Active Gold surface:** English Writing — task-first workbook  
**Implementation owner:** Codex  
**Chat/Sol role:** product direction + acceptance; legacy migration owner when relevant  
**Active implementation PR:** none  
**Blocker:** no browser-tested Codex implementation yet.

### Current Product Brief｜Writing Gold

English is a **Digital Workbook + Adaptive Coach**, not a knowledge-course renderer.

For Writing:

```text
Task / Prompt
+ learner Plan / Draft
= dominant workspace

six Writing primitives
= quiet, complete-but-skippable coaching / repair reservoir
```

The formal learner unit remains **one complete essay**. Clean performance should dominate. Stable work exits quickly. Only meaningful failure should make the surface heavier and expose the smallest useful coaching/repair layer.

**Migration Gate for this Writing Gold slice:** no raw Legacy dependency is required. Current English/Writing Logic + Current `WritingWorkspace.astro` are sufficient authority. Closed PR #93 is disposable thought-experiment reference only and is not implementation input.

Codex should start from current `main@HEAD` and read only what is needed:

```text
static-web/CURRENT.md
→ static-web/PRESENTATION_CONTRACT.md
→ content/english/LEARNING_CONTRACT.md
→ content/english/modules/writing/CURRENT.md
→ current Writing runtime (`WritingWorkspace.astro` and exact task/runtime owners)
```

Then build **2–3 genuinely different Mac-landscape task-first workbook compositions**. Structural comparison only — not palette/radius variants.

Candidate directions may include, but Codex is not required to copy literally:

- split workbook: Prompt + work surface + bounded Coach;
- writing desk: large paper/work surface, Prompt collapsible, Coach docked quietly;
- focus + drawer: writing dominates, Task/Coach appear on demand.

The six primitives must not become six compulsory chapters or the permanent visual mainline.

### What Kian should judge

- Is the task obviously the main object?
- Is there enough comfortable space to write for 20–30 minutes?
- Is Prompt always reachable without dominating?
- Does Coach stay quiet until useful?
- Which structural direction feels most natural for repeated English use?

---

## Frozen product basis

1. `static-web/PRESENTATION_CONTRACT.md` — shared Projection grammar, Dense Calm, high-frequency input grammar, Legacy firewall.
2. `SYSTEM_CONTRACT.md` — surface ownership.
3. applicable domain Learning / Interaction contract.
4. Current content/runtime owner for the projected task.

Hard product principles:

- Dense Calm: comfortable readable type, useful density, strong hierarchy, low noise;
- Mac / wide landscape first;
- cognition before components;
- `Content structure ≠ page structure`;
- do not default to heading → card/panel;
- stable/correct paths stay extremely low-friction;
- Wrong / meaningful Uncertain may reveal the smallest useful Repair / explanation;
- presentation work may not mutate learning semantics, evidence/mastery meaning, Repair admission, Resume priority, surface ownership or canonical truth.

Shared semantic roles:

`Problem / Map / Chain / Compare / Boundary / Anchor / Exact / Handoff / Recall / Question / Repair / Closure / Reference`.

---

## Protected legacy reference｜Politics Question Workbench

Politics has a **mandatory Migration Gate before Codex implementation**.

Chat/Sol must first recover and reconcile the useful prior Workbench interaction against Current Politics truth. The target behavior includes:

```text
Normal / Fast
1–4 / Enter keyboard grammar
fast single choice correct → near-immediate next
wrong → stay
一句话带走
answer delta
optional failure-cause + note
AI-refined 理解这道题
Current source references
collapsible Xiao original explanation
fixed low-friction Next
optional original-question image check
```

Historical evidence also pins a 1,148-record refined explanation artifact. **Chat/Sol, not Codex, owns locating/recovering/reconciling that payload.** If it is promoted, it must land through the correct Current Politics owner before UI consumes it.

Only after that migration is closed should Codex receive a clean Politics implementation brief. Codex must never wire learner runtime directly to recovery repos, old localhost assets, historical schedulers, or stale owners.

---

## Gold acceptance

A Gold surface is not accepted because it builds or looks polished.

```text
Current logic + Current content/runtime
→ required Migration Gate closed by Chat (if any)
→ Codex structural implementations
→ real browser screenshots + interaction review
→ Kian accepts / rejects
→ accepted composition
→ only then extract reusable tokens / primitives
```

After Writing acceptance:

```text
Translation
→ Objective (Reading A / Cloze / Part B)
→ English shell / Resume
→ Politics
→ Xizong
→ LexicalOS when its Current bounded runtime is ready
→ global home / identity last
```

---

## Domain maturity boundary

- **English:** Objective / Translation / Writing are mature Functional First slices; full UI productization is allowed under frozen semantics.
- **Politics:** content maturity differs by subject; do not invent unaccepted downstream interactions. Legacy Workbench migration is Chat-owned.
- **Xizong:** A2/A3 are mature learner-test-ready slices; other Systems follow their own Current maturity.
- **LexicalOS:** vNext logic is accepted, but catalog/runtime maturity remains bounded; UI must not outrun Lexical Current.

---

## Historical / superseded UI routes

Issue #38 and branch `visual-language-v01` are superseded reference only.
Closed PR #93 / `ui-writing-gold-lab-v2` is disposable reference only and is not the active implementation.

---

## Fresh-Chat restart

When Kian says **“继续 KianOS 总 UI”**, **“读取 GitHub 最新 UI 任务”**, or equivalent:

```text
main@HEAD
→ static-web/CURRENT.md
→ identify lifecycle stage
→ if a Legacy/Migration Gate exists, Chat closes it first
→ only then CODEX HANDOFF
→ if active Codex PR exists, inspect that exact PR/browser receipt
→ continue exact acceptance step
```

Do not reconstruct the UI program from old Issues, previous Chats, historical branches or legacy screenshots when this Current resolves the active task.
