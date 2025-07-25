// core/motion.js - Enhanced Motion System with Spring Physics

import { SpringUtils, SpringPresets, SpringPerformance } from './spring-physics.js';

// Enhanced Material Motion System with Spring Physics
export const MotionSystem = {
  // Legacy easing curves (kept for compatibility)
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  standardAccelerate: 'cubic-bezier(0.3, 0, 1, 1)',
  standardDecelerate: 'cubic-bezier(0, 0, 0, 1)',
  emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
  emphasizedAccelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
  emphasizedDecelerate: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
  
  // Duration tokens (kept for compatibility)
  duration: {
    short1: 50,
    short2: 100,
    short3: 150,
    short4: 200,
    medium1: 250,
    medium2: 300,
    medium3: 350,
    medium4: 400,
    long1: 450,
    long2: 500,
    long3: 550,
    long4: 600,
    extraLong1: 700,
    extraLong2: 800,
    extraLong3: 900,
    extraLong4: 1000
  },

  // New Spring-based motion presets
  spring: SpringPresets
};

// Enhanced Animation Utilities with Spring Physics
export function animateElementIn(element, preset = 'smooth') {
  if (!element || !SpringPerformance.canAnimate()) return;
  
  SpringPerformance.startAnimation();
  
  // Apply spring entrance animation
  SpringUtils.springTo(element, {
    opacity: '1',
    transform: 'translateY(0) scale(1)'
  }, preset, () => {
    SpringPerformance.endAnimation();
  });
}

export function animateElementOut(element, preset = 'quick') {
  if (!element || !SpringPerformance.canAnimate()) return;
  
  SpringPerformance.startAnimation();
  
  SpringUtils.springTo(element, {
    opacity: '0',
    transform: 'translateY(-20px) scale(0.95)'
  }, preset, () => {
    element.classList.add('hidden');
    // Reset styles
    element.style.opacity = '';
    element.style.transform = '';
    SpringPerformance.endAnimation();
  });
}

// Setup Enhanced Motion System
export function setupMotionSystem() {
  // Add entrance animations to key elements with spring physics
  const animatedElements = document.querySelectorAll('.primary-card');
  
  if (SpringUtils.prefersReducedMotion()) {
    // Skip animations for reduced motion users
    animatedElements.forEach(element => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    });
    return;
  }
  
  // Stagger spring animations for multiple cards
  SpringUtils.createStaggeredSprings(Array.from(animatedElements), 'gentle', 100);
  
  animatedElements.forEach((element, index) => {
    // Initial state
    element.style.opacity = '0';
    element.style.transform = 'translateY(40px) scale(0.95)';
    
    // Apply spring entrance with delay
    setTimeout(() => {
      element.classList.add('spring-card-enter');
    }, 200 + (index * 100));
  });

  // Setup interactive spring behaviors
  setupInteractiveElements();
  setupUploadZoneSpring();
  setupButtonSprings();
}

// Interactive Elements Spring Setup
function setupInteractiveElements() {
  // Add spring interactions to buttons
  const buttons = document.querySelectorAll('.action-button, .convert-button');
  buttons.forEach(button => {
    if (!button.classList.contains('spring-press')) {
      button.classList.add('spring-press');
    }
    
    // Add hover spring effect
    button.addEventListener('mouseenter', () => {
      if (SpringPerformance.canAnimate()) {
        SpringUtils.applySpringTiming(button, 'snappy');
      }
    });
  });

  // Add spring interactions to cards
  const cards = document.querySelectorAll('.primary-card, .status-card, .result-card');
  cards.forEach(card => {
    if (!card.classList.contains('spring-interactive')) {
      card.classList.add('spring-interactive');
    }
  });
}

// Upload Zone Spring Behaviors
function setupUploadZoneSpring() {
  const uploadZone = document.getElementById('upload-zone');
  if (!uploadZone) return;

  // Add breathing animation when idle
  if (SpringPerformance.canAnimate()) {
    uploadZone.classList.add('spring-breathing');
  }

  // Enhanced drag interactions with spring physics
  uploadZone.addEventListener('dragenter', () => {
    if (SpringPerformance.canAnimate()) {
      uploadZone.classList.remove('spring-breathing');
      uploadZone.classList.add('spring-excited');
      SpringUtils.applySpringTiming(uploadZone, 'bouncy');
    }
  });

  uploadZone.addEventListener('dragleave', () => {
    if (SpringPerformance.canAnimate()) {
      uploadZone.classList.remove('spring-excited');
      uploadZone.classList.add('spring-breathing');
    }
  });

  uploadZone.addEventListener('drop', () => {
    if (SpringPerformance.canAnimate()) {
      uploadZone.classList.remove('spring-excited', 'spring-breathing');
      // Add success bounce
      setTimeout(() => {
        uploadZone.classList.add('spring-bounce');
      }, 100);
    }
  });
}

// Button Spring Interactions
function setupButtonSprings() {
  const convertBtn = document.getElementById('convert-btn');
  if (!convertBtn) return;

  // Add spring feedback on click
  convertBtn.addEventListener('click', () => {
    if (SpringPerformance.canAnimate()) {
      // Quick spring feedback
      SpringUtils.springTo(convertBtn, {
        transform: 'scale(0.96)'
      }, 'quick', () => {
        SpringUtils.springTo(convertBtn, {
          transform: 'scale(1)'
        }, 'bouncy');
      });
    }
  });
}

// Welcome Animation with Springs
export function showWelcomeAnimation() {
  const uploadZone = document.getElementById('upload-zone');
  if (!uploadZone || SpringUtils.prefersReducedMotion()) return;

  // Initial state
  uploadZone.style.transform = 'scale(0.9)';
  uploadZone.style.opacity = '0';
  
  // Spring entrance
  setTimeout(() => {
    SpringUtils.springTo(uploadZone, {
      transform: 'scale(1)',
      opacity: '1'
    }, 'gentle', () => {
      // Start breathing animation after entrance
      if (SpringPerformance.canAnimate()) {
        uploadZone.classList.add('spring-breathing');
      }
    });
  }, 600);
}

