// src/cards/validator.js
export class LayoutValidator {
    constructor(registry) {
        this._registry = registry;
    }

    validate(layout, gridCols = 3, gridRows = 3) {
        const errors = [];
        const warnings = [];
        const fallbackInjections = [];

        // Check each card in the layout
        for (const [cardId, pos] of Object.entries(layout)) {
            // Validate position
            if (!this._validatePosition(pos, gridCols, gridRows)) {
                errors.push(`Card "${cardId}" has invalid position (${pos.x},${pos.y}) ${pos.width}×${pos.height}`);
            }

            // Check if card exists in registry
            if (!this._registry.has(cardId)) {
                warnings.push(`Card "${cardId}" not found in registry`);
                // Inject fallback
                const replacementId = `__fallback_${cardId}`;
                layout[replacementId] = { ...pos };
                delete layout[cardId];
                fallbackInjections.push({
                    originalId: cardId,
                    replacementId: replacementId,
                    position: pos,
                });
            }
        }

        // Check for overlapping cards
        const overlaps = this._findOverlaps(layout);
        if (overlaps.length > 0) {
            warnings.push(`Overlapping cards: ${overlaps.join(', ')}`);
        }

        // Register fallback cards if needed
        for (const inj of fallbackInjections) {
            if (!this._registry.has(inj.replacementId)) {
                this._registry.register(inj.replacementId, {
                    id: inj.replacementId,
                    label: `⚠ Missing: ${inj.originalId}`,
                    icon: 'alert-circle',
                    builtin: false,
                    fallback: true,
                    render: (element, state, sdk) => {
                        element.innerHTML = `
                            <div class="fallback-card">
                                <div class="fallback-icon">⚠</div>
                                <div class="fallback-title">Missing Card</div>
                                <div class="fallback-id">${inj.originalId}</div>
                                <div class="fallback-hint">This card was not found in the registry.</div>
                                <div class="fallback-actions">
                                    <button class="fallback-remove" data-card="${inj.replacementId}">Remove from layout</button>
                                </div>
                            </div>
                        `;
                        const removeBtn = element.querySelector('.fallback-remove');
                        if (removeBtn) {
                            removeBtn.addEventListener('click', () => {
                                const layout = sdk.getConfig().layout || {};
                                delete layout[inj.replacementId];
                                localStorage.setItem('layout', JSON.stringify(layout));
                                if (window._pitbeaconRender) {
                                    window._pitbeaconRender();
                                }
                            });
                        }
                    }
                });
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings,
            fallbackInjections,
            layout: { ...layout },
        };
    }

    _validatePosition(pos, cols, rows) {
        const { x, y, width, height } = pos;
        if (x < 0 || y < 0 || width < 1 || height < 1) return false;
        if (x + width > cols) return false;
        if (y + height > rows) return false;
        return true;
    }

    _findOverlaps(layout) {
        const overlaps = [];
        const ids = Object.keys(layout);
        for (let i = 0; i < ids.length; i++) {
            for (let j = i + 1; j < ids.length; j++) {
                if (this._rectsOverlap(layout[ids[i]], layout[ids[j]])) {
                    overlaps.push(`${ids[i]} ↔ ${ids[j]}`);
                }
            }
        }
        return overlaps;
    }

    _rectsOverlap(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }
}