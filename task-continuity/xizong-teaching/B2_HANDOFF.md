# A1 / B2 教学交接

状态：**五个 LG 的第一轮机制理解已跑完，当前进入 Block 级压缩与查漏。** 19个原有KP完整内容保留。这里仅记录引用、覆盖、后置和接续，不是第二教材，也不是Kian的已学或掌握记录。

## 先恢复学习，不恢复工程报告

Kian最新要求：一次备好整个Block 2并保存；后续一个LG一个LG学。学习回复只展开本组的医学因果、必要区别和少量具体KP补充，不展示仓库路径、SHA、读取流水或整块覆盖表。不要每组先重讲之前所有漏项，也不强制做Recall。

本对话已从 LG01 到 LG05 完成第一轮机制理解。讲法在实际学习中经过校准，当前稳定节奏为：**Block 总框架定位 → LG 与前后 LG 的联系 → LG 内部框架 → 连续机制推进 → 在节点嵌入原有考点与临床直觉 → 当场解决影响理解/判断的细节 → 最后压缩。** KP 是知识归属单位，不强制成为授课顺序。

当前自然断点：五个 LG 主线已结束。下一步按 **Block 母图压缩 → 逐 LG / KP 理解查漏 → 集中处理真正需要精确记忆的数字、名单、受体、阈值 → Kian 快速核 Lecture 作人工防漏与复习 → 补漏 → Block 重建 / Recall → 按既有规则接 Memory**。暂缓记忆必须挂回原 KP；“还没讲到”“讲过但仍未理解”“Recall 时答错”保持为不同状态，不自动制造复习债。

以上只记录 Chat 教学覆盖与下一步，不表示 Source 已核完、Recall 已通过或 learner 已掌握；此指针也不是网站 Resume。

## 当前内容与原负责位置

