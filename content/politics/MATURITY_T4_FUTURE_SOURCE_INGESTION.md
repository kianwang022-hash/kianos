# Politics Maturity T4 — Future Source Ingestion

Status: **INGRESS PREPARED · CURRENT-YEAR CONTENT UNBOUND**  
Parent: `MATURITY_STAGE_PLAN.md`  
Machine owner: `manifest.json.future_source_families`

## 0. Scope

This execution artifact owns only the admission boundary for the four known annual Politics source families:

1. current-year memory / sprint handbook;
2. current-year current-affairs / 形势与政策;
3. Xiao8;
4. Xiao4.

It does not contain those sources and does not authorize model memory, prior-year material, screenshots, drafts, OCR fragments, or packaging labels as 2027 truth.

---

## 1. Authority rule

Machine rule:

`ONLY_BOUND_HAS_CURRENT_YEAR_AUTHORITY`

Allowed states:

- `UNBOUND`
- `PARTIAL`
- `BOUND`
- `STALE`
- `REJECTED`

Only `BOUND` may set:

`current_year_authority = true`

All other states must remain non-authoritative.

### UNBOUND

No inspected current-year source is bound.

Use when:

- source has not arrived;
- a source is only rumored/expected;
- Chat only knows historical release patterns.

No current-year derived Memory/Analysis/current-affairs object may be created from this state.

### PARTIAL

Real current-year bytes exist but are incomplete for the intended source family.

Examples:

- only part of a handbook;
- missing answer pages;
- only a subset of current-affairs scope;
- Xiao8/Xiao4 package missing required paper/answer identity.

The source may be archived for provenance but has zero family-level current-year authority until the responsible scope is explicitly accepted.

### BOUND

The exact source file is accepted for its declared family/revision and machine-verified by:

- path under `content/politics/source/future/`;
- exact SHA-256;
- revision identity;
- bound timestamp;
- source file existence;
- hash parity.

Only this state may authorize current-year derivation.

### STALE

A previously bound revision has been superseded or otherwise invalidated.

Its historical provenance remains inspectable, but it grants zero current-year authority for active derivation.

### REJECTED

Real bytes were inspected but failed source quality/identity/scope requirements.

Reason is mandatory.

Rejected material may remain provenance evidence but is not Current teaching authority.

---

## 2. Revision / supersession

Every authoritative revision requires a stable `revision_id`.

When a later revision replaces an earlier one:

```text
new real source bytes
→ new revision_id
→ supersedes_revision_id = previous revision_id
→ verify bytes/hash
→ mark old revision STALE in active authority terms
→ invalidate affected derived objects
→ derive only from new BOUND revision
```

A revision may not supersede itself.

Packaging filename changes alone do not prove a new semantic revision; bytes/content identity must be inspected.

---

## 3. Delta classes

After a source is BOUND, compare it with the narrow applicable baseline and classify each affected object as:

- `STABLE` — meaning is unchanged;
- `UPDATED` — same owner/topic, materially changed formulation/content;
- `NEW` — no legitimate prior Current equivalent;
- `RETIRED` — prior derived/current object should no longer be active;
- `CURRENT_YEAR_ONLY` — depends specifically on the 2027 source/current affairs cycle.

Delta classification is derived analysis, not Source Truth.

The original bound source bytes remain the authority.

---

## 4. Derived invalidation

Every derived object created from a future source must be able to answer:

- source family;
- source revision_id;
- source SHA-256 or exact bound identity;
- derivation version;
- responsible semantic owner.

When its source revision becomes STALE or REJECTED:

```text
affected derived object
→ STALE / invalid for active learning
→ no Memory admission
→ no Analysis exact-formulation authority
→ no current-affairs teaching authority
→ regenerate only after a valid BOUND revision
```

Do not silently leave old exact wording active.

---

## 5. Family-specific use

### memory_handbook

May authorize:

- source-grounded exact Memory admission;
- fixed formulations;
- later compression priority.

Must not replace Chengfeng as the first-round continuous course.

### current_affairs

May authorize:

- 2027 current-affairs facts/positions;
- current-year analysis bindings;
- current-year-only exact wording when the source actually owns it.

Historical current-affairs material never upgrades itself by date proximity.

### Xiao8

Primary maturity role:

- current-year transfer;
- Objective calibration evidence when attempt cleanliness is valid;
- Analysis practice;
- timed/mock execution.

It must preserve exposure history so reviewed/reused items are not later presented as clean calibration evidence.

### Xiao4

Primary maturity role:

- final current-year output/compression;
- high-yield exact formulation;
- final whole-paper execution evidence where appropriate.

Xiao4 does not retroactively justify importing its final recitation burden into first-round learning.

---

## 6. Partial / late / low-quality fallback

No annual source family may freeze the learner indefinitely.

If a source is late, partial, or rejected:

1. preserve the slot as non-authoritative;
2. continue with already accepted stable Current knowledge;
3. continue source-independent Analysis abilities such as IDENTIFY / SKELETON / MATERIAL BINDING where legitimate;
4. use another source only after that alternative is explicitly bound to the responsible family/scope;
5. keep unavailable exact/current-year wording UNKNOWN rather than inventing it.

“Stop waiting” therefore means:

> continue safe learning with accepted sources, not promote an unverified replacement.

---

## 7. Machine proof

`validate-politics-future-source-slots.mjs` enforces:

- exactly four known source families;
- allowed status values;
- only BOUND may carry current-year authority;
- BOUND/PARTIAL/STALE/REJECTED source paths stay under the Politics future-source root;
- bound bytes must exist;
- SHA-256 must match;
- revision identity is mandatory;
- supersession cannot self-reference;
- non-authoritative bound states require a reason.

The validator is wired into the existing Politics Final Fresh Execution workflow.

No second ingestion service is required before real Source arrives.

---

## 8. Current verdict

```text
annual family registry          READY
fail-closed authority states    READY
exact-byte/hash gate            READY
revision/supersession identity  READY
partial/stale/rejected states   READY
real 2027 source content        UNBOUND
delta derivation                WAITING FOR BOUND SOURCE
derived invalidation execution  WAITING FOR FIRST REAL REVISION
```

T4 engineering preparation is therefore sufficient for now.

Reopen this owner when a real annual source arrives or when an actual ingestion failure proves a missing machine rule.
