# LexicalOS Independent Semantic Audit Contract

Status: **canonical audit-governance contract**  
Current audit mode: **STRICT**

Semantic quality authority: `CONTENT_ASSET_CONTRACT.md`  
Learning authority: `LEARNING_CONTRACT.md`  
Execution/transport authority: `CONTENT_EXECUTION.md`  
Scope/cursor authority: `CURRENT.md`

This contract freezes **how deeply each lexical owner must be independently audited**. It does not create a second semantic standard.

> **Batch size may change. Audit density may not drift with the Chat, model, batch size, or reviewer preference.**

The target is that all 7,946 Main Words are ultimately judged as though one reviewer used one ruler, even when production and audit are distributed across many Chats.

---

## 0. One semantic ruler

`CONTENT_ASSET_CONTRACT.md` is the only content-quality standard.

Production Chat and Independent Audit Chat must use the same meanings of:

- Core = compression / organizing layer, not a definition dump;
- Expansion = complete learner-use space when learner-worthy;
- `SAFE_SIMPLE` = semantically trustworthy and Fast-Pass eligible by content;
- `DEPTH_READY` = real intrinsic learner risk with a coherent rich learner object;
- `BLOCKED` = reliable closure would require guessing or unresolved ownership/evidence;
- low-value / L3 / reference-only = ranking or placement, not automatic deletion authority;
- semantic continuity = preserve stable identity unless a genuine new branch exists.

Neither Production nor Audit may invent a local definition of “good enough”.

A field being populated, a validator being green, a prior audit being green, or a word looking familiar is never semantic PASS evidence by itself.

---

## 1. Frozen audit decision vocabulary

Every independently audited owner must terminate with exactly one audit decision:

```text
PASS
FLIP_TO_UPGRADE
FLIP_TO_NO_CHANGE
REFINE_UPGRADE
IDENTITY_RISK
BLOCKED
```

Meanings:

- `PASS` — production operation and semantic target stand as written.
- `FLIP_TO_UPGRADE` — production `NO_CHANGE` is a false-pass; a real semantic/content delta is required.
- `FLIP_TO_NO_CHANGE` — production `UPGRADE` is unnecessary or not semantically justified.
- `REFINE_UPGRADE` — an upgrade is warranted, but the production target is over-broad, incomplete, mis-ranked, or otherwise needs a bounded correction.
- `IDENTITY_RISK` — semantic content may be understandable, but stable sense/Form/Relation ownership or split/merge continuity is unsafe to resolve mechanically.
- `BLOCKED` — evidence or ownership is insufficient for a responsible audit judgment.

Do not replace these with local labels such as “mostly pass”, “minor issue”, “looks fine”, or “needs polish”.

Batch-level result remains one of:

```text
PASS
PASS_WITH_CORRECTIONS
HOLD_FOR_SOL
```

### 1.1 Correction metadata is separate from the verdict

Every non-`PASS` finding must also carry:

```text
risk_family: <frozen family label>
severity: LOCAL | MATERIAL | IDENTITY
```

Severity means:

- `LOCAL` — bounded learner-facing defect such as malformed production string, wrong attachment, duplicate presentation residue, or local ranking error that does not change the underlying branch inventory;
- `MATERIAL` — missing, wrong, over-broad, or mis-ranked sense / construction / Core branch that can materially change comprehension, discrimination, translation, or useful production;
- `IDENTITY` — stable sense continuity, Form ownership, Relation ownership/anchor, split/merge, capitalization identity, pronunciation identity, deprecation/reactivation, or other canonical identity boundary.

Severity does **not** change the audit verdict vocabulary. It exists so batch quality can be compared without pretending that a malformed string and a stable-identity failure are equivalent events.

---

## 2. Audit coverage is risk-determined, not Chat-determined

The Audit Chat does not choose a convenient sample size.

### 2.1 Production `UPGRADE` — 100% reverse-review

Every production `UPGRADE` must be independently reviewed.

The audit must ask both:

1. Is an upgrade actually necessary?
2. Is the proposed upgrade the smallest semantically correct target rather than cleanup inflation?

This catches both unnecessary upgrades and over-broad upgrades.

