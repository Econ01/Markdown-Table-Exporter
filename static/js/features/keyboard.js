// features/keyboard.js - Keyboard Shortcut Handler

import { CommandSystem } from './command-system.js';

// Keyboard Shortcuts
export function handleKeyboardShortcuts(e) {
    // Don't trigger shortcuts when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }
    
    const key = e.key.toLowerCase();
    const ctrl = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;
    const alt = e.altKey;
    
    // Command palette
    if (ctrl && key === 'k') {
        e.preventDefault();
        CommandSystem.showCommandPalette();
        return;
    }
    
    // Find matching command
    const command = CommandSystem.commands.find(cmd => {
        if (!cmd.shortcut) return false;
        
        const shortcut = cmd.shortcut;
        const keyIndex = shortcut.findIndex(k => k.toLowerCase() === key);
        
        if (keyIndex === -1) return false;
        
        // Check modifiers
        const hasCtrl = shortcut.includes('Ctrl');
        const hasShift = shortcut.includes('Shift');
        const hasAlt = shortcut.includes('Alt');
        
        return ctrl === hasCtrl && shift === hasShift && alt === hasAlt;
    });
    
    if (command) {
        e.preventDefault();
        CommandSystem.executeCommand(command);
    }
    
    // Special cases
    switch (key) {
        case 'escape':
            CommandSystem.hideCommandPalette();
            // Also close dialogs
            const dialogContainer = document.getElementById('dialog-container');
            if (dialogContainer && !dialogContainer.classList.contains('hidden')) {
                window.hideDialog?.();
            }
            break;
    }
}

// Setup keyboard event listeners
export function setupKeyboardShortcuts() {
    document.addEventListener('keydown', handleKeyboardShortcuts);
}