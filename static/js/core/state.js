// core/state.js - Application State Management

// Application State
export const AppState = {
    inputFile: null,
    outputFolder: null,
    isConverting: false,
    theme: localStorage.getItem('theme') || 'light',
    isInitialized: false
};

// DOM Elements Cache
export const Elements = {
    // Core elements
    themeToggle: null,
    dropZone: null,
    uploadZone: null,
    sourceBtn: null,
    outputBtn: null,
    convertBtn: null,
    
    // Display elements
    sourceFile: null,
    exportFolder: null,
    statusCard: null,
    resultCard: null,
    loadingOverlay: null,
    snackbarContainer: null,
    
    // Interactive elements
    helpFab: null,
    dialogContainer: null,
    
    // Command system elements
    commandPalette: null,
    commandSearch: null,
    commandResults: null
};

// Initialize DOM Elements
export function initializeElements() {
    const elementMap = {
        themeToggle: 'theme-toggle',
        dropZone: 'drop-zone',
        uploadZone: 'upload-zone',
        sourceBtn: 'source-btn',
        outputBtn: 'output-btn',
        convertBtn: 'convert-btn',
        sourceFile: 'source-file',
        exportFolder: 'export-folder',
        statusCard: 'status-card',
        resultCard: 'result-card',
        loadingOverlay: 'loading-overlay',
        snackbarContainer: 'snackbar-container',
        helpFab: 'help-fab',
        dialogContainer: 'dialog-container',
        commandPalette: 'command-palette',
        commandSearch: 'command-search',
        commandResults: 'command-results'
    };
    
    Object.entries(elementMap).forEach(([key, id]) => {
        Elements[key] = document.getElementById(id);
        if (!Elements[key]) {
            console.warn(`⚠️ Element not found: ${id}`);
        }
    });
    
    // Create snackbar container if missing
    if (!Elements.snackbarContainer) {
        Elements.snackbarContainer = createSnackbarContainer();
    }
}

// Create snackbar container
function createSnackbarContainer() {
    const container = document.createElement('div');
    container.id = 'snackbar-container';
    container.className = 'snackbar-container';
    document.body.appendChild(container);
    return container;
}