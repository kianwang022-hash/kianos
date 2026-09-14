# Codex 执行提示词｜三科 Mac-wide 产品化落地

Status: **EXECUTION HANDOFF PUBLISHED — NOT IMPLEMENTATION / VISUAL ACCEPTANCE**  
Program: GitHub Issue #113  
Current router: `static-web/CURRENT.md`  
范围：Politics / English / Xizong 的既有产品与表达层落地；最后衔接 Global Home。

本文件是执行说明和验收要求，不是新的 Product、Learning、Projection、Evidence、Acceptance、learner-state 或视觉风格 owner。所有已接受的语义与产品决策继续由原 canonical owners 管理；本文件不复制它们的完整正文。

编写时核对基线：`main@cca4819a407ecf78aa78ef03e5ba7ece49c81d5e`。这只是本说明的读取定位点，**执行时必须重新取得最新 main**。

---

## 0｜直接任务与执行终点

你是本轮 Codex implementation owner。目标是把**已经商量好的三科产品、交互、Current 表达资产**变成完整、可运行、符合 Kian Mac 横屏与 Dense Calm 偏好的 production UI；不是重新设计三科，不是再生产一套学习内容，也不是仅提交建议。

使用方式：**共用要求 + 当前一科的专用要求**。不要为了开始某一科而重读另外两科的全部内容。

先读取 #113 最新正文及相关执行回执，确认当前科目、scope、活动 branch / PR。已有同任务 PR 就续接，不重复开工。没有已指定任务或活动 UI PR 时，从 Politics 开始，再 English，再当前 eligible Xizong；这是默认工程顺序，不是 Kian 的学习顺序，也不覆盖后来的明确调度。

默认同一时刻只有一个会重叠修改 shared `static-web/**` 的 production UI PR。一个科目可以有若干有明确验收边界的串行 slice；不能为了单一 Program 强塞一个无法审查的大 PR，也不能为每章建一套工程仪式。

Codex 本轮交付终点：

```text
核对最新 authority 与活动工作
→ 必要的共享视觉参数校准
→ 既有产品到代码的 bounded implementation
→ 真实浏览器交互 / 截图 / 回归证据
→ 自查并修复已发现问题
→ 一个可审查 PR + 可复现 handoff
→ 等待独立审核，不自行 merge
```

任务真正收口：独立 Chat/Pro 审核、Kian 必要的结构/审美验收、经授权 merge、main 读回、分支退役。**提示词发布、样稿、代码完成、CI 通过、PR 打开、视觉接受、真实学习 U 是不同状态。**不得自己勾完人的验收。

---

## 1｜Current-first：读最小但完整的链

### 1.1 共用入口

读取 `AGENTS.md`、`BRANCH_LIFECYCLE.md`、`SYSTEM_CONTRACT.md`、`static-web/CURRENT.md`、本文件及 #113 的最新执行信息。随后必须读：

- `static-web/KIAN_UI_PREFERENCES.md`：显式偏好与 assistant hypotheses 分开；
- `static-web/UI_STYLE_BRIEF.md`：共享视觉 owner；
- `static-web/PRESENTATION_CONTRACT.md`：共享表达、快捷键和 Legacy firewall；
- 当前科目的 `*_PRODUCT_STATUS.md` → 详细 Product Brief / surface design；
- 当前科目的 Learning / Interaction / Projection contracts，以及此次切片实际触碰的 Runtime / Evidence / Repair / Return owners。

R10 内容可演化性依赖变化时读取 `PROJECT_DEFINITION.md` R10 与 `ARCHITECTURE.md` content-evolution 段落；不要借此重审整个仓库。

### 1.2 不再重复此前工作

- 三科产品/交互基线已经接受。旧 Brief 的 `ACTIVE DISCUSSION`、旧 pilot-first、旧 calibration-open 字样不自动重启设计；阶段以 Current / Product Status 的明确路由为准，详细已接受决策仍保留。
- 旧 production 页面落后于设计，是 implementation delta，不是“设计没有做”。
- 政治先消费已编译 Projection；英语复用自己已有的 task/learning owners；西综复用已冻结 v1。**不得为了三科对称而强造统一 Projection schema。**
- #90、#112 已退休的工作指令不恢复为执行授权。
- 旧 PASS / 已有测试是回归基线，不是这次修改自动正确的证明；也不因此无故重开 S/K/L。

