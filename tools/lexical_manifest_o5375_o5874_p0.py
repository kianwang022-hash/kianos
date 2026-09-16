#!/usr/bin/env python3
PATCHES={
5377:[
 {'op':'reuse','sid':'sense:weed:6842a249f2fb5fd8','level':'L1','cn':'杂草；不需要的野生植物','en':'a wild plant growing where it is not wanted, especially among crops or garden plants'},
 {'op':'reuse','sid':'sense:weed:fe897141451c5559','level':'L1','cn':'除草；拔除杂草','en':'to remove weeds from an area of ground'},
 {'op':'new','branch':'informal_cannabis','pos':'noun','cn':'大麻；marijuana（非正式）','en':'informal: cannabis or marijuana','level':'L2','usage':{'register':'informal','note':'Informal familiar-new sense; keep distinct from the ordinary plant/gardening senses.','writing_safe':False}},
 {'op':'construction','pattern':'weed out sb/sth','cn':'剔除；淘汰；清除','level':'L2'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5379:[
 {'op':'update','sid':'sense:weekday:8dccd672c39251a2','level':'L1','cn':'工作日；通常指周一至周五','en':'a day other than the weekend, typically Monday to Friday'},
 {'op':'construction','pattern':'on weekdays','cn':'在工作日；周一至周五','sid':'sense:weekday:8dccd672c39251a2','level':'L1'},
 {'op':'core','cn':'工作日；通常为周一至周五','en':'a weekday: a day other than the weekend, typically Monday to Friday','ids':['sense:weekday:8dccd672c39251a2'],'pos':'noun'}
],
5382:[
 {'op':'update','sid':'sense:weep:8afe539c5cd15329','level':'L1','cn':'哭泣；因强烈情绪而流泪','en':'to shed tears because of strong emotion, including sadness, pain, anger, or joy'},
 {'op':'usage','sid':'sense:weep:c37f2728a2055abe','level':'L2','note':'Sorrow-for use; lower than the ordinary intransitive weep sense.'},
 {'op':'usage','sid':'sense:weep:2f85cc1550a65ecc','level':'L3','note':'Extended liquid seep/drip use.'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5384:[
 {'op':'update','sid':'sense:weight:465cc59d8bd45900','level':'L1','cn':'重量；人或物有多重','en':'how heavy a person or thing is; the amount that a person or thing weighs'},
 {'op':'usage','sid':'sense:weight:7e113f68f2cf50ab','level':'L2','register':'scientific','note':'Physics: the force on a mass due to gravity; keep distinct from ordinary body/object weight.'},
 {'op':'core','cn':'重量；人或物有多重；也可指重要性、权重等','en':'how heavy a person or thing is; also importance or assigned statistical weight','ids':{'noun':['sense:weight:465cc59d8bd45900','sense:weight:6536a623a9695f69','sense:weight:62b190ea7dae55fd'],'verb':['sense:weight:2ff2874201c756e9','sense:weight:9cb2ee1be2b554ef']}}
],
5385:[
 {'op':'demote','sid':'sense:weird:78baaedc070c5815'},
 {'op':'usage','sid':'sense:weird:c1f0a8ddd92a53df','level':'L1'},
 {'op':'core','cn':'奇怪的；不同寻常的','en':'strange, odd, or unusual','ids':['sense:weird:c1f0a8ddd92a53df'],'pos':'adjective'}
],
5386:[
 {'op':'construction','pattern':"You're welcome",'cn':'不客气；用于回应感谢','level':'L1','en':'a polite reply to thanks'},
 {'op':'construction','pattern':'be welcome to do/use sth','cn':'可以、尽管做/使用某事物','sid':'sense:welcome:ca84575d37ed55c8','level':'L1','en':'to be permitted or free to do or use something'}
],
5388:[
 {'op':'new','branch':'degree_intensifier','pos':'adverb','cn':'很；大大地；远远地（用于形容词、副词或比较/数量前）','en':'used before adjectives, adverbs, comparisons, times, or amounts to mean very, fully, or by a large amount','level':'L1','pattern':'well + adjective/adverb/comparison'},
 {'op':'construction','pattern':'as well','cn':'也；还','level':'L1','en':'also; in addition'},
 {'op':'construction','pattern':'as well as','cn':'除……之外还；以及','level':'L1','en':'in addition to; and also'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5389:[
 {'op':'new','branch':'proper_western_world','pos':'noun','cn':'西方；西方国家或文化政治区域（the West）','en':'the West: Western countries or the Western cultural and geopolitical region','level':'L2'},
 {'op':'form','type':'capitalization_sense_boundary','boundaries':[{'surface':'west','condition':'direction/geographic part','note':'lowercase for direction or the western part of a place'},{'surface':'West','condition':'the West / cultural-geopolitical region','note':'capitalized for the Western countries/cultural-geopolitical region'}]},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5390:[
 {'op':'update','sid':'sense:western:ae3060bb430f5326','level':'L1','cn':'西部的；向西的；地理上位于西方的','en':'situated in, toward, or relating to the west or western part of a place'},
 {'op':'new','branch':'western_world_cultural','pos':'adjective','cn':'西方世界的；西方文化或政治传统的（Western）','en':'Western: relating to the Western world, its cultures, or political traditions','level':'L2'},
 {'op':'form','type':'capitalization_sense_boundary','boundaries':[{'surface':'western','condition':'direction/geography or western genre','note':'lowercase for ordinary direction/geographic use and the western film/novel noun'},{'surface':'Western','condition':'Western world/culture/politics','note':'capitalized when referring to the Western cultural or political world'}]},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5394:[
 {'op':'form','type':'pos_use_boundary','boundaries':[{'surface':'whatever','condition':'pronoun/free-choice','note':'any thing(s) that; no matter what'},{'surface':'whatever + noun','condition':'determiner','note':'any/no matter which noun'}]},
 {'op':'construction','pattern':'whatever + noun','cn':'无论什么/任何……','sid':'sense:whatever:3689fbe73143518e','level':'L1'},
 {'op':'construction','pattern':'whatever + clause','cn':'无论发生/选择什么；不管什么','sid':'sense:whatever:3689fbe73143518e','level':'L1','en':'no matter what; free-choice or concessive use'}
],
5395:[
 {'op':'update','sid':'sense:whatsoever:d6a48ad132fa5914','level':'L1','pos':'adverb','pattern':'no/none/any + noun/pronoun + whatsoever','cn':'任何；丝毫（用于否定或自由选择表达中加强语气）','en':'used after a negative or free-choice expression for emphasis: of any kind at all'},
 {'op':'construction','pattern':'no/none/any ... whatsoever','cn':'任何……都没有/任何…… whatsoever（强调）','sid':'sense:whatsoever:d6a48ad132fa5914','level':'L1'}
],
5403:[
 {'op':'update','sid':'sense:wherever:56f23cc75a0e5077','level':'L1','pos':'adverb/conjunction','cn':'无论哪里；在任何……的地方','en':'in any place, or no matter where; used to introduce a free-choice/concessive clause'},
 {'op':'construction','pattern':'wherever + clause','cn':'无论在哪里；凡是……的地方','sid':'sense:wherever:56f23cc75a0e5077','level':'L1'}
],
5404:[
 {'op':'demote','sid':'sense:whether:b310840e25fd562a'},
 {'op':'construction','pattern':'whether ... or ...','cn':'是……还是……；无论……还是……','sid':'sense:whether:4856fdce3c55549c','level':'L1'},
 {'op':'construction','pattern':'whether or not','cn':'是否；无论是否','sid':'sense:whether:c9f394398b835567','level':'L1'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5408:[
 {'op':'construction','pattern':'whip up sth / whip sth up','cn':'很快做出/准备；激起、煽起情绪、支持或兴奋','level':'L1','en':'to prepare or make something quickly, especially food; also to stir up or arouse emotion, support, or excitement'}
],
5412:[
 {'op':'construction','pattern':'blow the whistle on sb/sth','cn':'揭发、举报某人/某事的不当行为','level':'L1','en':'to expose or report wrongdoing'}
]
}
