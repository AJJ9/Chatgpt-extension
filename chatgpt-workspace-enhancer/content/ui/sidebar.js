/**
 * Enhanced sidebar component for ChatGPT Workspace Enhancer
 * Implements folder organization, pinned chats, and navigation features
 */

class EnhancedSidebar {
  constructor() {
    this.sidebarElement = null;
    this.folders = [];
    this.pinnedChats = [];
    this.initialized = false;
  }

  /**
   * Initialize the enhanced sidebar
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Find the original sidebar
      const sidebar = await this.findSidebar();
      if (!sidebar) {
        console.error('ChatGPT sidebar not found');
        return;
      }
      
      this.sidebarElement = sidebar;
      
      // Load data
      await this.loadData();
      
      // Enhance the sidebar
      this.enhanceSidebar();
      
      // Set up observers
      this.setupObservers();
      
      this.initialized = true;
      console.log('Enhanced sidebar initialized');
    } catch (error) {
      console.error('Error initializing enhanced sidebar:', error);
    }
  }

  /**
   * Find the ChatGPT sidebar element
   * @returns {Promise<HTMLElement>} Sidebar element
   */
  async findSidebar() {
    // Wait for the sidebar to be available in the DOM
    return DOMUtils.waitForElement('nav.flex');
  }

  /**
   * Load folders and pinned chats data
   */
  async loadData() {
    try {
      // Load folders from storage
      const folders = await storageManager.getAll('folders');
      this.folders = folders.sort((a, b) => a.order - b.order);
      
      // Load pinned chats from storage
      const { metadata } = await storageManager.getSettings();
      this.pinnedChats = metadata.pinnedChats || [];
      
      console.log('Sidebar data loaded:', { folders: this.folders.length, pinnedChats: this.pinnedChats.length });
    } catch (error) {
      console.error('Error loading sidebar data:', error);
      this.folders = [];
      this.pinnedChats = [];
    }
  }

  /**
   * Enhance the sidebar with folders and organization features
   */
  enhanceSidebar() {
    // Add custom styles
    this.addStyles();
    
    // Add folder section
    this.addFolderSection();
    
    // Add pinned chats section
    this.addPinnedChatsSection();
    
    // Add search bar
    this.addSearchBar();
  }

  /**
   * Add custom styles for the enhanced sidebar
   */
  addStyles() {
    const css = `
      .chatgpt-enhancer-section {
        margin-bottom: 10px;
        padding: 8px;
        border-radius: 8px;
      }
      
      .chatgpt-enhancer-section-title {
        font-size: 12px;
        font-weight: bold;
        margin-bottom: 8px;
        padding-left: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .chatgpt-enhancer-folder {
        display: flex;
        align-items: center;
        padding: 8px;
        border-radius: 6px;
        cursor: pointer;
        margin-bottom: 4px;
        transition: background-color 0.2s;
      }
      
      .chatgpt-enhancer-folder:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }
      
      .dark .chatgpt-enhancer-folder:hover {
        background-color: rgba(255, 255, 255, 0.05);
      }
      
      .chatgpt-enhancer-folder-color {
        width: 12px;
        height: 12px;
        border-radius: 3px;
        margin-right: 8px;
      }
      
      .chatgpt-enhancer-folder-name {
        flex-grow: 1;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .chatgpt-enhancer-search {
        padding: 8px;
        margin-bottom: 10px;
      }
      
      .chatgpt-enhancer-search-input {
        width: 100%;
        padding: 8px 12px;
        border-radius: 6px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        background-color: rgba(0, 0, 0, 0.05);
        font-size: 14px;
      }
      
      .dark .chatgpt-enhancer-search-input {
        border: 1px solid rgba(255, 255, 255, 0.1);
        background-color: rgba(255, 255, 255, 0.05);
        color: #ffffff;
      }
      
      .chatgpt-enhancer-pinned-chat {
        display: flex;
        align-items: center;
        padding: 8px;
        border-radius: 6px;
        cursor: pointer;
        margin-bottom: 4px;
        transition: background-color 0.2s;
      }
      
      .chatgpt-enhancer-pinned-chat:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }
      
      .dark .chatgpt-enhancer-pinned-chat:hover {
        background-color: rgba(255, 255, 255, 0.05);
      }
      
      .chatgpt-enhancer-pin-icon {
        margin-right: 8px;
        font-size: 12px;
      }
    `;
    
    DOMUtils.addStyles(css, 'chatgpt-enhancer-sidebar-styles');
  }

