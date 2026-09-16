#!/usr/bin/env python3
"""Frozen declarative delta manifest for Issue #234 / o4375-o4874.

This is implementation data for the already-landed Sol reconciliation.  It does
not create new semantic authority.  Exact stable reactivations explicitly named
in Production/Audit are additionally compiled from manifest-candidates at run
 time; the tables below cover the non-trivial definition/Form/construction/
Relation/new-branch work.
"""
from __future__ import annotations

# Existing stable-sense definition / presentation updates.
# (ordinal, sense_id, definition_cn, definition_en, optional level, optional governing pattern)
DEFINITION_UPDATES = [
    (4440,"sense:silicon:7232b13458ef500c","硅；化学元素、类金属，广泛用于半导体材料","silicon: the chemical element/metalloid widely used in semiconductor materials",None,None),
    (4452,"sense:since:f7cfc45d7c3f5ac7","自某一参照时间起；从……以后","from a stated reference time onward",None,None),
    (4452,"sense:since:661ac5b76e3c548b","自那以后；从某一参照时间起到后来/现在","since then; from a reference time onward to a later point or the present",None,None),
    (4499,"sense:slogan:8880396a199a56c9","口号；用于表达理念或宣传产品、活动、组织、政治主张等的简短醒目语句","a short memorable phrase used to express an idea or promote a product, campaign, organization, or political cause","L1",None),
    (4503,"sense:slum:e64d2adac622572e","（非正式，常带诙谐/自嘲）过较平常或不那么舒适的生活；将就着过","informal, often jocular or self-deprecating: to live or spend time in simpler or less comfortable conditions than one is used to","L2",None),
    (4511,"sense:smog:dfda4bd89cd8525f","烟雾型空气污染；由污染物造成的浑浊、有害空气，历史上常与烟和雾有关，也包括光化学烟雾","polluted, hazy air caused by atmospheric pollutants; historically associated with smoke and fog and also including photochemical smog","L1",None),
    (4512,"sense:smoke:10b3f44e988759e5","烟；燃烧产生并悬浮在空气中的颗粒及伴随的气体/蒸气","smoke: airborne particles together with gases or vapours produced by burning","L1",None),
    (4514,"sense:smuggle:1c88f9bd58825be2","走私；秘密或非法地运送货物或人员越过或穿过某种边界","to move goods or people secretly or illegally across or within a boundary; customs evasion is one subtype","L1",None),
    (4534,"sense:socialism:43016e8d2da851b1","社会主义理论：主张主要生产资料在相当程度上由社会、公众或集体所有或控制的政治/经济理论；具体制度形式可不同","political or economic theories advocating substantial social, public, or collective ownership or control of major means of production; institutional forms vary","L1",None),
    (4534,"sense:socialism:3d1cd8f265f55f01","社会主义经济制度：主要生产性资源在相当程度上由社会、公众或集体所有或控制；具体制度安排可不同","an economic system in which major productive resources are substantially socially, publicly, or collectively owned or controlled; institutional arrangements vary","L1",None),
    (4546,"sense:solemn:ac3bbda1b6565bca","严肃的；庄重的；正式而郑重的；气氛沉重的","serious, formal, dignified, or grave in manner, character, or occasion","L1",None),
    (4565,"sense:soon:cea90a8cb8d65408","不久；相对于当前或叙事参照时间在较短时间之后","after a short time relative to the current or narrative reference point; shortly","L1",None),
    (4567,"sense:sophomore:32287e7128d45eb0","（美国教育体系）二年级学生，尤指高中或大学/学院二年级学生","in the US education system, a second-year student, especially in high school or college/university","L1",None),
    (4588,"sense:spare:f4017cfb9e3e5a75","饶恕、免去；使某人免于经历、承受或应付某事","to spare or save someone from having to experience, suffer, hear, or deal with something","L1",None),
    (4628,"sense:spokesman:417cdb5a96b85eb0","男发言人；男性 spokesperson","a male spokesperson","L1",None),
    (4634,"sense:sportsman:843557e086505eb6","从事体育运动的男性；男运动员","a male person who takes part in sports","L1",None),
    (4654,"sense:stagger:1f374f739ad15621","使错开；把时间、付款、开工或位置等安排在不同时间/间隔或交错位置","to arrange events, payments, starts, or positions at different times, intervals, or staggered positions","L2",None),
    (4683,"sense:statue:865042ea0f425da7","雕像；表现人物、动物等的三维塑像，不限于真人大小或更大","a three-dimensional sculpted representation of a person, animal, or other subject, with no inherent life-size requirement","L1",None),
    (4703,"sense:stimulate:aa5293ad9125521d","刺激、促进；促使活动、增长、发展、兴趣、需求等增强","to stimulate or encourage increased activity, growth, development, interest, demand, or response","L1",None),
    (4718,"sense:storm:569005197900553d","暴风雨；伴有强风、降水、雷电等一种或多种严重天气现象的天气过程","a period of severe weather involving strong winds and/or precipitation, thunder, lightning, or related hazardous conditions","L1",None),
    (4748,"sense:stroke:537477809d415de8","卒中；脑部血供突然中断或脑内出血造成的急性脑血管事件，可能但并非必须伴随意识丧失","stroke: an acute cerebrovascular event caused by interrupted blood supply to the brain or bleeding in the brain; loss of consciousness is not required","L1",None),
    (4749,"sense:stroll:f63d87aaea5b5d0a","悠闲地走；轻松缓慢地步行，可有也可没有明确目的地","to walk in a leisurely, easy way, whether or not there is a specific destination or purpose","L1",None),
    (4762,"sense:style:fc894a0f7af352ae","风格；做事、写作、设计、穿着等具有特征的方式或表现形式","a characteristic manner or way of doing, writing, designing, dressing, or presenting something","L1",None),
    (4810,"sense:sunshine:6a1b127d79205612","阳光；晴朗有阳光的天气","sunlight, or sunny weather characterized by sunshine","L1",None),
    (4821,"sense:supper:abcbbe1276305fbc","晚餐、晚间餐食；按地区和语境可指较轻便的一餐，也可指主要晚餐","an evening meal; depending on dialect and context it may be a light meal or the main evening meal","L1",None),
    (4867,"sense:symmetry:db4db6883063540a","对称或均衡；各部分在形状、位置、结构等方面相互对应、平衡的排列关系","balanced or corresponding arrangement of parts in shape, position, structure, or proportion; not limited to exact mirror symmetry","L1",None),
]

