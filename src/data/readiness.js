// Overall robot readiness from Pit Notes: open and flagged tasks, battery state,
// low-stock parts and the parts that most need attention.

import { isLowStock, summarizeParts } from "./pitNotes.js";

const STATE_RANK = { flagged: 3, "in-progress": 2, pending: 1, ok: 0 };

/**
 * @param {object} notes loadNotes() result
 * @param {{id: string, name: string}[]} robotParts parts published by the 3D viewer
 * @returns summary used by the Robot Summary card
 */
export function summarizeReadiness(notes, robotParts = [], { urgentLimit = 5, taskLimit = 5 } = {}) {
  const tasks = notes.tasks ?? [];
  const open = tasks.filter((task) => task.status !== "completed");
  const flagged = open.filter((task) => task.flagged);
  const inProgress = open.filter((task) => task.status === "in-progress");

  const batteries = notes.batteries ?? [];
  const ready = batteries.filter((b) => b.status === "ready").length;
  const charging = batteries.filter((b) => b.status === "charging").length;
  const dead = batteries.filter((b) => b.status === "dead").length;
  const batteryState = !batteries.length ? "none" : ready === 0 ? "bad" : dead > 0 || ready === 1 ? "warn" : "ok";

  const lowStock = (notes.parts ?? []).filter(isLowStock);

  const names = new Map(robotParts.map((part) => [part.id, part.name]));
  const urgentParts = Object.entries(summarizeParts(notes))
    .map(([partId, info]) => ({ partId, name: names.get(partId) ?? partId, state: info.state, open: info.open }))
    .sort((a, b) => STATE_RANK[b.state] - STATE_RANK[a.state] || b.open - a.open || a.name.localeCompare(b.name))
    .slice(0, urgentLimit);

  const urgentTasks = [...open]
    .sort((a, b) => Number(b.flagged) - Number(a.flagged) || Number(b.status === "in-progress") - Number(a.status === "in-progress"))
    .slice(0, taskLimit);

  let level = "ready";
  if (open.length || lowStock.length || batteryState === "warn") level = "attention";
  if (flagged.length || batteryState === "bad") level = "critical";

  return {
    level,
    openTasks: open.length,
    flaggedTasks: flagged.length,
    inProgressTasks: inProgress.length,
    battery: { total: batteries.length, ready, charging, dead, state: batteryState },
    lowStock,
    urgentParts,
    urgentTasks,
  };
}

export const READINESS_LABEL = {
  ready: "Ready to run",
  attention: "Needs attention",
  critical: "Not ready",
};