// Success Animation with Enhanced Springs
export function addSuccessAnimation(element, celebrationType = 'bounce') {
  if (!element || !SpringPerformance.canAnimate()) return;
  
  SpringPerformance.startAnimation();
  
  switch (celebrationType) {
    case 'celebration':
      element.classList.add('success-celebration');
      setTimeout(() => {
        element.classList.remove('success-celebration');
        SpringPerformance.endAnimation();
      }, 1200);
      break;
      
    case 'bounce':
    default:
      element.classList.add('spring-bounce');
      setTimeout(() => {
        element.classList.remove('spring-bounce');
        SpringPerformance.endAnimation();
      }, SpringUtils.getSpringTiming('bouncy').duration);
      break;
  }
}

// Loading Animation with Springs
export function showLoadingSpring(element) {
  if (!element || !SpringPerformance.canAnimate()) return;
  
  element.classList.add('spring-pulse');
  return () => {
    element.classList.remove('spring-pulse');
  };
}

// Chain Animations for Complex Sequences
export function springSequence(animations, onComplete) {
  SpringUtils.springSequence(animations, onComplete);
}

// Contextual Spring Reactions
export function setupContextualReactions() {
  // When one element is interacted with, others react subtly
  const interactiveElements = document.querySelectorAll('.spring-interactive');
  
  interactiveElements.forEach(element => {
    const siblings = element.parentElement?.querySelectorAll('.spring-react-to-sibling');
    
    if (siblings && siblings.length > 0) {
      element.addEventListener('mouseenter', () => {
        siblings.forEach(sibling => {
          if (SpringPerformance.canAnimate()) {
            SpringUtils.applySpringTiming(sibling, 'gentle');
          }
        });
      });
    }
  });
}

// Progress Animation with Springs
export function animateProgress(progressElement, percentage, preset = 'smooth') {
  if (!progressElement || !SpringPerformance.canAnimate()) return;
  
  SpringUtils.springTo(progressElement, {
    width: `${percentage}%`
  }, preset);
  
  // Add completion celebration if at 100%
  if (percentage >= 100) {
    setTimeout(() => {
      progressElement.classList.add('spring-progress', 'completing');
      setTimeout(() => {
        progressElement.classList.remove('completing');
      }, 800);
    }, SpringUtils.getSpringTiming(preset).duration);
  }
}

// Focus Spring Animation
export function addFocusSpring(element) {
  if (!element) return;
  
  element.classList.add('spring-focus');
  
  element.addEventListener('focus', () => {
    if (SpringPerformance.canAnimate()) {
      SpringUtils.applySpringTiming(element, 'snappy');
    }
  });
}

// File Drop Spring Celebration
export function celebrateFileDrop(dropZone) {
  if (!dropZone || !SpringPerformance.canAnimate()) return;
  
  // Remove existing animations
  dropZone.classList.remove('spring-breathing', 'spring-excited');
  
  // Add drop celebration
  SpringUtils.springSequence([
    {
      element: dropZone,
      properties: { transform: 'scale(1.05)' },
      preset: 'quick'
    },
    {
      element: dropZone,
      properties: { transform: 'scale(1)' },
      preset: 'bouncy',
      delay: 100
    }
  ], () => {
    // Start breathing again after celebration
    setTimeout(() => {
      if (SpringPerformance.canAnimate()) {
        dropZone.classList.add('spring-breathing');
      }
    }, 500);
  });
}

// Conversion Process Spring Animations
export function animateConversionProcess(stages) {
  if (SpringUtils.prefersReducedMotion()) return;
  
  const animations = stages.map((stage, index) => ({
    element: stage.element,
    properties: stage.properties,
    preset: stage.preset || 'smooth',
    delay: index * 200
  }));
  
  SpringUtils.springSequence(animations);
}

// Theme Transition with Springs
export function animateThemeTransition() {
  if (!SpringPerformance.canAnimate()) return;
  
  const animatedElements = document.querySelectorAll('.primary-card, .status-card, .top-app-bar');
  
  animatedElements.forEach((element, index) => {
    SpringUtils.applySpringTiming(element, 'smooth');
    element.style.setProperty('--spring-delay', `${index * 50}ms`);
  });
}

// Stagger Animation Utility
export function staggerSpringAnimation(elements, preset = 'smooth', delayMs = 50) {
  if (!elements.length || SpringUtils.prefersReducedMotion()) return;
  
  SpringUtils.createStaggeredSprings(elements, preset, delayMs);
  
  elements.forEach((element, index) => {
    element.style.setProperty('--stagger-index', index);
    element.classList.add('spring-stagger');
  });
}

// Performance Monitoring
export function getSpringPerformanceStats() {
  return {
    activeAnimations: SpringPerformance.animationCount,
    maxConcurrentAnimations: SpringPerformance.maxConcurrentAnimations,
    canAnimate: SpringPerformance.canAnimate(),
    reducedMotion: SpringUtils.prefersReducedMotion()
  };
}

// Export enhanced motion system
export default {
  MotionSystem,
  SpringUtils,
  SpringPresets,
  animateElementIn,
  animateElementOut,
  setupMotionSystem,
  showWelcomeAnimation,
  addSuccessAnimation,
  showLoadingSpring,
  springSequence,
  setupContextualReactions,
  animateProgress,
  addFocusSpring,
  celebrateFileDrop,
  animateConversionProcess,
  animateThemeTransition,
  staggerSpringAnimation,
  getSpringPerformanceStats
};