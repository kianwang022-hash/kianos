# Lexical Independent Semantic Audit — o0101–o0200 Final-Standard Backfill

- **Status:** HOLD_FOR_SOL
- **Scope:** `o0101–o0200` — 100 Word owners
- **Candidate branch:** `work/lexical-continuous-bf01-20260920`
- **Candidate PR:** #618
- **Audit brief:** `content/lexical/semantic-audit/O0101_O0200_FINAL_STANDARD_FRESH_AUDIT_BRIEF.md`
- **Approved Production proposal:** `content/lexical/execution/manifests/o0101-o0200.final-standard-backfill-proposal.md`
- **Materialized owner-read head:** `2652aa1ae8172a7904d315d45f74ce6a90e20dee`
- **Candidate pre-write HEAD:** `beb4a0719104b0eee4081fb2591556e14cd578b3`
- **main@pre-write drift-check HEAD:** `92669332de57e550a69c63f2b52bf437a242bae1`
- **Content contract blob SHA:** `e24ee14086ad711469ba56030a71df72e0d4910c`
- **Audit contract blob SHA:** `9fa1dc0491a6b0affa677b0444262b6203d09756`
- **Router spec blob SHA / version:** `94fa18d48bf4f42f2d8c51bf15705244efb14c48` / `1.0.0`
- **Production proposal blob SHA:** `4d83a7b22341a56a7b577b6861843a307a33b246`
- **Audit brief blob SHA:** `413cc625b3ceabd71985d3505d65d97a9b7ab8a4`
- **Final Learner manifest blob SHA:** `2225e36d2e97102eb017b700105554c969c55a83`
- **Repair blueprint shard SHAs:** `7ab91d0aa986908513539f1c23087702d93eebf0`, `bf035f6df1b9fd2e9b7ec75f393c9e8d62011089`
- **Calibration:** PASS
- **Blind-first:** ENFORCED
- **Audit mode:** STRICT

## Method

Pass A was completed before Production's detailed proposal was opened.

The auditor first locked the final semantic/audit contracts and the frozen candidate owner-read head, then read the full `o0101–o0200` owner scope owner-first, plus the shared target Word owners, changed Relation owners, Form boundaries, Repair blueprints and Final Learner projections required by the BF01 brief.

Only after the provisional owner-based judgments were fixed was the Production proposal opened from its frozen proposal commit.

The detailed proposal file is not present on the BF01 candidate branch itself; it was recovered from its frozen proposal commit `bfb959126bc12f98861081114ee5fbe032d0c541`. This did not contaminate Pass A because that file was opened only after the owner-first judgment was frozen.

The frozen calibration ruler was reproduced successfully:

- `capacity`: malformed complement pattern must flip;
- `cast`: an ordinary missing sense must flip;
- `cat`: low/reference does not mean blanket delete;
- `class ↔ classify`: reciprocal Relation closure remains mandatory;
- `China / china`: capitalization identity is lexical identity;
- `close`: pronunciation belongs to Form rather than fake semantic split;
- `cassette`: a true simple word may PASS;
- `claim`: rich content may still PASS when already sufficient.

No canonical semantic truth was mutated by the Audit lane.

## Coverage

```text
scope owners read owner-first: 100/100
Production changed in-range Word owners reverse-reviewed: 35/35
shared out-of-range Word owners reviewed: 4/4
changed/created Relation owners reviewed: 6/6
explicit Form additions reviewed: 6/6
high-leverage family additions reviewed: 8/8
new phraseology "then again" reviewed: 1/1
Repair Test blueprint final set reviewed: 25/25
Final Learner readback for all 35 changed + 4 shared targets: 39/39
Final Learner object count: 7,946
semantic BLOCKED owners: 0
```

All remaining owners in `o0101–o0200` were also owner-read under the final ruler. No second broad semantic standard was introduced.

## Confirmed Production passes

The major Production direction is correct and should be preserved:

- fake/pseudo Constructions were removed instead of being kept for completeness;
- low-value specialist truth remains Reference rather than default Study;
- approved Form additions for `affiliate`, `aggregate`, `aircraft`, `alloy`, `ally`, and `analysis` are useful bounded Expansion;
- family additions such as `affluence`, `alignment`, `allegation`, `allocation`, `ambiguity`, `amendment`, `analogous`, and `anecdotal` are bounded and not Core inflation;
- `among ↔ between` correctly rejects the false “2 vs 3+” rule;
- `amount ↔ number`, `analog ↔ digital`, and `analytic ↔ analytical` are useful cross-word decision boundaries;
- Repair Test debt reduction from 48 to 25 is directionally correct and does not delete canonical Content.

