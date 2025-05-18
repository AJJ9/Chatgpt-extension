/**
 * Main content script for ChatGPT Workspace Enhancer
 * Initializes and coordinates all enhancement features
 */

// Import modules will be handled by bundler in production
// For development, we'll use module patterns

// Main initialization function
(function() {
  'use strict';
  
  // Global state
  const state = {
    initialized: false,
    theme: 'light',
    settings: {},
    metadata: {},
    chatHistory: [],
    folders: [],
    tags: [],
    snippets: []
  };

  // Wait for page to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  /**
   * Initialize the extension
   */
  async function initialize() {
    if (state.initialized) return;
    
    console.log('ChatGPT Workspace Enhancer: Initializing...');
    
    try {
      // Load settings from storage
      await loadSettings();
      
      // Initialize storage
      await initializeStorage();
      
      // Detect current theme
      detectTheme();
      
      // Set up theme observer
      observeThemeChanges();
      
      // Initialize UI components
      initializeUI();
      
      // Set up message listeners
      setupMessageListeners();
      
      // Mark as initialized
      state.initialized = true;
      console.log('ChatGPT Workspace Enhancer: Initialized successfully');
    } catch (error) {
      console.error('ChatGPT Workspace Enhancer: Initialization failed', error);
    }
  }

  /**
   * Load settings from storage
   */
  async function loadSettings() {
    try {
      const response = await sendMessage({ action: 'getSettings' });
      if (response.settings) {
        state.settings = response.settings;
        state.metadata = response.metadata;
        console.log('Settings loaded:', state.settings);
      } else {
        console.warn('No settings found, using defaults');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  /**
   * Initialize IndexedDB storage
   */
  async function initializeStorage() {
    await storageManager.initialize();
  }

  /**
   * Detect current theme (light/dark)
   */
  function detectTheme() {
    // Check for dark mode
    const isDarkMode = document.documentElement.classList.contains('dark');
    state.theme = isDarkMode ? 'dark' : 'light';
    console.log('Theme detected:', state.theme);
    
    // Apply appropriate stylesheet
    applyThemeStyles(state.theme);
  }

  /**
   * Apply theme-specific styles
   */
  function applyThemeStyles(theme) {
    // Remove any existing theme stylesheets
    const existingStyles = document.getElementById('chatgpt-enhancer-theme');
    if (existingStyles) {
      existingStyles.remove();
    }
    
    // Create and append new stylesheet
    const stylesheet = document.createElement('link');
    stylesheet.id = 'chatgpt-enhancer-theme';
    stylesheet.rel = 'stylesheet';
    stylesheet.href = chrome.runtime.getURL(`assets/css/${theme}.css`);
    document.head.appendChild(stylesheet);
  }

  /**
   * Observe theme changes in ChatGPT
   */
  function observeThemeChanges() {
    // Use MutationObserver to watch for theme class changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDarkMode = document.documentElement.classList.contains('dark');
          const newTheme = isDarkMode ? 'dark' : 'light';
          
          if (newTheme !== state.theme) {
            state.theme = newTheme;
            console.log('Theme changed to:', state.theme);
            applyThemeStyles(state.theme);
          }
        }
      });
    });
    
    // Start observing
    observer.observe(document.documentElement, { attributes: true });
  }

  /**
   * Initialize UI components
   */
  function initializeUI() {
    window.enhancedSidebar = new EnhancedSidebar();
    window.enhancedEditor = new EnhancedEditor();
    window.commandPalette = new CommandPalette();
    window.productivityManager = new ProductivityManager();
    window.organizationManager = new OrganizationManager();
    window.exportManager = new ExportManager();

    window.enhancedSidebar.initialize();
    window.enhancedEditor.initialize();
    window.commandPalette.initialize();
    window.productivityManager.initialize();
    window.organizationManager.initialize();
    window.exportManager.initialize();
  }

  /**
   * Set up message listeners for communication with background script
   */
  function setupMessageListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.action) {
        case 'openCommandPalette':
          openCommandPalette();
          sendResponse({ success: true });
          break;
          
        case 'themeChanged':
          applyThemeStyles(message.theme);
          sendResponse({ success: true });
          break;
          
        default:
          sendResponse({ error: 'Unknown action' });
      }
      return true;
    });
  }

  /**
   * Open command palette
   */
  function openCommandPalette() {
    if (window.commandPalette) {
      window.commandPalette.toggle();
    }
  }

  /**
   * Send message to background script
   * @param {Object} message - Message to send
   * @returns {Promise<any>} Response from background script
   */
  function sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }
})();
