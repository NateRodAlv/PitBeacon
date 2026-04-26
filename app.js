import { config } from "./config.js";
const year = new Date().getFullYear();
let fullDate = new Date(); // Will be updated with test date if enabled

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

  if (savedTeamNumber) {
    config.teamNumber = savedTeamNumber;
    document.getElementById("teamNumber").value = savedTeamNumber;
  }
  if (savedApiKey) {
    config.tbaapikey = savedApiKey;
    document.getElementById("tbaapikey").value = savedApiKey;
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
    localStorage.setItem("teamNumber", config.teamNumber);
    localStorage.setItem("tbaapikey", config.tbaapikey);

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
  }
}

function updateMatchDisplay() {
  if (!currentMatches) return;

  // Get or create a dedicated webcast section (only built once)
  let leftColumn = document.getElementById("left-column");
  if (!leftColumn) {
    leftColumn = document.createElement("div");
    leftColumn.id = "left-column";
    container.appendChild(leftColumn);
  }

  let webcastSection = document.getElementById("webcast-section");
  if (!webcastSection) {
    webcastSection = document.createElement("div");
    webcastSection.id = "webcast-section";
    leftColumn.appendChild(webcastSection);
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
    leftColumn.appendChild(notesSection); // appended to leftColumn, not container
    setupNotesSection(notesSection);
  }
  //match leaderboard
  let leaderboardSection = document.getElementById("leaderboard-section");
  if (!leaderboardSection) {
    leaderboardSection = document.createElement("div");
    leaderboardSection.id = "leaderboard-section";
    container.appendChild(leaderboardSection);
  }
  updateLeaderboardDisplay();
  // Get or create a dedicated matches section (cleared freely)
  let matchSection = document.getElementById("match-section");
  if (!matchSection) {
    matchSection = document.createElement("div");
    matchSection.id = "match-section";
    container.appendChild(matchSection);
  }
  matchSection.innerHTML = ""; // ✅ Only clears matches, never touches the iframe

  // Sort matches by predicted_time to show closest to farthest
  const matches = [...currentMatches]; // Make a copy to avoid mutating
  matches.sort((a, b) => a.predicted_time - b.predicted_time);

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
      liveCard.innerHTML = `<h1 class="match-title">Match Live!</h1><p>Match: ${matches[j].comp_level.toUpperCase()} ${matches[j].match_number}</p>                <p>Est: ${new Date(matchStartTime * 1000).toLocaleTimeString()}</p>
              <p>Time Until: ${Math.max(0, Math.floor((matchStartTime - currentTime) / 60))} min ${Math.max(0, Math.floor((matchStartTime - currentTime) % 60))} sec</p>
             `;
      matchSection.appendChild(liveCard);

      for (let k = j + 1; k < matches.length; k++) {
        const upcomingCard = document.createElement("div");
        upcomingCard.className = "upcomingmatch-card";
        upcomingCard.innerHTML = `<h1 class="match-title">Upcoming Match</h1><p>Match: ${matches[k].comp_level.toUpperCase()} ${matches[k].match_number}</p>                <p>Est: ${new Date(matches[k].predicted_time * 1000).toLocaleTimeString()}</p>
              <p>Time Until: ${Math.max(0, Math.floor((matches[k].predicted_time - currentTime) / 60))} min ${Math.max(0, Math.floor((matches[k].predicted_time - currentTime) % 60))} sec</p>
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
      container.innerHTML = "<p>No upcoming matches today.</p>";
    }
    for (const match of upcoming) {
      const card = document.createElement("div");
      card.className = "upcomingmatch-card";
      card.innerHTML = `
      <h1 class="match-title">Upcoming Match</h1>
      <p>Match: ${match.comp_level.toUpperCase()} ${match.match_number}</p>
      <p>Est: ${new Date(match.predicted_time * 1000).toLocaleTimeString()}</p>
      <p>Time Until: ${Math.max(0, Math.floor((match.predicted_time - currentTime) / 60))} min ${Math.max(0, (match.predicted_time - currentTime) % 60)} sec</p>
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

// Set up polling every 30-60 seconds (randomized to avoid thundering herd)
const pollInterval = () => {
  const randomDelay = 30000 + Math.random() * 30000; // 30-60 seconds
  pollingInterval = setTimeout(() => {
    getData();
    pollInterval();
  }, randomDelay);
};
pollInterval();

setupListeners();
