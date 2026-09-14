#!/usr/bin/env python3
"""Exercise rejection paths on disposable asset copies, never learner state."""

import copy
import gzip
import io
import json
from pathlib import Path
import shutil
import sys
import tempfile
import unittest

sys.dont_write_bytecode = True
import validate as asset

ROOT = Path(__file__).resolve().parents[4]


class AssetValidationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='kianos-138-validator-')
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        for path in [asset.TRUTH, Path('content/politics/manifest.json'), *[
            asset.OWNER / name for name in ('asset.v1.json.gz', 'manifest.json', 'README.md', 'PROMOTION_RECEIPT.md')
        ]]:
            (self.root / path).parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / path, self.root / path)
        self.owner = self.root / asset.OWNER
        self.manifest = json.loads((self.owner / 'manifest.json').read_bytes())
        self.payload = json.loads(gzip.decompress((self.owner / 'asset.v1.json.gz').read_bytes()))

    def save_manifest(self):
        (self.owner / 'manifest.json').write_text(json.dumps(self.manifest))

    def repin(self, compressed, raw):
        # Re-pin all byte metadata so semantic/shape failures cannot hide behind SHA rejection.
        changes = {self.manifest['compressed_asset_sha256']: asset.sha(compressed),
                   self.manifest['derived_payload_sha256']: asset.sha(raw)}
        for path in [self.root / 'content/politics/manifest.json', self.owner / 'README.md', self.owner / 'PROMOTION_RECEIPT.md']:
            text = path.read_text()
            for old, new in changes.items():
                text = text.replace(old, new)
            path.write_text(text)
        self.manifest['compressed_asset_sha256'] = asset.sha(compressed)
        self.manifest['derived_payload_sha256'] = asset.sha(raw)
        self.save_manifest()
        (self.owner / 'asset.v1.json.gz').write_bytes(compressed)

    def repack(self):
        raw = asset.encode(self.payload)
        buf = io.BytesIO()
        with gzip.GzipFile(filename='', mode='wb', fileobj=buf, compresslevel=9, mtime=0) as output:
            output.write(raw)
        self.repin(buf.getvalue(), raw)

    def rejects(self, reason):
        with self.assertRaisesRegex(ValueError, reason):
            asset.validate(self.root)

    def test_current_asset(self):
        self.assertEqual(asset.validate(self.root)['unique_ids'], 1148)

    def test_stale_compressed_hash(self):
        (self.owner / 'asset.v1.json.gz').write_bytes(b'bad gzip')
        self.rejects('compressed SHA mismatch')

    def test_invalid_gzip_even_when_repinned(self):
        self.repin(b'bad gzip', asset.encode(self.payload))
        self.rejects('gzip header')

    def test_trailing_data_even_when_repinned(self):
        self.repin((self.owner / 'asset.v1.json.gz').read_bytes() + b'trailing', asset.encode(self.payload))
        self.rejects('trailing gzip data')

    def test_stale_payload_hash(self):
        self.manifest['derived_payload_sha256'] = '0' * 64
        self.save_manifest()
        self.rejects('payload SHA mismatch')

    def test_duplicate_id(self):
        self.payload['records'][1]['question_id'] = self.payload['records'][0]['question_id']
        self.repack()
        self.rejects('duplicate asset ID')

    def test_missing_record(self):
        self.payload['records'].pop()
        self.repack()
        self.rejects('record count')

    def test_unbound_id(self):
        self.payload['records'][0]['question_id'] = 'xiao_2027_ethics_multiple_999'
        self.repack()
        self.rejects('exact ID mismatch')

    def test_forbidden_fields(self):
        original = copy.deepcopy(self.payload)
        for field in ('xiao_reference', 'historical_quality', 'stem', 'options', 'canonical_answer', 'source_blocks'):
            with self.subTest(field=field):
                self.payload = copy.deepcopy(original)
                self.payload['records'][0][field] = 'must never be admitted'
                self.repack()
                self.rejects('record fields')

    def test_empty_content(self):
        self.payload['records'][0]['takeaway'] = ' \n'
        self.repack()
        self.rejects('empty/non-string')

    def test_subject_binding(self):
        self.payload['records'][0]['subject'] = 'marx'
        self.repack()
        self.rejects('subject binding')

    def test_stale_docs(self):
        path = self.owner / 'README.md'
        path.write_text(path.read_text().replace(self.manifest['compressed_asset_sha256'], '0' * 64))
        self.rejects('README.md: compressed_asset_sha256')

    def test_unauthenticated_source(self):
        path = self.root / 'untrusted.json'
        path.write_text('{}')
        with self.assertRaisesRegex(ValueError, 'historical source SHA mismatch'):
            asset.validate(self.root, path)

    def test_projection_copies_strings_verbatim(self):
        source = {'records': [{'runtime_question_id': 'id', 'question_id': 'legacy', 'subject': 'marx',
                               'takeaway': '  synthetic\n', 'chat_explanation': 'synthetic\r\nbody  ',
                               'xiao_reference': {'text': 'excluded'}, 'canonical_answer': 'excluded'}]}
        row = asset.project_source(source)[0]
        self.assertEqual(set(row), set(asset.FIELDS))
        for field in asset.LEARNER_FIELDS:
            self.assertEqual(row[field], source['records'][0][field])


if __name__ == '__main__':
    unittest.main(verbosity=2)
