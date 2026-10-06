<!-- kianos:reviewed-reading-view {"status":"CANDIDATE_DERIVATION","medical_authority":false,"system_id":"respiratory","block_id":"respiratory-r02","view":"teaching","canonical_path":"content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_肺换气_气体运输与呼吸调节_学习阅读版_v1_最终执行版.md","canonical_blob":"a83808a1e3bf3a6c1d777f873bf27e4250f9dcb0","learning_path":"content/xizong/knowledge/learner/a2-respiratory-learning.json","learning_selector":"/blocks/respiratory-r02","learning_value_sha256":"e0c40c3ac8091c977c26910cae4d08f64951e3e18ee4ab4f58d39db91fb3ef3b","system_path":"content/xizong/knowledge/systems/a2-respiratory/system.json","rule_path":"content/xizong/knowledge/learner/LECTURE_REPLACEMENT_CONTRACT.md","freshness":"Read Current canonical/System/Learning and owned support before use; relevant changes require bounded review. Candidate prose is not medical authority or learner evidence.","preparation_scope":"LOCAL_R01_R04_COMPACT_PROPOSAL_NOT_ADOPTED","basis_main":"ce079966ebce7a95fe9a58b174a412f9f033fd3b"} -->

# 空气到了肺泡以后：跨膜、配血、携氧与反馈

沿同一条路走：肺泡气体 → 呼吸膜 → 匹配的肺血流 → Hb装载 → 组织卸氧。CO₂反向返回，控制器在旁路调节通气。先分通气、换气、携氧与利用，不能让正常PaO₂掩盖Hb/氧含量失败。

这是同一模型的压缩入口。节点标题可直达当前完整知识，解释在原处展开；本准备稿不代表已学习、Source已接触或Memory已准入。

<a id="r02-model-01"></a>
## 跨膜：有梯度，还要有可用面积与距离

- <span class="knowledge-binding" data-kp-id="respiratory-r02-kp01">[肺换气与气体扩散：方向由分压差决定〔扩散方向｜Fick 4因素｜O₂/CO₂差异〕](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L163)</span>：Fick：扩散∝D×面积×分压差/厚度；CO₂扩散约快20倍，单纯换气受损常先低氧。
- <span class="knowledge-binding" data-kp-id="respiratory-r02-kp02">[呼吸膜：是“变厚”还是“面积减少”〔呼吸膜6层｜厚度/距离vs有效面积｜病变→故障轴〕](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L235)</span>：六层气血屏障；水肿/纤维化拉长距离，实变、不张、肺气肿壁/毛细床损害减少有效面积。

<details>
<summary>展开：跨膜：有梯度，还要有可用面积与距离</summary>

R1建立了气流和有效肺泡通气，但空气到达并不是氧供任务的终点。Hb是血红蛋白；后文的PaO₂、PaCO₂分别是动脉血氧和二氧化碳分压，PvO₂是静脉血氧分压。氧还要跨膜、与同一位置的血流相遇、被Hb携带，再在组织卸下；控制器持续调节通气，CO₂沿反方向排出。故“缺氧”可以来自不同层，第一步要辨认哪个变量异常，而不是先搜索一个病名。

图像校准：[P186–187：分压差、呼吸膜、扩散距离 / 面积；](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L1125)。当前理解若依赖空间、曲线或时程，应在这一段核对原图；本稿没有替你完成Source接触。

气体以单纯扩散从高分压到低分压，肺泡O₂进入毛细血管，血中CO₂进入肺泡。Fick关系把速率写成D×面积×分压差/厚度：分压差提供驱动力，但面积少或膜厚时，仅有梯度仍不保证交换充分。CO₂的溶解度很高，尽管分子量更大，扩散系数约为O₂二十倍；所以单纯换气障碍往往先让O₂下降，而不是先让CO₂潴留。

