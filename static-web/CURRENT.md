# KianOS Static-Web Current

Role: learner-facing website / UI Work Cursor + fresh-Chat restart entry  
Parent: root `CURRENT.md`  
Navigation issue: #90 `KianOS UI Productization — Gold Pages & Design System`

This file owns the current UI-productization cursor and the **UI Execution Lifecycle**. Domain cognition/content/evidence remain owned by their canonical contracts and runtime owners.

---

## UI Execution Lifecycle v1.2｜FROZEN

This lifecycle applies to every major learner-facing UI/productization task unless Kian explicitly overrides it.

```text
0. PREFERENCE + AUTHORITY SYNC
   Chat/Sol first re-anchors to Kian's stable UI/interaction preferences,
   then reads main@HEAD + UI Current + Presentation Contract + exact domain owners.
   No implementation yet.

1. PROJECTION AUDIT
   Chat/Sol inspects the existing Current projection and, only when relevant,
   bounded prior/legacy interaction evidence.

   Every learner surface receives exactly one disposition:

   KEEP
   = current projection already fits Current Logic + Kian's preferences;
     preserve it and avoid redesign ceremony.

   MIGRATE
   = a prior interaction Kian already considers good;
     Chat/Sol reconciles it against Current and carries it forward near-1:1.

   OPTIMIZE
   = semantic/interaction skeleton is right, but hierarchy, spatial projection,
     readability or friction needs improvement.

   REBUILD
   = projection itself conflicts with Current cognition or Kian's stable preferences;
     define a new Product Brief before implementation.

   BLOCKED
   = required authority/data/legacy reconciliation is unresolved;
     stop before Codex.

2. PRODUCT BRIEF / MIGRATION OUTPUT
   Only surfaces marked OPTIMIZE / REBUILD need a design brief.
   MIGRATE surfaces get a clean Current-facing migration brief or promoted Current asset.
   KEEP surfaces require no implementation merely to make them look new.

3. CODEX HANDOFF
   Codex becomes the sole production implementation owner only after Audit is closed.
   Codex receives Current contracts/runtime + clean brief/migration output.
   Codex does not perform project archaeology or choose which historical behavior survives.
   Default = ONE short-lived implementation branch / Draft PR.

4. PRODUCT REVIEW
   Chat/Sol reviews real browser output against Current Logic, Kian's preferences,
   the Audit disposition and the implementation brief.
   Chat gives product/interaction feedback rather than becoming the long-running CSS/Astro implementer.

5. ITERATION
   Codex iterates on the SAME active implementation PR unless the direction is abandoned.

6. ACCEPTANCE GATE
   Move forward only when:
   - browser behavior is usable;
   - Kian accepts any genuinely open structural choice;
   - Chat verifies zero semantic diff;
   - required migration is reconciled into Current;
   - no hidden legacy/runtime fallback exists.

7. MERGE + CLOSURE
   Merge only accepted implementation.
   Same session: advance Current → close PR → retire/delete branch → keep minimal restart receipt.

8. FRESH-CHAT RESUME
   New Chat reads Current first and continues the exact stage.
```

### Kian preference baseline

Cross-project taste evidence lives in `kianwang022-hash/kianos-cognition/library/cyber_archive/UI_INTERACTION_PREFERENCES.md`; KianOS-specific execution is governed by this repo's `PRESENTATION_CONTRACT.md`.

Stable KianOS-facing baseline:

- **Dense Calm** — medium/high useful density, comfortable readable type, low visual noise;
- strong visible structure; page should draw logic rather than ask Kian to reconstruct it from prose;
- no tiny-text + giant-whitespace pseudo-minimalism;
- no default card/panel pile merely because components are convenient;
- primary action obvious, secondary capability progressively disclosed;
- interaction natural, stable, predictable and low-friction; motion only when it explains continuity/state;
- work/content surfaces quiet and durable; entry/identity surfaces may be visually stronger;
- high-frequency correct/stable paths should be extremely fast;
- wrong / meaningful uncertain may make the interface heavier only because new information is now useful.

Do not ask Codex to reinterpret these preferences from scratch for every page.

### Protected carry-forward interaction baselines

Kian has already identified the following as comfortable and worth preserving unless a Current semantic conflict is proven:

```text
Recall / KP
Space = reveal
1–4 = learner judgment
Enter = commit / clean-pass and next
← / → = previous / next KP

Standard A–D question
1–4 = A/B/C/D
Enter = submit when confirmation is needed
Fast single-choice = click/key submits immediately
correct = near-immediate next
wrong = stay + explanation/repair
multiple-choice = Enter still confirms

Lexical
whole-card judgment must stay near-instant
Known/Mastered = fast pass
Fuzzy/Unknown = Depth
Depth = rich but low-friction
local + = exact Repair admission
keyboard-first traversal / Reveal / local targeting remains preferred
```

These are interaction baselines, not universal mastery semantics; the owning domain Evidence contract still defines meaning.

### Role boundary

**Chat / Sol owns:** preference interpretation, Projection Audit, current logic reading, all legacy discovery/reconciliation/migration, Product Brief, screenshot/journey review, acceptance and Current reconciliation.

**Codex owns:** production Astro/CSS/JS, layout/components/tokens/responsiveness, browser iteration/screenshots, build/tests/cleanup, implementation branch/PR lifecycle.

**Codex is not the project historian.** Raw Legacy never becomes its research assignment.