  /**
   * Add folder section to the sidebar
   */
  addFolderSection() {
    // Create section container
    const folderSection = DOMUtils.createElement('div', {
      class: 'chatgpt-enhancer-section'
    });
    
    // Add section title
    const sectionTitle = DOMUtils.createElement('div', {
      class: 'chatgpt-enhancer-section-title'
    }, 'Folders');
    
    folderSection.appendChild(sectionTitle);
    
    // Add folders
    if (this.folders.length > 0) {
      this.folders.forEach(folder => {
        const folderElement = this.createFolderElement(folder);
        folderSection.appendChild(folderElement);
      });
    } else {
      // Add placeholder
      const placeholder = DOMUtils.createElement('div', {
        style: {
          padding: '8px',
          fontSize: '14px',
          color: 'rgba(0, 0, 0, 0.5)'
        }
      }, 'No folders yet');
      
      folderSection.appendChild(placeholder);
    }
    
    // Add "New Folder" button
    const newFolderButton = DOMUtils.createElement('button', {
      class: 'chatgpt-enhancer-folder',
      style: {
        justifyContent: 'center',
        marginTop: '8px'
      },
      onclick: () => this.createNewFolder()
    }, '+ New Folder');
    
    folderSection.appendChild(newFolderButton);
    
    // Insert at the top of the sidebar
    this.sidebarElement.insertBefore(folderSection, this.sidebarElement.firstChild);
  }

  /**
   * Create a folder element
   * @param {Object} folder - Folder data
   * @returns {HTMLElement} Folder element
   */
  createFolderElement(folder) {
    const folderElement = DOMUtils.createElement('div', {
      class: 'chatgpt-enhancer-folder',
      dataset: {
        folderId: folder.folderId
      }
    });
    
    // Color indicator
    const colorIndicator = DOMUtils.createElement('div', {
      class: 'chatgpt-enhancer-folder-color',
      style: {
        backgroundColor: folder.color
      }
    });
    
    // Folder name
    const nameElement = DOMUtils.createElement('div', {
      class: 'chatgpt-enhancer-folder-name'
    }, folder.name);
    
    folderElement.appendChild(colorIndicator);
    folderElement.appendChild(nameElement);
    
    return folderElement;
  }

  /**
   * Add pinned chats section to the sidebar
   */
  addPinnedChatsSection() {
    // Create section container
    const pinnedSection = DOMUtils.createElement('div', {
      class: 'chatgpt-enhancer-section'
    });
    
    // Add section title
    const sectionTitle = DOMUtils.createElement('div', {
      class: 'chatgpt-enhancer-section-title'
    }, 'Pinned Chats');
    
    pinnedSection.appendChild(sectionTitle);
    
    // Add pinned chats (placeholder for now)
    const placeholder = DOMUtils.createElement('div', {
      style: {
        padding: '8px',
        fontSize: '14px',
        color: 'rgba(0, 0, 0, 0.5)'
      }
    }, 'No pinned chats');
    
    pinnedSection.appendChild(placeholder);
    
    // Insert after the folder section
    const folderSection = this.sidebarElement.querySelector('.chatgpt-enhancer-section');
    this.sidebarElement.insertBefore(pinnedSection, folderSection.nextSibling);
  }

  /**
   * Add search bar to the sidebar
   */
  addSearchBar() {
    // Create search container
    const searchContainer = DOMUtils.createElement('div', {
      class: 'chatgpt-enhancer-search'
    });
    
    // Create search input
    const searchInput = DOMUtils.createElement('input', {
      class: 'chatgpt-enhancer-search-input',
      placeholder: 'Search chats...',
      oninput: (e) => this.handleSearch(e.target.value)
    });
    
    searchContainer.appendChild(searchInput);
    
    // Insert at the top of the sidebar
    this.sidebarElement.insertBefore(searchContainer, this.sidebarElement.firstChild);
  }

  /**
   * Handle search input
   * @param {string} query - Search query
   */
  handleSearch(query) {
    console.log('Search query:', query);
    // This will be implemented with the search functionality
  }

  /**
   * Create a new folder
   */
  createNewFolder() {
    // Simple prompt for now, will be replaced with a proper modal
    const name = prompt('Enter folder name:');
    if (!name) return;
    
    const color = '#' + Math.floor(Math.random() * 16777215).toString(16);
    
    const folder = {
      folderId: 'folder_' + Date.now(),
      name,
      color,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      order: this.folders.length
    };
    
    // Save to storage
    storageManager.put('folders', folder)
      .then(() => {
        this.folders.push(folder);
        
        // Refresh the folder section
        const folderSection = this.sidebarElement.querySelector('.chatgpt-enhancer-section');
        folderSection.remove();
        this.addFolderSection();
      })
      .catch(error => {
        console.error('Error creating folder:', error);
        alert('Failed to create folder');
      });
  }

  /**
   * Set up observers for sidebar changes
   */
  setupObservers() {
    // This will observe changes to the sidebar to maintain our enhancements
    DOMUtils.createObserver(this.sidebarElement, (mutations) => {
      // Handle mutations if needed
    });
  }
}

// Export
window.EnhancedSidebar = EnhancedSidebar;
