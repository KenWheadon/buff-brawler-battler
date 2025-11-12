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
    const nextFlipCost = flippedCount + 1;

    // Calculate current stats including card bonuses
    let totalHp = Math.floor(config.baseHp * bonus);
    let totalAttack = Math.floor(config.baseAttack * bonus);
    let totalDefense = Math.floor(config.baseDefense * bonus);
    let totalSpeed = Math.floor(config.baseSpeed * bonus);

    // Add bonuses from flipped cards
    character.flippedCards.forEach((flipped, index) => {
        if (flipped && character.cardGrid[index].type === 'power') {
            const card = character.cardGrid[index];
            if (card.stat === 'attack') totalAttack += card.value;
            if (card.stat === 'defense') totalDefense += card.value;
            if (card.stat === 'speed') totalSpeed += card.value;
        }
    });

    // Update stats display
    const statsDisplay = trainingScreen.querySelector('.stats-display');
    if (statsDisplay) {
        statsDisplay.innerHTML = `
            <div class="stat-item">HP: ${totalHp}</div>
            <div class="stat-item">Attack: ${totalAttack}</div>
            <div class="stat-item">Defense: ${totalDefense}</div>
            <div class="stat-item">Speed: ${totalSpeed}</div>
        `;
    }

    // Update flip points
    const flipPoints = trainingScreen.querySelector('.flip-points');
    if (flipPoints) {
        flipPoints.innerHTML = `
            Flip Tokens: ${gameState.flipPoints}
            ${flippedCount < 9 ? `<br><small>Next flip costs: ${nextFlipCost}</small>` : ''}
        `;
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
                cardElement.innerHTML = '<span style="font-size: 48px; color: #000;">—</span>';
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

    // Update cards flipped counter
    const cardsFlippedText = trainingScreen.querySelector('.text-center.mb-20');
    if (cardsFlippedText) {
        cardsFlippedText.innerHTML = `
            Cards Flipped: ${flippedCount}/9
            ${canLevelUp ? '<br><strong style="color: #28a745;">Ready to Level Up!</strong>' : ''}
        `;
    }

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
    const nextFlipCost = flippedCount + 1;

    // Calculate current stats including card bonuses
    let totalHp = Math.floor(config.baseHp * bonus);
    let totalAttack = Math.floor(config.baseAttack * bonus);
    let totalDefense = Math.floor(config.baseDefense * bonus);
    let totalSpeed = Math.floor(config.baseSpeed * bonus);

    // Add bonuses from flipped cards
    character.flippedCards.forEach((flipped, index) => {
        if (flipped && character.cardGrid[index].type === 'power') {
            const card = character.cardGrid[index];
            if (card.stat === 'attack') totalAttack += card.value;
            if (card.stat === 'defense') totalDefense += card.value;
            if (card.stat === 'speed') totalSpeed += card.value;
        }
    });

    const cardsHTML = character.flippedCards.map((flipped, index) => {
        const card = character.cardGrid[index];
        let cardContent = '';

        if (flipped) {
            if (card.type === 'blank') {
                cardContent = '<span style="font-size: 48px; color: #000;">—</span>';
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
            <h2>Training - ${config.name}</h2>

            <div class="character-info">
                <h3>${config.name} - Level ${character.level}</h3>
                <div class="stats-display">
                    <div class="stat-item">HP: ${totalHp}</div>
                    <div class="stat-item">Attack: ${totalAttack}</div>
                    <div class="stat-item">Defense: ${totalDefense}</div>
                    <div class="stat-item">Speed: ${totalSpeed}</div>
                </div>
                <div class="stat-item" style="margin-top: 10px;">
                    Level Bonus: ${character.level === 1 ? 'None' : '+' + ((bonus - 1) * 100) + '%'}
                </div>
                <div style="margin-top: 15px;">
                    <strong>Unlocked Moves:</strong><br>
                    ${unlockedMoves.map(m => `• ${m.name} (${m.accuracy}%)`).join('<br>')}
                </div>
            </div>

            <div class="flip-points">
                Flip Tokens: ${gameState.flipPoints}
                ${flippedCount < 9 ? `<br><small>Next flip costs: ${nextFlipCost}</small>` : ''}
            </div>

            <div class="card-grid">
                ${cardsHTML}
            </div>

            <p class="text-center mb-20">
                Cards Flipped: ${flippedCount}/9
                ${canLevelUp ? '<br><strong style="color: #28a745;">Ready to Level Up!</strong>' : ''}
            </p>

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
        alert(`Not enough flip tokens! Need ${flipCost}, have ${gameState.flipPoints}`);
        return;
    }

    // Flip the card
    character.flippedCards[cardIndex] = true;
    gameState.flipPoints -= flipCost;

    // Save game state
    saveGameState(gameState);

    // Re-render
    loadTrainingScreen();
}

function levelUpCharacter() {
    const character = gameState.selectedCharacter;

    if (character.level >= GAME_CONFIG.maxLevel) {
        alert('Character is already max level!');
        return;
    }

    const flippedCount = character.flippedCards.filter(f => f).length;
    if (flippedCount < GAME_CONFIG.cardsRequiredForLevelUp) {
        alert('Need at least 6 cards flipped to level up!');
        return;
    }

    // Level up
    character.level++;

    // Reset cards and generate new grid
    character.flippedCards = Array(GAME_CONFIG.totalCards).fill(false);
    character.cardGrid = generateCardGrid();

    const config = GAME_CONFIG.characters.find(c => c.id === character.id);
    alert(`${config.name} leveled up to Level ${character.level}! New move unlocked: ${config.moves[character.level - 1].name}`);

    // Save game state
    saveGameState(gameState);

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
