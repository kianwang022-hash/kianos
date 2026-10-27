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
   Follow the current learner action and surface roles in §2; use Xiao1000 as transfer evidence. Select long-term exact targets under §6.1, not from the volume of teaching material. Model construction and systematic precision are complementary; heavy later-phase answer-template memorization is out of scope here.
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
   ├─ fixed reading edition: first study and same-model review
   ├─ Chat: discuss, explain and plan from actual learner evidence
   └─ Website: question/practice attempts, submitted feedback and real records
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

Subject shape remains local: Marxism normally freezes a reasoning/relation chain; History one subject-wide timeline connecting stage problems, forces/roads/choices, consequences and the next stage, with chapter events and cross-period topics returning to that same axis rather than a date list or chronology mistaken for causality; Mao a historical problem→theory response→position chain; Xi a stable hierarchy/role map; Ethics-Law a stable concept/normative/application scaffold. “Fixed” means stable cognition for that chapter, not one universal Politics template.

Acceptance test: two legitimate reviews of the same unchanged chapter may differ in detail density, but the learner must be able to recover the same canonical relations without rebuilding a new index. A Kian self-use quick-review view may visually group adjacent canonical nodes or use fewer learner-facing lines when the mapping remains clear; the canonical spine then acts as the completeness validator, not a demand that the personal review display copy its node count or wording.

### 0.6 First teaching is problem-driven — the spine is not a lecture outline

This section applies to Chat teaching selected under §2. It must not turn a source-summary/review request into another first lesson.

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

固定阅读稿从现有 Content 的解释、模型、主提示和必要精记投影，供初学与复习；原讲义/既有 support 保留校准和按需查阅，不成为第四套必学材料。阅读不要求先听一遍 Chat 教学。

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

**先由 §6.1 判断掌握要求与准确度，再判断能否随模型高效恢复。** 此规则同时约束模型内主提示与独立精记；不能把未经判定的所有乘风列表换名塞入主提示，也不能把未入精记的必要理解一律称为可选。必背/次级不是主提示/精记的同义词，Core 不等于可选。具体材料、准入和旧对象过渡只由 §6.1 拥有。

保留乘风术语、知识组织、决定性关系和范围。既有模型用于关系/覆盖校验，教案用于后台查漏和有据纠偏，均不替代乘风正文。删除重复讲解、例子堆积、教师话术和 Source QA；不以短为由删掉推理必要条件，不将说明用的比喻/临时归纳变成额外记忆对象。

主提示的短措辞可以由 Chat 压缩；其成员、分类、数量、关系必须能回到实际来源。第一次阅读时，邻近正文要给出对应的完整答案及关系；普通复习沿同一模型展示完整主提示，必要答案和关系可以同时可见，按需展开。只有 Kian 明确要求考查/闭卷取回时才隐藏对应答案。不得编造“3原则/5作用”或需要另背码本的暗号。识别/判断即可的点，不因写成带数字提示就升级为闭卷列全或逐字背诵。

**Expansion cue ≠ Memory index.** 主提示是模型内记忆的压缩入口，不是与记忆任务无关的泛泛索引，也不由现成卡库倒推。无对应网站卡不妨碍经筛选的知识挂入模型；有对应网站卡也不要求两边常规重复刷。纯理解关系保留在正文，不为格式对称强造主提示。

#### Four local compression checks

1. **模型：**去掉主提示以后，主线仍能重建整章的问题、关系、条件和方向吗？
2. **提示：**每个提示指向来源支持、确有保留价值的模型内知识吗？首次答案是否明确、数量真实、回忆深度适当？
3. **分工：**模型内成组记忆与独立精记合起来覆盖经筛选的保留目标吗？是否漏掉必要目标，或把同一组无理由安排两遍？
4. **去向：**未入两种记忆路径的内容是否仍在原讲义/support或明确 Source gap？不得把所有删项转成记忆债。

#### Chapter closure compresses the model already learned; it does not invent a second course

**当 Chat 已经完成一个完整章节或一个主要论证块，并准备进入下一章或下一大块时，closure compression 是必做动作，不需要 Kian 提醒。** 这条规则只约束真正的阶段切换，不要求在每个小段、每次追问或普通自然停顿后重复总结。

自动 closure 只压缩**刚刚实际学过且已经解释清楚的范围**，沿同一个 canonical model 变薄，不重新教学，也不得提前把未学内容伪装成“已完成复习”。最小输出顺序是：

```text
已学范围的同一主模型 / reconstruction spine，各自然节点直接带出该节点完整的既有 Main Prompts
（先给可整体阅读的紧凑文字模型：关系与完整提示同处呈现，解释按需展开；不以若干标题下的长文代替压缩模型，不拆成另一张提示表或靠编号交叉查找。允许压缩措辞，不遗漏既有提示维度，不增加未筛选的记忆要求）
→ 必要的易混边界
→ 仅在确有时补 residual Precision / Memory
→ 然后再进入下一章 / 下一大块
```