# Existing active sense usage / level / register adjustments.
USAGE_UPDATES = [
    (4442,"sense:silly:caa72256be21531e","informal/child-directed noun use; not a neutral general label for a person","informal/child-directed","L3",False),
    (4460,"sense:siren:f51eeec675685aae","literary/dated and potentially objectifying person-label use; avoid as a neutral modern label","literary/dated","L3",False),
    (4503,"sense:slum:e64d2adac622572e","informal; often jocular or self-deprecating; avoid class-essentializing interpretations","informal","L2",False),
    (4579,"sense:southern:48552008eb4b5802","unsafe as a neutral person noun; prefer southerner / contextually capitalized Southerner","dated/marked","L3",False),
    (4628,"sense:spokesman:417cdb5a96b85eb0","gendered male term; use spokesperson for a gender-neutral generic modern term",None,"L1",True),
    (4634,"sense:sportsman:843557e086505eb6","male-marked; use sportswoman or sportsperson when a gender-neutral term is intended",None,"L1",True),
    (4712,"sense:stool:3845b7f0d08a57a4","rare/specialist botanical verb", "specialist","L3",False),
    (4712,"sense:stool:4d338bf9f72c5e36","rare/dated specialist verb", "dated/specialist","L3",False),
    (4778,"sense:subway:ad2fcd3ce063590e","chiefly AmE for an underground urban railway/metro","chiefly AmE","L1",True),
    (4778,"sense:subway:005333d9e25f51ac","BrE commonly: an underground pedestrian passage beneath a road/railway","BrE","L2",True),
    (4786,"sense:suck:7e2fcbd1fefd515c","informal/slang evaluative use; avoid in formal writing","informal/slang","L2",False),
    (4795,"sense:suicide:bde17b5c2353579b","person-label use is dated/stigmatizing; prefer person-first wording such as 'a person who died by suicide' when relevant","dated/stigmatizing","L3",False),
    (4811,"sense:super:8c535b9a8b8f59e9","informal adjective","informal","L2",False),
    (4811,"sense:super:4c81d3644494556c","informal intensifying adverb","informal","L2",False),
    (4852,"sense:swan:22e46dc6c8db56cc","BrE informal, often disapproving: move or travel around in a casual/self-important way","BrE informal/disapproving","L2",False),
]

