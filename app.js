import { config } from "./config.js";
import { StateManager } from "./src/core/state.js";
import { SDK } from "./src/core/sdk.js";
import { CardRegistry } from "./src/cards/registry.js";
import { LayoutValidator } from "./src/cards/validator.js";
import { FallbackCard } from "./src/cards/fallbackCard.js";
import { DeveloperCardRuntime } from "./src/cards/developerCardRuntime.js";
import { DataSourceManager } from "./src/data/sources.js";
import { LayoutRenderer } from "./src/ui/layoutRenderer.js";
import { DocsModal } from "./src/ui/docsModal.js";
import { CardCatalog, detectConfigurableSettings } from "./src/data/cardCatalog.js";

const docsModal = new DocsModal();

const audioFiles = {
  alarm1: new Audio("alarm1.mp3"),
  alarm2: new Audio("alarm2.mp3"),
  alarm3: new Audio("alarm3.mp3"),
  beep: new Audio("beep.mp3"),
};

Object.values(audioFiles).forEach((audio) => {
  audio.onerror = () => console.warn("Audio file failed to load");
});

// Global state
const year = new Date().getFullYear();
let fullDate = new Date();
let pollingInterval = null;
let timeUpdateInterval = null;

// Core setup

const stateManager = new StateManager({
  currentMatches: null,
  currentEventData: null,
  currentRankings: null,
  currentTeamSummaryData: null,
  lastMatchAlertId: null,
  fullDate: fullDate,
  teamNumber: config.teamNumber,
  isTestMode: false,
});

// 2. Card Registry
const registry = new CardRegistry();

// 3. Data Source Manager
const dataSources = new DataSourceManager(config, stateManager);

// 4. SDK
const sdk = new SDK(stateManager, dataSources, audioFiles, config);
window.pitbeaconGlobal = sdk;

// 5. Developer Card Runtime
const devCardRuntime = new DeveloperCardRuntime(registry, sdk);
const cardCatalog = new CardCatalog(config, devCardRuntime, stateManager, sdk);

// 6. Layout Validator
const validator = new LayoutValidator(registry);

// 7. Layout Renderer
const renderer = new LayoutRenderer(
  registry,
  validator,
  stateManager,
  dataSources,
  sdk,
);

import { createMatchCard } from "./src/cards/builtin/matchCard.js";
import { createLeaderboardCard } from "./src/cards/builtin/leaderboardCard.js";
import { createWebcastCard } from "./src/cards/builtin/webcastCard.js";
import { createRobotHealthCard } from "./src/cards/builtin/robotHealthCard.js";
import { createBatteryCard } from "./src/cards/builtin/batteryCard.js";
import { createPartsCard } from "./src/cards/builtin/partsCard.js";
import { createCheckinCard } from "./src/cards/builtin/checkinCard.js";
import { createStatboticsCard } from "./src/cards/builtin/statboticsCard.js";

registry.register("webcast-card", createWebcastCard());
registry.register("match-card", createMatchCard());
registry.register("leaderboard-card", createLeaderboardCard());
registry.register("robot-health-card", createRobotHealthCard());
registry.register("battery-card", createBatteryCard());
registry.register("parts-card", createPartsCard());
registry.register("checkin-card", createCheckinCard());
registry.register("statbotics-card", createStatboticsCard());

registry.register("__fallback__", FallbackCard);

// Load saved state

function loadSettings() {
  const savedTeamNumber = localStorage.getItem("teamNumber");
  const savedApiKey = localStorage.getItem("tbaapikey");
  const savedTestMode = localStorage.getItem("testMode") === "true";
  const savedTestDate = localStorage.getItem("testDate");
  const savedTheme = localStorage.getItem("theme") || "dark";
  const savedNoteAlarmToggle =
    localStorage.getItem("noteAlarmToggle") === "true";
  const savedNoteAlarmSound =
    localStorage.getItem("noteAlarmSound") || "alarm1";
  const savedMatchAlarmToggle =
    localStorage.getItem("matchAlarmToggle") !== "false";
  const savedMatchAlertThreshold =
    localStorage.getItem("matchAlertThreshold") || 300;
  const savedMatchAlarmSound =
    localStorage.getItem("matchAlarmSound") || "alarm1";
  const savedGridCols = parseInt(
    localStorage.getItem("gridCols") || config.gridCols,
  );
  const savedGridRows = parseInt(
    localStorage.getItem("gridRows") || config.gridRows,
  );
  const savedLayout = localStorage.getItem("layout");
  const savedActiveProfile =
    localStorage.getItem("activeProfileName") || "Default";
  const savedProfiles = localStorage.getItem("layoutProfiles");
  const savedHiddenCards = localStorage.getItem("hiddenCards");
  const savedDevCards = localStorage.getItem("developerCards");

  if (savedTeamNumber) {
    config.teamNumber = savedTeamNumber;
    document.getElementById("teamNumber").value = savedTeamNumber;
    stateManager.update({ teamNumber: parseInt(savedTeamNumber) });
  }
  if (savedApiKey) {
    config.tbaapikey = savedApiKey;
    document.getElementById("tbaapikey").value = savedApiKey;
  }

  config.theme = savedTheme;
  document.documentElement.setAttribute("data-theme", savedTheme);

  config.noteAlarmToggle = savedNoteAlarmToggle;
  config.noteAlarmSound = savedNoteAlarmSound;
  document.getElementById("noteAlarmToggle").checked = savedNoteAlarmToggle;
  document.getElementById("noteAlarmSound").value = savedNoteAlarmSound;

  config.matchAlarmToggle = savedMatchAlarmToggle;
  config.matchAlertThreshold = parseInt(savedMatchAlertThreshold);
  config.matchAlarmSound = savedMatchAlarmSound;
  document.getElementById("matchAlarmToggle").checked = savedMatchAlarmToggle;
  document.getElementById("matchAlertThreshold").value =
    savedMatchAlertThreshold;
  document.getElementById("matchAlarmSound").value = savedMatchAlarmSound;

  config.gridCols = savedGridCols;
  config.gridRows = savedGridRows;
  config.gridSize = savedGridCols;

  if (savedLayout) {
    try {
      config.layout = JSON.parse(savedLayout);
    } catch (err) {
      console.warn("Failed to parse layout:", err);
    }
  }

  if (savedHiddenCards) {
    try {
      config.hiddenSections = JSON.parse(savedHiddenCards);
    } catch (err) {
      config.hiddenSections = [];
    }
  }

  if (savedProfiles) {
    try {
      config.layoutProfiles = JSON.parse(savedProfiles);
    } catch (err) {
      config.layoutProfiles = {};
    }
  }
  config.activeProfileName = savedActiveProfile;

  if (savedDevCards) {
    try {
      config.developerCards = JSON.parse(savedDevCards);
      Object.entries(config.developerCards).forEach(([id, def]) => {
        def.settings =
          def.settings && Object.keys(def.settings).length
            ? def.settings
            : detectConfigurableSettings(def.js || "");
        def.settingsValues = getCardSettingValues({ id, ...def });
        registry.register(id, devCardRuntime.createCardDefinition(id, def));
      });
    } catch (err) {
      config.developerCards = {};
    }
  }

  const testModeCheckbox = document.getElementById("testMode");
  const testDateInput = document.getElementById("testDate");
  testModeCheckbox.checked = savedTestMode;
  if (savedTestDate) {
    testDateInput.value = savedTestDate;
  }
  testDateInput.style.display = savedTestMode ? "block" : "none";

  if (savedTestMode && savedTestDate) {
    const testDateObj = new Date(savedTestDate);
    const now = new Date();
    fullDate = new Date(
      testDateObj.getFullYear(),
      testDateObj.getMonth(),
      testDateObj.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
    );
    stateManager.update({ fullDate, isTestMode: true });
  }

  config.autoSwapEnabled = localStorage.getItem("autoSwapEnabled") === "true";
  config.autoSwapInterval = parseInt(
    localStorage.getItem("autoSwapInterval") || "30",
  );
  document.getElementById("autoSwapEnabled").checked = config.autoSwapEnabled;
  document.getElementById("autoSwapInterval").value = config.autoSwapInterval;

  refreshProfileUI();
  loadCustomColors();
  document.getElementById("settingscontainer").style.display = "flex";
}