### 1.3 查看真实运行组合

在判断一个旧组件“有问题”之前，检查它的 route、loader、已挂载 bridge/enhancer、样式覆盖、事件绑定、state restore 和实际 DOM。不要只看到某个未使用分支、隐藏模板、被覆盖样式或旧组件，就把它误报成当前用户体验。

准确记录读取基线、计划 write-set、真实受影响依赖。main 因其他 lane 前进，不要求重读所有内容；只对真正变化的 authority / 重叠 write-set 做重新核对。

---

## 2｜一次性共享视觉校准，不重开产品设计

**产品/交互已定 ≠ 字体、色值等每个 token 已经最终确认。**编写时 `UI_STYLE_BRIEF.md` §12 仍明确留有精确视觉选择，并要求在首个 production UI PR 前收口。不得用本文件或 Program 的“设计已定”绕过这个实际前置项。

执行时：

1. 若当前 Style owner 已有接受过的完整 tokens，直接复用，不另提一套。
2. 若仍未冻结，先做一个 bounded **pre-handoff visual calibration**：列出唯一候选 token 表，用隔离的可运行样张展示真实 Current 长内容、干净题面和问题态；不替换生产路由，不改内容/证据，不把样张作为产品交付。
3. 候选至少覆盖：中英文 font stack / type scale、neutral + 单一 accent、selected/focus/correct/wrong/uncertain、spacing、divider/radius/elevation、button/input/textarea、薄导航/breadcrumb、dark mode 是否 deferred。
4. 明确标记 `PROPOSED / NOT KIAN-ACCEPTED`，交给 Chat/Kian 对比并在原 `UI_STYLE_BRIEF.md` 落定。需要真实选择时在这一处集中处理，不逐页反复问。
5. 此前可完成只读 route/coverage 分析和隔离样张；**不得把未冻结视觉方案当生产 handoff 已通过**。缺的是一次共同视觉校准，不是重新讨论五种英语任务或政治五科。

作为候选起点而非用户已接受的精确尺寸，可尝试：核心正文 18px，长英文阅读 18–20px，题干约 20px，关系/选项 16–18px，导航 15–16px，辅助说明 13–14px，紧凑标题 22–28px；按字体实际字面、行高、内容密度和截图调校，不能机械套数值。

字体优先利用可靠系统字体与已有合法资源。记录浏览器实际加载字体和缺字 fallback；不能以引入不必要远程字体或分发系统字体文件解决问题。颜色方向是克制 neutral + 单一 accent，不是照抄某品牌。

共同 tokens 在现有 shared visual owner / 合理实现位置集中维护，不在三个科目或每个组件重新造一套。后续 shared token 变更必须回归已经完成的科目。

Global Home 的最终视觉设计仍按 #113 放最后；共用排版/控件校准、维持现有 Home/导航可达，不等于提前启动 Global Home 重建。

---

## 3｜写入授权：实现既定决策，不接管语义

### 正常 implementation write-set

在生产分支中可修改当前科目实际使用的 `static-web/src/pages/**`、`components/**`、`styles/**`、必要 `lib/**` view adapter / 接线代码，及本次风险所需的 `static-web/scripts/**` tests。

共享 shell / token / 控件只做兑现已接受行为所必需的最小改动；列出受影响消费者并做跨科回归。默认不更新依赖/lockfile、不引入大型 UI 框架。确有必要先说明必要性、影响与授权缺口。

### 本轮只读边界

- 所有 canonical domain Content / Knowledge / Learning / Question / answer / reviewed-relation owners；
- 政治、西综已编译 Projection assets、manifest、semantic schema；
- Learning / Evidence / mastery / Memory / source-surface / holdout 语义；
- 其他科目与 Lexical 的独立实现，除已经申明并授权的 shared surface 影响；
- 权限、secrets、仓库设置、无关 workflows、私有 learner 数据。

若渲染发现真实表达资产缺口，列 exact owner / ref / 影响视图，交还其 owner；**不偷偷改 Projection 或生成一份替代医学/政治正文**。其他不受影响的工作继续。

不得为了 UI 方便改 evidence schema、Resume 优先级、首答不可覆盖、修复准入或学习完成门槛。实现兼容性缺口要精确列成待裁决项；不伪装成纯 CSS。

