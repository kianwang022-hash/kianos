"""State-free build consumer of the existing Current Projection validator/resolver."""
import json
import sys
from pathlib import Path
root = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(root / 'content/xizong/projection/tools'))
from validate_projection_v1 import Validator, PREFIX, MANIFEST
validator = Validator(root)
# #148 owns A1-A3 only. Use the maintained v1 resolver without reading other
# systems' content merely because main adds another independent lane.
manifest = validator.repo.json(MANIFEST)
manifest = {**manifest, 'systems': {sid: spec for sid, spec in manifest['systems'].items() if sid in {'circulation', 'respiratory', 'urinary'}}}
if set(manifest['systems']) != {'circulation', 'respiratory', 'urinary'}:
    raise RuntimeError('CURRENT_A1_A2_A3_SLOT_MISSING')
validator.build_owners(manifest)
seen = set()
for sid, spec in manifest['systems'].items():
    owned = {bid for bid, b in validator.blocks.items() if b['system_id'] == sid}
    if spec['block_count'] != len(owned) or len(spec['blocks']) != len(owned):
        raise RuntimeError('CURRENT_SCOPE_COVERAGE_MISMATCH')
    actual = set()
    for relative, is_system in [(spec['system_projection'], True), *[(p, False) for p in spec['blocks']]]:
        full = PREFIX + relative
        if full in seen: raise RuntimeError('DUPLICATE_CURRENT_PROJECTION_SLOT')
        seen.add(full)
        asset = validator.repo.json(full)
        validator.asset(asset, full, sid, is_system)
        validator.results[full] = {'status': 'PASS'}
        if not is_system: actual.add(asset['block_id'])
    if actual != owned: raise RuntimeError('CURRENT_BLOCK_ID_COVERAGE_MISMATCH')
report = validator.report()
if report['status'] != 'PASS': raise RuntimeError(json.dumps(report['issues']))
output = {}
for sid, spec in manifest['systems'].items():
    if sid not in {'circulation', 'respiratory', 'urinary'}:
        raise RuntimeError('OUTSIDE_CURRENT_A1_A2_A3')
    for relative in [spec['system_projection'], *spec['blocks']]:
        asset = validator.repo.json(PREFIX + relative)
        sources = validator.source_registry(asset)
        output[asset.get('block_id', sid)] = {
            'path': PREFIX + relative,
            'views': asset['views'],
            'objects': [{**obj, 'value': validator.resolve(asset, obj['binding'], sources)} for obj in asset['objects']],
        }
print(json.dumps({'accounting': {k: report[k] for k in ['status','systems','blocks','assets','canonical_kps','resolved_binding_count']}, 'assets': output}, ensure_ascii=False))
