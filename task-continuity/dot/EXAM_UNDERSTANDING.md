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


## 第八批：当前执行边界与实际使用断点（2026-10-01 01:54 UTC）

当前阶段以 Personal #61 为准：只做考研 GitHub 规则、既有内容组织和功能消费者收口；不操作本机/浏览器/真实学习记录/本地部署，不读 PDF 开展内容升级，不自动扩张全科 browser campaign。后续必要本地工作由 Kian 指定的 Chat 接手。既有研究/医学内容升级阶段继续 deferred。

### 新增精确阅读

| 原文件 | blob | 状态 |
|---|---|---|
| static-web/src/lib/lexicalRuntimeRoute.mjs | ca95637c454760b360aff965548f62fdf24a9829 | READ（main旧实现，候选差分另计） |
| static-web/src/lib/lexicalSettings.mjs | 94ae42ad71ca1fe49775f5a0b13566c9d145757a | READ |
| static-web/src/components/VocabularyWordRuntime.astro | 000d0526f5e3c220c79d9d2db2b6ca7b19bfb153 | READ |
| static-web/scripts/test-lexical-real-use-loop-browser.mjs | 917e6953811b957c375142888c0c7e78fb05b3d7 | READ |
| static-web/src/lib/lexicalBrowserState.mjs | a1a7a5ed3b6c382fd55256de384f7356836e1ecf | READ |
| static-web/src/lib/stewardReality.mjs | 4427c37b6f6bc381078aee9207d56cc192bf3569 | READ（1–220、221–336） |
| static-web/src/lib/examPlanReadModel.mjs | 5f60e0962ce746b759022e10e9d11a8c5624c17d | READ |
| static-web/src/lib/xizongMemoryModel.mjs | 6334214039ed104ae364d663f62f93f7bbe93112 | READ（连续四窗覆盖696行） |
| static-web/src/lib/browserLearnerWriter.mjs | 3441e0d65af8670985967732710f3e7832922d09 | READ |
| content/xizong/knowledge/systems/a1-circulation/system.json | e93f1bc9ff7971ad0cdfd3b0c3bd24e998eac862 | READ |
| content/xizong/projection/a1-circulation/blocks/b02.projection.json | 5ffd32801734457ffcc559f53dd7692eb076c8e8 | READ |
| content/xizong/CONTENT_MAINLINE.md | e4f6d55e32885a1b49f6239a4135f948d3688b29 | READ |
| content/xizong/CURRENT.md | de948d827e3eb349f96b173666c791288e21df30 | READ |

明确PARTIAL：examChatPlan.mjs@29447f7cfc47e283306922fa16e449535ab8714d本批仅421–789；XizongMemoryReviewV6.astro@84fa96a7655bf714b32a53997e209236f9273b05仅头部和133–265等定向段；XizongBlockV6.astro@e0f947da37cc34f61f05ce98de6fb48820316d2b为分支级追踪，未宣称本批全文READ；a1-circulation-learning.json仅顶层及B2对应对象。重复读取旧adapter/Packet不增加全仓覆盖数。

### 已证功能问题与边界

- 同日词汇重学：旧Home仅把首ordinal带入普通study；页面导航与评分按ordinal+1，study载入覆盖Coverage游标。旧real-use测试只测首页待重学数量，未走真实队列第二词。这是具体产品与测试覆盖缺口，不是全词库Content质量问题。
- PR #1118@6279ace全diff已由dot直接读取。独立只读复核又指出首次Undo可消费旧Coverage历史并退出队列；64cb41f已修该边界，后续独立静态复核通过其限定范围。生产者37项隔离浏览器/生产构建/静态7项证据见PR回执5922890432；dot未把其等同于真实用户状态修复。候选仍未合并发布。
- B2页面阶段反馈未归因。较早持久快照与后续页面不是同一时刻，不能由此直接断言测试污染或同步冲突导致。共享Runtime各Source模式和历史continuation例外必须保留，只有精确前提证明缺陷才能改；本阶段不写真实状态。
- Steward已采纳计划在普通学习使basis变化后，保留同日reference显示，但不恢复新的可执行优先级/容量判断或命令重放权；read model代码按此区分。用户既有日程未因reference状态被认定消失。
- Xizong Memory release仅建立可用库，Today由已采纳信号和retention规则决定，不等于整块重新到期。旧XizongMemoryReviewV6文件仍存在，但当前representation gate明确禁止其挂入Block；不能仅见旧组件就判定线上第二Runtime正在运行，也未据此删除历史文件。

