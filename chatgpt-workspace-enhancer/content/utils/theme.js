/**
 * Theme utility for ChatGPT Workspace Enhancer
 * Handles theme detection and application
 */

class ThemeManager {
  constructor() {
    this.currentTheme = 'light';
    this.observers = [];
    this.initialized = false;
  }

  /**
   * Initialize the theme manager
   */
  initialize() {
    if (this.initialized) return;
    
    // Detect initial theme
    this.detectTheme();
    
    // Set up observer for theme changes
    this.setupThemeObserver();
    
    this.initialized = true;
  }

  /**
   * Detect current theme from ChatGPT interface
   */
  detectTheme() {
    const isDarkMode = document.documentElement.classList.contains('dark');
    const newTheme = isDarkMode ? 'dark' : 'light';
    
    if (newTheme !== this.currentTheme) {
      const oldTheme = this.currentTheme;
      this.currentTheme = newTheme;
      this.notifyThemeChange(oldTheme, newTheme);
    }
    
    return this.currentTheme;
  }

  /**
   * Set up observer for theme changes
   */
  setupThemeObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          this.detectTheme();
        }
      });
    });
    
    // Start observing
    observer.observe(document.documentElement, { attributes: true });
  }

  /**
   * Get current theme
   * @returns {string} Current theme ('light' or 'dark')
   */
  getTheme() {
    return this.currentTheme;
  }

  /**
   * Register a theme change observer
   * @param {function} callback - Callback function(oldTheme, newTheme)
   * @returns {number} Observer ID for unregistering
   */
  registerObserver(callback) {
    this.observers.push(callback);
    return this.observers.length - 1;
  }

  /**
   * Unregister a theme change observer
   * @param {number} id - Observer ID returned from registerObserver
   */
  unregisterObserver(id) {
    this.observers[id] = null;
  }

  /**
   * Notify all observers of theme change
   * @param {string} oldTheme - Previous theme
   * @param {string} newTheme - New theme
   * @private
   */
  notifyThemeChange(oldTheme, newTheme) {
    this.observers.forEach((observer) => {
      if (observer) {
        try {
          observer(oldTheme, newTheme);
        } catch (error) {
          console.error('Error in theme observer:', error);
        }
      }
    });
  }
}

// Export as singleton
const themeManager = new ThemeManager();
