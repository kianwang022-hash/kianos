# Objective｜Reading A / Cloze / Part B 第一次学习主干

> **目标**：不是背题型技巧，而是学会在有限时间里做出有证据的选择。  
> **怎么用**：先看共同 Global Map，再进入对应题型。已经稳定会做的部分可以直接跳过；真实题卡住时再回到相应节点。  
> **三种题不是同一种阅读题**：Reading A 判断选项命题，Cloze 判断 slot 的 best fit，Part B 重建篇章关系。  
> **Fast Track**：会的直接跳，内容完整不等于必须线性读完。

---

<a id="global-map"></a>
# A｜Objective Global Map：客观题真正训练什么

客观题不是：

> 看懂大概意思 → 凭感觉挑一个最顺眼的答案。

共同骨架是：

```text
INPUT
文章 / 局部上下文 / 题目 / 候选
↓
REPRESENT
先把当前真正需要理解的语言、命题和关系搭准
↓
DEMAND
现在到底缺什么 / 问什么 / 要完成什么角色？
↓
CANDIDATES
真正有竞争力的是谁？
↓
EVIDENCE / CONSTRAINTS
哪些证据支持、限制或排除它们？
↓
ADJUDICATE
哪个差异真正决定胜负？
↓
EXECUTE
有足够证据就做决定，然后离开
```

三种题共用这条骨架，但**决策对象完全不同**：

| 题型 | 你真正判断的东西 | 核心问题 |
| --- | --- | --- |
| **Reading A** | option proposition | 哪个选项最忠实地待在文本证据边界内？ |
| **Cloze** | slot + candidate | 在所有有效 constraints 下，哪个候选是 best fit？ |
| **Part B** | discourse map | 哪个候选完成当前位置/目标需要的篇章角色，并让整张图继续成立？ |

所以不要把三个题型压成一句“定位原文找同义替换”。

---

## A1｜先判断：是语言没搭准，还是题型动作没做对

一道题错了，最先问：

```text
当前关键句 / 段我真的理解了吗？
├─ 没有
│  → 先解决词义、scope、reference、relation、篇章推进
└─ 理解基本够用
   ↓
我知道这道题真正要求什么吗？
├─ 不知道 → Demand 问题
└─ 知道
   ↓
我能指出决定答案的 evidence / constraint 吗？
├─ 不能 → Evidence / Constraint 问题
└─ 能
   ↓
我是否比较了真正竞争的候选？
├─ 没有 → Adjudication 问题
└─ 有 → 再看 execution / one-off slip
```

这比先给错误贴“推断题错了 / 完形词义错了 / 新题型错了”的标签更有用。

词义、搭配、构式等长期知识继续回 LexicalOS；Objective 只负责当前题里的调用与决策。

---

## A2｜题型标签只是导航，不是答案生成器

老师常见目录：

```text
细节题
推断题
主旨题
态度题
词义题
……
```

这些名称能描述题目，但未必解释为什么做错。

同样是 inference，真实失败可能分别是：

- `may` 被读成 `must`；
- evidence range 找太窄；
- 把例子扩大成普遍规律；
- 两个 option 都理解了，却没比较谁多说了一步。

所以第一次学习更应该形成**决策动作**，而不是背一整套题型口诀。

---

## A3｜稳定正确的题，不欠一轮解析

如果一篇 / 一组题：

```text
答案稳定正确
+
没有实质 uncertainty
+
过程没有明显异常
```

就可以：

```text
PASS → NEXT
```

正确题不是自动学习债务。

Wrong / unanswered / meaningful uncertain 才提示你：这里可能值得回看 decisive difference。

---

## A4｜Fast Track：内容写全，但不强迫线性读完

如果你已经能稳定做到：

```text
知道当前 demand
+
能指出 decisive evidence / constraint
+
能解释真实竞争项为什么分胜负
+
知道什么时候该停
```

对应 Core Block **可以直接跳过**。

真实题以后暴露具体 friction，再回来查相应 Skill Content。

---

<a id="reading-a"></a>
# B｜Reading A：Evidence Adjudication

Reading A 的核心不是“找到原文”，而是：

> **把题目要求、文本证据和选项命题对齐，判断哪个选项没有越过文本允许的边界。**

