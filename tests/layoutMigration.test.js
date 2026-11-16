import { describe, expect, it } from "vitest";
import { migrateHiddenList, migrateLayout } from "../src/core/layoutMigration.js";

const pos = (x, y) => ({ x, y, width: 1, height: 1 });

describe("migrateLayout", () => {
  it("merges the four note cards into one, at Robot Health's position when present", () => {
    const layout = { "match-card": pos(0, 0), "parts-card": pos(1, 0), "robot-health-card": pos(2, 0), "checkin-card": pos(2, 1) };
    migrateLayout(layout);
    expect(layout["pit-notes-card"]).toEqual(pos(2, 0));
    expect(Object.keys(layout).sort()).toEqual(["match-card", "pit-notes-card"]);
  });

  it("renames the statbotics card without overwriting an existing stats card", () => {
    const layout = { "statbotics-card": pos(0, 0) };
    migrateLayout(layout);
    expect(layout).toEqual({ "stats-card": pos(0, 0) });
    const both = { "statbotics-card": pos(0, 0), "stats-card": pos(1, 1) };
    migrateLayout(both);
    expect(both).toEqual({ "stats-card": pos(1, 1) });
  });

  it("leaves a current layout alone and tolerates junk", () => {
    const layout = { "pit-notes-card": pos(1, 1), "match-card": pos(0, 0) };
    expect(migrateLayout({ ...layout })).toEqual(layout);
    expect(migrateLayout(null)).toBeNull();
  });

  it("is safe to run twice", () => {
    const layout = { "battery-card": pos(0, 0) };
    migrateLayout(layout);
    const once = JSON.stringify(layout);
    migrateLayout(layout);
    expect(JSON.stringify(layout)).toBe(once);
  });
});

describe("migrateHiddenList", () => {
  it("hides Pit Notes only when all four old cards were hidden", () => {
    expect(migrateHiddenList(["robot-health-card", "battery-card", "parts-card", "checkin-card", "x"])).toEqual(["x", "pit-notes-card"]);
    expect(migrateHiddenList(["parts-card", "x"])).toEqual(["x"]);
    expect(migrateHiddenList(["statbotics-card"])).toEqual(["stats-card"]);
    expect(migrateHiddenList(undefined)).toBeUndefined();
  });
});