如果该章只学了一部分，就只做该已学范围的局部 closure，不宣称整章压缩完成。沿实际学习范围及已接受措辞去重、核对、变薄，不换一套知识地图。用户明确委托时可先做小样或较大范围草稿；草稿不等于已经学过、已经接受或已筛出必背内容。不无授权批量重生全科。

#### Progressive review ladder — model first, cue second, precision last

沿主线恢复关系，走到节点时用主提示主动恢复该组记忆，再以独立 Memory 补齐另一部分需精确提取的内容。这是注意顺序，不是反复点击/折叠的要求。阅读正文可同时解释提示和答案；只有 Kian 明确选择 clean Recall/做题时才在作答前隐藏答案、核对标准和泄露答案的助记。章节备课中的“首次取回”“先不给提示”“心答后核对”等测试说明仅用于该显式测试请求，不把普通学习、章末压缩或看框架复习自动变成测试。

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

Learner actions and surface roles are owned once by §2. A policy change alone does not prove Website delivery.

## 2. Active first-round learning chain

**The current request selects the learning action.** 默认分工是：GitHub 保存知识、答案及版本；Kian 使用固定阅读稿初学与复习，再与 GPT 讨论理解、辨析和具体问题；网页只做刷题、提交后反馈和真实学习记录；dot 读取实际记录，帮助诊断薄弱点并制定后续学习与突破方式。阅读稿是同一 Content 的阅读投影，不是网页课程或另一知识 owner。

“开始学…”先定位该科/章已接受的阅读入口；没有正式阅读版就明确候选或缺口，不把旧教案/新生成稿冒称已交付。明确“教我/讲解”时，Chat 可基于当前 Content 连续解释，设问自行讲通，不默认等 Kian 回答；局部问题不重讲整课。普通阅读、复习和讨论不以作答为继续条件；只有明确自测、闭卷取回或做题请求才进入作答→核对。

Kian 仍可选择乘风讲义/课程学习；阅读稿、Chat 与原材料不互相构成强制前置。文件、网页或教案存在，AI 题检通过以及打开过页面，都不证明已经学会或完成学习。实际记录与用户报告保留各自证据边界；具体读取路径由 INTERACTION_CONTRACT.md §0 拥有。

Preserve Chengfeng Natural Unit identity, boundaries and source hierarchy. Existing subject/chapter models remain useful relationship/completeness checks, not a reason to force source content into a conflicting model. If a real model conflict is found, flag it and repair the original owner explicitly; do not quietly invent a replacement. Politics does not import Xizong System/LG/KP taxonomy.

### Source roles

- **Chengfeng:** detailed-study and compression basis. Read the actual requested text and necessary tables/images; preserve its organization and terminology. Source nodes/locators locate evidence but do not replace missing full text.
- **Existing model / teacher preparation:** reusable Content for the accepted teaching route, substantive explanations, fixed model and current review/prompts; also a backstage coverage and boundary check. Reuse it within its recorded scope. It does not replace actual Source inspection for a new compression range, wording check or unresolved conflict; old exact inventories are not the retention decision.
- **Suyi:** optional structural/reference support, never a second required course or silent replacement of Chengfeng framing.
- **Designated Leg retention source:** Kian currently designates **2027 腿姐《冲刺背诵手册》上册 / 下册** as the required-retention baseline, not the whole required knowledge scope. Learning §6.1 owns other justified first-round requirements and the needed accuracy; required retention does not mean verbatim recitation of every sentence. Use the actually inspected current-year passage; do not substitute a different teacher/book or infer priorities from title alone. **《背练结合自测本》 may be used only when the exact subject/task has explicitly ingested and admitted it for that role; it is not ingested or used in the completed Marxism C00–C08 retention pass.** Selection follows §6.1; neither a union nor a mechanical intersection of books is a retention syllabus.
- **Xiao1000:** original questions/answers and transfer/error evidence, and an active test-point detector during Content production under §3.1.2. Do not wait for a learner error before checking an actual item. It does not determine chapter order, automatically generate cards, or replace the source support for knowledge meaning and conditions.

### Surface roles

