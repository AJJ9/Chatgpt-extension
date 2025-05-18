/**
 * Export functionality for ChatGPT Workspace Enhancer
 * Implements content export options (PDF, Markdown, etc.)
 */

class ExportManager {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize the export manager
   */
  initialize() {
    if (this.initialized) return;
    
    // Add export buttons to chat messages
    this.setupMessageExportButtons();
    
    this.initialized = true;
    console.log('Export manager initialized');
  }

  /**
   * Set up export buttons for chat messages
   */
  setupMessageExportButtons() {
    // Use MutationObserver to detect new messages
    const chatContainer = document.querySelector('main div.flex-1');
    if (!chatContainer) {
      console.error('Chat container not found');
      return;
    }
    
    // Create observer
    const observer = new MutationObserver((mutations) => {
      // Look for new message elements
      const messages = chatContainer.querySelectorAll('.group:not(.chatgpt-enhancer-processed)');
      
      messages.forEach(message => {
        this.addExportButtonsToMessage(message);
        message.classList.add('chatgpt-enhancer-processed');
      });
    });
    
    // Start observing
    observer.observe(chatContainer, {
      childList: true,
      subtree: true
    });
    
    // Process existing messages
    const existingMessages = chatContainer.querySelectorAll('.group:not(.chatgpt-enhancer-processed)');
    existingMessages.forEach(message => {
      this.addExportButtonsToMessage(message);
      message.classList.add('chatgpt-enhancer-processed');
    });
    
    // Add styles
    this.addStyles();
  }

  /**
   * Add export buttons to a message
   * @param {HTMLElement} messageElement - Message element
   */
  addExportButtonsToMessage(messageElement) {
    // Only add export buttons to assistant messages
    if (!messageElement.classList.contains('assistant')) return;
    
    // Find the button container
    const buttonContainer = messageElement.querySelector('.flex.justify-between');
    if (!buttonContainer) return;
    
    // Create export button container
    const exportContainer = DOMUtils.createElement('div', {
      class: 'chatgpt-enhancer-export-container',
      style: {
        display: 'flex',
        gap: '8px'
      }
    });
    
    // Add export buttons
    const copyMarkdownButton = DOMUtils.createElement('button', {
      class: 'chatgpt-enhancer-export-button',
      title: 'Copy as Markdown',
      onclick: (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.copyMessageAsMarkdown(messageElement);
      }
    }, 'Copy MD');
    
    const copyTextButton = DOMUtils.createElement('button', {
      class: 'chatgpt-enhancer-export-button',
      title: 'Copy as Plain Text',
      onclick: (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.copyMessageAsText(messageElement);
      }
    }, 'Copy Text');
    
    const exportPdfButton = DOMUtils.createElement('button', {
      class: 'chatgpt-enhancer-export-button',
      title: 'Export as PDF',
      onclick: (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.exportMessageAsPdf(messageElement);
      }
    }, 'PDF');
    
    exportContainer.appendChild(copyMarkdownButton);
    exportContainer.appendChild(copyTextButton);
    exportContainer.appendChild(exportPdfButton);
    
    // Add to button container
    buttonContainer.appendChild(exportContainer);
  }

  /**
   * Add styles for export buttons
   */
  addStyles() {
    const css = `
      .chatgpt-enhancer-export-button {
        padding: 4px 8px;
        font-size: 12px;
        border-radius: 4px;
        background-color: rgba(0, 0, 0, 0.05);
        color: rgba(0, 0, 0, 0.7);
        border: none;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .chatgpt-enhancer-export-button:hover {
        background-color: rgba(0, 0, 0, 0.1);
      }
      
      .dark .chatgpt-enhancer-export-button {
        background-color: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.7);
      }
      
      .dark .chatgpt-enhancer-export-button:hover {
        background-color: rgba(255, 255, 255, 0.15);
      }
      
      .chatgpt-enhancer-export-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 10px 16px;
        background-color: #4caf50;
        color: white;
        border-radius: 4px;
        font-size: 14px;
        z-index: 9999;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.3s, transform 0.3s;
      }
      
      .chatgpt-enhancer-export-notification.show {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    
    DOMUtils.addStyles(css, 'chatgpt-enhancer-export-styles');
  }

  /**
   * Copy message content as Markdown
   * @param {HTMLElement} messageElement - Message element
   */
  copyMessageAsMarkdown(messageElement) {
    // Find the message content
    const contentElement = messageElement.querySelector('.markdown');
    if (!contentElement) return;
    
    // Get the HTML content
    const html = contentElement.innerHTML;
    
    // Convert HTML to Markdown (simplified version)
    // In a real implementation, we would use a proper HTML-to-Markdown converter
    let markdown = html
      .replace(/<h1[^>]*>(.*?)<\/h1>/g, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/g, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/g, '### $1\n\n')
      .replace(/<p[^>]*>(.*?)<\/p>/g, '$1\n\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/g, '*$1*')
      .replace(/<code[^>]*>(.*?)<\/code>/g, '`$1`')
      .replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/g, '```\n$1\n```\n\n')
      .replace(/<ul[^>]*>(.*?)<\/ul>/g, '$1\n')
      .replace(/<li[^>]*>(.*?)<\/li>/g, '- $1\n')
      .replace(/<ol[^>]*>(.*?)<\/ol>/g, '$1\n')
      .replace(/<li[^>]*>(.*?)<\/li>/g, '1. $1\n')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g, '[$2]($1)')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/<[^>]*>/g, ''); // Remove any remaining HTML tags
    
    // Copy to clipboard
    navigator.clipboard.writeText(markdown)
      .then(() => {
        this.showNotification('Copied as Markdown');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        this.showNotification('Failed to copy', true);
      });
  }

  /**
   * Copy message content as plain text
   * @param {HTMLElement} messageElement - Message element
   */
  copyMessageAsText(messageElement) {
    // Find the message content
    const contentElement = messageElement.querySelector('.markdown');
    if (!contentElement) return;
    
    // Get the text content
    const text = contentElement.textContent;
    
    // Copy to clipboard
    navigator.clipboard.writeText(text)
      .then(() => {
        this.showNotification('Copied as Plain Text');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        this.showNotification('Failed to copy', true);
      });
  }

  /**
   * Export message as PDF
   * @param {HTMLElement} messageElement - Message element
   */
  exportMessageAsPdf(messageElement) {
    // This is a placeholder - in a real implementation, we would use a PDF generation library
    alert('PDF export functionality coming soon');
  }

  /**
   * Show notification
   * @param {string} message - Notification message
   * @param {boolean} isError - Whether this is an error notification
   */
  showNotification(message, isError = false) {
    // Remove any existing notification
    const existingNotification = document.querySelector('.chatgpt-enhancer-export-notification');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    // Create notification element
    const notification = DOMUtils.createElement('div', {
      class: 'chatgpt-enhancer-export-notification',
      style: {
        backgroundColor: isError ? '#f44336' : '#4caf50'
      }
    }, message);
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Hide after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      
      // Remove from DOM after animation
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  /**
   * Export entire chat as PDF
   */
  exportChatAsPdf() {
    // This is a placeholder - in a real implementation, we would use a PDF generation library
    alert('Full chat PDF export functionality coming soon');
  }
}

// Export
window.ExportManager = ExportManager;
