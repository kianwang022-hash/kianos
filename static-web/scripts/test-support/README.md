# Bounded verification support

This is a small shared seam for existing tests, not a test runner or a new acceptance authority. Production behavior stays in `src/` and the Current delivery owners.

`isolated-runtime.mjs` is used by the personal-system acceptance tool and `test-current-runtime-reload.mjs`:

- `isolatedTestEnv(root)` removes inherited KianOS targets, then delegates private roots and disabled relays to the existing `isolatedCandidateEnv`.
- `reserveLoopbackPort()` reserves an available ephemeral loopback port and rejects Stable/Candidate ports. A child must prove its own readiness after binding; a responding unrelated server is insufficient.
- `waitForLearnerWriter(page, {consumer})` waits for the native writer and, when supplied, a visible consumer. Writer readiness alone never proves business success.
- `stopOwnedProcess(child, {processGroup})` only stops a child the caller created; the group option requires a detached child. It waits for exit and escalates TERM to KILL on that owned process only.

`native-memory-evidence.mjs` calls the actual Memory release, append, queue and repair owners. It does not copy their algorithms. `test-native-memory-evidence.mjs` uses the same assertions against three deliberately faulty wrappers to prove that evidence collapse, missing repair closure and invented mastery fail.

`native-evidence-browser.mjs` runs against complete production KP/System Astro components in `personal-system-acceptance/fixtures/native-evidence.astro`. Its synthetic preconditions exercise two repeated KP observations, all three System Recall phases, unrevealed guards and a quota failure. It does not change completion rules, revision witnesses or the production handlers. The A2 CLI retains mounting, single-writer and non-destructive static guards; browser-only claims are reported by this browser proof, not by a copied Node algorithm.

Run from `static-web/` using already installed dependencies:

```sh
node scripts/test-native-memory-evidence.mjs
node scripts/validate-xizong-a2-evidence.mjs
node scripts/test-current-static-impact.mjs
KIANOS_TEST_CHROME='/path/to/already-installed/chromium' node scripts/personal-system-acceptance/run.mjs --prove-detector
```

## Verification-only delivery boundary

`currentStaticImpact.mjs` supplies one predicate to both static-build impact and runtime-reload classification. The only new `validate-*` exception is the audited `validate-xizong-a2-evidence.mjs`, called by `package.json`'s `validate:xizong` and the two Xizong QA workflows. The support, acceptance-tool and Politics fixture namespaces contain only test consumers. Unknown `validate-*` modules and native runtime helpers retain conservative reload behavior; mixed changes still build/promote.

`test-current-runtime-reload.mjs` executes the real sync owner against a local Git remote and fake build/site fixture. It records build invocations and reads native control/served SHAs, server PID, artifact root and bytes. A verification-only commit must advance the control SHA while preserving everything served. Mixed and unknown-script commits must build and replace the site process. Existing daemon-helper restart and transient-reset failure checks remain.

To replay the original classification defect, the optional command below uses the locally available classifier from `38530eb` in the temporary fixture. Its expected result is **nonzero with `VERIFICATION_ONLY_MUST_NOT_BUILD`**, not an arbitrary launch failure:

```sh
node scripts/test-current-runtime-reload.mjs --legacy-classifier
```

The accompanying existing release checks cover the old served base after failed builds, probe failure, configured-endpoint rollback, fetched-head races and superseded targets. They use synthetic Git repositories/build artifacts. Never run a Current daemon against a real mirror to verify these changes.
