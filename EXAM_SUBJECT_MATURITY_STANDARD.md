# 单科最高成熟度验收标准

你的任务不是“把现有系统继续完善一点”，也不是为了通过 checklist 增加架构。

目标只有一个：

> **把这一科建设成一套真正能支撑目标分数、低注意力长期运行、可动态调整、经得住极端攻击的完整学习控制系统。**

必须从当前 GitHub / Current 真相开始，不继承旧 Chat 对成熟度、完成度、计划或 PASS 的口头判断。

学科自己的认知、材料、证据和学习方法优先。
共享标准规定的是**必须回答的问题**，不是强迫三科使用同一种学习模型。

## 0. Ultra-Maturity admission discipline

本标准现在同时受 Personal OS `SYSTEM_ULTRA_MATURITY_STANDARD.md` 的 whole-system maturity ladder 约束。

旧的“内容完整 / integration 绿 / 一次 Fresh audit PASS”都只能作为证据，不能自动等于最终单科成熟。

每科必须把现有证据重新映射到适用的 U0–U13 gate，并遵守：

```text
need / score truth
→ owner / boundary truth
→ minimal subject-native design
→ implementation
→ deterministic proof
→ semantic / builder attack
→ adversarial stress
→ Fresh Independent anti-anchored audit
→ cross-layer integration
→ synthetic / browser / runtime lifecycle proof
→ degraded / recovery proof
→ maintenance / repair-burden proof
→ compact subject maturity package
→ subject pre-use engineering stop
→ genuine Real-U calibration only
```

### 0.1 Evidence-reuse rule

已有有效证据优先复用。

升级验收不等于把三科重新建设一遍。Fresh worker 先做 evidence map：

```text
new required gate
→ existing exact evidence exists and still matches Current
   → inherit
→ evidence stale / narrower / missing
   → run only that missing proof
```

不得为了“标准升级”重开已经封闭的学习架构、第二套 learner state、第二套 Forecast、第二套 Website/runtime。

### 0.2 Final acceptance independence

Builder 可以发现并修复 blocker，但不能自修后自 PASS。

最终 `SYSTEM_LOGIC_ACCEPTED = YES` 必须来自：
- fresh context；
- exact candidate lock；
- prior builder defect/repair detail last；
- no broad redesign；
- zero material systematic blocker。

如果 Fresh audit FAIL，只修最小 responsible owner，然后最多做 bounded repair re-audit；禁止无限 Fresh 循环。

### 0.3 Required compact final split

每科最终必须在一个 compact Maturity Package 中明确：

```text
SYSTEM_LOGIC_ACCEPTED = YES | NO
KIAN_SPECIFIC_CALIBRATED = YES | NO / REAL-U GATED
CURRENT_YEAR_SOURCE_READY = YES | PARTIAL / SOURCE GATED | NO
AUTHENTIC_MODALITY_READY = YES | PARTIAL / REAL-U-or-MOCK GATED | NO
REMAINING_CONCRETE_DEFECTS = none | bounded exact list
```

并同时记录：
- target / floor / elastic upside；
- score-channel closure；
- current binding capability model；
- evidence semantics；
- Forecast authority boundary；
- Future Source invalidation path；
- lifecycle/degraded/maintenance proof；
- final Fresh Independent receipt。

### 0.4 What does NOT earn Ultra-Mature

以下任何单项都不能独立封层：
- CI 全绿；
- Source inventory 完整；
- 一次 learner-facing Human Gate；
- 一次 synthetic day；
- 一次 Fresh audit；
- integration PASS；
- real learner 做过一次题；
- Forecast 能输出数字；
- 某个 Current 写着 CLOSED。

必须是**适用 gate 的组合证据 + compact package + final independent acceptance**。


---

## 1. 分数闭环

先从最终考试目标倒推，而不是从“现有材料有什么”正推。

必须明确：

- 目标分数；
- 必须保护的底线 / floor；
- 正常工作目标；
- 可选的 elastic upside；
- 各题型 / 板块 / 得分通道的分值结构；
- 合理失分预算；
- 哪些失分最危险；
- 哪些能力必须稳定，哪些只是冲高分增益。

必须形成：

```text
目标分数
→ 各得分通道
→ 可接受失分
→ 所需能力
```

不能只说“学完应该能到 X 分”。

