import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    GithubAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    getFirestore,
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase App Config
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
const auth = getAuth(app);
const db = getFirestore(app);

// Export for use in other modules
window.firebaseAuth = auth;
window.firebaseDb = db;

// Auth State Observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        console.log("User logged in:", user.email);

        // Store user info globally
        window.currentUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            photoURL: user.photoURL
        };

        // Update dashboard with user name
        updateDashboardUserInfo();

        // Auto-initialize Firestore collections on first login
        setTimeout(() => {
            if (window.autoInitializeFirestore) {
                window.autoInitializeFirestore();
            }
        }, 1000);

        // Redirect to dashboard if on login page
        if (window.location.pathname === '/' || window.location.pathname === '/login') {
            window.location.href = '/dashboard';
        }
    } else {
        // User is signed out
        console.log("No user logged in");
        window.currentUser = null;

        // Redirect to login if not on login page
        if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
            window.location.href = '/';
        }
    }
});

// Update dashboard with user info
function updateDashboardUserInfo() {
    if (window.currentUser) {
        console.log('Updating dashboard with user:', window.currentUser.displayName);

        // Function to update elements
        const updateElements = () => {
            const userNameElements = document.querySelectorAll('.user-display-name');
            console.log('Found user name elements:', userNameElements.length);

            if (userNameElements.length > 0) {
                userNameElements.forEach(el => {
                    el.textContent = window.currentUser.displayName;
                    console.log('Updated element with name:', window.currentUser.displayName);
                });
                return true; // Success
            }
            return false; // Elements not found
        };

        // Try to update immediately
        if (!updateElements()) {
            // If failed, retry with delays
            let attempts = 0;
            const maxAttempts = 10;
            const retryInterval = setInterval(() => {
                attempts++;
                if (updateElements() || attempts >= maxAttempts) {
                    clearInterval(retryInterval);
                }
            }, 100);
        }

        // Load user's analysis history from Firestore
        if (typeof window.loadUserHistory === 'function') {
            window.loadUserHistory();
        }
    }
}

// Global function to update user name (can be called from anywhere)
window.updateUserName = function () {
    if (window.currentUser) {
        console.log('Updating user info for:', window.currentUser.email);

        // Update display names
        const userNameElements = document.querySelectorAll('.user-display-name');
        userNameElements.forEach(el => {
            el.textContent = window.currentUser.displayName;
        });

        // Function to update email display
        const updateEmailDisplay = () => {
            const headerEmail = document.getElementById('headerUserEmail');
            const headerEmailText = document.getElementById('headerEmailText');

            if (headerEmail && headerEmailText && window.currentUser.email) {
                headerEmailText.textContent = window.currentUser.email;
                headerEmail.style.display = 'flex';
                console.log('✅ Header email updated:', window.currentUser.email);
                return true;
            }
            return false;
        };

        // Function to update profile email
        const updateProfileEmail = () => {
            console.log('Attempting to update profile email...');
            const profileEmail = document.getElementById('userEmail');
            const profileEmailInfo = document.getElementById('userEmailInfo');
            let updated = false;

            console.log('Email update check:', {
                hasUserEmail: !!profileEmail,
                hasUserEmailInfo: !!profileEmailInfo,
                hasCurrentUser: !!window.currentUser,
                email: window.currentUser?.email
            });

            if (profileEmail && window.currentUser && window.currentUser.email) {
                profileEmail.textContent = window.currentUser.email;
                profileEmail.style.color = 'rgba(255, 255, 255, 0.95)';
                console.log('✅ Updated #userEmail to:', window.currentUser.email);
                updated = true;
            }

            if (profileEmailInfo && window.currentUser && window.currentUser.email) {
                profileEmailInfo.textContent = window.currentUser.email;
                console.log('✅ Updated #userEmailInfo to:', window.currentUser.email);
                updated = true;
            }

            if (!updated) {
                console.warn('⚠️ Could not update profile email - missing elements or user data');
            }

            return updated;
        };

        // Function to update profile avatar
        const updateProfileAvatar = () => {
            const profileAvatar = document.getElementById('profileAvatar');
            if (profileAvatar && window.currentUser.displayName) {
                const initial = window.currentUser.displayName.charAt(0).toUpperCase();
                profileAvatar.innerHTML = `<span style="font-size: 2rem; font-weight: 700;">${initial}</span>`;
                console.log('✅ Profile avatar updated');
                return true;
            }
            return false;
        };

        // Try to update immediately
        updateEmailDisplay();
        updateProfileEmail();
        updateProfileAvatar();

        // Retry with delays if elements not found
        let attempts = 0;
        const maxAttempts = 10;
        const retryInterval = setInterval(() => {
            attempts++;
            const emailUpdated = updateEmailDisplay();
            const profileUpdated = updateProfileEmail();
            const avatarUpdated = updateProfileAvatar();

            if ((emailUpdated && profileUpdated && avatarUpdated) || attempts >= maxAttempts) {
                clearInterval(retryInterval);
                if (attempts >= maxAttempts) {
                    console.warn('⚠️ Some elements could not be updated after', maxAttempts, 'attempts');
                }
            }
        }, 200);
    }
};

