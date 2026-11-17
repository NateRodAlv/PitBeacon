// Robot Viewer: the 3D model viewer, built in. It runs as a first-party page in a
// same-origin iframe (viewer.html) so its WebGL loop and large model files stay
// isolated from the rest of the dashboard, and it works offline from the app cache.
// The card forwards theme colours and "focus this part" requests from other cards.

import { displayMessage } from "../../core/notifications.js";
import { FOCUS_PART_EVENT } from "./pitNotesCard.js";
import { MODEL_SAVED_EVENT } from "../../data/robotModel.js";

const THEME_VARS = ["--text-primary", "--text-muted", "--border", "--accent", "--bg-input"];

function themeSnapshot() {
  const style = getComputedStyle(document.documentElement);
  const vars = {};
  for (const name of THEME_VARS) {
    const value = style.getPropertyValue(name).trim();
    if (value) vars[name] = value;
  }
  return vars;
}

export function createRobotViewerCard() {
  return {
    id: "robot-viewer-card",
    label: "Robot Viewer",
    icon: "cube",
    builtin: true,
    statusSource: "local",
    selfRefresh: true,
    settings: {},
    render(element) {
      element.selfRefresh = true;
      if (element._robotViewer) return;

      const frame = document.createElement("iframe");
      frame.className = "robot-viewer-frame";
      frame.title = "3D robot viewer";
      frame.src = new URL("viewer.html", document.baseURI).href;
      frame.setAttribute("allow", "fullscreen");
      frame.loading = "eager";
      element.replaceChildren(frame);

      const post = (message) => frame.contentWindow?.postMessage({ source: "pitbeacon", ...message }, location.origin);
      const sendTheme = () => post({ type: "theme", vars: themeSnapshot() });

      const onFocus = (event) => {
        const partId = event.detail?.partId;
        if (partId) post({ type: "focus-part", partId });
      };
      const onMessage = (event) => {
        if (event.origin !== location.origin || event.source !== frame.contentWindow) return;
        const data = event.data;
        if (data?.source !== "pitbeacon-viewer") return;
        if (data.type === "ready") sendTheme();
        else if (data.type === "notify" && typeof data.message === "string") {
          displayMessage(data.message, data.level === "error" ? "error" : "message");
        }
      };
      const observer = new MutationObserver(sendTheme);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "class", "data-theme"] });

      // A model saved by the setup wizard: reload the viewer so it picks it up.
      const onModelSaved = () => frame.contentWindow?.location.reload();
      const cleanup = () => {
        window.removeEventListener(MODEL_SAVED_EVENT, onModelSaved);
        window.removeEventListener(FOCUS_PART_EVENT, onFocus);
        window.removeEventListener("message", onMessage);
        observer.disconnect();
        element._robotViewer = null;
      };
      window.addEventListener(MODEL_SAVED_EVENT, onModelSaved);
      window.addEventListener(FOCUS_PART_EVENT, onFocus);
      window.addEventListener("message", onMessage);
      frame.addEventListener("load", sendTheme);
      // Stop listening once the card leaves the page (layout change, card hidden).
      const watcher = new MutationObserver(() => {
        if (!element.isConnected || !element.contains(frame)) {
          watcher.disconnect();
          cleanup();
        }
      });
      watcher.observe(document.body, { childList: true, subtree: true });

      element._robotViewer = { frame, post };
    },
  };
}
