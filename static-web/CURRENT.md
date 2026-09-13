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

   Legacy interaction:
   exact old implementation/tests
   → Chat extracts proven behavior
   → reconcile against Current contracts
   → Current-facing interaction brief

   Legacy content/data:
   exact old asset
   → Chat recovers identity / bytes / provenance
   → reconcile against Current canonical owner
   → deliberately promote/materialize into Current
   → only then may UI consume it

   If unresolved, the UI task is BLOCKED before Codex.

2. CODEX HANDOFF
   Codex becomes the sole production implementation owner.
   It receives only Current contracts/runtime + the clean Product Brief + already-reconciled migration output.
   Codex opens ONE short-lived implementation branch / Draft PR,
   implements Astro/CSS/interaction, runs build/browser checks,
   and returns real screenshots + a compact receipt.

3. PRODUCT REVIEW
   Chat reviews the browser result against Current contracts and the Product Brief.
   Chat gives product / interaction feedback; it does not become the long-running CSS/Astro implementer.
   Kian is asked only for meaningful direction choices, not engineering ceremony.

4. ITERATION
   Codex iterates on the SAME active implementation PR unless the direction is explicitly abandoned.

5. ACCEPTANCE GATE
   Move forward only when:
   - real browser behavior is usable;
   - Kian accepts the structural direction;
   - Chat verifies zero semantic diff;
   - required legacy migration is already reconciled into Current;
   - no hidden legacy/runtime fallback exists.

6. MERGE + CLOSURE
   Merge only the accepted implementation.
   Same session: advance Current → close PR → retire/delete branch → retain only minimal restart receipt.

7. FRESH-CHAT RESUME
   New Chat reads Current first and continues the exact stage.
```

### Role boundary

**Chat / Sol owns:** current logic reading, Product Brief, all legacy discovery/archaeology/migration/authority reconciliation, interaction intent, screenshot/journey review, acceptance and Current reconciliation.

**Codex owns:** production Astro/CSS/JS, components/tokens/responsiveness, browser iteration/screenshots, build/tests/cleanup, implementation branch/PR lifecycle.

**Codex is not the project historian.** It must not infer what an old owner meant, choose between Legacy and Current truth, recover historical data, or decide which old behavior survives.

**Kian owns:** final learner preference between structurally valid directions, real-use `U`, explicit workflow override.

### Hard hygiene

1. Default maximum = **one active UI implementation PR**.
2. No implementation branch before Product Brief + required Migration Gate are complete.
3. Chat-authored code sketches are disposable references only.
4. Codex may not change learning/evidence/Repair/Resume/content semantics for UI convenience.
5. Codex consumes Current or an explicit Chat-produced migration output — never raw Legacy as a second authority.
6. Screenshot ≠ acceptance; browser interaction/build must work.
7. Merged/abandoned UI branches are not durable task state; Current is.
8. Upstream ambiguity returns to Chat/domain owner instead of being patched around in UI.

---

## Work Cursor

**Program:** KianOS learner-surface productization  
**Active stage:** `2 · CODEX HANDOFF`  
**Active Gold surface:** English Writing — task-first workbook  
**Implementation owner:** Codex  
**Chat/Sol role:** product direction + acceptance; migration owner when relevant  
**Active implementation PR:** none  
**Blocker:** no browser-tested Codex implementation yet.

### Current Product Brief｜Writing Gold

English is a **Digital Workbook + Adaptive Coach**, not a knowledge-course renderer.

```text
Task / Prompt + learner Plan / Draft = dominant workspace
six Writing primitives = quiet, complete-but-skippable coaching / repair reservoir
```

Formal learner unit = one complete essay. Clean performance dominates. Stable work exits quickly. Meaningful failure alone makes the surface heavier.

**Migration Gate for this Writing slice:** none required. Current English/Writing Logic + Current `WritingWorkspace.astro` are sufficient authority. Closed PR #93 is disposable thought-experiment reference only.

Codex reads:

```text
static-web/CURRENT.md
→ static-web/PRESENTATION_CONTRACT.md
→ content/english/LEARNING_CONTRACT.md
→ content/english/modules/writing/CURRENT.md
→ Current Writing runtime
```

Then build **2–3 genuinely different Mac-landscape task-first workbook compositions** — structural alternatives, not palette/radius variants.

Candidate directions only:

- split workbook: Prompt + work surface + bounded Coach;
- writing desk: large work surface, Prompt collapsible, Coach quiet;
- focus + drawer: writing dominates, Task/Coach on demand.

Six primitives must never become six compulsory chapters or the permanent visual mainline.

### What Kian should judge

- Is Task obviously the main object?
- Is there comfortable room to write for 20–30 minutes?
- Is Prompt always reachable without dominating?
- Does Coach stay quiet until useful?
- Which structure feels most natural for repeated English use?

---

## Frozen product basis

`PRESENTATION_CONTRACT.md` + `SYSTEM_CONTRACT.md` + applicable domain contract + Current content/runtime owner.

Hard principles: Dense Calm; Mac landscape first; cognition before components; `Content structure ≠ page structure`; stable/correct paths stay low-friction; Wrong/Uncertain reveals smallest useful Repair; UI cannot mutate Current semantics.

Shared roles: `Problem / Map / Chain / Compare / Boundary / Anchor / Exact / Handoff / Recall / Question / Repair / Closure / Reference`.

---

## Protected legacy reference｜Politics Question Workbench

Politics has a **mandatory Chat-owned Migration Gate before Codex implementation**.

Chat/Sol must recover and reconcile the prior Workbench interaction against Current Politics truth, including:

```text
Normal / Fast
1–4 / Enter
fast single-choice correct → near-immediate next
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

Historical evidence also pins a 1,148-record refined explanation artifact. **Chat/Sol owns locating, recovering, reconciling and promoting it through the correct Current Politics owner.** Codex receives only the reconciled Current result / clean implementation brief.

Codex must never wire learner runtime directly to recovery repos, old localhost assets, historical schedulers, or stale owners.

---

## Gold acceptance

```text
Current logic/content/runtime
→ Chat closes Migration Gate if needed
→ Codex implementations
→ browser screenshots + interaction review
→ Kian accepts/rejects
→ accepted composition
→ then reusable tokens/primitives
```

After Writing: Translation → Objective → English shell/Resume → Politics → Xizong → LexicalOS when ready → global home/identity last.

---

## Fresh-Chat restart

```text
main@HEAD
→ static-web/CURRENT.md
→ identify lifecycle stage
→ if Migration Gate exists, Chat closes it
→ only then Codex Handoff
→ active Codex PR/browser receipt
→ continue exact acceptance step
```

Do not reconstruct UI work from old Issues, previous Chats, historical branches or legacy screenshots when Current resolves the task.
