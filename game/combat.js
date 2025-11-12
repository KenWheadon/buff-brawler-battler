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
    combatLog: [],
    isAnimating: false
};

// Animation helper functions
function wiggleElement(selector) {
    return new Promise(resolve => {
        const element = document.querySelector(selector);
        if (!element) {
            resolve();
            return;
        }
        element.classList.add('wiggle-animation');
        setTimeout(() => {
            element.classList.remove('wiggle-animation');
            resolve();
        }, 400);
    });
}

function createParticle(type, animationName, duration = 600) {
    return new Promise(resolve => {
        const particle = document.createElement('div');
        particle.className = `combat-particle ${type}`;
        particle.style.animation = `${animationName} ${duration}ms ease-in-out forwards`;
        document.querySelector('.combat-screen').appendChild(particle);

        setTimeout(() => {
            particle.remove();
            resolve();
        }, duration);
    });
}

function createCircularParticle(selector, type) {
    return new Promise(resolve => {
        const element = document.querySelector(selector);
        if (!element) {
            resolve();
            return;
        }

        const rect = element.getBoundingClientRect();
        const container = document.querySelector('.combat-screen').getBoundingClientRect();

        const particle = document.createElement('div');
        particle.className = `combat-particle ${type}`;
        particle.style.position = 'absolute';
        particle.style.left = `${rect.left - container.left + rect.width / 2}px`;
        particle.style.top = `${rect.top - container.top + rect.height / 2}px`;
        particle.style.animation = 'circular-buff 1s ease-in-out forwards';

        document.querySelector('.combat-screen').appendChild(particle);

        setTimeout(() => {
            particle.remove();
            resolve();
        }, 1000);
    });
}

function showEffectText(selector, text, type) {
    return new Promise(resolve => {
        const element = document.querySelector(selector);
        if (!element) {
            resolve();
            return;
        }

        const rect = element.getBoundingClientRect();
        const container = document.querySelector('.combat-screen').getBoundingClientRect();

        const effectText = document.createElement('div');
        effectText.className = `effect-text ${type}`;
        effectText.textContent = text;
        effectText.style.left = `${rect.left - container.left + rect.width / 2}px`;
        effectText.style.top = `${rect.top - container.top + rect.height / 2}px`;
        effectText.style.transform = 'translateX(-50%)';

        document.querySelector('.combat-screen').appendChild(effectText);

        setTimeout(() => {
            effectText.remove();
            resolve();
        }, 1000);
    });
}

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

    // Check if combat screen already exists
    const existingCombatScreen = container.querySelector('.combat-screen');

    if (existingCombatScreen) {
        // Update existing elements without re-rendering entire screen
        updateCombatScreenElements(existingCombatScreen, {
            playerHpPercent,
            monsterHpPercent,
            isPlayerTurn,
            config,
            character,
            monster
        });
    } else {
        // Initial render - create full combat screen
        renderFullCombatScreen(container, {
            playerHpPercent,
            monsterHpPercent,
            isPlayerTurn,
            config,
            character,
            monster
        });
    }
}

function updateCombatScreenElements(combatScreen, data) {
    const { playerHpPercent, monsterHpPercent, isPlayerTurn, config, character, monster } = data;

    // Update HP bars
    const playerHpFill = combatScreen.querySelector('#player-combatant .hp-fill');
    const playerHpText = combatScreen.querySelector('#player-combatant .hp-text');
    const monsterHpFill = combatScreen.querySelector('#monster-combatant .hp-fill');
    const monsterHpText = combatScreen.querySelector('#monster-combatant .hp-text');

    if (playerHpFill) playerHpFill.style.width = `${playerHpPercent}%`;
    if (playerHpText) playerHpText.textContent = `${combatState.playerHp} / ${combatState.playerStats.hp}`;
    if (monsterHpFill) monsterHpFill.style.width = `${monsterHpPercent}%`;
    if (monsterHpText) monsterHpText.textContent = `${combatState.monsterHp} / ${combatState.monsterStats.hp}`;

    // Update stats
    const playerStatsDiv = combatScreen.querySelector('#player-combatant > div[style*="margin-top: 10px"]');
    if (playerStatsDiv) {
        playerStatsDiv.innerHTML = `
            <strong>ATK:</strong> ${combatState.playerStats.attack} |
            <strong>DEF:</strong> ${combatState.playerStats.defense} |
            <strong>SPD:</strong> ${combatState.playerStats.speed}
        `;
    }

    // Update turn order
    const turnOrderDiv = combatScreen.querySelector('.turn-order');
    if (turnOrderDiv) {
        const playerIcon = config.icons[character.level];
        const turnOrderHTML = combatState.turnQueue.slice(combatState.currentTurnIndex, combatState.currentTurnIndex + 5).map((turn, index) => {
            const iconSrc = turn === 'player' ? playerIcon : monster.icon || 'images/enemy-icon.png';
            const turnClass = turn === 'player' ? 'turn-player' : 'turn-enemy';
            return `
                <div class="turn-icon ${turnClass} ${index === 0 ? 'active' : ''}">
                    <img src="${iconSrc}" alt="${turn === 'player' ? config.name : monster.name}" class="turn-icon-img">
                </div>
            `;
        }).join('');
        turnOrderDiv.innerHTML = `<strong>Turn Order:</strong>${turnOrderHTML}`;
    }

    // Update move buttons state
    const unlockedMoves = config.moves.slice(0, character.level);
    const moveButtons = combatScreen.querySelectorAll('.move-btn');
    moveButtons.forEach((btn, index) => {
        if (index < unlockedMoves.length) {
            btn.disabled = !isPlayerTurn || combatState.isAnimating;
        }
    });

    // Update turn indicator
    const turnIndicator = combatScreen.querySelector('div[style*="font-weight: bold"][style*="color: #000"]');
    if (turnIndicator) {
        turnIndicator.textContent = isPlayerTurn ? "Your turn!" : "Enemy's turn...";
    }

    // Update combat log
    const logDiv = combatScreen.querySelector('div[style*="font-size: 11px"]');
    if (logDiv) {
        const logHTML = combatState.combatLog.slice(-3).map(msg => `<div>${msg}</div>`).join('');
        logDiv.innerHTML = logHTML;
    }
}

