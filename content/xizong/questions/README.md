# Xizong Questions

This directory is the durable GitHub owner for Current KianOS Xizong Question Truth.

## Authority boundary

Question Truth includes only source-faithful exam facts and stable identity:

- stable `question_id`;
- year / source question number / question type;
- shared stem / stem;
- shared option set / options;
- official answer;
- exact source/provenance locators and reviewed source-truth corrections.

Question explanations, Question→KP mappings, runtime attempts and learner state are separate layers and do not belong here.

## Deterministic exact-ID storage

Canonical Question Truth is stored under `shards/YYYY/qNNN-NNN.json`, with a
fixed width of 25 official question numbers. For
`xizong-official-YYYY-nNNN`, compute:

`range_start = floor((n - 1) / 25) * 25 + 1`

and read `shards/YYYY/q<range_start>-<range_start+24>.json`. No global index or
repository search is required. Each shard is a JSON object keyed by immutable
`question_id`.

The two VERIFIED records in `source-audit.json` are already materialized in the
canonical shards. That file remains provenance/review evidence and must not be
applied again by a consumer.

## Recovery provenance

During RB1 the trusted recovery baseline is the formally consumed Local v2 asset:

- repository: `kianwang022-hash/kianos-site-v238-recovery`
- ref: `a38444057dd46fbf1765052d17c5f6b6a018d2f7`
- path: `public/xizong-question-catalog.v2.candidate.server.json`
- Git blob SHA1: `aa321bd1c040a6dcf38e5ae57ae36dcfc28d605a`
- backing candidate SHA256: `290510dc399b3323494eb15c6a7365e85e8e6920f73af5a1863d54d563f4d8b9`
- expected question count: `3750`

Reviewed Question source-audit corrections were materialized only when they were source-truth corrections. Private mastery/attempt/review state is excluded.

The old 3,425-question Study v1 corpus and release `p0-e4-xizong-d88b2dae7dde` are quarantined for recovery comparison only and must not be promoted into this owner.

The former aggregate `questions.json` and global `index.json` are retained in
Git history and recorded by identity in the manifest; they are not competing
Current truth. Release admission and learner readiness remain separate Chat
Owner decisions.
