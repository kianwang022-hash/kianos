# 西综理解记录：全流程与首批正文
更新：2026-09-30 16:39 UTC。状态：用户已重新明确授权持续理解全部考研系统设定并推进全西综；本文件保留早期正文阅读证据，后续架构/文件覆盖在[考研理解记录](EXAM_UNDERSTANDING.md)继续。不是产品验收或新的学习规则。

## 一、恢复时先记住什么
- 当前任务先读懂现有西综，再讨论最小责任位置的落地；不能用新架构替代已有知识与学习设计
- 用户给出的旧Chat总结是需求参考，最新规则、代码与完成状态仍回原负责文件
- 正式层级为System→Block→Logic Group→KP；不同Source模式、学习顺序、支持时机允许有真实差异
- 内容更新不得删除真实学习历史或仅因文件指纹变化强迫整Block重学；具体执行遵循当前study-policy
- 本记录只保存理解、出处和覆盖；医学正文不复制，避免形成第二知识源

## 二、已读与未读
正文基线：fc15d131bbfb65f3268f5445918502a6e515d49d；已比较到91032a2f，以下canonical Block正文未变。之后977881d只更新任务接续记录。

已全文阅读：
- A1循环：12 Block、312 KP，含Framework、Prompt/Core、Memory Routing、Source/Outline、出口及附录
- A2呼吸：12 Block、236 KP，含同类全部正文
- A3泌尿：14 Block、257 KP全部正文已读；其中B3–B14为12份、11,410逻辑行、228 KP，包含KP以外的独立章节
- 2026-09-30 16:37证据回收：B已有25份历史全文READ（D1–D11、M1–M10、G1–G4）；D已有18份（N1–N11、O1–O7）。C/E与F9未由现有台账证明全文完成；其余继续按实际覆盖补入
- A宏域LOGIC/CONTENT/LEARN，知识manifest/README，Guide/preentry合同及Source manifest
- 全流程合同、学习策略、Memory/Practice/Repair/Return/成熟度的规则与职责已梳理；大型支持目录不是已逐条医学核验

不混淆：
- 159 Block机器结构索引不等于159份正文全文理解
- 本轮没有逐页核验原PDF图像、全部医学论断或真实网页
- 历史回执已分类，不作为当前规则逐条恢复
- 全量accepted support到网页的消费证明尚未完成

## 三、完整学习链已有定义
可信Source→机制化Knowledge→按系统真实Source单位建立模型→KP主动Recall→LG/Block/System重建→官方题应用→最小因果Repair→回原学习现场→必要的新情境和延迟验证。

重要区分：
1. 原讲义顺序、canonical身份顺序、LG检索顺序和做题顺序不是同一条轴
2. Memory资产release不等于全部进入复习债务；有选择地接纳、保留与延迟复验
3. Repair完成不自动成为掌握；同题改对、陌生迁移、延迟提取和整卷表现分别是不同证据
4. 原生Resume拥有实际位置；默认课程顺序不能代替用户真实进度
5. Return传输接收、原生应用与用户完成Repair是不同事实

规则入口：
- [学习合同](../../content/xizong/LEARNING_CONTRACT.md)
- [学习策略](../../content/xizong/knowledge/learner/study-policy.json)
- [成熟度与退出条件](../../content/xizong/MATURITY_PACKAGE.md)
- [Learner Object合同](../../content/xizong/LEARNER_OBJECT_CONTRACT.md)

## 四、A1循环理解
知识主线完整：正常机械循环、调节、电活动和止血→慢性血管底物与局部结构疾病→节律、心衰、休克共同终点。正文已包含丰富机制、鉴别、反事实、Source-specific Precision和后续系统接口。

authoring并不统一：12份中九份无frontmatter、三份有；稳定身份可能在标题、显式标记或系统绑定。形式差异不能直接判医学知识缺失，也不能先统一改名。

B10的旧Outline完成门槛、B12旧外科页码附录已经有既存候选处理。恢复时应先读#1113和candidate/a1-content-review-07724cfe，避免把既有人做的修复当成全新任务。

## 五、A2呼吸理解
共同主线是控制器/机械泵→通气→肺泡/膜→灌注匹配→血红蛋白运输→组织供氧；疾病分别破坏不同位置，R12汇合到氧合或通气失败。跨Block再激活已在专门pathways内表达，不必Chat临场制造关系。

