# C Phase 6B — Self-adversarial Learning audit after anti-anchored premodel

Status: **SELF_ANTI_ANCHORED_PASS_AFTER_REPAIR — NOT INDEPENDENT L PASS**  
System: **C Hematology / Immunity / Infection**  
Candidate: `c-hematology-immunity-infection-learning-candidate.json` + five storage shards  
Projection / Runtime / Evidence: **still frozen downstream**

## 1｜Why this audit is stronger than builder self-review, but still not independent

This audit deliberately used a two-stage order:

1. read Current project contracts, C `system.json` and canonical H1–H27 Block Core from `main`;
2. write and commit `C_PHASE6A_FRESH_STYLE_PREMODEL.md` **before candidate inspection in this audit phase**;
3. only then read the Learning candidate and attack it against the frozen premodel.

That removes a large amount of direct answer-key anchoring, but the same Chat previously built the candidate. Therefore:

```text
anti_anchored = true
self_adversarial = true
independent_actor = false
fresh_independent_L_PASS = false
```

A new actor/session must still perform the formal fresh L acceptance before promotion to the live `*-learning.json` owner.

---

## 2｜Findings that produced real repairs

### R1｜Machine candidate had lost cognition-specific LG closures

**Finding:** the candidate shards initially stored only:

```text
kp_members + label + generic job codes + receipt_anchor
```

while the explicit per-LG `goal`, `closure` and `continuity_rationale` lived only in construction receipts.

**Why this failed the Learning contract:** a Logic Group must own one local learner question and one cognition-specific closure. Generic reusable job contracts cannot tell downstream Projection/Runtime exactly what *this* LG must reconstruct. Requiring a non-authoritative construction receipt to recover that semantic contract also weakens single-owner authority.

**Repair:** deterministic compiler `static-web/scripts/repair-xizong-c-learning-phase6.mjs` now materializes the already-reviewed Phase-3 `goal / closure / continuity_rationale` into all **133** LG objects. The machine candidate now owns its own complete local semantic closure.

**Validator:** `validate-xizong-c-learning-semantic-contracts.mjs` requires all seven per-LG fields:

```text
kp_members
label
jobs
goal
closure
continuity_rationale
receipt_anchor
```

### R2｜H10 readiness was too soft about H9

**Finding:** H10 treated H9 acute leukemia as `benefits_from` only.

**Risk:** the flex rule could legally move H10 before H9, causing H10’s acute-vs-CML comparison and blast-crisis language to become first exposure rather than Recall, despite H10’s own stop-line saying it does not re-teach H9.

**Repair:** `hematology-h09` is now a hard `requires` edge for H10 and is removed from `benefits_from`.

### R3｜H23 could become a second Primary for D12 material

**Finding:** H23’s TB / UC / CD ulcer-comparison network treated digestive D12 only as a benefit.

**Risk:** if H23 moved before D12, material explicitly owned as `Recall / Compare` could become first exposure inside C, violating ownership and first-learning semantics.

**Repair:** `external:digestive-d12` is now required before H23. D10/D11-style neighboring ulcer knowledge may remain benefit-level where the H23 comparison is only a bounded visual/interface cue.

### R4｜H24 could compare against TB before the C TB integration owner was learned

**Finding:** H24 treated H21 only as a benefit even though the schistosomal pseudo-TB granuloma comparison uses H21 as its explicit Recall coordinate.

**Repair:** `hematology-h21` is now required before H24 and removed from benefits.

### R5｜Phase-3E accounting receipt had stale counts

**Finding:** `C_PHASE3E_LOGIC_GROUPS_H20_H27.md` header said:

```text
H20–H27 = 35 LG
C cumulative = 134 LG
```

but the enumerated groups are actually **34**, yielding the structurally validated cumulative **133**.

**Repair:** receipt header corrected to:

```text
H20–H27 = 34 LG
C cumulative = 133 LG
```

This was construction-accounting drift, not a missing/duplicated KP; the candidate’s exact 423-KP partition remained correct.

---

## 3｜A challenge that was intentionally *not* repaired

### H6｜Should bleeding localization be learned before ITP?

The pre-candidate model predicted:

```text
bleeding site/time → hemostatic layer → screening tests → specific ITP model
```

The candidate instead keeps the source-local sequence:

```text
ITP → ITP treatment → general bleeding localization/tests → final algorithm
```

At first this looked like a semantic red point. The counterfactual was tested against the source-continuity contract.

**Why no reorder was applied:**

- H6 Block Orientation already installs the “first locate which hemostatic layer failed” coordinate before any LG source contact;
- the original Lecture sequence is P197 ITP followed by P198–199 broader bleeding localization/testing;
- forcing the learner to visit the later general pages first and then jump backward to ITP would add source switching and violate the low-switching / original-Lecture-continuity rule;
- normal hemostasis itself is already an external required baseline, so ITP does not begin from a blank physiological model;
- the Block exit still returns to the general localization algorithm.

Verdict:

```text
H6_CHALLENGE = RESOLVED_BY_SOURCE_CONTINUITY
semantic_change = NONE
```

This is an example where the premodel did not simply override the candidate; the stronger criterion was selected after falsification.

---

## 4｜Partition audit after repairs

### H1–H6｜blood localization branch

PASS after the H6 challenge above.

Key preserved properties:

- H1 delays final diagnostic-evidence integration until the cellular/readout substrate exists;
- H2 keeps ABO, Rh timing, component/crossmatch decisions, reactions, massive-transfusion burden and autologous boundaries distinct;
- H3 preserves `Hb → MCV → Ret → specific evidence`;
- H4 proves global low production with peripheral + multi-site marrow evidence;
- H5 follows `prove hemolysis → locate destruction → identify mechanism → confirm representative diseases`;
- H6 does not retake normal-hemostasis Primary ownership.

### H7–H11｜clonal hematology branch

PASS.

Important falsification results:

- H7 uses “active marrow but ineffective clonal output” rather than a classification list;
- H8 separates plasma-cell clone, monoclonal-protein/light-chain output, organ damage and diagnosis/staging;
- H9 uses seven distinct closures across acute identity, marrow-failure/infiltration output, morphology/cytochemistry, flow/genetics, urgent exits/treatment, CR/MRD/toxicity and final execution;
- H10 now cannot move before H9;
- H11 remains deliberately high-resolution (nine LGs) so B-NHL, precursor/Burkitt, T/NK, RS/HL morphology, CHL subtypes and marker/genetic confirmation do not collapse into one memorization table.

No evidence was found that the 133 total came from a fixed quota.

### H12–H19｜minimum immune + rheumatology branch

PASS.

Critical negative-space checks remain intact:

- H12 does not backfill full normal immunology;
- H13 localizes deficient immune layer before HIV-specific details;
- H14 starts with attack direction and preserves both Source conflicts;
- H15 remains a syndrome/evidence/treatment-role Gate rather than four early disease mini-textbooks;
- H16 keeps SLE immune-complex, anti-cell and APS branches distinct;
- H17 explains early DMARD necessity through synovium → pannus → irreversible structural damage;
- H18 starts from gland failure and returns lymphoma to H11;
- H19 starts with vessel caliber / organ combination before ANCA and preserves `type III RPGN ≠ type III hypersensitivity`.

### H20–H27｜infection / source-control branch

PASS after R3–R5.

Critical ownership and action checks:

- H20 remains the five-question common coordinate, not a microbiology/pharmacology course;
- H21 is an integration/router and creates zero duplicate TB Primary ownership;
- H22 is organized by meninges vs parenchyma and visual pathology;
- H23 now requires D12 before using TB/UC/CD comparison as Recall;
- H24 is one canonical Block with two internal continuous units and no fake shared disease trajectory; H21 is now required;
- H25 organizes source control by anatomical space, pressure, necrosis and threatened function rather than incision-name memorization;
- H26 keeps pathogen evidence, source control and perfusion support as parallel non-substitutable lines while preserving historical Source terminology;
- H27 shares only the anaerobic-spore/hypoxic-wound entry before splitting into tetanus neural disinhibition vs gas-gangrene muscle necrosis/source control.

---

## 5｜Surface / compression / negative-space audit

PASS at candidate semantics.

### Original Lecture / MarginNote

Remains the continuous primary learning surface. The candidate does not authorize KianOS to become a second source reader.

### KianOS

Owns bounded orientation, selective cue, retrieval, local closure, Block/System compression and later W/U repair routing.

### Chat

Owns adaptive explanation, linking and smallest-sufficient repair only; Chat explanation is not mastery evidence.

### Progressive compression

The candidate correctly thins from detailed first-pass source contact toward:

- blood: lineage/output + MCV×Ret + marrow/peripheral localization;
- clonal: clone + maturation + evidence-role hierarchy + urgent exits;
- immune/rheum: defense insufficient vs self-directed vs alloimmune + syndrome/evidence roles;
- infection: site + host + reaction + persistent source + systemic danger.

Canonical KP existence alone creates no permanent review debt.

### Projection contradiction

The previously discovered contradiction remains valid and intentionally unresolved at L:

```text
Current generic Xizong Projection loader
= contiguous [start,end] Logic Group ranges only

C accepted Learning candidate
= explicit membership, including non-contiguous groups
```

Downstream P must learn explicit membership. L must not be rewritten to satisfy the old loader.

---

## 6｜Machine validation state

The Phase6 repair was materialized by deterministic CI and then read back from the branch. The C-specific checks now cover:

```text
27 canonical Blocks
423 stable KPs exactly once
133 Logic Groups
5 storage shards
explicit non-contiguous membership
27 learner-order closures
27 canonical Block/KP identity checks
133 group-specific goal/closure/continuity contracts
3 tightened readiness edges
Phase3E = 34 LG / cumulative 133
L_pass_claimed = false
independence = SELF
Projection = frozen
```

A workflow-generated materialization commit may produce GitHub `action_required` with zero jobs because the actor is `github-actions[bot]`; that is a GitHub execution-permission state, not a semantic test failure. A subsequent user-authored commit should be used to obtain the normal full CI signal.

---

## 7｜Verdict

```text
builder_semantic_construction = COMPLETE
anti_anchored_self_adversarial_audit = PASS_AFTER_REPAIR
known_self_audit_red_points_remaining = 0
structural_semantic_candidate = READY_FOR_FRESH_INDEPENDENT_L_AUDITOR
fresh_independent_L_PASS = NOT_YET
canonical_live_L_owner = NOT_PROMOTED
Projection / Runtime / Evidence = FROZEN
Crosswalk = UNCHANGED
learner_state = UNCHANGED
```

The next legal step is **one genuinely fresh independent L audit** using `C_PHASE6_FRESH_L_AUDIT_BRIEF.md` and the Current Core. Only if that actor independently returns PASS may the candidate be promoted atomically to the canonical live `c-hematology-immunity-infection-learning.json` owner and P become eligible to start.