# 考研系统理解与阅读覆盖

检查点：2026-09-30 14:49 UTC。范围由Personal任务#61及#60拥有；本文件是用户要求的阅读证据和恢复索引，不是产品合同、全局依赖图或Acceptance owner。

## 任务目标

完整理解考研系统的相关文件与设定，能从用户需求准确找到原规则、canonical资产、代码消费者、网页行为与反馈路径。现有修复并行收尾；全西综包括8系统/159Block/2517KP。之后的内容质量优化必须读取既有规则和exact Source，保留好资产并有备份。完整目标见[#61](https://github.com/kianwang022-hash/kian-personal-os/issues/61#issuecomment-5913681526)。

## 覆盖定义

- INVENTORIED：仅知道文件存在
- READ：正文完整读过，记录blob；不等于医学/实现已验证
- TRACED：已沿原引用核到实际消费者
- VERIFIED：必须附具体执行版本与证据；不能由READ推断

以下只记录本轮真实完成的阅读，不把历史摘要、机器索引或工具已下载但未完整审读计为READ。全量文件分母尚未完成清点，不能报百分比。

## 本轮完整阅读

基线：main b96811914cd4716dfc742d809ebdf09ad1243e23；部分同blob从候选49a08f读取。

| 文件 | blob | 状态 |
|---|---|---|
| AGENTS.md | 5b7cc02e50f40bcf2e1fdb439344ee927a7f9079 | READ |
| PROJECT_DEFINITION.md | 178119a118ca80c5fa978386b916aa6b20cacf2a | READ |
| ARCHITECTURE.md | 33a702259fa8abfc478a3814d4732a5e568ea2b1 | READ |
| SYSTEM_CONTRACT.md | 41ed0589e1e0054b8951682b679774c4dd7f8da7 | READ |
| LEARNING_ASSET_STANDARD.md | c13a6080583d4223339d4ad9be884b8fe05a49a8 | READ |
| LEARNING_ACCEPTANCE.md | 9feed4ff7a8711be528c84747ac2a34ae9aea4eb | READ |
| AUTHORITY_INHERITANCE_CONTRACT.md | db7c06afee02df13a772947404e155297d95ec16 | READ |
| AUTHORITY_OWNERSHIP.json | 75ad4eed4ffb73ca47cf0d2084febe9ab3463991 | READ |

西综本轮完整阅读：CURRENT.md、CONTENT_MAINLINE.md、LEARNING_CONTRACT.md、ACCEPTANCE.md，基线候选49a08f。8个System的ACCEPTANCE已获取并逐一读当前gate/边界节，但本轮未逐一完整审读全部历史正文；不能记为8份全文READ。先前医学正文覆盖仍见XIZONG_UNDERSTANDING.md的原版本记录，不从本轮架构阅读增加KP计数。

## 已恢复的责任关系（索引性结论，规则仍归原文件）

1. PROJECT_DEFINITION拥有产品目的；ARCHITECTURE拥有职责分工；Contracts/Standards约束实现；CURRENT只路由工程任务。根文件不是新的学习进度数据库。
2. Rule/Model决定意义；Content包含Source与Knowledge；Visual决定已接受意义的呈现；Engineering包含Runtime；Website消费它们；真实Evidence返回Chat。Source、Projection、Runtime不是必须另立的顶层语义层。
3. Source→Knowledge→Learning→Content→Presentation/Runtime是构建因果链；Orientation→形成模型→深化→压缩→应用→Repair是学习认知链，不能混成一套页面步骤。
4. 一事实一owner；合法refinement、live reference、derived projection、reviewed derivation与bounded snapshot有不同新鲜度规则。关系hash是复审版本证据，不是医学身份；不能无复审盲盖hash。
5. 共享平台具体路径已由AUTHORITY_OWNERSHIP.json登记，后续沿该登记逐一trace，不另建平行registry。Private Control、Checkpoint、Timer、Current delivery各有现成owner。
6. 当前发布链明确区分main/control mirror与immutable served release，只有served SHA变化才代表浏览器内容更新。GitHub写入不等于网页已上线。
7. S/K/L/P/R/E/U是验收维度，不是产品层级。各System当前历史accepted scope可复用，但不能替代当前候选的真实依赖验证。全西综验收不能由A1推断。
8. LEARNING_ACCEPTANCE §5.9要求材料性首次真实使用前的精确候选对抗审查；同一生产者自测不是最强独立证据，必须如实标注。合成使用不成为Kian真实U。

## 下一批阅读

- 考研总目标/Orchestrator规则与derived current，及Personal exam角色、安排/复盘/跨日连续性/控制通道
- 网站Presentation、Product、各科Visual和实际共享Shell/导航/状态/Packet消费者
- 西综原生Content/learner object/projection/support/Source各责任层与8系统差异
- 英语/词汇/政治的Learning、Content、交互和Evidence owners
- 按真实目录清点剩余文件，逐批读取并补实际blob覆盖；相关代码与验收脚本分别标明trace和执行证据

当前尚未完成全量理解。先前报告的具体断点仍回#1113/#1111；本文件不复制第二份可变缺陷清单。

## 第二批完整阅读（2026-09-30 14:53 UTC）

| 原文件 | blob | 状态 |
|---|---|---|
| [EXAM_ORCHESTRATOR_CONTRACT.md](https://github.com/kianwang022-hash/kianos/blob/1bbd920a34b93b35d56cc38734303641e40f42d9/EXAM_ORCHESTRATOR_CONTRACT.md) | 9ac48cfb2a16cd35ad187c712b9ea25dcd25930a | READ |
| [EXAM_ORCHESTRATOR_CURRENT.json](https://github.com/kianwang022-hash/kianos/blob/main/EXAM_ORCHESTRATOR_CURRENT.json) | 7a808c84fd79451fb609bc68cc8ad1a1194d41d0 | READ |
| [CHAT_ROUTER.md](https://github.com/kianwang022-hash/kian-personal-os/blob/main/exam/CHAT_ROUTER.md) | eb25535e4181cd0e3dc678b84570105387a32312 | READ |
| [XIZONG.md](https://github.com/kianwang022-hash/kian-personal-os/blob/main/exam/roles/XIZONG.md) | 0fa4ce92c4068aff4f558a8f82f93b7cb3ca6a49 | READ |
| [ENGLISH.md](https://github.com/kianwang022-hash/kian-personal-os/blob/main/exam/roles/ENGLISH.md) | ed1d1f632a88e809efd4656c9f675946877f24f0 | READ |
| [POLITICS.md](https://github.com/kianwang022-hash/kian-personal-os/blob/main/exam/roles/POLITICS.md) | 25896455c9caa93649f5309dd8b8783393d54c6a | READ |
| [STEWARD.md](https://github.com/kianwang022-hash/kian-personal-os/blob/main/exam/roles/STEWARD.md) | 8fb26459e7353864b5e59f663dd18eb7bcdaf324 | READ |
| [REVIEW.md](https://github.com/kianwang022-hash/kian-personal-os/blob/main/exam/roles/REVIEW.md) | e432f2b29f8786fa44be8376ceb2e574133da60a | READ |
| [DAILY_SUBJECT_CHAT_CONTRACT.md](https://github.com/kianwang022-hash/kian-personal-os/blob/main/exam/DAILY_SUBJECT_CHAT_CONTRACT.md) | 98e5d26cee88dbe5ee7b64b69e9a479b875898f1 | READ |
| [README.md](https://github.com/kianwang022-hash/kian-personal-os/blob/main/runtime/kianos-control/README.md) | 70b9bac733e53f2760282dfdeccdcbbfd168cb21 | READ |
| [PRESENTATION_CONTRACT.md](https://github.com/kianwang022-hash/kianos/blob/1bbd920a34b93b35d56cc38734303641e40f42d9/static-web/PRESENTATION_CONTRACT.md) | b8a1858d23771209529d66cb58e4350546ec84c4 | READ |
| [KIAN_UI_PREFERENCES.md](https://github.com/kianwang022-hash/kianos/blob/1bbd920a34b93b35d56cc38734303641e40f42d9/static-web/KIAN_UI_PREFERENCES.md) | 5d81981af452c79c0cd8f75cb53d02597a6e9158 | READ |
| [LEARNER_OBJECT_CONTRACT.md](https://github.com/kianwang022-hash/kianos/blob/49a08f922921bb21d0aa03cc0ad754c4d1d8f2fa/content/xizong/LEARNER_OBJECT_CONTRACT.md) | 85cae51220d6e5a14478206031e9baa58e81ea66 | READ |
| [PROJECTION_CONTRACT.md](https://github.com/kianwang022-hash/kianos/blob/49a08f922921bb21d0aa03cc0ad754c4d1d8f2fa/content/xizong/projection/PROJECTION_CONTRACT.md) | c52306f7bf087472ccb48ffa29502ba0d21420f1 | READ |
| [XIZONG_PRODUCT_BRIEF.md](https://github.com/kianwang022-hash/kianos/blob/49a08f922921bb21d0aa03cc0ad754c4d1d8f2fa/static-web/XIZONG_PRODUCT_BRIEF.md) | 8d933ac5664099e73c2284014f8599760fcb1e6f | READ |
| [XIZONG_UI_REVIEW_PROTOCOL.md](https://github.com/kianwang022-hash/kianos/blob/49a08f922921bb21d0aa03cc0ad754c4d1d8f2fa/static-web/XIZONG_UI_REVIEW_PROTOCOL.md) | 01fe5502dfe7370bf5fa67f7be87669ebd3e95b4 | READ |

Personal KERNEL §6另作精确段落阅读，blob c41216b18963dd4c2d0fb76405e572d07b6c4d96；不宣称该文件全文已读。

本批恢复的关键接口：
- 考研总调度由Chat作判断，网页验证/执行/呈现；同日计划依真实Packet basis，缺失时允许建议/native Resume但不能编造可执行计划。
- 三科学习角色各自解释native evidence；Steward负责安排而不代替科内教学；Review消费实质更正，不能把最新NONE标签当成旧错误已被吸收。
- subject synthesis是有来源的解释/更正而非第二学习数据库；跨日找最近有效记录，不机械退到昨天或要求用户重报。
- 控制通道的提交、APPLIED/IDEMPOTENT的ID+hash匹配、实际效果readback、用户完成是四个不同事实。现有支持的wire不是所有Return都已自动接通。
- Visual沿已接受布局维护；内容全量消费仍按cognitive job和timing，不能把每字段铺成卡片。KP Context许可不覆盖POST_REVEAL；Block/System Front更严格。
- XizongUI必须读完整受影响学习链后再局部优化，使用KEEP/OPTIMIZE/RESTORE_FROM_CURRENT/DEMOTE；不因更漂亮而重建流程。

待核的文档一致性观察（不是已证实产品故障）：Orchestrator §9示例仍写10/21，而正式HardGate与derived Current为10/20；XizongProductBrief仍有“schema/renderer等open”的描述，需对照更窄Current Projection/Acceptance/实际消费者，不能直接把旧文字当现行阻塞。全科System Acceptance中也存在历史阶段UNTESTED段落，必须与明确当前gate分开读取。

## 第三批：西综规则到消费者（2026-09-30 15:21 UTC）

| 原文件 | blob | 状态 |
|---|---|---|
| [XIZONG_BLOCK_WORKSPACE_DESIGN.md](https://github.com/kianwang022-hash/kianos/blob/49a08f922921bb21d0aa03cc0ad754c4d1d8f2fa/static-web/XIZONG_BLOCK_WORKSPACE_DESIGN.md) | 9bb788ced4cff027bc2193e90918717fcb65cb37 | READ |
| [XizongMemoryReleaseBridge.astro](https://github.com/kianwang022-hash/kianos/blob/66371b71b68c5941de33f23d2ae421050cf2d0c2/static-web/src/components/XizongMemoryReleaseBridge.astro) | 4f3f5d80e13258c4a05e50c6e8e13412862099b9 | READ |
| [xizongMemoryAutoRelease.mjs](https://github.com/kianwang022-hash/kianos/blob/66371b71b68c5941de33f23d2ae421050cf2d0c2/static-web/src/lib/xizongMemoryAutoRelease.mjs) | c773ac429a2245de9ceb943c304e31777a81c6dc | READ |
| [study-policy.json](https://github.com/kianwang022-hash/kianos/blob/49a08f922921bb21d0aa03cc0ad754c4d1d8f2fa/content/xizong/knowledge/learner/study-policy.json) | 5f90fdaa24083e79e9d912bbfbeb5cb21b972656 | READ |
| [BIOCHEMISTRY_CONTRACT.md](https://github.com/kianwang022-hash/kianos/blob/49a08f922921bb21d0aa03cc0ad754c4d1d8f2fa/content/xizong/knowledge/learner/BIOCHEMISTRY_CONTRACT.md) | 1753312867b18352dbdb6c045ea49ad0028b60b4 | READ |
| [SURGERY_CONTRACT.md](https://github.com/kianwang022-hash/kianos/blob/49a08f922921bb21d0aa03cc0ad754c4d1d8f2fa/content/xizong/knowledge/learner/SURGERY_CONTRACT.md) | c706a6be39c330b1a16d5bc2d76a5b359648af00 | READ |
| [README.md](https://github.com/kianwang022-hash/kianos/blob/49a08f922921bb21d0aa03cc0ad754c4d1d8f2fa/content/xizong/knowledge/README.md) | df2e8b5af34a95a49d2a25f3426d3673821b2ebd | READ |
| [manifest.json](https://github.com/kianwang022-hash/kianos/blob/49a08f922921bb21d0aa03cc0ad754c4d1d8f2fa/content/xizong/knowledge/manifest.json) | 03a35b2010516f5d1dc29b44f5a5d6fd95a414c4 | READ |
| [xizongLearnerProjection.mjs](https://github.com/kianwang022-hash/kianos/blob/66371b71b68c5941de33f23d2ae421050cf2d0c2/static-web/src/lib/xizongLearnerProjection.mjs) | 353cecfe00418a7d078961dc4a9ad62c48efb76b | READ |
| [xizongSemanticAdapter.mjs](https://github.com/kianwang022-hash/kianos/blob/66371b71b68c5941de33f23d2ae421050cf2d0c2/static-web/src/lib/xizongSemanticAdapter.mjs) | 790bb40391b631cb4aecb8bd49839f294d37807b | READ |
| [xizongProductionProjection.mjs](https://github.com/kianwang022-hash/kianos/blob/49a08f922921bb21d0aa03cc0ad754c4d1d8f2fa/static-web/src/lib/xizongProductionProjection.mjs) | 7f41bb60caf5fd450eaf76a184362860b39ee655 | READ |
| [inspect-xizong-content.mjs](https://github.com/kianwang022-hash/kianos/blob/49a08f922921bb21d0aa03cc0ad754c4d1d8f2fa/static-web/scripts/inspect-xizong-content.mjs) | 47d51ef91c3e428a7ae5bb9c3106ccacc6fc4077 | READ |
| [test-xizong-a1-content-consumption.mjs](https://github.com/kianwang022-hash/kianos/blob/49a08f922921bb21d0aa03cc0ad754c4d1d8f2fa/static-web/scripts/test-xizong-a1-content-consumption.mjs) | 4b944b539792295585712f375de736e9d5fedfde | READ |
| [validate-xizong-a2-runtime.mjs](https://github.com/kianwang022-hash/kianos/blob/66371b71b68c5941de33f23d2ae421050cf2d0c2/static-web/scripts/validate-xizong-a2-runtime.mjs) | 964c6ae1e03c1d3b781b3cbcf59510ca440c2187 | READ |

局部阅读、不计全文READ：XizongKpLearnInteraction的私人标记写入；PrivateControl browser native-focus启动段；生化/外科lifecycle的当前status/action与相关依赖节。两条Source rebase当前均CLOSED，仅具体缺陷重新打开责任范围，不把合同里的历史重处理要求当成新一轮全量任务。

新增责任追踪：
- canonical Block → buildXizongProductionBlock（accepted Learning结构、Source方式、显式Attention、Block preentry、compiled对象）→ resolveXizongLearnerProjection（cues/pathways/extensions/MedicalVisual统一汇入）→ learner object与revision witness。当前仅代码追踪，尚非全科真实网页证明。
- inspect-xizong-content复用上述原生路径；其assertions核对parsed canonical到learner对象与原生附件，明确不证明raw Source完整性、医学质量、浏览器实际位置/个人覆盖或显示时机。因此159个Block检查视图通过不能单独关闭全科验收。
- expanded Attention author-label语法在production parser明确仅针对circulation启用；其他System保留旧输出，必须逐scope核原有合法标签与认知位置，不能机械全局开关或强行补造Boundary。
- Memory原生标记→release桥接的已知静态缺口已回原任务[#1113](https://github.com/kianwang022-hash/kianos/issues/1113#issuecomment-5914111443)，不是因reading记录而新建第二产品任务。
- 2517编号KP之外仍有O9 overlay（22KP）、A宏域整合与Block非KP资产；全量理解/消费覆盖必须包含适用对象，不以编号KP总数定义全部知识资产。

目录清点仍在进行：精确候选tree可枚举static-web/src的415文件、scripts的329文件、Xizong learner目录128文件、systems目录183文件；这些仅INVENTORIED，不等于已读，更不等于全考研系统文件分母。现有注册表和manifest继续拥有真实结构，本记录不成为新的语义registry。

## 第四批：跨科学习差异与共享消费（2026-09-30 15:42 UTC）

| 原文件 | blob | 状态 |
|---|---|---|
| [BLOCK_PREENTRY_CONTENT_CONTRACT.md](https://github.com/kianwang022-hash/kianos/blob/66371b71b68c5941de33f23d2ae421050cf2d0c2/content/xizong/knowledge/learner/BLOCK_PREENTRY_CONTENT_CONTRACT.md) | cd61bff3c210593cf6374a2342cf90d5457c5ad7 | READ |
| [BEGINNER_GUIDE_CONTRACT.md](https://github.com/kianwang022-hash/kianos/blob/66371b71b68c5941de33f23d2ae421050cf2d0c2/content/xizong/knowledge/learner/BEGINNER_GUIDE_CONTRACT.md) | 83f172ef2fe0a559b2a9e96aa1db613a5456df92 | READ |
| [xizongLearnerObject.mjs](https://github.com/kianwang022-hash/kianos/blob/66371b71b68c5941de33f23d2ae421050cf2d0c2/static-web/src/lib/xizongLearnerObject.mjs) | a8f116d381d11ec8a610a8ff81511096a73d0a79 | READ |
| [XIZONG_MEMORY_PRODUCT.md](https://github.com/kianwang022-hash/kianos/blob/66371b71b68c5941de33f23d2ae421050cf2d0c2/static-web/XIZONG_MEMORY_PRODUCT.md) | 1fd4ce562559477dd36298f756b2e1889ad3db82 | READ |
| [LEARNING_CONTRACT.md](https://github.com/kianwang022-hash/kianos/blob/main/content/english/LEARNING_CONTRACT.md) | f04e92e3d9b3f07764739d419ecbf5ee1f7899a7 | READ |
| [manifest.json](https://github.com/kianwang022-hash/kianos/blob/main/content/english/manifest.json) | 24595a2bf13d2315357b5bec38a3207bdcbfe0af | READ |
| [reading-a.md](https://github.com/kianwang022-hash/kianos/blob/main/content/english/modules/reading-a.md) | 19c62911447f15886c649ba28a163d782c758181 | READ |
| [cloze.md](https://github.com/kianwang022-hash/kianos/blob/main/content/english/modules/cloze.md) | 90ffcd8fd2ca5a0ffaeb690e2282e748d4d96170 | READ |
| [reading-b.md](https://github.com/kianwang022-hash/kianos/blob/main/content/english/modules/reading-b.md) | 9c1bd9f216185790a543ddd81aaac93e2b798c8c | READ |
| [LEARNING_CONTRACT.md](https://github.com/kianwang022-hash/kianos/blob/main/content/politics/LEARNING_CONTRACT.md) | 9b2b698f1bb79fbae8fb09c96e37ab2969200d32 | READ |

局部读取：objective-learning.md仅完整读开头约200行及结构，1547行全文尚未完成，不计READ。

本批理解：
- 西综Framework、MemoryRouting、MI-G/MI-D为canonical Block内容职责，不从重要性或数字形状推断；Guide是解释，Framework是结构。
- learner object按Block/LG/KP原anchor组合支持；语义存在、声明时机、实际显示分别验证。真实Block Complete释放Core/Precision/Marked，释放不等于全部到期。
- 英语优化任务表现，词汇为English子功能但有独立语义owner。Reading A/Cloze/Part B不能抹平题型差异；错题可快速理解并离开，不强迫Chat、二次作答或未来债务。workflow complete不等于mastery。
- English Session的复盘完成修复应支持cheap exit；不能把任意成功Return当成全组已完成，也不能要求所有错题走Chat回传。
- 政治Chengfeng是连续一轮主线，Xiao1000单一Workbench为验证；题后背面是预制Content，W/U默认可继续。政治Memory由Chat选当日计划，不移植西综固定间隔；分析输出是独立后期分数通道。
- Bio契约§13将普通学习/工程入口混写为CURRENT优先，需与已读上级intent规则做最小消歧；尚未改写，也不据此重开已关闭Source rebase。

完整文件清点、全链代码trace、全科页面/交互/视觉验证均未完成。


## 第五批：英语完整任务与低摩擦出口（2026-09-30 16:56 UTC）

固定阅读基线：14a6e9527b0c6818805df055a69c7efb09fdb382。objective-learning.md本轮按1–200、201–600、601–1100、1101–文件末分段完整阅读，取代第四批的PARTIAL状态；其余六份全文读取。

| 原文件 | blob | 状态 |
|---|---|---|
| [content/english/modules/objective-learning.md](https://github.com/kianwang022-hash/kianos/blob/14a6e9527b0c6818805df055a69c7efb09fdb382/content/english/modules/objective-learning.md) | f0945948c2700e6db0b0108707fe93d61c10d274 | READ |
| [content/english/modules/translation/CURRENT.md](https://github.com/kianwang022-hash/kianos/blob/14a6e9527b0c6818805df055a69c7efb09fdb382/content/english/modules/translation/CURRENT.md) | 6644de435b5f5faded647d67c9bf8d6f51a89cc5 | READ |
| [content/english/modules/translation/ACCEPTANCE.md](https://github.com/kianwang022-hash/kianos/blob/14a6e9527b0c6818805df055a69c7efb09fdb382/content/english/modules/translation/ACCEPTANCE.md) | dce5de32249e48c34ea270548539169805bbdc12 | READ |
| [content/english/modules/translation/learning.md](https://github.com/kianwang022-hash/kianos/blob/14a6e9527b0c6818805df055a69c7efb09fdb382/content/english/modules/translation/learning.md) | df4c9ea76cb2081c2539a4ffb406441b53b43c05 | READ |
| [content/english/modules/writing/CURRENT.md](https://github.com/kianwang022-hash/kianos/blob/14a6e9527b0c6818805df055a69c7efb09fdb382/content/english/modules/writing/CURRENT.md) | e477d02e01f775b25d00bdace4ebb101203d4a6c | READ |
| [content/english/modules/writing/ACCEPTANCE.md](https://github.com/kianwang022-hash/kianos/blob/14a6e9527b0c6818805df055a69c7efb09fdb382/content/english/modules/writing/ACCEPTANCE.md) | 140b853dcdeb9a5b7eb2954b71beb0aa4c7949c7 | READ |
| [content/english/modules/writing/learning.md](https://github.com/kianwang022-hash/kianos/blob/14a6e9527b0c6818805df055a69c7efb09fdb382/content/english/modules/writing/learning.md) | 9c5a8e1f0c6c983bfcfa92aaa1012066e9e599e9 | READ |

本批理解：
- Objective、Translation、Writing均以真实完整任务为主，Skill Map是诊断地址，不是必须逐项打卡的课程或未来债务。稳定正确或足够好的工作应有真正EXIT。
- Translation主干为Represent→Reconstruct→Deliver，Fidelity为贯穿护栏；review以完整set为上下文，repair可缩到最小意义失真。reference不能接管首次生成，pending claim可静默存在。
- Writing主干为Task→Content→Organization→English→Control→Delivery；Small/Big共用能力但任务不同。Direct与Planned模式、首次plan/draft身份不能混淆；Resume不被已通过作品、Guide位置或dormant pending claim劫持。
- protected unseen材料不能用于工程QA；当前教材例子标明synthetic，测试应使用隔离合成数据。改同一道题成功仅证明repair有效，不能伪造独立迁移或mastery。
- Translation/Writing Current只是工程路由；各自Acceptance记录限定scope的历史ACCEPTED且真实U仍UNTESTED。Writing 2011/2026丢失素材已用独立标识的approved replacement收口，不可再当成等待恢复原PNG的当前任务。
- 既有模块accepted claim不覆盖新发现的具体Return身份/first-evidence缺口；后续仍按#1111已有精确缺陷做消费者核验，不重做已接受设计。

两份learning.reference.md和synthetic任务JSON目前只清点，尚未全文审读；本批不增加浏览器、医学或真实U验收计数。


## 规则措辞版本澄清（2026-09-30 18:55 UTC）

重新逐文件核对main与固定候选4a818ba后，纠正上述早期‘尚未修改’可能造成的误读：
- candidate的XIZONG_MEMORY_PRODUCT.md（blob1fd4ce562559477dd36298f756b2e1889ad3db82）§3已经明确Today结合signal-driven与study-policy.memory_admission.retention_clock选择性延迟复验；main旧blobaa56f2b41cc4148de60268840943e01705eb13a8仍为Phase-1/future措辞
- candidate的LEARNING_CONTRACT.md（blobf35ebc1264da952d5ba36081fec9c05720d8dd0f）§13已经区分真实learner continuation先native evidence/Packet/Resume、规则理解读contract、工程才读CURRENT；main旧blobb0bb83e9f8e08d68d5f95803e719eee0b67ab307仍将learner-flow引到工程CURRENT

因此这两处属于现有PR候选已改、尚未合入main的变更，不另开重复修复，也不绕过候选验收把同一语义直接重复写main。上述旧文字观察须保留其main/历史检查点范围。BIOCHEMISTRY_CONTRACT的类似入口文字仍需独立核对应版本，不能由本次自动推定已修。


## 第六批：正式发布后的日常入口核对（2026-10-01 00:25 UTC）

- 重新逐份全文核对Personal的CHAT_ROUTER、三科role、STEWARD、REVIEW、DAILY_SUBJECT_CHAT_CONTRACT、CONTROL及private-control README；已有版本未变处复用本记录旧blob，不把重复读算新增全仓覆盖。日程和餐食具体私人字段不复制到公开仓库。
- 真实日计划与后续局部用户改动已经沿既有exam.chat_plan获得matching ID/hash APPLIED及对应presentation字段回读；这只证明该具体日内消费，不扩大为全部Review纠正/跨日真实表现验收。
- 日程遗漏既有PersonalDay/食谱设定属于本轮执行漏读：现有Steward入口已明确相关最小读取与同计划投影，不新增第二合同补救模型失误。GitHub规则/状态/日常判断由dot直接负责，本机任务保留为实际工程执行。
- 已修复原第四批所列BIOCHEMISTRY_CONTRACT§13入口歧义：commit db3e6f760748237ae9417594ebb1ce61667e5c6a，blob f1f4ae4f88209a168e7bed58485f3d8ac2cab8e9。学习续接先native evidence/Packet/Resume，规则解释按需要读Learning/Bio/Source，工程才Current；历史rebase不自动成为学习任务。只替换§13路由说明，其余医学/Source/学习结构不变，精确回读已完成。未宣称真实新Chat行为验收通过。
- 正式产品53ea260c已发布，旧第18:55候选未合入描述仅为历史。合并后PrivateChatControl push run36792442920浏览器检查失败独立跟进；合并前31成功不替代该次结果。当前真实应用成功不证明该失败机制无影响，原任务先提取第一失败，未归因前不改oracle、不盲目回退。

下一步仍优先原#1111剩余普通使用闭环及该新CI失败；全三仓文件/代码覆盖、逐场景Visual/Source和全科内容质量均未完成。


## 第七批：英语保留参考资产与实际首学消费者（2026-10-01 00:30 UTC）

初次合并读取输出截断，未计全文；随后按连续行窗补齐全文：Translation reference 1761行（1–500、501–1100、1101–1761），Writing reference 3747行（1–800、801–1600、1601–2400、2401–3100、3101–3747）。

| 原文件 | blob | 状态 |
|---|---|---|
| content/english/modules/translation/learning.reference.md | 11178683375ade0091b8b0d3ceb480ad09581bc0 | READ |
| content/english/modules/writing/learning.reference.md | a436c6dd98b1aaff44438d6a6f5a28d451538be8 | READ |
| static-web/scripts/validate-translation-projection.mjs | cd6d496ca2f92c2d8b5870cc8251f955f97be33b | READ |
| static-web/scripts/validate-writing-learning.mjs | 557bc055feaab6dee5ed85c7c1524744c314db63 | READ |
| static-web/src/lib/englishWritingLearning.mjs | 8e4bc69eb0e247b94a10bd2ad4279d73b796b13a | READ |
| static-web/src/pages/translation-learn.astro | a80c1cd38f004d9f05d43d2f59fc023c689e5717 | READ |

- 两份reference是保留的高密度repair资料，顶部已明确旧四块/B1–B8必修路线和旧true-exam gate不再是Current。不能因正文保留旧措辞就误删有效教学资产或恢复旧必修步骤。
- Translation首学页实际读取learning.md并将三主干与诊断/Runtime参考分层；Writing projection实际读取learning.md六primitives，不读旧reference当Current。此为静态代码trace，不是新浏览器验证。
- 两份validator保护语义覆盖、reference保留、skippable、首答保护及pending不制造任务。其大量字符串检查不能独立证明所有实际交互；本批未运行测试、不新增PASS计数。
- 未发现必须改写这两份reference的明确缺陷；保持有效内容。后续以真实任务consumer和当前学习owner检查已命名缺口，不把读完教材当运行闭环完成。
