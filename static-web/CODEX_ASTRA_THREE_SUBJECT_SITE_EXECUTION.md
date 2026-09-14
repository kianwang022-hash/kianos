# KianOS｜Astra 三科整站执行总提示词

Version: **3.0 · 2026-09-14 · FINAL EXECUTION SPEC**  
Scope: **English + Politics + Current-eligible Xizong + final Global Home**  
Program: #113  
Work cursor: `static-web/CURRENT.md`  
Read/reconciliation baseline: `main@ec78cbf92bfcde258be4fc6ecb835ff2542c2a39` — evidence pin, not a permanent implementation base.  
Status boundary: **提示词定稿，不等于网站已实现、浏览器已验收或 learner U 已通过。**

这是整站唯一执行总入口。旧三科提示词和 Politics 专用提示词只作兼容路由；不得要求 Kian 再拼接几份相互冲突的指令。详细领域 owners 继续拥有各自的知识、学习和证据语义，本文件只把已确认要求编成可执行的产品交接。

## 0｜交付目标与当前边界

交付一个可以长期日用的 Mac-wide 学习网站，不是三个样页、组件展览或新的课程管理系统。

| 部分 | 完整产品范围 |
| --- | --- |
| English | Home/Resume；Reading A；Cloze；Part B 四种原生任务；Translation；Small/Big Writing；Objective/Translation/Writing Guide；Lexical 只读 handoff 与精确返回 |
| Politics | Home/Continue；五科、章节、Natural Unit 导航；五种认知展示；Chengfeng 外部学习衔接；肖1000工作台；有价值的错题/不确定、修复、返回和阶段允许的复习能力 |
| Xizong | Home/Continue；System Guide；Block/Logic Group；讲义连续学习衔接；KP Recall；LG closure；Block Recall/Complete；有实际内容的 After Learn；System Recall/Question Sweep/Repair/Return；全卷产品方向的真实兼容边界 |
| Shared | 统一的导航、控件、排版、焦点、保存/错误反馈和跨页面返回语言；三科收口后完成 Global Home 最终整合 |

本次核对时：English 和 Politics 学习工程已闭合 through E；Xizong 当前产品化 Projection 范围为 A1/A2/A3。UI 实现、独立产品验收、Kian 真实使用是另外的事实。未来范围由最新 Current/manifest/scoped Acceptance 决定，不能为了整站对称把 B–F 或后续阶段标为 ready。

#117 是当前活动的 Politics 肖1000工作台 Draft PR，**不是整个 Politics 产品，更不是整站**。先续接它的有效未合并工作；之后依照 Current 完成其余 Politics family、English、当前 eligible Xizong，最后 Global Home。工程顺序不等于 Kian 学习顺序。

现有 shared shell/navigation/Return 从第一块就应可用；“Global Home 最后”只约束最终首页整合，不允许前三科做成互不相通的 demo。

## 1｜先理解完整闭环，再改页面

### 1.1 进入与权威

首次接管：读取最新 main、`AGENTS.md`、`BRANCH_LIFECYCLE.md`、`static-web/CURRENT.md`、本文件、#113 和实际活动 PR/diff。检查工作区是否有他人的未提交修改，不覆盖、不强推。

然后读三科 Learning Contract 理解差异；实际施工某科时，沿下表读取该科完整活跃依赖链。读过且没有变化的规则不重复仪式化加载。不扫描所有医学正文或逐条读取题库来设计页面。

| 科目 | Logic / Content / Projection 最小完整路径 |
| --- | --- |
| Xizong | `content/xizong/LEARNING_CONTRACT.md`；`content/xizong/knowledge/learner/study-policy.json`；`static-web/XIZONG_PRODUCT_STATUS.md`；`XIZONG_UI_REVIEW_PROTOCOL.md`；相应 System `system.json`、`*-learning.json` 与代表 Block/KP Core；`content/xizong/projection/PROJECTION_CONTRACT.md`、manifest、选定的 System/Block Projection；实际 Runtime/Evidence/Repair/Return |
| Politics | `content/politics/LEARNING_CONTRACT.md`、`INTERACTION_CONTRACT.md`、`CONTENT_SEMANTICS_CONTRACT.md`；`static-web/POLITICS_PRODUCT_STATUS.md`、`POLITICS_UI_REVIEW_PROTOCOL.md`；五科代表性 Current teaching/Projection 对象；`content/politics/projection/manifest.json`；工作台另读 `POLITICS_LEGACY_FUNCTION_PARITY.md` 与 Current 题库/解析资产 |
| English | `content/english/LEARNING_CONTRACT.md`、`PROJECTION_CONTRACT.md`；`static-web/ENGLISH_PRODUCT_STATUS.md`、`ENGLISH_PRODUCT_BRIEF.md`；Objective、Translation、Writing 对应 Current/runtime/evidence；Guide 的 Global Map、Core、boundary/example、reference/exit 分工及其真实 loader |

