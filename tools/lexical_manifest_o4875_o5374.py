#!/usr/bin/env python3
"""Declarative execution manifest for Issue #245 / o4875-o5374.

All semantic decisions come from the merged reconciliation plus the narrow
o5026 till Sol addendum.  This module contains implementation data only.
"""
from __future__ import annotations

MANUAL_SOURCES = (
4880,4884,4886,4889,4890,4893,4895,4897,4898,4906,4907,4909,4910,4911,4914,4915,4917,4920,4921,4934,4935,4938,4948,4949,4956,4958,4959,4961,4963,4964,4965,4967,4970,4972,4975,4978,4980,4986,4995,4998,5001,5002,5012,5017,5018,5020,5026,5029,5030,5035,5037,5040,5041,5043,5044,5051,5056,5057,5061,5062,5063,5065,5066,5070,5071,5074,5076,5080,5083,5086,5097,5098,5102,5103,5109,5110,5111,5116,5118,5125,5128,5136,5138,5139,5142,5144,5145,5147,5152,5154,5155,5159,5161,5169,5178,5181,5182,5186,5191,5197,5199,5200,5205,5206,5207,5210,5217,5219,5221,5224,5226,5231,5235,5240,5243,5247,5251,5252,5257,5258,5261,5266,5267,5268,5271,5276,5282,5288,5289,5290,5294,5296,5317,5328,5332,5336,5338,5345,5358,5361,5368,5370,5372,5374,
)

