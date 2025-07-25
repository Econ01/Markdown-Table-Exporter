// features/file-operations.js - Enhanced File Selection with Spring Animations

import { AppState, Elements } from '../core/state.js';
import { showLoading, hideLoading } from './loading.js';
import { showSnackbar } from './feedback.js';
import { animateElementIn, addSuccessAnimation, celebrateFileDrop } from '../core/motion.js';
import { SpringUtils } from '../core/spring-physics.js';
import { updateUI, updateStatus, updateUploadZoneState } from './ui-updates.js';

// File Selection Functions with Enhanced Animations
export async function selectSourceFile() {
    if (AppState.isConverting) {
        showSnackbar('Please wait for current operation to complete', 'warning');
        return;
    }
    
    // Check if pywebview is available
    if (typeof pywebview === 'undefined' || !pywebview.api || !pywebview.api.select_input_file) {
        showSnackbar('File selection not available in browser mode', 'error');
        return;
    }
    
    showLoading('Opening file dialog...');
    addButtonSpringLoading(Elements.sourceBtn);
    
    try {
        const result = await pywebview.api.select_input_file();
        const response = JSON.parse(result);
        
        hideLoading();
        removeButtonSpringLoading(Elements.sourceBtn);
        
        if (response.status === 'success') {
            AppState.inputFile = response.path;
            await updateFilePreview(response.path);
            updateUploadZoneState('has-file');
            updateStatus('File loaded successfully', 'success', 'check_circle');
            showSnackbar('File selected successfully!', 'success');
            updateUI();
            
            // Enhanced spring animations for file selection
            if (Elements.sourceFile && !Elements.sourceFile.classList.contains('hidden')) {
                // Animate file preview appearance with spring
                SpringUtils.springTo(Elements.sourceFile, {
                    opacity: '1',
                    transform: 'translateY(0) scale(1)'
                }, 'gentle');
                
                // Add success animation to upload zone
                celebrateFileDrop(Elements.uploadZone);
            }
            
        } else if (response.status === 'error') {
            updateStatus('File selection failed', 'error', 'error');
            showSnackbar(response.message, 'error');
            AppState.inputFile = null;
            clearFilePreview();
            updateUploadZoneState('default');
            updateUI();
        } else {
            // Cancelled
            updateStatus('File selection cancelled', 'info', 'info');
        }
    } catch (error) {
        hideLoading();
        removeButtonSpringLoading(Elements.sourceBtn);
        console.error('❌ Error selecting file:', error);
        showSnackbar('Error selecting file: ' + error.message, 'error');
        AppState.inputFile = null;
        updateUI();
    }
}

export async function selectOutputFolder() {
    if (AppState.isConverting) {
        showSnackbar('Please wait for current operation to complete', 'warning');
        return;
    }
    
    // Check if pywebview is available
    if (typeof pywebview === 'undefined' || !pywebview.api || !pywebview.api.select_output_folder) {
        showSnackbar('Folder selection not available in browser mode', 'error');
        return;
    }
    
    showLoading('Opening folder dialog...');
    addButtonSpringLoading(Elements.outputBtn);
    
    try {
        const result = await pywebview.api.select_output_folder();
        const response = JSON.parse(result);
        
        hideLoading();
        removeButtonSpringLoading(Elements.outputBtn);
        
        if (response.status === 'success') {
            AppState.outputFolder = response.path;
            updateLocationInfo(response.path);
            showSnackbar('Output folder selected', 'success');
            
            // Add spring animation to location info update
            if (Elements.exportFolder) {
                SpringUtils.springTo(Elements.exportFolder, {
                    transform: 'scale(1.02)'
                }, 'quick', () => {
                    SpringUtils.springTo(Elements.exportFolder, {
                        transform: 'scale(1)'
                    }, 'bouncy');
                });
            }
            
        } else if (response.status === 'error') {
            showSnackbar(response.message, 'error');
        } else {
            updateStatus('Folder selection cancelled', 'info', 'info');
        }
        
        updateUI();
    } catch (error) {
        hideLoading();
        removeButtonSpringLoading(Elements.outputBtn);
        console.error('❌ Error selecting folder:', error);
        showSnackbar('Error selecting folder: ' + error.message, 'error');
    }
}

