// Configuration
const CONFIG = {
  YES_GROWTH_FACTOR: 0.15,
  SAFE_MARGIN: 20, // Reduced from inconsistent values
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 100
};

const APP_EVENTS = {
  DEBOUNCED_RESIZE: 'app:debouncedResize'
};

window.APP_EVENTS = APP_EVENTS;

// State
let state = {
  yesBtnScale: 1,
  noBtnScale: 1,
  noBtnClicks: 0,
  isAudioPlaying: false,
  audioInitialized: false,
  audioSupported: false,
  isProcessingClick: false,
  interactionEnded: false,
  lastMoveTime: 0
};

// DOM Elements
const elements = {
  yesBtn: document.getElementById('yesBtn'),
  noBtn: document.getElementById('noBtn'),
  thankYou: document.getElementById('thankYou'),
  poem: document.getElementById('verse'),
  question: document.getElementById('question'),
  container: document.getElementById('mainContent'),
  bgMusic: document.getElementById('bgMusic'),
  audioToggle: document.getElementById('audioToggle')
};

// Cached viewport dimensions
let viewport = {
  width: window.innerWidth,
  height: window.innerHeight,
  offsetLeft: 0,
  offsetTop: 0,
  lastUpdate: 0
};

// Performance optimization: Cache button dimensions
let buttonDimensions = {
  width: 0,
  height: 0,
  lastUpdate: 0
};

// Initialization
function init() {
  console.log("Initializing application...");
  
  // Reset the state
  state.yesBtnScale = 1;
  state.noBtnScale = 1;
  state.noBtnClicks = 0;
  state.isProcessingClick = false;
  state.interactionEnded = false;
  
  // Check if elements were found
  if (!elements.yesBtn || !elements.noBtn) {
    console.error("Button elements not found!");
    return;
  }
  
  // Initialize viewport cache
  updateViewportCache();
  
  // Yes button setup
  elements.yesBtn.style.fontSize = '1.1rem';
  elements.yesBtn.style.position = 'relative';
  elements.yesBtn.style.transform = 'scale(1)';
  elements.yesBtn.style.opacity = '1';
  elements.yesBtn.style.display = 'block';
  elements.yesBtn.style.visibility = 'visible';
  
  // No button setup with improved positioning
  resetNoButtonPosition();
  
  // Add optimized resize listener
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateViewportCache();
      updateButtonDimensionsCache();
      window.dispatchEvent(new CustomEvent(APP_EVENTS.DEBOUNCED_RESIZE));
    }, CONFIG.DEBOUNCE_DELAY);
  });
  
  // Add event listeners
  setupEventListeners();
  
  // Handle audio
  handleAudio();
  
  console.log("Initialization complete");
}

// Performance: Update viewport cache only when needed
function updateViewportCache() {
  const now = Date.now();
  if (now - viewport.lastUpdate > 100) { // Cache for 100ms
    const visualViewport = window.visualViewport;
    if (visualViewport) {
      viewport.width = visualViewport.width;
      viewport.height = visualViewport.height;
      viewport.offsetLeft = visualViewport.offsetLeft || 0;
      viewport.offsetTop = visualViewport.offsetTop || 0;
    } else {
      viewport.width = window.innerWidth;
      viewport.height = window.innerHeight;
      viewport.offsetLeft = 0;
      viewport.offsetTop = 0;
    }
    viewport.lastUpdate = now;
  }
}

// Performance: Cache button dimensions
function updateButtonDimensionsCache() {
  const now = Date.now();
  if (now - buttonDimensions.lastUpdate > 500) { // Cache for 500ms
    const rect = elements.noBtn.getBoundingClientRect();
    buttonDimensions.width = rect.width;
    buttonDimensions.height = rect.height;
    buttonDimensions.lastUpdate = now;
  }
}

// Reset No button to initial state
function resetNoButtonPosition() {
  elements.noBtn.style.transform = 'scale(1)';
  elements.noBtn.style.position = 'relative';
  elements.noBtn.style.opacity = '1';
  elements.noBtn.style.display = 'block';
  elements.noBtn.style.visibility = 'visible';
  elements.noBtn.style.left = 'auto';
  elements.noBtn.style.top = 'auto';
  elements.noBtn.style.fontSize = '1.1rem';
  elements.noBtn.style.padding = '0.8rem 1.44rem';
  elements.noBtn.classList.remove('fixed-position');
}

// Event Listeners
function setupEventListeners() {
  // Use event delegation for better performance
  document.addEventListener('pointerdown', handlePointerDown);
  document.addEventListener('click', handleDocumentClick);
  
  // Add multiple event listeners for first interaction
  const firstInteractionEvents = ['pointerdown', 'keydown'];
  const firstInteractionHandler = (event) => {
    if (event.target !== elements.audioToggle) {
      playAudioOnFirstInteraction();
    }
  };
  
  firstInteractionEvents.forEach(eventType => {
    document.addEventListener(eventType, firstInteractionHandler, { once: true });
  });
}

// Optimized event handlers
function handleDocumentClick(e) {
  if (e.detail !== 0) {
    return; // Pointer interactions are handled in pointerdown
  }
  
  if (e.target === elements.noBtn) {
    handleNoClick(e);
  } else if (e.target === elements.yesBtn) {
    handleYesClick(e);
  } else if (e.target === elements.audioToggle) {
    toggleAudio();
  }
}

function handlePointerDown(e) {
  const target = e.target;
  if (target === elements.noBtn) {
    handleNoClick(e);
    e.preventDefault();
  } else if (target === elements.yesBtn) {
    handleYesClick(e);
    e.preventDefault();
  } else if (target === elements.audioToggle) {
    toggleAudio();
    e.preventDefault();
  }
}

