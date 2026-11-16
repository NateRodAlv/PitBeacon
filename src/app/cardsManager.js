import { config, registry, devCardRuntime, cardCatalog, renderLayout } from "./context.js";
import { displayMessage } from "../core/notifications.js";
import { writeJson } from "../core/storage.js";
import { escapeHtml } from "../lib/html.js";
import { openCatalogCardDetails } from "./cardsCatalog.js";

let panel = null;

function ids() {
  return registry.listCards().filter((id) => id !== "__fallback__");
}

function itemMarkup(id) {
  const def = registry.get(id);
  const isDev = def.developer || false;
  const isHidden = config.hiddenSections.includes(id);
  const local = config.developerCards[id];
  const safeId = escapeHtml(id);
  return `<div class="card-manager-item" data-card-id="${safeId}">
    <div class="card-manager-item-info">
      ${isDev ? `<label class="card-manager-export-select" title="Select ${safeId} for export"><input type="checkbox" class="card-export-checkbox" data-card-id="${safeId}"> Export</label>` : ""}
      <span class="card-manager-item-icon">📄</span>
      <span class="card-manager-item-id">${safeId}</span>
      <span class="card-manager-item-label">${escapeHtml(def.label)}</span>
      ${isDev && local?.description ? `<span class="card-manager-item-description">${escapeHtml(local.description)}</span>` : ""}
      ${isDev ? '<span class="card-manager-item-badge">Custom</span>' : ""}
      ${def.builtin ? '<span class="card-manager-item-badge builtin">Built-in</span>' : ""}
      ${isHidden ? '<span class="card-manager-item-badge" style="background:rgba(200,50,50,0.2);color:rgb(220,80,80);">Hidden</span>' : ""}
    </div>
    ${isDev ? '<div class="card-manager-card-preview"></div>' : ""}
    <div class="card-manager-item-actions">
      ${isDev ? `<button type="button" class="card-manager-item-edit" data-card-id="${safeId}">Edit</button>` : ""}
      ${isDev ? `<button type="button" class="card-manager-item-delete" data-card-id="${safeId}">Delete</button>` : ""}
      <button type="button" class="card-manager-item-toggle" data-card-id="${safeId}">${isHidden ? "Show" : "Hide"}</button>
    </div>
  </div>`;
}

export function renderCardManager() {
  const list = panel?.querySelector("#cardManagerList");
  if (!list) return;

  const all = ids();
  const builtin = all.filter((id) => registry.get(id)?.builtin);
  const custom = all.filter((id) => registry.get(id)?.developer);
  list.innerHTML = `
    <section class="card-manager-section">
      <h3 class="card-manager-section-title">Built-in Cards</h3>
      <div class="card-manager-section-list card-manager-builtins">
        ${builtin.length ? builtin.map(itemMarkup).join("") : '<p class="card-manager-empty">No built-in cards.</p>'}
      </div>
    </section>
    <section class="card-manager-section">
      <h3 class="card-manager-section-title">Your Custom Cards</h3>
      <div class="card-manager-section-list card-manager-developer-grid">
        ${custom.length ? custom.map(itemMarkup).join("") : '<p class="card-manager-empty">No custom cards yet. Browse the Catalog or build one in Create.</p>'}
      </div>
    </section>`;

  list.querySelectorAll(".card-manager-card-preview").forEach((preview) => {
    const item = preview.closest(".card-manager-item");
    const id = item.dataset.cardId;
    const card = { id, ...config.developerCards[id] };
    cardCatalog.renderPreview(preview, card, `registry-tile-${id}`);
    item.classList.add("card-manager-developer-card");
  });
}

function toggleHidden(id) {
  const index = config.hiddenSections.indexOf(id);
  if (index >= 0) config.hiddenSections.splice(index, 1);
  else config.hiddenSections.push(id);
  writeJson("hiddenCards", config.hiddenSections);
  renderCardManager();
  renderLayout();
}

function deleteCard(id) {
  if (!confirm(`Delete custom card "${id}"?`)) return;
  delete config.developerCards[id];
  writeJson("developerCards", config.developerCards);
  registry.unregister(id);
  renderCardManager();
  renderLayout();
}

function exportSelected() {
  const selected = [...panel.querySelectorAll(".card-export-checkbox:checked")].map(
    (box) => box.dataset.cardId,
  );
  if (!selected.length) {
    displayMessage("Select at least one custom card to export.", "error");
    return;
  }
  selected.forEach((id, index) => {
    const blob = new Blob([JSON.stringify({ [id]: config.developerCards[id] }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `pitbeacon-card-${id}.json`;
    setTimeout(() => {
      anchor.click();
      URL.revokeObjectURL(url);
    }, index * 150);
  });
}

function importFile(file) {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error("File is not a PitBeacon card export.");
      }
      const entries = Object.entries(data);
      entries.forEach(([id, def]) => {
        if (!def || typeof def !== "object") throw new Error(`Card "${id}" is not valid.`);
        const existing = registry.get(id);
        if (existing && !existing.developer) {
          throw new Error(`Cannot import over built-in card "${id}".`);
        }
      });
      entries.forEach(([id, def]) => {
        const definition = devCardRuntime.createCardDefinition(id, def);
        definition.allowOverride = true;
        config.developerCards[id] = def;
        registry.register(id, definition);
      });
      writeJson("developerCards", config.developerCards);
      renderCardManager();
      renderLayout();
      displayMessage("Cards imported successfully!", "message");
    } catch (error) {
      displayMessage(`Import failed: ${error.message}`, "error");
    }
  };
  reader.readAsText(file);
}

/** Wire the "My Cards" panel once. `onEdit(id)` opens a card in the Create tab. */
export function initCardManager(root, { onEdit }) {
  panel = root;

  panel.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-card-id]");
    if (button) {
      const id = button.dataset.cardId;
      if (button.classList.contains("card-manager-item-toggle")) toggleHidden(id);
      else if (button.classList.contains("card-manager-item-delete")) deleteCard(id);
      else if (button.classList.contains("card-manager-item-edit")) onEdit?.(id);
      return;
    }
    const item = event.target.closest(".card-manager-developer-card");
    if (item && !event.target.closest("button, input, label")) {
      const id = item.dataset.cardId;
      openCatalogCardDetails([{ id, ...config.developerCards[id] }]);
    }
  });

  panel.querySelector("#cardManagerExport").addEventListener("click", exportSelected);
  const fileInput = panel.querySelector("#cardManagerFileInput");
  panel.querySelector("#cardManagerImport").addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) importFile(file);
    fileInput.value = "";
  });
}