### 当前入口收口

#1111与#1113已经把最新Current/Next移到顶部，并把旧候选未发布/旧workflow阻塞段落明确降为历史；首轮已交付与全场景未验证分开。#61保存当前四阶段安排，#60只留执行边界与指针。此为任务入口一致性修复，不是新增规则层、产品代码或运行验收。

下一步：继续第一阶段的现行规则→已有内容→实际消费者对应核对，优先清楚的功能边界与owner冲突。不能把未读/未验自动改为新测试任务；不重复已成立的全8/159/2517历史证明，不因暂停本机而把GitHub阅读/修复一并停掉。


## 第九批：候选交付与复习范围追踪（2026-10-01 02:57 UTC）

执行边界：第一阶段继续；仅候选分支，不直接更新main、合并或发布。本地状态恢复/启动冲突收口由另一个明确责任任务处理。本记录不把GitHub改动等同于已更新的学习网页。

### 新增完整阅读与静态追踪

以下为本批实际全文阅读；已经登记过的文件再次核对不重复增加覆盖。

| 文件 | blob | 状态 |
|---|---|---|
| EXAM_SUBJECT_MATURITY_STANDARD.md | 192b9212d6e9febd4460a8b1d1577fae15f6e475 | READ |
| static-web/XIZONG_HOME_DESIGN.md | 4eadd63ac9b55302d1f08debf0b2c69061b18077 | READ |
| static-web/XIZONG_SYSTEM_COMPLETION_DESIGN.md | 588ccfcd3c5143b2022aa1123a99b293865e24f8 | READ |
| static-web/XIZONG_REPRESENTATION_GATE.md | 34eb3c55bda652c48412abceaf140202ed9cc818 | READ（1–220、221–文件末） |
| static-web/src/lib/homeXizongProjection.mjs | 32c8cab85b379cfa29859cab8a97954017313b6b | READ |
| static-web/src/components/XizongHomeTools.astro | 2c02dcef5e20141507e5f11c44524f606f43ac53 | READ |
| static-web/src/pages/xizong/[system]/recall.astro | 131e3641b6fee39f121dd5d589222a49fd6b89e3 | READ |
| static-web/src/components/XizongSystemExitRuntime.astro | 5b69143fa6f0de090f836d4ea74789cae101c7aa | READ |
| static-web/src/lib/dailyLearningPacket.mjs | 88f764d6db6c760b7b1bafd8fddaef3e886b235b | READ |
| static-web/src/lib/dailyLearningPacketRuntime.mjs | b815b86545363dbd17bb9d8aebcbfd5a5d4c5d80 | READ |
| static-web/src/lib/politicsReviewClient.mjs | be202952b072325a0fe063057ee1a3da46c9df01 | READ |
| static-web/src/lib/politicsChatReturn.mjs | 823f37dbc8674376e9c3e98236f68af04010cd65 | READ |
| static-web/src/pages/politics/review.astro | 625424a6fa15f32676671cc4e1726a1645f67d65 | READ |
| static-web/src/pages/politics/practice.astro | df9fc117febc7803ff8d32ab484882a2a415e3bc | READ |
| static-web/scripts/test-politics-batch-review-loop.mjs | cda475e556252c520471fe58074364b351786ce5 | READ |

PARTIAL：politicsPracticeState.mjs@8c8a689a87e2584d5cdafc66f40129353145bf8c为1–265；politicsPracticeClient.mjs@3e38009897bbfe0590bcbba7c592966b579d0032为1–110、310–350、387–444。Learning/Product/Interaction对应Review条款及Xizong Block Workspace §9本批为精确复核；不由摘录增加全文阅读数。

静态目录复核：main c1327889 的 static-web/src tree c529c2422dae20db98ce125db34fa9a54b429f0f 完整列举415个blob（assets94、components95、layouts7、lib123、pages56、styles40）。这是清点，不是415个文件已读或验收通过，也不是整个考研仓库的分母。

### 本批结论与原责任入口

