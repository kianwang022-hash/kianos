# 史纲教师备课：有界审查记录


## 2026-10-08｜C01–C03内容闭合任务的有界反审

本节仅覆盖史纲C01–C03，并校准旧阅读位置中会恢复全量精记要求的语义。以PR1289的`3dcf04c035bf640727692c0fd117947ad7ca5e9a`为输入；提交前最近复核至`d9ea5f53e8f4808cd60ba832a52484f88a0e9f7c`，三章JSON、三brief及本review原blob均未变。作者与独立文字复核已完成受影响内容路径；总控接受、GitHub实际保存、Website与真实学习是另行证据，不能由本节自动获得。

### 实际修复及保持

- C01六节点及章JSON不改。旧“模型展开后再做同组卡”改为检查是否已完整无提示恢复；看答案展开或漏项不冒充检索成功，必要时仍可复用原卡。旧人物/年份/引文C目录改作查阅，明确封建社会四方面是背景Core理解与识别。
- C02保持农民／洋务／维新三支及原NU。短模型不再用“缺乏近代制度方案”抹掉《资政新篇》，改为确有改革方案、受小生产者局限而未完成救亡任务；原brief正文与阶段路由同步。洋务独立主提示不再预给三失败原因；两纲领题保留原“呈现什么性质”题面及完整答案，不削弱既定性质／身份辨析，也不扩大四领域政策背诵。在原《资政新篇》段补一条Core比较，兑现C01承诺的《海国图志》军事科技范围与法律制度／雇佣劳动范围区别。旧全量年份、企业、书目目录不再指挥必背。
- C03保持七节点及其顺序。S03失败原因恢复源本的彻底纲领／充分发动依靠群众／坚强政党核心三维，不用“武装力量稳定掌权”挤占该分类；保留民族资产阶级软弱妥协的总根源及原文双面评价。三民主义独立主提示不再给出成员，时间题只把同四事件乱序后要求排序，未增加日月默写；旧C目录及表列明确为查漏／自选练习。革命派基础与骨干留Core角色辨析，不把两类知识分子另设闭卷全列要求。
- 三章广义`review_prompt`原样保留，其模型信息与关系上下文不是必须挖空的答案泄漏。全部邻近首次完整答案、10个NU、6／3／7模型入口和23组历史精记payload（7／7／9）不变。未改旧ID、答案、checking、Source、admission或reviewed-target revision，未新增／退休Memory；自选旧完整卡仍按原题检查。

### 来源与复用边界

本次直接完整读取三份当前CF shard的全部现存`original_text_span`：C01 `b3ea2294ff169ac16b84e22aa3bdd8243d8a6824`，PDF4–11；C02 `53b471a8ad16ea1c3952a922c8446678ee22cf0d`，PDF11–18；C03 `26932abb314cc2503697302390aa419429ef39ea`，PDF18–24。它们与既有原章证据所记blob一致，Source manifest行摘要仍匹配本科学科source-review。但分片含截断字段，完整读取现存分片不等于完整母文重新核读。

指定History母文`政治资料库/sources/chengfeng/POL27-CF-HISTORY.md`在固定ref返回404，有限Library查找未解析到本次可用母文／下册PDF；没有下载或替用马原上册。复用本review及原brief已有全篇文字审读与独立攻击证据，精确范围为：C01母MD57–529行、13366字符、SHA256 `6177ad1fbd68658f85111634b5d010859b7be110f5c4db473058354545d9d5fc`；C02 530–994行、13546字符、`5ecaa0b61c23bbf47853da509fb2011e657d880b274460b9895d393d54015a94`；C03 995–1467行、13724字符、`1363bdbab993f15c2d9fa4970f18a1f0f33a6a3d3c05913031f86b6103e23f5b`。本次未重新获得这些母文件bytes，不能把复用改称新一次全源通过。

原reader task`01a1071f-3c5a-7462-a3c1-d1c982d95001`、turn`01a10d34-e299-739a-9b55-d4205cc87bc9`，2026-10-05 18:06收到的有界补证继续仅按既有provenance复用：下册PDF SHA256 `0de9c4c3a513d3fb131f9ff87acc44e7dd6da9e58f3917eb73ad3b8dea96adca`；C01 PDF7/印6、文字255–269行，无像素；C02 PDF12/印11、T+P、行583/628/633/635，仅田亩局部与独立资政表，排除中间跨期土改表；C03 PDF20/印19、T+P、行1129–1173，仅旧三民主义和地价支路，排除后续论战表。本次读原owner所存补证范围，未新取原PDF或完整reader payload，不追加任何像素认证。

本次实读Leg27上册MD PDF158–170（blob `b2b90a8a72723325eedace4cd1511c651ac00c0c`），以及下册PDF16–17人物文献、PDF23土地、PDF26两次论战、PDF76–77分析模板（blob `ee74dc2bc77ff7e5e0f9979d7382f9cff87164e7`）。上册PDF165 UNCLEAR仅为裁切页码，未取不清字段；下册后期分析表达不整体前移为首轮逐字背诵。QUALITY_REPORT和binding一并读取，未使用Leg26或自测本建立基线。当前各章的主动目标／准确度与可选旧卡分工保留；两处未点名的旧组已在原retention表补Core归属，无新增独立残余。

### 覆盖、连续与压缩回读

作者逐章核原解释、模型、主提示及答案，覆盖C01 11考点、C02 6考点、C03 10考点的现有有界内容。独立reviewer返回实际CF/Leg段落攻击，确认并回读修复：仅看C02短模型不再得出“太平无近代方案”；C03恢复源本三弱点不再需另答武装一项；隐藏答案后洋务／三民主义不预给要求恢复的成员；时间排序不预送顺序；正确节点恢复不会自动再刷同组。维新书报能辨析而未默写全集，不被现年路径判为失败；自选完整旧卡则仍守原检查。

C01制度／技术→C02洋务、C02改良→C03革命已在正文实际回收；新增《海国图志》对照仅补一条真实缺口。只读C04 brief原blob`8c658d15c1da33d3d10b461a3b156e59a01964db`第1–36行核交接：该入口已回收主权、土地和群众问题，并明确1915新文化早于护法，不把章序当互不重叠年表；不据此验收C04。

以上模拟均为作者／reviewer已见答案后的内容压力测试，不是新读者独立记忆、真人保持或Kian掌握证据。本地核验只证明原blob bytes、最小diff、JSON语义及23旧组等值；未运行Website、Runtime、compiler、build或私有学习链路。原地图、复杂跨表、截断／疑字与红色题键的item排除全部保留；不声称新全源／全模态完成，不因其局部限制重开其余已审资产。此批到根植真实来源的最小修复候选和独立内容回读为止。


当前状态（2026-10-05）：C01–C10均已有有界文字候选；本次新增C06–C10的实质教案与48个PENDING精记作者目标，仍非全科图文/精记准入或实际消费完成。以下早期读取与修补记录保留原范围；最新增量见末节。未改正式Source、NU、题目、Runtime、学习记录或Memory。

## 原材料实际读取范围

- Current：main@801394f71 的 history/ch01–10.json 全文及总收束已读，用于正式章/单元身份与教学承接。
- 乘风完整提取原文：C01–05全文已读，C06正在分段返回，C07–10未完成；源文件分段SHA核验只证明传输一致，不证明OCR或图表准确。
- 原PDF：下册原图未由本稿作者查看。原文页码注释、verification字段不是本次图像核验。图中层次、跨行表格勾叉、红色题目答案不可冒称已核。
- 教案：总模型暂沿十章Current概览，C01–05有实质连续稿；后半总模型不代替尚未完成的逐章Source复核。

## 已完成的文字反审与最小修正

C01：完整11考点解释；独立攻击后补社会六特点、主次矛盾与任务区别、工人/买办等力量位置、义和团限定、早期改革共同点及首次/最高等准确范围。《海国图志》学习范围回查修正。源名言文字疑项不靠未看原图消解。