function saveCustomColors() {
  const COLOR_VARS = [
    "--bg-base",
    "--bg-surface",
    "--bg-raised",
    "--bg-input",
    "--accent",
    "--accent-hover",
    "--border",
    "--border-accent",
    "--text-primary",
    "--text-muted",
    "--text-dim",
    "--scrollbar-track",
    "--scrollbar-thumb",
    "--scrollbar-thumb-hover",
  ];
  const overrides = {};
  COLOR_VARS.forEach((v) => {
    const val = document.documentElement.style.getPropertyValue(v).trim();
    if (val) overrides[v] = val;
  });
  localStorage.setItem("customColors", JSON.stringify(overrides));
}

function loadCustomColors() {
  try {
    const saved = JSON.parse(localStorage.getItem("customColors") || "{}");
    Object.entries(saved).forEach(([k, v]) =>
      document.documentElement.style.setProperty(k, v),
    );
  } catch {}
}

// Profile management

function captureCurrentLayoutSnapshot() {
  return {
    enabled: true,
    gridCols: config.gridCols,
    gridRows: config.gridRows,
    layout: JSON.parse(JSON.stringify(config.layout || {})),
    hiddenCards: [...(config.hiddenSections || [])],
  };
}

function saveCurrentAsProfile(name) {
  if (name === "Default") {
    delete config.layoutProfiles["Default"];
    localStorage.setItem(
      "layoutProfiles",
      JSON.stringify(config.layoutProfiles),
    );
  }
  const snapshot = captureCurrentLayoutSnapshot();
  config.layoutProfiles[name] = snapshot;
  config.activeProfileName = name;
  localStorage.setItem("layoutProfiles", JSON.stringify(config.layoutProfiles));
  localStorage.setItem("activeProfileName", name);
  refreshProfileUI();
  displayMessage(`Profile "${name}" saved!`, "message");
}

function switchToProfile(name) {
  let profile = null;
  if (name === "Default") {
    profile = {
      gridCols: 3,
      gridRows: 3,
      layout: {
        "webcast-card": { x: 0, y: 0, width: 1, height: 1 },
        "match-card": { x: 2, y: 0, width: 1, height: 3 },
        "leaderboard-card": { x: 1, y: 0, width: 1, height: 3 },
        "statbotics-card": { x: 0, y: 1, width: 1, height: 2 },
      },
      hiddenCards: [],
    };
  } else {
    profile = config.layoutProfiles[name];
  }
  if (!profile) {
    displayMessage(`Profile "${name}" not found.`, "error");
    return;
  }

  config.gridCols = profile.gridCols;
  config.gridRows = profile.gridRows;
  config.gridSize = profile.gridCols;
  config.layout = JSON.parse(JSON.stringify(profile.layout));
  config.hiddenSections = profile.hiddenCards || [];
  config.activeProfileName = name;

  localStorage.setItem("gridCols", config.gridCols);
  localStorage.setItem("gridRows", config.gridRows);
  localStorage.setItem("gridSize", config.gridCols);
  localStorage.setItem("layout", JSON.stringify(config.layout));
  localStorage.setItem("hiddenCards", JSON.stringify(config.hiddenSections));
  localStorage.setItem("activeProfileName", name);

  renderLayout();
  refreshProfileUI();
}

function refreshProfileUI() {
  const sel = document.getElementById("profileSelect");
  if (sel) {
    const current = sel.value || config.activeProfileName;
    sel.innerHTML = `<option value="Default">Default</option>`;
    Object.keys(config.layoutProfiles)
      .filter((name) => name !== "Default")
      .forEach((name) => {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        sel.appendChild(opt);
      });
    sel.value = config.activeProfileName || "Default";
  }

  const switcher = document.getElementById("profileSwitcher");
  if (!switcher) return;
  const names = [...Object.keys(config.layoutProfiles)];
  if (names.length <= 1) {
    switcher.innerHTML = "";
    return;
  }
  switcher.innerHTML = names
    .map((name) => {
      const isEnabled = config.layoutProfiles[name].enabled !== false;
      return `  <div class="profile-btn${name === config.activeProfileName ? " profile-btn-active" : ""}" data-profile="${name}">
    ${name}
    <input type="checkbox" class="proftoggle" name="profiletoggle" data-profile="${name}" ${isEnabled ? "checked" : ""}>
  </div>`;
    })
    .join("");
  switcher.querySelectorAll(".profile-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchToProfile(btn.dataset.profile));
  });
  switcher.querySelectorAll("input[name='profiletoggle']").forEach((cb) => {
    cb.addEventListener("click", (event) => {
      event.stopPropagation();
      const name = cb.dataset.profile;
      const profile = config.layoutProfiles[name];
      if (profile) {
        profile.enabled = cb.checked;
        localStorage.setItem(
          "layoutProfiles",
          JSON.stringify(config.layoutProfiles),
        );
        restartAutoSwap();
      }
    });
  });
}

// Auto-swap

let _autoSwapTimer = null;

function getAutoSwapProfileNames() {
  const allNames = [
    "Default",
    ...Object.keys(config.layoutProfiles || {}).filter((name) => name !== "Default"),
  ];
  return allNames.filter((name) => config.layoutProfiles[name]?.enabled !== false);
}

function restartAutoSwap() {
  if (_autoSwapTimer) {
    clearInterval(_autoSwapTimer);
    _autoSwapTimer = null;
  }
  if (!config.autoSwapEnabled) return;
  const names = getAutoSwapProfileNames();
  if (names.length < 2) return;
  _autoSwapTimer = setInterval(() => {
    const idx = names.indexOf(config.activeProfileName);
    const next = names[(idx + 1) % names.length];
    switchToProfile(next);
  }, config.autoSwapInterval * 1000);
}

// Render layout

function renderLayout() {
  renderer.render(config, document.getElementById("container"));
}

function hasRealTbaKey() {
  const key = (config.tbaapikey || "").toString().trim();
  if (!key) return false;
  const normalized = key.toLowerCase();
  return ![
    "your_auth_key",
    "your auth key",
    "tba key",
    "your-api-key",
    "your api key",
  ].includes(normalized);
}

