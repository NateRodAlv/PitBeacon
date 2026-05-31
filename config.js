export const config = {
    teamNumber: 7250,
    tbaapikey: 'YOUR_AUTH_KEY',
    theme: 'dark',
    noteAlarmToggle: false,
    noteAlarmThreshold: 8,
    noteAlarmSound: 'alarm1',
    matchAlarmToggle: true,
    matchAlertThreshold: 300, // seconds before match start
    matchAlarmSound: 'alarm1',
    gridSize: 3, // default 3x3 grid
    additionalNoteSections: [], // Array of section IDs like ['notes-robot-health', 'notes-battery', ...]
    hiddenSections: new Set(), // Track which sections are hidden
    layout: {
        'webcast-section': { x: 0, y: 0, width: 1, height: 2 },
        'notes-section': { x: 0, y: 2, width: 1, height: 1 },
        'match-section': { x: 1, y: 0, width: 2, height: 2 },
        'leaderboard-section': { x: 1, y: 2, width: 2, height: 1 },
    }
}