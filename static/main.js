// main.js - Main Application Entry Point

// Core imports
import { AppState, Elements, initializeElements } from './js/core/state.js';
import { setupMotionSystem, showWelcomeAnimation } from './js/core/motion.js';

// Feature imports
import { selectSourceFile, selectOutputFolder } from './js/features/file-operations.js';
import { convertTable } from './js/features/conversion.js';
import { toggleTheme, initializeTheme } from './js/features/theme.js';
import { showHelpDialog } from './js/features/feedback.js';
import { setupDragAndDrop } from './js/features/drag-drop.js';
import { updateUI } from './js/features/ui-updates.js';
import { CommandSystem } from './js/features/command-system.js';
import { setupKeyboardShortcuts } from './js/features/keyboard.js';

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎨 Initializing Material 3 Expressive App...');
    
    try {
        initializeElements();
        setupEventListeners();
        setupDragAndDrop();
        initializeTheme();
        setupMotionSystem();
        CommandSystem.init();
        setupKeyboardShortcuts();
        updateUI();
        loadAppInfo();
        
        AppState.isInitialized = true;
        console.log('✅ App initialized successfully');
        
        // Show welcome animation
        showWelcomeAnimation();
        
    } catch (error) {
        console.error('❌ Failed to initialize app:', error);
        // Import showSnackbar dynamically to avoid circular dependency
        import('./js/features/feedback.js').then(({ showSnackbar }) => {
            showSnackbar('Failed to initialize application', 'error');
        });
    }
});

// Setup Event Listeners
function setupEventListeners() {
    // Theme toggle
    if (Elements.themeToggle) {
        Elements.themeToggle.addEventListener('click', toggleTheme);
    }
    
    // File operations
    if (Elements.sourceBtn) {
        Elements.sourceBtn.addEventListener('click', selectSourceFile);
    }
    
    if (Elements.outputBtn) {
        Elements.outputBtn.addEventListener('click', selectOutputFolder);
    }
    
    if (Elements.convertBtn) {
        Elements.convertBtn.addEventListener('click', convertTable);
    }
    
    // Upload zone click
    if (Elements.uploadZone) {
        Elements.uploadZone.addEventListener('click', selectSourceFile);
    }
    
    // Help FAB
    if (Elements.helpFab) {
        Elements.helpFab.addEventListener('click', showHelpDialog);
    }
    
    // Window events
    window.addEventListener('beforeunload', handleBeforeUnload);
}

// Load App Information
async function loadAppInfo() {
    try {
        if (typeof pywebview !== 'undefined' && pywebview.api && pywebview.api.get_app_info) {
            const result = await pywebview.api.get_app_info();
            const info = JSON.parse(result);
            
            console.log('📱 App Info:', info);
            
            // Update any version displays
            document.title = `${info.description || 'Markdown Table Exporter'} v${info.version || '2.0'}`;
        } else {
            console.log('⚠️ pywebview API not available, running in browser mode');
        }
    } catch (error) {
        console.warn('⚠️ Could not load app info:', error);
    }
}

// Before unload handler
function handleBeforeUnload(e) {
    if (AppState.isConverting) {
        e.preventDefault();
        e.returnValue = 'Conversion in progress. Are you sure you want to leave?';
        return e.returnValue;
    }
}

// Global Error Handler
window.addEventListener('error', (e) => {
    console.error('❌ Global error:', e.error);
    // Import showSnackbar dynamically
    import('./js/features/feedback.js').then(({ showSnackbar }) => {
        showSnackbar('An unexpected error occurred', 'error');
    });
});

// Export functions for global access (needed for HTML onclick handlers)
window.AppFunctions = {
    selectSourceFile,
    selectOutputFolder,
    convertTable,
    toggleTheme,
    showHelpDialog,
    
    // Command system functions
    showCommandPalette: () => CommandSystem.showCommandPalette()
};

console.log('🎨 Material 3 Expressive App ready!');