# Existing-sense definition / POS / level repairs.
# ordinal, stable_sense_id, cn, en, level, optional pos
DEFINITIONS = [
(4880,"sense:taboo:8fa4ad6e2d3b5e2d","禁忌；由社会、宗教、习俗等形成的禁止或强烈避讳","a social, religious, or customary prohibition or strong convention against doing or discussing something","L1","noun"),
(4893,"sense:tangible:95123db93d5c52b5","可触知的；也指清楚、明确、真实可感的","perceptible or concrete; also clear, definite, real, or perceptible in a figurative sense","L1","adjective"),
(4898,"sense:tape:4cac210561ed564e","录音或录像；记录内容（历史上常用磁带）","an audio or video recording; historically often a recording on magnetic tape","L1","noun"),
(4898,"sense:tape:4a25b5d93d0053c3","录制声音或视频","to record audio or video","L2","verb"),
(4910,"sense:tease:7f9536fdbd655132","逗弄、取笑、戏弄；常带玩笑意味，也可使人恼火","to joke with, mock, or provoke someone playfully, sometimes to the point of annoyance","L1","verb"),
(4911,"sense:technical:08d2c3837bfe5a4d","技术的；专业的；涉及专门知识、科学或技术细节的","technical or specialist; involving specialized, scientific, or technological knowledge or details","L1","adjective"),
(4914,"sense:technology:25fc2b9a633a5d0c","技术；科学或技术知识、工具、过程和系统的实际应用","the practical application of scientific or technical knowledge, tools, processes, and systems","L1","noun"),
(4934,"sense:tendency:9a1f19f33fd25e1b","倾向；某事发生、变化或朝某方向发展的趋势或可能性","an inclination, likelihood, or direction/trend for something to happen, change, or develop","L1","noun"),
(4959,"sense:that:58d6ff5f313c5883","引出内容或补足从句的连接词；目的通常用 so that 等结构表达","a complementizer introducing a content clause; purpose is normally expressed by constructions such as so that","L1","conjunction"),
(4963,"sense:their:c215febe63775cf3","他们的；也可指单数 they 所指一人的","possessive determiner of they, including standard singular-they reference","L1","determiner"),
(4964,"sense:theirs:617bc806c8c4594d","他们的（东西）；也可指单数 they 所指一人的所有物","possessive pronoun of they, including standard singular-they reference","L1","pronoun"),
(4965,"sense:them:f5a2af26c9595bba","they 的宾格，可指复数，也可用于标准单数 they","object form of they, for plural referents and standard singular-they reference","L1","pronoun"),
(4967,"sense:themselves:0dbb5da121a358d1","they 的反身形式，可用于复数和标准单数 they","reflexive form of they, including plural and standard singular-they contexts","L1","pronoun"),
(4967,"sense:themselves:14aa1bf1e8785d53","用于强调 they 所指的人或事物，也可用于标准单数 they","emphatic form associated with they, including standard singular-they contexts","L2","pronoun"),
(4970,"sense:theory:1e0df55cd4e5586d","理论、设想；用于解释事实或事件的提出性想法或解释","a proposed idea or explanation used to account for facts or events","L1","noun"),
(4980,"sense:they:39532d424cb55953","他们/她们/它们；也可指性别未知、无关或使用 they 的单个人","pronoun for plural referents and standard singular they for one person whose gender is unknown, irrelevant, or who uses they","L1","pronoun"),
(4998,"sense:thoughtful:227184ada1f557c1","深思的、考虑周到的；也指体贴他人的","showing careful or reflective thought; also considerate of other people","L1","adjective"),
(5002,"sense:threaten:d7756159186b5fb1","威胁、扬言伤害或造成不利后果","to threaten or state an intention to harm or cause an adverse consequence","L1","verb"),
(5020,"sense:tide:d46e9267c61b5639","帮助某人或某事物渡过暂时的困难时期","to help someone or something through a temporary difficult period until conditions improve","L2","verb"),
(5040,"sense:to:c1a599a89e6359a2","不定式标记，置于动词原形前","the infinitive marker used before the base form of a verb","L1","particle"),
(5051,"sense:tolerate:a349cbde6833583b","容忍；忍受不愉快、困难或不理想的事物","to tolerate, endure, or put up with something unpleasant, difficult, or undesirable","L1","verb"),
(5061,"sense:tool:e67fc28a776d5871","工具；用于完成任务的器具、方法或数字/软件手段","a tool or means used to accomplish a task, including physical implements and software or digital tools","L1","noun"),
(5086,"sense:trademark:40958272edd35bea","商标；用于识别商品或服务来源的名称、文字、标志、图形等，不限于已注册者","a name, word, sign, logo, or other mark identifying the source of goods or services, whether or not formally registered","L1","noun"),
(5097,"sense:transcend:e0f409a3896e5bef","超越；越过某种界限、类别、范围或经验","to go beyond or rise above the limits, categories, scope, or experience of something","L1","verb"),
(5125,"sense:tribe:0767484c58d757a5","部族、社群；由亲缘、文化或共同身份联系的社会群体","a social or community group connected by kinship, culture, or shared identity","L1","noun"),
(5191,"sense:understand:38f6819244375dad","理解、明白；把握某事的意义、重要性或情境","to understand or grasp the meaning, significance, or situation of something","L1","verb"),
(5191,"sense:understand:c6a438e3fe4854d2","据所获信息理解、得知或认为……","to understand, be told, or believe from information that something is the case","L2","verb"),
(5197,"sense:unemployment:23d1b7c229ad532d","失业；劳动力中没有工作、通常可工作并在求职的状态","unemployment: the state of being without work within the labour force, typically while available for and seeking work","L1","noun"),
(5197,"sense:unemployment:0c4a1b9233d0549d","失业人数或失业水平，通常按劳动力口径统计","the number or level of unemployed people measured within the labour force","L2","noun"),
(5200,"sense:unfortunately:9ef6294d2bf15574","遗憾地、不幸地；表示某事令人失望或可惜","regrettably or sadly; used to say that something is disappointing or unfortunate","L1","adverb"),
(5221,"sense:upon:042cdfecdd805fef","在……上；用于若干与 on 重叠的正式或文学表达，并非 on 的所有用法都可替换","formal or literary upon, overlapping with on in a number of constructions but not interchangeable in every sense","L2","preposition"),
(5226,"sense:upward:f9fef89e4d525b93","向上；也指向更高数量、水平或价值","toward a higher position, amount, level, or value","L1","adverb"),
(5226,"sense:upward:0842211ba7785e28","向更高数量、水平或价值","toward a higher amount, level, or value","L2","adverb"),
(5240,"sense:vaccine:4202d540984f5a0e","疫苗；用于诱导或训练保护性免疫反应的生物制品","a vaccine: a biological preparation or product used to induce or train a protective immune response","L1","noun"),
(5252,"sense:vapor:61a228adc9bc5c52","蒸气；物质的气态形式，尤指通常为液体或固体的物质","vapor: the gaseous form or phase of a substance, especially one normally liquid or solid","L1","noun"),
(5257,"sense:various:645a974e7ca25fef","各种各样的；若干不同的","several or of different kinds","L1","adjective"),
(5266,"sense:velocity:ed8f186261d555f0","速度（矢量）；位置随时间的变化率，包含方向","velocity: the rate of change of position with time, including direction","L1","noun"),
(5267,"sense:ventilate:1f0e2b6de53a5741","使通风、换气；使新鲜空气流通","to ventilate by providing or circulating fresh air","L1","verb"),
(5268,"sense:venture:408354d197235cc2","冒险事业、项目或行动；不局限于商业活动","a risky undertaking, project, or enterprise, not limited to commercial activity","L1","noun"),
(5271,"sense:verbal:21a90a8aaade5926","言语的、用词语表达的；常指口头而非书面的","relating to words or expressed in words; often specifically spoken rather than written","L1","adjective"),
(5290,"sense:vicious:691b38703f99542e","恶毒、凶狠或严重有害的","cruel, violent, malicious, or seriously harmful","L1","adjective"),
(5296,"sense:vigorous:2c6fce28c0d95d7f","有力的、强劲的、精力充沛的；可指非身体性的行动、争论或努力","strong, forceful, energetic, or intense, including nonphysical action, debate, campaigns, or efforts","L1","adjective"),
(5332,"sense:vulnerable:ecd7ef24801c5a75","易受伤害、损害、利用或批评的；可指身体、情绪、系统、财务等方面","susceptible to physical, emotional, systemic, financial, or other harm, exploitation, or criticism","L1","adjective"),
]

