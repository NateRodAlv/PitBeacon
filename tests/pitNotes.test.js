import { beforeEach, describe, expect, it } from "vitest";
import {
  addItem,
  loadNotes,
  migrateLegacy,
  NOTES_KEY,
  removeItem,
  sectionCounts,
  summarizeParts,
  updateItem,
} from "../src/data/pitNotes.js";

beforeEach(() => localStorage.clear());

describe("migration from the four old note cards", () => {
  it("keeps every field, gives items stable ids and renames the battery label", () => {
    localStorage.setItem("noteData-robot-health", JSON.stringify([{ task: "Re-tension chain", component: "Intake", status: "in-progress", flagged: true }]));
    localStorage.setItem("noteData-battery-manager", JSON.stringify([{ id: "B-12", voltage: "12.6", cycles: "40", status: "charging", flagged: false }]));
    localStorage.setItem("noteData-parts-inventory", JSON.stringify([{ name: "Falcon", quantity: "1", minStock: "2", flagged: false }]));
    localStorage.setItem("noteData-pit-checkin", JSON.stringify([{ task: "Inspection", assignedTo: "Sam", completed: true, flagged: false }]));

    const notes = loadNotes();
    expect(notes.tasks[0]).toMatchObject({ task: "Re-tension chain", component: "Intake", status: "in-progress", flagged: true, partId: null });
    expect(notes.batteries[0]).toMatchObject({ label: "B-12", voltage: "12.6", cycles: "40", status: "charging" });
    expect(notes.parts[0]).toMatchObject({ name: "Falcon", quantity: "1", minStock: "2" });
    expect(notes.checkins[0]).toMatchObject({ task: "Inspection", assignedTo: "Sam", completed: true });
    const ids = [notes.tasks[0].id, notes.batteries[0].id, notes.parts[0].id, notes.checkins[0].id];
    expect(new Set(ids).size).toBe(4);
  });

  it("leaves the old keys in place as a backup and does not migrate twice", () => {
    localStorage.setItem("noteData-robot-health", JSON.stringify([{ task: "A", status: "pending" }]));
    const first = loadNotes();
    expect(localStorage.getItem("noteData-robot-health")).not.toBeNull();
    localStorage.setItem("noteData-robot-health", JSON.stringify([{ task: "changed later" }]));
    expect(loadNotes().tasks[0].id).toBe(first.tasks[0].id);
    expect(loadNotes().tasks[0].task).toBe("A");
  });

  it("starts empty with no old data and survives corrupt JSON", () => {
    expect(loadNotes().tasks).toEqual([]);
    localStorage.clear();
    localStorage.setItem("noteData-robot-health", "{not json");
    expect(loadNotes().tasks).toEqual([]);
    localStorage.setItem(NOTES_KEY, "also bad");
    expect(loadNotes().batteries).toEqual([]);
  });

  it("coerces unknown statuses to a valid one", () => {
    const notes = migrateLegacy({ tasks: [{ task: "x", status: "weird" }], batteries: [{ id: "b", status: "???" }] });
    expect(notes.tasks[0].status).toBe("pending");
    expect(notes.batteries[0].status).toBe("ready");
  });
});

describe("editing", () => {
  it("adds, updates and removes by id, so reordering never hits the wrong row", () => {
    const a = addItem("tasks", { task: "A" });
    const b = addItem("tasks", { task: "B" });
    removeItem("tasks", a.id);
    updateItem("tasks", b.id, { status: "completed" });
    const notes = loadNotes();
    expect(notes.tasks).toHaveLength(1);
    expect(notes.tasks[0]).toMatchObject({ id: b.id, task: "B", status: "completed" });
  });

  it("ignores updates to an item that was deleted elsewhere", () => {
    const a = addItem("parts", { name: "Bolt" });
    removeItem("parts", a.id);
    expect(updateItem("parts", a.id, { name: "late edit" })).toBeNull();
    expect(loadNotes().parts).toEqual([]);
  });
});

describe("part status for the 3D viewer", () => {
  it("takes the worst open state per part and ignores finished tasks", () => {
    addItem("tasks", { task: "t1", partId: "intake", status: "pending" });
    addItem("tasks", { task: "t2", partId: "intake", status: "in-progress" });
    addItem("tasks", { task: "t3", partId: "arm", status: "completed", flagged: true });
    addItem("tasks", { task: "t4", partId: "climber", status: "pending", flagged: true });
    addItem("tasks", { task: "t5", status: "pending" });

    const summary = summarizeParts();
    expect(summary.intake).toMatchObject({ state: "in-progress", open: 2 });
    expect(summary.arm).toBeUndefined();
    expect(summary.climber).toMatchObject({ state: "flagged", open: 1 });
    expect(Object.keys(summary)).toEqual(["intake", "climber"]);
  });
});

describe("section counts", () => {
  it("counts open work and flags per section", () => {
    addItem("tasks", { status: "pending", flagged: true });
    addItem("tasks", { status: "completed" });
    addItem("batteries", { status: "dead" });
    addItem("parts", { quantity: "1", minStock: "2" });
    addItem("parts", { quantity: "5", minStock: "2" });
    addItem("checkins", { completed: false });
    const counts = sectionCounts();
    expect(counts.tasks).toEqual({ open: 1, flagged: 1 });
    expect(counts.batteries.open).toBe(1);
    expect(counts.parts.open).toBe(1);
    expect(counts.checkins.open).toBe(1);
  });
});
