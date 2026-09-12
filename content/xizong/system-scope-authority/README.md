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

The four recovered historical inputs are hash-locked in `system-scope-authority.lock.json`. The semantic resolver hash and its nine collision decision IDs are also locked. The resolver bytes and the exact HLK generator identity/version are not yet recovered, so deterministic rebuild remains intentionally disabled.

## Current systems

- **A1 circulation**: Current accepted owner, 376 questions, inventory hash `ded191082...`.
- **A2 respiratory**: Current accepted owner, 359 questions, inventory hash `b7721e26...`.
- **A3 urinary**: blocked. Historical count 243 is known, but no accepted Current membership is admitted until exact HLK authority is recovered or the exact deterministic generator reproduces the historical output fingerprint.

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

The normal validator succeeds when the lock is internally coherent even if A3 is intentionally blocked. A blocked authority state is not a validator failure. The validator fails only when the declared authority/evidence invariants are violated.

## Runtime consumption

Runtime must obtain accepted system scope through the shared lock. A system is consumable only when the lock says `CURRENT` and the owner file independently reproduces the locked count and inventory hash. Recovery evidence is never a runtime fallback.

## Rebuild contract

`static-web/scripts/rebuild-xizong-system-scope-authority.mjs` is fail-closed. It verifies every available locked input and the resolver before any generation could be admitted. Until the exact historical generator is recovered and locked, it deliberately refuses to generate membership. This prevents taxonomy counts, current medical semantics, or replay heuristics from silently replacing historical authority.
