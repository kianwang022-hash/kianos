# KianOS Static-Web Current

Role: learner-facing website / UI Work Cursor + fresh-Chat restart entry  
Parent: root `CURRENT.md`  
Navigation issue: #90 `KianOS UI Productization — Gold Pages & Design System`

This file owns only **what the website productization program should do next**. It does not own domain cognition, canonical content, Acceptance Truth, learner state, or shared presentation semantics.

---

## Work Cursor

**Program:** KianOS learner-surface productization  
**Active stage:** Writing Gold structural review  
**Active Gold surface:** English Writing — First Learning  
**Active implementation:** Draft PR #93 `UI: Writing Gold Lab — three structural projections`  
**Active branch:** `ui-writing-gold-lab-v2`  
**Lab route:** `/writing-gold-lab/`  
**Blocker:** browser rendering / screenshot review has not yet been accepted by Kian  
**Next action:** render PR #93 in a real browser, compare A/B/C on the same Writing content, fix obvious projection/interaction defects, then let Kian accept/reject a structural direction. Do **not** propagate a Design System before that choice.

Current variants:

```text
A — Editorial Spine
    continuous reading + persistent cognitive spine + bounded return inspector

B — Cognitive Canvas
    explicit six-step map + route + central stage + contextual inspector

C — Focused Workspace
    one dominant primitive at a time + minimal chrome + in-place previous/next
```

All three use the same Current Writing content owner and route. `writing-learn.astro` remains the accepted Functional First baseline; PR #93 is an exploration surface, not a semantic replacement.

Productization order after Writing acceptance:

```text
Writing Gold
→ Translation
→ Objective (Reading A / Cloze / Part B)
→ English shell / Resume
→ Politics
→ Xizong
→ LexicalOS when its bounded vNext learner runtime is stable enough
→ global home / identity last
```

This is a UI implementation cursor, not learner study order.

---

## Frozen product basis

Read in this order when needed:

1. `static-web/PRESENTATION_CONTRACT.md` — shared Projection + high-frequency input grammar + Legacy firewall;
2. `SYSTEM_CONTRACT.md` — surface ownership;
3. applicable domain Learning / Interaction contract;
4. Current content/runtime owner for the surface being projected.

Hard UI principles remain:

- **Dense Calm**: useful density, comfortably readable type, low noise, strong hierarchy;
- Mac / wide landscape is the primary work surface;
- cognition before components;
- `Content structure ≠ page structure`;
- do not default to `Markdown heading → equal card/panel`;
- use space for simultaneous relationships and state change for learner sequence;
- one dominant cognitive task at a time;
- cards/borders only when they mark a real semantic or interaction boundary;
- stable/correct work should remain low-friction;
- Wrong / meaningful Uncertain may make the surface heavier only because new information is now useful;
- presentation work may not mutate learning semantics, evidence/mastery meaning, Repair admission, Resume priority, surface ownership or canonical truth.

Shared semantic roles remain:

`Problem / Map / Chain / Compare / Boundary / Anchor / Exact / Handoff / Recall / Question / Repair / Closure / Reference`.

---

## Gold acceptance

A Gold surface is not accepted because it builds or looks polished.

```text
Current cognition + Current content
→ genuinely different structural projections
→ real browser / interaction review
→ Kian chooses or rejects
→ accepted composition
→ only then extract reusable tokens / primitives
```

Check at minimum:

- the current cognitive task is obvious immediately;
- chain / compare / hierarchy / boundary stay visually distinct;
- important learner text is comfortably readable;
- secondary/system information stays subordinate;
- route switching and frequent actions are low-friction;
- no unnecessary confirmations or page changes appear;
- the result feels sustainable for long real study, not merely attractive in a screenshot.

---

## Protected legacy references

Legacy is **bounded evidence/reference only**. It is never a second Current and never a runtime fallback. The canonical firewall is in `static-web/PRESENTATION_CONTRACT.md`.

### Politics Question Workbench

When Politics reaches productization, preserve the proven high-quality question interaction by comparing against:

- `kianwang022-hash/kianos-site-v238-recovery@local-main`
- compiled learner reference: `public/kianos/assets/PoliticsWorkbench-DbVipmSG.js`
- UX evidence: `tests/politics-final-learner-ux-polish.test.mjs`
- recovery authority note: `kianwang022-hash/kianos-legacy@local-main/content/politics/RECOVERY_CONTRACT.md`

Useful behavior to reproduce against **Current** data/semantics includes:

```text
Normal / Fast
1–4 / Enter keyboard grammar
fast single choice correct → near-immediate next
wrong → stay
一句话带走
your answer vs canonical answer
optional failure-cause + note
AI-refined 理解这道题
Current source references
collapsible Xiao original explanation
fixed low-friction Next
optional original-question image check
```

Historical evidence also pins a 1,148-record refined final-explanation artifact (`politics_question_explanation_final_freeze_candidate.v1.json`, SHA256 `e48d2b06ec1747f97451d147dc172a9b2acf9219d19c5f274c539dc400efbdec`). Its exact durable Current role must be reconciled before claiming the dual-layer explanation experience is fully preserved.

Do not revive old scheduler/due/mastery/owner logic simply because the old Workbench used it.

---

## Domain maturity boundary

- **English:** Objective / Translation / Writing are mature Functional First slices and can undergo full UI productization under frozen semantics.
- **Politics:** Marxism / History have mature S–E learner paths; Mao / Xi / Ethics-Law have accepted content with narrower downstream maturity. Do not invent missing interactions.
- **Xizong:** A2 / A3 are mature learner-test-ready slices; A1/B and later Systems follow their own Current maturity.
- **LexicalOS:** vNext Learning/Content contracts are accepted; catalog completion and bounded Evidence/Memory runtime remain separate. Global UI work must not outrun Lexical Current.

---

## Historical / superseded UI routes

Issue #38 and branch `visual-language-v01` are **SUPERSEDED REFERENCE ONLY**. Do not resume them as the UI mainline.

---

## Fresh-Chat restart

When Kian says **“继续 KianOS 总 UI”**, **“读取 GitHub 最新 UI 任务”**, or equivalent:

```text
main@HEAD
→ static-web/CURRENT.md
→ static-web/PRESENTATION_CONTRACT.md
→ active PR named above
→ applicable domain contract only if needed
→ continue exact current acceptance step
```

Do not reconstruct the UI program from old Issues, historical branches, previous Chats or legacy screenshots when this Current already resolves the active task.
