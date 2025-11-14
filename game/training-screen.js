// Training Screen
function loadTrainingScreen() {
    const character = gameState.selectedCharacter;
    const config = GAME_CONFIG.characters.find(c => c.id === character.id);
    const bonus = GAME_CONFIG.levelBonuses[character.level];

    // Initialize card grid if not exists
    if (!character.cardGrid) {
        character.cardGrid = generateCardGrid();
    }

    const flippedCount = character.flippedCards.filter(f => f).length;
    const canLevelUp = flippedCount >= GAME_CONFIG.cardsRequiredForLevelUp && character.level < GAME_CONFIG.maxLevel;

    renderTrainingScreen(character, config, bonus, flippedCount, canLevelUp);
}

// Generate card grid: 6 power cards, 3 blanks
function generateCardGrid() {
    const cards = [];

    // Add 6 power cards with random bonuses
    for (let i = 0; i < GAME_CONFIG.cardTypes.powerCards; i++) {
        const randomBonus = GAME_CONFIG.powerCardBonuses[Math.floor(Math.random() * GAME_CONFIG.powerCardBonuses.length)];
        const value = Math.floor(Math.random() * (randomBonus.max - randomBonus.min + 1)) + randomBonus.min;
        cards.push({
            type: 'power',
            stat: randomBonus.stat,
            value: value
        });
    }

    // Add 3 blank cards
    for (let i = 0; i < GAME_CONFIG.cardTypes.blankCards; i++) {
        cards.push({
            type: 'blank'
        });
    }

    // Shuffle the cards
    return cards.sort(() => Math.random() - 0.5);
}

function renderTrainingScreen(character, config, bonus, flippedCount, canLevelUp) {
    const container = document.getElementById('game-container');

    // Check if training screen already exists
    const existingTrainingScreen = container.querySelector('.training-screen');

    if (existingTrainingScreen) {
        // Update existing elements
        updateTrainingScreenElements(existingTrainingScreen, character, config, bonus, flippedCount, canLevelUp);
    } else {
        // Initial render - create full training screen
        renderFullTrainingScreen(container, character, config, bonus, flippedCount, canLevelUp);
    }
}

function updateTrainingScreenElements(trainingScreen, character, config, bonus, flippedCount, canLevelUp) {
    // Calculate current stats including card bonuses
    let totalHp = Math.floor(config.baseHp * bonus);
    let totalAttack = Math.floor(config.baseAttack * bonus);
    let totalDefense = Math.floor(config.baseDefense * bonus);
    let totalSpeed = Math.floor(config.baseSpeed * bonus);

    // Track card bonuses separately for display
    let cardAttackBonus = 0;
    let cardDefenseBonus = 0;
    let cardSpeedBonus = 0;

    // Add bonuses from flipped cards
    character.flippedCards.forEach((flipped, index) => {
        if (flipped && character.cardGrid[index].type === 'power') {
            const card = character.cardGrid[index];
            if (card.stat === 'attack') {
                totalAttack += card.value;
                cardAttackBonus += card.value;
            }
            if (card.stat === 'defense') {
                totalDefense += card.value;
                cardDefenseBonus += card.value;
            }
            if (card.stat === 'speed') {
                totalSpeed += card.value;
                cardSpeedBonus += card.value;
            }
        }
    });

    // Update stats display
    const statsDisplay = trainingScreen.querySelector('.stats-display');
    if (statsDisplay) {
        statsDisplay.innerHTML = `
            <div class="stat-item">HP: ${totalHp}</div>
            <div class="stat-item">ATK: ${totalAttack}${cardAttackBonus > 0 ? ` <span style="color: #10b981;">(+${cardAttackBonus})</span>` : ''}</div>
            <div class="stat-item">DEF: ${totalDefense}${cardDefenseBonus > 0 ? ` <span style="color: #10b981;">(+${cardDefenseBonus})</span>` : ''}</div>
            <div class="stat-item">SPD: ${totalSpeed}${cardSpeedBonus > 0 ? ` <span style="color: #10b981;">(+${cardSpeedBonus})</span>` : ''}</div>
        `;
    }

    // Update progress section
    const progressSection = trainingScreen.querySelector('.training-info-section');
    if (progressSection) {
        const progressDiv = progressSection.querySelector('div');
        if (progressDiv) {
            progressDiv.innerHTML = `
                Cards: ${flippedCount}/9 | Tokens: ${gameState.flipPoints}
                ${canLevelUp ? '<br><span style="color: #10b981; font-weight: 900;">✓ Ready to Level Up!</span>' : `<br>Need ${GAME_CONFIG.cardsRequiredForLevelUp - flippedCount} more cards`}
            `;
        }
    }

    // Update individual cards (only update changed cards)
    const cardElements = trainingScreen.querySelectorAll('.card');
    character.flippedCards.forEach((flipped, index) => {
        const cardElement = cardElements[index];
        if (!cardElement) return;

        const wasFlipped = cardElement.classList.contains('flipped');
        if (flipped && !wasFlipped) {
            // Card was just flipped - update it
            const card = character.cardGrid[index];
            cardElement.classList.add('flipped');

            if (card.type === 'blank') {
                cardElement.classList.add('blank-card');
                cardElement.innerHTML = '<span style="font-size: 40px; color: #000;">—</span>';
            } else {
                const iconPath = card.stat === 'attack' ? 'images/icon-attack.png' :
                                 card.stat === 'defense' ? 'images/icon-defense.png' :
                                 'images/icon-speed.png';
                cardElement.innerHTML = `
                    <img src="${iconPath}" alt="${card.stat}" class="card-icon">
                    <div class="card-value">+${card.value}</div>
                `;
            }
        }
    });

    // Update action buttons
    const trainingActions = trainingScreen.querySelector('.training-actions');
    if (trainingActions) {
        trainingActions.innerHTML = `
            <button class="btn btn-secondary" onclick="exitTraining()">Back</button>
            ${canLevelUp ? '<button class="btn btn-success" onclick="levelUpCharacter()">Level Up!</button>' : ''}
            <button class="btn btn-primary" onclick="selectCharacterAndExit()">Select</button>
        `;
    }
}

