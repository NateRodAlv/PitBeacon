import { icon } from "../lib/icons.js";

const hosts = new WeakMap();
const documentManagers = new WeakMap();
let nextWindowId = 0;

function registerHost(state) {
  const { ownerDocument } = state;
  let manager = documentManagers.get(ownerDocument);
  if (!manager) {
    manager = { hosts: new Set(), onKeyDown: null };
    manager.onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      let topWindow = null;
      let topPriority = -Infinity;
      for (const hostState of manager.hosts) {
        for (const floatingWindow of hostState.windows.values()) {
          const priority =
            hostState.priority * 10000 +
            Number(floatingWindow.element.style.zIndex);
          if (priority > topPriority) {
            topPriority = priority;
            topWindow = floatingWindow;
          }
        }
      }
      if (!topWindow) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      topWindow.close();
    };
    documentManagers.set(ownerDocument, manager);
    ownerDocument.addEventListener("keydown", manager.onKeyDown, true);
  }
  manager.hosts.add(state);
  state.manager = manager;
}

function unregisterHost(state) {
  const manager = state.manager;
  manager.hosts.delete(state);
  if (manager.hosts.size) return;
  state.ownerDocument.removeEventListener("keydown", manager.onKeyDown, true);
  documentManagers.delete(state.ownerDocument);
}

function getHost(parent) {
  let state = hosts.get(parent);
  if (state?.host.isConnected) return state;
  if (state) closeFloatingModals(parent);

  const ownerDocument = parent.ownerDocument;
  const host = ownerDocument.createElement("div");
  host.className = `floating-modal-host${parent === ownerDocument.body ? " floating-modal-host--viewport" : ""}`;
  parent.appendChild(host);
  state = {
    host,
    parent,
    ownerDocument,
    windows: new Map(),
    nextZIndex: 1,
    priority:
      parent === ownerDocument.body
        ? 12000
        : Number(ownerDocument.defaultView?.getComputedStyle(parent).zIndex) ||
          0,
  };
  hosts.set(parent, state);
  registerHost(state);

  host.addEventListener("pointerdown", (event) => {
    const floatingWindow = event.target.closest(".floating-modal-window");
    if (floatingWindow) floatingWindow.style.zIndex = String(state.nextZIndex++);
  });

  return state;
}

export function closeFloatingModals(parent) {
  const state = hosts.get(parent);
  if (!state) return;
  [...state.windows.values()].forEach((floatingWindow) =>
    floatingWindow.close(false),
  );
}

