# Lexical Closure Audit — o0701–o0800 Final-Standard Backfill

- **Candidate:** BF07
- **Scope:** `o0701–o0800`
- **Semantic / Final-Learner owner-read head:** `103a5dfad94a1555f2305d4980ae23ba5c0f76de`
- **Latest main at audit close:** `4e4ab94638f168efd411375b01519091f9c433d5`
- **Production proposal:** `content/lexical/execution/manifests/o0701-o0800.final-semantic-sweep-c-proposal.md`
- **Production proposal blob:** `aba3893ef97a18d6ce3385fad1d94796f6e3406d`
- **Production module matrix blob:** `5a7d74e2a6a15f8bb8af31d220b3bd397a49b444`
- **Content contract blob:** `e24ee14086ad711469ba56030a71df72e0d4910c`
- **Audit contract blob:** `9fa1dc0491a6b0affa677b0444262b6203d09756`
- **Audit mode:** STRICT
- **Blind-first:** `BLIND_FIRST_NOT_ENFORCED`

## Independence boundary

Kian explicitly requested continuous same-Chat execution. This Chat had already read Production's detailed proposal before auditing the materialized candidate. Therefore this audit is valid for semantic/identity defect discovery and bounded reconciliation, but **must not be used as reviewer-independence evidence or to relax future audit density**.

The frozen calibration lessons remain unchanged: capacity = production-string correction, cast = familiar missing ordinary branch sentinel, cat = over-cleanup boundary, class↔classify = reciprocal anchor, China/china = lexical identity, close = pronunciation/Form ownership, cassette = true-simple PASS, claim = rich NO_CHANGE PASS.

## Coverage

The final learner surface was read across the three materialized shards spanning the full package, giving **100/100 owner coverage**. Production-affected owners and shared dependencies were reverse-reviewed against the frozen proposal; all 22 retained Repair Test targets were resolved against the materialized candidate.

Manual strict risk routing used a lower bound of:
`MULTI_SENSE / CONSTRUCTION / SECONDARY / CONFUSABLE / RELATION / FORM / FAMILY / LINEAGE`.
Model review could escalate but did not downgrade below that floor.

```text
scope owners: 100/100
production UPGRADE reverse-reviewed: 34/34
mandatory Form/identity cases reviewed: 10/10
mandatory Relation/confusable cases reviewed: 5/5
complex NO_CHANGE reviewed: 58/58
simple NO_CHANGE fast-gated: 8/8
simple NO_CHANGE deep-sampled: 8/8
simple deep sample: 705, 721, 730, 734, 735, 736, 738, 789
unique mandatory owners reviewed: 92/92

complex NO_CHANGE false-pass: 1/58 = 1.72%
simple sampled NO_CHANGE false-pass: 0/8 = 0%
UPGRADE flipped to NO_CHANGE: 0/34 = 0%
UPGRADE refined: 3/34 = 8.82%
IDENTITY_RISK verdicts: 0
BLOCKED: 0

Repair Test blueprints: 37 -> 22
Repair Test targets resolved: 22/22
Final Learner Objects: 7,946
```

### Expansion trigger

Three Production changes reused existing collocation/example IDs while materially changing the learner expression. The stable-collocation-identity risk family therefore crossed the frozen `>=2` trigger and was expanded to **100% of BF07 expression-changing collocation edits**. All such edits in the BF07 write-set were reviewed: `cement`, `choice`, and `chorus`. All three require bounded correction below.

## Findings

### F1 — o0787 `childhood → child`

**Production operation:** NO_CHANGE on o0787, while o0786 explicitly promised reciprocal child↔childhood family cleanup  
**Audit verdict:** `FLIP_TO_UPGRADE`  
**Severity:** MATERIAL  
**Risk family:** `FAMILY_RECIPROCAL / PRODUCTIVE_VALUE_GAP`

The materialized `child` side correctly says:

`child → childhood = the period/state of being a child`

but the reciprocal `childhood` owner still contains only the old tautological note `child（名词）`.

**Bounded correction:** update the existing childhood→child family object to the same useful reciprocal boundary. No new family edge or learner scope is introduced.

### F2 — o0729 `cement A to B`

**Production operation:** UPGRADE  
**Audit verdict:** `REFINE_UPGRADE`  
**Severity:** IDENTITY  
**Risk family:** `COLLOCATION_STABLE_IDENTITY`

The semantic correction from malformed `vi. + to` to transitive `cement A to B` is correct. The materialization, however, rewrote the text of the pre-existing collocation ID in place. That makes an old stable collocation identity represent a newly corrected structural object.

**Bounded correction:** retire the old active malformed collocation projection, keep the corrected transitive Sense pattern, and represent `cement A to B` as a stable Word-owned Construction. The underlying Sense identity remains unchanged.

### F3 — o0794 `choice`

**Production operation:** UPGRADE  
**Audit verdict:** `REFINE_UPGRADE`  
**Severity:** IDENTITY  
**Risk family:** `COLLOCATION_STABLE_IDENTITY`

Production correctly rejected the misleading learner example `choice words = 精辟的言辞` and wanted a true high-quality adjective example such as `choice cuts/ingredients`. The candidate reused the old `choice words` collocation ID and changed its expression to `choice cuts`.

**Bounded correction:** remove that old collocation from active learner projection and preserve the corrected adjective Sense with a non-identity-bearing usage note such as `choice cuts / choice ingredients`. Do not repurpose the old collocation ID.

### F4 — o0799 `chorus`

**Production operation:** UPGRADE  
**Audit verdict:** `REFINE_UPGRADE`  
**Severity:** IDENTITY  
**Risk family:** `COLLOCATION_STABLE_IDENTITY`

The corrected verb model — “say/sing the same words together”, with objects such as an answer/words/quotation — is semantically correct. The candidate changed the old usage-example ID from `chorus a song` to a new example.

**Bounded correction:** retire the old active example projection, keep the corrected verb definition + governing pattern, and express the natural answer/words/quotation guidance as a usage note rather than reusing the old collocation ID.

## Reverse-review conclusions

The approved new scope for `cast, casualty, catch, cell, charge, Cheers!, chef, child, chip, choir, choose` remains justified under the frozen final ruler.

Shared Relation closure is semantically coherent and reciprocal for:
- cause ↔ get;
- cause ↔ reason;
- cent ↔ scent;
- certain ↔ sure.

The existing cheque ↔ check Relation remains correctly reciprocal and sense-scoped to the bank-payment meaning only.

The catalog/catalogue spelling truth is correctly owned as Form/Identity on catalog. The old Relation object is no longer learner-referenced and does not create a second learner-visible semantic owner.

No new material delta, broad catalog reopening, or new Human Gate is required.

## Batch verdict

```text
LOCAL findings: 0
MATERIAL findings: 1
IDENTITY findings: 3
IDENTITY_RISK verdicts: 0
BLOCKED: 0

new Human semantic delta required: NO
broad semantic reopen required: NO
pre-reconciliation batch result: PASS_WITH_CORRECTIONS
```

All four findings are within already-approved BF07 learner intent and may be reconciled directly.
