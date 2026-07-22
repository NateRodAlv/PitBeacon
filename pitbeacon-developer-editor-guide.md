# PitBeacon Developer Card Editor — Guide

This document covers the raw code editor for building custom PitBeacon
cards: what the editor gives you, how the SDK works, and a full starter
template you can copy, rename, and adapt.

---

## 1. What the Developer Editor Is

The Developer Card Editor lets you write a card as three plain files —
**HTML**, **CSS**, and **JavaScript** — that get bundled together and run
inside a sandboxed `<iframe>` on your pit display. This is the "I want full
control" path, as opposed to picking a pre-built template and only changing
a few marked values (see Section 5 for a template you can start from
either way).

A card you save here is stored locally in your browser and immediately
available on your pit display. It is **not** uploaded anywhere — there is
no server involved, since PitBeacon is a static site. If you want to share
cards, just export them as a json file.

### Opening the editor

- **Create New Card** — starts you from a blank/default example.
- **Edit an existing card** — pick any previously-saved card from the list
  to load its HTML/CSS/JS back into the editor.

### Editor features

The HTML, CSS, and JS panels are full code editors, not plain text boxes:

- **Syntax highlighting** for each language (when your connection allows
  loading the highlighting library — see "Offline behavior" below).
- **Tab / Shift+Tab** — indent or dedent the current line, or every line in
  a selection.
- **Auto-indent on Enter** — matches the indentation of the line above, and
  adds an extra level after an opening `{`, `[`, or `(`.
- **Auto-closing pairs** — typing `(`, `[`, `{`, `"`, or `'` automatically
  inserts its matching closer; typing the closer yourself just skips over
  the auto-inserted one instead of duplicating it.
- **Smart backspace** — deleting inside an empty pair (e.g. `()`) removes
  both characters at once.
- **`Cmd/Ctrl + S`** — saves the card without needing to click the Save
  button.
- **`Cmd/Ctrl + Enter`** — refreshes the live preview.

**Offline behavior:** the editor tries to load a syntax-highlighting
library from a CDN. If your connection can't reach it (e.g. no wifi at a
venue), the editor automatically falls back to a plain but still fully
functional mode — you keep all the keyboard behaviors above, just without
color-coding. Nothing breaks either way.

### Live Preview

