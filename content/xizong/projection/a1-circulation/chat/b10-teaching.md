<!-- kianos:reviewed-reading-view {"status":"CANDIDATE_DERIVATION","medical_authority":false,"system_id":"circulation","block_id":"circulation-b10","view":"teaching","canonical_path":"content/xizong/knowledge/systems/a1-circulation/blocks/Block10_心律失常_学习阅读版_v2_最终执行版.md","canonical_blob":"a2850bcdb9d5414dc160640e6e48b870fe4ec6df","learning_path":"content/xizong/knowledge/learner/a1-circulation-learning.json","learning_selector":"/blocks/circulation-b10","learning_value_sha256":"484466b38478870cf8c2ee3577fd36560336fdcf891a5e8cab88cf00b4e50e1a","system_path":"content/xizong/knowledge/systems/a1-circulation/system.json","rule_path":"content/xizong/knowledge/learner/LECTURE_REPLACEMENT_CONTRACT.md","freshness":"Read Current canonical/System/Learning and owned support before use; relevant changes require bounded review. Candidate prose is not medical authority or learner evidence."} -->

# 节律 → 机械输出 → 灌注

沿默认模型读通因果与分支，需要时原位展开；来源与精确条件仍由现有医学 owner 承担。采用范围见<a href="../../../knowledge/systems/a1-circulation/ACCEPTANCE.md#a1-remaining-teaching-adoption-20261006">本块教学采用记录</a>。

## 节律先影响机械输出，所以入口先看人

