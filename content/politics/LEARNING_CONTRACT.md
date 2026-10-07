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
   Use Chengfeng for detailed first study, Chat for requested clarification and source-faithful compression, and Xiao1000 as transfer evidence. Select long-term exact targets under §6.1, not from the volume of teaching material. Model construction and systematic precision are complementary; heavy later-phase answer-template memorization is out of scope here.
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

#### 0.4.1 Incremental learner compression

The learner-facing realization of this principle is owned once by §0.7 **Three-layer learner compression**. §0.4 defines why compression exists; §0.7 defines how it is built, checked and reviewed. Do not maintain a second competing copy of the same rules here.

### 0.4.2 Content is the finished learning product — Chat and Website are consumers

Politics **Content is the canonical learner product**, not a staging format for Chat, a mirror of a teacher brief, or a shape chosen for Website convenience.

For an accepted scope, the existing Content owners must already determine the learner-facing cognition:

- where the chapter / Natural Unit sits in the subject model;
- the canonical main model / relation topology and decisive boundaries;
- the Core explanation needed to understand those relations;
- the node **main prompts** that compress selected model-bound memory under §0.7;
- the residual Precision / Memory that is worth exact retrieval but does not belong in those prompts;
- the owning Source identity, applicable scope and unresolved gaps.

These jobs may live across the existing chapter JSON, subject model, brief/support and precision owners. This rule does **not** require one giant file, a new schema or a new registry. It requires that the semantic result be complete upstream of its consumers.

Authority direction:

```text
Source Truth
→ Learning / Content judgment
→ canonical Politics Content
   ├─ model + relations
   ├─ Core / boundaries
   ├─ node main prompts
   ├─ residual Precision / Memory
   └─ Source scope / gaps
→ consumers
   ├─ Chat: explain, question, compress, repair
   └─ Website: present, retrieve, record evidence
```

Chat may change wording, pacing, examples and questioning. Website may change layout, interaction and retrieval mechanics. **Neither consumer may invent a durable alternative model, decide what belongs in a node prompt, promote a detail into long-term Memory, or force Content to change its learning semantics because of a renderer/runtime limitation.**

If valid Content cannot be represented by a consumer, fix or limit that consumer; do not distort the Content to fit it. If the Content itself is wrong or incomplete, repair the original Content owner once and let both consumers inherit the correction.

Content completion and learning quality are therefore judged independently from Website delivery. A Website PASS cannot make incomplete Content complete, and a Content correction does not require duplicating the same semantic edit in Chat prose or frontend literals.

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

This section applies when Kian asks Chat to explain or teach. It must not turn a source-summary/review request into another first lesson; the default surface division is §2.

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

**主模型帮助理解并承载成组记忆；主提示压缩模型内部值得记的内容；Memory 承接其余值得独立滚动的精确碎片。** 这是同一份经筛选学习内容的分工，不是“理解一套、再背整套卡库”。

1. **Chapter mainline / 主模型：**保留乘风的核心问题、关系、层级、必要条件和判断边界。它既让人理解整章，也为需要保留的知识提供稳定的记忆位置。
2. **Main prompts / 主提示（原 expansion cues）：**将已经判断值得记、且能自然依附于模型节点共同回忆的内容压成短提示。它不是所有分支的目录，不是 Chat 新增的理解问题，也不是网站卡片清单。
3. **Precision / Memory：**经同一必要性筛选后，不适合随主模型高效恢复、适合独立精确练习的剩余内容。零碎、精确或被主线省略，本身均不等于值得背。

详细解释、例子和查阅材料仍留原讲义/既有 support，不成为第四套必学材料。理解可以来自 Kian 自己学习乘风，不要求先听一遍 Chat 教学。

### Classroom priority override — teaching beats compression

请求解释时先解决疑问；请求压缩时直接提供压缩，不重新授完整课程。内容筛选、主提示设计和保存不得变成逐段仪式。

#### Build compression from learning, not instead of learning

先读实际乘风正文及必要图表，建立或复用有来源的主模型；再按 §6.1 判断哪些知识值得保留、需要何种准确度；最后才决定记忆放在哪里：

```text
乘风主模型 + 经来源/考试用途核定的记忆需求
→ 能自然挂入模型，并随节点一起恢复：节点主提示
→ 值得精记但随模型恢复成本高：独立 Precision / Memory
→ 只需理解、识别或查阅：正文 / 原讲义 / support，不强制主提示或背卡
```

**先判断值不值得记，再判断能不能随模型记。** 腿姐材料的必要性筛选同时约束模型内记忆和模型外碎片；不能只筛网站 Memory，却把所有乘风列表换个名字塞进主提示。具体指定材料、版本及现有条目过渡规则由 §6.1 单独拥有。

