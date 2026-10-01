# dot 考研系统任务接续

用途：用户要求的工程接续索引，防止跨对话丢失目标、重复工作或误读进度。这里只保存可公开的工程指针，不保存私人学习记录、对话原文或凭据；不拥有第二套产品规则、Current 或 Acceptance。

## 当前从哪里接

1. 读当前 `AGENTS.md`，先识别用户是在学习、使用、修改还是查看工程状态。
2. dot 的当前阶段、执行边界和完成标准，以 [Personal #61](https://github.com/kianwang022-hash/kian-personal-os/issues/61) 为准；[任务栏 #60](https://github.com/kianwang022-hash/kian-personal-os/issues/60) 只做跨项目薄指针。
3. 按实际需求进入原责任范围，不把所有请求都先送去西综工程游标：
   - 西综内容/映射/功能一致性：`content/xizong/CURRENT.md` → [#1113](https://github.com/kianwang022-hash/kianos/issues/1113) → exact owner
   - 三科运行闭环、跨科反馈及普通使用缺陷：[#1111](https://github.com/kianwang022-hash/kianos/issues/1111) → 当前具体缺陷/候选
   - 英语/词汇/政治的设计与内容：对应 domain `CURRENT.md`、manifest、Learning/Product owner
   - 实际学习进度：native learner evidence/Packet/Resume；工程任务和内容存在不能代替个人进度
4. 仅读必要原文件与实际消费者；已有文件/证据版本未变时复用，不从旧任务摘要推测最新状态。

当前已确认推进的是 #61 第一阶段：考研 GitHub 端规则、既有内容组织与功能消费者收口。dot 不操作用户本机、浏览器、真实学习记录或本地部署；需要本地工作的范围、输入和验收先写到已有任务，再由用户转交 Chat。PDF/医学内容质量升级及词库扩写目前不启动。后续阶段变更回 #61，本索引不维护独立授权或并行任务表。

## 总目标与必须保留

目标是完整、低摩擦的系统：现有要求能找到正确 owner，修改能沿既有内容→对象→页面链被正确消费，进度与反馈各归原生负责位置。

- Source 管依据；Knowledge/Content 管知识与教学资产；Learning 管学习方式；Visual 管展示；Runtime 管操作、记录与流转。下游不得猜知识或另造语义 owner。
- 西综层级保持 System→Block→Logic Group→KP；稳定身份、学习顺序、成员关系与 Source 范围分别处理，保留不同系统的真实 Source/学习方式。
- 已采用资产按认知职责和时机消费。Prompt 是提取骨架；Core 保持完整；Boundary/Connection/Precision/MedicalVisual 按已有 owner 决定，不能强行对称或靠标点统一代替审查。
- Content revision 与 Learner history 分开。明确的非语义修改不制造重学；医学语义变化只限定受影响结论；历史、个人提示、笔记、标记与 Resume 不靠覆盖“修好”。
- 现行规则优先，缺理解不等于没有设定；合法历史、Source 差异及未消费的有效知识资产不当作垃圾删除。

语义细节直接读原权威，不复制到这里：
[学习合同](../../content/xizong/LEARNING_CONTRACT.md)、[学习策略](../../content/xizong/knowledge/learner/study-policy.json)、[内容组合](../../content/xizong/LEARNER_OBJECT_CONTRACT.md)、[页面职责](../../static-web/XIZONG_BLOCK_WORKSPACE_DESIGN.md)、[权威继承](../../AUTHORITY_INHERITANCE_CONTRACT.md)。

## 阅读与证据记录

- [EXAM_UNDERSTANDING.md](EXAM_UNDERSTANDING.md)：跨科规则、内容与代码的分批阅读/追踪记录，包含精确路径、blob、全文或局部范围、修复及未验边界。
- [XIZONG_UNDERSTANDING.md](XIZONG_UNDERSTANDING.md)：西综对象和内容阅读覆盖及历史检查依据。
- 两份都是接续证据，不是第二份规范或自动执行队列。仅清点、READ、静态追踪、实际运行、视觉检查和真实 U 分开。
- 不把历史全文阅读称为最新医学复验；不把 DOM/CI/构建或截图数量称为全功能验收；GitHub候选、合并、实际页面生效分别说明。

记录一次实质推进时，只保存：

`目标 → owner/版本 → 已读/已改 → 具体证据 → 未决/限制 → 下一最小步骤`

真实 learner payload、原始私人截图及本地备份留在受保护的原位置，不复制到公开 Issue。公开回执只保存必要的工程结论。

## 旧检查点在哪里

2026-09-30 的候选、旧四阶段执行计划、07:30交付目标、当时额度/本机任务安排和修复报告索引，保留于[整理前版本](https://github.com/kianwang022-hash/kianos/blob/9bb8311d1a5a02f8b2d9324a42978f330e1e6b81/task-continuity/dot/README.md)及原 Issue 回执。它们是历史证据，不能覆盖当前 #61/#1111/#1113。

本次缩短入口没有删除原知识、产品代码、学习记录或验收证据，也不把旧“未发布”描述继续当成当前任务。
