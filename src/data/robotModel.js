// Saves a robot model where the 3D viewer looks for it, so a model chosen in the
// setup wizard is already loaded when the viewer card opens. Same database name,
// stores and record shape as src/viewer/viewer.js: change them together.

export const VIEWER_DB_NAME = "pitbeacon-robot-viewer-v2";
export const MODEL_EXTENSIONS = /\.(urdf|glb|gltf)$/i;
export const MODEL_SAVED_EVENT = "pitbeacon:robot-model-saved";

function openViewerDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("This browser can't store a model."));
    const request = indexedDB.open(VIEWER_DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("models");
      request.result.createObjectStore("libs");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** @param {{name: string, buffer: ArrayBuffer}[]} files */
export async function saveRobotModel(files) {
  if (!files.some((file) => MODEL_EXTENSIONS.test(file.name))) {
    throw new Error("Choose a .urdf, .glb or .gltf file.");
  }
  const db = await openViewerDb();
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction("models", "readwrite");
      tx.objectStore("models").put({ files, savedAt: Date.now() }, "last");
      tx.oncomplete = resolve;
      tx.onerror = tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
  window.dispatchEvent(new CustomEvent(MODEL_SAVED_EVENT));
}

/** Read File objects into the {name, buffer} records the viewer stores. */
export async function readModelFiles(fileList) {
  return Promise.all(
    Array.from(fileList || []).map(async (file) => ({ name: file.webkitRelativePath || file.name, buffer: await file.arrayBuffer() })),
  );
}
