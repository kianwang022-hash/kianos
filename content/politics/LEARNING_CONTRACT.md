# Politics Learning Contract

Status: CURRENT

This file owns durable Politics learning semantics. It defines how Current Politics content should be learned and projected. It does not own source facts, exam questions, or private learner state.

## 0. Exam objective function — the reason this lane exists

Politics is not being built to become a complete political-theory knowledge system. Its learner-facing purpose is narrower:

> **Help Kian reach a reliable 70+ Politics score, with 75+ as the working target, while consuming the least study time compatible with durable exam performance.**

Every Politics learning, content, UI, Runtime, Review, Memory, and engineering decision is subordinate to that outcome.

The optimization target is therefore not maximum coverage, maximum explanation, maximum source integration, or maximum product polish. It is:

```text
expected exam points gained or protected
÷
learner time + future review debt + switching/friction cost
```

A learner-facing action or asset earns its place only when it materially improves at least one of:

1. answer accuracy;
2. discrimination of confusable options/statements;
3. retrieval speed under exam conditions;
4. transfer from known principles to unfamiliar material;
5. analysis-answer generation later in the preparation cycle;
6. repair efficiency after real Wrong / Uncertain evidence.

If it does none of these, it is not required merely because the architecture can support it.

### 0.1 Score architecture

Current preparation uses a reliability-first score model for the national Politics paper:

```text
70+ floor strategy
≈ objective 40+ / 50
+ analysis 30+ / 50

75+ working strategy
≈ objective 42–44 / 50
+ analysis 31–34 / 50
```

These are **planning targets, not score guarantees**. The reason to bias early learning toward objective accuracy is that objective scoring is deterministic and depends heavily on exact distinctions, relations, chronology, scope and option discrimination. Analysis performance becomes a separate later output task; it must not force first-round study to become premature recitation.

If the official exam structure materially changes, this score model must be revalidated rather than treated as timeless truth.

### 0.2 Phase responsibility — do not make every phase do everything

Politics learning is deliberately asymmetric across time:

1. **First-round understanding / objective engine**  
   Build the smallest coherent source-grounded model through Chat continuous teaching, teach and rehearse approved first-round exact targets, and use Xiao1000 as transfer evidence. Model construction and systematic precision are complementary; heavy later-phase answer-template memorization is out of scope here.
2. **Consolidation / evidence repair**  
   Consolidate the approved precision baseline as well as Wrong / Uncertain gaps; use Recall and question evidence to adjust selection, memory encoding and repair depth, rather than treating mistakes as the only reason to memorize.
3. **Analysis-output phase**  
   Use approved later-phase recitation/current-affairs sources to build source-grounded answer frameworks, fixed formulations and material-to-principle output skill. This is a real score channel and must not be left as a vague consequence of first-round understanding.
4. **Mock / final compression**  
   Train time-bounded retrieval, whole-paper switching, answer completion and last-mile high-yield memory.

A strong first round should make later memorization smaller and more structured; it does not eliminate later memorization.

### 0.3 Hard stop / anti-overengineering rule

Engineering is allowed only to reduce learner cost or protect score-relevant behavior.

Once a learner path is technically sufficient for real use:

```text
real study / U evidence
>
more architecture
>
more polish
```

Do not delay actual study in order to perfect a schema, page, component family, semantic asset, or governance layer whose incremental exam value has not been demonstrated.

Before expanding a reference implementation, ask:

- What concrete learner friction or score failure does this prevent?
- How much future study/review time does it remove?
- Could the same gain be achieved by simply studying or doing questions?
- What real-use evidence would justify keeping or deleting it?

If those questions do not have a convincing answer, stop building.

### 0.4 Compression means fewer future operations

A Politics compression asset is valuable only when it removes future learner work. Useful compression should reduce at least one of:

- rereading source pages;
- rebuilding the same relation from scratch;
- repeated confusion between near-neighbor options;
- time spent locating the repair source;
- future memorization volume;
- time needed to generate a structured analysis answer later.

Shorter text alone is not compression. A beautiful framework that creates an extra course is negative compression.

#### 0.4.1 Incremental learner compression — build while learning, assemble at chapter close

Politics chapter compression is produced **during learning**, not reinvented after the chapter.

After one **natural logical block** closes — meaning one coherent problem/relation has actually been understood — Chat may leave exactly two learner-facing artifacts before continuing:

> **one review-line sentence**  
> (**one non-answer-leaking expansion cue**)

Do not stop after every small fact. The unit is a naturally closed reasoning problem, not a knowledge-point quota.

The review-line sentence must preserve the current problem, its decisive relation, or the bridge needed for what follows. The expansion cue exists only to help the learner retrieve what sits underneath that line. Prefer **object + structure/count** when useful, e.g. `意识2起源｜2本质｜4作用`; do not expose the actual members in the cue. Numbers are optional retrieval structure, not a formatting requirement.

**Expansion cue ≠ Precision/Memory index.** The cue is a learner-facing retrieval aid derived from the model just understood. It may name a stable content cluster whether or not that cluster has a reviewed Memory target. Precision/Memory is a separate third-layer decision about durable exact retrieval. A cue and a Precision object may overlap naturally, but neither implies the other.

Hard anti-collapse rules:
- do **not** inspect the Memory catalog first and then define the cue as “whatever reviewed objects already exist”;
- do **not** delete a useful cue merely because it has no Memory object;
- do **not** create a Memory obligation merely because a cue exists;
- do **not** treat the parenthetical cue as the place to list all current Precision objects;
- form the review line + cue from the learned model first; then separately route exact material to reviewed Precision/Memory when warranted.

Each local compression uses four checks:

1. **Main-model test.** Does this belong to the chapter's reasoning line or an indispensable bridge? Isolated lists, quotations, examples, fixed wording and low-frequency extensions do not enter merely because they were taught.
2. **Cue-leakage test.** The cue opens retrieval slots; it must not become an answer directory.
3. **Model-completeness test.** Local compression must preserve the needed relation/direction. At chapter close, compare the assembled lines against the canonical reconstruction spine so no core node, bridge or direction disappears.
4. **Owner test.** Anything omitted from the learner-facing model must still have an owner:
   - understanding/support detail → existing teaching/support;
   - exam-required exact retrieval → reviewed Precision/Memory;
   - unsupported/unresolved meaning → Source gap.
   “Not in the main model” does not mean “unimportant”, and “not in Memory” does not mean “deleted”.

**Only material worth durable exact retrieval becomes Memory.** Do not convert every removed teaching detail into memorization debt.

At chapter close, do **not** ask Chat to invent a fresh summary. Instead:

```text
existing local review lines
→ order by the learned reasoning route
→ remove duplication
→ repair transitions
→ canonical-spine completeness check
→ owner/Precision check
→ chapter quick-review line
→ thinner keyword view
```

The learner-facing review surface has only three layers:
1. chapter main line — why one step leads to the next;
2. expansion cues — retrieval slots under each line;
3. Precision/Memory — exact content that cannot be reliably reconstructed but must be retrieved accurately.

Teaching/support remains teacher-backend material, not a fourth learner review layer.

Compression therefore means: **fewer future operations needed to reconstruct the chapter**, not merely fewer words.


### 0.5 Fixed reconstruction spine — stable learner index

Politics inherits one compression principle from the mature Xizong model without importing its System/LG/KP hierarchy: **later review becomes thinner around the same model; it does not generate a new model each time.**

For every subject and every chapter with admitted first-round teaching, the existing Content owner must identify exactly one canonical reconstruction spine appropriate to that subject shape. The **subject total model** is the stable top-level index; each chapter spine must locate itself inside that subject model rather than becoming an unrelated local summary. This is a content job around the existing subject/chapter/NU owners, not a new hierarchy or registry.

The fixed spine owns the learner's stable review index:
- stable learner-facing node labels;
- the meaningful sequence / hierarchy / relation topology between those nodes;
- the minimum meaning each node must recover.

First teaching may be much richer than the spine: examples, analogies, source detail, boundaries and B supplements can expand around it. Later compression may hide detail, shorten prose, blank nodes for Recall, or ask from a different cue. It must return to the **same accepted nodes and relations** rather than substituting an equally plausible new summary chain.

Precision/Memory targets attach to this same spine. They may deepen one node or test an exact boundary, but they must not create a second “memory version” of the chapter framework. A learner should be able to use the same mental index during first learning, chapter review, Memory recall, Xiao1000 repair and later analysis reactivation.

Hard anti-drift rules:
- Chat may vary explanation wording, examples and teaching route locally, but at closure/review it returns to the canonical spine;
- do not casually rename, merge, split or reorder spine nodes between reviews merely for elegance;
- a shorter review is produced by **progressive thinning**, not by replacing the framework;
- if Source correction, model correction or real learner evidence shows the spine itself is defective, revise the existing canonical Content owner explicitly, reconcile dependent compression/prompts, and make the change visible rather than silently running old and new spines in parallel.

Subject shape remains local: Marxism normally freezes a reasoning/relation chain; History a stage/causal movie; Mao a historical problem→theory response→position chain; Xi a stable hierarchy/role map; Ethics-Law a stable concept/normative/application scaffold. “Fixed” means stable cognition for that chapter, not one universal Politics template.

Acceptance test: two legitimate reviews of the same unchanged chapter may differ in detail density, but the learner must be able to recover the same canonical relations without rebuilding a new index. A Kian self-use quick-review view may visually group adjacent canonical nodes or use fewer learner-facing lines when the mapping remains clear; the canonical spine then acts as the completeness validator, not a demand that the personal review display copy its node count or wording.

### 0.6 First teaching is problem-driven — the spine is not a lecture outline

The canonical reconstruction spine is the learner's stable **review/index structure**. It does **not** automatically define the sentence-by-sentence or node-by-node order of first teaching.

For first contact, Chat must prefer a **problem-driven dependency route**: start from one chapter-level tension/question, then let each unresolved consequence force the next concept to appear. A concept should enter because the current model cannot proceed without it, not because the next spine node exists.

Hard rules:
- do not announce and teach the chapter as `node 01 → definition → errors → node 02 → definition → errors` merely because the reconstruction spine is numbered;
- a prepared first lesson should remain intelligible and continuous if node numbers, Source IDs and section headings are hidden;
- every new concept in the first lesson should answer “why must this appear **now**?” in the current reasoning chain;
- necessary definitions/conditions are taught at the moment the reasoning needs them; secondary lists, quotations, classifications and exact wording are filled later into the already-built model unless they are required to understand the next step;
- after a problem-driven segment closes, map what was learned back to the canonical spine. The route may cross or revisit nearby nodes, but closure/review must recover the same accepted nodes and relations;
- the teacher brief is a preparation/completeness asset, not a script to read aloud. It prevents omission; it does not determine prose rhythm or force Source-order exposition.

First-teaching acceptance test: hide all node numbers, formal section titles, Source IDs and Memory labels. If the remaining explanation cannot still be read as one coherent problem-solving argument in which each concept is motivated by the previous unresolved question, the first-teaching route is not prepared, even if coverage is complete.


### 0.7 Three-layer learner compression — build it while learning