C02：完整6考点解释；补太平天国最高峰及第一次等限定、拜上帝教局限明确判断、民族资产阶级首次登台、君主立宪与封建君主制度对象、改良道路教训。保留思想方案/实际落实、三个运动时间交叠及土地跨期表未核。

C03：完整10考点解释；补黄花岗/广州起义影响最大、袁转北洋与形式统一、客观根本原因及三项主观不足。定点独立复核通过。科举1905下诏/1906起始届次与临约任官考试权分别核外部历史文献；不据此改源答案。共和建立先于清帝退位、成败不同任务尺度保持。

C04：完整12考点解释；补五四后新文化性质、李大钊及组织刊物首次定位、理性认识口号、建党三新具体对象、两个《宣言》、五卅无产阶级领导和整体统一战线领导的不同对象；B收窄为新三民主义内容及后续增项。定点独立复核通过。保留新文化与护法交叠、一至四大与国民党一大区别、源表全称风险。

C05：完整7考点解释；独立攻击发现作者红四/红二会师先后倒置，已按原文修正；补旧新领导阶级、长征精神关键词、农民土地整体机制及左倾先后、民族资产阶级错误定位。定点独立复核通过。瓦窑堡政治局会议与12月27日活动分子报告的区别核国家博物馆及原文编者注。第六考点提取错续K05不自行改身份。C为拟精记范围，网站问答尚未制备。

作者已实际连续读回章稿、核覆盖落点与章际条件，并从相同正文提取压缩；独立攻击针对原文实际段落，不以覆盖表自行证明完整。确认问题修后回读，不把独立文字通过扩成未看PDF通过。

## 仍未完成的交付

1. C06–10完整Source复核、教案、独立攻击与修后复查。
2. 下册各章必要图表/原图核验；未核范围影响依赖表格符号、精确措辞和答案的项目，不妨碍已明确的文字机制有界使用。
3. 全十章完成后再定稿总模型及全科压缩，不用概览冒充逐项覆盖。
4. 用户要求的KianOS网站零碎精记候选另按既有Memory结构准备，来源支持、NU绑定、已存在候选去重和未决项隔离是必要条件；本章C目录本身不是已入库卡片，更不产生排队、已学或明日到期。

全科尚未完成，不要求用户替代作者逐章验收。草稿可用范围与来源争议逐项保留，后续只更新本记录，不建立第二套内容注册表。

## 2026-10-05 P5：C01-S04晚清反侵略失败原因文字组

本增量仅准备原chapter的一个active_precision组，并在原brief“失败怎样推动问题升级”内补固定位置、解释/压缩/检索次序。原C01全文、S01–S04身份、cause_layers与timeline均保留；不是C01全章或史纲全科准备完成。

实际文字审读：fresh main f730354ef6f860f606c92eb4303fe3a3a6efcf4e 的Politics Current、直接Learning/Interaction/Content Semantics合约和History Acceptance；PR1151 head ba7f88756736200042b6f3ee49eff45d4db4c982的原chapter（blob 7ddf3c1036fae97a352937dc0e3f93187b670348）、brief（f79fec1ad7c7d6c8057c174cd63a173b0eb578b8）和本review。Source c01 shard（b3ea2294ff169ac16b84e22aa3bdd8243d8a6824）K10-N01及I01/I02为下册PDF10／印刷9的连续文字：制度腐败阻碍中国人民群众广泛动员和组织是根本原因，经济技术落后是重要原因。原chapter/brief与之相符。源父节点“历次”由章内晚清语境限定，不推出后来战争或所有局部战斗失败。

本次未看原PDF像素；PDF9地图/红答案、PDF10林魏/维新表勾叉和引文、PDF11甲午红答案、K10的OCR TIP尾字均不参与答案或准入。verification字段不算本次核图证据。LEG26未作为当前准入支持；未声称已核2027指定背诵手册。清楚的当前Source文字支持可单独进入FIRST_ROUND_EXACT内容审读，图像待项不自动扩大到本组。

Consumer mapping：polmem-b3d1b517由现有groupCandidate规则生成，身份basis为chapter_id、PRECISION、S04、组name及两条source_refs；未另建侧车或显式新ID体系。chapter content_support.active_precision → groupCandidate → extractPoliticsMemoryCandidates → 原签名/记录guard。正式同章及相邻C02未发现既有precision/memory对象；fresh History目录没有ch01.memory.json或ch02.memory.json。既有C文字目录本身不产生候选；新组已在下述独立实质审读后准入这一有界首轮内容范围；未获审读的其他项目仍不准入。

独立内容反审已逐项检查K10连续文字、formal cause_layers、brief新段、真实题面/答案/checking/cue及10种构造答法，未发现必须修复的实质内容缺陷；允许忠实释义与换序，不要求未问附加项。独立14项断言实际通过，含pending排除与原guard通过隔离批准payload。下表只批准此ID与当前digest；任何语义修改必须重算原reviewed-target digest并重新审读，不能借另一行签名。

<a id="p5-history-c01-s04-20261005"></a>
| Target | Content status | reviewed target revision |
| --- | --- | --- |
| polmem-b3d1b517 | REVIEWED | sha256:d858f2d06dbf9c53816fd7913b0dc93f1fbec4c0de1070a5e64f824f946539b9 |

作者内容自测（构造答案，非learner记录）：完整回答和保义换序可通过；只答经济技术、根本/重要倒置、漏群众广泛动员和组织、以政府组织不力替代群众机制、只答武器、泛化所有时代或每场战斗、声称经济技术不起作用均不能全对。cue能展开回两层原因和群众机制，但提示后展开不算无提示成功。题面明确“晚清反侵略战争总体失败”，不会与同章“列强瓜分中国图谋未得逞的原因”混为同一问题。

云本地原producer/guard有界执行21项断言通过：原chapter实际发现0候选；把原cause_layers仅机械挂成C组仍不可选择；早期完整payload与成对REVIEWED记录先在隔离fixture中通过原guard；同payload保留PENDING时不通过。独立内容审读完成后，最终本地candidate与本review实际记录又通过原guard，仅准入该1对象。删prompt即使重签也被拒；漏制度、层级反转、丢条件或cue变义均打破原digest；重复ID、同prompt不同答案真实触发原异常。摘要签名只锁定已审payload，不能自动判断内容是否正确。producer和repair函数体保持原样，Current枚举/完整loader在该函数fixture中显式不可调用，故不声称全catalog或计划链路通过。

dependent projection已按最终本地候选bytes只改source.blob_sha；原validator在单章隔离manifest上先真实FAIL旧blob，再重绑PASS，全部54条既有selector解析值相同，其他projection字段逐值不变。该派生重绑不是内容批准；若内容审读改变chapter，必须重算witness后重跑。同批需包含chapter、brief、本review和既有ch01.projection.json四文件，不能遗留stale binding。

独立最终回读确认真实本地candidate仅准入该1对象、digest不变，依赖projection单章原validator也实际通过。后续复用53章与1个旧sidecar缓存，逐文件对fresh PR1151目录blob metadata核验为同一内容bytes；使用未改的原producer、真实sidecar读取、签名guard及题面去重函数，准入集合331→332，仅新增polmem-b3d1b517，原331对象及签名逐对象不变。原Memory Runtime纯函数另过10项隔离断言：无W/U主动计划与全部snapshot字段、pending/unknown/stale拒绝、Map中apply与idempotent、添加无关目标不废原历史、改答只废依赖目标历史及旧snapshot拒绝。测试事件仅为进程内fixture，没有写真实learner storage或产生原生应用回执。

有界独立内容与直接producer/sidecar/catalog集合验证已完成；完整politicsCurrent题库/first-ready loader、全库校验和实际Website仍需原consumer环境验证。实际验证须检查同一ID只出现一次、显式题面/答案/checking/cue/Source/准入完整到达选择与揭示、未准入目标排除、提示无检索前泄露，并沿原计划/证据snapshot路径保持freshness与回传语义。未运行全库QA、浏览器、main到Website交付或U。准备不自动产生learner plan、Recall、W/U或明日到期任务。


