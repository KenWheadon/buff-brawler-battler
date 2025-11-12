// Combat Screen
let combatState = {
    playerHp: 0,
    monsterHp: 0,
    playerStats: {},
    monsterStats: {},
    turnQueue: [],
    currentTurnIndex: 0,
    playerSpeed: 0,
    monsterSpeed: 0,
    combatLog: []
};

function loadCombatScreen() {
    const character = gameState.currentCharacter;
    const monster = gameState.currentMonster;
    const config = GAME_CONFIG.characters.find(c => c.id === character.id);
    const bonus = GAME_CONFIG.levelBonuses[character.level];

    // Calculate player stats including card bonuses
    let playerStats = {
        hp: Math.floor(config.baseHp * bonus),
        attack: Math.floor(config.baseAttack * bonus),
        defense: Math.floor(config.baseDefense * bonus),
        speed: Math.floor(config.baseSpeed * bonus)
    };

    // Add card bonuses
    if (character.cardGrid) {
        character.flippedCards.forEach((flipped, index) => {
            if (flipped && character.cardGrid[index].type === 'power') {
                const card = character.cardGrid[index];
                playerStats[card.stat] += card.value;
            }
        });
    }

    // Initialize combat state
    combatState.playerHp = playerStats.hp;
    combatState.monsterHp = monster.hp;
    combatState.playerStats = playerStats;
    combatState.monsterStats = {
        hp: monster.hp,
        attack: monster.attack,
        defense: monster.defense,
        speed: monster.speed
    };
    combatState.combatLog = [];

    // Generate turn order using speed system (1/speed = time per turn)
    // Lower number = faster, goes more often
    generateTurnOrder();

    renderCombatScreen();

    // If first turn is monster, execute after delay
    if (combatState.turnQueue[0] === 'monster') {
        setTimeout(executeMonsterTurn, 1000);
    }
}

// Generate turn order based on speed (1/X system)
function generateTurnOrder() {
    const playerSpeed = combatState.playerStats.speed;
    const monsterSpeed = combatState.monsterStats.speed;

    // Calculate turn intervals
    const playerInterval = 1 / playerSpeed;
    const monsterInterval = 1 / monsterSpeed;

    // Generate turn queue for next 10 turns
    const turnQueue = [];
    let playerTime = playerInterval;
    let monsterTime = monsterInterval;

    for (let i = 0; i < 10; i++) {
        if (playerTime <= monsterTime) {
            turnQueue.push('player');
            playerTime += playerInterval;
        } else {
            turnQueue.push('monster');
            monsterTime += monsterInterval;
        }
    }

    combatState.turnQueue = turnQueue;
    combatState.currentTurnIndex = 0;
}

function renderCombatScreen() {
    const container = document.getElementById('game-container');
    const character = gameState.currentCharacter;
    const monster = gameState.currentMonster;
    const config = GAME_CONFIG.characters.find(c => c.id === character.id);

    const playerHpPercent = (combatState.playerHp / combatState.playerStats.hp) * 100;
    const monsterHpPercent = (combatState.monsterHp / combatState.monsterStats.hp) * 100;

    const currentTurn = combatState.turnQueue[combatState.currentTurnIndex];
    const isPlayerTurn = currentTurn === 'player';

    // Get unlocked moves for this character level
    const unlockedMoves = config.moves.slice(0, character.level);

    const movesHTML = unlockedMoves.map((move, index) => `
        <button class="move-btn" onclick="useMove(${index})" ${!isPlayerTurn ? 'disabled' : ''}>
            <span class="move-name">${move.name}</span>
            <span class="move-desc">${move.description} (${move.accuracy}%)</span>
        </button>
    `).join('');

    // Show next 5 turns in turn order
    const turnOrderHTML = combatState.turnQueue.slice(combatState.currentTurnIndex, combatState.currentTurnIndex + 5).map((turn, index) => `
        <div class="turn-icon ${index === 0 ? 'active' : ''}"
             style="background: ${turn === 'player' ? '#667eea' : '#dc3545'}; color: white;">
            ${turn === 'player' ? 'P' : 'M'}
        </div>
    `).join('');

    // Combat log (last 3 messages)
    const logHTML = combatState.combatLog.slice(-3).map(msg => `<div>${msg}</div>`).join('');

    container.innerHTML = `
        <div class="combat-screen fade-in">
            <h2>Combat - Wave ${gameState.currentWave || 1}</h2>

            <div class="turn-order">
                <strong>Turn Order:</strong>
                ${turnOrderHTML}
            </div>

            <div class="combatants">
                <div class="combatant">
                    <h3>${config.name} (Lv.${character.level})</h3>
                    <div class="hp-bar">
                        <div class="hp-fill" style="width: ${playerHpPercent}%"></div>
                        <div class="hp-text">${combatState.playerHp} / ${combatState.playerStats.hp}</div>
                    </div>
                    <div style="margin-top: 10px; font-size: 14px;">
                        <strong>ATK:</strong> ${combatState.playerStats.attack} |
                        <strong>DEF:</strong> ${combatState.playerStats.defense} |
                        <strong>SPD:</strong> ${combatState.playerStats.speed}
                    </div>
                    <div class="moves">
                        <h4>Your Moves:</h4>
                        <div class="move-grid">
                            ${movesHTML}
                        </div>
                    </div>
                </div>

                <div class="combatant">
                    <h3>${monster.name}</h3>
                    <div class="hp-bar">
                        <div class="hp-fill" style="width: ${monsterHpPercent}%"></div>
                        <div class="hp-text">${combatState.monsterHp} / ${combatState.monsterStats.hp}</div>
                    </div>
                    <div style="margin-top: 20px;">
                        <strong>ATK:</strong> ${combatState.monsterStats.attack}<br>
                        <strong>DEF:</strong> ${combatState.monsterStats.defense}<br>
                        <strong>SPD:</strong> ${combatState.monsterStats.speed}
                    </div>
                </div>
            </div>

            <div style="text-align: center; margin-top: 20px; min-height: 60px;">
                <div style="font-weight: bold; color: #667eea; margin-bottom: 10px;">
                    ${isPlayerTurn ? "Your turn!" : "Enemy's turn..."}
                </div>
                <div style="font-size: 12px; color: #666;">
                    ${logHTML}
                </div>
            </div>
        </div>
    `;
}

