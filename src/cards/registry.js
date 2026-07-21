export class CardRegistry {
    constructor() {
        this._cards = new Map();
        this._listeners = [];
    }

    register(id, definition) {
        if (this._cards.has(id) && !definition.allowOverride) {
            console.warn(`Card "${id}" already registered. Use allowOverride to replace.`);
            return this;
        }
        this._cards.set(id, definition);
        this._notify('register', id);
        return this;
    }

    unregister(id) {
        if (this._cards.has(id)) {
            const def = this._cards.get(id);
            if (def.builtin && !def.allowUnregister) {
                console.warn(`Cannot unregister built-in card "${id}"`);
                return this;
            }
            this._cards.delete(id);
            this._notify('unregister', id);
        }
        return this;
    }

    get(id) {
        return this._cards.get(id) || null;
    }

    has(id) {
        return this._cards.has(id);
    }

    listCards() {
        return Array.from(this._cards.keys());
    }

    listBuiltin() {
        return Array.from(this._cards.entries())
            .filter(([_, def]) => def.builtin)
            .map(([id, _]) => id);
    }

    listDeveloper() {
        return Array.from(this._cards.entries())
            .filter(([_, def]) => def.developer)
            .map(([id, _]) => id);
    }

    getDefinitions() {
        const result = {};
        for (const [id, def] of this._cards) {
            result[id] = { ...def };
        }
        return result;
    }

    subscribe(callback) {
        this._listeners.push(callback);
        return () => {
            const idx = this._listeners.indexOf(callback);
            if (idx >= 0) this._listeners.splice(idx, 1);
        };
    }

    _notify(event, id) {
        const def = this._cards.get(id);
        this._listeners.forEach(cb => cb(event, id, def));
    }
}