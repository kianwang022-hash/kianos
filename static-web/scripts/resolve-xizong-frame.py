"""State-free build consumer of the existing Current Projection validator/resolver."""
import json
import sys
from pathlib import Path
root = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(root / 'content/xizong/projection/tools'))
from validate_projection import Validator, PREFIX, MANIFEST
validator = Validator(root)
report = validator.run()
if report['status'] != 'PASS':
    raise RuntimeError(json.dumps(report['issues'], ensure_ascii=False))
manifest = validator.repo.json(MANIFEST)
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
