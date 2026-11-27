import { stateManager } from "./context.js";

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/** A small header chip that appears whenever the display is showing saved or stale data. */
export function initConnectionStatus() {
  const chip = document.getElementById("netStatus");
  if (!chip) return;

  const render = () => {
    const status = stateManager.getState().dataStatus;
    const offline = typeof navigator !== "undefined" && navigator.onLine === false;
    const stale = offline || Boolean(status?.stale);
    chip.hidden = !stale;
    if (!stale) return;
    const label = offline ? "Offline" : "Connection issue";
    chip.textContent = status?.lastUpdate
      ? `${label} · data from ${formatTime(status.lastUpdate)}`
      : label;
  };

  stateManager.subscribe(render);
  window.addEventListener("online", render);
  window.addEventListener("offline", render);
  render();
}
