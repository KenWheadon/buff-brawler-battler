// Results Screen
function loadResultsScreen(playerWon) {
    const container = document.getElementById('game-container');

    // Check if results screen already exists
    const existingResults = container.querySelector('.results-screen');

    if (existingResults) {
        // Update existing elements
        updateResultsScreenElements(existingResults, playerWon);
    } else {
        // Initial render - create full results screen
        renderFullResultsScreen(container, playerWon);
    }
}

function updateResultsScreenElements(resultsScreen, playerWon) {
    const monster = gameState.currentMonster;
    const resultClass = playerWon ? 'victory' : 'defeat';
    const resultTitle = playerWon ? 'VICTORY!' : 'DEFEAT';

    // Update result class
    resultsScreen.className = `results-screen ${resultClass} fade-in`;

    // Update title
    const titleElement = resultsScreen.querySelector('h2');
    if (titleElement) {
        titleElement.textContent = resultTitle;
    }

    // Calculate tokens earned
    let tokensEarned = 0;
    if (playerWon) {
        tokensEarned = monster.isBoss ? GAME_CONFIG.tokenRewards.bossWin : GAME_CONFIG.tokenRewards.waveWin;
    }

    const waveText = monster.isBoss ? 'Boss Fight' : `Wave ${gameState.currentWave}`;

    // Update results info
    const resultsInfo = resultsScreen.querySelector('.results-info');
    if (resultsInfo) {
        resultsInfo.innerHTML = `
            <p><strong>${waveText}:</strong> ${monster.name}</p>
            ${playerWon ? `
                <p><strong>Flip Tokens Earned:</strong> ${tokensEarned}</p>
                <p style="margin-top: 20px;"><strong>Total Flip Tokens:</strong> ${gameState.flipPoints}</p>
                ${monster.isBoss && gameState.characters.find(c => c.id === 2).unlocked ? '<p style="color: #ffa500; margin-top: 10px;">Bear already unlocked!</p>' : ''}
            ` : `
                <p>You were defeated...</p>
                <p>Return to the menu to spend your tokens!</p>
                <p style="margin-top: 20px;"><strong>Total Flip Tokens:</strong> ${gameState.flipPoints}</p>
            `}
        `;
    }

    // Update action buttons
    const resultsActions = resultsScreen.querySelector('.results-actions');
    if (resultsActions) {
        let actionsHTML;
        if (playerWon) {
            if (monster.isBoss) {
                const bearChar = gameState.characters.find(c => c.id === 2);
                const canCapture = !bearChar.unlocked;
                actionsHTML = `
                    ${canCapture ? '<button class="btn btn-success" onclick="captureMonster()">Capture Bear</button>' : ''}
                    <button class="btn btn-secondary" onclick="returnToMenu()">End Run</button>
                `;
            } else {
                actionsHTML = `
                    <button class="btn btn-primary" onclick="continueToNextWave()">Next Wave</button>
                    <button class="btn btn-secondary" onclick="returnToMenu()">End Run</button>
                `;
            }
        } else {
            actionsHTML = `
                <button class="btn btn-secondary" onclick="returnToMenu()">Return to Menu</button>
            `;
        }
        resultsActions.innerHTML = actionsHTML;
    }
}

function renderFullResultsScreen(container, playerWon) {
    const monster = gameState.currentMonster;

    const resultClass = playerWon ? 'victory' : 'defeat';
    const resultTitle = playerWon ? 'VICTORY!' : 'DEFEAT';

    // Calculate tokens earned
    let tokensEarned = 0;
    if (playerWon) {
        tokensEarned = monster.isBoss ? GAME_CONFIG.tokenRewards.bossWin : GAME_CONFIG.tokenRewards.waveWin;
    }

    let actionsHTML;
    if (playerWon) {
        if (monster.isBoss) {
            // Boss fight - option to capture or continue
            const bearChar = gameState.characters.find(c => c.id === 2);
            const canCapture = !bearChar.unlocked;

            actionsHTML = `
                ${canCapture ? '<button class="btn btn-success" onclick="captureMonster()">Capture Bear</button>' : ''}
                <button class="btn btn-secondary" onclick="returnToMenu()">End Run</button>
            `;
        } else {
            // Wave fight - option to continue to next wave or return to menu
            actionsHTML = `
                <button class="btn btn-primary" onclick="continueToNextWave()">Next Wave</button>
                <button class="btn btn-secondary" onclick="returnToMenu()">End Run</button>
            `;
        }
    } else {
        // Lost - return to menu
        actionsHTML = `
            <button class="btn btn-secondary" onclick="returnToMenu()">Return to Menu</button>
        `;
    }

    const waveText = monster.isBoss ? 'Boss Fight' : `Wave ${gameState.currentWave}`;

    container.innerHTML = `
        <div class="results-screen ${resultClass} fade-in">
            <h2>${resultTitle}</h2>

            <div class="results-info">
                <p><strong>${waveText}:</strong> ${monster.name}</p>
                ${playerWon ? `
                    <p><strong>Flip Tokens Earned:</strong> ${tokensEarned}</p>
                    <p style="margin-top: 20px;"><strong>Total Flip Tokens:</strong> ${gameState.flipPoints}</p>
                    ${monster.isBoss && gameState.characters.find(c => c.id === 2).unlocked ? '<p style="color: #ffa500; margin-top: 10px;">Bear already unlocked!</p>' : ''}
                ` : `
                    <p>You were defeated...</p>
                    <p>Return to the menu to spend your tokens!</p>
                    <p style="margin-top: 20px;"><strong>Total Flip Tokens:</strong> ${gameState.flipPoints}</p>
                `}
            </div>

            <div class="results-actions">
                ${actionsHTML}
            </div>
        </div>
    `;
}

function captureMonster() {
    // Unlock Bear character
    const bearChar = gameState.characters.find(c => c.id === 2);

    if (bearChar && !bearChar.unlocked) {
        bearChar.unlocked = true;
        alert('You captured the Bear Boss and unlocked Bear as a playable character!');

        // Save game state
        saveGameState(gameState);
    }

    // End the run
    returnToMenu();
}

function continueToNextWave() {
    // Increment wave counter
    if (!gameState.currentWave) {
        gameState.currentWave = 1;
    }
    gameState.currentWave++;

    // Check if it's time for boss
    if (gameState.currentWave > 3) {
        // Start boss fight
        startBossFight();
    } else {
        // Start next wave
        startWave(gameState.currentWave);
    }
}

function startWave(waveNumber) {
    // Get the wave enemy (1, 2, or 3)
    const waveIndex = Math.min(waveNumber - 1, 2);
    const enemy = GAME_CONFIG.waveEnemies[waveIndex];

    gameState.currentMonster = {
        ...enemy,
        isBoss: false
    };

    loadCombatScreen();
}

function startBossFight() {
    const boss = GAME_CONFIG.boss;

    // Apply boss multiplier to stats
    gameState.currentMonster = {
        id: boss.id,
        name: boss.name,
        hp: Math.floor(boss.baseHp * boss.statsMultiplier),
        attack: Math.floor(boss.baseAttack * boss.statsMultiplier),
        defense: Math.floor(boss.baseDefense * boss.statsMultiplier),
        speed: Math.floor(boss.baseSpeed * boss.statsMultiplier),
        moves: boss.moves,
        image: boss.image,
        icon: boss.icon,
        isBoss: true
    };

    loadCombatScreen();
}

function returnToMenu() {
    // Reset wave counter
    gameState.currentWave = 0;

    // Save game state
    saveGameState(gameState);

    loadTitleScreen();
}
