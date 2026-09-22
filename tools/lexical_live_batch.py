#!/usr/bin/env python3
"""Small fail-closed cursor transitions for the Lexical final-standard pipeline.

Semantic decisions stay in Production / Human Gate / B Audit.
This tool only validates and advances the compact live cursor.
"""
from __future__ import annotations

import argparse
import copy
import json
import re
from datetime import datetime, timezone
from pathlib import Path

SCHEMA = "kianos.lexical.live_batch.v1"
AUDIT_REQUEST_SCHEMA = "kianos.lexical.audit_result.v1"
DEFAULT_CURSOR = Path("content/lexical/execution/live-batch.json")
EXECUTABLE = {"MATERIALIZE_ALLOWED", "RECONCILE_ALLOWED", "AUDIT_CORRECTION_ALLOWED"}
GATE_OK = {"APPROVED", "NOT_REQUIRED"}
AUDIT_RESULTS = {"PASS", "PASS_WITH_CORRECTIONS", "HOLD_FOR_SOL"}


def require(ok, msg):
    if not ok:
        raise ValueError(msg)


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def save(path: Path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + "\n", encoding="utf-8")


def stamp():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def candidate_number(cid: str) -> int:
    m = re.fullmatch(r"BF(\d+)", str(cid))
    require(m is not None, "INVALID_CANDIDATE_ID")
    return int(m.group(1))


def validate_entry(entry, *, allow_review_placeholder=False):
    require(isinstance(entry, dict), "ENTRY_INVALID")
    require(re.fullmatch(r"BF\d+", str(entry.get("candidate_id", ""))), "CANDIDATE_ID_INVALID")
    r = entry.get("range")
    require(isinstance(r, list) and len(r) == 2 and all(type(x) is int for x in r), "RANGE_INVALID")
    require(1 <= r[0] <= r[1] <= 7946, "RANGE_OUT_OF_BOUNDS")
    hg = entry.get("human_gate", {})
    require(hg.get("status") in {"PENDING", "APPROVED", "NOT_REQUIRED"}, "HUMAN_GATE_STATUS_INVALID")
    if entry.get("state") == "HUMAN_GATE_REQUIRED":
        require(hg.get("status") == "PENDING", "HUMAN_GATE_STATE_MISMATCH")
    if entry.get("state") in EXECUTABLE | {"READY_TO_MERGE"}:
        require(hg.get("status") in GATE_OK, "EXECUTION_WITHOUT_HUMAN_GATE")
    if allow_review_placeholder:
        require(entry.get("state") in {"REVIEW_REQUIRED", "REVIEW_AHEAD_FROZEN", "HUMAN_GATE_REQUIRED", "MATERIALIZE_ALLOWED"}, "NEXT_STATE_INVALID")


def validate(cursor):
    require(cursor.get("schema") == SCHEMA, "LIVE_CURSOR_SCHEMA_MISMATCH")
    require(cursor.get("status") in {"ACTIVE", "COMPLETE", "BLOCKED"}, "LIVE_CURSOR_STATUS_INVALID")
    frontier = cursor.get("frontier")
    require(isinstance(frontier, dict), "FRONTIER_MISSING")
    if cursor.get("status") != "COMPLETE":
        validate_entry(frontier)
    nxt = cursor.get("next")
    if nxt is not None:
        validate_entry(nxt, allow_review_placeholder=True)
        require(nxt["range"][0] > frontier["range"][1], "NEXT_RANGE_NOT_AFTER_FRONTIER")
    if frontier.get("state") == "READY_TO_MERGE":
        audit = frontier.get("audit", {})
        require(audit.get("result") == "PASS", "READY_TO_MERGE_WITHOUT_AUDIT_PASS")
        require(frontier.get("human_gate", {}).get("status") in GATE_OK, "READY_TO_MERGE_WITHOUT_GATE")
    return cursor


def assert_candidate(cursor, cid):
    require(cursor["frontier"]["candidate_id"] == cid, "NOT_LIVE_FRONTIER_CANDIDATE")
    return cursor["frontier"]


