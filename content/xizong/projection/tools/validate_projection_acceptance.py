#!/usr/bin/env python3
"""Companion gate for Current Xizong Projection accounting/provenance.

Asset binding/visibility semantics stay owned by validate_projection.py. This file checks
only repository-wide eligibility/accounting shape, declared Projection-file coverage and
source-current provenance for the Current manifest. It intentionally does not duplicate
medical, learning, renderer or learner-state validation.
"""
from __future__ import annotations
import argparse, copy, json, re, subprocess, sys
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parents[4]
PROJ = ROOT / "content/xizong/projection"
MANIFEST = PROJ / "manifest.json"
KM = ROOT / "content/xizong/knowledge/manifest.json"

def load(p): return json.loads(Path(p).read_text(encoding="utf-8"))

def rootize(v):
    v = v.strip("/")
    if v.startswith("systems/"):
        v = "content/xizong/knowledge/" + v
    return v + "/"

def commit(sha):
    return isinstance(sha, str) and bool(re.fullmatch(r"[0-9a-f]{40}", sha)) and subprocess.run(
        ["git", "cat-file", "-e", f"{sha}^{{commit}}"], cwd=ROOT,
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
    ).returncode == 0

def ancestor(a, b):
    return subprocess.run(
        ["git", "merge-base", "--is-ancestor", a, b], cwd=ROOT,
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
    ).returncode == 0

def expected_roots():
    km = load(KM); out = set()
    domains = km.get("macro_domain_taxonomy", {}).get("domains", {})
    if not isinstance(domains, dict):
        raise ValueError("knowledge manifest domains missing")
    for d in domains.values():
        owners = d.get("system_owners", []) if isinstance(d, dict) else []
        if not isinstance(owners, list):
            raise ValueError("system_owners must be list")
        for x in owners:
            if not isinstance(x, str) or not x:
                raise ValueError("invalid system owner")
            out.add(rootize(x))
    return out

def safe_rel(rel):
    if not isinstance(rel, str) or not rel:
        return False
    p = PurePosixPath(rel)
    return not p.is_absolute() and ".." not in p.parts