分压沿位置变化也须保留条件。课程CO₂由细胞、组织液、组织毛细血管走向静脉/混合静脉肺动脉、肺泡、呼出气、大气，氧总体反向；肺动脉本来携带混合静脉血，不强拆成永远不同的两级值。原题“换气主要影响PCO₂”与本节机制冲突，保留原题provenance却不据此反写解释。温度对扩散速度的课程方向同样是影响因素，不能遮住结构条件。


从肺泡侧到血侧，呼吸膜包括表活层、上皮、上皮基底膜、间质、毛细管基底膜和内皮，平均很薄且面积大。水肿、纤维化或硅肺增加距离，即气血之间更难跨过；实变、不张、肺气肿壁/毛细床破坏、关闭阻塞或切除则减少有效面积，即可工作的交换通路变少。肺很大不等于有效面积很大，肺气肿正好提供这种反例；水肿也不要求每个肺泡全被液体替代才影响扩散。

</details>

<a id="r02-model-02"></a>
## 气与血在同一肺泡相遇，才不浪费

- <span class="knowledge-binding" data-kp-id="respiratory-r02-kp03">[VA/Q：有空气还要有血，有血还要有空气〔V̇A/Q̇公式/正常值｜肺尖vs肺底｜高低2方向｜死腔样vs分流样〕](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L285)</span>：高VA/Q相对血少→死腔样；低VA/Q相对气少→分流样。直立肺尖/肺底的生理差异不是病名。
- <span class="knowledge-binding" data-kp-id="respiratory-r02-kp04">[通气障碍、换气障碍与呼衰：先看 PaCO₂ 还是 PaO₂〔通气vs换气→血气｜Ⅰ/Ⅱ型接口｜COPD V/Q双支｜低氧主导4因｜俯卧位接口〕](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L350)</span>：通气失败常低氧合并CO₂升；换气失败常低氧为主。COPD两端可并存，健康区Hb接近饱和难补足低氧。

<details>
<summary>展开：气与血在同一肺泡相遇，才不浪费</summary>

图像校准：[P187–188：VA/Q、肺尖 / 肺底、死腔样与分流样；](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L1126)；[P193：为何 V/Q 异常主要缺氧；](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L1130)。当前理解若依赖空间、曲线或时程，应在这一段核对原图；本稿没有替你完成Source接触。

V̇A/Q̇比较肺泡通气与每分肺血流，后者约等于右室输出，课程全肺平均0.84。肺尖与肺底受重力影响通气和血都不同，血流改变更明显，所以直立肺尖约3.3、肺底0.63是生理局部差异，不能把每个偏离0.84的肺泡都判疾病。

气相对多而血少，比值高，气体虽到肺泡却没人交换，成为死腔样；PE、DIC或肺气肿毛细床减少可如此。气少而血相对多，比值低，静脉血经过未充分通气区域仍没装够氧，成为分流样；肺炎、不张、哮喘、纤维化或ARDS可如此。这里的功能性短路并不证明另有一条解剖血管通道。

```text
气多/血少 → 高V̇A/Q̇ → 通气被浪费 → 死腔样
气少/血多 → 低V̇A/Q̇ → 血未充分氧合 → 分流样
```


同一个肺可有两端：COPD小气道堵让部分区域通气少，肺气肿毛细床坏又让另一区血少。不能只问“COPD比值高还是低”然后全肺套一个箭头。通气失败是空气不能有效进出，O₂进少、CO₂出少，常PaO₂降与PaCO₂升并见；换气失败是跨膜或匹配坏，常以PaO₂降为主、PaCO₂正常或低。前者接Ⅱ型、后者接Ⅰ型呼衰，但严重病程仍需实际血气和机械状态校准。

为何健康区域补不了氧，却还能帮排CO₂？除了CO₂扩散更快、动静脉分压差较小，它的解离曲线较线性，增加健康区域通气可继续多排。而健康Hb在氧曲线上段已近饱和，再通气无法额外装很多氧去补低通气区；分压与饱和度的这条关系将在后文展开。ARDS俯卧位让背侧部分压迫减轻、萎陷泡复张，减少分流，是这条匹配机制的preview，完整处理留R12。