// Enhanced File Preview Functions with Spring Animations
export async function updateFilePreview(filePath) {
    try {
        // Check if pywebview is available
        if (typeof pywebview === 'undefined' || !pywebview.api || !pywebview.api.get_file_info) {
            console.warn('⚠️ File info not available in browser mode');
            return;
        }
        
        const result = await pywebview.api.get_file_info(filePath);
        const fileInfo = JSON.parse(result);
        
        if (fileInfo.error) {
            clearFilePreview();
            return;
        }
        
        const previewHTML = `
            <div class="file-preview-content">
                <div class="file-icon-large spring-interactive">
                    <span class="material-symbols-rounded">description</span>
                </div>
                <div class="file-details">
                    <h5 class="file-name title-medium">${fileInfo.name}</h5>
                    <div class="file-stats">
                        <div class="file-stat spring-react-to-sibling">
                            <span class="material-symbols-rounded">storage</span>
                            <span>${fileInfo.size_formatted}</span>
                        </div>
                        <div class="file-stat spring-react-to-sibling">
                            <span class="material-symbols-rounded">format_list_numbered</span>
                            <span>${fileInfo.total_lines} lines</span>
                        </div>
                        <div class="file-stat spring-react-to-sibling">
                            <span class="material-symbols-rounded">table_chart</span>
                            <span>${fileInfo.table_rows} rows</span>
                        </div>
                    </div>
                    <div class="file-path spring-react-to-sibling">
                        <span class="material-symbols-rounded">folder</span>
                        <span>${fileInfo.path}</span>
                    </div>
                </div>
            </div>
        `;
        
        if (Elements.sourceFile) {
            // Initial hidden state for animation
            Elements.sourceFile.style.opacity = '0';
            Elements.sourceFile.style.transform = 'translateY(20px) scale(0.95)';
            
            Elements.sourceFile.innerHTML = previewHTML;
            Elements.sourceFile.classList.remove('hidden');
            Elements.sourceFile.classList.add('success');
            
            // Enhanced spring entrance animation
            animateElementIn(Elements.sourceFile, 'gentle');
            
            // Add interactive spring behaviors to file stats
            const fileStats = Elements.sourceFile.querySelectorAll('.file-stat');
            fileStats.forEach((stat, index) => {
                stat.style.setProperty('--stagger-index', index);
                stat.classList.add('spring-interactive');
                
                // Add hover spring effect
                stat.addEventListener('mouseenter', () => {
                    if (SpringUtils.prefersReducedMotion()) return;
                    
                    SpringUtils.springTo(stat, {
                        transform: 'translateX(4px)'
                    }, 'snappy');
                });
                
                stat.addEventListener('mouseleave', () => {
                    if (SpringUtils.prefersReducedMotion()) return;
                    
                    SpringUtils.springTo(stat, {
                        transform: 'translateX(0)'
                    }, 'smooth');
                });
            });
        }
        
    } catch (error) {
        console.error('❌ Error updating file preview:', error);
        clearFilePreview();
    }
}

export function clearFilePreview() {
    if (Elements.sourceFile) {
        // Spring exit animation before clearing
        if (!SpringUtils.prefersReducedMotion()) {
            SpringUtils.springTo(Elements.sourceFile, {
                opacity: '0',
                transform: 'translateY(-20px) scale(0.95)'
            }, 'quick', () => {
                Elements.sourceFile.innerHTML = '';
                Elements.sourceFile.classList.add('hidden');
                Elements.sourceFile.classList.remove('success');
                // Reset styles
                Elements.sourceFile.style.opacity = '';
                Elements.sourceFile.style.transform = '';
            });
        } else {
            Elements.sourceFile.innerHTML = '';
            Elements.sourceFile.classList.add('hidden');
            Elements.sourceFile.classList.remove('success');
        }
    }
}

function updateLocationInfo(path) {
    if (Elements.exportFolder) {
        Elements.exportFolder.innerHTML = `
            <span class="material-symbols-rounded info-icon spring-interactive">check_circle</span>
            <span class="info-text">${path}</span>
        `;
        Elements.exportFolder.classList.add('updated');
        
        // Enhanced spring update animation
        if (!SpringUtils.prefersReducedMotion()) {
            SpringUtils.springTo(Elements.exportFolder, {
                background: 'var(--md-sys-color-success-container)',
                color: 'var(--md-sys-color-on-success-container)'
            }, 'quick', () => {
                // Fade back to normal colors
                setTimeout(() => {
                    SpringUtils.springTo(Elements.exportFolder, {
                        background: 'var(--md-sys-color-surface-container-low)',
                        color: 'var(--md-sys-color-on-surface-variant)'
                    }, 'smooth');
                }, 1000);
            });
        }
        
        // Remove updated class after animation
        setTimeout(() => {
            Elements.exportFolder.classList.remove('updated');
        }, 300);
    }
}

// Enhanced Button Loading States with Spring Physics
export function addButtonSpringLoading(button) {
    if (!button) return;
    
    const originalContent = button.innerHTML;
    button.dataset.originalContent = originalContent;
    
    // Spring scale down effect
    if (!SpringUtils.prefersReducedMotion()) {
        SpringUtils.springTo(button, {
            transform: 'scale(0.98)'
        }, 'quick', () => {
            // Update content after scale animation
            button.innerHTML = `
                <div class="loading-spinner spring-pulse" style="width: 20px; height: 20px;"></div>
                <span class="button-text">Loading...</span>
                <div class="button-state-layer"></div>
            `;
            
            // Scale back up with new content
            SpringUtils.springTo(button, {
                transform: 'scale(1)'
            }, 'bouncy');
        });
    } else {
        button.innerHTML = `
            <div class="loading-spinner" style="width: 20px; height: 20px;"></div>
            <span class="button-text">Loading...</span>
            <div class="button-state-layer"></div>
        `;
    }
    
    button.disabled = true;
}

export function removeButtonSpringLoading(button) {
    if (!button || !button.dataset.originalContent) return;
    
    // Spring scale effect for content restoration
    if (!SpringUtils.prefersReducedMotion()) {
        SpringUtils.springTo(button, {
            transform: 'scale(0.98)'
        }, 'quick', () => {
            // Restore original content
            button.innerHTML = button.dataset.originalContent;
            button.disabled = AppState.isConverting;
            delete button.dataset.originalContent;
            
            // Scale back up with restored content
            SpringUtils.springTo(button, {
                transform: 'scale(1)'
            }, 'bouncy');
        });
    } else {
        button.innerHTML = button.dataset.originalContent;
        button.disabled = AppState.isConverting;
        delete button.dataset.originalContent;
    }
}