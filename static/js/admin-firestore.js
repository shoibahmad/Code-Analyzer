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
        // Load all analyses
        const analysesRef = collection(db, 'analyses');
        const q = query(analysesRef, orderBy('timestamp', 'desc'), limit(1000));
        const querySnapshot = await getDocs(q);

        const history = [];
        const userIds = new Set();

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            history.push({
                id: doc.id,
                timestamp: data.timestamp?.toDate ? data.timestamp.toDate().getTime() : Date.now(),
                language: data.language || 'Unknown',
                mlScore: data.mlQuality || 'N/A',
                aiScore: data.aiQuality || 'N/A',
                stats: {
                    bugs: data.bugsCount || 0,
                    security: data.securityCount || 0
                },
                userId: data.userId
            });

            if (data.userId) {
                userIds.add(data.userId);
            }
        });

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

        return {
            success: false,
            error: error.message
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