```text
TEXT REPRESENTATION
↓
QUESTION DEMAND
↓
DECISIVE EVIDENCE
↓
OPTION PROPOSITIONS
↓
BOUNDARY / CONTRAST
↓
ADJUDICATION
↓
STOP
```

高分区最常见的陷阱不是完全看不懂，而是：

> **文本只说到这里，错误选项偷偷多走了一步。**

---

<a id="ra-core-1"></a>
## B1｜Question Demand：先确定“我要判断什么”

### 核心问题

题干不是一个标签，而是对 evidence 的需求说明。

做题前先压成：

```text
对象是谁 / 什么？
↓
要判断事实、原因、态度、功能、关系，还是推断？
↓
合法 evidence range 在哪里？
↓
允许直接复述，还是允许受控推断？
```

### 题型标签 ↔ 真正 demand

| 表面题型 | 真正要锁定的 demand |
| --- | --- |
| Detail | 哪个具体 proposition 被文本直接承担？ |
| Inference | 哪个未逐字出现的 proposition 被证据充分支持，但没有越界？ |
| Why / Cause | 原文真正承担的原因是什么，而不是相关背景是什么？ |
| Purpose / Function | 作者为什么在这里提 X，它在段落中起什么作用？ |
| Attitude | 谁对什么对象持什么 stance，强度多大？ |
| Main Idea | 哪个 proposition 覆盖全文/段落的合法 scope，而不是某个强烈局部？ |

### Demand Drift｜做着做着别把题换掉

题目问：

```text
Why does the author mention X?
```

你可能找到了一段准确描述 X 的文字，然后选了“X 是什么”。

信息是真的，但回答了另一个问题。

当两个选项都像答案时，先重新说一遍：

> **这道题到底要求我判断什么？**

如果一个选项内容正确却没完成 demand，它仍然不是答案。

> **带走：先锁 demand，再评价 evidence。**

---

<a id="ra-core-2"></a>
## B2｜Decisive Evidence & Boundary：相关，不等于决定答案

### 三层定位

```text
TOPIC MATCH
找到同一个主题
<
RELEVANT REGION
找到相关句群
<
DECISIVE EVIDENCE
找到真正把竞争项分开的最小充分证据
```

很多“定位错误”其实已经到了正确段落，只是还停在 relevant region，没有缩到真正决定答案的 qualification / scope / relation。

### 什么叫 decisive

> **再删一点，就无法可靠分出竞争项；再加很多，只会增加噪声。**

有时是一句；有时必须连前一句的 antecedent 或下一句的 qualification 一起看。

### Evidence Boundary｜选项不能比原文承担更多

原文：

> The approach may help some users under limited conditions.

| 原文承担 | 选项偷走的一步 | 问题 |
| --- | --- | --- |
| may help | will help | modality 强化 |
| some users | all users | scope 扩大 |
| limited conditions | most situations | condition 扩大 |
| 没说谁偏好它 | researchers prefer it | 新增 attribution |

可以把错误项想成：

```text
TEXT SUPPORT = X

错误项可能是：
X + stronger degree
X + broader scope
X + new cause
X + new attribution
X + different condition
```

### Negative Evidence｜“没被文本承担”本身就是证据

有些错误项找不到一句原文直接反驳它。

但如果它引入：

- 新因果；
- 新态度；
- universal claim；
- 新主体；
- 新条件；

而文本从未承担，那么它已经越过 evidence boundary。

> **带走：答案不仅要“相关”，还必须待在文本许可范围内。**

---

<a id="ra-core-3"></a>
## B3｜Option Proposition：不要把选项当“意思差不多的一句话”

一个选项可以拆成：

```text
ENTITY / SUBJECT   谁？
PREDICATE          发生什么 / 被判断为什么？
OBJECT             作用到谁 / 什么？
SCOPE / QUANTITY   范围多大？
DEGREE / MODALITY  强度多高？
RELATION           因果 / 比较 / 条件 / 归属是什么？
TIME / CONDITION   什么时候成立？
ATTRIBUTION        谁承担这个观点？
```

两个选项词面可能很像，但只要其中一个字段变了，命题就已经不同。

### 高频 shift families

