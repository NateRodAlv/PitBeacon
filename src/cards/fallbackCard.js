// src/cards/fallbackCard.js
export const FallbackCard = {
    id: '__fallback__',
    label: '⚠ Missing Card',
    icon: 'alert-circle',
    builtin: true,
    render: (element, state, sdk, cardId) => {
        // cardId is the specific fallback instance ID
        element.innerHTML = `
            <div class="fallback-card">
                <div class="fallback-icon">⚠</div>
                <div class="fallback-title">Missing Card</div>
                <div class="fallback-id">${cardId}</div>
                <div class="fallback-hint">This card was not found in the registry.</div>
                <button class="fallback-remove" data-card="${cardId}">Remove from layout</button>
            </div>
        `;
        const removeBtn = element.querySelector('.fallback-remove');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                const config = sdk.getConfig();
                if (config.layout) {
                    delete config.layout[cardId];
                    localStorage.setItem('layout', JSON.stringify(config.layout));
                    if (window._pitbeaconRender) {
                        window._pitbeaconRender();
                    }
                }
            });
        }
    }
};