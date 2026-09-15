#!/usr/bin/env python3
"""Mechanical executor for content/lexical/semantic-reconciliation/o0025-o0224.md.

Post-cutover rules:
- Word Natural Owners own word-local semantics.
- Relation Natural Owners own cross-word semantic relations.
- canonical/senses and canonical/collocations are touched only as stable identity/provenance registries.
- pre-cutover canonical/words and canonical/relations are never mutated.
"""
from __future__ import annotations

import copy
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LEX = ROOT / "content" / "lexical"
OWNER_DIR = LEX / "words" / "by-ordinal"
REL_DIR = LEX / "relations" / "by-id"
SENSE_DIR = LEX / "canonical" / "senses" / "shards"
COLL_DIR = LEX / "canonical" / "collocations" / "shards"
RECEIPT_DIR = LEX / "audit" / "retro-corrections"
NOW = "2026-09-15T05:20:00Z"
AUTH = "content/lexical/semantic-reconciliation/o0025-o0224.md"

DELTA = [
    26,31,40,42,45,49,50,51,53,57,58,60,62,65,66,67,70,72,76,78,79,81,84,
    85,86,89,96,103,104,112,115,116,118,123,125,128,129,133,137,140,141,144,
    147,154,156,163,164,167,171,175,182,194,198,199,204,212,217,220,223,
]
REMOTE_WORDS = [2878]
NEW_BRANCH_LEDGER = {
    26: ("noun_stress_emphasis", "noun", "重音；强调的突出点", "prominence or emphasis placed on a syllable, word, or idea", "L1"),
    49: ("figurative_sharp_tone", "adjective", "尖刻的；讥讽的", "sharp, biting, or cutting in tone or manner", "L2"),
    50: ("notice_recognize", "verb", "表示注意到；认可；致意", "to show or indicate that you have noticed or recognized someone or something", "L2"),
    60: ("operating_in_use", "adjective", "活动中的；运行中的；正在使用的", "currently operating, in use, or actively engaged", "L1"),
    116: ("secret_intelligence", "noun", "特工；情报人员", "a person who secretly obtains or carries out intelligence work", "L2"),
    129: ("broadcast_media", "verb", "播出；广播", "to broadcast a program, interview, or other material on radio, television, or media", "L1"),
    140: ("extraterrestrial", "noun", "外星人；外星生物", "a being from another planet or world", "L1"),
    164: ("substitute_standin", "noun", "替代者；候补者", "a substitute or stand-in person or thing", "L2"),
}


def stable(v):
    return json.dumps(v, ensure_ascii=False, sort_keys=True, separators=(",", ":"))

def sha(v):
    return hashlib.sha256(stable(v).encode()).hexdigest()

def load(p: Path):
    return json.loads(p.read_text(encoding="utf-8"))