# Genuine new semantic branches: ordinal, branch-key, pos, cn, en, level, pattern
NEW_BRANCHES = [
(4886,"carry_lead_somewhere","verb","带、拿、领某人或某物到某处","to carry, take, or lead someone or something to another place","L1","take sb/sth somewhere"),
(4886,"consume_use","verb","服用、吃、使用（药物等）","to consume, take, or use something such as medicine","L1","take medicine/sth"),
(4895,"fall_fail_badly","verb","暴跌、失败或表现很差","to fall sharply, fail, or perform very badly","L2","prices/ratings/sales tank"),
(4897,"intercept_communications","verb","窃听、截听电话或通信线路","to intercept or secretly monitor a phone line or communications","L2","tap a phone/line"),
(4920,"receiver_device","noun","电视机；用于观看电视的接收设备","a television set or receiver used to watch television","L1",""),
(4935,"legal_tender_money","noun","法定货币；法律上可用于付款的货币","money officially recognized as acceptable for payment; legal tender","L2","legal tender"),
(4961,"operating_theatre","noun","手术室（英式英语；美式常说 operating room）","BrE: an operating theatre; a room equipped for surgical operations","L2","operating theatre"),
(4978,"demonstrative_determiner","determiner","这些；置于复数名词前作限定词","demonstrative determiner used before a plural noun","L1","these + plural noun"),
(4995,"demonstrative_determiner","determiner","那些；置于复数名词前作限定词","demonstrative determiner used before a plural noun","L1","those + plural noun"),
(5041,"honor_drinking_act","noun","祝酒；为某人或某事举杯致意的行为或提议","a toast: an act or proposal of drinking in someone's or something's honor","L2","a toast to sb/sth"),
(5057,"color_shade","noun","色调、颜色的深浅或调子","a shade or degree of color; a color tone","L2","skin tone/color tone"),
(5057,"muscle_tone","noun","肌张力；肌肉正常的紧张度或坚实度","muscle tone: the normal firmness or tension of muscles","L2","muscle tone"),
(5063,"clothing_top","noun","上衣、上装","a garment worn on the upper part of the body; a top","L1",""),
(5065,"electric_flashlight_brE","noun","手电筒（英式英语；美式通常 flashlight）","BrE: a portable electric flashlight","L2",""),
(5080,"figurative_harmful","adjective","有毒害的、严重有害或不健康的（引申）","seriously harmful, unhealthy, or damaging in a figurative sense","L1","toxic relationship/workplace/culture"),
(5083,"audio_music_track","noun","音轨；录音、专辑中的一首曲目","an audio track or a song/piece on a recording or album","L1","music/audio track"),
(5102,"public_transport_system","noun","公共交通系统或服务（尤美式 public/mass transit）","public transportation systems or services, especially AmE public/mass transit","L1","public/mass transit"),
(5109,"transplanted_object","noun","移植物；被移植的器官、组织、人或事物","an organ, tissue, person, or thing that has been transplanted","L2",""),
(5128,"dessert","noun","松糕甜点（英式 trifle）","BrE trifle: a layered dessert, typically with sponge, fruit, custard, and cream","L2",""),
(5136,"animal_group","noun","一群动物（如猴群等）","a group of certain animals moving or living together","L2","a troop of animals"),
(5178,"abstract_umbrella","noun","总括性组织、类别、框架或保护体系","an encompassing organization, category, framework, or system of protection","L1","under the umbrella of"),
(5182,"threshold_below","preposition","低于、不超过某年龄、数量、价格或阈值","below or less than a stated age, amount, price, or threshold","L1","under 18 / under $50"),
(5186,"cultural_nonmainstream","adjective","地下的、非主流的、反主流文化的","outside the mainstream; alternative or countercultural","L2","underground music/art/movement"),
(5217,"state_level_up","adjective","上涨的、增加的；运行中的、可用的或已到时间的","higher or increased; operating/available, or having reached a stated time/state","L2","prices/systems/time are up"),
(5224,"digestive_upset","noun","胃肠不适、消化紊乱","a digestive disturbance or stomach upset","L2","stomach upset"),
(5317,"outspoken_views","adjective","直言不讳的；公开而强烈表达观点的","outspoken; expressing views strongly and openly","L1","be vocal about/in support of/against"),
(5374,"world_wide_web","noun","万维网；互联网页面和在线资源构成的 Web","the World Wide Web: the interconnected system of online pages and resources","L1","the Web/web"),
]

