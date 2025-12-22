# Firestore Email Fetching Issues - Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: Email Not Displaying from Firestore

**Symptoms:**
- User email not showing in header/profile
- Console shows "No user logged in" warnings
- Firestore queries failing silently

**Root Causes:**
1. `window.currentUser` not set before Firestore queries
2. Async timing issues - queries running before auth completes
3. Missing error handling in Firestore operations

**Solutions Applied:**

#### 1. Enhanced Error Handling in `loadUserHistory()`
```javascript
// Added comprehensive error logging
console.log('📊 Loading user history from Firestore for:', window.currentUser.email);
console.log(`✅ Loaded ${history.length} analyses from Firestore`);

// Added specific error messages for different error codes
if (error.code === 'permission-denied') {
    console.error('🔒 Permission denied - Check Firestore security rules');
}
```

#### 2. Fixed Function Reference Consistency
- Changed `loadUserHistory()` to `window.loadUserHistory()` throughout
- Ensures proper global scope access

#### 3. Added Null Checks
```javascript
if (!window.currentUser) {
    console.warn('⚠️ loadUserHistory: No user logged in');
    return [];
}
```

### Issue 2: Firestore Permission Errors

**Error Code:** `permission-denied`

**Firestore Security Rules Required:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Analyses collection
    match /analyses/{analysisId} {
      allow read, write: if request.auth != null && 
                           request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
                      request.auth.uid == request.resource.data.userId;
    }
  }
}
```

**How to Apply:**
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Click on "Rules" tab
4. Paste the above rules
5. Click "Publish"

### Issue 3: Missing Composite Index

**Error Code:** `failed-precondition`

**Required Index:**
- Collection: `analyses`
- Fields indexed:
  - `userId` (Ascending)
  - `timestamp` (Descending)

**How to Create:**
1. Firebase Console → Firestore Database
2. Click "Indexes" tab
3. Click "Create Index"
4. Set:
   - Collection ID: `analyses`
   - Field 1: `userId` (Ascending)
   - Field 2: `timestamp` (Descending)
5. Click "Create"

OR click the link in the error message - Firebase provides a direct link to create the index.

### Issue 4: User Email Not Updating in UI

**Current Implementation:**
The `updateUserName()` function in auth.js handles updating user info with retry logic:

```javascript
// Retries up to 10 times with 200ms intervals
const retryInterval = setInterval(() => {
    attempts++;
    const emailUpdated = updateEmailDisplay();
    const profileUpdated = updateProfileEmail();
    const avatarUpdated = updateProfileAvatar();
    
    if ((emailUpdated && profileUpdated && avatarUpdated) || attempts >= maxAttempts) {
        clearInterval(retryInterval);
    }
}, 200);
```

**If Still Not Working:**
1. Check browser console for specific errors
2. Verify `window.currentUser` is set: `console.log(window.currentUser)`
3. Check if elements exist: `console.log(document.getElementById('userEmail'))`
4. Manually trigger update: `window.updateUserName()`

## Debugging Steps

### Step 1: Check Authentication State
```javascript
// In browser console
console.log('Current User:', window.currentUser);
console.log('Firebase Auth:', window.firebaseAuth);
```

### Step 2: Test Firestore Connection
```javascript
// In browser console
window.loadUserHistory().then(history => {
    console.log('History loaded:', history);
}).catch(error => {
    console.error('Error:', error);
});
```

### Step 3: Check Firestore Rules
```javascript
// Try to read user document
const db = window.db || window.firebaseDb;
const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

const userDoc = await getDoc(doc(db, 'users', window.currentUser.uid));
console.log('User doc exists:', userDoc.exists());
console.log('User data:', userDoc.data());
```

### Step 4: Verify Email Display Elements
```javascript
// Check if elements exist
console.log('Header email:', document.getElementById('headerUserEmail'));
console.log('Header email text:', document.getElementById('headerEmailText'));
console.log('Profile email:', document.getElementById('userEmail'));
console.log('Profile email info:', document.getElementById('userEmailInfo'));
```

## Common Error Codes

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `permission-denied` | Firestore rules blocking access | Update security rules |
| `failed-precondition` | Missing composite index | Create index in Firebase Console |
| `unavailable` | Network/service issue | Check internet connection |
| `not-found` | Document doesn't exist | Initialize Firestore collections |
| `unauthenticated` | User not logged in | Ensure auth state is ready |

## Testing Checklist

- [ ] User can log in successfully
- [ ] `window.currentUser` is populated after login
- [ ] Email displays in header (desktop)
- [ ] Email displays in profile page
- [ ] Firestore queries complete without errors
- [ ] Analysis history loads from Firestore
- [ ] New analyses save to Firestore
- [ ] No console errors related to Firestore

## Quick Fixes

### Force Email Display
```javascript
// Run in browser console
if (window.currentUser) {
    document.querySelectorAll('.user-display-name').forEach(el => {
        el.textContent = window.currentUser.displayName;
    });
    const emailEl = document.getElementById('userEmail');
    if (emailEl) emailEl.textContent = window.currentUser.email;
}
```

### Reinitialize Firestore
```javascript
// Run in browser console
window.initializeFirestoreCollections();
```

### Clear and Reload
```javascript
// Clear localStorage and reload
localStorage.clear();
location.reload();
```

## Files Modified

1. **static/js/auth.js**
   - Enhanced `loadUserHistory()` with better error handling
   - Fixed function reference consistency
   - Added comprehensive logging
   - Exported `window.db` for global access

2. **static/js/firestore-integration.js**
   - Already has fallback to localStorage
   - Properly handles Firestore errors

## Next Steps if Issues Persist

1. **Check Firebase Console:**
   - Verify Firestore is enabled
   - Check security rules
   - Verify indexes are created
   - Check usage/quota limits

2. **Check Browser Console:**
   - Look for specific error messages
   - Check network tab for failed requests
   - Verify Firebase SDK is loading

3. **Test with Different User:**
   - Create new account
   - Try Google/GitHub sign-in
   - Check if issue is user-specific

4. **Verify Firebase Configuration:**
   - Check `firebaseConfig` in auth.js
   - Ensure API key is valid
   - Verify project ID matches

## Support Resources

- Firebase Documentation: https://firebase.google.com/docs/firestore
- Firestore Security Rules: https://firebase.google.com/docs/firestore/security/get-started
- Firebase Console: https://console.firebase.google.com/
