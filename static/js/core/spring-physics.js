// core/spring-physics.js - Apple-style Spring Animation Engine

/**
 * Apple-Inspired Spring Animation System
 * Modular spring physics engine for smooth, natural animations
 */

// Spring Configuration Presets (Apple-style)
export const SpringPresets = {
  // Apple's signature smooth animations
  smooth: { tension: 300, friction: 30, mass: 1, velocity: 0 },
  
  // Gentle, welcoming (similar to iOS app launches)
  gentle: { tension: 200, friction: 25, mass: 1, velocity: 0 },
  
  // Snappy response (like Apple button presses)
  snappy: { tension: 400, friction: 35, mass: 0.8, velocity: 0 },
  
  // Bouncy feedback (playful but controlled)
  bouncy: { tension: 250, friction: 20, mass: 1, velocity: 0 },
  
  // Quick settle (for loading states)
  quick: { tension: 500, friction: 40, mass: 0.6, velocity: 0 },
  
  // Slow, deliberate (for important state changes)
  deliberate: { tension: 150, friction: 28, mass: 1.2, velocity: 0 }
};

/**
 * Spring Physics Calculator
 * Based on Apple's CASpringAnimation parameters
 */
export class SpringPhysics {
  constructor(config = SpringPresets.smooth) {
    this.tension = config.tension || 300;
    this.friction = config.friction || 30;
    this.mass = config.mass || 1;
    this.velocity = config.velocity || 0;
    this.precision = 0.01;
    this.restDisplacementThreshold = 0.01;
    this.restVelocityThreshold = 0.1;
  }

  /**
   * Calculate spring animation duration and easing
   * Returns CSS-compatible timing values
   */
  calculateSpringTiming() {
    const duration = this.estimateDuration();
    const easing = this.generateCubicBezier();
    
    return {
      duration: Math.round(duration),
      easing: easing,
      cssEasing: `cubic-bezier(${easing.join(', ')})`
    };
  }

  /**
   * Estimate animation duration based on spring parameters
   * Apple typically uses 0.3s - 0.8s for most animations
   */
  estimateDuration() {
    const dampingRatio = this.friction / (2 * Math.sqrt(this.tension * this.mass));
    const naturalFreq = Math.sqrt(this.tension / this.mass);
    
    if (dampingRatio < 1) {
      // Underdamped (bouncy)
      const dampedFreq = naturalFreq * Math.sqrt(1 - dampingRatio * dampingRatio);
      return (4 / dampedFreq) * 1000; // Convert to milliseconds
    } else {
      // Overdamped or critically damped
      return (4 / naturalFreq) * 1000;
    }
  }

  /**
   * Generate cubic-bezier values that approximate spring behavior
   * Apple-style control points for natural feel
   */
  generateCubicBezier() {
    const dampingRatio = this.friction / (2 * Math.sqrt(this.tension * this.mass));
    
    // Apple-inspired curve mapping
    if (dampingRatio <= 0.7) {
      // Bouncy spring (like iOS bounce)
      return [0.175, 0.885, 0.32, 1.275];
    } else if (dampingRatio <= 0.9) {
      // Smooth spring (like macOS animations)
      return [0.25, 0.46, 0.45, 0.94];
    } else {
      // Quick settle (like Apple button feedback)
      return [0.4, 0.0, 0.2, 1];
    }
  }

  /**
   * Create keyframes for complex spring animations
   */
  generateKeyframes(from, to, steps = 10) {
    const keyframes = [];
    const totalTime = this.estimateDuration();
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const time = progress * totalTime;
      const displacement = this.calculateDisplacement(time / 1000);
      const value = from + (to - from) * (1 - displacement);
      
      keyframes.push({
        offset: progress,
        value: value
      });
    }
    
    return keyframes;
  }

  /**
   * Calculate displacement at a specific time
   * Core spring physics equation
   */
  calculateDisplacement(time) {
    const dampingRatio = this.friction / (2 * Math.sqrt(this.tension * this.mass));
    const naturalFreq = Math.sqrt(this.tension / this.mass);
    const displacement = 1; // Starting from full displacement
    
    if (dampingRatio < 1) {
      // Underdamped
      const dampedFreq = naturalFreq * Math.sqrt(1 - dampingRatio * dampingRatio);
      const envelope = Math.exp(-dampingRatio * naturalFreq * time);
      const oscillation = Math.cos(dampedFreq * time) + 
                         (dampingRatio * naturalFreq / dampedFreq) * Math.sin(dampedFreq * time);
      return envelope * oscillation * displacement;
    } else if (dampingRatio === 1) {
      // Critically damped
      const envelope = Math.exp(-naturalFreq * time);
      return envelope * (1 + naturalFreq * time) * displacement;
    } else {
      // Overdamped
      const r1 = -naturalFreq * (dampingRatio + Math.sqrt(dampingRatio * dampingRatio - 1));
      const r2 = -naturalFreq * (dampingRatio - Math.sqrt(dampingRatio * dampingRatio - 1));
      const A = displacement;
      const B = displacement * r2 / (r2 - r1);
      return A * Math.exp(r1 * time) - B * Math.exp(r2 * time);
    }
  }
}