# Exact stable reference branches that should be restored or deliberately ranked.
# ordinal, sid, level, optional cn, optional en, optional pos
REACTIVATE = [
(4884,"sense:tail:763f725f65ee59bc","L2","硬币的反面；常用复数 tails","the reverse side of a coin, especially in heads or tails / tails","noun"),
(4906,"sense:teach:0d372b5d3e7152a3","L1",None,None,None),(4906,"sense:teach:1ac53f8fa00954c1","L2",None,None,None),
(4909,"sense:tear:0b8cdcef9eb25b2e","L1",None,None,None),(4909,"sense:tear:147c03658b845183","L1",None,None,None),(4909,"sense:tear:f702a5eb006257cd","L2",None,None,None),(4909,"sense:tear:24e3e5257a5c599d","L2",None,None,None),
(4986,"sense:think:1a92a30e99f354f1","L1",None,None,None),(4986,"sense:think:5f219d551ca75ebb","L1",None,None,None),
(5071,"sense:touch:ca9d8a3218745d9d","L2","简要提及、涉及","to briefly mention or deal with something","verb"),
(5076,"sense:toward:f0da906ff0d55e3e","L1",None,None,None),(5076,"sense:toward:c4b395f9558d5caa","L2",None,None,None),
(5111,"sense:trap:e564420b24ef5bf5","L1",None,None,None),(5111,"sense:trap:3fe2c8f97ac75737","L2",None,None,None),
(5116,"sense:treat:83e27aff478058f7","L1",None,None,None),(5116,"sense:treat:f321b819a2e255a6","L1",None,None,None),(5116,"sense:treat:886e33ceab2d50e6","L2",None,None,None),(5116,"sense:treat:d057a05fe17e582d","L2",None,None,None),
(5118,"sense:tree:2003e746b9f65568","L1",None,None,None),(5118,"sense:tree:7e6272a61b365b51","L2",None,None,None),
(5138,"sense:tropical:5f0e35b83e135aa2","L1",None,None,None),(5138,"sense:tropical:c33f48970c1f5ffb","L2",None,None,None),
(5147,"sense:try:a22e65d4f85c5e79","L1",None,None,None),(5147,"sense:try:045fd7d7828c5296","L1",None,None,None),
(5155,"sense:tune:9dd70794c78855e7","L2","协调、一致；合拍","to be in harmony or accord","verb"),
(5199,"sense:unfold:7f7f630b25985af7","L2","揭示、逐渐使人知道","to reveal or make known gradually","verb"),
]

