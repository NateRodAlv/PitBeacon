import { config, registry, devCardRuntime, cardCatalog, renderLayout } from "./context.js";
import { cardFingerprint, detectConfigurableSettings } from "../data/cardCatalog.js";
import {
  getCardSettingValues,
  renderCardSettingsControls,
  suggestNextCardVersion,
} from "./cardSettings.js";
import { writeJson } from "../core/storage.js";

export async function renderCardCatalog(modal) {
  const list = modal.querySelector("#cardCatalogList");
  const status = modal.querySelector("#cardCatalogStatus");
  if (!list || !status) return;
  list.innerHTML = "";
  status.textContent = cardCatalog.isConfigured()
    ? "Loading approved cards..."
    : "Catalog backend is not configured yet. Add the Supabase values in config.js.";
  if (!cardCatalog.isConfigured()) return;

  try {
    const cards = await cardCatalog.listApproved();
    const groupedCards = [...cards.reduce((groups, card) => {
      if (!groups.has(card.id)) groups.set(card.id, []);
      groups.get(card.id).push(card);
      return groups;
    }, new Map()).values()];
    status.textContent = cards.length ? "" : "No approved community cards yet.";
    groupedCards.forEach((versions) => {
      versions.sort((left, right) => String(right.version).localeCompare(String(left.version), undefined, { numeric: true }));
      let card = versions[0];
      const item = document.createElement("article");
      item.className = "catalog-card-item";
      item.tabIndex = 0;
      item.innerHTML = `<div class="catalog-card-info"><strong></strong><span></span></div><div class="catalog-card-preview"></div>`;
      item.querySelector("strong").textContent = card.label;
      item.querySelector("span").textContent = card.description || "Community card";
      list.appendChild(item);
      cardCatalog.renderPreview(item.querySelector(".catalog-card-preview"), card, `catalog-tile-${card.id}`);
      const open = () => openCatalogCardDetails(versions);
      item.addEventListener("click", open);
      item.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); }
      });
    });
  } catch (error) {
    status.textContent = error.message;
  }
}

export function openCatalogCardDetails(versions) {
  const modal = document.getElementById("cardCatalogDetailModal");
  const title = modal.querySelector("#cardCatalogDetailTitle");
  const description = modal.querySelector("#cardCatalogDetailDescription");
  const versionSelect = modal.querySelector("#cardCatalogDetailVersion");
  const preview = modal.querySelector("#cardCatalogDetailPreview");
  const settings = modal.querySelector("#cardCatalogDetailSettings");
  const saveButton = modal.querySelector("#cardCatalogDetailSave");
  const saveStatus = modal.querySelector("#cardCatalogDetailStatus");
  versions = [...versions].sort((left, right) => String(right.version).localeCompare(String(left.version), undefined, { numeric: true }));
  versionSelect.innerHTML = versions.map((version) => `<option value="${version.version}">${version.version}</option>`).join("");
  let card = versions[0];
  let settingValues;
  const render = () => {
    title.textContent = card.label;
    description.textContent = card.description || "Community card";
    settingValues = getCardSettingValues(card);
    settings.innerHTML = "";
    cardCatalog.renderPreview(preview, card, `catalog-detail-${card.id}`);
    renderCardSettingsControls(settings, card, settingValues, (values) => {
      card.settingsValues = values;
      cardCatalog.renderPreview(preview, card, `catalog-detail-${card.id}`);
    });
    saveButton.disabled = false;
    saveStatus.textContent = "";
  };
  versionSelect.onchange = () => { card = versions.find((version) => version.version === versionSelect.value) || versions[0]; render(); };
  saveButton.onclick = () => {
    const existing = registry.get(card.id);
    if (existing?.builtin) { saveStatus.textContent = "Card ID is already used by a built-in card."; return; }
    config.developerCards[card.id] = { label: card.label, description: card.description, icon: card.icon, version: card.version, settings: card.settings, settingsValues: settingValues, html: card.html, css: card.css, js: card.js };
    writeJson("developerCards", config.developerCards);
    if (existing) registry.unregister(card.id);
    registry.register(card.id, devCardRuntime.createCardDefinition(card.id, config.developerCards[card.id]));
    saveButton.disabled = true;
    saveStatus.textContent = "Saved. Add it from the Layout Editor.";
    renderLayout();
  };
  modal.classList.add("active");
  render();
}