- 候选分支：`candidate/xizong-teaching-handoff-20261001`；未合并、未发布。
- System / Block：`circulation` / `circulation-b02`。
- **原Block内容与本次教学路线：** [Block 2](../../content/xizong/knowledge/systems/a1-circulation/blocks/Block2_循环调节与容量控制_学习阅读版_v4_最终执行版.md#b2-teaching-route)。完整医学正文、Prompt、Source、Memory仍在同一原文件，不在本目录另存讲稿。
- LG身份与成员：`content/xizong/knowledge/systems/a1-circulation/system.json` 的 `logic_index.circulation-b02`。
- Learning：`content/xizong/knowledge/learner/a1-circulation-learning.json` 的 `blocks.circulation-b02`。
- 图／精确支持：`content/xizong/knowledge/learner/a1-circulation-learning-cues.json` 的B2条目。
- 正式Learning与内容组合边界：`content/xizong/LEARNING_CONTRACT.md`、`content/xizong/LEARNER_OBJECT_CONTRACT.md`。本次未改这些规则或任何网页消费者。

新教学表达使用原Framework内的 `b2-teaching-route`，下设 `b2-teaching-lg01` 至 `b2-teaching-lg05`。这只是已有Block的阅读组织，不增加正式层级、不改LG／KP身份，也不把长文塞入goal／closure字段。以后更新同处，不另建v5/v6讲稿。

## 五组覆盖索引

| 讲解对象 | KP范围 | 原Block内教学锚点 | 本次准备范围 |
|---|---|---|---|
| circulation-b02-lg01 感知与急性调节总链 | KP01–04 | b2-teaching-lg01 | 感知层分工、失血与时间接力、反射区别及精确补充位置 |
| circulation-b02-lg02 神经快速执行 | KP05–07 | b2-teaching-lg02 | 神经输出、四类血管神经、儿茶酚胺直接／净效应与剂量条件 |
| circulation-b02-lg03 体液—肾容量接力 | KP08–13 | b2-teaching-lg03 | 肾素入口、RAAS、钠与水区别、反向制衡和长期闭环 |
| circulation-b02-lg04 局部血流修正 | KP14–16 | b2-teaching-lg04 | 介质机制区别、全身分配与局部需求、器官场景 |
| circulation-b02-lg05 场景、时间意义与最终压缩 | KP17–19 | b2-teaching-lg05 | 五场景、急慢性代价、药物机制边界、统一算法 |

以下是核对索引，不复制原Core。所有“补充”均回同一Block的对应KP；达到该KP或需要精确辨析时展开，不自动生成Memory／Repair任务。

| 原KP | LG内保留的理解职责 | 本轮可后置的具体补充 |
|---|---|---|
| KP01 急性失血时间接力 | 先辨失血造成的变量变化；各控制层救什么；时间尺度非严格排队 | KP01完整失血闭环与效应器变量对照 |
| KP02 窦弓反射 | 牵张与放电方向、双向反馈、传入区别、重调定及长期边界 | KP02精确解剖、夹闭实验、曲线坐标／特点 |
| KP03 化学／脑缺血／库欣 | 外周化学与中枢缺血不混；危急灌注的保护方向 | KP03约80 mmHg讲义条件、完整场景和感受器分工 |
| KP04 心肺容量／心交感传入 | 充盈控制与缺血维压的任务／方向区别 | KP04刺激名单、四类反射总表 |
| KP05 自主神经输出 | 泵、微动脉、静脉、球旁细胞及迷走作用边界 | KP05左右侧分布、完整四正／四负比较 |
| KP06 血管神经支配 | 四类纤维、递质、紧张性、典型部位；轴突反射无中枢整合 | KP06完整分布梯度、原图与冠脉特殊；不得当作已被KP05覆盖 |
| KP07 儿茶酚胺 | 直接受体与反射净效应、NA净HR、Adr剂量／部位、α阻断翻转、ACh—N1桥 | KP07 80/20比例、完整受体／剂量图、冠脉、合成／释放和疾病接口 |
| KP08 肾素与RAAS主链 | 三入口各自感受什么；肾素作用于底物而非变成Ang；舒缩方向不能代替肾素方向 | KP08同义名称、全部化学促／抑因素及完整链 |
| KP09 AngⅡ／AngⅢ | 保压／增容量／交感／重构、肾素负反馈及AngⅡ／Ⅲ区别 | KP09肾内浓度、系膜／小管、CRH／ACTH和完整作用名单 |
| KP10 醛固酮 | 保钠带水排钾；核受体与RAAS／血K输入 | KP10允许作用、精确释放因素、原醛与Liddle |
| KP11 ADH／VP／AVP | 下丘脑合成、V2与AQP2膜侧、渗透压和容量输入、V1条件 | KP11完整释放因素、尿素通道、DI／SIADH接口 |
| KP12 ANP／BNP | 牵张信号、滤过与重吸收双路、对RAAS／ADH制衡、BNP因果位置 | KP12入球／系膜／Kf／GFR、精确刺激及心衰阈值接口 |
| KP13 肾—体液长期调压 | 压力性利钠／利尿完整闭环，不能只背“长期靠肾” | KP13双向变量重建；完整肾单位内容仍归泌尿 |
| KP14 ET／NO／PGI2／EDHF | 收缩与舒张、NO信号与EDHF超极化不混、非扩管作用和PG方向 | KP14释放刺激、切应力、完整原图与精确信号 |
| KP15 其他舒血管因子 | 缓激肽双角色、ADM不等于儿茶酚胺、CGRP接回轴突反射 | KP15受体／来源、低频介质、“最强”讲义口径、药物接口 |
| KP16 全身与局部 | 器官需求和整体保压并看；冠脉直接／代谢效应；局部调节非无条件覆盖 | KP16分布梯度、心脑／活动肌／失血完整比较 |
| KP17 场景 | 站立分布≠失血；等渗负荷≠清水；水丢失比例决定渗透场景 | KP17五场景完整变量／激素／尿量矩阵 |
| KP18 急慢性与药物 | 急性收益与慢性代价；有效灌注≠总容量；药物作用层≠临床方案 | KP18药物断点、精确名单；完整方案归B5／B11等原对象 |
| KP19 最终算法 | 同一个算法收拢全Block，不再造一套并行总结 | KP19与原Block闭卷出口供准备好后自主重建 |

## Source：已读取与未验证分开

本次工作依据main现行Content／Learning并结合本对话实际读取的原讲义，不只凭先前助手声称“读过”。

原附件指纹：
- `生理学讲义_AI阅读版(1).md`：SHA256 `8666f5e534b812803970194926d8d48c2309b8223dc54356b3f01559264acf97`。
- `27精编生理合集【带导图】.pdf`：SHA256 `0ad07df50037258eb87cf778ad70ab9e9fb1deed6d06d72cd35ba8241656e123`，438页。

文本读取依据：本对话可见实际读取范围包含10553–10592、10654–11343、11421–11490、11515–11561、19390–19779行；本次又补读11330–11589行，覆盖此前薄弱的BNP、ADM、血管神经和轴突反射。范围表示读取证据，不表示逐句正确性或全文覆盖认证。

本次在工作容器逐页打开核对的原PDF图表：**物理P156、P157、P158、P159、P160、P164、P282、P284**，对应既有B2七项原图绑定（儿茶酚胺绑定占两页）。P150／153／154／155另有总览读取；不能扩大为全部22页或所有旁注均已逐图细审。没有修改用户设备或任何私人学习存储。

定位与解释限制：
- KP08原Core没有独立精确locator字段；本次实际确认原PDF P156为肾素三入口、P157为RAAS图、P280为泌尿调节补充。教学可据此定位对应内容，但未声称网站locator字段已修复。
- KP13的压力性利钠／利尿闭环来自现行canonical整合；原Lecture P154含长期肾—体液／容量调压说明。本次未找到同名完整Source段落，不伪称逐字原页核验。
- 原讲义里的“最强”、受体排序、精确阈值与临床药物组合须保留课程／版本语境；本次不是最新临床指南审核，不将其扩写为无条件医学结论。
- 本次补齐了教学组织，不宣称全部原PDF文字／全部TTSX／71题关系已独立重验。既有原图可供学习，但助手读图不等于Kian完成Source或原图学习门槛。

## 写回与验证

本轮只改三个既有文件：原Block 2、教学README、本文。没有新建第二讲稿、Current、Contract、registry；没有修改19个KP的Prompt／Core／Source字段，也没有修改Learning、系统成员、图绑定或Runtime。

对照基准：
- main B2 Content blob：`fbe99532f7e275c7eb94dc53a70fb248ac461727`。
- main B2 Learning blob：`de71f997b53d51bc867715b69cdbe748ed9c7fc9`。
- main A1 cues blob：`af41aa00dabe9c9d0bf1f5b1c940359f3c4b5212`。
- 新候选B2 blob：`6220d079d4556cf07515c8d423bc044702b0e51b`；提交 `37da4dc1d1d49a755e36765ef4e9d0d7bc47a97c`，已回读其教学段与blob。
- 新候选README blob：`9261d533fc64881bef0d8c4f4bf8b5933b074b33`，已回读“整块备课、逐LG授课”及学习优先要求。

验证：取出新增Framework教学段可逐字节恢复原B2文件，其Git blob与main基准一致；原KP01至文件末尾保持一致，19个KP标题、Prompt、完整Core、原Source／Outline／Memory／附录均保留。新增五个LG段均含母线、必留和具体KP补充。

候选保存不等于网站已显示：未做网站渲染／投影／Source完成流程验收，未合并、未发布；不接手#1113另一条状态修复。真实Source完成、Recall、掌握和Resume未读取或改写。发现上游变化时只复核真正受影响的对应段，不每次重开全仓核对。