本轮 receipt 可在既有任务回执位置新增一个科目/PR 汇总；没有既有位置时可用 `static-web/reports/ui/<subject>-<pr-or-slice>.md`。这是本次交付证据，不是新的长期 Current。动态状态放 #113/活动 PR，不再扩建一层状态体系。

---

## 4｜先建立 source-to-view 对照，再施工

在 PR 回执中维护一张紧凑表：

`surface / Current object → Product decision / exact Projection or task ref → actual component / route → KEEP / OPTIMIZE / RESTORE / DEMOTE → verification evidence`

RESTORE 在政治指 `RESTORE_FROM_PROJECTION`；西综按自己的 UI review protocol 保留准确含义，但已编译表示层不得被绕过；英语按已接受 task-native 投影恢复，不强加政治的文件结构。

对每个重要 learner-visible 能力说明：保留在哪里、怎么到达、在哪个状态可见。既不能“一个字段绑定了”就宣称完整，也不要求对每个字做一张报告。

至少防止：

- 原 Guide/Framework 的关系、限定、否定、例外或顺序丢失；
- Compare 变成含糊标签、并行机制变成假因果链、拓扑被线性化；
- 分拆后同一信息在主区/右栏/底部重复三遍；
- 为干净首屏把全部重要结构藏进 details；
- 后端完整列表未经 Projection/阶段准入就全部上屏；
- 老能力因重做组件而消失；
- 正常态和问题态的不同信息权限混用。

**结构保真与交互减负同时验收。**不能用删内容换好看，也不能用“原文全在”掩盖卡片堆积和高摩擦。

---

## 5｜Mac + Dense Calm 的可检查要求

### 5.1 空间与密度

- Mac 横屏是设计原点，不把移动端长单列拉宽。
- Passage/Question、Source/Output、Map/Compare 等真正要同时看的对象并排；整体利用可用宽度，同时限制局部解释的阅读行长。
- 不设空右栏，不用固定巨大 min-height、空成功页、重复标题和装饰块撑满屏。
- Navigation / Context 是有用才出现的职责，不是每页强制三栏。
- 高密度 Guide 允许超过一屏。优先空间组织、层级、稳定上下文和可控滚动；不靠缩字、裁切、ellipsis 或 `overflow:hidden` 丢正文。
- 页级横向溢出必须消除；真正宽矩阵可使用清楚的局部横向滚动，但不能让主体操作跑到屏外。
- 不给每条信息套大圆角卡，不用饱和多色、渐变、过量 badge/阴影和动画制造“产品感”。

### 5.2 可读性与操作质感

- 主任务/内容比软件 chrome 更醒目；主要动作明显，次要能力仍可达。
- 实际字体尺寸、行高、contrast、focus outline、控件 hit area 在浏览器检查，不只写在 CSS 变量里。
- 核心说明、关系、选项不得靠 8–12px 小字换密度。metadata 小字不能承担关键解释。
- 选中但未揭晓只表达“我的选择”；结果同时用文字/符号与克制颜色，不只依赖颜色。
- 长题干、长选项、中文换行、英文长词、公式/上下标、空数据和高密度对象都要检查。
- 保存/跳题/回原位置要可靠；不要把必要错误提醒藏掉以追求安静。
- 尊重 reduced motion；动画不能延迟高频作答，不使用夸张滑入和弹跳。

### 5.3 建议测试视口，不冒充用户硬件参数

至少覆盖以下 **CSS viewport**：

| 目的 | 建议尺寸 |
| --- | --- |
| 主 Mac-wide 工作区 | 1440×900 |
| 更大 Mac-wide 布局 | 1728×1117 |
| 普通外接横屏 | 1920×1080 |
| 窄窗口 fallback | 1024×768，以及约 820px 宽的一次检查 |

这些是测试样本，不是声称 Kian 的具体屏幕分辨率。若任务记录了实际浏览器 viewport，则追加那个精确尺寸。区分 CSS pixels、截图 pixels 和 devicePixelRatio。

主视口至少检查正常缩放及 125% 文本/页面放大。独立滚动区不制造滚轮陷阱；切题、展开修复、返回任务后尽量保持位置与焦点。

