#!/usr/bin/env python3
from __future__ import annotations
import copy,json,sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"tools"))
import lexical_apply_c_checkpoint_o2851_o3050 as h

RID_MINIMISE="relation:horizontal:0827b8d5430073309225"
RID_MAJORITY="relation:horizontal:1d9906d8c06f40c2e9bc"
RID_MODERNISATION="relation:horizontal:a65b4f8c093855104199"

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

def set_majority_minority(s):
    boundary="majority = the greater number/part; minority = the smaller number/part. This antonym is sense-bound to the quantitative branches and does not automatically extend to ethnic-group, legal-age, adjective, or other senses."
    maj_rec=s.record(2935)
    min_rec=s.record(3068)
    old=next((x for x in maj_rec.get("semantic_neighbors",[]) if (x.get("relation_id") or x.get("fact_id"))==RID_MAJORITY),{})
    common=copy.deepcopy(old)
    common.update({
        "relation_id":RID_MAJORITY,
        "relation_scope":"sense",
        "relation_type":"antonym",
        "boundary":boundary,
        "boundaries":[boundary],
        "learning_note":boundary,
        "relation_note":boundary,
        "shared_meaning":boundary,
        "direction":"C",
        "priority":"A",
        "publication_status":"codex_reviewed",
        "verification_status":"verified",
        "writing_safe":True
    })
    maj=copy.deepcopy(common)
    maj.update({
        "source_expression":"majority",
        "target_expression":"minority",
        "source_sense_id":"sense:majority:9f0f5f73c0a95879",
        "target_sense_id":"sense:minority:dcb6b234bad3534b",
        "target_word":"minority"
    })
    minor=copy.deepcopy(common)
    minor.update({
        "source_expression":"minority",
        "target_expression":"majority",
        "source_sense_id":"sense:minority:dcb6b234bad3534b",
        "target_sense_id":"sense:majority:9f0f5f73c0a95879",
        "target_word":"majority",
        "reciprocal_entrypoint":True
    })
    maj_rec["semantic_neighbors"]=[x for x in maj_rec.get("semantic_neighbors",[]) if (x.get("relation_id") or x.get("fact_id"))!=RID_MAJORITY]+[maj]
    min_rec["semantic_neighbors"]=[x for x in min_rec.get("semantic_neighbors",[]) if (x.get("relation_id") or x.get("fact_id"))!=RID_MAJORITY]+[minor]
    s.mark(2935); s.mark(3068)

