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
    gridCols: config.gridCols,
    gridRows: config.gridRows,
    layout: JSON.parse(JSON.stringify(config.layout || {})),
    hiddenCards: [...(config.hiddenSections || [])],
  };
}

function saveCurrentAsProfile(name) {
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
  if (name === "Default" && !config.layoutProfiles["Default"]) {
    profile = {
      gridCols: 3,
      gridRows: 3,
      layout: {
        "webcast-card": { x: 0, y: 0, width: 1, height: 2 },
        "pit-notes-card": { x: 0, y: 2, width: 1, height: 1 },
        "match-card": { x: 1, y: 0, width: 2, height: 2 },
        "leaderboard-card": { x: 1, y: 2, width: 2, height: 1 },
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
  displayMessage(`Switched to "${name}"`, "message");
}

function refreshProfileUI() {
  const sel = document.getElementById("profileSelect");
  if (sel) {
    const current = sel.value || config.activeProfileName;
    sel.innerHTML = `<option value="Default">Default</option>`;
    Object.keys(config.layoutProfiles).forEach((name) => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      sel.appendChild(opt);
    });
    sel.value = config.activeProfileName || "Default";
  }

  const switcher = document.getElementById("profileSwitcher");
  if (!switcher) return;
  const names = ["Default", ...Object.keys(config.layoutProfiles)];
  if (names.length <= 1) {
    switcher.innerHTML = "";
    return;
  }
  switcher.innerHTML = names
    .map(
      (name) =>
        `<button class="profile-btn${name === config.activeProfileName ? " profile-btn-active" : ""}" data-profile="${name}">${name}</button>`,
    )
    .join("");
  switcher.querySelectorAll(".profile-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchToProfile(btn.dataset.profile));
  });
}

// Auto-swap

let _autoSwapTimer = null;

function restartAutoSwap() {
  if (_autoSwapTimer) {
    clearInterval(_autoSwapTimer);
    _autoSwapTimer = null;
  }
  if (!config.autoSwapEnabled) return;
  const names = ["Default", ...Object.keys(config.layoutProfiles)];
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

// Data fetching

async function getData() {
  try {
    const result = await dataSources.fetchAll();
    if (result) {
      stateManager.update({
        currentMatches: result.matches,
        currentEventData: result.eventData,
        currentRankings: result.rankings,
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
      stateManager.update({ fullDate });
    }
  }
  const displayDate = isTestMode ? fullDate : new Date();
  timeDisplay.textContent = displayDate.toLocaleTimeString("en-US", {
    hour12: true,
  });

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

  testModeCheckbox.addEventListener("change", () => {
    testDateInput.style.display = testModeCheckbox.checked ? "block" : "none";
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
    if (!name || name === "Default") {
      displayMessage("Cannot delete the Default profile.", "error");
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
                            📄 ${def.label}
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
                                <span>📄 ${def.label}</span>
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
      version: "26.7.15",
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
      "pit-notes-card": { x: 0, y: 2, width: 1, height: 1 },
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

function renderCardManager(modal) {
  const list = modal.querySelector("#cardManagerList");
  if (!list) return;

  const cards = registry.listCards();
  list.innerHTML = cards
    .filter((id) => id !== "__fallback__")
    .map((id) => {
      const def = registry.get(id);
      const isDev = def.developer || false;
      const isHidden = config.hiddenSections.includes(id);
      return `<div class="card-manager-item">
            <div class="card-manager-item-info">
                <span class="card-manager-item-icon">📄</span>
                <span class="card-manager-item-id">${id}</span>
                <span class="card-manager-item-label">${def.label}</span>
                ${isDev ? '<span class="card-manager-item-badge">Developer</span>' : ""}
                ${def.builtin ? '<span class="card-manager-item-badge builtin">Built-in</span>' : ""}
                ${isHidden ? '<span class="card-manager-item-badge" style="background:rgba(200,50,50,0.2);color:rgb(220,80,80);">Hidden</span>' : ""}
            </div>
            <div class="card-manager-item-actions">
                ${isDev ? `<button class="card-manager-item-delete" data-card-id="${id}">Delete</button>` : ""}
                <button class="card-manager-item-toggle" data-card-id="${id}">
                    ${isHidden ? "Show" : "Hide"}
                </button>
            </div>
        </div>`;
    })
    .join("");

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

  modal.querySelector("#cardManagerExport").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(config.developerCards, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `pitbeacon-cards-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
  });

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
restartAutoSwap();
renderLayout();

document.addEventListener("DOMContentLoaded", () => {
  const versionTag = document.getElementById("version");
  if (versionTag) versionTag.textContent = "Version 26.7.15";
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
