<!-- kianos:lecture-replacement-candidate {"status":"SELF_CANDIDATE_PENDING_CONTENT_ADMISSION","medical_authority":false,"lane":"LECTURE_REPLACEMENT","authoring_base":"bc014aeee3c7ca1be91a180a41336f03d14b3930","canonical_path":"content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/g-g1-g5/生化_G3_转录RNA加工与翻译_学习阅读版_v1_最终执行版.md","authoring_canonical_sha256":"97edf74c5cf706cac03e3203dd6840cb50fb85f31c989fb6776629431e64258d","draft_canonical_sha256":"97edf74c5cf706cac03e3203dd6840cb50fb85f31c989fb6776629431e64258d","policy_dependency_pr":1148,"policy_dependency_commit":"7a276ea16693eaf7c8a36be1080341f47d2c115a","canonical_core_injection":false,"body_revision":"r2.1-portable-h1-reference-20261004","view":"teaching","source_stage_original_sha256":"821d410da2296d488bd89dac54f5dfc8f0ec8183243a1bb339f6007fff2d0db3"} -->

# G3｜一段DNA怎样成为可用RNA，再成为有功能和去向的蛋白

信息要经过转录、加工、翻译和成熟，每一步解决不同问题：选哪个模板、保留哪段RNA、装哪种氨基酸，以及成品送到哪里。先沿执行链走，再在每个交接处区分原核与真核，才能正确定位阻断和错误。

## 选择局部模板，并不等于复制整条DNA

某基因只取一条DNA链局部作模板，聚合酶3′→5′读，RNA5′→3′长；RNA除U替T，与编码链同向同序。不同基因可交替选择两链，单链不是永久模板。NTP加入后保留NMP、释放PPi；RNApol能连接最初两个NTP，不需引物，课程口径缺3′→5′外切校对、错误率高于复制。

原核全酶α₂ββ′ωσ中，α负责特异/组装接口，β催化磷酸二酯键且为利福平靶点，β′结合DNA并开局部双链，ω稳定β′并助招σ，σ识别启动子。启动子在起始上游，-35 TTGACA、-10 TATAAT/Pribnow与+1起点各有身份。

σ识别-35→闭合复合物→-10附近开链形成开放复合物→β催化首键→RNA增长、逃离启动子。首核苷酸保留三磷酸，约<10nt反复失败释放为流产式起始/课程校对接口；起始后σ离，核心α₂ββ′ω继续延长。启动子序列不是+1本身。

