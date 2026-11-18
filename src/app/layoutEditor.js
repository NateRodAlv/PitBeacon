import { config, registry, renderer, renderLayout, stateManager } from "./context.js";
import { displayMessage } from "../core/notifications.js";
import { DEFAULT_LAYOUT } from "../../config.js";
import { getCustomColors } from "./customColors.js";
import {
  getCardSettingValues,
  getCardSettingsDefinition,
  renderCardSettingsControls,
} from "./cardSettings.js";
import {
  closeFloatingModals,
  openFloatingModal,
} from "../ui/floatingModal.js";
import { icon } from "../lib/icons.js";

// Layout editor

// Layout editor state
let layoutEditorState = {
  modal: null,
  shell: null,
  dragData: null,
  resizeData: null,
};

export function openLayoutEditor() {
  const modal = document.getElementById("layoutEditorModal");
  // Clear existing content
  closeFloatingModals(modal);
  modal.innerHTML = "";
  modal.classList.add("active");
  layoutEditorState.modal = modal;
  renderLayoutEditor(modal);
}

export function getCardIconMarkup(cardId, cardDef) {
  const defaultCardDef = Array.isArray(config.defaultCards)
    ? config.defaultCards.find((entry) => entry.id === cardId)
    : null;
  const iconName = cardDef?.icon || defaultCardDef?.icon || "square";
  const normalized = String(iconName).trim().toLowerCase();

  const svgMap = {
    "device-tv": `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="4" width="20" height="14" rx="2"></rect><path d="M8 21h8"></path><path d="M12 18v3"></path></svg>`,
    tournament: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4v4"></path><path d="M16 4v4"></path><path d="M4 8h16"></path><path d="M8 8v4"></path><path d="M16 8v4"></path><path d="M8 12h8"></path><path d="M6 12h2"></path><path d="M16 12h2"></path><path d="M4 16h16"></path><path d="M8 16v4"></path><path d="M16 16v4"></path></svg>`,
    trophy: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10"></path><path d="M8 4v3a4 4 0 0 0 4 4 4 4 0 0 0 4-4V4"></path><path d="M8 12H6a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h1"></path><path d="M16 12h2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1"></path><path d="M12 17v3"></path></svg>`,
    tool: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4a2 2 0 0 1 2.8 2.8L9.6 12 8 10.4l7.2-7.2Z"></path><path d="m6 12 6 6"></path><path d="m10 16 4 4"></path></svg>`,
    battery: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="14" height="12" rx="2"></rect><path d="M19 10h1"></path><path d="M17 8v8"></path></svg>`,
    package: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z"></path><path d="m4 7 8 4 8-4"></path><path d="m12 11 8-4"></path><path d="M12 11v10"></path></svg>`,
    checklist: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11"></path><path d="M9 12h11"></path><path d="M9 18h11"></path><path d="m4 5 1.5 1.5L8 3"></path><path d="m4 11 1.5 1.5L8 9"></path><path d="m4 17 1.5 1.5L8 15"></path></svg>`,
    "chart-bar": `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V9"></path><path d="M10 19V5"></path><path d="M16 19v-7"></path><path d="M22 19v-3"></path></svg>`,
    "alert-circle": `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v5"></path><path d="M12 16h.01"></path></svg>`,
    code: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 8-4 4 4 4"></path><path d="m16 8 4 4-4 4"></path><path d="m13 4-2 16"></path></svg>`,
  };

  const iconSvg =
    svgMap[normalized] ||
    svgMap.square ||
    `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"></rect></svg>`;
  return `<span class="le-card-icon" data-icon-name="${iconName}" aria-hidden="true">${iconSvg}</span>`;
}

