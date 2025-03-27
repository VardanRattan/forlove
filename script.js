// script.js
// Configuration
const CONFIG = {
  MAX_NO_ATTEMPTS: 8,
  YES_GROWTH_FACTOR: 0.15,
  BUTTON_MOVE_RANGE: 0.4 // 40% of viewport
};

// State
let state = {
  yesBtnScale: 1,
  noBtnClicks: 0,
  isAudioPlaying: false,
  audioInitialized: false
};

// DOM Elements
const elements = {
  yesBtn: document.getElementById('yesBtn'),
  noBtn: document.getElementById('noBtn'),
  celebration: document.querySelector('.celebration'),
  thankYou: document.getElementById('thankYou'),
  poem: document.getElementById('verse'),
  question: document.getElementById('question'),
  bgMusic: document.getElementById('bgMusic'),
  audioToggle: document.getElementById('audioToggle')
};

// Sakura Symbols
const SAKURA = ['🌸', '🌺', '✿', '❀', '🌹'];

// Initialization
function init() {
  setupEventListeners();
  handleAudio();
  
  // Ensure buttons start with proper styling
  elements.yesBtn.style.fontSize = '1.1rem'; // Base font size
  elements.yesBtn.style.position = 'relative';
  
  // Ensure the No button has a proper starting point
  elements.noBtn.style.position = 'static'; // Reset to default position in document flow
  elements.noBtn.style.transform = 'none';  // Clear any transforms
}

// Event Listeners
function setupEventListeners() {
  elements.noBtn.addEventListener('click', handleNoClick);
  elements.noBtn.addEventListener('touchstart', handleNoClick);
  elements.yesBtn.addEventListener('click', handleYesClick);
  elements.audioToggle.addEventListener('click', toggleAudio);
  
  // Add click event to the entire document to enable audio on first interaction
  document.addEventListener('click', function firstInteractionHandler(event) {
    // Skip if this is the audio toggle button itself
    if (event.target !== elements.audioToggle) {
      playAudioOnFirstInteraction();
    }
    // Remove this event listener after first interaction
    document.removeEventListener('click', firstInteractionHandler);
  }, { once: true });
}

// Audio Handling
function handleAudio() {
  // Set initial volume but don't autoplay - we'll play on first interaction
  elements.bgMusic.volume = 0.2;
  state.isAudioPlaying = false;
  state.audioInitialized = false;
  
  // Update UI to show muted initially
  elements.audioToggle.innerHTML = '🔇';
}

function playAudioOnFirstInteraction() {
  // Only play if this is the first interaction (audio not yet initialized)
  if (!state.audioInitialized) {
    console.log("First interaction detected, initializing audio");
    
    // Mark as initialized regardless of play success
    state.audioInitialized = true;
    
    elements.bgMusic.play()
      .then(() => {
        console.log("Audio started successfully");
        state.isAudioPlaying = true;
        elements.audioToggle.innerHTML = '🔊';
      })
      .catch(error => {
        console.log("Audio couldn't play:", error);
        state.isAudioPlaying = false;
        elements.audioToggle.innerHTML = '🔇';
      });
  }
}

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

function updateAudioUI(isPlaying) {
  elements.audioToggle.innerHTML = isPlaying ? '🔊' : '🔇';
  // We don't modify state.isAudioPlaying here, only update the UI
}

// No Button Handler (Random Movement Only on Click/Touch)
function handleNoClick(e) {
  e.preventDefault();
  
  // Reset any existing transform or position that might cause issues
  elements.noBtn.style.transform = 'none';
  
  state.noBtnClicks++;
  moveButtonRandomly();
  growYesButton();
  
  // Center the Yes button
  elements.yesBtn.style.position = 'relative';
  elements.yesBtn.style.left = '0';
  elements.yesBtn.style.top = '0';
  
  // Make sure the No button didn't go out of bounds
  setTimeout(() => {
    const btnRect = elements.noBtn.getBoundingClientRect();
    const isOutOfBounds = 
      btnRect.left < 0 || 
      btnRect.right > window.innerWidth ||
      btnRect.top < 0 || 
      btnRect.bottom > window.innerHeight;
    
    if (isOutOfBounds) {
      // If out of bounds, reposition to center
      elements.noBtn.style.left = '50%';
      elements.noBtn.style.top = '50%';
      elements.noBtn.style.transform = 'translate(-50%, -50%) rotate(5deg)';
    }
  }, 50); // Small delay to let the browser update the position
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
  const safeMargin = 60; // Increased from 40 to 60
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
  
  // Apply position with fixed positioning
  elements.noBtn.style.position = 'fixed';
  elements.noBtn.style.left = `${randomX}px`;
  elements.noBtn.style.top = `${randomY}px`;
  
  // Add rotation after positioning
  const randomRotation = Math.random() * 20 - 10; // -10 to +10 degrees
  elements.noBtn.style.transform = `rotate(${randomRotation}deg)`;
}

