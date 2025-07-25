// features/drag-drop.js - Enhanced Drag and Drop with Spring Animations

import { AppState, Elements } from '../core/state.js';
import { showLoading, hideLoading } from './loading.js';
import { showSnackbar } from './feedback.js';
import { updateFilePreview, clearFilePreview } from './file-operations.js';
import { updateUploadZoneState, updateStatus, updateUI } from './ui-updates.js';
import { SpringUtils, SpringPerformance } from '../core/spring-physics.js';
import { celebrateFileDrop, addSuccessAnimation } from '../core/motion.js';

// Enhanced Drag and Drop Setup with Spring Physics
export function setupDragAndDrop() {
    if (!Elements.dropZone) return;
    
    const preventDefaults = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    
    const handleDragEnter = (e) => {
        if (AppState.isConverting) return;
        
        // Enhanced spring animation for drag enter
        if (SpringPerformance.canAnimate()) {
            // Stop breathing animation
            Elements.uploadZone?.classList.remove('spring-breathing');
            
            // Add excited spring animation
            Elements.uploadZone?.classList.add('spring-excited');
            
            // Apply dynamic spring timing
            SpringUtils.applySpringTiming(Elements.uploadZone, 'bouncy');
            
            // Add contextual reactions to surrounding elements
            addDragContextualReactions();
        }
        
        updateUploadZoneState('drag-over');
    };
    
    const handleDragOver = (e) => {
        if (AppState.isConverting) return;
        
        // Continuous hover effect with spring physics
        if (SpringPerformance.canAnimate() && Elements.uploadZone) {
            // Subtle pulsing effect while dragging over
            if (!Elements.uploadZone.classList.contains('spring-drag-hover')) {
                Elements.uploadZone.classList.add('spring-drag-hover');
                
                // Add subtle floating animation
                SpringUtils.springTo(Elements.uploadZone, {
                    transform: 'translateY(-2px) scale(1.02)'
                }, 'gentle');
            }
        }
    };
    
    const handleDragLeave = (e) => {
        // Check if we're actually leaving the drop zone (not just moving to a child)
        if (!Elements.dropZone.contains(e.relatedTarget)) {
            // Spring return to normal state
            if (SpringPerformance.canAnimate() && Elements.uploadZone) {
                Elements.uploadZone.classList.remove('spring-excited', 'spring-drag-hover');
                
                // Smooth spring return
                SpringUtils.springTo(Elements.uploadZone, {
                    transform: 'translateY(0) scale(1)'
                }, 'smooth', () => {
                    // Resume breathing animation if no file is loaded
                    if (!AppState.inputFile) {
                        Elements.uploadZone.classList.add('spring-breathing');
                    }
                });
            }
            
            removeDragContextualReactions();
            updateUploadZoneState(AppState.inputFile ? 'has-file' : 'default');
        }
    };
    
    const handleDrop = async (e) => {
        if (AppState.isConverting) return;
        
        const files = Array.from(e.dataTransfer.files);
        const file = files[0];
        
        // Immediate spring feedback for drop
        if (SpringPerformance.canAnimate() && Elements.uploadZone) {
            Elements.uploadZone.classList.remove('spring-excited', 'spring-drag-hover', 'spring-breathing');
            
            // Drop impact animation
            SpringUtils.springTo(Elements.uploadZone, {
                transform: 'scale(0.98)'
            }, 'quick', () => {
                // Quick bounce back
                SpringUtils.springTo(Elements.uploadZone, {
                    transform: 'scale(1)'
                }, 'snappy');
            });
        }
        
        removeDragContextualReactions();
        
        if (!file) {
            updateUploadZoneState(AppState.inputFile ? 'has-file' : 'default');
            
            // Resume breathing if no file
            if (!AppState.inputFile && SpringPerformance.canAnimate()) {
                setTimeout(() => {
                    Elements.uploadZone?.classList.add('spring-breathing');
                }, 500);
            }
            return;
        }
        
        if (!file.name.toLowerCase().endsWith('.md')) {
            updateUploadZoneState('default');
            showSnackbar('Please select a .md (Markdown) file', 'error');
            
            // Error shake animation
            if (SpringPerformance.canAnimate()) {
                animateDropError();
            }
            
            return;
        }
        
        showLoading('Processing dropped file...');
        
        try {
            // Check if pywebview is available
            if (typeof pywebview === 'undefined' || !pywebview.api || !pywebview.api.set_input_path) {
                updateUploadZoneState('default');
                showSnackbar('File processing not available in browser mode', 'error');
                return;
            }
            
            const result = await pywebview.api.set_input_path(file.path || file.name);
            const response = JSON.parse(result);
            
            hideLoading();
            
            if (response.status === 'success') {
                AppState.inputFile = response.path;
                await updateFilePreview(response.path);
                updateUploadZoneState('has-file');
                updateStatus('File loaded via drag & drop', 'success', 'check_circle');
                showSnackbar('File loaded successfully!', 'success');
                updateUI();
                
                // Enhanced success celebration
                celebrateSuccessfulDrop();
                
            } else {
                updateUploadZoneState('default');
                showSnackbar(response.message, 'error');
                AppState.inputFile = null;
                clearFilePreview();
                updateUI();
                
                // Error animation
                if (SpringPerformance.canAnimate()) {
                    animateDropError();
                }
            }
        } catch (error) {
            hideLoading();
            updateUploadZoneState('default');
            console.error('❌ Error handling dropped file:', error);
            showSnackbar('Error loading file: ' + error.message, 'error');
            
            // Error animation
            if (SpringPerformance.canAnimate()) {
                animateDropError();
            }
        }
    };
    
    // Add event listeners
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        Elements.dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    Elements.dropZone.addEventListener('dragenter', handleDragEnter, false);
    Elements.dropZone.addEventListener('dragover', handleDragOver, false);
    Elements.dropZone.addEventListener('dragleave', handleDragLeave, false);
    Elements.dropZone.addEventListener('drop', handleDrop, false);
}

