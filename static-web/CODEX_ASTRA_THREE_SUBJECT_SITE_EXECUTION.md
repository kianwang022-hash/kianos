# KianOS｜Astra 三科整站执行总提示词

Version: **3.2 · FRAME-BASELINE INTEGRATED EXECUTION**  
Program: **#113** · Execution: **#148** · Work cursor: `static-web/CURRENT.md`  
Scope: **Politics + English + 本轮 A1/A2/A3 Xizong + Global Home**  
Status: **执行交接，不是实现、独立验收、部署或 learner U 的完成声明。**

## 0｜一次授权，连续完成；工程分段不等于人类分段操作

Kian 已选择：**用已经备份的三科文字框完成整站，再由 Astra 在该基线上自主优化，最后统一体验。** 不再每完成一页、一个 PR 准备动作或内部 Stage 就要求 Kian 复制下一段指令。

本文件是完整执行总入口；#148 收窄实际集成任务，#113 负责全局调度。#139–#143 保留各自产品范围和验收责任，成为内部检查账本，而不是连续执行中的人工闸门。旧文档/Issue 的逐 Stage STOP、下一科必须等上一科人工验收并 merge 的执行节奏被本模式取代；学习合同中的真实先修/证据条件没有被取代。

交付的是同一网站：

| 范围 | 必须覆盖的产品族 |
| --- | --- |
| Politics | Home/Continue；五科/章节/NU；五科认知展示；外部 Chengfeng 学习衔接；肖1000工作台；有价值的 Wrong/Uncertain、source/repair/exact Return |
| English | Home/Resume；Reading A；Cloze；Part B 四种原生 form；Translation；Small/Big Writing；Objective/Translation/Writing 三份 Guide；Current Lexical 只读 handoff/Return |
| Xizong | A1/A2/A3 的 Home/Continue、System Guide、Block/LG、连续讲义 handoff、KP Front/Reveal、LG closure、Block Recall/Complete、按需 After Learn、System Recall、合法系统题/repair/Return |
| Shared | 共用 shell/导航/控件/排版/保存与错误反馈；最后整合 Global Home 和跨科往返，不做三个孤立 demo |

连续执行分为 **Pass A 忠实落实基线 → Pass B 统一 polish → Pass C 集成验证与最终人工体验**。每步允许内部小提交、自动测试和可恢复检查点；不意味着一份无限上下文、一个不可审查巨型 PR、后台无限运行或跳过验证。资源/环境中断时保存准确断点，下一次继续同一 #148，不重开产品讨论、不冒称整站完成。

## 1｜恢复全局，按当前任务族读取真实 owner

先读 `AGENTS.md`、`BRANCH_LIFECYCLE.md`、最新 `static-web/CURRENT.md`、本文件、#113/#148、实际活动 PR 的 head/diff/receipt。已有未提交工作和他人分支不覆盖。相同且未变的资料不反复仪式化读取。

建立一次简短的全局读回：三科当前可用范围、已有实现/证据、活动 writer/branch、尚未完成的产品族、真实依赖与独立内容线。每个任务族施工前理解 **入口 → 学习/作答动作 → 写入状态 → 正常出口 → 修复 → 精确返回**，不是给 learner 增加六个步骤。

共享：`static-web/PRESENTATION_CONTRACT.md`、`KIAN_UI_PREFERENCES.md`、`UI_STYLE_BRIEF.md`；触及内容演化时查 `PROJECT_DEFINITION.md` R10 / `ARCHITECTURE.md` 对应规则。

