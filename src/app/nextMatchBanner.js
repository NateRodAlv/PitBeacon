// A slim strip under the header: next match, time remaining, alliance colour.
// It turns urgent inside the match alert threshold. Toggle: Settings > Alerts.

import { config, stateManager } from "./context.js";
import { formatCountdown, getNextMatchBanner } from "../core/nextMatch.js";
import { readString } from "../core/storage.js";

const BANNER_HEIGHT = "2.1rem";
let banner = null;
let signature = "";

export function loadBannerPreference() {
  config.showNextMatchBanner = readString("showNextMatchBanner") !== "false"; // default on
}

function build() {
  const el = document.createElement("div");
  el.id = "nextMatchBanner";
  el.className = "nm-banner";
  el.setAttribute("role", "status");
  el.hidden = true;
  for (const cls of ["nm-tag", "nm-match", "nm-time", "nm-alliance"]) {
    const span = document.createElement("span");
    span.className = cls;
    el.appendChild(span);
  }
  return el;
}

function hide() {
  if (!banner) return;
  banner.hidden = true;
  signature = "";
  document.documentElement.style.setProperty("--banner-height", "0px");
}

/** Recompute and redraw. Cheap enough to call on every clock tick. */
export function updateNextMatchBanner() {
  if (!banner) return;
  if (!config.showNextMatchBanner) return hide();

  const state = stateManager.getState();
  const nowSec = Math.floor((state.fullDate?.getTime?.() ?? Date.now()) / 1000);
  const info = getNextMatchBanner({
    matches: state.currentMatches,
    teamNumber: config.teamNumber,
    nowSec,
    alertThreshold: config.matchAlertThreshold,
  });
  if (!info) return hide();

  const time = info.inProgress ? "In progress" : `in ${formatCountdown(info.secondsUntil)}`;
  const next = `${info.label}|${time}|${info.alliance}|${info.urgent}`;
  if (next === signature && !banner.hidden) return;
  signature = next;

  banner.hidden = false;
  banner.dataset.alliance = info.alliance;
  banner.classList.toggle("nm-urgent", info.urgent);
  banner.querySelector(".nm-tag").textContent = info.urgent ? "Match soon" : "Next match";
  banner.querySelector(".nm-match").textContent = info.label;
  banner.querySelector(".nm-time").textContent = time;
  banner.querySelector(".nm-alliance").textContent = info.alliance === "red" ? "Red alliance" : "Blue alliance";
  document.documentElement.style.setProperty("--banner-height", BANNER_HEIGHT);
}

export function initNextMatchBanner() {
  const header = document.getElementById("header");
  if (!header) return;
  banner = build();
  header.insertAdjacentElement("afterend", banner);
  stateManager.subscribe(updateNextMatchBanner);
  updateNextMatchBanner();
}
