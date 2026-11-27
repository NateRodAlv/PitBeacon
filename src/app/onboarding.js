// First-run setup wizard and the one-time "What's new in 2027" card.
// Both are plain dialogs built with textContent; neither blocks the app.

import { config } from "./context.js";
import { applyBasicSettings } from "./settings.js";
import { saveCustomColors } from "./customColors.js";
import { hasRealTbaKey } from "../data/tba.js";
import { readModelFiles, saveRobotModel, MODEL_EXTENSIONS } from "../data/robotModel.js";
import { getNow } from "../core/clock.js";
import { readString, writeString } from "../core/storage.js";

export const RUN_WIZARD_EVENT = "pitbeacon:run-wizard";
export const SHOW_WELCOME_EVENT = "pitbeacon:show-welcome";
const WIZARD_KEY = "setupWizardDone"; // "true" (finished) or "skipped"
const WELCOME_KEY = "welcomeDismissed2027";
const TBA_STATUS_URL = "https://www.thebluealliance.com/api/v3/status";

const ACCENT_VARS = ["--accent", "--accent-hover", "--border-accent"];
const ACCENTS = [
  { name: "Indigo (default)", values: null },
  { name: "Blue", values: ["rgb(30, 90, 200)", "rgb(50, 110, 220)", "rgba(30, 90, 200, 0.6)"] },
  { name: "Green", values: ["rgb(22, 120, 70)", "rgb(30, 145, 88)", "rgba(22, 120, 70, 0.6)"] },
  { name: "Crimson", values: ["rgb(150, 30, 45)", "rgb(180, 45, 62)", "rgba(150, 30, 45, 0.6)"] },
  { name: "Amber", values: ["rgb(170, 105, 10)", "rgb(200, 128, 20)", "rgba(170, 105, 10, 0.6)"] },
  { name: "Violet", values: ["rgb(100, 50, 160)", "rgb(122, 70, 190)", "rgba(100, 50, 160, 0.6)"] },
];

function h(tag, props = {}, ...kids) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
    else if (value !== false && value != null) node.setAttribute(key, value === true ? "" : value);
  }
  kids.forEach((kid) => kid != null && node.append(kid));
  return node;
}

/** A modal dialog with a backdrop. Returns { dialog, close }. Escape and `onDismiss` close it. */
function openDialog({ labelId, className, onDismiss }) {
  const backdrop = h("div", { class: "pb-dialog-backdrop" });
  const dialog = h("div", { class: `pb-dialog ${className}`, role: "dialog", "aria-modal": "true", "aria-labelledby": labelId });
  backdrop.appendChild(dialog);
  const previousFocus = document.activeElement;
  const close = () => {
    document.removeEventListener("keydown", onKey, true);
    backdrop.remove();
    previousFocus?.focus?.();
  };
  const onKey = (event) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onDismiss();
    }
  };
  document.addEventListener("keydown", onKey, true);
  document.body.appendChild(backdrop);
  return { dialog, close };
}

// ───────── What's new ─────────

const WHATS_NEW = [
  ["Setup wizard", "Team number, TBA key, robot model and colors in one short flow. Re-run it any time from Settings."],
  ["Note Cards", "Merged all pit notes into one comprehensive card. Integrated with the 3D viewer to pin notes to parts."],
  ["Next-match banner", "A slim strip with your next match, the countdown and your alliance color. It turns urgent near the alert time."],
  ["Card status dots", "A dot in each card's corner shows data freshness. Hover it for the last update time."],
  ["New 3D viewer", "A new 3D Robot Viewer card to import and view your robot model, pin repair notes to parts, and see the robot in different poses. Export your model from CAD as a .glb, .gltf or .urdf file (with its mesh files) and load it in the card. .urdf files have mate connectors imported with them."],
  ["Helpful empty cards", "Cards with no data now say why and what to do next."],
];

let welcomeOpen = false;