def cmd_validate(args):
    validate(load(args.cursor))


def cmd_approve(args):
    cursor = validate(load(args.cursor))
    f = assert_candidate(cursor, args.candidate)
    hg = f["human_gate"]
    require(hg.get("status") == "PENDING", "HUMAN_GATE_NOT_PENDING")
    hg["status"] = "APPROVED"
    hg["approval_ref"] = args.approval_ref
    hg["approved_at"] = stamp()
    if f.get("state") == "HUMAN_GATE_REQUIRED":
        f["state"] = "MATERIALIZE_ALLOWED"
    cursor["blocker"] = None
    cursor["next_action"] = "MATERIALIZE_FRONTIER"
    cursor["updated_at"] = stamp()
    save(args.cursor, validate(cursor))


def cmd_mark_materialized(args):
    cursor = validate(load(args.cursor))
    f = assert_candidate(cursor, args.candidate)
    require(f.get("state") in EXECUTABLE, "FRONTIER_NOT_EXECUTABLE")
    receipt = Path(args.receipt)
    require(receipt.is_file(), "MUTATION_RECEIPT_MISSING")
    f["materialization"] = {
        "status": "READY_FOR_B_READBACK",
        "package_id": args.package_id,
        "receipt": args.receipt,
        "final_learner_objects": 7946,
        "updated_at": stamp(),
    }
    f["audit"] = {"status": "PENDING", "result": None, "pack": None}
    f["state"] = "READY_FOR_B_READBACK"
    cursor["blocker"] = None
    cursor["next_action"] = "RUN_B_READBACK"
    cursor["updated_at"] = stamp()
    save(args.cursor, validate(cursor))


def cmd_record_audit_file(args):
    cursor = validate(load(args.cursor))
    req = load(args.request)
    require(req.get("schema") == AUDIT_REQUEST_SCHEMA, "AUDIT_REQUEST_SCHEMA_MISMATCH")
    cid = req.get("candidate_id")
    f = assert_candidate(cursor, cid)
    require(f.get("state") == "READY_FOR_B_READBACK", "AUDIT_TARGET_NOT_READY")
    result = req.get("result")
    require(result in AUDIT_RESULTS, "AUDIT_RESULT_INVALID")
    pack = req.get("audit_pack")
    require(isinstance(pack, str) and pack.startswith("content/lexical/semantic-audit/"), "AUDIT_PACK_PATH_INVALID")
    require(Path(pack).is_file(), "AUDIT_PACK_MISSING")
    corrections = req.get("correction_ordinals", [])
    require(isinstance(corrections, list) and all(type(x) is int for x in corrections), "CORRECTION_ORDINALS_INVALID")
    f["audit"] = {
        "status": "COMPLETE",
        "result": result,
        "pack": pack,
        "blind_first": req.get("blind_first", "UNKNOWN"),
        "correction_ordinals": corrections,
        "updated_at": stamp(),
    }
    if result == "PASS":
        require(f.get("human_gate", {}).get("status") in GATE_OK, "AUDIT_PASS_WITHOUT_HUMAN_GATE")
        require(not corrections, "PASS_WITH_CORRECTIONS_LIST")
        f["state"] = "READY_TO_MERGE"
        cursor["blocker"] = None
        cursor["next_action"] = "AUTO_MERGE"
    elif result == "PASS_WITH_CORRECTIONS":
        require(corrections, "CORRECTIONS_REQUIRED")
        f["state"] = "RECONCILE_ALLOWED"
        cursor["blocker"] = "B_CORRECTIONS"
        cursor["next_action"] = "APPLY_BOUNDED_RECONCILIATION"
    else:
        f["state"] = "BLOCKED"
        cursor["status"] = "BLOCKED"
        cursor["blocker"] = "B_AUDIT_HOLD"
        cursor["next_action"] = "RETURN_TO_CHAT"
    cursor["updated_at"] = stamp()
    save(args.cursor, validate(cursor))


