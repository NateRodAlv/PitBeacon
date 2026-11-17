// State for the next-match banner: which of our matches is next, how long until
// it, which alliance we are on, and whether it is close enough to be urgent.

const LEVEL_LABEL = { qm: "Q", ef: "EF", qf: "QF", sf: "SF", f: "F" };

export function matchLabel(match) {
  const prefix = LEVEL_LABEL[match.comp_level] ?? String(match.comp_level ?? "").toUpperCase();
  const set = match.comp_level && match.comp_level !== "qm" && match.set_number ? `${match.set_number}-` : "";
  return `${prefix}${prefix.length > 1 || set ? " " : ""}${set}${match.match_number}`;
}

function startOf(match) {
  const t = match.predicted_time ?? match.time;
  return Number.isFinite(t) ? t : null;
}

export function allianceOf(match, teamNumber) {
  const key = `frc${teamNumber}`;
  if (match.alliances?.red?.team_keys?.includes(key)) return "red";
  if (match.alliances?.blue?.team_keys?.includes(key)) return "blue";
  return null;
}

/**
 * @returns {null | {label: string, alliance: "red"|"blue", startsAt: number,
 *   secondsUntil: number, inProgress: boolean, urgent: boolean}}
 */
export function getNextMatchBanner({ matches, teamNumber, nowSec, alertThreshold = 300, matchDuration = 150 }) {
  if (!Array.isArray(matches) || !matches.length) return null;
  const upcoming = matches
    .map((match) => ({ match, start: startOf(match), alliance: allianceOf(match, teamNumber) }))
    .filter((entry) => entry.start !== null && entry.alliance && entry.start + matchDuration >= nowSec)
    .sort((a, b) => a.start - b.start)[0];
  if (!upcoming) return null;

  const secondsUntil = Math.max(0, Math.floor(upcoming.start - nowSec));
  const inProgress = nowSec >= upcoming.start;
  return {
    label: matchLabel(upcoming.match),
    alliance: upcoming.alliance,
    startsAt: upcoming.start,
    secondsUntil,
    inProgress,
    urgent: inProgress || secondsUntil <= alertThreshold,
  };
}

/** 754 -> "12m 34s", 3700 -> "1h 1m", 45 -> "45s". */
export function formatCountdown(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${String(s % 60).padStart(2, "0")}s`;
  return `${s}s`;
}
