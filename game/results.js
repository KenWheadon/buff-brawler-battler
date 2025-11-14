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
                const levelConfig = GAME_CONFIG.levels.find(l => l.id === gameState.currentLevel);
                const unlockCharId = levelConfig?.boss?.unlocksCharacterId;
                const unlockChar = unlockCharId ? gameState.characters.find(c => c.id === unlockCharId) : null;
                const canCapture = unlockChar && !unlockChar.unlocked;

                // Check if there's a next level
                const hasNextLevel = GAME_CONFIG.levels.find(l => l.id === gameState.currentLevel + 1);

                actionsHTML = `
                    ${canCapture ? '<button class="btn btn-success" onclick="captureMonster()">Capture ' + (levelConfig?.boss?.name || 'Boss') + '</button>' : ''}
                    ${hasNextLevel ? '<button class="btn btn-primary" onclick="continueToNextLevel()">Next Level</button>' : ''}
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
            // Boss fight - option to capture or continue to next level
            const levelConfig = GAME_CONFIG.levels.find(l => l.id === gameState.currentLevel);
            const unlockCharId = levelConfig?.boss?.unlocksCharacterId;
            const unlockChar = unlockCharId ? gameState.characters.find(c => c.id === unlockCharId) : null;
            const canCapture = unlockChar && !unlockChar.unlocked;

            // Check if there's a next level
            const hasNextLevel = GAME_CONFIG.levels.find(l => l.id === gameState.currentLevel + 1);

            actionsHTML = `
                ${canCapture ? '<button class="btn btn-success" onclick="captureMonster()">Capture ' + (levelConfig?.boss?.name || 'Boss') + '</button>' : ''}
                ${hasNextLevel ? '<button class="btn btn-primary" onclick="continueToNextLevel()">Next Level</button>' : ''}
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
    // Get the current level's boss to find which character to unlock
    const levelConfig = GAME_CONFIG.levels.find(l => l.id === gameState.currentLevel);
    if (!levelConfig || !levelConfig.boss.unlocksCharacterId) {
        // No character to unlock, just return to menu
        returnToMenu();
        return;
    }

    const unlockedCharId = levelConfig.boss.unlocksCharacterId;
    const unlockedChar = gameState.characters.find(c => c.id === unlockedCharId);

    if (unlockedChar && !unlockedChar.unlocked) {
        unlockedChar.unlocked = true;

        const charConfig = GAME_CONFIG.characters.find(c => c.id === unlockedCharId);

        // Check for trophy unlocks
        checkCharacterUnlockTrophies(unlockedChar.id);

        // Save game state
        saveGameState(gameState);

        // Show celebration notification
        showSuccess(
            'Character Unlocked!',
            `You captured the ${levelConfig.boss.name} and unlocked <strong>${charConfig.name}</strong> as a playable character!<br><br>Check the character gallery to train and play as ${charConfig.name}!`,
            0  // Don't auto-close, require button click
        );

        // Delay returning to menu until notification is dismissed
        setTimeout(() => {
            // The notification OK button will handle the timing
        }, 100);
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
    // Get current level config
    const levelConfig = GAME_CONFIG.levels.find(l => l.id === gameState.currentLevel) || GAME_CONFIG.levels[0];

    // Get the wave enemy (1, 2, or 3)
    const waveIndex = Math.min(waveNumber - 1, 2);
    const enemy = levelConfig.waveEnemies[waveIndex];

    gameState.currentMonster = {
        ...enemy,
        isBoss: false
    };

    loadCombatScreen();
}

function startBossFight() {
    // Get current level config
    const levelConfig = GAME_CONFIG.levels.find(l => l.id === gameState.currentLevel) || GAME_CONFIG.levels[0];
    const boss = levelConfig.boss;

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

function continueToNextLevel() {
    // Increment to next level
    gameState.currentLevel++;

    // Check if the next level exists
    const nextLevelConfig = GAME_CONFIG.levels.find(l => l.id === gameState.currentLevel);
    if (!nextLevelConfig) {
        // No more levels - return to menu
        returnToMenu();
        return;
    }

    // Reset wave counter and start wave 1 of the new level
    gameState.currentWave = 1;

    // Get first wave enemy of the new level
    const enemy = nextLevelConfig.waveEnemies[0];

    gameState.currentMonster = {
        ...enemy,
        isBoss: false
    };

    loadCombatScreen();
}

function returnToMenu() {
    // Reset wave counter and level
    gameState.currentWave = 0;
    gameState.currentLevel = 1;

    // Save game state
    saveGameState(gameState);

    loadTitleScreen();
}
