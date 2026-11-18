// TBA keys events by season year, which is the calendar year of the date shown.

/**
 * @param {Date} [date] The date the app is showing (Test Mode aware).
 */
export function getSeasonYear(date = new Date()) {
  return date.getFullYear();
}