function useMove(moveIndex) {
    const currentTurn = combatState.turnQueue[combatState.currentTurnIndex];
    if (currentTurn !== 'player') return;

    const character = gameState.currentCharacter;
    const monster = gameState.currentMonster;
    const config = GAME_CONFIG.characters.find(c => c.id === character.id);
    const move = config.moves[moveIndex];

    // Check accuracy
    const roll = Math.random() * 100;
    if (roll > move.accuracy) {
        combatState.combatLog.push(`${config.name}'s ${move.name} missed!`);
        advanceTurn();
        return;
    }

    // Calculate damage: ATK - (DEF% of damage)
    // Formula: Damage = Move.damage - (Move.damage * (DEF / 100))
    if (move.damage > 0) {
        const defense = combatState.monsterStats.defense;
        const defenseReduction = move.damage * (defense / 100);
        const actualDamage = Math.max(1, Math.floor(combatState.playerStats.attack + move.damage - defenseReduction));

        combatState.monsterHp = Math.max(0, combatState.monsterHp - actualDamage);
        combatState.combatLog.push(`${config.name} used ${move.name}! Dealt ${actualDamage} damage.`);
    }

    // Check if monster is defeated
    if (combatState.monsterHp <= 0) {
        endCombat(true);
        return;
    }

    advanceTurn();
}

function executeMonsterTurn() {
    const monster = gameState.currentMonster;
    const config = GAME_CONFIG.characters.find(c => c.id === gameState.currentCharacter.id);

    // Monster picks a random move
    const move = monster.moves[Math.floor(Math.random() * monster.moves.length)];

    // Calculate damage: ATK - (DEF% of damage)
    const defense = combatState.playerStats.defense;
    const defenseReduction = move.damage * (defense / 100);
    const actualDamage = Math.max(1, Math.floor(combatState.monsterStats.attack + move.damage - defenseReduction));

    combatState.playerHp = Math.max(0, combatState.playerHp - actualDamage);
    combatState.combatLog.push(`${monster.name} used ${move.name}! Dealt ${actualDamage} damage.`);

    // Check if player is defeated
    if (combatState.playerHp <= 0) {
        endCombat(false);
        return;
    }

    advanceTurn();
}

function advanceTurn() {
    combatState.currentTurnIndex++;

    // Check if we need to generate more turns
    if (combatState.currentTurnIndex >= combatState.turnQueue.length - 3) {
        const playerSpeed = combatState.playerStats.speed;
        const monsterSpeed = combatState.monsterStats.speed;
        const playerInterval = 1 / playerSpeed;
        const monsterInterval = 1 / monsterSpeed;

        let playerTime = playerInterval * (combatState.currentTurnIndex + 1);
        let monsterTime = monsterInterval * (combatState.currentTurnIndex + 1);

        for (let i = 0; i < 5; i++) {
            if (playerTime <= monsterTime) {
                combatState.turnQueue.push('player');
                playerTime += playerInterval;
            } else {
                combatState.turnQueue.push('monster');
                monsterTime += monsterInterval;
            }
        }
    }

    renderCombatScreen();

    // If next turn is monster, execute after delay
    const nextTurn = combatState.turnQueue[combatState.currentTurnIndex];
    if (nextTurn === 'monster') {
        setTimeout(executeMonsterTurn, 1500);
    }
}

function endCombat(playerWon) {
    const monster = gameState.currentMonster;

    if (playerWon) {
        // Determine reward based on wave or boss
        const reward = monster.isBoss ? GAME_CONFIG.tokenRewards.bossWin : GAME_CONFIG.tokenRewards.waveWin;
        gameState.flipPoints += reward;
    }

    loadResultsScreen(playerWon);
}
