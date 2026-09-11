# KianOS Current

**Repository:** `kianwang022-hash/kianos`  
**Branch:** `main`

## Active product model

`Source Truth → Chat semantic/learning judgment → GitHub Current content → Astro display/interaction → learner`

`main@HEAD` is the only normal shared Current authority. `kianos-legacy` is recovery/reference only.

Private browser/device state may support interaction, but it is not a Current product layer, not a semantic owner, and must not be written into shared Current content.

## KianOS-wide Current

This root `CURRENT.md` is the Current overview for the **entire KianOS learning system**.

Domain manifests and continuations are child Current objects beneath this root; they do not form separate parallel top-level Current systems.

The durable hierarchy is:

`KianOS Current → lane Current owner/manifest → natural content owners → learner runtime`

All first-class learner lanes inherit the shared baseline in `SYSTEM_CONTRACT.md`:

`Current · Continue · Navigate/Explore · Repair/Review · Verify/Challenge/Transfer · Return/Handoff · Deferred · Validation`

The capabilities are shared; the cognition and UI are not forced to be identical. A lane that is missing a genuinely necessary baseline capability is Partial until it is repaired or explicitly deferred.

Repository-wide intentionally postponed work uses `DEFERRED.md` + GitHub Issue #5 rather than separate lane backlogs.

## Current owners

- Xizong: `content/xizong/`
- English: `content/english/`
- LexicalOS: `content/lexical/`
- Politics: `content/politics/`
- Learner display/function runtime: `static-web/`

## Current asset state

### Xizong

The accepted Xizong owner roots are present on `main`:

- `content/xizong/knowledge/`
- `content/xizong/questions/`
- `content/xizong/question_explanations/`
- `content/xizong/question-relations/`
- `content/xizong/explanations/`

Within `knowledge/`, System ownership is resolved by the Current owner rules in `content/xizong/knowledge/manifest.json`:

- same-system `system.json` present → it is the System-level owner;
- no `system.json` yet → the corresponding `system-guides/` file remains transitional substrate;
- canonical Block Markdown remains the Block/KP medical Core owner.

System-by-system v6 upgrades are active Current content work. They update natural owners in place and must not be overwritten by migrated snapshots.

The durable shared-work cursor for the current Xizong learning/runtime mainline is `content/xizong/knowledge/learner/continuation.json`. Fresh Chats should read that cursor plus its referenced Current owners before proposing or continuing Xizong learning/runtime work; it records construction position only and is not medical Core or personal learner state.

Xizong already implements most shared lane capabilities through its System/Block navigation, local learner state, selective Memory/Review, System Exit verification, detailed Study/Wrong-Uncertain packet export, and Chat return-plan import. Real learner validation remains the current quality gate.

### English

English Current is intentionally split by responsibility:

- `content/english/manifest.json` — concise Current owner/readiness map;
- `content/english/provenance.json` — source, repair, migration, and identity evidence;
- `content/english/LEARNING_CONTRACT.md` — learner-facing strategy and interaction semantics;
- `content/english/continuation.json` — durable shared-work cursor for the active English learning/runtime lane;
- `content/english/source/` — canonical exam/source assets;
- `content/english/external/` — private external-reading inventory and future materialized assets.

Current canonical exam assets include:

- `content/english/source/question_bank.v1.json`
- `content/english/source/reading_corpus.v1.json`
- `content/english/source/global_source_truth.v1.json`

Astro Reading remains source-gated to Current assets only. English content and interaction upgrades should optimize the user's real path toward English I 80–85+ and objective 60/60, not maximize displayed metadata or governance complexity.

External reading is private learner material. It may include TPO, IELTS, and later periodicals or other unseen texts. Its main value is fresh input and diagnostic transfer, especially when exam-question memory makes reused true-exam material less informative.

Fresh Chats continuing English learning/runtime work should read `content/english/continuation.json` first, then `LEARNING_CONTRACT.md` and only the smallest Current module/source owners needed by the active stage.

English Reading already exposes navigation, review/repair, transfer evidence, and session handoff. Translation/Writing and other module runtimes inherit the KianOS shared lane baseline as they are materialized; they must keep their own cognition rather than copying Reading UI mechanically.

### LexicalOS

LexicalOS Natural Owner cutover is complete.

- `content/lexical/manifest.json` — Current lexical authority entry;
- `content/lexical/LEARNING_CONTRACT.md` — learner-facing Depth Scan / selective Repair / dynamic Challenge / Return Packet semantics;
- `content/lexical/continuation.json` — durable shared-work cursor for the active LexicalOS learning/runtime lane;
- `content/lexical/words/by-ordinal/` — 7,946 Current Word natural owners for all word-local semantics;
- `content/lexical/relations/by-id/` — Current owners for genuine cross-word semantic relationships;
- `content/lexical/schema.json` — ownership contract;
- `content/lexical/audit/natural-owner-cutover.json` — accepted zero-delta full-corpus cutover proof.

The old bounded stores under `content/lexical/canonical/` are now identity/provenance/evidence/reference stores only. `canonical/lookup/` remains a deterministic non-semantic routing index. They are not normal semantic edit targets and must not be maintained as a parallel lexical truth.