# Level overrides for reactivated/current senses not already covered by definition/usage updates.
LEVEL_UPDATES = [
    (4430,"sense:sight:ea7f80230e215fc2","L1"),(4430,"sense:sight:975949583bb85e4b","L1"),(4430,"sense:sight:dfbdac060f60554d","L2"),
    (4460,"sense:siren:2195ef95beae52cc","L1"),(4460,"sense:siren:6ec68979175458d5","L2"),
    (4553,"sense:solve:09fbe95ba59d5df9","L1"),(4553,"sense:solve:406e82ca367a5265","L2"),
    (4572,"sense:soul:79567e0e602f52a5","L1"),(4572,"sense:soul:55f2e0228e4d5d57","L2"),(4572,"sense:soul:0d0bb62a5a995826","L2"),
    (4745,"sense:strip:668e063cbeef55ec","L1"),(4745,"sense:strip:38752787452850b4","L1"),(4745,"sense:strip:a2dbc7e379fb57b4","L2"),
    (4782,"sense:succession:b1a88dc713c351ba","L2"),
    (4795,"sense:suicide:bde17b5c2353579b","L3"),
    (4807,"sense:sunday:03fe45c19be95669","L1"),(4807,"sense:sunday:f0d30625eb6f58a6","L3"),(4807,"sense:sunday:688e3f77747d56a1","L3"),
    (4841,"sense:survey:2437b795e93c528f","L1"),(4841,"sense:survey:5cc0668a48045588","L2"),(4841,"sense:survey:7e3e94c8ba1a527e","L2"),
    (4856,"sense:sweat:e2abc1383f735978","L1"),(4856,"sense:sweat:280bf655c9635da2","L1"),(4856,"sense:sweat:e83e6534261f5fa5","L3"),
]

# (ordinal, stable branch key, pos, definition_cn, definition_en, level, pattern)
NEW_BRANCHES = [
    (4388,"thin_transparent","adjective","薄而轻、几乎透明的","very thin, light, and almost transparent","L2",""),
    (4396,"polish_make_bright","verb","擦亮、把……擦得有光泽","to polish or rub something until it becomes bright or shiny","L2","vt. + object"),
    (4401,"electrical_shock","noun","电击；电流通过身体造成的冲击","an electrical shock: a harmful or startling effect of electric current passing through the body","L2",""),
    (4403,"photo_film_shoot","noun","拍摄活动；摄影或影视拍摄的一次工作过程","a photography or filming session","L2",""),
    (4410,"firearm_discharge","noun","一枪；一次开枪/射击","an act or discharge of firing a gun","L1",""),
    (4410,"sports_shot","noun","（球类等）一次射门、投篮或击球","an attempt to score or hit the ball in sport","L2",""),
    (4410,"drink_measure","noun","一小杯烈酒；一份烈酒","a small measure or glass of spirits","L2",""),
    (4433,"abstract_indicate","verb","表明、显示、预示","to indicate, suggest, or show that something exists, matters, or is likely","L1","vt. + object/clause"),
    (4487,"figurative_defeat","verb","大胜、彻底击败（尤指体育或比赛）","to defeat someone overwhelmingly, especially in sport or competition","L2","vt. + object"),
    (4493,"digital_presentation_slide","noun","（数字演示文稿中的）幻灯片、单页画面","one page or screen in a digital presentation","L1",""),
    (4517,"sharp_speech","verb","厉声说、没好气地回答","to speak or respond sharply or angrily","L2","vi. + at"),
    (4573,"produce_sound","verb","发出声音；使……发出声音","to make or produce a sound, or cause something to sound","L1","I/T"),
    (4589,"figurative_spark","noun","一点火花、苗头或触发因素","a small trace, beginning, or trigger of a feeling, idea, or development","L2",""),
    (4620,"mood_morale","noun","情绪、精神状态、士气或热情","mood, morale, enthusiasm, or emotional energy","L2",""),
    (4638,"spread_process_extent","noun","传播、扩散的过程、范围或分布","the process, extent, or distribution of something spreading","L1",""),
    (4644,"accord_agree","verb","与……一致、相符或相容","to be consistent, compatible, or in agreement with something","L2","vi. + with"),
    (4708,"cooking_stock","noun","高汤；用肉、骨、蔬菜等慢煮制成的汤底","stock: a flavorful liquid made by simmering meat, bones, vegetables, or similar ingredients","L2",""),
    (4721,"heterosexual","adjective","异性恋的","heterosexual","L2",""),
    (4723,"figurative_burden","noun","负担、压力；对人、关系、系统或资源造成的压力","pressure or burden placed on a person, relationship, system, or resources","L2",""),
    (4731,"digital_stream","verb","通过互联网连续传输或播放音频/视频","to transmit or play audio or video continuously over the internet","L1","I/T"),
    (4748,"swimming_stroke","noun","游泳时一次完整的划水动作；泳姿中的一个划水循环","one complete movement or cycle of the arms/legs in swimming; a swimming stroke","L2",""),
    (4785,"deictic_kind","determiner","这样的；上述种类的","of the kind or type just mentioned or indicated","L1",""),
    (4798,"software_suite","noun","软件套件；一组相关的应用程序或软件工具","a collection of related software applications or tools","L2",""),
    (4826,"prevent_disclosure","verb","压制、阻止公开；阻止信息、证据、出版物或表达被披露/传播","to prevent information, evidence, publication, or expression from being disclosed, published, or communicated","L2","vt. + object"),
]

