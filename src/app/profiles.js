import { config, renderLayout } from "./context.js";
import { DEFAULT_LAYOUT } from "../../config.js";
import { displayMessage } from "../core/notifications.js";

// Profile management

export function captureCurrentLayoutSnapshot() {
  return {
    enabled: true,
    gridCols: config.gridCols,
    gridRows: config.gridRows,
    layout: JSON.parse(JSON.stringify(config.layout || {})),
    hiddenCards: [...(config.hiddenSections || [])],
  };
}

export function saveCurrentAsProfile(name) {
  if (name === "Default") {
    delete config.layoutProfiles["Default"];
    localStorage.setItem(
      "layoutProfiles",
      JSON.stringify(config.layoutProfiles),
    );
  }
  const snapshot = captureCurrentLayoutSnapshot();
  config.layoutProfiles[name] = snapshot;
  config.activeProfileName = name;
  localStorage.setItem("layoutProfiles", JSON.stringify(config.layoutProfiles));
  localStorage.setItem("activeProfileName", name);
  refreshProfileUI();
  displayMessage(`Profile "${name}" saved!`, "message");
}

export function switchToProfile(name) {
  let profile;
  if (name === "Default") {
    profile = {
      gridCols: 3,
      gridRows: 3,
      layout: structuredClone(DEFAULT_LAYOUT),
      hiddenCards: [],
    };
  } else {
    profile = config.layoutProfiles[name];
  }
  if (!profile) {
    displayMessage(`Profile "${name}" not found.`, "error");
    return;
  }

  config.gridCols = profile.gridCols;
  config.gridRows = profile.gridRows;
  config.gridSize = profile.gridCols;
  config.layout = JSON.parse(JSON.stringify(profile.layout));
  config.hiddenSections = profile.hiddenCards || [];
  config.activeProfileName = name;

  localStorage.setItem("gridCols", config.gridCols);
  localStorage.setItem("gridRows", config.gridRows);
  localStorage.setItem("gridSize", config.gridCols);
  localStorage.setItem("layout", JSON.stringify(config.layout));
  localStorage.setItem("hiddenCards", JSON.stringify(config.hiddenSections));
  localStorage.setItem("activeProfileName", name);

  renderLayout();
  refreshProfileUI();
}

export function refreshProfileUI() {
  const sel = document.getElementById("profileSelect");
  if (sel) {
    sel.innerHTML = `<option value="Default">Default</option>`;
    Object.keys(config.layoutProfiles)
      .filter((name) => name !== "Default")
      .forEach((name) => {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        sel.appendChild(opt);
      });
    sel.value = config.activeProfileName || "Default";
  }

  const switcher = document.getElementById("profileSwitcher");
  if (!switcher) return;
  const names = [...Object.keys(config.layoutProfiles)];
  if (names.length <= 1) {
    switcher.innerHTML = "";
    return;
  }
  switcher.innerHTML = names
    .map((name) => {
      const isEnabled = config.layoutProfiles[name].enabled !== false;
      return `  <div class="profile-btn${name === config.activeProfileName ? " profile-btn-active" : ""}" data-profile="${name}">
    ${name}
    <input type="checkbox" class="proftoggle" name="profiletoggle" data-profile="${name}" ${isEnabled ? "checked" : ""}>
  </div>`;
    })
    .join("");
  switcher.querySelectorAll(".profile-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchToProfile(btn.dataset.profile));
  });
  switcher.querySelectorAll("input[name='profiletoggle']").forEach((cb) => {
    cb.addEventListener("click", (event) => {
      event.stopPropagation();
      const name = cb.dataset.profile;
      const profile = config.layoutProfiles[name];
      if (profile) {
        profile.enabled = cb.checked;
        localStorage.setItem(
          "layoutProfiles",
          JSON.stringify(config.layoutProfiles),
        );
        restartAutoSwap();
      }
    });
  });
}

// Auto-swap

let _autoSwapTimer = null;

function getAutoSwapProfileNames() {
  const allNames = [
    "Default",
    ...Object.keys(config.layoutProfiles || {}).filter((name) => name !== "Default"),
  ];
  return allNames.filter((name) => config.layoutProfiles[name]?.enabled !== false);
}

export function restartAutoSwap() {
  if (_autoSwapTimer) {
    clearInterval(_autoSwapTimer);
    _autoSwapTimer = null;
  }
  if (!config.autoSwapEnabled) return;
  const names = getAutoSwapProfileNames();
  if (names.length < 2) return;
  _autoSwapTimer = setInterval(() => {
    const idx = names.indexOf(config.activeProfileName);
    const next = names[(idx + 1) % names.length];
    switchToProfile(next);
  }, config.autoSwapInterval * 1000);
}
