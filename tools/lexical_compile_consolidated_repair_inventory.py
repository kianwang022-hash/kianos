#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import re
from collections import defaultdict
from pathlib import Path
from typing import Any, Iterable

import lexical_historical_round_bulk_triage as triage
import lexical_historical_round_from_file as base
import lexical_historical_round_owner_surfaces as owner_surfaces
import lexical_historical_round_compound_surfaces  # noqa: F401 - applies parser compatibility patches

ROOT = Path(__file__).resolve().parents[1]
BATCH_DIR = ROOT / "content" / "lexical" / "audit" / "knowledge-reacceptance" / "batches"
MIGRATION_DIR = ROOT / "content" / "lexical" / "audit" / "migration-integrity"

CURRENT_CORRECT_LABELS = {
    "CURRENT_CORRECT",
    "CURRENT_ALREADY_BETTER",
    "CURRENT_ALREADY_SUFFICIENT",
}
PRESENTATION_LABELS = {
    "PRESENTATION_ONLY_GAP",
}


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def norm(text: Any) -> str:
    return triage.normalize(text)


def uniq(values: Iterable[Any]) -> list[Any]:
    out: list[Any] = []
    seen: set[str] = set()
    for value in values:
        key = json.dumps(value, ensure_ascii=False, sort_keys=True) if isinstance(value, (dict, list)) else str(value)
        if key not in seen:
            seen.add(key)
            out.append(value)
    return out


def round_number(path: Path) -> int | None:
    m = re.match(r"r(\d+)-", path.name)
    return int(m.group(1)) if m else None


def checkpoint_label(path: Path) -> str:
    rn = round_number(path)
    return f"R{rn}" if rn is not None else path.stem


def source_comment_meta(checkpoint: dict[str, Any]) -> tuple[str, int] | None:
    containers = [
        checkpoint.get("historical_authority") or {},
        checkpoint.get("semantic_authority") or {},
        checkpoint.get("authority") or {},
    ]
    repo = "kianwang022-hash/kianos-legacy"
    for c in containers:
        if c.get("repo"):
            repo = c["repo"]
        for key in (
            "comment_id",
            "legacy_issue_comment_id",
            "legacy_comment_id",
            "source_comment_id",
        ):
            value = c.get(key)
            if isinstance(value, int):
                return repo, value
        historical = c.get("historical_comment")
        if isinstance(historical, str):
            m = re.search(r"comment\s+(\d+)", historical)
            if m:
                return repo, int(m.group(1))
    return None


def authority_path(checkpoint: dict[str, Any]) -> str | None:
    containers = [
        checkpoint.get("historical_authority") or {},
        checkpoint.get("semantic_authority") or {},
        checkpoint.get("authority") or {},
    ]
    for c in containers:
        for key in (
            "execution_authority",
            "frozen_execution_authority",
            "frozen_path",
            "authority_manifest",
        ):
            value = c.get(key)
            if isinstance(value, str) and value:
                return value
    return None


def checkpoint_files() -> tuple[list[Path], list[Path], list[Path]]:
    early = sorted(
        [
            *BATCH_DIR.glob("r12-*-core-expansion.json"),
            *BATCH_DIR.glob("r13-*-core-expansion.json"),
        ],
        key=lambda p: (round_number(p) or 0, p.name),
    )
    r13_contrast = [BATCH_DIR / "r13-contrast-reconciliation.json"]
    rounds = []
    for rn in range(14, 32):
        matches = sorted(BATCH_DIR.glob(f"r{rn}-*-core-expansion-contrast.json"))
        if len(matches) != 1:
            raise RuntimeError(f"expected exactly one R{rn} round checkpoint, found {len(matches)}")
        rounds.append(matches[0])
    return early, r13_contrast, rounds


