// features/loading.js - Loading State Management

import { Elements } from '../core/state.js';

// Loading Management
export function showLoading(message = 'Processing...') {
    if (!Elements.loadingOverlay) return;
    
    const loadingMessage = Elements.loadingOverlay.querySelector('#loading-message');
    if (loadingMessage) {
        loadingMessage.textContent = message;
    }
    
    Elements.loadingOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

export function hideLoading() {
    if (!Elements.loadingOverlay) return;
    
    Elements.loadingOverlay.classList.add('hidden');
    document.body.style.overflow = '';
}