## 2026-10-05 P5：C01–C05固定续教路线与文字精记作者稿

### fresh基准与最小增量

直接GET refs/heads/main核为bf69dc154ce960e833e90aacb84eb0d53360f8a9，PR #1151 head为cba1469949fdde813af9a9d796a4443df357cf8c。PR返回base a9a2a459不是main HEAD，发现后已纠正并刷新三项必要合同，按Learning §§0.5/3.1.1/3.2、Interaction §1.1、Content Semantics §§3.1.1–3.3绑定。History CURRENT/Acceptance不变；main与candidate的C01–05 Source shard同blob，C02–05章JSON同blob。C01主分支仍无本文件上一批已reviewed组，不能把候选状态写成main采用。

五章成熟教案、B落点、就地边界、同模型压缩与原reviewed C01-S04关系组保留。本次只在五brief内补固定阶段/范围/next，并对本次可完整核读的Source文字补32个精记作者目标；本review记录这轮有界审读。未改原chapter、Source、NU、题目、projection、consumer或任何learner state；C06–10不在本批。

### 可复用教学范围

五章各有T0母模型、三段实际内容填充、T4有意易混回看、T5同模型收束/精记交接，锚点H01–H05-T0..T5只作教案路由。原chapter_compression的timeline/comparison是固定索引，原正文较长的压缩只作其展开，不作为另一条平行框架。C02原比较短语由已存在正文限定，不否认《资政新篇》；C03政府成立先于清帝退位；C04保留S01、独立K03–K07、S03七NU；C05长征为持续过程，遵义在其中，会师精神和三组总结回挂后段。

作者实际读完五brief与章JSON，分三遍检查覆盖、连续、压缩；独立reviewer实际读五brief全文、新路线与32题，并返回Source shard的实际文字，不只读汇总。原Source shard若只有首行，不代表原始Markdown全文；之前的完整文字审读证据仍限旧准备，不能给本轮新target补造Source或图像证据。

### 新目标有界范围及消费边界

- C01：封建社会四方面、三元里地位、义和团三局限、林则徐人物著作、爱国官兵战争配对（5组）。原polmem-b3d1b517完全保留，不重签或重造。
- C02：洋务失败三原因与失败标志、维新六活动类别/三重性质/四类代表（5组）。
- C03：革命派基础与骨干、兴中会起点、同盟会组织地位、南京临时政府性质依据、辛亥未竟与客观根因、邹容陈天华作品（6组）。
- C04：新文化开场阵地口号、早期马克思主义者三来源、早期组织三工作、一大时地实际工作、新三民主义三内容、大革命失败标志尺度、李大钊两组作品、建党早期三种组织定位（8组）。
- C05：起义旗帜区别、长征直接原因、遵义问题特点、长征精神五方面、三组总结文章、南京/易帜日期、茶陵政权、苏维埃制度性质（8组）。

各组已给自足prompt、Source范围内完整答案、必要漏项/混淆/释义标准、答后可选cue、2027 CF Source节点/blob/页码及解释前提。全部新组保持PENDING_REVIEW：这里的独立文本通过不等于consumer/签名准入。拟复用原chapter.content_support.active_precision→groupCandidate(PRECISION)；每组固定题名/NU/ordered source_refs给出明确mapping，尚未实际写入原chapter、生成polmem ID或reviewed-target digest。brief文字本身不会被该loader消费，不能宣称现在可选或入计划。不得借旧C01签名给本批目标准入。

作者直接静态读取现head原consumer：groupCandidate保留prompt/items/checking_criteria/memory_cue/source_refs及admission_basis；extractPoliticsMemoryCandidates枚举原chapter/sidecar而不读brief；原guard要求REVIEWED、合法Source/前提及与digest成对记录。这只说明待接入路径，未执行这些函数，不算准入拦截或整catalog测试PASS。

### 两个真实fail及最小修复

1. 作者隐藏权威答案，仅依C05长征精神初cue“五个问句”展开，发现“怎样判断实际”不能可靠恢复独立自主，且利益、群众生死患难等限定不稳。判cue可还原性FAIL，只改该cue为五方面具体支点；逐项回到K05-N04-I01–I05原文恢复，独立reviewer确认缺口不再复现。答案未改，提示后恢复不当无提示成功。
2. 独立reviewer发现C03题面只问“以什么任务尺度”却要求社会性质/主要矛盾/任务三项全答。反例只答“反帝反封建任务未完成”并完整答客观根因，本可符合题面却被扣两项。判retrieval范围一致性FAIL。只改题面为“从社会性质、主要矛盾和革命任务三个方面，说明本章为什么判定辛亥革命仍然失败；其客观方面的根本原因是什么？”答案、criteria、Source、owner未改。独立直接回读确认现题面与检查匹配，blocker关闭。

### 作者构造回答与独立文本攻击结果

32题标准答案逐题对Source回读；构造反例覆盖漏列表（维新类别、四类代表、精神五标签）、反转关系/配对（人物战争、政府性质、两起义旗帜）、帽子错配（兴中会/同盟会、研究会/早期党组织/一大）、漏条件（辛亥客观原因双条件、长征直接原因原地不可扭转）、时间后增项提前（新三民主义）、全称扩大（所有古代战争/全部政策满足人民）、cue丢失限定、题面少问却多扣。完整保义释义与允许换序不因句式不同被判错；未问的附加内容不扣分。

维新“六活动类别”与“指定四类全部代表”、一大时地与1920早期组织、李大钊两组作品与未核系统传播正文的范围均明确；32题未发现同题面不同权威答案的文本碰撞。独立最终审读未见剩余实质content blocking；这是有界文本审读，不是程序去重/Runtime、图像或学习有效性PASS。

### 未关闭项和Source请求

剩余精记按原C落点逐项限制，未以32的数量宣称五章全部精记完成：C01 K05两任务/关系缺续行，条约/两半六表现/侵略/林魏比较表与引文待页图；C02太平时间图/两纲领/洋务代表性质表/百日维新和局限完整续行未核；C03旧三民主义、约法、六意义/护国护法、主观三不足及比较表待完整来源；C04五四后段主力中心/精神、建党精神/三新、二三四大/工农运动/失败原因教训完整续行与表未核；C05八七/建军三位置/道路作品与土地政策表/三左倾五表现/两次会师完整续行待核。它们为itemBLOCKED，不能用现有教案倒填本轮Source核验。必要页集中于C01 PDF5–10、C02 PDF11–17、C03 PDF19–24、C04 PDF25–33、C05 PDF34–40；只需在原Source读取任务按这些节点补必要原文/表图，无须逐项另开Work。所有红字题目答案仍未核，本批不制作答案钥匙。

C05 K07-N01-TIP01会议/报告归属争议仍沿既有正文外部证据区分，不随三组文章题准入日期地点。Source verification字段、旧章节概览、LEG历史材料不能作为新目标全面核验。基本首轮S/K/L/P/R/E PASS保留；补充整合仍未接受；main/adoption、Website/P6、真实U分别未完成。32作者目标后续还需原owner落地、内容签名、真实旧新catalog与projection/计划/揭示/历史回传验证，未运行或无法访问的链路不得报PASS。



## 2026-10-05 P5：C06–C10实质备课与精记作者候选

### 基准、复用与最小write-set

本批从实际PR1151 head 6e7f01f699625dd375b2313f31ed2befd63b4b83继续；GET refs/heads/main核b43f5712fbc3b0e6d459e9f69ad75cfaa3835706。C06–10的chapter与Source blob在两处逐一相同；Learning/Interaction/Content Semantics三合同blob与前批fresh-main一致，复用必要条款，不重开全链。C01–05六文件冻结保存，不再次审读其已闭合文字或改旧polmem-b3d1b517。

