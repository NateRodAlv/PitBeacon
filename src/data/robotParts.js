// The list of selectable model parts. The 3D viewer publishes it so Pit Notes
// can link a task to one individual part.

import { readJson, writeJson } from "../core/storage.js";

const KEY = "robotParts";
export const ROBOT_PARTS_EVENT = "pitbeacon:robot-parts-changed";

/** @returns {{id: string, name: string}[]} */
export function getRobotParts() {
  const parts = readJson(KEY, []);
  return Array.isArray(parts) ? parts.filter((part) => part?.id && part?.name) : [];
}

export function setRobotParts(parts) {
  const seen = new Set();
  const clean = [];
  for (const part of parts || []) {
    const id = String(part?.id ?? "").trim();
    const name = String(part?.name ?? "").trim();
    if (!id || !name || seen.has(id)) continue;
    seen.add(id);
    clean.push({ id, name });
  }
  if (JSON.stringify(clean) === JSON.stringify(getRobotParts())) return false;
  writeJson(KEY, clean);
  window.dispatchEvent(new CustomEvent(ROBOT_PARTS_EVENT));
  return true;
}

export function findRobotPart(idOrName) {
  const needle = String(idOrName ?? "").trim().toLowerCase();
  if (!needle) return null;
  return (
    getRobotParts().find(
      (part) => part.id.toLowerCase() === needle || part.name.toLowerCase() === needle,
    ) || null
  );
}
