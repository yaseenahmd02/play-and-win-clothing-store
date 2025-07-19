// Main JavaScript for Customer Interface
// Handles UI interactions, form submissions, and navigation

/**
 * Main Application Controller
 */
class MainController {
    constructor() {
        this.currentGameResult = null;
        this.formSubmitted = false;
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.bindEventListeners();
        this.setupFormValidation();
        this.initializeUI();
        
        // Track page load
        if (window.GameAnalytics) {
            window.GameAnalytics.trackEvent('app_init', {
                timestamp: Date.now(),
                userAgent: navigator.userAgent.substring(0, 100)
            });
        }
    }

    /**
     * Bind all event listeners
     */
    bindEventListeners() {
        // Start Playing button
        const startPlayingBtn = document.getElementById('startPlayingBtn');
        if (startPlayingBtn) {
            startPlayingBtn.addEventListener('click', this.handleStartPlaying.bind(this));
        }

        // Lead form submission
        const leadForm = document.getElementById('leadForm');
        if (leadForm) {
            leadForm.addEventListener('submit', this.handleFormSubmission.bind(this));
        }

        // WhatsApp button
        const whatsappButton = document.getElementById('whatsappButton');
        if (whatsappButton) {
            whatsappButton.addEventListener('click', this.handleWhatsAppShare.bind(this));
        }

        // Input field real-time validation
        const nameInput = document.getElementById('customerName');
        const whatsappInput = document.getElementById('whatsappNumber');

        if (nameInput) {
            nameInput.addEventListener('input', this.validateNameField.bind(this));
            nameInput.addEventListener('blur', this.validateNameField.bind(this));
        }

        if (whatsappInput) {
            whatsappInput.addEventListener('input', this.validateWhatsAppField.bind(this));
            whatsappInput.addEventListener('blur', this.validateWhatsAppField.bind(this));
        }

        // Social media buttons
        this.bindSocialButtons();

        // Window scroll for animations
        window.addEventListener('scroll', this.handleScroll.bind(this));

        // Resize handler for responsive adjustments
        window.addEventListener('resize', window.UtilityFunctions.debounce(this.handleResize.bind(this), 250));
    }

    /**
     * Handle Start Playing button click
     */
    handleStartPlaying() {
        try {
            // Smooth scroll to Play & Win section
            window.UtilityFunctions.smoothScrollTo('playWinSection', 100);
            
            // Add pulse animation to game cards
            const gameCards = document.querySelectorAll('.game-card');
            gameCards.forEach((card, index) => {
                setTimeout(() => {
                    window.UtilityFunctions.addAnimationClass(card, 'pulse', 1000);
                }, index * 200);
            });

            // Track event
            if (window.GameAnalytics) {
                window.GameAnalytics.trackEvent('start_playing_clicked');
            }
        } catch (error) {
            window.UtilityFunctions.logError('handleStartPlaying', error);
        }
    }

    /**
     * Setup form validation
     */
    setupFormValidation() {
        const form = document.getElementById('leadForm');
        if (!form) return;

        // Prevent default browser validation
        form.setAttribute('novalidate', 'true');
    }

    /**
     * Handle form submission
     * @param {Event} event - Form submission event
     */
    async handleFormSubmission(event) {
        event.preventDefault();
        
        if (this.formSubmitted) {
            window.UtilityFunctions.showNotification('Form already submitted!', 'info');
            return;
        }

        try {
            // Get form data
            const formData = new FormData(event.target);
            const name = formData.get('name').trim();
            const whatsapp = formData.get('whatsapp').trim();

            // Clear previous errors
            window.UtilityFunctions.clearAllFormErrors();

            // Validate inputs
            const validation = window.UtilityFunctions.validateFormInputs(name, whatsapp);
            
            if (!validation.isValid) {
                this.displayFormErrors(validation.errors);
                return;
            }

            // Get current game result
            const gameResult = window.GameController ? window.GameController.getCurrentGameResult() : null;
            
            if (!gameResult) {
                window.UtilityFunctions.showNotification('No game result found. Please play a game first.', 'error');
                return;
            }

            // Disable form during submission
            this.setFormLoading(true);

            // Prepare data for storage
            const submissionData = {
                name: name,
                whatsapp: whatsapp,
                game: gameResult.game,
                reward: gameResult.reward,
                code: gameResult.code
            };

            // Save to database
            const saveSuccess = window.GameDB.saveGameResult(submissionData);
            
            if (saveSuccess) {
                this.formSubmitted = true;
                this.currentGameResult = gameResult;
                
                // Hide form and show WhatsApp section
                this.showSuccessState();
                
                // Track successful submission
                if (window.GameAnalytics) {
                    window.GameAnalytics.trackEvent('form_submit_success', {
                        game: gameResult.game,
                        reward: gameResult.reward
                    });
                }

                window.UtilityFunctions.showNotification('Information saved successfully!', 'success');
            } else {
                throw new Error('Failed to save game result');
            }

        } catch (error) {
            window.UtilityFunctions.logError('handleFormSubmission', error);
            window.UtilityFunctions.showNotification('Failed to save information. Please try again.', 'error');
            
            // Track error
            if (window.GameAnalytics) {
                window.GameAnalytics.trackEvent('form_submit_error', {
                    error: error.message
                });
            }
        } finally {
            this.setFormLoading(false);
        }
    }

