/**
 * Enhanced editor component for ChatGPT Workspace Enhancer
 * Implements syntax highlighting, token counter, and prompt assistance
 */

class EnhancedEditor {
  constructor() {
    this.editorElement = null;
    this.originalTextarea = null;
    this.tokenCounter = null;
    this.initialized = false;
    this.currentTokenCount = 0;
    this.draftHistory = [];
    this.currentDraftIndex = -1;
  }

  /**
   * Initialize the enhanced editor
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Find the original textarea
      const textarea = await this.findTextarea();
      if (!textarea) {
        console.error('ChatGPT input textarea not found');
        return;
      }
      
      this.originalTextarea = textarea;
      
      // Create enhanced editor
      this.createEnhancedEditor();
      
      // Add token counter
      this.addTokenCounter();
      
      // Set up draft history
      this.setupDraftHistory();
      
      this.initialized = true;
      console.log('Enhanced editor initialized');
    } catch (error) {
      console.error('Error initializing enhanced editor:', error);
    }
  }

  /**
   * Find the ChatGPT input textarea
   * @returns {Promise<HTMLElement>} Textarea element
   */
  async findTextarea() {
    // Wait for the textarea to be available in the DOM
    return DOMUtils.waitForElement('textarea[data-id]');
  }

  /**
   * Create the enhanced editor
   */
  createEnhancedEditor() {
    // Get the parent container of the textarea
    const container = this.originalTextarea.parentElement;
    
    // Create wrapper for our enhanced editor
    const editorWrapper = DOMUtils.createElement('div', {
      class: 'chatgpt-enhancer-editor-wrapper',
      style: {
        position: 'relative',
        width: '100%'
      }
    });
    
    // Create the enhanced editor (initially just a styled textarea)
    this.editorElement = DOMUtils.createElement('textarea', {
      class: 'chatgpt-enhancer-editor',
      placeholder: this.originalTextarea.placeholder,
      style: {
        width: '100%',
        minHeight: '48px',
        padding: '16px',
        resize: 'none',
        border: 'none',
        borderRadius: '8px',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        fontSize: '16px',
        lineHeight: '1.5',
        fontFamily: 'inherit',
        outline: 'none'
      },
      oninput: (e) => this.handleInput(e)
    });
    
    // Add custom styles
    this.addStyles();
    
    // Replace the original textarea with our enhanced editor
    editorWrapper.appendChild(this.editorElement);
    container.replaceChild(editorWrapper, this.originalTextarea);
    
    // Sync initial value
    this.editorElement.value = this.originalTextarea.value;
    
    // Keep the original textarea in the DOM but hidden
    this.originalTextarea.style.display = 'none';
    container.appendChild(this.originalTextarea);
    
    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Add custom styles for the enhanced editor
   */
  addStyles() {
    const css = `
      .chatgpt-enhancer-editor {
        transition: background-color 0.2s;
      }
      
      .chatgpt-enhancer-editor:focus {
        background-color: rgba(0, 0, 0, 0.07);
      }
      
      .dark .chatgpt-enhancer-editor {
        background-color: rgba(255, 255, 255, 0.05);
        color: #ffffff;
      }
      
      .dark .chatgpt-enhancer-editor:focus {
        background-color: rgba(255, 255, 255, 0.07);
      }
      
      .chatgpt-enhancer-token-counter {
        position: absolute;
        bottom: -20px;
        right: 10px;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.5);
      }
      
      .dark .chatgpt-enhancer-token-counter {
        color: rgba(255, 255, 255, 0.5);
      }
      
      .chatgpt-enhancer-token-counter.warning {
        color: #ff9800;
      }
      
      .chatgpt-enhancer-token-counter.danger {
        color: #f44336;
      }
    `;
    
    DOMUtils.addStyles(css, 'chatgpt-enhancer-editor-styles');
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Handle form submission
    const form = DOMUtils.closest(this.editorElement, 'form');
    if (form) {
      form.addEventListener('submit', () => {
        // Sync value to original textarea before submission
        this.originalTextarea.value = this.editorElement.value;
        
        // Save to draft history
        this.saveDraft(this.editorElement.value);
        
        // Reset editor after submission
        setTimeout(() => {
          this.editorElement.value = '';
          this.updateTokenCount('');
        }, 100);
      });
    }
    
    // Handle keyboard shortcuts
    this.editorElement.addEventListener('keydown', (e) => {
      // Ctrl+Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const submitButton = form?.querySelector('button[type="submit"]');
        if (submitButton) {
          e.preventDefault();
          submitButton.click();
        }
      }
      
      // Ctrl+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        this.restorePreviousDraft();
      }
      
      // Ctrl+Shift+Z or Ctrl+Y for redo
      if (((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) || 
          ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        this.restoreNextDraft();
      }
    });
  }

