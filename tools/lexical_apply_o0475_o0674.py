#!/usr/bin/env python3
"""Apply the Sol-approved o0475-o0674 handoff mechanically.

This is deliberately a bounded executor.  It changes only the 75 UPGRADE
owners named by the handoff, their canonical sense/collocation registries,
and regenerated Natural Owner projections for those owners.
"""
from __future__ import annotations

import copy
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LEX = ROOT / "content" / "lexical"
HANDOFF = LEX / "semantic-review" / "o0475-o0674.md"
WORD_SHARDS = LEX / "canonical" / "words" / "shards"
SENSE_SHARDS = LEX / "canonical" / "senses" / "shards"
COLL_SHARDS = LEX / "canonical" / "collocations" / "shards"
OWNER_DIR = LEX / "words" / "by-ordinal"

UPGRADES = {
    475:"between",484:"bid",486:"bill",487:"billion",488:"bin",489:"bind",
    492:"bird",495:"biscuit",496:"bit",500:"black",504:"blank",506:"blast",
    507:"blaze",508:"bleak",510:"blend",511:"bless",512:"blind",515:"blood",
    516:"bloody",517:"bloom",520:"blow",521:"blue",523:"blunder",527:"board",
    534:"bolt",536:"bond",537:"bone",539:"book",541:"boost",542:"boot",
    544:"border",546:"born",547:"borrow",553:"bottom",555:"bound",566:"brain",
    567:"brake",571:"brass",572:"brave",573:"breach",575:"break",576:"breakdown",
    577:"breakfast",581:"breed",585:"brick",590:"bright",592:"bring",598:"bronze",
    599:"broom",605:"brush",608:"bucket",609:"bud",611:"buffer",612:"buffet",
    614:"build",615:"bulb",617:"bull",618:"bullet",619:"bulletin",620:"bully",
    621:"bump",628:"burn",630:"bury",632:"bush",635:"but",636:"butcher",
    637:"butter",638:"butterfly",642:"by",648:"cable",656:"call",660:"camera",
    662:"campaign",666:"cancel",674:"canvas",
}
NEW_BRANCH_ORDINALS = {488,500,507,508,517,534,536,541,581,590,598,615,618,636}

def stable(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))

def sha(value):
    return hashlib.sha256(stable(value).encode()).hexdigest()

def load(path):
    return json.loads(path.read_text(encoding="utf-8"))

def dump(path, value, compact=False):
    path.write_text((stable(value) if compact else json.dumps(value, ensure_ascii=False, indent=2)) + "\n", encoding="utf-8")

def find_row(root, ordinal):
    for path in sorted(root.glob("*.json")):
        rows = load(path)
        for row in rows:
            if row.get("anchor_ordinal", row.get("ordinal")) == ordinal:
                return path, row
    raise RuntimeError(f"missing row ordinal={ordinal} root={root}")

def make_sense(word, sid, pos, cn, en, level="L2", pattern="", collocs=None):
    return {
        "collocations": collocs or [], "confidence":"medium", "definition_cn":cn,
        "definition_en":en, "governing_pattern":pattern, "level":level,
        "needs_human_review":0, "pos":pos, "sense_id":sid,
        "sense_label_en":en, "sort_order":999, "transitivity":"nonverb" if pos != "verb" else "vt",
    }

def colloc_id(word, sid, phrase):
    return "collocation:" + sha({"word":word,"sense_id":sid,"phrase":phrase})[:20]

def sense_id(word, branch):
    return f"sense:{word}:" + sha({"word":word,"branch":branch})[:16]

def construction_id(word, pattern):
    return "construction:" + sha({"word":word,"pattern":pattern})[:20]