共享必读：`static-web/PRESENTATION_CONTRACT.md`、`KIAN_UI_PREFERENCES.md`、`UI_STYLE_BRIEF.md`。涉及内容演化时核对 `PROJECT_DEFINITION.md` R10 与 `ARCHITECTURE.md` §7.1。详细产品文件的旧 `ACTIVE DISCUSSION / pilot first / do not implement yet` 阶段文字由最新 Product Status/Current 取代，不据此重开设计；其未被后来明确纠正的具体行为仍保留。

产品意图的冲突按 **Kian 后来明确决定 → 对应 Current 产品记录 → 本交接 → 历史草图/旧实现** 裁决。知识、学习、证据和状态意义仍由各自 owner 管理；产品新要求若需要语义兼容变更，必须明确交回最小责任 owner，不能伪装成 CSS。

### 1.2 一次简短的闭环读回

开始每个任务族前，用 PR 的同一份工作记录说明：**从哪里来 → 这里做什么 → 写入什么真实状态 → 正常出口 → 失败/修复 → 回到哪里 → 哪个后续阶段依赖它**。这是工程理解证明，不是给 learner 新增七个步骤，也不为每个内容实例生成一份报告。

核对实际 route → loader → component/enhancer → 样式 → 最终 DOM。未挂载的旧组件不能作为当前浏览器事实。

## 2｜设计权限：成熟 baseline 优先，不做自由重设计

| 级别 | 权限 |
| --- | --- |
| L0：语义与闭环 | 不得擅改 Content/正式答案、学习顺序、合法前置条件、first attempt、Evidence、Memory admission、holdout、新鲜度、source ownership、Repair/Return、任务完整性与结果权限 |
| L1：视觉细节 | 在共享风格内自主优化字号/字重/行距/行长、间距/对齐、线条、克制色阶、按钮与输入、焦点、保存/错误反馈、可访问性和细腻过渡；不用逐像素问 Kian |
| L2：局部排布 | 默认保留已接受的区域职责、同时可见关系、顺序、导航自主性和信息显隐；可以调整列宽、密度和次级控件组织。不能把本来直见的信息收进反复展开，也不能把两栏改三栏当普通 CSS 优化 |
| L3：结构替代 | 默认不采用。先完成 baseline 并跑完整闭环；只有发现明确收益才允许本轮整站最多一个局部 alternative，隔离、可回退、同数据/同状态对比，说明收益与风险。Kian 接受前不得覆盖 baseline 或推广全站；不是每页都要做一个 alternative |

`No mandatory ritual` 删除的是无价值操作，**不是删除领域确实要求的学习/证据动作**。尤其不能用政治的 optional close 去取消西综正式讲义接触、主动 Recall 或 Block completion 条件。

同样，按钮少不等于行为更好；文字短不等于压缩；把完整学习资产削成摘要不属于美化。优先减少无用 chrome，不减少必要信息。

### 2.1 文字框的身份

完整底线位于：

`static-web/design-archive/2026-09-14/THREE_SUBJECT_TEXT_FRAMES_V2_1.md`

这是原 v2.1 的完整同 blob 副本，原始指针仍在 `design-archive/THREE_SUBJECT_TEXT_FRAME_BASELINE_2026-09-14.md`。不得删除、改写或重新指向。

保留的是认知关系/已确认行为底线，不是像素、边框、示意空白或卡片数量。实施按 **能力/认知几何/状态职责 → 可复用 renderer/route → 浏览器证据** 对账，不为每个 ASCII 框、每个段落或每个 KP 做逐一截图签字。

需要消除空间歧义时读对应框及详细设计说明。明确接受的几何不是任意参考：Reading 全文与完整题组并行、Politics clean attempt 不固定左右复盘分栏等，仍是约束。

`DESIGN_VERBATIM`、`DESIGN_BEHAVIOR`、`EXECUTION_SYNTHESIS` 是来源标签，不是质量/权限等级；不能因某框是 synthesis 就把它保护的真实要求丢掉。没有恢复全部原聊天的事实继续保留，不得伪造历史确认。

回退只恢复本次展示/实现范围，保留最新领域 Truth、用户数据与保护规则。旧框中的肖1000原解析、旧 scheduler 或过期依赖不会因回退而重新生效。

## 3｜展示工程的规模：优化语法，不逐实例装修

### 3.1 正确生产链

```text
Current 内容/学习语义
→ 已批准 Projection 或可确定解析的结构引用
→ 按科目/任务族适配的 ViewModel
→ 少量可复用表示组件与工作区
→ 原有 Runtime/Evidence/Return
```

