#!/usr/bin/env python3
PATCHES={
5576:[{'op':'relation','target':3375,'relation_type':'regional_spelling_variant','boundary':'organize and organise are regional spelling variants of the same ordinary verbs; preserve both stable Word owners and exact-spelling lookups.'}],
5577:[
 {'op':'update','sid':'sense:ought:12634c92a24c5f45','level':'L1','pos':'modal','pattern':'ought to + base verb','cn':'应该；表示责任、建议或合宜','en':'modal used with to + base verb to express duty, advice, or what is right'},
 {'op':'update','sid':'sense:ought:c10b88118c315b5b','level':'L1','pos':'modal','pattern':'ought to + base verb','cn':'应该会；表示预期或可能性','en':'modal used with to + base verb to say that something is expected or probable'},
 {'op':'construction','pattern':'ought to + base verb','cn':'应该做……','sid':'sense:ought:12634c92a24c5f45','level':'L1'},
 {'op':'construction','pattern':'ought not to + base verb','cn':'不应该做……','sid':'sense:ought:12634c92a24c5f45','level':'L1'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5578:[
 {'op':'usage','sid':'sense:outskirt:2a3e1a88658d5b39','level':'L3','register':'rare/singular','note':'Ordinary modern learner usage is overwhelmingly plural the outskirts; keep singular outskirt lower/reference.'},
 {'op':'relation','target':3406,'relation_type':'number_lexicalized_form','boundary':'Ordinary learner-main expression is plural the outskirts, including on the outskirts of. Singular outskirt is rare/lower; preserve both stable owners for continuity.'}
],
5580:[
 {'op':'form','type':'capitalization_sense_boundary','boundaries':[{'surface':'Pacific','condition':'Pacific Ocean / geographic adjective','note':'capitalized proper geographic use'},{'surface':'pacific','condition':'peaceful / peace-making adjective','note':'lowercase common adjective'}]},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5583:[
 {'op':'usage','sid':'sense:parlor:01dc2cc6c7cf5328','level':'L1','register':'chiefly AmE','note':'Parlor is chiefly AmE; BrE spelling parlour.'},
 {'op':'usage','sid':'sense:parlor:899cd83b4c495087','level':'L2','register':'old-fashioned','note':'Old-fashioned sitting/reception room sense.'},
 {'op':'form','type':'regional_spelling_variant','boundaries':[{'surface':'parlor','condition':'AmE','note':'chiefly American spelling'},{'surface':'parlour','condition':'BrE','note':'British spelling; same owner and senses'}],'aliases':['parlour']}
],
5586:[
 {'op':'reuse','sid':'sense:pluck:b557c5df5b1d5944','level':'L1','cn':'拔、摘、拉、拨；迅速或突然地拉取/摘取','en':'to pull, pick, or remove something quickly or sharply, such as feathers, fruit, or a string'},
 {'op':'reuse','sid':'sense:pluck:0d3da1ec9ded5f4c','level':'L3','cn':'勇气、胆量（较老式）','en':'courage and determination, especially in a difficult situation'},
 {'op':'construction','pattern':'pluck sth from ...','cn':'从……中迅速拔/摘/取出某物','sid':'sense:pluck:b557c5df5b1d5944','level':'L1'},
 {'op':'construction','pattern':'pluck up courage','cn':'鼓起勇气','sid':'sense:pluck:0d3da1ec9ded5f4c','level':'L2'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5589:[
 {'op':'one_sided','target_expression':'practical','relation_type':'semantic_contrast','boundary':'practicable means feasible/capable of being done; practical means useful, realistic, or concerned with actual doing.','source_sid':'sense:practicable:42e41a220d045256'}
],
5593:[{'op':'relation','target':3931,'relation_type':'regional_lexical_equivalent','boundary':'railroad is especially AmE; railway is BrE/common international usage. They are regional lexical equivalents, not spelling aliases.','source_sid':'sense:railroad:0e36e363fc98525d'}],
5594:[
 {'op':'relation','target':3962,'relation_type':'regional_spelling_variant','boundary':'realize and realise are regional spelling variants; preserve both stable Word owners and exact-spelling lookup ownership.'},
 {'op':'new','branch':'financial_realize_assets_profit','pos':'verb','cn':'变现资产；实现/获得利润或货币回报','en':'finance/business: to convert assets into money or obtain a monetary return or profit','level':'L2','pattern':'realize assets/a profit'},
 {'op':'rebuild_core','levels':['L1','L2']}
],
5596:[
 {'op':'relation','target':3988,'relation_type':'regional_spelling_variant','boundary':'recognize and recognise are regional spelling variants; preserve both stable Word owners and exact-spelling lookups.'},
 {'op':'construction','pattern':'recognize A as B','cn':'承认/认定 A 为 B','sid':'sense:recognize:1f46f5d6eaaa58a8','level':'L1'},
 {'op':'construction','pattern':'recognize that + clause','cn':'承认/认识到……','sid':'sense:recognize:1f46f5d6eaaa58a8','level':'L1'}
],
5597:[{'op':'construction','pattern':'repent of sth/doing sth','cn':'为错误行为真诚后悔并希望改变','sid':'sense:repent:ceb3955822205cb5','level':'L1'}],
5620:[{'op':'new','branch':'ai_transformer_architecture','pos':'noun','cn':'Transformer：主要基于注意力机制的神经网络架构/模型家族','en':'computing/AI: a neural-network architecture or model family based primarily on attention mechanisms','level':'L2','usage':{'register':'technical/AI','note':'Current technical sense; distinct from the electrical voltage-changing device.','writing_safe':True}},{'op':'rebuild_core','levels':['L1','L2']}]
}
