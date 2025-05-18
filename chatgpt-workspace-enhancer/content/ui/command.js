/**
 * Command palette component for ChatGPT Workspace Enhancer
 * Implements a keyboard-accessible command interface
 */

class CommandPalette {
  constructor() {
    this.isOpen = false;
    this.commands = [];
    this.filteredCommands = [];
    this.selectedIndex = 0;
    this.paletteElement = null;
    this.initialized = false;
  }

  /**
   * Initialize the command palette
   */
  initialize() {
    if (this.initialized) return;
    
    // Register commands
    this.registerDefaultCommands();
    
    // Create palette element
    this.createPaletteElement();
    
    // Set up keyboard shortcuts
    this.setupKeyboardShortcuts();
    
    this.initialized = true;
    console.log('Command palette initialized');
  }

  /**
   * Register default commands
   */
  registerDefaultCommands() {
    this.commands = [
      {
        id: 'new-chat',
        name: 'New Chat',
        description: 'Start a new chat',
        category: 'Chat',
        action: () => this.executeCommand('new-chat')
      },
      {
        id: 'new-folder',
        name: 'New Folder',
        description: 'Create a new folder',
        category: 'Organization',
        action: () => this.executeCommand('new-folder')
      },
      {
        id: 'toggle-theme',
        name: 'Toggle Theme',
        description: 'Switch between light and dark theme',
        category: 'Appearance',
        action: () => this.executeCommand('toggle-theme')
      },
      {
        id: 'export-chat',
        name: 'Export Current Chat',
        description: 'Export the current chat to PDF',
        category: 'Export',
        action: () => this.executeCommand('export-chat')
      },
      {
        id: 'open-settings',
        name: 'Open Settings',
        description: 'Open extension settings',
        category: 'Settings',
        action: () => this.executeCommand('open-settings')
      }
    ];
  }

  /**
   * Create the command palette element
   */
  createPaletteElement() {
    // Create the modal container
    this.paletteElement = DOMUtils.createElement('div', {
      id: 'chatgpt-enhancer-command-palette',
      style: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'none',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: '100px',
        zIndex: '9999'
      },
      onclick: (e) => {
        if (e.target === this.paletteElement) {
          this.close();
        }
      }
    });
    
    // Create the palette container
    const paletteContainer = DOMUtils.createElement('div', {
      style: {
        width: '500px',
        maxWidth: '90%',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden'
      }
    });
    
    // Create the search input
    const searchInput = DOMUtils.createElement('input', {
      id: 'chatgpt-enhancer-command-input',
      placeholder: 'Type a command or search...',
      style: {
        width: '100%',
        padding: '16px',
        fontSize: '16px',
        border: 'none',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        outline: 'none'
      },
      oninput: (e) => this.filterCommands(e.target.value),
      onkeydown: (e) => this.handleKeyDown(e)
    });
    
    // Create the results container
    const resultsContainer = DOMUtils.createElement('div', {
      id: 'chatgpt-enhancer-command-results',
      style: {
        maxHeight: '300px',
        overflowY: 'auto'
      }
    });
    
    // Add elements to the DOM
    paletteContainer.appendChild(searchInput);
    paletteContainer.appendChild(resultsContainer);
    this.paletteElement.appendChild(paletteContainer);
    document.body.appendChild(this.paletteElement);
    
