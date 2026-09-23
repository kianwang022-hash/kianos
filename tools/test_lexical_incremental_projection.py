import importlib.util
import json
from pathlib import Path
import tempfile
import subprocess
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("builder", Path(__file__).with_name("lexical_build_final_learner_objects.py"))
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


class IncrementalProjectionTest(unittest.TestCase):
    def test_checkpoint_writers_preserve_unchanged_bytes_and_layout(self):
        import sys
        sys.path.insert(0, str(Path(__file__).parent))
        import lexical_apply_o0475_o0674 as checkpoint
        import lexical_natural_owner as natural
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / "shard.json"
            before = '[\n  {"b": 2, "a": 1}\n]\n'
            p.write_text(before)
            stamp = p.stat().st_mtime_ns
            for writer in [lambda: checkpoint.dump(p, [{"a": 1, "b": 2}], compact=True),
                           lambda: natural.dump_json(p, [{"a": 1, "b": 2}])]:
                writer()
                self.assertEqual(p.read_text(), before)
                self.assertEqual(p.stat().st_mtime_ns, stamp)
            checkpoint.dump(p, [{"a": 1, "b": 3}], compact=True)
            self.assertGreater(len(p.read_text().splitlines()), 1)
            self.assertEqual(json.loads(p.read_text()), [{"a": 1, "b": 3}])

    def test_dependencies_cache_integrity_and_failed_build_preservation(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            words = root / "content/lexical/words/by-ordinal"
            words.mkdir(parents=True)
            relation_path = "content/lexical/relations/by-id/aa/r.json"
            decisions = root / "content/lexical/final-learner-object-decisions.json"
            out = root / "learner"
            cache = root / "cache"
            def write(path, data):
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(json.dumps(data))
            for ordinal in range(1, 4):
                write(words / f"o{ordinal:04}.json", {
                    "ordinal": ordinal, "word_id": f"word:w{ordinal}",
                    "record": {"word": f"w{ordinal}", "core_concept": {"core_meaning_cn": "test"}},
                    "relation_refs": [{"owner_path": relation_path, "relation_id": "r", "field": "confusables", "index": 0}] if ordinal < 3 else []})
            relation = {"relation_id": "r", "word_views": [
                {"source_word_id": f"word:w{i}", "field": "confusables", "index": 0,
                 "payload": {"boundary": "reviewed", "target_word": "other"}}
                for i in [1, 2]]}
            write(root / relation_path, relation)
            write(decisions, {"words": {}})
            def git(*args):
                subprocess.run(["git", *args], cwd=root, check=True, capture_output=True)
            git("init")
            git("config", "user.name", "Fixture")
            git("config", "user.email", "fixture@example.invalid")
            git("add", "content")
            git("commit", "-m", "input fixture")
            with patch.multiple(builder, ROOT=root, WORDS=words, DECISIONS=decisions, SHARD_SIZE=1):
                run = lambda: builder.build(out, cache, expected_count=3)
                self.assertEqual(run()["compiled_words"], 3)
                before = {p.name: (p.read_bytes(), p.stat().st_mtime_ns) for p in (out / "shards").glob("*.json")}
                warm = run()
                self.assertEqual(warm["compiled_words"], 0)
                self.assertTrue(warm["input_tree_reused"])
                write(root / "content/xizong/explanation.json", {"unrelated": True})
                self.assertTrue(run()["input_tree_reused"])
                self.assertEqual(before, {p.name: (p.read_bytes(), p.stat().st_mtime_ns) for p in (out / "shards").glob("*.json")})
                # A clean Git tree is insufficient if an output went missing.
                restored = out / "shards/o0001-0001.json"
                original = restored.read_bytes()
                restored.unlink()
                self.assertEqual(run()["compiled_words"], 0)
                self.assertEqual(restored.read_bytes(), original)
                # One word edit: precisely one compile and output shard.
                word = json.loads((words / "o0003.json").read_text())
                word["record"]["core_concept"]["core_meaning_cn"] = "edited"
                write(words / "o0003.json", word)
                git("add", "content")
                git("commit", "-m", "one word plus unrelated Xizong")
                self.assertEqual(builder.validate_changed("HEAD^", expected_count=3)["validated_words"], 1)
                result = run()
                self.assertEqual((result["compiled_words"], result["changed_shards"]), (1, 1))
                # Shared relation edit invalidates both dependants.
                relation["word_views"][0]["payload"]["boundary"] = "new"
                write(root / relation_path, relation)
                git("add", "content")
                git("commit", "-m", "shared relation")
                self.assertEqual(builder.validate_changed("HEAD^", expected_count=3)["validated_words"], 2)
                self.assertEqual(run()["compiled_words"], 2)
                # Sparse decision invalidates only its owner.
                write(decisions, {"words": {"word:w3": {"word_feel": {"x": "new"}}}})
                self.assertEqual(run()["compiled_words"], 1)
                # Missing output is restored from validated cache, not recomputed.
                shard = out / "shards/o0003-0003.json"
                expected = shard.read_bytes()
                shard.unlink()
                self.assertEqual(run()["compiled_words"], 0)
                self.assertEqual(shard.read_bytes(), expected)
                # A corrupt cache must never be trusted.
                cp = cache / "0002.json"
                rows = json.loads(cp.read_text())
                rows["word:w3"]["object"]["word"] = "CORRUPT"
                write(cp, rows)
                self.assertEqual(run()["compiled_words"], 1)
                snapshot = {str(p.relative_to(out)): p.read_bytes() for p in out.rglob("*.json")}
                relation["word_views"] = []
                write(root / relation_path, relation)
                with self.assertRaisesRegex(RuntimeError, "FINAL_LEARNER_RELATION_VIEW_MISSING"):
                    run()
                self.assertEqual(snapshot, {str(p.relative_to(out)): p.read_bytes() for p in out.rglob("*.json")})
                (root / relation_path).unlink()
                with self.assertRaisesRegex(RuntimeError, "FINAL_LEARNER_RELATION_VIEW_MISSING"):
                    run()


if __name__ == "__main__":
    unittest.main()
