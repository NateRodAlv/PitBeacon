/** The focused 3x3 layout a fresh install starts with and what "Reset layout" restores. */
export const DEFAULT_LAYOUT = {
  "webcast-card": { x: 0, y: 0, width: 1, height: 1 },
  "pit-notes-card": { x: 0, y: 2, width: 1, height: 1 },
  "match-card": { x: 2, y: 0, width: 1, height: 3 },
};

export const config = {
  teamNumber: 7250,
  tbaapikey: "YOUR_AUTH_KEY",
  match13apikey: "",
  match13ProxyUrl: "https://pitbeacon.rodriguezalvaradonathan.workers.dev",
  noteAlarmToggle: false,
  noteAlarmThreshold: 8,
  noteAlarmSound: "alarm1",
  matchAlarmToggle: true,
  matchAlertThreshold: 300,
  showNextMatchBanner: true,
  showCardStatusDots: true,
  matchAlarmSound: "alarm1",
  gridSize: 3,
  gridCols: 3,
  gridRows: 3,
  hiddenSections: [],
  layout: structuredClone(DEFAULT_LAYOUT),
  activeProfileName: "Default",
  layoutProfiles: {},
  autoSwapEnabled: false,
  autoSwapInterval: 30,
  supabaseUrl: "https://mbojqtezmtngsehtyzpa.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ib2pxdGV6bXRuZ3NlaHR5enBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNzcxNjAsImV4cCI6MjEwMzk1MzE2MH0.5PArCN5Nz9Aubc2t5iPas4qlo9oLDWxyJ8tMC_e7h90",
  cardSubmitFunctionUrl: "https://mbojqtezmtngsehtyzpa.supabase.co/functions/v1/index",

  defaultCards: [
    {
      id: "webcast-card",
      label: "Webcasts",
      icon: "device-tv",
      lockedAspect: 16 / 11,
      selfRefresh: false,
      builtin: true,
    },
    {
      id: "match-card",
      label: "Matches",
      icon: "tournament",
      selfRefresh: false,
      builtin: true,
    },
    {
      id: "leaderboard-card",
      label: "Leaderboard",
      icon: "trophy",
      selfRefresh: false,
      builtin: true,
    },
    {
      id: "pit-notes-card",
      label: "Pit Notes",
      icon: "tool",
      selfRefresh: false,
      builtin: true,
    },
    {
      id: "robot-viewer-card",
      label: "3D Robot Viewer",
      icon: "cube",
      selfRefresh: true,
      builtin: true,
    },
    {
      id: "stats-card",
      label: "Team Stats",
      icon: "chart-bar",
      selfRefresh: false,
      builtin: true,
    },
    {
      id: "robot-summary-card",
      label: "Robot Summary",
      icon: "checklist",
      selfRefresh: false,
      builtin: true,
    },
  ],

  developerCards: {},
};

export const CardSchema = {
  id: "string",
  label: "string",
  icon: "string?",
  lockedAspect: "number?",
  selfRefresh: "boolean?",
  builtin: "boolean?",
  developer: "boolean?", // true for user-created developer cards
  settings: "object?",
  settingsValues: "object?",
  html: "string?", // for developer cards
  css: "string?", // for developer cards
  js: "string?", // for developer cards
  render: "function?", // for built-in cards
};

export const ProfileSchema = {
  name: "string",
  enabled: "boolean",
  gridCols: "number",
  gridRows: "number",
  layout: "object", // { cardId: { x, y, width, height } }
  hiddenCards: "array", // cardIds to hide
};

export const StateSchema = {
  currentMatches: "array|null",
  currentEventData: "object|null",
  currentRankings: "array|null",
  lastMatchAlertId: "string|null",
  fullDate: "Date",
  teamNumber: "number",
  isTestMode: "boolean",
};
