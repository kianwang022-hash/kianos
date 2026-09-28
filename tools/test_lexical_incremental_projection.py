import importlib.util
import json
from pathlib import Path
import tempfile
import subprocess
import shutil
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("builder", Path(__file__).with_name("lexical_build_final_learner_objects.py"))
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


def stable(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def dump_json_if_changed(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and stable(json.loads(path.read_text())) == stable(value):
        return
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


class IncrementalProjectionTest(unittest.TestCase):
    def test_current_writer_preserves_unchanged_bytes_and_layout(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / "shard.json"
            before = '[\n  {"b": 2, "a": 1}\n]\n'
            p.write_text(before)
            stamp = p.stat().st_mtime_ns
            dump_json_if_changed(p, [{"a": 1, "b": 2}])
            self.assertEqual(p.read_text(), before)
            self.assertEqual(p.stat().st_mtime_ns, stamp)
            dump_json_if_changed(p, [{"a": 1, "b": 3}])
            self.assertGreater(len(p.read_text().splitlines()), 1)
            self.assertEqual(json.loads(p.read_text()), [{"a": 1, "b": 3}])

    def test_cold_worktree_direct_word_delta_reuses_committed_projection(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            words = root / "content/lexical/words/by-ordinal"
            words.mkdir(parents=True)
            decisions = root / "content/lexical/final-learner-object-decisions.json"
            out = root / "content/lexical/learner/final"
            cache = root / "cache"

            def write(path, data):
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(json.dumps(data))

            for ordinal in range(1, 4):
                write(words / f"o{ordinal:04}.json", {
                    "ordinal": ordinal,
                    "word_id": f"word:w{ordinal}",
                    "word": f"w{ordinal}",
                    "record": {
                        "word": f"w{ordinal}",
                        "core_concept": {"core_meaning_cn": f"meaning-{ordinal}"},
                        "senses": [],
                        "constructions": [],
                    },
                    "relation_refs": [],
                })
            write(decisions, {"words": {}})

            def git(*args):
                return subprocess.check_output(["git", *args], cwd=root, text=True).strip()

            subprocess.run(["git", "init"], cwd=root, check=True, capture_output=True)
            git("config", "user.name", "Fixture")
            git("config", "user.email", "fixture@example.invalid")
            git("add", "content")
            git("commit", "-m", "canonical inputs")

            with patch.multiple(
                builder,
                ROOT=root,
                WORDS=words,
                DECISIONS=decisions,
                OUT=out,
                SHARD_SIZE=1,
            ):
                baseline = builder.build(out, cache, expected_count=3)
                self.assertEqual(baseline["compiled_words"], 3)
                git("add", "content/lexical/learner/final")
                git("commit", "-m", "committed projection baseline")
                shutil.rmtree(cache)

                word = json.loads((words / "o0002.json").read_text())
                word["record"]["core_concept"]["core_meaning_cn"] = "edited-one"
                write(words / "o0002.json", word)

                direct = builder.build(out, cache, expected_count=3)
                self.assertEqual(direct["incremental_mode"], "direct-word-delta")
                self.assertEqual(direct["baseline_mode"], "git-head")
                self.assertEqual((direct["compiled_words"], direct["reused_words"]), (1, 2))
                self.assertEqual(direct["changed_shards"], 1)

                word["record"]["core_concept"]["core_meaning_cn"] = "edited-two"
                write(words / "o0002.json", word)
                repeated = builder.build(out, cache, expected_count=3)
                self.assertEqual(repeated["incremental_mode"], "direct-word-delta")
                self.assertEqual(repeated["baseline_mode"], "local-proof")
                self.assertEqual((repeated["compiled_words"], repeated["reused_words"]), (1, 2))
                shard = json.loads((out / "shards/o0002-0002.json").read_text())
                self.assertEqual(shard[0]["word_feel"]["summary_cn"], "edited-two")

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

    def test_git_baseline_incremental_materialization_without_cache(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            words = root / "content/lexical/words/by-ordinal"
            words.mkdir(parents=True)
            decisions = root / "content/lexical/final-learner-object-decisions.json"
            out = root / "content/lexical/learner/final"
            cache = root / "cache"

            def write(path, data):
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")

            for ordinal in range(1, 4):
                write(words / f"o{ordinal:04}.json", {
                    "ordinal": ordinal,
                    "word_id": f"word:w{ordinal}",
                    "record": {
                        "word": f"w{ordinal}",
                        "core_concept": {"core_meaning_cn": f"meaning-{ordinal}"},
                        "senses": [],
                        "constructions": [],
                    },
                    "relation_refs": [],
                })
            write(decisions, {"words": {}})

            def git(*args):
                return subprocess.check_output(
                    ["git", *args], cwd=root, text=True, stderr=subprocess.STDOUT
                ).strip()

            git("init", "-b", "main")
            git("config", "user.name", "Fixture")
            git("config", "user.email", "fixture@example.invalid")
            git("add", "content")
            git("commit", "-m", "canonical inputs")

            with patch.multiple(
                builder,
                ROOT=root,
                WORDS=words,
                DECISIONS=decisions,
                OUT=out,
                SHARD_SIZE=1,
            ):
                self.assertEqual(builder.build(out, cache, expected_count=3)["compiled_words"], 3)
                git("add", "content/lexical/learner/final")
                git("commit", "-m", "baseline projection")

                word3 = json.loads((words / "o0003.json").read_text())
                word3["record"]["core_concept"]["core_meaning_cn"] = "meaning-3-edited"
                write(words / "o0003.json", word3)

                result = builder.incremental_build_from_git("HEAD", out, expected_count=3)
                self.assertEqual(result["affected_words"], 1)
                self.assertEqual(result["compiled_words"], 1)
                self.assertEqual(result["reused_words"], 2)
                self.assertEqual(result["changed_shards"], 1)

                incremental_snapshot = {
                    str(path.relative_to(out)): path.read_bytes()
                    for path in out.rglob("*.json")
                }
                full = builder.build(out, root / "full-cache", expected_count=3)
                self.assertEqual(full["compiled_words"], 3)
                self.assertEqual(
                    incremental_snapshot,
                    {str(path.relative_to(out)): path.read_bytes() for path in out.rglob("*.json")},
                    "Git-baseline incremental output must equal a full rebuild byte-for-byte",
                )

                git("checkout", "--", "content/lexical/words/by-ordinal/o0003.json")
                restored = builder.incremental_build_from_git("HEAD", out, expected_count=3)
                self.assertEqual(restored["affected_words"], 0)
                self.assertGreaterEqual(restored["restored_shards"], 1)
                self.assertEqual(
                    json.loads((out / "shards/o0003-0003.json").read_text())[0]["word_feel"]["summary_cn"],
                    "meaning-3",
                )

    def test_explicit_default_depth_decisions_and_compact_pos_labels(self):
        owner = {
            "ordinal": 1,
            "word_id": "word:a",
            "word": "a",
            "record": {
                "word": "a",
                "core_concept": {"core_meaning_cn": "一个；每；一"},
                "senses": [
                    {
                        "sense_id": "sense:a:article",
                        "pos": "article",
                        "definition_cn": "一个非特指对象",
                        "definition_en": "one non-specific object",
                        "usage_note": "a/an sound rule",
                    },
                    {
                        "sense_id": "sense:a:rate",
                        "pos": "determiner",
                        "governing_pattern": "number/amount + a + unit",
                        "definition_cn": "每；每一",
                        "definition_en": "per unit",
                    },
                ],
                "constructions": [],
            },
            "relation_refs": [],
        }
        decisions = {
            "words": {
                "word:a": {
                    "sense_usage_notes": {
                        "sense:a:article": {"disposition": "EXPLORE_ONLY"},
                    },
                    "sense_governing_patterns": {
                        "sense:a:rate": {"disposition": "EXPLORE_ONLY"},
                    },
                }
            }
        }
        result = builder.compile_word(owner, decisions)
        self.assertEqual(result["recall_map"]["parts"], ["1ART", "1DET"])
        self.assertEqual(result["senses"][0]["note"], "")
        self.assertEqual(result["senses"][1]["governing_pattern"], "")

    def test_incomplete_secondary_fails_closed_and_complete_secondary_groups_pos(self):
        owner = {
            "ordinal": 2,
            "word_id": "word:participant",
            "word": "participant",
            "record": {
                "word": "participant",
                "core_concept": {"core_meaning_cn": "参与者"},
                "senses": [{
                    "sense_id": "sense:participant:main",
                    "pos": "noun",
                    "definition_cn": "参与者",
                    "definition_en": "a person who takes part",
                }],
                "secondary_senses": [{
                    "fact_id": "usage:participant:attributive",
                    "example": "participant observation",
                }],
                "constructions": [],
            },
            "relation_refs": [],
        }
        with self.assertRaisesRegex(RuntimeError, "FINAL_LEARNER_SECONDARY_INCOMPLETE"):
            builder.compile_word(owner, {"words": {}})
        branch = owner["record"]["secondary_senses"][0]
        branch.update({
            "pos": "noun",
            "definition_cn": "（名词作定语）参与式的",
            "definition_en": "used attributively, as in participant observation",
            "pattern": "participant observation",
        })
        result = builder.compile_word(owner, {"words": {}})
        self.assertEqual(result["recall_map"]["parts"], ["(1+1)N"])
        self.assertEqual(result["secondary_senses"][0]["pos"], "noun")
        self.assertEqual(result["secondary_senses"][0]["pattern"], "participant observation")


if __name__ == "__main__":
    unittest.main()
