#!/usr/bin/env python3
import argparse
import copy
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
PROJ = ROOT / "content/xizong/projection"
MANIFEST_PATH = PROJ / "manifest.json"

DEFAULT_FRESHNESS = {
    "SYSTEM_CORE": "RESOLVE_BINDING",
    "MEDICAL_CORE": "STRICT_BLOB",
    "LEARNING_SUPPORT": "RESOLVE_BINDING",
    "SELECTIVE_CUES": "RESOLVE_BINDING",
    "PATHWAYS": "RESOLVE_BINDING",
    "EXTERNAL_SOURCE_CONTRACT": "STRICT_BLOB",
}

ALLOWED_SOURCE_KINDS = set(DEFAULT_FRESHNESS)
ALLOWED_BINDING_KINDS = {
    "FIELD_REF", "OWNER_REF", "DERIVED_FRAGMENT", "INDEX_REF", "INDEX_MATCH", "EXTERNAL_CONTRACT_REF"
}
ALLOWED_ROLES = {
    "PROBLEM", "MAP", "CHAIN", "COMPARE", "BOUNDARY", "EXACT", "HANDOFF", "RECALL", "CLOSURE", "REFERENCE"
}
ALLOWED_GEOMETRIES = {
    "SEQUENCE", "LOOP", "MATRIX", "AXES", "TREE", "NETWORK", "TABLE", "FORMULA_STRIP", "SPATIAL_MAP", "TEXT_STRUCTURE"
}
BLOCK_VIEWS = {
    "BLOCK_ORIENT", "LOGIC_GROUP_ORIENT", "EXTERNAL_HANDOFF", "KP_RECALL_FRONT", "KP_RECALL_REVEAL",
    "GROUP_CLOSURE", "BLOCK_RECALL_FRONT", "BLOCK_RECALL_REVEAL"
}
SYSTEM_VIEWS = {"SYSTEM_GUIDE", "SYSTEM_RECALL_FRONT", "SYSTEM_RECALL_REVEAL"}
ALLOWED_DISPOSITIONS = {"PASS", "REFERENCE_ONLY", "BLOCKED"}
ALLOWED_STALE = {"FRESH", "STALE", "BLOCKED"}

errors = []
warnings = []

def fail(msg):
    errors.append(msg)

def warn(msg):
    warnings.append(msg)

def load_json(path, *, record=True):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as e:
        if record:
            try:
                rel = path.relative_to(ROOT)
            except Exception:
                rel = path
            fail(f"{rel}: JSON load failed: {e}")
        return None

def git_blob_sha(path):
    try:
        rel = path.relative_to(ROOT)
        return subprocess.check_output(["git", "hash-object", str(rel)], cwd=ROOT, text=True).strip()
    except Exception as e:
        fail(f"{path.relative_to(ROOT)}: git hash-object failed: {e}")
        return None

def pointer_get(obj, pointer):
    if pointer in ("", "/"):
        return obj
    if not isinstance(pointer, str) or not pointer.startswith("/"):
        raise KeyError(f"invalid JSON pointer {pointer!r}")
    cur = obj
    for raw in pointer[1:].split("/"):
        key = raw.replace("~1", "/").replace("~0", "~")
        if isinstance(cur, list):
            if not re.fullmatch(r"0|[1-9][0-9]*", key):
                raise KeyError(pointer)
            cur = cur[int(key)]
        elif isinstance(cur, dict):
            cur = cur[key]
        else:
            raise KeyError(pointer)
    return cur

def pointer_delete(obj, pointer):
    if not isinstance(pointer, str) or not pointer.startswith("/") or pointer == "/":
        raise KeyError(pointer)
    parts = pointer[1:].split("/")
    cur = obj
    for raw in parts[:-1]:
        key = raw.replace("~1", "/").replace("~0", "~")
        cur = cur[int(key)] if isinstance(cur, list) else cur[key]
    last = parts[-1].replace("~1", "/").replace("~0", "~")
    if isinstance(cur, list):
        del cur[int(last)]
    else:
        del cur[last]

