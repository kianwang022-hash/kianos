#!/usr/bin/env python3
"""Fail-closed mechanical executor for approved Lexical final mutation packages.

This tool never decides semantics. It only validates an already-approved package,
applies exact JSON mutations with stale-file guards, validates lexical identities,
rebuilds Final Learner Objects, and writes a durable mechanical receipt.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import os
import re
import subprocess
from pathlib import Path

PACKAGE_SCHEMA = "kianos.lexical.final_mutation_package.v1"
RECEIPT_SCHEMA = "kianos.lexical.final_mutation_receipt.v1"
BOARD_SCHEMA = "kianos.lexical.three_chat_board.v1"
ALLOWED_FRONTIER_STATES = {
    "MATERIALIZE_ALLOWED",
    "RECONCILE_ALLOWED",
    "AUDIT_CORRECTION_ALLOWED",
}

WORD_RE = re.compile(r"content/lexical/words/by-ordinal/o([0-9]{4})\.json$")
REL_RE = re.compile(r"content/lexical/relations/by-id/([0-9a-f]{2})/([0-9a-f]{64})\.json$")
TEST_RE = re.compile(r"content/lexical/learner/repair-blueprints/shards/o([0-9]{4})-([0-9]{4})\.json$")
RECEIPT_RE = re.compile(r"content/lexical/(?:audit/baseline-v2/.+|execution/manifests/.+)\.(?:json|md|tsv)$")
REL_MANIFEST = "content/lexical/relations/manifest.json"
BOARD_PATH = "content/lexical/execution/three-chat-board.json"
FINAL_MANIFEST = "content/lexical/learner/final/manifest.json"
MUTATION_RECEIPT_DIR = "content/lexical/execution/mutation-receipts"


def require(ok, message):
    if not ok:
        raise ValueError(message)


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + "\n", encoding="utf-8")


def bytehash(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def filehash(path: Path) -> str:
    return bytehash(path.read_bytes())


def encoded_hash(value) -> str:
    return bytehash(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False).encode("utf-8"))


def safe(root: Path, rel: str) -> Path:
    require(isinstance(rel, str) and rel and not Path(rel).is_absolute(), "UNSAFE_PATH")
    require(".." not in Path(rel).parts, "UNSAFE_PATH")
    root = root.resolve()
    path = (root / rel).resolve()
    require(path.is_relative_to(root), "UNSAFE_PATH")
    return path


def allowed_mutation_path(rel: str) -> bool:
    return bool(
        WORD_RE.fullmatch(rel)
        or REL_RE.fullmatch(rel)
        or TEST_RE.fullmatch(rel)
        or rel == REL_MANIFEST
        or RECEIPT_RE.fullmatch(rel)
    )


def relation_path(relation_id: str) -> str:
    h = hashlib.sha256(relation_id.encode("utf-8")).hexdigest()
    return f"content/lexical/relations/by-id/{h[:2]}/{h}.json"


def decode_pointer(pointer: str):
    require(isinstance(pointer, str) and pointer.startswith("/") and pointer != "/", "INVALID_POINTER")
    parts = [p.replace("~1", "/").replace("~0", "~") for p in pointer[1:].split("/")]
    require(all(parts), "INVALID_POINTER")
    return parts


def set_pointer(doc, pointer: str, value):
    parts = decode_pointer(pointer)
    node = doc
    for part in parts[:-1]:
        require(not part.isdigit(), "NUMERIC_ARRAY_EDIT_FORBIDDEN")
        require(isinstance(node, dict) and part in node, "POINTER_PARENT_MISSING")
        node = node[part]
    require(not parts[-1].isdigit(), "NUMERIC_ARRAY_EDIT_FORBIDDEN")
    require(isinstance(node, dict), "ARRAY_PARENT_EDIT_FORBIDDEN")
    node[parts[-1]] = copy.deepcopy(value)


def word_invariants(before, after):
    for key in ("schema", "ordinal", "word_id", "word"):
        require(after.get(key) == before.get(key), "WORD_IDENTITY_CHANGED")
    require(after.get("record", {}).get("word_id") == after.get("word_id"), "RECORD_IDENTITY_MISMATCH")

    senses = after.get("record", {}).get("senses", [])
    ids = [s.get("sense_id") for s in senses]
    require(all(ids) and len(ids) == len(set(ids)), "SENSE_ID_MISSING_OR_DUPLICATE")

    life_rows = after.get("identity_refs", {}).get("senses", [])
    life = {r.get("sense_id"): r for r in life_rows}
    require(len(life) == len(life_rows), "DUPLICATE_LIFECYCLE_ID")

    before_ids = {s.get("sense_id") for s in before.get("record", {}).get("senses", [])}
    after_ids = set(ids)
    for sid in before_ids - after_ids:
        require(sid in life and life[sid].get("status") != "active", "SENSE_REMOVED_WITHOUT_LIFECYCLE")
    for sid in after_ids - before_ids:
        require(sid in life, "NEW_SENSE_NEEDS_LIFECYCLE")

    for cluster in after.get("record", {}).get("core_concept", {}).get("core_clusters", []):
        require(set(cluster.get("sense_ids", [])) <= after_ids, "CORE_DANGLING_SENSE")


def relation_invariants(path: str, owner):
    require(owner.get("schema") == "kianos.lexical.relation_owner.v1", "RELATION_SCHEMA_MISMATCH")
    rid = owner.get("relation_id")
    require(isinstance(rid, str) and rid, "RELATION_ID_MISSING")
    require(path == relation_path(rid), "RELATION_PATH_HASH_MISMATCH")
    seen = set()
    for view in owner.get("word_views", []):
        key = (view.get("source_word_id"), view.get("field"), view.get("index"))
        require(all(x is not None for x in key), "RELATION_VIEW_KEY_MISSING")
        require(key not in seen, "DUPLICATE_RELATION_VIEW")
        seen.add(key)
        require(isinstance(view.get("payload"), dict), "RELATION_VIEW_PAYLOAD_MISSING")


def blueprint_invariants(obj):
    entries = obj.get("entries", [])
    ids = [e.get("blueprint_id") for e in entries]
    require(all(ids) and len(ids) == len(set(ids)), "DUPLICATE_OR_MISSING_BLUEPRINT_ID")
    ords = [e.get("ordinal") for e in entries]
    require(all(type(o) is int for o in ords), "BLUEPRINT_ORDINAL_INVALID")


def validate_relation_refs(root: Path, changed_words: list[Path]):
    for path in changed_words:
        word = load_json(path)
        for ref in word.get("relation_refs", []):
            rid = ref.get("relation_id")
            rp = safe(root, relation_path(rid))
            require(rp.is_file(), "RELATION_REF_OWNER_MISSING:" + str(path.relative_to(root)))
            owner = load_json(rp)
            relation_invariants(str(rp.relative_to(root)), owner)
            matches = [
                v for v in owner.get("word_views", [])
                if v.get("source_word_id") == word.get("word_id")
                and v.get("field") == ref.get("field")
                and v.get("index") == ref.get("index")
            ]
            require(len(matches) == 1, "RELATION_VIEW_MISSING_OR_AMBIGUOUS:" + word.get("word", "?"))


def git(root: Path, *args: str) -> str:
    return subprocess.check_output(["git", "-C", str(root), *args], stderr=subprocess.STDOUT).decode().strip()


def validate_branch_and_source(root: Path, package, branch_name: str | None):
    require(branch_name and branch_name.startswith("work/lexical-continuous-"), "EXECUTOR_BRANCH_FORBIDDEN")
    head = git(root, "rev-parse", "HEAD")
    parent = git(root, "rev-parse", "HEAD^")
    require(package.get("source_head") == parent, "SOURCE_HEAD_NOT_REQUEST_PARENT")
    changed = git(root, "diff", "--name-only", parent, head).splitlines()
    require(changed == ["content/lexical/execution/final-mutation-package.json"], "REQUEST_COMMIT_MUST_ONLY_CHANGE_PACKAGE")
    return head, parent


def validate_board(root: Path, package):
    board = load_json(safe(root, BOARD_PATH))
    require(board.get("schema") == BOARD_SCHEMA, "BOARD_SCHEMA_MISMATCH")
    frontier = board.get("frontier", {})
    require(frontier.get("current_candidate_id") == package.get("candidate_id"), "NOT_LIVE_FRONTIER_CANDIDATE")
    require(frontier.get("state") in ALLOWED_FRONTIER_STATES, "FRONTIER_NOT_EXECUTABLE")
    r = package.get("range", {})
    require([r.get("start_ordinal"), r.get("end_ordinal")] == frontier.get("range"), "FRONTIER_RANGE_MISMATCH")
    gate = package.get("human_gate", {})
    require(gate.get("approved") is True and isinstance(gate.get("approval_ref"), str) and gate["approval_ref"].strip(),
            "HUMAN_GATE_NOT_RECORDED")
    return board


def apply_package(root: Path, package_path: Path, branch_name: str | None):
    package = load_json(package_path)
    require(package.get("schema") == PACKAGE_SCHEMA, "PACKAGE_SCHEMA_MISMATCH")
    package_id = package.get("package_id")
    require(isinstance(package_id, str) and re.fullmatch(r"[A-Za-z0-9._-]{3,100}", package_id), "PACKAGE_ID_INVALID")
    require(package.get("lane") in {"A", "C"}, "LANE_INVALID")
    validate_branch_and_source(root, package, branch_name)
    validate_board(root, package)

    writes = package.get("writes")
    require(isinstance(writes, list) and writes, "EMPTY_MUTATION_PACKAGE")
    paths = [w.get("path") for w in writes]
    require(len(paths) == len(set(paths)), "DUPLICATE_WRITE_PATH")

    before_hashes = {}
    changed_words = []
    applied = []

    for w in writes:
        require(set(w) <= {"path", "mode", "expected_sha256", "expected_absent", "edits", "value"},
                "UNKNOWN_WRITE_FIELD")
        rel = w.get("path")
        require(allowed_mutation_path(rel), "WRITE_SCOPE_VIOLATION:" + str(rel))
        path = safe(root, rel)
        mode = w.get("mode")
        require(mode in {"patch_json", "create_json"}, "WRITE_MODE_INVALID")

        if mode == "create_json":
            require(w.get("expected_absent") is True, "CREATE_REQUIRES_EXPECTED_ABSENT")
            require(not path.exists(), "CREATE_PATH_ALREADY_EXISTS")
            require("value" in w and isinstance(w["value"], dict), "CREATE_VALUE_INVALID")
            obj = copy.deepcopy(w["value"])
            path.parent.mkdir(parents=True, exist_ok=True)
            save_json(path, obj)
            before_hashes[rel] = None
        else:
            require(path.is_file(), "PATCH_PATH_MISSING")
            expected = w.get("expected_sha256")
            require(isinstance(expected, str) and re.fullmatch(r"[0-9a-f]{64}", expected), "EXPECTED_SHA256_INVALID")
            actual = filehash(path)
            require(actual == expected, "STALE_FILE:" + rel)
            before_hashes[rel] = actual
            before = load_json(path)
            obj = copy.deepcopy(before)
            edits = w.get("edits")
            require(isinstance(edits, list) and edits, "EMPTY_PATCH")
            ptrs = [e.get("pointer") for e in edits]
            require(len(ptrs) == len(set(ptrs)), "DUPLICATE_POINTER")
            for e in edits:
                require(set(e) == {"pointer", "value"}, "PATCH_EDIT_INVALID")
                set_pointer(obj, e["pointer"], e["value"])
            if WORD_RE.fullmatch(rel):
                word_invariants(before, obj)
            require(obj != before, "NO_EFFECT_PATCH")
            save_json(path, obj)

        if WORD_RE.fullmatch(rel):
            changed_words.append(path)
        if REL_RE.fullmatch(rel):
            relation_invariants(rel, load_json(path))
        if TEST_RE.fullmatch(rel):
            blueprint_invariants(load_json(path))
        applied.append(rel)

    validate_relation_refs(root, changed_words)

    relation_manifest = safe(root, REL_MANIFEST)
    if relation_manifest.is_file():
        manifest = load_json(relation_manifest)
        relation_files = list((root / "content/lexical/relations/by-id").glob("*/*.json"))
        require(manifest.get("relation_count") == len(relation_files), "RELATION_MANIFEST_COUNT_MISMATCH")

    pkg_hash = filehash(package_path)
    receipt = {
        "schema": RECEIPT_SCHEMA,
        "package_id": package_id,
        "candidate_id": package.get("candidate_id"),
        "range": package.get("range"),
        "lane": package.get("lane"),
        "package_sha256": pkg_hash,
        "source_head": package.get("source_head"),
        "applied_paths": applied,
        "before_sha256": before_hashes,
        "after_sha256": {p: filehash(safe(root, p)) for p in applied},
        "semantic_decision": "external_human_and_chat_approved; executor_mechanical_only",
        "main_merge_authorized": False,
        "status": "MUTATIONS_APPLIED_PENDING_FLOB_REBUILD_AND_VALIDATION",
    }
    receipt_path = root / MUTATION_RECEIPT_DIR / f"{package_id}.json"
    save_json(receipt_path, receipt)
    return receipt_path, receipt


def finalize_receipt(root: Path, receipt_path: Path):
    receipt = load_json(receipt_path)
    manifest = load_json(safe(root, FINAL_MANIFEST))
    require(manifest.get("object_count") == 7946, "FLOB_COUNT_MISMATCH")
    require(len(manifest.get("shards", [])) > 100, "FLOB_SHARD_CLOSURE_INVALID")
    receipt["final_learner_objects"] = {
        "object_count": manifest["object_count"],
        "manifest_sha256": filehash(safe(root, FINAL_MANIFEST)),
    }
    receipt["status"] = "CANDIDATE_READY_FOR_PR_AUDIT"
    receipt["main_merge_authorized"] = False
    save_json(receipt_path, receipt)
    return receipt


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--root", type=Path, default=Path.cwd())
    p.add_argument("--package", type=Path, required=True)
    p.add_argument("--report", type=Path, required=True)
    p.add_argument("--branch", default=os.environ.get("GITHUB_REF_NAME"))
    p.add_argument("--finalize", action="store_true")
    args = p.parse_args()

    root = args.root.resolve()
    try:
        if args.finalize:
            package = load_json(args.package)
            package_id = package.get("package_id")
            receipt_path = root / MUTATION_RECEIPT_DIR / f"{package_id}.json"
            require(receipt_path.is_file(), "RECEIPT_MISSING")
            result = finalize_receipt(root, receipt_path)
        else:
            receipt_path, result = apply_package(root, args.package.resolve(), args.branch)
        save_json(args.report.resolve(), result)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except (ValueError, OSError, KeyError, TypeError, subprocess.CalledProcessError) as exc:
        p.exit(2, f"{type(exc).__name__}: {exc}\n")


if __name__ == "__main__":
    main()
