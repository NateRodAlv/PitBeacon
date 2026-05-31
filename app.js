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
const popups = {};
let popupCounter = 0;

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

  loadCustomColors();
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

  // Load note type and hidden sections
  const savedAdditionalSections = localStorage.getItem(
    "additionalNoteSections",
  );
  if (savedAdditionalSections) {
    try {
      config.additionalNoteSections = JSON.parse(savedAdditionalSections);
    } catch (err) {
      config.additionalNoteSections = [];
    }
  }

  const savedHiddenSections = localStorage.getItem("hiddenSections");
  if (savedHiddenSections) {
    try {
      config.hiddenSections = new Set(JSON.parse(savedHiddenSections));
    } catch (err) {
      config.hiddenSections = new Set();
    }
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
  popupCounter++;
  const popupId = popupCounter;
  const divId = `popup-${popupId}`;
  errorContainer.innerHTML = `${errorContainer.innerHTML}<div class="${type}" id="${divId}"><p class="error-exit">X</p><p>${message}</p></div>`;

  const element = document.getElementById(divId);
  if (element) {
    // Set individual timeout for automatic deletion
    // The global error container click handler will manage manual dismissal
    const timeout = setTimeout(() => {
      try {
        // Find the element again in case DOM changed
        const msg = document.getElementById(divId);
        if (msg && msg.parentNode) {
          msg.remove();
        }
      } catch (e) {
        console.log("Message already removed:", divId);
      }
      delete popups[popupId];
    }, 3000);

    popups[popupId] = { element: element, timeout: timeout };
  }
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

// ── Generic data storage for note types ────────────────────────────────────
function loadNoteData(type) {
  try {
    return JSON.parse(localStorage.getItem(`noteData-${type}`) || "[]");
  } catch {
    return [];
  }
}

function saveNoteData(type, data) {
  localStorage.setItem(`noteData-${type}`, JSON.stringify(data));
}

// ── Shared helpers ────────────────────────────────────────────────────────────

// ── Robot Health Log ──────────────────────────────────────────────────────────
// ── Utility ──────────────────────────────────────────────────────────────────
function _esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Unique id counter so multiple pitBody divs never share the same id
let _pitBodyCounter = 0;

function _sectionShell(section, title, addLabel, iconClass) {
  const bodyId = `pitBody-${_pitBodyCounter++}`;
  section.innerHTML = `
    <div class="pit-header">
      <span class="pit-title"><i class="${iconClass}" aria-hidden="true"></i> ${title}</span>
      <button class="pit-add-btn">${addLabel}</button>
    </div>
    <div class="pit-body" id="${bodyId}"></div>
  `;
  // Attach ResizeObserver for responsive interior layout
  _observeSection(section);
  return {
    body: section.querySelector(`#${bodyId}`),
    addBtn: section.querySelector(".pit-add-btn"),
  };
}

// Apply size classes so CSS can adapt card layout when a section is small
function _observeSection(section) {
  if (!window.ResizeObserver) return;
  const ro = new ResizeObserver(([entry]) => {
    const w = entry.contentRect.width;
    section.classList.toggle("pit-xs", w < 220);
    section.classList.toggle("pit-sm", w >= 220 && w < 360);
    section.classList.toggle("pit-md", w >= 360 && w < 540);
    section.classList.toggle("pit-lg", w >= 540);
  });
  ro.observe(section);
}

// ── Robot Health Log ──────────────────────────────────────────────────────────
function setupRobotHealthLog(section) {
  const { body, addBtn } = _sectionShell(
    section,
    "Robot Health",
    "＋ Task",
    "ti ti-tool",
  );
  const render = () => {
    const data = loadNoteData("robot-health");
    body.innerHTML = "";
    if (!data.length) {
      body.innerHTML = `<p class="pit-empty">No tasks logged.</p>`;
      return;
    }
    data.forEach((entry, i) => body.appendChild(_rhCard(entry, i, render)));
  };
  render();
  addBtn.addEventListener("click", () => {
    const data = loadNoteData("robot-health");
    data.push({ task: "", component: "", status: "pending" });
    saveNoteData("robot-health", data);
    render();
  });
}

const RH_STATUS = {
  pending: { label: "Pending", cls: "chip-warn" },
  "in-progress": { label: "In Progress", cls: "chip-info" },
  completed: { label: "Done", cls: "chip-ok" },
};

function _rhCard(entry, index, render) {
  const card = document.createElement("div");
  card.className = "pit-card";
  card.innerHTML = `
    <div class="pit-card-row">
      <div class="pit-card-fields">
        <input class="pit-input pit-task" placeholder="Task…" value="${_esc(entry.task)}">
        <input class="pit-input pit-sub"  placeholder="Component (e.g. intake)" value="${_esc(entry.component)}">
      </div>
      <button class="pit-del-btn" aria-label="Delete" title="Delete task">✕</button>
    </div>
    <div class="pit-status-row">
      ${Object.entries(RH_STATUS)
        .map(
          ([val, { label, cls }]) =>
            `<button class="pit-chip ${cls}${val === entry.status ? " chip-active" : ""}" data-val="${val}">${label}</button>`,
        )
        .join("")}
    </div>
  `;
  const taskEl = card.querySelector(".pit-task");
  const subEl = card.querySelector(".pit-sub");
  const save = () => {
    const data = loadNoteData("robot-health");
    if (data[index]) {
      data[index].task = taskEl.value;
      data[index].component = subEl.value;
      saveNoteData("robot-health", data);
    }
  };
  taskEl.addEventListener("input", save);
  subEl.addEventListener("input", save);
  card.querySelectorAll("[data-val]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const data = loadNoteData("robot-health");
      if (data[index]) {
        data[index].status = btn.dataset.val;
        saveNoteData("robot-health", data);
      }
      render();
    }),
  );
  card.querySelector(".pit-del-btn").addEventListener("click", () => {
    const data = loadNoteData("robot-health");
    data.splice(index, 1);
    saveNoteData("robot-health", data);
    render();
  });
  return card;
}