export function openFloatingModal({
  parent,
  title,
  id = title,
  content,
  opener = null,
  onClose = null,
  width = 460,
  height = 360,
}) {
  if (!(parent instanceof HTMLElement)) {
    throw new TypeError("A parent element is required to open a floating modal.");
  }
  const windowKey = String(id || "");
  if (!windowKey) throw new TypeError("A floating modal id is required.");

  const state = getHost(parent);
  const existing = state.windows.get(windowKey);
  if (existing) {
    existing.focus();
    return existing;
  }

  const { ownerDocument } = state;
  const view = ownerDocument.defaultView || window;
  const floatingWindow = ownerDocument.createElement("section");
  const titleId = `floatingModalTitle${++nextWindowId}`;
  floatingWindow.className = "floating-modal-window";
  floatingWindow.dataset.floatingModalId = windowKey;
  floatingWindow.setAttribute("role", "dialog");
  floatingWindow.setAttribute("aria-modal", "false");
  floatingWindow.setAttribute("aria-labelledby", titleId);

  const hostBounds = state.host.getBoundingClientRect();
  const availableWidth =
    hostBounds.width || parent.clientWidth || view.innerWidth;
  const availableHeight =
    hostBounds.height || parent.clientHeight || view.innerHeight;
  const saved = JSON.parse(
    view.localStorage.getItem(`pitbeacon:floating-modal:${encodeURIComponent(windowKey)}`) ||
      "null",
  );
  const requestedWidth =
    Number.isFinite(saved?.width) && saved.width >= 280 ? saved.width : width;
  const requestedHeight =
    Number.isFinite(saved?.height) && saved.height >= 180
      ? saved.height
      : height;
  const windowWidth = Math.min(
    requestedWidth,
    Math.max(280, availableWidth - 32),
  );
  const windowHeight = Math.min(
    requestedHeight,
    Math.max(180, availableHeight - 32),
  );
  floatingWindow.style.width = `${windowWidth}px`;
  floatingWindow.style.height = `${windowHeight}px`;
  const offset = (state.windows.size % 8) * 28;
  const maxLeft = Math.max(0, availableWidth - windowWidth);
  const maxTop = Math.max(0, availableHeight - windowHeight);
  const savedLeft = Number.isFinite(saved?.left)
    ? saved.left
    : (availableWidth - windowWidth) / 2 + offset;
  const savedTop = Number.isFinite(saved?.top)
    ? saved.top
    : (availableHeight - windowHeight) / 2 + offset;
  floatingWindow.style.left = `${Math.max(
    0,
    Math.min(maxLeft, savedLeft),
  )}px`;
  floatingWindow.style.top = `${Math.max(
    0,
    Math.min(maxTop, savedTop),
  )}px`;

  const header = ownerDocument.createElement("header");
  header.className = "floating-modal-header";
  const heading = ownerDocument.createElement("h2");
  heading.className = "floating-modal-title";
  heading.id = titleId;
  heading.textContent = title;
  const lockButton = ownerDocument.createElement("button");
  lockButton.type = "button";
  lockButton.className = "floating-modal-lock";
  const closeButton = ownerDocument.createElement("button");
  closeButton.type = "button";
  closeButton.className = "floating-modal-close";
  closeButton.setAttribute("aria-label", `Close ${title}`);
  closeButton.textContent = "×";
  header.append(heading, lockButton, closeButton);

  const body = ownerDocument.createElement("div");
  body.className = "floating-modal-body";
  const contentParent = content.parentNode;
  const contentNextSibling = content.nextSibling;
  const contentDocument = content.ownerDocument;
  body.append(content);
  floatingWindow.append(header, body);
  state.host.appendChild(floatingWindow);

  let locked = saved?.locked === true;
  let cancelDrag = () => {};
  const storageKey = `pitbeacon:floating-modal:${encodeURIComponent(windowKey)}`;
  const saveGeometry = () => {
    view.localStorage.setItem(
      storageKey,
      JSON.stringify({
        left: parseFloat(floatingWindow.style.left),
        top: parseFloat(floatingWindow.style.top),
        width:
          floatingWindow.offsetWidth || parseFloat(floatingWindow.style.width),
        height:
          floatingWindow.offsetHeight || parseFloat(floatingWindow.style.height),
        locked,
      }),
    );
  };
  const syncLockedState = () => {
    floatingWindow.classList.toggle("is-locked", locked);
    floatingWindow.style.resize = locked ? "none" : "both";
    lockButton.setAttribute("aria-pressed", String(locked));
    lockButton.setAttribute("aria-label", `${locked ? "Unlock" : "Lock"} window`);
    lockButton.title = `${locked ? "Unlock" : "Lock"} window`;
    lockButton.innerHTML = icon(locked ? "lock" : "unlock", 16);
  };
  const close = (restoreFocus = true) => {
    if (state.windows.get(windowKey) !== handle) return;
    cancelDrag();
    saveGeometry();
    state.windows.delete(windowKey);
    ownerDocument.removeEventListener("pointerup", saveGeometry);
    if (contentParent) {
      contentDocument.adoptNode(content);
      contentParent.insertBefore(
        content,
        contentNextSibling?.parentNode === contentParent
          ? contentNextSibling
          : null,
      );
    }
    floatingWindow.remove();
    if (state.windows.size === 0) {
      state.host.remove();
      unregisterHost(state);
      hosts.delete(parent);
    }
    onClose?.();
    if (restoreFocus && opener?.isConnected && parent.isConnected) opener.focus();
  };
  const focus = () => {
    floatingWindow.style.zIndex = String(state.nextZIndex++);
    closeButton.focus();
  };
  const handle = { element: floatingWindow, close, focus };
  floatingWindow.style.zIndex = String(state.nextZIndex++);
  state.windows.set(windowKey, handle);
  syncLockedState();
  lockButton.addEventListener("click", () => {
    locked = !locked;
    syncLockedState();
    saveGeometry();
  });
  closeButton.addEventListener("click", close);
  ownerDocument.addEventListener("pointerup", saveGeometry);
  floatingWindow.addEventListener("focusin", () => {
    floatingWindow.style.zIndex = String(state.nextZIndex++);
  });

  header.addEventListener("pointerdown", (event) => {
    if (locked || event.button !== 0 || event.target.closest("button")) return;
    event.preventDefault();
    floatingWindow.style.zIndex = String(state.nextZIndex++);
    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = parseFloat(floatingWindow.style.left);
    const startTop = parseFloat(floatingWindow.style.top);

    const onMove = (moveEvent) => {
      const bounds = state.host.getBoundingClientRect();
      const hostWidth = bounds.width || view.innerWidth;
      const hostHeight = bounds.height || view.innerHeight;
      const windowWidth =
        floatingWindow.offsetWidth || parseFloat(floatingWindow.style.width);
      const windowHeight =
        floatingWindow.offsetHeight || parseFloat(floatingWindow.style.height);
      const maxLeft = Math.max(0, hostWidth - windowWidth);
      const maxTop = Math.max(0, hostHeight - windowHeight);
      floatingWindow.style.left = `${Math.max(
        0,
        Math.min(maxLeft, startLeft + moveEvent.clientX - startX),
      )}px`;
      floatingWindow.style.top = `${Math.max(
        0,
        Math.min(maxTop, startTop + moveEvent.clientY - startY),
      )}px`;
    };
    const onUp = () => {
      ownerDocument.removeEventListener("pointermove", onMove);
      ownerDocument.removeEventListener("pointerup", onUp);
      cancelDrag = () => {};
      saveGeometry();
    };
    cancelDrag = onUp;
    ownerDocument.addEventListener("pointermove", onMove);
    ownerDocument.addEventListener("pointerup", onUp);
  });

  closeButton.focus();
  return handle;
}
