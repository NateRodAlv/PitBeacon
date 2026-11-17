// Robot Summary: one-glance readiness built from Pit Notes. Parts link to the 3D
// viewer (pitbeacon:focus-part) and tasks, batteries and stock link to the Pit
// Notes card's matching section.

import { loadNotes, NOTES_EVENT } from "../../data/pitNotes.js";
import { getRobotParts, ROBOT_PARTS_EVENT } from "../../data/robotParts.js";
import { READINESS_LABEL, summarizeReadiness } from "../../data/readiness.js";
import { renderEmptyInfo } from "../../ui/emptyState.js";
import { FOCUS_PART_EVENT, OPEN_NOTES_SECTION_EVENT } from "./pitNotesCard.js";

function h(tag, props = {}, ...kids) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
    else if (value != null && value !== false) node.setAttribute(key, value);
  }
  kids.forEach((kid) => kid != null && node.append(kid));
  return node;
}

const openNotes = (section, itemId = null) =>
  window.dispatchEvent(new CustomEvent(OPEN_NOTES_SECTION_EVENT, { detail: { section, itemId } }));
const focusPart = (partId) => window.dispatchEvent(new CustomEvent(FOCUS_PART_EVENT, { detail: { partId } }));

function tile(label, value, sub, tone, onClick) {
  return h(
    "button",
    { type: "button", class: `rs-tile rs-${tone}`, onclick: onClick, title: `Open ${label} in Pit Notes` },
    h("span", { class: "rs-tile-value", text: value }),
    h("span", { class: "rs-tile-label", text: label }),
    h("span", { class: "rs-tile-sub", text: sub }),
  );
}

function section(title, rows) {
  if (!rows.length) return null;
  return h("section", { class: "rs-section" }, h("h4", { class: "rs-section-title", text: title }), h("ul", { class: "rs-list" }, ...rows.map((row) => h("li", {}, row))));
}

function row(tone, main, meta, onClick, hint) {
  return h(
    "button",
    { type: "button", class: "rs-row", onclick: onClick, title: hint },
    h("span", { class: `rs-dot rs-dot-${tone}`, "aria-hidden": "true" }),
    h("span", { class: "rs-row-main", text: main }),
    meta ? h("span", { class: "rs-row-meta", text: meta }) : null,
  );
}

function draw(element) {
  const notes = loadNotes();
  const empty = !notes.tasks.length && !notes.batteries.length && !notes.parts.length;
  if (empty) {
    renderEmptyInfo(element, {
      reason: "no-notes",
      title: "Nothing to summarize yet",
      body: "Log robot tasks, batteries and spare parts in Pit Notes and this card turns them into a readiness check.",
      actionLabel: "Open Pit Notes",
      onAction: () => openNotes("tasks"),
    });
    return;
  }

  const s = summarizeReadiness(notes, getRobotParts());
  const { battery } = s;
  const batteryValue = battery.total ? `${battery.ready}/${battery.total}` : "–";
  const batterySub = !battery.total ? "none logged" : [battery.charging && `${battery.charging} charging`, battery.dead && `${battery.dead} dead`].filter(Boolean).join(" · ") || "all ready";
  const batteryTone = { ok: "ok", warn: "warn", bad: "bad", none: "idle" }[battery.state];

  const root = h(
    "div",
    { class: "robot-summary" },
    h(
      "div",
      { class: `rs-banner rs-level-${s.level}`, role: "status" },
      h("span", { class: "rs-banner-label", text: READINESS_LABEL[s.level] }),
      h("span", { class: "rs-banner-sub", text: s.level === "ready" ? "No open tasks, batteries and stock look good." : `${s.openTasks} open task${s.openTasks === 1 ? "" : "s"}` }),
    ),
    h(
      "div",
      { class: "rs-tiles" },
      tile("Open tasks", String(s.openTasks), s.flaggedTasks ? `${s.flaggedTasks} flagged` : "none flagged", s.flaggedTasks ? "bad" : s.openTasks ? "warn" : "ok", () => openNotes("tasks")),
      tile("Batteries", batteryValue, batterySub, batteryTone, () => openNotes("batteries")),
      tile("Low stock", String(s.lowStock.length), s.lowStock.length ? "at or below min" : "all stocked", s.lowStock.length ? "warn" : "ok", () => openNotes("parts")),
    ),
    section(
      "Parts needing attention",
      s.urgentParts.map((part) =>
        row(part.state === "flagged" ? "bad" : part.state === "in-progress" ? "warn" : "info", part.name, `${part.open} open`, () => focusPart(part.partId), "Show in the 3D viewer"),
      ),
    ),
    section(
      "Open tasks",
      s.urgentTasks.map((task) =>
        row(task.flagged ? "bad" : task.status === "in-progress" ? "warn" : "info", task.task || "Untitled task", task.component || (task.flagged ? "flagged" : ""), () => openNotes("tasks", task.id), "Open in Pit Notes"),
      ),
    ),
    section(
      "Low-stock parts",
      s.lowStock.slice(0, 5).map((part) => row("warn", part.name || "Unnamed part", `${parseInt(part.quantity, 10) || 0}/${parseInt(part.minStock, 10) || 0}`, () => openNotes("parts", part.id), "Open in Pit Notes")),
    ),
  );
  element.replaceChildren(root);
}

export function createRobotSummaryCard() {
  return {
    id: "robot-summary-card",
    label: "Robot Summary",
    icon: "checklist",
    builtin: true,
    statusSource: "local",
    render(element) {
      if (!element._robotSummary) {
        const redraw = () => {
          if (!element.isConnected) return cleanup();
          draw(element);
        };
        const onStorage = (event) => {
          if (event.key === null || event.key === "pitNotes" || event.key === "robotParts") redraw();
        };
        const cleanup = () => {
          window.removeEventListener(NOTES_EVENT, redraw);
          window.removeEventListener(ROBOT_PARTS_EVENT, redraw);
          window.removeEventListener("storage", onStorage);
          element._robotSummary = null;
        };
        window.addEventListener(NOTES_EVENT, redraw);
        window.addEventListener(ROBOT_PARTS_EVENT, redraw);
        window.addEventListener("storage", onStorage);
        element._robotSummary = { redraw };
      }
      draw(element);
    },
  };
}
