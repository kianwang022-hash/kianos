#!/usr/bin/env python3
from __future__ import annotations

import lexical_compile_consolidated_repair_inventory as compiler

_original_source_comment_meta = compiler.source_comment_meta


def legacy_source_comment_meta(checkpoint):
    meta = _original_source_comment_meta(checkpoint)
    if meta is None:
        return None
    _repo, comment_id = meta
    # R14–R31 historical comment ids are all owned by kianos-legacy Issue #113.
    # Some early checkpoint authority metadata also names the Current repo for
    # the frozen transport file; that field must never re-home the historical
    # issue-comment id.
    return "kianwang022-hash/kianos-legacy", comment_id


compiler.source_comment_meta = legacy_source_comment_meta


if __name__ == "__main__":
    raise SystemExit(compiler.main())
