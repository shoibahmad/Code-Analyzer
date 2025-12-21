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
        // Update user name in dashboard
        const userNameElements = document.querySelectorAll('.user-display-name');
        userNameElements.forEach(el => {
            el.textContent = window.currentUser.displayName;
        });

        // Load user's analysis history from Firestore
        if (typeof loadUserHistory === 'function') {
            loadUserHistory();
        }
    }
}

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

// Sign Up Handler
window.handleSignUp = async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

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
        window.toast.success('Account created successfully!', 'Welcome');
    } catch (error) {
        showError('signup-error', error);
    }
};

// Sign In Handler
window.handleSignIn = async (e) => {
    e.preventDefault();
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.toast.success('Logged in successfully!', 'Welcome Back');
    } catch (error) {
        showError('signin-error', error);
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
    try {
        const result = await signInWithPopup(auth, provider);

        // Create/update user document
        await setDoc(doc(db, 'users', result.user.uid), {
            displayName: result.user.displayName,
            email: result.user.email,
            photoURL: result.user.photoURL,
            lastLogin: serverTimestamp()
        }, { merge: true });

        window.toast.success('Logged in with Google!', 'Welcome');
    } catch (error) {
        showError('signin-error', error);
    }
};

// GitHub Sign In
window.handleGithubSignIn = async () => {
    const provider = new GithubAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);

        // Create/update user document
        await setDoc(doc(db, 'users', result.user.uid), {
            displayName: result.user.displayName || result.user.email.split('@')[0],
            email: result.user.email,
            photoURL: result.user.photoURL,
            lastLogin: serverTimestamp()
        }, { merge: true });

        window.toast.success('Logged in with GitHub!', 'Welcome');
    } catch (error) {
        showError('signin-error', error);
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