# Construction records. source_sid=None is deliberate for grammaticalized idioms/phrasals
# whose meaning should not be forced through one literal sense.
CONSTRUCTIONS = [
    (4376,"shame sb into doing sth","使某人因羞耻/压力而做某事","sense:shame:8f26b60fb9b154d2","L2"),
    (4392,"take shelter from sth","躲避某物；寻求庇护","sense:shelter:0bd0a1c784e45ae1","L1"),
    (4396,"shine a light on sth","照亮；引申为阐明、揭示某事","sense:shine:9cdc08f8c32c5349","L2"),
    (4423,"shy away from sth/doing sth","因害怕、犹豫或不情愿而回避某事/做某事",None,"L2"),
    (4425,"be sick of sth/doing sth","厌倦、厌烦某事/做某事",None,"L1"),
    (4432,"sign in","签到；登录账户或系统",None,"L1"),
    (4432,"sign up","报名、注册或加入",None,"L1"),
    (4462,"sit an exam / sit for an exam","（英式等用法）参加考试",None,"L2"),
    (4469,"size up sb/sth","迅速判断、评估某人或某事",None,"L2"),
    (4472,"sketch out sth","简要勾勒计划、想法或方案","sense:sketch:082a8f12c68b59c6","L2"),
    (4484,"cut/give sb some slack","对某人宽容一些；给某人留余地",None,"L2"),
    (4489,"sleep with sb / sleep together","与某人发生性关系；语境中也可指同床共寝",None,"L2"),
    (4490,"have sth up one's sleeve","暗中留有计划、主意或资源以备后用",None,"L2"),
    (4521,"sniff at sth","对某事表示轻蔑、鄙视或不屑",None,"L2"),
    (4524,"so ... that","如此……以至于……",None,"L1"),
    (4524,"so that","以便；为了；从而",None,"L1"),
    (4530,"sober up","酒醒；变得清醒/严肃","sense:sober:568a1bcd11365158","L2"),
    (4571,"sort of","有点、某种程度上；可以说是",None,"L1"),
    (4576,"source sth from sb/sth/place","从某人、某物或某地获得/采购某物","sense:source:d55656d84a1d51e1","L1"),
    (4583,"space out","（非正式）走神、发呆、注意力涣散",None,"L2"),
    (4586,"call a spade a spade","直言不讳；把事情说白了",None,"L2"),
    (4588,"spare sb sth","使某人免于经历、听到或应付某事","sense:spare:f4017cfb9e3e5a75","L2"),
    (4588,"spare sb from sth","使某人免遭/免于某事","sense:spare:f4017cfb9e3e5a75","L2"),
    (4603,"make a spectacle of oneself","出丑、惹人注目而显得可笑",None,"L2"),
    (4607,"speculate that + clause","推测、猜测……","sense:speculate:dd038bb4e79b5af9","L1"),
    (4612,"spend time/money doing sth","花时间/金钱做某事",None,"L1"),
    (4616,"spill over into sth","蔓延、扩展到原来的范围之外",None,"L2"),
    (4616,"spill the beans","（非正式）泄露秘密、说漏嘴",None,"L2"),
    (4623,"in spite of sth","尽管、不顾；= despite / notwithstanding",None,"L1"),
    (4624,"make a splash","引起注意、造成强烈或令人印象深刻的影响",None,"L2"),
    (4624,"splash out (on sth)","（英式非正式）在某物上大手笔花钱、挥霍",None,"L2"),
    (4629,"sponge on/off sb","（非正式）靠某人养活、占某人便宜生活",None,"L2"),
    (4644,"square with sth","与事实、证据或另一说法一致/相符",None,"L2"),
    (4664,"stamp sth out / stamp out sth","消灭、根除不良事物",None,"L2"),
    (4666,"stand out","格外显眼、突出或与众不同",None,"L1"),
    (4684,"status quo","现状；目前既有状态","sense:status:eb966763451d5c5f","L2"),
    (4690,"run out of steam","失去精力、动力或热情",None,"L2"),
    (4690,"let/blow off steam","释放压抑的情绪或精力",None,"L2"),
    (4691,"steel oneself for/against sth","做好心理准备去面对困难或不愉快之事","sense:steel:38a5093a6cac58c7","L2"),
    (4692,"be steeped in sth","沉浸在、充满某种传统/文化/氛围","sense:steep:848f99d7b6fc5c0b","L2"),
    (4693,"steer clear of sth","有意避开某人、某地、某话题或危险","sense:steer:6bdee05bb64a5459","L2"),
    (4700,"stick to sth","坚持、遵守或不偏离计划、规则、主题或承诺","sense:stick:c9b9afefb241566a","L1"),
    (4714,"stop to do sth","停下正在做的事，以便去做另一件事","sense:stop:76ad2e156b4a5d3e","L1"),
    (4716,"in store for sb","很可能将发生在某人身上；等待着某人",None,"L2"),
    (4723,"strain to do/hear/see sth","努力去做/听/看某事","sense:strain:3cf52dd2675155a0","L2"),
    (4734,"on the strength of sth","因为、基于某事提供的证据、影响或支持","sense:strength:c3afb39fcbd55057","L2"),
    (4740,"take sth in (your) stride / take sth in stride","沉着应对困难或意外，不让其打乱自己",None,"L2"),
    (4742,"strike sb as + adj/noun","给某人以……的印象；在某人看来似乎……","sense:strike:085ae81866d256cd","L1"),
    (4745,"strip sb of sth","剥夺某人的某物、权利或地位","sense:strip:a2dbc7e379fb57b4","L2"),
    (4785,"such as","例如；诸如",None,"L1"),
    (4785,"such ... that","如此……以至于……",None,"L1"),
    (4785,"as such","严格说来；以这种身份/性质",None,"L2"),
    (4793,"suggest (that) + clause","建议/提出……；正式语体可用 should，AmE 常用原形虚拟","sense:suggest:cb371f57abd355c9","L1"),
    (4815,"superior to sb/sth","优于、胜过某人/某物；英语通常用 to 而非 than","sense:superior:6941ad5063075d9b","L1"),
    (4828,"be sure to do/be","一定会做/是；务必做……",None,"L1"),
    (4829,"on the surface","表面上；从外在看来（可能与更深层事实不同）",None,"L2"),
    (4852,"swan around/about","（英式非正式，常贬义）悠闲或自以为是地四处晃荡","sense:swan:22e46dc6c8db56cc","L2"),
    (4855,"swear by sth","对某物非常有信心；强烈推荐、认为很有效",None,"L2"),
]

