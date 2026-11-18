import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearApplicationData } from "../src/core/resetApplication.js";

const originalCaches = Object.getOwnPropertyDescriptor(globalThis, "caches");
const originalServiceWorker = Object.getOwnPropertyDescriptor(navigator, "serviceWorker");

describe("clearApplicationData", () => {
  let cacheStorage;
  let appRegistration;
  let otherRegistration;

  beforeEach(() => {
    localStorage.setItem("teamNumber", "7250");
    sessionStorage.setItem("temporary", "value");

    cacheStorage = {
      keys: vi.fn().mockResolvedValue(["workbox-precache", "runtime-cache"]),
      delete: vi.fn().mockResolvedValue(true),
    };
    Object.defineProperty(globalThis, "caches", { configurable: true, value: cacheStorage });

    appRegistration = {
      scope: new URL("./", location.href).href,
      unregister: vi.fn().mockResolvedValue(true),
    };
    otherRegistration = {
      scope: new URL("../other/", location.href).href,
      unregister: vi.fn().mockResolvedValue(true),
    };
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: { getRegistrations: vi.fn().mockResolvedValue([appRegistration, otherRegistration]) },
    });
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    if (originalCaches) Object.defineProperty(globalThis, "caches", originalCaches);
    else delete globalThis.caches;
    if (originalServiceWorker) Object.defineProperty(navigator, "serviceWorker", originalServiceWorker);
    else delete navigator.serviceWorker;
  });

  it("clears saved browser data and only unregisters the app's service worker", async () => {
    await clearApplicationData();

    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    expect(cacheStorage.delete).toHaveBeenCalledWith("workbox-precache");
    expect(cacheStorage.delete).toHaveBeenCalledWith("runtime-cache");
    expect(appRegistration.unregister).toHaveBeenCalledTimes(1);
    expect(otherRegistration.unregister).not.toHaveBeenCalled();
  });
});
