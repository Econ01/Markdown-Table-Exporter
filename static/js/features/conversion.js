// features/conversion.js - Enhanced Conversion with Spring Animations

import { AppState, Elements } from '../core/state.js';
import { showLoading, hideLoading } from './loading.js';
import { showSnackbar } from './feedback.js';
import { addSuccessAnimation, animateProgress, animateConversionProcess } from '../core/motion.js';
import { SpringUtils, SpringPerformance } from '../core/spring-physics.js';
import { updateUI, updateStatus, showResultCard, hideResultCard } from './ui-updates.js';

// Enhanced Convert Function with Spring Physics
export async function convertTable() {
    if (AppState.isConverting || !AppState.inputFile) {
        return;
    }
    
    // Check if pywebview is available
    if (typeof pywebview === 'undefined' || !pywebview.api || !pywebview.api.convert_table) {
        showSnackbar('Conversion not available in browser mode', 'error');
        return;
    }
    
    AppState.isConverting = true;
    updateUI();
    
    // Enhanced conversion process with spring animations
    await startConversionAnimation();
    
    try {
        const result = await pywebview.api.convert_table();
        const response = JSON.parse(result);
        
        await completeConversionAnimation(response.status === 'success');
        
        if (response.status === 'success') {
            updateStatus('Conversion completed successfully!', 'success', 'check_circle');
            showResultCard(response.filePath, response.fileName);
            showSnackbar('Table converted successfully!', 'success');
            
            // Enhanced success celebration
            await celebrateConversionSuccess();
            
            // Auto-hide result after delay
            setTimeout(() => {
                if (Elements.resultCard && !Elements.resultCard.classList.contains('hidden')) {
                    hideResultCard();
                }
            }, 15000);
            
        } else {
            updateStatus('Conversion failed', 'error', 'error');
            showSnackbar(response.message || 'Conversion failed', 'error');
            hideResultCard();
            
            // Error animation
            await animateConversionError();
        }
    } catch (error) {
        await completeConversionAnimation(false);
        console.error('❌ Conversion error:', error);
        updateStatus('Conversion failed: ' + error.message, 'error', 'error');
        showSnackbar('Conversion failed: ' + error.message, 'error');
        hideResultCard();
        
        // Error animation
        await animateConversionError();
    } finally {
        AppState.isConverting = false;
        updateUI();
    }
}

// Enhanced Animation Functions

async function startConversionAnimation() {
    showLoading('Converting markdown table...');
    updateStatus('Converting your table...', 'info', 'autorenew');
    
    if (!SpringPerformance.canAnimate()) return;
    
    // Conversion process spring animation sequence
    const conversionStages = [
        {
            element: Elements.convertBtn,
            properties: { transform: 'scale(0.95)' },
            preset: 'quick'
        },
        {
            element: Elements.uploadZone,
            properties: { 
                transform: 'scale(0.98)',
                opacity: '0.7'
            },
            preset: 'smooth',
            delay: 100
        },
        {
            element: Elements.sourceFile,
            properties: { 
                transform: 'translateY(-5px)',
                opacity: '0.8'
            },
            preset: 'gentle',
            delay: 200
        }
    ];
    
    animateConversionProcess(conversionStages);
    
    // Add pulsing progress animation
    addConvertProgress();
    
    // Add processing indicator to upload zone
    if (Elements.uploadZone) {
        Elements.uploadZone.classList.remove('spring-breathing');
        Elements.uploadZone.classList.add('spring-processing');
    }
}

async function completeConversionAnimation(success) {
    hideLoading();
    removeConvertProgress();
    
    if (!SpringPerformance.canAnimate()) return;
    
    // Return elements to normal state with spring physics
    const returnStages = [
        {
            element: Elements.convertBtn,
            properties: { transform: 'scale(1)' },
            preset: success ? 'bouncy' : 'smooth'
        },
        {
            element: Elements.uploadZone,
            properties: { 
                transform: 'scale(1)',
                opacity: '1'
            },
            preset: 'smooth',
            delay: 50
        },
        {
            element: Elements.sourceFile,
            properties: { 
                transform: 'translateY(0)',
                opacity: '1'
            },
            preset: 'gentle',
            delay: 100
        }
    ];
    
    animateConversionProcess(returnStages);
    
    // Remove processing state
    if (Elements.uploadZone) {
        Elements.uploadZone.classList.remove('spring-processing');
        if (!AppState.inputFile) {
            Elements.uploadZone.classList.add('spring-breathing');
        }
    }
}

