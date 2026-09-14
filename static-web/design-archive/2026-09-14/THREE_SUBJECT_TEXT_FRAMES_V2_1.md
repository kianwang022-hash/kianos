# Codex 执行提示词｜三科 Mac-wide 落地 · 对话决策与文字框版

Version: **v2.1 · 2026-09-14**  
Status: **RECONCILED EXECUTION HANDOFF — NOT IMPLEMENTATION / VISUAL ACCEPTANCE**  
Program: #113；Politics Xiao1000 learner-explanation Current promotion 已由 PR #124 落地  
Current router: `static-web/CURRENT.md`

本文件是执行提示词，包括共同要求、三科专用要求、原文文字框摘录、implementation synthesis frame 与验收规则。不是新的知识库、学习合同、证据数据库或另一份产品状态总表。

本轮设计文件核对基线：`main@885020ee4375f7c02c99e88feee8102a7abe35ff`。执行时读取最新 main；这里的 SHA 只固定本次设计摘录来源，不是永久施工基线。Politics 题后 learner-explanation 资产的后续 Current 事实以最新 main 与 PR #124 promotion receipt 为准。

## 0｜先读：本对话的决定优先，以及证据边界

Kian 本轮明确要求：

> 三科都是我们这个对话框的，你深度查找最终决定的那一版，并且我们这里的决定优先特别高，如果现在的提示词有冲突，大概率就是提示词问题。

### 0.1 产品决策冲突顺序

```text
本对话里 Kian 最后明确确认 / 纠正的产品与交互决定
→ 能对应这些决定的详细设计原文 / 文字框及其说明
→ 执行提示词、状态摘要、Issue 概述
→ 旧实现、通用组件习惯、AI 新提议
```

这是**产品意图的裁决顺序**。不能拿后写的 assistant 总结、FROZEN 标签或旧页面反过来否定 Kian 的具体决定。也不能把“assistant 最后说过”当成“Kian 最后接受”。

- 后来的明确纠正取代同一问题的早版；不要把被否定版本与最终版本并列为两种可选实现。
- `可以 / OK / 下一步`只作用于能够定位的那次提议，不能扩成对整套推断的追认。
- 确认了布局职责，不等于确认了每个字体、色值、像素或尚未实现的功能。
- 用户未提出改变的领域内容、Source、学习顺序、Evidence、learner state 仍受原 owners 约束。若落实明确新交互确需改 Runtime/Evidence，列出最小兼容性变更交回 owner；不能伪装成纯 CSS，也不能用旧实现否决产品要求。
- 发现本提示词误述，修正提示词及必要的原产品记录；不要要求 Kian 再接受一次已经明确表达的决定。

### 0.2 本轮恢复范围，禁止伪造“原聊天已全部找回”

三科讨论都属于同一个长对话，不能再编造“三个最新 Chat”的标题、时间或定位。

本轮可核对的是：当前上下文仍可见的用户原话、已取回的历史记录线索、以及下面逐项标注的**详细设计文件原文**。原始导出存在中段页面缺失，因此本文件仍**不宣称已逐句遍历整个原始 transcript，也不把仓库摘录或新绘制 implementation frame 冒充原聊天逐字稿**。

来源标签：

- `USER_EXPLICIT_VISIBLE`：本对话当前可直接核对的用户原话。
- `DESIGN_VERBATIM`：从指定详细设计 owner 原样摘取的文字框/流程块；不是重新绘制。
- `DESIGN_BEHAVIOR`：该 owner 的明确行为说明；不能冒充原 ASCII 框。
- `EXECUTION_SYNTHESIS`：原历史 ASCII 没有完整恢复，但产品职责与行为已经由 accepted owner / 用户明确决定闭合；本文件据此给出的**非历史** implementation frame。它可以用于施工与截图验收，但不能声称“这就是当时原聊天定稿框”。

来源不足只限制“历史逐字恢复”的声明，不自动制造产品 blocker。若 accepted 行为已经充分，使用 `EXECUTION_SYNTHESIS` 施工；以后若取得真正原框，只在发现实质冲突时按 Kian 最后明确决定纠正，不叠加第四套方案。

### 0.3 本对话可见的硬约束

| 用户原话锚点 | 实施含义 |
| --- | --- |
| “但是我是mac横屏，你这样我感觉很密度很低” | Mac 横屏为设计原点，不是拉宽手机页。 |
| “我感觉这个事高密度信息，你不能因为为了展示就拆开简化” | 组织空间而不删薄有用内容；完整 Guide 可以滚动。 |
| “一定要读取之前的资产” / “logic-projection” | 使用既有被批准资产；不得从标题重写一套导学。 |
| “你不能改动，你只是负责展示”及后续“但是你可以升级资产，就是内容是不变的，但是可以优化展示” | 内容语义不变，展示资产可以有界演化；不是所有呈现文件永久只读。 |
| “还有你必须读懂整个流程再和我讨论” / “局部优化，全局出错” | 先理解完整学习—作答—修复—返回链，再改局部界面。 |
| “如果我有问题我会左切回去加标记，要么开始就标记，和英语一样” | 西综不增加每道正确题后的“稳吗 / 确定吗”确认；允许前后自由标记。 |
| “甚至可以12345enter，快刷就直接选对就跳那个模式” | 高频键盘、单选快刷；安全处理多选与错题，不制造额外确认。 |
| “我选择刷整卷，应该不能直接告诉我对错，加个隐藏模式，让我自己选看不看” | 输入速度与结果可见性独立；整卷默认隐藏，主动揭示由用户控制。 |
| “总框架功能是一样的，但是内容资产需要升级” / “架构必须是经得起内容变化的” | 普通内容演化由资产/通用渲染吸收，不按疾病/章节写死页面。 |
| “我们把其他科目都做到收工” / “然后做个总home” | 分科完成后做 Global Home；不能只交三个孤立样页。 |
| “而且是一句话解析和ai精炼解析，不是我们村的pdfocr生成的” | 政治 takeaway、chat_explanation 与 PDF/OCR 原解析是不同内容层。 |

这些原话锚点不是完整 transcript。详细技术行为以以下科目原文及对应 owner 对账，不从一句原话扩大语义授权。

### 0.4 Minimum-sufficient learner action｜No mandatory ritual

原对话在三科重新验收时形成的跨科规则必须直接约束 UI 实施，而不是只存在于设计背景里：

```text
Construct → Attack → Survive / Change → Freeze
```

三层最小充分问题：

```text
Logic   = 是否是最小充分模型？
Content = 是否是最小充分学习资产？
UI      = 是否是最小充分学习动作？
```

对每个新增 learner-facing `panel / step / gate / checkpoint / confirmation / persistent chrome`，先反向攻击：

- 它具体防止什么失分、认知丢失或真实学习摩擦？
- 它减少什么未来学习/复习操作，而不是制造第二套操作？
- 删除、合并或降级它后，内容保真、Evidence 和 exact return 是否仍完整？
- 能否在 stable/correct path 一键经过或完全不打扰？
- 这是 learner 真正需要的动作，还是把 backend richness 错投影成 learner burden？

默认规则：**如果删除一个额外动作后学习价值与证据完整性不下降，就不让它成为 mandatory learner action。** Capability 可以存在，不等于用户必须操作一遍。

同时：

> **Shorter text alone is not compression. A beautiful framework that creates an extra course is negative compression.**

因此不能用“更短、更干净”为理由删薄高价值内容，也不能把完整内容重新包装成一套需要额外学习/点击的第二课程。目标是减少不必要动作，不是减少必要信息。

---