def dot_get(obj, path):
    if not isinstance(path, str) or not path:
        raise KeyError(path)
    cur = obj
    for part in path.split("."):
        if isinstance(cur, dict) and part in cur:
            cur = cur[part]
        else:
            raise KeyError(path)
    return cur

def choose_occurrence(matches, selector, label):
    occurrence = selector.get("occurrence")
    if occurrence is None:
        if len(matches) != 1:
            raise KeyError(f"{label} must resolve uniquely; got {len(matches)} matches")
        return matches[0]
    if not isinstance(occurrence, int) or isinstance(occurrence, bool) or occurrence < 1:
        raise KeyError(f"{label} occurrence must be a positive 1-based integer")
    if occurrence > len(matches):
        raise KeyError(f"{label} occurrence {occurrence} exceeds {len(matches)} matches")
    return matches[occurrence - 1]

def frontmatter_text(text):
    if not text.startswith("---"):
        raise KeyError("no frontmatter")
    m = re.match(r"\A---\s*\n(.*?)\n---\s*(?:\n|\Z)", text, re.S)
    if not m:
        raise KeyError("unterminated frontmatter")
    return m.group(1)

def resolve_selector(source_path, source_obj, selector):
    if not isinstance(selector, dict):
        raise KeyError("selector must be an object")
    st = selector.get("type")
    if st == "JSON_POINTER":
        if source_obj is None:
            raise KeyError("JSON_POINTER requires JSON source")
        return pointer_get(source_obj, selector.get("value"))

    text = source_path.read_text(encoding="utf-8")

    if st == "FRONTMATTER_FIELD":
        field = selector.get("value")
        if not isinstance(field, str) or not field:
            raise KeyError("FRONTMATTER_FIELD requires value")
        front = frontmatter_text(text)
        matches = list(re.finditer(rf"(?m)^{re.escape(field)}\s*:", front))
        choose_occurrence(matches, selector, f"frontmatter field {field!r}")
        return True

    if st == "MARKER_ID":
        value = selector.get("value")
        if not isinstance(value, str) or not value:
            raise KeyError("MARKER_ID requires value")
        matches = list(re.finditer(rf"\bid\s*=\s*['\"]{re.escape(value)}['\"]", text))
        if len(matches) != 1:
            raise KeyError(f"marker {value!r} must be globally unique; got {len(matches)} matches")
        return True

    if st == "HEADING_EXACT":
        value = selector.get("value")
        if not isinstance(value, str) or not value:
            raise KeyError("HEADING_EXACT requires value")
        matches = []
        for m in re.finditer(r"(?m)^#{1,6}\s+(.+?)\s*$", text):
            heading = re.sub(r"\s+#*$", "", m.group(1)).strip()
            if heading == value:
                matches.append(m)
        choose_occurrence(matches, selector, f"heading {value!r}")
        return True

    if st == "LABELED_BLOCKQUOTE":
        label = selector.get("label")
        if not isinstance(label, str) or not label:
            raise KeyError("LABELED_BLOCKQUOTE requires label")
        pattern = rf"(?m)^>\s*(?:\*\*)?{re.escape(label)}(?:\*\*)?\s*[：:]"
        matches = list(re.finditer(pattern, text))
        choose_occurrence(matches, selector, f"labeled blockquote {label!r}")
        return True

    if st == "STRUCTURE_AFTER_ANCHOR":
        anchor = selector.get("anchor")
        typ = selector.get("structure_type")
        if not isinstance(anchor, str) or not anchor:
            raise KeyError("STRUCTURE_AFTER_ANCHOR requires anchor")
        starts = [m.start() for m in re.finditer(re.escape(anchor), text)]
        start = choose_occurrence(starts, selector, f"anchor {anchor!r}")
        tail_start = start + len(anchor)
        tail = text[tail_start:]
        next_heading = re.search(r"(?m)^#{1,6}\s+", tail)
        local = tail[:next_heading.start()] if next_heading else tail
        if typ == "CODE_BLOCK":
            ok = re.search(r"(?m)^\s*```", local) is not None
        elif typ == "TABLE":
            ok = re.search(r"(?m)^\s*\|.+\|\s*$", local) is not None
        elif typ == "LIST":
            ok = re.search(r"(?m)^\s*(?:[-*]|\d+\.)\s+", local) is not None
        else:
            raise KeyError(f"unsupported structure type {typ!r}")
        if not ok:
            raise KeyError(f"{typ} not found in bounded section after anchor {anchor!r}")
        return True

    raise KeyError(f"unsupported selector type {st!r}")

