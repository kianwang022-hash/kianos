# Recovery evidence — not authority

`hlk-first-pass-system-pools.evidence.json` is a membership-preserving compact normalization of the recovered `hlk-first-pass-system-pools.json` artifact. It stores the exact recovered IDs as deterministic year/range specs plus both the artifact's ordered-ID hash and the Current-runtime sorted inventory hash.

The source artifact was produced by `kianwang022-hash/kianos-site-v238-recovery` at commit `208441bdc843d7e02d25a435acad0628ecafa56f`, workflow run `34640880517`, artifact id `10279619403`. The extracted source file SHA256 was `03c8bb01306099cac0e258ef1e635307d0a46979925f94bee92665f23a8b61f5`.

The normalized evidence file SHA256 is `fe1056906c9f56f548b0921565dbf7562034d24d1168a3e65908eed3a404cbb5`.

This is **EVIDENCE_ONLY**. It must never be consumed as accepted system membership. In particular, its respiratory pool has the same 359-question count as Current A2 but a different membership inventory. That divergence is intentionally checked by the shared validator as a regression sentinel.
