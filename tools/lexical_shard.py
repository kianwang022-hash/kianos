#!/usr/bin/env python3
"""Bounded, loss-aware lexical transport. Never judges semantics or pushes Git."""
from __future__ import annotations
import argparse
import copy
import hashlib
import json
import re
import subprocess
from pathlib import Path

LEX = 'content/lexical/'
WORD = LEX + 'words/by-ordinal/o{:04d}.json'
CONTRACTS = [LEX + x for x in ('CURRENT.md', 'LEARNING_CONTRACT.md',
    'CONTENT_ASSET_CONTRACT.md', 'CONTENT_EXECUTION.md', 'schema.json')]
OMIT_OWNER = {'provenance', 'lookup_refs'}
OMIT_RECORD = {'content_hash', 'processing_status', 'verification_summary',
               'review_signature', 'needs_delta_review'}


def require(ok, message):
    if not ok:
        raise ValueError(message)


def encoded(obj):
    return json.dumps(obj, ensure_ascii=False, sort_keys=True,
                      separators=(',', ':'), allow_nan=False).encode('utf-8')


def digest(obj):
    return hashlib.sha256(encoded(obj)).hexdigest()


def bytehash(data):
    return hashlib.sha256(data).hexdigest()


def load(path):
    return json.loads(Path(path).read_text(encoding='utf-8'))


def save(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2,
                              allow_nan=False) + '\n', encoding='utf-8')


def safe(root, name):
    require(isinstance(name, str) and not Path(name).is_absolute(), 'UNSAFE_PATH')
    require('..' not in Path(name).parts, 'UNSAFE_PATH')
    root = Path(root).resolve()
    path = root / name
    require(path.resolve().is_relative_to(root), 'UNSAFE_PATH')
    for p in (path, *path.parents):
        if p == root:
            break
        require(not p.is_symlink(), 'SYMLINK_NOT_ALLOWED')
    return path


def view(owner):
    # Deliberately conservative: keep uncertainty, evidence, reference senses,
    # lifecycle, all unfamiliar fields, and every semantic record field.
    result = {k: copy.deepcopy(v) for k, v in owner.items() if k not in OMIT_OWNER}
    if isinstance(result.get('record'), dict):
        result['record'] = {k: v for k, v in result['record'].items()
                            if k not in OMIT_RECORD}
    return result


def relation_path(ref):
    rid = ref.get('relation_id')
    require(isinstance(rid, str) and rid, 'RELATION_ID_MISSING')
    h = hashlib.sha256(rid.encode('utf-8')).hexdigest()
    return LEX + f'relations/by-id/{h[:2]}/{h}.json'


def relation_views(word, relations):
    for ref in word.get('relation_refs', []):
        owner = relations[relation_path(ref)]
        require(owner.get('relation_id') == ref['relation_id'], 'RELATION_ID_MISMATCH')
        matches = [v for v in owner.get('word_views', [])
                   if v.get('source_word_id') == word['word_id']
                   and v.get('field') == ref.get('field')
                   and v.get('index') == ref.get('index')]
        require(len(matches) == 1 and isinstance(matches[0].get('payload'), dict),
                'RELATION_VIEW_MISSING_OR_AMBIGUOUS')


def seal(obj, key):
    return {**obj, key: digest(obj)}


def verify_seal(obj, key):
    require(obj.get(key) == digest({k: v for k, v in obj.items() if k != key}),
            'ENVELOPE_HASH_MISMATCH')


def check_readset(root, readset):
    for name, expected in readset.items():
        p = safe(root, name)
        require(p.is_file() and bytehash(p.read_bytes()) == expected,
                'STALE_READ_SET:' + name)


