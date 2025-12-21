# 🚀 Render Deployment Guide for AI Code Analyzer

## Prerequisites
- GitHub account
- Render account (free tier available at https://render.com)
- Your code pushed to a GitHub repository

---

## 📋 Step-by-Step Deployment Instructions

### Step 1: Push Your Code to GitHub

1. Initialize git (if not already done):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Create a new repository on GitHub

3. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

---

### Step 2: Create Web Service on Render

1. Go to https://render.com and sign in
2. Click **"New +"** button → Select **"Web Service"**
3. Connect your GitHub repository
4. Click **"Connect"** next to your repository

---

### Step 3: Configure Your Web Service

Fill in the following values in the Render dashboard:

#### **Basic Settings**

| Field | Value |
|-------|-------|
| **Name** | `ai-code-analyzer` (or your preferred name) |
| **Region** | Choose closest to your location (e.g., `Oregon (US West)`) |
| **Branch** | `main` |
| **Root Directory** | Leave blank (or `.` if needed) |
| **Runtime** | `Python 3` |
| **Build Command** | `./build.sh` |
| **Start Command** | `gunicorn app:app` |

#### **Instance Type**
- Select: **Free** (for testing) or **Starter** (for production)

---

### Step 4: Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add the following environment variables:

| Key | Value | Notes |
|-----|-------|-------|
| `GEMINI_API_KEY` | `YOUR_GEMINI_API_KEY_HERE` | Get from https://makersuite.google.com/app/apikey |
| `SECRET_KEY` | `your-secret-key-here-make-it-random` | Generate a random string (min 32 chars) |
| `FLASK_ENV` | `production` | Production environment |
| `DEBUG` | `False` | Disable debug mode |
| `RATELIMIT_ENABLED` | `True` | Enable rate limiting |
| `CACHE_TYPE` | `SimpleCache` | Use simple cache |
| `LOG_LEVEL` | `INFO` | Logging level |
| `ALLOWED_ORIGINS` | `*` | CORS origins (use your domain in production) |

**Important Notes:**
- **GEMINI_API_KEY**: This is REQUIRED for AI analysis to work
  - Get it from: https://makersuite.google.com/app/apikey
  - Click "Create API Key" → Copy the key
  
- **SECRET_KEY**: Generate a secure random string
  - You can use: `python -c "import secrets; print(secrets.token_hex(32))"`

---

### Step 5: Firebase Configuration (Frontend)

Your Firebase credentials are already in the frontend JavaScript files. Make sure they're correct:

**File: `static/js/auth.js`** (Lines 28-36)

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyC36NBZRx_94SLWszvvGN1CeLmOkzsFfko",
    authDomain: "code-analyzer-9d4e7.firebaseapp.com",
    projectId: "code-analyzer-9d4e7",
    storageBucket: "code-analyzer-9d4e7.firebasestorage.app",
    messagingSenderId: "482351514512",
    appId: "1:482351514512:web:22467addd5940df442a915",
    measurementId: "G-C2L66P6NDX"
};
```

**Action Required:**
1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: `code-analyzer-9d4e7`
3. Go to **Project Settings** → **General**
4. Scroll to **"Your apps"** → **Web app**
5. Add your Render domain to **Authorized domains**:
   - Click **Authentication** → **Settings** → **Authorized domains**
   - Add: `your-app-name.onrender.com`

---

### Step 6: Deploy!

1. Click **"Create Web Service"** at the bottom
2. Render will automatically:
   - Clone your repository
   - Run `build.sh` to install dependencies
   - Start your app with `gunicorn`

**Deployment will take 5-10 minutes**

---

## 📊 Monitoring Your Deployment

### Check Build Logs
- Go to your service dashboard
- Click **"Logs"** tab
- Watch for:
  - ✅ "Build completed successfully!"
  - ✅ "ML model loaded successfully"
  - ✅ "Gemini AI configured successfully"

### Test Your App
Once deployed, your app will be available at:
```
https://your-app-name.onrender.com
```

---

## 🔧 Post-Deployment Configuration

### 1. Update Firebase Authorized Domains

1. Go to Firebase Console
2. **Authentication** → **Settings** → **Authorized domains**
3. Click **"Add domain"**
4. Add: `your-app-name.onrender.com`
5. Click **"Add"**

### 2. Update CORS Settings (if needed)

If you want to restrict CORS to your domain only:

1. Go to Render dashboard
2. **Environment** → Edit `ALLOWED_ORIGINS`
3. Change from `*` to: `https://your-app-name.onrender.com`
4. Save changes (will trigger redeploy)

---

## 🎯 Quick Reference: All Values You Need

### Render Web Service Configuration

```yaml
Name: ai-code-analyzer
Region: Oregon (US West)
Branch: main
Runtime: Python 3
Build Command: ./build.sh
Start Command: gunicorn app:app
Instance Type: Free
```

### Environment Variables

```bash
GEMINI_API_KEY=YOUR_ACTUAL_GEMINI_API_KEY
SECRET_KEY=your-random-secret-key-min-32-chars
FLASK_ENV=production
DEBUG=False
RATELIMIT_ENABLED=True
CACHE_TYPE=SimpleCache
LOG_LEVEL=INFO
ALLOWED_ORIGINS=*
```

### Firebase Authorized Domain
```
your-app-name.onrender.com
```

---

## 🐛 Troubleshooting

### Build Fails
- Check **Logs** tab for errors
- Ensure `requirements.txt` has all dependencies
- Verify `build.sh` has execute permissions

### App Crashes on Start
- Check if `GEMINI_API_KEY` is set correctly
- Verify all environment variables are present
- Check logs for Python errors

### Firebase Auth Not Working
- Ensure domain is added to Firebase Authorized domains
- Check browser console for CORS errors
- Verify Firebase config in `auth.js`

### ML Model Loading Slowly
- This is normal on first start (can take 2-3 minutes)
- Render free tier has limited resources
- Consider upgrading to Starter tier for better performance

---

## 💡 Tips for Production

1. **Use Starter Tier**: Free tier sleeps after 15 min of inactivity
2. **Add Custom Domain**: Configure your own domain in Render settings
3. **Enable Health Checks**: Render will ping `/health` endpoint
4. **Monitor Logs**: Check logs regularly for errors
5. **Set Up Alerts**: Configure Render to email you on failures

---

## 🔐 Security Best Practices

1. **Never commit `.env` file** to GitHub
2. **Use strong SECRET_KEY** (min 32 random characters)
3. **Restrict CORS** to your domain in production
4. **Enable rate limiting** (already configured)
5. **Keep dependencies updated** regularly

---

## 📞 Support

If you encounter issues:
1. Check Render logs first
2. Verify all environment variables
3. Test locally before deploying
4. Check Firebase console for auth issues

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] Web service created and connected to repo
- [ ] All environment variables added
- [ ] GEMINI_API_KEY obtained and added
- [ ] SECRET_KEY generated and added
- [ ] Build completed successfully
- [ ] App is accessible at Render URL
- [ ] Firebase domain authorized
- [ ] Login/logout working
- [ ] Code analysis working
- [ ] Toast notifications appearing

---

**Your app should now be live! 🎉**

Access it at: `https://your-app-name.onrender.com`