| Shift | 常见偷换 |
| --- | --- |
| Entity / Object | 主体或对象被换掉 |
| Scope / Quantity | `some` → `most / all` |
| Degree / Modality | `may` → `will`；`tend to` → `always` |
| Cause / Relation | 同现 / 条件 / 顺序 → 因果 |
| Attribution | 研究者观点 → 作者观点；转述 → 赞同 |
| Time / Condition | 特定情境 → 一般情况 |
| Local → Global | 某段 / 某群体 → 全文 / 所有人 |
| Example → Claim | 个案 → 普遍规律 |
| True but Irrelevant | 内容正确，却没回答 demand |

### Paraphrase 不等于词面重合

正确项可能换掉大量词，却保持同一 proposition。

错误项也可能复用原文大量词，只偷偷改一个 scope / cause / subject。

所以 authority 永远是：

> **意义结构是否等价，而不是词面重合多少。**

> **带走：两个选项都像时，问“哪个字段变了”。**

---

<a id="ra-core-4"></a>
## B4｜Adjudication：不要平均分析四个选项

真实做题通常不是：

```text
A 全面分析
B 全面分析
C 全面分析
D 全面分析
```

更高效的是：

```text
4 options
↓
淘汰明显不满足 demand / evidence 的
↓
留下 2 个真实竞争项
↓
找 winning difference
↓
回 decisive evidence 验证
↓
选择
```

### Supported ↔ Plausible

```text
现实中说得通
≠
当前文本支持
```

错误项常常非常合理，只是需要额外假设。

当两项都 plausible 时，问：

> **哪一个需要文本没给出的那一步？**

### Competition Test

不要继续找相同点。

```text
两项到底差在哪个字段？
↓
这个差异文本承担得起吗？
↓
谁多说了一步？
```

### 改答案：必须有新 evidence

第一次选择已有明确证据时：

> **没有新的决定性 evidence，不因为“另一个更像”而改。**

值得改的真正新证据包括：

- 忽略的 qualification；
- reference 重新解析后主体变了；
- 找到直接 contradiction；
- 发现选项回答了不同 demand；
- 原先 evidence range 太窄 / 太宽。

### Stop Rule

当你能说出：

```text
question demand
+
decisive evidence
+
real competitors 的 winning difference
```

就离开这题。

---

<a id="ra-skill-map"></a>
## B5｜Reading A Skill Map：卡住时查地址

```text
RA1 Question Demand
   ├─ requested entity / proposition
   ├─ evidence range
   ├─ purpose / function
   └─ inference boundary

RA2 Evidence
   ├─ relevant region
   ├─ minimal decisive evidence
   ├─ cross-sentence evidence
   └─ evidence boundary

RA3 Option Proposition
   ├─ entity / object
   ├─ scope / quantity
   ├─ degree / modality
   ├─ relation / cause
   ├─ attribution
   └─ time / condition

RA4 Option Competition
   ├─ supported vs plausible
   ├─ true-but-irrelevant
   ├─ local-to-global
   ├─ example-as-claim
   └─ over-inference

RA5 Discourse
   ├─ stance / attitude
   ├─ paragraph function
   ├─ claim / evidence
   └─ cross-sentence relation

RA6 Execution
   ├─ evidence return
   ├─ answer switching
   ├─ uncertainty triage
   └─ stop rule
```

Skill Map 不是第一次学习清单。

---

<a id="ra-skill-boundary"></a>
### Deep｜Evidence Boundary：抓住选项最“敢说”的词

高风险词常包括：

```text
all / only / must / mainly / cause / always / completely
most / primary / inevitable / prove / prevent / prefer
```

看到它们，不是自动判错，而是问：

> **文本真的承担得起这个强度和范围吗？**

高分区错误项经常只比正确项多一个隐藏承诺：

```text
can → will
one reason → the main reason
associated with → caused by
some → most
```

---

<a id="ra-skill-cause"></a>
### Deep｜Cause / Relation Shift：一起出现，不等于因果

```text
A appears with B
≠ A causes B

A is required when B happens
≠ A produces B

A followed B
≠ A resulted from B
```

当 option 出现 `because / lead to / result in / due to / responsible for` 这类强因果时，回原文检查：

> **因果是文本承担的，还是选项自己加的？**

---

<a id="ra-skill-attribution"></a>
### Deep｜Attribution Shift：同一个观点，换个人说就变了

观点可能来自：