def export(root, start, end, max_bytes=48000, max_words=50):
    require(type(start) is int and type(end) is int and 1 <= start <= end <= 7946,
            'INVALID_RANGE')
    require(max_bytes > 0 and max_words > 0, 'INVALID_BUDGET')
    readset = {p: bytehash(safe(root, p).read_bytes()) for p in CONTRACTS}
    try:
        base = subprocess.check_output(['git', '-C', str(root), 'rev-parse', 'HEAD'],
                                       stderr=subprocess.DEVNULL).decode().strip()
    except (OSError, subprocess.CalledProcessError):
        base = None  # Fixtures only; real publication still checks exact read-set.
    packet = dict(schema='kianos.lexical.review_bundle.v1', base_commit=base,
                  requested_range=[start, end], words=[], relations={}, read_set=readset,
                  omitted={'owner': sorted(OMIT_OWNER), 'record': sorted(OMIT_RECORD)},
                  semantic_judgment=False)
    for ordinal in range(start, min(end + 1, start + max_words)):
        candidate = copy.deepcopy(packet)
        path = WORD.format(ordinal)
        raw = safe(root, path).read_bytes()
        owner = json.loads(raw)
        require(owner.get('ordinal') == ordinal and owner.get('word_id'), 'IDENTITY_MISMATCH')
        candidate['read_set'][path] = bytehash(raw)
        candidate['words'].append({'path': path, 'view': view(owner)})
        for ref in owner.get('relation_refs', []):
            rp = relation_path(ref)
            if rp not in candidate['relations']:
                data = safe(root, rp).read_bytes()
                candidate['read_set'][rp] = bytehash(data)
                candidate['relations'][rp] = view(json.loads(data))
        relation_views(owner, candidate['relations'])
        candidate['next_ordinal'] = ordinal + 1 if ordinal < end else None
        candidate = seal(candidate, 'bundle_id')
        if len(encoded(candidate)) > max_bytes:
            require(bool(packet['words']), 'BUNDLE_OVERSIZED: enlarge budget or inspect one owner; never truncate')
            break
        candidate.pop('bundle_id')
        packet = candidate
    return seal(packet, 'bundle_id')


def edit(owner, pointer, value):
    require(isinstance(pointer, str) and pointer.startswith('/'), 'INVALID_POINTER')
    parts = [p.replace('~1', '/').replace('~0', '~') for p in pointer[1:].split('/')]
    require(parts[0] in {'record', 'reference_senses', 'identity_refs'}, 'WRITE_SCOPE_VIOLATION')
    require(len(parts) > 1 or parts[0] != 'record', 'WHOLE_RECORD_REPLACEMENT_FORBIDDEN')
    if parts[0] == 'record':
        require(parts[1] not in OMIT_RECORD | {'word_id', 'word'}, 'IDENTITY_OR_METADATA_WRITE')
    node = owner
    for part in parts[:-1]:
        require(isinstance(node, dict) and part in node, 'POINTER_PARENT_MISSING')
        node = node[part]
    require(isinstance(node, dict), 'REPLACE_ARRAY_AT_PARENT_NOT_INDEX')
    node[parts[-1]] = copy.deepcopy(value)


def word_invariants(before, after):
    for key in ('schema', 'ordinal', 'word_id', 'word'):
        require(after.get(key) == before.get(key), 'WORD_IDENTITY_CHANGED')
    require(after.get('relation_refs') == before.get('relation_refs'), 'SHARED_OWNER_HANDOFF')
    record = after.get('record', {})
    require(record.get('word_id') == after['word_id'], 'RECORD_IDENTITY_MISMATCH')
    senses = record.get('senses', [])
    ids = [s.get('sense_id') for s in senses]
    require(all(ids) and len(ids) == len(set(ids)), 'SENSE_ID_MISSING_OR_DUPLICATE')
    refs = after.get('identity_refs', {}).get('senses', [])
    life = {r.get('sense_id'): r for r in refs}
    require(len(life) == len(refs), 'DUPLICATE_LIFECYCLE_ID')
    for s in before.get('record', {}).get('senses', []):
        sid = s['sense_id']
        require(sid in ids or (sid in life and life[sid].get('status') != 'active'),
                'SENSE_REMOVED_WITHOUT_LIFECYCLE')
    previous_ids = {s['sense_id'] for s in before.get('record', {}).get('senses', [])}
    require(all(sid in life for sid in set(ids) - previous_ids), 'NEW_SENSE_NEEDS_LIFECYCLE')
    for cluster in record.get('core_concept', {}).get('core_clusters', []):
        require(set(cluster.get('sense_ids', [])) <= set(ids), 'CORE_DANGLING_SENSE')