</details>

<a id="r02-model-03"></a>
## 血中分压、载体与载量分层；CO₂反向运输

- <span class="knowledge-binding" data-kp-id="respiratory-r02-kp05">[O₂ 运输：PaO₂、氧含量、氧容量、氧饱和度不是一回事〔O₂形式2｜含量/容量/饱和度｜PaO₂/Hb〕](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L427)</span>：PaO₂来自溶解氧，SaO₂是正常Hb占位比例，Hb是载体量，CaO₂才是实际含量。
- <span class="knowledge-binding" data-kp-id="respiratory-r02-kp06">[CO₂ 运输：HCO₃⁻ 是主力，HbCO₂ 是高效接口〔CO₂运输3形式｜各比例｜CA/氯转移｜HbCO₂｜霍尔丹效应〕](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L502)</span>：CO₂先溶解，再主要经红细胞CA与氯转移成为HCO₃⁻；去氧Hb更能装CO₂/H⁺，入肺氧合后卸下。

<details>
<summary>展开：血中分压、载体与载量分层；CO₂反向运输</summary>

图像校准：[P188–190：O₂ / CO₂运输、Hb 氧含量 / 容量 / 饱和度、氯转移；](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L1127)。当前理解若依赖空间、曲线或时程，应在这一段核对原图；本稿没有替你完成Source接触。

物理溶解氧占比少，却形成PaO₂，并作为氧与Hb结合/释放的桥梁；约98.5%由Hb化学结合运输，迅速、可逆、不需酶，Fe仍为二价的氧合而非氧化。Hb数量决定有多少可用载体，PaO₂描述溶解气分压，SaO₂描述正常Hb被氧占据的比例，CaO₂是实际总载量。把它们混同，就会看见正常PaO₂便漏掉贫血或异常Hb携氧失败。

课程1gHb最多约1.34mL氧，Hb15g/100mL时容量约20.1mL/100mL；容量是最多可结合，含量是实际溶解加结合。正常Hb下饱和度分子只有结合氧，不是总CaO₂除容量。COHb/MetHb还要区分功能性和分数饱和度，由共氧测定看异常Hb。正常动脉约97%而非100%，与生理静脉混合如部分支气管静脉入肺静脉有关。


CO₂也须先溶解形成分压，再用化学形式大批运输，课程主力HCO₃⁻约89%、HbCO₂约6%，其余少量物理溶解。CO₂入红细胞，在碳酸酐酶参与下形成H₂CO₃并解离，HCO₃⁻经氯转移入血浆，以NaHCO₃为主；红细胞酶丰富使路径高效。乙酰唑胺抑酶影响转化/运输及组织PCO₂，是作用位置接口，不提前写完整药理。

HbCO₂结合本身不需酶，比例不大却在肺部释放高效。组织Hb卸氧后更易结合CO₂/H⁺，到肺装氧后又让它们释放，这个氧合状态改变CO₂携带能力的关系，叫霍尔丹效应。

</details>

<a id="r02-model-04"></a>
## Hb在肺抓氧，在组织松手

- <span class="knowledge-binding" data-kp-id="respiratory-r02-kp07">[氧解离曲线：上段保装氧，下段保卸氧〔S形机制/T-R｜3段范围→装卸氧｜分压/饱和度锚｜P50定义/值/方向〕](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L557)</span>：协同结合成S曲线；上段保装氧、下段保卸氧。P50↑表示亲和↓、右移、易卸。
- <span class="knowledge-binding" data-kp-id="respiratory-r02-kp08">[氧解离曲线移动：组织想用氧时往右，想抓紧氧时往左〔移动因素4主轴＋CO｜P50/亲和/卸氧｜低温/补碱/库存血｜缺氧贫血高原〕](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L611)</span>：热、CO₂、H⁺、2,3-DPG↑使右移；反向及CO可左移。库存血/补碱仅保留各自条件。
- <span class="knowledge-binding" data-kp-id="respiratory-r02-kp09">[波尔效应 vs 霍尔丹效应：肺和组织分别怎样互相促进 O₂ / CO₂ 交换〔效应2：输入→被调气体｜肺vs组织双向链〕](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L661)</span>：波尔：酸度→O₂亲和；霍尔丹：氧合→CO₂/H⁺携带。组织两路卸氧装CO₂，肺内反向。

