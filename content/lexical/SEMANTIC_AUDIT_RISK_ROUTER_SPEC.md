# LexicalOS Semantic Audit Risk Router Spec

Status: **canonical routing specification / implementation pending**

Parent audit authority: `INDEPENDENT_SEMANTIC_AUDIT_CONTRACT.md`  
Semantic quality authority: `CONTENT_ASSET_CONTRACT.md`

This spec defines the deterministic machine projection used to set the **minimum independent-audit depth** for a lexical package.

The router is not a semantic judge. It must never decide that a sense is correct, that Core is sufficient, that an identity split is valid, or that an owner passes.

> **The router may raise the minimum audit depth. It may never lower semantic responsibility.**

## 1. Output

For exactly one requested owner range, emit one manifest row per ordinal exactly once.

Required fields:

```text
ordinal
word_id
word
risk_flags[]
risk_families[]
machine_min_depth: AUDIT_SIMPLE_CANDIDATE | AUDIT_COMPLEX
mandatory_strata[]
owner_hash
dependency_fingerprint
source_head
router_version
router_spec_blob_sha
```

Package-level metadata must include:

```text
scope_start
scope_end
owner_count
unique_mandatory_owner_count
flag_counts
risk_family_counts
source_head
content_contract_blob_sha
audit_contract_blob_sha
router_spec_blob_sha
```

## 2. Monotonicity

- Any objective risk flag that implies complex review sets `machine_min_depth=AUDIT_COMPLEX`.
- The Audit Chat may promote an `AUDIT_SIMPLE_CANDIDATE` to `AUDIT_COMPLEX` after reading the owner.
- The Audit Chat may not demote an `AUDIT_COMPLEX` row.
- Production `SAFE_SIMPLE` / `DEPTH_READY` labels do not override this routing floor.

## 3. Initial deterministic flags

The first implementation should support at least:

- `PRODUCTION_UPGRADE`
- `MULTI_ACTIVE_SENSE`
- `MULTI_POS`
- `HAS_CONSTRUCTION`
- `HAS_CONFUSABLE_OR_CONTRAST`
- `HAS_WORD_FAMILY_OR_RELATION`
- `HAS_RELATION_REF`
- `HAS_REFERENCE_OR_DEPRECATED_IDENTITY`
- `CORE_NONEMPTY_ACTIVE_EMPTY`
- `CORE_ACTIVE_MISMATCH_SENTINEL`
- `ORDINARY_BRANCH_REFERENCE_ONLY_SENTINEL`
- `FORM_CASE_SENTINEL`
- `FORM_SPELLING_SENTINEL`
- `FORM_PRONUNCIATION_SENTINEL`
- `PRODUCTION_PATTERN_SENTINEL`
- `OWNERSHIP_OR_IDENTITY_SENTINEL`

A first implementation may conservatively over-route to `AUDIT_COMPLEX`. False-positive routing costs audit time; false-negative routing can hide semantic defects.

## 4. Mandatory strata

Rows may belong to multiple strata simultaneously:

- `PRODUCTION_UPGRADE`
- `FORM_IDENTITY`
- `RELATION_ANCHOR_CORE_SENSE`
- `COMPLEX_NO_CHANGE`
- `SIMPLE_NO_CHANGE_CANDIDATE`

Stratum counts are not additive. The manifest must report `unique_mandatory_owner_count` separately.

## 5. Production operation input

The router may read the production handoff only to determine operation metadata such as `UPGRADE` versus `NO_CHANGE` and explicitly declared Form/Relation targets.

It must not copy Production's semantic rationale into the blind-first audit view.

The preferred audit-facing projection therefore contains:

```text
ordinal
word
risk flags
mandatory strata
hashes
```

and withholds detailed Production reasoning until Audit Pass B.

## 6. Deterministic simple sample support

The router should optionally produce the deterministic deep-sample owner list for `AUDIT_SIMPLE_CANDIDATE` after mandatory complex routing is complete.

Target rule is owned by `INDEPENDENT_SEMANTIC_AUDIT_CONTRACT.md`:

```text
max(10, ceil(10% of AUDIT_SIMPLE))
cap 40
```

Selection must be deterministic and approximately evenly distributed by ordinal, always including first and last when the stratum is non-empty.

## 7. Validation

A valid manifest must prove:

- every ordinal in requested scope appears exactly once;
- no ordinal outside scope appears;
- every flag maps to a known risk family;
- every mandatory stratum is derivable from flags + production operation;
- unique mandatory owner count is internally consistent;
- source owner/dependency hashes correspond to `source_head`;
- contract/spec blob SHAs are recorded;
- output is byte-stable for identical inputs and router version.

## 8. Non-goals

The router must not:

- create semantic upgrades;
- decide `PASS` / `FLIP` / `REFINE`;
- infer learner mastery;
- deprecate or reactivate senses;
- resolve split/merge identity;
- replace calibration sentinels;
- replace final full-object semantic readback.

The router exists only to make **minimum audit depth reproducible across Chats**.
