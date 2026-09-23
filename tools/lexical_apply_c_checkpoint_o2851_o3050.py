#!/usr/bin/env python3
from __future__ import annotations
import copy,json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"tools"))
import lexical_apply_o0475_o0674 as base
import lexical_natural_owner as no
STAMP="2026-09-23T00:00:00Z"
APPLY={2851,2852,2854,2856,2857,2858,2862,2865,2866,2869,2879,2881,2885,2888,2890,2894,2897,2898,2909,2912,2913,2914,2916,2922,2925,2927,2928,2929,2934,2937,2940,2947,2953,2956,2957,2959,2960,2962,2966,2970,2971,2983,2985,2991,2992,2993,2997,3000,3009,3017,3019,3020,3027,3029,3034,3042,3047,3048}
DEFER={2855,2935,2949,2967}
def touch(s,sid):
    if sid in s.senses:s.senses[sid]["updated_at"]=STAMP;s.changed_sense_ids.add(sid)
def put(s,o,sid,**kw):
    x=s.put_existing(o,sid,**kw);touch(s,sid);return x
def active(s,o,sid):return next(x for x in s.record(o).get("senses",[]) if x.get("sense_id")==sid)
def new(s,o,branch,pos,cn,en,level="L2",pattern=""):
    sid=s.new(o,branch,pos,cn,en,level=level,pattern=pattern);s.senses[sid]["created_at"]=s.senses[sid].get("created_at") or STAMP;s.senses[sid]["updated_at"]=STAMP;return sid
def addc(s,o,sid,phrase,cn,exam="fixed_pattern"):
    t=active(s,o,sid);hit=next((c for c in t.get("collocations",[]) if c.get("phrase")==phrase),None)
    if hit:hit["meaning_cn"]=cn;s.mark(o);return hit["collocation_id"]
    cid=base.colloc_id(s.record(o)["word"],sid,phrase);item={"collocation_id":cid,"exam_value":exam,"legacy_source_object_ids":[f"{sid}:collocation:streaming-c-checkpoint-o2851-o3050"],"meaning_cn":cn,"phrase":phrase};t.setdefault("collocations",[]).append(item)
    shard=next((p for p in base.COLL_SHARDS.glob("*.json") if any(r.get("anchor_ordinal")==o for r in base.load(p))),sorted(base.COLL_SHARDS.glob("*.json"))[0]);s.colls[cid]={"collocation_id":cid,"created_by":"lexical_streaming_c_checkpoint_o2851_o3050","current_value_hash":base.sha(item),"legacy_source_object_ids":item["legacy_source_object_ids"],"record_type":"collocation_identity","schema_version":"kianos_collocation_identity_v1","sense_id":sid,"status":"active","word_id":f"word:{s.record(o)['word']}"};s.coll_paths[cid]=shard;s.changed_collocation_ids.add(cid);s.mark(o);return cid
def rmphrase(s,o,phrase):
    hit=False
    for se in s.record(o).get("senses",[]):
        keep=[]
        for c in se.get("collocations",[]):
            if c.get("phrase")==phrase:
                hit=True;cid=c.get("collocation_id")
                if cid in s.colls:s.colls[cid]["status"]="deprecated";s.colls[cid]["updated_at"]=STAMP;s.changed_collocation_ids.add(cid)
            else:keep.append(c)
        se["collocations"]=keep
    if hit:s.mark(o)
    return hit
def move(s,o,phrase,to_sid):
    found=None
    for se in s.record(o).get("senses",[]):
        keep=[]
        for c in se.get("collocations",[]):
            if c.get("phrase")==phrase:found=copy.deepcopy(c)
            else:keep.append(c)
        se["collocations"]=keep
    if not found:return False
    active(s,o,to_sid).setdefault("collocations",[]).append(found);cid=found.get("collocation_id")
    if cid in s.colls:s.colls[cid]["sense_id"]=to_sid;s.colls[cid]["current_value_hash"]=base.sha(found);s.colls[cid]["updated_at"]=STAMP;s.changed_collocation_ids.add(cid)
    s.mark(o);return True