async function celebrateConversionSuccess() {
    if (!SpringPerformance.canAnimate()) return;
    
    // Multi-element celebration sequence
    const celebrations = [
        // Convert button celebration
        {
            element: Elements.convertBtn,
            properties: { 
                transform: 'scale(1.05)',
                boxShadow: '0 12px 32px rgba(76, 175, 80, 0.3)'
            },
            preset: 'bouncy'
        },
        // Button return to normal
        {
            element: Elements.convertBtn,
            properties: { 
                transform: 'scale(1)',
                boxShadow: 'var(--md-sys-elevation-level2)'
            },
            preset: 'smooth',
            delay: 300
        }
    ];
    
    SpringUtils.springSequence(celebrations);
    
    // Add success animation to convert button
    setTimeout(() => {
        addSuccessAnimation(Elements.convertBtn, 'celebration');
    }, 200);
    
    // Celebrate upload zone
    if (Elements.uploadZone) {
        setTimeout(() => {
            SpringUtils.springTo(Elements.uploadZone, {
                transform: 'scale(1.02) rotate(0.5deg)'
            }, 'bouncy', () => {
                SpringUtils.springTo(Elements.uploadZone, {
                    transform: 'scale(1) rotate(0deg)'
                }, 'smooth');
            });
        }, 400);
    }
    
    // Add sparkle effect (visual only, no actual sparkles)
    if (Elements.statusCard) {
        setTimeout(() => {
            addSuccessAnimation(Elements.statusCard, 'bounce');
        }, 600);
    }
}

async function animateConversionError() {
    if (!SpringPerformance.canAnimate()) return;
    
    // Error shake sequence
    const errorAnimations = [
        {
            element: Elements.convertBtn,
            properties: { transform: 'translateX(-5px)' },
            preset: 'quick'
        },
        {
            element: Elements.convertBtn,
            properties: { transform: 'translateX(5px)' },
            preset: 'quick',
            delay: 100
        },
        {
            element: Elements.convertBtn,
            properties: { transform: 'translateX(-3px)' },
            preset: 'quick',
            delay: 100
        },
        {
            element: Elements.convertBtn,
            properties: { transform: 'translateX(0)' },
            preset: 'smooth',
            delay: 100
        }
    ];
    
    SpringUtils.springSequence(errorAnimations);
    
    // Error color flash
    if (Elements.convertBtn) {
        SpringUtils.springTo(Elements.convertBtn, {
            backgroundColor: 'var(--md-sys-color-error)',
            color: 'var(--md-sys-color-on-error)'
        }, 'quick', () => {
            setTimeout(() => {
                SpringUtils.springTo(Elements.convertBtn, {
                    backgroundColor: 'var(--md-sys-color-primary)',
                    color: 'var(--md-sys-color-on-primary)'
                }, 'smooth');
            }, 1000);
        });
    }
}

// Enhanced Progress Animation
function addConvertProgress() {
    if (!Elements.convertBtn) return;
    
    const progress = Elements.convertBtn.querySelector('.convert-progress');
    if (!progress) return;
    
    if (SpringPerformance.canAnimate()) {
        // Spring-based progress animation
        progress.style.opacity = '1';
        
        // Animate progress with spring physics
        animateProgress(progress, 100, 'smooth');
        
        // Add pulsing effect
        progress.classList.add('spring-pulse');
    } else {
        progress.style.opacity = '1';
        progress.style.animation = `progressFill 1000ms linear forwards`;
    }
}

