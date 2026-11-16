// Pit Notes: robot tasks, batteries, parts and the check-in list in a single card.
// The sections shown, the default section and a few display options are card settings.

import {
  addItem,
  BATTERY_STATUSES,
  isLowStock,
  loadNotes,
  NOTES_EVENT,
  removeItem,
  sectionCounts,
  TASK_STATUSES,
  updateItem,
} from "../../data/pitNotes.js";
import { findRobotPart, getRobotParts, ROBOT_PARTS_EVENT } from "../../data/robotParts.js";
import { icon } from "../../lib/icons.js";
import { escapeHtml as esc } from "../../lib/html.js";
import { readString, writeString } from "../../core/storage.js";

export const FOCUS_PART_EVENT = "pitbeacon:focus-part";

const SECTION_META = {
  tasks: { label: "Robot", title: "Robot Health", icon: "tool", add: "＋ Task", empty: "No robot tasks logged." },
  batteries: { label: "Batteries", title: "Batteries", icon: "battery", add: "＋ Battery", empty: "No batteries logged." },
  parts: { label: "Parts", title: "Parts Inventory", icon: "package", add: "＋ Part", empty: "No parts tracked." },
  checkins: { label: "Check-in", title: "Pit Check-in", icon: "checklist", add: "＋ Task", empty: "No check-in items." },
};
const SHOW_KEYS = { tasks: "showTasks", batteries: "showBatteries", parts: "showParts", checkins: "showCheckins" };

const TASK_STATUS_UI = {
  pending: { label: "Pending", cls: "chip-warn" },
  "in-progress": { label: "In Progress", cls: "chip-info" },
  completed: { label: "Done", cls: "chip-ok" },
};
const BATTERY_STATUS_UI = {
  ready: { label: "Ready", cls: "chip-ok" },
  charging: { label: "Charging", cls: "chip-info" },
  dead: { label: "Dead", cls: "chip-err" },
};

export const PIT_NOTES_SETTINGS = {
  showTasks: { type: "checkbox", label: "Show Robot tasks", default: true },
  showBatteries: { type: "checkbox", label: "Show Batteries", default: true },
  showParts: { type: "checkbox", label: "Show Parts", default: true },
  showCheckins: { type: "checkbox", label: "Show Check-in", default: true },
  defaultSection: {
    type: "select",
    label: "Open on",
    default: "tasks",
    options: [
      { value: "tasks", label: "Robot" },
      { value: "batteries", label: "Batteries" },
      { value: "parts", label: "Parts" },
      { value: "checkins", label: "Check-in" },
    ],
  },
  hideCompleted: { type: "checkbox", label: "Hide finished tasks and check-ins", default: false },
  flaggedFirst: { type: "checkbox", label: "Show flagged items first", default: true },
  compact: { type: "checkbox", label: "Compact rows", default: false },
};

const DEFAULTS = Object.fromEntries(
  Object.entries(PIT_NOTES_SETTINGS).map(([key, def]) => [key, def.default]),
);

function readSettings(sdk, cardId) {
  return { ...DEFAULTS, ...sdk.getCardSettings(cardId, DEFAULTS) };
}

function visibleSections(settings) {
  const shown = Object.keys(SECTION_META).filter((section) => settings[SHOW_KEYS[section]] !== false);
  return shown.length ? shown : ["tasks"];
}

function chips(map, current) {
  return Object.entries(map)
    .map(
      ([value, { label, cls }]) =>
        `<button type="button" class="pit-chip ${cls}${value === current ? " chip-active" : ""}" data-action="status" data-value="${esc(value)}">${esc(label)}</button>`,
    )
    .join("");
}

function flagBox(item) {
  return `<input type="checkbox" class="flag-toggle" data-action="flag" aria-label="Flag" ${item.flagged ? "checked" : ""}>`;
}

function deleteBtn() {
  return `<button type="button" class="pit-del-btn" data-action="delete" aria-label="Delete">✕</button>`;
}

function voltageClass(voltage) {
  const v = parseFloat(voltage) || 0;
  const pct = Math.min(100, Math.max(0, ((v - 10) / 3) * 100));
  return { pct, cls: pct >= 70 ? "volt-bar-ok" : pct >= 40 ? "volt-bar-warn" : "volt-bar-err" };
}

