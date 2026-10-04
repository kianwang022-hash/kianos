<!-- kianos:lecture-replacement-candidate {"status":"SELF_CANDIDATE_PENDING_CONTENT_ADMISSION","medical_authority":false,"lane":"LECTURE_REPLACEMENT","authoring_base":"bc014aeee3c7ca1be91a180a41336f03d14b3930","canonical_path":"content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/m-m1-m10/M3_成熟红细胞与磷酸戊糖途径_学习阅读版_v1_最终执行版.md","authoring_canonical_sha256":"709b182e6fd62f902367b46c802c4d8ffa5cdade12807fd6d3a2dbe3ce3d0c26","draft_canonical_sha256":"709b182e6fd62f902367b46c802c4d8ffa5cdade12807fd6d3a2dbe3ce3d0c26","policy_dependency_pr":1148,"policy_dependency_commit":"7a276ea16693eaf7c8a36be1080341f47d2c115a","canonical_core_injection":false,"body_revision":"r2.1-portable-h1-reference-20261004","view":"teaching","source_stage_original_sha256":"189e28c8a557ae92a13b880f7b1139160d1884efa6731e409fff1cb0a460cf82"} -->

# M3｜成熟红细胞怎样用葡萄糖同时供能、放氧和自保

成熟红细胞运送氧，却没有线粒体可把氧用于氧化磷酸化。这个结构条件怎样约束能量，又怎样容许它调节放氧、抵抗氧化损伤？从葡萄糖的不同用途出发，比把三条路线分别背熟更容易看见其分工。

## 没有线粒体，先收窄能够完成的任务

成熟RBC不能进行PDH氧化脱羧、TCA、氧化磷酸化、线粒体脂肪酸β氧化。当前P011的2015N160还排除其从头合成脂肪酸，以乙酰CoA的线粒体来源说明原料限制；这只是成熟细胞的能力判断，不能倒推脂肪酸合成全部反应都在线粒体。完整合成归M7。

其主路线是无氧糖酵解和PPP；2,3-DPG旁路嵌在糖酵解内部。葡萄糖→丙酮酸→乳酸，乳酸分支把NADH的氢交出并再生NAD⁺，使拆糖不断续。按一葡萄糖完整走主路到两乳酸，净2ATP；当前讲义将无氧糖酵解列为成熟RBC唯一供能方式，未拆分ATP具体用途。这个2ATP账尚未扣旁路跳过的产能机会，所以不能当成所有分流比例下的固定细胞产量。

