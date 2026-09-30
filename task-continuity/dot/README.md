# dot 考研系统任务接续

更新日期：2026-09-30
用途：用户明确要求的任务接续记录，防止跨对话后丢失目标、重复工作或误读进度。这里只保存可公开的工程任务事实，不保存私人学习记录、对话原文或凭据。

## 用户确定的总目标和顺序

1. 先完成西综：完整理解已有全流程设定，理顺内容组织、字段标签、历史别名及映射，补齐网站在正确位置和时机应有的投影，保留有效知识资产与学习连续性。
2. 再验证整个考研系统的闭环：真实学习 → 原生记录 → Chat解释与复盘 → 必要的安排调整 → 网页执行 → 继续学习与反馈。
3. 现有全部设定以GitHub原负责文件为依据。不得把理解遗漏当成没有设定，也不得用新规则替代已有设计。
4. “文件存在、代码提交、测试通过”分别只是证据；完成必须对应实际学习与内容修改效果。

## 最终交付范围补充（2026-09-30 10:42 UTC）

用户明确纠正：最终目标是“完整的系统”，不仅是完整西综。推进顺序为：先修好西综并接入考研系统，使学习、安排、复盘、记录与继续学习真实闭环；后续由用户启动整个GitHub的全量审查，逐板块核对内容、代码、设定与实际功能，修复问题，清理确认无关且无保留价值的文件资产。

最终使用标准：入口清楚、规则一致；用户提出需求后能迅速准确找到现有设定、当前进度及负责文件；修改低摩擦、网页正确呈现、交互方便、学习连续。测试通过或文件整理完成不能单独替代真实功能验收。

本次是总目标与范围的澄清，未执行全仓审查、资产删除或产品改写。全仓审查属于后续阶段；不能提前扩张当前任务，也不能把合法历史、Source差异或暂未消费的有效知识资产视为垃圾。

## 已确认的顶层原则（2026-09-30 10:34 UTC）

用户已确认以下六条理解；这是对现有原负责文件的接续摘要，不建立第二套产品合同：

1. 可靠Source转成高质量、可理解、可回忆、可应用的Knowledge；网页承接学习，Chat修改正确负责文件，页面效果可验证，已有学习不丢
2. Source管来源；Knowledge/Content管知识与教学内容；Learning管学习方式；Visual管展示；Runtime管交互、记录、流转；下游不得猜知识或另造规则
3. 正式层级只有System→Block→LG→KP；同一知识只有一个负责位置。系统真实Source/学习差异保留，共享网页与执行机制
4. 建模→原讲义→主动回忆→整合→做题→最小Repair→原位Return→后续验证。连续原讲义学习仍由iPad/MarginNote承担，网页负责伴学、回忆、题目、记录
5. 已正式采用的资产完整消费，同时遵守时机；Prompt负责提取，Core保持完整，支持不按标签数量强行对称
6. Content revision与Learner history分开；非语义修改不重置，医学语义变化局部复验，历史、个人记录与Resume保留；旧章节措辞不能推翻现行规则

原权威： [学习合同](../../content/xizong/LEARNING_CONTRACT.md)、[学习策略](../../content/xizong/knowledge/learner/study-policy.json)、[内容组合](../../content/xizong/LEARNER_OBJECT_CONTRACT.md)、[页面职责](../../static-web/XIZONG_BLOCK_WORKSPACE_DESIGN.md)、[权威继承](../../AUTHORITY_INHERITANCE_CONTRACT.md)。

本轮关键规则核对完成（10:38 UTC）：Memory旧Phase-1 no-interval描述、Learning §13入口歧义、KP对象与POST_REVEAL、Core重构与正式support adoption四项中，未发现需用户重新选择的实质冲突。Memory依当前study-policy选择性retention；真实LEARN依AGENTS先读native evidence/Resume；非答案Context可保留但explicit answer-bearing仍受保护；Core重构与formal adoption严格分工。

原规则文档仍有两处可消歧的文字：static-web/XIZONG_MEMORY_PRODUCT.md §3的旧Phase-1描述；content/xizong/LEARNING_CONTRACT.md §13的intent条件。本轮只记录，没有修改这些原文件。全量正文和产品实现继续暂停；不得因顶层原则确认而自动恢复。

## 恢复入口