def verify_bundle(root, bundle):
    verify_seal(bundle, 'bundle_id')
    check_readset(root, bundle['read_set'])
    require(set(CONTRACTS) <= set(bundle['read_set']), 'MISSING_AUTHORITY_LOCK')
    needed = set(CONTRACTS)
    ordinals = []
    for w in bundle['words']:
        path = w['path']
        require(re.fullmatch(r'content/lexical/words/by-ordinal/o[0-9]{4}\.json', path),
                'WRITE_SCOPE_VIOLATION')
        owner = load(safe(root, path))
        require(path == WORD.format(owner['ordinal']) and w['view'] == view(owner),
                'BUNDLE_VIEW_MISMATCH')
        ordinals.append(owner['ordinal'])
        needed.add(path)
        for ref in owner.get('relation_refs', []):
            rp = relation_path(ref)
            require(rp in bundle['relations'] and
                    bundle['relations'][rp] == view(load(safe(root, rp))),
                    'BUNDLE_RELATION_MISMATCH')
            needed.add(rp)
        relation_views(owner, bundle['relations'])
    require(ordinals and len(ordinals) == len(set(ordinals)), 'DUPLICATE_OR_EMPTY_BUNDLE')
    require(needed == set(bundle['read_set']), 'READ_SET_SCOPE_MISMATCH')
    require(set(bundle['relations']) == {p for p in needed if '/relations/' in p},
            'RELATION_SET_SCOPE_MISMATCH')


def prepare(root, bundle, patch):
    verify_bundle(root, bundle)
    require(patch.get('bundle_id') == bundle['bundle_id'], 'WRONG_BUNDLE')
    check_readset(root, bundle['read_set'])
    rows = patch.get('decisions', [])
    ordinals = [w['view']['ordinal'] for w in bundle['words']]
    require(len(rows) == len(ordinals) and sorted(r.get('ordinal', -1) for r in rows) == sorted(ordinals),
            'MISSING_DUPLICATE_OR_OUT_OF_RANGE_JUDGMENT')
    decisions = {r['ordinal']: r for r in rows}
    changes, finals = {}, {}
    for word in bundle['words']:
        path = word['path']
        old = load(safe(root, path))
        d = decisions[old['ordinal']]
        require(d.get('quality') in {'SAFE_SIMPLE', 'DEPTH_READY', 'BLOCKED'}, 'BAD_QUALITY')
        require(d.get('operation') in {'NO_CHANGE', 'UPGRADED'}, 'BAD_OPERATION')
        if d['quality'] != 'BLOCKED':
            require(old.get('record', {}).get('senses') or d.get('edits'), 'NO_ACTIVE_SENSE_BASIS')
        require(isinstance(d.get('rationale'), str) and d['rationale'].strip(), 'MISSING_FRESH_RATIONALE')
        edits = d.get('edits', [])
        require((d['operation'] == 'UPGRADED') == bool(edits), 'OPERATION_EDIT_MISMATCH')
        if d['quality'] == 'BLOCKED':
            require(d.get('blocker') and not edits, 'BLOCKED_NEEDS_CLOSURE_CONDITION_AND_NO_MUTATION')
        updated = copy.deepcopy(old)
        pointers = [e.get('pointer') for e in edits]
        require(len(pointers) == len(set(pointers)), 'DUPLICATE_POINTER')
        for e in edits:
            require(set(e) == {'pointer', 'value'}, 'UNKNOWN_EDIT_FIELD_OR_SHARED_WRITE')
            edit(updated, e['pointer'], e['value'])
        word_invariants(old, updated)
        if edits:
            require(updated != old, 'NO_EFFECT_UPGRADE')
            changes[path] = updated
        finals[str(old['ordinal'])] = {'view': view(updated),
            'view_hash': digest(view(updated)), 'operation': d['operation'], 'quality': d['quality']}
    return seal(dict(schema='kianos.lexical.staged_candidate.v1',
        status='STAGED_PENDING_READBACK', bundle_id=bundle['bundle_id'],
        read_set=bundle['read_set'], changes=changes, finals=finals,
        relations=bundle['relations'], decisions=rows), 'candidate_id')


