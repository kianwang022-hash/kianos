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

Known defect classes include P0 owner-health failures, stale/misbound carriers, missing approved senses/constructions/phrases, relation gaps, operation-target vs KEEP/PRESERVE binding errors, overmerge/carrier loss, wrong anchors, stale duplicate representation, and ownership mistakes between Word/Identity/Form and Relation layers.

Current K exit rule remains:

- P0 = 0;
- known P1 authority-fidelity defects = 0;
- known approved semantic debt classified and closed;
- repeated stratified samples stop exposing systematic lifecycle/binding defects;
- rich-word samples show trustworthy learner-value selection rather than dictionary accumulation;
- a documented stop rule has been reached.

### Current exact acceptance evidence

- Issue #6 is the active migration semantic-integrity work owner.
- Detailed round evidence is durable under `content/lexical/audit/knowledge-reacceptance/batches/`; this file intentionally keeps only current acceptance truth rather than duplicating every historical packet.
- **R23 — 5301–5600**, checkpoint commit `05c7a4ee16209dcb5692643d9a95580c30e9bf60`: 84 Core = **18 Current-correct / 66 defective-or-upgrade-required**, including **7 Active=0 P0** and **0 dead anchors**; 101 exact Expansion surface/family groups = **49 correct / 15 partial / 37 missing**; Contrast = **2 complete / 1 partial / 66 missing**. Semantic and learner-state mutation remained **0**.
- **R24 — 5601–5900**, checkpoint commit `7f0c47779a229147f3bf3840c4ed05caecff3a97`: 91 Core = **51 Current-correct / 40 defective-or-upgrade-required**, with **0 Active=0 P0** and **0 dead anchors**; 61 exact Expansion surface/family groups = **7 correct / 24 partial / 30 missing**, including explicit `hassle-free` **OWNER_ABSENT** debt; Contrast = **0 complete / 1 partial / 79 missing**. Semantic and learner-state mutation remained **0**.
- **R25 — 5901–6200**, checkpoint commit `e332d7b25fedc2279f93ffda5eb4ead2a6003de1`: 101 Core = **22 Current-correct / 79 defective-or-upgrade-required**, including **33 Active=0 P0** and **0 dead anchors**; 92 exact Expansion surface/family groups = **3 correct / 13 partial / 76 missing**; 80 Contrast targets = **70 genuine Relation targets all missing + 10 Word/Identity/Form targets all missing**. Overall Contrast = **0 complete / 80 missing**. A 12-owner historical Core-direct-pass calibration sample found **0 new systematic Core defects**. Semantic and learner-state mutation remained **0**.
- **R26 — 6201–6500**, checkpoint commit `9bd98ae0524f4dcf6457166a83afb24ec6b51ff7`: 97 Core = **13 Current-correct / 84 defective-or-upgrade-required**, including **26 Active=0 P0** and **0 dead anchors**; 87 exact Expansion surface/family groups = **13 correct / 35 partial / 39 missing**; 86 Contrast targets were re-owned as **80 genuine Relation targets = 0 correct / 1 partial / 79 missing** plus **6 Word/Identity/Form targets = 6 missing**. Overall Contrast = **0 complete / 1 partial / 85 missing**. A 12-owner historical Core-direct-pass calibration sample found **0 new systematic Core defects**. R26 also hardened compound-surface owner resolution (`high-caliber` → `caliber`) without changing approved surface text. Semantic and learner-state mutation remained **0**.
- **R27 — 6501–6800**, checkpoint commit `e3fdb557f5c7738563a0c528389aa29ae7b1d384`: 83 Core = **5 Current-correct / 78 defective-or-upgrade-required**, including **16 Active=0 P0** and **0 dead anchors**; historical Expansion coverage enumerates 144 target words while exact learner acceptance uses 116 surface/family groups = **33 correct / 50 partial-or-presentation-or-wrong-anchor / 33 missing**; all **80 Contrast targets are Relation-owned and missing**. A 12-owner historical Core-direct-pass calibration sample found **0 new systematic defect classes**, while retaining two isolated latest-target upgrades (`enervate`, `exterminate`) for the consolidated repair inventory. R27 also strengthened evidence readback so Expansion rows carry compact Current owner projections, allowing Chat to distinguish semantic-family presence from phrase/construction presentation absence. Semantic and learner-state mutation remained **0**.

R12–R27 completion means **audit/target coverage only**, not K PASS and not semantic repair. Earlier exact round evidence remains in the durable batch checkpoints and repository history; Current Natural Owners / Relation Owners have not been mutated by these audit checkpoints.

### Latest-target rule

From R15 onward every high-information audit may explicitly supersede historical wording under the current `LEARNING_CONTRACT.md`. The repair inventory must use the **latest Chat-approved target**, not mechanically restore old text. Fresh outcomes may include `HISTORICAL_STILL_VALID`, `CURRENT_ALREADY_BETTER`, `UPGRADE_TARGET`, `DEMOTE_OR_DROP_NOW`, or fresh semantic judgment.

Direct-pass regions are checked with small calibrated samples instead of a second full-corpus rereview. A calibration round may find no new repeated defect class while still exposing isolated learner-value defects; those defects remain explicit repair debt rather than being hidden to preserve a clean systematic-defect count. Historical Expansion owner lists are coverage metadata; explicit learner-value surfaces/families determine acceptance. Expansion evidence should carry enough Current owner projection to distinguish semantic-family coverage from first-class construction/presentation coverage. Same-word pronunciation, spelling, capitalization, inflection and lexicalized compound/form boundaries belong to Word/Identity/Form ownership rather than being forced into cross-word Relations. Explicit historical learner surfaces without a Current owner remain auditable repair debt rather than parser failures. Compound learner surfaces may resolve to valid component owners without changing the semantic target text.

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
