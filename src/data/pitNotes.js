// Pit Notes data: robot tasks, batteries, parts and check-in items in one store.
//
// Every item has a stable id, so other cards (the 3D viewer) can refer to it and
// reordering or deleting never points at the wrong row. Data from the four older
// note cards is migrated once and the old keys are left untouched as a backup.

import { readJson, writeJson } from "../core/storage.js";

export const NOTES_KEY = "pitNotes";
export const NOTES_EVENT = "pitbeacon:notes-changed";
export const SECTIONS = ["tasks", "batteries", "parts", "checkins"];

const LEGACY_KEYS = {
  tasks: "noteData-robot-health",
  batteries: "noteData-battery-manager",
  parts: "noteData-parts-inventory",
  checkins: "noteData-pit-checkin",
};

export const TASK_STATUSES = ["pending", "in-progress", "completed"];
export const BATTERY_STATUSES = ["ready", "charging", "dead"];

export function newId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `n${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function asArray(value) {
  return Array.isArray(value) ? value.filter((item) => item && typeof item === "object") : [];
}

/** Normalize one item read from storage so the UI can trust its shape. */
export function normalizeItem(section, raw) {
  const base = { id: raw.id ? String(raw.id) : newId(), flagged: Boolean(raw.flagged) };
  switch (section) {
    case "tasks":
      return {
        ...base,
        task: String(raw.task ?? ""),
        component: String(raw.component ?? ""),
        partId: raw.partId ? String(raw.partId) : null,
        status: TASK_STATUSES.includes(raw.status) ? raw.status : "pending",
      };
    case "batteries":
      return {
        ...base,
        label: String(raw.label ?? ""),
        voltage: String(raw.voltage ?? ""),
        cycles: String(raw.cycles ?? "0"),
        status: BATTERY_STATUSES.includes(raw.status) ? raw.status : "ready",
      };
    case "parts":
      return {
        ...base,
        name: String(raw.name ?? ""),
        quantity: String(raw.quantity ?? "0"),
        minStock: String(raw.minStock ?? "0"),
        partId: raw.partId ? String(raw.partId) : null,
      };
    case "checkins":
      return {
        ...base,
        task: String(raw.task ?? ""),
        assignedTo: String(raw.assignedTo ?? ""),
        completed: Boolean(raw.completed),
      };
    default:
      return base;
  }
}

/** Convert the old per-card arrays ({id, voltage...} for batteries) into the new shape. */
export function migrateLegacy(legacy) {
  const out = {};
  for (const section of SECTIONS) {
    out[section] = asArray(legacy?.[section]).map((raw) => {
      // Old battery rows used `id` for the label the user typed.
      const prepared = section === "batteries" ? { ...raw, label: raw.label ?? raw.id, id: undefined } : { ...raw, id: undefined };
      return normalizeItem(section, prepared);
    });
  }
  return out;
}

function emptyNotes() {
  return { version: 2, tasks: [], batteries: [], parts: [], checkins: [] };
}

function readLegacy() {
  const legacy = {};
  let found = false;
  for (const [section, key] of Object.entries(LEGACY_KEYS)) {
    const value = readJson(key, null);
    if (Array.isArray(value)) found = true;
    legacy[section] = value;
  }
  return found ? legacy : null;
}

export function loadNotes() {
  const stored = readJson(NOTES_KEY, null);
  if (stored && typeof stored === "object" && !Array.isArray(stored)) {
    const notes = emptyNotes();
    for (const section of SECTIONS) {
      notes[section] = asArray(stored[section]).map((raw) => normalizeItem(section, raw));
    }
    return notes;
  }
  const legacy = readLegacy();
  const notes = legacy ? { version: 2, ...migrateLegacy(legacy) } : emptyNotes();
  writeJson(NOTES_KEY, notes);
  return notes;
}

export function saveNotes(notes) {
  const ok = writeJson(NOTES_KEY, notes);
  window.dispatchEvent(new CustomEvent(NOTES_EVENT));
  return ok;
}

const DEFAULT_ITEMS = {
  tasks: () => ({ task: "", component: "", partId: null, status: "pending", flagged: false }),
  batteries: () => ({ label: "", voltage: "", cycles: "0", status: "ready", flagged: false }),
  parts: () => ({ name: "", quantity: "0", minStock: "0", partId: null, flagged: false }),
  checkins: () => ({ task: "", assignedTo: "", completed: false, flagged: false }),
};

export function addItem(section, overrides = {}) {
  const notes = loadNotes();
  const item = normalizeItem(section, { ...DEFAULT_ITEMS[section](), ...overrides });
  notes[section].push(item);
  saveNotes(notes);
  return item;
}

/** Patch one item by id. Returns the updated item, or null if it no longer exists. */
export function updateItem(section, id, patch) {
  const notes = loadNotes();
  const index = notes[section].findIndex((item) => item.id === id);
  if (index < 0) return null;
  notes[section][index] = normalizeItem(section, { ...notes[section][index], ...patch });
  saveNotes(notes);
  return notes[section][index];
}

export function removeItem(section, id) {
  const notes = loadNotes();
  const before = notes[section].length;
  notes[section] = notes[section].filter((item) => item.id !== id);
  if (notes[section].length !== before) saveNotes(notes);
}

export function isLowStock(part) {
  return (parseInt(part.quantity, 10) || 0) <= (parseInt(part.minStock, 10) || 0);
}

const SEVERITY = { ok: 0, pending: 1, "in-progress": 2, flagged: 3 };

/**
 * What the 3D viewer shows for each robot part: the worst state among its open
 * tasks, plus how many tasks are open.
 * @returns {Record<string, {state: "ok"|"pending"|"in-progress"|"flagged", open: number, tasks: object[]}>}
 */
export function summarizeParts(notes = loadNotes()) {
  const summary = {};
  for (const task of notes.tasks) {
    if (!task.partId || task.status === "completed") continue;
    const entry = (summary[task.partId] ||= { state: "ok", open: 0, tasks: [] });
    entry.open += 1;
    entry.tasks.push(task);
    const state = task.flagged ? "flagged" : task.status;
    if (SEVERITY[state] > SEVERITY[entry.state]) entry.state = state;
  }
  return summary;
}

/** Counts shown on the section tabs. */
export function sectionCounts(notes = loadNotes()) {
  return {
    tasks: { open: notes.tasks.filter((t) => t.status !== "completed").length, flagged: notes.tasks.filter((t) => t.flagged).length },
    batteries: { open: notes.batteries.filter((b) => b.status !== "ready").length, flagged: notes.batteries.filter((b) => b.flagged).length },
    parts: { open: notes.parts.filter(isLowStock).length, flagged: notes.parts.filter((p) => p.flagged).length },
    checkins: { open: notes.checkins.filter((c) => !c.completed).length, flagged: notes.checkins.filter((c) => c.flagged).length },
  };
}
