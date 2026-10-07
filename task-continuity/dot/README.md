# dot 考研系统任务接续

用途：用户要求的工程接续索引，防止跨对话丢失目标、重复工作或误读进度。这里只保存可公开的工程指针，不保存私人学习记录、对话原文或凭据；不拥有第二套产品规则、Current 或 Acceptance。

## 当前从哪里接

1. 读当前 `AGENTS.md`，先识别用户是在学习、使用、修改还是查看工程状态。
2. **已有绑定任务时，直接恢复该 native Issue；不重新从跨项目目录挑任务。** 西综长期任务绑定 [#1113](https://github.com/kianwang022-hash/kianos/issues/1113)：先读其简明 Parent outcome / Current / Next / Blocker / acceptance，再跟随它指向的当前 PR 实际 head 和 exact owner。具体阶段、候选 ref、测试结果不复制到本索引。
3. **没有绑定任务，或 Kian 明确要求跨项目调度时**，才读 [任务栏 #60](https://github.com/kianwang022-hash/kian-personal-os/issues/60) → [Personal #61](https://github.com/kianwang022-hash/kian-personal-os/issues/61) 或其他已指明的原任务。#60/#61 保留组合、范围和授权职责；其旧阶段摘要不替代已绑定 native Issue 的当前游标。
4. 按实际需求进入原责任范围，不把所有请求都先送去西综工程游标：
   - 西综内容/映射/功能一致性：`content/xizong/CURRENT.md` → [#1113](https://github.com/kianwang022-hash/kianos/issues/1113) → 当前 PR/ref → exact owner
   - 三科运行闭环、跨科反馈及普通使用缺陷：[#1111](https://github.com/kianwang022-hash/kianos/issues/1111) → 当前具体缺陷/候选
   - 英语/词汇/政治的设计与内容：对应 domain `CURRENT.md`、manifest、Learning/Product owner
   - Lexical 当前执行与质量门：[Lexical Current](../../content/lexical/CURRENT.md) → [#1166](https://github.com/kianwang022-hash/kianos/issues/1166)；此路径只定位动态任务，不定义最高验收目的
   - 实际学习进度：native learner evidence/Packet/Resume；工程任务和内容存在不能代替个人进度
5. 仅读必要原文件与实际消费者；已有文件/证据版本未变时复用，不从旧任务摘要推测最新状态。接续、分批和上下文预算直接继承 [AGENTS](../../AGENTS.md) 与 [Project Management](../../PROJECT_MANAGEMENT_CONTRACT.md)，不在这里另立执行规程。

本次由 dot 保持上位目的、范围与验收；执行和独立复核按既有 [Project Management](../../PROJECT_MANAGEMENT_CONTRACT.md) 交给有限任务，结果回到原 owner 对照目的检查，不以执行者自报或工程通过代替内容验收。活动执行归属与当前阶段始终回读原 Current / Issue；保留其他 Chat 的并行工作，不把本索引当成接管或恢复执行的授权。

本索引不再保存“当前仍在 #61 第一阶段”等阶段快照。执行权限取原任务的最新明确授权及实际工具限制；本索引不授予本机、浏览器、合并、部署或真实学习记录权限，不绕过拒绝。旧阶段限制保留在其原日期证据中；有后续明确授权时回原 owner 核对，不能把旧快照自动当成永久限制，也不能把当前任务标签当成新增授权。没有活动执行或显式自动化，就不声称后台持续运行。

## 总目标与必须保留

目标是完整、低摩擦的系统：现有要求能找到正确 owner，修改能沿既有内容→对象→页面链被正确消费，进度与反馈各归原生负责位置。

- Source 管依据；Knowledge/Content 管知识与教学资产；Learning 管学习方式；Visual 管展示；Runtime 管操作、记录与流转。下游不得猜知识或另造语义 owner。
- 西综层级保持 System→Block→Logic Group→KP；稳定身份、学习顺序、成员关系与 Source 范围分别处理，保留不同系统的真实 Source/学习方式。
- 已采用资产按认知职责和时机消费。Prompt 是提取骨架；Core 保持完整；Boundary/Connection/Precision/MedicalVisual 按已有 owner 决定，不能强行对称或靠标点统一代替审查。
- Content revision 与 Learner history 分开。明确的非语义修改不制造重学；医学语义变化只限定受影响结论；历史、个人提示、笔记、标记与 Resume 不靠覆盖“修好”。
- 现行规则优先，缺理解不等于没有设定；合法历史、Source 差异及未消费的有效知识资产不当作垃圾删除。

语义细节直接读原权威，不复制到这里：
[学习合同 §0：固定模型与完整复习结果](../../content/xizong/LEARNING_CONTRACT.md#learning-outcome)、[学习策略](../../content/xizong/knowledge/learner/study-policy.json)、[内容组合](../../content/xizong/LEARNER_OBJECT_CONTRACT.md)、[页面职责](../../static-web/XIZONG_BLOCK_WORKSPACE_DESIGN.md)、[权威继承](../../AUTHORITY_INHERITANCE_CONTRACT.md)。

最高验收只固定各科稳定的完整目的、期望效果与达标判断，继续由下列原 owner 承担；不把当前任务、进度、批次、状态或执行回执纳入目的定义：

- 西综：[固定模型与学习结果](../../content/xizong/LEARNING_CONTRACT.md#learning-outcome) → [内容教学实现](../../content/xizong/knowledge/learner/LECTURE_REPLACEMENT_CONTRACT.md)。
- 政治：[学习目的、固定重建骨架与预备教学包（§0、§0.5、§3.1）](../../content/politics/LEARNING_CONTRACT.md) → [内容语义与教学实现（§3.1.1、§3.3）](../../content/politics/CONTENT_SEMANTICS_CONTRACT.md) → [实际教学包](../../content/politics/learning/manifest.json)。
- 两科继续按已确认分工消费这些 owner：GitHub 保存稳定知识与教学资产；Chat 围绕固定知识地图灵活教学；Website 通过共享科目模板承担 Recall / Memory、题目、状态与反馈。共同学习效果检查回到 [Learning Acceptance](../../LEARNING_ACCEPTANCE.md)，具体范围结论回到[西综 Acceptance](../../content/xizong/ACCEPTANCE.md) / [政治 Acceptance](../../content/politics/ACCEPTANCE.md)，不在这里复制标准。
- Lexical 的最高验收直接采用[板块目的：Learning §0](../../content/lexical/LEARNING_CONTRACT.md)与[内容目的、模块生成及整合验收：Content §0A、§4A、§14](../../content/lexical/CONTENT_ASSET_CONTRACT.md)。Lexical 是英语的词汇模块，不代表全部英语；其他英语完整目的仍由原 Learning / Content owner 承担，不从本次词汇确认推定。

目的与语义规则回原 Learning / Content 合同；具体资产回 canonical owner / manifest；操作、记录与反馈回原 Runtime；验收回原 Acceptance 及其实际消费者证据。历史回执与候选只证明其注明范围和版本，不取得当前权威。这里固定完整目的的采用关系与查找路径，不复制目的正文、不建立第二 owner。

## 阅读与证据记录

动态 Current / Issue 和验证回执与上述稳定目的分开；批次完成、合并及工程测试只提供各自范围的证据，不能代替目的达标判断。

- [EXAM_UNDERSTANDING.md](EXAM_UNDERSTANDING.md)：跨科规则、内容与代码的分批阅读/追踪记录，包含精确路径、blob、全文或局部范围、修复及未验边界。
- [XIZONG_UNDERSTANDING.md](XIZONG_UNDERSTANDING.md)：西综对象和内容阅读覆盖及历史检查依据。
- 两份都是按需读取的历史证据，不是默认恢复包、第二份规范或自动执行队列。仅清点、READ、静态追踪、实际运行、视觉检查和真实 U 分开。
- 不把历史全文阅读称为最新医学复验；不把 DOM/CI/构建或截图数量称为全功能验收；GitHub候选、合并、实际页面生效分别说明。

记录一次实质推进时，只保存：

`目标 → owner/版本 → 已读/已改 → 具体证据 → 未决/限制 → 下一最小步骤`

真实 learner payload、原始私人截图及本地备份留在受保护的原位置，不复制到公开 Issue。公开回执只保存必要的工程结论。

## 旧检查点在哪里

2026-09-30 的候选、旧四阶段执行计划、07:30交付目标、当时额度/本机任务安排和修复报告索引，保留于[整理前版本](https://github.com/kianwang022-hash/kianos/blob/9bb8311d1a5a02f8b2d9324a42978f330e1e6b81/task-continuity/dot/README.md)及原 Issue 回执。它们是历史证据，不能覆盖当前任务 owner 和后来明确采用的决定。

本次路由修正没有删除原知识、产品代码、学习记录或验收证据。旧“未发布”“尚待采用”和旧默认候选，不作为当前执行指令。