# Construction layer: ordinal, pattern, cn meaning, source sid or None, level.
CONSTRUCTIONS = [
(4889,"talk about sth","谈论某事","sense:talk:3741d7b241a55430","L1"),(4889,"talk sb into doing sth","说服某人做某事",None,"L2"),(4889,"talk sb out of doing sth","说服某人不要做某事",None,"L2"),
(4890,"a tall order","艰巨、要求很高的任务",None,"L2"),
(4897,"tap into sth","利用、开发某种资源或潜力","sense:tap:34cbe7efa4255752","L2"),
(4921,"tell A from B","区分 A 与 B","sense:tell:4e1a4925ba9c5312","L1"),(4921,"tell the difference (between A and B)","看出、分辨差别","sense:tell:4e1a4925ba9c5312","L1"),
(4949,"test positive/negative for sth","检测结果为某物阳性/阴性","sense:test:bb877cc6652158e3","L1"),
(5002,"threaten sb with sth","以某事威胁某人","sense:threaten:d7756159186b5fb1","L1"),
(5012,"throw away sth","扔掉、丢弃某物","sense:throw:fb96e4fd5bfc5d3b","L1"),(5012,"throw a party","举办聚会",None,"L2"),(5012,"throw sb into confusion/panic/a state","使某人突然陷入混乱、恐慌或某种状态",None,"L2"),
(5018,"tick all the boxes","满足全部要求或标准","sense:tick:6678666ee6765cde","L2"),
(5020,"tide sb/sth over","帮助某人/某事物渡过暂时困难","sense:tide:d46e9267c61b5639","L2"),
(5029,"on time","准时、按时（不迟到）",None,"L1"),(5029,"in time","及时、来得及（在太迟之前）",None,"L1"),(5029,"by the time + clause","到……的时候；截至某时",None,"L1"),
(5044,"toe the line","遵守规则、服从标准或要求",None,"L2"),
(5062,"the law has teeth","法律有实际执行力或威慑力","sense:tooth:2c3573c75bc75768","L2"),
(5083,"on track","按计划进展；处于正确轨道","sense:track:beed819180c05ca2","L1"),(5083,"off track","偏离预定路线、主题或计划","sense:track:beed819180c05ca2","L1"),(5083,"track record","过往表现、业绩记录",None,"L2"),
(5111,"trap sb into doing sth","诱使某人做某事","sense:trap:3fe2c8f97ac75737","L2"),
(5139,"have trouble (in) doing sth","做某事有困难","sense:trouble:7ad5d9856736551f","L1"),(5139,"have trouble with sth","在某事上有困难","sense:trouble:7ad5d9856736551f","L1"),
(5142,"come true","成为现实；实现","sense:true:c775c586f4ad57bd","L1"),
(5145,"trust sb with sth","把某事/某物放心交给某人","sense:trust:a29f6821ddc25c71","L1"),(5145,"trust sb to do sth","相信某人会做某事","sense:trust:a29f6821ddc25c71","L1"),(5145,"trust in sb/sth","信赖、信任某人/某事物","sense:trust:a29f6821ddc25c71","L2"),
(5147,"try to do sth","努力、设法做某事","sense:try:a22e65d4f85c5e79","L1"),(5147,"try doing sth","试着用某种做法，看是否有效","sense:try:045fd7d7828c5296","L1"),
(5161,"turn out (to be) ...","结果是；后来证明是",None,"L1"),(5161,"turn + adjective","变得……","sense:turn:428ba9d6ceba5062","L1"),(5161,"turn to sb/sth","向某人/某事寻求帮助、把注意力转向",None,"L1"),
(5178,"under the umbrella of sth","在某个总括性组织、类别或体系之下",None,"L2"),
(5191,"I understand (that) + clause","据我所知/我得知……；我理解为……","sense:understand:c6a438e3fe4854d2","L2"),
(5217,"up to + number/amount","多达；直到某个数量或限度",None,"L1"),(5217,"be up to sb","由某人决定或负责",None,"L2"),
(5219,"upgrade to sth","升级到更高版本、标准或等级","sense:upgrade:36b42025c8dd53a1","L1"),(5219,"upgrade from A to B","从 A 升级到 B","sense:upgrade:36b42025c8dd53a1","L1"),
(5231,"used to do/be","过去常做/曾经处于某状态","sense:use:61ddd9dabd6a5811","L1"),(5231,"be used to + n/V-ing","习惯于……",None,"L1"),(5231,"get used to + n/V-ing","逐渐习惯于……",None,"L1"),
(5243,"in vain","徒劳地；未成功、未产生预期结果","sense:vain:a006a8532dcc5c65","L1"),
(5258,"vary with sth","随……而变化","sense:vary:36ceabb43976571a","L1"),(5258,"vary from sth","与……不同；因……而异","sense:vary:36ceabb43976571a","L2"),(5258,"vary from A to B","从 A 到 B 不等/变化","sense:vary:36ceabb43976571a","L1"),
(5268,"venture to do/say sth","冒险、斗胆做/说某事","sense:venture:014eddd97ad65a71","L2"),
(5282,"vest sth in sb/sth","把权力、财产或权利正式赋予某人/某机构","sense:vest:42bdfb60388e5198","L2"),(5282,"be vested in sb/sth","权力、财产或权利归属于某人/某机构","sense:vest:42bdfb60388e5198","L2"),
(5289,"in the vicinity of + place","在……附近",None,"L2"),(5289,"in the vicinity of + number","大约、约为某个数字",None,"L2"),
(5290,"vicious circle/cycle","恶性循环；自我强化并使问题恶化的过程",None,"L2"),
(5294,"view A as B","把 A 看作/认为是 B","sense:view:45b82b1534015fe9","L1"),(5294,"with a view to + n/V-ing","以……为目的；打算……",None,"L2"),
(5317,"be vocal about sth","公开而强烈地表达对某事的看法",None,"L2"),(5317,"be vocal in support of/against sth","公开强烈支持/反对某事",None,"L2"),
(5336,"can't wait to do sth","迫不及待想做某事；非常期待",None,"L1"),(5336,"wait to do sth","等到某时再做某事","sense:wait:cd31227bad0058a6","L1"),
(5338,"in the wake of sth","在……之后；常含因……而发生之意",None,"L2"),
(5345,"ward off sth","防止、抵御或击退危险、疾病、攻击等","sense:ward:810850c318905d1e","L1"),
(5358,"water sth down","把……稀释；引申为削弱、淡化或放宽",None,"L2"),
(5370,"wear off","（药效、感觉、影响等）逐渐消失",None,"L1"),(5370,"wear out","磨损至不能使用；使/变得精疲力竭",None,"L1"),
(5372,"under the weather","身体不太舒服、有点生病",None,"L2"),(5372,"weather the storm","渡过难关、经受住困难时期","sense:weather:553e81810c9b5abe","L2"),
]

