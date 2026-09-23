#!/usr/bin/env python3
from __future__ import annotations
import copy,hashlib,json,sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"tools"))
import lexical_apply_c_checkpoint_o2851_o3050 as h

RID_NORMALISATION="relation:horizontal:b8232d18be927bb897aa"
RID_MUST_NEED="deep:semantic_contrast:must:"+hashlib.sha256(b"mustnt-vs-neednt").hexdigest()[:16]

def remove_from(s,o,sid,phrase):
    se=h.active(s,o,sid)
    keep=[]; hit=False
    for c in se.get("collocations",[]):
        if c.get("phrase")==phrase:
            hit=True
            cid=c.get("collocation_id")
            if cid in s.colls:
                s.colls[cid]["status"]="deprecated"
                s.colls[cid]["updated_at"]=h.STAMP
                s.changed_collocation_ids.add(cid)
        else:
            keep.append(c)
    se["collocations"]=keep
    if hit:s.mark(o)
    return hit

def set_must_need(s):
    boundary="mustn't = prohibition: do not do it; needn't = absence of necessity: you may do it, but it is unnecessary."
    must=s.record(3162); need=s.record(3200)
    base={
      "relation_id":RID_MUST_NEED,
      "relation_scope":"sense",
      "relation_type":"semantic_contrast",
      "boundary":boundary,
      "boundaries":[boundary],
      "learning_note":boundary,
      "direction":"C",
      "priority":"A",
      "publication_status":"codex_reviewed",
      "verification_status":"verified",
      "writing_safe":True,
      "task_tags":["cloze","writing","reading"]
    }
    mv=copy.deepcopy(base)
    mv.update({
      "source_expression":"mustn't",
      "target_expression":"needn't",
      "source_sense_id":"sense:must:a12c20ee1fdf503e",
      "target_sense_id":"sense:need:bc81e25cfae65772",
      "target_word":"need"
    })
    nv=copy.deepcopy(base)
    nv.update({
      "source_expression":"needn't",
      "target_expression":"mustn't",
      "source_sense_id":"sense:need:bc81e25cfae65772",
      "target_sense_id":"sense:must:a12c20ee1fdf503e",
      "target_word":"must",
      "reciprocal_entrypoint":True
    })
    must["semantic_neighbors"]=[x for x in must.get("semantic_neighbors",[]) if (x.get("relation_id") or x.get("fact_id"))!=RID_MUST_NEED]+[mv]
    need["semantic_neighbors"]=[x for x in need.get("semantic_neighbors",[]) if (x.get("relation_id") or x.get("fact_id"))!=RID_MUST_NEED]+[nv]
    s.mark(3162);s.mark(3200)