```text
author
researchers
critics
participants
quoted expert
hypothetical opponent
```

选项可以把真实观点放到错误的人头上。

态度 / 观点题被卡住时，加一句：

> **这句话到底是谁承担的？作者是在赞同、转述、限定还是反驳？**

---

<a id="ra-skill-local-global"></a>
### Deep｜Local → Global / Example → Claim

局部证据只自动支持局部结论。

```text
一个案例
≠ 一般规律

某个群体
≠ 所有人

某段限制
≠ 全文主旨

引用他人观点
≠ 作者最终立场
```

判断时问：

> **这个 evidence 的合法 scope 到底是这一句、这一段、这个群体，还是整篇？**

---

<a id="ra-skill-true-irrelevant"></a>
### Deep｜True but Irrelevant：正确事实，也可能是错误答案

一个 distractor 可以完全符合原文，却没有满足当前 question demand。

判断顺序：

```text
先问：它回答题目了吗？
↓
再问：它被 evidence 支持吗？
```

不要反过来。

---

<a id="ra-execution"></a>
### Reading A｜Exam Compression

熟练后压成：

```text
问什么？
→ 哪段 evidence 真正决定？
→ 两个真实竞争项差在哪？
→ 谁多说了一步？
→ 有证据就走
```

一篇稳定 5/5、无 meaningful uncertain，就直接 PASS。

---

<a id="cloze"></a>
# C｜Cloze：Slot Constraints → Best Fit

Cloze 不是二十道独立词义题。

真正任务是：

```text
PASSAGE CONTEXT
↓
SLOT DEMAND
这个位置需要什么？
↓
ACTIVE CONSTRAINTS
哪些限制正在起作用？
↓
REAL COMPETITORS
真正有竞争力的是哪两三个候选？
↓
DECISIVE CONSTRAINT
哪条证据把它们分开？
↓
BEST FIT
不是“能放”，而是“最合适”
```

看到选项之前，不需要猜出精确原词。

真正有价值的是：

> **脑中已经知道这个空大概需要什么角色。**

---

<a id="cl-core-1"></a>
## C1｜Slot Demand：先问“这个空缺什么”

不要先问：

> A / B / C / D 哪个中文意思最顺？

先问：

```text
语法上允许什么？
↓
语义上缺什么角色？
↓
前后 proposition 是什么关系？
↓
粗糙描述：这个 slot 应该补什么？
```

### 三类常见 demand

| Demand | 你真正缺的东西 |
| --- | --- |
| **Content Demand** | 某类动作 / 状态 / 评价 / 对象 |
| **Relation Demand** | cause / contrast / concession / addition / condition / example... |
| **Grammatical-role Demand** | 特定词性 / construction slot / government pattern |

例如：

> The policy looked efficient on paper, ___ it created unexpected costs in practice.

最先要知道的不是 `but / yet / however` 谁是答案，而是：

```text
前：理论上高效
后：实际制造新成本
→ 这里需要 CONTRAST
```

只要 demand 先成形，很多候选已经自动降权。

> **带走：先形成 slot demand，再让候选进入竞争。**

---

<a id="cl-core-2"></a>
## C2｜Constraint Stack：答案不是靠一个 clue 猜出来的

一个空可能同时受多层限制：

```text
L1  LEXICAL / COLLOCATION
词义、搭配、semantic preference
↓
L2  SYNTAX / CONSTRUCTION
词性、支配、构式、固定框架
↓
L3  SENTENCE PROPOSITION
放进去以后整句到底在说什么
↓
L4  INTER-SENTENCE RELATION
和前后句是什么逻辑关系
↓
L5  GLOBAL DISCOURSE
是否符合整篇推进方向
```

不是每空都从 L1 查到 L5。

真正问题是：

> **现在分胜负的 constraint 在哪一层？**

### Construction 可能直接结束竞争

如果当前结构已经明确要求：

- 特定 preposition；
- verb government；
- correlative construction；
- argument structure；
- fixed phrase；

就不必为了“上下文意识”继续把全篇拉进来。

### Collocation ≠ Semantic Preference

```text
collocation
哪些词自然经常一起出现

semantic preference
这个词通常喜欢什么语义类型的主语 / 宾语 / 情境
```

两个中文都译成“导致”的词，可能因为主语角色不同而只有一个真正适合当前 slot。

