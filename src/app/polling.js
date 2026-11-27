import { config, stateManager, dataSources, renderer } from "./context.js";
import { displayMessage } from "../core/notifications.js";
import { loadSnapshot, saveSnapshot } from "../data/snapshotCache.js";

const MIN_DELAY_MS = 30_000;
const SPREAD_MS = 30_000;

let inFlight = null;
let timer = null;

async function refresh() {
  try {
    const result = await dataSources.fetchAll();
    if (!result) return;

    const summary = await dataSources.fetchTeamSummary(result.eventData?.key);
    stateManager.update({
      currentMatches: result.matches,
      currentEventData: result.eventData,
      currentRankings: result.rankings,
      currentTeamSummaryData: summary,
      dataStatus: { stale: result.stale, lastUpdate: result.fetchedAt, source: "live" },
    });
    renderer.updateCards(stateManager.getState());

    if (!result.stale && (result.matches || result.eventData)) {
      saveSnapshot({
        teamNumber: config.teamNumber,
        matches: result.matches,
        eventData: result.eventData,
        rankings: result.rankings,
        teamSummary: summary,
      });
    }
  } catch (error) {
    displayMessage(`Network Error: ${error.message}`, "error");
  }
}

/** Fetch now. Concurrent callers share one in-flight request. */
export function getData() {
  if (!inFlight) {
    inFlight = refresh().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

/** Show the last saved event data right away, before (or without) a network round trip. */
export async function restoreSnapshot() {
  const snapshot = await loadSnapshot(config.teamNumber);
  if (!snapshot) return false;
  if (stateManager.getState().dataStatus?.source === "live") return false;

  stateManager.update({
    currentMatches: snapshot.matches,
    currentEventData: snapshot.eventData,
    currentRankings: snapshot.rankings,
    currentTeamSummaryData: snapshot.teamSummary,
    dataStatus: { stale: true, lastUpdate: snapshot.savedAt, source: "cache" },
  });
  renderer.updateCards(stateManager.getState());
  return true;
}

function scheduleNext() {
  timer = setTimeout(
    () => {
      getData();
      scheduleNext();
    },
    MIN_DELAY_MS + Math.random() * SPREAD_MS,
  );
}

export function startPolling() {
  getData();
  scheduleNext();
  // Refresh as soon as the connection or the screen comes back.
  window.addEventListener("online", () => getData());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") getData();
  });
}

export function stopPolling() {
  clearTimeout(timer);
  timer = null;
}

// Cards (the stats card) call sdk.refreshTeamData(), which lands here.
export function installTeamDataBridge() {
  window.pitbeaconRefreshTeamData = async () => {
    const eventKey = stateManager.getState().currentEventData?.key;
    const summary = await dataSources.fetchTeamSummary(eventKey);
    stateManager.update({ currentTeamSummaryData: summary });
    renderer.updateCards(stateManager.getState());
    return summary;
  };
}