---

## 6｜高频输入：按任务语义分工

快捷键遵循该 surface 的最新 owning contract，而不是把所有科目套成 fast single-choice。

| Surface | 必须守住 |
| --- | --- |
| English Reading A / Cloze | 全篇/整组可见；1–4 只对明确 focused question/blank 选答案；不逐题评分或自动揭晓；whole-task submit 不变 |
| English Part B | 完整候选池/placement/order map；不强制改成 A–D 单题流程 |
| Politics Xiao1000 | Normal/Fast、单多选、Uncertain/favorite/mark、正确快走/问题停留按已冻结 Workbench 与 Evidence 语义保留 |
| Xizong Questions | Normal/Fast 与 Hidden/Immediate 独立；按实际 A–E/选项数量支持；多选 Enter 提交；M 标记；不增加每道正确题后的“稳吗”确认 |
| Xizong KP/Recall | 以 Xizong 自己的 Front/Reveal/rating gate 为准；不要套用共享文档中可选 Reveal 的宽松例子，导致隐藏答案时提交评分 |
| Translation/Writing/备注 | 输入框与中文输入法拥有键盘；不能被全局学习快捷键截走 |

键盘回归必须覆盖：input/textarea/select/contenteditable、IME `isComposing`、Cmd/Ctrl/Alt 组合、长按 `event.repeat`、submit→next 之间的重复键入、嵌套控件焦点、页面恢复后监听器重复注册。

一次键入不能同时“提交当前题+选择下一题”。异步持久化未确认时不能伪装保存完成或自动推进。保持点击与键盘结果一致。

---

## 7｜Politics 专用执行要求

### 精确读取路线

`content/politics/CURRENT.md` → `POLITICS_PRODUCT_STATUS.md` → `POLITICS_UI_REVIEW_PROTOCOL.md` → `content/politics/LEARNING_CONTRACT.md` + `INTERACTION_CONTRACT.md` → `POLITICS_PRODUCT_BRIEF.md` → 五科对应设计 → Projection manifest / exact chapter assets → 仅其选择的 Current refs → touched Runtime/Evidence/Repair/Return。

五科设计文件：

- `static-web/POLITICS_MARXISM_DESIGN.md`
- `static-web/POLITICS_HISTORY_C01_DESIGN.md`
- `static-web/POLITICS_MAO_DESIGN.md`
- `static-web/POLITICS_XI_DESIGN.md`
- `static-web/POLITICS_ETHICS_LAW_DESIGN.md`

编写时基线：53 chapter assets / 160 Current NU owners，151 PASS / 9 REFERENCE_ONLY / 0 BLOCKED。执行时从 manifest 核对，不硬编码这些数字到 renderer。**160 owner accounting 不等于必须显示 160 个独立课程页面。**

### 实现顺序与范围

遵循 `POLITICS_PRODUCT_STATUS.md` 的已有 program：bounded consumer/shell → 五种语法压力测试 → Home、handoff、Workbench、repair/return → 实屏审核/同 PR 修正 → 扩展全 53 章 → final QA。既定代表性验收未通过前不自行批量推广，也不把代表样稿当全科交付。

代表性场景至少含：马原 C00 双 Map/拓扑，史纲 C01 与高密度 C06，毛中特 C02 角色矩阵与 C04 并行回答，习思想 C02 层级/相邻身份，思修法基 C05 场景与 C06 法治层级。按实际 manifest 路由，不猜 URL。

### 必须保留

- 一次一个 Natural Unit 主舞台，自由导航；ORIENT 与 external learn 可在同一工作区，不新增强制“我学完了→Recall通过→做题”仪式。
- iPad/MarginNote 是乘风连续学习面；Mac 保留 Current 的认知伴随与 locator，不复制连续讲义。
- 五科不同 geometry：马原 topology/reasoning，史纲 stage/cause/evaluation，毛中特 problem/theory/role，习思想 hierarchy/identity，思修 concept/boundary/application。
- 多 Map 的 simultaneous_visibility、topology edges、固定表述、限定条件、边界、optional/null 与 REFERENCE_ONLY 精确消费。不从原始文本重新猜 cognitive shape。
- 政治 Home 是 meaningful Continue / 五科入口 / 真实问题 handoff，不是全章目录或状态看板。
- 肖1000作答前全宽题干、适合时 2×2 选项；Normal/Fast 与标记能力保留。提交后保留左 summary/evidence + 右知识/source review 的既定信息架构，不添加“结构/易混/诊断”必经阶段。
- `一句话带走`、理解/来源/原解析只从已合法可用的 Current 资产取得；没有就诚实缺省，不能 AI 临时编答案或静默调用旧仓。
- 稳定答对低摩擦；Wrong/meaningful Uncertain、first attempt immutable、event-local repair provenance、持久化失败 fail closed、exact return/Resume 不变。