### 2.2 Form / spelling / capitalization / pronunciation / lexical identity — 100%

Every owner or dependency touched by any of the following is mandatory-review:

- capitalization / case-sensitive identity;
- spelling variant / regional spelling;
- pronunciation / heteronym / stress boundary;
- inflection or lexicalized-form boundary;
- same spelling with materially distinct lexical identity;
- semantic split proposed where Form is the true owner;
- Form split proposed where one semantic owner should remain continuous.

Production quality labels cannot exempt these cases.

### 2.3 Relation / anchor / Core↔sense integrity — 100%

Every owner with any of the following is mandatory-review:

- reciprocal Relation;
- word-family anchor or target sense;
- confusable / semantic-contrast link;
- Relation source/target sense attachment;
- Core branch whose learner-worthy meaning is missing from active senses;
- active ordinary sense omitted from Core where that omission distorts the organizing model;
- ordinary current branch present only as deprecated/reference-only;
- deprecation/reactivation affecting an ordinary branch;
- relation asymmetry caused by changing only one side of a pair.

A repair that leaves the reciprocal owner semantically wrong is not closed.

### 2.4 Complex production `NO_CHANGE` — 100% in STRICT mode

Every production `NO_CHANGE` independently classified as complex must receive full audit.

An owner is `AUDIT_COMPLEX` if **any** material trigger is present, including:

- meaningful polysemy or multiple learner-worthy branches;
- familiar-word-new-meaning risk;
- multiple POS branches with a useful boundary;
- construction / complement / preposition / argument-structure demand;
- collocation or phraseology whose form materially affects recognition or production;
- confusable / contronym / semantic-decision boundary;
- register / stance / intensity / valence distinction that changes use;
- pronunciation / spelling / capitalization / inflection / Form risk;
- word-family or cross-word Relation dependency;
- active/reference/deprecated identity interaction;
- Core↔active mismatch risk;
- productive-value branch where malformed syntax could teach an unsafe string;
- ownership boundary or stable-identity ambiguity;
- any other intrinsic risk signal named by `CONTENT_ASSET_CONTRACT.md`.

Production `SAFE_SIMPLE` / `DEPTH_READY` labels are evidence, not authority for this classification. Audit must independently route the owner.

### 2.5 True simple production `NO_CHANGE`

Only an owner that independently passes all complex-risk gates may enter `AUDIT_SIMPLE`.

Every `AUDIT_SIMPLE` owner still receives a fast audit gate sufficient to confirm:

- ordinary Core is correct;
- active ordinary meaning is present;
- no visible Core↔active/reference mismatch exists;
- no mandatory Form/Relation/identity trigger exists;
- no obvious hidden familiar-new or production-pattern risk is present.

A deterministic deep sample is then required from `AUDIT_SIMPLE`:

```text
sample target = max(10 owners, ceil(10% of AUDIT_SIMPLE))
cap = 40 owners
actual target = min(AUDIT_SIMPLE, sample target, 40)
```

Selection must not be hand-picked for convenience. Until a machine selector exists, sort `AUDIT_SIMPLE` by ordinal and select approximately evenly across the full stratum, always including its first and last owner. Record the selected ordinals before deep review.

If `AUDIT_SIMPLE < 10`, deep-review all of it.

---

## 3. Deterministic Audit Risk Router — machine lower bound

Cross-Chat consistency must not depend only on every Chat interpreting prose risk words the same way.

A deterministic machine-generated **Audit Risk Manifest** is the preferred routing input before package audit. It is a routing lower bound, **not semantic authority**.

### 3.1 Monotonic routing rule

```text
machine risk floor → minimum required audit depth
model fresh judgment → may escalate depth
model fresh judgment → may NOT downgrade below machine floor
```

Therefore:

- if the router marks an owner `AUDIT_COMPLEX`, the Audit Chat cannot classify it as `AUDIT_SIMPLE` merely because it looks easy;
- if the router marks an owner `AUDIT_SIMPLE_CANDIDATE`, the Audit Chat may still escalate it to `AUDIT_COMPLEX` after reading the owner;
- machine flags never decide semantic PASS, sense meaning, Core wording, identity continuity, or final audit verdict.

