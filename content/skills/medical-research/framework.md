# 医学科研与科学实践｜总框架

科研最危险的误区之一是：

> **会跑统计、会写论文 = 会做研究。**

真正科学实践是：

> **把一个重要但未知的问题，变成一个可检验、可审查、可复核、能诚实表达不确定性的证据生产过程。**

它不是论文工厂。

也不是：

> 把数据塞进软件，等 p<0.05。

---

## 1｜整张地图：研究要过 7 关

| Unit | 真正问题 | 常见假成熟 |
| --- | --- | --- |
| U1 · 科学问题 | 我到底想知道什么，为什么值得知道？ | 先有数据，再找能发的题 |
| U2 · 研究设计 | 我的比较为什么能回答这个问题？ | 会说 RCT / cohort 名字 |
| U3 · 测量与数据 | 数据是怎么被定义、产生和改变的？ | Excel 有列 = 变量可靠 |
| U4 · 统计解释 | 结果有多大、多不确定、依赖什么假设？ | p<0.05 = 真 |
| U5 · 伦理与可重复性 | 研究过程是否值得信、参与者是否被保护？ | 有伦理号 = 伦理完成 |
| U6 · 写作与同行评议 | 别人能否看懂并审查我做了什么？ | 写得漂亮 = 研究质量高 |
| U7 · 项目与 AI | 团队和工具如何提速而不丢科学责任？ | AI / code 跑通 = 结果可靠 |

---

## 2｜母模型：Research 是“问题 → 设计 → 数据 → 推断”链

~~~text
real knowledge gap
↓
research question
↓
target population / exposure / intervention / comparator / outcome
↓
estimand / causal or descriptive target
↓
study design
↓
measurement
↓
data generation
↓
analysis
↓
uncertainty
↓
interpretation
↓
reporting
↓
replication / reuse / next question
~~~

任何一环错了，

后面的高级统计：

> 可能只是把错误算得更精确。

---

## 3｜U1：先确定“我要估计什么”

一个好 question 不只是：

> “A 和 B 有没有关系？”

需要逐渐明确：

- population；
- exposure / intervention；
- comparator；
- outcome；
- time horizon；
- target effect / association；
- why this matters。

这一步本质上是在定义：

> **estimand——真正想估计的量。**

如果 estimand 不清楚，

不同分析可能回答：

> 不同问题。

---

## 4｜文献检索在这里的作用是定位 gap

Information Research 已经负责：

> 怎么搜、怎么看来源。

Medical Research 更关心：

> **现有证据以后，还缺哪一块真正值得研究。**

文献定位要回答：

- 已经知道什么；
- 哪些结果冲突；
- 哪个人群没研究；
- 哪个 outcome 没测；
- 哪个 design 解决不了 bias；
- 哪个 clinical problem 仍然没有可行动答案。

不是：

> 找 20 篇 paper 证明“这个领域很重要”。

---

## 5｜U2：Design 是 identification strategy

研究设计不是标签。

“回顾性队列”本身：

> 不保证 causal validity。

真正要问：

> **为什么这个比较能够接近我想知道的 counterfactual / target？**

需要考虑：

- selection；
- confounding；
- measurement；
- time；
- censoring；
- missingness；
- intervention adherence；
- outcome ascertainment。

---

## 6｜随机化解决的是一部分问题

Randomization 可以帮助：

> 平衡已知和未知 confounders 的分配。

但 RCT 仍可能受：

- loss to follow-up；
- nonadherence；
- missing outcomes；
- unblinding；
- protocol deviation；
- selective reporting；
- poor measurement；

影响。

所以：

> RCT ≠ 自动高质量。

---

## 7｜U3：数据是研究流程产物

一列：

> blood_pressure

看起来像客观事实。

但背后可能有：

- measurement device；
- patient state；
- posture；
- time；
- repeat rules；
- missingness；
- data entry；
- unit conversion；
- cleaning。

所以数据科学第一问不是：

> 用什么模型。

而是：

> **这个数是怎么来的。**

---

## 8｜U4：统计首先描述 effect 和 uncertainty

一个结果至少要问：

- effect size；
- direction；
- confidence / uncertainty；
- clinical relevance；
- model assumptions；
- multiplicity；
- missing data；
- robustness。

p value 只能回答：

> 某种模型和假设下，数据和 null 的不相容程度。

它不能直接告诉你：

- effect 大不大；
- clinical importance；
- true probability；
- replication probability；
- causality。

---

## 9｜Prediction 和 causation 是不同任务

Prediction 问：

> 谁会发生 outcome？

Causal inference 问：

> 如果改变 exposure / intervention，outcome 会怎样变？

一个模型预测很准：

> 不代表里面的 feature 是好的 intervention target。

反过来：

> 一个重要 causal factor

也不一定提升 prediction 很多。

---

## 10｜U5：Ethics 和 rigor 是同一条科学链

Helsinki 2024 继续强调：

- participant rights；
- informed consent；
- privacy；
- ethics review；
- scientific rigor；
- registration；
- result dissemination。

一个设计很差、没有知识价值的研究：

> 也可能构成伦理问题。

因为参与者承担了风险和负担，

却没有产生足够可靠知识。

---

## 11｜Reproducibility 不是“上传一个代码文件”

最低可追溯性包括：

- data provenance；
- code；
- software / package versions；
- analysis decisions；
- exclusions；
- transformations；
- random seeds when relevant；
- output generation；
- protocol changes。

别人运行不了：

> 可能是问题。

别人运行得了：

> 也不代表研究设计正确。

---

## 12｜U6：Reporting guideline 不是质量认证

CONSORT、STROBE、PRISMA、STARD、TRIPOD 等：

> 帮助透明报告。

它们不是：

> 研究设计自动合格证。

一项 biased study：

> 可以被完整报告。

所以 reporting quality 和 methodological quality：

> 要分开。

---

## 13｜U7：AI 可以自动很多科研工作，但不能洗掉责任

AI 可以帮助：

- search；
- coding；
- data cleaning；
- plotting；
- draft；
- reference formatting；
- extraction；
- simulation。

但重要 Native Core 仍包括：

- question；
- estimand；
- design；
- variable meaning；
- causal assumptions；
- statistical interpretation；
- error detection；
- ethics；
- authorship accountability。

如果你不能解释：

> AI 为什么这样分析，

那你还没有真正拥有这个结论。

---

## 14｜当前 reporting / publication 标准必须 current-first

这类内容会更新。

截至当前：

- SPIRIT / CONSORT 已有 2025 更新；
- ICMJE Recommendations 当前为 2026-01 更新；
- Declaration of Helsinki 当前官方版是 2024；
- reporting guideline 要从 EQUATOR 等当前库检查。

所以永久 Skill 只记：

> **先识别 study type，再查当前 reporting / ethics / registration 标准。**

---

## 15｜最终只记住这 7 句

~~~text
1. 我真正想知道的科学问题和 estimand 是什么？
2. 这个 design 为什么能回答它，最可能的 bias 在哪里？
3. 每个关键变量是怎样被定义、测量和进入数据的？
4. 结果到底有多大、多不确定，依赖哪些 assumptions？
5. 研究参与者、protocol、registration 和 reproducibility 是否经得起检查？
6. 我的论文是否让别人看得见方法、局限和替代解释？
7. AI 和团队替我完成了什么，我本人仍然对哪些科学判断负责任？
~~~

科研成熟不是：

> **论文越来越多。**

而是：

> **你越来越能产生别人可以检查、相信、复用和推翻的知识。**
