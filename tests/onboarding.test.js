import { afterEach, describe, expect, it, vi } from "vitest";
import { config } from "../src/app/context.js";
import { openSetupWizard } from "../src/app/onboarding.js";

describe("setup wizard Test Mode", () => {
  const originalTbaKey = config.tbaapikey;

  afterEach(() => {
    document.querySelector(".setup-wizard .pb-btn-link")?.click();
    document.body.innerHTML = "";
    localStorage.clear();
    config.tbaapikey = originalTbaKey;
    vi.unstubAllGlobals();
  });

  it("loads attended events and offers each event day as a test date", async () => {
    localStorage.setItem("teamNumber", "7250");
    localStorage.setItem("welcomeDismissed2027", "true");
    config.tbaapikey = "test-key";

    const event = {
      key: "2024test",
      name: "Test Regional",
      start_date: "2024-04-03",
      end_date: "2024-04-05",
    };
    const fetchMock = vi.fn(async (url) => ({
      ok: true,
      json: async () => (url.endsWith("/years_participated") ? [2024] : [event]),
    }));
    vi.stubGlobal("fetch", fetchMock);

    openSetupWizard();
    const dialog = document.querySelector(".setup-wizard");
    dialog.querySelector("[data-wizard-next]").click();
    dialog.querySelector("[data-wizard-next]").click();
    expect(dialog.querySelector("#wizardTitle").textContent).toBe("Test mode");

    const enabled = dialog.querySelector('input[type="checkbox"]');
    enabled.checked = true;
    enabled.dispatchEvent(new Event("change", { bubbles: true }));
    Array.from(dialog.querySelectorAll("button"))
      .find((button) => button.textContent === "Find attended events")
      .click();

    await vi.waitFor(() => {
      expect(dialog.querySelector("#wizardTestModeResult").textContent).toContain("Found 1 events");
    });

    const selects = dialog.querySelectorAll("select");
    expect(selects[0].value).toBe("2024test");
    expect(Array.from(selects[1].options, (option) => option.value)).toEqual([
      "2024-04-03",
      "2024-04-04",
      "2024-04-05",
    ]);

    selects[1].value = "2024-04-04";
    selects[1].dispatchEvent(new Event("change", { bubbles: true }));
    dialog.querySelector("[data-wizard-next]").click();
    expect(dialog.querySelector("#wizardTitle").textContent).toBe("Look & feel");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
