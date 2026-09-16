#!/usr/bin/env python3
"""Materialize three already-authorized stable senses exposed by full-catalog K readback.

Issue #56 found three Current owners whose accepted semantic truth was present in Core/
registry/reconciliation but absent from learner-active record.senses.  This script does
not re-review semantics.  It reuses the exact stable sense IDs authorized by existing
Sol/Production authority and rebuilds only those three Natural Owners.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LEX = ROOT / "content" / "lexical"
OWNER_DIR = LEX / "words" / "by-ordinal"
RECEIPT = LEX / "acceptance" / "full-catalog-k-materialization-corrections.json"

sys.path.insert(0, str(ROOT / "tools"))
import lexical_apply_o1625_o1874 as base
import lexical_package_runtime as rt
import lexical_natural_owner as natural_owner

AUTHORITY = {
    3375: "content/lexical/semantic-reconciliation/o3375-o3624.md",
    4115: "content/lexical/semantic-review/o3875-o4124.md + content/lexical/semantic-reconciliation/o3875-o4124.md",
    5902: "content/lexical/semantic-reconciliation/o5875-o6374.md",
}

EXPECTED = {
    3375: ["sense:organise:e9ef3e3d19c85ccc"],
    4115: ["sense:resolve:4028746977a356ee", "sense:resolve:ed4cfc3470ef52c6"],
    5902: ["sense:installment:3b9b952ed4ca5dec", "sense:installment:98056734eefb5616"],
}


def active_ids(store, ordinal: int) -> set[str]:
    return {str(x.get("sense_id")) for x in store.record(ordinal).get("senses", []) if x.get("sense_id")}


def main() -> None:
    store = base.Store()

    # organise@o3375 — Sol explicitly requires the historical ordinary arrange/plan
    # branch to be learner-main while preserving the separate organize owner.
    store.put_existing(
        3375,
        "sense:organise:e9ef3e3d19c85ccc",
        cn="组织；安排；筹划",
        en="to arrange, plan, or structure something systematically",
        pos="verb",
        level="L1",
    )
    rt.rebuild_core_from_active(
        store,
        3375,
        cn="组织；安排",
        en="to arrange, plan, or structure something systematically",
    )

    # resolve@o4115 — Production requires both ordinary stable verb branches.
    store.put_existing(
        4115,
        "sense:resolve:4028746977a356ee",
        cn="解决（问题、困难等）",
        en="to find a solution to a problem or difficulty",
        pos="verb",
        level="L1",
    )
    store.put_existing(
        4115,
        "sense:resolve:ed4cfc3470ef52c6",
        cn="决心；决定",
        en="to make a firm decision to do something",
        pos="verb",
        level="L1",
        pattern="resolve to do sth",
    )
    rt.rebuild_core_from_active(
        store,
        4115,
        cn="解决；决心",
        en="to solve a problem or make a firm decision",
    )

    # installment@o5902 — Sol freezes the payment + serial shared truth with
    # instalment@o2567.  Both stable local branches already exist in registry.
    store.put_existing(
        5902,
        "sense:installment:3b9b952ed4ca5dec",
        cn="分期付款；分期部分",
        en="one of the parts into which a debt is divided for payment at intervals",
        pos="noun",
        level="L1",
    )
    store.put_existing(
        5902,
        "sense:installment:98056734eefb5616",
        cn="连续故事、节目等的一集/一部分",
        en="one part of a published serial, story, program, or broadcast",
        pos="noun",
        level="L2",
    )
    rt.rebuild_core_from_active(
        store,
        5902,
        cn="分期付款；（连载故事、节目等的）一集/一部分",
        en="an installment payment or one part of a serial, story, program, or broadcast",
    )

    for ordinal, expected in EXPECTED.items():
        actual = active_ids(store, ordinal)
        missing = set(expected) - actual
        if missing:
            raise RuntimeError(f"AUTHORIZED_ACTIVE_SENSE_NOT_MATERIALIZED o{ordinal:04d} missing={sorted(missing)}")

    changed = set(store.changed_word_ordinals)
    if changed != set(EXPECTED):
        raise RuntimeError(f"UNEXPECTED_WORD_WRITE_SET expected={sorted(EXPECTED)} actual={sorted(changed)}")

    store.finalize()
    natural, relations, report = natural_owner.build()
    if report.get("status") != "PASS":
        raise RuntimeError("NATURAL_OWNER_AUDIT_FAILED:" + json.dumps(report, ensure_ascii=False))

    for ordinal in sorted(changed):
        natural_owner.dump_json(OWNER_DIR / f"o{ordinal:04d}.json", natural[ordinal])
        final_ids = {str(x.get("sense_id")) for x in natural[ordinal]["record"].get("senses", []) if x.get("sense_id")}
        if not set(EXPECTED[ordinal]).issubset(final_ids):
            raise RuntimeError(f"NATURAL_OWNER_ACTIVE_SENSE_MISSING o{ordinal:04d} expected={EXPECTED[ordinal]} actual={sorted(final_ids)}")

    RECEIPT.parent.mkdir(parents=True, exist_ok=True)
    RECEIPT.write_text(json.dumps({
        "schema": "kianos.lexical.full_catalog_k_materialization_corrections.v1",
        "issue": 56,
        "status": "PASS",
        "semantic_reaudit": False,
        "changed_word_ordinals": sorted(changed),
        "remote_word_writes": [],
        "authority": {f"o{o:04d}": AUTHORITY[o] for o in sorted(AUTHORITY)},
        "reactivated_stable_sense_ids": {f"o{o:04d}": EXPECTED[o] for o in sorted(EXPECTED)},
        "reason": "full-catalog integrated readback found accepted stable truth present in registry/Core authority but absent from learner-active Natural Owner senses"
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print("FULL_CATALOG_K_MATERIALIZATION_CORRECTIONS_PASS", sorted(changed))


if __name__ == "__main__":
    main()
