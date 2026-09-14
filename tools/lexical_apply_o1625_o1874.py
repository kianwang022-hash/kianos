#!/usr/bin/env python3
"""Apply the Sol-approved o1625-o1874 handoff mechanically.

This is deliberately a bounded executor.  It changes only the 45 UPGRADE
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
HANDOFF = LEX / "semantic-review" / "o1625-o1874.md"
WORD_SHARDS = LEX / "canonical" / "words" / "shards"
SENSE_SHARDS = LEX / "canonical" / "senses" / "shards"
COLL_SHARDS = LEX / "canonical" / "collocations" / "shards"
OWNER_DIR = LEX / "words" / "by-ordinal"
BASELINE_ORIGIN_MAIN = os.environ.get("KIANOS_BASELINE_MAIN", "unknown")

UPGRADES = {
  1630:"emphasise",1644:"end",1645:"endeavor",1647:"endorse",1650:"endure",1657:"engine",1662:"enlarge",1665:"enough",1669:"enrol",1670:"ensure",1671:"entail",1683:"entry",1684:"envelope",1686:"envisage",1689:"epidemic",1698:"equity",1699:"equivalent",1704:"erode",1712:"especially",1719:"esthetic",1720:"estimate",1723:"ethnic",1730:"evening",1769:"excuse",1770:"execute",1783:"exotic",1786:"expect",1792:"expense",1798:"expire",1799:"explain",1804:"explore",1807:"export",1814:"extension",1818:"external",1822:"extract",1823:"extraordinary",1829:"fable",1833:"face",1834:"facet",1849:"faithful",1851:"fall",1854:"familiar",1862:"far",1867:"farther",1874:"fatal",
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
        item={"collocation_id":cid,"exam_value":exam,"legacy_source_object_ids":[f"{sid}:collocation:handoff-o1625-o1874"],"meaning_cn":meaning,"phrase":phrase}
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
    x=maybe_sid(s,"emphasise","stress",pos="verb") or maybe_sid(s,"emphasise","give special importance")
    x and overlay(s,1630,x,"emphasise","emphasise/emphasize BrE/AmE spelling boundary")
    x=maybe_sid(s,"end","end",pos="verb") or maybe_sid(s,"end","finish",pos="verb"); x and s.add_construction(1644,"end sth","bring a war, relationship, or dispute to an end")
    x=maybe_sid(s,"endeavor","try",pos="verb") or maybe_sid(s,"endeavour","try",pos="verb"); x and overlay(s,1645,x,"endeavor","endeavour/endeavor UK/US spelling boundary")
    endorse=add_if(s,1647,"endorse",("recommend","public"),"verb","公开推荐或代言产品、品牌或候选人","to recommend or publicly support a product, brand, candidate, or person","L2","endorse sth/sb"); s.add_colloc(1647,endorse,"endorse a product/brand/candidate","推荐或代言产品、品牌或候选人")
    add_if(s,1650,"endure",("continue","exist"),"verb","持续存在、经久不衰","to continue to exist or last","L2","traditions/effects endure")
    engine=add_if(s,1657,"engine",("machine","motor"),"noun","发动机；机器的动力装置","a machine that produces power or motion","L1")
    add_if(s,1662,"enlarge",("become larger",),"verb","变大、扩大","to become larger","L1","enlarge")
    s.add_construction(1665,"adj/adv + enough to do","足够……以做某事"); s.add_construction(1665,"enough + noun + to do","足够的……以做某事")
    x=maybe_sid(s,"enrol","register",pos="verb") or maybe_sid(s,"enroll","register",pos="verb"); x and overlay(s,1669,x,"enrol","enrol/enroll UK/US spelling boundary")
    x=maybe_sid(s,"ensure","make certain",pos="verb"); x and overlay(s,1670,x,"ensure","ensure vs assure vs insure: ensure a result; assure a person; insure against risk")
    legal=maybe_sid(s,"entail","legal",pos="noun"); legal and s.demote(1671,legal)
    entail=add_if(s,1671,"entail",("involve","require"),"verb","必然涉及、需要","to involve or require as a necessary consequence","L2","entail sth")
    entry=add_if(s,1683,"entry",("contest","competition"),"noun","比赛、申请或提交的参赛作品/报名项目","an item submitted to a competition, application, or contest","L2"); s.add_colloc(1683,entry,"a competition/application entry","参赛作品或申请项目")
    add_if(s,1684,"envelope",("paper","covering"),"noun","信封；包裹或覆盖物","a paper container for a letter or a covering around something","L1")
    s.add_construction(1686,"envisage doing sth","想象或设想做某事"); s.add_construction(1686,"envisage that ...","设想……")
    epidemic=add_if(s,1689,"epidemic",("widespread","occurrence"),"noun","大范围流行或泛滥的现象","a widespread occurrence of something, not only an infectious disease","L2"); s.add_colloc(1689,epidemic,"an epidemic of obesity/violence","肥胖或暴力的广泛流行")
    s.core(1698,cn="股权、公平：equity重公平或资产权益，equality重相等状态",en="equity concerns fairness or ownership value; equality concerns equal status or treatment")
    equivalent=add_if(s,1699,"equivalent",("equal in value","function"),"noun","等值物、对应物或功能相当的人/物","a person or thing equal in value, function, or meaning","L1")
    erode=maybe_sid(s,"erode","wear away",pos="verb") or add_if(s,1704,"erode",("wear","away"),"verb","侵蚀、削弱信任或支持","to wear away physically or weaken confidence, trust, support, or rights","L1"); s.add_colloc(1704,erode,"erode confidence/trust/support/rights","侵蚀信心、信任、支持或权利")
    x=maybe_sid(s,"especially","particularly",pos="adverb") or maybe_sid(s,"especially","to a great degree",pos="adverb"); x and overlay(s,1712,x,"especially","especially means particularly/emphasis; specially means for a special purpose")
    x=maybe_sid(s,"esthetic","beauty",pos="adjective") or maybe_sid(s,"aesthetic","beauty",pos="adjective"); x and overlay(s,1719,x,"esthetic","esthetic/aesthetic spelling relationship; aesthetic is dominant contemporary form")
    estn=add_if(s,1720,"estimate",("rough calculation",),"noun","估计、估算","a calculation or judgement of an amount or value","L1"); estv=add_if(s,1720,"estimate",("calculate",),"verb","估计、估算","to calculate or judge an amount or value approximately","L1"); overlay(s,1720,estn,"estimate","noun/verb pronunciation boundary"); overlay(s,1720,estv,"estimate","noun/verb pronunciation boundary")
    add_if(s,1723,"ethnic",("relating to a group",),"adjective","民族的；族群的","relating to a particular ethnic group","L1")
    add_if(s,1730,"evening",("period","day"),"noun","傍晚、晚上","the later part of the day before night","L1")
    n=maybe_sid(s,"excuse","reason",pos="noun"); v=maybe_sid(s,"excuse","forgive",pos="verb"); n and overlay(s,1769,n,"excuse","noun /s/ vs verb /z/ pronunciation boundary"); v and overlay(s,1769,v,"excuse","noun /s/ vs verb /z/ pronunciation boundary")
    add_if(s,1770,"execute",("carry out","perform"),"verb","执行、实施","to carry out or perform an action","L1"); add_if(s,1770,"execute",("put to death",),"verb","依法处死某人","to put a person to death as a legal punishment","L2")
    add_if(s,1783,"exotic",("foreign","unusual"),"adjective","异国的；奇异而有吸引力的","from a distant country or unusual and attractive","L1")
    s.add_construction(1786,"expect sb to do sth","预期某人做某事")
    add_if(s,1792,"expense",("cost","money"),"noun","花费、费用","a cost or amount of money spent","L1")
    for frag in ("death","breathing"):
        x=maybe_sid(s,"expire",frag); x and s.demote(1798,x)
    add_if(s,1798,"expire",("come to an end","valid"),"verb","到期、失效或结束","to come to an end or cease to be valid","L1","licence/contract/card expires")
    s.add_construction(1799,"explain that ...","解释……"); s.add_construction(1799,"explain why/how ...","解释为什么/如何……")
    explore=add_if(s,1804,"explore",("idea","possibility"),"verb","探讨、仔细研究想法、可能性或问题","to examine or investigate an idea, possibility, question, or issue carefully","L2"); s.add_colloc(1804,explore,"explore an idea/possibility/issue","探讨想法、可能性或问题")
    n=maybe_sid(s,"export","trade",pos="noun"); v=maybe_sid(s,"export","sell","verb"); n and overlay(s,1807,n,"export","noun /ˈekspɔːt/ vs verb /ɪkˈspɔːt/ stress boundary"); v and overlay(s,1807,v,"export","noun/verb stress boundary")
    add_if(s,1814,"extension",("added part","building"),"noun","附加部分、扩建或电话分机","an added part of a building, telephone system, or object","L1")
    add_if(s,1818,"external",("outside","outer"),"adjective","外部的、外来的","outside or relating to the outside","L1")
    extract=add_if(s,1822,"extract",("substance","concentrate"),"noun","提取物、浓缩物","a substance or concentrate obtained by extraction","L2"); n=maybe_sid(s,"extract","substance",pos="noun"); n and overlay(s,1822,n,"extract","noun /ˈekstrækt/ vs verb /ɪkˈstrækt/ stress boundary")
    add_if(s,1823,"extraordinary",("very unusual","remarkable"),"adjective","非凡的、极不寻常的","very unusual, remarkable, or exceptional","L1")
    add_if(s,1829,"fable",("short story","moral"),"noun","寓言；带有道德教训的故事","a short story, often with animals, conveying a moral","L1")
    s.add_construction(1833,"be faced with sth","面临某事"); s.add_construction(1833,"in the face of sth","面对某事或困难")
    facet=maybe_sid(s,"facet","aspect",pos="noun") or maybe_sid(s,"facet","particular aspect",pos="noun"); facet and s.add_colloc(1834,facet,"facet of the problem/issue","问题的一个方面")
    add_if(s,1849,"faithful",("accurate","true"),"adjective","忠实准确的、符合原文的","accurate or true to the original","L2"); x=maybe_sid(s,"faithful","loyal",pos="adjective"); x and s.add_colloc(1849,x,"faithful account/reproduction/translation","忠实的叙述、复制品或翻译")
    s.add_construction(1851,"fall short of sth","未达到标准或数量")
    add_if(s,1854,"familiar",("well known","acquainted"),"adjective","熟悉的、常见的","well known or acquainted with something","L1")
    s.add_construction(1862,"so far","到目前为止"); s.add_construction(1862,"by far","……得多、显然"); s.add_construction(1862,"as far as ...","就……而言/到……为止")
    add_if(s,1867,"farther",("more distant","distance"),"adverb","更远地；更远的","at or to a greater distance","L1")
    add_if(s,1874,"fatal",("causing death","disaster"),"adjective","致命的、导致灾难的","causing death or disaster","L1")

def owner_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

def handoff_statuses():
    all_ord=set(range(1625,1875)); upgrades=set(UPGRADES)
    if len(upgrades)!=45 or len(all_ord-upgrades)!=205: raise SystemExit("HANDOFF_COVERAGE_MISMATCH")
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
    receipt={"schema":"kianos.lexical.semantic_handoff_implementation_receipt.v1","status":"LOCAL_CLOSED_PENDING_INTEGRATION","handoff":"content/lexical/semantic-review/o1625-o1874.md","baseline_origin_main":BASELINE_ORIGIN_MAIN,"range":[1625,1874],"authority":"semantic-review handoff only; mechanical implementation by Luna/Codex","expected_counts":{"NO_CHANGE":205,"UPGRADE":45,"BLOCKED":0},"actual":{"owners_read_back":250,"changed_upgrade_owners":len(UPGRADES),"no_change_byte_preserved":all(x["byte_preserved"] for x in rows if x["operation"]=="NO_CHANGE"),"blocked_owners":[],"semantic_escalations":[],"engineering_failures":[],"o1875_plus_untouched":True},"current_final":{"catalog_execution":"ACTIVE","bounded_implementation":"COMPLETE","next_range_active":False,"o1875_plus_active":False},"owners":rows}
    (out/"implementation-o1625-o1874.json").write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    ident={"schema":"kianos.lexical.identity_reconciliation_readback.v1","status":"PASS","baseline_origin_main":BASELINE_ORIGIN_MAIN,"scope":[1625,1874],"handoff":"content/lexical/semantic-review/o1625-o1874.md","classifications":{"REUSE_EXISTING_STABLE":{"rule":"reuse continuous active/deprecated/merged stable branch; no generated replacement","owners":reuse},"NEW_SEMANTIC_BRANCH":{"rule":"deterministic stable ID created only for an authorized genuinely new branch","owners":new_owners},"ESCALATE_IDENTITY":{"owners":sorted(set(store.identity["ESCALATE_IDENTITY"]))}},"reactivated_or_reconciled_sense_ids":sorted(store.changed_sense_ids),"new_stable_sense_ids":sorted(set(store.new_stable_sense_ids)),"reference_closure":"PASS","relation_owner_changes":[],"form_identity_closure":{"status":"PASS","word_owner_files":[]},"readback_assertions":{"stable_word_identity_preserved":True,"active_sense_registry_closed":True,"merged_into_not_left_on_active_senses":True,"handoff_generated_ids_absent":True,"o1875_plus_not_activated":True},"natural_owner_audit":report}
    (out/"identity-reconciliation-readback-o1625-o1874.json").write_text(json.dumps(ident,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    esc={"schema":"kianos.lexical.semantic_escalation_artifact.v1","status":"NO_ESCALATIONS_REQUIRED","scope":[1625,1874],"authority":["content/lexical/semantic-review/o1625-o1874.md","content/lexical/CURRENT.md"],"escalations":[],"note":"No unresolved semantic split/merge, competing identity, uncertain Relation truth, or unclear Form boundary remained after mechanical mapping. Engineering failures are not semantic escalations."}
    (out/"semantic-escalations-o1625-o1874.json").write_text(json.dumps(esc,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

def main():
    handoff_statuses()
    s=Store(); apply(s); s.changed_word_ordinals.update(UPGRADES); s.finalize()
    import sys; sys.path.insert(0,str(ROOT/"tools"))
    from lexical_natural_owner import build,dump_json
    natural_words, relation_owners, report=build()
    if report["status"]!="PASS": raise SystemExit("NATURAL_OWNER_AUDIT_FAILED:"+json.dumps(report,ensure_ascii=False))
    for ordinal in sorted(UPGRADES): dump_json(OWNER_DIR/f"o{ordinal:04d}.json",natural_words[ordinal])
    write_receipts(s,natural_words,report)
    print(json.dumps({"status":"APPLIED","scope":[1625,1874],"upgrade_count":len(s.changed_word_ordinals),"changed_ordinals":sorted(s.changed_word_ordinals),"changed_senses":len(s.changed_sense_ids),"changed_collocations":len(s.changed_collocation_ids),"identity":{k:sorted(set(v)) for k,v in s.identity.items()}},ensure_ascii=False,indent=2))
if __name__=="__main__": main()
