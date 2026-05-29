import { config } from "./config.js";
const year = new Date().getFullYear();
let fullDate = new Date(); // Will be updated with test date if enabled

// Audio files for different sounds
const audioFiles = {
  alarm1: new Audio("alarm1.mp3"),
  alarm2: new Audio("alarm2.mp3"),
  alarm3: new Audio("alarm3.mp3"),
  beep: new Audio("beep.mp3"),
};

// Set error handling for audio files that don't exist
Object.values(audioFiles).forEach((audio) => {
  audio.onerror = () => console.warn("Audio file failed to load");
});

// Track which match we've alerted for
let lastMatchAlertId = null;

// Cache for ETags to minimize API requests
const etagCache = {
  events: null,
  matches: {},
};

let pollingInterval = null;
let timeUpdateInterval = null;
let currentMatches = null;
let currentEventData = null;
let currentRankings = null;
// Load settings from local storage on page load
function loadSettings() {
  const savedTeamNumber = localStorage.getItem("teamNumber");
  const savedApiKey = localStorage.getItem("tbaapikey");
  const savedTestMode = localStorage.getItem("testMode") === "true";
  const savedTestDate = localStorage.getItem("testDate");
  const savedTheme = localStorage.getItem("theme") || "dark";
  const savedNoteAlarmToggle =
    localStorage.getItem("noteAlarmToggle") === "true";
  const savedNoteAlarmThreshold =
    localStorage.getItem("noteAlarmThreshold") || 8;
  const savedNoteAlarmSound =
    localStorage.getItem("noteAlarmSound") || "alarm1";
  const savedMatchAlarmToggle =
    localStorage.getItem("matchAlarmToggle") !== "false";
  const savedMatchAlertThreshold =
    localStorage.getItem("matchAlertThreshold") || 300;
  const savedMatchAlarmSound =
    localStorage.getItem("matchAlarmSound") || "alarm1";
  const savedGridSize = localStorage.getItem("gridSize") || 3;
  const savedLayout = localStorage.getItem("layout");

  if (savedTeamNumber) {
    config.teamNumber = savedTeamNumber;
    document.getElementById("teamNumber").value = savedTeamNumber;
  }
  if (savedApiKey) {
    config.tbaapikey = savedApiKey;
    document.getElementById("tbaapikey").value = savedApiKey;
  }

  // Apply theme
  config.theme = savedTheme;
  document.documentElement.setAttribute("data-theme", savedTheme);
  document.getElementById("themeSelect").value = savedTheme;

  // Load note alarm settings
  config.noteAlarmToggle = savedNoteAlarmToggle;
  config.noteAlarmThreshold = parseInt(savedNoteAlarmThreshold);
  config.noteAlarmSound = savedNoteAlarmSound;
  document.getElementById("noteAlarmToggle").checked = savedNoteAlarmToggle;
  document.getElementById("noteAlarmThreshold").value = savedNoteAlarmThreshold;
  document.getElementById("noteAlarmSound").value = savedNoteAlarmSound;

  // Load match alarm settings
  config.matchAlarmToggle = savedMatchAlarmToggle;
  config.matchAlertThreshold = parseInt(savedMatchAlertThreshold);
  config.matchAlarmSound = savedMatchAlarmSound;
  document.getElementById("matchAlarmToggle").checked = savedMatchAlarmToggle;
  document.getElementById("matchAlertThreshold").value =
    savedMatchAlertThreshold;
  document.getElementById("matchAlarmSound").value = savedMatchAlarmSound;

  // Load layout settings
  config.gridSize = parseInt(savedGridSize);
  if (savedLayout) {
    try {
      config.layout = JSON.parse(savedLayout);
    } catch (err) {
      console.warn("Failed to parse layout:", err);
    }
  }

  // Load test mode settings
  const testModeCheckbox = document.getElementById("testMode");
  const testDateInput = document.getElementById("testDate");
  testModeCheckbox.checked = savedTestMode;
  if (savedTestDate) {
    testDateInput.value = savedTestDate;
  }
  testDateInput.style.display = savedTestMode ? "block" : "none";

  // Update fullDate if test mode is enabled
  if (savedTestMode && savedTestDate) {
    // Combine test date with current time
    const testDateObj = new Date(savedTestDate);
    const now = new Date();
    fullDate = new Date(
      testDateObj.getFullYear(),
      testDateObj.getMonth(),
      testDateObj.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
    );
  }

  document.getElementById("settingscontainer").style.display = "flex";
}