// Call on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => window.updateUserName && window.updateUserName(), 100);
    });
} else {
    setTimeout(() => window.updateUserName && window.updateUserName(), 100);
}

// Test function to manually show email (for debugging)
window.testShowEmail = function () {
    const headerEmail = document.getElementById('headerUserEmail');
    const headerEmailText = document.getElementById('headerEmailText');

    if (headerEmail && headerEmailText) {
        if (window.currentUser && window.currentUser.email) {
            headerEmailText.textContent = window.currentUser.email;
        } else {
            headerEmailText.textContent = 'test@example.com';
        }
        headerEmail.style.display = 'flex';
        console.log('✅ Email display shown');
    } else {
        console.log('❌ Email elements not found');
    }
};

// Error Message Mapping
const getFriendlyErrorMessage = (error) => {
    const code = error.code || '';
    const msg = error.message || '';

    if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
        return "This domain is not authorized. Please add it to 'Authorized Domains' in your Firebase Console.";
    }
    if (code === 'auth/popup-closed-by-user') {
        return "Sign-in popup was closed before completing.";
    }
    if (code === 'auth/invalid-email') {
        return "Please enter a valid email address.";
    }
    if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        return "Invalid email or password.";
    }
    if (code === 'auth/email-already-in-use') {
        return "An account with this email already exists.";
    }
    if (code === 'auth/weak-password') {
        return "Password should be at least 6 characters.";
    }

    // Default: Clean up the raw Firebase message
    return msg.replace('Firebase: ', '').replace(/\(auth\/.*\)\.?/, '').trim();
};

// Error Handling Helper
const showError = (elementId, error) => {
    // Determine message
    const message = typeof error === 'string' ? error : getFriendlyErrorMessage(error);

    const el = document.getElementById(elementId);
    if (!el) return;

    const span = el.querySelector('span');
    if (span) span.textContent = message;

    el.classList.add('visible');
    setTimeout(() => el.classList.remove('visible'), 5000);
};

// Loading Spinner Helper
const showLoadingSpinner = (show = true) => {
    const spinner = document.getElementById('authLoadingSpinner');
    if (spinner) {
        spinner.style.display = show ? 'flex' : 'none';
    }
};

// Sign Up Handler
window.handleSignUp = async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    showLoadingSpinner(true);
    window.toast.info('Creating your account...', 'Please wait');

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Update profile with display name
        await updateProfile(userCredential.user, {
            displayName: name
        });

        // Create user document in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            displayName: name,
            email: email,
            createdAt: serverTimestamp(),
            totalAnalyses: 0
        });

        console.log("Created account for:", email);
        window.toast.success('Account created successfully! Redirecting...', 'Welcome');
    } catch (error) {
        showLoadingSpinner(false);
        showError('signup-error', error);
        window.toast.error(getFriendlyErrorMessage(error), 'Sign Up Failed');
    }
};

// Sign In Handler
window.handleSignIn = async (e) => {
    e.preventDefault();
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;

    showLoadingSpinner(true);
    window.toast.info('Signing you in...', 'Please wait');

    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.toast.success('Logged in successfully! Redirecting...', 'Welcome Back');
    } catch (error) {
        showLoadingSpinner(false);
        showError('signin-error', error);
        window.toast.error(getFriendlyErrorMessage(error), 'Login Failed');
        console.error(error);
    }
};

// Forgot Password Handler
window.handleForgotPass = async (e) => {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;
    const successEl = document.getElementById('forgot-success');

    try {
        await sendPasswordResetEmail(auth, email);
        successEl.classList.add('visible');
        setTimeout(() => successEl.classList.remove('visible'), 5000);
        window.toast.success('Password reset email sent!', 'Check your inbox');
    } catch (error) {
        showError('forgot-error', error);
    }
};

// Google Sign In
window.handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    showLoadingSpinner(true);
    window.toast.info('Opening Google Sign In...', 'Please wait');

    try {
        const result = await signInWithPopup(auth, provider);

        // Create/update user document
        await setDoc(doc(db, 'users', result.user.uid), {
            displayName: result.user.displayName,
            email: result.user.email,
            photoURL: result.user.photoURL,
            lastLogin: serverTimestamp()
        }, { merge: true });

        window.toast.success('Logged in with Google! Redirecting...', 'Welcome');
    } catch (error) {
        showLoadingSpinner(false);
        showError('signin-error', error);
        if (error.code !== 'auth/popup-closed-by-user') {
            window.toast.error(getFriendlyErrorMessage(error), 'Google Sign In Failed');
        }
    }
};

// GitHub Sign In
window.handleGithubSignIn = async () => {
    const provider = new GithubAuthProvider();
    showLoadingSpinner(true);
    window.toast.info('Opening GitHub Sign In...', 'Please wait');

    try {
        const result = await signInWithPopup(auth, provider);

        // Create/update user document
        await setDoc(doc(db, 'users', result.user.uid), {
            displayName: result.user.displayName || result.user.email.split('@')[0],
            email: result.user.email,
            photoURL: result.user.photoURL,
            lastLogin: serverTimestamp()
        }, { merge: true });

        window.toast.success('Logged in with GitHub! Redirecting...', 'Welcome');
    } catch (error) {
        showLoadingSpinner(false);
        showError('signin-error', error);
        if (error.code !== 'auth/popup-closed-by-user') {
            window.toast.error(getFriendlyErrorMessage(error), 'GitHub Sign In Failed');
        }
    }
};