export function setupCardUpload(modal) {
  const form = modal.querySelector("#cardUploadForm");
  const localCardSelect = modal.querySelector("#cardUploadLocalCard");
  const status = modal.querySelector("#cardUploadStatus");
  if (!form || !localCardSelect || !status) return;

  refreshUploadOptions(modal);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const localCardId = localCardSelect?.value;
    if (!localCardId) {
      status.textContent = "Select a saved card first.";
      return;
    }
    try {
      const cards = [{ id: localCardId, ...config.developerCards[localCardId] }];

      const authorName = modal.querySelector("#cardUploadAuthor").value.trim();
      const description = modal
        .querySelector("#cardUploadDescription")
        .value.trim();
      status.textContent = "Submitting for review...";
      for (const card of cards) {
        const settings = detectConfigurableSettings(card.js || "");
        const submission = { ...card, authorName, description, settings };
        const approvedCards = await cardCatalog.listApproved();
        const existingVersions = approvedCards.filter((approved) => approved.id === card.id);
        const sameVersion = existingVersions.find((approved) => cardFingerprint(approved) === cardFingerprint(submission));
        if (sameVersion) {
          status.textContent = `Version ${sameVersion.version} is already approved.`;
          continue;
        }
        let updateOf = null;
        if (existingVersions.length) {
          const latest = [...existingVersions].sort((left, right) =>
            String(right.version).localeCompare(String(left.version), undefined, { numeric: true }),
          )[0];
          if (!confirm(`This card already exists. Request an update to ${latest.version}?`)) continue;
          const nextVersion = await requestCardUpdateVersion(
            latest.version,
          );
          if (!nextVersion?.trim()) continue;
          submission.version = nextVersion.trim();
          updateOf = { id: latest.id, version: latest.version };
        }
        await cardCatalog.submit({ ...submission, updateOf });
      }
      status.textContent =
        "Submitted. It will appear after moderation.";
      form.reset();
    } catch (error) {
      status.textContent = error.message;
    }
  });
}

export function requestCardUpdateVersion(latestVersion) {
  const modal = document.getElementById("cardUpdateModal");
  const message = document.getElementById("cardUpdateMessage");
  const input = document.getElementById("cardUpdateVersion");
  const confirmButton = document.getElementById("cardUpdateConfirm");
  const cancelButton = document.getElementById("cardUpdateCancel");
  if (!modal || !input || !confirmButton || !cancelButton) return Promise.resolve(null);

  message.textContent = `This card already exists at version ${latestVersion}. Choose a new version to request an update.`;
  input.value = suggestNextCardVersion(latestVersion);
  modal.classList.add("active");

  return new Promise((resolve) => {
    const finish = (value) => {
      modal.classList.remove("active");
      confirmButton.removeEventListener("click", onConfirm);
      cancelButton.removeEventListener("click", onCancel);
      resolve(value);
    };
    const onConfirm = () => finish(input.value.trim() || null);
    const onCancel = () => finish(null);
    confirmButton.addEventListener("click", onConfirm);
    cancelButton.addEventListener("click", onCancel);
    input.focus();
    input.select();
  });
}

/** Fill the "which saved card" dropdown from the cards saved right now. */
export function refreshUploadOptions(modal = document.getElementById("cardUploadModal")) {
  const localCardSelect = modal?.querySelector("#cardUploadLocalCard");
  if (!localCardSelect) return;
  const placeholder = localCardSelect.options[0]?.cloneNode(true);
  localCardSelect.innerHTML = "";
  if (placeholder) localCardSelect.appendChild(placeholder);
  const ids = Object.keys(config.developerCards || {});
  ids.forEach((id) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = config.developerCards[id].label || id;
    localCardSelect.appendChild(option);
  });
  localCardSelect.disabled = ids.length === 0;
  if (placeholder) {
    placeholder.textContent = ids.length ? placeholder.textContent : "No saved cards available";
    localCardSelect.options[0].textContent = placeholder.textContent;
  }
}