- 先读当前 main 的 AGENTS.md，再读 content/xizong/CURRENT.md 与 [西综主任务 #1113](https://github.com/kianwang022-hash/kianos/issues/1113)
- 整个考研运行闭环参考 [#1111](https://github.com/kianwang022-hash/kianos/issues/1111)，第二阶段开始时重新读取，不根据本文猜测其最新状态
- 本文件不是第二套产品规则、Current或Acceptance；任务的精确Phase、Next、Blocker继续由原Issue维护
- 任何下列版本观察都只是接续检查点，恢复时须核对新提交和受影响的真实依赖

## 分批理解记录

[西综整体理解、阅读覆盖与具体冲突](XIZONG_UNDERSTANDING.md) 持续更新；入口只保留任务目标和接续路径，不复制整套医学正文。

## 设计理解应覆盖的全流程

Source可信边界 → Knowledge重构与canonical Content → System／Block／Logic Group／KP及各系统真实学习差异 → 原讲义与网页配合 → Learn／Recall／closure → Memory／题目／Repair → private Evidence／Packet → Chat与Return／Resume。

贯穿核对：Visual布局、MedicalVisual医学支持、Runtime交互与状态流动、内容版本、个人覆盖、笔记标记、计时、历史记录。知识资产完整存在不等于页面已消费；历史任务通过不等于当前场景通过。

原负责文件：
- LEARNING_ASSET_STANDARD.md
- content/xizong/LEARNING_CONTRACT.md
- content/xizong/knowledge/learner/study-policy.json 与 exact System Learning／Content owners
- content/xizong/LEARNER_OBJECT_CONTRACT.md
- content/xizong/projection/PROJECTION_CONTRACT.md
- static-web/XIZONG_BLOCK_WORKSPACE_DESIGN.md
- exact Runtime、Evidence、Acceptance owners

## 本轮重点

内容组织混乱和下游缺少投影要一起处理。先辨明字段／标签含义、归属、同义写法及重复解释，再沿原资产 → 解析对象 → 页面输入 → 实际学习阶段显示逐项定位缺口。不能只优化Prompt或修孤立按钮。

保留所有合法内容与已接受流程，不机械统一医学内容或不同系统的Source模式，不强制为每个KP添加边界／串联。不另建知识副本、Runtime、存储或CSS补丁层。内容编辑与学习历史保持分离；不能靠绕过版本保护获得通过。

## 已核对的接续检查点

截至2026-09-30 10:08 UTC的最后GitHub观察：
- main为798ab2d00e460c24e28b701e1e32a3459f15f035；该变更包括任务入口一致性、Source-explicit规则归位、Steward反馈消费等，不是西综版本Runtime完成证明
- #1113记录：主提示漏读修复、共享Learning-group解释、Block／LG／KP检查视图已完成限定切口；全页面投影和全流程验收未因此完成
- 现存A1候选 candidate/a1-content-review-07724cfe 为cebac4439710b7c5c97e0d187a035abbdc972b98；24项局部修正，未合入main，不等于312KP全量Prompt升级
- d213b58已将保留进度／选择性重验证决定写入study-policy；截至所读#1113，旧Runtime的sourceHash与整Block重开耦合仍待实现和回归
- 对原工作目录未提交改动尚无直接核验，不能说一定存在，也不能当作不存在后覆盖
- 没有执行产品代码改写、合并或正式部署；本次写入仅建立用户请求的接续记录

## 当前工作与下一步

当前（2026-09-30 10:32 UTC）：用户明确收窄为“先把现有规则定稳确定一套，再说其他”。剩余医学正文全量阅读、支持目录扩读和产品实现均暂停。已读内容保留为参考，不能以沉没阅读成本继续扩大任务。下一交付是简短的现有规则理解：目标、权威顺序、各层职责、学习全流程、修订与学习历史保护，以及真正冲突/未决项；与用户对齐后才恢复后续工作。

防漂移方式：每批只保留目标、当前规则、精确内容入口、已确认问题、真实阅读覆盖与下一步；不复制整套医学正文形成第二知识源。用户提供的旧Chat总结是需求参考，不是当前完成证据。实际修改前必须重新读取当前负责文件及依赖，按当前规则核对历史执行文字；不能依赖长对话印象。

下一步：
1. 只读当前学习合同、学习策略、权威继承与相关页面职责，形成规则理解
2. 区分现有明确决定、合法系统特化、历史措辞冲突和真正未决；不重新发明规则
3. 与用户确认规则理解后，必要改动写回原负责文件；本目录仅保留指针和任务记录
4. 未获后续方向前，不恢复全量医学正文阅读、批量Prompt改写或产品实现

## 已交付报告索引

以下是基于fc15d131源码的审查检查点，修复前需对照当前代码。报告已另存给用户；此处不复制整份报告或建立第二份缺陷数据库。
- 西综生化Source学习段记录遗漏checkpoint白名单
- 西综Block个人标记未传入Memory释放；损坏Memory在部分写入路径被当作空库
- 英语运行链路七项：External刷新只读、Objective坏记录覆盖、复盘结束未接Session完成、SCORED门禁、Translation模板身份字段、首答后求助污染统计、study-day不一致
- 西综3043条已审定题目关系中961条在该基线因知识文件版本变化过期；不等于961道题错误。优先审查变更影响粒度，再恢复真正需要复核的关系，不能批量盲目换指纹

## 每次接续更新要求

只记录目标变化、实际完成、精确证据、未决与下一步。工作完成后在原任务写回并核对，本文保留简短指针。失败或未验证必须明示；不以旧Chat摘要代替最新GitHub状态，不把候选当已上线，不把合成测试当真实学习表现。
