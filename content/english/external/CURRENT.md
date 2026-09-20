# English External Reading Current

Role: **External Reading continuous Content-lane Work Cursor**

Parent: `content/english/CURRENT.md`  
Learning authority: `content/english/LEARNING_CONTRACT.md`  
Identity / inventory owner: `content/english/external/manifest.json`

External Reading is an English child Content lane for **ongoing reading growth**. It is not a second English-I Reading-A course and not a learner-state database.

## Current learner purpose

```text
English-I papers stop providing enough new reading stimulus
→ continue high-quality reading volume
→ current active pool: repaired TPO 56–65 + IELTS Academic 17–19
→ next official acquisition: IELTS 21 Academic → IELTS 20 Academic
→ current TOEFL task semantics: ETS current official sources
→ later add high-quality long-form only when it expands useful reading range
```

Shared gains such as proposition representation, discourse tracking, lexical access, speed and stamina may transfer naturally.

Source-native TOEFL / IELTS task identity remains source-native. Do not teach those question methods as English-I Reading-A rules merely because the same reading workspace is reused.

Important TOEFL time boundary: TPO56–65 remain useful historical academic Reading Growth assets, but they are not the 2026 current-format TOEFL task authority. Current TOEFL task forms and current-format practice must come from current ETS official sources.

## Current ownership

```text
PUBLIC KIANOS
manifest / identity / expected counts / quality flags
+ compiler / adapter / runtime code
        ↓
PRIVATE EXTERNAL SOURCE
copyrighted passage / question / answer bytes
        ↓
private compiled bundle
        ↓
External Reading workspace
        ↓
PRIVATE LEARNER EVIDENCE
exposure / answers / timing / uncertainty / repair
```

The public `kianos` repository must not become a redistribution store for copyrighted TOEFL / IELTS source bytes.

## Current inventory

- legacy TOEFL / TPO 56–65: **10 collections / 30 passages / 395 questions**
- Cambridge IELTS Academic 17–19: **3 books / 12 tests / 36 passages / 480 questions**
- stable identities: `tpo56-p1`, `tpo56-p1-q1`, `ielts17-t1-p1`, etc.
- active private source: **repaired candidate 2026-09-20 pass 15 + TPO62 closure + IELTS18 T1P1 table restoration**
- current source-quality claim: **REPAIRED_CANDIDATE; not corpus-wide PROVEN_CLEAN**
- historical known OCR pollution has been repaired under bounded/source-corroborated rules; TPO62's retained page-3 presentation artefact is now resolved. IELTS18/19 remain OCR-source-marked; the last explicit visual-layout blocker (IELTS18 Test 1 Passage 1 Questions 4–7) has been closed by bounded web-assisted restoration.

## Current runtime

Current candidate restores the old proven architecture with stricter boundaries:

```text
private Source exists **and hash-matches the active repaired candidate**
→ bounded mechanical compiler
→ private bundle
→ loopback read-only bridge
→ /external-reading/
```

Rules:

- active source hash mismatch fails closed as `stale_source` before compilation;
- no semantic guessing;
- no public copyrighted bytes;
- unsupported source-native question structures stay source-bound/free-text or reading-only;
- questionless future material stays questionless;
- answer bytes are not loaded into the learner surface before Submit;
- pure reading is a legitimate completion path;
- Wrong / Uncertain do not automatically create debt;
- real exposure uses the same English private exposure ledger as ordinary study/mock.

## Source-quality boundary

Historical External source review found real OCR debt. The 2026-09-20 repaired candidate removed the known pollution set and passed the current structural/boundary gates. Therefore:

```text
SOURCE_READY / structurally compilable
≠
PROVEN_CLEAN
```

Only exact mechanical cleanup or source/hash-bound cleanup is allowed without renewed source-page evidence. Ambiguous text remains explicit debt; do not silently “repair” it. The public manifest now carries the exact 14-file repaired-source SHA set so an old local corpus cannot be compiled accidentally.

## Next official acquisition

Current acquisition order is:

1. Cambridge IELTS 21 Academic — source bytes pending;
2. Cambridge IELTS 20 Academic — source bytes pending;
3. current ETS TOEFL Reading / official full-length practice — current-format authority;
4. other high-quality authentic long-form sources under Source Intake v1.

These are future-source identities only. They do not change the current active count of 66 passages / 875 question-answer slots until private source bytes are actually admitted and compiled.

Legacy TPO56–65 must not be promoted into a current TOEFL mock model merely because they retain TOEFL source identity.

## Future content update path

A normal new External content update should be:

```text
new private source material
→ assign stable public identity / metadata in manifest
→ compile private bundle
→ source/structure QA
→ existing External workspace consumes it
```

Do not create a new UI/runtime family for every source collection. Do not add material merely to grow a quota.

## Current final-acceptance relationship

English-wide integration is landed through PR #498. The public compiler/bridge/runtime boundaries, exposure/durability integration and External Reading learner surface are part of the accepted English engineering chain.

The remaining local operational boundary is intentionally machine-specific:

1. durable private-byte owner is the expanded Library Active Source tree registered by `private-source-bundle`;
2. the Mac runtime source root still defaults to `~/Documents/Study/英语资料库/EnglishOS/External_Reading_Corpus` and must be materialized/synced from that Active Source tree;
3. before compilation, all 14 required source files must hash-match the repaired candidate recorded in the public manifest; an old same-filename corpus returns `stale_source`;
4. the private runtime bundle is compiled under `~/Library/Application Support/KianOS/external-reading/`;
5. `npm run current:doctor` reports missing or stale External Reading source without turning an absent optional lane into a whole-site failure;
6. remaining source-quality warnings stay explicit: IELTS18/19 keep OCR-source provenance; known visual/layout blockers are closed;
7. real study `U` remains real-use-only.

Do not reopen English-wide integration merely because the private corpus is absent on one machine; repair the private source path/bundle only.
