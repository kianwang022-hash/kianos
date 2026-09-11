---
title: D10｜胃炎、HP、消化性溃疡与上消化道出血
system: 消化—物质代谢—内分泌
system_id: digestive_metabolic_endocrine
block_id: D10
type: block_learning_reader
version: v1
status: FINAL_EXECUTION
primary_sources:
  - 病理学讲义_AI阅读版.md
  - 内科学讲义_AI阅读版.md
recall_sources:
  - D2_口腔食管与胃_推进抗反流储存排空与胃酸_学习阅读版_v1_最终执行版.md
  - D9_GERD与贲门失弛缓_学习阅读版_v1_最终执行版.md
outline_ownership:
  - unit: IM-U033
    primary_count: 12
  - unit: IM-U034
    primary_count: 12
  - unit: IM-U035
    primary_count: 10
  - unit: IM-U036
    primary_count: 7
  - unit: IM-U037-PUD
    primary_count: 10
    deferred_to_D11_count: 2
  - unit: IM-U038
    primary_count: 11
  - unit: IM-U039
    primary_count: 12
  - unit: PATH-U005-GASTRITIS-PUD
    primary_count: 13
outline_primary_count: 87
outline_deferred_count: 7
kp_count: 25
prerequisites:
  - D2
  - D9
next_blocks:
  - O9
  - D11
visual_status: PATHOLOGY_VISUAL_READY_INTERNAL_VISUAL_SOURCE_GAP
source_conflict_status: SOURCE_CONFLICT_P88_HIGH_CHLORIDE_PHRASE
source_boundary_status: OPEN
first_pass_question_probe: PENDING_LECTUREQUESTION_BINDING
---

# D10｜胃炎、HP、消化性溃疡与上消化道出血
## 从黏膜防御失衡到深部溃疡，再到出血、穿孔、梗阻与外科重建

> **中心问题**：胃黏膜怎样在强酸、蛋白酶、胆汁、药物和应激下维持完整；当保护层被削弱或侵袭因素增强时，为什么可形成急性糜烂出血、慢性萎缩、化生与深部消化性溃疡；发生出血、穿孔、幽门梗阻或癌变警报时，怎样先处理生命危险，再选择内镜、药物、血管介入或手术？
>
> **Primary ownership**：急/慢性胃炎、A/B型胃炎、HP完整模型、消化性溃疡病理与临床、UGIB、穿孔、幽门梗阻、内外科治疗、胃大部切除及术后并发症在本 Block 首次完整建立。

---

## 0｜正式范围与边界

### Study 主范围

- `病理学讲义_AI阅读版.md`：原PDF P1–5《慢性胃炎、消化性溃疡》；
- `内科学讲义_AI阅读版.md`：书页 P83–97《胃炎》《HP》《消化性溃疡与消化道出血》；
- `D2`：胃酸、胃蛋白酶、内因子、胃排空与黏液-HCO₃⁻屏障，只作 Recall；
- `D9`：GERD / Barrett / 食管出血接口，只作 Apply。

### Outline Primary

```text
IM-U033 = 12
IM-U034 = 12
IM-U035 = 10
IM-U036 = 7
IM-U037 PUD子范围 = 10
IM-U038 = 11
IM-U039 = 12
PATH-U005 胃炎/PUD子范围 = 13
--------------------------------
D10 Primary = 87 / 87
```

病理 U005 其余 5 题：阑尾炎 2 题→D14；胰腺病 3 题→D20。内科 U037 中胃癌症状与胃溃疡癌变治疗 2 题→D11。以上均显式后置，不制造重复 Primary。

### Learn / Recall / Apply / Defer

- **Learn**：胃炎、HP、PUD、UGIB及并发症和治疗；
- **Recall**：胃酸生成、主/壁/G/ECL/D细胞、黏液-HCO₃⁻屏障、PG与黏膜血流；
- **Apply**：恶性贫血、缺铁、休克、肾功能与铋剂、术后营养问题；
- **Defer**：胃癌器官肿瘤主体归D11；肝硬化静脉曲张出血完整模型归D17；阑尾/胰腺归后续Block。

### Source Boundary / Gap

```text
SOURCE_BOUNDARY｜D10-SB01
PPI疗程、HP四联方案、UGIB再出血率、手术时限、胃切除范围、Billroth重建和术后并发症均按当前Study口径保留；不静默替换为外部最新指南或真实临床处方。
```

```text
SOURCE_BOUNDARY｜D10-SB02
A型胃炎的糖皮质激素、注射VitB12等治疗表述按当前Lecture保留。它是当前考试Source口径，不扩写成现实诊疗建议。
```

```text
SOURCE_BOUNDARY｜D10-SB03
当前Source同时含“胃酸正常/减少”“部分特殊GU胃酸增加”等分型口径。本文件按I–IV型和GU/DU比较保留，不用一般知识抹平差异。
```

```text
SOURCE_CONFLICT / 待核对｜D10-SC01
内科P88旁注出现“生理盐水Cl⁻较高，容易导致高氯性碱中毒”的文字；
该句与同页UGIB主干“休克先补平衡盐溶液”不能安全合并，亦可能存在原页/OCR读取问题。
本文件不采用该旁注、不以模型常识静默改写，保留待回原页核对。
```

```text
VISUAL_SOURCE_GAP｜D10-VG01
病理萎缩性胃炎与溃疡四层原图已可核对；内科原页中的UGIB流程、内镜再出血风险、Billroth术式、输入/输出袢梗阻与倾倒综合征图当前未全部以独立图源挂载。本文件保留回图门禁。
```

---

## 1｜第一轮固定流程

```text
Framework Orientation
→ Recall D2：胃酸—屏障—排空
→ 内科P83–85 + 病理P1–2：急/慢性胃炎、A/B型、HP
→ 内科P86–87 + 病理P2–5：PUD、GU/DU、肉眼与四层
→ 内科P87–89：UGIB、穿孔、幽门梗阻、癌变警报
→ 内科P89–92：药物、胃大部切除、术后并发症、特殊溃疡
→ Framework Reconstruction
→ KP Active Recall
→ Outline Quick Check（低压力、按需）
→ TTSX Lecture-attached Questions
→ Block Complete
```

