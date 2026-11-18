// src/ui/layoutRenderer.js
export class LayoutRenderer {
    constructor(registry, validator, stateManager, dataSources, sdk) {
        this._registry = registry;
        this._validator = validator;
        this._state = stateManager;
        this._dataSources = dataSources;
        this._sdk = sdk;
        this._renderedCards = new Map();
        // Status dots live beside each card (not inside it) so cards can rebuild their own content freely.
        this._dots = new Map();
        
        window._pitbeaconRender = () => this.render(
            window._pitbeaconConfig || {},
            document.getElementById('container')
        );
        window._pitbeaconNotify = (msg, type) => {
            if (window.displayMessage) window.displayMessage(msg, type);
        };
    }

render(config, container) {
    if (!container) return;

    const gridCols = config.gridCols || config.gridSize || 3;
    const gridRows = config.gridRows || config.gridSize || 3;
    const layout = config.layout || {};
    const hiddenCards = config.hiddenSections || [];
    const validation = this._validator.validate(layout, gridCols, gridRows);
    if (validation.errors.length > 0) {
        console.warn('Layout validation errors:', validation.errors);
    }
    if (validation.warnings.length > 0) {
        console.warn('Layout warnings:', validation.warnings);
    }

    const validatedLayout = validation.layout;

    container.style.display = 'grid';
    container.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;
    container.style.gridTemplateRows = `repeat(${gridRows}, 1fr)`;
    container.style.gap = '12px';
    container.style.height = 'calc(100vh - var(--header-height, 4.5rem) - var(--banner-height, 0px))';
    container.style.padding = '12px';
    container.style.overflow = 'auto';
    container.style.background = 'transparent';

    const renderedIds = new Set();
    const state = this._state.getState();

    for (const [cardId, pos] of Object.entries(validatedLayout)) {
        if (hiddenCards.includes(cardId)) continue;

        const def = this._registry.get(cardId);
        if (!def) {
            console.warn(`Card "${cardId}" not found in registry`);
            continue;
        }

        renderedIds.add(cardId);

        let element = this._renderedCards.get(cardId);
        if (!element) {
            element = document.createElement('div');
            element.id = `card-${cardId}`;
            element.className = 'card-container';
            element.style.overflow = 'auto';
            element.style.minHeight = '0';
            // Card containers have their own background via CSS
            container.appendChild(element);
            this._renderedCards.set(cardId, element);
        }

        element.style.gridColumn = `${pos.x + 1} / span ${pos.width}`;
        element.style.gridRow = `${pos.y + 1} / span ${pos.height}`;
        element.style.display = '';
        this._syncDot(cardId, def, pos, container, config.showCardStatusDots !== false);

        if (def.render) {
            try {
                def.render(element, state, this._sdk, cardId);
            } catch (err) {
                console.error(`Error rendering card "${cardId}":`, err);
                element.innerHTML = `
                    <div class="card-error">
                        <span class="card-error-icon">⚠</span>
                        <span class="card-error-msg">Error rendering card</span>
                        <span class="card-error-detail">${err.message}</span>
                    </div>
                `;
            }
        }
    }

    // Remove cards that are no longer in the layout
    for (const [cardId, element] of this._renderedCards) {
        if (!renderedIds.has(cardId) && element.parentNode) {
            element.remove();
            this._renderedCards.delete(cardId);
        }
    }
    for (const [cardId, dot] of this._dots) {
        if (!renderedIds.has(cardId)) {
            dot.remove();
            this._dots.delete(cardId);
        }
    }

    // Store config for global render trigger
    window._pitbeaconConfig = config;
    window.dispatchEvent(new CustomEvent('pitbeacon:layout-rendered'));
}

    _syncDot(cardId, def, pos, container, showStatusDots) {
        let dot = this._dots.get(cardId);
        if (!showStatusDots || !def.builtin || def.statusDot === false) {
            if (dot) { dot.remove(); this._dots.delete(cardId); }
            return;
        }
        if (!dot) {
            dot = document.createElement('span');
            dot.className = 'card-status-dot';
            dot.dataset.cardId = cardId;
            dot.dataset.color = 'grey';
            dot.setAttribute('role', 'img');
            dot.tabIndex = 0;
            container.appendChild(dot);
            this._dots.set(cardId, dot);
        }
        // Same grid cell as the card, pinned to its top-right corner by CSS.
        dot.style.gridColumn = `${pos.x + 1} / span ${pos.width}`;
        dot.style.gridRow = `${pos.y + 1} / span ${pos.height}`;
    }

    /** [cardId, dotElement] pairs for every built-in card currently on screen. */
    getDots() {
        return [...this._dots.entries()];
    }

    updateCards(state) {
        // Update all rendered cards with new state
        for (const [cardId, element] of this._renderedCards) {
            const def = this._registry.get(cardId);
            if (!def || !def.render || !element.isConnected) continue;

            // Developer Editor cards' render() is just a cheap postMessage
            // relay of fresh state into the sandboxed iframe (see
            // developerCardRuntime._renderDevCard's fast path) — unlike
            // built-in cards, it does none of the expensive DOM rebuilding
            // selfRefresh exists to let a card skip. A dev card that calls
            // sdk.updateCard() still needs this relay to keep its own
            // internal sdk._state cache fresh, since that's the only thing
            // its custom interval has to diff against — skipping it here
            // would freeze that card's state forever the moment it opts in
            // to a custom refresh cadence.
            if (element.selfRefresh && !def.developer) continue;

            try {
                def.render(element, state, this._sdk, cardId);
            } catch (err) {
                console.error(`Error updating card "${cardId}":`, err);
            }
        }
    }

    getCardElement(cardId) {
        return this._renderedCards.get(cardId) || null;
    }
}