def cons(s,o,pat,cn,sid=None,level="L2",boundary=None):
    arr=s.record(o).setdefault("constructions",[]);x=next((z for z in arr if z.get("pattern")==pat),None)
    if x is None:x={"construction_id":base.construction_id(s.record(o)["word"],pat),"direction":"R+P","level":level,"meaning_cn":cn,"pattern":pat};arr.append(x)
    else:x["level"]=level;x["meaning_cn"]=cn
    if sid:x["source_sense_id"]=sid
    if boundary:x["boundary"]=boundary
    s.mark(o);return x
def coreadd(s,o,sid,pos,cn,en):
    clusters=s.record(o).setdefault("core_concept",{}).setdefault("core_clusters",[])
    for cl in clusters:
        if sid in cl.get("sense_ids",[]):cl["label_cn"]=cn;cl["label_en"]=en;cl["pos"]=pos;s.mark(o);return
    for cl in clusters:
        if cl.get("pos")==pos:cl.setdefault("sense_ids",[]).append(sid);cl["label_cn"]=cn;cl["label_en"]=en;s.mark(o);return
    clusters.append({"label_cn":cn,"label_en":en,"pos":pos,"sense_ids":[sid]});s.mark(o)
def core(s,o,cn,en,clusters):
    c=s.record(o).setdefault("core_concept",{});c["core_meaning_cn"]=cn;c["mental_model_cn"]=cn;c["core_meaning_en"]=en;c["core_clusters"]=clusters;s.mark(o)
def overlay(s,o,sid,obj):active(s,o,sid)["lexical_identity_overlay"]=obj;s.mark(o)
def fact(rid,fn):
    hits=0
    for p in (ROOT/"content/lexical/canonical/facts/shards").glob("*.json"):
        rows=json.loads(p.read_text());ch=False
        for row in rows:
            if row.get("record",{}).get("fact_id")==rid:fn(row["record"]);hits+=1;ch=True
        if ch:p.write_text(json.dumps(rows,ensure_ascii=False,separators=(",",":"))+"\n")
    return hits