| 科目 | 必要读取链 |
| --- | --- |
| Politics | `content/politics/CURRENT.md`、`LEARNING_CONTRACT.md`、`INTERACTION_CONTRACT.md`、`CONTENT_SEMANTICS_CONTRACT.md`；`static-web/POLITICS_PRODUCT_STATUS.md`、`POLITICS_PRODUCT_BRIEF.md`、`POLITICS_UI_REVIEW_PROTOCOL.md`、`POLITICS_LEGACY_FUNCTION_PARITY.md`；`content/politics/projection/manifest.json` 与五科代表 Current teaching/Projection；实际 loader/runtime/evidence/Return |
| English | `content/english/CURRENT.md`、`LEARNING_CONTRACT.md`、`PROJECTION_CONTRACT.md`；`static-web/ENGLISH_PRODUCT_STATUS.md`、`ENGLISH_PRODUCT_BRIEF.md`；Objective/Translation/Writing 各自 Current/实际 runtime/evidence、三份 Guide owner/loader |
| Xizong | `content/xizong/CURRENT.md`、`LEARNING_CONTRACT.md`、`knowledge/learner/study-policy.json`；`static-web/XIZONG_PRODUCT_STATUS.md`、`XIZONG_PRODUCT_BRIEF.md`、`XIZONG_UI_REVIEW_PROTOCOL.md`；System Guide/Block Workspace/System Completion 详细设计；A1/A2/A3 scoped Current/Acceptance、Projection contract/manifest、异质 System/Block/KP Core 与实际 runtime |

以上相对文档与其表内目录对应。核对实际 **route → loader → component/enhancer → CSS → DOM**，不把未挂载组件当当前网页。先读懂三科差异，深入内容只选覆盖真实类型的代表样本；程序可以全量枚举，不让模型逐题逐段重审。

领域知识、学习/状态语义以其 canonical owner 为准。构图采用下节的已选档案；后来的用户明确决定优先于旧框中已过期的内容要求。局部冲突只处理其最小责任范围，不能用最新 assistant 总结冒充用户历史确认。

## 2｜文字框就是当前构图基线，但必须配对同一页面状态

完整档案：`static-web/design-archive/2026-09-14/THREE_SUBJECT_TEXT_FRAMES_V2_1.md`。原 blob 为 `5736d8570d068961b6172cc674712950a3b0a228`；不可变指针为 `static-web/design-archive/THREE_SUBJECT_TEXT_FRAME_BASELINE_2026-09-14.md`。两者不修改、不删除、不重新指向。

读取当前任务族的 E/P/X 框及其原说明，忠实保留区域职责、信息顺序、同时可见关系、导航/Return、正常/问题/保护状态、Mac 横屏密度。不要再从空白重新设计页面。

**状态不能错配：P10 是答题中的 clean attempt，不是开始前 Setup；P11 是提交后复盘。** 框对某个状态没有画出完整构图时，依照已有产品行为和共享紧凑布局规则完成必要适配，明确是实现补足；不能声称它是已经恢复的历史视觉定稿，也不能删除合法 Setup 来模仿 P10。

`DESIGN_VERBATIM / DESIGN_BEHAVIOR / EXECUTION_SYNTHESIS` 保持原来源含义。档案不是原聊天完整恢复的证明，也不是已验收的像素设计稿；但不能借此忽略已经确定的构图关系。

- ASCII 边框不等于大卡片；示意空白不等于固定留白；省略号不等于正文可删。
- 比例若写“约”，可按真实内容宽度调整；不能强制空左栏、过长行宽、层层容器或不必要 min-height。
- 短题可以有合理留白，不用统计、推荐、假进度填空。Setup 要紧凑、任务入口清楚；长内容要完整可读，不以缩字/截断/反复展开换整洁。
- 只比较同 route/state/data/viewport 的前后结果，不能拿长题与短题或 Setup 与 Submitted 推导“更好”。

## 3｜权限与可演化展示：优化语法，不逐实例装修

学习语义、正式题目/答案、first attempt、Evidence、Memory admission、holdout、新鲜度、source ownership、Repair/Return、真实学习前置、结果权限不因美化改变。`No mandatory ritual` 取消无价值动作，不取消领域真实学习责任。