// ── Battery Manager ───────────────────────────────────────────────────────────
function setupBatteryManager(section) {
  const { body, addBtn } = _sectionShell(
    section,
    "Batteries",
    "＋ Battery",
    "ti ti-battery-2",
  );
  const render = () => {
    const data = loadNoteData("battery-manager");
    body.innerHTML = "";
    if (!data.length) {
      body.innerHTML = `<p class="pit-empty">No batteries logged.</p>`;
      return;
    }
    data.forEach((entry, i) => body.appendChild(_battCard(entry, i, render)));
  };
  render();
  addBtn.addEventListener("click", () => {
    const data = loadNoteData("battery-manager");
    data.push({ id: "", voltage: "", cycles: "0", status: "ready" });
    saveNoteData("battery-manager", data);
    render();
  });
}

const BATT_STATUS = {
  ready: { label: "Ready", cls: "chip-ok" },
  charging: { label: "Charging", cls: "chip-info" },
  dead: { label: "Dead", cls: "chip-err" },
};

function _battCard(entry, index, render) {
  const card = document.createElement("div");
  card.className = "pit-card";
  const v = parseFloat(entry.voltage) || 0;
  const pct = Math.min(100, Math.max(0, ((v - 10) / 3) * 100));
  const barCls =
    pct >= 70 ? "volt-bar-ok" : pct >= 40 ? "volt-bar-warn" : "volt-bar-err";

  card.innerHTML = `
    <div class="pit-card-row">
      <div class="pit-card-fields" style="flex:1;min-width:0">
        <div class="batt-top-row">
          <input class="pit-input batt-id" placeholder="Battery ID" value="${_esc(entry.id)}">
          <div class="batt-volt-block">
            <input class="pit-input batt-volt" type="number" step="0.1" placeholder="Volts" value="${_esc(entry.voltage)}">
            <div class="volt-track"><div class="volt-bar ${barCls}" style="width:${pct.toFixed(0)}%"></div></div>
          </div>
          <input class="pit-input batt-cycles" type="number" placeholder="Cycles" value="${_esc(entry.cycles)}">
        </div>
      </div>
      <button class="pit-del-btn" aria-label="Delete" title="Delete battery">✕</button>
    </div>
    <div class="pit-status-row">
      ${Object.entries(BATT_STATUS)
        .map(
          ([val, { label, cls }]) =>
            `<button class="pit-chip ${cls}${val === entry.status ? " chip-active" : ""}" data-val="${val}">${label}</button>`,
        )
        .join("")}
    </div>
  `;

  const idEl = card.querySelector(".batt-id");
  const voltEl = card.querySelector(".batt-volt");
  const cyclesEl = card.querySelector(".batt-cycles");
  const bar = card.querySelector(".volt-bar");

  const save = () => {
    const data = loadNoteData("battery-manager");
    if (!data[index]) return;
    data[index].id = idEl.value;
    data[index].voltage = voltEl.value;
    data[index].cycles = cyclesEl.value;
    saveNoteData("battery-manager", data);
    const nv = parseFloat(voltEl.value) || 0;
    const np = Math.min(100, Math.max(0, ((nv - 10) / 3) * 100));
    bar.style.width = np.toFixed(0) + "%";
    bar.className =
      "volt-bar " +
      (np >= 70 ? "volt-bar-ok" : np >= 40 ? "volt-bar-warn" : "volt-bar-err");
  };
  [idEl, voltEl, cyclesEl].forEach((el) => el.addEventListener("input", save));
  card.querySelectorAll("[data-val]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const data = loadNoteData("battery-manager");
      if (data[index]) {
        data[index].status = btn.dataset.val;
        saveNoteData("battery-manager", data);
      }
      render();
    }),
  );
  card.querySelector(".pit-del-btn").addEventListener("click", () => {
    const data = loadNoteData("battery-manager");
    data.splice(index, 1);
    saveNoteData("battery-manager", data);
    render();
  });
  return card;
}
// ── Parts Inventory ───────────────────────────────────────────────────────────
function setupPartsInventory(section) {
  const { body, addBtn } = _sectionShell(
    section,
    "Parts Inventory",
    "＋ Part",
    "ti ti-package",
  );
  const render = () => {
    const data = loadNoteData("parts-inventory");
    body.innerHTML = "";
    if (!data.length) {
      body.innerHTML = `<p class="pit-empty">No parts tracked.</p>`;
      return;
    }
    const grid = document.createElement("div");
    grid.className = "parts-grid";
    data.forEach((entry, i) => grid.appendChild(_partCard(entry, i, render)));
    body.appendChild(grid);
  };
  render();
  addBtn.addEventListener("click", () => {
    const data = loadNoteData("parts-inventory");
    data.push({ name: "", quantity: "0", minStock: "0" });
    saveNoteData("parts-inventory", data);
    render();
  });
}

function _partCard(entry, index, render) {
  const qty = parseInt(entry.quantity) || 0;
  const min = parseInt(entry.minStock) || 0;
  const low = qty <= min;
  const card = document.createElement("div");
  card.className = "pit-card part-card" + (low ? " part-card-low" : "");

  card.innerHTML = `
    <div class="part-card-top">
      <input class="pit-input part-name" placeholder="Part name…" value="${_esc(entry.name)}">
      <button class="pit-del-btn" aria-label="Delete" title="Delete part">✕</button>
    </div>
    <div class="part-qty-row">
      <div class="part-qty-block">
        <span class="part-qty-num ${low ? "qty-low" : "qty-ok"}">${qty}</span>
        <span class="part-qty-label">have</span>
      </div>
      <span class="part-divider">/</span>
      <div class="part-qty-block">
        <span class="part-qty-num part-qty-min">${min}</span>
        <span class="part-qty-label">min</span>
      </div>
    </div>
    ${low ? `<div class="part-low-badge">⚠ LOW STOCK</div>` : `<div class="part-ok-badge">✓ OK</div>`}
    <div class="part-inputs-row">
      <label class="part-micro-label">Qty<input class="pit-input part-qty-in" type="number" value="${_esc(entry.quantity)}" min="0"></label>
      <label class="part-micro-label">Min<input class="pit-input part-min-in" type="number" value="${_esc(entry.minStock)}" min="0"></label>
    </div>
  `;

  const nameEl = card.querySelector(".part-name");
  const qtyIn = card.querySelector(".part-qty-in");
  const minIn = card.querySelector(".part-min-in");

  nameEl.addEventListener("input", () => {
    const data = loadNoteData("parts-inventory");
    if (data[index]) {
      data[index].name = nameEl.value;
      saveNoteData("parts-inventory", data);
    }
  });
  [qtyIn, minIn].forEach((el) =>
    el.addEventListener("change", () => {
      const data = loadNoteData("parts-inventory");
      if (!data[index]) return;
      data[index].quantity = qtyIn.value;
      data[index].minStock = minIn.value;
      saveNoteData("parts-inventory", data);
      render();
    }),
  );
  card.querySelector(".pit-del-btn").addEventListener("click", () => {
    const data = loadNoteData("parts-inventory");
    data.splice(index, 1);
    saveNoteData("parts-inventory", data);
    render();
  });
  return card;
}

