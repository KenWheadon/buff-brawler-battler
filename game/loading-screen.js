// Loading Screen Manager

class LoadingScreen {
  constructor() {
    this.elements = {};
    this.minimumLoadTime = 3000; // 3 seconds minimum
    this.startTime = null;
    this.isComplete = false;
    this.onStartCallback = null;
    this.onCompleteCallback = null;
    this.logoSprite = null;

    // Asset lists - all images and audio used in the game
    this.allImages = [
      // Spritesheets
      "images/company-logo-spritesheet-1386-1818.png",
      "images/losing-spritesheet-1464-1554.png",
      "images/winning-spritesheet-1350-1578.png",
      "images/pose8-spritesheet-2076-2814.png",
      "images/pose5-hit-spritesheet-2064-1548.png",
      "images/pose3-hit-spritesheet-2064-1548.png",
      "images/pose4-hit-spritesheet-2064-1548.png",
      "images/pose2-hit-spritesheet-2064-1548.png",
      "images/logo-thin-spritesheet-1512-1548.png",
      "images/logo-thin-spritesheet-3072-3072.png",
      // Story images
      "images/story0.jpg",
      "images/story1.jpg",
      "images/story2.jpg",
      "images/story3.jpg",
      "images/story4.jpg",
      "images/story5.jpg",
      "images/story6.jpg",
      "images/story7.jpg",
      // Player sprites
      "images/player-default.png",
      "images/player-0hp.png",
      "images/player-1hp.png",
      "images/player-2hp.png",
      "images/player-win.png",
      // Pose images
      "images/pose1.png",
      "images/pose2.png",
      "images/pose2-dmg.png",
      "images/pose3.png",
      "images/pose3-dmg.png",
      "images/pose4.png",
      "images/pose4-dmg.png",
      "images/pose5.png",
      "images/pose5-dmg.png",
      "images/pose7.png",
      "images/pose8.png",
      "images/pose9.png",
      // Icons
      "images/company-logo.png",
      "images/logo-thick.png",
      "images/icon-mouse.png",
      "images/icon-record.png",
      "images/icon-lock.png",
      "images/icon-demon.png",
      "images/icon-1stmedal.png",
      "images/icon-musicnote.png",
      "images/icon-brain.png",
      "images/icon-star.png",
      "images/icon-waterbottle.png",
      "images/icon-alarmclock.png",
      "images/icon-stopwatch.png",
      "images/icon-sandwich.png",
      "images/icon-trophy.png",
      "images/icon-crown.png",
      "images/icon-eyeball.png",
      "images/icon-orangejuice.png",
      "images/icon-rabbitfoot.png",
      "images/icon-diamondsnap.png",
      "images/icon-book.png",
      "images/icon-skull.png",
      "images/icon-diamondtrophy.png",
      "images/icon-diamond.png",
      "images/icon-teeth.png",
      "images/icon-questionmark.png",
      "images/icon-horseshoe.png",
      "images/icon-raygun.png",
      "images/icon-lasersword.png",
      // Game assets
      "images/shield.png",
      "images/rocket.png",
      "images/heart.png",
      "images/plasma.png",
      "images/timecrystal.png",
      "images/sword.png",
    ];

    this.allAudio = [
      // Music tracks
      "audio/intro-song.mp3",
      "audio/intro-2.mp3",
      "audio/main-audio.mp3",
      "audio/infi-audio.mp3",
      // Sound effects
      "audio/btn-click.mp3",
      "audio/btn-hover.mp3",
      "audio/timewarp.mp3",
      "audio/robo-death.mp3",
      "audio/robo-final-death.mp3",
      // Pose sounds
      "audio/pose2-charge.mp3",
      "audio/pose2-hit.mp3",
      "audio/pose2-miss.mp3",
      "audio/pose3-charge.mp3",
      "audio/pose3-hit.mp3",
      "audio/pose3-miss.mp3",
      "audio/pose4-charge.mp3",
      "audio/pose4-hit.mp3",
      "audio/pose4-miss.mp3",
      "audio/pose5-charge.mp3",
      "audio/pose5-hit.mp3",
      "audio/pose5-miss.mp3",
      // UI sounds
      "audio/title-glitch-in.mp3",
      "audio/title-trans.mp3",
      "audio/eyeball-show.mp3",
      "audio/story-page.mp3",
      "audio/popup-appear.mp3",
      "audio/accordion-open.mp3",
      // Combat sounds
      "audio/player-damage.mp3",
      "audio/enemy-damage.mp3",
      "audio/timer-runningout.mp3",
      "audio/shake.mp3",
      // Victory sounds
      "audio/award-star.mp3",
      "audio/win-screen.mp3",
      "audio/new-record.mp3",
      // Trophy
      "audio/trophy-award.mp3",
    ];
  }