---

# 2｜Framework｜用“深度—病因—并发症—决策”组织整章

```text
A｜正常防御
黏液-HCO₃⁻ + PG + 黏膜血流 + 上皮修复
↔ 胃酸 / 胃蛋白酶 / 胆汁 / 药物 / HP / 应激

B｜表浅损伤与慢性重塑
急性糜烂出血
或
慢性炎症 → 萎缩 → 化生 → 异型增生

C｜深部溃疡
攻击↑ / 防御↓
→ 胃或十二指肠黏膜被自身消化
→ 深达肌层
→ 四层病理 + 瘢痕修复

D｜四大并发症
出血｜穿孔｜幽门梗阻｜癌变

E｜急症决策
先看循环稳定性
→ 复苏
→ 内镜诊断/止血
→ 血管介入或手术

F｜长期控制
抑酸 + 根除HP + 保护黏膜
→ 难治/并发症时胃大部切除
→ 识别重建后特有并发症
```

## 2.1 病例先过五道门

```text
1. 是炎症/糜烂，还是深部溃疡？
2. 病因是HP、自身免疫、NSAIDs、应激还是反流？
3. 现在有无失血性休克、穿孔或梗阻？
4. 是良性溃疡，还是出现胃癌警报？
5. 当前需要药物、内镜、介入还是手术？
```

---

# Unit A｜胃炎与HP

<!-- kianos:kp id="dme-d10-kp01" -->
## KP01｜炎症、糜烂与消化性溃疡：先看损伤深度和功能后果

> **讲义定位 →** 内科 P83、P86；病理 P1–3；Recall D2  
> **主提示：** 胃炎1身份｜糜烂2后果｜溃疡深到哪｜血管/肌层｜4并发症

### 快速核对

胃炎以黏膜炎症为主；急性糜烂出血可直接出血；消化性溃疡是胃肠黏膜被自身消化形成的深部缺损，病理可深达肌层并暴露黏膜下血管。

### Detailed Expansion

```text
屏障破坏但损伤偏表浅
→ 急性糜烂出血性胃炎

攻击/防御长期失衡
→ 深部消化性溃疡
→ 出血、穿孔、梗阻、癌变
```

“发生在消化道”不自动等于消化性溃疡；关键是胃酸、胃蛋白酶、胰酶、胆汁等自身消化作用及特定胃/十二指肠病变身份。GERD造成食管糜烂不归PUD。

**Routing**：CORE｜BOUNDARY｜CONNECTION｜MI-G

<!-- kianos:kp id="dme-d10-kp02" -->
## KP02｜急性糜烂出血性胃炎：NSAIDs、应激、酒精三入口

> **讲义定位 →** 内科 P83  
> **主提示：** 3病因｜NSAID链｜应激3打击｜表现2｜急诊1检查+止血

### 快速核对

NSAIDs、严重应激或饮酒后，出现急性上腹痛和UGIB，优先想到急性糜烂出血性胃炎；急诊胃镜兼顾诊断与止血。

### Detailed Expansion

- **NSAIDs**：抑制COX-1→前列腺素↓→黏液/血流/修复保护下降；
- **应激**：
  1. 糖皮质激素接口→胃酸↑；
  2. PG↓→黏液↓、屏障破坏、增殖不足；
  3. 儿茶酚胺→黏膜缺血缺氧坏死；
- **饮酒**：直接损伤接口。

精神因素可作为急性出血性胃炎和IBS的病因/诱因，但当前Source明确不把它作为慢性胃炎主要病因。

**Routing**：CORE｜RECOGNITION｜CONFUSABLE｜MI-G

<!-- kianos:kp id="dme-d10-kp03" -->
## KP03｜慢性胃炎形态：非萎缩、萎缩、活动期与化生

> **讲义定位 →** 病理 P1–2；内科 P83  
> **主提示：** 非萎缩部位/细胞｜萎缩6征｜炎细胞2类｜活动期1细胞｜化生2型

### 快速核对

非萎缩性胃炎多见胃窦、黏膜浅层淋巴细胞和浆细胞浸润；萎缩性胃炎见黏膜变薄、皱襞变浅、血管透见、腺体减少和化生。

### Detailed Expansion

萎缩性胃炎稳定形态：

- 黏膜变薄、色泽变浅；
- 皱襞稀疏/平坦；
- 黏膜下血管清晰可见；
- 腺体变小、减少；
- 胃小凹变浅并可囊性扩张；
- 淋巴细胞、浆细胞浸润，可有纤维化。

若出现中性粒细胞，提示活动期。化生包括假幽门腺化生和肠上皮化生。

**Routing**：CORE｜VISUAL_ONLY｜RECOGNITION｜MI-G

<!-- kianos:kp id="dme-d10-kp04" -->
## KP04｜A型 vs B型胃炎：部位—细胞—胃酸—胃泌素—贫血

> **讲义定位 →** 病理 P2；内科 P83–84  
> **主提示：** 病因/抗体｜部位｜酸｜胃泌素｜贫血2型｜治疗｜常见谁

### 快速核对

A型＝自身免疫、胃体/胃底、胃酸缺乏、胃泌素↑、B12障碍/恶性贫血；B型＝HP、胃窦、胃酸正常或↓、胃泌素↓、根除HP。

### Detailed Expansion

| 轴 | A型/自身免疫性 | B型/多灶萎缩性 |
|---|---|---|
| 发病率 | 低 | 高、常见 |
| 病因 | 自身免疫 | HP |
| 抗壁细胞/内因子抗体 | 阳性 | 阴性 |
| 部位 | 胃底、胃体 | 胃窦 |
| 胃酸 | 明显减少/缺乏 | 正常或减少 |
| 胃泌素 | ↑ | ↓ |
| 贫血 | B12吸收障碍→巨幼贫/恶性贫血；Source亦保留缺铁接口 | 无恶性贫血 |
| 治疗 | 当前Study：糖皮质激素、注射B12 | 根除HP |

