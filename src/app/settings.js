// Settings: loading saved values into config and the form, saving them back,
// and the small amount of wiring the Settings panel needs.

import { config, stateManager, dataSources, registry, devCardRuntime } from "./context.js";
import { displayMessage } from "../core/notifications.js";
import { readString, readJson, writeString, removeKey } from "../core/storage.js";
import { parseSeasonOverride } from "../core/season.js";
import { getNow, parseTestDate } from "../core/clock.js";
import { migrateHiddenList, migrateLayout } from "../core/layoutMigration.js";
import { detectConfigurableSettings } from "../data/cardCatalog.js";
import { getCardSettingValues } from "./cardSettings.js";
import { getData } from "./polling.js";
import {
  refreshProfileUI,
  restartAutoSwap,
  saveCurrentAsProfile,
  switchToProfile,
} from "./profiles.js";
import { loadCustomColors, setupCustomColorsEditor, updateCustomColorPicker } from "./customColors.js";
import { updateTimeDisplay } from "./clock.js";

const $ = (id) => document.getElementById(id);

function parseJson(key, fallback) {
  return readJson(key, fallback);
}

function registerDeveloperCards() {
  const stored = parseJson("developerCards", null);
  if (!stored || typeof stored !== "object") return;
  config.developerCards = stored;
  for (const [id, def] of Object.entries(stored)) {
    def.settings = def.settings && Object.keys(def.settings).length ? def.settings : detectConfigurableSettings(def.js || "");
    def.settingsValues = getCardSettingValues({ id, ...def });
    registry.register(id, devCardRuntime.createCardDefinition(id, def));
  }
}

export function loadSettings() {
  const teamNumber = readString("teamNumber");
  if (teamNumber) {
    config.teamNumber = teamNumber;
    $("teamNumber").value = teamNumber;
    stateManager.update({ teamNumber: Number.parseInt(teamNumber, 10) });
  }
  const tbaKey = readString("tbaapikey");
  if (tbaKey) {
    config.tbaapikey = tbaKey;
    $("tbaapikey").value = tbaKey;
  }
  const match13Key = readString("match13apikey");
  if (match13Key) {
    config.match13apikey = match13Key;
    $("match13apikey").value = match13Key;
  }

  config.theme = readString("theme", "dark");
  document.documentElement.setAttribute("data-theme", config.theme);

  config.noteAlarmToggle = readString("noteAlarmToggle") === "true";
  config.noteAlarmSound = readString("noteAlarmSound", "alarm1");
  $("noteAlarmToggle").checked = config.noteAlarmToggle;
  $("noteAlarmSound").value = config.noteAlarmSound;

  config.matchAlarmToggle = readString("matchAlarmToggle") !== "false";
  config.matchAlertThreshold = Number.parseInt(readString("matchAlertThreshold", "300"), 10) || 300;
  config.matchAlarmSound = readString("matchAlarmSound", "alarm1");
  $("matchAlarmToggle").checked = config.matchAlarmToggle;
  $("matchAlertThreshold").value = config.matchAlertThreshold;
  $("matchAlarmSound").value = config.matchAlarmSound;

  config.gridCols = Number.parseInt(readString("gridCols", config.gridCols), 10) || config.gridCols;
  config.gridRows = Number.parseInt(readString("gridRows", config.gridRows), 10) || config.gridRows;
  config.gridSize = config.gridCols;

  const layout = parseJson("layout", null);
  if (layout && typeof layout === "object") config.layout = migrateLayout(layout);

  const hidden = parseJson("hiddenCards", null);
  config.hiddenSections = Array.isArray(hidden) ? migrateHiddenList(hidden) : [];

  const profiles = parseJson("layoutProfiles", null);
  config.layoutProfiles = profiles && typeof profiles === "object" ? profiles : {};
  for (const profile of Object.values(config.layoutProfiles)) {
    if (!profile || typeof profile !== "object") continue;
    migrateLayout(profile.layout);
    if (Array.isArray(profile.hiddenCards)) profile.hiddenCards = migrateHiddenList(profile.hiddenCards);
  }
  config.activeProfileName = readString("activeProfileName", "Default");

  registerDeveloperCards();

  config.seasonYearOverride = readString("seasonYearOverride", "") || "";
  $("seasonYearOverride").value = config.seasonYearOverride;

  config.testMode = readString("testMode") === "true";
  config.testDate = readString("testDate", "");
  $("testMode").checked = config.testMode;
  if (config.testDate) $("testDate").value = config.testDate;
  $("testDate").style.display = config.testMode ? "block" : "none";
  const now = getNow(config);
  stateManager.update({ fullDate: now, isTestMode: config.testMode && now !== null });

  config.autoSwapEnabled = readString("autoSwapEnabled") === "true";
  config.autoSwapInterval = Number.parseInt(readString("autoSwapInterval", "30"), 10) || 30;
  $("autoSwapEnabled").checked = config.autoSwapEnabled;
  $("autoSwapInterval").value = config.autoSwapInterval;

  refreshProfileUI();
  loadCustomColors();
}