# Same-owner Form/identity truth. aliases are added to lookup only where they are
# genuine same-lexeme spelling variants, never for separate Words.
FORMS = {
    4385: {"type":"number_sense_boundary","aliases":["shears"],"boundaries":[
        {"condition":"singular technical/mass use","surface":"shear","note":"technical shear = a shearing force/stress or related singular use"},
        {"condition":"plural cutting tool","surface":"shears","note":"shears = large scissors/cutting tool; plural form"},]},
    4396: {"type":"inflectional_variant_boundary","aliases":[],"boundaries":[
        {"condition":"past/past participle of light-emission sense","surface":"shone","note":"shone is common for intransitive light-emission uses"},
        {"condition":"past/past participle, especially transitive polish use; also AmE variation","surface":"shined","note":"shined is common for polishing and occurs more broadly especially in AmE"},]},
    4460: {"type":"capitalization_context_boundary","aliases":[],"boundaries":[
        {"condition":"ordinary warning device","surface":"siren","note":"lowercase siren commonly means an alarm/warning device"},
        {"condition":"mythological being / classical reference","surface":"Siren","note":"capitalization is common when referring to the mythological Sirens"},]},
    4474: {"type":"regional_spelling_word_boundary","aliases":["skillful"],"boundaries":[
        {"condition":"common BrE spelling","surface":"skilful","note":"skilful is a common British spelling"},
        {"condition":"common AmE spelling","surface":"skillful","note":"skillful is the common American spelling; same lexeme"},]},
    4582: {"type":"pronunciation_boundary","aliases":[],"boundaries":[
        {"condition":"adult female pig noun","surface":"sow","pronunciation":"/saʊ/","note":"noun sow (female pig) is /saʊ/"},
        {"condition":"seed verb","surface":"sow","pronunciation":"/soʊ/ AmE; /səʊ/ BrE","note":"verb sow (plant/spread seeds) has /soʊ/ AmE, /səʊ/ BrE"},]},
    4595: {"type":"regional_spelling_word_boundary","aliases":["specialize"],"boundaries":[
        {"condition":"-ise spelling","surface":"specialise","note":"common BrE spelling"},
        {"condition":"-ize spelling","surface":"specialize","note":"especially common in AmE and also accepted in many BrE styles; same lexeme"},]},
    4597: {"type":"regional_spelling_word_boundary","aliases":["specialty"],"boundaries":[
        {"condition":"BrE/common variant","surface":"speciality","note":"speciality is common in BrE"},
        {"condition":"AmE/common specialist-context variant","surface":"specialty","note":"specialty is standard in AmE and common in specialist contexts; same lexeme"},]},
    4598: {"type":"invariant_number_boundary","aliases":[],"boundaries":[
        {"condition":"singular","surface":"one species","note":"species is unchanged in the singular"},
        {"condition":"plural","surface":"two/many species","note":"species is unchanged in the plural"},]},
    4682: {"type":"sense_conditioned_number_agreement","aliases":[],"boundaries":[
        {"condition":"academic field/science","surface":"statistics","grammar":"statistics is ...","note":"the field of statistics normally takes singular agreement"},
        {"condition":"numerical data","surface":"statistics","grammar":"statistics show ...","note":"statistics meaning numerical data normally takes plural agreement"},]},
    4763: {"type":"pos_pronunciation_boundary","aliases":[],"boundaries":[
        {"condition":"noun/adjective","surface":"subject","pronunciation":"/ˈsʌbdʒɪkt/","note":"noun/adjective have initial stress"},
        {"condition":"verb","surface":"subject","pronunciation":"/səbˈdʒekt/","note":"verb has second-syllable stress"},]},
    4768: {"type":"pos_pronunciation_boundary","aliases":[],"boundaries":[
        {"condition":"noun/adjective","surface":"subordinate","pronunciation":"final weak /-nət/","note":"noun/adjective end with weak /-nət/"},
        {"condition":"verb","surface":"subordinate","pronunciation":"final /-neɪt/","note":"verb ends /-neɪt/"},]},
    4799: {"type":"regional_spelling_word_boundary","aliases":["sulfur"],"boundaries":[
        {"condition":"traditional BrE spelling","surface":"sulphur","note":"traditional British spelling"},
        {"condition":"current scientific/IUPAC and AmE spelling","surface":"sulfur","note":"sulfur is the current IUPAC spelling and standard AmE; same lexeme"},]},
    4801: {"type":"regional_spelling_word_boundary","aliases":["summarize"],"boundaries":[
        {"condition":"-ise spelling","surface":"summarise","note":"common BrE spelling"},
        {"condition":"-ize spelling","surface":"summarize","note":"standard AmE and accepted in many BrE styles; same lexeme"},]},
    4807: {"type":"capitalization_boundary","aliases":[],"boundaries":[
        {"condition":"ordinary day name","surface":"Sunday","note":"the day name is capitalized"},
        {"condition":"rare derived adjective/verb uses","surface":"Sunday","note":"derived uses remain secondary/reference"},]},
    4841: {"type":"dialect_sensitive_pos_pronunciation_boundary","aliases":[],"boundaries":[
        {"condition":"noun, BrE/AmE","surface":"survey","pronunciation":"initial stress is standard","note":"noun normally has initial stress"},
        {"condition":"verb, especially BrE","surface":"survey","pronunciation":"BrE often second-syllable stress; AmE commonly initial","note":"do not encode a universal noun/verb split across dialects"},]},
    4845: {"type":"pos_pronunciation_boundary","aliases":[],"boundaries":[
        {"condition":"noun/adjective","surface":"suspect","pronunciation":"/ˈsʌspekt/","note":"noun/adjective have initial stress"},
        {"condition":"verb","surface":"suspect","pronunciation":"/səˈspekt/","note":"verb has second-syllable stress"},]},
    4869: {"type":"regional_spelling_word_boundary","aliases":["sympathize"],"boundaries":[
        {"condition":"-ise spelling","surface":"sympathise","note":"common BrE spelling"},
        {"condition":"-ize spelling","surface":"sympathize","note":"standard AmE and accepted in many BrE styles; same lexeme"},]},
}

