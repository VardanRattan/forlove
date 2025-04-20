// script.js
// Configuration
const CONFIG = {
  MAX_NO_ATTEMPTS: 8,
  YES_GROWTH_FACTOR: 0.15,
  BUTTON_MOVE_RANGE: 0.6, // Increased from 0.4 to 0.6 (60% of viewport)
  MAGNET_DISTANCE: 200,
  MAGNET_STRENGTH: 0.5,
  SAFE_MARGIN_PERCENT: 0.05, // 5% of screen dimensions as safety margin
  MIN_SAFE_MARGIN: 20, // Minimum 20px safety margin regardless of screen size
  BUTTON_VISIBILITY_CHECK_DELAY: 50 // ms delay for visibility check
};

// State
let state = {
  yesBtnScale: 1,
  noBtnClicks: 0,
  isAudioPlaying: false,
  audioInitialized: false,
  audioSupported: false,
  isProcessingClick: false,
  celebrationStarted: false  // Add this flag to track celebration state
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
  console.log("Initializing application...");
  
  // Reset the state
  state.yesBtnScale = 1;
  state.noBtnClicks = 0;
  state.isProcessingClick = false;
  state.celebrationStarted = false; // Make sure this is reset
  
  // Check if elements were found
  if (!elements.yesBtn || !elements.noBtn) {
    console.error("Button elements not found!");
    return;
  }
  
  // Yes button setup
  elements.yesBtn.style.fontSize = '1.1rem';
  elements.yesBtn.style.position = 'relative';
  elements.yesBtn.style.transform = 'scale(1)';
  elements.yesBtn.style.opacity = '1';
  elements.yesBtn.style.display = 'block';
  elements.yesBtn.style.visibility = 'visible';
  
  // No button setup - ensure it's in the document flow initially
  elements.noBtn.style.transform = 'none';
  elements.noBtn.style.position = 'relative'; // Start with relative positioning
  elements.noBtn.style.opacity = '1';
  elements.noBtn.style.display = 'block';
  elements.noBtn.style.visibility = 'visible';
  
  // Remove any classes that might affect positioning
  elements.noBtn.classList.remove('fixed-position');
  
  // Add resize listener to reposition button if needed
  window.addEventListener('resize', () => {
    if (!state.celebrationStarted && elements.noBtn.classList.contains('fixed-position')) {
      moveButtonRandomly();
    }
  });
  
  // Add periodic boundary check
  setInterval(() => {
    if (state.celebrationStarted) return; // Skip during celebration
    
    if (elements.noBtn && document.contains(elements.noBtn) && 
        elements.noBtn.classList.contains('fixed-position')) {
      const rect = elements.noBtn.getBoundingClientRect();
      if (rect.right > window.innerWidth || 
          rect.bottom > window.innerHeight ||
          rect.left < 0 || 
          rect.top < 0) {
        console.log("Boundary check: Button out of bounds, repositioning");
        moveButtonRandomly();
      }
    }
  }, 1000);
  
  // Check button visibility during animation
  setInterval(ensureButtonVisibility, 200);
  
  // Add event listeners
  setupEventListeners();
  
  // Handle audio
  handleAudio();
  
  console.log("Initialization complete");
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

// No Button Handler - Add celebration check
function handleNoClick(e) {
  e.preventDefault();
  if (state.isProcessingClick || state.celebrationStarted) return;
  
  state.isProcessingClick = true;
  state.noBtnClicks++;

  // First click - set button to fixed position if needed
  if (!elements.noBtn.classList.contains('fixed-position')) {
    elements.noBtn.classList.add('fixed-position');
    
    // If first click, position button at its current location before moving
    const rect = elements.noBtn.getBoundingClientRect();
    elements.noBtn.style.left = `${rect.left}px`;
    elements.noBtn.style.top = `${rect.top}px`;
  }

  // Create click trail at pointer position
  createClickTrail(e.clientX, e.clientY);
  
  // Visual click feedback with immediate button movement
  elements.noBtn.style.transform = 'scale(0.9)';
  
  // Move button immediately without waiting
  requestAnimationFrame(() => {
    moveButtonRandomly();
    
    // Restore normal scale in next frame
    requestAnimationFrame(() => {
      // Allow processing new clicks sooner (important for UX)
      state.isProcessingClick = false;
      
      // Grow yes button after button has moved
      growYesButton();
    });
  });
}

// Function to create visual click trail effect
function createClickTrail(x, y) {
  const trail = document.createElement('div');
  trail.className = 'click-trail';
  trail.style.left = `${x}px`;
  trail.style.top = `${y}px`;
  document.body.appendChild(trail);
  
  // Remove trail element after animation completes
  setTimeout(() => trail.remove(), 500);
}

function moveButtonRandomly() {
  // Skip completely if we're in celebration mode
  if (state.celebrationStarted) return;
  
  // Use requestAnimationFrame for smooth animation
  requestAnimationFrame(() => {
    const btn = elements.noBtn;
    
    // Make sure the button still exists in DOM
    if (!btn || !document.contains(btn)) return;
    
    const btnRect = btn.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Calculate safe area with dynamic margins
    const marginX = Math.max(vw * 0.05, 30);
    const marginY = Math.max(vh * 0.05, 30);
    
    // Available movement space
    const maxX = vw - btnRect.width - marginX;
    const maxY = vh - btnRect.height - marginY;

    // Generate new position using client coordinates
    let newX = marginX + Math.random() * (maxX - marginX);
    let newY = marginY + Math.random() * (maxY - marginY);
    
    // Apply magnetic attraction effect based on Yes button growth
    if (state.yesBtnScale > 1) {
      // Calculate distance to the center (where Yes button is)
      const yesRect = elements.yesBtn.getBoundingClientRect();
      const yesCenter = {
        x: yesRect.left + yesRect.width / 2,
        y: yesRect.top + yesRect.height / 2
      };
      
      // Add magnetic resistance when Yes button grows - pushes No button away
      const resistance = 1 + (Math.min(state.yesBtnScale, 1.5) - 1) * 1.5;
      
      // Calculate vector from Yes to the intended No position
      const dx = newX - yesCenter.x;
      const dy = newY - yesCenter.y;
      
      // Normalize and apply resistance
      const distance = Math.sqrt(dx * dx + dy * dy) || 1; // Avoid division by zero
      
      // Apply the modified position with resistance
      newX = yesCenter.x + (dx / distance) * distance * resistance;
      newY = yesCenter.y + (dy / distance) * distance * resistance;
    }
    
    // Ensure button stays within bounds
    newX = Math.max(marginX, Math.min(newX, maxX));
    newY = Math.max(marginY, Math.min(newY, maxY));

    // Apply position directly - this is key to smooth animation
    btn.style.left = `${newX}px`;
    btn.style.top = `${newY}px`;
    
    // Keep rotation and scale in the transform property
    const rotation = getRandomInt(-12, 12);
    const scale = state.noBtnClicks % 2 === 0 ? 0.95 : 1.05;
    btn.style.transform = `rotate(${rotation}deg) scale(${scale})`;

    // Ensure button is fully visible during transition
    btn.style.opacity = '1';
    btn.style.visibility = 'visible';
    btn.style.display = 'block';
  });
}

// Helper function to get random integer in inclusive range
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
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
  
  // Set celebration flag to prevent button from reappearing
  state.celebrationStarted = true;
  
  // Prevent any other clicks during the process
  elements.yesBtn.style.pointerEvents = 'none';
  elements.noBtn.style.pointerEvents = 'none';
  
  // The most aggressive approach - remove the No button from the DOM completely
  if (elements.noBtn.parentNode) {
    elements.noBtn.parentNode.removeChild(elements.noBtn);
  }
  
  // Also completely hide the Yes button 
  elements.yesBtn.style.display = 'none';
  elements.yesBtn.style.visibility = 'hidden';
  
  // Hide the poem and question with a fade effect
  elements.poem.style.opacity = '0';
  elements.question.style.opacity = '0';
  
  // After fade out, hide these elements and trigger celebration
  setTimeout(() => {
    elements.poem.style.display = 'none';
    elements.question.style.display = 'none';
    
    // Trigger the celebration effect
    triggerCelebration();
  }, 300);
}

