# LexicalOS Acceptance

Status: CURRENT  
Standard: root `LEARNING_ACCEPTANCE.md`  
Role: LexicalOS lane Acceptance Truth

This file owns current learner-readiness claims for LexicalOS. It does not own lexical semantics, lane learning semantics, the K audit procedure, Work Cursor, or Kian's private learner evidence.

---

## Current gate state

```text
S  PASS
K  BLOCKED
L  PASS
P  BLOCKED for unrestricted full-catalog learner use
R  BLOCKED for unrestricted full-catalog learner use
E  BLOCKED for unrestricted full-catalog learner use
U  UNTESTED for unrestricted full-catalog learner use
```

Allowed conclusion:

> **LexicalOS has a stable Current Natural Owner/source boundary and a mature accepted learning model, but full-catalog Knowledge is reopened and BLOCKED by migration semantic-integrity defects. Downstream full-catalog P/R/E readiness cannot be claimed until K closes; unrestricted learner U remains UNTESTED.**

The blocker is upstream semantic fidelity, not absence of runtime code.

---

## S｜Source / authority boundary — PASS

Current owner architecture is explicit:

- **7,946 Word Natural Owners**;
- **369 Relation Owners**;
- deterministic lookup/reference stores are not semantic authority;
- learner runtime reads Current Natural Owners;
- legacy/reference semantic fallback is forbidden;
- Natural Owner cutover reconstructed the then-current canonical plane with `semantic_delta = 0`.

`semantic_delta = 0` proves faithful reconstruction of the then-current canonical representation. It does **not** prove that every earlier Chat-approved semantic operation had been correctly realized before cutover.

Historical semantic authority may be used only in the bounded migration-integrity audit. It is evidence, not a runtime fallback and not immutable ontology.

---

## K｜Knowledge — BLOCKED

Known defect classes include P0 owner-health failures, stale/misbound carriers, missing approved senses/constructions/phrases, relation gaps, operation-target vs KEEP/PRESERVE binding errors, overmerge/carrier loss, wrong anchors, stale duplicate representation, and ownership mistakes between Word/Identity and Relation layers.

Current K exit rule remains:

- P0 = 0;
- known P1 authority-fidelity defects = 0;
- known approved semantic debt classified and closed;
- repeated stratified samples stop exposing systematic lifecycle/binding defects;
- rich-word samples show trustworthy learner-value selection rather than dictionary accumulation;
- a documented stop rule has been reached.

### Current acceptance evidence

- commit `3721460828220ad44a3aca01b5a6004fd3671b62` — reopened Knowledge with fidelity-first reacceptance;
- commit `3f3aef9a677cfe64e855898b613fe0349ee7e5c2` — repaired P0 calibration batch 0001 and reduced then-known P0 from **368 → 361**; K remained BLOCKED;
- Issue #6 — active migration semantic-integrity work owner;
- commit `f910a8fa561d7fb17c832338ff6a2f3a14f5ea04` — **R12 coverage complete, not repaired**: 57 Core = **11 correct / 46 defective**; 44 Expansion owner-groups = **6 correct / 6 presentation-only / 1 wrong-anchor / 31 full gaps**; 26 Contrast targets had no exact source-facing R12 relation views;
- commits `f5bd77a118f616d6de3f690f20ed2ae2cffe63de` + `75219bc180d3c5a9f37340eac05e2530d23d0100` — **R13 coverage complete, not repaired**: 86 Core = **18 correct / 68 defective**; 81 Expansion targets across 54 owner-groups = **15 correct / 17 partial-or-presentation / 22 full gaps**; 45 Contrast = **1 correct / 1 presentation-only / 39 missing relation / 4 form-pronunciation gaps**;
- commit `82282447a67c850db56bc4893d4d3fcfcfc02455` — **R14 coverage complete, not repaired**: 58 Core = **10 correct / 48 defective**, including six reproduced `Active=0` P0 owners; 140 Expansion = **32 correct / 3 partial / 105 full gaps**; 42 Contrast = **2 Current-correct + 1 authority-condition satisfied / 36 missing relation / 3 form-pronunciation gaps**;
- commit `351fed602c4fab056df96741406963ab66c7a81f` — **R15 coverage complete, not repaired**, now using the dual-track method: 120 Core = **22 Current-correct / 98 defective**, including **10 Active=0 P0 owners** (`lyric`, `machine`, `maintenance`, `married`, `mental`, `midst`, `modern`, `mold`, `mute`, `nearby`) plus a dead construction anchor at `miss`; 145 Expansion = **52 correct / 16 partial-or-presentation / 77 missing**. The 45 historical Contrast targets were re-owned under the latest architecture as **36 genuine cross-word Relation targets** (1 correct / 1 partial / 34 missing) plus **9 Word/Identity targets** (7 full gaps / 2 partial), preventing case identities, heteronyms, and same-word construction contrasts from being forced into Relation Owners. A 12-word historical Core-direct-pass calibration sample found **0 new systematic Core defects**. Semantic mutation and learner-state mutation remained **0**.