function renderFullCombatScreen(container, data) {
    const { playerHpPercent, monsterHpPercent, isPlayerTurn, config, character, monster } = data;

    // Get unlocked moves for this character level
    const unlockedMoves = config.moves.slice(0, character.level);

    const movesHTML = unlockedMoves.map((move, index) => `
        <button class="move-btn" onclick="useMove(${index})" ${!isPlayerTurn || combatState.isAnimating ? 'disabled' : ''}>
            ${move.icon ? `<img src="${move.icon}" alt="${move.name}" class="move-icon">` : ''}
            <div class="move-info">
                <span class="move-name">${move.name}</span>
                <span class="move-desc">${move.description} (${move.accuracy}%)</span>
            </div>
        </button>
    `).join('');

    // Get player icon
    const playerIcon = config.icons[character.level];

    // Show next 5 turns in turn order
    const turnOrderHTML = combatState.turnQueue.slice(combatState.currentTurnIndex, combatState.currentTurnIndex + 5).map((turn, index) => {
        const iconSrc = turn === 'player' ? playerIcon : monster.icon || 'images/enemy-icon.png';
        const turnClass = turn === 'player' ? 'turn-player' : 'turn-enemy';
        return `
            <div class="turn-icon ${turnClass} ${index === 0 ? 'active' : ''}">
                <img src="${iconSrc}" alt="${turn === 'player' ? config.name : monster.name}" class="turn-icon-img">
            </div>
        `;
    }).join('');

    // Combat log (last 3 messages)
    const logHTML = combatState.combatLog.slice(-3).map(msg => `<div>${msg}</div>`).join('');

    const playerPortrait = config.images[character.level];

    container.innerHTML = `
        <div class="combat-screen fade-in">
            <h2>Combat - Wave ${gameState.currentWave || 1}</h2>

            <div class="turn-order">
                <strong>Turn Order:</strong>
                ${turnOrderHTML}
            </div>

            <div class="combatants">
                <div class="combatant" id="player-combatant">
                    <img src="${playerPortrait}" alt="${config.name}" class="combat-portrait" id="player-portrait">
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

                <div class="combatant" id="monster-combatant">
                    <img src="${monster.image}" alt="${monster.name}" class="combat-portrait" id="monster-portrait">
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

            <div style="text-align: center; margin-top: auto; padding-top: 10px; flex-shrink: 0;">
                <div style="font-weight: bold; color: #000; margin-bottom: 5px; font-size: 16px;">
                    ${isPlayerTurn ? "Your turn!" : "Enemy's turn..."}
                </div>
                <div style="font-size: 11px; color: #333; max-height: 45px; overflow-y: auto;">
                    ${logHTML}
                </div>
            </div>
        </div>
    `;
}