def validate(m):
    e = []
    def bad(code, msg): e.append(f"{code}: {msg}")

    req = {
        "schema", "schema_version", "status", "runtime_authority", "source_current_head",
        "systems", "coverage", "eligibility_accounting", "validation"
    }
    missing = req - set(m)
    if missing:
        bad("SCHEMA", f"missing {sorted(missing)}")
    if m.get("schema") != "kianos.xizong.cognitive_projection.manifest.v1":
        bad("SCHEMA", "wrong schema")
    if not isinstance(m.get("schema_version"), str) or not m["schema_version"].strip():
        bad("SCHEMA", "schema_version required")
    if not isinstance(m.get("status"), str) or not m["status"].strip():
        bad("SCHEMA", "status required")
    if m.get("runtime_authority") is not False:
        bad("BOUNDARY", "Projection must remain non-runtime authority")

    source_head = m.get("source_current_head")
    if not commit(source_head):
        bad("PROVENANCE", f"source_current_head unavailable: {source_head!r}")
    elif not ancestor(source_head, "HEAD"):
        bad("PROVENANCE", "source_current_head not ancestor of HEAD")

    systems = m.get("systems", {})
    if not isinstance(systems, dict) or not systems:
        bad("SCHEMA", "systems must be nonempty mapping")
        systems = {}

    elig = m.get("eligibility_accounting", {})
    comp = elig.get("compiled", []) if isinstance(elig, dict) else []
    defer = elig.get("not_eligible", []) if isinstance(elig, dict) else []
    if not isinstance(comp, list) or not isinstance(defer, list):
        bad("ELIGIBILITY", "compiled/not_eligible must be lists")
        comp, defer = [], []

    roots, bysid, cids = [], {}, []
    for x in comp:
        if not isinstance(x, dict):
            bad("ELIGIBILITY", "compiled entry not object")
            continue
        sid = x.get("system_id"); cid = x.get("canonical_id"); cids.append(cid)
        status = x.get("status")
        if not isinstance(status, str) or not status.startswith("ELIGIBLE_COMPILED"):
            bad("ELIGIBILITY", f"{sid}: wrong compiled status {status!r}")
        if not isinstance(sid, str) or not sid or sid in bysid:
            bad("ELIGIBILITY", f"invalid/duplicate system_id {sid!r}")
            continue
        bysid[sid] = x
        if isinstance(x.get("owner_root"), str):
            roots.append(rootize(x["owner_root"]))
        else:
            bad("ELIGIBILITY", f"{sid}: owner_root missing")

    for x in defer:
        if not isinstance(x, dict):
            bad("ELIGIBILITY", "not_eligible entry not object")
            continue
        cid = x.get("canonical_id"); cids.append(cid)
        if x.get("status") != "NOT_ELIGIBLE":
            bad("ELIGIBILITY", f"{cid}: wrong deferred status")
        if not isinstance(x.get("reason"), str) or not x["reason"].strip():
            bad("ELIGIBILITY", f"{cid}: reason required")
        if isinstance(x.get("owner_root"), str):
            roots.append(rootize(x["owner_root"]))
        else:
            bad("ELIGIBILITY", f"{cid}: owner_root missing")

    try:
        exp = expected_roots()
    except Exception as ex:
        bad("ELIGIBILITY", str(ex)); exp = set()

    if set(roots) != exp:
        bad("ELIGIBILITY", f"owner roots mismatch missing={sorted(exp-set(roots))} extra={sorted(set(roots)-exp)}")
    if len(roots) != len(set(roots)):
        bad("ELIGIBILITY", "owner_root accounted more than once")
    if len(cids) != len(set(cids)):
        bad("ELIGIBILITY", "canonical_id accounted more than once")
    if set(bysid) != set(systems):
        bad("ELIGIBILITY", "compiled systems != manifest systems")

    total_blocks = 0
    declared_assets = []
    block_ids = []
    expected_by_cid = {}
    for sid, spec in systems.items():
        if not isinstance(spec, dict):
            bad("SCHEMA", f"{sid}: system spec not object")
            continue
        x = bysid.get(sid, {})
        cid = spec.get("canonical_id")
        count = spec.get("block_count")
        blocks = spec.get("blocks", [])
        system_projection = spec.get("system_projection")
        if x.get("canonical_id") != cid or x.get("block_count") != count:
            bad("ELIGIBILITY", f"{sid}: canonical/block count mismatch")
        if not isinstance(cid, str) or not cid:
            bad("ACCOUNTING", f"{sid}: canonical_id required")
        elif cid in expected_by_cid:
            bad("ACCOUNTING", f"duplicate canonical_id {cid}")
        if not isinstance(count, int) or count < 0:
            bad("ACCOUNTING", f"{sid}: invalid block_count {count!r}")
            count = 0
        if not isinstance(blocks, list):
            bad("ACCOUNTING", f"{sid}: blocks must be list")
            blocks = []
        if len(blocks) != len(set(blocks)):
            bad("ACCOUNTING", f"{sid}: duplicate block paths")
        if len(blocks) != count:
            bad("ACCOUNTING", f"{sid}: block_count/list mismatch {count}/{len(blocks)}")
        if not safe_rel(system_projection):
            bad("ACCOUNTING", f"{sid}: invalid system_projection")
        else:
            p = PROJ / system_projection
            if not p.is_file():
                bad("ACCOUNTING", f"{sid}: missing system projection {system_projection}")
            declared_assets.append(system_projection)

        local_ids = []
        for rel in blocks:
            if not safe_rel(rel):
                bad("ACCOUNTING", f"{sid}: invalid block projection path {rel!r}")
                continue
            p = PROJ / rel
            if not p.is_file():
                bad("ACCOUNTING", f"{sid}: missing block projection {rel}")
                continue
            try:
                obj = load(p)
            except Exception as ex:
                bad("ACCOUNTING", f"{sid}: unreadable {rel}: {ex}")
                continue
            if obj.get("system_id") != sid:
                bad("ACCOUNTING", f"{sid}: asset System mismatch {rel}")
            bid = obj.get("block_id")
            if not isinstance(bid, str) or not bid:
                bad("ACCOUNTING", f"{sid}: block_id missing {rel}")
            else:
                local_ids.append(bid); block_ids.append(bid)
            declared_assets.append(rel)
        if len(local_ids) != len(set(local_ids)):
            bad("ACCOUNTING", f"{sid}: duplicate block_id inside System")
        total_blocks += count
        if isinstance(cid, str) and cid:
            expected_by_cid[cid] = count

    if len(declared_assets) != len(set(declared_assets)):
        bad("ACCOUNTING", "Projection asset path declared more than once")
    if len(block_ids) != len(set(block_ids)):
        bad("ACCOUNTING", "block_id declared across more than one System")

    cov = m.get("coverage", {})
    if not isinstance(cov, dict):
        bad("ACCOUNTING", "coverage must be object")
        cov = {}
    if cov.get("systems") != len(systems):
        bad("ACCOUNTING", f"system summary mismatch {len(systems)}")
    if cov.get("blocks") != total_blocks:
        bad("ACCOUNTING", f"block summary mismatch {total_blocks}")
    if cov.get("total_projection_assets") != len(systems) + total_blocks:
        bad("ACCOUNTING", f"asset summary mismatch {len(systems)+total_blocks}")
    if cov.get("expected") != expected_by_cid:
        bad("ACCOUNTING", f"expected canonical counts mismatch {expected_by_cid}")

    disp = cov.get("eligible_block_accounting")
    if not isinstance(disp, dict) or not disp or any(type(v) is not int or v < 0 for v in disp.values()):
        bad("ACCOUNTING", "eligible_block_accounting must be nonempty nonnegative integer mapping")
    elif sum(disp.values()) != total_blocks:
        bad("ACCOUNTING", f"eligible block accounting sum mismatch {sum(disp.values())}/{total_blocks}")

    stale = cov.get("stale_accounting")
    if not isinstance(stale, dict) or not stale or any(type(v) is not int or v < 0 for v in stale.values()):
        bad("ACCOUNTING", "stale_accounting must be nonempty nonnegative integer mapping")
    elif sum(stale.values()) != total_blocks:
        bad("ACCOUNTING", f"stale accounting sum mismatch {sum(stale.values())}/{total_blocks}")

    rich = cov.get("rich_calibration_blocks", [])
    if not isinstance(rich, list) or len(rich) != len(set(rich)):
        bad("ACCOUNTING", "rich_calibration_blocks must be unique list")
        rich = []
    if any(x not in set(block_ids) for x in rich):
        bad("ACCOUNTING", "rich calibration references unknown block_id")
    baseline = cov.get("baseline_projection_blocks")
    if not isinstance(baseline, int) or baseline < 0 or baseline + len(rich) != total_blocks:
        bad("ACCOUNTING", f"baseline/rich accounting mismatch {baseline!r}+{len(rich)}/{total_blocks}")

    validation = m.get("validation", {})
    if not isinstance(validation, dict):
        bad("SCHEMA", "validation must be object")
    else:
        if validation.get("validator") != "content/xizong/projection/tools/validate_projection.py":
            bad("SCHEMA", "unexpected authoritative validator path")
        if not isinstance(validation.get("validator_version"), str) or not validation["validator_version"].strip():
            bad("SCHEMA", "validator_version required")

    return e