<details>
<summary>展开：Hb在肺抓氧，在组织松手</summary>

图像校准：[P190–192：氧解离曲线、T / R 型、P50、曲线移动；](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L1128)；[P192：波尔效应与霍尔丹效应总图；](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L1129)。当前理解若依赖空间、曲线或时程，应在这一段核对原图；本稿没有替你完成Source接触。

Hb四亚基的协同，使第一次结合促T向R转，其他位点更愿意结合；第一次解离促R向T转，其余更容易释放。T亲和低、R高，形成S曲线。课程上段PO₂60–100mmHg较平，≥60通常饱和≥90%，帮助肺装氧；40–60较陡便于安静组织卸氧，15–40更陡便于高代谢大量卸氧。原题PaCO₂≥60的符号差异不能变成高碳酸目标。

P50是饱和50%时的PO₂，约26.5mmHg。P50变大意味着需要更高分压才抓住同样一半氧，亲和下降、曲线右移、容易卸；变小则更抓氧。这个定义比先背左右更能解释方向。


代谢旺盛组织产生热、CO₂和酸，温度/PCO₂/H⁺提高以及2,3-DPG提高使曲线向右，帮助在需要处卸氧。反方向以及CO作用可左移：低温虽降低耗氧，也使Hb更抓氧；不当补碱可影响卸氧，但“宁酸勿碱”是课程串联而不是临床决定。库存血2,3-DPG维持受损亦可左移，不能说储存代谢绝对停止，保存条件改变过程。缺氧、贫血、高原适应的DPG变化同在机制位置，完整输血/酸碱处理留owner。


波尔效应问酸度怎样改氧亲和：组织CO₂/H⁺升而右移卸氧，肺排CO₂/H⁺下降而更易装氧。霍尔丹问氧合怎样改CO₂/H⁺携带：组织卸氧的Hb接CO₂，肺装氧后放CO₂。两者互相帮助肺/组织交换，却以不同气体为输入与结果。

```text
波尔：CO₂/酸度变化 → Hb对O₂亲和变化
霍尔丹：Hb氧合变化 → Hb携CO₂/H⁺能力变化
组织两路共同卸O₂/装CO₂；肺两路共同装O₂/卸CO₂
```

</details>

<a id="r02-model-05"></a>
## 低氧的外观不能代替故障层证据

- <span class="knowledge-binding" data-kp-id="respiratory-r02-kp10">[CO 中毒：PaO₂ 可以正常，但 Hb 不能有效装氧和卸氧〔CO机制｜曲线｜分压/含量｜识别/氧疗〕](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L723)</span>：CO既占Hb又让余下位点更抓氧；PaO₂/普通SpO₂正常不排除，COHb共氧证据才有位置。旧加CO₂不是救治指令。
- <span class="knowledge-binding" data-kp-id="respiratory-r02-kp11">[发绀、严重贫血、CO 与氰化物：同是缺氧，血氧证据不同〔发绀定义/阈值｜氧供vs去氧Hb绝对量｜状态4类×血氧4轴｜高原/贫血反例〕](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L785)</span>：发绀看去氧Hb绝对量，贫血/CO可缺氧却不绀；氰化物利用失败可静脉氧高。CO的PvO₂不固定。

<details>
<summary>展开：低氧的外观不能代替故障层证据</summary>

