# KianOS Static-Web Current

Role: **learner website Visual / Engineering Work Cursor**  
Rule: current website work only. Long-lived Visual rules live in Presentation/Style owners; Engineering rules live in `SYSTEM_CONTRACT.md`.

---

## Current stage

```text
Shared Visual / Shell landed
→ Home accepted
→ English + Lexical landed
→ Xizong material learner surfaces landed
→ Politics learner surfaces landed
→ UI/CSS ownership cleanup ACTIVE · non-redesign closure
→ Chat-owned Home landed
→ private learner checkpoint foundation landed
→ subject Final Audit interfaces
→ subject-owned durable evidence / typed Return reconciliation
→ Home final integration
→ final cross-subject regression
→ launch / broad engineering freeze
```

Architecture-level website blocker: **none**.

---

## Active lanes

| Lane | State | Active ref / continue from |
| --- | --- | --- |
| Xizong UI | **LANDED · MATERIAL HUMAN GATES CLOSED** | `main` → exact accepted Xizong surface owner; reopen only concrete defects |
| Politics UI | **LANDED · HUMAN GATE CLOSED** | PR #470 merged as `52ecaf1`; Practice result model and exact Chengfeng locator accepted; reopen only concrete defects |
| English UI | **LANDED** | `content/english/CURRENT.md` |
| Lexical / Vocabulary UI | **LANDED · HUMAN GATES CLOSED** | `content/lexical/CURRENT.md` → normal use / concrete defects only |

Do not revive historical UI migrations merely because old branches/PRs still exist.

---

## Queued closure lane

### UI Closure / CSS ownership consolidation — **ACTIVE · FRESH CURRENT BRANCH**

Current ref: `work/ui-css-closure-20260919-v2` · fresh from post-gate `main`. Historical closed PR #474 is evidence only, not the active implementation.

Kian explicitly reopened the final non-redesign ownership closure on 2026-09-19. The accepted learner presentation remains frozen: this lane may move CSS ownership and remove superseded writers, but it may not redesign accepted surfaces. Work restarts from fresh `main`, not the historical draft.

Activation basis:

```text
all material subject UI Human Gates closed
+
accepted Surface Blueprints recorded
→ post-gate CSS ownership inventory
→ consolidation without redesign
```

Purpose:

```text
accepted learner surfaces
→ inventory actual CSS / style writers
→ assign every still-needed rule to one real owner
→ consolidate shared / subject / task layers
→ remove superseded polish / convergence / QA patch layers
→ preserve accepted Surface Blueprints exactly
→ real-browser regression
→ launch
```

Hard boundaries:

- **not a redesign program**;
- do not change Content / Learning / Surface Mapping to make CSS cleanup easier;
- do not mass-delete historical CSS before proving which rules are still live;
- move surviving rules to the narrow correct owner first, then delete superseded files/imports;
- preserve current Runtime/Evidence behavior;
- every material visual delta discovered during cleanup returns through screenshot + Kian Human Gate.

Target ownership after closure:

```text
Base
→ global foundation
→ Shared Visual
→ Shared Shell
→ truly-global runtime only

Subject entry
→ subject-wide presentation only

Task / surface
→ task-specific geometry and interaction presentation
```

Closure is complete only when:

1. accepted Surface Blueprints still match real-browser output;
2. Base no longer imports subject/task polish layers merely for historical convenience;
3. duplicate / overridden / superseded CSS writers are removed or intentionally retained with one clear owner;
4. representative English / Politics / Xizong / Lexical surfaces pass browser regression;
5. future shared visual edits no longer require CSS archaeology across historical convergence/patch files.

Exact active inventory: `static-web/UI_CSS_OWNERSHIP_CLOSURE.md`. Keep it bounded to the live post-Human-Gate cleanup; it is not long-term presentation Truth.

---

## Active platform lane

### Chat-owned Home + Learner Data / Chat Handoff Closure — **CLOSED · GATE 4 PASS · GATE 5 ENGINEERING FREEZE**

Chat-owned Home cutover: **LANDED on main via PR #483 (`d252157e`)**.

Private durability foundation: **LANDED on main via PR #485 (`53d05a95`)**.

Home now consumes a validated Chat plan and subject-owned Resume projections; it does not infer cross-subject allocation, priority or next-subject strategy when no valid plan exists. Learner-facing Mission Control / project-status UI is retired.

The private durable checkpoint transport now lives outside the disposable Git Current mirror. Shared Timer / Chat Plan / Exam context can be recovered without writing learner data to GitHub.

Xizong Final Audit integration is now **CLOSED on main via PR #496 (`00f1a87e`)**. Its approved learner-state/evidence keys are captured through the shared private checkpoint, restore only into an empty Xizong durable store, an unreadable existing checkpoint authorizes zero replacement writes, and the typed Xizong Chat Return is integrated with exact object/Source/evidence/Resume binding.

English final integration is **LANDED on main via PR #498** (`216165c05140e90c2ac0afbbf3cace1b956898d8`). Kian explicitly removed its final Mac-presentation release hold; Learner U remains UNTESTED until genuine study.

