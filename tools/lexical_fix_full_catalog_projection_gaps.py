#!/usr/bin/env python3
"""Repair a full-catalog K projection seam for record.form_identity.boundaries[].

Current content packages use plural `boundaries` for same-owner Form/spelling truth,
while the vocabulary learner component historically rendered only legacy singular
`boundary` plus `variants`.  This patch is projection-only and idempotent.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / 'static-web' / 'src' / 'components' / 'VocabularyWordRuntime.astro'
text = PATH.read_text(encoding='utf-8')

old_decl = "const formIdentity = card.form_identity && typeof card.form_identity === 'object' ? card.form_identity : null;\nconst formVariants = Array.isArray(formIdentity?.variants) ? formIdentity.variants : [];"
new_decl = "const formIdentity = card.form_identity && typeof card.form_identity === 'object' ? card.form_identity : null;\nconst formBoundaries = Array.isArray(formIdentity?.boundaries) ? formIdentity.boundaries : [];\nconst formVariants = Array.isArray(formIdentity?.variants) ? formIdentity.variants : [];"

old_view = """          {formIdentity && <section class=\"lexicalExpansionSection lexicalFormSection\" data-vocab-target-row>
            <header><span>Form / Pronunciation</span><small>形式会改变读取时才显示</small></header>
            {formIdentity.boundary && <p class=\"lexicalFormBoundary\">{formIdentity.boundary}</p>}
            {formVariants.length > 0 && <div class=\"lexicalFormVariants\">{formVariants.map((variant) => <article><b>{variant.learner_key || variant.canonical_form || variant.variant_id}</b>{variant.ipa && <span>{variant.ipa}</span>}{Array.isArray(variant.pos) && <small>{variant.pos.join(' / ')}</small>}</article>)}</div>}
            <button type=\"button\" data-vocab-repair data-target-kind=\"form_identity\" data-target-id=\"\" data-target-locator=\"record.form_identity\" data-target-label={`${formIdentity.boundary || card.word}`} aria-pressed=\"false\">+</button>
          </section>}"""
new_view = """          {formIdentity && <section class=\"lexicalExpansionSection lexicalFormSection\" data-vocab-target-row>
            <header><span>Form / Pronunciation</span><small>形式会改变读取时才显示</small></header>
            {formIdentity.boundary && <p class=\"lexicalFormBoundary\">{formIdentity.boundary}</p>}
            {formBoundaries.length > 0 && <div class=\"lexicalFormVariants\">{formBoundaries.map((boundary) => <article><b>{boundary.surface || boundary.condition || 'Form boundary'}</b>{boundary.condition && boundary.surface && <span>{boundary.condition}</span>}{boundary.note && <small>{boundary.note}</small>}</article>)}</div>}
            {formVariants.length > 0 && <div class=\"lexicalFormVariants\">{formVariants.map((variant) => <article><b>{variant.learner_key || variant.canonical_form || variant.variant_id}</b>{variant.ipa && <span>{variant.ipa}</span>}{Array.isArray(variant.pos) && <small>{variant.pos.join(' / ')}</small>}</article>)}</div>}
            <button type=\"button\" data-vocab-repair data-target-kind=\"form_identity\" data-target-id=\"\" data-target-locator=\"record.form_identity\" data-target-label={`${formIdentity.boundary || formBoundaries.map((boundary) => boundary.surface).filter(Boolean).join(' / ') || card.word}`} aria-pressed=\"false\">+</button>
          </section>}"""

if old_decl in text:
    text = text.replace(old_decl, new_decl, 1)
elif new_decl not in text:
    raise RuntimeError('FORM_BOUNDARIES_DECLARATION_SEAM_NOT_FOUND')

if old_view in text:
    text = text.replace(old_view, new_view, 1)
elif new_view not in text:
    raise RuntimeError('FORM_BOUNDARIES_VIEW_SEAM_NOT_FOUND')

PATH.write_text(text, encoding='utf-8')
print('FULL_CATALOG_K_FORM_BOUNDARIES_PROJECTION_PATCH_PASS')
