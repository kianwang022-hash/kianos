# Lexical Closure Audit — o1101–o1150 Final-Standard Backfill

- **Candidate:** BF11
- **Scope:** `o1101–o1150`
- **Semantic / Final-Learner owner-read head:** `046bcd9f823763996d9d297c7be7e28b38b22dc0`
- **Latest main at audit close:** `16d9e04abc1bfad03d9e7a8be8698d1dd94def90`
- **Production proposal blob:** `cda15b42cc78270baac48db66464f7b98599e1e2`
- **Production module matrix blob:** `b778f770a9e50b12e1f0023a96bf87a8b702aa4c`
- **Content contract blob:** `e24ee14086ad711469ba56030a71df72e0d4910c`
- **Audit contract blob:** `9fa1dc0491a6b0affa677b0444262b6203d09756`
- **Final semantic freeze blob:** `1803953d7568143a499ed2fb0f12a5a263dd8955`
- **Audit mode:** STRICT
- **Blind-first:** `BLIND_FIRST_NOT_ENFORCED`

## Independence boundary

Kian explicitly requested continuous same-Chat execution. This Chat had already read Production's detailed proposal before auditing the materialized candidate. The audit is valid for semantic, identity, ownership, source-fidelity and Repair-Test defect discovery, but it is **not reviewer-independence evidence**.

## Coverage

```text
scope owners: 50/50
Production-affected owners reverse-reviewed: 12/12
complex owners: 44/44
complex NO_CHANGE owners: 32/32
simple NO_CHANGE owners: 6/6
simple deep sample: 6/6
simple sample: 1123, 1124, 1127, 1131, 1132, 1135

Form/identity owners in scope: 2/2
Relation/confusable owners in scope: 4/4
secondary-expansion owners in scope: 1/1
family-bearing owners in scope: 3/3
cross-range dependency explicitly read: cozy@o5739

Repair Test blueprints: 16 -> 9
Repair Test targets resolved: 9/9
Final Learner Objects: 7,946 / 125 shards
BLOCKED: 0
```

Mechanical learner-surface attack found:
- no empty family assets;
- no duplicate/self-repeating Relation titles in the BF11 final learner surface;
- no Sense/Construction duplicate expression ownership among BF11 materialized objects;
- cosy/cozy is Form/Identity-owned on both stable Word owners, with the old semantic Relation retired;
- crazy↔mad current truth already contains the approved register/safety boundary and therefore remains a no-op;
- all 9 final Repair Tests resolve to exact current learner targets.

## Finding

### F1 — o1136 `crab` Core cluster lifecycle residue

**Production operation:** UPGRADE — move specialist rowing `catch a crab` branch to Reference  
**Audit verdict:** `REFINE_UPGRADE`  
**Severity:** MATERIAL / OWNER  
**Risk family:** `CORE_REFERENCE_LEAK / LIFECYCLE_CLOSURE`

The rowing Sense `sense:crab:e70a176ef79c5ddf` was correctly removed from active Study and now exists as `reference_only`. The learner-facing Core summary is also corrected.

However, the canonical Core noun cluster still reads:

`螃蟹；脾气乖戾的人；划桨失误`

while its active `sense_ids` now contain only the animal and bad-tempered-person Senses. The text therefore leaks a Reference-only specialist branch back into Core.

**Bounded correction:**
- update the noun Core cluster label to describe only its remaining active Senses;
- preserve the rowing Sense and `catch a crab` truth in Reference;
- do not alter any other crab branch or add new material.

## Findings not escalated

- correspondence Core now covers both communication and correspondence/equivalence;
- `costly mistake` is attached to the serious-loss Sense rather than the price Sense;
- cottage cheese is no longer a collocation of the small-house Sense and survives as a word-owned lexicalized multiword learner asset;
- could has a usable modal decision model, `could have + past participle`, and the one-off past-achievement boundary;
- cover's false active intransitive surface-coverage branch is retired and `cover for sb` is explicit;
- crack Core now exposes `crack a code/case/problem` and `crack down on`;
- credential now covers qualification/experience evidence plus current digital authentication credentials;
- credit attribution is a reusable Construction and credit→creditor is a real financial relation;
- creep Form correctly exposes `creep → crept → crept`;
- crazy↔mad was already aligned on current main and required no rewrite.

## Source fidelity

No new external source claim was fabricated in BF11 reconciliation. Existing relation/source evidence is preserved; Form/Identity migrations do not invent semantic provenance.

## Batch verdict

```text
MATERIAL findings: 1
LOCAL findings: 0
complex NO_CHANGE false-pass: 0/32 = 0%
simple sampled NO_CHANGE false-pass: 0/6 = 0%
IDENTITY_RISK verdicts: 0
BLOCKED: 0

new Human semantic delta required: NO
broad semantic reopen required: NO
pre-reconciliation batch result: PASS_WITH_CORRECTIONS
```

The sole finding is a lifecycle-alignment correction inside already-approved BF11 intent.