def owner_identity(word_id: str | None = None, ordinal: int | None = None) -> tuple[str, int | None, str | None]:
    owner = None
    if ordinal:
        path = ROOT / "content" / "lexical" / "words" / "by-ordinal" / f"o{ordinal:04d}.json"
        if path.is_file():
            owner = load_json(path)
    if owner is None and word_id:
        # This is only a fallback for early explicit checkpoints. Their word_id
        # normally accompanies an ordinal on Core rows. Scan is bounded to the
        # manifest only when needed rather than guessing a path from spelling.
        manifest = load_json(ROOT / "content" / "lexical" / "manifest.json")
        candidates = []
        if isinstance(manifest, dict):
            candidates.extend(manifest.get("words") or [])
            candidates.extend(manifest.get("owners") or [])
        for row in candidates:
            if isinstance(row, dict) and (row.get("word_id") == word_id or row.get("id") == word_id):
                o = row.get("ordinal")
                if isinstance(o, int):
                    path = ROOT / "content" / "lexical" / "words" / "by-ordinal" / f"o{o:04d}.json"
                    if path.is_file():
                        owner = load_json(path)
                        break
    if owner is None:
        return word_id or "", ordinal, None
    rec = owner.get("record") or {}
    wid = owner.get("word_id") or rec.get("word_id") or word_id or ""
    ord_value = owner.get("ordinal") or ordinal
    word = rec.get("word") or owner.get("word")
    return wid, int(ord_value) if ord_value else None, word


def make_provenance(path: Path, *, index: int | None = None, target_id: str | None = None, comment_id: int | None = None) -> dict[str, Any]:
    out: dict[str, Any] = {"checkpoint": path.relative_to(ROOT).as_posix()}
    if index is not None:
        out["index"] = index
    if target_id:
        out["target_id"] = target_id
    if comment_id:
        out["historical_comment_id"] = comment_id
    return out


