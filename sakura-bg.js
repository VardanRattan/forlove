// Configuration for the falling petals
const SAKURA_CONFIG = {
  TOTAL_PETALS: 100,           // Total number of petals in the air
  WIND_DURATION: 5000,        // Wind duration in ms
  WIND_MAX_SPEED: 4,          // Maximum wind speed
  FALL_DURATION_MIN: 6,       // Minimum fall duration in seconds
  FALL_DURATION_MAX: 12,      // Maximum fall duration in seconds
  PETAL_TYPES: 4,             // Number of different petal types
  BATCH_SIZE: 20,             // Number of petals to create per batch
  WIND_UPDATE_INTERVAL: 100   // How often to update wind effect (ms)
};

// Get the sakura container (lazy)
let sakuraContainer = null;

// Wind state
let windMagnitude = 0.2;
let windDirection = 1;
let lastWindChange = 0;

// Tracking variables
let petals = [];

// Initialize the sakura background
function initSakuraBackground() {
  sakuraContainer = document.querySelector('.sakura-bg');
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
  const petal = document.createElement('div');
  const petalType = Math.floor(Math.random() * SAKURA_CONFIG.PETAL_TYPES) + 1;
  petal.className = `petal petal-style${petalType}`;
  
  // Set initial position using left property instead of transform
  const left = Math.random() * window.innerWidth;
  petal.style.left = `${left}px`;
  
  const fallDuration = getRandomNumber(SAKURA_CONFIG.FALL_DURATION_MIN, SAKURA_CONFIG.FALL_DURATION_MAX);
  const swayDuration = fallDuration / 2;
  
  // Apply animations
  petal.style.animation = `fall ${fallDuration}s linear infinite, sway-${petalType % 4 + 1} ${swayDuration}s ease-in-out infinite`;
  petal.style.animationDelay = `-${Math.random() * fallDuration}s`;
  
  petal.fallDuration = fallDuration;
  sakuraContainer.appendChild(petal);
  
  return petal;
}

// Update wind effect based on time
function updateWind() {
  const now = Date.now();
  const dt = (now - lastWindChange) / SAKURA_CONFIG.WIND_DURATION;
  
  // Smooth sinusoidal interpolation for wind
  const windEffect = Math.sin(dt * Math.PI) * windMagnitude * windDirection;
  
  // Batch wind updates to reduce DOM operations
  if (Math.random() < 0.05) {
    petals.forEach(petal => {
      if (Math.random() < 0.2) {
        const variation = (Math.random() * 2 - 1) * windEffect;
        // Use marginLeft for wind effect to work with CSS animations
        const currentMargin = parseFloat(petal.style.marginLeft || '0');
        petal.style.marginLeft = `${currentMargin + variation * 5}px`;
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
  
  // Batch wind effect updates
  const windEffect = windMagnitude * windDirection;
  petals.forEach(petal => {
    const currentMargin = parseFloat(petal.style.marginLeft || '0');
    petal.style.marginLeft = `${currentMargin + windEffect * 10}px`;
  });
}

// Helper function to get a random number between min and max
function getRandomNumber(min, max) {
  return min + Math.random() * (max - min);
}

function repopulatePetals() {
  if (!sakuraContainer) {
    sakuraContainer = document.querySelector('.sakura-bg');
    if (!sakuraContainer) return;
  }
  
  petals.forEach(petal => petal.remove());
  petals = [];
  
  let currentBatch = 0;
  (function createBatch() {
    const start = currentBatch * SAKURA_CONFIG.BATCH_SIZE;
    const end = Math.min(start + SAKURA_CONFIG.BATCH_SIZE, SAKURA_CONFIG.TOTAL_PETALS);
    
    for (let i = start; i < end; i++) {
      const petal = createLoopingPetal();
      petals.push(petal);
    }
    
    currentBatch++;
    
    if (currentBatch * SAKURA_CONFIG.BATCH_SIZE < SAKURA_CONFIG.TOTAL_PETALS) {
      setTimeout(createBatch, 50);
    }
  })();
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', initSakuraBackground);

const RESIZE_EVENT = (window.APP_EVENTS && window.APP_EVENTS.DEBOUNCED_RESIZE) || 'app:debouncedResize';

// Reinitialize on debounced resize from main script
window.addEventListener(RESIZE_EVENT, repopulatePetals);