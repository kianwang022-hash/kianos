# KianOS Product Surface Contract

Status: APPROVED FUNCTIONAL SPLIT · IMPLEMENTATION STATE NOT OWNED HERE
Updated: 2026-09-24
Semantic owner: KianOS product surface split / information architecture. This is not implementation status, Chat strategy, Personal truth or another runtime state owner.

## 1. User jobs and surface split

| Surface | Question answered | Must preserve | Not its job |
|---|---|---|---|
| Home | Where am I in the exam campaign? | Current phase/Gate, each subject's actual progress and stage tasks, supported weekly reference, native Continue, compact today/attention pointer | Detailed day timeline, meal editors, inbox or health dashboard |
| Steward | How is today planned and actually unfolding? | Today/Week/Month/Review, time allocation, plan vs actual, meals/nutrition, training/recovery, weight, life items, reality notes | Subject scoring/mastery or autonomous allocation |
| Radar | What needs my action/decision; what is worth knowing? | Needs You + Worth Knowing, source/freshness and action status, Email and web/prepared sources | A cloned inbox, infinite feed or new scheduler |
| Subject pages | What am I actually learning/doing? | Native task/session/material/attempt, submission, Resume and evidence | Life-management workflow |
| Global Dock | What am I doing now; how can I record/stop/return quickly? | Actual activity/time, next planned item, pause/break/resume, optional quick capture, Today and native return | Miniature Steward/Radar/dashboard |

One source fact may have linked projections on multiple surfaces; there is one actual owner and one completion semantics. Strategic task visibility on Home and time placement on Steward are complementary, not duplicate independently checkable task lists. Sensitive details stay out of Home and public assets.

## 2. Home progress is subject-native

Use current observed learner evidence, not content produced, files built, page views or elapsed time as completion. A percentage requires an identified meaningful denominator, current scope and corresponding evidence. Omit it when unsupported; missing is unknown, not zero.

Keep subject differences: Xizong source/Recall/application/repair evidence; English separate Objective families, productive tasks and Lexical evidence; Politics first-round source, Xiao1000, Memory and Analysis evidence. Do not force them into one universal progress or score. Stage tasks state what evidence would close them and link to the native owner. Engineering readiness is not learner readiness.

Home only links to the detailed day and filtered external attention. It must not become another full Steward page because both can display Today.

## 3. Capability / implementation boundary

This file owns the **functional surface split only**. Current KianOS implementation, shipped capability, runtime readiness, build/browser proof and Human-Gate state must be read from the exact current KianOS product/runtime owner; do not mirror those statuses here.

The functional split above remains a design requirement. Existing working behavior should be preserved or changed only through the owning product/runtime contract rather than inferred from this Markdown file.

Product behavior and execution acceptance: `static-web/STEWARD_PRODUCT_CONTRACT.md`.
Daily source/trigger behavior: `kianwang022-hash/kian-personal-os/exam/roles/STEWARD.md`.
Radar, Email, actionable-item lifecycle: `kianwang022-hash/kian-personal-os/exam/roles/INTAKE.md`.
Personal/health meaning remains in its upstream Personal/native owner. Native wire schema/validation and current delivery truth remain with exact KianOS owners.

## 4. Calendar, privacy and UI boundary

Steward's internal plan placement is not a Calendar write. Meals, training, rest and life blocks may appear in Steward without Calendar events. External Calendar commitments are read through their native source; mirroring requires the existing explicit/standing authority. Native event actions and website refresh succeed/fail independently.

Upstream Chat/Personal judgment is projected through validated private runtime payloads, not by publishing Personal Markdown, raw Health or mail into static KianOS pages. There is one strategy decision and compatible per-surface projections, not two unrelated day plans.

The accepted upgrade is Mac-landscape-first and must retain readable type and progressive detail. Column counts, panels and exact interaction geometry remain to be discussed with Kian; previous schematic mockups were examples, not UI acceptance. The suspended `executive-display/` is reference only, not a second app to revive.
