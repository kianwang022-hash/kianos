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
→ UI/CSS ownership cleanup CLOSED
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

### UI Closure / CSS ownership consolidation — **CLOSED · FINAL NON-REDESIGN CLOSURE**

Closure PR: **#524** · fresh post-gate non-redesign ownership cleanup.

Final closure result:

- shared Base is now genuinely shared-only through a style-free `BaseFrame`;
- English / Politics / Xizong / Lexical load subject presentation through their own subject layouts;
- historical `stage-one-composition.css`, `viewport-workspaces.css`, and mixed `site-visual-tuning.css` are retired;
- shared workspace composition is byte-equivalent to the two retired shared layers in the original cascade order;
- mixed Politics/Xizong tuning retained all **199 / 199 unique rules** with **0 missing / 0 extra semantic rules**;
- Objective Guide's hidden dependency on legacy `english.css` was exposed and removed, restoring its accepted single visual owner;
- CSS ownership is protected by `test-ui-css-ownership.mjs`.

Exact-head acceptance evidence:

- Final Cross-subject Regression **PASS**;
- KianOS Mac Visual Gate **PASS**;
- English Family Coherence **PASS**;
- Xizong QA **PASS**;
- Objective Learner Journey **PASS**;
- Translation QA **PASS**;
- Writing QA **PASS**;
- Lexical Current Runtime **PASS**.

Politics broad QA remains red on the pre-existing **Ethics content closure** audit; the same workflow was already failing on `main` before #524 and is not a CSS-closure regression.

No material learner-facing redesign was introduced. The final CSS ownership lane is closed; reopen only for a concrete learner-visible defect.

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

### Gate 5 bounded defect — private Daily Packet relay observability — **ACTIVE · TARGETED PROOF PENDING**

Concrete defect reproduced 2026-09-20:
- private learner checkpoint save correctly survives Git relay failure;
- however `privateLearnerBridge` discarded packet-relay sync errors with `.catch(() => null)`;
- a stale private `runtime/kianos-learning/current.json` therefore could not distinguish stale local Current from Git fetch/auth/push/projection failure.

Bounded repair on `fix/private-packet-relay-observability-20260920`:
- keep packet sync asynchronous and non-blocking;
- record only ephemeral last sync state (`idle/syncing/ready/error`);
- expose it through the existing loopback-only `/__kianos-private/checkpoint` GET/PUT response;
- do not create a second learner state owner, new page, scheduler or packet format.

Stop rule: targeted bridge/relay + affected static-runtime proof passes, then close this defect and return to Gate 5 freeze.

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

## Concrete reopened durability defect — automatic Daily Learning Packet relay

State: **LANDED ON MAIN · PR #560 / `f24c65a` · REAL MAC/PROJECT ACCEPTANCE PENDING**

Concrete learner friction:

```text
KianOS already owns exact local learner/runtime state
+ Home already exports kianos.daily-learning-packet.v1
→ fresh Projects previously required manual packet/Resume shuttling
```

Accepted and landed architecture:

```text
KianOS private local truth
→ the existing kianos.daily-learning-packet.v1 only
→ private Personal GitHub runtime ref
→ five ChatGPT Projects consume bounded slices
```

No separate Resume mailbox/protocol exists in production. PR #558 was superseded and closed without merge.

Transport target:

```text
private Personal ref: runtime/kianos-learning
runtime/kianos-learning/current.json
runtime/kianos-learning/daily/YYYY-MM-DD.json
```

Landed guarantees:
- explicit English `evidence.resume` remains inside the existing English evidence schema;
- private checkpoint rebuilds the existing Daily Learning Packet;
- subject reconstruction failures are contained;
- same-day packet updates replace current only;
- study-day rollover seals at most one prior-day packet;
- runtime ref is root-snapshot replacement rather than intraday reachable history;
- force-with-lease prevents silent concurrent overwrite;
- local relay Git object growth is bounded;
- leaving KianOS/window blur flushes the checkpoint;
- Git relay failure cannot fail or roll back local learner checkpoint saving.

