const ITEM_STRUCTURAL_FIELDS = new Set([
  'id',
  'label',
  'role',
  'name',
  'left',
  'right',
  'from_label',
  'to_label',
  'locator',
  'look_for',
  'items'
]);

function present(value) {
  return value != null && value !== '' && (!Array.isArray(value) || value.length > 0);
}

function textList(value) {
  if (!present(value)) return [];
  if (Array.isArray(value)) return value.flatMap(textList);
  return [String(value)];
}

function headingFor(item) {
  for (const key of ['label', 'role', 'name', 'left', 'from_label']) {
    if (present(item?.[key])) return String(item[key]);
  }
  return null;
}

function compileItem(item) {
  if (!item || typeof item !== 'object' || Array.isArray(item) || !item.id) {
    throw new Error('POLITICS_FINAL_OBJECT_ITEM_INVALID');
  }

  const relationClaim = present(item.from_label) && present(item.to_label)
    ? {
        from: String(item.from_label),
        relation: present(item.relation) ? String(item.relation) : null,
        to: String(item.to_label)
      }
    : null;

  const compare = present(item.left) && present(item.right)
    ? { left: String(item.left), right: String(item.right) }
    : null;

  const lines = [];
  for (const [field, value] of Object.entries(item)) {
    if (ITEM_STRUCTURAL_FIELDS.has(field) || !present(value) || typeof value === 'object') continue;
    if (field === 'relation' && relationClaim) continue;
    lines.push({ field, text: String(value) });
  }

  return {
    id: String(item.id),
    heading: headingFor(item),
    lines,
    children: textList(item.items),
    locator: present(item.locator) ? String(item.locator) : null,
    lookFor: textList(item.look_for),
    relationClaim,
    compare
  };
}

function compileGroup(group) {
  if (!group?.id || !group?.zone || !group?.primitive || !Array.isArray(group.items)) {
    throw new Error('POLITICS_FINAL_OBJECT_GROUP_INVALID');
  }

  const items = group.items.map(compileItem);
  const itemIds = new Set(items.map((item) => item.id));
  const transitions = (group.transitions || []).map((transition) => {
    if (!itemIds.has(transition.from) || !itemIds.has(transition.to)) {
      throw new Error(`POLITICS_FINAL_OBJECT_TRANSITION_TARGET_MISSING:${group.id}`);
    }
    if (!['ORDER_ONLY', 'LABELED_RELATION'].includes(transition.relation_mode)) {
      throw new Error(`POLITICS_FINAL_OBJECT_TRANSITION_MODE_INVALID:${group.id}`);
    }
    if (transition.relation_mode === 'LABELED_RELATION' && !present(transition.relation)) {
      throw new Error(`POLITICS_FINAL_OBJECT_LABELED_RELATION_EMPTY:${group.id}`);
    }
    return {
      from: String(transition.from),
      to: String(transition.to),
      mode: transition.relation_mode,
      label: transition.relation_mode === 'LABELED_RELATION' ? String(transition.relation) : null
    };
  });

  if (group.primitive === 'RELATION_SET' && items.some((item) => !item.relationClaim)) {
    throw new Error(`POLITICS_FINAL_OBJECT_RELATION_ITEM_INCOMPLETE:${group.id}`);
  }
  if (group.primitive === 'COMPARE' && items.some((item) => !item.compare)) {
    throw new Error(`POLITICS_FINAL_OBJECT_COMPARE_ITEM_INCOMPLETE:${group.id}`);
  }

  return {
    id: String(group.id),
    zone: String(group.zone),
    primitive: String(group.primitive),
    title: present(group.title) ? String(group.title) : null,
    items,
    transitions
  };
}

export function compilePoliticsFinalLearnerObject(surfacePlan, { subject = null, chapter = null, unitId = null } = {}) {
  if (!surfacePlan?.states || typeof surfacePlan.states !== 'object' || Array.isArray(surfacePlan.states)) {
    return null;
  }

  const states = {};
  for (const [state, groups] of Object.entries(surfacePlan.states)) {
    if (!Array.isArray(groups)) throw new Error(`POLITICS_FINAL_OBJECT_STATE_INVALID:${state}`);
    states[state] = groups.map(compileGroup);
  }

  return {
    schema: 'kianos.politics.final_learner_object.v1',
    subject,
    chapter,
    unitId,
    states
  };
}