## 1｜直接任务、读取与执行终点

把已经讨论好的 Politics / English / 当前 eligible Xizong 产品与交互落成 production UI。**不重新设计三科、不再制作第二套课程、不只返回计划、不用样例冒充全科。**

共用要求必读；三科专用要求与文字框按当前科目读取。先读最新 #113 正文/评论及活动 PR。已有任务就续接；没有明确调度或活动 UI 实施项时，默认 Politics → English → 当前 eligible Xizong。这是工程顺序，不是 Kian 学习顺序。

入口：

```text
最新 main@HEAD
→ AGENTS.md + BRANCH_LIFECYCLE.md
→ static-web/CURRENT.md + 本文件 + #113 最新执行信息
→ KIAN_UI_PREFERENCES.md + UI_STYLE_BRIEF.md + PRESENTATION_CONTRACT.md
→ 当前科目 Product Status + 详细 Product / surface design
→ 对应 Learning / Interaction / Projection 与实际 Runtime / Evidence / Repair / Return
```

`SYSTEM_CONTRACT.md`约束跨设备 surface ownership；触及内容可演化性时核对 `PROJECT_DEFINITION.md` R10 与 `ARCHITECTURE.md` 对应段落。熟悉且未变化的治理文件不为仪式反复读；读到足以理解**完整活跃依赖链**，不是只读一个组件。

先检查实际 route、loader、bridge/enhancer、样式覆盖和最终 DOM；不要把未挂载旧组件当成正在运行的界面。

交付链：

```text
核对 Current / 原决定 / 活动 PR
→ 必要且只做一次的共享视觉参数校准
→ 有界实际实现
→ 真实测试 + 截图 + 自查修复
→ 可独立审查 PR / 精确 handoff
→ 独立审核 + Kian 必要视觉选择
→ 经授权 merge + main 读回 + 分支退役
```

默认一个重叠修改 shared static-web 的 production UI PR；可按科目内真实验收边界分串行 slice，不强塞巨型 PR，也不每章一个工程项目。普通实现选择由 Codex 自行推进，不每页问“要不要继续”。必要的独立审核和用户验收不能被“不要停早”跳过。

---

## 2｜文字框怎么用：是空间与行为约束，不是装饰图

下文文字框是提示词的组成部分，不是可跳过的附件。实现当前 surface 前，读取对应 frame 及其 source section 的完整行为说明。

### 必须保留

- 空间职责、同时可见关系、主次层级与真实顺序；
- 当前对象的完整有用内容、关键限定/否定/边界；
- 正常态、问题态、Front/Reveal、隐藏结果的不同权限；
- 键盘、返回、滚动、标记、来源与资产身份。

### 可以适配

在这些不变的前提下适配列宽、断点、字号、行高、局部滚动、控件实现。框中的比例若原文写“约 / may / heuristic”，就不是固定 CSS 合同。

### 禁止推断

```text
ASCII box ≠ 带边框的大卡片
示意留白 ≠ 生产页面必须留空
框中省略号 ≠ 正文可以省略
框里没画按钮 ≠ 既有能力可以删除
箭头表示导航/身份顺序 ≠ 自动证明领域因果
示例题号/病例/节点 ≠ 全站硬编码
示意图 ≠ 实际截图验收
```

框内 English labels、元信息和样例只是原文摘录；实际 learner 文案/数据使用对应 Current owner，不把工程状态原样搬上屏。

每个实施 surface 的回执要有：

`frame ID + exact source section → 当前语义/资产引用 → route/component → 正常态/问题态/保护态 → 截图和行为证据`。

`EXECUTION_SYNTHESIS` frame 也必须进入 frame-to-view 对账，但验收的是 accepted behavior 与空间职责，不是“与历史 ASCII 像素一致”。不能只做一张漂亮首屏就跳过题后、长内容、返回或保护态。

---

## 3｜写入边界：内容保真，表达可以演化

正常 write-set：当前切片实际使用的 `static-web/src/pages/**`、`components/**`、`styles/**`、必要 view adapters/接线和风险对应 tests。共享控件/tokens 改动必须列出受影响消费者，回归已经完成的其他科。

不因 UI 方便修改 canonical 知识、题干、选项、正式答案、学习顺序、首答/首稿、Evidence/mastery、Memory准入、Resume优先级、holdout 或私有 learner state。不改权限、secrets、仓库设置、无关 workflows。依赖/lockfile/大型 UI 框架不是默认改动范围。

**修正 v1 的绝对只读误读：**内容不变，不等于展示资产不可改。若已接受文字框要求的表达在现有资产中缺失，先区分：

1. renderer 没消费已有对象：修 consumer，不改上游。
2. 既有 contract 明确允许的纯呈现组织/可见性/绑定修正：可在本切片 PR 提交最小候选 diff，列 exact source、前后语义等价、局部影响及 validator/mutation；独立审核前不标接受。不能借此扩大 selector 的医学/政治含义或绕过 Recall gating。
3. 必须增加新知识关系、新认知解释、改变 source admission 或 semantic schema：交回原 owner 裁决；不由 UI 猜补。其他独立工作继续。

不重启 #112 全量编译，不为三科对称强造统一 schema，不把政治层级/西综机制或医学 topic 写进 generic renderer。表达文件数量和 PASS 标签不证明内容到页面无损。

---

## 4｜Mac / Kian UI 风格验收

采用 `KIAN_UI_PREFERENCES.md` 的显式偏好；assistant hypotheses 不是硬需求。整体 Dense Calm：字舒服、对比清楚、信息丰富、层次明确、操作安静，内容比软件更醒目。

- Mac 横屏主动利用宽度；完整文章/题组、源文/输出、真正同时有用的两张 map 并排。
- 不保留空 Context，不用巨大 min-height、成功空页、重复标题、卡片堆填空间。
- 当前对象的第一轮必要结构默认可见；不能靠一连串 details/tab 才拼出完整理解。保护答案及真正深层/后期内容除外。
- 高密度 Guide / Core 可超过一屏；先做空间组织、层级、局部滚动，不能缩成摘要、裁切、ellipsis 或 overflow:hidden。
- 正常解释保留可读行长；整体吃宽度不等于每行正文铺满整个屏幕。
- 边框/背景/圆角只表达真实边界；克制 neutral 与单一 accent，不做高饱和多色、渐变、装饰动画和状态徽章墙。
- 浏览器实查实际字号/行高/contrast/focus/hit area，不只查 CSS 变量；核心说明与选项不能依赖8–12px小字。选中未提交只代表“我的选择”。
- 不把 backend 简化成丢证据；不把 frontend 简洁误解成删内容。必要保存失败提示不能藏掉。

### 共享视觉参数

先查 Style owner 有没有已接受 tokens，有就复用。若精确字体/色值仍未定，只做一次既定的 pre-handoff 视觉校准：同一候选在真实长内容、干净题面和问题态上展示，标为 PROPOSED，不重新讨论三科产品。不得每页各造一套，也不得自报 Kian 已接受。

候选须覆盖 font stack/scale、neutral/accent、selected/focus/correct/wrong/uncertain、spacing/divider/radius/elevation、buttons/forms、薄导航与 dark mode 是否 deferred。18px正文、18–20px英文阅读、约20px题干等仅是此前建议起点，不是用户最终像素选择。可靠系统字体/已有合法资源优先，不分发系统字体文件。后续 shared token 修改回归已完成科目。

### 测试视口与真实环境

至少检查 CSS viewports：1440×900、1728×1117、1920×1080；fallback 1024×768及约820px宽；主视口追加125%放大。它们是测试尺寸，不是 Kian 硬件声明。记录 viewport、DPR、OS、浏览器版本、实际字体。

