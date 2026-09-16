#!/usr/bin/env python3
PATCHES={
5477:[{'op':'relation','target':4168,'rid':'deep:confusables:write:828f980f1efa1a11','relation_type':'confusable','field':'confusables','boundary':'write means form/compose/communicate in writing; right has different meanings/spelling. Keep write/right distinct.'}],
5479:[{'op':'construction','pattern':'it is wrong to do sth','cn':'做某事是不对的/错误的','sid':'sense:wrong:e09591bcd2e25f01','level':'L1'}],
5481:[
 {'op':'reuse','sid':'sense:yawn:0cd17f71baf454e1','level':'L1','cn':'打哈欠','en':'to open the mouth and take a deep involuntary breath, usually from tiredness or boredom'},
 {'op':'reuse','sid':'sense:yawn:0dbff70a6bfb599c','level':'L1','cn':'哈欠','en':'an involuntary deep breath through a wide-open mouth, usually from tiredness or boredom'},
 {'op':'core','cn':'打哈欠；哈欠','en':'to yawn; a yawn','ids':{'verb':['sense:yawn:0cd17f71baf454e1'],'noun':['sense:yawn:0dbff70a6bfb599c']}}
],
5483:[{'op':'demote','sid':'sense:yearly:b4f07b3ca0dc5403'},{'op':'rebuild_core','levels':['L1','L2']}],
5484:[
 {'op':'relation','target':4300,'relation_type':'semantic_contrast','boundary':'yell is a loud shout, often in anger/excitement; scream is a high/loud cry often from fear, pain, or excitement.'},
 {'op':'relation','target':4413,'relation_type':'semantic_contrast','boundary':'yell and shout overlap in loud vocalization; yell often suggests strong emotion, while shout is the broader neutral verb for speaking very loudly.'}
],
5488:[{'op':'new','branch':'additive_intensifying_yet','pos':'adverb','cn':'又一个；更多；更进一步（yet another/more/further）','en':'used with another, more, further, etc. to mean still, even, or additional','level':'L1'},{'op':'construction','pattern':'yet another / yet more / yet further','cn':'又一个；更多；更进一步','level':'L1'},{'op':'rebuild_core','levels':['L1','L2']}],
5493:[{'op':'update','sid':'sense:your:42e27e8b8895544f','level':'L1','pos':'determiner','cn':'你的；你们的（物主限定词）','en':'possessive determiner: belonging to or associated with the person or people being addressed'},{'op':'form','type':'possessive_grammar_boundary','boundaries':[{'surface':'your + noun','condition':'possessive determiner','note':'your must normally modify a noun'},{'surface':'yours','condition':'possessive pronoun','note':'standalone possessive pronoun; distinct word/grammar role'}]}],
5495:[{'op':'new','branch':'count_young_person','pos':'noun','cn':'青年；年轻人（正式/新闻语体中常指年轻男子）','en':'a young person, often a young man in formal or news usage','level':'L2','usage':{'register':'formal/news','note':'Count noun: a youth. Often a young man in formal/news contexts.','writing_safe':True}},{'op':'rebuild_core','levels':['L1','L2']}],
5497:[{'op':'construction','pattern':'zero in on sb/sth','cn':'瞄准；把注意力/努力集中在某人或某事上','level':'L1','en':'to aim at or focus attention or effort on someone or something'},{'op':'demote','sid':'sense:zero:f86aa49d7feb50cf'},{'op':'rebuild_core','levels':['L1','L2']}],
5498:[
 {'op':'update','sid':'sense:zip:47229e0229db5741','level':'L2','cn':'ZIP Code：美国邮政编码（通常5位数字，可扩展为ZIP+4）','en':'ZIP Code: a U.S. postal code of five digits, optionally followed by four additional digits'},
 {'op':'new','branch':'zip_archive_computing','pos':'noun','cn':'ZIP/zip 压缩档案；.zip 文件','en':'a ZIP archive or .zip compressed computer file','level':'L2'},
 {'op':'usage','sid':'sense:zip:8f581243255f5dd2','level':'L3','register':'informal/regional','note':'Informal/regional zero/nothing use.'},
 {'op':'form','type':'capitalization_and_technical_surface_boundary','boundaries':[{'surface':'zip','condition':'zipper/move-fast/general common word','note':'lowercase common-word uses'},{'surface':'ZIP Code','condition':'U.S. postal code','note':'ZIP is capitalized in ZIP Code'},{'surface':'.zip / ZIP archive','condition':'computing archive format','note':'technical file-format surface; case varies by context'}]},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5505:[{'op':'relation','target':98,'relation_type':'regional_spelling_variant','boundary':'airplane is especially AmE; aeroplane is especially BrE. Same aircraft concept, but preserve both stable Word owners.','source_sid':'sense:airplane:91a9496381b95008'}],
5509:[{'op':'form','type':'capitalization_boundary','boundaries':[{'surface':'Arabian','condition':'Arabia/Arabian Peninsula adjective or demonym-related use','note':'capitalized proper-geographic adjective'}],'aliases':['Arabian']}],
5514:[{'op':'usage','sid':'sense:bosom:25bc5f0f4ac1540b','level':'L2','register':'literary/old-fashioned/euphemistic','note':'Body/breast sense is chiefly literary, old-fashioned, or euphemistic in many modern contexts.'},{'op':'construction','pattern':'bosom friend','cn':'知心好友；非常亲密的朋友','level':'L1','en':'a very close friend'}],
5516:[{'op':'construction','pattern':'brim with sth','cn':'充满某种品质、情绪、人或事物','sid':'sense:brim:121002d036735ca2','level':'L1','en':'to be completely full of something'}],
5517:[{'op':'construction','pattern':'bristle at sth','cn':'对某事感到愤怒/受冒犯','sid':'sense:bristle:6ee98a43291a5fcb','level':'L1'},{'op':'construction','pattern':'bristle with sth','cn':'密布、充满某物（常指武器、敌意等）','sid':'sense:bristle:6ee98a43291a5fcb','level':'L2'}],
5519:[{'op':'construction','pattern':'brood over/on sth','cn':'长时间忧虑、愤怒或不快地反复想着某事','sid':'sense:brood:692ffe6671935d6e','level':'L1','en':'to think about something for a long time in a worried, angry, or unhappy way'}]
}
