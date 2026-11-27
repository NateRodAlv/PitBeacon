import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { loadSettings } from "../src/app/settings.js";

function loadAppHtml() {
  const html = readFileSync(resolve(process.cwd(), "index.html"), "utf8");
  const app = new DOMParser().parseFromString(html, "text/html");
  document.body.innerHTML = app.body.innerHTML;
}

describe("loadSettings", () => {
  it("loads against the app HTML without a season override control", () => {
    localStorage.clear();

    loadAppHtml();

    expect(document.getElementById("seasonYearOverride")).toBeNull();
    expect(() => loadSettings()).not.toThrow();
    expect(document.getElementById("autoHideTopBar").checked).toBe(false);
    expect(document.getElementById("autoHideTopBarDelay").value).toBe("5");
    expect(document.getElementById("autoHideTopBarDelay").disabled).toBe(true);
  });

  it("restores auto-hide top bar settings", () => {
    localStorage.clear();
    loadAppHtml();
    localStorage.setItem("autoHideTopBar", "true");
    localStorage.setItem("autoHideTopBarDelay", "12");

    loadSettings();

    expect(document.getElementById("autoHideTopBar").checked).toBe(true);
    expect(document.getElementById("autoHideTopBarDelay").value).toBe("12");
    expect(document.getElementById("autoHideTopBarDelay").disabled).toBe(false);
  });
});