const ROW = {
  tasks(item, { listId }) {
    const hasPart = Boolean(item.partId && findRobotPart(item.partId));
    return `<div class="pit-card${item.flagged ? " flagged" : ""}" data-id="${esc(item.id)}">
      <div class="pit-card-row">
        ${flagBox(item)}
        <div class="pit-card-fields">
          <input class="pit-input" data-field="task" placeholder="Task…" value="${esc(item.task)}">
          <input class="pit-input pit-sub" data-field="component" data-part-link list="${listId}" placeholder="Part / component…" value="${esc(item.component)}">
        </div>
        ${hasPart ? `<button type="button" class="pit-del-btn pn-locate" data-action="locate" title="Show on the 3D model" aria-label="Show on the 3D model">${icon("target", 14)}</button>` : ""}
        ${deleteBtn()}
      </div>
      <div class="pit-status-row">${chips(TASK_STATUS_UI, item.status)}</div>
    </div>`;
  },
  batteries(item) {
    const { pct, cls } = voltageClass(item.voltage);
    return `<div class="pit-card${item.flagged ? " flagged" : ""}" data-id="${esc(item.id)}">
      <div class="pit-card-row">
        ${flagBox(item)}
        <div class="pit-card-fields">
          <div class="batt-top-row">
            <input class="pit-input batt-id" data-field="label" placeholder="ID" value="${esc(item.label)}">
            <div class="batt-volt-block">
              <input class="pit-input" data-field="voltage" data-volt type="number" step="0.1" placeholder="V" value="${esc(item.voltage)}">
              <div class="volt-track"><div class="volt-bar ${cls}" style="width:${pct.toFixed(0)}%"></div></div>
            </div>
            <input class="pit-input batt-cycles" data-field="cycles" type="number" placeholder="Cycles" value="${esc(item.cycles)}">
          </div>
        </div>
        ${deleteBtn()}
      </div>
      <div class="pit-status-row">${chips(BATTERY_STATUS_UI, item.status)}</div>
    </div>`;
  },
  parts(item) {
    const qty = parseInt(item.quantity, 10) || 0;
    const min = parseInt(item.minStock, 10) || 0;
    const low = isLowStock(item);
    return `<div class="pit-card part-card${low ? " part-card-low" : ""}${item.flagged ? " flagged" : ""}" data-id="${esc(item.id)}">
      <div class="part-card-top">
        ${flagBox(item)}
        <input class="pit-input" data-field="name" placeholder="Part name…" value="${esc(item.name)}">
        ${deleteBtn()}
      </div>
      <div class="part-qty-row">
        <div class="part-qty-block"><span class="part-qty-num ${low ? "qty-low" : "qty-ok"}">${qty}</span><span class="part-qty-label">have</span></div>
        <span class="part-divider">/</span>
        <div class="part-qty-block"><span class="part-qty-num part-qty-min">${min}</span><span class="part-qty-label">min</span></div>
      </div>
      ${low ? `<div class="part-low-badge">⚠ LOW STOCK</div>` : `<div class="part-ok-badge">✓ OK</div>`}
      <div class="part-inputs-row">
        <label class="part-micro-label">Qty<input class="pit-input" data-field="quantity" data-restock type="number" min="0" value="${esc(item.quantity)}"></label>
        <label class="part-micro-label">Min<input class="pit-input" data-field="minStock" data-restock type="number" min="0" value="${esc(item.minStock)}"></label>
      </div>
    </div>`;
  },
  checkins(item) {
    return `<div class="checkin-row${item.completed ? " checkin-done" : ""}${item.flagged ? " flagged" : ""}" data-id="${esc(item.id)}">
      <input type="checkbox" class="checkin-check" data-action="complete" aria-label="Done" ${item.completed ? "checked" : ""}>
      <input class="pit-input" data-field="task" placeholder="Task…" value="${esc(item.task)}">
      <input class="pit-input checkin-assignee" data-field="assignedTo" placeholder="Who…" value="${esc(item.assignedTo)}">
      ${flagBox(item)}
      ${deleteBtn()}
    </div>`;
  },
};