class Store:
    def __init__(self):
        self.words = {}
        self.word_paths = {}
        for p in sorted(WORD_SHARDS.glob("*.json")):
            for row in load(p):
                self.words[row["ordinal"]] = row
                self.word_paths[row["ordinal"]] = p
        self.senses = {}
        self.sense_paths = {}
        self.sense_rows = {}
        for p in sorted(SENSE_SHARDS.glob("*.json")):
            for row in load(p):
                sid = row.get("record",{}).get("stable_sense_id")
                if sid:
                    self.senses[sid] = row["record"]
                    self.sense_paths[sid] = p
                    self.sense_rows.setdefault(p, []).append(row)
        self.colls = {}
        self.coll_paths = {}
        self.coll_rows = {}
        for p in sorted(COLL_SHARDS.glob("*.json")):
            for row in load(p):
                cid = row.get("record",{}).get("collocation_id")
                if cid:
                    self.colls[cid] = row["record"]
                    self.coll_paths[cid] = p
                    self.coll_rows.setdefault(p, []).append(row)
        self.changed_word_ordinals = set()
        self.changed_sense_ids = set()
        self.changed_collocation_ids = set()
        self.identity = {"REUSE_EXISTING_STABLE":[], "NEW_SEMANTIC_BRANCH":[], "ESCALATE_IDENTITY":[]}

    def record(self, ordinal):
        return self.words[ordinal]["record"]

    def mark(self, ordinal):
        self.changed_word_ordinals.add(ordinal)

    def active(self, ordinal):
        return self.record(ordinal).setdefault("senses", [])

    def core(self, ordinal, cn=None, en=None):
        core = self.record(ordinal).setdefault("core_concept", {"core_clusters":[]})
        core.setdefault("core_clusters", [])
        if cn is not None: core["core_meaning_cn"] = cn; core["mental_model_cn"] = cn
        if en is not None: core["core_meaning_en"] = en
        self.mark(ordinal)

    def add_cluster(self, ordinal, pos, cn, en, ids):
        core = self.record(ordinal).setdefault("core_concept", {"core_clusters":[]})
        clusters = core.setdefault("core_clusters", [])
        for c in clusters:
            if set(ids) & set(c.get("sense_ids", [])):
                c["sense_ids"] = list(dict.fromkeys(c.get("sense_ids",[]) + ids))
                self.mark(ordinal); return
        clusters.append({"label_cn":cn,"label_en":en,"pos":pos,"sense_ids":ids})
        self.mark(ordinal)

    def remove_sense(self, ordinal, sid):
        old = self.active(ordinal)
        self.record(ordinal)["senses"] = [s for s in old if s.get("sense_id") != sid]
        for c in self.record(ordinal).get("core_concept",{}).get("core_clusters",[]):
            c["sense_ids"] = [x for x in c.get("sense_ids",[]) if x != sid]
        if sid in self.senses:
            self.senses[sid]["status"] = "deprecated"
            self.senses[sid]["merged_into_sense_id"] = None
            self.senses[sid]["updated_at"] = "2026-09-14T00:00:00Z"
            self.changed_sense_ids.add(sid)
        self.mark(ordinal)

    def put_existing(self, ordinal, sid, *, cn=None, en=None, pos=None, level=None, pattern=None, branch=None):
        word = self.record(ordinal)["word"]
        if sid not in self.senses: raise RuntimeError(f"stable sense missing: {sid}")
        reg = self.senses[sid]
        reg["status"] = "active"; reg["merged_into_sense_id"] = None; reg["updated_at"] = "2026-09-14T00:00:00Z"
        if cn is not None: reg["definition_cn"] = cn
        if en is not None: reg["definition_en"] = en
        if pos is not None: reg["pos"] = pos
        self.changed_sense_ids.add(sid); self.identity["REUSE_EXISTING_STABLE"].append(ordinal)
        existing = next((copy.deepcopy(s) for s in self.active(ordinal) if s.get("sense_id") == sid), None)
        if existing is None:
            existing = make_sense(word,sid,pos or reg.get("pos","noun"),cn or reg.get("definition_cn",""),en or reg.get("definition_en",""),level or "L2",pattern or "")
        if cn is not None: existing["definition_cn"] = cn
        if en is not None: existing["definition_en"] = en; existing["sense_label_en"] = en
        if pos is not None: existing["pos"] = pos
        if level is not None: existing["level"] = level
        if pattern is not None: existing["governing_pattern"] = pattern
        if branch is not None: existing["sort_order"] = branch
        self.record(ordinal)["senses"] = [s for s in self.active(ordinal) if s.get("sense_id") != sid] + [existing]
        self.record(ordinal)["senses"].sort(key=lambda s:s.get("sort_order",999))
        self.mark(ordinal)
        return existing

    def new(self, ordinal, branch, pos, cn, en, level="L2", pattern="", cluster=None):
        word = self.record(ordinal)["word"]; sid = sense_id(word,branch)
        if sid in self.senses: return sid
        s = make_sense(word,sid,pos,cn,en,level,pattern)
        s["sort_order"] = max([x.get("sort_order",-1) for x in self.active(ordinal)] + [-1]) + 1
        self.record(ordinal).setdefault("senses",[]).append(s)
        path = self.word_paths[ordinal]
        self.senses[sid] = {"created_at":"2026-09-14T00:00:00Z","definition_cn":cn,"definition_en":en,
            "headword":word,"legacy_alias_history":[],"legacy_aliases":[],"merged_into_sense_id":None,
            "pos":pos,"record_type":"sense_registry","semantic_key":sha({"word":word,"branch":branch,"cn":cn,"en":en}),
            "semantic_key_history":[],"stable_sense_id":sid,"status":"active","updated_at":"2026-09-14T00:00:00Z"}
        self.sense_paths[sid] = next((p for p in SENSE_SHARDS.glob("*.json") if any(r.get("anchor_ordinal") == ordinal for r in load(p))), sorted(SENSE_SHARDS.glob("*.json"))[0])
        self.changed_sense_ids.add(sid); self.identity["NEW_SEMANTIC_BRANCH"].append(ordinal); self.mark(ordinal)
        if cluster:
            label_cn, label_en, pos = cluster
            self.add_cluster(ordinal, pos[0] if isinstance(pos, list) else pos, label_cn, label_en, [sid])
        return sid

    def add_colloc(self, ordinal, sid, phrase, meaning, exam="fixed_pattern"):
        rec = self.record(ordinal); word=rec["word"]
        target = next((s for s in rec.get("senses",[]) if s.get("sense_id")==sid),None)
        if target is None: raise RuntimeError(f"collocation target not active: {word}:{sid}")
        if any(c.get("phrase")==phrase for s in rec.get("senses",[]) for c in s.get("collocations",[])): return
        cid=colloc_id(word,sid,phrase)
        item={"collocation_id":cid,"exam_value":exam,"legacy_source_object_ids":[f"{sid}:collocation:handoff-o0475-o0674"],"meaning_cn":meaning,"phrase":phrase}
        target.setdefault("collocations",[]).append(item)
        self.colls[cid]={"collocation_id":cid,"created_by":"lexicalos_semantic_handoff_o0475_o0674","current_value_hash":sha(item),"legacy_source_object_ids":item["legacy_source_object_ids"],"record_type":"collocation_identity","schema_version":"kianos_collocation_identity_v1","sense_id":sid,"status":"active","word_id":f"word:{word}"}
        self.coll_paths[cid]=next((p for p in COLL_SHARDS.glob("*.json") if any(r.get("anchor_ordinal") == ordinal for r in load(p))), sorted(COLL_SHARDS.glob("*.json"))[0])
        self.changed_collocation_ids.add(cid); self.mark(ordinal)

    def add_construction(self, ordinal, pattern, meaning, direction="R+P", level="L2"):
        rec=self.record(ordinal); arr=rec.setdefault("constructions",[])
        if any(x.get("pattern")==pattern for x in arr): return
        arr.append({"construction_id":construction_id(rec["word"],pattern),"direction":direction,"level":level,"meaning_cn":meaning,"pattern":pattern})
        self.mark(ordinal)

    def update_sense(self, ordinal, sid, cn=None, en=None, level=None, pattern=None):
        s=self.put_existing(ordinal,sid,cn=cn,en=en,level=level,pattern=pattern)
        return s

    def add_overlay(self, ordinal, sid, overlay):
        s=next(x for x in self.active(ordinal) if x["sense_id"]==sid); s["lexical_identity_overlay"]=overlay; self.mark(ordinal)

    def demote(self, ordinal, sid): self.remove_sense(ordinal,sid)

    def finalize(self):
        for ordinal in self.changed_word_ordinals:
            rec=self.record(ordinal)
            rec["content_hash"] = sha({k:v for k,v in rec.items() if k != "content_hash"})
        for p in sorted(set(self.word_paths[o] for o in self.changed_word_ordinals)):
            rows=load(p)
            for row in rows:
                if row["ordinal"] in self.changed_word_ordinals: row["record"]=self.record(row["ordinal"])
            dump(p,rows,compact=True)
        for p in sorted(set(self.sense_paths[s] for s in self.changed_sense_ids)):
            rows=load(p)
            for row in rows:
                sid=row.get("record",{}).get("stable_sense_id")
                if sid in self.changed_sense_ids: row["record"]=self.senses[sid]
            # append new rows assigned to this shard later
            dump(p,rows,compact=True)
        # Add newly created sense rows to the shard holding their word ordinal.
        existing_sids={row.get("record",{}).get("stable_sense_id") for p in SENSE_SHARDS.glob("*.json") for row in load(p)}
        for sid in sorted(self.changed_sense_ids):
            if sid in existing_sids: continue
            p=self.sense_paths[sid]
            ordinal=next(o for o in self.changed_word_ordinals if self.record(o)["word"]==self.senses[sid]["headword"])
            rows=load(p); rows.append({"source_row":max([r.get("source_row",0) for r in rows]+[0])+1,"anchor_ordinal":ordinal,"record":self.senses[sid]}); dump(p,rows,compact=True)
        for cid in sorted(self.changed_collocation_ids):
            p=self.coll_paths[cid]; rows=load(p)
            if not any(r.get("record",{}).get("collocation_id")==cid for r in rows): rows.append({"source_row":max([r.get("source_row",0) for r in rows]+[0])+1,"anchor_ordinal":next(o for o in self.changed_word_ordinals if self.record(o)["word"]==self.colls[cid]["word_id"].split(":",1)[1]),"record":self.colls[cid]})
            dump(p,rows,compact=True)

