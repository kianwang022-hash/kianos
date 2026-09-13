# LexicalOS Independent Semantic Audit Contract

Status: **canonical audit-governance contract**

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

### 2.4 Complex production `NO_CHANGE` — 100%

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

## 3. Frozen expansion rule

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

## 4. Calibration gate — mandatory before every new Audit Chat

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

## 5. Audit Pack reporting contract

Every Audit Pack must report coverage **rates and denominators**, not only issue counts.

Minimum required report:

```text
scope owners: X/X
production UPGRADE reverse-reviewed: X/X
mandatory Form/identity cases reviewed: X/X
mandatory Relation/anchor/Core↔sense cases reviewed: X/X
complex NO_CHANGE reviewed: X/X
simple NO_CHANGE fast-gated: X/X
simple NO_CHANGE deep-sampled: X/Y

complex NO_CHANGE false-pass: A/X = B%
simple sampled NO_CHANGE false-pass: C/Y = D%
UPGRADE flipped to NO_CHANGE: E/X = F%
UPGRADE refined: G/X = H%
identity risk: I/mandatory-reviewed = J%
blocked: K
expansion triggers fired: <risk family + trigger + resulting coverage>
```

Also record:

- reviewed semantic handoff path;
- production semantic baseline SHA;
- owner-read HEAD and pre-write HEAD;
- canonical drift in relevant read/write sets;
- calibration result;
- exact audited owner lists per stratum;
- delta-only findings;
- final batch result: `PASS / PASS_WITH_CORRECTIONS / HOLD_FOR_SOL`.

A statement such as “reviewed 30 representative words” is insufficient acceptance evidence without its strata denominators.

---

## 6. Audit independence

The Independent Audit Chat must:

- read the final production handoff and Current Word owners;
- not inherit Production Chat's per-word reasoning;
- not treat `NO_CHANGE` as presumed PASS;
- not treat `UPGRADE` as presumed correct;
- judge the final learner object against the same `CONTENT_ASSET_CONTRACT`;
- write only an Audit Pack under `content/lexical/semantic-audit/`.

It must not:

- edit the production semantic handoff while auditing;
- directly mutate canonical Word / Relation / Form truth;
- silently resolve stable identity split/merge ambiguity;
- authorize Luna implementation by itself.

Final semantic reconciliation remains Sol-owned. Mechanical canonical execution remains Luna/Codex-owned.

---

## 7. Batch size and semantic load are separate variables

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
- identity-risk rate;
- mandatory-stratum closure rate.

“Only 3 errors in 500 words” is meaningless without knowing whether 20 or 300 risky owners were actually audited.

---

## 8. Scaling gate

Scaling is permitted only when consecutive batches are comparable under this contract.

A batch cannot be used as evidence for scale-up unless:

- calibration = PASS;
- all production `UPGRADE` = 100% reverse-reviewed;
- all mandatory Form/identity cases = 100%;
- all mandatory Relation/anchor/Core↔sense cases = 100%;
- all complex `NO_CHANGE` = 100%;
- simple stratum followed the deterministic fast-gate + deep-sample rule;
- every triggered expansion reached 100% for the relevant risk family;
- rates and denominators were recorded;
- no unresolved `IDENTITY_RISK` / `BLOCKED` is hidden by the batch verdict.

Do not scale merely because CI is green or total correction count is small.

---

## 9. Acceptance principle

The Independent Audit Lane is successful when its **measurement ruler is invariant across Chats**.

The governing principle is:

> **Freeze not how many words an Audit Chat sees, but the conditions under which every word must be audited to a specific depth.**

This contract supersedes any older Issue/comment guidance that lets an Audit Chat freely choose a fixed number such as `15–25 complex NO_CHANGE` or `8–12 UPGRADE` as sufficient coverage.
