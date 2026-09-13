# Translation｜Current Learning Asset

> **Role**：Translation 的 Current learner-facing canonical learning asset。  
> **目标**：把英语原意准确恢复出来，用自然中文重构，并在考试时间内稳定交付。  
> **第一次学习**：先建立 Global Map，再按需学习 3 个 Core Blocks：Representation / Reconstruction / Execution。已经稳定的部分可以直接跳过。  
> **Fidelity**：不是第 4 门课，而是贯穿“理解 → 中文重构”的意义守恒约束；只有真实失真时才需要单独展开。  
> **完整知识保全**：上一版高密度长资产完整保存在 `content/english/modules/translation/learning.reference.md`，身份降为 **repair/reference reservoir**。任何被主路径折叠的有效例子、边界、skill detail 都仍有明确 owner，不因 learner-facing 压缩而删除。  
> **Runtime**：clean performance 优先；Wrong / Uncertain 是 evidence signal，不自动制造 Chat、repair、transfer 或复习债务。

---

# A｜Global Map：翻译到底是在做什么

考研翻译不是逐词替换，而是完成三个真正的 productive jobs：

```text
REPRESENT
把英文真正说了什么搭准
↓
RECONSTRUCT — while preserving fidelity
把同一件事重新组织成正常中文
↓
DELIVER
在时间压力下稳定写出来并及时离开
```

压成一句话：

> **把英文真正说了什么搭准，再把同一件事用正常中文重新说出来。**

其中有一条贯穿约束：

```text
FIDELITY GUARD
允许改变形式
禁止改变命题、关系、角色、范围、程度与必要信息
```

所以 Translation 的最小充分模型是：

1. **English Representation**｜原文到底断言了什么；
2. **Chinese Reconstruction**｜同一意义怎样重组成自然中文；
3. **Exam Execution**｜怎样在有限时间稳定交付；
4. **Fidelity Guard**｜跨阶段 invariant，不是必须单独走过的顺序节点。

例如：

> Evidence collected under ideal conditions does not always predict what will happen in everyday life.

真正重要的是：

- `collected under ideal conditions` 挂到 `Evidence`；
- `does not always` 是“并不总是”，不是“完全不能”；
- 中文可以重排，但不能抹掉“有时仍可能预测”的命题强度。

如果 `does not always` 一开始就理解错 → **Representation failure**。  
如果理解对了，中文输出时漏掉限制 → **Fidelity failure**。  
如果意思都保住但中文机械僵硬 → **Reconstruction failure**。

这些 failure 可以诊断区分，但不意味着 learner 必须先上四门独立课程。

---

# B｜Core Learning：三块就够，Fidelity 贯穿其中

第一次进入 Translation，不要求把下面内容全部学完。

默认只在当前能力不稳时进入相应 Core Block：

```text
B1 Representation
B3 Reconstruction
B4 Execution
```

`B2 Fidelity Guard` 保留完整语义，但身份是跨阶段 guard + repair reservoir，不是第一次学习必须连续完成的第 2 个 Block。

---

# B1｜English Representation：先把英文的意义结构搭准

## B1.0 核心模型

英文表面是一串词，真正需要恢复的是意义结构：

```text
谁 / 什么
→ 发生什么、做什么、是什么
→ 哪些成分属于谁
→ 命题之间是什么关系
→ 否定、比较、程度、条件作用到哪里
→ reference 指向什么
→ 关键词在当前语境是哪一个 sense
```

目标不是把语法术语说全，而是：

> **先用粗糙但准确的话，说清这句英文到底断言了什么。**

如果粗糙意义都不稳定，不要先润色中文。

## B1.1 Proposition hierarchy

面对复杂句先问：

```text
核心对象是谁 / 什么？
核心动作、判断、状态是什么？
其他内容是在限定、解释、补充，还是另起命题？
```

例如：

> Policies that appear efficient in theory may fail when they ignore how people actually behave.

先压成：

```text
主命题：某些政策可能失败
哪些政策：理论上看起来高效的政策
什么条件下：忽视人们实际行为方式时
```

长句不等于巨大主干；从句多也不意味着每个从句都同等重要。

## B1.2 Attachment｜谁修饰谁

高风险位置包括长名词短语、后置定语、非谓语、介词短语、插入结构、句尾长修饰。

不要只按最近距离挂接，同时检查：

