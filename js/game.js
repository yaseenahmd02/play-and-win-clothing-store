// Game Logic for Gamified Marketing Website
// Handles Spin & Win and Scratch & Win games

/**
 * Game Controller Class
 */
class GameController {
    constructor() {
        this.currentGame = null;
        this.gameResult = null;
        this.isPlaying = false;
        this.initializeEventListeners();
    }

    /**
     * Initialize event listeners for game buttons
     */
    initializeEventListeners() {
        // Spin & Win button
        const spinButton = document.querySelector('.spin-button');
        if (spinButton) {
            spinButton.addEventListener('click', () => this.startSpinGame());
        }

        // Scratch & Win button
        const scratchButton = document.querySelector('.scratch-button');
        if (scratchButton) {
            scratchButton.addEventListener('click', () => this.startScratchGame());
        }

        // Scratch card interaction
        const scratchOverlay = document.getElementById('scratchOverlay');
        if (scratchOverlay) {
            scratchOverlay.addEventListener('click', () => this.performScratch());
        }
    }

    /**
     * Start Spin & Win game
     */
    async startSpinGame() {
        if (this.isPlaying) return;

        try {
            this.isPlaying = true;
            this.currentGame = 'Spin & Win';

            // Show game animation area
            this.showGameArea();
            this.hideGameCards();

            // Show spin wheel, hide scratch card
            document.getElementById('spinWheel').style.display = 'block';
            document.getElementById('scratchCard').style.display = 'none';

            // Get game settings and determine reward
            const gameSettings = window.GameDB.getGameSettings('spinGame');
            const reward = this.selectRandomReward(gameSettings ? gameSettings.rewards : this.getDefaultSpinRewards());

            // Animate spin
            await this.animateSpin();

            // Generate unique code
            const code = this.generateUniqueRewardCode();

            // Store result
            this.gameResult = {
                game: this.currentGame,
                reward: reward.text,
                code: code
            };

            // Show result
            this.showGameResult();

        } catch (error) {
            window.UtilityFunctions.logError('startSpinGame', error);
            window.UtilityFunctions.showNotification('Game error occurred. Please try again.', 'error');
        } finally {
            this.isPlaying = false;
        }
    }

    /**
     * Start Scratch & Win game
     */
    async startScratchGame() {
        if (this.isPlaying) return;

        try {
            this.isPlaying = true;
            this.currentGame = 'Scratch & Win';

            // Show game animation area
            this.showGameArea();
            this.hideGameCards();

            // Show scratch card, hide spin wheel
            document.getElementById('scratchCard').style.display = 'block';
            document.getElementById('spinWheel').style.display = 'none';

            // Reset scratch card
            this.resetScratchCard();

            // Get game settings and determine reward
            const gameSettings = window.GameDB.getGameSettings('scratchGame');
            const reward = this.selectRandomReward(gameSettings ? gameSettings.rewards : this.getDefaultScratchRewards());

            // Set the reward in the scratch result
            document.getElementById('scratchRewardText').textContent = reward.text;

            // Generate unique code
            const code = this.generateUniqueRewardCode();

            // Store result
            this.gameResult = {
                game: this.currentGame,
                reward: reward.text,
                code: code
            };

            // Show instruction
            window.UtilityFunctions.showNotification('Click on the scratch card to reveal your prize!', 'info');

        } catch (error) {
            window.UtilityFunctions.logError('startScratchGame', error);
            window.UtilityFunctions.showNotification('Game error occurred. Please try again.', 'error');
        } finally {
            this.isPlaying = false;
        }
    }

    /**
     * Animate the spin wheel
     * @returns {Promise} - Promise that resolves when animation completes
     */
    animateSpin() {
        return new Promise((resolve) => {
            const wheel = document.querySelector('.wheel-segments');
            if (!wheel) {
                resolve();
                return;
            }

            // Add spinning class
            wheel.classList.add('spinning');

            // Remove class and resolve after animation
            setTimeout(() => {
                wheel.classList.remove('spinning');
                resolve();
            }, 3000); // 3 seconds spin duration
        });
    }

    /**
     * Perform scratch action
     */
    performScratch() {
        const overlay = document.getElementById('scratchOverlay');
        if (!overlay || this.isPlaying) return;

        // Add scratching animation
        overlay.classList.add('scratching');

        // Remove overlay after animation
        setTimeout(() => {
            overlay.style.display = 'none';
            this.showGameResult();
        }, 2000); // 2 seconds scratch animation
    }

    /**
     * Reset scratch card to initial state
     */
    resetScratchCard() {
        const overlay = document.getElementById('scratchOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.classList.remove('scratching');
        }
    }

