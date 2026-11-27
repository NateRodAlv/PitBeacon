// First-run setup wizard and the one-time "What's new in 2027" card.
// Both are plain dialogs built with textContent; neither blocks the app.

import { config } from "./context.js";
import { applyBasicSettings } from "./settings.js";
import { saveCustomColors } from "./customColors.js";
import { hasRealTbaKey } from "../data/tba.js";
import { readModelFiles, saveRobotModel, MODEL_EXTENSIONS } from "../data/robotModel.js";
import { getNow, parseTestDate } from "../core/clock.js";
import { readString, writeString } from "../core/storage.js";

export const RUN_WIZARD_EVENT = "pitbeacon:run-wizard";
export const SHOW_WELCOME_EVENT = "pitbeacon:show-welcome";
const WIZARD_KEY = "setupWizardDone"; // "true" (finished) or "skipped"
const WELCOME_KEY = "welcomeDismissed2027";
const TBA_API_BASE = "https://www.thebluealliance.com/api/v3";
const TBA_STATUS_URL = `${TBA_API_BASE}/status`;

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

async function fetchTbaJson(path, key) {
  const response = await fetch(`${TBA_API_BASE}${path}`, {
    headers: { "X-TBA-Auth-Key": key },
  });
  if (!response.ok) {
    const message = response.status === 401
      ? "TBA rejected the API key."
      : `TBA request failed (HTTP ${response.status}).`;
    throw new Error(message);
  }
  return response.json();
}

