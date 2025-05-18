/**
 * Productivity features for ChatGPT Workspace Enhancer
 * Implements session timer, message counter, and scratch pad
 */

class ProductivityManager {
  constructor() {
    this.initialized = false;
    this.sessionStartTime = null;
    this.messageCount = 0;
    this.scratchPadContent = '';
    this.scratchPadElement = null;
  }

  /**
   * Initialize the productivity manager
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Start session timer
      this.startSessionTimer();
      
      // Initialize message counter
      this.initializeMessageCounter();
      
      // Create scratch pad
      this.createScratchPad();
      
      // Load scratch pad content
      await this.loadScratchPadContent();
      
      this.initialized = true;
      console.log('Productivity manager initialized');
    } catch (error) {
      console.error('Error initializing productivity manager:', error);
    }
  }

  /**
   * Start session timer
   */
  startSessionTimer() {
    this.sessionStartTime = Date.now();
    
    // Create timer element
    const timerElement = DOMUtils.createElement('div', {
      id: 'chatgpt-enhancer-session-timer',
      class: 'chatgpt-enhancer-status-item',
      title: 'Session duration'
    }, '00:00:00');
    
    // Add to status bar
    this.addToStatusBar(timerElement);
    
    // Update timer every second
    setInterval(() => {
      this.updateSessionTimer();
    }, 1000);
  }

