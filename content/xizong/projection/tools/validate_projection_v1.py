#!/usr/bin/env python3
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

import validate_projection as base

ROOT = Path(__file__).resolve().parents[4]
PROJ = ROOT / "content/xizong/projection"
MANIFEST_PATH = PROJ / "manifest.json"
KNOWLEDGE_MANIFEST = ROOT / "content/xizong/knowledge/manifest.json"

errors = []


def fail(msg):
    errors.append(msg)


def load_json(path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        fail(f"{path.relative_to(ROOT)}: JSON load failed: {exc}")
        return None


def git_commit_exists(sha):
    return subprocess.run(
        ["git", "cat-file", "-e", f"{sha}^{{commit}}"], cwd=ROOT,
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
    ).returncode == 0


def is_ancestor(older, newer):
    return subprocess.run(
        ["git", "merge-base", "--is-ancestor", older, newer], cwd=ROOT,
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
    ).returncode == 0


def normalize_system(raw, path):
    if not isinstance(raw, dict):
        fail(f"{path.relative_to(ROOT)}: System owner must be JSON object")
        return {}
    identity = raw.get("identity") if isinstance(raw.get("identity"), dict) else {}
    sid = raw.get("system_id") or identity.get("system_id")
    cid = raw.get("canonical_id") or identity.get("canonical_id")
    if not isinstance(sid, str) or not sid:
        fail(f"{path.relative_to(ROOT)}: Current System identity has no resolvable system_id")
    if not isinstance(cid, str) or not cid:
        fail(f"{path.relative_to(ROOT)}: Current System identity has no resolvable canonical_id")
    result = dict(raw)
    result["system_id"] = sid
    result["canonical_id"] = cid
    return result


def normalized_owner_root(root):
    root = root.strip("/")
    if root.startswith("content/xizong/knowledge/"):
        return root + "/"
    if root.startswith("systems/"):
        return "content/xizong/knowledge/" + root + "/"
    return root + "/"


def expected_system_owner_roots():
    km = load_json(KNOWLEDGE_MANIFEST)
    if km is None:
        return set()
    result = set()
    domains = km.get("macro_domain_taxonomy", {}).get("domains", {})
    if not isinstance(domains, dict):
        fail("knowledge manifest: macro_domain_taxonomy.domains missing")
        return result
    for domain in domains.values():
        if not isinstance(domain, dict):
            continue
        owners = domain.get("system_owners", [])
        if not isinstance(owners, list):
            fail("knowledge manifest: system_owners must be a list")
            continue
        for owner in owners:
            if not isinstance(owner, str) or not owner:
                fail("knowledge manifest: invalid system owner path")
                continue
            result.add(normalized_owner_root(owner))
    return result


def validate_manifest_and_systems(manifest):
    required = (
        "schema", "schema_version", "status", "source_current_head", "compiled_commit",
        "systems", "coverage", "validation", "eligibility_accounting"
    )
    for key in required:
        if key not in manifest:
            fail(f"manifest: missing required field {key}")
    if manifest.get("schema") != "kianos.xizong.cognitive_projection.manifest.v1":
        fail("manifest: unexpected schema")

    systems = manifest.get("systems")
    if not isinstance(systems, dict) or not systems:
        fail("manifest: systems must be a non-empty mapping")
        return {}

    normalized = {}
    total_blocks = 0
    total_assets = 0
    for sid, spec in systems.items():
        if not isinstance(spec, dict):
            fail(f"manifest: System spec {sid!r} must be object")
            continue
        source_rel = spec.get("system_source")
        if not isinstance(source_rel, str) or not source_rel:
            fail(f"manifest: {sid} missing system_source")
            continue
        source_path = ROOT / source_rel
        raw = load_json(source_path)
        if raw is None:
            continue
        system = normalize_system(raw, source_path)
        normalized[sid] = system

        if system.get("system_id") != sid:
            fail(f"manifest: key {sid!r} != normalized Current system_id {system.get('system_id')!r}")
        if spec.get("canonical_id") != system.get("canonical_id"):
            fail(f"manifest: {sid} canonical_id mismatch")

        route = [x for x in system.get("block_route", []) if isinstance(x, dict)]
        route_ids = [x.get("id") for x in route]
        if not route or any(not isinstance(x, str) or not x for x in route_ids):
            fail(f"manifest: {sid} Current block_route is empty or invalid")
        if len(route_ids) != len(set(route_ids)):
            fail(f"manifest: {sid} Current block_route has duplicate ids")

        blocks = spec.get("blocks")
        if not isinstance(blocks, list):
            fail(f"manifest: {sid} blocks must be list")
            blocks = []
        if spec.get("block_count") != len(route):
            fail(f"manifest: {sid} block_count {spec.get('block_count')} != Current route count {len(route)}")
        if len(blocks) != len(route):
            fail(f"manifest: {sid} block asset count {len(blocks)} != Current route count {len(route)}")
        if len(blocks) != len(set(blocks)):
            fail(f"manifest: {sid} duplicate block asset path")

        sys_proj = spec.get("system_projection")
        if not isinstance(sys_proj, str) or not sys_proj:
            fail(f"manifest: {sid} missing system_projection")

        acct = spec.get("block_accounting")
        if not isinstance(acct, list) or len(acct) != len(route):
            fail(f"manifest: {sid} block_accounting count must equal Current route count")
            acct = []
        acct_ids = [x.get("block_id") for x in acct if isinstance(x, dict)]
        if set(acct_ids) != set(route_ids) or len(acct_ids) != len(route_ids):
            fail(f"manifest: {sid} block_accounting IDs must exactly match Current block_route")
        acct_assets = []
        for item in acct:
            if not isinstance(item, dict):
                fail(f"manifest: {sid} block_accounting entry must be object")
                continue
            disposition = item.get("disposition")
            stale = item.get("stale_status")
            if disposition not in base.ALLOWED_DISPOSITIONS:
                fail(f"manifest: {sid}/{item.get('block_id')} invalid disposition {disposition!r}")
            if stale not in base.ALLOWED_STALE:
                fail(f"manifest: {sid}/{item.get('block_id')} invalid stale_status {stale!r}")
            if disposition == "PASS" and stale != "FRESH":
                fail(f"manifest: {sid}/{item.get('block_id')} PASS requires FRESH")
            asset_rel = item.get("asset")
            if disposition == "PASS" and not isinstance(asset_rel, str):
                fail(f"manifest: {sid}/{item.get('block_id')} PASS missing asset path")
            if isinstance(asset_rel, str):
                acct_assets.append(asset_rel)
        if set(acct_assets) != set(blocks) or len(acct_assets) != len(blocks):
            fail(f"manifest: {sid} blocks list != accounted asset paths")

        sys_disp = spec.get("system_disposition")
        sys_stale = spec.get("stale_status")
        if sys_disp not in base.ALLOWED_DISPOSITIONS:
            fail(f"manifest: {sid} invalid system_disposition {sys_disp!r}")
        if sys_stale not in base.ALLOWED_STALE:
            fail(f"manifest: {sid} invalid system stale_status {sys_stale!r}")
        if sys_disp == "PASS" and sys_stale != "FRESH":
            fail(f"manifest: {sid} PASS system requires FRESH")

        total_blocks += len(route)
        total_assets += 1 + len(blocks)

    coverage = manifest.get("coverage", {})
    if coverage.get("systems") != len(systems):
        fail("manifest: coverage.systems mismatch")
    if coverage.get("blocks") != total_blocks:
        fail("manifest: coverage.blocks mismatch")
    if coverage.get("total_projection_assets") != total_assets:
        fail("manifest: coverage.total_projection_assets mismatch")
    return normalized


def validate_eligibility_accounting(manifest):
    eligibility = manifest.get("eligibility_accounting")
    if not isinstance(eligibility, dict):
        fail("manifest: eligibility_accounting missing")
        return
    compiled = eligibility.get("compiled")
    deferred = eligibility.get("not_eligible")
    if not isinstance(compiled, list) or not isinstance(deferred, list):
        fail("manifest: eligibility compiled/not_eligible must be lists")
        return

    systems = manifest.get("systems", {})
    compiled_ids = []
    accounted_roots = []
    canonical_ids = []

    for item in compiled:
        if not isinstance(item, dict):
            fail("manifest: compiled eligibility entry must be object")
            continue
        sid = item.get("system_id")
        compiled_ids.append(sid)
        canonical_ids.append(item.get("canonical_id"))
        root = item.get("owner_root")
        if not isinstance(root, str) or not root:
            fail(f"manifest: compiled {sid!r} missing owner_root")
        else:
            root = normalized_owner_root(root)
            accounted_roots.append(root)
            if not (ROOT / root).exists():
                fail(f"manifest: compiled owner_root does not exist: {root}")
        spec = systems.get(sid)
        if not isinstance(spec, dict):
            fail(f"manifest: eligibility compiled system {sid!r} missing from systems")
            continue
        if item.get("canonical_id") != spec.get("canonical_id"):
            fail(f"manifest: eligibility canonical_id mismatch for {sid}")
        if item.get("block_count") != spec.get("block_count"):
            fail(f"manifest: eligibility block_count mismatch for {sid}")
        if item.get("status") != "ELIGIBLE_COMPILED":
            fail(f"manifest: compiled {sid} must use ELIGIBLE_COMPILED")

    if set(compiled_ids) != set(systems) or len(compiled_ids) != len(systems):
        fail("manifest: eligibility compiled systems must exactly equal compiled systems")

    for item in deferred:
        if not isinstance(item, dict):
            fail("manifest: not_eligible entry must be object")
            continue
        canonical_ids.append(item.get("canonical_id"))
        root = item.get("owner_root")
        if not isinstance(root, str) or not root:
            fail(f"manifest: not_eligible {item.get('canonical_id')!r} missing owner_root")
        else:
            root = normalized_owner_root(root)
            accounted_roots.append(root)
            if not (ROOT / root).exists():
                fail(f"manifest: not_eligible owner_root does not exist: {root}")
        if item.get("status") != "NOT_ELIGIBLE":
            fail(f"manifest: deferred {item.get('canonical_id')} must use NOT_ELIGIBLE")
        if not isinstance(item.get("reason"), str) or not item.get("reason").strip():
            fail(f"manifest: deferred {item.get('canonical_id')} requires reason")

    expected_roots = expected_system_owner_roots()
    if set(accounted_roots) != expected_roots:
        missing = sorted(expected_roots - set(accounted_roots))
        extra = sorted(set(accounted_roots) - expected_roots)
        fail(f"manifest: System owner eligibility accounting mismatch; missing={missing}, extra={extra}")
    if len(accounted_roots) != len(set(accounted_roots)):
        fail("manifest: a System owner_root is accounted more than once")
    if len(canonical_ids) != len(set(canonical_ids)):
        fail("manifest: duplicate canonical_id across eligibility accounting")


def validate_accounting_summaries(manifest):
    dispositions = {"PASS": 0, "REFERENCE_ONLY": 0, "BLOCKED": 0}
    stale = {"FRESH": 0, "STALE": 0, "BLOCKED": 0}
    rich_ids = []
    baseline = 0
    for spec in manifest.get("systems", {}).values():
        for item in spec.get("block_accounting", []):
            d = item.get("disposition")
            s = item.get("stale_status")
            if d in dispositions:
                dispositions[d] += 1
            if s in stale:
                stale[s] += 1
            level = item.get("projection_level")
            if level == "RICH_CURRENT":
                rich_ids.append(item.get("block_id"))
            elif level == "BASELINE_CURRENT":
                baseline += 1
            else:
                fail(f"manifest: unsupported projection_level {level!r} for {item.get('block_id')}")
    coverage = manifest.get("coverage", {})
    if coverage.get("eligible_block_accounting") != dispositions:
        fail(f"manifest: eligible_block_accounting summary mismatch: actual {dispositions}")
    if coverage.get("stale_accounting") != stale:
        fail(f"manifest: stale_accounting summary mismatch: actual {stale}")
    if coverage.get("baseline_projection_blocks") != baseline:
        fail(f"manifest: baseline_projection_blocks {coverage.get('baseline_projection_blocks')} != {baseline}")
    declared_rich = coverage.get("rich_calibration_blocks", [])
    if not isinstance(declared_rich, list) or set(declared_rich) != set(rich_ids) or len(declared_rich) != len(rich_ids):
        fail(f"manifest: rich_calibration_blocks must exactly match RICH_CURRENT accounting: {sorted(rich_ids)}")


def choose(items, occurrence, label):
    if occurrence is None:
        if len(items) != 1:
            raise KeyError(f"{label} must resolve uniquely; got {len(items)}")
        return items[0]
    if not isinstance(occurrence, int) or isinstance(occurrence, bool) or occurrence < 1:
        raise KeyError(f"{label} occurrence must be positive 1-based integer")
    if occurrence > len(items):
        raise KeyError(f"{label} occurrence {occurrence} exceeds {len(items)} matches")
    return items[occurrence - 1]


def code_block_starts(text):
    starts = []
    open_fence = None
    offset = 0
    for line in text.splitlines(keepends=True):
        m = re.match(r"^[ \t]*(```+|~~~+)", line)
        if m:
            fence = m.group(1)
            if open_fence is None:
                open_fence = fence[0]
                starts.append(offset + m.start())
            elif fence[0] == open_fence:
                open_fence = None
        offset += len(line)
    return starts


def table_starts(text):
    lines = text.splitlines(keepends=True)
    offsets = []
    total = 0
    for line in lines:
        offsets.append(total)
        total += len(line)
    starts = []
    delim = re.compile(r"^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$")
    for i in range(len(lines) - 1):
        if "|" in lines[i] and delim.match(lines[i + 1].rstrip("\n")):
            starts.append(offsets[i])
    return starts


def list_starts(text):
    lines = text.splitlines(keepends=True)
    starts = []
    offset = 0
    previous_list = False
    pat = re.compile(r"^\s*(?:[-*+] |\d+\. )")
    for line in lines:
        current = bool(pat.match(line))
        if current and not previous_list:
            starts.append(offset)
        previous_list = current
        offset += len(line)
    return starts


def validate_structure_selector(path, selector):
    text = path.read_text(encoding="utf-8")
    anchor = selector.get("anchor")
    if not isinstance(anchor, str) or not anchor:
        raise KeyError("STRUCTURE_AFTER_ANCHOR requires anchor")
    anchors = [m.start() for m in re.finditer(re.escape(anchor), text)]
    anchor_start = choose(anchors, selector.get("anchor_occurrence"), f"anchor {anchor!r}")
    tail = text[anchor_start + len(anchor):]
    next_heading = re.search(r"(?m)^#{1,6}\s+", tail)
    local = tail[:next_heading.start()] if next_heading else tail
    typ = selector.get("structure_type")
    if typ == "CODE_BLOCK":
        structures = code_block_starts(local)
    elif typ == "TABLE":
        structures = table_starts(local)
    elif typ == "LIST":
        structures = list_starts(local)
    else:
        raise KeyError(f"unsupported structure type {typ!r}")
    choose(structures, selector.get("occurrence"), f"{typ} after {anchor!r}")
    return True


def validate_structure_bindings(assets):
    for asset_path, asset in assets.items():
        smap = base.source_map(asset)
        for binding in base.iter_bindings(asset):
            selector = binding.get("selector") if isinstance(binding, dict) else None
            if not isinstance(selector, dict) or selector.get("type") != "STRUCTURE_AFTER_ANCHOR":
                continue
            source = smap.get(binding.get("source_id"))
            if not isinstance(source, dict):
                fail(f"{Path(asset_path).relative_to(ROOT)}: structure selector has unknown source")
                continue
            try:
                validate_structure_selector(ROOT / source.get("path", ""), selector)
            except Exception as exc:
                fail(f"{Path(asset_path).relative_to(ROOT)}: non-exact STRUCTURE_AFTER_ANCHOR {selector}: {exc}")


def validate_commit_provenance(manifest):
    source_head = manifest.get("source_current_head")
    compiled = manifest.get("compiled_commit")
    for label, sha in (("source_current_head", source_head), ("compiled_commit", compiled)):
        if not isinstance(sha, str) or not re.fullmatch(r"[0-9a-f]{40}", sha):
            fail(f"manifest: {label} must be 40-hex SHA")
        elif not git_commit_exists(sha):
            fail(f"manifest: {label} commit not available in checkout: {sha}")
    if isinstance(source_head, str) and isinstance(compiled, str) and git_commit_exists(source_head) and git_commit_exists(compiled):
        if not is_ancestor(source_head, compiled):
            fail("manifest: source_current_head must be an ancestor of compiled_commit")
        if not is_ancestor(compiled, "HEAD"):
            fail("manifest: compiled_commit must remain an ancestor of validation HEAD")


def hardening_self_test():
    synthetic = "anchor\n```\none\n```\n\n```\ntwo\n```\n# next\n"
    tmp = PROJ / "tools/.projection-selector-selftest.tmp.md"
    try:
        tmp.write_text(synthetic, encoding="utf-8")
        validate_structure_selector(tmp, {"anchor": "anchor", "structure_type": "CODE_BLOCK", "occurrence": 2})
        try:
            validate_structure_selector(tmp, {"anchor": "anchor", "structure_type": "CODE_BLOCK"})
            fail("self-test: ambiguous structure without occurrence was accepted")
        except KeyError:
            pass
        try:
            validate_structure_selector(tmp, {"anchor": "anchor", "structure_type": "CODE_BLOCK", "occurrence": 3})
            fail("self-test: out-of-range structure occurrence was accepted")
        except KeyError:
            pass
    finally:
        try:
            tmp.unlink()
        except FileNotFoundError:
            pass


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    base.errors.clear()
    base.warnings.clear()
    manifest = load_json(MANIFEST_PATH)
    if manifest is None:
        return 1

    systems = validate_manifest_and_systems(manifest)
    validate_eligibility_accounting(manifest)
    validate_accounting_summaries(manifest)
    validate_commit_provenance(manifest)

    assets = {}
    for sid, path in base.manifest_assets(manifest):
        if not path.exists():
            fail(f"manifest asset missing: {path.relative_to(ROOT)}")
            continue
        asset = load_json(path)
        if asset is None:
            continue
        assets[str(path)] = asset
        system = systems.get(sid)
        if system is None:
            fail(f"{path.relative_to(ROOT)}: normalized Current System owner unresolved")
            continue
        base.validate_asset(asset, str(path.relative_to(ROOT)), system)

    expected_assets = manifest.get("coverage", {}).get("total_projection_assets")
    if isinstance(expected_assets, int) and len(assets) != expected_assets:
        fail(f"loaded projection asset count {len(assets)} != manifest {expected_assets}")

    validate_structure_bindings(assets)
    if args.self_test:
        base.self_test(manifest, assets)
        hardening_self_test()

    for msg in base.errors:
        fail(f"base-validator: {msg}")
    for warning in base.warnings:
        print(f"WARN: {warning}")

    if errors:
        for error in errors:
            print(f"FAIL: {error}")
        print(f"XIZONG_PROJECTION_V1_VALIDATION: FAIL ({len(errors)} errors)")
        return 1

    coverage = manifest.get("coverage", {})
    print("XIZONG_PROJECTION_V1_VALIDATION: PASS")
    print(f"coverage: {coverage.get('systems')} systems / {coverage.get('blocks')} blocks / {coverage.get('total_projection_assets')} assets")
    print("current_system_identity_normalization: PASS")
    print("eligibility_owner_accounting: PASS")
    print("block_disposition_accounting: PASS")
    print("freshness: STRICT_BLOB + RESOLVE_BINDING")
    print("selector_exactness: PASS")
    print("neutral_front: PASS")
    print("structure_occurrence_exactness: PASS")
    print("commit_provenance_ancestry: PASS")
    if args.self_test:
        print("r10_and_hardening_self_tests: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