function growYesButton() {
  // Still apply a size limit for visual aesthetics, but allow No button to continue wandering
  if (state.yesBtnScale >= 1.5) {
    state.yesBtnScale = 1.5; // Cap at max size
  } else {
    state.yesBtnScale += CONFIG.YES_GROWTH_FACTOR;
  }
  
  // Scale the button
  elements.yesBtn.style.transform = `scale(${state.yesBtnScale})`;
  
  // Also increase the font size proportionally, but slightly less to keep text within button
  const textScale = 1 + ((state.yesBtnScale - 1) * 0.7); // Scale text at 70% of button scale rate
  elements.yesBtn.style.fontSize = `${textScale}rem`;
  
  // Add padding adjustment to ensure text doesn't overflow
  const paddingAdjust = Math.max(0.8, 0.8 / state.yesBtnScale);
  elements.yesBtn.style.padding = `${paddingAdjust}rem ${paddingAdjust * 1.8}rem`;
}

// Yes Button Handler
function handleYesClick() {
  // Add a nice scale animation to the yes button before hiding
  elements.yesBtn.style.transition = 'transform 0.3s ease-out, opacity 0.5s ease-in-out';
  elements.yesBtn.style.transform = 'scale(1.2)';
  
  // Fade out the poem and question with a slight delay
  setTimeout(() => {
    hideElements([elements.poem, elements.question, elements.yesBtn, elements.noBtn]);
    showThankYou();
    
    // Create a smooth transition between backgrounds
    createCelebrationBackground();
    
    // Trigger the center burst effect
    setTimeout(triggerCelebration, 300);
  }, 200);
}

// Creates a beautiful celebration background to replace the sakura petals
function createCelebrationBackground() {
  // First, make the current petals fade out gracefully
  const existingSakura = document.querySelector('.sakura-bg');
  if (existingSakura) {
    existingSakura.style.transition = 'opacity 0.8s ease-out';
    existingSakura.style.opacity = '0';
    
    // Remove it after the transition
    setTimeout(() => {
      existingSakura.remove();
      
      // Create the new celebration background
      const celebrationBg = document.createElement('div');
      celebrationBg.className = 'sakura-bg celebration-bg';
      document.body.appendChild(celebrationBg);
      
      // Start with opacity 0 for a fade-in effect
      celebrationBg.style.opacity = '0';
      
      // Override the existing petal styles with vibrant celebration colors
      applyColorfulPetalStyles();
      
      // Configure the celebration petals
      initializeCelebrationPetals();
      
      // Fade in the new background
      setTimeout(() => {
        celebrationBg.style.transition = 'opacity 0.8s ease-in';
        celebrationBg.style.opacity = '1';
      }, 50);
    }, 800);
  } else {
    // If no existing background, just create the new one directly
    const celebrationBg = document.createElement('div');
    celebrationBg.className = 'sakura-bg celebration-bg';
    document.body.appendChild(celebrationBg);
    
    applyColorfulPetalStyles();
    initializeCelebrationPetals();
  }
}

// Celebration Effects
function triggerCelebration() {
  elements.celebration.style.display = 'block';
  
  // Enhanced burst effect with more petals
  const maxPetals = Math.min(80, window.innerWidth / 7);
  
  // Create petals in an outward burst pattern with staggered timing
  for (let i = 0; i < maxPetals; i++) {
    setTimeout(() => createEnhancedCelebrationPetal(), i * 12);
  }
}

function createEnhancedCelebrationPetal() {
  // Create a shiny celebration petal element instead of using emoji text
  const petal = document.createElement('div');
  
  // Choose a random color for the burst petals to match the background celebration
  const colorClasses = ['burst-gold', 'burst-red', 'burst-green', 'burst-blue'];
  const colorClass = colorClasses[Math.floor(Math.random() * colorClasses.length)];
  
  // Set the petal class for styling
  petal.className = `burst-petal ${colorClass}`;
  
  // Style the petal
  Object.assign(petal.style, {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: '20px',
    height: '20px',
    opacity: '1',
    transform: 'translate(-50%, -50%)',
    borderRadius: Math.random() > 0.5 ? '50%' : '4px',
    boxShadow: '0 0 8px rgba(255, 255, 255, 0.7)'
  });
  
  elements.celebration.appendChild(petal);
  animateEnhancedCelebrationPetal(petal);
}