def publish_plan(root, bundle, candidate, ack):
    verify_seal(bundle, 'bundle_id')
    verify_seal(candidate, 'candidate_id')
    require(candidate['bundle_id'] == bundle['bundle_id'], 'WRONG_BUNDLE')
    # Rebuild from original data and declared edits: a re-hashed tampered candidate is not sufficient.
    rebuilt = prepare(root, bundle, {'bundle_id': bundle['bundle_id'], 'decisions': candidate['decisions']})
    require(rebuilt == candidate, 'CANDIDATE_REPLAY_MISMATCH')
    require(ack.get('candidate_id') == candidate['candidate_id'], 'WRONG_READBACK')
    require(isinstance(ack.get('reviewer'), str) and ack['reviewer'].strip(), 'MISSING_REVIEWER')
    expected = {o: f['view_hash'] for o, f in candidate['finals'].items()}
    require(ack.get('reviewed_views') == expected, 'INCOMPLETE_FINAL_READBACK')
    # No scheduling or Content reactivation can be implied by running a transport tool.
    current = safe(root, LEX + 'CURRENT.md').read_text(encoding='utf-8')
    directives = [line.strip() for line in current.splitlines() if line.strip().startswith('Catalog execution:')]
    require(directives == ['Catalog execution: ACTIVE'],
            'CATALOG_PAUSED_OR_NOT_EXPLICITLY_ACTIVE')
    elements = [{'path': p, 'mode': '100644', 'type': 'blob',
                 'content': json.dumps(o, ensure_ascii=False, indent=2) + '\n'}
                for p, o in candidate['changes'].items()]
    receipt = dict(schema='kianos.lexical.local_closure.v1',
        status='LOCAL_CLOSED_PENDING_INTEGRATION', candidate_id=candidate['candidate_id'],
        bundle_id=bundle['bundle_id'], read_set=candidate['read_set'],
        judgments=[{k: v for k, v in r.items() if k != 'edits'} for r in candidate['decisions']],
        final_readback=ack, changed_files={p: bytehash(e['content'].encode('utf-8'))
        for p, e in zip(candidate['changes'], elements)},
        semantic_acceptance='reviewer_attestation; not machine-derived',
        main_acceptance=False, catalog_count_delta=0)
    return {'tree_elements': elements, 'receipt': receipt}


def output_path(root, path):
    root, path = Path(root).resolve(), Path(path).resolve()
    require(not path.is_relative_to(root), 'OUTPUT_MUST_BE_OUTSIDE_SOURCE_ROOT')
    require(not path.exists(), 'OUTPUT_ALREADY_EXISTS: use a new checkpoint filename')
    return path


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('command', choices=['export', 'prepare', 'publish-plan'])
    p.add_argument('--root', type=Path, default=Path.cwd())
    p.add_argument('--start', type=int)
    p.add_argument('--end', type=int)
    p.add_argument('--max-bytes', type=int, default=48000)
    p.add_argument('--max-words', type=int, default=50)
    p.add_argument('--bundle', type=Path)
    p.add_argument('--patch', type=Path)
    p.add_argument('--candidate', type=Path)
    p.add_argument('--ack', type=Path)
    p.add_argument('--out', type=Path, required=True)
    a = p.parse_args()
    try:
        out = output_path(a.root, a.out)
        if a.command == 'export':
            result = export(a.root, a.start, a.end, a.max_bytes, a.max_words)
        elif a.command == 'prepare':
            result = prepare(a.root, load(a.bundle), load(a.patch))
        else:
            result = publish_plan(a.root, load(a.bundle), load(a.candidate), load(a.ack))
        save(out, result)
        print(json.dumps({'output': str(a.out), 'bytes': len(encoded(result)),
              'status': result.get('status', 'TRANSPORT_ONLY'),
              'words': len(result.get('words', result.get('finals', {}))),
              'next_ordinal': result.get('next_ordinal')}, ensure_ascii=False))
    except (ValueError, OSError, TypeError, KeyError) as e:
        p.exit(2, f'{type(e).__name__}: {e}\n')


if __name__ == '__main__':
    main()