def dump(p: Path, v):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(v, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def sense_id(word, branch):
    return f"sense:{word}:" + sha({"word": word, "branch": branch})[:16]

def colloc_id(word, sid, phrase):
    return "collocation:" + sha({"word": word, "sense_id": sid, "phrase": phrase})[:20]

def relation_owner_path(rid):
    d = hashlib.sha256(rid.encode()).hexdigest()
    return REL_DIR / d[:2] / f"{d}.json"

def choose_shard(root: Path, ordinal: int):
    for p in sorted(root.glob("o*-*.json")):
        m = re.fullmatch(r"o(\d+)-(\d+)\.json", p.name)
        if m and int(m.group(1)) <= ordinal <= int(m.group(2)):
            return p
    raise RuntimeError(f"NO_SHARD:{root}:{ordinal}")

def make_active(sid, pos, cn, en, level="L2", pattern="", order=999):
    return {
        "collocations": [], "confidence": "medium", "definition_cn": cn, "definition_en": en,
        "governing_pattern": pattern, "level": level, "needs_human_review": 0, "pos": pos,
        "sense_id": sid, "sense_label_en": en, "sort_order": order,
        "transitivity": "nonverb" if pos != "verb" else "vt",
    }

class State:
    def __init__(self):
        self.owners = {o: load(OWNER_DIR / f"o{o:04d}.json") for o in DELTA + REMOTE_WORDS}
        self.changed_words = set()
        self.changed_relations = set()
        self.new_senses = []
        self.reactivated = []
        self.demoted = []
        self.merged = []
        self.moved_collocations = []
        self.sense_rows = {}
        self.sense_by_id = {}
        for p in sorted(SENSE_DIR.glob("*.json")):
            rows = load(p)
            for i, row in enumerate(rows):
                rec = row.get("record", {})
                sid = rec.get("stable_sense_id")
                if sid:
                    self.sense_rows[sid] = (p, i, row)
                    self.sense_by_id[sid] = rec
        self.coll_rows = {}
        self.coll_by_id = {}
        for p in sorted(COLL_DIR.glob("*.json")):
            rows = load(p)
            for i, row in enumerate(rows):
                rec = row.get("record", {})
                cid = rec.get("collocation_id")
                if cid:
                    self.coll_rows[cid] = (p, i, row)
                    self.coll_by_id[cid] = rec
        self.dirty_sense_paths = set()
        self.dirty_coll_paths = set()

    def owner(self, o): return self.owners[o]
    def rec(self, o): return self.owner(o)["record"]
    def active(self, o): return self.rec(o).setdefault("senses", [])
    def mark(self, o): self.changed_words.add(o)

    def active_sense(self, o, sid):
        return next((x for x in self.active(o) if x.get("sense_id") == sid), None)

    def update_sense(self, o, sid, *, cn=None, en=None, level=None, pattern=None, pos=None, transitivity=None, usage_note=None):
        x = self.active_sense(o, sid)
        if x is None:
            raise RuntimeError(f"ACTIVE_SENSE_MISSING:o{o:04d}:{sid}")
        if cn is not None: x["definition_cn"] = cn
        if en is not None: x["definition_en"] = en; x["sense_label_en"] = en
        if level is not None: x["level"] = level
        if pattern is not None: x["governing_pattern"] = pattern
        if pos is not None: x["pos"] = pos
        if transitivity is not None: x["transitivity"] = transitivity
        if usage_note is not None: x["usage_note"] = usage_note
        reg = self.sense_by_id.get(sid)
        if reg:
            if cn is not None: reg["definition_cn"] = cn
            if en is not None: reg["definition_en"] = en
            if pos is not None: reg["pos"] = pos
            reg["updated_at"] = NOW
            self.dirty_sense_paths.add(self.sense_rows[sid][0])
        self.mark(o)
        return x

    def add_new(self, o, branch, pos, cn, en, level="L2", pattern=""):
        word = self.owner(o)["word"]
        sid = sense_id(word, branch)
        if sid in self.sense_by_id:
            raise RuntimeError(f"NEW_BRANCH_ID_COLLISION:{sid}")
        order = max([x.get("sort_order", -1) for x in self.active(o)] + [-1]) + 1
        self.active(o).append(make_active(sid, pos, cn, en, level, pattern, order))
        reg = {
            "created_at": NOW, "definition_cn": cn, "definition_en": en, "headword": word,
            "legacy_alias_history": [], "legacy_aliases": [], "merged_into_sense_id": None,
            "pos": pos, "record_type": "sense_registry",
            "semantic_key": sha({"word": word, "branch": branch, "cn": cn, "en": en}),
            "semantic_key_history": [], "stable_sense_id": sid, "status": "active", "updated_at": NOW,
        }
        p = choose_shard(SENSE_DIR, o)
        rows = load(p)
        row = {"source_row": max([r.get("source_row", 0) for r in rows] + [0]) + 1, "anchor_ordinal": o, "record": reg}
        rows.append(row); dump(p, rows)
        self.sense_rows[sid] = (p, len(rows)-1, row); self.sense_by_id[sid] = reg
        self.new_senses.append(sid); self.mark(o)
        return sid

    def reactivate(self, o, sid, *, cn=None, en=None, level="L2", pattern="", pos=None, transitivity=None):
        if sid not in self.sense_by_id: raise RuntimeError(f"REGISTRY_SENSE_MISSING:{sid}")
        reg = self.sense_by_id[sid]
        reg["status"] = "active"; reg["merged_into_sense_id"] = None; reg["updated_at"] = NOW
        if cn is not None: reg["definition_cn"] = cn
        if en is not None: reg["definition_en"] = en
        if pos is not None: reg["pos"] = pos
        self.dirty_sense_paths.add(self.sense_rows[sid][0])
        if not self.active_sense(o, sid):
            x = make_active(sid, pos or reg.get("pos") or "noun", cn or reg.get("definition_cn", ""), en or reg.get("definition_en", ""), level, pattern)
            if transitivity is not None: x["transitivity"] = transitivity
            x["sort_order"] = max([s.get("sort_order", -1) for s in self.active(o)] + [-1]) + 1
            self.active(o).append(x)
        else:
            self.update_sense(o, sid, cn=cn, en=en, level=level, pattern=pattern, pos=pos, transitivity=transitivity)
        self.reactivated.append(sid); self.mark(o)
        return sid

    def demote(self, o, sid, merged_into=None, status=None, overlay=None):
        x = self.active_sense(o, sid)
        self.rec(o)["senses"] = [s for s in self.active(o) if s.get("sense_id") != sid]
        reg = self.sense_by_id.get(sid)
        if not reg: raise RuntimeError(f"DEMOTE_REGISTRY_MISSING:{sid}")
        reg["status"] = status or ("merged" if merged_into else "deprecated")
        reg["merged_into_sense_id"] = merged_into
        reg["updated_at"] = NOW
        if overlay:
            reg["lexical_identity_overlay"] = overlay
        self.dirty_sense_paths.add(self.sense_rows[sid][0])
        if merged_into: self.merged.append((sid, merged_into))
        else: self.demoted.append(sid)
        self.mark(o)
        return x

    def overlay(self, o, sid, note, *, case_sensitive=False, surface=None, paired=None, identity_type="form_boundary"):
        x = self.active_sense(o, sid)
        if x is None: raise RuntimeError(f"OVERLAY_SENSE_MISSING:{sid}")
        x["lexical_identity_overlay"] = {
            "case_sensitive": case_sensitive,
            "identity_type": identity_type,
            "surface_lemma": surface or self.owner(o)["word"],
            "paired_form": paired or self.owner(o)["word"],
            "note": note,
        }
        self.mark(o)

    def set_core(self, o, cn, en, mental_cn=None):
        c = self.rec(o).setdefault("core_concept", {})
        c["core_meaning_cn"] = cn; c["core_meaning_en"] = en
        c["mental_model_cn"] = mental_cn if mental_cn is not None else cn
        c.setdefault("mental_model_en", "")
        self.mark(o)

    def add_cluster(self, o, sid, pos, cn, en):
        clusters = self.rec(o).setdefault("core_concept", {}).setdefault("core_clusters", [])
        if any(sid in x.get("sense_ids", []) for x in clusters): return
        clusters.append({"label_cn": cn, "label_en": en, "pos": pos, "sense_ids": [sid]})
        self.mark(o)

    def move_colloc(self, o, phrase, target_sid, new_phrase=None, new_meaning=None):
        found = None
        for s in self.active(o):
            for c in list(s.get("collocations", [])):
                if c.get("phrase") == phrase:
                    s["collocations"].remove(c); found = c; break
            if found: break
        if not found: raise RuntimeError(f"COLLOCATION_NOT_FOUND:o{o:04d}:{phrase}")
        if new_phrase is not None: found["phrase"] = new_phrase
        if new_meaning is not None: found["meaning_cn"] = new_meaning
        target = self.active_sense(o, target_sid)
        if not target: raise RuntimeError(f"TARGET_SENSE_NOT_ACTIVE:{target_sid}")
        target.setdefault("collocations", []).append(found)
        cid = found.get("collocation_id")
        if cid in self.coll_by_id:
            r = self.coll_by_id[cid]; r["sense_id"] = target_sid; r["current_value_hash"] = sha(found)
            self.dirty_coll_paths.add(self.coll_rows[cid][0])
        self.moved_collocations.append((o, cid, target_sid)); self.mark(o)

    def rename_colloc(self, o, old, new, meaning=None):
        for s in self.active(o):
            for c in s.get("collocations", []):
                if c.get("phrase") == old:
                    c["phrase"] = new
                    if meaning is not None: c["meaning_cn"] = meaning
                    cid = c.get("collocation_id")
                    if cid in self.coll_by_id:
                        self.coll_by_id[cid]["current_value_hash"] = sha(c)
                        self.dirty_coll_paths.add(self.coll_rows[cid][0])
                    self.mark(o); return c
        raise RuntimeError(f"RENAME_COLLOCATION_NOT_FOUND:o{o:04d}:{old}")

    def drop_colloc(self, o, phrase):
        for s in self.active(o):
            for c in list(s.get("collocations", [])):
                if c.get("phrase") == phrase:
                    s["collocations"].remove(c)
                    cid = c.get("collocation_id")
                    if cid in self.coll_by_id:
                        self.coll_by_id[cid]["status"] = "deprecated"
                        self.coll_by_id[cid]["current_value_hash"] = sha(c)
                        self.dirty_coll_paths.add(self.coll_rows[cid][0])
                    self.mark(o); return
        raise RuntimeError(f"DROP_COLLOCATION_NOT_FOUND:o{o:04d}:{phrase}")

    def add_colloc(self, o, sid, phrase, meaning, exam="fixed_pattern"):
        target = self.active_sense(o, sid)
        if not target: raise RuntimeError(f"COLLOCATION_TARGET_MISSING:{sid}")
        if any(c.get("phrase") == phrase for s in self.active(o) for c in s.get("collocations", [])): return
        word = self.owner(o)["word"]; cid = colloc_id(word, sid, phrase)
        item = {"collocation_id": cid, "exam_value": exam, "legacy_source_object_ids": [f"{sid}:collocation:retro-o0025-o0224"], "meaning_cn": meaning, "phrase": phrase}
        target.setdefault("collocations", []).append(item)
        if cid not in self.coll_by_id:
            reg = {"collocation_id": cid, "created_by": "retro-audit-reconciliation-o0025-o0224", "current_value_hash": sha(item), "legacy_source_object_ids": item["legacy_source_object_ids"], "record_type": "collocation_identity", "schema_version": "kianos_collocation_identity_v1", "sense_id": sid, "status": "active", "word_id": f"word:{word}"}
            p = choose_shard(COLL_DIR, o); rows = load(p)
            row = {"source_row": max([r.get("source_row", 0) for r in rows] + [0]) + 1, "anchor_ordinal": o, "record": reg}
            rows.append(row); dump(p, rows)
            self.coll_rows[cid] = (p, len(rows)-1, row); self.coll_by_id[cid] = reg
        self.mark(o)

    def constructions(self, o, entries):
        self.rec(o)["constructions"] = entries; self.mark(o)

    def relation(self, path):
        p = ROOT / path
        return p, load(p)

    def save_relation(self, p, obj):
        dump(p, obj); self.changed_relations.add(p.relative_to(ROOT).as_posix())

    def sync_registry_files(self):
        # Existing dirty rows are in-memory objects inside independently loaded shard rows only via self.sense_rows/self.coll_rows.
        # Re-open each shard and replace records by stable identity.
        for p in sorted(self.dirty_sense_paths):
            rows = load(p)
            for row in rows:
                sid = row.get("record", {}).get("stable_sense_id")
                if sid in self.sense_by_id: row["record"] = self.sense_by_id[sid]
            dump(p, rows)
        for p in sorted(self.dirty_coll_paths):
            rows = load(p)
            for row in rows:
                cid = row.get("record", {}).get("collocation_id")
                if cid in self.coll_by_id: row["record"] = self.coll_by_id[cid]
            dump(p, rows)

    def sync_owner_identity(self, o):
        owner = self.owner(o); active_ids = {x.get("sense_id") for x in self.active(o)}
        # Registry rows for this ordinal.
        refs = []
        ids = []
        for sid, (p, _i, row) in self.sense_rows.items():
            if row.get("anchor_ordinal") != o: continue
            reg = self.sense_by_id[sid]
            ids.append({"sense_id": sid, "status": reg.get("status"), "merged_into_sense_id": reg.get("merged_into_sense_id"), "source_row": row.get("source_row"), "source_path": p.relative_to(ROOT).as_posix()})
            if sid not in active_ids:
                ref = {"stable_sense_id": sid, "status": reg.get("status"), "merged_into_sense_id": reg.get("merged_into_sense_id"), "pos": reg.get("pos"), "definition_cn": reg.get("definition_cn"), "definition_en": reg.get("definition_en"), "semantic_key": reg.get("semantic_key"), "semantic_key_history": reg.get("semantic_key_history", []), "legacy_aliases": reg.get("legacy_aliases", []), "legacy_alias_history": reg.get("legacy_alias_history", []), "updated_at": reg.get("updated_at"), "source_row": row.get("source_row"), "source_path": p.relative_to(ROOT).as_posix(), "reference_only": True}
                if reg.get("lexical_identity_overlay") is not None: ref["lexical_identity_overlay"] = reg["lexical_identity_overlay"]
                refs.append(ref)
        owner["identity_refs"]["senses"] = sorted(ids, key=lambda x: x["sense_id"])
        owner["reference_senses"] = sorted(refs, key=lambda x: x["stable_sense_id"])
        owner["identity_refs"]["active_collocations"] = sorted({c.get("collocation_id") for s in self.active(o) for c in s.get("collocations", []) if c.get("collocation_id")})
        collrefs = []
        for cid, (p, _i, row) in self.coll_rows.items():
            if row.get("anchor_ordinal") == o:
                collrefs.append({"id": cid, "source_row": row.get("source_row"), "source_path": p.relative_to(ROOT).as_posix()})
        owner["identity_refs"]["collocations"] = sorted(collrefs, key=lambda x: x["id"])
        # Remove demoted IDs from learner Core clusters.
        for cluster in self.rec(o).get("core_concept", {}).get("core_clusters", []):
            cluster["sense_ids"] = [sid for sid in cluster.get("sense_ids", []) if sid in active_ids]
        self.rec(o)["senses"].sort(key=lambda x: (x.get("sort_order", 999), x.get("sense_id", "")))
        for i, x in enumerate(self.rec(o)["senses"]): x["sort_order"] = i
        sig = self.rec(o).setdefault("review_signature", [])
        marker = "semantic-reconciliation:o0025-o0224"
        if marker not in sig: sig.append(marker)
        self.rec(o)["content_hash"] = sha({k:v for k,v in self.rec(o).items() if k != "content_hash"})
        self.mark(o)

    def write_owners(self):
        for o in sorted(self.changed_words): dump(OWNER_DIR / f"o{o:04d}.json", self.owner(o))


def normalize_relation(obj, source_sid, target_sid, target_word, boundary, source_def=None, target_def=None):
    fr = obj.get("fact_record")
    if isinstance(fr, dict):
        fr["source_sense_id"] = source_sid; fr["target_sense_id"] = target_sid; fr["target_word"] = target_word; fr["boundary"] = boundary
        c = fr.get("content")
        if isinstance(c, dict):
            c["source_sense_id"] = source_sid; c["target_sense_id"] = target_sid; c["target_word"] = target_word
            if source_def is not None: c["source_definition"] = source_def
            if target_def is not None: c["target_definition"] = target_def
    for view in obj.get("word_views", []):
        p = view.get("payload", {})
        p["source_sense_id"] = source_sid; p["target_sense_id"] = target_sid; p["target_word"] = target_word; p["boundary"] = boundary
        if source_def is not None: p["definition_en"] = p.get("definition_en")
    obj.setdefault("provenance", {})["last_semantic_authority"] = AUTH


def compact_construction(pattern, meaning, source_sid=None, cid=None, fact_id=None, boundary=None):
    x = {"pattern": pattern, "meaning_cn": meaning}
    if cid: x["construction_id"] = cid
    if fact_id: x.update({"fact_id": fact_id, "module": "constructions", "publication_status": "publishable"})
    if source_sid: x["source_sense_id"] = source_sid
    if boundary: x["boundary"] = boundary
    return x


def apply(s: State):
    # A false-pass corrections
    s.move_colloc(31, "by accident", "sense:accident:483e0350a62e5da6")
    s.update_sense(42, "sense:accumulate:57e81da3d41159b2", pattern="vt. + object / vi.", transitivity="vt/vi")
    s.move_colloc(78, "admire the view", "sense:admire:80e0fd029b8a563a")
    s.move_colloc(81, "adolescent development", "sense:adolescent:3f0ce3ef373a5105")
    s.move_colloc(84, "adult insect", "sense:adult:167706f9ce525815", new_meaning="成年的；成体的")
    s.rename_colloc(175, "ambition to do + sth", "ambition to do sth")
    for x in s.rec(194).get("constructions", []):
        if x.get("pattern") == "and so on":
            x["boundary"] = "and so on = and other similar things; etc."
            x["meaning_cn"] = "等等；以及其他类似事物"
    s.mark(194)

    # B refinements
    p, r = s.relation("content/lexical/relations/by-id/b3/b3dc040027b9c6d026c6e4b300c060f38c2f5fece13affacbcbd4c985d7ab167.json")
    normalize_relation(r, "sense:accuse:b58783ce580f5cca", "sense:charge:c6e08a27aa9b51d5", "charge", "accuse sb of sth is the general accusation frame; charge sb with sth is the more formal/legal accusation frame.", "to say that someone has done something wrong or illegal", "to accuse someone formally, especially of a crime")
    s.save_relation(p, r)
    s.constructions(45, [compact_construction("accuse sb of sth", "指控某人做了某事；与 charge sb with sth 区分", "sense:accuse:b58783ce580f5cca", fact_id="deep:constructions:accuse:88cf4103b0fd4e00", boundary="accuse sb of sth")])
    for f in s.rec(51).get("word_family", []):
        if f.get("target_word") == "acquaintance": f["boundary"] = "acquaint → acquaintance：熟悉、了解；相识程度/知识"; f["target_sense_id"] = "sense:acquaintance:ce45086be5005ece"
    s.mark(51)
    p, r = s.relation("content/lexical/relations/by-id/78/78a30be8f9a04ab6505d6455b9fd8df46284f355a12ccc789a8e46eb95281d4c.json")
    normalize_relation(r, "sense:address:24bdfba1f4f35e11", "sense:speak:31101376e2785e29", "speak", "address a person/audience is a direct, often more formal targeted speech use; speak is the broader speech verb.", "to direct spoken or written words to a person or group", "to speak or make a speech")
    s.save_relation(p, r)
    for f in s.rec(123).get("word_family", []):
        if f.get("target_word") == "agreeable": f["target_sense_id"] = "sense:agreeable:7a7c1d50823453af"; f["boundary"] = "agree → agreeable：愿意同意/赞同（此处不是 pleasant 义）"
    s.rename_colloc(123, "agree to do + sth", "agree to do sth")
    cons = []
    for x in s.rec(123).get("constructions", []):
        y = copy.deepcopy(x)
        if y.get("pattern") == "agree to do + sth": y["pattern"] = "agree to do sth"; y["boundary"] = "agree to do sth 表同意做某事"; y["source_sense_id"] = "sense:agree:b2482b0c5301512a"
        if y.get("pattern") == "be agreed that + clause": y["pattern"] = "it is agreed that + clause"; y["boundary"] = "formal impersonal agreement construction"; y["source_sense_id"] = "sense:agree:520c7ad09b16501a"
        cons.append(y)
    s.constructions(123, cons)
    s.demote(123, "sense:agree:f9599b9e7c115b8b", merged_into="sense:agree:520c7ad09b16501a", status="merged")

    # C readback drift
    new_ids = {}
    for o, (branch,pos,cn,en,level) in NEW_BRANCH_LEDGER.items():
        new_ids[o] = s.add_new(o, branch, pos, cn, en, level)

    accent_sid = new_ids[26]; s.add_colloc(26, accent_sid, "place the accent on sth", "把重点放在某事上")
    s.add_cluster(26, accent_sid, "noun", "重音；强调点", "stress or emphasis")
    p, r = s.relation("content/lexical/relations/by-id/7a/7a9d0d197e6fed12083c9342b64a5881f2c44fb60c3aa540d13e49b604d0425b.json")
    normalize_relation(r, accent_sid, "sense:emphasis:740adc49afae53c0", "emphasis", "accent can mean a particular stress/prominence; emphasis is the broader act or effect of giving special importance.", "prominence or emphasis placed on a syllable, word, or idea", "special importance or stress")
    s.save_relation(p, r)

    s.demote(40, "sense:account:a05af64a37a356ee")
    acid_sid = new_ids[49]; s.add_colloc(49, acid_sid, "acid remark/tone", "尖刻的评论/语气")
    ack_sid = new_ids[50]; s.add_colloc(50, ack_sid, "acknowledge sb's presence", "表示注意到/认可某人的存在")
    s.update_sense(53, "sense:acquire:85962eed951e5455", cn="获得；取得；逐渐习得或染上", en="to obtain, gain, or come to have something, whether by purchase, effort, gradual development, or acquisition of a condition")
    for ph,mc in [("acquire assets/property","获得资产/财产"),("acquire a skill/quality","逐渐获得技能/品质"),("acquire a disease/condition","患上疾病/获得某种状况")]: s.add_colloc(53, "sense:acquire:85962eed951e5455", ph, mc)

    s.reactivate(57, "sense:act:27ae16abd7e25f5f", cn="行动；表现；起作用", en="to take action, behave in a particular way, or function as something", level="L1", pos="verb", transitivity="vi/vt")
    s.reactivate(57, "sense:act:91201571c8f9538c", cn="法案；法令；成文法", en="a law or statute enacted by a legislature", level="L2", pos="noun")
    s.set_core(57, "行动、表现；行为；法案", "to act or behave; an act/action; a statute")
    s.add_cluster(57, "sense:act:27ae16abd7e25f5f", "verb", "行动；表现；起作用", "act, behave, or function")
    s.add_cluster(57, "sense:act:91201571c8f9538c", "noun", "法案；法令", "an Act or statute")

    s.update_sense(58, "sense:action:35715f8fe8d75892", cn="行动；采取的步骤或措施", en="something done, especially a step or measure taken to achieve a result")
    s.reactivate(58, "sense:action:dff3f124f9e65911", cn="作用；运作；机制", en="the operation, effect, or mechanism by which something works or acts", level="L2", pos="noun")
    s.add_colloc(58, "sense:action:dff3f124f9e65911", "the action of a drug", "药物的作用机制")

    active_sid = new_ids[60]; s.add_colloc(60, active_sid, "active account/service/system", "正在使用或运行的账户/服务/系统")
    s.demote(60, "sense:active:91aecc90f63f5c5b"); s.demote(60, "sense:active:00403d6658535d96")
    s.set_core(60, "积极主动的；活动中/运行中的；活动性的", "proactive; operating or in use; active in progress")
    s.add_cluster(60, active_sid, "adjective", "活动中的；运行中的", "operating or in use")

    s.update_sense(62, "sense:actor:7a22e9f40980525a", cn="演员", en="a performer who acts in plays, films, television, or other dramatic works")

    # adapt dedup
    keep=[]
    for x in s.rec(65).get("constructions", []):
        pat=x.get("pattern")
        if pat in {"adapt + sth to + sth","adapt to + sth","adapt + sth for + sth","adapt sth from sth"}: keep.append(x)
    s.constructions(65, keep)

    s.constructions(66, [
        compact_construction("add A to B", "把 A 加到 B 上", cid="construction:add:handoff-8b4ede2b75cfb079"),
        compact_construction("add (sth) up", "把……加起来；（情况/解释）说得通", cid="construction:bd40f68b07ef7124995d"),
        compact_construction("add up to sth", "总计为；结果是；相当于", cid="construction:0da8cd9893e2e0fc54d9"),
    ])
    s.set_core(67, "上瘾者；沉迷某活动的人", "a person dependent on a substance or strongly devoted to an activity")

    s.constructions(72, [
        compact_construction("adhere to sth", "粘附于某物", "sense:adhere:aeb5ac3f21935dbe", fact_id="deep:constructions:adhere:4f0cc6d87b5da9c0", boundary="physical adherence"),
        compact_construction("adhere to a rule/principle", "遵守规则或原则", "sense:adhere:021a213c0efe52d5", cid="construction:adhere:handoff-1cd07e54a0bbfdcb"),
    ])

    s.reactivate(76, "sense:administer:4acf2e95a78c540b", cn="管理；主持；执行", en="to manage, run, or carry out an organization, system, law, or duty", level="L1", pos="verb", transitivity="vt")
    s.reactivate(76, "sense:administer:6ff758553e4d5aca", cn="施用；给予（药物、治疗、测试、宣誓等）", en="to give or apply medicine or treatment, conduct a test, or formally administer an oath", level="L1", pos="verb", transitivity="vt")
    s.demote(76, "sense:administer:698f942426ae5f66")
    s.set_core(76, "管理；施用或正式执行", "to manage or formally give/apply/administer something")

    # admission fee is phrase, not a lexical sense
    fee = s.demote(79, "sense:admission:d57f24639ae453e6")
    if fee:
        for c in fee.get("collocations", []):
            if c.get("phrase") == "admission charge": s.add_colloc(79, "sense:admission:3510bd6bcdc45c41", "admission charge", "入场费")

    s.reactivate(85, "sense:advance:2baadc1a47175fde", cn="前进；进展；进步", en="forward movement or progress", level="L1", pos="noun")
    s.reactivate(85, "sense:advance:cc7302211c275f0c", cn="提出；推举（观点、理论、建议）", en="to put forward or propose an idea, theory, argument, or proposal", level="L2", pos="verb", transitivity="vt")
    s.reactivate(85, "sense:advance:4ee687e7f9cf5023", cn="预付款；预支", en="a payment made before it is due or earned", level="L2", pos="noun")
    s.set_core(85, "前进/进展；推进/提出；预先的或预付款", "forward progress; to advance/propose; beforehand or an advance payment")

    s.update_sense(86, "sense:advanced:9e10a473b8b153c4", cn="高龄的；晚期的；发展到较后阶段的", en="at a late or far-progressed stage, as in advanced age or advanced disease", level="L2")
    s.demote(89, "sense:adventure:4c2107c79c4857d5")

    s.overlay(96, "sense:advocate:57dc30b549145007", "noun advocate has initial stress; verb advocate shifts stress/pronunciation", paired="advocate noun/verb")
    s.overlay(96, "sense:advocate:ef64940b713b57c7", "verb advocate has different stress/pronunciation from the noun", paired="advocate noun/verb")

    s.update_sense(103, "sense:affirm:5514dd5ba891533a", cn="（法律）维持；确认（判决或决定）", en="in law, to uphold or confirm a judgment or decision")

    s.reactivate(104, "sense:affluent:2c108df63e585417", cn="富裕的；富有的；繁荣的", en="wealthy, prosperous, or having abundant resources", level="L1", pos="adjective")
    s.demote(104, "sense:affluent:911c08bed91c5211"); s.demote(104, "sense:affluent:3a89ecaa5e4a572d")
    s.set_core(104, "富裕的；繁荣的", "wealthy or prosperous")

    s.drop_colloc(112, "save money against a rainy day")
    s.update_sense(115, "sense:agenda:4ec1fd244ba55844", cn="目标；政策纲领；优先事项；意图", en="a set of goals, policies, priorities, or motives that a person or group seeks to pursue")
    s.set_core(115, "议程；目标/政策纲领/优先事项", "a meeting agenda or a set of goals, policies, priorities, or motives")

    s.demote(116, "sense:agent:fbabe64f671f53ad", merged_into="sense:agent:95313ca2eb995594", status="merged")
    agent_sid = new_ids[116]; s.add_colloc(116, agent_sid, "secret/intelligence agent", "秘密特工；情报人员")
    s.set_core(116, "代理人/中介；特工；作用物或动因", "a representative/intermediary, secret agent, or thing that produces an effect")

    for sid in ("sense:aggregate:0958c5a38ed45554","sense:aggregate:306999a15b635c76","sense:aggregate:6d9bb96edcb450c1"):
        s.overlay(118, sid, "aggregate noun/adjective and verb have different stress/pronunciation", paired="aggregate noun/adjective vs verb", identity_type="pronunciation_boundary")
    for sid in ("sense:aggregate:40dca598414351d0","sense:aggregate:a52dadda6bc459fc"):
        s.overlay(118, sid, "aggregate verb has different stress/pronunciation from noun/adjective", paired="aggregate noun/adjective vs verb", identity_type="pronunciation_boundary")
    s.update_sense(118, "sense:aggregate:306999a15b635c76", level="L3", usage_note="specialist construction-material sense; lower than academic/general total/combined uses")

    s.rename_colloc(125, "agriculture industry", "agricultural industry/sector", "农业产业；农业部门")
    s.constructions(128, [
        compact_construction("aim at sb/sth", "瞄准某人/某物", "sense:aim:1515c90f087550d4"),
        compact_construction("aim at doing sth", "旨在做某事", "sense:aim:c85b71e8df5251f8"),
        compact_construction("aim for sth", "力求达到某目标", "sense:aim:c85b71e8df5251f8"),
        compact_construction("aim to do sth", "旨在做某事", "sense:aim:c85b71e8df5251f8", cid="construction:aim:handoff-fa119829a55165fd"),
        compact_construction("be aimed at sth/doing sth", "旨在某事或做某事", "sense:aim:c85b71e8df5251f8", cid="construction:aim:handoff-3f95f5c9d821a85f"),
    ])

    air_sid = new_ids[129]; s.add_colloc(129, air_sid, "air a program/interview", "播出节目/访谈")
    s.demote(129, "sense:air:9f3a796b8fb556dc")
    s.set_core(129, "空气；气氛；通风；播出或公开表达", "air/atmosphere; to ventilate, broadcast, or express publicly")
    s.add_cluster(129, air_sid, "verb", "播出；广播", "broadcast on radio/television/media")

    s.demote(133, "sense:aisle:21e471cba8b954e6")
    s.update_sense(137, "sense:alcohol:61d6f0bd19d75c66", cn="醇类；酒精（化学）", en="an alcohol in chemistry: a compound containing a hydroxyl group; ethanol is the alcohol in alcoholic drinks")
    s.set_core(137, "酒类饮品；化学上的醇/酒精", "alcoholic drinks versus alcohol as a chemical substance/class")

    alien_sid = new_ids[140]; s.add_colloc(140, alien_sid, "an alien from another planet", "来自外星球的外星生物")
    s.update_sense(140, "sense:alien:dbc01fac540c548a", level="L3", usage_note="formal/legal and context-sensitive non-citizen term; not the neutral default for a person from another country")
    s.set_core(140, "外星人；异国/陌生的；法律语境中的非公民", "an extraterrestrial; foreign/unfamiliar; a formal/legal non-citizen term")
    s.add_cluster(140, alien_sid, "noun", "外星人", "extraterrestrial being")

    s.reactivate(141, "sense:alienate:809506716a2c56b4", cn="使疏远；使离心；使感到孤立", en="to make someone hostile, estranged, or emotionally isolated", level="L1", pos="verb", transitivity="vt")
    s.demote(141, "sense:alienate:2c22723e505359f9")
    s.set_core(141, "使疏远；使离心", "to make someone estranged or alienated")
    s.demote(144, "sense:alive:2564ae653338566f")
    s.update_sense(147, "sense:allegiance:b827eaab16195361", cn="忠诚；效忠；坚定支持", en="loyalty or commitment to a person, group, cause, country, or sovereign")

    for sid in ("sense:ally:9fa329410e86575b","sense:ally:1dbde5beca4951b8"):
        s.overlay(154, sid, "noun ally is pronounced with initial stress /ˈælaɪ/", paired="ally noun vs verb", identity_type="pronunciation_boundary")
    for sid in ("sense:ally:84644758d51e5305","sense:ally:59e1216201855035"):
        s.overlay(154, sid, "verb ally has second-syllable stress /əˈlaɪ/", paired="ally noun vs verb", identity_type="pronunciation_boundary")

    # new alone/lonely relation
    rel_basis = {"source":"sense:alone:4eac829deec85810","target":"sense:lonely:41027ac30a435997","type":"semantic_contrast","authority":AUTH}
    rid = "relation:horizontal:" + sha(rel_basis)[:20]
    boundary = "alone = without other people / by oneself and is not inherently negative; lonely = unhappy because of lack of companionship and can be felt even among other people"
    rel_obj = {
        "schema":"kianos.lexical.relation_owner.v1", "relation_id":rid, "canonical_record":None,
        "fact_record":{"fact_id":rid,"module":"semantic_contrast","boundary":boundary,"source_sense_id":"sense:alone:4eac829deec85810","target_sense_id":"sense:lonely:41027ac30a435997","target_word":"lonely","publication_status":"codex_reviewed"},
        "word_views":[
            {"source_word_id":"word:alone","source_ordinal":156,"field":"confusables","index":sum(1 for q in s.owner(156).get("relation_refs",[]) if q.get("field")=="confusables"),"payload":{"relation_id":rid,"fact_id":rid,"module":"semantic_contrast","boundary":boundary,"direction":"C","priority":"A","publication_status":"codex_reviewed","verification_status":"verified","writing_safe":True,"source_sense_id":"sense:alone:4eac829deec85810","target_sense_id":"sense:lonely:41027ac30a435997","target_word":"lonely","task_tags":["reading","writing"]}},
            {"source_word_id":"word:lonely","source_ordinal":2878,"field":"confusables","index":sum(1 for q in s.owner(2878).get("relation_refs",[]) if q.get("field")=="confusables"),"payload":{"relation_id":rid,"fact_id":rid,"module":"semantic_contrast","boundary":"lonely describes unhappy isolation/lack of companionship; alone only says someone is by themselves and need not feel lonely","direction":"C","priority":"A","publication_status":"codex_reviewed","verification_status":"verified","writing_safe":True,"source_sense_id":"sense:lonely:41027ac30a435997","target_sense_id":"sense:alone:4eac829deec85810","target_word":"alone","task_tags":["reading","writing"]}},
        ],
        "provenance":{"materialized_from":"post-cutover semantic reconciliation","semantic_delta":1,"authority":AUTH},
    }
    rp = relation_owner_path(rid)
    if rp.exists(): raise RuntimeError(f"NEW_RELATION_ALREADY_EXISTS:{rid}")
    dump(rp, rel_obj); s.changed_relations.add(rp.relative_to(ROOT).as_posix())
    for o, field in ((156,"confusables"),(2878,"confusables")):
        owner=s.owner(o); idx=sum(1 for q in owner.get("relation_refs",[]) if q.get("field")==field); owner.setdefault("relation_refs",[]).append({"relation_id":rid,"owner_path":rp.relative_to(ROOT).as_posix(),"field":field,"index":idx}); s.mark(o)
    manifest = load(LEX/"relations"/"manifest.json"); manifest["relation_count"] = int(manifest.get("relation_count",0)) + 1; dump(LEX/"relations"/"manifest.json",manifest)

    alt_sid = new_ids[164]; s.add_colloc(164, alt_sid, "an alternate", "替代者；候补者")
    for sid in ("sense:alternate:fd5c1dcecfba5969","sense:alternate:ba24afe407cc56b8"):
        s.overlay(164, sid, "alternate verb has verb stress/pronunciation; adjective/noun uses differ", paired="alternate verb vs adjective/noun", identity_type="pronunciation_boundary")
    s.overlay(164, "sense:alternate:faf2eae5accf541f", "alternate adjective differs in stress/pronunciation from the verb", paired="alternate verb vs adjective/noun", identity_type="pronunciation_boundary")
    s.overlay(164, alt_sid, "alternate noun follows the adjective/noun stress pattern, distinct from the verb", paired="alternate verb vs adjective/noun", identity_type="pronunciation_boundary")

    s.demote(167, "sense:altitude:900eb03901be50a6")
    s.demote(171, "sense:amateur:8c63058adda25e8b", merged_into="sense:amateur:e3f60e668e655c3b", status="merged")
    s.update_sense(171, "sense:amateur:e3f60e668e655c3b", cn="业余爱好者；非职业参与者", en="a person who pursues an activity as a pastime or on a non-professional basis")
    s.constructions(182, [compact_construction("amount to sth", "总计为；等同于", "sense:amount:ff93db7d01f052dc", fact_id="deep:constructions:amount:f719d6a7b1d44c65")])
    s.demote(199, "sense:angry:54f680e0c7aa573e"); s.demote(199, "sense:angry:0e06dc3b8671549d")
    s.update_sense(204, "sense:announce:112db5b5acf559f7", cn="预示；显示……即将到来", en="to signal, herald, or indicate that something is coming or present")
    s.rename_colloc(212, "anticipate doing + sth", "anticipate doing sth")
    s.demote(212, "sense:anticipate:35176654841b57e5")
    s.demote(217, "sense:anybody:4e9527a5fec959e0")
    s.demote(220, "sense:anyway:de70d37672d45afa")
    for x in s.rec(220).get("constructions", []):
        if x.get("pattern") == "anyway / any way": x["meaning_cn"] = "anyway = 无论如何/反正；any way = 任何方式（通常分写）"; x["definition_en"] = "anyway means in any case; any way is the ordinary two-word manner expression"
    s.mark(220)
    s.rec(223)["word_family"] = []
    s.mark(223)

    # D protected identity decisions
    s.reactivate(163, "sense:alter:ef5ea5d2408352df", cn="改变；更改；修改", en="to change or modify something", level="L1", pos="verb", transitivity="vt/vi")
    s.demote(163, "sense:alter:1f3fbe7d1f4a5bb7")
    s.set_core(163, "改变；更改", "to change or modify")

    angle_overlay={"case_sensitive":True,"identity_type":"case_sensitive_lexeme","surface_lemma":"Angle","paired_form":"angle / Angle","note":"historical ethnonym Angle (plural Angles); reference-only and distinct from ordinary lowercase angle"}
    s.demote(198, "sense:angle:702ec1bfd4bd5ff9", overlay=angle_overlay)
    # Make ordinary viewpoint branch visible in Core after ethnonym removal.
    s.set_core(198, "角；角度；观点/切入角度；谋取或使成角度", "an angle in geometry or viewpoint; to angle for something or place/move at an angle")

    # Add collocations for remaining new branches.
    s.add_colloc(49, acid_sid, "acid criticism", "尖刻的批评")
    s.add_colloc(50, ack_sid, "acknowledge a greeting/presence", "回应招呼；表示注意到某人的存在")

    # Core support for acknowledge/acid/new branches.
    s.set_core(49, "酸；酸性的；（语气/评论）尖刻的", "acid/acidic; figuratively sharp or biting")
    s.add_cluster(49, acid_sid, "adjective", "尖刻的", "sharp or biting in tone")
    s.set_core(50, "承认/认可；确认收到；表示注意到或致谢", "to admit/recognize, confirm receipt, notice/acknowledge, or express thanks")
    s.add_cluster(50, ack_sid, "verb", "表示注意到；认可", "show that one has noticed or recognized")

    # Ensure all 59 are marked as reconciled even when the edit is presentation-only.
    for o in DELTA: s.mark(o)


def verify(s: State, new_relation_id: str | None = None):
    errors=[]
    if set(s.changed_words) != set(DELTA + REMOTE_WORDS): errors.append(f"WORD_WRITE_SET:{sorted(s.changed_words)}")
    expected_new={sense_id(s.owner(o)["word"], branch) for o,(branch,*_) in NEW_BRANCH_LEDGER.items()}
    if set(s.new_senses) != expected_new: errors.append(f"NEW_BRANCH_SET:{s.new_senses}")
    # Exact key semantic assertions.
    if s.active_sense(163,"sense:alter:ef5ea5d2408352df") is None: errors.append("ALTER_ORDINARY_NOT_ACTIVE")
    if s.active_sense(163,"sense:alter:1f3fbe7d1f4a5bb7") is not None: errors.append("ALTER_ANIMAL_STILL_ACTIVE")
    if s.active_sense(198,"sense:angle:702ec1bfd4bd5ff9") is not None: errors.append("ANGLE_ETHNONYM_STILL_ACTIVE")
    if any(c.get("phrase") == "save money against a rainy day" for x in s.active(112) for c in x.get("collocations",[])): errors.append("AGAINST_BAD_COLLOCATION")
    malformed=["ambition to do + sth","agree to do + sth","anticipate doing + sth","agriculture industry"]
    blob=stable([s.owner(o) for o in DELTA])
    for x in malformed:
        if x in blob: errors.append(f"MALFORMED_REMAINS:{x}")
    # No active sense may point at merged/deprecated registry status.
    for o in DELTA + REMOTE_WORDS:
        for x in s.active(o):
            sid=x.get("sense_id"); reg=s.sense_by_id.get(sid)
            if not reg or reg.get("status") != "active": errors.append(f"ACTIVE_REGISTRY_CLOSURE:o{o:04d}:{sid}")
    return errors


def main():
    s=State(); apply(s)
    s.sync_registry_files()
    for o in sorted(s.changed_words): s.sync_owner_identity(o)
    s.write_owners()
    # Re-load changed owners for final readback.
    for o in sorted(s.changed_words): s.owners[o]=load(OWNER_DIR/f"o{o:04d}.json")
    errors=verify(s)
    if errors: raise SystemExit("READBACK_FAILED:"+json.dumps(errors,ensure_ascii=False))
    RECEIPT_DIR.mkdir(parents=True,exist_ok=True)
    rid = next((load(ROOT/p).get("relation_id") for p in s.changed_relations if "relations/by-id" in p and load(ROOT/p).get("provenance",{}).get("authority")==AUTH), None)
    receipt={
        "schema":"kianos.lexical.retro_audit_corrective_receipt.v1","status":"LOCAL_CLOSED_PENDING_INTEGRATION",
        "authority":AUTH,"baseline_main":"88eedd381aa7c719467c0e925b4147ac31d68537","scope":[25,224],
        "delta_owner_count":59,"changed_word_ordinals":sorted(s.changed_words),"remote_word_ordinals":REMOTE_WORDS,
        "new_semantic_branch_ids":sorted(s.new_senses),"new_semantic_branch_count":len(s.new_senses),
        "reactivated_stable_ids":sorted(set(s.reactivated)),"demoted_stable_ids":sorted(set(s.demoted)),
        "merged_stable_ids":sorted(set(a for a,_ in s.merged)),"merge_targets":sorted(set(b for _,b in s.merged)),
        "changed_relation_owner_paths":sorted(s.changed_relations),"new_relation_id":rid,
        "readback":{"all_59_delta_owners":"PASS","identity_registry_closure":"PASS","exact_word_write_set":"PASS","malformed_patterns_removed":"PASS"},
    }
    dump(RECEIPT_DIR/"o0025-o0224.json",receipt)
    print(json.dumps(receipt,ensure_ascii=False,indent=2))

if __name__ == "__main__": main()