class InventoryBuilder:
    def __init__(self) -> None:
        self.words: dict[str, dict[str, Any]] = {}
        self.relations: dict[str, dict[str, Any]] = {}
        self.forms: dict[str, dict[str, Any]] = {}
        self.presentation: dict[str, dict[str, Any]] = {}
        self.unresolved: list[dict[str, Any]] = []
        self.p0: set[str] = set()
        self.checkpoints: list[dict[str, Any]] = []
        self.latest_judgments: list[dict[str, Any]] = []

    def word_unit(self, word_id: str, ordinal: int | None = None, word: str | None = None) -> dict[str, Any]:
        if not word_id:
            raise RuntimeError("word repair requires word_id")
        if word_id not in self.words:
            wid, resolved_ordinal, resolved_word = owner_identity(word_id, ordinal)
            self.words[word_id] = {
                "owner_type": "WORD",
                "word_id": wid or word_id,
                "ordinal": resolved_ordinal,
                "word": resolved_word or word,
                "priority": "P1",
                "p0_lifecycle": False,
                "requirements": [],
                "latest_target_overrides": [],
                "provenance": [],
            }
        unit = self.words[word_id]
        if ordinal and not unit.get("ordinal"):
            unit["ordinal"] = ordinal
        if word and not unit.get("word"):
            unit["word"] = word
        return unit

    def mark_p0(self, word_id: str, provenance: dict[str, Any], note: str | None = None) -> None:
        unit = self.word_unit(word_id)
        unit["p0_lifecycle"] = True
        unit["priority"] = "P0"
        unit["provenance"].append(provenance)
        if note:
            unit["requirements"].append({"kind": "LIFECYCLE", "target": note, "provenance": provenance})
        self.p0.add(word_id)

    def add_word_requirement(
        self,
        word_id: str,
        *,
        ordinal: int | None,
        word: str | None,
        kind: str,
        target: str,
        classification: str | None,
        provenance: dict[str, Any],
        historical_target: str | None = None,
    ) -> None:
        unit = self.word_unit(word_id, ordinal, word)
        req = {
            "kind": kind,
            "target": target,
            "classification": classification,
            "provenance": provenance,
        }
        if historical_target and historical_target != target:
            req["historical_target"] = historical_target
        unit["requirements"].append(req)
        unit["provenance"].append(provenance)

    def add_latest_override(self, word_id: str, judgment: dict[str, Any], provenance: dict[str, Any]) -> None:
        unit = self.word_unit(word_id)
        unit["latest_target_overrides"].append({**judgment, "provenance": provenance})
        unit["provenance"].append(provenance)

    def add_presentation(self, owner_ids: list[str], target: str, provenance: dict[str, Any], classification: str) -> None:
        key = "|".join(sorted(owner_ids)) + "::" + norm(target)
        unit = self.presentation.setdefault(
            key,
            {
                "owner_type": "CONSTRUCTION_PRESENTATION",
                "owner_word_ids": sorted(owner_ids),
                "target": target,
                "classification": classification,
                "provenance": [],
            },
        )
        unit["provenance"].append(provenance)

    def add_relation(self, target: str, terms: list[str], provenance: dict[str, Any], classification: str) -> None:
        canonical_terms = sorted(set(norm(t) for t in terms if norm(t)))
        if len(canonical_terms) < 2:
            self.unresolved.append({
                "kind": "RELATION_OWNERSHIP_AMBIGUOUS",
                "target": target,
                "terms": terms,
                "provenance": provenance,
            })
            return
        key = "|".join(canonical_terms)
        unit = self.relations.setdefault(
            key,
            {
                "owner_type": "RELATION",
                "canonical_terms": canonical_terms,
                "approved_targets": [],
                "classifications": [],
                "provenance": [],
            },
        )
        unit["approved_targets"].append(target)
        unit["classifications"].append(classification)
        unit["provenance"].append(provenance)

    def add_form(self, target: str, owner_ids: list[str], provenance: dict[str, Any], classification: str) -> None:
        key = ("|".join(sorted(owner_ids)) if owner_ids else "UNRESOLVED") + "::" + norm(target)
        unit = self.forms.setdefault(
            key,
            {
                "owner_type": "WORD_IDENTITY_FORM",
                "owner_word_ids": sorted(owner_ids),
                "target": target,
                "classification": classification,
                "provenance": [],
            },
        )
        unit["provenance"].append(provenance)
        if not owner_ids:
            self.unresolved.append({
                "kind": "FORM_OWNER_UNRESOLVED",
                "target": target,
                "provenance": provenance,
            })

    def finalize(self) -> dict[str, Any]:
        for unit in self.words.values():
            unit["requirements"] = uniq(unit["requirements"])
            unit["latest_target_overrides"] = uniq(unit["latest_target_overrides"])
            unit["provenance"] = uniq(unit["provenance"])
        for collection in (self.relations, self.forms, self.presentation):
            for unit in collection.values():
                for key in ("approved_targets", "classifications", "provenance"):
                    if key in unit:
                        unit[key] = uniq(unit[key])

        p0_queue = sorted(
            [
                {
                    "word_id": wid,
                    "ordinal": self.words[wid].get("ordinal"),
                    "word": self.words[wid].get("word"),
                    "requirement_count": len(self.words[wid].get("requirements") or []),
                }
                for wid in self.p0
            ],
            key=lambda r: (r.get("ordinal") or 999999, r["word_id"]),
        )
        words = sorted(self.words.values(), key=lambda r: (r.get("ordinal") or 999999, r["word_id"]))
        relations = sorted(self.relations.values(), key=lambda r: r["canonical_terms"])
        forms = sorted(self.forms.values(), key=lambda r: (r.get("owner_word_ids") or [], r["target"]))
        presentation = sorted(self.presentation.values(), key=lambda r: (r.get("owner_word_ids") or [], r["target"]))
        unresolved = uniq(self.unresolved)

        return {
            "schema": "kianos.lexical.consolidated_repair_inventory.v1",
            "status": "READY_FOR_BOUNDED_REPAIR" if not unresolved else "FAIL_CLOSED_UNRESOLVED_OWNERSHIP",
            "coverage": {
                "checkpoint_span": "R12-R31",
                "historical_first_pass": "1-7946 COMPLETE",
                "semantic_mutation_during_compile": 0,
                "learner_state_mutation_during_compile": 0,
            },
            "rules": {
                "latest_target_wins": True,
                "historical_authority_is_evidence_not_immutable_ontology": True,
                "deduplicate_core_and_expansion_by_natural_word_owner": True,
                "cross_word_distinctions_are_relation_owned": True,
                "spelling_case_pronunciation_inflection_forms_are_word_identity_form_owned": True,
                "same_word_polysemy_is_natural_word_owned": True,
                "ambiguous_ownership_fails_closed": True,
            },
            "summary": {
                "p0_word_owners": len(p0_queue),
                "word_owner_repair_units": len(words),
                "relation_repair_units": len(relations),
                "word_identity_form_repair_units": len(forms),
                "explicit_presentation_only_units": len(presentation),
                "unresolved_ownership_units": len(unresolved),
            },
            "p0_queue": p0_queue,
            "word_repairs": words,
            "relation_repairs": relations,
            "word_identity_form_repairs": forms,
            "construction_presentation_only_repairs": presentation,
            "unresolved_ownership": unresolved,
            "checkpoint_provenance": self.checkpoints,
        }