Linux/Playwright 的 Mac-sized screenshot 只能叫桌面尺寸模拟；WebKit 自动化不自动等于真 Safari。真实 macOS 字体/缩放/浏览器验证未做就保留待验，不能妨碍提交可审查 PR，也不能冒充已经真人验收。

---

## 5｜全链保真与低摩擦输入

改动前读懂：进入 → 当前对象 → 外部学习/作答 → 提交/揭示 → 最小修复 → exact return → Resume/退出。保留 first attempt/draft；修复成功不是重写历史或掌握证据。

| Surface | 关键规则 |
| --- | --- |
| English Reading A / Cloze | 完整题组持续可见；1–4只给当前焦点选答；不逐题评分；整篇/整组提交。 |
| English Part B | 完整候选与placement/order map；不用A–D单题wizard替代。 |
| Politics Xiao1000 | 保留自身Normal/Fast、单多选、Uncertain/Favorite/讨论标记；不套西综Mark语义。 |
| Xizong Questions | 1–5按实际A–E选项；单选Fast直接提交，多选Enter；M独立标记；Normal/Fast与Hidden/Immediate独立。 |
| Xizong Recall | 使用其自身Reveal/rating gates；共享文档里的可选Reveal示例不能放宽西综评分条件。 |
| 写作/翻译/备注/scratch | 输入与IME优先；全局快捷键暂停。 |

测试 input/textarea/select/contenteditable、isComposing、Cmd/Ctrl/Alt、event.repeat、提交到跳题间连续键入、嵌套焦点、刷新后的重复监听。一次键入不能既提交当前题又选择下一题。保存未成功不能假称已保存或丢失作答；点击和键盘结果一致。

不加每道稳定题的“稳吗”确认。政治 optional mental close 不等于西综 formal Lecture contact；西综确有证据意义的一次返回不能机械删掉。不同 surface 的低摩擦不能用同一个状态机抹平。

---

# 6｜English：执行要求与文字框

读：`content/english/CURRENT.md` → `ENGLISH_PRODUCT_STATUS.md` → `ENGLISH_PRODUCT_BRIEF.md` → Learning/Projection contracts → 当前 objective/translation/writing module owners及实际运行代码。

下面 E01–E06 为 `ENGLISH_PRODUCT_BRIEF.md` 对应段落的 DESIGN_VERBATIM 摘录，来源版本为本文件顶部核对基线。该文件旧 `ACTIVE DISCUSSION` 与 Home-unresolved footer 是阶段记录，不据此重开 Kian 已确认的产品讨论。

## E01｜Reading A — accepted direction

```text
Mac landscape
Passage left, independently scrollable
|
full question set right, all questions visible in natural order and independently scrollable
```

原选中样式示意：

```text
  1   option A

  2   option B

╭──────────────────────────────╮
│ 3   option C              ✓ │
╰──────────────────────────────╯

  4   option D
```

必须保留：完整题组，不因active/focused题隐藏其余题；两区独立滚动；整篇提交前不泄答案；计时、改答轨迹、Uncertain、连续练习与深复盘packet。提交后Wrong/Uncertain原位展开，原文章和完整题组仍可用。单词选区只读Lexical，短语/句段依Current支持给highlight/Chat上下文，不建本地第二词典。

## E02｜Cloze — full exam-paper layout，取代旧单空版

```text
┌────────────────────────────────────────┬──────────────────────────────────────────────────┐
│ Complete Passage                       │ 01  A ...      B ...      C ...      D ...       │
│                                        │                                                  │
│ ... ____1____ ...                      │ 02  A ...      B ...      C ...      D ...       │
│ ... ____2____ ...                      │                                                  │
│ ... ____3____ ...                      │ 03  A ...      B ...      C ...      D ...       │
│                                        │                                                  │
│ ... ____8____ ...                      │ ...                                              │
│                                        │ 08  A despite  B although  C therefore  D however│
│                                        │                                                  │
│                                        │ ...                                              │
│                                        │ 20  A ...      B ...      C ...      D ...       │
│             passage scroll ↓           │                         question sheet scroll ↓   │
└────────────────────────────────────────┴──────────────────────────────────────────────────┘
```

全部20行在同一题纸里自然排列、可滚动到达，不要求一屏塞满20行。A–D默认横排，长选项在自己的cell换行，必要时2×2；不默认四张纵向大卡。正文blank与题行双向定位；active仅键盘焦点；自由改答，whole-passage submit，不能选择一个空就评分。复盘保留同一完整题纸；problem-only filter可选，不转单空wizard。只对已主动标记不确定的问题提供可选处理，不给所有正确项增加确认。

## E03｜Part B — matching / ordering各保留原生结构

```text
┌────────────────────────────────────────┬──────────────────────────────────────┐
│ Full Material                          │ Candidate Pool                       │
│                                        │ A ...                               │
│ paragraph / comment / source...        │ B ...                               │
│                                        │ C ...        used → 41              │
│                                        │ D ...                               │
│                                        │ E ...                               │
│                                        │                                     │
│                                        │ Complete Map                        │
│                                        │ 41   [ C ]   ○ uncertain            │
│                                        │ 42   [ F ]                          │
│                                        │ 43   [ A ]                          │
│                                        │ 44   [   ]                          │
│                                        │ 45   [   ]                          │
│                      scroll ↓          │                       Submit        │
└────────────────────────────────────────┴──────────────────────────────────────┘
```

```text
Candidate Paragraphs                 ORDER MAP
A ...                                Fixed A
B ...                                   ↓
C ...                                41 [ C ]
D ...  fixed                            ↓
E ...                                42 [ F ]
F ...                                   ↓
G ...                                Fixed D
                                       ↓
                                    43 [...] → 44 [...] → 45 [...]
```

覆盖Current四种形式：gap matching、heading matching、paragraph ordering、comment–statement matching。保留DIRECTIONS、候选池、完整map、fixed givens、已知repeat/single-use规则、Uncertain与轨迹。未知规则不猜。提交后保留全局映射，成对交换/连锁错误不能抽成孤立题；整组Chat是可选升级。

## E04｜Translation — Mac-wide projection

```text
┌──────────────────────────────────────┬────────────────────────────────────────┐
│ Source Passage                       │ Your Translation                       │
│                                      │                                        │
│ paragraph...                         │ 46                                     │
│ underlined / target sentence 46      │ [ learner translation .............. ] │
│                                      │                                        │
│ paragraph...                         │ 47                                     │
│ underlined / target sentence 47      │ [ learner translation .............. ] │
│                                      │                                        │
│ ...                                  │ 48 ...                                 │
│                       scroll ↓       │ 49 ...                                 │
│                                      │ 50 ...                      Submit     │
└──────────────────────────────────────┴────────────────────────────────────────┘
```

原文允许约40–45% source / 55–60% work area，非硬比例。源句与对应输入互相定位；whole-set为上下文。首译与revision分开，reference只按合法post-attempt动作展示且非唯一标准。稳定PASS可退出；问题定位到局部，由learner做Reconstruction，不用AI成品替代。Runtime/ledger状态退后台。

## E05｜Writing — prompt与主要写作区

```text
┌──────────────────────────────────┬──────────────────────────────────────────┐
│ Prompt / visual / requirements   │ Your Essay                               │
│                                  │                                          │
│ role / audience / directions     │                                          │
│ or chart / image prompt          │                                          │
│                                  │                                          │
│ Optional Plan                    │                                          │
│ [ short real plan ]              │                                          │
│                                  │                                          │
│                                  │                        183 words · 18:24 │
│                                  │                               Submit     │
└──────────────────────────────────┴──────────────────────────────────────────┘
```

