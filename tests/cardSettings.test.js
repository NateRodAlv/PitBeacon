import { describe, expect, it } from "vitest";
import { PIT_NOTES_SETTINGS } from "../src/cards/builtin/pitNotesCard.js";
import { renderCardSettingsControls } from "../src/app/cardSettings.js";

describe("card settings controls", () => {
  it("renders all Pit Notes settings, including its select control", () => {
    const container = document.createElement("div");
    const card = { id: "pit-notes-card", settings: PIT_NOTES_SETTINGS };
    const values = Object.fromEntries(
      Object.entries(PIT_NOTES_SETTINGS).map(([key, setting]) => [key, setting.default]),
    );

    renderCardSettingsControls(container, card, values, () => {});

    expect(container.querySelectorAll(".card-setting-field")).toHaveLength(
      Object.keys(PIT_NOTES_SETTINGS).length,
    );
    expect(container.querySelector('select[name="defaultSection"]').value).toBe("tasks");
  });
});