def placeholder_after(entry):
    end = entry["range"][1]
    if end >= 7946:
        return None
    n = candidate_number(entry["candidate_id"]) + 1
    start = end + 1
    return {
        "candidate_id": f"BF{n:02d}",
        "range": [start, min(7946, start + 99)],
        "state": "REVIEW_REQUIRED",
        "proposal_path": None,
        "proposal_commit": None,
        "review_branch": None,
        "human_gate": {"status": "NOT_REQUIRED", "ordinals": [], "approval_ref": None},
    }


def normalize_promoted(entry):
    out = copy.deepcopy(entry)
    hg = out.get("human_gate", {})
    if hg.get("status") == "PENDING":
        out["state"] = "HUMAN_GATE_REQUIRED"
    elif out.get("proposal_path"):
        out["state"] = "MATERIALIZE_ALLOWED"
    else:
        out["state"] = "REVIEW_REQUIRED"
    return out


def cmd_advance_after_merge(args):
    cursor = validate(load(args.cursor))
    f = assert_candidate(cursor, args.candidate)
    require(f.get("state") == "READY_TO_MERGE", "FRONTIER_NOT_READY_TO_MERGE")
    cursor["last_closed"] = {
        "candidate_id": f["candidate_id"],
        "range": f["range"],
        "merge_commit": args.merge_commit,
        "audit_pack": f.get("audit", {}).get("pack"),
        "final_learner_objects": f.get("materialization", {}).get("final_learner_objects", 7946),
    }
    nxt = cursor.get("next")
    if nxt is None:
        nxt = placeholder_after(f)
    if nxt is None:
        cursor["status"] = "COMPLETE"
        cursor["frontier"] = {"candidate_id": f["candidate_id"], "range": f["range"], "state": "COMPLETE", "human_gate": {"status": "NOT_REQUIRED"}}
        cursor["next"] = None
        cursor["blocker"] = None
        cursor["next_action"] = "CAMPAIGN_COMPLETE"
    else:
        promoted = normalize_promoted(nxt)
        promoted["accepted_main_head"] = args.merge_commit
        cursor["frontier"] = promoted
        cursor["next"] = placeholder_after(promoted)
        if promoted["state"] == "HUMAN_GATE_REQUIRED":
            cursor["blocker"] = "HUMAN_GATE_REQUIRED"
            cursor["next_action"] = "SHOW_EXACT_FRONTIER_DELTA"
        elif promoted["state"] == "MATERIALIZE_ALLOWED":
            cursor["blocker"] = None
            cursor["next_action"] = "MATERIALIZE_FRONTIER"
        else:
            cursor["blocker"] = None
            cursor["next_action"] = "RUN_PRODUCTION_REVIEW"
    cursor["updated_at"] = stamp()
    save(args.cursor, validate(cursor))


def parser():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--cursor", type=Path, default=DEFAULT_CURSOR)
    sub = p.add_subparsers(dest="cmd", required=True)

    q = sub.add_parser("validate")
    q.set_defaults(func=cmd_validate)

    q = sub.add_parser("approve")
    q.add_argument("--candidate", required=True)
    q.add_argument("--approval-ref", required=True)
    q.set_defaults(func=cmd_approve)

    q = sub.add_parser("mark-materialized")
    q.add_argument("--candidate", required=True)
    q.add_argument("--package-id", required=True)
    q.add_argument("--receipt", required=True)
    q.set_defaults(func=cmd_mark_materialized)

    q = sub.add_parser("record-audit-file")
    q.add_argument("--request", type=Path, required=True)
    q.set_defaults(func=cmd_record_audit_file)

    q = sub.add_parser("advance-after-merge")
    q.add_argument("--candidate", required=True)
    q.add_argument("--merge-commit", required=True)
    q.set_defaults(func=cmd_advance_after_merge)
    return p


def main():
    args = parser().parse_args()
    try:
        args.func(args)
    except (ValueError, OSError, KeyError, TypeError) as exc:
        raise SystemExit(f"{type(exc).__name__}: {exc}")


if __name__ == "__main__":
    main()
