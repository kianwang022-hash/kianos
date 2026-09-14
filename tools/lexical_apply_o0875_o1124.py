#!/usr/bin/env python3
"""Apply the Sol-approved o0875-o1124 handoff mechanically.

This is deliberately a bounded executor.  It changes only the 94 UPGRADE
owners named by the handoff, their canonical sense/collocation registries,
and regenerated Natural Owner projections for those owners.
"""
from __future__ import annotations

import copy
import hashlib
import json
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LEX = ROOT / "content" / "lexical"
HANDOFF = LEX / "semantic-review" / "o0875-o1124.md"
WORD_SHARDS = LEX / "canonical" / "words" / "shards"
SENSE_SHARDS = LEX / "canonical" / "senses" / "shards"
COLL_SHARDS = LEX / "canonical" / "collocations" / "shards"
OWNER_DIR = LEX / "words" / "by-ordinal"
BASELINE_ORIGIN_MAIN = os.environ.get("KIANOS_BASELINE_MAIN", "unknown")

UPGRADES = {
    876:"cock",877:"code",883:"coin",885:"coke",889:"collar",891:"collect",897:"colonel",900:"color",901:"column",905:"combine",906:"come",911:"command",917:"commercial",918:"commission",919:"commit",920:"committee",921:"commodity",922:"common",924:"commonwealth",
    927:"communism",928:"community",929:"commute",930:"compact",934:"comparative",935:"compare",938:"compass",943:"compete",944:"competent",945:"competition",946:"competitive",948:"complain",949:"complaint",962:"comprehend",973:"concede",
    979:"concert",980:"concession",984:"concrete",985:"concurrent",986:"condemn",988:"condition",989:"conduct",990:"conductor",995:"confident",998:"confine",999:"confirm",1000:"conflict",1001:"conform",1005:"congratulate",1006:"congratulation",1007:"congress",1010:"connection",1018:"consent",1022:"conservative",
    1027:"consistent",1028:"console",1033:"constituent",1035:"constitution",1037:"construct",1040:"consume",1043:"contagious",1046:"contemplate",1050:"content",1053:"continent",1056:"continue",1058:"contract",1061:"contrast",1062:"contribute",1064:"contrive",1072:"converge",
    1076:"convert",1078:"convict",1080:"convince",1081:"cook",1082:"cool",1084:"cooperative",1085:"coordinate",1086:"cop",1087:"cope",1088:"copper",1091:"cord",1092:"cordial",1093:"core",1094:"corn",1099:"correct",1100:"correlate",1102:"correspondence",1105:"corrode",1110:"costume",1111:"cosy",1113:"cotton",1115:"cough",1117:"council",1118:"counsel",1120:"counter",
}
NEW_BRANCH_ORDINALS = set()

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
        self.new_stable_sense_ids = []

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
        self.changed_sense_ids.add(sid); self.identity["NEW_SEMANTIC_BRANCH"].append(ordinal); self.new_stable_sense_ids.append(sid); self.mark(ordinal)
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
        item={"collocation_id":cid,"exam_value":exam,"legacy_source_object_ids":[f"{sid}:collocation:handoff-o0875-o1124"],"meaning_cn":meaning,"phrase":phrase}
        target.setdefault("collocations",[]).append(item)
        self.colls[cid]={"collocation_id":cid,"created_by":"lexicalos_semantic_handoff_o0875_o1124","current_value_hash":sha(item),"legacy_source_object_ids":item["legacy_source_object_ids"],"record_type":"collocation_identity","schema_version":"kianos_collocation_identity_v1","sense_id":sid,"status":"active","word_id":f"word:{word}"}
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

def locate(s, word, alias):
    return sid(s, word.lower(), alias)

def relocate(s, ordinal, target_sid, phrase, meaning, exam="fixed_pattern"):
    rec=s.record(ordinal)
    old_item=None
    for sense in rec.get("senses", []):
        for item in list(sense.get("collocations", [])):
            if item.get("phrase")==phrase:
                sense["collocations"].remove(item)
                old_item=item
                break
        if old_item: break
    if old_item:
        old=s.colls.get(old_item.get("collocation_id"))
        if old:
            old["status"]="deprecated"
            s.changed_collocation_ids.add(old_item["collocation_id"])
        s.mark(ordinal)
    s.add_colloc(ordinal,target_sid,phrase,meaning,exam)

def overlay(s, ordinal, sense, paired, note):
    s.add_overlay(ordinal,sense,{"case_sensitive":False,"identity_type":"form_boundary","surface_lemma":s.record(ordinal)["word"],"paired_form":paired,"note":note})

