# Lexical Closure Audit — o0401–o0500 Final-Standard Backfill

- **Candidate:** BF04
- **Scope:** `o0401–o0500`
- **Candidate readback head:** `5398f4cd7bc46582bd556199e6d1564d8acbd90b`
- **Frontier base:** `8268f595387a855d2fe048bb3245f121a1754446`
- **Latest main drift-check head:** `cf59a2268bbf4c2542764242913a753c391e2996`
- **Production proposal:** `content/lexical/execution/manifests/o0401-o0500.final-sweep-a-proposal.md`
- **Audit mode:** STRICT
- **Blind-first:** BLIND_FIRST_NOT_ENFORCED

## Coverage

```text
frozen Production owner coverage: 100/100
bounded corrections: 18
approved Expansion/Form assets: 8
unique changed in-range owners: 24
shared external Word owners: 4
shared Relation closures: 5
retired weak generic Relations: 3
Repair Test blueprints: 43 -> 22
Final Learner Objects: 7,946
Final Learner shards: 125
BLOCKED: 0
```

## Materialized result

Confirmed:

- bar Core now predicts bar/rod, pub/bar, barrier, and prohibit branches;
- barren noun branch is Reference-only;
- base has the approved chemistry noun Sense;
- basement weak family depth is removed;
- basis owns basis→bases Form/pronunciation identity;
- bathroom↔toilet, believe↔think, beside↔besides, bias↔prejudice are reciprocal;
- bearing low-leverage endurance/childbearing branches are Reference-only;
- beef cattle-raising/slaughtering branch is Reference-only;
- bear, beat, become, begin, behavior/behaviour, bend, bind and bite own the approved Form truth;
- begin and bill use stable learner Constructions rather than raw pseudo-structures;
- beneficial→beneficiary generic family depth is removed;
- besides↔also/too/likewise weak generic Relations are retired;
- between pseudo-Construction is coalesced into the existing among↔between Relation;
- billion long-scale 10^12 material is explicitly historical/obsolete Reference truth;
- bind's bound-to/bound-by model now allows inevitability and context-dependent obligation;
- Test debt contracts from 43 to 22 without creating new standing Tests merely because Content was admitted.

## Closure-audit findings

### 1. prejudice reciprocal display target

**Severity:** LOCAL  
**Risk family:** relation_projection

The reciprocal bias↔prejudice view initially inherited stale display metadata and rendered as `prejudice ↔ prejudice`.

**Correction:** explicitly set the reciprocal target/display expression to `bias`.

**Readback:** PASS — FLOB now renders `prejudice ↔ bias`.

### 2. bearing Core after Reference demotion

**Severity:** LOCAL  
**Risk family:** layer_projection

The two low-leverage bearing branches were correctly moved to Reference, but Core wording still told the learner to expect endurance/childbearing.

**Correction:** align Core summary/decision clusters to only relevance/effect, direction, demeanor and mechanical bearing.

**Readback:** PASS — Final Learner Object contains only the four active default Study branches and matching Core wording.

### 3. believe Repair blueprint target

**Severity:** LOCAL  
**Risk family:** testability_targeting

The standing `believe` blueprint diagnoses one combined decision across `believe in`, `believe (that)`, and `believe sb/sth to be`, but still targeted only the first Construction.

**Correction:** retarget the blueprint to `record.core_concept`, preserving the same one-question decision model across the three already-owned structures.

**Readback:** PASS — the blueprint now maps to the complete decision model it actually tests.

### 4. reciprocal Relation learner-line cleanup

**Severity:** LOCAL  
**Risk family:** relation_projection

Reciprocal views for `bathroom↔toilet`, `believe↔think`, and `bias↔prejudice` inherited generic/shared source text. On the reverse side this could render a second, redundant or directionally stale learner line.

**Correction:** keep the accepted Relation boundaries unchanged, but normalize view-local learner metadata; for `prejudice↔bias`, align the reciprocal member/evidence/note metadata to the prejudice source direction.

**Readback:** PASS — each affected Final Learner Object now renders one precise learner line.

### Post-merge sequencing note

Integration PR **#676** merged the main BF04 batch before findings 3–4 were added. Those two local corrections are therefore carried by the bounded post-merge follow-up branch `work/lexical-continuous-bf04-postmerge-20260921`; they do not reopen BF04 Production or alter its semantic scope.

## Repair Test closure

Final standing set: **22**.

First half:
`bargain, base, bathe, bay, bear, bearing, beef, beg, behalf, behave`

Second half:
`believe, bell, belong, beneficial, benefit, beside, between, bias, bid, bill, bind, bit`

Key retargets:

- bear → exact `bear → bore → borne/born` Form decision;
- bearing → exact `have a bearing on sth` Construction;
- between → among↔between shared Relation;
- bias → bias↔prejudice shared Relation;
- bind → corrected `bound to / bound by` Construction;
- bill → whole structure decision rather than a stale single-construction target.

## Drift closure

Between BF04 frontier base and current main, no `content/lexical/**` file changed.

No candidate semantic refreeze is required.

## Final result

```text
LOCAL findings: 4
MATERIAL findings: 0
IDENTITY findings: 0
unresolved findings: 0
new Human semantic delta required: NO
broad semantic reopen: NO
Final Learner closure: 7,946 / 125 shards
Repair Test closure: 22
```

**Final batch result: PASS_WITH_CORRECTIONS**

All four local corrections are materialized and read back; findings 3–4 are carried by the bounded post-merge follow-up. BF04 is ready for bounded reconciliation and merge.
