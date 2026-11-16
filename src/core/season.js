// The FRC season a date belongs to. TBA keys events by season year, which is
// the calendar year of the event, so this is the date's year unless the user
// pinned a specific season in Settings (for example to replay a past event).

const MIN_SEASON = 1992;
const MAX_SEASON = 2100;

export function parseSeasonOverride(value) {
  const year = Number.parseInt(value, 10);
  return Number.isInteger(year) && year >= MIN_SEASON && year <= MAX_SEASON ? year : null;
}

/**
 * @param {Date} [date] The date the app is showing (Test Mode aware).
 * @param {string|number|null} [override] Optional season pinned by the user.
 */
export function getSeasonYear(date = new Date(), override = null) {
  return parseSeasonOverride(override) ?? date.getFullYear();
}