function eventDays(event) {
  const start = parseTestDate(event.start_date);
  const end = parseTestDate(event.end_date);
  if (!start || !end) return [];
  const firstDay = new Date(start.year, start.month, start.day);
  const lastDay = new Date(end.year, end.month, end.day);
  if (
    firstDay.getFullYear() !== start.year
    || firstDay.getMonth() !== start.month
    || firstDay.getDate() !== start.day
    || lastDay.getFullYear() !== end.year
    || lastDay.getMonth() !== end.month
    || lastDay.getDate() !== end.day
    || firstDay > lastDay
  ) return [];

  const days = [];
  for (const date = firstDay; date <= lastDay; date.setDate(date.getDate() + 1)) {
    const value = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
    days.push({
      value,
      label: `${date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} · ${value}`,
    });
  }
  return days;
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
    testMode: readString("testMode") === "true",
    testDate: readString("testDate", "") || "",
    testEvents: [],
    testEventKey: "",
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

  const STEPS = [stepTeam, stepModel, stepTestMode, stepLook];
  const TITLES = ["Your team", "Robot model", "Test mode", "Look & feel"];

  async function apply() {
    const team = draft.team.trim();
    const key = draft.key.trim();
    const match13key = draft.match13key.trim();
    applyBasicSettings({
      teamNumber: /^\d{1,5}$/.test(team) ? team : null,
      tbaKey: key || null,
      match13Key: match13key,
      testMode: draft.testMode,
      testDate: draft.testDate,
    });
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

  function advance() {
    if (STEPS[step] === stepTestMode && draft.testMode && !parseTestDate(draft.testDate)) {
      const result = dialog.querySelector("#wizardTestModeResult");
      result.dataset.ok = "false";
      result.textContent = "Choose an event day before continuing with Test Mode enabled.";
      return;
    }
    if (step === STEPS.length - 1) apply();
    else {
      step += 1;
      render();
    }
  }

  function render() {
    const title = TITLES[step];
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
        h("button", { type: "button", class: "pb-btn pb-btn-primary", "data-wizard-next": "", text: last ? "Finish" : "Next", onclick: advance }),
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
      if (draft.team !== team.value) {
        draft.testDate = "";
        draft.testEvents = [];
        draft.testEventKey = "";
      }
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

  function stepTestMode() {
    const team = h("input", {
      type: "text",
      inputmode: "numeric",
      maxlength: "5",
      placeholder: "e.g. 7250",
      value: draft.team,
      autocomplete: "off",
    });
    const enabled = h("input", { type: "checkbox", checked: draft.testMode });
    const scan = h("button", { type: "button", class: "pb-btn", text: "Find attended events" });
    const eventsSelect = h("select", { disabled: true });
    const daySelect = h("select", { disabled: true });
    const result = h("p", { id: "wizardTestModeResult", class: "wizard-result", role: "status", "aria-live": "polite" });

    function updateDayOptions() {
      daySelect.replaceChildren();
      const event = draft.testEvents.find((entry) => entry.key === draft.testEventKey);
      if (!event) {
        daySelect.appendChild(h("option", { value: "", text: "Choose an event first" }));
        daySelect.disabled = true;
        return;
      }

      const days = eventDays(event);
      days.forEach(({ value, label }) => daySelect.appendChild(h("option", { value, text: label })));
      daySelect.disabled = !days.length;
      const selectedDate = days.some(({ value }) => value === draft.testDate)
        ? draft.testDate
        : days[0]?.value || "";
      daySelect.value = selectedDate;
      if (selectedDate) draft.testDate = selectedDate;
    }

    function updateEventOptions() {
      eventsSelect.replaceChildren(
        h("option", {
          value: "",
          text: draft.testEvents.length ? "Choose an event" : "Find events first",
        }),
        ...draft.testEvents.map((event) =>
          h("option", {
            value: event.key,
            text: `${event.name || event.key} · ${event.start_date}`,
          }),
        ),
      );
      eventsSelect.disabled = !draft.testEvents.length;
      if (draft.testEvents.some((event) => event.key === draft.testEventKey)) {
        eventsSelect.value = draft.testEventKey;
      } else {
        eventsSelect.value = "";
      }
      updateDayOptions();
    }

    team.addEventListener("input", () => {
      if (draft.team === team.value) return;
      draft.team = team.value;
      draft.testDate = "";
      draft.testEvents = [];
      draft.testEventKey = "";
      updateEventOptions();
      result.textContent = "";
    });
    enabled.addEventListener("change", () => {
      draft.testMode = enabled.checked;
      result.textContent = "";
    });
    eventsSelect.addEventListener("change", () => {
      draft.testEventKey = eventsSelect.value;
      updateDayOptions();
      result.textContent = "";
    });
    daySelect.addEventListener("change", () => {
      draft.testDate = daySelect.value;
      result.dataset.ok = "true";
      result.textContent = `Test date set to ${draft.testDate}.`;
    });
    scan.addEventListener("click", async () => {
      const teamNumber = team.value.trim();
      draft.team = teamNumber;
      if (!/^\d{1,5}$/.test(teamNumber)) {
        result.dataset.ok = "false";
        result.textContent = "Enter a valid team number.";
        return;
      }
      const key = draft.key.trim();
      if (!hasRealTbaKey({ tbaapikey: key })) {
        result.dataset.ok = "false";
        result.textContent = "Enter a TBA read API key on the Team page to find events.";
        return;
      }

      scan.disabled = true;
      team.disabled = true;
      const navigationButtons = dialog.querySelectorAll(".pb-dialog-actions .pb-btn:not(.pb-btn-link)");
      navigationButtons.forEach((button) => { button.disabled = true; });
      draft.testEvents = [];
      draft.testEventKey = "";
      updateEventOptions();
      result.dataset.ok = "";
      result.textContent = "Finding attended events…";
      try {
        const years = await fetchTbaJson(`/team/frc${teamNumber}/years_participated`, key);
        if (!Array.isArray(years)) throw new Error("TBA returned an invalid event history.");
        if (years.some((year) => !Number.isInteger(year))) {
          throw new Error("TBA returned an invalid event history.");
        }
        const eventLists = await Promise.all(
          [...new Set(years)].map((year) =>
            fetchTbaJson(`/team/frc${teamNumber}/events/${year}/simple`, key),
          ),
        );
        if (eventLists.some((events) => !Array.isArray(events))) {
          throw new Error("TBA returned invalid event data.");
        }
        const today = new Date();
        const todayString = [
          today.getFullYear(),
          String(today.getMonth() + 1).padStart(2, "0"),
          String(today.getDate()).padStart(2, "0"),
        ].join("-");
        const seen = new Set();
        draft.testEvents = eventLists
          .flat()
          .filter((event) => {
            if (!event?.key || !event.start_date || event.start_date > todayString || !eventDays(event).length || seen.has(event.key)) return false;
            seen.add(event.key);
            return true;
          })
          .sort((a, b) => b.start_date.localeCompare(a.start_date));

        const matchingDate = draft.testEvents.find((event) =>
          eventDays(event).some(({ value }) => value === draft.testDate),
        );
        draft.testEventKey = matchingDate?.key || draft.testEvents[0]?.key || "";
        updateEventOptions();
        result.dataset.ok = draft.testEvents.length ? "true" : "false";
        result.textContent = draft.testEvents.length
          ? `Found ${draft.testEvents.length} events. Select an event and day.`
          : "No attended events with dates were found for this team.";
      } catch (error) {
        result.dataset.ok = "false";
        result.textContent = `Could not load team events: ${error.message}`;
      } finally {
        scan.disabled = false;
        team.disabled = false;
        navigationButtons.forEach((button) => { button.disabled = false; });
      }
    });

    updateEventOptions();
    return h(
      "div",
      { class: "wizard-body" },
      h("p", { class: "wizard-lead", text: "Use a past event day as the app's date for testing. The current time of day is retained." }),
      field("Team number", team, "This is the same team number used for your display."),
      field("Enable Test Mode", enabled, "When enabled, PitBeacon uses the selected event day instead of today's date."),
      h("div", { class: "wizard-inline" }, scan),
      field("Attended event", eventsSelect),
      field("Event day", daySelect),
      result,
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