async function fetchWithRetry(url, options = {}, retries = 2) {
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, options);
      const text = await response.text();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${text.slice(0, 120)}`);
      }

      try {
        return JSON.parse(text);
      } catch (parseError) {
        throw new Error(`Invalid JSON: ${text.slice(0, 120)}`);
      }
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  throw lastError || new Error("Unknown TBA fetch error");
}

let _teamSummaryFetchInFlight = null;
let _teamSummaryLastFetchAt = 0;
const TEAM_SUMMARY_COOLDOWN_MS = 60 * 1000;

async function fetchTeamSummaryData(teamNumber, eventKey) {
  const year = new Date().getFullYear();

  if (!teamNumber || !hasRealTbaKey()) {
    return {
      teamSummary: {
        eventRank: "–",
        eventRecord: { wins: 0, losses: 0, ties: 0 },
        winRate: "–",
        seasonEventCount: 0,
        eventName: stateManager.getState().currentEventData?.name || null,
      },
    };
  }

  const currentState = stateManager.getState();
  const previousData = currentState.currentTeamSummaryData;
  const now = Date.now();

  if (_teamSummaryFetchInFlight) {
    return _teamSummaryFetchInFlight;
  }

  if (
    now - _teamSummaryLastFetchAt < TEAM_SUMMARY_COOLDOWN_MS &&
    previousData
  ) {
    return previousData;
  }

  _teamSummaryFetchInFlight = (async () => {
    try {
      const headers = {
        "X-TBA-Auth-Key": config.tbaapikey || "",
      };

      const [teamEvents, eventStatus, rankings] = await Promise.all([
        fetchWithRetry(
          `https://www.thebluealliance.com/api/v3/team/frc${teamNumber}/events/${year}`,
          { headers },
        ),
        eventKey
          ? fetchWithRetry(
              `https://www.thebluealliance.com/api/v3/team/frc${teamNumber}/event/${eventKey}/status`,
              { headers },
            )
          : Promise.resolve(null),
        eventKey
          ? fetchWithRetry(
              `https://www.thebluealliance.com/api/v3/event/${eventKey}/rankings`,
              { headers },
            )
          : Promise.resolve(null),
      ]);

      const rankingEntry = Array.isArray(rankings?.rankings)
        ? rankings.rankings.find(
            (entry) => entry.team_key === `frc${teamNumber}`,
          )
        : null;

      const record = rankingEntry?.record || eventStatus?.qual?.record || null;
      const eventRank = rankingEntry?.rank ?? eventStatus?.qual?.rank ?? null;
      const winTotal = record?.wins ?? 0;
      const lossTotal = record?.losses ?? 0;
      const tieTotal = record?.ties ?? 0;
      const totalGames = winTotal + lossTotal + tieTotal;
      const winRate =
        totalGames > 0 ? `${((winTotal / totalGames) * 100).toFixed(1)}%` : "–";

      return {
        teamSummary: {
          eventRank,
          eventRecord: {
            wins: winTotal,
            losses: lossTotal,
            ties: tieTotal,
          },
          winRate,
          seasonEventCount: Array.isArray(teamEvents) ? teamEvents.length : 0,
          eventName: currentState.currentEventData?.name || null,
        },
      };
    } catch (error) {
      console.warn("Team summary fetch failed:", error);
      return previousData || null;
    } finally {
      _teamSummaryLastFetchAt = Date.now();
      _teamSummaryFetchInFlight = null;
    }
  })();

  return _teamSummaryFetchInFlight;
}

window.pitbeaconRefreshTeamData = async () => {
  const currentState = stateManager.getState();
  const teamSummaryData = await fetchTeamSummaryData(
    config.teamNumber,
    currentState.currentEventData?.key,
  );
  stateManager.update({ currentTeamSummaryData: teamSummaryData });
  renderer.updateCards(stateManager.getState());
  return teamSummaryData;
};

// Data fetching

async function getData() {
  try {
    const result = await dataSources.fetchAll();
    if (result) {
      const teamSummaryData = await fetchTeamSummaryData(
        config.teamNumber,
        result.eventData?.key,
      );

      stateManager.update({
        currentMatches: result.matches,
        currentEventData: result.eventData,
        currentRankings: result.rankings,
        currentTeamSummaryData: teamSummaryData,
      });
      renderer.updateCards(stateManager.getState());
    }
  } catch (error) {
    displayMessage(`Network Error: ${error.message}`, "error");
  }
}

// UI helpers

let popupCounter = 0;
const popups = {};

function displayMessage(message, type) {
  const errorContainer = document.getElementById("errorcontainer");
  popupCounter++;
  const popupId = popupCounter;
  const divId = `popup-${popupId}`;
  errorContainer.innerHTML = `${errorContainer.innerHTML}<div class="${type}" id="${divId}"><p class="error-exit">X</p><p>${message}</p></div>`;

  const element = document.getElementById(divId);
  if (element) {
    const timeout = setTimeout(() => {
      try {
        const msg = document.getElementById(divId);
        if (msg && msg.parentNode) {
          msg.remove();
        }
      } catch (e) {
        console.log("Message already removed:", divId);
      }
      delete popups[popupId];
    }, 3000);
    popups[popupId] = { element: element, timeout: timeout };
  }
}
// app.js is loaded as an ES module (<script type="module">), so this
// top-level function declaration is scoped to the module and does NOT
// automatically attach to `window` the way it would in a classic script.
// sdk.notify() (called by every card, built-in or Developer Editor) reads
// window.displayMessage specifically — without this line that check is
// always false and notify() silently does nothing.
window.displayMessage = displayMessage;

function updateTimeDisplay() {
  const timeDisplay = document.getElementById("time-display");
  const isTestMode = localStorage.getItem("testMode") === "true";
  if (isTestMode) {
    const savedTestDate = localStorage.getItem("testDate");
    if (savedTestDate) {
      const testDateObj = new Date(savedTestDate);
      const now = new Date();
      fullDate = new Date(
        testDateObj.getFullYear(),
        testDateObj.getMonth(),
        testDateObj.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
      );
    }
  }

  const displayDate = isTestMode ? fullDate : new Date();
  timeDisplay.textContent = displayDate.toLocaleTimeString("en-US", {
    hour12: true,
  });

  stateManager.update({ fullDate: displayDate });

  const state = stateManager.getState();
  if (state.currentMatches && config.matchAlarmToggle) {
    checkMatchAlert(state);
  }
}

function checkMatchAlert(state) {
  const currentTime = Math.floor(
    (localStorage.getItem("testMode") === "true"
      ? fullDate
      : new Date()
    ).getTime() / 1000,
  );

  for (const match of state.currentMatches) {
    const isTeamInMatch =
      match.alliances.red.team_keys.includes(`frc${config.teamNumber}`) ||
      match.alliances.blue.team_keys.includes(`frc${config.teamNumber}`);

    if (!isTeamInMatch) continue;

    const timeUntilMatch = match.predicted_time - currentTime;
    const matchId = `${match.comp_level}-${match.match_number}`;

    if (
      timeUntilMatch > 0 &&
      timeUntilMatch <= config.matchAlertThreshold &&
      state.lastMatchAlertId !== matchId
    ) {
      const sound = audioFiles[config.matchAlarmSound] || audioFiles.alarm1;
      sound.currentTime = 0;
      sound.play().catch((err) => console.log("Audio play failed:", err));
      stateManager.update({ lastMatchAlertId: matchId });

      const minutes = Math.floor(timeUntilMatch / 60);
      const seconds = Math.floor(timeUntilMatch % 60);
      displayMessage(
        `Match Alert: ${match.comp_level.toUpperCase()} ${match.match_number} in ${minutes}m ${seconds}s!`,
        "message",
      );
      break;
    }
  }
}

// Setup listeners