export function showWelcome() {
  if (welcomeOpen) return;
  welcomeOpen = true;
  const dismiss = () => {
    writeString(WELCOME_KEY, "true");
    welcomeOpen = false;
    close();
  };
  const { dialog, close } = openDialog({ labelId: "welcomeTitle", className: "welcome-card", onDismiss: dismiss });
  dialog.append(
    h("button", { type: "button", class: "pb-dialog-x", "aria-label": "Dismiss", text: "×", onclick: dismiss }),
    h("p", { class: "pb-eyebrow", text: "PitBeacon" }),
    h("h2", { id: "welcomeTitle", class: "pb-dialog-title", text: "What's new in 2027" }),
    h("ul", { class: "welcome-list" }, ...WHATS_NEW.map(([title, text]) => h("li", {}, h("strong", { text: title }), h("span", { text })))),
    h("p", { class: "pb-dialog-note", text: "You can bring this back from Settings > Setup & what's new." }),
    h("div", { class: "pb-dialog-actions" }, h("button", { type: "button", class: "pb-btn pb-btn-primary", text: "Got it", onclick: dismiss })),
  );
  dialog.querySelector(".pb-btn-primary").focus();
}

function maybeShowWelcome() {
  if (readString(WELCOME_KEY) !== "true") showWelcome();
}

// ───────── Setup wizard ─────────

let wizardOpen = false;