UNKNOWN 可以存在。
证据不足时，不允许为了做计划而制造假精确分数。

---

## 2. 能力闭环

每一个得分通道继续拆成**真正可训练的能力**。

每项能力都必须回答：

```text
考场上到底要会做什么
→ 常见失败是什么
→ 什么训练能改善它
→ 什么证据才能证明改善
```

必须区分：

- 接触过；
- 理解；
- 能主动提取；
- 能应用；
- 能处理陌生变化；
- 能在时间压力下完成；
- 能延迟保持；
- 能在整卷 / 综合任务里继续稳定。

禁止用一个泛化的 `mastery / 掌握度` 分数代替学科真实认知。

---

## 3. 材料闭环

对能力树中的**每项能力**逐一问：

> 我们现在有什么材料能训练它？

材料至少分成：

- Current canonical Source；
- 正式训练题 / 任务；
- Teaching / Repair 材料；
- Transfer 材料；
- Stress / Edge 材料；
- derived / synthetic 材料；
- prior-year historical baseline；
- future current-year source slot；
- reference-only / optional。

### 硬要求

现成高价值材料必须**提前准备好**，不能等 Kian 需要训练时再临时找。

如果某项能力没有足够材料：

> **主动发现缺口 → 生成 / 派生缺失训练资产。**

不能因为外部老师没提供对应材料，就放弃这个能力。

### Synthetic 资产必须经过质量门

至少检查：

- 是否真的测目标能力；
- 答案是否唯一；
- distractor / failure mechanism 是否明确；
- 难度是否合理；
- 语言 / 医学 /逻辑是否自然；
- 是否存在答案泄漏；
- 是否与 Repair 例子过度相似；
- 是否能作为 Transfer；
- 是否需要真实 / 官方材料校准。

Synthetic 成功不能自动冒充真实考试分数证据。

---

## 4. Source Fidelity 闭环

“文件存在”“provenance 正确”“年份正确”还不够。

必须防：

- OCR 漏否定词；
- 数值 / 阈值转录错误；
- 答案键错位；
- 选项顺序变化；
- 表格关系错；
- 图片信息丢失；
- Markdown 转换改变语义；
- old source 被误当 Current。

任何会改变学习 / Repair / 评分 / Forecast 的 Source 转换，都要有风险匹配的 fidelity validation。

无法确认时：

```text
UNKNOWN / BLOCKED
```

不能因为已经进了 canonical 文件就自动变成 learner truth。

---

## 5. 方法闭环

材料存在不等于知道怎么学。

每类材料必须定义：

- 什么时候 first learn / reactivate；
- 什么时候 compress；
- 什么时候 Recall；
- 什么时候做题 / 输出；
- Wrong / Uncertain 怎么处理；
- 什么时候 Repair；
- 什么时候做 changed-context verification；
- 什么时候进入 Maintenance；
- 什么时候停止；
- 什么情况才重新进入更深学习。

原则：

> **稳定内容必须越来越便宜。**

一错一 Repair 默认是错误设计。
多个症状如果来自同一根因，应压缩成最小 Repair cluster。

没有学习价值的仪式必须删除。

---

## 6. 证据闭环

必须明确：

```text
seen ≠ learned
learned ≠ recalled
immediate recall ≠ delayed stability
correct ≠ understood
same-item correction ≠ fresh transfer
repair ≠ stable capability
局部稳定 ≠ 整体执行稳定
```

对该科 relevant 的情况下，要区分：

- first attempt / first output；
- repaired attempt；
- changed-context transfer；
- delayed retrieval；
- timed execution；
- whole-task / whole-paper；
- contaminated / exposed material；
- fresh / authentic material。

不能因为：

> “刚讲完做对了”

就判定 Secure。

也不能因为：

> “以前错过”

永久判定 Weak。

---

## 7. 主观评分有效性

凡是模型参与评分的开放任务，例如：

- 写作；
- 翻译；
- 政治分析题；
- 开放式病例推理；

必须防止：

> 两个模型使用同一个错误 rubric，稳定地一起打错分。

因此必须有：

- 明确 rubric owner；
- anchored descriptors / exemplars；
- 尽可能外部有效性依据；
- systematic bias attack；
- 必要时独立 second review；
- 评分不确定性进入 Forecast。

模型之间 agreement ≠ rubric 正确。