def indices_from(section: dict[str, Any], *keys: str) -> set[int]:
    out: set[int] = set()
    for key in keys:
        value = section.get(key)
        if isinstance(value, list):
            out.update(int(v) for v in value if isinstance(v, (int, float)) or (isinstance(v, str) and v.isdigit()))
    return out


def words_to_ids(values: Any) -> set[str]:
    out: set[str] = set()
    if not isinstance(values, list):
        return out
    for value in values:
        if not isinstance(value, str):
            continue
        out.add(value if value.startswith("word:") else f"word:{value.lower()}")
    return out


def core_correct_sets(core: dict[str, Any]) -> tuple[set[int], set[int], set[str]]:
    correct_indices = indices_from(core, "current_correct_indices")
    correct_ordinals = indices_from(core, "current_correct_ordinals")
    correct_words = words_to_ids(core.get("current_correct_words"))
    classes = core.get("classification_indices") or {}
    if isinstance(classes, dict):
        correct_indices.update(int(v) for v in classes.get("CURRENT_CORRECT", []) if isinstance(v, int))
    return correct_indices, correct_ordinals, correct_words


def p0_word_ids(core: dict[str, Any]) -> set[str]:
    out = words_to_ids(core.get("p0_word_ids")) | words_to_ids(core.get("p0_words"))
    if isinstance(core.get("p0_word_ids"), list):
        out |= {v for v in core["p0_word_ids"] if isinstance(v, str) and v.startswith("word:")}
    return out


def fresh_judgments(checkpoint: dict[str, Any]) -> list[dict[str, Any]]:
    rows = checkpoint.get("fresh_semantic_judgments")
    return rows if isinstance(rows, list) else []


def judgment_for_word(rows: list[dict[str, Any]], word: str | None, word_id: str) -> dict[str, Any] | None:
    candidates = {norm(word or ""), norm(word_id.replace("word:", ""))}
    for row in rows:
        target = norm(row.get("target") or "")
        if target in candidates:
            return row
    return None


def isolated_upgrades(checkpoint: dict[str, Any]) -> list[dict[str, Any]]:
    cal = checkpoint.get("direct_pass_calibration") or {}
    out: list[dict[str, Any]] = []
    for key in ("isolated_upgrade_targets", "new_isolated_upgrade_targets"):
        value = cal.get(key)
        if isinstance(value, list):
            out.extend(v for v in value if isinstance(v, dict))
    return out


def expansion_class_sets(expansion: dict[str, Any], total: int) -> tuple[set[int], set[int], set[int]]:
    correct = indices_from(expansion, "current_correct_indices")
    partial = indices_from(expansion, "partial_indices", "presentation_only_indices", "partial_or_presentation_indices")
    missing = indices_from(expansion, "missing_indices", "full_gap_indices", "authority_missing_indices")
    if not missing and total:
        missing = set(range(1, total + 1)) - correct - partial
    return correct, partial, missing


def contrast_debt_sets(contrast: dict[str, Any]) -> tuple[set[int], set[int], set[int]]:
    relation: set[int] = set()
    form: set[int] = set()
    word_internal: set[int] = set()

    rel = contrast.get("relation") or {}
    if isinstance(rel, dict):
        relation |= indices_from(rel, "missing_indices", "partial_indices", "authority_missing_indices")
    relation |= indices_from(contrast, "missing_relation_indices", "partial_relation_indices")

    for key in (
        "word_or_identity_or_form",
        "word_or_identity",
        "word_identity_form",
        "word_identity",
        "form",
    ):
        section = contrast.get(key)
        if isinstance(section, dict):
            form |= indices_from(section, "missing_indices", "partial_indices", "full_gap_indices", "indices")
    form |= indices_from(contrast, "form_pronunciation_gap_indices", "word_or_identity_or_form_indices")

    internal = contrast.get("word_owner_internal_polysemy") or {}
    if isinstance(internal, dict):
        word_internal |= indices_from(internal, "missing_indices", "partial_indices", "indices")

    # Some checkpoints carry only ownership index arrays plus overall missing.
    if not relation:
        latest = contrast.get("latest_ownership") or {}
        if isinstance(latest, dict):
            all_form = indices_from(latest, "word_or_identity_or_form_indices", "word_or_identity_indices")
            form |= all_form
            total = contrast.get("overall", {}).get("missing") if isinstance(contrast.get("overall"), dict) else None
            if isinstance(total, int) and total > 0:
                # defer complement construction to the caller, which knows parsed row count
                pass
    return relation, form, word_internal