| Learner action | Primary surface | Companion / boundary |
| --- | --- | --- |
| First study / same-model review | **Fixed reading edition**, projected from current GitHub Content | Resolve an actually accepted version; preserve model, substantive explanations, complete prompts and necessary answers without requiring a prior Chat lesson or test |
| Discussion / clarification / explicitly requested teaching | **Chat**, using the exact owned content | Explain the requested scope; no automatic whole-course regeneration or default wait-for-answer gate |
| Source calibration / learner-selected original study | **Chengfeng lecture / original handout** | Preserve exact text/image limits; do not send the learner away to supply explanations missing from the accepted reading scope |
| Questions / reviewed retrieval practice | **Existing Website Workbench / Memory practice** | Clean attempt → submitted feedback and checking → continue; no reading edition, model teaching or second textbook on the Website |
| Learning diagnosis and breakthrough planning | **Chat / dot**, reading actual learner records and relevant user reports | Separate observed attempts, uncertainty and retrieval from inferred mastery; no fabricated progress, score or study debt |
| Records / return / export | **Existing private native record path** | Record only actual learner actions; retain history, source/revision meaning and minimal return locators; missing records do not mean no learning |

Existing free practice remains plan-independent and source-reviewed; this task does not expand its engine. Pending/unreviewed/unsupported content remains excluded. Reuse the current Memory content IDs and evidence path; no second catalog, autonomous scheduler or automatic enrollment. **Terminology boundary:** Content-level `Residual Precision / Memory` still means model-resistant exact fragments, while the learner-facing **Website Memory workspace is a practice container** and may also rehearse current model-bound Main-Prompt objects selected for active retrieval. Rendering a Main-Prompt object there does not reclassify it as residual Memory or create a second semantic inventory. Implementation and real page acceptance must be verified separately from this contract.

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

This section owns preparation quality for the fixed reading edition and its shared Chat-support content under `content/politics/learning/`; it is not learner progress, a new schema, or Website acceptance. Priority is **source fidelity and relevant coverage → coherent relationships → lower review cost**. Completeness of backstage support is not a demand that every fact be memorized or re-explained to the learner. Preserve the five subject shapes in INTERACTION_CONTRACT.md §4; do not import Xizong KP scaffolding.

For each chapter:

- Start from the subject total model, explain the chapter's problem and its connection to the previous/next chapter, then develop the local model with necessary definitions, conditions and boundaries. Existing orientation/beats/compression assets may be reused only within their actually inspected/accepted scope.
- Actually read the relevant formal Source units. Record the inspected range and modality separately for full text, tables and figures/original images; extracted text does not prove a table/figure was read. Mark inaccessible, ambiguous or uninspected ranges unresolved, with their effect on usable coverage. Do not claim Source completeness from headings, counts or annotations.
- Give every important item in each formal Source unit a traceable teaching destination: **A** first explanation, **B** later supplement with an exact chapter/section destination, and/or **C** justified exact retention. Destinations may overlap. A definition, condition or boundary needed for reasoning cannot be C-only or postponed beyond the explanation that depends on it. An item not taught here is not automatically omitted, but its destination or unresolved status must be findable. A/B/C are preparation dispositions, not new learner tiers or a registry. A/B destinations must resolve to existing substantive explanations, and C to inspectable source-grounded exact content; labels, counts, future sections and unresolved items do not establish completed coverage.
- Explain each model relation's type, direction and applicable conditions. Distinguish causal explanation, logical dependence, chronology, normative requirement and historical tendency; do not turn every arrow into causality. Check exact quotations and attribution, formula definitions/units/scope, and table hierarchy/row-column relationships against the inspected Source. Keep Source differences item by item rather than silently reconciling them; preserve original question/options/answer truth.
- Derive compression from the same explained model. It must preserve decisive conditions, boundaries and relation types. Removing all exact-retention markings must still leave a coherent explanation. Exact retention follows §6.1: new cards require the original Content owner's source-grounded review; a typed `MEMORY_CANDIDATE` suggestion is not admission or a queue. Teaching is not evidence that the learner has learned.

Admission retains the same three dimensions: **Source coverage**, **teaching continuity** and **compression fidelity**. Apply them to the actual fixed reading edition, not only to teacher metadata or a simulated Chat answer:

1. **Independent first reading.** A non-author first reads the complete candidate in its ordinary reading order, with only necessary prerequisites and the task goal, before author self-evaluation or coverage tables. Record where the problem, concept, condition or next relation is not yet understandable; do not supply missing explanation from the reviewer's own knowledge.
2. **Source and recovery check.** Compare the actual text with the complete admitted Source range and necessary tables/images. Check omissions, destinations, relation types, qualifiers, §6.1 mastery/accuracy and §0.7 main-prompt/precision placement. Recover the same model and selected answers from the reading content; a locator, inventory or keyword hit is not evidence of explanation or whole-item judgment.
3. **Whole chapter and interfaces.** The integrator rereads the final whole chapter, its same-model compression and real previous/next-chapter dependencies. Relevant Xiao1000 material judgment must be supported by the text's relations, conditions and distractor boundaries, not just matching names. Repair confirmed defects in the same owner, then reread the complete affected learning path and recheck the affected original items; earlier pre-fix PASS cannot certify the changed version.

