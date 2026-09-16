#!/usr/bin/env python3
PATCHES={
5827:[{'op':'update','sid':'sense:forsake:c991913aa956507a','level':'L1','cn':'抛弃、放弃、舍弃；可指人、事物、习惯、做法或道路','en':'to abandon or renounce a person, thing, practice, habit, or course'},{'op':'core','cn':'抛弃、放弃、舍弃','en':'to abandon or renounce a person, thing, practice, or course','ids':['sense:forsake:c991913aa956507a'],'pos':'verb'}],
5828:[{'op':'new','branch':'fortified_defensive_place','pos':'noun','cn':'堡垒、要塞；用于防御的设防建筑或地点','en':'a fortified building or place used for defense','level':'L1'},{'op':'usage','sid':'sense:fort:ca69ae47f7105963','level':'L3','register':'rare/obsolete','note':'Obscure verb; noun fort is learner-main.'},{'op':'usage','sid':'sense:fort:c3076164be9b56f1','level':'L3','register':'rare/obsolete','note':'Obscure military verb; noun fort is learner-main.'},{'op':'rebuild_core','levels':['L1','L2']}],
5830:[{'op':'one_sided','target_expression':'foul','relation_type':'confusable','field':'confusables','boundary':'fowl means a bird/poultry; foul means dirty, offensive, unpleasant, or against the rules. They are homophones/confusables, not synonyms.','source_sid':'sense:fowl:0e87d72c39225198'}],
5832:[{'op':'construction','pattern':'fret about/over sth','cn':'为某事担忧、焦虑','sid':'sense:fret:3417ef82b7d158b8','level':'L1','en':'to worry or feel anxious about something'}],
5834:[
 {'op':'update','sid':'sense:fury:d09f6a9547135b53','level':'L1','cn':'狂怒、暴怒；极其强烈的愤怒','en':'a feeling of intense anger or rage'},
 {'op':'update','sid':'sense:fury:b19ff485b01a5fe9','level':'L3','cn':'Fury/Furies：古典神话中的复仇女神','en':'Fury/Furies: in classical mythology, one of the avenging deities who punish wrongdoing'},
 {'op':'usage','sid':'sense:fury:b19ff485b01a5fe9','level':'L3','register':'mythology/proper name','note':'Proper-name mythological branch: Fury/Furies; lower/reference.'},
 {'op':'new','branch':'violent_force_intensity','pos':'noun','cn':'猛烈的力量、强度；风暴、攻击等的狂暴程度','en':'the violent force or intensity of a natural event, attack, or action','level':'L2','pattern':'the fury of a storm/attack'},
 {'op':'form','type':'capitalization_sense_boundary','boundaries':[{'surface':'fury','condition':'ordinary intense anger/violent force','note':'lowercase common noun'},{'surface':'Fury/Furies','condition':'classical mythology','note':'capitalized proper-name mythological use'}]},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5836:[{'op':'form','type':'regional_spelling_variant','boundaries':[{'surface':'generalization','condition':'AmE/common spelling','note':'-ization spelling'},{'surface':'generalisation','condition':'BrE spelling','note':'British -isation spelling; same owner and senses'}],'aliases':['generalisation']}],
5840:[{'op':'relation','target':2140,'relation_type':'regional_spelling_variant','boundary':'glamour and glamor are regional spelling variants of the same ordinary concept. Preserve both stable Word owners and exact-spelling lookup ownership.','source_sid':'sense:glamour:ec247a652c0d5eed'}],
5843:[{'op':'construction','pattern':'gnaw at sb/sth','cn':'持续困扰、折磨；逐渐侵蚀/磨损','sid':'sense:gnaw:a9ff4ae74360590c','level':'L1','en':'to persistently trouble or worry someone, or gradually wear something away'}],
5844:[{'op':'new','branch':'figurative_idealized_woman','pos':'noun','cn':'女神般的人；受到高度崇拜、理想化的女性（常因美貌或成就）','en':'figurative: a woman who is greatly admired or idealized, often for beauty or achievement','level':'L2','usage':{'register':'figurative','note':'Do not treat goddess as a neutral automatic synonym for a beautiful woman.','writing_safe':True}},{'op':'rebuild_core','levels':['L1','L2']}],
5845:[{'op':'core','cn':'大猩猩','en':'a gorilla: a large great ape native to central Africa','ids':['sense:gorilla:8fba952c80895cb0'],'pos':'noun'},{'op':'record_note','field':'usage_note','value':'Human thug/brutal-man uses, if encountered, are dated/derogatory/dehumanizing and must not compete in Core.'}],
5851:[{'op':'update','sid':'sense:grassy:ce9827d921065bac','level':'L1','cn':'长满草的、草多的','en':'covered with, full of, or abounding in grass'},{'op':'core','cn':'长满草的、草多的','en':'covered with or full of grass','ids':['sense:grassy:ce9827d921065bac'],'pos':'adjective'}],
5852:[{'op':'update','sid':'sense:gravel:ea5422a017b25d2b','level':'L2','cn':'铺碎石；用砂砾覆盖路面/表面','en':'to cover or surface something with gravel'},{'op':'core','cn':'砂砾、碎石；用碎石铺面','en':'gravel: small rock fragments and pebbles; to cover or surface with gravel','ids':{'noun':['sense:gravel:feee5f3e8fd25b5f'],'verb':['sense:gravel:ea5422a017b25d2b']}}],
5859:[{'op':'update','sid':'sense:gust:a94983edfd055052','level':'L1','cn':'一阵强风；突然猛烈的一股气流','en':'a sudden strong burst of wind or air'},{'op':'core','cn':'一阵强风、突发气流','en':'a sudden strong burst of wind or air','ids':['sense:gust:a94983edfd055052'],'pos':'noun'}],
5864:[{'op':'construction','pattern':'harp on (about) sth','cn':'喋喋不休地反复谈论/抱怨某事，令人厌烦','level':'L1','en':'to keep talking or complaining about something repeatedly and annoyingly'}],
5866:[{'op':'core','cn':'傲慢的、目中无人的；带轻蔑优越感的','en':'arrogantly superior and disdainful of others','ids':['sense:haughty:6d9c0551910d5deb'],'pos':'adjective'}],
5868:[
 {'op':'update','sid':'sense:headlong:780effdd37e1599e','level':'L2','cn':'头朝前地；一头向前地','en':'head first; with the head foremost'},
 {'op':'update','sid':'sense:headlong:29417eafc7e95d2e','level':'L1','cn':'飞快地；鲁莽、轻率地，不充分考虑后果','en':'at very high speed, or rashly/recklessly without enough thought'},
 {'op':'form','type':'pos_use_boundary','boundaries':[{'surface':'headlong','condition':'adverb','note':'head first, very fast, or recklessly'},{'surface':'headlong + noun','condition':'adjective','note':'ordinary adjective use in a headlong rush/plunge, sharing the same fast/reckless or head-first semantic clusters'}]},
 {'op':'construction','pattern':'a headlong rush/plunge','cn':'猛冲/一头扎入；鲁莽的冲进','sid':'sense:headlong:29417eafc7e95d2e','level':'L1'},
 {'op':'construction','pattern':'rush/plunge headlong into sth','cn':'猛地/鲁莽地冲入某事','sid':'sense:headlong:29417eafc7e95d2e','level':'L1'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5869:[
 {'op':'update','sid':'sense:hearth:827bbe5ff62d5697','level':'L1','cn':'壁炉前/周围的炉床、炉边区域','en':'the floor or area in front of or around a fireplace'},
 {'op':'update','sid':'sense:hearth:5bdaee3ffa1a5cc1','level':'L2','cn':'家庭、家园（文学/象征用法）','en':'literary/figurative: home or family, symbolized by the fireplace'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5870:[
 {'op':'new','branch':'robust_vigorous_health','pos':'adjective','cn':'强健的、精力旺盛的','en':'robust, vigorous, and in good health or spirits','level':'L1','pattern':'hale and hearty'},
 {'op':'new','branch':'strong_enthusiastic_expression','pos':'adjective','cn':'热烈的、强烈的、充满感情的','en':'strong, enthusiastic, or wholehearted, as in hearty approval or a hearty laugh','level':'L1'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5872:[
 {'op':'update','sid':'sense:hiss:4a0c6a70fff15edb','level':'L1','cn':'嘶嘶声；持续/尖锐的 s 音','en':'a long or sharp s-like hissing sound'},
 {'op':'update','sid':'sense:hiss:a4c13e9e02bd5e64','level':'L1','cn':'发出嘶嘶声','en':'to make a long or sharp s-like hissing sound'},
 {'op':'record_note','field':'usage_note','value':'Hissing may express audience disapproval or angry speech, but disapproval is a context/extension, not the defining condition; snakes, gas/steam, hot objects, etc. also hiss.'},
 {'op':'rebuild_core','levels':['L1','L2']}
]
}
