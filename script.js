// script.js
// Configuration
const CONFIG = {
  MAX_NO_ATTEMPTS: 8,
  YES_GROWTH_FACTOR: 0.15,
  BUTTON_MOVE_RANGE: 0.4, // 40% of viewport
  MAGNET_DISTANCE: 200,
  MAGNET_STRENGTH: 0.5
};

// State
let state = {
  yesBtnScale: 1,
  noBtnClicks: 0,
  isAudioPlaying: false,
  audioInitialized: false,
  audioSupported: false
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
  
  // Add multiple event listeners for first interaction
  const firstInteractionEvents = ['click', 'touchstart', 'keydown'];
  firstInteractionEvents.forEach(eventType => {
    document.addEventListener(eventType, function firstInteractionHandler(event) {
      // Skip if this is the audio toggle button itself
      if (event.target !== elements.audioToggle) {
        playAudioOnFirstInteraction();
      }
      // Remove all first interaction listeners
      firstInteractionEvents.forEach(type => {
        document.removeEventListener(type, firstInteractionHandler);
      });
    }, { once: true });
  });
}

// Audio Handling
function handleAudio() {
  // Check if audio is supported
  state.audioSupported = !!elements.bgMusic.canPlayType;
  
  if (state.audioSupported) {
    // Set initial volume but don't autoplay - we'll play on first interaction
    elements.bgMusic.volume = 0.2;
    elements.bgMusic.muted = true; // Start muted
    state.isAudioPlaying = false;
    state.audioInitialized = false;
    
    // Update UI to show muted initially
    elements.audioToggle.innerHTML = '🔇';
    
    // Add error handling for audio loading
    elements.bgMusic.addEventListener('error', (e) => {
      console.error('Audio loading error:', e);
      state.audioSupported = false;
      elements.audioToggle.style.display = 'none';
    });
    
    // Add ended event handler to restart audio if it ends
    elements.bgMusic.addEventListener('ended', () => {
      if (state.isAudioPlaying) {
        elements.bgMusic.play().catch(console.error);
      }
    });
  } else {
    // Hide audio toggle if audio is not supported
    elements.audioToggle.style.display = 'none';
  }
}

function playAudioOnFirstInteraction() {
  // Only play if audio is supported and not yet initialized
  if (state.audioSupported && !state.audioInitialized) {
    console.log("First interaction detected, initializing audio");
    
    // Mark as initialized regardless of play success
    state.audioInitialized = true;
    
    // Unmute and play
    elements.bgMusic.muted = false;
    elements.bgMusic.play()
      .then(() => {
        console.log("Audio started successfully");
        state.isAudioPlaying = true;
        elements.audioToggle.innerHTML = '🔊';
      })
      .catch(error => {
        console.error("Audio couldn't play:", error);
        state.isAudioPlaying = false;
        elements.audioToggle.innerHTML = '🔇';
        // Try to recover by muting
        elements.bgMusic.muted = true;
      });
  }
}

function toggleAudio() {
  if (!state.audioSupported) return;
  
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
    elements.bgMusic.muted = false; // Ensure it's not muted
    elements.bgMusic.play()
      .then(() => {
        console.log("Audio resumed successfully");
        state.isAudioPlaying = true;
        elements.audioToggle.innerHTML = '🔊';
      })
      .catch(error => {
        console.error("Audio couldn't resume:", error);
        state.isAudioPlaying = false;
        elements.audioToggle.innerHTML = '🔇';
        // Try to recover by muting
        elements.bgMusic.muted = true;
      });
  }
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
  
  // Get verse position for magnetic effect
  const verseRect = elements.poem.getBoundingClientRect();
  const verseCenterX = verseRect.left + verseRect.width / 2;
  const verseCenterY = verseRect.top + verseRect.height / 2;
  
  // Calculate the maximum allowed position values
  // Use a much larger safety margin to ensure button is always fully visible
  const safeMargin = 80; // Increased from 60 to 80 for more safety
  const maxX = windowWidth - btnWidth - safeMargin;
  const maxY = windowHeight - btnHeight - safeMargin;
  
  // Calculate a random position that's guaranteed to be visible
  // Limit to a smaller range for more reliability
  let randomX = Math.min(Math.max(safeMargin, Math.random() * (maxX - safeMargin)), maxX - safeMargin);
  let randomY;
  
  // For Y position, prefer the upper 70% of the visible area
  // but with stricter bounds to ensure visibility
  if (Math.random() < 0.8) { // 80% chance to be in the upper portion
    // Upper 60% of the screen with extra safety margin
    randomY = Math.min(Math.max(safeMargin, Math.random() * (maxY * 0.5)), maxY * 0.5);
  } else {
    // Lower 40% of the screen, but with stricter bounds
    randomY = Math.min(Math.max(maxY * 0.5 + safeMargin, Math.random() * (maxY * 0.8)), maxY * 0.8);
  }
  
  // Apply magnetic effect
  const btnCenterX = randomX + btnWidth / 2;
  const btnCenterY = randomY + btnHeight / 2;
  
  // Calculate distance from verse center
  const dx = btnCenterX - verseCenterX;
  const dy = btnCenterY - verseCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // If beyond magnetic distance, pull back towards verse
  if (distance > CONFIG.MAGNET_DISTANCE) {
    // Calculate pull direction with reduced strength
    const pullStrength = CONFIG.MAGNET_STRENGTH * 0.5; // Reduced from 0.5 to 0.25
    const pullX = (dx / distance) * pullStrength * (distance - CONFIG.MAGNET_DISTANCE);
    const pullY = (dy / distance) * pullStrength * (distance - CONFIG.MAGNET_DISTANCE);
    
    // Apply pull while keeping within viewport bounds
    randomX = Math.min(Math.max(safeMargin, randomX - pullX), maxX - safeMargin);
    randomY = Math.min(Math.max(safeMargin, randomY - pullY), maxY - safeMargin);
  }
  
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
function handleYesClick(e) {
  e.preventDefault();
  
  // Scale up the Yes button slightly before hiding it
  elements.yesBtn.style.transition = 'transform 0.3s ease';
  elements.yesBtn.style.transform = 'scale(1.1)';
  
  // Hide the buttons, poem, and question with a fade effect
  setTimeout(() => {
    elements.yesBtn.style.opacity = '0';
    elements.noBtn.style.opacity = '0';
    elements.poem.style.opacity = '0';
    elements.question.style.opacity = '0';
    
    // After fade out, hide the elements
    setTimeout(() => {
      elements.yesBtn.style.display = 'none';
      elements.noBtn.style.display = 'none';
      elements.poem.style.display = 'none';
      elements.question.style.display = 'none';
      
      // Trigger the celebration effect
      triggerCelebration();
    }, 300);
  }, 200);
}

