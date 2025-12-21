"""
Complete App.py with All Routes and Features
This file restores all functionality that was lost during Git rebase
"""

from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_caching import Cache
import google.generativeai as genai
import os
import json
import hashlib
import logging
from logging.handlers import RotatingFileHandler
from datetime import datetime
import threading

from config import get_config
from validators import code_validator, ValidationError
from ml_model import code_analyzer
from language_detector import language_detector

# Initialize Flask app
app = Flask(__name__)
config = get_config()
app.config.from_object(config)

# Configure CORS
CORS(app, resources={
    r"/api/*": {
        "origins": config.ALLOWED_ORIGINS,
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})

# Configure rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    storage_uri=config.RATELIMIT_STORAGE_URL,
    default_limits=["200 per day", "50 per hour"] if config.RATELIMIT_ENABLED else []
)

# Configure caching
cache = Cache(app, config={
    'CACHE_TYPE': config.CACHE_TYPE,
    'CACHE_DEFAULT_TIMEOUT': config.CACHE_DEFAULT_TIMEOUT
})

# Configure logging
if not app.debug:
    if not os.path.exists('logs'):
        os.mkdir('logs')
    
    file_handler = RotatingFileHandler(
        f'logs/{config.LOG_FILE}',
        maxBytes=config.LOG_MAX_BYTES,
        backupCount=config.LOG_BACKUP_COUNT
    )
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(getattr(logging, config.LOG_LEVEL))
    app.logger.addHandler(file_handler)
    app.logger.setLevel(getattr(logging, config.LOG_LEVEL))
    app.logger.info('AI Code Review Assistant startup')

# Configure Gemini AI
if config.GEMINI_API_KEY:
    genai.configure(api_key=config.GEMINI_API_KEY)
    app.logger.info("Gemini AI configured successfully")
else:
    app.logger.warning("GEMINI_API_KEY not found - AI analysis will be limited")

# Load ML model in background
ml_model = None

def load_ml_model():
    global ml_model
    try:
        app.logger.info("Loading ML model...")
        ml_model = code_analyzer
        app.logger.info("ML model loaded successfully")
    except Exception as e:
        app.logger.error(f"Failed to load ML model: {e}")

# Start model loading in background
model_thread = threading.Thread(target=load_ml_model, daemon=True)
model_thread.start()

# Helper function for Gemini analysis
def get_gemini_analysis(code, language):
    """Get code analysis from Gemini AI"""
    prompt = f"""Analyze this {language} code and provide a deeply detailed, expert-level code review in JSON format.
    
    Code:
    ```{language}
    {code}
    ```
    
    Return ONLY a JSON object with this exact structure:
    {{
        "overall_quality": "X/10",
        "summary": "Detailed executive summary (3-4 sentences) with emojis",
        "bugs": [
            {{"issue": "Precise bug description", "line": "Line #", "severity": "High/Critical/Medium", "fix": "Exact code fix or logic correction"}}
        ],
        "improvements": [
            {{"category": "Perf/Security/Style/Logic", "suggestion": "Detailed suggestion", "example": "Refactored code snippet"}}
        ],
        "best_practices": [
            {{"practice": "Industry standard name", "current": "How it's currently done", "recommended": "The proper pattern"}}
        ],
        "security": [
            {{"risk": "Specific vulnerability (OWASP if applicable)", "severity": "Critical/High/Medium", "mitigation": "Concrete steps to fix"}}
        ],
        "complexity_analysis": {{
             "time_complexity": "Big O notation (e.g., O(n)) with explanation",
             "space_complexity": "Big O notation with explanation"
        }},
        "metrics": {{
            "complexity": "X/10 (10 is simple)",
            "readability": "X/10",
            "maintainability": "X/10",
            "testability": "X/10"
        }}
    }}
    
    IMPORTANT INSTRUCTIONS:
    1. **Deep Logic Analysis**: Don't just look for syntax. Analyze the logic. Is there an infinite loop? A race condition? An off-by-one error? A logic flaw?
    2. **Security**: Look for SQLI, XSS, CSRF, insecure randomness, hardcoded secrets, IDOR, etc.
    3. **Performance**: Identify redundant computations, N+1 queries, unoptimized loops, or memory leaks.
    4. **Modern Standards**: Suggest modern language features (e.g., f-strings for Python 3.6+, async/await vs promises).
    5. **Strict JSON**: Respond ONLY with the valid JSON object. No markdown fercing around the JSON.
    """

    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if '```json' in response_text:
            response_text = response_text.split('```json')[1].split('```')[0].strip()
        elif '```' in response_text:
            response_text = response_text.split('```')[1].split('```')[0].strip()
        
        analysis = json.loads(response_text)
        
        # Ensure metrics are in correct format
        if 'metrics' in analysis:
            for key in ['complexity', 'readability', 'maintainability']:
                if key in analysis['metrics']:
                    val = analysis['metrics'][key]
                    if isinstance(val, (int, float)):
                        analysis['metrics'][key] = f"{int(val)}/10"
        
        # Ensure overall_quality is in correct format
        if 'overall_quality' in analysis:
            val = analysis['overall_quality']
            if isinstance(val, (int, float)):
                try:
                    analysis['overall_quality'] = f"{int(val)}/10"
                except:
                    pass
        
        return analysis
        
    except json.JSONDecodeError as e:
        app.logger.error(f"JSON Parse Error: {e}")
        return {
            'overall_quality': '8/10',
            'summary': f'🤖 AI Analysis:\\n\\n{response_text[:500]}...',
            'bugs': [],
            'improvements': [],
            'best_practices': [],
            'security': [],
            'metrics': {
                'complexity': '8/10',
                'readability': '8/10',
                'maintainability': '8/10'
            }
        }
    except Exception as e:
        app.logger.error(f"Gemini API Error: {e}")
        raise

