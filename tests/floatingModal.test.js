import { afterEach, describe, expect, it } from "vitest";
import {
  closeFloatingModals,
  openFloatingModal,
} from "../src/ui/floatingModal.js";

const parents = [];
const storageIds = [];

function createParent() {
  const parent = document.createElement("div");
  document.body.appendChild(parent);
  parents.push(parent);
  return parent;
}

function openTrackedModal(options) {
  const id = options.id || options.title;
  storageIds.push(id);
  return openFloatingModal(options);
}

describe("floating modals", () => {
  afterEach(() => {
    parents.forEach(closeFloatingModals);
    parents.length = 0;
    storageIds.forEach((id) =>
      localStorage.removeItem(
        `pitbeacon:floating-modal:${encodeURIComponent(id)}`,
      ),
    );
    storageIds.length = 0;
    document.body.replaceChildren();
  });

  it("allows multiple windows and Escape closes only the top window", () => {
    const parent = createParent();
    const first = openTrackedModal({
      parent,
      id: "first-window",
      title: "First settings",
      content: document.createElement("div"),
    });
    const second = openTrackedModal({
      parent,
      id: "second-window",
      title: "Second settings",
      content: document.createElement("div"),
    });

    expect(parent.querySelectorAll(".floating-modal-window")).toHaveLength(2);
    expect(first.element.getAttribute("aria-modal")).toBe("false");

    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );

    expect(second.element.isConnected).toBe(false);
    expect(first.element.isConnected).toBe(true);
  });

  it("drags a window by its title bar", () => {
    const parent = createParent();
    const { element } = openTrackedModal({
      parent,
      id: "drag-window",
      title: "Settings",
      content: document.createElement("div"),
    });
    const header = element.querySelector(".floating-modal-header");
    const startLeft = parseFloat(element.style.left);
    const startTop = parseFloat(element.style.top);

    header.dispatchEvent(
      new MouseEvent("pointerdown", {
        button: 0,
        clientX: 100,
        clientY: 100,
        bubbles: true,
      }),
    );
    document.dispatchEvent(
      new MouseEvent("pointermove", {
        clientX: 140,
        clientY: 130,
        bubbles: true,
      }),
    );
    document.dispatchEvent(new MouseEvent("pointerup", { bubbles: true }));

    expect(parseFloat(element.style.left)).toBe(startLeft + 40);
    expect(parseFloat(element.style.top)).toBe(startTop + 30);
  });

  it("removes all windows when their parent closes", () => {
    const parent = createParent();
    openTrackedModal({
      parent,
      id: "parent-window",
      title: "Settings",
      content: document.createElement("div"),
    });

    closeFloatingModals(parent);

    expect(parent.querySelector(".floating-modal-host")).toBeNull();
  });

  it("runs its close callback when a window is dismissed", () => {
    const parent = createParent();
    const contentParent = document.createElement("div");
    const content = document.createElement("div");
    contentParent.appendChild(content);
    document.body.appendChild(contentParent);
    let closed = false;
    const floatingModal = openTrackedModal({
      parent,
      id: "callback-window",
      title: "Settings",
      content,
      onClose: () => {
        closed = true;
      },
    });

    floatingModal.close();

    expect(closed).toBe(true);
    expect(content.parentNode).toBe(contentParent);
  });

  it("prevents duplicates and restores a locked window's position and size", () => {
    const parent = createParent();
    const first = openTrackedModal({
      parent,
      id: "persistent-window",
      title: "Settings",
      content: document.createElement("div"),
    });
    const duplicate = openTrackedModal({
      parent,
      id: "persistent-window",
      title: "Settings",
      content: document.createElement("div"),
    });
    first.element.style.left = "100px";
    first.element.style.top = "80px";
    first.element.style.width = "400px";
    first.element.style.height = "320px";
    first.element.querySelector(".floating-modal-lock").click();

    expect(duplicate).toBe(first);
    expect(parent.querySelectorAll(".floating-modal-window")).toHaveLength(1);
    expect(first.element.style.resize).toBe("none");
    first.close();

    const reopened = openTrackedModal({
      parent,
      id: "persistent-window",
      title: "Settings",
      content: document.createElement("div"),
    });

    expect(reopened.element.style.left).toBe("100px");
    expect(reopened.element.style.top).toBe("80px");
    expect(reopened.element.style.width).toBe("400px");
    expect(reopened.element.style.height).toBe("320px");
    expect(reopened.element.style.resize).toBe("none");

    const header = reopened.element.querySelector(".floating-modal-header");
    header.dispatchEvent(
      new MouseEvent("pointerdown", {
        button: 0,
        clientX: 100,
        clientY: 100,
        bubbles: true,
      }),
    );
    document.dispatchEvent(
      new MouseEvent("pointermove", {
        clientX: 140,
        clientY: 130,
        bubbles: true,
      }),
    );
    document.dispatchEvent(new MouseEvent("pointerup", { bubbles: true }));

    expect(reopened.element.style.left).toBe("100px");
    expect(reopened.element.style.top).toBe("80px");
  });
});
