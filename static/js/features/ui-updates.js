// features/ui-updates.js - UI State Updates

import { AppState, Elements } from '../core/state.js';
import { animateElementIn, animateElementOut } from '../core/motion.js';

// UI State Management
export function updateUI() {
    if (!AppState.isInitialized) return;
    
    // Update convert button
    if (Elements.convertBtn) {
        Elements.convertBtn.disabled = AppState.isConverting || !AppState.inputFile;
        
        if (AppState.isConverting) {
            Elements.convertBtn.innerHTML = `
                <div class="loading-spinner" style="width: 20px; height: 20px;"></div>
                <span class="button-text">Converting...</span>
                <div class="button-state-layer"></div>
            `;
            Elements.convertBtn.classList.add('processing');
        } else {
            Elements.convertBtn.innerHTML = `
                <span class="material-symbols-rounded button-icon">auto_fix_high</span>
                <span class="button-text">Convert to HTML</span>
                <div class="convert-progress"></div>
                <div class="button-state-layer"></div>
            `;
            Elements.convertBtn.classList.remove('processing');
        }
    }
    
    // Update other button states
    const actionButtons = [Elements.sourceBtn, Elements.outputBtn];
    actionButtons.forEach(btn => {
        if (btn) {
            btn.disabled = AppState.isConverting;
        }
    });
    
    // Update drop zone state
    if (Elements.dropZone) {
        Elements.dropZone.classList.toggle('converting', AppState.isConverting);
    }
}

// Status Management
export function updateStatus(message, type = 'info', icon = 'info') {
    if (!Elements.statusCard) return;
    
    const iconMap = {
        info: 'info',
        success: 'check_circle',
        error: 'error',
        warning: 'warning'
    };
    
    const statusHTML = `
        <div class="status-content">
            <span class="material-symbols-rounded status-icon">${iconMap[icon] || iconMap[type]}</span>
            <div class="status-text">
                <h5 class="status-title">${getStatusTitle(type)}</h5>
                <p class="status-message">${message}</p>
            </div>
        </div>
    `;
    
    Elements.statusCard.innerHTML = statusHTML;
    Elements.statusCard.className = `status-card surface-container ${type}`;
    
    // Add entrance animation
    animateElementIn(Elements.statusCard);
}

function getStatusTitle(type) {
    const titles = {
        info: 'Ready to Convert',
        success: 'Success',
        error: 'Error',
        warning: 'Warning'
    };
    return titles[type] || 'Status';
}

// Result Card Management
export function showResultCard(filePath, fileName) {
    if (!Elements.resultCard) return;
    
    const resultHTML = `
        <div class="result-content">
            <div class="result-info">
                <span class="material-symbols-rounded result-icon">task_alt</span>
                <div class="result-text">
                    <h5 class="result-title">Conversion Complete!</h5>
                    <p class="result-subtitle">Your HTML file is ready: ${fileName}</p>
                </div>
            </div>
            <div class="result-actions">
                <a href="file://${filePath}" target="_blank" class="result-link">
                    <span class="material-symbols-rounded">open_in_new</span>
                    Open File
                </a>
                <button onclick="showFileLocation('${filePath.replace(/\\/g, '\\\\')}')" class="action-button outlined-button">
                    <span class="material-symbols-rounded button-icon">folder_open</span>
                    <span class="button-text">Show in Folder</span>
                    <div class="button-state-layer"></div>
                </button>
            </div>
        </div>
    `;
    
    Elements.resultCard.innerHTML = resultHTML;
    Elements.resultCard.classList.remove('hidden');
    animateElementIn(Elements.resultCard);
}

export function hideResultCard() {
    if (Elements.resultCard) {
        animateElementOut(Elements.resultCard);
    }
}

// Upload Zone State Management
export function updateUploadZoneState(state) {
    if (!Elements.uploadZone) return;
    
    Elements.uploadZone.classList.remove('drag-over', 'has-file');
    
    switch (state) {
        case 'drag-over':
            Elements.uploadZone.classList.add('drag-over');
            break;
        case 'has-file':
            Elements.uploadZone.classList.add('has-file');
            updateUploadZoneContent('File loaded successfully!', 'check_circle');
            break;
        case 'default':
        default:
            updateUploadZoneContent('Drop your markdown file here', 'cloud_upload');
            break;
    }
}

function updateUploadZoneContent(text, icon) {
    const uploadIcon = Elements.uploadZone?.querySelector('.upload-icon');
    const uploadTitle = Elements.uploadZone?.querySelector('.upload-title');
    
    if (uploadIcon) {
        uploadIcon.textContent = icon;
    }
    
    if (uploadTitle) {
        uploadTitle.textContent = text;
    }
}