import "fake-indexeddb/auto";

if (typeof window.matchMedia !== "function") {
  window.matchMedia = (media) => ({
    matches: false,
    media,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  });
}