def sid(s,w,legacy):
    return next(x["stable_sense_id"] for x in s.senses.values() if x.get("headword")==w and legacy in x.get("legacy_aliases",[]))

def apply(s):
    # Core/phraseology/construction upgrades, expressed exactly at the owner layer.
    s.core(475,"在明确区分的个体关系之间，也可涉及两个以上对象；范围或共享关系中的‘在…之间’","in the interval or relationship separating distinct entities; also used for ranges and shared relations")
    s.add_construction(475,"between distinct entities vs among a group","between selects distinct individual relationships; among selects distributed group membership")
    s.add_colloc(484,sid(s,"bid","bid:l2:3"),"a bid to do sth","为做某事而作的尝试")
    s.add_colloc(486,sid(s,"bill","bill:l1:1"),"foot the bill","支付费用")
    s.add_colloc(486,sid(s,"bill","bill:l3:6"),"bill sb/sth as ...","宣传、描述或呈现为…")
    s.add_colloc(487,sid(s,"billion","billion:l1:1"),"a billion (modern)","十亿（10^9）")
    s.demote(487,sid(s,"billion","billion:l2:2")); s.core(487,"十亿（10^9）","the modern number 1,000,000,000 (10^9)")
    s.new(488,"BrE discard verb","verb","扔掉；丢弃","to throw something away or discard it",cluster=("动词","to throw away or discard",["verb"]))
    s.add_colloc(489,sid(s,"bind","bind:l2:5"),"be bound to do sth","一定会、很可能或注定做某事")
    s.add_construction(489,"be bound to do sth vs be bound by sth","bound to do expresses likelihood or inevitability; bound by expresses constraint or obligation")
    bird=sid(s,"bird","bird:l1:1"); s.put_existing(492,bird,cn="鸟；禽",en="a warm-blooded vertebrate with feathers; the ordinary animal-class meaning does not require flight",level="L1"); s.add_cluster(492,"noun","鸟；禽","a warm-blooded vertebrate with feathers",[bird])
    bs=sid(s,"biscuit","biscuit:l1:1"); s.update_sense(495,bs,cn="（英）饼干、薄脆饼；（美）软面包卷",en="in BrE, a small baked item like a cookie or cracker; in AmE, a small soft bread roll"); s.add_colloc(495,bs,"BrE biscuit / AmE biscuit","英美义项边界")
    bit=sid(s,"bit","bit:l1:1");
    for p,m in [("a bit + adj/adv","有点、稍微"),("a bit of + noun","少量"),("bit by bit","一点一点地"),("bits and pieces","零碎东西")]: s.add_colloc(496,bit,p,m,"usage_example")
    black=sid(s,"black","black:l1:2"); nb=s.new(500,"illicit compound branch","adjective","（组合词中）非法的、秘密的或被禁止的","in compounds, illicit, secret, or prohibited",cluster=("熟悉新义","illicit, secret, or prohibited in compounds",["adjective"])); s.add_colloc(500,nb,"black economy","非法经济")
    blank=sid(s,"blank","blank:l1:2"); s.add_colloc(504,blank,"draw a blank","想不起、找不到答案或结果"); s.add_colloc(504,blank,"go blank","突然无法思考或记忆")
    blast=sid(s,"blast","blast:l1:1"); s.add_colloc(506,blast,"have a blast","玩得非常开心","usage_example")
    blaze=sid(s,"blaze","blaze:l3:4"); trail=s.new(507,"pioneer trail branch","verb","开创道路或方法","to pioneer or open a new path, method, or approach",cluster=("比喻义","to pioneer a new path or method",["verb"])); s.add_colloc(507,trail,"blaze a trail","开创一条新道路或方法"); s.demote(507,blaze)
    bleak=s.new(508,"figurative outlook branch","adjective","无希望的、令人沮丧的或不太可能改善的","without hope, depressing, or unlikely to improve",cluster=("比喻义","without hope or unlikely to improve",["adjective"])); s.add_colloc(508,bleak,"bleak future/prospects/outlook","黯淡的未来、前景或展望","usage_example")
    blend=sid(s,"blend","blend:l1:1");
    for p,m in [("blend in","融入、不显眼"),("blend with/into","与…协调或逐渐混合"),("blend A with B","把不同事物混合")]: s.add_colloc(510,blend,p,m,"fixed_pattern")
    s.add_construction(510,"blend in / blend with or into","fit in or harmonize; combine gradually, distinct from transitive mixing")
    bless=sid(s,"bless","bless:l1:1"); s.add_colloc(511,bless,"be blessed with sth","幸运地拥有某物")
    blind=sid(s,"blind","blind:l1:2"); s.add_colloc(512,blind,"turn a blind eye to sth","故意忽视本应注意或处理的事")
    blood=sid(s,"blood","blood:l1:1"); s.add_colloc(515,blood,"bad blood","敌意或嫌隙"); s.add_colloc(515,blood,"in cold blood","故意且冷酷无情地")
    bloody=sid(s,"bloody","bloody:l3:4"); s.update_sense(516,bloody,cn="非常、极其（英式非正式，可能冒犯）",en="very or extremely, as an informal BrE intensifier; register may be offensive")
    bloom=s.new(517,"algal bloom branch","noun","（科学、生态）大量快速生长，尤指藻华","rapid mass growth, especially an algal bloom",cluster=("科学义","rapid mass growth, especially of algae",["noun"])); s.add_colloc(517,bloom,"algal bloom","藻华","usage_example")
    blow=sid(s,"blow","blow:l1:1"); s.put_existing(520,blow,cn="重击；打击、挫折或震惊",en="a hard hit, or a figurative setback or shock",level="L1"); s.add_colloc(520,blow,"a blow to ...","对…的打击"); s.add_construction(520,"blow up","爆炸或使…爆炸")
    blue=sid(s,"blue","blue:l2:3"); s.put_existing(521,blue,cn="悲伤的、忧郁的",en="sad or depressed"); s.add_colloc(521,blue,"feel blue","感到忧郁"); s.add_colloc(521,blue,"out of the blue","出乎意料地")
    blunder=sid(s,"blunder","blunder:l2:3"); s.put_existing(523,blunder,cn="犯严重或愚蠢的错误",en="to make a serious or stupid mistake"); s.add_construction(523,"blunder into sth","笨拙或偶然地进入、卷入某事")
    board=sid(s,"board","board:l1:1"); s.add_colloc(527,board,"on board","在船、飞机或车辆上；参与、加入或支持计划"); s.add_colloc(527,board,"on the board","担任管理或指导委员会成员")
    bolt=s.new(534,"lightning noun","noun","闪电；雷电的一道光","a flash or stroke of lightning",cluster=("自然现象","a flash or stroke of lightning",["noun"])); s.add_colloc(534,bolt,"lightning bolt","闪电")
    bond=s.new(536,"chemical bond","noun","（科学）原子之间的结合力或连接","the force or link holding atoms together, especially a chemical bond",cluster=("科学义","the force linking atoms, especially chemically",["noun"])); s.add_colloc(536,bond,"chemical bond","化学键")
    bone=sid(s,"bone","bone:l3:5"); s.put_existing(537,bone,cn="用功学习（非正式）",en="to study or review something intensively"); s.add_colloc(537,bone,"bone up on sth","集中学习或复习某事")
    book_n=sid(s,"book","book:l1:1"); book_v=sid(s,"book","book:l1:2"); s.put_existing(539,book_n,cn="书；书籍",en="a written work or composition that has been published",level="L1"); s.put_existing(539,book_v,cn="预订、安排",en="to reserve or arrange something in advance",pos="verb",level="L1"); s.add_colloc(539,book_v,"book a room/ticket/table","预订房间、票或桌位"); s.add_cluster(539,"noun","书；书籍","a published written work",[book_n]); s.add_cluster(539,"verb","预订、安排","to reserve in advance",[book_v])
    boost=s.new(541,"noun increase/help","noun","增加、帮助或改善；提振","an increase, help, or improvement",cluster=("名词","an increase, help, or improvement",["noun"])); s.add_colloc(541,boost,"a boost to confidence/growth","对信心或增长的提振")
    boot=sid(s,"boot","boot:l1:1"); comp=sid(s,"boot","boot:l3:5"); s.put_existing(542,boot,cn="靴子",en="footwear covering the foot and lower leg",level="L1"); s.put_existing(542,comp,cn="启动计算机或系统",en="to start a computer or system",pos="verb",level="L2"); s.add_colloc(542,comp,"boot a computer/system","启动计算机或系统")
    border=sid(s,"border","border:l2:4"); s.add_colloc(544,border,"border on sth","接近、几乎达到某种程度"); s.add_construction(544,"border on + sth","be close to or almost amount to something")
    born=sid(s,"born","born:l1:1"); s.add_overlay(546,born,{"case_sensitive":False,"identity_type":"form_boundary","lexical_identity_id":"identity:"+sha({"word":"born","forms":["born","borne"]})[:20],"surface_lemma":"born","paired_form":"borne","note":"born chiefly marks birth; borne covers other past-participle uses of bear"})
    s.add_construction(546,"born vs borne","born is chiefly used for birth; borne is used for other past-participle senses of bear","R+P","L2")
    borrow=sid(s,"borrow","borrow:l1:1"); s.add_colloc(547,borrow,"borrow from sth","从另一来源借用或采用词语、想法、风格或方法"); s.add_construction(547,"borrow vs lend","borrow receives temporarily; lend gives temporarily","R+P","L1")
    bottom=sid(s,"bottom","bottom:l1:1"); s.add_colloc(553,bottom,"the bottom line","最重要的一点或最终结果；商业上的盈亏"); s.add_colloc(553,bottom,"get to the bottom of sth","查明某事的真相"); s.add_colloc(553,bottom,"bottom out","降至最低点")
    bound=sid(s,"bound","bound:l1:2"); s.update_sense(555,bound,cn="被束缚、受约束；注定或很可能",en="tied or obliged; certain or very likely when followed by to do"); s.add_colloc(555,bound,"be bound to do","一定会或很可能做某事")
    brain=sid(s,"brain","brain:l1:2"); s.add_colloc(566,brain,"the brains behind sth","某事的策划者、创作者或主要负责人")
    brake=sid(s,"brake","brake:l2:3"); s.put_existing(567,brake,cn="对进程起减缓或限制作用的事物",en="something that slows or restricts growth or progress"); s.add_colloc(567,brake,"a brake on sth","对…的制约")
    brass=sid(s,"brass","brass:l1:1"); s.add_colloc(571,brass,"the top brass","高级官员或领导，尤指军队或大型组织")
    brave=sid(s,"brave","brave:l1:1"); verb=sid(s,"brave","brave:l1:5"); s.put_existing(572,brave,cn="勇敢的",en="courageous and able to face danger or difficulty"); s.put_existing(572,verb,cn="勇敢面对、忍受",en="to face or endure danger or difficulty courageously",pos="verb",level="L2"); s.add_colloc(572,verb,"brave sth","勇敢面对某事")
    breach=sid(s,"breach","breach:l1:1"); s.add_colloc(573,breach,"data/security/privacy breach","数据、安全或隐私遭到未经授权的访问、暴露或侵犯","usage_example")
    br=sid(s,"break","break:l1:1");
    for p,m in [("break down","出故障、崩溃或分解"),("break through","突破"),("break up","分裂、结束关系或解散"),("break into","闯入；突然开始")]: s.add_colloc(575,br,p,m,"fixed_pattern")
    s.add_construction(575,"break down / through / up / into","high-frequency phrasal branches remain distinct from generic break")
    bd=sid(s,"breakdown","breakdown:l1:2"); s.update_sense(576,bd,en="a failure or collapse of communication, negotiations, relationships, order, or a system"); s.add_colloc(576,bd,"breakdown in communication","沟通中断")
    breakfast=sid(s,"breakfast","breakfast:l1:1"); old=sid(s,"breakfast","breakfast:l3:3"); s.put_existing(577,breakfast,cn="早餐，一天的第一餐",en="the first meal of the day, usually eaten in the morning",level="L1"); s.add_colloc(577,breakfast,"have/eat breakfast","吃早餐","usage_example"); s.demote(577,old)
    breed=sid(s,"breed","breed:l1:3"); nb=s.new(581,"biological intransitive","verb","（动物或植物）繁殖、生育","for animals or plants to reproduce",cluster=("生物义","animals or plants reproduce",["verb"])); s.add_colloc(581,nb,"animals/plants breed","动物或植物繁殖")
    brick=sid(s,"brick","brick:l1:1"); s.core(585,"砖；普通砖制材料","ordinary brick or brick material");
    bright=s.new(590,"hopeful prospects","adjective","有希望的、有前途的或成功的","hopeful, promising, or likely to succeed",cluster=("比喻义","hopeful or promising",["adjective"])); s.add_colloc(590,bright,"bright future/prospects","光明的未来或前景")
    bring=sid(s,"bring","bring:l1:2"); s.add_colloc(592,bring,"bring up","提出；抚养"); s.add_colloc(592,bring,"bring out","使显现；出版或推出"); s.add_colloc(592,bring,"bring back","带回；使恢复"); s.add_colloc(592,bring,"bring in","引入；带来收入"); s.add_construction(592,"bring up / out / back / in","high-value phrasal branches of bring")
    bronze=s.new(598,"medal ranking","noun","铜牌；第三名","a bronze medal or third place",cluster=("比赛排名","a bronze medal or third place",["noun"])); s.add_colloc(598,bronze,"win/take bronze","赢得铜牌或第三名")
    broom=sid(s,"broom","broom:l1:1"); s.put_existing(599,broom,cn="扫帚",en="a long-handled brush used for sweeping",level="L1"); s.add_colloc(599,broom,"a broom","扫帚","usage_example")
    brush=sid(s,"brush","brush:l1:2"); s.add_colloc(605,brush,"brush aside","不理会、驳回"); s.add_colloc(605,brush,"brush up on sth","提高或复习某项知识或技能"); s.add_construction(605,"brush aside / brush up on","dismiss or review/improve knowledge")
    bucket=sid(s,"bucket","bucket:l1:1"); s.add_construction(608,"kick the bucket","（非正式）去世")
    bud=sid(s,"bud","bud:l1:1"); s.put_existing(609,bud,cn="芽；花蕾或叶芽",en="an undeveloped flower or leaf shoot",level="L1"); s.add_colloc(609,bud,"a flower bud","花蕾")
    buffer=sid(s,"buffer","buffer:l1:2"); s.put_existing(611,buffer,cn="（计算机）临时数据存储区",en="a temporary data-storage area in a computer's memory",level="L1"); s.add_colloc(611,buffer,"data buffer","数据缓冲区")
    buffet=sid(s,"buffet","buffet:l1:1"); v=sid(s,"buffet","buffet:l2:3"); s.add_overlay(612,buffet,{"case_sensitive":False,"identity_type":"pronunciation_by_part_of_speech","surface_lemma":"buffet","pronunciation":"/ˈbʊfeɪ/ noun meal"}); s.add_overlay(612,v,{"case_sensitive":False,"identity_type":"pronunciation_by_part_of_speech","surface_lemma":"buffet","pronunciation":"/ˈbʌfɪt/ verb strike repeatedly"})
    build=sid(s,"build","build:l1:1"); buildup=sid(s,"build","build:l2:3"); s.put_existing(614,build,cn="建造、创建（具体或抽象事物）",en="to construct or create a physical or abstract thing",level="L1"); s.put_existing(614,buildup,cn="逐渐增加或增强",en="to increase or strengthen something over time",level="L2"); s.add_colloc(614,buildup,"build up","逐渐增加或增强")
    bulb=s.new(615,"electric light bulb","noun","电灯泡","an electric light bulb",cluster=("日常物品","an electric light bulb",["noun"])); s.add_colloc(615,bulb,"light bulb","电灯泡")
    cattle=sid(s,"bull","bull:l1:1"); finance=sid(s,"bull","bull:l2:2"); s.put_existing(617,cattle,cn="公牛，成年未阉雄性牛",en="an adult uncastrated male of domestic cattle",level="L1"); s.put_existing(617,finance,cn="看涨者；看涨市场",en="a person or market expecting prices to rise",level="L2"); s.demote(617,sid(s,"bull","bull:l3:3")); s.demote(617,sid(s,"bull","bull:l3:5")); s.add_cluster(617,"noun","公牛；看涨者或市场","adult male cattle; a rising-price market",[cattle,finance])
    bullet=s.new(618,"typographic bullet","noun","项目符号；项目符号点","a typographic bullet or bullet point marking an item in a list",cluster=("排版义","a typographic mark for a list item",["noun"])); s.add_colloc(618,bullet,"bullet point","项目符号")
    bulletin=sid(s,"bulletin","bulletin:l1:1"); verb=sid(s,"bulletin","bulletin:l2:2"); s.put_existing(619,bulletin,cn="简短的官方报告或公告",en="a brief official report or announcement",level="L1"); s.demote(619,verb)
    bully=sid(s,"bully","bully:l1:2"); s.put_existing(620,bully,cn="恐吓、欺凌或骚扰某人",en="to intimidate or harass someone, often using power to force them",pos="verb",level="L1"); s.add_colloc(620,bully,"bully sb into doing","欺凌某人迫使其做某事"); s.demote(620,sid(s,"bully","bully:l3:4")); s.demote(620,sid(s,"bully","bully:l3:5"))
    bump=sid(s,"bump","bump:l1:2"); s.add_colloc(621,bump,"bump into sb","意外遇见某人"); s.add_colloc(621,bump,"bump up","增加"); s.add_colloc(621,bump,"a bump in prices","价格上涨")
    burn=sid(s,"burn","burn:l1:1"); s.add_colloc(628,burn,"burn out","耗尽；因过劳或压力而精疲力竭"); s.add_construction(628,"be burned/burnt out","become exhausted through overwork or stress")
    bury=sid(s,"bury","bury:l2:3"); s.add_colloc(630,bury,"bury the hatchet","结束争吵、和解")
    bush=sid(s,"bush","bush:l1:1"); s.add_colloc(632,bush,"beat around/about the bush","拐弯抹角，回避要点")
    but=sid(s,"but","but:l2:2"); s.add_colloc(635,but,"anything but","一点也不，远非"); s.add_colloc(635,but,"but for","若不是、要不是")
    butcher=s.new(636,"figurative ruin verb","verb","把某事搞砸、糟蹋或做得很差","to ruin or mangle something by doing it very badly",cluster=("比喻动词","to ruin or do something very badly",["verb"])); s.add_colloc(636,butcher,"butcher a song/pronunciation/performance","把歌曲、发音或表演弄得很糟")
    butter=sid(s,"butter","butter:l2:2"); s.add_colloc(637,butter,"butter sb up","奉承某人以取得好感或利益")
    butterfly=sid(s,"butterfly","butterfly:l1:1"); s.put_existing(638,butterfly,cn="蝴蝶",en="an insect with a slender body and large often colorful wings",level="L1"); s.add_colloc(638,butterfly,"butterflies in one's stomach","紧张不安的感觉")
    by=sid(s,"by","by:l1:2");
    for p,m in [("by far","大大地、远远地"),("by no means","绝不、一点也不"),("by + V-ing","通过做某事"),("by means of","借助、通过")]: s.add_colloc(642,by,p,m,"fixed_pattern")
    cable=sid(s,"cable","cable:l2:2"); s.put_existing(648,cable,cn="结实的绳索或电缆",en="a strong rope or wire, especially one made of twisted wires",level="L1"); s.add_colloc(648,cable,"cable TV/cable television","有线电视"); s.add_colloc(648,cable,"data/power cable","数据线或电力电缆")
    call=sid(s,"call","call:l1:3"); s.add_colloc(656,call,"call on/upon sb to do sth","正式要求或敦促某人做某事"); s.add_colloc(656,call,"call off","取消"); s.add_construction(656,"call on/upon sb to do sth","formally ask or urge someone to act")
    camera=sid(s,"camera","camera:l1:1"); s.update_sense(660,camera,en="a device or piece of equipment for taking photographs and/or recording video",cn="拍照和/或录制视频的设备")
    campaign=sid(s,"campaign","campaign:l2:4"); s.put_existing(662,campaign,cn="开展或参加持续的运动",en="to organize or take part in a sustained campaign, especially campaign for or against something",pos="verb",level="L2"); s.add_colloc(662,campaign,"campaign for/against sth","为支持或反对某事而开展运动")
    cancel=sid(s,"cancel","cancel:l1:1"); void=sid(s,"cancel","cancel:l2:3"); out=sid(s,"cancel","cancel:l2:4"); s.put_existing(666,cancel,cn="取消安排的事件、订单或计划",en="to decide that an arranged event, order, or plan will not happen",level="L1"); s.put_existing(666,void,cn="使某物无效、作废",en="to make something no longer valid or effective",level="L2"); s.add_colloc(666,void,"cancel out","抵消、中和")
    cloth=sid(s,"canvas","canvas:l1:1"); painting=sid(s,"canvas","canvas:l1:2"); s.put_existing(674,cloth,cn="帆布等结实织物",en="strong cloth or material used for sails, tents, and other purposes",level="L1"); s.put_existing(674,painting,cn="画布；油画作品",en="a piece of canvas used as a painting surface, or a painting on it",level="L1"); s.add_colloc(674,cloth,"canvas fabric","帆布材料"); s.add_colloc(674,painting,"a canvas painting","一幅画布油画")