def selftests(m):
    fails = []
    def expect(name, x, prefix):
        got = validate(x)
        if not any(z.startswith(prefix + ":") for z in got):
            fails.append(f"{name}: expected {prefix}, got {got}")

    x = copy.deepcopy(m)
    x["coverage"]["blocks"] = int(x["coverage"].get("blocks", 0)) + 1
    expect("bad_block_summary", x, "ACCOUNTING")

    x = copy.deepcopy(m)
    sid = next(iter(x["systems"]))
    x["systems"][sid]["blocks"] = x["systems"][sid]["blocks"][:-1]
    expect("missing_declared_block", x, "ACCOUNTING")

    x = copy.deepcopy(m)
    x["eligibility_accounting"]["not_eligible"][0]["owner_root"] = x["eligibility_accounting"]["compiled"][0]["owner_root"]
    expect("duplicate_owner", x, "ELIGIBILITY")

    x = copy.deepcopy(m)
    x["source_current_head"] = "0" * 40
    expect("bad_commit", x, "PROVENANCE")

    x = copy.deepcopy(m)
    x["runtime_authority"] = True
    expect("runtime_authority", x, "BOUNDARY")

    return fails

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--self-test", action="store_true")
    ap.add_argument("--json", type=Path)
    a = ap.parse_args()
    m = load(MANIFEST)
    issues = validate(m)
    tf = selftests(m) if a.self_test else []
    status = "PASS" if not issues and not tf else "FAIL"
    report = {
        "status": status,
        "scope": "PROJECTION_CURRENT_ACCOUNTING_AND_PROVENANCE_ONLY",
        "issues": issues,
        "self_test_failures": tf,
        "compiled_systems": len(m.get("systems", {})),
        "eligible_blocks": m.get("coverage", {}).get("blocks"),
        "accounted_system_owner_roots": len(expected_roots()),
        "not_claimed": [
            "medical_semantic_acceptance", "browser_answer_leak_safety", "Mac_visual_acceptance",
            "runtime_adoption", "learner_progress"
        ]
    }
    if a.json:
        a.json.parent.mkdir(parents=True, exist_ok=True)
        a.json.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for x in issues: print("FAIL", x)
    for x in tf: print("SELF_TEST_FAIL", x)
    print("XIZONG_PROJECTION_ACCEPTANCE:", status)
    print("eligibility_owner_accounting:", "FAIL" if any(x.startswith("ELIGIBILITY:") for x in issues) else "PASS")
    print("projection_coverage_accounting:", "FAIL" if any(x.startswith("ACCOUNTING:") for x in issues) else "PASS")
    print("commit_provenance:", "FAIL" if any(x.startswith("PROVENANCE:") for x in issues) else "PASS")
    if a.self_test:
        print("acceptance_self_tests:", "FAIL" if tf else "PASS")
    print("boundary: current accounting/provenance only; validate_projection.py remains authoritative for bindings/visibility")
    return 0 if status == "PASS" else 1

if __name__ == "__main__":
    sys.exit(main())
