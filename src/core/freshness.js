// How fresh is the data a card shows? One pure function so the status dot, its
// tooltip and the tests all agree.

export const STALE_AFTER_MS = 3 * 60 * 1000; // polling runs every 30-60 s

const COLORS = { fresh: "green", stale: "yellow", offline: "red", failed: "red", none: "grey" };

/**
 * @param {{status?: {stale?: boolean, lastUpdate?: number|null, source?: string}|null,
 *          online?: boolean, now?: number, staleAfterMs?: number}} input
 * @returns {{state: "fresh"|"stale"|"offline"|"failed"|"none", color: "green"|"yellow"|"red"|"grey", lastUpdate: number|null}}
 */
export function getFreshness({ status = null, online = true, now = Date.now(), staleAfterMs = STALE_AFTER_MS } = {}) {
  const lastUpdate = Number.isFinite(status?.lastUpdate) ? status.lastUpdate : null;
  const make = (state) => ({ state, color: COLORS[state], lastUpdate });

  if (online === false) return make("offline");
  if (!status) return make("none");
  if (status.source === "cache") return make("stale"); // saved copy, not yet refreshed
  if (status.stale) return make("failed"); // the last refresh round hit an error
  if (lastUpdate === null) return make("none");
  return make(now - lastUpdate > staleAfterMs ? "stale" : "fresh");
}

const LABELS = {
  fresh: "Up to date",
  stale: "Data may be out of date",
  offline: "Offline",
  failed: "Last refresh failed",
  none: "No data yet",
};

/** Tooltip text, e.g. "Up to date · updated 3:42 PM". */
export function describeFreshness(freshness, formatTime = defaultFormatTime) {
  const label = LABELS[freshness.state];
  return freshness.lastUpdate ? `${label} · updated ${formatTime(freshness.lastUpdate)}` : label;
}

function defaultFormatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
