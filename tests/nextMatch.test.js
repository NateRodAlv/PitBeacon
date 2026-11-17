import { describe, expect, it } from "vitest";
import { formatCountdown, getNextMatchBanner, matchLabel } from "../src/core/nextMatch.js";

const match = (n, time, red = [], blue = [], extra = {}) => ({
  comp_level: "qm",
  match_number: n,
  predicted_time: time,
  alliances: { red: { team_keys: red.map((t) => `frc${t}`) }, blue: { team_keys: blue.map((t) => `frc${t}`) } },
  ...extra,
});

describe("getNextMatchBanner", () => {
  const matches = [match(3, 5000, [1, 2, 3], [7250, 5, 6]), match(1, 1000, [7250, 8, 9], [1, 2, 3]), match(2, 3000, [1, 2, 3], [4, 5, 6])];

  it("picks our earliest unfinished match and its alliance", () => {
    const banner = getNextMatchBanner({ matches, teamNumber: 7250, nowSec: 500 });
    expect(banner).toMatchObject({ label: "Q1", alliance: "red", secondsUntil: 500, urgent: false, inProgress: false });
  });
  it("turns urgent inside the alert threshold", () => {
    const banner = getNextMatchBanner({ matches, teamNumber: 7250, nowSec: 800, alertThreshold: 300 });
    expect(banner.urgent).toBe(true);
    expect(banner.secondsUntil).toBe(200);
  });
  it("stays calm just outside the threshold", () => {
    expect(getNextMatchBanner({ matches, teamNumber: 7250, nowSec: 699, alertThreshold: 300 }).urgent).toBe(false);
    expect(getNextMatchBanner({ matches, teamNumber: 7250, nowSec: 700, alertThreshold: 300 }).urgent).toBe(true);
  });
  it("reports a match in progress until it should be over, then moves on", () => {
    const during = getNextMatchBanner({ matches, teamNumber: 7250, nowSec: 1100 });
    expect(during).toMatchObject({ label: "Q1", inProgress: true, urgent: true, secondsUntil: 0 });
    const after = getNextMatchBanner({ matches, teamNumber: 7250, nowSec: 1200 });
    expect(after).toMatchObject({ label: "Q3", alliance: "blue" });
  });
  it("returns null with no matches, no team matches, or nothing left", () => {
    expect(getNextMatchBanner({ matches: null, teamNumber: 7250, nowSec: 0 })).toBeNull();
    expect(getNextMatchBanner({ matches, teamNumber: 9999, nowSec: 0 })).toBeNull();
    expect(getNextMatchBanner({ matches, teamNumber: 7250, nowSec: 99999 })).toBeNull();
  });
  it("falls back to scheduled time and ignores matches with no time", () => {
    const list = [match(1, null, [7250], [], { time: 900 }), match(2, null, [7250], [])];
    expect(getNextMatchBanner({ matches: list, teamNumber: 7250, nowSec: 0 }).startsAt).toBe(900);
  });
});

describe("labels and countdown", () => {
  it("labels qualification and playoff matches", () => {
    expect(matchLabel({ comp_level: "qm", match_number: 12 })).toBe("Q12");
    expect(matchLabel({ comp_level: "sf", set_number: 2, match_number: 1 })).toBe("SF 2-1");
    expect(matchLabel({ comp_level: "f", set_number: 1, match_number: 2 })).toBe("F 1-2");
  });
  it("formats countdowns", () => {
    expect(formatCountdown(45)).toBe("45s");
    expect(formatCountdown(754)).toBe("12m 34s");
    expect(formatCountdown(3700)).toBe("1h 1m");
    expect(formatCountdown(-5)).toBe("0s");
  });
});
