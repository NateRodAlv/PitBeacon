import { setCardAutoScroll } from "./autoScroll.js";

function formatValue(value, digits = 1) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "–";
  return value.toFixed(digits).replace(/\.?0+$/, "");
}

function appendRow(container, label, value, accent = false) {
  const row = document.createElement("div");
  row.className = "stats-row";

  const labelElement = document.createElement("span");
  labelElement.className = "stats-label";
  labelElement.textContent = label;

  const valueElement = document.createElement("span");
  valueElement.className = accent ? "stats-value stats-accent" : "stats-value";
  valueElement.textContent = value;

  row.append(labelElement, valueElement);
  container.appendChild(row);
}

function appendSection(container, title) {
  const heading = document.createElement("h3");
  heading.className = "stats-section-title";
  heading.textContent = title;
  container.appendChild(heading);
}

function setMessage(container, message, isError = false) {
  setCardAutoScroll(container, false);
  container.replaceChildren();
  const text = document.createElement("p");
  text.className = isError ? "stats-error" : "stats-message";
  text.textContent = message;
  container.appendChild(text);
}

function renderSeason(container, data, teamNumber, year) {
  container.replaceChildren();

  const heading = document.createElement("div");
  heading.className = "stats-team-heading";
  const team = document.createElement("strong");
  team.textContent = `Team ${teamNumber}`;
  const season = document.createElement("span");
  season.className = "stats-year";
  season.textContent = String(data.year || year);
  heading.append(team, season);
  container.appendChild(heading);

  const primary = document.createElement("div");
  primary.className = "stats-primary";
  const primaryLabel = document.createElement("span");
  primaryLabel.className = "stats-label";
  primaryLabel.textContent = "Match13 expected points (xP)";
  const primaryValue = document.createElement("strong");
  primaryValue.className = "stats-primary-value";
  primaryValue.textContent = formatValue(data.xp);
  primary.append(primaryLabel, primaryValue);
  container.appendChild(primary);

  appendSection(container, "Season ranking");
  appendRow(container, "Normalized xP", formatValue(data.normXp));
  appendRow(container, "Match13 rank", data.rank ? `#${data.rank}` : "–", true);
  appendRow(
    container,
    "Percentile",
    typeof data.percentile === "number"
      ? `${formatValue(data.percentile)}%`
      : "–",
    true,
  );

  appendSection(container, "Expected scoring");
  appendRow(container, "Autonomous", formatValue(data.xAuto));
  appendRow(container, "Teleoperated", formatValue(data.xTele));
  appendRow(container, "Endgame", formatValue(data.xEnd));

  appendSection(container, "Comparison ratings");
  appendRow(container, "EPA", formatValue(data.epa));
  appendRow(container, "OPR", formatValue(data.opr));
  appendRow(container, "DPR", formatValue(data.dpr));

  const components = Object.entries(data.components || {});
  if (components.length) {
    appendSection(container, "Estimated game pieces");
    for (const [name, value] of components) {
      appendRow(container, name, formatValue(value));
    }
  }

  const footer = document.createElement("div");
  footer.className = "stats-footer";
  const link = document.createElement("a");
  link.className = "stats-link";
  link.href = "https://www.match13.com/docs/api";
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "About Match13 ratings ↗";
  footer.appendChild(link);
  container.appendChild(footer);
}

export function createStatsCard() {
  return {
    id: "stats-card",
    label: "Team Stats",
    icon: "chart-bar",
    builtin: true,
    settings: {
      autoScroll: {
        type: "checkbox",
        label: "Auto-scroll team stats",
        default: false,
      },
      autoScrollSpeed: {
        type: "number",
        label: "Scroll speed (px/sec)",
        default: 30,
        min: 30,
        max: 120,
        step: 1,
      },
    },
    render: async (element, state, sdk) => {
      if (!element._statsCardInitialized) {
        element.innerHTML = `
          <div class="stats-shell">
            <div class="pit-header">
              <span class="pit-title"><i class="ti ti-chart-bar"></i> Team Stats</span>
              <button class="pit-add-btn" type="button">↻ Refresh</button>
            </div>
            <div class="stats-body"></div>
          </div>
        `;
        element._statsCardInitialized = true;
      }

      const body = element.querySelector(".stats-body");
      const refreshButton = element.querySelector(".pit-add-btn");
      const teamNumber = String(sdk.getConfig("teamNumber") || "").trim();
      const cardSettings = sdk.getCardSettings("stats-card", {
        autoScroll: false,
        autoScrollSpeed: 30,
      });
      setCardAutoScroll(
        body,
        cardSettings.autoScroll,
        cardSettings.autoScrollSpeed,
      );
      const match13ApiKey = String(sdk.getConfig("match13apikey") || "")
        .trim()
        .replace(/^Bearer\s+/i, "");
      const year = state.fullDate instanceof Date
        ? state.fullDate.getFullYear()
        : new Date().getFullYear();

      const loadData = async () => {
        if (!/^\d+$/.test(teamNumber)) {
          setMessage(body, "Enter a valid team number in Settings.", true);
          return;
        }
        if (!match13ApiKey) {
          setMessage(body, "Add your Match13 API key in Settings to load team stats.");
          return;
        }
        if (!match13ApiKey.startsWith("m13_live_")) {
          setMessage(body, "Match13 API keys should start with m13_live_. Check that the complete key was copied into Settings.", true);
          return;
        }

        refreshButton.disabled = true;
        setMessage(body, "Loading Match13 team stats…");
        try {
          const response = await fetch(
            `https://actions.match13.com/v1/teams/${teamNumber}/years/${year}`,
            { headers: { Authorization: `Bearer ${match13ApiKey}` } },
          );
          const responseText = await response.text();
          let responseData = null;
          if (responseText) {
            try {
              responseData = JSON.parse(responseText);
            } catch {
              if (response.ok) {
                throw new Error("Match13 returned an invalid response.");
              }
            }
          }
          const apiDetail =
            responseData?.detail || responseData?.title || responseData?.message;

          if (response.status === 404) {
            throw new Error(`Match13 has no season data for team ${teamNumber} in ${year}.`);
          }
          if (response.status === 401 || response.status === 403) {
            throw new Error(
              `Match13 rejected the API key (HTTP ${response.status}). The request uses the required Bearer authorization format. Verify the complete, active Match13 key from match13.com/account and save Settings.${apiDetail ? ` API detail: ${apiDetail}` : ""}`,
            );
          }
          if (response.status === 429) {
            throw new Error("Match13 rate limit reached. Try again later.");
          }
          if (!response.ok) {
            throw new Error(
              `Match13 request failed (HTTP ${response.status}).${apiDetail ? ` ${apiDetail}` : ""}`,
            );
          }

          if (!responseData || typeof responseData !== "object" || Array.isArray(responseData)) {
            throw new Error("Match13 returned an invalid team stats response.");
          }
          renderSeason(body, responseData, teamNumber, year);
          setCardAutoScroll(
            body,
            cardSettings.autoScroll,
            cardSettings.autoScrollSpeed,
          );
        } catch (error) {
          const message = error instanceof TypeError
            ? `Could not reach Match13 from this browser. Its API does not allow direct cross-origin requests; a CORS-enabled proxy is required. ${error.message}`
            : error.message || "An unexpected error occurred.";
          setMessage(body, message, true);
        } finally {
          refreshButton.disabled = false;
        }
      };

      refreshButton.onclick = loadData;
      const loadKey = `${teamNumber}:${year}:${match13ApiKey}`;
      if (element._statsLoadKey !== loadKey) {
        element._statsLoadKey = loadKey;
        await loadData();
      }
    },
  };
}