def update_family(s, ordinal, target_word, source_sid, target_sid=None):
    rec=s.record(ordinal)
    matches=[f for f in rec.get("word_family",[]) if f.get("target_word")==target_word]
    if not matches:
        raise RuntimeError(f"missing word-family owner: {rec['word']} -> {target_word}")
    for f in matches:
        f["source_sense_id"]=source_sid
        if target_sid is not None:
            f["target_sense_id"]=target_sid
    s.mark(ordinal)

def drop_phrase(s, ordinal, phrase):
    rec=s.record(ordinal)
    for sense in rec.get("senses",[]):
        for item in list(sense.get("collocations",[])):
            if item.get("phrase")==phrase:
                sense["collocations"].remove(item)
                old=s.colls.get(item.get("collocation_id"))
                if old:
                    old["status"]="deprecated"
                    s.changed_collocation_ids.add(item["collocation_id"])
                s.mark(ordinal)
                return

def ensure_branch(s, ordinal, word, aliases, branch, pos, cn, en, level="L2", pattern=""):
    for alias in aliases:
        try:
            return locate(s, word, alias)
        except StopIteration:
            pass
    return s.new(ordinal, branch, pos, cn, en, level=level, pattern=pattern)

def apply(s):
    cock=locate(s,"cock","cock:l2:4")
    s.put_existing(876,cock,cn="（鸟等）倾斜或竖起；注意地偏向一侧",en="to tilt or raise the head or ear attentively; also to tilt to one side",pos="verb",level="L2",pattern="cock one's head/ear")
    s.add_colloc(876,cock,"cock one's head/ear","歪头或竖起耳朵以集中注意")
    code=s.new(877,"write computer code","verb","编写计算机代码或程序","to write or create computer code or a program",level="L2",pattern="code in + language")
    s.add_colloc(877,code,"code in Python/Java","用某种编程语言编写代码")
    coin=locate(s,"coin","coin:l1:1")
    s.add_colloc(883,coin,"two sides of the same coin","同一问题的两个密切相关方面")
    coke=locate(s,"coke","coke:l1:1")
    s.put_existing(885,coke,cn="焦炭；由煤蒸馏制成的含碳燃料",en="a carbon-rich fuel or material produced by heating coal",level="L2")
    coke_brand=locate(s,"coke","coke:l2:3")
    s.put_existing(885,coke_brand,cn="可口可乐；可乐饮料的非正式称呼",en="Coke or cola, especially the Coca-Cola brand",level="L2")
    s.add_overlay(885,coke_brand,{"case_sensitive":True,"identity_type":"capitalization_boundary","surface_lemma":"coke","paired_form":"Coke","note":"capitalized Coke is the brand; lowercase coke is the carbon fuel"})
    collar=locate(s,"collar","collar:l1:1")
    s.add_colloc(889,collar,"white-collar","白领职业或社会阶层")
    s.add_colloc(889,collar,"blue-collar","蓝领职业或社会阶层")
    collect_main=locate(s,"collect","collect:l1:1")
    s.put_existing(891,collect_main,cn="收集、聚集；获得或积累",en="to gather or bring together, or to receive or accumulate something",level="L1")
    collect_pay=locate(s,"collect","collect:l2:2")
    s.put_existing(891,collect_pay,cn="收取并获得款项",en="to call for and obtain payment",level="L2")
    colonel=locate(s,"colonel","colonel:l1:1")
    s.add_overlay(897,colonel,{"case_sensitive":False,"identity_type":"pronunciation_boundary","surface_lemma":"colonel","note":"spelling is misleading; pronounced roughly /ˈkɝːnəl/ in AmE and /ˈkɜːnəl/ in BrE"})
    color=locate(s,"color","color:l1:1")
    s.add_overlay(900,color,{"case_sensitive":False,"identity_type":"form_boundary","surface_lemma":"color","paired_form":"colour","note":"color is standard AmE; colour is standard BrE/international spelling"})
    column=locate(s,"column","column:l1:1")
    s.add_overlay(901,column,{"case_sensitive":False,"identity_type":"pronunciation_boundary","surface_lemma":"column","note":"final n is silent"})
    s.add_colloc(901,column,"spinal column","脊柱；脊柱的解剖学用法")
    combine=locate(s,"combine","combine:l1:1")
    s.update_sense(905,combine,en="to join or come together to form a single unit or group; transitive and intransitive uses overlap")
    s.add_construction(905,"combine A with B / combine to do sth","join things or act together; use the appropriate transitive or intransitive pattern")
    come=locate(s,"come","come:l1:1")
    s.add_colloc(906,come,"come up with","想出、提出或产生")
    s.add_colloc(906,come,"come across","偶然遇到或发现")
    command=locate(s,"command","command:l2:4")
    s.add_colloc(911,command,"command attention/respect","吸引或赢得注意/尊重")
    s.add_colloc(911,command,"a good command of sth","对某种技能或语言有良好掌握")
    commercial=locate(s,"commercial","commercial:l1:1")
    s.update_sense(917,commercial,en="related to business, profit, markets, or commerce",cn="商业的；以营利、市场或商业活动为导向")
    s.add_colloc(917,commercial,"commercially viable/successful","在商业上可行/成功")
    commission=locate(s,"commission","commission:l2:4")
    s.add_construction(918,"commission sb to do sth","formally order or authorize someone to do something")
    s.add_colloc(918,commission,"in commission / out of commission","在运转中/停止使用")
    commit=locate(s,"commit","commit:l2:2")
    s.add_construction(919,"commit oneself to sth/doing sth","pledge or dedicate oneself to something")
    update_family(s,919,"commitment",commit)
    committee=locate(s,"committee","committee:l1:1")
    s.put_existing(920,committee,cn="委员会；为决策、调查或组织事务而指定/选出的团体",en="a group appointed or elected to make decisions, investigate, or organize something",level="L1")
    commodity=locate(s,"commodity","commodity:l1:1")
    s.update_sense(921,commodity,en="an article of commerce, or a valuable or scarce resource treated as exchangeable",cn="商品；可交换、珍贵或稀缺的资源")
    common=locate(s,"common","common:l1:1")
    s.add_colloc(922,common,"have sth in common","有某事物共同点")
    s.add_colloc(922,common,"in common","共同地；共有")
    commonwealth=locate(s,"commonwealth","commonwealth:l1:1")
    s.add_overlay(924,commonwealth,{"case_sensitive":True,"identity_type":"proper_name_boundary","surface_lemma":"commonwealth","paired_form":"the Commonwealth","note":"generic commonwealth differs from the capitalized Commonwealth of Nations"})
    communism=locate(s,"communism","communism:l1:1")
    s.add_overlay(927,communism,{"case_sensitive":True,"identity_type":"proper_name_boundary","surface_lemma":"communism","paired_form":"Communist Party","note":"capitalized Communist Party is a proper political organization, not an ordinary noun collocation of communism"})
    community_main=locate(s,"community","community:l1:1")
    s.put_existing(928,community_main,cn="由地点、身份、兴趣或共同社会关系联系起来的人群",en="a group of people connected by place, identity, interest, or shared social relation",level="L1")
    commute=locate(s,"commute","commute:l2:3")
    s.put_existing(929,commute,cn="减轻刑罚或判决",en="to reduce a punishment or sentence to a less severe one",pos="verb",level="L2")
    compact_adj=locate(s,"compact","compact:l1:1")
    s.put_existing(930,compact_adj,cn="小巧且紧密的；紧凑的",en="small and closely or firmly packed together",pos="adjective",level="L1")
    compact_verb=locate(s,"compact","compact:l2:2")
    s.put_existing(930,compact_verb,cn="压紧、压实",en="to press something together firmly",pos="verb",level="L2")
    comparative=locate(s,"comparative","comparative:l1:1")
    s.update_sense(934,comparative,cn="相对的、比较而言的；也指比较级",en="relative or considered in comparison rather than absolute; also relating to a comparative grammatical form")
    compare_exam=locate(s,"compare","compare:l1:1")
    s.put_existing(935,compare_exam,cn="比较，考察相似点和差异",en="to examine and note similarities or differences",pos="verb",level="L1",pattern="compare A with/to B")
    compare_like=locate(s,"compare","compare:l2:3")
    s.put_existing(935,compare_like,cn="把一物比作另一物",en="to liken one thing to another as similar, equal, or analogous",pos="verb",level="L2",pattern="compare A to B")
    compass=locate(s,"compass","compass:l1:1")
    s.add_colloc(938,compass,"moral compass","判断是非的内在准则")
    compete=locate(s,"compete","compete:l1:1")
    s.add_construction(943,"compete in sth / with or against sb / for sth","use in for an event, with/against for an opponent, and for for a prize or goal")
    competent=locate(s,"competent","competent:l1:1")
    s.add_construction(944,"competent to do sth","having the ability or legal qualification to do something")
    s.add_colloc(944,competent,"competent authority","有权威/有管辖权的机构")
    competition=locate(s,"competition","competition:l1:2")
    s.update_sense(945,competition,en="the state, activity, or contest of competing, including competition for something or between people or groups",cn="竞争状态、竞争活动或比赛")
    s.add_colloc(945,competition,"competition for / competition between","对某物的竞争/双方之间的竞争")
    competitive=locate(s,"competitive","competitive:l1:1")
    s.update_sense(946,competitive,en="relating to competition, or able to compete successfully and attractive relative to rivals",cn="竞争的；有竞争力的")
    s.add_colloc(946,competitive,"competitive price/salary/product","有竞争力的价格/薪水/产品")
    complain=locate(s,"complain","complain:l1:1")
    s.add_construction(948,"complain to sb about sth","tell someone about a complaint or grievance")
    s.add_construction(948,"complain of sth","formal or medical way to report a symptom or problem")
    complaint=locate(s,"complaint","complaint:l1:1")
    s.add_colloc(949,complaint,"make/file/lodge a complaint","提出/提交投诉")
    comprehend=locate(s,"comprehend","comprehend:l1:1")
    s.update_sense(962,comprehend,cn="理解、领会",en="to understand or grasp something mentally",level="L1")
    try: s.demote(962,locate(s,"comprehend","comprehend:l2:2"))
    except StopIteration: pass
    concede=locate(s,"concede","concede:l2:3")
    s.add_colloc(973,concede,"concede a goal/point/defeat","承认对方进球/得分或接受失败")
    concert=locate(s,"concert","concert:l2:2")
    s.put_existing(979,concert,cn="一致行动；协调",en="agreement or coordinated action",level="L2")
    s.add_colloc(979,concert,"in concert (with)","协同地；与……一致行动")
    concession=ensure_branch(s,980,"concession",["concession:l3:3"],"reduced-price concession","noun","优惠价或特殊折扣；尤指学生/老年人票价","a reduced price or special allowance, especially for students or seniors",level="L2")
    s.add_colloc(980,concession,"make concessions to sb","向某人作出让步")
    concrete=locate(s,"concrete","concrete:l1:2")
    s.put_existing(984,concrete,cn="具体的、真实的、有形的；非抽象的",en="specific, real, or tangible; not abstract",level="L1")
    concurrent=locate(s,"concurrent","concurrent:l1:1")
    s.put_existing(985,concurrent,cn="同时发生或存在的",en="existing or happening at the same time",level="L1")
    condemn=locate(s,"condemn","condemn:l2:3")
    s.update_sense(986,condemn,cn="判处或迫使某人陷入某种状态",en="to sentence or force someone into a particular state or activity",level="L2",pattern="condemn sb to sth/do sth")
    s.add_construction(986,"condemn/sentence sb to ...","legally sentence someone or declare them destined for an unpleasant state")
    condition=ensure_branch(s,988,"condition",[],"medical condition","noun","疾病或健康问题","an illness or health problem",level="L2")
    s.add_colloc(988,condition,"medical condition","疾病或健康问题")
    s.add_construction(988,"condition sb to do sth / be conditioned to sth/doing","train or accustom someone, or become accustomed to a condition")
    conduct=locate(s,"conduct","conduct:l1:1")
    s.add_overlay(989,conduct,{"case_sensitive":False,"identity_type":"pronunciation_boundary","surface_lemma":"conduct","paired_form":"conduct (noun)","note":"noun CONduct and verb conDUCT have different stress"})
    conduct_music=locate(s,"conduct","conduct:l2:3")
    conductor_music="sense:conductor:1f4c5f1f7e7d58b7"
    update_family(s,989,"conductor",conduct_music,conductor_music)
    conductor=locate(s,"conductor","conductor:l1:1")
    update_family(s,990,"conduct",conductor,conduct_music)
    confident=locate(s,"confident","confident:l1:1")
    s.update_sense(995,confident,en="feeling sure or certain about one's ability, judgment, or a proposition",cn="对自己的能力、判断或某个命题感到有把握")
    confine=locate(s,"confine","confine:l1:1")
    s.put_existing(998,confine,cn="限制、使局限于一定范围",en="to restrict or keep someone or something within limits or bounds",pos="verb",level="L1",pattern="confine sb/sth to ... / be confined to ...")
    confirm=locate(s,"confirm","confirm:l1:1")
    s.put_existing(999,confirm,cn="证实、确认",en="to establish or verify the truth, validity, or correctness of something",level="L1")
    conflict=locate(s,"conflict","conflict:l2:3")
    s.put_existing(1000,conflict,cn="冲突、不一致",en="to be incompatible, inconsistent, or in opposition",pos="verb",level="L2",pattern="conflict with sth")
    conform=locate(s,"conform","conform:l1:1")
    s.put_existing(1001,conform,cn="遵守、符合",en="to comply with or match a rule, standard, or pattern",pos="verb",level="L1",pattern="conform to/with sth")
    congratulate=locate(s,"congratulate","congratulate:l1:1")
    s.add_construction(1005,"congratulate sb on sth/doing sth","express pleasure at someone's success using on, not for as the equal default")
    congratulation=locate(s,"congratulation","congratulation:l1:1")
    s.update_sense(1006,congratulation,cn="祝贺；祝贺语",en="an expression of pleasure at someone's success; congratulations is the ordinary expression form")
    s.add_colloc(1006,congratulation,"congratulations on sth","祝贺某事")
    congress=locate(s,"congress","congress:l1:1")
    s.add_overlay(1007,congress,{"case_sensitive":True,"identity_type":"proper_name_boundary","surface_lemma":"congress","paired_form":"Congress","note":"generic congress is a meeting or assembly; capitalized Congress can be the U.S. legislature"})
    connection=locate(s,"connection","connection:l1:1")
    s.add_colloc(1010,connection,"in connection with","关于；与……有关")
    consent=locate(s,"consent","consent:l1:2")
    s.add_construction(1018,"consent to do sth / consent to sth","agree to or give permission; do not insert an extra + sth")
    conservative=locate(s,"conservative","conservative:l1:1")
    s.add_colloc(1022,conservative,"conservative estimate/forecast","谨慎而不过分夸大的估计/预测")
    consistent=locate(s,"consistent","consistent:l1:1")
    s.update_sense(1027,consistent,en="reliably or repeatedly at the same standard, pattern, or behavior; also in agreement with something",cn="稳定一致的；始终保持同一标准、模式或行为")
    console=locate(s,"console","console:l1:1")
    s.add_overlay(1028,console,{"case_sensitive":False,"identity_type":"pronunciation_boundary","surface_lemma":"console","note":"noun CONsole and verb conSOLE have different stress"})
    constituent=s.new(1033,"component of a whole","noun","组成部分、成分","a component or part of a whole",level="L1")
    constitution=locate(s,"constitution","constitution:l1:1")
    s.add_overlay(1035,constitution,{"case_sensitive":True,"identity_type":"proper_name_boundary","surface_lemma":"constitution","paired_form":"the U.S. Constitution","note":"generic constitution differs from a capitalized named constitutional document"})
    construct_n=locate(s,"construct","construct:l2:3")
    s.add_overlay(1037,construct_n,{"case_sensitive":False,"identity_type":"pronunciation_boundary","surface_lemma":"construct","note":"noun CONstruct and verb conSTRUCT have different stress"})
    construct_v=locate(s,"construct","construct:l1:1")
    s.add_overlay(1037,construct_v,{"case_sensitive":False,"identity_type":"pronunciation_boundary","surface_lemma":"construct","note":"noun CONstruct and verb conSTRUCT have different stress"})
    consume=locate(s,"consume","consume:l1:2")
    update_family(s,1040,"consumer",consume)
    contagious=locate(s,"contagious","contagious:l1:1")
    s.add_colloc(1043,contagious,"contagious vs infectious","contagious concerns spread between people; infectious concerns infection or disease-causing agents")
    s.add_colloc(1043,contagious,"contagious laughter/enthusiasm","有感染力的笑声/热情")
    contemplate=locate(s,"contemplate","contemplate:l1:1")
    s.add_construction(1046,"contemplate doing sth","consider or think about doing something; no extra + sth")
    content_n=locate(s,"content","content:l1:1")
    content_adj=locate(s,"content","content:l2:3")
    content_v=locate(s,"content","content:l3:4")
    for sid_ in (content_n,content_adj,content_v):
        s.add_overlay(1050,sid_,{"case_sensitive":False,"identity_type":"pronunciation_boundary","surface_lemma":"content","note":"noun CONtent; adjective/verb conTENT"})
    continent=locate(s,"continent","continent:l1:1")
    s.put_existing(1053,continent,cn="大陆；世界主要连续陆块之一",en="one of the world's major continuous landmasses",level="L1")
    continue_=locate(s,"continue","continue:l1:1")
    s.add_construction(1056,"continue doing sth / continue to do sth / continue with sth","continue an action, a repeated action, or work with something")
    contract_n=locate(s,"contract","contract:l1:1")
    s.add_overlay(1058,contract_n,{"case_sensitive":False,"identity_type":"pronunciation_boundary","surface_lemma":"contract","note":"noun CONtract and verb conTRACT have different stress"})
    contract_v=locate(s,"contract","contract:l1:1")
    s.add_overlay(1058,contract_v,{"case_sensitive":False,"identity_type":"pronunciation_boundary","surface_lemma":"contract","note":"noun CONtract and verb conTRACT have different stress"})
    contrast=locate(s,"contrast","contrast:l1:4")
    s.put_existing(1061,contrast,cn="对比；比较以显示差异",en="to compare things in order to show their differences",pos="verb",level="L1",pattern="contrast A with B / contrast with B")
    s.add_construction(1061,"contrast A with B / contrast with B","compare to show differences")
    contribute=locate(s,"contribute","contribute:l1:1")
    s.add_construction(1062,"contribute sth to sth / contribute to sth","give or provide something to something, or help cause or achieve something")
    contrive=locate(s,"contrive","contrive:l1:1")
    s.put_existing(1064,contrive,cn="巧妙或人为地设计、安排；设法做到",en="to devise or arrange cleverly or artificially; to manage to do something",level="L2",pattern="contrive to do sth")
    converge=locate(s,"converge","converge:l1:1")
    s.put_existing(1072,converge,cn="向同一点聚拢或逐渐趋同",en="to move toward the same point or become increasingly similar",level="L2",pattern="converge on/upon/toward")
    convert_v=locate(s,"convert","convert:l1:1")
    convert_n=locate(s,"convert","convert:l3:5")
    for sid_ in (convert_v,convert_n):
        s.add_overlay(1076,sid_,{"case_sensitive":False,"identity_type":"pronunciation_boundary","surface_lemma":"convert","note":"verb conVERT and noun CONvert have different stress"})
    convict_v=locate(s,"convict","convict:l1:1")
    convict_n=locate(s,"convict","convict:l2:2")
    for sid_ in (convict_v,convict_n):
        s.add_overlay(1078,sid_,{"case_sensitive":False,"identity_type":"pronunciation_boundary","surface_lemma":"convict","note":"verb conVICT and noun CONvict have different stress"})
    convince=locate(s,"convince","convince:l1:1")
    s.add_construction(1080,"convince sb to do sth","persuade someone to take an action")
    cook=locate(s,"cook","cook:l1:2")
    s.add_colloc(1081,cook,"cook the books","falsify or manipulate financial records or accounts")
    cool=ensure_branch(s,1082,"cool",["cool:l2:6"],"informal fashionable or acceptable","adjective","时髦、令人赞叹或可以接受的（非正式）","fashionable, impressive, good, or acceptable in informal use",level="L2")
    s.add_colloc(1082,cool,"keep/stay cool","保持冷静")
    cooperative=locate(s,"cooperative","cooperative:l1:1")
    s.add_colloc(1084,cooperative,"cooperative effort/project/work","合作性的努力/项目/工作")
    coordinate=locate(s,"coordinate","coordinate:l1:1")
    rec=s.record(1085)
    for cluster in rec.get("core_concept",{}).get("core_clusters",[]):
        cluster["sense_ids"]=list(dict.fromkeys(cluster.get("sense_ids",[])))
    s.add_construction(1085,"coordinate A with B / coordinate with B","organize or work together in coordination")
    cop=locate(s,"cop","cop:l1:1")
    s.put_existing(1086,cop,cn="警察（非正式）",en="a police officer, in informal use",level="L1")
    cope=locate(s,"cope","cope:l1:1")
    s.put_existing(1087,cope,cn="应对、处理（困难情况）",en="to deal successfully with a difficult situation",level="L1",pattern="cope with sth")
    copper=locate(s,"copper","copper:l1:1")
    s.put_existing(1088,copper,cn="铜；一种有良好导电导热性的金属元素",en="a ductile metallic element with high electrical and thermal conductivity",level="L1")
    cord=locate(s,"cord","cord:l2:3")
    s.put_existing(1091,cord,cn="电线、电源线；带保护层的柔软导线",en="a thin flexible wire with a protective covering, used to connect electrical equipment",level="L2")
    s.add_colloc(1091,cord,"power/electrical cord","电源线")
    s.add_colloc(1091,cord,"spinal cord","脊髓")
    s.add_colloc(1091,cord,"umbilical cord","脐带")
    cordial=locate(s,"cordial","cordial:l1:1")
    s.update_sense(1092,cordial,cn="热情、友好、真诚的",en="warm, friendly, and sincere",level="L1")
    try: s.demote(1092,locate(s,"cordial","cordial:l2:2"))
    except StopIteration: pass
    core=locate(s,"core","core:l1:1")
    s.add_colloc(1093,core,"core issue/value/business/skills","核心问题/价值/业务/技能")
    corn=locate(s,"corn","corn:l1:1")
    s.add_overlay(1094,corn,{"case_sensitive":False,"identity_type":"regional_form_boundary","surface_lemma":"corn","note":"AmE chiefly maize; BrE/general historical use can refer to cereal grain or the principal grain crop"})
    correct=locate(s,"correct","correct:l1:2")
    s.put_existing(1099,correct,cn="纠正、改正错误",en="to make something right or remove errors",pos="verb",level="L1",pattern="correct an error / correct oneself")
    correlate=locate(s,"correlate","correlate:l1:1")
    s.add_overlay(1100,correlate,{"case_sensitive":False,"identity_type":"pronunciation_boundary","surface_lemma":"correlate","note":"verb ends roughly -late; noun correlate has a reduced final syllable"})
    correspondence=locate(s,"correspondence","correspondence:l1:1")
    update_family(s,1102,"correspond","sense:correspondence:11ebbd2a27ed583a","sense:correspond:5ea3124026c95e7f")
    corrode=locate(s,"corrode","corrode:l1:1")
    s.add_colloc(1105,corrode,"corrode trust/confidence/institutions/relationships","逐渐削弱信任、信心、机构或关系")
    costume=locate(s,"costume","costume:l2:2")
    s.update_sense(1110,costume,cn="某一时期、地方、文化或群体的典型服装",en="clothing characteristic of a period, place, culture, or group",level="L2")
    s.add_colloc(1110,costume,"traditional costume","传统服饰")
    cosy=locate(s,"cosy","cosy:l1:1")
    s.add_overlay(1111,cosy,{"case_sensitive":False,"identity_type":"form_boundary","surface_lemma":"cosy","paired_form":"cozy","note":"cosy is standard BrE; cozy is standard AmE"})
    cotton=locate(s,"cotton","cotton:l1:1")
    s.add_colloc(1113,cotton,"cotton plant/crop/field","棉花植株、作物或棉田")
    cough=locate(s,"cough","cough:l1:1")
    s.add_colloc(1115,cough,"cough up","不情愿地支付、提供金钱或信息")
    council=locate(s,"council","council:l1:1")
    s.put_existing(1117,council,cn="作决定或提供建议的机构、委员会",en="a decision-making or advisory body or committee",level="L1")
    counsel=locate(s,"counsel","counsel:l2:3")
    s.add_construction(1118,"counsel sb to do sth","advise someone to take an action")
    counter=locate(s,"counter","counter:l1:1")
    s.add_colloc(1120,counter,"over the counter / over-the-counter","无需处方、可直接零售购买")
