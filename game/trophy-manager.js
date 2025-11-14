// Trophy Manager - handles trophy data, unlocking, and persistence
// Script format (non-ES6 module)

// Trophy definitions
const TROPHIES = [
  {
    id: "bear-captured",
    name: "Bear Necessities",
    icon: "images/bear-level1-icon.png",
    requirement: "Unlock the Bear character",
    flavorText: "You've captured the mighty bear. Now the real training begins!",
    unlocked: false,
  },
  {
    id: "wolf-master",
    name: "Alpha Wolf",
    icon: "images/wolf-level3-icon.png",
    requirement: "Level up Wolf to Level 3",
    flavorText: "The pack leader has reached their full potential.",
    unlocked: false,
  },
  {
    id: "bear-master",
    name: "Grizzly Veteran",
    icon: "images/bear-level3-icon.png",
    requirement: "Level up Bear to Level 3",
    flavorText: "This bear is now an unstoppable force of nature.",
    unlocked: false,
  },
];

// Local storage keys
const TROPHY_STORAGE_KEY = "buffBaraBattler_trophies";
const TROPHY_STATS_KEY = "buffBaraBattler_trophyStats";

// Trophy progress tracking
let trophyStats = {
  bearUnlocked: false,
  wolfLevel3: false,
  bearLevel3: false,
};

// Initialize trophy system
function initTrophyManager() {
  loadTrophyData();
  loadTrophyStats();
}

// Load trophy unlock status from localStorage
function loadTrophyData() {
  try {
    const saved = localStorage.getItem(TROPHY_STORAGE_KEY);
    if (saved) {
      const unlockedIds = JSON.parse(saved);
      TROPHIES.forEach((trophy) => {
        trophy.unlocked = unlockedIds.includes(trophy.id);
      });
    }
  } catch (e) {
    console.error("Failed to load trophy data:", e);
  }
}

// Save trophy unlock status to localStorage
function saveTrophyData() {
  try {
    const unlockedIds = TROPHIES.filter((t) => t.unlocked).map((t) => t.id);
    localStorage.setItem(TROPHY_STORAGE_KEY, JSON.stringify(unlockedIds));
  } catch (e) {
    console.error("Failed to save trophy data:", e);
  }
}

