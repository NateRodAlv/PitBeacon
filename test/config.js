export const config = {
    teamNumber: 7250,
    tbaapikey: 'YOUR_AUTH_KEY',
    noteAlarmToggle: false,
    noteAlarmThreshold: 8,
    noteAlarmSound: 'alarm1',
    matchAlarmToggle: true,
    matchAlertThreshold: 300,
    matchAlarmSound: 'alarm1',
    gridSize: 3,
    gridCols: 3,
    gridRows: 3,
    hiddenSections: [],
    layout: {
        'webcast-card': { x: 0, y: 0, width: 1, height: 2 },
        'battery-card': { x: 0, y: 2, width: 1, height: 1 },
        'match-card': { x: 1, y: 0, width: 2, height: 2 },
        'leaderboard-card': { x: 1, y: 2, width: 2, height: 1 },
    },
    activeProfileName: 'Default',
    layoutProfiles: {},
    autoSwapEnabled: false,
    autoSwapInterval: 30,
    
    defaultCards: [
        { id: 'webcast-card', label: 'Webcasts', icon: 'device-tv', lockedAspect: 16/11, selfRefresh: false, builtin: true },
        { id: 'match-card', label: 'Matches', icon: 'tournament', selfRefresh: false, builtin: true },
        { id: 'leaderboard-card', label: 'Leaderboard', icon: 'trophy', selfRefresh: false, builtin: true },
        { id: 'robot-health-card', label: 'Robot Health', icon: 'tool', selfRefresh: false, builtin: true },
        { id: 'battery-card', label: 'Batteries', icon: 'battery', selfRefresh: false, builtin: true },
        { id: 'parts-card', label: 'Parts Inventory', icon: 'package', selfRefresh: false, builtin: true },
        { id: 'checkin-card', label: 'Pit Check-In', icon: 'checklist', selfRefresh: false, builtin: true },
        { id: 'statbotics-card', label: 'Statbotics', icon: 'chart-bar', selfRefresh: false, builtin: true },
    ],
    
    developerCards: {},
};

export const CardSchema = {
    id: 'string',
    label: 'string',
    icon: 'string?',
    lockedAspect: 'number?',
    selfRefresh: 'boolean?',
    builtin: 'boolean?',
    developer: 'boolean?',  // true for user-created developer cards
    html: 'string?',        // for developer cards
    css: 'string?',         // for developer cards
    js: 'string?',          // for developer cards
    render: 'function?'     // for built-in cards
};

export const ProfileSchema = {
    name: 'string',
    gridCols: 'number',
    gridRows: 'number',
    layout: 'object',       // { cardId: { x, y, width, height } }
    hiddenCards: 'array',   // cardIds to hide
};

export const StateSchema = {
    currentMatches: 'array|null',
    currentEventData: 'object|null',
    currentRankings: 'array|null',
    lastMatchAlertId: 'string|null',
    fullDate: 'Date',
    teamNumber: 'number',
    isTestMode: 'boolean',
};