A型中壁细胞受损使盐酸和内因子均下降；失去酸负反馈后胃泌素升高。B型损伤胃窦G细胞，使胃泌素降低，但壁细胞未直接被自身抗体破坏。

**Routing**：CORE｜CONFUSABLE｜MI-G/MI-D｜BOUNDARY

<!-- kianos:kp id="dme-d10-kp05" -->
## KP05｜肠化、异型增生与癌变门槛

> **讲义定位 →** 病理 P2；内科 P83  
> **主提示：** 化生2大类｜完全3细胞｜不完全1细胞/2亚型｜高危1型｜处理前提｜不可逆门槛

### 快速核对

肠上皮化生常见；完全型含杯状、吸收、潘氏细胞；不完全型含杯状细胞，结肠型Ⅱb与肠型胃癌风险接口更强。

### Detailed Expansion

```text
慢性炎症
→ 腺体萎缩
→ 假幽门腺化生 / 肠上皮化生
→ 部分病例出现异型增生
→ 器官肿瘤风险上升
```

当前Source处理：先根除HP；可补充维生素、硒等；药物不能逆转的局灶重度异型增生和原位癌→内镜黏膜下剥离术 + 定期随访。

（边界：并非所有癌前病变都一定有异型增生；肝硬化是后续反例。）

**Routing**：CORE｜CONNECTION｜BOUNDARY｜MI-G/MI-D

<!-- kianos:kp id="dme-d10-kp06" -->
## KP06｜HP致病：穿黏液、造微环境、放毒素、引免疫

> **讲义定位 →** 内科 P84  
> **主提示：** 鞭毛1｜尿素酶链｜毒素2｜抗原免疫｜相关4病｜无关3类

### 快速核对

HP靠鞭毛穿过黏液层，尿素酶产NH₃中和局部酸，毒素及抗原诱导慢性炎症；关联慢性胃炎、PUD、胃癌、胃淋巴瘤。

### Detailed Expansion

1. 鞭毛帮助穿过黏液层并定居在黏液层与上皮之间；
2. 尿素酶分解尿素→NH₃→形成利于定居的局部微环境；
3. NH₃、空泡毒素、细胞毒素相关蛋白造成直接损伤；
4. 菌体抗原诱发免疫炎症，使病程慢性化。

当前Source明确：多数急性胃炎、GERD、A型慢性萎缩性胃炎与HP无关。

**Routing**：CORE｜BOUNDARY｜MI-G

<!-- kianos:kp id="dme-d10-kp07" -->
## KP07｜HP检查：首选/金标准、侵入首选、复查与抗体陷阱

> **讲义定位 →** 内科 P84  
> **主提示：** HP非侵入/侵入检查｜首选/金标准｜复查｜PPI假阴性｜抗体边界

### 快速核对

尿素呼气试验是非侵入首选、金标准和复查首选；快速尿素酶试验是侵入性首选；粪抗原简单准确；抗体不能判断根除。

### Detailed Expansion

- **UBT**：口服同位素标记尿素；HP尿素酶产生标记CO₂，经呼吸测出；
- **快速尿素酶试验**：胃镜取材后的侵入性首选；
- **粪HP抗原**：简单、准确；
- **抗体**：可长期存在，不能证明根除；当前Study强调在抑菌药/PPI影响下不易出现“检测阴性”，但这也意味着不能用于复查清除。

**Routing**：CORE｜CONFUSABLE｜MI-G/MI-D

<!-- kianos:kp id="dme-d10-kp08" -->
## KP08｜HP根除：四联、抗生素池、疗程与复查

> **讲义定位 →** 内科 P84、P89  
> **主提示：** HP根除四联组成｜抗生素选择池｜疗程｜何时复查｜与抑酸疗程关系

### 快速核对

```text
PPI + 铋剂 + 2种抗生素
疗程10–14天
根除后至少4周复查
```

### Detailed Expansion

当前Source列出的抗生素候选：四环素、克拉霉素、喹诺酮类、甲硝唑/替硝唑、阿莫西林、氨苄西林、呋喃唑酮。PUD中根除疗程可与4–8周抑酸疗程重叠，或置于抑酸疗程结束后。

这是一张考试名单，不在本文件扩写耐药地区选择和真实个体处方。

**Routing**：CORE｜MI-D｜BOUNDARY

---

# Unit B｜消化性溃疡：深部自身消化

<!-- kianos:kp id="dme-d10-kp09" -->
## KP09｜消化性溃疡本质：无酸无溃疡，无HP无复发

> **讲义定位 →** 内科 P86；病理 P2  
> **主提示：** 消化性溃疡定义/类型｜侵袭 vs 防御天平｜酸/HP各扮演什么角色｜人群边界

### 快速核对

胃酸、胃蛋白酶、胰酶、胆汁等自身消化胃肠黏膜形成PUD；主要是GU和DU，以DU最常见。

### Detailed Expansion

```text
侵袭因素↑
或
黏膜防御↓
→ 天平失衡
→ 深部溃疡
```

PUD呈慢性、反复、间断、周期/季节与节律性上腹痛；各年龄可发病，好发男性。HP与复发密切相关，但NSAIDs、胃酸和屏障异常亦参与。

**Routing**：CORE｜MECHANISM｜MI-G

<!-- kianos:kp id="dme-d10-kp10" -->
## KP10｜GU vs DU：疼痛节律、年龄、部位、酸与主故障

> **讲义定位 →** 内科 P86；病理 P2  
> **主提示：** GU vs DU｜疼痛节律｜年龄｜部位｜HP率｜胃酸｜主故障层

### 快速核对

GU多餐后痛、中老年、胃窦小弯、以防御下降为主；DU多饥饿/夜间痛、青壮年、球部前壁、以酸负荷等侵袭增强为主。

### Detailed Expansion

