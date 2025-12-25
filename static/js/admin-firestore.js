// Admin Analytics Firestore Integration
// This file loads analytics data from Firestore for the admin dashboard

import { getFirestore, collection, getDocs, query, orderBy, limit, where } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyC36NBZRx_94SLWszvvGN1CeLmOkzsFfko",
    authDomain: "code-analyzer-9d4e7.firebaseapp.com",
    projectId: "code-analyzer-9d4e7",
    storageBucket: "code-analyzer-9d4e7.firebasestorage.app",
    messagingSenderId: "482351514512",
    appId: "1:482351514512:web:22467addd5940df442a915",
    measurementId: "G-C2L66P6NDX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('🔥 Admin Firestore initialized');

// Load all analyses from Firestore
export async function loadFirestoreAnalytics() {
    console.log('📊 Loading admin analytics from Firestore...');

    try {
        // Load all analyses - removed orderBy to avoid index requirement
        const analysesRef = collection(db, 'analyses');
        const q = query(analysesRef, limit(1000));
        const querySnapshot = await getDocs(q);

        const history = [];
        const userIds = new Set();

        querySnapshot.forEach((doc) => {
            const data = doc.data();

            // Handle different quality score formats
            const mlScore = data.mlQuality || data.ml_quality || data.mlScore || 'N/A';
            const aiScore = data.aiQuality || data.ai_quality || data.aiScore || 'N/A';

            history.push({
                id: doc.id,
                timestamp: data.timestamp?.toDate ? data.timestamp.toDate().getTime() : Date.now(),
                language: data.language || 'Unknown',
                mlScore: mlScore,
                aiScore: aiScore,
                stats: {
                    bugs: data.bugsCount || data.bugs_count || 0,
                    security: data.securityCount || data.security_count || 0
                },
                userId: data.userId || data.user_id,
                analysisTime: data.analysisTime || data.analysis_time || 0
            });

            if (data.userId || data.user_id) {
                userIds.add(data.userId || data.user_id);
            }
        });

        // Sort by timestamp client-side
        history.sort((a, b) => b.timestamp - a.timestamp);

        console.log(`✅ Loaded ${history.length} analyses from Firestore`);
        console.log(`✅ Found ${userIds.size} unique users`);

        return {
            success: true,
            history,
            totalUsers: userIds.size
        };

    } catch (error) {
        console.error('❌ Error loading from Firestore:', error);
        console.error('  Error code:', error.code);
        console.error('  Error message:', error.message);

        // Fallback to localStorage if Firestore fails
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

// Load users count from Firestore
export async function loadUsersCount() {
    try {
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);
        return querySnapshot.size;
    } catch (error) {
        console.error('Error loading users count:', error);
        return 0;
    }
}

// Export db for use in other modules
window.adminFirestoreDb = db;
window.loadFirestoreAnalytics = loadFirestoreAnalytics;
window.loadUsersCount = loadUsersCount;