Astra 自主负责组件分解、排版、行长/字号、间距/对齐、按钮/输入、焦点、错误/保存状态、可访问性、响应式和克制微动效。在固定构图内解决真实浏览器问题，不让 Kian 审批每个 CSS 细节。结构替代不是默认任务；确有明显收益可保留最多一个隔离、可回退局部备选，未经接受不得覆盖基线或阻断其余已确定页面。

正确生产链：

```text
Current Content/Learning
→ 已批准 Projection / 确定性的结构引用
→ 科目/任务族 ViewModel
→ 通用认知表示 + 已选工作区构图
→ Current Runtime/Evidence/Return
```

一个 Block/NU 可以同时包含多个 role/geometry 对象。按 schema、语义类型、状态和真实内容长度适配；禁止按疾病、章节、KP、题号或单词写特殊页面分支。禁止让运行时 LLM 猜因果或为每条内容重新设计。

实际资产成熟度不可虚报：西综当前有 rich calibration 与 baseline-only 引用，Projection 不替代完整 KP Core；政治 projection_shape 名称不等于完整边/节点数据；英语 Guide 主要仍为结构化 Markdown。只有明确合法节点/边/关系才用图形 renderer；合法结构正文用可靠 AST/section parser 完整承载标题、段落、嵌套列表、表格、公式、代码块逻辑、图与来源。识别 code fences，不能误拆其内部标题。不凭箭头字符或标题新增医学/政治关系。

缺失/歧义/stale binding 对受影响对象 fail closed，列准确 owner，不用旧正文、OCR或AI摘要补位。合法文本表示不是失败，但不能把它冒充已完成的 rich geometry。新语义类型只扩展一次 renderer，常规内容编辑走绑定重验/编译，不重做网页。

Lexical 审查升级、西综 B–F 内容建设不被 UI 冻结。本轮 Xizong 展示范围仍为 A1/A2/A3；不为未来系统预造布局或猜内容。A 是当前 corpus，不是永远 hard-code 的产品范围；以后受支持 schema 下新增 eligible 内容由同一适配链接入。

## 4｜Guide：体系入口常在，不成为每次必走流程

**Persistent reference, not persistent workflow.** 初次快速建模与后续针对性回看都合法；完整但可跳，不是打卡课程，也不是只能做错后才有资格进入的帮助页。

| Guide | Current owner | 现有入口 |
| --- | --- | --- |
| Xizong System Guide | 各 System `system.json` + `content/xizong/projection/**/system.projection.json` | `/xizong/[system]/`；按实际 loader 接入 |
| Objective | `content/english/modules/objective-learning.md` | `/objective-learn/`；Reading/Cloze/Part B 用稳定 anchors，不复制三篇 |
| Translation | `content/english/modules/translation/learning.md` | `/translation-learn/`；`learning.reference.md` 保持深层参考 |
| Writing | `content/english/modules/writing/learning.md`；`static-web/src/lib/englishWritingLearning.mjs` | `/writing-learn/` |

Practice/Continue 是日常主动作，Guide 是稳定、直接可见的次级动作，不能只藏在 Home 默认折叠的 First Learning 中。首次可安静提示但不强制 onboarding、不编造阅读分钟数、不用“读完”制造学习证据。

Guide 保留完整模型、必要例子/限定/边界，可滚动跳转；不逐段点开，不削成一屏摘要。Guide 阅读位置独立于 productive Resume。任务进入 Guide 再返回须保留原 attempt、题/句段、System/Block/LG/KP、模式和合法位置；不覆盖首答/首稿。

受保护 Recall/考试状态不因 Guide 入口/预览/侧栏泄漏内容；主动辅助访问按该任务既有规则处理，不把受提示结果仍当 pristine attempt。Politics 使用自己的 chapter/NU orientation，不为三科对称再造 Guide 或第二套 Chengfeng 课程。

## 5｜English：完整任务对象与输出能力

共同闭环：**真实任务 → 快速判断 → 稳定则退出 / 有价值的最小修复 → 必要时 learner 自己再执行 → 回真实任务。** 整篇/整套/整文是 attempt/review context，修复可以局部，也可以处理真正 coupled failures。Same-item repair 不等于 mastery；dormant pending claim 不召唤任务、不抢 Resume。