def apply(s):
    h.rmphrase(s,3155,"muscle in on + sth")
    h.cons(s,3155,"muscle in (on sth)","强行挤入某个活动或局面并插手/分一杯羹（非正式）",None,"L2","figurative/informal; separate from literal physical-force use")

    h.cons(s,3162,"must not / mustn't + base verb","不得；不许做某事","sense:must:a12c20ee1fdf503e","L1","prohibition, not absence of necessity")
    h.cons(s,3162,"must have + past participle","一定已经……；想必已经……","sense:must:706d6af7e59fa738","L1","past inference from evidence, not obligation")
    h.cons(s,3200,"need not / needn't + base verb","不必；没有必要做某事","sense:need:bc81e25cfae65772","L1","absence of necessity, not prohibition")
    set_must_need(s)

    mute_n=h.put(s,3163,"sense:mute:855f51c881745276",cn="弱音器；静音装置/控制",en="a device or control used to reduce or stop sound, especially a musical-instrument mute or electronic mute control",pos="noun",level="L2")
    h.addc(s,3163,"sense:mute:855f51c881745276","a trumpet mute","小号弱音器","usage_example")
    h.addc(s,3163,"sense:mute:855f51c881745276","mute button","静音按钮","usage_example")
    adj=h.active(s,3163,"sense:mute:be1d6b9a9ea55430")
    adj["usage_note"]="Neutral in uses such as remain mute or mute admiration; using mute to mean unable to speak about a person is old-fashioned and can be offensive."
    s.mark(3163)
    h.coreadd(s,3163,"sense:mute:855f51c881745276","noun","沉默/无声；弱音器或静音控制","silent/muted; a sound-suppression device or control")

    my=h.put(s,3166,"sense:my:950eb0724f755a66",cn="我的",en="belonging to or associated with the speaker, used before a noun",pos="determiner",level="L1",pattern="my + noun")
    my["usage_note"]="my is a possessive determiner before a noun; mine is the possessive pronoun used in place of a noun phrase."
    s.mark(3166)

    remove_from(s,3171,"sense:nail:104c0fe49d3f5afb","nail down + sth")
    h.addc(s,3171,"sense:nail:104c0fe49d3f5afb","nail sth down","用钉子把某物钉牢","usage_example")
    h.cons(s,3171,"nail sth down","把细节/安排确定下来；准确确定或识别某事",None,"L2","informal figurative construction; separate from literal fastening")
    h.rmphrase(s,3171,"nail in the coffin")
    h.cons(s,3171,"a nail in the coffin (of sth)","使失败或终结更可能、更彻底的事件或行动",None,"L2","idiom; not literal nail anatomy/fastener use")

    h.move(s,3173,"naked eye","sense:naked:2ace5a8d959c51ea")
    h.rmphrase(s,3173,"naked truth")
    h.cons(s,3173,"the naked truth","毫无遮掩的真相；赤裸裸的事实",None,"L2","phraseology; not the literal uncovered-body sense")

    napv=h.put(s,3176,"sense:nap:2e1a2832de05505f",cn="小睡；打盹",en="to sleep for a short time, especially during the day",pos="verb",level="L1",pattern="vi.")
    napv["transitivity"]="vi"
    h.core(s,3176,"小睡；打盹；织物绒面","a short sleep or to sleep briefly; also the raised/fuzzy surface of cloth",[
      {"label_cn":"小睡；打盹","label_en":"a short sleep","pos":"noun","sense_ids":["sense:nap:7defb051d8f1569d"]},
      {"label_cn":"小睡；打盹","label_en":"to sleep briefly","pos":"verb","sense_ids":["sense:nap:2e1a2832de05505f"]},
      {"label_cn":"织物绒面；细毛","label_en":"the raised/fuzzy surface of cloth or carpet","pos":"noun","sense_ids":["sense:nap:5366a62130845c5b"]}
    ])

    narr=h.new(s,3178,"explanatory framing noun","noun","叙事；对一系列事件的特定解释或呈现方式","a particular way of explaining, presenting, or understanding a series of events","L2")
    h.addc(s,3178,narr,"construct a narrative","构建一种叙事/解释框架")
    h.addc(s,3178,narr,"competing narratives","相互竞争的叙事/解释")
    h.coreadd(s,3178,narr,"noun","叙述/故事；解释或呈现事件的叙事框架","a story/account; a framing or explanation of events")

    h.put(s,3180,"sense:nasty:ee20a53dcf5c58f3",cn="令人不快的；恶劣的；讨厌的；恶毒的（人/行为）",en="very unpleasant, offensive, or (of a person or behavior) malicious",level="L1")

    nat=h.active(s,3182,"sense:national:0d2ab61808615059")
    for c in nat.get("collocations",[]):
        if c.get("phrase")=="foreign nationals":
            c["meaning_cn"]="外国公民；外籍人士"
            cid=c.get("collocation_id")
            if cid in s.colls:
                s.colls[cid]["current_value_hash"]=h.base.sha(c)
                s.colls[cid]["updated_at"]=h.STAMP
                s.changed_collocation_ids.add(cid)
            s.mark(3182)

    h.put(s,3183,"sense:nationality:29d564161f7a5f8d",cn="国籍；依法/正式属于某个国家的身份或权利",en="the official or legal status or right of belonging to a particular country",level="L1")

    lang=h.new(s,3184,"native language adjective","adjective","母语的；从幼年起作为第一语言使用的","relating to the first language a person learns or has used from earliest childhood","L2")
    h.move(s,3184,"native language",lang)
    h.move(s,3184,"native speaker",lang)
    h.addc(s,3184,lang,"native tongue","母语")
    h.coreadd(s,3184,lang,"adjective","本地/原产的；与生俱来的；母语的","native to a place; innate; relating to a first language")
    native_person=h.active(s,3184,"sense:native:b4982b01f2a455e1")
    native_person["usage_note"]="a native of X is neutral birthplace/origin wording. Using standalone native as a label for Indigenous or colonized peoples can be old-fashioned and offensive."
    s.mark(3184)

    h.coreadd(s,3190,"sense:navy:5377833cc13eff89","noun","海军；海军蓝/深蓝色","a country's naval force; also navy blue")

    h.rmphrase(s,3198,"neck and neck")
    h.cons(s,3198,"neck and neck","并驾齐驱；不分上下；在竞赛或比较中非常接近",None,"L2","idiom; separate from literal body-part sense")
    h.core(s,3198,"脖子/颈；颈状部分；较低层的割颈动词","the neck; a neck-shaped narrow part; lower-layer verb cut the neck of an animal",[
      {"label_cn":"脖子；颈；颈状部分；狭窄地带","label_en":"the body neck; a narrow neck-shaped part","pos":"noun","sense_ids":["sense:neck:d40988d0efa05ad7","sense:neck:0f51c4555df85d78"]},
      {"label_cn":"割颈；宰杀（较低层）","label_en":"to cut the neck of an animal","pos":"verb","sense_ids":["sense:neck:49b9eb88c28a511a"]}
    ])

    for item in s.record(3203).get("constructions",[]):
        if item.get("pattern")=="neglect to do sth":
            item["source_sense_id"]="sense:neglect:8b5318cb47665309"
            item["boundary"]="failure or omission to perform an action; distinct from lack of attention/care to a person or thing"
            s.mark(3203)

    h.rmphrase(s,3207,"in the neighborhood of + sth")
    h.addc(s,3207,"sense:neighborhood:7f1bb25f018052b4","in the neighborhood of + place","在某地附近","usage_example")
    h.cons(s,3207,"in the neighborhood of + number/amount","大约；约莫（尤美式；英式常拼 neighbourhood）",None,"L2","approximation construction, not literal city-area meaning")

    h.cons(s,3210,"have the nerve to do sth","竟敢/有胆量做某事，常带不满或惊讶","sense:nerve:b803629c0862597e","L2")
    h.cons(s,3210,"lose one's nerve","失去勇气或信心；临阵退缩","sense:nerve:b803629c0862597e","L2")

    nest=h.put(s,3212,"sense:nest:6951dafd1c195de9",cn="套叠；把……嵌套/置于另一物中",en="to fit or place one thing inside another, or arrange things in nested levels",pos="verb",level="L2",pattern="I/T: nest sth inside sth; be nested")
    nest["transitivity"]="I/T"
    h.addc(s,3212,"sense:nest:6951dafd1c195de9","nested boxes","套叠的盒子")
    h.addc(s,3212,"sense:nest:6951dafd1c195de9","nest one container inside another","把一个容器套在另一个里面")
    h.core(s,3212,"巢；筑巢；套叠/嵌套","an animal nest; to nest; to fit/place things inside one another",[
      {"label_cn":"巢；窝","label_en":"an animal nest","pos":"noun","sense_ids":["sense:nest:d124ccd150dd5227"]},
      {"label_cn":"筑巢；套叠/嵌套","label_en":"to build/use a nest; to fit/place things in nested levels","pos":"verb","sense_ids":["sense:nest:760d1fe8ebeb5ef9","sense:nest:6951dafd1c195de9"]}
    ])

    netv=h.new(s,3213,"earn yield verb","verb","净赚；净得；获得/带来","to earn, obtain, or yield an amount after deductions, or to gain a result","L2")
    h.addc(s,3213,netv,"net a profit","净赚利润")
    h.addc(s,3213,netv,"net $X","净得X金额")
    h.addc(s,3213,netv,"net sb a result","为某人带来一个结果")
    h.coreadd(s,3213,netv,"verb","用网捕；净赚/净得/带来结果","to catch with a net; to earn/yield an amount or result")

    h.coreadd(s,3214,"sense:network:93e5534eae2f5dde","noun","网络；相互连接的系统","an interconnected system of people, things, computers, or devices")
    h.coreadd(s,3214,"sense:network:85f04cc7cc045156","verb","建立人脉/社交联络；连接设备成网","to build professional/social relationships; to connect devices into a network")

    gear=h.new(s,3215,"vehicle neutral gear noun","noun","空挡；发动机与车轮不接合的挡位/位置","the gear or position in which a vehicle's engine is not connected to the wheels","L2")
    h.addc(s,3215,gear,"in neutral","处于空挡")
    h.addc(s,3215,gear,"put the car in neutral","把车挂空挡")
    h.coreadd(s,3215,gear,"noun","中立者/中立国；车辆空挡","a neutral person/country; the neutral gear position in a vehicle")

    h.rmphrase(s,3216,"never mind")
    h.cons(s,3216,"never mind","没关系；别在意；不用担心",None,"L1","discourse idiom; not literal temporal never")
    h.cons(s,3216,"never mind + noun/gerund","更不用说；更别提",None,"L2","let alone / much less after a negative or impossible context")

    h.move(s,3218,"new to + sb/sth","sense:new:508d24808f345ae7")
    h.cons(s,3218,"be new to sth/somewhere","刚接触/刚来到，对某事或某地还不熟悉","sense:new:508d24808f345ae7","L1")

    for se in s.record(3219).get("senses",[]):
        se["lexical_identity_overlay"]={
          "identity_type":"mass_noun_grammar",
          "surface_lemma":"news",
          "note":"ordinary news is uncountable and takes singular agreement despite -s: The news is good; use a piece/item of news for a countable unit"
        }
    h.addc(s,3219,"sense:news:e4f5d3127dee51f7","a piece/item of news","一条消息/新闻")
    s.mark(3219)

    h.core(s,3222,"美好的；令人愉快的；精细/巧妙的","pleasant or agreeable; also fine/subtle in distinction or skill",[
      {"label_cn":"美好的；令人愉快的；精细的；巧妙的","label_en":"pleasant/agreeable; fine or subtle","pos":"adjective","sense_ids":["sense:nice:19f7ba665e91580f","sense:nice:39d7b0a59f3b5ece"]}
    ])
    for sid in ("sense:nice:19f7ba665e91580f","sense:nice:39d7b0a59f3b5ece"):
        h.overlay(s,3222,sid,{"identity_type":"pronunciation_and_case_identity","surface_lemma":"nice","pronunciation":"/naɪs/","note":"lowercase adjective nice is /naɪs/"})
    h.overlay(s,3222,"sense:nice:8e2ac4d3cc255bcd",{"identity_type":"proper_place_name","surface_lemma":"Nice","case_sensitive":True,"pronunciation":"/niːs/","recommended_disposition":"SOURCE_ONLY","note":"Nice, the French city, is capitalized and pronounced /niːs/; distinct from adjective nice /naɪs/"})

    rec=s.record(3248)
    rec["semantic_neighbors"]=[x for x in rec.get("semantic_neighbors",[]) if (x.get("relation_id") or x.get("fact_id"))!=RID_NORMALISATION]
    s.mark(3248)
    h.overlay(s,3248,"sense:normalisation:66ce4dd08af8598c",{
      "identity_type":"regional_spelling_identity",
      "surface_lemma":"normalisation",
      "paired_form":"normalization",
      "note":"normalisation with -s- is common in BrE; normalization with -z- is standard AmE and also accepted in some British styles; same lexeme"
    })