function setupListeners() {
  const errorContainer = document.getElementById("errorcontainer");
  const settings = document.getElementById("settings");
  const settingscontainer = document.getElementById("settingscontainer");
  const savebutton = document.getElementById("savebutton");
  const testModeCheckbox = document.getElementById("testMode");
  const testDateInput = document.getElementById("testDate");
  const hideButton = document.getElementById("hideTopBtn");

  testModeCheckbox.addEventListener("change", () => {
    testDateInput.style.display = testModeCheckbox.checked ? "block" : "none";
  });

  hideButton.addEventListener("click", () => {
    const header = document.getElementById("header");
    const isNowHidden = header.classList.toggle("hidden");
    document.documentElement.style.setProperty(
      "--header-height",
      isNowHidden ? "0px" : "4.5rem",
    );
  });

  document.getElementById("devEditorGuideBtn").addEventListener("click", () => {
    docsModal.open();
  });

  savebutton.addEventListener("click", () => {
    config.teamNumber = document.getElementById("teamNumber").value;
    config.tbaapikey = document.getElementById("tbaapikey").value;
    config.noteAlarmToggle = document.getElementById("noteAlarmToggle").checked;
    config.noteAlarmSound = document.getElementById("noteAlarmSound").value;
    config.matchAlarmToggle =
      document.getElementById("matchAlarmToggle").checked;
    config.matchAlertThreshold =
      parseInt(document.getElementById("matchAlertThreshold").value) || 300;
    config.matchAlarmSound = document.getElementById("matchAlarmSound").value;

    localStorage.setItem("teamNumber", config.teamNumber);
    localStorage.setItem("tbaapikey", config.tbaapikey);
    localStorage.setItem("theme", config.theme);
    localStorage.setItem(
      "noteAlarmToggle",
      config.noteAlarmToggle ? "true" : "false",
    );
    localStorage.setItem("noteAlarmSound", config.noteAlarmSound);
    localStorage.setItem(
      "matchAlarmToggle",
      config.matchAlarmToggle ? "true" : "false",
    );
    localStorage.setItem("matchAlertThreshold", config.matchAlertThreshold);
    localStorage.setItem("matchAlarmSound", config.matchAlarmSound);

    document.documentElement.setAttribute("data-theme", config.theme);

    const isTestMode = testModeCheckbox.checked;
    localStorage.setItem("testMode", isTestMode);
    if (isTestMode) {
      localStorage.setItem("testDate", testDateInput.value);
      const testDateObj = new Date(testDateInput.value);
      const now = new Date();
      fullDate = new Date(
        testDateObj.getFullYear(),
        testDateObj.getMonth(),
        testDateObj.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
      );
      stateManager.update({ fullDate, isTestMode: true });
    } else {
      localStorage.removeItem("testDate");
      fullDate = new Date();
      stateManager.update({ fullDate: fullDate, isTestMode: false });
    }

    config.autoSwapEnabled = document.getElementById("autoSwapEnabled").checked;
    config.autoSwapInterval =
      parseInt(document.getElementById("autoSwapInterval").value) || 30;
    localStorage.setItem(
      "autoSwapEnabled",
      config.autoSwapEnabled ? "true" : "false",
    );
    localStorage.setItem("autoSwapInterval", config.autoSwapInterval);
    restartAutoSwap();

    dataSources.updateConfig(config);

    displayMessage("Settings saved successfully!", "message");
    settingscontainer.style.display = "none";
    getData();
  });

  settings.addEventListener("click", () => {
    settingscontainer.style.display = "flex";
  });

  document.getElementById("saveProfileBtn")?.addEventListener("click", () => {
    const nameInput = document.getElementById("newProfileName");
    const typedName = nameInput.value.trim();
    const name = typedName || config.activeProfileName || "Default";
    saveCurrentAsProfile(name);
    nameInput.value = "";
  });

  document.getElementById("deleteProfileBtn")?.addEventListener("click", () => {
    const sel = document.getElementById("profileSelect");
    const name = sel.value;
    if (Object.keys(config.layoutProfiles).length === 0) {
      displayMessage("Cannot delete the last profile.", "error");
      return;
    }
    if (!confirm(`Delete profile "${name}"?`)) return;
    delete config.layoutProfiles[name];
    localStorage.setItem(
      "layoutProfiles",
      JSON.stringify(config.layoutProfiles),
    );
    if (config.activeProfileName === name) {
      config.activeProfileName = "Default";
      localStorage.setItem("activeProfileName", "Default");
    }
    refreshProfileUI();
    displayMessage(`Profile "${name}" deleted.`, "message");
  });

  document.getElementById("profileSelect")?.addEventListener("change", (e) => {
    switchToProfile(e.target.value);
  });

  document.getElementById("catalogBtn")?.addEventListener("click", () => {
    openCardCatalog();
  });

  document.getElementById("layoutEditorBtn")?.addEventListener("click", () => {
    openLayoutEditor();
  });

  document.getElementById("cardsBtn")?.addEventListener("click", () => {
    openCardManager();
  });

  document.getElementById("developerBtn")?.addEventListener("click", () => {
    openDeveloperEditor();
  });

  errorContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("error-exit")) {
      event.target.parentElement.remove();
    }
  });
}

// Layout editor

// Layout editor state
let layoutEditorState = {
  modal: null,
  shell: null,
  dragData: null,
  resizeData: null,
};

function openLayoutEditor() {
  const modal = document.getElementById("layoutEditorModal");
  // Clear existing content
  modal.innerHTML = "";
  modal.classList.add("active");
  layoutEditorState.modal = modal;
  renderLayoutEditor(modal);
}

function getCardIconMarkup(cardId, cardDef) {
  const defaultCardDef = Array.isArray(config.defaultCards)
    ? config.defaultCards.find((entry) => entry.id === cardId)
    : null;
  const iconName = cardDef?.icon || defaultCardDef?.icon || "square";
  const normalized = String(iconName).trim().toLowerCase();

  const svgMap = {
    "device-tv": `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="4" width="20" height="14" rx="2"></rect><path d="M8 21h8"></path><path d="M12 18v3"></path></svg>`,
    tournament: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4v4"></path><path d="M16 4v4"></path><path d="M4 8h16"></path><path d="M8 8v4"></path><path d="M16 8v4"></path><path d="M8 12h8"></path><path d="M6 12h2"></path><path d="M16 12h2"></path><path d="M4 16h16"></path><path d="M8 16v4"></path><path d="M16 16v4"></path></svg>`,
    trophy: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10"></path><path d="M8 4v3a4 4 0 0 0 4 4 4 4 0 0 0 4-4V4"></path><path d="M8 12H6a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h1"></path><path d="M16 12h2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1"></path><path d="M12 17v3"></path></svg>`,
    tool: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4a2 2 0 0 1 2.8 2.8L9.6 12 8 10.4l7.2-7.2Z"></path><path d="m6 12 6 6"></path><path d="m10 16 4 4"></path></svg>`,
    battery: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="14" height="12" rx="2"></rect><path d="M19 10h1"></path><path d="M17 8v8"></path></svg>`,
    package: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z"></path><path d="m4 7 8 4 8-4"></path><path d="m12 11 8-4"></path><path d="M12 11v10"></path></svg>`,
    checklist: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11"></path><path d="M9 12h11"></path><path d="M9 18h11"></path><path d="m4 5 1.5 1.5L8 3"></path><path d="m4 11 1.5 1.5L8 9"></path><path d="m4 17 1.5 1.5L8 15"></path></svg>`,
    "chart-bar": `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V9"></path><path d="M10 19V5"></path><path d="M16 19v-7"></path><path d="M22 19v-3"></path></svg>`,
    "alert-circle": `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v5"></path><path d="M12 16h.01"></path></svg>`,
    code: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 8-4 4 4 4"></path><path d="m16 8 4 4-4 4"></path><path d="m13 4-2 16"></path></svg>`,
  };

  const iconSvg =
    svgMap[normalized] ||
    svgMap.square ||
    `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"></rect></svg>`;
  return `<span class="le-card-icon" data-icon-name="${iconName}" aria-hidden="true">${iconSvg}</span>`;
}

