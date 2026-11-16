export function setItemSafe(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}