def source_map(asset):
    return {s.get("id"): s for s in asset.get("sources", []) if isinstance(s, dict)}

def load_source(source, cache):
    path = ROOT / source["path"]
    if not path.exists():
        raise FileNotFoundError(source["path"])
    key = str(path)
    if key not in cache:
        cache[key] = load_json(path) if path.suffix == ".json" else None
    return path, cache[key]

def resolve_index_match(arr, where):
    if not isinstance(arr, list):
        raise KeyError("INDEX_MATCH index is not a list")
    if not isinstance(where, dict) or not where:
        raise KeyError("INDEX_MATCH requires non-empty exact where")
    dict_items = [x for x in arr if isinstance(x, dict)]
    for path_expr in where:
        if not isinstance(path_expr, str) or not path_expr:
            raise KeyError("INDEX_MATCH predicate path must be non-empty string")
        if not any(_dot_exists(item, path_expr) for item in dict_items):
            raise KeyError(f"INDEX_MATCH predicate path {path_expr!r} does not exist in index")
    matches = []
    for item in dict_items:
        matched = True
        for path_expr, expected in where.items():
            try:
                actual = dot_get(item, path_expr)
            except KeyError:
                matched = False
                break
            if actual != expected:
                matched = False
                break
        if matched:
            matches.append(item)
    return matches

def _dot_exists(obj, path):
    try:
        dot_get(obj, path)
        return True
    except KeyError:
        return False

def resolve_binding(asset, binding, cache):
    kind = binding.get("kind")
    if kind not in ALLOWED_BINDING_KINDS:
        raise KeyError(f"unsupported binding kind {kind!r}")
    if kind == "OWNER_REF":
        return True
    smap = source_map(asset)
    sid = binding.get("source_id")
    if sid not in smap:
        raise KeyError(f"unknown source_id {sid!r}")
    path, obj = load_source(smap[sid], cache)
    if kind in ("FIELD_REF", "DERIVED_FRAGMENT", "EXTERNAL_CONTRACT_REF"):
        return resolve_selector(path, obj, binding.get("selector", {}))
    if kind == "INDEX_REF":
        if obj is None:
            raise KeyError("INDEX_REF requires JSON source")
        arr = obj.get(binding.get("index"))
        if not isinstance(arr, list):
            raise KeyError(f"index {binding.get('index')} is not a list")
        item_id = binding.get("item_id")
        matches = [x for x in arr if isinstance(x, dict) and x.get("id") == item_id]
        if len(matches) != 1:
            raise KeyError(f"item id {item_id!r} must resolve uniquely in {binding.get('index')}; got {len(matches)}")
        return matches[0]
    if kind == "INDEX_MATCH":
        if obj is None:
            raise KeyError("INDEX_MATCH requires JSON source")
        arr = obj.get(binding.get("index"))
        if not isinstance(arr, list):
            raise KeyError(f"index {binding.get('index')} is not a list")
        return resolve_index_match(arr, binding.get("where", {}))
    raise KeyError(kind)

def iter_bindings(asset):
    for b in asset.get("learning_support", {}).values():
        if isinstance(b, dict):
            yield b
    for o in asset.get("objects", []):
        if isinstance(o, dict) and isinstance(o.get("binding"), dict):
            yield o["binding"]
    for key in ("enrichment_bindings", "handoff_bindings", "provenance_bindings"):
        for b in asset.get(key, []):
            if isinstance(b, dict):
                yield b
    for key in ("kp_set", "canonical_scope"):
        b = asset.get(key)
        if isinstance(b, dict):
            yield b