约35–40% prompt / 60–65% authoring为原文方向。Small/Big、Direct/optional Plan均保留；不强迫计划。首稿/首个真实plan保留，revision不覆盖；计时/字数安静；clean不泄范文。网页拥有作品，Chat拥有语义讨论；不要让用户把诊断JSON来回导入只为网页重复显示Chat。PASS是出口，同题修改不等于掌握。

## E06｜First Learning / targeted intervention — 原有局部文字框

```text
┌──────────────────────────────┬────────────────────────────────────────────┐
│ Reading A                    │ Evidence Boundary                          │
│                              │                                            │
│ Global Map                   │ focused explanation / examples             │
│ Question Demand              │                                            │
│ Evidence Boundary  ←         │                                            │
│ Option Proposition           │                                            │
│ Adjudication                 │                                            │
│ Deep Skills                  │                                            │
│                              │                                            │
│ ← Return to 2018 Text 2 Q27  │                         已经够用，返回 →   │
└──────────────────────────────┴────────────────────────────────────────────┘
```

这是**局部学习入口**，不是把整套导学缩为一个故障节点的授权。完整Task Guides / Global Map / validated First Learning资产仍可浏览且可跳过，保留框架、例子、边界、详细层级；`logic-projection`等既有导学须按当前真实owner定位，不能只凭旧文件名猜路径或拿运行状态页面冒充教学资产。Return回exact原题/句段/作文，不丢上下文。

## E07｜English Home / 完整Guide总入口 — execution synthesis

来源：`ENGLISH_PRODUCT_STATUS.md` + `ENGLISH_PRODUCT_BRIEF.md` 已接受职责；`EXECUTION_SYNTHESIS`。历史长对话的最终 Home ASCII 未完整恢复，但产品职责已闭合，因此**不再把缺原框当施工 blocker**，也不把下面这张框声称为历史原稿。

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ English                                                                      │
│                                                                              │
│ Continue                                                                     │
│ <highest-value real unfinished / resumable task>               Continue →    │
├──────────────────────────────────────────────────────────────────────────────┤
│ Objective / Reading family        Translation                 Writing          │
│ Reading A · Cloze · Part B        full source + workspace    Small / Big      │
│ Enter →                           Enter →                    Enter →           │
├──────────────────────────────────────────────────────────────────────────────┤
│ Guides / First Learning                                LexicalOS               │
│ complete · skippable · targeted                        read-only supply        │
│ exact return to owning task                            exact return            │
└──────────────────────────────────────────────────────────────────────────────┘
```

实施约束：

- Continue = 最高价值真实未完成/未解决工作，不是最近打开、工程状态、due 或虚构进度；没有真实 Resume 时安静消失/降级。
- 三个考试工作家族是主入口，不做巨大“课程卡”；Reading A/Cloze/Part B 保留自己原生几何。
- 完整 Guide / First Learning 是可浏览、可跳过、可由真实题目问题进入的支持层；不能藏到 debug/status，也不能压成只剩一个故障节点。
- LexicalOS 是独立供给工具；只读查询不制造 learner state。
- Home 负责入口与 Resume，不重复每个工作区内部的教学、Evidence 或进度面板。

English全family回执须覆盖Home/Resume、E01–E06、所有Part B forms、Writing Small/Big与Direct/Plan、Lexical return；部分截图通过不等于全族完成。

---

# 7｜Politics：执行要求与文字框

读：`content/politics/CURRENT.md` → `POLITICS_PRODUCT_STATUS.md` → `POLITICS_UI_REVIEW_PROTOCOL.md` → Learning/Interaction contracts → 下列详细设计 → Projection manifest/exact chapter → 仅其选择的Current refs → touched Runtime/Evidence/Repair/Return。

### Politics status boundary｜Learning closed, post-closure parity open

不要把活动 UI PR 解释成 Politics 学习系统未收口：

```text
Politics five-subject Learning engineering   S/K/L/P/R/E CLOSED
Politics real learner U                      ELIGIBLE / UNTESTED
Politics Product / UI                        downstream implementation / acceptance
Legacy useful-function parity                post-closure migration
└─ Xiao1000 Workbench                        #117 / its successor
```

#117 及其后继只负责恢复/对齐仍有价值的 learner-facing Workbench capability；它们**不重新打开 Politics Learning / Projection，也不阻塞 Kian 开始真实政治学习**。

题后 learner-explanation 内容 promotion 已由 **PR #124** 合并进入 Current。Issue #115 的旧开放元数据不得继续当作内容 blocker；执行读取 latest main 的 promoted derived asset / manifest / promotion receipt，再完成 Workbench exact-ID consumer、浏览器和 Mac acceptance。

编写时53章/160 NU、151 PASS/9 REFERENCE_ONLY是既有资产基线，执行再核实，不硬编码计数。160 owner不是160独立课程页面。不得从raw chapter重猜五科认知几何。

## P01｜Politics Home

来源：`POLITICS_PRODUCT_BRIEF.md` → Politics Home / Mac-wide direction；DESIGN_VERBATIM。

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Politics                                                                     │
│                                                                              │
│ Continue                                                                     │
│ <subject · chapter · Natural Unit / meaningful next action>                  │
│                                                           Continue →         │
│                                                                              │
│ Today                                                                        │
│ <quiet when no repair; Wrong / Uncertain + Chat action only when useful>     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 马原            史纲             毛中特           习思想          思修法基     │
│ 关系·推理·机制   阶段·转折·因果    问题·回答·定位    层级·身份·边界   概念·规范·情境│
│ 进入 →           进入 →            进入 →           进入 →          进入 →      │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

Today只有真实问题才占空间；不原样复制示意空白，不展示53章/160NU工程计数、全部章节大卡、source健康或假进度。

## P02｜Natural Unit与External Learn：同一工作区

来源：`POLITICS_HISTORY_C01_DESIGN.md` → Main Workspace / Core geometry、Return / optional close；DESIGN_VERBATIM。

```text
Chapter / Natural Unit location
→ compact chapter historical line / attention rule
→ current Natural Unit cognitive stage
→ current takeaway / next bridge
→ Chengfeng reading questions / current action
```

```text
学完了？

脑中过一遍：
<one or two Current-derived closure questions>

[直接做本 Unit 肖1000 →]
```

只让一个NU拥有主舞台，其他NU自由可达；不整章堆成长文。ORIENT/EXTERNAL_LEARN不变两页；去iPad学乘风后Mac关系图保持位置，回来不强迫新Recall页、“我学完”确认或闭合评分。这里“学完了？”是可读的轻提示，不是必点button gate。原文约22–25%问题、50–55%结构、22–25%takeaway是可调整比例，不是永久三栏。

## P03｜马原C00-S01：分支汇合，不是平铺卡片

来源：`POLITICS_MARXISM_DESIGN.md` → C00-S01；DESIGN_VERBATIM。

```text
current problem
│
├─ largest relation map
│  social root ─────────────┐
│  class/practice basis ────┼→ theory creation → theoretical system → continued development
│  thought source ──────────┘
│
├─ directly visible reasoning deepening when needed
│  worker struggle → independent political force → theory need → class/practice basis
│
└─ directly visible decisive boundaries
   social root ≠ class/practice basis
   theoretical development ≠ abandoning basic position