// Creates a "poof" effect at the no button's position when it disappears
function createNoButtonPoof(rect) {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  // Create a bunch of little particles
  for (let i = 0; i < 10; i++) {
    const particle = document.createElement('div');
    particle.className = 'poof-particle';
    
    // Random particle styling
    particle.style.left = `${centerX}px`;
    particle.style.top = `${centerY}px`;
    particle.style.backgroundColor = `hsl(${Math.random() * 60 + 340}, 100%, 70%)`;
    particle.style.width = `${Math.random() * 8 + 4}px`;
    particle.style.height = particle.style.width;
    
    document.body.appendChild(particle);
    
    // Animate the particle
    requestAnimationFrame(() => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 40 + Math.random() * 60;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      particle.style.transform = `translate(${x}px, ${y}px) scale(0)`;
      particle.style.opacity = '0';
      
      // Remove particle after animation
      setTimeout(() => {
        particle.remove();
      }, 600);
    });
  }
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
  
  // Add confetti cannon effect
  createConfettiBurst(30);
  
  // Initialize celebration petals
  initializeCelebrationPetals();
  
  // Start wind changes for celebration
  setInterval(changeCelebrationWind, 3000);
  
  // Show thank you message
  setTimeout(showThankYou, 1500);
}

// Create a confetti burst effect
function createConfettiBurst(count) {
  for (let i = 0; i < count; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    elements.celebration.appendChild(confetti);
    
    animateConfetti(confetti);
  }
}

