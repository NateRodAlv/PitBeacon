// Toast messages. Text is always inserted as text, never as HTML: card code
// (including approved community cards) can reach this through sdk.notify().

const DISPLAY_MS = 3000;

export function displayMessage(message, type = "message") {
  const container = document.getElementById("errorcontainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = type === "error" ? "error" : "message";

  const close = document.createElement("p");
  close.className = "error-exit";
  close.textContent = "X";

  const body = document.createElement("p");
  body.textContent = String(message ?? "");

  toast.append(close, body);
  container.appendChild(toast);
  setTimeout(() => toast.remove(), DISPLAY_MS);
}

export function installNotificationBridge() {
  // sdk.notify() and the layout renderer look these up on window.
  window.displayMessage = displayMessage;
}
