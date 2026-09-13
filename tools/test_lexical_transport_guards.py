#!/usr/bin/env python3
"""Additional CLI/publication safety tests, using the same synthetic fixture."""
import tempfile
import unittest
from pathlib import Path
import lexical_shard as m
from test_lexical_shard import TransportTests


class GuardTests(TransportTests):
    def test_23_output_cannot_overwrite_source_or_checkpoint(self):
        with self.assertRaisesRegex(ValueError, 'OUTSIDE_SOURCE_ROOT'):
            m.output_path(self.root, self.root / m.WORD.format(1))
        with tempfile.TemporaryDirectory() as d:
            dest = Path(d) / 'new.json'
            self.assertEqual(m.output_path(self.root, dest), dest.resolve())
            dest.write_text('{}')
            with self.assertRaisesRegex(ValueError, 'OUTPUT_ALREADY_EXISTS'):
                m.output_path(self.root, dest)

    def test_24_activation_requires_one_exact_directive(self):
        for text in ('Example: Catalog execution: ACTIVE',
                     'Catalog execution: ACTIVE but not really',
                     'Catalog execution: ACTIVE\nCatalog execution: PAUSED',
                     'Catalog execution: ACTIVE\nCatalog execution: ACTIVE'):
            (self.root / m.CONTRACTS[0]).write_text(text)
            b = self.bundle()
            c = m.prepare(self.root, b, self.patch(b))
            with self.assertRaisesRegex(ValueError, 'CATALOG_PAUSED'):
                m.publish_plan(self.root, b, c, self.ack(c))


if __name__ == '__main__':
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(GuardTests)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