// Celebration effect function
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

// Initialize celebration petals
function initializeCelebrationPetals() {
  // Create petals in batches to avoid performance issues
  const batchSize = 20;
  let currentBatch = 0;
  const totalPetals = 150; // More petals for celebration
  
  function createBatch() {
    const start = currentBatch * batchSize;
    const end = Math.min(start + batchSize, totalPetals);
    
    for (let i = start; i < end; i++) {
      createCelebrationPetal();
    }
    
    currentBatch++;
    
    if (currentBatch * batchSize < totalPetals) {
      setTimeout(createBatch, 50); // Create next batch after a short delay
    }
  }
  
  // Start creating batches
  createBatch();
}

// Create a single celebration petal
function createCelebrationPetal() {
  const petal = document.createElement('div');
  
  // Determine petal type (1-4)
  const petalType = Math.floor(Math.random() * 4) + 1;
  
  // Set classes for the petal
  petal.className = `petal celebration-petal-style${petalType}`;
  
  // Set random horizontal position
  const left = Math.random() * 100;
  petal.style.left = `${left}%`;
  
  // Set random fall and sway duration
  const fallDuration = getRandomNumber(4, 8); // Faster fall for celebration
  const swayDuration = fallDuration / 2;
  
  // Random initial rotation
  const rotation = Math.random() * 360;
  petal.style.transform = `rotate(${rotation}deg)`;
  
  // Apply animation with 'infinite' to loop
  petal.style.animation = `fall ${fallDuration}s linear infinite, sway-${petalType % 4 + 1} ${swayDuration}s ease-in-out infinite`;
  
  // Set a random delay so all petals don't start at the same position
  const randomDelay = Math.random() * fallDuration;
  petal.style.animationDelay = `-${randomDelay}s`;
  
  // Add the petal to the container
  elements.celebration.appendChild(petal);
  
  return petal;
}

// Change wind parameters for celebration
function changeCelebrationWind() {
  const windMagnitude = Math.random() * 6; // Stronger wind for celebration
  const windDirection = Math.random() > 0.5 ? 1 : -1;
  
  // Apply wind effect to existing petals
  const celebrationPetals = elements.celebration.querySelectorAll('.petal');
  celebrationPetals.forEach(petal => {
    const windEffect = windMagnitude * windDirection;
    petal.style.marginLeft = `${windEffect * 15}px`;
  });
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
  
  // Position the thank you message in the center of the screen, but lower
  elements.thankYou.style.position = 'fixed';
  elements.thankYou.style.top = '65%';
  elements.thankYou.style.left = '50%';
  elements.thankYou.style.transform = 'translate(-50%, -50%)';
  elements.thankYou.style.maxWidth = '80%';
  elements.thankYou.style.width = 'auto';
  elements.thankYou.style.zIndex = '100';
  elements.thankYou.style.display = 'flex';
  elements.thankYou.style.justifyContent = 'center';
  elements.thankYou.style.alignItems = 'center';
}

// Helper function for random number generation
function getRandomNumber(min, max) {
  return min + Math.random() * (max - min);
}

// Initialize
document.addEventListener('DOMContentLoaded', init);