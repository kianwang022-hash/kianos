# Source Review｜信息研究与证据判断

Status: LEARNER-READY SOURCE CLOSURE
Role: 后台证据边界，不是 learner-facing 课程。

## Source rule

这本 Skill 的目标不是让 Kian “更会搜很多资料”，而是：

> **用尽量少的注意力，找到真正能回答问题的证据；知道它为什么可信、哪里不确定、能不能直接用于当前情境，并在 AI 参与时保留验证能力。**

必须分开的 5 个层次：

1. **问题**：到底想知道什么；
2. **来源身份**：谁在说、原始出处在哪里；
3. **证据质量**：这个 claim 靠什么方法和数据支持；
4. **适用性**：这个证据是否回答当前人群 / 时间 / 场景；
5. **整体判断**：多条证据放在一起以后，结论有多稳。

## Accepted source set

### S1｜Stanford — Lateral Reading

Sources:
- Wineburg & McGrew, Lateral Reading and the Nature of Expertise.
- Stanford Report summary of the expert-source-evaluation study.

https://openarchive.stanford.edu/node/2278
https://news.stanford.edu/stories/2017/10/fact-checkers-outperform-historians-evaluating-online-information

Accepted:
在该研究的在线信息评价任务中，专业 fact-checkers 更常离开当前页面、打开其他来源调查网站 / 作者 / claim 背景，也就是 lateral reading；他们整体上比受试 historians 和 Stanford students 更快、更准确。

Learner use:
面对陌生网页时，不在页面内部“研究它自己是不是可信”，而是快速横向查：
- 谁在背后；
- 别的可靠来源怎么描述它；
- 原始 claim 从哪里来。

Boundary:
这是在线 source credibility 场景的证据，不等于完整科研 critical appraisal，也不能把“多开几个标签页”本身当作真伪证明。

### S2｜Cochrane — Searching for and selecting studies

Source:
Cochrane Handbook, Chapter 4: Searching for and selecting studies.
https://training.cochrane.org/handbook/current/chapter-04

Accepted:
高质量检索是迭代过程；检索应围绕主要概念构造，并平衡 sensitivity / precision。不同证据问题可能需要不同检索；应关注更新检索、errata / retractions，并记录搜索过程。对于系统综述，单一数据库或单一搜索式可能漏掉相关研究。

Learner use:
支持 U1–U2：
- 先定义问题与概念；
- 搜索词是迭代产生的；
- 不把第一组关键词 / 第一页结果当成完整证据环境；
- 高 stakes / 高 completeness 任务需要更广覆盖，普通现实问题不必照搬系统综述规格。

Boundary:
Cochrane 的搜索标准面向系统综述，远高于普通生活 / 工作 research 所需强度。Learner-facing 内容必须按 stakes 压缩，不能把每次搜索做成 systematic review。

### S3｜Oxford CEBM — Evidence hierarchy depends on the question

Sources:
Oxford Centre for Evidence-Based Medicine, Levels of Evidence introductory document and explanation.
https://www.cebm.ox.ac.uk/resources/levels-of-evidence/levels-of-evidence-introductory-document
https://www.cebm.ox.ac.uk/resources/levels-of-evidence/explanation-of-the-2011-ocebm-levels-of-evidence

Accepted:
Evidence hierarchy 是寻找 likely best evidence 的 heuristic，不是最终质量评分；什么算“最好证据”取决于问题类型。低层级证据有时可比质量差、间接或不精确的高层级证据更有信息量。Levels 本身不能替代 judgement，也不能直接给 recommendation。

Learner use:
支持 U4：
> **先问“这是什么问题”，再问“哪种证据设计最适合回答它”。**

Boundary:
OCEBM 是临床证据框架，不能直接外推成所有领域的万能 hierarchy。General Skill 只复用“question → suitable evidence design”和“hierarchy ≠ final quality”两个结构。

### S4｜Cochrane — Risk of bias

Source:
Cochrane Handbook, Chapter 8: Assessing risk of bias in a randomized trial.
https://training.cochrane.org/handbook/current/chapter-08

Accepted:
同一 study type 内也可能因为 randomization、deviations、missing data、measurement、selective reporting 等问题产生 bias；风险判断应针对具体 result，并有理由支持。

Learner use:
提醒：
> **“RCT / 论文 / peer-reviewed”只是类型标签，不能替代对具体方法与结果的 critical appraisal。**

Boundary:
RoB 2 专门针对 randomized trials。Learner-facing 不能把其 5 个 domain 硬套到所有研究设计，而是抽象成：
- 比较是否公平；
- 数据是否缺失 / 被选择；
- 测量是否可靠；
- 分析 / 报告是否可能偏向某个结果。

### S5｜National Academies — body of evidence / replication

Source:
National Academies, Reproducibility and Replicability in Science (2019), especially Chapters 5 and 7.
https://www.nationalacademies.org/read/25303/chapter/8
https://www.nationalacademies.org/read/25303/chapter/10

Accepted:
单个 study 或单次 replication 不应独立代表整个知识状态；对 scientific claims 的信心更应来自整个 body of evidence、多条检查路径、replication / synthesis 与方法透明度。

Learner use:
支持 U6：
- 不被一篇“爆款论文”带走；
- 看一致性、重复、方法差异与整体证据；
- 冲突不是自动取平均，而是解释为什么冲突。