Politics learner-facing review has exactly **three layers**:

1. **Chapter mainline** — a small number of review sentences that preserve why the chapter moves from one problem to the next.
2. **Expansion cues** — short, non-answer-leaking retrieval keys attached to a mainline sentence. Prefer object + structure/count when that structure genuinely helps retrieval; numbers are optional, never a formatting quota.
3. **Precision / Memory** — only content that the model cannot reliably reconstruct yet the exam requires to be identified or produced with high precision.

Teacher explanation/support is **not a fourth learner layer**. It remains backstage content used to teach or repair understanding.

#### Build compression at natural problem closure

Do not wait until chapter end to invent a summary. After one **natural logic block** has been understood and closed:

\`\`\`text
teach the problem normally
→ close the relation/model for that block
→ leave one review sentence
→ leave one non-answer-leaking expansion cue
→ continue teaching
\`\`\`

A natural logic block is a coherent problem closure, not each definition or micro-fact. Compression must not interrupt teaching every few minutes or turn learning into note maintenance.

The review sentence should carry the current problem, relation or bridge. The expansion cue should only remind the learner which retrieval slots exist; it must not list the members that the learner is supposed to retrieve. Example shape: \`意识2起源｜2本质｜4作用\`, not the actual members of those groups.

#### Chapter closure assembles; it does not re-summarize

At chapter end:

\`\`\`text
existing block review sentences
→ order by the learned logic
→ remove duplication
→ repair transitions
→ check against canonical reconstruction spine
→ verify removed exact content still has an owner
→ save the accepted quick-review line
→ optionally thin further to a minimal keyword line
\`\`\`

Do **not** ask Chat to design a new chapter framework after learning. The canonical spine is the completeness checker and stable identity; the learner quick-review line may visually merge nearby canonical nodes when that makes review faster, provided it remains traceable to the same spine and is explicitly non-canonical.

#### Every removed item keeps an owner, but not every item becomes Memory

When content is omitted from the learner mainline/cue:

- reasoning/explanation detail → remains in teaching/support;
- exam-required exact retrieval → reviewed Precision / Memory;
- unsupported or unresolved claim → Source gap / exact Source owner.

“No longer shown in the mainline” does not mean deleted. “Not in Memory” does not mean unimportant. The system must not create memorization debt merely to prove that every taught detail still exists somewhere.

#### Personal quick-review view

After Kian and Chat have actually learned a chapter and accepted its quick-review wording, that view may be stored **inside the chapter's existing teaching brief/support owner** as a clearly marked Kian self-review view. It is a lightweight durable note, not a new schema, registry, Runtime surface or canonical model.

It must not:
- change the canonical reconstruction spine;
- create another Website/Memory consumer;
- affect learner progress, scheduling or admission;
- be pre-generated for every chapter merely for completeness.

Its purpose is only to make Kian's future manual review cheaper. If later real use finds a better wording, update the same small view rather than adding another summary layer.


## 1. Product model

Politics follows the repository-wide causal chain:

`Source Truth → Chat semantic/learning judgment → GitHub Current content → approved learner surfaces → learner`

Politics should optimize the learner's actual study path, not maximize visible metadata, governance, page count, or the amount of source material rendered inside Astro.

Hard Politics surface rule:

```text
Source ownership ≠ Surface ownership.
Chengfeng Source ownership ≠ Chat teaching surface ownership.
```

Chat owns continuous first-round teaching. Chengfeng remains the Source basis; original iPad/MarginNote images/text are used when source calibration is necessary. Astro keeps its existing companion/Workbench responsibilities; this rule change does not authorize a website feature change.

## 2. Active first-round learning chain

The active first-round chain is:

`subject total model → progressive Chat explanation → same-model compression → Chat memory encoding and exact rehearsal of approved targets → authorized Memory plan → Website retrieval; whole-item-first-ready Xiao1000 verification + Recall evidence → Chat diagnosis and adaptive review`

This is a division of learning jobs, not a mandatory ceremony or one-sitting sequence. Verification may follow the relevant taught prerequisites without waiting for every unrelated chapter list to be memorized. A fast overview does not establish full coverage. First-round exact targets remain governed by §6.1 and Content Hierarchy `FIRST_ROUND_EXACT`; they must not disappear behind “understanding first”.

Chat is the single continuous teaching mainline; Chengfeng is the Source basis and necessary original-image/text calibration, not a parallel second course. Natural Unit existence, identity, boundaries and canonical order remain Chengfeng-owned. Teaching exposition may adapt to understanding, but canonical coverage must not be lost. Pausing/resuming does not prove completion or create review debt; checkpoints remain optional and useful only at natural closure.

The shared explanation/compression/precision idea resembles Xizong, but Politics does not import its System/LG/KP taxonomy. Subject shape remains distinct: Marxism relations/reasoning, History time/causality, Mao historical problem/theory response, Xi hierarchy/role, Ethics-Law boundary/normative application. See INTERACTION_CONTRACT.md §4.

Reasoning-critical conditions and boundaries must be explained when needed, not deferred wholesale as fragments to memorize. Compression reconstructs the same taught model; it is not a second summary course. Reuse the existing Marxism C00–C08 canonical NU coverage and `chapter_orientation`, `teaching_beats`, `chapter_compression`, and C08 `marxism_full_chain`. These existing assets are scaffolds, not acceptance of a complete Chat textbook.

### Source roles

- **Chengfeng** remains the first-round Source basis, with original images/text used for necessary calibration. Natural Unit existence, identity, boundary, and order follow the approved Chengfeng structure.
- **Suyi** is a framework/reference source for Chat. Its useful mind-map structure should be semantically absorbed into Chat-approved Orientation / Bridge / Compression assets. The learner is not required to read Suyi separately, and Politics must not create a second Suyi learning mainline merely to preserve its original presentation.
- **Designated retention source (currently the Leg handbook family)** informs fixed-target selection, wording and useful memory organization, reconciled item by item with Current Chengfeng-owned knowledge under §6.1. It is neither a second course nor an automatic union/intersection of two books. Uninspected or historical-only support stays explicitly limited.
- **Xiao1000** is validation and transfer evidence. It may bind to one or more Natural Units/KPs but must not determine first-round learning order.
- Different teachers may use different frameworks. Distinguish factual conflict, wording difference, and method preference. Chat decides the learner-facing result; do not hard-merge teachers into a false unified framework.

### Surface roles

Politics first-round learning uses explicit surface ownership rather than inferring it from implementation capability.

| Learner action | Primary surface | Companion / boundary |
| --- | --- | --- |
| Chapter / Unit Orientation | Chat; Astro companion | Total model / WHY NOW for the continuous explanation |
| Continuous first study / same-model compression | **Chat** | Chengfeng Source basis; original iPad/MarginNote images/text only when calibration is needed |
| Memory encoding / first exact rehearsal | **Chat** | Explain grouping, contrast, retrieval cues and required accuracy for the same Content targets; no mastery or native Recall event is inferred |
| Planned exact retrieval | **Website Memory workspace** | Execute approved Current catalog selections via `politics.memory_plan`; reveal, self-assessment and evidence return, not autonomous teaching/scheduling |
| Natural Unit position / checkpoint / closure cue | Astro | May tell the learner where they are and what to do next without duplicating the lecture |
| Xiao1000 verification | **single KianOS Politics Workbench** | Original question/options/official answer remain source-owned; the Workbench is the only learner-facing attempt/evidence writer |
| Backside explanation Content | Workbench after submit | `takeaway` + refined explanation are prebuilt question-bound Content, not a runtime Chat call |
| Wrong / Uncertain evidence capture | Workbench | Record outcome, learner cause/note/favorite/discussion when useful; do not force an immediate repair ritual |
| Chengfeng locator / optional return | Workbench backside | Show the exact safest Current locator as reference; learner may return when useful, but W/U does not automatically interrupt the question session |
| Batch Review → Chat | Review → Chat, learner-triggered | Export accumulated W/U + learner annotations as one packet when the learner chooses to review; Chat diagnoses patterns and decides the smallest durable follow-up |
| Resume | Home / Review / Workbench | Preserve the meaningful unfinished question session or learning position without inventing scheduler debt |

The Xiao1000 answer-surface binding preserves the existing approved PoliticsWorkbench practice chain: Unit learning closes, Astro launches the Unit's ready questions, records the attempt/evidence, and returns the learner to the Unit path. This binding does **not** authorize Astro to absorb Chengfeng continuous reading.

## 3. Teaching projection

Politics may add a durable Chat-approved learning layer under `content/politics/learning/`.

That layer may contain high-value teaching semantics such as:

- Chapter / subject orientation;
- why-now and from-previous bridges;
- the core problem a Natural Unit is solving;
- internal teaching beats anchored to the owning Chengfeng unit without changing its identity;
- high-value boundaries and contrasts;
- short closure cues;
- Unit / Block / Chapter compression;
- source-repair guidance for wrong or uncertain questions.

It supports source-grounded Chat teaching; do not transcribe Chengfeng into a competing source reader or manufacture complete-textbook acceptance.

### Default teaching asset types

1. **Chapter Orientation** — where this chapter sits, what question it solves, and how its major parts connect.
2. **NU Teaching Bridge** — a short `FROM_PREVIOUS → WHY_NOW → CORE_PROBLEM → NEXT` transition before/inside the owning Natural Unit.
3. **Compression** — reconstructs a completed Unit/Block/Chapter into a small number of durable relations and should reduce later rereading/reconstruction cost.
4. **Repair Guidance** — sends a wrong/uncertain answer back to the smallest sufficient owning source location.

Only create an asset when it improves learning or removes future work. Do not materialize empty module structures for completeness.

### 3.1 Teaching preparation quality and admission

This section owns preparation quality for Chat teaching content under `content/politics/learning/`; it is not learner progress, a new schema, or Website acceptance. Priority is **completeness → teaching logic → compression**. Prepare a teacher's usable explanation, not a student database of titles, tags or source excerpts. Preserve the five subject shapes in INTERACTION_CONTRACT.md §4; do not import Xizong KP scaffolding.

For each chapter:

- Start from the subject total model, explain the chapter's problem and its connection to the previous/next chapter, then develop the local model with necessary definitions, conditions and boundaries. Existing orientation/beats/compression assets may be reused only within their actually inspected/accepted scope.
- Actually read the relevant formal Source units. Record the inspected range and modality separately for full text, tables and figures/original images; extracted text does not prove a table/figure was read. Mark inaccessible, ambiguous or uninspected ranges unresolved, with their effect on usable coverage. Do not claim Source completeness from headings, counts or annotations.
- Give every important item in each formal Source unit a traceable teaching destination: **A** first explanation, **B** later supplement with an exact chapter/section destination, and/or **C** justified exact retention. Destinations may overlap. A definition, condition or boundary needed for reasoning cannot be C-only or postponed beyond the explanation that depends on it. An item not taught here is not automatically omitted, but its destination or unresolved status must be findable. A/B/C are preparation dispositions, not new learner tiers or a registry. A/B destinations must resolve to existing substantive explanations, and C to inspectable source-grounded exact content; labels, counts, future sections and unresolved items do not establish completed coverage.
- Explain each model relation's type, direction and applicable conditions. Distinguish causal explanation, logical dependence, chronology, normative requirement and historical tendency; do not turn every arrow into causality. Check exact quotations and attribution, formula definitions/units/scope, and table hierarchy/row-column relationships against the inspected Source. Keep Source differences item by item rather than silently reconciling them; preserve original question/options/answer truth.
- Derive compression from the same explained model. It must preserve decisive conditions, boundaries and relation types. Removing all exact-retention markings must still leave a coherent explanation. Exact retention follows §6.1: new cards require the original Content owner's source-grounded review; a typed `MEMORY_CANDIDATE` suggestion is not admission or a queue. Teaching is not evidence that the learner has learned.

Admission uses three bounded review passes: **(1) Source coverage**, including actual modality reads and A/B/C destinations; **(2) teaching continuity**, including total/local models, chapter bridges and reasoning prerequisites; **(3) compression fidelity**, including reconstructability and exactness. The author reads the complete actual chapter text in each relevant pass, not just summaries or metadata. An independent text reviewer then attacks the candidate with concrete counterexamples: an important source item with no destination, a prerequisite deferred to C, a reversed/overstated relation, or a compressed claim that drops its condition. Coverage attacks include exam-relevant subitems within Source units and inspect the corresponding passages, table relationships or figures needed to test each counterexample; the author’s coverage inventory alone is not evidence. Repair the smallest confirmed defects and re-read affected explanation, destinations and compression; reopen only dependent claims when a new defect appears, rather than restarting indefinitely.

A prepared chapter is complete for its reported usable scope only when actual teaching content, corresponding Source locators and unresolved ranges are present, author full-text review and independent textual attack have been performed, and confirmed defects have been repaired and rechecked. Report usable and unresolved scope honestly; an unresolved decisive prerequisite prevents claiming the dependent teaching scope ready. This preparation completion does not require Kian's chapter-by-chapter Human approval and does not manufacture learner or Website acceptance.

Maintain one canonical preparation in the existing Politics content owners; adapt existing assets or add only the necessary chapter text. Do not stack multiple full answers, repeated hidden full texts, or a new registry. Schema/Projection changes remain governed by their existing Content/Runtime owners; this preparation rule does not authorize them.

### 3.1.1 Canonical prepared chapter package — Chat consumes, not regenerates

For a chapter to be called **prepared for continuous Chat learning**, its existing Politics learning owner must already contain or resolve one coherent teaching package, and the owning subject must already expose a stable total model that locates the chapter. This is a set of content jobs around the same chapter/NU owners, not a new hierarchy, registry or frozen transcript.

The package must provide, for the chapter's actually admitted scope:

1. **Fixed mother model / reconstruction spine.** The canonical chapter framework and stable learner index under §0.5.
2. **Progressive first-learning route.** A reviewed **problem-driven dependency route** under §0.6 that says how the chapter is unfolded after orientation. It may use several natural teaching batches, but a batch is defined by the problem it resolves and the next question it creates—not by “read the next N spine nodes.” Each prepared stage must have a stable recoverable identity (label/anchor or equivalent), the fixed-spine nodes/content range it ultimately fills, and its intended next problem/closure. A fresh Chat must be able to resume the same argument without re-cutting a long teacher text or reciting the reconstruction index as a lecture outline.
3. **Substantive teaching content.** The actual explanations, examples, conditions and Source-backed detail needed to teach each stage. A heading list, A/B/C inventory or Source locator alone is not the lesson asset.
4. **Confusable / boundary pass.** A prepared set of high-value misconceptions, option boundaries and near-neighbor distinctions after the relevant content is understood. This may live in the same teacher brief/support objects; it must be recoverable as a deliberate teaching job rather than reconstructed ad hoc from question options.
5. **Same-model compression.** The reviewed chapter reconstruction using the same fixed spine, progressively thinner than first teaching without changing the learner index.
6. **Precision / Memory handoff.** Reviewed exact-retention targets with clear prompts, authoritative answers, checking criteria, optional memory aids, Source/admission basis and consumer mapping under §3.2/§6.1.

The package may be realized by the existing chapter JSON, teaching brief, support objects and optional `*.memory.json`; no particular file split is required. A chapter-level `content_support.active_precision` realization is valid when it satisfies the same requirements. Do not create a sidecar merely for symmetry.

This rule applies to every chapter across all five Politics subjects. Reuse existing Current Knowledge, teaching, reconstruction and precision assets within their accepted scope, together with the bounded review evidence already earned; a partial package does not reset mature components or revoke existing base first-round PASS. Prepare or calibrate only the missing, stale or defective parts, reconciling them in the original owners around the same canonical spine rather than rebuilding the chapter or creating another Memory set. Reviewed candidate assets remain candidates until adopted through the existing review/admission path; then consume the resulting Current package. Candidate presence, partial maturity and base first-round PASS do not by themselves prove completion of the six-part package or Website delivery.

**Fresh-Chat consumption rule:** when a Current prepared package exists, Chat must read and teach from that package as the learner-facing semantic authority. Chengfeng/other Source remains the factual basis and calibration/repair authority, but Chat must not bypass the prepared package and independently regenerate an alternative mother model, fill order, confusion summary, compression or Memory set from raw Source. Wording, examples and local pacing may adapt to the conversation; the owned model, stage scope, decisive relations, boundaries and exact targets do not drift casually.

A fresh Chat should therefore be able to recover:
```text
where the learner is in the fixed chapter model
→ which prepared teaching stage comes next
→ the owned explanation/detail for that stage
→ the prepared confusion/boundary pass when timely
→ the same-model compression
→ the reviewed precision/Memory handoff
```
without reconstructing the course from Source or old conversation history.

If the prepared package is missing, partial or stale, preserve that as a Content limitation. **Do not block ordinary learning merely because preparation is incomplete.** Chat may still teach from the best accepted Current assets and Source as a session-local provisional explanation, while preserving any existing stable subject/chapter spine. It must not present that provisional route as the durable canonical package or silently persist a competing framework. Repair the existing Content owner before claiming cross-Chat reusable preparation.

### 3.2 Model-to-memory preparation completion

The completion boundary for the integrated capability is **teach → encode → retrieve → diagnose**, not teacher-prose completeness alone. Earlier bounded teaching reviews remain evidence for the scope they actually inspected; they do not automatically certify this additional scope.

Use the existing chapter/NU owners, A/B/C dispositions and content hierarchy. Understanding and exact retention may overlap on the same object; “can be reasoned out” does not by itself exempt an exam-required exact relation from practice. Do not add parallel tiers, a second textbook or a new Memory registry.

For the reported usable chapter scope, provide substantive content for:

1. **Teaching consumption.** State the first-explanation route, its necessary prerequisites and decisive in-place boundaries; give exact destinations for later B supplements. Do not make the next Chat choose between reading the full teacher brief verbatim and inventing a new lesson. Keep optional warnings out of the main explanation unless their misunderstanding would break the model or an imminent whole-item discrimination.
2. **Same-model reconstruction.** A compact recovery route must expand to the same explained relations, directions, conditions and scope. It is not a second unrelated summary.
3. **Exact target coverage.** Identify the actual fixed statements, lists, identities, pairings or boundaries to retain, with Source and admission basis. Distinguish conceptual paraphrase, complete list membership, exact object/role pairing and source-required fixed wording. Order is compulsory only when the Source/task makes order meaningful. “C: hats/lists, return to book later” is a locator, not a completed precision deliverable. Sparse means nonredundant, not an arbitrary small quota or omitted required targets.
4. **Memory encoding.** For each justified target/group, supply a useful grouping rationale, contrast, retrieval cue, mnemonic or contextual association when it lowers effort. No forced mnemonic for a simple point. Mark teaching aids as aids, not authoritative answers. They must expand back to the approved target without inventing causes, reversing roles, dropping members or deleting decisive qualifiers.
5. **Retrieval and checking.** Supply a self-contained prompt, an exact answer/reference and the essential pass/omission/confusion criteria. Show where supported paraphrase is allowed. A chapter title or a generic “boundary” label is not a sufficient prompt for several different tasks. Test an unaided retrieval before providing an optional cue; a cued correction is repair evidence, not a fresh independent success.
6. **Consumer mapping.** Reuse or repair existing chapter precision groups / `*.memory.json` candidates before adding a new item. Locate the accepted content ID and model/Source explanation, or explicitly report why it is not yet catalog-selectable. New teaching wording must reconcile dependent old Memory wording; do not leave Chat teaching one answer while the Website recalls another. Exact realization follows CONTENT_SEMANTICS_CONTRACT.md §3.2.

The existing three review passes in §3.1 must now inspect these deliverables as part of coverage, continuity and compression fidelity. Independent textual attacks include a missing approved target, a vague prompt with two possible answers, a mnemonic that cannot recover the whole answer, and an old/new exact-wording conflict. Extend the existing bounded review result, do not create a parallel QA ledger.

Before scaling, prove two materially different shapes: a Marxism relation/boundary unit and Ethics-Law C06 list/role grouping. The author directly reads/writes the substantive material; mechanical extraction, formatting and checks may be batched, but unreviewed Work-generated prose is not a substitute. Validate the useful shape, then complete every subject's actual admitted scope; a sample passing is not five-subject completion.

A rule/content review, a catalog/plan test, a rendered candidate and real learner performance are separate claims. No website-consumer claim passes from a file count or CI alone. No real learner records may be fabricated during preparation or self-test. Tests use isolated fixture storage, and unavailable Source/consumer/independent-review evidence remains a scoped blocker. Kian is not required to perform chapter-by-chapter preparation QA.

## 4. First-round interaction principles

- **Score/time first:** the shortest path that preserves exam-relevant understanding, discrimination and transfer beats a richer path with no demonstrated score benefit.
- **One mainline only:** Chat carries continuous teaching; Chengfeng and Suyi remain source/reference inputs, not parallel courses.
- **Source calibration:** return to original Chengfeng images/text when necessary for exact wording, relations or boundaries; preserve source locators without requiring a second course.
- **Low friction:** stable correct understanding should pass quickly. Extra content appears only when it adds value.
- **Content-rich, display-precise:** backend source/learning assets may be rich; each learner surface should show only the current cognitive action it actually owns.
- **Progressive disclosure:** explanation, boundary, source evidence, and repair depth expand only when needed.
- **Smallest sufficient repair:** Wrong/Uncertain first records Evidence and permits continuation. When the learner elects a source return or batch Review/Chat determines repair is warranted, choose the shallowest repair that resolves the real failure; a Wrong/Uncertain event alone is not an immediate source-switch command.
- **Repair depth matches failure depth:** a hat/wording confusion should not reopen an entire Natural Unit; a broken concept relation may reopen a Teaching Bridge; a broken unit model may reopen the Chat model explanation with calibration against the owning Chengfeng Source.
- **Question-bank subordination:** question counts, unlock counts, and coverage must not dominate first-round attention hierarchy.
- **Precision at the right time:** first-entry display is not a memory wall. Approved first-round exact targets are proactively taught, encoded and rehearsed; the remaining systematic precision baseline is scheduled when phase and prerequisites make it useful. Neither “wait for Wrong” nor “memorize all C immediately” is the default.
- **No mandatory ritual:** Orientation, Recall, closure, source handoff and UI state transitions are tools, not ceremonies. Skip or compress them when they do not materially improve retrieval or transfer.
- **No learner-facing scheduler internals:** fixed labels such as D1/D3/D7/D14 are not an active Politics learner contract. Review should present useful tasks and reasons, not scheduler implementation details.

## 5. Xiao1000 verification, backside Content, and batch review

Xiao1000 appears in the **single KianOS Politics Workbench** after the relevant Natural Unit / natural subsection has been learned and coverage satisfies whole-item first-ready requirements. Chat explanation alone is not evidence of learner coverage or completion.

First-ready means the **whole item** can be judged from already learned Current content, including decisive distractor boundaries; a current-unit hit or a correct-option match alone is insufficient. An embedded checkpoint must defer a question when its remaining option discrimination needs later Source. Source ownership, first-ready timing, and actual learner completion are separate facts.

The Workbench owns the learner's question-attempt interaction, first-attempt Evidence, Uncertain/cause/note/favorite/discussion signals, fast continuation, and submitted backside. It does not own Xiao1000 Source Truth and does not use Xiao1000 to organize first learning.

The submitted backside is **Content**, not an on-demand Chat interaction:

```text
question_id
→ takeaway                 prebuilt refined Content
→ refined explanation      prebuilt refined Content
→ Current Chengfeng locator/reference
→ learner cause / note / signals
→ next question by default
```

For stable correct:

`✓ → continue cheaply`

For Wrong / Uncertain:

`show the same prebuilt backside Content → record learner Evidence/cause/note → optional Chengfeng reference/return → continue`

Wrong / Uncertain does **not** automatically open Chat, force source repair, or insert a diagnosis ceremony between questions.

When the learner chooses to review a batch:

`accumulated W/U + learner annotations → Review packet → Chat pattern diagnosis → smallest justified follow-up`

That later follow-up may be no action, one source return, a boundary/relation reconstruction, a Memory/Precision admission, a retest, or a durable Content correction. Chat should compress many question events into the fewest real underlying problems rather than re-explain every question.

Do not create a second inline Xiao1000 attempt surface inside Politics learning pages. Learning pages hand the exact Natural Unit to the formal Workbench.

### 5.1 Question-repair semantic authority

Question Repair must preserve the distinction between **question provenance** and **semantic authority**. Freeze the default source priority as:

1. Current `politics_unified_regions` and approved continuous Natural Unit ownership;
2. Xiao1000 original stem/options/official answer/original explanation;
3. Chengfeng `source_node_registry` source text;
4. Suyi or another explicitly approved support source;
5. legacy `question_knowledge_links` as provenance/audit evidence only.

Legacy `question_knowledge_links` must never override Current Unit ownership, create a new tested node, or make an old mapping semantically authoritative merely because the row exists.

A question may test more than one knowledge node. Repair therefore distinguishes:

- `current_unit_hits` — the part being learned/repaired in the current Natural Unit;
- `cross_unit_hits` — legitimate other knowledge hits in the same question that must not be pulled into the current Unit's teaching content merely because the option exists.

When batch Review/Chat determines that repair is actually warranted, repair the **current-unit failure** first. Cross-unit hits are retained as evidence/context, not used to inflate the current Unit.

## 6. Review / Memory / Analysis Output / Mock

Review is evidence-driven and may use elapsed time, but no fixed Politics cadence is frozen as learner-facing truth.

Later review may include:

- short NU recall;
- Unit / Block / Chapter reconstruction;
- boundary / hat / list / timeline / identity recall;
- wrong/uncertain question retest;
- exact source repair;
- later precision-memory work;
- analysis-answer framework / material-to-principle output practice;
- timed Mock transfer.

The learner should see **what to do and why**, not scheduler internals.

### 6.1 Memory admission: proactive precision with source-bounded scope

Politics teaching projection may synthesize, reorder, and explain source material when that improves understanding. Durable Memory/Precision has a stricter rule:

`NO SOURCE SUPPORT → NO MEMORY ADMISSION`

A rich explanation, a useful analogy, or a Chat-generated relation is not by itself a reason to create future review debt.

Memory candidates should preferentially come from a **designated memory source/handbook** when one is available and approved for the learner. The designated source is a memory-admission/cross-check source, not a replacement continuous course. If that source has not been bound or inspected, mark handbook alignment as pending; never claim that a point appears there from model memory.

There are three independent admission routes. An author-reviewed, source-grounded target may be selected for durable practice when at least one applies:

1. **Proactive baseline:** an approved designated memory/analysis-output source confirms the fixed target, or the original Current Content owner explicitly reviews and selects it as `FIRST_ROUND_EXACT` on inspected current Source support. The latter is a recorded Content judgment about a specific target, not an automatic promotion of all teaching C items;
2. **Individual gap:** Wrong/Uncertain evidence shows that exact retention of this source-grounded boundary/hat/list/identity/timeline/legal wording is needed; or
3. **Output requirement:** the later analysis-output phase requires that exact source-grounded formulation/framework for reliable written production.

Route 1 does not require a previous Wrong/Uncertain event. The approved baseline must be prepared and covered systematically; real performance adjusts timing and repair, not whether source-approved targets exist. First-round-selected exactness and later full output wording must remain distinguishable.

For Chengfeng/Leg reconciliation, retain the owning NU, inspected passages/pages, edition, exact supported wording, useful retained memory organization, material differences and unresolved scope in the existing Content/provenance owner. Reuse duplicate content; do not silently choose the convenient wording. Historical LEG26 alone does not authorize 2027 fixed wording. An independently Current-supported first-round selection may use route 1 after explicit Content review, without claiming uninspected 2027 handbook confirmation. Current-year/high-change/legal items remain gated to their inspected scope. A stale item blocks dependent targets, not unrelated stable material.

Keep separate: prepared target → reviewed admission basis → catalog-selectable content → authorized learner plan → matching application receipt → observed Recall. These are semantic distinctions, not authorization to add Runtime enums or a second admission ledger. Candidate presence is not admission. Before plan selection, Chat checks the actual admission basis, phase/prerequisites and current content revision; structural plan validation alone is not that semantic review.

Default non-admission cases include:

- explanation richness alone;
- a single stable correct answer;
- a broad conceptual relation that is better reconstructed than memorized and has no approved exact-retention requirement;
- AI-generated extensions without explicit source grounding.

Precision is narrower still. A question may produce conceptual repair without producing any Precision candidate.

Optional chapter-level `*.memory.json` sidecars may hold source-grounded, nonredundant candidates. Reuse Current precision groups where adequate; add sidecars only for an actual target not safely represented there. Systematically cover the approved exact scope without requiring a file/card quota for every chapter. Teaching aids and exact answers must remain distinguishable.

Memory uses the existing candidate catalog and control path. `politics.memory_plan` selects only existing `candidate_id` values bound to the current `catalog_revision`. A new source-supported card requires review and admission by the original Content owner. The typed Review action `MEMORY_CANDIDATE` is only a follow-up suggestion; it does not create or admit a catalog card, automatically enter a queue, or schedule SRS. Actual matching `APPLIED` receipts prove plan application only; actual Recall evidence proves the observed recall. Chat explanation alone proves neither learning completion nor queue admission.

### 6.1.1 Cross-day Memory evidence profile

Politics Memory scheduling remains **Chat-owned**. The Website records exact Recall evidence and may export a bounded cross-day profile so a fresh Chat does not forget yesterday's `FORGOT / FUZZY / STABLE` history.

This profile is evidence compression, not a scheduler and not a second learner ledger.

Hard rules:

- raw Recall events remain private learner truth;
- Current Memory candidate catalog remains the semantic owner of what can be selected today;
- an old event may inform Current planning only when its candidate still exists **and** its saved candidate snapshot still matches the Current candidate;
- a global catalog revision change alone does not erase unchanged candidate evidence;
- deleted or semantically changed candidates become stale/history-only and must not silently select a Current task;
- the Daily Packet carries only bounded unstable/current-state summaries, a bounded stable sample and bounded recent events; overflow counts remain explicit;
- `FORGOT / FUZZY / STABLE` are Recall evidence, not mastery labels;
- elapsed time may be exposed as a fact, but Politics does not freeze a D1/D3/D7 learner-facing cadence;
- the profile may not create `due`, `next_review`, mastery scores or priority scores;
- Chat chooses today's Memory items from admitted Current candidates using the approved baseline, phase, prerequisites, real learner evidence and current study needs; no Wrong is required for an approved proactive target;
- no historical Memory evidence can authorize unsupported analysis-output/current-affairs recitation before the required later Source is actually available.

The intended loop is:

```text
private full Recall history
→ Current-bound bounded Memory profile
→ Daily Learning Packet
→ Chat chooses today's small Memory plan
→ Website executes
→ new Recall evidence returns
```

This closes cross-day continuity without turning the Website into an autonomous spaced-repetition scheduler. `STABLE` is the learner's reported recall result, not automatic objective marking or permanent exemption. Chat may choose a later sample based on phase and retrieval need. A model failure calls for explanation; an exactness failure calls for encoding/retrieval; successful recitation but failed application calls for transfer practice. None implies a compulsory new card. No active Chat or explicitly created automation means no ongoing scheduling work.

### 6.2 Analysis-output is a separate score channel

First-round understanding and Xiao1000 performance do not by themselves prove that the learner can produce high-scoring analysis answers.

Later analysis preparation must deliberately train:

```text
material cue
→ identify owning principle / political position
→ choose a small answer framework
→ retrieve source-grounded formulation
→ connect formulation back to the material
→ produce complete time-bounded prose
```

The later phase may proactively admit source-grounded formulations from an approved recitation/current-affairs source even before a Wrong event, because written production has different retrieval requirements from multiple-choice recognition.

Do not import the full later recitation burden into first-round Chat teaching merely to feel safe.

## 7. Astro boundary

Astro renders and interacts with Current assets **only for learner actions assigned to the Astro surface by this Learning Contract**.

For Politics first-round learning, appropriate reusable primitives include:

- orientation;
- current Natural Unit / source locator;
- external-primary study checkpoint / return;
- short closure cue;
- recall / reveal when approved;
- Xiao1000 question attempt;
- wrong / uncertain marking;
- minimal source-repair excerpt / exact source jump;
- highlight / note / next when they serve an approved Astro-owned action.

A generic `continuous source reader` capability is **not** a Politics first-round primitive for Chengfeng. If shared runtime contains such a component for another lane or reference mode, Politics must not use it to create a second continuous course alongside Chat.

Astro must not hard-code political knowledge that belongs in `content/politics/`.

If a better explanation, orientation, bridge, boundary, or compression can be expressed as content, update the natural learning owner rather than embedding it in a page component.

## 8. Private interaction state

Current content is learner-independent. Answers, progress, wrong/uncertain history, timing, notes, highlights, last external-source position, and similar private state may exist in browser/session/device storage only when it materially improves learning. It is not shared Current authority.
