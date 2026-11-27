import { describe, expect, it } from "vitest";
import { getSeasonYear } from "../src/core/season.js";

describe("getSeasonYear", () => {
  it("uses the year of the date being shown", () => {
    expect(getSeasonYear(new Date(2027, 2, 14))).toBe(2027);
    expect(getSeasonYear(new Date(2026, 11, 31))).toBe(2026);
  });

  it("follows Test Mode dates rather than the real clock", () => {
    expect(getSeasonYear(new Date(2025, 3, 26))).toBe(2025);
  });
});