### 3.2 Minimum deterministic risk flags

The router should emit objective flags when observable from Current owners/dependencies, including at least:

```text
PRODUCTION_UPGRADE
MULTI_ACTIVE_SENSE
MULTI_POS
HAS_CONSTRUCTION
HAS_CONFUSABLE_OR_CONTRAST
HAS_WORD_FAMILY_OR_RELATION
HAS_RELATION_REF
HAS_REFERENCE_OR_DEPRECATED_IDENTITY
CORE_ACTIVE_MISMATCH_SENTINEL
CORE_NONEMPTY_ACTIVE_EMPTY
ORDINARY_BRANCH_REFERENCE_ONLY_SENTINEL
FORM_CASE_SENTINEL
FORM_SPELLING_SENTINEL
FORM_PRONUNCIATION_SENTINEL
PRODUCTION_PATTERN_SENTINEL
OWNERSHIP_OR_IDENTITY_SENTINEL
```

The machine does not need to prove the semantic defect. A sentinel means only: **do not allow a lightweight audit path without human/model inspection.**

### 3.3 Manifest contract

For every owner in scope, the Audit Risk Manifest should record at least:

```text
ordinal
word_id
word
risk_flags[]
risk_families[]
machine_min_depth: AUDIT_SIMPLE_CANDIDATE | AUDIT_COMPLEX
mandatory_strata[]
owner_hash
dependency_hashes / dependency fingerprint
router_version
router_contract_sha
source_head
```

The manifest must cover the full package exactly once and expose duplicate/overlapping mandatory strata without double-counting unique owners.

Until the router tool exists, Audit operates in STRICT mode using the prose rules in this contract and may not claim machine-enforced routing consistency.

---

## 4. Frozen expansion rule

Audit may not stop because “the sample feels sufficient”.

For each risk family / stratum, automatically expand when either condition is met:

```text
same-class confirmed error count >= 2
OR
current reviewed-stratum false-pass rate >= 5%
```

When triggered, the matching risk family in the current audit window expands to **100% review**.

Examples of a risk family:

- production-string / complement syntax;
- familiar missing sense;
- Core↔active mismatch;
- ordinary sense wrongly deprecated;
- reciprocal family/Relation anchor;
- capitalization identity;
- pronunciation/Form boundary;
- over-cleanup / L3-as-delete.

Expansion is scoped by semantic risk, not by an arbitrary neighboring ordinal count.

For production `NO_CHANGE`, false-pass means `FLIP_TO_UPGRADE`, `IDENTITY_RISK`, or `BLOCKED` caused by an unresolved material semantic/ownership defect.

For production `UPGRADE`, report separately:

- `FLIP_TO_NO_CHANGE` rate;
- `REFINE_UPGRADE` rate;
- `IDENTITY_RISK` rate.

Do not mix over-upgrade and false-pass into one number.

---

## 5. Calibration gate — mandatory before every new Audit Chat

A new Independent Audit Chat may not begin package auditing until it passes the frozen calibration sentinels below.

Sentinels are **frozen semantic scenarios from prior reviewed evidence**, not live-current verdicts. Later canonical repairs must not erase the calibration lesson.

The auditor must state the expected verdict/class for every sentinel. Any disagreement is `CALIBRATION_FAIL`; the batch audit must not start until the ruler is reconciled.

### Frozen sentinels

| Sentinel | Expected audit lesson |
|---|---|
| `capacity` | Production-string false-pass: malformed `capacity to do + sth` requires `FLIP_TO_UPGRADE`; fix the existing branch, do not invent a sense. |
| `cast` | Familiar missing ordinary sense: casting/selecting actors is learner-worthy; omission requires `FLIP_TO_UPGRADE`. |
| `cat` | Over-cleanup boundary: remove polluted dated/derogatory Core material, but L3/rare does not equal delete; production upgrade requires `REFINE_UPGRADE`, not blanket pruning. |
| `class ↔ classify` | Reciprocal anchor: category/type sense must anchor both directions; fixing one owner while byte-preserving the reciprocal owner is a false closure. |
| `China / china` | Capitalization is lexical identity here; do not collapse proper-name `China` with common-noun `china`. |
| `close` | Pronunciation/Form boundary must be represented as Form truth, not manufactured as a fake semantic split. |
| `cassette` | True simple PASS archetype: one ordinary learner object can pass without forced Expansion. |
| `claim` | Rich-but-`NO_CHANGE` PASS archetype: meaningful polysemy can already be sufficiently represented; richness alone does not force an upgrade. |