保留乘风术语、知识组织、决定性关系和范围。既有模型用于关系/覆盖校验，教案用于后台查漏和有据纠偏，均不替代乘风正文。删除重复讲解、例子堆积、教师话术和 Source QA；不以短为由删掉推理必要条件，不将说明用的比喻/临时归纳变成额外记忆对象。

主提示的短措辞可以由 Chat 压缩；其成员、分类、数量、关系必须能回到实际来源。第一次阅读时，邻近正文要给出对应的完整答案及关系；以后缩影只留不泄露答案的提示。不得编造“3原则/5作用”或需要另背码本的暗号。识别/判断即可的点，不因写成带数字提示就升级为闭卷列全或逐字背诵。

**Expansion cue ≠ Memory index.** 主提示是模型内记忆的压缩入口，不是与记忆任务无关的泛泛索引，也不由现成卡库倒推。无对应网站卡不妨碍经筛选的知识挂入模型；有对应网站卡也不要求两边常规重复刷。纯理解关系保留在正文，不为格式对称强造主提示。

#### Four local compression checks

1. **模型：**去掉主提示以后，主线仍能重建整章的问题、关系、条件和方向吗？
2. **提示：**每个提示指向来源支持、确有保留价值的模型内知识吗？首次答案是否明确、数量真实、回忆深度适当？
3. **分工：**模型内成组记忆与独立精记合起来覆盖经筛选的保留目标吗？是否漏掉必要目标，或把同一组无理由安排两遍？
4. **去向：**未入两种记忆路径的内容是否仍在原讲义/support或明确 Source gap？不得把所有删项转成记忆债。

#### Chapter closure compresses the model already learned; it does not invent a second course

沿实际学习范围及已接受措辞去重、核对、变薄，不换一套知识地图。用户明确委托时可先做小样或较大范围草稿；草稿不等于已经学过、已经接受或已筛出必背内容。不无授权批量重生全科。

#### Progressive review ladder — model first, cue second, precision last

沿主线恢复关系，走到节点时用主提示主动恢复该组记忆，再以独立 Memory 补齐另一部分需精确提取的内容。这是注意顺序，不是反复点击/折叠的要求。阅读正文可同时解释提示和答案；只有 clean Recall/做题时才在作答前隐藏答案、核对标准和泄露答案的助记。

模型不懂就局部解释；模型内成员忘了就沿节点修补；孤立精确错误才用针对性练习。模型内某点有真实反复混淆时，可复用其既有身份作临时独立加练，但不默认复制成第二套常规任务。

#### Fragment integration

两种记忆路径复用原 chapter/NU/Content 身份。独立碎片仍保留概念归属，但“有归属”不等于必须塞入主提示；选择的是最省回忆成本的承载方式。不得把新的分工变成新 schema、registry、卡库或自动排程。

#### Personal quick-review view

接受后的源本压缩保存在既有章节 brief/support 中同一位置；修改该视图而非另建版本体系。旧卡、原答案和 Recall 历史不因重分流被删除。内容写入不等于网站已更新、计划已执行或学习已完成。

## 1. Product model

Politics follows the repository-wide causal chain:

`Source Truth → Chat semantic/learning judgment → GitHub Current content → approved learner surfaces → learner`

Politics should optimize the learner's actual study path, not maximize visible metadata, governance, page count, or the amount of source material rendered inside Astro.

Hard Politics surface rule:

```text
Source ownership ≠ Surface ownership.
Chengfeng Source ownership ≠ Chat teaching surface ownership.
```

The current default is Chengfeng-led detailed study with Chat clarification, compression and selective memory encoding. Surface roles are owned once by §2; a prepared Chat lesson remains available on request, not an obligatory replacement course. A policy change alone does not prove Website delivery.

## 2. Active first-round learning chain

Current learner choice (2026-10-07): **Chengfeng detailed study → source-faithful model + selectively retained model-bound main prompts, complemented by residual Precision / Memory; Xiao1000 verification and local repair alongside this path.** The division is owned by §0.7 and the necessity filter by §6.1.

Kian learns the detailed content from Chengfeng lectures/handout. Chat primarily answers a specific confusion and produces a high-density review of that source: main relationships, decisive exam distinctions and expansion cues. Do not replace that request with a second Chat course or summarize the teacher brief as though it were the handout. Chat teaching remains available when explicitly requested.