语义 roles、geometry、state visibility 与视觉 tokens 分离。一个 Block/NU 可同时包含多个 Chain/Compare/Boundary/Formula 等对象；不得强迫“一章一个模板”。共享 shell 不等于统一认知模型。

禁止：按疾病、章节、KP、题号在 CSS/组件里写语义分支；把各篇内容重新交给模型总结/重画；浏览时调用 LLM 猜因果或布局；为每一份内容建立独立页面实现/人工验收任务。

允许按**真实 schema、语义对象类型、任务类型、状态、内容长度/可用宽度**复用渲染规则。需要题型专用组件是正常的；需要每个题号专用组件不是。

### 3.2 实际资产成熟度，不能虚报

Xizong 当前 Projection v1 覆盖 3 System + 38 Block。7 个异质 calibration Block 有显式较丰富的结构选择；其余 baseline 保留完整 Guide/Core 引用。KP Reveal 仍需要解析完整 canonical Core，不能只显示 Projection 的几个 object。**有 Projection 文件不等于所有正文已变成可直接绘制的图。**

Politics 已有五科 chapter/NU Projection：使用其选定 Current refs、roles、edges、优先级和 null/reference-only 分工。短 `projection_shape` 名字不能单独提供完整因果/层级数据；例如一个 role/not-role 对照对象不能被凭空展开成树。

English 三份 Guide 主要仍是结构化 Markdown；Writing 有分段 ViewModel，但内容片段仍是 Markdown。不得为 UI 全量改写这些正文或强行给每段新建语义 ontology。

### 3.3 复用与诚实降级

优先复用现有 loaders、稳定 IDs、明确标题/anchor、结构化字段和已批准绑定。Markdown 可用可靠 AST/确定性 section parser 保留标题、段落、嵌套清单、表格、公式、代码块中的原逻辑、图片与来源链接；解析要识别 code fences，不能把代码块内标题误当章节。

有明确节点/边/顺序/对照数据时，用相应通用 renderer；只有完整逻辑文字时，先提供层级清楚、可读且完整的结构化正文承载。**不能凭一个箭头字符或标题猜出新医学/政治关系。** 不强制所有文本图形化，也不退回“一块大文章框装所有内容”。

若已批准 binding 缺失、歧义、stale、类型不符，受影响对象 fail closed 并指出具体 owner；不能用其他正文、旧资产或 AI 摘要补位。若只是尚无丰富图形而 Current 有合法结构文本，可明确使用该合法文本表示，不把它宣称为已完成 rich geometry。真实关键表示缺口局部修复，不重启全科语义编译。

Source pin/selector/ID/hash 的用途遵守实际合同。Xizong structured refs 可按 binding 重验，strict derived fragment 需相应 freshness；Politics 当前严格 source hash 仍要遵守。不能为提速盲目重 pin 或用错误字节口径制造假 blocker。

### 3.4 内容变化后的维护

同一受支持 schema 内的正文修改、合法增删/重排，应由数据重验/编译与 renderer 吸收，不改 topic-specific 页面。改名/删 binding、新 schema、全新语义类型、权限变化不在“无成本自动兼容”的承诺里，需只处理受影响依赖。

常规验证成本应接近 **表示类型 + 状态 + 变更影响范围**，不是人工遍历所有内容。仍可让程序全量读取/构建/验证合法 corpus；“不要逐个做”禁止的是逐项人工设计与验收，不是禁止程序枚举。

## 4｜Guide：体系入口常在，日常流程不被它占据

**Persistent reference, not persistent workflow.** Guide 第一次帮助快速建立模型，以后也可短暂回看；不能仅因为不是高频入口就藏得难找或降为粗糙帮助页。

| Guide | 内容 owner | 当前 route / consumer |
| --- | --- | --- |
| Xizong System Guide | 各 System `system.json` + `content/xizong/projection/**/system.projection.json`；详细设计 `XIZONG_SYSTEM_GUIDE_DESIGN.md` | `/xizong/[system]/`；核对当前 System loader/component 再接 Projection |
| Objective Guide | `content/english/modules/objective-learning.md` | `/objective-learn/`；Reading A/Cloze/Part B 用稳定 anchor 进入同一资产，不复制三篇 |
| Translation Guide | `content/english/modules/translation/learning.md` | `/translation-learn/`；深层 `learning.reference.md` 仍是参考 |
| Writing Guide | `content/english/modules/writing/learning.md` | `/writing-learn/`；`src/lib/englishWritingLearning.mjs` |

入口规则：