def apply(s):
    a=new(s,2851,"domain competence literacy","noun","（某领域的）基本理解与运用能力；素养","competence, knowledge, and ability to understand and use information in a particular field","L2")
    for p,c in [("digital literacy","数字素养"),("financial literacy","金融素养"),("health literacy","健康素养")]:addc(s,2851,a,p,c,"usage_example")
    s.core(2851,"读写能力；领域素养","ability to read/write; also competence in a particular domain")
    x=put(s,2852,"sense:literally:147e191e74af566c",cn="（口语强调）简直；真的（有时并非严格按字面）",en="used informally for strong emphasis, sometimes even when the statement is not literally true",level="L1");x["register"]="informal emphatic";x["usage_note"]="In careful/formal writing, use literally for truly literal claims when ambiguity matters.";s.core(2852,"按字面；（口语）加强语气","literally; also an informal emphatic intensifier")
    move(s,2854,"literature review","sense:literature:44f303008e97583b")
    core(s,2856,"垃圾；一窝幼崽；乱丢/散落","rubbish; a litter of offspring; to scatter rubbish or objects",[{"label_cn":"垃圾；废弃物；一窝幼崽","label_en":"rubbish carelessly left about; offspring produced at one birth","pos":"noun","sense_ids":["sense:litter:b87becdec89e54b8","sense:litter:a0c82281b3dc5ebf"]},{"label_cn":"乱丢；弄乱；产仔","label_en":"to scatter rubbish/objects; to give birth to a litter","pos":"verb","sense_ids":["sense:litter:fdbfcad00d3953a9","sense:litter:235ae626098a5727"]}])
    cons(s,2857,"little + uncountable noun vs a little + uncountable noun","little 表几乎没有/不够；a little 表有一些/少量","sense:little:c7ea15a39dd554c8","L1","little has a negative/insufficient implication; a little asserts some positive amount")
    e=new(s,2858,"electrically live adjective","adjective","带电的；通电的","carrying electric current or connected to a source of electricity","L2");am=new(s,2858,"live ammunition adjective","adjective","实弹的；装有真实炸药/弹药的","containing real explosive ammunition or capable of exploding","L2");addc(s,2858,e,"live wire/cable","带电的电线/电缆");addc(s,2858,am,"live ammunition/round","实弹/实弹弹药")
    for se in s.record(2858).get("senses",[]):
        if se.get("pos")=="verb":se["lexical_identity_overlay"]={"identity_type":"pronunciation_by_part_of_speech","surface_lemma":"live","pronunciation":"/lɪv/ for verb"}
        elif se.get("pos") in ("adjective","adverb"):se["lexical_identity_overlay"]={"identity_type":"pronunciation_by_part_of_speech","surface_lemma":"live","pronunciation":"/laɪv/ for adjective/adverb"}
    s.mark(2858)
    ld=new(s,2862,"computing load verb","verb","加载；装入（数据/程序）；（页面/程序）载入并就绪","to put data, a program, or content into a computer/system; or for a page/app/program to appear or become ready","L2","I/T");active(s,2862,ld)["transitivity"]="I/T";addc(s,2862,ld,"load data/a program into/onto sth","把数据/程序加载到某处");addc(s,2862,ld,"the page/app loads","页面/应用完成加载","usage_example");cons(s,2862,"load A with B vs load B into/onto A","load A with B：把B装入A；load B into/onto A：把B装入/装上A",None,"L1")
    lv=next(z for z in s.record(2865)["senses"] if z.get("pos")=="verb");lv["governing_pattern"]="I/T: lobby for/against sth; lobby sb/officials; lobby sb to do sth";lv["transitivity"]="I/T";cons(s,2865,"lobby for/against sth; lobby sb/officials","游说支持/反对某事；游说某人或官员",lv["sense_id"],"L1")
    coreadd(s,2866,"sense:local:84cda5ed016f535c","noun","当地的；当地人","local to a place; a person who lives there")
    move(s,2869,"on location","sense:location:39473055c368517f");addc(s,2869,"sense:location:39473055c368517f","on location","在外景地/实景地拍摄")
    cons(s,2879,"as long as / so long as + clause","只要；条件是",None,"L1","conditional provided that; distinct from literal duration use")
    for p,c in [("look for sb/sth","寻找某人/某物"),("look after sb/sth","照顾；照看"),("look forward to sth/doing sth","期待某事/做某事（to为介词）"),("look like sb/sth / look like + clause","看起来像；似乎")]:cons(s,2881,p,c,None,"L1")
    lo=put(s,2885,"sense:loosen:f3075e9d356c5153",pattern="vi.");lo["transitivity"]="vi"
    cons(s,2888,"lose to sb/team","输给某人/某队；被该对手击败","sense:lose:5996741d16b7551a","L1","intransitive defeat use; contrast lose a game/match/election")
    rmphrase(s,2890,"cast lots");cons(s,2890,"draw/cast lots","抽签；用随机方式作选择/决定")
    put(s,2894,"sense:love:aadabd57a5ca546b",cn="爱；热爱；非常喜欢（人、事物或活动）",en="to feel deep affection for someone, or to like or enjoy a person, thing, or activity very much",level="L1");cons(s,2894,"would love sth / would love to do sth","非常想要某物/非常愿意做某事；也用于礼貌表达强烈意愿","sense:love:aadabd57a5ca546b","L1")
    for f in ("word_family","semantic_neighbors","confusables"):s.record(2897)[f]=[z for z in s.record(2897).get(f,[]) if (z.get("relation_id") or z.get("fact_id"))!="rel:v3-family:low:lower"]
    low=next(z["sense_id"] for z in s.record(2897)["senses"] if z.get("pos")=="adjective");overlay(s,2897,low,{"identity_type":"comparative_inflection","surface_lemma":"low","forms":["low","lower","lowest"],"note":"lower is also a stable Word owner"})
    put(s,2898,"sense:lower:210959eb74bd5eaa",level="L1");overlay(s,2898,"sense:lower:210959eb74bd5eaa",{"identity_type":"comparative_surface","surface_lemma":"lower","base_form":"low","superlative":"lowest","note":"also retained as an independent stable Word owner"});s.core(2898,"较低的；使降低/放下","lower in position or rank; to make/move something lower")
    core(s,2909,"午餐；吃午餐","lunch; to eat lunch",[{"label_cn":"午餐","label_en":"the midday meal","pos":"noun","sense_ids":["sense:lunch:3fb61bae55d2547d"]},{"label_cn":"吃午餐","label_en":"to eat lunch","pos":"verb","sense_ids":["sense:lunch:dd4e163b15ff5b5f"]}])
    move(s,2912,"a life of luxury","sense:luxury:2a640b7686c05816")
    if not move(s,2912,"luxury goods","sense:luxury:aa73cc209df35566"):addc(s,2912,"sense:luxury:aa73cc209df35566","luxury goods","奢侈品","usage_example")
    la="sense:lyric:48e2cd63780c5991";put(s,2913,la,cn="抒情的；抒情诗的",en="expressing personal emotion in a songlike or poetic way; relating to lyric poetry",pos="adjective",level="L2");addc(s,2913,la,"lyric poetry","抒情诗");addc(s,2913,la,"lyric poem","抒情诗篇");coreadd(s,2913,la,"adjective","歌词；抒情诗；抒情的","song lyrics; lyric poetry; lyric adjective")
    mv="sense:machine:9795ae4c4e055ba3";put(s,2914,mv,cn="用机器加工/制造",en="to make, shape, or finish something by machine",pos="verb",level="L2");addc(s,2914,mv,"machine a metal part","用机器加工金属零件","usage_example")
    for sid,reg,note in [("sense:mad:0580d1745cb15eb1","informal, especially AmE","angry use is informal; mad at/with sb"),("sense:mad:379787419721525f","old-fashioned/offensive when used of a person","Use cautiously when interpreting older/informal source context.")]:x=active(s,2916,sid);x["register"]=reg;x["usage_note"]=note
    core(s,2916,"生气的；愚蠢/疯狂的；（旧式且可能冒犯）精神失常的","angry; foolish/crazy; old-fashioned/offensive mental-illness use",[{"label_cn":"生气的","label_en":"angry (informal, especially AmE)","pos":"adjective","sense_ids":["sense:mad:0580d1745cb15eb1"]},{"label_cn":"愚蠢的；疯狂的","label_en":"foolish or crazy","pos":"adjective","sense_ids":["sense:mad:ad6efbeea26c59c7"]},{"label_cn":"精神失常的（旧式/可能冒犯）","label_en":"mentally ill (old-fashioned/offensive of a person)","pos":"adjective","sense_ids":["sense:mad:379787419721525f"]}]);cons(s,2916,"be mad about sb/sth","非常喜欢；着迷（非正式，尤英式）")
    coreadd(s,2922,"sense:magnetic:8223284c86d05905","adjective","磁的；有吸引力的","relating to magnetism; figuratively powerfully attractive")
    mg="sense:magnitude:dfbb3bd7e2aa55ef";put(s,2925,mg,cn="大小；程度；量级；重要性",en="the size, extent, degree, or importance of something",level="L1");addc(s,2925,mg,"earthquake magnitude","地震震级","usage_example");astro="sense:magnitude:312ea134948d5002"
    if astro in s.senses:put(s,2925,astro,cn="星等（天文学，亮度尺度）",en="astronomical magnitude, a measure of apparent or absolute brightness",pos="noun",level="L3")
    ma="sense:maiden:b1f9e917fab15690";put(s,2927,ma,level="L1");coreadd(s,2927,ma,"adjective","首次的；初次的","first or initial");mn=put(s,2927,"sense:maiden:57252cf8969a52d0",level="L3");mn["register"]="literary/old-fashioned";mn["usage_note"]="Young unmarried woman/virgin use is literary or old-fashioned."
    core(s,2928,"邮件；邮政系统；邮寄","mail/post; the postal system; to send by post",[{"label_cn":"邮件；信件/包裹","label_en":"letters and packages sent by post","pos":"noun","sense_ids":["sense:mail:d3106f144c4b5444"]},{"label_cn":"邮政系统；一次投递邮件","label_en":"the postal system; a batch/delivery of mail","pos":"noun","sense_ids":["sense:mail:ed97d47b8ff65d51","sense:mail:78feeb8d280a5aa0"]},{"label_cn":"邮寄","label_en":"to send by post","pos":"verb","sense_ids":["sense:mail:80192f0a94425543"]}])
    core(s,2929,"主要的；主管线/干线","principal or most important; a principal pipe/line",[{"label_cn":"主要的；最重要的","label_en":"principal or most important","pos":"adjective","sense_ids":["sense:main:7207802bccea50ec"]},{"label_cn":"主管线；干线","label_en":"a principal pipe or line","pos":"noun","sense_ids":["sense:main:b9476ef1273f5faf"]}])
    move(s,2934,"major in + subject","sense:major:7adab1c956555ee1");st=new(s,2934,"student major noun","noun","主修某专业的学生","a student whose principal field of study is a specified subject","L2");addc(s,2934,st,"an English major","英语专业学生","usage_example")
    put(s,2937,"sense:male:72b8188c36465b6e",cn="男性；雄性个体",en="a male person or animal; an individual of the sex typically associated with male reproductive characteristics",level="L1");put(s,2937,"sense:male:b3355c80b19b53e0",cn="男性的；雄性的",en="relating to male persons/animals or the sex typically associated with sperm production and male reproductive characteristics",level="L1");move(s,2937,"a male nurse","sense:male:b3355c80b19b53e0")
    manv="sense:man:7d4b8ad5d26f589f";put(s,2940,manv,cn="给……配备人员；值守/操作（岗位、设备等）",en="to staff, crew, or operate a post, station, or piece of equipment",pos="verb",level="L2");addc(s,2940,manv,"man the desk/phones","值守服务台/接听电话","usage_example")
    generic="sense:man:bcf5c751a2c05b7b"
    if any(z.get("sense_id")==generic for z in s.record(2940).get("senses",[])):g=active(s,2940,generic);g["register"]="traditional generic";g["usage_note"]="For current neutral/inclusive production, humanity, humankind, human beings, or people is often safer.";s.mark(2940)
    mk="sense:mankind:8912256f09d15941";x=active(s,2947,mk);x["register"]="traditional collective term";x["usage_note"]="In current neutral/inclusive prose, humankind, humanity, or human beings is often preferred.";s.mark(2947)
    cons(s,2953,"many a + singular count noun (+ singular verb)","许多；很多（正式/书面；形式上接单数名词和单数谓语）","sense:many:f06d08b000af5a35","L2","compare many students are vs many a student is")
    coreadd(s,2956,"sense:marble:b435b52935b257bc","noun","大理石；玻璃弹珠；大理石雕刻","marble rock; a glass marble; marble sculpture")
    overlay(s,2957,"sense:march:6e90504485f052cf",{"identity_type":"case_sensitive_sense","canonical_surface":"March","note":"month is capitalized"})
    for sid in ("sense:march:4844b2169fc75b8c","sense:march:130eecbcd8b859c5"):overlay(s,2957,sid,{"identity_type":"case_sensitive_sense","canonical_surface":"march","note":"ordinary lexical branches are lowercase except sentence-initial capitalization"})
    ec=new(s,2959,"economics marginal adjective","adjective","边际的；增加一个单位所带来的额外变化的","relating to the additional change, cost, benefit, or output from one extra unit","L2");move(s,2959,"marginal cost",ec);addc(s,2959,ec,"marginal benefit","边际收益");addc(s,2959,ec,"marginal increase","边际增加")
    coreadd(s,2960,"sense:marine:c05916f9e2e15ff5","adjective","海洋的；Marine（美国海军陆战队员）","marine/sea-related; Marine as a U.S. Marine Corps member");overlay(s,2960,"sense:marine:85465e349fd95139",{"identity_type":"case_sensitive_sense","canonical_surface":"Marine","note":"capitalize when naming a U.S. Marine"});overlay(s,2960,"sense:marine:c05916f9e2e15ff5",{"identity_type":"case_sensitive_sense","canonical_surface":"marine","note":"generic sea/marine adjective is lowercase"})
    coreadd(s,2962,"sense:mark:f4a4a0c3187c5c37","verb","做标记；标志着/表明；批改评分","to mark physically; signify an event/change; grade schoolwork");gr=new(s,2962,"grade schoolwork verb","verb","批改；评分","to assess and give a grade or score to schoolwork, an exam, or an answer","L1");move(s,2962,"mark the answer",gr);addc(s,2962,gr,"mark an exam","批改考试");addc(s,2962,gr,"mark a paper/assignment","批改试卷/作业")
    intr="sense:marry:35477cc29e525ab2";x=put(s,2966,intr,cn="结婚；成婚",en="to get married; to enter into marriage",pos="verb",level="L1",pattern="vi.");x["transitivity"]="vi";x["collocations"]=[];addc(s,2966,intr,"They married in 2010.","他们于2010年结婚","usage_example");cons(s,2966,"marry sb vs get/be married to sb","marry sb 不用 to/with；get/be married to sb 使用 to",None,"L1")
    move(s,2970,"surgical mask","sense:mask:26a3dea47b185fb9");move(s,2971,"mass production","sense:mass:28a7fca3062d5a54")
    rmphrase(s,2983,"mature student");cons(s,2983,"mature student","年龄高于通常大学入学年龄的大学/学院学生（尤英式）")
    month="sense:may:338dac54478c5775";put(s,2985,month,level="L1");overlay(s,2985,month,{"identity_type":"case_sensitive_sense","canonical_surface":"May","note":"month is capitalized"});overlay(s,2985,"sense:may:23b7f1b450c25f1f",{"identity_type":"case_sensitive_sense","canonical_surface":"may","note":"modal is lowercase except normal sentence-initial capitalization"});cons(s,2985,"may as well + base verb","不妨；还是……为好；反正可以……",None,"L2","reasonable/easiest choice when no better alternative is apparent")
    iv=new(s,2991,"intend plan verb","verb","打算；意欲","to intend or plan to do something","L1","vt. + to do");move(s,2991,"mean to do sth",iv);addc(s,2991,iv,"I didn't mean to ...","我不是故意/并没打算……","usage_example");cons(s,2991,"mean doing sth","意味着/需要做某事；作为结果或要求会涉及做某事",None,"L1")
    rmphrase(s,2992,"with good meaning");addc(s,2992,"sense:meaning:c145a7b7f2f75f3d","the meaning behind his actions/words","他行为/言语背后的意图","usage_example")
    fin="sense:means:e3041c7f06915845";put(s,2993,fin,cn="财力；可支配的金钱/资源",en="money or resources available to someone",level="L2")
    for p,c in [("within/beyond one's means","量入为出/超出经济能力"),("have the means to do sth","有能力/财力做某事"),("a person of means","有财力的人")]:addc(s,2993,fin,p,c)
    coreadd(s,2993,fin,"noun","方法/手段；财力/资源","a method/way; financial resources")
    rmphrase(s,2997,"meat and potatoes");cons(s,2997,"the meat and potatoes of sth","核心内容；基本组成部分；实质（非正式，尤美式）")
    ph=new(s,3000,"physical mechanism noun","noun","机械装置；机构；机件组合","a set or arrangement of moving parts that work together in a machine or device","L1");addc(s,3000,ph,"locking mechanism","锁定机构");addc(s,3000,ph,"the mechanism of a clock","钟表的机械机构");coreadd(s,3000,ph,"noun","机械装置；机制/运作方式","a mechanical arrangement; an abstract system/process by which something works")
    mt="sense:meet:b72a3ee9a352528c";x=put(s,3009,mt,en="to come together with someone, by chance or arrangement, or for a meeting",cn="遇见；会面；集合",pattern="I/T: meet sb; meet at/in + place/time");x["transitivity"]="I/T";coreadd(s,3009,"sense:meet:7d8ee826bcf35e12","verb","遇见/会面；满足/达到","to meet someone/come together; to satisfy a need, requirement, standard, or condition")
    core(s,3017,"纪念碑/纪念物；纪念的","a memorial structure/object; commemorative",[{"label_cn":"纪念碑；纪念物","label_en":"a structure/object erected to commemorate","pos":"noun","sense_ids":["sense:memorial:a8507a0873585800"]},{"label_cn":"纪念的","label_en":"serving to commemorate","pos":"adjective","sense_ids":["sense:memorial:ed4cb1a7b1a05291"]}])
    core(s,3019,"威胁；危险的人或物；威胁某人/某物","a person/thing likely to cause harm; to threaten",[{"label_cn":"威胁；危险的人或物","label_en":"a person or thing likely to cause harm or danger","pos":"noun","sense_ids":["sense:menace:dbfa4eba0a9c5897"]},{"label_cn":"威胁；威吓","label_en":"to threaten someone or something","pos":"verb","sense_ids":["sense:menace:1590a65716335472"]}])
    cons(s,3020,"be on the mend","正在康复；正在好转","sense:mend:62a6975282fe54fd","L1")
    overlay(s,3027,"sense:mercury:38218e9d62535db9",{"identity_type":"case_sensitive_sense","canonical_surface":"mercury","note":"chemical element is lowercase"})
    for sid in ("sense:mercury:bd9193c621a15233","sense:mercury:7a64687069c65391"):overlay(s,3027,sid,{"identity_type":"case_sensitive_sense","canonical_surface":"Mercury","note":"planet/deity is capitalized"})
    core(s,3029,"仅仅的；只不过的","nothing more than; merely",[{"label_cn":"仅仅的；只不过的","label_en":"being nothing more than specified","pos":"adjective","sense_ids":["sense:mere:435d174c314a5ba1"]}])
    put(s,3034,"sense:mess:7b45e7a7bca051f4",cn="混乱；杂乱；糟糕/棘手的局面",en="a state of confusion, disorder, or a problematic situation",level="L1");rmphrase(s,3034,"mess up + sth");cons(s,3034,"make a mess of sth","把某事搞砸；做得很差","sense:mess:7b45e7a7bca051f4","L1");cons(s,3034,"mess sth up / mess up","搞砸；弄错；犯错；处理得很差",None,"L1")
    core(s,3042,"大都市的；大都市居民；（较低层）宗主国的","relating to a metropolis; a metropolitan resident; lower-layer mother-country sense",[{"label_cn":"大都市的","label_en":"relating to or characteristic of a metropolis","pos":"adjective","sense_ids":["sense:metropolitan:566b3b0e98fa540e"]},{"label_cn":"大都市居民","label_en":"a person who lives in a metropolis","pos":"noun","sense_ids":["sense:metropolitan:2525fd7dc8fc50e0"]},{"label_cn":"宗主国的","label_en":"relating to a sovereign state's mother country","pos":"adjective","sense_ids":["sense:metropolitan:8328ea0fafc95851"]}])
    rmphrase(s,3047,"might as well");cons(s,3047,"might as well + base verb","不妨；还是……为好；反正可以……",None,"L2","reasonable choice when no strong reason favors an alternative")
    tech=new(s,3048,"technology migration verb","verb","迁移到新系统/平台；迁移数据或软件","to begin using a new computer/system/platform, or move data/software/content from one system to another","L2","I/T");active(s,3048,tech)["transitivity"]="I/T";addc(s,3048,tech,"migrate to a new system/cloud","迁移到新系统/云平台");addc(s,3048,tech,"migrate data from A to B","把数据从A迁移到B")
