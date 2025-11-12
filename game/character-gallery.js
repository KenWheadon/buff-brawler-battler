// Character Gallery Screen
function loadCharacterGallery() {
    const container = document.getElementById('game-container');

    // Check if character gallery already exists
    const existingGallery = container.querySelector('.character-gallery');

    if (existingGallery) {
        // Update existing elements
        updateCharacterGalleryElements(existingGallery);
    } else {
        // Initial render - create full gallery
        renderFullCharacterGallery(container);
    }
}

function updateCharacterGalleryElements(gallery) {
    const current = gameState.currentCharacter;
    const currentConfig = GAME_CONFIG.characters.find(c => c.id === current.id);
    const currentBonus = GAME_CONFIG.levelBonuses[current.level];
    const currentUnlockedMoves = currentConfig.moves.slice(0, current.level);
    const currentPortrait = currentConfig.images[current.level];

    // Update current character display
    const currentCharDiv = gallery.querySelector('.current-character');
    if (currentCharDiv) {
        currentCharDiv.innerHTML = `
            <img src="${currentPortrait}" alt="${currentConfig.name}" class="current-character-portrait">
            <h3>Current Character</h3>
            <h4>${currentConfig.name} - Level ${current.level}</h4>
            <div class="stats">
                HP: ${Math.floor(currentConfig.baseHp * currentBonus)} |
                ATK: ${Math.floor(currentConfig.baseAttack * currentBonus)} |
                DEF: ${Math.floor(currentConfig.baseDefense * currentBonus)} |
                SPD: ${Math.floor(currentConfig.baseSpeed * currentBonus)}
            </div>
            <div style="margin-top: 10px;">
                <strong>Unlocked Moves:</strong> ${currentUnlockedMoves.map(m => m.name).join(', ')}
            </div>
        `;
    }

    // Update character cards (check for unlocked status changes)
    const characterGrid = gallery.querySelector('.character-grid');
    if (characterGrid) {
        const charactersHTML = gameState.characters.map(char => {
            const config = GAME_CONFIG.characters.find(c => c.id === char.id);
            const bonus = GAME_CONFIG.levelBonuses[char.level];
            const isLocked = !char.unlocked;
            const unlockedMoves = config.moves.slice(0, char.level);

            const portraitImage = config.images[char.level];
            return `
                <div class="character-card ${isLocked ? 'locked' : 'unlocked'}"
                     onclick="${isLocked ? '' : `selectCharacterForTraining(${char.id})`}">
                    ${!isLocked ? `<img src="${portraitImage}" alt="${config.name}" class="character-portrait">` : ''}
                    <h4>${config.name}</h4>
                    <div class="level">Level ${char.level}</div>
                    ${isLocked ? '<p>🔒 LOCKED</p>' : `
                        <div class="stats">
                            <div>HP: ${Math.floor(config.baseHp * bonus)}</div>
                            <div>ATK: ${Math.floor(config.baseAttack * bonus)}</div>
                            <div>DEF: ${Math.floor(config.baseDefense * bonus)}</div>
                            <div>SPD: ${Math.floor(config.baseSpeed * bonus)}</div>
                        </div>
                        <div style="margin-top: 8px; font-size: 11px; color: #667eea;">
                            <strong>Moves:</strong><br>
                            ${unlockedMoves.map(m => m.name).join(', ')}
                        </div>
                    `}
                </div>
            `;
        }).join('');
        characterGrid.innerHTML = charactersHTML;
    }
}

function renderFullCharacterGallery(container) {
    const current = gameState.currentCharacter;

    const charactersHTML = gameState.characters.map(char => {
        const config = GAME_CONFIG.characters.find(c => c.id === char.id);
        const bonus = GAME_CONFIG.levelBonuses[char.level];
        const isLocked = !char.unlocked;
        const unlockedMoves = config.moves.slice(0, char.level);

        const portraitImage = config.images[char.level];
        return `
            <div class="character-card ${isLocked ? 'locked' : 'unlocked'}"
                 onclick="${isLocked ? '' : `selectCharacterForTraining(${char.id})`}">
                ${!isLocked ? `<img src="${portraitImage}" alt="${config.name}" class="character-portrait">` : ''}
                <h4>${config.name}</h4>
                <div class="level">Level ${char.level}</div>
                ${isLocked ? '<p>🔒 LOCKED</p>' : `
                    <div class="stats">
                        <div>HP: ${Math.floor(config.baseHp * bonus)}</div>
                        <div>ATK: ${Math.floor(config.baseAttack * bonus)}</div>
                        <div>DEF: ${Math.floor(config.baseDefense * bonus)}</div>
                        <div>SPD: ${Math.floor(config.baseSpeed * bonus)}</div>
                    </div>
                    <div style="margin-top: 8px; font-size: 11px; color: #667eea;">
                        <strong>Moves:</strong><br>
                        ${unlockedMoves.map(m => m.name).join(', ')}
                    </div>
                `}
            </div>
        `;
    }).join('');

    const currentConfig = GAME_CONFIG.characters.find(c => c.id === current.id);
    const currentBonus = GAME_CONFIG.levelBonuses[current.level];
    const currentUnlockedMoves = currentConfig.moves.slice(0, current.level);
    const currentPortrait = currentConfig.images[current.level];

    container.innerHTML = `
        <div class="character-gallery fade-in">
            <h2>Character Gallery</h2>

            <div class="current-character">
                <img src="${currentPortrait}" alt="${currentConfig.name}" class="current-character-portrait">
                <h3>Current Character</h3>
                <h4>${currentConfig.name} - Level ${current.level}</h4>
                <div class="stats">
                    HP: ${Math.floor(currentConfig.baseHp * currentBonus)} |
                    ATK: ${Math.floor(currentConfig.baseAttack * currentBonus)} |
                    DEF: ${Math.floor(currentConfig.baseDefense * currentBonus)} |
                    SPD: ${Math.floor(currentConfig.baseSpeed * currentBonus)}
                </div>
                <div style="margin-top: 10px;">
                    <strong>Unlocked Moves:</strong> ${currentUnlockedMoves.map(m => m.name).join(', ')}
                </div>
            </div>

            <h3 class="text-center mb-20">All Characters</h3>
            <div class="character-grid">
                ${charactersHTML}
            </div>

            <div class="text-center">
                <button class="btn btn-secondary" onclick="loadTitleScreen()">Back to Title</button>
            </div>
        </div>
    `;
}

function selectCharacterForTraining(characterId) {
    const character = gameState.characters.find(c => c.id === characterId);
    gameState.selectedCharacter = character;
    loadTrainingScreen();
}
