export class DataSourceManager {
    constructor(config, stateManager) {
        this._config = config;
        this._state = stateManager;
        this._cache = new Map();
        this._etagCache = {
            events: null,
            matches: {},
        };
        this._year = new Date().getFullYear();
    }

    updateConfig(config) {
        this._config = config;
        // Clear ETag cache when config changes
        this._etagCache.events = null;
        this._etagCache.matches = {};
        this._cache.clear();
    }

    getSourceNames() {
        return ['currentMatches', 'currentEventData', 'currentRankings', 'teamInfo', 'teamSummaryData'];
    }

    async fetch(sourceName) {
        switch (sourceName) {
            case 'currentMatches':
                return this._fetchMatches();
            case 'currentEventData':
                return this._fetchEventData();
            case 'currentRankings':
                return this._fetchRankings();
            case 'teamInfo':
                return this._fetchTeamInfo();
            case 'teamSummaryData':
                return this._fetchTeamSummaryData();
            default:
                return null;
        }
    }

    _hasRealApiKey() {
        const key = (this._config.tbaapikey || "").toString().trim();
        if (!key) return false;
        const normalized = key.toLowerCase();
        return !["your_auth_key", "your auth key", "tba key", "your-api-key", "your api key"].includes(normalized);
    }

    async fetchAll() {
        if (!this._hasRealApiKey()) {
            return null;
        }

        const teamInfo = await this._fetchTeamInfo();
        if (!teamInfo || !teamInfo.events) {
            return null;
        }

        const events = teamInfo.events;
        const fullDate = this._state.getState().fullDate || new Date();

        let matches = null;
        let eventData = null;
        let rankings = null;

        for (const event of events) {
            if (!event.start_date || !event.end_date) continue;
            
            const [startYear, startMonth, startDay] = event.start_date.split('-');
            const [endYear, endMonth, endDay] = event.end_date.split('-');
            const eventStart = new Date(startYear, startMonth - 1, startDay);
            const eventEnd = new Date(endYear, endMonth - 1, endDay);

            if (fullDate >= eventStart && fullDate <= eventEnd) {
                // Fetch matches for this event
                const matchesResult = await this._fetchMatchesForEvent(event.key);
                if (matchesResult) {
                    matches = matchesResult;
                    eventData = event;
                }

                // Fetch rankings
                const rankingsResult = await this._fetchRankingsForEvent(event.key);
                if (rankingsResult) {
                    rankings = rankingsResult;
                }

                break;
            }
        }

        return { matches, eventData, rankings };
    }

    async _fetchTeamInfo() {
        if (!this._hasRealApiKey()) {
            return { events: [] };
        }

        const cacheKey = 'teamInfo';
        if (this._cache.has(cacheKey)) {
            return this._cache.get(cacheKey);
        }

        try {
            const response = await fetch(
                `https://www.thebluealliance.com/api/v3/team/frc${this._config.teamNumber}/events/${this._year}`,
                { headers: { 'X-TBA-Auth-Key': this._config.tbaapikey } }
            );

            if (response.status === 304 && this._etagCache.events) {
                // Use cached data
                return this._cache.get('teamInfo_cached');
            }

            const etag = response.headers.get('ETag');
            if (etag) this._etagCache.events = etag;

            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            
            const data = await response.json();
            const result = { events: data };
            this._cache.set(cacheKey, result);
            this._cache.set('teamInfo_cached', result);
            return result;
        } catch (error) {
            console.warn('Team info fetch failed:', error);
            return null;
        }
    }

    async _fetchMatchesForEvent(eventKey) {
        if (!this._hasRealApiKey()) {
            return null;
        }

        const cacheKey = `matches_${eventKey}`;
        if (this._cache.has(cacheKey)) {
            return this._cache.get(cacheKey);
        }

        try {
            const headers = { 'X-TBA-Auth-Key': this._config.tbaapikey };
            if (this._etagCache.matches[eventKey]) {
                headers['If-None-Match'] = this._etagCache.matches[eventKey];
            }

            const response = await fetch(
                `https://www.thebluealliance.com/api/v3/team/frc${this._config.teamNumber}/event/${eventKey}/matches/simple`,
                { headers }
            );

            if (response.status === 304) {
                return this._cache.get(`matches_cached_${eventKey}`) || null;
            }

            const etag = response.headers.get('ETag');
            if (etag) this._etagCache.matches[eventKey] = etag;

            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            
            const data = await response.json();
            this._cache.set(cacheKey, data);
            this._cache.set(`matches_cached_${eventKey}`, data);
            return data;
        } catch (error) {
            console.warn('Matches fetch failed:', error);
            return null;
        }
    }

    async _fetchRankingsForEvent(eventKey) {
        if (!this._hasRealApiKey()) {
            return null;
        }

        const cacheKey = `rankings_${eventKey}`;
        if (this._cache.has(cacheKey)) {
            return this._cache.get(cacheKey);
        }

        try {
            const response = await fetch(
                `https://www.thebluealliance.com/api/v3/event/${eventKey}/rankings`,
                { headers: { 'X-TBA-Auth-Key': this._config.tbaapikey } }
            );

            if (!response.ok) {
                if (response.status === 404) {
                    this._cache.set(cacheKey, null);
                    return null;
                }
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            const rankings = data?.rankings ?? null;
            this._cache.set(cacheKey, rankings);
            return rankings;
        } catch (error) {
            console.warn('Rankings fetch failed:', error);
            return null;
        }
    }

    async _fetchMatches() {
        const state = this._state.getState();
        return state.currentMatches || null;
    }

    async _fetchEventData() {
        const state = this._state.getState();
        return state.currentEventData || null;
    }

    async _fetchRankings() {
        const state = this._state.getState();
        return state.currentRankings || null;
    }

    async _fetchTeamSummaryData() {
        const state = this._state.getState();
        return state.currentTeamSummaryData || null;
    }

    clearCache() {
        this._cache.clear();
        this._etagCache.events = null;
        this._etagCache.matches = {};
    }
}