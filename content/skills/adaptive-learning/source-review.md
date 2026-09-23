# Source Review｜学习与能力构建

Status: READY SOURCE REVIEW
Role: 后台证据边界，不是 learner-facing 课程。

## Source rule

这本 Skill 解决的是：

> **如何把一个真实需求变成可学习、可验证、可迁移的能力，而不是收集“学习技巧”。**

必须分开两类东西：

### A｜KianOS / Personal 的设计原则

这些是系统的产品与学习哲学，不冒充单一研究结论：

- Demand 先于 curriculum；
- 成功条件先于课程长度；
- capability tree 先于材料堆积；
- AI 可外包 commodity execution，但不能替代必要的 Native Floor；
- 不同领域使用不同 practice geometry；
- stop optimizing learning system when real practice is bottleneck。

### B｜学习科学支持的通用机制

这些有外部证据支持，但仍有适用边界：

- prior knowledge 会帮助也会误导；
- retrieval practice 可改善长期保持；
- spacing 可改善保持，但最优间隔依赖 retention interval；
- varied / interleaved practice 在一些场景有益，但不是万能规则；
- feedback / assessment / metacognition 支持学习调节；
- transfer 需要足够的 initial learning，且多情境 / underlying principles 有助于灵活迁移；
- deliberate practice 很重要，但 expertise 不是“只由 deliberate practice 一项解释”。

## Accepted source set

### S1｜National Academies — How People Learn II

Source:
National Academies of Sciences, Engineering, and Medicine. How People Learn II: Learners, Contexts, and Cultures (2018).
https://www.nationalacademies.org/read/24783/chapter/2
https://www.nationalacademies.org/read/24783/chapter/7
https://www.nationalacademies.org/read/24783/chapter/9

Accepted:
- prior knowledge can facilitate new learning but can also bias interpretation;
- learners build increasingly structured knowledge and mental models;
- retrieval, spaced practice and varied / interleaved practice are among strategies with evidence for retention;
- targeted feedback, metacognitive support, appropriately matched challenge and meaningful goals support learner-directed learning;
- assessment can reveal the gap between current and desired performance;
- discipline-specific language and practices matter for deep understanding.

Learner use:
提供全书的通用 learning-science backbone。

Boundary:
这些结论来自 broad education / learning research，不意味着每个 Skill 都该以 classroom / memory-test 形式学习。

### S2｜Roediger & Karpicke — Retrieval practice

Source:
Roediger HL, Karpicke JD. Test-enhanced learning: taking memory tests improves long-term retention. Psychological Science. 2006.
https://pubmed.ncbi.nlm.nih.gov/16507066/

Accepted:
在实验使用 educationally relevant prose materials 的条件下，主动 retrieval 相比重复重读，在 delayed retention tests 上产生更好的长期保持，即使重读会提高短期熟悉感 / confidence。

Learner use:
支持：
- 不把“看懂 / 熟悉”当成“能调出来”；
- 对需要长期保持的 declarative knowledge 使用主动回忆；
- Verify 与 Recall 不只是测量，也可能促进 retention。

Boundary:
这是 memory / prose-learning 场景的证据。不能推出所有技能都应该靠 quiz 学；编程、口语、临床、身体技能仍需要真实 performance。

### S3｜Cepeda et al. — Spacing

Source:
Cepeda NJ et al. Distributed practice in verbal recall tasks: A review and quantitative synthesis. Psychological Bulletin. 2006.
https://pubmed.ncbi.nlm.nih.gov/16719566/

Accepted:
对 verbal recall tasks，distributed practice 总体优于 massed practice；最有利的间隔会随着目标 retention interval 变化。

Learner use:
支持：
- 需要长期保持的知识不要只靠一次密集学习；
- spacing 不是固定“每天复习一次”，而要服务目标保持时间。

Boundary:
该 meta-analysis 主要是 verbal recall。不能直接把其具体 spacing 参数外推到 complex performance skills。

### S4｜Dunlosky et al. — Learning techniques review

Source:
Dunlosky J et al. Improving Students' Learning With Effective Learning Techniques. Psychological Science in the Public Interest. 2013.
https://pubmed.ncbi.nlm.nih.gov/26173288/

Accepted:
该 review 比较多种常见学习技术；practice testing 和 distributed practice 获得较高 utility 评价，而很多流行方法的证据或泛化性更有限。

Learner use:
支持“不要因为一个学习方法流行 / 感觉顺，就认为它高效”。

Boundary:
这是一篇面向学生学习技术的综述；utility rating 不是所有领域、所有学习目标的统一排名。

### S5｜National Academies — Learning and Transfer

Source:
National Research Council. How People Learn: Brain, Mind, Experience, and School, Chapter 3 Learning and Transfer.
https://www.nationalacademies.org/read/9853/chapter/6

Accepted:
- transfer requires sufficient initial learning;
- learning with understanding supports transfer more than rote memorization alone;
- knowledge learned in multiple contexts can support more flexible transfer;
- transfer is active and dynamic rather than a simple one-shot endpoint;
- prior knowledge can support or interfere with new learning;
- feedback and metacognitive monitoring matter.

Learner use:
支持“同题做对 ≠ 能换情境”“先学会再谈 transfer”“训练要逐渐脱离单一表面情境”。

Boundary:
HPL I 是 broad synthesis。具体 transfer task 仍必须由 domain cognition 决定。

### S6｜Deliberate practice — useful but not a single-cause theory

Source:
Hambrick DZ, Macnamara BN, Oswald FL. Is the Deliberate Practice View Defensible? Frontiers in Psychology. 2020.
https://pubmed.ncbi.nlm.nih.gov/33013494/