def validate_source_registry(asset, asset_rel):
    sources = asset.get("sources")
    if not isinstance(sources, list) or not sources:
        fail(f"{asset_rel}: sources must be a non-empty list")
        return
    ids = []
    for s in sources:
        if not isinstance(s, dict):
            fail(f"{asset_rel}: source entry must be object")
            continue
        sid = s.get("id")
        ids.append(sid)
        if not isinstance(sid, str) or not sid:
            fail(f"{asset_rel}: source id missing")
        if s.get("kind") not in ALLOWED_SOURCE_KINDS:
            fail(f"{asset_rel}: unsupported source kind {s.get('kind')!r}")
        if not isinstance(s.get("path"), str) or not s.get("path"):
            fail(f"{asset_rel}: source {sid!r} path missing")
        expected = s.get("baseline_blob_sha") or s.get("blob_sha")
        if not isinstance(expected, str) or not re.fullmatch(r"[0-9a-f]{40}", expected):
            fail(f"{asset_rel}: source {sid!r} requires a 40-hex provenance blob SHA")
    if len(ids) != len(set(ids)):
        fail(f"{asset_rel}: duplicate source id")

def validate_owner_ref(binding, asset, system, asset_rel):
    owner_type = binding.get("owner_type")
    route = [x for x in system.get("block_route", []) if isinstance(x, dict)]
    route_ids = {x.get("id") for x in route}
    logic_ids = {
        item.get("id")
        for group_list in system.get("logic_index", {}).values()
        if isinstance(group_list, list)
        for item in group_list
        if isinstance(item, dict)
    }
    if owner_type == "BLOCK":
        oid = binding.get("id")
        if oid not in route_ids:
            fail(f"{asset_rel}: OWNER_REF BLOCK {oid!r} not in Current block_route")
        if asset.get("block_id") and oid != asset.get("block_id"):
            fail(f"{asset_rel}: OWNER_REF BLOCK {oid!r} escapes asset block scope {asset.get('block_id')!r}")
        role = binding.get("role")
        if role is not None and role not in {"CENTER_QUESTION", "CANONICAL_GUIDE"}:
            fail(f"{asset_rel}: unsupported BLOCK owner role {role!r}")
    elif owner_type == "KP_SET":
        bid = binding.get("block_id")
        if bid not in route_ids:
            fail(f"{asset_rel}: OWNER_REF KP_SET block {bid!r} not in Current block_route")
        if asset.get("block_id") and bid != asset.get("block_id"):
            fail(f"{asset_rel}: KP_SET {bid!r} escapes asset block scope")
    elif owner_type == "LOGIC_GROUP":
        if binding.get("id") not in logic_ids:
            fail(f"{asset_rel}: OWNER_REF LOGIC_GROUP {binding.get('id')!r} not in Current logic_index")
    elif owner_type == "SYSTEM":
        oid = binding.get("id")
        if oid not in {system.get("system_id"), system.get("canonical_id")}:
            fail(f"{asset_rel}: OWNER_REF SYSTEM {oid!r} does not match Current system")
    else:
        fail(f"{asset_rel}: unsupported OWNER_REF owner_type {owner_type!r}")

