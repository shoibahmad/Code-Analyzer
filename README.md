# 🚀 AI Code Analyzer - CodeSentinel AI

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-green.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

**An intelligent code analysis platform combining Machine Learning and AI for comprehensive code quality insights**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [Documentation](#-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Firebase Setup](#-firebase-setup)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**CodeSentinel AI** is a cutting-edge code analysis platform that leverages both traditional Machine Learning models and modern AI to provide comprehensive code quality insights. Built as an MCA final year project (2024-25), it demonstrates the practical application of AI/ML in software development.

### Why CodeSentinel AI?

- **Dual Analysis Engine**: Combines CodeBERT (ML) and Gemini 2.0 Flash (AI) for superior accuracy
- **Real-time Feedback**: Instant analysis with detailed metrics and suggestions
- **User-Friendly**: Modern, responsive UI with dark theme and glassmorphism effects
- **Cloud-Powered**: Firebase integration for user authentication and data persistence
- **Mobile-First**: Fully responsive design optimized for all devices

---

## ✨ Features

### 🔍 **Code Analysis**
- **Dual Analysis System**: ML Model (CodeBERT) + AI (Gemini 2.0 Flash) working in parallel
- **Side-by-Side Comparison**: Compare ML and AI results in real-time
- **Multi-Language Support**: 15+ programming languages including Python, JavaScript, Java, C++, Go, Rust, and more
- **Auto Language Detection**: Automatically identifies the programming language

### 🐛 **Quality Metrics**
- **Bug Detection**: Identifies syntax errors, logic issues, and anti-patterns
- **Security Analysis**: Detects vulnerabilities and security risks
- **Code Quality Scores**: Complexity, readability, and maintainability metrics (0-10 scale)
- **Best Practices**: Suggests industry-standard improvements

### 📊 **Visualization**
- **Interactive Charts**: Radar charts for metrics comparison
- **Doughnut Charts**: Issues distribution visualization
- **Quality Badges**: Visual indicators for code quality levels
- **Trend Analysis**: Track code quality over time

### 👤 **User Management**
- **Firebase Authentication**: Email/password, Google, and GitHub sign-in
- **User Profiles**: Personalized dashboards with usage statistics
- **Analysis History**: Cloud-based storage of past analyses (up to 20 recent)
- **Profile Customization**: Edit display name and view account details

### 📱 **Modern UI/UX**
- **Dark Theme**: Professional GitHub-inspired dark interface
- **Glassmorphism**: Modern glass-effect cards and modals
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Smooth Animations**: Micro-interactions for enhanced user experience
- **Toast Notifications**: Real-time feedback for user actions

### 📄 **Export & Sharing**
- **PDF Export**: Generate professional analysis reports
- **History Management**: View and manage past analyses
- **Code Snippets**: Save and review analyzed code samples

---

## 🛠️ Tech Stack

### **Frontend**
- **Core**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with CSS Variables, Glassmorphism effects
- **Icons**: Font Awesome 6.4.0
- **Charts**: Chart.js 4.4.0
- **PDF Generation**: jsPDF 2.5.1
- **Fonts**: Fira Code (monospace), Google Fonts

### **Backend**
- **Framework**: Flask 3.0.0 (Python)
- **CORS**: Flask-CORS for cross-origin requests
- **Environment**: python-dotenv for configuration
- **Server**: Werkzeug WSGI server

### **AI/ML**
- **ML Model**: CodeBERT (microsoft/codebert-base)
- **AI Model**: Google Gemini 2.0 Flash
- **ML Framework**: PyTorch 2.1.0
- **Transformers**: Hugging Face Transformers 4.35.0
- **NLP**: NLTK for text processing
- **Metrics**: Scikit-learn for quality scoring

### **Database & Authentication**
- **Authentication**: Firebase Authentication 10.7.1
- **Database**: Cloud Firestore
- **Storage**: Browser localStorage (fallback)
- **Real-time**: Firebase SDK for real-time updates

### **Development Tools**
- **Version Control**: Git, GitHub
- **Package Management**: pip, npm
- **Code Quality**: ESLint, Pylint
- **Documentation**: Markdown

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│  (HTML/CSS/JS - Responsive, Dark Theme, Glassmorphism)      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Services                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Authentication│  │  Firestore   │  │   Storage    │      │
│  │ (Email/OAuth) │  │  (NoSQL DB)  │  │  (Optional)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      Flask Backend                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Endpoints (REST)                     │   │
│  │  /api/analyze  /api/health  /dashboard  /profile     │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │                                        │
│  ┌──────────────────┴───────────────────────────────────┐   │
│  │           Dual Analysis Engine                        │   │
│  │  ┌─────────────────┐    ┌─────────────────┐          │   │
│  │  │   ML Analysis   │    │   AI Analysis   │          │   │
│  │  │   (CodeBERT)    │    │ (Gemini 2.0)    │          │   │
│  │  │                 │    │                 │          │   │
│  │  │ • Embeddings    │    │ • Context-aware │          │   │
│  │  │ • Patterns      │    │ • NL Explanations│         │   │
│  │  │ • Static Rules  │    │ • Deep Analysis │          │   │
│  │  └─────────────────┘    └─────────────────┘          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### **Data Flow**

1. **User Input** → Code submitted via web interface
2. **Authentication** → Firebase verifies user identity
3. **Analysis Request** → Sent to Flask backend
4. **Parallel Processing**:
   - ML Model (CodeBERT) analyzes code structure
   - AI (Gemini) performs contextual analysis
5. **Results Aggregation** → Combined and formatted
6. **Storage** → Saved to Firestore with user ID
7. **Visualization** → Rendered in side-by-side comparison
8. **Export** → Optional PDF generation

---

## 📦 Installation

### **Prerequisites**

- Python 3.8 or higher
- pip (Python package manager)
- Git
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Firebase account (free tier)
- Google Gemini API key

### **Step 1: Clone Repository**

```bash
git clone https://github.com/shoibahmad/Code-Analyzer.git
cd Code-Analyzer
```

### **Step 2: Create Virtual Environment**

**Windows:**
```bash
python -m venv venv
.\venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### **Step 3: Install Dependencies**

```bash
pip install -r requirements.txt
```

**Note**: First installation may take 5-10 minutes as it downloads:
- CodeBERT model (~500MB)
- PyTorch libraries
- Transformers models

### **Step 4: Download NLTK Data**

```python
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"
```

---

## ⚙️ Configuration

### **1. Environment Variables**

Create a `.env` file in the root directory:

```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your_secret_key_here

# Optional: Custom Port
PORT=5000
```

**Get Gemini API Key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy and paste into `.env` file

### **2. Firebase Configuration**

Update `static/js/auth.js` with your Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id",
    measurementId: "your-measurement-id"
};
```

**Get Firebase Config:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project or select existing
3. Go to Project Settings → General
4. Scroll to "Your apps" → Web app
5. Copy configuration object

### **3. Firestore Security Rules**

In Firebase Console → Firestore Database → Rules:

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
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

### **4. Firestore Indexes**

Create composite index:
- **Collection**: `analyses`
- **Fields**: 
  - `userId` (Ascending)
  - `timestamp` (Descending)

---

## 🚀 Usage

### **Starting the Application**

```bash
# Activate virtual environment
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Run Flask server
python app.py
```

The application will start at `http://localhost:5000`

### **Using the Analyzer**

1. **Sign Up / Login**
   - Create account with email/password
   - Or use Google/GitHub OAuth

2. **Navigate to Dashboard**
   - View your analysis statistics
   - Access recent analyses

3. **Analyze Code**
   - Click "Code Analyzer" tab
   - Paste your code or upload file
   - Language is auto-detected
   - Click "Run Analysis"

4. **Review Results**
   - Compare ML vs AI analysis side-by-side
   - View quality scores (0-10)
   - Check bugs, security issues, improvements
   - Review best practices suggestions

5. **Export & Save**
   - Click "Export PDF" for report
   - Analysis automatically saved to cloud
   - View history anytime

### **GitHub Integration**

Analyze GitHub repositories:
1. Click "GitHub Analyzer" tab
2. Enter repository URL
3. Select files to analyze
4. Review combined analysis

---

## 📁 Project Structure

```
Code-Analyzer/
├── 📄 app.py                          # Flask application & API routes
├── 📄 ml_model.py                     # CodeBERT ML model integration
├── 📄 requirements.txt                # Python dependencies
├── 📄 .env                            # Environment variables (create this)
├── 📄 .gitignore                      # Git ignore rules
├── 📄 README.md                       # This file
│
├── 📂 static/                         # Static assets
│   ├── 📂 css/
│   │   ├── modern-theme.css          # Main theme & design system
│   │   ├── toast.css                 # Toast notifications
│   │   ├── utilities.css             # Utility classes
│   │   ├── features.css              # Feature-specific styles
│   │   └── animations.css            # Animation definitions
│   │
│   └── 📂 js/
│       ├── auth.js                   # Firebase authentication
│       ├── firestore-integration.js  # Firestore database operations
│       ├── main-functions.js         # Core application logic
│       ├── toast.js                  # Toast notification system
│       └── github-analyzer.js        # GitHub integration
│
├── 📂 templates/                      # HTML templates
│   ├── index.html                    # Landing page
│   ├── login.html                    # Login/signup page
│   ├── analyzer_modern.html          # Main analyzer dashboard
│   ├── profile.html                  # User profile page
│   ├── about.html                    # About page
│   ├── terms.html                    # Terms & conditions
│   └── privacy.html                  # Privacy policy
│
├── 📂 docs/                           # Documentation
│   ├── FIRESTORE_TROUBLESHOOTING.md  # Firestore debugging guide
│   ├── FIRESTORE_FIXES.md            # Firestore fixes documentation
│   ├── PROFILE_EMAIL_FIX.md          # Profile page fixes
│   ├── MOBILE_RESPONSIVE_FIXES.md    # Mobile responsiveness
│   └── LEGAL_PAGES_REDESIGN.md       # Legal pages updates
│
└── 📂 venv/                           # Virtual environment (not in git)
```

---

## 🔌 API Documentation

### **Base URL**
```
http://localhost:5000
```

### **Endpoints**

#### **1. Analyze Code**
```http
POST /api/analyze
Content-Type: application/json

{
  "code": "def hello():\n    print('Hello')",
  "language": "python"
}
```

**Response:**
```json
{
  "ml_analysis": {
    "overall_quality": "8",
    "complexity": "7",
    "readability": "9",
    "maintainability": "8",
    "bugs": [...],
    "security": [...],
    "improvements": [...],
    "best_practices": [...]
  },
  "ai_analysis": {
    "overall_quality": "9",
    "complexity": "7",
    "readability": "9",
    "maintainability": "8",
    "bugs": [...],
    "security": [...],
    "improvements": [...],
    "best_practices": [...]
  },
  "analysis_time": 2.34
}
```

#### **2. Health Check**
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "ml_model": "loaded",
  "ai_model": "connected",
  "timestamp": "2024-12-22T10:00:00Z"
}
```

#### **3. Dashboard**
```http
GET /dashboard
```
Requires authentication. Returns HTML dashboard.

#### **4. Profile**
```http
GET /profile
```
Requires authentication. Returns HTML profile page.

---

## 🔥 Firebase Setup

### **1. Create Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: "code-analyzer" (or your choice)
4. Disable Google Analytics (optional)
5. Click "Create project"

### **2. Enable Authentication**

1. In Firebase Console → Authentication
2. Click "Get started"
3. Enable sign-in methods:
   - ✅ Email/Password
   - ✅ Google
   - ✅ GitHub (optional)

**For Google OAuth:**
- Already configured by default

**For GitHub OAuth:**
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth app
3. Copy Client ID and Secret to Firebase

### **3. Create Firestore Database**

1. In Firebase Console → Firestore Database
2. Click "Create database"
3. Select "Start in production mode"
4. Choose location (closest to users)
5. Click "Enable"

### **4. Set Security Rules**

Copy rules from [Configuration](#3-firestore-security-rules) section

### **5. Create Indexes**

1. Go to Firestore → Indexes
2. Click "Create index"
3. Add composite index as specified in [Configuration](#4-firestore-indexes)

### **6. Add Authorized Domains**

1. Firebase Console → Authentication → Settings
2. Authorized domains → Add domain
3. Add:
   - `localhost`
   - Your production domain (if deployed)

---

## 🐛 Troubleshooting

### **Common Issues**

#### **1. "Module not found" Error**
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

#### **2. CodeBERT Model Download Fails**
```bash
# Manually download model
python -c "from transformers import AutoModel; AutoModel.from_pretrained('microsoft/codebert-base')"
```

#### **3. Gemini API Error**
- Check API key in `.env` file
- Verify API key is active in Google AI Studio
- Check API quota limits

#### **4. Firebase Authentication Not Working**
- Verify Firebase config in `auth.js`
- Check authorized domains in Firebase Console
- Clear browser cache and cookies

#### **5. Firestore Permission Denied**
- Update security rules in Firebase Console
- Ensure user is authenticated
- Check composite index is created

#### **6. Profile Email Not Showing**
```javascript
// Run in browser console
window.updateUserName();
```

See `FIRESTORE_TROUBLESHOOTING.md` for detailed debugging steps.

### **Debug Mode**

Enable debug logging:
```python
# In app.py
app.config['DEBUG'] = True
```

Check browser console for frontend errors:
```javascript
// Press F12 in browser
// Check Console tab for errors
```

---

## 📚 Documentation

- **[Firestore Troubleshooting](docs/FIRESTORE_TROUBLESHOOTING.md)** - Firestore issues and solutions
- **[Firestore Fixes](docs/FIRESTORE_FIXES.md)** - Recent Firestore fixes applied
- **[Profile Email Fix](docs/PROFILE_EMAIL_FIX.md)** - Profile page email display fix
- **[Mobile Responsive Fixes](docs/MOBILE_RESPONSIVE_FIXES.md)** - Mobile optimization details
- **[Legal Pages Redesign](docs/LEGAL_PAGES_REDESIGN.md)** - Legal pages updates

---

## 🎓 Academic Project Information

**Project Title**: AI-Powered Code Analysis Platform  
**Course**: Master of Computer Applications (MCA)  
**Academic Year**: 2024-2025  
**Institution**: [Your Institution Name]  
**Student**: Shoaib Ahmed  

### **Learning Outcomes**

This project demonstrates:
- ✅ Integration of pre-trained ML models (CodeBERT)
- ✅ API integration with modern AI services (Gemini)
- ✅ Full-stack web development (Flask + JavaScript)
- ✅ Cloud services integration (Firebase)
- ✅ Real-time data synchronization
- ✅ Responsive UI/UX design
- ✅ Security best practices
- ✅ RESTful API design
- ✅ Database design and optimization
- ✅ Authentication and authorization

### **Key Features for Academic Evaluation**

1. **Dual Analysis Engine**: Unique combination of ML and AI
2. **Real-time Processing**: Instant feedback system
3. **Cloud Integration**: Firebase for scalability
4. **Modern UI**: Professional-grade interface
5. **Security Focus**: Secure authentication and data handling

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### **Code Style**

- **Python**: Follow PEP 8
- **JavaScript**: Use ES6+ features
- **CSS**: Use BEM naming convention
- **Commits**: Use conventional commits

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024-2025 Shoaib Ahmed

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **Microsoft** - CodeBERT pre-trained model
- **Google** - Gemini AI API
- **Firebase** - Authentication and database services
- **Hugging Face** - Transformers library
- **Font Awesome** - Icon library
- **Chart.js** - Visualization library

---

## 📞 Contact & Support

- **GitHub**: [@shoibahmad](https://github.com/shoibahmad)
- **Repository**: [Code-Analyzer](https://github.com/shoibahmad/Code-Analyzer)
- **Issues**: [Report Bug](https://github.com/shoibahmad/Code-Analyzer/issues)
- **Email**: shoibsahmad@gmail.com

---

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐!

---

<div align="center">

**Made with ❤️ by Shoaib Ahmed**

**MCA Final Year Project 2024-25**

</div>
