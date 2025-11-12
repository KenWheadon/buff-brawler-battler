// Title Screen
function loadTitleScreen() {
  const container = document.getElementById("game-container");

  container.innerHTML = `
        <div class="title-screen fade-in">
            <h1>BUFF BRAWL</h1>
            <div class="button-group">
                <button class="btn btn-primary" onclick="startRun()">Start Run</button>
                <button class="btn btn-primary" onclick="loadCharacterGallery()">Character Gallery</button>
            </div>
            <div style="margin-top: 20px; font-size: 12px; color: #888;">
                Flip Tokens: ${gameState.flipPoints}
            </div>
        </div>
    `;
}

function startRun() {
  // Reset wave counter and start wave 1
  gameState.currentWave = 1;

  // Get first wave enemy
  const enemy = GAME_CONFIG.waveEnemies[0];

  gameState.currentMonster = {
    ...enemy,
    isBoss: false,
  };

  loadCombatScreen();
}
