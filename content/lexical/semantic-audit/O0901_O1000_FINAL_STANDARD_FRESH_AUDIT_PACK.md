# Lexical Closure Audit — o0901–o1000 Final-Standard Backfill

- **Candidate:** BF09
- **Scope:** `o0901–o1000`
- **Semantic / Final-Learner owner-read head:** `25ab3892ccee0db87042c930a2b44100da3847a4`
- **Latest main at audit close:** `ff7a7024aec67c6a3a492004b4dd62ba56bfb962`
- **Production proposal blob:** `e717db6e37010de28b05a7bedce2148ec8e3101e`
- **Production module matrix blob:** `38b87b74e591b8b4a91a91369e1b338382badc93`
- **Content contract blob:** `e24ee14086ad711469ba56030a71df72e0d4910c`
- **Audit contract blob:** `9fa1dc0491a6b0affa677b0444262b6203d09756`
- **Final semantic freeze blob:** `1803953d7568143a499ed2fb0f12a5a263dd8955`
- **Audit mode:** STRICT
- **Blind-first:** `BLIND_FIRST_NOT_ENFORCED`

## Independence boundary

Kian explicitly requested continuous same-Chat execution. This Chat had already read Production's detailed proposal before auditing the materialized candidate. The audit is valid for semantic, identity, ownership, source-fidelity and test-target defect discovery, but it is **not reviewer-independence evidence**.

## Coverage

The final learner surface was read across the materialized shards covering the complete package.

```text
scope owners: 100/100
Production-affected owners reverse-reviewed: 28/28
complex owners: 86/86
complex NO_CHANGE owners: 58/58
simple NO_CHANGE fast-gated: 14/14
simple NO_CHANGE deep sample: 10/14
simple sample: 908, 912, 927, 937, 954, 968, 970, 972, 981, 997

mandatory Form/identity owners: 4/4
mandatory Relation/confusable owners in scope: 6/6
mandatory secondary-expansion owners: 2/2
family-bearing owners in scope: 15/15
cross-range dependencies explicitly read: oblige@o3298, conform@o1001, commencement@o7737

Repair Test blueprints: 24 -> 15
Repair Test targets resolved: 15/15
Final Learner Objects: 7,946 / 125 shards
BLOCKED: 0
```

The complement↔compliment survivor Relation is reciprocal and its obsolete duplicate Relation has no learner views. compel↔oblige and confirm↔conform Relation ownership is reciprocal. Current-main repair of the former broken complement/compliment and confirm/conform relation projections is preserved rather than reimplemented.

## Findings

### F1 — o0953 `complicate` family projection

**Production operation:** UPGRADE / remove broken family entry  
**Audit verdict:** `REFINE_UPGRADE`  
**Severity:** MATERIAL  
**Risk family:** `FAMILY_OWNER / LEARNER_PROJECTION`

Current canonical data contains an evidence-rich legacy family object, but it does not use the current learner family owner shape. The Final Learner Object therefore renders an empty family asset: blank target and blank lines.

**Bounded correction:** remove the malformed family asset, exactly matching Production's “do not replace with decorative morphology” instruction. Do not invent a new family tree.

### F2 — o0958 `compose` / `be composed of`

**Production operation:** UPGRADE  
**Audit verdict:** `REFINE_UPGRADE`  
**Severity:** MATERIAL  
**Risk family:** `OWNERSHIP_DUPLICATION`

Production correctly promoted `be composed of` to reusable Construction ownership. The materialized candidate retains the old Sense collocation with the same expression, so the learner receives duplicate ownership for one expression.

**Bounded correction:** keep `construction:compose:bf09-composed-of`; retire the old active `be composed of` collocation projection from the Sense.

### F3 — o0974 `conceive` pregnancy branch

**Production operation:** UPGRADE  
**Audit verdict:** `REFINE_UPGRADE`  
**Severity:** LOCAL  
**Risk family:** `STRUCTURE_GAP`

The candidate correctly changed the pregnancy branch to I/T, but the learner pattern `I/T + object` does not explicitly represent the approved distinction: bare intransitive `conceive` vs transitive `conceive a child`.

**Bounded correction:** keep `transitivity = I/T`; set the learner pattern to `vi.; vt. + child`.

### F4 — o0924 `commonwealth`

**Production operation:** UPGRADE  
**Audit verdict:** `REFINE_UPGRADE`  
**Severity:** MATERIAL  
**Risk family:** `SOURCE_FIDELITY / CORE_ACTIVE_MISMATCH`

The proper-name Commonwealth branch is now correctly separated, but the generic active Sense still translates the source definition `a political community or state; a republic` as `共和国；联邦`. That is narrower than the source and promotes “federation” without support from that definition.

**Bounded correction:** align the generic Chinese Sense to `政治共同体；国家（尤指共和国）`. Keep the capitalized Commonwealth secondary branch and Form boundary unchanged.

### F5 — shared target o1001 `conform`

**Production operation:** shared confirm↔conform Relation refreeze  
**Audit verdict:** `REFINE_UPGRADE`  
**Severity:** MATERIAL  
**Risk family:** `SHARED_DEPENDENCY_CORRECTNESS`

The reciprocal Relation is correct, but its shared target owner says `conform to/with sth` while declaring `transitivity = vt`. The syntax is internally inconsistent and makes the shared learning boundary less trustworthy.

**Bounded correction:** set the existing conform Sense to `transitivity = vi` and `governing_pattern = vi. + to/with + sth`. No new Sense or new material scope.

## No-op/current-already-repaired decisions

- compel↔oblige is already reciprocal on current truth;
- complement↔compliment is already coalesced into one reciprocal survivor Relation and the old duplicate has no learner views;
- confirm↔conform already has reciprocal Relation views and Word refs;
- o0953 is **not** considered already repaired because the learner projection proves the family asset is still broken;
- no additional broad family, idiom or phraseology expansion is authorized.

## Batch verdict

```text
MATERIAL findings: 4
LOCAL findings: 1
IDENTITY_RISK verdicts: 0
BLOCKED: 0

new Human semantic delta required: NO
broad semantic reopen required: NO
pre-reconciliation batch result: PASS_WITH_CORRECTIONS
```

All five findings are bounded corrections inside existing BF09/current-truth scope.
