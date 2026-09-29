#!/usr/bin/env python3
"""Compile accepted top-level Logic-Group owners into shared Xizong Projection assets."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
SYSTEMS = ROOT / "content/xizong/knowledge/systems"
LEARNER = ROOT / "content/xizong/knowledge/learner"
PROJECTION = ROOT / "content/xizong/projection"


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def blob_sha(path: Path) -> str:
    data = path.read_bytes()
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()

def stable_token(value: str) -> str:
    text = str(value or "").strip()
    match = re.fullmatch(r"([A-Za-z]{1,4})0*(\d+)", text)
    if not match:
        match = re.search(r"(?:^|[-_])([A-Za-z]{1,4})0*(\d+)$", text)
    return f"{match.group(1).upper()}{int(match.group(2))}" if match else text.upper()


def asset_slug(value: str) -> str:
    token = stable_token(value)
    match = re.fullmatch(r"([A-Z]{1,4})(\d+)", token)
    return f"{match.group(1).lower()}{int(match.group(2)):02d}" if match else re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def find_system(system_id: str):
    matches = []
    for path in SYSTEMS.glob("*/system.json"):
        value = read_json(path)
        if value.get("system_id") == system_id:
            matches.append((path, value))
    if len(matches) != 1:
        raise SystemExit(f"system owner resolution failed: {system_id}:{len(matches)}")
    return matches[0]


def block_route(system: dict) -> list[str]:
    route = [str(block) for family in system.get("block_families", []) for block in family.get("blocks", [])]
    if not route or len(route) != len(set(route)):
        raise SystemExit("invalid or duplicate block_families route")
    return route

def accepted_keys(route: list[str], learning: dict) -> dict[str, str]:
    groups = learning.get("logic_groups") or {}
    defaults = [str(x) for x in learning.get("system_route", {}).get("default_route", [])]
    if len(route) != len(defaults):
        raise SystemExit(f"route count mismatch: {len(route)}/{len(defaults)}")
    out = {}
    for index, block_id in enumerate(route):
        default = defaults[index]
        if block_id in groups:
            key = block_id
        elif stable_token(block_id) == stable_token(default):
            key = default
        else:
            matches = [x for x in groups if stable_token(x) == stable_token(block_id)]
            if len(matches) != 1:
                raise SystemExit(f"accepted block key unresolved: {block_id}")
            key = matches[0]
        out[block_id] = key
    if len(set(out.values())) != len(groups):
        raise SystemExit("accepted block key coverage mismatch")
    return out


def source(source_id: str, kind: str, path: Path) -> dict:
    return {
        "id": source_id,
        "kind": kind,
        "path": path.relative_to(ROOT).as_posix(),
        "baseline_blob_sha": blob_sha(path),
        "freshness": "RESOLVE_BINDING",
    }


def pointer_value(value: dict, pointer: str):
    current = value
    for part in pointer.strip('/').split('/'):
        if not isinstance(current, dict) or part not in current:
            return None
        current = current[part]
    return current


def field_object(object_id: str, role: str, geometry: str, source_id: str, pointer: str, value_type: str, answer_bearing=True):
    return {
        "object_id": object_id,
        "role": role,
        "geometry": geometry,
        "binding": {
            "kind": "FIELD_REF",
            "source_id": source_id,
            "selector": {"type": "JSON_POINTER", "value": pointer},
            "value_type": value_type,
        },
        "answer_bearing": answer_bearing,
    }

def compile_system(system_id: str, canonical_id: str, system_path: Path, system: dict, learning_path: Path, learning: dict, out_root: Path):
    objects = []
    candidates = [
        ("mission", "PROBLEM", "TEXT_STRUCTURE", "system", "/mission", "string", False),
        ("mother-model", "MAP", "NETWORK", "system", "/mental_model/mother_model", "string", True),
        ("spine", "MAP", "SEQUENCE", "system", "/mental_model/spine", "array", True),
        ("loops", "MAP", "LOOP", "system", "/mental_model/loops", "array", True),
        ("variables", "MAP", "AXES", "system", "/core_variables", "array", True),
        ("relations", "MAP", "NETWORK", "system", "/core_relations", "array", True),
        ("failures", "MAP", "NETWORK", "system", "/failure_modes", "array", True),
        ("judgment-axes", "COMPARE", "AXES", "system", "/judgment_axes", "array", True),
        ("block-families", "MAP", "NETWORK", "system", "/block_families", "array", True),
        ("default-route", "MAP", "SEQUENCE", "learning", "/system_route/default_route", "array", True),
        ("psr", "CLOSURE", "NETWORK", "learning", "/partial_system_reconstructions", "array", True),
        ("final-reconstruction", "RECALL", "TREE", "learning", "/compression/final_system_reconstruction", "object", True),
    ]
    for args in candidates:
        source_value = system if args[3] == "system" else learning
        resolved = pointer_value(source_value, args[4])
        if resolved in (None, "", [], {}):
            continue
        objects.append(field_object(f"{canonical_id.lower()}-{args[0]}", *args[1:]))
    guide_ids = [o["object_id"] for o in objects if not o["object_id"].endswith("final-reconstruction")]
    reveal_ids = [o["object_id"] for o in objects]
    psr_ids = [o["object_id"] for o in objects if o["object_id"].endswith("-psr")]

    asset = {
        "schema": "kianos.xizong.cognitive_projection.system.v1",
        "status": "COMPILED_DERIVED_CURRENT",
        "system_id": system_id,
        "canonical_id": canonical_id,
        "sources": [
            source("system", "SYSTEM_CORE", system_path),
            source("learning", "LEARNING_SUPPORT", learning_path),
        ],
        "objects": objects,
        "views": {
            "SYSTEM_GUIDE": {"object_ids": guide_ids},
            "SYSTEM_RECALL_FRONT": {"protection": "NEUTRAL_FRONT", "object_ids": [], "provenance_policy": "HIDDEN"},
            "SYSTEM_RECALL_REVEAL": {"object_ids": reveal_ids},
            "PARTIAL_SYSTEM_RECONSTRUCTION": {"object_ids": psr_ids, "context_policy": "OWNED_ONLY"},
        },
        "calibration_notes": [
            f"{canonical_id} consumes accepted System/Learning owners through the shared semantic adapter.",
            "System Recall Front carries no medical answer payload; the shared renderer supplies the neutral attempt instruction.",
        ],
    }
    write_json(out_root / "system.projection.json", asset)


def compile_block(system_id: str, canonical_id: str, block_id: str, system_path: Path, learning_path: Path, out_root: Path):
    problem_id = f"{canonical_id.lower()}-{asset_slug(block_id)}-problem"
    map_id = f"{canonical_id.lower()}-{asset_slug(block_id)}-logic-map"
    objects = [
        {
            "object_id": problem_id,
            "role": "PROBLEM",
            "geometry": "TEXT_STRUCTURE",
            "binding": {"kind": "OWNER_REF", "owner_type": "BLOCK", "id": block_id, "role": "CENTER_QUESTION"},
            "answer_bearing": False,
        },

        {
            "object_id": map_id,
            "role": "MAP",
            "geometry": "NETWORK",
            "binding": {"kind": "OWNER_REF", "owner_type": "LOGIC_GROUP_SET", "block_id": block_id},
            "answer_bearing": False,
        },
    ]
    asset = {
        "schema": "kianos.xizong.cognitive_projection.block.v1",
        "status": "COMPILED_DERIVED_CURRENT",
        "projection_level": f"{canonical_id}_ACCEPTED_OWNER_BASELINE",
        "system_id": system_id,
        "block_id": block_id,
        "sources": [
            source("system", "SYSTEM_CORE", system_path),
            source("learning", "LEARNING_SUPPORT", learning_path),
        ],
        "canonical_scope": {"kind": "OWNER_REF", "owner_type": "BLOCK", "id": block_id},
        "kp_set": {"kind": "OWNER_REF", "owner_type": "KP_SET", "block_id": block_id},
        "learning_support": {},
        "objects": objects,
        "enrichment_bindings": [],
        "views": {
            "BLOCK_ORIENT": {"object_ids": [problem_id, map_id]},
            "LOGIC_GROUP_ORIENT": {"object_ids": [problem_id, map_id]},
            "EXTERNAL_HANDOFF": {"object_ids": [map_id], "source_locator_policy": "RESOLVE_CURRENT_STUDY_REFS_IF_PRESENT_NO_GUESS"},
            "KP_RECALL_FRONT": {"protection": "NEUTRAL_FRONT", "object_ids": [], "context_policy": "LG_IDS_AND_STATE_ONLY", "kp_content_policy": "ID_AND_NEUTRAL_PROMPT_ONLY"},

            "KP_RECALL_REVEAL": {"kp_content_policy": "CANONICAL_CORE_FULL", "context_policy": "OWNED_ONLY"},
            "GROUP_CLOSURE": {"object_ids": [map_id], "context_policy": "TIMING_AWARE_OWNED_ONLY"},
            "BLOCK_RECALL_FRONT": {"protection": "NEUTRAL_FRONT", "object_ids": [problem_id, map_id], "show_logic_group_map": True, "logic_map_policy": "LABELS_AND_IDS_ONLY"},
            "BLOCK_RECALL_REVEAL": {"object_ids": [problem_id, map_id]},
        },
        "calibration_notes": [
            f"{canonical_id} Block Projection preserves accepted explicit Logic-Group membership through OWNER_REF.",
            "Source-contact timing remains owned by accepted Learning + Content realization and is consumed by the shared runtime.",
        ],
    }
    rel = Path("blocks") / f"{asset_slug(block_id)}.projection.json"
    write_json(out_root / rel, asset)
    return rel.as_posix()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--system-id", required=True)
    args = parser.parse_args()
    system_path, system = find_system(args.system_id)
    canonical_id = str(system.get("canonical_id") or "")
    learning_path = LEARNER / f"{canonical_id.lower()}-{args.system_id}-learning.json"
    content_path = LEARNER / f"{canonical_id.lower()}-{args.system_id}-content.json"
    if not learning_path.is_file() or not content_path.is_file():
        raise SystemExit("accepted Learning/Content owner missing")
    learning, content = read_json(learning_path), read_json(content_path)

    if learning.get("status") != "CURRENT" or not str(learning.get("authority", "")).startswith("CHAT_APPROVED"):
        raise SystemExit("Learning owner not Current/accepted")
    if content.get("status") != "ACCEPTED":
        raise SystemExit("Content owner not accepted")
    route = block_route(system)
    keys = accepted_keys(route, learning)
    if set(keys.values()) != set((content.get("block_realization") or {}).keys()):
        raise SystemExit("Content realization does not cover accepted route")

    out_root = PROJECTION / f"{canonical_id.lower()}-{args.system_id}"
    compile_system(args.system_id, canonical_id, system_path, system, learning_path, learning, out_root)
    block_paths = [compile_block(args.system_id, canonical_id, bid, system_path, learning_path, out_root) for bid in route]
    print(json.dumps({
        "system_id": args.system_id,
        "canonical_id": canonical_id,
        "block_count": len(route),
        "projection_root": out_root.relative_to(PROJECTION).as_posix(),
        "system_projection": f"{canonical_id.lower()}-{args.system_id}/system.projection.json",
        "blocks": [f"{canonical_id.lower()}-{args.system_id}/{p}" for p in block_paths],
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
