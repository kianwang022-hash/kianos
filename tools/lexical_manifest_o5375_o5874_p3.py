#!/usr/bin/env python3
PATCHES={
5525:[{'op':'form','type':'regional_spelling_variant','boundaries':[{'surface':'dishonour','condition':'BrE/common international spelling','note':'British spelling'},{'surface':'dishonor','condition':'AmE spelling','note':'American spelling; same owner and senses'}],'aliases':['dishonor']}],
5526:[{'op':'relation','target':1405,'relation_type':'regional_sense_bounded_spelling_variant','boundary':'disk is standard in computing/magnetic-storage contexts and common AmE generally; disc is conventional for optical discs and common in BrE/anatomical contexts. Do not treat them as blind whole-word aliases.','source_sid':'sense:disk:c2b525998d215732'}],
5528:[{'op':'update','sid':'sense:englishman:fbe1acc9aa385e3d','level':'L2','cn':'英格兰男子；来自 England 的男性（并非泛指英国/UK男子）','en':'a man from England; a gender-specific term distinct from the broader British/UK identity'},{'op':'core','cn':'英格兰男子（不是泛指英国男子）','en':'a man from England; a gender-specific term','ids':['sense:englishman:fbe1acc9aa385e3d'],'pos':'noun'}],
5529:[{'op':'relation','target':1669,'relation_type':'regional_spelling_variant','boundary':'enroll is usual AmE; enrol is common BrE. Preserve both stable Word owners as regional spelling variants.','source_sid':'sense:enroll:fe581c3e3bd053cf'}],
5532:[{'op':'relation','target':1907,'relation_type':'regional_spelling_variant','boundary':'fertilizer and fertiliser are regional spelling variants of the same ordinary fertilizer concept; preserve both stable Word owners.','source_sid':'sense:fertilizer:0713a7ee215a5f25'}],
5536:[{'op':'relation','target':3575,'relation_type':'regional_lexical_equivalent','boundary':'gasoline is especially AmE; petrol is especially BrE and common in many other varieties. They are lexical equivalents, not spelling aliases.','source_sid':'sense:gasoline:de9c2378be9d5bd1'}],
5549:[
 {'op':'construction','pattern':'immigrate to + place/country','cn':'移民到某地/某国定居','sid':'sense:immigrate:7e5253228c5956e5','level':'L1'},
 {'op':'one_sided','target_expression':'emigrate','relation_type':'semantic_contrast','boundary':'immigrate focuses on entering another country to live; emigrate focuses on leaving one’s country to live elsewhere.','source_sid':'sense:immigrate:7e5253228c5956e5'},
 {'op':'one_sided','target_expression':'migrate','relation_type':'semantic_contrast','boundary':'migrate is broader movement from one place to another; immigrate specifically focuses on entering a country to live.','source_sid':'sense:immigrate:7e5253228c5956e5'}
],
5552:[
 {'op':'construction','pattern':'infamous for sth','cn':'因坏事/可耻之事而臭名昭著','sid':'sense:infamous:895b7ccacf2252ac','level':'L1'},
 {'op':'one_sided','target_expression':'famous','relation_type':'semantic_contrast','boundary':'famous means well-known and can be positive or neutral; infamous means well-known specifically for something bad or disgraceful.','source_sid':'sense:infamous:895b7ccacf2252ac'}
],
5553:[
 {'op':'relation','target':1666,'relation_type':'regional_style_variant','boundary':'inquire is standard in AmE; BrE uses both, with enquire common for ordinary asking and inquire often formal/official. Preserve both stable owners.'},
 {'op':'construction','pattern':'inquire about sth','cn':'询问、打听某事','sid':'sense:inquire:035913a6cf4c5891','level':'L1'},
 {'op':'construction','pattern':'inquire into sth','cn':'调查、查究某事','sid':'sense:inquire:2aea501e744d5096','level':'L2'}
],
5554:[
 {'op':'relation','target':1667,'relation_type':'regional_style_variant','boundary':'inquiry/enquiry share a regional/style boundary parallel to inquire/enquire; preserve both stable owners and distinguish ordinary request-for-information from official investigation.'},
 {'op':'construction','pattern':'inquiry into sth','cn':'对某事的正式调查','sid':'sense:inquiry:8e8d0a3fff1953d6','level':'L1'}
],
5555:[
 {'op':'new','branch':'medical_postgraduate_intern','pos':'noun','cn':'实习/住院初年医师；在相关制度中处于毕业后第一年或初级阶段的医生（尤其美式英语）','en':'especially AmE: a doctor in the first postgraduate year or a junior doctor in a relevant training system','level':'L2','usage':{'register':'medical/AmE','note':'Distinct from the general student/recent-graduate internship sense.','writing_safe':True}},
 {'op':'form','type':'noun_verb_stress_boundary','boundaries':[{'surface':'intern','condition':'noun (trainee/doctor)','note':'noun commonly stressed on the first syllable: IN-tern'},{'surface':'intern','condition':'verb detain/confine','note':'verb commonly stressed on the second syllable: in-TERN'}]},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5560:[{'op':'relation','target':2708,'relation_type':'regional_spelling_variant','boundary':'kilometer is usual AmE spelling; kilometre is usual BrE spelling. Same metric unit; preserve both stable owners.','source_sid':'sense:kilometer:a568b95052c25567'}],
5561:[{'op':'new','branch':'financial_leverage_debt','pos':'noun','cn':'财务杠杆；为提高投资敞口/潜在回报而使用或持有的借款、债务','en':'finance/business: the use or amount of borrowed money or debt to increase investment exposure or potential returns','level':'L2','usage':{'register':'finance/business','note':'Keep distinct from general influence/advantage and the verb leverage = use effectively.','writing_safe':True}},{'op':'rebuild_core','levels':['L1','L2']}],
5562:[{'op':'form','type':'regional_pronunciation_boundary','boundaries':[{'surface':'lieutenant','condition':'BrE pronunciation','note':'commonly /lefˈtenənt/'},{'surface':'lieutenant','condition':'AmE pronunciation','note':'commonly /luːˈtenənt/'}]}],
5564:[{'op':'relation','target':2855,'relation_type':'regional_spelling_variant','boundary':'liter is usual AmE spelling; litre is usual BrE spelling. Same metric volume unit; preserve both stable owners.','source_sid':'sense:liter:3885d4c8e377557b'}]
}
