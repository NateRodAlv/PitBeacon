import { config } from "./context.js";
import { displayMessage } from "../core/notifications.js";

export function saveCustomColors() {
  const COLOR_VARS = [
    "--bg-base",
    "--bg-surface",
    "--bg-raised",
    "--bg-input",
    "--accent",
    "--accent-hover",
    "--border",
    "--border-accent",
    "--text-primary",
    "--text-muted",
    "--text-dim",
    "--scrollbar-track",
    "--scrollbar-thumb",
    "--scrollbar-thumb-hover",
  ];
  const overrides = {};
  COLOR_VARS.forEach((v) => {
    const val = document.documentElement.style.getPropertyValue(v).trim();
    if (val) overrides[v] = val;
  });
  localStorage.setItem("customColors", JSON.stringify(overrides));
}

export function loadCustomColors() {
  try {
    const saved = JSON.parse(localStorage.getItem("customColors") || "{}");
    Object.entries(saved).forEach(([k, v]) =>
      document.documentElement.style.setProperty(k, v),
    );
  } catch {}
}

export function getCustomColors() {
  const COLOR_VARS = [
    "--bg-base",
    "--bg-surface",
    "--bg-raised",
    "--bg-input",
    "--accent",
    "--accent-hover",
    "--border",
    "--border-accent",
    "--text-primary",
    "--text-muted",
    "--text-dim",
    "--scrollbar-track",
    "--scrollbar-thumb",
    "--scrollbar-thumb-hover",
  ];
  const result = {};
  COLOR_VARS.forEach((v) => {
    const val = document.documentElement.style.getPropertyValue(v).trim();
    if (val) result[v] = val;
  });
  return result;
}

export function rgbToHex(rgb) {
  const match = rgb.match(/\d+/g);
  if (!match) return rgb;
  return (
    "#" +
    match
      .slice(0, 3)
      .map((value) => parseInt(value).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

export function updateCustomColorPicker() {
  const colorEl = document.getElementById("customColorVariable");
  const colorPick = document.getElementById("customColorPicker");
  const colorHex = document.getElementById("customColorHex");
  if (!colorEl || !colorPick || !colorHex) return;

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(colorEl.value)
    .trim();
  const hex = value.startsWith("rgb") ? rgbToHex(value) : value;
  colorHex.textContent = hex;
  if (hex.startsWith("#")) colorPick.value = hex;
}

export function setupCustomColorsEditor(modal) {
  const colorEl = modal.querySelector("#customColorVariable");
  const colorPick = modal.querySelector("#customColorPicker");
  const colorReset = modal.querySelector("#customColorReset");
  const closeButton = modal.querySelector("#customColorsClose");

  colorEl.addEventListener("change", updateCustomColorPicker);
  colorPick.addEventListener("input", () => {
    document.documentElement.style.setProperty(colorEl.value, colorPick.value);
    document.getElementById("customColorHex").textContent = colorPick.value;
    saveCustomColors();
  });

  colorReset.addEventListener("click", () => {
    const defaultColors = {
      dark: {
        "--bg-base": "rgb(22, 22, 22)",
        "--bg-surface": "rgb(30, 30, 30)",
        "--bg-raised": "rgb(40, 40, 40)",
        "--bg-input": "rgb(50, 50, 50)",
        "--accent": "rgb(47, 48, 112)",
        "--accent-hover": "rgb(60, 62, 140)",
        "--border": "rgba(255, 255, 255, 0.07)",
        "--border-accent": "rgba(47, 48, 112, 0.6)",
        "--text-primary": "rgb(240, 240, 240)",
        "--text-muted": "rgb(160, 155, 155)",
        "--text-dim": "rgb(100, 98, 98)",
      },
      light: {
        "--bg-base": "rgb(245, 245, 247)",
        "--bg-surface": "rgb(235, 235, 238)",
        "--bg-raised": "rgb(225, 225, 230)",
        "--bg-input": "rgb(210, 210, 215)",
        "--accent": "rgb(47, 48, 112)",
        "--accent-hover": "rgb(70, 72, 160)",
        "--border": "rgba(0, 0, 0, 0.1)",
        "--border-accent": "rgba(47, 48, 112, 0.3)",
        "--text-primary": "rgb(20, 20, 22)",
        "--text-muted": "rgb(80, 85, 90)",
        "--text-dim": "rgb(130, 135, 140)",
      },
      "high-contrast": {
        "--bg-base": "rgb(0, 0, 0)",
        "--bg-surface": "rgb(15, 15, 15)",
        "--bg-raised": "rgb(30, 30, 30)",
        "--bg-input": "rgb(50, 50, 50)",
        "--accent": "rgb(0, 255, 255)",
        "--accent-hover": "rgb(0, 200, 200)",
        "--border": "rgba(0, 255, 255, 0.3)",
        "--border-accent": "rgba(0, 255, 255, 0.6)",
        "--text-primary": "rgb(255, 255, 255)",
        "--text-muted": "rgb(200, 200, 200)",
        "--text-dim": "rgb(150, 150, 150)",
      },
    };
    const variable = colorEl.value;
    const defaultValue = defaultColors[config.theme || "dark"]?.[variable];
    if (!defaultValue) return;

    document.documentElement.style.setProperty(variable, defaultValue);
    const customColors = JSON.parse(
      localStorage.getItem("customColors") || "{}",
    );
    delete customColors[variable];
    localStorage.setItem("customColors", JSON.stringify(customColors));
    updateCustomColorPicker();
    displayMessage(`Reset ${variable} to default`, "message");
  });

  const close = () => {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.getElementById("openCustomColorsBtn").focus();
  };
  closeButton.addEventListener("click", close);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("active")) close();
  });
}

