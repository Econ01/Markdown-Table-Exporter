// features/command-system.js - Simplified Command System

import { Elements } from '../core/state.js';
import { selectSourceFile, selectOutputFolder } from './file-operations.js';
import { convertTable } from './conversion.js';
import { toggleTheme } from './theme.js';
import { showHelpDialog } from './feedback.js';
import { showSnackbar } from './feedback.js';

// Command System
export const CommandSystem = {
    commands: [],
    selectedIndex: 0,
    isOpen: false,
    
    // Initialize command system
    init() {
        this.registerCommands();
        this.setupCommandPalette();
    },
    
    // Register all available commands
    registerCommands() {
        this.commands = [
            // File Operations
            {
                id: 'select-file',
                title: 'Select Markdown File',
                description: 'Choose a .md file to convert',
                icon: 'description',
                category: 'File',
                shortcut: ['Ctrl', 'O'],
                action: selectSourceFile
            },
            {
                id: 'select-output',
                title: 'Select Output Folder', 
                description: 'Choose where to save the HTML file',
                icon: 'folder',
                category: 'File',
                shortcut: ['Ctrl', 'Shift', 'O'],
                action: selectOutputFolder
            },
            {
                id: 'convert',
                title: 'Convert to HTML',
                description: 'Transform markdown table to HTML',
                icon: 'auto_fix_high',
                category: 'Action',
                shortcut: ['Ctrl', 'Enter'],
                action: convertTable
            },
            
            // View Operations
            {
                id: 'toggle-theme',
                title: 'Toggle Theme',
                description: 'Switch between light and dark mode',
                icon: 'palette',
                category: 'View',
                shortcut: ['Ctrl', 'T'],
                action: toggleTheme
            },
            {
                id: 'show-help',
                title: 'Show Help',
                description: 'Display usage instructions',
                icon: 'help',
                category: 'Help',
                shortcut: ['F1'],
                action: showHelpDialog
            }
        ];
    },
    
    // Setup command palette
    setupCommandPalette() {
        if (!Elements.commandSearch) return;
        
        Elements.commandSearch.addEventListener('input', (e) => {
            this.filterCommands(e.target.value);
        });
        
        Elements.commandSearch.addEventListener('keydown', (e) => {
            this.handleCommandNavigation(e);
        });
        
        // Close on backdrop click
        if (Elements.commandPalette) {
            Elements.commandPalette.addEventListener('click', (e) => {
                if (e.target.classList.contains('command-palette-backdrop')) {
                    this.hideCommandPalette();
                }
            });
        }
    },
    
    // Show command palette
    showCommandPalette() {
        if (!Elements.commandPalette || this.isOpen) return;
        
        this.isOpen = true;
        this.selectedIndex = 0;
        Elements.commandPalette.classList.remove('hidden');
        Elements.commandSearch.focus();
        Elements.commandSearch.value = '';
        document.body.style.overflow = 'hidden';
        
        this.renderCommands(this.commands);
    },
    
    // Hide command palette
    hideCommandPalette() {
        if (!Elements.commandPalette || !this.isOpen) return;
        
        this.isOpen = false;
        Elements.commandPalette.classList.add('hidden');
        document.body.style.overflow = '';
        Elements.commandSearch.blur();
    },
    
    // Filter commands based on search
    filterCommands(query) {
        if (!query.trim()) {
            this.renderCommands(this.commands);
            return;
        }
        
        const filtered = this.commands.filter(cmd => {
            const searchText = `${cmd.title} ${cmd.description} ${cmd.category}`.toLowerCase();
            return searchText.includes(query.toLowerCase());
        });
        
        this.selectedIndex = 0;
        this.renderCommands(filtered);
    },
    
    // Render commands in palette
    renderCommands(commands) {
        if (!Elements.commandResults) return;
        
        if (commands.length === 0) {
            Elements.commandResults.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: var(--md-sys-color-on-surface-variant);">
                    <span class="material-symbols-rounded" style="font-size: 48px; opacity: 0.5;">search_off</span>
                    <p>No commands found</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        let currentCategory = '';
        
        commands.forEach((cmd, index) => {
            if (cmd.category !== currentCategory) {
                if (currentCategory) html += '</div>';
                html += `<div class="command-category">${cmd.category}</div>`;
                currentCategory = cmd.category;
            }
            
            const isSelected = index === this.selectedIndex;
            const shortcutHTML = cmd.shortcut ? 
                `<div class="command-shortcut">
                    ${cmd.shortcut.map(key => `<kbd>${key}</kbd>`).join('')}
                </div>` : '';
            
            html += `
                <div class="command-result ${isSelected ? 'selected' : ''}" data-index="${index}">
                    <div class="command-icon">
                        <span class="material-symbols-rounded">${cmd.icon}</span>
                    </div>
                    <div class="command-info">
                        <div class="command-title">${cmd.title}</div>
                        <div class="command-description">${cmd.description}</div>
                    </div>
                    ${shortcutHTML}
                </div>
            `;
        });
        
        Elements.commandResults.innerHTML = html;
        
        // Add click listeners
        Elements.commandResults.querySelectorAll('.command-result').forEach((el, index) => {
            el.addEventListener('click', () => {
                this.executeCommand(commands[index]);
            });
        });
    },
    
    // Handle keyboard navigation
    handleCommandNavigation(e) {
        const results = Elements.commandResults.querySelectorAll('.command-result');
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, results.length - 1);
                this.updateSelection();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
                this.updateSelection();
                break;
            case 'Enter':
                e.preventDefault();
                const selectedCmd = this.getFilteredCommands()[this.selectedIndex];
                if (selectedCmd) {
                    this.executeCommand(selectedCmd);
                }
                break;
            case 'Escape':
                e.preventDefault();
                this.hideCommandPalette();
                break;
        }
    },
    
    // Update visual selection
    updateSelection() {
        const results = Elements.commandResults.querySelectorAll('.command-result');
        results.forEach((el, index) => {
            el.classList.toggle('selected', index === this.selectedIndex);
        });
        
        // Scroll into view
        if (results[this.selectedIndex]) {
            results[this.selectedIndex].scrollIntoView({
                block: 'nearest',
                behavior: 'smooth'
            });
        }
    },
    
    // Get currently filtered commands
    getFilteredCommands() {
        const query = Elements.commandSearch?.value || '';
        if (!query.trim()) return this.commands;
        
        return this.commands.filter(cmd => {
            const searchText = `${cmd.title} ${cmd.description} ${cmd.category}`.toLowerCase();
            return searchText.includes(query.toLowerCase());
        });
    },
    
    // Execute a command
    executeCommand(command) {
        this.hideCommandPalette();
        
        try {
            if (command.action) {
                command.action();
                showSnackbar(`Executed: ${command.title}`, 'success', 2000);
            }
        } catch (error) {
            console.error('Command execution failed:', error);
            showSnackbar(`Failed to execute: ${command.title}`, 'error');
        }
    }
};