> **带走：用最先足够 decisive 的 constraint 停止搜索。**

---

<a id="cl-core-3"></a>
## C3｜Candidate Competition：Possible 不是 Best Fit

真实做题常是：

```text
4 candidates
↓
明显不合适项快速退出
↓
2 real competitors
↓
找 decisive difference
↓
1 best fit
```

### Near-synonym competition

当两项中文差不多时，别继续翻中文。

```text
它们共同覆盖什么意义？
↓
真正不同的使用条件是什么？
↓
当前 slot 触发了哪个区别？
```

高价值差异可能来自：

- argument / object type；
- construction / preposition；
- register；
- semantic role；
- semantic prosody；
- local vs discourse fit。

### Possible < Context-compatible < Best-supported

```text
能组成合法句子
        <
放在当前上下文说得通
        <
同时满足最多 decisive constraints
```

所以“两个都能放”不是终点，而是在提示：

> **还有哪一条 constraint 没检查？**

> **带走：不要平均解释四项，只解释真正竞争的差异。**

---

<a id="cl-core-4"></a>
## C4｜Passage Execution：别让一个空拖死整篇

### 主线

```text
快速建立 passage direction
↓
每空先形成 demand
↓
简单空直接走
↓
真竞争空找 decisive constraint
↓
证据不足才扩大上下文
↓
仍不确定就标记并继续
↓
整篇结束后回看高价值冲突
```

### Context Expansion Ladder

卡住时按最小范围向外扩：

```text
slot phrase
↓
current sentence
↓
adjacent sentence(s)
↓
paragraph / local discourse
↓
whole passage
```

每扩大一级都问：

> **新范围是否增加了真正能分胜负的 constraint？**

没有，就不要继续无限扩。

### Stop Rule

当你能说出：

```text
slot demand
+
real competitors
+
one decisive constraint
+
best candidate clearly outranks rivals
```

就离开这个空。

---

<a id="cl-skill-map"></a>
## C5｜Cloze Skill Map：后续诊断地址

```text
CL1 Slot Demand
   ├─ lexical / content demand
   ├─ relation demand
   └─ grammatical-role demand

CL2 Lexical Constraint
   ├─ sense competition
   ├─ collocation
   ├─ semantic preference
   └─ confusable

CL3 Construction Constraint
   ├─ government
   ├─ phrase / frame
   └─ syntax compatibility

CL4 Proposition Fit

CL5 Discourse Relation
   ├─ contrast / concession
   ├─ cause / result
   ├─ condition
   ├─ example / specification
   └─ continuation / progression

CL6 Candidate Competition
   ├─ near-synonym contrast
   ├─ local-possible vs best-fit
   └─ decisive-constraint selection

CL7 Execution
   ├─ context expansion
   ├─ uncertainty triage
   └─ stop rule
```

---

<a id="cl-skill-best-fit"></a>
### Deep｜Local-possible vs Best-fit

当一个候选只是“中文顺”，另一个同时满足：

```text
collocation
+
proposition
+
discourse relation
```

它们不应继续保持同等权重。

> **“都可以”通常意味着还有 constraint 没被调用。**

---

<a id="cl-skill-collocation"></a>
### Deep｜Collocation vs Near-synonym

近义不等于可互换。

稳定区分至少看：

```text
argument / object type
register
semantic role
typical frame
preposition / complement
semantic prosody
```

长期词汇知识仍回 LexicalOS；Cloze 只负责把真实 competition 暴露出来。

---

<a id="cl-skill-relation"></a>
### Deep｜Discourse Relation：先看 proposition，再看连接词

relation blank 的 authority 不是中文释义，而是两个 proposition 为什么连在一起。

```text
cause vs explanation
contrast vs concession
condition vs sequence
example vs restatement
addition vs progression
```

先把左右命题各压成一句，再判断关系，最后才选 marker。

---

<a id="cl-execution"></a>
### Cloze｜Exam Compression

熟练后压成：

```text
这个空要什么？
→ 真正两个竞争项是谁？
→ 哪条 constraint 分胜负？
→ 不够就只扩大一级上下文
→ 有 decisive evidence 就走
```

---

<a id="reading-b"></a>
# D｜Reading B / Part B：Discourse Reconstruction