def validate_freshness(asset, asset_rel):
    cache = {}
    bindings = list(iter_bindings(asset))
    for s in asset.get("sources", []):
        path = ROOT / s.get("path", "")
        if not path.exists():
            fail(f"{asset_rel}: source missing {s.get('path')}")
            continue
        mode = s.get("freshness") or DEFAULT_FRESHNESS.get(s.get("kind"))
        if mode not in ("STRICT_BLOB", "RESOLVE_BINDING"):
            fail(f"{asset_rel}: unsupported freshness mode {mode!r}")
            continue
        expected = s.get("baseline_blob_sha") or s.get("blob_sha")
        actual = git_blob_sha(path)
        if mode == "STRICT_BLOB" and expected and actual and actual != expected:
            fail(f"{asset_rel}: STRICT_BLOB stale {s['path']} expected {expected} actual {actual}")
        sid = s.get("id")
        if not any(b.get("source_id") == sid for b in bindings):
            fail(f"{asset_rel}: registered source {sid!r} has no exact dependent binding")
    for b in bindings:
        if b.get("kind") == "OWNER_REF":
            continue
        try:
            resolve_binding(asset, b, cache)
        except Exception as e:
            fail(f"{asset_rel}: unresolved binding {b}: {e}")

def validate_neutral_front(asset, asset_rel):
    objects = {o.get("object_id"): o for o in asset.get("objects", []) if isinstance(o, dict)}
    for view_name, view in asset.get("views", {}).items():
        if not isinstance(view, dict) or view.get("protection") != "NEUTRAL_FRONT":
            continue
        ids = list(view.get("object_ids", [])) + list(view.get("block_object_ids", []))
        for oid in ids:
            obj = objects.get(oid)
            if not obj:
                fail(f"{asset_rel}: neutral view {view_name} references unknown object {oid}")
                continue
            if obj.get("answer_bearing") is True:
                fail(f"{asset_rel}: neutral view {view_name} leaks answer-bearing object {oid}")
            elif obj.get("answer_bearing") is False:
                pass
            elif obj.get("role") == "PROBLEM":
                pass
            else:
                fail(f"{asset_rel}: neutral view {view_name} object {oid} is not explicitly neutral")
        for forbidden_key in ("learning_support_keys", "handoff_binding_ids", "provenance_binding_ids"):
            if view.get(forbidden_key):
                fail(f"{asset_rel}: neutral view {view_name} may not expose {forbidden_key}")
        if asset.get("enrichment_bindings") and view.get("enrichment_policy") != "NO_ANSWER_LEAK":
            fail(f"{asset_rel}: neutral view {view_name} requires enrichment_policy NO_ANSWER_LEAK")
        kp_policy = view.get("kp_content_policy")
        if kp_policy is not None and kp_policy != "ID_AND_NEUTRAL_PROMPT_ONLY":
            fail(f"{asset_rel}: neutral view {view_name} has unsafe kp_content_policy {kp_policy!r}")
        context_policy = view.get("context_policy")
        if context_policy is not None and context_policy != "LG_IDS_AND_STATE_ONLY":
            fail(f"{asset_rel}: neutral view {view_name} has unsafe context_policy {context_policy!r}")