async function getData() {
  let inactiveCount = 0;
  try {
    const headers = {
      "X-TBA-Auth-Key": config.tbaapikey,
    };

    // Add If-None-Match header if we have a cached ETag for events
    if (etagCache.events) {
      headers["If-None-Match"] = etagCache.events;
    }

    const response = await fetch(
      `https://www.thebluealliance.com/api/v3/team/frc${config.teamNumber}/events/${year}`,
      { headers },
    );

    // Handle 304 Not Modified - data hasn't changed
    if (response.status === 304) {
      console.log("Events data not modified (304), using cache");
      return;
    }

    // Store the ETag for future requests
    const etag = response.headers.get("ETag");
    if (etag) {
      etagCache.events = etag;
    }

    if (!response.ok) {
      displayMessage(
        `API Error: ${response.status} ${response.statusText}`,
        "error",
      );
      return;
    }
    const data = await response.json();
    if (data.error) {
      displayMessage(`API Error: ${data.error}`, "error");
      return;
    }
    displayMessage("Data retrieved successfully!", "message");
    console.log("Data:", data);
    console.log("Checking date:", fullDate);
    for (let i = 0; i < data.length; i++) {
      console.log(`Event ${i}:`, data[i]);
      if (!data[i].start_date || !data[i].end_date) {
        console.log(`Skipping event ${i} - missing date fields`);
        continue;
      }
      const [startYear, startMonth, startDay] = data[i].start_date.split("-");
      const [endYear, endMonth, endDay] = data[i].end_date.split("-");
      const eventStart = new Date(startYear, startMonth - 1, startDay);
      const eventEnd = new Date(endYear, endMonth - 1, endDay);
      console.log(`Event dates: ${eventStart} to ${eventEnd}`);
      console.log(
        `Date is between: ${fullDate > eventStart} && ${fullDate < eventEnd}`,
      );

      if (fullDate >= eventStart && fullDate <= eventEnd) {
        const matchesUrl = `https://www.thebluealliance.com/api/v3/team/frc${config.teamNumber}/event/${data[i].key}/matches/simple`;
        const matchesHeaders = {
          "X-TBA-Auth-Key": config.tbaapikey,
        };

        // Add If-None-Match header if we have a cached ETag for this event's matches
        if (etagCache.matches[data[i].key]) {
          matchesHeaders["If-None-Match"] = etagCache.matches[data[i].key];
        }

        const matchesResponse = await fetch(matchesUrl, {
          headers: matchesHeaders,
        });

        // Handle 304 Not Modified - matches haven't changed
        if (matchesResponse.status === 304) {
          console.log(
            "Matches data not modified (304) for event " + data[i].key,
          );
          return;
        }

        // Store the ETag for future requests
        const matchesEtag = matchesResponse.headers.get("ETag");
        if (matchesEtag) {
          etagCache.matches[data[i].key] = matchesEtag;
        }

        if (!matchesResponse.ok) {
          displayMessage(
            `API Error: ${matchesResponse.status} ${matchesResponse.statusText}`,
            "error",
          );
          return;
        }
        const matches = await matchesResponse.json();
        const rankingsResponse = await fetch(
          `https://www.thebluealliance.com/api/v3/event/${data[i].key}/rankings`,
          { headers: { "X-TBA-Auth-Key": config.tbaapikey } },
        );
        if (rankingsResponse.ok) {
          const rankingsData = await rankingsResponse.json();
          currentRankings = rankingsData?.rankings ?? null;
        }

        currentMatches = matches;
        currentEventData = data[i];
        updateMatchDisplay();
        break; // Only show first active event
      } else {
        inactiveCount++;
        console.log(`Event ${data[i].name} is not active today.`, "message");
      }
      if (inactiveCount === data.length - 1) {
        currentMatches = null;
        currentEventData = null;
        updateMatchDisplay();
        displayMessage("No active events today.", "message");
        container.innerHTML = `<p class="inactive">No active events today, please try test mode and set the date to a prior event, or make sure the correct team number is selected.</p>`;
      }
    }
  } catch (error) {
    displayMessage(`Network Error: ${error.message}`, "error");
  }
}
function displayMessage(message, type) {
  const errorContainer = document.getElementById("errorcontainer");
  errorContainer.innerHTML = `${errorContainer.innerHTML}<div class="${type}"><p class="error-exit">X</p><p>${message}</p></div>`;
}
function updateLeaderboardDisplay() {
  const leaderboardSection = document.getElementById("leaderboard-section");
  if (!leaderboardSection) return;
  leaderboardSection.innerHTML = "";

  if (!currentRankings || currentRankings.length === 0) {
    leaderboardSection.innerHTML = "<p>No rankings available yet.</p>";
    return;
  }

  const table = document.createElement("table");
  table.className = "leaderboard-table";
  table.innerHTML = `
    <thead>
      <tr>
        <th>Rank</th>
        <th>Team</th>
        <th>W-L-T</th>
      </tr>
    </thead>
  `;
  const tbody = document.createElement("tbody");

  for (const entry of currentRankings) {
    const row = document.createElement("tr");
    const teamNumber = entry.team_key.replace("frc", "");
    // Highlight your team's row
    if (teamNumber === String(config.teamNumber)) {
      row.className = "my-team";
    }
    row.innerHTML = `
      <td>${entry.rank}</td>
      <td>${teamNumber}</td>
      <td>${entry.record.wins}-${entry.record.losses}-${entry.record.ties}</td>
    `;
    tbody.appendChild(row);
  }

  table.appendChild(tbody);
  leaderboardSection.appendChild(table);
}
function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem("pitNotes") || "[]");
  } catch {
    return [];
  }
}

function saveNotes(notes) {
  localStorage.setItem("pitNotes", JSON.stringify(notes));
}

function priorityColor(p) {
  // hue goes from 120 (green) at 1 down to 0 (red) at 10
  const hue = 120 - ((p - 1) / 9) * 120;
  return `hsl(${hue}, 80%, 45%)`;
}

function setupNotesSection(section) {
  section.innerHTML = `
    <div class="notes-header">
      <span class="notes-title">Pit Notes</span>
      <button class="add-note-btn" id="add-note-btn">＋ Add Issue</button>
    </div>
    <table class="notes-table" id="notes-table">
      <thead>
        <tr>
          <th>Issue</th>
          <th>Location</th>
          <th>Priority</th>
          <th></th>
        </tr>
      </thead>
      <tbody id="notes-tbody"></tbody>
    </table>
  `;

  const tbody = section.querySelector("#notes-tbody");

  const notes = loadNotes();
  notes.sort((a, b) => b.priority - a.priority); // highest priority first
  notes.forEach((note, index) => addNoteRow(tbody, note, index));

  section.querySelector("#add-note-btn").addEventListener("click", () => {
    const notes = loadNotes();
    const newNote = { issue: "", location: "", priority: 5 };
    notes.push(newNote);
    saveNotes(notes);
    addNoteRow(tbody, newNote, notes.length - 1);
  });
}

