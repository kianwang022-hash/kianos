# B 消化·物质代谢·内分泌·肿瘤｜Beginner Guide

Status: **CURRENT**  
Role: **BEGINNER_EXPLANATION_ONLY**  
Contract: `content/xizong/knowledge/learner/BEGINNER_GUIDE_CONTRACT.md`

## Authority boundary

This Guide explains Current B; it does not own B medical truth.

Current owners:

- System semantics → `content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/system.json`
- first-pass / Logic Group / Recall support → `content/xizong/knowledge/learner/b-digestive-metabolic-endocrine-tumor-learning.json`
- medical Core → canonical D / M / G Block Markdown under `content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/`
- shared learning semantics → `content/xizong/LEARNING_CONTRACT.md` + `study-policy.json`

Bounded historical explanatory provenance:

- path: `content/xizong/knowledge/system-guides/西综消化_物质代谢_内分泌_System_Guide_v2_生化完整整合版.md`
- last full pre-retirement ref: `0a7cfcd751cdadc181948822931d582db871df8b`
- use: explanation pattern only; **not Current authority**

---

## 1｜先搞懂：B 不是把三四门课缝在一起

B 最大的认知风险，是按教材目录把“消化、生化、内分泌、分子、肿瘤”分别学成几套孤岛。

B 真正做的是把它们放进同一个物质—能量—控制系统：

> **外源食物和内源储备怎样进入人体，被推进、消化、吸收、分配和转化；细胞怎样把底物变成 ATP、储存物和生物合成原料；激素怎样切换这些流量；DNA→RNA→蛋白怎样提供执行器；当某一层失败时，症状、实验室、影像、内镜、病理和外科空间怎样暴露第一故障。**

所以 B 不是一条 38 Block 超长病程，也不是三门课拼盘。

---

## 2｜先在脑内同时追六条流

历史 Guide 的“多条 flow 并行”非常适合作为 beginner explanation；现在的 B 系统模型也支持这一点。

### ① 输入与运输流

```text
食物
→ 胃肠推进 / 储存 / 混合
→ 消化腺拆解
→ 黏膜选择性吸收
→ 门静脉 / 淋巴
→ 肝脏与组织
```

### ② 碳与能量流

```text
葡萄糖 / 脂肪酸 / 氨基酸碳骨架
→ 乙酰 CoA / TCA / reducing equivalents
→ ATP
↔ 进食时储存
↔ 空腹 / 应激时动员
```

### ③ 氮与一碳流

```text
氨基酸氮
→ 转氨 / 氨运输
→ 尿素解毒
→ 一碳单位 / SAM
→ 核苷酸与多种生物合成接口
```

### ④ 肝脏化学处理流

```text
门静脉首过
→ 合成 / 分配
→ 胆汁与胆红素
→ 氨解毒
→ 生物转化
```

### ⑤ 控制流

```text
局部神经 / 胃肠激素
+ 胰岛素 / 胰高血糖素
+ 甲状腺 / 肾上腺 / PTH / GH 等反馈轴
→ 改变推进、分泌、底物方向、代谢速度和生长状态
```

### ⑥ 信息流

```text
DNA
→ RNA
→ 蛋白质 / 酶 / 结构执行器
→ 代谢与表型

复制 / 表达 / 修复失控
→ 克隆控制失败
→ 肿瘤接口
```

疾病不是第七门课，而是这些流在不同位置失效后留下的结果。

---

## 3｜为什么 B 必须是 DAG，而不是一条直线

有共同依赖，但没有一条合理的“D1→D2→……→G5”单链。

当前依赖关系的核心意思是：

```text
D1–D4 先建立连续的输入 / 消化 / 吸收

M1 建立酶、蛋白质、辅因子语言
→ M2–M4 碳氧化 / 糖代谢
→ M5–M7 脂质
→ M8 氮 / 一碳
→ M9 核苷酸
→ M10 血红素 / 胆红素 / 生物转化

D5–D8 把能量、营养、内分泌共同语言与胰岛控制接起来

D9–D15 形成上消化道 / 肠道 / 腹部空间疾病支路
D16–D20 形成肝胆胰支路
D21–D23 形成甲状腺 / 肾上腺 / 钙-PTH-GH 支路

G1–G5 形成分子信息 / 修复 / 肿瘤 Gate
```

这些支路会反复互相调用，但不该为了“都有联系”而硬排成一条假病程。

---

## 4｜第一次进入，先抓几组判断坐标

### 消化层

```text
管道运动 / 出口
vs 黏膜屏障
vs 消化液
vs 吸收界面
```

症状相似时，先问故障发生在“推进、壁、液体、吸收”哪一层。

### 代谢层

```text
进食态 vs 空腹态 vs 应激态
ATP 供能 vs NADPH 还原合成 / 抗氧化
糖 vs 脂质 vs 氨基酸 / 氮 vs 核苷酸 / 一碳
储存 vs 动员
```

不要把每条代谢通路学成一张互不相干的酶表。

### 肝胆层

```text
肝细胞损伤 / 合成功能
vs 胆汁淤积 / 胆道梗阻
vs 门脉高压
```

黄疸、腹水、凝血异常、高氨、胆道感染虽然都能“指向肝胆”，第一故障层并不相同。

### 内分泌层

```text
激素过多 vs 过少 vs 靶器官抵抗
原发靶腺 vs 上游垂体 / 下丘脑 vs 异位 / 药源性
```

内分泌不是背单个 hormone value，而是看“量 + 靶效应 + 反馈关系”。

### 肿瘤层

```text
来源细胞
→ 壁层 / 浸润深度
→ 扩散路径
→ 证据
→ 可切除性 / 当前危险
```

