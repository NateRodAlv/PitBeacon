// Pure time helpers: Test Mode dates and match-alert selection.

/** "YYYY-MM-DD" as a local calendar date (new Date("2026-04-26") would be UTC and drift a day in the US). */
export function parseTestDate(value) {
  const text = String(value ?? "").trim();
  const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) return { year: Number(iso[1]), month: Number(iso[2]) - 1, day: Number(iso[3]) };
  const parsed = new Date(text);
  if (!text || Number.isNaN(parsed.getTime())) return null;
  return { year: parsed.getFullYear(), month: parsed.getMonth(), day: parsed.getDate() };
}

/** The moment the app should treat as "now": the real clock, or the test date at today's time of day. */
export function getNow({ testMode, testDate } = {}, real = new Date()) {
  if (!testMode) return real;
  const date = parseTestDate(testDate);
  if (!date) return real;
  return new Date(
    date.year,
    date.month,
    date.day,
    real.getHours(),
    real.getMinutes(),
    real.getSeconds(),
  );
}

/** The first upcoming match for the team inside the alert window that has not been announced yet. */
export function findMatchAlert(matches, { teamNumber, nowSeconds, thresholdSeconds, lastAlertId }) {
  const teamKey = `frc${teamNumber}`;
  for (const match of matches || []) {
    const red = match.alliances?.red?.team_keys || [];
    const blue = match.alliances?.blue?.team_keys || [];
    if (!red.includes(teamKey) && !blue.includes(teamKey)) continue;

    const secondsUntil = match.predicted_time - nowSeconds;
    const matchId = `${match.comp_level}-${match.match_number}`;
    if (secondsUntil > 0 && secondsUntil <= thresholdSeconds && lastAlertId !== matchId) {
      return { match, matchId, secondsUntil };
    }
  }
  return null;
}