function addNoteRow(tbody, note, index) {
  const row = document.createElement("tr");
  row.className = "note-row";
  row.dataset.index = index;

  row.innerHTML = `
    <td><textarea class="note-input note-issue" placeholder="Describe issue…" rows="1">${note.issue}</textarea></td>
    <td><textarea class="note-input note-location" placeholder="e.g. intake, drive" rows="1">${note.location}</textarea></td>
    <td class="priority-cell">
      <span class="priority-badge" contenteditable="true" 
        style="background:${priorityColor(note.priority)}">${note.priority}</span>
    </td>
    <td><button class="delete-note-btn">✕</button></td>
  `;

  // Auto-resize helper
  const autoResize = (el) => {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  const issueEl = row.querySelector(".note-issue");
  const locationEl = row.querySelector(".note-location");
  const badge = row.querySelector(".priority-badge");

  // Trigger initial resize
  setTimeout(() => {
    autoResize(issueEl);
    autoResize(locationEl);
  }, 0);

  issueEl.addEventListener("input", (e) => {
    autoResize(e.target);
    const notes = loadNotes();
    notes[index].issue = e.target.value;
    saveNotes(notes);
  });

  locationEl.addEventListener("input", (e) => {
    autoResize(e.target);
    const notes = loadNotes();
    notes[index].location = e.target.value;
    saveNotes(notes);
  });

  // Only allow digits in the badge
  badge.addEventListener("keypress", (e) => {
    if (!/[0-9]/.test(e.key)) e.preventDefault();
  });

  badge.addEventListener("input", () => {
    const p = Math.min(10, Math.max(1, parseInt(badge.textContent) || 1));
    badge.style.background = priorityColor(p);
    const notes = loadNotes();
    notes[index].priority = p;
    saveNotes(notes);
  });

  // Clamp and clean up display on blur
  badge.addEventListener("blur", () => {
    const p = Math.min(10, Math.max(1, parseInt(badge.textContent) || 1));
    badge.textContent = p;
    badge.style.background = priorityColor(p);
    const notes = loadNotes();
    notes[index].priority = p;
    saveNotes(notes);
    // re-sort display
    tbody.innerHTML = "";
    notes.sort((a, b) => b.priority - a.priority);
    notes.forEach((n, i) => addNoteRow(tbody, n, i));
  });

  row.querySelector(".delete-note-btn").addEventListener("click", () => {
    const notes = loadNotes();
    notes.splice(index, 1);
    saveNotes(notes);
    tbody.innerHTML = "";
    notes.sort((a, b) => b.priority - a.priority); // keep sorted after delete
    notes.forEach((n, i) => addNoteRow(tbody, n, i));
  });

  tbody.appendChild(row);
}
function displayWebcasts(webcasts, container, currentDate) {
  if (!webcasts || webcasts.length === 0) {
    return;
  }

  // For events, show webcasts if the event is currently active
  // Webcasts without dates are shown for all active events
  for (const webcast of webcasts) {
    // Skip webcasts that have a specific date that doesn't match today
    if (webcast.date) {
      const webcastDate = new Date(webcast.date);
      const today = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
      );
      if (webcastDate.getDate() !== today.getDate()) {
        console.log(`Skipping webcast for ${webcastDate}, today is ${today}`);
        continue;
      }
    }

    let webcastUrl = "";
    if (webcast.type === "youtube") {
      webcastUrl = `https://www.youtube.com/embed/${webcast.channel}`;
    } else if (webcast.type === "twitch") {
      webcastUrl = `https://player.twitch.tv/?channel=${webcast.channel}&parent=${window.location.hostname}`;
    }

    if (webcastUrl) {
      const webcastCard = document.createElement("div");
      webcastCard.className = "webcast-card";
      const iframe = document.createElement("iframe");
      iframe.src = webcastUrl;
      iframe.width = "100%";
      iframe.height = "225";
      iframe.frameborder = "0";
      iframe.allowfullscreen = true;
      webcastCard.appendChild(iframe);
      container.appendChild(webcastCard);
    }
  }
}
function setupListeners() {
  const errorContainer = document.getElementById("errorcontainer");
  const settings = document.getElementById("settings");
  const settingscontainer = document.getElementById("settingscontainer");
  const savebutton = document.getElementById("savebutton");
  const testModeCheckbox = document.getElementById("testMode");
  const testDateInput = document.getElementById("testDate");

  // Toggle test date input visibility
  testModeCheckbox.addEventListener("change", () => {
    testDateInput.style.display = testModeCheckbox.checked ? "block" : "none";
  });

  savebutton.addEventListener("click", () => {
    config.teamNumber = document.getElementById("teamNumber").value;
    config.tbaapikey = document.getElementById("tbaapikey").value;
    config.theme = document.getElementById("themeSelect").value;
    config.noteAlarmToggle = document.getElementById("noteAlarmToggle").checked;
    config.noteAlarmThreshold =
      parseInt(document.getElementById("noteAlarmThreshold").value) || 8;
    config.noteAlarmSound = document.getElementById("noteAlarmSound").value;
    config.matchAlarmToggle =
      document.getElementById("matchAlarmToggle").checked;
    config.matchAlertThreshold =
      parseInt(document.getElementById("matchAlertThreshold").value) || 300;
    config.matchAlarmSound = document.getElementById("matchAlarmSound").value;

    // Save to localStorage
    localStorage.setItem("teamNumber", config.teamNumber);
    localStorage.setItem("tbaapikey", config.tbaapikey);
    localStorage.setItem("theme", config.theme);
    localStorage.setItem("noteAlarmToggle", config.noteAlarmToggle);
    localStorage.setItem("noteAlarmThreshold", config.noteAlarmThreshold);
    localStorage.setItem("noteAlarmSound", config.noteAlarmSound);
    localStorage.setItem("matchAlarmToggle", config.matchAlarmToggle);
    localStorage.setItem("matchAlertThreshold", config.matchAlertThreshold);
    localStorage.setItem("matchAlarmSound", config.matchAlarmSound);

    // Apply theme immediately
    document.documentElement.setAttribute("data-theme", config.theme);
    applyLayout();

    // Save test mode settings
    const isTestMode = testModeCheckbox.checked;
    localStorage.setItem("testMode", isTestMode);
    if (isTestMode) {
      localStorage.setItem("testDate", testDateInput.value);
      // Combine test date with current time
      const testDateObj = new Date(testDateInput.value);
      const now = new Date();
      fullDate = new Date(
        testDateObj.getFullYear(),
        testDateObj.getMonth(),
        testDateObj.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
      );
    } else {
      localStorage.removeItem("testDate");
      fullDate = new Date();
    }

    displayMessage("Settings saved successfully!", "message");
    settingscontainer.style.display = "none";
    // Clear ETag cache when settings change
    etagCache.events = null;
    etagCache.matches = {};
    getData();
  });
  settings.addEventListener("click", () => {
    openSettings();
  });

  const layoutEditorBtn = document.getElementById("layoutEditorBtn");
  if (layoutEditorBtn) {
    layoutEditorBtn.addEventListener("click", () => {
      openLayoutEditor();
    });
  }

  errorContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("error-exit")) {
      event.target.parentElement.remove();
    }
  });
}
function openSettings() {
  const settingscontainer = document.getElementById("settingscontainer");
  loadSettings();
}

