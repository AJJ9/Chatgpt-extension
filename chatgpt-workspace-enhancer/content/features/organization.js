/**
 * Organization features for ChatGPT Workspace Enhancer
 * Implements chat organization, folders, and tagging functionality
 */

class OrganizationManager {
  constructor() {
    this.initialized = false;
    this.folders = [];
    this.tags = [];
    this.currentChatId = null;
  }

  /**
   * Initialize the organization manager
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Load data
      await this.loadData();
      
      // Detect current chat
      this.detectCurrentChat();
      
      // Set up observers
      this.setupObservers();
      
      this.initialized = true;
      console.log('Organization manager initialized');
    } catch (error) {
      console.error('Error initializing organization manager:', error);
    }
  }

  /**
   * Load folders and tags data
   */
  async loadData() {
    try {
      // Load folders from storage
      this.folders = await storageManager.getAll('folders');
      
      // Load tags from storage
      this.tags = await storageManager.getAll('tags');
      
      console.log('Organization data loaded:', { 
        folders: this.folders.length, 
        tags: this.tags.length 
      });
    } catch (error) {
      console.error('Error loading organization data:', error);
      this.folders = [];
      this.tags = [];
    }
  }

  /**
   * Detect current chat ID
   */
  detectCurrentChat() {
    // Extract chat ID from URL
    const match = window.location.pathname.match(/\/c\/([a-zA-Z0-9-]+)/);
    if (match) {
      this.currentChatId = match[1];
      console.log('Current chat ID:', this.currentChatId);
    } else {
      this.currentChatId = null;
    }
  }