// Load trophy stats from localStorage
function loadTrophyStats() {
  try {
    const saved = localStorage.getItem(TROPHY_STATS_KEY);
    if (saved) {
      trophyStats = { ...trophyStats, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Failed to load trophy stats:", e);
  }
}

// Save trophy stats to localStorage
function saveTrophyStats() {
  try {
    localStorage.setItem(TROPHY_STATS_KEY, JSON.stringify(trophyStats));
  } catch (e) {
    console.error("Failed to save trophy stats:", e);
  }
}

// Get all trophies (for future trophy screen)
function getTrophies() {
  return TROPHIES;
}

// Unlock a trophy by ID
function unlockTrophy(trophyId) {
  const trophy = TROPHIES.find((t) => t.id === trophyId);
  if (trophy && !trophy.unlocked) {
    trophy.unlocked = true;
    saveTrophyData();
    showTrophyUnlockedNotification(trophy);
    return true;
  }
  return false;
}

// Show trophy unlocked notification
function showTrophyUnlockedNotification(trophy) {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = "trophy-notification";
  notification.innerHTML = `
    <div class="trophy-notification-content">
      <div class="trophy-notification-header">🏆 TROPHY UNLOCKED!</div>
      <div class="trophy-notification-body">
        <img src="${trophy.icon}" alt="${trophy.name}" class="trophy-notification-icon" />
        <div class="trophy-notification-text">
          <div class="trophy-notification-name">${trophy.name}</div>
          <div class="trophy-notification-flavor">${trophy.flavorText}</div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  // Animate out after 4 seconds
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 500);
  }, 4000);
}

// Trophy tracking functions

// Track bear unlock
function trackBearUnlocked() {
  if (!trophyStats.bearUnlocked) {
    trophyStats.bearUnlocked = true;
    saveTrophyStats();
    unlockTrophy("bear-captured");
  }
}

// Track Wolf level 3
function trackWolfLevel3() {
  if (!trophyStats.wolfLevel3) {
    trophyStats.wolfLevel3 = true;
    saveTrophyStats();
    unlockTrophy("wolf-master");
  }
}

// Track Bear level 3
function trackBearLevel3() {
  if (!trophyStats.bearLevel3) {
    trophyStats.bearLevel3 = true;
    saveTrophyStats();
    unlockTrophy("bear-master");
  }
}

// Check character level ups
function checkCharacterLevelTrophies(characterId, level) {
  if (characterId === 1 && level === 3) {
    // Wolf reached level 3
    trackWolfLevel3();
  } else if (characterId === 2 && level === 3) {
    // Bear reached level 3
    trackBearLevel3();
  }
}

// Check character unlock
function checkCharacterUnlockTrophies(characterId) {
  if (characterId === 2) {
    // Bear was unlocked
    trackBearUnlocked();
  }
}

// Get trophy stats (for debugging)
function getTrophyStats() {
  return trophyStats;
}

// Trophy Screen UI Functions

// Open trophy screen
function openTrophyScreen() {
  const overlay = document.createElement("div");
  overlay.id = "trophy-overlay";
  overlay.className = "trophy-overlay";
  overlay.onclick = closeTrophyScreen;

  const modal = document.createElement("div");
  modal.id = "trophy-modal";
  modal.className = "trophy-modal";
  modal.onclick = (e) => e.stopPropagation(); // Prevent closing when clicking inside modal

  const unlockedCount = TROPHIES.filter((t) => t.unlocked).length;
  const totalCount = TROPHIES.length;

  modal.innerHTML = `
    <div class="trophy-modal-header">
      <h2>🏆 Trophies (${unlockedCount}/${totalCount})</h2>
      <button class="trophy-close-btn" onclick="closeTrophyScreen()">✕</button>
    </div>
    <div class="trophy-grid">
      ${TROPHIES.map(
        (trophy, index) => `
        <div class="trophy-card ${trophy.unlocked ? "unlocked" : "locked"}"
             onclick="openTrophyDetail(${index})">
          <img src="${
            trophy.unlocked ? trophy.icon : "images/icon-lock.png"
          }"
               alt="${trophy.unlocked ? trophy.name : "Locked"}"
               class="trophy-card-icon">
          <div class="trophy-card-name">${
            trophy.unlocked ? trophy.name : "???"
          }</div>
        </div>
      `
      ).join("")}
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  // Animate in
  setTimeout(() => {
    overlay.classList.add("show");
    modal.classList.add("show");
  }, 10);
}

// Close trophy screen
function closeTrophyScreen() {
  const overlay = document.getElementById("trophy-overlay");
  const modal = document.getElementById("trophy-modal");
  const detail = document.getElementById("trophy-detail-modal");

  if (detail) {
    detail.classList.remove("show");
    setTimeout(() => {
      if (detail.parentNode) {
        document.body.removeChild(detail);
      }
    }, 300);
  }

  if (overlay) {
    overlay.classList.remove("show");
    setTimeout(() => {
      if (overlay.parentNode) {
        document.body.removeChild(overlay);
      }
    }, 300);
  }

  if (modal) {
    modal.classList.remove("show");
    setTimeout(() => {
      if (modal.parentNode) {
        document.body.removeChild(modal);
      }
    }, 300);
  }
}

// Open trophy detail popup
function openTrophyDetail(trophyIndex) {
  const trophy = TROPHIES[trophyIndex];

  // Close existing detail if any
  const existingDetail = document.getElementById("trophy-detail-modal");
  if (existingDetail) {
    document.body.removeChild(existingDetail);
  }

  const detailModal = document.createElement("div");
  detailModal.id = "trophy-detail-modal";
  detailModal.className = "trophy-detail-modal";
  detailModal.onclick = closeTrophyDetail;

  const detailContent = document.createElement("div");
  detailContent.className = "trophy-detail-content";
  detailContent.onclick = (e) => e.stopPropagation(); // Prevent closing when clicking inside

  detailContent.innerHTML = `
    <div class="trophy-detail-header">
      <h3>${trophy.unlocked ? trophy.name : "Locked Trophy"}</h3>
      <button class="trophy-close-btn" onclick="closeTrophyDetail()">✕</button>
    </div>
    <div class="trophy-detail-body">
      <img src="${trophy.unlocked ? trophy.icon : "images/icon-lock.png"}"
           alt="${trophy.unlocked ? trophy.name : "Locked"}"
           class="trophy-detail-icon">
      <div class="trophy-detail-info">
        <div class="trophy-detail-requirement">
          <strong>Requirement:</strong><br>
          ${trophy.requirement}
        </div>
        ${
          trophy.unlocked
            ? `
          <div class="trophy-detail-flavor">
            "${trophy.flavorText}"
          </div>
        `
            : `
          <div class="trophy-detail-locked">
            <em>Complete the requirement to unlock this trophy!</em>
          </div>
        `
        }
      </div>
    </div>
    <div class="trophy-detail-footer">
      <button class="btn btn-primary" onclick="closeTrophyDetail()">Close</button>
    </div>
  `;

  detailModal.appendChild(detailContent);
  document.body.appendChild(detailModal);

  // Animate in
  setTimeout(() => {
    detailModal.classList.add("show");
  }, 10);
}

// Close trophy detail popup
function closeTrophyDetail() {
  const detailModal = document.getElementById("trophy-detail-modal");
  if (detailModal) {
    detailModal.classList.remove("show");
    setTimeout(() => {
      if (detailModal.parentNode) {
        document.body.removeChild(detailModal);
      }
    }, 300);
  }
}
