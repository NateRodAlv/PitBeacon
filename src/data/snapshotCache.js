// Last known event data, kept in IndexedDB so the pit display shows something
// useful immediately on startup, even with no network at the venue.

import { idb } from "../core/idb.js";

const KEY = "latest";
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

export async function saveSnapshot({ teamNumber, matches, eventData, rankings, teamSummary }) {
  try {
    await idb.set("snapshots", KEY, {
      teamNumber: String(teamNumber),
      matches,
      eventData,
      rankings,
      teamSummary,
      savedAt: Date.now(),
    });
    return true;
  } catch {
    return false;
  }
}

/** The saved snapshot for this team, or null when missing, for another team, or too old. */
export async function loadSnapshot(teamNumber, now = Date.now()) {
  try {
    const snapshot = await idb.get("snapshots", KEY);
    if (!snapshot) return null;
    if (String(snapshot.teamNumber) !== String(teamNumber)) return null;
    if (now - snapshot.savedAt > MAX_AGE_MS) return null;
    return snapshot;
  } catch {
    return null;
  }
}

export async function clearSnapshot() {
  try {
    await idb.delete("snapshots", KEY);
  } catch {}
}