Objective 共享 represent/demand/candidates/evidence/adjudicate/execute 内核，但 Reading 判断选项命题，Cloze 判断 slot best fit，Part B 重建 discourse map；不能套成一种单题 quiz。Guide 的 Global Map/Core 建体系，Skill Map/Deep 是可定位参考，不变待办。

Translation：**Represent → Reconstruct faithfully → Deliver**。Fidelity 是意义守恒护栏，不是第四门课；上游 scope/reference/attachment/relation 失败不重复计算所有下游弱点。保留 first translation；必要修复由 learner reconstruction；reference 非唯一合法措辞。

Writing：**Task/Genre → Content Generation → Organization/Development → English Realization → Register/High-value Control → Timed Delivery**。Small/Big 是任务分化。保留 Current function matrix、material→meaning、信息增量逻辑；Direct mode 合法，无 first plan 就不伪造；revision 不覆盖完整 first draft。

| 任务族 | 空间/行为必须保留 |
| --- | --- |
| Reading A | Mac 全文与完整题组并行、分别滚动；active question 只是键盘目标；整篇提交；提交前选中不暗示正确；W/U 原位展开不丢全文/全题 |
| Cloze | 全文 + 同一 sheet 全部20 blank rows；A/B/C/D 横排优先，长选项可自然换行/2×2；blank-row 联动；改答/不确定/轨迹/整篇计时/一次提交，不拆成20个wizard |
| Part B | gap/heading/ordering/comment–statement 四 forms；完整材料、候选池、41–45 map；givens及repeat/single-use按source；Ordering有Order Map；不编造缺失限制、不拆散swap/cascade |
| Translation | 源文与完整目标译文同时可见、句段定位；first translation、局部revision、可选reference、timing/history/Resume保留 |
| Writing | prompt/原图材料/requirements与dominant authoring并行；可选轻plan、Direct同等合法；quiet timer/word count、完整first draft+revision；范文不接管clean generation |

正文选词/短语只读路由 Current Lexical，能解析的对象才给精确入口；lookup 不制造 mastery/repair，不新建局部词库。网页拥有写作工件，Chat拥有需要时的语义讨论；不为显示同一份分析强制JSON来回，不伪造真实Chat回执。

验证：每个任务族完整fixture，Part B四forms，三份Guide首次入口与修复定位入口，first artifacts保护、W/U、整套context、Direct Writing、Resume/Return。使用已公开练习/合成fixture，不消耗protected unseen。

## 6｜Politics：五科认知与肖1000工作台

完整主线：**Home/Continue → subject/chapter/NU orientation → iPad/MarginNote原始Chengfeng连续学习 → 可选轻闭合 → Current first-ready肖1000 → 稳定正确快速继续 / Wrong或有意义Uncertain最小修复 → owning source/Chat → exact Return。** Suyi有用结构已吸收，不另开课；optional close不取消内容学习前置。跨NU题目命中不把未来NU教学拉入当前。

五科原生表示：马原的概念拓扑/机制/推理/边界及显式多map；史纲的阶段/时间/原因层级/过程/转折/评价；毛中特的历史问题→理论回答→理论序列位置；习思想的身份、角色、目标/原则/保证/路径及固定表述；思修法基的概念边界、规范判断、情境应用。时间先后不自动是因果，角色对照不凭空变树，REFERENCE_ONLY不升教学，null不补，first_round_exact不扩大。Memory/analysis-output/Mock由阶段和证据激活，不是一轮背诵墙。

### 肖1000：P10/P11 + 最新Current语义

复用 `POLITICS_LEGACY_FUNCTION_PARITY.md` 的完整能力账本，不重新到Legacy考古或回植旧backend。

Setup保留Continue/Resume、subject/chapter/NU/type/count、普通/random/wrong/favorite；仅有reviewed细粒度映射才有对应筛选。它是独立的紧凑启动状态，不冒充P10。

