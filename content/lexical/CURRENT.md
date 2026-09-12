# LexicalOS Current

Role: LexicalOS lane Work Cursor + restart entry  
Parent: root `CURRENT.md`

This file does not own lexical semantics, lane learning semantics, Acceptance Truth, or Kian's private learner progress.

---

## Work Cursor

**Active / earliest unresolved stage:** `K — consolidated exact repair inventory → bounded semantic repair`  
**Blocker:** known Current semantic-fidelity defects remain; full-catalog K is BLOCKED  
**Current work owner:** GitHub Issue #6 + `content/lexical/audit/knowledge-reacceptance/`  
**Historical audit coverage:** **COMPLETE through corpus end, 1–7946. Do not open another historical round.**  
**Latest exact checkpoint:** `content/lexical/audit/knowledge-reacceptance/batches/r31-7701-7946-core-expansion-contrast.json` — final R31 coverage complete, not repaired. Historical authority = kianos-legacy Issue #113 comment `5589834920` (`updated_at=2026-09-08T18:21:30Z`); compact authority = `content/lexical/audit/migration-integrity/r31-execution-authority.md`; owner-enriched bulk run `34721495033`; artifact digest `sha256:51db3085b33236e4d8775a8ba6ca2831eba05ca7ed4181fc91dc82a7e2e95801`. Final R31 classification: **49 Core = 0 Current-correct / 49 defective-or-upgrade-required**, including **2 Active=0 P0** and **0 dead anchors**; historical Expansion metadata = **143 target ordinals**, exact learner acceptance = **99 surface/family groups = 64 correct / 21 partial / 14 missing**; Contrast = **63 Relation targets missing + 2 Word/Identity/Form targets (`finalize/finalise`, `statistic/statistics`) missing**, overall **0 complete / 65 missing**. Direct-pass calibration found **0 new systematic defect classes and 0 new isolated repair targets**. Natural Owner / Relation semantic mutation remained **0**.  
**Coverage transition:** R12–R31 durable checkpoints now close the bounded migration semantic-integrity first-pass; the legacy authority itself states final coverage through ordinal 7946. This closes **audit discovery**, not K. The active task is no longer “find the next historical batch”; it is to compile one exact, deduplicated repair inventory from the approved checkpoints, then mutate Current Natural Owners / Relations / Word-Identity-Form boundaries in bounded repair batches with deterministic readback.  
**Current review method:** historical authority is evidence, not immutable ontology. The repair inventory must use the **latest Chat-approved target** from each checkpoint, not blindly restore historical text. Core, Expansion and Contrast debt must be deduplicated by natural owner: one Word owner may absorb multiple Core + construction + word-internal polysemy defects; cross-word distinctions remain Relation-owned; spelling/capitalization/inflection/lexicalized-form distinctions remain Word/Identity/Form-owned. Mechanical owner health is only a lifecycle signal and cannot substitute for semantic acceptance.  
**Next action:** build `content/lexical/audit/knowledge-reacceptance/consolidated-repair-inventory.json` from R12–R31. Inventory generation must: (1) retain every defective Core and every partial/missing Expansion/Contrast item; (2) retain isolated direct-pass calibration upgrades; (3) deduplicate overlapping debt onto exact Natural Word / Relation / Form owners; (4) preserve source checkpoint + latest-target provenance; (5) separate **P0 lifecycle repair**, **Word semantic repair**, **Relation repair**, **Word/Identity/Form repair**, and **construction/presentation-only repair**; (6) fail closed on ambiguous ownership rather than guessing. After inventory readback, execute bounded repair batches beginning with P0/lifecycle defects, not by ordinal chronology.

Rule-layer work does not own lexical semantic mutation. Natural Owner / Relation repair remains inside the active Lexical K authority and must always use the latest Current owner before mutation.

---

## Frozen / out of scope

While K is BLOCKED:

- do not present unrestricted full-catalog learner use as accepted U;
- do not use build/route/UI completeness to promote K/P/R/E;
- do not open R32 or any new historical review round unless new evidence explicitly invalidates coverage closure;
- do not regenerate all 7,946 words or overwrite healthy owners wholesale;
- do not use frozen baseline alone as semantic authority;
- do not mutate private learner + / wrong / slow / Challenge / packet history;
- do not change English / Politics / Xizong sibling scopes;
- controlled UX smoke is allowed only on semantically accepted subsets and cannot close full-module U.

---

## Required reads

For normal re-entry into the active K lane:

1. `content/lexical/ACCEPTANCE.md`
2. current GitHub Issue #6
3. `content/lexical/audit/knowledge-reacceptance/consolidated-repair-inventory.json` once present
4. only the exact source checkpoint / Current owner needed for the active repair batch

Read `content/lexical/audit/knowledge-reacceptance/README.md` when the audit or repair method boundary needs inspection. Read `LEARNING_CONTRACT.md` when a latest-target judgment is required. Do not reread the full legacy history or 7,946-word corpus by default.

---

## Truth references

### Artifact Truth

- owner map → `content/lexical/manifest.json`
- owner schema → `content/lexical/schema.json`
- Natural Word owners → `content/lexical/words/by-ordinal/`
- Relation owners → `content/lexical/relations/by-id/`
- lane learning semantics → `content/lexical/LEARNING_CONTRACT.md`
- knowledge audit / repair evidence → `content/lexical/audit/knowledge-reacceptance/`
- migration authority/readback → `content/lexical/audit/migration-integrity/`
- learner runtime → Vocabulary surfaces under `static-web/`

### Acceptance Truth

`content/lexical/ACCEPTANCE.md`

### Learner Truth

Private browser / packet / conversation evidence only. Shared lexical K/P/R/E state cannot manufacture personal learner progress or repair debt.

---

## Fresh-Chat target

Known scope `LexicalOS semantic re-acceptance` should now recover as:

```text
Lexical CURRENT
→ Lexical ACCEPTANCE
→ Issue #6
→ consolidated repair inventory
→ exact source checkpoint + latest Current owner for active repair batch
→ work
```

Do not resume historical batch archaeology after R31 unless a new source contradiction requires it.