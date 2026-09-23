# Source Review｜高质量决策与不确定性

Status: LEARNER-READY SOURCE CLOSURE
Role: 后台证据边界，不是 learner-facing 课程。

## Source rule

这个 Skill 只保留会改变实际决策质量的内容。重点不是收集“认知偏差清单”，而是建立一个能反复用于真实选择的过程：

- 正确框定问题；
- 产生足够好的备选方案；
- 明确目标、底线与时间尺度；
- 正确处理不确定性与基准概率；
- 比较取舍、机会成本与下行风险；
- 判断继续搜集信息是否值得；
- 在结果出来后区分决策质量与结果质量。

## Accepted source set

### S1｜Stanford — Foundations of Decision Analysis

Source: Stanford MS&E 252, Foundations of Decision Analysis.
https://bulletin.stanford.edu/courses/1045581

Accepted:
课程明确覆盖 framing、alternatives、uncertainty as probability、preference、information value、flexibility、risk attitude 与 decision quality。

Learner use:
提供整本 Skill 的母结构。

Boundary:
正式 decision analysis 的完整数学体系并不是所有生活决策都值得执行；Learner content 只保留会改变现实判断的最小结构。

### S2｜Stanford — decision quality ≠ outcome quality

Source: Stanford Engineering profile of Ron Howard / decision analysis.
https://engineering.stanford.edu/news/stanford-professor-ron-howard-shares-honors-pioneering-decision-analysis

Accepted:
不能用结果质量直接给决策质量打分。

Learner use:
建立“好结果不自动证明好决策；坏结果也不自动证明坏决策”的硬边界。

Boundary:
结果仍然重要；它用于更新世界模型、概率与个人偏好，但不能反向改写“当时可得的信息”。

### S3｜MIT — decision analysis / value of information / flexibility

Sources:
- MIT IDS.333 Risk and Decision Analysis, Unit 8.
- MIT IDS.333 Value of Information, Unit 9.
- MIT IDS.333 Drivers of Flexibility, Unit 7.

https://ocw.mit.edu/courses/ids-333-risk-and-decision-analysis-fall-2021/pages/assignment-8/
https://ocw.mit.edu/courses/ids-333-risk-and-decision-analysis-fall-2021/resources/unit-9-value-of-info-video-2/
https://ocw.mit.edu/courses/ids-333-risk-and-decision-analysis-fall-2021/pages/assignment-7/

Accepted:
在不确定条件下，应显式考虑未来情境、随着信息更新判断，并在新信息能改善选择时考虑其价值；不确定性越高，保留一定 flexibility 越可能有价值，但 flexibility 本身也有成本。

Learner use:
支持 U2 的可逆试验、U5 的信息价值，以及“不确定时保护选择权但不要无限拖延”。

Boundary:
不要求给每个现实选择建立完整数值决策树，也不把 flexibility 绝对化。

### S4｜Opportunity cost

Sources:
- OpenStax Principles of Economics 3e.
- MIT Principles of Microeconomics.

https://openstax.org/books/principles-economics-3e/pages/2-1-how-individuals-make-choices-based-on-their-budget-constraint
https://ocw.mit.edu/courses/14-01sc-principles-of-microeconomics-fall-2011/pages/unit-2-consumer-theory/budget-constraints/

Accepted:
机会成本是因为选择当前方案而放弃的下一最佳替代方案的价值。

Learner use:
把“这个选择本身值不值”升级为“它相比下一最佳替代方案值不值”。

Boundary:
不是要求把所有人生价值强行货币化。

### S5｜Probabilistic forecasting / calibration

Sources:
- Mellers et al. (2014), Psychological Strategies for Winning a Geopolitical Forecasting Tournament.
- Mellers et al. (2015), Identifying and Cultivating Superforecasters as a Method of Improving Probabilistic Predictions.

https://journals.sagepub.com/doi/10.1177/0956797614524255
https://faculty.wharton.upenn.edu/wp-content/uploads/2015/07/2015---superforecasters.pdf

Accepted:
在特定 forecasting tournament 中，概率训练、reference-class thinking、持续评分/反馈和更新与更好的 calibration / resolution / forecast accuracy 相关；优秀表现来自多种因素共同作用，而不是一个单独技巧。