图像校准：[P194–195：CO 中毒与发绀 / 贫血 / 氰化物比较；](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L1131)。当前理解若依赖空间、曲线或时程，应在这一段核对原图；本稿没有替你完成Source接触。

CO课程亲和约氧250倍，占Hb使可结合氧减少，又让余下位点更抓氧，故既妨碍装也妨碍卸、曲线左移；还可影响复合体Ⅳ还原型Cyta₃的利用环。肺通气换气可正常，PaO₂仍正常而含量/氧供降，PvO₂课程某模型写降，却受灌注、提取和细胞利用共同影响，不固定所有病例。

课程樱桃红常不发绀也非人人典型；普通脉氧可误导，需要COHb共氧证据，正常PaO₂/SpO₂不排除。高压氧通过增加溶解可用氧提供接口，canonical已有脱暴露、100%氧及按神经/心脏、酸中毒/暴露条件评高压的校准；旧加5%CO₂只保留历史差异，不改成自行加气操作。完整中毒治疗仍不在R2。


发绀看去氧Hb绝对量，课程约≥50g/L，并不直接量组织氧供。严重贫血载体太少，PaO₂正常而含量不足，却可能达不到去氧Hb阈值而苍白；CO占载体亦不必绀。氰化物主要阻细胞利用，血到组织却卸用不充分，静脉PvO₂可高而鲜红。肺通气/换气障碍则PaO₂低且含量低、可发绀；高原Hb增多又改变外观，因此肤色不是同一缺氧层的万能证据。

</details>

<a id="r02-model-06"></a>
## 反馈控制通气，并保留急慢性与药气条件

- <span class="knowledge-binding" data-kp-id="respiratory-r02-kp12">[呼吸控制器总图：延髓、脑桥、外周与中枢化学感受器〔控制器4部件｜外周传入2路｜颈动脉体vs主动脉体｜呼吸/循环参与条件〕](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L837)</span>：延髓供节律、脑桥调时程；外周与中枢感受输入并行，危急升压完整回循环。
- <span class="knowledge-binding" data-kp-id="respiratory-r02-kp13">[外周 vs 中枢化学感受器：感受什么、通过什么路径、谁快谁强〔外周 vs 中枢化学感受器｜刺激物｜传感路径｜血脑屏障/CA｜速度/强度｜CO/贫血例外〕](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L886)</span>：外周读PaO₂与H⁺，中枢主要读脑脊液H⁺；CO₂可过血脑屏障，血H⁺难过，贫血/CO含量低不等于低PaO₂驱动。
- <span class="knowledge-binding" data-kp-id="respiratory-r02-kp14">[间接兴奋 vs 直接抑制：O₂和CO₂都不能无限刺激呼吸〔O₂双作用｜CO₂两端｜中枢/反射｜适用条件〕](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L953)</span>：低氧/高CO₂有反射兴奋也有严重时直接抑制，不能异常越大就呼吸越快。
- <span class="knowledge-binding" data-kp-id="respiratory-r02-kp15">[慢性 CO₂ 潴留、Ⅱ型呼衰与低浓度氧：为什么中枢会“适应”〔慢性适应｜氧致高碳酸3路｜滴定｜运动后〕](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L1003)</span>：慢性CO₂适应只解释一部分；氧致高碳酸还要看VA/Q与霍尔丹。高碳酸风险AECOPD常按SpO₂88–92%滴定并查血气，不能延误救低氧。
- <span class="knowledge-binding" data-kp-id="respiratory-r02-kp16">[脑桥、迷走与长吸式呼吸：谁负责及时“刹住吸气”〔调节3部件｜脑桥损毁→型式｜双迷走切断→型式｜vsKussmaul〕](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L1062)</span>：脑桥上部和迷走帮助终止吸气；失去双重抑制可长吸，双迷走切断深慢≠Kussmaul深快。

<details>
<summary>展开：反馈控制通气，并保留急慢性与药气条件</summary>

