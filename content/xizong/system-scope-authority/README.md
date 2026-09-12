# Xizong System Scope Authority

This directory is the shared authority layer for first-pass official-question **system membership**. It exists so A1/A2/A3 and later systems do not each preserve a separate, fragile copy of historical scope truth.

## Authority model

Three states are deliberately independent:

1. **Authority truth** — locked source identities, resolver identity, accepted system owner, and the exact historical HLK output fingerprint.
2. **Recovery evidence** — deterministic replay or archived artifacts that may help recover authority but are never promoted automatically.
3. **Execution truth** — whether CI actually received a runner and executed code.

A CI job with `runner_id=0`, an empty runner name, and zero steps is `CI_EXECUTION_UNAVAILABLE`. It has **no authority implication**. It must never be translated into `AUTHORITY_SOURCE_MISSING` or a medical/source closure failure.

## Exact historical target

`HLK_SYSTEM_QUESTION_INDEX_v1.jsonl` is accepted only if all of these match:

- SHA256 `ed45634d7ff0ac4622e2d873bfeba89ccec4d040af0b179c0acabd40f0801a2d`
- `486228` bytes
- `978` rows

The original 2026-09-01 HLK relation-layer package has now been re-located in the user's saved historical file library. The exact index filename is present with the expected `486228` byte size beside its original manifest, range config, QA receipt and sibling ledgers. The recovered manifest declares the same `ed456...` SHA and `486228` bytes, and the report declares the System Question Index as `978 identifier-only rows`.

That is **strong historical locator evidence, not a new raw-byte hash calculation**. Current source transport denies raw-byte materialization, so the lock records the index as `LOCATED_HISTORICAL_ARTIFACT_RAW_BYTES_UNVERIFIED`. A3 remains fail-closed until the located raw bytes are actually passed through the locked SHA256/bytes/rows verifier.

The recovered manifest also reveals the original relation-layer producer input identities. Those are recorded separately from the later 2026-09-04 recovery inputs. Recovery inputs must not be silently re-labelled as the complete original generator input set.

## Closure policy: ANY-OF

There are two independent authority recovery paths:

### A. Exact historical output

If the original `HLK_SYSTEM_QUESTION_INDEX_v1.jsonl` raw bytes are available, `rebuild-xizong-system-scope-authority.mjs --verify-output <path>` verifies the frozen SHA256, byte count and row count. If all three match, the historical HLK output is authenticated. The historical generator is **not** required for this path.

### B. Deterministic rebuild

If the original output cannot be recovered, deterministic rebuild requires the exact original producer input bytes, exact resolver bytes, and exact generator identity/version/hash. The rebuilt file must then reproduce the same SHA256, bytes and rows. Recovery-time taxonomy counts or medical-semantic inference are forbidden substitutes.

These paths are `ANY_OF`, not `ALL_OF`. After either path authenticates the historical HLK authority, A3 still needs a separate exact membership-extraction step into an accepted owner; no inferred 243-question owner is created automatically.

## Current systems

- **A1 circulation**: Current accepted owner, 376 questions, inventory hash `ded191082...`.
- **A2 respiratory**: Current accepted owner, 359 questions, inventory hash `b7721e26...`.
- **A3 urinary**: `BLOCKED_EXACT_HLK_RAW_BYTES_UNVERIFIED`. The original historical index has been located, but raw-byte re-hash is still pending and no accepted Current A3 owner exists.

The preserved frozen-resolver replay is **evidence only**. It proves why count-only closure is unsafe: its A1 membership exactly matches Current A1, but its A2 membership also has 359 questions while differing from Current A2 by seven IDs in each direction. Therefore `376/359/243 = 978` is not sufficient authority.

## Validator contract

`static-web/scripts/validate-xizong-system-scope-authority.mjs` distinguishes at least:

- `AUTHORITY_SOURCE_MISSING`
- `INPUT_HASH_MISMATCH`
- `RESOLVER_HASH_MISMATCH`
- `OUTPUT_HASH_MISMATCH`
- `OUTPUT_ROW_COUNT_MISMATCH`
- `CI_EXECUTION_UNAVAILABLE`

`OUTPUT_BYTE_COUNT_MISMATCH` is additionally explicit because the historical output is byte-locked.

The validator reports the two closure paths separately. A located-but-not-rehashed historical index is not treated as missing authority, and it is also not treated as authenticated authority. A blocked authority state is not itself a validator failure; the validator fails only when declared authority/evidence invariants are violated.

## Runtime consumption

Runtime must obtain accepted system scope through the shared lock. A system is consumable only when the lock says `CURRENT` and the owner file independently reproduces the locked count and inventory hash. Recovery evidence is never a runtime fallback.

## Evidence receipts

- `evidence/hlk-first-pass-system-pools.evidence.json` preserves the frozen resolver replay as membership evidence only.
- `evidence/historical-hlk-library-locator.evidence.json` records the recovered original relation-layer package identity while explicitly stating that raw-byte re-hash has not yet occurred.
