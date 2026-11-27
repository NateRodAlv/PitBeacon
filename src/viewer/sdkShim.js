// The viewer runs in a same-origin iframe of the app. This shim gives it the small
// slice of the card SDK it needs, backed by the same localStorage keys the card
// used when it was a catalog card, so existing setups carry over untouched.

const NAMESPACE = "pitbeaconCardStorage:robot-viewer-card:";
const LEGACY_NAMESPACE = "pitbeaconCardStorage:global:";

export const sdk = {
  storage: {
    get(key) {
      try {
        let raw = localStorage.getItem(NAMESPACE + key);
        if (raw === null) raw = localStorage.getItem(LEGACY_NAMESPACE + key);
        return raw === null ? null : JSON.parse(raw);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(NAMESPACE + key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },
  },
  getSetting: (_name, fallback) => fallback,
  notify(message, type = "message") {
    try {
      window.parent?.postMessage({ source: "pitbeacon-viewer", type: "notify", message, level: type }, location.origin);
    } catch {
      /* standalone page: nothing to notify */
    }
  },
};
