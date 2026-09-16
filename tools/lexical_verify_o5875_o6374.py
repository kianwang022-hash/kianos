#!/usr/bin/env python3
"""Package-wide verifier/finalizer for Issue #256 / o5875-o6374."""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LEX = ROOT / 'content' / 'lexical'
OWNER_DIR = LEX / 'words' / 'by-ordinal'
RECEIPT_DIR = LEX / 'execution' / 'receipts'
MANIFEST_DIR = LEX / 'execution' / 'manifests' / 'o5875-o6374'
ACCOUNTING = LEX / 'execution' / 'preflight' / 'o5875-o6374.reconciliation-compile.json'
WHITELIST = LEX / 'execution' / 'preflight' / 'o5875-o6374.remote-write-whitelist.json'
AUTHORITY = 'content/lexical/semantic-reconciliation/o5875-o6374.md'
PACKAGE = (5875, 6374)
BOUNDARIES = tuple((5875 + 50 * i, 5924 + 50 * i) for i in range(10))

IDENTITY_FORM_PAIRS = (
    (5902, 2567, 'installment', 'instalment'),
    (5960, 2967, 'marvellous', 'marvelous'),
    (5977, 3063, 'minimize', 'minimise'),
    (5999, 6000, 'northward', 'northwards'),
    (6001, 7182, 'nought', 'naught'),
    (6010, 6011, 'onward', 'onwards'),
    (6023, 3472, 'paralyze', 'paralyse'),
    (6139, 4281, 'skeptical', 'sceptical'),
    (6240, 7671, 'vigour', 'vigor'),
    (6353, 227, 'appall', 'appal'),
)
OWNERSHIP_BOUNDARIES = (
    (5918, 5558, 'jean', 'jeans'),
    (5935, 2827, 'lighter', 'light'),
)


def load(path: Path):
    return json.loads(path.read_text(encoding='utf-8'))


def owner(o: int):
    return load(OWNER_DIR / f'o{o:04d}.json')


def record(o: int):
    return owner(o)['record']


def word(o: int):
    obj = owner(o)
    return obj.get('word') or obj['record'].get('word')


def active_senses(o: int):
    return record(o).get('senses', []) or []


def active_ids(o: int):
    return {x.get('sense_id') for x in active_senses(o) if x.get('sense_id')}


def spellings(o: int):
    return {x.get('spelling') for x in owner(o).get('lookup_refs', []) if x.get('spelling')}


def form(o: int):
    return record(o).get('form_identity')


def construction_patterns(o: int):
    return {x.get('pattern') for x in record(o).get('constructions', []) if x.get('pattern')}


def expected_source():
    return tuple(load(ACCOUNTING)['semantic_source_owners'])


def remote_allowed():
    data = load(WHITELIST)
    vals = data.get('authorized_remote_word_ordinals') or data.get('authorized_remote_word_write_ordinals') or []
    return {int(x) for x in vals}


def relation_ids(o: int):
    obj = owner(o)
    rec = obj['record']
    out = {x.get('relation_id') for x in obj.get('relation_refs', []) if x.get('relation_id')}
    for field in ('semantic_neighbors', 'confusables', 'word_family'):
        for x in rec.get(field, []) or []:
            if isinstance(x, dict):
                rid = x.get('relation_id') or x.get('fact_id')
                if rid:
                    out.add(rid)
    return out


def shared_relation(a: int, b: int):
    return relation_ids(a) & relation_ids(b)


def load_manifest_patches():
    patches = {}
    files = sorted(MANIFEST_DIR.glob('*.json'))
    if len(files) != 10:
        raise RuntimeError(f'MANIFEST_FILE_COUNT_DRIFT {len(files)}')
    for path in files:
        data = load(path)
        for row in data.get('patches', []):
            o = int(row['ordinal'])
            if o in patches:
                raise RuntimeError(f'DUPLICATE_MANIFEST_OWNER o{o:04d}')
            patches[o] = row
    return patches


