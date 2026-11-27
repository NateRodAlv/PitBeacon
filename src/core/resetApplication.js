import { VIEWER_DB_NAME } from "../data/robotModel.js";
import { DB_NAME } from "./idb.js";

const DATABASE_NAMES = [DB_NAME, VIEWER_DB_NAME];

function errorText(error) {
  return error instanceof Error ? error.message : String(error);
}

function deleteDatabase(name) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error || new Error(`Could not delete "${name}".`));
    request.onblocked = () => reject(new Error(`Database "${name}" is still open in another tab.`));
  });
}

export async function clearApplicationData() {
  const errors = [];

  for (const [label, storage] of [
    ["Local storage", globalThis.localStorage],
    ["Session storage", globalThis.sessionStorage],
  ]) {
    try {
      storage.clear();
    } catch (error) {
      errors.push(`${label}: ${errorText(error)}`);
    }
  }

  const cacheStorage = globalThis.caches;
  if (cacheStorage) {
    try {
      const cacheNames = await cacheStorage.keys();
      const results = await Promise.allSettled(cacheNames.map((name) => cacheStorage.delete(name)));
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          errors.push(`Cache "${cacheNames[index]}": ${errorText(result.reason)}`);
        }
      });
    } catch (error) {
      errors.push(`Cache storage: ${errorText(error)}`);
    }
  }

  if (globalThis.indexedDB) {
    const results = await Promise.allSettled(DATABASE_NAMES.map(deleteDatabase));
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        errors.push(`IndexedDB "${DATABASE_NAMES[index]}": ${errorText(result.reason)}`);
      }
    });
  }

  const serviceWorker = globalThis.navigator?.serviceWorker;
  if (serviceWorker) {
    try {
      const appBaseUrl = new URL("./", globalThis.location.href).href;
      const registrations = await serviceWorker.getRegistrations();
      const appRegistrations = registrations.filter((registration) => registration.scope === appBaseUrl);
      const results = await Promise.allSettled(appRegistrations.map((registration) => registration.unregister()));
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          errors.push(`Service worker "${appRegistrations[index].scope}": ${errorText(result.reason)}`);
        }
      });
    } catch (error) {
      errors.push(`Service workers: ${errorText(error)}`);
    }
  }

  if (errors.length) throw new Error(errors.join(" "));
}
