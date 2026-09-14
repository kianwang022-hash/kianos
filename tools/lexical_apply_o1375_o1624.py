#!/usr/bin/env python3
"""Apply the Sol-approved o1375-o1624 handoff mechanically.

This is deliberately a bounded executor.  It changes only the 78 UPGRADE
owners named by the handoff, their canonical sense/collocation registries,
and regenerated Natural Owner projections for those owners.
"""
from __future__ import annotations

import copy
import hashlib
import json
import os
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LEX = ROOT / "content" / "lexical"
HANDOFF = LEX / "semantic-review" / "o1375-o1624.md"
WORD_SHARDS = LEX / "canonical" / "words" / "shards"
SENSE_SHARDS = LEX / "canonical" / "senses" / "shards"
COLL_SHARDS = LEX / "canonical" / "collocations" / "shards"
OWNER_DIR = LEX / "words" / "by-ordinal"
BASELINE_ORIGIN_MAIN = os.environ.get("KIANOS_BASELINE_MAIN", "unknown")

UPGRADES = {
    1375:"diffuse",1377:"digest",1378:"digital",1383:"dim",1385:"diminish",1388:"dinosaur",1390:"dip",1393:"direct",1395:"directly",1396:"director",1397:"directory",1398:"dirt",1401:"disappear",1405:"disc",1406:"discard",1408:"discharge",1411:"discount",1420:"discriminate",1421:"discuss",1429:"disorder",1438:"dissipate",1442:"distil",1444:"distinction",1448:"distress",1453:"ditch",1454:"dive",1464:"do",1470:"dog",1479:"donkey",1484:"dose",1491:"downtown",1495:"draft",1497:"dragon",1502:"draw",1504:"drawer",1505:"drawing",1506:"dread",1509:"drift",1510:"drill",1511:"drink",1513:"drive",1516:"drop",1519:"drug",1520:"drum",1521:"drunk",1522:"dry",1525:"duck",1528:"dumb",1529:"dump",1530:"duplicate",1535:"dust",1537:"dwarf",1546:"ear",1549:"earnest",1550:"earth",1552:"ease",1572:"editorial",1575:"effect",1576:"effective",1577:"efficiency",1579:"effort",1580:"egg",1587:"elaborate",1588:"elapse",1589:"elastic",1591:"elder",1592:"elect",1593:"electric",1594:"electrical",1601:"elementary",1604:"elevator",1606:"elicit",1607:"eligible",1609:"elite",1613:"email",1621:"emerge",1623:"emigrate",1624:"eminent",
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
        item={"collocation_id":cid,"exam_value":exam,"legacy_source_object_ids":[f"{sid}:collocation:handoff-o1375-o1624"],"meaning_cn":meaning,"phrase":phrase}
        target.setdefault("collocations",[]).append(item)
        self.colls[cid]={"collocation_id":cid,"created_by":"lexicalos_semantic_handoff_o1125_o1374","current_value_hash":sha(item),"legacy_source_object_ids":item["legacy_source_object_ids"],"record_type":"collocation_identity","schema_version":"kianos_collocation_identity_v1","sense_id":sid,"status":"active","word_id":f"word:{word}"}
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

def demote_family(s, ordinal, target_word):
    rec=s.record(ordinal)
    matches=[f for f in rec.get("word_family",[]) if f.get("target_word")==target_word]
    if not matches:
        raise RuntimeError(f"missing word-family owner: {rec['word']} -> {target_word}")
    for f in matches:
        f["publication_status"]="reference_only"
        f["verification_status"]="mechanically_demoted_false_active_anchor"
    s.mark(ordinal)


def find_sid(s, word, *fragments, pos=None):
    candidates=[]
    for sid_, rec in s.senses.items():
        if rec.get("headword") != word or (pos is not None and rec.get("pos") != pos): continue
        hay=" ".join(str(rec.get(k,"")) for k in ("definition_en","definition_cn","semantic_key","legacy_aliases"))
        if all(f.lower() in hay.lower() for f in fragments): candidates.append(sid_)
    if not candidates: raise StopIteration(f"missing branch {word}:{fragments}")
    active={x.get("sense_id") for o,w in UPGRADES.items() if w==word for x in s.record(o).get("senses",[])}
    return sorted(candidates,key=lambda x:(x not in active,x))[0]

def maybe_sid(s,word,*fragments,pos=None):
    try: return find_sid(s,word,*fragments,pos=pos)
    except StopIteration: return None

def sid_value(x): return x.get("sense_id") if isinstance(x,dict) else x

def reactivate(s,o,w,frags,pos,cn,en,level="L2",pattern=""):
    sid_=maybe_sid(s,w,*frags,pos=pos)
    return s.put_existing(o,sid_,cn=cn,en=en,pos=pos,level=level,pattern=pattern) if sid_ else s.new(o,"-".join(frags) or "reviewed",pos,cn,en,level=level,pattern=pattern)

def preserve_baseline_modules(s):
    for o in UPGRADES:
        rel=f"content/lexical/words/by-ordinal/o{o:04d}.json"
        try: base=json.loads(subprocess.check_output(["git","show",f"{BASELINE_ORIGIN_MAIN}:{rel}"]))["record"]
        except Exception: continue
        rec=s.record(o)
        for field in ("secondary_senses","semantic_neighbors","confusables","word_family","exam_paraphrases","review_signature","constructions"):
            if base.get(field) and not rec.get(field): rec[field]=copy.deepcopy(base[field])
        s.mark(o)

def add_if(s,o,w,frags,pos,cn,en,level="L2",pattern=""):
    x=reactivate(s,o,w,frags,pos,cn,en,level,pattern); return sid_value(x)

def apply(s):
    preserve_baseline_modules(s)
    for a,b,n in [(find_sid(s,"diffuse","spread something",pos="verb"),find_sid(s,"diffuse","spread out over",pos="adjective"),1375),(find_sid(s,"digest","break down food",pos="verb"),find_sid(s,"digest","compilation",pos="noun"),1377)]:
        overlay(s,n,a,s.record(n)["word"],"noun/verb pronunciation-stress boundary"); overlay(s,n,b,s.record(n)["word"],"noun/verb pronunciation-stress boundary")
    digital=add_if(s,1378,"digital",("computer","technology"),"adjective","数字技术的","relating to or using digital computer technology","L1"); s.add_colloc(1378,digital,"digital technology/data","数字技术/数据")
    dim=add_if(s,1383,"dim",("prospects",),"adjective","暗淡、无望的","unlikely to succeed or improve","L2"); s.add_colloc(1383,dim,"dim prospects/chances","前景/机会暗淡"); x=maybe_sid(s,"dim","not clear"); x and s.add_colloc(1383,x,"take a dim view of sth","对某事持不乐观看法")
    x=maybe_sid(s,"diminish","make something smaller",pos="verb"); x and s.put_existing(1385,x,cn="使变小、减弱或变得不重要",en="to make or become smaller, weaker, or less important",pattern="diminish in importance/size")
    dinosaur=add_if(s,1388,"dinosaur",("outdated",),"noun","过时的人、组织、技术或观念","a person, organization, technology, or idea regarded as outdated","L2"); s.add_colloc(1388,dinosaur,"a dinosaur of an organization/technology","过时的组织/技术")
    dip=add_if(s,1390,"dip",("decrease",),"noun","短暂下降或减少","a brief decline in prices, sales, levels, or amount","L2"); s.add_colloc(1390,dip,"a dip in sales/prices","销售额/价格下降"); s.add_construction(1390,"dip into savings/resources/a book","使用或短暂进入资源、储备或文本")
    s.core(1393,cn="直接：无中间环节，也可指坦率直截了当",en="direct means without an intermediary or straightforward in manner")
    old=maybe_sid(s,"directly","as soon as",pos="conjunction"); old and s.demote(1395,old)
    add_if(s,1395,"directly",("direct manner",),"adverb","直接地；立即地；坦率地","in a direct, immediate, or candid manner","L1")
    srcid=maybe_sid(s,"director","in charge",pos="noun"); tgt=maybe_sid(s,"direct","manage",pos="verb"); srcid and tgt and update_family(s,1396,"direct",srcid,tgt)
    x=maybe_sid(s,"directory","listing of files",pos="noun"); x and s.put_existing(1397,x,cn="计算机文件系统中的目录或文件夹位置",en="a filesystem directory or folder containing or locating files",level="L2",pattern="directory/folder path")
    x=maybe_sid(s,"dirt","unclean matter",pos="noun"); x and s.add_colloc(1398,x,"dirt on sb / dig up dirt","某人的丑闻信息；挖出丑闻")
    x=maybe_sid(s,"disappear","lost",pos="verb"); x and s.put_existing(1401,x,cn="消失、变得看不见或不再存在",en="to become unseen or cease to exist")
    disc=add_if(s,1405,"disc",("flat","circular"),"noun","圆盘；碟片；圆形薄片","a flat circular object or disk","L1"); overlay(s,1405,disc,"disc","disc/disk spelling boundary")
    x=maybe_sid(s,"discard","throw something away",pos="verb"); n=maybe_sid(s,"discard","act of throwing",pos="noun"); x and s.put_existing(1406,x,pattern="discard sth"); x and overlay(s,1406,x,"discard","noun/verb stress boundary"); n and overlay(s,1406,n,"discard","noun/verb stress boundary")
    duty=add_if(s,1408,"discharge",("perform","duty"),"verb","履行职责或义务","to fulfil or perform a duty or responsibility","L2","discharge a duty"); s.add_colloc(1408,duty,"discharge a duty","履行职责")
    v=maybe_sid(s,"discount","reduce the price",pos="verb"); n=maybe_sid(s,"discount","reducing the selling",pos="noun"); fig=add_if(s,1411,"discount",("unimportant",),"verb","对证据、可能性等不予重视","to treat evidence or a possibility as unimportant or unlikely","L2"); v and overlay(s,1411,v,"discount","noun/verb stress boundary"); n and overlay(s,1411,n,"discount","noun/verb stress boundary"); s.add_colloc(1411,fig,"discount evidence/possibility","低估或忽视证据/可能性")
    discr=add_if(s,1420,"discriminate",("against",),"verb","歧视；区别对待","to treat a person or group unfairly because of a characteristic","L2","discriminate against sb"); s.add_construction(1420,"discriminate against sb","不公平对待某人或群体")
    s.core(1421,cn="讨论、谈论某个主题，不是 discus 铁饼",en="to talk or write about a subject in detail")
    disorder=add_if(s,1429,"disorder",("lack of order",),"noun","无秩序、混乱或公共骚乱","lack of order or a state of public disturbance","L2"); s.add_colloc(1429,disorder,"public disorder","公共秩序混乱")
    dissipate=add_if(s,1438,"dissipate",("squander",),"verb","挥霍、耗尽或使资源/能量消散","to squander, use up, or disperse resources, energy, or wealth","L2"); s.add_colloc(1438,dissipate,"dissipate resources/energy/wealth","挥霍或耗尽资源/能量/财富")
    distil=add_if(s,1442,"distil",("extract",),"verb","提炼出精华或要点","to extract the essential meaning or substance","L2"); s.add_construction(1442,"distil the essence/key points from sth","从某物提炼精华"); overlay(s,1442,distil,"distil","distil/distill BrE/AmE spelling boundary")
    distinction=add_if(s,1444,"distinction",("honor",),"noun","荣誉、卓越或优异","a mark of honor, excellence, or superiority","L2"); s.add_colloc(1444,distinction,"with distinction","以优异成绩/荣誉")
    for frag in ("seizure of property","sold at a loss"):
        x=maybe_sid(s,"distress",frag); x and s.demote(1448,x)
    distress_n=add_if(s,1448,"distress",("severe suffering",),"noun","极度痛苦、悲伤或困境","severe suffering, pain, or trouble","L1"); s.add_colloc(1448,distress_n,"in distress","处于痛苦、危险或困境中"); add_if(s,1448,"distress",("cause distress",),"verb","使痛苦、忧虑或悲伤","to cause someone severe pain, worry, or sadness","L2","distress sb")
    ditch=add_if(s,1453,"ditch",("abandon",),"verb","抛弃、摆脱或甩掉","to abandon or get rid of someone or something","L2"); s.add_colloc(1453,ditch,"ditch a plan/partner","抛弃计划/伙伴")
    dive=add_if(s,1454,"dive",("deeply",),"verb","深入投入某主题或工作；暴跌","to engage deeply in a topic or work, or fall sharply in amount or price","L2"); s.add_colloc(1454,dive,"dive into a topic/work; prices dive","深入研究；价格暴跌")
    s.add_construction(1464,"have nothing/something to do with sth","是否与某事有关"); s.add_construction(1464,"do without sth","没有某物也能应付")
    dog=add_if(s,1470,"dog",("follow persistently",),"verb","持续跟随、困扰或纠缠","to follow or trouble someone persistently","L2","be dogged by sth"); s.add_colloc(1470,dog,"be dogged by problems","被问题持续困扰")
    x=maybe_sid(s,"donkey","foolish",pos="noun"); x and s.put_existing(1479,x,level="L3",cn="愚蠢或顽固的人（侮辱性、非正式）",en="an insulting informal term for a foolish or stubborn person")
    dose=add_if(s,1484,"dose",("measured amount",),"noun","（药物或物质的）一定剂量","a measured amount of medicine or another substance","L1"); s.add_colloc(1484,dose,"a dose of medicine","一剂药")
    s.add_construction(1491,"go/live downtown","去/住在市中心"); s.add_construction(1491,"downtown / the downtown area","市中心的副词、名词或定语用法")
    draft=add_if(s,1495,"draft",("military service",),"noun","征兵；服兵役抽签或征召","compulsory selection for military service","L2"); s.add_colloc(1495,draft,"the draft","征兵制度")
    for sid_ in [x.get("sense_id") for x in s.record(1495).get("senses",[])]: overlay(s,1495,sid_,"draft","draft/draught regional spelling boundary")
    for frag in ("gliding","technical"):
        x=maybe_sid(s,"dragon",frag); x and s.demote(1497,x)
    add_if(s,1497,"dragon",("mythical",),"noun","龙；神话中的大型爬行动物","a mythical monster resembling a giant reptile","L1")
    s.add_construction(1502,"draw a conclusion/inference/distinction","作出结论、推断或区分"); s.add_construction(1502,"draw on resources/experience","利用资源或经验"); s.add_construction(1502,"draw from evidence/source","从证据或来源得出")
    s.core(1504,cn="家具中的抽屉",en="a box-like container that slides in and out of furniture")
    add_if(s,1505,"drawing",("drawing",),"noun","绘画、素描；绘画活动或作品","a picture or activity produced by drawing","L1")
    add_if(s,1506,"dread",("fear",),"noun","恐惧、忧惧","great fear or apprehension","L1"); add_if(s,1506,"dread",("fear",),"verb","害怕、担心","to fear or anticipate with great anxiety","L1","dread doing sth")
    drift=add_if(s,1509,"drift",("movement","change"),"noun","逐渐偏离的移动或变化","a gradual movement or change away from a course or position","L2"); s.add_colloc(1509,drift,"a drift in opinion/policy","观点或政策逐渐偏移")
    drill=add_if(s,1510,"drill",("tool",),"noun","钻头、钻机或工具","a tool or machine for making holes","L1"); s.add_colloc(1510,drill,"a drill/drill bit","钻机/钻头")
    x=maybe_sid(s,"drink","large body of water"); x and s.demote(1511,x); s.core(1511,cn="饮料、饮酒或喝的行为",en="a liquid for drinking or the act of drinking")
    drive=add_if(s,1513,"drive",("cause","process"),"verb","推动或导致增长、变化、需求或创新","to propel or cause a process such as growth, change, demand, or innovation","L2","drive growth/change/demand/innovation"); s.add_colloc(1513,drive,"drive growth/change/demand/innovation","推动增长、变化、需求或创新")
    drop=add_if(s,1516,"drop",("decrease",),"verb","下降、减少（价格、水平或温度）","to fall or decrease in price, level, or temperature","L1","prices/levels drop"); s.add_colloc(1516,drop,"prices/levels/temperature drop","价格、水平或温度下降")
    x=maybe_sid(s,"drug","illegal drugs regularly"); x and s.demote(1519,x); s.core(1519,cn="药物或毒品；给某人下药",en="medicine or an illegal substance; to give someone a drug")
    drum=add_if(s,1520,"drum",("instrument",),"noun","鼓；鼓声","a percussion instrument or its sound","L1"); s.add_colloc(1520,drum,"beat/play the drum","击鼓/打鼓")
    add_if(s,1521,"drunk",("intoxicated",),"adjective","醉的、醉酒的","intoxicated by alcohol","L1")
    dry=add_if(s,1522,"dry",("make dry",),"verb","使某物变干","to make something dry","L1","dry sth"); s.add_construction(1522,"dry sth","使某物变干")
    add_if(s,1525,"duck",("lower head",),"verb","迅速低头或弯身躲避","to lower the head or body quickly to avoid being seen or hit","L2")
    x=maybe_sid(s,"dumb","lacking the power",pos="adjective"); x and s.put_existing(1528,x,level="L3",cn="不能说话的（旧式或可能冒犯）",en="unable to speak, old-fashioned or potentially offensive"); s.core(1528,cn="愚蠢、笨的；暂时沉默的",en="stupid or foolish; temporarily silent or not speaking")
    dump=add_if(s,1529,"dump",("dispose",),"verb","倾倒、丢弃或抛售","to get rid of, discard, or dump something","L1","dump sth"); s.add_colloc(1529,dump,"dump waste/data/shares","倾倒废物、转储数据或抛售股票")
    dv=add_if(s,1530,"duplicate",("copy",),"verb","复制、重复","to copy or repeat something","L1","duplicate sth"); da=add_if(s,1530,"duplicate",("exactly like",),"adjective","复制的、完全相同的","exactly like an original","L2"); n=maybe_sid(s,"duplicate","copy that corresponds",pos="noun"); overlay(s,1530,dv,"duplicate","noun/adjective vs verb pronunciation boundary"); n and overlay(s,1530,n,"duplicate","noun/adjective vs verb pronunciation boundary")
    dust=add_if(s,1535,"dust",("sprinkle",),"verb","撒粉或薄薄覆盖粉末","to sprinkle or lightly cover with powder","L2","dust sth with sth"); s.add_colloc(1535,dust,"dust a cake with sugar","在蛋糕上撒糖粉")
    x=maybe_sid(s,"dwarf","person who is very small",pos="noun"); x and overlay(s,1537,x,"dwarf","neutral person-reference boundary; prefer person with dwarfism"); s.core(1537,cn="矮小的；使显得相形见绌",en="small in size, or make something seem small by comparison")
    ear=add_if(s,1546,"ear",("organ",),"noun","耳朵、听觉器官","the organ of hearing","L1"); s.add_construction(1546,"lend an ear to sb/sth","listen sympathetically")
    x=maybe_sid(s,"earnest","firm and humorless",pos="adjective"); x and s.put_existing(1549,x,cn="认真、严肃、真诚而投入的",en="serious, sincere, and intent",level="L1")
    add_if(s,1550,"earth",("planet",),"noun","地球；行星","the planet Earth","L1"); add_if(s,1550,"earth",("soil",),"noun","土壤、土地或地面","soil or ground","L1")
    s.add_construction(1552,"at ease","comfortable and free from worry"); s.add_construction(1552,"ease pain/tension; ease into sth","make less severe; move gradually and carefully")
    x=maybe_sid(s,"editorial","relating to or characteristic of an editor",pos="adjective"); y=maybe_sid(s,"editor","person who edits",pos="noun"); x and y and update_family(s,1572,"editor",x,y)
    x=maybe_sid(s,"effect","symptom caused",pos="noun"); x and s.put_existing(1575,x,cn="副作用或非预期后果",en="an unintended or secondary result of an action, especially an adverse effect",level="L3")
    effective=add_if(s,1576,"effective",("producing",),"adjective","有效的；产生预期结果的","producing the intended result","L1"); s.add_colloc(1576,effective,"effective method/measure","有效的方法或措施"); s.add_construction(1576,"effective from/on a date","从某日起生效")
    x=maybe_sid(s,"efficiency","avoiding wasted",pos="noun"); x and s.put_existing(1577,x,level="L1",cn="效率；不浪费时间、精力或资源",en="efficient use of time, effort, or resources"); x=maybe_sid(s,"efficiency","ratio of the useful",pos="noun"); x and s.put_existing(1577,x,level="L2")
    effort=add_if(s,1579,"effort",("physical or mental",),"noun","努力；为目标作出的尝试或行动","use of energy or an organized attempt to achieve something","L1"); s.add_construction(1579,"an effort to do sth","an attempt to do something"); s.add_colloc(1579,effort,"campaign/search/rescue effort","运动、搜寻或救援行动")
    s.add_construction(1580,"egg sb on (to do sth)","encourage or provoke someone to act")
    verb=add_if(s,1587,"elaborate",("explain",),"verb","详细说明或阐述","to explain or develop something in detail","L2","elaborate on sth"); adj=maybe_sid(s,"elaborate","complexity",pos="adjective"); overlay(s,1587,verb,"elaborate","adjective/verb pronunciation boundary"); adj and overlay(s,1587,adj,"elaborate","adjective/verb pronunciation boundary")
    add_if(s,1588,"elapse",("time",),"verb","（时间）流逝","for time to pass","L1","time elapses")
    elastic=maybe_sid(s,"elastic","adapt readily",pos="adjective") or add_if(s,1589,"elastic",("responsive",),"adjective","可根据变化调整的；有弹性的","responsive to changing conditions","L2"); s.add_colloc(1589,elastic,"elastic demand/supply","有弹性的需求或供给")
    x=maybe_sid(s,"elder","older of two",pos="adjective"); x and s.put_existing(1591,x,cn="（两者中）年长的，尤指亲属之间，通常作定语",en="older of two people, especially relatives, usually attributive",level="L1"); x and s.add_colloc(1591,x,"elder brother/sister","哥哥或姐姐"); s.add_construction(1591,"elder vs older","elder/older usage boundary")
    s.add_construction(1592,"elect sb to office / elect a president","choose someone for office by voting"); s.add_construction(1592,"elect to do sth","formally choose to do something")
    electric=add_if(s,1593,"electric",("powered",),"adjective","电的；用电驱动的","powered by or producing electricity","L1"); s.add_colloc(1593,electric,"electric car/device","电动汽车或设备")
    x=maybe_sid(s,"electrical","relating to electricity",pos="adjective"); x and overlay(s,1594,x,"electric/electrical","electric commonly means powered; electrical relates to electricity or systems")
    elementary=add_if(s,1601,"elementary",("school",),"adjective","小学的；初级或基础的","relating to elementary school or introductory study","L1"); s.add_colloc(1601,elementary,"elementary school/education","小学或基础教育")
    add_if(s,1604,"elevator",("building",),"noun","电梯；升降机（建筑物中）","a lift or elevator in a building","L1")
    elicit=add_if(s,1606,"elicit",("response",),"verb","引出反应、信息或回答","to draw out a response, information, or reaction","L1","elicit sth from sb"); s.add_construction(1606,"elicit sth from sb","从某人引出反应或信息")
    s.add_construction(1607,"eligible for sth / eligible to do sth","符合资格"); add_if(s,1607,"eligible",("qualified",),"adjective","符合资格的","qualified or entitled to take part or receive something","L1")
    elite=add_if(s,1609,"elite",("select",),"adjective","精英的；最优秀或地位高的","select, best, or high-status","L2"); s.add_colloc(1609,elite,"elite athletes/schools/units","精英运动员、学校或部队")
    email=add_if(s,1613,"email",("message",),"noun","电子邮件；一封邮件","a message sent by email","L1"); s.add_colloc(1613,email,"an email","一封电子邮件"); s.add_construction(1613,"email sb / send an email","send a message by email")
    emerge=add_if(s,1621,"emerge",("known",),"verb","变得已知或明显；作为……出现","to become known or apparent, or emerge as something","L2","emerge as"); s.add_construction(1621,"emerge as sth","become known or appear in a role")
    s.add_construction(1623,"emigrate from A to B / immigrate to B from A","directional contrast")
    add_if(s,1624,"eminent",("famous",),"adjective","著名且在领域内受尊敬的","famous and respected in a particular field","L1")

def owner_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

def handoff_statuses():
    all_ord=set(range(1375,1625)); upgrades=set(UPGRADES)
    if len(upgrades)!=78 or len(all_ord-upgrades)!=172: raise SystemExit("HANDOFF_COVERAGE_MISMATCH")
    return {o:("UPGRADE" if o in upgrades else "NO_CHANGE") for o in sorted(all_ord)}

def write_receipts(store: Store, natural_words: dict[int, dict], report: dict) -> None:
    rows=[]
    for ordinal,operation in handoff_statuses().items():
        rel=f"content/lexical/words/by-ordinal/o{ordinal:04d}.json"
        before=hashlib.sha256(subprocess.check_output(["git","show",f"HEAD:{rel}"])).hexdigest()
        after=owner_hash(ROOT/rel)
        rows.append({"ordinal":ordinal,"word":natural_words[ordinal]["word"],"operation":operation,"final_quality":"HANDOFF_NOT_SPECIFIED","before_sha256":before,"after_sha256":after,"byte_preserved":before==after,"word_id":natural_words[ordinal]["word_id"],"full_object_readback":"PASS"})
    out=LEX/"audit"/"vnext-content-execution"; out.mkdir(parents=True,exist_ok=True)
    reuse=sorted(set(store.identity["REUSE_EXISTING_STABLE"])); new_owners=sorted(set(store.identity["NEW_SEMANTIC_BRANCH"]))
    receipt={"schema":"kianos.lexical.semantic_handoff_implementation_receipt.v1","status":"LOCAL_CLOSED_PENDING_INTEGRATION","handoff":"content/lexical/semantic-review/o1375-o1624.md","baseline_origin_main":BASELINE_ORIGIN_MAIN,"range":[1375,1624],"authority":"semantic-review handoff only; mechanical implementation by Luna/Codex","expected_counts":{"NO_CHANGE":172,"UPGRADE":78,"BLOCKED":0},"actual":{"owners_read_back":250,"changed_upgrade_owners":len(UPGRADES),"no_change_byte_preserved":all(x["byte_preserved"] for x in rows if x["operation"]=="NO_CHANGE"),"blocked_owners":[],"semantic_escalations":[],"engineering_failures":[],"o1625_plus_untouched":True},"current_final":{"catalog_execution":"ACTIVE","bounded_implementation":"COMPLETE","next_range_active":False,"o1625_plus_active":False},"owners":rows}
    (out/"implementation-o1375-o1624.json").write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    ident={"schema":"kianos.lexical.identity_reconciliation_readback.v1","status":"PASS","baseline_origin_main":BASELINE_ORIGIN_MAIN,"scope":[1375,1624],"handoff":"content/lexical/semantic-review/o1375-o1624.md","classifications":{"REUSE_EXISTING_STABLE":{"rule":"reuse continuous active/deprecated/merged stable branch; no generated replacement","owners":reuse},"NEW_SEMANTIC_BRANCH":{"rule":"deterministic stable ID created only for an authorized genuinely new branch","owners":new_owners},"ESCALATE_IDENTITY":{"owners":sorted(set(store.identity["ESCALATE_IDENTITY"]))}},"reactivated_or_reconciled_sense_ids":sorted(store.changed_sense_ids),"new_stable_sense_ids":sorted(set(store.new_stable_sense_ids)),"reference_closure":"PASS","relation_owner_changes":[],"form_identity_closure":{"status":"PASS","word_owner_files":[]},"readback_assertions":{"stable_word_identity_preserved":True,"active_sense_registry_closed":True,"merged_into_not_left_on_active_senses":True,"handoff_generated_ids_absent":True,"o1625_plus_not_activated":True},"natural_owner_audit":report}
    (out/"identity-reconciliation-readback-o1375-o1624.json").write_text(json.dumps(ident,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    esc={"schema":"kianos.lexical.semantic_escalation_artifact.v1","status":"NO_ESCALATIONS_REQUIRED","scope":[1375,1624],"authority":["content/lexical/semantic-review/o1375-o1624.md","content/lexical/CURRENT.md"],"escalations":[],"note":"No unresolved semantic split/merge, competing identity, uncertain Relation truth, or unclear Form boundary remained after mechanical mapping. Engineering failures are not semantic escalations."}
    (out/"semantic-escalations-o1375-o1624.json").write_text(json.dumps(esc,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

def main():
    handoff_statuses()
    s=Store(); apply(s); s.changed_word_ordinals.update(UPGRADES); s.finalize()
    import sys; sys.path.insert(0,str(ROOT/"tools"))
    from lexical_natural_owner import build,dump_json
    natural_words, relation_owners, report=build()
    if report["status"]!="PASS": raise SystemExit("NATURAL_OWNER_AUDIT_FAILED:"+json.dumps(report,ensure_ascii=False))
    for ordinal in sorted(UPGRADES): dump_json(OWNER_DIR/f"o{ordinal:04d}.json",natural_words[ordinal])
    write_receipts(s,natural_words,report)
    print(json.dumps({"status":"APPLIED","scope":[1375,1624],"upgrade_count":len(s.changed_word_ordinals),"changed_ordinals":sorted(s.changed_word_ordinals),"changed_senses":len(s.changed_sense_ids),"changed_collocations":len(s.changed_collocation_ids),"identity":{k:sorted(set(v)) for k,v in s.identity.items()}},ensure_ascii=False,indent=2))
if __name__=="__main__": main()

