// Minimal promise wrapper over IndexedDB: one database, several key/value
// object stores. Used for data that is too big or too binary for localStorage
// (cached event data, robot models).

export const DB_NAME = "pitbeacon";
const DB_VERSION = 1;
export const STORES = ["snapshots", "models"];

let dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const store of STORES) {
        if (!db.objectStoreNames.contains(store)) db.createObjectStore(store);
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };
      resolve(db);
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("IndexedDB upgrade blocked by another tab"));
  }).catch((error) => {
    dbPromise = null;
    throw error;
  });
  return dbPromise;
}

async function run(store, mode, action) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const request = action(tx.objectStore(store));
    tx.oncomplete = () => resolve(request?.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export const idb = {
  get: (store, key) => run(store, "readonly", (s) => s.get(key)),
  set: (store, key, value) => run(store, "readwrite", (s) => s.put(value, key)),
  delete: (store, key) => run(store, "readwrite", (s) => s.delete(key)),
  keys: (store) => run(store, "readonly", (s) => s.getAllKeys()),
  clear: (store) => run(store, "readwrite", (s) => s.clear()),
};

/** Test helper: forget the cached connection so a fresh fake database can be opened. */
export function _resetIdbForTests() {
  dbPromise = null;
}
