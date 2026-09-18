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
→ UI Closure / CSS ownership consolidation active
→ Chat-owned Home cutover + Learner Data / Chat Handoff active in parallel
→ Home integration
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

### UI Closure / CSS ownership consolidation — **ACTIVE**

Active ref: PR #472 · `ui-css-closure-20260919` · post-Human-Gate ownership cleanup, no redesign.

This is now the active website-wide engineering mainline. Politics Practice Human Gate closed on 2026-09-19 and PR #470 is merged.

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

Exact cleanup inventory should be created **when this lane activates**, from the post-Human-Gate codebase. Do not freeze today's CSS file list as future Truth.

---

## Active platform lane

### Chat-owned Home + Learner Data / Chat Handoff Closure — **ACTIVE · PARALLEL WITH CSS CLOSURE**

Active ref: `work/platform-chat-home-cutover-20260919`.

The first cutover removes autonomous Website strategy: Home may display and execute a validated Chat plan, but it must not infer cross-subject allocation, priority or next-subject strategy when no valid plan exists.

The remaining learner-data work closes the same platform boundary; it is not a separate packet ecosystem.

Existing pieces already exist: Shared Study Timer, Daily Learning Packet composition, subject Return/Handoff packets, and GitHub→Mac Current sync. The missing work is integration, not a new packet ecosystem.

Current sequence:

```text
Chat-owned plan boundary
→ inventory existing subject packet producers / importers
→ one cross-subject Daily Learning Packet entry
→ typed subject Return/import closure
→ private local durable checkpoints
→ recovery / migration proof
→ Home consumes final interfaces
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
- **Platform:** UI/CSS ownership consolidation is now active as non-redesign maintenance. Learner-data durability / typed Chat Return may proceed where write sets are independent; final cross-subject regression follows both closures.

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
