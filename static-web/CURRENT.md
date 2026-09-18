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
→ Politics learner surface closure active
→ UI Closure / CSS ownership consolidation
→ Learner Data / Chat Handoff closure
→ final regression
→ launch
```

Architecture-level website blocker: **none**.

---

## Active lanes

| Lane | State | Active ref / continue from |
| --- | --- | --- |
| Xizong UI | **BOUNDED LOOP AUDIT ACTIVE · PR #458** | `work/xizong-full-loop-audit-20260918` → live Study Packet + Memory Repair + exact-head QA |
| Politics UI | **ACTIVE · REVIEW HUMAN GATE READY** | PR #468 · `work/politics-review-human-gate-20260919` · populated Review candidate fully gated; waiting only for Kian visual approval |
| English UI | **LANDED** | `content/english/CURRENT.md` |
| Lexical / Vocabulary UI | **LANDED · HUMAN GATES CLOSED** | `content/lexical/CURRENT.md` → normal use / concrete defects only |

Do not revive historical UI migrations merely because old branches/PRs still exist.

---

## Queued closure lane

### UI Closure / CSS ownership consolidation — **WAITING FOR SUBJECT HUMAN GATES**

This is the next website-wide engineering mainline after the remaining Politics material visual is accepted.

Start condition:

```text
Politics material UI Human Gate closed
+
accepted Surface Blueprints recorded
→ activate UI Closure
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

## Queued platform lane

### Learner Data / Chat Handoff Closure — **QUEUED**

Existing pieces already exist: Shared Study Timer, Daily Learning Packet composition, subject Return/Handoff packets, and GitHub→Mac Current sync. The missing work is integration, not a new packet ecosystem.

Activation:

```text
subject learner surfaces stable enough for final handoff controls
→ inventory existing packet producers / importers
→ unify one cross-subject Chat export entry
→ close typed Return/import paths
→ add private local durable checkpoints
→ recovery / migration proof
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

- **Xizong:** material UI remains accepted. Fresh full-loop audit #458 has now closed the bounded integration defects found during adversarial replay: live Block Study Packet v3 replaces the retired After Learn packet; System W/U Chat returns enter current Memory Repair with exact Block/question return and version invalidation; SYSTEM Practice fails closed until System Recall is completed; correct-but-unsure is first-class Uncertain evidence including whole-paper Seal; released Recall/Practice/Whole Paper own truthful Home Resume while locked stages cannot hijack it; learner-facing engineering diagnostics/protocol copy are removed and guarded by browser QA. Next = exact-head Static Web Xizong QA must execute through A1 browser Runtime + Evidence before merge. Durable learner-data recovery remains shared-platform work.
- **Politics:** L2 + Learn Index + chapter workspace + Home are landed in `main`. PR #468 closes Review visual structure while preserving W/U / discussion / source return / original-question behavior. Populated 1512×982 macOS evidence uses Wrong + Uncertain + discussion across multiple Units; Functional First, Xi/Ethics Runtime+Evidence and Mac visual gate are green. **Next action: Kian Human Gate on Review only; Practice visual closure waits behind approval.**
- **English:** landed; fix only concrete launch-visible defects.
- **Lexical:** Vocabulary v2 learner-surface closure and English exact handoff/return are accepted; normal use only unless a concrete defect appears.
- **Platform:** after Politics Human Gate, close learner-data durability / typed Chat Return and run final cross-subject regression. UI/CSS ownership cleanup is maintenance, not a new learner product.

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
