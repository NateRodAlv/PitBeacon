// PitBeacon entry point. Everything real lives in the modules imported here;
// this file only registers the built-in cards and starts the app in order.

import "./styles/main.css";
import "@fontsource-variable/rubik";
import "@fontsource-variable/quicksand";

import { config, registry, renderer, stateManager, dataSources, sdk, devCardRuntime, renderLayout } from "./app/context.js";
import { FallbackCard } from "./cards/fallbackCard.js";
import { createWebcastCard } from "./cards/builtin/webcastCard.js";
import { createMatchCard } from "./cards/builtin/matchCard.js";
import { createLeaderboardCard } from "./cards/builtin/leaderboardCard.js";
import { createPitNotesCard } from "./cards/builtin/pitNotesCard.js";
import { createRobotViewerCard } from "./cards/builtin/robotViewerCard.js";
import { createStatsCard } from "./cards/builtin/statsCard.js";
import { createRobotSummaryCard } from "./cards/builtin/robotSummaryCard.js";
import { installNotificationBridge } from "./core/notifications.js";
import { startClock } from "./app/clock.js";
import { installTeamDataBridge, restoreSnapshot, startPolling } from "./app/polling.js";
import { initConnectionStatus } from "./app/connectionStatus.js";
import { restartAutoSwap } from "./app/profiles.js";
import { initCardsModal, openCardsModal } from "./app/cardsModal.js";
import { openLayoutEditor } from "./app/layoutEditor.js";
import { loadSettings, setupSettingsListeners } from "./app/settings.js";
import { initOrientation } from "./app/orientation.js";
import { initCardStatus } from "./app/cardStatus.js";
import { initNextMatchBanner } from "./app/nextMatchBanner.js";
import { startOnboarding } from "./app/onboarding.js";
import {
  loadEasterEggPreference,
  scheduleEasterEgg,
  toggleEasterEggs,
  updateEasterEggToggle,
} from "./app/easterEggs.js";
import { initOfflineStatus, registerServiceWorker, requestPersistentStorage } from "./app/offline.js";

installNotificationBridge();
window.pitbeaconGlobal = sdk;

registry.register("webcast-card", createWebcastCard());
registry.register("match-card", createMatchCard());
registry.register("leaderboard-card", createLeaderboardCard());
registry.register("pit-notes-card", createPitNotesCard());
registry.register("robot-viewer-card", createRobotViewerCard());
registry.register("stats-card", createStatsCard());
registry.register("robot-summary-card", createRobotSummaryCard());
registry.register("__fallback__", FallbackCard);

function setupHeader() {
  const version = document.getElementById("version");
  if (version) version.textContent = `Version ${__APP_VERSION__}`;

  const logo = document.querySelector(".logo-img");
  logo?.addEventListener("click", toggleEasterEggs);
  logo?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleEasterEggs();
    }
  });

  document.getElementById("cardsBtn")?.addEventListener("click", () => openCardsModal());
  document.getElementById("layoutEditorBtn")?.addEventListener("click", openLayoutEditor);
}

function start() {
  const easterEggsOn = loadEasterEggPreference();
  loadSettings();
  setupSettingsListeners();
  setupHeader();
  initOrientation();
  updateEasterEggToggle();
  initCardsModal();
  initConnectionStatus();
  initOfflineStatus();

  installTeamDataBridge();
  initNextMatchBanner();
  renderLayout();
  initCardStatus();
  restartAutoSwap();
  if (easterEggsOn) scheduleEasterEgg();

  startClock();
  // Show the last saved event data immediately, then refresh from the network.
  restoreSnapshot().finally(startPolling);

  registerServiceWorker();
  requestPersistentStorage();
  startOnboarding();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
else start();

// Handy from the browser console while debugging.
window.__PITBEACON_DEBUG = { config, stateManager, registry, dataSources, renderer, devCardRuntime };
