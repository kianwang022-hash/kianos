#!/usr/bin/env python3
PATCHES={
5725:[
 {'op':'update','sid':'sense:combustion:fd86f0c910195be2','level':'L2','cn':'燃烧；物质与氧化剂发生的放热化学反应，通常与氧有关并产生热，有时伴随光','en':'an exothermic chemical reaction with an oxidizer, commonly oxygen, producing heat and sometimes light'},
 {'op':'usage','sid':'sense:combustion:cd3efdb161fb5c9b','level':'L3','note':'Figurative violent turmoil/disturbance; secondary.'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5727:[{'op':'update','sid':'sense:competitor:69474b03b734560a','level':'L1','cn':'竞争者、竞争对手；与另一方竞争的人、组织、产品或生物','en':'a person, organization, product, or organism that competes with another'},{'op':'core','cn':'竞争者、竞争对手','en':'a person, organization, product, or organism that competes with another','ids':['sense:competitor:69474b03b734560a'],'pos':'noun'}],
5731:[
 {'op':'new','branch':'roman_historical_consul','pos':'noun','cn':'（古罗马）执政官','en':'historical: one of the chief magistrates of ancient Rome','level':'L3','usage':{'register':'historical','note':'Historical Roman office; distinct from the modern diplomatic consul.','writing_safe':True}},
 {'op':'usage','sid':'sense:consul:01ad72b6dc57584a','level':'L1'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5734:[
 {'op':'form','type':'homograph_stress_pos_boundary','boundaries':[{'surface':'converse','condition':'verb = talk','note':'verb has standard stress/pronunciation distinct from the reverse/opposite noun/adjective uses'},{'surface':'converse','condition':'noun/adjective = reverse/opposite','note':'homograph with different stress in standard pronunciation'}]},
 {'op':'new','branch':'reverse_opposite_adjective','pos':'adjective','cn':'相反的、逆向的','en':'reverse or opposite in order, direction, or relation','level':'L2'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5735:[
 {'op':'form','type':'pronunciation_boundary','boundaries':[{'surface':'corps','condition':'all ordinary noun uses','note':'pronounced /kɔːr/; final ps is silent'}]},
 {'op':'usage','sid':'sense:corps:c966c18bc3845b9d','level':'L1','note':'Organized body of people, e.g. diplomatic corps; not limited to military corps.'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5739:[{'op':'relation','target':1111,'relation_type':'regional_spelling_variant','boundary':'cozy is usual AmE spelling; cosy is usual BrE spelling. Same ordinary adjective concept; preserve both stable Word owners.'}],
5740:[{'op':'construction','pattern':'crank up sth / crank sth up','cn':'启动；提高、加大或强化某事物','level':'L1','en':'to start, increase, or intensify something'}],
5748:[{'op':'form','type':'singular_plural_usage_boundary','boundaries':[{'surface':'datum','condition':'technical/formal singular','note':'one item or value of data'},{'surface':'data','condition':'plural or mass-noun use','note':'modern general English often treats data as a plural or mass noun'}]},{'op':'usage','sid':'sense:datum:0aa12e53ec4a56b3','level':'L2','register':'technical/formal','note':'Technical/formal singular of data: one item or value of information.'}],
5751:[{'op':'update','sid':'sense:decidedly:de9adae357645e3a','level':'L1','cn':'明显地、肯定地、毫无疑问地','en':'definitely, clearly, or unmistakably'},{'op':'core','cn':'明显地、肯定地','en':'definitely; clearly; unmistakably','ids':['sense:decidedly:de9adae357645e3a'],'pos':'adverb'}],
5755:[
 {'op':'update','sid':'sense:deflection:29fd6771748d59e1','level':'L1','cn':'偏转、偏离；从原来的路线、方向或位置弯离','en':'a deviation or bending away from a course, direction, or position'},
 {'op':'usage','sid':'sense:deflection:0c2343041ed35041','level':'L2','register':'physics/technical','note':'Technical wave/physics deflection branch.'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5756:[
 {'op':'update','sid':'sense:deform:5e468516d5a35eb0','level':'L1','cn':'使变形、使扭曲；使失去正常形状','en':'to cause something to become misshapen or distorted, or to lose its normal form'},
 {'op':'update','sid':'sense:deform:e43b06fc57bc5d41','level':'L1','cn':'变形、扭曲','en':'to become misshapen or distorted'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5757:[
 {'op':'update','sid':'sense:deformation:40b242f84eef5d38','level':'L1','cn':'形变、变形；形状或形态发生改变或扭曲','en':'a change or distortion of shape or form'},
 {'op':'record_note','field':'usage_note','value':'Engineering stress-induced deformation is an important technical application, not the only learner meaning.'}
],
5758:[{'op':'update','sid':'sense:degradation:bd41d24c92a35cae','level':'L1','cn':'退化、恶化、降级；质量、状况、环境、材料或地位的下降','en':'deterioration or decline in quality, condition, environment, material, or status'},{'op':'core','cn':'退化、恶化、降级','en':'deterioration or decline in quality, condition, material, environment, or status','ids':['sense:degradation:bd41d24c92a35cae'],'pos':'noun'}],
5770:[
 {'op':'demote','sid':'sense:disillusion:b764f7db96f4581b'},
 {'op':'update','sid':'sense:disillusion:448b97d4b87b51f9','level':'L1','cn':'使某人不再抱有幻想；使某人认清原先理想化或错误的信念','en':'to cause someone to lose an idealized or false belief; to disillusion someone'},
 {'op':'transitivity','sid':'sense:disillusion:448b97d4b87b51f9','transitivity':'vt','pattern':'disillusion sb'},
 {'op':'core','cn':'使某人不再抱有幻想、认清现实','en':'to cause someone to lose an idealized or false belief','ids':['sense:disillusion:448b97d4b87b51f9'],'pos':'verb'}
],
5772:[
 {'op':'new','branch':'deal_with_finish_quickly','pos':'verb','cn':'迅速处理、解决或完成','en':'to deal with, finish, or dispose of something quickly and efficiently','level':'L2'},
 {'op':'new','branch':'kill_dispatch','pos':'verb','cn':'杀死、处死（较正式/委婉或特定语境）','en':'in some formal/euphemistic contexts, to kill','level':'L3','usage':{'register':'formal/euphemistic','note':'Context-bounded kill sense; keep separate from send/official-message meanings.','writing_safe':True}},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5773:[{'op':'construction','pattern':'dispense with sth','cn':'不用、免除、摒弃某物/某要求','level':'L1','en':'to do without, get rid of, or waive the need for something'}]
}