# Same-owner Form / capitalization / pronunciation / regional spelling truth.
FORMS = {
4909:{"type":"heteronym_pronunciation_boundary","aliases":[],"boundaries":[{"condition":"eye-drop noun","surface":"tear","pronunciation":"/tɪr/","note":"tear meaning a drop from the eye is pronounced /tɪr/"},{"condition":"rip verb/noun","surface":"tear","pronunciation":"/ter/","note":"tear meaning rip or split is pronounced /ter/"}]},
4958:{"type":"capitalization_sense_boundary","aliases":[],"boundaries":[{"condition":"US/Canadian holiday","surface":"Thanksgiving","note":"the holiday name is capitalized"},{"condition":"act/expression of giving thanks","surface":"thanksgiving","note":"lowercase thanksgiving is the common noun"}]},
4961:{"type":"regional_spelling_word_boundary","aliases":["theater"],"boundaries":[{"condition":"BrE spelling","surface":"theatre","note":"theatre is the standard BrE spelling"},{"condition":"AmE spelling","surface":"theater","note":"theater is the standard AmE spelling for the same lexeme"}]},
4963:{"type":"pronoun_paradigm_pos_boundary","aliases":[],"boundaries":[{"condition":"normal prenominal use","surface":"their + noun","note":"their is normally a possessive determiner"},{"condition":"reference","surface":"their","note":"may refer to plural they or standard singular they"}]},
4964:{"type":"singular_they_paradigm","aliases":[],"boundaries":[{"condition":"plural or singular they possessive pronoun","surface":"theirs","note":"theirs can refer to one person or multiple people"}]},
4965:{"type":"singular_they_paradigm","aliases":[],"boundaries":[{"condition":"object form","surface":"them","note":"them can be plural or standard singular they"}]},
4967:{"type":"singular_they_paradigm","aliases":[],"boundaries":[{"condition":"reflexive/emphatic form","surface":"themselves","note":"themselves can occur with plural or standard singular they; do not force themself into Core"}]},
4978:{"type":"demonstrative_pos_boundary","aliases":[],"boundaries":[{"condition":"standalone","surface":"these","note":"pronoun use"},{"condition":"before plural noun","surface":"these + plural noun","note":"determiner use"}]},
4980:{"type":"singular_they_paradigm","aliases":[],"boundaries":[{"condition":"plural reference","surface":"they","note":"plural pronoun"},{"condition":"one person","surface":"they","note":"standard singular they"}]},
4986:{"type":"irregular_inflection_crossword_boundary","aliases":[],"boundaries":[{"condition":"base/present","surface":"think","note":"ordinary thinking/belief verb"},{"condition":"past/past participle","surface":"thought","note":"irregular inflection; thought also has independent noun meanings"}]},
4995:{"type":"demonstrative_pos_boundary","aliases":[],"boundaries":[{"condition":"standalone","surface":"those","note":"pronoun use"},{"condition":"before plural noun","surface":"those + plural noun","note":"determiner use"}]},
5035:{"type":"sense_conditioned_regional_spelling","aliases":["tyre"],"boundaries":[{"condition":"wheel-covering noun, AmE","surface":"tire","note":"AmE spelling for the wheel noun"},{"condition":"wheel-covering noun, BrE","surface":"tyre","note":"BrE spelling for the wheel noun only; fatigue verbs remain tire"}]},
5040:{"type":"grammar_pos_boundary","aliases":[],"boundaries":[{"condition":"preposition","surface":"to + noun/pronoun","note":"prepositional to"},{"condition":"infinitive marker","surface":"to + base verb","note":"infinitival particle/marker, not preposition"}]},
5066:{"type":"pos_pronunciation_boundary","aliases":[],"boundaries":[{"condition":"noun","surface":"torment","pronunciation":"initial stress","note":"noun normally has initial stress"},{"condition":"verb","surface":"torment","pronunciation":"final stress","note":"verb normally has final stress"}]},
5076:{"type":"regional_spelling_word_boundary","aliases":["towards"],"boundaries":[{"condition":"especially AmE","surface":"toward","note":"toward is especially common in AmE"},{"condition":"especially BrE","surface":"towards","note":"towards is common in BrE; same lexeme"}]},
5098:{"type":"dialect_sensitive_pos_pronunciation_boundary","aliases":[],"boundaries":[{"condition":"BrE noun","surface":"transfer","note":"BrE noun commonly has initial stress"},{"condition":"BrE verb","surface":"transfer","note":"BrE verb commonly has final stress"},{"condition":"AmE","surface":"transfer","note":"standard AmE commonly allows initial stress in noun and verb; do not encode a universal split"}]},
5109:{"type":"pos_pronunciation_boundary","aliases":[],"boundaries":[{"condition":"noun","surface":"transplant","note":"noun normally has initial stress"},{"condition":"verb","surface":"transplant","note":"verb normally has final stress"}]},
5110:{"type":"pos_pronunciation_boundary","aliases":[],"boundaries":[{"condition":"noun","surface":"transport","note":"noun normally has initial stress"},{"condition":"verb","surface":"transport","note":"verb normally has final stress"}]},
5152:{"type":"regional_sense_boundary","aliases":[],"boundaries":[{"condition":"especially AmE","surface":"tuition","note":"commonly means tuition fees / money paid for instruction"},{"condition":"especially BrE","surface":"tuition","note":"commonly means teaching or instruction, often individual/small-group"}]},
5154:{"type":"regional_spelling_word_boundary","aliases":["tumour"],"boundaries":[{"condition":"AmE","surface":"tumor","note":"standard AmE spelling"},{"condition":"BrE","surface":"tumour","note":"standard BrE spelling; same lexeme"}]},
5159:{"type":"capitalization_sense_boundary","aliases":[],"boundaries":[{"condition":"common noun","surface":"turkey","note":"bird and common-word senses are lowercase"},{"condition":"country proper name","surface":"Turkey","note":"country name is capitalized and remains a proper-name surface in the same owner"}]},
5226:{"type":"regional_adverb_form","aliases":["upwards"],"boundaries":[{"condition":"common form","surface":"upward","note":"upward functions as adjective and adverb"},{"condition":"common regional adverb variant","surface":"upwards","note":"upwards is a common adverb form, especially BrE"}]},
5231:{"type":"grammar_construction_boundary","aliases":[],"boundaries":[{"condition":"past habit/state","surface":"used to + base verb","note":"used to do/be = past habit or state"},{"condition":"accustomed","surface":"be/get used to + n/V-ing","note":"here to is a preposition and used means accustomed"}]},
5235:{"type":"regional_spelling_word_boundary","aliases":["utilize"],"boundaries":[{"condition":"-ise spelling","surface":"utilise","note":"common BrE spelling"},{"condition":"-ize spelling","surface":"utilize","note":"standard AmE and accepted in many BrE styles; same lexeme"}]},
5252:{"type":"regional_spelling_word_boundary","aliases":["vapour"],"boundaries":[{"condition":"AmE/scientific spelling","surface":"vapor","note":"standard AmE spelling"},{"condition":"BrE spelling","surface":"vapour","note":"standard BrE spelling; same lexeme"}]},
5276:{"type":"lexicalized_participle_boundary","aliases":["versed"],"boundaries":[{"condition":"ordinary verse lexeme","surface":"verse","note":"modern verb verse is centered on poetry/versify"},{"condition":"lexicalized participle/adjective","surface":"versed / well versed","note":"be (well) versed in sth = knowledgeable, skilled, or experienced in sth; do not teach productive verse sb in"}]},
5282:{"type":"regional_sense_boundary","aliases":[],"boundaries":[{"condition":"AmE clothing","surface":"vest","note":"usually a waistcoat/sleeveless outer garment"},{"condition":"BrE clothing","surface":"vest","note":"usually an undershirt/singlet"}]},
5288:{"type":"sense_conditioned_regional_spelling","aliases":["vise"],"boundaries":[{"condition":"moral fault","surface":"vice","note":"always vice"},{"condition":"holding tool, BrE","surface":"vice","note":"BrE tool spelling"},{"condition":"holding tool, AmE","surface":"vise","note":"AmE spelling only for the clamp/tool sense"}]},
5361:{"type":"capitalization_sense_boundary","aliases":["Watt"],"boundaries":[{"condition":"SI power unit","surface":"watt","note":"lowercase common noun for the unit"},{"condition":"engineer proper name","surface":"Watt","note":"capitalized proper name; reference-only in this owner"}]},
5374:{"type":"capitalization_register_boundary","aliases":[],"boundaries":[{"condition":"World Wide Web as proper-name style","surface":"the Web","note":"capitalized form remains common in proper-name/editorial usage"},{"condition":"generic modern style","surface":"web","note":"lowercase web is now also common for the digital sense"}]},
}