```text
结构上能不能挂
+
意义上是否合理
+
整个命题是否因此连贯
```

`Evidence collected under ideal conditions` 中，`collected...` 限定的是 `Evidence`，不是新主命题。

## B1.3 Reference｜这个词到底指谁 / 什么

`it / they / this / that / these / such` 可能指：

- noun / phrase；
- event；
- whole proposition；
- discourse idea。

判断不靠“最近名词”一个规则，而靠：语法可行 + 语义角色可行 + 后文继续成立。

## B1.4 Scope / strength

最容易出现“每个词都认识但命题仍翻错”的位置：

```text
not all        ≠ 全都不
not always     ≠ 从不
not necessarily ≠ 一定不
may / might / can
only / even / just
quantifier / comparison / degree
```

先确定限制作用到哪个断言，再找中文表达。

## B1.5 Logical relation

连接词不是固定中文词典。真正要恢复的是：

> **命题 A 和命题 B 为什么被放在一起？**

cause / condition / contrast / concession / comparison / purpose / example / time 等关系可以换表面形式，但不能被换成另一个 relation。

## B1.6 Lexical access boundary

熟词生义、sense competition、phrase、construction、collocation、contrast、confusable 的长期知识属于 **LexicalOS**。

Translation 只负责在当前句里识别：

> 这里是 lexical retrieval failure；哪个 sense 才能让当前 proposition / relation 成立？

不要在 Translation 再建第二套词汇库。

## B1.7 卡住时的压缩排查

```text
抓主命题
→ 挂 attachment
→ 定 scope / strength
→ 定 relation
→ 解 reference
→ 检 lexical sense
```

这是一套故障排查顺序，不是每句必须念一遍的算法。

如果两个 attachment candidate 都成立、reference 指向有真实竞争、几层 scope 叠加，或每个词都认识却说不清主命题，再把原句 + 必要上下文 + 自己的粗糙理解交给 Chat 下钻。

---

# B2｜Fidelity Guard：意义守恒，不是一门独立课程

## B2.0 Owner / boundary

Fidelity 解决的问题是：

> **我已经理解对英文，但写出来的中文有没有把同一张意义结构改坏？**

如果原文一开始就理解错，owner 是 Representation；只有“理解正确但输出失真”才是 Fidelity failure。

因此这里不复制一套 Scope / Reference / Attachment 课程，只保留转换阶段真正必要的守恒检查。

## B2.1 必须守住什么

中文可以重排、拆句、合句、词性转换、主动被动互换，但不能任意改变：

- core proposition；
- semantic roles / attachment；
- relation；
- negation / scope；
- modality / degree / frequency；
- condition / restriction；
- reference；
- necessary information units。

## B2.2 三类硬伤

```text
OMISSION   原文有，中文没了
ADDITION   原文没有，中文加了新判断
DISTORTION 信息还在，但变成另一件事
```

高价值例子：

- `may` 被写成“会” → 弱断言被强化；
- condition 被写成 certainty；
- partial negation 被写成 total negation；
- reference / role 被换人；
- 为了“讲通”自行补原因或作者态度。

## B2.3 Meaning checksum｜需要时才用

不是逐词回译，只检查：

```text
1. 核心命题还在吗？
2. 角色 / attachment 还对吗？
3. relation / scope / reference 还对吗？
4. degree / modality 有没有变强或变弱？
5. 有没有漏、增、反、错挂？
```

这个 guard 的价值恰恰是让 Reconstruction 更大胆：

> **意义结构锁住以后，表面形式可以放开。**

Stable learner 不需要每句显式跑 checksum。真实错误显示存在失真风险时再展开。

---

# B3｜Chinese Reconstruction：把同一意义重新说成正常中文

## B3.0 核心模型

Representation 稳定后，不再一边润色一边重新猜原文。

重构主要是三个决策：

```text
CENTER     中文以什么为表达中心
ORDER      信息按什么顺序展开
PACKAGING  用什么句法 / 词类 / 分句承载
```

authority 不是“技巧表”，而是：

> **哪种中文组织能让读者最省力地恢复同一件事，就优先哪种。**

## B3.1 Information order

中文不欠英文一个原顺序。条件、原因、长修饰、插入内容可以前移/后移/拆开，只要 relation 与 emphasis 不被改坏。

## B3.2 Modifier unloading

当多层英文 modifier 全塞到中文名词前会形成定语墙时：