P10 clean：compact scope/progress/mode/signals task bar → verified meta → full-width stem → 合适时2×2 options → timer/input hint/submit。Single/multiple、Normal/Fast、Favorite/Uncertain/discussion、改答轨迹/计时保留；clean不出现结果/解析/固定知识复盘栏，不新造question map。

P11 submitted：

```text
左：结果 → 一句话带走 → 我的答案/正式答案 → 必要missing/extra → optional cause/note/save state
右：完整AI精炼解析 → Current/Chengfeng来源 → Next / exact Unit-or-origin Return
```

历史约32/68为可适配比例，不固定空左栏。完整 `takeaway + chat_explanation` 按stable question_id消费；题干/选项/正式答案仍来自Current Question Truth。源资产可留provenance，但 `xiao_reference`/肖1000原解析不得进入learner catalog/serialization/render/reveal/fallback；不得用OCR填缺。真实可用且answer-safe的原始**题面图片**与原解析隐藏是不同能力，不一起误删。

#124原promotion及#144包装修复已存在，不重生成1148条。校验压缩与解压字节按manifest实际口径；missing/stale/duplicate/unbound fail closed，不fuzzy match。#117曾报告1148解释精确绑定、1127可练/21缺canonical NU保护；以后按Current ownership程序枚举，不写死21黑名单、不把保护禁用称为全1148题可练。准确缺口继续进入既有#116能力账本，不为了整站体验猜配。

Single+Fast先保存first attempt再稳定正确推进；Wrong/meaningfulUncertain不被跳过；multiple显式submit。Favorite/Uncertain/discussion/Wrong/cause/note含义不同；修复不覆盖首答，存储失败不伪装推进，refresh/Next/离开不丢note。No due/D1-D3-D7，不新增mandatory结构/易混/diagnosis。Session summary、真实practice统计和phase-owned review按能力账本处理，不自动变Home dashboard。

**P-J1–8**：single Normal；multiple显式提交与delta；correct结果且无原解析；Wrong/source/note；Fast与W/U停留；signals及wrong/favorite重入；refresh/immutable first attempt；NU→题组→source/repair→精确原题/NU返回。另测storage失败、stale/缺失解析、无owner目标；五科认知另选异质样本，不能以工作台截图代表整政治。

## 7｜Xizong：Guide以外的完整层级与逻辑

本轮只消费A1/A2/A3及各自Current许可；B–F可独立建设，但此整站任务不读取其内容猜设计或提前启用。

```text
System orientation → Block orientation → 当前LG goal/closure/KP返回路线
→ iPad/MarginNote连续学完整LG → 一次真实讲义接触返回
→ 该LG KP主动Recall → LG closure → 下一LG
→ Block Recall → Block Complete → 按需After Learn/回System
→ 实际System学完后：System Recall → 系统题sweep → W/U修复 → 题后短System reconstruction
```

不删LG，不按KP反复切设备；原图/表/例子/旁注/配套题仍在原讲义连续学习。正式接触、主动Recall和合法completion证据不能被Politics optional close或反仪式口号删除。KP一次不稳不无限阻塞；Block Recall done不等于Block completed。

System Guide完整承载mission/spine/parallel controls/variables/relations/judgment axes/failure/Block route等合法对象；不猜缺节点。Block保留LG map、dominant stage、薄位置条/conditional context，完整orientation不另藏“看完整定位”；source locator/连续范围/KP返回路线在所需时机可见，不猜页码。

KP Front是**整workspace** answer-neutral：标题、Core、Precision、Visual、Guide、tooltip/dock都不得侧漏。Reveal后显示完整canonical Core的关系、公式、表、条件、边界、图，不自动摘要。Block Recall用centerQuestion与中性LG scaffold，Reveal才显示合法recall spine；System Recall独立保护，不透明覆盖答案Guide；scratch可选。PRE/MID/POST不混证据；快捷评分服从实际Reveal/rating前置。