| 轴 | GU | DU |
|---|---|---|
| 疼痛 | 进食→痛→缓解 | 痛→进食→缓解；饥饿/夜间痛 |
| 年龄 | 中老年 | 青壮年 |
| 部位 | 胃窦小弯/胃角 | 球部前壁 |
| HP | 60–90% | ＞90%，复发更高 |
| 主要机制 | 黏膜屏障下降 | 侵袭/酸负荷增强 |
| 胃酸 | I/IV正常或↓；II/III少量↑ | 部分少量↑ |

DU并非所有患者均胃酸升高；防御受损也可参与。精神紧张可作DU诱因，但不作为慢性胃炎主因。

**Routing**：CORE｜CONFUSABLE｜MI-G/MI-D

<!-- kianos:kp id="dme-d10-kp11" -->
## KP11｜胃溃疡肉眼与四层：越向外越陈旧

> **讲义定位 →** 病理 P3  
> **主提示：** 肉眼7征｜阶梯方向｜皱襞原因｜四层内→外｜动脉内膜炎利弊｜修复2路

### 快速核对

圆/椭圆、多＜2cm、边缘整齐如刀切、底平、深达肌层、阶梯状、皱襞放射集中；底部内→外为渗出、坏死、肉芽、瘢痕。

### Detailed Expansion

**肉眼**：

- 圆形/椭圆；
- 多＜2cm；
- 边缘整齐；
- 底部平坦；
- 深达肌层；
- 阶梯状：Source口诀为贲门侧深、幽门侧浅；
- 周围皱襞因瘢痕牵拉呈放射状集中。

**镜下四层（内→外）**：

1. 炎性渗出：中性粒细胞、纤维素；
2. 坏死组织：伊红色、纤维素样坏死接口；
3. 肉芽组织：新生毛细血管、成纤维细胞；
4. 瘢痕组织：增殖/闭塞性动脉内膜炎。

当前Study解释其双面作用：管腔狭窄/闭塞与血栓形成可影响血供和愈合，同时减少血管破裂出血。肌层不能完全再生，靠肉芽→瘢痕修复，周围黏膜上皮再生覆盖。

**Routing**：CORE｜VISUAL_ONLY｜SPECIAL｜MI-G/MI-D

<!-- kianos:kp id="dme-d10-kp12" -->
## KP12｜检查：胃镜看本体和并发症，钡餐看壁外龛影与变形

> **讲义定位 →** 内科 P87  
> **主提示：** 首选/金标准｜胃镜4并发症｜钡餐3征｜壁外vs壁内｜禁忌2

### 快速核对

胃镜是首选和金标准，可活检并识别出血、梗阻、癌变等；钡餐次选，良性溃疡见壁外龛影、黏膜纠集，DU可三叶草样变形。

### Detailed Expansion

钡餐禁忌：消化道穿孔、完全性梗阻。良性胃溃疡坑低于胃壁轮廓，故龛影向外；胃癌溃疡位于肿块表面，形成壁内龛影，完整比较归D11。

胃镜除诊断溃疡，还可完成活检、评估出血/幽门梗阻/癌变和残胃癌，并可镜下止血。

**Routing**：CORE｜CONFUSABLE｜VISUAL_ONLY｜MI-G

<!-- kianos:kp id="dme-d10-kp13" -->
## KP13｜四大并发症与部位图：前面穿，后面出血

> **讲义定位 →** 内科 P87–89；病理 P2–3  
> **主提示：** 4并发症｜最常见｜GU三项部位｜DU前/后｜癌变率/边缘

### 快速核对

四大并发症：出血、穿孔、幽门梗阻、癌变；出血最常见。GU好发、出血、穿孔多在胃小弯；DU急性穿孔前壁，出血和慢性穿孔后壁。

### Detailed Expansion

```text
DU球部前壁：好发 + 急性游离穿孔
DU球部后壁：出血 + 慢性穿透
GU胃小弯：好发 + 出血 + 穿孔
```

GU癌变率当前Source多＜1%，从溃疡边缘发生；DU几乎不癌变。不能因“癌变率低”而忽略胃溃疡长期不愈合的警报。

**Routing**：CORE｜CONFUSABLE｜MI-G

---

# Unit C｜上消化道出血

<!-- kianos:kp id="dme-d10-kp14" -->
## KP14｜UGIB入口：表现取决于速度、量与部位

> **讲义定位 →** 内科 P87  
> **主提示：** UGIB：常见病因｜呕血/黑便｜表现由哪3因素决定｜失血量级｜肠鸣音

### 快速核对

PUD是UGIB最常见病因40–50%，门脉高压曲张静脉破裂次之20–25%；可见咖啡样呕血、黑便，肠鸣音增多。

### Detailed Expansion

| 估计出血量 | 当前Study表现 |
|---:|---|
| 5ml | 粪隐血阳性 |
| 50ml | 黑便 |
| 250ml | 可呕血 |
| ＞400ml | 头晕、心悸、乏力等 |
| ＞800–1000ml | 可休克 |

表现为呕血还是便血、颜色如何，主要受出血速度和量影响，部位亦参与。咖啡样血表示血液与胃液接触；位置较高或速度快可见鲜血。

**Routing**：CORE｜RECOGNITION｜MI-G/MI-D

<!-- kianos:kp id="dme-d10-kp15" -->
## KP15｜活动性出血：不要把“还有黑便”当唯一证据

> **讲义定位 →** 内科 P87  
> **主提示：** 5证据｜循环反应｜三血象方向｜BUN条件｜胃管｜黑便边界

### 快速核对

反复呕血/便血增多、肠鸣音活跃、复苏后循环不改善或再恶化、Hb/RBC/Hct继续下降、补液尿量足够仍BUN升高、胃管新鲜血支持活动性出血。

### Detailed Expansion

黑便可在出血停止后持续约3天排出，因此“仍有黑便”本身不能证明继续出血。BUN判断必须以补液和尿量足够、并排除肾脏自身问题为前提，才支持肠源性氮质血症。

**Routing**：CORE｜BOUNDARY｜RECOGNITION｜MI-G

<!-- kianos:kp id="dme-d10-kp16" -->
## KP16｜UGIB处理：先复苏，再内镜；找不到病灶再看动脉

