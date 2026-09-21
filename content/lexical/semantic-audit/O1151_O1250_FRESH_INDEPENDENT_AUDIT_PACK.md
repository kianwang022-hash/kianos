# Lexical Closure Audit — o1151–o1250 Pre-Freeze Exception

- **Candidate:** F1151_1250
- **Scope:** `o1151–o1250`
- **Production candidate:** PR #520
- **Semantic owner-read head:** `d3972636a131c3bd495c64bdcff26e3cfdef68b8`
- **Pass-A durable commit / pre-write head:** `b8d6d537fc13069606721922e1d0bc5a1cc1dd3f`
- **Latest main at Pass-B close:** `283a7aa9999cb336ecb219c8f900a1b93ac249db`
- **Production handoff blob:** `86b1286ee9ae32b51baa432233dc0bf1ecab728a`
- **Content contract blob:** `e24ee14086ad711469ba56030a71df72e0d4910c`
- **Audit contract blob:** `9fa1dc0491a6b0affa677b0444262b6203d09756`
- **Risk router blob:** `94fa18d48bf4f42f2d8c51bf15705244efb14c48`
- **Content execution blob:** `f3b312191b386cde925ba6c8deb667aa09ec0d64`
- **Final semantic freeze blob:** `1803953d7568143a499ed2fb0f12a5a263dd8955`
- **Audit mode:** STRICT
- **Fresh-chat independence:** `BLIND_FIRST_NOT_ENFORCED`
- **Production handoff read before Pass-A durable write:** **NO**

## Independence / sequencing boundary

This Chat is not a fresh B Chat and therefore cannot be used as reviewer-independence evidence. Kian explicitly requested continuous same-Chat execution.

However, blind-first sequencing was enforced **inside this audit**:

1. Candidate owners, Final Learner Objects, Relation owners, Repair Tests and dependencies were read first.
2. Provisional judgments were durably written to  
   `content/lexical/semantic-audit/O1151_O1250_PASS_A_PROVISIONAL.md`  
   at commit `b8d6d537fc13069606721922e1d0bc5a1cc1dd3f`.
3. Only after that write was the Production handoff opened.
4. Pass B compared Production with the already-recorded provisional state.

Therefore:
```text
BLIND_FIRST_NOT_ENFORCED = true   # fresh-chat independence criterion
PRODUCTION_HANDOFF_NOT_READ_AT_PASS_A_WRITE = true
```

## Drift boundary

Current main has advanced far beyond PR #520's ancient base. Intersection between current-main changes since that base and the candidate write-set is limited to derived Final Learner assets (`manifest / materialize-trigger / o1153-1216 FLOB shard`).

No candidate Word-owner or Relation-owner semantic file in the o1151–o1250 write-set was changed on current main. The final reconciliation must therefore replay accepted semantic owners onto latest main and rebuild derived Final Learner Objects rather than merge the ancient derived files directly.

## Coverage

```text
scope owners: 100/100
Production UPGRADE owners reverse-reviewed: 24/24
Production NO_CHANGE owners: 76/76
complex owners: 88/88
complex NO_CHANGE owners: 64/64
simple NO_CHANGE owners fast-gated: 12/12
simple NO_CHANGE deep sample: 10/12
simple sample: 1170, 1177, 1180, 1203, 1220, 1222, 1223, 1229, 1240, 1244

Form/identity owners in scope: 7/7
Relation/confusable owners in scope: 11/11
secondary-sense owners in scope: 1/1
family-bearing owners in scope: 8/8

cross-range dependencies explicitly read:
- queue@o3905
- treat@o5116
- candidate regional-spelling targets criticise/criticize and curb/kerb checked against spelling catalog

Repair Test blueprints: 8
Repair Test targets resolved: 8/8
o1168 appears twice intentionally for two exact distinct Relation targets:
  crucial↔important
  crucial↔essential

BLOCKED: 0
```

## Pass-B comparison result

Production's semantic direction was mostly sound. The audit did not find missing new material scope. Findings are concentrated in ownership, reciprocal closure and inherited learner-projection debt.

```text
unique Production UPGRADE owners refined: 7/24 = 29.17%
Production UPGRADE flipped to NO_CHANGE: 0/24
complex NO_CHANGE false-pass: 0/64 = 0%
simple sampled NO_CHANGE false-pass: 0/10 = 0%
candidate-added Relation owners whose ownership type should be retired/migrated: 2/5
IDENTITY_RISK verdicts: 0
BLOCKED: 0
```

## Findings

### F1 — o1161 `criticise / criticize`: regional spelling belongs to Form

**Production:** UPGRADE via new regional-spelling Relation  
**Audit verdict:** `REFINE_UPGRADE`  
**Severity:** MATERIAL  
**Risk:** `FORM_IDENTITY / OWNERSHIP_GAP`

The candidate's spelling boundary is correct, but `criticize` is not a Main Word owner and o1161 already carries the spelling boundary inside a Sense overlay. The Final Learner Object does not expose that overlay as Form and instead exposes a semantic Relation.

**Correction:**
- create/normalize Word-level `record.form_identity` on `criticise`;
- keep the real boundary: usual BrE `criticise`, standard AmE `criticize`, with British -ize usage also accepted;
- retire the candidate learner Relation view;
- do not invent a `criticize` Word owner.

#### F1b — o1161 `criticise → critical` family line

**Audit verdict:** `REFINE_UPGRADE`  
**Severity:** LOCAL  
**Risk:** `FAMILY_SEMANTIC_NOISE`