function animateEnhancedCelebrationPetal(petal) {
  // Create more dynamic and varied burst patterns
  const angle = Math.random() * Math.PI * 2;
  const distance = 100 + Math.random() * 300; // Longer distance for wider burst
  const duration = 0.8 + Math.random() * 1.5; // Faster animation
  const rotations = 1 + Math.random() * 3; // Multiple rotations
  
  // Add a bit of variation to the starting point
  const smallOffset = (Math.random() * 20) - 10;
  petal.style.left = `calc(50% + ${smallOffset}px)`;
  petal.style.top = `calc(50% + ${smallOffset}px)`;
  
  let start = null;
  const animate = (timestamp) => {
    if (!start) start = timestamp;
    const progress = (timestamp - start) / (duration * 1000);
    
    if (progress < 1) {
      // Use improved easing function for more natural movement
      const eased = enhancedEase(progress);
      const currentDistance = distance * eased;
      const x = Math.cos(angle) * currentDistance;
      const y = Math.sin(angle) * currentDistance;
      
      // Apply transforms with scale effects
      const scale = 1 - (progress * 0.5); // Shrink as they fly out
      const rotate = progress * 360 * rotations;
      
      petal.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) 
                               rotate(${rotate}deg) scale(${scale})`;
      
      // Fade out near the end
      petal.style.opacity = progress > 0.7 ? (1 - ((progress - 0.7) / 0.3)) : 1;
      
      requestAnimationFrame(animate);
    } else {
      petal.remove();
    }
  };
  requestAnimationFrame(animate);
}

// Enhanced easing function for more dynamic movement
function enhancedEase(t) {
  // Start fast, then slow down at the end
  return t < 0.2 ? 5 * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// Apply additional styles for the burst petals
function applyColorfulPetalStyles() {
  // Remove any existing style element first
  const existingStyle = document.getElementById('celebration-styles');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Create a style element for the colorful petals
  const styleElement = document.createElement('style');
  styleElement.id = 'celebration-styles';
  
  // Define a rich, vibrant color palette for the celebration
  styleElement.textContent = `
    .celebration-bg .petal-style1 {
      background: radial-gradient(ellipse at center, #ffea8c 0%, #ffd700 100%);
      border-radius: 150% 0 150% 0;
      box-shadow: 0 0 5px rgba(255, 215, 0, 0.3);
    }
    
    .celebration-bg .petal-style2 {
      background: radial-gradient(ellipse at center, #ff9e9e 0%, #ff5252 100%);
      border-radius: 150% 0 150% 150%;
      box-shadow: 0 0 5px rgba(255, 82, 82, 0.3);
    }
    
    .celebration-bg .petal-style3 {
      background: radial-gradient(ellipse at center, #a5f7af 0%, #4caf50 100%);
      border-radius: 150% 150% 0 150%;
      box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
    }
    
    .celebration-bg .petal-style4 {
      background: radial-gradient(ellipse at center, #b5c8ff 0%, #536dfe 100%);
      border-radius: 0 150% 150% 150%;
      box-shadow: 0 0 5px rgba(83, 109, 254, 0.3);
    }
    
    /* Burst petal colors to match the background celebration */
    .burst-gold {
      background: radial-gradient(ellipse at center, #fffad1 0%, #ffd700 100%);
    }
    
    .burst-red {
      background: radial-gradient(ellipse at center, #ffdbdb 0%, #ff5252 100%);
    }
    
    .burst-green {
      background: radial-gradient(ellipse at center, #d4ffd8 0%, #4caf50 100%);
    }
    
    .burst-blue {
      background: radial-gradient(ellipse at center, #d8e7ff 0%, #536dfe 100%);
    }
    
    /* Enhanced fall animation for celebration petals */
    @keyframes celebration-fall {
      0% {
        transform: translateY(-10%) rotate(0deg) scale(0.8);
        opacity: 0;
      }
      10% {
        opacity: 0.9;
        transform: translateY(-5%) rotate(36deg) scale(1);
      }
      90% {
        opacity: 0.7;
        transform: translateY(100vh) rotate(324deg) scale(0.9);
      }
      100% {
        transform: translateY(110vh) rotate(360deg) scale(0.8);
        opacity: 0;
      }
    }
  `;
  
  document.head.appendChild(styleElement);
}

// Initialize the celebration petals with enhanced animation
function initializeCelebrationPetals() {
  // Clear any existing global animation variables
  if (window.windInterval) {
    clearInterval(window.windInterval);
  }
  
  // Configure the celebration animation
  window.SAKURA_CONFIG = {
    TOTAL_PETALS: 150,          // More petals for celebration
    WIND_DURATION: 4000,        // Faster wind changes
    WIND_MAX_SPEED: 5,          // Stronger wind
    FALL_DURATION_MIN: 4,       // Faster falling
    FALL_DURATION_MAX: 8,       // Faster falling
    PETAL_TYPES: 4              // Same number of types
  };
  
  // Initialize wind state
  window.windMagnitude = 0.5;
  window.windDirection = 1;
  window.lastWindChange = 0;
  window.petals = [];
  
  // Create petals with staggered appearance for a cascade effect
  const totalPetals = window.SAKURA_CONFIG.TOTAL_PETALS;
  const batchSize = 30; // Create petals in batches for better performance
  
  function createPetalsBatch(startIndex, count) {
    const endIndex = Math.min(startIndex + count, totalPetals);
    
    for (let i = startIndex; i < endIndex; i++) {
      const petal = createBackgroundCelebrationPetal();
      window.petals.push(petal);
    }
    
    // Continue creating petals in batches until we reach the total
    if (endIndex < totalPetals) {
      setTimeout(() => createPetalsBatch(endIndex, count), 100);
    }
  }
  
  // Start creating petals in batches
  createPetalsBatch(0, batchSize);
  
  // Set up wind changes
  window.windInterval = setInterval(changeCelebrationWind, window.SAKURA_CONFIG.WIND_DURATION);
  
  // Start animation loop
  requestAnimationFrame(updateCelebrationWind);
}

// Create a single petal for the celebration background effect with enhanced visual appeal
function createBackgroundCelebrationPetal() {
  const petal = document.createElement('div');
  
  // Determine petal type (1-4)
  const petalType = Math.floor(Math.random() * window.SAKURA_CONFIG.PETAL_TYPES) + 1;
  
  // Set classes for the petal
  petal.className = `petal petal-style${petalType}`;
  
  // Set random horizontal position
  const left = Math.random() * 100;
  petal.style.left = `${left}%`;
  
  // Random scale for depth effect
  const scale = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
  
  // Set random fall and sway duration
  const fallDuration = getRandomNumber(window.SAKURA_CONFIG.FALL_DURATION_MIN, window.SAKURA_CONFIG.FALL_DURATION_MAX);
  const swayDuration = fallDuration / 2;
  
  // Random initial rotation
  const rotation = Math.random() * 360;
  petal.style.transform = `rotate(${rotation}deg) scale(${scale})`;
  
  // Apply enhanced celebration animation
  petal.style.animation = `celebration-fall ${fallDuration}s linear infinite, sway-${petalType % 4 + 1} ${swayDuration}s ease-in-out infinite`;
  
  // Set a random delay so all petals don't start at the same position
  const randomDelay = Math.random() * fallDuration;
  petal.style.animationDelay = `-${randomDelay}s`;
  
  // Store properties on the element for later use
  petal.fallDuration = fallDuration;
  petal.scale = scale;
  
  // Add the petal to the container
  document.querySelector('.celebration-bg').appendChild(petal);
  
  return petal;
}

// Update wind effect for celebration
function updateCelebrationWind() {
  const now = Date.now();
  const dt = (now - window.lastWindChange) / window.SAKURA_CONFIG.WIND_DURATION;
  
  // Smooth sinusoidal interpolation for wind
  const windEffect = Math.sin(dt * Math.PI) * window.windMagnitude * window.windDirection;
  
  // Apply subtle wind variations to some petals
  if (Math.random() < 0.05) {
    window.petals.forEach(petal => {
      if (Math.random() < 0.2) {
        const variation = (Math.random() * 2 - 1) * windEffect;
        petal.style.marginLeft = `${variation * 5}px`;
      }
    });
  }
  
  requestAnimationFrame(updateCelebrationWind);
}

// Change wind parameters for celebration
function changeCelebrationWind() {
  window.windMagnitude = Math.random() * window.SAKURA_CONFIG.WIND_MAX_SPEED;
  window.windDirection = Math.random() > 0.5 ? 1 : -1;
  window.lastWindChange = Date.now();
  
  // Apply wind effect to existing petals
  window.petals.forEach(petal => {
    const windEffect = window.windMagnitude * window.windDirection;
    petal.style.marginLeft = `${windEffect * 10}px`;
  });
}

function hideElements(elements) {
  elements.forEach(el => {
    if (el) {
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
    }
  });
}

function showThankYou() {
  elements.thankYou.classList.add('active');
  elements.thankYou.style.visibility = 'visible';
  
  // Position the thank you message in the center of the screen
  elements.thankYou.style.position = 'fixed';
  elements.thankYou.style.top = '50%';
  elements.thankYou.style.left = '50%';
  elements.thankYou.style.transform = 'translate(-50%, -50%)';
  elements.thankYou.style.maxWidth = '80%';
  elements.thankYou.style.zIndex = '100';
}

// Helper function for random number generation
function getRandomNumber(min, max) {
  return min + Math.random() * (max - min);
}

// Initialize
document.addEventListener('DOMContentLoaded', init);