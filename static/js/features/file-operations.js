// features/file-operations.js - File Selection and Processing

import { AppState, Elements } from '../core/state.js';
import { showLoading, hideLoading } from './loading.js';
import { showSnackbar } from './feedback.js';
import { animateElementIn } from '../core/motion.js';
import { updateUI, updateStatus, updateUploadZoneState } from './ui-updates.js';

// File Selection Functions
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
    addButtonLoading(Elements.sourceBtn);
    
    try {
        const result = await pywebview.api.select_input_file();
        const response = JSON.parse(result);
        
        hideLoading();
        removeButtonLoading(Elements.sourceBtn);
        
        if (response.status === 'success') {
            AppState.inputFile = response.path;
            await updateFilePreview(response.path);
            updateUploadZoneState('has-file');
            updateStatus('File loaded successfully', 'success', 'check_circle');
            showSnackbar('File selected successfully!', 'success');
            updateUI();
            
            // Animate file preview appearance
            if (Elements.sourceFile && !Elements.sourceFile.classList.contains('hidden')) {
                animateElementIn(Elements.sourceFile);
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
        removeButtonLoading(Elements.sourceBtn);
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
    addButtonLoading(Elements.outputBtn);
    
    try {
        const result = await pywebview.api.select_output_folder();
        const response = JSON.parse(result);
        
        hideLoading();
        removeButtonLoading(Elements.outputBtn);
        
        if (response.status === 'success') {
            AppState.outputFolder = response.path;
            updateLocationInfo(response.path);
            showSnackbar('Output folder selected', 'success');
        } else if (response.status === 'error') {
            showSnackbar(response.message, 'error');
        } else {
            updateStatus('Folder selection cancelled', 'info', 'info');
        }
        
        updateUI();
    } catch (error) {
        hideLoading();
        removeButtonLoading(Elements.outputBtn);
        console.error('❌ Error selecting folder:', error);
        showSnackbar('Error selecting folder: ' + error.message, 'error');
    }
}

// File Preview Functions
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
                <div class="file-icon-large">
                    <span class="material-symbols-rounded">description</span>
                </div>
                <div class="file-details">
                    <h5 class="file-name title-medium">${fileInfo.name}</h5>
                    <div class="file-stats">
                        <div class="file-stat">
                            <span class="material-symbols-rounded">storage</span>
                            <span>${fileInfo.size_formatted}</span>
                        </div>
                        <div class="file-stat">
                            <span class="material-symbols-rounded">format_list_numbered</span>
                            <span>${fileInfo.total_lines} lines</span>
                        </div>
                        <div class="file-stat">
                            <span class="material-symbols-rounded">table_chart</span>
                            <span>${fileInfo.table_rows} rows</span>
                        </div>
                    </div>
                    <div class="file-path">
                        <span class="material-symbols-rounded">folder</span>
                        <span>${fileInfo.path}</span>
                    </div>
                </div>
            </div>
        `;
        
        if (Elements.sourceFile) {
            Elements.sourceFile.innerHTML = previewHTML;
            Elements.sourceFile.classList.remove('hidden');
            Elements.sourceFile.classList.add('success');
        }
        
    } catch (error) {
        console.error('❌ Error updating file preview:', error);
        clearFilePreview();
    }
}

export function clearFilePreview() {
    if (Elements.sourceFile) {
        Elements.sourceFile.innerHTML = '';
        Elements.sourceFile.classList.add('hidden');
        Elements.sourceFile.classList.remove('success');
    }
}

function updateLocationInfo(path) {
    if (Elements.exportFolder) {
        Elements.exportFolder.innerHTML = `
            <span class="material-symbols-rounded info-icon">check_circle</span>
            <span class="info-text">Selected: ${path}</span>
        `;
        Elements.exportFolder.classList.add('updated');
        
        // Remove updated class after animation
        setTimeout(() => {
            Elements.exportFolder.classList.remove('updated');
        }, 300);
    }
}

// Button Loading States
export function addButtonLoading(button) {
    if (!button) return;
    
    const originalContent = button.innerHTML;
    button.dataset.originalContent = originalContent;
    
    button.innerHTML = `
        <div class="loading-spinner" style="width: 20px; height: 20px;"></div>
        <span class="button-text">Loading...</span>
        <div class="button-state-layer"></div>
    `;
    button.disabled = true;
}

export function removeButtonLoading(button) {
    if (!button || !button.dataset.originalContent) return;
    
    button.innerHTML = button.dataset.originalContent;
    button.disabled = AppState.isConverting;
    delete button.dataset.originalContent;
}