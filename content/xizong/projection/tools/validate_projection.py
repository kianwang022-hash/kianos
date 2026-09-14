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

SYSTEM_FILES = {
    "circulation": ROOT / "content/xizong/knowledge/systems/a1-circulation/system.json",
    "respiratory": ROOT / "content/xizong/knowledge/systems/a2-respiratory/system.json",
    "urinary": ROOT / "content/xizong/knowledge/systems/a3-urinary/system.json",
}

DEFAULT_FRESHNESS = {
    "SYSTEM_CORE": "RESOLVE_BINDING",
    "MEDICAL_CORE": "STRICT_BLOB",
    "LEARNING_SUPPORT": "RESOLVE_BINDING",
    "SELECTIVE_CUES": "RESOLVE_BINDING",
    "PATHWAYS": "RESOLVE_BINDING",
    "EXTERNAL_SOURCE_CONTRACT": "STRICT_BLOB",
}

errors = []
warnings = []

def fail(msg): errors.append(msg)
def warn(msg): warnings.append(msg)

def load_json(path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as e:
        fail(f"{path.relative_to(ROOT)}: JSON load failed: {e}")
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
            cur = cur[int(key)]
        elif isinstance(cur, dict):
            cur = cur[key]
        else:
            raise KeyError(pointer)
    return cur

def dot_get(obj, path):
    cur = obj
    for part in path.split("."):
        if isinstance(cur, dict) and part in cur:
            cur = cur[part]
        else:
            raise KeyError(path)
    return cur

def resolve_selector(source_path, source_obj, selector):
    st = selector.get("type")
    if st == "JSON_POINTER":
        if source_obj is None:
            raise KeyError("JSON_POINTER requires JSON source")
        return pointer_get(source_obj, selector.get("value"))
    text = source_path.read_text(encoding="utf-8")
    if st == "FRONTMATTER_FIELD":
        field = selector.get("value")
        if not text.startswith("---"):
            raise KeyError(f"no frontmatter for {field}")
        end = text.find("\n---", 3)
        if end < 0:
            raise KeyError(f"unterminated frontmatter for {field}")
        front = text[3:end]
        if not re.search(rf"(?m)^{re.escape(field)}\s*:", front):
            raise KeyError(f"frontmatter field {field} not found")
        return True
    if st == "MARKER_ID":
        value = selector.get("value")
        if f'id="{value}"' not in text and f"id='{value}'" not in text:
            raise KeyError(f"marker {value} not found")
        return True
    if st == "HEADING_EXACT":
        value = selector.get("value")
        headings = [re.sub(r"\s+#*$", "", m.group(1)).strip() for m in re.finditer(r"(?m)^#{1,6}\s+(.+?)\s*$", text)]
        if value not in headings:
            raise KeyError(f"heading {value!r} not found")
        return True
    if st == "LABELED_BLOCKQUOTE":
        label = selector.get("label")
        pattern = rf"(?m)^>\s*(?:\*\*)?{re.escape(label)}(?:\*\*)?\s*[：:]"
        if not re.search(pattern, text):
            raise KeyError(f"labeled blockquote {label!r} not found")
        return True
    if st == "STRUCTURE_AFTER_ANCHOR":
        anchor = selector.get("anchor")
        idx = text.find(anchor)
        if idx < 0:
            raise KeyError(f"anchor {anchor!r} not found")
        tail = text[idx + len(anchor):]
        typ = selector.get("structure_type")
        if typ == "CODE_BLOCK":
            if "```" not in tail: raise KeyError(f"code block after anchor {anchor!r} not found")
        elif typ == "TABLE":
            if not re.search(r"(?m)^\|.+\|\s*$", tail): raise KeyError(f"table after anchor {anchor!r} not found")
        elif typ == "LIST":
            if not re.search(r"(?m)^\s*(?:[-*]|\d+\.)\s+", tail): raise KeyError(f"list after anchor {anchor!r} not found")
        else:
            raise KeyError(f"unsupported structure type {typ!r}")
        return True
    raise KeyError(f"unsupported selector type {st!r}")

def source_map(asset): return {s["id"]: s for s in asset.get("sources", [])}

def load_source(source, cache):
    path = ROOT / source["path"]
    if not path.exists(): raise FileNotFoundError(source["path"])
    key = str(path)
    if key not in cache:
        cache[key] = load_json(path) if path.suffix == ".json" else None
    return path, cache[key]

def resolve_binding(asset, binding, cache):
    kind = binding.get("kind")
    if kind == "OWNER_REF": return True
    smap = source_map(asset)
    sid = binding.get("source_id")
    if sid not in smap: raise KeyError(f"unknown source_id {sid!r}")
    path, obj = load_source(smap[sid], cache)
    if kind in ("FIELD_REF", "DERIVED_FRAGMENT", "EXTERNAL_CONTRACT_REF"):
        return resolve_selector(path, obj, binding.get("selector", {}))
    if kind == "INDEX_REF":
        if obj is None: raise KeyError("INDEX_REF requires JSON source")
        arr = obj.get(binding.get("index"))
        if not isinstance(arr, list): raise KeyError(f"index {binding.get('index')} is not a list")
        item_id = binding.get("item_id")
        if not any(isinstance(x, dict) and x.get("id") == item_id for x in arr):
            raise KeyError(f"item id {item_id!r} not found in {binding.get('index')}")
        return True
    if kind == "INDEX_MATCH":
        if obj is None: raise KeyError("INDEX_MATCH requires JSON source")
        arr = obj.get(binding.get("index"))
        if not isinstance(arr, list): raise KeyError(f"index {binding.get('index')} is not a list")
        where = binding.get("where", {})
        if not isinstance(where, dict) or not where: raise KeyError("INDEX_MATCH requires non-empty exact where")
        for item in arr:
            if not isinstance(item, dict): continue
            for path_expr, expected in where.items():
                try: actual = dot_get(item, path_expr)
                except KeyError: break
                if actual != expected: break
        return True
    raise KeyError(f"unsupported binding kind {kind!r}")

def iter_bindings(asset):
    for b in asset.get("learning_support", {}).values():
        if isinstance(b, dict): yield b
    for o in asset.get("objects", []):
        b = o.get("binding")
        if isinstance(b, dict): yield b
    for key in ("enrichment_bindings", "handoff_bindings", "provenance_bindings"):
        for b in asset.get(key, []):
            if isinstance(b, dict): yield b
    kp = asset.get("kp_set")
    if isinstance(kp, dict): yield kp
    cs = asset.get("canonical_scope")
    if isinstance(cs, dict): yield cs

def validate_freshness(asset, asset_rel):
    cache = {}
    for s in asset.get("sources", []):
        path = ROOT / s.get("path", "")
        if not path.exists():
            fail(f"{asset_rel}: source missing {s.get('path')}")
            continue
        mode = s.get("freshness") or DEFAULT_FRESHNESS.get(s.get("kind"), "RESOLVE_BINDING")
        expected = s.get("baseline_blob_sha") or s.get("blob_sha")
        if expected:
            actual = git_blob_sha(path)
            if mode == "STRICT_BLOB" and actual and actual != expected:
                fail(f"{asset_rel}: STRICT_BLOB stale {s['path']} expected {expected} actual {actual}")
        if mode not in ("STRICT_BLOB", "RESOLVE_BINDING"):
            fail(f"{asset_rel}: unsupported freshness mode {mode}")
    for b in iter_bindings(asset):
        if b.get("kind") == "OWNER_REF": continue
        try: resolve_binding(asset, b, cache)
        except Exception as e: fail(f"{asset_rel}: unresolved binding {b}: {e}")

def validate_neutral_front(asset, asset_rel):
    objects = {o.get("object_id"): o for o in asset.get("objects", [])}
    for view_name, view in asset.get("views", {}).items():
        if view.get("protection") != "NEUTRAL_FRONT": continue
        ids = list(view.get("object_ids", [])) + list(view.get("block_object_ids", []))
        for oid in ids:
            obj = objects.get(oid)
            if not obj:
                fail(f"{asset_rel}: neutral view {view_name} references unknown object {oid}")
                continue
            if obj.get("answer_bearing") is True:
                fail(f"{asset_rel}: neutral view {view_name} leaks answer-bearing object {oid}")
            if "answer_bearing" not in obj and obj.get("role") != "PROBLEM":
                fail(f"{asset_rel}: neutral view {view_name} object {oid} lacks explicit safe flag")
        if asset.get("enrichment_bindings"):
            pol = view.get("enrichment_policy")
            if pol not in (None, "NO_ANSWER_LEAK") and view_name in ("KP_RECALL_FRONT", "BLOCK_RECALL_FRONT", "SYSTEM_RECALL_FRONT"):
                fail(f"{asset_rel}: neutral view {view_name} has unsafe enrichment_policy {pol}")

def validate_asset(asset, asset_rel, system_cache):
    if not isinstance(asset, dict): return
    schema = asset.get("schema", "")
    is_block = schema.endswith(".block.v1")
    is_system = schema.endswith(".system.v1")
    if not (is_block or is_system):
        fail(f"{asset_rel}: unexpected schema {schema!r}"); return
    sid = asset.get("system_id")
    if sid not in SYSTEM_FILES:
        fail(f"{asset_rel}: unknown system_id {sid!r}"); return
    if sid not in system_cache: system_cache[sid] = load_json(SYSTEM_FILES[sid])
    system = system_cache[sid] or {}
    if is_block:
        bid = asset.get("block_id")
        route_ids = {x.get("id") for x in system.get("block_route", []) if isinstance(x, dict)}
        if bid not in route_ids: fail(f"{asset_rel}: block_id {bid!r} not in Current block_route")
        cs = asset.get("canonical_scope", {})
        if cs.get("id") != bid: fail(f"{asset_rel}: canonical_scope id does not match block_id")
    obj_ids = [o.get("object_id") for o in asset.get("objects", [])]
    if len(obj_ids) != len(set(obj_ids)): fail(f"{asset_rel}: duplicate object_id")
    obj_set = set(obj_ids)
    for view_name, view in asset.get("views", {}).items():
        for key in ("object_ids", "block_object_ids"):
            for oid in view.get(key, []):
                if oid not in obj_set: fail(f"{asset_rel}: view {view_name} references missing object {oid}")
    validate_freshness(asset, asset_rel)
    validate_neutral_front(asset, asset_rel)

def manifest_assets(manifest):
    result = []
    for sid, spec in manifest.get("systems", {}).items():
        result.append((sid, PROJ / spec["system_projection"]))
        for rel in spec.get("blocks", []): result.append((sid, PROJ / rel))
    return result

def validate_manifest(manifest):
    systems = manifest.get("systems", {})
    if set(systems) != {"circulation", "respiratory", "urinary"}: fail("manifest: expected exactly circulation/respiratory/urinary")
    expected_counts = {"circulation": 12, "respiratory": 12, "urinary": 14}
    total = 0
    for sid, n in expected_counts.items():
        spec = systems.get(sid, {})
        blocks = spec.get("blocks", [])
        if len(blocks) != n: fail(f"manifest: {sid} block asset count {len(blocks)} != {n}")
        if spec.get("block_count") != n: fail(f"manifest: {sid} block_count metadata != {n}")
        if not spec.get("system_projection"): fail(f"manifest: {sid} missing system_projection")
        total += len(blocks)
    if total != 38: fail(f"manifest: total blocks {total} != 38")
    if manifest.get("coverage", {}).get("total_projection_assets") != 41: fail("manifest: total_projection_assets must be 41")

def self_test(manifest, assets_by_path):
    b01_path = PROJ / "a1-circulation/blocks/b01.projection.json"
    b01 = assets_by_path.get(str(b01_path))
    if not b01:
        fail("self-test: missing A1 B1 asset"); return
    learning_src = next((s for s in b01.get("sources", []) if s.get("kind") == "LEARNING_SUPPORT"), None)
    if not learning_src:
        fail("self-test: B1 missing learning source"); return
    learning_obj = load_json(ROOT / learning_src["path"])
    if learning_obj is None: return
    mutated = copy.deepcopy(learning_obj)
    try: mutated["blocks"]["circulation-b02"]["_projection_mutation_sentinel"] = True
    except Exception:
        fail("self-test: cannot mutate unrelated sibling learning support"); return
    for b in iter_bindings(b01):
        if b.get("kind") == "FIELD_REF" and b.get("source_id") == learning_src["id"]:
            try: pointer_get(mutated, b["selector"]["value"])
            except Exception as e: fail(f"self-test: unrelated sibling mutation falsely breaks B1 binding: {e}")
    broken = copy.deepcopy(learning_obj)
    try:
        del broken["blocks"]["circulation-b01"]["recall_spine"]
        pointer_get(broken, "/blocks/circulation-b01/recall_spine")
        fail("self-test: removal of referenced recall_spine was not detected")
    except KeyError:
        pass
    strict_dependents = {}
    for path_key, asset in assets_by_path.items():
        for s in asset.get("sources", []):
            mode = s.get("freshness") or DEFAULT_FRESHNESS.get(s.get("kind"), "RESOLVE_BINDING")
            if mode == "STRICT_BLOB" and s.get("kind") == "MEDICAL_CORE": strict_dependents.setdefault(s["path"], []).append(path_key)
    for src, deps in strict_dependents.items():
        if len(deps) != 1: fail(f"self-test: strict Block-local medical source {src} fans out to {len(deps)} assets")
    for path_key, asset in assets_by_path.items():
        for b in asset.get("enrichment_bindings", []):
            if b.get("kind") == "INDEX_MATCH":
                where = b.get("where")
                if not isinstance(where, dict) or not where: fail(f"self-test: {path_key} INDEX_MATCH lacks exact where")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    manifest = load_json(MANIFEST_PATH)
    if manifest is None: return 1
    validate_manifest(manifest)
    system_cache = {}; assets_by_path = {}
    for sid, path in manifest_assets(manifest):
        if not path.exists():
            fail(f"manifest asset missing: {path.relative_to(ROOT)}"); continue
        asset = load_json(path)
        if asset is None: continue
        assets_by_path[str(path)] = asset
        validate_asset(asset, str(path.relative_to(ROOT)), system_cache)
    if len(assets_by_path) != 41: fail(f"loaded projection asset count {len(assets_by_path)} != 41")
    if args.self_test: self_test(manifest, assets_by_path)
    for w in warnings: print(f"WARN: {w}")
    if errors:
        for e in errors: print(f"FAIL: {e}")
        print(f"XIZONG_PROJECTION_VALIDATION: FAIL ({len(errors)} errors)")
        return 1
    print("XIZONG_PROJECTION_VALIDATION: PASS")
    print("coverage: 3 systems / 38 blocks / 41 assets")
    print("freshness: STRICT_BLOB + RESOLVE_BINDING")
    print("neutral_front: PASS")
    if args.self_test: print("mutation_self_test: PASS")
    return 0

if __name__ == "__main__":
    sys.exit(main())