- English 科目/任务族入口保留明确、安静、直接可见的 `Guide / 方法地图` 次级动作；不能只藏在一个默认折叠的 First Learning details 中。练习仍是日常主动作。
- Xizong System 入口/Block 上下文有低摩擦 System Guide 返回。初次方向提示可更显眼，但不弹强制 onboarding，不制造“读完 Guide”完成证据；不绕过西综真实的学习前置条件。
- Guide 可自由跳转、连续阅读、滚动；核心模型、结构、必要例子/边界完整。不要逐段点开展示，不按一屏美观删正文，不让每一个知识块成为打卡项。
- 从具体任务进入 Guide 要保留任务/attempt/题目或句段/System/Block/LG/KP、模式和合法返回位置。Guide 自身阅读位置与 productive Resume 分开，不覆盖 first attempt，不因打开 Guide 把“继续”改成继续看 Guide。
- 答案保护优先：受保护考试/Recall 状态中，不在 Guide 入口预览、侧栏或跨页状态里偷偷泄露方法/答案；主动访问受保护辅助内容必须遵守该任务既有开放规则，不能把受提示结果仍声称为 pristine clean attempt。
- 不编造读完所需分钟数。看过一次不代表掌握，也不让入口永久消失。
- Politics 维持自己的 chapter/NU orientation 与五科认知展示，不为对称再造 Politics Guide 或第二套 Chengfeng/Suyi 课程。

这是对旧 English “只在失败后进入 First Learning”表述的补充：**自主首次建模和后续有针对性的修复，两种入口都成立。**

## 5｜English：理解模型与整套题的工作空间

### 5.1 Logic → Content → interaction

共同主线：**真实任务 → 快速判断 → PASS/EXIT 或最小有用修复 → 必要时 learner 自己再执行 → 回真实表现**。不是每次完整展示诊断流程。

Objective 共享 represent/demand/candidates/evidence/adjudicate/execute 内核，但 Reading A 判断选项命题，Cloze 判断 slot 的 best fit，Part B 重建整张 discourse map。必须保留三者不同认知对象。

Guide 中 Global Map/Core 用来建立能力；Skill Map/Deep 用作地址与参考，不是待办。源中的例子、限定、对照、完整思路不能被一条摘要取代。

Translation：**Represent → Reconstruct faithfully → Deliver**。Fidelity 是意义守恒护栏，不是第四门必须完成的课；Representation 的 scope/reference/attachment/relation 失败优先修，不把其下游后果都算成新弱点。先保留 first translation，修复要求 learner 在必要范围自行 reconstruction；reference 只是可选比较，不是唯一合法措辞。

Writing：**Task/Genre → Content Generation → Organization/Development → English Realization → Register/High-value Control → Timed Delivery**。Small/Big 是任务分化，不是额外基础课程。保留 source 的具体 function matrix/material→meaning/信息增量逻辑。Direct mode 合法，不制造并不存在的 first plan；完整 first draft 不被 revision 覆盖。

正式 attempt/review context 是完整 passage/set/essay，内部 evidence/repair 可更小，也可为真正 coupled failures 联合处理。Same-item rewrite/repair 不是 mastery；dormant pending claim 不召唤 learner task，不抢 Resume。

### 5.2 各任务族不可丢的空间与行为

| 家族 | 必须保留 |
| --- | --- |
| Reading A | Mac 左完整 passage、右完整题组，各自滚动；active question 仅键盘目标，不限制其他题可见；整篇提交；submit 前选择样式只表示我的选择；题后 W/U 原位展开，仍保留全文/全题 |
| Cloze | 完整文章 + 同一 sheet 的全部 20 blank rows；A/B/C/D 默认横排，长文本可换行，必要时 2×2；blank 与 row 可相互定位；允许改答、Uncertain、轨迹、整篇计时和一次 submit；不变成 20 个 wizard；题后保留完整卷面和 coupled context |
| Part B | gap/heading/ordering/comment–statement 四种 Current forms；完整材料、候选池、41–45 map；固定 givens、source-owned repeat/single-use 策略；Ordering 保留 Order Map；不编造缺失限制；题后同一整图呈现 delta，不能拆散 swap/cascade |
| Translation | 全文与各目标译文同时可见；句段联动、完整 set、第一译文冻结、局部 revision、可选 reference、计时/历史/Resume；稳定直接退出，深 Chat 看整套再定位最小修复 |
| Writing | prompt/原始图或材料/requirements 与主写作区并行；authoring 区主导；可选轻量 plan，Direct 同等合法；quiet timer/word count；完整 first draft + revision；模型答案不得接管 clean generation |

所有题保留真实的选择/改答/不确定、计时、提交、历史/重置/退出语义。正文选词只路由 Current Lexical；lookup 本身不产生 Repair/mastery。单词、短语、段落选择按真实可解析对象提供高亮/Chat 上下文，不能新建局部词库。

