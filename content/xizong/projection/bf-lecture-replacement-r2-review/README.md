# B–F Lecture replacement：121篇仓库草稿

**SELF候选，待内容采纳和用户试用。** 保存已完成的r2.1正文，不新写一套教案。121篇 / 1712个稳定KP / 538个原生LG；每篇有教学版、隐藏注释版和原编写阶段的覆盖记录。网站、Runtime与真实学习记录未改。

## 基线与合入顺序

- 草稿base：PR [#1145](https://github.com/kianwang022-hash/kianos/pull/1145) 的 `candidate/b-content-review-20261003`，commit `bc014aeee3c7ca1be91a180a41336f03d14b3930`。B38章的内容与既有关系重审来自该PR，本稿不把它们计作新增成果。
- Fresh main：`801394f71eaa772d3b5e0209f8bfdd3571913d1d`。
- 教学规则依赖：PR [#1148](https://github.com/kianwang022-hash/kianos/pull/1148)，读取commit `7a276ea16693eaf7c8a36be1080341f47d2c115a` 的Learning Contract及Lecture Replacement Contract§3.1。该规则、路由README、study-policy、A1/A2/A3均未复制或修改。
- 先完成并合入#1145与#1148，再对实际main做有界依赖核对并重定本稿base。本稿继续保持draft；本次操作没有merge/deploy授权。合并工程文件仍不等于候选教学内容已获得医学准入或用户试用。

## 本次精确范围

- 121篇教学正文放在原System的 `projection/<system>/chat/*-teaching.md`；121篇隐藏版及121份覆盖记录保存在本审阅包。KP注释只定位，不自动附加Core。
- 5个原canonical文件仅含已审7处Prompt及H1→`circulation-b04`引用修正。保留KP ID、顺序、Core医学事实及原Source分歧；其余11项旧Prompt/Core提案不进入本次写集。
- D14、F3两条Surgery Knowledge见证及现有两个汇总签名有界刷新，Learning见证不变。
- 34条原本CURRENT、仅因本次H1/H8/F1文件修订而过期的题目关系续签；保留原角色、原审阅和原见证，追加SELF等价证据。25个既有shard及既有manifest更新。原1520条stale全部继续排除，无新关系或新医学判断。
- 迁入查源续修文字证据和来源坐标；原PDF、像素裁剪、整页下载与本机构建脚本保持原工作档案身份，未重复放入仓库。

迁移只改候选provenance、7条修正标识/旧Prompt标签和相对链接坐标及27个隐藏文件的末尾空行。连续医学正文、条件、表格、标题和代码文本与r2.1既有正文等价；不是新一轮医学重写。

## 三篇代表全文

- [M4：组织出口、糖原与糖异生](../b-digestive-metabolic-endocrine-tumor/chat/m04-teaching.md) · [隐藏注释版](without-annotations/B/m04.md)
- [H1：从读数反推生产、成熟、破坏和分布](../c-hematology-immunity-infection/chat/h01-teaching.md) · [隐藏注释版](without-annotations/C/h01.md)
- [D8：危象、诊断、分型与治疗任务](../b-digestive-metabolic-endocrine-tumor/chat/d08-teaching.md) · [隐藏注释版](without-annotations/B/d08.md)

## 查源与验收界线

初始78项查源要求：69项有原页、同套先修或明确条件的补充支持；9项保留课程精度/归属差异。这是有界最低教学支持，不能宣称所有正式课程句已经统一。五科原PDF在编写阶段可读，作者实际核图范围由原记录界定；本次保存没有新做整本PDF像素验收。

保留的主要分歧包括：D10抗菌范围及胃切除比例；D19干预优先级条件；D11→O9正式路由；C Auer“多阳”与“可阳性”；H1遗传球ESR方向；D S12分母/等式、S19负号归属、S24年龄/手术条件；E SR4课程第二例的唯一性及E6机制补充的适用范围；F气体负性Outline、血压阈值/终点；D8题源答案与正式答案差异及页码；M4 F1,6/F2,6原词。未硬编第三动作、统一答案或新增阈值。

D的69个视觉LG是学习者执行门禁；作者查看原图不制造学习者完成证据。候选正文可读不等于Block Complete，不释放真实卡，不更改Weak判定。

工程验证通过仅证明身份、绑定、精确迁移、现有消费者和有界依赖。没有独立医学验收、用户教学试用、浏览器视觉验收或真实学习记录验收；保持候选准入状态。

## 可复查证据

- [当前121篇索引及owner见证](delivery-index.json) · [完整仓库改动清单](complete-change-list.json) · [本地验证](validation-receipt.json)
- [7 Prompt＋1 RoutingRef旧→新及理由](reviewed-canonical-changes.json) · [准确focused diff](canonical-focused.diff)
- [引入依赖的有界等价核对](dependency-reconciliation.json)
- [迁移逐文件与原档案SHA256](migration-file-list.json) · [医学正文等价](portable-prose-verification.json)
- [原生1712绑定与538 LG](native-binding-verification.json)
- [查源阶段总览](source-stage-records/source-resolution-followup.md) · [原阶段数量](source-stage-records/source-resolution-summary.json)

原阶段文字证据中的“本地、未push、formal owner未写”只描述当时阶段。它们的原文件SHA256保存在迁移清单中，像素/工作档案坐标不是本稿附带文件。当前写集和边界以本README及当前索引为准；来源事实和历史分歧不因保存草稿而改为已采纳。

## 121篇入口

| 系统 | Block | KP | 完整教学正文 | 隐藏注释版 |
|---|---|---:|---|---|
| B | D10 | 25 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/d10-teaching.md) | [顺读](without-annotations/B/d10.md) |
| B | D11 | 24 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/d11-teaching.md) | [顺读](without-annotations/B/d11.md) |
| B | D1 | 6 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/d01-teaching.md) | [顺读](without-annotations/B/d01.md) |
| B | D2 | 12 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/d02-teaching.md) | [顺读](without-annotations/B/d02.md) |
| B | D3 | 11 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/d03-teaching.md) | [顺读](without-annotations/B/d03.md) |
| B | D4 | 8 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/d04-teaching.md) | [顺读](without-annotations/B/d04.md) |
| B | D5 | 19 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/d05-teaching.md) | [顺读](without-annotations/B/d05.md) |
| B | D6 | 13 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/d06-teaching.md) | [顺读](without-annotations/B/d06.md) |
| B | D7 | 13 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/d07-teaching.md) | [顺读](without-annotations/B/d07.md) |
| B | D8 | 25 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/d08-teaching.md) | [顺读](without-annotations/B/d08.md) |
| B | D9 | 12 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/d09-teaching.md) | [顺读](without-annotations/B/d09.md) |
| B | D21 | 29 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/d21-teaching.md) | [顺读](without-annotations/B/d21.md) |
| B | D22 | 15 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/d22-teaching.md) | [顺读](without-annotations/B/d22.md) |
| B | D23 | 12 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/d23-teaching.md) | [顺读](without-annotations/B/d23.md) |
| B | D12 | 23 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/d12-teaching.md) | [顺读](without-annotations/B/d12.md) |
| B | D13 | 16 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/d13-teaching.md) | [顺读](without-annotations/B/d13.md) |
| B | D14 | 28 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/d14-teaching.md) | [顺读](without-annotations/B/d14.md) |
| B | D15 | 19 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/d15-teaching.md) | [顺读](without-annotations/B/d15.md) |
| B | D16 | 12 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/d16-teaching.md) | [顺读](without-annotations/B/d16.md) |
| B | D17 | 24 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/d17-teaching.md) | [顺读](without-annotations/B/d17.md) |
| B | D18 | 15 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/d18-teaching.md) | [顺读](without-annotations/B/d18.md) |
| B | D19 | 26 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/d19-teaching.md) | [顺读](without-annotations/B/d19.md) |
| B | D20 | 22 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/d20-teaching.md) | [顺读](without-annotations/B/d20.md) |
| B | G1 | 10 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/g01-teaching.md) | [顺读](without-annotations/B/g01.md) |
| B | G2 | 11 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/g02-teaching.md) | [顺读](without-annotations/B/g02.md) |
| B | G3 | 15 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/g03-teaching.md) | [顺读](without-annotations/B/g03.md) |
| B | G4 | 10 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/g04-teaching.md) | [顺读](without-annotations/B/g04.md) |
| B | G5 | 13 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/g05-teaching.md) | [顺读](without-annotations/B/g05.md) |
| B | M10 | 13 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/m10-teaching.md) | [顺读](without-annotations/B/m10.md) |
| B | M1 | 17 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/m01-teaching.md) | [顺读](without-annotations/B/m01.md) |
| B | M2 | 15 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/m02-teaching.md) | [顺读](without-annotations/B/m02.md) |
| B | M3 | 7 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/m03-teaching.md) | [顺读](without-annotations/B/m03.md) |
| B | M4 | 10 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/m04-teaching.md) | [顺读](without-annotations/B/m04.md) |
| B | M5 | 10 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/m05-teaching.md) | [顺读](without-annotations/B/m05.md) |
| B | M6 | 11 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/m06-teaching.md) | [顺读](without-annotations/B/m06.md) |
| B | M7 | 16 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/m07-teaching.md) | [顺读](without-annotations/B/m07.md) |
| B | M8 | 18 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/m08-teaching.md) | [顺读](without-annotations/B/m08.md) |
| B | M9 | 15 | [正文](../b-digestive-metabolic-endocrine-tumor/chat/m09-teaching.md) | [顺读](without-annotations/B/m09.md) |
| C | H10 | 10 | [正文](../c-hematology-immunity-infection/chat/h10-teaching.md) | [顺读](without-annotations/C/h10.md) |
| C | H11 | 32 | [正文](../c-hematology-immunity-infection/chat/h11-teaching.md) | [顺读](without-annotations/C/h11.md) |
| C | H12 | 12 | [正文](../c-hematology-immunity-infection/chat/h12-teaching.md) | [顺读](without-annotations/C/h12.md) |
| C | H13 | 13 | [正文](../c-hematology-immunity-infection/chat/h13-teaching.md) | [顺读](without-annotations/C/h13.md) |
| C | H14 | 12 | [正文](../c-hematology-immunity-infection/chat/h14-teaching.md) | [顺读](without-annotations/C/h14.md) |
| C | H15 | 15 | [正文](../c-hematology-immunity-infection/chat/h15-teaching.md) | [顺读](without-annotations/C/h15.md) |
| C | H16 | 21 | [正文](../c-hematology-immunity-infection/chat/h16-teaching.md) | [顺读](without-annotations/C/h16.md) |
| C | H17 | 20 | [正文](../c-hematology-immunity-infection/chat/h17-teaching.md) | [顺读](without-annotations/C/h17.md) |
| C | H18 | 12 | [正文](../c-hematology-immunity-infection/chat/h18-teaching.md) | [顺读](without-annotations/C/h18.md) |
| C | H19 | 18 | [正文](../c-hematology-immunity-infection/chat/h19-teaching.md) | [顺读](without-annotations/C/h19.md) |
| C | H1 | 13 | [正文](../c-hematology-immunity-infection/chat/h01-teaching.md) | [顺读](without-annotations/C/h01.md) |
| C | H20 | 13 | [正文](../c-hematology-immunity-infection/chat/h20-teaching.md) | [顺读](without-annotations/C/h20.md) |
| C | H21 | 13 | [正文](../c-hematology-immunity-infection/chat/h21-teaching.md) | [顺读](without-annotations/C/h21.md) |
| C | H22 | 10 | [正文](../c-hematology-immunity-infection/chat/h22-teaching.md) | [顺读](without-annotations/C/h22.md) |
| C | H23 | 17 | [正文](../c-hematology-immunity-infection/chat/h23-teaching.md) | [顺读](without-annotations/C/h23.md) |
| C | H24 | 17 | [正文](../c-hematology-immunity-infection/chat/h24-teaching.md) | [顺读](without-annotations/C/h24.md) |
| C | H25 | 16 | [正文](../c-hematology-immunity-infection/chat/h25-teaching.md) | [顺读](without-annotations/C/h25.md) |
| C | H26 | 9 | [正文](../c-hematology-immunity-infection/chat/h26-teaching.md) | [顺读](without-annotations/C/h26.md) |
| C | H27 | 11 | [正文](../c-hematology-immunity-infection/chat/h27-teaching.md) | [顺读](without-annotations/C/h27.md) |
| C | H2 | 15 | [正文](../c-hematology-immunity-infection/chat/h02-teaching.md) | [顺读](without-annotations/C/h02.md) |
| C | H3 | 18 | [正文](../c-hematology-immunity-infection/chat/h03-teaching.md) | [顺读](without-annotations/C/h03.md) |
| C | H4 | 14 | [正文](../c-hematology-immunity-infection/chat/h04-teaching.md) | [顺读](without-annotations/C/h04.md) |
| C | H5 | 16 | [正文](../c-hematology-immunity-infection/chat/h05-teaching.md) | [顺读](without-annotations/C/h05.md) |
| C | H6 | 18 | [正文](../c-hematology-immunity-infection/chat/h06-teaching.md) | [顺读](without-annotations/C/h06.md) |
| C | H7 | 13 | [正文](../c-hematology-immunity-infection/chat/h07-teaching.md) | [顺读](without-annotations/C/h07.md) |
| C | H8 | 16 | [正文](../c-hematology-immunity-infection/chat/h08-teaching.md) | [顺读](without-annotations/C/h08.md) |
| C | H9 | 29 | [正文](../c-hematology-immunity-infection/chat/h09-teaching.md) | [顺读](without-annotations/C/h09.md) |
| D | N10 | 15 | [正文](../d-neuro-sensory-motor-orthopedics/chat/n10-teaching.md) | [顺读](without-annotations/D/n10.md) |
| D | N11 | 12 | [正文](../d-neuro-sensory-motor-orthopedics/chat/n11-teaching.md) | [顺读](without-annotations/D/n11.md) |
| D | N1 | 14 | [正文](../d-neuro-sensory-motor-orthopedics/chat/n01-teaching.md) | [顺读](without-annotations/D/n01.md) |
| D | N2 | 14 | [正文](../d-neuro-sensory-motor-orthopedics/chat/n02-teaching.md) | [顺读](without-annotations/D/n02.md) |
| D | N3 | 13 | [正文](../d-neuro-sensory-motor-orthopedics/chat/n03-teaching.md) | [顺读](without-annotations/D/n03.md) |
| D | N4 | 16 | [正文](../d-neuro-sensory-motor-orthopedics/chat/n04-teaching.md) | [顺读](without-annotations/D/n04.md) |
| D | N5 | 12 | [正文](../d-neuro-sensory-motor-orthopedics/chat/n05-teaching.md) | [顺读](without-annotations/D/n05.md) |
| D | N6 | 16 | [正文](../d-neuro-sensory-motor-orthopedics/chat/n06-teaching.md) | [顺读](without-annotations/D/n06.md) |
| D | N7 | 11 | [正文](../d-neuro-sensory-motor-orthopedics/chat/n07-teaching.md) | [顺读](without-annotations/D/n07.md) |
| D | N8 | 18 | [正文](../d-neuro-sensory-motor-orthopedics/chat/n08-teaching.md) | [顺读](without-annotations/D/n08.md) |
| D | N9 | 9 | [正文](../d-neuro-sensory-motor-orthopedics/chat/n09-teaching.md) | [顺读](without-annotations/D/n09.md) |
| D | O10 | 8 | [正文](../d-neuro-sensory-motor-orthopedics/chat/o10-teaching.md) | [顺读](without-annotations/D/o10.md) |
| D | O11 | 13 | [正文](../d-neuro-sensory-motor-orthopedics/chat/o11-teaching.md) | [顺读](without-annotations/D/o11.md) |
| D | O12 | 10 | [正文](../d-neuro-sensory-motor-orthopedics/chat/o12-teaching.md) | [顺读](without-annotations/D/o12.md) |
| D | O13 | 13 | [正文](../d-neuro-sensory-motor-orthopedics/chat/o13-teaching.md) | [顺读](without-annotations/D/o13.md) |
| D | O14 | 13 | [正文](../d-neuro-sensory-motor-orthopedics/chat/o14-teaching.md) | [顺读](without-annotations/D/o14.md) |
| D | O15 | 12 | [正文](../d-neuro-sensory-motor-orthopedics/chat/o15-teaching.md) | [顺读](without-annotations/D/o15.md) |
| D | O16 | 20 | [正文](../d-neuro-sensory-motor-orthopedics/chat/o16-teaching.md) | [顺读](without-annotations/D/o16.md) |
| D | O1 | 10 | [正文](../d-neuro-sensory-motor-orthopedics/chat/o01-teaching.md) | [顺读](without-annotations/D/o01.md) |
| D | O2 | 16 | [正文](../d-neuro-sensory-motor-orthopedics/chat/o02-teaching.md) | [顺读](without-annotations/D/o02.md) |
| D | O3 | 17 | [正文](../d-neuro-sensory-motor-orthopedics/chat/o03-teaching.md) | [顺读](without-annotations/D/o03.md) |
| D | O4 | 18 | [正文](../d-neuro-sensory-motor-orthopedics/chat/o04-teaching.md) | [顺读](without-annotations/D/o04.md) |
| D | O5 | 15 | [正文](../d-neuro-sensory-motor-orthopedics/chat/o05-teaching.md) | [顺读](without-annotations/D/o05.md) |
| D | O6 | 12 | [正文](../d-neuro-sensory-motor-orthopedics/chat/o06-teaching.md) | [顺读](without-annotations/D/o06.md) |
| D | O7 | 15 | [正文](../d-neuro-sensory-motor-orthopedics/chat/o07-teaching.md) | [顺读](without-annotations/D/o07.md) |
| D | O8 | 7 | [正文](../d-neuro-sensory-motor-orthopedics/chat/o08-teaching.md) | [顺读](without-annotations/D/o08.md) |
| D | O9 | 7 | [正文](../d-neuro-sensory-motor-orthopedics/chat/o09-teaching.md) | [顺读](without-annotations/D/o09.md) |
| E | E10 | 10 | [正文](../e-reproductive-breast/chat/e10-teaching.md) | [顺读](without-annotations/E/e10.md) |
| E | E11 | 10 | [正文](../e-reproductive-breast/chat/e11-teaching.md) | [顺读](without-annotations/E/e11.md) |
| E | E12 | 19 | [正文](../e-reproductive-breast/chat/e12-teaching.md) | [顺读](without-annotations/E/e12.md) |
| E | E13 | 18 | [正文](../e-reproductive-breast/chat/e13-teaching.md) | [顺读](without-annotations/E/e13.md) |
| E | E14 | 16 | [正文](../e-reproductive-breast/chat/e14-teaching.md) | [顺读](without-annotations/E/e14.md) |
| E | E9 | 7 | [正文](../e-reproductive-breast/chat/e09-teaching.md) | [顺读](without-annotations/E/e09.md) |
| E | E1 | 7 | [正文](../e-reproductive-breast/chat/e01-teaching.md) | [顺读](without-annotations/E/e01.md) |
| E | E2 | 10 | [正文](../e-reproductive-breast/chat/e02-teaching.md) | [顺读](without-annotations/E/e02.md) |
| E | E3 | 8 | [正文](../e-reproductive-breast/chat/e03-teaching.md) | [顺读](without-annotations/E/e03.md) |
| E | E4 | 7 | [正文](../e-reproductive-breast/chat/e04-teaching.md) | [顺读](without-annotations/E/e04.md) |
| E | E5 | 9 | [正文](../e-reproductive-breast/chat/e05-teaching.md) | [顺读](without-annotations/E/e05.md) |
| E | E6 | 10 | [正文](../e-reproductive-breast/chat/e06-teaching.md) | [顺读](without-annotations/E/e06.md) |
| E | E7 | 9 | [正文](../e-reproductive-breast/chat/e07-teaching.md) | [顺读](without-annotations/E/e07.md) |
| E | E8 | 11 | [正文](../e-reproductive-breast/chat/e08-teaching.md) | [顺读](without-annotations/E/e08.md) |
| E | SR1 | 10 | [正文](../e-reproductive-breast/chat/sr01-teaching.md) | [顺读](without-annotations/E/sr01.md) |
| E | SR2 | 11 | [正文](../e-reproductive-breast/chat/sr02-teaching.md) | [顺读](without-annotations/E/sr02.md) |
| E | SR3 | 12 | [正文](../e-reproductive-breast/chat/sr03-teaching.md) | [顺读](without-annotations/E/sr03.md) |
| E | SR4 | 8 | [正文](../e-reproductive-breast/chat/sr04-teaching.md) | [顺读](without-annotations/E/sr04.md) |
| E | SR5 | 10 | [正文](../e-reproductive-breast/chat/sr05-teaching.md) | [顺读](without-annotations/E/sr05.md) |
| E | SR6 | 10 | [正文](../e-reproductive-breast/chat/sr06-teaching.md) | [顺读](without-annotations/E/sr06.md) |
| F | F1 | 15 | [正文](../f-remaining-clinical/chat/f01-teaching.md) | [顺读](without-annotations/F/f01.md) |
| F | F2 | 13 | [正文](../f-remaining-clinical/chat/f02-teaching.md) | [顺读](without-annotations/F/f02.md) |
| F | F7 | 12 | [正文](../f-remaining-clinical/chat/f07-teaching.md) | [顺读](without-annotations/F/f07.md) |
| F | F8 | 17 | [正文](../f-remaining-clinical/chat/f08-teaching.md) | [顺读](without-annotations/F/f08.md) |
| F | F9 | 13 | [正文](../f-remaining-clinical/chat/f09-teaching.md) | [顺读](without-annotations/F/f09.md) |
| F | F3 | 11 | [正文](../f-remaining-clinical/chat/f03-teaching.md) | [顺读](without-annotations/F/f03.md) |
| F | F4 | 14 | [正文](../f-remaining-clinical/chat/f04-teaching.md) | [顺读](without-annotations/F/f04.md) |
| F | F5 | 12 | [正文](../f-remaining-clinical/chat/f05-teaching.md) | [顺读](without-annotations/F/f05.md) |
| F | F6 | 14 | [正文](../f-remaining-clinical/chat/f06-teaching.md) | [顺读](without-annotations/F/f06.md) |