For an HTML reading delivery, inspect one exact final complete version separately for source/Markdown-to-HTML semantic fidelity, functioning navigation/links/answer disclosure/printing where present, and actual browser display at desktop and narrow widths. Static/DOM success does not prove readable real display; untested checks remain explicit. HTML delivery is not Website deployment. These are the existing three quality dimensions applied to their real deliverable, not a new rule layer or mandatory extra rounds. Stop once the scoped quality claim is established; do not lower it to finish a quota or repeat passed work merely to count rounds.

A prepared chapter is complete for its reported usable scope only when the actual fixed reading text and shared explanations, corresponding Source locators and unresolved ranges are present, the author and independent reader have reviewed the actual deliverable under the three dimensions above, and confirmed defects have been repaired and rechecked on the final version. Report usable and unresolved scope honestly; an unresolved decisive prerequisite prevents claiming the dependent teaching scope ready. This preparation completion does not require Kian's chapter-by-chapter Human approval and does not manufacture learner or Website acceptance.

Maintain one canonical preparation in the existing Politics content owners; adapt existing assets or add only the necessary chapter text. Do not stack multiple full answers, repeated hidden full texts, or a new registry. Schema/Projection changes remain governed by their existing Content/Runtime owners; this preparation rule does not authorize them.

### 3.1.1 Canonical prepared chapter package — Chat consumes, not regenerates

For a chapter to be called **prepared for fixed reading and reusable Chat support**, its existing Politics learning owner must already contain or resolve one coherent reading/teaching package, and the owning subject must already expose a stable total model that locates the chapter. This is a set of content jobs around the same chapter/NU owners, not a new hierarchy, registry or frozen transcript.

The package must provide, for the chapter's actually admitted scope:

1. **Fixed mother model / reconstruction spine.** The canonical chapter framework and stable learner index under §0.5.
2. **Progressive first-learning route.** A reviewed **problem-driven dependency route** under §0.6 that says how the chapter is unfolded after orientation. It may use several natural teaching batches, but a batch is defined by the problem it resolves and the next question it creates—not by “read the next N spine nodes.” Each prepared stage must have a stable recoverable identity (label/anchor or equivalent), the fixed-spine nodes/content range it ultimately fills, and its intended next problem/closure. A fresh Chat must be able to explain the requested content from that same argument without re-cutting a long teacher text or reciting the reconstruction index as a lecture outline.
3. **Substantive reading and teaching content.** The actual explanations, examples, conditions and Source-backed detail needed to teach each stage. A heading list, A/B/C inventory or Source locator alone is not the lesson asset. The fixed reading edition must carry these explanations continuously in its own default reading order without requiring Chat to supply omitted premises; an explicitly requested Chat lesson may vary wording, not fill an unreported product gap.
4. **Confusable / boundary pass.** A prepared set of high-value misconceptions, option boundaries and near-neighbor distinctions after the relevant content is understood. This may live in the same teacher brief/support objects; it must be recoverable as a deliberate teaching job rather than reconstructed ad hoc from question options.
5. **Same-model compression.** The reviewed chapter reconstruction using the same fixed spine, progressively thinner than first teaching without changing the learner index.
6. **Precision / Memory handoff.** Reviewed exact-retention targets with clear prompts, authoritative answers, checking criteria, optional memory aids, Source/admission basis and consumer mapping under §3.2/§6.1.

The package may be realized by the existing chapter JSON, teaching brief, support objects and optional `*.memory.json`; no particular file split is required. A chapter-level `content_support.active_precision` realization is valid when it satisfies the same requirements. Do not create a sidecar merely for symmetry.

These quality standards apply to any Politics chapter explicitly in the active task scope; they do not commission production or reopening of all five subjects. Reuse existing Current Knowledge, teaching, reconstruction and precision assets within their accepted scope, together with the bounded review evidence already earned; a partial package does not reset mature components or revoke existing base first-round PASS. Prepare or calibrate only the missing, stale or defective parts, reconciling them in the original owners around the same canonical spine rather than rebuilding the chapter or creating another Memory set. Adoption applies to the actual asset and inspected scope, not its directory name. Ordinary learning follows the selected version and current scope statements through INTERACTION_CONTRACT.md §0; an explicitly selected candidate may be used for its supported teaching text without claiming it is on main or that its pending exact targets are admitted. Unresolved adoption remains unresolved. Candidate presence, partial maturity and base first-round PASS do not by themselves prove completion of the six-part package or Website delivery.