```

保留节点与边的意义；必要推理深化/边界默认可见。PRECISION_NOT_ORIENTATION仍后置，不为填满屏幕把年份著作抬成主舞台。

## P04｜马原C00-S02：双Map与边界同时可见

来源：同文件 → C00-S02；DESIGN_VERBATIM。

```text
Map A — basic characteristics
people-oriented + practical + developmental → revolutionary
scientific → scientific basis of revolutionary
scientific + revolutionary → unity

Map B — contemporary value
                     ┌ recognition tool / understand contemporary world
contemporary value ──┼ action guide / guide contemporary China
                     └ scientific truth / human social progress
```

```text
from practice → back to practice → tested in practice → develops with practice
```

```text
people-orientation ≠ denying class character
scientificity ≠ opposition to revolutionary character
action guide ≠ ready-made concrete plan / road / model
```

Map A/B在合适Mac视口并排，而不是Map tabs。Actual learner labels及说明从Current精确resolve，不能把四个基本特征与革命性排成五个同级特征；不能把当代价值的分支画成时间链。FIRST_ROUND_EXACT附着对应节点，不是独立卡片墙。本段是已有设计约束，不把后来的截图评论另立为新知识结论。

## P05｜马原C02：综合关系模型

来源：同文件 → dialectics generalization；DESIGN_VERBATIM。

```text
联系中的事物
→ 发生发展
→ 内部矛盾提供动力
→ 量变 / 质变解释跃迁
→ 否定之否定解释发展形式
```

```text
联系普遍 ≠ 联系任意
变化 ≠ 发展
矛盾普遍 ≠ 所有具体问题用同一办法处理
主要矛盾 ≠ 矛盾主要方面
辩证否定 ≠ 简单抛弃
```

保留不同概念的职责，不变六张等权定义卡；embedded细矛盾NU作为真正不同认知对象可切换。

## P06｜史纲：横向因果、评价与并行机制

来源：`POLITICS_HISTORY_C01_DESIGN.md` → Width-use / C06 generalization；DESIGN_VERBATIM。

```text
                ┌ political control
military breach ├ economic extraction → deeper semi-colonial control
                └ cultural penetration
```

```text
what it achieved | what it did not achieve | why it could not
```

```text
C06-S04
parallel mechanisms
→ shared long-war / organizational capability
→ turning point
+ explicit boundary

C06-S05
cause layers | historical gains | postwar turning point
```

```text
全面抗战路线
持久战判断
敌后战场 / 根据地
统一战线中的团结 + 独立自主
群众工作 / 根据地建设 / 党的建设
            ↓
共同形成长期抗战能力
```

几种结构是不同Current对象的示例，不强造每NU都有。并行机制不能变成机制1→2→3；阶段线/评价/转折各保留意义。C01能较短，C06可局部滚动，不以一屏为语义删减目标。

## P07｜毛中特：角色矩阵、道路与法宝、共同问题的并行回答

来源：`POLITICS_MAO_DESIGN.md` → C02 / C04；DESIGN_VERBATIM。

```text
对象 | 动力 | 领导 | 性质 | 前途
```

```text
政治纲领 | 经济纲领 | 文化纲领
```

```text
道路：农村积累力量 → 包围城市 → 武装夺取政权

支撑这条革命实践：
统一战线   武装斗争   党的建设
扩大同盟   斗争形式   保证领导/方向
```

```text
共同问题：社会主义制度建立后，中国自己的建设道路怎样走？

《论十大关系》      社会主义社会矛盾理论      人民内部矛盾处理      中国工业化道路
统筹建设关系        为什么仍有矛盾             不同性质不能混        如何落到中国条件
       \                    |                       |                    /
        \___________________|_______________________|___________________/
                              ↓
                  独立探索中国社会主义建设道路
```

不得把道路与三法宝变四个同级卡，不把四个回答假串时序。保留源段落的性质/领导/前途、过渡形式、矛盾性质等边界；框省略了完整说明，不授权删掉。

## P08｜习思想：身份rail与当前对象，不摊开所有清单

来源：`POLITICS_XI_DESIGN.md` → C02 / K05-K06；DESIGN_VERBATIM。

```text
最终目标        目标表达        现实道路        道路是什么        根本上必须什么       推进时怎样把握       长期怎样平衡
民族复兴   →   中国梦   →   中国式现代化   →   中国特色   →   本质要求   →   重大原则   →   重大关系
```

```text
中国式现代化

┌──────────────────────────────┬──────────────────────────────┐
│ 中国特色                     │ 本质要求                     │
│ 回答：这条道路是什么样       │ 回答：这条道路根本上必须什么 │
│                              │                              │
│ <Current owning list>        │ <current role summary>       │
│                              │                              │
│ 不是：本质要求               │ 不是：外观特征 / 操作原则    │
└──────────────────────────────┴──────────────────────────────┘
```

rail是身份/定位，不自动代表严格因果。当前list完整、可读；邻近对象保持角色/比较上下文，不把5/9/5/6等所有后台清单同时摊开。切到下一真实对象可以交换主次，不用隐藏当前必要信息换简洁。

## P09｜思修法基：概念/边界/场景及法治层级

来源：`POLITICS_ETHICS_LAW_DESIGN.md` → C05 / C06；DESIGN_VERBATIM。

```text
公共生活 | 职业生活 | 家庭生活 | 个人修养
责任对象 | 责任对象 | 责任对象 | 自我稳定德性
```

```text
根本遵循 / 行动指南  习近平法治思想
前进方向             中国特色社会主义法治道路
总抓手               中国特色社会主义法治体系
宏伟目标             法治中国
工作格局             科学立法 / 严格执法 / 公正司法 / 全民守法
```

```text
共同推进：依法治国 / 依法执政 / 依法行政
一体建设：法治国家 / 法治政府 / 法治社会
```

```text
法律至上 | 权力制约 | 公平正义 | 权利保障 | 程序正当
```

保留同一对象的概念、最近边界、应用关系，不能拆成反复点击的孤立卡。核心≠原则、两组法治结构等按原owner呈现，不猜补source缺口。

## P10｜肖1000 clean attempt — execution synthesis

来源：`POLITICS_PRODUCT_BRIEF.md` → Xiao1000 / Clean attempt 的 accepted behavior；`EXECUTION_SYNTHESIS`。历史完整 ASCII 题面框未恢复，但行为职责充分，因此不再是 implementation gap。

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Xiao1000 · <scope / progress>     Normal / Fast      ☆ Favorite  △ Uncertain │
│                                                     ◇ Mark for discussion    │
├──────────────────────────────────────────────────────────────────────────────┤
│ <verified question meta>                                      [查看原题图]*   │
│                                                                              │
│ <full-width stem; natural readable line length>                              │
│                                                                              │
│ A  <option>                              B  <option>                         │
│                                                                              │
│ C  <option>                              D  <option>                         │
│                                                                              │
│ <timer / quiet input hint>                                      Submit / →   │
└──────────────────────────────────────────────────────────────────────────────┘
```

实施约束：

- 2×2只在选项长度允许时使用；长选项自然换行/重排，不为了“像框”挤字。
- clean attempt 绝不出现 correctness、formal answer、takeaway、chat_explanation、Xiao原解析或固定知识复盘栏。
- 选中态只表示 learner selection，不暗示正确。
- Normal/Fast、单/多选提交、Favorite、Uncertain、discussion mark、计时/改答轨迹与可选原题图按 Current Runtime 真能力实现；缺 capability 明示，不伪造。
- 如已有 compact question/session navigator，可保留在不压窄主题面、不泄结果的前提下；本框不授权新增固定左右知识分区。

## P11｜肖1000 submitted result：保留原左右信息架构