Writing 网页拥有写作工件；Chat 拥有需要时的语义讨论。不要把复制 JSON 导回网页、再显示同一份 Chat 分析做成常规流程。内部兼容状态可以存在，但不能伪造已经收到真实 Chat review。

### 5.3 English 验收重点

每个任务族使用完整真实可用或合成 fixture，不消耗 protected unseen。覆盖整套提交、改答、W/U 原位复盘、Direct Writing、first draft/translation 不变、指南回跳和 unfinished high-value Resume。Part B 的四种 form 均有可执行测试；Guide 检查首次自主入口与修复定位入口两种。

## 6｜Politics：外部连续学习 + 五科认知 + Legacy 手感工作台

### 6.1 完整学习闭环

**Home/Continue → subject/chapter/NU orientation → 原始 Chengfeng 在 iPad/MarginNote 连续学习 → optional 轻闭合/checkpoint → 当前 first-ready 肖1000 → 正确稳定快速继续，Wrong/meaningful Uncertain 最小修复 → 原 source/Chat → exact return。**

Suyi 的有用结构已吸收入 Current，不另开第二课程。Xiao 负责验证，不负责组织第一学习顺序。Optional close 不等于可以在所属内容学习前释放题目。跨 NU 命中保留，但不借一个选项把未来 NU 内容拉进当前教学。

五科的内容组织不能混为同一个流程图：

| 科 | 主导认知与不可混淆关系 |
| --- | --- |
| 马原 | 有来源的概念拓扑、因果/推理链、边界；多个 framework_maps 按显式同时可见要求处理，不能用孤立定义卡替换 |
| 史纲 | 阶段/时间、原因层级、过程、转折、评价；时间先后不自动是因果，根本/重要原因与成功/局限不能压平 |
| 毛中特 | 历史问题→理论回答→理论序列位置；主题/内容/方法/历史地位区分，使用 Current active structures/precision 的具体 scoped selectors |
| 习思想 | 方向/历史方位/基本国情、目标/原则/保证/路径等身份；角色对照不冒充新 hierarchy；固定表述的 first-round priority 由 owner 决定 |
| 思修法基 | 概念边界、规范判断、情境应用与评价尺度；embedded reference-only 不拆成新教学单元，不以空泛口号代替具体关系 |

已编译 Projection 是认知展示入口；53 chapter /160 NU 的历史核对数只作快照。null 不填词，REFERENCE_ONLY 不擅自提升，first_round_exact 不按 UI 兴趣扩大。后来 Memory/analysis-output/Mock 由阶段和真实证据激活，不把一轮网页当背诵墙或第二 scheduler。

### 6.2 肖1000：最新决定已替代旧 P11

**Legacy Workbench 的能力、交互和信息架构 + Current Truth/Evidence/Return + takeaway/chat_explanation；不展示肖1000原解析。**

不让 Codex 重新在旧仓库考古“哪些东西该迁移”。Current-facing 完整能力账本在 `POLITICS_LEGACY_FUNCTION_PARITY.md`。Legacy 路径仅为已提取行为的 provenance，不是运行时依赖。真正未恢复的历史细节由 Chat/owner 有界处理。

Setup 保留 Continue/Resume、科目/章节/NU/题型/题数、普通/随机/错题/收藏；已有精确 reviewed point filter 才保留精确点筛选，不猜 mapping。收紧 setup，开始后题干是主角，不是 Hero/统计卡/方法说明。

Clean attempt：整宽题干，Mac 选项长度合适时 2×2；单选、多选、Normal/Fast、Favorite、Uncertain、discussion mark、计时、改答轨迹与键鼠路径保留。无新固定复盘双栏，无新题目地图。原始**题面图片**仅在 Current 素材真实且不会泄答案时可选查看，与原解析隐藏是两件事。

Submitted result 使用成熟两区职责：

```text
左：结果 → 一句话带走 → 我的答案/正式答案 → 必要的漏选/多选 → 可选错因/个人备注与保存状态
右：AI精炼解析/理解这道题 → 有来源的 Current/Chengfeng 复盘 → 下一题/精确返回
```

约 32/68 只是历史比例参考，不能留下空左栏或把主解析挤窄。没有 Xiao 原解析面板/展开入口/隐藏 fallback；`xiao_reference` 可留在源资产 provenance，但不能进入 learner-facing catalog/序列化数据/渲染。不得 OCR 原解析顶替缺失 takeaway/chat_explanation。