    /**
     * Display form validation errors
     * @param {Object} errors - Validation errors
     */
    displayFormErrors(errors) {
        if (errors.name) {
            window.UtilityFunctions.showFieldError('customerName', errors.name);
        }
        
        if (errors.whatsapp) {
            window.UtilityFunctions.showFieldError('whatsappNumber', errors.whatsapp);
        }

        // Focus on first error field
        const firstErrorField = errors.name ? 'customerName' : 'whatsappNumber';
        const errorElement = document.getElementById(firstErrorField);
        if (errorElement) {
            errorElement.focus();
        }
    }

    /**
     * Validate name field in real-time
     */
    validateNameField() {
        const nameInput = document.getElementById('customerName');
        if (!nameInput) return;

        const name = nameInput.value.trim();
        
        if (name.length === 0) {
            window.UtilityFunctions.clearFieldError('customerName');
        } else if (name.length < 2) {
            window.UtilityFunctions.showFieldError('customerName', 'Name must be at least 2 characters long');
        } else {
            window.UtilityFunctions.clearFieldError('customerName');
        }
    }

    /**
     * Validate WhatsApp field in real-time
     */
    validateWhatsAppField() {
        const whatsappInput = document.getElementById('whatsappNumber');
        if (!whatsappInput) return;

        const whatsapp = whatsappInput.value.trim();
        
        if (whatsapp.length === 0) {
            window.UtilityFunctions.clearFieldError('whatsappNumber');
        } else {
            const whatsappRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!whatsappRegex.test(whatsapp.replace(/\s/g, ''))) {
                window.UtilityFunctions.showFieldError('whatsappNumber', 'Please enter a valid WhatsApp number');
            } else {
                window.UtilityFunctions.clearFieldError('whatsappNumber');
            }
        }
    }

    /**
     * Set form loading state
     * @param {boolean} loading - Loading state
     */
    setFormLoading(loading) {
        const form = document.getElementById('leadForm');
        const submitButton = form ? form.querySelector('.submit-button') : null;
        const inputs = form ? form.querySelectorAll('input') : [];

        if (loading) {
            if (submitButton) {
                submitButton.textContent = 'Saving...';
                submitButton.disabled = true;
            }
            inputs.forEach(input => input.disabled = true);
            if (form) form.classList.add('loading');
        } else {
            if (submitButton) {
                submitButton.textContent = 'Claim Reward';
                submitButton.disabled = false;
            }
            inputs.forEach(input => input.disabled = false);
            if (form) form.classList.remove('loading');
        }
    }

    /**
     * Show success state after form submission
     */
    showSuccessState() {
        // Hide lead form
        const leadFormSection = document.getElementById('leadFormSection');
        if (leadFormSection) {
            window.UtilityFunctions.hideElement(leadFormSection);
        }

        // Show WhatsApp section
        const whatsappSection = document.getElementById('whatsappSection');
        if (whatsappSection) {
            window.UtilityFunctions.showElement(whatsappSection);
            window.UtilityFunctions.smoothScrollTo('whatsappSection', 100);
        }
    }

    /**
     * Handle WhatsApp share button click
     */
    handleWhatsAppShare() {
        try {
            if (!this.currentGameResult) {
                window.UtilityFunctions.showNotification('No game result available', 'error');
                return;
            }

            const whatsappURL = window.UtilityFunctions.generateWhatsAppURL(
                this.currentGameResult.reward,
                this.currentGameResult.code
            );

            // Open WhatsApp
            window.open(whatsappURL, '_blank');

            // Track event
            if (window.GameAnalytics) {
                window.GameAnalytics.trackEvent('whatsapp_share', {
                    reward: this.currentGameResult.reward,
                    game: this.currentGameResult.game
                });
            }

            window.UtilityFunctions.showNotification('Opening WhatsApp...', 'success');

        } catch (error) {
            window.UtilityFunctions.logError('handleWhatsAppShare', error);
            window.UtilityFunctions.showNotification('Failed to open WhatsApp', 'error');
        }
    }

    /**
     * Bind social media button events
     */
    bindSocialButtons() {
        const socialButtons = document.querySelectorAll('.social-button');
        
        socialButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const buttonText = event.target.textContent.toLowerCase();
                let platform = 'unknown';
                
                if (buttonText.includes('google')) platform = 'google';
                else if (buttonText.includes('instagram')) platform = 'instagram';
                else if (buttonText.includes('whatsapp')) platform = 'whatsapp';

                // Track social button click
                if (window.GameAnalytics) {
                    window.GameAnalytics.trackEvent('social_button_click', {
                        platform: platform
                    });
                }
            });
        });
    }

    /**
     * Handle window scroll for animations
     */
    handleScroll() {
        // Add scroll-based animations here if needed
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Example: Fade in elements as they come into view
        const elements = document.querySelectorAll('.game-card, .social-section');
        elements.forEach(element => {
            const elementTop = element.offsetTop;
            const elementHeight = element.offsetHeight;
            const windowHeight = window.innerHeight;
            
            if (scrollTop + windowHeight > elementTop + elementHeight / 4) {
                element.classList.add('fade-in');
            }
        });
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Adjust UI elements for different screen sizes
        const isMobile = window.UtilityFunctions.isMobileDevice();
        
        // Update game animations for mobile
        if (isMobile) {
            const spinWheel = document.getElementById('spinWheel');
            const scratchCard = document.getElementById('scratchCard');
            
            if (spinWheel) {
                spinWheel.style.width = '250px';
                spinWheel.style.height = '250px';
            }
            
            if (scratchCard) {
                scratchCard.style.width = '250px';
                scratchCard.style.height = '150px';
            }
        }
    }

    /**
     * Initialize UI elements
     */
    initializeUI() {
        // Add initial animations
        const header = document.querySelector('.header');
        if (header) {
            header.classList.add('fade-in');
        }

        // Set up intersection observer for scroll animations
        this.setupIntersectionObserver();

        // Initialize mobile-specific adjustments
        if (window.UtilityFunctions.isMobileDevice()) {
            document.body.classList.add('mobile-device');
        }
    }

    /**
     * Setup intersection observer for scroll animations
     */
    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe elements
        const elementsToObserve = document.querySelectorAll(
            '.game-card, .social-section, .lead-form-section'
        );
        
        elementsToObserve.forEach(element => {
            observer.observe(element);
        });
    }

    /**
     * Get current application state
     * @returns {Object} - Current state
     */
    getCurrentState() {
        return {
            formSubmitted: this.formSubmitted,
            currentGameResult: this.currentGameResult,
            timestamp: Date.now()
        };
    }

    /**
     * Reset application state
     */
    resetState() {
        this.currentGameResult = null;
        this.formSubmitted = false;
        
        // Reset UI
        window.UtilityFunctions.hideElement(document.getElementById('leadFormSection'));
        window.UtilityFunctions.hideElement(document.getElementById('whatsappSection'));
        window.UtilityFunctions.clearAllFormErrors();
        
        // Reset form
        const form = document.getElementById('leadForm');
        if (form) {
            form.reset();
        }
    }
}