// ── Pit Check-In ──────────────────────────────────────────────────────────────
function setupPitCheckIn(section) {
  const { body, addBtn } = _sectionShell(
    section,
    "Pit Check-In",
    "＋ Task",
    "ti ti-checklist",
  );
  const render = () => {
    const data = loadNoteData("pit-checkin");
    body.innerHTML = "";
    if (data.length) {
      const done = data.filter((d) => d.completed).length;
      const bar = document.createElement("div");
      bar.className = "checkin-progress";
      bar.innerHTML = `
        <div class="checkin-prog-track">
          <div class="checkin-prog-fill" style="width:${data.length ? ((done / data.length) * 100).toFixed(0) : 0}%"></div>
        </div>
        <span class="checkin-prog-label">${done}/${data.length}</span>
      `;
      body.appendChild(bar);
    }
    data.forEach((entry, i) => body.appendChild(_checkRow(entry, i, render)));
    if (!data.length)
      body.innerHTML = `<p class="pit-empty">No tasks added.</p>`;
  };
  render();
  addBtn.addEventListener("click", () => {
    const data = loadNoteData("pit-checkin");
    data.push({ task: "", assignedTo: "", completed: false });
    saveNoteData("pit-checkin", data);
    render();
  });
}

function _checkRow(entry, index, render) {
  const row = document.createElement("div");
  row.className = "checkin-row" + (entry.completed ? " checkin-done" : "");
  row.innerHTML = `
    <button class="checkin-check ${entry.completed ? "check-done" : ""}" aria-label="Toggle complete">
      <i class="ti ${entry.completed ? "ti-check" : "ti-circle"}" aria-hidden="true"></i>
    </button>
    <div class="checkin-text">
      <input class="pit-input checkin-task" placeholder="Task…" value="${_esc(entry.task)}" ${entry.completed ? "disabled" : ""}>
      <input class="pit-input checkin-who pit-sub" placeholder="Who?" value="${_esc(entry.assignedTo)}" ${entry.completed ? "disabled" : ""}>
    </div>
    <button class="pit-del-btn" aria-label="Delete" title="Delete task">✕</button>
  `;
  const taskEl = row.querySelector(".checkin-task");
  const whoEl = row.querySelector(".checkin-who");
  const save = () => {
    const data = loadNoteData("pit-checkin");
    if (data[index]) {
      data[index].task = taskEl.value;
      data[index].assignedTo = whoEl.value;
      saveNoteData("pit-checkin", data);
    }
  };
  taskEl.addEventListener("input", save);
  whoEl.addEventListener("input", save);
  row.querySelector(".checkin-check").addEventListener("click", () => {
    const data = loadNoteData("pit-checkin");
    if (data[index]) {
      data[index].completed = !data[index].completed;
      saveNoteData("pit-checkin", data);
    }
    render();
  });
  row.querySelector(".pit-del-btn").addEventListener("click", () => {
    const data = loadNoteData("pit-checkin");
    data.splice(index, 1);
    saveNoteData("pit-checkin", data);
    render();
  });
  return row;
}

// ── Pit Notes ─────────────────────────────────────────────────────────────────
function setupNotesSection(section, noteType = "pit-notes") {
  switch (noteType) {
    case "robot-health":
      setupRobotHealthLog(section);
      break;
    case "battery-manager":
      setupBatteryManager(section);
      break;
    case "parts-inventory":
      setupPartsInventory(section);
      break;
    case "pit-checkin":
      setupPitCheckIn(section);
      break;
    default:
      setupPitNotesSection(section);
      break;
  }
}

function setupPitNotesSection(section) {
  const { body, addBtn } = _sectionShell(
    section,
    "Pit Notes",
    "＋ Issue",
    "ti ti-notes",
  );
  const render = () => {
    const notes = loadNotes();
    notes.sort((a, b) => b.priority - a.priority);
    body.innerHTML = "";
    notes.forEach((note, i) => body.appendChild(_noteCard(note, i, render)));
    if (!notes.length)
      body.innerHTML = `<p class="pit-empty">No issues logged.</p>`;
  };
  render();
  addBtn.addEventListener("click", () => {
    const notes = loadNotes();
    notes.push({ issue: "", location: "", priority: 5 });
    saveNotes(notes);
    render();
  });
}