来源：同文件 → Submitted result；DESIGN_VERBATIM。

```text
left summary/evidence pane
→ correct/wrong result
→ 一句话带走
→ learner answer vs formal answer
→ missing/extra choice detail when relevant
→ optional learner cause mark
→ learner note

right knowledge-review pane
→ 理解这道题
→ 对应来源 / source text
→ 肖1000原解析 or bounded supplemental reference
→ 下一题 / 返回当前 Unit / 返回原入口
```

原文约32/68是Mac参考比例，不要求固定空左栏。不额外增加“结构 / 易混 / diagnosis”必经块，不给每道题塞一张认知图。

**Kian本对话最后明确的内容身份必须落实到字段：**

```text
takeaway          → 一句话带走 / 一句话解析
chat_explanation  → AI 精炼解析 / 理解这道题
xiao_reference    → 独立的肖1000原解析 / 有明确来源的补充解析
```

这三层现在都必须按 Current 身份消费，不能再把“待迁移”当默认状态：

- PR #124 已把经身份验证的 1148-record learner-facing explanation layer promotion 到 Current derived asset；
- 当前 Question Truth 仍由 `content/politics/source/xiao_2027_questions.jsonl` 独占；promoted payload 不拥有 stem/options/canonical answer；
- consumer 按 exact stable question ID 绑定；missing/unbound/stale 时 fail closed；
- 不把 OCR explanation 切第一句当 takeaway，不重新生成一套“AI解析”，不回退 Legacy runtime；
- implementation 必须核对 promoted manifest / promotion receipt 的当前路径与版本，不把 Issue #115 仍为 open 的元数据当 blocker。

当前 UI 剩余工作是 consumer wiring、clean/submitted answer-gating、浏览器/截图与 Mac acceptance；不是重新做 1148 题政治语义审核。

### 政治推进与验收

先consumer/shell与五语法代表压力测试，再Home/handoff/Workbench/repair-return，按既有代表验收同PR修正后扩展全53章。样稿不是全科交付。first attempt immutable、event-local repair provenance、保存失败fail closed、exact return不变；真人U不从工程PASS产生。

---

# 8｜Xizong：执行要求与文字框

读：`content/xizong/CURRENT.md` → `XIZONG_PRODUCT_STATUS.md` → Product Brief/UI review protocol → 以下四份surface design → Learning Contract → Projection contract/manifest/freeze receipt → 对应System Current/Acceptance与被绑定owners、实际Runtime/Evidence。

已知v1范围A1/A2/A3、3System+38Block=41assets、805KP、396bindings、86mutation/control是历史基线，执行重新核实；7rich和31baseline都复用，不由标签证明够用或要求重做。B–F不自动扩入。后续二轮/串联/真题内容可演化，不提前制造不存在的二轮知识。

## X01｜Xizong Home

来源：`XIZONG_HOME_DESIGN.md` → Mac-wide composition；DESIGN_VERBATIM。

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Xizong                                                        学习 / 真题*   │
├──────────────────────────────────────────────────────────────────────────────┤
│ CONTINUE                                                                     │
│ A1 · 循环系统                                                                │
│ B7 · …                                                                       │
│ LG06 · …                          current learner stage / local progress      │
│                                                        继续 →                │
├──────────────────────────────────────┬───────────────────────────────────────┤
│ CURRENT SYSTEMS                      │ NEEDS ATTENTION                       │
│ A1 循环系统                          │ only when real evidence exists        │
│ A2 呼吸系统                          │ Memory / Marked / Chat repair etc.    │
│ A3 泌尿系统                          │                                       │
├──────────────────────────────────────┴───────────────────────────────────────┤
│ KNOWLEDGE MAP  A · B · C · D · E · F                                       │
└──────────────────────────────────────────────────────────────────────────────┘
```

Continue用真实local state，非工程count。Attention为空即撤区，Systems扩展；A–F是轻位置图，不是未就绪大课程卡。星号真题为产品方向，不能把未完成whole-paper runtime标已实现。

## X02｜System Guide：Canvas，不是目录或卡片墙

来源：`XIZONG_SYSTEM_GUIDE_DESIGN.md` → Mac-wide composition；DESIGN_VERBATIM。

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ System identity / mission / current selected Block                          │
├──────────────────────┬───────────────────────────────────────────────────────┤
│ BLOCK ROUTE          │ SYSTEM COGNITIVE CANVAS                               │
│ sticky               │ mother model / spine                                  │
│                      │ + parallel controls                                    │
│ B1                   │                                                       │
│ B2                   │ system language / variables / relations                │
│ B3                   │                                                       │
│ ...                  │ case coordinates / judgment axes                       │
│                      │                                                       │
│                      │ failure map / dependency or cross-Block objects         │
│                      │ only when Current supports them                         │
└──────────────────────┴───────────────────────────────────────────────────────┘
```

仅选中有用上下文时：

```text
Block Route | System Canvas | Context
```

完整Current cognition保留，母模型、变量/公式、判断坐标、Failure与cross-Block只有被拥有才呈现。Failure可原位突出明确绑定节点，不从A2猜出A1/A3对应关系。左BlockRoute自由选，选中后可直接进入；不把selected Block另复制成永久panel。System Recall是后续符合条件的动作，不抢初学入口。

## X03｜Block Workspace：共享空间，不强制同一种认知图

来源：`XIZONG_BLOCK_WORKSPACE_DESIGN.md` → Mac-wide workspace skeleton；DESIGN_VERBATIM。

```text
┌───────────────────────────────────────────────────────────────────────────────┐
│ Location / Block identity / thin learning-state line                         │
├──────────────────────┬───────────────────────────────────────┬────────────────┤
│ Logic Group Map      │ Primary Cognitive Stage               │ Context        │
│ persistent local map │ current Block/Logic/Recall object     │ conditional    │
├──────────────────────┴───────────────────────────────────────┴────────────────┤
│ current meaningful next action / MarginNote handoff / return                 │
└───────────────────────────────────────────────────────────────────────────────┘
```

右Context按需，无对象时中心扩展。完整Block Guide不藏到“需要时查看定位”。A1/A2/A3不同Visual/Precision/Connection与source-local support不为统一丢失。不能因多对象想简化，把一个Block强压成一种shape。原讲义连续学习仍在iPad，完整web Guide/Core展示仍须保真。

## X04｜Logic Group orientation与一次返回

来源：同文件 → Logic Group orientation / MarginNote handoff；DESIGN_VERBATIM。

```text
Logic Group Map
│
├─ current Logic Group title
├─ goal: this group solves what problem
├─ closure target: what should be possible after learning
├─ KP coverage / range as return roadmap only
├─ relevant Current Visual cue / incoming connection when explicitly owned
└─ action: go to the original Lecture for continuous study
```

```text
current Logic Group
→ exact Current source locator or bounded continuous source range when available
→ KP return roadmap for this Logic Group
→ relevant source-local Visual task when Current owns one
→ one clear instruction: learn this whole Logic Group continuously in MarginNote
```

```text
this Logic Group's original Lecture contact is complete
→ start this Logic Group's KP Recall
```

返回roadmap默认可见；没有exact locator不猜。原图表/例子/讲义配套题留原讲义。这一次formal contact确认有证据意义，保留；不追加双确认。不要误套政治optional mental close把它删除，也不变成每KP来回读。

## X05｜KP Recall Front / Reveal

来源：同文件 → KP Recall；DESIGN_VERBATIM。