/**
 * Copy reward code functionality
 */
function setupCopyCodeFeature() {
    const rewardCode = document.getElementById('rewardCode');
    if (rewardCode) {
        rewardCode.style.cursor = 'pointer';
        rewardCode.title = 'Click to copy code';
        
        rewardCode.addEventListener('click', async () => {
            const codeText = rewardCode.textContent.replace('Show this code at the store: ', '');
            const success = await window.UtilityFunctions.copyToClipboard(codeText);
            
            if (success) {
                window.UtilityFunctions.showNotification('Code copied to clipboard!', 'success');
            } else {
                window.UtilityFunctions.showNotification('Failed to copy code', 'error');
            }
        });
    }
}

/**
 * Initialize application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Create main controller instance
        const mainController = new MainController();
        
        // Setup additional features
        setupCopyCodeFeature();
        
        // Make controller globally accessible
        window.MainController = mainController;
        
        // Setup periodic state saving (for analytics)
        setInterval(() => {
            if (window.GameAnalytics) {
                const state = mainController.getCurrentState();
                window.GameAnalytics.trackEvent('periodic_state', state);
            }
        }, 60000); // Every minute

        console.log('Gamified Marketing Website initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        window.UtilityFunctions.showNotification('Application failed to load properly', 'error');
    }
});

/**
 * Handle page visibility changes
 */
document.addEventListener('visibilitychange', () => {
    if (window.GameAnalytics) {
        window.GameAnalytics.trackEvent('visibility_change', {
            hidden: document.hidden,
            timestamp: Date.now()
        });
    }
});

/**
 * Handle page unload
 */
window.addEventListener('beforeunload', () => {
    if (window.GameAnalytics) {
        const analytics = window.GameAnalytics.getAnalytics();
        console.log('Session Analytics:', analytics);
    }
});

/**
 * Error handling for uncaught errors
 */
window.addEventListener('error', (event) => {
    window.UtilityFunctions.logError('uncaught_error', event.error);
    
    if (window.GameAnalytics) {
        window.GameAnalytics.trackEvent('javascript_error', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        });
    }
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
    window.UtilityFunctions.logError('unhandled_promise_rejection', event.reason);
    
    if (window.GameAnalytics) {
        window.GameAnalytics.trackEvent('promise_rejection', {
            reason: event.reason ? event.reason.toString() : 'Unknown'
        });
    }
});

// Export for global access
window.MainApp = {
    resetState: () => window.MainController ? window.MainController.resetState() : null,
    getCurrentState: () => window.MainController ? window.MainController.getCurrentState() : null
};
