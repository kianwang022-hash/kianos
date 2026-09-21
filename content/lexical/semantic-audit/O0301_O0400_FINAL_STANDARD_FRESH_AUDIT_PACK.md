# Lexical Closure Audit — o0301–o0400 Final-Standard Backfill

- **Candidate:** BF03
- **Scope:** `o0301–o0400`
- **Candidate readback head:** `961b41c616cae13143c1dc1ac20c98d55718fe87`
- **Current main:** `949bda3ad8d88c7e91d34a84f1d9a470b058f832`
- **Production proposal:** `content/lexical/execution/manifests/o0301-o0400.final-sweep-a-proposal.md`
- **Audit mode:** STRICT
- **Blind-first:** BLIND_FIRST_NOT_ENFORCED
- **Reason:** same Chat performed materialization and closure audit under Kian's sequential batch-landing instruction.

## Coverage

```text
frozen Production owner coverage: 100/100
bounded corrections: 16
approved Expansion assets: 6
unique changed in-range owners: 21
shared external Word owners: 6
shared Relation closures: 5
Repair Test blueprints: 20 -> 10
Final Learner Objects: 7,946
Final Learner shards: 125
BLOCKED: 0
```

## Materialized result

The frozen proposal was preserved without broad semantic reopening.

Confirmed:

- assimilate biological absorption branch corrected;
- associate weak non-reciprocal relation retired while Form/constructions remain;
- assure / ensure / insure consolidated to one reciprocal three-way usage boundary;
- attack / assault, attribute / ascribe, aural / oral, award / grant are reciprocal;
- attempt has stable `attempt to do sth / attempt sth` Construction;
- attribute→attribution, authentic→authenticity, autonomy→autonomous, bankrupt→bankruptcy expansions materialize;
- audit-course lineage is reference-only; duplicate audit verb merges only to active verb;
- auditorium ordinary hall meaning is restored;
- autumn definition is season-based rather than leaf-fall-defined;
- awful formal/reverential branch is reference-only;
- ax/axe, axis/axes, bacterium/bacteria are owned by Form/identity;
- bait has stable `bait sb into doing sth` Construction;
- bake hot/sun branch is reference-only and not merged into oven cooking;
- ballot historical verb branches no longer merge into noun ballot-paper sense.

## Closure-audit findings

### 1. ensure duplicate projection

**Severity:** LOCAL  
**Risk family:** relation_projection

The new assure/ensure/insure Relation was correct, but `ensure.record.semantic_neighbors` still embedded the old assure relation, so FLOB displayed both old and new boundaries.

**Correction:** clear stale embedded semantic neighbor and retain only the new reciprocal Relation via `relation_refs`.

**Readback:** PASS — ensure now shows exactly one consolidated assure/ensure/insure Relation.

### 2. assault reciprocal payload

**Severity:** LOCAL  
**Risk family:** relation_projection

The reciprocal attack↔assault view inherited a source-specific `shared_definition` string that was not actually shared by assault.

**Correction:** remove the stale shared-definition field from both Relation views while preserving the accepted boundary.

**Readback:** PASS — assault now shows only the valid attack/assault distinction.

### 3. assure/ensure runtime relation projection

**Severity:** LOCAL  
**Risk family:** runtime_projection_contract

The consolidated three-way Relation was semantically correct, but the first projection used combination targets and the `confusables` owner field. Current runtime representative hydration expects the assure↔ensure boundary under `reference.relations`, with primary reciprocal targets `assure → ensure` and `ensure → assure`.

**Correction:** keep one three-view assure/ensure/insure Relation and all three usage boundaries, but own it through `semantic_neighbors`; expose `ensure` as assure's primary target and `assure` as ensure's primary target. Insure remains a third participant in the same Relation.

**Readback:** PASS — FLOB now exposes `assure ↔ ensure` / `ensure ↔ assure` under `reference.relations`, while retaining insure structure and guidance in the same Relation.

## Repair Test closure

Final standing set: **10**.

`assign, associate, assure, attach, attempt, attend, attention, attribute, august, aural`

Key retargets:

- assign → complete argument-structure decision model;
- assure → reciprocal assure/ensure/insure Relation;
- attempt → stable final-standard Construction;
- attend → exact `attend to sb/sth` Construction.

No Test shard is created for o0351–o0400 merely to fill a gap.

## Drift closure

Current main equals the BF03 frontier base:

`949bda3ad8d88c7e91d34a84f1d9a470b058f832`

No Lexical drift exists.

## Final result

```text
LOCAL findings: 3
MATERIAL findings: 0
IDENTITY findings: 0
unresolved findings: 0
new Human semantic delta required: NO
broad semantic reopen: NO
Final Learner closure: 7,946 / 125 shards
Repair Test closure: 10
```

**Final batch result: PASS_WITH_CORRECTIONS**

All three local corrections are already materialized and read back. BF03 is ready for bounded reconciliation and merge.
