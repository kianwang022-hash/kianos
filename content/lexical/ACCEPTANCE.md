# LexicalOS Acceptance

Status: CURRENT  
Standard: root `LEARNING_ACCEPTANCE.md`  
Role: LexicalOS lane Acceptance Truth

This file owns current learner-readiness claims for LexicalOS.

It does not own lexical semantics, lane learning semantics, the K re-acceptance audit procedure, Work Cursor, or Kian's private learner evidence.

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

This is not a claim that Vocabulary runtime code is absent or mechanically broken. The blocker is upstream semantic fidelity.

---

## S｜Source / authority boundary — PASS

Current owner architecture is explicit:

- **7,946 Word Natural Owners**;
- **369 Relation Owners**;
- deterministic non-semantic lookup/reference stores are not semantic authority;
- learner runtime reads Current Natural Owners;
- legacy/reference semantic fallback is forbidden;
- Natural Owner cutover reconstructed the then-current canonical plane with `semantic_delta = 0`.

Important boundary:

> `semantic_delta = 0` proves faithful reconstruction of the then-current canonical representation. It does **not** prove that every earlier Chat-approved semantic operation had been correctly realized into that canonical representation before cutover.

Historical semantic authority may be used only in the bounded migration-integrity audit defined by Issue #6 / the knowledge-reacceptance owner. It is not a normal runtime fallback.

---

## K｜Knowledge — BLOCKED

Canonical owner existence is not enough. `content/lexical/audit/knowledge-reacceptance/README.md` reopened K because historical Chat-approved operations were sometimes realized into the wrong semantic targets before Natural Owner cutover.

Known defect classes include:

- P0 owner integrity failures such as non-empty Core with zero Active learner senses;
- stale/misbound Core carriers;
- missing or incorrectly realized approved senses / constructions / phrase targets;
- missing learner-facing relation views despite related semantic objects existing elsewhere;
- operation-target vs KEEP/PRESERVE binding errors;
- overmerge / carrier loss / wrong sense anchor / duplicate stale representation.

Current K exit rule remains:

- P0 = 0;
- known P1 authority-fidelity defects = 0;
- known approved semantic debt classified and closed;
- stratified samples stop exposing systematic lifecycle/binding defects;
- rich-word learner-value selection is trustworthy rather than dictionary accumulation;
- a documented stop rule has been reached.

### Current acceptance evidence

- commit `3721460828220ad44a3aca01b5a6004fd3671b62` — reopened Knowledge with fidelity-first reacceptance;
- commit `3f3aef9a677cfe64e855898b613fe0349ee7e5c2` — repaired P0 calibration batch 0001 and reduced then-known P0 from **368 → 361**; K remained BLOCKED;
- Issue #6 — active migration semantic-integrity audit and historical authority reconciliation;
- commit `f910a8fa561d7fb17c832338ff6a2f3a14f5ea04` — **R12 coverage complete, not repaired**: 57 Core decisions = **11 correct / 46 defective**; 44 Expansion owner-groups = **6 correct / 6 presentation-only / 1 wrong-anchor / 31 full gaps**; its 26 Contrast targets had already shown no exact source-facing R12 relation views;
- commit `f5bd77a118f616d6de3f690f20ed2ae2cffe63de` + commit `75219bc180d3c5a9f37340eac05e2530d23d0100` — **R13 coverage complete, not repaired**: 86 Core decisions = **18 correct / 68 defective**; 81 Expansion targets across 54 owner-groups = **15 correct / 17 partial-or-presentation / 22 full gaps**; 45 Contrast targets = **1 exact Current-correct / 1 presentation-only / 39 missing relation / 4 form-pronunciation gaps**;
- commit `82282447a67c850db56bc4893d4d3fcfcfc02455` — **R14 coverage complete, not repaired** for ordinals 2601–2900 using frozen historical authority and one bulk Current readback: 58 Core decisions = **10 correct / 48 defective**, including six reproduced `Active=0` P0 owners (`invalid`, `isle`, `job`, `kiss`, `leading`, `limited`); 140 Expansion targets = **32 correct / 3 partial / 105 full landing gaps**; 42 Contrast targets = **2 Current-correct + 1 authority-condition satisfied / 36 missing relation gaps / 3 form-pronunciation gaps**. Semantic mutation and learner-state mutation remained **0**;
- R14 bulk workflow run `34700021176` processed the full 300-ordinal authority round in one pass. The earlier run `34699852615` failed only because the current-repo Actions token could not read the private legacy repo; the authority was frozen into Current and the rerun passed. This is infrastructure evidence, not a semantic failure.

R12/R13/R14 completion means **audit coverage**, not K PASS and not semantic repair. Current Natural Owners / Relation Owners remain unchanged by these checkpoints.

The active review cadence is now bulk-first: historical authority is frozen as a manifest, Current Word/Relation Owners are mechanically read back in one round, and Chat reviews only P0/P1 anomalies, ambiguous carrier/binding cases, and calibrated green samples. One-word reads are not the default workflow.

---

## L｜Learning — PASS

`content/lexical/LEARNING_CONTRACT.md` remains the accepted learning model:

- goal = fast, correct contextual lexical access rather than dictionary completion;
- rich Depth Scan / Recall Map before Reveal;
- selective object-level `+` repair rather than mandatory whole-word card debt;
- Challenge generated from Current semantics without consuming protected unseen transfer material;
- evidence strength rises toward later fresh/real context;
- Memory admission is selective rather than 7,946-word permanent review debt;
- Return Packet / Challenge Packet keep learner evidence private and evidence-driven.

K being BLOCKED does not imply the learning model is wrong. It means the semantic objects supplied to that learning model are not trustworthy enough yet for unrestricted full-catalog use.

---

## P / R / E｜BLOCKED for unrestricted full-catalog use

Current learner-facing runtime, full-catalog routing, search, selective Repair, Challenge and Return Packet implementations exist. However, a known upstream Knowledge defect that can change learner-facing semantics prevents a full-catalog P/R/E PASS claim.

Controlled smoke tests may use semantically accepted subsets. They do not close the unrestricted module gate.

Do not use full build, 7,946/7,946 route existence, Natural Owner roundtrip, UI rendering, Challenge mechanics, or packet mechanics as substitutes for K closure.

---

## U｜User Validation — UNTESTED for unrestricted full-catalog use

Private real learner evidence remains separate. Until K passes:

- unrestricted full-catalog learner use is not a valid module-level U acceptance path;
- controlled UX smoke on semantically accepted subsets may produce local friction evidence only;
- learner success/failure cannot repair missing canonical semantic authority by itself.

---

## Current acceptance sequence

```text
K re-acceptance / migration-integrity closure
↓
re-evaluate full-catalog P / R / E against repaired Current semantics
↓
real learner U on named paths
```

Do not jump to full-catalog learner validation while K remains BLOCKED.

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
- current migration work owner → GitHub Issue #6
- learner runtime → Vocabulary surfaces under `static-web/`

### Learner Truth

Private browser / packet / conversation evidence only. Shared K/P/R/E state must not be interpreted as Kian's personal vocabulary progress, repair queue, or mastery.