本批目录fresh核只有C01–05长brief，后五章原有成熟chapter模型/NU/概要，均无content_support.active_precision或对应memory sidecar。新增ch06–10.brief.md和延伸本review；原chapter/Source/NU/投影/代码均不变。原subject-model后半仍是原模型概览，其“完整Source未读完”的界限继续成立，故无需重写总模型或制造第二条主线。

### 实际准备了什么

五章均有可直接使用的连续教师正文、固定母模型/原timeline定位、阶段拥有范围与next、必要就地边界、有意易混回看及原节点压缩。C06/C07/C08各T0–T5，C09/C10各五个展开stage再接易混/压缩/精记；这些只是教学路由，不改变正式NU或Runtime状态。

- C06保留S01–S05与九节点：从民族危机、联合抗日、两大战场，到持久/根据地/组织能力与胜利原因。原表图和持久战四特点完整论证仍itemBLOCKED，不能以九节点存在掩盖依赖细节不足。
- C07保留S01–S04与八节点：和平与准备、军事进程、土地群众/国统区运动、民主党派选择、决战与新国家筹备。进攻术语表、土地政策细则和国家制度完整条目未猜补。
- C08保留S01–S04与八节点：成立巩固、过渡、一化三改、制度建立与建设探索、成就曲折。农业清楚文字有实质解释；工商业跨行表、八大精确矛盾和曲折详细史实不凭常识补写。
- C09保留两NU与八节点。stage-04回收十二/十三大真实1982/1987事件，明确原索引位于南方谈话之后不是它们实际发生在1992之后。讨论、讲话、全会、历史决议、改革实践与理论认识不同作用不混。
- C10保留唯一正式章NU与六节点，会议只服务历史长线，不另造会议课程。全篇把POL27-CF历史版次叙述与2026当期口径分开；十四五概括不当2026已核最新成果，2035目标、截断中心任务、社会矛盾表格依赖项保持itemBLOCKED。

本轮完整新exact作者题48组（C06 10、C07 10、C08 11、C09 12、C10 5）。每组有具体prompt、权威答案、必要checking、答后cue或明确不设缩词、Source/edition/页码/ordered refs及原NU/解释前提。题数只记录实际产物，不是配额或五章全覆盖证明。C10题目均作本版历史归属，不形成当前政治政策答题库。

所有48组继续PENDING_REVIEW。拟落位原chapter.content_support.active_precision，原consumer groupCandidate(PRECISION)按chapter/NU/name/ordered refs确定身份；本批尚未接入、生成polmem ID、计算reviewed-target digest、写成对准入记录或建立plan。brief不会被现有loader直接枚举，所以不能称现在可选。没有新registry或sidecar，只是原brief内的待接入作者内容。

### 实际作者与独立文本审读

作者读完五份成熟chapter及五个Source shard的全部现存original_text_span，逐段写实质解释并按覆盖、连续、同模型压缩三遍回读，逐48题核Source和条件。C09 Source为56节点、C10为21节点；这些计数不代表完整原教材，许多节点仅有标题或首行。原Source Markdown路径在固定head返回404；没有假称读过它的全部续段，也未使用原PDF像素或红答案。

独立reviewer实际读五章候选全文、五份Source现存文字、原spine/NU及48题全部prompt/answer/check/cue/ref，然后只回读已修的局部。发现的真实问题及最小修复如下，未以格式计数充当内容通过：

1. C06覆盖声称“K08–14→C”却漏K10大后方实际落点；洛川路线、平型关/忻口、三坚持三反对等清楚节点也未有去向。补必要短段和清楚文字；联合政府/文化工作、洛川全文等真正缺续行项目仍明确排除。未把可立即补课的遗漏伪装成设备缺源。
2. C06主观主义exact要求“颠倒认识实践/实际工作唯心主义”，正文原只讲“理论脱离实际”；独立自主三要求、胜利决定因素与C08合作化也有严格checking超出正文先修限定的情况。只在对应解释补认识关系、绝对领导/群众力量、爱国主义核心、逐批巩固与合作后技术装备，答案/原模型不改。
3. C07补清楚的老政协五类38人、党派成立时期分布、三种剩余军队处理方式名称；“两个务必”完整内容仍缺。五一口号Source请求误列PDF51–52，已改为K07-N03 PDF55／书54。
4. C08补制度确立评价、全国执政后首部党章及和平共处历史定位；人民生活/教育医疗主题改归Source K13，不冒称原chapter已具体列出。新经济政策短句虽可见但语境不足，明确未准备且不计usable范围，而不是从一句话猜政策含义。
5. C09讲话题面原先明示完整题名却把题名计作无提示恢复，实际泄露检索答案；改为按该考点宣言书作用识别未具名讲话，保留作者/场合/题名答案，并把作用节点补入refs。两宣言书目的地原称stage-04却无实质回收，现补配对解释。作者名带无本批Source年份“1981”已删；没有靠一般历史知识增加考点。
6. 作者实际cue攻击发现C08五原则的五问不能可靠恢复“是否增产”等成员；独立cue攻击另发现C06自然科学院和C09四组会议题cue漏必查年份。只补本Source已清楚给出的具体检索支点（含1940年8月、1982/1987、1992、1992/1997、2007）。不把答后提示当新无提示成功。
7. C10原报告22节点与实际21不符，已改实际计数；这仅修证据记录，不能由21推出全文或图像完整。

独立最终受影响段回读后，未发现仍未修复的Source支持答案漏成员、因果/时间倒置、帽子错配、题面/检查不一致、同prompt异答或原NU错误。构造错答检查包含：抗战两阶段主辅反转；顽固势力误等日本；整风三对象错配；协议当已落实；第二条战线当军队战区；三大战役“主要基本”全称扩大；提出/实际转移混同；农业组织性质错配；市场手段与制度性质混同；历史会议写入党章/确立指导思想动作偷换；阶段起点误答完成；C10本版概括升级今日结论。完整忠实释义及未被Source要求顺序的换序允许，未问题不额外扣分。这里全为人工文本审读，没有运行程序去重、fixture、签名或Runtime。

### 未关闭范围和最小Source请求

C06下册PDF41–51：侵略时间图/合作表，正面战场细节、持久四条件、争取中间/三三制/租息措施，K10全文、新民主主义理论/七大完整项、投降文书和抗战精神等续行/红答案。C07 PDF51–58：国际格局/谈判完整段、战略进攻术语及起点、土地跨期表、国统区运动、五一/声明及第三道路第三原因、国家筹备/共同纲领条目、胜利经验全项。C08 PDF59–67：初期外交/恢复/三反五反，工商业改造比例性质表、手工业组织、精确矛盾/三个主体/处理方针、曲折具体史实与成就完整范围。C09 PDF67–69：讨论/讲话/决议续行、农村制度全称、开放格局、基本路线三步走细则、南方谈话完整内容和三个有利于。C10 PDF69–70：主要矛盾原表、党建完整成员、百年成就意义正文、二十大中心任务全句、高变动当期断言与未来目标。

每章正文/Source落点已给精确节点和页码，可在原Source读取任务按必要页段一次批量补读。表格必须实际看完整行列/跨页，红答案无receipt不猜；清楚文字可用范围不因此整体作废。原subject-model及chapter的accepted base保持；新候选不等于五章完整图文准备通过。

本轮无本机/Work/远端写、无项目代码/测试/学习记录。云草稿的diff与Git blob字节核验只证明文件一致性；不能当consumer、main-to-Website、P6性能或U。48目标准入、依赖projection/consumer、main采用、实际Website与真实学习有效性仍分别未关闭。

## 2026-10-05｜十章 precision 原 owner 接入与有界准入绑定

