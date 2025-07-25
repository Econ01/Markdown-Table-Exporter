// features/conversion.js - Table Conversion Logic

import { AppState, Elements } from '../core/state.js';
import { showLoading, hideLoading } from './loading.js';
import { showSnackbar } from './feedback.js';
import { addSuccessAnimation } from '../core/motion.js';
import { updateUI, updateStatus, showResultCard, hideResultCard } from './ui-updates.js';

// Convert Function
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
    
    // Show conversion UI states
    showLoading('Converting markdown table...');
    updateStatus('Converting your table...', 'info', 'autorenew');
    addConvertProgress();
    
    try {
        const result = await pywebview.api.convert_table();
        const response = JSON.parse(result);
        
        hideLoading();
        removeConvertProgress();
        
        if (response.status === 'success') {
            updateStatus('Conversion completed successfully!', 'success', 'check_circle');
            showResultCard(response.filePath, response.fileName);
            showSnackbar('Table converted successfully!', 'success');
            
            // Success animation
            addSuccessAnimation(Elements.convertBtn);
            
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
        }
    } catch (error) {
        hideLoading();
        removeConvertProgress();
        console.error('❌ Conversion error:', error);
        updateStatus('Conversion failed: ' + error.message, 'error', 'error');
        showSnackbar('Conversion failed: ' + error.message, 'error');
        hideResultCard();
    } finally {
        AppState.isConverting = false;
        updateUI();
    }
}

// Convert Progress Animation
function addConvertProgress() {
    if (!Elements.convertBtn) return;
    
    const progress = Elements.convertBtn.querySelector('.convert-progress');
    if (progress) {
        progress.style.opacity = '1';
        progress.style.animation = `progressFill 1000ms cubic-bezier(0.2, 0, 0, 1) forwards`;
    }
}

function removeConvertProgress() {
    if (!Elements.convertBtn) return;
    
    const progress = Elements.convertBtn.querySelector('.convert-progress');
    if (progress) {
        progress.style.opacity = '0';
        progress.style.animation = '';
        progress.style.width = '0%';
    }
}

// Global function for HTML onclick handlers
window.showFileLocation = function(filePath) {
    showSnackbar('Opening file location...', 'info');
    console.log('Opening file location:', filePath);
};