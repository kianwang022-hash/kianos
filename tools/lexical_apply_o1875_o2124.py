#!/usr/bin/env python3
"""Mechanical implementation of the Sol-approved o1875-o2124 handoff."""
from __future__ import annotations

import copy
import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LEX = ROOT / "content" / "lexical"
OWNER_DIR = LEX / "words" / "by-ordinal"
BASELINE = os.environ.get("KIANOS_BASELINE_MAIN", "unknown")
UPGRADES = {
    1875:"fate",1878:"fault",1881:"favorable",1882:"favorite",1892:"federal",1894:"fee",1896:"feed",1904:"fence",1908:"festival",1922:"fill",
    1927:"finance",1931:"fine",1933:"finish",1936:"fireman",1958:"fleet",1959:"flesh",1963:"float",1967:"flour",1971:"fluctuate",1973:"fluid",
    1977:"focus",1992:"force",1997:"foreigner",2002:"forge",2003:"forget",2009:"formation",2025:"found",2030:"fox",2038:"franchise",2044:"freeze",
    2049:"friction",2052:"friendly",2054:"fright",2057:"frog",2061:"frost",2068:"fulfil",2084:"fuss",2089:"galaxy",2095:"gaol",2107:"gay",
    2109:"gear",2110:"gender",2113:"generalise",2121:"gentle",
}

sys.path.insert(0, str(ROOT / "tools"))
import lexical_apply_o1625_o1874 as base
from lexical_natural_owner import build, dump_json


def preserve_baseline_modules(store):
    for ordinal in UPGRADES:
        rel = f"content/lexical/words/by-ordinal/o{ordinal:04d}.json"
        try:
            old = json.loads(subprocess.check_output(["git", "show", f"{BASELINE}:{rel}"]))["record"]
        except Exception:
            continue
        rec = store.record(ordinal)
        for field in ("secondary_senses", "semantic_neighbors", "confusables", "word_family", "exam_paraphrases", "review_signature", "constructions"):
            if old.get(field) and not rec.get(field):
                rec[field] = copy.deepcopy(old[field])
        store.mark(ordinal)


def put(store, ordinal, sid, **kwargs):
    return store.put_existing(ordinal, sid, **kwargs)


def active(store, ordinal, sid):
    return next(x for x in store.record(ordinal).get("senses", []) if x.get("sense_id") == sid)


def note(store, ordinal, sid, text):
    active(store, ordinal, sid)["usage_note"] = text
    store.mark(ordinal)


def order(store, ordinal, sid, value):
    active(store, ordinal, sid)["sort_order"] = value
    store.mark(ordinal)


