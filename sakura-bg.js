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
  
  // Start with a certain number of petals
  for (let i = 0; i < SAKURA_CONFIG.TOTAL_PETALS; i++) {
    const petal = createLoopingPetal();
    petals.push(petal);
  }
  
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