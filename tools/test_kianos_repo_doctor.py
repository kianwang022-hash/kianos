import unittest

from tools.kianos_repo_doctor import parse_retired_lines, workflow_safety_errors


class RepoDoctorHelpersTest(unittest.TestCase):
    def test_retired_parser_is_exact_token_based(self):
        raw = """
# comment
work/example # reason
work/example-b

"""
        self.assertEqual(parse_retired_lines(raw), ["work/example", "work/example-b"])

    def test_retired_parser_preserves_duplicate_evidence(self):
        refs = parse_retired_lines("a\na # second\nb\n")
        self.assertEqual(refs, ["a", "a", "b"])

    def test_workflow_guard_requires_open_pr_and_exact_head(self):
        good = """
branch_has_open_pr
--state open
headRefOid
branch_head="$(git rev-parse "origin/$branch")"
select(.headRefOid == $head)
"""
        self.assertEqual(workflow_safety_errors(good), [])

    def test_workflow_guard_fails_closed_when_exact_head_missing(self):
        bad = "branch_has_open_pr --state open headRefOid"
        errors = workflow_safety_errors(bad)
        self.assertIn("CODEX_BRANCH_HEAD_BINDING_MISSING", errors)
        self.assertIn("CODEX_EXACT_HEAD_COMPARE_MISSING", errors)


if __name__ == "__main__":
    unittest.main()
