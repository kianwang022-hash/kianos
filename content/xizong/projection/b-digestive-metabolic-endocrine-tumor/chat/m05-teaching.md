<!-- kianos:lecture-replacement-candidate {"status":"SELF_CANDIDATE_PENDING_CONTENT_ADMISSION","medical_authority":false,"lane":"LECTURE_REPLACEMENT","authoring_base":"bc014aeee3c7ca1be91a180a41336f03d14b3930","canonical_path":"content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/m-m1-m10/M5_血浆脂蛋白_学习阅读版_v1_最终执行版.md","authoring_canonical_sha256":"d219175861b0e7f36d0c1e544861bf0e6c28336fd342c530f78fefab0c2b11dd","draft_canonical_sha256":"d219175861b0e7f36d0c1e544861bf0e6c28336fd342c530f78fefab0c2b11dd","policy_dependency_pr":1148,"policy_dependency_commit":"7a276ea16693eaf7c8a36be1080341f47d2c115a","canonical_core_injection":false,"body_revision":"r2.1-portable-h1-reference-20261004","view":"teaching","source_stage_original_sha256":"044ee60b1b9265d4294d49864c0c80cedf3be95d940bda37415b3082aac3fe95"} -->

# M5｜脂质怎样在血浆中被装载、交付和收回

脂质疏水，却要在水相血浆中跨器官运输。关键问题不是给四类颗粒评好坏，而是谁装哪类货物、沿哪条路线走，以及哪一个识别或卸货节点决定终点。

## 颗粒的蛋白身份决定物流任务

TAG、胆固醇、磷脂与载脂蛋白apo组合为血浆脂蛋白。apo既稳定、携带脂类，也充当受体识别标记、激活代谢酶、连接脂类交换。交换角色在此保留，CETP及完整交换网络后置。脂类本身还有供能、保温、膜、脂溶性维生素吸收及DAG信息传递任务，运输模型只负责让它们到达任务场所。游离脂肪酸则主要结合白蛋白，不能把apo套给所有血脂。

四颗粒可先按任务形成三条线：

```text
小肠外源长链脂质 → CM → 组织卸下TAG
肝内源TAG → VLDL → IDL → LDL → 胆固醇交付/清除
肝外胆固醇 → HDL → 肝
```

CM标志apoB48；VLDL为前β，LDL为β，HDL为α。LDL来自血浆VLDL—IDL转换，不能当肝直接分泌的最终成品。HDL来源包括小肠、肝和血浆。这里真有VLDL→IDL→LDL转换，却没有依据把三条线接成“CM逐级变HDL”。