export function renderLayoutEditor(modal) {
  const cardIds = registry.listCards();
  const cols = config.gridCols || 3;
  const rows = config.gridRows || 3;

  // Create shell
  const shell = document.createElement("div");
  shell.className = "le-shell";
  shell.id = "leShell";
  shell.setAttribute("role", "dialog");
  shell.setAttribute("aria-modal", "true");
  shell.setAttribute("aria-labelledby", "leTitle");
  shell.innerHTML = `
        <header class="le-header">
            <div class="le-header-copy">
                <h2 class="le-title" id="leTitle">Layout editor</h2>
                <p class="le-description">Arrange the cards shown on your PitBeacon display.</p>
            </div>
            <div class="le-header-actions">
                <div class="le-controls" role="group" aria-label="Display grid size">
                    <label for="leGridCols">Columns <input type="number" id="leGridCols" min="2" max="12" value="${cols}"></label>
                    <label for="leGridRows">Rows <input type="number" id="leGridRows" min="2" max="12" value="${rows}"></label>
                </div>
                <button class="le-close-btn" id="leClose" type="button" aria-label="Close layout editor" title="Close">×</button>
            </div>
        </header>
        <div class="le-body">
            <aside class="le-palette" aria-label="Available cards">
                <div class="le-palette-heading">
                    <h3 class="le-palette-title">Available cards</h3>
                    <p class="le-palette-hint">Drag a card onto the preview to add it.</p>
                </div>
                <div class="le-palette-list" id="leCardList">
                    ${cardIds
                      .filter((id) => id !== "__fallback__")
                      .map((id) => {
                        const def = registry.get(id);
                        const inLayout = config.layout[id] !== undefined;
                        const hasSettings = Object.keys(getCardSettingsDefinition(def)).length > 0;
                        return `<div class="le-palette-item ${inLayout ? "in-layout" : ""}" draggable="${!inLayout}" data-card-id="${id}">
                            ${getCardIconMarkup(id, def)}
                            <span class="le-card-label">${def.label}</span>
                            ${hasSettings ? `<button class="le-settings-btn" type="button" data-card-id="${id}" aria-label="Settings for ${def.label}" title="Configure ${def.label}">${icon("settings", 14)}</button>` : ""}
                            ${inLayout ? '<span class="le-added-badge">Added</span>' : ""}
                        </div>`;
                      })
                      .join("")}
                    ${cardIds.filter((id) => id !== "__fallback__").length === 0 ? '<div class="le-palette-empty">No cards available</div>' : ""}
                </div>
                <div class="le-actions">
                    <h3 class="le-actions-title">Layout settings</h3>
                    <button class="le-action-btn le-action-primary" id="leExport" type="button">Export layout</button>
                    <button class="le-action-btn" id="leImport" type="button">Import layout</button>
                    <button class="le-action-btn le-action-reset" id="leReset" type="button">Reset to default</button>
                </div>
            </aside>
            <section class="le-canvas" aria-label="Display preview">
                <div class="le-canvas-toolbar">
                    <span class="le-canvas-label">Display preview</span>
                    <span class="le-canvas-hint">Drag cards to move them · use a corner handle to resize</span>
                </div>
                <div class="layout-grid" id="leGrid" style="--grid-cols:${cols};--grid-rows:${rows};grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},1fr);">
                    ${Object.entries(config.layout)
                      .map(([id, pos]) => {
                        const def = registry.get(id);
                        if (!def) return "";
                        return `<div class="layout-item" data-card-id="${id}" style="grid-column:${pos.x + 1}/span ${pos.width};grid-row:${pos.y + 1}/span ${pos.height};">
                            <div class="layout-item-header">
                                <span class="layout-item-title">${getCardIconMarkup(id, def)}<span class="le-card-label">${def.label}</span></span>
                                ${Object.keys(getCardSettingsDefinition(def)).length ? `<button class="le-settings-btn" type="button" data-card-id="${id}" aria-label="Settings for ${def.label}" title="Configure ${def.label}">${icon("settings", 14)}</button>` : ""}
                                <button class="le-remove-btn" type="button" data-card-id="${id}" aria-label="Remove ${def.label}" title="Remove card">×</button>
                            </div>
                            <div class="layout-item-hint">${pos.width} × ${pos.height} cells</div>
                            <div class="resize-handle" aria-hidden="true"></div>
                        </div>`;
                      })
                      .join("")}
                </div>
            </section>
        </div>
    `;
  modal.appendChild(shell);
  layoutEditorState.shell = shell;

  // Grid controls
  const colsInput = shell.querySelector("#leGridCols");
  const rowsInput = shell.querySelector("#leGridRows");
  const grid = shell.querySelector("#leGrid");

  function updateGrid() {
    const newCols = Math.max(2, Math.min(12, parseInt(colsInput.value) || 3));
    const newRows = Math.max(2, Math.min(12, parseInt(rowsInput.value) || 3));
    config.gridCols = newCols;
    config.gridRows = newRows;
    grid.style.gridTemplateColumns = `repeat(${newCols},1fr)`;
    grid.style.gridTemplateRows = `repeat(${newRows},1fr)`;
    grid.style.setProperty("--grid-cols", newCols);
    grid.style.setProperty("--grid-rows", newRows);
    localStorage.setItem("gridCols", newCols);
    localStorage.setItem("gridRows", newRows);
  }

  colsInput.addEventListener("change", updateGrid);
  rowsInput.addEventListener("change", updateGrid);

  // Close
  shell.querySelector("#leClose").addEventListener("click", () => {
    closeLayoutEditor();
  });

  shell.querySelectorAll(".le-settings-btn").forEach((button) => {
    button.addEventListener("mousedown", (event) => event.stopPropagation());
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const card = registry.get(button.dataset.cardId);
      if (!card) return;

      const settings = getCardSettingsDefinition(card);
      if (!Object.keys(settings).length) return;
      const content = document.createElement("div");
      content.className = "le-card-settings-content";

      const hint = document.createElement("p");
      hint.className = "le-card-settings-hint";
      hint.textContent = "Changes are saved automatically and apply immediately.";
      content.appendChild(hint);

      const values = getCardSettingValues(card);
      renderCardSettingsControls(content, card, values, (nextValues) => {
        card.settingsValues = nextValues;
        if (card.developer && config.developerCards[card.id]) {
          config.developerCards[card.id].settingsValues = nextValues;
          localStorage.setItem(
            "developerCards",
            JSON.stringify(config.developerCards),
          );
        }
        renderer.updateCards(stateManager.getState());
      });
      openFloatingModal({
        parent: modal,
        id: `layout-card-settings:${card.id}`,
        title: `${card.label} settings`,
        content,
        opener: button,
        width: 460,
        height: 380,
      });
    });
  });

  shell.querySelectorAll(".le-palette-item").forEach((item) => {
    item.addEventListener("dragstart", (event) => {
      if (event.target.closest(".le-settings-btn")) event.preventDefault();
    });
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeLayoutEditor();
    }
  });

  // Remove card
  shell.querySelectorAll(".le-remove-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.cardId;
      delete config.layout[id];
      localStorage.setItem("layout", JSON.stringify(config.layout));
      closeFloatingModals(modal);
      modal.innerHTML = "";
      renderLayoutEditor(modal);
    });
  });

  // Drag and drop from the palette
  const paletteItems = shell.querySelectorAll(
    ".le-palette-item:not(.in-layout)",
  );

  paletteItems.forEach((item) => {
    item.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", item.dataset.cardId);
      item.style.opacity = "0.5";
    });
    item.addEventListener("dragend", (e) => {
      item.style.opacity = "";
    });
  });

  grid.addEventListener("dragover", (e) => e.preventDefault());
  grid.addEventListener("drop", (e) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("text/plain");
    if (!cardId || config.layout[cardId]) return;

    const rect = grid.getBoundingClientRect();
    const gap = 8;
    const currentCols = parseInt(colsInput.value) || 3;
    const currentRows = parseInt(rowsInput.value) || 3;
    const cellW = (rect.width - gap * (currentCols - 1)) / currentCols;
    const cellH = (rect.height - gap * (currentRows - 1)) / currentRows;
    const x = Math.max(
      0,
      Math.min(
        Math.floor((e.clientX - rect.left) / (cellW + gap)),
        currentCols - 1,
      ),
    );
    const y = Math.max(
      0,
      Math.min(
        Math.floor((e.clientY - rect.top) / (cellH + gap)),
        currentRows - 1,
      ),
    );

    config.layout[cardId] = { x, y, width: 1, height: 1 };
    localStorage.setItem("layout", JSON.stringify(config.layout));
    closeFloatingModals(modal);
    modal.innerHTML = "";
    renderLayoutEditor(modal);
  });

  // Drag to reposition cards
  setupCardDrag(grid);

  // ─── Resize cards ─────────────────────────────────────────────────────
  setupCardResize(grid);

  // ─── Export ────────────────────────────────────────────────────────────
  shell.querySelector("#leExport").addEventListener("click", () => {
    const exportData = {
      version: "26.10.24",
      gridCols: config.gridCols,
      gridRows: config.gridRows,
      layout: config.layout,
      hiddenCards: config.hiddenSections,
      customColors: getCustomColors(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `pitbeacon-layout-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    displayMessage("Layout exported!", "message");
  });

  // ─── Import ────────────────────────────────────────────────────────────
  shell.querySelector("#leImport").addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (data.gridCols) config.gridCols = data.gridCols;
          if (data.gridRows) config.gridRows = data.gridRows;
          if (data.layout) config.layout = data.layout;
          if (data.hiddenCards) config.hiddenSections = data.hiddenCards;
          if (data.customColors) {
            Object.entries(data.customColors).forEach(([k, v]) => {
              document.documentElement.style.setProperty(k, v);
            });
            localStorage.setItem(
              "customColors",
              JSON.stringify(data.customColors),
            );
          }
          localStorage.setItem("gridCols", config.gridCols);
          localStorage.setItem("gridRows", config.gridRows);
          localStorage.setItem("layout", JSON.stringify(config.layout));
          localStorage.setItem(
            "hiddenCards",
            JSON.stringify(config.hiddenSections),
          );
          displayMessage("Layout imported!", "message");
          closeFloatingModals(modal);
          modal.innerHTML = "";
          renderLayoutEditor(modal);
        } catch (err) {
          displayMessage("Import failed: " + err.message, "error");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });

  // ─── Reset ─────────────────────────────────────────────────────────────
  shell.querySelector("#leReset").addEventListener("click", () => {
    if (!confirm("Reset layout to default?")) return;
    config.layout = structuredClone(DEFAULT_LAYOUT);
    config.gridCols = 3;
    config.gridRows = 3;
    config.gridSize = 3;
    config.hiddenSections = [];
    ["gridCols", "gridRows", "gridSize"].forEach((key) => localStorage.setItem(key, "3"));
    localStorage.setItem("layout", JSON.stringify(config.layout));
    localStorage.setItem("hiddenCards", JSON.stringify(config.hiddenSections));
    displayMessage("Layout reset to default", "message");
    closeFloatingModals(modal);
    modal.innerHTML = "";
    renderLayoutEditor(modal);
  });
}

// ─── Helper to get custom colors ──────────────────────────────────────────


export function closeLayoutEditor() {
  if (layoutEditorState.modal) {
    closeFloatingModals(layoutEditorState.modal);
    layoutEditorState.modal.classList.remove("active");
    layoutEditorState.modal.innerHTML = "";
    layoutEditorState.modal = null;
    layoutEditorState.shell = null;
    renderLayout();
  }
}

// ─── Card Drag Functionality ─────────────────────────────────────────────

export function setupCardDrag(grid) {
  grid.addEventListener("mousedown", (e) => {
    const item = e.target.closest(".layout-item");
    if (!item) return;
    if (e.target.closest(".le-remove-btn")) return;
    if (e.target.closest(".resize-handle")) return;

    const rect = grid.getBoundingClientRect();
    const gap = 8;
    const cols = config.gridCols || 3;
    const rows = config.gridRows || 3;
    const cellW = (rect.width - gap * (cols - 1)) / cols;
    const cellH = (rect.height - gap * (rows - 1)) / rows;

    const cardId = item.dataset.cardId;
    const pos = config.layout[cardId];
    if (!pos) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startGridX = pos.x;
    const startGridY = pos.y;

    item.classList.add("dragging");

    const onMove = (ev) => {
      const dx = Math.round((ev.clientX - startX) / (cellW + gap));
      const dy = Math.round((ev.clientY - startY) / (cellH + gap));
      const newX = Math.max(0, Math.min(startGridX + dx, cols - pos.width));
      const newY = Math.max(0, Math.min(startGridY + dy, rows - pos.height));

      if (newX !== pos.x || newY !== pos.y) {
        pos.x = newX;
        pos.y = newY;
        item.style.gridColumn = `${pos.x + 1} / span ${pos.width}`;
        item.style.gridRow = `${pos.y + 1} / span ${pos.height}`;
      }
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      item.classList.remove("dragging");
      localStorage.setItem("layout", JSON.stringify(config.layout));
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });
}

// ─── Card Resize Functionality ────────────────────────────────────────────

export function setupCardResize(grid) {
  grid.addEventListener("mousedown", (e) => {
    const handle = e.target.closest(".resize-handle");
    if (!handle) return;

    const item = handle.closest(".layout-item");
    if (!item) return;

    const rect = grid.getBoundingClientRect();
    const gap = 8;
    const cols = config.gridCols || 3;
    const rows = config.gridRows || 3;
    const cellW = (rect.width - gap * (cols - 1)) / cols;
    const cellH = (rect.height - gap * (rows - 1)) / rows;

    const cardId = item.dataset.cardId;
    const pos = config.layout[cardId];
    if (!pos) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = pos.width;
    const startH = pos.height;

    item.classList.add("resizing");
    e.preventDefault();

    const onMove = (ev) => {
      const dx = Math.round((ev.clientX - startX) / (cellW + gap));
      const dy = Math.round((ev.clientY - startY) / (cellH + gap));

      const newW = Math.max(1, Math.min(startW + dx, cols - pos.x));
      const newH = Math.max(1, Math.min(startH + dy, rows - pos.y));

      if (newW !== pos.width || newH !== pos.height) {
        pos.width = newW;
        pos.height = newH;
        item.style.gridColumn = `${pos.x + 1} / span ${pos.width}`;
        item.style.gridRow = `${pos.y + 1} / span ${pos.height}`;
        const hint = item.querySelector(".layout-item-hint");
        if (hint) hint.textContent = `${pos.width} × ${pos.height} cells`;
      }
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      item.classList.remove("resizing");
      localStorage.setItem("layout", JSON.stringify(config.layout));
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });
}

// ─── Card Manager ──────────────────────────────────────────────────────────

