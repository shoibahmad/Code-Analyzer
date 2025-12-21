# Firebase Firestore Setup Instructions

## 🔥 Firebase Console Configuration Required

To enable the full functionality of user history and dashboard, you need to configure Firestore in your Firebase Console.

### Step 1: Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **code-analyzer-9d4e7**
3. In the left sidebar, click on **Firestore Database**
4. Click **Create database**
5. Choose **Start in production mode** (we'll add security rules next)
6. Select a Cloud Firestore location (choose the closest to your users)
7. Click **Enable**

### Step 2: Set Up Security Rules

Once Firestore is enabled, go to the **Rules** tab and replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can only read/write their own document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Analyses collection - users can only read/write their own analyses
    match /analyses/{analysisId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

Click **Publish** to save the rules.

### Step 3: Enable Authentication Providers

1. Go to **Authentication** → **Sign-in method**
2. Enable the following providers:
   - ✅ **Email/Password**
   - ✅ **Google** (Add your OAuth client ID if needed)
   - ✅ **GitHub** (Add your GitHub OAuth app credentials)

3. Add **Authorized domains**:
   - `localhost`
   - `127.0.0.1`
   - Any custom domain you're using

### Step 4: Firestore Collections Structure

The app will automatically create these collections:

#### **users** collection
```json
{
  "userId": "string (document ID)",
  "displayName": "string",
  "email": "string",
  "photoURL": "string (optional)",
  "createdAt": "timestamp",
  "totalAnalyses": "number",
  "lastLogin": "timestamp"
}
```

#### **analyses** collection
```json
{
  "userId": "string",
  "language": "string",
  "codeSnippet": "string (first 500 chars)",
  "mlQuality": "string (e.g., '8/10')",
  "aiQuality": "string (e.g., '9/10')",
  "bugsCount": "number",
  "securityCount": "number",
  "timestamp": "timestamp",
  "analysisTime": "number (seconds)"
}
```

## ✨ Features Enabled

Once Firestore is configured, users will have:

1. **Persistent History**: Analysis history saved to cloud, accessible from any device
2. **User Dashboard**: Real-time stats showing:
   - Total analyses performed
   - Average quality score
   - Total issues detected
   - Recent activity list

3. **User Profile**: Display name shown on dashboard
4. **Cross-Device Sync**: History syncs across all devices when logged in

## 🚀 Testing

After setup:

1. **Refresh your browser** (Ctrl+F5)
2. **Log in** with your account
3. **Analyze some code**
4. **Check the Dashboard** - you should see:
   - Your name: "Welcome Back, [Your Name]!"
   - Updated statistics
   - Recent analysis history

5. **Verify in Firebase Console**:
   - Go to Firestore Database
   - You should see `users` and `analyses` collections with data

## 🔧 Troubleshooting

If dashboard doesn't update:
- Check browser console (F12) for errors
- Verify Firestore is enabled in Firebase Console
- Check security rules are published
- Ensure you're logged in (check for user icon/name)

If authentication fails:
- Verify authorized domains in Firebase Console
- Check that auth providers are enabled
- Clear browser cache and try again