<!-- lr-kp {"kp_id": "dme-g03-kp01", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/g-g1-g5/生化_G3_转录RNA加工与翻译_学习阅读版_v1_最终执行版.md"} -->
> 转录的模板、编码链与反应体系〔模板/编码链3关系｜原料｜方向｜引物？｜校对？〕

<!-- lr-kp {"kp_id": "dme-g03-kp02", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/g-g1-g5/生化_G3_转录RNA加工与翻译_学习阅读版_v1_最终执行版.md"} -->
> 原核RNA聚合酶与启动子：谁决定从哪里开始〔RNA聚合酶组成/分工｜启动子3位点｜谁识别起始｜起始后谁离开〕

<!-- lr-kp {"kp_id": "dme-g03-kp03", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/g-g1-g5/生化_G3_转录RNA加工与翻译_学习阅读版_v1_最终执行版.md"} -->
> 原核转录起始：闭合—开放—首键—启动子逃逸〔起始4步｜闭/开差别｜首核苷酸磷酸｜流产式界线〕

核心酶推动转录泡，走过后DNA重新配对。原核无核膜，未完成mRNA可被多核糖体结合，形成羽毛状边转边译。ρ依赖终止看RNA poly-C富集结合/追赶，解旋酶样作用拆RNA—DNA杂化区；内在终止则GC反向重复形成RNA发夹加poly-U，使复合物解离。DNA终止子、mRNA终止密码、翻译释放因子是不同层，不能互代。

真核先按产物分工：核仁Pol I做45S前体→18S/5.8S/28S，不敏感鹅膏蕈碱；核基质Pol II做hnRNA/mRNA及部分非编码RNA，最敏感；核内Pol III做tRNA、5S及部分snRNA，中度敏感。5S不来自45S。

<!-- lr-kp {"kp_id": "dme-g03-kp04", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/g-g1-g5/生化_G3_转录RNA加工与翻译_学习阅读版_v1_最终执行版.md"} -->
> 原核延长与终止：转录泡、羽毛状与两类终止〔延长3象｜ρ终止2步｜内在终止2结构｜原核为何边转边译〕

<!-- lr-kp {"kp_id": "dme-g03-kp05", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/g-g1-g5/生化_G3_转录RNA加工与翻译_学习阅读版_v1_最终执行版.md"} -->
> 真核三类RNA聚合酶：位置、产物与毒物敏感性〔I/II/III｜位置｜3组产物｜鹅膏蕈碱敏感顺序〕

## 加工改变成熟度，剪接/编辑改变保留的信息

典型mRNA由加帽酶及甲基转移酶形成7-甲基鸟苷帽，以特殊5′—5′三磷酸连接，SAM供甲基，保护且助起始。3′端DNA编码信号AATAAA，对应RNA AAUAAA；切割后加polyA，增加稳定、助核输出/翻译，并与尾结合蛋白抗降解。TATA为转录入口，AAUAAA为加尾信号。“转录后加工”是类别语言，不表示所有加工必须等整条转录完毕；P133还示加尾与终止衔接。

snRNA+蛋白形成snRNP/剪接体，认5′GU/3′AG，经两次转酯、套索化去内含子并连外显子。选择性剪接改变组合，一个基因可有不同成品；剪接错误接地中海贫血。RNA编辑则改保留编码信息，apoB100/48是接口，不能当作另一种单纯“删内含子”。

<!-- lr-kp {"kp_id": "dme-g03-kp06", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/g-g1-g5/生化_G3_转录RNA加工与翻译_学习阅读版_v1_最终执行版.md"} -->
> 真核mRNA加帽与加尾：先保护，再准备翻译〔帽3点｜尾信号｜尾3作用｜DNA/RNA信号差1字母〕

<!-- lr-kp {"kp_id": "dme-g03-kp07", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/g-g1-g5/生化_G3_转录RNA加工与翻译_学习阅读版_v1_最终执行版.md"} -->
> 剪接、选择性剪接与RNA编辑：一个前体怎样形成不同成品〔剪接体｜剪接边界信号｜2次反应/套索｜选择性剪接 vs RNA编辑〕

tRNA前体先由RNase P等修5′、另修3′，加CCA、化学修饰稀有碱基，必要时剪内含子；45S在核仁经snoRNP加工，5S独立。组I/II内含子可由RNA自身催化、不需蛋白，切除产物偏线状/套索状识别。成品也须被监控：正常mRNA可沿脱腺苷酸化—脱帽—外切酶路线降解；也可不依赖脱腺苷酸化，直接脱帽后由5′→3′核酸外切酶降解；另有内切酶介导的降解。这三类路线处理正常转录物；P136异常监控列NMD、NSD、NGD、REMD，降低截短或停滞相关有害产物。详细全名/酶名单可后置，但“已转录”不等于RNA永久可用。

<!-- lr-kp {"kp_id": "dme-g03-kp08", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/g-g1-g5/生化_G3_转录RNA加工与翻译_学习阅读版_v1_最终执行版.md"} -->
> tRNA、rRNA加工与mRNA质量监控〔tRNA 4步｜45S→3个｜自剪2型｜正常降解3路｜异常4监控〕

## 解码要先装对氨基酸，再按位置推进

翻译用编码氨基酸、mRNA、氨酰tRNA、核糖体A/P/E、蛋白因子和ATP/GTP。课程20+1中的硒代半胱氨酸可在特定情形由UGA编码，见GSH过氧化物酶、甲状腺素脱碘酶。aaRS认氨基酸和tRNA、装载并水解错酯；正确反密码不能弥补错误装载。

原核S-D AGGAGG在AUG上游，与16S配对定位小亚基。通常新氨酰tRNA进A、肽酰tRNA在P、空载从E出；起始tRNA直接P，是例外。多聚核糖体提高同一mRNA总产量，未缩短每条肽自己合成时间。

能量先分账：aa活化ATP→AMP为两高能键；进位1GTP，成肽在课程口径不直接耗，转位1GTP，故每肽键至少四高能键。GTP还参与起始/终止，不能把“成肽不直接耗”理解为翻译无能量代价。

<!-- lr-kp {"kp_id": "dme-g03-kp09", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/g-g1-g5/生化_G3_转录RNA加工与翻译_学习阅读版_v1_最终执行版.md"} -->
> 翻译体系：20+1氨基酸、mRNA、tRNA与核糖体〔翻译原料/模板/适配器/场所｜特殊AA｜定位信号｜tRNA准确性｜A/P/E〕

<!-- lr-kp {"kp_id": "dme-g03-kp10", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/g-g1-g5/生化_G3_转录RNA加工与翻译_学习阅读版_v1_最终执行版.md"} -->
> 氨基酰-tRNA合成酶与翻译能量账〔aaRS做什么｜ATP耗到哪｜翻译各阶段耗能｜每个肽键最低能量账〕

原核起始：30S分开，IF3防过早合大亚基，IF1占A；S-D定位AUG到P，IF2-GTP带fMet-tRNA进P，因子释放、50S结合为70S。真核80S、Met起始、更多eIF，先小亚基与起始tRNA组复合物，再找mRNA，由帽/尾/eIF4接口定位；原核先mRNA再起始tRNA。真核核内转录加工和胞质翻译分开，完整扫描机制不扩写。

<!-- lr-kp {"kp_id": "dme-g03-kp11", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/g-g1-g5/生化_G3_转录RNA加工与翻译_学习阅读版_v1_最终执行版.md"} -->
> 原核翻译起始：小亚基怎样找到AUG并把起始tRNA放进P位〔起始因子3｜小亚基找AUG靠什么｜起始tRNA身份｜先落哪个位点｜复合物顺序〕

<!-- lr-kp {"kp_id": "dme-g03-kp13", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/g-g1-g5/生化_G3_转录RNA加工与翻译_学习阅读版_v1_最终执行版.md"} -->
> 原核 vs 真核翻译起始〔原核 vs 真核起始：核糖体｜起始AA｜因子｜mRNA识别｜结合顺序〕

延长为EF-Tu送氨酰tRNA进A→23S rRNA转肽酶将P肽转A→EF-G移一个密码子，肽酰A→P、空载P→E出。肽N→C长。EF-Ts调EF-Tu，IF2、EF-Tu、RF3以及EF-G均有GTP酶活性。终止RF1认UAA/UAG，RF2认UAA/UGA，使转肽酶转酯酶、切肽酰tRNA酯键；RF3助因子脱离、复位。终止密码不由携氨基酸tRNA来完成常规释放。

P149 2018N25官方单选C/EF-Tu，而选项B/EF-G也具有GTP酶活性；当前已审Explanation保留NO_SAFE_MATCH。依课程既有机制分工，不为单选口径否认EF-G，也不改官方答案、解除未匹配或重审关系。

<!-- lr-kp {"kp_id": "dme-g03-kp12", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/g-g1-g5/生化_G3_转录RNA加工与翻译_学习阅读版_v1_最终执行版.md"} -->
> 延长与终止：进位—成肽—转位—释放〔延长3步｜A/P/E位移｜肽链生长方向｜终止密码识别｜释放因子分工〕

## 新生链离开后，成熟与靶向解决两种问题

蛋白水解可去起始残基/信号肽、激活酶原、前体分成活性肽；甲基、乙酰、羟、糖基、磷酸等修饰改变残基；二硫键稳构象；Hsp70、伴侣蛋白、二硫键异构酶、肽脯氨酰异构酶提供折叠环境；亚基及辅基装配完成成品。初生序列由密码决定，成熟一级描述仍可被切割、化学修饰、二硫键改变；折叠/亚基组装则作用空间。羟Pro/羟Lys翻译后形成，不能与特定直接编码的硒代半胱氨酸混同。

<!-- lr-kp {"kp_id": "dme-g03-kp14", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/g-g1-g5/生化_G3_转录RNA加工与翻译_学习阅读版_v1_最终执行版.md"} -->
> 翻译后加工与折叠：新生肽链怎样成为有功能蛋白〔5类加工｜化学修饰7字｜二硫键｜伴侣3类｜亚基/辅基〕

分泌/跨膜蛋白典型N端信号肽，ER驻留蛋白C端滞留信号，核蛋白核定位序列位置不固定。游离核糖体先做信号肽→scRNA+蛋白构成SRP识别→对接ER SRP受体→肽入ER继续合成→高尔基加工分选。定位失败不等于密码子读错。

干扰则沿机器定位：起始复合物、原核大亚基成肽、小亚基读码/进位/转位、真核大亚基或eEF2、EF-Tu/EF-G，以及干扰素经eIF2/病毒mRNA降解接口。靶向与药物干扰只共享翻译机器背景，没有相互导致的伪因果链；完整药名后置。

<!-- lr-kp {"kp_id": "dme-g03-kp15", "owner": "content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/g-g1-g5/生化_G3_转录RNA加工与翻译_学习阅读版_v1_最终执行版.md"} -->
> 蛋白靶向与翻译干扰：做出来以后送到哪里，药物在哪一层截断〔3类分拣信号｜SRP 5步｜干扰5层｜原/真核边界〕

## 当前来源与边界

当前27 BIO27-S18 P128–P138、S19 P139–P150保留25道附题及新增2025N24、2025N120–121，既有学习闭合不由阅读本稿产生。转录泡、套索、A/P/E位及SRP空间需原图时保持Source边界；2018N25已有冲突如上保留。因子、监控、修饰、药物精确长表按已有Learning分时处理，正文主机制不等待全表记完。
