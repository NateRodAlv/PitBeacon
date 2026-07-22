export class SDK {
  static _fetchCache = new Map();
  static _inFlight = new Map();

  constructor(stateManager, dataSources, audioFiles, config, cardId = null) {
    this._state = stateManager;
    this._dataSources = dataSources;
    this._audioFiles = audioFiles;
    this._config = config;
    this._cardId = cardId;
    this._listeners = [];

    this._storage = this._buildStorage();
  }

  getState() {
    return this._state.getState();
  }
  onStateChange(callback) {
    return this._state.subscribe(callback);
  }

  async fetchDataSource(sourceName) {
    return this._dataSources.fetch(sourceName);
  }
  getDataSourceNames() {
    return this._dataSources.getSourceNames();
  }

  async refreshTeamData() {
    if (typeof window.pitbeaconRefreshTeamData === "function") {
      return window.pitbeaconRefreshTeamData();
    }
    return null;
  }

  updateCard(element, interval, refreshCallback = null, compareFn = null) {
    element.selfRefresh = true;
    if (!element || typeof interval !== "number" || interval <= 0) return;

    const sameConfig =
      element._cardTimer &&
      element._cardTimerInterval === interval &&
      element._cardRefreshCallback === refreshCallback &&
      element._cardCompareFn === compareFn;

    if (sameConfig) return;

    if (element._cardTimer) {
      clearInterval(element._cardTimer);
    }

    element._cardTimerInterval = interval;
    element._cardRefreshCallback = refreshCallback;
    element._cardCompareFn = compareFn;
    element._cardTimer = setInterval(() => {
      if (!element.isConnected) return;

      const latestState = this.getState();
      if (!latestState) return;

      try {
        const snapshot = compareFn ? compareFn(latestState, this) : latestState;
        const serialized = JSON.stringify(snapshot);
        const previousSerialized = element._lastCardSnapshot;

        if (previousSerialized === serialized) {
          return;
        }

        element._lastCardSnapshot = serialized;

        if (typeof refreshCallback === "function") {
          refreshCallback(element, latestState, this);
        } else if (window._pitbeaconRender) {
          window._pitbeaconRender();
        } else {
          element.innerHTML = "";
        }
      } catch (err) {
        console.error("Card refresh failed:", err);
      }
    }, interval);
  }

  async fetchCustom(url, options = {}) {
    const {
      method = "GET",
      headers = {},
      body = null,
      timeoutMs = 8000,
      cacheSeconds = 0,
      parse = null,
    } = options;

    const cacheKey = SDK._buildFetchCacheKey(method, url, body);

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

  async _performFetch(
    url,
    { method, headers, body, timeoutMs, parse },
    cacheKey,
    cacheSeconds,
  ) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let result;
    try {
      const res = await fetch(url, {
        method,
        headers,
        body: method === "GET" || method === "HEAD" ? undefined : body,
        signal: controller.signal,
      });

      const rawText = await res.text();

      if (!res.ok) {
        result = {
          ok: false,
          data: null,
          error: `HTTP ${res.status}`,
          status: res.status,
        };
      } else {
        try {
          const data = parse
            ? parse(rawText)
            : rawText
              ? JSON.parse(rawText)
              : null;
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
      const isTimeout = err.name === "AbortError";
      result = {
        ok: false,
        data: null,
        error: isTimeout
          ? `Request timed out after ${timeoutMs}ms`
          : err.message || "Network error",
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
    return `${method}::${url}::${body || ""}`;
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
      match: this._config.matchAlarmSound || "alarm1",
      note: this._config.noteAlarmSound || "alarm1",
    };

    let soundName = presetMap[nameOrPreset] || nameOrPreset || "alarm1";

    if (!this._audioFiles[soundName]) {
      console.warn(
        `triggerAlarm: unknown sound "${soundName}", falling back to alarm1`,
      );
      soundName = "alarm1";
    }

    const audio = this._audioFiles[soundName];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch((err) => console.warn("Audio play failed:", err));
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
  notify(message, type = "message") {
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
    const namespace = `pitbeaconCardStorage:${this._cardId || "global"}:`;
    return {
      get: (key) => {
        try {
          const raw = window.localStorage.getItem(namespace + key);
          return raw === null ? null : JSON.parse(raw);
        } catch (err) {
          console.warn("sdk.storage.get failed:", err);
          return null;
        }
      },
      set: (key, value) => {
        try {
          window.localStorage.setItem(namespace + key, JSON.stringify(value));
          return true;
        } catch (err) {
          console.warn("sdk.storage.set failed:", err);
          return false;
        }
      },
      delete: (key) => {
        try {
          window.localStorage.removeItem(namespace + key);
          return true;
        } catch (err) {
          console.warn("sdk.storage.delete failed:", err);
          return false;
        }
      },
    };
  }

  // ─── Config Access ────────────────────────────────────────────────────
  // Returns a curated subset rather than the raw config object, so future
  // internal config keys don't automatically leak to card authors just by
  // being added to _config.
  getConfig(key) {
    const exposedKeys = [
      "teamNumber",
      "matchAlarmSound",
      "noteAlarmSound",
      "eventName",
    ];

    // 1. If no key is provided, return the filtered object
    if (key === undefined) {
      const safeConfig = {};
      for (const k of exposedKeys) {
        if (k in this._config) safeConfig[k] = this._config[k];
      }
      return safeConfig; // Return the actual object
    }

    // 2. If a specific valid key is requested, return its raw value
    if (exposedKeys.includes(key)) {
      return this._config[key];
    }

    // 3. Return null if the key is hidden or doesn't exist
    return null;
  }
}