保留 `CURRENT_CORE / RESERVE_LEARNING / CONNECTION_HOOK / DEFERRED` 各自身份/时机；Precision非新mastery阶段，Hook非自动Memory。A2 Visual/Precision/Connection不被共用组件丢弃，也不要求A1/A3伪造同构。弱Recall证据即时保留，处理不强打断LG；After Learn只显实际有内容的Memory/Reserve/Chat Repair，空类别不占台面，Memory/REPAIR_ONLY/Recall evidence不可互盖。

系统题输入与反馈权限独立：实际A–E对应1–5，Normal选择后Enter，Fast单选可直接提交，多选总是显式提交；输入框/IME优先。Immediate下西综correct+Marked可继续，Mark是回访信号，不能套Politics Uncertain停留；Wrong先Quick Review、Enter继续、Space按需深解，M自由标记，不逐正确题问“稳吗”。

Hidden只显current/answered/unanswered/marked；颜色/排序/计数/题图/tooltip不泄对错。全卷默认Hidden、主动揭示守原规则，不把中途看答案仍称pristine。精确Question→Block/KP repair只用reviewed relation，没有则题级修复，不猜。

全卷runtime、phase-aware多轮attempt等按实际实现核对：holdout存在不等于完整全卷产品已实现。真实兼容缺口只冻结该链，保护first evidence，不以空入口冒充完成，也不阻塞已可渲染的System/Block。

验证：3种System、rich calibration、至少一个baseline-only及长KP Core；LG连续学习往返、KP Front/Reveal、LG/Block closure、System前后Recall、Hidden/Fast、holdout/source/repair/Return。程序全量eligible资产/ID/binding/type/visibility，视觉按类型和状态，不逐805 KP签字。

## 8｜Astra自主完成的视觉与交互工作

按 `UI_STYLE_BRIEF.md` 实现专业知识工作台的内容组织和现代桌面产品完成度。共享tokens/控件/焦点/保存反馈，三科任务原生构图不同。字号不能小，行长舒服，横屏利用有目的；不用卡片套卡片、巨大Hero、工程badge、假dashboard装饰。短状态紧凑不强撑整屏；长内容有完整层级、不删信息。

先保留可回退baseline实现/截图，再统一polish。字体、spacing、对齐、列宽适配、divider、icon、按钮层级等普通细节不请示；只在基线关系内优化，不重新发明单页课程/导航。用真实截图自查，不能因为测试绿或框中字段齐就交差。

微动效只解释hover/focus/选择/展开/submit/Reveal，不延迟动作；无spring/bounce/大面积飞入/stagger/滚动表演。Respect reduced motion；可见焦点、非仅颜色状态、键盘与中文IME安全；保存/loading/error稳定且可恢复。新dark mode不是本轮目标，已有合法主题/无障碍不删除；窄窗只作可靠fallback。

## 9｜机器检查持续，人工只验真正有价值的体验

执行时全量枚举当前受支持corpus，验证ID/binding/source freshness/schema/合法visibility/required内容/引用路径/unknown geometry/route build。合法内容变化有正控制；stale、缺失、错型、答案泄露与保存失败有负控制。保护态覆盖DOM、accessibility tree、侧栏、tooltip、筛选统计与焦点，不只主卡片。

复用实际 `static-web/package.json` 的QA/build命令与lockfile安装方式：Politics、Objective、Translation、Writing、Xizong及受影响的Lexical/shared checks。合并重复build，不删除失败断言换绿。**不重做已完成实现 ≠ 不重跑受影响测试。** 旧PASS只证明其对应SHA/fixture；共享CSS、loader、状态或Return变化后做必要回归，不把旧收据自动移植到新head。

浏览器抽样覆盖每种任务族/表示类型和关键状态、最长内容、多关系、稀疏内容、窄窗、错误/保存失败。记录commit、route、data、viewport与操作，比较同任务前后截图。正常运行期间发现scope内bug自主修复，不返回长计划代替动手。