**Fresh-Chat consumption rule:** first resolve the requested action under §2, then use the concrete Content read path in INTERACTION_CONTRACT.md §0. Reuse the existing source-checked review, model, current node prompts/full answers and relevant prepared explanations within their stated scope; a new Chat does not rebuild the course or reselect its memory targets. Chengfeng remains the source basis: a new compression range, wording check or unresolved conflict requires the actual source text and necessary images, rather than treating teacher prose as new Source evidence. Old precision inventories are not a must-retain baseline; use the current §6.1 selection already recorded at the original owner, and inspect the designated source when that judgment must actually be made or changed.

A fresh Chat should therefore be able to recover:
```text
subject position + the same fixed chapter model
→ the explanation for the requested chapter or question
→ current node main prompts and their complete supported answers
→ same-model review and necessary confusion/boundary repair
→ only the applicable residual precision / Source limitation
```
Chat enters through the subject, chapter or question Kian specifies; if that target is unclear, ask for it instead of looking up progress. Normal follow-ups can use this conversation's explicit target. Fixed models constrain the relations explained, not the teacher's wording or a compulsory stage-by-stage performance.

If the prepared package is missing, partial or stale, preserve that as a Content limitation. **Do not block ordinary learning merely because preparation is incomplete.** Chat may still teach from the best accepted Current assets and Source as a session-local provisional explanation, while preserving any existing stable subject/chapter spine. It must not present that provisional route as the durable canonical package or silently persist a competing framework. Repair the existing Content owner before claiming cross-Chat reusable preparation.


### 3.1.2 Content production execution loop — bounded batches, chapter closure, forward progress

This is the **execution order** for an explicitly commissioned Politics Content-production Chat across all five subjects, not a new schema, another readiness ledger, a learner-state cursor or a second course. §§0.4–0.7, 3.1, 3.1.1, 3.2 and 6.1 continue to own the underlying quality and retention standards. The same loop applies to different subject shapes; do not force a history timeline, Mao theory response, Xi hierarchy or Ethics-Law concept/norm scaffold into Marxism's reasoning-chain form.

