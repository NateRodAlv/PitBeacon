// One-time layout changes when cards are renamed or merged.

export const OLD_NOTE_CARD_IDS = ["robot-health-card", "battery-card", "parts-card", "checkin-card"];
export const PIT_NOTES_ID = "pit-notes-card";

/**
 * Replace the four old note cards in a layout with one Pit Notes card, placed
 * where the Robot Health card was (else the first old note card found).
 * Also renames the old statbotics card.
 * Mutates and returns the layout.
 */
export function migrateLayout(layout) {
  if (!layout || typeof layout !== "object") return layout;

  if (Object.hasOwn(layout, "statbotics-card")) {
    if (!Object.hasOwn(layout, "stats-card")) layout["stats-card"] = layout["statbotics-card"];
    delete layout["statbotics-card"];
  }

  const present = OLD_NOTE_CARD_IDS.filter((id) => Object.hasOwn(layout, id));
  if (present.length) {
    if (!Object.hasOwn(layout, PIT_NOTES_ID)) layout[PIT_NOTES_ID] = layout[present[0]];
    present.forEach((id) => delete layout[id]);
  }
  return layout;
}

/** Same for a list of hidden card ids. Pit Notes is hidden only if all of its old cards were. */
export function migrateHiddenList(hidden) {
  if (!Array.isArray(hidden)) return hidden;
  const renamed = hidden.map((id) => (id === "statbotics-card" ? "stats-card" : id));
  const oldHidden = renamed.filter((id) => OLD_NOTE_CARD_IDS.includes(id));
  const rest = renamed.filter((id) => !OLD_NOTE_CARD_IDS.includes(id));
  if (oldHidden.length === OLD_NOTE_CARD_IDS.length && !rest.includes(PIT_NOTES_ID)) {
    rest.push(PIT_NOTES_ID);
  }
  return rest;
}