function renderLayoutEditor(modal) {
  const cardIds = registry.listCards();
  const cols = config.gridCols || 3;
  const rows = config.gridRows || 3;

  // Get current color values
  const colorVars = [
    "--bg-base",
    "--bg-surface",
    "--bg-raised",
    "--bg-input",
    "--accent",
    "--accent-hover",
    "--border",
    "--border-accent",
    "--text-primary",
    "--text-muted",
    "--text-dim",
  ];

  // Create shell
  const shell = document.createElement("div");
  shell.className = "le-shell";
  shell.id = "leShell";
  shell.innerHTML = `
        <div class="le-header">
            <div class="le-header-left">
                <h2 class="le-title">📐 Layout Editor</h2>
                <div class="le-controls">
                    <label>Cols <input type="number" id="leGridCols" min="2" max="12" value="${cols}"></label>
                    <label>Rows <input type="number" id="leGridRows" min="2" max="12" value="${rows}"></label>
                </div>
            </div>
            <div class="le-header-right">
                <button class="le-close-btn" id="leClose">✕</button>
            </div>
        </div>
        <div class="le-body">
            <div class="le-palette">
                <div class="le-palette-title">📦 Available Cards</div>
                <div class="le-palette-list" id="leCardList">
                    ${cardIds
                      .filter((id) => id !== "__fallback__")
                      .map((id) => {
                        const def = registry.get(id);
                        const inLayout = config.layout[id] !== undefined;
                        return `<div class="le-palette-item ${inLayout ? "in-layout" : ""}" draggable="true" data-card-id="${id}" style="${inLayout ? "opacity:0.4;cursor:default;" : ""}">
                            ${getCardIconMarkup(id, def)}
                            <span class="le-card-label">${def.label}</span>
                            ${inLayout ? " ✓" : ""}
                        </div>`;
                      })
                      .join("")}
                    ${cardIds.filter((id) => id !== "__fallback__").length === 0 ? '<div class="le-palette-empty">No cards available</div>' : ""}
                </div>
                <div class="le-palette-title" style="border-top:1px solid var(--border);margin-top:8px;padding-top:8px;">🎨 Colors</div>
                <div class="le-color-controls" style="padding:8px 11px;">
                    <label>
                        Element
                        <select id="leColorEl">
                            ${colorVars.map((v) => `<option value="${v}">${v.replace("--", "")}</option>`).join("")}
                        </select>
                    </label>
                    <input type="color" id="leColorPick">
                    <span class="le-color-hex" id="leColorHex">#ffffff</span>
                    <button class="le-color-reset" id="leColorReset">Reset</button>
                </div>
                <div class="le-palette-title" style="border-top:1px solid var(--border);margin-top:4px;padding-top:8px;">💾 Actions</div>
                <div style="padding:8px 11px;display:flex;flex-direction:column;gap:6px;">
                    <button class="btn-export" id="leExport" style="width:100%;padding:6px;">Export Layout</button>
                    <button class="btn-import" id="leImport" style="width:100%;padding:6px;">Import Layout</button>
                    <button class="btn-reset" id="leReset" style="width:100%;padding:6px;">Reset to Default</button>
                </div>
            </div>
            <div class="le-canvas">
                <div class="layout-grid" id="leGrid" style="--grid-cols:${cols};--grid-rows:${rows};grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},1fr);">
                    ${Object.entries(config.layout)
                      .map(([id, pos]) => {
                        const def = registry.get(id);
                        if (!def) return "";
                        return `<div class="layout-item" data-card-id="${id}" style="grid-column:${pos.x + 1}/span ${pos.width};grid-row:${pos.y + 1}/span ${pos.height};">
                            <div class="layout-item-header">
                                <span>${getCardIconMarkup(id, def)}<span class="le-card-label">${def.label}</span></span>
                                <button class="le-remove-btn" data-card-id="${id}">✕</button>
                            </div>
                            <div class="layout-item-hint">${pos.width}×${pos.height}</div>
                            <div class="resize-handle"></div>
                        </div>`;
                      })
                      .join("")}
                </div>
            </div>
        </div>
    `;
  modal.appendChild(shell);
  layoutEditorState.shell = shell;

  // Grid controls
  const colsInput = shell.querySelector("#leGridCols");
  const rowsInput = shell.querySelector("#leGridRows");
  const grid = shell.querySelector("#leGrid");

  function updateGrid() {
    const newCols = Math.max(2, Math.min(12, parseInt(colsInput.value) || 3));
    const newRows = Math.max(2, Math.min(12, parseInt(rowsInput.value) || 3));
    config.gridCols = newCols;
    config.gridRows = newRows;
    grid.style.gridTemplateColumns = `repeat(${newCols},1fr)`;
    grid.style.gridTemplateRows = `repeat(${newRows},1fr)`;
    grid.style.setProperty("--grid-cols", newCols);
    grid.style.setProperty("--grid-rows", newRows);
    localStorage.setItem("gridCols", newCols);
    localStorage.setItem("gridRows", newRows);
  }

  colsInput.addEventListener("change", updateGrid);
  rowsInput.addEventListener("change", updateGrid);

  // Color controls
  const colorEl = shell.querySelector("#leColorEl");
  const colorPick = shell.querySelector("#leColorPick");
  const colorHex = shell.querySelector("#leColorHex");
  const colorReset = shell.querySelector("#leColorReset");

  // Convert rgb to hex
  function rgbToHex(rgb) {
    const match = rgb.match(/\d+/g);
    if (!match) return rgb;
    return (
      "#" +
      match
        .slice(0, 3)
        .map((x) => parseInt(x).toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase()
    );
  }

  function updateColorPicker() {
    const val = getComputedStyle(document.documentElement)
      .getPropertyValue(colorEl.value)
      .trim();
    const hex = val.startsWith("rgb") ? rgbToHex(val) : val;
    colorHex.textContent = hex;
    if (hex.startsWith("#")) {
      colorPick.value = hex;
    }
  }

  colorEl.addEventListener("change", updateColorPicker);
  updateColorPicker();

  colorPick.addEventListener("input", () => {
    colorHex.textContent = colorPick.value;
    document.documentElement.style.setProperty(colorEl.value, colorPick.value);
    // Save to localStorage
    saveCustomColors();
  });

  colorReset.addEventListener("click", () => {
    // Reset the selected color to the theme default
    const theme = config.theme || "dark";
    const defaultColors = {
      dark: {
        "--bg-base": "rgb(22, 22, 22)",
        "--bg-surface": "rgb(30, 30, 30)",
        "--bg-raised": "rgb(40, 40, 40)",
        "--bg-input": "rgb(50, 50, 50)",
        "--accent": "rgb(47, 48, 112)",
        "--accent-hover": "rgb(60, 62, 140)",
        "--border": "rgba(255, 255, 255, 0.07)",
        "--border-accent": "rgba(47, 48, 112, 0.6)",
        "--text-primary": "rgb(240, 240, 240)",
        "--text-muted": "rgb(160, 155, 155)",
        "--text-dim": "rgb(100, 98, 98)",
      },
      light: {
        "--bg-base": "rgb(245, 245, 247)",
        "--bg-surface": "rgb(235, 235, 238)",
        "--bg-raised": "rgb(225, 225, 230)",
        "--bg-input": "rgb(210, 210, 215)",
        "--accent": "rgb(47, 48, 112)",
        "--accent-hover": "rgb(70, 72, 160)",
        "--border": "rgba(0, 0, 0, 0.1)",
        "--border-accent": "rgba(47, 48, 112, 0.3)",
        "--text-primary": "rgb(20, 20, 22)",
        "--text-muted": "rgb(80, 85, 90)",
        "--text-dim": "rgb(130, 135, 140)",
      },
      "high-contrast": {
        "--bg-base": "rgb(0, 0, 0)",
        "--bg-surface": "rgb(15, 15, 15)",
        "--bg-raised": "rgb(30, 30, 30)",
        "--bg-input": "rgb(50, 50, 50)",
        "--accent": "rgb(0, 255, 255)",
        "--accent-hover": "rgb(0, 200, 200)",
        "--border": "rgba(0, 255, 255, 0.3)",
        "--border-accent": "rgba(0, 255, 255, 0.6)",
        "--text-primary": "rgb(255, 255, 255)",
        "--text-muted": "rgb(200, 200, 200)",
        "--text-dim": "rgb(150, 150, 150)",
      },
    };

    const defaultVal = defaultColors[theme]?.[colorEl.value];
    if (defaultVal) {
      document.documentElement.style.setProperty(colorEl.value, defaultVal);
      // Remove from custom colors
      const customColors = JSON.parse(
        localStorage.getItem("customColors") || "{}",
      );
      delete customColors[colorEl.value];
      localStorage.setItem("customColors", JSON.stringify(customColors));
      updateColorPicker();
      displayMessage(`Reset ${colorEl.value} to default`, "message");
    }
  });

  // Close
  shell.querySelector("#leClose").addEventListener("click", () => {
    closeLayoutEditor();
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeLayoutEditor();
    }
  });

  // Remove card
  shell.querySelectorAll(".le-remove-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.cardId;
      delete config.layout[id];
      localStorage.setItem("layout", JSON.stringify(config.layout));
      modal.innerHTML = "";
      renderLayoutEditor(modal);
    });
  });

  // Drag and drop from the palette
  const paletteItems = shell.querySelectorAll(
    ".le-palette-item:not(.in-layout)",
  );

  paletteItems.forEach((item) => {
    item.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", item.dataset.cardId);
      item.style.opacity = "0.5";
    });
    item.addEventListener("dragend", (e) => {
      item.style.opacity = "";
    });
  });

  grid.addEventListener("dragover", (e) => e.preventDefault());
  grid.addEventListener("drop", (e) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("text/plain");
    if (!cardId || config.layout[cardId]) return;

    const rect = grid.getBoundingClientRect();
    const gap = 8;
    const currentCols = parseInt(colsInput.value) || 3;
    const currentRows = parseInt(rowsInput.value) || 3;
    const cellW = (rect.width - gap * (currentCols - 1)) / currentCols;
    const cellH = (rect.height - gap * (currentRows - 1)) / currentRows;
    const x = Math.max(
      0,
      Math.min(
        Math.floor((e.clientX - rect.left) / (cellW + gap)),
        currentCols - 1,
      ),
    );
    const y = Math.max(
      0,
      Math.min(
        Math.floor((e.clientY - rect.top) / (cellH + gap)),
        currentRows - 1,
      ),
    );

    config.layout[cardId] = { x, y, width: 1, height: 1 };
    localStorage.setItem("layout", JSON.stringify(config.layout));
    modal.innerHTML = "";
    renderLayoutEditor(modal);
  });

  // Drag to reposition cards
  setupCardDrag(grid);

  // ─── Resize cards ─────────────────────────────────────────────────────
  setupCardResize(grid);

  // ─── Export ────────────────────────────────────────────────────────────
  shell.querySelector("#leExport").addEventListener("click", () => {
    const exportData = {
      version: "26.7.24",
      gridCols: config.gridCols,
      gridRows: config.gridRows,
      layout: config.layout,
      hiddenCards: config.hiddenSections,
      customColors: getCustomColors(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `pitbeacon-layout-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    displayMessage("Layout exported!", "message");
  });

  // ─── Import ────────────────────────────────────────────────────────────
  shell.querySelector("#leImport").addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (data.gridCols) config.gridCols = data.gridCols;
          if (data.gridRows) config.gridRows = data.gridRows;
          if (data.layout) config.layout = data.layout;
          if (data.hiddenCards) config.hiddenSections = data.hiddenCards;
          if (data.customColors) {
            Object.entries(data.customColors).forEach(([k, v]) => {
              document.documentElement.style.setProperty(k, v);
            });
            localStorage.setItem(
              "customColors",
              JSON.stringify(data.customColors),
            );
          }
          localStorage.setItem("gridCols", config.gridCols);
          localStorage.setItem("gridRows", config.gridRows);
          localStorage.setItem("layout", JSON.stringify(config.layout));
          localStorage.setItem(
            "hiddenCards",
            JSON.stringify(config.hiddenSections),
          );
          displayMessage("Layout imported!", "message");
          modal.innerHTML = "";
          renderLayoutEditor(modal);
        } catch (err) {
          displayMessage("Import failed: " + err.message, "error");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });

  // ─── Reset ─────────────────────────────────────────────────────────────
  shell.querySelector("#leReset").addEventListener("click", () => {
    if (!confirm("Reset layout to default?")) return;
    config.layout = {
      "webcast-card": { x: 0, y: 0, width: 1, height: 2 },
      "battery-card": { x: 0, y: 2, width: 1, height: 1 },
      "match-card": { x: 1, y: 0, width: 2, height: 2 },
      "leaderboard-card": { x: 1, y: 2, width: 2, height: 1 },
    };
    config.hiddenSections = [];
    localStorage.setItem("layout", JSON.stringify(config.layout));
    localStorage.setItem("hiddenCards", JSON.stringify(config.hiddenSections));
    displayMessage("Layout reset to default", "message");
    modal.innerHTML = "";
    renderLayoutEditor(modal);
  });
}

// ─── Helper to get custom colors ──────────────────────────────────────────

function getCustomColors() {
  const COLOR_VARS = [
    "--bg-base",
    "--bg-surface",
    "--bg-raised",
    "--bg-input",
    "--accent",
    "--accent-hover",
    "--border",
    "--border-accent",
    "--text-primary",
    "--text-muted",
    "--text-dim",
    "--scrollbar-track",
    "--scrollbar-thumb",
    "--scrollbar-thumb-hover",
  ];
  const result = {};
  COLOR_VARS.forEach((v) => {
    const val = document.documentElement.style.getPropertyValue(v).trim();
    if (val) result[v] = val;
  });
  return result;
}

function closeLayoutEditor() {
  if (layoutEditorState.modal) {
    layoutEditorState.modal.classList.remove("active");
    layoutEditorState.modal.innerHTML = "";
    layoutEditorState.modal = null;
    layoutEditorState.shell = null;
    renderLayout();
  }
}

// ─── Card Drag Functionality ─────────────────────────────────────────────

function setupCardDrag(grid) {
  let dragData = null;

  grid.addEventListener("mousedown", (e) => {
    const item = e.target.closest(".layout-item");
    if (!item) return;
    if (e.target.closest(".le-remove-btn")) return;
    if (e.target.closest(".resize-handle")) return;

    const rect = grid.getBoundingClientRect();
    const gap = 8;
    const cols = config.gridCols || 3;
    const rows = config.gridRows || 3;
    const cellW = (rect.width - gap * (cols - 1)) / cols;
    const cellH = (rect.height - gap * (rows - 1)) / rows;

    const cardId = item.dataset.cardId;
    const pos = config.layout[cardId];
    if (!pos) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startGridX = pos.x;
    const startGridY = pos.y;

    item.classList.add("dragging");

    const onMove = (ev) => {
      const dx = Math.round((ev.clientX - startX) / (cellW + gap));
      const dy = Math.round((ev.clientY - startY) / (cellH + gap));
      const newX = Math.max(0, Math.min(startGridX + dx, cols - pos.width));
      const newY = Math.max(0, Math.min(startGridY + dy, rows - pos.height));

      if (newX !== pos.x || newY !== pos.y) {
        pos.x = newX;
        pos.y = newY;
        item.style.gridColumn = `${pos.x + 1} / span ${pos.width}`;
        item.style.gridRow = `${pos.y + 1} / span ${pos.height}`;
      }
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      item.classList.remove("dragging");
      localStorage.setItem("layout", JSON.stringify(config.layout));
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });
}

// ─── Card Resize Functionality ────────────────────────────────────────────

function setupCardResize(grid) {
  grid.addEventListener("mousedown", (e) => {
    const handle = e.target.closest(".resize-handle");
    if (!handle) return;

    const item = handle.closest(".layout-item");
    if (!item) return;

    const rect = grid.getBoundingClientRect();
    const gap = 8;
    const cols = config.gridCols || 3;
    const rows = config.gridRows || 3;
    const cellW = (rect.width - gap * (cols - 1)) / cols;
    const cellH = (rect.height - gap * (rows - 1)) / rows;

    const cardId = item.dataset.cardId;
    const pos = config.layout[cardId];
    if (!pos) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = pos.width;
    const startH = pos.height;

    item.classList.add("resizing");
    e.preventDefault();

    const onMove = (ev) => {
      const dx = Math.round((ev.clientX - startX) / (cellW + gap));
      const dy = Math.round((ev.clientY - startY) / (cellH + gap));

      const newW = Math.max(1, Math.min(startW + dx, cols - pos.x));
      const newH = Math.max(1, Math.min(startH + dy, rows - pos.y));

      if (newW !== pos.width || newH !== pos.height) {
        pos.width = newW;
        pos.height = newH;
        item.style.gridColumn = `${pos.x + 1} / span ${pos.width}`;
        item.style.gridRow = `${pos.y + 1} / span ${pos.height}`;
        const hint = item.querySelector(".layout-item-hint");
        if (hint) hint.textContent = `${pos.width}×${pos.height}`;
      }
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      item.classList.remove("resizing");
      localStorage.setItem("layout", JSON.stringify(config.layout));
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });
}

// ─── Card Manager ──────────────────────────────────────────────────────────

function openCardManager() {
  const modal = document.getElementById("cardManagerModal");
  modal.classList.add("active");
  renderCardManager(modal);
}

async function openCardCatalog() {
  const modal = document.getElementById("cardCatalogModal");
  if (!modal) return;
  modal.classList.add("active");
  await renderCardCatalog(modal);
}

function getCardSettingValues(card) {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem("cardSettings") || "{}")[card.id] || {};
  } catch {}
  const values = {};
  const settings = Object.keys(card.settings || {}).length
    ? card.settings
    : detectConfigurableSettings(card.js || "");
  card.settings = settings;
  Object.entries(settings).forEach(([key, definition]) => {
    const setting = typeof definition === "string" ? { type: "text", default: definition } : definition || {};
    values[key] = saved[key] ?? setting.default ?? (setting.type === "checkbox" ? false : "");
  });
  return values;
}

function saveCardSettingValues(cardId, values) {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem("cardSettings") || "{}");
  } catch {}
  saved[cardId] = values;
  localStorage.setItem("cardSettings", JSON.stringify(saved));
}

function renderCardSettingsControls(container, card, values, onChange) {
  const settings = Object.entries(card.settings || detectConfigurableSettings(card.js || ""));
  if (!settings.length) return;
  const wrapper = document.createElement("div");
  wrapper.className = "card-settings-controls";
  const title = document.createElement("strong");
  title.textContent = "Card settings";
  wrapper.appendChild(title);

  settings.forEach(([key, definition]) => {
    const setting = typeof definition === "string" ? { type: "text", default: definition } : definition || {};
    const label = document.createElement("label");
    label.className = "card-setting-field";
    const caption = document.createElement("span");
    caption.textContent = setting.label || key;
    label.appendChild(caption);
    const input = document.createElement(setting.type === "select" ? "select" : "input");
    input.name = key;
    input.type = setting.type === "select" ? "text" : setting.type || "text";
    if (setting.type === "select") {
      (setting.options || []).forEach((option) => {
        const optionEl = document.createElement("option");
        optionEl.value = option.value ?? option;
        optionEl.textContent = option.label ?? option;
        input.appendChild(optionEl);
      });
    }
    if (setting.min !== undefined) input.min = setting.min;
    if (setting.max !== undefined) input.max = setting.max;
    if (setting.step !== undefined) input.step = setting.step;
    if (setting.type === "checkbox") input.checked = Boolean(values[key]);
    else input.value = values[key];
    input.addEventListener("input", () => {
      values[key] = setting.type === "checkbox" ? input.checked : input.value;
      saveCardSettingValues(card.id, values);
      onChange(values);
    });
    label.appendChild(input);
    wrapper.appendChild(label);
  });
  container.appendChild(wrapper);
}

async function renderCardCatalog(modal) {
  const list = modal.querySelector("#cardCatalogList");
  const status = modal.querySelector("#cardCatalogStatus");
  if (!list || !status) return;
  list.innerHTML = "";
  status.textContent = cardCatalog.isConfigured()
    ? "Loading approved cards..."
    : "Catalog backend is not configured yet. Add the Supabase values in config.js.";
  if (!cardCatalog.isConfigured()) return;

  try {
    const cards = await cardCatalog.listApproved();
    status.textContent = cards.length ? "" : "No approved community cards yet.";
    cards.forEach((card) => {
      const item = document.createElement("article");
      item.className = "catalog-card-item";
      item.innerHTML = `<div class="catalog-card-info"><strong></strong><span></span></div><div class="catalog-card-preview"></div><div class="catalog-card-settings"></div><div class="catalog-card-actions"><button type="button" class="catalog-card-save">Save to My Cards</button><span class="catalog-card-save-status" role="status"></span></div>`;
      item.querySelector("strong").textContent = card.label;
      item.querySelector("span").textContent = card.description || "Community card";
      list.appendChild(item);
      const settingValues = getCardSettingValues(card);
      const renderPreview = (values) => {
        card.settingsValues = values;
        cardCatalog.renderPreview(item.querySelector(".catalog-card-preview"), card);
      };
      renderPreview(settingValues);
      renderCardSettingsControls(
        item.querySelector(".catalog-card-settings"),
        card,
        settingValues,
        renderPreview,
      );
      const saveButton = item.querySelector(".catalog-card-save");
      const saveStatus = item.querySelector(".catalog-card-save-status");
      saveButton.addEventListener("click", () => {
        const existing = registry.get(card.id);
        if (existing?.builtin) {
          saveStatus.textContent = "Card ID is already used by a built-in card.";
          return;
        }
        config.developerCards[card.id] = {
          label: card.label,
          description: card.description,
          icon: card.icon,
          version: card.version,
          settings: card.settings,
          settingsValues: settingValues,
          html: card.html,
          css: card.css,
          js: card.js,
        };
        localStorage.setItem(
          "developerCards",
          JSON.stringify(config.developerCards),
        );
        if (existing) registry.unregister(card.id);
        registry.register(
          card.id,
          devCardRuntime.createCardDefinition(card.id, config.developerCards[card.id]),
        );
        saveButton.disabled = true;
        saveStatus.textContent = "Saved. Add it from the Layout Editor.";
        renderLayout();
      });
    });
  } catch (error) {
    status.textContent = error.message;
  }
}

function setupCardUpload(modal) {
  const form = modal.querySelector("#cardUploadForm");
  const localCardSelect = modal.querySelector("#cardUploadLocalCard");
  const status = modal.querySelector("#cardUploadStatus");
  if (!form || !localCardSelect || !status) return;

  const localCardIds = Object.keys(config.developerCards || {});
  localCardIds.forEach((id) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = config.developerCards[id].label || id;
    localCardSelect.appendChild(option);
  });
  if (!localCardIds.length) {
    localCardSelect.disabled = true;
    localCardSelect.options[0].textContent = "No saved cards available";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const localCardId = localCardSelect?.value;
    if (!localCardId) {
      status.textContent = "Select a saved card first.";
      return;
    }
    try {
      const cards = [{ id: localCardId, ...config.developerCards[localCardId] }];

      const authorName = modal.querySelector("#cardUploadAuthor").value.trim();
      const description = modal
        .querySelector("#cardUploadDescription")
        .value.trim();
      status.textContent = "Submitting for review...";
      for (const card of cards) {
        const settings = detectConfigurableSettings(card.js || "");
        await cardCatalog.submit({ ...card, authorName, description, settings });
      }
      status.textContent =
        "Submitted. It will appear after moderation.";
      form.reset();
    } catch (error) {
      status.textContent = error.message;
    }
  });
}

function renderCardManager(modal) {
  const list = modal.querySelector("#cardManagerList");
  if (!list) return;

  const cards = registry.listCards().filter((id) => id !== "__fallback__");
  const renderItem = (id) => {
      const def = registry.get(id);
      const isDev = def.developer || false;
      const isHidden = config.hiddenSections.includes(id);
      return `<div class="card-manager-item" data-card-id="${id}">
            <div class="card-manager-item-info">
              ${isDev ? `<label class="card-manager-export-select" title="Select ${id} for export"><input type="checkbox" class="card-export-checkbox" data-card-id="${id}"> Export</label>` : ""}
                <span class="card-manager-item-icon">📄</span>
                <span class="card-manager-item-id">${id}</span>
                <span class="card-manager-item-label">${def.label}</span>
                ${isDev ? '<span class="card-manager-item-badge">Developer</span>' : ""}
                ${def.builtin ? '<span class="card-manager-item-badge builtin">Built-in</span>' : ""}
                ${isHidden ? '<span class="card-manager-item-badge" style="background:rgba(200,50,50,0.2);color:rgb(220,80,80);">Hidden</span>' : ""}
            </div>
              ${isDev ? '<div class="card-manager-card-preview"></div><div class="card-manager-card-settings"></div>' : ""}
            <div class="card-manager-item-actions">
                ${isDev ? `<button class="card-manager-item-delete" data-card-id="${id}">Delete</button>` : ""}
                <button class="card-manager-item-toggle" data-card-id="${id}">
                    ${isHidden ? "Show" : "Hide"}
                </button>
            </div>
        </div>`;
  };
  const builtinCards = cards.filter((id) => registry.get(id)?.builtin);
  const developerCards = cards.filter((id) => registry.get(id)?.developer);
  list.innerHTML = `
    <section class="card-manager-section">
      <h3 class="card-manager-section-title">Built-in Cards</h3>
      <div class="card-manager-section-list card-manager-builtins">
        ${builtinCards.length ? builtinCards.map(renderItem).join("") : '<p class="card-manager-empty">No built-in cards.</p>'}
      </div>
    </section>
    <section class="card-manager-section">
      <h3 class="card-manager-section-title">Saved Developer Cards</h3>
      <div class="card-manager-section-list card-manager-developer-grid">
        ${developerCards.length ? developerCards.map(renderItem).join("") : '<p class="card-manager-empty">No saved community cards.</p>'}
      </div>
    </section>`;

  list.querySelectorAll(".card-manager-card-preview").forEach((preview) => {
    const item = preview.closest(".card-manager-item");
    const id = item.dataset.cardId;
    const card = { id, ...config.developerCards[id] };
    const values = getCardSettingValues(card);
    const renderPreview = (nextValues) => {
      card.settingsValues = nextValues;
      config.developerCards[id].settingsValues = nextValues;
      localStorage.setItem(
        "developerCards",
        JSON.stringify(config.developerCards),
      );
      const currentDefinition = registry.get(id);
      if (currentDefinition) registry.unregister(id);
      registry.register(
        id,
        devCardRuntime.createCardDefinition(id, config.developerCards[id]),
      );
      cardCatalog.renderPreview(preview, card);
      renderLayout();
    };
    renderPreview(values);
    renderCardSettingsControls(
      item.querySelector(".card-manager-card-settings"),
      card,
      values,
      renderPreview,
    );
  });

  list.querySelectorAll(".card-manager-item-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.cardId;
      const idx = config.hiddenSections.indexOf(id);
      if (idx >= 0) {
        config.hiddenSections.splice(idx, 1);
      } else {
        config.hiddenSections.push(id);
      }
      localStorage.setItem(
        "hiddenCards",
        JSON.stringify(config.hiddenSections),
      );
      renderCardManager(modal);
      renderLayout();
    });
  });

  list.querySelectorAll(".card-manager-item-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.cardId;
      if (confirm(`Delete developer card "${id}"?`)) {
        delete config.developerCards[id];
        localStorage.setItem(
          "developerCards",
          JSON.stringify(config.developerCards),
        );
        registry.unregister(id);
        renderCardManager(modal);
        renderLayout();
      }
    });
  });

  modal.querySelector("#cardManagerExport").onclick = () => {
    const selectedIds = [...modal.querySelectorAll(".card-export-checkbox:checked")]
      .map((checkbox) => checkbox.dataset.cardId);
    if (!selectedIds.length) {
      displayMessage("Select at least one developer card to export.", "error");
      return;
    }
    selectedIds.forEach((id, index) => {
      const blob = new Blob([JSON.stringify({ [id]: config.developerCards[id] }, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `pitbeacon-card-${id}.json`;
      setTimeout(() => {
        anchor.click();
        URL.revokeObjectURL(url);
      }, index * 150);
    });
  };

  modal.querySelector("#cardManagerImport").addEventListener("click", () => {
    document.getElementById("cardManagerFileInput").click();
  });

  modal
    .querySelector("#cardManagerFileInput")
    .addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          Object.entries(data).forEach(([id, def]) => {
            config.developerCards[id] = def;
            registry.register(id, devCardRuntime.createCardDefinition(id, def));
          });
          localStorage.setItem(
            "developerCards",
            JSON.stringify(config.developerCards),
          );
          renderCardManager(modal);
          renderLayout();
          displayMessage("Cards imported successfully!", "message");
        } catch (err) {
          displayMessage("Import failed: " + err.message, "error");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    });
}

// ─── Developer Editor ─────────────────────────────────────────────────────

function openDeveloperEditor() {
  const modal = document.getElementById("devCardModal");
  modal.classList.add("active");
  devCardRuntime.initEditor(modal);
}

// ─── Initialize ────────────────────────────────────────────────────────────

loadSettings();

updateTimeDisplay();
timeUpdateInterval = setInterval(updateTimeDisplay, 1000);

getData();

const pollInterval = () => {
  const randomDelay = 30000 + Math.random() * 30000;
  pollingInterval = setTimeout(() => {
    getData();
    pollInterval();
  }, randomDelay);
};
pollInterval();

setupListeners();
setupCardUpload(document.getElementById("cardUploadModal"));
restartAutoSwap();
renderLayout();

document.addEventListener("DOMContentLoaded", () => {
  const versionTag = document.getElementById("version");
  if (versionTag) versionTag.textContent = "Version 26.7.24";
});

// ─── Modal Closes ─────────────────────────────────────────────────────────

document.getElementById("cardManagerClose")?.addEventListener("click", () => {
  document.getElementById("cardManagerModal").classList.remove("active");
});

document.getElementById("cardManagerModal")?.addEventListener("click", (e) => {
  if (e.target === e.currentTarget) {
    e.target.classList.remove("active");
  }
});

document.getElementById("cardCatalogClose")?.addEventListener("click", () => {
  document.getElementById("cardCatalogModal").classList.remove("active");
});

document.getElementById("cardCatalogModal")?.addEventListener("click", (e) => {
  if (e.target === e.currentTarget) {
    e.currentTarget.classList.remove("active");
  }
});

document.getElementById("cardCatalogSubmit")?.addEventListener("click", () => {
  document.getElementById("cardUploadModal").classList.add("active");
});

document.getElementById("cardUploadClose")?.addEventListener("click", () => {
  document.getElementById("cardUploadModal").classList.remove("active");
});

document.getElementById("cardUploadModal")?.addEventListener("click", (e) => {
  if (e.target === e.currentTarget) e.currentTarget.classList.remove("active");
});

document.getElementById("devCardClose")?.addEventListener("click", () => {
  document.getElementById("devCardModal").classList.remove("active");
});

document.getElementById("devCardModal")?.addEventListener("click", (e) => {
  if (e.target === e.currentTarget) {
    e.target.classList.remove("active");
  }
});

// Expose for debugging
window.__PITBEACON_DEBUG = {
  config,
  stateManager,
  registry,
  dataSources,
  renderer,
};