// Enhanced Animation Functions

function addDragContextualReactions() {
    // Make surrounding elements react to drag state
    const reactiveElements = document.querySelectorAll('.action-button, .status-card');
    
    reactiveElements.forEach((element, index) => {
        if (SpringPerformance.canAnimate()) {
            // Staggered subtle reactions
            setTimeout(() => {
                SpringUtils.springTo(element, {
                    transform: 'translateY(-1px)',
                    opacity: '0.9'
                }, 'gentle');
            }, index * 50);
        }
    });
}

function removeDragContextualReactions() {
    const reactiveElements = document.querySelectorAll('.action-button, .status-card');
    
    reactiveElements.forEach((element, index) => {
        if (SpringPerformance.canAnimate()) {
            // Staggered return to normal
            setTimeout(() => {
                SpringUtils.springTo(element, {
                    transform: 'translateY(0)',
                    opacity: '1'
                }, 'smooth');
            }, index * 30);
        }
    });
}

function celebrateSuccessfulDrop() {
    if (!SpringPerformance.canAnimate()) return;
    
    // Multi-stage celebration animation
    const celebrations = [
        {
            element: Elements.uploadZone,
            properties: { transform: 'scale(1.1) rotate(1deg)' },
            preset: 'bouncy'
        },
        {
            element: Elements.uploadZone,
            properties: { transform: 'scale(1) rotate(0deg)' },
            preset: 'smooth',
            delay: 200
        }
    ];
    
    SpringUtils.springSequence(celebrations, () => {
        // Add success celebration class
        Elements.uploadZone?.classList.add('success-celebration');
        
        // Start gentle breathing after celebration
        setTimeout(() => {
            Elements.uploadZone?.classList.remove('success-celebration');
            if (SpringPerformance.canAnimate()) {
                Elements.uploadZone?.classList.add('spring-breathing');
            }
        }, 1200);
    });
    
    // Celebrate other elements too
    if (Elements.sourceFile) {
        setTimeout(() => {
            addSuccessAnimation(Elements.sourceFile, 'bounce');
        }, 300);
    }
}

function animateDropError() {
    if (!Elements.uploadZone || !SpringPerformance.canAnimate()) return;
    
    // Error shake animation with spring physics
    const shakeSequence = [
        {
            element: Elements.uploadZone,
            properties: { transform: 'translateX(-10px)' },
            preset: 'quick'
        },
        {
            element: Elements.uploadZone,
            properties: { transform: 'translateX(10px)' },
            preset: 'quick',
            delay: 100
        },
        {
            element: Elements.uploadZone,
            properties: { transform: 'translateX(-5px)' },
            preset: 'quick',
            delay: 100
        },
        {
            element: Elements.uploadZone,
            properties: { transform: 'translateX(0)' },
            preset: 'smooth',
            delay: 100
        }
    ];
    
    SpringUtils.springSequence(shakeSequence, () => {
        // Resume breathing animation after error
        setTimeout(() => {
            if (SpringPerformance.canAnimate() && !AppState.inputFile) {
                Elements.uploadZone?.classList.add('spring-breathing');
            }
        }, 500);
    });
}

// Advanced Drag Interactions