def validate_asset_shape(asset, asset_rel, system):
    schema = asset.get("schema")
    is_block = schema == "kianos.xizong.cognitive_projection.block.v1"
    is_system = schema == "kianos.xizong.cognitive_projection.system.v1"
    if not (is_block or is_system):
        fail(f"{asset_rel}: unexpected schema {schema!r}")
        return False
    for key in ("status", "system_id", "sources", "objects", "views"):
        if key not in asset:
            fail(f"{asset_rel}: missing required field {key}")
    if asset.get("system_id") != system.get("system_id"):
        fail(f"{asset_rel}: system_id does not match manifest Current system owner")
    views = asset.get("views", {})
    required_views = BLOCK_VIEWS if is_block else SYSTEM_VIEWS
    missing_views = required_views - set(views)
    if missing_views:
        fail(f"{asset_rel}: missing required views {sorted(missing_views)}")
    objects = asset.get("objects", [])
    if not isinstance(objects, list):
        fail(f"{asset_rel}: objects must be list")
        objects = []
    ids = []
    for obj in objects:
        if not isinstance(obj, dict):
            fail(f"{asset_rel}: object must be mapping")
            continue
        for key in ("object_id", "role", "geometry", "binding"):
            if key not in obj:
                fail(f"{asset_rel}: object missing {key}")
        ids.append(obj.get("object_id"))
        if obj.get("role") not in ALLOWED_ROLES:
            fail(f"{asset_rel}: unsupported role {obj.get('role')!r}")
        if obj.get("geometry") not in ALLOWED_GEOMETRIES:
            fail(f"{asset_rel}: unsupported geometry {obj.get('geometry')!r}")
        if any(k in obj for k in ("medical_content", "canonical_core", "answer_text")):
            fail(f"{asset_rel}: object contains forbidden copied medical-content field")
    if len(ids) != len(set(ids)):
        fail(f"{asset_rel}: duplicate object_id")
    obj_set = set(ids)
    for view_name, view in views.items():
        if not isinstance(view, dict):
            fail(f"{asset_rel}: view {view_name} must be mapping")
            continue
        for key in ("object_ids", "block_object_ids"):
            vals = view.get(key, [])
            if not isinstance(vals, list):
                fail(f"{asset_rel}: view {view_name} {key} must be list")
                continue
            for oid in vals:
                if oid not in obj_set:
                    fail(f"{asset_rel}: view {view_name} references missing object {oid}")
    route_ids = {x.get("id") for x in system.get("block_route", []) if isinstance(x, dict)}
    if is_block:
        for key in ("block_id", "canonical_scope", "learning_support", "kp_set"):
            if key not in asset:
                fail(f"{asset_rel}: missing required Block field {key}")
        bid = asset.get("block_id")
        if bid not in route_ids:
            fail(f"{asset_rel}: block_id {bid!r} not in Current block_route")
        support = asset.get("learning_support", {})
        for key in ("first_pass_focus", "stop_line", "recall_spine", "logic_groups"):
            if key not in support:
                fail(f"{asset_rel}: missing learning_support.{key}")
    else:
        if asset.get("canonical_id") != system.get("canonical_id"):
            fail(f"{asset_rel}: canonical_id does not match Current system")
    return True

def validate_asset(asset, asset_rel, system):
    if not isinstance(asset, dict):
        return
    if not validate_asset_shape(asset, asset_rel, system):
        return
    validate_source_registry(asset, asset_rel)
    for b in iter_bindings(asset):
        if b.get("kind") == "OWNER_REF":
            validate_owner_ref(b, asset, system, asset_rel)
    validate_freshness(asset, asset_rel)
    validate_neutral_front(asset, asset_rel)

def manifest_assets(manifest):
    result = []
    for sid, spec in manifest.get("systems", {}).items():
        result.append((sid, PROJ / spec["system_projection"]))
        for rel in spec.get("blocks", []):
            result.append((sid, PROJ / rel))
    return result

