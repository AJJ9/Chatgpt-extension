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
    // This will be implemented in storage.js
    // For now, we'll just log a placeholder
    console.log('Storage initialization placeholder');
    
    // Mock data for development
    state.folders = [
      { folderId: 'folder1', name: 'Work', color: '#ff5733', order: 0 },
      { folderId: 'folder2', name: 'Personal', color: '#33ff57', order: 1 }
    ];
    
    state.tags = [
      { tagId: 'tag1', name: 'Important', color: '#ff3333' },
      { tagId: 'tag2', name: 'Research', color: '#3333ff' }
    ];
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
    // This will initialize all UI components
    // Each component will be in its own module in the ui/ directory
    
    // For now, we'll just add a simple indicator to show the extension is active
    const indicator = document.createElement('div');
    indicator.id = 'chatgpt-enhancer-indicator';
    indicator.textContent = 'ChatGPT Workspace Enhancer Active';
    indicator.style.position = 'fixed';
    indicator.style.bottom = '10px';
    indicator.style.right = '10px';
    indicator.style.padding = '5px 10px';
    indicator.style.backgroundColor = state.theme === 'dark' ? '#2a2a2a' : '#f0f0f0';
    indicator.style.color = state.theme === 'dark' ? '#ffffff' : '#333333';
    indicator.style.borderRadius = '4px';
    indicator.style.fontSize = '12px';
    indicator.style.zIndex = '9999';
    document.body.appendChild(indicator);
    
    // Initialize sidebar enhancements (placeholder)
    console.log('UI initialization placeholder');
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
    console.log('Command palette placeholder');
    // This will be implemented in command.js
    alert('Command Palette (Coming Soon)');
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