Learner use:
支持“用可更新概率替代模糊词”“先看参考类”“长期用反馈校准自己”。

Boundary:
这部分证据来自 geopolitical forecasting 场景。不能推出所有生活决策都需要精确概率，也不能把 forecasting skill 等同于完整 decision quality。

### S6｜Base-rate neglect

Source: Base-Rate Neglect as a Function of Base Rates in Probabilistic Contingency Learning.
https://pmc.ncbi.nlm.nih.gov/articles/PMC2441578/

Accepted:
在某些概率判断任务中，人们可能过度依赖具体 predictor / case information，而低估 base rate。

Learner use:
提醒先找合理参考类，再让个案证据推动更新。

Boundary:
“人一定忽略 base rate”不是硬规律；参考类本身也可能选错，领域经验也会改变表现。

### S7｜Outcome bias

Source: Baron J, Hershey JC. Outcome bias in decision evaluation. J Pers Soc Psychol. 1988.
https://pubmed.ncbi.nlm.nih.gov/3367280/

Accepted:
知道结果以后，即使评价者拥有和决策者当时相同的信息，结果好坏仍会影响其对决策过程的评价。

Learner use:
支持 U7 复盘时先冻结“当时知道什么”，再用结果更新模型。

Boundary:
结果不是无关信息；它只是不能被拿来伪造 hindsight certainty。

### S8｜Premortem

Source: Proactive planning for contextual fit: the role of the implementation premortem.
https://pmc.ncbi.nlm.nih.gov/articles/PMC12330140/

Accepted:
在 implementation planning 场景中，prospective hindsight / premortem 可用于提前识别实施障碍与 context mismatch。

Learner use:
作为 U6 的一种**可迁移实践工具**：高代价、执行链长的决定提交前，可假设失败并寻找隐藏依赖与执行风险。

Boundary:
这里的直接证据主要来自 implementation 场景，不足以声称 premortem 对所有个人决策都已被强实证验证。因此 Learner content 只把它作为 bounded tool，而不是必做仪式。

## Source → Unit map

| Unit | 主要 Source | 边界 |
| --- | --- | --- |
| U1 问题框定 | S1 | Learner-facing framing 是对专业 decision analysis 的压缩，不等于完整 formal DA |
| U2 备选方案与机会成本 | S1 + S3 + S4 | “不做 / 延迟 / 小试”是实践性生成模板，不声称是唯一标准 |
| U3 不确定性与基准概率 | S1 + S5 + S6 | 概率表达与 calibration 证据主要来自 forecasting；生活决策按信息价值选择粒度 |
| U4 取舍与风险 | S1 + S3 | 风险四维与非对称检查是 learner synthesis，不冒充单一研究定律 |
| U5 信息价值 | S1 + S3 | 核心 claim 是信息要能改善选择；不要求 formal EVPI 计算 |
| U6 提交前检查 | S8 + practical synthesis | premortem 只用于合适的高代价 / 高执行复杂度情境 |
| U7 结果复盘 | S2 + S7 | 先评价当时过程，再用结果更新模型 |

## Closure pass 1 — defects found and repaired

1. **Objectives / constraints 太薄**：原 U1 只列名称，U4 再补讲，导致“价值标准”出现得太晚。修复：U1 负责目标与底线，U4 只负责真正的取舍与风险。
2. **Reversibility / optionality 重复**：Framework、U2、U4 重复解释。修复：U2 负责生成“延迟 / 小试 / 保留选择权”的 alternatives；U4 只在风险结构里引用，不重新教学。
3. **Learner-facing jargon 偏多**：修复为中文先行，英文只在首次需要精确术语时保留。
4. **Forecasting claim 过宽**：修复 S5，加入 2014 tournament evidence，并明确场景外推边界。
5. **Premortem generalization 过宽**：修复 S8，明确直接证据来自 implementation planning，Learner-facing 仅作 bounded transferable tool。

## Deliberately excluded

- 认知偏差百科全书；
- 用一个 bias label 解释所有错误；
- 所有选择都计算 expected utility；
- 为低价值决定制作复杂决策树；
- 伪精确概率；
- 为“做了很多分析”本身奖励分数；
- 把坏结果自动判成坏决策；
- 为低代价、易撤回的决定制造重流程。
