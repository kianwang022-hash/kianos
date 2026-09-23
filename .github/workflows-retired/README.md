# Retired GitHub Actions workflows

These files are preserved for historical provenance only.

GitHub Actions executes workflow files only from `.github/workflows/`. Files in this directory are intentionally inactive.

The Lexical hot path is now:

- routine content change: `Lexical Content Fast QA`;
- C checkpoint: one consolidated `Lexical Checkpoint Audit`;
- runtime/UI acceptance: only when runtime/UI owners themselves change, or by explicit manual dispatch.

Do not restore a retired workflow merely because it existed in an older package/campaign. A current canonical owner must demonstrate a present need and a non-duplicative trigger.
