/**
 * Enhanced Sakura Background
 * Creates and animates sakura petals in the background with looping animation
 */

// Configuration for the falling petals
const SAKURA_CONFIG = {
  TOTAL_PETALS: 100,           // Total number of petals in the air
  WIND_DURATION: 5000,        // Wind duration in ms
  WIND_MAX_SPEED: 4,          // Maximum wind speed
  FALL_DURATION_MIN: 6,       // Minimum fall duration in seconds
  FALL_DURATION_MAX: 12,      // Maximum fall duration in seconds
  PETAL_TYPES: 4              // Number of different petal types
};

// Get the sakura container
const sakuraContainer = document.querySelector('.sakura-bg');

// Wind state
let windMagnitude = 0.2;
let windDirection = 1;
let lastWindChange = 0;

// Tracking variables
let petals = [];

// Initialize the sakura background
function initSakuraBackground() {
  if (!sakuraContainer) return;
  
  // Clear any existing petals
  sakuraContainer.innerHTML = '';
  
  // Create petals in batches to avoid performance issues
  const batchSize = 20;
  let currentBatch = 0;
  
  function createBatch() {
    const start = currentBatch * batchSize;
    const end = Math.min(start + batchSize, SAKURA_CONFIG.TOTAL_PETALS);
    
    for (let i = start; i < end; i++) {
      const petal = createLoopingPetal();
      petals.push(petal);
    }
    
    currentBatch++;
    
    if (currentBatch * batchSize < SAKURA_CONFIG.TOTAL_PETALS) {
      setTimeout(createBatch, 50); // Create next batch after a short delay
    }
  }
  
  // Start creating batches
  createBatch();
  
  // Set up wind changes
  setInterval(changeWind, SAKURA_CONFIG.WIND_DURATION);
  
  // Start animation loop
  requestAnimationFrame(updateWind);
}

// Create a single petal with looping animation
function createLoopingPetal() {
  // Create a new petal element
  const petal = document.createElement('div');
  
  // Determine petal type (1-4)
  const petalType = Math.floor(Math.random() * SAKURA_CONFIG.PETAL_TYPES) + 1;
  
  // Set classes for the petal
  petal.className = `petal petal-style${petalType}`;
  
  // Set random horizontal position
  const left = Math.random() * 100;
  petal.style.left = `${left}%`;
  
  // Set random fall and sway duration
  const fallDuration = getRandomNumber(SAKURA_CONFIG.FALL_DURATION_MIN, SAKURA_CONFIG.FALL_DURATION_MAX);
  const swayDuration = fallDuration / 2;
  
  // Random initial rotation
  const rotation = Math.random() * 360;
  petal.style.transform = `rotate(${rotation}deg)`;
  
  // Apply animation with 'infinite' to loop
  petal.style.animation = `fall ${fallDuration}s linear infinite, sway-${petalType % 4 + 1} ${swayDuration}s ease-in-out infinite`;
  
  // Set a random delay so all petals don't start at the same position
  const randomDelay = Math.random() * fallDuration;
  petal.style.animationDelay = `-${randomDelay}s`;
  
  // Store properties on the element for later use
  petal.fallDuration = fallDuration;
  
  // Add the petal to the container
  sakuraContainer.appendChild(petal);
  
  return petal;
}

// Update wind effect based on time
function updateWind() {
  const now = Date.now();
  const dt = (now - lastWindChange) / SAKURA_CONFIG.WIND_DURATION;
  
  // Smooth sinusoidal interpolation for wind
  const windEffect = Math.sin(dt * Math.PI) * windMagnitude * windDirection;
  
  // Apply subtle wind variations to some petals
  if (Math.random() < 0.05) {
    petals.forEach(petal => {
      if (Math.random() < 0.2) {
        const variation = (Math.random() * 2 - 1) * windEffect;
        petal.style.marginLeft = `${variation * 5}px`;
      }
    });
  }
  
  requestAnimationFrame(updateWind);
}

// Change wind parameters
function changeWind() {
  windMagnitude = Math.random() * SAKURA_CONFIG.WIND_MAX_SPEED;
  windDirection = Math.random() > 0.5 ? 1 : -1;
  lastWindChange = Date.now();
  
  // Apply wind effect to existing petals
  petals.forEach(petal => {
    const windEffect = windMagnitude * windDirection;
    petal.style.marginLeft = `${windEffect * 10}px`;
  });
}