没有可靠 calibration 时，不能用内部评分把总分 Forecast 收得很窄。

---

## 8. Forecast 闭环

Forecast 的职责是：

> **回答还需要多少容量、风险在哪里。**

不是：

> “今天必须做 17 题。”

必须估计：

- 剩余结构工作；
- 当前真实 throughput；
- Review / Repair 压力；
- Maintenance；
- future source 增量；
- 模拟 / 整卷 reserve；
- 最大不确定参数；
- 哪个参数变化会翻转结论。

有真实数据后，可使用：

```text
P20 / P50 / P80
```

或其他保守区间。

但必须遵守：

> **P20/P50/P80 只管容量，不直接决定学习动作。**

不能拿任意“每题 3 分钟”长期充当真实个人模型。

真实学习开始后必须持续重新校准。

---

## 9. Forecast 必须可证伪

每一个重要结论都要能回答：

- 它依赖什么假设？
- 哪个参数最敏感？
- 参数到哪里会翻转决策？
- 现在什么新 evidence 最能降低不确定性？
- 这个 evidence 值不值得花学习时间收集？

必须允许：

> “现在不知道。”

比假精确好。

---

## 10. Dynamic Control 闭环

静态日历不能控制真实学习。

每项能力都应有 subject-native 状态，思想上类似：

```text
UNCALIBRATED / REACTIVATE
→ BUILD
→ VERIFY
→ SECURE / STABILIZE
→ MAINTAIN
→ ELASTIC
```

学科可以自己定义状态，不强制统一名称。

### 必须同时存在两类触发器

**减练：**

- 已有足够代表性证据；
- 连续稳定；
- 同类错误不再出现；
- 限时稳定；
- 新练习几乎不产生 actionable information。

→ 降频 / Maintenance。

**加练：**

- mechanism error 复发；
- fresh transfer 失败；
- 延迟 Recall 回落；
- Whole Task 中崩；
- 时间压力导致明显下降；
- 新 Source 改变能力要求。

→ 回 Build / Verify。

稳定模块不准持续吞时间。

---

## 11. Minimum Dose 不是任务配额

必要时可以设 Minimum Dose / evidence floor，防止小样本误判。

但它只是：

> **允许宣布 Secure 的最低证据量。**

绝不能变成：

> “计划写了20篇，所以稳定后还得把20篇刷完。”

反过来，数量刷够但能力仍不稳，也不能 Secure。

---

## 12. Elastic / ROI 闭环

一项能力 Secure 后仍然可以继续提高。

但此时问题不再是：

> “还能不能提高？”

而是：

> **下一小时投这里，是不是当前最值钱的一小时？**

ROI 至少考虑：

- 预计新增得分；
- 减少方差；
- 提升速度；
- 迁移价值；
- 长期复利；
- 最新有效日期；
- 学习成熟需要的 latency；
- 材料 / freshness 消耗；
- 边际递减；
- 跨科机会成本。

短期 ROI 不能饿死需要较长时间形成的关键能力。

---

## 13. Repair 因果闭环

Wrong / Uncertain / 低分只是**观察结果**，不自动等于知识没学会。

可能原因包括：

- 知识模型缺失；
- 精确记忆不稳；
- option boundary；
- task-form 错误；
- 语言问题；
- 疲劳 / 时间；
- 熟题污染；
- execution / transport 问题。

如果不同原因会导致不同 Repair：

> 先做最小 discriminating check。

不能猜。

Repair 后也不能用同一道题做对了就宣布修复成功。

---

## 14. 未来材料全生命周期闭环

所有已知“未来必来的材料”，**现在就建立槽位**。

每类 Future Source 必须提前定义：

- 它解决什么能力；
- 去年 baseline 是什么；
- 当前 owner；
- 到来后的 ingest；
- fidelity validation；
- delta extraction；
- 哪些 derived asset 会更新；
- 哪些旧 asset 会 invalid；
- learner 怎么使用；
- 如果晚到怎么办；
- 只到一部分怎么办；
- 出第二版怎么办；
- 永远不到怎么办。

以后材料到达时：

```text
新 Source
→ bind
→ 对 prior/current 做 delta
→ 更新 responsible owner
→ validation
→ learner use
```

**不能重新设计一遍系统。**

---

## 15. Prior-year 材料现在就吸收

