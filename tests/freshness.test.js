import { describe, expect, it } from "vitest";
import { describeFreshness, getFreshness, STALE_AFTER_MS } from "../src/core/freshness.js";

const now = 1_000_000_000_000;

describe("getFreshness", () => {
  it("is grey with no data", () => {
    expect(getFreshness({ status: null, now })).toMatchObject({ state: "none", color: "grey" });
    expect(getFreshness({ status: { stale: false, lastUpdate: null, source: "live" }, now }).state).toBe("none");
  });
  it("is green for a recent live update", () => {
    const f = getFreshness({ status: { stale: false, lastUpdate: now - 30_000, source: "live" }, now });
    expect(f).toMatchObject({ state: "fresh", color: "green", lastUpdate: now - 30_000 });
  });
  it("turns yellow once the data is older than the stale window", () => {
    const f = getFreshness({ status: { stale: false, lastUpdate: now - STALE_AFTER_MS - 1, source: "live" }, now });
    expect(f).toMatchObject({ state: "stale", color: "yellow" });
  });
  it("is yellow for a saved copy that has not refreshed yet", () => {
    const f = getFreshness({ status: { stale: true, lastUpdate: now - 1000, source: "cache" }, now });
    expect(f.state).toBe("stale");
  });
  it("is red when the last refresh failed", () => {
    const f = getFreshness({ status: { stale: true, lastUpdate: now - 1000, source: "live" }, now });
    expect(f).toMatchObject({ state: "failed", color: "red" });
  });
  it("is red when offline, whatever the data says", () => {
    const f = getFreshness({ status: { stale: false, lastUpdate: now, source: "live" }, online: false, now });
    expect(f).toMatchObject({ state: "offline", color: "red" });
  });
});

describe("describeFreshness", () => {
  it("includes the last-updated time when known", () => {
    const text = describeFreshness({ state: "fresh", color: "green", lastUpdate: 1 }, () => "3:42 PM");
    expect(text).toBe("Up to date · updated 3:42 PM");
  });
  it("omits it when there is none", () => {
    expect(describeFreshness({ state: "none", color: "grey", lastUpdate: null })).toBe("No data yet");
  });
});