Part B 不是关键词配对，也不是 Reading A 换了个界面。

它的稳定核心是：

```text
WHOLE MATERIAL
↓
DISCOURSE SKELETON
材料整体怎样推进？
↓
TARGET DEMAND
这个 gap / paragraph / slot / comment 现在缺什么？
↓
CANDIDATE ROLE
候选真正承担什么功能 / proposition？
↓
COHESION EVIDENCE
reference / relation / chronology / lexical chain 能支持什么？
↓
GLOBAL RECONCILIATION
选完以后整张 map 仍然成立吗？
```

但是 Part B 有四种真实 form，**target demand 并不相同**。

### 四种 form 一眼区分

| Form | 你在给谁找什么 | Decisive evidence | 最常见误区 |
| --- | --- | --- | --- |
| **Gap Matching** | 给篇章中的空位找能完成桥接的候选段/句 | backward role + forward role + global fit | 只看前一句关键词 |
| **Heading Matching** | 给完整段落找最能概括其中心 proposition / function 的 heading | whole-paragraph dominant claim / role | 用一个细节词命中标题 |
| **Paragraph Ordering** | 把候选段落放入整体顺序 / skeleton | fixed givens + adjacency + chronology/reference + whole-chain coherence | 两段局部顺就锁死 |
| **Comment–Statement Matching** | 给人物/comment 找语义对应的 statement | commentator proposition / stance / reason / boundary | 共享主题词，却 attribution 不对 |

共同对象仍然是 discourse reconstruction；区别只是“当前位置/目标到底缺什么”。

---

<a id="rb-core-1"></a>
## D1｜Discourse Skeleton：先看材料往哪里走

第一次扫材料，不需要给每段贴学术标签。

只要形成粗骨架：

```text
提出问题
→ 解释原因
→ 给例子
→ 转折 / 限制
→ 提出方案
→ 总结 / 推论
```

高价值关系包括：

```text
claim → evidence
general → example
problem → solution
cause → consequence
contrast / concession
chronology
question → answer
old information → new information
misconception → correction
position → qualification
```

Skeleton 不是全文摘要。

> **只保留会改变 placement / matching 的结构节点。**

### 不同 form 里 Skeleton 的作用

```text
Gap Matching
→ 预测 gap 前后需要什么桥

Heading Matching
→ 判断每段在整篇里承担的 dominant role

Paragraph Ordering
→ 建立 whole-chain sequence 和 hard anchors

Comment Matching
→ 看不同评论围绕同一主题分别承担什么 stance / claim
```

> **带走：先看文章怎样推进，再看候选词面像不像。**

---

<a id="rb-core-2"></a>
## D2｜Target / Position Demand：先判断“这里缺什么角色”

这一块在四种 form 里有不同形状。

### Gap Matching｜这个空需要怎样的桥

先暂时不看候选：

```text
前面刚完成什么？
+
后面马上要做什么？
↓
这里必须承担什么 bridge role？
```

例如：

```text
general claim
→ GAP
→ concrete example
```

Gap 很可能需要：引出 example、把 general claim 过渡到 concrete case，或者本身就是 example-opening。

只和前句接得上，不够；它还必须把后句准备好。

### Heading Matching｜这一整段“主要在干什么”

Heading 不是给段落找一个出现过的关键词。

压缩顺序：

```text
这段主要断言什么？
↓
哪几句只是 support / example / detail？
↓
如果删掉细节，剩下的 dominant proposition / role 是什么？
```

高风险 heading：

```text
太窄
只覆盖一个例子 / 数字 / 小细节

太宽
主题相关，但比本段承担的 scope 更大

词面很像
复用了段落关键词，却没概括段落真正的 claim
```

Heading authority 是**整段的中心意义**，不是词频。

### Paragraph Ordering｜这个 slot 前后需要什么 sequence relation

Ordering 有 fixed givens 时，先把它们当 hard anchors：

```text
FIXED A
↓
unknown slots
↓
FIXED B
```

每个待放 paragraph 不只问“和前面顺不顺”，还要问：

```text
它从前面接来了什么 old information？
它为后面建立了什么 new information？
chronology / reference / cause / contrast 是否连续？
```

### Comment–Statement Matching｜这个人到底承担什么 proposition

先把每个 comment / speaker 压成：