def apply(s):
    h.rmphrase(s,3058,"mind your own business")
    h.cons(s,3058,"mind your own business","别打听或干涉别人的私事；管好你自己的事",None,"L2","informal idiom; can sound rude")

    for sid in ("sense:minimise:0e7beea88b505bf0","sense:minimise:3d0e8ad5822c5c1d"):
        h.overlay(s,3063,sid,{
            "identity_type":"regional_spelling_identity",
            "surface_lemma":"minimise",
            "paired_form":"minimize",
            "note":"minimise is common BrE; minimize is standard AmE and also used by some British styles; same lexeme"
        })

    h.move(s,3064,"minimum wage","sense:minimum:687dce3cc4225112")
    set_majority_minority(s)

    h.put(s,3070,"sense:minute:c7d7e08581985e99",cn="会议记录；会议纪要（通常用复数 minutes）",en="the official written record of what was said or decided at a meeting",level="L2")
    h.addc(s,3070,"sense:minute:c7d7e08581985e99","take/keep the minutes","做/保存会议记录")
    h.put(s,3070,"sense:minute:a58496a5169155d4",cn="把会议或议事过程正式记录下来",en="to make an official written record of a meeting or proceedings",pos="verb",level="L3",pattern="vt. + object")
    noun_overlay={"identity_type":"pronunciation_by_part_of_speech","surface_lemma":"minute","pronunciation":"/ˈmɪnɪt/ for noun and verb","note":"noun/verb minute is /ˈmɪnɪt/; adjective minute meaning extremely small/detailed is /maɪˈnjuːt/ (US also /maɪˈnuːt/)"}
    adj_overlay={"identity_type":"pronunciation_by_part_of_speech","surface_lemma":"minute","pronunciation":"/maɪˈnjuːt/ for adjective (US also /maɪˈnuːt/)","note":"adjective minute meaning extremely small/detailed contrasts with noun/verb /ˈmɪnɪt/"}
    for sid in ("sense:minute:c0731d69839c519d","sense:minute:8357f58a79ff5781","sense:minute:c7d7e08581985e99","sense:minute:a58496a5169155d4"):
        h.overlay(s,3070,sid,noun_overlay)
    for sid in ("sense:minute:08349d58c3365b4b","sense:minute:780ef9cf59205d7c"):
        h.overlay(s,3070,sid,adj_overlay)

    h.put(s,3081,"sense:mission:63d5644544f75c7e",cn="使命；宗旨；核心目标",en="the main purpose or aim that a person or organization is trying to achieve",pos="noun",level="L1")
    h.coreadd(s,3081,"sense:mission:63d5644544f75c7e","noun","使命；宗旨；特殊任务；传教团","a purpose or aim; a special assignment; a missionary organization")
    h.move(s,3081,"mission statement","sense:mission:63d5644544f75c7e")
    h.put(s,3082,"sense:missionary:9ee3b4c935465eb9",cn="传教士",en="a person sent to promote or spread a religion, often in another place or country and sometimes doing educational, medical, or charitable work",level="L1")
    h.rmphrase(s,3082,"missionary position")
    h.cons(s,3082,"missionary position","固定的非宗教短语名称",None,"L3","lexicalized phrase; not the literal religious-mission adjective sense")

    remove_from(s,3084,"sense:mistake:c8742094ac8655f9","to err is human")
    rare=h.active(s,3084,"sense:mistake:c8742094ac8655f9")
    rare["register"]="rare/older"
    rare["usage_note"]="Rare/older intransitive use meaning to make an error; not the normal productive modern pattern."
    s.mark(3084)
    h.core(s,3084,"错误；误解；弄错","an error or misunderstanding; to identify or understand incorrectly",[
        {"label_cn":"错误；过失","label_en":"a wrong action or judgment","pos":"noun","sense_ids":["sense:mistake:ef1f9ee909d751f4"]},
        {"label_cn":"误解；弄错","label_en":"to understand or identify incorrectly","pos":"verb","sense_ids":["sense:mistake:40732345950e526b"]}
    ])

    rec=s.record(3087)
    for cl in rec.setdefault("core_concept",{}).get("core_clusters",[]):
        seen=set()
        cl["sense_ids"]=[x for x in cl.get("sense_ids",[]) if not (x in seen or seen.add(x))]
    s.mark(3087)

    h.coreadd(s,3090,"sense:mob:f883f02f338953fa","verb","围攻；蜂拥包围；聚众","to surround or crowd around, often aggressively or excitedly; or gather in a disorderly crowd")

    remove_from(s,3093,"sense:mock:e3e3b594728254b2","mock at")
    mocks=h.new(s,3093,"practice examinations noun","noun","模拟考试（正式考试前的练习考试，尤英式；常用复数 mocks）","practice examinations taken before the real exams, chiefly British English and often plural mocks","L2")
    h.addc(s,3093,mocks,"sit/take your mocks","参加模拟考试")
    h.coreadd(s,3093,mocks,"noun","模拟考试；较低层的嘲笑行为","practice exams, chiefly BrE; lower-layer act of mocking")

    h.coreadd(s,3095,"sense:model:5d42d1f3ee1352b6","noun","模型；型号或款式；模特；模范","a representation; a product model or version; a fashion model; an exemplar")

    modadj=h.new(s,3096,"non-extreme position adjective","adjective","温和的；不极端的","not extreme in opinion, policy, position, or behavior","L2")
    modnoun=h.new(s,3096,"moderate person noun","noun","温和派；持中间立场的人","a person whose political or social views are not extreme","L2")
    h.addc(s,3096,modnoun,"a political moderate","政治观点温和的人")
    h.coreadd(s,3096,modadj,"adjective","适度的；温和或不极端的","moderate in amount or intensity, or not extreme in position")
    h.coreadd(s,3096,modnoun,"noun","温和派；持中间立场的人","a person whose views are not extreme")
    for se in s.record(3096).get("senses",[]):
        sid=se.get("sense_id")
        if se.get("pos")=="verb":
            h.overlay(s,3096,sid,{"identity_type":"pronunciation_by_part_of_speech","surface_lemma":"moderate","pronunciation":"/ˈmɒdəreɪt/ for verb","note":"verb moderate ends in /eɪt/"})
        elif se.get("pos") in ("adjective","noun"):
            h.overlay(s,3096,sid,{"identity_type":"pronunciation_by_part_of_speech","surface_lemma":"moderate","pronunciation":"/ˈmɒdərət/ for adjective/noun","note":"adjective/noun moderate contrasts with verb /ˈmɒdəreɪt/; dialectal vowels vary"})

    rec=s.record(3098)
    rec["semantic_neighbors"]=[x for x in rec.get("semantic_neighbors",[]) if (x.get("relation_id") or x.get("fact_id"))!=RID_MODERNISATION]
    s.mark(3098)
    h.overlay(s,3098,"sense:modernisation:e0fcec4a668c5254",{
        "identity_type":"regional_spelling_identity",
        "surface_lemma":"modernisation",
        "paired_form":"modernization",
        "note":"modernisation with -s- is common in BrE; modernization with -z- is standard AmE and also accepted in some British styles; same lexeme"
    })

    h.put(s,3113,"sense:monkey:fc110889a6e75522",cn="猴子；猴类",en="a monkey; a primate of the monkey groups, typically with a tail",level="L1")
    h.coreadd(s,3113,"sense:monkey:fc110889a6e75522","noun","猴子；猴类","a monkey or monkey-kind primate")

    h.overlay(s,3114,"sense:monopoly:7ab4eefe1b29534b",{"identity_type":"proper_name_case","surface_lemma":"Monopoly","case_sensitive":True,"note":"capitalize Monopoly when naming the board game; lowercase monopoly is the ordinary common noun"})

    h.move(s,3128,"a mosaic of cultures","sense:mosaic:4456686d5059561d")
    h.core(s,3128,"马赛克；多种成分组成的整体","a mosaic artwork or material; figuratively a whole composed of many different parts",[
        {"label_cn":"马赛克；镶嵌图案；多种成分组成的整体","label_en":"mosaic art or material; figuratively a whole composed of many different parts","pos":"noun","sense_ids":["sense:mosaic:68b051e8d040525c","sense:mosaic:4456686d5059561d"]}
    ])

    h.coreadd(s,3133,"sense:mother:7755a8051e0b509a","noun","母亲；女修道院院长称谓","a female parent; also the Mother Superior title")

    remove_from(s,3134,"sense:motion:0a72badba4da5c86","motion to sb")
    h.coreadd(s,3137,"sense:motor:e7bab220d7315f90","noun","马达；发动机","a motor or engine converting energy into mechanical motion")

    mourn=h.put(s,3140,"sense:mourn:89bf5a33710858b6",pattern="I/T: mourn sb/sth; mourn the loss/death of sb; mourn for sb; mourn over sth")
    mourn["transitivity"]="I/T"

    h.core(s,3141,"老鼠；电脑鼠标；胆小的人；捕鼠","a mouse animal; a computer mouse; a timid person; lower-layer verb hunt mice",[
        {"label_cn":"老鼠；电脑鼠标；胆小羞怯的人","label_en":"a mouse; a computer pointing device; a quiet or timid person","pos":"noun","sense_ids":["sense:mouse:5b7c0ed8cf5b51e4","sense:mouse:a0d222aeb1535b26","sense:mouse:48ae8d33f6c85b4c"]},
        {"label_cn":"捕鼠","label_en":"to hunt for mice","pos":"verb","sense_ids":["sense:mouse:7d229195fad05c66"]}
    ])

    for sid in ("sense:mouth:c2aaa788e7be5723","sense:mouth:285d1f42ec3254a6","sense:mouth:53f589c1c42d5a31"):
        h.overlay(s,3142,sid,{"identity_type":"pronunciation_by_part_of_speech","surface_lemma":"mouth","pronunciation":"/maʊθ/ for noun","note":"noun mouth is /maʊθ/; verb mouth is /maʊð/"})
    h.overlay(s,3142,"sense:mouth:59b5f7ed416f5e00",{"identity_type":"pronunciation_by_part_of_speech","surface_lemma":"mouth","pronunciation":"/maʊð/ for verb","note":"verb mouth is /maʊð/; noun mouth is /maʊθ/"})