Pre-merge targeted proof:
- packet transport / idempotency / day rollover PASS;
- private checkpoint → Daily Learning Packet PASS;
- cross-midnight Timer attribution PASS;
- English Resume progression PASS;
- build + browser acceptance PASS;
- English Family / Exam PASS;
- Shared Study Timer PASS;
- Xizong Representation PASS;
- Final Cross-subject Regression PASS;
- Authority Consistency PASS.

Semantic Base Validity still has the same pre-existing current-main self-test red:
`shared shell must invalidate learner surface`.
This transport lane does not own it.

Xizong Fresh Independent runs were cancelled by that workflow's repository-global concurrency group when unrelated PRs triggered the same workflow; they did not report a test failure. Bounded Xizong representation + cross-subject regressions passed.

Next real acceptance:

```text
real Mac KianOS
→ real private packet appears on runtime/kianos-learning
→ fresh Xizong / English / Politics Project "继续"
→ Steward reads time/schedule without re-entry
→ Review "复盘今天" reads the same packet
```

Until that real loop passes, engineering is landed but learner acceptance remains pending.

---

## Concrete performance defect — prebuilt local learner runtime

State: **LANDED ON MAIN · PR #571 / `548fcf0` · REAL MAC ACCEPTANCE PENDING**

Concrete learner friction:

```text
Current local learner site used astro dev
→ Home and selected subject/runtime endpoints repeated deterministic build-time work on learner requests
→ returning Home and Politics answer submission had visible wait
```

Measured pre-repair evidence from the existing Astro build path:

- total Home generation: **2.07s**;
- Xizong Home: **5ms**;
- Politics Home: **5ms**;
- English Home: **195ms**;
- Politics Practice generation: about **391ms**;
- Xizong respiratory Block generation remains a separate bounded hotspot and is not repaired by this lane.

Bounded repair:

```text
GitHub main advances
→ Current mirror syncs
→ Astro builds a staging static site once
→ completed staging build is promoted to dist
→ thin loopback Node server serves prebuilt files
→ existing private checkpoint / Chat control / External Reading bridges stay on the same localhost origin
```

Astro remains the site/build framework. This lane does not create a second Home, learner-state model, packet system, or subject runtime. Subject learning semantics and the Daily Learning Packet remain unchanged.

Exact candidate proof on PR #571:

- full **8406-page** staging build + promotion PASS;
- Final Cross-subject Regression PASS;
- Current Real-use Readiness PASS;
- Current Delivery PASS;
- private checkpoint / Chat control / External Reading endpoints PASS on the prebuilt runtime;
- prerendered Politics review JSON and Xizong JSON endpoints PASS;
- CI loopback warm HTTP:
  - Home max **22.2ms**, mean **17.8ms**;
  - Politics Practice max **10.9ms**, mean **6.3ms**;
  - Politics review JSON max **2.1ms**, mean **2.0ms**.

These CI loopback numbers prove request-time compilation has left the learner hot path; they are not a substitute for Kian's real Mac/browser acceptance.

Known unrelated repository-global reds remain outside this repair: Politics Ethics content closure, Lexical projection drift, date-sensitive Politics Return test rollover, and existing Xizong A1/A2 acceptance reds.

Next acceptance:

```text
restart/reinstall the installed Current LaunchAgent once
→ real Mac: Politics answer submit + Workspace → Home + reload
→ confirm learner-visible wait is gone
→ close this defect
```

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
- **Platform:** Gates 1–5 are closed and Gate 5 engineering freeze is active. Shared learner-data / Chat handoff + Home integration are landed through #498/#499; #500 closed the original cross-subject integration and #524 closed the final CSS ownership lane with post-cleanup cross-subject + Mac visual proof. Continue only concrete learner-visible/durability defects.

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
