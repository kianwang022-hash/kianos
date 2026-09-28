# Lexical Closure Audit — o0801–o0900 Final-Standard Backfill

- **Candidate:** BF08
- **Scope:** `o0801–o0900`
- **Semantic / Final-Learner owner-read head:** `2051577bd87be290724eb63262a870d2fd499b03`
- **Latest main at audit close:** `ed74e572ad6f2f727b516bb105f6ec3c9b48a07e`
- **Production proposal:** `content/lexical/execution/manifests/o0801-o0900.final-semantic-sweep-c-proposal.md`
- **Production proposal blob:** `c1a1f3f678879eedc42e2bdb3d72f4a8e55c6c0a`
- **Production module matrix blob:** `9763349a7ac6b3cfda4e9e8f5b8ffbe04ced1612`
- **Content contract blob:** `e24ee14086ad711469ba56030a71df72e0d4910c`
- **Audit contract blob:** `9fa1dc0491a6b0affa677b0444262b6203d09756`
- **Audit mode:** STRICT
- **Blind-first:** `BLIND_FIRST_NOT_ENFORCED`

## Independence boundary

Kian explicitly requested continuous same-Chat execution. This Chat had already read Production's detailed proposal before auditing the materialized candidate. Therefore the audit is valid for semantic / identity / ownership defect discovery and bounded reconciliation, but it is **not reviewer-independence evidence**.

## Coverage

The three Final Learner Object shards spanning o0801–o0900 were read in full: **100/100 owners**. All 26 Production-affected owners, touched cross-range relation targets, Form/identity owners and the final 16 Repair Test targets were read back.

```text
scope owners: 100/100
production affected reverse-reviewed: 26/26
mandatory Form/identity cases: 9/9
mandatory Relation/confusable cases: 14/14
mandatory Secondary/Expansion cases: 4/4
complex owners: 88/88
complex NO_CHANGE owners: 62/62
simple NO_CHANGE fast-gated: 12/12
simple NO_CHANGE deep-sampled: 10/12
simple deep sample: 804, 806, 816, 834, 837, 840, 845, 875, 879, 881

Repair Test blueprints: 29 -> 16
Repair Test targets resolved: 16/16
Final Learner Objects: 7,946
```

The cross-range reciprocal readback also covered:
`allege@o0146 / assert@o0300 / course@o1128 / dress@o1508 / sight@o4430 / site@o4463 / train@o5092 / cigarette@o5522`.

## Findings

### F1 — cite / site / sight coalesced Relation

**Production owner:** o0815 cite + cross-range relation dependencies  
**Audit verdict:** `REFINE_UPGRADE`  
**Severity:** MATERIAL / OWNERSHIP

The candidate correctly coalesced the learner relation into one three-way homophone owner and preserved the original `horizontal:010` evidence. However:

1. each view uses the full cluster as `target_expression`, producing learner titles such as `cite ↔ cite ↔ sight ↔ site`;
2. the retired pairwise cite↔site and sight↔site Relation owners still retain live `word_views` even though no Word owner references them.

**Bounded correction:** set each source view's target expression to the **other two** words; keep original evidence; clear the old pairwise owners' live views and mark them retired into the coalesced relation.

### F2 — claim / allege / assert shared Relation

**Production owner:** o0822 claim + cross-range relation dependencies  
**Audit verdict:** `REFINE_UPGRADE`  
**Severity:** MATERIAL / SOURCE-FIDELITY

The reciprocal semantic boundary is correct, but:
- view titles self-repeat (`claim ↔ ... ↔ claim`, `allege ↔ allege ...`, etc.);
- the new allege/assert views carry the source evidence item but not the original `source_evidence_objects`.

**Bounded correction:** source-specific target expressions must contain only the other two words; copy the original relation evidence object into reciprocal views. No new semantic claim is introduced.

### F3 — cigaret/cigarette and color/colour ownership migration

