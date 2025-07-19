// Utility Functions for Gamified Marketing Website

/**
 * Generate a unique alphanumeric code for rewards
 * @param {number} length - Length of the code (default: 8)
 * @returns {string} - Unique code
 */
function generateUniqueCode(length = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // Add timestamp to ensure uniqueness
    const timestamp = Date.now().toString().slice(-4);
    return result + timestamp;
}

/**
 * Validate form inputs
 * @param {string} name - Customer name
 * @param {string} whatsapp - WhatsApp number
 * @returns {object} - Validation result with errors
 */
function validateFormInputs(name, whatsapp) {
    const errors = {};
    
    // Validate name
    if (!name || name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters long';
    }
    
    // Validate WhatsApp number
    const whatsappRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!whatsapp || !whatsappRegex.test(whatsapp.replace(/\s/g, ''))) {
        errors.whatsapp = 'Please enter a valid WhatsApp number';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
    };
}

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - User input string
 * @returns {string} - Sanitized string
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '&#x27;')
        .trim();
}

/**
 * Format timestamp to readable date
 * @param {number} timestamp - Unix timestamp
 * @returns {string} - Formatted date string
 */
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Show error message in form
 * @param {string} fieldId - ID of the form field
 * @param {string} message - Error message to display
 */
function showFieldError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error');
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    if (inputElement) {
        inputElement.style.borderColor = '#ef4444';
    }
}

/**
 * Clear error message from form field
 * @param {string} fieldId - ID of the form field
 */
function clearFieldError(fieldId) {
    const errorElement = document.getElementById(fieldId + 'Error');
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
    
    if (inputElement) {
        inputElement.style.borderColor = '#e5e7eb';
    }
}

/**
 * Clear all form errors
 */
function clearAllFormErrors() {
    clearFieldError('customerName');
    clearFieldError('whatsappNumber');
}

/**
 * Smooth scroll to element
 * @param {string} elementId - ID of target element
 * @param {number} offset - Offset from top (default: 0)
 */
function smoothScrollTo(elementId, offset = 0) {
    const element = document.getElementById(elementId);
    if (element) {
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }
}

/**
 * Add CSS class with animation
 * @param {HTMLElement} element - Target element
 * @param {string} className - CSS class to add
 * @param {number} duration - Duration in milliseconds (optional)
 */
function addAnimationClass(element, className, duration = null) {
    if (!element) return;
    
    element.classList.add(className);
    
    if (duration) {
        setTimeout(() => {
            element.classList.remove(className);
        }, duration);
    }
}

/**
 * Show element with fade in animation
 * @param {HTMLElement} element - Element to show
 */
function showElement(element) {
    if (!element) return;
    
    element.style.display = 'block';
    element.classList.add('fade-in');
}

/**
 * Hide element
 * @param {HTMLElement} element - Element to hide
 */
function hideElement(element) {
    if (!element) return;
    
    element.style.display = 'none';
    element.classList.remove('fade-in');
}

/**
 * Generate WhatsApp message URL
 * @param {string} reward - Reward text
 * @param {string} code - Unique reward code
 * @param {string} phoneNumber - Optional phone number
 * @returns {string} - WhatsApp URL
 */
function generateWhatsAppURL(reward, code, phoneNumber = '') {
    const message = `Hi, I played your game and won ${reward}. My code is ${code}`;
    const encodedMessage = encodeURIComponent(message);
    
    if (phoneNumber) {
        return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    } else {
        return `https://wa.me/?text=${encodedMessage}`;
    }
}

/**
 * Log error to console with context
 * @param {string} context - Context where error occurred
 * @param {Error} error - Error object
 */
function logError(context, error) {
    console.error(`[${context}] Error:`, error);
    
    // In production, you might want to send this to an error tracking service
    // Example: sendToErrorTracking(context, error);
}

/**
 * Show user notification
 * @param {string} message - Message to display
 * @param {string} type - Type of notification ('success', 'error', 'info')
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#10b981';
            break;
        case 'error':
            notification.style.backgroundColor = '#ef4444';
            break;
        default:
            notification.style.backgroundColor = '#2563eb';
    }
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Check if device is mobile
 * @returns {boolean} - True if mobile device
 */
function isMobileDevice() {
    return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const success = document.execCommand('copy');
            textArea.remove();
            return success;
        }
    } catch (error) {
        logError('copyToClipboard', error);
        return false;
    }
}

// Add CSS for notifications
const notificationStyles = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Export functions for use in other files
window.UtilityFunctions = {
    generateUniqueCode,
    validateFormInputs,
    sanitizeInput,
    formatTimestamp,
    showFieldError,
    clearFieldError,
    clearAllFormErrors,
    smoothScrollTo,
    addAnimationClass,
    showElement,
    hideElement,
    generateWhatsAppURL,
    logError,
    showNotification,
    debounce,
    isMobileDevice,
    copyToClipboard
};
