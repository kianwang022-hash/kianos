# KianOS Architecture

Status: **CURRENT — accepted top-level architecture**  
Version: **2.3 — responsibility model preserved; operating descriptions consolidated**

`PROJECT_DEFINITION.md` owns why KianOS exists. This file owns durable responsibilities and their interfaces **and the callable CBA product-development architecture**. Personal `KERNEL.md §2` owns cross-system responsibility/transfer boundaries; `AGENTS.md` routes work; `PROJECT_MANAGEMENT_CONTRACT.md` owns execution; Acceptance owns evidence.

# 0｜Capability hierarchy — WHERE

```text
KianOS
├─ 2027 Postgraduate Exam System
│  ├─ Exam Rule / Model → EXAM_ORCHESTRATOR_CONTRACT.md
│  ├─ Xizong / English / Politics
│  ├─ Home / Steward / Radar / Subject / Dock surfaces
│  └─ shared Resume / Return / Timer / checkpoint / Packet / Plan / Evidence / Delivery
├─ Skills / promoted non-exam capabilities
└─ future independently meaningful capabilities, only when actually accepted
```

This hierarchy locates responsibilities; it does not create a work queue. Chat and upstream Personal Exam control own current adaptive allocation/replanning. KianOS owns durable exam semantics, product translation, execution and factual evidence, not a second strategy brain.

# 0.5｜CBA — callable product-development architecture

`CBA = CREATE → BUILD → AUDIT`.

CBA is **not the ambient mode of KianOS**. It becomes active only when Kian explicitly invokes it (`调用 CBA` / `CBA`) or an already-bound engineering task explicitly declares itself CBA-driven.

Ordinary learning/use, direct content edits, correctness repairs, copy/layout tweaks and Audit-found implementation fixes do not need a CBA stage label.

When invoked:

```text
CREATE
→ decide/revise the feature's actual meaning:
   user outcome / learning or product behavior / material visual choice

BUILD
→ realize that accepted meaning in the existing product/runtime
→ prove the changed effect

AUDIT
→ adversarially verify the finished capability under the applicable Acceptance owner

REAL USE
→ follows afterward and may supply new evidence
```

CBA is one development architecture, not three workers, three Chats or three mandatory Issues. The same conversation may traverse it. Stage boundaries protect meaning/evidence; they do not justify handoff ceremony.

Outside an active CBA run, solve the requested task by the shortest correct path.

# 1｜Product responsibility flow

```text
Rule / Model
→ Content + Visual + Engineering
→ Product / Website
→ bounded private Evidence → Chat

Control / Current routes from the side; it creates no Truth.
```

These are responsibilities, **not services, mandatory file types or six databases**. Several responsibilities may share a file; one fact/decision still has one canonical owner.

A meaningful capability must expose a recoverable trace from user outcome through its relevant Rule/Content/Product/Surface/implementation to Acceptance and real-use evidence. Skip inapplicable responsibilities instead of inventing placeholders. Traceability does not require rereading the entire chain for each small edit.

## 1.1 RULE / MODEL｜why the system behaves this way

Owns purpose, knowledge-quality standards, learning logic where relevant, interaction meaning and boundaries. English targets capability on new exam material; Politics targets reliable score gain per study time; Xizong targets mechanism-centered retrievable medical knowledge; Lexical targets correct transferable lexical access. Exact requirements stay in their native owners.

Content cannot decide layout; Visual cannot invent meaning; Engineering cannot invent domain/learning logic; Control cannot manufacture truth. Personal-derived requirements remain references to Personal: KianOS owns the product translation, not a duplicate personal conclusion. Runtime evidence does not automatically become preference or strategy.

## 1.2 CONTENT｜durable knowledge / semantic assets

Reliable Source → reviewed Knowledge reconstruction → learner-worthy canonical content, including questions, explanations, relations and justified reference assets. Raw PDFs, lecture order or copied passages are not automatically accepted Knowledge. Non-learning products may own semantic/configuration assets without inventing learning stages.

Content must remain coherent if this website disappears. Normal changes go from the exact canonical owner through any required existing projection to the renderer—never a hand-maintained copy in page code. Raw/reference assets may remain in their native library until actual need justifies promotion.

## 1.3 VISUAL｜stable presentation of accepted meaning

Shared Visual owns common typography, spacing, palette and controls. Product/domain Visual owns genuine local differences. Accepted Surface Blueprints own task geometry: whole-passage Reading, Cloze answer sheet, Translation source/output, Writing prompt/essay, Politics Natural Units, Xizong workspaces and Lexical jobs.

Accepted design survives refactors and fresh Chats. Reopen it only for Kian's explicit change or a changed upstream task that the geometry no longer expresses. A correction preserving accepted design does not require Kian to approve the same design again.

