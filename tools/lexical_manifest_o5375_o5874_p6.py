#!/usr/bin/env python3
PATCHES={
5675:[{'op':'new','branch':'figurative_indicator_measure','pos':'noun','cn':'晴雨表、指标；衡量条件、舆论、信心等变化的标志','en':'figurative: an indicator or measure of changes in conditions, opinion, confidence, or similar states','level':'L2'},{'op':'rebuild_core','levels':['L1','L2']}],
5677:[
 {'op':'update','sid':'sense:bazaar:cbd6f1353c0c574a','level':'L1','cn':'集市、市场；有许多小摊位或小店的市场','en':'a market or marketplace with many small stalls or shops'},
 {'op':'update','sid':'sense:bazaar:ffab52e977ec5681','level':'L2','cn':'慈善义卖会、募款集市','en':'a bazaar or sale held to raise money, especially for charity'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5679:[{'op':'usage','sid':'sense:beetle:313d5c7b22575351','level':'L3','note':'Low-value verb meaning move/fly quickly; insect noun remains Core.'},{'op':'core','cn':'甲虫','en':'a beetle: an insect with hardened front wings covering the flying wings','ids':['sense:beetle:e1cb9bb7909d513f'],'pos':'noun'}],
5681:[{'op':'update','sid':'sense:bestow:ff7da29dc94c55a5','level':'L1','cn':'授予、赠予；把荣誉、礼物、权利等给予某人','en':'to give or grant something as an honor, gift, or right'},{'op':'construction','pattern':'bestow sth on/upon sb','cn':'把某物授予/赠予某人','sid':'sense:bestow:ff7da29dc94c55a5','level':'L1'},{'op':'core','cn':'授予、赠予','en':'to give or grant something as an honor, gift, or right','ids':['sense:bestow:ff7da29dc94c55a5'],'pos':'verb'}],
5682:[{'op':'update','sid':'sense:biotech:2f3d3ef0b9695420','level':'L1','cn':'生物技术；利用生物体、细胞、生物系统或其组成部分开发产品或工艺','en':'biotechnology: the use of organisms, cells, biological systems, or biological components to develop products or processes'},{'op':'core','cn':'生物技术','en':'the use of biological systems or components to develop products or processes','ids':['sense:biotech:2f3d3ef0b9695420'],'pos':'noun'}],
5684:[
 {'op':'update','sid':'sense:bitterness:e8bdee9d22c65802','level':'L1','cn':'怨恨、愤懑；长期的愤怒或不满','en':'resentment, anger, or hostility caused by unfairness, hurt, or disappointment'},
 {'op':'update','sid':'sense:bitterness:672cfd784720566e','level':'L1','cn':'苦味；苦的性质','en':'the quality of having a bitter or harsh taste'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5686:[{'op':'update','sid':'sense:bleach:27ddf0607f515dab','level':'L1','cn':'漂白剂；用于漂白、去色或消毒的化学制品','en':'a chemical or product used to whiten, remove color, or disinfect'},{'op':'update','sid':'sense:bleach:a5e9331cdc8d5687','level':'L1','cn':'漂白、使褪色','en':'to remove or lighten color from something'},{'op':'rebuild_core','levels':['L1','L2']}],
5687:[{'op':'construction','pattern':'in the blink of an eye','cn':'转眼间；极快地、一瞬间','sid':'sense:blink:f534f1131c24514f','level':'L1','en':'extremely quickly; in an instant'}],
5688:[
 {'op':'update','sid':'sense:blond:b3cfb28c76bd5e3a','level':'L2','cn':'金发的人','en':'a person with blond or light-colored hair'},
 {'op':'update','sid':'sense:blond:a181cffba0595ad2','level':'L1','cn':'金色/浅色头发的；金发的','en':'having blond or light-colored hair'},
 {'op':'form','type':'spelling_and_traditional_gender_boundary','boundaries':[{'surface':'blond','condition':'common adjective/noun spelling','note':'widely used; modern usage varies'},{'surface':'blonde','condition':'variant spelling, traditionally feminine noun/adjective','note':'same owner; traditional gendered convention is not a semantic split'}],'aliases':['blonde']},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5692:[
 {'op':'new','branch':'literal_put_bridle_or_restrain','pos':'verb','cn':'给马戴笼头；控制、约束','en':'to put a bridle on a horse; more generally, to control or restrain','level':'L2'},
 {'op':'construction','pattern':'bridle at sth','cn':'对某事感到愤怒或不满','sid':'sense:bridle:d8bcdc80e3ac580a','level':'L1','en':'to react with anger or resentment'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5694:[{'op':'form','type':'proper_name_capitalization','boundaries':[{'surface':'Buddhism','condition':'religion/doctrine proper name','note':'capitalized proper name'}],'aliases':['Buddhism']}],
5698:[{'op':'update','sid':'sense:bushel:a5719d18e7d655e7','level':'L2','cn':'蒲式耳；干量单位，美国习惯制与英制数值不同','en':'a dry-volume unit whose value differs between U.S. customary and imperial systems'},{'op':'record_note','field':'usage_note','value':'Bushel is a dry-volume unit. U.S. customary and imperial bushels have different values; do not treat one British liquid-or-dry measure as universal.'}],
5699:[
 {'op':'new','branch':'informal_buttocks','pos':'noun','cn':'屁股、臀部（非正式/粗俗）','en':'informal/vulgar: the buttocks or bottom','level':'L2','usage':{'register':'informal/vulgar','note':'Common body-part sense; register-marked.','writing_safe':False}},
 {'op':'new','branch':'head_butt_verb','pos':'verb','cn':'用头撞；顶撞','en':'to strike or push with the head; to head-butt','level':'L2'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5703:[{'op':'update','sid':'sense:capacitance:432fbaf0cd4254e4','level':'L2','cn':'电容；系统储存电荷的能力，定量为电荷与电势差之比 C=Q/V','en':'the electrical property or ability of a system to store charge, quantitatively charge per potential difference (C = Q/V)'},{'op':'core','cn':'电容；储存电荷的能力（C=Q/V）','en':'capacitance: electrical charge stored per unit potential difference','ids':['sense:capacitance:432fbaf0cd4254e4'],'pos':'noun'}],
5708:[{'op':'relation','target':6495,'relation_type':'confusable','field':'confusables','boundary':'censor means examine/suppress objectionable material; censure means strongly criticize or formally condemn. Keep the lexemes distinct.'}],
5709:[{'op':'new','branch':'ceramic_material_class','pos':'noun','cn':'陶瓷材料；由无机非金属材料经高温等工艺制成的硬质材料类别','en':'ceramic as a material/class: a hard inorganic nonmetallic material, typically made from minerals and processed at high temperature','level':'L1'},{'op':'rebuild_core','levels':['L1','L2']}],
5710:[
 {'op':'update','sid':'sense:cereal:6b004207769b5de8','level':'L1','cn':'谷类作物；为可食用谷粒而栽培的禾本科植物，如小麦、水稻、黑麦、燕麦、玉米、小米等','en':'a grass cultivated for its edible grain, such as wheat, rice, rye, oats, maize, or millet'},
 {'op':'new','branch':'breakfast_prepared_cereal','pos':'noun','cn':'早餐谷物食品；由谷物制成的即食/加工食品','en':'breakfast cereal: a prepared grain food commonly eaten at breakfast','level':'L1'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5712:[{'op':'new','branch':'figurative_deep_division','pos':'noun','cn':'鸿沟、巨大分歧；人群、观点或处境之间的深刻差距','en':'figurative: a deep division or gulf between people, groups, opinions, or conditions','level':'L2','pattern':'a chasm between A and B'},{'op':'rebuild_core','levels':['L1','L2']}],
5717:[{'op':'construction','pattern':'clamp down on sth','cn':'严厉压制、限制或取缔某事','sid':'sense:clamp:92eb35e2c1635ea7','level':'L1','en':'to take strong action to suppress or restrict something'}],
5719:[
 {'op':'update','sid':'sense:cleanliness:9e5f139b81c85b05','level':'L1','cn':'清洁、干净的状态或品质','en':'the state or quality of being clean'},
 {'op':'update','sid':'sense:cleanliness:bb83b47fa39b5f3e','level':'L2','cn':'保持清洁的习惯或做法','en':'the practice or habit of keeping oneself or a place clean'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5721:[
 {'op':'new','branch':'circus_comic_performer','pos':'noun','cn':'小丑；马戏团或表演中的滑稽演员','en':'a clown: a comic performer, especially in a circus or entertainment','level':'L1'},
 {'op':'usage','sid':'sense:clown:36be9049cca35b40','level':'L2','register':'informal/insulting','note':'Insulting person-use meaning a fool; not the literal Core.'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5722:[{'op':'update','sid':'sense:coefficient:e7bf97ae36ef5fa6','level':'L1','cn':'系数；数学中乘在某项、变量或表达式前的数值因子；也可指特定领域的系数','en':'a coefficient: a numerical or multiplicative factor of a term, variable, or expression; also a domain-specific measure'},{'op':'core','cn':'系数；数学中的数值乘法因子','en':'a numerical/multiplicative factor of a term, variable, or expression','ids':['sense:coefficient:e7bf97ae36ef5fa6'],'pos':'noun'}],
5724:[{'op':'update','sid':'sense:colonist:a1cea439f45f5ae7','level':'L1','cn':'殖民地定居者；殖民地的成员/移民者','en':'a settler in or member of a colony'},{'op':'core','cn':'殖民地定居者、殖民者','en':'a settler in or member of a colony','ids':['sense:colonist:a1cea439f45f5ae7'],'pos':'noun'}]
}
