// script.js
// Configuration
const CONFIG = {
  YES_GROWTH_FACTOR: 0.15
};

// State
let state = {
  yesBtnScale: 1,
  noBtnClicks: 0,
  isAudioPlaying: false,
  audioInitialized: false,
  audioSupported: false,
  isProcessingClick: false,
  interactionEnded: false
};

// DOM Elements
const elements = {
  yesBtn: document.getElementById('yesBtn'),
  noBtn: document.getElementById('noBtn'),
  thankYou: document.getElementById('thankYou'),
  poem: document.getElementById('verse'),
  question: document.getElementById('question'),
  bgMusic: document.getElementById('bgMusic'),
  audioToggle: document.getElementById('audioToggle')
};

// Initialization
function init() {
  console.log("Initializing application...");
  
  // Reset the state
  state.yesBtnScale = 1;
  state.noBtnClicks = 0;
  state.isProcessingClick = false;
  state.interactionEnded = false;
  
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
  
  // No button setup
  elements.noBtn.style.transform = 'none';
  elements.noBtn.style.position = 'relative';
  elements.noBtn.style.opacity = '1';
  elements.noBtn.style.display = 'block';
  elements.noBtn.style.visibility = 'visible';
  
  // Remove any classes that might affect positioning
  elements.noBtn.classList.remove('fixed-position');
  
  // Add resize listener
  window.addEventListener('resize', () => {
    if (!state.interactionEnded && elements.noBtn.classList.contains('fixed-position')) {
      moveButtonRandomly();
    }
  });
  
  // Add event listeners
  setupEventListeners();
  
  // Handle audio
  handleAudio();
  
  console.log("Initialization complete");
}

// Event Listeners
function setupEventListeners() {
  document.addEventListener('click', (e) => {
    if (e.target === elements.noBtn) {
      handleNoClick(e);
    } else if (e.target === elements.yesBtn) {
      handleYesClick(e);
    } else if (e.target === elements.audioToggle) {
      toggleAudio();
    }
  });
  
  document.addEventListener('touchstart', (e) => {
    if (e.target === elements.noBtn) {
      handleNoClick(e);
    }
  });
  
  // Add multiple event listeners for first interaction
  const firstInteractionEvents = ['click', 'touchstart', 'keydown'];
  const firstInteractionHandler = (event) => {
    if (event.target !== elements.audioToggle) {
      playAudioOnFirstInteraction();
    }
    firstInteractionEvents.forEach(type => {
      document.removeEventListener(type, firstInteractionHandler);
    });
  };
  
  firstInteractionEvents.forEach(eventType => {
    document.addEventListener(eventType, firstInteractionHandler, { once: true });
  });
}

// Audio Handling
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

// No Button Handler
function handleNoClick(e) {
  e.preventDefault();
  if (state.isProcessingClick || state.interactionEnded) return;
  
  state.isProcessingClick = true;
  state.noBtnClicks++;

  if (!elements.noBtn.classList.contains('fixed-position')) {
    elements.noBtn.classList.add('fixed-position');
  }

  moveButtonRandomly();
  
  setTimeout(() => {
    state.isProcessingClick = false;
    growYesButton();
  }, 300);
}

function moveButtonRandomly() {
  if (state.interactionEnded) return;

  requestAnimationFrame(() => {
    const btn = elements.noBtn;
    if (!btn || !document.contains(btn)) return;

    // Always set to fixed before measuring
    btn.style.position = 'fixed';
    // Remove any previous left/top to get natural size
    btn.style.left = '0px';
    btn.style.top = '0px';

    // Get the true size of the button
    const btnRect = btn.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Safe margins (ensure button is always fully visible)
    let marginX = Math.max(vw * 0.05, 30);
    let marginY = Math.max(vh * 0.05, 30);

    // Clamp margins if button is too big for viewport
    if (btnRect.width + 2 * marginX > vw) {
      marginX = Math.max((vw - btnRect.width) / 2, 0);
    }
    if (btnRect.height + 2 * marginY > vh) {
      marginY = Math.max((vh - btnRect.height) / 2, 0);
    }

    // Calculate min/max positions so button stays fully in view
    const minX = marginX;
    const maxX = vw - btnRect.width - marginX;
    const minY = marginY;
    const maxY = vh - btnRect.height - marginY;

    // If the available space is negative, center the button
    let newX, newY;
    if (maxX < minX) {
      newX = (vw - btnRect.width) / 2;
    } else {
      newX = minX + Math.random() * (maxX - minX);
    }
    if (maxY < minY) {
      newY = (vh - btnRect.height) / 2;
    } else {
      newY = minY + Math.random() * (maxY - minY);
    }

    // Magnetic effect (optional)
    if (state.yesBtnScale > 1 && maxX >= minX && maxY >= minY) {
      const yesRect = elements.yesBtn.getBoundingClientRect();
      const yesCenter = {
        x: yesRect.left + yesRect.width / 2,
        y: yesRect.top + yesRect.height / 2
      };
      const dx = newX - yesCenter.x;
      const dy = newY - yesCenter.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;
      const resistance = 1 + (Math.min(state.yesBtnScale, 1.5) - 1) * 1.5;
      newX = yesCenter.x + (dx / distance) * distance * resistance;
      newY = yesCenter.y + (dy / distance) * distance * resistance;
      // Clamp again after magnetic effect
      newX = Math.max(minX, Math.min(newX, maxX));
      newY = Math.max(minY, Math.min(newY, maxY));
    }

    // Apply position
    btn.style.left = `${newX}px`;
    btn.style.top = `${newY}px`;

    // Only use transform for rotation/scale
    const rotation = getRandomInt(-12, 12);
    const scale = state.noBtnClicks % 2 === 0 ? 0.95 : 1.05;
    btn.style.transform = `rotate(${rotation}deg) scale(${scale})`;

    btn.style.opacity = '1';
    btn.style.visibility = 'visible';
    btn.style.display = 'block';
  });
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function growYesButton() {
  if (state.yesBtnScale >= 1.5) {
    state.yesBtnScale = 1.5;
  } else {
    state.yesBtnScale += CONFIG.YES_GROWTH_FACTOR;
  }
  
  elements.yesBtn.style.transform = `scale(${state.yesBtnScale})`;
  
  const textScale = 1 + ((state.yesBtnScale - 1) * 0.7);
  elements.yesBtn.style.fontSize = `${textScale}rem`;
  
  const paddingAdjust = Math.max(0.8, 0.8 / state.yesBtnScale);
  elements.yesBtn.style.padding = `${paddingAdjust}rem ${paddingAdjust * 1.8}rem`;
}

// Yes Button Handler
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