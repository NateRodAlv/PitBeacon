import { describe, expect, it } from "vitest";
import { findMatchAlert, getNow, parseTestDate } from "../src/core/clock.js";

describe("parseTestDate", () => {
  it("reads YYYY-MM-DD as a local calendar date, not UTC", () => {
    expect(parseTestDate("2026-04-26")).toEqual({ year: 2026, month: 3, day: 26 });
    expect(parseTestDate(" 2027-1-5 ")).toEqual({ year: 2027, month: 0, day: 5 });
  });
  it("rejects blanks and junk", () => {
    expect(parseTestDate("")).toBeNull();
    expect(parseTestDate("not a date")).toBeNull();
  });
});

describe("getNow", () => {
  const real = new Date(2030, 0, 1, 13, 45, 12);
  it("is the real clock outside Test Mode", () => {
    expect(getNow({ testMode: false, testDate: "2026-04-26" }, real)).toBe(real);
  });
  it("keeps the real time of day on the test date", () => {
    const now = getNow({ testMode: true, testDate: "2026-04-26" }, real);
    expect([now.getFullYear(), now.getMonth(), now.getDate()]).toEqual([2026, 3, 26]);
    expect([now.getHours(), now.getMinutes(), now.getSeconds()]).toEqual([13, 45, 12]);
  });
  it("falls back to the real clock for an invalid test date", () => {
    expect(getNow({ testMode: true, testDate: "oops" }, real)).toBe(real);
  });
});

describe("findMatchAlert", () => {
  const match = (n, time, red = ["frc7250"]) => ({
    comp_level: "qm",
    match_number: n,
    predicted_time: time,
    alliances: { red: { team_keys: red }, blue: { team_keys: ["frc1", "frc2", "frc3"] } },
  });
  const opts = { teamNumber: 7250, nowSeconds: 1000, thresholdSeconds: 300, lastAlertId: null };

  it("alerts for our match inside the window", () => {
    const found = findMatchAlert([match(5, 1200)], opts);
    expect(found.matchId).toBe("qm-5");
    expect(found.secondsUntil).toBe(200);
  });
  it("ignores matches outside the window, in the past, or without us", () => {
    expect(findMatchAlert([match(5, 2000)], opts)).toBeNull();
    expect(findMatchAlert([match(5, 900)], opts)).toBeNull();
    expect(findMatchAlert([match(5, 1200, ["frc9"])], opts)).toBeNull();
  });
  it("does not repeat an alert that already fired", () => {
    expect(findMatchAlert([match(5, 1200)], { ...opts, lastAlertId: "qm-5" })).toBeNull();
  });
});