  // Create and inject the loading screen HTML
  createLoadingScreen() {
    // Check if already created
    if (this.elements.screen) {
      return;
    }

    // Create the loading screen HTML
    const loadingHTML = `
      <div id="loading-screen">
        <div id="loading-content">
          <div id="loading-logo-container"></div>
          <div id="loading-progress-bar">
            <div id="loading-progress-fill"></div>
          </div>
          <div id="loading-progress-text">0%</div>
          <div id="producer-text">Produced by Weird Demon Games</div>
          <button id="loading-start-btn" class="loading-start-btn">START GAME</button>
        </div>
      </div>
    `;

    // Insert at the beginning of body
    document.body.insertAdjacentHTML("afterbegin", loadingHTML);

    // Store references to elements
    this.elements = {
      screen: document.getElementById("loading-screen"),
      progressBar: document.getElementById("loading-progress-bar"),
      progressFill: document.getElementById("loading-progress-fill"),
      progressText: document.getElementById("loading-progress-text"),
      startButton: document.getElementById("loading-start-btn"),
      producerText: document.getElementById("producer-text"),
      logoContainer: document.getElementById("loading-logo-container"),
    };

    // Initialize logo animation after elements are created
    this.initLogoAnimation();
  }

  // Initialize the company logo sprite animation
  initLogoAnimation() {
    // Show static logo first
    const staticImg = document.createElement("img");
    staticImg.src = "images/company-logo.png";
    staticImg.style.width = "100%";
    staticImg.style.height = "100%";
    staticImg.style.objectFit = "contain";
    staticImg.id = "static-logo";

    this.elements.logoContainer.appendChild(staticImg);

    // Create the animated logo sprite (but don't start it yet)
    this.logoSprite = new SpriteSheet({
      imagePath: "images/company-logo-spritesheet-1386-1818.png",
      frameWidth: 21, // offset from left of the cell
      frameHeight: 30, // offset from top of the cell
      frameContentWidth: 210, // THIS is the width of your logo content
      frameContentHeight: 273, // THIS is the height of your logo content
      rows: 6,
      cols: 6,
      fps: 12,
      loop: true,
    });
  }

  // Switch from static logo to animated sprite
  startLogoAnimation() {
    // Remove static logo
    const staticLogo = document.getElementById("static-logo");
    if (staticLogo) {
      staticLogo.remove();
    }

    // Create container for the animated sprite
    const img = document.createElement("img");
    img.src = "images/company-logo-spritesheet-1386-1818.png";
    img.style.position = "absolute";
    img.style.top = "0";
    img.style.left = "0";

    this.elements.logoContainer.appendChild(img);

    // Start the animation
    this.logoSprite.play(this.elements.logoContainer);
  }

  // Helper function to add both click and touch event listeners
  addTouchAndClickListener(element, handler) {
    let touchHandled = false;

    // Add touchstart listener to track touch events
    element.addEventListener("touchstart", () => {
      touchHandled = true;
    });

    // Add touchend listener for touch devices
    element.addEventListener("touchend", (e) => {
      if (touchHandled) {
        e.preventDefault(); // Prevent ghost click
        handler(e);
        // Reset flag after a short delay
        setTimeout(() => {
          touchHandled = false;
        }, 500);
      }
    });

    // Add click listener for mouse/desktop
    element.addEventListener("click", (e) => {
      // Only handle click if it wasn't preceded by a touch
      if (!touchHandled) {
        handler(e);
      }
    });
  }