Boundary:
不同学科的 replication 条件差异很大；不能把“未复现”机械等同于“原结论为假”。

### S6｜Crossref + Retraction Watch — scholarly record changes

Sources:
Crossref Retraction Watch documentation and production metadata.
https://www.crossref.org/documentation/retrieve-metadata/retraction-watch/
https://www.crossref.org/blog/retraction-watch-retractions-now-in-the-crossref-api/

Accepted:
论文发表后可能被 correction、expression of concern、retraction 或 reinstatement 更新；Retraction Watch 数据已整合进 Crossref production metadata，并持续更新。

Learner use:
支持 U3 / U5：
重要 scholarly claim 不只确认“论文存在”，还要看其当前 publication status。

Boundary:
没有 retraction 不等于研究质量高；retraction 也必须看具体 notice / reason，而不是只贴标签。

### S7｜NIST — Generative AI confabulation

Source:
NIST AI 600-1, Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile.
https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf

Accepted:
生成式 AI 可能自信地产生错误事实、逻辑或 citations；在高后果场景中，这种 confabulation 需要显式管理。

Learner use:
支持 U7：
AI 可以做 query expansion、triage、summarization 和 contradiction discovery，但关键 claim 必须回到真实 source / record 验证。

Boundary:
“AI 会 hallucinate”不等于 AI research 不可用；正确目标是设计 verification boundary，而不是拒绝 AI。

### S8｜ASA — Statistical significance ≠ effect size / practical importance

Source:
American Statistical Association, Statement on Statistical Significance and P-Values.
https://www.amstat.org/asa/files/pdfs/p-valuestatement.pdf

Accepted:
ASA 明确指出，p-value / statistical significance 不能衡量 effect size 或结果的重要性；科学、商业或政策结论不应只根据某个 p-value 阈值决定。样本量也会影响 statistical significance。

Learner use:
支持 U4：
- “统计显著”不能直接翻译成“效果很大 / 很重要”；
- 仍要看 effect size、uncertainty interval 与现实意义；
- 不把 p<0.05 当作自动真相按钮。

Boundary:
ASA statement 讨论的是统计推断与 p-value 解释，不替代具体领域的 effect-size judgement，也不规定一个统一的“临床 / 商业重要性”阈值。

### S9｜AHRQ — Applicability / external validity

Source:
AHRQ Effective Health Care Program, Assessing the Applicability of Studies When Comparing Medical Interventions.
https://effectivehealthcare.ahrq.gov/products/methods-guidance-applicability/methods

Accepted:
Applicability should be considered separately from internal evidence quality. AHRQ recommends examining Population, Intervention, Comparator, Outcome and Setting, and judging how differences between the available evidence and the target decision context may change expected results. There is no valid universal single-number applicability scale.

Learner use:
支持 U5：
- “研究本身做得好”与“对当前问题适用”是两层判断；
- 人群、干预 / 暴露、结果指标、场景和基础风险都可能改变 applicability；
- local / real-world evidence 可以提高决策相关性，但不能因为“更本地”就自动获得更高证据质量。

Boundary:
AHRQ guidance 来自 comparative effectiveness / healthcare evidence synthesis。General Skill 只复用“质量与适用性分开判断”和“比较 target context 与 study context”这两个结构，不把临床 PICOS 机械套到所有领域。

## Initial Source → capability map

| Capability | 主要 Source |
| --- | --- |
| C1 问题与信息任务 | S2 + S3 |
| C2 搜索策略与覆盖 | S2 |
| C3 来源身份 / provenance / scholarly status | S1 + S6 |
| C4 证据强度 / 方法 / bias / statistical interpretation | S3 + S4 + S8 |
| C5 时效性 / 适用性 | S2 + S3 + S6 + S9 |
| C6 冲突证据 / body of evidence | S5 |
| C7 AI-assisted research validation | S7 + S1 + S6 |

## Closure pass 1 — defects found

1. **统计显著段缺独立 Source owner**：已补 ASA S8。
2. **U1 的问题类型是跨域 practical synthesis，不是 OCEBM 原样搬运**：保留，但明确为通用信息任务分类，不冒充统一 evidence hierarchy。
3. **U5 的 local evidence 不能被读成“小样本自动胜过大样本”**：Learner-facing 需强调“决策相关性更高 ≠ 证据质量更高”，必须与总体规律合并。
4. **U7 对 AI 的边界正确，但术语过多**：需要中文先行，保留必要精确词。
5. **全书英文术语密度过高**：已完成 learner-language repair，不改变核心结构。
6. **U5 applicability 缺专门 Source owner**：已补 AHRQ S9，并把“local evidence 胜过 global average”的危险表述改成“更相关 ≠ 更可靠”。
7. **Decision ↔ Research interface 有重叠风险**：已固定为 Decision 判断“值不值得继续获取信息”，Research 判断“既然要获取，搜多广、验证多深、如何综合”。

## Deliberately excluded

- 一个万能“可信度打分”；
- 只看域名、设计感、引用数量判断来源；
- “peer reviewed = true”；
- “RCT 永远最高级”；
- “一篇 meta-analysis 自动压倒所有其他信息”；
- 为普通现实问题机械执行完整 systematic review；
- 把搜索结果排名当证据排序；
- 把 AI 生成的 citation 当作已经验证；
- 因为 Source 很权威，就不再检查具体 claim 是否真的来自它。
