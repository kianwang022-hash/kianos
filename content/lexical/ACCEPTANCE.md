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

This is not a claim that the Vocabulary runtime code is absent or mechanically broken. The blocker is upstream semantic fidelity.

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

Canonical owner existence is not enough.

`content/lexical/audit/knowledge-reacceptance/README.md` formally reopened K because some historical approved operations were realized into the wrong Current semantic targets before Natural Owner cutover.

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

Current acceptance evidence includes:

- commit `3721460828220ad44a3aca01b5a6004fd3671b62` — reopened Knowledge with fidelity-first reacceptance;
- commit `3f3aef9a677cfe64e855898b613fe0349ee7e5c2` — repaired P0 calibration batch 0001 and reduced P0 from **368 → 361**; K remained BLOCKED;
- current Issue #6 — migration semantic-integrity audit / R12+ authority reconciliation;
- commit `7943292b6eaa08059dbbf24057cd22067ce7d5c1` — exact R12 Core + Expansion reconciliation for ordinals 2101–2140, with **0 semantic mutation**;
- commit `c490b86494af10fd03722ea7679f211711c07e84` — exact R12 Core + Expansion reconciliation for ordinals 2141–2180, with **0 semantic mutation**;
- commit `23832cb058e241a82276504dbd88a2e36286792b` — exact R12 Core + Expansion reconciliation for ordinals 2181–2220, with **0 semantic mutation**;
- commit `782bdcf8bb24d4751dbdc7dfd87068ca13684176` — exact R12 Core + Expansion reconciliation for ordinals 2221–2260, reproducing severe carrier loss at `word:guy`, `word:habit`, and `word:handicap`, with **0 semantic mutation**;
- commit `fd73057d1956bb2a85db1ef967bb52e96dec595a` — exact R12 Core + Expansion reconciliation for ordinals 2261–2300, reproducing a P0 carrier-loss state at `word:he` and severe carrier loss at `word:heel`, with **0 semantic mutation**;
- commit `f910a8fa561d7fb17c832338ff6a2f3a14f5ea04` — **R12 audit coverage complete, not repaired**: all **57/57** historically approved Core revision decisions reconciled (**11 Current-correct / 46 defective**); all **44** historical Expansion owner-groups reconciled (**6 Current-correct / 6 presentation-only gaps / 1 wrong-sense-anchor / 31 phrase-or-construction landing gaps**); the earlier R12 Contrast checkpoint had already checked **26/26** approved targets and found 0 exact source-facing R12 relation views. Reproduced P0 examples include `word:gentle`, `word:glove`, `word:gradual`, and `word:he`;
- commit `cf342b25b7927c322108aba8b4d8513a72a36891` — R13 ordinals 2301–2340 Core + Expansion reconciliation against historical comment `5581086274`: 20 Core decisions checked (**5 Current-correct / 15 defective**) and 7 Expansion owner-groups checked (**4 Current-correct / 3 phrase-or-construction landing gaps**), with **0 semantic mutation**. This checkpoint reproduced new P0 carrier-loss states at `word:herb` and `word:hinder`, and severe overmerge/carrier loss at `word:help` and `word:hide`;
- commit `fb92325663f4df34d1aa7acbe442ca8af285e419` — R13 ordinals 2341–2380 Core + Expansion reconciliation: 11 Core decisions checked (**3 Current-correct / 8 defective**) and 8 Expansion owner-groups checked (**2 Current-correct / 1 partial landing gap / 5 full phrase-or-construction landing gaps**), with **0 semantic mutation**. This checkpoint reproduced a new P0 carrier-loss state at `word:hopeful` and severe carrier inversions at `word:honey` and `word:horn`;
- commit `636e3247ca78c276a9c23871ef8a1bf8ae9b7eeb` — R13 ordinals 2381–2420 Core + Expansion reconciliation: 6 Core decisions checked (**0 Current-correct / 6 defective**) and 4 Expansion owner-groups checked (**1 Current-correct / 1 partial / 2 full landing gaps**), with **0 semantic mutation**. This checkpoint reproduced new P0 carrier-loss states at `word:hostile` and `word:how`;
- commit `cd4e18c773d17bef9063746a920e6b1a004295b3` — R13 ordinals 2421–2440 Core + Expansion reconciliation: 4 Core decisions checked (**1 Current-correct / 3 defective**) and 5 Expansion owner-groups checked (**1 Current-correct / 2 partial / 2 full landing gaps**), with **0 semantic mutation**. This checkpoint reproduced a new P0 carrier-loss state at `word:i`;
- commit `5d63e75cc7e87710ac611257f537b58779ea5d32` — R13 ordinals 2441–2480 Core + Expansion reconciliation: 13 Core decisions checked (**3 Current-correct / 10 defective**) and 11 Expansion owner-groups checked (**3 Current-correct / 5 partial / 3 full landing gaps**), with **0 semantic mutation**. This checkpoint reproduced new P0 carrier-loss states at `word:image` and `word:immune`, plus severe carrier inversion at `word:illuminate`, `word:impact`, `word:impress`, and `word:impression`;
- commit `532b7a05dbd5273962a4fec3648c69a9ab266d57` — R13 ordinals 2481–2500 Core + Expansion reconciliation: 5 Core decisions checked (**2 Current-correct / 3 defective**) and 5 Expansion owner-groups checked (**1 Current-correct / 1 partial / 3 full landing gaps**), with **0 semantic mutation**. This checkpoint reproduced a new P0 carrier-loss state at `word:in` and severe carrier inversion at `word:independence`;
- commit `53c97727f269badcd709e4dc4c6bbbfb1aba848a` — R13 ordinals 2501–2540 Core + Expansion reconciliation: 10 Core decisions checked (**2 Current-correct / 8 defective**) and 5 Expansion owner-groups checked (**1 Current-correct / 2 partial/presentation gaps / 2 full landing gaps**), with **0 semantic mutation**. This checkpoint reproduced new P0 carrier-loss states at `word:indispensable` and `word:induce`, plus severe carrier inversion at `word:infinite` and `word:information`;
- commit `3668fd827413182a4c6f70fcf21960fa1a2d44a8` — R13 ordinals 2541–2560 Core + Expansion reconciliation: 4 Core decisions checked (**1 Current-correct / 3 defective**) and 2 Expansion owner-groups checked (**0 Current-correct / 1 partial presentation gap / 1 full landing gap**), with **0 semantic mutation**;
- commit `fd18c8f3c71bf6ab219e4f2d34b328c47b71318e` — R13 ordinals 2561–2580 Core + Expansion reconciliation: 9 Core decisions checked (**1 Current-correct / 8 defective**) and 2 Expansion owner-groups checked (**1 Current-correct / 1 partial presentation gap**), with **0 semantic mutation**. Severe carrier inversion was reproduced at `word:inspiration`, `word:inspire`, `word:instalment`, and `word:instance`;
- commit `a182de8319c1f1c136c2a3ed5901e9eeda427819` — R13 ordinals 2581–2600 Core + Expansion reconciliation: 4 Core decisions checked (**0 Current-correct / 4 defective**) and 5 Expansion owner-groups checked (**1 Current-correct / 3 partial presentation gaps / 1 full landing gap**), with **0 semantic mutation**. This checkpoint reproduced a new P0 carrier-loss state at `word:insurance`;
- commit `f5bd77a118f616d6de3f690f20ed2ae2cffe63de` — **R13 Core + Expansion coverage complete, not repaired**: all **86/86** historically approved Core revision decisions reconciled (**18 Current-correct / 68 defective**); all **81 historical Expansion targets** reconciled across **54 owner-groups** (**15 Current-correct / 17 partial-or-presentation gaps / 22 full landing gaps**), with **0 semantic mutation**;
- commit `75219bc180d3c5a9f37340eac05e2530d23d0100` — **R13 Contrast coverage complete, not repaired**: all **45/45** approved Contrast targets reconciled using a bulk Relation/Word Owner readback plus six Chat-reviewed exceptional/self-view candidates. Final classification = **1 Current-correct / 1 presentation-only gap / 39 authority-missing relation gaps / 4 form-pronunciation gaps**, with **0 semantic mutation**. The bulk readback used authority manifest `content/lexical/audit/migration-integrity/r13-contrast-authority.json`, workflow run `34698350670`, and reduced manual owner review from 45 targets to 6 exceptional candidates;
- therefore **R13 audit coverage as a whole is complete, not repaired** across Core + Expansion + Contrast. This closes coverage only; the 68 Core defects, Expansion gaps, Contrast gaps, and reproduced P0 states remain repair debt.