> **讲义定位 →** 内科 P88  
> **主提示：** UGIB处理顺序｜先复苏→内镜｜内镜风险层｜找不到病灶再看什么｜栓塞/手术指征

### 快速核对

休克（SBP＜90mmHg）先补充血容量；稳定后急诊内镜诊断并止血。内镜未找到而疑动脉出血→选择性血管造影，造影剂外溢最可靠，可导管栓塞。

### Detailed Expansion

**内镜再出血风险与策略**：

| 内镜表现 | 再出血率 | 当前Study处理 |
|---|---:|---|
| 活动性动脉出血 | 90% | PPI + 内镜治疗；必要时介入/手术 |
| 裸露血管 | 50% | PPI + 内镜治疗 |
| 血凝块 | 25–30% | PPI；必要时内镜治疗 |
| 无血迹/清洁基底 | ＜5% | PPI |

外科指征：内科治疗无效/出血快短期休克、高龄伴动脉硬化、既往类似大出血；Source术式为急症剖腹探查贯穿缝扎。

**Routing**：CORE｜DECISION｜MI-G/MI-D｜BOUNDARY

---

# Unit D｜穿孔、梗阻与癌变警报

<!-- kianos:kp id="dme-d10-kp17" -->
## KP17｜穿孔：急性游离 vs 慢性穿透

> **讲义定位 →** 内科 P88–89  
> **主提示：** 急性穿孔 vs 慢性穿透｜部位/病因｜痛/腹膜征｜影像/腹穿｜治疗顺序/时间窗

### 快速核对

急性穿孔：突发上腹刀割样痛→全腹、板状腹、肠鸣音↓、肝浊音界消失；X线膈下游离气。慢性穿透常背痛，可穿胰致淀粉酶↑或形成瘘，CT有价值。

### Detailed Expansion

急性穿孔完整链：

```text
胃肠内容物进入腹腔
→ 化学性腹膜炎
→ 压痛 + 反跳痛 + 肌紧张/板状腹
→ 肠鸣音下降
→ 气体覆盖肝区，肝浊音界缩小/消失（最有价值体征）
```

还可有右下腹转移痛、移动性浊音、包裹性脓肿和膈下脓肿。首选X线；腹穿可见黄色浑浊、胆汁/食物残渣。先禁食补液、胃肠减压；饱餐后或弥漫性腹膜炎→修补缝合，Source要求争取8小时内。

**Routing**：CORE｜RECOGNITION｜VISUAL_ONLY｜MI-G/MI-D

<!-- kianos:kp id="dme-d10-kp18" -->
## KP18｜幽门梗阻：酸性隔夜宿食、无胆汁、低钾低氯碱中毒

> **讲义定位 →** 内科 P89  
> **主提示：** 症状3｜呕吐物3点｜体征3｜电解酸碱｜首治5｜缓解=？不缓解=？｜术前抗生素

### 快速核对

餐后很快腹痛、反复呕吐隔夜酸宿食且不含胆汁；胃型、胃蠕动波、振水音；易低钾低氯碱中毒。

### Detailed Expansion

治疗：禁食、胃减压、补液和KCl，当前Source列平衡盐/5%葡萄糖盐水/生理盐水，并用高渗温盐水洗胃减轻水肿。

```text
处理后缓解 → 痉挛/水肿性为主
处理后不缓解 → 瘢痕性为主
→ 内镜扩张或胃大部切除
```

手术前用抗生素。梗阻时不用M受体阻断剂解痉，以免进一步降低蠕动。

**Routing**：CORE｜RECOGNITION｜CONFUSABLE｜MI-G/MI-D

<!-- kianos:kp id="dme-d10-kp19" -->
## KP19｜胃溃疡癌变警报：从节律痛变成不规律、消瘦、持续隐血

> **讲义定位 →** 内科 P89；病理 P2  
> **主提示：** GU癌变警报｜哪些溃疡会癌变｜症状节律怎么变｜消瘦/隐血｜疗程后仍不愈怎么办

### 快速核对

GU可癌变、从边缘开始；DU不癌变。腹痛失去规律、体重下降、贫血、持续隐血、保守治疗＞8周无效、胃酸缺乏提示胃癌警报。

### Detailed Expansion

胃癌常见症状为疼痛和体重下降，但疼痛不再保持典型溃疡节律。恶性肿瘤持续坏死出血使粪隐血可持续阳性；不能仅凭溃疡“缩小”判断良性。当前Source处理方向为手术为主、配合化疗，完整胃癌模型归D11。

**Routing**：CORE｜RECOGNITION｜CONNECTION｜MI-G

---

# Unit E｜药物与外科重建

<!-- kianos:kp id="dme-d10-kp20" -->
## KP20｜PUD内科治疗三环：抑酸、根除HP、保护黏膜

> **讲义定位 →** 内科 P89–90  
> **主提示：** 3环｜最重要1｜PPI三身份/疗程GU-DU｜P-CAB/H2RA｜铋/米索禁忌｜NSAID预防

### 快速核对

抑酸最重要；PPI首选、最佳和维持。DU约4周，GU约6–8周；根除HP用四联；黏膜保护需记铋剂肾功能不全禁用、米索前列醇孕妇禁用。

### Detailed Expansion

- **PPI**：抑酸、抑制胃蛋白酶、稳定血凝块环境；
- **P-CAB**：同属强抑酸接口；
- **H2RA**：法莫替丁在当前Source抑酸较强；长期维持复发者半数以上可为无症状溃疡，以出血/穿孔首发；
- **HP根除**：四联；
- **铋剂**：肾功能不全禁用；
- **米索前列醇**：孕妇禁用；
- **铝剂**：主要中和酸；
- **NSAID溃疡预防**：PPI + 米索前列醇。

**Routing**：CORE｜CONFUSABLE｜MI-G/MI-D｜BOUNDARY

<!-- kianos:kp id="dme-d10-kp21" -->
## KP21｜胃大部切除与Billroth I/II：切掉产酸区，再决定怎么接

> **讲义定位 →** 内科 P90  
> **主提示：** 切除范围/切断线｜毕I适应/接法/复发/并发｜毕II适应/接法/吻口3–4｜取舍

