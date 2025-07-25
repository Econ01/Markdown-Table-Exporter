// core/motion.js - Material Motion System

// Material Motion System
export const MotionSystem = {
    // Standard easing curves
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    standardAccelerate: 'cubic-bezier(0.3, 0, 1, 1)',
    standardDecelerate: 'cubic-bezier(0, 0, 0, 1)',
    emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasizedAccelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
    emphasizedDecelerate: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
    
    // Duration tokens
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
    }
};

// Animation Utilities
export function animateElementIn(element) {
    if (!element) return;
    
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    
    requestAnimationFrame(() => {
        element.style.transition = `all ${MotionSystem.duration.medium4}ms ${MotionSystem.emphasizedDecelerate}`;
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    });
}

export function animateElementOut(element) {
    if (!element) return;
    
    element.style.transition = `all ${MotionSystem.duration.medium2}ms ${MotionSystem.emphasizedAccelerate}`;
    element.style.opacity = '0';
    element.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
        element.classList.add('hidden');
        element.style.opacity = '';
        element.style.transform = '';
        element.style.transition = '';
    }, MotionSystem.duration.medium2);
}

// Setup Motion System
export function setupMotionSystem() {
    // Add entrance animations to key elements
    const animatedElements = document.querySelectorAll('.primary-card');
    
    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(40px)';
        
        setTimeout(() => {
            element.style.transition = `all ${MotionSystem.duration.long2}ms ${MotionSystem.emphasizedDecelerate}`;
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 200 + (index * 100));
    });
}

// Welcome Animation
export function showWelcomeAnimation() {
    const uploadZone = document.getElementById('upload-zone');
    if (uploadZone) {
        uploadZone.style.transform = 'scale(0.95)';
        uploadZone.style.opacity = '0.8';
        
        setTimeout(() => {
            uploadZone.style.transition = `all ${MotionSystem.duration.medium4}ms ${MotionSystem.emphasizedDecelerate}`;
            uploadZone.style.transform = 'scale(1)';
            uploadZone.style.opacity = '1';
        }, 600);
    }
}

// Success Animation
export function addSuccessAnimation(element) {
    if (!element) return;
    
    element.style.transform = 'scale(1.05)';
    element.style.boxShadow = '0 8px 24px rgba(76, 175, 80, 0.3)';
    
    setTimeout(() => {
        element.style.transition = `all ${MotionSystem.duration.medium2}ms ${MotionSystem.emphasizedDecelerate}`;
        element.style.transform = 'scale(1)';
        element.style.boxShadow = '';
    }, MotionSystem.duration.medium2);
}