复用本文件已有 C01–C05 的32组、C06–C08的31组、C09–C10的17组逐 Source 实质独立审读，以及 2026-10-05 17:56 UTC 的80/80最终字段／owner映射独立审读和 Source 资格追加判断。没有将映射一致性当作新 Source 真值，没有借尚未核清的原表、截断后文或2026当期状态批准扩展题目。80个最终 prompt／items／checking／cue／Source／NU 与已审稿不变，原 producer 已实际核对80个 ID；以下只将该80个 payload绑定为 REVIEWED、FIRST_ROUND_EXACT。此前 PENDING 描述是这一绑定前的准备状态。

C01 polmem-b3d1b517 原组全部字段与原 sha256:d858f2d06dbf9c53816fd7913b0dc93f1fbec4c0de1070a5e64f824f946539b9 完整保留，不重签、不计新增。原 consumer 使用的 reviewed-target revision 锁定具体语义，任何题面、答案、checking 或 Source／先修变化须重开相应审读，不能复用旧事件证明新目标。Library 有界输入 SHA256 3b6c8b711019729152133b205e3019142e14b0000f1d2f3b1f54e41373d9335c 只作输入追溯。新目标的绑定不是全科 Source 覆盖、学习有效性、Website／main 采用或真实 learner 证据；未创建 learner plan、Recall 或自动排程。