The Preview panel renders your card using **mock data** — a fake match, a
fake team number, and `fetchCustom` calls that don't hit the real network
(so you can safely test a card's logic without spamming your actual
endpoint while you're still writing it). Use the real pit display to see a
card against live data.

### Saving

Every card needs a unique **Card ID** (used internally) and a **Label**
(what you'll see when picking it later). Saved cards persist in your
browser and reappear next time you open the editor.

---

## 2. The SDK: What Your Card Can Do

Inside your card's JavaScript, `window.__pitbeaconSDK` (usually aliased to
a local `sdk` variable) gives you access to match state, data sources, and
a handful of utilities. Everything below is available from card code.

> **Async note:** Several of these return a `Promise` and need `await` (or
> `.then()`) — marked below. `getState()` and `onStateChange()` are the
> only synchronous ones.

### State

```js
sdk.getState()
```
Returns the current match/event state object synchronously. Useful inside
a click handler or timer where you need a snapshot *right now*, rather
than subscribing separately.

```js
sdk.onStateChange(callback)
```
Subscribes to state changes. Calls `callback(state)` immediately with the
current state, then again every time it updates. Returns an unsubscribe
function.

### Built-in data sources

```js
await sdk.fetchDataSource(name)
```
Fetches one of PitBeacon's built-in data sources. Resolves with the data,
or rejects on failure — wrap in `try/catch` if you use this directly. Valid data sources as of now are 'teamNumber', 'matchAlarmSound', 'noteAlarmSound', and 'eventName'.

### Custom endpoints — `fetchCustom`

This is how you pull data from **your own** infrastructure — a Google
Sheet, a scouting server, anything with a URL.

```js
const result = await sdk.fetchCustom(url, options);
```

**Unlike `fetchDataSource`, this never throws.** It always resolves to:

```js
{ ok: boolean, data: any, error: string | null, status: number | null }
```

Always check `result.ok` before using `result.data`. This matters a lot on
flaky venue wifi — your card can show "last known data" or a friendly
error instead of silently breaking.

**`options`** (all optional):

| Option | Default | Meaning |
|---|---|---|
| `method` | `'GET'` | HTTP method |
| `headers` | `{}` | Request headers, e.g. an API key |
| `body` | `null` | Request body (ignored for GET/HEAD) |
| `timeoutMs` | `8000` | Give up after this long, reported as an error rather than hanging forever |
| `cacheSeconds` | `0` | Reuse a completed result for this many seconds — good for endpoints multiple cards or repeated renders all hit |
| `parse` | `JSON.parse` | A function `(rawText) => yourData` for handling non-JSON responses (CSV, Google's `gviz` format, etc.) |

**Important limitation on `parse`:** it can only see the raw text you give
it — it **cannot** reference other variables from elsewhere in your card
script. Everything it needs must come from the `rawText` argument itself.
This is fine for the common case (reshaping/unwrapping a response), but
keep it in mind if a parse function you write "mysteriously" can't see a
variable you expected it to.

**Example:**

```js
const result = await sdk.fetchCustom('https://example.com/api/data', {
  headers: { 'Authorization': 'Bearer ' + API_KEY },
  cacheSeconds: 15,
  parse: (text) => JSON.parse(text).rows,
});

if (result.ok) {
  console.log(result.data);
} else {
  console.warn('Fetch failed:', result.error);
}
```

**A note on API keys:** any key you put in a card's headers lives in that
card's saved code, visible to anyone with devtools open on that browser —
which is normal for a client-side app. The one thing to genuinely watch
for: **if you export or share a card** (e.g. posting it as a template on
ChiefDelphi), double-check it doesn't still contain your personal API key
before sharing it publicly.

If your API key is rejected even though it looks correct, check whether
it's **referrer-restricted** to a specific domain — you may need to add
PitBeacon's URL to that key's allowlist in whatever service issued it.

### Alarms

```js
sdk.triggerAlarm(nameOrPreset)
```
Plays a sound. Pass either:
- a **preset** — `'match'` or `'note'` — which plays whatever sound is
  configured for that event, or
- a **literal sound name** — e.g. `'chime'` — to play a specific sound
  directly.

Sounds are a fixed set shipped with PitBeacon (no custom uploads, since
this is a static site) — see `getAlarmSounds()` for the full list.

```js
await sdk.getAlarmSounds()
```
Returns the list of valid sound names, e.g. `['alarm1', 'alarm2', 'chime', 'buzzer']`.

### Notifications

```js
sdk.notify(message, type)
```
Shows a visual toast/message — no sound. `type` defaults to `'message'`.
Distinct from `triggerAlarm`: call both if you want a sound *and* a
message for the same event.

### Per-card storage

```js
await sdk.storage.get(key)
await sdk.storage.set(key, value)
await sdk.storage.delete(key)
```
Simple persistent key/value storage, automatically scoped to your card —
two different cards' `myKey` won't collide. Useful for anything your card
needs to remember between reloads, e.g. "which matches has this scout
already submitted."

### Config

```js
await sdk.getConfig()
```
Returns a small set of app-level settings your card can read, e.g.
`{ teamNumber, matchAlarmSound, noteAlarmSound }`. Use this instead of a
dedicated "get team number" call — e.g. `(await sdk.getConfig()).teamNumber`.

### Custom refresh — `updateCard`

**The default behavior:** PitBeacon polls for fresh match/event data on a
rolling 30–60 second cadence (a random delay in that range, so cards
across different displays don't all hit the network at once). Every time
that poll completes, your card gets a fresh `stateUpdate` — which is what
fires your `onStateChange` callbacks.

That default is fine for most cards. Reach for `updateCard` when you want
something different — a faster local countdown, a slower check to avoid
re-rendering something expensive, or a check that should only react to one
specific slice of state instead of *any* state change:

```js
sdk.updateCard(interval, refreshCallback, compareFn)
```

| Param | Required | Meaning |
|---|---|---|
| `interval` | Yes | Milliseconds between checks. Silently does nothing if this isn't a positive number. |
| `refreshCallback` | No | `function(state, sdk)`, called only when `compareFn`'s output has actually changed since the last check. |
| `compareFn` | No | `function(state, sdk)`, returns whatever snapshot of state you actually care about. Defaults to the entire state object if you leave it out. |

**Calling this opts your card out of the default refresh entirely.**
From that point on, nothing re-checks your card until your own `interval`
timer fires — the regular 30–60 second poll cycle skips it completely.
If you never call `updateCard`, your card just keeps getting the default
treatment described above; you don't need to do anything to get that.

A couple of things that are specific to the Developer Editor (as opposed
to PitBeacon's built-in cards):

- **The callback only gets `(state, sdk)`**, not an element reference.
  Built-in cards get passed the outer container element because their
  code lives outside it; your card's HTML *is* the entire iframe body, so
  you just query it directly (`document.getElementById(...)`, etc.) — no
  element to pass in.
- **It's safe to call once, directly in your top-level script.** Your
  card's JS runs fresh exactly once per load (unlike a `render()` function
  that re-runs on every tick), so there's no need to guard it with an
  "only set this up once" flag — just call `sdk.updateCard(...)` near the
  top of your script and let it run.

**Why bother with `compareFn`:** without one, `updateCard` diffs the
*entire* state object on every check — which includes things like the
live clock, so it looks "changed" on basically every tick regardless of
whether anything your card actually displays moved. A `compareFn` scopes
the diff down to just the fields you care about, so `refreshCallback`
only fires when something relevant actually changed:

```js
sdk.updateCard(
  1000,
  (state, sdk) => {
    // Your custom render/update logic goes here.
    renderMyCard(state, sdk);
  },
  (state) => ({
    // Only this field is compared — anything else changing elsewhere in
    // app state (e.g. the live clock) won't cause a false "changed" match.
    matches: state.currentMatches,
  }),
);
```

(`compareFn` only receives `state` — anything else your card needs, like
config values, should be read inside `refreshCallback` via `sdk`, or
captured from an earlier `await sdk.getConfig()` call, since `getConfig`
itself is async and can't be called synchronously inside `compareFn`.)

---

## 3. Configuring a Card for Your Own System

Cards that call `fetchCustom` almost always need something specific to
*you* — a URL, a sheet ID, an API key. The convention in PitBeacon
templates is to put these as clearly-marked variables at the **top** of
the JavaScript panel:

```js
// ┌─ CONFIGURE THIS ──────────────────────────────────────────
// Paste your own values below. Don't share this card publicly
// if API_KEY is filled in — see the SDK guide for why.
const SHEET_ID  = "PASTE_YOUR_SHEET_ID_HERE";
const SHEET_TAB = "Matches";
const API_KEY   = "";  // leave blank if your endpoint doesn't need one
// └────────────────────────────────────────────────────────────
```

Nothing elsewhere in the file should need to change — everything else
just uses these constants.

---

## 4. Copying Code Out

The **Code** tab shows the fully generated HTML, CSS, and JS for the
current card, and a **Copy** button puts all three in your clipboard
together — handy for sharing a card with a teammate or posting it as a
template for others.

You can also download the card as a json file to share.

---

## 5. Starter Template: Team Info from a Google Sheet

This template reads a row from a published Google Sheet (no server to
deploy — just "Publish to web" your sheet) and displays it as a simple
card. It uses Google's `gviz` endpoint, which returns a JSON-like response
wrapped in a bit of extra text — the `parse` function below strips that
wrapper for you, so you don't need to understand the format, just paste
your sheet's ID and tab name.

### How to get your Sheet ID and set sharing

1. Open your Google Sheet.
2. Click **Share** → set to **"Anyone with the link" → Viewer**.
3. Your Sheet ID is the long string in the URL, between `/d/` and
   `/edit`:
   `https://docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit`
4. Note the exact name of the tab (bottom of the sheet) you want to read.

### HTML

```html
<div class="team-info-card">
  <h2 id="teamName">Loading...</h2>
  <div class="team-info-row">
    <span class="team-info-label">Team #</span>
    <span id="teamNumber">—</span>
  </div>
  <div class="team-info-row">
    <span class="team-info-label">Notes</span>
    <span id="teamNotes">—</span>
  </div>
  <div id="statusMsg" class="status-msg"></div>
</div>
```

### CSS

```css
.team-info-card {
  padding: 16px;
  font-family: 'Rubik', sans-serif;
}
.team-info-card h2 {
  margin: 0 0 12px 0;
  color: var(--text-primary);
}
.team-info-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
  color: var(--text-primary);
}
.team-info-label {
  color: var(--text-muted);
}
.status-msg {
  margin-top: 12px;
  font-size: 0.8rem;
  color: var(--text-dim);
  font-style: italic;
}
```

### JavaScript

```js
const sdk = window.__pitbeaconSDK;

// ┌─ CONFIGURE THIS ──────────────────────────────────────────
// Paste your own Google Sheet's ID and tab name below.
const SHEET_ID  = "PASTE_YOUR_SHEET_ID_HERE";
const SHEET_TAB = "TeamInfo";
// └────────────────────────────────────────────────────────────

const url =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq` +
  `?tqx=out:json&sheet=${encodeURIComponent(SHEET_TAB)}`;

// gviz wraps its JSON in `google.visualization.Query.setResponse(...)` —
// this strips that wrapper so the rest of the card can treat it as plain
// JSON. Expects the sheet's first row of data to have: name, team number,
// notes (columns A, B, C) — adjust the row[...] indexes below if your
// sheet's columns are in a different order.
function parseGvizResponse(rawText) {
  const jsonText = rawText
    .replace(/^[\s\S]*?setResponse\(/, "")
    .replace(/\);\s*$/, "");
  const parsed = JSON.parse(jsonText);
  const row = parsed.table.rows[0].c;
  return {
    name: row[0]?.v ?? "Unknown",
    teamNumber: row[1]?.v ?? "—",
    notes: row[2]?.v ?? "",
  };
}

async function loadTeamInfo() {
  const statusEl = document.getElementById("statusMsg");
  const result = await sdk.fetchCustom(url, {
    cacheSeconds: 30, // avoid re-hitting the sheet too often
    parse: parseGvizResponse,
  });

  if (result.ok) {
    document.getElementById("teamName").textContent = result.data.name;
    document.getElementById("teamNumber").textContent = result.data.teamNumber;
    document.getElementById("teamNotes").textContent = result.data.notes;
    statusEl.textContent = "";
  } else {
    statusEl.textContent = "Couldn't load sheet data: " + result.error;
  }
}

loadTeamInfo();

// Optional: refresh every 30s in case the sheet changes during the event.
setInterval(loadTeamInfo, 30000);
```

### What to customize

- `SHEET_ID` and `SHEET_TAB` at the top — required.
- The three `row[...]` indexes in `parseGvizResponse` if your sheet's
  columns aren't in name / team number / notes order.
- The refresh interval (`30000` ms) if you want the card to poll more or
  less often.

Everything else — the fetch, caching, error handling, and DOM updates —
works as-is.
