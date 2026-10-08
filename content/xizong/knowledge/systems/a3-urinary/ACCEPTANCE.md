# Xizong A3 Urinary Acceptance

Status: CURRENT  
Scope: A3 Urinary  
Standard: root `LEARNING_ACCEPTANCE.md`  
Role: A3 scoped Acceptance Truth

This file owns current S/K/L/P/R/E/U readiness claims for A3 Urinary.

It does not own medical Core, lane learning semantics, Work Cursor, or Kian's private learner state.

---

<a id="a3-b01-b05-deep-model-quality-20261008"></a>
## 2026-10-08｜A3 第一阶段 B1–B5 连续模型、既有依赖与原题深验

**限定医学模型、原有依赖与本地原生消费：PASS。** 本阶段承接 [#1113](https://github.com/kianwang022-hash/kianos/issues/1113)，基于已合并的 A2 深验 `5e05ab121b41bac473d5d83667ca7fa447bd9db6`。按 Kian 的阶段推进要求，只交付 B1–B5；后续 B6–B10、B11–B14、B 以及同质量 C/D/E/F 目标仍取 #1113 的完整最新指令，不从本小阶段推断全部 A3 或 A–F 已完成。继续使用原 [Learning Contract §0](../../../LEARNING_CONTRACT.md#learning-outcome) 和 [Lecture Replacement Contract](../../learner/LECTURE_REPLACEMENT_CONTRACT.md)，不新增第二套质量规则。

### 同一模型、完整原注释与原文保护

五块完整 Core、System/Learning、旧 teaching、87 对正式完整 title/Prompt、原模型和模型外去处均已实际读取，并由独立执行者逐块交叉。学习解释和压缩复述沿同一 canonical 医学关系；提示不决定拓扑。隐藏全部 `〈标题〔完整 Prompt〕〉` 后，仍能读出因果、并行、条件和反馈。

| 唯一 canonical owner | 审定 Git blob | 原 KP | 本批模型关系 |
|---|---|---:|---|
| [B1](./blocks/泌尿系统_Block1_肾脏总地图_清除率_肾血流与内分泌_学习阅读版_v1_最终执行版.md) | `e4e4e7227b91b3a0b20ae36d7f3dd785752e02b7` | 15 | 血液继续回血与管液沿小管成尿并行，滤过/重吸收/分泌跨接两流；局部反馈和内分泌有各自入口，清除率是有条件的测量推断，终尿接排尿反射。 |
| [B2](./blocks/泌尿系统_Block2_肾小球滤过屏障与GFR_学习阅读版_v1_最终执行版.md) | `04f41f6332797c9159494562076476b6b792383c` | 14 | 屏障选择性与滤出体积并列，Starling 力、RPF 和 Kf 是不同轴；仅在达到净滤过压为零的课程模型中讨论平衡点；病例允许多个变量同时变化。 |
| [B3](./blocks/泌尿系统_Block3_分段小管转运与利尿剂_学习阅读版_v1_最终执行版.md) | `1ff85ebef17054d9bf620386d45ebe8e2599a28c` | 19 | 固定管腔/细胞/血侧方向，沿真实肾单位分段处理；球管平衡和管球反馈分开，药物回到各段靶点，K/H 按容量、激素和净排酸等条件判断。 |
| [B4](./blocks/泌尿系统_Block4_容量激素与尿液浓缩稀释_学习阅读版_v1_最终执行版.md) | `d2ad342810ed59363d4f92140b0eda0bdd13fdd8` | 19 | 建立梯度、保留梯度与沿梯度回水共同决定浓缩能力；激素经各自入口影响不同效应，不按列表强配或依次等待；轻中度与严重低灌注明确分支。 |
| [B5](./blocks/泌尿系统_Block5_水钠钾钙与酸碱整合_学习阅读版_v1_最终执行版.md) | `c3383df60d4da17886940febca32c311f73da7d4` | 20 | 同一病例并行看容量/张力、离子总量与分布、酸碱，并持续识别危险；干预反馈到具体变量；expected compensation、AG/白蛋白、delta 沿原诊断边界使用。 |

15 个模型 span 与三处批准的非 Core 同步均可精确逆还原。三处同步仅为：B2 MI-D 区分 BSA 与肺比顺应性的肺容积/FRC 口径；B2 MI-G 给 RPF/平衡点补回课程模型条件；B4 Exit 区分 ADH/AVP/VP 与垂体后叶素制剂。所有原 title、完整 Prompt、Source/Outline、KP/LG 身份与成员顺序保持。原 teaching 文件不变，合法解释继续回其节点；原目录不能成为第二份主模型。

**唯一 native Core 读取例外是 B2 KP14。** 原 Markdown 在 KP14 标题下使用五个同级子标题，真实 native loader 因而只读到 59 字符的回看句，漏掉已存在的两大入口、五类场景、药物接口、糖尿病边界和六步病例算法。只将该 KP 内五个 `##` 与四个 `###` 子标题各降一级，外层 `# 11` 边界保持；真实 loader 现返回完整 1126 字符原正文。医学文字、正式标题/Prompt、外围内容和共享 parser 未改。故本批 **870 个指定 native 字段中 869 项精确不变，1 项为原文恢复读取**；全 A3 为 2570 项中的 2569 项精确不变，不能写成所有 native Core 都未变。15 模型、3 非 Core、1 标题修复共 **19 个不重叠 span** 逆还原后，五个完整文件均等于原 Git blob。

### Learning、Memory 与实际模型消费

Learning 只同步 **11 个原字符串：5 个 recall spine 与6个既有 group goal/closure**。原 first-pass/stop-line、成员、Source、其他 Block 值与所有其余字节保持。B1 明确使用“血液与尿液测量”，B4 明确“经各自入口影响”，避免区室和一一对应误读。

逐项实读受影响的 **9 张既有 Memory 完整答案及有序依赖**后，只更新其 `owner_sha256`。其中 B11 LG04 的原有 B2 KP01/KP02 依赖因 B2 recall spine 改动而受影响，B11 canonical 本身未改。全 A3 **28 个 item、答案/助记/来源、准入、身份、成员、Core refs 及顺序保持**，无 KP14 直接 prepared Core ref；真实 witness 和 resolver 全通过。6 块中的29个实际语义 descriptor 字段变化单独校验，真实 revision 保持更新，不在 runtime 或私人历史中归一。

原 A3/B source、完整 native、preentry 和28个 descriptor goldens均先由原 Git 输入独立复现；原 fixtures 不改。测试只在要求精确当前 `after` 后，对比较副本还原明确的19源段、11 Learning、6 group和9 owner变化，继续用原基准保护所有其他字段。A3 本批五个 Framework 均真实存在；独立 Markdown 标题归属核对完整 authored Framework，包括 B5 嵌套自然模型。两个原 Memory Routing 字符串变化单列，不能把 Framework 或其余原 preentry 字段整体豁免。

原 `inspect-xizong-content --model` 只会找 `text` 围栏，本批完整 Markdown 模型因此无法读取。最小适配现以唯一真实 Markdown 标题限定范围，支持原单一闭合 text 围栏和完整注释 prose；prose 不进入旧模糊后缀匹配。后续 Core 的围栏不能补足本模型，伪/重标题、缺 KP、错 title/Prompt、破损括号、错误/未闭合/多围栏均拒绝。与保存的旧函数直接对比 **24 个 A1/A2 完整输出（548 KP）及 D8（25 KP）全字节相同**；五个 A3 真 CLI 与87完整注释通过。原 A1 B1 特殊路径、legacy matcher 和 production strict guard保持。

原 B1/B5 Projection 只同步 **2 个 Core pin 和4个原对象 selector**。所有 object ID、role、geometry、stage、answer-bearing、front/reveal策略、Source/外源合同和其余 JSON 精确保留；真实非 candidate `buildXizongProductionBlock` 均成功读取原对象。未改网站组件或生产 parser。

### 75 条原题从原 effective 见证重审

**8 个原 effective Knowledge blob、48 个原 Truth blob与75个完整正式题/Explanation**均实际读取和逐对象核对。22 条原作用域 Core/身份/title精确连续；43条因历史医学变化或 KP14 读取恢复而按最终 Current 实审；合计65条保留所有原目标并更新复核见证。10条保持原完整 row 和原 effective witness，不擅自移动 Primary、删 supporting、改题干或答案。3条整 B2 关系含 KP14，均按 actual review 记录，不能冒称历史 native 全等。

| 原关系整条保留 | 本轮未能安全续签的具体依据 |
|---|---|
| `2005-n131` | 原 KP06/07/08 已提供滤过、强交感/阻力与梗阻所需轴；额外 supporting KP13 在本题重复强交感判据，无独立必要性，不能为原目标续签或擅删目标。 |
| `2007-n059` | 原 KP02 有 EPO 来源/作用及肾损坏缺 EPO，但缺低氧→EPO增加→继发性红细胞增多的所需方向；Explanation 不能补作 Knowledge owner。 |
| `2008-n015` | 原 KP02 虽与当前精确连续，但未指定 GBM 为题目所问的主要电荷屏障；已有 Explanation 历史来源注释不能替代缺少的目标证据。 |
| `2009-n015` | 原 Primary KP07 已有饮水→ADH下降→水通透下降全链，supporting KP19 仅重复水利尿身份，无独立判据。 |
| `2013-n154` | 正式宽问“能够增加尿钠重吸收”，不能由“ADH主要调水”推出排除 ADH；原实验有条件性 Na 转运效应，不能给正式题干偷加“主要作用”。 |
| `2020-n012` | Primary KP03 已拥有儿茶酚胺/β1促肾素，supporting KP02 重复该路径，未增加题内四种分子的独立判据。 |
| `2021-n010` | “等渗盐水不出现同样水利尿”不足以推出总尿量“无明显改变”，也缺口服/静脉及糖水浓度、时相的完整比较。 |
| `2021-n139` | 正式宽问“参与调节和维持酸碱”，不能因 KP10 未列 NKCC2 就排除其参与；原始 TAL 氨转运实验支持相关机制，Explanation 不能私加“主要/直接”限定。 |
| `2023-n010` | Primary KP06 已有 V2/cAMP/AQP2 及浓缩全链，supporting KP17 在此激素选择题重复末端模型。 |
| `2023-n140` | 正式宽问清除率原理可测指标，原 KP07 已给滤过负荷减尿排泄的 Na 回收算法；不能用 Explanation 新增“单一直接清除率测定”排除该选项。 |

上述两个专业反例只用于拒绝无依据排除，不改原答案或据动物实验扩写本批 Core：[Garvin 等原始 TAL 实验](https://pubmed.ncbi.nlm.nih.gov/3394813/)、[Good 等原始实验](https://pubmed.ncbi.nlm.nih.gov/6742203/)、[Bugaj 等小鼠集合管 ENaC 实验](https://pubmed.ncbi.nlm.nih.gov/19692483/)、[Tomita 等 DOCA 预处理大鼠集合管实验](https://www.jci.org/articles/view/111935)。物种、制备和干预条件保留，不外推人体治疗。

10条保留中9条在本批基线已 stale，`2021-n139` 在基线曾 Current，但本次不予续签；保持原 row 后它随 B3 源修订而成为 stale。真实 Current resolver 对65条返回 **49 KP / 16 Block 路由**，10条保留项全部关闭。全库为 **2092 current / 951 stale / 3043**，其中941条非本批旧 stale 及所有其他原关系逐对象保持。manifest同步、Crosswalk、review pipeline与throughput均通过；不能将全部3043条存储 REVIEWED 说成全都可消费。

### Surgery、验证与未决边界

当前 Surgery 的38个 Source unit、59条绑定、52个 owner 全量解析后，本批只命中 **SUR27-U31 → B5**。全部20个 B5 native KP记录、六组身份/成员/顺序及原 Source保持；LG02 closure按实际心脏危险的条件已实审。7个现有 Learning target完整值与签名不变，其中 A3只绑定未改的B12/B13。只同步原B5 owner witness、Knowledge汇总及downstream汇总 **3个已有字段**，全部其他生命周期字节保持；当前完整生产 validator及旧 witness拒绝检查通过。

本地实际验证：内容检查 **240**（原196断言保留）；A2/A3/B prepared Memory **212/229/611**；A3/B preentry **89/327**；A reader **2498**、B reader **9549**；原A1/A2/A3和B post-Chat控制器、B Source、159 Current owners、Surgery、Semantic Adapter、Projection self-test **95/95**及Current、Representation、Production、LearnerObject、B/C兼容、Learning、A3 Source、A2 Runtime/repair-return/evidence、Source Visual和Extension均通过。独立测试适配审查另有102项证明，不替代这些实际套件。

`validate:xizong` 汇总仍在既有 `runtime-group-close-does-not-check-missing-recall` 整句匹配失败；同一运行时与脚本在冻结 A2基线已经复现，当前两个文件原字节未动。其后六项检查已分别执行通过。内容检查与其他验证并行时曾仅在最后的 git-status一致性断言失败，所有检查停止后单独重跑 **240/240通过**；未删除或削弱该保护。最终远端 head、CI及合并回读以关联阶段 PR / #1113 的实际回执为准，不预先授予全站构建或浏览器成功。

原 B3 KP03 比例表未准入、B5 数字端点/DKA/K精度/钙来源分歧与诊断性外源合同继续保持。七个既有 crop 仅按实际已读图像与原绑定核对；没有新全 PDF像素验收。B6–B14本批未改，含 B10原急性肾炎P195/P197视觉定位冲突继续留在其原 owner。Source接触、浏览器、Stable发布及 Kian真实U均不因本批内容/脚本通过而提升。

---

<a id="a2-a3-reader-consumer-repair-20261006"></a>
## 2026-10-06｜Delivered A2/A3 reader and Memory consumption repair

**Status: ACCEPTED for the bounded consumer repair in [#1215](https://github.com/kianwang022-hash/kianos/pull/1215).** The [quality audit](https://github.com/kianwang022-hash/kianos/issues/1113#issuecomment-6022003601) correctly separated full-text preservation from usable same-model compressed review. This receipt supersedes the earlier blanket compact-reader/available-external-route proof in the A2/A3 teaching receipts below; it does not revoke their medical owners, Runtime adoption or genuine prior evidence. [Learning Contract §0](../../../LEARNING_CONTRACT.md#learning-outcome) remains the unchanged criterion.

- All **26 actual A2/A3 marked HTML trees** were independently reviewed with closed-details bodies excluded and their summaries retained. **18 readers** needed existing node-owned retrieval keys exposed; **four A2 readers** needed only footer repair; **four readers** remain unchanged. B3's proximal pump/transport and front/back entries, and B5's isotonic/hypotonic/hypertonic/water-excess branches now carry their full formal titles/Prompts at their existing model nodes. All **493 native titles/full Prompts** remain exact once; medical relationships, node order, model prose and explanation answers are unchanged. Answers remain folded. This is semantic node coverage, not a visible-KP quota or a second Recall Map.
- **31 intentionally model-external whole keys** keep exact existing Core-section destinations. The eight absent B5–B8 file links and same-class local-only footer claims in A3 B1–B4/A2 R9–R12 now resolve to actual Core Framework/MI-G/MI-D, exact KP, admitted cue/answer, Learning and Acceptance owners. Independent review resolved **906 hyperlinks against 55 actual published file versions**, including their frozen paths and selectors; the CI check separately verifies checkout paths/anchors/line bounds. No mirror accounting file was added, and a Core link is not counted as prepared-card admission. Existing A2 holds and the A3 B3 ratio-table hold remain.
- The existing Memory Workspace alone adapts authored answer grouping into semantic paragraphs/lists and progressively discloses provenance. **230 existing prepared cards** preserve their complete raw answer text/order, conditions, aids, IDs, witnesses, revisions, clean Recall, Reveal/rating behavior and history; no medical or answer owner is rewritten. B3 shows its PCT/TAL/DCT/CD groups and B5 its diagnostic paragraphs after Reveal. Source limits and the diagnostic-only B5 contract remain unchanged.
- Reviewed product head **`4c0585976cc782f723c6fc47e690901fb89244b5`**, tree **`27881b28e1a38919b9493b83d962a55879c58a4e`**, has exactly 32 reviewed changes and preserves the concurrent Lexical base. Existing A2/A3 test-oracle edits change only the eight/fourteen repaired reader SHA fields; all answer oracles are unchanged. Local reader proof passes **2,498 checks** and rejects the old baseline with **38 targeted failures**; independent Memory review covers **230 cards / 1,898 assertions**. A1/A2/A3 native, freshness, raw-owner, pre-entry, post-Chat, save/history and completion-gate regressions pass.
- [Memory CI 37509271791](https://github.com/kianwang022-hash/kianos/actions/runs/37509271791) passes both new regressions, all existing native gates, build and the actual Workspace/full A1/A2/A3 release browser journeys. [Artifact 11434835599](https://github.com/kianwang022-hash/kianos/actions/runs/37509271791/artifacts/11434835599), ZIP SHA256 **`c31931f8ef356eafd6929ba7eb66c0edb18767518aeaba6297c9658b3171be24`**, was independently verified and the B3/B5 clean-front and revealed grouping/aid/provenance screenshots inspected. The actual CI checkout is synthetic merge **`6b363e6d5a11b42636de4e759b0955c942e6db8f`**, whose tree equals the reviewed product tree; it is not mislabeled as a literal head checkout.
- The current check set has **six success / three prior-owner failures / two skipped**, not whole-repository green. [B+C](https://github.com/kianwang022-hash/kianos/actions/runs/37509271796), [A2 Journey](https://github.com/kianwang022-hash/kianos/actions/runs/37509271499) and [QA](https://github.com/kianwang022-hash/kianos/actions/runs/37509271590) retain the exact prior fingerprints `b_biochemistry_repair_missing_axis_fails_closed`, `reviewed_relation_question_exists` and `reviewed_wu_creates_one_visible_memory_repair:0`. The historical Mac `wrong_auto_flips_to_back` check was not scheduled here; it is neither newly failed nor claimed fixed.

**Limits:** this is reader/native-view and isolated synthetic consumer evidence. No new Source pixels/contact, clinical revalidation, real learner U, mastery, learner record or publisher action is claimed. Existing Source/Human holds remain. Main merge placement and actual Current/Stable served release require their own later evidence. Unrelated System preparation is not reopened.

---

<a id="a3-teaching-adoption-20261006"></a>
## 2026-10-06｜A3 teaching and prepared Memory System adoption

**Status: ACCEPTED — urinary-b01 through urinary-b14 only.** Under Kian's bounded one-System authorization in [#1113](https://github.com/kianwang022-hash/kianos/issues/1113), this receipt adopts the fourteen reviewed compact teaching/same-model compressed-review inputs and their native post-Chat/prepared-Memory integration in [#1210](https://github.com/kianwang022-hash/kianos/pull/1210). The [normal Chat entry](../../learner/README.md#accepted-a3-urinary-teaching-basis) names all fourteen files. Exact final candidate and CI receipts are recorded below; merge placement and served release remain separate.

### Model, coverage and selective exact Memory

- All fourteen actual compact defaults, annotation-free models and expanded narratives were independently reviewed against full Current System/Learning and [Learning Contract §0](../../../LEARNING_CONTRACT.md#learning-outcome). Natural full title〔Prompt〕 bindings retain **14 Blocks / 257 KP / 75 LG** and the renal processing, body-fluid, evidence, functional-failure, glomerular, outlet and structural-injury models with their real cross-Block boundaries. Finite model/external accounting preserves every required Framework, MI-G, MI-D, comparison, Source/visual and Extension destination. Counts are observed coverage, not card quotas or KP-generated topology.
- Exactly **28 newly reviewed Precision identities (20 KP / 8 LG)** are admitted at existing native semantic owners. The existing A3 cue index owns identity/anchor/admission; `shared-fields.json#/precision_fields` owns complete answers, conditions, aids and provenance. The established seven-key `NATIVE_CUE` refs seal native Core, all contributing KP metadata/Block qualifiers and full ordered LG members/group metadata. Missing, stale, moved, duplicate or extra witnesses fail closed. Supporting dependencies do not become new release targets. No parallel answer store, source-memory alias, parser, scheduler or duplicated whole-Core card was added.
- All **176 A1 + 26 A2** prepared identities, references, answers, descriptor values, history and holds remain exact. Existing MemoryModel preserves prior answer/context/resolution/owner history and private evidence on same-owner refresh. Selected prepared views exclude withdrawn admissions without deleting historical records. Both full-release paths omit unadmitted fallback cards; later genuine Block completion releases existing Core once. Prepared-only availability does not consume that release or create Today debt.
- B5 LG06 includes both KP19/KP20 and a deterministic full-byte witness of its existing diagnostic-only external-source contract. Claims, algorithm, prohibited scope, source priority, anti-drift, URLs and provenance all participate. Missing/malformed/wrong-identity and byte-only changes reject old references while Core stays unchanged; unrelated A3/A1/A2 answers remain valid. Reviewed contract SHA256: `9d9e9123feacbd22bba90d0fea5121eef0dd9a88cac549c006090eee14f8a0e4`. This does not admit treatment rules or new guideline claims.
- Canonical Core/title/Prompt/System/Learning/Source/question owners are unchanged; the six differing candidate canonical witnesses were not imported. Saved candidate headers remain provenance. This receipt supersedes only the teaching-admission boundary for the exact fourteen reviewed files, retaining `medical_authority:false` and dependency freshness.

### Recovered pre-entry and remaining holds

The existing compiler now carries all **199 MI-G / 141 MI-D** raw Current topics in exact order, restoring the **47** dropped MI-D topics in B7/B10/B12/B13/B14 (15/7/10/7/8), all **14** raw Memory Routing parent anchors and **11** existing numbered Framework sections. Parent/direct-child repair is bounded to A1/A2/A3. Ambiguous parents fail closed; seven legitimate A1 parentless Blocks retain unique-heading fallback; A1/A2 public output and other-System selection behavior stay unchanged. These are ATTENTION destinations (`CURRENT_TAKEAWAY` / `DEFERRED_MEMORY`, `BLOCK_ORIENT`), never automatic exact-card admissions or learning evidence.

**One reviewed unit remains unadmitted: urinary-b03-kp03 ratio-table recall.** Its complete table stays at Current top-level MI-D, but unique table facts are outside native KP Core/metadata freshness. No new Precision ID, partial card or whole-Core substitute is assigned. The other 28 reviewed units proceed independently.

Keep all Source/version/safety holds, including:

- B5 Current severe hyponatremia remains **<120 mmol/L**, not candidate **≤120**. The 130 endpoint overlap, DKA **urine-output** 30–40 mL/h/K endpoints, and D-S stage/calcium distinctions remain unresolved. Diagnostic compensation/AG/delta scope does not expand into treatment, correction-rate, DKA/HHS or ventilation rules.
- B7 Scr/GFR/BP/KRT/RAS and B8 sample/population/drug-site qualifications, glomerular syndrome versus morphology versus etiology, B10 sodium-versus-salt ambiguity, and B12–B14 course procedure/size/stability/affected-versus-total-function boundaries stay in their complete answers and original owners. Unsupported breadth is not prepared admission.
- B10 LG01 still asks for acute GN P195 while its Source bundle points to P197 crescentic morphology. This task/asset mismatch is neither reinterpreted nor closed. All 11 visual cues, eight Extension assets and four Source bundles retain their original owners. No new original-PDF pixels, replacement assets, Source contact or gate closure is claimed.

### Executed proof and bounded corrections

- Independent native/adversarial **229**, fresh-process raw-owner/contract/admission **26**, and raw pre-entry **89** checks pass. Frozen pre-edit full-descriptor digests prove the exact 202-card regression. Original A1 native **60** and A2 native **212** pass without regenerating their old expectations. Only the exact reviewed A3 additions are projected out of the old pre-A2 shared-owner snapshot; arbitrary changed legacy values still fail.
- Independent actual-script controller review passes **510 grouped checks**: A3 Memory206, full post-Chat/StudyEnhancer200 across all38 A1/A2/A3 identities, and unchanged A1/A2 controller46/58. Post-Chat still requires `NATURAL_SOURCE_UNIT && !sourcePerGroup`; Source/allSource, prerequisite, visual, TTSX, Reveal/rating, save-failure and completion gates remain.
- Actual browser proof exposed a legacy StudyEnhancer count-only callback that visually re-enabled completion despite BlockV6's full gate. Removing that duplicate writer leaves BlockV6 as the eligibility owner. Eight actual dock-callback cases and the independent full-script observer matrix verify Source/visual/revision protection, valid-ready behavior and unchanged history. Three dependent validators now require the complete canonical gate and prohibit dock override, rather than requiring the obsolete string. No Source or completion predicate was weakened.
- The initial browser Source-isolation fixture mixed Node and served image-URL witnesses. It was corrected to use the actual served learner payload and assert exact state/witness equality; strict Source/visual failure expectations remained unchanged. This is test-fixture correction, not acceptance of stale evidence.
- Final tested candidate `f199594c9e0d6ee28f18bc86b8c0b3c2b7939a97`, tree `44808c744deaea775cd3e99b1eaa1d1d983e7edd`: [Memory CI37491275625](https://github.com/kianwang022-hash/kianos/actions/runs/37491275625) passes all native/pre-entry/raw-owner/post-Chat/dock gates, build, **29 grouped A3 browser cases covering all28 answers**, **25 A1 prepared**, **13 A2 prepared**, **54 Workspace** and **36 full-release** checks. [Artifact11425408219](https://github.com/kianwang022-hash/kianos/actions/runs/37491275625/artifacts/11425408219), ZIP SHA256 `7966d4285a9123b6d9a66825dcd9645bb1b10f3d6d62cefd81a2435952ac06ba`, contains the actual evidence. [Block CI37491275721](https://github.com/kianwang022-hash/kianos/actions/runs/37491275721) passes **78 built-preview checks**; [Artifact11425822327](https://github.com/kianwang022-hash/kianos/actions/runs/37491275721/artifacts/11425822327) ZIP SHA256 `b9bdf8d31045aa82aa3cd1c71997b6c4f2535c45656cbf998d0cda38dd289ef9`. CI's synthetic PR merge is tied to the candidate by independently verified tree equality, rather than mislabeling the event SHA as a literal head checkout.
- This exact-product CI wave is **9 PASS / 4 known-owner FAIL**, not all green. [A2 Journey](https://github.com/kianwang022-hash/kianos/actions/runs/37491275742) retains `reviewed_relation_question_exists`; [B+C](https://github.com/kianwang022-hash/kianos/actions/runs/37491275838) retains `b_biochemistry_repair_missing_axis_fails_closed`; [Mac](https://github.com/kianwang022-hash/kianos/actions/runs/37491275691) retains `wrong_auto_flips_to_back`; [QA](https://github.com/kianwang022-hash/kianos/actions/runs/37491275722) passes the repaired gate validators and reaches its original `reviewed_wu_creates_one_visible_memory_repair:0`. Existing owners remain responsible; no unrelated relation, latency, Lexical or missing-axis repair is included.
- Independent review accepts the exact candidate product/test bytes: both final artifact ZIPs were hash-verified against GitHub metadata, the CI checkout tree was verified equal to the candidate, and the final A3/held/qualification/history/save-failure plus A1/A2 screenshots were inspected or byte-matched to their inspected identical outputs. All 48 Memory screenshots match the reviewed product. This verifies the scoped synthetic consumer paths, not Source contact or real learner U.

Actual A3 browser coverage includes all28 complete reviewed answers and aids, KP/LG ownership, B5 diagnostic contract scope, cross-Block/medicine/procedure qualifiers, clean Recall/header/rail/accessibility, full Reveal, rating/save/reload/reopen/Back/Forward, historical context, held B3 filtering, repaired pre-entry, Source/allSource/visual/TTSX conjunctions, unavailable writer and persistence failures. These isolated synthetic journeys are not learner U or Source-pixel evidence.

### Exact accepted teaching inputs

All files are `content/xizong/projection/a3-urinary/chat/bNN-teaching.md`. The following SHA256 values bind the independently reviewed repaired reader bytes accepted by the consumer-repair receipt above. Only retrieval-key placement and responsible-owner routing changed; the medical model and folded explanations were not regenerated.

| Block | SHA256 |
|---|---|
| B01 | `b438b54d236d848689fcb26b1361a34c12f6bc99a24764d76e67b2abf1fc6750` |
| B02 | `50bb1722a73a427a4ddf768943ae448dcc50630e1569bd443da4846d24168410` |
| B03 | `2d376b46364ce0ad7e49fa300b7353aac86a6434c2a2c5ee4b865c99576baafc` |
| B04 | `e041c0bad168b78b3feb1f73108f9743de62c713ab28bdb1557a3b00d9e25a27` |
| B05 | `d2a74053772d2e299897b41de7e2724f3186e8bffacc8387ecef1532a5810ac8` |
| B06 | `64b803249c593d216ce5102a5a70aa8c635f56696714027c3957c978a0b938ef` |
| B07 | `1acf68686956b67ff42363eac226630929b0be12fc2852a437df0b92e9015948` |
| B08 | `143a2080808717295a78901e5a9a852c4dc78760a2507edd5e8b872db70a5064` |
| B09 | `2a7913272435386c78488b13e83a8696d0f36674593dcdf18e8ea017e4e6b966` |
| B10 | `d4126df0d40c6a71a2b7e2e38712963a895ff3b9934e2a6c2bf7245f51e392ad` |
| B11 | `d47c7a96310e74121a49fd608b328da4f35b44e5909a1acc1db15f7be365b009` |
| B12 | `1616e2ee8d8917ba7c966924a8ec579b5c60fc212aade4f28788fad408a17d97` |
| B13 | `84164cf65e13dd42c46f8d1d52394cc6faf9d81bc151157aba7f2215ac5e0e70` |
| B14 | `0e1794e5918593a880a03fdcae29b39d1442b4e0d49faa41775f16768ce4bf1b` |

### Learner and delivery boundary

The lawful current sequence is Chat model → native KP retrieval/prepared Memory → Block/System reconstruction → broad Lecture/question calibration. Earlier Lecture-first statements below retain their historical scope and are not the only legal entry for these adopted lessons. Navigation, dependency reads or prepared availability alone certify no Source contact, Learned, Recall rating, completion, full release or Today work. Explicit observations and genuine completion retain their existing owners.

**Learner U remains UNTESTED.** This adoption does not show that Kian has started A3, viewed original figures or mastered the content. It does not adopt other Systems, all of #1150, old Library/review fallback, whole-repository green status, main merge placement or actual Current/Stable served release. Those claims need their own evidence.

---


## Gate status

```text
S  PASS — CURRENT_RECONSTRUCTION
K  PASS
L  PASS
P  PASS
R  PASS
E  PASS
U  UNTESTED by every real learner path
```

Current allowed conclusion:

> **A3 is module-ready for learner test. Source, Knowledge, Learning, Projection, Runtime and Evidence are accepted for the recorded scope. U remains untested because no engineering build, CI run, simulated journey or architecture review can substitute for Kian actually using the path. Do not infer that Kian has started Urinary.**

---

## Current evidence boundary

- Source scope owner → `content/xizong/knowledge/learner/a3-urinary-question-scope.json`.
- Accepted Source membership → **244 unique official-question IDs, 2005–2026**; runtime-sorted inventory SHA256 `92685b073b9cbf00f67a61442872c1fea4ccf01fe50987e12e4ca646c90751c5`.
- Current Question Truth → **3750 immutable IDs**, inventory SHA256 `0abc1a3cadbb41b36808fe86ff58c21ede6f4297312e9fb4c2da62b865ef2c82`.
- Current System-level Knowledge owner → `content/xizong/knowledge/systems/a3-urinary/system.json`, authority `CHAT_APPROVED`.
- Accepted stable substrate → **14 canonical Blocks / 257 stable KPs / 75 Logic Groups**, no Block/KP split, merge or renumbering.
- Block/KP medical truth → `content/xizong/knowledge/systems/a3-urinary/blocks/`.
- Lane learning constitution / first-pass surface ownership → `content/xizong/LEARNING_CONTRACT.md`.
- Shared study policy → `content/xizong/knowledge/learner/study-policy.json`.
- A3 learning support → `content/xizong/knowledge/learner/a3-urinary-learning.json`.
- B5 narrow supplemental Source boundary → `content/xizong/knowledge/learner/a3-urinary-b05-external-source-contract.json`.
- Projection / Runtime / Evidence mechanics → `static-web/`.
- A3 Runtime acceptance probe → `static-web/scripts/validate-xizong-a3-runtime.mjs`.
- A3 Evidence acceptance probe → `static-web/scripts/validate-xizong-a3-evidence.mjs`.
- Shared repair-inbox contract probe → `static-web/scripts/validate-xizong-repair-inbox.mjs`.
- Pre-cutover System Guide provenance is preserved in Git history only and is not part of Current routing or authority.

---

## S — PASS

Closure path: **bounded Current reconstruction**.

Accepted owner:

`content/xizong/knowledge/learner/a3-urinary-question-scope.json`

Accepted invariants:

- 244 unique official questions across 2005–2026;
- every selected ID resolves from Current Question Truth;
- zero unresolved membership ambiguities; the historical reviewed 243-qid candidate has one explicit Current owner addition from the E reconstruction;
- System membership does not invent Question→Block / Logic Group / KP relations;
- unavailable historical HLK raw bytes are not falsely claimed as freshly re-hashed.

Current cross-System owner repair:

- `xizong-official-2022-n032` asks the most common hematogenous metastatic site of prostate cancer;
- its broad historical pathology route sits inside the reproductive-system chapter, but Current E explicitly excludes prostate Primary;
- A3 Block13 explicitly owns prostate-cancer organ-specific diagnosis/task Primary.

Therefore the qid is added to A3:

```text
historical reviewed A3 candidate = 243
Current E-source → A3 transfer    =  +1
Current exact A3 scope            = 244
inventory SHA256                  = 92685b073b9cbf00f67a61442872c1fea4ccf01fe50987e12e4ca646c90751c5
```

This is an S-owner correction only. The accepted P/R/E mechanics remain unchanged and are content-versioned; no learner progress is inferred.

Validation evidence: GitHub Actions run `34713324100` passed the Source closure suite.

Gate-order invariant:

> **S validates stable System identity + Source owner + Current Question Truth. S must not depend on accepted K.**

---

## K — PASS

Accepted owner:

`content/xizong/knowledge/systems/a3-urinary/system.json`

Accepted System model preserves:

- mother model = **灌注 → 滤过量/选择性 → 分段小管处理 → 髓质梯度/末端激素调节 → 尿液证据 → 尿路运送/储存/排空**;
- nine Failure Modes covering perfusion, filtration/Kf, barrier leak, tubular transport, concentration/dilution, immune glomerular injury, infection/inflammation, obstruction and structural/mass/trauma failure;
- first-fault localization and syndrome/pattern/etiology judgment axes before precision details;
- normal-function foundations before evidence language and disease branches;
- System Recall that restores the neutral mother model and reverse-localizes cases before drugs, thresholds, procedures and Source Precision;
- higher endocrine, immune, tumor-general, ICU/fluid-resuscitation and cardio-pulmonary-renal SuperSystem models as external boundaries.

No Block reopen was required.

K also closed the shared gate inversion where Chat-approved System ownership accidentally implied Astro projectability. Scoped `P PASS` is now required before projection. Validation evidence: run `34716982717`.

---

## L — PASS

Accepted learner path:

```text
System orientation in KianOS
→ B1…B14 in the accepted direct route
→ current Block focus / stop-line / ordered Logic Group
→ continuous original Lecture contact on iPad / MarginNote
→ active retrieval only after relevant formal learning contact
→ Logic Group closure
→ Block Recall
→ after all 14 Blocks are actually learned: pre-question System Recall
→ official A3 System question sweep from the accepted 244-question scope, preserving learner-selected whole-paper holdout
→ Wrong / Uncertain smallest-sufficient repair through reviewed relations only
→ short post-question System reconstruction
```

Surface ownership:

- **iPad / MarginNote** → primary continuous Lecture/source reading, original figures/tables, annotation, source-local examples and Lecture-attached questions;
- **KianOS** → System/Block orientation, attention boundaries, selective cues, active Recall, closure, compression, W/U routing and later review;
- **Chat** → adaptive explanation, linking and repair; not the default continuous Lecture reader.

Important L invariants:

- KianOS must not become a second primary Lecture reader;
- Lecture-attached questions remain on the original Lecture/MarginNote surface;
- System Recall is never authorized before the real learner has completed the System;
- official System questions do not own the learning sequence and do not create inferred Question→KP relations;
- B5 project Lectures remain Primary; admitted external material is narrow supplementation for expected compensation / mixed acid-base diagnosis only;
- L PASS is path acceptance, not evidence that Kian has begun A3.

Validation evidence: run `34717326529`.

---

## P — PASS

Accepted projection owners include the shared Xizong loader/projection helpers, System/Block pages, `XizongSystemWorkspace.astro`, `XizongBlockV6.astro`, `XizongStudyEnhancer.astro`, and the later System Exit components.

Accepted behavior:

- System projection foregrounds Mother Model, variables/relations, judgment axes, Failure Modes and B1→B14 route rather than reproducing a second textbook;
- Block projection foregrounds focus / stop-line / Logic Group continuity, while full web Core remains need-based reference;
- the learner dock explicitly points to `iPad / MarginNote · 原讲义定位`;
- Lecture-attached questions stay external-primary;
- first-pass compact System Recall stays hidden and later System Recall + official questions remain downstream/collapsed;
- the 244-question sweep loads Current Question Truth directly and does not fabricate missing Question→Block/KP relations;
- the shared loader supports canonical A3 prefixed `..._BlockN_...md` files without duplicate assets;
- scoped `P PASS` is the projectability gate.

Validation evidence: run `34717668942` (#172) and final P-head run `34717759514` (#174).

---

## R — PASS

Runtime acceptance preserves:

- browser-local resumable state without pretending it is cross-device/server progress;
- explicit learner confirmation of external original-Lecture contact;
- KP Recall only after formal KP learning contact;
- Block Recall only after complete KP Learn + Recall;
- Block completion only after Lecture contact + KP Learn/Recall + Block Recall;
- System Recall completion only after all 14 Blocks complete;
- System sweep only after whole-System completion, current System Recall and learner-selected whole-paper holdout;
- stable correct question work has a direct no-repair path;
- W/U only enter repair;
- precise repair is reviewed-relation-only and missing mappings stay missing;
- learner state never mutates medical Core, Source or Acceptance Truth.

A real R defect was closed: System evidence versioning now includes Current System hash + A3 learning-support hash + deterministic hash of all 14 projected Block id/path/source contents + question scope/inventory/explanation/relation evidence. A changed Block therefore invalidates old System Recall/sweep/repair evidence rather than leaving it falsely current.

Durable Runtime validation lives in `static-web/scripts/validate-xizong-a3-runtime.mjs`.

Validation evidence: run `34718165223` (#176) and final R-head run `34718263667` (#178).

---

## E — PASS

Evidence acceptance is based on the current shared Block/System evidence model plus the A3-specific probe.

Accepted evidence semantics:

1. **Normal Block evidence has one writer.** `XizongMemoryReviewV6.astro` owns normal KP Recall history, Memory state, Chat repair plan state, repair ratings and Study Packet evidence. `XizongBlockEvidenceGuard.astro` owns Current-version archival/reset only; it does not compete for normal evidence writes.
2. **Every real Recall attempt is evidence.** Each actual KP Recall rating click appends a `KP_RECALL` event, including repeated identical ratings. Existing browser state may be bootstrapped once, but bootstrap deduplication must not collapse later genuine attempts.
3. **First Recall is not rewritten by repair.** Weak Recall may enter selective Memory. Memory `STABLE` can clear the current weak queue, but the original Recall remains historically intact.
4. **Repair is not mastery.** Chat-plan review and System W/U repair imports are explicitly `REPAIR_ONLY`. `known/mastered` may close an active repair task but cannot rewrite original Recall or auto-promote mastery. Stronger closure requires later meaningful fresh Recall/transfer when the learning contract calls for it.
5. **Stable correct work does not manufacture debt.** Stable correct System-question work has a direct pass path. Only Wrong / Uncertain enter the repair handoff.
6. **W/U routing preserves truth boundaries.** Chat returns are scoped to actual current W/U question IDs. Block/KP delivery uses repository-reviewed relations only; absent precise relations remain absent.
7. **System→Block repair is cross-tab safe.** The System page writes an independent `repair inbox`, not Block study evidence. `XizongRepairInboxBridge.astro` consumes the inbox into the shared Memory repair-task owner, scopes plans to real current Block KP IDs, preserves `sourceQuestionIds` plus `SYSTEM_WU_CHAT_RETURN` origin, and announces the migrated state without manufacturing Recall/mastery evidence.
8. **Repair-inbox consumption is fail-closed and idempotent.** The Block evidence store must be written successfully before the inbox is cleared. Repeated delivery is deduplicated by inbox identity rather than silently duplicating import evidence.
9. **Open Block tabs receive repair safely.** The bridge listens for the browser `storage` event and emits `kianos:xizong-repair-inbox-migrated` after atomic Memory repair-task migration; an already-open Block tab can receive the repair without a second semantic owner.
10. **Stale evidence fails closed.** Block source/System source/learning-support changes archive and invalidate Block progress/evidence and pending repair inbox. System-level content/question-evidence changes archive/invalidate System Recall, sweep, repair state, question-derived Block plans and pending Block repair inboxes.
11. **System Recall phases stay distinguishable.** Evidence records PRE_QUESTION / MID_SWEEP / POST_QUESTION rather than flattening every System Recall into the same event.
12. **Holdout remains private learner strategy.** Learner-selected full-paper years are browser-private and excluded wholesale from the ordinary System sweep; shared Current never hard-codes Kian's chosen years.
13. **Evidence granularity does not force workflow granularity.** Internal KP/question evidence may be fine-grained, while the learner-facing path remains Block / Logic Group / System oriented rather than turning first learning into compulsory isolated cards.
14. **Learner evidence remains private.** Progress, Recall history, Memory, W/U results, notes, holdout choices and repair state remain browser/conversation Learner Truth and do not mutate Artifact or Acceptance Truth.

A real E defect was closed during this audit:

> Multiple components/pages could write the same Block evidence document. This could collapse repeated Recall evidence or allow stale in-memory state to resurrect/overwrite repair tasks. Normal Block evidence is now single-writer, while cross-page System→Block repair uses an atomic inbox/bridge handoff with write-before-clear, provenance, idempotency and version invalidation.

Durable validation:

- `static-web/scripts/validate-xizong-a2-evidence.mjs` → shared A2 Evidence regression;
- `static-web/scripts/validate-xizong-a2-repair-return.mjs` → shared repair-return regression;
- `static-web/scripts/validate-xizong-repair-inbox.mjs` → shared inbox/bridge contract;
- `static-web/scripts/validate-xizong-a3-runtime.mjs` → A3 Runtime regression after Evidence changes;
- `static-web/scripts/validate-xizong-a3-evidence.mjs` → A3 Evidence acceptance.

Validation evidence: PR #46 candidate head `c3d68ccbc88a592c54eee3dbd9e5154da789b53d`, GitHub Actions run `34720315859` (#194) completed successfully with:

- `Validate A1 learner contract` → PASS;
- all three A3 Source validators → PASS;
- `Validate A2 runtime contracts` → PASS;
- `Validate shared repair inbox contract` → PASS;
- `Validate A3 runtime contracts` → PASS;
- **`Validate A3 evidence contracts` → PASS**;
- `Build Astro` → PASS.

Runs `34718609160` (#180) and `34719882688` (#181) were superseded failed candidates caused by stale A1 validator expectations during the Evidence-contract migration; they failed before the A3 Evidence step executed and are not A3 Evidence failure evidence.

---

## U — UNTESTED

All engineering acceptance gates are now closed:

```text
S / K / L / P / R / E = PASS
```

The strongest allowed readiness statement is:

> **A3 is module-ready for learner test.**

U requires real learner use. It cannot be closed by CI, simulated clicks, architecture review, another model, or this Acceptance document.

When Kian actually begins A3, validate the real path as used, for example:

- first-learning / MarginNote handoff / return;
- KP + Block Recall flow;
- resume across study sessions;
- later System Recall → official-question sweep;
- Wrong / Uncertain → Chat → repair inbox → owning Block → return to questions;
- sustained friction, density and surface ownership in real study.

Do not infer that any of these paths have already occurred.

---

## Truth boundaries

### Artifact Truth

- Source scope → `content/xizong/knowledge/learner/a3-urinary-question-scope.json`
- System Knowledge → `content/xizong/knowledge/systems/a3-urinary/system.json`
- medical Core → `content/xizong/knowledge/systems/a3-urinary/blocks/`
- lane Learning constitution → `content/xizong/LEARNING_CONTRACT.md`
- shared study policy → `content/xizong/knowledge/learner/study-policy.json`
- A3 learning support → `content/xizong/knowledge/learner/a3-urinary-learning.json`
- B5 external Source contract → `content/xizong/knowledge/learner/a3-urinary-b05-external-source-contract.json`
- Projection / Runtime / Evidence mechanics → `static-web/`
- Current Question Truth → `content/xizong/questions/`

### Acceptance Truth

This file.

### Learner Truth

Private learner/browser/conversation evidence only. No engineering gate in this file means Kian has begun A3.


<a id="a3-b06-b07-deep-model-quality-20261008"></a>
## 2026-10-08｜A3 B6–B7 Content-first 连续模型与原 Prompt 内容验收

**范围与阶段：** [#1113](https://github.com/kianwang022-hash/kianos/issues/1113) 当前以 **Content 先行**；本批仅 B6、B7，随后 B8–B10→B11–B12→B13–B14→B→C/D/E/F。A1/A2/A3 B1–B5 已有接受结果不重复生产。Website/Runtime/浏览器/整链 Memory consumer 属后续集成阶段，不作为本批医学内容的前置条件。本批不做新 Memory admission 或系统性 Question→KP 逐题审核。

### 与原 canonical 的实际内容变化

- B6 **16 KP**：连续模型建立入球→肾小球→出球/管周血液路径，与滤液经肾小管成尿两路，重吸收/分泌跨路；屏障漏、近端回收失败、溢出负荷、下游细胞加入与管型形成是不同入口，尿成分/总体清除/侧别功能为并行证据。原16 KP Core、完整正式标题/Prompt及 Source 均未改变。
- B7 **20 KP**：在时间背景上区分肾前/肾实质/肾后致 GFR 下降的不同机制；ATN 及小管功能恢复有条件，不把全部 AKI 强排少尿→多尿三阶段或认定尿量增加即 GFR 正常；CKD 清除、EPO、VitD与心血管后果并行；排磷减少与维生素D活化不足分别输入 CKD-MBD/PTH；KRT 按实际内环境危险评估。
- **B7 原 Core 医学最小修正仅 KP02、KP04、KP05、KP11**：KP02 不把全部肾性 AKI 等于 ATN；KP04 明确损伤可在初期出现；KP05 将再生/多尿限定于有恢复能力的小管损伤并保留不完全恢复可能；KP11 从磷排泄与钙三醇减少的两个来源解释 PTH、骨转换和矿化的条件分支。所有其他 native Core 及完整原 title〔Prompt〕不变。完整逐行改动可查本批 PR diff，避免在 Acceptance 复制第二份医学 Core。
- 内容核对：**36 个**原KP身份、原标题和完整正式 Prompt 与合并前 main 逐项相同；每项在当前 §1A 自然节点 **恰好一次**。遮住注释，B6 血/滤液分流、多个证据/观察轴，B7 第一故障、条件恢复、平行 CKD 后果与风险回馈仍能连贯读出；不是用 KP 列表生成医学因果关系。已有 Learning 只修改 B6/B7 recall spine 与 B7 LG02、LG04 的明确关系/闭合语句，无成员重排。

### 知识边界、Source 与既有 Memory

- 原讲义 Source 为 `source-snapshots/27/内科学讲义_AI阅读版_27精编_UnifiedSource_v2.md`，印刷 P151–P153 对应原 PDF 物理 P185–P187。医学交叉限于 [Merck Manual: AKI](https://www.merckmanuals.com/professional/genitourinary-disorders/acute-kidney-injury/acute-kidney-injury-aki)（AKI 病因/尿量/恢复）及 [KDIGO CKD-MBD 2017](https://kdigo.org/wp-content/uploads/2017/02/2017-KDIGO-CKD-MBD-GL-Update.pdf)（P/VitD/PTH、骨转换/矿化），不扩写治疗指南或重定义教材 Source。
- 原五项 B6/B7 prepared Memory/Precision 的完整答案、助记、admission、ID、顺序、Core refs、Source 和私人历史保持；只同步现有 `owner_sha256` 依赖见证。原 `shared-fields.json` 不动。所有原 Source、MedicalVisual、真实 HOLD 保留；讲义旧教学文件仅保留 provenance，不变成第二模型。派生 A3 projection 仅跟随同一个已变 Learning owner 更新其既有版本见证。
- **真题不在此次 Content 写入范围**。曾在候选中产生的17个 Question relation/shard/manifest 变动已从 PR #1283 全部撤回；本次不签 Question 重审/批量 witness、不改变正式题干答案与 KP targets，已有 stale/HOLD 继续交回 Question owner。

### 能证明什么、不能证明什么

原候选的内容检查记录为 **288** 项 PASS；A3 prepared Memory与 preentry 的既有独立检查有已完成记录，但后续完整 CI 曾在旧 B6 prepared descriptor golden 的 revision 比较处失败；其余全站构建被独立 Politics source revision mismatch 阻断。该 descriptor 比较不等于答案丢失，**不记为 PASS**。在 Website 阶段需按真实消费者重新核对受影响的原修订，不以删测试或重写卡片规避；浏览器、Stable、Source PDF 新像素接触与 Kian 真人学习仍未验收。本批内容质量不从这些未验证项外推。提交合并和 main readback 以实际 PR 回执为准，不提前声明。