- [ECG 四道门 + 稳定性门〔脉搏/稳定性｜快慢/QRS/RR/房室关系｜起源/机制｜治疗目标〕](../../../knowledge/systems/a1-circulation/blocks/Block10_心律失常_学习阅读版_v2_最终执行版.md?plain=1#L721)<!-- b10:node {"kp_id":"circulation-b10-kp023","canonical_line":721} -->：异常形成/传导 → 频率、房室顺序或同步改变 → 充盈、有效SV及冠脉供需受损。先看有效脉搏与灌注，才用电图定位；有电活动不保证有前向血流。
- [快速型：先看有无脉搏与稳定性，再决定同步复律或非同步除颤〔脉搏｜稳定性｜单形/多形｜同步机制｜VF/pVT路径〕](../../../knowledge/systems/a1-circulation/blocks/Block10_心律失常_学习阅读版_v2_最终执行版.md?plain=1#L652)<!-- b10:node {"kp_id":"circulation-b10-kp021","canonical_line":652} -->：无有效脉搏 → B12骤停路径；有脉快速节律致不稳定 → 可可靠同步者同步复律，持续多形VT等不可可靠同步者非同步电击；严重缓慢不稳定进入起搏判断。稳定者继续下面的定位。

<details>
<summary>展开：脉搏、稳定性和同步方式为何不能混层</summary>

<!-- b10:candidate-explanation-section 0 -->

心电图记录电活动，不保证每一次除极都形成有效机械输出。面对异常节律，第一件事是有没有有效脉搏、低血压/休克、缺血、肺水肿或意识障碍，随后才用快慢、QRS宽窄、RR规则性和P–QRS关系定位。频率、房室顺序或同步异常会损害充盈、SV、冠脉供需与脑灌注，不能把电图名称放在这些后果之前。


```text
无有效脉搏 → B12骤停路径：VF/pVT可电击 + CPR
有脉而快速节律致不稳定 → 判断能否可靠同步
                           ├ 单形/可同步 → 同步复律
                           └ 持续多形VT等不可同步 → 非同步电击
稳定 → 快慢/宽窄/规则/P-QRS → 起源机制 → 对应处理
```

同步利用可识别R波避开易损期，R波解释同步机制而不是高于脉搏的总分流。持续多形VT即使尚有脉也不能硬等同步，VF/pVT则同时进入CPR；缓慢不稳定要考虑起搏。完整骤停能量与流程在B12，当前不复制另一套。

</details>

## 稳定后，四道门把电图变成定位证据

- [宽 QRS 的第一意义：心室没有按“寻常路”快速同步除极〔正常传导路｜宽QRS来源3组｜P/PR/QRS/RR各司其职〕](../../../knowledge/systems/a1-circulation/blocks/Block10_心律失常_学习阅读版_v2_最终执行版.md?plain=1#L154)<!-- b10:node {"kp_id":"circulation-b10-kp002","canonical_line":154} -->：快/慢 → QRS窄/宽 → RR规则/不规则 → P与QRS关系。宽QRS说明心室没有按寻常路快速同步除极，可来自室性起源、束支阻滞、旁路或差异传导；宽不直接等于室速。

<details>
<summary>展开：ECG语言、主动异位/保护性逸搏、折返与窦性慢快</summary>

<!-- b10:candidate-explanation-section 1 -->

P是心房除极，PR是房到室传导时间，QRS是心室除极路径，RR是心室频率与规则；ST/T反映复极，QT包含除极至复极、随心率改变，延长可接早期后除极和尖端扭转。横向一小格0.04秒、一大格0.2秒，纵向0.1/0.5 mV。课程P小于0.12秒、肢导联小于0.25 mV，PR 0.12–0.20秒，q小于0.04秒且小于同导联R的1/4，QRS小于0.11秒、≥0.12秒进入宽QRS接口；它们是纸面量，不等于机械输出。

[ECG 先回答“谁在除极、传了多久、心室如何复极”〔ECGvsHolter职责｜标尺2轴×大小格｜基本对象6｜正常/病因边界〕](../../../knowledge/systems/a1-circulation/blocks/Block10_心律失常_学习阅读版_v2_最终执行版.md?plain=1#L122)<!-- b10:node {"kp_id":"circulation-b10-kp001","canonical_line":122} -->


窦房结→心房→AV结→希氏束→束支→浦肯野的寻常路径让心室快速同步。宽QRS可能室性起源、束支阻滞、旁路预激或室内差异传导，不能“宽就一定室速”。完全束支阻滞≥0.12秒，右胸rsR′/兔耳与左侧宽切迹R是课程图形线索；右房高尖肺型P、左房宽双峰P、右室右胸R/右轴/顺钟向、左室左胸R/左轴，精确图形须原图核对。ECG帮助节律诊断而对病因有限，Holter把心悸、晕厥或胸痛的发生与电事件对应，记录到一条节律还需判断是否解释症状。

[窦房阻滞、束支阻滞与心腔增大〔窦房阻滞2型：PP/脱落｜RBBBvsLBBB｜房大2型P｜室大2侧〕](../../../knowledge/systems/a1-circulation/blocks/Block10_心律失常_学习阅读版_v2_最终执行版.md?plain=1#L605)<!-- b10:node {"kp_id":"circulation-b10-kp019","canonical_line":605} -->

<!-- b10:candidate-explanation-section 2 -->

异位冲动提前/快速主导是主动异位，可早搏或连续快速节律，机制可能自律、触发或折返；上位起搏过慢或下传中断时，下位被迫接管则是被动逸搏，是保护性接替而非同一类提前。课程连续三个以上早搏可形成心动过速，连续逸搏形成逸搏心律，交界与室性逸搏的精确速度留实际支持。

[异常冲动形成：窦性异常、被动异位、主动异位〔窦性5类｜主动vs被动异位｜早搏/逸搏→连续节律〕](../../../knowledge/systems/a1-circulation/blocks/Block10_心律失常_学习阅读版_v2_最终执行版.md?plain=1#L191)<!-- b10:node {"kp_id":"circulation-b10-kp003","canonical_line":191} -->


房早提前P′不同于窦性P，通常正常下传QRS、可差异传导变宽，重置窦房结常不完全代偿。交界早通常提前正常QRS，逆行P′可在前、后或重叠，Ⅱ/Ⅲ/aVF倒置；课程完全代偿要连是否逆行重置窦房结解释，不能只凭暂停长度判起源。P′前的房早PR≥0.12秒、交界早小于0.12秒及后位RP′小于0.2秒是来源精确接口。异常传导包括阻滞、旁路/折返及生理性干扰/脱节，折返环路、单向阻滞和缓慢传导使冲动反复绕回，亦可归为异常冲动形成。

[异常传导：阻滞、折返、旁路与生理性干扰〔传导异常3类｜折返条件3｜循环机制｜形成vs传导归类〕](../../../knowledge/systems/a1-circulation/blocks/Block10_心律失常_学习阅读版_v2_最终执行版.md?plain=1#L229)<!-- b10:node {"kp_id":"circulation-b10-kp004","canonical_line":229} -->

窦性异常的五类是窦速、窦缓、窦性心律不齐、窦停、SSS；“不齐”仍须先确认窦性P，再看RR间距，不能直接叫房颤。窦速/窦缓仍有Ⅱ直立、aVR倒置的窦性P，只是RR短或长。窦停P及随后QRS缺失，长间隔通常无固定基本周期倍数；窦房二Ⅰ阻滞PP渐变后整组脱落、长PP通常小于两倍，二Ⅱ突然整组脱落且为整数倍，不能与窦停合并。SSS可持续窦缓、窦停/窦房阻滞及AVB，慢后出现房速/扑/颤、快速结束再长停，形成慢快交替。反复黑矇、晕厥和不可逆显著慢节律时主体转起搏，不能再机械压慢。

[窦速、窦缓、窦停与 SSS：先看 P 波是否仍为窦性，再看频率和长间歇〔窦速vs窦缓：P/RR｜窦停倍数关系｜SSS慢节律3类｜慢快交替｜症状→起搏〕](../../../knowledge/systems/a1-circulation/blocks/Block10_心律失常_学习阅读版_v2_最终执行版.md?plain=1#L257)<!-- b10:node {"kp_id":"circulation-b10-kp005","canonical_line":257} -->

</details>

## 窄而规则、突发突止：追问折返环在哪里

- [阵发性室上性心动过速：突发突止、窄 QRS、规则快速〔PSVT机制/起止｜ECG4轴｜频率｜稳定处理顺序｜不稳定入口〕](../../../knowledge/systems/a1-circulation/blocks/Block10_心律失常_学习阅读版_v2_最终执行版.md?plain=1#L345)<!-- b10:node {"kp_id":"circulation-b10-kp008","canonical_line":345} -->：房室结内快慢径形成AVNRT；房室结下传、旁路逆传可形成顺向AVRT。稳定PSVT的迷走/腺苷针对环路，反复发作可考虑消融。不稳定转回电治疗门。预激合并房颤/扑的宽而不规则分支不能套这条AV结抑制路径。

<details>
<summary>展开：结内折返、旁路、预激和PSVT的条件</summary>

<!-- b10:candidate-explanation-section 3 -->

窦律预激时旁路绕过AV结延搁，提前激动部分心室，形成短PR、δ波、可宽QRS及继发ST-T。顺向AVRT却沿AV结/希浦下传，再经旁路逆传回房，心室从正常路激动而通常QRS窄，可因差异传导变宽；不能把窦律δ波与发作时路径当同一幅图。电生理检查定位，旁路消融解决环路。

[预激综合征：旁路提前激动心室〔预激ECG｜顺向环路→QRS｜检查/根治｜房颤边界〕](../../../knowledge/systems/a1-circulation/blocks/Block10_心律失常_学习阅读版_v2_最终执行版.md?plain=1#L296)<!-- b10:node {"kp_id":"circulation-b10-kp006","canonical_line":296} -->

AVNRT的快径传得快、不应期长，慢径传得慢、不应期短；房早到来快径仍不应，沿慢径下传后快径恢复而逆传，构成结内环。故迷走、腺苷或合适AV结药的目标是打断环，并不是泛称把全心变慢。PSVT典型突发突止、规则、常窄QRS、P难辨或逆行，课程约150–250次/分的汇总范围不能把不同Source精确区间合成唯一Gate。稳定者迷走→腺苷→其他合适AV结药、反复考虑消融，不稳则同步复律。

[AVNRT：房室结快径与慢径形成内部折返〔快慢径：速度/ERP｜房早→折返环｜终止靶点｜药物/消融〕](../../../knowledge/systems/a1-circulation/blocks/Block10_心律失常_学习阅读版_v2_最终执行版.md?plain=1#L320)<!-- b10:node {"kp_id":"circulation-b10-kp007","canonical_line":320} -->

预激合并房颤/扑是另一条危险路径：宽而不规则时不能套规则顺向AVRT的腺苷或普通AF控率。课程避免强心苷、维拉帕米、地尔硫卓、β阻断、胺碘酮等AV结抑制，已有canonical校准包括腺苷；不稳定立即电复律，课程伊布利特/普罗帕酮接口也需自己的适用条件。

</details>

## 不规则的房颤：输出与栓塞分成两条后果

- [房颤识别：三个不一致与两个主要后果〔ECG｜体征3联｜S4｜CO条件｜栓塞〕](../../../knowledge/systems/a1-circulation/blocks/Block10_心律失常_学习阅读版_v2_最终执行版.md?plain=1#L392)<!-- b10:node {"kp_id":"circulation-b10-kp010","canonical_line":392} -->：无有效P、细小f和RR绝对不齐 → 房缩消失、充盈/输出受影响；左房/左心耳淤滞 → 栓塞风险。CO变化随底物、室率和负荷，不能给所有患者固定下降比例。
- [房颤抗凝：先区分瓣膜性 / 非瓣膜性，再评估栓塞风险〔抗凝分流｜评分8项/阈值｜NOAC｜封堵条件｜转复前后〕](../../../knowledge/systems/a1-circulation/blocks/Block10_心律失常_学习阅读版_v2_最终执行版.md?plain=1#L442)<!-- b10:node {"kp_id":"circulation-b10-kp012","canonical_line":442} -->：控率、恢复窦律、抗凝各有任务；控率成功不等于可以停抗凝。先分机械瓣/中重度MS等场景，其余按课程风险坐标。转复的抗凝和排栓条件须独立满足；危急不稳定不等待常规择期时间窗。

<details>
<summary>展开：房扑/房颤、时间分类、控率和围转复抗凝</summary>

<!-- b10:candidate-explanation-section 4 -->

房扑以规则锯齿F、无等电位线，房率约250–350，心室是否规则取决于AV传导比固定或变化。房颤没有有效P而细小不规则f、RR绝对不齐，QRS通常正常但可因差异或预激变宽。机械表现心律不齐、S1强弱变、脉搏短绌，说明并非每次心搏都产生同等外周脉搏；有效房缩消失而无S4，充盈与CO影响依底物、室率和负荷，不能把课程“至少25%”当每例下限。

[房扑：规则 F 波，心室规则性取决于房室传导比〔F波3特征｜心房率｜QRS｜房室比固定vs变化→室律〕](../../../knowledge/systems/a1-circulation/blocks/Block10_心律失常_学习阅读版_v2_最终执行版.md?plain=1#L377)<!-- b10:node {"kp_id":"circulation-b10-kp009","canonical_line":377} -->


左房/左心耳淤滞则独立产生血栓与脑等体循环栓塞，感觉不到心悸也要评估。脉搏突然规则可能窦律恢复，可能固定比例房扑/规则异位，也可能AF加完全AVB、逸搏接管，后者课程有强心苷中毒例；必须回看房室关系。瓣膜病、心肌病、高压改变或甲亢提供底物，无器质病/危险因素的孤立性AF仍依实际情境处理。

时间轴阵发7天内终止、持续超过7天、长期持续超过12月，与永久性接受当前AF、不再尝试窦律的决策轴不同，四类不必逐级进展。旧课程“超过一年不能转复或短时复发”不能改写成生物学永不可逆。

[房颤分类与“孤立性房颤”〔4类：时长/转复｜心内外病因｜孤立性房颤〕](../../../knowledge/systems/a1-circulation/blocks/Block10_心律失常_学习阅读版_v2_最终执行版.md?plain=1#L421)<!-- b10:node {"kp_id":"circulation-b10-kp011","canonical_line":421} -->


抗凝先分机械瓣/中重度MS等华法林场景，其余按课程CHA₂DS₂-VASc：心衰、高压、DM、血管病各1，≥75岁2、65–74岁1且年龄互斥，卒中/TIA/栓塞2、女性1。男0/女1通常不因AF常规抗凝，男1/女2权衡，男≥2/女≥3推荐；适合者DOAC优先但核对肾功能、剂量及出血。左心耳封堵需卒中风险与长期抗凝禁忌/高出血等评估，已有事件先核依从性、剂量和其他病因，不因一次事件或高评分自动封堵。

```text
课程AF＞48h或时间不明
→ 有效抗凝至少3周，或TEE排栓提前路径
→ 转复前建立治疗性抗凝（排栓仍要抗凝）
→ 转复后通常至少4周 → 再按栓塞风险决定长期
```

危急不稳不能等常规三周才电复律，抗凝按急救和禁忌尽快衔接。2024 ESC的CHA₂DS₂-VA及择期大于24小时与课程VASc/48小时必须分版本，不能拼接；短于48小时也不等于必然安全。

节律控制用合适药物、电复律或消融；控率常用β阻断，非DHP负性肌力在收缩性心衰禁用，快AF合并收缩心衰可按场景用β阻断、强心苷或胺碘酮。老年、病程长、房大或难维持窦律更常控率，课程无症状正常LV静息小于110，有症状/心动过速性心肌病静息小于80、运动小于110，再用Holter核过缓/停搏，目标连症状功能耐受。控率既不等于恢复窦律，也不能自动停抗凝。

[房颤节律控制 vs 心室率控制〔节律控制3路｜控率首选/替代｜收缩性心衰条件｜控率适合情境｜抗凝独立〕](../../../knowledge/systems/a1-circulation/blocks/Block10_心律失常_学习阅读版_v2_最终执行版.md?plain=1#L467)<!-- b10:node {"kp_id":"circulation-b10-kp013","canonical_line":467} -->

</details>

## 宽快或慢而脱节：房室关系校准起源与危险

- [室速：宽 QRS 快速节律，寻找房室分离、心室夺获和融合波〔ECG特征｜单形/多形｜脉搏/稳定性｜电击分流〕](../../../knowledge/systems/a1-circulation/blocks/Block10_心律失常_学习阅读版_v2_最终执行版.md?plain=1#L521)<!-- b10:node {"kp_id":"circulation-b10-kp015","canonical_line":521} -->：宽快加房室分离、夺获或融合支持室速；治疗仍回到脉搏、稳定性与单形/多形。长QT相关TdP的纠因/补镁不替代必要电击；再灌注AIVR较慢、起止缓，常观察基础病。
- [房室传导阻滞：从 PR 延长到房室完全脱节〔AVB4型：PR/P-QRS/RR｜部位→逸搏QRS/速度｜风险/治疗〕](../../../knowledge/systems/a1-circulation/blocks/Block10_心律失常_学习阅读版_v2_最终执行版.md?plain=1#L575)<!-- b10:node {"kp_id":"circulation-b10-kp017","canonical_line":575} -->：PR延长但都下传 → 一度；渐长后脱落 → 二Ⅰ；固定PR突然脱落 → 二Ⅱ；房室各自活动且房率更快 → 三度。非可逆/非生理性高阶阻滞不等晕厥才评估永久起搏；房室分离也可来自VT，不能只凭脱节定病名。

<details>
<summary>展开：室早、室速、TdP和阻滞的完整比较</summary>

<!-- b10:candidate-explanation-section 5 -->

室早提前宽畸形QRS、前无相关P、继发ST-T反向，常完全代偿；二联是每一正常接一室早、三联是两正常接一，成对连续两次，间位插入两窦搏而没有通常暂停。不同形态不独自包办不同起源，频发、成对、多源/多形、短阵VT、R-on-T涉及风险，但偶发无症状无器质病可观察及去因，不能图形危险一律预防给药。

[室早：宽大畸形 QRS + 提前发生 + 完全代偿间歇〔ECG4轴｜联律/成对/多源｜间位｜R-on-T〕](../../../knowledge/systems/a1-circulation/blocks/Block10_心律失常_学习阅读版_v2_最终执行版.md?plain=1#L494)<!-- b10:node {"kp_id":"circulation-b10-kp014","canonical_line":494} -->

典型VT连续≥3室搏、常100–250/分、宽QRS，房室分离、夺获和融合支持室性来源。有脉稳定依底物和禁忌选药，有脉单形不稳同步，无脉VF/pVT走B12；持续多形不可可靠同步是例外。TdP为轴/振幅绕基线扭转的多形VT，常长QT，低K/Mg、奎尼丁/胺碘酮等或先天长QT为接口，补镁和纠正诱因针对复发，先天长QT可β阻断；不能用这个后续靶点延迟必要电击。再灌注AIVR较慢、起止缓，常观察及处理基础病。

[尖端扭转型室速与加速性室性自主心律〔TdP：波形/QT/诱因/靶点｜AIVR：背景/起止/处理〕](../../../knowledge/systems/a1-circulation/blocks/Block10_心律失常_学习阅读版_v2_最终执行版.md?plain=1#L551)<!-- b10:node {"kp_id":"circulation-b10-kp016","canonical_line":551} -->

一度AVB每P都传且PR固定大于0.20秒；二ⅠPR渐长到QRS脱落、RR渐短；二ⅡPR不变突然脱落、长RR常倍数；三度P与QRS各自规则却脱节且房率大于室率。结内逸搏可窄且相对快，希浦阻滞宽、慢且不稳定。非可逆/非生理性获得二Ⅱ、高度或三度AVB评估永久起搏不依赖先出现晕厥；急性先找可逆原因。房室分离还可VT的室率大于房率，或生理干扰的两者接近，故脱节不是三度AVB同义词。

[房室分离：三度 AVB、室速与生理性干扰用“谁更快”区分〔房室分离3情境｜房率vs室率｜P-QRS关系〕](../../../knowledge/systems/a1-circulation/blocks/Block10_心律失常_学习阅读版_v2_最终执行版.md?plain=1#L593)<!-- b10:node {"kp_id":"circulation-b10-kp018","canonical_line":593} -->

</details>

## 处理机制，再把恢复的节律接回循环

- [抗心律失常药、起搏器与 ICD：先记角色，再把精确表格放入 MI-D〔药物Ⅰ–Ⅳ：靶点/作用/代表｜胺碘酮多通道/不良反应｜起搏4模式：起搏/感知/适用｜VVI同步风险｜ICD任务〕](../../../knowledge/systems/a1-circulation/blocks/Block10_心律失常_学习阅读版_v2_最终执行版.md?plain=1#L678)<!-- b10:node {"kp_id":"circulation-b10-kp022","canonical_line":678} -->：去缺血、电解质、药物等诱因；低风险、无症状、无器质病的偶发早搏可观察。药物/消融打断异常机制，普通起搏器接管慢或传导失败，ICD针对致命VT/VF。终点是有效充盈、射血和灌注；持续泵负担接B11，灌注崩溃/无脉接B12。

<details>
<summary>展开：治疗角色、药物安全、起搏模式和ICD</summary>

<!-- b10:candidate-explanation-section 6 -->

先找缺血/MI、心衰、电解质、甲亢、药物/强心苷、感染缺氧，低风险早搏或一度/二Ⅰ常观察病因；无症状AF仍独立评估率与栓塞。Ⅰ类阻Na减快反应传导，课程IA奎尼丁、IB利多卡因、IC普罗帕酮；Ⅱβ降低自律/传导/交感，ⅢK复极延长APD/ERP，Ⅳ非DHP抑AV结Ca。胺碘酮多通道与器质底物接口还须连肺纤维化、甲状腺异常、光敏、角膜沉积/TdP来源不良反应，精确全表留owner。

[第一原则：小场面不乱治，治疗病因优先〔观察条件｜诱因6组｜无症状房颤的独立风险〕](../../../knowledge/systems/a1-circulation/blocks/Block10_心律失常_学习阅读版_v2_最终执行版.md?plain=1#L634)<!-- b10:node {"kp_id":"circulation-b10-kp020","canonical_line":634} -->

普通起搏器接管慢或传导失败，ICD预防/终止致命VT/VF，主体任务不同。VVI室起搏/室感知、AAI房/房，感知后I抑制；VDD室起搏/房室感知、DDD房室起搏/房室感知，D可触发并抑制。AAI适合SSS而AV传导正常，VDD窦房正常而严重AVB，DDD合并SSS/严重AVB维持顺序；VVI有房室不同步/综合征风险。持续/永久AF没有可追踪的有效窦性房活动，不能机械房起搏或DDD追踪AF，具体模式切换要设备评估。

课程电复律限制的强心苷、SSS、严重AVB、严重低K、房大伴血栓未抗凝五项保存Source；“已用强心苷”要连B11的中毒与择期条件，不能阻断危急电击。最后让脉搏和稳定性决定时效，ECG四个问题定位机制，去因、控率、转复、抗凝、消融或起搏/ICD处理各自靶点，避免把所有异常节律压成一项药物反应。

</details>

闭环：患者状态决定时效，四道门定位电机制，处理后仍以有效机械输出和灌注检验结果。

<details>
<summary>来源、精确记忆与原图边界</summary>

本稿采用范围以<a href="../../../knowledge/systems/a1-circulation/ACCEPTANCE.md#a1-remaining-teaching-adoption-20261006">本块教学采用记录</a>为准；医学依据为 `content/xizong/knowledge/systems/a1-circulation/blocks/Block10_心律失常_学习阅读版_v2_最终执行版.md`，教学组织依 LR §3.1；KP title/full Prompt 仅淡标定位，隐藏定位后模型仍独立。未从 Core 自动拼接正文，未生成学习/Recall/Source-contact记录，也未取得新的医学/Human验收。

Source范围：内科LectureP367–397；原校准定位P363–392/PDF442–467保留各owner。U131–136全部98题+U137第1–10题共108，U137第11–15题仍B12。

读取实际 System Learning `content/xizong/knowledge/learner/a1-circulation-learning.json#/blocks/circulation-b10`、`shared-fields.json` 对应 stable KP 的完整 retention_metadata、实际 System cues 的 precision_index/visual_bindings 与 Current Extension/Connection owner。精确名单、阈值和药物安全以当前 owner 为准；支持为空不补造，Memory资产存在不等于已入队/到期。

未决/限制：PSVT精确频率Source冲突继续HOLD；旧B10-M07的CO下降、M23永久AF定义、M24封堵/M11围转复、M18同步表均比canonical宽，正文继承正式条件不回写支持。机械瓣精确INR须实际适应证owner，不把共同课程简写当全部瓣型统一目标。ECG图密集页未重做像素验收。

本轮只复用当前 Core 已有的校准和来源记录；未重新查看PDF/原图，未形成临床协议、操作验收或Learner-U证据。精确及模型外内容的现有 owner、别名和阻断状态见本组逐项 disposition；当前没有B10–B12 reviewed visual bundle，原图需求保持Source-gap。

</details>