### Legacy 边界

采用 Product Brief 已抽取的历史 Workbench 行为规范，不要求 Codex 考古。若确有未完成的历史能力/数据 reconciliation，由 Chat 做有界迁移后提供 Current-facing handoff；Codex 不读旧 localhost/旧 API 作为 fallback。

历史 1148 refined explanations 的准入状态须查 Current。未合法提升时保持缺席并明确报告；它不冻结不依赖该资产的 UI，但不能宣称其迁移已完成或用临时文本冒充。

---

## 8｜English 专用执行要求

### 精确读取路线

`content/english/CURRENT.md` → `static-web/ENGLISH_PRODUCT_STATUS.md` → `ENGLISH_PRODUCT_BRIEF.md` → `content/english/LEARNING_CONTRACT.md` + `PROJECTION_CONTRACT.md` → objective/translation/writing 的相关 Current / module contracts / Acceptance → 实际 task/learning owners 与 route/Runtime/Evidence。

英语 Functional First 已闭合。这里消费已有成果，不再制作英语课程，不强制建立一套政治式 chapter Projection 文件。

### 完整 family accounting

在同一交付 ledger 中覆盖：English Home/Resume、Reading A、Cloze、Part B 的全部 Current forms、Translation、Writing Small/Big 与 Direct/Plan、First Learning/Task Guides、Lexical read-only handoff 和 exact return。

- **Reading A**：完整 Passage 左、完整题组右，独立滚动；active 仅用于键盘定位，不控制其他题可见性。选项未提交前不染正确色；问题回看原位展开。保留计时、轨迹、Uncertain、continuous/hidden review 及完整 packet。
- **Cloze**：完整文章 + 全部20空题行；每行默认 A–D 横排，长选项合法换行/必要时2×2，不退化成单空 wizard。双向定位、自由改答、整篇提交、时间与轨迹都保留。
- **Part B**：保留 Current 四种形式——gap matching、heading matching、paragraph ordering、comment–statement matching；候选池、完整 placement/order map、fixed givens、已知 repeat/single-use 规则不变。成对交换和连锁错误不能拆成孤立单题复盘。
- **Translation**：完整源文 + 全组译文输入；首次译文与 revision 分离，reference 只按合法 post-attempt action 展示且非唯一标准。稳定 PASS 是真实出口；问题处 Reconstruction 由 learner 做。
- **Writing**：prompt/图表/要求 + 主要 authoring 区；Direct 与 optional Plan 同等合法。首稿不被重写，timer/word count 安静，clean attempt 不泄漏范文。网页负责作品，Chat负责语义讨论，不把 JSON 来回导入当常规必经流程。
- **First Learning / Task Guides**：完整但可跳过；复用实际高密度教学资产、框架/例子/边界/展开层级。不能为了“修复库很轻”把整份有用导学压成一张摘要。局部学习要有 exact origin return，浏览全貌仍可达。
- **Lexical**：单词查找只读路由到 Current Lexical owner；不能新增本地词典、自动入 Repair、修改 Lexical evidence。无 exact match 则走合法搜索，不猜解释；保留原任务、定位和滚动。
- **Home/Resume**：接续真实最高价值未完成工作，不等于最近打开；不能让 PASS/dormant pending 回来占首屏，不能从工程状态推导学习进度。覆盖遗漏的 task family 时先核对其 state/priority owner，不自行 invent 优先级。

English whole-object completeness 优先于共用组件。至少在真实页面证明“所有题存在且可达”，而不是仅 DOM 中藏着未显示题。

---

## 9｜Xizong 专用执行要求

### 精确读取路线