#124 已完成 1148-record 解析 promotion，#115 不是待迁移依赖。正式内容在 `content/politics/derived/xiao1000-learner-explanations/`，以当前 manifest/receipt 为准，精确 stable question_id 绑定；题干/选项/正式答案独立认 Current Question Truth。缺失/stale/重复/未绑定按实际 validator fail closed，不 fuzzy match、不重写 1148 条。

Favorite、Uncertain、discussion、Wrong、cause、note 保持不同意义。single+Fast 先保存 first-attempt 再稳定正确自动下一题；meaningful Uncertain/Wrong 不被眨眼跳掉；multiple 必须显式提交。first attempt 不可变，修复不覆盖它，保存失败不伪装成功推进，Next/refresh/离开不静默丢 note。

不新增强制“结构/易混/diagnosis”步骤；不恢复 due/D1/D3/D7；可用的 session summary、secondary practice analytics、后续 phase-owned review 能力按账本处理，而非静默删掉或全变成常驻 dashboard。

### 6.3 Politics 可复用浏览器旅程

P-J1 单选 Normal clean→submit；P-J2 多选 toggle/显式提交/漏多选 delta；P-J3 正确题后两区且无原解析；P-J4 Wrong→最小解释/source/可选 note；P-J5 Fast stable 路径与 Wrong/Uncertain 停留；P-J6 Favorite/Uncertain/discussion 独立与错题/收藏重入；P-J7 refresh/Resume/first-attempt 不重复覆盖；P-J8 NU→题组→source/repair→精确原题/NU 返回。

另注入 storage 失败、解析缺失/绑定错误与 stale return，必须真的拒绝错误路径。五科认知 renderer 用异质 Current 内容压力测，不能用工作台三个截图代表全政治 UI 已完成。

## 7｜Xizong：不仅是 Guide，是全层级逻辑的状态化展示

### 7.1 完整闭环与学习责任

```text
System orientation
→ Block orientation
→ 当前 Logic Group 的 goal/closure/返回路线
→ iPad/MarginNote 原讲义连续学完整个 LG
→ 一次有意义的讲义接触确认并返回
→ 该 LG 的 KP 主动 Recall
→ LG closure
→ 下一 LG
→ Block Recall
→ Block Complete
→ 需要时 After Learn / 回 System
→ 实际学完整个 System 后：System Recall → 系统题 sweep → W/U 修复 → 题后短 System reconstruction
```

不能删掉 Logic Group，把 KP 稳定身份误当逐 KP 切设备学习顺序。原讲义的原图、表、例子、旁注和讲义配套题仍在原表面连续学习；网页不是第二本须通读的医学讲义。

第一次必须有正式接触、真实主动 Recall 和规定的 closure/completion 证据；某 KP 一次不稳不无限阻塞。Block Recall done 与 Block completed 是不同状态。No mandatory ritual 不授权合并这些状态写入。

### 7.2 展示对象与状态

System Guide 使用完整 System 模型、spine/parallel controls、variables/relations、judgment axes、failure、Block route 等 Current 已有对象。左 Block route 与主 Canvas 保留，Context 仅有需要时出现；不画猜测的 failure 节点/额外依赖。

Block Workspace 保留 LG map、dominant stage、薄位置/状态条和 conditional context；完整 Block orientation/Framework 不藏在额外“看完整定位”里。外部 LG 学习前，Current source locator/连续范围与 KP 返回路线直接可见；无精确 locator 就诚实给已有边界，不猜页码。

KP Recall Front 仅合法 neutral prompt、位置与 ID；**整工作区**不泄露 answer-type title/Core/Precision/Visual/Guide/tooltip/dock。Reveal 后完整 canonical KP Core，包括原有关系、公式、表、条件、边界、图片；不是自动摘要。

Block Recall 使用 centerQuestion 与被批准的中性 LG scaffold；Reveal 后显示同一 owner 的 recall spine/closure，不能把首学全文当每轮复习。System Recall 必须独立保护，不透明浮在答案 Guide 上；scratch 可选，不强迫打字证明回忆。PRE/MID/POST 证据相位不能混为一条。

Recall 评分/完成快捷键必须遵守此任务的实际前置与 Evidence writer：**通用快捷键允许简化，不会覆盖西综 first-pass 的合法 Reveal/评分条件**。发现 brief/旧实现与更高 owner 不一致，报告最小兼容差异，不悄悄开放 shortcut 绕过。

### 7.3 Memory、Precision、Reserve、Hook 不是装饰组件

保留 `CURRENT_CORE / RESERVE_LEARNING / CONNECTION_HOOK / DEFERRED` 与各自 owner/时机。Precision 是准确性属性，不是一个新 mastery stage；Connection Hook 不自动成为普通 Memory，信息延后不能失踪。A2 的 Visual/Precision/Connection 不能因 A1 没有就被删，也不要求 A1/A3 造同样 sidecar。

