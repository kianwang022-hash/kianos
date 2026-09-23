# U2｜研究设计、偏倚与因果：设计不是方法名，而是比较为什么可信

说：

> “这是 cohort study。”

并没有告诉你：

> 这个研究是不是可信。

Design 真正解决的是：

> **谁和谁比较、为什么可比、时间从哪里开始、差异还能被什么解释。**

---

## 1｜先区分研究目标

### Descriptive

发生了什么、分布怎样。

### Associational

A 和 B 是否相关。

### Causal

如果改变 A，B 会怎样变化。

### Predictive

给定现在的信息，未来谁更可能发生 B。

### Diagnostic

test 能否区分 target condition。

不同目标：

> 需要不同 design 和 analysis。

---

## 2｜因果问题必须有反事实（counterfactual）思维

真正因果问题隐含：

> 同一个人在接受 A 和不接受 A 时，结果会怎样不同。

现实不能同时观察两个世界。

所以研究设计要找到：

> **可接受的比较组。**

---

## 3｜Randomization 主要解决 allocation confounding

随机化帮助：

> treatment assignment 不由 prognosis 主导。

理论上可平衡：

- measured；
- unmeasured；

baseline factors。

但随机化之后还可能出问题：

- nonadherence；
- crossover；
- missing outcome；
- differential follow-up；
- unblinding；
- selective reporting。

所以：

> RCT 不是自动无偏。

---

## 4｜Observational study 的核心是“为什么这两组可比”

如果没有 randomization，

exposure 往往和：

- disease severity；
- socioeconomic status；
- clinician choice；
- access；
- comorbidity；

同时相关。

这就是：

> confounding 的来源。

调整模型只是：

> 尝试处理。

不是：

> 自动消除所有 confounding。

---

## 5｜Confounder 不是“和 outcome 相关的所有变量”

是否该调整一个变量：

> 取决于 causal structure。

错误调整可能：

- control mediator；
- open collider path；
- introduce bias。

所以变量选择最好来自：

> domain knowledge + causal assumptions。

不是：

> univariate p<0.1 就全部进回归。

---

## 6｜Selection bias 问“谁进入了比较”

可能发生在：

- inclusion；
- loss to follow-up；
- complete-case analysis；
- volunteer participation；
- database availability；
- survival to measurement。

如果进入样本本身受到：

> exposure 和 outcome 共同影响，

比较就可能扭曲。

---

## 7｜Information bias 问“变量怎样被测错”

例如：

- exposure misclassification；
- outcome ascertainment；
- recall；
- coding；
- diagnostic suspicion；
- instrument error。

如果两组 measurement error 不同：

> bias 可能更复杂。

---

## 8｜Time zero 必须对齐

很多 observational research 出错来自：

> exposure 组和 control 组的时间起点不同。

可能造成：

- immortal time bias；
- prevalent-user bias；
- time-varying confounding。

所以要问：

> **eligibility、treatment assignment、follow-up 起点是否逻辑对齐。**

---

## 9｜Target trial 思维可以帮助 observational design

可以先想象：

> 如果能做理想 randomized trial，它的 protocol 会是什么？

包括：

- eligibility；
- treatment strategies；
- assignment；
- follow-up；
- outcome；
- causal contrast；
- analysis。

再看 observational data：

> 哪些部分能 emulate，哪些不能。

这不是让所有研究都叫 target trial。

而是：

> 帮你暴露设计缺口。

---

## 10｜Diagnostic study 不是普通 cohort 换个 outcome

诊断研究还要特别考虑：

- target condition；
- reference standard；
- spectrum；
- verification bias；
- threshold；
- blinding；
- clinical role of test。

高 sensitivity / specificity：

> 也可能因为样本过于理想化而不能外推。

---

## 11｜Prediction model 不等于 causal model

Prediction 关注：

> accuracy / calibration / discrimination。

它可以使用：

> 非因果 predictor。

如果某变量预测很强：

> 不代表干预它就会改善 outcome。

---

## 12｜U2 的 design / bias 卡

~~~text
research objective：
descriptive / association / causal / predictive / diagnostic：
target population：
comparison：
time zero：
follow-up：
target outcome：
主要 confounders：
selection mechanism：
measurement error：
missingness：
censoring：
post-treatment variables：
最大 bias：
为什么这个 design 仍有识别力：
哪个因果结论绝对不能说：
~~~

研究设计成熟不是：

> 知道更多 design 名字。

而是：

> **能解释为什么当前比较有资格回答当前问题。**