`content/xizong/CURRENT.md` → `static-web/XIZONG_PRODUCT_STATUS.md` → `XIZONG_PRODUCT_BRIEF.md` + `XIZONG_UI_REVIEW_PROTOCOL.md` → 四份 surface design → `content/xizong/LEARNING_CONTRACT.md` → Projection contract / manifest / freeze receipt → 相应 System Current/Acceptance、被绑定的 Current owners 与 touched Runtime/Evidence。

四份 surface design：`XIZONG_HOME_DESIGN.md`、`XIZONG_SYSTEM_GUIDE_DESIGN.md`、`XIZONG_BLOCK_WORKSPACE_DESIGN.md`、`XIZONG_SYSTEM_COMPLETION_DESIGN.md`，均位于 `static-web/`。

编写时范围：A1/A2/A3，3 System + 38 Block = 41 assets，805 KP identities，396 bindings；v1 validator 曾通过86个mutation/control。**这些只是历史基线，不是本轮新结果，也不表示所有表达都同样 rich。**7个 rich calibration 与31个 baseline 均复用；标签本身不证明要重做或足够。发现具体 source-to-view 缺口只升级给对应 owner，不重启 #112 bulk upgrade。

### 必须保留

- System → Block → Logic Group orientation → iPad/MarginNote 连续学整个 Logic Group → 一次返回 → 该组 KP Recall → group closure → Block Recall/Complete。
- System/Block Guide 的高密度正文、框架、机制、变量、比较、边界和可达层级不被瘦身；不把 Guide 变成目录或海报。
- role 与 geometry 分开；一 Block 可有多个对象；optional Visual/Precision/Connection/external contract 按真实绑定消费。A1 的医学模型不写入通用 renderer。
- KP/Block/System Recall Front 的整个 workspace 均保护答案，包括标题、breadcrumb、侧栏、提示、tooltip、可聚焦隐藏内容、图形和 accessibility labels。
- System Recall 与后续真题/复盘受真实 learner prerequisites 控制；不因工程可用强迫 Kian 做。
- Normal/Fast 与 Hidden/Immediate 独立。Whole-paper 默认 Hidden；不能从颜色、排序、计数、筛选、声音、停留/自动跳题差异泄露对错。
- Hidden + Fast 对所有已记录答案采用同样可观察的推进逻辑；不能错题停、对题跳导致旁路泄题。
- 试卷结束/提交不自动授权看分数/答案；以最新 Product owner 中明确的 learner reveal 规则为准。
- M 标记独立于 correctness；正确题不增加“稳/不确定”第二次确认。Marked 不等于 UNCERTAIN，不把旧证据语义强行改名。
- Wrong Quick Review 只展示 Current 的最小可用解释，深层解释可选；没有 reviewed Question→KP relation 就保持 question-scoped repair。
- 系统题/整卷必须来自真实 Question Truth 的范围、题型、顺序、选项和评分，不猜100题、5选项或固定分值。

### 真实兼容性边界

新产品行为中的 multi-attempt、整卷、reveal timing、评分或标记若现有 Runtime/Evidence 尚不支持，按 exact contract 列出最小缺口，由原 owner 裁决/授权；不能用 CSS 隐藏结果就声称完整实现，也不擅改 Evidence。

B–F 当前不因本任务扩 scope。执行时即便新 System eligible，也先记录为新增范围，等明确授权；不越过其 Learning gate。已有 inactive/未就绪入口不得假装已准备完毕。

---

## 10｜真实测试：正常路径、错误路径、内容变化一起验

执行时读取 actual `package.json`、已有 scripts 和对应 `.github/workflows/**` 的命令，记录候选 commit / 命令 / exit / 日志。不猜 npm script，不盲用不存在 lockfile 的 `npm ci`，不以 workflow 名称代替实际 job 输出。

### 必做测试矩阵

