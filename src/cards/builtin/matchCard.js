// src/cards/builtin/matchCard.js
export function createMatchCard() {
    return {
        id: 'match-card',
        label: 'Matches',
        icon: 'tournament',
        builtin: true,
        render: (element, state, sdk) => {
            const matches = state.currentMatches || [];
            const teamNumber = sdk.getTeamNumber();
            const currentTime = Math.floor(state.fullDate?.getTime() / 1000 || Date.now() / 1000);

            element.innerHTML = '';
            
            if (!matches.length) {
                element.innerHTML = `<p class="inactive">No matches found.</p>`;
                return;
            }

            const sorted = [...matches].sort((a, b) => a.predicted_time - b.predicted_time);
            
            const teamMatches = sorted.filter(match => 
                match.alliances.red.team_keys.includes(`frc${teamNumber}`) ||
                match.alliances.blue.team_keys.includes(`frc${teamNumber}`)
            );

            if (!teamMatches.length) {
                element.innerHTML = `<p class="inactive">No upcoming matches for team ${teamNumber}.</p>`;
                return;
            }

            const container = document.createElement('div');
            container.style.cssText = 'display:flex;flex-direction:column;gap:8px;padding:4px 0;';

            let foundActive = false;
            const bufferBefore = 300; // 5 minutes before
            const matchDuration = 150; // 2:30 match duration

            for (let i = 0; i < teamMatches.length; i++) {
                const match = teamMatches[i];
                const matchStartTime = match.predicted_time;
                const timeUntil = matchStartTime - currentTime;
                
                const isActive = currentTime >= matchStartTime - bufferBefore && 
                                 currentTime <= matchStartTime + matchDuration;

                if (isActive && !foundActive) {
                    foundActive = true;
                    const card = document.createElement('div');
                    card.className = 'match-card';
                    
                    const minutes = Math.max(0, Math.floor(timeUntil / 60));
                    const seconds = Math.max(0, Math.floor(timeUntil % 60));
                    const countdownClass = timeUntil < 30 ? 'countdown-urgent' : 'countdown-warning';
                    
                    card.innerHTML = `
                        <div class="upcoming-basicinfo">
                            <h1 class="match-title">⏰ Match Starting Soon!</h1>
                            <p>Match: ${match.comp_level.toUpperCase()} ${match.match_number}</p>
                            <p>Est: ${new Date(matchStartTime * 1000).toLocaleTimeString()}</p>
                            <p class="${countdownClass}">Time Until: ${minutes}m ${seconds}s</p>
                        </div>
                        <div class="upcoming-teams">
                            ${renderTeamAlliances(match, teamNumber)}
                        </div>
                    `;
                    container.appendChild(card);
                    
                    for (let j = i + 1; j < teamMatches.length; j++) {
                        const upcoming = teamMatches[j];
                        container.appendChild(createUpcomingCard(upcoming, currentTime, teamNumber));
                    }
                    break;
                }
            }

            if (!foundActive) {
                const futureMatches = teamMatches.filter(m => m.predicted_time > currentTime);
                if (futureMatches.length === 0) {
                    container.innerHTML = `<p class="inactive">No upcoming matches for team ${teamNumber}.</p>`;
                } else {
                    futureMatches.forEach(match => {
                        container.appendChild(createUpcomingCard(match, currentTime, teamNumber));
                    });
                }
            }

            element.appendChild(container);
        }
    };
}

// Helper: Render team alliances with user team highlighted
function renderTeamAlliances(match, teamNumber) {
    const redTeams = match.alliances.red.team_keys.map(t => t.replace('frc', ''));
    const blueTeams = match.alliances.blue.team_keys.map(t => t.replace('frc', ''));
    const userInRed = redTeams.includes(String(teamNumber));
    const userInBlue = blueTeams.includes(String(teamNumber));

    let html = '';

    // Show user team first if they're in red
    if (userInRed) {
        html += `<div class="alliance-row user-team"><p class="red highlight">${teamNumber}</p></div>`;
        // Show remaining red teams
        const remainingRed = redTeams.filter(t => t !== String(teamNumber));
        if (remainingRed.length) {
            html += `<div class="alliance-row">${remainingRed.map(t => `<p class="red">${t}</p>`).join('')}</div>`;
        }
    } else {
        // Show all red teams
        html += `<div class="alliance-row">${redTeams.map(t => `<p class="red">${t}</p>`).join('')}</div>`;
    }

    // Show user team if they're in blue
    if (userInBlue) {
        html += `<div class="alliance-row user-team"><p class="blue highlight">${teamNumber}</p></div>`;
        const remainingBlue = blueTeams.filter(t => t !== String(teamNumber));
        if (remainingBlue.length) {
            html += `<div class="alliance-row">${remainingBlue.map(t => `<p class="blue">${t}</p>`).join('')}</div>`;
        }
    } else {
        // Show all blue teams
        html += `<div class="alliance-row">${blueTeams.map(t => `<p class="blue">${t}</p>`).join('')}</div>`;
    }

    return html;
}

// Helper: Create an upcoming match card
function createUpcomingCard(match, currentTime, teamNumber) {
    const card = document.createElement('div');
    card.className = 'upcomingmatch-card';
    
    const timeUntil = Math.max(0, match.predicted_time - currentTime);
    const minutes = Math.floor(timeUntil / 60);
    const seconds = Math.floor(timeUntil % 60);
    
    card.innerHTML = `
        <div class="upcoming-basicinfo">
            <h1 class="match-title">Upcoming Match</h1>
            <p>Match: ${match.comp_level.toUpperCase()} ${match.match_number}</p>
            <p>Est: ${new Date(match.predicted_time * 1000).toLocaleTimeString()}</p>
            <p class="countdown-warning">Time Until: ${minutes}m ${seconds}s</p>
        </div>
        <div class="upcoming-teams">
            ${renderTeamAlliances(match, teamNumber)}
        </div>
    `;
    
    return card;
}