function removeConvertProgress() {
    if (!Elements.convertBtn) return;
    
    const progress = Elements.convertBtn.querySelector('.convert-progress');
    if (!progress) return;
    
    if (SpringPerformance.canAnimate()) {
        // Spring fade out
        SpringUtils.springTo(progress, {
            opacity: '0',
            transform: 'scaleX(0)'
        }, 'smooth', () => {
            progress.style.width = '0%';
            progress.style.transform = '';
            progress.classList.remove('spring-pulse');
        });
    } else {
        progress.style.opacity = '0';
        progress.style.animation = '';
        progress.style.width = '0%';
    }
}

// Button State Management with Springs
export function updateConvertButtonState(state) {
    if (!Elements.convertBtn || SpringUtils.prefersReducedMotion()) {
        updateConvertButtonImmediate(state);
        return;
    }
    
    switch (state) {
        case 'ready':
            SpringUtils.springTo(Elements.convertBtn, {
                opacity: '1',
                transform: 'scale(1)',
                backgroundColor: 'var(--md-sys-color-primary)'
            }, 'smooth');
            Elements.convertBtn.disabled = false;
            break;
            
        case 'disabled':
            SpringUtils.springTo(Elements.convertBtn, {
                opacity: '0.6',
                transform: 'scale(0.98)',
                backgroundColor: 'var(--md-sys-color-on-surface)'
            }, 'smooth');
            Elements.convertBtn.disabled = true;
            break;
            
        case 'processing':
            SpringUtils.springTo(Elements.convertBtn, {
                transform: 'scale(0.96)',
                opacity: '0.8'
            }, 'smooth');
            Elements.convertBtn.disabled = true;
            break;
            
        case 'success':
            SpringUtils.springTo(Elements.convertBtn, {
                transform: 'scale(1)',
                opacity: '1',
                backgroundColor: 'var(--md-sys-color-success)'
            }, 'bouncy', () => {
                // Return to normal color after celebration
                setTimeout(() => {
                    SpringUtils.springTo(Elements.convertBtn, {
                        backgroundColor: 'var(--md-sys-color-primary)'
                    }, 'smooth');
                }, 2000);
            });
            Elements.convertBtn.disabled = false;
            break;
    }
}

function updateConvertButtonImmediate(state) {
    if (!Elements.convertBtn) return;
    
    const button = Elements.convertBtn;
    
    switch (state) {
        case 'ready':
            button.style.opacity = '1';
            button.style.transform = 'scale(1)';
            button.disabled = false;
            break;
            
        case 'disabled':
            button.style.opacity = '0.6';
            button.disabled = true;
            break;
            
        case 'processing':
            button.disabled = true;
            break;
            
        case 'success':
            button.disabled = false;
            break;
    }
}

// Conversion Stage Indicators
export function showConversionStage(stage) {
    const stages = {
        'parsing': 'Parsing markdown content...',
        'processing': 'Processing table structure...',
        'generating': 'Generating HTML output...',
        'finalizing': 'Finalizing conversion...'
    };
    
    const message = stages[stage] || 'Converting...';
    updateStatus(message, 'info', 'autorenew');
    
    // Add visual stage indicator with spring animation
    if (SpringPerformance.canAnimate() && Elements.statusCard) {
        SpringUtils.springTo(Elements.statusCard, {
            transform: 'scale(1.01)'
        }, 'quick', () => {
            SpringUtils.springTo(Elements.statusCard, {
                transform: 'scale(1)'
            }, 'smooth');
        });
    }
}

// Global function for HTML onclick handlers
window.showFileLocation = function(filePath) {
    showSnackbar('Opening file location...', 'info');
    console.log('Opening file location:', filePath);
    
    // Add spring feedback to any buttons that triggered this
    const buttons = document.querySelectorAll('.result-actions button');
    buttons.forEach(button => {
        if (SpringPerformance.canAnimate()) {
            SpringUtils.springTo(button, {
                transform: 'scale(0.95)'
            }, 'quick', () => {
                SpringUtils.springTo(button, {
                    transform: 'scale(1)'
                }, 'bouncy');
            });
        }
    });
};