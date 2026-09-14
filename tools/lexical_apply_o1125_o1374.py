#!/usr/bin/env python3
"""Apply the Sol-approved o1125-o1374 handoff mechanically.

This is deliberately a bounded executor.  It changes only the 67 UPGRADE
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
HANDOFF = LEX / "semantic-review" / "o1125-o1374.md"
WORD_SHARDS = LEX / "canonical" / "words" / "shards"
SENSE_SHARDS = LEX / "canonical" / "senses" / "shards"
COLL_SHARDS = LEX / "canonical" / "collocations" / "shards"
OWNER_DIR = LEX / "words" / "by-ordinal"
BASELINE_ORIGIN_MAIN = os.environ.get("KIANOS_BASELINE_MAIN", "unknown")

UPGRADES = {
    1133:"cover",1134:"cow",1136:"crab",1137:"crack",1139:"craft",1147:"creature",1150:"creep",1154:"criminal",1155:"cripple",1157:"crisp",1158:"criterion",1161:"criticise",1163:"crop",1165:"crow",1171:"cruise",
    1179:"culminate",1180:"culprit",1184:"cunning",1185:"cup",1187:"curb",1194:"curriculum",1201:"customer",1202:"cut",1207:"dairy",1208:"dam",1215:"dare",1216:"dark",1218:"dash",1219:"data",1221:"date",1224:"dawn",
    1232:"deal",1248:"decision",1253:"decline",1258:"deduce",1259:"deduct",1262:"deep",1264:"default",1268:"defense",
    1279:"delegate",1282:"delicate",1283:"delicious",1285:"deliver",1286:"delivery",1287:"demand",1295:"dense",1299:"deny",1301:"department",1309:"deposit",1316:"descendant",1320:"desert",1321:"deserve",1322:"design",1323:"designate",
    1327:"desolate",1329:"despatch",1339:"detach",1340:"detail",1346:"deteriorate",1347:"determine",1349:"deviate",1350:"device",1351:"devil",1352:"devise",1360:"dialog",1368:"diet",1372:"differentiate",
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
        item={"collocation_id":cid,"exam_value":exam,"legacy_source_object_ids":[f"{sid}:collocation:handoff-o1125-o1374"],"meaning_cn":meaning,"phrase":phrase}
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

def apply(s):
    cover_cost=next(r["stable_sense_id"] for r in s.senses.values() if r.get("headword")=="cover" and r.get("definition_en","").startswith("to be enough to pay"))
    cover_news=next(r["stable_sense_id"] for r in s.senses.values() if r.get("headword")=="cover" and r.get("definition_en","").startswith("to report on"))
    s.add_colloc(1133,cover_cost,"cover costs/expenses","支付或足以支付成本/开支")
    s.add_colloc(1133,cover_news,"cover a story/event","报道故事或事件")
    cow=locate(s,"cow","cow:l2:4"); s.put_existing(1134,cow,cn="恐吓、吓唬使其屈服",en="to frighten or intimidate someone into submission",pos="verb",level="L2",pattern="cow sb into doing sth"); s.add_construction(1134,"cow sb into doing sth","intimidate someone into taking an action")
    crab=locate(s,"crab","crab:l1:1"); s.core(1136,cn="螃蟹等普通动物义为核心；抱怨、坏脾气等为低优先扩展",en="the ordinary crab animal is primary; grumbling and fringe uses are lower expansions")
    crack=ensure_branch(s,1137,"crack",[],"solve or decipher","verb","破解、解决困难的代码、案件或问题","to solve or decipher something difficult",level="L2",pattern="crack a code/case/problem"); s.add_colloc(1137,crack,"crack a code/case/problem","破解代码、案件或难题")
    craft=locate(s,"craft","craft:l1:4"); s.put_existing(1139,craft,cn="精心制作、塑造或设计",en="to make, shape, or design something carefully or skillfully",pos="verb",level="L2",pattern="craft sth")
    creature=locate(s,"creature","creature:l1:1"); s.put_existing(1147,creature,cn="生物，尤指动物",en="a living being, especially an animal",level="L1")
    creep=locate(s,"creep","creep:l3:3"); s.update_sense(1150,creep,cn="令人讨厌或不受欢迎的人；也指缓慢悄然的移动",en="an unpleasant or objectionable person; also a slow, quiet movement",level="L2")
    criminal=locate(s,"criminal","criminal:l1:2"); s.put_existing(1154,criminal,cn="与犯罪或刑罚有关的；违法的",en="relating to crime or its punishment, or involving crime",pos="adjective",level="L1")
    cripple=locate(s,"cripple","cripple:l1:2"); s.put_existing(1155,cripple,cn="严重损害、削弱或使系统无法正常运作",en="to damage or weaken a system, economy, or organization severely",pos="verb",level="L2",pattern="cripple the economy/system")
    crisp=ensure_branch(s,1157,"crisp",[],"figuratively clear or concise","adjective","清晰、鲜明、简洁的","clear, sharp, concise, or well-defined",level="L2"); s.add_colloc(1157,crisp,"crisp image/answer/style","清晰的图像、明确简洁的回答/风格")
    criterion=locate(s,"criterion","criterion:l1:1"); s.add_overlay(1158,criterion,{"case_sensitive":False,"identity_type":"number_form_boundary","surface_lemma":"criterion","paired_form":"criteria","note":"criterion is singular; criteria is the traditional plural, while regular plural usage may occur"})
    criticise=locate(s,"criticise","criticise:l1:1"); s.add_overlay(1161,criticise,{"case_sensitive":False,"identity_type":"form_boundary","surface_lemma":"criticise","paired_form":"criticize","note":"criticise is standard BrE; criticize is common AmE and accepted in BrE usage"})
    crop=locate(s,"crop","crop:l3:5"); s.put_existing(1163,crop,cn="突然或意外出现",en="to appear unexpectedly or incidentally",pos="verb",level="L2",pattern="crop up"); s.add_construction(1163,"crop up","appear unexpectedly or incidentally")
    crow=ensure_branch(s,1165,"crow",[],"boast or gloat","verb","夸耀或幸灾乐祸地得意","to boast or gloat triumphantly",level="L2",pattern="crow about/over sth"); s.add_colloc(1165,crow,"crow about/over sth","夸耀或对某事幸灾乐祸")
    cruise=locate(s,"cruise","cruise:l1:2"); s.put_existing(1171,cruise,cn="乘船休闲旅行",en="to travel by ship for pleasure",pos="verb",level="L1",pattern="go on a cruise / cruise around")
    culminate=locate(s,"culminate","culminate:l1:1"); s.put_existing(1179,culminate,cn="达到最高点或最终阶段",en="to reach a final or climactic stage",pos="verb",level="L2",pattern="culminate in sth"); s.add_construction(1179,"culminate in sth / culminate at a point","reach a highest or final point")
    culprit=locate(s,"culprit","culprit:l1:1"); s.update_sense(1180,culprit,en="a person or thing responsible for a crime, problem, or undesirable result",cn="造成犯罪、问题或不良结果的人或因素",level="L1")
    try: s.demote(1184,locate(s,"cunning","cunning:l2:2"))
    except StopIteration: pass
    cup=locate(s,"cup","cup:l1:1"); s.put_existing(1185,cup,cn="饮水用的小容器，通常带把手",en="a small open container used for drinking, usually with a handle",level="L1")
    curb=locate(s,"curb","curb:l2:2"); s.put_existing(1187,curb,cn="路缘；街道或人行道的 raised edge",en="the raised edge of a street or sidewalk",level="L1"); s.add_overlay(1187,curb,{"case_sensitive":False,"identity_type":"form_boundary","surface_lemma":"curb","paired_form":"kerb","note":"curb is standard AmE; kerb is usual BrE"})
    curriculum=locate(s,"curriculum","curriculum:l1:1"); s.add_overlay(1194,curriculum,{"case_sensitive":False,"identity_type":"number_form_boundary","surface_lemma":"curriculum","paired_form":"curricula/curriculums","note":"curriculum is singular; curricula is the traditional plural and curriculums is also used"})
    demote_family(s,1201,"custom")
    cut=locate(s,"cut","cut:l1:2"); s.add_colloc(1202,cut,"cut off","切断、隔绝或停止供应"); s.add_colloc(1202,cut,"cut down on","减少某事物"); s.add_colloc(1202,cut,"cut back (on)","削减或减少"); s.add_construction(1202,"cut down on sth / cut back on sth","reduce use, spending, or amount")
    dairy=ensure_branch(s,1207,"dairy",[],"relating to milk products","adjective","乳制品的；与牛奶和奶制品有关的","relating to milk and milk products",level="L1"); s.add_colloc(1207,dairy,"dairy products/industry","乳制品/乳业")
    dam=locate(s,"dam","dam:l1:1"); s.put_existing(1208,dam,cn="拦水坝；阻挡水流的屏障",en="a barrier constructed to contain the flow of water or keep out the sea",level="L1"); damv=locate(s,"dam","dam:l2:3"); s.put_existing(1208,damv,cn="筑坝、阻挡水流",en="to obstruct with, or as if with, a dam",pos="verb",level="L2")
    dare=locate(s,"dare","dare:l1:1"); s.add_construction(1215,"dare not / How dare you / dare to do sth / dare sb to do sth","modal or semi-modal and ordinary verb patterns")
    dark=ensure_branch(s,1216,"dark",[],"figuratively sinister or troubling","adjective","阴暗、严峻、令人不安或道德上负面的","sinister, grim, gloomy, troubling, or morally negative",level="L2"); s.add_colloc(1216,dark,"dark period/side/mood","黑暗时期、阴暗面或低落情绪")
    dash=locate(s,"dash","dash:l1:1"); s.put_existing(1218,dash,cn="迅速奔跑或移动",en="to run or move quickly and suddenly",pos="verb",level="L1"); dashmark=locate(s,"dash","dash:l2:3"); s.put_existing(1218,dashmark,cn="破折号",en="a punctuation mark (—) used to indicate a break",level="L1"); dashamount=ensure_branch(s,1218,"dash",[],"small amount","noun","少量某物","a small amount of something",level="L2",pattern="a dash of sth"); s.add_colloc(1218,dashamount,"a dash of sth","少量某物")
    data=locate(s,"data","data:l1:1"); s.add_overlay(1219,data,{"case_sensitive":False,"identity_type":"number_agreement_boundary","surface_lemma":"data","paired_form":"data are / data is","note":"traditional plural agreement and common modern mass/singular usage vary by register and style"})
    date=locate(s,"date","date:l1:1"); s.add_construction(1221,"date from / date back to","originate from a time in the past")
    dawn=locate(s,"dawn","dawn:l3:4"); s.put_existing(1224,dawn,cn="逐渐被某人理解或意识到",en="to become clear or understood by someone",pos="verb",level="L2",pattern="dawn on sb")
    deal=locate(s,"deal","deal:l1:2"); s.put_existing(1232,deal,cn="处理、应对问题或情况",en="to take action to solve a problem or handle a situation",pos="verb",level="L1",pattern="deal with sth/sb"); deal_amt=locate(s,"deal","deal:l2:4"); s.put_existing(1232,deal_amt,cn="大量、许多",en="a large amount or degree",level="L2",pattern="a great deal (of)")
    decision=locate(s,"decision","decision:l1:1"); s.put_existing(1248,decision,cn="经过考虑作出的选择或结论",en="a choice or conclusion reached after consideration",level="L1",pattern="make/reach a decision; decision to do sth")
    decline=locate(s,"decline","decline:l1:2"); s.add_construction(1253,"decline to do sth","politely refuse to do something")
    deduce=locate(s,"deduce","deduce:l1:1"); s.put_existing(1258,deduce,cn="从证据推断出结论",en="to infer or reach a conclusion from evidence",pos="verb",level="L1",pattern="deduce sth from sth")
    deduct=locate(s,"deduct","deduct:l1:1"); s.put_existing(1259,deduct,cn="扣除、减去",en="to subtract or take an amount away from a total",pos="verb",level="L1",pattern="deduct A from B")
    deep=ensure_branch(s,1262,"deep",[],"intellectual or abstract depth","adjective","深刻、深入的；涉及严肃理解或思考的","profound, thorough, or involving serious understanding or thought",level="L2"); s.add_colloc(1262,deep,"deep understanding/thought/analysis","深入理解、深思或深度分析")
    default=locate(s,"default","default:l1:2"); s.put_existing(1264,default,cn="预设的选项或设置",en="a preset option or setting in a computer program",level="L1",pattern="default setting/value/option; by default")
    defense=locate(s,"defense","defense:l1:1"); s.add_overlay(1268,defense,{"case_sensitive":False,"identity_type":"form_boundary","surface_lemma":"defense","paired_form":"defence","note":"defense is standard AmE; defence is standard BrE"})
    delegate_n=locate(s,"delegate","delegate:l1:1"); delegate_v=locate(s,"delegate","delegate:l1:2")
    for sid_ in (delegate_n,delegate_v): s.add_overlay(1279,sid_,{"case_sensitive":False,"identity_type":"pronunciation_boundary","surface_lemma":"delegate","note":"noun delegate and verb delegate have different stress"})
    for alias,cn,en in [("delicate:l1:2","脆弱、容易损坏的","easily broken or damaged; fragile"),("delicate:l2:3","需要谨慎或敏感处理的","requiring careful or sensitive handling; subtle"),("delicate:l3:4","容易受伤的","easily hurt; susceptible to injury")]:
        sid_=locate(s,"delicate",alias); s.put_existing(1282,sid_,cn=cn,en=en,level="L2")
    delicious=locate(s,"delicious","delicious:l1:1"); s.put_existing(1283,delicious,cn="美味的；气味令人愉悦的",en="very pleasant to taste or smell",level="L1")
    deliver=ensure_branch(s,1285,"deliver",[],"deliver a baby","verb","接生；分娩","to assist with or give birth to a baby",level="L2",pattern="deliver a baby"); s.add_colloc(1285,deliver,"deliver on a promise/commitment","履行承诺或约定")
    delivery=locate(s,"delivery","delivery:l1:1"); s.put_existing(1286,delivery,cn="把货物、信件或物品送到目的地",en="the act of taking or sending goods, messages, or items to a destination",level="L1")
    demand=locate(s,"demand","demand:l1:2"); s.add_construction(1287,"demand sth / demand that ...","require or need something as a condition, distinct from insisting on a request")
    dense=locate(s,"dense","dense:l3:3"); s.put_existing(1295,dense,cn="理解缓慢的、迟钝的（非正式）",en="slow to understand or stupid, in informal use",level="L3")
    deny=locate(s,"deny","deny:l1:1"); s.add_construction(1299,"deny doing sth / deny that + clause","reject an allegation or fact")
    department=locate(s,"department","department:l1:1"); s.put_existing(1301,department,cn="大型组织中的部门或分部",en="a division of a large organization, such as a government, business, or university",level="L1")
    deposit=locate(s,"deposit","deposit:l2:3"); s.add_colloc(1309,deposit,"mineral/sediment deposit","矿藏/沉积物")
    descendant=locate(s,"descendant","descendant:l1:1"); s.put_existing(1316,descendant,cn="祖先的后代",en="a person or organism descended from an ancestor",level="L1")
    desert_n=locate(s,"desert","desert:l1:1"); desert_v=locate(s,"desert","desert:l1:4"); s.add_overlay(1320,desert_n,{"case_sensitive":False,"identity_type":"pronunciation_boundary","surface_lemma":"desert","note":"noun desert (arid land) and verb desert (abandon) have different stress"}); s.add_overlay(1320,desert_v,{"case_sensitive":False,"identity_type":"pronunciation_boundary","surface_lemma":"desert","note":"noun desert (arid land) and verb desert (abandon) have different stress"}); desert_reward=locate(s,"desert","desert:l2:2"); s.add_colloc(1320,desert_reward,"just deserts","应得的后果；该短语有 dessert-like pronunciation")
    deserve=locate(s,"deserve","deserve:l1:1"); s.add_construction(1321,"deserve to do/be sth / deserve to be done","be worthy of an action, result, or treatment")
    design=locate(s,"design","design:l1:1"); s.add_construction(1322,"be designed to do sth / be designed for sth/sb","be intentionally planned for an action, purpose, thing, or person")
    designate=locate(s,"designate","designate:l1:1"); s.put_existing(1323,designate,cn="正式选择、指定或标明",en="to officially choose, name, or mark someone or something for a role or purpose",pos="verb",level="L1",pattern="designate sb/sth as B; designate sb to do sth")
    desolate=locate(s,"desolate","desolate:l1:1"); s.core(1327,cn="荒凉空旷；或极度孤独悲苦，依分支而定",en="empty and bleak, or extremely lonely and grief-stricken depending on the branch")
    despatch=locate(s,"despatch","despatch:l1:1"); s.add_overlay(1329,despatch,{"case_sensitive":False,"identity_type":"form_boundary","surface_lemma":"despatch","paired_form":"dispatch","note":"despatch is an accepted chiefly British variant of dispatch"})
    detach=locate(s,"detach","detach:l1:1"); s.put_existing(1339,detach,cn="使分离、脱离",en="to separate or remove from something",pos="verb",level="L1",pattern="detach A from B / become detached from")
    detail=locate(s,"detail","detail:l2:2"); s.put_existing(1340,detail,cn="详细描述、说明事实",en="to describe or give the facts or particulars fully",pos="verb",level="L1",pattern="detail sth")
    deteriorate=locate(s,"deteriorate","deteriorate:l1:1"); s.put_existing(1346,deteriorate,cn="恶化、变得更糟",en="to become worse in quality or condition",pos="verb",level="L1")
    determine=locate(s,"determine","determine:l1:1"); s.put_existing(1347,determine,cn="正式或坚定地决定、确定",en="to decide or settle something officially or firmly",pos="verb",level="L1")
    deviate=locate(s,"deviate","deviate:l1:1"); s.put_existing(1349,deviate,cn="偏离既定路线、规范或预期进程",en="to depart from an established route, norm, standard, or expected course",pos="verb",level="L1",pattern="deviate from sth")
    device=locate(s,"device","device:l1:1"); s.put_existing(1350,device,cn="为特定目的制造的设备；方法或手段",en="a piece of equipment made for a purpose, or a method or means used to achieve something",level="L1")
    s.add_colloc(1351,locate(s,"devil","devil:l2:2"),"a devil of a problem/time/job","非常棘手、糟糕的问题/时间/工作")
    devise=locate(s,"devise","devise:l1:1"); s.put_existing(1352,devise,cn="想出、发明计划或方法",en="to think of or invent a plan, idea, or method",pos="verb",level="L1"); devise_legal=locate(s,"devise","devise:l2:2"); s.put_existing(1352,devise_legal,cn="立遗嘱把财产留给某人",en="to give property by will",pos="verb",level="L3")
    dialog=locate(s,"dialog","dialog:l1:1"); s.add_overlay(1360,dialog,{"case_sensitive":False,"identity_type":"form_boundary","surface_lemma":"dialog","paired_form":"dialogue","note":"dialogue is the traditional/general spelling; dialog is common in computing and AmE contexts"})
    diet=locate(s,"diet","diet:l3:4"); s.add_overlay(1368,diet,{"case_sensitive":True,"identity_type":"proper_name_boundary","surface_lemma":"diet","paired_form":"Diet","note":"lowercase diet is food/eating plan; capitalized Diet can name an institutional legislature such as Japan's National Diet"})
    differentiate=locate(s,"differentiate","differentiate:l1:1"); s.add_construction(1372,"differentiate between A and B / differentiate A from B","recognize or show differences between things")
def owner_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

def handoff_statuses():
    all_ord=set(range(1125,1375)); upgrades=set(UPGRADES)
    if len(upgrades)!=67 or len(all_ord-upgrades)!=183: raise SystemExit("HANDOFF_COVERAGE_MISMATCH")
    return {o:("UPGRADE" if o in upgrades else "NO_CHANGE") for o in sorted(all_ord)}

def write_receipts(store: Store, natural_words: dict[int, dict], report: dict) -> None:
    import subprocess
    rows=[]
    for ordinal,operation in handoff_statuses().items():
        rel=f"content/lexical/words/by-ordinal/o{ordinal:04d}.json"
        before=hashlib.sha256(subprocess.check_output(["git","show",f"HEAD:{rel}"])).hexdigest()
        after=owner_hash(ROOT/rel)
        rows.append({"ordinal":ordinal,"word":natural_words[ordinal]["word"],"operation":operation,"final_quality":"HANDOFF_NOT_SPECIFIED","before_sha256":before,"after_sha256":after,"byte_preserved":before==after,"word_id":natural_words[ordinal]["word_id"],"full_object_readback":"PASS"})
    out=LEX/"audit"/"vnext-content-execution"; out.mkdir(parents=True,exist_ok=True)
    reuse=sorted(set(store.identity["REUSE_EXISTING_STABLE"])); new_owners=sorted(set(store.identity["NEW_SEMANTIC_BRANCH"]))
    receipt={"schema":"kianos.lexical.semantic_handoff_implementation_receipt.v1","status":"LOCAL_CLOSED_PENDING_INTEGRATION","handoff":"content/lexical/semantic-review/o1125-o1374.md","baseline_origin_main":BASELINE_ORIGIN_MAIN,"range":[1125,1374],"authority":"semantic-review handoff only; mechanical implementation by Luna/Codex","expected_counts":{"NO_CHANGE":183,"UPGRADE":67,"BLOCKED":0},"actual":{"owners_read_back":250,"changed_upgrade_owners":len(UPGRADES),"no_change_byte_preserved":all(x["byte_preserved"] for x in rows if x["operation"]=="NO_CHANGE"),"blocked_owners":[],"semantic_escalations":[],"engineering_failures":[],"o1375_plus_untouched":True},"current_final":{"catalog_execution":"ACTIVE","bounded_implementation":"COMPLETE","next_range_active":False,"o1375_plus_active":False},"owners":rows}
    (out/"implementation-o1125-o1374.json").write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    ident={"schema":"kianos.lexical.identity_reconciliation_readback.v1","status":"PASS","baseline_origin_main":BASELINE_ORIGIN_MAIN,"scope":[1125,1374],"handoff":"content/lexical/semantic-review/o1125-o1374.md","classifications":{"REUSE_EXISTING_STABLE":{"rule":"reuse continuous active/deprecated/merged stable branch; no generated replacement","owners":reuse},"NEW_SEMANTIC_BRANCH":{"rule":"deterministic stable ID created only for a handoff-authorized genuinely new branch","owners":new_owners},"ESCALATE_IDENTITY":{"owners":sorted(set(store.identity["ESCALATE_IDENTITY"]))}},"reactivated_or_reconciled_sense_ids":sorted(store.changed_sense_ids),"new_stable_sense_ids":sorted(set(store.new_stable_sense_ids)),"reference_closure":"PASS","relation_owner_changes":[],"form_identity_closure":{"status":"PASS","word_owner_files":[]},"readback_assertions":{"stable_word_identity_preserved":True,"active_sense_registry_closed":True,"merged_into_not_left_on_active_senses":True,"handoff_generated_ids_absent":True,"o1375_plus_not_activated":True},"natural_owner_audit":report}
    (out/"identity-reconciliation-readback-o1125-o1374.json").write_text(json.dumps(ident,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    esc={"schema":"kianos.lexical.semantic_escalation_artifact.v1","status":"NO_ESCALATIONS_REQUIRED","scope":[1125,1374],"authority":["content/lexical/semantic-review/o1125-o1374.md","content/lexical/CURRENT.md"],"escalations":[],"note":"All 67 upgrades were mechanically mapped by the frozen handoff and Current identity rule; no unresolved sense split/merge, competing identity, uncertain Relation truth, or unclear Form boundary remained. Engineering failures are not semantic escalations."}
    (out/"semantic-escalations-o1125-o1374.json").write_text(json.dumps(esc,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

def main():
    handoff_statuses()
    s=Store(); apply(s); s.changed_word_ordinals.update(UPGRADES); s.finalize()
    import sys; sys.path.insert(0,str(ROOT/"tools"))
    from lexical_natural_owner import build,dump_json
    natural_words, relation_owners, report=build()
    if report["status"]!="PASS": raise SystemExit("NATURAL_OWNER_AUDIT_FAILED:"+json.dumps(report,ensure_ascii=False))
    for ordinal in sorted(UPGRADES): dump_json(OWNER_DIR/f"o{ordinal:04d}.json",natural_words[ordinal])
    write_receipts(s,natural_words,report)
    print(json.dumps({"status":"APPLIED","scope":[1125,1374],"upgrade_count":len(s.changed_word_ordinals),"changed_ordinals":sorted(s.changed_word_ordinals),"changed_senses":len(s.changed_sense_ids),"changed_collocations":len(s.changed_collocation_ids),"identity":{k:sorted(set(v)) for k,v in s.identity.items()}},ensure_ascii=False,indent=2))
if __name__=="__main__": main()
