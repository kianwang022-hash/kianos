# U4｜生物统计与结果解释：统计工具服务问题，不替代问题

统计最常见的危险不是：

> 不会高级模型。

而是：

> **把软件输出当成研究结论。**

真正的统计判断需要知道：

- effect；
- uncertainty；
- assumptions；
- data quality；
- design；
- clinical / scientific meaning。

---

## 1｜先看 effect size

假设结果：

> p = 0.001。

第一问仍然应该是：

> **差多少？**

可以是：

- mean difference；
- risk difference；
- risk ratio；
- odds ratio；
- hazard ratio；
- slope；
- correlation；
- calibration / discrimination metric。

统计显著：

> 不告诉你 effect 大不大。

---

## 2｜置信区间（confidence interval）表达精度，不是“真值范围保证”

CI 可以帮助看：

- estimate uncertainty；
- plausible effect range under model assumptions；
- whether clinically important effects remain compatible with data。

不要把 95% CI 机械解释成：

> “真值有 95% 概率在这里。”

频率学派下不是这个含义。

---

## 3｜P value 不回答“hypothesis 为真的概率”

p 值是在：

> null + model assumptions

成立时，观察到当前或更极端数据的相容程度。

它不是：

- P(H0 true | data)；
- replication probability；
- clinical importance；
- causal proof。

---

## 4｜Statistical significance 和 scientific importance 必须分开

大样本研究可以让：

> 很小 effect

变成 statistically significant。

小样本可能有：

> clinically important effect

但 CI 很宽。

所以结果应该同时写：

> magnitude + uncertainty + context。

---

## 5｜Multiple testing 会提高偶然“发现”

如果测试：

> 100 个 outcome / subgroup / model，

只展示：

> 最漂亮几个，

false-positive risk 会明显上升。

需要：

- prespecification；
- multiplicity awareness；
- exploratory labeling；
- correction when appropriate；
- replication。

---

## 6｜Subgroup analysis 特别容易过解释

“男性显著、女性不显著”：

> 不等于男女 effect 一定不同。

真正 subgroup interaction 要：

> 直接检验差异。

而且 subgroup 越多：

> 越需要谨慎。

---

## 7｜Model assumptions 是结果的一部分

例如 regression 可能依赖：

- functional form；
- independence；
- variance assumptions；
- proportional hazards；
- no severe collinearity；
- correct variable specification。

模型跑出系数：

> 不代表这些 assumptions 自动成立。

---

## 8｜Model fit ≠ causal validity

一个 model 可以：

> 拟合得很好。

但如果：

- confounding；
- selection bias；
- data leakage；
- post-treatment adjustment；

存在，

因果结论仍可能错。

统计模型：

> 不能修复所有 design 问题。

---

## 9｜Prediction 要看 validation

预测模型至少关心：

- discrimination；
- calibration；
- internal validation；
- external validation；
- temporal / geographic transport；
- clinical utility。

训练集 AUC 很高：

> 可能只是 overfit。

---

## 10｜Missing data analysis 要和 mechanism 对齐

常见选择包括：

- complete case；
- imputation；
- inverse weighting；
- model-based approaches。

没有一个方法：

> 自动适合所有 missingness。

需要结合：

- why missing；
- percentage；
- variables available；
- sensitivity。

---

## 11｜Sensitivity analysis 是测试结论脆弱度

可以改变：

- exposure definition；
- outcome definition；
- model specification；
- missing-data assumption；
- inclusion criteria；
- lag；
- unmeasured confounding assumption。

如果一个结论：

> 轻微改动就消失，

它的稳健性应该被诚实表达。

---

## 12｜不要把 machine learning 当“高级统计”的同义词

ML 适合很多：

- high-dimensional prediction；
- nonlinear patterns；
- feature interaction；

任务。

但：

> model complexity 不自动提高 scientific value。

需要防：

- leakage；
- overfitting；
- dataset shift；
- opaque preprocessing；
- cherry-picked metrics。

---

## 13｜U4 的 statistics interpretation 卡

~~~text
research question：
estimand：
effect measure：
point estimate：
uncertainty：
clinical / scientific relevance：
p value：
multiple testing：
model assumptions：
missing data：
sensitivity analyses：
subgroups：
prediction or causation：
internal / external validation：
最脆弱 assumption：
哪些结论可以说：
哪些不能说：
~~~

统计成熟不是：

> 会更多模型。

而是：

> **你知道数字能支持多强的结论，以及哪里必须停下来。**
