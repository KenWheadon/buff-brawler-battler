// Game configuration data
const GAME_CONFIG = {
  // Game settings
  initialFlipTokens: 10,
  maxLevel: 3,
  totalCards: 9,

  // Character definitions
  // Format: ATK / DEF / SPD / HP
  characters: [
    {
      id: 1,
      name: "Wolf",
      baseAttack: 10,
      baseDefense: 10,
      baseSpeed: 15,
      baseHp: 50,
      unlockedByDefault: true,
      image: "images/wolf-portrait.png",
      moves: [
        {
          name: "Claw",
          damage: 10,
          type: "physical",
          accuracy: 100,
          description: "A basic attack",
        },
        {
          name: "Dash",
          damage: 0,
          type: "buff",
          accuracy: 90,
          description: "Increase speed",
          effect: { stat: "speed", value: 5 },
        },
        {
          name: "Roar",
          damage: 5,
          type: "debuff",
          accuracy: 75,
          description: "Decrease opponent defense -10, increase your attack +5",
          effect: { enemyDef: -10, selfAtk: 5 },
        },
      ],
    },
    {
      id: 2,
      name: "Bear",
      baseAttack: 30,
      baseDefense: 10,
      baseSpeed: 10,
      baseHp: 40,
      unlockedByDefault: false,
      image: "images/bear-portrait.png",
      moves: [
        {
          name: "Slam",
          damage: 30,
          type: "physical",
          accuracy: 100,
          description: "A powerful attack",
        },
        {
          name: "Guard",
          damage: 0,
          type: "defense",
          accuracy: 80,
          description: "Block next attack",
          effect: { blockNext: true },
        },
        {
          name: "Crush",
          damage: 30,
          type: "physical",
          accuracy: 75,
          description: "Attack and reduce defense",
          effect: { enemyDef: -5 },
        },
      ],
    },
  ],

  // Wave enemies (3 waves before boss)
  waveEnemies: [
    {
      id: 1,
      name: "Weak Grunt",
      hp: 30,
      attack: 5,
      defense: 5,
      speed: 10,
      image: "images/enemy-wave1.png",
      moves: [{ name: "Scratch", damage: 5, type: "physical" }],
    },
    {
      id: 2,
      name: "Tough Brute",
      hp: 40,
      attack: 8,
      defense: 8,
      speed: 8,
      image: "images/enemy-wave2.png",
      moves: [{ name: "Punch", damage: 8, type: "physical" }],
    },
    {
      id: 3,
      name: "Elite Warrior",
      hp: 45,
      attack: 10,
      defense: 10,
      speed: 12,
      image: "images/enemy-wave3.png",
      moves: [{ name: "Heavy Blow", damage: 12, type: "physical" }],
    },
  ],

  // Boss definition (Bear with 1.5x stats and all moves unlocked)
  boss: {
    id: 10,
    name: "Bear Boss",
    baseHp: 40,
    baseAttack: 30,
    baseDefense: 10,
    baseSpeed: 10,
    statsMultiplier: 1.5,
    image: "images/bear-boss.png",
    moves: [
      {
        name: "Slam",
        damage: 30,
        type: "physical",
        accuracy: 100,
        description: "A powerful attack",
      },
      {
        name: "Guard",
        damage: 0,
        type: "defense",
        accuracy: 80,
        description: "Block next attack",
      },
      {
        name: "Crush",
        damage: 30,
        type: "physical",
        accuracy: 75,
        description: "Attack and reduce defense",
      },
    ],
  },

  // Level bonuses
  levelBonuses: {
    1: 1.0, // No bonus
    2: 1.1, // +10%
    3: 1.2, // +20%
  },

  // Cards required for level up
  cardsRequiredForLevelUp: 6,

  // Card grid configuration (3x3 = 9 cards)
  // 6 Power cards, 3 Blanks
  cardTypes: {
    powerCards: 6,
    blankCards: 3,
  },

  // Power card bonuses
  powerCardBonuses: [
    { stat: "attack", min: 1, max: 5 },
    { stat: "defense", min: 1, max: 5 },
    { stat: "speed", min: 1, max: 2 },
  ],

  // Token rewards
  tokenRewards: {
    waveWin: 1, // +1 per wave win
    bossWin: 5, // +5 for boss win
  },
};

// ============================
// GAME STATE MANAGEMENT
// ============================

// Save game state to localStorage
function saveGameState(gameState) {
  try {
    const saveData = {
      flipPoints: gameState.flipPoints,
      currentWave: gameState.currentWave,
      characters: gameState.characters.map((char) => ({
        id: char.id,
        unlocked: char.unlocked,
        level: char.level,
        flippedCards: char.flippedCards,
        cardGrid: char.cardGrid, // Save the shuffled card grid
      })),
      currentCharacterId: gameState.currentCharacter?.id || 1,
    };
    localStorage.setItem("buffBrawlSave", JSON.stringify(saveData));
    console.log("Game saved successfully");
  } catch (error) {
    console.error("Failed to save game:", error);
  }
}

// Load game state from localStorage
function loadGameState() {
  try {
    const savedData = localStorage.getItem("buffBrawlSave");
    if (savedData) {
      const saveData = JSON.parse(savedData);
      console.log("Game loaded successfully");
      return saveData;
    }
  } catch (error) {
    console.error("Failed to load game:", error);
  }
  return null;
}

// Create initial game state
function createInitialGameState() {
  return {
    currentCharacter: null,
    selectedCharacter: null,
    currentMonster: null,
    currentWave: 0,
    flipPoints: GAME_CONFIG.initialFlipTokens,
    characters: GAME_CONFIG.characters.map((char) => ({
      id: char.id,
      unlocked: char.unlockedByDefault,
      level: 1,
      flippedCards: Array(GAME_CONFIG.totalCards).fill(false),
      cardGrid: null, // Will be generated when entering training screen
    })),
  };
}

// Initialize game state (new game or load existing)
function initializeGameState() {
  const savedState = loadGameState();

  if (savedState) {
    // Load from save
    const gameState = createInitialGameState();
    gameState.flipPoints = savedState.flipPoints;
    gameState.currentWave = 0; // Reset run progress on load

    // Restore character states
    savedState.characters.forEach((savedChar) => {
      const char = gameState.characters.find((c) => c.id === savedChar.id);
      if (char) {
        char.unlocked = savedChar.unlocked;
        char.level = savedChar.level;
        char.flippedCards = savedChar.flippedCards;
        char.cardGrid = savedChar.cardGrid; // Restore the saved card grid
      }
    });

    // Set current character
    const currentChar = gameState.characters.find(
      (c) => c.id === savedState.currentCharacterId
    );
    gameState.currentCharacter =
      currentChar || gameState.characters.find((c) => c.unlocked);

    return gameState;
  } else {
    // New game
    const gameState = createInitialGameState();
    gameState.currentCharacter = gameState.characters.find((c) => c.unlocked);
    return gameState;
  }
}