1. **绑定与覆盖**：对应科目 current loaders / Projection validators、全 route/owner inventory；missing/stale/unsupported/null/REFERENCE_ONLY 按各自 contract fail closed 或保持合法缺席，不 silently fall back 到 raw content inference。
2. **内容变化吸收**：隔离 fixture/in-memory 模拟长标题、长正文、对象数量变化、optional 缺席、真实合法 shape；不改 production medical/political/text owners。普通变化不需要 named-topic CSS/代码分支。invalid shape 必须被发现，不能删除失败测试保绿。
3. **内容保真**：比较修改前后受保护源 hash/diff；渲染后检查关键关系、限定、完整题组、固定给定、首稿/首答都保留。按 domain 实际依赖粒度验证局部 stale，不强造所有科都必须 Block 粒度的规则。
4. **正常动作**：导航/选答/提交/下一题或下一组、自由回退、空任务、unit 无题时的合法路径。
5. **异常动作**：Wrong、meaningful Uncertain、Marked、重复提交、刷新、back/forward、storage 不可用、损坏/stale local state；先保存证据再宣布进展，不能制造已保存。
6. **Repair/Return/Resume**：去 source/Chat/First Learning/Lexical 后能回 exact task/object；first attempt/draft 不被修复覆盖，完成/退出不会制造后续债。
7. **答案保护**：clean attempt/Recall Front/Hidden paper 实际 DOM可见层、focus、a11y、侧栏与间接状态均检查；静态 assets 验证不能代替浏览器测试。
8. **键盘与可访问性**：本文件§6，visible focus、语义控件名称、typing wins、reduced motion、文本放大。
9. **跨科回归**：改 shared Base/tokens/controls 则回归另外两科代表任务；不要“政治过了”却压坏英语右侧完整题组。
10. **生产 build**：当前适用的 domain QA / browser journeys 与 Astro build。只对适用范围下结论，不声称遍历所有题或真人使用。

西综至少复用当前 `validate_projection.py` 与 `test_projection.py` 所在 gate，包括现有 companion acceptance；政治复用 `validate-politics-cognitive-projection-assets.mjs` 及五科适用的 R/E journeys；英语复用 Objective/Translation/Writing 的实际 guards/journeys，保护 true-exam/holdout，工程用已准入非保护材料或显式 synthetic fixtures。

既有失败：在同环境跑基线与候选，分清本次回归、真实既有缺陷、工具/环境失败。不删断言、不换成弱 case。真实阻碍该科闭环的问题仍然是 blocker，不能因“以前也红”就宣称完成；无关失败也不无限绑架整个 Program。

---

## 11｜截图是交付物，不是宣传图

必须提供可打开的实际浏览器 artifact/preview；不是 ASCII、AI生成图或设计草图。截图旁记录：commit、route、object/state、viewport、DPR、OS、browser/version、字体加载情况、fixture/synthetic 标记和复现命令。

每个已实现 surface family 至少交：主视口完整正常态、真实问题/回看态（适用时）、长内容压力态、窄窗口 fallback；有旧页面时给同条件 before/after。需读长 Guide 时补 full-page 或滚动后截图，不靠裁掉溢出区域掩盖问题。

截图 reviewer 应看到：

- 内容/关系/作答区真实占用宽度与正文可读性；
- 无空 Inspector、巨大留白、卡片堆、反复揭示税；
- baseline 必需内容确实可见，非“在隐藏 DOM 所以算保留”；
- 错误/隐藏/快速路径仍正确，组件间无遮挡与焦点丢失；
- 同科相似任务一致，跨科共享风格但 task geometry 不被抹平。

**环境声明必须诚实：**Linux/Playwright 的 Mac-sized viewport 叫桌面尺寸模拟，不叫真 Mac/Safari 验收。可用时补 Chromium + WebKit 行为回归；WebKit 自动化也不自动等于用户的 Safari。真实 macOS 字体、Safari/浏览器、系统缩放与 Kian 审美验收未取得时明确保留待验，不阻止提交可审查 PR，也不提前标成已接受。

Artifacts 不含真实 learner 数据、tokens、cookies 或个人草稿；不把审查截图里的合成作答当作 Kian 学习记录。

---

## 12｜PR、独立审核与安全落地

