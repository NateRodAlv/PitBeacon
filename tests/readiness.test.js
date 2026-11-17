import { describe, expect, it } from "vitest";
import { summarizeReadiness } from "../src/data/readiness.js";

const task = (over) => ({ id: Math.random().toString(36), task: "t", component: "", partId: null, status: "pending", flagged: false, ...over });
const battery = (status) => ({ id: status + Math.random(), label: "B", voltage: "12.6", cycles: "1", status, flagged: false });
const part = (quantity, minStock) => ({ id: "p" + quantity + minStock, name: "Part", quantity: String(quantity), minStock: String(minStock), partId: null, flagged: false });
const notes = (over = {}) => ({ tasks: [], batteries: [], parts: [], checkins: [], ...over });

describe("summarizeReadiness", () => {
  it("is ready when nothing is open", () => {
    const s = summarizeReadiness(notes({ batteries: [battery("ready"), battery("ready")], tasks: [task({ status: "completed" })] }));
    expect(s).toMatchObject({ level: "ready", openTasks: 0, flaggedTasks: 0 });
    expect(s.battery.state).toBe("ok");
  });
  it("counts open, flagged and in-progress tasks and ignores completed ones", () => {
    const s = summarizeReadiness(notes({ tasks: [task({}), task({ flagged: true }), task({ status: "in-progress" }), task({ status: "completed", flagged: true })] }));
    expect(s).toMatchObject({ openTasks: 3, flaggedTasks: 1, inProgressTasks: 1, level: "critical" });
  });
  it("needs attention for plain open tasks or low stock", () => {
    expect(summarizeReadiness(notes({ tasks: [task({})] })).level).toBe("attention");
    const s = summarizeReadiness(notes({ parts: [part(1, 2), part(5, 2)] }));
    expect(s.lowStock).toHaveLength(1);
    expect(s.level).toBe("attention");
  });
  it("grades the batteries", () => {
    expect(summarizeReadiness(notes()).battery.state).toBe("none");
    expect(summarizeReadiness(notes({ batteries: [battery("ready"), battery("dead"), battery("ready")] })).battery.state).toBe("warn");
    expect(summarizeReadiness(notes({ batteries: [battery("ready")] })).battery.state).toBe("warn");
    const none = summarizeReadiness(notes({ batteries: [battery("charging"), battery("dead")] }));
    expect(none.battery).toMatchObject({ state: "bad", ready: 0, charging: 1, dead: 1 });
    expect(none.level).toBe("critical");
  });
  it("ranks urgent parts by severity then open count, using viewer part names", () => {
    const s = summarizeReadiness(
      notes({
        tasks: [
          task({ partId: "arm", status: "pending" }),
          task({ partId: "arm", status: "pending" }),
          task({ partId: "intake", status: "in-progress" }),
          task({ partId: "climber", flagged: true }),
          task({ partId: "done", status: "completed" }),
        ],
      }),
      [{ id: "climber", name: "Climber hook" }],
      { urgentLimit: 2 },
    );
    expect(s.urgentParts.map((p) => [p.partId, p.name, p.state])).toEqual([
      ["climber", "Climber hook", "flagged"],
      ["intake", "intake", "in-progress"],
    ]);
  });
  it("lists flagged tasks first", () => {
    const s = summarizeReadiness(notes({ tasks: [task({ task: "a" }), task({ task: "b", flagged: true })] }));
    expect(s.urgentTasks[0].task).toBe("b");
  });
});