    /**
     * Select random reward based on probabilities
     * @param {Array} rewards - Array of reward objects with probabilities
     * @returns {Object} - Selected reward
     */
    selectRandomReward(rewards) {
        try {
            if (!rewards || !rewards.length) {
                return { text: 'No Win', probability: 1 };
            }

            // Calculate total probability (should be 1.0, but handle edge cases)
            const totalProbability = rewards.reduce((sum, reward) => sum + reward.probability, 0);
            
            // Generate random number
            const random = Math.random() * totalProbability;
            
            // Select reward based on probability
            let cumulativeProbability = 0;
            for (const reward of rewards) {
                cumulativeProbability += reward.probability;
                if (random <= cumulativeProbability) {
                    return reward;
                }
            }

            // Fallback to last reward
            return rewards[rewards.length - 1];
        } catch (error) {
            window.UtilityFunctions.logError('selectRandomReward', error);
            return { text: 'No Win', probability: 1 };
        }
    }

    /**
     * Generate unique reward code
     * @returns {string} - Unique reward code
     */
    generateUniqueRewardCode() {
        let code;
        let attempts = 0;
        const maxAttempts = 10;

        do {
            code = window.UtilityFunctions.generateUniqueCode(8);
            attempts++;
        } while (!window.GameDB.isCodeUnique(code) && attempts < maxAttempts);

        return code;
    }

    /**
     * Show game animation area
     */
    showGameArea() {
        const gameArea = document.getElementById('gameAnimationArea');
        if (gameArea) {
            window.UtilityFunctions.showElement(gameArea);
        }
    }

    /**
     * Hide game selection cards
     */
    hideGameCards() {
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach(card => {
            card.style.opacity = '0.5';
            card.style.pointerEvents = 'none';
        });
    }

    /**
     * Show game selection cards
     */
    showGameCards() {
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach(card => {
            card.style.opacity = '1';
            card.style.pointerEvents = 'auto';
        });
    }

    /**
     * Show game result
     */
    showGameResult() {
        if (!this.gameResult) return;

        const resultContainer = document.getElementById('gameResult');
        const resultMessage = document.getElementById('resultMessage');
        const rewardCode = document.getElementById('rewardCode');

        if (resultContainer && resultMessage && rewardCode) {
            // Set result message
            if (this.gameResult.reward === 'No Win') {
                resultMessage.textContent = '😔 Better luck next time!';
                resultMessage.style.color = '#6b7280';
                rewardCode.style.display = 'none';
            } else {
                resultMessage.textContent = `🎉 You won ${this.gameResult.reward}!`;
                resultMessage.style.color = '#10b981';
                rewardCode.textContent = `Show this code at the store: ${this.gameResult.code}`;
                rewardCode.style.display = 'block';
            }

            // Show result container
            window.UtilityFunctions.showElement(resultContainer);

            // Show lead form if won
            if (this.gameResult.reward !== 'No Win') {
                setTimeout(() => {
                    this.showLeadForm();
                }, 2000);
            } else {
                // Show play again option
                setTimeout(() => {
                    this.showPlayAgainOption();
                }, 3000);
            }
        }
    }

    /**
     * Show lead collection form
     */
    showLeadForm() {
        const leadFormSection = document.getElementById('leadFormSection');
        if (leadFormSection) {
            window.UtilityFunctions.showElement(leadFormSection);
            window.UtilityFunctions.smoothScrollTo('leadFormSection', 100);
        }
    }

    /**
     * Show play again option
     */
    showPlayAgainOption() {
        this.showGameCards();
        
        // Add play again button
        const resultContainer = document.getElementById('gameResult');
        if (resultContainer && !resultContainer.querySelector('.play-again-button')) {
            const playAgainButton = document.createElement('button');
            playAgainButton.className = 'play-again-button cta-button';
            playAgainButton.textContent = 'Play Again';
            playAgainButton.style.marginTop = '1rem';
            playAgainButton.addEventListener('click', () => this.resetGame());
            
            resultContainer.appendChild(playAgainButton);
        }
    }

    /**
     * Reset game to initial state
     */
    resetGame() {
        // Hide all game sections
        window.UtilityFunctions.hideElement(document.getElementById('gameAnimationArea'));
        window.UtilityFunctions.hideElement(document.getElementById('gameResult'));
        window.UtilityFunctions.hideElement(document.getElementById('leadFormSection'));
        window.UtilityFunctions.hideElement(document.getElementById('whatsappSection'));

        // Show game cards
        this.showGameCards();

        // Reset game state
        this.currentGame = null;
        this.gameResult = null;
        this.isPlaying = false;

        // Remove play again button
        const playAgainButton = document.querySelector('.play-again-button');
        if (playAgainButton) {
            playAgainButton.remove();
        }

        // Scroll to games section
        window.UtilityFunctions.smoothScrollTo('playWinSection', 100);
    }

