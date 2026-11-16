// Offline support: registers the service worker, offers updates without ever
// reloading mid-use, and shows in Settings whether this device is ready for a
// venue with bad Wi-Fi.

import { registerSW } from "virtual:pwa-register";
import { config } from "./context.js";
import { loadSnapshot } from "../data/snapshotCache.js";

const $ = (id) => document.getElementById(id);

let swReady = false;
let updateSW = null;

function showUpdateBanner() {
  if ($("updateBanner")) return;
  const banner = document.createElement("div");
  banner.className = "update-banner";
  banner.id = "updateBanner";
  banner.setAttribute("role", "status");

  const text = document.createElement("span");
  text.textContent = "A new version of PitBeacon is ready.";
  const reload = document.createElement("button");
  reload.type = "button";
  reload.className = "savebutton";
  reload.style.margin = "0";
  reload.textContent = "Reload";
  reload.addEventListener("click", () => updateSW?.(true));
  const later = document.createElement("button");
  later.type = "button";
  later.className = "savebutton";
  later.style.cssText = "margin:0;background:transparent;border:1px solid var(--border)";
  later.textContent = "Later";
  later.addEventListener("click", () => banner.remove());
  banner.append(text, reload, later);
  document.body.appendChild(banner);
}

export function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || import.meta.env.DEV) return;
  updateSW = registerSW({
    onNeedRefresh: showUpdateBanner,
    onOfflineReady() {
      swReady = true;
      renderOfflineStatus();
    },
    onRegisteredSW() {
      swReady = true;
      renderOfflineStatus();
    },
  });
}

// The 3D viewer keeps its model in its own database (unchanged from the old card, so saved models carry over).
function modelStored() {
  return new Promise((resolve) => {
    if (!window.indexedDB) return resolve(false);
    const request = indexedDB.open("pitbeacon-robot-viewer-v2", 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("models");
      request.result.createObjectStore("libs");
    };
    request.onerror = () => resolve(false);
    request.onsuccess = () => {
      const db = request.result;
      try {
        const get = db.transaction("models", "readonly").objectStore("models").get("last");
        get.onsuccess = () => {
          db.close();
          resolve(Boolean(get.result?.files?.length));
        };
        get.onerror = () => {
          db.close();
          resolve(false);
        };
      } catch {
        db.close();
        resolve(false);
      }
    };
  });
}

export async function renderOfflineStatus() {
  const list = $("offlineReady");
  if (!list) return;

  const controlled = Boolean(navigator.serviceWorker?.controller);
  const [snapshot, model] = await Promise.all([loadSnapshot(config.teamNumber).catch(() => null), modelStored()]);

  const rows = [
    {
      ok: controlled,
      text: controlled
        ? "App saved on this device"
        : swReady
          ? "App is being saved. Reload once to finish."
          : "App not saved yet (needs a normal https page load)",
    },
    {
      ok: Boolean(snapshot),
      text: snapshot ? "Latest event data saved" : "No event data saved yet (appears after the first update)",
    },
    { ok: model, text: model ? "Robot model saved" : "No robot model loaded (optional)" },
  ];
  list.replaceChildren(
    ...rows.map((row) => {
      const item = document.createElement("li");
      item.dataset.ok = String(row.ok);
      item.textContent = row.text;
      return item;
    }),
  );

  const note = $("offlineStorage");
  if (note && navigator.storage?.estimate) {
    try {
      const { usage = 0, quota = 0 } = await navigator.storage.estimate();
      const persisted = (await navigator.storage.persisted?.()) ? " Protected from automatic cleanup." : "";
      note.textContent = `Using ${(usage / 1048576).toFixed(1)} MB of ${(quota / 1048576).toFixed(0)} MB.${persisted}`;
    } catch {
      note.textContent = "";
    }
  }
}

/** Ask the browser not to evict our caches and models when storage runs low. */
export async function requestPersistentStorage() {
  try {
    await navigator.storage?.persist?.();
  } catch {
    /* not supported; harmless */
  }
}

export function initOfflineStatus() {
  renderOfflineStatus();
  $("settings")?.addEventListener("click", renderOfflineStatus);
  window.addEventListener("online", renderOfflineStatus);
  navigator.serviceWorker?.addEventListener("controllerchange", renderOfflineStatus);
}