图像校准：[P200–203：中枢 / 外周化学感受器、血脑屏障和 H⁺路径；](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L1132)；[P204：延髓—脑桥—迷走与长吸式呼吸；](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L1133)；[P205–206：呼吸调节思维导图。](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L1134)。当前理解若依赖空间、曲线或时程，应在这一段核对原图；本稿没有替你完成Source接触。

延髓提供基本节律，脑桥调整吸气时程；颈动脉体/主动脉体外周输入与延髓腹外侧中枢感受共同反馈。颈体经窦神经、舌咽到孤束核，主动脉体经迷走到延髓。课程颈体主要呼吸、主动脉体较多循环参与，严重低氧/酸中毒/低压时升压反射保护心脑，完整危急循环机制仍回A1B2。


外周能感动脉PaO₂下降与H⁺提高，中枢主要感脑脊液H⁺，不感缺氧、也不能直接读血H⁺。血脑屏障让血H⁺难过，CO₂却可入脑脊液再产生H⁺，所以PaCO₂能强力驱动中枢。课程外周也通过细胞内CA转为H⁺，细胞CA多、脑脊液少，配合快弱持续与慢强敏感易适应的比较，但不是有两个互不相关的CO₂分压量。

```text
血CO₂↑ → 过屏障 → 脑脊液H⁺↑ → 中枢驱动↑
血PaO₂↓/H⁺↑ → 外周输入 → 呼吸加深加快
```

外周读PaO₂而非含量，故贫血/CO即使组织缺氧，也未必获得有效低氧呼吸刺激。PaCO₂与VA的反向关系仍须CO₂生成固定，不能只说PaCO₂升必然VA以某个幅度下降。


反射兴奋也有条件。课程PaO₂小于60显著外周驱动，小于30严重缺氧的直接中枢抑制可超过反射；PaCO₂过低缺刺激，过高又直接抑制，不能任一异常越大呼吸就无限快。因CO₂刺激而引出的旧吸氧加5%CO₂不成通用氧疗，高碳酸/通气失败尤不能据此加气，支持需具体血气和状态。


长期CO₂高时肾保HCO₃⁻、缓慢跨屏障影响脑脊液酸度，pH回升令中枢适应，低PaO₂外周驱动可能更重要。但COPD给氧后CO₂升不只因取消低氧驱动：解除缺氧肺血管收缩使V/Q更坏，Hb装氧后的霍尔丹效应改变CO₂携带，部分患者通气下降共同参与。课程25–30%是记忆范围而非所有设备相同FiO₂；高碳酸风险COPD急加重常按88–92%SpO₂滴定、复查血气/评通气，不因怕CO₂延误严重低氧，也不套所有Ⅱ型或CO。R3/R12承担完整路径。


运动结束仍需清乳酸、补ATP/磷酸肌酸和氧债，通气不立即归基线。呼吸时程还由停止吸气机制调节：课程脑桥下部易化延长、上部与迷走传入帮助终止，失去二者抑制可长吸；双迷走切断则深慢，不与代酸Kussmaul深快混名。


由此回看低氧病例，PaCO₂升先追有效通气/泵，PaO₂降而CO₂正常低先追膜与匹配，正常PaO₂而含量低追Hb，正常PaO₂而静脉保氧高追利用，再让驱动解释呼吸动作是否与负荷匹配。每层均有自己的证据，空气、压力、颜色或一张曲线都不能独自证明全路线正常。后续疾病将在同一模型上改变不同部件，P0炎症共同语言只作调用，原图门禁也仍需实际Source接触，教案不生成接触记录。

</details>