  show() {
    // Create the loading screen if it doesn't exist
    this.createLoadingScreen();

    this.elements.screen.style.display = "flex";
    this.elements.progressBar.style.display = "block";
    this.elements.progressText.style.display = "block";
    this.elements.startButton.style.display = "none";
    this.elements.producerText.style.display = "none";
    this.startTime = Date.now();
    this.isComplete = false;
    this.updateProgress(0);
  }

  hide() {
    this.elements.screen.style.display = "none";
  }

  updateProgress(percent) {
    const clampedPercent = Math.min(100, Math.max(0, percent));
    this.elements.progressFill.style.width = `${clampedPercent}%`;
    this.elements.progressText.textContent = `${Math.floor(clampedPercent)}%`;
  }

  async complete(onCompleteCallback, onStartCallback) {
    // Store the callbacks
    this.onCompleteCallback = onCompleteCallback;
    this.onStartCallback = onStartCallback; // For when the button is clicked

    // Mark as complete
    this.isComplete = true;

    // Calculate elapsed time
    const elapsed = Date.now() - this.startTime;
    const remaining = Math.max(0, this.minimumLoadTime - elapsed);

    // If we haven't reached minimum time, animate to 100% over remaining time
    if (remaining > 0) {
      await this.animateToComplete(remaining);
    } else {
      // Already past minimum time, just set to 100%
      this.updateProgress(100);
    }

    // Brief pause to show 100%
    await this.delay(300);

    // Switch to animated logo
    this.startLogoAnimation();

    // Brief pause to let animation start
    await this.delay(200);

    // Transform progress bar into start button
    this.showStartButton();

    // Execute the onCompleteCallback immediately
    if (this.onCompleteCallback) {
      this.onCompleteCallback();
    }
  }

  showStartButton() {
    // Hide progress elements
    this.elements.progressBar.style.display = "none";
    this.elements.progressText.style.display = "none";

    // Show producer text with fade-in
    if (this.elements.producerText) {
      this.elements.producerText.style.display = "block";
      // Trigger reflow to ensure transition works
      this.elements.producerText.offsetHeight;
      this.elements.producerText.classList.add("visible");
    }

    // Show and setup start button
    this.elements.startButton.style.display = "block";
    this.addTouchAndClickListener(this.elements.startButton, () => {
      this.hide();
      if (this.onStartCallback) {
        this.onStartCallback();
      }
    });
  }

  async animateToComplete(duration) {
    const startProgress =
      parseFloat(this.elements.progressFill.style.width) || 0;
    const startTime = Date.now();

    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        const currentProgress =
          startProgress + (100 - startProgress) * progress;

        this.updateProgress(currentProgress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      animate();
    });
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Preload all game assets (images and audio) with progress tracking
   * @returns {Promise} - Resolves when all assets are loaded
   */
  async preloadAllAssets() {
    const totalAssets = this.allImages.length + this.allAudio.length;
    let loadedAssets = 0;

    const updateProgress = () => {
      loadedAssets++;
      const progress = (loadedAssets / totalAssets) * 95; // Cap at 95%
      this.updateProgress(progress);
    };

    // Load images with progress updates
    const imagePromises = this.allImages.map((url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          updateProgress();
          resolve();
        };
        img.onerror = () => {
          console.error(`Failed to load image: ${url}`);
          updateProgress();
          resolve();
        };
        img.src = url;
      });
    });

    // Load audio files with progress updates
    const audioPromises = this.allAudio.map((url) => {
      return new Promise((resolve) => {
        const audio = new Audio();

        const handleLoad = () => {
          audio.removeEventListener("canplaythrough", handleLoad);
          audio.removeEventListener("error", handleError);
          updateProgress();
          resolve();
        };

        const handleError = () => {
          console.error(`Failed to load audio: ${url}`);
          audio.removeEventListener("canplaythrough", handleLoad);
          audio.removeEventListener("error", handleError);
          updateProgress();
          resolve();
        };

        audio.addEventListener("canplaythrough", handleLoad);
        audio.addEventListener("error", handleError);
        audio.src = url;
        audio.load();
      });
    });

    return Promise.all([...imagePromises, ...audioPromises]);
  }
}

// Create global instance
let loadingScreen;

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    loadingScreen = new LoadingScreen();
  });
} else {
  // DOM already loaded
  loadingScreen = new LoadingScreen();
}
