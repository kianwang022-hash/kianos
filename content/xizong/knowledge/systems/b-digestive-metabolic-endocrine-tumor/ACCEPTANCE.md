# Xizong B Digestive / Metabolic / Endocrine / Tumor Acceptance

Status: CURRENT  
Scope: B — Digestive / Metabolic / Endocrine / Tumor  
Standard: root `LEARNING_ACCEPTANCE.md`  
Role: B scoped Acceptance Truth

This file owns current S/K/L/P/R/E/U readiness claims for B.

It does not own medical Core, lane learning semantics, Work Cursor, or Kian's private learner state.

---

## Gate status

```text
S  BLOCKED — exact Current official-question membership owner not yet accepted
K  PASS — 38 stable Blocks / 600 stable KPs + accepted System model
L  UNTESTED — ACTIVE on the Knowledge→Learning dependency chain
P  UNTESTED — downstream-frozen behind L
R  UNTESTED — downstream-frozen behind P
E  UNTESTED — downstream-frozen behind R
U  UNTESTED — real learner use only after engineering readiness
```

Current allowed conclusion:

> **B's medical Knowledge model is accepted and Learning design may proceed. Source remains partially blocked only on the exact official-question membership needed for the later honest System question sweep. That Source blocker does not revoke the accepted medical Core or force unrelated Knowledge/Learning work to wait. B is not yet learner-ready.**

This is dependency-scoped scheduling rather than a synthetic linear queue: K/L can advance from the accepted medical/source boundary, while execution of the later official-question sweep remains dependent on S question-scope closure.

---

## S — BLOCKED｜official-question membership sub-boundary

### What is already authoritative

- B System identity and ownership are declared by `content/xizong/knowledge/manifest.json`.
- B medical Block/KP Core exists under `content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/`.
- Current System-level Knowledge owner is `system.json`; the earlier System Guide is retained as transitional/reference substrate rather than a parallel semantic owner.
- The System Guide's Scope Audit establishes the first-party medical/source boundary across digestive, material/energy metabolism, endocrine, biochemistry/molecular biology and assigned tumor interfaces.
- Current official Question Truth is `content/xizong/questions/`.

### What is missing

No accepted Current B question-scope owner yet records the exact official-question membership required for a later honest System question sweep.

Current Question Truth cannot silently manufacture this membership: question-level `classification.system/block/chapter/subject` fields are not a complete accepted B routing layer, and reviewed Question→Knowledge relations are intentionally sparse and separate from System membership.

### Acceptance requirement

S remains BLOCKED until a Current owner is accepted that:

- contains stable exact question IDs;
- resolves every included ID against Current Question Truth;
- derives membership from the canonical B source boundary plus explicit collision/inclusion/exclusion decisions;
- checks negative space and neighboring-system false positives;
- leaves real ambiguities explicit until reviewed;
- does not target a desired historical count such as `1072`;
- does not infer precise Question→Block/KP relations from System membership;
- records reconstruction provenance honestly.

A historical count or historical routing artifact may be evidence, but is not sufficient by itself for Current PASS. The previously attempted bounded recovery is closed; normal work must not resume broad historical archaeology.

Evidence mode required for closure: at minimum `STRUCTURAL + ADVERSARIAL` over Current authority, with executable identity/count/inventory validation where practical.

### Scheduling consequence

This unresolved sub-boundary blocks **the official B System question sweep and evidence derived from that exact sweep**. It does not block formation of the medical System model, causal learner order, MarginNote/KianOS surface ownership, Logic Group structure, Block Recall semantics or other work whose correctness does not depend on knowing the exact qid membership.

---

## K — PASS

Accepted Current owner:

`content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/system.json`

Accepted stable substrate:

- **38 canonical Blocks** = D1–D23 + M1–M10 + G1–G5;
- **600 canonical KP identities**;
- zero missing Block ordinal and zero duplicate Block ordinal;
- 600 sequential KP headings and 600 unique `kianos:kp` identities after bounded metadata-only repair of D8 and D11;
- no Block/KP split, merge, semantic rewrite or renumbering;
- legacy `system_id` spelling variants are aliases and are not normalized by rewriting medical Core.

Accepted System model:

- mother model = **food/substrate input → gastrointestinal transport/digestion → selective absorption → portal/lymph delivery → carbon/energy + storage/mobilization + nitrogen/bilirubin/xenobiotic handling → endocrine flow control → DNA→RNA→protein execution and clonal control → clinical evidence/localization**;
- eleven functional components spanning transport tube, mucosal barrier, digestive glands, absorption interface, ATP engine, storage/mobilization, nitrogen/one-carbon, liver chemical hub, endocrine controller, genetic-information system and abdominal/surgical space;
- thirteen Failure Modes covering motility/outlet, mucosa, digestive-fluid, absorption, ATP/redox, substrate routing, lipid transport, nitrogen/urea, nucleotide, liver chemistry, abdominal contamination/bleeding/obstruction, endocrine-axis and genetic/clonal-control failure;
- explicit judgment axes for GI localization, metabolic-state localization, hepatic/cholestatic/portal differentiation, endocrine feedback localization, acute crisis vs chronic complications and tumor source/depth/spread/resectability;
- explicit negative space for renal, hematology/coagulation, immune/infection, reproductive, neurologic, tumor-general and modern oncology guideline owners;
- question count is not a Knowledge completeness target, and missing exact B official-question membership cannot be smuggled into K as a guessed `1072` list.

### K falsification and evidence

Evidence mode: `STRUCTURAL + EXECUTED + ADVERSARIAL`  
Independence: `SELF`

Strongest falsification attempted:

1. machine-enumerated every Current B Block rather than trusting the old Guide's counts;
2. compared expected D1–D23 / M1–M10 / G1–G5 identity set against actual files;
3. counted actual KP headings and stable markers, checking duplicates and gaps;
4. found a real metadata defect: all 25 D8 KP markers plus D11 KP02 marker were missing while the medical KP bodies existed;
5. repaired only those 26 identity markers through a two-file fail-closed migration, without changing medical prose;
6. challenged legacy `system_id` inconsistency and resolved it as alias debt rather than mass-editing medical owners;
7. challenged negative space and prohibited question-count / Question→KP inference shortcuts;
8. ran `validate-xizong-b-knowledge.mjs` alongside existing A1/A2/A3/shared regressions and the Astro build.

Validation evidence:

- bounded marker repair run `34763908768` → success;
- Xizong QA run `34764075042` (#325) → success;
- `Validate B Knowledge contracts` → PASS;
- `Inspect B Current Core substrate` → PASS;
- A1/A2/A3/shared regressions → PASS;
- `Build Astro` → PASS.

K PASS is a Knowledge/readiness claim only. It does not mean Kian has learned any B Block or that the official B question sweep is available.

---

## L — UNTESTED / ACTIVE

L is now the earliest unresolved eligible gate on the medical Knowledge→Learning dependency chain.

The inherited lane constitution already fixes the non-negotiable surface model:

- **iPad / MarginNote** = continuous original Lecture/source reading, source figures/tables, annotations, source-local examples and Lecture-attached questions;
- **KianOS** = System/Block orientation, attention boundary, selective cues, active retrieval, Logic Group closure, Block/System compression, Wrong/Uncertain routing and later review;
- **Chat** = adaptive explanation, mechanism linking and smallest-sufficient repair.

B Learning must now determine the causal learner route and Logic Group/closure structure for the accepted 38-Block / 600-KP substrate without reviving the old Guide as a second primary Lecture reader.

L may define when the later official System question sweep belongs in the learner journey, but actual execution/loading of that sweep remains gated by S exact question membership.

---

## P / R / E

Downstream-frozen behind L on the learner-surface chain.

The existence of old web/runtime surfaces is not evidence of P/R/E acceptance. In particular, B's current D/M/G file layout is a future Projection concern and must not be used as a reason to rewrite medical Core during K/L.

---

## U — UNTESTED

U is real learner validation only and is not currently eligible.

No repository state implies Kian has started, completed, recalled, answered, repaired, or validated B.

---

## Truth boundaries

### Artifact Truth

- owner map → `content/xizong/knowledge/manifest.json`
- B System Knowledge → `content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/system.json`
- B medical Core → `content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/` D/M/G canonical Block Markdown
- transitional/reference System Guide → `content/xizong/knowledge/system-guides/西综消化_物质代谢_内分泌_System_Guide_v2_生化完整整合版.md`
- lane Learning constitution → `content/xizong/LEARNING_CONTRACT.md`
- Current Question Truth → `content/xizong/questions/`
- reviewed Question→Knowledge relations → `content/xizong/question-relations/`

### Acceptance Truth

This file.

### Work Cursor

`content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/CURRENT.md`

### Learner Truth

Private learner/browser/conversation evidence only.
