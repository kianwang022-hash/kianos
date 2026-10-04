> Historical authoring-stage record (R1/R2). Local no-push/no-owner-write statements describe that stage. Current draft scope, canonical proposals and acceptance limits are in the package README. Pixel/working-archive references are evidence locators, not files shipped by this draft.

# 完整Prompt与native LG的实际正文覆盖核查

本报告先核查当前固定教案底稿；本轮仅按父任务明确范围修补原正文并更新受影响项。初学按医学主线展开；LG分Chat仅定位同一底稿，复习回相同heading/anchor，不另拼模型。医学基线仍为bc014aeee3c7ca1be91a180a41336f03d14b3930。

核查对象是隐藏注释后的正文解释及准确支持表；标题/Prompt注释本身不计覆盖。每行保留完整Prompt要求，状态是对该要求的内容判断。已讲允许一项要求分布于同一Block多个实际heading；接口薄不要求重讲后置Primary。Source槽待定表示当前Core未独立支撑该槽，不宣称已审完所有PDF。

先前修补复用canonical/Source与native成员。本次追加范围仅为SR1-KP02、SR4-KP07、SR6-KP05、E6-KP05：实际读取原PDF五页像素及相关文字Source，并查原始实验；没有全PDF新审计、正式图像门禁验收、纯绑定测试重跑或学习状态变更。外部一手依据仅进入本地derived教案，未写正式owner。

## 已修项与继续保留的具体限制