R12 and R13 audit completion are evidence of defect coverage, **not** a K PASS and not semantic repair. Current Natural Owners remain unchanged by these reconciliation checkpoints.

Rule-layer maintenance must not reapply, infer, or rewrite lexical semantics. Semantic repair remains with the active Lexical K owner/work lane and must read latest Current authority before mutation.

---

## L｜Learning — PASS

The current `content/lexical/LEARNING_CONTRACT.md` remains the accepted learning model for the lane:

- goal = fast, correct contextual lexical access rather than dictionary completion;
- rich Depth Scan / Recall Map before Reveal;
- selective object-level `+` repair rather than mandatory whole-word card debt;
- Challenge generated from Current semantics without consuming protected unseen transfer material;
- evidence strength rises toward later fresh/real context;
- Memory admission is selective rather than 7,946-word permanent review debt;
- Return Packet / Challenge Packet keep learner evidence private and evidence-driven.

K being BLOCKED does not automatically mean the learning model is wrong. It means the semantic objects supplied to that learning model are not yet trustworthy enough for unrestricted full-catalog use.

---

## P / R / E｜BLOCKED for unrestricted full-catalog use

Current learner-facing runtime, full-catalog routing, search, selective Repair, Challenge and Return Packet Artifact implementations exist.

However, under the root acceptance standard, a known upstream Knowledge defect that can change learner-facing semantics prevents a full-catalog P/R/E PASS claim.

Controlled smoke tests may use semantically accepted subsets. They do not close the unrestricted module gate.

Do not use:

- full Astro build;
- 7,946/7,946 route existence;
- Natural Owner roundtrip;
- UI rendering;
- Challenge mechanics;
- packet mechanics

as substitutes for K closure.

---

## U｜User Validation — UNTESTED for unrestricted full-catalog use

Private real learner evidence remains separate.

Until K passes:

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

Do not jump to real full-catalog validation while K remains BLOCKED.

---

## Truth boundaries

### Artifact Truth

- owner routing → `content/lexical/manifest.json`
- Word owners → `content/lexical/words/by-ordinal/`
- Relation owners → `content/lexical/relations/by-id/`
- owner schema → `content/lexical/schema.json`
- lane learning semantics → `content/lexical/LEARNING_CONTRACT.md`
- knowledge reacceptance evidence/procedure → `content/lexical/audit/knowledge-reacceptance/`
- current migration-integrity work evidence → GitHub Issue #6
- learner runtime → Vocabulary surfaces under `static-web/`

### Learner Truth

Private browser / packet / conversation evidence only.

Shared K/P/R/E state must not be interpreted as Kian's personal vocabulary progress, repair queue, or mastery.
