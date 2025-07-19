// Database Management for Gamified Marketing Website
// Uses localStorage for demo purposes - can be replaced with Firebase or other backend

/**
 * Database class to handle all data operations
 */
class GameDatabase {
    constructor() {
        this.storageKey = 'gamified_marketing_data';
        this.adminKey = 'gamified_marketing_admin';
        this.initializeStorage();
    }

    /**
     * Initialize storage with default structure
     */
    initializeStorage() {
        try {
            if (!localStorage.getItem(this.storageKey)) {
                const initialData = {
                    gameResults: [],
                    settings: {
                        totalPlays: 0,
                        totalWins: 0,
                        lastUpdated: Date.now()
                    }
                };
                localStorage.setItem(this.storageKey, JSON.stringify(initialData));
            }

            // Initialize admin settings
            if (!localStorage.getItem(this.adminKey)) {
                const adminData = {
                    credentials: {
                        email: 'admin@example.com',
                        password: 'adminPass'
                    },
                    gameSettings: {
                        spinGame: {
                            enabled: true,
                            rewards: [
                                { text: '10% Off', probability: 0.25 },
                                { text: '20% Off', probability: 0.15 },
                                { text: 'Free Avil Milk', probability: 0.10 },
                                { text: '5% Off', probability: 0.20 },
                                { text: 'No Win', probability: 0.25 },
                                { text: '15% Off', probability: 0.05 }
                            ]
                        },
                        scratchGame: {
                            enabled: true,
                            rewards: [
                                { text: '10% Off', probability: 0.20 },
                                { text: '20% Off', probability: 0.10 },
                                { text: 'Free Avil Milk', probability: 0.15 },
                                { text: '5% Off', probability: 0.25 },
                                { text: 'No Win', probability: 0.25 },
                                { text: '15% Off', probability: 0.05 }
                            ]
                        }
                    }
                };
                localStorage.setItem(this.adminKey, JSON.stringify(adminData));
            }
        } catch (error) {
            console.error('Failed to initialize storage:', error);
            throw new Error('Storage initialization failed');
        }
    }