```text
先找中心对象
→ 判断哪些修饰必须紧贴
→ 其余改成后置说明 / 小分句 / 独立动作
```

不是“长句一定拆”，而是减少读者必须憋到句尾才知道中心的负担。

## B3.3 Split / Merge

按 proposition 组织，不按英文句号组织。

可以拆主命题 + 原因/条件/长解释；也可以在中文里合并重复主语或自然属于一个动作的短结构。

## B3.4 Nominalization → action

看到 `recognition / development / assessment / failure / increase / reduction` 等抽象名词时问：

> **这个名词背后其实是谁在做什么？**

例如 `the recognition of the problem` 在合适语境中可以恢复为“认识到这个问题”。

## B3.5 Voice reconstruction

英文被动可能服务于信息结构，不等于中文必须出现“被”。中文可改主动、无主句、受事话题或状态句；必须保住的是角色关系。

## B3.6 Explicit ↔ implicit

可以显化原文已经存在、但中文不说清会断裂的 relation/reference；也可以省略中文不需要重复的主语或形式结构。

显化 ≠ 自由增义；省略 ≠ 删除 proposition。

## B3.7 Natural packaging

优先级：

```text
准确
> 关系清楚
> 信息完整
> 自然可读
> 风格漂亮
```

两个版本都忠实自然时，不为“更像参考译文”继续消耗时间。

---

# B4｜Exam Execution：稳定交付，然后离开

Translation 的最终目标不是分析最完整，而是在有限时间里交付足够可靠的中文。

正常执行可压成：

```text
调用最小必要上下文
→ 搭稳意义骨架
→ 直接生成可信中文
→ 只扫高风险失真点
→ 够好就离开
```

## B4.1 Local context

reference、sense、logic 真依赖前后文时，只回看解决 ambiguity 所需的最小范围，然后立即返回 Translation；不要把整个 task 重新做成 Reading 分析。

## B4.2 First-pass production

意义骨架稳定后就可以落笔，不必等“英文分析 100% 完成”。真正要避免的是：英文没懂先润色、为一个中文词卡住整句、已有合格表达仍追求参考答案措辞。

## B4.3 Uncertainty triage

必须解决：会改变 proposition 的主谓关系、attachment、scope、reference、logic、modality、degree、关键词 sense。

可以先放过：两个都自然忠实的中文词、纯风格偏好、只会让句子“更漂亮”的修改。

## B4.4 High-risk self-check

优先扫：

```text
NEGATION / SCOPE
MODALITY / DEGREE
COMPARISON
REFERENCE
ATTACHMENT
ROLE REVERSAL
OMISSION
```

不是逐词重新翻一次。

## B4.5 Stop rule

满足以下条件就应该前进：

```text
核心命题稳定
关系与限制没有明显失真
重要信息没有漏
中文读得通
没有高风险 unresolved ambiguity
```

“还能再润色一点”不是继续停留的理由。

重复出现的漏限制、计时掉主干、自查漏否定/比较/modality、为了漂亮改坏原意、长修饰导致停止输出，才值得建立 execution repair object。

---

# B5｜Integrated Walkthrough：三块能力 + 一条 Fidelity Guard

合成句：

> The growing reliance on systems designed to simplify decisions may create new problems when users assume that these systems are always reliable.

## Step 1｜Represent

```text
主命题：越来越依赖某些系统，可能制造新的问题
systems：designed to simplify decisions
出现问题的情境：users assume ... 时
assume 内容：these systems are always reliable
may：可能，不是必然
these systems：指前面的 systems
```

## Step 2｜Reconstruct faithfully

可以释放英文名词结构，例如：

> 人们越来越依赖那些旨在简化决策的系统；如果使用者想当然地认为这些系统始终可靠，这种依赖反而可能带来新的问题。

重构过程中 Fidelity Guard 只守住高风险 truth：

- `growing reliance` 的增加趋势；
- `may` 的弱断言；
- `designed to...` 的 attachment；
- `when` 的关系；
- `always` 的强度。

Preservation 在这里是约束，不需要被 learner 单独“过一关”。

## Step 3｜Deliver

高风险点稳定、中文可读，就离开。

这就是 Translation 的完整工作模型。

---

# C｜Skill Map：诊断地址，不是课程目录

Skill Map 给失败一个稳定 owner，避免“一题一个知识点”。一个 task 可以同时暴露多个 node，但一次 repair 只处理真正有独立边际价值的 root causes。

