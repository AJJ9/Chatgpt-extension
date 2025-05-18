/**
 * Main options page script for ChatGPT Workspace Enhancer
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Load settings
  await loadSettings();
  
  // Set up event listeners
  setupEventListeners();
});

/**
 * Load settings from storage
 */
async function loadSettings() {
  try {
    const { settings } = await chrome.storage.sync.get('settings');
    
    if (settings) {
      // Update theme settings
      document.getElementById('theme-mode').value = settings.theme?.mode || 'auto';
      document.getElementById('high-contrast').checked = settings.theme?.highContrast || false;
      
      // Update feature toggles
      document.getElementById('token-counter').checked = settings.features?.tokenCounter !== false;
      document.getElementById('prompt-coach').checked = settings.features?.promptCoach !== false;
      document.getElementById('syntax-highlighting').checked = settings.features?.syntaxHighlighting !== false;
      document.getElementById('session-timer').checked = settings.features?.sessionTimer !== false;
      
      // Display version
      document.getElementById('version').textContent = settings.version || chrome.runtime.getManifest().version;
    }
  } catch (error) {
    console.error('Error loading settings:', error);
    showMessage('Failed to load settings', true);
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Save button
  document.getElementById('save-settings').addEventListener('click', saveSettings);
  
  // Export settings button
  document.getElementById('export-settings').addEventListener('click', exportSettings);
  
  // Import settings button
  document.getElementById('import-settings').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });
  
  // Import file input
  document.getElementById('import-file').addEventListener('change', importSettings);
  
  // Reset settings button
  document.getElementById('reset-settings').addEventListener('click', resetSettings);
}

/**
 * Save settings to storage
 */
async function saveSettings() {
  try {
    // Get current settings
    const { settings } = await chrome.storage.sync.get('settings');
    
    // Update with form values
    const updatedSettings = {
      ...settings,
      theme: {
        mode: document.getElementById('theme-mode').value,
        highContrast: document.getElementById('high-contrast').checked
      },
      features: {
        tokenCounter: document.getElementById('token-counter').checked,
        promptCoach: document.getElementById('prompt-coach').checked,
        syntaxHighlighting: document.getElementById('syntax-highlighting').checked,
        sessionTimer: document.getElementById('session-timer').checked
      }
    };
    
    // Save to storage
    await chrome.storage.sync.set({ settings: updatedSettings });
    
    showMessage('Settings saved successfully');
  } catch (error) {
    console.error('Error saving settings:', error);
    showMessage('Failed to save settings', true);
  }
}

/**
 * Export settings to JSON file
 */
function exportSettings() {
  chrome.storage.sync.get(['settings', 'metadata'], (result) => {
    const exportData = {
      settings: result.settings || {},
      metadata: result.metadata || {}
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chatgpt-enhancer-settings.json';
    a.click();
    
    URL.revokeObjectURL(url);
  });
}

/**
 * Import settings from JSON file
 */
function importSettings(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  
  reader.onload = async (e) => {
    try {
      const importData = JSON.parse(e.target.result);
      
      // Validate imported data
      if (!importData.settings) {
        throw new Error('Invalid settings file');
      }
      
      // Save to storage
      await chrome.storage.sync.set({
        settings: importData.settings,
        metadata: importData.metadata || {}
      });
      
      // Reload settings
      await loadSettings();
      
      showMessage('Settings imported successfully');
    } catch (error) {
      console.error('Error importing settings:', error);
      showMessage('Failed to import settings', true);
    }
    
    // Reset file input
    event.target.value = '';
  };
  
  reader.readAsText(file);
}

/**
 * Reset settings to defaults
 */
async function resetSettings() {
  if (!confirm('Are you sure you want to reset all settings to defaults?')) {
    return;
  }
  
  try {
    // Get default settings from background script
    const response = await chrome.runtime.sendMessage({ action: 'resetSettings' });
    
    if (response.success) {
      // Reload settings
      await loadSettings();
      
      showMessage('Settings reset to defaults');
    } else {
      throw new Error(response.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Error resetting settings:', error);
    showMessage('Failed to reset settings', true);
  }
}

/**
 * Show message to user
 * @param {string} message - Message text
 * @param {boolean} isError - Whether this is an error message
 */
function showMessage(message, isError = false) {
  const messageElement = document.getElementById('message');
  messageElement.textContent = message;
  messageElement.className = isError ? 'error' : 'success';
  
  // Show message
  messageElement.style.opacity = '1';
  
  // Hide after 3 seconds
  setTimeout(() => {
    messageElement.style.opacity = '0';
  }, 3000);
}