def validate_manifest(manifest):
    for key in ("schema", "status", "schema_version", "source_current_head", "compiled_commit", "systems", "coverage", "validation"):
        if key not in manifest:
            fail(f"manifest: missing required field {key}")
    if manifest.get("schema") != "kianos.xizong.cognitive_projection.manifest.v1":
        fail("manifest: unexpected schema")
    for key in ("source_current_head", "compiled_commit"):
        val = manifest.get(key)
        if not isinstance(val, str) or not re.fullmatch(r"[0-9a-f]{40}", val):
            fail(f"manifest: {key} must be 40-hex commit SHA")
    validation = manifest.get("validation", {})
    if validation.get("validator_result") not in ("PASS", "PASS_REQUIRED_BY_CI"):
        fail("manifest: validation.validator_result must be PASS or PASS_REQUIRED_BY_CI")
    systems = manifest.get("systems", {})
    if not isinstance(systems, dict) or not systems:
        fail("manifest: systems must be non-empty mapping")
        return {}
    current_systems = {}
    total_blocks = 0
    for sid, spec in systems.items():
        source_rel = spec.get("system_source")
        if not isinstance(source_rel, str) or not source_rel:
            fail(f"manifest: {sid} missing system_source")
            continue
        source_path = ROOT / source_rel
        system = load_json(source_path)
        if system is None:
            continue
        current_systems[sid] = system
        if system.get("system_id") != sid:
            fail(f"manifest: key {sid!r} != Current system_id {system.get('system_id')!r}")
        if spec.get("canonical_id") != system.get("canonical_id"):
            fail(f"manifest: {sid} canonical_id mismatch")
        route = [x for x in system.get("block_route", []) if isinstance(x, dict)]
        route_ids = [x.get("id") for x in route]
        blocks = spec.get("blocks", [])
        if spec.get("block_count") != len(route):
            fail(f"manifest: {sid} block_count {spec.get('block_count')} != Current route count {len(route)}")
        if len(blocks) != len(route):
            fail(f"manifest: {sid} block asset count {len(blocks)} != Current route count {len(route)}")
        acct = spec.get("block_accounting", [])
        if not isinstance(acct, list) or len(acct) != len(route):
            fail(f"manifest: {sid} block_accounting count must equal Current route count")
            acct = []
        acct_ids = [x.get("block_id") for x in acct if isinstance(x, dict)]
        if set(acct_ids) != set(route_ids):
            fail(f"manifest: {sid} block_accounting IDs do not exactly match Current block_route")
        acct_assets = []
        for item in acct:
            if not isinstance(item, dict):
                continue
            disposition = item.get("disposition")
            stale = item.get("stale_status")
            if disposition not in ALLOWED_DISPOSITIONS:
                fail(f"manifest: {sid}/{item.get('block_id')} invalid disposition {disposition!r}")
            if stale not in ALLOWED_STALE:
                fail(f"manifest: {sid}/{item.get('block_id')} invalid stale_status {stale!r}")
            if disposition == "PASS" and stale != "FRESH":
                fail(f"manifest: {sid}/{item.get('block_id')} PASS requires FRESH")
            asset_rel = item.get("asset")
            if disposition == "PASS" and not asset_rel:
                fail(f"manifest: {sid}/{item.get('block_id')} PASS missing asset path")
            if asset_rel:
                acct_assets.append(asset_rel)
        if set(acct_assets) != set(blocks):
            fail(f"manifest: {sid} blocks list != accounted asset paths")
        sys_disp = spec.get("system_disposition")
        sys_stale = spec.get("stale_status")
        if sys_disp not in ALLOWED_DISPOSITIONS:
            fail(f"manifest: {sid} invalid system_disposition {sys_disp!r}")
        if sys_stale not in ALLOWED_STALE:
            fail(f"manifest: {sid} invalid system stale_status {sys_stale!r}")
        if sys_disp == "PASS" and sys_stale != "FRESH":
            fail(f"manifest: {sid} PASS system requires FRESH")
        total_blocks += len(route)
    coverage = manifest.get("coverage", {})
    if coverage.get("systems") != len(systems):
        fail("manifest: coverage.systems mismatch")
    if coverage.get("blocks") != total_blocks:
        fail("manifest: coverage.blocks mismatch")
    if coverage.get("total_projection_assets") != len(systems) + total_blocks:
        fail("manifest: coverage.total_projection_assets mismatch")
    return current_systems