function renderFullTrainingScreen(container, character, config, bonus, flippedCount, canLevelUp) {
    // Calculate current stats including card bonuses
    let totalHp = Math.floor(config.baseHp * bonus);
    let totalAttack = Math.floor(config.baseAttack * bonus);
    let totalDefense = Math.floor(config.baseDefense * bonus);
    let totalSpeed = Math.floor(config.baseSpeed * bonus);

    // Track card bonuses separately for display
    let cardAttackBonus = 0;
    let cardDefenseBonus = 0;
    let cardSpeedBonus = 0;

    // Add bonuses from flipped cards
    character.flippedCards.forEach((flipped, index) => {
        if (flipped && character.cardGrid[index].type === 'power') {
            const card = character.cardGrid[index];
            if (card.stat === 'attack') {
                totalAttack += card.value;
                cardAttackBonus += card.value;
            }
            if (card.stat === 'defense') {
                totalDefense += card.value;
                cardDefenseBonus += card.value;
            }
            if (card.stat === 'speed') {
                totalSpeed += card.value;
                cardSpeedBonus += card.value;
            }
        }
    });

    const cardsHTML = character.flippedCards.map((flipped, index) => {
        const card = character.cardGrid[index];
        let cardContent = '';

        if (flipped) {
            if (card.type === 'blank') {
                cardContent = '<span style="font-size: 40px; color: #000;">—</span>';
            } else {
                const iconPath = card.stat === 'attack' ? 'images/icon-attack.png' :
                                 card.stat === 'defense' ? 'images/icon-defense.png' :
                                 'images/icon-speed.png';
                cardContent = `
                    <img src="${iconPath}" alt="${card.stat}" class="card-icon">
                    <div class="card-value">+${card.value}</div>
                `;
            }
        }

        return `
            <div class="card ${flipped ? 'flipped' : ''} ${flipped && card.type === 'blank' ? 'blank-card' : ''}"
                 onclick="flipCard(${index})">
                ${cardContent}
            </div>
        `;
    }).join('');

    // Get unlocked moves for this level
    const unlockedMoves = config.moves.slice(0, character.level);

    container.innerHTML = `
        <div class="training-screen fade-in">
            <h2>Training - ${config.name} (Lvl ${character.level})</h2>

            <div class="character-info">
                <img src="${config.images[character.level]}" alt="${config.name}" class="character-portrait" style="width: 100%; max-width: 200px; margin: 0 auto 12px; display: block;">
                <div class="stats-display">
                    <div class="stat-item">HP: ${totalHp}</div>
                    <div class="stat-item">ATK: ${totalAttack}${cardAttackBonus > 0 ? ` <span style="color: #10b981;">(+${cardAttackBonus})</span>` : ''}</div>
                    <div class="stat-item">DEF: ${totalDefense}${cardDefenseBonus > 0 ? ` <span style="color: #10b981;">(+${cardDefenseBonus})</span>` : ''}</div>
                    <div class="stat-item">SPD: ${totalSpeed}${cardSpeedBonus > 0 ? ` <span style="color: #10b981;">(+${cardSpeedBonus})</span>` : ''}</div>
                </div>
                <div class="training-info-section">
                    <strong>📊 Progress</strong>
                    <div style="margin: 4px 0; font-size: 13px;">
                        Cards: ${flippedCount}/9 | Tokens: ${gameState.flipPoints}
                        ${canLevelUp ? '<br><span style="color: #10b981; font-weight: 900;">✓ Ready to Level Up!</span>' : `<br>Need ${GAME_CONFIG.cardsRequiredForLevelUp - flippedCount} more cards`}
                    </div>
                </div>
                <div class="training-info-section">
                    <strong>⚔️ Moves (${unlockedMoves.length})</strong>
                    <ul>
                        ${unlockedMoves.map(m => `<li>• ${m.name} (${m.accuracy}%)</li>`).join('')}
                    </ul>
                </div>
                <div class="training-info-section" style="border-bottom: 2px solid #000; padding-bottom: 8px;">
                    <strong>💡 Tip</strong>
                    <div style="font-size: 11px; line-height: 1.3;">
                        Flip cost increases each time (1→2→3...). Power cards give stat bonuses!
                    </div>
                </div>
            </div>

            <div class="card-grid">
                ${cardsHTML}
            </div>

            <div class="training-actions">
                <button class="btn btn-secondary" onclick="exitTraining()">Back</button>
                ${canLevelUp ? '<button class="btn btn-success" onclick="levelUpCharacter()">Level Up!</button>' : ''}
                <button class="btn btn-primary" onclick="selectCharacterAndExit()">Select</button>
            </div>
        </div>
    `;
}

