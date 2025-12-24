/**
 * Firebase & Firestore Diagnostic Tool
 * 
 * Run this in the browser console to diagnose Firestore connection issues
 * Usage: Copy and paste this entire file into the browser console
 */

(async function firebaseDiagnostics() {
    console.log('🔍 ========================================');
    console.log('🔍 FIREBASE & FIRESTORE DIAGNOSTICS');
    console.log('🔍 ========================================\n');

    // 1. Check Firebase Initialization
    console.log('1️⃣ Checking Firebase Initialization...');
    console.log('  Firebase App:', window.firebaseAuth?.app ? '✅ Initialized' : '❌ Not initialized');
    console.log('  Firebase Auth:', window.firebaseAuth ? '✅ Available' : '❌ Not available');
    console.log('  Firestore DB:', window.firebaseDb ? '✅ Available' : '❌ Not available');
    console.log('  window.db:', window.db ? '✅ Available' : '❌ Not available');
    console.log('');

    // 2. Check User Authentication
    console.log('2️⃣ Checking User Authentication...');
    if (window.currentUser) {
        console.log('  ✅ User is logged in');
        console.log('    - UID:', window.currentUser.uid);
        console.log('    - Email:', window.currentUser.email);
        console.log('    - Display Name:', window.currentUser.displayName);
    } else {
        console.log('  ❌ No user logged in');
        console.log('  ⚠️  You must be logged in to access Firestore data');
        return;
    }
    console.log('');

    // 3. Check Firestore Connection
    console.log('3️⃣ Checking Firestore Connection...');
    if (!window.db) {
        console.log('  ❌ Firestore not initialized');
        return;
    }

    try {
        console.log('  ✅ Firestore instance exists');
        console.log('    - App Name:', window.db.app.name);
        console.log('    - Type:', window.db.type);
    } catch (error) {
        console.log('  ❌ Error accessing Firestore:', error.message);
    }
    console.log('');

    // 4. Test Firestore Read Access
    console.log('4️⃣ Testing Firestore Read Access...');
    try {
        const { collection, getDocs, query, where, limit } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        console.log('  Testing query to "analyses" collection...');
        const q = query(
            collection(window.db, 'analyses'),
            where('userId', '==', window.currentUser.uid),
            limit(1)
        );

        const snapshot = await getDocs(q);
        console.log('  ✅ Query successful!');
        console.log('    - Documents found:', snapshot.size);

        if (snapshot.size > 0) {
            console.log('    - Sample document:');
            snapshot.forEach(doc => {
                console.log('      ID:', doc.id);
                console.log('      Data:', doc.data());
            });
        } else {
            console.log('    ⚠️  No documents found for this user');
            console.log('    This is normal if you haven\'t analyzed any code yet');
        }
    } catch (error) {
        console.log('  ❌ Query failed!');
        console.log('    - Error code:', error.code);
        console.log('    - Error message:', error.message);
        console.log('');

        // Provide specific solutions
        if (error.code === 'permission-denied') {
            console.log('  🔒 PERMISSION DENIED');
            console.log('  This means Firestore security rules are blocking access.');
            console.log('');
            console.log('  📋 SOLUTION:');
            console.log('  1. Go to Firebase Console: https://console.firebase.google.com/');
            console.log('  2. Select project: code-analyzer-9d4e7');
            console.log('  3. Navigate to Firestore Database → Rules');
            console.log('  4. Deploy the security rules from firestore.rules file');
            console.log('  5. Or run: firebase deploy --only firestore:rules');
        } else if (error.code === 'failed-precondition') {
            console.log('  📋 MISSING INDEX');
            console.log('  This query requires a composite index.');
            console.log('');
            console.log('  📋 SOLUTION:');
            console.log('  1. Deploy indexes: firebase deploy --only firestore:indexes');
            console.log('  2. Or click the link in the error to auto-create the index');
        } else if (error.code === 'unavailable') {
            console.log('  🌐 SERVICE UNAVAILABLE');
            console.log('  Cannot connect to Firestore servers.');
            console.log('');
            console.log('  📋 SOLUTION:');
            console.log('  1. Check your internet connection');
            console.log('  2. Check Firebase status: https://status.firebase.google.com/');
            console.log('  3. Verify your deployment allows outbound connections');
        }
    }
    console.log('');

    // 5. Check Environment
    console.log('5️⃣ Checking Environment...');
    console.log('  Current URL:', window.location.href);
    console.log('  Protocol:', window.location.protocol);
    console.log('  Hostname:', window.location.hostname);
    console.log('  Port:', window.location.port || '(default)');
    console.log('');

    // 6. Check for CORS Issues
    console.log('6️⃣ Checking for Potential Issues...');
    if (window.location.protocol === 'file:') {
        console.log('  ⚠️  Running from file:// protocol');
        console.log('  This may cause CORS issues. Use a web server instead.');
    } else {
        console.log('  ✅ Running from web server');
    }

    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        console.log('  ⚠️  Running on production domain:', window.location.hostname);
        console.log('  Make sure this domain is authorized in Firebase Console:');
        console.log('  Authentication → Settings → Authorized domains');
    } else {
        console.log('  ✅ Running on localhost');
    }
    console.log('');

    // 7. Summary
    console.log('🔍 ========================================');
    console.log('🔍 DIAGNOSTIC SUMMARY');
    console.log('🔍 ========================================');
    console.log('');
    console.log('If you see errors above, follow the solutions provided.');
    console.log('');
    console.log('Common fixes:');
    console.log('  1. Deploy security rules: firebase deploy --only firestore:rules');
    console.log('  2. Deploy indexes: firebase deploy --only firestore:indexes');
    console.log('  3. Add domain to authorized domains in Firebase Console');
    console.log('  4. Ensure user is authenticated before accessing Firestore');
    console.log('');
    console.log('For more help, see: FIREBASE_DEPLOYMENT_GUIDE.md');
    console.log('');
})();
