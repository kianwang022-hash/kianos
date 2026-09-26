import unittest

from tools.kianos_repo_doctor import normalize_remote_refs, workflow_safety_errors


class RepoDoctorHelpersTest(unittest.TestCase):
    def test_remote_ref_normalization(self):
        raw = "origin/HEAD\norigin/main\norigin/work/foo\norigin/work/foo\n"
        self.assertEqual(normalize_remote_refs(raw), ["main", "work/foo"])

    def test_workflow_guard_requires_open_pr_and_exact_head(self):
        good = """
branch_has_open_pr
--state open
merged_main_prs=
.baseRefName == "main"
.headRefName == $branch
^codex/issue[0-9]+-
headRefOid
branch_head="$(git rev-parse "origin/$branch")"
select(.headRefOid == $head)
"""
        self.assertEqual(workflow_safety_errors(good), [])

    def test_workflow_guard_fails_closed_when_exact_head_missing(self):
        bad = "branch_has_open_pr --state open headRefOid"
        errors = workflow_safety_errors(bad)
        self.assertIn("SQUASH_MAIN_PR_CACHE_MISSING", errors)
        self.assertIn("SQUASH_MAIN_BASE_GUARD_MISSING", errors)
        self.assertIn("SQUASH_MAIN_HEAD_NAME_GUARD_MISSING", errors)
        self.assertIn("SQUASH_MAIN_CODEX_EXCLUSION_MISSING", errors)
        self.assertIn("CODEX_BRANCH_HEAD_BINDING_MISSING", errors)
        self.assertIn("CODEX_EXACT_HEAD_COMPARE_MISSING", errors)

    def test_workflow_guard_rejects_missing_main_base_proof(self):
        incomplete = """
branch_has_open_pr
--state open
merged_main_prs=
.headRefName == $branch
^codex/issue[0-9]+-
headRefOid
branch_head="$(git rev-parse "origin/$branch")"
select(.headRefOid == $head)
"""
        errors = workflow_safety_errors(incomplete)
        self.assertIn("SQUASH_MAIN_BASE_GUARD_MISSING", errors)


if __name__ == "__main__":
    unittest.main()
