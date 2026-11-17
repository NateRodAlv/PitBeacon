// The small coloured dot in the corner of each built-in card: how fresh is the data?

import { stateManager, renderer, registry } from "./context.js";
import { describeFreshness, getFreshness } from "../core/freshness.js";

export const CARD_STATUS_EVENT = "pitbeacon:card-status";

const LOCAL_TIP = "Saved on this device · always available";

function statusFor(cardId, state, online, now) {
  const def = registry.get(cardId);
  const element = renderer.getCardElement(cardId);
  // A card that fetches its own data (Team Stats) reports through element._cardStatus.
  const own = element?._cardStatus;
  if (own) return { ...own, tip: describeFreshness(own) };
  if (def?.statusSource === "local") return { state: "local", color: "green", tip: LOCAL_TIP };
  const freshness = getFreshness({ status: state.dataStatus, online, now });
  return { ...freshness, tip: describeFreshness(freshness) };
}

function update() {
  const state = stateManager.getState();
  const online = navigator.onLine !== false;
  const now = Date.now();
  for (const [cardId, dot] of renderer.getDots()) {
    const status = statusFor(cardId, state, online, now);
    const label = `${registry.get(cardId)?.label ?? "Card"}: ${status.tip}`;
    if (dot.dataset.color !== status.color) dot.dataset.color = status.color;
    if (dot.title !== label) {
      dot.title = label;
      dot.setAttribute("aria-label", label);
    }
  }
}

export function initCardStatus() {
  stateManager.subscribe((_state, changed) => {
    // fullDate ticks every second; the dot only needs to react to data changes and to age.
    if (changed.some((key) => key !== "fullDate")) update();
  });
  window.addEventListener("pitbeacon:layout-rendered", update);
  window.addEventListener(CARD_STATUS_EVENT, update);
  window.addEventListener("online", () => {
    update();
    renderer.updateCards(stateManager.getState());
  });
  window.addEventListener("offline", () => {
    update();
    renderer.updateCards(stateManager.getState());
  });
  // Data ages even when nothing changes: fresh -> stale happens on a timer.
  setInterval(update, 15_000);
  update();
}