上一年度资料不能简单放仓库吃灰。

现在就用它建立：

- task geometry；
- output skeleton；
- common failure；
- Memory candidate baseline；
- Mock workflow；
- final compression shape；
- current-year delta scaffold。

但必须明确：

> prior-year baseline ≠ current-year truth。

尤其涉及：

- 时政；
- 政策表述；
- 法律规范；
- 年度新增；
- 最终冲刺答案；

必须 Current-year corroboration 才能进入今年 exact recall。

---

## 16. Chat ↔ Website 执行闭环

稳定关系必须是：

```text
Current durable assets
+ private learner evidence
→ Chat 决策
→ typed plan / instruction
→ Website 执行
→ learner evidence
→ Chat 再决策
```

Website：

- 不负责跨任务策略；
- 不自动制造学习债；
- 不自己判断 ROI；
- 不成为第二个 scheduler；
- 不藏一套 fallback strategy。

必须做到：

- 一个清晰 Next Action；
- Resume；
- evidence capture；
- stale plan 拒绝；
- replay/idempotency；
- checkpoint/restart；
- private state 恢复；
- 没有 plan 时 fail closed。

---

## 17. Learner Attention Cost

后台可以非常复杂。

前台只能尽量留下：

> 现在做什么
> 为什么——仅必要时
> 有什么重要变化
> 是否需要 Kian 决策。

正常情况下 Kian 不应该维护：

- 任务账本；
- mastery 表；
- 复习日历；
- Source inventory；
- Forecast 参数；
- 进度 spreadsheet。

Kian 日常最好只需要：

1. 现实容量 / 可用材料发生明显变化时告诉 Chat；
2. 按 Next Action 学习；
3. 有真实 Review / Day-end 判断需要时提供一次 bounded handoff；
4. 系统明显判断错时直接 override。

其余应自动完成。

---

## 18. Day-1 实际学习闭环

在宣布“明天可以正式学习”前，必须模拟：

```text
打开 Home
→ 唯一 Next Action
→ 进入任务
→ 正常完成 / 中断 / 做错 / 不确定 / override
→ Evidence 回流
→ Chat 再判断
→ 下一动作
→ 当天结束
→ 第二天 Resume
```

并证明 Kian 不需要自己理解后台系统才能继续。

---

## 19. 全生命周期模拟

不能只测一个学习 session。

至少模拟：

- 第一天；
- 正常学习周；
- 速度明显快于预期；
- 速度慢 30%；
- 一天只有正常 30% 容量；
- 连续坏 3 天 / 1 周；
- Repair 突然爆炸；
- Memory 爆炸；
- 稳定后 relapse；
- Source 晚到；
- Source 第二版覆盖第一版；
- Learner progress 与旧 Chat Plan 冲突；
- 浏览器重启；
- checkpoint 损坏；
- Timer 丢失；
- 部分 evidence 缺失；
- 模块已稳定但 Chat 仍安排重练；
- Chat 错误宣布 Secure。

正确系统必须：

> **降级到安全行为，而不是让 Kian 手工修系统。**

---

## 20. Adversarial Stress Test

不能只写十几个手工 case 就说压力测试完成。

根据学科实际需要使用：

- parameter grid；
- boundary / extreme value；
- combinatorial scenarios；
- randomized reproducible cases；
- historical sanity backcast；
- counterfactual comparison；
- stale / duplicate / missing / corrupted transport；
- decision flip surface；
- metamorphic invariants。

重点不是跑多少 case。

重点是发现：

> **什么情况下决策会翻转。**

---

## 21. False Secure 和 False Unstable 都要防

系统不能只保守。

必须同时攻击：

### False Secure

能力还没稳，却降频。

### False Unstable

能力已经稳定，却持续 Build / Verify，浪费大量容量。

每个重大状态判断都必须能回答：

- 用了哪些证据；
- 哪些仍 UNKNOWN；
- 什么会推翻判断；
- 什么情况 reopen。

---

## 22. Second-line Safety Guard

Chat 是策略 owner，但不能只有一道防线。

每科必须有少量**subject-native fail-closed invariant**。

它不能替 Chat 排任务，但至少阻止：