既有跨块目的地：[R3 长期家庭氧疗：改善预后，但不等于解决 CO₂潴留](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block3_COPD_%E6%8C%81%E7%BB%AD%E6%B0%94%E6%B5%81%E5%8F%97%E9%99%90_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L1014)；[R12 Ⅰ型 vs Ⅱ型：核心差别不是病名，而是PaCO₂是否因通气失败升高](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block12_ARDS%E4%B8%8E%E5%91%BC%E5%90%B8%E8%A1%B0%E7%AB%AD_%E5%B1%8F%E9%9A%9C%E6%8D%9F%E4%BC%A4%E6%B0%A7%E5%90%88%E5%A4%B1%E8%B4%A5%E4%B8%8E%E9%80%9A%E6%B0%94%E5%A4%B1%E8%B4%A5_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L673)；[R8 低氧机制坐标：通气、VA/Q、弥散、分流不能混成一个词](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block8_%E9%97%B4%E8%B4%A8%E6%80%A7%E8%82%BA%E7%96%BE%E7%97%85%E4%B8%8E%E7%A1%85%E8%82%BA_%E9%99%90%E5%88%B6%E5%BC%A5%E6%95%A3%E7%BA%A4%E7%BB%B4%E5%8C%96%E4%B8%8E%E7%A1%85%E7%BB%93%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L238)。只交接当前机制接口，完整诊疗留原Block。

## 合上解释，仍走同一条路

从一组血气反向走同一路：PaCO₂↑先问有效通气/泵；PaO₂↓而CO₂正常或低再问膜与匹配；PaO₂正常而含量低问Hb；静脉保氧高再问利用。控制器异常与机械泵失败分开。炎症共同语言只Recall，随后进入持续与可变气流受限。

<a id="r02-source-and-completeness"></a>
## 精确记忆与原图：在对应节点回看

- 全部精确数字、名单、例外和比较轴仍归各节点链接的Current Core；本块现有2条Precision身份保持原KP/LG范围，准备答案仅为待审提案，未进入真实Memory。
- 推理依赖图形时在该步核对原图；页码和已有图像位置不等于本轮读过像素。未提供的原图仍为Source门禁，不能因选定图片少就删掉。

<details>
<summary>查看逐项Memory位置、原图任务与Source边界</summary>

### 精确记忆的位置

- 呼吸膜六层； 回[呼吸膜：是“变厚”还是“面积减少”](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L235)。 保持现有Core/Source目的地，不另造卡片。
- 全肺、肺尖、肺底 VA/Q 数值； 回[VA/Q：有空气还要有血，有血还要有空气](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L285)。 关联现有Precision：a2-r02-kp03-precision（身份保留，待审/有缺口则HOLD）。
- O₂ / CO₂ 各运输形式比例； 回[O₂ 运输：PaO₂、氧含量、氧容量、氧饱和度不是一回事](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L427)、[CO₂ 运输：HCO₃⁻ 是主力，HbCO₂ 是高效接口](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L502)。 保持现有Core/Source目的地，不另造卡片。
- Hb 氧容量计算、正常氧饱和度、P50； 回[O₂ 运输：PaO₂、氧含量、氧容量、氧饱和度不是一回事](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L427)、[氧解离曲线：上段保装氧，下段保卸氧](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L557)。 关联现有Precision：a2-r02-lg04-precision（身份保留，待审/有缺口则HOLD）。
- 氧解离曲线全部移动因素； 回[氧解离曲线移动：组织想用氧时往右，想抓紧氧时往左](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L611)。 关联现有Precision：a2-r02-lg04-precision（身份保留，待审/有缺口则HOLD）。
- CO 亲和力倍数、发绀阈值； 回[CO 中毒：PaO₂ 可以正常，但 Hb 不能有效装氧和卸氧](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L723)、[发绀、严重贫血、CO 与氰化物：同是缺氧，血氧证据不同](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L785)。 关联现有Precision：a2-r02-lg04-precision（身份保留，待审/有缺口则HOLD）。
- PaO₂ 60 / 30 mmHg 等精确阈值； 回[间接兴奋 vs 直接抑制：O₂和CO₂都不能无限刺激呼吸](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L953)。 保持现有Core/Source目的地，不另造卡片。
- 低浓度氧百分比、5% CO₂ 等 Study 数字； 回[CO 中毒：PaO₂ 可以正常，但 Hb 不能有效装氧和卸氧](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L723)、[间接兴奋 vs 直接抑制：O₂和CO₂都不能无限刺激呼吸](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L953)、[慢性 CO₂ 潴留、Ⅱ型呼衰与低浓度氧：为什么中枢会“适应”](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L1003)。 保持现有Core/Source目的地，不另造卡片。 25–30%为课程范围；5%CO₂为历史差异，不能当氧疗操作。
- 长吸式呼吸低频定位。 回[脑桥、迷走与长吸式呼吸：谁负责及时“刹住吸气”](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L1062)。 保持现有Core/Source目的地，不另造卡片。