async function useMove(moveIndex) {
    const currentTurn = combatState.turnQueue[combatState.currentTurnIndex];
    if (currentTurn !== 'player' || combatState.isAnimating) return;

    combatState.isAnimating = true;

    const character = gameState.currentCharacter;
    const monster = gameState.currentMonster;
    const config = GAME_CONFIG.characters.find(c => c.id === character.id);
    const move = config.moves[moveIndex];

    // Check accuracy
    const roll = Math.random() * 100;
    const missed = roll > move.accuracy;

    if (missed) {
        // Miss animation: just wiggle and show miss
        await wiggleElement('#player-portrait');
        await showEffectText('#monster-portrait', 'MISS!', 'miss');
        combatState.combatLog.push(`${config.name}'s ${move.name} missed!`);
        combatState.isAnimating = false;
        advanceTurn();
        return;
    }

    // Determine move type
    const isBuffOnly = move.damage === 0 && move.effect && (move.effect.stat || move.effect.selfAtk || move.effect.blockNext);
    const hasDamage = move.damage > 0;
    const hasDebuff = move.effect && (move.effect.enemyDef || move.effect.enemyDef === 0);

    if (isBuffOnly) {
        // Buff-only move: wiggle -> circular particle -> wiggle + effect text
        await wiggleElement('#player-portrait');
        await createCircularParticle('#player-portrait', 'buff');
        await wiggleElement('#player-portrait');

        // Apply buff effects
        let effectTexts = [];
        if (move.effect.stat && move.effect.value) {
            combatState.playerStats[move.effect.stat] += move.effect.value;
            effectTexts.push(`+${move.effect.value} ${move.effect.stat.toUpperCase()}`);
        }
        if (move.effect.selfAtk) {
            combatState.playerStats.attack += move.effect.selfAtk;
            effectTexts.push(`+${move.effect.selfAtk} ATK`);
        }
        if (move.effect.blockNext) {
            combatState.playerStats.blocking = true;
            effectTexts.push('BLOCKING');
        }

        await showEffectText('#player-portrait', effectTexts.join(' '), 'buff');
        combatState.combatLog.push(`${config.name} used ${move.name}!`);
    } else {
        // Attack move: player wiggle -> projectile -> monster wiggle + damage
        await wiggleElement('#player-portrait');

        // Determine particle type
        const particleType = hasDebuff ? 'debuff' : 'damage';
        await createParticle(particleType, 'projectile-to-monster', 600);

        await wiggleElement('#monster-portrait');

        // Calculate and apply damage
        if (hasDamage) {
            const defense = combatState.monsterStats.defense;
            const defenseReduction = move.damage * (defense / 100);
            const actualDamage = Math.max(1, Math.floor(combatState.playerStats.attack + move.damage - defenseReduction));

            combatState.monsterHp = Math.max(0, combatState.monsterHp - actualDamage);

            // Show damage
            await showEffectText('#monster-portrait', `-${actualDamage} HP`, 'damage');
            combatState.combatLog.push(`${config.name} used ${move.name}! Dealt ${actualDamage} damage.`);
        }

        // Apply debuff effects
        if (hasDebuff) {
            if (move.effect.enemyDef) {
                combatState.monsterStats.defense = Math.max(0, combatState.monsterStats.defense + move.effect.enemyDef);
                await showEffectText('#monster-portrait', `${move.effect.enemyDef} DEF`, 'debuff');
            }
        }

        // Apply self-buff from attack (like Roar which does damage and buffs)
        if (move.effect && move.effect.selfAtk) {
            combatState.playerStats.attack += move.effect.selfAtk;
            await showEffectText('#player-portrait', `+${move.effect.selfAtk} ATK`, 'buff');
        }
    }

    // Re-render to update stats
    renderCombatScreen();

    // Check if monster is defeated
    if (combatState.monsterHp <= 0) {
        combatState.isAnimating = false;
        endCombat(true);
        return;
    }

    combatState.isAnimating = false;
    advanceTurn();
}

async function executeMonsterTurn() {
    if (combatState.isAnimating) return;

    combatState.isAnimating = true;

    const monster = gameState.currentMonster;
    const config = GAME_CONFIG.characters.find(c => c.id === gameState.currentCharacter.id);

    // Monster picks a random move
    const move = monster.moves[Math.floor(Math.random() * monster.moves.length)];

    // Monster attack animation: monster wiggle -> projectile -> player wiggle + damage
    await wiggleElement('#monster-portrait');
    await createParticle('damage', 'projectile-to-player', 600);
    await wiggleElement('#player-portrait');

    // Calculate damage: ATK - (DEF% of damage)
    // Check if player is blocking
    let actualDamage = 0;
    if (combatState.playerStats.blocking) {
        combatState.playerStats.blocking = false;
        await showEffectText('#player-portrait', 'BLOCKED!', 'buff');
        combatState.combatLog.push(`${monster.name} used ${move.name}! Attack blocked!`);
    } else {
        const defense = combatState.playerStats.defense;
        const defenseReduction = move.damage * (defense / 100);
        actualDamage = Math.max(1, Math.floor(combatState.monsterStats.attack + move.damage - defenseReduction));

        combatState.playerHp = Math.max(0, combatState.playerHp - actualDamage);
        await showEffectText('#player-portrait', `-${actualDamage} HP`, 'damage');
        combatState.combatLog.push(`${monster.name} used ${move.name}! Dealt ${actualDamage} damage.`);
    }

    // Re-render to update HP
    renderCombatScreen();

    // Check if player is defeated
    if (combatState.playerHp <= 0) {
        combatState.isAnimating = false;
        endCombat(false);
        return;
    }

    combatState.isAnimating = false;
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