// ── Layout Editor System
class LayoutEditor {
  constructor() {
    this.gridCols = config.gridCols || config.gridSize || 3;
    this.gridRows = config.gridRows || config.gridSize || 3;
    this.layout = JSON.parse(JSON.stringify(config.layout || {}));
    this.draggingItem = null;
    this.resizingItem = null;
    this.startX = 0;
    this.startY = 0;
    this.startWidth = 0;
    this.startHeight = 0;

    this.ITEMS = [
      { id: "webcast-section",     label: "Webcasts",    icon: "device-tv",   lockedAspect: 16/9 },
      { id: "notes-section",       label: "Pit Notes",   icon: "notes" },
      { id: "match-section",       label: "Matches",     icon: "tournament" },
      { id: "leaderboard-section", label: "Leaderboard", icon: "trophy" },
    ];
  }

  // ── Aspect-ratio helper ────────────────────────────────────────────────────

  /**
   * Compute cell pixel dimensions directly from the grid element's current
   * rendered size. Must be called after the grid CSS has been applied so
   * getBoundingClientRect reflects the right dimensions.
   */
  _cellSize() {
    const grid = document.getElementById("layoutGrid");
    if (!grid) return { cellW: 0, cellH: 0 };
    const rect = grid.getBoundingClientRect();
    // Subtract gap contributions: there are (n-1) gaps of 8px inside the grid
    const gapPx = 8;
    const cellW = (rect.width  - gapPx * (this.gridCols - 1)) / this.gridCols;
    const cellH = (rect.height - gapPx * (this.gridRows - 1)) / this.gridRows;
    return { cellW, cellH };
  }

  /**
   * For a locked-aspect item, compute what height span best preserves
   * the target ratio given the item's current width span and the live
   * cell dimensions. Returns the integer row span.
   */
  _idealRowSpan(id, cellW, cellH) {
    const item = this.ITEMS.find(i => i.id === id);
    if (!item?.lockedAspect || !cellH) return null;
    const p = this.layout[id];
    const pixelW    = p.width * cellW + Math.max(0, p.width - 1) * 8; // include inner gaps
    const idealH    = pixelW / item.lockedAspect;
    const idealRows = idealH / (cellH + 8); // account for row gaps too
    // Round to nearest, clamped to what fits
    const snapped = Math.max(1, Math.min(
      Math.round(idealRows),
      this.gridRows - p.y
    ));
    return snapped;
  }

  _snapAspect(id, cellW, cellH) {
    const item = this.ITEMS.find(i => i.id === id);
    if (!item?.lockedAspect) return;
    const rows = this._idealRowSpan(id, cellW, cellH);
    if (rows !== null) this.layout[id].height = rows;
  }

  _snapAllAspects(cellW, cellH) {
    this.ITEMS.forEach(({ id, lockedAspect }) => {
      if (lockedAspect) this._snapAspect(id, cellW, cellH);
    });
  }

  // ── Overlap / bounds helpers ───────────────────────────────────────────────