## R｜Representation

```text
R1 Proposition / clause hierarchy
R2 Attachment
R3 Reference
R4 Scope / strength
R5 Logical relation
R6 Lexical access → canonical knowledge belongs to LexicalOS
```

## F｜Fidelity Guard

```text
F1 Core proposition preservation
F2 Relation preservation
F3 Restriction / scope / degree preservation
F4 Role / reference preservation
F5 Information completeness
F6 Omission / Addition / Distortion control
```

这些是 cross-cutting checks，不应复制成与 R 平行的一整套 learner course。

## C｜Chinese Reconstruction

```text
C1 Information order
C2 Split / Merge
C3 Modifier unloading
C4 Nominalization → Action
C5 Voice reconstruction
C6 Explicit ↔ Implicit
C7 Abstract → Concrete
C8 Natural packaging / register
```

## E｜Exam Execution

```text
E1 Local-context use
E2 First-pass production
E3 Uncertainty triage
E4 High-risk self-check
E5 Time-pressure stability
```

---

# D｜Repair / Reference Reservoir：什么时候值得向下学

Current first-learning 不要求预学几十个 leaf。详细高密度例子、旧 Active Checks、starter skills 和长尾边界完整保存在 `learning.reference.md`。

只有 evidence 说明某个 node 真正影响得分、速度或稳定性时，才向下调用其中内容。

一个值得占未来学习时间的 repair content 至少要做到：

```text
建立可执行 mental model
+
解释真正改变意义 / 输出的 mechanism
+
给出高价值 boundary / competition
+
有代表性 example
+
让 learner 做一次判断 / generation
+
能直接返回真实 Translation task
```

高价值 starter directions 包括：

- negation / quantifier / modality scope；
- attachment competition；
- reference competition；
- modifier unloading + nominalization；
- omission / addition / distortion；
- timed self-check failure。

如果一个节点只是“定义 + 标签”，不值得单独变成一课。

---

# E｜Material Routing：东西去哪，不创造第二门课

## E1 Current canonical

本文件拥有最小充分 learner model、核心 mechanisms、diagnostic map 与 runtime boundary。

## E2 Deep reference reservoir

`learning.reference.md` 保存上一版完整高密度知识、examples、micro-drills、edge cases 与旧 skill details。它是 backend-rich / repair-only reference，不是 first-learning checklist。

任何从主路径删除、合并、降级的信息，如果仍有效，都由这里继续保留；只有未来明确 semantic deprecation 才能真正删除。

## E3 Teacher / framework material

默认身份是 Repair Reservoir。老师有完整 30 章课程，不意味着 KianOS 也要复制同样的 learner 顺序。

## E4 Training material

```text
synthetic        教学 / micro-probe，不消耗真题新鲜度
exposed exam     已经做过，可用于普通 repair
protected unseen 保留 clean performance / transfer value
```

fresh material 是有限 diagnostic capital，不为关闭系统状态而消耗。

## E5 Personal evidence

first translation、wrong/uncertain、timing、repair history、later transfer 属于 learner runtime，不写进共享 canonical knowledge。

---

# F｜HOW YOU LEARN IT：performance first，review conditional

Translation 默认循环不是“每次都完整闭环”，而是：

```text
Clean Attempt
→ preserve first translation
→ Fast triage
→ EXIT / quick correction / smallest repair
→ return to real Translation
```

只有 meaningful recurring / ambiguous / high-cost failure 才值得更深：

```text
whole-task diagnostic context
→ smallest independent failure set
→ repair
→ learner reconstructs when useful
→ optional transfer claim only if future evidence could change allocation/confidence
```

原则：

- stable clean → 直接 PASS；
- 一次性错误，看懂 decisive evidence 后可以离开；
- Wrong / Uncertain 不自动等于 Chat；
- diagnosis ≠ repair；
- repair ≠ mastery；
- `not mastery` ≠ 必须安排一轮新测试；
- Lexical failure → 最小 lexical target 回 LexicalOS；
- pending claim 可以静默存在，不召唤 learner task。

参考译文和老师解析都应在 first translation 之后按需揭示；它们是 reference，不是唯一 surface-form authority。

---

# G｜第一次学习的出口

不再要求“完成 4 个 Core Learning Blocks”。

Global Map 看懂后，只要能自然回答下面高价值问题，就可以进入真实 Translation；不会的那一块再回来学：