function flipCard(cardIndex) {
    const character = gameState.selectedCharacter;

    // Check if already flipped
    if (character.flippedCards[cardIndex]) {
        return;
    }

    // Calculate flip cost (1st = 1, 2nd = 2, 3rd = 3, etc.)
    const flippedCount = character.flippedCards.filter(f => f).length;
    const flipCost = flippedCount + 1;

    // Check if enough flip points
    if (gameState.flipPoints < flipCost) {
        showError('Not Enough Tokens!', `You need ${flipCost} flip tokens but only have ${gameState.flipPoints}.`);
        return;
    }

    // Flip the card
    character.flippedCards[cardIndex] = true;
    gameState.flipPoints -= flipCost;

    // Get the card that was flipped
    const card = character.cardGrid[cardIndex];

    // Save game state
    saveGameState(gameState);

    // Re-render
    loadTrainingScreen();

    // Show feedback based on what was flipped
    setTimeout(() => {
        if (card.type === 'blank') {
            showInfo('❌ Blank Card! No bonus gained.', 2000);
        } else {
            const statName = card.stat.charAt(0).toUpperCase() + card.stat.slice(1);
            showSuccess(
                '✨ Power Card!',
                `<strong>+${card.value} ${statName}</strong> added to your stats!`,
                2500
            );
        }
    }, 300);
}

function levelUpCharacter() {
    const character = gameState.selectedCharacter;

    if (character.level >= GAME_CONFIG.maxLevel) {
        showWarning('Max Level Reached', 'This character is already at maximum level!');
        return;
    }

    const flippedCount = character.flippedCards.filter(f => f).length;
    if (flippedCount < GAME_CONFIG.cardsRequiredForLevelUp) {
        showWarning('Cannot Level Up', `You need at least ${GAME_CONFIG.cardsRequiredForLevelUp} cards flipped to level up!<br>Current: ${flippedCount}/${GAME_CONFIG.cardsRequiredForLevelUp}`);
        return;
    }

    // Level up
    character.level++;

    // Reset cards and generate new grid
    character.flippedCards = Array(GAME_CONFIG.totalCards).fill(false);
    character.cardGrid = generateCardGrid();

    const config = GAME_CONFIG.characters.find(c => c.id === character.id);

    // Save game state first
    saveGameState(gameState);

    // Show celebration notification
    showSuccess(
        'Level Up!',
        `<strong>${config.name}</strong> leveled up to Level ${character.level}!<br><br>New move unlocked: <strong>${config.moves[character.level - 1].name}</strong>`,
        0  // Don't auto-close, require button click
    );

    // Re-render
    loadTrainingScreen();
}

function exitTraining() {
    loadCharacterGallery();
}

function selectCharacterAndExit() {
    // Set as current character
    gameState.currentCharacter = gameState.selectedCharacter;

    // Save game state
    saveGameState(gameState);

    loadCharacterGallery();
}
