// Portrait mode.
// config.portraitMode: "auto" | "landscape" | "rotate-cw" | "rotate-ccw"
//  - rotate-*: turns the whole page 90deg (for a physically rotated monitor
//    that still sends a landscape signal) and uses the portrait card layout.
//  - auto: uses the portrait card layout only when the screen itself is portrait.

import { config, renderLayout } from "./context.js";
import { readString, writeString } from "../core/storage.js";

const portraitQuery = window.matchMedia("(orientation: portrait)");
const isRotated = (mode) => mode === "rotate-cw" || mode === "rotate-ccw";

export function applyOrientation(rerender = true) {
  const mode = config.portraitMode || "auto";
  const rotated = isRotated(mode);
  const nativePortrait = mode === "auto" && portraitQuery.matches;
  const root = document.documentElement;

  root.classList.toggle("rotate-cw", mode === "rotate-cw");
  root.classList.toggle("rotate-ccw", mode === "rotate-ccw");
  root.classList.toggle("portrait-layout", rotated || nativePortrait);
  config.portraitLayout = rotated || nativePortrait;

  const btn = document.getElementById("portraitBtn");
  if (btn) {
    btn.classList.toggle("active", rotated);
    btn.setAttribute("aria-pressed", String(rotated));
  }

  if (rerender) renderLayout();
}

export function loadOrientation() {
  config.portraitMode = readString("portraitMode", "auto");
  const select = document.getElementById("portraitMode");
  if (select) select.value = config.portraitMode;
  applyOrientation(false);
}

export function setPortraitMode(mode) {
  config.portraitMode = mode;
  writeString("portraitMode", mode);
  const select = document.getElementById("portraitMode");
  if (select) select.value = mode;
  applyOrientation();
}

/** Header quick toggle (rotated portrait <-> landscape) and screen-change listener. */
export function initOrientation() {
  document.getElementById("portraitBtn")?.addEventListener("click", () => {
    setPortraitMode(isRotated(config.portraitMode) ? "landscape" : "rotate-cw");
  });
  portraitQuery.addEventListener("change", () => applyOrientation());
}