<a id="history-exact-owner-integration-20261005"></a>
| Target | Content status | reviewed target revision |
| --- | --- | --- |
| polmem-6613d10e | REVIEWED | sha256:26ebdab5afe8c524b1bd61e2a76c71f70fd2f063c1332179255aec7be7fc3f9d |
| polmem-b0289641 | REVIEWED | sha256:c3935ed0a2c6073938cf6471b186b3ce8ee0c1cbd9330b9efad294c0b14f88cd |
| polmem-e0cff2a5 | REVIEWED | sha256:0fceff4eaabfff96f0aa712d7055469b0a6652fa5b5682acba70e27e71bb300f |
| polmem-13428965 | REVIEWED | sha256:702accf8e11a1c06df89123165ec16213e43481b2c3b3052eeeb6d93681a9b50 |
| polmem-f575b901 | REVIEWED | sha256:7b5384468f9a679c6f30dc888e4d4a7f51a7b9a0ebf0c6ad7c60a45b0947420b |
| polmem-e31cf0d6 | REVIEWED | sha256:6985620e6cb429c407d29e5b90f0d5e18f1f94e78ccc8750bc44bfb08192e720 |
| polmem-17b943c0 | REVIEWED | sha256:cdd5f7b1ce410e29161de5168df8c74d63e8d87a802c31d2da68144c5c0bf21d |
| polmem-69c023e1 | REVIEWED | sha256:9ac2d1effc5ba75fa276993dfb8103c8f1886fa252038b1865655b2909a6e67c |
| polmem-83d31367 | REVIEWED | sha256:5589a0b639a2023cec8afc2f4427c77ee3970b66ab79b7117f2bd1e3f14d2f4c |
| polmem-7306a213 | REVIEWED | sha256:f7158f7413e4f743660246872826f11b300dd6336d2d99c639c185fda559df39 |
| polmem-4820497b | REVIEWED | sha256:7c9c11ebb7b649e231637bc6bb425e1ffdf1f139449e44dfe8d75f09f6350e5c |
| polmem-ce07bbb7 | REVIEWED | sha256:0d8a8294e673d40486e92fc05c755d2131e119bf1be4f03c999050ba32beade6 |
| polmem-259e8c55 | REVIEWED | sha256:22a422984371b33562dfdc3806db8374a7412d98f1d6764045d007245601ae5a |
| polmem-433c27fd | REVIEWED | sha256:20d0a77e06d9c8f4ea1eefd9b8fa0402310b5e48c28cd9f24be7bdcd48c04edc |
| polmem-4636aa41 | REVIEWED | sha256:9245bd65f76ae83c09dcd4f2d56d21d086c17384dc33ff94e171a945382ce3c6 |
| polmem-bccb4250 | REVIEWED | sha256:a44b942362016f91f2fc32dc6c928e9b4175460f66ebad89430eb12b8b50c854 |
| polmem-2572705e | REVIEWED | sha256:ea916089935a6045e50b5cb485cbc503e5be58043dea872a2007eee4c667fca3 |
| polmem-ef9d55d9 | REVIEWED | sha256:fa403d844dd7dff75d221707b5c7f9b6d71cb3dc673655f6f602b699d41a4300 |
| polmem-89b46d4e | REVIEWED | sha256:789e8c56554f15944a8d8286d2bae5cf01a7e30b4b5d8162d36c0e514f5a1c4b |
| polmem-04e67aab | REVIEWED | sha256:44a67de8b83d16d2ca978d517f08565028237d5e190579e8b5db38f9d937a77d |
| polmem-dcdbf242 | REVIEWED | sha256:0601cc81ef6b72a7cf01d0bb97df812151beb2287c64a65a2f7cdb74fbeec981 |
| polmem-fe5829b0 | REVIEWED | sha256:a9396d676a9495f8b0ade388f3f63d651c78b56967b03fca040736b29cad7581 |
| polmem-f7d1b372 | REVIEWED | sha256:b9c912c068d6b6cac50f1ec2ab83af33f4008866c61173d7d6139c4f6466413e |
| polmem-68db152c | REVIEWED | sha256:04fffe507aaf062e240f84906e326baa1d9bff7280e7e91a84b09b29e9c938f3 |
| polmem-bce56cc6 | REVIEWED | sha256:6b376acb7d71c02e706e09aa1fdf5c151a1494bb1dc24babdc3c10dc3e7f4d29 |
| polmem-82b50e31 | REVIEWED | sha256:15357cc38a0ab3fe18f41e4e8f91dbfd657925a008ec71c1bb769860c467ad62 |
| polmem-16ee302f | REVIEWED | sha256:8774df7496102db95e8499956470087b4fe01ac3d8d2cfddad69b6ab63d09081 |
| polmem-d43163e4 | REVIEWED | sha256:c363b02a3a7344fa159eed17bcc0a321f20ff6eb585c4bc470f57e980dfec790 |
| polmem-5c3184cd | REVIEWED | sha256:386754d75113b88efe3225db0590077a83dad71e0e012b1e83d3450714f1bd0a |
| polmem-f431ccf4 | REVIEWED | sha256:c9a66d5283a9978f7c8ace384f07d697bb8a4d6809b7cd94c106b31a5ea63652 |
| polmem-69aed69e | REVIEWED | sha256:be45e1d0f74533938e1a1b2e5e25bc4993876d6e0db5b0b9582ec6452d9ea4ee |
| polmem-f77bb72b | REVIEWED | sha256:3eeb22e5fe7858587b6fd957d4ee32445b52050871cf687f0d422e7e79a7a6b2 |
| polmem-0cea627c | REVIEWED | sha256:84c7bed8c07e6346dbed22a359c5f595b30a15f5fe866738e620890f7cd49929 |
| polmem-a4d87eae | REVIEWED | sha256:7467fbaa46630e2a6922ce0c1df909f29faef16be98e43f1094f6c4f840f5b2f |
| polmem-dd9026c0 | REVIEWED | sha256:4a0db8f2695dcdab42db2e895553623d24d493cc35304426617df1450c3c177b |
| polmem-279edc14 | REVIEWED | sha256:0b9206432135d8d22cf0a7a294480e1918a16f4817e567c461c2515a6f63e634 |
| polmem-6fe998d0 | REVIEWED | sha256:151db577e9c3a8741274c663cbcb9fb9273872cb1e1850ae836edab9a80c9d11 |
| polmem-30256203 | REVIEWED | sha256:bca1ea596a91122375b6187d3c9842bf71ac67f97ccd4550d22d91c7c075c911 |
| polmem-a78ad3ea | REVIEWED | sha256:950166b21e3e9c217189e4b5b591a8905b3337c4cc03b06f3e55573793ee6b62 |
| polmem-89851741 | REVIEWED | sha256:d4824648caee0ff93ce899f99f99093e2e6b5ada136e8fd2ad710c0119b8d69f |
| polmem-c201636b | REVIEWED | sha256:1cba5984e9740460485dfd092a1584078824e9ce70c0468bd23ceda1090265d9 |
| polmem-b76de4f1 | REVIEWED | sha256:5685d54197236ce3c0874f6cc4103427c2edd9c39a641e1ccd894b9c4b9b0bce |
| polmem-2fc5cd04 | REVIEWED | sha256:7680ca12636a7f1028e084436eb506649b0769a79ddaa4e8adb4fb2ce7559603 |
| polmem-8b5eb443 | REVIEWED | sha256:12e3de7c4eff8f73bcdc27149ea082871df29f6127518ba3c102815ec2cbf5c4 |
| polmem-0ef434ad | REVIEWED | sha256:875abd113e040472909831eba3ffca5d95dc9aa587bc44a68e9b2671bf8661de |
| polmem-ec77d9d6 | REVIEWED | sha256:c3bb545acff096e5a5b7503732db745a938c75f612d40d7bb1dbe8f6f8ad1338 |
| polmem-033c0a43 | REVIEWED | sha256:7bec97f919849aafc2cb4a61c503f4f31700802a79690165e5bb88ba75a10ef1 |
| polmem-1ca9523c | REVIEWED | sha256:a3785e2488e363e36b36ea6de4fbb41ec602440d1b14b886ab24eef39ed397b4 |
| polmem-a130023c | REVIEWED | sha256:c0968a5cae6a72dfe435b30ad8507544dd2a01024e1f82d52da99e58504d0197 |
| polmem-2398d2ea | REVIEWED | sha256:b80171538a46142cd1a59e65e218ba75a3ce5186370aa8fdff7ee995c68619f7 |
| polmem-a92c47df | REVIEWED | sha256:395e08b44adc8d032530bc6f4af67ade9276bc05e51235e939aacbc3baca38fb |
| polmem-903c17d3 | REVIEWED | sha256:e3e96bbd59d89a37a49269a84698f3823a170eb58a29f39fded32e5e09ec31bf |
| polmem-69447cbd | REVIEWED | sha256:4cde8e18575b3b8d1acb4549d47ff50bbf0c3559b246d5ee8f42dd90d20abcb5 |
| polmem-059c197f | REVIEWED | sha256:66ce957e2915c93110964bb540eb44bf0c201e5691cc503849d1a7e6db8befc2 |
| polmem-8b24ac30 | REVIEWED | sha256:42714768efc3b0828faeddf662867ab66c4ae5a0c228a2504af3137b21b384fa |
| polmem-b5cb7e01 | REVIEWED | sha256:5423f3c139ec044c10bb7a7ae51c0665d86415d99a9151bb16d0d081e9179107 |
| polmem-9577b85b | REVIEWED | sha256:8fd9dee4ebe61bcc00b19c7e07e3c7fd70f8972a048bbbf83276492058222653 |
| polmem-31692db1 | REVIEWED | sha256:ad08153c519ef5672688aba0bf5d90e76497a49159bbcec5cdd234a3f291bc25 |
| polmem-d1f025c0 | REVIEWED | sha256:12f2da3dee45d7519b278f01c4483bce090c219286893918b9222189b6faacbc |
| polmem-44a640b2 | REVIEWED | sha256:02b5fbfed129a9be4615781a1a7591bc8c51cf170c34667e6237f00739e96a89 |
| polmem-825910b9 | REVIEWED | sha256:991fa1cb15193b6af43bcd45f1a0ed4282560802c4b69ddb9fd4afda9323f14b |
| polmem-0b012b31 | REVIEWED | sha256:8d1138442b26a0491a79b8ef040a2880996969e32de4952ba76f7ea787cc9d67 |
| polmem-1a5d32f7 | REVIEWED | sha256:bd60a4b3a2c935d6993ed8270c3442c8aa3e8a6de5fbc4f8919aa47c34494bb3 |
| polmem-df4d08f8 | REVIEWED | sha256:74a52513a6cef741a4c45ca0d82cf7a419faba27279f701f3684cf70697dd04e |
| polmem-c3231780 | REVIEWED | sha256:70effa13997fa80771605f6ff798216835727dfec76856ec9317e6d6100cb54c |
| polmem-11a2c4d4 | REVIEWED | sha256:251b5c51d908ef1e2a7f935a6e5cae8319021bc43024f346afe23550825df532 |
| polmem-a50d3d60 | REVIEWED | sha256:da56c85d2a900086100d02a2cda63c31f738ae482a10b6e3aeb044bea33ff13a |
| polmem-dadc6ac9 | REVIEWED | sha256:f71c53e106cd2ad76d50bb7675e171c302156c39ba7d00b5b08fa45ab4c225bb |
| polmem-a7259c9b | REVIEWED | sha256:a3fd64c12fae3377c7a98f51bcdfc45219e44d1811827b31a5cfd660ac56e5c3 |
| polmem-3e77d049 | REVIEWED | sha256:d5babf167bc31a2f0252cf6ee5bd623e1c969c74672a703daac9894edf3aa8f0 |
| polmem-f7a37200 | REVIEWED | sha256:29ebce5c5e8285cdc9be762149d43e80f54ece6c696b386ac5206c1cd99a9c56 |
| polmem-c854a241 | REVIEWED | sha256:44d384a9973f5c3e8e27f403dbeb7422576db5b40283d08941083b9dfb5aeaf2 |
| polmem-aee2d1f3 | REVIEWED | sha256:de2616cddcf2476fd911f841c84be49f051e409d80a8fb2bc02ca804093cf508 |
| polmem-231d176b | REVIEWED | sha256:abad45a981fadda91df191cc2491b0d6068f5c5874a69d3a8bd15848d04adede |
| polmem-b79609d6 | REVIEWED | sha256:ab713ccd07a1f1c100cf7affc7e737189407a5507f55026f36b3e937d99d30f1 |
| polmem-51a76c35 | REVIEWED | sha256:6a0958c54fd34e91cd03ec617cbe11a418293c37bd66ee03f6b1922dedbc227c |
| polmem-36a228a7 | REVIEWED | sha256:0e1370361bd6a12252e44e5790bbfd095b24c0e214e41e262f2034dd59169f49 |
| polmem-a8f17613 | REVIEWED | sha256:79c656f73b6f30fc3b0aa026dc8d28fcb56a98e0e0e5265699d7595d7dc230c7 |
| polmem-a0d6b1a0 | REVIEWED | sha256:2cd4090e7169181dcb054c34d643874ad8f2f3aa18fe238dbd12b29c2d079425 |
| polmem-062d61d4 | REVIEWED | sha256:a056ca154835d30025ed131de3abc74bb46a1e851f677b96ca7fb60a9b095994 |

本批原consumer的有界Node实测：加入候选但未绑定时，真实可选catalog保持332，91个本批目标被排除，16个旧projection witness实际报POLITICS_PROJECTION_SOURCE_REVISION_MISMATCH；绑定后catalog为423（politics-memory-36a885d0），原332对象逐值不变，本批史纲新增80、毛中特11可选，C00阻断。16章620条实际selector引用中史纲值全部不变；毛中特21个整precision组值变化、选中items数组不变。原guard、plan／snapshot、重放／supersession、篡改／stale、历史及Home Packet路径共91组隔离断言通过；现有repair-memory、memory-history-profile、cognitive-projection-assets校验通过。332条旧可选目标构造历史仍兼容，10条旧毛中特precision构造历史失效；C02 Source及C04答案修复保留ID但不沿用旧语义证据。所有计划、事件和Packet仅进程内Map；不是真实APPLIED、Recall或U。仅静态检查答案／checking／cue位于hidden reveal容器，不将Node代作Candidate／浏览器证据。最终Candidate／浏览器、main交付与P6仍未验证；无推送、合并或部署。