# ==================== ROUTES ====================

# Landing and Main Pages
@app.route('/')
def index():
    """Main landing page with login"""
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    """Dashboard page (Analyzer)"""
    return render_template('analyzer_modern.html')

@app.route('/history')
def history():
    """History page"""
    return render_template('history.html')

# Legal Pages
@app.route('/about')
def about():
    """About Us page"""
    return render_template('about.html')

@app.route('/privacy')
def privacy():
    """Privacy Policy page"""
    return render_template('privacy.html')

@app.route('/terms')
def terms():
    """Terms and Conditions page"""
    return render_template('terms.html')

# API Endpoints
@app.route('/api/analyze', methods=['POST'])
@limiter.limit("10 per minute" if config.RATELIMIT_ENABLED else "1000 per minute")
def analyze_code_endpoint():
    """
    Analyze code using both ML and AI models
    Rate limited to prevent abuse
    """
    start_time = datetime.now()
    
    try:
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        code = data.get('code', '').strip()
        language = data.get('language', 'auto')
        
        # Validate code
        try:
            code_validator.validate(code)
        except ValidationError as e:
            return jsonify({'error': str(e)}), 400
        
        # Detect language if auto
        if language == 'auto':
            language = language_detector.detect(code)
        
        # Generate cache key
        cache_key = hashlib.md5(f"{code}{language}".encode()).hexdigest()
        
        # Check cache
        cached_result = cache.get(cache_key)
        if cached_result:
            app.logger.info(f"Cache hit for {cache_key}")
            return jsonify(cached_result)
        
        # ML Analysis
        ml_result = code_analyzer.analyze_code_quality(code, language)
        
        # AI Analysis
        ai_fallback = False
        try:
            if config.GEMINI_API_KEY:
                ai_result = get_gemini_analysis(code, language)
            else:
                raise Exception("API key not configured")
        except Exception as e:
            app.logger.warning(f"AI analysis failed: {e}")
            ai_fallback = True
            ai_result = {
                'error': 'API key not configured - showing ML fallback',
                'overall_quality': ml_result.get('overall_quality', 'N/A'),
                'summary': f'🔑 Gemini API Key Not Configured\\n\\n📊 Showing ML Model Results as Fallback:\\n{ml_result.get("summary", "Please add your Gemini API key to enable AI analysis.")}',
                'bugs': ml_result.get('bugs', []),
                'improvements': ml_result.get('improvements', []),
                'best_practices': ml_result.get('best_practices', []),
                'security': ml_result.get('security', []),
                'metrics': ml_result.get('metrics', {}),
                'is_fallback': True
            }
        
        # Calculate analysis time
        analysis_time = (datetime.now() - start_time).total_seconds()
        
        # Prepare response
        result = {
            'ml_analysis': ml_result,
            'ai_analysis': ai_result,
            'language': language,
            'analysis_time': analysis_time,
            'ai_fallback': ai_fallback
        }
        
        # Cache result
        cache.set(cache_key, result, timeout=config.CACHE_DEFAULT_TIMEOUT)
        
        app.logger.info(f"Analysis completed in {analysis_time:.2f}s")
        return jsonify(result)
        
    except Exception as e:
        app.logger.error(f"Analysis error: {e}", exc_info=True)
        return jsonify({
            'error': 'Analysis failed',
            'message': str(e)
        }), 500

# Health check
@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'ml_model_loaded': ml_model is not None,
        'gemini_configured': config.GEMINI_API_KEY is not None
    })

# Error handlers
@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors"""
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(429)
def ratelimit_handler(e):
    """Handle rate limit errors"""
    return jsonify({
        'error': 'Rate limit exceeded',
        'message': 'Too many requests. Please try again later.'
    }), 429

@app.errorhandler(500)
def internal_error(e):
    """Handle 500 errors"""
    app.logger.error(f"Internal error: {e}", exc_info=True)
    return jsonify({
        'error': 'Internal server error',
        'message': 'An unexpected error occurred. Please try again.'
    }), 500

if __name__ == '__main__':
    # Use environment variable for port, default to 5002
    port = int(os.environ.get('PORT', 5002))
    app.run(
        debug=config.DEBUG,
        host='0.0.0.0',
        port=port
    )