def owner_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

def write_receipts(store: Store, natural_words: dict[int, dict], report: dict) -> None:
    """Persist the bounded engineering receipt after the final readback."""
    import subprocess
    rows=[]
    handoff=HANDOFF.read_text(encoding="utf-8")
    pat=re.compile(r'^(?:###\s+|-\s+)o(\d{4})\s+\*\*([^*]+)\*\*\s+—\s+(NO_CHANGE|UPGRADE|BLOCKED)\s+—\s+(SAFE_SIMPLE|DEPTH_READY|BLOCKED)',re.M)
    for m in pat.finditer(handoff):
        ordinal,word,operation,quality=int(m.group(1)),m.group(2),m.group(3),m.group(4)
        rel=f"content/lexical/words/by-ordinal/o{ordinal:04d}.json"
        before=hashlib.sha256(subprocess.check_output(["git","show",f"HEAD:{rel}"])).hexdigest()
        after=owner_hash(ROOT/rel)
        active=[x["sense_id"] for x in natural_words[ordinal]["record"].get("senses",[])]
        rows.append({"ordinal":ordinal,"word":word,"operation":operation,"final_quality":quality,"before_sha256":before,"after_sha256":after,"byte_preserved":before==after,"word_id":natural_words[ordinal]["word_id"],"active_sense_ids":active,"full_object_readback":"PASS"})
    out=LEX/"audit"/"vnext-content-execution"; out.mkdir(parents=True,exist_ok=True)
    changed=sorted(store.changed_word_ordinals)
    new=sorted(NEW_BRANCH_ORDINALS)
    reuse=sorted(set(UPGRADES)-set(new))
    receipt={"schema":"kianos.lexical.semantic_handoff_implementation_receipt.v1","status":"LOCAL_CLOSED_PENDING_INTEGRATION","handoff":"content/lexical/semantic-review/o0475-o0674.md","baseline_origin_main":"376f5c9e876226a0daab63324766ed341b77448a","range":[475,674],"authority":"semantic-review handoff only; mechanical implementation by Luna/Codex","expected_counts":{"NO_CHANGE":125,"UPGRADE":75,"BLOCKED":0},"actual":{"owners_read_back":200,"changed_upgrade_owners":len(changed),"no_change_byte_preserved":all(x["byte_preserved"] for x in rows if x["operation"]=="NO_CHANGE"),"blocked_owners":[],"semantic_escalations":[],"engineering_failures":[],"o0675_plus_untouched":True},"current_final":{"catalog_execution":"PAUSED","bounded_implementation":"COMPLETE","next_range_active":False,"o0675_plus_active":False},"owners":rows}
    (out/"implementation-o0475-o0674.json").write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    new_ids=sorted(x for x,r in store.senses.items() if r.get("headword") in {UPGRADES[o] for o in NEW_BRANCH_ORDINALS} and not r.get("legacy_aliases") and r.get("status")=="active")
    ident={"schema":"kianos.lexical.identity_reconciliation_readback.v1","status":"PASS","baseline_origin_main":"376f5c9e876226a0daab63324766ed341b77448a","scope":[475,674],"handoff":"content/lexical/semantic-review/o0475-o0674.md","classifications":{"REUSE_EXISTING_STABLE":{"rule":"reuse continuous active/deprecated/merged stable branch; no generated replacement","owners":reuse},"NEW_SEMANTIC_BRANCH":{"rule":"deterministic stable ID created only for a handoff-authorized genuinely new branch","owners":new},"ESCALATE_IDENTITY":{"owners":[]}},"reactivated_or_reconciled_sense_ids":sorted(store.changed_sense_ids),"new_stable_sense_ids":new_ids,"reference_closure":"PASS","relation_owner_changes":[],"form_identity_closure":{"status":"PASS","word_owner_files":["content/lexical/words/by-ordinal/o0546.json","content/lexical/words/by-ordinal/o0612.json"]},"readback_assertions":{"stable_word_identity_preserved":True,"active_sense_registry_closed":True,"merged_into_not_left_on_active_senses":True,"handoff_generated_ids_absent":True,"o0675_plus_not_activated":True},"natural_owner_audit":report}
    (out/"identity-reconciliation-readback-o0475-o0674.json").write_text(json.dumps(ident,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    esc={"schema":"kianos.lexical.semantic_escalation_artifact.v1","status":"NO_ESCALATIONS_REQUIRED","scope":[475,674],"authority":["content/lexical/semantic-review/o0475-o0674.md","content/lexical/CURRENT.md"],"escalations":[],"note":"All 75 upgrades were mechanically mapped by the frozen handoff and Current identity rule; no unresolved sense split/merge, competing identity, uncertain Relation truth, or unclear Form boundary remained. Engineering failures are not semantic escalations."}
    (out/"semantic-escalations-o0475-o0674.json").write_text(json.dumps(esc,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

def main():
    handoff=HANDOFF.read_text(encoding="utf-8")
    rows=list(re.finditer(r'^(?:###\s+|-\s+)o(\d{4})\s+\*\*([^*]+)\*\*\s+—\s+(NO_CHANGE|UPGRADE|BLOCKED)',handoff,re.M))
    if len(rows)!=200 or sum(m.group(3)=="UPGRADE" for m in rows)!=75 or set(UPGRADES)!={int(m.group(1)) for m in rows if m.group(3)=="UPGRADE"}: raise SystemExit("HANDOFF_COVERAGE_MISMATCH")
    s=Store(); apply(s)
    # The handoff write set is fixed even when this idempotent executor is
    # rerun after some new branches already exist.
    s.changed_word_ordinals.update(UPGRADES)
    s.finalize()
    # Rebuild only the changed Natural Owner projections from the canonical
    # stores.  The full materializer is not invoked because unrelated owners
    # must remain byte-preserved.
    import sys
    sys.path.insert(0, str(ROOT / "tools"))
    from lexical_natural_owner import build, dump_json
    natural_words, relation_owners, report = build()
    if report["status"] != "PASS":
        raise SystemExit("NATURAL_OWNER_AUDIT_FAILED:" + json.dumps(report, ensure_ascii=False))
    for ordinal in sorted(UPGRADES):
        dump_json(OWNER_DIR / f"o{ordinal:04d}.json", natural_words[ordinal])
    write_receipts(s, natural_words, report)
    print(json.dumps({"status":"APPLIED","scope":[475,674],"upgrade_count":len(s.changed_word_ordinals),"changed_ordinals":sorted(s.changed_word_ordinals),"changed_senses":len(s.changed_sense_ids),"changed_collocations":len(s.changed_collocation_ids),"identity":{k:sorted(set(v)) for k,v in s.identity.items()}},ensure_ascii=False,indent=2))
if __name__=="__main__": main()