```text
WHO          谁在说？
CLAIM        他真正主张什么？
STANCE       支持 / 质疑 / 限定什么？
REASON       为什么？
BOUNDARY     他没有说到哪里？
```

再去看 statement candidate。

主题相同，不代表 attribution 相同。

> **带走：Part B 先判断 target demand，再让 candidate 进入。**

---

<a id="rb-core-3"></a>
## D3｜Candidate Role & Cohesion：候选不是关键词袋

每个 candidate 先压成两件事：

```text
它在说什么？
+
它想在篇章里做什么？
```

常见 role：

- 提出 claim；
- 解释原因；
- 举例；
- 修正 / 限定前文；
- 转折；
- 总结；
- 引出 solution；
- 承接 reference；
- 承上启下。

### Cohesion 只是 evidence，不是 authority

可以利用：

```text
pronoun / reference
lexical chain
repetition / synonymy
connective
topic continuity
tense / chronology
definite / given information
parallel structure
```

但：

> **“接得上”只证明局部可行，不证明这里就是最佳位置 / 最佳匹配。**

### Reference Chain｜高价值硬约束

`this / these / such / they / the problem / this approach` 常常很有价值。

但 antecedent 不是“最近名词优先”这么简单：

```text
grammatical candidate
+
semantic role
+
forward coherence
```

三者都要成立。

### Heading candidates｜不是每个词都同权

Heading candidate 应压成一个短 proposition，而不是几个 topic words。

比如：

```text
"The limits of rapid expansion"
```

不是只看 `rapid / expansion` 有没有出现在段落里，而要看：

> 这段的 dominant move 真的是在讨论 expansion 的 **limits** 吗？

### Comment candidates｜先守 attribution

两个人可能都谈 technology，但：

```text
A：认为工具有用，但必须保留人工判断
B：认为真正问题不是工具，而是机构不愿改变流程
```

主题词高度重合，proposition 却完全不同。

> **带走：关键词只能告诉你“可能相关”，role / proposition 才能决定匹配。**

---

<a id="rb-core-4"></a>
## D4｜Global Reconciliation：Part B 最终判断的是整张 map

每完成一个高置信选择，约束都会变化：

```text
candidate 被使用
↓
剩余 target 的需求变化
↓
剩余 candidate 的可行范围压缩
↓
之前低置信判断可能被加强，也可能被推翻
```

所以 Part B 不是五道完全独立的小题。

### Single-use 是全局约束

四种真实 form 都以 single-use candidate policy 为主：

```text
一个 candidate 放下去
→ 不只是当前 target 多了一个答案
→ 其他 target 同时少了一个可能
```

这意味着 elimination 是合法证据，但不能替代 local meaning fit。

### Confidence Ordering｜先锁硬约束

优先处理：

- 强 reference chain；
- 明确 chronology；
- 唯一 discourse role；
- fixed givens 附近的硬关系；
- 明显 cause / consequence；
- comment 中独特 stance / reason；
- paragraph 中非常明确的 dominant claim。

先锁高置信点，再让全局 elimination 帮助难点。

### Provisional Placement｜低置信就保持可撤销

```text
暂时最优
≠
已经成为事实
```

低置信选择可以先放，但别因为“已经填了”就停止重新检查。

### Coupled Error｜两个错可能只有一个原因

例如：

```text
P2 放 B
P4 放 D
formal 恰好相反
```

如果真正原因是 B / D 的 discourse role 理反，那么这是：

```text
1 个 coupled contrast failure
→ 2 个位置一起错
```

不是两个完全独立弱点。

### 四种 form 的 Global Check

```text
Gap Matching
每个 gap 前后都通？整篇 progression 还自然？

Heading Matching
每个 heading 都覆盖整段中心？有没有某段被迫拿一个“次优相关标题”？

Paragraph Ordering
相邻 pair 都通？fixed givens 关系正确？whole chain 有无 reference / chronology 断裂？

Comment Matching
每个人的 statement attribution 都成立？相似评论是否因为 elimination 被错配？
```

> **带走：局部 fit 只是候选资格，global consistency 才完成 Part B。**

---

<a id="rb-skill-map"></a>
## D5｜Reading B Skill Map：后续重建地址