### 2026-10-05｜原producer的局部精记绑定

## 2026-10-05 18:06 reader有界Source补齐：独立追加delta

本增量以冻结81个typed对象为基准，保留原有80个新目标与旧polmem-b3d1b517全部字段/签名；只给History C01–C08追加14个不同检索范围的作者组，并局部补原brief正文和解除范围。不是重签原81，也不把同会议/同文章误当同一答题任务。结构预览可为95个对象；实际可选catalog未验证。

Source是原Mac reader task01a1071f-3c5a-7462-a3c1-d1c982d95001、turn01a10d34-e299-739a-9b55-d4205cc87bc9于父任务18:06 UTC收到的完整有界JSON。PDF SHA256 0de9c4c3a513d3fb131f9ff87acc44e7dd6da9e58f3917eb73ad3b8dea96adca，★27/POL27-CF-LOWER标签未额外作封面/当期版本认证。作者及独立reviewer读完整receipt，不冒称亲看原PDF。页7/57只有文字；页64只有旁注文字，原表止于63。可用像素范围为12、20、29、37、44、45、63；每组source_locator保存具体页、模态、行/范围和reader身份。

新范围分别为：C01两大任务及区别/联系；C02田亩方案实施边界、资政四方面/两纲领共性；C03旧三民主义配对、局限、地价三支；C04建党精神、三新及道路任务边界；C05两土地法产权递进、阶级/分配方法；C06四比较与两层箭头；C07两个务必；C08工商业实质/层级与三行分配名称。新14组仍PENDING_REVIEW，无新id/digest/签名，没有因像素完成自动准入。

独立反审关注真实列表与层级、地价三支、所有权/使用权、四比较但原编号①②、国家资本主义高级合并格及初级四例、未问题不扣分。作者删去C08题面未问的独立“统购统销”答案项，保留作混淆边界；独立review确认需补C05 cue的首法/首次立法两进步和C08 cue四成员，已局部同步JSON/brief/追加payload并回读。百分数25%/5%的基数、期间及四马各份额没有receipt内容支持，未进入本轮题面或评分要求。

C09三个有利于、C10社会主要矛盾比较仍itemBLOCKED：PDF69实际已看，前者只有名称，后者只有一条政治论断，原页并没有完整对照表及双方内容，也没有需接70页的表。本批不改其Source节点类型、不从知识补答案；“已看但无所需内容”不能标为已解除。

未运行原producer/guard、签名、projection、工程脚本或测试，未写原Source/题库/学习记录。原81若已被工程签署，必须仅追加14个对象并保留其最新旧组信息，不能用基于旧PENDING状态的预览整文件覆盖。后续仅在原PR授权范围验证和保存，不拆取consumer绕过已被拒绝的main push；main/Website/U分开。


本节追加绑定仅用于上述14个已独立审读的最终payload；原81个史纲对象／ID／状态／digest完整不变，不覆盖旧全章预览。原producer已实际得到14个新ID，并计算下表目标revision。前述PENDING为绑定前准备状态，只有下表范围改为REVIEWED、FIRST_ROUND_EXACT。

有界输入 Library SHA256 8e7c0eed7b50d4f243375023e6e4b9f03fc6483cd6c913e644cbaf90715a8115 仅用于追溯；准入绑定不产生learner计划、Recall、队列或自动SRS，不证明全科Source、教学效果、main／Website交付或P6。

<a id="history-source-delta-exact-20261005"></a>
| Target | Content status | reviewed target revision |
| --- | --- | --- |
| polmem-9167c06d | REVIEWED | sha256:45fceb221be7a80436bdd41c683845fc8df7162efcd28c83d917e8b299dedb05 |
| polmem-9aaeefb5 | REVIEWED | sha256:79dc5a9dc721f7e2866cb055850e82b13b5a65aba7916a0a2c945cac6b5e22e0 |
| polmem-3e733e14 | REVIEWED | sha256:f9851d209a7a921acd07b223af82370874ce5f178b54c74e074d71fc57a372b4 |
| polmem-d0fcbb6c | REVIEWED | sha256:7827df854d33b89a5642e4d94ba55bf7cb9b8f769450c1f2cb8678370f5e24b1 |
| polmem-b920ea4b | REVIEWED | sha256:122cef08a57635cec87946a1880bc88f088ae6ea6f8936125df7eadcd8562b81 |
| polmem-3d40eca6 | REVIEWED | sha256:df1211dc442daa16ef15b3cb0eea0c8302643208e0e333905a0c7a2030ac50a0 |
| polmem-1af92aa1 | REVIEWED | sha256:091a88e78d5fd2b6beee8a3af094fa6206e54c672550eadc8c3580117301d989 |
| polmem-7c265473 | REVIEWED | sha256:3c8aa48c6cfe707ca8303a293a1bc84b8444d93f9639ce65e93f27f3069b5d2a |
| polmem-0875671f | REVIEWED | sha256:b5d15bd713f4018f7d9d2b6862bcfa42479efab05cfab06b0a6246e4641d8f21 |
| polmem-70ecb702 | REVIEWED | sha256:cab79214bdceca93864ccc755ccb4fe656acfd124a2d232acd68a7f9276b929c |
| polmem-7b8cd49c | REVIEWED | sha256:195b45a29df980354f9bc475f7c31447677a88ec9e165b9b689d951486671570 |
| polmem-9797ed6f | REVIEWED | sha256:745fe6bee3c0fa67c23bfb8d4ef5315bc79f0531d8caeda07d76fd35415d1fff |
| polmem-976351ac | REVIEWED | sha256:9d5e2fe78b602d28cff8f89625edb94cf9eebc7bb43d5462315e8393b67d3e36 |
| polmem-1dff5d6c | REVIEWED | sha256:0802510267eeafcece9345cee5876da3311d7323fadae5b499fa6201706567a1 |

本轮实际consumer有界证明：本批14个史纲追加目标及同一consumer两批目标经过原producer与review guard；catalog423→454（politics-memory-cb72e2b6），原423对象逐值不变，Xi仅17可选／51保持PENDING。26章strict compiler及1236条实际selector引用已验证，48处值变化；manifest除最终source.blob_sha无改动。96组隔离Node断言及现有memory-history-profile、repair-memory、cognitive-projection-assets校验通过。423条旧可选目标构造历史兼容，63条旧Xi构造历史失效；C17旧碎词不证明完整命题。

实际Candidate 4322／Chrome使用全新测试上下文与Candidate专用learner/control根，关闭relay，使用既有studyTimer的Asia/Shanghai学习日及真实时钟。两批91＋31＝122目标逐题检查原题面、reveal前不见answer/check/cue、reveal后完整原答案/check/cue；原Native Control浏览器入口实际应用，匹配APPLIED回执已写测试专用源，记录122条合成FUZZY Recall，刷新恢复、幂等不隐藏已揭示答案、冲突与supersession，以及blocked ID／旧catalog revision／snapshot篡改不产生额外Recall均检查；644项browser检查通过。原Home Packet assembler在浏览器用真实隔离storage及SSR practice/memory catalog读回122条事件，私有bridge在新上下文亦恢复122条。该证明不是真实learner U、掌握或P6。

原失败与本次窄收尾：首次build报 HOME_XIZONG_DEPENDENCY_SYMLINK:static-web/node_modules/marked，Home原复制学习包按钮报 HOME_XIZONG_PROJECTION_HTTP_500。实际owner为 scripts/currentDependencies.mjs／kianos-candidate-runtime.mjs 的隔离依赖准备与 src/lib/homeXizongProjection.mjs 的未改guard。Mac已将可信既有安装 marked 15.0.12 实体化到本隔离checkout，原symlink保留；原Stable package-lock条目、相同依赖manifest及16个文件字节/hash回执已核，Stable无写入，未新安装、未降低symlink／Source guard或改业务程序。修复后原必要build成功：1015 pages，20.38s，详见本机 build-dependency-repaired.log。