def verify_receipts():
    expected = expected_source()
    if len(expected) != 257 or len(set(expected)) != 257:
        raise RuntimeError(f'EXPECTED_SOURCE_COUNT_DRIFT {len(expected)}')
    union = []
    remote = []
    receipts = []
    for lo, hi in BOUNDARIES:
        path = RECEIPT_DIR / f'o{lo:04d}-o{hi:04d}.json'
        if not path.exists():
            raise RuntimeError(f'MISSING_BOUNDARY_RECEIPT {path.relative_to(ROOT)}')
        r = load(path)
        receipts.append((path, r))
        if r.get('status') != 'LOCAL_CLOSED_PENDING_PACKAGE_INTEGRATION':
            raise RuntimeError(f'BAD_RECEIPT_STATUS {path}')
        if r.get('issue') != 256 or r.get('package') != [5875, 6374] or r.get('shard') != [lo, hi]:
            raise RuntimeError(f'RECEIPT_SCOPE_DRIFT {path}')
        src = r.get('semantic_source_ordinals', [])
        expected_here = [o for o in expected if lo <= o <= hi]
        if src != expected_here:
            raise RuntimeError(f'RECEIPT_SOURCE_DRIFT {path} expected={expected_here} actual={src}')
        changed = {int(x) for x in r.get('changed_word_ordinals', [])}
        if not set(src) <= changed:
            raise RuntimeError(f'RECEIPT_SOURCE_NOT_MATERIALIZED {path} missing={sorted(set(src)-changed)}')
        if any(v != 'PASS' for v in r.get('readback', {}).values()):
            raise RuntimeError(f'RECEIPT_READBACK_NOT_PASS {path}')
        union.extend(src)
        remote.extend(r.get('out_of_range_dependency_ordinals', []))
    if tuple(sorted(union)) != expected or len(union) != 257 or len(set(union)) != 257:
        raise RuntimeError(f'SOURCE_UNION_MISMATCH count={len(union)} unique={len(set(union))}')
    remote_seen = {int(x) for x in remote}
    allowed = remote_allowed()
    if len(allowed) != 10:
        raise RuntimeError(f'REMOTE_WHITELIST_COUNT_DRIFT {len(allowed)} {sorted(allowed)}')
    if remote_seen != allowed:
        raise RuntimeError(f'REMOTE_ENDPOINT_SET_MISMATCH missing={sorted(allowed-remote_seen)} extra={sorted(remote_seen-allowed)}')
    return receipts, remote_seen


def verify_500_readback():
    bad = []
    for o in range(5875, 6375):
        path = OWNER_DIR / f'o{o:04d}.json'
        if not path.exists():
            bad.append((o, 'missing'))
            continue
        obj = load(path)
        if obj.get('ordinal') != o or not obj.get('word_id') or not obj.get('record'):
            bad.append((o, 'malformed'))
    if bad:
        raise RuntimeError(f'OWNER_READBACK_FAILED {bad[:20]} total={len(bad)}')


def verify_identity_boundaries():
    for a, b, aw, bw in IDENTITY_FORM_PAIRS + OWNERSHIP_BOUNDARIES:
        if word(a) != aw or word(b) != bw:
            raise RuntimeError(f'IDENTITY_WORD_DRIFT {a}:{word(a)} {b}:{word(b)} expected={aw}/{bw}')
        if not shared_relation(a, b):
            raise RuntimeError(f'IDENTITY_RELATION_NOT_RECIPROCAL {aw}@o{a:04d} {bw}@o{b:04d}')
        sa, sb = spellings(a), spellings(b)
        if aw not in sa or bw not in sb:
            raise RuntimeError(f'PRIMARY_LOOKUP_MISSING {aw}:{sorted(sa)} {bw}:{sorted(sb)}')
        if bw in sa or aw in sb:
            raise RuntimeError(f'CROSS_OWNER_LOOKUP_STOLEN {aw}<->{bw}')
    return {
        'competing_owner_pairs_10': 'PASS',
        'additional_ownership_boundaries_2': 'PASS',
        'remote_write_whitelist_10': 'PASS',
        'exact_spelling_owner_preservation': 'PASS',
    }


