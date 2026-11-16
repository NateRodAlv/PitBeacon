import { hasRealTbaKey, seasonFor } from "./tba.js";

const TBA_API = "https://www.thebluealliance.com/api/v3";
const SOURCE_NAMES = [
  "currentMatches",
  "currentEventData",
  "currentRankings",
  "teamInfo",
  "teamSummaryData",
];

function parseLocalDate(isoDate) {
  const [year, month, day] = String(isoDate).split("-").map(Number);
  return { year, month: month - 1, day };
}

/** Whether `now` falls inside an event's date range, including the whole last day. */
export function isEventActive(event, now) {
  if (!event?.start_date || !event?.end_date) return false;
  const start = parseLocalDate(event.start_date);
  const end = parseLocalDate(event.end_date);
  const startsAt = new Date(start.year, start.month, start.day, 0, 0, 0, 0);
  const endsAt = new Date(end.year, end.month, end.day, 23, 59, 59, 999);
  return now >= startsAt && now <= endsAt;
}

export class DataSourceManager {
  constructor(config, stateManager) {
    this._config = config;
    this._state = stateManager;
    // url -> { etag, data }: the last good response for every TBA URL, used both
    // for conditional requests (304) and as the fallback when the network is down.
    this._store = new Map();
    this._etagUnsupported = false;
    this._round = { failed: false };
    this.lastSuccessAt = null;
  }

  updateConfig(config) {
    this._config = config;
    this.clearCache();
  }

  clearCache() {
    this._store.clear();
  }

  getSourceNames() {
    return [...SOURCE_NAMES];
  }

  async fetch(sourceName) {
    switch (sourceName) {
      case "currentMatches":
        return this._state.getState().currentMatches || null;
      case "currentEventData":
        return this._state.getState().currentEventData || null;
      case "currentRankings":
        return this._state.getState().currentRankings || null;
      case "teamInfo":
        return this._fetchTeamInfo();
      case "teamSummaryData":
        return this._state.getState().currentTeamSummaryData || null;
      default:
        return null;
    }
  }

  _hasRealApiKey() {
    return hasRealTbaKey(this._config);
  }

  _season() {
    return seasonFor(this._config, this._state.getState());
  }

  async _request(url, headers) {
    try {
      return await fetch(url, { headers });
    } catch (error) {
      // A browser that rejects the conditional header outright shows up as a
      // network error. Retry once without it and stop sending it from now on.
      if (headers["If-None-Match"]) {
        this._etagUnsupported = true;
        const plain = { ...headers };
        delete plain["If-None-Match"];
        return fetch(url, { headers: plain });
      }
      throw error;
    }
  }

  /**
   * GET a TBA path. Revalidates with the stored ETag, and on any failure falls
   * back to the last good copy so cards keep showing data on a flaky connection.
   * Returns null when there is nothing to show (no key, 404, or never fetched).
   */
  async _tba(path) {
    if (!this._hasRealApiKey()) return null;
    const url = `${TBA_API}${path}`;
    const entry = this._store.get(url);
    const headers = { "X-TBA-Auth-Key": this._config.tbaapikey };
    if (entry?.etag && !this._etagUnsupported) headers["If-None-Match"] = entry.etag;

    try {
      const response = await this._request(url, headers);
      if (response.status === 304 && entry) {
        this.lastSuccessAt = Date.now();
        return entry.data;
      }
      if (response.status === 404) {
        this._store.delete(url);
        this.lastSuccessAt = Date.now();
        return null;
      }
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const data = await response.json();
      this._store.set(url, { etag: response.headers.get("ETag"), data });
      this.lastSuccessAt = Date.now();
      return data;
    } catch (error) {
      console.warn(`TBA request failed (${path}):`, error);
      this._round.failed = true;
      return entry ? entry.data : null;
    }
  }

  async _fetchTeamInfo() {
    if (!this._hasRealApiKey()) return { events: [] };
    const events = await this._tba(`/team/frc${this._config.teamNumber}/events/${this._season()}`);
    return events ? { events } : null;
  }

  /** One polling round: the team's current event with its matches and rankings. */
  async fetchAll() {
    if (!this._hasRealApiKey()) return null;
    this._round = { failed: false };

    const teamInfo = await this._fetchTeamInfo();
    if (!teamInfo?.events) return null;

    const now = this._state.getState().fullDate || new Date();
    const event = teamInfo.events.find((candidate) => isEventActive(candidate, now));

    let matches = null;
    let eventData = null;
    let rankings = null;
    if (event) {
      const team = this._config.teamNumber;
      matches = await this._tba(`/team/frc${team}/event/${event.key}/matches/simple`);
      if (matches) eventData = event;
      const rankingsResult = await this._tba(`/event/${event.key}/rankings`);
      rankings = rankingsResult?.rankings ?? null;
    }

    return {
      matches,
      eventData,
      rankings,
      stale: this._round.failed,
      fetchedAt: this.lastSuccessAt,
    };
  }

  /** Rank, record and win rate for the team at the given event. */
  async fetchTeamSummary(eventKey) {
    const team = this._config.teamNumber;
    const eventName = this._state.getState().currentEventData?.name || null;

    if (!team || !this._hasRealApiKey()) {
      return {
        teamSummary: {
          eventRank: "–",
          eventRecord: { wins: 0, losses: 0, ties: 0 },
          winRate: "–",
          seasonEventCount: 0,
          eventName,
        },
      };
    }

    const [teamEvents, eventStatus, rankings] = await Promise.all([
      this._tba(`/team/frc${team}/events/${this._season()}`),
      eventKey ? this._tba(`/team/frc${team}/event/${eventKey}/status`) : null,
      eventKey ? this._tba(`/event/${eventKey}/rankings`) : null,
    ]);

    const rankingEntry = Array.isArray(rankings?.rankings)
      ? rankings.rankings.find((entry) => entry.team_key === `frc${team}`)
      : null;
    const record = rankingEntry?.record || eventStatus?.qual?.record || null;
    const eventRank = rankingEntry?.rank ?? eventStatus?.qual?.rank ?? null;
    const wins = record?.wins ?? 0;
    const losses = record?.losses ?? 0;
    const ties = record?.ties ?? 0;
    const games = wins + losses + ties;

    return {
      teamSummary: {
        eventRank,
        eventRecord: { wins, losses, ties },
        winRate: games > 0 ? `${((wins / games) * 100).toFixed(1)}%` : "–",
        seasonEventCount: Array.isArray(teamEvents) ? teamEvents.length : 0,
        eventName,
      },
    };
  }
}