For each surface/state/breakpoint, one material geometry/property has **one effective implementation owner**. Responsive/state selectors and inheritance are legitimate; sequential emergency/final overrides are not. Remove superseded competing rules at their owner instead of adding another layer. A same-runtime UI is shared product grammar, not a requirement that all cognitive objects look identical.

## 1.4 ENGINEERING｜make the approved system executable

Loaders, adapters, renderers, runtime/state, answer gates, navigation, persistence, keyboard behavior, Timer, delivery and tests implement accepted meaning. Runtime is an Engineering responsibility, not a new semantic layer.

Share task behavior when cognition, evidence meaning and interaction semantics actually match. Compatible data sources should not create duplicate runtimes; similar-looking but different cognitive tasks must not be flattened into one. A coverage matrix alone never authorizes rebuilding an existing capability.

The shared Base remains thin. Subject styles/bridges mount at their actual family/task owner; global shell is not a dumping ground. `SYSTEM_CONTRACT.md` owns shared capabilities, inputs, private data and cross-surface invariants.

## 1.5 PRODUCT / WEBSITE｜execution surface

Website consumes approved Rule/Content/Visual/Engineering. It may own local implementation state, not competing semantic truth. External-primary actions remain on their accepted surface: loading a lecture does not authorize replacing MarginNote or duplicating its course.

## 1.6 EVIDENCE｜bounded return from real use

Native/private runtime owns actual records. Distinguish OBSERVED, REPORTED, DERIVED and INFERRED. Attempts, time and successful commands do not automatically prove learning, productivity, preference or strategy. Open-ended interpretation returns to Chat / Personal.

## 1.7 CONTROL / CURRENT｜routing mechanism, not a product layer

Current locates the active owner/task; a bound Issue carries its Goal/Phase/Next/Blocker. Neither stores learner progress, duplicate semantic rules or a second acceptance ledger. Status comes from the current owner, not a remembered branch or historic PASS.

Retired code must not keep controlling live behavior under newer overrides. Cold evidence stays outside normal startup/search; keep historical files only for a named current reproducibility/provenance need, otherwise Git history is the archive.

# 2｜Three cross-cutting truth guards

- **Source Truth:** no invented facts, official answers, provenance or semantic mappings.
- **Private execution / learner evidence:** real records remain native/private; repository state cannot manufacture activity or personal interpretation.
- **Acceptance Truth:** a claim must match the artifact, environment, coverage and evidence actually proved.

These are guards, not new product layers. An implemented or rendered object is not automatically ready or genuinely used.

# 3｜S / K / L / P / R / E / U is learning acceptance, not architecture

Source reliability; Knowledge quality; Learning logic; Projection fidelity; Runtime behavior; Evidence integrity; genuine User validation. These are native learning quality questions, not seven services or seven mandatory fresh audits for each repair.

`LEARNING_ASSET_STANDARD.md` owns construction. `LEARNING_ACCEPTANCE.md` owns readiness evidence. Non-learning products use their native claims, not fabricated learning gates.

# 4｜Projection is optional derivation, not a mandatory architecture layer

Use canonical content → renderer directly when sufficient. Use the existing projection when Learn/Recall/Repair/Review need different disclosure of the same meaning. Projection may reference/derive/adapt but must not invent relations or become a second semantic copy; missing meaning fails closed.

An explicit authored projection decision stays in its registered owner. Rebuild derived output, not hand-synchronize replicas. For backstage leakage, distinguish legitimate learning support from internal governance first: deleting required content or blindly translating internal codes does not repair disclosure.

# 5｜Backend ownership tree ≠ product navigation tree

The learning subtree is Home → Xizong / Politics / English / Skills. English includes Objective (Reading A, Cloze, Part B), Translation, Writing, Vocabulary/Lexical and External Reading. Lexical keeps its canonical backend without becoming a fourth exam subject. External remains English; Skills is an independent L1 library with a generic reader.

This is not the complete navigation authority. Steward and other non-learning surfaces retain their exact Product owners; actual L1 membership comes from the registered shared navigation implementation, not duplicate lists. Backend independence never automatically entitles a top-level tab.

# 6｜Ownership hierarchy and concurrency

Root → capability/lane → justified sub-lane → exact owners. Hierarchy defines inheritance, not execution order, learner order or navigation. No true dependency means independent work can continue. Shared resources and overlapping write-sets need bounded coordination; a parent/sibling relationship alone never serializes subjects.

# 7｜One owner per responsibility

One current fact, rule, semantic object, acceptance claim or learner record has one canonical owner. Others reference, derive, adapt, render or validate. Resolve conflicting owners rather than adding synchronization glue. Shared Timer/Home/private-state capabilities stay shared; local subjects cannot quietly recreate them.

