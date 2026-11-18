import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadSettings } from "../src/app/settings.js";

describe("loadSettings", () => {
  it("loads against the app HTML without a season override control", () => {
    localStorage.clear();

    const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
    const app = new DOMParser().parseFromString(html, "text/html");
    document.body.innerHTML = app.body.innerHTML;

    expect(document.getElementById("seasonYearOverride")).toBeNull();
    expect(() => loadSettings()).not.toThrow();
  });
});
