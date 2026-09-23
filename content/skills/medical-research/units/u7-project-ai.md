# U7｜科研项目、协作与 AI 验证：自动化越强，责任越要清楚

现代科研里，AI 可以大幅加速：

- search；
- coding；
- extraction；
- cleaning；
- analysis draft；
- figures；
- writing；
- review。

真正问题已经不是：

> “能不能用 AI？”

而是：

> **哪些环节可以外包，哪些科学判断必须有人真正理解和负责。**

---

## 1｜Project 先有 owner map

至少明确：

- scientific lead；
- data owner；
- analysis owner；
- domain expert；
- statistician / methodologist；
- writing owner；
- ethics / regulatory owner；
- corresponding author。

如果所有人都“参与”：

> 很容易没有人真正负责。

---

## 2｜Milestone 应该对应科学风险，不只对应日期

弱 project plan：

> 10 月写完 paper。

更强：

~~~text
question frozen
↓
protocol approved
↓
data dictionary frozen
↓
primary data QC
↓
primary analysis
↓
sensitivity
↓
interpretation review
↓
manuscript
~~~

这样 delay 的时候能知道：

> 卡的是哪个 scientific dependency。

---

## 3｜Authorship 最好尽早讨论

不要等论文写完：

> 才突然争作者顺序。

当前 ICMJE 仍把 authorship 和：

- substantive contribution；
- drafting / critical revision；
- final approval；
- accountability；

绑定。

所以 authorship 应该：

> 随真实贡献更新。

不是按：

- title；
- hierarchy；
- favor；

自动分配。

---

## 4｜Collaboration 要区分 credit 和 responsibility

一个人可以：

> 提供重要资源，

但不一定适合承担：

> analysis integrity。

另一个人可能：

> 写了 code，

但未参与 scientific interpretation。

最好明确：

> 谁对哪部分能解释、检查和承担责任。

---

## 5｜AI 可以先拿走低价值摩擦

高 ROI 自动化：

- repetitive formatting；
- code boilerplate；
- table generation；
- reference organization；
- data schema checks；
- draft figures；
- search query expansion；
- manuscript language cleanup。

前提：

> 结果可验证。

---

## 6｜AI 不应该替你偷偷做 scientific decisions

高风险外包包括：

- inventing variable definition；
- selecting exclusions after seeing results；
- choosing causal adjustment set without review；
- deciding primary outcome；
- interpreting unexpected effect；
- inventing citation；
- deciding whether a result is clinically meaningful。

这些需要：

> **明确的人类科学责任（human scientific ownership）。**

---

## 7｜AI code 必须像人写 code 一样被 review

至少检查：

- inputs；
- outputs；
- units；
- joins；
- missingness；
- filters；
- leakage；
- test cases；
- edge cases；
- statistical assumptions。

“能运行”：

> 不是正确。

---

## 8｜AI-generated references 默认不可信，直到验证

需要检查：

- reference exists；
- title；
- author；
- year；
- journal；
- DOI；
- claim actually supported。

不要把：

> hallucinated citation

送进 manuscript。

---

## 9｜Confidential data / manuscripts 先看 policy

在上传：

- participant-level data；
- identifiable information；
- unpublished manuscript；
- peer-review manuscript；
- proprietary dataset；

到 AI / external tool 前，

必须看：

- consent；
- IRB / data agreement；
- institution policy；
- journal policy；
- retention / training / privacy terms。

当前 ICMJE 对 reviewer AI 使用也明确有 confidentiality concern。

---

## 10｜AI-generated text 仍然由作者负责

即使 AI：

> 起草一段。

作者仍需负责：

- accuracy；
- citation；
- originality；
- disclosure when required；
- final interpretation。

AI 不是：

> accountable author。

---

## 11｜Research meeting 要围绕 decisions，不只汇报 activity

弱：

> “我这周跑了 20 个模型。”

强：

> “Primary model 暴露了 X 问题；我们现在要决定 outcome definition 是否需要按 protocol clarification 处理。”

会议输出最好是：

- decision；
- owner；
- next evidence；
- deadline；
- unresolved risk。

---

## 12｜U7 的 project / AI 卡

~~~text
scientific owner：
data owner：
analysis owner：
ethics owner：
primary question：
current milestone：
biggest scientific risk：
authorship plan：
AI used where：
AI output verified how：
code reviewer：
reference verification：
confidentiality boundary：
what changed from protocol：
who approved：
next decision：
~~~

AI-native 科研成熟不是：

> **一个人借 AI 做完过去十个人的活。**

而是：

> **自动化大量机械工作，同时让真正的科学判断、责任和可追溯性比以前更清楚。**