`content/lexical/words/answer.json` is only a non-authoritative compatibility pointer to `content/lexical/words/by-ordinal/o0209.json`; Astro reads the Natural Owner directly.

Normal lexical semantic work is now:

`manifest / lookup → Word Natural Owner → referenced Relation only when needed → Astro display/interaction`

Normal lexical learning/runtime work is now:

`Recall Map → Depth Reveal → selective + Repair → dynamic Challenge → Return Packet → next learning day → later real transfer`

L0-first semantic review continues as Current content work. Semantic repairs update the Natural Owner in place; migration does not need to be replayed and old bounded stores do not need manual semantic synchronization.

The vocabulary learner surface must not turn 7,946 words or their active senses into one-card-per-object review debt. Rich familiar words may remain deep on the main Reveal, while only specific weak senses, constructions, phrases, relations, or productive needs become repair targets. Challenge questions may be generated dynamically from Current semantics; held-out true-exam/TPO/unseen material remains protected until its first real attempt.

Fresh Chats continuing LexicalOS learning/runtime work should read `content/lexical/continuation.json` first, then `LEARNING_CONTRACT.md` and only the smallest Current Natural Owner/runtime files needed by the active stage.

LexicalOS currently provides the clearest full implementation of the shared lane baseline: whole-catalog Current, Continue, Search/Explore, selective Review, generated Challenge, daily Return Packet, global Deferred integration, and runtime/build validation. It is a platform reference, not a UI template that other subjects must copy.

### Politics

Politics Current is split into source, learning semantics, teaching projection, and learner interaction:

- `content/politics/manifest.json` / `provenance.json` — Current source ownership and provenance;
- `content/politics/source/` — Chengfeng continuous-source structure, Suyi-linked source references, Xiao1000 questions, and relation assets;
- `content/politics/LEARNING_CONTRACT.md` — the active Politics learning semantics;
- `content/politics/INTERACTION_CONTRACT.md` — the shared low-friction learner loop and subject-specific interaction shapes;
- `content/politics/learning/` — Chat-approved teaching projections that add orientation, bridges, compression, and repair guidance without creating a second textbook;
- `content/politics/continuation.json` — the durable shared-work cursor for the Politics content→interaction mainline.

Active first-round Politics chain:

`Chat Orientation → Chengfeng Natural Unit continuous learning → short closure → Xiao1000 verification → wrong/uncertain smallest sufficient repair → continue`

Chengfeng is the only continuous first-round mainline. Suyi is a background framework reference for Chat: useful mind-map structure is absorbed into the learning projection and does not need a separate learner-facing course or standalone Markdown representation. Xiao1000 remains validation and transfer evidence and must not determine the learning order.

Current content projection is complete across all Current Politics subjects:

- Marxism: Chapters 1–8, using relation/reasoning/mechanism chains;
- History: Chapters 1–10 plus a whole-subject map, using chronology/stage/turning-point/cause/evaluation;
- Mao/Zhongte: C00–C08 plus a whole-subject map, using historical-problem → theory-response → positioning/boundary structure;
- Xi/New Thought: C00–C17 plus a whole-subject map, using hierarchy/role/goal/principle/path and confusable-formulation boundaries;
- Ethics/Law: C00–C06 plus a whole-subject map, using concept-boundary/normative-judgment/situational-application structure.

Politics Astro now has a Current learner entry, all-subject chapter index, and a generic chapter runtime that projects the shared loop while preserving each subject's own teaching shape. The active Politics stage is real learner validation, not further taxonomy or dashboard expansion.

Politics already has Current, navigation, Xiao1000 verification, and minimal repair. Continue/session resume and a compact learner Return/Handoff path are not yet as explicit as in Xizong/English/LexicalOS and should be treated as shared-baseline gaps rather than ignored.

Fresh Chats continuing Politics work should read `content/politics/continuation.json` first, then the smallest referenced Current assets needed for validation or repair.

### Astro runtime

`static-web/` is the clean Astro learner runtime. Astro turns Current learning semantics into low-friction display and interaction. Runtime coverage may lag content coverage; Astro should project only Current assets it explicitly supports, and missing projections must not be filled by legacy fallback.

Astro is the shared platform layer for learner-facing baseline capabilities. Shared components/utilities are appropriate when the interaction decision is genuinely the same across lanes; domain cognition and semantic ownership remain in the domain lane.

## Migration boundary

The legacy repository knowledge-asset transport is closed. Migration evidence remains provenance, not normal Current runtime context.

The migration dual-read exception is closed for normal work. Future reads from `kianos-legacy` require an explicit recovery, rollback, historical comparison, or newly authorized migration/recovery task.

Active Xizong v6 upgrades, Lexical semantic review, English learning/content upgrades, Politics learner validation, Astro expansion, and future source repairs are all new-repo Current work. They are not permission to re-import or prefer older legacy content.

## Known inherited source-asset gap

B1 Markdown references `Block1_正常机械循环_v6_assets/*`, but that media directory was absent from the pinned tracked legacy Block tree. Current must fail visibly on that missing asset rather than fabricate or silently remove the reference.