function sortItems(section, items, settings) {
  let list = items;
  if (settings.hideCompleted) {
    if (section === "tasks") list = list.filter((item) => item.status !== "completed");
    if (section === "checkins") list = list.filter((item) => !item.completed);
  }
  if (settings.flaggedFirst) {
    // Stable: flagged items move up, everything else keeps its order.
    list = [...list.filter((item) => item.flagged), ...list.filter((item) => !item.flagged)];
  }
  return list;
}

export function createPitNotesCard() {
  return {
    id: "pit-notes-card",
    label: "Pit Notes",
    icon: "tool",
    builtin: true,
    settings: PIT_NOTES_SETTINGS,
    render(element, state, sdk, cardId = "pit-notes-card") {
      const ctx = (element._pitNotes ??= mount(element, sdk, cardId));
      ctx.sdk = sdk;
      ctx.cardId = cardId;
      // A data refresh must not rebuild rows while someone is typing in one.
      if (ctx.isEditing()) ctx.dirty = true;
      else ctx.draw();
    },
  };
}

function mount(element, sdk, cardId) {
  const listId = `pn-parts-${cardId}`;
  const ctx = {
    sdk,
    cardId,
    dirty: false,
    selfSaving: false,
    active: null,
    isEditing: () => {
      const focused = document.activeElement;
      return Boolean(focused && element.contains(focused) && focused.matches("input:not([type=checkbox]), select"));
    },
    settings: () => readSettings(ctx.sdk, ctx.cardId),
    draw,
  };

  element.innerHTML = `<div class="pit-notes">
    <div class="pit-notes-tabs" role="tablist" data-tabs></div>
    <div class="pit-header"><span class="pit-title" data-title></span><button type="button" class="pit-add-btn" data-action="add"></button></div>
    <div class="pit-body" data-body></div>
    <datalist id="${listId}"></datalist>
  </div>`;
  const root = element.querySelector(".pit-notes");
  Object.assign(root.style, {
    background: "var(--bg-surface)",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    padding: "10px 12px",
    height: "100%",
    overflow: "auto",
  });

  function save(fn) {
    ctx.selfSaving = true;
    try {
      return fn();
    } finally {
      ctx.selfSaving = false;
    }
  }

  function activeSection(sections, settings) {
    const stored = readString("pitNotesSection");
    const wanted = ctx.active ?? stored ?? settings.defaultSection;
    return sections.includes(wanted) ? wanted : sections[0];
  }

  function draw() {
    ctx.dirty = false;
    const settings = ctx.settings();
    const sections = visibleSections(settings);
    const section = (ctx.active = activeSection(sections, settings));
    const notes = loadNotes();
    const counts = sectionCounts(notes);
    root.classList.toggle("pit-notes-compact", Boolean(settings.compact));

    root.querySelector("[data-tabs]").innerHTML = sections
      .map((name) => {
        const { open, flagged } = counts[name];
        return `<button type="button" class="pit-notes-tab${name === section ? " active" : ""}" role="tab" aria-selected="${name === section}" data-action="tab" data-section="${name}">
          ${icon(SECTION_META[name].icon, 14)}<span>${SECTION_META[name].label}</span>
          ${open ? `<span class="pit-notes-count">${open}</span>` : ""}${flagged ? `<span class="pit-notes-flag" title="${flagged} flagged">${icon("flag", 11)}</span>` : ""}
        </button>`;
      })
      .join("");

    root.querySelector("[data-title]").textContent = SECTION_META[section].title;
    root.querySelector("[data-action=add]").textContent = SECTION_META[section].add;

    root.querySelector("datalist").innerHTML = getRobotParts()
      .map((part) => `<option value="${esc(part.name)}"></option>`)
      .join("");

    const items = sortItems(section, notes[section], settings);
    const body = root.querySelector("[data-body]");
    if (!items.length) {
      body.innerHTML = `<p class="pit-empty">${esc(SECTION_META[section].empty)}</p>`;
      return;
    }
    const rows = items.map((item) => ROW[section](item, { listId })).join("");
    body.innerHTML = section === "parts" ? `<div class="parts-grid">${rows}</div>` : rows;
    body.dataset.section = section;
  }

  function rowOf(target) {
    const row = target.closest("[data-id]");
    return row ? { id: row.dataset.id, row } : null;
  }

  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button || !root.contains(button)) return;
    const action = button.dataset.action;
    const section = ctx.active;

    if (action === "tab") {
      ctx.active = button.dataset.section;
      writeString("pitNotesSection", ctx.active);
      draw();
    } else if (action === "add") {
      const item = save(() => addItem(section));
      draw();
      root.querySelector(`[data-id="${CSS.escape(item.id)}"] input:not([type=checkbox])`)?.focus();
    } else if (action === "status") {
      const found = rowOf(button);
      if (!found) return;
      const value = button.dataset.value;
      const allowed = section === "tasks" ? TASK_STATUSES : BATTERY_STATUSES;
      if (allowed.includes(value)) save(() => updateItem(section, found.id, { status: value }));
      draw();
    } else if (action === "delete") {
      const found = rowOf(button);
      if (!found) return;
      save(() => removeItem(section, found.id));
      draw();
    } else if (action === "locate") {
      const found = rowOf(button);
      const task = found && loadNotes().tasks.find((t) => t.id === found.id);
      if (task?.partId) window.dispatchEvent(new CustomEvent(FOCUS_PART_EVENT, { detail: { partId: task.partId } }));
    }
  });

  root.addEventListener("change", (event) => {
    const target = event.target;
    const found = rowOf(target);
    if (!found) return;
    const section = ctx.active;

    if (target.dataset.action === "flag") {
      const flagged = target.checked;
      save(() => updateItem(section, found.id, { flagged }));
      if (flagged && ctx.sdk.getConfig("noteAlarmToggle")) ctx.sdk.triggerAlarm("note");
      draw();
    } else if (target.dataset.action === "complete") {
      save(() => updateItem(section, found.id, { completed: target.checked }));
      draw();
    } else if (target.hasAttribute("data-part-link")) {
      const typed = target.value.trim();
      const part = findRobotPart(typed);
      save(() => updateItem(section, found.id, part ? { partId: part.id, component: part.name } : { partId: null, component: typed }));
      draw();
    } else if (target.hasAttribute("data-restock")) {
      draw();
    }
  });

  root.addEventListener("input", (event) => {
    const target = event.target;
    const field = target.dataset.field;
    const found = rowOf(target);
    if (!field || !found || target.hasAttribute("data-part-link")) return;
    save(() => updateItem(ctx.active, found.id, { [field]: target.value }));
    if (target.hasAttribute("data-volt")) {
      const { pct, cls } = voltageClass(target.value);
      const bar = found.row.querySelector(".volt-bar");
      if (bar) {
        bar.style.width = `${pct.toFixed(0)}%`;
        bar.className = `volt-bar ${cls}`;
      }
    } else if (target.hasAttribute("data-restock")) {
      // The badge catches up on blur (change), so the field keeps focus while typing.
      const min = found.row.querySelector('[data-field="minStock"]')?.value;
      const qty = found.row.querySelector('[data-field="quantity"]')?.value;
      found.row.classList.toggle("part-card-low", (parseInt(qty, 10) || 0) <= (parseInt(min, 10) || 0));
    }
  });

  root.addEventListener("focusout", () => {
    // Apply refreshes that arrived while a field had focus.
    setTimeout(() => {
      if (ctx.dirty && !ctx.isEditing() && element.isConnected) draw();
    }, 0);
  });

  const external = () => {
    if (!element.isConnected) {
      cleanup();
      return;
    }
    if (ctx.selfSaving) return;
    if (ctx.isEditing()) ctx.dirty = true;
    else draw();
  };
  const cleanup = () => {
    window.removeEventListener(NOTES_EVENT, external);
    window.removeEventListener(ROBOT_PARTS_EVENT, external);
    window.removeEventListener("storage", onStorage);
  };
  const onStorage = (event) => {
    if (event.key === null || event.key === "pitNotes" || event.key === "robotParts" || event.key === "cardSettings") external();
  };
  window.addEventListener(NOTES_EVENT, external);
  window.addEventListener(ROBOT_PARTS_EVENT, external);
  window.addEventListener("storage", onStorage);

  return ctx;
}
