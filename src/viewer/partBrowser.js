// Pure helpers for the viewer's Parts / Connectors browser (no DOM, no three.js).

export const PART_ROW_LIMIT = 150;
export const DETAIL_CONNECTOR_CAP = 6;

const STATE_RANK = { flagged: 3, "in-progress": 2, pending: 1 };
const rankOf = (state) => STATE_RANK[state] || 0;

const norm = (q) => String(q == null ? "" : q).trim().toLowerCase();

/**
 * Filter parts by a case-insensitive substring and order them:
 * open tasks first (flagged > in-progress > pending, then more open tasks),
 * then parts that have connectors, then original model order.
 * parts: [{ label }], summary: { [label]: { state, open } }, connectorCounts: { [label]: n }.
 */
export function filterAndSortParts({ parts = [], query = "", summary = {}, connectorCounts = {}, limit = 150 } = {}) {
  const q = norm(query);
  const rows = [];
  parts.forEach((part, index) => {
    const label = part && part.label;
    if (typeof label !== "string") return;
    if (q && !label.toLowerCase().includes(q)) return;
    const s = summary[label];
    const open = s && s.open > 0 ? s.open : 0;
    rows.push({
      label,
      index,
      state: open ? s.state : "ok",
      open,
      connectors: connectorCounts[label] || 0,
    });
  });
  rows.sort((a, b) =>
    rankOf(b.state) - rankOf(a.state)
    || b.open - a.open
    || (b.connectors > 0) - (a.connectors > 0)
    || a.index - b.index);
  const cap = Math.max(0, Number.isFinite(limit) ? Math.floor(limit) : PART_ROW_LIMIT);
  return { rows: rows.slice(0, cap), hiddenCount: Math.max(0, rows.length - cap), total: rows.length };
}

const affects = (mech, partId) => mech.partId === partId || (Array.isArray(mech.nodes) && mech.nodes.includes(partId));

/** Connectors that act on a part, most specific (fewest nodes) first. Stable for ties. */
export function connectorsForPart(mechanisms = [], partId, cap = DETAIL_CONNECTOR_CAP) {
  const hits = mechanisms
    .map((mech, index) => ({ mech, index }))
    .filter(({ mech }) => mech && affects(mech, partId))
    .sort((a, b) => specificity(a.mech) - specificity(b.mech) || a.index - b.index)
    .map(({ mech }) => mech);
  const limit = Math.max(0, cap);
  return { items: hits.slice(0, limit), hiddenCount: Math.max(0, hits.length - limit), total: hits.length };
}
const specificity = (mech) => (mech.partId ? 1 : (mech.nodes || []).length || Infinity);

/** How many connectors affect each part label: { label: n }. */
export function countConnectorsByPart(mechanisms = [], labels = []) {
  const counts = {};
  const wanted = new Set(labels);
  for (const mech of mechanisms) {
    const ids = new Set(mech.nodes || []);
    if (mech.partId) ids.add(mech.partId);
    for (const id of ids) if (wanted.has(id)) counts[id] = (counts[id] || 0) + 1;
  }
  return counts;
}

/** Case-insensitive filter over connector name, part ids and joint type; keeps order. */
export function filterConnectors(mechanisms = [], query = "", limit = PART_ROW_LIMIT) {
  const q = norm(query);
  const hits = q
    ? mechanisms.filter((m) => [m.name, m.partId, m.jointType, m.type, ...(m.nodes || [])].some((v) => typeof v === "string" && v.toLowerCase().includes(q)))
    : mechanisms.slice();
  return { rows: hits.slice(0, limit), hiddenCount: Math.max(0, hits.length - limit), total: hits.length };
}