```text
A. Recall Front
   KP identity + neutral Active Prompt only
   → learner reconstructs from memory
   → Reveal

B. Recall Reveal
   Current KP title + complete canonical Core
   + relevant Current context only
   → 1 / 2 / 3 / 4 evidence
   → next unrecalled KP in the same Logic Group
```

```text
1 = 没记住
2 = 模糊
3 = 会了
4 = 稳定
```

Front全workspace保护：包括dock、breadcrumb、标题、图形、tooltip、a11y，不只是中间卡。Reveal后是完整canonical Core，不是AI摘要。先Reveal后rating，真实证据append保留；rating后同组下一未recallKP。不新增每KP入Memory/确认已读。Core长就好好排和滚动。

## X06｜Logic Group Closure与Block Recall

来源：同文件 → Logic Group Closure / Block Recall；DESIGN_VERBATIM。

```text
KP Recall complete
→ return to the Logic Group problem
→ confirm the group now closes around its Current closure target
→ expose timing-appropriate Precision / outgoing Connection / Reserve when Current owns them
→ continue the mainline
```

```text
centerQuestion
+ recallSpine
+ Logic Group closure targets
+ Current-supported compressed cognitive geometry for this Block
```

第二块只适用于Block Recall **Reveal**。Front仅centerQuestion及合法高层LogicGroup骨架，不显示recallSpine/closure正文/KP答案。组closure不再逐KP考试、不额外评分；局部回跳不清原证据、不重开整Block。Block Recall完成≠Block完成；completion的formal contact/KP recall/Block recall条件不偷合并。

## X07｜After Learn：Memory / Reserve / Chat Repair分开

来源：同文件 → After Learn；DESIGN_VERBATIM。

```text
After Learn
├─ Memory      — unstable formally learned items, if any
├─ Reserve     — future reactivation relations, if any
├─ Chat Repair — explicit imported / chosen specialist tasks, if any
└─ Return      — continue to the owning System
```

不在每次弱rating后自动弹完整After Learn；正式学过且不稳的Memory、未来重激活Reserve、明确Chat任务分别守准入。空类别消失，weak evidence不自动阻塞第一轮主线。

## X08｜Question Sweep：稳定Mac题面