### 快速核对

胃远端切除＞2/3–3/4（Source亦写约60%），包括幽门和部分十二指肠球部。毕I残胃—十二指肠，生理、并发少但复发较高；毕II残胃—近端空肠，复发低但并发多。

### Detailed Expansion

切断线：小弯侧胃左动脉第一分支至大弯侧胃网膜左动脉最后一分支连线。

| 轴 | Billroth I | Billroth II |
|---|---|---|
| 常用对象 | I型GU | DU等 |
| 接法 | 残胃—十二指肠 | 关闭十二指肠残端，残胃—近端空肠 |
| 吻合口 | — | 3–4cm |
| 优点 | 符合原生理，并发少 | 张力小、复发低 |
| 缺点 | 张力高、易复发 | 改变解剖，并发多 |

手术通过切除胃窦G细胞和远端胃体壁/主细胞区域，减少胃泌素、胃酸和胃蛋白酶来源。

**Routing**：CORE｜VISUAL_ONLY｜CONFUSABLE｜MI-G/MI-D

<!-- kianos:kp id="dme-d10-kp22" -->
## KP22｜Billroth II四种吻合：结肠前后、输入袢位置与胃断端

> **讲义定位 →** 内科 P90  
> **主提示：** BillrothⅡ 4法｜结肠前/后｜输入袢靠小/大弯｜胃断端处理｜袢长

### 快速核对

| 术式 | 结肠关系 | 输入段对侧 | 胃断端 |
|---|---|---|---|
| Hoffmeister | 后 | 小弯 | 部分 |
| Polya | 后 | 小弯 | 全部 |
| Moynihan | 前 | 大弯 | 全部 |
| Eiselsberg | 前 | 小弯 | 部分 |

### Detailed Expansion

当前Source的袢长：结肠后6–8cm，结肠前8–10cm。该表属于典型MI-D：必须知道它挂在Billroth II重建模型下，但不让低频术式细节阻塞主线。

**Routing**：SPECIAL｜VISUAL_ONLY｜MI-D

<!-- kianos:kp id="dme-d10-kp23" -->
## KP23｜胃大切早期并发症：胃瘫、出血、漏、残端漏与四类梗阻

> **讲义定位 →** 内科 P91  
> **主提示：** 胃大切早期并发症：胃瘫/出血/漏/残端漏/梗阻｜时间轴｜腔内 vs 腹腔｜胆汁/食物线索

### 快速核对

胃瘫似幽门梗阻但呕吐可含胆汁、无胃蠕动波，禁止再次手术；出血按1天/1周/1月定位；梗阻先看呕吐物含食物还是胆汁。

### Detailed Expansion

**胃瘫**：胃复安、红霉素、新斯的明、糖皮质激素；当前Source禁止手术。

**出血时间**：

- 1天内：术中止血不确切；
- 1周内：吻合口黏膜坏死脱落；
- 1月内：感染腐蚀血管。

腔内出血肠鸣音↑、内镜确诊；腹腔内出血肠鸣音↓、腹穿不凝血。

**十二指肠残端漏**：多术后1–2天，突发上腹痛/腹膜炎，腹穿胆汁；急诊修补、造瘘、引流，并解除输入袢梗阻。

**四类梗阻**：

| 类型 | 食物 | 胆汁 | 特点 |
|---|---:|---:|---|
| 急性完全输入袢 | 有少量 | 无 | 频繁少量，吐后不缓解，闭袢易绞窄 |
| 慢性不完全输入袢 | 无 | 有 | 进食约半小时大量胆汁 |
| 输出袢 | 有 | 有 | 食物与胆汁均无法下行 |
| 吻合口 | 有 | 无 | 胃内容物不能进入空肠 |

无绞窄/腹膜炎先保守；出现绞窄则手术。

**Routing**：CORE｜CONFUSABLE｜VISUAL_ONLY｜MI-G/MI-D

<!-- kianos:kp id="dme-d10-kp24" -->
## KP24｜远期并发症：倾倒、碱性反流、吻合口溃疡、残胃癌与营养

> **讲义定位 →** 内科 P91–92  
> **主提示：** 胃大切远期并发症｜早/晚倾倒｜碱性反流｜吻合口溃疡｜残胃癌｜营养障碍

### 快速核对

早期倾倒进食后30min，以低血容量/低血压为主；晚期2–4h，以餐后低血糖为主。碱性反流多术后1–2年，胆汁呕吐、吐后痛不缓解、抑酸无效。

### Detailed Expansion

- 倾倒治疗：低糖、高脂饮食；Source列生长抑素；
- 碱性反流性胃炎：反流、烧心、胆汁呕吐、体重下降；治疗Roux-en-Y；
- 吻合口溃疡/复发：2–3年；
- 残胃癌：＞5年；
- 营养：巨幼贫、缺铁贫、体重下降、脂肪泻、骨病。

（易混：碱性反流的“烧心”不代表反流物一定是酸；呕吐后腹痛不缓解。）

**Routing**：CORE｜CONFUSABLE｜MI-G/MI-D

<!-- kianos:kp id="dme-d10-kp25" -->
## KP25｜特殊溃疡：复合、高位、巨大、幽门管、球后、儿童与难治

> **讲义定位 →** 内科 P92  
> **主提示：** 特殊溃疡类型｜各1个识别点｜出血/梗阻/恶变风险｜难治定义

### 快速核对

- II型复合：GU+DU，酸少量↑，癌变率低；
- IV型高位：胃底/体后壁，NSAIDs，背痛，不易梗阻；
- III型幽门管：症状最不典型、最易梗阻，易出血/穿孔；
- 球后：十二指肠降/水平部，夜间痛、背痛、最易出血。

### Detailed Expansion

- **巨大溃疡**：直径＞2cm，多见老年/长期NSAIDs；
- **球后溃疡**：不易幽门梗阻，易慢性穿透，可引起胰腺炎/淀粉酶升高，严重可梗阻性黄疸；
- **儿童溃疡**：多脐周痛；
- **难治性溃疡**：当前Source举Crohn、胃泌素瘤、放疗术后等，药物反应差、手术易复发。

