const SAFE_BLOCKED_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

function present(value) {
  return value != null && value !== '' && (!Array.isArray(value) || value.length > 0);
}

function walk(root, field) {
  let value = root;
  for (const part of String(field || '').split('.')) {
    if (!part || SAFE_BLOCKED_KEYS.has(part)) throw new Error(`POLITICS_SURFACE_UNSAFE_PATH:${field}`);
    value = value && typeof value === 'object' ? value[part] : null;
  }
  return value;
}

export function resolvePoliticsSurfaceRef(ref, chapter, unit) {
  if (!ref || !['unit', 'chapter'].includes(ref.scope) || typeof ref.field !== 'string') {
    throw new Error('POLITICS_SURFACE_INVALID_REF');
  }
  let value = walk(ref.scope === 'chapter' ? chapter : unit, ref.field);

  if (ref.match) {
    if (!Array.isArray(value)) throw new Error(`POLITICS_SURFACE_MATCH_EXPECTS_ARRAY:${ref.field}`);
    const matches = value.filter((item) => Object.entries(ref.match).every(([key, expected]) => item?.[key] === expected));
    if (matches.length !== 1) throw new Error(`POLITICS_SURFACE_MATCH_NOT_EXACT:${unit?.natural_unit_id || '<chapter>'}:${ref.field}`);
    value = matches[0];
  }

  if (ref.ids) {
    if (!Array.isArray(value)) throw new Error(`POLITICS_SURFACE_IDS_EXPECT_ARRAY:${ref.field}`);
    value = ref.ids.map((id) => {
      const matches = value.filter((item) => item?.id === id);
      if (matches.length !== 1) throw new Error(`POLITICS_SURFACE_ID_NOT_EXACT:${id}`);
      return matches[0];
    });
  }

  return present(value) ? value : null;
}

function projectFields(value, fields, id) {
  if (value == null) return null;
  if (typeof value !== 'object' || Array.isArray(value)) {
    return { id, text: String(value) };
  }
  if (!Array.isArray(fields) || fields.length === 0) {
    throw new Error(`POLITICS_SURFACE_OBJECT_FIELDS_REQUIRED:${id}`);
  }
  const out = { id };
  for (const field of fields) {
    if (present(value[field])) out[field] = value[field];
  }
  if (Object.keys(out).length === 1) throw new Error(`POLITICS_SURFACE_SELECTED_FIELDS_EMPTY:${id}`);
  return out;
}

function oneObject(value, code) {
  if (Array.isArray(value)) {
    if (value.length !== 1 || !value[0] || typeof value[0] !== 'object' || Array.isArray(value[0])) {
      throw new Error(`${code}:EXPECTED_ONE_OBJECT`);
    }
    return value[0];
  }
  if (!value || typeof value !== 'object') throw new Error(`${code}:EXPECTED_OBJECT`);
  return value;
}

function selectNodes(value, group) {
  const owner = oneObject(value, `POLITICS_SURFACE_NODES:${group.id}`);
  const nodes = Array.isArray(owner.nodes) ? owner.nodes : [];
  return group.select_node_ids.map((id) => {
    const matches = nodes.filter((node) => node?.id === id);
    if (matches.length !== 1) throw new Error(`POLITICS_SURFACE_NODE_NOT_EXACT:${group.id}:${id}`);
    return projectFields(matches[0], group.item_fields, id);
  });
}

function selectSteps(value, group) {
  const owner = oneObject(value, `POLITICS_SURFACE_STEPS:${group.id}`);
  const steps = Array.isArray(owner.steps) ? owner.steps : [];
  return group.select_step_ids.map((id) => {
    const matches = steps.filter((step) => step?.id === id);
    if (matches.length !== 1) throw new Error(`POLITICS_SURFACE_STEP_NOT_EXACT:${group.id}:${id}`);
    return projectFields(matches[0], group.item_fields, id);
  });
}

function selectEdges(value, group) {
  const owner = oneObject(value, `POLITICS_SURFACE_EDGES:${group.id}`);
  const edges = Array.isArray(owner.edges) ? owner.edges : [];
  const labels = new Map((Array.isArray(owner.nodes) ? owner.nodes : []).map((node) => [node?.id, node?.label || node?.id]));
  return group.select_edge_pairs.map(({ from, to }) => {
    const matches = edges.filter((edge) => edge?.from === from && edge?.to === to);
    if (matches.length !== 1) throw new Error(`POLITICS_SURFACE_EDGE_NOT_EXACT:${group.id}:${from}->${to}`);
    const edge = {
      ...matches[0],
      from_label: labels.get(from) || from,
      to_label: labels.get(to) || to
    };
    return projectFields(edge, group.item_fields, `${from}->${to}`);
  });
}