1. 长句怎样先恢复核心 proposition，而不是逐词替换？
2. Attachment / Reference / Scope / Relation 为什么会改变命题？
3. 中文可以大胆改形式时，Fidelity Guard 到底守什么？
4. 什么情况下应该拆句、调序、释放 nominalization / passive？
5. 什么不确定必须解决，什么只是风格偏好？
6. 什么时候已经“够好”，应该离开这句？

最终希望形成的是：

```text
读英文
→ 快速形成稳定意义
→ 忠实地重构成自然中文
→ 快速扫高风险失真
→ 够好就走
```

框架越熟，显式步骤越少。

---

# H｜Translation Runtime v2 — aligned with current English Logic

**Parent authority:** `content/english/LEARNING_CONTRACT.md`  
**Boundary:** Runtime 规定 clean attempt / review / repair / evidence interaction，不把 diagnostic taxonomy 变成 learner ritual。

## H1 Review unit / diagnostic context / repair scope

Translation learner-facing attempt/review context是完整 Translation task/set；内部 evidence 可以细到 sentence、clause、proposition、relation、information unit 或 Chinese span。

```text
attempt unit ≠ diagnostic evidence granularity ≠ repair scope
```

Chat 需要深诊断时先看完整 task，再缩到最小有用 slice。

## H2 State semantics：不是每次都欠完整闭环

```text
ATTEMPT
↓
FAST TRIAGE
├─ PASS / EXIT
├─ QUICK LOCAL CORRECTION → EXIT
└─ MEANINGFUL REPAIR
      ↓
   smallest repair
      ↓
   learner reconstruction when useful
      ↓
   optional TRANSFER_PENDING only when a reusable claim is justified
```

`TRANSFER_PENDING` 不是 repair 后的必经状态。只有未来 evidence 真的可能改变学习分配 / confidence 的 reusable target 才值得创建。

## H3 Cascade / dependency collapse

上游 Representation failure 足以解释 relation / omission / awkward Chinese 时，只保留上游主因；下游仍独立存在时才增加第二个 repair object。

两个真正独立、高价值 failure 可以保留两个，不为了“一个 root cause”审美强行合并。

## H4 Reference reveal

```text
first translation
→ fast triage / diagnosis
→ smallest cue or repair when needed
→ learner reconstructs when useful
→ reference comparison only if it adds value
```

clean attempt 不嵌入 reference answer。完整参考译文不是唯一 surface-form authority。

## H5 PASS semantics

只要 meaning faithful、relation/intended information preserved、Chinese acceptable/natural enough，就可以 PASS。

不自动触发 Repair：

- 与参考译文措辞不同但语义等价；
- 两种中文组织都自然且忠实；
- 单次无得分价值的措辞偏好；
- 纯风格差异。

## H6 Evidence hierarchy

一般而言，memory residue 越低、context 越新，evidence 越强：

```text
看懂解释
< 同句 repair 后自己重译
< later independent success
< fresh task success on same demand
< repeated stable timed performance
```

但 evidence hierarchy 不是 scheduler。没有 justified claim，就不需要为了“闭环”再造一次测试。

## H7 Memory / claim admission

优先保留：

- recurring / high-cost representation demand；
- repeated fidelity distortion；
- stable reconstruction bottleneck；
- execution/self-check failure；
- later evidence 仍弱或矛盾的 reusable object。

不要因为“一句曾经翻错 / 一个词不够漂亮 / 看过参考后会改”自动创建长期债务。

## H8 Interaction boundary

至少保存：

```text
original + necessary context
+
first translation (immutable evidence)
+
current reconstruction when one exists
```

禁止为了系统完整感：

- 把 Translation 变成逐句强制 Chat review；
- 强制每句选择 cause taxonomy；
- 把所有局部错误做成 permanent cards；
- 用参考译文替代 learner generation；
- pending claim 在首页或 clean task 上制造 attention debt；
- 为了 close claim 消耗 fresh material。

## H9 Closure semantics

Repair 只说明当前 failure 被处理。若一个 reusable transfer claim **已经有理由存在**，后续自然 fresh evidence 可以支持或反驳它；同-item correction 不能冒充 transfer。

但是：

```text
not mastered
≠
must schedule a test

pending claim
≠
learner owes an action
```

claim 可以在 backend 静默等待，直到正常 Translation 恰好再次测试同一 demand。