    /**
     * Get current game result
     * @returns {Object} - Current game result
     */
    getCurrentGameResult() {
        return this.gameResult;
    }

    /**
     * Get default spin game rewards
     * @returns {Array} - Default rewards for spin game
     */
    getDefaultSpinRewards() {
        return [
            { text: '10% Off', probability: 0.25 },
            { text: '20% Off', probability: 0.15 },
            { text: 'Free Avil Milk', probability: 0.10 },
            { text: '5% Off', probability: 0.20 },
            { text: 'No Win', probability: 0.25 },
            { text: '15% Off', probability: 0.05 }
        ];
    }

    /**
     * Get default scratch game rewards
     * @returns {Array} - Default rewards for scratch game
     */
    getDefaultScratchRewards() {
        return [
            { text: '10% Off', probability: 0.20 },
            { text: '20% Off', probability: 0.10 },
            { text: 'Free Avil Milk', probability: 0.15 },
            { text: '5% Off', probability: 0.25 },
            { text: 'No Win', probability: 0.25 },
            { text: '15% Off', probability: 0.05 }
        ];
    }

    /**
     * Get game statistics for current session
     * @returns {Object} - Game statistics
     */
    getSessionStats() {
        return {
            currentGame: this.currentGame,
            hasResult: !!this.gameResult,
            isPlaying: this.isPlaying,
            lastResult: this.gameResult
        };
    }
}

/**
 * Game Analytics Class
 */
class GameAnalytics {
    constructor() {
        this.sessionStart = Date.now();
        this.events = [];
    }

    /**
     * Track game event
     * @param {string} eventType - Type of event
     * @param {Object} data - Event data
     */
    trackEvent(eventType, data = {}) {
        try {
            const event = {
                type: eventType,
                timestamp: Date.now(),
                sessionTime: Date.now() - this.sessionStart,
                data: data,
                userAgent: navigator.userAgent.substring(0, 50),
                screenSize: `${window.innerWidth}x${window.innerHeight}`
            };

            this.events.push(event);

            // Keep only last 100 events to prevent memory issues
            if (this.events.length > 100) {
                this.events = this.events.slice(-100);
            }

            console.log('Game Event:', event);
        } catch (error) {
            console.error('Failed to track event:', error);
        }
    }

    /**
     * Get session analytics
     * @returns {Object} - Analytics data
     */
    getAnalytics() {
        return {
            sessionDuration: Date.now() - this.sessionStart,
            totalEvents: this.events.length,
            events: this.events,
            gameStarts: this.events.filter(e => e.type === 'game_start').length,
            gameCompletions: this.events.filter(e => e.type === 'game_complete').length,
            wins: this.events.filter(e => e.type === 'game_win').length,
            formSubmissions: this.events.filter(e => e.type === 'form_submit').length
        };
    }
}

// Create global instances
const gameController = new GameController();
const gameAnalytics = new GameAnalytics();

// Track page load
gameAnalytics.trackEvent('page_load', {
    url: window.location.href,
    referrer: document.referrer
});

// Export for global access
window.GameController = gameController;
window.GameAnalytics = gameAnalytics;

// Export functions for backward compatibility
window.GameFunctions = {
    startSpinGame: () => gameController.startSpinGame(),
    startScratchGame: () => gameController.startScratchGame(),
    getCurrentResult: () => gameController.getCurrentGameResult(),
    resetGame: () => gameController.resetGame(),
    getSessionStats: () => gameController.getSessionStats(),
    trackEvent: (type, data) => gameAnalytics.trackEvent(type, data),
    getAnalytics: () => gameAnalytics.getAnalytics()
};

// Add event listeners for analytics
document.addEventListener('DOMContentLoaded', () => {
    // Track button clicks
    document.addEventListener('click', (event) => {
        if (event.target.matches('.game-button')) {
            gameAnalytics.trackEvent('game_start', {
                gameType: event.target.textContent.includes('Spin') ? 'spin' : 'scratch'
            });
        }
        
        if (event.target.matches('.social-button')) {
            gameAnalytics.trackEvent('social_click', {
                platform: event.target.textContent.toLowerCase()
            });
        }
    });

    // Track form interactions
    const leadForm = document.getElementById('leadForm');
    if (leadForm) {
        leadForm.addEventListener('submit', () => {
            gameAnalytics.trackEvent('form_submit', {
                gameResult: gameController.getCurrentGameResult()
            });
        });
    }
});

// Track page visibility changes
document.addEventListener('visibilitychange', () => {
    gameAnalytics.trackEvent('visibility_change', {
        hidden: document.hidden
    });
});

// Track page unload
window.addEventListener('beforeunload', () => {
    gameAnalytics.trackEvent('page_unload', {
        sessionDuration: Date.now() - gameAnalytics.sessionStart
    });
});