把供能接到细胞稳定，只需再问ATP缺了以后膜还能否保持可变形状态。[人红细胞ATP耗竭/恢复实验](https://pubmed.ncbi.nlm.nih.gov/4388591/)观察到耗竭时膜可变形性下降、后期细胞内钙上升及盘形向球形改变，恢复细胞内ATP可逆转相当部分变化。这个已查证的用途补充说明：糖酵解供ATP不只是产生一个数值，也帮助维持RBC膜的物理状态与存活；具体ATP—钙—膜相互作用不能在此简化为某一种泵的全部后果。PPP供NADPH、再生GSH的抗氧化保护是另一条自保链，不能用后者替代ATP的膜维持任务。原P009–P018没有展开该用途，补充实验也不新增课程精确数值或临床诊疗要求。

<!-- lr-kp {"kp_id": "biochem-m3-kp01", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/m-m1-m10/M3_成熟红细胞与磷酸戊糖途径_学习阅读版_v1_最终执行版.md"} -->
> 成熟 RBC 的代谢约束：为什么只能依靠葡萄糖〔细胞结构约束｜受限通路｜主代谢2｜功能分支3｜供能来源〕

<!-- lr-kp {"kp_id": "biochem-m3-kp02", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/m-m1-m10/M3_成熟红细胞与磷酸戊糖途径_学习阅读版_v1_最终执行版.md"} -->
> RBC 糖酵解：无线粒体时怎样持续供能〔RBC为何只能糖酵解｜终点｜净ATP｜NAD⁺怎么再生｜供能边界〕

## 调放氧要从供能路线中付出机会成本

在1,3-DPG处，部分碳先转成2,3-DPG，再回3-PG并接回后段糖酵解。这样绕开主路1,3-BPG→3-PG产ATP的一步：旁路本身不直接产ATP，回到主路仍可继续后段产能。2,3-DPG不是高能化合物，其收益在Hb调节。

2,3-DPG增加使Hb与氧亲和力下降、氧解离曲线右移，促进组织放氧；体温升、CO₂升、pH降与其增加在当前Study中列为右移协同因素。如果只追求最高主路ATP，就会忽略细胞运氧任务；若把旁路当成永久碳死路，又会漏掉3-PG回流。完整Hb结构及曲线机制留给呼吸/血液。

<!-- lr-kp {"kp_id": "biochem-m3-kp03", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/m-m1-m10/M3_成熟红细胞与磷酸戊糖途径_学习阅读版_v1_最终执行版.md"} -->
> 2,3-DPG旁路：牺牲部分直接产能，换取组织放氧〔来源｜旁路2步｜回哪｜Hb亲和方向｜曲线｜协同4｜供能边界〕

## PPP制造还原力，GSH把还原力交给过氧化物

胞浆G-6-P经关键酶G6PD进入PPP，得到5-磷酸核糖、NADPH和CO₂；NADPH在当前模型对G6PD抑制。核糖供M9核苷酸合成，NADPH服务抗氧化、还原合成与生物转化，PPP不以直接ATP为主要目标。

抗氧化需要两次交接：

```text
H₂O₂ + 2GSH --GSH过氧化物酶→ 2H₂O + GSSG
GSSG + NADPH + H⁺ --GSH还原酶→ 2GSH + NADP⁺
```

第一步GSH直接还原过氧化物，自身氧化成GSSG；第二步NADPH再生GSH。清除过氧化物与再生清除剂不是同一步，也不是同一种酶。两步持续闭合，才能维护膜及蛋白稳定。当前27 P058已有这套两步原图的bounded核证，可复用证据；其位置在后续Source单元，本章只给回看地址，不要求提前打断S02/S03。

<!-- lr-kp {"kp_id": "biochem-m3-kp04", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/m-m1-m10/M3_成熟红细胞与磷酸戊糖途径_学习阅读版_v1_最终执行版.md"} -->
> PPP：不直接以 ATP 为目标的葡萄糖分流〔部位｜起点｜关键酶/调节｜3产物｜主要用途｜与供能通路的区别〕

<!-- lr-kp {"kp_id": "biochem-m3-kp05", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/m-m1-m10/M3_成熟红细胞与磷酸戊糖途径_学习阅读版_v1_最终执行版.md"} -->
> NADPH—GSH循环：把过氧化物还原成水〔2反应｜2酶｜NADPH供谁｜GSH/GSSG｜结果｜RBC膜〕

G6PD活性不足首先削弱PPP的NADPH供给，GSSG难以还原成GSH，氧化物清除不足，膜和蛋白受损，接到RBC破裂/溶血。蚕豆等氧化剂是当前典型触发，可出现血管内外溶血。此链不能缩成“G6PD缺陷导致所有ATP立刻归零”：酶位于还原力分支，糖酵解供能不是被它直接关断。完整遗传、诱因、实验室及治疗归H5。

<!-- lr-kp {"kp_id": "biochem-m3-kp06", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/m-m1-m10/M3_成熟红细胞与磷酸戊糖途径_学习阅读版_v1_最终执行版.md"} -->
> G6PD缺陷：为什么“抗氧化链”先断〔G6PD↓→哪条抗氧化链断｜触发因素｜红细胞损伤/溶血方向｜证据边界〕

## 名字相近的货币，不能相互替代

在这个细胞中，糖酵解NADH用于丙酮酸→乳酸、再生NAD⁺；有线粒体的其他组织还能把其还原当量交呼吸链。PPP的NADPH则用于再生GSH及还原合成/生物转化接口，不能按本模型当常规氧化磷酸化供能载体。ATP支付供能任务，2,3-DPG改变Hb亲和力，5-P核糖提供核苷酸原料。五种产物的共同来源不使功能相同。

<!-- lr-kp {"kp_id": "biochem-m3-kp07", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/m-m1-m10/M3_成熟红细胞与磷酸戊糖途径_学习阅读版_v1_最终执行版.md"} -->
> NADH vs NADPH：名字相近，工作分区不同〔来源｜主要用途｜RBC各做什么｜呼吸链能否用｜GSH｜核糖〕

现在可从同一限制推出整章：无线粒体迫使ATP来自糖酵解；运氧功能需要2,3-DPG分流；暴露于氧化压力又需要PPP—NADPH—GSH。判断一处损伤，先找所属支路，再追下游功能，不能把一条失效扩大成所有葡萄糖用途同时消失。

## 当前来源与边界

当前27 BIO27-S02 P009–P012形成RBC供能/2,3-DPG，S03 P013–P018形成PPP并达既有闭合；P058只作GSH两步的后续精确回看。当前Source的“非OXPHOS载体”不得压成“NADPH只能生物转化”。五道附题保留原Source位置，2015N160、2017N28、2023N142及2015N29、2025N122–123不新推Question→KP绑定。2,3-DPG酶名、遗传与诱因细节可后置精记，完整机制不能失踪；本稿不建立额外Memory或学习完成证据。
