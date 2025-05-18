/**
 * Background script for ChatGPT Workspace Enhancer
 * Handles browser events and cross-tab communication
 */

// Initialize extension when installed or updated
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // First time installation
    initializeDefaultSettings();
  } else if (details.reason === 'update') {
    // Extension update
    handleExtensionUpdate(details.previousVersion);
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'getSettings':
      getSettings().then(sendResponse);
      return true; // Keep the message channel open for async response
    
    case 'saveSettings':
      saveSettings(message.data).then(sendResponse);
      return true;
    
    case 'openCommandPalette':
      // Forward command to the active tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'openCommandPalette' });
        }
      });
      sendResponse({ success: true });
      return false;

    case 'resetSettings':
      initializeDefaultSettings()
        .then(() => sendResponse({ success: true }))
        .catch((err) => sendResponse({ error: err.message }));
      return true;
    
    default:
      sendResponse({ error: 'Unknown action' });
      return false;
  }
});

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open_command_palette') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'openCommandPalette' });
      }
    });
  }
});

/**
 * Initialize default settings for new installations
 */
async function initializeDefaultSettings() {
  const defaultSettings = {
    theme: {
      mode: 'auto',
      highContrast: false
    },
    features: {
      tokenCounter: true,
      promptCoach: true,
      syntaxHighlighting: true,
      sessionTimer: true
    },
    shortcuts: {
      commandPalette: 'Ctrl+K',
      newChat: 'Ctrl+N'
    },
    version: chrome.runtime.getManifest().version
  };

  const defaultMetadata = {
    lastSyncTimestamp: Date.now(),
    folderStructure: [],
    pinnedChats: []
  };

  try {
    await chrome.storage.sync.set({
      settings: defaultSettings,
      metadata: defaultMetadata
    });
    console.log('Default settings initialized');
  } catch (error) {
    console.error('Error initializing default settings:', error);
  }
}

/**
 * Handle extension updates
 * @param {string} previousVersion - Previous version of the extension
 */
async function handleExtensionUpdate(previousVersion) {
  try {
    const { settings } = await chrome.storage.sync.get('settings');
    if (settings) {
      // Update version number
      settings.version = chrome.runtime.getManifest().version;
      await chrome.storage.sync.set({ settings });
      console.log(`Extension updated from ${previousVersion} to ${settings.version}`);
    } else {
      // If settings don't exist for some reason, initialize them
      await initializeDefaultSettings();
    }
  } catch (error) {
    console.error('Error handling extension update:', error);
  }
}

/**
 * Get extension settings
 * @returns {Promise<Object>} Settings object
 */
async function getSettings() {
  try {
    const data = await chrome.storage.sync.get(['settings', 'metadata']);
    return {
      settings: data.settings || {},
      metadata: data.metadata || {}
    };
  } catch (error) {
    console.error('Error getting settings:', error);
    return { error: 'Failed to retrieve settings' };
  }
}

/**
 * Save extension settings
 * @param {Object} data - Settings data to save
 * @returns {Promise<Object>} Result of the save operation
 */
async function saveSettings(data) {
  try {
    await chrome.storage.sync.set({
      settings: data.settings,
      metadata: data.metadata
    });
    return { success: true };
  } catch (error) {
    console.error('Error saving settings:', error);
    return { error: 'Failed to save settings' };
  }
}
