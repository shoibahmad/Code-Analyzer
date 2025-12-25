# 🔍 Dashboard Data Issues - Troubleshooting Guide

## Issue: Quality Scores Showing "N/A"

### **Problem:**
All analyses in the "Recent Analyses" table show:
- Quality Score: N/A
- Bugs: 0
- Security: 0  
- Status: POOR

### **Root Cause:**
The analysis data isn't being saved to Firestore with the correct quality scores.

### **Possible Reasons:**

1. **Analysis API Not Returning Data**
   - ML analysis might be failing
   - AI (Gemini) analysis might be failing
   - Check Flask logs for errors

2. **Data Structure Mismatch**
   - Frontend expects: `ml_analysis.overall_quality`
   - Firestore saves: `mlQuality`
   - Check if API response has the correct structure

3. **User Not Logged In**
   - `saveAnalysisToFirestore` requires `window.currentUser`
   - If not logged in, data won't save

### **How to Debug:**

#### Step 1: Check Browser Console
```javascript
// After analyzing code, check:
console.log('Analysis Data:', analysisData);
console.log('ML Quality:', analysisData.ml_analysis?.overall_quality);
console.log('AI Quality:', analysisData.ai_analysis?.overall_quality);
```

#### Step 2: Check Firestore Data
1. Go to Firebase Console
2. Open Firestore Database
3. Check `analyses` collection
4. Look at a recent document
5. Verify fields exist:
   - `mlQuality`
   - `aiQuality`
   - `bugsCount`
   - `securityCount`

#### Step 3: Check Flask API Response
```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"code":"print(\"hello\")", "language":"python"}'
```

Expected response:
```json
{
  "ml_analysis": {
    "overall_quality": "8/10",
    "bugs": [...],
    "security": [...]
  },
  "ai_analysis": {
    "overall_quality": "9/10",
    "bugs": [...],
    "security": [...]
  },
  "language": "python",
  "analysis_time": 1.23
}
```

### **Fixes Applied:**

✅ **Updated `admin-firestore.js`** to handle multiple field name variations:
```javascript
const mlScore = data.mlQuality || data.ml_quality || data.mlScore || 'N/A';
const aiScore = data.aiQuality || data.ai_quality || data.aiScore || 'N/A';
```

### **Next Steps to Fix:**

#### Option 1: Test with Real Analysis
1. Go to Code Analyzer
2. Paste some code
3. Click "Analyze Code"
4. Check browser console for errors
5. Check if data saves to Firestore

#### Option 2: Check Gemini API Key
```bash
# In .env file
GEMINI_API_KEY=your-actual-api-key-here
```

If missing or invalid:
- AI analysis will fail
- Quality scores will be N/A

#### Option 3: Check ML Model
Flask logs should show:
```
[INFO] ML model loaded successfully
```

If not:
- ML analysis will fail
- Install transformers: `pip install transformers torch`

### **Quick Test:**

Run this in browser console after analyzing code:
```javascript
// Check if user is logged in
console.log('User:', window.currentUser);

// Check if save function exists
console.log('Save function:', typeof window.saveAnalysisToFirestore);

// Manually save test data
if (window.currentUser && window.saveAnalysisToFirestore) {
    window.saveAnalysisToFirestore(
        'print("test")',
        'python',
        {
            ml_analysis: { overall_quality: '8/10', bugs: [], security: [] },
            ai_analysis: { overall_quality: '9/10', bugs: [], security: [] },
            analysis_time: 1.5
        }
    );
}
```

### **Expected Behavior:**

After analyzing code, Firestore should have:
```javascript
{
  userId: "abc123",
  language: "python",
  codeSnippet: "print('hello')...",
  mlQuality: "8/10",      // ← Should NOT be N/A
  aiQuality: "9/10",      // ← Should NOT be N/A
  bugsCount: 2,           // ← Should be actual count
  securityCount: 1,       // ← Should be actual count
  timestamp: Timestamp,
  analysisTime: 1.5
}
```

### **Common Issues:**

| Issue | Cause | Fix |
|-------|-------|-----|
| All N/A | API not returning data | Check Flask logs |
| No data saved | User not logged in | Log in first |
| Permission denied | Firestore rules | Already fixed |
| Analysis fails | Missing API key | Add GEMINI_API_KEY to .env |
| ML model error | Missing dependencies | `pip install transformers` |

---

## 🔧 Immediate Action:

1. **Check if you're logged in** (top right corner)
2. **Try analyzing code** (paste any code and click Analyze)
3. **Check browser console** (F12) for errors
4. **Check Flask terminal** for error messages
5. **Share any errors** you see

The data mapping is now fixed to handle multiple formats, but we need to ensure the API is returning the correct data structure.