弱 Recall 的真实 evidence 可立即保留，后续处理不强行打断 LG/Block。After Learn 按实际有内容的 Memory/Reserve/Chat Repair 显示；empty category 不占常驻面板。Memory、REPAIR_ONLY、原始 Recall 证据不可互相覆盖。高层模型、KP Core、后来压缩和源修复都必须能由通用 renderer 承载，不限 Guide。

### 7.4 系统题：输入速度与结果可见性独立

按实际题目 A–E 支持 1–5；Normal 选择/切换后 Enter 提交，Fast 单选可选择即记答/提交；多选始终显式结束选择。文字输入时快捷键让位。

Immediate feedback：稳定正确低成本继续；西综 **correct+Marked 仍可继续，Mark 是稍后回看信号**，不能套用 Politics meaningful-Uncertain 停留规则。错误先 Quick Review，Enter 继续，Space 可展开已有更深解析，M 随时标/取消；不强制每道正确题回答“稳吗”。Wrong 与 Mark 不等于强制未来债。

Hidden results：只显 answered/unanswered/current/marked；不在颜色、排序、题图、计数、筛选、提示里暗示对错。Fast 仍可记答前进，多选仍显式提交。全卷入口默认 Hidden；主动揭示遵守用户控制与实际 evidence/freshness 语义，不把中途看答案的一卷仍当 pristine。

集中 W/U/Marked review 与 source/Chat repair 保留原题上下文；只有 reviewed Question→Block/KP relation 可精确定位，无关系则题级修复，不猜。

**全卷页面、phase-aware 多轮 attempts 等必须核实实际实现。** 已有 holdout 不等于已拥有完整全卷 runtime。需要兼容状态迁移时，只冻结该受影响功能，保护 first attempt 并交给原 owner；不得因此阻塞现成 System/Block/Guide 渲染，也不能以一个空入口冒充实现。

### 7.5 Xizong 验收重点

选择 materially different System、显式 rich calibration 和至少一个 baseline-only/长 KP Core，验证通用表示没有只服务“精选七块”。覆盖 LG 连续学习一次返回、KP neutral/reveal、LG closure、Block Recall/Complete、System 前后 Recall、holdout、Fast/Hidden、题后 source/repair 精确返回和证据不覆盖。

程序枚举全部当前 eligible assets/IDs/bindings/视图许可；视觉不逐一签 805 个 KP 或每个 Block。未知 renderer/内容丢失是具体类型或对象缺口，不扩大成全科 fresh semantic audit。

## 8｜视觉与交互质量：有限自主 polish

按 `UI_STYLE_BRIEF.md` 实现**专业知识工作台的内容组织 + 现代桌面产品完成度**，不使用伪精确的 70/30 比例作为验收。Primary Mac 读得舒服、结构直接可见、信息有密度但不拥挤；主题/控件一致，任务布局不同。

先在代表任务上建立一套一致的字体/色阶/spacing/control tokens，再复用；不要求 Kian 在开工前选择每个色值/圆角，也不让每页独立发明皮肤。保守继承成熟基线，重大风格/结构另按 L3，不进行全站视觉推翻。

Motion 仅解释 hover/focus/选择/展开/提交/Reveal 状态，短而不延迟操作；不 spring/bounce/飞入/逐卡 stagger/滚动炫技。保持布局稳定、焦点可见、键盘可用、中文输入法 composition 安全、reduced-motion 可用；状态不只靠颜色。可选辅助层不劫持滚动或丢笔记。

不把新 dark-mode 工程当本轮目标；已存在且有效的主题/无障碍能力不得顺手删掉。窄窗可靠降级，不能用窄屏截图代替 Mac 主验收。

## 9｜验证：全量机器检查 + 代表性浏览器压力测试

### 9.1 全量机器层

让程序枚举当前 manifest/完整语法支持范围，检查：解析和绑定、稳定 ID、已批准可见性、required 内容 disposition、引用/图片路径、unknown shape、reference-only/timing、route 可构建、无 topic-specific semantic 分支。对正常内容变化做正控制；对缺失/错型/stale/泄露做针对性负控制。

Protected-state 测试覆盖 DOM、accessibility tree、侧栏、tooltip、筛选、统计与焦点路径，不只看主卡片截图。缺字/溢出检查在可执行范围运行，但**机器 PASS 不证明所有实例语义/美学都完美**；不要作无证据承诺。

现有测试先复用。查看当前 `static-web/package.json` 与 CI 的真实命令；使用 lockfile 对应安装方式，不机械假设 `npm ci` 可用。按受影响范围运行：

```text
npm run qa:politics
npm run qa:objective
npm run qa:translation
npm run qa:writing
npm run qa:xizong
```

