// src/ui/layoutRenderer.js
export class LayoutRenderer {
    constructor(registry, validator, stateManager, dataSources, sdk) {
        this._registry = registry;
        this._validator = validator;
        this._state = stateManager;
        this._dataSources = dataSources;
        this._sdk = sdk;
        this._renderedCards = new Map();
        
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
    container.style.height = 'calc(100vh - 4.5rem)';
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

    // Store config for global render trigger
    window._pitbeaconConfig = config;
}

    updateCards(state) {
        // Update all rendered cards with new state
        for (const [cardId, element] of this._renderedCards) {
            const def = this._registry.get(cardId);
            if (def && def.render && element.isConnected) {
                try {
                    def.render(element, state, this._sdk, cardId);
                } catch (err) {
                    console.error(`Error updating card "${cardId}":`, err);
                }
            }
        }
    }

    getCardElement(cardId) {
        return this._renderedCards.get(cardId) || null;
    }
}