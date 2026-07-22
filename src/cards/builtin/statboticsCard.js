// src/cards/builtin/statboticsCard.js
export function createStatboticsCard() {
  return {
    id: "statbotics-card",
    label: "Statbotics",
    icon: "chart-bar",
    builtin: true,
    render: async (element, state, sdk) => {
      const teamNumber = sdk.getConfig('teamNumber');
      const year = new Date().getFullYear();
      const eventKey = state.currentEventData?.key;
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
                        <span class="pit-title"><i class="ti ti-chart-bar"></i> Statbotics</span>
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
          const statboticsData = await sdk.refreshStatboticsData();
          const teamData = statboticsData?.teamData || null;
          const eventData = statboticsData?.eventData || null;

          if (!teamData && !eventData) {
            throw new Error("No Statbotics data returned.");
          }

          body.innerHTML = renderStatboticsHTML(
            teamData,
            eventData,
            teamNumber,
            year,
          );
        } catch (err) {
          body.innerHTML = `<div class="statbotics-error">
                        <p>⚠ Could not load Statbotics data.</p>
                        <p class="statbotics-hint">${err.message}</p>
                    </div>`;
        }
      };

      refreshBtn.addEventListener("click", () => {
        loadData();
      });
      await loadData();

      function renderStatboticsHTML(team, event, teamNum, yr) {
        const epa = team?.epa?.total_points;
        const epaRank = team?.epa?.ranks?.total?.rank;
        const epaPercentile = team?.epa?.ranks?.total?.percentile;
        const wins = team?.record?.wins ?? "–";
        const losses = team?.record?.losses ?? "–";
        const ties = team?.record?.ties ?? "–";
        const winrate =
          team?.record?.count > 0
            ? ((team.record.wins / team.record.count) * 100).toFixed(1) + "%"
            : "–";

        const autoEpa = team?.epa?.breakdown?.auto_points;
        const teleopEpa = team?.epa?.breakdown?.teleop_points;
        const endgameEpa = team?.epa?.breakdown?.endgame_points;

        const fmtEpa = (v) => (v != null ? Number(v).toFixed(1) : "–");
        const fmtPct = (p) =>
          p != null ? (p * 100).toFixed(0) + "th %ile" : "";

        let eventBlock = "";
        if (event) {
          const eRank = event?.epa?.ranks?.total?.rank ?? "–";
          const eTotal = event?.epa?.total_points;
          eventBlock = `
                        <div class="sb-divider"></div>
                        <div class="sb-section-title">This Event</div>
                        <div class="sb-stat-row">
                            <span class="sb-label">EPA</span>
                            <span class="sb-value sb-accent">${fmtEpa(eTotal)}</span>
                        </div>
                        <div class="sb-stat-row">
                            <span class="sb-label">Event Rank</span>
                            <span class="sb-value">${eRank}</span>
                        </div>
                    `;
        }

        return `
                    <div class="sb-header-team">
                        <span class="sb-team-num">${teamNum}</span>
                        <span class="sb-year-badge">${yr}</span>
                    </div>
                    <div class="sb-section-title">Season EPA</div>
                    <div class="sb-epa-row">
                        <div class="sb-epa-block">
                            <div class="sb-epa-val">${fmtEpa(epa?.mean ?? epa)}</div>
                            <div class="sb-epa-label">Total EPA</div>
                            ${epaRank != null ? `<div class="sb-epa-sub">Rank #${epaRank} ${fmtPct(epaPercentile)}</div>` : ""}
                        </div>
                    </div>
                    <div class="sb-breakdown">
                        <div class="sb-breakdown-item">
                            <span class="sb-breakdown-val auto">${fmtEpa(autoEpa?.mean ?? autoEpa)}</span>
                            <span class="sb-breakdown-label">Auto</span>
                        </div>
                        <div class="sb-breakdown-item">
                            <span class="sb-breakdown-val teleop">${fmtEpa(teleopEpa?.mean ?? teleopEpa)}</span>
                            <span class="sb-breakdown-label">Teleop</span>
                        </div>
                        <div class="sb-breakdown-item">
                            <span class="sb-breakdown-val endgame">${fmtEpa(endgameEpa?.mean ?? endgameEpa)}</span>
                            <span class="sb-breakdown-label">Endgame</span>
                        </div>
                    </div>
                    <div class="sb-divider"></div>
                    <div class="sb-section-title">Season Record</div>
                    <div class="sb-stat-row">
                        <span class="sb-label">W / L / T</span>
                        <span class="sb-value">${wins} – ${losses} – ${ties}</span>
                    </div>
                    <div class="sb-stat-row">
                        <span class="sb-label">Win Rate</span>
                        <span class="sb-value sb-accent">${winrate}</span>
                    </div>
                    ${eventBlock}
                    <div class="sb-footer">
                        <a href="https://statbotics.io/team/${teamNum}" target="_blank" class="sb-link">View on Statbotics ↗</a>
                    </div>
                `;
      }
    },
  };
}