一个已确认的文字层冲突：
- R7出口仍写完成80道Outline验收后进入下一Block
- R8明确Outline是Coverage Safety Net，不要求逐题清零
- R10更明确不要求完成38题才进入R11
这说明同一系统还保留不同阶段的执行语句。它是当前正文中的真实不一致，但尚不是网页实际错误设门的证明。下一阶段应核当前学习策略、精确消费者及这些句子的可见位置。

Source并非绝不允许纠错：R9-SC01已显式裁决PDE5第二信使；R10-SC01已裁决药物相关胸水分类；R11-SG01区分讲义一般配对与正式2026单选答案。这些已有有来源的裁决必须保留，不能统一还原旧讲义或擅自静默更新。

支持资产也有不同合法时机：
- A2三份结构表是REFERENCE_ONLY、默认折叠
- A3利尿剂对照表是POST_REVEAL；肾单位空间图可在LEARNING_MOMENT展开
- “已存在却没默认展开”不自动等于漏投影，须按accepted timing逐对象核对

## 六、A3泌尿理解
B1/B2建立地图与滤过；B3小管分段机制；B4浓缩和激素肾端；B5容量、电解质和酸碱整合；B6尿证据与功能。B7功能衰竭、B8感染、B9双坐标、B10/B11肾炎/肾病、B12–B14尿路与外科是不同认知任务，不应强行统一为一种短卡片。

已定位但未直接修复：
- B8独立§13承载肾乳头坏死、局部脓肿、尿源性脓毒症及感染+梗阻接口，不在KP01–17内部。后续消费对账不能只数KP；当前是否被合适位置消费尚待证明
- B14仍保留“B5 acid-base blocker / NOT_RUN_B5_STILL_BLOCKED”，而B5明确已有窄范围外部Source准入和诊断算法补齐。该旧句不能直接当当前A3 blocker
- 页码存在PDF物理页、书页、source-local标识多个坐标，须由当前Source map消歧
- B9–B11使用整体粗体主提示和快速核对；后者仍是回答内容，不应因为标题不同丢失或提前泄露
- B5准入只覆盖既定代偿/混合诊断与AG/delta，不自动扩展治疗、ICU或新课程

## 七、标签要按职责看
当前看见至少六类不同轴：
- 身份：System/Block/LG/KP、稳定ID及精确别名
- 知识职责：Prompt/Core/Framework/Boundary/Connection/Precision/MedicalVisual
- 学习时机：当前内容、Reserve、Hook、Deferred、post-reveal
- 个人状态：接触、Recall、rating、mark、Repair、Resume、延迟稳定性
- 来源与范围：Primary/Recall/Apply、Source locator、Outline、Source conflict
- 工程历史：batch、PASS、construction boundary、旧验收说明

这些轴可以共存，但消费者不能凭同名词猜含义。尤其detailMarkdown仍是完整Core，MI-G/MI-D不是个人队列，MedicalVisual不是界面Visual，旧PASS不是当前网页证据。

## 八、当前接续边界

此前10:32的“暂停正文、先对齐规则”是历史决定，已被用户后续持续推进及14:41–14:47的完整考研理解/全西综授权更新，不再作为当前全局暂停指令。

- 全西综范围覆盖所有8系统，不以A1通过替代；同时注意2517个编号KP不包含O9保留overlay的22KP，也不能替代Block级Framework/MemoryRouting/MI-G/MI-D、A宏域整合及其他有效非KP内容的消费核对。
- 当前必须系统性理解相关架构/规则/资产/代码/网页/反馈关系，文件覆盖以实际读取及版本证据为准。现已对账到81个不同Block的历史READ：A1/A2/A3合计38、B25、D18。55份worker台账有完整行范围、无截断声明和匹配本地副本的SHA256；父26份只有READING_STATUS清单/基线，证据粒度较弱。旧47说法不完整，F9仍缺可追溯证据。基线是fc15→91032时期，当前main/候选需逐path/blob的delta核对；这不是81份当前医学复验或网页QA。
- 后续内容质量审查按既有规则与exact Source，保留有效资产，有依据才优化，改前有可恢复备份。
- 实施进度、候选、真实阻塞与验收由[#1113](https://github.com/kianwang022-hash/kianos/issues/1113)拥有；考研闭环由#1111，完整理解/三仓审查由Personal#61。本文不再复制易过期的产品状态。
- 未获得完整验证或权限的依赖链保持明确未验证/阻塞；独立已授权工作继续。无merge/Stable部署或真实学习重置的自动授权。