  /**
   * Handle input changes
   * @param {Event} e - Input event
   */
  handleInput(e) {
    const text = e.target.value;
    
    // Sync value to original textarea
    this.originalTextarea.value = text;
    
    // Update token count
    this.updateTokenCount(text);
    
    // Auto-resize textarea
    this.autoResizeTextarea();
  }

  /**
   * Auto-resize textarea based on content
   */
  autoResizeTextarea() {
    this.editorElement.style.height = 'auto';
    this.editorElement.style.height = `${this.editorElement.scrollHeight}px`;
  }

  /**
   * Add token counter
   */
  addTokenCounter() {
    this.tokenCounter = DOMUtils.createElement('div', {
      class: 'chatgpt-enhancer-token-counter'
    }, '0 tokens');
    
    const wrapper = this.editorElement.parentElement;
    wrapper.appendChild(this.tokenCounter);
    
    // Initial token count
    this.updateTokenCount(this.editorElement.value);
  }

  /**
   * Update token count
   * @param {string} text - Text to count tokens for
   */
  updateTokenCount(text) {
    // Simple token counting approximation (words / 0.75)
    // This is a very rough estimate; a proper tokenizer would be more accurate
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const tokenEstimate = Math.ceil(wordCount / 0.75);
    
    this.currentTokenCount = tokenEstimate;
    
    // Update counter text
    this.tokenCounter.textContent = `${tokenEstimate} tokens`;
    
    // Add warning classes based on token count
    this.tokenCounter.classList.remove('warning', 'danger');
    if (tokenEstimate > 2000) {
      this.tokenCounter.classList.add('danger');
    } else if (tokenEstimate > 1500) {
      this.tokenCounter.classList.add('warning');
    }
  }

  /**
   * Set up draft history
   */
  setupDraftHistory() {
    // Initialize with empty draft
    this.saveDraft('');
  }

  /**
   * Save current text as a draft
   * @param {string} text - Draft text
   */
  saveDraft(text) {
    // Don't save if identical to the last draft
    if (this.draftHistory.length > 0 && 
        this.draftHistory[this.draftHistory.length - 1] === text) {
      return;
    }
    
    // If we're not at the end of the history, truncate it
    if (this.currentDraftIndex < this.draftHistory.length - 1) {
      this.draftHistory = this.draftHistory.slice(0, this.currentDraftIndex + 1);
    }
    
    // Add new draft
    this.draftHistory.push(text);
    this.currentDraftIndex = this.draftHistory.length - 1;
    
    // Limit history size
    if (this.draftHistory.length > 50) {
      this.draftHistory.shift();
      this.currentDraftIndex--;
    }
  }

  /**
   * Restore previous draft (undo)
   */
  restorePreviousDraft() {
    if (this.currentDraftIndex <= 0) return;
    
    // Save current text first if it's different
    const currentText = this.editorElement.value;
    if (currentText !== this.draftHistory[this.currentDraftIndex]) {
      this.saveDraft(currentText);
      this.currentDraftIndex--;
    }
    
    // Go to previous draft
    this.currentDraftIndex--;
    const previousDraft = this.draftHistory[this.currentDraftIndex];
    
    // Update editor
    this.editorElement.value = previousDraft;
    this.originalTextarea.value = previousDraft;
    this.updateTokenCount(previousDraft);
    this.autoResizeTextarea();
  }

  /**
   * Restore next draft (redo)
   */
  restoreNextDraft() {
    if (this.currentDraftIndex >= this.draftHistory.length - 1) return;
    
    // Go to next draft
    this.currentDraftIndex++;
    const nextDraft = this.draftHistory[this.currentDraftIndex];
    
    // Update editor
    this.editorElement.value = nextDraft;
    this.originalTextarea.value = nextDraft;
    this.updateTokenCount(nextDraft);
    this.autoResizeTextarea();
  }
}

// Export
window.EnhancedEditor = EnhancedEditor;