- evidence gate 未满足却声明 Secure；
- 没有新反证却重开重型 Build；
- stale/exposed material 冒充 fresh evidence；
- 旧 Source 进入 Current exact memory；
- 旧 plan 覆盖新 learner evidence；
- 计划分钟数超出真实 usable capacity；
- 关键 UNKNOWN 被静默忽略。

触发冲突后：

> 返回 Chat 重决策。

不是 Website 自己重新规划。

---

## 23. Fresh Chat Attack

一个**完全不知道过去聊天内容的新 Chat**，只拿到：

- Current durable owners；
- 当前 Daily / Resume / evidence packet；
- 当前考试事实；

必须可以作出合理下一步。

如果必须知道：

> “之前那个 Chat 当时怎么想的”

才能继续，说明系统还没成熟。

---

## 24. No-Website Attack

把 Website 关掉以后：

- 学习语义；
- Source ownership；
- Evidence meaning；
- Repair logic；
- Forecast meaning；

仍然必须正确。

Website 只是执行器，不是隐藏的大脑。

---

## 25. Evidence Revision / Identity

Evidence 必须绑定真正的 task/material identity。

不能用：

> 文件名不同
> 页面不同
> 设备不同
> tab 不同

冒充 fresh material。

相同 / near-derivative 材料必须识别。

当内容语义 revision 发生变化：

旧 evidence 必须显式变成：

```text
PRESERVE
MIGRATE
STALE
INVALID
```

不能默认全部继续有效。

---

## 26. Future Source Transitive Invalidation

Future Source v2 替换 v1 时，不只是改第一层文件。

必须追踪所有会影响 learner decision 的下游：

- Teaching；
- Drill；
- Explanation；
- Memory；
- Precision；
- Repair；
- learner evidence interpretation；
- plan / Resume；
- Forecast；
- score band；
- readiness claim。

历史观察可以保留，但不能继续错误地授权 Current 决策。

---

## 27. Authentic Modality

真实考试如果包含：

- 纸笔；
- 手写；
- 答题卡；
- 翻页；
- 整卷疲劳；

那么正式 evidence 中必须有一部分保留或校准这种成本。

浏览器输入速度不能默认等于考场执行速度。

---

## 28. Real Learner U

CI、Browser、synthetic test 不能制造“你会了”。

必须区分：

### SYSTEM_LOGIC_ACCEPTED

系统逻辑、Evidence、Forecast、Transport、Failure handling 已经测试成熟。

### KIAN_SPECIFIC_CALIBRATED

有足够真实 Kian 学习数据，已经知道：

- 真实 throughput；
- 错误结构；
- retention；
- transfer；
- friction；
- 真实 Forecast 参数。

前者可以先完成。

后者只能靠真实学习获得。

---

## 29. Subject-native，不许强行统一

这份标准规定：

> 每科必须回答哪些问题。

不规定：

> 每科必须用同一种答案。

禁止：

- 英语 Minimum Dose 变成政治固定刷量；
- 政治 Memory 变成西综统一复习系统；
- 西综 Repair 模型强行复制给英语；
- 三科共用一个 mastery score；
- 三科共用一套 Secure threshold。

共享的应该主要是：

- Home；
- Chat Plan；
- Daily Packet；
- Timer；
- checkpoint；
- transport safety。

认知必须各科自己拥有。

---

# 每科最终必须交付的 Maturity Package

每一科最后必须有**一份实用的成熟度包**，而不是十几个管理文件。

至少包含：

### A. Score → Ability → Material → Method → Evidence Matrix

必须完整。

### B. Full Material Inventory

包括：

- 已有材料；
- 缺失材料；
- generated assets；
- future source slots；
- prior-year baseline；
- blocked / reference-only。

### C. Dynamic Control Rules

说明：

- 什么时候 Build；
- 什么时候 Verify；
- 什么时候 Secure；
- 什么时候 Maintain；
- 什么时候重新加练；
- 什么时候停止；
- 什么时候 Elastic。

### D. Forecast

包括：

- P20/P50/P80 或合适区间；
- 最大不确定变量；
- sensitivity；
- decision flip points；
- 下一条最值钱 evidence。

### E. Adversarial Report

不是“测试全绿”。

而是：

> 哪些 all-green failure 被攻击过；
> 哪些模型会过于乐观；
> 哪些会过于保守；
> 在什么情景下决策真的翻转。

### F. Chat ↔ Website Proof

