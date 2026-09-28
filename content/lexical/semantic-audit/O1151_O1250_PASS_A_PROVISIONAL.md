# o1151–o1250 Audit Pass A — Provisional Judgment

- **Candidate:** F1151_1250
- **Scope:** `o1151–o1250`
- **Semantic owner-read head:** `d3972636a131c3bd495c64bdcff26e3cfdef68b8`
- **Audit mode:** STRICT
- **Fresh-chat independence:** `BLIND_FIRST_NOT_ENFORCED`
- **Production handoff read before this file:** **NO**
- **PRODUCTION_HANDOFF_NOT_READ_AT_PASS_A_WRITE:** `true`

This Chat had prior lexical Production context from earlier batches, so this pass is not evidence of fresh-chat reviewer independence. However, the o1151–o1250 Production handoff was deliberately not opened before this Pass-A record. These provisional judgments were formed from the candidate owners, Final Learner Objects, Relation owners, Repair Tests, contracts, and mandatory dependencies only.

## Pass-A coverage

```text
scope owners: 100/100
candidate-mutated Word owners: 24/24
complex owners: 88/88
complex NO_CHANGE owners: 64/64
simple NO_CHANGE owners: 12/12
simple deep sample: 10/12
simple sample: 1170, 1177, 1180, 1203, 1220, 1222, 1223, 1229, 1240, 1244

Form/identity owners in scope: 7
Relation/confusable owners in scope: 11
secondary-sense owners in scope: 1
family-bearing owners in scope: 8

Repair Test blueprints: 8
Repair Test targets resolved: 8/8
duplicate ordinal o1168: intentional two-target diagnostic, not duplicate debt
BLOCKED: 0
```

## Provisional findings

### PA-01 — criticise / criticize ownership

**Provisional verdict:** `REFINE_UPGRADE`  
**Risk:** `FORM_IDENTITY / OWNERSHIP_GAP`

The candidate creates a semantic Relation for a regional spelling variant, but `criticize` is not a Main Word owner and o1161 already carries the correct spelling identity boundary. Provisional desired state: own the BrE/AmE spelling truth as Form/Identity on `criticise`; retire the learner semantic Relation view; do not invent a `criticize` Word owner.

### PA-02 — curb / kerb ownership

**Provisional verdict:** `REFINE_UPGRADE`  
**Risk:** `FORM_IDENTITY / SENSE_SCOPED_OWNERSHIP`

`kerb` is not a Main Word owner. The candidate Relation correctly limits the variant to the road-edge noun, but this is still spelling identity rather than semantic contrast. Provisional desired state: move the sense-conditioned AmE `curb` / BrE `kerb` boundary to Form/Identity on `curb`, retire the learner semantic Relation view, and do not alter verb `curb = restrain/control`.

### PA-03 — cue / queue reciprocal owner closure

**Provisional verdict:** `REFINE_UPGRADE`  
**Risk:** `RELATION_RECIPROCAL / OWNER_CLOSURE`

`queue@o3905` is a Main Word owner. The candidate relation has only the `cue` view and queue has no reciprocal relation_ref. Preserve the relation and evidence; add the reciprocal queue view/ref.

### PA-04 — cure / treat reciprocal owner closure

**Provisional verdict:** `REFINE_UPGRADE`  
**Risk:** `RELATION_RECIPROCAL / OWNER_CLOSURE`

`treat@o5116` is a Main Word owner. The useful treatment-vs-cure contrast is only projected from `cure`. Preserve the same relation/evidence and add reciprocal treat view/ref.

### PA-05 — curb near-paraphrase learner target

**Provisional verdict:** `FLIP_TO_UPGRADE`  
**Risk:** `RELATION_TARGET / LEARNER_PROJECTION`

Existing relation `relation:horizontal:c53b2b8403adc7017140` renders as `curb ↔ curb ≈ restrain/limit`. Its source evidence says the actual targets are `restrain` and `limit`. Provisional desired state: keep the same evidence and sense scope, but make the learner target/title `restrain / limit`, not a self-repeating `curb ↔ curb...` expression.

### PA-06 — deal duplicate learner ownership

**Provisional verdict:** `FLIP_TO_UPGRADE`  
**Risk:** `SECONDARY_ACTIVE_DUPLICATION / OWNERSHIP_GAP`

o1232 exposes `a great deal (of) = a large amount` both as an active Sense and as a Secondary Sense. Keep one learner owner; provisional preference is the active Sense and retirement/removal of the redundant Secondary projection.

### PA-07 — criticise → critical family asset

**Provisional verdict:** `REFINE_UPGRADE`  
**Risk:** `FAMILY_SEMANTIC_NOISE`

The learner line `criticise vs critical: 批评 vs 关键的` is not a reliable morphology bridge because `critical` also has the directly related “批评的” meaning. Provisional desired state: remove this decorative/misleading default family asset rather than teach a distorted relation.

### PA-08 — deadly → dead family asset

**Provisional verdict:** `FLIP_TO_UPGRADE`  
**Risk:** `FAMILY_SEMANTIC_NOISE`

The line `deadly = dead + ly` is low-value and misleading across adjective/adverb branches. Provisional desired state: remove the decorative family projection; do not invent a new family lesson.

### PA-09 — cut reusable Construction duplication

**Provisional verdict:** `REFINE_UPGRADE`  
**Risk:** `CONSTRUCTION_COLLOCATION_DUPLICATION`

o1202 has `cut down on` and `cut back (on)` as fixed-pattern Sense collocations while also owning the reusable Construction `cut down on sth / cut back on sth`. Provisional desired state: keep one reusable Construction owner and retire redundant fixed-pattern projections if no presentation-merge contract already resolves them.

## Pass-A non-findings / provisional PASS

- crisis, criterion, cupboard, curriculum, custom/data/debt Form identities appear coherent.
- dam↔damn is reciprocal and clean.
- the two o1168 Repair Tests are distinct exact relation targets and are not duplicate Test debt.
- cue↔queue and cure↔treat content boundaries are useful; the provisional issue is reciprocal owner closure, not semantic validity.
- no broad semantic reopening beyond the pre-freeze candidate is warranted.

## Boundary

This file is a pre-handoff audit artifact only. It does not authorize mutation. Pass B may confirm, narrow, or overturn these provisional judgments after comparing with the frozen Production handoff.