// Save analysis to Firestore
window.saveAnalysisToFirestore = async (code, language, analysisData) => {
    if (!window.currentUser) {
        console.error('No user logged in');
        return;
    }

    try {
        const analysisDoc = {
            userId: window.currentUser.uid,
            language: language,
            codeSnippet: code.substring(0, 500), // Store first 500 chars
            mlQuality: analysisData.ml_analysis?.overall_quality || 'N/A',
            aiQuality: analysisData.ai_analysis?.overall_quality || 'N/A',
            bugsCount: (analysisData.ml_analysis?.bugs?.length || 0) + (analysisData.ai_analysis?.bugs?.length || 0),
            securityCount: (analysisData.ml_analysis?.security?.length || 0) + (analysisData.ai_analysis?.security?.length || 0),
            timestamp: serverTimestamp(),
            analysisTime: analysisData.analysis_time || 0
        };

        await addDoc(collection(db, 'analyses'), analysisDoc);
        console.log('Analysis saved to Firestore');

        // Reload history
        if (typeof loadUserHistory === 'function') {
            loadUserHistory();
        }
    } catch (error) {
        console.error('Error saving analysis:', error);
        console.error('Error details:', error.code, error.message);

        // Show user-friendly error
        if (error.code === 'permission-denied') {
            window.toast.error('Please enable Firestore in Firebase Console', 'Permission Denied');
        } else if (error.code === 'unavailable') {
            window.toast.error('Firestore is not available. Check your setup.', 'Service Unavailable');
        } else {
            window.toast.error('Failed to save analysis to cloud', 'Save Error');
        }
    }
};

// Initialize Firestore collections (call this once to create collections)
let firestoreInitialized = false;

window.initializeFirestoreCollections = async () => {
    if (!window.currentUser) {
        console.log('Please log in first');
        return;
    }

    // Prevent multiple initializations
    if (firestoreInitialized) {
        console.log('Firestore already initialized, skipping...');
        return;
    }

    try {
        console.log('Initializing Firestore collections...');

        // Create a test user document
        await setDoc(doc(db, 'users', window.currentUser.uid), {
            displayName: window.currentUser.displayName,
            email: window.currentUser.email,
            createdAt: serverTimestamp(),
            totalAnalyses: 0,
            lastLogin: serverTimestamp()
        }, { merge: true });

        console.log('✅ Users collection created/updated');

        // Create a test analysis document ONLY if none exist
        const analysesRef = collection(db, 'analyses');
        const q = query(analysesRef, where('userId', '==', window.currentUser.uid), where('isTest', '==', true));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            await addDoc(collection(db, 'analyses'), {
                userId: window.currentUser.uid,
                language: 'javascript',
                codeSnippet: '// Test analysis',
                mlQuality: 'N/A',
                aiQuality: 'N/A',
                bugsCount: 0,
                securityCount: 0,
                timestamp: serverTimestamp(),
                analysisTime: 0,
                isTest: true
            });
            console.log('✅ Test analysis document created');
        } else {
            console.log('✅ Test analysis already exists, skipping');
        }

        console.log('✅ Analyses collection created');
        console.log('✅ Firestore collections initialized successfully!');

        window.toast.success('Firestore collections created successfully!', 'Setup Complete');

        return true;
    } catch (error) {
        console.error('❌ Error initializing Firestore:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);

        if (error.code === 'permission-denied') {
            window.toast.error(
                'Firestore is not enabled or security rules are blocking access. Please check Firebase Console.',
                'Permission Denied'
            );
            console.log('📋 To fix this:');
            console.log('1. Go to Firebase Console');
            console.log('2. Enable Firestore Database');
            console.log('3. Set security rules (see FIREBASE_SETUP.md)');
        } else {
            window.toast.error('Failed to initialize Firestore: ' + error.message, 'Initialization Error');
        }

        return false;
    }
};

// Auto-initialize on first login
window.autoInitializeFirestore = async () => {
    if (window.currentUser && !firestoreInitialized) {
        firestoreInitialized = true;
        console.log('Auto-initializing Firestore...');
        await window.initializeFirestoreCollections();
    }
};

// Load user history from Firestore
window.loadUserHistory = async () => {
    if (!window.currentUser) return;

    try {
        const q = query(
            collection(db, 'analyses'),
            where('userId', '==', window.currentUser.uid),
            orderBy('timestamp', 'desc'),
            limit(20)
        );

        const querySnapshot = await getDocs(q);
        const history = [];

        querySnapshot.forEach((doc) => {
            history.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Update dashboard with history
        if (window.features && window.features.updateDashboardWithFirestore) {
            window.features.updateDashboardWithFirestore(history);
        }

        return history;
    } catch (error) {
        console.error('Error loading history:', error);
        return [];
    }
};
