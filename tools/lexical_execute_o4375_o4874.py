#!/usr/bin/env python3
"""Issue #234 — continuous/resumable o4375-o4874 package executor.

Semantic authority is frozen in content/lexical/semantic-reconciliation/o4375-o4874.md.
The Chat-level work unit is the whole 500-owner package. Internal 50-owner boundaries
are receipt/rollback checkpoints only.

Until the execution manifest is fully compiled, default execution is fail-closed.
Use --preflight to serialize Current identity evidence for all 161 semantic source
owners plus the exact five authorized remote Word endpoints in one pass.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LEX = ROOT / "content" / "lexical"
OWNER_DIR = LEX / "words" / "by-ordinal"
AUTHORITY = "content/lexical/semantic-reconciliation/o4375-o4874.md"
ISSUE = 234
PACKAGE = (4375, 4874)
SOURCE_OWNERS = (
4375,4376,4385,4388,4392,4396,4397,4400,4401,4402,4403,4409,4410,4412,4414,4423,
4425,4430,4432,4433,4434,4435,4438,4440,4442,4445,4452,4460,4462,4469,4472,4474,
4484,4487,4489,4490,4493,4496,4499,4503,4511,4512,4514,4517,4521,4524,
4528,4530,4533,4534,4542,4546,4553,4560,4561,4565,4567,4571,4572,4573,4576,4579,
4582,4583,4586,4588,4589,4595,4597,4598,4599,4603,4607,4612,4616,4617,4620,4621,4623,4624,
4628,4629,4633,4634,4638,4641,4642,4644,4650,4654,4661,4664,4666,4674,
4681,4682,4683,4684,4690,4691,4692,4693,4700,4701,4703,4705,4708,4712,4714,4716,4717,4718,4719,4721,4723,
4731,4734,4740,4742,4745,4747,4748,4749,4750,4752,4762,4763,4766,4768,4769,
4778,4782,4785,4786,4793,4795,4796,4798,4799,4801,4807,4810,4811,4815,4821,4824,
4825,4826,4828,4829,4841,4842,4845,4850,4852,4853,4855,4856,4864,4867,4869,
)
REMOTE_WORDS = (1399, 1846, 2470, 3485, 4115)
RECEIPT_COUNTS = (
    (4375, 4424, 16), (4425, 4474, 16), (4475, 4524, 14),
    (4525, 4574, 14), (4575, 4624, 20), (4625, 4674, 14),
    (4675, 4724, 21), (4725, 4774, 15), (4775, 4824, 16),
    (4825, 4874, 15),
)


def load_owner(o: int) -> dict:
    path = OWNER_DIR / f"o{o:04d}.json"
    if not path.exists():
        raise RuntimeError(f"OWNER_MISSING o{o:04d}")
    return json.loads(path.read_text(encoding="utf-8"))


def compact_owner(o: int) -> dict:
    owner = load_owner(o)
    rec = owner.get("record", {})
    return {
        "ordinal": o,
        "word_id": owner.get("word_id"),
        "word": owner.get("word"),
        "core_concept": rec.get("core_concept"),
        "active_senses": rec.get("senses", []),
        "reference_senses": owner.get("reference_senses", []),
        "identity_refs": owner.get("identity_refs", {}),
        "relation_refs": owner.get("relation_refs", []),
        "form_identity": rec.get("form_identity"),
        "constructions": rec.get("constructions", []),
        "word_family": rec.get("word_family", []),
        "semantic_neighbors": rec.get("semantic_neighbors", []),
        "confusables": rec.get("confusables", []),
        "secondary_senses": rec.get("secondary_senses", []),
        "exam_paraphrases": rec.get("exam_paraphrases", []),
        "lookup_refs": owner.get("lookup_refs", []),
    }


def preflight(output: Path) -> None:
    if len(SOURCE_OWNERS) != 161 or len(set(SOURCE_OWNERS)) != 161:
        raise RuntimeError("SOURCE_OWNER_CONTRACT_DRIFT")
    if REMOTE_WORDS != (1399, 1846, 2470, 3485, 4115):
        raise RuntimeError("REMOTE_OWNER_CONTRACT_DRIFT")
    if sum(x[2] for x in RECEIPT_COUNTS) != 161:
        raise RuntimeError("RECEIPT_COUNT_CONTRACT_DRIFT")
    owners = [compact_owner(o) for o in SOURCE_OWNERS + REMOTE_WORDS]
    payload = {
        "schema": "kianos.lexical.execution_identity_preflight.v2",
        "status": "READ_ONLY_CURRENT_EVIDENCE",
        "issue": ISSUE,
        "authority": AUTHORITY,
        "package_range": list(PACKAGE),
        "source_owner_count": len(SOURCE_OWNERS),
        "source_owners": list(SOURCE_OWNERS),
        "remote_word_dependencies": list(REMOTE_WORDS),
        "identity_owner_count": len(owners),
        "internal_receipt_counts": [list(x) for x in RECEIPT_COUNTS],
        "owners": owners,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"PREFLIGHT_PASS identity_owners={len(owners)} sources={len(SOURCE_OWNERS)} remotes={len(REMOTE_WORDS)} output={output.relative_to(ROOT)}")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--preflight", type=Path)
    args = ap.parse_args()
    if args.preflight:
        preflight(args.preflight)
        return
    raise SystemExit("EXECUTOR_NOT_FINALIZED: run --preflight; package execution remains fail-closed")


if __name__ == "__main__":
    main()
