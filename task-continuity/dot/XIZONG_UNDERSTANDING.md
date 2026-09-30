# 西综理解记录：全流程与首批正文
更新：2026-09-30 19:03 UTC。状态：用户已重新明确授权持续理解全部考研系统设定并推进全西综；本文件保留早期正文阅读证据，后续架构/文件覆盖在[考研理解记录](EXAM_UNDERSTANDING.md)继续。不是产品验收或新的学习规则。

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
- 2026-09-30 16:37证据回收：B已有25份历史全文READ（D1–D11、M1–M10、G1–G4）；D已有18份（N1–N11、O1–O7）。该历史检查点时C/E与F9未证全文；C27已在下方第九节按固定237e576补齐，E/F与其余继续按实际覆盖补入
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


## 九、C27全文理解完成（2026-09-30 18:35 UTC）

固定候选237e576dc7169e21444785e9dae2dc15359e3f1c，C27份canonical全文实际阅读：423稳定KP、21,047行；5 Learning shards全对象及manifest已读，133 LG已核。父级复核27份缓存的Git blob和SHA256全部匹配ledger，无未补截断。这里新增C27 READ，与前81份历史阅读不重复，故跨版本可追溯正文READ并集为108个不同Block；旧81基线限制仍在，不宣称108份都已按最新head医学/网页验证。

