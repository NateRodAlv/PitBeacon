export class StateManager {
    constructor(initialState = {}) {
        this._state = { ...initialState };
        this._listeners = [];
    }

    getState() {
        return { ...this._state };
    }

    update(updates) {
        const changed = [];
        for (const [key, value] of Object.entries(updates)) {
            if (JSON.stringify(this._state[key]) !== JSON.stringify(value)) {
                this._state[key] = value;
                changed.push(key);
            }
        }
        if (changed.length > 0) {
            const newState = this.getState();
            this._listeners.forEach(cb => cb(newState, changed));
        }
        return this;
    }

    subscribe(callback) {
        this._listeners.push(callback);
        return () => {
            const idx = this._listeners.indexOf(callback);
            if (idx >= 0) this._listeners.splice(idx, 1);
        };
    }

    reset() {
        this._state = {};
        this._listeners = [];
        return this;
    }
}