- 从执行时最新 main 建 short-lived bounded branch；重用本任务活动 PR。
- 在 #113/PR 留一条 scope、base SHA、write-set、当前关卡、阻塞信息。不要每次答复创建新 Issue/状态文件。
- 共享文件冲突重新读最新版本；不 force push main，不覆盖别人的提交，不把旧全文件内容写回新 owner。
- reconciliation 后重新跑受影响检查；receipt 要标明被测 candidate SHA。测试后 production 代码又变了，旧结果不能直接覆盖新代码。
- 在 PR 里列保护路径无 diff 的证据；不顺手清理无关历史或修改其他 branches。
- reviewer 必须从 Current + final diff/DOM 出发独立审；Codex 自查或本 Chat 重看自己写的代码仍属 SELF，不能伪装 independent PASS。
- 回复所有真实审查项，继续 SAME PR 修；不要用新 PR 绕开未解决问题。
- **Codex 不自行 merge、不关闭 #113、不把 U/真人验收写为 PASS。**经明确授权合并后由负责 reviewer 核对 main、CI/回执、并行提交保留和 branch retirement。

`zero-semantic-diff` 指领域语义/源归属/学习顺序/证据含义等不变，**不是**要求 DOM/CSS/所有可见文案字节不变。每个表层改变要能追溯到已接受产品要求；真正新增 semantic decision 必须单列，不能靠“UI优化”掩盖。

---

## 13｜完成定义与阻塞处理

一个 scope 的交付 ledger 每项只能明确为：implemented/tested、unchanged/verified、blocked with reason、out of authorized scope。未读、未跑、未截图不能计作通过。

Codex 实现可审查条件：

- 授权范围每个 surface/route/owner 有 accounting；
- 实际 production edits 已提交，非仅计划/占位按钮/伪 JSON；
- 关键行为/semantic guards/适用 QA 有当前证据；
- 可复现 preview 或 build 方法、完整截图 artifacts 可用；
- 受保护源/证据语义不漂移；
- PR 开放，真实阻塞和等待人的验收清楚。

`SUBJECT_CLOSED_FOR_HOME` 还需要独立审核、Kian必要验收、授权合并、main核验及分支退役；任何一个 scope blocked 都不宣称整科全完成。可记录真实部分交付，不虚构100%。

允许暂停的位置：共享视觉冻结、已规定的代表性页面验收、真实 authority/semantic conflict、不可安全完成的 Git 写入、实际环境限制。不要把必要的验收门槛写成“禁止停早”然后强行跳过。

同时避免空转：普通实现选择由 Codex 在边界内自行完成，不每个 Block/页面问一次。工具受阻说明具体失败证据和可继续范围；不要无期限考古或反复重试同一传输方法。长任务中断时写回当前 commit / 已测范围 / 首个剩余动作，续接而不重做。

---

## 14｜最后 Global Home，不提前反向绑架三科

三科达到经验证的 subject closure 后，才开启 final Global Home 的单独实施切片。当前只保持既有 Home/入口/返回可用，不拆掉现有导航，也不让三科变成孤立 demos。

最终 Home 消费稳定的 subject entry / meaningful Continue / 必要 Attention，不成为新的学习调度器。入口是西综、英语、政治；Lexical 是独立但次要的工具/供给入口。共享视觉参数可以先一致，Global Home 最终整合仍最后做。

若 Global Home 接线暴露某科遗漏，只回到最小 owner 修复，不重开所有三科设计。

---

## 15｜给 Kian 的 Codex 交付格式

只需报告：

1. 科目、scope、base/head SHA、branch、PR；
2. 实际实现/保留/受阻/不在范围内的 accounting；
3. 本次 Mac/风格改善及其原 Product/Preference 依据；
4. 测试命令、数量、真实结论、CI/artifact 链接；
5. before/after、主视口、问题态、长内容、fallback 截图入口与实际环境；
6. 受保护 source/semantic diff 检查；
7. 待独立审核、待 Kian选择、待真 Mac验证的项目；
8. `NOT MERGED`，或在后续明确授权 merge 后给出真实 main 读回/退役证据。

不要把逐文件推理全部倾倒给用户。不要把测试 PASS、截图存在、产品接受和真实学习效果混成一个“全绿”。

---

## 启动短指令

```text
执行 kianwang022-hash/kianos 的 Issue #113 当前实施项。
先读最新 main 的 static-web/CURRENT.md 和
static-web/CODEX_THREE_SUBJECT_IMPLEMENTATION.md，
再按当前科目的 Product Status / accepted owners 路由。
复用活动 PR；没有当前实施项时先从 Politics 开始。
遵守共享视觉 pre-handoff、Mac-wide/风格、完整内容、测试与截图要求。
实际施工并提交可独立审查 PR，不只返回计划；不自行 merge。
```