Shared handoff + Home integration is **LANDED on main via PR #499** (`a6be8ae38a09b45465f5ae992989f122bfa73f4b`). English + Politics attach to the one existing `kianos.daily-learning-packet.v1`; Politics private checkpoint and typed Chat diagnosis import are batch/provenance-bound, stale/conflict-safe and replay-idempotent; Home exposes one learner-facing `复制今日学习包` action and composes Xizong v3 + English evidence + Politics evidence without inventing missing evidence. Kian accepted the final macOS/PingFang Home presentation before promotion.

Final Gate 4 is **PASS** on the reconciled PR #500 candidate `601afe43bdce50db9aa943d3c7318206c637c284`. Final Cross-subject Regression run `35422745025` passed **31/31 checks** across cold Home fail-closed behavior, exact Chat Plan consumption, one-click three-subject Daily Learning Packet, Xizong/English/Politics Timer switching, Politics typed Return apply/replay/conflict/provenance, private checkpoint capture, disposable Current-mirror sync, Astro restart, fresh-browser restore and post-restore packet reproduction.

The final run exposed and closed one real integration defect before PASS: cold Home had `next=null` internally but retained a hidden fallback link to Xizong. No-plan Home now removes the href entirely and therefore cannot silently choose a subject.

The platform integration closure is complete. Reopen this lane only for a concrete learner-visible or durability defect; do not create a second packet/return/checkpoint ecosystem.

Current sequence:

```text
Chat-owned plan boundary ✅
→ private local durable checkpoint transport + shared recovery ✅
→ Xizong Final Audit interface consumed ✅
→ Xizong durable evidence + typed Return ✅
→ English evidence/private checkpoint interface consumed ✅ #498/#499
→ Politics daily evidence + private checkpoint + typed Return ✅ #499
→ one cross-subject Daily Learning Packet entry ✅ #499
→ Home consumes final interfaces ✅ #499
→ final cross-subject browser/restart/Current-sync regression ✅ #500 · 31/31
→ launch / broad engineering freeze ✅
```

Target flow:

```text
browser-local evidence
→ subject-owned packet
→ kianos.daily-learning-packet.v1
→ Chat
→ typed Return Packet(s)
→ validated subject import
→ private learner state
→ exact Resume / Return
```

Required closure:

1. one shared **Daily Learning Packet** composition path; no second universal packet format;
2. each subject exports only evidence it owns;
3. Chat escalation stays optional / evidence-driven, not a daily ritual;
4. typed Return packets are validated before mutating learner state;
5. local durable recovery writes only compact useful checkpoints, not every UI event;
6. persistent learner files live outside the disposable Git Current mirror;
7. real learner data never enters the public `kianos` repo;
8. browser reset / Current sync / Astro restart cannot erase the durable checkpoint layer;
9. a manual export remains possible so learner data is never trapped in one runtime.

This lane may proceed in parallel with CSS Closure where write sets are independent. Do not block current subject UI Human Gates on it unless a handoff control itself is part of the surface being accepted.

---

## Website boundary

```text
Rule / Content
→ accepted Visual / derived presentation when needed
→ Engineering renderer/runtime
→ learner website
```

The website does not become a second Content owner.

Shared Visual / Shell changes belong upstream; subject/task geometry stays with the exact accepted surface owner.

---

## Visual fast lane

For material learner-facing Visual changes:

```text
implementation / preview
→ real browser screenshot
→ Kian Human Gate
→ targeted CI
→ merge
```

CI green is not visual acceptance.

---

## Current next actions

- **Xizong:** learner-facing material UI is landed through whole-paper/year Hidden → Seal → score → same-Workbench Review. Block/TTSX, System Recall, Practice front/back, global retained W/U/Marked and whole-paper are all in `main` with real macOS Human Gates closed. Reopen only concrete defects. Typed Chat Return and durable learner-data recovery stay with the shared Learner Data / Chat Handoff lane.
- **Politics:** learner-facing material UI is fully landed. PR #470 merged after Kian Human Gate; Practice preserves the proven Workbench, uses exact-ID AI `takeaway` + AI `chat_explanation`, forbids Xiao1000 historical explanation from learner-facing fallback, and returns to the safest exact Chengfeng locator when one exists. Reopen only a concrete learner-visible defect.
- **English:** landed; fix only concrete launch-visible defects.
- **Lexical:** Vocabulary v2 learner-surface closure and English exact handoff/return are accepted; normal use only unless a concrete defect appears.
- **Platform:** Gates 1–4 are closed and Gate 5 engineering freeze is active. Shared learner-data / Chat handoff + Home integration are landed through #498/#499; the reconciled #500 candidate passed final cross-subject regression 31/31. Broad platform construction is closed. Continue only concrete learner-visible/durability defects or the now-active bounded non-redesign CSS ownership consolidation lane.

Exact branch/PR/cursor state must be read from the active owner/ref before work.

---

## Fresh-Chat entry

```text
static-web/CURRENT.md
→ exact subject CURRENT / accepted Visual owner
→ exact implementation owner
→ work
```

Target: about 2–3 precise reads before effective work.

---

## Stop rule

Do not store here:
- full product tree;
- durable typography/style rules;
- domain learning boundaries;
- historical debt catalogues;
- detailed acceptance checklists;
- subject task queues.

Those already have canonical owners. This file stays a small website router/cursor.