function _noteCard(note, index, render) {
  const hue = 120 - ((note.priority - 1) / 9) * 120;
  const card = document.createElement("div");
  card.className = "pit-card note-card";
  card.innerHTML = `
    <button class="pit-del-btn" aria-label="Delete" title="Delete issue">✕</button>
    <div class="note-card-inner">
      <div class="note-card-fields">
        <textarea class="pit-input note-issue" placeholder="Describe issue…" rows="2">${_esc(note.issue)}</textarea>
        <input class="pit-input pit-sub note-loc" placeholder="Location (e.g. intake)" value="${_esc(note.location)}">
      </div>
      <div class="note-priority-block">
        <span class="note-pri-badge" style="background:hsl(${hue},80%,38%)" contenteditable="true" title="Priority 1–10">${note.priority}</span>
        <span class="note-pri-label">priority</span>
      </div>
    </div>
  `;
  const issueEl = card.querySelector(".note-issue");
  const locEl = card.querySelector(".note-loc");
  const badge = card.querySelector(".note-pri-badge");

  issueEl.addEventListener("input", () => {
    const n = loadNotes();
    if (n[index]) {
      n[index].issue = issueEl.value;
      saveNotes(n);
    }
  });
  locEl.addEventListener("input", () => {
    const n = loadNotes();
    if (n[index]) {
      n[index].location = locEl.value;
      saveNotes(n);
    }
  });
  badge.addEventListener("keypress", (e) => {
    if (!/[0-9]/.test(e.key)) e.preventDefault();
  });
  badge.addEventListener("input", () => {
    const p = Math.min(10, Math.max(1, parseInt(badge.textContent) || 1));
    badge.style.background = `hsl(${120 - ((p - 1) / 9) * 120},80%,38%)`;
    const n = loadNotes();
    if (n[index]) {
      n[index].priority = p;
      saveNotes(n);
    }
  });
  badge.addEventListener("blur", () => {
    const p = Math.min(10, Math.max(1, parseInt(badge.textContent) || 1));
    badge.textContent = p;
    badge.style.background = `hsl(${120 - ((p - 1) / 9) * 120},80%,38%)`;
    const n = loadNotes();
    if (n[index]) {
      n[index].priority = p;
      saveNotes(n);
    }
    render();
  });
  card.querySelector(".pit-del-btn").addEventListener("click", () => {
    const n = loadNotes();
    n.splice(index, 1);
    saveNotes(n);
    render();
  });
  return card;
}

// ── Color scheme persistence ──────────────────────────────────────────────────
// Call loadCustomColors() in loadSettings(), saveCustomColors() when saving.
const COLOR_VARS = [
  "--bg-base",
  "--bg-surface",
  "--bg-raised",
  "--bg-input",
  "--accent",
  "--accent-hover",
  "--border",
  "--border-accent",
  "--text-primary",
  "--text-muted",
  "--text-dim",
  "--scrollbar-track",
  "--scrollbar-thumb",
  "--scrollbar-thumb-hover",
];

function saveCustomColors() {
  const overrides = {};
  COLOR_VARS.forEach((v) => {
    const val = document.documentElement.style.getPropertyValue(v).trim();
    if (val) overrides[v] = val;
  });
  localStorage.setItem("customColors", JSON.stringify(overrides));
}