Accepted:
Deliberate practice 是 expertise 文献中的重要框架，但其定义、可检验性和对 individual differences 的解释范围存在持续争议；expertise 更适合看成 multifactorial outcome，而不是把训练时数当单一充分原因。

Learner use:
支持：
- 刻意练习不是“多练就一定精通”的万能公式；
- practice quality / feedback / task match 很重要；
- 不能把 hours practiced 当 mastery evidence。

Boundary:
这是一篇批判性 review，不是否定 structured practice 的价值；它限制的是过度单因果叙事。

### S7｜Hattie & Timperley — Feedback

Source:
Hattie J, Timperley H. The Power of Feedback. Review of Educational Research. 2007.
https://journals.sagepub.com/doi/10.3102/003465430298487

Accepted:
Feedback can have substantial effects on learning, but the effect can be positive or negative; what the feedback is about and how it is delivered matter.

Learner use:
支持 U3 / U6：
- 不把“反馈越多越好”当规则；
- 优先给能定位当前任务差距、帮助下一次表现改变的反馈；
- 直接暴露答案可能让短期表现变好，却不一定形成独立能力证据。

Boundary:
这是一篇广泛的教育反馈综述，不提供所有领域通用的最佳反馈频率、时机或格式。Learner-facing 内容只采用“反馈必须看任务、层级与后续表现”的窄原则。

## Final Source → capability re-check

| Capability | Source | Re-check boundary |
| --- | --- | --- |
| C1 需求 / 成功条件 / 最低自主能力 | Personal/KianOS design rule + S1 | “最低自主能力”是风险设计原则，不冒充学习科学定律 |
| C2 Baseline / prior knowledge / gap | S1 + S5 | baseline 只在会改变下一步时使用，不制造测试仪式 |
| C3 学习方法选择 / 练习形态 | S1 + S4 + S6 + domain-specific evidence | 不存在一个跨领域万能练法；刻意练习不是单因果 expertise 理论 |
| C4 Source → Knowledge / mental model | S1 + Research interface | Research 判断 claim / Source 可信度；Learning 只负责重建已接受输入 |
| C5 Retrieval / spacing / practice design | S1 + S2 + S3 + S4 + S6 | retrieval / spacing 主要支持保持；不能直接升级成 transfer / real performance |
| C6 Feedback / Verify / Transfer | S1 + S5 + S7 | feedback 可能正也可能负；same-item correction 不冒充 fresh / transfer evidence |
| C7 Real Use / adaptive control / stop rule | Personal/KianOS design rule + S1 + S5 | real use 提供真实约束，但高风险 / 延迟反馈任务仍需监督或外部验证 |

## Closure pass 1 — 2026-09-23

本轮从整本 fresh self-attack 出发，不新增章节，只攻击会改变 learner 行为或证据含义的缺陷。

1. **Memory technique 过度泛化风险**：Framework / U3 / U5 已把主动回忆和间隔练习限制在长期保持与知识调用；明确“能调出来”不等于判断、执行或迁移。
2. **Spacing 机制写得过死**：U3 原文像是在要求“等遗忘后再提取”。已改成跨时间分布，并保留 S3 的真实边界：合适间隔依赖目标保持时间，不硬编码统一数字。
3. **Native Floor 方向不清**：U1 原“后果 × 可验证性 × 可逆性”容易误读。已改为显式方向：后果越大、越难验证、越难撤回，越需要更高自主判断；反之可更多交给工具。
4. **Feedback source owner 不够直接**：原 C6 map 错把 deliberate-practice review 当主要 owner。已新增 S7 Hattie & Timperley，并把 S6 留回练习设计 / expertise 边界。
5. **Real Use 被写得过强**：U7 不再把真实使用称作天然“最强反馈”；新增高风险、延迟反馈与错误难察觉时的模拟 / 监督 / 专家复核 / 外部指标边界。
6. **Decision / Research owner collision**：U4 固定 Research 负责 claim / Source 是否可信，Learning 负责已接受输入怎样变成可调用 Knowledge；U7 固定 Decision / Personal 负责跨目标资源取舍，Learning 负责能力形成与修复。
7. **Learner-facing 术语摩擦**：Practice Geometry、responsible object / owner、cognition、evidence ladder 等已在 learner 内容里改为直接中文；保留 Source / Knowledge / Transfer 等确实承担稳定概念边界的词。
8. **重复 / 无限系统化攻击**：Framework 保留全书母模型，各 Unit 只保留本地责任；U7 明确当真实练习成为瓶颈时停止继续优化学习系统，不制造自动 maintenance 债务。

### Closure verdict

**PASS — learner-ready at the Content layer.**

这表示：
- Framework + U1–U7 的关键 claim 与当前 Source 边界一致；
- 没有发现 memory technique 被提升成 universal learning law；
- Research / Decision / Learning 的 owner 已能在真实问题里分流；
- 没有 material 内容缺口需要继续扩章。

这不表示：
- Kian 已经掌握这项能力；
- 每个领域都应使用同一学习顺序；
- learner real-use evidence 已经存在；
- 网站 UI 需要为这本书新增专用逻辑。

后续只由真实 learner question、明确 Source 变化或具体内容缺陷重新打开最小责任 Unit。

## Deliberately excluded

- 一个万能“学习风格”分类；
- 把主动回忆做成所有技能的强制模板；
- 固定 Pomodoro / 90-minute law；
- “21 天形成习惯”一类伪精确规律；
- 只按学习时长衡量能力；
- 一次同题做对就宣布 mastery；
- 因为 AI 帮你生成了高质量 artifact 就推断 Kian 已经学会；
- 为了维护学习系统而减少真实练习；
- 任何“最优间隔”被硬编码成跨领域统一数字。