def main():
    d1=json.loads((ROOT/"content/lexical/semantic-review/dual/C/o2851-o2950.decision.json").read_text());d2=json.loads((ROOT/"content/lexical/semantic-review/dual/C/o2951-o3050.decision.json").read_text());dec={x["ordinal"]:x["disposition"] for x in d1["decisions"]+d2["decisions"]}
    if set(dec)!=APPLY|DEFER:raise RuntimeError("DECISION_COVERAGE_MISMATCH")
    if {o for o,v in dec.items() if v=="APPLY"}!=APPLY:raise RuntimeError("APPLY_SET_MISMATCH")
    s=base.Store();apply(s);touched=set(s.changed_word_ordinals)
    if touched-APPLY:raise RuntimeError(f"UNEXPECTED_CHANGED_ORDINALS:{sorted(touched-APPLY)}")
    s.finalize();natural,relations,report=no.build()
    if report["status"]!="PASS":raise RuntimeError("NATURAL_OWNER_AUDIT_FAILED:"+json.dumps(report,ensure_ascii=False))
    for o in sorted(touched):no.dump_json(no.WORDS_OUT/f"o{o:04d}.json",natural[o])
    # Relation owners are not rewritten merely because a touched Word references them.
    # C writes a Relation owner only when that Relation is itself an explicit C mutation.
    # This checkpoint has no non-deferred shared Relation mutation.
    print(json.dumps({"status":"PASS","scope":[2851,3050],"decision_count":len(dec),"apply_count":len(APPLY),"deferred_count":len(DEFER),"changed_word_ordinals":sorted(touched),"changed_count":len(touched),"idempotent_noop_expected_ordinals":sorted(APPLY-touched),"natural_owner_audit":report["status"]},ensure_ascii=False,indent=2))
if __name__=="__main__":main()