| KP / native LG | 缺漏、修补结果或限制 | 现有可用依据 | 本轮处理或后续最小建议 |
|---|---|---|---|
| repro-sr1-kp02 / SR1-LG01 | 已补：原页的计数单位已澄清，给药比较有明确标注的原始实验补充。 | 生理原PDF P428已看像素；[Belchetz1978](https://pubmed.ncbi.nlm.nih.gov/100883/)原始摘要。 | 保留完整Prompt；既有未应用Prompt候选未改，不把实验间隔写成人体处方。 |
| repro-sr1-kp10 / SR1-LG03 | 已修：膜促激素、类固醇核受体与神经反射的层次判别已给，五步定位可执行。 | 本章KP10 Step3；SR2-KP04膜信号与SR4-KP01核受体。 | 已按父任务限定在原小节修补；准确位置见下方逐KP表。 |
| repro-sr2-kp11 / SR2-LG04 | 已修：前列腺增生/癌、隐睾治疗、男性不育/睾丸肿瘤的后置模型范围已准确点名。 | 本章KP11快速核对的后置行。 | 已按父任务限定在原小节修补；准确位置见下方逐KP表。 |
| repro-sr3-kp12 / SR3-LG04 | 已修：由P/体温结果反推阶段与黄体退化→E/P撤退的正向因果已分开。 | 本章KP12主链与详细展开从P下降反向定位的要求。 | 已按父任务限定在原小节修补；准确位置见下方逐KP表。 |
| repro-sr4-kp07 / SR4-LG02 | 已补第二个外周转化例子；原讲义未指定唯一二组织名单的限制仍明确。 | 生理原PDF P435已看像素；[Berkovitz1987](https://pubmed.ncbi.nlm.nih.gov/3504063/)人体细胞原始实验。 | 外部例子与原课程口径分层；不声称绝经后全身贡献相当。 |
| repro-sr6-kp05 / SR6-LG02 | 已补功能时程比较及原始人类实验的时间参照；不扩成统一激素浓度持续时长。 | 生理原PDF P395已看像素；Dawood1981、Johnston1986、McNeilly1983可读原始摘要。 | 保留原链与完整Prompt；旧候选未应用。McNeilly全文下载403，未用其未读全文持续数据。 |
| repro-sr6-kp08 / SR6-LG03 | 已修：正常腺泡/导管外围位置及原位/硬化保留、浸润腺体缺失方向已给。 | 本章KP08与E12-KP01/KP05。 | 已按父任务限定在原小节修补；准确位置见下方逐KP表。 |
| repro-sr6-kp09 / SR6-LG04 | 已修：波动/穿刺脓与局限液化脓腔的结构分界已给，完整处理继续归E11。 | 本章KP09明确后置诊疗；E11-KP06封闭液化脓腔。 | 已按父任务限定在原小节修补；准确位置见下方逐KP表。 |
| repro-sr6-kp10 / SR6-LG04 | 已修：滚动回顾已恢复女性卵巢/内膜/激素三轴与内泡膜—颗粒两细胞来源接力。 | 本章KP10、SR3-KP09与SR4-KP02/05已有正式支持。 | 已按父任务限定在原小节修补；准确位置见下方逐KP表。 |
| repro-path-e3-kp03 / E3-LG01 | 已修：周期出血之后的积血、周围组织损伤与组织反应三后果已明说。 | 本章KP03详细展开明确局部反复出血和组织损伤。 | 已按父任务限定在原小节修补；准确位置见下方逐KP表。 |
| repro-path-e5-kp01 / E5-LG01 | 已修：hCG升高已明确以正常妊娠为参照，未以单项激素完成身份判断。 | 本章KP01快速核对：hCG含量高于正常妊娠。 | 已按父任务限定在原小节修补；准确位置见下方逐KP表。 |
| repro-path-e6-kp05 / E6-LG02 | 已补源内有条件因果解释；原绒癌页未直接证明专属坏死机制的限制仍明确。 | 病理原PDF P100及肿瘤总论P177／书P175第11条均已看像素。 | 明标事实与推理边界，不从三无直接推出必然缺血，不宣称唯一原因。 |
| repro-path-e8-kp01 / E8-LG01 | 已修：卵母→生殖与卵泡相关→性索间质两条来源边均已明说。 | 本章KP01双支路；E7-KP01已有谱系。 | 已按父任务限定在原小节修补；准确位置见下方逐KP表。 |
| reproductive-e11-kp01 / E11-LG01 | 已修：PRL/分泌上皮、OT/肌上皮、导管通畅/有效吸吮的最小正常执行者已恢复。 | 本章KP01详细展开：PRL产乳、OT/肌上皮射乳、导管/有效吸吮排空。 | 已按父任务限定在原小节修补；准确位置见下方逐KP表。 |
| reproductive-e12-kp08 / E12-LG02 | 已修：现Core高级别两征恶性程度高与核分裂象多已并列，未增加坏死机制。 | 本章KP08快速核对。 | 已按父任务限定在原小节修补；准确位置见下方逐KP表。 |
| reproductive-e14-kp05 / E14-LG02 | 已修：乳房内侧的条件及额外胸骨旁淋巴结清扫对象已明确。 | 本章KP05与完整Prompt额外清扫哪组。 | 已按父任务限定在原小节修补；准确位置见下方逐KP表。 |
| reproductive-e14-kp07 / E14-LG02 | 已修：体积适当的主语已明确为乳房，其余现Study选择条件保留。 | 本章KP07当前Study乳房有适当体积。 | 已按父任务限定在原小节修补；准确位置见下方逐KP表。 |

## 逐Block、逐KP、逐LG短表

### SR1｜SR1

底稿：SR1隐藏注释正文（历史工作档案坐标：`sr1/teaching-without-annotations.md`；本稿未附该文件）。医学owner：`content/xizong/knowledge/systems/e-reproductive-breast/sr-sr1-sr6/生殖生理_SR1_生殖内分泌控制_学习阅读版_v1_最终执行版.md`。native范围来自本章现有只读证据及Source provenance；未改成员。

| KP ID | 完整Prompt要求 | 实际heading／支持位置 | 状态／真实覆盖或缺口 |
|---|---|---|---|
| repro-sr1-kp01 | 4层｜GnRH→2促｜性腺2产出｜反馈3类｜最终5场景 | 把控制者、中继者和执行细胞分开（历史工作档案坐标：`sr1/teaching-without-annotations.md#layers`；本稿未附该文件）<br>反馈要同时写出信号、方向和阶段（历史工作档案坐标：`sr1/teaching-without-annotations.md#feedback`；本稿未附该文件）<br>乳腺揭示另外两种控制模式（历史工作档案坐标：`sr1/teaching-without-annotations.md#modes`；本稿未附该文件） | 已讲：四层、GnRH中继、性腺产出、三反馈及最终场景均有分布支持。 |
| repro-sr1-kp02 | 青春前低2｜青春后脉冲1｜FSH/LH变化差｜连续vs脉冲？ | 把控制者、中继者和执行细胞分开（历史工作档案坐标：`sr1/teaching-without-annotations.md#layers`；本稿未附该文件） | 已补：原页计数单位与原始给药实验已分层解释；正式Core和Prompt未改。 |
| repro-sr1-kp03 | 男2靶｜女2靶｜FSH共性1｜LH共性1｜产物分别？ | 把控制者、中继者和执行细胞分开（历史工作档案坐标：`sr1/teaching-without-annotations.md#layers`；本稿未附该文件） | 已讲：男女四靶、FSH支持/加工与LH类固醇方向已讲；具体产物按SR2/SR4展开。 |
| repro-sr1-kp04 | 长反馈谁→谁｜睾酮直1间2｜E/P常态方向｜反馈目的1 | 反馈要同时写出信号、方向和阶段（历史工作档案坐标：`sr1/teaching-without-annotations.md#feedback`；本稿未附该文件） | 已讲：长反馈方向、睾酮直接LH/间接GnRH与FSH、E/P常态及稳态目的已讲。 |
| repro-sr1-kp05 | 来源男女2｜靶1｜不管2｜与性激素反馈何别 | 反馈要同时写出信号、方向和阶段（历史工作档案坐标：`sr1/teaching-without-annotations.md#feedback`；本稿未附该文件） | 已讲：男女抑制素来源、FSH选择性及不明显影响LH/GnRH已讲。 |
| repro-sr1-kp06 | 条件1｜中枢中介1｜GnRH方向｜FSH/LH谁更峰｜结果1 | 反馈要同时写出信号、方向和阶段（历史工作档案坐标：`sr1/teaching-without-annotations.md#feedback`；本稿未附该文件） | 已讲：成熟高E条件、kisspeptin/GnRH、FSH/LH峰和排卵因果已讲。 |
| repro-sr1-kp07 | 来源1｜无靶腺身份｜上游双调节2｜靶细胞1｜结果1 | 乳腺揭示另外两种控制模式（历史工作档案坐标：`sr1/teaching-without-annotations.md#modes`；本稿未附该文件） | 已讲：PRL来源、双控制、无靶腺身份、腺泡靶点与产乳已讲。 |
| repro-sr1-kp08 | 合成核团偏1｜储放部位1｜靶2｜反射2｜不是谁分泌？ | 乳腺揭示另外两种控制模式（历史工作档案坐标：`sr1/teaching-without-annotations.md#modes`；本稿未附该文件） | 已讲：合成者/储放者分离，乳腺与子宫靶点、机械输入和两反射已讲。 |
| repro-sr1-kp09 | 3模式｜各举1链｜反馈/反射差｜末端是否再分泌激素 | 乳腺揭示另外两种控制模式（历史工作档案坐标：`sr1/teaching-without-annotations.md#modes`；本稿未附该文件） | 已讲：三个模式均给链与末端效应/反馈区别。 |
| repro-sr1-kp10 | 来源层｜靶细胞｜受体层｜反馈/反射｜阶段/结果 | 把控制者、中继者和执行细胞分开（历史工作档案坐标：`sr1/teaching-without-annotations.md#layers`；本稿未附该文件）<br>反馈要同时写出信号、方向和阶段（历史工作档案坐标：`sr1/teaching-without-annotations.md#feedback`；本稿未附该文件）<br>乳腺揭示另外两种控制模式（历史工作档案坐标：`sr1/teaching-without-annotations.md#modes`；本稿未附该文件） | 已修：膜促激素、类固醇核受体与神经反射的层次判别已给，五步定位可执行。 |

| native LG | native成员（原样KP IDs） | 必要定义／先修衔接与选择条件 | 该组闭环判断 |
|---|---|---|---|
| SR1-LG01 | repro-sr1-kp01, repro-sr1-kp02 | 控制层/青春期；由GnRH到垂体中继 | 主线可恢复；KP02两槽已解释，外部实验保持derived候选。 |
| SR1-LG02 | repro-sr1-kp03, repro-sr1-kp04, repro-sr1-kp05, repro-sr1-kp06 | 前一层靶点+性腺回报；条件决定反馈方向 | 目标细胞—负/选择/正反馈闭环明确 |
| SR1-LG03 | repro-sr1-kp07, repro-sr1-kp08, repro-sr1-kp09, repro-sr1-kp10 | 腺体轴背景→直接组织效应/反射 | 三模式及膜/核受体和反射层次判别已闭合。 |

**Block闭环**：KP02两原槽已有可定位正文解释；外部实验补充与原讲义分层，不把局部候选判断当成正式医学接纳或学习者完成。

### SR2｜SR2

底稿：SR2隐藏注释正文（历史工作档案坐标：`sr2/teaching-without-annotations.md`；本稿未附该文件）。医学owner：`content/xizong/knowledge/systems/e-reproductive-breast/sr-sr1-sr6/生殖生理_SR2_男性生殖_学习阅读版_v1_最终执行版.md`。native范围来自本章现有只读证据及Source provenance；未改成员。

| KP ID | 完整Prompt要求 | 实际heading／支持位置 | 状态／真实覆盖或缺口 |
|---|---|---|---|
| repro-sr2-kp01 | 2空间｜3细胞｜各1主职｜谁分泌雄激素 | 两空间、三细胞和受保护的生精现场（历史工作档案坐标：`sr2/teaching-without-annotations.md#factory`；本稿未附该文件） | 已讲：两空间三细胞及各主职、雄激素来源明确。 |
| repro-sr2-kp02 | 基础3｜分泌6｜ABP干什么｜抑制素管谁｜2酶 | 两空间、三细胞和受保护的生精现场（历史工作档案坐标：`sr2/teaching-without-annotations.md#factory`；本稿未附该文件） | 已讲：支持保护营养、屏障/吞噬以及六类分泌加工均有用途说明。 |
| repro-sr2-kp03 | 谁形成｜隔离哪2侧｜微环境1｜免疫目的1 | 两空间、三细胞和受保护的生精现场（历史工作档案坐标：`sr2/teaching-without-annotations.md#factory`；本稿未附该文件） | 已讲：形成细胞、免疫隔离、微环境与免疫防线均有因果。 |
| repro-sr2-kp04 | FSH找谁/做2件｜LH找谁/产1物｜启动vs维持｜共同信号链 | FSH与LH是相互协作的供应链（历史工作档案坐标：`sr2/teaching-without-annotations.md#supply`；本稿未附该文件） | 已讲：FSH两项生精支持、LH/T维持及共同AC-cAMP-PKA链已讲。 |
| repro-sr2-kp05 | LH→1细胞｜前体1｜局部1｜全身6类｜反馈2层 | FSH与LH是相互协作的供应链（历史工作档案坐标：`sr2/teaching-without-annotations.md#supply`；本稿未附该文件）<br>全身作用与精子离开睾丸后的三个阶段（历史工作档案坐标：`sr2/teaching-without-annotations.md#body`；本稿未附该文件） | 已讲：前体、局部生精/全身六类和反馈分布在两节，均能定位。 |
| repro-sr2-kp06 | ABP绑谁/送哪｜抑制素来源｜只抑1｜不抑2 | FSH与LH是相互协作的供应链（历史工作档案坐标：`sr2/teaching-without-annotations.md#supply`；本稿未附该文件） | 已讲：ABP的局部浓度/运输与抑制素远端选择反馈有直接比较。 |
| repro-sr2-kp07 | 脂2方向｜蛋白1｜骨2｜水盐1｜红系2机制｜血糖边界 | 全身作用与精子离开睾丸后的三个阶段（历史工作档案坐标：`sr2/teaching-without-annotations.md#body`；本稿未附该文件） | 已讲：脂蛋白、蛋白、骨、水盐、红系双机制及血糖边界完整。 |
| repro-sr2-kp08 | 睾酮直抑1间抑2｜抑制素只1｜灭活器官1｜肝硬化终末2方向 | FSH与LH是相互协作的供应链（历史工作档案坐标：`sr2/teaching-without-annotations.md#supply`；本稿未附该文件） | 已讲：反馈、肝灭活、肝硬化E/T两方向及表现均有链。 |
| repro-sr2-kp09 | T→DHT酶1｜T→E酶1｜最强雄激素｜前列腺接口｜生精为何需少量E | FSH与LH是相互协作的供应链（历史工作档案坐标：`sr2/teaching-without-annotations.md#supply`；本稿未附该文件） | 已讲：两酶、DHT最强/前列腺接口、少量E生精均明确。 |
| repro-sr2-kp10 | 成熟在哪｜获能在哪｜顶体做什么｜受精位置1｜顺序4 | 全身作用与精子离开睾丸后的三个阶段（历史工作档案坐标：`sr2/teaching-without-annotations.md#body`；本稿未附该文件） | 已讲：成熟、获能、顶体作用与受精地点的顺序明确。 |
| repro-sr2-kp11 | 前列腺2接口｜肝硬化1链｜骨/红系2｜隐睾1底座｜后置3模型 | FSH与LH是相互协作的供应链（历史工作档案坐标：`sr2/teaching-without-annotations.md#supply`；本稿未附该文件）<br>全身作用与精子离开睾丸后的三个阶段（历史工作档案坐标：`sr2/teaching-without-annotations.md#body`；本稿未附该文件） | 已修：前列腺增生/癌、隐睾治疗、男性不育/睾丸肿瘤的后置模型范围已准确点名。 |

| native LG | native成员（原样KP IDs） | 必要定义／先修衔接与选择条件 | 该组闭环判断 |
|---|---|---|---|
| SR2-LG01 | repro-sr2-kp01, repro-sr2-kp02, repro-sr2-kp03 | 控制轴后先放曲细精管/间质及三细胞 | 空间/细胞定义闭合；原图门禁继承VERIFIED_SOURCE_VISUAL_AVAILABLE_2026_09_24，当前不声称像素识别已完成 |
| SR2-LG02 | repro-sr2-kp04, repro-sr2-kp05, repro-sr2-kp06 | SR1靶细胞→局部睾酮与支持输出 | FSH/LH与ABP/抑制素两链闭合 |
| SR2-LG03 | repro-sr2-kp07, repro-sr2-kp08, repro-sr2-kp09 | 生产后区分转化/灭活/全身/反馈 | 不混T/DHT/E，作用与反馈闭合 |
| SR2-LG04 | repro-sr2-kp10, repro-sr2-kp11 | SR2生精现场→离睾后的阶段 | 配子顺序与三组后置模型的具体归属已闭合。 |

**Block闭环**：本轮指定的正文与接口缺漏已在同一底稿闭合，中心问题仍沿真实机制、条件与比较回收；这只是文字教学支撑判断，图像状态和学习者证据继续按原owner记录。

### SR3｜SR3

底稿：SR3隐藏注释正文（历史工作档案坐标：`sr3/teaching-without-annotations.md`；本稿未附该文件）。医学owner：`content/xizong/knowledge/systems/e-reproductive-breast/sr-sr1-sr6/生殖生理_SR3_女性激素与月经周期_学习阅读版_v1_最终执行版.md`。native范围来自本章现有只读证据及Source provenance；未改成员。

| KP ID | 完整Prompt要求 | 实际heading／支持位置 | 状态／真实覆盖或缺口 |
|---|---|---|---|
| repro-sr3-kp01 | E偏2词｜P偏3词｜共同2组织｜反馈常态/例外｜都能内膜变厚为何不同 | 激素把结构切换为不同任务（历史工作档案坐标：`sr3/teaching-without-annotations.md#targets`；本稿未附该文件）<br>从黄体撤退进入下一轮竞争（历史工作档案坐标：`sr3/teaching-without-annotations.md#cycle`；本稿未附该文件） | 已讲：E/P总角色、共同内膜/乳腺、常态/高E例外及内膜厚的不同动作分布已讲。 |
| repro-sr3-kp02 | 内膜E1/P2动作｜平滑肌E2/P2方向｜OT敏感性谁升谁降 | 激素把结构切换为不同任务（历史工作档案坐标：`sr3/teaching-without-annotations.md#targets`；本稿未附该文件） | 已讲：内膜E增生/P分泌蜕膜化、平滑肌/OT敏感性对照完整。 |
| repro-sr3-kp03 | 宫颈量稀/少黏｜输卵管E2/P2｜阴道E2/P1｜受精通道谁开放 | 激素把结构切换为不同任务（历史工作档案坐标：`sr3/teaching-without-annotations.md#targets`；本稿未附该文件） | 已讲：三器官各方向和宫颈开放条件已讲，未把宫颈与输卵管黏液混同。 |
| repro-sr3-kp04 | 乳房E管/P泡｜体温谁升｜水钠E保/P排｜脂蛋白E2方向｜免疫P1 | 激素把结构切换为不同任务（历史工作档案坐标：`sr3/teaching-without-annotations.md#targets`；本稿未附该文件） | 已讲：乳房、P升温、水钠、E脂蛋白与P免疫接口明确。 |
| repro-sr3-kp05 | 未受精→3步｜撤退后2结果｜月经血不凝1因｜下一轮谁先升 | 从黄体撤退进入下一轮竞争（历史工作档案坐标：`sr3/teaching-without-annotations.md#cycle`；本稿未附该文件） | 已讲：未受精撤退、月经/FSH两结果和月经不凝有机制。 |
| repro-sr3-kp06 | 撤退→FSH｜一群→一个3理由｜E/抑制素作用｜FSH阈值谁最低 | 从黄体撤退进入下一轮竞争（历史工作档案坐标：`sr3/teaching-without-annotations.md#cycle`；本稿未附该文件） | 已讲：募集—负反馈竞争、三优势与最低FSH阈值明确。 |
| repro-sr3-kp07 | 成熟卵泡→E第几峰｜中介1｜GnRH方向｜FSH/LH谁更高｜排卵触发1 | 从黄体撤退进入下一轮竞争（历史工作档案坐标：`sr3/teaching-without-annotations.md#cycle`；本稿未附该文件） | 已讲：第一E峰、中介、GnRH、FSH/LH差与排卵触发明确。 |
| repro-sr3-kp08 | 卵泡残余→谁｜LH作用｜E几峰/P几峰｜谁更高｜内膜/体温2结果 | 从黄体撤退进入下一轮竞争（历史工作档案坐标：`sr3/teaching-without-annotations.md#cycle`；本稿未附该文件）<br>激素把结构切换为不同任务（历史工作档案坐标：`sr3/teaching-without-annotations.md#targets`；本稿未附该文件）<br>用反事实把原因、结果与器官分开（历史工作档案坐标：`sr3/teaching-without-annotations.md#separation`；本稿未附该文件） | 已讲：黄体形成/LH成熟、E第二峰/P主峰、内膜和温度分布已讲。 |
| repro-sr3-kp09 | 1–14三件｜第14天3峰/1事件｜15–28三件｜E两峰/P一峰 | 从黄体撤退进入下一轮竞争（历史工作档案坐标：`sr3/teaching-without-annotations.md#cycle`；本稿未附该文件） | 已讲：三轴各期和三峰的关系有文字对齐；图像首次同步识别仍保留原门禁。 |
| repro-sr3-kp10 | 排卵时体温｜排后谁升温｜3个代表排卵｜LH升高vsLH峰 | 用反事实把原因、结果与器官分开（历史工作档案坐标：`sr3/teaching-without-annotations.md#separation`；本稿未附该文件）<br>激素把结构切换为不同任务（历史工作档案坐标：`sr3/teaching-without-annotations.md#targets`；本稿未附该文件） | 已讲：最低温、P升温、双相/P/LH三线索及LH升高不等于峰有比较。 |
| repro-sr3-kp11 | 结扎输卵管2有无｜切子宫2有无｜切卵巢2有无｜排卵看谁/月经看谁 | 用反事实把原因、结果与器官分开（历史工作档案坐标：`sr3/teaching-without-annotations.md#separation`；本稿未附该文件） | 已讲：三种器官操作的有无结果与器官职责有反事实。 |
| repro-sr3-kp12 | 撤退｜FSH募集｜优势选择｜E正反馈｜LH峰｜黄体P｜终点分流 | 从黄体撤退进入下一轮竞争（历史工作档案坐标：`sr3/teaching-without-annotations.md#cycle`；本稿未附该文件）<br>用反事实把原因、结果与器官分开（历史工作档案坐标：`sr3/teaching-without-annotations.md#separation`；本稿未附该文件） | 已修：由P/体温结果反推阶段与黄体退化→E/P撤退的正向因果已分开。 |

| native LG | native成员（原样KP IDs） | 必要定义／先修衔接与选择条件 | 该组闭环判断 |
|---|---|---|---|
| SR3-LG01 | repro-sr3-kp01, repro-sr3-kp02, repro-sr3-kp03, repro-sr3-kp04 | SR1性激素靶组织；逐器官读E/P方向 | 各组织对照齐，P黏液部位不混 |
| SR3-LG02 | repro-sr3-kp05, repro-sr3-kp06 | 旧黄体撤退→内膜执行+下一卵泡募集 | 周期起点和优势竞争闭合 |
| SR3-LG03 | repro-sr3-kp07, repro-sr3-kp08, repro-sr3-kp09, repro-sr3-kp10 | 募集/高E条件→LH峰→黄体P/三轴 | 时间/因果与结果标志能分开；原图门禁继承VERIFIED_SOURCE_VISUAL_AVAILABLE_2026_09_24，当前不声称像素识别已完成 |
| SR3-LG04 | repro-sr3-kp11, repro-sr3-kp12 | 器官职责和已有时间链→反事实 | 器官反事实闭合；逆向阶段定位与正向周期因果已分开。 |

**Block闭环**：本轮指定的正文与接口缺漏已在同一底稿闭合，中心问题仍沿真实机制、条件与比较回收；这只是文字教学支撑判断，图像状态和学习者证据继续按原owner记录。

### SR4｜SR4

底稿：SR4隐藏注释正文（历史工作档案坐标：`sr4/teaching-without-annotations.md`；本稿未附该文件）。医学owner：`content/xizong/knowledge/systems/e-reproductive-breast/sr-sr1-sr6/生殖生理_SR4_性激素合成与生命阶段来源_学习阅读版_v1_最终执行版.md`。native范围来自本章现有只读证据及Source provenance；未改成员。

| KP ID | 完整Prompt要求 | 实际heading／支持位置 | 状态／真实覆盖或缺口 |
|---|---|---|---|
| repro-sr4-kp01 | 共同前体1｜中间2类｜终末3类｜芳香化方向｜不补哪些步骤 | 合成骨架与两细胞接力（历史工作档案坐标：`sr4/teaching-without-annotations.md#assembly`；本稿未附该文件） | 已讲：胆固醇、P/雄激素/E三类方向、芳香化与不补酶网络界线明确。 |
| repro-sr4-kp02 | LH找内｜FSH找颗｜内造到哪｜颗转成谁｜口诀2但讲机制 | 合成骨架与两细胞接力（历史工作档案坐标：`sr4/teaching-without-annotations.md#assembly`；本稿未附该文件） | 已讲：两细胞/两促激素的供料—加工机制已讲，口诀不必再次复制。 |
| repro-sr4-kp03 | 隔1层｜血供差异｜不能从哪起步｜依赖哪前体｜排卵后如何改变 | 合成骨架与两细胞接力（历史工作档案坐标：`sr4/teaching-without-annotations.md#assembly`；本稿未附该文件）<br>排卵改变血供，生命阶段改变来源（历史工作档案坐标：`sr4/teaching-without-annotations.md#change`；本稿未附该文件） | 已讲：基底膜/血供/LDL取料差异与排卵后改变分布已讲。 |
| repro-sr4-kp04 | LH男/女2细胞｜FSH男/女2细胞｜共同产出轴｜差异任务 | 合成骨架与两细胞接力（历史工作档案坐标：`sr4/teaching-without-annotations.md#assembly`；本稿未附该文件） | 已讲：男女LH/FSH靶点及共性与任务差异直接比较。 |
| repro-sr4-kp05 | 排卵破哪层｜血管做什么｜颗粒细胞新能力｜黄体主激素｜E仍有无 | 排卵改变血供，生命阶段改变来源（历史工作档案坐标：`sr4/teaching-without-annotations.md#change`；本稿未附该文件） | 已讲：基膜破裂、血管进入、新取料能力和P主/E仍有完整。 |
| repro-sr4-kp06 | 育龄卵泡2细胞｜黄体1主2产｜妊娠早/后2来源｜绝经后2组织1酶 | 排卵改变血供，生命阶段改变来源（历史工作档案坐标：`sr4/teaching-without-annotations.md#change`；本稿未附该文件） | 已讲：育龄、黄体、早后孕、绝经后来源切换明确。 |
| repro-sr4-kp07 | 前体来自哪带｜转化组织2｜关键酶1｜主要E来源阶段｜肥胖串联 | 排卵改变血供，生命阶段改变来源（历史工作档案坐标：`sr4/teaching-without-annotations.md#change`；本稿未附该文件） | 已补：第二外周组织例子有明确一手证据；原讲义唯一二组织名单未指定，保留这一课程权威限制。 |
| repro-sr4-kp08 | 绝经前靶谁/药1｜绝经后靶酶/药2｜为何阶段不同｜完整模型去哪 | 排卵改变血供，生命阶段改变来源（历史工作档案坐标：`sr4/teaching-without-annotations.md#change`；本稿未附该文件）<br>把治疗接口挂回激素来源（历史工作档案坐标：`sr4/teaching-without-annotations.md#target`；本稿未附该文件） | 已讲：受体与酶靶点、绝经前后药名及完整模型归属明确。 |

| native LG | native成员（原样KP IDs） | 必要定义／先修衔接与选择条件 | 该组闭环判断 |
|---|---|---|---|
| SR4-LG01 | repro-sr4-kp01, repro-sr4-kp02, repro-sr4-kp03, repro-sr4-kp04 | SR1靶点+胆固醇→空间取料与酶加工 | 两细胞接力闭合；原图门禁继承VERIFIED_SOURCE_VISUAL_AVAILABLE_2026_09_24，当前不声称像素识别已完成 |
| SR4-LG02 | repro-sr4-kp05, repro-sr4-kp06, repro-sr4-kp07, repro-sr4-kp08 | 排卵血供改变→黄体/胎盘/绝经外周来源 | 生命阶段/靶点与第二外周例子已解释；KP07唯一课程名单仍不能由原页裁定。 |

**Block闭环**：第二例子已查实并进入同一底稿；外部实验例子不冒充原讲义指定名单。若要求唯一课程答案，仍须原Source/Content owner明确口径。

### SR5｜SR5

底稿：SR5隐藏注释正文（历史工作档案坐标：`sr5/teaching-without-annotations.md`；本稿未附该文件）。医学owner：`content/xizong/knowledge/systems/e-reproductive-breast/sr-sr1-sr6/生殖生理_SR5_受精妊娠黄体胎盘与分娩_学习阅读版_v1_最终执行版.md`。native范围来自本章现有只读证据及Source provenance；未改成员。

| KP ID | 完整Prompt要求 | 实际heading／支持位置 | 状态／真实覆盖或缺口 |
|---|---|---|---|
| repro-sr5-kp01 | 成熟哪｜获能哪｜顶体作用2结构｜受精位置1｜本块只Recall什么 | 受精让周期终点改道（历史工作档案坐标：`sr5/teaching-without-annotations.md#rescue`；本稿未附该文件） | 已讲：受精入口、两结构、四阶段与本章调用SR2内容明确。 |
| repro-sr5-kp02 | 未受精4步｜受精3步｜共同节点1｜停经直接因果链 | 受精让周期终点改道（历史工作档案坐标：`sr5/teaching-without-annotations.md#rescue`；本稿未附该文件） | 已讲：未受精撤退与受精hCG救援同一黄体分叉和停经链明确。 |
| repro-sr5-kp03 | 来源1｜相似谁｜靶1｜峰时1｜检测2体液｜结果2 | 受精让周期终点改道（历史工作档案坐标：`sr5/teaching-without-annotations.md#rescue`；本稿未附该文件） | 已讲：hCG来源/LH相似/黄体靶点/时间/两体液/维持结果齐全。 |
| repro-sr5-kp04 | 原本结局1｜hCG动作2｜继续分泌2激素｜停经为何｜寿命约多久 | 受精让周期终点改道（历史工作档案坐标：`sr5/teaching-without-annotations.md#rescue`；本稿未附该文件） | 已讲：同结构改命运、两激素不撤退、停经及约十周寿命有机制。 |
| repro-sr5-kp05 | 早期来源1｜约10周后来源1｜hCG峰8–10｜黄体寿命10｜接力目的 | 受精让周期终点改道（历史工作档案坐标：`sr5/teaching-without-annotations.md#rescue`；本稿未附该文件） | 已讲：8–10周与约十周接班/寿命区分清楚。 |
| repro-sr5-kp06 | hCG维持谁｜hPL名实差｜E3谁合作｜P主功能｜各1易混 | 胎盘激素的名称和实际职责（历史工作档案坐标：`sr5/teaching-without-annotations.md#placenta`；本稿未附该文件）<br>维持静息与收缩执行要分层（历史工作档案坐标：`sr5/teaching-without-annotations.md#labor`；本稿未附该文件） | 已讲：四激素职责、名称陷阱及E3合作分布明确。 |
| repro-sr5-kp07 | 主要胎盘E哪种｜前体2来源｜胎儿肝1步｜胎盘1步｜检测判断什么 | 胎盘激素的名称和实际职责（历史工作档案坐标：`sr5/teaching-without-annotations.md#placenta`；本稿未附该文件） | 已讲：E3前体两来源、胎儿肝/胎盘加工、尿E3功能接口明确。 |
| repro-sr5-kp08 | P对子宫2方向｜维持妊娠1｜Study启动因素1｜OT角色边界｜E晚孕1 | 维持静息与收缩执行要分层（历史工作档案坐标：`sr5/teaching-without-annotations.md#labor`；本稿未附该文件） | 已讲：P对子宫双方向、Source启动因素/OT执行与晚孕E均有条件。 |
| repro-sr5-kp09 | CCK≈谁｜促胰液素≈谁｜GH≈谁｜LH≈谁｜ACTH≈谁 | 胎盘激素的名称和实际职责（历史工作档案坐标：`sr5/teaching-without-annotations.md#placenta`；本稿未附该文件） | 已讲：五组相似配对完整，明确只LH-hCG进入主链，其余识别支持。 |
| repro-sr5-kp10 | 获能/受精｜hCG｜妊娠黄体｜8–10/10周｜胎盘4激素｜P撤退 | 受精让周期终点改道（历史工作档案坐标：`sr5/teaching-without-annotations.md#rescue`；本稿未附该文件）<br>胎盘激素的名称和实际职责（历史工作档案坐标：`sr5/teaching-without-annotations.md#placenta`；本稿未附该文件）<br>维持静息与收缩执行要分层（历史工作档案坐标：`sr5/teaching-without-annotations.md#labor`；本稿未附该文件） | 已讲：整条受精—救援—接班—四激素—撤退分布可恢复。 |

| native LG | native成员（原样KP IDs） | 必要定义／先修衔接与选择条件 | 该组闭环判断 |
|---|---|---|---|
| SR5-LG01 | repro-sr5-kp01, repro-sr5-kp02 | SR2配子阶段+SR3周期终点 | 受精改变黄体命运的分叉明确 |
| SR5-LG02 | repro-sr5-kp03, repro-sr5-kp04, repro-sr5-kp05 | LH样信号→黄体保留→胎盘成熟接班 | 时间接力闭合 |
| SR5-LG03 | repro-sr5-kp06, repro-sr5-kp07 | 正常胎盘来源→四职责/E3协作 | 名称与效应分开，四激素闭合 |
| SR5-LG04 | repro-sr5-kp08, repro-sr5-kp09, repro-sr5-kp10 | 救援/供应后读子宫静息与晚孕执行 | Source分娩边界清楚；全链同底稿可恢复 |

**Block闭环**：中心问题仍沿当前正文的真实机制/条件/比较回收；本轮未发现完整Prompt的新增文字缺漏；结论仅限文字与准确支持，原图门禁/Source待核不因此关闭。

### SR6｜SR6

底稿：SR6隐藏注释正文（历史工作档案坐标：`sr6/teaching-without-annotations.md`；本稿未附该文件）。医学owner：`content/xizong/knowledge/systems/e-reproductive-breast/sr-sr1-sr6/生殖生理_SR6_泌乳射乳与正常乳腺_学习阅读版_v1_最终执行版.md`。native范围来自本章现有只读证据及Source provenance；未改成员。

| KP ID | 完整Prompt要求 | 实际heading／支持位置 | 状态／真实覆盖或缺口 |
|---|---|---|---|
| repro-sr6-kp01 | 3结构｜各1功能｜谁分泌｜谁收缩｜乳汁走向 | 先认识生产单元、动力层和运输通道（历史工作档案坐标：`sr6/teaching-without-annotations.md#structure`；本稿未附该文件） | 已讲：三结构职责与乳汁走向清楚，正常位置服务后续病理。 |
| repro-sr6-kp02 | E发育1｜P发育1｜共同结果｜阶段调用｜不是谁产乳 | 先认识生产单元、动力层和运输通道（历史工作档案坐标：`sr6/teaching-without-annotations.md#structure`；本稿未附该文件） | 已讲：E/P发育对象、共同结构准备及不等于乳汁功能明确。 |
| repro-sr6-kp03 | 来源1｜控制因子2｜身份1｜靶细胞1｜结果1｜吸吮如何加 | 同一吸吮输入，两个不同输出（历史工作档案坐标：`sr6/teaching-without-annotations.md#reflex`；本稿未附该文件） | 已讲：PRL来源/双控制/身份/靶点及吸吮协调链明确。 |
| repro-sr6-kp04 | 合成1部位｜储放1部位｜刺激1｜靶1细胞｜结果1｜另1反射 | 同一吸吮输入，两个不同输出（历史工作档案坐标：`sr6/teaching-without-annotations.md#reflex`；本稿未附该文件） | 已讲：OT合成/储放/机械刺激/肌上皮射乳和子宫收缩接口明确。 |
| repro-sr6-kp05 | 刺激1｜OT链4步｜PRL链3步｜同步结果2｜谁快谁持续 | 同一吸吮输入，两个不同输出（历史工作档案坐标：`sr6/teaching-without-annotations.md#reflex`；本稿未附该文件） | 已补：功能时程和原始人类实验时间参照已解释；不推统一浓度持续时长，原Study链保留。 |
| repro-sr6-kp06 | 生产看谁｜射出看谁｜通畅看哪｜有乳无排提示｜排乳少的3位置 | 从排乳不足定位三个可能失败位置（历史工作档案坐标：`sr6/teaching-without-annotations.md#failure`；本稿未附该文件） | 已讲：三失败位置、已有乳汁难排的分流明确。 |
| repro-sr6-kp07 | hPL来源/主效应｜PRL来源/主效应｜OT来源/主效应｜谁几乎不催乳 | 同一吸吮输入，两个不同输出（历史工作档案坐标：`sr6/teaching-without-annotations.md#reflex`；本稿未附该文件） | 已讲：三激素来源/主效应及hPL名实边界明确。 |
| repro-sr6-kp08 | 正常功能1｜受体激素1｜围绕哪2结构｜病理存在/缺失提示｜完整癌模后置 | 先认识生产单元、动力层和运输通道（历史工作档案坐标：`sr6/teaching-without-annotations.md#structure`；本稿未附该文件）<br>同一吸吮输入，两个不同输出（历史工作档案坐标：`sr6/teaching-without-annotations.md#reflex`；本稿未附该文件） | 已修：正常腺泡/导管外围位置及原位/硬化保留、浸润腺体缺失方向已给。 |
| repro-sr6-kp09 | 排空不足｜淤积｜细菌入口｜炎症→脓肿分界｜完整源控制去哪 | 从排乳不足定位三个可能失败位置（历史工作档案坐标：`sr6/teaching-without-annotations.md#failure`；本稿未附该文件） | 已修：波动/穿刺脓与局限液化脓腔的结构分界已给，完整处理继续归E11。 |
| repro-sr6-kp10 | GnRH轴｜男3细胞｜女3时间轴｜2细胞来源｜hCG接力｜PRL/OT双链 | 从排乳不足定位三个可能失败位置（历史工作档案坐标：`sr6/teaching-without-annotations.md#failure`；本稿未附该文件） | 已修：滚动回顾已恢复女性卵巢/内膜/激素三轴与内泡膜—颗粒两细胞来源接力。 |

| native LG | native成员（原样KP IDs） | 必要定义／先修衔接与选择条件 | 该组闭环判断 |
|---|---|---|---|
| SR6-LG01 | repro-sr6-kp01, repro-sr6-kp02 | SR3 E/P发育→正常腺泡/导管/肌上皮 | 结构—职责闭合；原图门禁继承VERIFIED_SOURCE_VISUAL_AVAILABLE_2026_09_24，当前不声称像素识别已完成 |
| SR6-LG02 | repro-sr6-kp03, repro-sr6-kp04, repro-sr6-kp05 | 乳腺单位→同吸吮输入的PRL/OT链 | 双输出与功能时程已解释；原始实验时间参照有条件，未取得全文的数据不用。 |
| SR6-LG03 | repro-sr6-kp06, repro-sr6-kp07, repro-sr6-kp08 | 双链→三失败位置与后续病理接口 | 三功能失败分流及肌上皮正常位置、病理保留/缺失方向已给。 |
| SR6-LG04 | repro-sr6-kp09, repro-sr6-kp10 | 持续产乳/排空→疾病；回顾SR1–5 | 脓腔结构分界、女性三时间轴与两细胞来源的最小回接已闭合。 |

**Block闭环**：KP05按即时排乳与后续持续生产的功能时程回收；外部实验提供具体条件下的时间参照，不推所有人的统一浓度持续时长，未把局部解释当成正式医学接纳。

### E1｜E1

底稿：E1隐藏注释正文（历史工作档案坐标：`e1/teaching-without-annotations.md`；本稿未附该文件）。医学owner：`content/xizong/knowledge/systems/e-reproductive-breast/e-e1-e14/生殖病理_E1_宫颈异位鳞化与慢性炎_学习阅读版_v1_最终执行版.md`。native范围来自本章现有只读证据及Source provenance；未改成员。

| KP ID | 完整Prompt要求 | 实际heading／支持位置 | 状态／真实覆盖或缺口 |
|---|---|---|---|
| repro-path-e1-kp01 | 2区2上皮｜管内/阴道部｜后续交界为什么重要 | 先异位，再化生；红色不等于上皮缺损（历史工作档案坐标：`e1/teaching-without-annotations.md#surface`；本稿未附该文件） | 已讲：两区两上皮、交界空间及后续用途明确。 |
| repro-path-e1-kp02 | E→谁增生下移｜本质1词｜为何红2点｜有没有缺损 | 先异位，再化生；红色不等于上皮缺损（历史工作档案坐标：`e1/teaching-without-annotations.md#surface`；本稿未附该文件） | 已讲：E促柱状下移/位置异位、薄层透血/乳头状红及无缺损明确。 |
| repro-path-e1-kp03 | 先？后？｜酸性环境做什么｜新交界怎么来｜异位/化生差1轴 | 先异位，再化生；红色不等于上皮缺损（历史工作档案坐标：`e1/teaching-without-annotations.md#surface`；本稿未附该文件） | 已讲：异位先/酸性环境鳞化后/新交界及位置类型轴明确。 |
| repro-path-e1-kp04 | 3表现｜各自机制：增生/异位/阻塞｜哪一个不是癌 | 慢性刺激的突出物与腺口阻塞的囊肿（历史工作档案坐标：`e1/teaching-without-annotations.md#growth`；本稿未附该文件） | 已讲：三表现分别接增生、异位、阻塞，不当三期或癌。 |
| repro-path-e1-kp05 | 炎症类型1｜主要动作1｜息肉≠？｜与E2边界 | 慢性刺激的突出物与腺口阻塞的囊肿（历史工作档案坐标：`e1/teaching-without-annotations.md#growth`；本稿未附该文件） | 已讲：慢性非特异增生炎、突出动作与恶性克隆/异型边界明确。 |
| repro-path-e1-kp06 | 谁覆盖｜堵哪｜留什么｜终点1｜为什么不是肿瘤 | 慢性刺激的突出物与腺口阻塞的囊肿（历史工作档案坐标：`e1/teaching-without-annotations.md#growth`；本稿未附该文件） | 已讲：新鳞上皮覆盖腺口、黏液潴留扩张与非肿瘤身份有因果。 |
| repro-path-e1-kp07 | 红→？｜突→？｜囊→？｜异位/化生/缺损/潴留四选 | 慢性刺激的突出物与腺口阻塞的囊肿（历史工作档案坐标：`e1/teaching-without-annotations.md#growth`；本稿未附该文件） | 已讲：红/突/囊分别反推结构，四种操作得到区分。 |

| native LG | native成员（原样KP IDs） | 必要定义／先修衔接与选择条件 | 该组闭环判断 |
|---|---|---|---|
| E1-LG01 | repro-path-e1-kp01, repro-path-e1-kp02, repro-path-e1-kp03 | 正常两区→位置变化再类型变化 | 红而连续不等缺损，三操作闭合；原图门禁继承VERIFIED_SOURCE_VISUAL_AVAILABLE_2026_09_24，当前不声称像素识别已完成 |
| E1-LG02 | repro-path-e1-kp04, repro-path-e1-kp05, repro-path-e1-kp06, repro-path-e1-kp07 | 慢性刺激/腺口→突出或潴留 | 三外观可反推结构，无恶性升级 |

**Block闭环**：中心问题仍沿当前正文的真实机制/条件/比较回收；本轮未发现完整Prompt的新增文字缺漏；结论仅限文字与准确支持，原图门禁/Source待核不因此关闭。

### E2｜E2

底稿：E2隐藏注释正文（历史工作档案坐标：`e2/teaching-without-annotations.md`；本稿未附该文件）。医学owner：`content/xizong/knowledge/systems/e-reproductive-breast/e-e1-e14/生殖病理_E2_高危HPV_SIL与宫颈癌_学习阅读版_v1_最终执行版.md`。native范围来自本章现有只读证据及Source provenance；未改成员。

| KP ID | 完整Prompt要求 | 实际heading／支持位置 | 状态／真实覆盖或缺口 |
|---|---|---|---|
| repro-path-e2-kp01 | 癌前2改变｜哪个来自HPV识别｜哪个代表异型增生 | 高危HPV提供驱动，病理标志提供证据（历史工作档案坐标：`e2/teaching-without-annotations.md#driver`；本稿未附该文件） | 已讲：挖空/异型两线索及各证据职责明确。 |
| repro-path-e2-kp02 | LSIL=CIN?｜下?｜轻度｜HSIL=CIN?+?｜下? / >?或全层｜病理核分裂在哪 | 上皮内广度与间质浸润必须分开（历史工作档案坐标：`e2/teaching-without-annotations.md#barrier`；本稿未附该文件） | 已讲：CIN I/II/III层次、严重度、核分裂与未进入间质的界线齐全。 |
| repro-path-e2-kp03 | 表面→腺口→腺体｜破没破哪层｜为什么仍可原位 | 上皮内广度与间质浸润必须分开（历史工作档案坐标：`e2/teaching-without-annotations.md#barrier`；本稿未附该文件） | 已讲：腺口到腺体、仍完整基膜与原位身份有完整反例。 |
| repro-path-e2-kp04 | 高危2型｜E6→谁｜E7→谁｜5678｜结果1 | 高危HPV提供驱动，病理标志提供证据（历史工作档案坐标：`e2/teaching-without-annotations.md#driver`；本稿未附该文件） | 已讲：16/18、E6-p53、E7-RB和失去抑癌刹车明确；数字口诀无须再当医学。 |
| repro-path-e2-kp05 | 哪种染色模式｜辅助诊断谁｜代表哪类HPV表达｜病因还是marker | 高危HPV提供驱动，病理标志提供证据（历史工作档案坐标：`e2/teaching-without-annotations.md#driver`；本稿未附该文件） | 已讲：p16染色、HSIL辅助/高危表达与病因区别明确。 |
| repro-path-e2-kp06 | 最常病理1｜好发部位1｜原始/新交界｜与化生是否有关 | 高危HPV提供驱动，病理标志提供证据（历史工作档案坐标：`e2/teaching-without-annotations.md#driver`；本稿未附该文件） | 已讲：鳞癌、移行带、原始与新交界及化生相关性区分。 |
| repro-path-e2-kp07 | 原位看1层｜微浸≤?mm｜浸润>?mm｜数字归MI-D | 上皮内广度与间质浸润必须分开（历史工作档案坐标：`e2/teaching-without-annotations.md#barrier`；本稿未附该文件） | 已讲：基膜/≤5mm/>5mm和版本限定明确。 |
| repro-path-e2-kp08 | 扩散2路｜淋巴最早结点1｜先范围后远处 | 扩散路线与分期是后续范围坐标（历史工作档案坐标：`e2/teaching-without-annotations.md#extent`；本稿未附该文件） | 已讲：直接/淋巴、子宫旁首站与范围职责明确。 |
| repro-path-e2-kp09 | 宫颈内｜进入盆腔/阴道｜盆腔壁或阴道下1/3｜超越骨盆/膀胱直肠｜按 Current Study | 扩散路线与分期是后续范围坐标（历史工作档案坐标：`e2/teaching-without-annotations.md#extent`；本稿未附该文件） | 已讲：I–IV盆腔/阴道/盆壁/邻器官范围条件完整。 |
| repro-path-e2-kp10 | 4问顺序｜层次｜基膜｜HPV分子｜扩散范围 | 扩散路线与分期是后续范围坐标（历史工作档案坐标：`e2/teaching-without-annotations.md#extent`；本稿未附该文件） | 已讲：层次—表面/腺体基膜—分子—范围可从一条证据分层恢复。 |

| native LG | native成员（原样KP IDs） | 必要定义／先修衔接与选择条件 | 该组闭环判断 |
|---|---|---|---|
| E2-LG01 | repro-path-e2-kp01, repro-path-e2-kp02, repro-path-e2-kp03 | E1两上皮空间+SIL上皮层数/屏障 | 表面/腺体与间质界线清楚；原图门禁继承VERIFIED_SOURCE_VISUAL_AVAILABLE_2026_09_24，当前不声称像素识别已完成 |
| E2-LG02 | repro-path-e2-kp04, repro-path-e2-kp05 | 移行带位置→E6/E7作用与p16证据 | 病因和辅助指标闭合 |
| E2-LG03 | repro-path-e2-kp06, repro-path-e2-kp07 | SIL/基膜→原位/微浸/侵犯身份 | 深度与器官范围不同轴明确；原图门禁继承VERIFIED_SOURCE_VISUAL_AVAILABLE_2026_09_24，当前不声称像素识别已完成 |
| E2-LG04 | repro-path-e2-kp08, repro-path-e2-kp09, repro-path-e2-kp10 | 癌身份→直接/淋巴与范围分期 | 四范围可分层；Source版本不更新 |

**Block闭环**：中心问题仍沿当前正文的真实机制/条件/比较回收；本轮未发现完整Prompt的新增文字缺漏；结论仅限文字与准确支持，原图门禁/Source待核不因此关闭。

### E3｜E3

底稿：E3隐藏注释正文（历史工作档案坐标：`e3/teaching-without-annotations.md`；本稿未附该文件）。医学owner：`content/xizong/knowledge/systems/e-reproductive-breast/e-e1-e14/生殖病理_E3_内膜异位腺肌病与内膜增生_学习阅读版_v1_最终执行版.md`。native范围来自本章现有只读证据及Source provenance；未改成员。

| KP ID | 完整Prompt要求 | 实际heading／支持位置 | 状态／真实覆盖或缺口 |
|---|---|---|---|
| repro-path-e3-kp01 | 定义2成分｜位置不是“子宫外”而是？｜最常/次常 | 组织身份保留，位置改变（历史工作档案坐标：`e3/teaching-without-annotations.md#location`；本稿未附该文件） | 已讲：腺体和间质、内膜以外定义、卵巢/阔韧带顺序明确。 |
| repro-path-e3-kp02 | 位置1｜距离>？mm｜仍属于哪大类｜“腺肌瘤”≠什么 | 组织身份保留，位置改变（历史工作档案坐标：`e3/teaching-without-annotations.md#location`；本稿未附该文件） | 已讲：肌层位置、>2mm、异位大类与非克隆瘤边界明确。 |
| repro-path-e3-kp03 | 异位后还受谁影响｜周期动作1｜局部后果3｜为什么可反复 | 组织身份保留，位置改变（历史工作档案坐标：`e3/teaching-without-annotations.md#location`；本稿未附该文件） | 已修：周期出血之后的积血、周围组织损伤与组织反应三后果已明说。 |
| repro-path-e3-kp04 | 最常部位1｜周期出血→3步｜咖啡色液体是什么 | 组织身份保留，位置改变（历史工作档案坐标：`e3/teaching-without-annotations.md#location`；本稿未附该文件） | 已讲：卵巢反复出血到增大/囊腔/陈旧血液可恢复。 |
| repro-path-e3-kp05 | 上游激素1｜正常时做什么｜持续过强→什么｜不是哪个激素 | 同一位置中，增生、异型与浸润又不同（历史工作档案坐标：`e3/teaching-without-annotations.md#proliferation`；本稿未附该文件） | 已讲：E正常修复与持续病理增生有比较，P不被当增生上游。 |
| repro-path-e3-kp06 | 2类｜癌风险1–3% / 1/3｜背靠背轻/明显｜数字MI-D | 同一位置中，增生、异型与浸润又不同（历史工作档案坐标：`e3/teaching-without-annotations.md#proliferation`；本稿未附该文件） | 已讲：两类拥挤/异型与两个风险值及数字用途明确。 |
| repro-path-e3-kp07 | 癌前 vs 癌｜决定性结构证据1｜不要用“更挤”替代 | 同一位置中，增生、异型与浸润又不同（历史工作档案坐标：`e3/teaching-without-annotations.md#proliferation`；本稿未附该文件） | 已讲：间质浸润门槛明确，拥挤不足定癌。 |
| repro-path-e3-kp08 | 病灶在哪｜腺体+间质？｜周期出血？｜E持续？｜间质浸润？ | 同一位置中，增生、异型与浸润又不同（历史工作档案坐标：`e3/teaching-without-annotations.md#proliferation`；本稿未附该文件） | 已讲：位置轴与生长性质轴两支都能反向分流。 |

| native LG | native成员（原样KP IDs） | 必要定义／先修衔接与选择条件 | 该组闭环判断 |
|---|---|---|---|
| E3-LG01 | repro-path-e3-kp01, repro-path-e3-kp02, repro-path-e3-kp03, repro-path-e3-kp04 | SR3周期+组织身份→错位置仍有周期 | 定义/腺肌与周期出血后三个局部后果已闭合。 |
| E3-LG02 | repro-path-e3-kp05, repro-path-e3-kp06, repro-path-e3-kp07, repro-path-e3-kp08 | 正常E作用→持续E/异型→间质门槛 | 两支定位/生长性质闭合 |

**Block闭环**：本轮指定的正文与接口缺漏已在同一底稿闭合，中心问题仍沿真实机制、条件与比较回收；这只是文字教学支撑判断，图像状态和学习者证据继续按原owner记录。

### E4｜E4

底稿：E4隐藏注释正文（历史工作档案坐标：`e4/teaching-without-annotations.md`；本稿未附该文件）。医学owner：`content/xizong/knowledge/systems/e-reproductive-breast/e-e1-e14/生殖病理_E4_子宫平滑肌瘤与肉瘤_学习阅读版_v1_最终执行版.md`。native范围来自本章现有只读证据及Source provenance；未改成员。

| KP ID | 完整Prompt要求 | 实际heading／支持位置 | 状态／真实覆盖或缺口 |
|---|---|---|---|
| repro-path-e4-kp01 | 来源组织1｜宫体最常哪层｜位置细表去哪 | 来源和成熟度先建立身份（历史工作档案坐标：`e4/teaching-without-annotations.md#identity`；本稿未附该文件） | 已讲：平滑肌/宫体肌层、位置三型及需原图的边界清楚。 |
| repro-path-e4-kp02 | 良/恶｜包膜有无｜细胞异型方向｜别用哪一个指标单判 | 来源和成熟度先建立身份（历史工作档案坐标：`e4/teaching-without-annotations.md#identity`；本稿未附该文件） | 已讲：良性无包膜、低异型、非单项定性的反例明确。 |
| repro-path-e4-kp03 | 排列3词｜细胞像谁｜结构异常≠细胞高度异型 | 来源和成熟度先建立身份（历史工作档案坐标：`e4/teaching-without-annotations.md#identity`；本稿未附该文件） | 已讲：三排列、正常细胞像与结构/细胞两轴区分。 |
| repro-path-e4-kp04 | 常见变性1｜结构怎么变｜它与恶性证据是否等价 | 继发损伤与恶性证据分别解释（历史工作档案坐标：`e4/teaching-without-annotations.md#degeneration`；本稿未附该文件） | 已讲：透明变性如何替换旋涡结构及不等于恶性明确。 |
| repro-path-e4-kp05 | 妊娠场景｜上游血管事件｜坏死/出血方向 | 继发损伤与恶性证据分别解释（历史工作档案坐标：`e4/teaching-without-annotations.md#degeneration`；本稿未附该文件） | 已讲：妊娠、血栓、坏死/出血的血流链明确。 |
| repro-path-e4-kp06 | 边界｜细胞异型｜核分裂｜哪些非决定性特征不要单判 | 继发损伤与恶性证据分别解释（历史工作档案坐标：`e4/teaching-without-annotations.md#degeneration`；本稿未附该文件） | 已讲：边界不清、显著异型、核分裂和非决定特征齐全。 |
| repro-path-e4-kp07 | 来源｜排列｜变性2｜肉瘤3证据｜大小/坏死能否单判 | 继发损伤与恶性证据分别解释（历史工作档案坐标：`e4/teaching-without-annotations.md#degeneration`；本稿未附该文件） | 已讲：来源—排列—变性—肉瘤证据与不能单判的闭环齐全。 |

| native LG | native成员（原样KP IDs） | 必要定义／先修衔接与选择条件 | 该组闭环判断 |
|---|---|---|---|
| E4-LG01 | repro-path-e4-kp01, repro-path-e4-kp02, repro-path-e4-kp03 | 细胞来源+结构/细胞异型两轴 | 良性无包膜的反例闭合 |
| E4-LG02 | repro-path-e4-kp04, repro-path-e4-kp05, repro-path-e4-kp06, repro-path-e4-kp07 | 已判肿块身份→血流损伤/变性 | 坏死与肉瘤证据不互代，闭合 |

**Block闭环**：中心问题仍沿当前正文的真实机制/条件/比较回收；本轮未发现完整Prompt的新增文字缺漏；结论仅限文字与准确支持，原图门禁/Source待核不因此关闭。

### E5｜E5

底稿：E5隐藏注释正文（历史工作档案坐标：`e5/teaching-without-annotations.md`；本稿未附该文件）。医学owner：`content/xizong/knowledge/systems/e-reproductive-breast/e-e1-e14/生殖病理_E5_葡萄胎与绒毛遗传_学习阅读版_v1_最终执行版.md`。native范围来自本章现有只读证据及Source provenance；未改成员。

| KP ID | 完整Prompt要求 | 实际heading／支持位置 | 状态／真实覆盖或缺口 |
|---|---|---|---|
| repro-path-e5-kp01 | 共同增生谁｜hCG相对正常妊娠｜为什么先Recall胎盘 | 把水泡外观还原到正常绒毛三层（历史工作档案坐标：`e5/teaching-without-annotations.md#villus`；本稿未附该文件） | 已修：hCG升高已明确以正常妊娠为参照，未以单项激素完成身份判断。 |
| repro-path-e5-kp02 | 葡萄胎3类｜肿瘤3类｜另2组只识别｜E5/E6怎么分工 | 把水泡外观还原到正常绒毛三层（历史工作档案坐标：`e5/teaching-without-annotations.md#villus`；本稿未附该文件） | 已讲：三葡萄胎、三肿瘤、两识别组及E5/E6分工均列。 |
| repro-path-e5-kp03 | 绒毛3层｜葡萄胎分别坏在哪｜为什么要回原图 | 把水泡外观还原到正常绒毛三层（历史工作档案坐标：`e5/teaching-without-annotations.md#villus`；本稿未附该文件） | 已讲：绒毛三层及三处对应损伤/原图需求明确。 |
| repro-path-e5-kp04 | 间质2变｜绒毛外观2词｜血管2种结局｜滋养层1变 | 把水泡外观还原到正常绒毛三层（历史工作档案坐标：`e5/teaching-without-annotations.md#villus`；本稿未附该文件） | 已讲：水肿/黏液样、透明葡萄样、血管消失/无功能、滋养异型齐全。 |
| repro-path-e5-kp05 | 全部/部分绒毛｜胎儿有无｜完全2字/部分3字 | 把水泡外观还原到正常绒毛三层（历史工作档案坐标：`e5/teaching-without-annotations.md#villus`；本稿未附该文件）<br>空卵与正常卵产生两套证据（历史工作档案坐标：`e5/teaching-without-annotations.md#genetics`；本稿未附该文件） | 已讲：全部/部分绒毛、胎儿有无与二倍/三倍在两段对应。 |
| repro-path-e5-kp06 | 卵细胞核状态｜精子参与方式｜倍体｜亲本来源 | 空卵与正常卵产生两套证据（历史工作档案坐标：`e5/teaching-without-annotations.md#genetics`；本稿未附该文件） | 已讲：空卵、两精子路径/自复制、二倍全父源明确。 |
| repro-path-e5-kp07 | 卵是否参与｜精子参与方式｜倍体｜父母双方贡献 | 空卵与正常卵产生两套证据（历史工作档案坐标：`e5/teaching-without-annotations.md#genetics`；本稿未附该文件） | 已讲：正常卵、双倍精或两精、三倍及双方贡献明确。 |
| repro-path-e5-kp08 | 完全/部分两端｜亲本来源｜p57方向｜不能替代哪些证据 | 空卵与正常卵产生两套证据（历史工作档案坐标：`e5/teaching-without-annotations.md#genetics`；本稿未附该文件） | 已讲：两型亲本与p57方向、不能代替形态/胎儿/核型有条件。 |
| repro-path-e5-kp09 | 4步｜全部/部分｜胎儿｜父源/双亲｜p57± | 空卵与正常卵产生两套证据（历史工作档案坐标：`e5/teaching-without-annotations.md#genetics`；本稿未附该文件） | 已讲：四坐标能用同一遗传段恢复，侵犯与转移交E6。 |

| native LG | native成员（原样KP IDs） | 必要定义／先修衔接与选择条件 | 该组闭环判断 |
|---|---|---|---|
| E5-LG01 | repro-path-e5-kp01, repro-path-e5-kp02, repro-path-e5-kp03 | SR5 hCG+正常绒毛三层→病理背景 | 结构定义与hCG高于正常妊娠的比较基准已给；原图门禁继承VERIFIED_SOURCE_VISUAL_AVAILABLE_2026_09_24，当前不声称像素识别已完成 |
| E5-LG02 | repro-path-e5-kp04, repro-path-e5-kp05 | 绒毛三层→水泡范围和胎儿组织 | 形态两端与倍体对应闭合；原图门禁继承VERIFIED_SOURCE_VISUAL_AVAILABLE_2026_09_24，当前不声称像素识别已完成 |
| E5-LG03 | repro-path-e5-kp06, repro-path-e5-kp07, repro-path-e5-kp08, repro-path-e5-kp09 | 完全/部分表型→受精路径/亲本/p57 | 成套证据闭合，不只背正负 |

**Block闭环**：本轮指定的正文与接口缺漏已在同一底稿闭合，中心问题仍沿真实机制、条件与比较回收；这只是文字教学支撑判断，图像状态和学习者证据继续按原owner记录。

### E6｜E6

底稿：E6隐藏注释正文（历史工作档案坐标：`e6/teaching-without-annotations.md`；本稿未附该文件）。医学owner：`content/xizong/knowledge/systems/e-reproductive-breast/e-e1-e14/生殖病理_E6_侵袭性葡萄胎绒癌与PSTT_学习阅读版_v1_最终执行版.md`。native范围来自本章现有只读证据及Source provenance；未改成员。

| KP ID | 完整Prompt要求 | 实际heading／支持位置 | 状态／真实覆盖或缺口 |
|---|---|---|---|
| repro-path-e6-kp01 | 良性有｜侵袭有｜绒癌无｜为什么这1轴最值钱 | 绒毛保留与局部侵犯组成两个坐标（历史工作档案坐标：`e6/teaching-without-annotations.md#local`；本稿未附该文件） | 已讲：三病有无绒毛及重要的身份坐标明确。 |
| repro-path-e6-kp02 | 两种细胞｜良<侵<绒癌｜异型/坏死出血同方向 | 绒毛保留与局部侵犯组成两个坐标（历史工作档案坐标：`e6/teaching-without-annotations.md#local`；本稿未附该文件） | 已讲：两滋养层与三病异型/坏死出血趋势齐全。 |
| repro-path-e6-kp03 | 绒毛｜局部侵犯｜远处行为｜不要把侵犯直接当转移 | 绒毛保留与局部侵犯组成两个坐标（历史工作档案坐标：`e6/teaching-without-annotations.md#local`；本稿未附该文件） | 已讲：绒毛、肌层/血管侵犯、远处不能持续生长及术语双口径明确。 |
| repro-path-e6-kp04 | 入血结构｜远处能否持续生长｜术语边界｜与绒癌对比 | 绒毛保留与局部侵犯组成两个坐标（历史工作档案坐标：`e6/teaching-without-annotations.md#local`；本稿未附该文件） | 已讲：绒毛栓子与远处生长区别有机制，真正转移门槛明确。 |
| repro-path-e6-kp05 | 三无｜靠谁供血｜为什么出血坏死显著 | 绒癌用宿主血流供养并播散（历史工作档案坐标：`e6/teaching-without-annotations.md#systemic`；本稿未附该文件） | 已补：出血及坏死的源内有条件推理已给；绒癌专属机制直接证据未被原页提供，正文明确不宣称唯一原因。 |
| repro-path-e6-kp06 | 最常转移方式1｜部位1｜表现1｜静脉回流链 | 绒癌用宿主血流供养并播散（历史工作档案坐标：`e6/teaching-without-annotations.md#systemic`；本稿未附该文件） | 已讲：子宫静脉—右心—肺与咯血反向入口明确。 |
| repro-path-e6-kp07 | 侵葡=栓塞｜绒癌=真转移｜共同终点2 | 绒毛保留与局部侵犯组成两个坐标（历史工作档案坐标：`e6/teaching-without-annotations.md#local`；本稿未附该文件） | 已讲：同外观的栓塞/真转移与出血坏死背景有比较。 |
| repro-path-e6-kp08 | 葡萄胎/侵袭性葡萄胎/绒癌｜清宫 vs 化疗｜各治疗方向｜本层不展开什么 | 绒癌用宿主血流供养并播散（历史工作档案坐标：`e6/teaching-without-annotations.md#systemic`；本稿未附该文件） | 已讲：三病清宫/化疗方向与不展开的治疗层边界明确。 |
| repro-path-e6-kp09 | 激素hPL/hCG｜细胞1型｜绒毛有无｜侵/转｜出血坏死对比 | PSTT改变细胞身份与激素标志（历史工作档案坐标：`e6/teaching-without-annotations.md#pstt`；本稿未附该文件） | 已讲：PSTT细胞、hPL/hCG、无绒毛、侵转及坏死对照齐全。 |
| repro-path-e6-kp10 | 5轴｜绒毛｜细胞｜侵犯｜转移｜hCG/hPL | PSTT改变细胞身份与激素标志（历史工作档案坐标：`e6/teaching-without-annotations.md#pstt`；本稿未附该文件） | 已讲：五轴稳定，局部侵犯与持续远处增殖明确分开。 |

| native LG | native成员（原样KP IDs） | 必要定义／先修衔接与选择条件 | 该组闭环判断 |
|---|---|---|---|
| E6-LG01 | repro-path-e6-kp01, repro-path-e6-kp02, repro-path-e6-kp03 | E5水泡绒毛+两滋养细胞→身份 | 有无绒毛/局部侵犯闭合；原图门禁继承VERIFIED_SOURCE_VISUAL_AVAILABLE_2026_09_24，当前不声称像素识别已完成 |
| E6-LG02 | repro-path-e6-kp04, repro-path-e6-kp05, repro-path-e6-kp06 | 入血/侵犯→远处能否持续增殖 | 侵犯/栓塞/转移闭合；KP05有源内有条件推理，专属直接机制证据与一般解释分开。 |
| E6-LG03 | repro-path-e6-kp07, repro-path-e6-kp08 | 两机制→同样阴道外观/治疗目标 | 真转移与栓塞不混、方向不扩剂量 |
| E6-LG04 | repro-path-e6-kp09, repro-path-e6-kp10 | 既有三病→单中间型/hPL的PSTT | 五轴可从同底稿恢复 |

**Block闭环**：KP05已增加可定位的源内因果解释；疾病页事实与总论条件推理分层，疾病专属直接机制的证据限制保留。

### E7｜E7

底稿：E7隐藏注释正文（历史工作档案坐标：`e7/teaching-without-annotations.md`；本稿未附该文件）。医学owner：`content/xizong/knowledge/systems/e-reproductive-breast/e-e1-e14/生殖病理_E7_卵巢谱系与上皮性肿瘤_学习阅读版_v1_最终执行版.md`。native范围来自本章现有只读证据及Source provenance；未改成员。

| KP ID | 完整Prompt要求 | 实际heading／支持位置 | 状态／真实覆盖或缺口 |
|---|---|---|---|
| repro-path-e7-kp01 | 3谱系｜最常1｜卵母→谁｜卵泡细胞→谁 | 先把三大来源放回组织位置（历史工作档案坐标：`e7/teaching-without-annotations.md#lineage`；本稿未附该文件） | 已讲：三谱系及细胞来源/最常上皮明确。 |
| repro-path-e7-kp02 | 生殖5类｜性索3类｜E8主学哪4个 | 先把三大来源放回组织位置（历史工作档案坐标：`e7/teaching-without-annotations.md#lineage`；本稿未附该文件） | 已讲：生殖五类/性索三类、E8四代表完整，仅名单级支持不扩病程。 |
| repro-path-e7-kp03 | 乳头/砂粒体是否足够｜决定性组织学证据 | 类型识别与恶性门槛使用不同证据（历史工作档案坐标：`e7/teaching-without-annotations.md#epithelial`；本稿未附该文件） | 已讲：类型线索与间质浸润门槛直接分开。 |
| repro-path-e7-kp04 | 囊液｜乳头｜单双侧｜砂粒体｜最后再判浸润 | 类型识别与恶性门槛使用不同证据（历史工作档案坐标：`e7/teaching-without-annotations.md#epithelial`；本稿未附该文件） | 已讲：浆液的内容/乳头/侧别/砂粒体与浸润另判明确。 |
| repro-path-e7-kp05 | 囊性结构｜囊液｜乳头｜单双侧｜最后再判浸润 | 类型识别与恶性门槛使用不同证据（历史工作档案坐标：`e7/teaching-without-annotations.md#epithelial`；本稿未附该文件） | 已讲：黏液的多囊/稠液/乳头少/单侧和浸润另判明确。 |
| repro-path-e7-kp06 | 囊液｜乳头｜单双侧｜砂粒体｜浸润门槛 | 类型识别与恶性门槛使用不同证据（历史工作档案坐标：`e7/teaching-without-annotations.md#epithelial`；本稿未附该文件） | 已讲：同坐标两型比较与恶性证据职责明确。 |
| repro-path-e7-kp07 | 对应哪型｜多见良/恶哪边｜还见2处｜最终仍看什么 | 类型识别与恶性门槛使用不同证据（历史工作档案坐标：`e7/teaching-without-annotations.md#epithelial`；本稿未附该文件） | 已讲：对应浆液恶性倾向、另两处与非特异/非绝对边界明确。 |
| repro-path-e7-kp08 | 原发多哪侧｜继发多哪侧｜典型原发灶1｜双侧恶性先想谁 | 双侧黏液性恶性病变需要改问原发在哪里（历史工作档案坐标：`e7/teaching-without-annotations.md#origin`；本稿未附该文件） | 已讲：单/双侧、胃印戒来源与双侧恶性转移方向有条件。 |
| repro-path-e7-kp09 | 4步｜来源｜浆/黏｜浸润｜单双侧+胃肠 | 双侧黏液性恶性病变需要改问原发在哪里（历史工作档案坐标：`e7/teaching-without-annotations.md#origin`；本稿未附该文件） | 已讲：四步能恢复；独立U011细胞形状缺口仍不填。 |

| native LG | native成员（原样KP IDs） | 必要定义／先修衔接与选择条件 | 该组闭环判断 |
|---|---|---|---|
| E7-LG01 | repro-path-e7-kp01, repro-path-e7-kp02, repro-path-e7-kp03 | 卵母/卵泡/上皮→谱系再浸润 | 三谱系与恶性门槛明确 |
| E7-LG02 | repro-path-e7-kp04, repro-path-e7-kp05, repro-path-e7-kp06, repro-path-e7-kp07 | 上皮类型→同内容/乳头/侧别/砂粒轴 | 多证据比较闭合；独立细胞形状Source缺口保留；原图门禁继承VERIFIED_SOURCE_VISUAL_AVAILABLE_2026_09_24，当前不声称像素识别已完成 |
| E7-LG03 | repro-path-e7-kp08, repro-path-e7-kp09 | 确认黏液恶性→原发来源/侧别 | 不能把双侧都当两个当地原发 |

**Block闭环**：中心问题仍沿当前正文的真实机制/条件/比较回收；本轮未发现完整Prompt的新增文字缺漏；结论仅限文字与准确支持，原图门禁/Source待核不因此关闭。

本章继承待核：E7-SG01：U011 上皮性肿瘤 Q2 末问“镜下多见什么形状的细胞”当前无可可靠绑定答案；保持缺口，不补医学。。

### E8｜E8

底稿：E8隐藏注释正文（历史工作档案坐标：`e8/teaching-without-annotations.md`；本稿未附该文件）。医学owner：`content/xizong/knowledge/systems/e-reproductive-breast/e-e1-e14/生殖病理_E8_卵巢生殖细胞与性索间质肿瘤_学习阅读版_v1_最终执行版.md`。native范围来自本章现有只读证据及Source provenance；未改成员。

| KP ID | 完整Prompt要求 | 实际heading／支持位置 | 状态／真实覆盖或缺口 |
|---|---|---|---|
| repro-path-e8-kp01 | 卵母→哪类｜卵泡细胞→哪类｜本Block各2代表 | 生殖细胞分化后，成熟度比胚层数量关键（历史工作档案坐标：`e8/teaching-without-annotations.md#germ`；本稿未附该文件） | 已修：卵母→生殖与卵泡相关→性索间质两条来源边均已明说。 |
| repro-path-e8-kp02 | 成熟度｜胚层数量能否单独决定｜成熟/未成熟方向 | 生殖细胞分化后，成熟度比胚层数量关键（历史工作档案坐标：`e8/teaching-without-annotations.md#germ`；本稿未附该文件） | 已讲：成熟度与胚层数的良恶比较和反例明确。 |
| repro-path-e8-kp03 | 通常≥2胚层｜单胚层良性2例｜皮样/卵甲 | 生殖细胞分化后，成熟度比胚层数量关键（历史工作档案坐标：`e8/teaching-without-annotations.md#germ`；本稿未附该文件） | 已讲：≥两胚层、两单胚层例/成熟组织可识别。 |
| repro-path-e8-kp04 | 恶性靠未成熟｜原始神经2形态｜另见骨软骨 | 生殖细胞分化后，成熟度比胚层数量关键（历史工作档案坐标：`e8/teaching-without-annotations.md#germ`；本稿未附该文件） | 已讲：未成熟神经两锚明确；骨软骨在本节前段及不能据此定恶的反例中提供分布支持。 |
| repro-path-e8-kp05 | 恶性程度1｜AFP｜疏网｜S-D｜嗜酸｜ASSS | AFP与Schiller–Duval要一起放回卵黄囊谱系（历史工作档案坐标：`e8/teaching-without-annotations.md#yolk`；本稿未附该文件） | 已讲：恶性、AFP与三形态完整；ASSS口诀不增加独立知识。 |
| repro-path-e8-kp06 | 属于谁｜同页另2形态｜必须回图还是可纯背 | AFP与Schiller–Duval要一起放回卵黄囊谱系（历史工作档案坐标：`e8/teaching-without-annotations.md#yolk`；本稿未附该文件） | 已讲：归属/另两形态/原图首次形成的边界明确，非像素学习完成。 |
| repro-path-e8-kp07 | AFP三背景｜卵巢对应谁｜确诊HCC前排什么 | AFP与Schiller–Duval要一起放回卵黄囊谱系（历史工作档案坐标：`e8/teaching-without-annotations.md#yolk`；本稿未附该文件） | 已讲：三AFP背景、卵巢病原与HCC排来源的条件明确。 |
| repro-path-e8-kp08 | 良恶方向｜形态锚｜激素方向｜不要只背病名 | 性索间质肿瘤看核或看胞质（历史工作档案坐标：`e8/teaching-without-annotations.md#stromal`；本稿未附该文件） | 已讲：两瘤良恶、核/胞质与E方向有同坐标比较。 |
| repro-path-e8-kp09 | 核形｜核沟｜特征性小体｜与激素方向联结 | 性索间质肿瘤看核或看胞质（历史工作档案坐标：`e8/teaching-without-annotations.md#stromal`；本稿未附该文件） | 已讲：咖啡豆/核沟/Call-Exner/E输出及非特异边界齐全。 |
| repro-path-e8-kp10 | 胞质成分｜空泡｜良恶方向｜与激素方向联结 | 性索间质肿瘤看核或看胞质（历史工作档案坐标：`e8/teaching-without-annotations.md#stromal`；本稿未附该文件） | 已讲：脂质/空泡/良性/E方向齐全。 |
| repro-path-e8-kp11 | 5问｜来源｜成熟｜AFP｜S-D/Call-Exner｜E | 性索间质肿瘤看核或看胞质（历史工作档案坐标：`e8/teaching-without-annotations.md#stromal`；本稿未附该文件） | 已讲：来源—成熟—标志—结构—激素的整条算法可恢复。 |

| native LG | native成员（原样KP IDs） | 必要定义／先修衔接与选择条件 | 该组闭环判断 |
|---|---|---|---|
| E8-LG01 | repro-path-e8-kp01, repro-path-e8-kp02, repro-path-e8-kp03, repro-path-e8-kp04 | E7非上皮两支→成熟度判定 | 两来源边与成熟度判定已闭合；原图门禁继承VERIFIED_SOURCE_VISUAL_AVAILABLE_2026_09_24，当前不声称像素识别已完成 |
| E8-LG02 | repro-path-e8-kp05, repro-path-e8-kp06, repro-path-e8-kp07 | 生殖背景→AFP和三形态组合 | 标志/器官/妊娠边界齐；形态首次形成仍需图；原图门禁继承VERIFIED_SOURCE_VISUAL_AVAILABLE_2026_09_24，当前不声称像素识别已完成 |
| E8-LG03 | repro-path-e8-kp08, repro-path-e8-kp09, repro-path-e8-kp10, repro-path-e8-kp11 | 卵泡相关来源→核/胞质/激素比较 | 两瘤能区分；不能用正常双细胞模型补肿瘤；原图门禁继承VERIFIED_SOURCE_VISUAL_AVAILABLE_2026_09_24，当前不声称像素识别已完成 |

**Block闭环**：本轮指定的正文与接口缺漏已在同一底稿闭合，中心问题仍沿真实机制、条件与比较回收；这只是文字教学支撑判断，图像状态和学习者证据继续按原owner记录。

### E9｜E9

底稿：E9隐藏注释正文（历史工作档案坐标：`e9/teaching-without-annotations.md`；本稿未附该文件）。医学owner：`content/xizong/knowledge/systems/e-reproductive-breast/e-e1-e14/生殖乳腺_E9_隐睾与鞘膜积液_学习阅读版_v1_最终执行版.md`。native范围来自本章现有只读证据及Source provenance；未改成员。

| KP ID | 完整Prompt要求 | 实际heading／支持位置 | 状态／真实覆盖或缺口 |
|---|---|---|---|
| reproductive-e09-kp01 | 阴囊1征｜本质1｜年龄是主轴 | 下降是否完成，以及Study年龄分支（历史工作档案坐标：`e9/teaching-without-annotations.md#descent`；本稿未附该文件） | 已讲：阴囊空虚与下降未完成、年龄分支明确。 |
| reproductive-e09-kp02 | 自然下降窗口｜何时尝试保守/激素处理｜何时固定｜按 Current Study | 下降是否完成，以及Study年龄分支（历史工作档案坐标：`e9/teaching-without-annotations.md#descent`；本稿未附该文件） | 已讲：1岁/激素/2岁前固定的Source窗口和版本齐全。 |
| reproductive-e09-kp03 | 萎缩+对侧正常｜双侧不能下降｜各1动作 | 下降是否完成，以及Study年龄分支（历史工作档案坐标：`e9/teaching-without-annotations.md#descent`；本稿未附该文件） | 已讲：两特殊条件与切除/自体移植动作明确。 |
| reproductive-e09-kp04 | 下降时带下什么｜未闭→2方向｜疝去哪里 | 下降是否完成，以及Study年龄分支（历史工作档案坐标：`e9/teaching-without-annotations.md#descent`；本稿未附该文件） | 已讲：腹膜延伸/未闭到交通积液或斜疝，疝后置明确。 |
| reproductive-e09-kp05 | 透光｜气液声｜两问入口 | 两项结构问题区分三类积液（历史工作档案坐标：`e9/teaching-without-annotations.md#fluid`；本稿未附该文件） | 已讲：透光/无气液声及两问入口明确。 |
| reproductive-e09-kp06 | 睾丸/精索/交通｜摸到？｜平卧？ | 两项结构问题区分三类积液（历史工作档案坐标：`e9/teaching-without-annotations.md#fluid`；本稿未附该文件） | 已讲：三类摸睾丸与平卧变化有两坐标解释。 |
| reproductive-e09-kp07 | 空虚｜透光｜摸睾丸｜平卧｜疝接口 | 两项结构问题区分三类积液（历史工作档案坐标：`e9/teaching-without-annotations.md#fluid`；本稿未附该文件） | 已讲：空虚或液体包块两支、四体征与疝接口可恢复。 |

| native LG | native成员（原样KP IDs） | 必要定义／先修衔接与选择条件 | 该组闭环判断 |
|---|---|---|---|
| E9-LG01 | reproductive-e09-kp01, reproductive-e09-kp02, reproductive-e09-kp03 | SR2生精环境→下降是否完成/年龄 | 位置与特殊分支可分，Source年龄口径保留 |
| E9-LG02 | reproductive-e09-kp04, reproductive-e09-kp05, reproductive-e09-kp06, reproductive-e09-kp07 | 下降带下鞘突→液体空间/交通 | 三积液能用两坐标分，疝有明确归属；原图门禁继承VERIFIED_SOURCE_VISUAL_AVAILABLE_2026_09_24，当前不声称像素识别已完成 |

**Block闭环**：中心问题仍沿当前正文的真实机制/条件/比较回收；本轮未发现完整Prompt的新增文字缺漏；结论仅限文字与准确支持，原图门禁/Source待核不因此关闭。

本章继承待核：E9-VISUAL-STATE：SOURCE_OWNER_STATE_CONFLICT。

### E10｜E10

底稿：E10隐藏注释正文（历史工作档案坐标：`e10/teaching-without-annotations.md`；本稿未附该文件）。医学owner：`content/xizong/knowledge/systems/e-reproductive-breast/e-e1-e14/生殖乳腺_E10_良性乳房与乳头症状_学习阅读版_v1_最终执行版.md`。native范围来自本章现有只读证据及Source provenance；未改成员。

| KP ID | 完整Prompt要求 | 实际heading／支持位置 | 状态／真实覆盖或缺口 |
|---|---|---|---|
| reproductive-e10-kp01 | 5类｜6变量｜先模型后病名 | 局限肿块与周期组织反应的差别（历史工作档案坐标：`e10/teaching-without-annotations.md#mass`；本稿未附该文件） | 已讲：五类和全部观察变量明确，先模型后病名。 |
| reproductive-e10-kp02 | 年龄｜单发｜痛？｜质地/边界｜活动｜淋巴 | 局限肿块与周期组织反应的差别（历史工作档案坐标：`e10/teaching-without-annotations.md#mass`；本稿未附该文件） | 已讲：纤维腺瘤年龄/单无痛/质硬清界/可动/淋巴齐全并与癌比较。 |
| reproductive-e10-kp03 | 做什么｜为什么病理｜不把它当癌 | 局限肿块与周期组织反应的差别（历史工作档案坐标：`e10/teaching-without-annotations.md#mass`；本稿未附该文件） | 已讲：切除/病理目的与并非先定癌清楚。 |
| reproductive-e10-kp04 | 人群｜周期痛｜多发结节｜质地｜月经后 | 局限肿块与周期组织反应的差别（历史工作档案坐标：`e10/teaching-without-annotations.md#mass`；本稿未附该文件） | 已讲：周期性时间证据、群体/多结节/质地/月经后变化齐全。 |
| reproductive-e10-kp05 | 轻症｜重症药1｜复查｜可疑→什么｜特殊切除指征 | 局限肿块与周期组织反应的差别（历史工作档案坐标：`e10/teaching-without-annotations.md#mass`；本稿未附该文件） | 已讲：对症/重症药/复查/取材与特殊条件分支齐全。 |
| reproductive-e10-kp06 | 最典型1｜摸到肿块？｜阻塞后颜色｜治疗 | 溢液把观察定位到导管，颜色只增加权重（历史工作档案坐标：`e10/teaching-without-annotations.md#duct`；本稿未附该文件） | 已讲：导管出血、隐匿肿块、阻塞棕褐与切乳管/病理齐全。 |
| reproductive-e10-kp07 | 无色｜多色｜黄绿｜血性2类 | 溢液把观察定位到导管，颜色只增加权重（历史工作档案坐标：`e10/teaching-without-annotations.md#duct`；本稿未附该文件） | 已讲：四颜色权重、血性两方向与非诊断性质明确。 |
| reproductive-e10-kp08 | 无菌｜急性可见1皮肤征｜慢性3征｜为什么易混 | 无菌炎症也会制造恶性样外观（历史工作档案坐标：`e10/teaching-without-annotations.md#traction`；本稿未附该文件） | 已讲：无菌急性皮肤/慢性三征、纤维化牵拉与恶性样外观有因果。 |
| reproductive-e10-kp09 | 4类｜哪个是慢性炎症｜哪个后置癌 | 无菌炎症也会制造恶性样外观（历史工作档案坐标：`e10/teaching-without-annotations.md#traction`；本稿未附该文件） | 已讲：四凹陷方向及原发病与后置边界明确。 |
| reproductive-e10-kp10 | 痛/周期｜单多｜会不会动｜溢液｜凹陷｜癌警报 | 无菌炎症也会制造恶性样外观（历史工作档案坐标：`e10/teaching-without-annotations.md#traction`；本稿未附该文件） | 已讲：周期/活动/溢液/凹陷/肿瘤警报的分流可恢复。 |

| native LG | native成员（原样KP IDs） | 必要定义／先修衔接与选择条件 | 该组闭环判断 |
|---|---|---|---|
| E10-LG01 | reproductive-e10-kp01, reproductive-e10-kp02, reproductive-e10-kp03, reproductive-e10-kp04, reproductive-e10-kp05 | SR6正常单位→局限块/周期反应 | 时间/活动与病理取材条件闭合 |
| E10-LG02 | reproductive-e10-kp06, reproductive-e10-kp07 | 导管输送→溢液来源/颜色权重 | 血性两候选不越过组织证据 |
| E10-LG03 | reproductive-e10-kp08, reproductive-e10-kp09, reproductive-e10-kp10 | 炎症纤维化→恶性样外观 | 凹陷/红皮不能单判，分流闭合；原图门禁继承VISUAL_SOURCE_GAP，当前不声称像素识别已完成 |

**Block闭环**：中心问题仍沿当前正文的真实机制/条件/比较回收；本轮未发现完整Prompt的新增文字缺漏；结论仅限文字与准确支持，原图门禁/Source待核不因此关闭。

本章继承待核：E10-VISUAL-STATE：SOURCE_OWNER_STATE_CONFLICT。

### E11｜E11

底稿：E11隐藏注释正文（历史工作档案坐标：`e11/teaching-without-annotations.md`；本稿未附该文件）。医学owner：`content/xizong/knowledge/systems/e-reproductive-breast/e-e1-e14/生殖乳腺_E11_哺乳期乳腺炎与乳房脓肿_学习阅读版_v1_最终执行版.md`。native范围来自本章现有只读证据及Source provenance；未改成员。

| KP ID | 完整Prompt要求 | 实际heading／支持位置 | 状态／真实覆盖或缺口 |
|---|---|---|---|
| reproductive-e11-kp01 | SR6三层｜淤积｜细菌｜炎症 | 先确认排空失效与感染证据（历史工作档案坐标：`e11/teaching-without-annotations.md#infection`；本稿未附该文件） | 已修：PRL/分泌上皮、OT/肌上皮、导管通畅/有效吸吮的最小正常执行者已恢复。 |
| reproductive-e11-kp02 | 人群｜局部4｜全身2｜淋巴｜WBC | 先确认排空失效与感染证据（历史工作档案坐标：`e11/teaching-without-annotations.md#infection`；本稿未附该文件） | 已讲：哺乳人群、四局部/两全身/WBC/痛性结点齐全。 |
| reproductive-e11-kp03 | 两前提｜最常菌｜途径1 | 先确认排空失效与感染证据（历史工作档案坐标：`e11/teaching-without-annotations.md#infection`；本稿未附该文件） | 已讲：淤积与菌、金葡菌/淋巴途径齐全。 |
| reproductive-e11-kp04 | 为什么排｜停排的后果｜与抗生素并列 | 先确认排空失效与感染证据（历史工作档案坐标：`e11/teaching-without-annotations.md#infection`；本稿未附该文件） | 已讲：排空的任务、停排淤积与抗感染不同任务有因果。 |
| reproductive-e11-kp05 | 患侧｜健侧｜严重/乳瘘｜抗菌1｜禁4类 | 哺乳与用药配对保留Source版本（历史工作档案坐标：`e11/teaching-without-annotations.md#study`；本稿未附该文件） | 已讲：患/健侧、严重/乳瘘、抗菌例与四类禁用准确由支持表承载。 |
| reproductive-e11-kp06 | 波动｜穿刺｜封闭空间｜下一动作 | 封闭脓腔出现后要实现真正排出（历史工作档案坐标：`e11/teaching-without-annotations.md#cavity`；本稿未附该文件） | 已讲：波动/穿刺脓与液化封闭腔到引流的门槛明确。 |
| reproductive-e11-kp07 | 表浅｜乳晕下｜深部/乳房后｜切口方向与解剖关系 | 封闭脓腔出现后要实现真正排出（历史工作档案坐标：`e11/teaching-without-annotations.md#cavity`；本稿未附该文件） | 已讲：三个位置与切口选择准确，真实空间仍保留原图门禁。 |
| reproductive-e11-kp08 | 分隔｜大脓腔｜低位引流｜为什么只开一个口不够 | 封闭脓腔出现后要实现真正排出（历史工作档案坐标：`e11/teaching-without-annotations.md#cavity`；本稿未附该文件） | 已讲：分隔/低位/对口引流及残腔机制清楚。 |
| reproductive-e11-kp09 | 年龄方向｜痛？｜寒战高热？｜WBC？｜淋巴结痛？ | 先确认排空失效与感染证据（历史工作档案坐标：`e11/teaching-without-annotations.md#infection`；本稿未附该文件） | 已讲：年龄/痛/全身/WBC/结点痛的两模型比较清楚。 |
| reproductive-e11-kp10 | 哺乳期｜炎症证据｜排空｜波动｜切口 | 封闭脓腔出现后要实现真正排出（历史工作档案坐标：`e11/teaching-without-annotations.md#cavity`；本稿未附该文件） | 已讲：淤积—感染证据—排空—脓腔—空间引流完整。 |

| native LG | native成员（原样KP IDs） | 必要定义／先修衔接与选择条件 | 该组闭环判断 |
|---|---|---|---|
| E11-LG01 | reproductive-e11-kp01, reproductive-e11-kp02, reproductive-e11-kp03 | SR6三层正常链→淤积/病原/局全炎症 | 正常三层执行者已恢复，淤积到感染链可连续展开。 |
| E11-LG02 | reproductive-e11-kp04, reproductive-e11-kp05 | 感染已判→排空与抗菌/哺乳安排 | 两个治疗任务与Source条件表闭合 |
| E11-LG03 | reproductive-e11-kp06, reproductive-e11-kp07, reproductive-e11-kp08 | 液化封闭空间→位置/分隔/低位引流 | 脓肿结构与引流目标闭合；原图门禁继承VERIFIED_SOURCE_VISUAL_AVAILABLE_2026_09_24，当前不声称像素识别已完成 |
| E11-LG04 | reproductive-e11-kp09, reproductive-e11-kp10 | 同红皮→年龄/痛/系统感染/结点组合 | 炎症与癌分流闭合，完整逆算法可用 |

**Block闭环**：本轮指定的正文与接口缺漏已在同一底稿闭合，中心问题仍沿真实机制、条件与比较回收；这只是文字教学支撑判断，图像状态和学习者证据继续按原owner记录。

本章继承待核：E11-VISUAL-STATE：SOURCE_OWNER_STATE_CONFLICT。

### E12｜E12

底稿：E12隐藏注释正文（历史工作档案坐标：`e12/teaching-without-annotations.md`；本稿未附该文件）。医学owner：`content/xizong/knowledge/systems/e-reproductive-breast/e-e1-e14/生殖乳腺_E12_乳腺癌病理进展_学习阅读版_v1_最终执行版.md`。native范围来自本章现有只读证据及Source provenance；未改成员。

| KP ID | 完整Prompt要求 | 实际heading／支持位置 | 状态／真实覆盖或缺口 |
|---|---|---|---|
| reproductive-e12-kp01 | 2上皮单位｜外围1层｜屏障1层｜原位/浸润看什么 | 正常边界与增生风险是出发点（历史工作档案坐标：`e12/teaching-without-annotations.md#risk`；本稿未附该文件） | 已讲：单位/外围肌上皮/基膜及屏障身份明确。 |
| reproductive-e12-kp02 | 分布1词｜细胞是否单一｜风险层级 | 正常边界与增生风险是出发点（历史工作档案坐标：`e12/teaching-without-annotations.md#risk`；本稿未附该文件） | 已讲：流水分布、不单一、与异型癌前区别及不能由增生判浸润有支持。 |
| reproductive-e12-kp03 | 分布1｜形态1｜与普通型差｜当前Study身份 | 正常边界与增生风险是出发点（历史工作档案坐标：`e12/teaching-without-annotations.md#risk`；本稿未附该文件） | 已讲：均匀/单一与普通型比较、癌前身份明确。 |
| reproductive-e12-kp04 | 早1晚1｜生育2｜肥胖｜增生病变｜方向 | 正常边界与增生风险是出发点（历史工作档案坐标：`e12/teaching-without-annotations.md#risk`；本稿未附该文件） | 已讲：E暴露时长/生育、肥胖芳香化及异常增生风险清楚。 |
| reproductive-e12-kp05 | 基因1｜缺失细胞1｜象限1 | 正常边界与增生风险是出发点（历史工作档案坐标：`e12/teaching-without-annotations.md#risk`；本稿未附该文件）<br>原位与浸润的差别是是否进入间质（历史工作档案坐标：`e12/teaching-without-annotations.md#insitu`；本稿未附该文件） | 已讲：BRCA、浸润周无肌上皮、外上象限分布已讲。 |
| reproductive-e12-kp06 | 病理先分2类｜外科分类差异｜为什么不合并 | 原位与浸润的差别是是否进入间质（历史工作档案坐标：`e12/teaching-without-annotations.md#insitu`；本稿未附该文件） | 已讲：两分类及外科原位/Paget差异与职责明确，不强合名单。 |
| reproductive-e12-kp07 | 癌细胞有无｜屏障破没破｜两大原位 | 原位与浸润的差别是是否进入间质（历史工作档案坐标：`e12/teaching-without-annotations.md#insitu`；本稿未附该文件） | 已讲：恶性上皮成立但基膜/肌上皮未越、DCIS/LCIS明确。 |
| reproductive-e12-kp08 | 来源｜高级别2征｜坏死外观｜属于哪类 | 原位与浸润的差别是是否进入间质（历史工作档案坐标：`e12/teaching-without-annotations.md#insitu`；本稿未附该文件） | 已修：现Core高级别两征恶性程度高与核分裂象多已并列，未增加坏死机制。 |
| reproductive-e12-kp09 | 核分裂｜间期｜单双侧｜象限 | 原位与浸润的差别是是否进入间质（历史工作档案坐标：`e12/teaching-without-annotations.md#insitu`；本稿未附该文件） | 已讲：LCIS核分裂/时间/侧别/象限齐全。 |
| reproductive-e12-kp10 | 最常1｜旧名｜排列｜边界｜间质 | 浸润身份成立后，形态与预后还有条件（历史工作档案坐标：`e12/teaching-without-annotations.md#morphology`；本稿未附该文件） | 已讲：NST最常、旧名、巢/边界/纤维间质齐全。 |
| reproductive-e12-kp11 | 来源前序｜细胞一致｜排列2种｜围绕谁 | 浸润身份成立后，形态与预后还有条件（历史工作档案坐标：`e12/teaching-without-annotations.md#morphology`；本稿未附该文件） | 已讲：LCIS前序、一致细胞、单行/靶环及围导管明确。 |
| reproductive-e12-kp12 | 5个特殊部位｜为什么先判来源 | 浸润身份成立后，形态与预后还有条件（历史工作档案坐标：`e12/teaching-without-annotations.md#morphology`；本稿未附该文件） | 已讲：五出口与先识别原发而非当地原发的规则明确。 |
| reproductive-e12-kp13 | 小管/高分化｜髓样条件｜黏液｜分泌｜实性乳头 | 浸润身份成立后，形态与预后还有条件（历史工作档案坐标：`e12/teaching-without-annotations.md#morphology`；本稿未附该文件） | 已讲：完整较好预后名单有表，髓样必要条件先解释。 |
| reproductive-e12-kp14 | 边界｜癌细胞｜间质｜淋巴 | 浸润身份成立后，形态与预后还有条件（历史工作档案坐标：`e12/teaching-without-annotations.md#morphology`；本稿未附该文件） | 已讲：四形态锚与条件性预后有直接联结，视觉仍需原图。 |
| reproductive-e12-kp15 | 最差1｜可无肿块｜像炎症｜治疗接口 | 浸润身份成立后，形态与预后还有条件（历史工作档案坐标：`e12/teaching-without-annotations.md#morphology`；本稿未附该文件） | 已讲：炎性最差/无块/感染鉴别/治疗界限及较差名单齐全。 |
| reproductive-e12-kp16 | 韧带｜真皮淋巴｜两种皮肤表现的直接机制 | 皮肤故障和两种扩散路线各自定位（历史工作档案坐标：`e12/teaching-without-annotations.md#spread`；本稿未附该文件） | 已讲：Cooper牵拉与真皮淋巴阻塞两机制明确。 |
| reproductive-e12-kp17 | 首站区域｜为什么高频｜它属于区域还是远处证据 | 皮肤故障和两种扩散路线各自定位（历史工作档案坐标：`e12/teaching-without-annotations.md#spread`；本稿未附该文件） | 已讲：同侧腋窝首站/常见与N区域交接明确。 |
| reproductive-e12-kp18 | 是否只晚期｜常见器官｜与淋巴扩散分层 | 皮肤故障和两种扩散路线各自定位（历史工作档案坐标：`e12/teaching-without-annotations.md#spread`；本稿未附该文件） | 已讲：早期也可血道、五器官与椎旁静脉并不被淋巴先行排除。 |
| reproductive-e12-kp19 | 5问｜导/小叶｜原位/浸润｜非特殊/特殊｜扩散｜ER/HER2 | 皮肤故障和两种扩散路线各自定位（历史工作档案坐标：`e12/teaching-without-annotations.md#spread`；本稿未附该文件） | 已讲：来源—屏障—形态—扩散—ER/HER2转接完整。 |

| native LG | native成员（原样KP IDs） | 必要定义／先修衔接与选择条件 | 该组闭环判断 |
|---|---|---|---|
| E12-LG01 | reproductive-e12-kp01, reproductive-e12-kp02, reproductive-e12-kp03, reproductive-e12-kp04, reproductive-e12-kp05 | SR6正常单元→普通/异型与E风险 | 屏障、风险/当前肿瘤身份职责分开；原图门禁继承VERIFIED_SOURCE_VISUAL_AVAILABLE_2026_09_24，当前不声称像素识别已完成 |
| E12-LG02 | reproductive-e12-kp06, reproductive-e12-kp07, reproductive-e12-kp08, reproductive-e12-kp09 | 恶性细胞+屏障完整→两原位及分类 | 两高级别特点已明说；原位屏障与中央坏死形态边界保留；原图门禁继承VERIFIED_SOURCE_VISUAL_AVAILABLE_2026_09_24，当前不声称像素识别已完成 |
| E12-LG03 | reproductive-e12-kp10, reproductive-e12-kp11, reproductive-e12-kp12, reproductive-e12-kp13, reproductive-e12-kp14, reproductive-e12-kp15 | 突破屏障后→来源/形态与预后条件 | NST/小叶/特殊/炎性路径闭合，名单作为支持；原图门禁继承VERIFIED_SOURCE_VISUAL_AVAILABLE_2026_09_24，当前不声称像素识别已完成 |
| E12-LG04 | reproductive-e12-kp16, reproductive-e12-kp17, reproductive-e12-kp18, reproductive-e12-kp19 | 浸润结构→牵拉/水肿/区域/远处 | 皮肤双机制与两扩散轴明确，交E13；原图门禁继承VERIFIED_SOURCE_VISUAL_AVAILABLE_2026_09_24，当前不声称像素识别已完成 |

**Block闭环**：本轮指定的正文与接口缺漏已在同一底稿闭合，中心问题仍沿真实机制、条件与比较回收；这只是文字教学支撑判断，图像状态和学习者证据继续按原owner记录。

### E13｜E13

底稿：E13隐藏注释正文（历史工作档案坐标：`e13/teaching-without-annotations.md`；本稿未附该文件）。医学owner：`content/xizong/knowledge/systems/e-reproductive-breast/e-e1-e14/生殖乳腺_E13_TNM分子亚型与诊断证据_学习阅读版_v1_最终执行版.md`。native范围来自本章现有只读证据及Source provenance；未改成员。

| KP ID | 完整Prompt要求 | 实际heading／支持位置 | 状态／真实覆盖或缺口 |
|---|---|---|---|
| reproductive-e13-kp01 | 5问｜各对应1证据层 | 临床警报引出影像，组织学完成身份（历史工作档案坐标：`e13/teaching-without-annotations.md#diagnosis`；本稿未附该文件） | 已讲：五问及病理/局部/区域/远处/分子各证据职责完整。 |
| reproductive-e13-kp02 | 无原发灶｜原位｜大小界值｜不要和T4混 | T的大小与侵犯、N的区域与M的远处（历史工作档案坐标：`e13/teaching-without-annotations.md#extent`；本稿未附该文件） | 已讲：T0/Tis、三大小界值及T4轴区别明确。 |
| reproductive-e13-kp03 | 皮肤｜胸壁｜炎性乳癌｜哪些不算胸壁受侵 | T的大小与侵犯、N的区域与M的远处（历史工作档案坐标：`e13/teaching-without-annotations.md#extent`；本稿未附该文件） | 已讲：皮肤/真正胸壁/炎性T4与仅胸肌粘附等例外明确。 |
| reproductive-e13-kp04 | 无证据｜活动性｜固定/融合｜更远区域结点 | T的大小与侵犯、N的区域与M的远处（历史工作档案坐标：`e13/teaching-without-annotations.md#extent`；本稿未附该文件） | 已讲：Source N0–3活动/固定/更远区域界限与区域M区别齐全。 |
| reproductive-e13-kp05 | 先看T再看N｜当前表格逻辑｜不要静默现代化 | T的大小与侵犯、N的区域与M的远处（历史工作档案坐标：`e13/teaching-without-annotations.md#extent`；本稿未附该文件） | 已讲：完整T-N组合表有支持，明确版本限定。 |
| reproductive-e13-kp06 | M0/M1｜远处转移一旦成立后的分期后果 | T的大小与侵犯、N的区域与M的远处（历史工作档案坐标：`e13/teaching-without-annotations.md#extent`；本稿未附该文件） | 已讲：M0/M1与任意T/N的IV后果明确。 |
| reproductive-e13-kp07 | 激素受体｜生长靶点｜增殖速度 | 受体、靶点和增殖活性不同（历史工作档案坐标：`e13/teaching-without-annotations.md#biology`；本稿未附该文件） | 已讲：三标志分别接内分泌/靶向/增殖，不由一标志推分期。 |
| reproductive-e13-kp08 | 激素受体｜HER2｜Ki-67/当前简化口径 | 受体、靶点和增殖活性不同（历史工作档案坐标：`e13/teaching-without-annotations.md#biology`；本稿未附该文件） | 已讲：A/B简化两受体列与未给Ki67阈值界线清楚。 |
| reproductive-e13-kp09 | ER/PR｜HER2｜哪些阳/阴｜不要只背预后 | 受体、靶点和增殖活性不同（历史工作档案坐标：`e13/teaching-without-annotations.md#biology`；本稿未附该文件） | 已讲：HER2型/三阴性两端及非所有标志均阴性明确。 |
| reproductive-e13-kp10 | 部位｜单多｜痛｜质地｜边界｜活动 | 临床警报引出影像，组织学完成身份（历史工作档案坐标：`e13/teaching-without-annotations.md#diagnosis`；本稿未附该文件） | 已讲：肿块六轴与纤维腺瘤比较完整。 |
| reproductive-e13-kp11 | 血性｜凹陷｜近乳晕 / 导管受侵 | 临床警报引出影像，组织学完成身份（历史工作档案坐标：`e13/teaching-without-annotations.md#diagnosis`；本稿未附该文件） | 已讲：血性/凹陷与导管/乳晕受累逻辑明确。 |
| reproductive-e13-kp12 | 4个｜前2机制｜后2与T4 | 临床警报引出影像，组织学完成身份（历史工作档案坐标：`e13/teaching-without-annotations.md#diagnosis`；本稿未附该文件）<br>T的大小与侵犯、N的区域与M的远处（历史工作档案坐标：`e13/teaching-without-annotations.md#extent`；本稿未附该文件） | 已讲：四皮肤征在诊断和T4节分布，前二机制完整。 |
| reproductive-e13-kp13 | 淋巴首站｜血道3器官｜区域vs远处 | 临床警报引出影像，组织学完成身份（历史工作档案坐标：`e13/teaching-without-annotations.md#diagnosis`；本稿未附该文件）<br>T的大小与侵犯、N的区域与M的远处（历史工作档案坐标：`e13/teaching-without-annotations.md#extent`；本稿未附该文件） | 已讲：区域腋窝与骨肺肝远处可在同底稿两节定位。 |
| reproductive-e13-kp14 | 钼靶2征｜超声1角色｜筛查≠确诊 | 临床警报引出影像，组织学完成身份（历史工作档案坐标：`e13/teaching-without-annotations.md#diagnosis`；本稿未附该文件） | 已讲：钼靶两征/超声角色与确诊职责区分清楚。 |
| reproductive-e13-kp15 | 金标准｜为什么不是影像｜当前Source对部分切除态度 | 临床警报引出影像，组织学完成身份（历史工作档案坐标：`e13/teaching-without-annotations.md#diagnosis`；本稿未附该文件） | 已讲：组织金标准、影像限度与部分切除态度明确。 |
| reproductive-e13-kp16 | 4项｜各只作什么层级 | 临床警报引出影像，组织学完成身份（历史工作档案坐标：`e13/teaching-without-annotations.md#diagnosis`；本稿未附该文件） | 已讲：四补充检查均在问题特定补充证据层，不被当金标准。 |
| reproductive-e13-kp17 | 乳腺标志物｜卵巢/胰腺串联｜CA15-3用途｜BRCA动作接口 | 临床警报引出影像，组织学完成身份（历史工作档案坐标：`e13/teaching-without-annotations.md#diagnosis`；本稿未附该文件） | 已讲：三CA配对、CA153用途与BRCA风险/预防接口齐全。 |
| reproductive-e13-kp18 | ECT用途｜椎旁静脉｜5步算法 | 临床警报引出影像，组织学完成身份（历史工作档案坐标：`e13/teaching-without-annotations.md#diagnosis`；本稿未附该文件）<br>T的大小与侵犯、N的区域与M的远处（历史工作档案坐标：`e13/teaching-without-annotations.md#extent`；本稿未附该文件）<br>受体、靶点和增殖活性不同（历史工作档案坐标：`e13/teaching-without-annotations.md#biology`；本稿未附该文件） | 已讲：ECT敏感/特异界限、椎旁静脉与五问算法齐全。 |

| native LG | native成员（原样KP IDs） | 必要定义／先修衔接与选择条件 | 该组闭环判断 |
|---|---|---|---|
| E13-LG01 | reproductive-e13-kp01, reproductive-e13-kp02, reproductive-e13-kp03 | E12组织身份→T0/Tis/大小或侵犯 | T4覆盖与胸肌例外明确；原图门禁继承VERIFIED_SOURCE_VISUAL_AVAILABLE_2026_09_24，当前不声称像素识别已完成 |
| E13-LG02 | reproductive-e13-kp04, reproductive-e13-kp05, reproductive-e13-kp06 | 局部T→区域N/远处M/组合 | Source组合表齐，无以N代M；原图门禁继承VERIFIED_SOURCE_VISUAL_AVAILABLE_2026_09_24，当前不声称像素识别已完成 |
| E13-LG03 | reproductive-e13-kp07, reproductive-e13-kp08, reproductive-e13-kp09 | 确诊后→受体/靶点/增殖三信息 | 简化亚型在其Source边界内闭合 |
| E13-LG04 | reproductive-e13-kp10, reproductive-e13-kp11, reproductive-e13-kp12, reproductive-e13-kp13 | 既有结构/传播→临床各证据角色 | 每个警报分局部/导管/皮肤/远处 |
| E13-LG05 | reproductive-e13-kp14, reproductive-e13-kp15, reproductive-e13-kp16, reproductive-e13-kp17, reproductive-e13-kp18 | 可疑入口→影像→组织→范围/生物学 | 确诊与补充/监测证据不混，五问闭合 |

**Block闭环**：中心问题仍沿当前正文的真实机制/条件/比较回收；本轮未发现完整Prompt的新增文字缺漏；结论仅限文字与准确支持，原图门禁/Source待核不因此关闭。

本章继承待核：E13-VISUAL-STATE：SOURCE_OWNER_STATE_CONFLICT。

### E14｜E14

底稿：E14隐藏注释正文（历史工作档案坐标：`e14/teaching-without-annotations.md`；本稿未附该文件）。医学owner：`content/xizong/knowledge/systems/e-reproductive-breast/e-e1-e14/生殖乳腺_E14_乳腺癌综合治疗_学习阅读版_v1_最终执行版.md`。native范围来自本章现有只读证据及Source provenance；未改成员。

| KP ID | 完整Prompt要求 | 实际heading／支持位置 | 状态／真实覆盖或缺口 |
|---|---|---|---|
| reproductive-e14-kp01 | 4层｜各1主要工具 | 局部切除范围与解剖坐标（历史工作档案坐标：`e14/teaching-without-annotations.md#local`；本稿未附该文件）<br>先哨证据控制区域手术范围（历史工作档案坐标：`e14/teaching-without-annotations.md#nodes`；本稿未附该文件）<br>区域阴性不能单独抹除全身风险（历史工作档案坐标：`e14/teaching-without-annotations.md#systemic`；本稿未附该文件）<br>受体存在才有相应靶点（历史工作档案坐标：`e14/teaching-without-annotations.md#targets`；本稿未附该文件） | 已讲：四风险层/工具在局部、结点、系统、靶点四节明确。 |
| reproductive-e14-kp02 | 适用期｜切除范围核心｜为什么叫改良 | 局部切除范围与解剖坐标（历史工作档案坐标：`e14/teaching-without-annotations.md#local`；本稿未附该文件） | 已讲：I/II、乳房/腋窝及保胸肌的改良差异分布已讲。 |
| reproductive-e14-kp03 | I保留谁｜II保留谁｜III组清扫难点 | 局部切除范围与解剖坐标（历史工作档案坐标：`e14/teaching-without-annotations.md#local`；本稿未附该文件） | 已讲：两改良保留与胸小肌/III组暴露因果明确。 |
| reproductive-e14-kp04 | 外侧｜后方+Rotter｜内侧/锁骨下 | 局部切除范围与解剖坐标（历史工作档案坐标：`e14/teaching-without-annotations.md#local`；本稿未附该文件） | 已讲：三组坐标、Rotter与锁骨下完整。 |
| reproductive-e14-kp05 | 肿瘤位置｜额外清扫哪组 | 局部切除范围与解剖坐标（历史工作档案坐标：`e14/teaching-without-annotations.md#local`；本稿未附该文件） | 已修：乳房内侧的条件及额外胸骨旁淋巴结清扫对象已明确。 |
| reproductive-e14-kp06 | 3类适用｜淋巴清不清 | 局部切除范围与解剖坐标（历史工作档案坐标：`e14/teaching-without-annotations.md#local`；本稿未附该文件） | 已讲：三适用类和不清腋窝明确。 |
| reproductive-e14-kp07 | 分期｜体积｜切缘1–2｜禁忌1 | 局部切除范围与解剖坐标（历史工作档案坐标：`e14/teaching-without-annotations.md#local`；本稿未附该文件） | 已修：体积适当的主语已明确为乳房，其余现Study选择条件保留。 |
| reproductive-e14-kp08 | 临床结点状态｜清扫 vs 前哨｜先后逻辑 | 先哨证据控制区域手术范围（历史工作档案坐标：`e14/teaching-without-annotations.md#nodes`；本稿未附该文件） | 已讲：临床结点两端与先前哨/清扫逻辑明确。 |
| reproductive-e14-kp09 | 阳性/阴性两端｜继续清扫的触发条件｜区域控制目标 | 先哨证据控制区域手术范围（历史工作档案坐标：`e14/teaching-without-annotations.md#nodes`；本稿未附该文件） | 已讲：前哨阳/阴、病理触发和不盲清扫的目标明确。 |
| reproductive-e14-kp10 | 病理身份｜腋窝结点｜当前 Study 的第一层指征 | 区域阴性不能单独抹除全身风险（历史工作档案坐标：`e14/teaching-without-annotations.md#systemic`；本稿未附该文件） | 已讲：浸润与腋窝阳性第一层指征明确。 |
| reproductive-e14-kp11 | 肿瘤大小｜分化｜受体｜HER2｜按 Current Study | 区域阴性不能单独抹除全身风险（历史工作档案坐标：`e14/teaching-without-annotations.md#systemic`；本稿未附该文件） | 已讲：阴性仍有四类高危因素和不能归零的解释。 |
| reproductive-e14-kp12 | 哪类可作为例外｜这是旧Study压缩规则还是现代完整指南 | 区域阴性不能单独抹除全身风险（历史工作档案坐标：`e14/teaching-without-annotations.md#systemic`；本稿未附该文件） | 已讲：LuminalA例外与旧Source压缩非完整指南明确。 |
| reproductive-e14-kp13 | 哪个术式之后｜局部控制目标｜与全身治疗区分 | 局部切除范围与解剖坐标（历史工作档案坐标：`e14/teaching-without-annotations.md#local`；本稿未附该文件）<br>区域阴性不能单独抹除全身风险（历史工作档案坐标：`e14/teaching-without-annotations.md#systemic`；本稿未附该文件） | 已讲：保乳后放疗对应局部剩余风险，与全身工具分层。 |
| reproductive-e14-kp14 | 前提1｜绝经前药1｜绝经后药2｜机制差 | 受体存在才有相应靶点（历史工作档案坐标：`e14/teaching-without-annotations.md#targets`；本稿未附该文件） | 已讲：ER条件、两生命阶段药名及受体/芳香化机制齐全。 |
| reproductive-e14-kp15 | 标志物｜药物双名｜治疗类型 | 受体存在才有相应靶点（历史工作档案坐标：`e14/teaching-without-annotations.md#targets`；本稿未附该文件） | 已讲：HER2和药双名/治疗类型准确，不与ER药互换。 |
| reproductive-e14-kp16 | 4层顺序｜输入4项｜输出组合 | 局部切除范围与解剖坐标（历史工作档案坐标：`e14/teaching-without-annotations.md#local`；本稿未附该文件）<br>先哨证据控制区域手术范围（历史工作档案坐标：`e14/teaching-without-annotations.md#nodes`；本稿未附该文件）<br>区域阴性不能单独抹除全身风险（历史工作档案坐标：`e14/teaching-without-annotations.md#systemic`；本稿未附该文件）<br>受体存在才有相应靶点（历史工作档案坐标：`e14/teaching-without-annotations.md#targets`；本稿未附该文件） | 已讲：四层输入到输出及工具不能互代的闭环完整。 |

| native LG | native成员（原样KP IDs） | 必要定义／先修衔接与选择条件 | 该组闭环判断 |
|---|---|---|---|
| E14-LG01 | reproductive-e14-kp01, reproductive-e14-kp02, reproductive-e14-kp03, reproductive-e14-kp04 | E13范围/受体→四风险目标+手术空间 | 局部与区域工具清楚，胸小肌空间齐；原图门禁继承VERIFIED_SOURCE_VISUAL_AVAILABLE_2026_09_24，当前不声称像素识别已完成 |
| E14-LG02 | reproductive-e14-kp05, reproductive-e14-kp06, reproductive-e14-kp07 | 局部目标→扩大/全切/保乳范围 | 胸骨旁额外清扫与乳房体积选择条件已明说。 |
| E14-LG03 | reproductive-e14-kp08, reproductive-e14-kp09 | 区域风险→临床结点再前哨病理 | 两级证据触发分叉闭合；原图门禁继承VERIFIED_SOURCE_VISUAL_AVAILABLE_2026_09_24，当前不声称像素识别已完成 |
| E14-LG04 | reproductive-e14-kp10, reproductive-e14-kp11, reproductive-e14-kp12, reproductive-e14-kp13 | 浸润/结点/高危→系统及局部辅助 | 全身化疗与保乳放疗职责分开 |
| E14-LG05 | reproductive-e14-kp14, reproductive-e14-kp15, reproductive-e14-kp16 | ER/HER2与生命阶段→特定靶点 | 六输入到组合输出可恢复，不新拼模型 |

**Block闭环**：本轮指定的正文与接口缺漏已在同一底稿闭合，中心问题仍沿真实机制、条件与比较回收；这只是文字教学支撑判断，图像状态和学习者证据继续按原owner记录。

本章继承待核：E14-VISUAL-STATE：SOURCE_OWNER_STATE_CONFLICT。

## 边界与交回父任务

初查结果保留于本表；本轮已按父任务限定修改原作者稿，并仅组装、检查受影响章节，更新对应正文/model/proof和本报告。注释、native、Source provenance、正式医学owner与Prompt/Core候选均未改；继承的Source和原图限制仍在。没有另发替代正文或新增模型。

各LG的闭环是底稿具备何种教学支撑的评估，不是学习者完成证明。原图可用、Source owner声明并存与实际像素掌握必须分开。

核查范围仍为20个Block、212个KP、67个native LG。状态分布：已讲195；先前限定修补13；本次续查并补解释4，合计212。四个KP涉及五个原Prompt槽：计数单位澄清1、外部一手补充2、功能时程比较1、源内有条件推理1。严格权威限制剩2：SR4原课程唯一第二组织名单未指定；E6疾病页没有专属坏死机制直接证明。E7独立Source子问及既有视觉owner状态不属于本次范围，继续保留。

## 先前限定修补与历史哈希

只组装本表涉及的原章节；其余章节正文、每章Source/annotations/native及所有未应用canonical候选的哈希保持原样。逐小节before/after哈希、实际检查结果和章节正文字符数见本lane [verification.json](verification.json)的`prompt_lg_followup`；本表不复制新正文。

| Block | 修改的原anchor | 隐藏注释正文 SHA-256（先前轮后） | teaching.md SHA-256（先前轮后） |
|---|---|---|---|
| SR1 | modes | `c335d3f1a41d2dd9888143d12cbb4479b9e0cfa2d834f7f984429ce48b1322f3` | `3e414c374609ddc17dc712147c436000f700d6cd7c57709456aad5999272d2aa` |
| SR2 | body | `6d6253f6a8dae558f3b2e77167961c72961c81fb3cfab802cbcf8d0e25107ebb` | `22af3502dfd273a9c3a6e6a0822c481adca2c9e37510cc213a5142bf01552ae0` |
| SR3 | separation | `288986b9822d0a219319e2c35e64816a351ca14e107f9ad968fc06400ef74f50` | `24de0e5478cece55618dd33de7df788f0128504271b30dd175264d51b977c667` |
| SR6 | structure, failure | `122d739d8ba56faa8e801adc018fc774187ef33df3601a6738c390eb2bdbbbba` | `3685dad854cff6ea80824cd5d086dcc9564aaa47c48c5ab08dbfb10593fe2984` |
| E3 | location | `1d036610d8722ea4c26b62812e29d4f381f0e830038805ee1e38664f29f090ac` | `2e9b584dadfdba35419bdc42c4f4661aca79befd85253379a8be32455d3b8215` |
| E5 | villus | `89b98bf6c2b61a041cbd92482114b58717429f2843b1bfd53dc23d8d6d0eb314` | `d578e1d47331909169ebd84aa0c7dd22f29c01b2983b26f890e17a256c9a0217` |
| E8 | germ | `cb49cee8045b585b73d7de60f5b114cd9d7922dcdd2990127ad6e849ffebde62` | `1b003284e95fe56cc1721e8d2b78b676b671c855a575806f3f7452ed635c75cd` |
| E11 | infection | `44d680b9a02fff6c515428671770121cc4e06fb7553301321e68f4832d2e33a9` | `e438d4fcd4b5a95ae377dc8b4da6212e662e9d3018e38d8510fe35d3d58ab744` |
| E12 | insitu | `4560f1d79d07f236a76db87291b8beb165066ed32727b5941bba2fc7d7ac7e71` | `daf3cd3173b2b3b3159893d9433b07c998becb13f3b468828165918c612f56e3` |
| E14 | local | `64c9fddc2dcda0d0f2c4b41cd87c4e9f8adf378bebd836b5b295fced1009b8f0` | `8c7b260be57f177754a7c6095d7a27aeeef35c897fbda41f0646b211faae2d1a` |

## 四项续查的实际来源与局部读回

只改原作者稿四个小节及对应teaching、hidden、model、proof；本报告与lane verification保存实际证据。没有运行原作者稿的全lane重建循环，也没有改正式owner、Source provenance、native、annotations、共享index、finalizer、progress或真实学习记录。完整Prompt和所有KP ID／注释原顺序逐块读回一致；16个其他章正文逐字节保持原样。新医学正文回传仍待父任务批准，此处只交状态与证据位置。

原PDF可读且绑定哈希相同：生理P395／P428／P435，病理P100／P177共五页已实际看像素；这是本轮窄范围Source读回，不关闭官方visual gate。完整源文件字节哈希、原图render哈希、正式owner的Git witness与四小节before／after见 [verification.json](verification.json) 的 `remaining_four_source_followup`。

本次无需用户决定即可完成的本地工作均已完成。没有原课程PDF字节缺失或文件系统权限阻塞。公开原始论文的具体访问限制为只读下载 `https://www.bmj.com/content/bmj/286/6361/257.full.pdf` 返回HTTP403；自动审批未拒绝，已停该目标、未绕过。可读原始摘要仍已审阅；未获得的全文持续数据不进入正文。若以后要求正式唯一课程名单、疾病专属机制直接证据或定量浓度持续结论，应交各原owner决定补充依据或范围，不能静默升格当前derived解释。

| Block | 原anchor | 隐藏正文 SHA-256（续查后） | teaching.md SHA-256（续查后） |
|---|---|---|---|
| SR1 | layers | `af7275efc04d418e7e96dd37c9656c55f01dff687e9e7df33a8f91df91c3b77a` | `4ceebbdf190f698ae1e4090e7a2911d95b0bfaf4119d8649b6fe0ccc45cf0311` |
| SR4 | change | `6e7063859d62eb57897ac5bcdc45a891e8d36279d3cf2dcf256b5b22de817bb2` | `f452c62826b39f5151076c0062569f4744c61970e50d3852d96990bb76908316` |
| SR6 | reflex | `bd5d87cd7600bfed3c0b7036710648aae9a421894591bac6c887447f052ac4aa` | `389292b2af83efc8b632c73947e3693b8cc4693c6a9ded759e99147d316bd03c` |
| E6 | systemic | `20876940a285b6c019e0e626c22694241d36a36878d059d6853a310e0ed3d4da` | `ad85bbf571c87659401d9a7d440bc216592174a1e17871ee3af18cb7c5df4460` |