def main():
    manifest=json.loads((ROOT/"content/lexical/semantic-review/dual/C/o3051-o3150.decision.json").read_text())
    if len(manifest.get("decisions",[]))!=24:
        raise RuntimeError("DECISION_COUNT_MISMATCH")
    s=h.base.Store()
    apply(s)
    touched=set(s.changed_word_ordinals)
    allowed={2935,*range(3051,3151)}
    bad=sorted(touched-allowed)
    if bad:
        raise RuntimeError("UNEXPECTED_CHANGED_ORDINALS:"+str(bad))
    s.finalize()
    natural,relations,report=h.no.build()
    if report["status"]!="PASS":
        raise RuntimeError("NATURAL_OWNER_AUDIT_FAILED:"+json.dumps(report,ensure_ascii=False))
    for o in sorted(touched):
        h.no.dump_json(h.no.WORDS_OUT/f"o{o:04d}.json",natural[o])
    if RID_MAJORITY not in relations:
        raise RuntimeError("MAJORITY_RELATION_MISSING")
    h.no.dump_json(h.no.relation_owner_path(RID_MAJORITY),relations[RID_MAJORITY])
    if RID_MODERNISATION not in relations:
        p=h.no.relation_owner_path(RID_MODERNISATION)
        if p.exists():
            p.unlink()
    print(json.dumps({
        "status":"PASS",
        "range":[3051,3150],
        "touched":sorted(touched),
        "changed_count":len(touched),
        "noop":[3078],
        "deferred_shared":[{"source_ordinal":3063,"remote_ordinal":5977,"relation_id":RID_MINIMISE}],
        "shared_repaired":[RID_MAJORITY],
        "natural_owner_audit":report["status"]
    },ensure_ascii=False,indent=2))

if __name__=="__main__":
    main()