function loadCustomColors() {
  try {
    const saved = JSON.parse(localStorage.getItem("customColors") || "{}");
    Object.entries(saved).forEach(([k, v]) =>
      document.documentElement.style.setProperty(k, v),
    );
  } catch {}
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
    saveCustomColors();
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

// ── Layout Editor System ─────────────────────────────────────────────────────
class LayoutEditor {
  static CORE = [
    {
      id: "webcast-section",
      label: "Webcasts",
      icon: "device-tv",
      lockedAspect: 16 / 11,
    },
    { id: "notes-section", label: "Pit Notes", icon: "notes" },
    { id: "match-section", label: "Matches", icon: "tournament" },
    { id: "leaderboard-section", label: "Leaderboard", icon: "trophy" },
  ];
  static ADDABLE = [
    {
      id: "notes-robot-health",
      label: "Robot Health",
      icon: "tool",
      noteType: "robot-health",
    },
    {
      id: "notes-battery",
      label: "Batteries",
      icon: "battery",
      noteType: "battery-manager",
    },
    {
      id: "notes-parts",
      label: "Parts",
      icon: "package",
      noteType: "parts-inventory",
    },
    {
      id: "notes-checkin",
      label: "Check-In",
      icon: "checklist",
      noteType: "pit-checkin",
    },
  ];

  constructor() {
    this.gridCols = config.gridCols || config.gridSize || 3;
    this.gridRows = config.gridRows || config.gridSize || 3;
    this.layout = JSON.parse(JSON.stringify(config.layout || {}));
    this.activeSections = new Set(config.additionalNoteSections || []);
    this.hiddenSections = new Set(config.hiddenSections || []);

    // Drag state
    this.draggingItem = null;
    this.dragOffX = 0;
    this.dragOffY = 0; // cursor offset within the cell
    // Resize state
    this.resizingItem = null;
    this.startX = 0;
    this.startY = 0;
    this.startW = 0;
    this.startH = 0;
    // Palette drag
    this.paletteDrag = null;

    // Snapshot of other items' positions at drag/resize START — never touched during move
    this._snapshot = {};

    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  get activeItems() {
    return [
      ...LayoutEditor.CORE,
      ...LayoutEditor.ADDABLE.filter((a) => this.activeSections.has(a.id)),
    ].filter((item) => !this.hiddenSections.has(item.id));
  }

  _cellSize() {
    const grid = document.getElementById("layoutGrid");
    if (!grid) return { cellW: 100, cellH: 100 };
    const r = grid.getBoundingClientRect();
    const gap = 8;
    return {
      cellW: (r.width - gap * (this.gridCols - 1)) / this.gridCols,
      cellH: (r.height - gap * (this.gridRows - 1)) / this.gridRows,
      r,
    };
  }

  _rectsOverlap(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  _clamp(p, cols, rows) {
    p.width = Math.max(1, Math.min(p.width, cols));
    p.height = Math.max(1, Math.min(p.height, rows));
    p.x = Math.max(0, Math.min(p.x, cols - p.width));
    p.y = Math.max(0, Math.min(p.y, rows - p.height));
  }

  _clampAll() {
    this.activeItems.forEach(({ id }) => {
      if (this.layout[id])
        this._clamp(this.layout[id], this.gridCols, this.gridRows);
    });
  }

  _snapAspect(id) {
    const item = this.activeItems.find((i) => i.id === id);
    if (!item?.lockedAspect) return;
    const { cellW, cellH } = this._cellSize();
    const p = this.layout[id];
    const pixelW = p.width * cellW + Math.max(0, p.width - 1) * 8;
    const idealH = pixelW / item.lockedAspect;
    const idealRows = idealH / (cellH + 8);
    p.height = Math.max(
      1,
      Math.min(Math.round(idealRows), this.gridRows - p.y),
    );
  }

  _ensurePos(id) {
    if (this.layout[id]) return;
    for (let y = 0; y <= this.gridRows - 1; y++) {
      for (let x = 0; x <= this.gridCols - 1; x++) {
        const c = { x, y, width: 1, height: 1 };
        if (
          !Object.entries(this.layout).some(
            ([oid, p]) => oid !== id && this._rectsOverlap(c, p),
          )
        ) {
          this.layout[id] = c;
          return;
        }
      }
    }
    this.layout[id] = { x: 0, y: 0, width: 1, height: 1 };
  }

  /**
   * Resolve overlaps FOR FINAL PLACEMENT ONLY (not during drag).
   * Uses snapshot positions for all items except movedId.
   * Items that conflict are pushed right → down → free scan.
   * Other items that were not conflicting are left at their original positions.
   */
  _resolveOverlapsOnDrop(movedId) {
    this._clamp(this.layout[movedId], this.gridCols, this.gridRows);
    const others = this.activeItems
      .map((i) => i.id)
      .filter((id) => id !== movedId);

    // Work on a mutable copy of positions; commit at the end
    const pos = {};
    pos[movedId] = { ...this.layout[movedId] };
    others.forEach((id) => {
      pos[id] = { ...(this._snapshot[id] || this.layout[id]) };
    });

    let dirty = true,
      safety = 40;
    while (dirty && safety-- > 0) {
      dirty = false;
      for (const oid of others) {
        const o = pos[oid];
        for (const fid of Object.keys(pos)) {
          if (fid === oid) continue;
          const f = pos[fid];
          if (!this._rectsOverlap(o, f)) continue;
          // Push right of f
          const rx = f.x + f.width;
          if (rx + o.width <= this.gridCols) {
            o.x = rx;
          } else {
            // Push below f
            const dy = f.y + f.height;
            if (dy + o.height <= this.gridRows) {
              o.y = dy;
              o.x = 0;
            } else {
              // Free scan
              let placed = false;
              outer: for (let y = 0; y <= this.gridRows - o.height; y++) {
                for (let x = 0; x <= this.gridCols - o.width; x++) {
                  const c = { x, y, width: o.width, height: o.height };
                  if (
                    !Object.keys(pos)
                      .filter((id) => id !== oid)
                      .some((id) => this._rectsOverlap(c, pos[id]))
                  ) {
                    o.x = x;
                    o.y = y;
                    placed = true;
                    break outer;
                  }
                }
              }
              if (!placed) {
                o.x = 0;
                o.y = 0;
              }
            }
          }
          this._clamp(o, this.gridCols, this.gridRows);
          dirty = true;
        }
      }
    }
    // Commit resolved positions
    Object.keys(pos).forEach((id) => {
      this.layout[id] = pos[id];
    });
  }

  // ── Open ─────────────────────────────────────────────────────────────────

  open() {
    const modal = document.getElementById("layoutEditorModal");
    modal.innerHTML = `
      <div class="le-shell">
        <div class="le-header">
          <h2 class="le-title">Layout Editor</h2>
          <div class="le-controls">
            <label>Cols<input type="number" id="leGridCols" min="2" max="12" value="${this.gridCols}" style="width:48px"></label>
            <label>Rows<input type="number" id="leGridRows" min="2" max="12" value="${this.gridRows}" style="width:48px"></label>
            <label>Element
              <select id="leColorEl">
                <option value="--bg-base">BG base</option>
                <option value="--bg-surface">BG surface</option>
                <option value="--bg-raised">BG raised</option>
                <option value="--bg-input">BG input</option>
                <option value="--accent">Accent</option>
                <option value="--accent-hover">Accent hover</option>
                <option value="--border">Border</option>
                <option value="--border-accent">Border accent</option>
                <option value="--text-primary">Text primary</option>
                <option value="--text-muted">Text muted</option>
                <option value="--text-dim">Text dim</option>
              </select>
            </label>
            <label>Color<input type="color" id="leColorPick" value="#ffffff"> <span id="leHex">#ffffff</span></label>
          </div>
          <div class="le-btns">
            <button class="btn-export" id="leExport">Export</button>
            <button class="btn-import" id="leImport">Import</button>
            <button class="btn-reset"  id="leReset">Reset</button>
            <button class="btn-close"  id="leClose">Save &amp; Close</button>
          </div>
        </div>
        <div class="le-body">
          <div class="le-palette" id="lePalette">
            <div class="le-palette-title">Drag to add</div>
            <div class="le-palette-list" id="lePaletteList"></div>
          </div>
          <div class="le-canvas">
            <div class="layout-grid" id="layoutGrid"></div>
          </div>
        </div>
      </div>
      <input type="file" id="leImportFile" accept=".json" style="display:none">
    `;
    modal.classList.add("active");
    this.activeItems.forEach(({ id }) => this._ensurePos(id));
    this._renderPalette();
    this._renderGrid();
    this._bindHeader();
    this._bindGlobalDrag();
  }

  // ── Palette ───────────────────────────────────────────────────────────────

  _renderPalette() {
    const list = document.getElementById("lePaletteList");
    list.innerHTML = "";
    const available = LayoutEditor.ADDABLE.filter(
      (a) => !this.activeSections.has(a.id),
    );
    const hiddenCore = LayoutEditor.CORE.filter((c) =>
      this.hiddenSections.has(c.id),
    );
    const all = [...hiddenCore, ...available];
    if (!all.length) {
      list.innerHTML = `<p class="le-palette-empty">All sections on grid.</p>`;
      return;
    }
    all.forEach((item) => {
      const el = document.createElement("div");
      el.className = "le-palette-item";
      el.draggable = true;
      el.innerHTML = `<i class="ti ti-${item.icon}" aria-hidden="true"></i>${item.label}`;
      el.addEventListener("dragstart", (e) => {
        this.paletteDrag = item;
        e.dataTransfer.effectAllowed = "copy";
      });
      el.addEventListener("dragend", () => {
        this.paletteDrag = null;
      });
      el.addEventListener(
        "touchstart",
        (e) => {
          this.paletteDrag = item;
          this._startPaletteTouchDrag(e, item, el);
        },
        { passive: false },
      );
      list.appendChild(el);
    });
  }

  _startPaletteTouchDrag(e, item, sourceEl) {
    e.preventDefault();
    const ghost = sourceEl.cloneNode(true);
    ghost.style.cssText = `position:fixed;opacity:0.7;pointer-events:none;z-index:9999;background:var(--bg-raised);padding:8px 12px;border-radius:6px;border:1px solid var(--border-accent);font-family:Rubik,sans-serif;font-size:0.8rem;color:var(--text-primary);`;
    document.body.appendChild(ghost);
    const move = (ev) => {
      const t = ev.touches[0];
      ghost.style.left = t.clientX - 40 + "px";
      ghost.style.top = t.clientY - 20 + "px";
    };
    const up = (ev) => {
      ghost.remove();
      const t = ev.changedTouches[0];
      const { cellW, cellH, r } = this._cellSize();
      const grid = document.getElementById("layoutGrid");
      if (
        grid &&
        t.clientX >= r.left &&
        t.clientX <= r.right &&
        t.clientY >= r.top &&
        t.clientY <= r.bottom
      ) {
        this._dropFromPalette(
          item,
          Math.floor((t.clientX - r.left) / (cellW + 8)),
          Math.floor((t.clientY - r.top) / (cellH + 8)),
        );
      }
      this.paletteDrag = null;
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend", up);
    };
    document.addEventListener("touchmove", move, { passive: false });
    document.addEventListener("touchend", up);
  }

  _dropFromPalette(item, gx, gy) {
    const x = Math.max(0, Math.min(gx, this.gridCols - 1));
    const y = Math.max(0, Math.min(gy, this.gridRows - 1));
    if (this.hiddenSections.has(item.id)) this.hiddenSections.delete(item.id);
    else if (!this.activeSections.has(item.id))
      this.activeSections.add(item.id);
    this.layout[item.id] = { x, y, width: 1, height: 1 };
    this._snapshot = {};
    this.activeItems.forEach(({ id }) => {
      this._snapshot[id] = { ...this.layout[id] };
    });
    this._resolveOverlapsOnDrop(item.id);
    this._renderPalette();
    this._renderGrid();
  }

  // ── Grid ─────────────────────────────────────────────────────────────────

  _renderGrid() {
    const grid = document.getElementById("layoutGrid");
    if (!grid) return;
    grid.style.gridTemplateColumns = `repeat(${this.gridCols}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${this.gridRows}, 1fr)`;
    grid.style.backgroundSize = `calc((100% + 8px) / ${this.gridCols}) calc((100% + 8px) / ${this.gridRows})`;

    grid.innerHTML = "";

    // Drop zone for palette drags
    grid.addEventListener("dragover", (e) => e.preventDefault());
    grid.addEventListener("drop", (e) => {
      if (!this.paletteDrag) return;
      const { cellW, cellH, r } = this._cellSize();
      this._dropFromPalette(
        this.paletteDrag,
        Math.floor((e.clientX - r.left) / (cellW + 8)),
        Math.floor((e.clientY - r.top) / (cellH + 8)),
      );
      this.paletteDrag = null;
    });

    this.activeItems.forEach(({ id, label, icon, lockedAspect }) => {
      this._snapAspect(id);
      const p = this.layout[id] || { x: 0, y: 0, width: 1, height: 1 };
      const el = document.createElement("div");
      el.className =
        "layout-item" + (lockedAspect ? " layout-item--locked-aspect" : "");
      el.id = `layout-${id}`;
      el.dataset.itemId = id;
      this._applyPos(el, p);

      el.innerHTML = `
        <div class="layout-item-header">
          <span><i class="ti ti-${icon}" aria-hidden="true"></i> ${label}</span>
          <div style="display:flex;align-items:center;gap:5px">
            ${lockedAspect ? `<span class="layout-item-aspect-badge">Locked</span>` : ""}
            <span class="layout-item-size">${p.width}×${p.height}</span>
            <button class="le-remove-btn" data-id="${id}" title="Remove" aria-label="Remove ${label}">×</button>
          </div>
        </div>
        <div class="layout-item-hint">${lockedAspect ? "Drag · resize right edge" : "Drag · resize corner"}</div>
        ${lockedAspect ? `<div class="resize-handle-width"></div>` : `<div class="resize-handle"></div>`}
      `;

      el.querySelector(".le-remove-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        this._removeItem(id);
      });

      el.addEventListener("mousedown", (e) => {
        if (e.target.closest(".le-remove-btn")) return;
        e.preventDefault();
        if (
          e.target.closest(".resize-handle") ||
          e.target.closest(".resize-handle-width")
        ) {
          this._startResize(e, id);
        } else {
          this._startDrag(e, id);
        }
      });

      el.addEventListener(
        "touchstart",
        (e) => {
          if (e.target.closest(".le-remove-btn")) return;
          const t = e.touches[0];
          if (
            e.target.closest(".resize-handle") ||
            e.target.closest(".resize-handle-width")
          ) {
            this._startResize(
              {
                clientX: t.clientX,
                clientY: t.clientY,
                preventDefault: () => e.preventDefault(),
              },
              id,
            );
          } else {
            this._startDrag({ clientX: t.clientX, clientY: t.clientY }, id);
            e.preventDefault();
          }
        },
        { passive: false },
      );

      grid.appendChild(el);
    });
  }

  _applyPos(el, p) {
    el.style.gridColumn = `${p.x + 1} / span ${p.width}`;
    el.style.gridRow = `${p.y + 1} / span ${p.height}`;
    const sz = el.querySelector(".layout-item-size");
    if (sz) sz.textContent = `${p.width}×${p.height}`;
  }

  // Only update CSS positions of ALL items — no DOM rebuild, no overlap resolution
  _refreshAll() {
    this.activeItems.forEach(({ id }) => {
      const el = document.getElementById(`layout-${id}`);
      if (el) this._applyPos(el, this.layout[id]);
    });
  }

  _removeItem(id) {
    if (LayoutEditor.CORE.some((c) => c.id === id)) {
      this.hiddenSections.add(id);
    } else {
      this.activeSections.delete(id);
      delete this.layout[id];
    }
    this._renderPalette();
    this._renderGrid();
  }

  // ── Drag ─────────────────────────────────────────────────────────────────
  // During drag: only move the dragged item visually (no overlap resolution).
  // On mouseup: resolve overlaps once against snapshot.

  _startDrag(e, id) {
    this.draggingItem = id;
    this.startX = e.clientX;
    this.startY = e.clientY;
    // Store all current positions so other items don't move during drag
    this._snapshot = {};
    this.activeItems.forEach(({ id: oid }) => {
      this._snapshot[oid] = { ...this.layout[oid] };
    });
    document.getElementById(`layout-${id}`)?.classList.add("dragging");
  }

  _onDragMove(e) {
    if (!this.draggingItem) return;
    const { cellW, cellH, r } = this._cellSize();
    const p = this.layout[this.draggingItem];
    const snap = this._snapshot[this.draggingItem];
    const newX = Math.max(
      0,
      Math.min(
        Math.floor((e.clientX - r.left) / (cellW + 8)),
        this.gridCols - p.width,
      ),
    );
    const newY = Math.max(
      0,
      Math.min(
        Math.floor((e.clientY - r.top) / (cellH + 8)),
        this.gridRows - p.height,
      ),
    );
    if (newX !== p.x || newY !== p.y) {
      p.x = newX;
      p.y = newY;
      // Restore all other items to their snapshot positions during drag
      this.activeItems.forEach(({ id }) => {
        if (id !== this.draggingItem && this._snapshot[id])
          this.layout[id] = { ...this._snapshot[id] };
      });
      // Only update CSS — no overlap resolution mid-drag
      this._refreshAll();
    }
  }

  _onDragEnd() {
    if (this.draggingItem) {
      // Now resolve overlaps once, from snapshot
      this._resolveOverlapsOnDrop(this.draggingItem);
      this._refreshAll();
      document
        .getElementById(`layout-${this.draggingItem}`)
        ?.classList.remove("dragging");
      this.draggingItem = null;
    }
    if (this.resizingItem) {
      this._resolveOverlapsOnDrop(this.resizingItem);
      this._refreshAll();
      document
        .getElementById(`layout-${this.resizingItem}`)
        ?.classList.remove("resizing");
      this.resizingItem = null;
    }
    this._snapshot = {};
  }

  // ── Resize ───────────────────────────────────────────────────────────────

  _startResize(e, id) {
    e.preventDefault?.();
    this.resizingItem = id;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startW = this.layout[id].width;
    this.startH = this.layout[id].height;
    this._snapshot = {};
    this.activeItems.forEach(({ id: oid }) => {
      this._snapshot[oid] = { ...this.layout[oid] };
    });
    document.getElementById(`layout-${id}`)?.classList.add("resizing");
  }

  _onResizeMove(e) {
    if (!this.resizingItem) return;
    const item = this.activeItems.find((i) => i.id === this.resizingItem);
    const { cellW, cellH } = this._cellSize();
    const unitW = cellW + 8,
      unitH = cellH + 8;
    const dx = Math.round((e.clientX - this.startX) / unitW);
    const dy = Math.round((e.clientY - this.startY) / unitH);
    const p = this.layout[this.resizingItem];
    const snap = this._snapshot[this.resizingItem];
    const newW = Math.max(1, Math.min(snap.width + dx, this.gridCols - snap.x));
    const newH = Math.max(
      1,
      Math.min(snap.height + dy, this.gridRows - snap.y),
    );

    if (newW !== p.width || (!item?.lockedAspect && newH !== p.height)) {
      p.width = newW;
      if (item?.lockedAspect) this._snapAspect(this.resizingItem);
      else p.height = newH;
      // Restore other items to snapshot during resize
      this.activeItems.forEach(({ id }) => {
        if (id !== this.resizingItem && this._snapshot[id])
          this.layout[id] = { ...this._snapshot[id] };
      });
      this._refreshAll();
    }
  }

  // ── Global handlers ───────────────────────────────────────────────────────

  _onMouseMove(e) {
    const pt = e.touches ? e.touches[0] : e;
    if (this.draggingItem) this._onDragMove(pt);
    else if (this.resizingItem) this._onResizeMove(pt);
  }

  _onMouseUp() {
    this._onDragEnd();
  }

  _bindGlobalDrag() {
    document.addEventListener("mousemove", this._onMouseMove);
    document.addEventListener("mouseup", this._onMouseUp);
    document.addEventListener("touchmove", this._onMouseMove, {
      passive: false,
    });
    document.addEventListener("touchend", this._onMouseUp);
  }

  _unbindGlobalDrag() {
    document.removeEventListener("mousemove", this._onMouseMove);
    document.removeEventListener("mouseup", this._onMouseUp);
    document.removeEventListener("touchmove", this._onMouseMove);
    document.removeEventListener("touchend", this._onMouseUp);
  }

  // ── Header ────────────────────────────────────────────────────────────────

  _bindHeader() {
    document.getElementById("leGridCols").addEventListener("input", (e) => {
      this.gridCols = Math.max(2, Math.min(12, parseInt(e.target.value) || 2));
      this._clampAll();
      this._renderGrid();
    });
    document.getElementById("leGridRows").addEventListener("input", (e) => {
      this.gridRows = Math.max(2, Math.min(12, parseInt(e.target.value) || 2));
      this._clampAll();
      this._renderGrid();
    });

    const picker = document.getElementById("leColorPick");
    const colorSel = document.getElementById("leColorEl");
    const hexSpan = document.getElementById("leHex");
    const rgb2hex = (rgb) => {
      const m = rgb.match(/\d+/g);
      return m
        ? "#" +
            m
              .slice(0, 3)
              .map((x) => parseInt(x).toString(16).padStart(2, "0"))
              .join("")
              .toUpperCase()
        : rgb;
    };

    const syncPicker = () => {
      let val = getComputedStyle(document.documentElement)
        .getPropertyValue(colorSel.value)
        .trim();
      if (val.startsWith("rgb")) val = rgb2hex(val);
      hexSpan.textContent = val;
      if (val.startsWith("#")) picker.value = val;
    };
    colorSel.addEventListener("change", syncPicker);
    syncPicker();

    picker.addEventListener("input", () => {
      hexSpan.textContent = picker.value;
      document.documentElement.style.setProperty(colorSel.value, picker.value);
    });

    document
      .getElementById("leExport")
      .addEventListener("click", () => this._export());
    document
      .getElementById("leImport")
      .addEventListener("click", () =>
        document.getElementById("leImportFile").click(),
      );
    document
      .getElementById("leImportFile")
      .addEventListener("change", (e) => this._import(e.target.files[0]));
    document
      .getElementById("leReset")
      .addEventListener("click", () => this._reset());
    document
      .getElementById("leClose")
      .addEventListener("click", () => this.close());
  }

  // ── Export / Import / Reset ───────────────────────────────────────────────

  _export() {
    const rootStyles = getComputedStyle(document.documentElement);
    const customColors = {};
    for (let i = 0; i < rootStyles.length; i++) {
      const p = rootStyles[i];
      if (p.startsWith("--"))
        customColors[p] = rootStyles.getPropertyValue(p).trim();
    }
    const blob = new Blob(
      [
        JSON.stringify(
          {
            version: "1.5",
            gridCols: this.gridCols,
            gridRows: this.gridRows,
            layout: this.layout,
            hiddenSections: [...this.hiddenSections],
            additionalNoteSections: [...this.activeSections],
            theme: config.theme,
            customColors,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `pitbeacon-layout-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    displayMessage("Layout exported!", "message");
  }

  _import(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        this.gridCols = data.gridCols || data.gridSize || 3;
        this.gridRows = data.gridRows || data.gridSize || 3;
        this.layout = data.layout || {};
        this.hiddenSections = new Set(data.hiddenSections || []);
        this.activeSections = new Set(data.additionalNoteSections || []);
        document.getElementById("leGridCols").value = this.gridCols;
        document.getElementById("leGridRows").value = this.gridRows;
        if (data.customColors) {
          Object.entries(data.customColors).forEach(([k, v]) =>
            document.documentElement.style.setProperty(k, v),
          );
          saveCustomColors();
        }
        this.activeItems.forEach(({ id }) => this._ensurePos(id));
        this._renderPalette();
        this._renderGrid();
        displayMessage("Layout imported!", "message");
      } catch (err) {
        displayMessage("Import failed: " + err.message, "error");
      }
    };
    reader.readAsText(file);
  }

  _reset() {
    if (!confirm("Reset layout to default?")) return;
    this.gridCols = 3;
    this.gridRows = 3;
    this.layout = {
      "webcast-section": { x: 0, y: 0, width: 1, height: 1 },
      "notes-section": { x: 0, y: 2, width: 1, height: 1 },
      "match-section": { x: 1, y: 0, width: 2, height: 2 },
      "leaderboard-section": { x: 1, y: 2, width: 2, height: 1 },
    };
    this.hiddenSections = new Set();
    this.activeSections = new Set();
    document.getElementById("leGridCols").value = 3;
    document.getElementById("leGridRows").value = 3;
    this._renderPalette();
    this._renderGrid();
    displayMessage("Layout reset", "message");
  }

  // ── Save & Close ──────────────────────────────────────────────────────────

  close() {
    config.gridCols = this.gridCols;
    config.gridRows = this.gridRows;
    config.gridSize = this.gridCols;
    config.layout = this.layout;
    config.hiddenSections = this.hiddenSections;
    config.additionalNoteSections = [...this.activeSections];
    localStorage.setItem("gridCols", this.gridCols);
    localStorage.setItem("gridRows", this.gridRows);
    localStorage.setItem("gridSize", this.gridCols);
    localStorage.setItem("layout", JSON.stringify(this.layout));
    localStorage.setItem(
      "hiddenSections",
      JSON.stringify([...this.hiddenSections]),
    );
    localStorage.setItem(
      "additionalNoteSections",
      JSON.stringify([...this.activeSections]),
    );
    // Save current color overrides
    saveCustomColors();
    this._unbindGlobalDrag();
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
  container.style.display = "grid";
  container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  container.style.gap = "12px";
  container.style.height = "calc(100vh - 4.5rem)";
  container.style.padding = "12px";

  const sectionIds = [
    "webcast-section",
    "notes-section",
    "match-section",
    "leaderboard-section",
    ...(config.additionalNoteSections || []),
  ];
  sectionIds.forEach((itemId) => {
    const elem = document.getElementById(itemId);
    if (!elem) return;
    if (config.hiddenSections?.has(itemId)) {
      elem.style.display = "none";
      return;
    }
    elem.style.display = "";
    const pos = config.layout?.[itemId] || { x: 0, y: 0, width: 1, height: 1 };
    elem.style.gridColumn = `${pos.x + 1} / span ${pos.width}`;
    elem.style.gridRow = `${pos.y + 1} / span ${pos.height}`;
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

  // Create additional note sections
  const noteTypeMap = {
    "notes-robot-health": "robot-health",
    "notes-battery": "battery-manager",
    "notes-parts": "parts-inventory",
    "notes-checkin": "pit-checkin",
  };

  config.additionalNoteSections?.forEach((sectionId) => {
    let section = document.getElementById(sectionId);
    if (!section) {
      section = document.createElement("div");
      section.id = sectionId;
      section.style.overflow = "auto";
      container.appendChild(section);
      const noteType = noteTypeMap[sectionId];
      setupNotesSection(section, noteType);
    }
  });

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
// Removed centralized interval in favor of individual timeouts per message

updateInterval();

pollInterval();

setupListeners();

// Apply custom layout after everything is set up

applyLayout();