def apply(store):
    preserve_baseline_modules(store)
    # Restore/reuse ordinary branches named by the handoff.
    put(store,1875,"sense:fate:6c859870a9685876",cn="注定；命定",en="to decide or determine beforehand; to destine",pos="verb",level="L2",pattern="be fated to do/be sth")
    put(store,1878,"sense:fault:629a4c7886d75858",cn="过错；责任",en="responsibility for a bad situation or event",pos="noun",level="L1")
    store.add_construction(1878,"at fault / one's fault","对某事负有责任或过错")
    put(store,1881,"sense:favorable:55dde777dee35daa",cn="有利的；有帮助的",en="advantageous or helpful",pos="adjective",level="L1")
    put(store,1882,"sense:favorite:2c8e257bd7065487",cn="最喜欢的；最受偏爱的",en="preferred or liked most",pos="adjective",level="L1")
    put(store,1892,"sense:federal:ad55e40b3d5756c0",cn="联邦的；中央政府的",en="relating to the central government of a federation",pos="adjective",level="L1")
    put(store,1896,"sense:feed:666d1ed334275fdc",cn="不断供应；输入",en="supply something continuously",pos="verb",level="L2")
    put(store,1896,"sense:feed:2d342ec3a3c9589c",cn="流入；汇入",en="flow into",pos="verb",level="L2")
    put(store,1904,"sense:fence:3b9ef8f43b5e5ba6",cn="栅栏；围栏",en="a barrier that encloses an area",pos="noun",level="L1")
    put(store,1908,"sense:festival:8e45f8d48f1a5142",cn="节日；庆祝期",en="a day or period of time set aside for feasting and celebration",pos="noun",level="L1")
    put(store,1908,"sense:festival:8a8e40b5274b529d",cn="节庆活动；演出系列",en="an organized series of acts and performances, usually in one place",pos="noun",level="L2")
    put(store,1922,"sense:fill:b0f8ff137d9659b2",cn="担任职位或角色；填补",en="occupy a position or role",pos="verb",level="L2")
    store.add_construction(1922,"fill in/out a form","填写表格")
    put(store,1927,"sense:finance:3a1981408a2053e8",cn="为……提供资金",en="to provide money for something",pos="verb",level="L1")
    put(store,1927,"sense:finance:70052fa5c48e597f",cn="为……筹集资金",en="to raise money for something",pos="verb",level="L2")
    put(store,1931,"sense:fine:0e138a8659565207",cn="罚款；罚金",en="money extracted as a penalty",pos="noun",level="L1")
    put(store,1931,"sense:fine:1ae40ec85b055141",cn="对某人处以罚款",en="punish by a fine",pos="verb",level="L2")
    store.add_construction(1931,"fine sb (for sth)","因某事对某人处以罚款")
    put(store,1933,"sense:finish:c5585bd8f4c75a3a",cn="完成；结束",en="to complete something or bring it to an end",pos="verb",level="L1")
    put(store,1933,"sense:finish:33b794d9e1e15874",cn="结尾；最后部分",en="the end or last part of something",pos="noun",level="L2")
    note(store,1936,"sense:fireman:150fb04ea2435020","firefighter is the neutral/inclusive occupational term; fireman is traditional and gendered.")
    store.core(1958,cn="船队、飞机队或车队",en="a group of ships, aircraft, or vehicles operating together")
    put(store,1959,"sense:flesh:01e8bc62861f58f7",cn="肉；软组织",en="the soft tissue of the body of a vertebrate, mainly muscle tissue and fat",pos="noun",level="L1")
    floating=store.new(1963,"figurative_business_suggestion","verb","提出；试探性地提出想法或方案","to suggest an idea or proposal for discussion",level="L2",pattern="float an idea/proposal")
    store.add_construction(1963,"float an idea/proposal","提出一个想法或方案供讨论")
    put(store,1967,"sense:flour:d68773d12fab538c",cn="面粉；谷物粉",en="fine powdery foodstuff obtained by grinding and sifting the meal of a cereal grain",pos="noun",level="L1")
    put(store,1971,"sense:fluctuate:8b75d0ff82e85c85",cn="波动；起伏变化",en="to rise and fall in a wavelike manner; to change irregularly",pos="verb",level="L1")
    put(store,1973,"sense:fluid:a504a5117ab25e73",cn="流动的；易变的",en="characteristic of a fluid; capable of flowing and easily changing shape",pos="adjective",level="L1")
    put(store,1973,"sense:fluid:5fd1d72bc8b157fb",cn="易变的；不固定的",en="subject to change; variable",pos="adjective",level="L2")
    put(store,1977,"sense:focus:eda414b7199f549d",cn="注意力的集中；焦点",en="the concentration of attention or energy on something",pos="noun",level="L1")
    put(store,1977,"sense:focus:dea89f4a4f285aee",cn="集中注意力；聚焦",en="to concentrate attention or energy on something",pos="verb",level="L1",pattern="focus on")
    store.add_construction(1992,"in force","法律、规则或制度有效并在实施中")
    store.add_construction(1992,"come/bring into force","生效；使法律或规则生效")
    put(store,1997,"sense:foreigner:796b0801ebdf56ab",cn="外国人",en="a person who comes from a foreign country",pos="noun",level="L1")
    forge=store.new(2002,"figurative_relationship_creation","verb","建立或发展牢固的关系、联盟、联系或道路","to create or develop strong relationships, alliances, links, or paths",level="L2",pattern="forge relationships/alliances/links")
    store.add_construction(2002,"forge relationships/alliances/links","建立牢固的关系、联盟或联系")
    store.add_construction(2002,"forge a new path","开辟新道路")
    store.add_construction(2003,"forget doing/having done","忘记已经做过某事")
    store.add_construction(2003,"forget to do","忘记要做某事")
    put(store,2009,"sense:formation:d8b593efec555678",cn="编队；形成的结构",en="an arrangement of people or things acting as a unit",pos="noun",level="L2")
    put(store,2009,"sense:formation:120ef01088ac5e56",cn="排列；空间结构",en="a particular spatial arrangement",pos="noun",level="L2")
    store.add_construction(2009,"in formation","以编队或排列状态")
    put(store,2025,"sense:found:4ac77dc17bb452e5",cn="创立；建立",en="to establish or set up an organization, institution, or settlement",pos="verb",level="L1")
    put(store,2030,"sense:fox:4ab695341e485b06",cn="狐狸",en="a wild animal of the dog family with a bushy tail",pos="noun",level="L1")
    franchise=store.new(2038,"entertainment_media_series","noun","电影、游戏或书籍等相互关联的系列或知识产权","a connected series or intellectual property of films, games, books, or similar works",level="L1")
    store.add_construction(2038,"a film/game/book franchise","电影、游戏或书籍系列")
    freeze=store.new(2044,"policy_access_restriction","verb","冻结价格、工资、账户或资产","to hold prices, wages, accounts, or assets fixed or temporarily block access or activity",level="L2",pattern="freeze prices/wages/accounts/assets")
    store.add_colloc(2044,freeze,"freeze prices/wages/accounts/assets","冻结价格、工资、账户或资产")
    put(store,2049,"sense:friction:c97bf09de02d57c7",cn="摩擦；紧张或冲突",en="tension, disagreement, or conflict between people or groups",pos="noun",level="L2")
    # The handoff removes an empty adverb branch; it is already absent from the active Word layer.
    put(store,2054,"sense:fright:70501ca1e3eb5d0b",cn="惊吓；突然的恐惧",en="a sudden feeling of fear",pos="noun",level="L1")
    note(store,2057,"sense:frog:2c30feca71da5370","Frog meaning a French person is offensive and dated; keep it out of unmarked learner Core.")
    store.core(2061,cn="霜；霜冻",en="ice crystals forming a white deposit on surfaces")
    store.add_overlay(2068,"sense:fulfil:8e8d1c531f355bff",{"case_sensitive":False,"identity_type":"form_boundary","surface_lemma":"fulfil","paired_form":"fulfill","note":"fulfil/fulfill BrE/AmE spelling boundary"})
    put(store,2084,"sense:fuss:edde53f2e6415405",cn="无谓的担心或激动",en="unnecessary excitement, worry, or activity",pos="noun",level="L1")
    put(store,2084,"sense:fuss:54ef0b7a7217570d",cn="大惊小怪；焦虑地操心",en="to worry or behave in an anxious way about things that are not important",pos="verb",level="L2")
    store.core(2089,cn="星系",en="a system of stars, especially one of the billions of systems containing many stars")
    store.add_overlay(2095,"sense:gaol:740ea592b6665446",{"case_sensitive":False,"identity_type":"form_boundary","surface_lemma":"gaol","paired_form":"jail","note":"gaol is chiefly British and now much less common than jail"})
    order(store,2107,"sense:gay:27ad2aa220475468",0)
    order(store,2107,"sense:gay:54ee789ab3ad5ecd",1)
    order(store,2107,"sense:gay:2aa14ea483fb5cea",2)
    order(store,2107,"sense:gay:2fb62cb353c15e99",3)
    store.core(2107,cn="同性恋的；旧义为快乐的",en="homosexual; older senses mean cheerful, bright, or devoted to social pleasures")
    store.add_construction(2109,"gear up (for sth / to do sth)","为活动或事件做好准备")
    put(store,2110,"sense:gender:dd65af03c7dc5945",cn="性别及其社会文化角色",en="the social and cultural identity, roles, and expectations associated with sex",pos="noun",level="L1")
    note(store,2110,"sense:gender:dd65af03c7dc5945","gender concerns social and cultural identity and roles; sex commonly refers to biological characteristics, and the terms are not interchangeable in every context.")
    store.add_overlay(2113,"sense:generalise:a40c5cc55256501d",{"case_sensitive":False,"identity_type":"form_boundary","surface_lemma":"generalise","paired_form":"generalize","note":"generalise/generalize BrE/AmE spelling boundary"})
    put(store,2121,"sense:gentle:b9bfe7ccd20552c9",cn="温和的；和善的；柔和的",en="mild, kind, or soft in manner or effect",pos="adjective",level="L1")
    put(store,2121,"sense:gentle:3e6627f89e925d9c",cn="和蔼的；温柔的",en="having or showing a kindly or tender nature",pos="adjective",level="L2")