def parse_round_source(checkpoint: dict[str, Any]) -> tuple[str, int | None, list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    meta = source_comment_meta(checkpoint)
    if meta:
        repo, comment_id = meta
        body = triage.fetch_comment(repo, comment_id)["body"]
    else:
        comment_id = None
        ap = authority_path(checkpoint)
        if not ap:
            raise RuntimeError("round checkpoint has neither historical comment nor local authority")
        body = (ROOT / ap).read_text(encoding="utf-8")

    # Reset mutable parser hints per round.
    base.EXPANSION_OWNER_HINTS = {}
    base.EXPANSION_OWNER_TARGETS = []
    base.EXPANSION_DECLARED_COUNT = None

    core_rows = owner_surfaces.parse_core_compatible(body)
    expansion_rows = owner_surfaces.parse_simple_targets_compatible(
        body,
        "### Expansion Gate",
        ("### Contrast Gate", "### Existing", "### Mechanical", "### Apply", "Canonical Apply:"),
        "expansion",
    )
    contrast_rows = owner_surfaces.parse_simple_targets_compatible(
        body,
        "### Contrast Gate",
        ("### Existing", "### Mechanical", "### Apply", "Canonical Apply:", "Reuse rather than duplicate"),
        "contrast",
    )
    return body, comment_id, core_rows, expansion_rows, contrast_rows


def r13_authority_target_map(checkpoint: dict[str, Any]) -> dict[str, str]:
    ap = authority_path(checkpoint)
    if not ap:
        return {}
    data = load_json(ROOT / ap)
    found: dict[str, str] = {}

    def walk(value: Any) -> None:
        if isinstance(value, dict):
            tid = value.get("target_id")
            target = value.get("approved_target") or value.get("target")
            if isinstance(tid, str) and isinstance(target, str):
                found[tid] = target
            for child in value.values():
                walk(child)
        elif isinstance(value, list):
            for child in value:
                walk(child)

    walk(data)
    return found


def add_early_explicit(builder: InventoryBuilder, path: Path) -> None:
    cp = load_json(path)
    builder.checkpoints.append({"checkpoint": path.relative_to(ROOT).as_posix(), "mode": "EXPLICIT_RECONCILIATION"})
    for row in cp.get("core_reconciliation") or []:
        if row.get("classification") in CURRENT_CORRECT_LABELS:
            continue
        word_id = row.get("word_id")
        ordinal = row.get("ordinal")
        if not word_id:
            builder.unresolved.append({"kind": "EARLY_CORE_OWNER_MISSING", "row": row, "checkpoint": path.relative_to(ROOT).as_posix()})
            continue
        prov = make_provenance(path)
        builder.add_word_requirement(
            word_id,
            ordinal=ordinal,
            word=word_id.replace("word:", ""),
            kind="CORE",
            target=row.get("approved_target") or "",
            classification=row.get("classification"),
            provenance=prov,
        )
        if "P0" in str(row.get("severity") or ""):
            builder.mark_p0(word_id, prov, "Historical checkpoint marks owner P0/severe lifecycle repair.")

    for row in cp.get("expansion_reconciliation") or []:
        if row.get("classification") in CURRENT_CORRECT_LABELS:
            continue
        word_id = row.get("word_id")
        target = row.get("approved_target") or ""
        prov = make_provenance(path)
        if not word_id:
            builder.unresolved.append({"kind": "EARLY_EXPANSION_OWNER_MISSING", "target": target, "checkpoint": path.relative_to(ROOT).as_posix()})
            continue
        if row.get("classification") in PRESENTATION_LABELS:
            builder.add_presentation([word_id], target, prov, row.get("classification") or "PRESENTATION_ONLY_GAP")
        else:
            builder.add_word_requirement(
                word_id,
                ordinal=None,
                word=word_id.replace("word:", ""),
                kind="SURFACE",
                target=target,
                classification=row.get("classification"),
                provenance=prov,
            )


def add_r13_contrast(builder: InventoryBuilder, path: Path) -> None:
    cp = load_json(path)
    builder.checkpoints.append({"checkpoint": path.relative_to(ROOT).as_posix(), "mode": "EXPLICIT_CONTRAST_RECONCILIATION"})
    result = ((cp.get("chat_reconciliation") or {}).get("results") or {})
    authority = r13_authority_target_map(cp)

    for row in result.get("PRESENTATION_ONLY_GAP") or []:
        target = row.get("approved_target") or ""
        owner_id = row.get("owner")
        prov = make_provenance(path, target_id=row.get("target_id"))
        if owner_id:
            builder.add_presentation([owner_id], target, prov, "PRESENTATION_ONLY_GAP")
        else:
            builder.unresolved.append({"kind": "R13_PRESENTATION_OWNER_MISSING", "target": target, "provenance": prov})

    for row in result.get("FORM_PRONUNCIATION_CASE_REGIONAL_GAP") or []:
        target = row.get("approved_target") or ""
        owner_id = row.get("owner")
        prov = make_provenance(path, target_id=row.get("target_id"))
        builder.add_form(target, [owner_id] if owner_id else [], prov, "FORM_PRONUNCIATION_CASE_REGIONAL_GAP")

    for target_id in result.get("AUTHORITY_MISSING_FROM_CURRENT") or []:
        target = authority.get(target_id)
        prov = make_provenance(path, target_id=target_id)
        if not target:
            builder.unresolved.append({"kind": "R13_RELATION_TARGET_NOT_IN_AUTHORITY", "target_id": target_id, "provenance": prov})
            continue
        terms = base.contrast_terms_compatible(target)
        builder.add_relation(target, terms, prov, "AUTHORITY_MISSING_FROM_CURRENT")


def add_round(builder: InventoryBuilder, path: Path) -> None:
    cp = load_json(path)
    rn = round_number(path)
    body, comment_id, core_rows, expansion_rows, contrast_rows = parse_round_source(cp)
    builder.checkpoints.append({
        "checkpoint": path.relative_to(ROOT).as_posix(),
        "round": rn,
        "historical_comment_id": comment_id,
        "parsed_counts": {"core": len(core_rows), "expansion": len(expansion_rows), "contrast": len(contrast_rows)},
    })

    fresh = fresh_judgments(cp)
    core = cp.get("core") or {}
    correct_idx, correct_ord, correct_word_ids = core_correct_sets(core)

    # If a checkpoint provides explicit classification buckets, respect them.
    explicit_defect_idx: set[int] = set()
    classes = core.get("classification_indices") or {}
    if isinstance(classes, dict):
        for label, values in classes.items():
            if label == "CURRENT_CORRECT" or not isinstance(values, list):
                continue
            explicit_defect_idx.update(int(v) for v in values if isinstance(v, int))

    for row in core_rows:
        idx = int(row["index"])
        ordinal = int(row["ordinal"])
        word_id = row["word_id"]
        word = word_id.replace("word:", "")
        is_correct = idx in correct_idx or ordinal in correct_ord or word_id in correct_word_ids
        if explicit_defect_idx:
            is_defect = idx in explicit_defect_idx
        else:
            is_defect = not is_correct
        if not is_defect:
            continue

        historical_target = row.get("approved_revision") or ""
        judgment = judgment_for_word(fresh, word, word_id)
        target = historical_target
        if judgment and judgment.get("decision") not in CURRENT_CORRECT_LABELS and judgment.get("latest"):
            target = judgment["latest"]
        prov = make_provenance(path, index=idx, comment_id=comment_id)
        builder.add_word_requirement(
            word_id,
            ordinal=ordinal,
            word=word,
            kind="CORE",
            target=target,
            historical_target=historical_target,
            classification="DEFECTIVE_OR_UPGRADE_REQUIRED",
            provenance=prov,
        )
        if judgment and judgment.get("latest"):
            builder.add_latest_override(word_id, judgment, prov)

    # Lifecycle priority is orthogonal to semantic debt.
    for wid in p0_word_ids(core):
        builder.mark_p0(wid, make_provenance(path, comment_id=comment_id), "Current checkpoint marks owner Active=0/P0.")
    for key in ("dead_anchor_word_ids", "other_severe_carrier_loss"):
        for wid in words_to_ids(core.get(key)):
            builder.mark_p0(wid, make_provenance(path, comment_id=comment_id), f"Current checkpoint flags {key}.")

    # Preserve fresh judgment provenance even when it is not attached through a
    # historical Core row (e.g. direct learner-target upgrades).
    for j in fresh:
        target_word = norm(j.get("target") or "")
        if not target_word or "/" in target_word or " vs " in target_word:
            continue
        wid = f"word:{target_word}"
        if wid in builder.words and j.get("latest"):
            builder.add_latest_override(wid, j, make_provenance(path, comment_id=comment_id))

    for upgrade in isolated_upgrades(cp):
        word = upgrade.get("word")
        ordinal = upgrade.get("ordinal")
        latest = upgrade.get("latest")
        if not word or not latest:
            continue
        wid = f"word:{norm(word)}"
        builder.add_word_requirement(
            wid,
            ordinal=int(ordinal) if isinstance(ordinal, int) else None,
            word=word,
            kind="DIRECT_PASS_CALIBRATION_UPGRADE",
            target=latest,
            classification="ISOLATED_UPGRADE_TARGET",
            provenance=make_provenance(path, comment_id=comment_id),
        )

    expansion = cp.get("expansion") or {}
    correct_exp, partial_exp, missing_exp = expansion_class_sets(expansion, len(expansion_rows))
    start, end = triage.parse_round_range(body)
    _by_ord, by_word, _by_id = triage.load_range_owners(start, end)

    for row in expansion_rows:
        idx = int(row["index"])
        if idx in correct_exp or (idx not in partial_exp and idx not in missing_exp):
            continue
        target = row.get("approved_target") or ""
        prov = make_provenance(path, index=idx, comment_id=comment_id)
        explicit_hints = base.EXPANSION_OWNER_HINTS.get(target)
        if explicit_hints is not None:
            owners = [by_word[w] for w in explicit_hints if w in by_word]
            explicit_multi = len(explicit_hints) > 1
        else:
            owners = base.expansion_owner_candidates_compatible(target, by_word)
            explicit_multi = False

        owner_ids = uniq([
            o.get("word_id") or (o.get("record") or {}).get("word_id")
            for o in owners
            if o.get("word_id") or (o.get("record") or {}).get("word_id")
        ])
        if not owner_ids:
            builder.unresolved.append({
                "kind": "EXPANSION_OWNER_ABSENT_OR_UNRESOLVED",
                "target": target,
                "classification": "PARTIAL" if idx in partial_exp else "MISSING",
                "provenance": prov,
            })
            continue
        if len(owner_ids) > 1 and not explicit_multi:
            builder.unresolved.append({
                "kind": "EXPANSION_OWNER_AMBIGUOUS",
                "target": target,
                "candidate_word_ids": owner_ids,
                "provenance": prov,
            })
            continue
        if explicit_multi:
            # Authority explicitly names a multi-owner family. Keep it as one
            # bounded construction/presentation unit instead of duplicating a
            # semantic rewrite across several Natural Owners.
            builder.add_presentation(owner_ids, target, prov, "AUTHORITY_MULTI_OWNER_SURFACE")
            continue

        wid = owner_ids[0]
        builder.add_word_requirement(
            wid,
            ordinal=owners[0].get("ordinal") if owners else None,
            word=(owners[0].get("record") or {}).get("word") if owners else None,
            kind="SURFACE",
            target=target,
            classification="PARTIAL" if idx in partial_exp else "MISSING",
            provenance=prov,
        )

    contrast = cp.get("contrast") or {}
    relation_idx, form_idx, internal_idx = contrast_debt_sets(contrast)
    total_contrast = len(contrast_rows)

    # Some newer checkpoints carry only the form ownership indices and an
    # overall missing count. The remaining missing targets are relation-owned.
    if not relation_idx and total_contrast:
        overall = contrast.get("overall") or {}
        overall_missing = overall.get("missing") if isinstance(overall, dict) else None
        overall_partial = overall.get("partial") if isinstance(overall, dict) else None
        if isinstance(overall_missing, int) and overall_missing > 0:
            relation_idx = set(range(1, total_contrast + 1)) - form_idx - internal_idx
        elif isinstance(contrast.get("missing_relation_indices"), list):
            relation_idx = indices_from(contrast, "missing_relation_indices")

    for row in contrast_rows:
        idx = int(row["index"])
        target = row.get("approved_target") or ""
        prov = make_provenance(path, index=idx, comment_id=comment_id)
        terms = base.contrast_terms_compatible(target)
        if idx in relation_idx:
            builder.add_relation(target, terms, prov, "RELATION_MISSING_OR_PARTIAL")
        elif idx in form_idx:
            owner_ids: list[str] = []
            for term in terms:
                term_norm = norm(term)
                if term_norm in by_word:
                    wid = by_word[term_norm].get("word_id") or (by_word[term_norm].get("record") or {}).get("word_id")
                    if wid:
                        owner_ids.append(wid)
            builder.add_form(target, uniq(owner_ids), prov, "WORD_IDENTITY_FORM_GAP")
        elif idx in internal_idx:
            term = terms[0] if terms else ""
            term_norm = norm(term)
            owner_obj = by_word.get(term_norm)
            wid = owner_obj.get("word_id") if owner_obj else None
            if not wid and term_norm:
                wid = f"word:{term_norm}"
            if wid:
                builder.add_word_requirement(
                    wid,
                    ordinal=owner_obj.get("ordinal") if owner_obj else None,
                    word=(owner_obj.get("record") or {}).get("word") if owner_obj else term_norm,
                    kind="WORD_INTERNAL_POLYSEMY",
                    target=target,
                    classification="SAME_WORD_POLYSEMY_GAP",
                    provenance=prov,
                )
            else:
                builder.unresolved.append({"kind": "WORD_INTERNAL_OWNER_UNRESOLVED", "target": target, "provenance": prov})


def write_summary(path: Path, inventory: dict[str, Any]) -> None:
    s = inventory["summary"]
    lines = [
        "# LexicalOS consolidated repair inventory",
        "",
        f"- Status: **{inventory['status']}**",
        f"- P0 Word owners: **{s['p0_word_owners']}**",
        f"- Word-owner repair units: **{s['word_owner_repair_units']}**",
        f"- Relation repair units: **{s['relation_repair_units']}**",
        f"- Word/Identity/Form repair units: **{s['word_identity_form_repair_units']}**",
        f"- Explicit presentation-only units: **{s['explicit_presentation_only_units']}**",
        f"- Unresolved ownership units: **{s['unresolved_ownership_units']}**",
        "",
        "## First repair priority",
        "",
    ]
    for row in inventory["p0_queue"][:100]:
        lines.append(f"- `{row['ordinal']}` `{row['word_id']}` — {row['requirement_count']} requirement(s)")
    if inventory["unresolved_ownership"]:
        lines.extend(["", "## Fail-closed unresolved ownership", ""])
        for row in inventory["unresolved_ownership"][:100]:
            lines.append(f"- `{row.get('kind')}` — {row.get('target') or row.get('target_id') or row.get('checkpoint')}")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    parser.add_argument("--summary", required=True)
    args = parser.parse_args()

    builder = InventoryBuilder()
    early, r13_contrast, rounds = checkpoint_files()
    for path in early:
        add_early_explicit(builder, path)
    for path in r13_contrast:
        add_r13_contrast(builder, path)
    for path in rounds:
        add_round(builder, path)

    inventory = builder.finalize()
    payload = json.dumps(inventory, ensure_ascii=False, indent=2) + "\n"
    inventory["content_sha256"] = hashlib.sha256(payload.encode("utf-8")).hexdigest()
    payload = json.dumps(inventory, ensure_ascii=False, indent=2) + "\n"
    Path(args.output).write_text(payload, encoding="utf-8")
    write_summary(Path(args.summary), inventory)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
