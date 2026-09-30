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