分子改变是机制的一部分，不等于整个器官肿瘤诊断模型。

---

## 5｜38 个 Block 不需要一口气看成 38 格

第一次进入只先识别 7 个区域。

### A｜输入、消化与吸收：D1–D4

- D1 胃肠管道控制
- D2 口腔、食管与胃
- D3 胰液、胆汁与小肠消化
- D4 小肠吸收与营养运输

任务：先建立“东西怎么进来、怎么拆、怎么过黏膜、怎么进入体内”的连续链。

### B｜能量、营养与胰岛控制：D5–D8

- D5 能量、体温、应激与临床营养
- D6 内分泌共同语言
- D7 进食—空腹与胰岛激素
- D8 糖尿病

任务：把底物状态、激素反馈和临床代谢失衡接起来。

### C｜胃肠疾病与腹部空间：D9–D15

- D9 GERD 与贲门失弛缓
- D10 胃炎、HP、PUD 与上消化道出血
- D11 食管与胃肿瘤
- D12 肠结核、结核性腹膜炎、IBD 与 IBS
- D13 腹膜感染与腹部损伤
- D14 肠梗阻、急性阑尾炎与腹外疝
- D15 大肠、直肠与肛管

任务：用管道、黏膜、炎症、梗阻、出血、污染和肿瘤空间定位疾病。

### D｜肝胆胰：D16–D20

- D16 病毒性肝炎
- D17 肝硬化、门脉高压与肝性脑病
- D18 HCC
- D19 胆汁、黄疸、胆石、胆道感染与肝脓肿
- D20 急性胰腺炎与胰腺肿瘤

任务：把肝脏化学枢纽、胆汁流出与腹部急症放在同一坐标里。

### E｜器官内分泌：D21–D23

- D21 甲状腺轴及甲状腺内外科
- D22 肾上腺皮质与髓质
- D23 钙调节、甲状旁腺与生长激素

任务：在 D6 的共同反馈语言上运行具体激素轴。

### F｜物质代谢：M1–M10

```text
M1 蛋白质 / 酶 / 维生素语言
→ M2–M4 碳氧化与糖
→ M5–M7 脂质
→ M8 氮 / 一碳
→ M9 核苷酸
→ M10 血红素 / 胆红素 / 生物转化
```

任务：不是逐酶抄表，而是回答“底物从哪里来、往哪里去、受什么状态控制、堵住会出现什么后果”。

### G｜信息流与肿瘤 Gate：G1–G5

```text
核酸 / 基因组
→ DNA 复制
→ 转录 / RNA 加工 / 翻译
→ 表达调控
→ DNA 损伤 / 癌基因 / 分子技术
```

任务：给代谢执行器和肿瘤机制提供信息层底座。

---

## 6｜进入一个 Block 后怎么接

System Guide 只负责选择正确支路和认知坐标。

进入 Block 后：

```text
中心问题
→ Block Framework / 最小模型
→ 按当前 B 学习路径规定的 Source contact 学原讲义
→ Logic Group / KP 理解与 Recall
→ Group / Block Closure
→ 进入 Memory Routing
```

不要让 Guide 自己展开成“第二套 600 KP 正文”。

---

## 7｜为什么 B 尤其需要 Framework + Memory Routing

B 同时有机制链、代谢方向、反馈轴、疾病诊疗和大量精确项。如果没有分层，最容易退化成“生化背酶 + 内分泌背数值 + 消化背疾病表”。

### Framework 负责

- 当前 Block 属于哪条 flow；
- 输入 / 输出是什么；
- 关键方向或反馈坐标是什么；
- 这个 Block 和其他支路在哪里连接。

### MI-G 负责

当前 Block 显式标出的、后面会不断调用的 gating memory：例如某些方向、核心反馈、关键分类门槛或必须能即时恢复的结构。

### MI-D 负责

当前 Block 显式标出的精确但可后置项目：完整酶名、辅酶、数字、分期、术式、药物细目等只有在归位后才进入间隔记忆，不应一开始就把 mechanism / flow 拦住。

`MI-D` 仍然要背；只是**先把它放到正确抽屉，再让 Memory 系统负责持续精确化**。

---

## 8｜第一次完成 B 后应该能做什么

面对一个新消化 / 代谢 / 内分泌场景，先能问：

```text
输入、推进、消化、吸收哪层？
底物现在处于进食、空腹还是应激方向？
问题是 ATP、还原力、糖、脂、氮还是核苷酸？
肝细胞处理、胆汁流出还是门脉系统？
激素是过多、过少还是抵抗；故障在轴的哪一级？
DNA→RNA→蛋白 / 修复 / 克隆控制是否是当前主问题？
当前最危险的是出血、穿孔、梗阻、感染、代谢危象还是内分泌危象？
```

先完成定位，再进入疾病或 Source Precision。

---

## 9｜Historical migration receipt

Intentionally migrated after Current re-verification:

- 把 B 当成多条 flow 而不是三门课拼接的解释方式；
- “输入流 / 能量流 / 氮与一碳 / 控制流 / 信息流 / 疾病流”的 beginner frame；
- B 必须采用 DAG、不能强排成一条超长直线的教学解释；
- 不让孤立酶名、辅酶、数字、TNM、术式阻塞 mechanism 主线的 Memory 解释。

Explicitly not migrated:

- old `26生化.pdf` provisional source status；
- old page / question / Scope Audit counts；
- old Block completion state and workload estimates；
- old Primary / Recall / Deferred / Overlay provisional ownership；
- any historical fact not resolved to Current B owners.