需要时运行现有 Politics Projection validator 与 Xizong `content/xizong/projection/tools/validate_projection.py` 的当前支持参数。共享组件修改应回归受影响任务族，不为每一科重复同一全站 build，也不删测试让红灯消失。

### 9.2 浏览器抽样按“类型 × 状态 × 压力”，不按内容个数

用已有 fixtures/已公开练习或合成材料，不打开真实私人 learner profile，不消费保留的 unseen/holdout。样本覆盖实际使用的每种 representation family、任务形态、关键保护状态，并加入长文本/长选项、多关系并行、稀疏/无可选内容和失败状态；不是任意抽漂亮的首页。

English 覆盖所有 task families/Part B forms 与三份 Guide；Politics 覆盖五科差异以及 P-J1–8；Xizong 按 §7.5。相同样本可覆盖多个维度；不为每页/每个 frame/每个 source ID 建独立视觉工单。

实际启动浏览器，记录 viewport（例如 1440×900，仅为例子）、route、fixture/state、commit 和操作。截图要能判断完整 Mac composition，也要看滚动后的长内容与错误状态。Guide 必须证明入口可找到、模型完整可读、返回不打断主线。

### 9.3 自查与停止

实现 → 浏览器 → 截图/行为自查 → 修明显问题 → 重新跑受影响 journey。通常几轮足够；不硬凑 2–3 轮，也不无止境磨皮。小细节自主收口，真实结构选择才交 Kian。

至少检查：任务是否第一视觉对象；字体/行长/密度；关系是否被压平；是否靠反复展开维持整洁；是否有多余 chrome；快捷键/保存/返回是否顺；三科一致但不同形；原内容和状态保护是否完整。

最终交付可复现的测试结果与代表截图，并明确 `SELF / independent review / REAL USER` 的区别。不能拿 build、截图存在、schema 绿或自动脚本扮演学习来宣布 learner U=PASS。

## 10｜分支、范围与真正的结束条件

始终以最新 Current 查活动 PR，不硬编码永久 #117。若 #117 仍 active，保留 `politics-legacy-parity-migration` 的未合并代码；将最新 master/Current 规则与分支对齐后施工。不能因为分支上旧提示词还在就执行旧要求。

main 有无关提交不使工作无效；只有相关 authority、实际写集或依赖变化才做最小 reconciliation。不要 reset/force-push/丢弃他人修改。当前重叠 static-web slice 保持一个活动施工面，独立内容线无需等待。

#117 只解决其工作台/必要 glue/测试，不能顺手变三科巨型 PR。其收口之后仍需把 Politics cognition/Home 等实际缺口按同一 Program 完成。各科最终 `SUBJECT_CLOSED_FOR_HOME` 必须有完整该范围能力与浏览器/独立审查证据，不由“第一个 PR merge”自动推出。

保持单一证据/状态 writer；内部重构允许，但不得新造 learner database。跨 schema/证据的真实兼容问题写明最小 owner、失败行为和关闭证据；不用旧 red light 叙事或无关历史证明无限阻塞。

默认交付可独立审查的 Draft PR，**不自行 merge、不把尚未验收的分支当 main Truth**。得到授权并完成必要审查后才 merge → main readback → 按 BRANCH_LIFECYCLE 退役分支。等待审查时给出精确下一 cursor，不让 Kian重新复述设计，也不冒称整站完成。

Global Home 最终只负责一个 meaningful Continue/Resume、三科入口、必要的真实 attention、次级 Lexical 工具。不得发明跨科排程债务、展示工程进度或用 last-opened 覆盖科目原有 Resume 意义。

## 11｜每个 slice 的紧凑回执

在同一 PR 记录：范围/最终 SHA；真实 routes 与 renderer；消费的 Current owners；保留的闭环/状态权限；本次优化；程序覆盖与代表样本选择；journey/QA 的 PASS/FAIL/NOT RUN；截图/trace；真实 blocker；下一 Program cursor。

不为所有内容对象逐项写 prose receipt。新发现的局部内容/绑定缺口保留准确 identity；没有运行的测试明确 NOT RUN。Full site scope 不等于单次会话无条件完成全部实现。

## 启动指令

进入 `kianwang022-hash/kianos`，读取最新 `main` 的 `static-web/CURRENT.md` 与本文件 v3.0+，再按 #113 / actual active PR 续接。先理解三科完整 Logic–Content–Projection–Runtime–Repair/Return 差异，保留成熟 baseline；在有限权限内优化通用表示、Guide 入口和真实交互，不逐内容装修，不机械照抄 ASCII，不扩大为课程/知识重写。交付完整 Program 的有界可审查实现与真实浏览器证据；不自行 merge，不制造 learner U。