# Sense usage/ranking. ordinal, sid, note, register, level, writing_safe
USAGE = [
(5030,"sense:timely:bb8478b34d625f35","Adverbial timely is uncommon/marked in ordinary learner production; prefer 'in a timely manner'.","marked/uncommon adverb","L3",False),
(5261,"sense:vegetable:0f3b4c1d8b6d55fe","Person-label use for a severely disabled/incapacitated person is dated and offensive; do not use as a neutral label.","dated/offensive","L3",False),
(5361,"sense:watt:bbf1d11adea25958","Proper-name reference is Watt, capitalized; keep out of lowercase learner Core.","proper-name/reference","L3",False),
]

# Senses removed from active learner space but preserved in identity registry.
DEMOTIONS = [
(4890,"sense:tall:458550db880b5fa1"),
(5251,"sense:vanity:49383e67b5ba54c2"),
(5276,"sense:verse:3766409372fe50a5"),
]

# Direct transitivity / governing pattern repairs.
TRANSITIVITY = [
(4889,"sense:talk:3741d7b241a55430","vi","vi.; usually talk about sth rather than *talk sth"),
(5206,"sense:unite:b31bd977d53e5366","vt","vt. + object; unite people/things"),
(5219,"sense:upgrade:36b42025c8dd53a1","I/T","I/T; upgrade sth; upgrade to/from"),
]

# Collocation reattachment/cleanup. ordinal, phrase, target sid, cn meaning, exam value
RELOCATE = [
(5012,"throw away sth","sense:throw:fb96e4fd5bfc5d3b","扔掉、丢弃某物","fixed_pattern"),
(5243,"in vain","sense:vain:a006a8532dcc5c65","徒劳地；没有成功","fixed_pattern"),
(5199,"unfold the truth","sense:unfold:7f7f630b25985af7","揭示真相","fixed_pattern"),
]

