// features/feedback.js - User Feedback Systems

import { Elements } from '../core/state.js';
import { MotionSystem } from '../core/motion.js';

// Snackbar System
export function showSnackbar(message, type = 'info', duration = 4000) {
    if (!Elements.snackbarContainer) {
        Elements.snackbarContainer = createSnackbarContainer();
    }
    
    const snackbar = document.createElement('div');
    snackbar.className = `snackbar ${type}`;
    
    const iconMap = {
        success: 'check_circle',
        error: 'error',
        warning: 'warning',
        info: 'info'
    };
    
    snackbar.innerHTML = `
        <span class="material-symbols-rounded snackbar-icon">${iconMap[type]}</span>
        <span class="snackbar-text">${message}</span>
        <button class="snackbar-action" onclick="this.parentElement.remove()">
            DISMISS
        </button>
    `;
    
    Elements.snackbarContainer.appendChild(snackbar);
    
    // Auto remove
    setTimeout(() => {
        if (snackbar.parentElement) {
            snackbar.classList.add('slide-out');
            setTimeout(() => {
                if (snackbar.parentElement) {
                    snackbar.remove();
                }
            }, MotionSystem.duration.medium2);
        }
    }, duration);
}

function createSnackbarContainer() {
    const container = document.createElement('div');
    container.id = 'snackbar-container';
    container.className = 'snackbar-container';
    document.body.appendChild(container);
    return container;
}

// Dialog System
export function showHelpDialog() {
    if (!Elements.dialogContainer) return;
    
    const dialogHTML = `
        <div class="dialog">
            <div class="dialog-header">
                <h4 class="dialog-title">How to Use</h4>
            </div>
            <div class="dialog-content">
                <div style="display: flex; flex-direction: column; gap: 24px;">
                    <div>
                        <h5 class="title-medium" style="margin-bottom: 8px; color: var(--md-sys-color-primary);">
                            <span class="material-symbols-rounded" style="vertical-align: middle; margin-right: 8px;">upload_file</span>
                            Select Your File
                        </h5>
                        <p class="body-medium">Choose a .md file containing a markdown table, or simply drag and drop it onto the upload area.</p>
                    </div>
                    <div>
                        <h5 class="title-medium" style="margin-bottom: 8px; color: var(--md-sys-color-secondary);">
                            <span class="material-symbols-rounded" style="vertical-align: middle; margin-right: 8px;">folder</span>
                            Choose Output Location
                        </h5>
                        <p class="body-medium">Optionally select where to save the HTML file. If not selected, it will be saved in the same folder as your source file.</p>
                    </div>
                    <div>
                        <h5 class="title-medium" style="margin-bottom: 8px; color: var(--md-sys-color-tertiary);">
                            <span class="material-symbols-rounded" style="vertical-align: middle; margin-right: 8px;">auto_fix_high</span>
                            Convert & Enjoy
                        </h5>
                        <p class="body-medium">Click the convert button to transform your markdown table into a beautiful, interactive HTML file.</p>
                    </div>
                    <div style="padding: 16px; background: var(--md-sys-color-surface-container-low); border-radius: 12px;">
                        <h6 class="title-small" style="margin-bottom: 8px;">
                            <span class="material-symbols-rounded" style="vertical-align: middle; margin-right: 8px; font-size: 16px;">keyboard</span>
                            Keyboard Shortcuts
                        </h6>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
                            <div><kbd style="background: var(--md-sys-color-outline); color: var(--md-sys-color-surface); padding: 2px 6px; border-radius: 4px;">Ctrl+K</kbd> Command Palette</div>
                            <div><kbd style="background: var(--md-sys-color-outline); color: var(--md-sys-color-surface); padding: 2px 6px; border-radius: 4px;">Ctrl+O</kbd> Open file</div>
                            <div><kbd style="background: var(--md-sys-color-outline); color: var(--md-sys-color-surface); padding: 2px 6px; border-radius: 4px;">Ctrl+T</kbd> Toggle theme</div>
                            <div><kbd style="background: var(--md-sys-color-outline); color: var(--md-sys-color-surface); padding: 2px 6px; border-radius: 4px;">F1</kbd> Show help</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="dialog-actions">
                <button class="action-button filled-button" onclick="hideDialog()">
                    <span class="button-text">Got it!</span>
                    <div class="button-state-layer"></div>
                </button>
            </div>
        </div>
    `;
    
    Elements.dialogContainer.innerHTML = dialogHTML;
    Elements.dialogContainer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Focus management
    const dialog = Elements.dialogContainer.querySelector('.dialog');
    if (dialog) {
        dialog.focus();
    }
}

export function hideDialog() {
    if (Elements.dialogContainer) {
        Elements.dialogContainer.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// Global function for HTML onclick handlers
window.hideDialog = hideDialog;