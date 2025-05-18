/**
 * Storage utility for ChatGPT Workspace Enhancer
 * Manages IndexedDB and browser sync storage
 */

class StorageManager {
  constructor() {
    this.DB_NAME = 'chatgpt-workspace-enhancer';
    this.DB_VERSION = 1;
    this.db = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the database
   * @returns {Promise<IDBDatabase>} Initialized database
   */
  async initialize() {
    if (this.isInitialized) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.isInitialized = true;
        console.log('IndexedDB initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores
        if (!db.objectStoreNames.contains('chats')) {
          const chatsStore = db.createObjectStore('chats', { keyPath: 'chatId' });
          chatsStore.createIndex('folderId', 'folderId', { unique: false });
          chatsStore.createIndex('isPinned', 'isPinned', { unique: false });
          chatsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('folders')) {
          const foldersStore = db.createObjectStore('folders', { keyPath: 'folderId' });
          foldersStore.createIndex('order', 'order', { unique: false });
        }

        if (!db.objectStoreNames.contains('tags')) {
          db.createObjectStore('tags', { keyPath: 'tagId' });
        }

        if (!db.objectStoreNames.contains('snippets')) {
          const snippetsStore = db.createObjectStore('snippets', { keyPath: 'snippetId' });
          snippetsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('draftHistory')) {
          const draftStore = db.createObjectStore('draftHistory', { keyPath: 'draftId' });
          draftStore.createIndex('chatId', 'chatId', { unique: false });
          draftStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        console.log('IndexedDB schema created');
      };
    });
  }

  /**
   * Get all items from a store
   * @param {string} storeName - Name of the store
   * @returns {Promise<Array>} Array of items
   */
  async getAll(storeName) {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get an item by ID
   * @param {string} storeName - Name of the store
   * @param {string} id - ID of the item
   * @returns {Promise<Object>} The requested item
   */
  async getById(storeName, id) {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Add or update an item
   * @param {string} storeName - Name of the store
   * @param {Object} item - Item to add or update
   * @returns {Promise<string>} ID of the added/updated item
   */
  async put(storeName, item) {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete an item
   * @param {string} storeName - Name of the store
   * @param {string} id - ID of the item to delete
   * @returns {Promise<void>}
   */
  async delete(storeName, id) {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get items by index
   * @param {string} storeName - Name of the store
   * @param {string} indexName - Name of the index
   * @param {any} value - Value to search for
   * @returns {Promise<Array>} Matching items
   */
  async getByIndex(storeName, indexName, value) {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Ensure database is initialized
   * @private
   */
  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Get settings from sync storage
   * @returns {Promise<Object>} Settings object
   */
  async getSettings() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(['settings', 'metadata'], (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve({
            settings: result.settings || {},
            metadata: result.metadata || {}
          });
        }
      });
    });
  }

  /**
   * Save settings to sync storage
   * @param {Object} settings - Settings object
   * @param {Object} metadata - Metadata object
   * @returns {Promise<void>}
   */
  async saveSettings(settings, metadata) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({ settings, metadata }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }
}

// Export as singleton
const storageManager = new StorageManager();
window.storageManager = storageManager;