This is a division of jobs, not a required one-sitting sequence. Source study may finish outside Chat; do not demand reteaching, a completion form or a test before helping with review. Do not infer study completion from the existence of a source, HTML, teacher brief or catalog.

Preserve Chengfeng Natural Unit identity, boundaries and source hierarchy. Existing subject/chapter models remain useful relationship/completeness checks, not a reason to force source content into a conflicting model. If a real model conflict is found, flag it and repair the original owner explicitly; do not quietly invent a replacement. Politics does not import Xizong System/LG/KP taxonomy.

### Source roles

- **Chengfeng:** detailed-study and compression basis. Read the actual requested text and necessary tables/images; preserve its organization and terminology. Source nodes/locators locate evidence but do not replace missing full text.
- **Existing model / teacher preparation:** backstage relationship, omission and boundary checks; reusable support for requested explanation. Prepared prose is not the compression mother text and old exact inventories are not the retention decision.
- **Suyi:** optional structural/reference support, never a second required course or silent replacement of Chengfeng framing.
- **Designated Leg retention source:** Kian currently designates **2027 腿姐《冲刺背诵手册》** as the retention source for deciding what is worth active recall and at what depth. Use the actually inspected current-year upper/lower volume passage; do not substitute a different teacher/book or infer priorities from title alone. The 2027《背练结合自测本》 may support Recall/self-test design and salience cross-checking, but does not replace the retention-source judgment. Selection follows §6.1; neither a union nor a mechanical intersection of books is a retention syllabus.
- **Xiao1000:** original questions/answers and transfer/error evidence, not the source of chapter order or an automatic card generator.

### Surface roles

| Learner action | Primary surface | Companion / boundary |
| --- | --- | --- |
| Detailed first study | **Chengfeng lecture / original handout**, in the learner's chosen reader | Chat explains an actual question on request; no mandatory second course |
| Orientation / chapter compression | **Chat and the accepted quick-review view** | Source-faithful model + useful cues; first cue answers explained in reading content; §0.7 |
| Selective memory encoding | **Chat / existing Content** | Resolve the exact Leg basis and required recall depth; useful grouping/contrast, not a list of everything precise |
| Self-selected exact practice | **Website Memory workspace** | Permanent entry; select subject/chapter or all currently source-reviewed cards without a Chat day plan. Optional access is not a recommendation to memorize all cards |
| Planned exact retrieval | **Website Memory workspace** | Optional Chat plan through the existing path, never a prerequisite for self-selected practice |
| Xiao1000 verification and backside | **Existing KianOS Workbench** | Original question/answer truth; reveal explanation after submit and record actual evidence |
| Wrong / Uncertain and batch Review | **Workbench / Review → Chat** | Learner-triggered local repair; a mistake does not automatically create Memory debt |
| Resume / source locator | **Existing native records + reported source-study position** | Missing browser evidence is not zero learning; no invented progress |

The free-practice change removes plan dependence, not source-fidelity checks. Pending/unreviewed/unsupported content remains excluded. Reuse the current Memory content IDs and evidence path; no second catalog, autonomous scheduler or automatic enrollment. Implementation and real page acceptance must be verified separately from this contract.

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

This section owns preparation quality for Chat teaching content under `content/politics/learning/`; it is not learner progress, a new schema, or Website acceptance. Priority is **source fidelity and relevant coverage → coherent relationships → lower review cost**. Completeness of backstage support is not a demand that every fact be memorized or re-explained to the learner. Preserve the five subject shapes in INTERACTION_CONTRACT.md §4; do not import Xizong KP scaffolding.

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

**Fresh-Chat consumption rule:** first resolve the requested action under §2. For source-based review/compression, Chengfeng is the direct basis; existing models and teacher preparation are backstage checks, not replacement mother text. For an explicitly requested Chat lesson, reuse the relevant prepared explanation and route where still sound. Preserve stable identities and valid relationships; do not regenerate the existing knowledge set or infer study/retention duties from preparation. Old precision inventories require the current §6.1 selection judgment before being presented as a must-retain baseline.

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

The completion boundary is **understand the source → recover its model → encode justified exact targets → retrieve → diagnose**, not teacher-prose completeness alone. Understanding can come from Kian's source study; a compulsory Chat lesson is not part of this gate. Earlier bounded teaching reviews remain evidence for the scope they actually inspected; they do not automatically certify this additional scope.

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

**Source correctness and memory necessity are different judgments.** This necessity filter applies to BOTH model-bound main-prompt content and standalone Precision / Memory. A precise date, complete list, book table, useful cue or previously reviewed card is not, by itself, a reason to spend future review time. After necessity and required accuracy are justified, §0.7 assigns the content to the model or to residual independent practice; putting a list in a prompt must not bypass this filter.