| Block | exact blob | 行数 | KP |
|---|---|---:|---:|
| [H1](https://github.com/kianwang022-hash/kianos/blob/237e576dc7169e21444785e9dae2dc15359e3f1c/content/xizong/knowledge/systems/c-hematology-immunity-infection/blocks/血液系统_H1_造血CBC_Ret与骨髓诊断语言_学习阅读版_v1_最终执行版.md) | 3eefe13ce99f6e4bffa07c5bd7269a00d7b8f30e | 953 | 13 |
| [H2](https://github.com/kianwang022-hash/kianos/blob/237e576dc7169e21444785e9dae2dc15359e3f1c/content/xizong/knowledge/systems/c-hematology-immunity-infection/blocks/血液系统_H2_血型交叉配血与成分输血_学习阅读版_v1_最终执行版.md) | 20cd25a844df6608107a92f87b124d4fca81d2c7 | 1039 | 15 |
| [H3](https://github.com/kianwang022-hash/kianos/blob/237e576dc7169e21444785e9dae2dc15359e3f1c/content/xizong/knowledge/systems/c-hematology-immunity-infection/blocks/血液系统_H3_贫血总坐标缺铁与巨幼_学习阅读版_v1_最终执行版.md) | b6cbe71447ee7765935257b87e9a1edb16dfb326 | 1189 | 18 |
| [H4](https://github.com/kianwang022-hash/kianos/blob/237e576dc7169e21444785e9dae2dc15359e3f1c/content/xizong/knowledge/systems/c-hematology-immunity-infection/blocks/血液系统_H4_再生障碍性贫血_学习阅读版_v1_最终执行版.md) | 450d4d4e421e9264d7e9aca14cab4a1440a81613 | 878 | 14 |
| [H5](https://github.com/kianwang022-hash/kianos/blob/237e576dc7169e21444785e9dae2dc15359e3f1c/content/xizong/knowledge/systems/c-hematology-immunity-infection/blocks/血液系统_H5_溶血性贫血_学习阅读版_v1_最终执行版.md) | c4ccd477331d5ba995d2f6f2a127737cc0cfe455 | 1080 | 16 |
| [H6](https://github.com/kianwang022-hash/kianos/blob/237e576dc7169e21444785e9dae2dc15359e3f1c/content/xizong/knowledge/systems/c-hematology-immunity-infection/blocks/血液系统_H6_出血性疾病_学习阅读版_v1_最终执行版.md) | 967f82f66fa920c98c7b2b9ca7b19a085fd125f3 | 1116 | 18 |
| [H7](https://github.com/kianwang022-hash/kianos/blob/237e576dc7169e21444785e9dae2dc15359e3f1c/content/xizong/knowledge/systems/c-hematology-immunity-infection/blocks/血液系统_H7_克隆性造血与MDS_学习阅读版_v1_最终执行版.md) | bd25738fae343da62a42cdbcf27c1d43effcc9a1 | 778 | 13 |
| [H8](https://github.com/kianwang022-hash/kianos/blob/237e576dc7169e21444785e9dae2dc15359e3f1c/content/xizong/knowledge/systems/c-hematology-immunity-infection/blocks/血液系统_H8_多发性骨髓瘤MM_学习阅读版_v1_最终执行版.md) | 77be1471a694cb52aaf4bf500d1d7fdf50d6e842 | 880 | 16 |
| [H9](https://github.com/kianwang022-hash/kianos/blob/237e576dc7169e21444785e9dae2dc15359e3f1c/content/xizong/knowledge/systems/c-hematology-immunity-infection/blocks/血液系统_H9_急性白血病_学习阅读版_v1_最终执行版.md) | 373afa9ea42bdf484e0094ebd8ba070d2b4494e5 | 1150 | 29 |
| [H10](https://github.com/kianwang022-hash/kianos/blob/237e576dc7169e21444785e9dae2dc15359e3f1c/content/xizong/knowledge/systems/c-hematology-immunity-infection/blocks/血液系统_H10_慢性髓系白血病CML_学习阅读版_v1_最终执行版.md) | 476be28570152b5c8cc0a75c3a9f79611b34c3a1 | 564 | 10 |
| [H11](https://github.com/kianwang022-hash/kianos/blob/237e576dc7169e21444785e9dae2dc15359e3f1c/content/xizong/knowledge/systems/c-hematology-immunity-infection/blocks/血液系统_H11_淋巴瘤_学习阅读版_v1_最终执行版.md) | b68bd57724ee427dcb974464af408cae45abdba0 | 1137 | 32 |
| [H12](https://github.com/kianwang022-hash/kianos/blob/237e576dc7169e21444785e9dae2dc15359e3f1c/content/xizong/knowledge/systems/c-hematology-immunity-infection/blocks/血液系统_H12_免疫共同语言超敏反应与自身耐受_学习阅读版_v1_最终执行版.md) | d1c572a1e7e4dc3559ed8c72b08da34325e03c07 | 778 | 12 |
| [H13](https://github.com/kianwang022-hash/kianos/blob/237e576dc7169e21444785e9dae2dc15359e3f1c/content/xizong/knowledge/systems/c-hematology-immunity-infection/blocks/血液系统_H13_免疫缺陷与HIV_AIDS_学习阅读版_v1_最终执行版.md) | a992bd50a09810ee6937b4d86e7103feb6324d20 | 763 | 13 |
| [H14](https://github.com/kianwang022-hash/kianos/blob/237e576dc7169e21444785e9dae2dc15359e3f1c/content/xizong/knowledge/systems/c-hematology-immunity-infection/blocks/血液系统_H14_移植排斥与GVHD_学习阅读版_v1_最终执行版.md) | 347a86217db391ef1be36a7d14fdb38ad3e27124 | 710 | 12 |
| [H15](https://github.com/kianwang022-hash/kianos/blob/237e576dc7169e21444785e9dae2dc15359e3f1c/content/xizong/knowledge/systems/c-hematology-immunity-infection/blocks/血液系统_H15_风湿诊断语言与治疗角色_学习阅读版_v1_最终执行版.md) | ddd5114b0de94ec0035458ce8de09b326ba7d475 | 711 | 15 |
| [H16](https://github.com/kianwang022-hash/kianos/blob/237e576dc7169e21444785e9dae2dc15359e3f1c/content/xizong/knowledge/systems/c-hematology-immunity-infection/blocks/血液系统_H16_SLE与抗磷脂综合征APS_学习阅读版_v1_最终执行版.md) | c3959eb5637c6181387e7a570e7de696e17f420a | 759 | 21 |
| [H17](https://github.com/kianwang022-hash/kianos/blob/237e576dc7169e21444785e9dae2dc15359e3f1c/content/xizong/knowledge/systems/c-hematology-immunity-infection/blocks/血液系统_H17_类风湿关节炎RA_学习阅读版_v1_最终执行版.md) | 3cc44d030e35ed5a2df3cfb513d9bead4dbb2540 | 697 | 20 |
| [H18](https://github.com/kianwang022-hash/kianos/blob/237e576dc7169e21444785e9dae2dc15359e3f1c/content/xizong/knowledge/systems/c-hematology-immunity-infection/blocks/血液系统_H18_原发性干燥综合征_学习阅读版_v1_最终执行版.md) | f1847870f9bbb897ce03f7e3359125182a120841 | 514 | 12 |
| [H19](https://github.com/kianwang022-hash/kianos/blob/237e576dc7169e21444785e9dae2dc15359e3f1c/content/xizong/knowledge/systems/c-hematology-immunity-infection/blocks/血液系统_H19_系统性血管炎与贝赫切特病_学习阅读版_v1_最终执行版.md) | 6ca9c78ded121b2f4a6dd315288d5367008f6014 | 657 | 18 |
| [H20](https://github.com/kianwang022-hash/kianos/blob/237e576dc7169e21444785e9dae2dc15359e3f1c/content/xizong/knowledge/systems/c-hematology-immunity-infection/blocks/血液系统_H20_感染共同语言_学习阅读版_v1_最终执行版.md) | 47a7565570cc0c1ddbbb8cea7960079750213997 | 602 | 13 |
| [H21](https://github.com/kianwang022-hash/kianos/blob/237e576dc7169e21444785e9dae2dc15359e3f1c/content/xizong/knowledge/systems/c-hematology-immunity-infection/blocks/血液系统_H21_结核跨器官整合_学习阅读版_v1_最终执行版.md) | 89c006225a7dd21a94ffd85399b8eccb6b439480 | 559 | 13 |
| [H22](https://github.com/kianwang022-hash/kianos/blob/237e576dc7169e21444785e9dae2dc15359e3f1c/content/xizong/knowledge/systems/c-hematology-immunity-infection/blocks/血液系统_H22_流脑与乙脑_学习阅读版_v1_最终执行版.md) | 1166ae83e65e575035fafd3e51506143cc55c975 | 427 | 10 |
| [H23](https://github.com/kianwang022-hash/kianos/blob/237e576dc7169e21444785e9dae2dc15359e3f1c/content/xizong/knowledge/systems/c-hematology-immunity-infection/blocks/血液系统_H23_伤寒菌痢与感染性肠溃疡_学习阅读版_v1_最终执行版.md) | d5499e299f75eb988f959ee70603480625409a90 | 633 | 17 |
| [H24](https://github.com/kianwang022-hash/kianos/blob/237e576dc7169e21444785e9dae2dc15359e3f1c/content/xizong/knowledge/systems/c-hematology-immunity-infection/blocks/血液系统_H24_血吸虫病与性传播疾病_学习阅读版_v1_最终执行版.md) | 392217894cfa26e0d12b76a1a73353e7f5b266bd | 609 | 17 |
| [H25](https://github.com/kianwang022-hash/kianos/blob/237e576dc7169e21444785e9dae2dc15359e3f1c/content/xizong/knowledge/systems/c-hematology-immunity-infection/blocks/血液系统_H25_局部感染与源控制_学习阅读版_v1_最终执行版.md) | 54b82a7ba63f4bbf109672fc019a1557502803c8 | 741 | 16 |
| [H26](https://github.com/kianwang022-hash/kianos/blob/237e576dc7169e21444785e9dae2dc15359e3f1c/content/xizong/knowledge/systems/c-hematology-immunity-infection/blocks/血液系统_H26_脓毒症_学习阅读版_v1_最终执行版.md) | 100e0f1f5c8638f7b8965602bf00cd8715282461 | 523 | 9 |
| [H27](https://github.com/kianwang022-hash/kianos/blob/237e576dc7169e21444785e9dae2dc15359e3f1c/content/xizong/knowledge/systems/c-hematology-immunity-infection/blocks/血液系统_H27_破伤风与气性坏疽_学习阅读版_v1_最终执行版.md) | e9151a5e5873c4e3ae6e82cf583d28da298fce13 | 600 | 11 |

核心理解：
- C从血细胞生命史/五层诊断→贫血/止血→克隆与肿瘤证据→最低免疫语言→风湿器官组合→感染空间/源控/毒素模型，器官处置与完整药理不从接口扩成新课程。
- 6个非连续LG保持原成员：H1 [1,12,13]；H9 [10,11,12,13,19]；H14 [1,2,3,12]；H16 [2,3,4,5,8,9]；H19 [8,9,10,11,17]及[16,18]。不可退成min/max区间或重排canonical身份。
- H21是13KP、Outline Primary=0的合法整合Block，31 Recall不自动变学习债务。H24有两个自然Source Unit，不是每LG重新进Lecture。
- H15–19有4空格marker/heading和快速核对包装；快速核对仍是答案。Framework、诊断表、MI-G/MI-D、原图门禁和出口在KP外仍需按职责消费；出现‘边界’不等于formal adopted Boundary。
- H11有6个明确已恢复Visual束；这不证明C其他Block的旧VG描述都已解决，也不证明图片实际位置/timing。requires与benefits_from不可混为hard gate。

有界待核（未判医学错误/当前网页故障）：
1. Current病理Source manifest为27不带导图/195页，H12–14/H16–17原图仍命名带导图/P103–110，须原Source/Visual身份消歧，不直接删或rebase
2. H2当前SUR27-U30/PDF233–235，旧flow/routing/complete仍P189–190；H9/H10内科frontmatter与正文差1页；H27 Primary/body和source_pdf_end不同范围，须区分PDF/书页/题旁坐标
3. C Acceptance已P/R/E PASS却残留Next eligible P；Learning projection_boundary/外科U30/U34亦旧not compiled字样。更窄current gate优先，不据历史尾语重开工程
4. H12与H16/H17的Outline账目数字不同；外科U34 coarse映射列H25–27而H20也Primary U34/P252。先trace实际consumer与账目owner，不能凭数组叫漏投影

Source-map只读精确U30/U34与身份节（PARTIAL），原PDF/图片未逐页复验；未执行测试/网页/医学质量验收。完整结构阅读证据已保存，后续只将有消费者证据的具体缺陷回原#1113，不另立第二套owner。


## 十、E20全文理解完成（2026-09-30 19:03 UTC）

固定4a818ba50e994c6c681e1597677e157043b46036，SR1–SR6/E1–E14全文实际读完：20 Blocks、212稳定KP、12,026行；16个必要owner FULL与1个Source-map PARTIAL。父级全文读结构报告并独立核20缓存Git blob/SHA256、完整READ/无截断标记一致。跨版本distinct正文READ并集现在128（旧81+C27+E20），尚余B13/D9/F9在读；不是当前159医学/网页PASS。

| Block | exact blob | 行数 | KP |
|---|---|---:|---:|
| [SR1](https://github.com/kianwang022-hash/kianos/blob/4a818ba50e994c6c681e1597677e157043b46036/content/xizong/knowledge/systems/e-reproductive-breast/sr-sr1-sr6/生殖生理_SR1_生殖内分泌控制_学习阅读版_v1_最终执行版.md) | b53be2ff2571fb482aecfad36842c63ae6af3478 | 568 | 10 |
| [SR2](https://github.com/kianwang022-hash/kianos/blob/4a818ba50e994c6c681e1597677e157043b46036/content/xizong/knowledge/systems/e-reproductive-breast/sr-sr1-sr6/生殖生理_SR2_男性生殖_学习阅读版_v1_最终执行版.md) | e258eb174170172ff3695d30db62b399730361d0 | 608 | 11 |
| [SR3](https://github.com/kianwang022-hash/kianos/blob/4a818ba50e994c6c681e1597677e157043b46036/content/xizong/knowledge/systems/e-reproductive-breast/sr-sr1-sr6/生殖生理_SR3_女性激素与月经周期_学习阅读版_v1_最终执行版.md) | bc83884543f8db9aaa6d51bccf7ea0fdd7fc645b | 601 | 12 |
| [SR4](https://github.com/kianwang022-hash/kianos/blob/4a818ba50e994c6c681e1597677e157043b46036/content/xizong/knowledge/systems/e-reproductive-breast/sr-sr1-sr6/生殖生理_SR4_性激素合成与生命阶段来源_学习阅读版_v1_最终执行版.md) | 5144d634b611327e3895ef3811318ea85581ed92 | 468 | 8 |
| [SR5](https://github.com/kianwang022-hash/kianos/blob/4a818ba50e994c6c681e1597677e157043b46036/content/xizong/knowledge/systems/e-reproductive-breast/sr-sr1-sr6/生殖生理_SR5_受精妊娠黄体胎盘与分娩_学习阅读版_v1_最终执行版.md) | 55caacaa8489abda5305213cf9b47ad061a75174 | 550 | 10 |
| [SR6](https://github.com/kianwang022-hash/kianos/blob/4a818ba50e994c6c681e1597677e157043b46036/content/xizong/knowledge/systems/e-reproductive-breast/sr-sr1-sr6/生殖生理_SR6_泌乳射乳与正常乳腺_学习阅读版_v1_最终执行版.md) | a47251c667339860d5d8d83de22d5903b880ec78 | 538 | 10 |
| [E1](https://github.com/kianwang022-hash/kianos/blob/4a818ba50e994c6c681e1597677e157043b46036/content/xizong/knowledge/systems/e-reproductive-breast/e-e1-e14/生殖病理_E1_宫颈异位鳞化与慢性炎_学习阅读版_v1_最终执行版.md) | 3e230395f7a0e0924d2b41cf3801e73b4361e480 | 475 | 7 |
| [E2](https://github.com/kianwang022-hash/kianos/blob/4a818ba50e994c6c681e1597677e157043b46036/content/xizong/knowledge/systems/e-reproductive-breast/e-e1-e14/生殖病理_E2_高危HPV_SIL与宫颈癌_学习阅读版_v1_最终执行版.md) | 03e22caa8945b3cda407bc448d0599e6ffd4291b | 554 | 10 |
| [E3](https://github.com/kianwang022-hash/kianos/blob/4a818ba50e994c6c681e1597677e157043b46036/content/xizong/knowledge/systems/e-reproductive-breast/e-e1-e14/生殖病理_E3_内膜异位腺肌病与内膜增生_学习阅读版_v1_最终执行版.md) | 2332a14d20f7aa85d82434949002ae248ea05d14 | 496 | 8 |
| [E4](https://github.com/kianwang022-hash/kianos/blob/4a818ba50e994c6c681e1597677e157043b46036/content/xizong/knowledge/systems/e-reproductive-breast/e-e1-e14/生殖病理_E4_子宫平滑肌瘤与肉瘤_学习阅读版_v1_最终执行版.md) | ff09091f8bdf17c936c48c5551782f028f756caf | 443 | 7 |
| [E5](https://github.com/kianwang022-hash/kianos/blob/4a818ba50e994c6c681e1597677e157043b46036/content/xizong/knowledge/systems/e-reproductive-breast/e-e1-e14/生殖病理_E5_葡萄胎与绒毛遗传_学习阅读版_v1_最终执行版.md) | ffcbdec7afdab895fc751820ef50f29eed09ef18 | 600 | 9 |
| [E6](https://github.com/kianwang022-hash/kianos/blob/4a818ba50e994c6c681e1597677e157043b46036/content/xizong/knowledge/systems/e-reproductive-breast/e-e1-e14/生殖病理_E6_侵袭性葡萄胎绒癌与PSTT_学习阅读版_v1_最终执行版.md) | 195d565f67a2369b5cfa4bced428927539702dc7 | 666 | 10 |
| [E7](https://github.com/kianwang022-hash/kianos/blob/4a818ba50e994c6c681e1597677e157043b46036/content/xizong/knowledge/systems/e-reproductive-breast/e-e1-e14/生殖病理_E7_卵巢谱系与上皮性肿瘤_学习阅读版_v1_最终执行版.md) | 5c01c2c3eba26e1806adb6719a6625851464497a | 606 | 9 |
| [E8](https://github.com/kianwang022-hash/kianos/blob/4a818ba50e994c6c681e1597677e157043b46036/content/xizong/knowledge/systems/e-reproductive-breast/e-e1-e14/生殖病理_E8_卵巢生殖细胞与性索间质肿瘤_学习阅读版_v1_最终执行版.md) | 33c4ad327307dca19f9c8e4998614b982a5bacb0 | 648 | 11 |
| [E9](https://github.com/kianwang022-hash/kianos/blob/4a818ba50e994c6c681e1597677e157043b46036/content/xizong/knowledge/systems/e-reproductive-breast/e-e1-e14/生殖乳腺_E9_隐睾与鞘膜积液_学习阅读版_v1_最终执行版.md) | 675aa9aceb278cd68c4b888ded5a164d3755f41b | 421 | 7 |
| [E10](https://github.com/kianwang022-hash/kianos/blob/4a818ba50e994c6c681e1597677e157043b46036/content/xizong/knowledge/systems/e-reproductive-breast/e-e1-e14/生殖乳腺_E10_良性乳房与乳头症状_学习阅读版_v1_最终执行版.md) | 20cc12c05f4258bb0648d86b5e512195ebca2337 | 540 | 10 |
| [E11](https://github.com/kianwang022-hash/kianos/blob/4a818ba50e994c6c681e1597677e157043b46036/content/xizong/knowledge/systems/e-reproductive-breast/e-e1-e14/生殖乳腺_E11_哺乳期乳腺炎与乳房脓肿_学习阅读版_v1_最终执行版.md) | 62e9d8ba0ddb8417bafab2e59bf2255c95113650 | 548 | 10 |
| [E12](https://github.com/kianwang022-hash/kianos/blob/4a818ba50e994c6c681e1597677e157043b46036/content/xizong/knowledge/systems/e-reproductive-breast/e-e1-e14/生殖乳腺_E12_乳腺癌病理进展_学习阅读版_v1_最终执行版.md) | 3c2027a66e35245096624e111fd0ebb989b05604 | 950 | 19 |
| [E13](https://github.com/kianwang022-hash/kianos/blob/4a818ba50e994c6c681e1597677e157043b46036/content/xizong/knowledge/systems/e-reproductive-breast/e-e1-e14/生殖乳腺_E13_TNM分子亚型与诊断证据_学习阅读版_v1_最终执行版.md) | 2ec82141b419717fb04e7e3f8b2d3a762b7be6d2 | 911 | 18 |
| [E14](https://github.com/kianwang022-hash/kianos/blob/4a818ba50e994c6c681e1597677e157043b46036/content/xizong/knowledge/systems/e-reproductive-breast/e-e1-e14/生殖乳腺_E14_乳腺癌综合治疗_学习阅读版_v1_最终执行版.md) | 4e670ede96e918513130208f9479e28b54afa7f5 | 835 | 16 |

关键理解：
- E双主干为Control/Time与Tissue/Identity，不将局部侵犯和远处转移压成同一轴；负空间仍不包含完整妇产科、男科或现代肿瘤治疗。
- 67 LG成员在E内连续，但LG顺序/Source接触/release不是同一轴。11 whole Block、9 natural Source-unit；inside-E hard prerequisites为0，正文下一Block/最低标准不自动升成硬门禁。
- SR1首Unit仅contributes，不释放LG；E12病理Unit先释放LG03/04，外科Unit后释放LG01/02。partial贡献不能当组完成；E10-LG03保明确视觉gap，文本Recall不自动消除。
- 20份均有Framework/MemoryRouting/MI-G/MI-D；E1–8虽无Framework machine marker仍有明确内容，英文Detailed Expansion、中文快速核对和KP前Memory位置等须正确消费，不能统一模板丢答案。
- Current25个visual triggers、18个bundle usages是稀疏支持。重复crop用于不同LG合法；七个外科cue无local bundle不自动等于医学缺陷，external-primary原页与网页crop职责不同。
- E9/E11部分refined原页已验证，与System旧GAP总语句范围不同；E13/E14特定LG支持不扩大成全Block视觉恢复。病理名称/页坐标差异、旧S2或P/R/E construction尾语须按exact owner消歧，未trace不当新产品故障。

原Source PDF、裁图/显示timing、消费者、测试和真实U本批均未复验。大地图恢复、全文阅读与模式边界已交现有全159页面验收使用，不重开实现者或医学重写。
