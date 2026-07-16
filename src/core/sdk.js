// src/core/sdk.js
export class SDK {
    // Shared across all SDK instances (all cards) — this is what makes
    // fetchCustom's caching and in-flight de-dupe work *across* cards, not
    // just within a single card. Two different cards hitting the same
    // endpoint at the same moment will share one network request.
    static _fetchCache = new Map();   // cacheKey -> { timestamp, result }
    static _inFlight = new Map();     // cacheKey -> Promise<result>

    constructor(stateManager, dataSources, audioFiles, config, cardId = null) {
        this._state = stateManager;
        this._dataSources = dataSources;
        this._audioFiles = audioFiles;
        this._config = config;
        this._cardId = cardId;
        this._listeners = [];

        // Memoized so sdk.storage returns a stable object identity across
        // accesses rather than rebuilding get/set/delete closures each time.
        this._storage = this._buildStorage();
    }

    // ─── State Access ──────────────────────────────────────────────────────
    getState() {
        return this._state.getState();
    }
    onStateChange(callback) {
        return this._state.subscribe(callback);
    }

    // ─── Data Fetching (built-in sources) ──────────────────────────────────
    async fetchDataSource(sourceName) {
        return this._dataSources.fetch(sourceName);
    }
    getDataSourceNames() {
        return this._dataSources.getSourceNames();
    }

    // ─── Data Fetching (custom endpoints) ──────────────────────────────────
    //
    // Unlike fetchDataSource, this hits an arbitrary URL the card author
    // supplies (their own scouting endpoint, a Sheets API call, etc).
    //
    // Contract: NEVER throws or rejects. Always resolves with:
    //   { ok: boolean, data: any, error: string|null, status: number|null }
    // so templates can branch on `result.ok` without try/catch. This matters
    // on flaky venue wifi — a card should be able to show "stale/no data"
    // instead of silently breaking.
    //
    // options:
    //   method       'GET' | 'POST' | ...        (default 'GET')
    //   headers      object                       (default {})
    //   body         string|undefined             (ignored for GET/HEAD)
    //   timeoutMs    request timeout               (default 8000)
    //   cacheSeconds reuse a completed result for this many seconds
    //                (default 0 = no caching, only in-flight de-dupe)
    //   parse        (rawText: string) => any      (default JSON.parse)
    //                Receives the raw response body as text always, so it
    //                works for JSON, gviz's wrapped pseudo-JSON, CSV, etc.
    //                If parse throws, that's caught and folded into
    //                { ok: false, error } just like a network failure.
    async fetchCustom(url, options = {}) {
        const {
            method = 'GET',
            headers = {},
            body = null,
            timeoutMs = 8000,
            cacheSeconds = 0,
            parse = null,
        } = options;

        const cacheKey = SDK._buildFetchCacheKey(method, url, body);

        // Short-term result cache (opt-in). Reuses a completed response
        // within the window even after the original request has finished —
        // this is the "two cards, same endpoint, avoid hitting it twice"
        // case when the calls don't happen to overlap in time.
        if (cacheSeconds > 0) {
            const cached = SDK._fetchCache.get(cacheKey);
            if (cached && (Date.now() - cached.timestamp) / 1000 < cacheSeconds) {
                return cached.result;
            }
        }

        // In-flight de-duplication (always on, no staleness tradeoff).
        // If an identical request is already running, piggyback on it
        // instead of firing a second network call.
        if (SDK._inFlight.has(cacheKey)) {
            return SDK._inFlight.get(cacheKey);
        }

        const requestPromise = this._performFetch(
            url,
            { method, headers, body, timeoutMs, parse },
            cacheKey,
            cacheSeconds,
        );
        SDK._inFlight.set(cacheKey, requestPromise);

        try {
            return await requestPromise;
        } finally {
            SDK._inFlight.delete(cacheKey);
        }
    }