# Exact malformed collocation cleanup: (ordinal, old, new, sense_id, meaning_cn)
COLLOCATION_REPLACEMENTS = [
    (4403,"shoot at a target","a target shoot","sense:shoot:240822c5c3215d8b","射击比赛/活动"),
    (4642,"spur sb to do + sth","spur sb to do sth","sense:spur:311c6c57e0135987","促使某人做某事"),
    (4747,"strive to do + sth","strive to do sth","sense:strive:ca3620e71fc053bd","努力做某事"),
    (4752,"struggle to do + sth","struggle to do sth","sense:struggle:38a847dcaa7b5922","努力做某事"),
]

# Senses that should be removed from active learner space altogether.
DEMOTIONS = [
    (4579,"sense:southern:48552008eb4b5802"),
    (4603,"sense:spectacle:4dc311c6788751a7"),
]

# Exact transitivity/governing-pattern fixes.
TRANSITIVITY = [
    (4530,"sense:sober:568a1bcd11365158","I/T","I/T; often sober up"),
    (4617,"sense:spin:ef7a6dec9cca58f2","I/T","I/T"),
]

# Core text overrides where generic L1/L2 reconstruction needs a deliberate compressed model.
CORE_OVERRIDES = {
    4534:("社会主义：关于主要生产资料的社会/公共/集体所有或控制的理论与制度；具体制度形式可不同","socialism: theories/systems involving substantial social, public, or collective ownership/control of major means of production; institutional forms vary"),
    4573:("声音；听起来；发出/使发出声音；健全/合理；另有测深与地理水道义","sound as something heard; seem when heard; make/cause a sound; sound/healthy or sensible; also depth-measure and geographic senses"),
    4692:("陡峭的；（价格等）很高；（变化）幅度大且快；浸泡/沉浸","steep in slope; very high in price; large/rapid in change; to soak or be steeped"),
    4708:("股票/股份；存货；储备/库存；高汤；另有枪托等较低频义","stock as shares/capital, inventory/supply, cooking stock, with lower-frequency specialist senses"),
    4712:("凳子；粪便（医学/普通语境）；罕见动词义后置","a stool as a backless seat or fecal matter; rare specialist verb uses are lower"),
    4824:("支持、支撑；维持/供养；证据支持/证实；支持者等常见义","support physically or practically; sustain; evidence supports/confirms a claim; common supporter/support senses"),
    4856:("汗、出汗；人体排汗为主；表面凝结水义较低频","sweat/perspiration and to perspire as main human senses; condensation use is lower"),
}

