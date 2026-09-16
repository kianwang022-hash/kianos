#!/usr/bin/env python3
PATCHES={
5426:[{'op':'core','cn':'妻子；已婚女性（相对于其配偶而言）','en':'a wife: a married woman considered in relation to her spouse','ids':['sense:wife:0ac03eaa40035fff'],'pos':'noun'}],
5428:[
 {'op':'update','sid':'sense:will:77b6e6ee5639521f','level':'L1','cn':'将、会；表示将来/预测、意愿，也可表示典型或习惯行为','en':'modal used for future reference or prediction, willingness or intention, and characteristic or habitual behavior'},
 {'op':'construction','pattern':'will + base verb','cn':'将会/愿意/常会做某事','sid':'sense:will:77b6e6ee5639521f','level':'L1'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5430:[{'op':'construction','pattern':'win sb over / win over sb','cn':'说服某人；赢得某人的支持','sid':'sense:win:7f6a558004775e82','level':'L1','en':'to persuade someone or gain their support'}],
5431:[
 {'op':'reuse','sid':'sense:wind:eb5d8230fadf5b8b','level':'L1','cn':'风；自然流动的空气','en':'air moving naturally, especially outdoors'},
 {'op':'reuse','sid':'sense:wind:af50828cee0d596a','level':'L1','cn':'缠绕、卷绕；把某物绕在另一物上','en':'to twist or coil something around something else'},
 {'op':'reuse','sid':'sense:wind:03e0e5a3dfb15a24','level':'L2','cn':'蜿蜒、曲折前进','en':'to follow a twisting or curving course'},
 {'op':'reuse','sid':'sense:wind:07f376699e4e590b','level':'L2','cn':'给钟表等上发条','en':'to tighten or turn the spring of a clock, watch, or mechanism'},
 {'op':'usage','sid':'sense:wind:f9c9edd3fe0e5a50','level':'L3','note':'Breath/ability-to-breathe sense; secondary.'},
 {'op':'construction','pattern':'wind up doing/in/with sth','cn':'最终处于；最终做了……','level':'L1'},
 {'op':'form','type':'heteronym_pronunciation_and_inflection','boundaries':[{'surface':'wind','condition':'noun moving air','note':'pronounced /wɪnd/'},{'surface':'wind','condition':'verb turn/twist/coil or follow a winding course','note':'pronounced /waɪnd/'},{'surface':'wound','condition':'past/past participle of wind /waɪnd/','note':'pronounced /waʊnd/; distinct from injury wound /wuːnd/'}]},
 {'op':'relation','target':5471,'relation_type':'irregular_inflection','boundary':'wind /waɪnd/ has past/past participle wound /waʊnd/; injury wound is a separate lexeme/sense pronounced /wuːnd/.','field':'semantic_neighbors','source_sid':'sense:wind:af50828cee0d596a'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5432:[{'op':'new','branch':'time_opportunity_window','pos':'noun','cn':'时间窗口；机会窗口','en':'a limited period of time in which something can happen or be done; an opportunity window','level':'L1'},{'op':'construction','pattern':'a window of opportunity','cn':'机会窗口；有利时机','level':'L1'},{'op':'rebuild_core','levels':['L1','L2']}],
5436:[{'op':'construction','pattern':'wipe out sb/sth','cn':'摧毁、消灭、彻底清除；也可使人筋疲力尽','sid':'sense:wipe:68c96c502bb857a6','level':'L1','en':'to destroy, eliminate, erase completely, or exhaust someone'}],
5437:[
 {'op':'new','branch':'electronic_money_transfer','pos':'verb','cn':'电汇；电子转账（钱款）','en':'to transfer money or funds electronically, especially by wire transfer','level':'L1','pattern':'wire money/funds to sb/account'},
 {'op':'demote','sid':'sense:wire:1a2ee7cd2d1a57fe'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5439:[{'op':'demote','sid':'sense:wise:013a81a81e4a5bfa'},{'op':'construction','pattern':'be wise to sth','cn':'察觉、了解某事；看穿某种情况或把戏','sid':'sense:wise:29bcf85be2f9562d','level':'L2','en':'to be aware of or understand a situation or trick'},{'op':'rebuild_core','levels':['L1','L2']}],
5440:[
 {'op':'drop_construction','pattern':'vt. + that-clause / to-inf.'},{'op':'drop_construction','pattern':'wish to do + sth'},
 {'op':'construction','pattern':'wish + past','cn':'希望现在/将来的情况不同（非真实愿望）','sid':'sense:wish:3a3be161de5655ee','level':'L1'},
 {'op':'construction','pattern':'wish + past perfect','cn':'对过去的事情表示遗憾','sid':'sense:wish:3a3be161de5655ee','level':'L1'},
 {'op':'construction','pattern':'wish + would','cn':'希望某人/某事发生改变','sid':'sense:wish:3a3be161de5655ee','level':'L1'},
 {'op':'construction','pattern':'wish to do sth','cn':'希望做某事（较正式）','sid':'sense:wish:3a3be161de5655ee','level':'L1'},
 {'op':'construction','pattern':'wish sb luck/success','cn':'祝某人好运/成功','sid':'sense:wish:0f925a7ab0ee5978','level':'L1'}
],
5441:[{'op':'construction','pattern':"at one's wits' end",'cn':'束手无策；因担忧或困惑而想不出办法','sid':'sense:wit:b539cd64a1ba5b1c','level':'L1','en':'unable to think what to do because of worry or perplexity'}],
5442:[
 {'op':'update','sid':'sense:witch:2e34b173894c58b1','level':'L1','cn':'巫师、女巫；被认为或被描绘为具有魔法能力的人（传统上常指女性）','en':'a person believed or represented as having magical powers, traditionally often a woman'},
 {'op':'demote','sid':'sense:witch:8271f6e9eb7452e5'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5444:[{'op':'update','sid':'sense:withdraw:adce6e22335b5c89','level':'L1','cn':'撤回、收回、取出；撤回支持/申请/声明或取款','en':'to remove or take back something, including money, support, an application, or a statement'},{'op':'construction','pattern':'withdraw money/support/an application/a statement','cn':'取款；撤回支持/申请/声明','sid':'sense:withdraw:adce6e22335b5c89','level':'L1'},{'op':'rebuild_core','levels':['L1','L2']}],
5445:[{'op':'construction','pattern':'withhold sth from sb','cn':'拒绝给予/隐瞒某人某物（如信息、付款、同意）','sid':'sense:withhold:2a887bde8bbf5f21','level':'L1'},{'op':'demote','sid':'sense:withhold:d2ce6e9d283b5ef1'},{'op':'rebuild_core','levels':['L1','L2']}],
5446:[{'op':'demote','sid':'sense:within:03eaef0489825cae'},{'op':'rebuild_core','levels':['L1','L2']}],
5447:[{'op':'demote','sid':'sense:without:475cc3f6203c5abc'},{'op':'demote','sid':'sense:without:56874a5863175a9d'},{'op':'construction','pattern':'go without sth','cn':'没有某物也凑合/忍受过去','sid':'sense:without:586a65efe3ce562e','level':'L1','en':'to manage or endure without having something'},{'op':'rebuild_core','levels':['L1','L2']}],
5451:[
 {'op':'reuse','sid':'sense:woman:4aa2f1d404825a57','level':'L1','cn':'成年女性','en':'an adult female person'},
 {'op':'form','type':'noun_modifier_and_register_boundary','boundaries':[{'surface':'woman + noun','condition':'attributive noun modifier','note':'noun modifier such as woman doctor; do not treat woman as a freely productive adjective'},{'surface':'his/her woman','condition':'possessive partner use','note':'informal/old-fashioned and may be offensive; not neutral learner-main usage'}]},
 {'op':'core','cn':'成年女性','en':'an adult female person','ids':['sense:woman:4aa2f1d404825a57'],'pos':'noun'}
],
5452:[{'op':'construction','pattern':'wonder if/whether + clause','cn':'想知道是否……','sid':'sense:wonder:94a3212aded75cc6','level':'L1'},{'op':'construction','pattern':'wonder wh- + clause','cn':'想知道谁/什么/哪里/为什么等……','sid':'sense:wonder:94a3212aded75cc6','level':'L1'}],
5456:[{'op':'construction','pattern':"pull the wool over sb's eyes",'cn':'蒙骗某人；欺骗某人','level':'L1','en':'to deceive someone'}],
5457:[{'op':'construction','pattern':'in other words','cn':'换句话说','level':'L1'},{'op':'construction','pattern':'by word of mouth / word of mouth','cn':'通过口头传播；口碑','sid':'sense:word:42ab5be268bb53fc','level':'L1'}],
5458:[
 {'op':'construction','pattern':'work out a problem/answer','cn':'解决、算出问题/答案','level':'L1'},
 {'op':'construction','pattern':'work out','cn':'锻炼','sid':'sense:work:673ee53c39ef50cf','level':'L1','en':'to exercise'},
 {'op':'construction','pattern':'things work out / work out well','cn':'事情最终发展、成功或产生结果','sid':'sense:work:1bb70781fd9d550c','level':'L1'},
 {'op':'construction','pattern':'find work','cn':'找到工作、就业','sid':'sense:work:6c71e1924b1c597d','level':'L1'},
 {'op':'construction','pattern':'out of work','cn':'失业；没有工作','sid':'sense:work:6c71e1924b1c597d','level':'L1'},
 {'op':'relation','target':5339,'rid':'deep:confusables:work:29ed1fca8aeb1777','relation_type':'confusable','field':'confusables','boundary':'work /wɜːrk/ means labor/function; walk /wɔːk/ means move on foot. Keep spelling/pronunciation and meanings distinct.'}
],
5464:[
 {'op':'usage','sid':'sense:worm:6d20fc6d181c55c3','level':'L3','register':'derogatory','note':'Insulting/derogatory person-use; not neutral.'},
 {'op':'usage','sid':'sense:worm:f999e2e8c22c54e9','level':'L3','register':'specialist','note':'Mechanical worm-gear sense.'},
 {'op':'usage','sid':'sense:worm:6cf352f0a3835e8a','level':'L3','register':'specialist','note':'Animal-treatment verb.'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5465:[
 {'op':'construction','pattern':'worry about sb/sth','cn':'担心某人/某事','sid':'sense:worry:ec1ef18bee8453ba','level':'L1'},
 {'op':'construction','pattern':'worry that + clause','cn':'担心……','sid':'sense:worry:ec1ef18bee8453ba','level':'L1'},
 {'op':'construction','pattern':'worry sb','cn':'使某人担心/烦恼','sid':'sense:worry:6d3737527210512e','level':'L1'},
 {'op':'demote','sid':'sense:worry:c9e2c084cf3552fb'}
],
5467:[
 {'op':'construction','pattern':'be worth + amount/noun/pronoun','cn':'价值为……；值得……','sid':'sense:worth:7cc12a7450315125','level':'L1'},
 {'op':'construction','pattern':'be worth + V-ing','cn':'值得做……','sid':'sense:worth:9c9841dfc91b5160','level':'L1','note':'Do not use *worth to do.'},
 {'op':'record_note','field':'grammar_note','value':'Use be worth + noun/amount/pronoun or be worth + V-ing; avoid learner error *worth to do.'}
],
5468:[{'op':'construction','pattern':'it is worthwhile to do sth','cn':'做某事是值得的','sid':'sense:worthwhile:26cf32e255625ced','level':'L1'},{'op':'construction','pattern':'doing sth is worthwhile','cn':'做某事值得','sid':'sense:worthwhile:26cf32e255625ced','level':'L1'}],
5470:[
 {'op':'update','sid':'sense:would:f1495224cc8a5490','level':'L1','cn':'would：用于假设/条件结果、过去反复习惯、礼貌愿望或偏好等','en':'modal used for hypothetical or conditional results, repeated past habits, polite desires, and preferences; also traditionally the past form of will'},
 {'op':'construction','pattern':'would like + noun/to do','cn':'想要……/想做……（礼貌）','sid':'sense:would:f1495224cc8a5490','level':'L1'},
 {'op':'construction','pattern':'would rather + base verb','cn':'宁愿做……','sid':'sense:would:f1495224cc8a5490','level':'L1'}
],
5471:[
 {'op':'demote','sid':'sense:wound:2a53900158225923'},{'op':'demote','sid':'sense:wound:59cbda8dabec5dcf'},
 {'op':'form','type':'pronunciation_and_inflection_boundary','boundaries':[{'surface':'wound','condition':'injury noun/verb','note':'pronounced /wuːnd/'},{'surface':'wound','condition':'past/past participle of wind /waɪnd/','note':'pronounced /waʊnd/; not an injury sense'}]},
 {'op':'relation','target':5431,'relation_type':'irregular_inflection','boundary':'wound /waʊnd/ is the past/past participle of wind /waɪnd/; injury wound is pronounced /wuːnd/.','field':'semantic_neighbors'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5472:[{'op':'construction','pattern':'wrap up sth / wrap sth up','cn':'结束、完成；作总结','level':'L1','en':'to finish, conclude, complete, or summarize something'}]
}