    // Add dark mode styles
    this.addDarkModeStyles();
  }

  /**
   * Add dark mode styles
   */
  addDarkModeStyles() {
    const css = `
      .dark #chatgpt-enhancer-command-palette {
        background-color: rgba(0, 0, 0, 0.7);
      }
      
      .dark #chatgpt-enhancer-command-input {
        background-color: #2a2a2a;
        color: #ffffff;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .dark #chatgpt-enhancer-command-results {
        background-color: #2a2a2a;
      }
      
      .dark .chatgpt-enhancer-command-item {
        color: #ffffff;
      }
      
      .dark .chatgpt-enhancer-command-item:hover,
      .dark .chatgpt-enhancer-command-item.selected {
        background-color: rgba(255, 255, 255, 0.1);
      }
      
      .dark .chatgpt-enhancer-command-category {
        color: rgba(255, 255, 255, 0.5);
      }
      
      .dark .chatgpt-enhancer-command-description {
        color: rgba(255, 255, 255, 0.7);
      }
    `;
    
    DOMUtils.addStyles(css, 'chatgpt-enhancer-command-palette-dark');
  }

  /**
   * Set up keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K to open command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.toggle();
      }
      
      // Escape to close
      if (e.key === 'Escape' && this.isOpen) {
        e.preventDefault();
        this.close();
      }
    });
  }

  /**
   * Toggle the command palette
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Open the command palette
   */
  open() {
    if (this.isOpen) return;
    
    this.isOpen = true;
    this.paletteElement.style.display = 'flex';
    
    // Reset and focus the input
    const input = document.getElementById('chatgpt-enhancer-command-input');
    input.value = '';
    input.focus();
    
    // Show all commands
    this.filterCommands('');
  }

  /**
   * Close the command palette
   */
  close() {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    this.paletteElement.style.display = 'none';
  }

  /**
   * Filter commands based on search query
   * @param {string} query - Search query
   */
  filterCommands(query) {
    query = query.toLowerCase().trim();
    
    if (!query) {
      // Show all commands
      this.filteredCommands = [...this.commands];
    } else {
      // Filter commands
      this.filteredCommands = this.commands.filter(command => {
        return command.name.toLowerCase().includes(query) || 
               command.description.toLowerCase().includes(query) ||
               command.category.toLowerCase().includes(query);
      });
    }
    
    // Reset selection
    this.selectedIndex = 0;
    
    // Update the UI
    this.renderResults();
  }

  /**
   * Render filtered commands
   */
  renderResults() {
    const resultsContainer = document.getElementById('chatgpt-enhancer-command-results');
    resultsContainer.innerHTML = '';
    
    if (this.filteredCommands.length === 0) {
      // Show no results message
      const noResults = DOMUtils.createElement('div', {
        style: {
          padding: '16px',
          textAlign: 'center',
          color: 'rgba(0, 0, 0, 0.5)'
        }
      }, 'No commands found');
      
      resultsContainer.appendChild(noResults);
      return;
    }
    
    // Group commands by category
    const groupedCommands = this.groupByCategory(this.filteredCommands);
    
    // Render each category
    Object.entries(groupedCommands).forEach(([category, commands]) => {
      // Add category header
      const categoryHeader = DOMUtils.createElement('div', {
        class: 'chatgpt-enhancer-command-category',
        style: {
          padding: '8px 16px',
          fontSize: '12px',
          fontWeight: 'bold',
          color: 'rgba(0, 0, 0, 0.5)',
          textTransform: 'uppercase'
        }
      }, category);
      
      resultsContainer.appendChild(categoryHeader);
      
      // Add commands
      commands.forEach((command, index) => {
        const isSelected = this.filteredCommands.indexOf(command) === this.selectedIndex;
        
        const commandItem = DOMUtils.createElement('div', {
          class: `chatgpt-enhancer-command-item ${isSelected ? 'selected' : ''}`,
          style: {
            padding: '12px 16px',
            cursor: 'pointer',
            backgroundColor: isSelected ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
            transition: 'background-color 0.2s'
          },
          onclick: () => {
            this.selectCommand(this.filteredCommands.indexOf(command));
            this.executeSelectedCommand();
          }
        });
        
        // Command name
        const commandName = DOMUtils.createElement('div', {
          style: {
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '4px'
          }
        }, command.name);
        
        // Command description
        const commandDescription = DOMUtils.createElement('div', {
          class: 'chatgpt-enhancer-command-description',
          style: {
            fontSize: '12px',
            color: 'rgba(0, 0, 0, 0.7)'
          }
        }, command.description);
        
        commandItem.appendChild(commandName);
        commandItem.appendChild(commandDescription);
        resultsContainer.appendChild(commandItem);
      });
    });
  }

  /**
   * Group commands by category
   * @param {Array} commands - Commands to group
   * @returns {Object} Grouped commands
   */
  groupByCategory(commands) {
    return commands.reduce((groups, command) => {
      const category = command.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(command);
      return groups;
    }, {});
  }

  /**
   * Handle keyboard navigation
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeyDown(e) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.selectNextCommand();
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        this.selectPreviousCommand();
        break;
        
      case 'Enter':
        e.preventDefault();
        this.executeSelectedCommand();
        break;
    }
  }

  /**
   * Select the next command
   */
  selectNextCommand() {
    if (this.filteredCommands.length === 0) return;
    
    this.selectedIndex = (this.selectedIndex + 1) % this.filteredCommands.length;
    this.renderResults();
    this.scrollToSelected();
  }

  /**
   * Select the previous command
   */
  selectPreviousCommand() {
    if (this.filteredCommands.length === 0) return;
    
    this.selectedIndex = (this.selectedIndex - 1 + this.filteredCommands.length) % this.filteredCommands.length;
    this.renderResults();
    this.scrollToSelected();
  }

  /**
   * Scroll to the selected command
   */
  scrollToSelected() {
    const resultsContainer = document.getElementById('chatgpt-enhancer-command-results');
    const selectedElement = resultsContainer.querySelector('.chatgpt-enhancer-command-item.selected');
    
    if (selectedElement) {
      DOMUtils.scrollIntoViewIfNeeded(selectedElement);
    }
  }

  /**
   * Select a specific command by index
   * @param {number} index - Command index
   */
  selectCommand(index) {
    if (index >= 0 && index < this.filteredCommands.length) {
      this.selectedIndex = index;
      this.renderResults();
    }
  }

  /**
   * Execute the selected command
   */
  executeSelectedCommand() {
    if (this.filteredCommands.length === 0) return;
    
    const selectedCommand = this.filteredCommands[this.selectedIndex];
    this.close();
    
    // Execute with a small delay to allow the UI to update
    setTimeout(() => {
      selectedCommand.action();
    }, 100);
  }

  /**
   * Execute a command by ID
   * @param {string} commandId - Command ID
   */
  executeCommand(commandId) {
    console.log(`Executing command: ${commandId}`);
    
    switch (commandId) {
      case 'new-chat':
        // Find and click the "New chat" button
        const newChatButton = document.querySelector('nav a[href="/"]');
        if (newChatButton) {
          newChatButton.click();
        }
        break;
        
      case 'new-folder':
        // Call the sidebar's createNewFolder method
        if (window.enhancedSidebar) {
          window.enhancedSidebar.createNewFolder();
        }
        break;
        
      case 'toggle-theme':
        document.documentElement.classList.toggle('dark');
        break;

      case 'export-chat':
        if (window.exportManager) {
          window.exportManager.exportChatAsPdf();
        }
        break;

      case 'open-settings':
        chrome.runtime.openOptionsPage();
        break;
        
      default:
        console.warn(`Unknown command: ${commandId}`);
    }
  }
}

// Export
window.CommandPalette = CommandPalette;