`NO SOURCE SUPPORT → NO MEMORY ADMISSION`

The default long-term retention baseline, including model-bound memory as well as independent fragments, is selected from the **actually inspected 2027 腿姐《冲刺背诵手册》 passage**, reconciled with Chengfeng-owned knowledge. The current-year source is available and is the designated retention source; the 2027《背练结合自测本》 is auxiliary Recall/self-test evidence, not a substitute baseline. Presence/emphasis in a book is a selection input, not proof every sentence needs verbatim recall.

For each proposed group, the existing Content/review owner must justify what exam job exact retention protects and the needed depth: recognition, conceptual paraphrase, complete membership, exact pairing, or genuinely required fixed wording. Preserve meaningful grouping and explain the first answer. Do not require unaided enumeration/recitation where source use only needs recognition or option discrimination. Use original prompts, answers, checking criteria and useful memory aids; no forced mnemonics.

Three routes remain, with the first deliberately narrowed:

1. **Proactive baseline / `FIRST_ROUND_EXACT`:** the resolved Leg passage supports the target's retention value, Chengfeng/current source supports its meaning, and the Content owner records the specific necessity and required accuracy. A Chengfeng-only author choice is **not a substitute** for this baseline filter. A chapter C label, a precise table, a cue, a card count or a review hash cannot grant that necessity.
2. **Individual gap / `INDIVIDUAL_GAP`:** real Wrong/Uncertain or persistent difficulty justifies exact retention of a source-backed point. Diagnose a model/transfer problem first; not every error becomes a card.
3. **Output requirement / `OUTPUT_REQUIREMENT`:** an applicable later output task and inspected source justify the exact formulation. Do not move later recitation wholesale into first-round study.

Use existing review/provenance and card owners to record the relevant Leg title/edition/pages, Chengfeng support, retention rationale, required accuracy and unresolved differences. Do not add another registry or second answer set. A historical Leg edition may inform stable target selection when its exact role and current corroboration are recorded; it cannot alone authorize current-year wording, law or facts. A source mismatch is item-scoped, not a reason to stop unrelated compression.

If the designated source is missing/uninspected, **do not invent the baseline or declare it Leg-filtered**. Continue source-model compression; label any worked encoding/main-prompt or fragment-disposition example as provisional, not a recommended must-retain syllabus. Leave necessity selection pending. Resolve available Project/Library/source records before asking Kian to resend a known file. Do not assume that a missing repository binding proves a file does not exist elsewhere.

Existing source-reviewed CF-only cards and their histories are preserved as **optional practice/reference**, not retroactively renamed Leg-selected must-memorize content. Reconcile their necessity in the original owners before recommending them as the new routine baseline. No mass deletion, relabeling of historical evidence or compulsory regeneration follows from this policy change.

Free access and recommended burden remain separate. Kian may select any currently source-reviewed card/range for voluntary practice without a day plan; browsing, opening an answer and choosing a range do not prove learning or mastery and do not schedule future work. The explicit request to free Memory does not authorize pending, unsupported or unreviewed content.

Reuse the existing catalog and evidence path. Optional `politics.memory_plan` selects current IDs/revisions; it does not create new answers or become the only entry. A typed `MEMORY_CANDIDATE` is still a suggestion, not admission. Only an actual application/readback proves application, and only actual learner actions become Recall evidence. A rule update alone does not prove the Website implements free practice.

### 6.1.1 Cross-day Memory evidence profile

Adaptive scheduled recommendations remain **Chat-owned when requested**; user-initiated free practice under §6.1 does not require such a schedule. The Website records exact Recall evidence and may export a bounded cross-day profile so a fresh Chat does not forget yesterday's `FORGOT / FUZZY / STABLE` history.

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
→ Kian chooses a practice range, or requests a small Chat plan
→ Website executes the chosen practice
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

A generic `continuous source reader` capability is **not** a Politics first-round primitive for Chengfeng. If shared runtime contains such a component for another lane or reference mode, Politics must not use it to create a second required course. An explicitly requested source-faithful quick-review HTML is a reading projection, not a new textbook or source owner.

Astro must not hard-code political knowledge that belongs in `content/politics/`.

If a better explanation, orientation, bridge, boundary, or compression can be expressed as content, update the natural learning owner rather than embedding it in a page component.

## 8. Private interaction state

Current content is learner-independent. Answers, progress, wrong/uncertain history, timing, notes, highlights, last external-source position, and similar private state may exist in browser/session/device storage only when it materially improves learning. It is not shared Current authority.