  /**
   * Set up observers for chat changes
   */
  setupObservers() {
    // Watch for URL changes to detect chat navigation
    let lastUrl = window.location.href;
    
    const observer = new MutationObserver(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        this.detectCurrentChat();
      }
    });
    
    observer.observe(document, { subtree: true, childList: true });
  }

  /**
   * Create a new folder
   * @param {string} name - Folder name
   * @param {string} color - Folder color (hex)
   * @returns {Promise<Object>} Created folder
   */
  async createFolder(name, color) {
    const folder = {
      folderId: 'folder_' + Date.now(),
      name,
      color,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      order: this.folders.length
    };
    
    try {
      await storageManager.put('folders', folder);
      this.folders.push(folder);
      return folder;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }

  /**
   * Update a folder
   * @param {string} folderId - Folder ID
   * @param {Object} updates - Properties to update
   * @returns {Promise<Object>} Updated folder
   */
  async updateFolder(folderId, updates) {
    try {
      const folder = await storageManager.getById('folders', folderId);
      if (!folder) {
        throw new Error('Folder not found');
      }
      
      const updatedFolder = {
        ...folder,
        ...updates,
        updatedAt: Date.now()
      };
      
      await storageManager.put('folders', updatedFolder);
      
      // Update local cache
      const index = this.folders.findIndex(f => f.folderId === folderId);
      if (index !== -1) {
        this.folders[index] = updatedFolder;
      }
      
      return updatedFolder;
    } catch (error) {
      console.error('Error updating folder:', error);
      throw error;
    }
  }

  /**
   * Delete a folder
   * @param {string} folderId - Folder ID
   * @returns {Promise<void>}
   */
  async deleteFolder(folderId) {
    try {
      await storageManager.delete('folders', folderId);
      
      // Update local cache
      this.folders = this.folders.filter(f => f.folderId !== folderId);
      
      // Update chat references
      const chats = await storageManager.getByIndex('chats', 'folderId', folderId);
      for (const chat of chats) {
        chat.folderId = null;
        await storageManager.put('chats', chat);
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  }

  /**
   * Create a new tag
   * @param {string} name - Tag name
   * @param {string} color - Tag color (hex)
   * @returns {Promise<Object>} Created tag
   */
  async createTag(name, color) {
    const tag = {
      tagId: 'tag_' + Date.now(),
      name,
      color
    };
    
    try {
      await storageManager.put('tags', tag);
      this.tags.push(tag);
      return tag;
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  }

  /**
   * Update a tag
   * @param {string} tagId - Tag ID
   * @param {Object} updates - Properties to update
   * @returns {Promise<Object>} Updated tag
   */
  async updateTag(tagId, updates) {
    try {
      const tag = await storageManager.getById('tags', tagId);
      if (!tag) {
        throw new Error('Tag not found');
      }
      
      const updatedTag = {
        ...tag,
        ...updates
      };
      
      await storageManager.put('tags', updatedTag);
      
      // Update local cache
      const index = this.tags.findIndex(t => t.tagId === tagId);
      if (index !== -1) {
        this.tags[index] = updatedTag;
      }
      
      return updatedTag;
    } catch (error) {
      console.error('Error updating tag:', error);
      throw error;
    }
  }

  /**
   * Delete a tag
   * @param {string} tagId - Tag ID
   * @returns {Promise<void>}
   */
  async deleteTag(tagId) {
    try {
      await storageManager.delete('tags', tagId);
      
      // Update local cache
      this.tags = this.tags.filter(t => t.tagId !== tagId);
      
      // Update chat references
      const chats = await storageManager.getAll('chats');
      for (const chat of chats) {
        if (chat.tags && chat.tags.includes(tagId)) {
          chat.tags = chat.tags.filter(t => t !== tagId);
          await storageManager.put('chats', chat);
        }
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
      throw error;
    }
  }

  /**
   * Add chat to folder
   * @param {string} chatId - Chat ID
   * @param {string} folderId - Folder ID
   * @returns {Promise<Object>} Updated chat
   */
  async addChatToFolder(chatId, folderId) {
    try {
      // Get chat
      let chat = await storageManager.getById('chats', chatId);
      
      // If chat doesn't exist in our storage yet, create it
      if (!chat) {
        chat = {
          chatId,
          title: 'Untitled Chat',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isPinned: false,
          tags: []
        };
      }
      
      // Update folder
      chat.folderId = folderId;
      chat.updatedAt = Date.now();
      
      // Save
      await storageManager.put('chats', chat);
      
      return chat;
    } catch (error) {
      console.error('Error adding chat to folder:', error);
      throw error;
    }
  }

  /**
   * Add tag to chat
   * @param {string} chatId - Chat ID
   * @param {string} tagId - Tag ID
   * @returns {Promise<Object>} Updated chat
   */
  async addTagToChat(chatId, tagId) {
    try {
      // Get chat
      let chat = await storageManager.getById('chats', chatId);
      
      // If chat doesn't exist in our storage yet, create it
      if (!chat) {
        chat = {
          chatId,
          title: 'Untitled Chat',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isPinned: false,
          folderId: null,
          tags: []
        };
      }
      
      // Add tag if not already present
      if (!chat.tags) {
        chat.tags = [];
      }
      
      if (!chat.tags.includes(tagId)) {
        chat.tags.push(tagId);
      }
      
      chat.updatedAt = Date.now();
      
      // Save
      await storageManager.put('chats', chat);
      
      return chat;
    } catch (error) {
      console.error('Error adding tag to chat:', error);
      throw error;
    }
  }

  /**
   * Remove tag from chat
   * @param {string} chatId - Chat ID
   * @param {string} tagId - Tag ID
   * @returns {Promise<Object>} Updated chat
   */
  async removeTagFromChat(chatId, tagId) {
    try {
      // Get chat
      const chat = await storageManager.getById('chats', chatId);
      if (!chat || !chat.tags) {
        throw new Error('Chat not found or has no tags');
      }
      
      // Remove tag
      chat.tags = chat.tags.filter(t => t !== tagId);
      chat.updatedAt = Date.now();
      
      // Save
      await storageManager.put('chats', chat);
      
      return chat;
    } catch (error) {
      console.error('Error removing tag from chat:', error);
      throw error;
    }
  }

  /**
   * Toggle pin status for a chat
   * @param {string} chatId - Chat ID
   * @returns {Promise<Object>} Updated chat
   */
  async toggleChatPin(chatId) {
    try {
      // Get chat
      let chat = await storageManager.getById('chats', chatId);
      
      // If chat doesn't exist in our storage yet, create it
      if (!chat) {
        chat = {
          chatId,
          title: 'Untitled Chat',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isPinned: false,
          folderId: null,
          tags: []
        };
      }
      
      // Toggle pin status
      chat.isPinned = !chat.isPinned;
      chat.updatedAt = Date.now();
      
      // Save
      await storageManager.put('chats', chat);
      
      // Update pinned chats in sync storage
      const { metadata } = await storageManager.getSettings();
      if (!metadata.pinnedChats) {
        metadata.pinnedChats = [];
      }
      
      if (chat.isPinned) {
        if (!metadata.pinnedChats.includes(chatId)) {
          metadata.pinnedChats.push(chatId);
        }
      } else {
        metadata.pinnedChats = metadata.pinnedChats.filter(id => id !== chatId);
      }
      
      await storageManager.saveSettings(null, metadata);
      
      return chat;
    } catch (error) {
      console.error('Error toggling chat pin:', error);
      throw error;
    }
  }
}

// Export
window.OrganizationManager = OrganizationManager;