function saveSettings() {
  config.teamNumber = $("teamNumber").value.trim();
  config.tbaapikey = $("tbaapikey").value.trim();
  config.match13apikey = $("match13apikey").value.trim();
  config.noteAlarmToggle = $("noteAlarmToggle").checked;
  config.noteAlarmSound = $("noteAlarmSound").value;
  config.matchAlarmToggle = $("matchAlarmToggle").checked;
  config.matchAlertThreshold = Number.parseInt($("matchAlertThreshold").value, 10) || 300;
  config.matchAlarmSound = $("matchAlarmSound").value;
  config.autoSwapEnabled = $("autoSwapEnabled").checked;
  config.autoSwapInterval = Number.parseInt($("autoSwapInterval").value, 10) || 30;

  const season = parseSeasonOverride($("seasonYearOverride").value);
  config.seasonYearOverride = season ? String(season) : "";

  const testMode = $("testMode").checked;
  const testDate = $("testDate").value.trim();
  if (testMode && !parseTestDate(testDate)) {
    displayMessage("Test Mode needs a date like 2026-04-26.", "error");
    return false;
  }
  config.testMode = testMode;
  config.testDate = testMode ? testDate : "";

  stateManager.update({ teamNumber: Number.parseInt(config.teamNumber, 10) || config.teamNumber });

  writeString("teamNumber", config.teamNumber);
  writeString("tbaapikey", config.tbaapikey);
  writeString("match13apikey", config.match13apikey);
  writeString("theme", config.theme);
  writeString("noteAlarmToggle", config.noteAlarmToggle);
  writeString("noteAlarmSound", config.noteAlarmSound);
  writeString("matchAlarmToggle", config.matchAlarmToggle);
  writeString("matchAlertThreshold", config.matchAlertThreshold);
  writeString("matchAlarmSound", config.matchAlarmSound);
  writeString("autoSwapEnabled", config.autoSwapEnabled);
  writeString("autoSwapInterval", config.autoSwapInterval);
  writeString("seasonYearOverride", config.seasonYearOverride);
  writeString("testMode", config.testMode);
  if (config.testMode) writeString("testDate", config.testDate);
  else removeKey("testDate");

  document.documentElement.setAttribute("data-theme", config.theme);
  restartAutoSwap();
  dataSources.updateConfig(config);
  updateTimeDisplay();
  return true;
}

export function setupSettingsListeners() {
  const panel = $("settingscontainer");
  const testMode = $("testMode");
  const testDate = $("testDate");

  testMode.addEventListener("change", () => {
    testDate.style.display = testMode.checked ? "block" : "none";
  });

  // The gear toggles the panel; Escape closes it without saving.
  $("settings").addEventListener("click", () => {
    panel.style.display = panel.style.display === "flex" ? "none" : "flex";
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && panel.style.display === "flex" && !document.querySelector(".active")) {
      panel.style.display = "none";
    }
  });

  $("savebutton").addEventListener("click", () => {
    if (!saveSettings()) return;
    displayMessage("Settings saved.", "message");
    panel.style.display = "none";
    getData();
  });

  $("hideTopBtn").addEventListener("click", () => {
    const header = $("header");
    const hidden = header.classList.toggle("hidden");
    document.documentElement.style.setProperty("--header-height", hidden ? "0px" : "4.5rem");
  });

  setupCustomColorsEditor($("customColorsModal"));
  $("openCustomColorsBtn")?.addEventListener("click", () => {
    const modal = $("customColorsModal");
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    updateCustomColorPicker();
    modal.querySelector("#customColorVariable")?.focus();
  });

  $("saveProfileBtn")?.addEventListener("click", () => {
    const input = $("newProfileName");
    saveCurrentAsProfile(input.value.trim() || config.activeProfileName || "Default");
    input.value = "";
  });

  $("deleteProfileBtn")?.addEventListener("click", () => {
    const name = $("profileSelect").value;
    if (name === "Default") {
      displayMessage("The Default profile can't be deleted.", "error");
      return;
    }
    if (!confirm(`Delete profile "${name}"?`)) return;
    delete config.layoutProfiles[name];
    writeString("layoutProfiles", JSON.stringify(config.layoutProfiles));
    if (config.activeProfileName === name) {
      config.activeProfileName = "Default";
      writeString("activeProfileName", "Default");
    }
    refreshProfileUI();
    displayMessage(`Profile "${name}" deleted.`, "message");
  });

  $("profileSelect")?.addEventListener("change", (event) => switchToProfile(event.target.value));
  $("errorcontainer").addEventListener("click", (event) => {
    if (event.target.classList.contains("error-exit")) event.target.parentElement.remove();
  });
}

/** First run: open Settings so the team number and TBA key can be entered. */
export function openSettingsIfUnconfigured() {
  if (!readString("tbaapikey")) $("settingscontainer").style.display = "flex";
}