The learner line `criticise vs critical: 批评 vs 关键的` is misleading because `critical` also has the directly related “批评的/批判的” branch. Remove this decorative/misleading default family projection rather than teach a distorted morphology bridge.

### F2 — o1187 `curb / kerb`: sense-scoped spelling belongs to Form

**Production:** UPGRADE via regional-spelling Relation  
**Audit verdict:** `REFINE_UPGRADE`  
**Severity:** MATERIAL  
**Risk:** `FORM_IDENTITY / SENSE_SCOPED_OWNERSHIP`

The boundary is semantically correct but owner type is wrong. `kerb` is not a Main Word owner. Only the road-edge noun uses BrE `kerb`; verb `curb = restrain/control` does not.

**Correction:**
- own the boundary in Word-level Form/Identity on `curb`, explicitly scoped to the road-edge noun;
- retire the candidate curb↔kerb semantic Relation view;
- preserve the existing Sense overlay;
- do not invent a `kerb` Word owner.

#### F2b — existing curb near-paraphrase target

**Audit verdict:** `REFINE_UPGRADE`  
**Severity:** LOCAL  
**Risk:** `RELATION_TARGET / LEARNER_PROJECTION`

Existing relation `relation:horizontal:c53b2b8403adc7017140` renders as:

`curb ↔ curb ≈ restrain/limit`

Its own source evidence identifies the intended relation targets as `restrain` and `limit`.

**Correction:** preserve the same evidence and sense scope but render the learner target as `restrain / limit`, removing the self-repeating `curb ↔ curb...` target expression.

### F3 — o1178 `cue ↔ queue`: reciprocal owner closure

**Production:** UPGRADE via new homophone Relation  
**Audit verdict:** `REFINE_UPGRADE`  
**Severity:** MATERIAL  
**Risk:** `RELATION_RECIPROCAL / OWNER_CLOSURE`

The content boundary is good. `queue@o3905` is a real Main Word owner, but the relation exists only from cue and queue has no reciprocal `relation_ref`.

**Correction:** preserve the same relation/evidence; add queue-side reciprocal view/ref with source-specific wording.

### F4 — o1188 `cure ↔ treat`: reciprocal owner closure

**Production:** UPGRADE via new semantic contrast  
**Audit verdict:** `REFINE_UPGRADE`  
**Severity:** MATERIAL  
**Risk:** `RELATION_RECIPROCAL / OWNER_CLOSURE`

The intervention-vs-outcome boundary is useful and accurate. `treat@o5116` is a Main Word owner, but the candidate only projects it from cure.

**Correction:** preserve the same relation/evidence; add treat-side reciprocal view/ref with the same treatment-vs-cure distinction.

### F5 — o1232 `deal`: active/secondary duplicate owner

**Production:** UPGRADE  
**Audit verdict:** `REFINE_UPGRADE`  
**Severity:** MATERIAL  
**Risk:** `SECONDARY_ACTIVE_DUPLICATION`

The candidate exposes:
- active Sense `sense:deal:d961db26c0e5522c` = “大量、许多”, pattern `a great deal (of)`;
- Secondary Sense `deep:secondary_senses:deal:1c4f856eb17b836a` = the same learner fact.

**Correction:** keep the active Sense as the learner owner and remove the redundant Secondary projection. Preserve any historical evidence outside the default learner projection.

### F6 — o1230 `deadly → dead` family asset

**Production:** UPGRADE  
**Audit verdict:** `REFINE_UPGRADE`  
**Severity:** LOCAL  
**Risk:** `FAMILY_SEMANTIC_NOISE`

`deadly = dead + ly` is decorative and misleading across the adjective/adverb branches of `deadly`.

**Correction:** remove the default learner family asset. Do not replace it with a larger morphology lesson.

### F7 — o1202 `cut down on / cut back on`: duplicate expression ownership

**Production:** UPGRADE  
**Audit verdict:** `REFINE_UPGRADE`  
**Severity:** LOCAL  
**Risk:** `CONSTRUCTION_COLLOCATION_DUPLICATION`

The reduce Sense owns fixed-pattern collocations `cut down on` and `cut back (on)`, while the same reusable decision is also owned by Construction:

`cut down on sth / cut back on sth`.

**Correction:** keep the reusable Construction owner and retire the redundant fixed-pattern Sense projections, preserving ordinary usage examples and the added injury Sense.

## Findings not escalated

- dam↔damn is reciprocal and clean.
- crisis/crises, criterion/criteria, cupboard pronunciation, curriculum plurals, custom/customs, data/datum agreement and debt silent-b Form assets are coherent.
- the two o1168 Repair Tests are intentionally separate exact diagnostics.
- candidate-added content for cripple, critic, crop, cruise, cunning, cup, dash and dawn is materially coherent.
- queue/cue and cure/treat semantics are accepted; findings concern reciprocal owner closure.
- no o1251+ owner or broader semantic range was inspected or reopened.

## Batch verdict

```text
MATERIAL findings: 5
LOCAL findings: 4
IDENTITY findings: 0
IDENTITY_RISK verdicts: 0
BLOCKED: 0

new Human semantic delta required: NO
broad semantic reopen required: NO
pre-reconciliation batch result: PASS_WITH_CORRECTIONS
```

All findings are narrowing, owner correction, reciprocal closure or learner-noise removal inside the already approved pre-freeze candidate. No second Human Gate is required.