```text
RB1 Discourse Skeleton
   ├─ claim / evidence
   ├─ general / example
   ├─ problem / solution
   ├─ cause / consequence
   └─ contrast / qualification

RB2 Target Demand
   ├─ gap bridge role
   ├─ paragraph dominant proposition
   ├─ ordering adjacency / sequence
   └─ comment proposition / attribution

RB3 Candidate Role
   ├─ function compression
   ├─ reference chain
   ├─ lexical cohesion
   └─ topic / stance continuity

RB4 Fit Testing
   ├─ backward fit
   ├─ forward fit
   ├─ whole-paragraph fit
   └─ local vs global fit

RB5 Global Reconciliation
   ├─ single-use elimination
   ├─ coupled placement
   ├─ swap detection
   └─ cascade / dependency

RB6 Execution
   ├─ confidence ordering
   ├─ provisional placement
   └─ final global check
```

---

<a id="rb-skill-local-global"></a>
### Deep｜Local Fit vs Global Fit

一句 / 一段放在这里读着顺，只证明局部可行。

正确 map 还必须同时满足：

```text
Backward
它接得住前面 / target 吗？
+
Forward
它为后面准备对了吗？
+
Global
整篇和剩余 candidates 还自洽吗？
```

如果理由只有“和前面关键词很多”，必须继续问：

> **那它如何解释后一句 / 整段 / 剩余 map？**

---

<a id="rb-skill-coupled"></a>
### Deep｜Coupled Placement：比较整组，不比较孤立位置

如果 A 放 P2 会迫使 B 只能去 P4，那么真正比较的是：

```text
(A → P2, B → P4)
vs
(B → P2, A → P4)
```

哪一整组同时满足：

```text
role
+
local fit
+
global consistency
```

哪一组才更有 authority。

Ordering、Gap Matching、Heading Matching 都可能出现这种 coupled competition。

---

<a id="rb-skill-reference"></a>
### Deep｜Reference Chain：硬约束，但不是最近名词匹配

检查：

```text
这个 pronoun / demonstrative 语法上能指谁？
↓
语义角色成立吗？
↓
放进去以后，下一步继续使用这个 referent 自然吗？
```

尤其警惕：

> 关键词重复很多，所以一定能接。

Reference 是结构约束，不是词面小游戏。

---

<a id="rb-execution"></a>
### Reading B｜Exam Compression

熟练后先识别 form，再压成：

```text
整篇往哪走？
↓
当前 target 缺什么？
↓
candidate 真正是什么 role / proposition？
↓
先锁硬约束
↓
检查 local / whole-paragraph / forward fit
↓
用 single-use 做 global reconcile
↓
整张 map 自洽就走
```

四种 form 的最短提醒：

```text
Gap       看 bridge：前 + 后
Heading   看整段 dominant proposition
Ordering  看 fixed anchors + adjacency + whole chain
Comment   看 proposition / stance / attribution
```

---

<a id="runtime-bridge"></a>
# E｜第一次学习以后：别把 Skill Map 变成新的待办清单

第一次学习的目的不是把每个节点都学到“完成”，而是拥有一张足够做题的模型。

之后关系很简单：

```text
Global Map + Core Blocks
→ 我已经知道这类题应怎样判断
↓
真实 Attempt
→ 看模型能不能执行
↓
Wrong / Uncertain
→ 找最早、最有价值的失效点
↓
最小修复
→ 只补真正缺的机制
↓
回到新题
```

一篇题可以同时暴露很多现象，但不代表未来要记很多“弱点”。

例如 Reading A 同时出现：

```text
reference 错
→ scope 跟着错
→ option degree 判断也错
```

如果最早的 reference failure 已经解释后面结果，就先修它。

稳定正确的题直接离开；一次性错误看懂 decisive difference 后也可以结束。

同一道题重做正确说明 repair 生效，但不自动证明 mastery；真正更强的证据来自以后独立材料里的稳定表现。

---

# 最后压缩｜Objective 只带走三句话

```text
Reading A
问什么 → 哪段 evidence 决定 → 谁多说了一步

Cloze
这个空要什么 → 哪条 constraint 分胜负 → 谁是 best fit

Part B
整篇怎样推进 → target 缺什么 role → 哪个 candidate 让整张 map 成立
```

如果这三条已经能稳定执行，就不要继续“学客观题框架”。

去做题。