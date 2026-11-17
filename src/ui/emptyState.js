// Empty-state block shared by the built-in cards: what is wrong, then the next step.
// Everything goes through textContent, so card or event data can never inject markup.

import { config } from "../../config.js";
import { describeEmpty } from "../core/emptyState.js";

export const OPEN_SETTINGS_EVENT = "pitbeacon:open-settings";

/** Context the empty-state copy depends on, read from the live app state. */
export function emptyContext(state) {
  return {
    tbaKey: config.tbaapikey,
    online: typeof navigator === "undefined" ? true : navigator.onLine !== false,
    hasEvent: Boolean(state?.currentEventData),
    teamNumber: config.teamNumber,
  };
}

/** Why a data card is empty right now (used to decide when a card must redraw). */
export function emptyInfoFor(kind, state) {
  return describeEmpty(kind, emptyContext(state));
}

/** Replace `container`'s contents with an empty-state block for `info` ({title, body, action}). */
export function renderEmptyInfo(container, info) {
  const box = document.createElement("div");
  box.className = "empty-state";
  box.dataset.reason = info.reason || "";

  const title = document.createElement("strong");
  title.className = "empty-state-title";
  title.textContent = info.title;
  const body = document.createElement("p");
  body.className = "empty-state-body";
  body.textContent = info.body;
  box.append(title, body);

  const action = info.actionLabel || (info.action === "settings" ? "Open Settings" : null);
  const onAction = info.onAction || (info.action === "settings" ? () => window.dispatchEvent(new CustomEvent(OPEN_SETTINGS_EVENT)) : null);
  if (action && onAction) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "empty-state-action";
    button.textContent = action;
    button.addEventListener("click", onAction);
    box.appendChild(button);
  }
  container.replaceChildren(box);
  return box;
}

export function renderEmptyState(container, kind, state) {
  return renderEmptyInfo(container, emptyInfoFor(kind, state));
}
