# dot 考研系统任务接续

更新日期：2026-09-30
用途：用户明确要求的任务接续记录，防止跨对话后丢失目标、重复工作或误读进度。这里只保存可公开的工程任务事实，不保存私人学习记录、对话原文或凭据。

## 用户确定的总目标和顺序

1. 先完成西综：完整理解已有全流程设定，理顺内容组织、字段标签、历史别名及映射，补齐网站在正确位置和时机应有的投影，保留有效知识资产与学习连续性。
2. 再验证整个考研系统的闭环：真实学习 → 原生记录 → Chat解释与复盘 → 必要的安排调整 → 网页执行 → 继续学习与反馈。
3. 现有全部设定以GitHub原负责文件为依据。不得把理解遗漏当成没有设定，也不得用新规则替代已有设计。
4. “文件存在、代码提交、测试通过”分别只是证据；完成必须对应实际学习与内容修改效果。

## 恢复入口

- 先读当前 main 的 AGENTS.md，再读 content/xizong/CURRENT.md 与 [西综主任务 #1113](https://github.com/kianwang022-hash/kianos/issues/1113)
- 整个考研运行闭环参考 [#1111](https://github.com/kianwang022-hash/kianos/issues/1111)，第二阶段开始时重新读取，不根据本文猜测其最新状态
- 本文件不是第二套产品规则、Current或Acceptance；任务的精确Phase、Next、Blocker继续由原Issue维护
- 任何下列版本观察都只是接续检查点，恢复时须核对新提交和受影响的真实依赖

## 设计理解应覆盖的全流程

Source可信边界 → Knowledge重构与canonical Content → System／Block／Logic Group／KP及各系统真实学习差异 → 原讲义与网页配合 → Learn／Recall／closure → Memory／题目／Repair → private Evidence／Packet → Chat与Return／Resume。

贯穿核对：Visual布局、MedicalVisual医学支持、Runtime交互与状态流动、内容版本、个人覆盖、笔记标记、计时、历史记录。知识资产完整存在不等于页面已消费；历史任务通过不等于当前场景通过。

原负责文件：
- LEARNING_ASSET_STANDARD.md
- content/xizong/LEARNING_CONTRACT.md
- content/xizong/knowledge/learner/study-policy.json 与 exact System Learning／Content owners
- content/xizong/LEARNER_OBJECT_CONTRACT.md
- content/xizong/projection/PROJECTION_CONTRACT.md
- static-web/XIZONG_BLOCK_WORKSPACE_DESIGN.md
- exact Runtime、Evidence、Acceptance owners

## 本轮重点

内容组织混乱和下游缺少投影要一起处理。先辨明字段／标签含义、归属、同义写法及重复解释，再沿原资产 → 解析对象 → 页面输入 → 实际学习阶段显示逐项定位缺口。不能只优化Prompt或修孤立按钮。

保留所有合法内容与已接受流程，不机械统一医学内容或不同系统的Source模式，不强制为每个KP添加边界／串联。不另建知识副本、Runtime、存储或CSS补丁层。内容编辑与学习历史保持分离；不能靠绕过版本保护获得通过。

## 已核对的接续检查点

截至2026-09-30 10:08 UTC的最后GitHub观察：
- main为798ab2d00e460c24e28b701e1e32a3459f15f035；该变更包括任务入口一致性、Source-explicit规则归位、Steward反馈消费等，不是西综版本Runtime完成证明
- #1113记录：主提示漏读修复、共享Learning-group解释、Block／LG／KP检查视图已完成限定切口；全页面投影和全流程验收未因此完成
- 现存A1候选 candidate/a1-content-review-07724cfe 为cebac4439710b7c5c97e0d187a035abbdc972b98；24项局部修正，未合入main，不等于312KP全量Prompt升级
- d213b58已将保留进度／选择性重验证决定写入study-policy；截至所读#1113，旧Runtime的sourceHash与整Block重开耦合仍待实现和回归
- 对原工作目录未提交改动尚无直接核验，不能说一定存在，也不能当作不存在后覆盖
- 没有执行产品代码改写、合并或正式部署；本次写入仅建立用户请求的接续记录

## 当前工作与下一步

当前：确定总目标和接续方式，整科缺陷审查已暂停；先理解并收敛西综主线，随后才推进考研整体闭环。

下一步：
1. 新鲜读取#1113及最近回执，核对并保留现有候选和任何可访问的未提交成果
2. 根据已有设定形成完整的西综流程理解及具体owner对应，区分已设定未实现、实现偏离、真正未决
3. 识别内容标签／别名／归属／映射的真实冲突，选取最先阻断忠实投影的责任位置
4. 先完成有界修改及实际consumer证明，再扩大覆盖；没有执行环境或网页证据时明确边界，不冒充全链完成
5. 西综达成目标后，回到#1111核验三科与跨科闭环，修复真实断点

## 已交付报告索引

以下是基于fc15d131源码的审查检查点，修复前需对照当前代码。报告已另存给用户；此处不复制整份报告或建立第二份缺陷数据库。
- 西综生化Source学习段记录遗漏checkpoint白名单
- 西综Block个人标记未传入Memory释放；损坏Memory在部分写入路径被当作空库
- 英语运行链路七项：External刷新只读、Objective坏记录覆盖、复盘结束未接Session完成、SCORED门禁、Translation模板身份字段、首答后求助污染统计、study-day不一致
- 西综3043条已审定题目关系中961条在该基线因知识文件版本变化过期；不等于961道题错误。优先审查变更影响粒度，再恢复真正需要复核的关系，不能批量盲目换指纹

## 每次接续更新要求

只记录目标变化、实际完成、精确证据、未决与下一步。工作完成后在原任务写回并核对，本文保留简短指针。失败或未验证必须明示；不以旧Chat摘要代替最新GitHub状态，不把候选当已上线，不把合成测试当真实学习表现。
