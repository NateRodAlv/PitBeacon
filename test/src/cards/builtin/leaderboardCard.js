// src/cards/builtin/leaderboardCard.js
export function createLeaderboardCard() {
    return {
        id: 'leaderboard-card',
        label: 'Leaderboard',
        icon: 'trophy',
        builtin: true,
        render: (element, state, sdk) => {
            const rankings = state.currentRankings || [];
            const teamNumber = sdk.getConfig('teamNumber');

            // Clear element and add a wrapper with background
            element.innerHTML = '';

            if (!rankings || !rankings.length) {
                element.innerHTML = `<p class="inactive" style="padding:20px;text-align:center;color:var(--text-dim);font-style:italic;">No rankings available.</p>`;
                return;
            }

            // Create wrapper with background
            const wrapper = document.createElement('div');

            const table = document.createElement('table');
            table.className = 'leaderboard-table';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Team</th>
                        <th>W-L-T</th>
                    </tr>
                </thead>
                <tbody>
                    ${rankings.map(entry => {
                        const tNum = entry.team_key.replace('frc', '');
                        const isMyTeam = tNum === String(teamNumber);
                        return `<tr class="${isMyTeam ? 'my-team' : ''}">
                            <td>${entry.rank}</td>
                            <td>${tNum}</td>
                            <td>${entry.record.wins}-${entry.record.losses}-${entry.record.ties}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            `;
            
            wrapper.appendChild(table);
            element.appendChild(wrapper);
        }
    };
}