def main():
    manifest=json.loads((ROOT/"content/lexical/semantic-review/dual/C/o3151-o3250.decision.json").read_text())
    if len(manifest.get("decisions",[]))!=27:
        raise RuntimeError("DECISION_COUNT_MISMATCH")
    s=h.base.Store()
    apply(s)
    touched=set(s.changed_word_ordinals)
    bad=sorted(o for o in touched if not 3151<=o<=3250)
    if bad:
        raise RuntimeError("UNEXPECTED_CHANGED_ORDINALS:"+str(bad))
    s.finalize()
    natural,relations,report=h.no.build()
    if report["status"]!="PASS":
        raise RuntimeError("NATURAL_OWNER_AUDIT_FAILED:"+json.dumps(report,ensure_ascii=False))
    for o in sorted(touched):
        h.no.dump_json(h.no.WORDS_OUT/f"o{o:04d}.json",natural[o])
    if RID_MUST_NEED not in relations:
        raise RuntimeError("MUST_NEED_RELATION_MISSING")
    h.no.dump_json(h.no.relation_owner_path(RID_MUST_NEED),relations[RID_MUST_NEED])
    if RID_NORMALISATION not in relations:
        p=h.no.relation_owner_path(RID_NORMALISATION)
        if p.exists():
            p.unlink()
    print(json.dumps({
      "status":"PASS",
      "range":[3151,3250],
      "changed_count":len(touched),
      "changed_word_ordinals":sorted(touched),
      "shared_repaired":[RID_MUST_NEED],
      "retired_semantic_relation":[RID_NORMALISATION],
      "natural_owner_audit":report["status"]
    },ensure_ascii=False,indent=2))

if __name__=="__main__":
    main()
