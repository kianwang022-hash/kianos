# U3｜测量、数据与研究操作：数据不是自然掉进表格里的

科研里很容易把 data 当成：

> 已经存在的事实。

但每个变量都经历：

~~~text
概念
↓
定义
↓
测量
↓
记录
↓
转换
↓
清理
↓
分析
~~~

任何一层都可能改变结果。

---

## 1｜先区分 construct 和 measurement

你想研究：

> frailty、adherence、disease severity、quality of life

这些通常不是直接可见对象。

需要用：

- scale；
- proxy；
- lab；
- code；
- clinician assessment；

把概念 operationalize。

所以变量名看起来一样：

> 实际 construct 可能不同。

---

## 2｜Outcome 定义必须可重复

一个 outcome 要明确：

- what；
- who assesses；
- when；
- data source；
- threshold；
- adjudication；
- competing event；
- repeated event。

“发生 complication”：

> 太模糊。

不同研究者可能编码成不同东西。

---

## 3｜Measurement validity 不是“这个量表很常用”

要问：

- 它测的是目标 construct 吗；
- 在当前 population 验证过吗；
- reliability；
- sensitivity to change；
- ceiling / floor；
- language / cultural adaptation；
- observer dependence。

常用：

> 不自动等于适用。

---

## 4｜Data provenance 要能追到来源

一个数字最好知道：

- original source；
- extract time；
- transformation；
- unit；
- codebook；
- cleaning rule；
- version。

否则后面发现异常时：

> 很难知道问题在哪一层。

---

## 5｜Data dictionary 是研究基础设施

每个变量至少说明：

~~~text
name
meaning
type
unit
allowed values
missing code
source
time window
transformation
derivation
~~~

不要靠：

> 团队里“大家都知道”。

人员一换：

> 隐性知识就丢了。

---

## 6｜Missing data 先问“为什么缺”

Missingness 可能因为：

- random operational loss；
- clinician selectively orders tests；
- severe patients more complete；
- lost follow-up；
- refusal；
- data system change。

所以 missing 不是：

> 单纯统计技术问题。

它常暴露：

> data-generating process。

---

## 7｜Complete-case analysis 会改变研究人群

如果只分析：

> 所有变量完整的人，

最终人群可能和原 target population 不同。

所以要比较：

- included；
- excluded due to missingness；

是否系统不同。

---

## 8｜Cleaning rule 不能事后凭感觉

常见 cleaning 包括：

- impossible values；
- duplicates；
- unit mismatch；
- outliers；
- date inconsistencies；
- repeated records。

规则最好：

> 预先或透明记录。

如果看到结果后才决定：

> “这些 outlier 看起来碍事，删掉”

容易引入 bias。

---

## 9｜Outlier 可能是错误，也可能是重要真实值

不要自动删除。

先问：

- data entry error？
- measurement failure？
- unit error？
- rare but plausible？
- extreme phenotype？

处理方式可以：

- correct；
- exclude with reason；
- robust analysis；
- sensitivity analysis。

---

## 10｜数据转换必须可追溯

例如：

- log transform；
- categorization；
- normalization；
- imputation；
- score construction。

都应能回答：

> 为什么这样做，以及原始数据能否重建。

尤其把 continuous variable 切成 binary：

> 可能损失大量信息。

---

## 11｜Code 和 data 要分层

一个稳的结构可以是：

~~~text
raw data
↓
clean data
↓
analysis-ready data
↓
analysis
↓
figures / tables
~~~

原则：

> **尽量不手工改 analysis-ready 文件。**

让转换由 code 生成。

---

## 12｜版本控制不只属于软件开发

研究中也需要知道：

- protocol v1 / v2；
- dataset version；
- code commit；
- figure version；
- manuscript version。

否则：

> “这个表到底对应哪次分析？”

会变成真实灾难。

---

## 13｜U3 的 measurement / data 卡

~~~text
核心 construct：
变量定义：
measurement tool：
validity：
reliability：
time point：
data source：
provenance：
missingness mechanism：
outlier rule：
cleaning rule：
derived variable：
raw → clean → analysis path：
code version：
data version：
哪些步骤仍然人工：
~~~

数据质量成熟不是：

> 表格很干净。

而是：

> **每个关键数字从哪里来、为什么这样定义、经过了什么变化，都能被追踪。**
