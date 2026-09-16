#!/usr/bin/env python3
PATCHES={
5775:[{'op':'construction','pattern':'do sb/sth a disservice','cn':'对某人/某事造成伤害或不利（即使看似在帮忙）','sid':'sense:disservice:19ab70f1a3575699','level':'L1','en':'to harm or disadvantage someone or something, often while appearing to help'}],
5776:[
 {'op':'construction','pattern':'diverge from sth','cn':'偏离、分叉；与……产生分歧','sid':'sense:diverge:cf5dcce1185458ce','level':'L1'},
 {'op':'update','sid':'sense:diverge:4b8f1f6f0cf75fca','level':'L2','cn':'（数列/级数）发散；不收敛到有限极限/有限和','en':'mathematics: for a sequence or series, not to converge to a finite limit or finite sum'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5778:[
 {'op':'update','sid':'sense:dormant:51767adb6ac95037','level':'L1','cn':'休眠的、暂时不活跃的，但仍可能重新活动','en':'temporarily inactive or quiescent but capable of becoming active again'},
 {'op':'update','sid':'sense:dormant:8a237c5951e45927','level':'L2','cn':'（火山等）休眠的，暂未活动但未灭绝','en':'of a volcano or similar system: inactive for now but not extinct'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5780:[{'op':'new','branch':'drainage_system_network','pos':'noun','cn':'排水系统、排水管网；土地/区域排除多余水分的系统','en':'a drainage system or network for removing excess water from land, buildings, or an area','level':'L1'},{'op':'rebuild_core','levels':['L1','L2']}],
5782:[{'op':'new','branch':'figurative_energetic_person','pos':'noun','cn':'精力充沛、行动力很强的人（比喻/非正式）','en':'figurative/informal: a highly energetic, forceful, and productive person','level':'L2','usage':{'register':'figurative/informal','note':'Person-use; electrical generator remains Core.','writing_safe':True}},{'op':'rebuild_core','levels':['L1','L2']}],
5785:[{'op':'form','type':'pos_use_boundary','boundaries':[{'surface':'eastward','condition':'adverb','note':'toward the east'},{'surface':'eastward + noun','condition':'adjective','note':'moving, directed, or extending toward the east, e.g. eastward movement/expansion'}]},{'op':'construction','pattern':'eastward + noun','cn':'向东的……（如向东移动/扩张）','sid':'sense:eastward:c90670d4ba2253a6','level':'L1'}],
5787:[{'op':'form','type':'proper_name_capitalization','boundaries':[{'surface':'Egyptian','condition':'nationality/demonym/adjective relating to Egypt','note':'capitalized proper-nationality use'}],'aliases':['Egyptian']}],
5789:[
 {'op':'update','sid':'sense:elliptical:9a3f04a2108f537f','level':'L1','cn':'椭圆形的；像椭圆的','en':'shaped like an ellipse; elliptical'},
 {'op':'update','sid':'sense:elliptical:1509441a05e75770','level':'L2','cn':'省略的、极简的；因省去成分而表达极其简练的','en':'extremely concise or elliptic through omission of words or details'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5790:[{'op':'new','branch':'figurative_story_embellishment','pos':'noun','cn':'（故事/叙述中的）粉饰、添枝加叶、夸饰','en':'figurative: decorative embellishment or exaggeration added to a story or account','level':'L2'},{'op':'rebuild_core','levels':['L1','L2']}],
5791:[
 {'op':'update','sid':'sense:enchant:5d564a4262d85f08','level':'L1','cn':'使着迷、使陶醉；以魅力使人非常愉悦','en':'figurative/ordinary: to charm, delight, or captivate someone'},
 {'op':'new','branch':'literal_magical_spell','pos':'verb','cn':'施魔法于；使中魔法','en':'literal/fantasy: to put someone or something under a magic spell','level':'L2'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5795:[{'op':'update','sid':'sense:envious:c8745fda7f705c4f','level':'L1','cn':'羡慕的、嫉妒的；想要别人拥有的优势、财物或品质','en':'feeling or showing envy; wanting an advantage, possession, or quality that another person has'},{'op':'core','cn':'羡慕的、嫉妒的','en':'feeling or showing envy','ids':['sense:envious:c8745fda7f705c4f'],'pos':'adjective'}],
5796:[{'op':'construction','pattern':'equate A with B','cn':'把 A 与 B 等同起来；认为二者相当','sid':'sense:equate:db6e212ca7015e81','level':'L1','en':'to regard or treat A as equivalent to B'}],
5799:[
 {'op':'core','cn':'伦理的、道德的；符合道德/职业规范的','en':'relating to ethics or morally/professionally acceptable','ids':{'adjective':['sense:ethical:c979a03bae3f5af0','sense:ethical:59a9ed1f3fe256ae']}},
 {'op':'one_sided','target_expression':'ethnic','relation_type':'confusable','field':'confusables','boundary':'ethical relates to ethics or moral standards; ethnic relates to a people, culture, or ethnic group. Do not confuse the spellings.'}
],
5804:[
 {'op':'update','sid':'sense:excrete:b1d4ed40c9d3555a','level':'L1','cn':'排泄；把代谢废物从体内排出','en':'to eliminate metabolic waste from the body'},
 {'op':'core','cn':'排泄、排出代谢废物','en':'to eliminate metabolic waste from the body','ids':['sense:excrete:b1d4ed40c9d3555a'],'pos':'verb'},
 {'op':'one_sided','target_expression':'secrete','relation_type':'semantic_contrast','boundary':'excrete means eliminate metabolic waste; secrete means produce and release a substance such as a hormone, enzyme, mucus, or fluid.','source_sid':'sense:excrete:b1d4ed40c9d3555a'}
],
5806:[{'op':'new','branch':'public_exhibition_exposition','pos':'noun','cn':'博览会、展览会（较正式/特定名称中）','en':'a public exhibition or exposition/expo','level':'L3','usage':{'register':'formal/event term','note':'Bounded secondary branch; explanation/expository writing remains learner-main.','writing_safe':True}},{'op':'rebuild_core','levels':['L1','L2']}],
5808:[{'op':'update','sid':'sense:faction:ad7449d8e3fc572b','level':'L1','cn':'派系、小集团；较大组织、政党或群体内部竞争/持异议的子群体','en':'a dissenting or competing subgroup within a larger organization, party, or group'},{'op':'core','cn':'派系、小集团','en':'a dissenting or competing subgroup within a larger organization or party','ids':['sense:faction:ad7449d8e3fc572b'],'pos':'noun'}],
5810:[
 {'op':'update','sid':'sense:ferrous:51806fc5ad4054f5','level':'L1','cn':'含铁的、与铁有关的','en':'containing, relating to, or made of iron'},
 {'op':'new','branch':'chemistry_iron_ii','pos':'adjective','cn':'亚铁的；铁(II)的（化学）','en':'chemistry: relating to iron in the +2 oxidation state, iron(II)','level':'L2','usage':{'register':'chemistry','note':'Contrast ferric = iron(III).','writing_safe':True}},
 {'op':'one_sided','target_expression':'ferric','relation_type':'semantic_contrast','boundary':'ferrous in chemistry means iron(II); ferric means iron(III). General ferrous can simply mean containing/relating to iron.','source_sid':'sense:ferrous:51806fc5ad4054f5'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5812:[{'op':'new','branch':'obscene_offensive_language_material','pos':'noun','cn':'猥亵/粗俗/冒犯性的语言或材料','en':'register-marked: obscene, offensive, or filthy language or material','level':'L2','usage':{'register':'offensive/strong language','note':'Secondary register-marked branch; dirt/unclean state remains Core.','writing_safe':False}},{'op':'rebuild_core','levels':['L1','L2']}],
5813:[{'op':'new','branch':'delicate_precise_subtle_manner','pos':'adverb','cn':'精细地、精准地、细腻地；以非常微妙/精密的方式','en':'in a very delicate, precise, refined, or subtle way','level':'L1','pattern':'finely tuned/detailed/balanced'},{'op':'rebuild_core','levels':['L1','L2']}],
5818:[
 {'op':'usage','sid':'sense:flannel:ca99be7b7e7f5c1a','level':'L3','register':'BrE/plural','note':'BrE flannels = trousers; regional secondary use.'},
 {'op':'new','branch':'bre_facecloth','pos':'noun','cn':'（英式）洗脸巾、小毛巾','en':'BrE: a facecloth or washcloth','level':'L3','usage':{'register':'BrE','note':'Regional secondary noun.','writing_safe':True}},
 {'op':'new','branch':'bre_evasive_nonsense_talk','pos':'noun','cn':'（英式非正式）空话、敷衍或胡说','en':'informal BrE: evasive, flattering, or nonsensical talk','level':'L3','usage':{'register':'informal BrE','note':'Regional informal secondary branch.','writing_safe':False}},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5820:[{'op':'update','sid':'sense:flatten:834143930f215f83','level':'L1','cn':'使变平、使更平；变平','en':'to make or become flat or flatter'},{'op':'core','cn':'使/变平、更平；另有音乐降音等专门义','en':'to make or become flat or flatter; with specialist musical uses','ids':{'verb':['sense:flatten:834143930f215f83','sense:flatten:a2b4c7f70f1e583a']}}],
5823:[{'op':'construction','pattern':'in flux','cn':'处于不断变化之中','level':'L1','en':'in a state of continuous change'},{'op':'usage','sid':'sense:flux:743fa294cbb95e05','level':'L2','register':'scientific','note':'Scientific flux: rate of flow of energy, particles, or another quantity through a surface.'},{'op':'rebuild_core','levels':['L1','L2']}],
5824:[{'op':'new','branch':'fencing_sword','pos':'noun','cn':'花剑；击剑用轻剑','en':'a foil: a light fencing sword used in the sport of fencing','level':'L2'},{'op':'rebuild_core','levels':['L1','L2']}]
}
