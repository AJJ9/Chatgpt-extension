/**
 * DOM utility functions for ChatGPT Workspace Enhancer
 * Provides helper methods for DOM manipulation and observation
 */

class DOMUtils {
  /**
   * Create an element with attributes and children
   * @param {string} tag - HTML tag name
   * @param {Object} attributes - Element attributes
   * @param {Array|Node|string} children - Child elements or text content
   * @returns {HTMLElement} Created element
   */
  static createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'style' && typeof value === 'object') {
        Object.entries(value).forEach(([prop, val]) => {
          element.style[prop] = val;
        });
      } else if (key === 'dataset' && typeof value === 'object') {
        Object.entries(value).forEach(([prop, val]) => {
          element.dataset[prop] = val;
        });
      } else if (key.startsWith('on') && typeof value === 'function') {
        element.addEventListener(key.substring(2).toLowerCase(), value);
      } else {
        element.setAttribute(key, value);
      }
    });
    
    // Add children
    if (Array.isArray(children)) {
      children.forEach(child => {
        if (child instanceof Node) {
          element.appendChild(child);
        } else if (child !== null && child !== undefined) {
          element.appendChild(document.createTextNode(String(child)));
        }
      });
    } else if (children instanceof Node) {
      element.appendChild(children);
    } else if (children !== null && children !== undefined) {
      element.textContent = String(children);
    }
    
    return element;
  }
  
  /**
   * Wait for an element to appear in the DOM
   * @param {string} selector - CSS selector
   * @param {number} timeout - Timeout in milliseconds
   * @param {HTMLElement} parent - Parent element to search within
   * @returns {Promise<HTMLElement>} Found element
   */
  static waitForElement(selector, timeout = 10000, parent = document) {
    return new Promise((resolve, reject) => {
      // Check if element already exists
      const element = parent.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }
      
      // Set timeout
      const timeoutId = setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
      
      // Create observer
      const observer = new MutationObserver((mutations) => {
        const element = parent.querySelector(selector);
        if (element) {
          observer.disconnect();
          clearTimeout(timeoutId);
          resolve(element);
        }
      });
      
      // Start observing
      observer.observe(parent, {
        childList: true,
        subtree: true
      });
    });
  }
  
  /**
   * Create and observe a mutation observer
   * @param {HTMLElement} target - Target element to observe
   * @param {function} callback - Callback function
   * @param {Object} options - MutationObserver options
   * @returns {MutationObserver} Created observer
   */
  static createObserver(target, callback, options = {}) {
    const defaultOptions = {
      childList: true,
      subtree: true
    };
    
    const observer = new MutationObserver(callback);
    observer.observe(target, { ...defaultOptions, ...options });
    
    return observer;
  }
  
  /**
   * Find the closest parent matching a selector
   * @param {HTMLElement} element - Starting element
   * @param {string} selector - CSS selector
   * @returns {HTMLElement|null} Found parent or null
   */
  static closest(element, selector) {
    // Use native closest if available
    if (element.closest) {
      return element.closest(selector);
    }
    
    // Fallback implementation
    let current = element;
    while (current && current !== document) {
      if (current.matches(selector)) {
        return current;
      }
      current = current.parentElement;
    }
    
    return null;
  }
  
  /**
   * Add CSS styles to the page
   * @param {string} css - CSS rules
   * @param {string} id - Optional ID for the style element
   * @returns {HTMLStyleElement} Created style element
   */
  static addStyles(css, id = null) {
    const style = document.createElement('style');
    style.textContent = css;
    
    if (id) {
      style.id = id;
    }
    
    document.head.appendChild(style);
    return style;
  }
  
  /**
   * Get computed theme (light/dark) from the page
   * @returns {string} 'light' or 'dark'
   */
  static getTheme() {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }
  
  /**
   * Check if an element is visible in the viewport
   * @param {HTMLElement} element - Element to check
   * @returns {boolean} True if element is visible
   */
  static isInViewport(element) {
    const rect = element.getBoundingClientRect();
    
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
  
  /**
   * Scroll element into view if not already visible
   * @param {HTMLElement} element - Element to scroll into view
   * @param {Object} options - ScrollIntoView options
   */
  static scrollIntoViewIfNeeded(element, options = { behavior: 'smooth', block: 'nearest' }) {
    if (!this.isInViewport(element)) {
      element.scrollIntoView(options);
    }
  }
}

// Export
window.DOMUtils = DOMUtils;
