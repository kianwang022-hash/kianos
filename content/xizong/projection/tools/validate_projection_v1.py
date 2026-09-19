#!/usr/bin/env python3
"""Validate Current Projection bindings and declarative visibility, never learner state.

Standard library only. Mutations use an in-memory filesystem overlay. This is an
asset validator, NOT a browser renderer, clinical semantic audit or S--U acceptance.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path, PurePosixPath
from typing import Any

ROOT = Path(__file__).resolve().parents[4]
PREFIX = 'content/xizong/projection/'
KNOWLEDGE = 'content/xizong/knowledge/'
MANIFEST = PREFIX + 'manifest.json'
VERSION = '1.1.0'
ROLES = set('PROBLEM MAP CHAIN COMPARE BOUNDARY EXACT HANDOFF RECALL CLOSURE REFERENCE'.split())
GEOMETRIES = set('SEQUENCE LOOP MATRIX AXES TREE NETWORK TABLE FORMULA_STRIP SPATIAL_MAP TEXT_STRUCTURE'.split())
KINDS = set('SYSTEM_CORE MEDICAL_CORE LEARNING_SUPPORT SELECTIVE_CUES PATHWAYS EXTERNAL_SOURCE_CONTRACT'.split())
DEFAULT_FRESHNESS = {k: 'RESOLVE_BINDING' for k in KINDS}
DEFAULT_FRESHNESS.update(MEDICAL_CORE='STRICT_BLOB', EXTERNAL_SOURCE_CONTRACT='STRICT_BLOB')
BLOCK_VIEWS = set('BLOCK_ORIENT LOGIC_GROUP_ORIENT EXTERNAL_HANDOFF KP_RECALL_FRONT KP_RECALL_REVEAL GROUP_CLOSURE BLOCK_RECALL_FRONT BLOCK_RECALL_REVEAL'.split())
SYSTEM_VIEWS = set('SYSTEM_GUIDE SYSTEM_RECALL_FRONT SYSTEM_RECALL_REVEAL'.split())
FRONTS = {'KP_RECALL_FRONT', 'BLOCK_RECALL_FRONT', 'SYSTEM_RECALL_FRONT'}
SOURCE_KEYS = set('id kind path blob_sha baseline_blob_sha freshness'.split())
OBJECT_KEYS = set('object_id role geometry binding stage_role answer_bearing note'.split())
VIEW_KEYS = set('object_ids block_object_ids learning_support_keys context_policy enrichment_policy external_contract_policy handoff_binding_ids kp_content_policy protection provenance_policy show_logic_group_map source_locator_policy logic_map_policy'.split())
BINDING_KEYS = set('kind source_id selector owner_type id block_id role index item_id where binding_id anchor semantic_role stage_role timing_semantics policy surface scope_policy learner_content_policy value_type'.split())
SCHEMAS = {f'kianos.xizong.cognitive_projection.{k}.v1' for k in ['block', 'system']}


class Invalid(ValueError):
    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code


def require(ok: Any, code: str, message: str) -> None:
    if not ok:
        raise Invalid(code, message)


def nonempty(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def shape(value: Any, typ: type, name: str) -> Any:
    require(type(value) is typ, 'SCHEMA', f'{name} must be {typ.__name__}')
    return value


def keys(value: dict, allowed: set, name: str) -> None:
    require(not (set(value) - allowed), 'SCHEMA', f'{name}: unsupported fields {sorted(set(value) - allowed)}')


def unique(values: list, name: str) -> None:
    require(all(nonempty(x) for x in values), 'SCHEMA', f'{name}: non-empty string IDs required')
    require(len(values) == len(set(values)), 'DUPLICATE', f'{name}: duplicate IDs')


def strict_json(text: str) -> Any:
    def pairs(items):
        out = {}
        for k, v in items:
            require(k not in out, 'JSON', f'duplicate JSON key {k}')
            out[k] = v
        return out
    def bad_constant(x):
        raise Invalid('JSON', f'non-finite JSON value {x}')
    try:
        return json.loads(text, object_pairs_hook=pairs, parse_constant=bad_constant)
    except (ValueError, TypeError) as e:
        if isinstance(e, Invalid):
            raise
        raise Invalid('JSON', str(e)) from e


def blob_sha(data: bytes) -> str:
    return hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()


def value_type(value: Any) -> str:
    return {str:'string', list:'array', dict:'object', bool:'boolean', int:'number', float:'number', type(None):'null'}[type(value)]


def pointer_get(obj: Any, pointer: str) -> Any:
    # RFC-style exact pointer: the empty string is root; '/' means empty key.
    require(isinstance(pointer, str), 'SELECTOR', 'JSON pointer must be a string')
    if pointer == '':
        return obj
    require(pointer.startswith('/'), 'SELECTOR', f'invalid pointer {pointer!r}')
    cur = obj
    for raw in pointer[1:].split('/'):
        require(not re.search(r'~(?![01])', raw), 'SELECTOR', 'invalid pointer escape')
        part = raw.replace('~1', '/').replace('~0', '~')
        if isinstance(cur, list):
            require(bool(re.fullmatch(r'0|[1-9][0-9]*', part)), 'SELECTOR', 'invalid array index')
            i = int(part)
            require(i < len(cur), 'SELECTOR', f'array index out of bounds: {pointer}')
            cur = cur[i]
        elif isinstance(cur, dict):
            require(part in cur, 'SELECTOR', f'pointer missing: {pointer}')
            cur = cur[part]
        else:
            raise Invalid('SELECTOR', f'pointer traverses scalar: {pointer}')
    return cur


def dot_get(obj: dict, path: str) -> Any:
    cur = obj
    for part in path.split('.'):
        require(isinstance(cur, dict) and part in cur, 'SELECTOR', f'field missing: {path}')
        cur = cur[part]
    return cur


def markdown_lines(text: str) -> tuple[list[str], list[bool]]:
    """Identify real Markdown headings/markers without matching inside code fences."""
    lines = text.splitlines()
    outside = []
    fence = None
    for line in lines:
        m = re.match(r'^\s{0,3}(`{3,}|~{3,})', line)
        outside.append(fence is None and m is None)
        if m:
            token = m[1]
            if fence is None:
                fence = token
            elif token[0] == fence[0] and len(token) >= len(fence) and not line.strip()[len(token):].strip():
                fence = None
    require(fence is None, 'SELECTOR', 'unclosed Markdown fence')
    return lines, outside


def headings(text: str) -> list[tuple[int, int, str]]:
    lines, outside = markdown_lines(text)
    out = []
    for i, line in enumerate(lines):
        m = re.match(r'^(#{1,6})\s+(.+?)\s*$', line) if outside[i] else None
        if m:
            out.append((i, len(m[1]), re.sub(r'\s+#+$', '', m[2]).strip()))
    return out


def select_text(text: str, selector: dict) -> str:
    st = selector.get('type')
    lines, outside = markdown_lines(text)
    hs = headings(text)
    if st == 'FRONTMATTER_FIELD':
        field = selector.get('value')
        require(nonempty(field) and lines and lines[0] == '---', 'SELECTOR', 'frontmatter missing')
        ends = [i for i, l in enumerate(lines[1:], 1) if l == '---']
        require(ends, 'SELECTOR', 'frontmatter terminator missing')
        stop = ends[0]
        matches = [i for i in range(1, stop) if re.match(rf'^{re.escape(field)}\s*:', lines[i])]
        require(len(matches) == 1, 'SELECTOR', f'frontmatter field ambiguous/missing: {field}')
        start = matches[0]
        end = next((i for i in range(start + 1, stop) if re.match(r'^\S[^:]*:', lines[i])), stop)
        result = '\n'.join(lines[start:end]).strip()
        require(result.split(':', 1)[-1].strip(), 'SELECTOR', f'empty frontmatter field {field}')
        return result
    if st == 'LABELED_BLOCKQUOTE':
        label = selector.get('label')
        require(nonempty(label), 'SELECTOR', 'blockquote label missing')
        pattern = rf'^>\s*(?:\*\*)?{re.escape(label)}(?:\*\*)?\s*[：:](?:\*\*)?\s*(.+)$'
        found = [(i, re.match(pattern, l)) for i, l in enumerate(lines) if outside[i] and re.match(pattern, l)]
        require(len(found) == 1, 'SELECTOR', f'blockquote ambiguous/missing: {label}')
        i, match = found[0]
        result = [match[1]]
        for line in lines[i+1:]:
            if not line.startswith('>') or not line[1:].strip():
                break
            result.append(line[1:].strip())
        return '\n'.join(result).strip()
    if st in {'HEADING_EXACT', 'MARKER_ID'}:
        value = selector.get('value')
        require(nonempty(value), 'SELECTOR', 'heading/marker value missing')
        if st == 'HEADING_EXACT':
            found = [h for h in hs if h[2] == value]
        else:
            marker = rf'''^\s*<!--\s*kianos:[\w-]+\s+id=["']{re.escape(value)}["']\s*-->\s*$'''
            ms = [i for i, l in enumerate(lines) if outside[i] and re.match(marker, l)]
            require(len(ms) == 1, 'SELECTOR', f'marker ambiguous/missing: {value}')
            i = ms[0]
            prior = [h for h in hs if h[0] < i]
            following = [h for h in hs if h[0] > i]
            if prior and not any(l.strip() for l in lines[prior[-1][0]+1:i]):
                found = [prior[-1]]  # Framework marker immediately follows its heading.
            else:
                require(following and not any(l.strip() for l in lines[i+1:following[0][0]]), 'SELECTOR', 'marker must adjoin its owning heading')
                found = [following[0]]
        require(len(found) == 1, 'SELECTOR', f'heading ambiguous/missing: {value}')
        start, level, _ = found[0]
        end = next((i for i, lv, _ in hs if i > start and lv <= level), len(lines))
        require(any(l.strip() and not l.strip().startswith('<!--') for l in lines[start+1:end]), 'SELECTOR', 'empty selected section')
        return '\n'.join(lines[start:end]).strip()
    if st == 'STRUCTURE_AFTER_ANCHOR':
        anchor = selector.get('anchor')
        require(nonempty(anchor), 'SELECTOR', 'anchor missing')
        normalized_anchor = anchor.strip()
        found = [i for i, l in enumerate(lines) if outside[i] and l.strip() == normalized_anchor]
        require(len(found) == 1, 'SELECTOR', 'anchor ambiguous/missing')
        i = found[0] + 1
        occurrence = selector.get('occurrence', 1)
        require(type(occurrence) is int and occurrence == 1, 'SELECTOR', 'v1 uses first adjacent structure only')
        while i < len(lines) and (not lines[i].strip() or lines[i].strip().startswith('<!--')):
            i += 1
        require(i < len(lines), 'SELECTOR', 'no adjacent structure')
        typ = selector.get('structure_type')
        if typ == 'CODE_BLOCK':
            m = re.match(r'^\s{0,3}(`{3,}|~{3,})[^`~]*$', lines[i])
            require(m, 'SELECTOR', 'adjacent code block missing; do not search later sections')
            token = m[1]
            end = next((j for j in range(i+1, len(lines)) if re.fullmatch(r'\s*' + re.escape(token[0]) + '{' + str(len(token)) + r',}\s*', lines[j])), None)
            require(end is not None and any(l.strip() for l in lines[i+1:end]), 'SELECTOR', 'code block empty/unclosed')
            return '\n'.join(lines[i:end+1])
        if typ == 'TABLE':
            require(i+2 < len(lines) and lines[i].lstrip().startswith('|') and re.fullmatch(r'[| :\-]+', lines[i+1].strip()), 'SELECTOR', 'adjacent table header/separator missing')
            end = i+2
            while end < len(lines) and lines[end].lstrip().startswith('|'):
                end += 1
            require(end > i+2, 'SELECTOR', 'table has no rows')
            return '\n'.join(lines[i:end])
        if typ == 'LIST':
            require(re.match(r'^\s*(?:[-*+] |\d+[.)] )', lines[i]), 'SELECTOR', 'adjacent list missing')
            end = next((j for j in range(i+1, len(lines)) if not lines[j].strip() or re.match(r'^#', lines[j])), len(lines))
            return '\n'.join(lines[i:end])
        raise Invalid('SELECTOR', f'unknown structure type {typ!r}')
    raise Invalid('SELECTOR', f'unknown text selector {st!r}')


class Repository:
    def __init__(self, root: Path, overrides: dict[str, bytes | None] | None = None):
        self.root = root.resolve()
        self.overrides = overrides or {}
        self.cache: dict[str, bytes] = {}

    def path(self, rel: str, prefix: str = '') -> Path:
        require(nonempty(rel) and not PurePosixPath(rel).is_absolute() and '..' not in PurePosixPath(rel).parts and '\\' not in rel, 'PATH', f'unsafe path {rel!r}')
        require(not prefix or rel.startswith(prefix), 'PATH', f'out of scope {rel}')
        p = (self.root / rel).resolve()
        require(p.is_relative_to(self.root), 'PATH', f'path escapes root {rel}')
        return p

    def read(self, rel: str) -> bytes:
        p = self.path(rel)
        if rel in self.overrides:
            require(self.overrides[rel] is not None, 'SOURCE', f'missing file {rel}')
            return self.overrides[rel]
        if rel not in self.cache:
            require(p.is_file(), 'SOURCE', f'missing file {rel}')
            self.cache[rel] = p.read_bytes()
        return self.cache[rel]

    def text(self, rel: str) -> str:
        try:
            return self.read(rel).decode('utf-8')
        except UnicodeError as e:
            raise Invalid('SOURCE', f'invalid UTF-8: {rel}') from e

    def json(self, rel: str) -> Any:
        return strict_json(self.text(rel))

    def glob(self, directory: str, pattern: str) -> list[str]:
        names = {p.relative_to(self.root).as_posix() for p in self.path(directory).glob(pattern) if p.is_file()}
        for rel, value in self.overrides.items():
            p = PurePosixPath(rel)
            if str(p.parent) == directory.rstrip('/') and p.match(pattern):
                if value is None:
                    names.discard(rel)
                else:
                    names.add(rel)
        return sorted(names)


class Validator:
    def __init__(self, root: Path = ROOT, overrides: dict[str, bytes | None] | None = None):
        self.repo = Repository(root, overrides)
        self.systems: dict[str, dict] = {}
        self.blocks: dict[str, dict] = {}
        self.issues: list[dict] = []
        self.results: dict[str, dict] = {}
        self.binding_count = 0
        self.revalidated: set[str] = set()

    def issue(self, asset: str, e: Invalid) -> None:
        self.issues.append({'asset': asset, 'code': e.code, 'message': str(e)})

    def build_owners(self, manifest: dict) -> None:
        km = self.repo.json(KNOWLEDGE + 'manifest.json')
        require(km.get('status') == 'CURRENT' and km.get('owner_resolution', {}).get('system_level', {}).get('parallel_owner_forbidden') is True, 'OWNER', 'Current knowledge owner manifest required')
        for sid, spec in shape(manifest.get('systems'), dict, 'systems').items():
            sp = PREFIX + spec['system_projection']
            self.repo.path(sp, PREFIX)
            a = self.repo.json(sp)
            sources = [s for s in a.get('sources', []) if s.get('kind') == 'SYSTEM_CORE']
            require(len(sources) == 1, 'OWNER', f'{sid}: exactly one canonical System source required')
            source = sources[0]['path']
            self.repo.path(source, KNOWLEDGE + 'systems/')
            require(PurePosixPath(source).name == 'system.json', 'OWNER', 'System owner must be system.json')
            s = self.repo.json(source)
            identity = s.get('identity', {})
            require((s.get('system_id') or identity.get('system_id')) == sid, 'OWNER', f'System identity mismatch {sid}')
            cid = s.get('canonical_id') or identity.get('canonical_id')
            require(spec.get('canonical_id') == cid, 'OWNER', f'canonical ID mismatch {sid}')
            require(str(s.get('semantic_authority', '')).startswith('CHAT_APPROVED'), 'OWNER', f'unapproved System authority {sid}')
            self.systems[sid] = {'path': source, 'value': s, 'canonical_id': cid}
            route = shape(s.get('block_route'), list, f'{sid}.block_route')
            require(all(isinstance(x, dict) and 'blocks' not in x for x in route), 'OWNER', 'nested route requires explicit adapter, not flattening')
            unique([x.get('id') for x in route], f'{sid}.route')
            directory = str(PurePosixPath(source).parent / 'blocks')
            paths = self.repo.glob(directory, '*.md')
            for row in route:
                bid = row['id']
                ordinal = re.search(r'-(?:r|b)(\d+)$', bid)
                require(ordinal, 'OWNER', f'unsupported stable Block identity {bid}')
                n = int(ordinal[1])
                # Exact same Current ordinal join as static-web/src/lib/xizong.mjs.
                matches = [p for p in paths if (m := re.search(r'(?:^|_)Block(\d+)_', PurePosixPath(p).name, re.I)) and int(m[1]) == n]
                require(len(matches) == 1, 'OWNER', f'{bid}: canonical file missing/ambiguous')
                path = matches[0]
                text = self.repo.text(path)
                front = text.split('\n---', 1)[0] if text.startswith('---\n') else ''
                fm = re.search(r'^block_id:\s*(\S+)\s*$', front, re.M)
                require(not fm or fm[1] == bid, 'OWNER', f'frontmatter Block ID mismatch {path}')
                kps = []
                for _, level, title in headings(text):
                    m = re.match(r'^KP(\d+)[｜|]\s*(.+)$', title) if 2 <= level <= 4 else None
                    if m:
                        kps.append(int(m[1]))
                require(type(row.get('kp')) is int and row['kp'] > 0 and len(kps) == row['kp'] and set(kps) == set(range(1, row['kp']+1)), 'OWNER', f'{bid}: KP identity/count/gap mismatch')
                groups = shape(s.get('logic_index', {}).get(bid), list, f'{bid}.logic_index')
                unique([g.get('id') for g in groups], bid + '.groups')
                coverage = []
                for g in groups:
                    require(nonempty(g.get('label')), 'OWNER', f'{bid}: missing group label')
                    ran = g.get('kp')
                    require(isinstance(ran, list) and len(ran) == 2 and all(type(x) is int for x in ran) and 1 <= ran[0] <= ran[1] <= row['kp'], 'OWNER', f'{bid}: bad Logic Group range')
                    coverage.extend(range(ran[0], ran[1]+1))
                require(Counter(coverage) == Counter(kps), 'OWNER', f'{bid}: Logic Group overlap/gap')
                require(bid not in self.blocks, 'OWNER', f'duplicate canonical Block {bid}')
                self.blocks[bid] = {'system_id': sid, 'path': path, 'text': text, 'row': row, 'groups': groups, 'kp_ids': [f'{bid}-kp{x:02}' for x in kps]}

    def owner_ref(self, asset: dict, binding: dict) -> Any:
        typ = binding.get('owner_type')
        if typ == 'SYSTEM':
            require(binding.get('id') == asset['system_id'], 'OWNER', 'wrong System owner')
            return self.systems[asset['system_id']]['value']
        bid = binding.get('block_id') if typ in {'KP_SET', 'KP', 'LOGIC_GROUP'} else binding.get('id')
        require(bid == asset.get('block_id') and bid in self.blocks, 'OWNER', f'wrong/missing local Block owner {bid}')
        block = self.blocks[bid]
        require(block['system_id'] == asset['system_id'], 'OWNER', 'cross-System owner mismatch')
        if typ == 'BLOCK':
            role = binding.get('role')
            if role == 'CENTER_QUESTION':
                return select_text(block['text'], {'type': 'LABELED_BLOCKQUOTE', 'label': '中心问题'})
            if role == 'CANONICAL_GUIDE':
                return block['text']
            require(role is None, 'OWNER', f'unknown owner role {role}')
            return {'id': bid, 'path': block['path']}
        if typ == 'KP_SET':
            return block['kp_ids']
        if typ == 'KP':
            require(binding.get('id') in block['kp_ids'], 'OWNER', 'KP not in canonical owner')
            return binding['id']
        if typ == 'LOGIC_GROUP':
            result = [g for g in block['groups'] if g['id'] == binding.get('id')]
            require(len(result) == 1, 'OWNER', 'Logic Group not in canonical owner')
            return result[0]
        raise Invalid('OWNER', f'unknown owner_type {typ}')

    def source_registry(self, asset: dict) -> dict:
        entries = shape(asset.get('sources'), list, 'sources')
        require(entries and all(isinstance(x, dict) for x in entries), 'SCHEMA', 'sources require objects')
        unique([s.get('id') for s in entries], 'sources')
        out = {}
        for s in entries:
            keys(s, SOURCE_KEYS, 'source')
            kind, path = s.get('kind'), s.get('path')
            require(kind in KINDS, 'SCHEMA', f'unknown source kind {kind}')
            self.repo.path(path, KNOWLEDGE)
            expected = s.get('baseline_blob_sha') or s.get('blob_sha')
            require(isinstance(expected, str) and re.fullmatch('[0-9a-f]{40}', expected), 'FRESHNESS', f'missing/invalid source hash {path}')
            require(not (s.get('blob_sha') and s.get('baseline_blob_sha')) or s['blob_sha'] == s['baseline_blob_sha'], 'FRESHNESS', 'conflicting hash declarations')
            mode = s.get('freshness', DEFAULT_FRESHNESS[kind])
            require(mode in {'STRICT_BLOB', 'RESOLVE_BINDING'}, 'FRESHNESS', f'unknown freshness mode {mode}')
            require(kind != 'EXTERNAL_SOURCE_CONTRACT' or mode == 'STRICT_BLOB', 'FRESHNESS', 'external admission may not bypass strict hash')
            if kind == 'SYSTEM_CORE':
                require(path == self.systems[asset['system_id']]['path'], 'OWNER', 'wrong System source')
            if kind == 'MEDICAL_CORE':
                require(asset.get('block_id') in self.blocks and path == self.blocks[asset['block_id']]['path'], 'OWNER', 'wrong canonical medical source')
            actual = blob_sha(self.repo.read(path))
            require(mode != 'STRICT_BLOB' or actual == expected, 'STALE', f'strict source changed: {path}')
            if actual != expected:
                self.revalidated.add(path)
            if kind in {'LEARNING_SUPPORT', 'SELECTIVE_CUES', 'PATHWAYS', 'EXTERNAL_SOURCE_CONTRACT'}:
                value = self.repo.json(path)
                require(value.get('system_id') == asset['system_id'], 'OWNER', f'source System mismatch {path}')
                if kind == 'EXTERNAL_SOURCE_CONTRACT':
                    require(value.get('status') == 'ADMITTED_NARROW_SCOPE' and value.get('block_id') == asset.get('block_id'), 'PROVENANCE', 'external admission scope mismatch')
            out[s['id']] = s
        return out

    def resolve(self, asset: dict, binding: dict, sources: dict | None = None) -> Any:
        shape(binding, dict, 'binding')
        keys(binding, BINDING_KEYS, 'binding')
        sources = sources if sources is not None else self.source_registry(asset)
        kind = binding.get('kind')
        if kind == 'OWNER_REF':
            result = self.owner_ref(asset, binding)
        else:
            sid = binding.get('source_id')
            require(sid in sources, 'SOURCE', f'unknown source ID {sid}')
            source = sources[sid]
            path = source['path']
            obj = self.repo.json(path) if path.endswith('.json') else None
            if kind in {'FIELD_REF', 'DERIVED_FRAGMENT', 'EXTERNAL_CONTRACT_REF'}:
                selector = shape(binding.get('selector'), dict, 'selector')
                keys(selector, {'type', 'value', 'label', 'anchor', 'structure_type', 'occurrence'}, 'selector')
                if kind == 'DERIVED_FRAGMENT':
                    require(source['kind'] == 'MEDICAL_CORE' and source.get('freshness', DEFAULT_FRESHNESS[source['kind']]) == 'STRICT_BLOB', 'FRESHNESS', 'derived fragments require strict canonical Core')
                if kind == 'EXTERNAL_CONTRACT_REF':
                    require(source['kind'] == 'EXTERNAL_SOURCE_CONTRACT' and binding.get('scope_policy') == 'DO_NOT_WIDEN_ADMITTED_SCOPE' and str(binding.get('learner_content_policy', '')).startswith('PROVENANCE_ONLY_'), 'PROVENANCE', 'external contract is provenance only')
                else:
                    require(source['kind'] != 'EXTERNAL_SOURCE_CONTRACT', 'PROVENANCE', 'external contract cannot become learner content')
                if selector.get('type') == 'JSON_POINTER':
                    require(obj is not None, 'SELECTOR', 'JSON_POINTER requires JSON')
                    ptr = selector.get('value')
                    if asset.get('block_id') and isinstance(ptr, str) and ptr.startswith(('/blocks/', '/logic_index/')):
                        parts = ptr.split('/')
                        require(len(parts) > 2 and parts[2] == asset['block_id'], 'OWNER', 'structured binding points at another Block')
                    result = pointer_get(obj, ptr)
                else:
                    result = select_text(self.repo.text(path), selector)
            elif kind in {'INDEX_REF', 'INDEX_MATCH'}:
                require(isinstance(obj, dict), 'SELECTOR', 'index requires JSON object')
                index = binding.get('index')
                allowed = {'SELECTIVE_CUES': {'visual_bindings', 'precision_index'}, 'PATHWAYS': {'connections', 'system_failure_views'}}
                require(index in allowed.get(source['kind'], set()), 'SELECTOR', f'unknown index {index}')
                arr = shape(obj.get(index), list, 'index')
                require(all(isinstance(x, dict) for x in arr), 'SCHEMA', 'index items require objects')
                # Some System failure views use failure_id rather than id.
                if index != 'system_failure_views':
                    unique([x.get('id') for x in arr], 'index items')
                if kind == 'INDEX_REF':
                    result = [x for x in arr if x.get('id') == binding.get('item_id')]
                    require(len(result) == 1, 'SELECTOR', 'index item missing/ambiguous')
                else:
                    where = shape(binding.get('where'), dict, 'where')
                    accepted = {'anchor.block_id'} if index in {'visual_bindings', 'precision_index'} else {'source.block_id', 'target.block_id'}
                    require(len(where) == 1 and set(where) <= accepted, 'SELECTOR', 'unsupported/empty filter; no fuzzy widening')
                    require(next(iter(where.values())) == asset.get('block_id'), 'OWNER', 'filter must select the owning Block')
                    result = []
                    for item in arr:
                        try:
                            match = all(dot_get(item, field) == wanted for field, wanted in where.items())
                        except Invalid:
                            match = False
                        if match:
                            result.append(item)
                for item in result:
                    self.check_index_owner(asset, binding, index, item)
                require(binding.get('timing_semantics') in {'PRESERVE_SOURCE_POLICY', 'SOURCE_CUE_NOW_TARGET_REACTIVATION_LATER', 'TARGET_REACTIVATION'}, 'TIMING', 'index timing must preserve Current policy')
            else:
                raise Invalid('SCHEMA', f'unknown binding kind {kind}')
        if kind == 'FIELD_REF':
            require(binding.get('value_type') in {'string', 'object', 'array', 'number', 'boolean'}, 'TYPE', 'FIELD_REF requires explicit value_type')
        if 'value_type' in binding:
            require(binding['value_type'] == value_type(result), 'TYPE', f'binding type changed: expected {binding["value_type"]}, got {value_type(result)}')
        require(result is not None and result != '', 'SELECTOR', 'empty/null required binding')
        self.binding_count += 1
        return result

    def check_index_owner(self, asset: dict, binding: dict, index: str, item: dict) -> None:
        bid = asset.get('block_id')
        anchors = [item.get('anchor', {})] if index != 'connections' else [item.get('source', {}), item.get('target', {})]
        local = [x for x in anchors if x.get('block_id') == bid]
        require(local, 'OWNER', f'index item {item.get("id")} not owned by {bid}')
        for anchor in anchors:
            self.check_anchor(anchor)
        declared = binding.get('anchor', {})
        require(isinstance(declared, dict) and set(declared) <= {'block_id', 'logic_group_id', 'kp_id'}, 'SCHEMA', 'invalid declared anchor')
        require(any(all(a.get(k) == v for k, v in declared.items()) for a in local), 'OWNER', 'declared anchor contradicts Current item')

    def check_anchor(self, anchor: dict) -> None:
        bid = anchor.get('block_id')
        require(bid in self.blocks, 'OWNER', f'unknown index endpoint {bid}')
        block = self.blocks[bid]
        if 'logic_group_id' in anchor:
            require(anchor['logic_group_id'] in {g['id'] for g in block['groups']}, 'OWNER', 'unknown Logic Group endpoint')
        if 'kp_id' in anchor:
            require(anchor['kp_id'] in block['kp_ids'], 'OWNER', 'unknown KP endpoint')

    def safe_object(self, asset: dict, obj: dict, view_name: str, view: dict) -> bool:
        if obj.get('answer_bearing') is not False:
            return False
        b = obj['binding']; selector = b.get('selector', {})
        if view_name == 'SYSTEM_RECALL_FRONT':
            return b.get('kind') == 'FIELD_REF' and selector == {'type': 'JSON_POINTER', 'value': '/system_recall/neutral_front'}
        if view_name == 'BLOCK_RECALL_FRONT':
            if obj['role'] == 'PROBLEM':
                return (b.get('kind') == 'OWNER_REF' and b.get('role') == 'CENTER_QUESTION') or (b.get('kind') == 'DERIVED_FRAGMENT' and selector == {'type': 'LABELED_BLOCKQUOTE', 'label': '中心问题'})
            return (obj['role'] == 'MAP' and b.get('kind') == 'FIELD_REF' and selector == {'type': 'JSON_POINTER', 'value': '/logic_index/' + asset['block_id']} and view.get('logic_map_policy') == 'LABELS_AND_IDS_ONLY')
        return False  # KP front uses its own approved neutral prompt, no Block objects.

    def check_views(self, asset: dict, sources: dict, resolved: dict) -> None:
        views = shape(asset.get('views'), dict, 'views')
        required = BLOCK_VIEWS if 'block_id' in asset else SYSTEM_VIEWS
        require(required <= set(views), 'VISIBILITY', f'missing required views: {sorted(required - set(views))}')
        objects = {o['object_id']: o for o in asset['objects']}
        support = asset.get('learning_support', {})
        handoffs = {b['binding_id'] for b in asset.get('handoff_bindings', [])}
        for name, view in views.items():
            shape(view, dict, 'view'); keys(view, VIEW_KEYS, 'view')
            for prop, legal in [('object_ids', set(objects)), ('block_object_ids', set(objects)), ('learning_support_keys', set(support)), ('handoff_binding_ids', handoffs)]:
                values = shape(view.get(prop, []), list, prop)
                require(all(isinstance(x, str) for x in values), 'SCHEMA', f'{prop} requires strings')
                require(len(values) == len(set(values)) and set(values) <= legal, 'VISIBILITY', f'{name}: bad/duplicate {prop}')
            if name not in FRONTS and view.get('protection') != 'NEUTRAL_FRONT':
                continue
            require(view.get('protection') == 'NEUTRAL_FRONT', 'VISIBILITY', f'{name}: protected state flag missing')
            require(not view.get('learning_support_keys') and not view.get('handoff_binding_ids'), 'VISIBILITY', f'{name}: answer-bearing support/handoff on front')
            require(view.get('kp_content_policy') in {None, 'ID_AND_NEUTRAL_PROMPT_ONLY'}, 'VISIBILITY', 'canonical KP answer exposed before Reveal')
            require(view.get('context_policy') in {None, 'LG_IDS_AND_STATE_ONLY'}, 'VISIBILITY', 'unsafe front context policy')
            require(view.get('enrichment_policy') in {None, 'NO_ANSWER_LEAK'}, 'VISIBILITY', 'unsafe enrichment on front')
            require(not asset.get('enrichment_bindings') or view.get('enrichment_policy') == 'NO_ANSWER_LEAK', 'VISIBILITY', 'explicit enrichment deny policy required')
            require(view.get('provenance_policy') in {None, 'HIDDEN'}, 'VISIBILITY', 'front provenance must stay hidden')
            if name == 'KP_RECALL_FRONT':
                require(view.get('kp_content_policy') == 'ID_AND_NEUTRAL_PROMPT_ONLY', 'VISIBILITY', 'explicit neutral KP policy required')
            if name in {'BLOCK_RECALL_FRONT', 'SYSTEM_RECALL_FRONT'}:
                require(view.get('object_ids'), 'VISIBILITY', 'Recall front must retain its prompt')
            require(not view.get('source_locator_policy') and not view.get('external_contract_policy'), 'VISIBILITY', 'front cannot expose source answer context')
            require(not view.get('show_logic_group_map') or (name == 'BLOCK_RECALL_FRONT' and view.get('logic_map_policy') == 'LABELS_AND_IDS_ONLY'), 'VISIBILITY', 'front route requires limited labels policy')
            for oid in view.get('object_ids', []) + view.get('block_object_ids', []):
                require(self.safe_object(asset, objects[oid], name, view), 'VISIBILITY', f'{name}: unsafe binding {oid}; a safe flag alone is not proof')

    def neutral_payload(self, asset: dict, name: str) -> dict:
        """Testable declarative projection only; production DOM must be tested separately."""
        sources = self.source_registry(asset)
        self.check_views(asset, sources, {})
        view = asset['views'][name]
        require(name in FRONTS, 'VISIBILITY', 'neutral payload requested for a non-front')
        out = {}
        for obj in asset['objects']:
            if obj['object_id'] not in view.get('object_ids', []) + view.get('block_object_ids', []):
                continue
            value = self.resolve(asset, obj['binding'], sources)
            if obj['role'] == 'MAP':
                value = [{'id': g['id'], 'label': g['label']} for g in value]
            out[obj['object_id']] = value
        if view.get('show_logic_group_map'):
            out['logic_groups'] = [{'id': g['id'], 'label': g['label']} for g in self.blocks[asset['block_id']]['groups']]
        return out

    def asset(self, asset: dict, rel: str, expected_sid: str, is_system: bool) -> None:
        shape(asset, dict, 'asset')
        keys(asset, set('block_id calibration_notes canonical_id canonical_scope enrichment_bindings handoff_bindings kp_set learning_support objects projection_level provenance_bindings schema sources status system_id views'.split()), 'asset')
        require(asset.get('schema') in SCHEMAS, 'SCHEMA', 'unsupported exact Projection schema')
        require(asset['schema'].endswith('.system.v1') == is_system, 'SCHEMA', 'manifest slot/schema mismatch')
        require(asset.get('system_id') == expected_sid, 'OWNER', 'manifest slot/System mismatch')
        require(asset.get('status') in {'CALIBRATION_DERIVED_CURRENT', 'COMPILED_DERIVED_CURRENT'}, 'SCHEMA', 'asset is not a compiled Current candidate')
        bid = asset.get('block_id')
        if is_system:
            require(bid is None and asset.get('canonical_id') == self.systems[expected_sid]['canonical_id'], 'OWNER', 'System identity mismatch')
        else:
            require(bid in self.blocks and self.blocks[bid]['system_id'] == expected_sid, 'OWNER', 'Block identity mismatch')
            require(asset.get('canonical_scope') == {'kind':'OWNER_REF', 'owner_type':'BLOCK', 'id':bid}, 'OWNER', 'canonical_scope must resolve owning Block')
            self.owner_ref(asset, asset['canonical_scope'])
            if 'kp_set' in asset:
                self.owner_ref(asset, asset['kp_set'])
        sources = self.source_registry(asset)
        objects = shape(asset.get('objects'), list, 'objects')
        require(objects and all(isinstance(o, dict) for o in objects), 'SCHEMA', 'nonempty objects required')
        unique([o.get('object_id') for o in objects], 'objects')
        resolved = {}
        for obj in objects:
            keys(obj, OBJECT_KEYS, 'object')
            require(obj.get('role') in ROLES and obj.get('geometry') in GEOMETRIES, 'SCHEMA', 'unknown role/geometry')
            require(obj.get('stage_role') in {None, 'PRIMARY_STAGE', 'SECONDARY_STAGE', 'CONTEXT'}, 'SCHEMA', 'unknown stage role')
            require(type(obj.get('answer_bearing')) is bool, 'VISIBILITY', 'explicit answer_bearing boolean required')
            require(obj.get('binding', {}).get('kind') != 'EXTERNAL_CONTRACT_REF', 'PROVENANCE', 'external admission may not be a learner object')
            resolved[obj['object_id']] = self.resolve(asset, obj.get('binding'), sources)
        support = shape(asset.get('learning_support', {}), dict, 'learning_support')
        if not is_system:
            require(set(support) == {'first_pass_focus','stop_line','recall_spine','logic_groups'}, 'SCHEMA', 'incomplete/unknown learning support')
        for key, binding in support.items():
            require(binding.get('kind') == 'FIELD_REF' and binding.get('selector') == {'type':'JSON_POINTER','value':f'/blocks/{bid}/{key}'} and sources.get(binding.get('source_id'), {}).get('kind') == 'LEARNING_SUPPORT', 'OWNER', 'learning support must select its own canonical Block')
            value = self.resolve(asset, binding, sources)
            if key != 'logic_groups':
                require(nonempty(value), 'TYPE', f'{key} must be a nonempty string')
            else:
                groups = self.blocks[bid]['groups']
                require(isinstance(value, dict) and set(value) == {g['id'] for g in groups}, 'OWNER', 'Logic Group support identity mismatch')
                for g in groups:
                    v = value[g['id']]
                    require(isinstance(v, dict) and nonempty(v.get('goal')) and nonempty(v.get('closure')), 'TYPE', 'goal/closure must be text')
                    require('kp' not in v or v['kp'] == g['kp'], 'OWNER', 'Logic Group range contradicts Current System')
        for key in ['enrichment_bindings','handoff_bindings','provenance_bindings']:
            bindings = shape(asset.get(key, []), list, key)
            unique([b.get('binding_id') for b in bindings], key)
            for b in bindings:
                if key == 'enrichment_bindings':
                    require(b.get('kind') in {'INDEX_REF','INDEX_MATCH'}, 'SCHEMA', 'enrichment requires reviewed index')
                if key == 'provenance_bindings':
                    require(b.get('kind') == 'EXTERNAL_CONTRACT_REF', 'PROVENANCE', 'provenance requires admitted contract')
                self.resolve(asset, b, sources)
        self.check_views(asset, sources, resolved)

    def run(self) -> dict:
        try:
            m = shape(self.repo.json(MANIFEST), dict, 'manifest')
            require(m.get('schema') == 'kianos.xizong.cognitive_projection.manifest.v1' and m.get('runtime_authority') is False, 'SCHEMA', 'manifest is not a non-runtime v1 owner')
            require(m.get('projection_root') == PREFIX.rstrip('/') and m.get('contract') == PREFIX+'PROJECTION_CONTRACT.md', 'PATH', 'wrong Projection root/contract')
            self.build_owners(m)
        except Invalid as e:
            self.issue(MANIFEST, e)
            return self.report()
        except (KeyError, TypeError, AttributeError) as e:
            self.issue(MANIFEST, Invalid('SCHEMA', str(e)))
            return self.report()
        listed = []
        seen_blocks = []
        for sid, spec in m['systems'].items():
            expected_bids = {bid for bid, b in self.blocks.items() if b['system_id'] == sid}
            block_paths = spec.get('blocks', [])
            if not isinstance(block_paths, list) or spec.get('block_count') != len(expected_bids) or len(block_paths) != len(expected_bids):
                self.issue(MANIFEST, Invalid('COVERAGE', f'{sid}: counts do not match Current Block owners'))
                continue
            for short, is_system in [(spec['system_projection'], True)] + [(x, False) for x in block_paths]:
                rel = PREFIX + short
                before = len(self.issues)
                listed.append(rel)
                try:
                    self.repo.path(rel, PREFIX)
                    a = self.repo.json(rel)
                    self.asset(a, rel, sid, is_system)
                    if not is_system:
                        seen_blocks.append(a['block_id'])
                    self.results[rel] = {'status':'PASS', 'system_id':sid, 'block_id':a.get('block_id')}
                except Invalid as e:
                    self.issue(rel, e)
                except (KeyError, TypeError, AttributeError, IndexError) as e:
                    self.issue(rel, Invalid('SCHEMA', f'malformed asset: {e}'))
                if len(self.issues) != before:
                    self.results[rel] = {'status':'FAIL', 'system_id':sid}
        if len(listed) != len(set(listed)):
            self.issue(MANIFEST, Invalid('COVERAGE', 'duplicate asset paths'))
        # Report per-asset failures separately; avoid cascading coverage errors merely
        # because an invalid asset could not complete its owner check.
        if all(x['status'] == 'PASS' for x in self.results.values()) and Counter(seen_blocks) != Counter(self.blocks.keys()):
            self.issue(MANIFEST, Invalid('COVERAGE', 'duplicate or missing canonical Block in manifest slots'))
        physical = {p.relative_to(self.repo.root).as_posix() for p in (self.repo.root/PREFIX).rglob('*.projection.json')}
        physical |= {p for p, b in self.repo.overrides.items() if p.startswith(PREFIX) and p.endswith('.projection.json') and b is not None}
        physical -= {p for p, b in self.repo.overrides.items() if b is None}
        if physical != set(listed):
            self.issue(MANIFEST, Invalid('COVERAGE', 'unlisted or missing Projection files'))
        cov = m.get('coverage', {})
        expected = {s['canonical_id']: len([b for b in self.blocks.values() if b['system_id'] == sid]) for sid, s in self.systems.items()}
        if cov.get('systems') != len(self.systems) or cov.get('blocks') != len(self.blocks) or cov.get('total_projection_assets') != len(listed) or cov.get('expected') != expected:
            self.issue(MANIFEST, Invalid('COVERAGE', 'coverage metadata mismatch with Current owners'))
        return self.report()

    def report(self) -> dict:
        return {'validator_version':VERSION, 'status':'FAIL' if self.issues else 'PASS',
                'scope':'ASSET_BINDINGS_AND_DECLARATIVE_VISIBILITY_ONLY',
                'systems':len(self.systems), 'blocks':len(self.blocks), 'assets':len(self.results),
                'canonical_kps':sum(len(b['kp_ids']) for b in self.blocks.values()),
                'resolved_binding_count':self.binding_count, 'revalidated_sources':sorted(self.revalidated),
                'results':self.results, 'issues':self.issues,
                'not_claimed':['medical_semantic_acceptance','browser_answer_leak_safety','Mac_visual_acceptance','runtime_adoption','learner_progress','S_K_L_P_R_E_U_promotion']}


def validate_repository(root: Path = ROOT, overrides: dict[str, bytes | None] | None = None) -> dict:
    return Validator(root, overrides).run()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT)
    parser.add_argument('--self-test', action='store_true', help='Run independent mutation/control cases against the real validator')
    parser.add_argument('--json', type=Path, help='Write reproducible validation report')
    args = parser.parse_args()
    report = validate_repository(args.root)
    if args.self_test:
        from test_projection import run_suite
        report['mutation_tests'] = run_suite(args.root)
        if report['mutation_tests']['failed']:
            report['status'] = 'FAIL'
    if args.json:
        args.json.parent.mkdir(parents=True, exist_ok=True)
        args.json.write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    for issue in report['issues']:
        print(f"FAIL [{issue['code']}] {issue['asset']}: {issue['message']}")
    print(f"XIZONG_PROJECTION_VALIDATION: {report['status']}")
    print(f"coverage: {report['systems']} systems / {report['blocks']} blocks / {report['assets']} assets / {report['canonical_kps']} KP identities")
    if args.self_test:
        t = report['mutation_tests']
        print(f"mutation/control tests: {t['passed']}/{t['total']} passed; failed={t['failed']}")
    print('boundary: asset validation only; no browser/runtime/medical/learner acceptance claim')
    return 0 if report['status'] == 'PASS' else 1


if __name__ == '__main__':
    sys.exit(main())
