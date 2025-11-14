// Title Screen
function loadTitleScreen() {
  const container = document.getElementById("game-container");

  const current = gameState.currentCharacter;
  const currentConfig = GAME_CONFIG.characters.find((c) => c.id === current.id);
  const currentBonus = GAME_CONFIG.levelBonuses[current.level];
  const currentPortrait = currentConfig.images[current.level];

  container.innerHTML = `
        <div class="title-screen fade-in">
            <img src="images/title-logo.png" alt="Buff Bara Battler" class="title-logo">

            <div class="title-current-character" onclick="loadCharacterGallery()">
                <img src="${currentPortrait}" alt="${
    currentConfig.name
  }" class="current-character-portrait">
                <h3>Current Character</h3>
                <h4>${currentConfig.name} - Level ${current.level}</h4>
                <div class="stats">
                    HP: ${Math.floor(currentConfig.baseHp * currentBonus)} |
                    ATK: ${Math.floor(
                      currentConfig.baseAttack * currentBonus
                    )} |
                    DEF: ${Math.floor(
                      currentConfig.baseDefense * currentBonus
                    )} |
                    SPD: ${Math.floor(currentConfig.baseSpeed * currentBonus)}
                </div>
                <p style="margin-top: 10px; font-size: 12px; color: #666;">Click to view gallery</p>
            </div>

            <div class="button-group">
                <button class="btn btn-primary" onclick="startRun()">Start Run</button>
                <button class="btn btn-secondary" onclick="viewStory()">View Story</button>
                <button class="btn btn-secondary" onclick="trainCurrentCharacter()">Train</button>
                <button class="btn btn-secondary" onclick="openTrophyScreen()">🏆 Trophies</button>
            </div>
            <div style="margin-top: 20px; font-size: 12px; color: #888;">
                Flip Tokens: ${gameState.flipPoints}
            </div>
        </div>
    `;
}

function startRun() {
  // Reset to level 1, wave 1
  gameState.currentLevel = 1;
  gameState.currentWave = 1;

  // Get first level config
  const levelConfig = GAME_CONFIG.levels[0];

  // Get first wave enemy of level 1
  const enemy = levelConfig.waveEnemies[0];

  gameState.currentMonster = {
    ...enemy,
    isBoss: false,
  };

  loadCombatScreen();
}

function viewStory() {
  // Open the story panel
  if (storyPanel) {
    storyPanel.replay();
  }
}

function trainCurrentCharacter() {
  // Set the current character as the selected character for training
  gameState.selectedCharacter = gameState.currentCharacter;
  loadTrainingScreen();
}