代码/build/自动浏览器测试可用正式合法资料，但使用隔离profile，不打开或写Kian真实learner storage，不消耗protected unseen/holdout。人类产品验收也提供隔离测试状态，不强迫Kian确认未实际学过的内容来解锁自己的真实进度；不从产品测试推导正式学习Evidence/U。

默认最终交付一个已实际启动/检查的整站预览与 **KIAN FULL-SITE HUMAN GATE**：少量高价值路线覆盖Politics、英语任务/Guide、西综A、Global Home。每项说明打开位置、体验动作、判断问题与Reject条件；用户不检查hash、终端日志或分支。

GitHub代码/截图不是live preview，localhost只在运行它的机器可达。准确给可达方式，不把 `/Users/...` 或运行器内地址冒充所有人可打开的链接。不能启动/访问预览时明确说明，不伪造体验路线。

技术review、视觉接受、真实learner U分开。可连续构建整站等待统一review，不得提前给每科标`SUBJECT_CLOSED_FOR_HOME`。已声明的21题owner缺口等不因保护正确而消失；最终报告范围、未决责任与对发布/能力宣称的影响。

## 10｜分支、依赖与停止：避免新的假死锁

只有一个同写集UI writer。#117已有有效工作和独立未合并历史，先核对其实际head/receipt，不重置。#148扩大的是执行任务，不默默把#117的PR含义改成整站。可以由同一writer保留#117的有界diff，并从其已验证head建立依赖型integration branch/PR；记录依赖与base，串行提交、必要时安全对账。**不必为继续集成而先擅自merge #117，也不因禁止自merge而把用户拉回逐阶段放行。** 不开竞争writer，不force-push、不覆盖他人dirty work。

依赖型分支可消费明确pin的未合并代码用于集成测试，但不得称其已进入main/已接受。领域Current数据仍以合法owner为准。最终按依赖顺序审查并在明确授权后落库；未解决的冲突/required checks/审查不绕过。

Global Home在三科所需接口/合法surfaces与机器旅程可集成后做最终统一；这不要求先虚报三科已人工验收/落main。Shared shell基础导航从开始就可用。Home只做meaningful Continue、三科入口、真实必要attention、次级Lexical，不用last-opened劫持Resume，不发明跨科scheduler/mastery债。

普通bug、清楚归属的CI与代码对账由执行者处理。未知owner问题保持局部fail closed并记录，继续独立页面；不得删检查/造退役文件或假绑定来绕过，更不把无关红灯说成全站坏了。治理问题按真实log与最小owner判定，未触发的CI不是新PASS。

只有真实权限/环境不足、无法由Current裁决的语义冲突、破坏性状态迁移或需要人选的结构体验才升级。需要升级时解释受影响范围并给安全路径；不是新增一个例行人工Stage。额度/上下文中断保存checkpoint，不承诺后台继续。

## 11｜可恢复执行与最终交付

在已有集成PR/receipt持续更新一个简短检查点：base/head、writer、已完成task families、保留证据、正在修改的表示/状态、真实blocker、下一具体动作。不要为每题/段/框建报告，不让Kian搬运所有历史日志。

最终给出一个integrated receipt：代码/PR/SHA、三科实际实现与frame-state对账、通用renderer与内容演化边界、主要polish、PASS/FAIL/NOT RUN、代表截图/trace、准确protected范围/未决项、可达预览、FULL-SITE HUMAN GATE。清楚区分SELF、independent review、Kian接受；不自行merge、不关闭未完Issue、不制造U。

## 启动

执行 #148：从最新Current恢复全局和实际writer/branch，按已选三科文字框落实Politics、English、本轮Xizong A1/A2/A3，再整合Global Home；复用已有实现，完成基线后自主统一polish、持续测试，最终交统一预览与人类体验。工程内部阶段不用Kian逐一推进，语义/数据保护与最终授权保留。
