# PitBeacon

A pit display for FRC teams: match countdown and alerts, rankings, team stats,
Pit Notes (robot tasks, batteries, parts, check-ins), a built-in 3D robot
viewer, and community cards.

## Using it

Open the site once with a good connection. After that it loads from the
device's cache and keeps working without Wi-Fi. Settings → Offline shows what
is saved (app, last event data, robot model). The last data from The Blue
Alliance is kept for 14 days and shown with an "Offline" chip when the
connection drops.

Load your robot model in the **Robot Viewer** card (`.glb`, `.gltf` with its
files, or a `.urdf` with all referenced STL, OBJ, or DAE mesh files selected
together. For URDF exports, **Load URDF folder** can select the complete export
folder and preserve mesh paths; Draco and Meshopt compression work offline for
glTF). URDF joints
are imported as mate connectors: revolute and continuous joints rotate,
prismatic joints slide, and fixed joints are shown without a control. For
other models, add a connector to one individual part and choose its local
rotation or linear travel axis.

Pit Notes link to individual named parts in the model, not to connectors.
Tap a part in the viewer to open its notes, or use **locate** on a linked
Pit Notes task to focus it. Parts with open tasks get a coloured box in the
viewer (red flagged, yellow in progress, blue to do).

All card management (your cards, the community catalog, and the card editor)
lives behind the single **Cards** button.

## Development

```
npm ci
npm run dev        # local dev server
npm run lint
npm test
npm run build      # outputs dist/ (also builds the service worker)
npm run preview    # serve dist/ locally
```

- `index.html` + `src/main.js`: the app. `viewer.html` + `src/viewer/`: the 3D
  viewer, loaded by the Robot Viewer card in a same-origin iframe.
- `src/app/`: app modules (settings, profiles, layout editor, cards modal,
  polling, offline). `src/core/`, `src/data/`: logic with unit tests in `tests/`.
- `src/cards/builtin/`: built-in cards. Community cards run in a sandbox; see
  `pitbeacon-developer-editor-guide.md`.
- Pushes to `main` deploy to the site root and pushes to `test` deploy to
  `/test`, via `.github/workflows/preview.yaml`.
