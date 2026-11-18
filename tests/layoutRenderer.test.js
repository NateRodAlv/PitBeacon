import { afterEach, describe, expect, it } from "vitest";
import { LayoutRenderer } from "../src/ui/layoutRenderer.js";

describe("LayoutRenderer card status dots", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    delete window._pitbeaconConfig;
    delete window._pitbeaconRender;
    delete window._pitbeaconNotify;
  });

  it("shows status dots by default and removes them when disabled", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const renderer = new LayoutRenderer(
      { get: () => ({ builtin: true }) },
      { validate: (layout) => ({ layout, errors: [], warnings: [] }) },
      { getState: () => ({}) },
      {},
      {},
    );
    const layout = { "test-card": { x: 0, y: 0, width: 1, height: 1 } };

    renderer.render({ layout }, container);
    expect(container.querySelector(".card-status-dot")).not.toBeNull();

    renderer.render({ layout, showCardStatusDots: false }, container);
    expect(container.querySelector(".card-status-dot")).toBeNull();
  });
});