来源：`XIZONG_SYSTEM_COMPLETION_DESIGN.md` → Mac-wide visual responsibilities；DESIGN_VERBATIM。

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ System · Questions   progress   Fast Sweep   Result visibility   review state│
├───────────────────┬──────────────────────────────────────────────────────────┤
│ Question Map      │ Current Question                                         │
│ compact state map │ question meta + fixed Mark control                       │
│ current / done /  │ stem                                                     │
│ wrong / marked    │ options                                                  │
│ or answered/mark  │ stable answer zone                                       │
└───────────────────┴──────────────────────────────────────────────────────────┘
```

题面位置、标记、焦点稳定，无巨大空成功页。Question Map在Hidden只显示current/answered/unanswered/marked，不泄wrong、分数或正确率。Quick Review可按需出现，不把整题挤走。

## X09｜Normal / Fast 与Mark最终交互

来源：同文件 → Keyboard grammar / Correct path / Quick Review；DESIGN_VERBATIM。

```text
1–5   select A–E
Enter submit / continue
M     mark / unmark
← →   previous / next question
```

```text
1–5 = choose + submit immediately
```

```text
1–5 = toggle options
Enter = submit
```

后两块分别是Fast单选与多选安全分支。只有实际存在的选项才有效，不从示意推所有题均5选项。Immediate下正确unmarked或marked都可自动下一题，标记保留、不追加“稳/不确定”确认；Wrong停留最小Quick Review。

```text
Enter  continue to next question
Space  expand / collapse deeper Current explanation
M      mark / unmark for later concentrated review
```

M可在选前、选后、看结果后、返回旧题时使用。Marked不是UNCERTAIN，不直接改旧Evidence含义。Wrong保留证据但不强迫深修/Chat；没有reviewed relation就question-scoped repair。

## X10｜Hidden / whole paper：与快刷正交

来源：同文件 → Result visibility；DESIGN_VERBATIM。

```text
whole paper + Hidden results + Fast Sweep
→ single-choice: 1–5 records answer and moves on
→ multi-select: 1–5 toggles; Enter records and moves on
→ no correctness feedback during the run
```

```text
结果：隐藏 / 即时
```

whole paper默认Hidden，用户可主动选择看不看。Hidden不得通过错题停/对题跳、颜色、排序、计数、筛选、声音或a11y间接泄漏；所有已记录答案有同样可观察推进规则。没有用户明确reveal，不自作主张揭示分数/解析；一次主动reveal也不能假装本卷仍是未暴露的fresh模拟。

源文明确：System sweep/holdout存在不等于whole-paper runtime已完成。整卷入口、multi-attempt、reveal metadata等若缺Runtime/Evidence支持，报告最小依赖，不能CSS遮住结果就宣称全实现，也不能悄悄删掉已经确认的整卷产品方向。

## X11｜System Recall：独立保护的重建桌面

来源：同文件 → System Recall / Recall Front；DESIGN_VERBATIM。

```text
┌───────────────────────┬──────────────────────────────────────────────────────┐
│ RECONSTRUCTION        │ System neutral recall prompt                         │
│                       │                                                      │
│ 系统主链              │ learner reconstruction / scratch area               │
│ 并行控制              │ optional, not mandatory to fill                     │
│ Failure 定位          │                                                      │
│ 病例判断顺序          │                                  Space → 核对模型    │
└───────────────────────┴──────────────────────────────────────────────────────┘
```

左侧只是要重建的维度，不是答案脚手架；不半透明盖在答案Guide上。scratch可选，允许脑内/口述/纸笔，不用输入字数当门槛。Reveal后复用同一System的Current compressed model、明确拥有的Failure/axes/algorithm，不从A1编A2/A3。

```text
Space = reveal / hide System model
C     = focus optional scratch area
Enter = after Reveal, complete this System Recall phase
```

PRE/POST/MID Evidence phase保留；工程就绪不代表Kian该立即做SystemRecall。真实所有Blocks完成条件仍有效。

---

# 9｜测试、截图与source-to-view验收

读取执行时actual package.json、scripts、workflows；使用真实命令/日志与candidate SHA，不猜npm script，不在无lockfile时盲用npm ci。旧86/86、53章等只作基线，不写成本次结果。

## 必测矩阵

1. **覆盖和精确绑定**：当前scope所有route/owner有accounting；manifest/shards/ID、optional/null/REFERENCE_ONLY、missing/stale/unsupported依原contract处理。没有就是明确缺席，不能raw推断fallback。
2. **文字框落实**：frame ID→实际DOM/截图；完整题组不是隐藏在DOM就算，必要关系不只存在JSON里。`EXECUTION_SYNTHESIS` 验收 accepted behavior / 空间职责，不冒充历史原框。框外已有重要能力也要保留。
3. **内容保真**：受保护source前后hash/diff、限定/否定/例外/固定表述、并行vs顺序、题目/首稿/首答不丢。不得把原文做全量重复拷贝来凑完整。
4. **最小充分交互攻击**：对新增持久 panel/step/gate/checkpoint/confirmation 做 deletion/merge challenge；若去掉后学习价值与Evidence不下降，不得成为 mandatory learner action。稳定正确路径不得因系统能力丰富而变重。
5. **R10压力**：隔离fixture/in-memory测试长标题/长解释、更多合法对象、optional缺席、真实不同geometry；不改production知识制造测试；普通变动不需named-topic分支，按真实依赖粒度局部失效。
6. **正常路径**：选择/提交/下一项、自由回退、空任务、无题NU、有效退出；正确快走且保存可靠。
7. **异常路径**：Wrong/Uncertain/Marked、重复提交、刷新/back-forward、storage失败、stale/坏local state；不覆盖first attempt，不制造已保存。
8. **保护态**：clean/Recall Front/Hidden在正常DOM、焦点、屏幕阅读语义、侧栏、排序/计数/跳题差异均不泄答案。资产静态校验不能替浏览器。
9. **Repair/Return/Resume**：source/Chat/FirstLearning/Lexical后exact return，滚动/焦点/任务保留；PASS/dormant pending不制造债或错误Resume。
10. **输入与视觉**：§4/§5的viewport/125%/IME/快捷键/reduced-motion；全页不意外横溢出，宽矩阵允许有说明的局部滚动，控件不跑屏外。
11. **跨科与build**：shared改动回归其他科代表surface，domain QA与Astro build实际执行；不以某一科绿灯外推全部三科。

政治复用Projection anti-drift validator及五科适用R/E journeys；英语复用Objective/Translation/Writing guards/journeys；西综复用当前validate_projection.py/test_projection.py及companion acceptance。新增检测行为配negative+positive tests，不删失败mutation或弱化断言。保护true-exam/holdout；用准入工程素材或明确synthetic fixtures。

既有失败在同环境比较基线/候选，分清回归、旧缺陷、工具失败。真实阻碍当前完整闭环的缺陷不能因“以前也红”免验；无关失败也不绑架整个Program。

## 截图交付不是宣传图

每个已实施surface family交正常态、问题/回看态、长内容压力态、窄窗fallback；保护态有自己的截图/行为证据。旧面可用则同route/state/viewport before-after。长Guide补滚动后/full-page，不能裁掉溢出后交图。

标注commit、route、object/state、viewport/DPR、OS/browser/version、实际字体、fixture身份、复现命令和可打开artifact/preview。真实learner数据、cookies、tokens、私人草稿不进公有证据包。AI图/ASCII/样张不是production截图，SELF不是independent。

---

# 10｜交付、阻塞和最终收口

沿同一bounded PR修正审查意见，不新开PR绕开。落库前读最新main，只有authority变化/重叠write-set才重读相关部分；不得force main、覆盖并行提交或用旧全文件替新owner。reconcile后重跑受影响检查；测试后代码变了要说明新的证据覆盖。

回执放当前任务现有位置；无则一个 `static-web/reports/ui/<subject>-<slice-or-pr>.md`，不每章新状态文件。维护：

`surface/frame → implemented+tested / unchanged+verified / blocked(reason) / out-of-scope → source ref → candidate SHA → tests/screenshots → acceptance pending`。

**缺素材、缺runtime compatibility、缺真人选择与“历史原ASCII未恢复”是不同事情。** accepted behavior 已足够且有 `EXECUTION_SYNTHESIS` 时，历史原框未恢复本身不再阻塞施工；真实素材/Runtime缺口仍只挡实际依赖。不得猜补、不无期限考古、不以“安全缺省”伪报完成。

Codex交付可审查PR需：授权surface有完整accounting，实际代码已提交，受保护路径/语义diff清楚，测试与截图可复现，真实阻塞明示。不得自行merge、关闭#113、标U为PASS或替Kian接受审美。

`SUBJECT_CLOSED_FOR_HOME`还需独立审核、必要用户接受、经授权merge、main读回、并行提交保留和分支退役。仅样例/局部合并要标局部，不作全科声明。zero-semantic-diff约束领域事实、学习与证据含义，不要求DOM/CSS字节不变。

三科当前授权范围真正收口后，才做GlobalHome最终整合；此前保留既有入口/返回可用。GlobalHome消费稳定的subject entry/Continue/必要Attention，不造新调度器、不把三科模板统一、不把Lexical变第四门考试。UI完成与真实学习U继续区分。

---

# 11｜本轮提示词纠偏与历史原框边界

| 旧提示词/总结容易造成的误读 | v2.1处理 |
| --- | --- |
| “仓库Status最新，所以一定比用户之前决定更正确” | §0规定本对话最后明确决定优先；Status不能制造产品接受。 |
| 再定位三个其他Chat | 三科同一对话；不再编造线程定位。 |
| 提示词有Mac/测试规则就足够 | 内嵌E/P/X具体原文字框及行为；实施必须frame-to-view对账。 |
| ASCII三个框＝三张大卡片 | §2明确为空间职责、非装饰边框与固定留白。 |
| 内容只读＝表达资产永久不可改 | §3允许已确认要求的有界纯呈现候选，语义变更另交owner。 |
| capability存在＝learner必须操作一次 | §0.4升为最小充分交互硬规则；No mandatory ritual。 |
| 原ASCII没恢复＝该surface不能施工 | E07/P10提供明确标注的`EXECUTION_SYNTHESIS`；历史身份与施工充分性分开。 |
| Politics有活动PR＝Politics学习工程未收口 | §7明确S/K/L/P/R/E已闭合；#117是post-closure parity。 |
| Politics题库已搬＝一句话/AI解析已搬 | PR #124已独立完成learner-explanation Current promotion；P11按exact-ID消费，仍禁止OCR冒充。 |
| Issue #115仍open＝内容promotion仍blocked | 以latest main + PR #124 / promotion receipt为准；旧Issue元数据不能覆盖落地主线。 |
| 缺失可安全省略＝已保留功能、可以收工 | 安全缺省与产品闭合分开，真实关键素材/Runtime缺口仍明确blocked。 |
| 所有科都用fast下一题/相同close门槛 | 按E/P/X原有认知与证据分工，不抹平差异。 |
| 产品已定＝视觉token、whole-paper runtime也全部完成 | 记录真实待验/兼容边界，不重开设计也不虚报实现。 |

历史逐字恢复仍有边界：E07 English Home 与 P10 clean attempt 的**历史最终 ASCII**没有从损坏的对话导出中完整取回；v2.1 不伪造这个事实。但 accepted product behavior 已足够，所以本文件给出标注为 `EXECUTION_SYNTHESIS` 的施工框，今后不再把“缺历史原框”当作 UI implementation blocker。其他 `DESIGN_VERBATIM` 只声明与详细设计 owner 摘录一致，不宣称已找到每一次用户确认的原始消息。

本文件没有改变知识内容/学习证据，也没有启动Codex、完成UI迁移、运行本轮UI测试或取得Kian视觉接受。

## 启动短指令

```text
执行 kianwang022-hash/kianos 的 Issue #113 当前实施项。
读取最新 main 的 static-web/CURRENT.md 与
static-web/CODEX_THREE_SUBJECT_IMPLEMENTATION.md（v2.1或其后继）。
按当前科目读取内嵌E/P/X文字框及对应详细设计/Current资产。
本对话Kian最后明确决定优先于旧提示词/状态总结；不重开已定产品。
遵守 Minimum-sufficient learner action / No mandatory ritual；backend richness 不自动变 learner burden。
复用活动PR；没有当前实施项时按#113最新调度。
Politics Learning 已闭合；#117/后继是 post-closure parity，不阻塞真实学习。
Politics题后learner-explanation 已由PR #124 promotion到Current；按exact-ID消费，不能OCR冒充takeaway/AI精炼解析，也不能因#115旧open状态重复迁移。
遵守Mac/Dense Calm、完整内容、保护态、真实测试/截图与exact return。
E07/P10使用标注的EXECUTION_SYNTHESIS施工，不声称是历史原ASCII。
有界实际施工并提交可独立审查PR；真实缺口逐项说明，不自行merge。
```