// Helper function to get a random number between min and max
function getRandomNumber(min, max) {
  return min + Math.random() * (max - min);
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', initSakuraBackground);

// Reinitialize on window resize for better distribution
window.addEventListener('resize', () => {
  petals.forEach(petal => petal.remove());
  petals = [];
  
  // Create petals again
  for (let i = 0; i < SAKURA_CONFIG.TOTAL_PETALS; i++) {
    const petal = createLoopingPetal();
    petals.push(petal);
  }
});

function toggleAudio() {
  console.log("Audio toggle clicked. Current state:", state.isAudioPlaying);
  
  // Make sure audio is initialized
  if (!state.audioInitialized) {
    state.audioInitialized = true;
  }
  
  if (state.isAudioPlaying) {
    // Currently playing - pause it
    console.log("Pausing audio");
    elements.bgMusic.pause();
    state.isAudioPlaying = false;
    elements.audioToggle.innerHTML = '🔇';
  } else {
    // Currently paused - play it
    console.log("Attempting to play audio");
    elements.bgMusic.play()
      .then(() => {
        console.log("Audio resumed successfully");
        state.isAudioPlaying = true;
        elements.audioToggle.innerHTML = '🔊';
      })
      .catch(error => {
        console.log("Audio couldn't resume:", error);
        state.isAudioPlaying = false;
        elements.audioToggle.innerHTML = '🔇';
      });
  }
}

function moveButtonRandomly() {
  // Get the current window dimensions to ensure button stays in viewport
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  // Get button dimensions
  const btnRect = elements.noBtn.getBoundingClientRect();
  const btnWidth = btnRect.width;
  const btnHeight = btnRect.height;
  
  // Calculate the maximum allowed position values
  // Use a much larger safety margin to ensure button is always fully visible
  const safeMargin = 80; // Increased from 60 to 80
  const maxX = windowWidth - btnWidth - safeMargin;
  const maxY = windowHeight - btnHeight - safeMargin;
  
  // Calculate a random position that's guaranteed to be visible
  // Limit to a smaller range for more reliability
  const randomX = Math.min(Math.max(safeMargin, Math.random() * (maxX - safeMargin)), maxX - safeMargin);
  
  // For Y position, prefer the upper 70% of the visible area
  // but with stricter bounds to ensure visibility
  let randomY;
  if (Math.random() < 0.8) { // 80% chance to be in the upper portion
    // Upper 60% of the screen with extra safety margin
    randomY = Math.min(Math.max(safeMargin, Math.random() * (maxY * 0.5)), maxY * 0.5);
  } else {
    // Lower 40% of the screen, but with stricter bounds
    randomY = Math.min(Math.max(maxY * 0.5 + safeMargin, Math.random() * (maxY * 0.8)), maxY * 0.8);
  }
  
  // Reset any previous transform
  elements.noBtn.style.transform = 'none';
  
  // Apply the new position
  elements.noBtn.style.position = 'fixed';
  elements.noBtn.style.left = `${randomX}px`;
  elements.noBtn.style.top = `${randomY}px`;
  
  // Add a slight rotation for fun
  const rotation = Math.random() * 20 - 10; // -10 to +10 degrees
  elements.noBtn.style.transform = `rotate(${rotation}deg)`;
}

function triggerCelebration() {
  // Hide the original sakura background with a fade-out effect
  const sakuraBg = document.querySelector('.sakura-bg');
  if (sakuraBg) {
    sakuraBg.style.transition = 'opacity 1s ease-out';
    sakuraBg.style.opacity = '0';
    
    // Remove it after the fade-out completes
    setTimeout(() => {
      sakuraBg.remove();
    }, 1000);
  }
  
  // Show the celebration container
  elements.celebration.style.display = 'block';
  
  // Initialize celebration petals
  initializeCelebrationPetals();
  
  // Start wind changes for celebration
  setInterval(changeCelebrationWind, 3000);
  
  // Show thank you message
  setTimeout(showThankYou, 1500);
} 