  _overlaps(a, b) {
    return (
      a.x < b.x + b.width  &&
      a.x + a.width  > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  _resolveOverlaps(movedId) {
    const cols = this.gridCols;
    const rows = this.gridRows;

    const m = this.layout[movedId];
    m.width  = Math.max(1, Math.min(m.width,  cols - m.x));
    m.height = Math.max(1, Math.min(m.height, rows - m.y));
    m.x = Math.max(0, Math.min(m.x, cols - m.width));
    m.y = Math.max(0, Math.min(m.y, rows - m.height));

    const others = this.ITEMS.map(i => i.id).filter(id => id !== movedId);
    let changed = true;
    let iterations = 0;
    while (changed && iterations < 20) {
      changed = false;
      iterations++;
      others.forEach(otherId => {
        const o = this.layout[otherId];
        o.width  = Math.max(1, Math.min(o.width,  cols));
        o.height = Math.max(1, Math.min(o.height, rows));

        const allIds = [movedId, ...others.filter(id => id !== otherId)];
        allIds.forEach(fixedId => {
          const f = this.layout[fixedId];
          if (this._overlaps(o, f)) {
            const pushRight = f.x + f.width;
            const pushDown  = f.y + f.height;
            const rightFits = pushRight + o.width  <= cols;
            const downFits  = pushDown  + o.height <= rows;

            if (rightFits && (!downFits || (pushRight - o.x) <= (pushDown - o.y))) {
              o.x = pushRight;
            } else if (downFits) {
              o.y = pushDown;
            } else {
              o.x = 0;
              o.y = Math.min(m.y + m.height, rows - o.height);
            }
            changed = true;
          }
        });

        o.x = Math.max(0, Math.min(o.x, cols - o.width));
        o.y = Math.max(0, Math.min(o.y, rows - o.height));
      });
    }
  }

  /** Clamp all items into the current grid, then re-snap aspect-locked ones. */
  _clampAll() {
    this.ITEMS.forEach(({ id }) => {
      const p = this.layout[id];
      if (!p) return;
      p.width  = Math.max(1, Math.min(p.width,  this.gridCols));
      p.height = Math.max(1, Math.min(p.height, this.gridRows));
      p.x = Math.max(0, Math.min(p.x, this.gridCols - p.width));
      p.y = Math.max(0, Math.min(p.y, this.gridRows - p.height));
    });
    // Aspect re-snap happens inside renderGrid after CSS is applied
  }

  // ── Open ──────────────────────────────────────────────────────────────────

  open() {
    const modal = document.getElementById("layoutEditorModal");
    modal.innerHTML = `
      <div class="layout-editor-container">
        <div class="layout-editor-header">
          <h2 class="layout-editor-title">Layout Editor</h2>
          <div class="layout-editor-controls">
            <label>Columns <input type="number" id="gridColsInput" min="2" max="12" value="${this.gridCols}" style="width:52px"></label>
            <label>Rows    <input type="number" id="gridRowsInput" min="2" max="12" value="${this.gridRows}" style="width:52px"></label>
          </div>
          <div class="layout-editor-buttons">
            <button class="btn-export" id="exportLayoutBtn">Export</button>
            <button class="btn-import" id="importLayoutBtn">Import</button>
            <button class="btn-reset"  id="resetLayoutBtn">Reset</button>
            <button class="btn-close"  id="closeLayoutBtn">Close</button>
          </div>
        </div>
        <div class="layout-editor-canvas">
          <div class="layout-grid" id="layoutGrid"></div>
        </div>
      </div>
      <input type="file" id="layoutImportInput" accept=".json" style="display:none">
    `;
    modal.classList.add("active");

    this._ensureDefaults();
    this.renderGrid();

    document.getElementById("gridColsInput").addEventListener("input", (e) => {
      this.gridCols = Math.max(2, Math.min(12, parseInt(e.target.value) || 2));
      this._clampAll();
      this.renderGrid();
    });

    document.getElementById("gridRowsInput").addEventListener("input", (e) => {
      this.gridRows = Math.max(2, Math.min(12, parseInt(e.target.value) || 2));
      this._clampAll();
      this.renderGrid();
    });

    document.getElementById("exportLayoutBtn").addEventListener("click", () => this.exportLayout());
    document.getElementById("importLayoutBtn").addEventListener("click", () =>
      document.getElementById("layoutImportInput").click()
    );
    document.getElementById("resetLayoutBtn").addEventListener("click", () => this.resetLayout());
    document.getElementById("closeLayoutBtn").addEventListener("click", () => this.close());
    document.getElementById("layoutImportInput").addEventListener("change", (e) =>
      this.importLayout(e.target.files[0])
    );
  }

  _ensureDefaults() {
    this.ITEMS.forEach(({ id }, i) => {
      if (!this.layout[id]) {
        this.layout[id] = {
          x: i % this.gridCols,
          y: Math.floor(i / this.gridCols),
          width: 1,
          height: 1,
        };
      }
    });
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  renderGrid() {
    const grid = document.getElementById("layoutGrid");
    if (!grid) return;

    // Apply grid CSS first so getBoundingClientRect gives correct dims
    grid.style.gridTemplateColumns = `repeat(${this.gridCols}, 1fr)`;
    grid.style.gridTemplateRows    = `repeat(${this.gridRows}, 1fr)`;
    grid.style.backgroundSize =
      `calc((100% + 8px) / ${this.gridCols}) calc((100% + 8px) / ${this.gridRows})`;

    // Now measure real cell sizes and snap aspect-locked items
    const { cellW, cellH } = this._cellSize();
    this._snapAllAspects(cellW, cellH);

    // Re-render DOM items with updated positions
    grid.innerHTML = "";

    this.ITEMS.forEach(({ id, label, icon, lockedAspect }) => {
      const p = this.layout[id] || { x: 0, y: 0, width: 1, height: 1 };
      const elem = document.createElement("div");
      elem.className = "layout-item";
      if (lockedAspect) elem.classList.add("layout-item--locked-aspect");
      elem.id = `layout-${id}`;
      elem.dataset.itemId = id;
      this._applyGridStyle(elem, p);

      const aspectBadge = lockedAspect
        ? `<span class="layout-item-aspect-badge" title="Height locked to 16:9">16:9</span>`
        : "";

      elem.innerHTML = `
        <div class="layout-item-header">
          <span><i class="ti ti-${icon}" aria-hidden="true"></i> ${label}</span>
          <div style="display:flex;align-items:center;gap:6px">
            ${aspectBadge}
            <span class="layout-item-size">${p.width}\u00d7${p.height}</span>
          </div>
        </div>
        <div class="layout-item-hint">
          ${lockedAspect
            ? "Drag to move \u00b7 right edge to resize width \u00b7 height auto-locks 16:9"
            : "Drag to move \u00b7 corner handle to resize"}
        </div>
        ${lockedAspect
          ? '<div class="resize-handle-width" title="Drag to resize width"></div>'
          : '<div class="resize-handle" title="Resize"></div>'}
      `;

      elem.addEventListener("mousedown", (e) => {
        if (e.target.closest(".resize-handle") || e.target.closest(".resize-handle-width")) {
          this.startResize(e, id);
        } else {
          this.startDrag(e, id);
        }
      });

      elem.addEventListener("touchstart", (e) => {
        const touch = e.touches[0];
        const fakeE = { clientX: touch.clientX, clientY: touch.clientY,
                        preventDefault: () => e.preventDefault() };
        if (e.target.closest(".resize-handle") || e.target.closest(".resize-handle-width")) {
          this.startResize(fakeE, id);
        } else {
          this.startDrag(fakeE, id);
        }
      }, { passive: false });

      grid.appendChild(elem);
    });
  }

  _applyGridStyle(elem, p) {
    elem.style.gridColumn = `${p.x + 1} / span ${p.width}`;
    elem.style.gridRow    = `${p.y + 1} / span ${p.height}`;
    const sizeEl = elem.querySelector(".layout-item-size");
    if (sizeEl) sizeEl.textContent = `${p.width}×${p.height}`;
  }

  _refreshAllItems() {
    this.ITEMS.forEach(({ id }) => {
      const elem = document.getElementById(`layout-${id}`);
      if (elem) this._applyGridStyle(elem, this.layout[id]);
    });
  }

  // ── Drag ──────────────────────────────────────────────────────────────────

  startDrag(e, itemId) {
    this.draggingItem = itemId;
    this.startX = e.clientX;
    this.startY = e.clientY;
    document.getElementById(`layout-${itemId}`)?.classList.add("dragging");

    const move = (ev) => {
      const pt = ev.touches ? ev.touches[0] : ev;
      this.onDragMove({ clientX: pt.clientX, clientY: pt.clientY });
    };
    const up = () => {
      this.onDragEnd();
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend", up);
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
    document.addEventListener("touchmove", move, { passive: false });
    document.addEventListener("touchend", up);
  }

  onDragMove(e) {
    if (!this.draggingItem) return;
    const grid = document.getElementById("layoutGrid");
    if (!grid) return;
    const rect = grid.getBoundingClientRect();
    const cellW = (rect.width  - 8 * (this.gridCols - 1)) / this.gridCols;
    const cellH = (rect.height - 8 * (this.gridRows - 1)) / this.gridRows;

    const p = this.layout[this.draggingItem];
    // Use cell+gap unit for hit-testing cursor position
    const unitW = cellW + 8;
    const unitH = cellH + 8;
    let newX = Math.floor((e.clientX - rect.left) / unitW);
    let newY = Math.floor((e.clientY - rect.top)  / unitH);
    newX = Math.max(0, Math.min(newX, this.gridCols - p.width));
    newY = Math.max(0, Math.min(newY, this.gridRows - p.height));

    if (newX !== p.x || newY !== p.y) {
      p.x = newX;
      p.y = newY;
      this._snapAspect(this.draggingItem, cellW, cellH);
      this._resolveOverlaps(this.draggingItem);
      this._refreshAllItems();
    }
  }

  onDragEnd() {
    if (this.draggingItem) {
      document.getElementById(`layout-${this.draggingItem}`)?.classList.remove("dragging");
      this.draggingItem = null;
    }
  }

  // ── Resize ────────────────────────────────────────────────────────────────

  startResize(e, itemId) {
    e.preventDefault?.();
    this.resizingItem = itemId;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startWidth  = this.layout[itemId].width;
    this.startHeight = this.layout[itemId].height;
    document.getElementById(`layout-${itemId}`)?.classList.add("resizing");

    const move = (ev) => {
      const pt = ev.touches ? ev.touches[0] : ev;
      this.onResizeMove({ clientX: pt.clientX, clientY: pt.clientY });
    };
    const up = () => {
      this.onResizeEnd();
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend", up);
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
    document.addEventListener("touchmove", move, { passive: false });
    document.addEventListener("touchend", up);
  }

  onResizeMove(e) {
    if (!this.resizingItem) return;
    const item = this.ITEMS.find(i => i.id === this.resizingItem);
    const grid = document.getElementById("layoutGrid");
    if (!grid) return;
    const rect = grid.getBoundingClientRect();
    const cellW = (rect.width  - 8 * (this.gridCols - 1)) / this.gridCols;
    const cellH = (rect.height - 8 * (this.gridRows - 1)) / this.gridRows;
    const unitW = cellW + 8;
    const unitH = cellH + 8;

    const deltaX = Math.round((e.clientX - this.startX) / unitW);
    const p = this.layout[this.resizingItem];

    const newW = Math.max(1, Math.min(this.startWidth + deltaX, this.gridCols - p.x));

    if (newW !== p.width) {
      p.width = newW;
      if (item?.lockedAspect) {
        this._snapAspect(this.resizingItem, cellW, cellH);
      } else {
        const deltaY = Math.round((e.clientY - this.startY) / unitH);
        p.height = Math.max(1, Math.min(this.startHeight + deltaY, this.gridRows - p.y));
      }
      this._resolveOverlaps(this.resizingItem);
      this._refreshAllItems();
    }
  }

  onResizeEnd() {
    if (this.resizingItem) {
      document.getElementById(`layout-${this.resizingItem}`)?.classList.remove("resizing");
      this.resizingItem = null;
    }
  }

  // ── Export / Import / Reset ───────────────────────────────────────────────

  exportLayout() {
    const data = {
      version: "1.2",
      gridCols: this.gridCols,
      gridRows: this.gridRows,
      layout: this.layout,
      theme: config.theme,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `pitbeacon-layout-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    displayMessage("Layout exported!", "message");
  }

  importLayout(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        this.gridCols = data.gridCols || data.gridSize || 3;
        this.gridRows = data.gridRows || data.gridSize || 3;
        this.layout   = data.layout || {};
        document.getElementById("gridColsInput").value = this.gridCols;
        document.getElementById("gridRowsInput").value = this.gridRows;
        this._ensureDefaults();
        this.renderGrid();
        displayMessage("Layout imported successfully!", "message");
      } catch (err) {
        displayMessage("Failed to import layout: " + err.message, "error");
      }
    };
    reader.readAsText(file);
  }

  resetLayout() {
    if (!confirm("Reset layout to default?")) return;
    this.gridCols = 3;
    this.gridRows = 3;
    this.layout = {
      "webcast-section":     { x: 0, y: 0, width: 1, height: 1 },
      "notes-section":       { x: 0, y: 2, width: 1, height: 1 },
      "match-section":       { x: 1, y: 0, width: 2, height: 2 },
      "leaderboard-section": { x: 1, y: 2, width: 2, height: 1 },
    };
    document.getElementById("gridColsInput").value = 3;
    document.getElementById("gridRowsInput").value = 3;
    this.renderGrid();
    displayMessage("Layout reset to default", "message");
  }

  // ── Close / Save ──────────────────────────────────────────────────────────

  close() {
    config.gridCols = this.gridCols;
    config.gridRows = this.gridRows;
    config.gridSize = this.gridCols;
    config.layout   = this.layout;
    localStorage.setItem("gridCols", this.gridCols);
    localStorage.setItem("gridRows", this.gridRows);
    localStorage.setItem("gridSize", this.gridCols);
    localStorage.setItem("layout",   JSON.stringify(this.layout));

    document.getElementById("layoutEditorModal").classList.remove("active");
    applyLayout();
    displayMessage("Layout saved!", "message");
  }
}

// ── applyLayout ───────────────────────────────────────────────────────────────
function applyLayout() {
  const container = document.getElementById("container");
  if (!container) return;

  const cols = config.gridCols || config.gridSize || 3;
  const rows = config.gridRows || config.gridSize || 3;

  container.style.display             = "grid";
  container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  container.style.gridTemplateRows    = `repeat(${rows}, 1fr)`;
  container.style.gap                 = "12px";
  container.style.height              = "calc(100vh - 4.5rem)";
  container.style.padding             = "12px";

  ["webcast-section", "notes-section", "match-section", "leaderboard-section"].forEach((itemId) => {
    const elem = document.getElementById(itemId);
    if (!elem) return;
    const pos = (config.layout && config.layout[itemId]) || { x: 0, y: 0, width: 1, height: 1 };
    elem.style.gridColumn = `${pos.x + 1} / span ${pos.width}`;
    elem.style.gridRow    = `${pos.y + 1} / span ${pos.height}`;
  });
}

function openLayoutEditor() {
  const editor = new LayoutEditor();
  editor.open();
}

function updateTimeDisplay() {
  const timeDisplay = document.getElementById("time-display");
  // Use test date if in test mode, otherwise use real time
  const isTestMode = localStorage.getItem("testMode") === "true";
  if (isTestMode) {
    // Update fullDate with current time while keeping test date
    const savedTestDate = localStorage.getItem("testDate");
    if (savedTestDate) {
      const testDateObj = new Date(savedTestDate);
      const now = new Date();
      fullDate = new Date(
        testDateObj.getFullYear(),
        testDateObj.getMonth(),
        testDateObj.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
      );
    }
  }
  const displayDate = isTestMode ? fullDate : new Date();
  timeDisplay.textContent = displayDate.toLocaleTimeString("en-US", {
    hour12: true,
  });

  // Update match cards if we have match data
  if (currentMatches && currentEventData) {
    updateMatchDisplay();
    checkAndAlertForMatch();
  }
}

function checkAndAlertForMatch() {
  if (!currentMatches || !config.matchAlarmToggle) return;

  const currentTime = Math.floor(
    (localStorage.getItem("testMode") === "true"
      ? fullDate
      : new Date()
    ).getTime() / 1000,
  );

  for (const match of currentMatches) {
    // Check if this match's team is playing
    const isTeamInMatch =
      match.alliances.red.team_keys.includes(`frc${config.teamNumber}`) ||
      match.alliances.blue.team_keys.includes(`frc${config.teamNumber}`);

    if (!isTeamInMatch) continue;

    const timeUntilMatch = match.predicted_time - currentTime;
    const matchId = `${match.comp_level}-${match.match_number}`;

    // Alert if within threshold and not already alerted for this match
    if (
      timeUntilMatch > 0 &&
      timeUntilMatch <= config.matchAlertThreshold &&
      lastMatchAlertId !== matchId
    ) {
      const sound = audioFiles[config.matchAlarmSound] || audioFiles.alarm1;
      sound.currentTime = 0;
      sound.play().catch((err) => console.log("Audio play failed:", err));
      lastMatchAlertId = matchId;

      const minutes = Math.floor(timeUntilMatch / 60);
      const seconds = Math.floor(timeUntilMatch % 60);
      displayMessage(
        `Match Alert: ${match.comp_level.toUpperCase()} ${match.match_number} in ${minutes}m ${seconds}s!`,
        "message",
      );
      break; // Only alert for one match per check
    }
  }
}

function updateMatchDisplay() {
  if (!currentMatches) return;

  // Create sections directly in container (grid layout will position them)
  let webcastSection = document.getElementById("webcast-section");
  if (!webcastSection) {
    webcastSection = document.createElement("div");
    webcastSection.id = "webcast-section";
    webcastSection.style.overflow = "auto";
    container.appendChild(webcastSection);
  }
  if (
    webcastSection.children.length === 0 &&
    currentEventData.webcasts?.length > 0
  ) {
    displayWebcasts(currentEventData.webcasts, webcastSection, fullDate);
  }

  let notesSection = document.getElementById("notes-section");
  if (!notesSection) {
    notesSection = document.createElement("div");
    notesSection.id = "notes-section";
    notesSection.style.overflow = "auto";
    container.appendChild(notesSection);
    setupNotesSection(notesSection);
  }

  let matchSection = document.getElementById("match-section");
  if (!matchSection) {
    matchSection = document.createElement("div");
    matchSection.id = "match-section";
    matchSection.style.overflow = "auto";
    container.appendChild(matchSection);
  }
  matchSection.innerHTML = ""; // Clear old matches

  let leaderboardSection = document.getElementById("leaderboard-section");
  if (!leaderboardSection) {
    leaderboardSection = document.createElement("div");
    leaderboardSection.id = "leaderboard-section";
    container.appendChild(leaderboardSection);
  }
  updateLeaderboardDisplay();
  // Get or create a dedicated matches section (cleared freely)

  // Sort matches by predicted_time to show closest to farthest
  const matches = [...currentMatches]; // Make a copy to avoid mutating
  matches.sort((a, b) => a.predicted_time - b.predicted_time);
  console.log("Sorted matches:", matches);

  // Check if team is currently in a match
  // Use test date if test mode is enabled, otherwise use current time
  const currentTime = Math.floor(
    (localStorage.getItem("testMode") === "true"
      ? fullDate
      : new Date()
    ).getTime() / 1000,
  );
  const bufferBefore = 300; // 5 minutes before
  const matchDuration = 150; // 2:30 match duration
  let check = false;

  for (let j = 0; j < matches.length; j++) {
    const matchStartTime = matches[j].predicted_time;
    if (
      currentTime >= matchStartTime - bufferBefore &&
      currentTime <= matchStartTime + matchDuration
    ) {
      const liveCard = document.createElement("div");
      liveCard.className = "match-card";
      const timeUntil = Math.max(
        0,
        Math.floor((matchStartTime - currentTime) / 60),
      );
      const secUntil = Math.max(
        0,
        Math.floor((matchStartTime - currentTime) % 60),
      );
      const countdownClass =
        timeUntil === 0 && secUntil < 30
          ? "countdown-urgent"
          : "countdown-warning";
      liveCard.innerHTML = `
        <h1 class="match-title">⏰ Match Starting Soon!</h1>
        <p>Match: ${matches[j].comp_level.toUpperCase()} ${matches[j].match_number}</p>
        <p>Est: ${new Date(matchStartTime * 1000).toLocaleTimeString()}</p>
        <p class="${countdownClass}">Time Until: ${timeUntil} min ${secUntil} sec</p>
      `;
      matchSection.appendChild(liveCard);

      for (let k = j + 1; k < matches.length; k++) {
        const upcomingCard = document.createElement("div");
        upcomingCard.className = "upcomingmatch-card";
        const match = matches[k];
        upcomingCard.innerHTML = `
        <div class="upcoming-basicinfo">
          <h1 class="match-title">Upcoming Match</h1>
          <p>Match: ${match.comp_level.toUpperCase()} ${match.match_number}</p>                
          <p>Est: ${new Date(match.predicted_time * 1000).toLocaleTimeString()}</p>
          <p>Time Until: ${Math.max(0, Math.floor((match.predicted_time - currentTime) / 60))} min ${Math.max(0, Math.floor((match.predicted_time - currentTime) % 60))} sec</p>
        </div>
        <div class="upcoming-teams">
          ${(() => {
            const redout = [];
            for (const team of match.alliances.red.team_keys) {
              redout.push(`<p class="red">${team.replace("frc", "")}</p>`);
            }
            const blueout = [];
            for (const team of match.alliances.blue.team_keys) {
              blueout.push(`<p class="blue">${team.replace("frc", "")}</p>`);
            }

            let userTeamHTML = "";
            let userAllianceColor = "";
            let remainingRed = [...redout];
            let remainingBlue = [...blueout];

            // Find user's team in red alliance
            const redUserIndex = remainingRed.findIndex((el) =>
              el.includes(config.teamNumber.toString()),
            );
            if (redUserIndex !== -1) {
              userTeamHTML = `<div class="alliance-row user-team"><p class="red highlight">${config.teamNumber}</p></div>`;
              remainingRed.splice(redUserIndex, 1);
              userAllianceColor = "red";
            } else {
              // Find user's team in blue alliance
              const blueUserIndex = remainingBlue.findIndex((el) =>
                el.includes(config.teamNumber.toString()),
              );
              if (blueUserIndex !== -1) {
                userTeamHTML = `<div class="alliance-row user-team"><p class="blue highlight">${config.teamNumber}</p></div>`;
                remainingBlue.splice(blueUserIndex, 1);
                userAllianceColor = "blue";
              }
            }

            let allianceRows = "";
            if (userAllianceColor === "red") {
              allianceRows = `<div class="alliance-row">${remainingRed.join("")}</div><div class="alliance-row">${remainingBlue.join("")}</div>`;
            } else {
              allianceRows = `<div class="alliance-row">${remainingBlue.join("")}</div><div class="alliance-row">${remainingRed.join("")}</div>`;
            }

            return userTeamHTML + allianceRows;
          })()}
        </div>
      `;
        matchSection.appendChild(upcomingCard);
      }
      check = true;
      break;
    }
  }
  if (!check) {
    const upcoming = matches.filter((m) => m.predicted_time > currentTime);
    if (upcoming.length === 0) {
      container.innerHTML =
        "<p class='inactive'>No event. Try test mode or a different team number.</p>";
    }
    for (const match of upcoming) {
      const card = document.createElement("div");
      card.className = "upcomingmatch-card";
      card.innerHTML = `
      <div class="upcoming-basicinfo">
        <h1 class="match-title">Upcoming Match</h1>
        <p>Match: ${match.comp_level.toUpperCase()} ${match.match_number}</p>
        <p>Est: ${new Date(match.predicted_time * 1000).toLocaleTimeString()}</p>
        <p>Time Until: ${Math.max(0, Math.floor((match.predicted_time - currentTime) / 60))} min ${Math.max(0, Math.floor((match.predicted_time - currentTime) % 60))} sec</p>
      </div>
        <div class="upcoming-teams">
          ${(() => {
            const redout = [];
            for (const team of match.alliances.red.team_keys) {
              redout.push(`<p class="red">${team.replace("frc", "")}</p>`);
            }
            const blueout = [];
            for (const team of match.alliances.blue.team_keys) {
              blueout.push(`<p class="blue">${team.replace("frc", "")}</p>`);
            }

            let userTeamHTML = "";
            let userAllianceColor = "";
            let remainingRed = [...redout];
            let remainingBlue = [...blueout];

            // Find user's team in red alliance
            const redUserIndex = remainingRed.findIndex((el) =>
              el.includes(config.teamNumber.toString()),
            );
            if (redUserIndex !== -1) {
              userTeamHTML = `<div class="alliance-row user-team"><p class="red highlight">${config.teamNumber}</p></div>`;
              remainingRed.splice(redUserIndex, 1);
              userAllianceColor = "red";
            } else {
              // Find user's team in blue alliance
              const blueUserIndex = remainingBlue.findIndex((el) =>
                el.includes(config.teamNumber.toString()),
              );
              if (blueUserIndex !== -1) {
                userTeamHTML = `<div class="alliance-row user-team"><p class="blue highlight">${config.teamNumber}</p></div>`;
                remainingBlue.splice(blueUserIndex, 1);
                userAllianceColor = "blue";
              }
            }

            let allianceRows = "";
            if (userAllianceColor === "red") {
              allianceRows = `<div class="alliance-row">${remainingRed.join("")}</div><div class="alliance-row">${remainingBlue.join("")}</div>`;
            } else {
              allianceRows = `<div class="alliance-row">${remainingBlue.join("")}</div><div class="alliance-row">${remainingRed.join("")}</div>`;
            }

            return userTeamHTML + allianceRows;
          })()}
        </div>
    `;
      matchSection.appendChild(card);
    }
  }
}
// Load saved settings first
loadSettings();

// Update time display immediately and every second
updateTimeDisplay();
timeUpdateInterval = setInterval(updateTimeDisplay, 1000);

// Get initial data
getData();

const pollInterval = () => {
  const randomDelay = 30000 + Math.random() * 30000; // 30-60 seconds
  pollingInterval = setTimeout(() => {
    getData();
    pollInterval();
  }, randomDelay);
};

const updateInterval = () => {
  const intervalId = setInterval(() => {
    const tbody = document.getElementById("notes-tbody");
    const notes = loadNotes();
    notes.sort((a, b) => b.priority - a.priority); // highest priority first

    tbody.innerHTML = ""; // Clear old rows
    notes.forEach((note, index) => addNoteRow(tbody, note, index));
    for (const note of notes) {
      if (note.priority >= config.noteAlarmThreshold) {
        if (config.noteAlarmToggle) {
          const sound = audioFiles[config.noteAlarmSound] || audioFiles.alarm1;
          sound.currentTime = 0;
          sound.play().catch((err) => console.log("Audio play failed:", err));
          break; // Only need to play once per update
        }
      }
    }
  }, 10000);
  return intervalId; // Store the interval ID for later cleanup
};

updateInterval();

pollInterval();

setupListeners();

// Apply custom layout after everything is set up

applyLayout();
