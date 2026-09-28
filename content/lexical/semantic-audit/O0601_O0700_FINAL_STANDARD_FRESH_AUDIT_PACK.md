# Lexical Closure Audit — o0601–o0700 Final-Standard Backfill

- **Candidate:** BF06
- **Scope:** `o0601–o0700`
- **Semantic owner-read head:** `2511549e64347e1ea83601544ac2607dfb593867`
- **Latest main at audit:** `1d319e9d75b51a4cca3e752da94a676f1235ff78`
- **Production proposal:** `content/lexical/execution/manifests/o0601-o0700.final-sweep-a-proposal.md`
- **Production proposal blob:** `ed48bb4c82f42c3054e20875a8e9be0e78707b15`
- **Content contract blob:** `e24ee14086ad711469ba56030a71df72e0d4910c`
- **Audit contract blob:** `9fa1dc0491a6b0affa677b0444262b6203d09756`
- **Audit mode:** STRICT
- **Blind-first:** `BLIND_FIRST_NOT_ENFORCED`

## Independence boundary

This audit was performed in the same Chat that had already read the Production proposal because Kian explicitly asked to continue in-place rather than open a fresh B Chat. The findings are valid semantic/ownership corrections, but this batch is **not** evidence for reviewer-independence or future audit relaxation.

Calibration lessons were rechecked and preserved: capacity = production-string repair; cast = familiar missing sense; cat = over-cleanup boundary; class↔classify = reciprocal anchor; China/china = lexical identity; close = pronunciation/Form truth; cassette = true-simple PASS; claim = rich NO_CHANGE PASS.

## Coverage

A strict full-scope semantic skeleton read was performed for all 100 owners before closure.

Objective routing lower bound used for this audit (manual strict surrogate; no machine router claim):
`MULTI_ACTIVE_SENSE / MULTI_POS / HAS_CONSTRUCTION / HAS_RELATION_REF / HAS_REFERENCE_OR_DEPRECATED_IDENTITY / FORM_IDENTITY / HAS_WORD_FAMILY / PRODUCTION_PATTERN`.

```text
scope owners: 100/100
production UPGRADE reverse-reviewed: 14/14
mandatory Form/identity cases reviewed: 6/6
mandatory Relation-ref cases reviewed: 5/5
complex NO_CHANGE reviewed: 73/73
simple NO_CHANGE fast-gated: 13/13
simple NO_CHANGE deep-sampled: 10/13
simple deep sample: 601, 627, 645, 649, 650, 658, 660, 663, 685, 692
unique mandatory owners reviewed: 87/87

complex NO_CHANGE false-pass: 2/73 = 2.74%
simple sampled NO_CHANGE false-pass: 0/10 = 0%
UPGRADE flipped to NO_CHANGE: 1/14 = 7.14%
UPGRADE refined: 2/14 = 14.29%
IDENTITY_RISK verdicts: 0
BLOCKED: 0
```

### Expansion trigger

The Core↔active/reference risk family reached **2 confirmed errors** (`bully`, `cart`), which triggers 100% review for that family under the frozen contract. That expansion is already satisfied: Core + active/reference semantic skeletons were read for all 100 owners.

Repair Test closure was also read back:
- standing blueprints: **43 → 18**;
- all 18 target IDs/locators resolve to current candidate owners;
- no duplicate target failure found;
- no new standing Test exists merely because new Content was admitted.

## Findings

### F1 — o0620 `bully`

**Production verdict:** NO_CHANGE  
**Audit verdict:** `FLIP_TO_UPGRADE`  
**Severity:** MATERIAL  
**Risk family:** `CORE_ACTIVE_MISMATCH / PRODUCTION_PATTERN`

Current Core still advertises deprecated adjective/adverb branches (“excellent; first-rate” and “very; extremely”) even though those identities are Reference-only and have no active Sense IDs. The learner-facing Construction also remains malformed as `bully + sb into + doing sth`.

**Bounded correction:**
- remove deprecated adjective/adverb material from Core/Decision;
- preserve noun + verb learner truth;
- normalize the Construction to `bully sb into doing sth`.

No new semantic scope is introduced.

### F2 — o0648 `cable`

**Production verdict:** UPGRADE  
**Audit verdict:** `REFINE_UPGRADE`  
**Severity:** MATERIAL  
**Risk family:** `CORE_REFERENCE_LEAK / SENSE_ATTACHMENT`

Production correctly moved telegraph-era branches to Reference, but the Core cluster still says “telegram sent abroad”. In addition, `cable TV/cable television` and `data/power cable` are attached to the strong-rope Sense rather than the electrical/signal-cable Sense.

**Bounded correction:**
- remove telegram-era wording from Core;
- keep telegraph meanings Reference-only;
- attach modern signal/data/TV phraseology to the electrical/signal cable branch;
- keep the strong-rope Sense separate.

No new Sense is required.

### F3 — o0699 `cart`

**Production verdict:** NO_CHANGE  
**Audit verdict:** `FLIP_TO_UPGRADE`  
**Severity:** MATERIAL  
**Risk family:** `CORE_ACTIVE_MISMATCH`

The active noun Sense has already been modernized to “small wheeled trolley, especially a shopping cart; formerly a vehicle for carrying goods”, but Core still defines cart as a two-wheeled animal-drawn wagon. Core therefore misrepresents the current active learner branch.

**Bounded correction:** align Core/Decision with the active modern cart/shopping-cart meaning while retaining the older goods-cart reading as historical/secondary context inside the same Sense.

No new semantic scope is introduced.

### F4 — o0628 `burn`

**Production verdict:** UPGRADE  
**Audit verdict:** `REFINE_UPGRADE`  
**Severity:** LOCAL  
**Risk family:** `LEARNER_FIELD_LANGUAGE`

The accepted Construction `be burned/burnt out` has English explanatory prose inside `meaning_cn`.

**Bounded correction:** set Chinese learner meaning to “因过劳或压力而精疲力竭；职业倦怠” while preserving the English semantic definition and Form truth.

### F5 — o0674 `canvas ↔ canvass`

**Production verdict:** UPGRADE  
**Audit verdict:** `FLIP_TO_NO_CHANGE`  
**Severity:** IDENTITY  
**Risk family:** `RELATION_OWNER_BOUNDARY`

Production proposed making the existing confusable Relation reciprocal “from the canvass side”. Current catalog lookup proves `canvass` is **not** a Main Word owner in the 7,946-owner catalog. Creating a reciprocal Word view would therefore invent a non-existent canonical owner.

**Resolution:** preserve the existing source-side `canvas → canvass` confusable Relation and its Repair Test. Do not synthesize a reciprocal Word owner/view. This narrows Production intent; it does not delete the useful confusable boundary.

## Findings not escalated

The audit did **not** reopen true-but-low-leverage material merely because it could be pruned further. In particular, rare but internally coherent branches such as cabin/buffet/butterfly variants were not treated as defects absent a concrete Core/identity/production failure.

The approved BF06 additions for `build, burst, buy, call, cancel, capital, carry` remain semantically justified after reverse-review. The `by↔buy` and `campaign↔effort` Relation closures are reciprocal and correctly anchored on the candidate.

## Batch verdict

```text
LOCAL findings: 1
MATERIAL findings: 3
IDENTITY findings: 1
IDENTITY_RISK verdicts: 0
BLOCKED: 0

new Human semantic delta required: NO
broad semantic reopen required: NO
pre-reconciliation batch result: PASS_WITH_CORRECTIONS
```

All required corrections are narrowing, alignment, or already-approved-intent repairs. They may be reconciled without a new Human Gate.
