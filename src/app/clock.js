import { config, stateManager, audioFiles } from "./context.js";
import { displayMessage } from "../core/notifications.js";
import { findMatchAlert, getNow } from "../core/clock.js";

export { getNow };

function checkMatchAlert(state, now) {
  const alert = findMatchAlert(state.currentMatches, {
    teamNumber: config.teamNumber,
    nowSeconds: Math.floor(now.getTime() / 1000),
    thresholdSeconds: config.matchAlertThreshold,
    lastAlertId: state.lastMatchAlertId,
  });
  if (!alert) return;

  const sound = audioFiles[config.matchAlarmSound] || audioFiles.alarm1;
  sound.currentTime = 0;
  sound.play().catch((err) => console.log("Audio play failed:", err));
  stateManager.update({ lastMatchAlertId: alert.matchId });

  const minutes = Math.floor(alert.secondsUntil / 60);
  const seconds = Math.floor(alert.secondsUntil % 60);
  displayMessage(
    `Match Alert: ${alert.match.comp_level.toUpperCase()} ${alert.match.match_number} in ${minutes}m ${seconds}s!`,
    "message",
  );
}

export function updateTimeDisplay() {
  const now = getNow(config);
  const display = document.getElementById("time-display");
  if (display) display.textContent = now.toLocaleTimeString("en-US", { hour12: true });

  stateManager.update({ fullDate: now, isTestMode: Boolean(config.testMode) });

  const state = stateManager.getState();
  if (state.currentMatches && config.matchAlarmToggle) checkMatchAlert(state, now);
}

export function startClock() {
  updateTimeDisplay();
  return setInterval(updateTimeDisplay, 1000);
}