    /**
     * Get all data from storage
     * @returns {object} - Complete data object
     */
    getData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to get data:', error);
            return null;
        }
    }

    /**
     * Save data to storage
     * @param {object} data - Data to save
     * @returns {boolean} - Success status
     */
    saveData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to save data:', error);
            return false;
        }
    }

    /**
     * Get admin data
     * @returns {object} - Admin data
     */
    getAdminData() {
        try {
            const data = localStorage.getItem(this.adminKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to get admin data:', error);
            return null;
        }
    }

    /**
     * Save admin data
     * @param {object} adminData - Admin data to save
     * @returns {boolean} - Success status
     */
    saveAdminData(adminData) {
        try {
            localStorage.setItem(this.adminKey, JSON.stringify(adminData));
            return true;
        } catch (error) {
            console.error('Failed to save admin data:', error);
            return false;
        }
    }

    /**
     * Save game result
     * @param {object} gameResult - Game result data
     * @returns {boolean} - Success status
     */
    saveGameResult(gameResult) {
        try {
            const data = this.getData();
            if (!data) throw new Error('No data structure found');

            // Validate required fields
            const requiredFields = ['name', 'whatsapp', 'game', 'reward', 'code'];
            for (const field of requiredFields) {
                if (!gameResult[field]) {
                    throw new Error(`Missing required field: ${field}`);
                }
            }

            // Create complete game result object
            const completeResult = {
                id: this.generateId(),
                name: window.UtilityFunctions.sanitizeInput(gameResult.name),
                whatsapp: window.UtilityFunctions.sanitizeInput(gameResult.whatsapp),
                game: gameResult.game,
                reward: gameResult.reward,
                code: gameResult.code,
                claimed: false,
                timestamp: Date.now(),
                ipAddress: this.getClientIP(), // For tracking purposes
                userAgent: navigator.userAgent.substring(0, 100) // Truncated for storage
            };

            // Add to results array
            data.gameResults.push(completeResult);

            // Update statistics
            data.settings.totalPlays++;
            if (gameResult.reward !== 'No Win') {
                data.settings.totalWins++;
            }
            data.settings.lastUpdated = Date.now();

            // Save updated data
            return this.saveData(data);
        } catch (error) {
            console.error('Failed to save game result:', error);
            return false;
        }
    }

    /**
     * Get all game results
     * @param {object} filters - Optional filters
     * @returns {array} - Array of game results
     */
    getGameResults(filters = {}) {
        try {
            const data = this.getData();
            if (!data || !data.gameResults) return [];

            let results = [...data.gameResults];

            // Apply filters
            if (filters.game) {
                results = results.filter(result => result.game === filters.game);
            }

            if (filters.claimed !== undefined) {
                results = results.filter(result => result.claimed === filters.claimed);
            }

            if (filters.dateFrom) {
                results = results.filter(result => result.timestamp >= filters.dateFrom);
            }

            if (filters.dateTo) {
                results = results.filter(result => result.timestamp <= filters.dateTo);
            }

            if (filters.reward) {
                results = results.filter(result => result.reward.toLowerCase().includes(filters.reward.toLowerCase()));
            }

            // Sort by timestamp (newest first)
            results.sort((a, b) => b.timestamp - a.timestamp);

            return results;
        } catch (error) {
            console.error('Failed to get game results:', error);
            return [];
        }
    }

    /**
     * Update game result claimed status
     * @param {string} resultId - ID of the result to update
     * @param {boolean} claimed - New claimed status
     * @returns {boolean} - Success status
     */
    updateClaimedStatus(resultId, claimed) {
        try {
            const data = this.getData();
            if (!data || !data.gameResults) return false;

            const resultIndex = data.gameResults.findIndex(result => result.id === resultId);
            if (resultIndex === -1) return false;

            data.gameResults[resultIndex].claimed = claimed;
            data.gameResults[resultIndex].claimedAt = claimed ? Date.now() : null;
            data.settings.lastUpdated = Date.now();

            return this.saveData(data);
        } catch (error) {
            console.error('Failed to update claimed status:', error);
            return false;
        }
    }

    /**
     * Get game statistics
     * @returns {object} - Statistics object
     */
    getStatistics() {
        try {
            const data = this.getData();
            if (!data) return null;

            const results = data.gameResults || [];
            const totalPlays = results.length;
            const totalWins = results.filter(r => r.reward !== 'No Win').length;
            const totalClaimed = results.filter(r => r.claimed).length;

            // Game-specific stats
            const spinPlays = results.filter(r => r.game === 'Spin & Win').length;
            const scratchPlays = results.filter(r => r.game === 'Scratch & Win').length;

            // Recent activity (last 7 days)
            const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            const recentPlays = results.filter(r => r.timestamp >= weekAgo).length;

            return {
                totalPlays,
                totalWins,
                totalClaimed,
                winRate: totalPlays > 0 ? ((totalWins / totalPlays) * 100).toFixed(1) : 0,
                claimRate: totalWins > 0 ? ((totalClaimed / totalWins) * 100).toFixed(1) : 0,
                spinPlays,
                scratchPlays,
                recentPlays,
                lastUpdated: data.settings.lastUpdated
            };
        } catch (error) {
            console.error('Failed to get statistics:', error);
            return null;
        }
    }

    /**
     * Export data as CSV
     * @param {array} results - Results to export (optional, defaults to all)
     * @returns {string} - CSV string
     */
    exportToCSV(results = null) {
        try {
            const data = results || this.getGameResults();
            if (!data.length) return '';

            // CSV headers
            const headers = [
                'ID',
                'Name',
                'WhatsApp',
                'Game',
                'Reward',
                'Code',
                'Claimed',
                'Timestamp',
                'Date',
                'IP Address'
            ];

            // Convert data to CSV rows
            const rows = data.map(result => [
                result.id,
                `"${result.name}"`,
                result.whatsapp,
                `"${result.game}"`,
                `"${result.reward}"`,
                result.code,
                result.claimed ? 'Yes' : 'No',
                result.timestamp,
                `"${new Date(result.timestamp).toLocaleString()}"`,
                result.ipAddress || 'N/A'
            ]);

            // Combine headers and rows
            const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
            return csvContent;
        } catch (error) {
            console.error('Failed to export CSV:', error);
            return '';
        }
    }

    /**
     * Download CSV file
     * @param {string} filename - Name of the file
     * @param {array} results - Results to export (optional)
     */
    downloadCSV(filename = 'game_results.csv', results = null) {
        try {
            const csvContent = this.exportToCSV(results);
            if (!csvContent) {
                throw new Error('No data to export');
            }

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to download CSV:', error);
            return false;
        }
    }

    /**
     * Validate admin credentials
     * @param {string} email - Admin email
     * @param {string} password - Admin password
     * @returns {boolean} - Validation result
     */
    validateAdminCredentials(email, password) {
        try {
            const adminData = this.getAdminData();
            if (!adminData || !adminData.credentials) return false;

            return adminData.credentials.email === email && 
                   adminData.credentials.password === password;
        } catch (error) {
            console.error('Failed to validate credentials:', error);
            return false;
        }
    }

    /**
     * Get game settings
     * @param {string} gameType - Type of game ('spinGame' or 'scratchGame')
     * @returns {object} - Game settings
     */
    getGameSettings(gameType) {
        try {
            const adminData = this.getAdminData();
            if (!adminData || !adminData.gameSettings) return null;

            return adminData.gameSettings[gameType] || null;
        } catch (error) {
            console.error('Failed to get game settings:', error);
            return null;
        }
    }

    /**
     * Check if reward code is unique
     * @param {string} code - Code to check
     * @returns {boolean} - True if unique
     */
    isCodeUnique(code) {
        try {
            const results = this.getGameResults();
            return !results.some(result => result.code === code);
        } catch (error) {
            console.error('Failed to check code uniqueness:', error);
            return false;
        }
    }

    /**
     * Generate unique ID
     * @returns {string} - Unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Get client IP (placeholder - would need backend for real IP)
     * @returns {string} - Client IP or placeholder
     */
    getClientIP() {
        // In a real application, this would be handled by the backend
        return 'Client-Side';
    }

    /**
     * Clear all data (for testing purposes)
     * @returns {boolean} - Success status
     */
    clearAllData() {
        try {
            localStorage.removeItem(this.storageKey);
            this.initializeStorage();
            return true;
        } catch (error) {
            console.error('Failed to clear data:', error);
            return false;
        }
    }

    /**
     * Backup data to JSON file
     * @returns {boolean} - Success status
     */
    backupData() {
        try {
            const data = this.getData();
            const adminData = this.getAdminData();
            
            const backup = {
                gameData: data,
                adminData: adminData,
                backupDate: new Date().toISOString(),
                version: '1.0'
            };

            const blob = new Blob([JSON.stringify(backup, null, 2)], { 
                type: 'application/json' 
            });
            
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `game_backup_${Date.now()}.json`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('Failed to backup data:', error);
            return false;
        }
    }
}

// Create global database instance
const gameDB = new GameDatabase();

// Export for use in other files
window.GameDB = gameDB;

// Export individual functions for backward compatibility
window.DatabaseFunctions = {
    saveGameResult: (data) => gameDB.saveGameResult(data),
    getGameResults: (filters) => gameDB.getGameResults(filters),
    updateClaimedStatus: (id, status) => gameDB.updateClaimedStatus(id, status),
    getStatistics: () => gameDB.getStatistics(),
    exportToCSV: (results) => gameDB.exportToCSV(results),
    downloadCSV: (filename, results) => gameDB.downloadCSV(filename, results),
    validateAdminCredentials: (email, password) => gameDB.validateAdminCredentials(email, password),
    getGameSettings: (gameType) => gameDB.getGameSettings(gameType),
    isCodeUnique: (code) => gameDB.isCodeUnique(code),
    clearAllData: () => gameDB.clearAllData(),
    backupData: () => gameDB.backupData()
};
