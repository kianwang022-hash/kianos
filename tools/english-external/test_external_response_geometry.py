#!/usr/bin/env python3
from __future__ import annotations

import pathlib
import sys
import unittest

HERE = pathlib.Path(__file__).resolve().parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))

from external_normalization import _parse_question_block
from compile_external_reading import _reconcile_toefl_response_geometry


class ExternalResponseGeometryTest(unittest.TestCase):
    def test_summary_preserves_options_beyond_d(self):
        block = """Summary prompt
Answer Choices
A. first
B. second
C. third
D. fourth
E. fifth
F. sixth
"""
        prompt, options, source, uncertain = _parse_question_block(block)
        self.assertEqual(list(options), ["A", "B", "C", "D", "E", "F"])
        self.assertEqual(options["F"], "sixth")
        self.assertFalse(uncertain)
        self.assertIn("F. sixth", source)
        self.assertIn("Summary prompt", prompt)

    def test_two_answer_question_becomes_multi_choice(self):
        rows = [{
            "ordinal": 6,
            "prompt": "To receive credit, you must select TWO answers.",
            "source_text": "To receive credit, you must select TWO answers.",
            "options": {"A": "a", "B": "b", "C": "c", "D": "d"},
            "response_kind": "single_choice",
        }]
        out = _reconcile_toefl_response_geometry(rows, {"6": "A, D"})
        self.assertEqual(out[0]["response_kind"], "multi_choice")

    def test_summary_three_answer_question_becomes_multi_choice(self):
        rows = [{
            "ordinal": 14,
            "prompt": "An introductory sentence for a brief summary is provided.",
            "source_text": "Answer Choices",
            "options": {label: label for label in "ABCDEF"},
            "response_kind": "single_choice",
        }]
        out = _reconcile_toefl_response_geometry(rows, {"14": "A, E, F"})
        self.assertEqual(out[0]["response_kind"], "multi_choice")

    def test_matching_stays_ordered_source_bound(self):
        rows = [{
            "ordinal": 13,
            "prompt": "Directions: Match the statements to the correct location.",
            "source_text": "Drag your answer choices to the spaces where they belong.",
            "options": {label: label for label in "ABCDEF"},
            "response_kind": "single_choice",
        }]
        out = _reconcile_toefl_response_geometry(rows, {"13": "A, C, D, F, B"})
        self.assertEqual(out[0]["response_kind"], "source_bound_ordered")

    def test_ordinary_single_choice_stays_single_choice(self):
        rows = [{
            "ordinal": 1,
            "prompt": "Which statement is correct?",
            "source_text": "Which statement is correct?",
            "options": {"A": "a", "B": "b", "C": "c", "D": "d"},
            "response_kind": "single_choice",
        }]
        out = _reconcile_toefl_response_geometry(rows, {"1": "C"})
        self.assertEqual(out[0]["response_kind"], "single_choice")


if __name__ == "__main__":
    unittest.main()
