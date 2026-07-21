// src/cards/builtin/webcastCard.js
export function createWebcastCard() {
    return {
        id: 'webcast-card',
        label: 'Webcasts',
        icon: 'device-tv',
        lockedAspect: 16/11,
        builtin: true,
        render: (element, state, sdk) => {
            const eventData = state.currentEventData;

            if (!element._webcastCardInitialized) {
                sdk.updateCard(element, 10000, () => {
                    // Keep the current player alive unless the webcast source actually changes.
                });
                element._webcastCardInitialized = true;
            }

            const iframeCache = element._webcastIframeCache || (element._webcastIframeCache = new Map());
            const fullDate = state.fullDate || new Date();
            const todaysWebcasts = [];

            if (eventData?.webcasts?.length) {
                for (const webcast of eventData.webcasts) {
                    if (webcast.date) {
                        const webcastDate = new Date(webcast.date);
                        const today = new Date(fullDate.getFullYear(), fullDate.getMonth(), fullDate.getDate());
                        if (webcastDate.getDate() !== today.getDate()) continue;
                    }

                    let webcastUrl = '';
                    if (webcast.type === 'youtube') {
                        webcastUrl = `https://www.youtube.com/embed/${webcast.channel}`;
                    } else if (webcast.type === 'twitch') {
                        webcastUrl = `https://player.twitch.tv/?channel=${webcast.channel}&parent=${window.location.hostname}`;
                    }

                    if (webcastUrl) {
                        todaysWebcasts.push({
                            url: webcastUrl,
                            type: webcast.type,
                            channel: webcast.channel,
                        });
                    }
                }
            }

            const renderKey = todaysWebcasts.map((webcast) => `${webcast.type}:${webcast.channel}:${webcast.url}`).join('|');
            if (element._webcastRenderKey === renderKey && element._webcastWrapper) {
                return;
            }

            element._webcastRenderKey = renderKey;
            element.innerHTML = '';

            const wrapper = document.createElement('div');
            wrapper.style.cssText = ``;

            if (!todaysWebcasts.length) {
                wrapper.innerHTML = `<p class="inactive" style="text-align:center;color:var(--text-dim);font-style:italic;padding:20px;">No webcasts available.</p>`;
                element.appendChild(wrapper);
                element._webcastWrapper = wrapper;
                return;
            }

            const container = document.createElement('div');
            container.style.cssText = 'display:flex;flex-direction:column;gap:8px;';

            for (const webcast of todaysWebcasts) {
                const card = document.createElement('div');
                card.className = 'webcast-card';
                card.style.cssText = 'border-radius:8px;border:1px solid var(--border-accent);overflow:hidden;';

                let iframe = iframeCache.get(webcast.url);
                if (!iframe) {
                    iframe = document.createElement('iframe');
                    iframe.src = webcast.url;
                    iframe.width = '100%';
                    iframe.height = '225';
                    iframe.frameborder = '0';
                    iframe.allowfullscreen = true;
                    iframe.style.cssText = 'display:block;width:100%;aspect-ratio:16/9;';
                    iframeCache.set(webcast.url, iframe);
                }

                card.appendChild(iframe);
                container.appendChild(card);
            }

            wrapper.appendChild(container);
            element.appendChild(wrapper);
            element._webcastWrapper = wrapper;
        }
    };
}