## Delta-only findings

All audited targets not listed below are PASS for this audit generation.

### 1. o1378 digital — stable sense identity continuity

```text
target: shared Word owner digital@o1378
audit verdict: IDENTITY_RISK
risk_family: identity_lifecycle
severity: IDENTITY
```

The earlier semantic authority for `o1375–o1624` explicitly required reactivating/reusing the modern digital-technology adjective stable branch.

However, the historical identity readback classified `o1378` as `NEW_SEMANTIC_BRANCH` and created:

`sense:digital:e568a7d463e082ac`

while the prior stable digital-technology branch remains deprecated:

`sense:digital:6f6682405b4b522c`.

Desired state:

- preserve the learner-visible digital-technology adjective;
- reconcile it onto the lawful stable semantic lineage;
- update Core/active-sense/FLOB references consistently;
- retire the replacement branch by explicit lineage rather than inventing another sense.

### 2. alter ↔ alert — false homophony metadata

```text
target: deep:confusables:alter:ec2b2a5d2e1f3a7b
audit verdict: REFINE_UPGRADE
risk_family: relation_metadata
severity: LOCAL
```

The reciprocal Relation's learner boundary is correct, but its fact metadata contains `same_normalized_pronunciation: true` while the stored source/target phonetic values are visibly different.

Desired state:

- preserve the reciprocal confusable Relation;
- correct the false same-pronunciation metadata;
- do not change the useful learner-facing semantic boundary.

### 3. o0102 affiliate Repair blueprint — one test mixes two diagnostic jobs

```text
target: repair-blueprint:o0102:affiliate:v1
audit verdict: REFINE_UPGRADE
risk_family: testability_targeting
severity: LOCAL
```

The blueprint target is the construction `be affiliated with/to ...`, but its diagnostic intent also requires the learner to know the noun branch `affiliate = 附属机构/成员`.

That violates the frozen rule that one blueprint answers one diagnostic question.

Desired state:

- keep the blueprint focused on producing/discriminating `be affiliated with/to ...`;
- leave noun `affiliate` as canonical Content without bundling it into the same Repair diagnostic;
- do not add a second standing blueprint absent learner evidence.

### False positives explicitly cleared before reconciliation

Two provisional concerns were rechecked against the real builder and are **not defects**:

- `o0111 again / then again`: the Final Learner Object already contains `then again` as a fixed-pattern usage with a Repair locator.
- `o0164 alternate`: the FLOB builder intentionally emits an empty top-level form `boundary` when detailed pronunciation `variants` are present; the variants and POS-conditioned IPA are intact.

## Rates

```text
changed/shared semantic targets PASS without correction: 36/39
confirmed audit findings: 3
LOCAL findings: 2
MATERIAL findings: 0
IDENTITY findings: 1
BLOCKED: 0
Production broad semantic re-open required: NO
new Human semantic delta required: NO
```

The single identity finding is bounded to `digital`; it does not justify reopening BF01 or any wider range.

## Drift closure

Between the frozen owner-read head and the pre-write `main` drift check, the only changed `content/lexical/**` file is:

`content/lexical/execution/three-chat-board.json`.

No BF01 Word owner, shared target Word owner, Relation owner, Repair blueprint shard, Final Learner shard, or semantic/audit contract changed on main during this audit window.

Therefore the findings remain valid without restarting Pass A.

## Final result

- Blind-first: **ENFORCED**
- Canonical drift in audited semantic targets: **none**
- Repair Test shrink 48→25: **PASS WITH ONE LOCAL BLUEPRINT REFINEMENT**
- Final Learner materialization: **PASS**
- Unresolved stable identity risk: **1 — digital**
- Broad semantic standard change: **none**
- Final batch result: **HOLD_FOR_SOL**

This Audit Pack authorizes no mechanical guess on `digital` identity and does not itself reconcile or merge the candidate. All other findings are bounded corrections within already-approved learner intent.
