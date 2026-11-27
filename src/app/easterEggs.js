import { setItemSafe } from "./_ls.js";
import { icon } from "../lib/icons.js";

let easterEggsEnabled = false;
let easterEggTimer = null;
let easterEggHideTimer = null;
let activeEasterEgg = null;
let duckWalkFrame = null;
let duckJumpTimer = null;

export function loadEasterEggPreference() {
  try {
    easterEggsEnabled = localStorage.getItem("easterEggsEnabled") === "true";
  } catch {
    easterEggsEnabled = false;
  }
  return easterEggsEnabled;
}

export function toggleEasterEggs() {
  setEasterEggsEnabled(!easterEggsEnabled);
}

export function updateEasterEggToggle() {
  const logo = document.querySelector(".logo-img");
  if (!logo) return;
  logo.classList.toggle("easter-eggs-enabled", easterEggsEnabled);
  logo.setAttribute("aria-pressed", String(easterEggsEnabled));
  logo.title = `${easterEggsEnabled ? "Disable" : "Enable"} Easter eggs`;
}

export function scheduleEasterEgg() {
  if (!easterEggsEnabled) return;
  clearTimeout(easterEggTimer);
  const delay = 3000 + Math.random() * 370;
  easterEggTimer = setTimeout(showEasterEgg, delay);
}

function showEasterEgg() {
  easterEggTimer = null;
  if (!easterEggsEnabled) return;
  if (activeEasterEgg?.classList.contains("walking")) {
    scheduleEasterEgg();
    return;
  }

  const container = document.getElementById("container");
  const cards = Array.from(container.querySelectorAll(".card-container")).filter(
    (card) => card.isConnected && card.getClientRects().length > 0,
  );
  if (!cards.length) {
    scheduleEasterEgg();
    return;
  }

  removeActiveDuck();
  const card = cards[Math.floor(Math.random() * cards.length)];
  const duck = document.createElement("div");
  duck.className = "easter-egg-duck";
  duck.setAttribute("role", "button");
  duck.setAttribute("tabindex", "0");
  duck.setAttribute("aria-label", "Make the duck walk");
  duck.innerHTML = icon("duck", 40);
  duck.addEventListener("click", (event) => {
    event.stopPropagation();
    startDuckWalk(duck);
  });
  duck.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      startDuckWalk(duck);
    }
  });

  const cardRect = card.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  duck.style.right = `${cardRect.right - containerRect.left - Math.random() * 100 + container.scrollLeft}px`;
  duck.style.bottom = `${cardRect.bottom - containerRect.top - Math.random() * 100 + container.scrollTop}px`;
  container.appendChild(duck);
  activeEasterEgg = duck;
  requestAnimationFrame(() => duck.classList.add("visible"));

  easterEggHideTimer = setTimeout(() => {
    if (duck.classList.contains("walking")) return;
    duck.classList.remove("visible");
    setTimeout(() => {
      if (!duck.classList.contains("walking")) {
        duck.remove();
        if (activeEasterEgg === duck) activeEasterEgg = null;
      }
    }, 350);
  }, 5000);

  scheduleEasterEgg();
}

function startDuckWalk(duck) {
  if (!easterEggsEnabled || duck.classList.contains("walking")) return;
  clearTimeout(easterEggHideTimer);
  const bounds = duck.getBoundingClientRect();
  duck.classList.add("walking");
  duck.style.left = `${Math.max(0, Math.min(window.innerWidth - 48, bounds.left))}px`;
  duck.style.bottom = "0px";
  duck.style.right = "auto";
  duck.style.top = "auto";
  duck.style.setProperty("--duck-direction", "1");
  document.body.appendChild(duck);

  let direction = 1;
  let lastTime = 0;
  const walk = (time) => {
    if (!duck.isConnected || !duck.classList.contains("walking")) return;
    if (lastTime) {
      const elapsed = Math.min(time - lastTime, 50);
      let left = parseFloat(duck.style.left) + direction * elapsed * 0.08;
      if (left <= 0 || left >= window.innerWidth - 48) {
        direction *= -1;
        duck.style.setProperty("--duck-direction", String(direction * -1));
        left = Math.max(0, Math.min(window.innerWidth - 48, left));
      }
      duck.style.left = `${left}px`;
    }
    lastTime = time;
    duckWalkFrame = requestAnimationFrame(walk);
  };
  duckWalkFrame = requestAnimationFrame(walk);
  scheduleDuckJump(duck);
}

function scheduleDuckJump(duck) {
  clearTimeout(duckJumpTimer);
  if (!easterEggsEnabled || !duck.classList.contains("walking")) return;
  duckJumpTimer = setTimeout(() => {
    if (!easterEggsEnabled || !duck.classList.contains("walking")) return;
    duck.classList.remove("jumping");
    void duck.offsetWidth;
    duck.classList.add("jumping");
    setTimeout(() => duck.classList.remove("jumping"), 1000);
    scheduleDuckJump(duck);
  }, 2000 + Math.random() * 4000);
}

function removeActiveDuck({ poof = false } = {}) {
  const duck = activeEasterEgg;
  activeEasterEgg = null;
  cancelAnimationFrame(duckWalkFrame);
  duckWalkFrame = null;
  clearTimeout(duckJumpTimer);
  duckJumpTimer = null;
  if (!duck) return;
  if (poof) {
    const bounds = duck.getBoundingClientRect();
    duck.classList.remove("walking", "jumping", "visible");
    duck.style.position = "fixed";
    duck.style.left = `${bounds.left}px`;
    duck.style.top = `${bounds.top}px`;
    duck.style.right = "auto";
    duck.style.bottom = "auto";
    duck.style.opacity = "1";
    duck.style.transform = "none";
    document.body.appendChild(duck);
    duck.classList.add("duck-poof");
    setTimeout(() => duck.remove(), 700);
  } else {
    duck.remove();
  }
}

export function setEasterEggsEnabled(enabled) {
  easterEggsEnabled = enabled;
  setItemSafe("easterEggsEnabled", String(enabled));
  updateEasterEggToggle();

  clearTimeout(easterEggTimer);
  clearTimeout(easterEggHideTimer);
  removeActiveDuck({ poof: !enabled });

  if (enabled) scheduleEasterEgg();
}