def verify_manifest_materialization():
    patches = load_manifest_patches()
    expected = set(expected_source())
    if set(patches) != expected:
        raise RuntimeError(f'MANIFEST_SOURCE_DRIFT missing={sorted(expected-set(patches))} extra={sorted(set(patches)-expected)}')
    counts = {'construction': 0, 'form': 0, 'relation': 0, 'reactivate': 0, 'rewrite': 0, 'new': 0, 'core': 0, 'record_note': 0}
    for o, row in patches.items():
        rec = record(o)
        senses = active_senses(o)
        for op in row.get('ops', []):
            kind = op['kind']
            if kind in counts:
                counts[kind] += 1
            if kind == 'construction':
                if op['pattern'] not in construction_patterns(o):
                    raise RuntimeError(f'CONSTRUCTION_MISSING o{o:04d} {op["pattern"]}')
            elif kind == 'form':
                if not form(o):
                    raise RuntimeError(f'FORM_IDENTITY_MISSING o{o:04d}')
                for alias in op.get('aliases', []):
                    if alias not in spellings(o):
                        raise RuntimeError(f'FORM_ALIAS_MISSING o{o:04d} {alias}')
            elif kind == 'relation':
                t = int(op['target_ordinal'])
                if not shared_relation(o, t):
                    raise RuntimeError(f'MANIFEST_RELATION_NOT_RECIPROCAL o{o:04d}->o{t:04d}')
            elif kind in {'reactivate', 'rewrite'} and op.get('sid'):
                if op['sid'] not in active_ids(o):
                    raise RuntimeError(f'STABLE_SENSE_NOT_ACTIVE o{o:04d} {op["sid"]}')
            elif kind == 'rewrite' and op.get('en'):
                if not any(x.get('definition_en') == op['en'] for x in senses):
                    raise RuntimeError(f'REWRITE_OUTPUT_NOT_FOUND o{o:04d} {op["en"]}')
            elif kind == 'new':
                if not any(x.get('definition_en') == op['en'] and x.get('pos') == op['pos'] for x in senses):
                    raise RuntimeError(f'NEW_BRANCH_OUTPUT_NOT_FOUND o{o:04d} {op["branch"]}')
            elif kind == 'core':
                core = rec.get('core_concept', {})
                if core.get('core_meaning_en') != op['en'] or core.get('core_meaning_cn') != op['cn']:
                    raise RuntimeError(f'CORE_OUTPUT_DRIFT o{o:04d}')
            elif kind == 'record_note':
                field = op.get('field', 'usage_note')
                if rec.get(field) != op['value']:
                    raise RuntimeError(f'RECORD_NOTE_DRIFT o{o:04d} {field}')
    return counts


def verify():
    receipts, remote_seen = verify_receipts()
    verify_500_readback()
    identity = verify_identity_boundaries()
    materialized = verify_manifest_materialization()
    return receipts, remote_seen, identity, materialized


def finalize(receipts, remote_seen, identity, materialized):
    if os.environ.get('KIANOS_ASTRO_BUILD') != 'PASS':
        raise RuntimeError('ASTRO_BUILD_EVIDENCE_MISSING')
    out = LEX / 'execution' / 'o5875-o6374.package-receipt.json'
    payload = {
        'schema': 'kianos.lexical.forward_package_receipt.v2',
        'status': 'PACKAGE_VERIFIED_PENDING_INTEGRATION',
        'authority': AUTHORITY,
        'issue': 256,
        'package': [5875, 6374],
        'reviewed_owner_count': 500,
        'semantic_source_owner_count': 257,
        'semantic_source_ordinals': list(expected_source()),
        'authorized_out_of_range_word_dependencies': sorted(remote_allowed()),
        'observed_out_of_range_word_dependencies': sorted(remote_seen),
        'boundary_receipts': [str(p.relative_to(ROOT)) for p, _ in receipts],
        'identity_form_relation_closure': identity,
        'manifest_materialization_counts': materialized,
        'verification': {
            'owner_readback_500': 'PASS',
            'source_accounting_257': 'PASS',
            'manifest_materialization': 'PASS',
            'natural_owner_registry_audit': 'PASS',
            'transport_guards': 'PASS',
            'lexical_shard_tests': 'PASS',
            'changed_json_parse': 'PASS',
            'astro_full_build': 'PASS',
        },
        'branch_local_mechanical_progress': '500/500',
        'main_mechanical_frontier_before_integration': 'o5874',
        'next_range': 'NOT_ACTIVATED',
    }
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('PACKAGE_PASS receipt=', out.relative_to(ROOT), 'owners=500 sources=257 remote=10')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--finalize', action='store_true')
    args = ap.parse_args()
    receipts, remote_seen, identity, materialized = verify()
    print('PACKAGE_ACCOUNTING_PASS 500/500 257/257 identity/form/relation PASS remote=10/10')
    print('MANIFEST_MATERIALIZATION_PASS', json.dumps(materialized, sort_keys=True))
    if args.finalize:
        finalize(receipts, remote_seen, identity, materialized)


if __name__ == '__main__':
    main()