// Animate a single confetti piece with physics
function animateConfetti(element) {
  const angle = Math.random() * Math.PI * 2;
  const velocity = 2 + Math.random() * 3;
  const rotation = (Math.random() - 0.5) * 20;
  
  let x = 0;
  let y = 0;
  
  const animate = () => {
    x += Math.cos(angle) * velocity;
    y += Math.sin(angle) * velocity + 0.5; // Gravity effect
    
    element.style.transform = `
      translate(${x}px, ${y}px)
      rotate(${rotation * y}deg)
    `;
    
    if (y < window.innerHeight * 1.5) {
      requestAnimationFrame(animate);
    } else {
      element.remove();
    }
  };
  
  requestAnimationFrame(animate);
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

// Update ensureButtonVisibility to check the celebration flag
function ensureButtonVisibility() {
  // Skip all visibility checks if we're in celebration mode
  if (state.celebrationStarted) {
    return;
  }
  
  // Rest of your original function remains the same
  if (elements.yesBtn.style.opacity === '0' || 
      elements.yesBtn.style.display === 'none') {
    return;
  }
  
  if (elements.noBtn.classList.contains('fixed-position')) {
    // Make sure button is visible by checking computed style
    const style = window.getComputedStyle(elements.noBtn);
    if (style.visibility !== 'visible' || style.display === 'none' || parseFloat(style.opacity) < 0.5) {
      // Only fix visibility if we're not in the process of hiding the button
      if (elements.yesBtn.style.pointerEvents !== 'none') {
        console.log("Visibility check: Button not fully visible, fixing");
        elements.noBtn.style.opacity = '1';
        elements.noBtn.style.visibility = 'visible';
        elements.noBtn.style.display = 'block';
      }
    }
    
    // Also check if button is out of bounds
    const rect = elements.noBtn.getBoundingClientRect();
    if (rect.right <= 0 || rect.bottom <= 0 || 
        rect.left >= window.innerWidth || rect.top >= window.innerHeight) {
      // Only reposition if we're not in the process of hiding the button
      if (elements.yesBtn.style.pointerEvents !== 'none') {
        console.log("Visibility check: Button out of bounds, repositioning");
        moveButtonRandomly();
      }
    }
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', init);