特殊型主要是MI-D识别岛；第一轮先挂回“部位—酸—并发症”三轴。

**Routing**：SPECIAL｜RECOGNITION｜MI-D

---

## 3｜Framework Reconstruction

闭卷重建五张图：

### 图1｜攻击—防御天平

```text
攻击：酸/蛋白酶/胆汁/HP/NSAIDs/应激
↔
防御：黏液-HCO₃⁻/PG/血流/修复
```

### 图2｜胃炎—萎缩—化生

```text
慢性炎症
→ 腺体减少/黏膜变薄
→ 假幽门腺化生/肠化
→ 异型增生门槛
→ D11胃癌风险接口
```

### 图3｜PUD四层和四并发症

```text
渗出 → 坏死 → 肉芽 → 瘢痕
             ↓
出血 / 穿孔 / 梗阻 / 癌变
```

### 图4｜UGIB决策

```text
先看血压/灌注
→ 复苏
→ 内镜
→ PPI+镜下止血
→ 介入栓塞/手术
```

### 图5｜Billroth II输入输出袢

```text
胆汁：十二指肠残端→输入袢
食物：胃→吻合口→输出袢
→ 用呕吐物“食物/胆汁”定位梗阻
```

---

## 4｜Memory Routing

### MI-G

- 急性糜烂出血三病因与机制；
- 萎缩性胃炎形态；
- A/B型完整比较；
- HP机制—检查—根除；
- PUD本质与GU/DU比较；
- 胃溃疡四层；
- 四大并发症和部位图；
- UGIB先复苏、后内镜；
- 活动性出血证据；
- 穿孔/幽门梗阻识别；
- PPI、HP根除和黏膜保护；
- Billroth I/II主区别；
- 输入/输出袢基本定位。

### MI-D

- 肠化完整亚型与细胞名单；
- HP抗生素完整池；
- 出血量数字、内镜再出血率；
- 胃溃疡阶梯方向与动脉内膜炎细节；
- 术式切断线、Billroth II四种变体与袢长；
- 术后出血时间、全部早晚并发症；
- 特殊溃疡名单与低频数字。

---

## 5｜Study 原图门禁

1. 正常胃黏膜 vs 萎缩性胃炎；
2. A型 vs B型胃炎表；
3. 完全/不完全肠化；
4. HP定居与尿素酶图；
5. GU/DU部位图；
6. 胃溃疡肉眼与底部四层；
7. 良性溃疡壁外龛影、胃癌壁内龛影；
8. UGIB内镜风险与处理表；
9. 膈下游离气、板状腹；
10. 幽门梗阻胃型/蠕动波/振水音；
11. 胃大部切除范围；
12. Billroth I/II与Hoffmeister/Polya/Moynihan/Eiselsberg；
13. 输入/输出袢梗阻；
14. 早/晚倾倒和Roux-en-Y。

---

## 6｜Outline Coverage Safety Net

### Internal Coverage Ledger

```text
IM-U033_total = 12
IM-U034_total = 12
IM-U035_total = 10
IM-U036_total = 7
IM-U037_total = 12
IM-U038_total = 11
IM-U039_total = 12
PATH-U005_total = 18

IM current_primary_PUD = 74
IM-U037 explicit_deferred_gastric_cancer_to_D11 = 2
PATH-U005 current_primary_gastritis_PUD = 13
PATH-U005 explicit_deferred_appendicitis = 2
PATH-U005 explicit_deferred_pancreas = 3

outline_touched_total = 94
current_primary_total = 87
explicit_deferred = 7
accounted = 94
unmapped = 0
missing = 0
duplicate_primary = 0
```

### 归属摘要

| Outline身份 | 题数 | 当前处置 |
|---|---:|---|
| IM-U033 | 12 | mapped_primary → KP01–KP05 |
| IM-U034 | 12 | mapped_primary → KP06–KP08 |
| IM-U035 | 10 | mapped_primary → KP09–KP13 |
| IM-U036 | 7 | mapped_primary → KP14–KP18 |
| IM-U037 PUD子范围 | 10 | mapped_primary → KP19–KP22 |
| IM-U038 | 11 | mapped_primary → KP23–KP24 |
| IM-U039 | 12 | mapped_primary / supporting → KP13–KP25 |
| PATH-U005 胃炎/PUD子范围 | 13 | mapped_primary / supporting → KP03–KP13 |
| IM-U037 胃癌子范围 | 2 | explicit_deferred → D11 |
| PATH-U005 阑尾炎/胰腺病 | 5 | explicit_deferred → D14/D20 |
| **当前Primary合计** | **87** | **87 / 87 accounted** |

学习者侧：Outline可按“胃炎—HP—PUD—急症—手术”低压力扫漏，不要求87题全量完成。

---

## 7｜Lecture Knowledge Routing Ledger