- 成熟度标准明确复用有效历史证据、停止无收益建设；CI、单次用户验收、合成日和Current CLOSED均不能单独证明全科成熟。个人校准/当年Source/真实考试形态分别保留边界，不因标准文字存在而重新启动全部验收。
- Xizong Home负责实际Continue、Current System入口和有真实依据的Attention；Home transport只派生canonical数据。System Recall拥有独立路由，practiceHref依真实题目scope可选，不能因没有题组阻塞重建。这里是代码追踪，不是新的真人路径验收。
- Representation Gate §8仍写KP Front仅Prompt/neutral identity及workspace-wide neutral front，与现行Learning、Learner Object §6、Block Workspace §9的KP Core保护+允许Context有明确文字冲突。候选只对齐该节，保留显式answer-bearing/POST_REVEAL保护及Block/System更严格Front；不改变实现或医学内容。
- Lecture复合元数据漏读修复已在[PR #1119](https://github.com/kianwang022-hash/kianos/pull/1119)。28份原文件/560KP是原生解析差分证据，不计医学全文审读；只有3处明确定位被恢复。独立检查又发现代码围栏container反例，cb84978已修并通过限定复核。最终CI以PR exact head回执为准，未发布。
- Politics“留给讨论”当前列表/计数按discussion过滤，两个复习入口却丢失该范围，WorkBench重新选择全部W/U。已回原[#1111](https://github.com/kianwang022-hash/kianos/issues/1111#issuecomment-5923750359)；只准备范围传递的最小候选，保留现有selector/会话保护，不新建任务队列或学习状态。
- Politics已导入的实质解释通过inspectPoliticsReviewedReturns进入Daily Packet；无关较新NO_ACTION不抹去旧dated meaning。该已修桥接不重复报漏接。
- 教学交接已保存到candidate/xizong-teaching-handoff-20261001的task-continuity/xizong-teaching，记录“母线/必留/后置KP”与覆盖索引。讲解覆盖不等于已学，文件存在不等于网页已有新交互。

后续按已证缺陷→最小候选→对应验证推进；继续补现行owner/consumer覆盖。全量阅读、全场景验收与内容质量升级均未完成。

## 清点与历史阅读对账（2026-10-01 03:12 UTC）

固定main c1327889、root tree 9feec4c14a69d30edf9079b5dd69d2a0ff08a889；65个有界tree响应均truncated:false，共14,252个blob。只列目录/路径/blob，不新增正文阅读或验证。content13,352（English34、Lexical11,544、Politics559、Xizong1,012、Skills203）；static-web809（src415、scripts335、顶层32、public27）；其余.github45、tools24、task-continuity3、根文件19。仓库文件总数不是考研语义阅读分母。

第九批表格89条READ，加第一批明确的4条西综全文阅读，按repo/path/blob去重扣除2条重复后为91条版本化记录：KianOS83、Personal8。KianOS74条与当前blob相同、9条为旧版本阅读；精确当前PARTIAL另5条。未精确定位的读取不补算全文。

另对账XIZONG_UNDERSTANDING.md@b2c363a61ca7cdf44130e4711cd87c5761aa4b84：159份canonical Block历史全文READ仍保留（26早期清单证据较弱、55旧详细ledger、78后续详细ledger）；147份与当前blob相同，12份A1已变化。版本相同不等于医学正确或浏览器验收，变化也不等于历史从未读过。O9 overlay、A宏域和其他非Block资产另计。没有重读PDF。

因此“89项”仅描述EXAM表格，不是整个主线只读了89份，也不能拿14,252作为已确认考研范围算完成率。路径启发式分类尚有10,165未分类，尤其Lexical words不能仅凭目录判定owner与transport职责。下一步按现有manifest/引用确认纳入范围，不删除或批量移动资产。

第九批后新增全文READ：
- static-web/XIZONG_PRACTICE_DESIGN.md — d56b94b1f99245f03de90290f47c4143585662f7
- static-web/src/components/XizongSystemRepairReturn.astro — 12ea3d76836730322d4ac7b831df4b2abb441d13
- static-web/src/lib/xizongSystemWuReturn.mjs — 11c6efb789839416e0f3b75b605d5dfa599219df
- static-web/src/pages/xizong/practice/[system].astro — ef4564cf697d2057defa81338ebd33fa367d274b
- static-web/src/pages/xizong/[system]/[block].astro — 624ddc54b13e5f0bbf3d0299046ca4c20c488ea0

实际使用链已经开始逐段追踪。Repair Return刷新后显示丢失在合成实际component/native函数重放中已复现：持久任务仍存在，页面却传空任务列表；这是显示恢复候选，不是丢失学习数据的结论，后续仍回原#1111记录。Learn/Source段切换正在另做有界核对，未完成时不声明通过。


## 英语 Translation：既有内容到原生消费者静态追踪（2026-10-01 04:20 UTC）

固定基线：KianOS main `d4c77c27eee9061af79c6ca3c5616cbf6a5d8c1e`。范围依据 [Personal #61](https://github.com/kianwang022-hash/kian-personal-os/issues/61)：仅核对既有规则、内容组织与功能消费者，不重启英语工程 campaign、内容升级或真实使用验收。

### 结论与停止边界

- **本链未确认需要修复的产品缺陷。** Current learning 与保留 deep reference 的区别仍成立；复用第五/七批未变 blob 的全文阅读证据，不恢复旧必修路线，不删除有效参考资产。
- `manifest.json` 注册五套 Translation synthetic sections；prompt/reference JSON 均标记 `CURRENT_CANDIDATE`。本轮确认其为已准备的候选内容资产。
- 原生链为 `translation.astro` / `translation/[id].astro` → `englishTranslationSourceTruth.mjs` → `englishTranslation.mjs`；后者只从现行 manifest、question bank 和 learning owner 建立目录。`translation-reference/[id].json.js` 也复用同一目录与 reference loader。
- 因而，所追踪的原生目录/页面/参考端点**没有消费该 synthetic bank**。这是有界静态消费边界，不等于已采纳产品承诺失效：manifest 的 Translation 条目仅声明库存，没有像 Part B 一样声明 synthetic runtime/route；Translation Acceptance 也没有声称这五套已获原生页面准入。不能仅因资产尚未消费就判为漏接缺陷、废弃资产或新建扩展任务。
- 下一步：保留本静态 trace，停止该链。只有新的明确准入要求或真实缺陷证据才重开对应最小 owner。本轮未写 GitHub、未跑构建/测试/浏览器、未读取受保护真题正文或真实学习记录；不新增 PASS、发布或真实 U 声明。

### 本轮精确全文阅读

以下均取自固定基线；重复已读文件不增加全仓独立覆盖数。READ 不等于实现或运行验证。

| 文件 | blob | 状态 |
|---|---|---|
| `AGENTS.md` | `5b7cc02e50f40bcf2e1fdb439344ee927a7f9079` | READ，重读 |
| `content/english/CURRENT.md` | `958768d2d60c81990c23b77d3446f4cbb0404a26` | READ |
| `content/english/manifest.json` | `24595a2bf13d2315357b5bec38a3207bdcbfe0af` | READ，重读 |
| `content/english/modules/translation/CURRENT.md` | `6644de435b5f5faded647d67c9bf8d6f51a89cc5` | READ，重读 |
| `content/english/modules/translation/ACCEPTANCE.md` | `dce5de32249e48c34ea270548539169805bbdc12` | READ，重读 |
| `content/english/modules/translation/synthetic-tasks.v1.json` | `fae76c9d6baa3f4df2c80bf8738f0ffbfe4e1039` | READ |
| `content/english/modules/translation/synthetic-tasks.reference.v1.json` | `f22824e520e154b4d11d9e6436c24e995cb482ff` | READ，单独读取补齐截断 |
| `static-web/src/lib/englishTranslation.mjs` | `8dd73d30f0edd9d29332b8410a5fa57a995b1ac2` | READ / TRACED |
| `static-web/src/lib/englishTranslationSourceTruth.mjs` | `a2e439f09c5adadea05a8caa4ba38a7878b43996` | READ / TRACED |
| `static-web/src/pages/translation.astro` | `99f8f7a0fe9eebbcd307e6b2386b65e24c8d3fcc` | READ / TRACED |
| `static-web/src/pages/translation/[id].astro` | `20a709098e901684e1dfa05a36b448c84d0b2997` | READ / TRACED |
| `static-web/src/pages/translation-reference/[id].json.js` | `96f606cc13224575045efbcfed222adb5fdef4b8` | READ / TRACED |
| `task-continuity/dot/EXAM_UNDERSTANDING.md` | `e50516518bce0243123ac7ffb303123257fafdfb` | READ，复用已有覆盖与证据 |

### PARTIAL、复用及未验范围

- `content/english/LEARNING_CONTRACT.md`，blob `f04e92e3d9b3f07764739d419ecbf5ee1f7899a7`：本次输出截断，仅计本次 PARTIAL；已读相关 baseline / Translation 边界，复用第四批同 blob 全文 READ。
- `content/english/modules/translation/learning.md`，blob `df4c9ea76cb2081c2539a4ffb406441b53b43c05`：本次输出截断，仅计本次 PARTIAL；复用第五批同 blob 全文 READ。
- `learning.reference.md`，blob `11178683375ade0091b8b0d3ceb480ad09581bc0`；`translation-learn.astro`，blob `a80c1cd38f004d9f05d43d2f59fc023c689e5717`：目录 metadata 核实版本未变，复用第七批全文 READ / 首学消费者 trace，不宣称本次重读全文。
- 未审读 source bank 正文、完整 `englishSourceTruth.mjs` projection、Workspace 全交互或运行行为；本链结论仅涉及明确列出的目录/路由构造与资产准入边界。

证据入口：[原生目录实现](https://github.com/kianwang022-hash/kianos/blob/d4c77c27eee9061af79c6ca3c5616cbf6a5d8c1e/static-web/src/lib/englishTranslation.mjs) · [库存登记](https://github.com/kianwang022-hash/kianos/blob/d4c77c27eee9061af79c6ca3c5616cbf6a5d8c1e/content/english/manifest.json) · [Translation Acceptance](https://github.com/kianwang022-hash/kianos/blob/d4c77c27eee9061af79c6ca3c5616cbf6a5d8c1e/content/english/modules/translation/ACCEPTANCE.md)
## Politics authored Content → native website consumption — 2026-10-01

Scope: Personal #61 Phase1; read-only GitHub audit of existing Politics explanation, source and Memory consumers. No GitHub mutations, new architecture/content upgrades, browser/local deployment, real learner-state access or test execution.

Basis: Personal #61 read at updated_at `2026-10-01T03:23:43Z`. Initial file reads pinned to `d4c77c27eee9061af79c6ca3c5616cbf6a5d8c1e`; core owners/consumers compared with `c1327889e78339a29071ed913a50bf27b4b3ed82`, identical blobs. Existing candidate ledger inspected at PR #1121 exact head `112e9ec64702c246e7ec06dab11485e63e524dfa`.

### Bounded result

**No confirmed new defect.** This is static owner/consumer tracing, not deployed-use acceptance.

- Refined explanation owner is `content/politics/derived/xiao1000-learner-explanations/{manifest.json,asset.v1.json.gz}`. Exact stable source-question ID binding → `politicsPractice.mjs` → `practiceReviewPayload` → generated `/politics/practice-review/{id}.json` → formal Workbench submit → `takeaway` / `chatExplanation`. The loader fails closed on package hashes, missing fields, IDs and counts. Historical/OCR explanation is not a learner fallback.
- Source prose/locator follows canonical regions → deterministic scoped node shards → fidelity admission → Current unit → Practice payload. Source README distinguishes monolith recovery authority from runtime shards; `build-source-shards.mjs` and its workflow own regeneration.
- The inspected `marxism/ch02.memory.json` contains four source-grounded `CANDIDATE_ONLY` items, with handbook binding explicitly pending. Enrichment → candidate catalog → Memory page → native client/runtime preserves Chat-selected admission. Prompt/answer/source-ref changes revise the catalog and stale an old daily plan. Historical evidence is reusable only if the specific candidate snapshot still matches Current.
- Current/retired ownership is explicit: parent/Marxism Current route actual learning to native evidence; accepted product brief marks the former rollout as historical/closed. The inspected current consumer chain does not import the old monolith Runtime.
- **Saved-result boundary:** an already-submitted resumed Workbench result renders saved `result.review`. Explanation/source-only changes do not alter `taskRevision`, so that existing backside keeps its snapshot; fresh submission fetches generated Current review JSON. This observed behavior is not enough to classify a defect or authorize a semantic change. Do not claim authored updates refresh every resumed result, and do not invalidate attempts merely to refresh copy.

Smallest next action: retain this trace in the existing understanding ledger and advance the next independent Phase1 chain. If update-propagation proof becomes necessary, use one isolated content-only update/resumed-submitted-result regression while preserving first-attempt evidence; no full campaign is justified by this result.

### Exact reading coverage

`READ` means the complete text was read, including bounded sequential chunks. Versions below are blob SHAs; counts are coverage, not functional completion.

| Path | Blob SHA | Coverage |
| --- | --- | --- |
| AGENTS.md | 5b7cc02e50f40bcf2e1fdb439344ee927a7f9079 | READ |
| AUTHORITY_INHERITANCE_CONTRACT.md | db7c06afee02df13a772947404e155297d95ec16 | READ |
| content/politics/CURRENT.md | 18c162337e3f48ce082235f95e6286b1c3aeb448 | READ |
| content/politics/LEARNING_CONTRACT.md | 9b2b698f1bb79fbae8fb09c96e37ab2969200d32 | READ |
| content/politics/INTERACTION_CONTRACT.md | aea4157852d9b26e1f44a27146e73fe3b6a6bfc0 | READ |
| static-web/POLITICS_PRODUCT_BRIEF.md | af977d9e5babad80e985b51b0d25f823e120bfb8 | READ |
| content/politics/learning/manifest.json | 41e437b0cf927e0fa9672e8fc4e02b8567a7999b | READ |
| content/politics/learning/marxism/CURRENT.md | a131f46699b4ab59ae4171d5a043481edb387200 | READ |
| content/politics/learning/marxism/ch02.json | 4142b88293bdf40ae90e494a12cab13498c8b240 | READ |
| content/politics/learning/marxism/ch02.memory.json | b42c9dc0beffe9db4d91a2292213702781ba7ae2 | READ |
| content/politics/source/README.md | 2952dbc2a6f50dd61aad1502e4f34d8796b11114 | READ |
| content/politics/tools/build-source-shards.mjs | 29c93ac6142747b1dc0d1d23ca57f757e7bbc0d1 | READ |
| .github/workflows/politics-source-shards.yml | abb961586c1513873ac280238ba2495a81daa0b7 | READ |
| content/politics/derived/xiao1000-learner-explanations/README.md | 7d4f529b7d8cd03fd9cb299e6f7fc07cdcbcf6ea | READ |
| content/politics/derived/xiao1000-learner-explanations/manifest.json | 2879309d951c7bf2711cbe0eba9203912ac5e9fc | READ |
| static-web/src/lib/politicsCurrent.mjs | 5824901c4dd18e8ce93dd50fea5cf49b5d3b9340 | READ |
| static-web/src/lib/politicsRuntime.mjs | dddc74ce2db3bbed239dc0b0dbaaa754f2d558bc | READ |
| static-web/src/lib/politicsRuntimeScoped.mjs | afcff2ffba272acb6a243cb087cdc45bca2a5b44 | READ |
| static-web/src/lib/politicsRuntimeFirstReady.mjs | 651a7fbd5a5ab59b45ff09d3e8d96b5b7d34f769 | READ |
| static-web/src/lib/politicsSourceFidelity.mjs | 680cbfa62584f2d97afd7a0afc8073a3e15208b9 | READ |
| static-web/src/lib/politicsRepairMemory.mjs | ab4e1fdd055ba994e4e738d8ed634cbdd953bf93 | READ |
| static-web/src/lib/politicsPractice.mjs | c88d8667132c736ecb98356a0c93fcea646e9314 | READ |
| static-web/src/lib/politicsPracticeView.mjs | a8822a4b17d5b5b9655fd821f360d4857497e50c | READ |
| static-web/src/lib/politicsPracticeClient.mjs | 3e38009897bbfe0590bcbba7c592966b579d0032 | READ |
| static-web/src/pages/politics/practice-review/[id].json.ts | 02843d1e56c18621f54e68d398ef6524fae0d278 | READ |
| static-web/src/pages/politics/[subject]/[chapter].astro | cc3186cd7c6da398874db695725bd226661d343b | READ |
| static-web/src/components/PoliticsPracticeBridge.astro | 40724a5c45c2e7c7fa93cf83e4d621bf6177e595 | READ |
| static-web/src/lib/politicsMemoryCandidates.mjs | e5f4728b8bcebca25228286a83bfc1bd69ddd73c | READ |
| static-web/src/lib/politicsMemoryRuntime.mjs | a90a27acd9ed1a34c3d32dafa2f82876e59f7c9f | READ |
| static-web/src/lib/politicsMemoryClient.mjs | 392f00c69c1f1007f25bf4199fdeab5ff760f195 | READ |
| static-web/src/pages/politics/memory/index.astro | 91f2927c63f48de8670d5b896f71160f634bd4df | READ |
| static-web/src/lib/politicsPracticeState.mjs | 8c8a689a87e2584d5cdafc66f40129353145bf8c | PARTIAL: first 11,000 characters, lines 1–197 and part of 198; session/current-task matching and Continue |
| content/politics/source/questions/shards/marx/single/q001-025.json | 361cea3e4192a445caf363ee4970ae9db91eb73e | PARTIAL: first 2,200 characters; first record's source/explanation provenance and option fields only |
| task-continuity/dot/EXAM_UNDERSTANDING.md at PR1121 head 112e9ec64702c246e7ec06dab11485e63e524dfa | ec51d0c7fc2cc0826066a4f1321f89e5ee9d0487 | PARTIAL: relevant Politics/snapshot/coverage excerpts only |

Not read/verified: gzip's 1,148 explanation strings, all source/shard bodies, full subject projection modules, real learner state, deployed UI, new build/test runs. No political content re-audit or historical acceptance replay claimed. Existing PR1122 discussion-filter repair and Chat1123 bootstrap were not duplicated.



## Writing：既有内容到原生消费者静态追踪（2026-10-01 04:33 UTC）

固定 main 基线：`d75c141a018b9cc39319389a7f6289a5fb3c6e1a`。范围依据 [Personal #61](https://github.com/kianwang022-hash/kian-personal-os/issues/61) 第一阶段。已有理解记录复用 PR #1121 head `d3b7d40552d32c673facca7f5797f78dbe021539` 的第五/七批；本轮不接管 #1123 私人状态或 #1126 Memory 工作。

### 结论与停止边界

**本链未确认新的 promised-consumer 缺陷。** 只完成限定静态 owner → catalog/task/learning page 消费追踪；不新增运行 PASS、部署生效或真实 U 声明。

- Writing Current 明确无默认活动工程任务；Acceptance 保留限定 ACCEPTED 与真实 U UNTESTED。已批准替代素材的历史恢复已关闭，不能把它重新列为缺失原 PNG 的当前任务。
- **Current 资产**：manifest 将学习 owner 指向 `writing/learning.md`，将练习登记为 `synthetic-tasks.v1.json`；该 JSON 明确 CURRENT，10 个完整合成作文（4 Small + 6 Big），无 model answer。此处不是仅准备而未接入的候选库。
- **实际合成任务链**：JSON → `englishWritingSynthetic.mjs`（校验、映射 title/learnerTask/targetWords/planningPrompt/draftPrompt，记录 task 与 owner hash）→ `englishWritingRuntimeTask.mjs`（合成与 source-ready 真题目录）→ `englishWritingRuntimeSourceTruth.mjs` → `writing.astro` / `writing/[id].astro` → `WritingWorkspace`。SourceTruth 的 Writing projector 对非 exam 原样返回。目录卡片读取真实 task 字段；Workspace 读取题干/背景/事实或 visual_scenario、字数、plan/draft 提示。合成任务正文没有另一个手写网页副本。
- **实际首学链**：`learning.md` → `englishWritingLearning.mjs` → `writing-learn.astro`。projection 读 A、B intro、B1–B6、C、D、E、I，页面用 Markdown 渲染这些字段；六能力 targeted/skippable，练习/Skill Map/true-exam 参考不成为必修完成门槛。修改这些被投影的正文会进入新构建的页面；并不意味着 learning.md 每一段都原样展示。F/G/H/J 与末尾摘要不在该 projection 字段集，不据此自动判漏接：内部运行要求与参考说明不等于全部正文首学展示承诺。
- **保留参考与退役含义**：`learning.reference.md` 仍是有效深层 repair/reference reservoir；退役的是旧 B1–B8 必修路线和旧 true-exam prerequisite 的当前权威，不是整份资产。已读首学 consumer 不读取 reference 为 Current，也未发现承诺将全部 reference 原文挂入该首学页；不能因未消费就删掉或重建新的 reference 系统。
- **真题消费边界**：`englishWriting.mjs` 从现行 manifest/provenance/question bank 构造严格任务身份；runtime wrapper 对大作文图像路径、存在性与 hash 进行准入；`projectWritingRuntimeSourceTruth` 把当前 source overlay 的题干/图像送入 learnerTask。仅阅读实现，不执行 loader、不读取受保护 unseen bank 或 image 正文；不由静态 trace 宣称每份 Source 可用。
- **传播限制**：上述 loader 有进程级 cache，Astro 为构建时投影；这里只能确认下一次有效读取/构建的数据依赖，不能声称修改 GitHub 后已打开页面或现有 learner record 即时刷新。也不把全部 authored 元数据都误称为可见正文：Workspace 保存完整 task payload，但只展示其指定字段。本轮不改变 first-evidence/state identity。

停止：把本记录并入原理解 ledger，继续下一条独立第一阶段链；本链无须建立新修复、测试 campaign 或语义 registry。

### 本轮精确阅读覆盖

READ 指全文实际阅读；版本均为上述固定 main 的 blob，不把重复已读算新增独立覆盖。

| 文件 | blob | 状态 |
|---|---|---|
| `AGENTS.md` | `5b7cc02e50f40bcf2e1fdb439344ee927a7f9079` | READ / static trace |
| `content/english/modules/writing/CURRENT.md` | `e477d02e01f775b25d00bdace4ebb101203d4a6c` | READ / static trace |
| `content/english/modules/writing/ACCEPTANCE.md` | `140b853dcdeb9a5b7eb2954b71beb0aa4c7949c7` | READ / static trace |
| `content/english/manifest.json` | `24595a2bf13d2315357b5bec38a3207bdcbfe0af` | READ / static trace |
| `content/english/modules/writing/synthetic-tasks.v1.json` | `e596dda74ed1303c3d10a0e07b086ce4a7b82eff` | READ / static trace |
| `static-web/src/lib/englishWritingSynthetic.mjs` | `d34d9abef6efffee1f39232290ccd0018152a2a2` | READ / static trace |
| `static-web/src/lib/englishWriting.mjs` | `4292a6fb13b90e55740fea25b8464bbe65a75c63` | READ / static trace |
| `static-web/src/lib/englishWritingRuntimeTask.mjs` | `c45c8f60733038a12bc21faa72c01e859b30955b` | READ / static trace |
| `static-web/src/lib/englishWritingRuntimeSourceTruth.mjs` | `394c89e14680f24d144892bd9d3a61a0e952ddf6` | READ / static trace |
| `static-web/src/lib/englishWritingLearning.mjs` | `8e4bc69eb0e247b94a10bd2ad4279d73b796b13a` | READ / static trace |
| `static-web/src/pages/writing.astro` | `f8a9a52d2e3d9db0317c2457af6831606b48e980` | READ / static trace |
| `static-web/src/pages/writing/[id].astro` | `ecbbd3a06441bb672f715fd10cad54547208ead0` | READ / static trace |
| `static-web/src/pages/writing-learn.astro` | `eaeea8d1a078f3cdb979b9786471b6fec40f470e` | READ / static trace |

### PARTIAL 与复用

| 文件 | blob | 本轮范围 / 复用依据 |
|---|---|---|
| `content/english/modules/writing/learning.md` | `9c5a8e1f0c6c983bfcfa92aaa1012066e9e599e9` | PARTIAL：1–100、735–837 与标题结构；metadata 确认未变，复用第五批全文 READ |
| `content/english/modules/writing/learning.reference.md` | `a436c6dd98b1aaff44438d6a6f5a28d451538be8` | PARTIAL：1–65；metadata 确认未变，复用第七批全文 READ |
| `static-web/src/components/WritingWorkspace.astro` | `42f2b3eb44f4333ccf718cb2e6abb7a3932ae698` | PARTIAL：1–110 与 task/reference 字段定向搜索；未审全交互 |
| `static-web/src/lib/englishSourceTruth.mjs` | `d85d485b9f31dba7ef37f3276277c91583ccb140` | PARTIAL：330–383 Writing projector 与相关搜索；未重审全 SourceTruth |
| `task-continuity/dot/EXAM_UNDERSTANDING.md` at PR1121 `d3b7d40552d32c673facca7f5797f78dbe021539` | `4d59b39888199e2e20b7bd437da9adebd76fb2ab` | PARTIAL：第五/七批 Writing 证据与末尾既有 append；未重复计全文 |

未验：protected unseen 真题正文/图像、完整 SourceTruth、WritingWorkspace 全交互及 evidence/Return/native record behavior、真实学习状态、构建/测试/浏览器/部署。没有进行 GitHub mutation；仅准备本追加草稿。

证据入口：[Current](https://github.com/kianwang022-hash/kianos/blob/d75c141a018b9cc39319389a7f6289a5fb3c6e1a/content/english/modules/writing/CURRENT.md) · [Synthetic consumer](https://github.com/kianwang022-hash/kianos/blob/d75c141a018b9cc39319389a7f6289a5fb3c6e1a/static-web/src/lib/englishWritingSynthetic.mjs) · [Learning projection](https://github.com/kianwang022-hash/kianos/blob/d75c141a018b9cc39319389a7f6289a5fb3c6e1a/static-web/src/lib/englishWritingLearning.mjs) · [Learning page](https://github.com/kianwang022-hash/kianos/blob/d75c141a018b9cc39319389a7f6289a5fb3c6e1a/static-web/src/pages/writing-learn.astro) · [Task page](https://github.com/kianwang022-hash/kianos/blob/d75c141a018b9cc39319389a7f6289a5fb3c6e1a/static-web/src/pages/writing/%5Bid%5D.astro)