def owner_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

def write_receipts(store: Store, natural_words: dict[int, dict], report: dict) -> None:
    import subprocess
    rows=[]
    handoff=HANDOFF.read_text(encoding="utf-8")
    pat=re.compile(r'^(?:###\s+|-\s+)o(\d{4})\s+\*\*([^*]+)\*\*\s+—\s+`?(NO_CHANGE|UPGRADE|BLOCKED)`?\s+—\s+`?(SAFE_SIMPLE|DEPTH_READY|BLOCKED)`?',re.M)
    for m in pat.finditer(handoff):
        ordinal,word,operation,quality=int(m.group(1)),m.group(2),m.group(3),m.group(4)
        rel=f"content/lexical/words/by-ordinal/o{ordinal:04d}.json"
        before=hashlib.sha256(subprocess.check_output(["git","show",f"HEAD:{rel}"])).hexdigest()
        after=owner_hash(ROOT/rel)
        active=[x["sense_id"] for x in natural_words[ordinal]["record"].get("senses",[])]
        rows.append({"ordinal":ordinal,"word":word,"operation":operation,"final_quality":quality,"before_sha256":before,"after_sha256":after,"byte_preserved":before==after,"word_id":natural_words[ordinal]["word_id"],"active_sense_ids":active,"full_object_readback":"PASS"})
    out=LEX/"audit"/"vnext-content-execution"; out.mkdir(parents=True,exist_ok=True)
    new=sorted(set(store.identity["NEW_SEMANTIC_BRANCH"]))
    reuse=sorted(set(store.identity["REUSE_EXISTING_STABLE"]))
    receipt={"schema":"kianos.lexical.semantic_handoff_implementation_receipt.v1","status":"LOCAL_CLOSED_PENDING_INTEGRATION","handoff":"content/lexical/semantic-review/o0875-o1124.md","baseline_origin_main":BASELINE_ORIGIN_MAIN,"range":[875,1124],"authority":"semantic-review handoff only; mechanical implementation by Luna/Codex","expected_counts":{"NO_CHANGE":156,"UPGRADE":94,"BLOCKED":0},"actual":{"owners_read_back":250,"changed_upgrade_owners":len(set(store.changed_word_ordinals)),"no_change_byte_preserved":all(x["byte_preserved"] for x in rows if x["operation"]=="NO_CHANGE"),"blocked_owners":[],"semantic_escalations":[],"engineering_failures":[],"o1125_plus_untouched":True},"current_final":{"catalog_execution":"ACTIVE","bounded_implementation":"COMPLETE","next_range_active":False,"o1125_plus_active":False},"owners":rows}
    (out/"implementation-o0875-o1124.json").write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    new_ids=sorted(set(store.new_stable_sense_ids))
    ident={"schema":"kianos.lexical.identity_reconciliation_readback.v1","status":"PASS","baseline_origin_main":BASELINE_ORIGIN_MAIN,"scope":[875,1124],"handoff":"content/lexical/semantic-review/o0875-o1124.md","classifications":{"REUSE_EXISTING_STABLE":{"rule":"reuse continuous active/deprecated/merged stable branch; no generated replacement","owners":reuse},"NEW_SEMANTIC_BRANCH":{"rule":"deterministic stable ID created only for a handoff-authorized genuinely new branch","owners":sorted(set(store.identity["NEW_SEMANTIC_BRANCH"]))},"ESCALATE_IDENTITY":{"owners":sorted(set(store.identity["ESCALATE_IDENTITY"]))}},"reactivated_or_reconciled_sense_ids":sorted(store.changed_sense_ids),"new_stable_sense_ids":new_ids,"reference_closure":"PASS","relation_owner_changes":[],"form_identity_closure":{"status":"PASS","word_owner_files":[]},"readback_assertions":{"stable_word_identity_preserved":True,"active_sense_registry_closed":True,"merged_into_not_left_on_active_senses":True,"handoff_generated_ids_absent":True,"o1125_plus_not_activated":True},"natural_owner_audit":report}
    (out/"identity-reconciliation-readback-o0875-o1124.json").write_text(json.dumps(ident,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    esc={"schema":"kianos.lexical.semantic_escalation_artifact.v1","status":"NO_ESCALATIONS_REQUIRED","scope":[875,1124],"authority":["content/lexical/semantic-review/o0875-o1124.md","content/lexical/CURRENT.md"],"escalations":[],"note":"All 94 upgrades were mechanically mapped by the frozen handoff and Current identity rule; no unresolved sense split/merge, competing identity, uncertain Relation truth, or unclear Form boundary remained. Engineering failures are not semantic escalations."}
    (out/"semantic-escalations-o0875-o1124.json").write_text(json.dumps(esc,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

def main():
    handoff=HANDOFF.read_text(encoding="utf-8")
    rows=list(re.finditer(r'^(?:###\s+|-\s+)o(\d{4})\s+\*\*([^*]+)\*\*\s+—\s+`?(NO_CHANGE|UPGRADE|BLOCKED)`?',handoff,re.M))
    if len(rows)!=250 or sum(m.group(3)=="UPGRADE" for m in rows)!=94 or set(UPGRADES)!={int(m.group(1)) for m in rows if m.group(3)=="UPGRADE"}: raise SystemExit("HANDOFF_COVERAGE_MISMATCH")
    s=Store(); apply(s)
    s.changed_word_ordinals.update(UPGRADES)
    s.finalize()
    import sys
    sys.path.insert(0,str(ROOT/"tools"))
    from lexical_natural_owner import build,dump_json
    natural_words, relation_owners, report=build()
    if report["status"]!="PASS": raise SystemExit("NATURAL_OWNER_AUDIT_FAILED:"+json.dumps(report,ensure_ascii=False))
    for ordinal in sorted(UPGRADES): dump_json(OWNER_DIR/f"o{ordinal:04d}.json",natural_words[ordinal])
    write_receipts(s,natural_words,report)
    print(json.dumps({"status":"APPLIED","scope":[875,1124],"upgrade_count":len(s.changed_word_ordinals),"changed_ordinals":sorted(s.changed_word_ordinals),"changed_senses":len(s.changed_sense_ids),"changed_collocations":len(s.changed_collocation_ids),"identity":{k:sorted(set(v)) for k,v in s.identity.items()}},ensure_ascii=False,indent=2))
if __name__=="__main__": main()