2026-10-06窄按钮回读：标准Candidate 4322在新专用runtime启动，原临时测试根已清理；全新Chrome上下文只恢复既有122条fixture事件，原Home面板实际展开／按钮点击，经原guarded Home loader成功，完整序列化Packet已解析；122条Memory事件逐值一致、current_compatible_events=122。按钮显示“已复制；西综、英语今天还没有可带走的学习记录。”；clipboard为上下文内存截获，无真实剪贴板读写。Packet为701706字节，SHA256 05a4d356834688a73bef8784edc3dee75a4ceb131808e2b89bfa3caa824d10cf。首次实际按钮2849ms；复核schema拼写后同进程重读297ms，四条DOMContentLoaded：Memory457ms／Home508ms／Mao C04 395ms／Xi C17 58ms。只重跑失败按钮及四路径，既有644检查不重做；这是dev进程单次观测，不是四路冷启动或全站性能验收。relay关闭、真实learner零读写、Candidate已停止。无push／merge／deploy；main／正式Website／P6仍BLOCKED／未验。大型Packet、截图及窄回执留本机，紧凑摘要写入原Library结果item。

大型逐项Node、browser事件、Packet、截图与构建日志保留在Mac xi-history-consumer-results目录；最终传输包只含需写回文件及小型摘要。前批完整结果Library libfile_b61d8f0aeb508191b86a533b7f56fe2e（SHA256 8b0660f9ce7e3fe8fdf5966740f4113bf683617d68e819ff4fbc2d4f686e5b0f）是before指针，本批输入SHA256 8e7c0eed7b50d4f243375023e6e4b9f03fc6483cd6c913e644cbaf90715a8115；两个输入均非Source PDF。


<a id="politics-adoption-integration-20261006"></a>
### 2026-10-06 adoption integration checkpoint

Kian's 09:27 Asia/Shanghai “政治采用” authorization is later than the earlier default-branch denial and cancelled inline-tree save. The reviewed72-file payload is durably saved on the original PR #1151 at935f4424d1b0d72e94d44d207ebb50fd5f40c7d7 and remote-ref/72-blob readback passed. No second branch, force push or direct use of681b123 occurred. The old checkout and681 local result are preserved.

Integration with actual main8145967ad595a04058ea76894a5a48de88648f33 keeps current Reading/IPA/Lexical/Current guards and Marxism C01's fixed ten-node spine. The only merge conflict was the C01 derived witness; both geometries were identical and the witness was recomputed from actual merged chapter bytes. The complete integrated454-target catalog is exactly equal to the already verified catalogpolitics-memory-cb72e2b6; subsequent19 Source targets remain PENDING. Projection assets, producer/review guard, history-profile, shared-control-three-subjects, native private checkpoint/Home Packet foundation and guarded Home transport invalidation/counterexamples passed in isolated fixtures. Existing substantive review and644 browser checks are reused, not claimed as rerun.

The final integrated Candidate uses standard4322 with fully materialized compatible trusted dependencies. Its fresh Chrome context observed original Native APPLIED→same-page first Recall29ms, exact authored prompt/answer/checking and pre-reveal hiding. Real Home panel/copy button exported a complete702516-byte Packet with122 prior fixture events byte-equivalent/current-compatible; clipboard was captured in context memory, production learner/control/relay were not accessed. Guarded first Packet click3712ms; four DOMContentLoaded paths were Memory939ms/Home2016ms/Mao C04 448ms/Xi C17 72ms. These are bounded dev observations, not all-route cold-start or human learning proof. Temporary process watcher failed in the restricted host environment and succeeded at the existing authorized Mac execution boundary; the test locator was corrected to read the real SSR catalog because the native client removes its JSON script after initialization. No product defect or guard relaxation was inferred from those test/environment failures.

This checkpoint authorizes no Source promotion. Original first-round PASS is preserved; main adoption/current-head CI and actual managed Website readback are still separate required steps. Real U/mastery remains untested. Final main/served versions and delivery evidence will be recorded after those steps rather than fabricated here.


## 2026-10-08｜C04–C06有界修正与来源缺口

内容保存点：4a202da28e78ee98c4b7d2003b60247ef00751b2（PR #1289候选，未合并）。C04修旧民主主义失败/新文化的假先后、组织恢复题泄露地点及失败教训伪完整计数；C05修民族危机与长征的交叠关系及旧C整表负担；C06直接修压缩主链为“统一战线酝酿推动→1937七七全民族抗战开始、九月正式形成”，同步三处，不能仅靠旁注纠正。原模型其余关系保留，31组content_support完整原始字节不变。作者回放及独立修后窄核通过；不是整科第二轮或真人学习证据。

实际新读：C04/C05/C06现存全部Source original_text_span，blob依次ffc173655b56e56db4ba3f12088e5f141b201be3、993a7ce72ae4fceda04f3fcacc2ed2dba2d592f8、25465dcf7bcebf2eca127839d9f85f644f31ac73；Leg27上册PDF173–192、下册6–11相关段、17–20、23–24、26–28、77–78。C04/C05完整母文旧审读仅按本owner已存版本/范围复用，未新取母文bytes或PDF像素。C06 K13-N05/TBL01确有整风结束、七大路线与三大作风连续文字，补回Core理解/识别，不新增整段默写。

C06完整Source仍PARTIAL：母文路径不可达，PDF41时间图、42–43谈判/合作原文、43–44正面战场续段、44洛川条目、46–47中间条件/皖南/租息生产/K10、48新民主主义理论及图像、50–51投降完整句/抗战精神意义续段仍缺。有限Leg支持不冒充CF全文；未核原图/题键保持未核。具体缺口已在ch06.brief原位置保留，局部修复不等于本章完整收口。无Website/Runtime/私人记录更改。


## 2026-10-08｜C07–C09有据内容修正

六文件保存点9d1a293a8deb501ada770ddda80498a61096fc46，候选未合并。C07恢复战略决战“基本摧毁”限定并补清人民民主专政理论、七届二中决议与共同纲领的关系。C08直接修JSON timeline、首屏主链及所有相关入口，明确1956过渡后期的《论十大关系》/八大探索与改造收尾交叠，不能保留错链再靠旁注纠正。C09撤销“完整三个有利于见Leg96”的错误出处：已读上册96/下册15仅支持名称、用途及生产力首要标准，完整成员仍缺源。真实可读农村改革限定解释与未取得CF全文分开。

作者及独立窄核实读当前CF分片、对应Leg27和精确历史范围；36组原精记完整payload、身份准入、Source bindings与NU不变。独立修后六文件diff获有限ACCEPT。三章完整CF母文/必要原图仍未取得，Source均PARTIAL；具体缺段保留原brief，不能把局部修复算整章或整科通过。未新增必背要求，未做Website/Runtime/真实学习验证。


## 2026-10-08｜C10有界内容修正

两文件保存点c06b6ec0e7bb7605b835903d693af51429384156，候选未合并。原六节点及五组精记身份保留；区分新时代新历史方位与社会主义初级阶段/世界最大发展中国家两个未变。Leg27 PDF104–106/177同事实支持的主要矛盾、中心任务和百年意义在原Core可读，不再被旧CF缺文说明一律阻断，也不新增列全任务。历史PENDING说明不再覆盖现行五组REVIEWED。整科接口同步C08的1956交叠关系；未增加未经验证的hand-off锚点。作者/独立有界审读及root定点复核通过，五组完整payload/NU/Source绑定不变。

本次直接核现存CF节点及对应Leg文本，仍不等于CF全部原图/全文完成。刚取得的同SHA乘风下册原PDF局部摘录将用于补核具体录入缺口，未核页/字段不得提前升级。模拟是内容路径检查，不是Kian真实学习或网站交付证据。