### 原图门禁逐项保留

- **P186–187**：分压差、呼吸膜、扩散距离 / 面积； [原任务及精确位置](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L1125)。
- **P187–188**：VA/Q、肺尖 / 肺底、死腔样与分流样； [原任务及精确位置](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L1126)。
- **P188–190**：O₂ / CO₂运输、Hb 氧含量 / 容量 / 饱和度、氯转移； [原任务及精确位置](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L1127)。
- **P190–192**：氧解离曲线、T / R 型、P50、曲线移动； [原任务及精确位置](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L1128)。
- **P192**：波尔效应与霍尔丹效应总图； [原任务及精确位置](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L1129)。
- **P193**：为何 V/Q 异常主要缺氧； [原任务及精确位置](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L1130)。
- **P194–195**：CO 中毒与发绀 / 贫血 / 氰化物比较； [原任务及精确位置](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L1131)。
- **P200–203**：中枢 / 外周化学感受器、血脑屏障和 H⁺路径； [原任务及精确位置](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L1132)。
- **P204**：延髓—脑桥—迷走与长吸式呼吸； [原任务及精确位置](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L1133)。
- **P205–206**：呼吸调节思维导图。 [原任务及精确位置](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L1134)。
- 已有MedicalVisual「沿呼吸膜从肺泡侧走到毛细血管侧一次，区分‘变厚’和‘面积减少’两种故障。」：生理 Lecture PDF P186–187；[现有视觉owner](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/learner/a2-respiratory-source-visuals.json)，cue身份 a2-r02-lg01-visual。
- 已有MedicalVisual「看肺尖 / 肺底图，只回答哪里更像死腔、哪里更像分流，以及为什么。」：生理 Lecture PDF P187–188；[现有视觉owner](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/learner/a2-respiratory-source-visuals.json)，cue身份 a2-r02-lg02-visual。

### Source与证据范围

Source范围：生理AI阅读版及27精编生理合集【带导图】PDF186–206；U01642+U017catalog22=64；可见42+23=65含未编号化学感受问句，原编号不改。

依据为冻结Current canonical/System/accepted Learning及既有候选教案，复用有效解释；不是新的PDF/医学/Human验收。全部知识锚点链接到本批冻结Current，集成前须重读真实Current并按实际detailMarkdown计算原生依赖摘要。

原题“换气主要PCO₂”和曲线上段“PaCO₂≥60”保留原题身份，机制/目标仍按Current PaO₂。旧Exit把CO静脉氧写固定下降，须回Current“不固定”的限定。旧5%CO₂不得变成氧疗指令。

[Framework、即时机制、原始Memory路由及Block Exit](https://github.com/kianwang022-hash/kianos/blob/ce079966ebce7a95fe9a58b174a412f9f033fd3b/content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_%E8%82%BA%E6%8D%A2%E6%B0%94_%E6%B0%94%E4%BD%93%E8%BF%90%E8%BE%93%E4%B8%8E%E5%91%BC%E5%90%B8%E8%B0%83%E8%8A%82_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md)均保留在原有Block owner；历史切片/制卡语句不创建新层级或自动债务。具体非KP逐项处置随本地审查清单交付。

</details>
