import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { saveRobotModel, VIEWER_DB_NAME } from "../src/data/robotModel.js";

function readLast() {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(VIEWER_DB_NAME, 1);
    open.onsuccess = () => {
      const req = open.result.transaction("models").objectStore("models").get("last");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    };
    open.onerror = () => reject(open.error);
  });
}

describe("saveRobotModel", () => {
  it("stores files in the record shape the viewer reads", async () => {
    const buffer = new TextEncoder().encode("<robot/>").buffer;
    await saveRobotModel([{ name: "robot.urdf", buffer }]);
    const saved = await readLast();
    expect(saved.files).toHaveLength(1);
    expect(saved.files[0].name).toBe("robot.urdf");
    expect(saved.files[0].buffer.byteLength).toBe(8);
    expect(typeof saved.savedAt).toBe("number");
  });
  it("rejects a selection with no model file", async () => {
    await expect(saveRobotModel([{ name: "notes.txt", buffer: new ArrayBuffer(1) }])).rejects.toThrow(/urdf/i);
  });
});