// Audio Handling (unchanged but optimized)
function handleAudio() {
  state.audioSupported = !!elements.bgMusic.canPlayType;
  
  if (state.audioSupported) {
    elements.bgMusic.volume = 0.2;
    elements.bgMusic.muted = true;
    state.isAudioPlaying = false;
    state.audioInitialized = false;
    elements.audioToggle.innerHTML = '🔇';
    
    elements.bgMusic.addEventListener('error', (e) => {
      console.error('Audio loading error:', e);
      state.audioSupported = false;
      elements.audioToggle.style.display = 'none';
    });
    
    elements.bgMusic.addEventListener('ended', () => {
      if (state.isAudioPlaying) {
        elements.bgMusic.play().catch(console.error);
      }
    });
  } else {
    elements.audioToggle.style.display = 'none';
  }
}

function playAudioOnFirstInteraction() {
  if (state.audioSupported && !state.audioInitialized) {
    state.audioInitialized = true;
    elements.bgMusic.muted = false;
    elements.bgMusic.play()
      .then(() => {
        state.isAudioPlaying = true;
        elements.audioToggle.innerHTML = '🔊';
      })
      .catch(error => {
        console.error("Audio couldn't play:", error);
        state.isAudioPlaying = false;
        elements.audioToggle.innerHTML = '🔇';
        elements.bgMusic.muted = true;
      });
  }
}

function toggleAudio() {
  if (!state.audioSupported) return;
  
  if (!state.audioInitialized) {
    state.audioInitialized = true;
  }
  
  if (state.isAudioPlaying) {
    elements.bgMusic.pause();
    state.isAudioPlaying = false;
    elements.audioToggle.innerHTML = '🔇';
  } else {
    elements.bgMusic.muted = false;
    elements.bgMusic.play()
      .then(() => {
        state.isAudioPlaying = true;
        elements.audioToggle.innerHTML = '🔊';
      })
      .catch(error => {
        console.error("Audio couldn't resume:", error);
        state.isAudioPlaying = false;
        elements.audioToggle.innerHTML = '🔇';
        elements.bgMusic.muted = true;
      });
  }
}

// Simple No Button Handler - scales down on each click
function handleNoClick(e) {
  e.preventDefault();

  const now = Date.now();
  if (state.isProcessingClick || state.interactionEnded || (now - state.lastMoveTime) < CONFIG.DEBOUNCE_DELAY) {
    return;
  }

  state.isProcessingClick = true;
  state.lastMoveTime = now;
  state.noBtnClicks++;

  // Scale down the No button
  shrinkNoButton();

  setTimeout(() => {
    state.isProcessingClick = false;
    growYesButton();
  }, CONFIG.ANIMATION_DURATION);
}

// Simple shrink No button function
function shrinkNoButton() {
  if (state.noBtnScale <= 0.3) {
    state.noBtnScale = 0.3; // Minimum scale
  } else {
    state.noBtnScale -= 0.15; // Scale down by 15% each click
  }

  requestAnimationFrame(() => {
    elements.noBtn.style.transform = `scale(${state.noBtnScale})`;

    // Adjust font size and padding proportionally
    const textScale = Math.max(0.5, state.noBtnScale);
    elements.noBtn.style.fontSize = `${textScale}rem`;

    const paddingAdjust = Math.max(0.4, 0.8 * state.noBtnScale);
    elements.noBtn.style.padding = `${paddingAdjust}rem ${paddingAdjust * 1.8}rem`;
  });
}

// Utility function (unchanged)
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Optimized growYesButton function
function growYesButton() {
  if (state.yesBtnScale >= 1.5) {
    state.yesBtnScale = 1.5;
  } else {
    state.yesBtnScale += CONFIG.YES_GROWTH_FACTOR;
  }
  
  // Use requestAnimationFrame for smoother scaling
  requestAnimationFrame(() => {
    elements.yesBtn.style.transform = `scale(${state.yesBtnScale})`;
    
    const textScale = 1 + ((state.yesBtnScale - 1) * 0.7);
    elements.yesBtn.style.fontSize = `${textScale}rem`;
    
    const paddingAdjust = Math.max(0.8, 0.8 / state.yesBtnScale);
    elements.yesBtn.style.padding = `${paddingAdjust}rem ${paddingAdjust * 1.8}rem`;
  });
}

// Yes Button Handler (unchanged)
function handleYesClick(e) {
  e.preventDefault();
  
  state.interactionEnded = true;
  elements.yesBtn.style.pointerEvents = 'none';
  elements.noBtn.style.pointerEvents = 'none';
  
  elements.yesBtn.style.transform = `scale(${state.yesBtnScale * 0.9})`;
  setTimeout(() => {
    elements.yesBtn.style.transform = `scale(${state.yesBtnScale})`;
  }, 100);
  
  if (elements.noBtn.parentNode) {
    elements.noBtn.parentNode.removeChild(elements.noBtn);
  }
  
  elements.yesBtn.style.transition = 'opacity 0.5s ease-out';
  elements.yesBtn.style.opacity = '0';
  
  elements.poem.style.transition = 'opacity 0.5s ease-out';
  elements.question.style.transition = 'opacity 0.5s ease-out';
  elements.poem.style.opacity = '0';
  elements.question.style.opacity = '0';
  
  setTimeout(() => {
    elements.poem.style.display = 'none';
    elements.question.style.display = 'none';
    elements.yesBtn.style.display = 'none';
    
    elements.thankYou.style.display = 'block';
    elements.thankYou.style.opacity = '1';
    elements.thankYou.style.visibility = 'visible';
    elements.thankYou.classList.add('active');
    
    if (state.audioSupported && !state.isAudioPlaying) {
      elements.bgMusic.play().catch(console.error);
    }
  }, 500);
}

// Initialize
document.addEventListener('DOMContentLoaded', init);