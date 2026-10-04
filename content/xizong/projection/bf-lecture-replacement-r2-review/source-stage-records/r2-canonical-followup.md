> Historical authoring-stage record (R1/R2). Local no-push/no-owner-write statements describe that stage. Current draft scope, canonical proposals and acceptance limits are in the package README. Pixel/working-archive references are evidence locators, not files shipped by this draft.

# R2：确定性Prompt计数/对象与H1止血引用修正

当前revision：`r2-definite-prompt-and-h1-route-20261004`。R1的1264文件完整版本冻结于相邻`lecture-replacement-revisions/r1-source-resolution/`，原manifest哈希逐项读回一致。此次只处理父任务指出的三项已证实Prompt问题、H1止血引用，并把四条已有C候选纳入同一canonical候选绑定链；没有扩全科审计、增加医学事实或写正式owner。

## 三项新增Prompt：精确旧→新

| 正式KP ID | 旧正式Prompt | 隔离canonical候选Prompt | 已有依据 |
|---|---|---|---|
| `remaining-f03-kp02` | 定义2｜芽孢｜对象差别｜创面药3只消毒 | 定义2｜芽孢｜对象差别｜创面药2只消毒 | 原外科物理P282/印刷P228三种消毒剂与创面仅前两种；现Core命名苯扎溴铵、氯己定两种。本次不新增Prompt槽或第三创面药。 |
| `final-f01-kp15` | 6步主链｜4线索｜3净化｜1出口F2 | 6步主链｜5线索｜3净化｜1出口F2 | 原canonical KP15“毒物综合征定位”明确列呼吸、瞳孔、皮肤、气味、器官损伤五类。只修数字。 |
| `digestive-d14-kp16` | 单纯3不1用｜化脓少/多分流｜坏疽3动作｜抗生素共性 | 单纯2不1用｜化脓少/多分流｜坏疽3动作｜抗生素共性 | 原外科物理P056和canonical阶段表只有不冲洗、不放引流两个否定动作。其余槽原样。 |

前次回报将F3 ID误写为`final-f03-kp02`；正确原生ID是`remaining-f03-kp02`。候选、diff、教案与证据均保留正确正式ID，没有创建或改名身份。

## 四条已有C候选：同一清单、同一canonical复制件

| 正式KP ID | 旧正式Prompt | 既有隔离canonical候选Prompt | 原有依据 |
|---|---|---|---|
| `hematology-h01-kp03` | 变形3因1主｜ESR看血浆4正2负｜脆性看RBC｜等渗≠等张｜遗传球三方向 | 变形3因1主｜ESR看血浆3正2负｜脆性看RBC｜等渗≠等张｜遗传球稳定2方向+ESR冲突 | Core三促两抑；遗传球两稳定方向，ESR真Source分歧继续并列。 |
| `hematology-h01-kp05` | 成熟7站｜何时脱核｜Ret残留物｜正常值｜高/低各指哪侧 | 成熟8站｜何时脱核｜Ret残留物｜正常值｜高/低各指哪侧 | Core成熟链八个节点、七次迁移，提示要求“站”。 |
| `hematology-h01-kp13` | 穿刺2问｜活检3问｜干抽｜三系少4入口｜单系少4入口｜下一步Block | 穿刺2问｜活检3问｜干抽｜多系少5入口｜单系少5入口｜下一步Block | Core两棵定位树各五个入口；“多系”包括两系。 |
| `hematology-h08-kp08` | BJP=游离轻链｜小→可滤过｜溢出性｜可伴血尿｜肾损5路｜IVP边界 | BJP=游离轻链｜小→可滤过｜溢出性｜可伴血尿｜肾损6路｜IVP边界 | Core原列六种肾损来源。 |

这四条没有新改医学范围或候选文本。C组装器原来的Prompt字典已移除；现在与F1/F3/D14一样，从统一清单选择canonical候选文件，再按原KP ID读取其中的Prompt。统一清单共19项（原15项＋此次3Prompt/1引用）：13Prompt、5Core、1引用；本轮焦点为上述7Prompt及H1引用，其余11项旧候选沿原状态留存，未重审或采纳。

## H1引用：C4未解析为正式别名，准确路由为A1 B4

当前A1 system及B4 projection注册`circulation-b04`，标题“正常止血与病理循环整合”；`identity-aliases.json`没有将`circulation-c4`解析到它的记录。本次不把同义标题推断成已定义别名。

- H1隔离canonical中`circulation-c4`两处改为`circulation-b04`；所有“循环 C4/循环C4”显示引用改为“A1 B4”。这些只是引用与标签，正常止血Primary归属不变。
- 当前H1教案正文两处明确A1 B4名称；第一次同时给出canonical Block ID及真实canonical路径。
- canonical路径：`content/xizong/knowledge/systems/a1-circulation/blocks/Block4_正常止血与病理循环整合_学习阅读版_v1_Batch2冻结版.md`。
- 当前教学位置：`content/xizong/projection/a1-circulation/chat/b04-teaching.md`；A1只读，没有在本任务改写。

## 局部正文和绑定变化

H1修准确引用；F3以三种消毒剂/两种创面可用药的对象区分替代旧坏Prompt诊断句；D14正面说明两个否定动作；F1只换Prompt绑定，隐藏正文逐字节不变。只改变4份教学文件，另117份教学文件不变；隐藏正文实际变化3份。C H8绑定现在由canonical候选读取，教学正文和隐藏版字节均不变。

七条候选均显示“隔离Prompt候选·未接受”及旧正式Prompt；其余1705条仍为原生正式完整Prompt。候选保持审阅身份，不是Lecture私有Prompt、更不是自动采纳。正式KP ID/顺序、Learning成员/goal/closure、Source owner、Runtime和真实学习证据均不变。

## 可审入口与验证限制

统一修正清单（历史工作档案坐标：`candidate-change-list.json`；本稿未附该文件） · 本轮8项合并canonical diff（历史工作档案坐标：`canonical-candidates/r2-focused.diff`；本稿未附该文件） · [三项新增及H1路由的逐项证明](canonical-candidates/r2-definite-repairs.json) · 当前教案索引（历史工作档案坐标：`delivery-index.json`；本稿未附该文件） · [有界读回](r2-verification.json) · 本轮文件变化（历史工作档案坐标：`r2-file-changes.csv`；本稿未附该文件）。

有界读回通过：七条绑定从准确canonical复制件读取；旧正式Prompt和未接受身份可见；隐藏正文等于独立作者稿去绑定；所有未改教学文件及R1完整档案hash保持。新增三个canonical复制件只改Prompt字段；H1复制件只含其既有三Prompt候选和准确引用修正。没有以作者核图制造学习者视觉完成证据。

该结果证明局部候选、组装和保留，不是正式医学采纳或用户学习完成。真实Source/版本分歧继续按R1记录并列，没有统一阈值。无push/merge/deploy；正式owner待父审决定采纳。

## 最后可移植性收尾

当前派生revision为`r2.1-portable-h1-reference-20261004`。H1原本机绝对链接已移除，正文改用稳定Block ID `circulation-b04`及repo相对canonical路径；作者稿、教学稿与隐藏版均没有`EXECUTION_ONLY_LOCAL/`依赖。七Prompt候选及`r2-focused.diff`内容不变。F3实际canonical标记与同owner的native resolver快照均返回`remaining-f03-kp02`，没有本轮重命名；此前`final-f03-kp02`仅为回报笔误。