function selectLevels(value, group) {
  const rows = Array.isArray(value) ? value : [value];
  return group.levels.map((level) => {
    const text = rows[level.item_index];
    if (!present(text)) throw new Error(`POLITICS_SURFACE_LEVEL_ITEM_MISSING:${group.id}:${level.id}`);
    return { id: level.id, label: level.label || '', text: typeof text === 'string' ? text : String(text) };
  });
}

function selectItemIndices(value, group) {
  const owner = oneObject(value, `POLITICS_SURFACE_ITEMS:${group.id}`);
  const rows = Array.isArray(owner.items) ? owner.items : [];
  return group.select_item_indices.map((index, position) => {
    const item = rows[index];
    if (!present(item)) throw new Error(`POLITICS_SURFACE_ITEM_INDEX_MISSING:${group.id}:${index}`);
    const id = Array.isArray(group.item_ids) && group.item_ids[position]
      ? group.item_ids[position]
      : `${group.id}-${index + 1}`;
    return projectFields(item, group.item_fields, id);
  });
}

function normalize(value, group, prefix = group.id) {
  if (Array.isArray(group.select_node_ids)) return selectNodes(value, group);
  if (Array.isArray(group.select_step_ids)) return selectSteps(value, group);
  if (Array.isArray(group.select_edge_pairs)) return selectEdges(value, group);
  if (Array.isArray(group.select_item_indices)) return selectItemIndices(value, group);
  if (Array.isArray(group.levels)) return selectLevels(value, group);

  const values = Array.isArray(value) ? value : [value];
  return values.filter(present).map((item, index) => projectFields(item, group.item_fields, values.length === 1 ? prefix : `${prefix}-${index + 1}`));
}

function resolveGroup(group, chapter, unit) {
  if (!group?.id || !group?.zone || !group?.primitive) throw new Error('POLITICS_SURFACE_GROUP_IDENTITY_MISSING');

  let items = [];
  if (group.source) {
    const value = resolvePoliticsSurfaceRef(group.source, chapter, unit);
    if (!present(value)) throw new Error(`POLITICS_SURFACE_SOURCE_EMPTY:${group.id}`);
    items = normalize(value, group);
  } else if (Array.isArray(group.sources) && group.sources.length > 0) {
    for (const source of group.sources) {
      if (!source?.id || !source?.ref) throw new Error(`POLITICS_SURFACE_NAMED_SOURCE_INVALID:${group.id}`);
      const value = resolvePoliticsSurfaceRef(source.ref, chapter, unit);
      if (!present(value)) throw new Error(`POLITICS_SURFACE_NAMED_SOURCE_EMPTY:${group.id}:${source.id}`);
      const local = normalize(value, { ...group, id: source.id, source: undefined, sources: undefined, levels: undefined, select_node_ids: undefined, select_step_ids: undefined, select_edge_pairs: undefined, select_item_indices: undefined, item_ids: undefined }, source.id);
      items.push(...local);
    }
  } else {
    throw new Error(`POLITICS_SURFACE_GROUP_SOURCE_MISSING:${group.id}`);
  }

  const ids = new Set(items.map((item) => item.id));
  const transitions = Array.isArray(group.transitions) ? group.transitions.map((transition) => {
    if (!ids.has(transition.from) || !ids.has(transition.to)) {
      throw new Error(`POLITICS_SURFACE_TRANSITION_TARGET_MISSING:${group.id}:${transition.from}->${transition.to}`);
    }
    return { from: transition.from, to: transition.to, relation: transition.relation || null };
  }) : [];

  return {
    id: group.id,
    zone: group.zone,
    primitive: group.primitive,
    title: group.title || null,
    items,
    transitions
  };
}

export function resolvePoliticsSurfaceMapping(mapping, chapter, unit) {
  if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping)) return null;
  const states = {};
  for (const [state, groups] of Object.entries(mapping)) {
    if (!Array.isArray(groups)) throw new Error(`POLITICS_SURFACE_STATE_NOT_ARRAY:${state}`);
    states[state] = groups.map((group) => resolveGroup(group, chapter, unit));
  }
  return {
    schema: 'kianos.politics.surface_plan.resolved.v1',
    states
  };
}