1. **定位范围，不重生整章。** 从活动任务钉定的 `rules_ref` / `content_ref`（未另定版本时才用最新 `main`）及准确的 subject/chapter/NU/Source owner 判断本批是新内容、未完成的局部筛选，还是有证据的缺陷修复；区分既有 base Content PASS、当前年份 Leg retention 审查和真实 learner state。以一个完整逻辑问题或对应 Source 范围为工作批次，复用已有效的模型、解释和 ID，不能为“再优化一次”重复生成已接受内容。
2. **源本先行，按主题组织后再定承载。** 实读该批 2027 乘风正文和必要原表/图片，记录实际检查的模态与范围；建立或核对该章唯一的主模型，填充解释机制、前置概念、关键条件、容易混淆的边界和具体选项辨析。在决定新增或改变主提示/精记之前，只在当前章或完整自然单元内列出所需知识与关键关系，区分原稿已有、尚未归位、真正缺漏和来源争议，按共同认知问题归主题；先核乘风/原讲义及既有模型是否已有好用的总结、比较表或时间线，够用就复用，确无合适且确实更好理解时才自制小表或总结。再依 §6.1 / §0.7 判断主线、原 Prompt 和精记承载，不得一道题添一句 Prompt 或一张卡。主题工作清单只供内部判断，不是用户第二教材或新的永久账本。不能以目录、旧卡或 teacher brief 代替源文；未见到或有歧义的字句保留 item-scoped gap，既不猜补，也不阻塞无依赖内容。
3. **主动题检、回源，再定掌握与承载。** 保留连续初稿后题检的回归循环：有效旧稿可直接检查，相关题也可在组织材料时揭示需求，或成稿后验证；不得要求先审完全部1000题才能写，不推倒成熟稿，不设置 Kian 逐阶段确认门槛。以相关肖1000实际题检验“模型＋必要记忆”能否支持整题判断，不等 Kian 先做错。区分漏知识、漏条件、漏辨析和不会调用；事实/配对核准确恢复，抽象原理核材料关系、适用前提、近邻区别和干扰项。后续发现新缺口同样先按步骤2归组、核原总结，再由同一作者有界整合修复，不逐题追加。原题版本与争议题键按项保留，不凭关键词、题量或色字决定必背，不一题一卡。依 §6.1 判掌握要求与 recognition / option discrimination / conceptual paraphrase / complete membership / exact pairing / fixed wording 的准确度，再依 §0.7 放入模型节点 Main Prompt 或必要 residual；不因腿姐外自动可选，也不预定 residual 数量。生产题检不写为 Kian 作答、分数或 Recall 成功。首次主提示附近给完整答案；旧 CF-only / 历史精记对象不自动变推荐基线。**仅重新分流时**不改其原 ID、答案、checking、admission 和 Recall 历史；若 Source 证明原答案有实质错误，应沿原目标修正并按既有 revision/compatibility 规则处理历史证据，不以“保留身份”为由留下错误。
4. **落实真实学习路径，不只在总模型承诺。** 对本批检查：初学者第一次见到的概念是否有实际解释；先修依赖是否先出现；前章已经介绍或明确承诺后章回收的著作、人物、理论成果、历史标志、术语与易混关系，是否在**相应下游章节的现有正文/节点**实际重新激活，且深度仍服从当前 retention 结论。只把必要的连接放入自然位置，不强制每章回顾所有旧知识，也不让“以后再讲”停在总表。质量门槛必须双向成立：既核来源/题目支持，使必要知识更准确，也完整复读受影响的**原模型 → 正文/主题表 → 简短主提示 → 展开短答 → 精记**路径，确保逻辑连贯、决定性条件不丢、学习负担不被不合理扩大。题会做了但模型被补碎，仍须返修或撤回该补法；“来源与内容双向覆盖”、文件/槽数或 CI 绿灯均不能替代这一教学门槛。
5. **同一语义一次收口。** 每批更新准确的原 `chXX.json`、brief/support 或既有 precision owner 中真正承载该改变的部分。原 Prompt 基本保留但不锁死，仅对含糊、错误或漏取作最小修改，必要边界串联可加短尾；展开短答帮助快速压缩恢复，不复制正文，不机械限字。同一事实服务解释和精记的合理重叠不等于新增重复学习目标，不得据 Prompt 覆盖自动删除有效旧卡。凡当前分类/主模型/答案深度已有多个消费者可读落点，必须核对它们的**现行语义一致**；不能让 brief 降为 Core，而 JSON 的 `deferred_precision` 或旧默认推荐说明仍宣称必背。历史事实可保留，但要在原有效读取位置明确取代过期结论；不靠旁边再追加一份互相冲突的“最新说明”。旧卡和学习证据保留原身份与历史含义。
6. **分批前进，整章验收。** 仅在当前明确授权范围仍活动且无暂停/停止指令时，一个批次经来源核对、局部质量检查、准确 owner 写入与 readback 后，可继续范围内下一批，**不需要 Kian 每处理 K01/K02 就再发一次“继续”**；但批次完成不等于整章完成。章节真正收口时，按 §3.1 对同一固定阅读稿完成独立正文初读、回源查漏与恢复、整章同模型/材料判断/章节接口检查，结合 §3.2 核记忆与题面一致性；改后复读受影响完整路径。HTML交付另按同节分别核同版本保真、交互与真实显示。需要时可补新Chat消费检验，但模拟不能替代实际阅读稿验收。仅将通过的具体范围认定为 prepared；决定义务缺失则标局部未完成。模拟测试不能自称 Kian 真正学会、也不能代替 Website 已交付。
7. **并行写入要防覆盖，完成后继续向前。** 当另一 Chat 同时生成章节时，优先各写各的实际 owner。每次提交前重新读取目标文件及最新 `main`，比较工作起点；若同文件已被改过，必须合并真实增量、重新核对冲突语义并 readback，**禁止用旧全文覆盖他人新修改或强制推进旧版本**。真实冲突只阻塞受影响章/项，其他独立章节可继续。整章收口后默认冻结、不循环抛光；只有 Source 变化、已确认的逻辑/retention 矛盾或真实学习问题才局部重开。

质量优先于推进：未讲通、必要漏项未闭或复审未过则保持待修；文件数、题数、测试次数或进度目标不能代替内容质量，也不能成为降低标准的理由。改后完整复读受影响学习路径；合格即停，不为凑轮次重复审查。

每次有意义的章节断点，在既有 brief/support/preparation-review 位置简要交接**成果与判断**：准确成果版本；已确认的知识归组、原总结复用、掌握深度与承载取舍及理由；真实未决及其影响；已做检查的范围与限度；下一步和恢复所需的少量规则锚点。Current 只给状态与指针，不重贴历史全书，不造独立进度表或永久账本。无新证据不重判已有决定；真实冲突/缺漏只回受影响主题，说明重开原因，更新相关正文、短答、精记后按步骤4双向复核，不把错误锁死。不逐项直播工具，不把生成/脚本/工程 PASS 当作 learner progress、真人已学或成绩。仅在当前明确活动范围内继续已授权 Content，最新暂停/停止指令优先；一般生产流程不自动恢复政治或展开53章。不要创建自动化，也不把学习 Chat 尚未学到该章当作活动任务的生产前置。

### 3.2 Model-to-memory preparation completion

