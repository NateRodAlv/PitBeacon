import { detectConfigurableSettings } from "../data/cardCatalog.js";

export function getCardSettingValues(card) {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem("cardSettings") || "{}")[card.id] || {};
  } catch {}
  const values = {};
  const settings = getCardSettingsDefinition(card);
  card.settings = settings;
  Object.entries(settings).forEach(([key, definition]) => {
    const setting = typeof definition === "string" ? { type: "text", default: definition } : definition || {};
    values[key] = saved[key] ?? card.settingsValues?.[key] ?? setting.default ?? (setting.type === "checkbox" ? false : "");
  });
  return values;
}

export function getCardSettingsDefinition(card) {
  if (Object.keys(card?.settings || {}).length) return card.settings;
  return detectConfigurableSettings(card?.js || "");
}

export function saveCardSettingValues(cardId, values) {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem("cardSettings") || "{}");
  } catch {}
  saved[cardId] = values;
  localStorage.setItem("cardSettings", JSON.stringify(saved));
}

export function suggestNextCardVersion(version) {
  const match = String(version || "1.0.0").match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return "1.0.1";
  return `${match[1]}.${match[2]}.${Number(match[3]) + 1}`;
}

export function renderCardSettingsControls(container, card, values, onChange) {
  const settings = Object.entries(getCardSettingsDefinition(card));
  if (!settings.length) return;
  const wrapper = document.createElement("div");
  wrapper.className = "card-settings-controls";
  const title = document.createElement("strong");
  title.textContent = "Card settings";
  wrapper.appendChild(title);

  settings.forEach(([key, definition]) => {
    const setting = typeof definition === "string" ? { type: "text", default: definition } : definition || {};
    const label = document.createElement("label");
    label.className = "card-setting-field";
    const caption = document.createElement("span");
    caption.textContent = setting.label || key;
    label.appendChild(caption);
    const input = document.createElement(setting.type === "select" ? "select" : "input");
    input.name = key;
    input.type = setting.type === "select" ? "text" : setting.type || "text";
    if (setting.type === "select") {
      (setting.options || []).forEach((option) => {
        const optionEl = document.createElement("option");
        optionEl.value = option.value ?? option;
        optionEl.textContent = option.label ?? option;
        input.appendChild(optionEl);
      });
    }
    if (setting.min !== undefined) input.min = setting.min;
    if (setting.max !== undefined) input.max = setting.max;
    if (setting.step !== undefined) input.step = setting.step;
    if (setting.type === "checkbox") input.checked = Boolean(values[key]);
    else input.value = values[key];
    input.addEventListener("input", () => {
      values[key] = setting.type === "checkbox" ? input.checked : input.value;
      saveCardSettingValues(card.id, values);
      onChange(values);
    });
    label.appendChild(input);
    wrapper.appendChild(label);
  });
  container.appendChild(wrapper);
}
