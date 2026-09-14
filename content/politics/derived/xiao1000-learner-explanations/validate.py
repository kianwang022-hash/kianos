#!/usr/bin/env python3
"""Read-only exact asset/binding validation; optional authenticated-source comparison."""

import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import re
import sys
import zlib

OWNER = Path('content/politics/derived/xiao1000-learner-explanations')
TRUTH = Path('content/politics/source/xiao_2027_questions.jsonl')
FIELDS = ['question_id', 'legacy_question_id', 'subject', 'takeaway', 'chat_explanation']
LEARNER_FIELDS = ['takeaway', 'chat_explanation']
COUNTS = {'marx': 396, 'mao': 115, 'ethics': 166, 'history': 251, 'xi': 220}
PAYLOAD_SCHEMA = 'kianos.politics.xiao1000_learner_explanations.v1'
SENTINELS = [f'xiao_2027_marx_multiple_{n:03d}' for n in (16, 31, 56, 114, 120)]


def require(condition, reason):
    if not condition:
        raise ValueError(reason)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def unique_object(pairs):
    obj = {}
    for key, value in pairs:
        require(key not in obj, f'duplicate JSON key: {key}')
        obj[key] = value
    return obj


def parse(data):
    return json.loads(data, object_pairs_hook=unique_object)


def encode(payload):
    return (json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(',', ':')) + '\n').encode('utf-8')


def project_source(source):
    """Copy existing strings verbatim. No normalization, generation, or semantic review."""
    return sorted([
        {'question_id': row['runtime_question_id'], 'legacy_question_id': row['question_id'],
         'subject': row['subject'], 'takeaway': row['takeaway'], 'chat_explanation': row['chat_explanation']}
        for row in source['records']
    ], key=lambda row: row['question_id'])