R12–R15 completion means **audit/target coverage**, not K PASS and not semantic repair. Current Natural Owners / Relation Owners remain unchanged by these checkpoints.

### Latest-target rule

From R15 onward every high-information audit may explicitly supersede historical wording under the current `LEARNING_CONTRACT.md`. The repair inventory must use the **latest Chat-approved target**, not mechanically restore old text. Fresh outcomes may include `HISTORICAL_STILL_VALID`, `CURRENT_ALREADY_BETTER`, `UPGRADE_TARGET`, `DEMOTE_OR_DROP_NOW`, or fresh semantic judgment. Direct-pass regions are checked with small calibrated samples instead of a second full-corpus re-review.

---

## L｜Learning — PASS

`content/lexical/LEARNING_CONTRACT.md` remains the accepted learning model:

- fast, correct contextual lexical access rather than dictionary completion;
- rich Depth Scan / Recall Map before Reveal;
- familiar-new senses, real polysemy, Word Feel, constructions, phrase skeletons and material contrasts are prioritized;
- reference-only/historical/technical micro-senses stay out of the main Depth Scan unless they earn learner value;
- selective object-level `+` repair rather than whole-word permanent debt;
- Challenge is generated from Current semantics and does not consume protected unseen exam evidence;
- evidence strength rises toward later real/unseen-context transfer;
- Memory admission is selective and fading is evidence-driven.

K being BLOCKED does not imply the learning model is wrong. It means the semantic objects supplied to it are not trustworthy enough yet for unrestricted full-catalog use.

---

## P / R / E｜BLOCKED for unrestricted full-catalog use

Learner-facing runtime, routing, search, selective Repair, Challenge and Return Packet implementations exist. A known upstream Knowledge defect that can change learner-facing semantics prevents a full-catalog P/R/E PASS claim.

Controlled smoke tests may use semantically accepted subsets; full build, route existence, roundtrip, UI rendering, Challenge mechanics, or packet mechanics cannot substitute for K closure.

---

## U｜User Validation — UNTESTED for unrestricted full-catalog use

Private learner evidence remains separate. Until K passes, unrestricted full-catalog learner use is not a valid module-level U path. Controlled UX smoke may provide local friction evidence only; learner behavior cannot manufacture missing semantic authority.

---

## Current acceptance sequence

```text
K re-acceptance / migration-integrity + latest-target closure
↓
consolidated exact repair against latest approved targets
↓
re-evaluate full-catalog P / R / E
↓
real learner U on named paths
```

---

## Truth boundaries

### Artifact Truth

- owner routing → `content/lexical/manifest.json`
- Word owners → `content/lexical/words/by-ordinal/`
- Relation owners → `content/lexical/relations/by-id/`
- owner schema → `content/lexical/schema.json`
- lane learning semantics → `content/lexical/LEARNING_CONTRACT.md`
- knowledge reacceptance evidence → `content/lexical/audit/knowledge-reacceptance/`
- migration authority/readback → `content/lexical/audit/migration-integrity/`
- active migration work owner → GitHub Issue #6
- learner runtime → Vocabulary surfaces under `static-web/`

### Learner Truth

Private browser / packet / conversation evidence only. Shared K/P/R/E state must not be interpreted as Kian's personal vocabulary progress, repair queue, or mastery.
