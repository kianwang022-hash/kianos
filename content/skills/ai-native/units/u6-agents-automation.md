# U6｜Workflow、Agent 与自动化：复杂度只在真正带来收益时增加

“Agent”很容易让系统显得先进。

但真正成熟的问题不是：

> **我能不能做 agent？**

而是：

> **这件事值得 agent 吗？**

复杂度必须赚钱。

这里的“赚钱”可以是：

- 更高质量；
- 更强覆盖；
- 更少人工；
- 更好处理动态问题；
- 更好的长期自动化价值。

---

## 1｜先建立复杂度阶梯

很多任务可以按：

~~~text
普通程序
↓
单次 LLM
↓
固定 workflow
↓
带 routing / feedback 的 workflow
↓
agent
↓
multi-agent
~~~

逐层增加。

默认：

> **停在最简单能可靠完成任务的一层。**

不是：

> 从 multi-agent 开始再往回删。

---

## 2｜Workflow 和 Agent 的核心区别

### Workflow

路径主要由系统提前定义。

例如：

~~~text
分类
→ 搜索
→ 总结
→ 格式检查
→ 输出
~~~

优点：

- 可预测；
- 容易测试；
- 容易 debug；
- 成本更可控。

### Agent

下一步更多由模型根据当前环境动态决定。

例如：

> 调试一个陌生 repo，自己决定先搜哪里、读什么文件、跑什么测试。

优点：

- 能处理无法提前枚举的路径；
- 对复杂开放任务更灵活。

代价：

- 更难预测；
- 更难 debug；
- latency / cost 更高；
- 权限风险更大。

---

## 3｜Routing：不同问题走不同路径

不是所有输入都需要最贵的流程。

例如：

~~~text
简单 FAQ
→ 直接检索 / 小模型

复杂异常
→ 强模型 + 深分析

需要真实数据
→ 工具

高后果动作
→ 人工批准点
~~~

Routing 的价值是：

> **把复杂度集中在真正需要的地方。**

---

## 4｜Parallelization：独立工作可以并行

适合：

- 多来源搜索；
- 多角度 code review；
- 独立方案生成；
- 大任务分块。

但要先问：

> 子任务真的独立吗？

如果强依赖：

> 并行只会制造冲突和合并成本。

并行也不是：

> agent 数量越多，答案越可靠。

---

## 5｜Orchestrator–workers：动态拆复杂任务

适合：

> 一开始不知道需要哪些子任务。

例如复杂代码修改：

- orchestrator 先理解问题；
- 决定要看哪些模块；
- 派 worker 去做局部分析；
- 收回结果；
- 再决定下一步。

这类结构很强。

但必须有：

- 清楚共享目标；
- worker 输出契约；
- state；
- 汇总逻辑；
- 最终验证。

否则只是：

> 多个模型一起制造更多文字。

---

## 6｜Evaluator–optimizer：只有在反馈可操作时才值

模式：

~~~text
生成
↓
评价
↓
修订
↓
再评价
~~~

适合：

- 质量标准比较清楚；
- feedback 能真正改进结果；
- 迭代收益可测。

不适合：

> evaluator 也说不清哪里不好。

否则循环会变成：

> 自我欣赏。

---

## 7｜自动化需要停止条件

一个 agent 如果可以无限：

- 搜索；
- 修改；
- 重试；
- 调工具；

就必须有：

- maximum iterations；
- time budget；
- cost budget；
- acceptance condition；
- no-progress detection；
- human escalation。

否则系统可能：

> 一直“努力”，但没有变得更接近完成。

---

## 8｜重试必须考虑副作用

读一个网页失败后重试：

> 通常没事。

支付失败后重试：

> 可能重复扣款。

因此有副作用的 tool call 必须理解：

- idempotency；
- transaction；
- duplicate prevention；
- confirmation；
- rollback。

Agent 不是普通聊天。

它可能：

> 真正改变外部世界。

---

## 9｜Observability 是 agent 的感官

长 workflow / agent 需要能看到：

- 输入；
- 工具调用；
- 中间 state；
- errors；
- retries；
- latency；
- token / cost；
- 最终结果。

如果失败后只能看到：

> “任务未完成”，

系统几乎不可维护。

Trace 的价值是：

> **让失败可定位。**

---

## 10｜Agent 应该尽量从环境得到反馈

一个 agent 完成动作后：

> 不应只靠“我觉得完成了”。

例如：

- 改代码 → 跑 test；
- 写文件 → 重新读；
- 部署 → health check；
- 发请求 → 检查 response；
- 搜索 → 打开真实 source。

环境反馈把 agent 从：

> 语言自洽

拉回：

> 现实自洽。

---

## 11｜Multi-agent 的门槛更高

只有当：

- 子任务有真实专业分工；
- 并行有明显收益；
- 单 agent context / planning 真的不够；
- 可以独立验证 worker；
- merge 逻辑清楚；

multi-agent 才可能值。

否则：

> 只是增加 coordination tax。

不要把：

> “有 8 个 agent”

当成系统成熟度。

---

## 12｜U6 的选择题

~~~text
这个任务普通代码能解决吗？
单次 LLM 能解决吗？
固定 workflow 能解决吗？
是否真的需要动态下一步？
是否值得更高 cost / latency？
权限风险是否上升？
能看到 trace 吗？
有 stop condition 吗？
有 side effect protection 吗？
~~~

Agent 最成熟的使用方式之一是：

> **知道什么时候根本不需要 Agent。**