    async _performFetch(url, { method, headers, body, timeoutMs, parse }, cacheKey, cacheSeconds) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        let result;
        try {
            const res = await fetch(url, {
                method,
                headers,
                body: method === 'GET' || method === 'HEAD' ? undefined : body,
                signal: controller.signal,
            });

            const rawText = await res.text();

            if (!res.ok) {
                result = { ok: false, data: null, error: `HTTP ${res.status}`, status: res.status };
            } else {
                try {
                    const data = parse
                        ? parse(rawText)
                        : (rawText ? JSON.parse(rawText) : null);
                    result = { ok: true, data, error: null, status: res.status };
                } catch (parseErr) {
                    result = {
                        ok: false,
                        data: null,
                        error: `Parse error: ${parseErr.message}`,
                        status: res.status,
                    };
                }
            }
        } catch (err) {
            const isTimeout = err.name === 'AbortError';
            result = {
                ok: false,
                data: null,
                error: isTimeout
                    ? `Request timed out after ${timeoutMs}ms`
                    : (err.message || 'Network error'),
                status: null,
            };
        } finally {
            clearTimeout(timer);
        }

        if (cacheSeconds > 0 && result.ok) {
            SDK._fetchCache.set(cacheKey, { timestamp: Date.now(), result });
        }

        return result;
    }

    static _buildFetchCacheKey(method, url, body) {
        return `${method}::${url}::${body || ''}`;
    }

    // ─── Alarms ────────────────────────────────────────────────────────────
    //
    // No custom sound uploads on static hosting — sounds are a fixed set of
    // files shipped with the app (whatever keys exist in `audioFiles`).
    // triggerAlarm accepts either:
    //   - a semantic preset ('match' | 'note') that resolves through config
    //     to whichever shipped sound the user configured, or
    //   - a literal sound name (e.g. 'chime') to play directly.
    // Unknown names fall back to 'alarm1' with a console warning rather than
    // silently doing nothing.
    triggerAlarm(nameOrPreset) {
        const presetMap = {
            match: this._config.matchAlarmSound || 'alarm1',
            note: this._config.noteAlarmSound || 'alarm1',
        };

        let soundName = presetMap[nameOrPreset] || nameOrPreset || 'alarm1';

        if (!this._audioFiles[soundName]) {
            console.warn(`triggerAlarm: unknown sound "${soundName}", falling back to alarm1`);
            soundName = 'alarm1';
        }

        const audio = this._audioFiles[soundName];
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(err => console.warn('Audio play failed:', err));
        }
        return this;
    }

    // Lets a template's config UI render a real dropdown of valid sound
    // names instead of requiring the card author to guess exact filenames.
    getAlarmSounds() {
        return Object.keys(this._audioFiles);
    }

    // ─── Notifications ────────────────────────────────────────────────────
    // Distinct from triggerAlarm on purpose: this is a visual/toast message
    // with no sound, while triggerAlarm is audio-only with no message. A
    // card that wants both just calls both.
    notify(message, type = 'message') {
        if (window._pitbeaconNotify) {
            window._pitbeaconNotify(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
        return this;
    }

    // ─── Per-card Storage ──────────────────────────────────────────────────
    //
    // Scoped by cardId so two cards' keys can never collide. Backed by
    // localStorage on the main-page context (this class runs in the parent
    // page, not inside a card's sandboxed iframe, so there's no sandbox
    // storage-access restriction here — only the bridge forwarding calls
    // in from the sandbox needs to exist for cards to actually reach this).
    get storage() {
        return this._storage;
    }

    _buildStorage() {
        const namespace = `pitbeaconCardStorage:${this._cardId || 'global'}:`;
        return {
            get: (key) => {
                try {
                    const raw = window.localStorage.getItem(namespace + key);
                    return raw === null ? null : JSON.parse(raw);
                } catch (err) {
                    console.warn('sdk.storage.get failed:', err);
                    return null;
                }
            },
            set: (key, value) => {
                try {
                    window.localStorage.setItem(namespace + key, JSON.stringify(value));
                    return true;
                } catch (err) {
                    console.warn('sdk.storage.set failed:', err);
                    return false;
                }
            },
            delete: (key) => {
                try {
                    window.localStorage.removeItem(namespace + key);
                    return true;
                } catch (err) {
                    console.warn('sdk.storage.delete failed:', err);
                    return false;
                }
            },
        };
    }

    // ─── Config Access ────────────────────────────────────────────────────
    // Returns a curated subset rather than the raw config object, so future
    // internal config keys don't automatically leak to card authors just by
    // being added to _config.
    getConfig() {
        const exposedKeys = ['teamNumber', 'matchAlarmSound', 'noteAlarmSound', 'eventName'];
        const safeConfig = {};
        for (const key of exposedKeys) {
            if (key in this._config) safeConfig[key] = this._config[key];
        }
        return safeConfig;
    }

}