def self_test(manifest, assets_by_path):
    # 1. Shared structured sibling mutation must not invalidate the target binding.
    chosen = None
    for path_key, asset in assets_by_path.items():
        if asset.get("schema") != "kianos.xizong.cognitive_projection.block.v1":
            continue
        learning = next((s for s in asset.get("sources", []) if s.get("kind") == "LEARNING_SUPPORT"), None)
        if not learning:
            continue
        obj = load_json(ROOT / learning["path"], record=False)
        blocks = obj.get("blocks", {}) if isinstance(obj, dict) else {}
        if isinstance(blocks, dict) and len(blocks) >= 2:
            chosen = (path_key, asset, learning, obj)
            break
    if not chosen:
        fail("self-test: no shared LEARNING_SUPPORT Block asset available")
    else:
        path_key, asset, learning, original = chosen
        bid = asset.get("block_id")
        siblings = [x for x in original.get("blocks", {}) if x != bid]
        mutated = copy.deepcopy(original)
        mutated["blocks"][siblings[0]]["_projection_mutation_sentinel"] = True
        for b in iter_bindings(asset):
            if b.get("kind") == "FIELD_REF" and b.get("source_id") == learning.get("id"):
                try:
                    pointer_get(mutated, b.get("selector", {}).get("value"))
                except Exception as e:
                    fail(f"self-test: unrelated sibling mutation falsely breaks target binding: {e}")
        target_ptr = next((
            b.get("selector", {}).get("value")
            for b in iter_bindings(asset)
            if b.get("kind") == "FIELD_REF" and b.get("source_id") == learning.get("id")
        ), None)
        if target_ptr:
            broken = copy.deepcopy(original)
            try:
                pointer_delete(broken, target_ptr)
                pointer_get(broken, target_ptr)
                fail("self-test: removal of referenced pointer was not detected")
            except KeyError:
                pass

    # 2. STRICT_BLOB medical owners must remain scope-local.
    strict_dependents = {}
    for path_key, asset in assets_by_path.items():
        for s in asset.get("sources", []):
            mode = s.get("freshness") or DEFAULT_FRESHNESS.get(s.get("kind"))
            if mode == "STRICT_BLOB" and s.get("kind") == "MEDICAL_CORE":
                strict_dependents.setdefault(s["path"], []).append(path_key)
    for src, deps in strict_dependents.items():
        if len(deps) != 1:
            fail(f"self-test: strict Block-local medical source {src} fans out to {len(deps)} assets")

    # 3. Ambiguous structural selectors must fail without an explicit occurrence.
    try:
        choose_occurrence([1, 2], {}, "synthetic ambiguity")
        fail("self-test: ambiguous selector was accepted")
    except KeyError:
        pass

    # 4. INDEX_MATCH typo must fail even though zero matches is otherwise legal.
    try:
        resolve_index_match([{"anchor": {"block_id": "x"}}], {"anchor.block_typo": "x"})
        fail("self-test: malformed INDEX_MATCH path was accepted")
    except KeyError:
        pass

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    manifest = load_json(MANIFEST_PATH)
    if manifest is None:
        return 1
    current_systems = validate_manifest(manifest)

    assets_by_path = {}
    for sid, path in manifest_assets(manifest):
        if not path.exists():
            fail(f"manifest asset missing: {path.relative_to(ROOT)}")
            continue
        asset = load_json(path)
        if asset is None:
            continue
        assets_by_path[str(path)] = asset
        system = current_systems.get(sid)
        if system is None:
            fail(f"{path.relative_to(ROOT)}: Current system owner unresolved from manifest")
            continue
        validate_asset(asset, str(path.relative_to(ROOT)), system)

    expected_assets = manifest.get("coverage", {}).get("total_projection_assets")
    if isinstance(expected_assets, int) and len(assets_by_path) != expected_assets:
        fail(f"loaded projection asset count {len(assets_by_path)} != manifest {expected_assets}")

    if args.self_test:
        self_test(manifest, assets_by_path)

    for w in warnings:
        print(f"WARN: {w}")
    if errors:
        for e in errors:
            print(f"FAIL: {e}")
        print(f"XIZONG_PROJECTION_VALIDATION: FAIL ({len(errors)} errors)")
        return 1

    systems = manifest.get("coverage", {}).get("systems")
    blocks = manifest.get("coverage", {}).get("blocks")
    assets = manifest.get("coverage", {}).get("total_projection_assets")
    print("XIZONG_PROJECTION_VALIDATION: PASS")
    print(f"coverage: {systems} systems / {blocks} blocks / {assets} assets")
    print("freshness: STRICT_BLOB + RESOLVE_BINDING")
    print("selector_exactness: PASS")
    print("neutral_front: PASS")
    print("manifest_accounting: PASS")
    if args.self_test:
        print("r10_mutation_self_test: PASS")
    return 0

if __name__ == "__main__":
    sys.exit(main())
