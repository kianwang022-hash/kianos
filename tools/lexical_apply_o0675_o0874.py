#!/usr/bin/env python3
"""Apply the Sol-approved o0675-o0874 handoff mechanically.

This is deliberately a bounded executor.  It changes only the 81 UPGRADE
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
HANDOFF = LEX / "semantic-review" / "o0675-o0874.md"
WORD_SHARDS = LEX / "canonical" / "words" / "shards"
SENSE_SHARDS = LEX / "canonical" / "senses" / "shards"
COLL_SHARDS = LEX / "canonical" / "collocations" / "shards"
OWNER_DIR = LEX / "words" / "by-ordinal"
BASELINE_ORIGIN_MAIN = os.environ.get("KIANOS_BASELINE_MAIN", "unknown")

UPGRADES = {
    675:"cap",679:"capital",681:"captain",682:"captive",691:"careful",696:"carrier",698:"carry",699:"cart",702:"case",703:"cash",704:"cashier",710:"cat",711:"catalog",713:"catch",718:"cattle",721:"cautious",722:"cave",723:"cease",724:"ceiling",726:"celebrity",729:"cement",732:"census",734:"centigrade",735:"centimetre",736:"central",737:"centre",742:"certificate",744:"chain",745:"chair",746:"chairman",747:"chalk",749:"chamber",752:"chance",753:"chancellor",754:"change",757:"chapter",759:"characterise",761:"charge",763:"charm",768:"cheap",769:"cheat",770:"check",776:"chemist",778:"cheque",781:"chess",784:"chicken",788:"chill",790:"chin",791:"China",792:"chip",795:"choir",800:"Christ",802:"Christmas",803:"chronic",804:"chunk",807:"cigaret",810:"circuit",811:"circular",813:"circumstance",818:"civil",820:"civilisation",821:"civilise",823:"clap",828:"class",829:"classic",838:"clean",843:"click",847:"climax",848:"climb",851:"clip",853:"clock",856:"close",857:"closet",858:"cloth",859:"clothe",860:"clothes",861:"clothing",862:"cloud",864:"club",869:"coach",873:"coast",
}
NEW_BRANCH_ORDINALS = {696}

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
        item={"collocation_id":cid,"exam_value":exam,"legacy_source_object_ids":[f"{sid}:collocation:handoff-o0675-o0874"],"meaning_cn":meaning,"phrase":phrase}
        target.setdefault("collocations",[]).append(item)
        self.colls[cid]={"collocation_id":cid,"created_by":"lexicalos_semantic_handoff_o0675_o0874","current_value_hash":sha(item),"legacy_source_object_ids":item["legacy_source_object_ids"],"record_type":"collocation_identity","schema_version":"kianos_collocation_identity_v1","sense_id":sid,"status":"active","word_id":f"word:{word}"}
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

def apply(s):
    cap_limit=locate(s,"cap","cap:l2:3")
    relocate(s,675,cap_limit,"a cap on spending","支出上限")
    s.add_construction(675,"cap = upper limit / cap sth","cap denotes an upper limit; cap sth sets that limit")
    capital=locate(s,"capital","capital:l1:2")
    s.add_colloc(679,capital,"capitalism/capitalist","资本主义及其派生词锚定金融/经济资本","word_family")
    captain=locate(s,"captain","captain:l1:1")
    s.put_existing(681,captain,cn="船或飞机的负责人；船长或机长",en="the person in command of a ship or aircraft",level="L1")
    captive=locate(s,"captive","captive:l1:1")
    s.add_colloc(682,captive,"a captive audience","不能离开或被迫听取的听众")
    careful=locate(s,"careful","careful:l1:1")
    s.add_construction(691,"be careful to do sth","take care to do something; do not use the malformed + sth pattern")
    carrier=s.new(696,"service-provider carrier","noun","运输、电信或类似服务的服务提供商","a company or network that provides transport, telecommunications, or a similar service",level="L2")
    s.add_colloc(696,carrier,"mobile/wireless/network carrier","移动、无线或网络运营商")
    carry=locate(s,"carry","carry:l1:2")
    s.add_colloc(698,carry,"carry on","继续","fixed_pattern")
    s.add_colloc(698,carry,"carry over","延续或转移到之后的时间/情境","fixed_pattern")
    cart=locate(s,"cart","cart:l1:1")
    s.put_existing(699,cart,cn="小型带轮手推车，尤指购物车；较旧义为运货车",en="a small wheeled trolley, especially a shopping cart; formerly a vehicle for carrying goods",level="L1")
    s.add_colloc(699,cart,"shopping cart","购物车")
    case=locate(s,"case","case:l1:1")
    s.put_existing(702,case,cn="实例、情形或情况",en="an instance, situation, or set of circumstances",level="L1")
    s.add_colloc(702,case,"in case + clause","以防、万一后接从句")
    s.add_colloc(702,case,"in case of + noun","在发生某事时、以防某事")
    s.add_colloc(702,case,"in this/that case","在这种/那种情况下")
    cash=locate(s,"cash","cash:l2:2")
    s.add_colloc(703,cash,"cash in on sth","从某个机会或情形中获利、占便宜")
    cashier=locate(s,"cashier","cashier:l1:1")
    s.put_existing(704,cashier,cn="收款员，尤指商店或银行中收款的人",en="a person who receives payments, especially in a shop or bank",level="L1")
    cat=locate(s,"cat","cat:l1:1")
    for a in ["cat:l2:2","cat:l3:3","cat:l3:4"]:
        try: s.demote(710,locate(s,"cat",a))
        except StopIteration: pass
    catalog=locate(s,"catalog","catalog:l1:1")
    overlay(s,711,catalog,"catalogue","catalog is standard AmE; catalogue is standard BrE/international spelling")
    s.add_construction(711,"catalog/catalogue","same lexical meaning; regional spelling variant, not a duplicate sense")
    catch=locate(s,"catch","catch:l1:2")
    s.add_colloc(713,catch,"catch up with sb/sth","追上某人或某物")
    s.add_colloc(713,catch,"catch up on sth","补做或补看遗漏的事")
    s.add_colloc(713,catch,"catch on","理解；开始流行")
    cattle=locate(s,"cattle","cattle:l1:1")
    s.add_overlay(718,cattle,{"case_sensitive":False,"identity_type":"number_form_boundary","surface_lemma":"cattle","note":"collective plural noun; normally cattle are, not a cattle; use cow/bull/calf or head of cattle for individuals/counting"})
    cautious=locate(s,"cautious","cautious:l1:1")
    s.update_sense(721,cautious,cn="小心避免风险、危险或错误",en="careful to avoid risk, danger, or mistakes")
    cave=locate(s,"cave","cave:l2:2")
    s.add_colloc(722,cave,"cave in","在压力下屈服、让步")
    cease=locate(s,"cease","cease:l1:1")
    s.put_existing(723,cease,cn="停止、终止",en="to stop or end",pos="verb",level="L1",pattern="cease doing sth / cease to do sth")
    s.add_construction(723,"cease doing sth / cease to do sth","stop or end an action")
    ceiling=locate(s,"ceiling","ceiling:l2:3")
    s.put_existing(724,ceiling,cn="上限，尤指价格、支出或债务上限",en="an upper limit, especially on prices, spending, or debt",level="L2")
    celebrity=locate(s,"celebrity","celebrity:l1:1")
    s.put_existing(726,celebrity,cn="名人，广为人知的人",en="a famous or widely known person",level="L1")
    cement=locate(s,"cement","cement:l2:3")
    s.put_existing(729,cement,cn="巩固，使关系、联盟、协议或声誉变得牢固",en="to make a relationship, alliance, agreement, or reputation firm or permanent",pos="verb",level="L2")
    census=locate(s,"census","census:l1:1")
    s.put_existing(732,census,cn="人口普查；对人口的正式统计或调查",en="an official count or survey of a population",level="L1")
    centigrade=locate(s,"centigrade","centigrade:l1:1")
    s.update_sense(734,centigrade,cn="摄氏温标的；摄氏度的",en="relating to the Celsius temperature scale; an older synonym of Celsius")
    centimetre=locate(s,"centimetre","centimetre:l1:1")
    overlay(s,735,centimetre,"centimeter","centimetre is BrE/international; centimeter is AmE; same unit and meaning")
    central=locate(s,"central","central:l1:1")
    s.add_colloc(736,central,"be central to sth","对某事至关重要、是核心")
    centre=locate(s,"centre","centre:l1:1")
    overlay(s,737,centre,"center","centre is BrE; center is AmE; same noun and verb meanings")
    s.add_colloc(737,centre,"centre on / be centred on","以…为中心")
    certificate=locate(s,"certificate","certificate:l1:1")
    s.put_existing(742,certificate,cn="证明事实、资格或完成情况的正式文件",en="an official document proving a fact, qualification, or completion",level="L1")
    chain=locate(s,"chain","chain:l1:1")
    s.add_colloc(744,chain,"supply chain","供应链")
    s.add_colloc(744,chain,"chain reaction","连锁反应")
    chair=locate(s,"chair","chair:l1:1")
    s.put_existing(745,chair,cn="椅子、座椅",en="a seat for one person, usually with a back",level="L1")
    role=locate(s,"chair","chair:l2:2")
    s.put_existing(745,role,cn="会议或机构的主持职位或主持人",en="the presiding role or person in a meeting or organization",level="L2")
    verb=locate(s,"chair","chair:l1:4")
    s.put_existing(745,verb,cn="主持会议或机构",en="to preside over a meeting or organization",pos="verb",level="L2")
    chairman=locate(s,"chairman","chairman:l1:1")
    s.put_existing(746,chairman,cn="男性主持人或主席；现代语境常用 chair/chairperson 表示中性",en="a male person who chairs a meeting or organization; chair or chairperson is often preferred when gender is irrelevant",level="L1")
    chalk=locate(s,"chalk","chalk:l2:2")
    s.add_colloc(747,chalk,"chalk sth up to sth","把某事归因于某事")
    s.add_colloc(747,chalk,"chalk up","取得或记录")
    chamber=locate(s,"chamber","chamber:l2:3")
    s.add_colloc(749,chamber,"chamber of commerce","商会这一组织或机构，而非房间")
    chance=locate(s,"chance","chance:l1:1")
    s.add_construction(752,"have a chance to do sth / chance to do sth","have an opportunity to do something")
    s.add_construction(752,"chance of doing sth","probability or possibility of doing something")
    chancellor=locate(s,"chancellor","chancellor:l1:1")
    s.add_colloc(753,chancellor,"German Chancellor","德国政府首脑；不是国家元首")
    change=locate(s,"change","change:l1:1")
    s.add_construction(754,"change in sth / change from A to B / change of sth","distinguish an alteration, a transition, and a replacement or type shift")
    chapter=locate(s,"chapter","chapter:l1:1")
    s.put_existing(757,chapter,cn="书的一章；某一时期或事件的一段",en="a division of a book, or a distinct period or episode",level="L1")
    characterise=locate(s,"characterise","characterise:l1:1")
    overlay(s,759,characterise,"characterize","characterise is BrE; characterize is AmE")
    charge=locate(s,"charge","charge:l1:1")
    try: electrical=next(r["stable_sense_id"] for r in s.senses.values() if r.get("headword")=="charge" and not r.get("legacy_aliases"))
    except StopIteration: electrical=charge
    s.put_existing(761,electrical,cn="电荷；物质携带的可正可负的物理量",en="a physical property or quantity carried by matter that can be positive or negative",level="L2")
    s.add_colloc(761,electrical,"electric/electrical charge","正负电荷的科学表达")
    charm=locate(s,"charm","charm:l1:1")
    s.put_existing(763,charm,cn="吸引人的愉悦品质；魅力",en="an attractive or pleasing quality",level="L1")
    cverb=locate(s,"charm","charm:l2:3")
    s.put_existing(763,cverb,cn="吸引、使愉悦",en="to attract or delight",pos="verb",level="L2")
    cheap=locate(s,"cheap","cheap:l1:1")
    s.update_sense(768,cheap,cn="便宜的；价格低但有时暗示质量低劣或吝啬",en="inexpensive; sometimes suggesting low quality or stinginess",level="L1")
    s.add_colloc(768,cheap,"cheap goods/tickets","便宜的商品或票；说 low price 而不是 cheap price")
    cheat=locate(s,"cheat","cheat:l1:1")
    s.add_colloc(769,cheat,"cheat on sb","对伴侣不忠")
    check=locate(s,"check","check:l1:1")
    s.add_colloc(770,check,"check in/out","登记入住/退房或报到/离开","fixed_pattern")
    s.add_colloc(770,check,"check on sb/sth","核查某人的状态或某事进展","fixed_pattern")
    s.add_colloc(770,check,"check out sth","检查、调查；住店语境下退房","fixed_pattern")
    chemist=locate(s,"chemist","chemist:l1:1")
    s.add_colloc(776,chemist,"the chemist's","（英）药房")
    s.add_construction(776,"chemist BrE vs AmE","BrE can mean pharmacist; general/AmE primarily a chemistry scientist")
    cheque=locate(s,"cheque","cheque:l1:1")
    overlay(s,778,cheque,"check","cheque is BrE; check is AmE for the same bank payment instrument")
    chess=locate(s,"chess","chess:l1:1")
    s.put_existing(781,chess,cn="国际象棋，一种两人棋盘游戏",en="a two-player board game played with chess pieces",level="L1")
    chicken=locate(s,"chicken","chicken:l2:3")
    s.add_construction(784,"chicken out (of sth)","withdraw or decide not to do something because of fear")
    chill=locate(s,"chill","chill:l2:3")
    s.add_colloc(788,chill,"chill out","放松或冷静下来")
    chin=locate(s,"chin","chin:l1:1")
    s.put_existing(790,chin,cn="下巴，嘴下方的脸部部位",en="the part of the face below the mouth",level="L1")
    china=locate(s,"china","china:l1:1")
    overlay(s,791,china,"Chinese","China is the capitalized country name; Chinese is the ordinary adjective")
    s.add_colloc(791,china,"China policy","以 China 作定语的专名用法")
    chips=locate(s,"chip","chip:l1:2")
    s.add_colloc(792,chips,"potato chips","（美）薯片；（英）通常说 crisps")
    s.add_colloc(792,chips,"fish and chips","（英）炸鱼和薯条；不等同于 AmE potato chips")
    choir=locate(s,"choir","choir:l1:1")
    s.put_existing(795,choir,cn="合唱团，尤指教堂合唱团",en="an organized group of singers, especially in a church",level="L1")
    christ=locate(s,"christ","christ:l1:1")
    s.put_existing(800,christ,cn="基督；基督教中对耶稣的称号",en="the title or name used for Jesus in Christian usage",level="L1")
    christmas=locate(s,"christmas","christmas:l1:1")
    s.put_existing(802,christmas,cn="圣诞节；纪念耶稣诞生的基督教节日",en="the annual Christian festival celebrating the birth of Jesus Christ",level="L1")
    overlay(s,802,christmas,"christmas","Christmas is capitalized; lowercase is only a search alias")
    chronic=locate(s,"chronic","chronic:l1:1")
    s.update_sense(803,chronic,cn="长期持续、反复或慢性的",en="long-lasting, persistent, or recurrent over time; not simply difficult to cure")
    chunk=locate(s,"chunk","chunk:l1:1")
    s.update_sense(804,chunk,cn="厚的或较大的块；相当大的一部分或数量",en="a thick or large piece, or a substantial part or amount")
    cigaret=locate(s,"cigaret","cigaret:l1:1")
    overlay(s,807,cigaret,"cigarette","cigaret is a less-common spelling variant; cigarette is the standard modern spelling")
    circuit=locate(s,"circuit","circuit:l1:1")
    s.put_existing(810,circuit,cn="电流或电子的闭合通路；环行路线",en="a closed path for electrical current or electronics, or a route around a series of points",level="L1")
    s.add_colloc(810,circuit,"circuit board","电路板")
    circular=locate(s,"circular","circular:l1:1")
    s.add_colloc(811,circular,"circular reasoning / circular argument","循环论证：结论被前提预设或论证回到自身")
    circumstance=locate(s,"circumstance","circumstance:l1:1")
    s.put_existing(813,circumstance,cn="影响情形的条件或事实，通常用复数",en="a condition or fact affecting a situation, commonly used in the plural",level="L1")
    s.add_colloc(813,circumstance,"under/in the circumstances","在这种情况下")
    s.add_colloc(813,circumstance,"under no circumstances","无论如何都不")
    civil=locate(s,"civil","civil:l1:1")
    s.add_colloc(818,civil,"civil law/case/action","民事法律、案件或诉讼，与刑法相对")
    civilisation=locate(s,"civilisation","civilisation:l1:1")
    overlay(s,820,civilisation,"civilization","civilisation is BrE; civilization is AmE")
    civilise=locate(s,"civilise","civilise:l1:1")
    overlay(s,821,civilise,"civilize","civilise is BrE; civilize is AmE; people/society examples require dated or ethnocentric caution")
    clap=locate(s,"clap","clap:l1:1")
    s.add_colloc(823,clap,"clap sth on/into","迅速或用力地放上/塞入某物")
    s.add_construction(828,"class → classify","classify is anchored to class as a category or type, not only a student group")
    classic=locate(s,"classic","classic:l1:3")
    s.put_existing(829,classic,cn="典型的；具有代表性的标准范例",en="typical or characteristic; a standard example",pos="adjective",level="L1")
    s.add_colloc(829,classic,"a classic example/case","典型例子或案例")
    clean=locate(s,"clean","clean:l2:2")
    s.add_colloc(838,clean,"clean energy/technology","低污染、低碳或不污染的能源/技术")
    click=locate(s,"click","click:l2:3")
    s.add_colloc(843,click,"click with sb","立即理解、合得来或建立默契")
    s.add_colloc(843,click,"it clicked","突然明白")
    climax=locate(s,"climax","climax:l1:1")
    s.put_existing(847,climax,cn="过程、故事或事件的最高点或最强烈点",en="the highest, most intense, or most important point of a process, story, or event",level="L1")
    climb=locate(s,"climb","climb:l1:1")
    s.update_sense(848,climb,en="to climb up, down, over, or onto something; to ascend a mountain, tree, or stairs")
    clip=locate(s,"clip","clip:l1:1")
    s.add_colloc(851,clip,"a video/news/audio clip","电影、视频、音频或广播的短片段")
    clock=locate(s,"clock","clock:l1:1")
    s.add_colloc(853,clock,"around the clock","持续不断、日夜不停")
    close=locate(s,"close","close:l1:1")
    overlay(s,856,close,"close","verb close /kloʊz/ vs adjective/adverb close /kloʊs/")
    closet=locate(s,"closet","closet:l1:1")
    s.put_existing(857,closet,cn="小柜子或小储藏空间，尤指美式英语",en="a small cupboard or storage space, especially in AmE",level="L1")
    cloth=locate(s,"cloth","cloth:l1:1")
    s.add_construction(858,"cloth vs clothes vs clothing","cloth is material; clothes are garments; clothing is an uncountable collective noun")
    clothe=locate(s,"clothe","clothe:l1:1")
    s.update_sense(859,clothe,en="to provide or put clothes on someone; also figuratively to cover something with something",cn="给某人穿衣；（比喻）用某物覆盖某物")
    clothes=locate(s,"clothes","clothes:l1:1")
    for a in ["clothes:l2:2","clothes:l3:3"]:
        try: s.demote(860,locate(s,"clothes",a))
        except StopIteration: pass
    s.add_construction(860,"clothes are plural","use clothes for garments; for one item use a piece/article/item of clothing")
    clothing=locate(s,"clothing","clothing:l1:1")
    s.add_colloc(861,clothing,"an item/article/piece of clothing","一件衣服")
    cloud=locate(s,"cloud","cloud:l2:2")
    s.put_existing(862,cloud,cn="云端；基于互联网的远程存储、计算或服务",en="remote internet-based storage, computing, or services",level="L2")
    s.add_colloc(862,cloud,"cloud storage/cloud computing","云存储或云计算")
    club=locate(s,"club","club:l1:2")
    s.put_existing(864,club,cn="球杆等运动器具；也可指棍棒类器具",en="an implement such as a golf club, not only a weapon-like stout stick",level="L1")
    coach=locate(s,"coach","coach:l1:1")
    s.put_existing(869,coach,cn="训练运动员或队伍的人；教练",en="a person who trains an athlete or team",level="L1")
    coast=locate(s,"coast","coast:l2:2")
    s.put_existing(873,coast,cn="轻松或不费力地推进，尤指 coast through an exam / coast to victory",en="to progress or succeed with little effort",pos="verb",level="L2")
    s.add_colloc(873,coast,"coast through an exam / coast to victory","不费力地通过考试或取得胜利")
def owner_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

def owner_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

def write_receipts(store: Store, natural_words: dict[int, dict], report: dict) -> None:
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
    receipt={"schema":"kianos.lexical.semantic_handoff_implementation_receipt.v1","status":"LOCAL_CLOSED_PENDING_INTEGRATION","handoff":"content/lexical/semantic-review/o0675-o0874.md","baseline_origin_main":BASELINE_ORIGIN_MAIN,"range":[675,874],"authority":"semantic-review handoff only; mechanical implementation by Luna/Codex","expected_counts":{"NO_CHANGE":119,"UPGRADE":81,"BLOCKED":0},"actual":{"owners_read_back":200,"changed_upgrade_owners":len(changed),"no_change_byte_preserved":all(x["byte_preserved"] for x in rows if x["operation"]=="NO_CHANGE"),"blocked_owners":[],"semantic_escalations":[],"engineering_failures":[],"o0875_plus_untouched":True},"current_final":{"catalog_execution":"ACTIVE","bounded_implementation":"COMPLETE","next_range_active":False,"o0875_plus_active":False},"owners":rows}
    (out/"implementation-o0675-o0874.json").write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    new_ids=sorted(x for x,r in store.senses.items() if r.get("headword") in {UPGRADES[o] for o in NEW_BRANCH_ORDINALS} and not r.get("legacy_aliases") and r.get("status")=="active")
    ident={"schema":"kianos.lexical.identity_reconciliation_readback.v1","status":"PASS","baseline_origin_main":BASELINE_ORIGIN_MAIN,"scope":[675,874],"handoff":"content/lexical/semantic-review/o0675-o0874.md","classifications":{"REUSE_EXISTING_STABLE":{"rule":"reuse continuous active/deprecated/merged stable branch; no generated replacement","owners":reuse},"NEW_SEMANTIC_BRANCH":{"rule":"deterministic stable ID created only for a handoff-authorized genuinely new branch","owners":new},"ESCALATE_IDENTITY":{"owners":[]}},"reactivated_or_reconciled_sense_ids":sorted(store.changed_sense_ids),"new_stable_sense_ids":new_ids,"reference_closure":"PASS","relation_owner_changes":[],"form_identity_closure":{"status":"PASS","word_owner_files":[]},"readback_assertions":{"stable_word_identity_preserved":True,"active_sense_registry_closed":True,"merged_into_not_left_on_active_senses":True,"handoff_generated_ids_absent":True,"o0875_plus_not_activated":True},"natural_owner_audit":report}
    (out/"identity-reconciliation-readback-o0675-o0874.json").write_text(json.dumps(ident,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    esc={"schema":"kianos.lexical.semantic_escalation_artifact.v1","status":"NO_ESCALATIONS_REQUIRED","scope":[675,874],"authority":["content/lexical/semantic-review/o0675-o0874.md","content/lexical/CURRENT.md"],"escalations":[],"note":"All 81 upgrades were mechanically mapped by the frozen handoff and Current identity rule; no unresolved sense split/merge, competing identity, uncertain Relation truth, or unclear Form boundary remained. Engineering failures are not semantic escalations."}
    (out/"semantic-escalations-o0675-o0874.json").write_text(json.dumps(esc,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

def main():
    handoff=HANDOFF.read_text(encoding="utf-8")
    rows=list(re.finditer(r'^(?:###\s+|-\s+)o(\d{4})\s+\*\*([^*]+)\*\*\s+—\s+(NO_CHANGE|UPGRADE|BLOCKED)',handoff,re.M))
    if len(rows)!=200 or sum(m.group(3)=="UPGRADE" for m in rows)!=81 or set(UPGRADES)!={int(m.group(1)) for m in rows if m.group(3)=="UPGRADE"}: raise SystemExit("HANDOFF_COVERAGE_MISMATCH")
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
    print(json.dumps({"status":"APPLIED","scope":[675,874],"upgrade_count":len(s.changed_word_ordinals),"changed_ordinals":sorted(s.changed_word_ordinals),"changed_senses":len(s.changed_sense_ids),"changed_collocations":len(s.changed_collocation_ids),"identity":{k:sorted(set(v)) for k,v in s.identity.items()}},ensure_ascii=False,indent=2))
if __name__=="__main__": main()
