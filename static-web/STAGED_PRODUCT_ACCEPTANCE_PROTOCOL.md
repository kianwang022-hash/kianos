# KianOS 三科 Productization｜阶段执行与人工验收协议

Status: **ACTIVE PROGRAM PROTOCOL**  
Parent: #113  
Execution master: `CODEX_ASTRA_THREE_SUBJECT_SITE_EXECUTION.md` v3.0+

## 1｜为什么分 Stage

Stage 只用于控制上下文、并发写入和停止点，不是把 Astra 变成逐条执行脚本。每个 Stage 给 Astra：目标、Current authority、不可破坏的 learning/evidence/product invariants、验收出口和 stop rule。**实现路径、代码定位、局部重构、真实 bug 发现、浏览器自查与普通视觉 polish 由 Astra 自主判断。**

不得把 Stage Issue 当成 step-by-step SOP；也不得因为 Astra 能力强就越过 Stage，自动进入下一科。

## 2｜每 Stage 的四层闭环

### A. Astra autonomous execution

Astra 先从最新 `main` 恢复 Program 全局位置，再读取当前 Stage 所需 owners。它必须理解当前工作对 #113、前序 Stage、下一 Stage、并行 Lexical/Xizong Content lanes 的关系，然后自主施工。

要求：
- 优先复用已完成证据，不重复已经 PASS 的浏览器/语义工作；
- 主动检查实际 route/loader/state/browser，不只执行清单；
- 发现 scope 内的新真实缺陷可直接修复；
- 发现 scope 外问题则记录 identity/影响/是否阻断，不顺手扩张；
- 普通实现与 L1/L2 polish 自主，L3 结构替代遵守 master 的 bounded alternative 规则。

### B. Technical / semantic review

Astra 完成后不直接把“我做完了”当事实。由独立 review 读取 diff、Current、测试/截图/trace 和失败边界，判断：
- 是否真的满足本 Stage Exit；
- 有没有覆盖错误 owner、伪造证据、重复既有工程；
- CI 红灯属于本 Stage regression、共享上游、还是无关治理；
- 哪些结论是自动测试，哪些仍需人看。

机械 hash/build/validator 检查属于这一层，不让 Kian 手工抄命令证明。

### C. Kian Human Product Gate

人工核查必须产生产品判断，不做机器已经能做的劳动。默认只在 learner-facing Stage 进行；纯 metadata/content packaging Stage 可以由 review 后让 Kian只做 merge/不merge授权。

人工 gate 重点：
- 真实学习时“第一眼该看什么”是否正确；
- 信息密度、阅读节奏、点击负担是否符合日用；
- Guide / Recall / question / repair 是否像真实学习而不是工程 demo；
- 精确 Return / Continue 是否符合人的预期；
- Astra 的视觉/局部 composition 是否优于底线且未损失逻辑；
- 是否存在自动测试很难发现的“能用但很烦”“逻辑没错但呈现不对”。

不要求 Kian读完整 diff、运行 CI、核对 hash 或逐实例验收。

### D. Merge / closure

A+B+C 所需门槛满足后，Kian授权 merge。merge 后读回 `main`，更新 Stage/Program Current，关闭本 Stage；随后才创建/启动下一 Stage execution context。learner `U` 仍只来自真实使用，Product Gate 不自动等于 U。

## 3｜全局状态回读格式

任何阶段回执、局部 bug 或 CI 讨论，先恢复以下全局位置，再回答局部：

```text
Program: #113
Current Stage: #...
Previous accepted/merged stages: ...
Current artifact/PR: ...
What is already proven and must not be redone: ...
Current blocker(s): ...
Parallel lanes that remain independent: Lexical / Xizong B–F / ...
Next Stage (locked until current closure): ...
Human gate needed now?: yes/no + exact reason
```

禁止看到一个错误就把整个三科任务缩成那个错误；也禁止只读用户最新贴的一段回执而丢掉 Program authority、内容演化边界或后续 Stage。

## 4｜各 Stage 的人工 gate

- **Stage 0 #138**：机械资产 reconciliation。独立 review + CI 判断即可；Kian只决定是否 merge，不需要手工验证 1148 条/hash。
- **Stage 1 #139**：Kian亲自走一次短的肖1000日用路径：setup/一道单选/一道多选/一次 Wrong 或 Uncertain/备注保存或刷新/Next 与 exact Return；重点看手感、信息层级、是否有多余说明。自动测试负责其余组合。
- **Stage 2 #140**：Kian看五科各一个代表 cognitive workspace，并完整走一次 `Home/Continue → NU → Chengfeng handoff → first-ready Xiao → repair/source → Return`；判断五科是否“一个网站、五种认知”而非卡片模板。
- **Stage 3 #141**：Kian至少实际体验 Reading A、Cloze/Part B 中一类、Translation、Writing 各一个代表任务，并打开三份 Guide；重点判断完整任务几何、输入/阅读手感、Guide 是否好找但不挡路、Resume/Return 是否自然。
- **Stage 4 #142**：Kian完整走一个代表 System 的 `Guide → Block/LG → lecture handoff → KP Recall → closure/question/repair`，再快速看另外两个 System 的异质页面；判断逻辑是否真的被表达、Recall 是否无泄露、内容密度是否可学习。
- **Stage 5 #143**：Kian从 Global Home 分别 Resume 三科，再返回 Home；判断整站统一感、Continue 语义、跨科跳转和最终视觉。此 gate 是最终产品接受，不重做各科详细 QA。

人工 gate 发现问题时，按问题责任回到当前 Stage 修正；不自动回滚整个 Program，也不把视觉意见升级成内容重审。

## 5｜额度策略

Astra 用在高价值部分：理解现有工程、真实浏览器、复杂状态、局部产品判断、debug、polish。纯 hash/metadata/tombstone/governance 机械修复优先交普通执行或独立小任务，不消耗 Astra 重新装载整科上下文。

每次只启动当前 Stage；完成后释放上下文。下一 Stage 从 Program + Current + merged receipts 恢复，不要求 Kian复制前一阶段所有日志。