# Existing relation reciprocity / anchor work. Each row is a dict so the executor can
# preserve the existing Relation ID; no replacement ID is permitted.
EXISTING_RELATIONS = [
    {"source":4435,"target":2470,"target_word":"implication"},
    {"source":4533,"target":4532,"target_word":"sociable"},
    {"source":4542,"target":1399,"target_word":"dirty"},
    {"source":4553,"target":4115,"target_word":"resolve"},
    {"source":4560,"target":4559,"target_word":"sometime"},
    {"source":4561,"target":1846,"target_word":"fairly"},
    {"source":4599,"target":3485,"target_word":"particular"},
    {"source":4545,"target":4572,"target_word":"soul","rid":"confusable:deee27b3ed4b07cd9096","target_sid":"sense:soul:79567e0e602f52a5"},
    {"source":4680,"target":4681,"target_word":"stationery","rid":"deep:confusables:stationary:6a9ec2e1412a28d3","source_sid":"sense:stationary:8ad4997d0a965b87","target_sid":"sense:stationery:52d6d1a820725f2e"},
    {"source":4850,"target":4375,"target_word":"shallow"},
    {"source":4853,"target":4731,"target_word":"stream"},
]

# New approved pair relations where reconciliation explicitly permits a new stable
# relationship identity.
NEW_RELATIONS = [
    {"a":4717,"b":4719,"relation_type":"spelling_variant","field":"semantic_neighbors","a_sid":"sense:storey:24d964ca38de5e8d","b_sid":"sense:story:5778a5bc94c75df3","boundary":"BrE storey and AmE story are spelling counterparts only for the building-floor sense; narrative story senses are unrelated","regional_a":"BrE floor spelling","regional_b":"AmE floor spelling"},
    {"a":4796,"b":4798,"relation_type":"confusable","field":"confusables","a_sid":None,"b_sid":None,"boundary":"suit /suːt/ and suite /swiːt/ are distinct words: suit = clothing/fit/satisfy; suite = connected rooms or a related set","regional_a":None,"regional_b":None},
]

