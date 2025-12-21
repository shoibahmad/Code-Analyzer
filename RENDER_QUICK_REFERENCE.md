# 🎯 RENDER DEPLOYMENT - QUICK VALUES REFERENCE

## Copy these exact values into Render dashboard

---

## 1️⃣ WEB SERVICE SETTINGS

**Name:**
```
ai-code-analyzer
```

**Region:**
```
Oregon (US West)
```

**Branch:**
```
main
```

**Root Directory:**
```
(leave blank)
```

**Runtime:**
```
Python 3
```

**Build Command:**
```
./build.sh
```

**Start Command:**
```
gunicorn app:app
```

**Instance Type:**
```
Free
```

---

## 2️⃣ ENVIRONMENT VARIABLES

Click "Advanced" → "Add Environment Variable" and add these:

### Variable 1
**Key:**
```
GEMINI_API_KEY
```
**Value:**
```
YOUR_GEMINI_API_KEY_HERE
```
👉 Get from: https://makersuite.google.com/app/apikey

---

### Variable 2
**Key:**
```
SECRET_KEY
```
**Value:**
```
your-random-secret-key-here-min-32-characters
```
👉 Generate with: `python -c "import secrets; print(secrets.token_hex(32))"`

---

### Variable 3
**Key:**
```
FLASK_ENV
```
**Value:**
```
production
```

---

### Variable 4
**Key:**
```
DEBUG
```
**Value:**
```
False
```

---

### Variable 5
**Key:**
```
RATELIMIT_ENABLED
```
**Value:**
```
True
```

---

### Variable 6
**Key:**
```
CACHE_TYPE
```
**Value:**
```
SimpleCache
```

---

### Variable 7
**Key:**
```
LOG_LEVEL
```
**Value:**
```
INFO
```

---

### Variable 8
**Key:**
```
ALLOWED_ORIGINS
```
**Value:**
```
*
```

---

## 3️⃣ FIREBASE CONFIGURATION

### After deployment, add this domain to Firebase:

1. Go to: https://console.firebase.google.com
2. Select project: `code-analyzer-9d4e7`
3. Go to: **Authentication** → **Settings** → **Authorized domains**
4. Click: **"Add domain"**
5. Add:
```
your-app-name.onrender.com
```
(Replace `your-app-name` with your actual Render app name)

---

## 4️⃣ DEPLOYMENT STEPS

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy to Render"
   git push origin main
   ```

2. **Create Web Service on Render:**
   - Go to: https://dashboard.render.com
   - Click: **"New +"** → **"Web Service"**
   - Connect your GitHub repo

3. **Fill in the values above**

4. **Click: "Create Web Service"**

5. **Wait 5-10 minutes for deployment**

6. **Add Render domain to Firebase** (step 3 above)

7. **Test your app!**

---

## ✅ VERIFICATION CHECKLIST

After deployment, verify:

- [ ] App loads at: `https://your-app-name.onrender.com`
- [ ] Login page appears
- [ ] Can sign up with email
- [ ] Can log in with email
- [ ] Google sign-in works
- [ ] Code analysis works
- [ ] Toast notifications appear
- [ ] Logout works
- [ ] No console errors

---

## 🚨 IMPORTANT NOTES

1. **GEMINI_API_KEY is REQUIRED** - Get it from Google AI Studio
2. **SECRET_KEY must be random** - Don't use the example value
3. **Add Render domain to Firebase** - Auth won't work otherwise
4. **Free tier sleeps after 15 min** - First request may be slow
5. **Build takes 5-10 minutes** - Be patient!

---

## 🆘 QUICK TROUBLESHOOTING

**Build fails?**
→ Check Logs tab in Render dashboard

**App crashes?**
→ Verify GEMINI_API_KEY is set correctly

**Login doesn't work?**
→ Add Render domain to Firebase Authorized domains

**Analysis fails?**
→ Check GEMINI_API_KEY is valid

---

**That's it! Your app should be live! 🎉**