| Lecture范围 | 当前归属 | Knowledge Role | Memory / Boundary |
|---|---|---|---|
| 急性糜烂出血胃炎 | KP01–KP02 | CORE + RECOGNITION | MI-G |
| 慢性/萎缩性胃炎 | KP03 | CORE + VISUAL_ONLY | MI-G |
| A/B型 | KP04 | CORE + CONFUSABLE | D10-SB02 |
| 化生/异型/原位 | KP05 | CORE + CONNECTION | MI-G/MI-D |
| HP机制 | KP06 | CORE | MI-G |
| HP检查/根除 | KP07–KP08 | CORE + CONFUSABLE | MI-G/MI-D |
| PUD定义/症状 | KP09–KP10 | CORE | MI-G |
| 胃酸I–IV型 | KP10 | SPECIAL + CONFUSABLE | D10-SB03 |
| 肉眼/四层/修复 | KP11 | CORE + VISUAL_ONLY | MI-G/MI-D |
| 胃镜/钡餐 | KP12 | CORE + CONFUSABLE | MI-G |
| 四并发症/部位 | KP13 | CORE + CONFUSABLE | MI-G |
| UGIB表现/量 | KP14 | CORE + RECOGNITION | MI-G/MI-D |
| 活动性出血 | KP15 | CORE + BOUNDARY | MI-G |
| UGIB治疗 | KP16 | CORE + DECISION | D10-SB01 |
| 穿孔 | KP17 | CORE + RECOGNITION | MI-G/MI-D |
| 幽门梗阻 | KP18 | CORE + RECOGNITION | MI-G |
| 癌变警报 | KP19 | CONNECTION + RECOGNITION | D11 |
| 抑酸/HP/黏膜保护 | KP20 | CORE + CONFUSABLE | D10-SB01 |
| 胃大切/Billroth | KP21–KP22 | CORE + VISUAL_ONLY | MI-G/MI-D |
| 早期并发症 | KP23 | CORE + CONFUSABLE | MI-G/MI-D |
| 远期并发症 | KP24 | CORE + CONFUSABLE | MI-G/MI-D |
| 特殊溃疡 | KP25 | SPECIAL + RECOGNITION | MI-D |
| 阑尾炎 | D14 | DEFERRED_MODEL | 2题显式后置 |
| 胰腺病 | D20 | DEFERRED_MODEL | 3题显式后置 |
| 胃癌症状与胃溃疡癌变治疗2题 | D11 | DEFERRED_MODEL | IM-U037显式后置；当前仅保留警报接口 |
| 曲张静脉出血完整模型 | D17 | DEFERRED_MODEL | 当前只作UGIB病因比较 |
| 重复口诀/真题解析 | 对应KP/Outline | REDUNDANT_EXPOSITION | 无独立遗漏 |

```text
unrouted_lecture_knowledge = 0
external_medical_expansion = 0
silent_source_correction = 0
source_boundary_open = D10-SB01,D10-SB02,D10-SB03
source_conflict_open = D10-SC01
visual_source_gap_open = D10-VG01
```

---

## 8｜First-pass Question Probe

```text
来源：
TTSX Lecture-attached Questions

选择方式：
LectureQuestionBinding 自动提供

绑定范围：
病理Lecture P1–P5
+ 内科Lecture P83–P97 的 source-position relation

状态：
待绑定
```

不得从 PATH-U005 或 IM-U033–U039 自行挑题冒充 Lecture-attached Questions。

---

## 9｜Block Exit｜闭卷36问

1. 胃炎、糜烂与PUD怎样按损伤性质区分？
2. 急性糜烂出血三病因及机制是什么？
3. 萎缩性胃炎六个形态特征是什么？
4. 中性粒细胞浸润说明什么？
5. A/B型从七轴怎样比较？
6. A型为什么胃泌素升高、B型为什么降低？
7. 完全/不完全肠化各有哪些细胞，哪型高危？
8. HP四步致病链是什么？
9. 哪四种疾病与HP有关，哪三类通常无关？
10. UBT、快速尿素酶、粪抗原、抗体如何分工？
11. HP四联、疗程和复查时间是什么？
12. PUD定义和攻击—防御天平是什么？
13. GU与DU从疼痛、年龄、部位、HP、酸和机制怎样比较？
14. 胃溃疡肉眼七征是什么？
15. 溃疡四层由内向外是什么？
16. 增殖/闭塞性动脉内膜炎的利弊是什么？
17. 胃镜与钡餐分别提供什么证据？
18. 四大并发症和前/后壁部位图是什么？
19. UGIB最常见和次常见病因及比例是什么？
20. 5/50/250/400/800–1000ml分别对应什么？
21. 活动性出血五组证据是什么？
22. 为什么黑便不能单独证明仍在出血？
23. 休克UGIB第一步是什么？
24. 四种内镜表现的再出血率与处理是什么？
25. 何时选择血管造影、什么征象最可靠、怎样止血？
26. 外科止血三指征是什么？
27. 急性穿孔最有价值体征和首选检查是什么？
28. 慢性穿透与急性游离穿孔怎样区分？
29. 幽门梗阻的呕吐物、体征和酸碱是什么？
30. 如何区分水肿/痉挛性与瘢痕性梗阻？
31. 胃溃疡癌变六个警报是什么？
32. PUD三大内科治疗环节与主要禁忌是什么？
33. Billroth I与II怎样比较？
34. 四种Billroth II重建怎样定位？
35. 四类术后梗阻怎样按食物/胆汁判断？
36. 早晚倾倒、碱性反流、吻合口溃疡、残胃癌与特殊溃疡怎样定位？

---

## 10｜Block Production Gate

```text
Study_continuity = PASS
Framework_is_map = PASS
KP_total = 25
natural_mechanism_split = 0
repeated_first_exposure = 0
outline_current_primary = 87
outline_current_primary_mapped = 87
outline_explicit_deferred = 7
unmapped = 0
missing = 0
duplicate_primary = 0
unrouted_lecture_knowledge = 0
external_medical_expansion = 0
silent_source_correction = 0
First_pass_question_probe = READY_PENDING_BINDING
Source_boundary_open = D10-SB01,D10-SB02,D10-SB03
Source_conflict_open = D10-SC01
Visual_gate = PATHOLOGY_VISUAL_READY_INTERNAL_VISUAL_SOURCE_GAP
Block_status = PASS_FINAL_EXECUTION
```

### Block Complete 定义

```text
Framework已建立
+ 胃炎/萎缩/A-B型/HP可闭卷恢复
+ PUD与GU/DU可从机制和部位推导
+ 溃疡四层与四并发症可恢复
+ UGIB能先判循环稳定性再选内镜/介入/手术
+ 穿孔、幽门梗阻和癌变警报可识别
+ 药物与Billroth主干可恢复
+ 术后并发症能按时间、呕吐物和解剖分流
+ Outline当前Primary 87 / 87归位
+ KP Active Recall完成
+ 原图门禁完成或Visual Gap显式
+ TTSX Question Probe完成或待绑定
```

允许：**Block Complete + MI-D Open + Visual Gap Open**。若仍不能先处理UGIB的血流动力学，或把DU后壁出血/前壁穿孔混淆，先最小回补再进入O9/D11。
