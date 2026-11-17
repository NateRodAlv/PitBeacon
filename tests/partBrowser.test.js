import { describe, expect, it } from "vitest";
import { connectorsForPart, countConnectorsByPart, filterAndSortParts, filterConnectors } from "../src/viewer/partBrowser.js";

const parts = ["Base", "Arm", "Intake Roller", "Claw", "Wheel"].map((label) => ({ label }));
const labels = (res) => res.rows.map((r) => r.label);

describe("filterAndSortParts", () => {
  it("filters case-insensitively by substring and trims the query", () => {
    expect(labels(filterAndSortParts({ parts, query: "  ROLL " }))).toEqual(["Intake Roller"]);
    expect(labels(filterAndSortParts({ parts, query: "a" }))).toEqual(["Base", "Arm", "Intake Roller", "Claw", "Wheel"].filter((l) => l.toLowerCase().includes("a")));
    expect(filterAndSortParts({ parts, query: "zzz" })).toMatchObject({ rows: [], hiddenCount: 0 });
  });

  it("orders flagged > in-progress > pending > has-connector > model order", () => {
    const summary = {
      Wheel: { state: "pending", open: 1 },
      Claw: { state: "flagged", open: 1 },
      Arm: { state: "in-progress", open: 2 },
    };
    const res = filterAndSortParts({ parts, summary, connectorCounts: { Base: 1, "Intake Roller": 3 } });
    expect(labels(res)).toEqual(["Claw", "Arm", "Wheel", "Base", "Intake Roller"]);
    const plain = filterAndSortParts({ parts, connectorCounts: { Wheel: 1 } });
    expect(labels(plain)).toEqual(["Wheel", "Base", "Arm", "Intake Roller", "Claw"]);
  });

  it("breaks ties on open count, then model order; reports state, open and connectors", () => {
    const summary = { Base: { state: "pending", open: 1 }, Arm: { state: "pending", open: 3 } };
    const res = filterAndSortParts({ parts, summary, connectorCounts: { Arm: 2 } });
    expect(labels(res).slice(0, 2)).toEqual(["Arm", "Base"]);
    expect(res.rows[0]).toMatchObject({ state: "pending", open: 3, connectors: 2 });
    expect(res.rows[4]).toMatchObject({ state: "ok", open: 0 });
  });

  it("caps rows and reports how many are hidden", () => {
    const many = Array.from({ length: 400 }, (_, i) => ({ label: "P" + i }));
    const res = filterAndSortParts({ parts: many, limit: 150 });
    expect(res.rows).toHaveLength(150);
    expect(res.hiddenCount).toBe(250);
    expect(filterAndSortParts({ parts: many, query: "P39", limit: 150 }).hiddenCount).toBe(0);
  });
});

describe("connectors", () => {
  const mechs = [
    { id: "a", name: "Group", nodes: ["Arm", "Claw", "Wheel"], jointType: "revolute" },
    { id: "b", name: "Single", nodes: ["Arm"], jointType: "prismatic" },
    { id: "c", name: "Manual", partId: "Arm", nodes: ["Arm"], source: "manual" },
    { id: "d", name: "Other", nodes: ["Base"] },
    { id: "e", name: "Pair", nodes: ["Arm", "Base"] },
  ];

  it("matches by partId and by nodes, most specific first", () => {
    const res = connectorsForPart(mechs, "Arm", 10);
    expect(res.items.map((m) => m.id)).toEqual(["b", "c", "e", "a"]);
    expect(connectorsForPart(mechs, "Base").items.map((m) => m.id)).toEqual(["d", "e"]);
    expect(connectorsForPart(mechs, "Nope").total).toBe(0);
  });

  it("caps and reports hidden connectors", () => {
    const res = connectorsForPart(mechs, "Arm", 2);
    expect(res.items).toHaveLength(2);
    expect(res.hiddenCount).toBe(2);
    expect(res.total).toBe(4);
  });

  it("counts connectors per part once even if partId and nodes both list it", () => {
    expect(countConnectorsByPart(mechs, ["Arm", "Base", "Claw"])).toEqual({ Arm: 4, Base: 2, Claw: 1 });
  });

  it("filters connectors by name, part or joint type", () => {
    expect(filterConnectors(mechs, "PRISM").rows.map((m) => m.id)).toEqual(["b"]);
    expect(filterConnectors(mechs, "base").rows.map((m) => m.id)).toEqual(["d", "e"]);
    expect(filterConnectors(mechs, "", 2)).toMatchObject({ hiddenCount: 3 });
  });
});