# One-sided learner contrasts: target expression is intentionally not a writable Word
# dependency under this reconciliation.
TARGET_EXPRESSION_RELATIONS = [
    (4430,"confusables","confusable","site","sight concerns seeing/what is seen; site means a place/location",None),
    (4440,"confusables","confusable","silicone","silicon is the chemical element/semiconductor material; silicone is a family of synthetic polymers", "sense:silicon:7232b13458ef500c"),
]

# Special existing relation source-anchor repair.  Fact owner must be updated together
# with the Word view so Natural Owner readback cannot disagree with canonical evidence.
RELATION_REANCHORS = [
    (4824,"confirm","sense:support:3634d77028575765",None),
]

# Competing relation representations that the Sol reconciliation explicitly retires.
RETIRE_RELATION_IDS = ["confusable:horizontal:f3d41acf605a4783344b"]

# Existing construction presentation that must be consolidated rather than duplicated.
CONSTRUCTION_OVERRIDES = [
    (4769,"subscribe to sth","赞同/支持某观点，或订阅/付费接收出版物、服务",None,"L1","Covers both agreement and subscription senses; do not teach only one branch."),
]

# Existing collocation meaning cleanup where phrase identity should stay put.
COLLOCATION_MEANINGS = [
    (4573,"a sound sleep","熟睡；安稳、深沉且不受打扰的睡眠"),
]

# Additional exact sense usage/level fixes requiring no definition change.
SENSE_NOTES = [
    (4799,None,"sulphur is the traditional BrE spelling; sulfur is current IUPAC/scientific spelling and standard AmE"),
    (4793,"sense:suggest:cb371f57abd355c9","With a that-clause, formal BrE may use should and AmE often uses the mandative base form; do not use *suggest sb to do sth for recommendation."),
]