/**
 * Spring Animation Utilities
 */
export const SpringUtils = {
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Get spring timing for CSS animations
   */
  getSpringTiming(preset = 'smooth') {
    if (this.prefersReducedMotion()) {
      return { duration: 0, easing: 'linear', cssEasing: 'linear' };
    }
    
    const config = SpringPresets[preset] || SpringPresets.smooth;
    const spring = new SpringPhysics(config);
    return spring.calculateSpringTiming();
  },

  /**
   * Apply spring animation to element using CSS custom properties
   */
  applySpringTiming(element, preset = 'smooth') {
    const timing = this.getSpringTiming(preset);
    
    element.style.setProperty('--spring-duration', `${timing.duration}ms`);
    element.style.setProperty('--spring-easing', timing.cssEasing);
    
    return timing;
  },

  /**
   * Create delayed spring animations (stagger effect)
   */
  createStaggeredSprings(elements, preset = 'smooth', delayMs = 50) {
    const timing = this.getSpringTiming(preset);
    
    elements.forEach((element, index) => {
      const delay = index * delayMs;
      element.style.setProperty('--spring-duration', `${timing.duration}ms`);
      element.style.setProperty('--spring-easing', timing.cssEasing);
      element.style.setProperty('--spring-delay', `${delay}ms`);
    });
    
    return timing;
  },

  /**
   * Animate element with spring physics
   */
  springTo(element, properties, preset = 'smooth', onComplete = null) {
    if (this.prefersReducedMotion()) {
      // Apply final state immediately
      Object.assign(element.style, properties);
      if (onComplete) onComplete();
      return;
    }

    const timing = this.getSpringTiming(preset);
    this.applySpringTiming(element, preset);
    
    // Apply properties
    Object.entries(properties).forEach(([prop, value]) => {
      element.style[prop] = value;
    });
    
    // Add transition class
    element.classList.add('spring-animate');
    
    // Handle completion
    if (onComplete) {
      setTimeout(() => {
        element.classList.remove('spring-animate');
        onComplete();
      }, timing.duration);
    }
  },

  /**
   * Chain multiple spring animations
   */
  springSequence(animations, onComplete = null) {
    if (this.prefersReducedMotion()) {
      // Apply all final states immediately
      animations.forEach(({ element, properties }) => {
        Object.assign(element.style, properties);
      });
      if (onComplete) onComplete();
      return;
    }

    let currentIndex = 0;
    
    const runNext = () => {
      if (currentIndex >= animations.length) {
        if (onComplete) onComplete();
        return;
      }
      
      const { element, properties, preset = 'smooth', delay = 0 } = animations[currentIndex];
      
      setTimeout(() => {
        this.springTo(element, properties, preset, () => {
          currentIndex++;
          runNext();
        });
      }, delay);
    };
    
    runNext();
  }
};

/**
 * Performance monitoring for spring animations
 */
export const SpringPerformance = {
  animationCount: 0,
  maxConcurrentAnimations: 20,
  
  canAnimate() {
    return this.animationCount < this.maxConcurrentAnimations && 
           !SpringUtils.prefersReducedMotion();
  },
  
  startAnimation() {
    this.animationCount++;
  },
  
  endAnimation() {
    this.animationCount = Math.max(0, this.animationCount - 1);
  }
};

/**
 * Debug utilities for tuning spring parameters
 * Use these to fine-tune your animations
 */
export const SpringDebug = {
  /**
   * Test different spring configurations
   * Usage: SpringDebug.testSpring(element, { tension: 300, friction: 25 })
   */
  testSpring(element, config) {
    const spring = new SpringPhysics(config);
    const timing = spring.calculateSpringTiming();
    
    console.group('🌸 Spring Test Results');
    console.log('Config:', config);
    console.log('Duration:', timing.duration + 'ms');
    console.log('Easing:', timing.cssEasing);
    console.log('Damping Ratio:', config.friction / (2 * Math.sqrt(config.tension * config.mass)));
    console.groupEnd();
    
    // Apply to element for visual testing
    SpringUtils.applySpringTiming(element, config);
    element.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
      element.classList.add('spring-animate');
      element.style.transform = 'translateY(0)';
    }, 100);
    
    return timing;
  },

  /**
   * Compare all presets visually
   */
  comparePresets(element) {
    console.table(Object.keys(SpringPresets).map(preset => {
      const spring = new SpringPhysics(SpringPresets[preset]);
      const timing = spring.calculateSpringTiming();
      return {
        preset,
        duration: timing.duration + 'ms',
        easing: timing.cssEasing,
        config: SpringPresets[preset]
      };
    }));
  }
};

// Export everything for modular use
export default {
  SpringPresets,
  SpringPhysics,
  SpringUtils,
  SpringPerformance,
  SpringDebug
};