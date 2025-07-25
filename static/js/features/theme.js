// features/theme.js - Theme Management

import { AppState, Elements } from '../core/state.js';
import { showSnackbar } from './feedback.js';

// Theme Management
export function toggleTheme() {
    AppState.theme = AppState.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', AppState.theme);
    applyTheme();
    showSnackbar(`Switched to ${AppState.theme} theme`, 'info');
}

export function initializeTheme() {
    applyTheme();
}

function applyTheme() {
    document.body.setAttribute('data-theme', AppState.theme);
    
    if (Elements.themeToggle) {
        const icon = Elements.themeToggle.querySelector('.material-symbols-rounded');
        if (icon) {
            icon.textContent = AppState.theme === 'light' ? 'dark_mode' : 'light_mode';
        }
    }
    
    // Update dynamic background for theme
    updateDynamicBackground();
}

function updateDynamicBackground() {
    const orbs = document.querySelectorAll('.bg-orb');
    orbs.forEach(orb => {
        orb.style.opacity = AppState.theme === 'dark' ? '0.15' : '0.1';
    });
}