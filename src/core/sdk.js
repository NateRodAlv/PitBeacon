// src/core/sdk.js
export class SDK {
    constructor(stateManager, dataSources, audioFiles, config) {
        this._state = stateManager;
        this._dataSources = dataSources;
        this._audioFiles = audioFiles;
        this._config = config;
        this._listeners = [];
    }

    // ─── State Access ──────────────────────────────────────────────────────

    getState() {
        return this._state.getState();
    }

    onStateChange(callback) {
        return this._state.subscribe(callback);
    }

    // ─── Data Fetching ────────────────────────────────────────────────────

    async fetchDataSource(sourceName) {
        return this._dataSources.fetch(sourceName);
    }

    getDataSourceNames() {
        return this._dataSources.getSourceNames();
    }

    // ─── Alarms ────────────────────────────────────────────────────────────

    triggerAlarm(type) {
        const soundMap = {
            match: this._config.matchAlarmSound || 'alarm1',
            note: this._config.noteAlarmSound || 'alarm1',
            custom: 'alarm1'
        };
        const soundName = soundMap[type] || 'alarm1';
        const audio = this._audioFiles[soundName];
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(err => console.warn('Audio play failed:', err));
        }
        return this;
    }

    // ─── Notifications ────────────────────────────────────────────────────

    notify(message, type = 'message') {
        // Global notification handler - will be set by main app
        if (window._pitbeaconNotify) {
            window._pitbeaconNotify(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
        return this;
    }

    // ─── Config Access ────────────────────────────────────────────────────

    getConfig() {
        return { ...this._config };
    }

    // ─── Team Info ────────────────────────────────────────────────────────

    getTeamNumber() {
        return this._config.teamNumber;
    }
}