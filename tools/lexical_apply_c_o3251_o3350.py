#!/usr/bin/env python3
from __future__ import annotations
import json,sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"tools"))
import lexical_apply_c_checkpoint_o2851_o3050 as h

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

def update_family(s,o,fid,source_sid,target_word,target_sid,boundary):
    rec=s.record(o)
    hit=False
    for item in rec.get("word_family",[]):
        if item.get("fact_id")==fid:
            item["source_sense_id"]=source_sid
            item["target_word"]=target_word
            item["target_sense_id"]=target_sid
            item["boundary"]=boundary
            hit=True
            s.mark(o)
    if not hit:
        raise RuntimeError("FAMILY_NOT_FOUND:"+fid)
    h.fact(fid,lambda r:r.update({
        "source_sense_id":source_sid,
        "target_word":target_word,
        "target_sense_id":target_sid,
        "boundary":boundary
    }))

def apply(s):
    nose=h.new(s,3253,"smell instinct noun","noun","嗅觉；察觉/识别某事的能力","the sense of smell, or an instinctive ability to detect or recognize something","L2")
    h.addc(s,3253,nose,"have a good nose for sth","对某事有敏锐嗅觉/判断力")
    h.addc(s,3253,nose,"a nose for trouble/business","察觉麻烦/商机的敏锐能力")
    h.coreadd(s,3253,nose,"noun","鼻子；嗅觉/察觉能力；机头等","the nose; sense/instinct for detecting; front of a vehicle")

    money=h.new(s,3257,"banknote noun","noun","纸币；钞票（尤英式）","a piece of paper money; a banknote, chiefly British English","L2")
    h.addc(s,3257,money,"a £20 note","一张20英镑纸币","usage_example")
    h.coreadd(s,3257,money,"noun","笔记/便条；纸币；音符；语气","a written note/message; banknote; musical note; tone")

    h.rmphrase(s,3259,"nothing but")
    h.rmphrase(s,3259,"have nothing to do with")
    h.cons(s,3259,"nothing but + noun/phrase","只有；只不过；无非是",None,"L1","only / no more than")
    h.cons(s,3259,"have/be nothing to do with sb/sth","与某人/某事没有关系或牵连",None,"L1")
    h.cons(s,3259,"it's nothing to do with sb","这不关某人的事；不是某人该管的",None,"L2","concern/business reading")

    h.move(s,3260,"give notice","sense:notice:9d9be457f6e1511c")

    h.rmphrase(s,3272,"get nowhere")
    h.cons(s,3272,"get/go nowhere","毫无进展；没有取得结果",None,"L1")
    h.cons(s,3272,"nowhere near + noun/amount/adjective","远非；离……差得远；远远不到",None,"L1")

    rec=s.record(3273)
    rec["constructions"]=[x for x in rec.get("constructions",[]) if (x.get("construction_id") or x.get("fact_id"))!="multiword_unit:69a3268a9c17e6e3e3d4"]
    s.mark(3273)

    h.rmphrase(s,3277,"a number of + plural noun")
    h.rmphrase(s,3277,"the number of + plural noun")
    h.cons(s,3277,"a number of + plural count noun","若干；许多，通常接复数谓语",None,"L1","several/many; distinct from total-count phrase")
    h.cons(s,3277,"the number of + plural count noun","……的数量/总数，通常接单数谓语",None,"L1","the total count; distinct from a number of")

    nurse=h.put(s,3280,"sense:nurse:26845096841e5a5f",cn="给婴儿哺乳；（婴儿）吃奶",en="to breastfeed a baby; or, of a baby, to drink breast milk",pos="verb",level="L2",pattern="I/T: nurse a baby; the baby nurses / nurses at the breast")
    nurse["transitivity"]="I/T"
    remove_from(s,3280,"sense:nurse:26845096841e5a5f","nurse at + sth")
    h.addc(s,3280,"sense:nurse:26845096841e5a5f","nurse a baby","给婴儿哺乳")
    h.addc(s,3280,"sense:nurse:26845096841e5a5f","the baby nurses / nurses at the breast","婴儿吃奶")

    nut=h.new(s,3283,"enthusiast noun","noun","痴迷者；狂热爱好者（非正式，有时带贬义）","a person extremely enthusiastic or obsessed with a particular thing, informal","L2")
    for ph,cn in [("a fitness nut","健身狂热爱好者"),("a health nut","健康迷"),("a computer nut","电脑迷")]:
        h.addc(s,3283,nut,ph,cn,"usage_example")
    h.coreadd(s,3283,nut,"noun","坚果；螺母；狂热爱好者","a nut; a metal nut; an informal enthusiast")

    update_family(s,3294,"deep:word_family:object:9c11ecc1f60f9b1f","sense:object:4a21e61bd1d15ae7","objective","sense:objective:5edd0971ecee500d","object and objective align in the goal/purpose sense; not physical object")
    update_family(s,3296,"deep:word_family:objective:e856d2c36722dbae","sense:objective:5edd0971ecee500d","object","sense:object:4a21e61bd1d15ae7","objective and object align in the goal/purpose sense; not physical object")

    h.put(s,3299,"sense:obscure:c1939bd275bf5380",cn="晦涩难懂的；模糊不清的",en="difficult to understand, unclear, or difficult to see",level="L1")
    h.put(s,3299,"sense:obscure:8bc0f21d8d8a5a36",cn="不出名的；鲜为人知的",en="not known to many people; little-known",level="L2")
    h.core(s,3299,"晦涩/模糊的；鲜为人知的；使变模糊","unclear/difficult to understand; little-known; to obscure",[
      {"label_cn":"晦涩难懂的；模糊不清的","label_en":"difficult to understand or unclear","pos":"adjective","sense_ids":["sense:obscure:c1939bd275bf5380"]},
      {"label_cn":"鲜为人知的；不出名的","label_en":"little-known","pos":"adjective","sense_ids":["sense:obscure:8bc0f21d8d8a5a36"]},
      {"label_cn":"使难以看见或理解","label_en":"to make difficult to see or understand","pos":"verb","sense_ids":["sense:obscure:6a5d4830af535656"]}
    ])

    obs=h.put(s,3301,"sense:observe:0f65621f3ff85469",cn="说；评论；指出（正式）",en="to say or remark something, especially as an observation",pos="verb",level="L2",pattern="observe that + clause; direct speech + he/she observed")
    obs["transitivity"]="I/T"
    remove_from(s,3301,"sense:observe:0f65621f3ff85469","observe on + sth")
    h.addc(s,3301,"sense:observe:0f65621f3ff85469","observe that + clause","指出/评论说……")
    h.addc(s,3301,"sense:observe:0f65621f3ff85469","“...,” he observed","“……”，他评论道","usage_example")

    h.put(s,3302,"sense:obsession:5c9e582c41545b2f",cn="强烈而持久的迷恋/执念；反复占据思绪的关注",en="an extreme or persistent interest or preoccupation with someone or something that occupies one's thoughts a great deal, often excessively",level="L1")
    s.core(3302,"强烈而持久的迷恋或执念","an extreme or persistent preoccupation, often excessive")

    h.move(s,3306,"obstruction of justice","sense:obstruction:3feef57370c45d1c")

    h.rmphrase(s,3309,"on occasion")
    h.rmphrase(s,3309,"have occasion to do sth")
    h.cons(s,3309,"on occasion","偶尔；有时，但不经常",None,"L1")
    h.cons(s,3309,"have occasion to do sth","有理由/机会/需要做某事",None,"L2")

    h.move(s,3313,"occur to sb","sense:occur:777a4176a12d550f")
    for item in s.record(3313).get("constructions",[]):
        if item.get("pattern")=="sth occurs to sb / it occurs to sb that...":
            item["source_sense_id"]="sense:occur:777a4176a12d550f"
            item["boundary"]="come into someone's mind; distinct from happen/take place"
            s.mark(3313)

    h.rmphrase(s,3317,"an odd behavior")
    h.addc(s,3317,"sense:odd:04ff6c20729e5ecf","odd behavior","奇怪的行为","usage_example")

    off=h.put(s,3322,"sense:offend:32c6c0bc9116516f",cn="违反；违犯（法律、规则、原则等）",en="to break or violate a law, rule, principle, or standard",pos="verb",level="L2",pattern="vi. + against + sth")
    off["transitivity"]="vi"

    provide=h.put(s,3324,"sense:offer:ec31d64f2b1e5829",pattern="offer sb sth; offer sth to sb")
    provide["transitivity"]="vt"
    willing=h.put(s,3324,"sense:offer:cbeb7ebf21975377",pattern="offer to do sth")
    willing["transitivity"]="vi"
    h.cons(s,3324,"offer sb sth / offer sth to sb","把某物提供给某人接受/考虑","sense:offer:ec31d64f2b1e5829","L1")
    h.cons(s,3324,"offer to do sth","主动提出/表示愿意做某事","sense:offer:cbeb7ebf21975377","L1")

    update_family(s,3326,"deep:word_family:officer:cf9d0504dd199253","sense:officer:1e12f514da3a51cd","office","sense:office:5337ec52ec44566d","officer = a person holding an office/position of authority; not office as room/building")

    h.put(s,3329,"sense:offspring:8f8c0e5406585dbc",cn="后代；子女；幼崽",en="a person's child or children, or the young or descendants of an animal",level="L1")

    interj=h.new(s,3332,"agreement discourse interjection","interjection","好；行；可以（表示同意、确认或承接话题）","used to express agreement or acceptance, acknowledge what was said, or introduce a response or transition","L1")
    h.addc(s,3332,interj,"Okay, let's go.","好，我们走吧。","usage_example")
    h.addc(s,3332,interj,"Okay, I understand.","好，我明白了。","usage_example")
    h.coreadd(s,3332,interj,"interjection","好；行；可以；表示同意/确认/承接","okay as agreement, acknowledgement, or discourse transition")

    omit=h.put(s,3334,"sense:omit:84336b00719f518b",pattern="omit to do sth")
    omit["transitivity"]="vi"

    h.coreadd(s,3335,"sense:on:a4c9c6e118d951ac","adverb/adjective","开着的；运行中的；正在进行的","operating, active, switched on, or currently happening")

    h.cons(s,3336,"at once","立即；马上",None,"L1","immediately")
    h.cons(s,3336,"all at once / at once","同时；一起",None,"L2","simultaneously / at the same time")

    h.rmphrase(s,3337,"one another")
    h.cons(s,3337,"one another","彼此；互相（= each other）",None,"L1","reciprocal pronoun phrase; no strict semantic distinction from each other")

    h.cons(s,3341,"be onto sb","察觉/怀疑某人做了不对的事或在欺骗你",None,"L2")
    h.cons(s,3341,"be onto sth","发现了有用信息、好主意或有前景的机会",None,"L2")

    h.move(s,3343,"open to the public","sense:open:6490a0f7373f5fca")

    h.core(s,3347,"操作/运行；手术","operation/functioning; a surgical procedure",[
      {"label_cn":"操作；运行；生效；手术","label_en":"operation/functioning/effect; a surgical procedure","pos":"noun","sense_ids":["sense:operation:e64eef5353c5585c","sense:operation:89b3c3324cab5b74"]}
    ])

    h.put(s,3349,"sense:operator:99bd163d6c375d66",cn="经营者；运营商",en="someone who owns or operates a business",level="L2")

    h.put(s,3350,"sense:opinion:6b7418bbbe9c589e",cn="意见；看法；观点",en="a view, belief, or judgment about someone or something; what someone thinks about it, as distinct from a bare statement of fact",level="L1")

def main():
    manifest=json.loads((ROOT/"content/lexical/semantic-review/dual/C/o3251-o3350.decision.json").read_text())
    if len(manifest.get("decisions",[]))!=33:
        raise RuntimeError("DECISION_COUNT_MISMATCH")
    s=h.base.Store()
    apply(s)
    touched=set(s.changed_word_ordinals)
    bad=sorted(o for o in touched if not 3251<=o<=3350)
    if bad:
        raise RuntimeError("UNEXPECTED_CHANGED_ORDINALS:"+str(bad))
    s.finalize()
    natural,relations,report=h.no.build()
    if report["status"]!="PASS":
        raise RuntimeError("NATURAL_OWNER_AUDIT_FAILED:"+json.dumps(report,ensure_ascii=False))
    for o in sorted(touched):
        h.no.dump_json(h.no.WORDS_OUT/f"o{o:04d}.json",natural[o])
    print(json.dumps({
      "status":"PASS",
      "range":[3251,3350],
      "changed_count":len(touched),
      "changed_word_ordinals":sorted(touched),
      "noop":[3327],
      "natural_owner_audit":report["status"]
    },ensure_ascii=False,indent=2))

if __name__=="__main__":
    main()