def validate(root, historical_source=None):
    owner = root / OWNER
    manifest = parse((owner / 'manifest.json').read_bytes())
    parent = parse((root / 'content/politics/manifest.json').read_bytes())
    require(manifest['schema'] == 'kianos.politics.xiao1000_learner_explanation_manifest.v1', 'manifest schema')
    require(manifest['status'] == 'CURRENT_DERIVED_LEARNER_FACING_ASSET', 'manifest status')
    require(manifest['owner_root'] == OWNER.as_posix() + '/', 'owner path')
    require(manifest['data_file'] == (OWNER / 'asset.v1.json.gz').as_posix(), 'asset path')
    require(manifest['data_encoding'] == 'gzip(utf-8 JSON)', 'asset encoding')
    require(manifest['admitted_fields'] == FIELDS, 'admitted fields must exclude source/QA payload')
    require(manifest['learner_facing_fields'] == LEARNER_FIELDS, 'two-field contract')
    require(manifest['identity_fields'] == FIELDS[:3], 'identity metadata contract')
    require(manifest['excluded_question_truth_fields'] == ['canonical_answer', 'stem', 'options'], 'excluded Question Truth metadata')
    require(manifest['excluded_source_provenance_fields'] == ['xiao_reference', 'source_blocks', 'historical_quality'], 'excluded provenance metadata')
    binding = manifest['binding']
    require(binding['field'] == 'question_id' and binding['rule'] == 'EXACT_STABLE_QUESTION_ID_ONLY', 'exact binding rule')
    require(binding['question_truth_owner'] == TRUTH.as_posix(), 'Question Truth owner')
    require(binding['missing_or_unbound'] == 'FAIL_CLOSED', 'binding failure policy')

    truth_raw = (root / TRUTH).read_bytes()
    truth_hash = sha(truth_raw)
    require(truth_hash == binding['question_truth_sha256'] == parent['sources']['questions']['sha256'], 'Question Truth SHA mismatch')
    truth = [parse(line) for line in truth_raw.splitlines() if line.strip()]
    require(len({row['question_id'] for row in truth}) == len(truth), 'duplicate Current ID')
    ready = {row['question_id']: row for row in truth if row['training_status'] == 'training_ready'}
    require(len(ready) == parent['sources']['questions']['training_ready_records'] == 1148, 'Current ready count')
    require(all(row['question_type'] in ('single', 'multiple') for row in ready.values()), 'Current ready kinds')

    compressed = (owner / 'asset.v1.json.gz').read_bytes()
    require(sha(compressed) == manifest['compressed_asset_sha256'], 'compressed SHA mismatch')
    # RFC 1952: deflate, no filename, mtime=0, level-9 hint, portable OS byte.
    require(compressed[:10] == bytes.fromhex('1f8b08000000000002ff'), 'invalid/noncanonical gzip header')
    decoder = zlib.decompressobj(31)
    raw = decoder.decompress(compressed) + decoder.flush()
    require(decoder.eof and not decoder.unused_data, 'incomplete/multiple/trailing gzip data')
    require(sha(raw) == manifest['derived_payload_sha256'], 'decompressed payload SHA mismatch')
    payload = parse(raw.decode('utf-8'))
    require(set(payload) == {'schema', 'content_version', 'records'}, 'unexpected payload keys')
    require(payload['schema'] == PAYLOAD_SCHEMA, 'payload schema')
    require(payload['content_version'] == manifest['content_version'], 'payload version')
    rows = payload['records']
    require(isinstance(rows, list) and len(rows) == manifest['record_count'] == 1148, 'asset record count')
    for row in rows:
        require(isinstance(row, dict) and set(row) == set(FIELDS), 'unexpected/missing record fields')
        require(all(isinstance(row[field], str) and row[field].strip() for field in FIELDS), 'empty/non-string record field')
        require(re.fullmatch(r'xiao_2027_(marx|mao|ethics|history|xi)_(single|multiple)_\d{3}', row['question_id']), 'invalid stable ID')
    ids = [row['question_id'] for row in rows]
    require(len(set(ids)) == 1148, 'duplicate asset ID')
    require(len({row['legacy_question_id'] for row in rows}) == 1148, 'duplicate legacy ID')
    require(set(ids) == set(ready), f'exact ID mismatch: missing={len(set(ready)-set(ids))}, unbound={len(set(ids)-set(ready))}')
    require(all(row['subject'] == ready[row['question_id']]['subject'] for row in rows), 'subject binding mismatch')
    require(dict(Counter(row['subject'] for row in rows)) == manifest['subject_counts'] == COUNTS, 'subject counts')
    require(ids == sorted(ids) and raw == encode(payload), 'noncanonical JSON serialization/order')
    measured = {'runtime_question_id_unique': len(set(ids)),
                'legacy_question_id_unique': len({row['legacy_question_id'] for row in rows}),
                'exact_current_ids': len(ready), 'duplicate_ids': 0, 'missing_ids': 0,
                'unbound_ids': 0, 'missing_takeaway': 0, 'missing_chat_explanation': 0,
                'forbidden_record_fields': 0}
    require(all(manifest['verification'][key] == value for key, value in measured.items()), 'stale verification counts')

    derived = parent['derived_assets']['xiao1000_learner_explanations']
    require(derived['manifest'] == (OWNER / 'manifest.json').as_posix(), 'parent asset owner')
    require(derived['records'] == 1148 and derived['binding'] == binding['rule'], 'parent binding metadata')
    require(derived['question_truth_owner'] == TRUTH.as_posix(), 'parent Question Truth owner')
    require(derived['derived_payload_sha256'] == sha(raw), 'parent payload SHA mismatch')
    require(derived['historical_source_sha256'] == manifest['historical_source']['sha256'], 'parent historical SHA mismatch')
    require(manifest['promotion_receipt'] == (OWNER / 'PROMOTION_RECEIPT.md').as_posix(), 'receipt path')
    hashes = {'derived_payload_sha256': sha(raw), 'compressed_asset_sha256': sha(compressed),
              'question_truth_sha256': truth_hash, 'historical_source_sha256': manifest['historical_source']['sha256']}
    for name in ('README.md', 'PROMOTION_RECEIPT.md'):
        text = (owner / name).read_text()
        for label, digest in hashes.items():
            matches = re.findall(rf'^- `{label}`: `([0-9a-f]{{64}})`$', text, re.MULTILINE)
            require(matches == [digest], f'{name}: {label} mismatch/missing/duplicate')

    comparison = 'NOT_RUN (use --historical-source for exact original-content comparison)'
    if historical_source is not None:
        source_raw = historical_source.read_bytes()
        require(sha(source_raw) == manifest['historical_source']['sha256'], 'historical source SHA mismatch')
        source = parse(source_raw)
        for key in ('schema_version', 'package_status', 'total_records'):
            require(source[key] == manifest['historical_source'][key], f'historical {key} mismatch')
        require(len(source['records']) == 1148, 'historical count')
        require(rows == project_source(source), 'content/identity differs from authenticated original')
        sentinels = {row['runtime_question_id']: row for row in source['records']
                     if 'PRIOR_ANSWER_IDENTITY_CORRECTION' in row.get('pro_audit_flags', [])}
        require(set(sentinels) == set(SENTINELS), 'historical correction sentinel set')
        require(all(sentinels[key]['canonical_answer'] == ready[key]['answer'] == 'AB' for key in SENTINELS), 'Current correction sentinel mismatch')
        comparison = 'PASS: 1148 IDs; 2296 learner strings verbatim; 5 correction sentinels'
    return {'status': 'PASS', 'records': 1148, 'unique_ids': 1148, 'missing': 0, 'unbound': 0,
            'subject_counts': COUNTS, 'learner_fields': LEARNER_FIELDS,
            'excluded_record_fields': ['xiao_reference', 'historical_quality', 'stem', 'options', 'canonical_answer', 'source_blocks'],
            'historical_content_comparison': comparison, 'hashes': hashes}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[4])
    parser.add_argument('--historical-source', type=Path)
    args = parser.parse_args()
    try:
        result = validate(args.root, args.historical_source)
    except (ValueError, KeyError, TypeError, OSError, zlib.error) as error:
        print(f'POLITICS_LEARNER_EXPLANATION_FAIL: {error}', file=sys.stderr)
        sys.exit(1)
    print('POLITICS_LEARNER_EXPLANATION_PASS')
    print(json.dumps(result, ensure_ascii=False, sort_keys=True))