export function setupAdvancedDragBehaviors() {
    if (!Elements.uploadZone) return;
    
    // Mouse proximity effect when not dragging
    let proximityTimeout;
    
    Elements.uploadZone.addEventListener('mouseenter', () => {
        if (AppState.isConverting || SpringUtils.prefersReducedMotion()) return;
        
        clearTimeout(proximityTimeout);
        
        // Subtle hover spring effect
        if (!Elements.uploadZone.classList.contains('spring-excited')) {
            SpringUtils.springTo(Elements.uploadZone, {
                transform: 'scale(1.01)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
            }, 'gentle');
        }
    });
    
    Elements.uploadZone.addEventListener('mouseleave', () => {
        if (AppState.isConverting || SpringUtils.prefersReducedMotion()) return;
        
        proximityTimeout = setTimeout(() => {
            if (!Elements.uploadZone.classList.contains('spring-excited')) {
                SpringUtils.springTo(Elements.uploadZone, {
                    transform: 'scale(1)',
                    boxShadow: 'var(--md-sys-elevation-level2)'
                }, 'smooth');
            }
        }, 100);
    });
    
    // Click animation for manual file selection
    Elements.uploadZone.addEventListener('click', () => {
        if (AppState.isConverting || SpringUtils.prefersReducedMotion()) return;
        
        // Quick press feedback
        SpringUtils.springTo(Elements.uploadZone, {
            transform: 'scale(0.98)'
        }, 'quick', () => {
            SpringUtils.springTo(Elements.uploadZone, {
                transform: 'scale(1)'
            }, 'bouncy');
        });
    });
}

// File Type Visual Feedback
export function addFileTypeSpringFeedback(fileName) {
    if (!Elements.uploadZone || !SpringPerformance.canAnimate()) return;
    
    const isMarkdown = fileName.toLowerCase().endsWith('.md');
    
    if (isMarkdown) {
        // Positive feedback for correct file type
        Elements.uploadZone.style.setProperty('--upload-border-color', 'var(--md-sys-color-success)');
        
        SpringUtils.springTo(Elements.uploadZone, {
            borderColor: 'var(--md-sys-color-success)',
            backgroundColor: 'var(--md-sys-color-success-container)'
        }, 'smooth');
        
    } else {
        // Negative feedback for incorrect file type
        Elements.uploadZone.style.setProperty('--upload-border-color', 'var(--md-sys-color-error)');
        
        SpringUtils.springTo(Elements.uploadZone, {
            borderColor: 'var(--md-sys-color-error)',
            backgroundColor: 'var(--md-sys-color-error-container)'
        }, 'quick');
        
        // Quick shake for wrong file type
        setTimeout(() => {
            animateDropError();
        }, 100);
    }
}

// Drag State Management with Spring Physics
export function updateDragState(state) {
    if (!Elements.uploadZone || SpringUtils.prefersReducedMotion()) return;
    
    switch (state) {
        case 'idle':
            Elements.uploadZone.classList.remove('spring-excited', 'spring-drag-hover');
            if (!AppState.inputFile) {
                Elements.uploadZone.classList.add('spring-breathing');
            }
            SpringUtils.springTo(Elements.uploadZone, {
                transform: 'scale(1)',
                opacity: '1'
            }, 'smooth');
            break;
            
        case 'dragover':
            Elements.uploadZone.classList.remove('spring-breathing');
            Elements.uploadZone.classList.add('spring-excited');
            SpringUtils.springTo(Elements.uploadZone, {
                transform: 'scale(1.02) translateY(-2px)',
                opacity: '1'
            }, 'bouncy');
            break;
            
        case 'processing':
            Elements.uploadZone.classList.remove('spring-breathing', 'spring-excited', 'spring-drag-hover');
            SpringUtils.springTo(Elements.uploadZone, {
                transform: 'scale(1)',
                opacity: '0.8'
            }, 'smooth');
            break;
            
        case 'success':
            celebrateSuccessfulDrop();
            break;
            
        case 'error':
            animateDropError();
            break;
    }
}

// Performance Optimizations for Drag Events
let dragAnimationFrame;

export function optimizedDragAnimation(callback) {
    if (dragAnimationFrame) {
        cancelAnimationFrame(dragAnimationFrame);
    }
    
    dragAnimationFrame = requestAnimationFrame(callback);
}

// Export enhanced drag and drop system
export default {
    setupDragAndDrop,
    setupAdvancedDragBehaviors,
    addFileTypeSpringFeedback,
    updateDragState,
    optimizedDragAnimation,
    celebrateSuccessfulDrop,
    animateDropError
};