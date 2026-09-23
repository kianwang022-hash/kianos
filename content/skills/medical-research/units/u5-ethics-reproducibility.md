# U5｜临床研究、伦理与可重复性：科学价值必须和参与者保护一起成立

医学研究不是：

> **只要结果有价值，就值得做。**

涉及人类参与者时，

科学价值、风险、同意、隐私、伦理审查和透明报告：

> 是同一个研究系统。

---

## 1｜Scientific validity 本身是伦理条件

如果一个研究：

- 问题不清；
- design 无法回答问题；
- sample 完全不足；
- measurement 无效；
- analysis 明显错误；

参与者即使承担的风险很小，

研究也可能缺乏足够伦理价值。

因为：

> **负担被消耗，却没有产生可靠知识。**

---

## 2｜Helsinki 2024 是 current-first 的伦理参考

当前官方 Declaration of Helsinki 是：

> 2024 版。

它继续强调：

- participant rights；
- dignity；
- autonomy；
- privacy / confidentiality；
- ethics review；
- informed consent；
- scientific rigor；
- registration；
- dissemination。

具体适用：

> 还要叠加当地法律、机构和 ethics committee 要求。

---

## 3｜Informed consent 不是签字

真正 consent 需要：

- adequate information；
- understandable language；
- voluntary choice；
- capacity；
- right to refuse / withdraw；
- risk / benefit；
- data / sample use；
- conflicts / funding when relevant。

签了表：

> 不代表一定真正 informed。

---

## 4｜Clinical care 和 research 要分清

患者可能天然认为：

> “医生让我参加，所以一定是最适合我的治疗。”

这可能产生：

> therapeutic misconception。

研究人员应让参与者理解：

- 哪些是 research；
- 哪些是 standard care；
- uncertainty；
- randomization when present；
- alternatives。

---

## 5｜Privacy / data use 是 research design 的一部分

需要提前定义：

- identifiable / coded / de-identified；
- access；
- storage；
- sharing；
- retention；
- secondary use；
- transfer；
- breach handling。

不要等：

> 数据收完以后

才想：

> “能不能上传云端给模型跑。”

---

## 6｜Registration 用于让计划在结果前留下痕迹

临床试验 registration 的价值之一：

> 减少 selective visibility。

Helsinki 2024 要求人类参与者医学研究在首位参与者 recruitment 前进入公开数据库。

具体法律 / funder requirements：

> 必须 current-first。

---

## 7｜Protocol deviation 不一定等于 misconduct

真实研究会出现：

- recruitment slower；
- device unavailable；
- protocol clarification；
- participant safety issue；
- unexpected operational constraint。

关键是：

- document；
- justify；
- approve when required；
- distinguish planned vs post hoc；
- report transparently。

隐藏 deviation：

> 才会让结果解释失真。

---

## 8｜Reproducibility 至少有几层

### Computational

同一数据 + 同一代码：

> 能不能得到同一结果。

### Analytic

同一数据：

> 独立分析者用合理方法是否得到相近结论。

### Replication

新的数据 / study：

> 是否支持原结果或推断。

这些概念不要混在一起。

---

## 9｜可重复流程最好一键重建主要结果

理想结构：

~~~text
raw
↓
clean script
↓
analysis-ready
↓
analysis script
↓
tables / figures
↓
manuscript outputs
~~~

尽量减少：

> 手工复制数字。

否则 manuscript 里的结果：

> 可能和最新 analysis 不一致。

---

## 10｜Environment 也属于 reproducibility

代码可能依赖：

- R / Python version；
- package version；
- OS；
- random seed；
- external data；
- API；
- model version。

如果环境不可追踪：

> 同一 code 也可能产生不同 output。

---

## 11｜Negative / inconclusive results 也是科学结果

如果只发表：

> positive findings，

整个 literature 会被扭曲。

Helsinki 2024 也明确强调：

> negative / inconclusive 和 positive results 都有 dissemination 义务。

所以“没显著”：

> 不是“研究失败”。

可能意味着：

- effect small；
- uncertainty large；
- question constrained；
- design insufficient；
- hypothesis unsupported。

---

## 12｜U5 的 ethics / reproducibility 卡

~~~text
human participants：
scientific value：
risk / burden：
ethics approval：
consent：
privacy：
data access：
registration：
protocol version：
deviations：
analysis plan：
code：
environment：
data provenance：
result dissemination：
negative results：
什么必须 current-first 查：
~~~

研究治理成熟不是：

> 文件齐了。

而是：

> **任何关键决策、数据变化和责任边界都有可追踪证据。**