**Production owners:** o0807, o0900  
**Audit verdict:** `REFINE_UPGRADE`  
**Severity:** IDENTITY / OWNER

The learner-facing Word owners correctly use Form/Identity and no longer reference semantic Relations. The old spelling Relation owners, however, still contain live `word_views`.

**Bounded correction:** retire those Relation views to Form/Identity ownership (empty live views + explicit provenance). Do not invent a `colour` Main Word owner; none exists.

### F4 — cloth / clothes / clothing shared Relation title

**Production owners:** o0858 cloth, o0860 clothes; complex NO_CHANGE dependency o0861 clothing  
**Audit verdict:** `REFINE_UPGRADE` for affected owners; `FLIP_TO_UPGRADE` for the o0861 projection defect  
**Severity:** LOCAL / LEARNER-FACING

The accepted relation content is correct, but each view repeats its own source in the title because `target_expression` contains all three words:
- `cloth ↔ cloth ↔ clothes ↔ clothing`
- `clothes ↔ cloth ↔ clothes ↔ clothing`
- `clothing ↔ cloth ↔ clothes ↔ clothing`

**Bounded correction:** source-specific target expression = the other two words.

**Source gap:** this inherited Relation owner has no evidence metadata. BF08 did not introduce its semantic boundary, so this is recorded as an inherited non-blocking Source gap; do not fabricate provenance.

### F5 — o0838 clean phraseology owner migration

**Production verdict:** UPGRADE  
**Audit verdict:** `REFINE_UPGRADE`  
**Severity:** MATERIAL / OWNER

Production explicitly required `clean energy / clean technology / clean fuel` to move out of fake Construction ownership into Phraseology/Collocation. The candidate only changed metadata on the existing Construction object. Final Learner Object still renders it as a Construction.

**Bounded correction:** remove the Construction-shaped object and attach the accepted phrase set as a collocation/phraseology item to the ordinary adjective Sense. Preserve the exact learner meaning; no new scope.

### F6 — o0839 clear phraseology owner migration

**Production verdict:** UPGRADE  
**Audit verdict:** `REFINE_UPGRADE`  
**Severity:** MATERIAL / OWNER

The three accepted lexicalized expressions:
- `clear one's throat`
- `clear a debt / bill / balance`
- `in the clear`

still render from `record.constructions` despite Production requiring Phraseology/Collocation ownership.

**Bounded correction:** migrate them to stable collocation items anchored to appropriate existing clear Senses; remove the Construction-shaped objects.

## Findings not escalated

- civilisation/civilization and civilise/civilize Form boundaries materialize correctly.
- class verb reactivation preserves the existing stable Sense ID and adds the approved reusable pattern.
- classic/classical, clothe/dress, coach/train, coarse/course and college/colleague read back reciprocally.
- close / Christmas / Coke / colonel Form identities remain available through boundaries/variants even when the optional top-level `boundary` string is empty.
- climb's physical I/T correction and abstract-rise learner branch are both visible.
- the six approved new-material owners remain within Human-approved scope.
- all 16 retained Repair Test targets resolve.

## Source fidelity

```text
cite/site/sight original external-horizontal evidence: PRESERVED
claim/allege/assert original external-horizontal evidence: PRESERVED, reciprocal source-evidence objects need copy
cloth/clothes/clothing: INHERITED_SOURCE_GAP_NONBLOCKING
fabricated source/provenance: NONE
```

## Batch verdict

```text
MATERIAL findings: 4
IDENTITY/OWNER findings: 1
LOCAL learner-facing findings: 1
complex NO_CHANGE false-pass: 1/62 = 1.61%
simple sampled NO_CHANGE false-pass: 0/10 = 0%
BLOCKED: 0

new Human semantic delta required: NO
broad semantic reopen required: NO
pre-reconciliation batch result: PASS_WITH_CORRECTIONS
```

All findings are owner/projection/source-fidelity corrections inside already-approved BF08 intent.