export function openSetupWizard() {
  if (wizardOpen) return;
  wizardOpen = true;

  const draft = {
    team: readString("teamNumber", "") || "",
    key: hasRealTbaKey(config) ? config.tbaapikey : "",
    match13key: readString("match13apikey", "") || "",
    modelFiles: null,
    modelName: "",
    accent: 0,
  };
  const original = Object.fromEntries(ACCENT_VARS.map((name) => [name, document.documentElement.style.getPropertyValue(name)]));
  let step = 0;

  const finish = (outcome) => {
    writeString(WIZARD_KEY, outcome);
    wizardOpen = false;
    close();
    maybeShowWelcome();
  };
  const skip = () => {
    ACCENT_VARS.forEach((name) => {
      if (original[name]) document.documentElement.style.setProperty(name, original[name]);
      else document.documentElement.style.removeProperty(name);
    });
    finish("skipped");
  };
  const { dialog, close } = openDialog({ labelId: "wizardTitle", className: "setup-wizard", onDismiss: skip });

  const STEPS = [stepTeam, stepModel, stepLook];

  async function apply() {
    const team = draft.team.trim();
    const key = draft.key.trim();
    const match13key = draft.match13key.trim();
    applyBasicSettings({ teamNumber: /^\d{1,5}$/.test(team) ? team : null, tbaKey: key || null, match13Key: match13key });
    if (draft.modelFiles) {
      try {
        await saveRobotModel(draft.modelFiles);
      } catch (error) {
        console.warn("Could not save the robot model from setup:", error);
      }
    }
    saveCustomColors();
    finish("true");
  }

  function render() {
    const title = ["Your team", "Robot model", "Look & feel"][step];
    const body = STEPS[step]();
    const last = step === STEPS.length - 1;
    const dots = h("ol", { class: "wizard-steps", "aria-label": `Step ${step + 1} of ${STEPS.length}` }, ...STEPS.map((_, index) => h("li", { class: index === step ? "active" : index < step ? "done" : "" })));
    dialog.replaceChildren(
      h("p", { class: "pb-eyebrow", text: `Setup · step ${step + 1} of ${STEPS.length}` }),
      h("h2", { id: "wizardTitle", class: "pb-dialog-title", text: title }),
      dots,
      body,
      h(
        "div",
        { class: "pb-dialog-actions" },
        h("button", { type: "button", class: "pb-btn pb-btn-link", text: "Skip setup", onclick: skip }),
        h("span", { class: "pb-spacer" }),
        step > 0 ? h("button", { type: "button", class: "pb-btn", text: "Back", onclick: () => { step -= 1; render(); } }) : null,
        h("button", { type: "button", class: "pb-btn pb-btn-primary", "data-wizard-next": "", text: last ? "Finish" : "Next", onclick: () => (last ? apply() : (step += 1, render())) }),
      ),
    );
    (dialog.querySelector("input:not([type=file])") || dialog.querySelector("[data-wizard-next]"))?.focus();
  }

  function field(labelText, input, hint) {
    return h("label", { class: "wizard-field" }, h("span", { text: labelText }), input, hint ? h("small", { text: hint }) : null);
  }

  function stepTeam() {
    const team = h("input", { type: "text", inputmode: "numeric", maxlength: "5", placeholder: "e.g. 7250", value: draft.team, autocomplete: "off" });
    const key = h("input", { type: "password", placeholder: "Paste your TBA read key", value: draft.key, autocomplete: "off" });
    const match13key = h("input", { type: "password", placeholder: "Paste your Match13 read key", value: draft.match13key, autocomplete: "off" });
    const tbaResult = h("p", { class: "wizard-result", role: "status", "aria-live": "polite" });
    const match13Result = h("p", { class: "wizard-result", role: "status", "aria-live": "polite" });
    team.addEventListener("input", () => {
      draft.team = team.value;
      match13Result.textContent = "";
    });
    key.addEventListener("input", () => { draft.key = key.value; tbaResult.textContent = ""; });
    match13key.addEventListener("input", () => { draft.match13key = match13key.value; match13Result.textContent = ""; });
    const testTba = h("button", { type: "button", class: "pb-btn", text: "Test TBA key" });
    testTba.addEventListener("click", async () => {
      const value = key.value.trim();
      tbaResult.dataset.ok = "false";
      if (!hasRealTbaKey({ tbaapikey: value })) { tbaResult.textContent = "Paste a key first."; return; }
      tbaResult.textContent = "Checking…";
      try {
        const response = await fetch(TBA_STATUS_URL, { headers: { "X-TBA-Auth-Key": value } });
        tbaResult.dataset.ok = String(response.ok);
        tbaResult.textContent = response.ok ? "Key works." : response.status === 401 ? "TBA rejected that key. Check that it was copied completely." : `TBA answered with HTTP ${response.status}.`;
      } catch {
        tbaResult.textContent = "Couldn't reach TBA. You can still continue and check later.";
      }
    });
    const testMatch13 = h("button", { type: "button", class: "pb-btn", text: "Test Match13 key" });
    testMatch13.addEventListener("click", async () => {
      const value = match13key.value.trim().replace(/^Bearer\s+/i, "");
      match13Result.dataset.ok = "false";
      if (!value) { match13Result.textContent = "Paste a key first."; return; }
      if (!value.startsWith("m13_live_")) {
        match13Result.textContent = "Match13 keys should start with m13_live_. Check that the complete key was copied.";
        return;
      }
      const teamNumber = team.value.trim();
      if (!/^\d{1,5}$/.test(teamNumber)) {
        match13Result.textContent = "Enter a valid team number to test this key.";
        return;
      }
      const proxyUrl = String(config.match13ProxyUrl || "").trim().replace(/\/+$/, "");
      if (!proxyUrl) {
        match13Result.textContent = "PitBeacon's Match13 proxy is not configured. You can still continue and check later.";
        return;
      }
      const year = getNow(config).getFullYear();
      match13Result.textContent = "Checking…";
      try {
        const response = await fetch(`${proxyUrl}/v1/teams/${teamNumber}/years/${year}`, {
          headers: { Authorization: `Bearer ${value}` },
        });
        match13Result.dataset.ok = String(response.ok);
        if (response.ok) {
          match13Result.textContent = "Key works.";
        } else if (response.status === 401 || response.status === 403) {
          match13Result.textContent = "Match13 rejected that key. Check that it was copied completely.";
        } else if (response.status === 404) {
          match13Result.textContent = "Match13 returned no data for this team and season. Check the team number and season.";
        } else {
          match13Result.textContent = `Match13 answered with HTTP ${response.status}.`;
        }
      } catch {
        match13Result.textContent = "Couldn't reach Match13 through PitBeacon's proxy. You can still continue and check later.";
      }
    });
    return h(
      "div",
      { class: "wizard-body" },
      h("p", { class: "wizard-lead", text: "PitBeacon pulls your matches and rankings from The Blue Alliance." }),
      field("Team number", team),
      field("TBA read API key", key, "Create one at thebluealliance.com/account under Read API Keys. Stored only in this browser."),
      field("Match13 read API key", match13key, "Optional (for stats card). Create one at match13.com/account under Read API Keys. Stored only in the browser, goes through a Cloudflare worker."),
      h("div", { class: "wizard-inline" }, testTba, tbaResult),
      h("div", { class: "wizard-inline" }, testMatch13, match13Result),
    );
  }

  function stepModel() {
    const status = h("p", { class: "wizard-result", role: "status", "aria-live": "polite", text: draft.modelName ? `Ready: ${draft.modelName}` : "" });
    status.dataset.ok = draft.modelName ? "true" : "";
    const onPick = async (input) => {
      const files = Array.from(input.files || []);
      if (!files.some((file) => MODEL_EXTENSIONS.test(file.name))) {
        status.dataset.ok = "false";
        status.textContent = "Choose a .urdf, .glb or .gltf file.";
        return;
      }
      draft.modelFiles = await readModelFiles(files);
      draft.modelName = files.find((file) => MODEL_EXTENSIONS.test(file.name)).name;
      status.dataset.ok = "true";
      status.textContent = `Ready: ${draft.modelName} (loads when you finish)`;
    };
    const file = h("input", { type: "file", multiple: true, accept: ".urdf,.glb,.gltf,.stl,.obj,.dae,.bin,.png,.jpg,.jpeg,.webp", class: "wizard-file" });
    const folder = h("input", { type: "file", multiple: true, webkitdirectory: true, class: "wizard-file" });
    file.addEventListener("change", () => onPick(file));
    folder.addEventListener("change", () => onPick(folder));
    return h(
      "div",
      { class: "wizard-body" },
      h("p", { class: "wizard-lead", text: "Optional. Add your robot's CAD export to see it in 3D and pin repair notes to individual parts." }),
      field("Model file (.glb, .gltf or .urdf)", file, "A URDF needs its mesh files too: pick them together, or choose the whole export folder below."),
      field("Or a whole URDF export folder", folder),
      status,
      h("p", { class: "wizard-skip-note", text: "No model yet? Just press Next. You can load one in the 3D Robot Viewer card any time." }),
    );
  }

  function stepLook() {
    const group = h("div", { class: "wizard-swatches", role: "radiogroup", "aria-label": "Accent color" });
    const select = (index) => {
      draft.accent = index;
      const values = ACCENTS[index].values;
      ACCENT_VARS.forEach((name, i) => {
        if (values) document.documentElement.style.setProperty(name, values[i]);
        else document.documentElement.style.removeProperty(name);
      });
      group.querySelectorAll("button").forEach((button, i) => button.setAttribute("aria-checked", String(i === index)));
    };
    ACCENTS.forEach((accent, index) => {
      const swatch = h("button", { type: "button", role: "radio", class: "wizard-swatch", "aria-checked": String(index === draft.accent), title: accent.name, "aria-label": accent.name });
      swatch.style.background = accent.values ? accent.values[0] : "rgb(47, 48, 112)";
      swatch.addEventListener("click", () => select(index));
      group.appendChild(swatch);
    });
    return h(
      "div",
      { class: "wizard-body" },
      h("p", { class: "wizard-lead", text: "Optional. Pick an accent color; the dark theme stays. More colors are in Settings > Appearance." }),
      group,
      h("p", { class: "wizard-skip-note", text: "That's everything. Finish saves your choices." }),
    );
  }

  render();
}

// ───────── Start-up ─────────

/** Replaces the old "open Settings when there is no key". Runs once per browser. */
export function startOnboarding() {
  window.addEventListener(RUN_WIZARD_EVENT, openSetupWizard);
  window.addEventListener(SHOW_WELCOME_EVENT, showWelcome);

  const done = readString(WIZARD_KEY);
  if (!done && !hasRealTbaKey(config)) {
    openSetupWizard(); // the welcome card follows once the wizard closes
    return;
  }
  // Already set up (an existing user, or finished before): no wizard, just the one-time card.
  if (!done) writeString(WIZARD_KEY, "true");
  maybeShowWelcome();
}