**Kian owns:** final preference when multiple structurally valid directions genuinely remain, real-use `U`, explicit workflow override.

### Hard hygiene

1. Default maximum = **one active UI implementation PR**.
2. No implementation branch before Projection Audit + required Migration Gate are complete.
3. A new UI phase does **not** imply every surface must be redesigned.
4. User-approved prior interaction should be migrated, not gratuitously reimagined.
5. Chat-authored code sketches are disposable references only.
6. Codex may not change learning/evidence/Repair/Resume/content semantics for UI convenience.
7. Codex consumes Current or an explicit Chat-produced migration output — never raw Legacy as a second authority.
8. Screenshot ≠ acceptance; browser interaction/build must work.
9. Merged/abandoned UI branches are not durable task state; Current is.
10. Upstream ambiguity returns to Chat/domain owner instead of being patched around in UI.

---

## Work Cursor

**Program:** KianOS learner-surface productization  
**Active stage:** `1 · PROJECTION AUDIT`  
**Implementation owner:** none until the active audit produces a disposition  
**Chat/Sol role:** audit + migration owner  
**Active implementation PR:** none  
**Blocker:** none.

### Audit rule

Audit one surface at a time. Do not batch the whole website into one aesthetic judgment.

For each surface:

```text
Current Logic
+ Current Projection / Runtime
+ Kian preference baseline
+ bounded proven prior interaction only when relevant
↓
KEEP / MIGRATE / OPTIMIZE / REBUILD / BLOCKED
↓
short receipt in this Current
↓
move to the next surface or hand the exact implementation brief to Codex
```

### Audit order

Start with English because its learner model differs materially from Politics/Xizong and should establish the workbook family without forcing it onto knowledge-heavy domains.

```text
1. Writing
2. Translation
3. Objective — Reading A
4. Objective — Cloze
5. Objective — Part B
6. English shell / Resume
7. Politics learning projection
8. Politics question workbench migration
9. Xizong System / Block / KP / Recall surfaces
10. Lexical Fast Pass / Depth / Challenge
11. global home / identity only after real work surfaces are accepted
```

Order may change when a bounded dependency justifies it; record the reason here rather than inferring from branch activity.

### Already-known audit evidence

**Writing:** Current English Logic says task/performance first; First Learning is complete-but-skippable repair reservoir; formal learner unit is one complete essay. Existing `WritingWorkspace.astro` already has useful task-first bones. The old `writing-learn.astro` over-centers six primitives as a learner route. **Audit not yet closed**: likely KEEP core Runtime interaction + OPTIMIZE/REBUILD First-Learning projection, but inspect as one combined learner journey before final disposition.

**Politics question workbench:** Kian explicitly prefers the prior 4173/local question interaction. Treat this as a **MIGRATE candidate**, not a redesign target. Chat/Sol must first reconcile interaction + 1,148 refined explanation asset against Current Politics truth. Codex receives only the reconciled result.

**KP / Recall interaction:** Kian explicitly likes the prior Space / 1–4 / Enter / ←→ grammar. Treat as a **MIGRATE/KEEP baseline** across compatible Current Recall surfaces unless an owning contract proves a conflict.

**Lexical:** latest projection intentionally pursues sub-second routing and keyboard-first Depth/Challenge. Kian reports this interaction direction as comfortable. Treat as **KEEP/OPTIMIZE candidate**, not a default rebuild; exact audit waits for its turn and must respect Lexical Current runtime maturity.

---

## Frozen product basis

`PRESENTATION_CONTRACT.md` + `SYSTEM_CONTRACT.md` + applicable domain contract + Current content/runtime owner + Kian preference baseline above.

Shared semantic roles: `Problem / Map / Chain / Compare / Boundary / Anchor / Exact / Handoff / Recall / Question / Repair / Closure / Reference`.

---

## Legacy / migration firewall

Legacy may provide bounded evidence of an interaction Kian already liked or a recoverable content asset. Chat/Sol owns all archaeology and reconciliation.

```text
raw Legacy
→ Chat/Sol exact recovery + reconciliation
→ Current-facing interaction brief OR promoted Current asset
→ Codex implementation
```

Never:

```text
Current runtime
→ hidden fetch/fallback/link to old repo / branch / localhost / stale owner
```

### Politics protected reference

Before Politics question UI implementation, Chat/Sol must recover/reconcile the proven prior Workbench behavior, including:

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

Historical evidence also pins a 1,148-record refined explanation artifact. Chat/Sol owns exact recovery and Current promotion. Old scheduler/due/mastery/owner semantics do not return with the UI.

---

## Historical / superseded UI routes

Issue #38 / `visual-language-v01` = superseded reference only.  
Closed PR #93 / `ui-writing-gold-lab-v2` = disposable Chat-authored thought experiment only; do not resume as implementation.

---

## Fresh-Chat restart

When Kian says `继续 KianOS 总 UI`, `读取 GitHub 最新 UI 任务`, or equivalent:

```text
main@HEAD
→ static-web/CURRENT.md
→ read Kian preference baseline
→ identify active Projection Audit surface
→ inspect exact Current Logic + Projection
→ close one KEEP/MIGRATE/OPTIMIZE/REBUILD/BLOCKED disposition
→ only then decide whether Codex implementation is needed
```

Do not reconstruct UI work from old Issues, previous Chats, historical branches or legacy screenshots when Current resolves the task.