Calibration source evidence: `content/lexical/semantic-audit/o0675-o0874.audit.md` and its recorded production/audit baselines.

Calibration is about **decision consistency**, not memorizing those exact words.

---

## 6. Blind-first audit protocol

Independent audit should minimize anchoring on Production's answer.

For every package, Audit proceeds in two passes:

### Pass A — owner-first provisional judgment

Before reading Production's detailed per-word rationale, the Audit Chat reads:

- this Audit Contract;
- `CONTENT_ASSET_CONTRACT.md`;
- calibration sentinels;
- Audit Risk Manifest when available;
- Current Word owners and mandatory dependencies.

It records a provisional routing / desired semantic state for mandatory owners and the deterministic simple sample.

The provisional record need not duplicate a full handoff, but it must be durable enough to show that the reviewer formed an owner-based judgment before seeing Production's detailed reasoning.

### Pass B — production comparison

Only then compare against the production semantic handoff and emit:

```text
PASS
FLIP_TO_UPGRADE
FLIP_TO_NO_CHANGE
REFINE_UPGRADE
IDENTITY_RISK
BLOCKED
```

Production operation labels may be revealed when needed to satisfy the 100% `UPGRADE` reverse-review requirement, but Production's detailed rationale must not substitute for Pass A.

If tool/transport limitations make strict blind sequencing impossible, the Audit Pack must disclose `BLIND_FIRST_NOT_ENFORCED`; such a batch may still find valid defects but cannot be used as the strongest evidence for reviewer-independence or future audit relaxation.

---

## 7. Audit Pack reporting contract

Every Audit Pack must report coverage **rates and denominators**, not only issue counts.

Minimum required coverage report:

```text
scope owners: X/X
production UPGRADE reverse-reviewed: X/X
mandatory Form/identity cases reviewed: X/X
mandatory Relation/anchor/Core↔sense cases reviewed: X/X
complex NO_CHANGE reviewed: X/X
simple NO_CHANGE fast-gated: X/X
simple NO_CHANGE deep-sampled: X/Y
unique mandatory owners reviewed: X/X

complex NO_CHANGE false-pass: A/X = B%
simple sampled NO_CHANGE false-pass: C/Y = D%
UPGRADE flipped to NO_CHANGE: E/X = F%
UPGRADE refined: G/X = H%
LOCAL findings: L
MATERIAL findings: M
IDENTITY findings: N
identity risk: I/unique-mandatory-reviewed = J%
blocked: K
expansion triggers fired: <risk family + trigger + resulting coverage>
```

Mandatory strata overlap. Their counts are **not additive**. `unique mandatory owners reviewed / unique mandatory owners total` is required so a word that is simultaneously UPGRADE + Form + Relation + complex is not counted four times as coverage.

Every Audit Pack must also freeze the measuring instruments used for that batch:

```text
content_contract_blob_sha
audit_contract_blob_sha
router_contract_sha / router_version (when available)
production_handoff_blob_sha
production_semantic_baseline_sha
owner_read_head
pre_write_head
```

If a semantic or audit contract SHA changes, later rates are not automatically comparable with earlier batches. The later Audit Chat must recalibrate and explicitly state whether comparison remains valid.

Also record:

- reviewed semantic handoff path;
- canonical drift in relevant read/write sets;
- calibration result;
- blind-first status;
- exact audited owner lists per stratum;
- risk-family counts and rates;
- delta-only findings;
- final batch result: `PASS / PASS_WITH_CORRECTIONS / HOLD_FOR_SOL`.

A statement such as “reviewed 30 representative words” is insufficient acceptance evidence without its strata denominators.

---

## 8. Audit independence and authority boundary

The Independent Audit Chat must:

- use owner-first provisional judgment before production comparison whenever the blind-first protocol is enforceable;
- not inherit Production Chat's per-word reasoning;
- not treat `NO_CHANGE` as presumed PASS;
- not treat `UPGRADE` as presumed correct;
- judge the final learner object against the same `CONTENT_ASSET_CONTRACT`;
- write only an Audit Pack under `content/lexical/semantic-audit/`.

It must not:

- edit the production semantic handoff while auditing;
- directly mutate canonical Word / Relation / Form truth;
- silently resolve stable identity split/merge ambiguity;
- authorize Luna implementation by itself;
- lower a machine risk floor merely to reduce workload.

Final semantic reconciliation remains Sol-owned. Mechanical canonical execution remains Luna/Codex-owned.

---

## 9. Batch size and semantic load are separate variables

There is no canonical equation:

```text
larger batch = lighter audit
```

A 250-, 500-, or larger allocation is acceptable only if the mandatory strata above are actually reviewed at their required coverage.

If semantic load is too high, split transport/checkpoints. Do **not** lower audit coverage.

Therefore future batch-size decisions must compare normalized audit metrics, not raw issue counts:

- complex false-pass rate;
- simple false-pass rate;
- over-upgrade / refine rate;
- severity mix (`LOCAL / MATERIAL / IDENTITY`);
- identity-risk rate;
- mandatory-stratum closure rate;
- unique mandatory-owner closure rate.

“Only 3 errors in 500 words” is meaningless without knowing whether 20 or 300 risky owners were actually audited and whether those errors were local strings or identity failures.

---

## 10. Audit maturity mode: STRICT now; no automatic relaxation

Current mode is **STRICT**.

In STRICT mode:

- all Production `UPGRADE` = 100% reverse-review;
- all Form / Relation / identity mandatory strata = 100%;
- all `AUDIT_COMPLEX` production `NO_CHANGE` = 100%;
- `AUDIT_SIMPLE` follows the deterministic fast-gate + deep-sample rule;
- machine routing, once available, is a non-downgradable lower bound.

This contract intentionally does **not** define an automatic `STEADY` relaxation today.

A future reduction in complex-`NO_CHANGE` audit density is allowed only through an explicit amendment to this canonical contract after comparable evidence exists under stable contract hashes. At minimum, such a proposal must show multiple consecutive contract-compliant packages, normalized rates/denominators, severity mix, mandatory-owner closure, and no hidden identity failures.

No Chat may infer `STEADY` from “recent batches looked good”. No batch-size increase itself changes audit mode.

---

## 11. Scaling gate

Scaling is permitted only when consecutive batches are comparable under this contract.

A batch cannot be used as evidence for scale-up unless:

- calibration = PASS;
- contract/blob SHAs are recorded;
- blind-first status is recorded;
- all production `UPGRADE` = 100% reverse-reviewed;
- all mandatory Form/identity cases = 100%;
- all mandatory Relation/anchor/Core↔sense cases = 100%;
- all complex `NO_CHANGE` = 100% in STRICT mode;
- simple stratum followed the deterministic fast-gate + deep-sample rule;
- unique mandatory-owner closure = 100%;
- every triggered expansion reached 100% for the relevant risk family;
- rates, denominators, risk families, and severity mix were recorded;
- no unresolved `IDENTITY_RISK` / `BLOCKED` is hidden by the batch verdict.

Do not scale merely because CI is green or total correction count is small.

---

## 12. Acceptance principle

The Independent Audit Lane is successful when its **measurement ruler is invariant across Chats**.

The governing principle is:

> **Freeze not how many words an Audit Chat sees, but the conditions under which every word must be audited to a specific depth.**

Operationally, the long-term target is:

```text
CONTENT_ASSET_CONTRACT
→ deterministic machine risk floor
→ owner-first independent judgment
→ production comparison
→ normalized Audit Pack
→ Sol reconciliation
→ Luna mechanical implementation
```

This contract supersedes any older Issue/comment guidance that lets an Audit Chat freely choose a fixed number such as `15–25 complex NO_CHANGE` or `8–12 UPGRADE` as sufficient coverage.
