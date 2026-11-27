import { getSeasonYear } from "../core/season.js";

const PLACEHOLDER_KEYS = ["your_auth_key", "your auth key", "tba key", "your-api-key", "your api key"];

/** True when the configured TBA key looks like a real one (not blank or a placeholder). */
export function hasRealTbaKey(config) {
  const key = String(config?.tbaapikey ?? "").trim();
  if (!key) return false;
  return !PLACEHOLDER_KEYS.includes(key.toLowerCase());
}

/** The season to query: the year of the date being shown. */
export function seasonFor(state) {
  const shown = state?.fullDate instanceof Date ? state.fullDate : new Date();
  return getSeasonYear(shown);
}

export async function fetchJsonWithRetry(url, options = {}, retries = 2) {
  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, options);
      const text = await response.text();
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${text.slice(0, 120)}`);
      try {
        return JSON.parse(text);
      } catch {
        throw new Error(`Invalid JSON: ${text.slice(0, 120)}`);
      }
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  throw lastError || new Error("Unknown TBA fetch error");
}