The completion boundary is **understand the source → recover its model → encode justified exact targets → retrieve → diagnose**, not teacher-prose completeness alone. Understanding can come from Kian's source study; a compulsory Chat lesson is not part of this gate. Earlier bounded teaching reviews remain evidence for the scope they actually inspected; they do not automatically certify this additional scope.

Use the existing chapter/NU owners, A/B/C dispositions and content hierarchy. Understanding and exact retention may overlap on the same object; “can be reasoned out” does not by itself exempt an exam-required exact relation from practice. Do not add parallel tiers, a second textbook or a new Memory registry.

For the reported usable chapter scope, provide substantive content for:

1. **Teaching consumption.** State the first-explanation route, its necessary prerequisites and decisive in-place boundaries; give exact destinations for later B supplements. Do not make the next Chat choose between reading the full teacher brief verbatim and inventing a new lesson. Keep optional warnings out of the main explanation unless their misunderstanding would break the model or an imminent whole-item discrimination.
2. **Same-model reconstruction.** A compact recovery route must expand to the same explained relations, directions, conditions and scope. It is not a second unrelated summary.
3. **Exact target coverage.** Identify the actual fixed statements, lists, identities, pairings or boundaries to retain, with Source and admission basis. Distinguish conceptual paraphrase, complete list membership, exact object/role pairing and source-required fixed wording. Order is compulsory only when the Source/task makes order meaningful. “C: hats/lists, return to book later” is a locator, not a completed precision deliverable. Sparse means nonredundant, not an arbitrary small quota or omitted required targets.
4. **Memory encoding.** For each justified target/group, supply a useful grouping rationale, contrast, retrieval cue, mnemonic or contextual association when it lowers effort. No forced mnemonic for a simple point. Mark teaching aids as aids, not authoritative answers. They must expand back to the approved target without inventing causes, reversing roles, dropping members or deleting decisive qualifiers.
5. **Retrieval and checking.** Supply a self-contained prompt, an exact answer/reference and the essential pass/omission/confusion criteria. Show where supported paraphrase is allowed. A chapter title or a generic “boundary” label is not a sufficient prompt for several different tasks. For explicitly requested retrieval practice, test unaided retrieval before providing an optional cue; a cued correction is repair evidence, not a fresh independent success.
6. **Consumer mapping.** Reuse or repair existing chapter precision groups / `*.memory.json` candidates before adding a new item. Locate the accepted content ID and model/Source explanation, or explicitly report why it is not yet catalog-selectable. New teaching wording must reconcile dependent old Memory wording; do not leave Chat teaching one answer while the Website recalls another. Exact realization follows CONTENT_SEMANTICS_CONTRACT.md §3.2.

The existing three review passes in §3.1 must now inspect these deliverables as part of coverage, continuity and compression fidelity. Independent textual attacks include a missing approved target, a vague prompt with two possible answers, a mnemonic that cannot recover the whole answer, and an old/new exact-wording conflict. Extend the existing bounded review result, do not create a parallel QA ledger.

Scaling requires an explicit active scope and must respect the latest pause/stop instruction. Only if such cross-subject scaling is commissioned, verify the necessary materially different shapes within that scope; the earlier Marxism relation/boundary and Ethics-Law C06 list/role examples are not automatic next tasks. The author directly reads/writes substantive material; batched extraction or formatting and unreviewed generated prose are not substitutes. A sample passing proves only its inspected scope, never five-subject completion.

A rule/content review, a catalog/plan test, a rendered candidate and real learner performance are separate claims. No website-consumer claim passes from a file count or CI alone. No real learner records may be fabricated during preparation or self-test. Tests use isolated fixture storage, and unavailable Source/consumer/independent-review evidence remains a scoped blocker. Kian is not required to perform chapter-by-chapter preparation QA.

## 4. First-round interaction principles

- **Score/time first:** the shortest path that preserves exam-relevant understanding, discrimination and transfer beats a richer path with no demonstrated score benefit.
- **One mainline only:** follow the action-matched surface roles in §2 around the same canonical Content. Suyi remains optional background support; do not impose a second course.
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

This section governs learner attempts and their evidence. Content-production checks belong to §3.1.2: they do not require Kian to have learned or missed the item, and they never create learner records.

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