证明日常真实学习链可跑，而且低摩擦。

### G. Future Source Readiness

所有已知后期材料：

> baseline / slot / delta / validation / derived use

提前准备。

### H. Real Learner U 状态

明确：

```text
SYSTEM_LOGIC_ACCEPTED?
KIAN_SPECIFIC_CALIBRATED?
```

不能混写。

### I. Remaining Unknowns

只允许剩：

- 真正还未发布的 Future Source；
- 必须靠 Kian 真实学习产生的数据；
- 已明确不会影响当前学习动作的低价值未知。

---

# 各科拿到这份标准后的执行顺序

不要先改代码。

按下面顺序：

```text
1. Current-first
2. 目标分数 / loss budget
3. Ability tree
4. Material inventory
5. Score→Ability→Material→Method→Evidence matrix
6. 找真实 gap
7. Forecast
8. Dynamic control
9. Future Source readiness
10. Chat↔Website execution
11. Full lifecycle simulation
12. Adversarial / stress test
13. 输出按 learner impact 排序的 Gap Matrix
14. 从最大 gap 开始逐个落地
15. 每修一个就 targeted proof
16. 再 self-attack
17. 明天开始吃 Real Learner U
18. 持续重算
```

**不要为了达到标准而新建第二套架构。**

已有系统能承担职责就复用。

---

# 最终验收问题

这一科只有在能够稳定回答下面这句话时，才接近真正成熟：

> **为了目标分数，当前真正限制我的是什么能力；为什么；什么材料和方法最有效；下一步具体做什么；做完会产生什么证据；什么证据会改变判断；还需要多少容量；哪些内容已经应该少做或停止；如果未来材料、容量或表现突然变化，系统能不能在不增加我维护成本的情况下自动重新做出正确决策？**

如果回答不了其中任何一个**会真实改变学习结果**的问题，就继续补。

如果都能回答，而且继续增加系统不会改变学习行为或决策质量：

> **停止建设，去学习。**

---

# 31. Ultra-Maturity final subject acceptance package

当本标准全部适用 gate 已满足时，单科最终验收必须回答以下五类问题，而且必须在同一个 compact package 中可被 fresh worker 一次定位：

## A. Score / capability truth
- 目标分数、floor、elastic upside 是否有明确证据边界？
- 每个得分通道的能力、失分机制、训练和证据是否闭环？
- learner-specific 精度不足时是否保持 UNKNOWN 而非假精确？

## B. Material / method / evidence truth
- 每项关键能力是否有可执行材料？
- Current Source fidelity 是否 fail-closed？
- Method 是否能 Build → Verify → Maintain，而不是永久 Repair？
- same-item / assisted / exposed / synthetic evidence 是否不会冒充 fresh/authentic performance？

## C. Control truth
- Forecast 是否只做 workload/risk/sensitivity，而不接管策略？
- Future Source arrival 是否会 transitive invalidate 下游陈旧结论？
- Chat Plan / subject continuation 是否绑定 current evidence snapshot？
- stale / missing / conflict 是否安全退化？

## D. Lifecycle / degraded / maintenance truth
必须至少覆盖：
- normal sequence；
- low-capacity / interruption；
- cross-day continuation；
- fresh Chat / fresh worker；
- runtime/browser restart；
- missing Source / missing transport；
- stale or conflicting Return；
- no-Website / degraded path where applicable；
- repeated cycles without growing Kian repair burden。

## E. Final labels
最终只允许以下精确状态：

```text
SYSTEM_LOGIC_ACCEPTED
+ KIAN_SPECIFIC_CALIBRATED = NO / REAL-U GATED  (若仍依赖真实学习)
+ CURRENT_YEAR_SOURCE_READY = PARTIAL / SOURCE GATED (若新年度 Source 未发布)
+ AUTHENTIC_MODALITY_READY = PARTIAL / REAL-U-or-MOCK GATED (若真实整卷/正式模考未发生)
+ REMAINING_CONCRETE_DEFECTS = none | exact bounded list
```

这仍然可以是“最高级 pre-use engineering maturity”，而不是伪造 Kian 已经学会。

单科封层后：
- 停止 broad maturity engineering；
- 正常学习产生 Real-U；
- 只有 concrete decision-changing defect / authoritative Source delta / authentic modality evidence 才重开最小 owner。