DROP_COLLOCATIONS = [
(5043,"today morning"),
]

# Existing collocation phrase notation replacements.
COLLOCATION_REPLACEMENTS = [
(5328,"volunteer to do + sth","volunteer to do sth","sense:volunteer:e5856e337f295ae6","自愿做某事"),
(5336,"wait to do + sth","wait to do sth","sense:wait:cd31227bad0058a6","等到某时再做某事"),
]

# Core overrides / explicit compressed ranking.
CORE_OVERRIDES = {
4938:("紧张；张力/拉力；相互对立因素之间的张力","tension as mental/relational strain or physical stretching force/state"),
5030:("及时的、适时的（主要为形容词）；副词普通表达优先 in a timely manner","timely mainly as an adjective meaning at an appropriate time; prefer in a timely manner adverbially"),
5136:("部队/士兵群体；也可指某些动物的一群、童军小队等","troop as a group of soldiers, certain animals, or a Scout unit, with related uses"),
5152:("tuition：学费（尤美式）或教学/辅导（尤英式）","tuition: fees for instruction especially AmE, or teaching/instruction especially BrE"),
5247:("价值/重要性；价格；价值观/原则；重视/估价等","value as worth/importance, monetary value, values as beliefs/principles, and related verbs"),
5251:("虚荣、自负；过度看重自身尤其外表（徒劳/空虚义后置）","vanity mainly excessive self-regard, especially about appearance; futility/emptiness is lower/literary"),
5261:("蔬菜、食用植物；植物相关义；冒犯性人称用法后置并标记","vegetable mainly food/plant senses; offensive person-label use is lower and marked"),
5361:("瓦特：功率单位；Watt 人名仅作大写参考","watt as the unit of power; Watt as a capitalized proper-name reference only"),
}

# Existing two-owner relation closure. Target word is resolved at runtime.
# ordinal, target_word, optional source_sid, optional target_sid, optional rid, kind
RELATIONS = [
(4907,"teach","sense:teacher:8774a23a826f5756","sense:teach:0d372b5d3e7152a3",None,"existing"),
(4915,"tiresome",None,None,None,"existing"),
(4948,"terrible","sense:terror:0c8bd8358aa854df","sense:terrible:3300058577665642","deep:word_family:terror:65598ee974b9c1ed","existing"),
(4956,"then",None,None,None,"existing"),
(4975,"consequently",None,None,None,"existing"),
(5001,"threaten",None,None,None,"existing"),
(5017,"so",None,None,None,"existing"),
(5035,"tired",None,None,None,"existing"),
(5037,"tedious",None,None,None,"existing"),
(5044,"tow",None,None,None,"existing"),
(5070,"full",None,None,None,"existing"),
(5074,"tour",None,None,None,"existing"),
(5103,"transaction",None,None,None,"existing"),
(5118,"three",None,None,None,"existing"),
(5138,"tropic",None,None,None,"existing"),
(5181,"disclose",None,None,None,"existing"),
(5205,"whole",None,None,None,"existing"),
(5206,"join",None,None,None,"existing"),
(5207,"integrity",None,None,None,"existing"),
]

# Source-only or special relation work where target owner is explicitly read-only.
ONE_SIDED_RELATIONS = [
(4917,"telegram","semantic_contrast","telegraph is the communication system/device; telegram is a transmitted message",None,"sense:telegram:088cbf80affc5861"),
(5056,"tonne","unit_contrast","ton and tonne are distinct units: US short ton = 2,000 lb; UK long ton = 2,240 lb; metric tonne = 1,000 kg",None,None),
(5144,"boot","regional_equivalent","AmE trunk is the car luggage compartment; BrE boot is the equivalent term",None,"sense:boot:ff7e0b273f1d53f2"),
]

# Word-family/relation demotion rather than reciprocal closure.
DEMOTE_FAMILY = [
(5210,"universal"),
]

# Exact special-case handlers implemented in the executor.
CUSTOM = {
4972:"there_cluster_consolidation",
4986:"think_relation_consolidation",
5026:"till_split",
5056:"ton_tonne",
5083:"track_record_attachment",
5116:"treat_cluster_anchor",
5159:"turkey_capitalization",
5206:"unite_transitive_relation",
5226:"upward_reconcile",
5276:"verse_form_lifecycle",
5282:"vest_invest_anchor",
5368:"wealthy_affluent_anchor",
5370:"wear_reanchor",
}

# Owners whose source-worthy delta is deliberately local/presentation-only and is
# materialized by direct executor handlers rather than the tables above.
DIRECT_LOCAL = {
4938:"core_only",5030:"core_and_usage",5043:"drop_bad_collocation",5056:"ton_tonne",
5062:"construction_only",5136:"new_branch_and_core",5152:"form_and_core",5169:"physical_noun_branch",
5210:"demote_false_family",5247:"core_only",5261:"usage_and_core",5328:"replace_collocation",
5361:"form_usage_core",
}