**腿姐2027《冲刺背诵手册》上册 / 下册是必背基线，不是全部掌握范围。** 实读对应段并与乘风知识核对；对本次实际读取的相关手册条目核完整承接，不能只挑几条 Prompt 就称基线覆盖。阅读版的 ★ 表示“指定腿姐背诵手册明确覆盖、需保留”，不是恢复原 PDF 星号，也不是每句逐字背诵。非 ★ 的必要乘风/肖题知识仍须有可读、可复习的位置。腿姐外由实际肖1000题检及乘风核源证实的必要知识，可以判为次级背诵或必须理解/辨析，不必等 Kian 先做错；仅拓展/查阅才标可选。先定掌握要求与准确度，再按 §0.7 选择主提示或独立精记。The current-year designated source remains available. **《背练结合自测本》 is not an auxiliary source by default: it can contribute only after explicit ingestion/admission for the exact subject/task, and the completed Marxism C00–C08 pass did not use it.** Presence/emphasis in a book is a selection input, not proof every sentence needs verbatim recall. The [2027 Source binding](source/current/leg27/README.md) carries page-anchored Markdown with AVAILABLE / MD_INGESTED / INSPECT_BY_SCOPE status; its [fidelity report](source/current/leg27/QUALITY_REPORT.md) is PASS_WITH_UNCLEAR after visual review. Source ingestion does not resolve the remaining localized UNCLEAR fields or certify any chapter retention review. Resolve the relevant original PDF field before using an unclear passage for exact selection.

For each proposed group, the existing Content/review owner must justify what exam job exact retention protects and the needed depth: recognition, conceptual paraphrase, complete membership, exact pairing, or genuinely required fixed wording. Preserve meaningful grouping and explain the first answer. Do not require unaided enumeration/recitation where source use only needs recognition or option discrimination. Use original prompts, answers, checking criteria and useful memory aids; no forced mnemonics.

Three admission routes remain; the proactive route is no longer Leg-only:

1. **Proactive first-round retention / `FIRST_ROUND_EXACT`:** an inspected Leg baseline target, or another first-round target whose necessity is supported by actual Xiao1000 checking and inspected Chengfeng/current source. The original owner records the evidence, exam job, required mastery/accuracy and scope; a secondary target must not be mislabeled Leg-selected. Abstract principles require material-relation, condition and distractor discrimination, not merely a same-named knowledge hit. A chapter C label, precise table, cue, question/card count, emphasis color, AI success or review hash cannot grant necessity. This semantic change does not invent fields or claim the consumer already supports a new recommendation; actual admission still requires Content Semantics §3.2 compatibility.
2. **Individual gap / `INDIVIDUAL_GAP`:** real Wrong/Uncertain or persistent difficulty justifies exact retention of a source-backed point. Diagnose a model/transfer problem first; not every error becomes a card.
3. **Output requirement / `OUTPUT_REQUIREMENT`:** an applicable later output task and inspected source justify the exact formulation. Do not move later recitation wholesale into first-round study.

Use existing review/provenance and card owners to record the route-specific evidence: relevant Leg title/edition/pages for the Leg baseline, actual question/version and source-backed need for other first-round targets, Chengfeng support, retention rationale, required accuracy and unresolved differences. Do not add another registry or second answer set. A historical Leg edition may inform stable target selection when its exact role and current corroboration are recorded; it cannot alone authorize current-year wording, law or facts. A source mismatch is item-scoped, not a reason to stop unrelated compression.

If a target's required source or decisive evidence is missing/uninspected, **do not invent admission or call it source-reviewed/Leg-filtered**. Keep only that dependent selection pending; continue independent source-model explanation. Label any unresolved encoding or disposition example provisional, not a recommended syllabus. Resolve available Project/Library/source records before asking Kian to resend a known file. Do not assume that a missing repository binding proves a file does not exist elsewhere.

Existing source-reviewed CF-only cards, IDs and histories remain intact. Prior optional/Main-Prompt/residual conclusions retain their original inspected scope; they do not pre-decide a new source-backed requirement. Reconcile any changed necessity at the original owner before recommending it; never retroactively call a secondary target Leg-selected or let an old “no residual” conclusion block new evidence. A current reviewed role must be respected by consumers, with real admission/recommendation compatibility checked separately. No mass deletion, historical relabeling, duplicate routine practice or compulsory regeneration follows.

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

The Website owns only approved question/practice and record actions: selection, clean attempt, submitted feedback and answer checking, Wrong/Uncertain and useful annotations, continue/return, and real-record storage/read/export. A minimal source locator may support that exact attempt or feedback.

The fixed reading edition, subject/chapter model teaching, continuous explanation, chapter compression and learning strategy are not Website construction goals. They remain GitHub-owned Content projected for reading and Chat discussion under §2; an HTML reading deliverable is not a Website deployment.

Existing pages, state identifiers, data and learner records are retained for compatibility, not deleted or rewritten by this rule and not a backlog to expand. Keep working practice usable; only a verified blocker warrants its smallest separately scoped repair. Content semantics stay upstream, never hard-coded into page components. A rule edit does not prove Website migration, delivery or deployment.

## 8. Private interaction state

Current content is learner-independent. Answers, progress, wrong/uncertain history, timing, notes, highlights, last external-source position, and similar private state may exist in browser/session/device storage only when it materially improves learning. It is not shared Current authority.
