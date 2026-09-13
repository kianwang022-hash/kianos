# Lexical Fresh Rebuild

Issue: #54

This directory records the new Current-first lexical content rebuild generation.

Rules:
- Current Natural Owners are the objects being rebuilt.
- Fresh semantic judgment defines the new target.
- Historical R12–R31 findings are defect sentinels only; historical target wording is not semantic authority.
- Legacy is not read by default.
- Each batch directly closes: Current read -> fresh judgment -> Natural Owner mutation -> final-object readback -> sentinel check -> QA -> receipt.
- Learner-state mutation is forbidden.

Batch receipts live under `batches/` and must account for each owner exactly once in the new acceptance generation.
