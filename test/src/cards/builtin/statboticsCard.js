// src/cards/builtin/statboticsCard.js
export function createStatboticsCard() {
  return {
    id: "statbotics-card",
    label: "Team Overview",
    icon: "chart-bar",
    builtin: true,
    render: async (element, state, sdk) => {
      const teamNumber = sdk.getConfig('teamNumber');
      const year = new Date().getFullYear();
      const eventName = state.currentEventData?.name || "Current Event";
      const wrapper = element.querySelector(".statbotics-shell");
      if (!wrapper) {
        const wrapper = document.createElement("div");
        wrapper.style.cssText = `
                background: var(--bg-surface);
                border-radius: 8px;
                border: 1px solid var(--border);
                padding: 10px 12px;
                height: 100%;
                overflow: auto;
            `;
        wrapper.className = "statbotics-shell";
        element.appendChild(wrapper);
        wrapper.innerHTML = `
                <div class="statbotics-shell">
                    <div class="pit-header">
                        <span class="pit-title"><i class="ti ti-chart-bar"></i> Team Overview</span>
                        <button class="pit-add-btn" id="statboticsRefresh">↻ Refresh</button>
                    </div>
                    <div class="statbotics-body" id="statboticsBody">
                        <div class="statbotics-loading">Loading…</div>
                    </div>
                </div>
            `;
      }

      const body = element.querySelector("#statboticsBody");
      const refreshBtn = element.querySelector("#statboticsRefresh");

      const loadData = async () => {
        body.innerHTML = `<div class="statbotics-loading">Loading…</div>`;
        try {
          const teamSummaryData = await sdk.refreshTeamData();
          const summary = teamSummaryData?.teamSummary || null;

          if (!summary) {
            throw new Error("No The Blue Alliance data returned.");
          }

          body.innerHTML = renderTeamSummaryHTML(summary, teamNumber, year, eventName);
        } catch (err) {
          body.innerHTML = `<div class="statbotics-error">
                        <p>⚠ Could not load Team Overview data.</p>
                        <p class="statbotics-hint">${err.message}</p>
                    </div>`;
        }
      };

      // render() gets re-invoked on every full-grid re-render, not just once.
      // Previously this added a new click listener each time without ever
      // removing the old one, so every re-render stacked another listener on
      // the same button -- each stale one still firing (and fetching) on
      // click long after it should have been replaced.
      if (element._statboticsClickHandler) {
        refreshBtn.removeEventListener("click", element._statboticsClickHandler);
      }
      element._statboticsClickHandler = () => loadData();
      refreshBtn.addEventListener("click", element._statboticsClickHandler);

      // Likewise, only auto-fetch on first mount / when the identifying
      // config actually changes -- not on every re-render this card happens
      // to get swept up in.
      const loadKey = `${teamNumber}:${eventName}`;
      if (element._statboticsLoadKey !== loadKey) {
        element._statboticsLoadKey = loadKey;
        await loadData();
      }

      function renderTeamSummaryHTML(summary, teamNum, yr, eventDisplayName) {
        const eventRank = summary?.eventRank ?? "–";
        const wins = summary?.eventRecord?.wins ?? "–";
        const losses = summary?.eventRecord?.losses ?? "–";
        const ties = summary?.eventRecord?.ties ?? "–";
        const winrate = summary?.winRate ?? "–";
        const seasonEvents = summary?.seasonEventCount ?? "–";
        const currentEventName = eventDisplayName || summary?.eventName || "Current Event";

        return `
                    <div class="sb-header-team">
                        <span class="sb-team-num">${teamNum}</span>
                        <span class="sb-year-badge">${yr}</span>
                    </div>
                    <div class="sb-section-title">Current Event</div>
                    <div class="sb-stat-row">
                        <span class="sb-label">Event</span>
                        <span class="sb-value">${currentEventName}</span>
                    </div>
                    <div class="sb-stat-row">
                        <span class="sb-label">Event Rank</span>
                        <span class="sb-value sb-accent">${eventRank}</span>
                    </div>
                    <div class="sb-divider"></div>
                    <div class="sb-section-title">Event Record</div>
                    <div class="sb-stat-row">
                        <span class="sb-label">W / L / T</span>
                        <span class="sb-value">${wins} – ${losses} – ${ties}</span>
                    </div>
                    <div class="sb-stat-row">
                        <span class="sb-label">Win Rate</span>
                        <span class="sb-value sb-accent">${winrate}</span>
                    </div>
                    <div class="sb-divider"></div>
                    <div class="sb-section-title">Season Snapshot</div>
                    <div class="sb-stat-row">
                        <span class="sb-label">Events This Year</span>
                        <span class="sb-value">${seasonEvents}</span>
                    </div>
                    <div class="sb-footer">
                        <a href="https://www.thebluealliance.com/team/${teamNum}" target="_blank" class="sb-link">View on The Blue Alliance ↗</a>
                    </div>
                `;
      }
    },
  };
}