  /**
   * Update session timer
   */
  updateSessionTimer() {
    const timerElement = document.getElementById('chatgpt-enhancer-session-timer');
    if (!timerElement) return;
    
    const elapsed = Math.floor((Date.now() - this.sessionStartTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    
    const timeString = [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
    
    timerElement.textContent = timeString;
  }

  /**
   * Initialize message counter
   */
  initializeMessageCounter() {
    // Create counter element
    const counterElement = DOMUtils.createElement('div', {
      id: 'chatgpt-enhancer-message-counter',
      class: 'chatgpt-enhancer-status-item',
      title: 'Messages in this session'
    }, '0 messages');
    
    // Add to status bar
    this.addToStatusBar(counterElement);
    
    // Set up observer to count messages
    const chatContainer = document.querySelector('main div.flex-1');
    if (chatContainer) {
      const observer = new MutationObserver(() => {
        this.updateMessageCount();
      });
      
      observer.observe(chatContainer, {
        childList: true,
        subtree: true
      });
      
      // Initial count
      this.updateMessageCount();
    }
  }

  /**
   * Update message count
   */
  updateMessageCount() {
    const counterElement = document.getElementById('chatgpt-enhancer-message-counter');
    if (!counterElement) return;
    
    // Count message elements
    const chatContainer = document.querySelector('main div.flex-1');
    if (chatContainer) {
      const messages = chatContainer.querySelectorAll('.group');
      this.messageCount = messages.length;
      
      counterElement.textContent = `${this.messageCount} message${this.messageCount !== 1 ? 's' : ''}`;
    }
  }

  /**
   * Create scratch pad
   */
  createScratchPad() {
    // Create scratch pad container
    const scratchPadContainer = DOMUtils.createElement('div', {
      id: 'chatgpt-enhancer-scratch-pad-container',
      style: {
        position: 'fixed',
        top: '0',
        right: '0',
        width: '300px',
        height: '100%',
        backgroundColor: '#ffffff',
        boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
        zIndex: '1000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s',
        display: 'flex',
        flexDirection: 'column'
      }
    });
    
    // Create header
    const header = DOMUtils.createElement('div', {
      style: {
        padding: '12px',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    });
    
    const title = DOMUtils.createElement('div', {
      style: {
        fontWeight: 'bold',
        fontSize: '16px'
      }
    }, 'Scratch Pad');
    
    const closeButton = DOMUtils.createElement('button', {
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px'
      },
      onclick: () => this.toggleScratchPad()
    }, '×');
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Create textarea
    this.scratchPadElement = DOMUtils.createElement('textarea', {
      id: 'chatgpt-enhancer-scratch-pad',
      style: {
        width: '100%',
        height: '100%',
        padding: '12px',
        border: 'none',
        resize: 'none',
        outline: 'none',
        fontSize: '14px',
        lineHeight: '1.5'
      },
      oninput: (e) => this.handleScratchPadInput(e)
    });
    
    // Add elements to container
    scratchPadContainer.appendChild(header);
    scratchPadContainer.appendChild(this.scratchPadElement);
    
    // Add to body
    document.body.appendChild(scratchPadContainer);
    
    // Create toggle button
    const toggleButton = DOMUtils.createElement('button', {
      id: 'chatgpt-enhancer-scratch-pad-toggle',
      style: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#10a37f',
        color: 'white',
        border: 'none',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        cursor: 'pointer',
        zIndex: '999',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '20px'
      },
      onclick: () => this.toggleScratchPad()
    }, '✎');
    
    document.body.appendChild(toggleButton);
    
    // Add dark mode styles
    this.addScratchPadDarkModeStyles();
  }

  /**
   * Add dark mode styles for scratch pad
   */
  addScratchPadDarkModeStyles() {
    const css = `
      .dark #chatgpt-enhancer-scratch-pad-container {
        background-color: #2a2a2a;
        box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
      }
      
      .dark #chatgpt-enhancer-scratch-pad-container > div {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        color: #ffffff;
      }
      
      .dark #chatgpt-enhancer-scratch-pad {
        background-color: #2a2a2a;
        color: #ffffff;
      }
      
      .dark #chatgpt-enhancer-scratch-pad-toggle {
        background-color: #10a37f;
      }
      
      .dark .chatgpt-enhancer-status-item {
        color: rgba(255, 255, 255, 0.7);
      }
    `;
    
    DOMUtils.addStyles(css, 'chatgpt-enhancer-productivity-dark');
  }

  /**
   * Toggle scratch pad visibility
   */
  toggleScratchPad() {
    const container = document.getElementById('chatgpt-enhancer-scratch-pad-container');
    if (!container) return;
    
    const isVisible = container.style.transform === 'translateX(0px)';
    
    if (isVisible) {
      container.style.transform = 'translateX(100%)';
    } else {
      container.style.transform = 'translateX(0)';
      this.scratchPadElement.focus();
    }
  }

  /**
   * Handle scratch pad input
   * @param {Event} e - Input event
   */
  handleScratchPadInput(e) {
    this.scratchPadContent = e.target.value;
    this.saveScratchPadContent();
  }

  /**
   * Load scratch pad content from storage
   */
  async loadScratchPadContent() {
    try {
      const { settings } = await storageManager.getSettings();
      if (settings && settings.scratchPad) {
        this.scratchPadContent = settings.scratchPad;
        this.scratchPadElement.value = this.scratchPadContent;
      }
    } catch (error) {
      console.error('Error loading scratch pad content:', error);
    }
  }

  /**
   * Save scratch pad content to storage
   */
  async saveScratchPadContent() {
    try {
      const { settings } = await storageManager.getSettings();
      if (settings) {
        settings.scratchPad = this.scratchPadContent;
        await storageManager.saveSettings({ settings }, null);
      }
    } catch (error) {
      console.error('Error saving scratch pad content:', error);
    }
  }

  /**
   * Add element to status bar
   * @param {HTMLElement} element - Element to add
   */
  addToStatusBar() {
    // Create status bar if it doesn't exist
    let statusBar = document.getElementById('chatgpt-enhancer-status-bar');
    
    if (!statusBar) {
      statusBar = DOMUtils.createElement('div', {
        id: 'chatgpt-enhancer-status-bar',
        style: {
          position: 'fixed',
          bottom: '0',
          left: '0',
          width: '100%',
          padding: '8px 16px',
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '16px',
          zIndex: '998',
          fontSize: '12px'
        }
      });
      
      document.body.appendChild(statusBar);
      
      // Add styles for status items
      const css = `
        .chatgpt-enhancer-status-item {
          color: rgba(0, 0, 0, 0.7);
        }
      `;
      
      DOMUtils.addStyles(css, 'chatgpt-enhancer-status-bar-styles');
    }
    
    // Add elements to status bar
    for (let i = 0; i < arguments.length; i++) {
      statusBar.appendChild(arguments[i]);
    }
  }
}

// Export
window.ProductivityManager = ProductivityManager;