<!-- lr-kp {"kp_id": "biochem-m5-kp01", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/m-m1-m10/M5_血浆脂蛋白_学习阅读版_v1_最终执行版.md"} -->
> 为什么需要脂蛋白：把疏水脂质变成可定向运输的血浆颗粒〔脂类组成｜apo的任务层次｜4颗粒｜方向轴〕

<!-- lr-kp {"kp_id": "biochem-m5-kp02", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/m-m1-m10/M5_血浆脂蛋白_学习阅读版_v1_最终执行版.md"} -->
> 四类脂蛋白总地图：来源、主要载荷与方向〔4类脂蛋白｜来源｜主要载荷｜运输方向〕

组成解释密度：蛋白比例HDL>LDL>VLDL>CM，TAG比例CM>VLDL>LDL>HDL，胆固醇比例LDL>HDL>VLDL>CM。油尤其TAG多则轻，蛋白多则密。这是颗粒组成比较，不能拿化验单血浆浓度作同一排序。完整百分比、粒径、电泳迁移细节可后置。

<!-- lr-kp {"kp_id": "biochem-m5-kp03", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/m-m1-m10/M5_血浆脂蛋白_学习阅读版_v1_最终执行版.md"} -->
> 密度、组成与电泳：油越多越轻，蛋白越多越密〔蛋白排序｜TAG排序｜胆固醇排序｜电泳3｜密度规律〕

## 外源和内源TAG，共用卸货工具但装货地点不同

膳食长链脂肪酸和一酰甘油进入小肠上皮，重合成TAG，与胆固醇、磷脂和apoB48装配为CM，经淋巴—胸导管入血；这调用D4的吸收接口。肠腔混合微胶粒帮助腔内运输，CM则在上皮、淋巴、血浆路径，二者不是同物。

卸TAG并没有让整颗CM消失：LPL处理后留下CM残粒，剩余胆固醇等货物随颗粒回肝，经以apoE为识别接口的受体摄取完成外源线收尾。LPL卸货是水解TAG，肝摄取是清除残余颗粒，两步不能合成一句“LPL把CM全降解”；CM残粒也不按VLDL→IDL→LDL那条内源线继续走。P027–P028及同周期导图物理P007只写到LPL处理，残粒段为本次查证的闭环补充：[apoE/LDLR缺失实验](https://pubmed.ncbi.nlm.nih.gov/8798405/)支持apoE依赖的LDLR及非LDLR清除路线，[受体拮抗实验](https://pubmed.ncbi.nlm.nih.gov/7515194/)支持LRP与LDLR参与肝摄取。这里不把小鼠实验的贡献比例移成人体固定百分数，也不把所有残粒清除硬写成只靠一种受体。

肝把自身合成的TAG装入VLDL。CM与VLDL都通过apoCⅡ激活LPL，水解颗粒TAG并交给组织；内源线逐步卸TAG后形成IDL，再形成以胆固醇运输为主的LDL。如果肝合成TAG增加且输出增加，可表现VLDL负荷高；如果输出功能不足，TAG留肝，形成脂肪肝接口。两个结果必须分别追生成量和输出能力，不能由“肝脂肪多”直接推出血VLDL必然高。

LPL处理血中富TAG颗粒；M7的HSL处理脂肪细胞内储库动员。名字同含脂肪酶不表示作用位置相同。

<!-- lr-kp {"kp_id": "biochem-m5-kp04", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/m-m1-m10/M5_血浆脂蛋白_学习阅读版_v1_最终执行版.md"} -->
> CM外源线：小肠把膳食长链脂质交给血液〔CM外源线：小肠装配｜关键apo｜入血路径｜LPL卸货｜主要载荷〕

<!-- lr-kp {"kp_id": "biochem-m5-kp05", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/m-m1-m10/M5_血浆脂蛋白_学习阅读版_v1_最终执行版.md"} -->
> VLDL—IDL—LDL内源线：肝先输出TAG，再留下胆固醇运输颗粒〔肝起点｜主货物｜LPL｜两次转化｜输出失败｜终点〕

<!-- lr-kp {"kp_id": "biochem-m5-kp09", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/m-m1-m10/M5_血浆脂蛋白_学习阅读版_v1_最终执行版.md"} -->
> LPL、LCAT、ACAT和白蛋白：四个名字分别处理哪一层〔LPL/LCAT/ACAT/白蛋白｜各在何处｜处理什么底物｜需要哪个辅因子/载体〕

## 胆固醇交付后，细胞会调低继续进货

当前Study约2/3 LDL由多种细胞LDL受体清除，以肝为主：apoB100被识别→受体介导入胞→溶酶体处理→游离胆固醇及氨基酸。胞内胆固醇可更新膜、经ACAT酯化储存，或在具相应能力的组织形成胆汁酸、激素和VitD接口。胞内胆固醇增加还反馈抑制HMG-CoA还原酶和LDL受体表达，分别减自身制造、减继续摄取；完整化学归M6。

另约1/3按当前Study走巨噬/内皮清道夫受体清除。LDL尤其ox-LDL增加可向血管壁带入脂质负荷，接到已经归循环所有的动脉粥样硬化病理。两类清除路径不能只记成“颗粒从血中消失所以同样有利”。比例保留为精确识别内容，不作为所有条件下固定的个体测量。

<!-- lr-kp {"kp_id": "biochem-m5-kp06", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/m-m1-m10/M5_血浆脂蛋白_学习阅读版_v1_最终执行版.md"} -->
> LDL交付与回收：受体通路和清道夫通路回答不同问题〔LDL：关键apo｜受体通路 vs 清道夫通路｜清除比例｜胞内胆固醇去向｜反馈〕

HDL则从肝外组织/血管壁接收胆固醇，apoAⅠ激活血浆LCAT酯化接口，再逆向运回肝处理/排出。它的任务不是笼统清除全部血脂；HDL下降在当前Study代表逆向回收不足的风险方向。

<!-- lr-kp {"kp_id": "biochem-m5-kp07", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/m-m1-m10/M5_血浆脂蛋白_学习阅读版_v1_最终执行版.md"} -->
> HDL逆向转运：不是向组织送货，而是把胆固醇带回肝〔来源｜运输起终点｜apo与酯化接口｜货物去向｜风险方向〕

把识别和酶激活同时写在运输主线上：B48标CM；B100、E可被LDL受体识别；AⅠ识别HDL受体并激活LCAT；CⅡ激活LPL。LCAT血浆酯化、ACAT胞内酯化，后者无需被移到血浆来解释；FFA由白蛋白带走。

<!-- lr-kp {"kp_id": "biochem-m5-kp08", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/m-m1-m10/M5_血浆脂蛋白_学习阅读版_v1_最终执行版.md"} -->
> 关键 apo：识别、酶激活与颗粒身份怎样一一对应〔apo B48/B100/E/AⅠ/CⅡ｜各代表身份/识别/酶激活哪一层｜总角色归类〕

现在看到TG高、LDL高、HDL低或肝内TAG堆积，应分别先定位外源CM/内源VLDL负荷、胆固醇交付负荷、逆向回收和肝输出故障。当前页的γ球蛋白来源为浆细胞，是肝外血浆蛋白合成识别点，与脂蛋白转换没有因果箭头。此模型只作物流定位，不能替代血脂临床分型、治疗目标或脂肪肝诊断。

<!-- lr-kp {"kp_id": "biochem-m5-kp10", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/m-m1-m10/M5_血浆脂蛋白_学习阅读版_v1_最终执行版.md"} -->
> 从异常结果反推运输故障层〔TG↑/LDL↑/HDL↓/脂肪肝｜分别先定位哪段运输故障｜特殊蛋白边界〕

## 当前来源与边界

主来源为27 BIO27-S05 P027–P030，S06仅补LCAT/ACAT；五道附题及学习闭合仍归既有Learning。P030上方把四颗粒依次连箭头的原插图保留，但其来源与方向必须与P027–P029分开核对，不据此推CM→HDL转换。颗粒空间关系需当前原图时保持Source边界；全部apo、交换、遗传病和完整降脂药理留后续。此教学稿不建立新关系owner或Memory卡。
