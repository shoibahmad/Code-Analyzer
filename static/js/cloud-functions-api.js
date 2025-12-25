/**
 * Firebase Cloud Functions API Client
 * This replaces direct Firestore access to avoid CSP conflicts
 */

// Your Firebase Cloud Functions base URL
// After deployment, replace with your actual URL
const FUNCTIONS_BASE_URL = 'https://us-central1-code-analyzer-9d4e7.cloudfunctions.net';

/**
 * Get all analytics data for admin dashboard
 * @returns {Promise<Object>} Analytics data
 */
export async function getAnalytics() {
    console.log('📊 Loading analytics from Cloud Functions...');

    try {
        const response = await fetch(`${FUNCTIONS_BASE_URL}/getAnalytics`);
        const result = await response.json();

        if (result.success) {
            console.log(`✅ Loaded ${result.data.totalAnalyses} analyses`);
            return {
                success: true,
                history: result.data.analyses,
                totalUsers: result.data.totalUsers
            };
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('❌ Error loading analytics:', error);

        // Fallback to localStorage
        console.log('⚠️ Falling back to localStorage...');
        const localHistory = JSON.parse(localStorage.getItem('analysisHistory') || '[]');

        return {
            success: false,
            error: error.message,
            history: localHistory,
            totalUsers: 0
        };
    }
}

/**
 * Get user's analysis history
 * @param {string} userId - User ID
 * @returns {Promise<Array>} User's analyses
 */
export async function getUserHistory(userId) {
    console.log(`📜 Loading history for user: ${userId}`);

    try {
        const response = await fetch(`${FUNCTIONS_BASE_URL}/getUserHistory?userId=${userId}`);
        const result = await response.json();

        if (result.success) {
            console.log(`✅ Loaded ${result.data.length} analyses`);
            return result.data;
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('❌ Error loading user history:', error);

        // Fallback to localStorage
        const localHistory = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
        return localHistory;
    }
}

/**
 * Save analysis to Firestore via Cloud Function
 * @param {Object} analysisData - Analysis data to save
 * @returns {Promise<Object>} Save result
 */
export async function saveAnalysis(analysisData) {
    console.log('💾 Saving analysis via Cloud Functions...');

    try {
        const response = await fetch(`${FUNCTIONS_BASE_URL}/saveAnalysis`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(analysisData)
        });

        const result = await response.json();

        if (result.success) {
            console.log('✅ Analysis saved successfully');
            return result;
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('❌ Error saving analysis:', error);

        // Fallback to localStorage
        console.log('⚠️ Saving to localStorage as fallback...');
        const history = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
        history.unshift({
            ...analysisData,
            id: Date.now().toString(),
            timestamp: Date.now()
        });
        localStorage.setItem('analysisHistory', JSON.stringify(history.slice(0, 100)));

        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get total users count
 * @returns {Promise<number>} Users count
 */
export async function getUsersCount() {
    try {
        const response = await fetch(`${FUNCTIONS_BASE_URL}/getUsersCount`);
        const result = await response.json();

        if (result.success) {
            return result.data.count;
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('❌ Error loading users count:', error);
        return 0;
    }
}

// Make functions available globally
window.cloudFunctions = {
    getAnalytics,
    getUserHistory,
    saveAnalysis,
    getUsersCount
};

console.log('✅ Cloud Functions API client loaded');