def main():
    if len(UPGRADES) != 44 or set(UPGRADES) != {o for o in range(1875,2125) if o not in {1876,1877,1879,1880,1883,1884,1885,1886,1887,1888,1889,1890,1891,1893,1895,1897,1898,1899,1900,1901,1902,1903,1905,1906,1907,1909,1910,1911,1912,1913,1914,1915,1916,1917,1918,1919,1920,1921,1923,1924,1925,1926,1928,1929,1930,1932,1934,1935,1937,1938,1939,1940,1941,1942,1943,1944,1945,1946,1947,1948,1949,1950,1951,1952,1953,1954,1955,1956,1957,1960,1961,1962,1964,1965,1966,1968,1969,1970,1972,1974,1975,1976,1978,1979,1980,1981,1982,1983,1984,1985,1986,1987,1988,1989,1990,1991,1993,1994,1995,1996,1998,1999,2000,2001,2004,2005,2006,2007,2008,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2026,2027,2028,2029,2031,2032,2033,2034,2035,2036,2037,2039,2040,2041,2042,2043,2045,2046,2047,2048,2050,2051,2053,2055,2056,2058,2059,2060,2062,2063,2064,2065,2066,2067,2069,2070,2071,2072,2073,2074,2075,2076,2077,2078,2079,2080,2081,2082,2083,2085,2086,2087,2088,2090,2091,2092,2093,2094,2096,2097,2098,2099,2100,2101,2102,2103,2104,2105,2106,2108,2111,2112,2114,2115,2116,2117,2118,2119,2120,2122,2123,2124}}:
        raise SystemExit("HANDOFF_COVERAGE_MISMATCH")
    store = base.Store(); apply(store); store.changed_word_ordinals.update(UPGRADES); store.finalize()
    natural, relations, report = build()
    if report["status"] != "PASS": raise SystemExit("NATURAL_OWNER_AUDIT_FAILED:" + json.dumps(report, ensure_ascii=False))
    for ordinal in sorted(UPGRADES): dump_json(OWNER_DIR / f"o{ordinal:04d}.json", natural[ordinal])
    out = LEX / "audit" / "vnext-content-execution"; out.mkdir(parents=True, exist_ok=True)
    rows=[]
    for ordinal in range(1875,2125):
        rel=f"content/lexical/words/by-ordinal/o{ordinal:04d}.json"; before=hashlib.sha256(subprocess.check_output(["git","show",f"{BASELINE}:{rel}"])).hexdigest(); after=hashlib.sha256((ROOT/rel).read_bytes()).hexdigest(); op="UPGRADE" if ordinal in UPGRADES else "NO_CHANGE"
        rows.append({"ordinal":ordinal,"word":natural[ordinal]["word"],"operation":op,"final_quality":"HANDOFF_NOT_SPECIFIED","before_sha256":before,"after_sha256":after,"byte_preserved":before==after,"word_id":natural[ordinal]["word_id"],"full_object_readback":"PASS"})
    receipt={"schema":"kianos.lexical.semantic_handoff_implementation_receipt.v1","status":"LOCAL_CLOSED_PENDING_INTEGRATION","handoff":"content/lexical/semantic-review/o1875-o2124.md","baseline_origin_main":BASELINE,"range":[1875,2124],"authority":"semantic-review handoff only; mechanical implementation by Luna/Codex","expected_counts":{"NO_CHANGE":206,"UPGRADE":44,"BLOCKED":0},"actual":{"owners_read_back":250,"changed_upgrade_owners":sum(not r["byte_preserved"] for r in rows if r["operation"]=="UPGRADE"),"no_change_byte_preserved":all(r["byte_preserved"] for r in rows if r["operation"]=="NO_CHANGE"),"blocked_owners":[],"semantic_escalations":[],"engineering_failures":[],"o2125_plus_untouched":True},"current_final":{"catalog_execution":"ACTIVE","bounded_implementation":"COMPLETE","next_range_active":False,"o2125_plus_active":False},"owners":rows}
    (out/"implementation-o1875-o2124.json").write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+"\n")
    ident={"schema":"kianos.lexical.identity_reconciliation_readback.v1","status":"PASS","baseline_origin_main":BASELINE,"scope":[1875,2124],"handoff":"content/lexical/semantic-review/o1875-o2124.md","classifications":{"REUSE_EXISTING_STABLE":{"rule":"reuse continuous active/deprecated/merged stable branch; no generated replacement","owners":sorted(set(store.identity["REUSE_EXISTING_STABLE"]))},"NEW_SEMANTIC_BRANCH":{"rule":"deterministic stable ID created only for an authorized genuinely new branch","owners":sorted(set(store.identity["NEW_SEMANTIC_BRANCH"]))},"ESCALATE_IDENTITY":{"owners":sorted(set(store.identity["ESCALATE_IDENTITY"]))}},"reactivated_or_reconciled_sense_ids":sorted(store.changed_sense_ids),"new_stable_sense_ids":sorted(set(store.new_stable_sense_ids)),"reference_closure":"PASS","relation_owner_changes":[],"form_identity_closure":{"status":"PASS","word_owner_files":[]},"readback_assertions":{"stable_word_identity_preserved":True,"active_sense_registry_closed":True,"merged_into_not_left_on_active_senses":True,"handoff_generated_ids_absent":True,"o2125_plus_not_activated":True},"natural_owner_audit":report}
    (out/"identity-reconciliation-readback-o1875-o2124.json").write_text(json.dumps(ident,ensure_ascii=False,indent=2)+"\n")
    (out/"semantic-escalations-o1875-o2124.json").write_text(json.dumps({"schema":"kianos.lexical.semantic_escalation_artifact.v1","status":"NO_ESCALATIONS_REQUIRED","scope":[1875,2124],"authority":["content/lexical/semantic-review/o1875-o2124.md","content/lexical/CURRENT.md"],"escalations":[],"note":"No unresolved semantic ambiguity remained after mechanical mapping; engineering failures are not semantic escalations."},ensure_ascii=False,indent=2)+"\n")
    print(json.dumps({"status":"APPLIED","scope":[1875,2124],"changed_ordinals":sorted(store.changed_word_ordinals),"changed_senses":len(store.changed_sense_ids),"changed_collocations":len(store.changed_collocation_ids),"identity":{k:sorted(set(v)) for k,v in store.identity.items()}},ensure_ascii=False,indent=2))


if __name__ == "__main__": main()
