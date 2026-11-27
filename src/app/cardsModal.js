import { config, devCardRuntime, docsModal, registry, renderLayout } from "./context.js";
import { initCardManager, renderCardManager } from "./cardsManager.js";
import {
  refreshUploadOptions,
  renderCardCatalog,
  setupCardUpload,
} from "./cardsCatalog.js";
import { getCardSettingValues } from "./cardSettings.js";
import { detectConfigurableSettings } from "../data/cardCatalog.js";

const TABS = ["mine", "catalog", "create"];

let modal;
let editorReady = false;
let catalogLoaded = false;
let activeTab = "mine";

function panel(name) {
  return modal.querySelector(`.cards-panel[data-panel="${name}"]`);
}

function ensureEditor() {
  const editor = modal.querySelector("#devCardModal");
  if (!editorReady) {
    devCardRuntime.initEditor(editor);
    editorReady = true;
  }
  return editor;
}

export function selectTab(name, { reload = false } = {}) {
  if (!TABS.includes(name)) name = "mine";
  activeTab = name;

  modal.querySelectorAll(".cards-tab").forEach((tab) => {
    const selected = tab.dataset.tab === name;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  TABS.forEach((tabName) => {
    panel(tabName).hidden = tabName !== name;
  });

  if (name === "mine") renderCardManager();
  if (name === "catalog" && (!catalogLoaded || reload)) {
    catalogLoaded = true;
    renderCardCatalog(modal);
  }
  if (name === "create") {
    const editor = ensureEditor();
    // The editor resets to its "new / existing" picker whenever it becomes active.
    editor.classList.remove("active");
    void editor.offsetWidth;
    editor.classList.add("active");
  }
}

export function openCardsModal(tab = "mine") {
  modal.classList.add("active");
  selectTab(tab);
  modal.querySelector(`.cards-tab[data-tab="${activeTab}"]`)?.focus();
}

export function closeCardsModal() {
  modal.classList.remove("active");
  // Stop live card previews running in the background.
  modal.querySelector("#cardCatalogList").innerHTML = "";
  catalogLoaded = false;
}

function editCard(id) {
  selectTab("create");
  const editor = modal.querySelector("#devCardModal");
  // Wait for the editor's own "reset to picker" pass, then load the card.
  setTimeout(() => editor._devCardLoad?.(id), 0);
}

function onCardSaved({ detail }) {
  const { id, def } = detail;
  config.developerCards[id] = def;
  const existing = registry.get(id);
  if (existing?.developer && !existing.settings && def.js) {
    def.settings = detectConfigurableSettings(def.js);
  }
  def.settingsValues = getCardSettingValues({ id, ...def });
  refreshUploadOptions();
  if (activeTab === "mine") renderCardManager();
}

export function initCardsModal() {
  modal = document.getElementById("cardsModal");
  if (!modal) return;

  initCardManager(panel("mine"), { onEdit: editCard });
  setupCardUpload(document.getElementById("cardUploadModal"));

  modal.querySelectorAll(".cards-tab").forEach((tab, index, tabs) => {
    tab.addEventListener("click", () => selectTab(tab.dataset.tab));
    tab.addEventListener("keydown", (event) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
      if (!step) return;
      const next = tabs[(index + step + tabs.length) % tabs.length];
      next.focus();
      selectTab(next.dataset.tab);
    });
  });

  modal.querySelector("#cardsClose").addEventListener("click", closeCardsModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeCardsModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !modal.classList.contains("active")) return;
    // Escape closes the top-most dialog first.
    const nested = document.querySelector(
      "#cardCatalogDetailModal.active, #cardUploadModal.active, #cardUpdateModal.active",
    );
    if (nested) nested.classList.remove("active");
    else closeCardsModal();
  });

  modal.querySelector("#devCardGuide").addEventListener("click", () => docsModal.open());
  modal.querySelector("#cardCatalogSubmit").addEventListener("click", () => {
    refreshUploadOptions();
    document.getElementById("cardUploadModal").classList.add("active");
  });

  window.addEventListener("pitbeacon:card-saved", onCardSaved);

  // Sub-dialogs (card details, submit, request update) keep their own close handling.
  const closeOnBackdrop = (id) => {
    const element = document.getElementById(id);
    element?.addEventListener("click", (event) => {
      if (event.target === element) element.classList.remove("active");
    });
  };
  ["cardCatalogDetailModal", "cardUploadModal"].forEach(closeOnBackdrop);
  const closeButton = (buttonId, dialogId) =>
    document.getElementById(buttonId)?.addEventListener("click", () => {
      document.getElementById(dialogId).classList.remove("active");
    });
  closeButton("cardCatalogDetailClose", "cardCatalogDetailModal");
  closeButton("cardUploadClose", "cardUploadModal");
  document.getElementById("cardUpdateClose")?.addEventListener("click", () => {
    document.getElementById("cardUpdateCancel")?.click();
  });

  document.getElementById("cardsBtn")?.addEventListener("click", () => openCardsModal("mine"));
  // Newly installed catalog cards should show up in My Cards straight away.
  window.addEventListener("pitbeacon:cards-changed", () => {
    if (activeTab === "mine") renderCardManager();
  });
  void renderLayout;
}
