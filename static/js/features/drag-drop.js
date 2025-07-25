// features/drag-drop.js - Drag and Drop Functionality

import { AppState, Elements } from '../core/state.js';
import { showLoading, hideLoading } from './loading.js';
import { showSnackbar } from './feedback.js';
import { updateFilePreview, clearFilePreview } from './file-operations.js';
import { updateUploadZoneState, updateStatus, updateUI } from './ui-updates.js';

// Drag and Drop Setup
export function setupDragAndDrop() {
    if (!Elements.dropZone) return;
    
    const preventDefaults = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    
    const handleDragEnter = (e) => {
        if (AppState.isConverting) return;
        updateUploadZoneState('drag-over');
    };
    
    const handleDragLeave = (e) => {
        updateUploadZoneState(AppState.inputFile ? 'has-file' : 'default');
    };
    
    const handleDrop = async (e) => {
        if (AppState.isConverting) return;
        
        const files = Array.from(e.dataTransfer.files);
        const file = files[0];
        
        if (!file) {
            updateUploadZoneState(AppState.inputFile ? 'has-file' : 'default');
            return;
        }
        
        if (!file.name.toLowerCase().endsWith('.md')) {
            updateUploadZoneState('default');
            showSnackbar('Please select a .md (Markdown) file', 'error');
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
            } else {
                updateUploadZoneState('default');
                showSnackbar(response.message, 'error');
                AppState.inputFile = null;
                clearFilePreview();
                updateUI();
            }
        } catch (error) {
            hideLoading();
            updateUploadZoneState('default');
            console.error('❌ Error handling dropped file:', error);
            showSnackbar('Error loading file: ' + error.message, 'error');
        }
    };
    
    // Add event listeners
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        Elements.dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        Elements.dropZone.addEventListener(eventName, handleDragEnter, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        Elements.dropZone.addEventListener(eventName, handleDragLeave, false);
    });
    
    Elements.dropZone.addEventListener('drop', handleDrop, false);
}