**Owner resolution is backstage.** It is load-bearing for persistence, long-running continuation, conflict resolution and cross-system/shared-boundary changes. It is not a prerequisite ritual before every ordinary edit. A worker may start from the concrete surface/consumer and consult the relevant semantic owner only when meaning is affected or uncertain.

Exact topology and refinement: `AUTHORITY_OWNERSHIP.json` and `AUTHORITY_INHERITANCE_CONTRACT.md`. Physical hosting does not transfer authority.

# 8｜CURRENT and Fresh Chat

Known-scope work starts from the bound task/exact owner, not root architecture by ritual. Use Current only to find a missing route. Recover parent outcome, related design reasons, must-preserve behavior and acceptance/stop; 2–3 precise reads is a routing target, not permission to omit necessary context.

If the active anchor cannot be read, dependent phase/Next/Blocker remains UNKNOWN/BLOCKED; unrelated reasoning can continue. Do not reconstruct it from old PRs or Chat memory. Ordinary conversation and learner use bypass engineering control.

# 9｜Content evolvability and change-cost tests

## 9.1 Content change
Exact canonical owner → targeted proof / existing derived output when needed → existing renderer. No page-local copy.

## 9.2 Global visual change
One shared visual owner → inherited effect. No subject-by-subject duplication.

## 9.3 Subject/surface geometry change

Before reading design documents, run a **semantic-impact tripwire** on the requested visual change:

```text
Could this change alter:
- what action is primary?
- Attention / information hierarchy?
- visibility / disclosure of required or deferred information?
- interaction order or reachable controls?
- state/evidence meaning?
- cross-surface ownership/handoff?
```

If **clearly no**, change the existing local implementation directly and prove the affected rendering.

If **yes or genuinely uncertain**, read the single most relevant Product/Visual/Interaction owner plus the actual consumer before writing. Escalate to another owner only when that first read demonstrates a real dependency.

Example: changing a right rail's width may be a pure geometry tweak, or it may starve the Primary Cognitive Stage and therefore change the accepted Attention allocation. The tripwire—not a mandatory owner tour—decides whether deeper design context is required.

No global restyling or new override stack.

## 9.4 Runtime defect
Related interaction rule + existing runtime → smallest correction + true dependent proof. No Learning redesign unless the accepted rule is actually wrong.

## 9.5 Coherent delivery batch
Finish one coherent write-set, validate its changed responsibility, and land once through the permitted repository path. Candidate/HMR serves iteration; managed Current serves accepted delivery. Do not use main as a keystroke bus, repeatedly build unrelated subjects or claim a merge is already live.

# 10｜Rules inherit; they do not multiply

Procedures stay in their responsible owner. Routers link rather than copy. A new Contract/registry/Current/validator/abstraction requires a real responsibility that cannot be represented by reuse/simplification; complexity itself is not justification.

Already-owned rules failing in execution are consumption defects, not a reason to add another rule. Detailed runtime/Codex/CI instructions stay off unrelated work's hot path.

# 11｜Architecture acceptance tests

- **A1 Fresh Chat:** reach the current owner without historic reconstruction.
- **A2 Owner uniqueness:** every material fact/decision has one resolvable owner.
- **A3 Truth separation:** semantic, acceptance, private evidence and engineering progress remain distinct.
- **A4 Content absorption:** ordinary asset changes reach the consumer without duplicate page edits.
- **A5 Visual change cost:** global changes stay global, local changes stay local, with one effective geometry owner.
- **A6 Parallel work:** true independent scopes proceed; no blanket sibling freeze/rebase ritual.
- **A7 Learning closure:** engineering proofs do not substitute for native learning acceptance or U.
- **A8 Entropy:** no giant Current/history files, duplicate rules/runtime/state, legacy active overrides, full-repo startup archaeology or obsolete intermediate rebuilds.

Evaluate requested effect and observed change cost, not document count. Protocol simplification alone does not prove future edits are fast. `#1048` owns real request-to-consumer execution-friction evidence; it is not a new umbrella project.

# 12｜Compact operating model

Chat interprets; durable owners preserve meaning when persistence/continuity/conflict makes that necessary; Engineering executes; Website presents/records; native Evidence returns to Chat. Current only routes. Ordinary changes stay bounded. **CBA is invoked, not ambient.** Explicit exhaustive Audit stays rigorous and can repair confirmed defects inline. Real-use evidence remains separate.

Keep existing product behavior, semantic authority, data safety, accepted visual design and final acceptance. Remove redundant process rather than rebuilding the systems that already work. Broad engineering stops at the accepted final-closure condition in `LEARNING_ACCEPTANCE.md`; reopen only a real defect, source/platform change or explicit need.
