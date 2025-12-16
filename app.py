"""
AI Code Review Assistant - Main Application
Enhanced with security, caching, and rate limiting
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

# Configure CORS with restrictions
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
def load_ml_model():
    try:
        app.logger.info("Loading ML model...")
        code_analyzer.load_model()
        app.logger.info("ML model loaded successfully")
    except Exception as e:
        app.logger.error(f"Failed to load ML model: {e}")

threading.Thread(target=load_ml_model, daemon=True).start()

# Helper functions
def get_code_hash(code: str) -> str:
    """Generate hash for code caching"""
    return hashlib.md5(code.encode()).hexdigest()

def get_gemini_analysis(code: str, language: str) -> dict:
    """Get analysis from Gemini AI"""
    prompt = f"""You are an expert code reviewer. Analyze the following {language} code and provide a comprehensive review.

Code to review:
```{language}
{code}
```

Provide your analysis in the following JSON format (IMPORTANT: Return ONLY valid JSON, no markdown):
{{
    "overall_quality": "X/10",
    "summary": "A clear, well-formatted summary with emojis for visual appeal. Use \\n for line breaks.",
    "bugs": [
        {{"severity": "high/medium/low", "line": "line number", "issue": "description", "fix": "suggested fix"}}
    ],
    "improvements": [
        {{"category": "performance/readability/maintainability", "suggestion": "description", "example": "code example"}}
    ],
    "best_practices": [
        {{"practice": "description", "current": "what code does", "recommended": "what it should do"}}
    ],
    "security": [
        {{"risk": "description", "severity": "high/medium/low", "mitigation": "how to fix"}}
    ],
    "metrics": {{
        "complexity": "X/10",
        "readability": "X/10",
        "maintainability": "X/10"
    }}
}}

IMPORTANT: 
- Return ONLY the JSON object, no markdown code blocks
- Use numeric scores like "8/10" for overall_quality and metrics
- Make summary engaging with emojis (🌟, ✅, ⚠️, 🐛, 🔒, 💡)
- Be specific and actionable"""

    try:
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
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
                    elif '/10' not in str(val):
                        analysis['metrics'][key] = f"{val}/10"
        
        # Ensure overall_quality is in correct format
        if 'overall_quality' in analysis:
            val = analysis['overall_quality']
            if isinstance(val, (int, float)):
                analysis['overall_quality'] = f"{int(val)}/10"
            elif '/10' not in str(val):
                try:
                    analysis['overall_quality'] = f"{int(val)}/10"
                except:
                    pass
        
        return analysis
        
    except json.JSONDecodeError as e:
        app.logger.error(f"JSON Parse Error: {e}")
        return {
            'overall_quality': '8/10',
            'summary': f'🤖 AI Analysis:\n\n{response_text[:500]}...',
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

# Routes
@app.route('/')
def index():
    """Main application page"""
    return render_template('index.html')

@app.route('/api/analyze', methods=['POST'])
@limiter.limit("10 per minute" if config.RATELIMIT_ENABLED else "1000 per minute")
def analyze_code():
    """
    Analyze code using both ML and AI models
    Rate limited to prevent abuse
    """
    start_time = datetime.now()
    
    try:
        # Get and validate input
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        code = data.get('code', '')
        language = data.get('language', 'auto')
        
        # Sanitize input
        code = code_validator.sanitize_code(code)
        
        # Validate input
        try:
            code_validator.validate(code, language if language != 'auto' else None)
        except ValidationError as e:
            app.logger.warning(f"Validation error: {e}")
            return jsonify({'error': str(e)}), 400
        
        # Auto-detect language if needed
        if not language or language == 'auto':
            language = language_detector.detect(code)
            app.logger.info(f"Auto-detected language: {language}")
        
        # Generate cache key
        code_hash = get_code_hash(code + language)
        
        # Check cache first
        cached_result = cache.get(code_hash)
        if cached_result:
            app.logger.info(f"Cache hit for {code_hash[:8]}")
            cached_result['cached'] = True
            cached_result['analysis_time'] = '0.00s (cached)'
            return jsonify(cached_result)
        
        # Run ML Analysis
        ml_result = None
        try:
            ml_result = code_analyzer.analyze_code_quality(code, language)
            app.logger.info(f"ML Analysis completed: {ml_result.get('overall_quality')}")
        except Exception as e:
            app.logger.error(f"ML Model Error: {e}", exc_info=True)
            ml_result = {
                'error': 'ML model analysis failed',
                'overall_quality': '7/10',
                'summary': f'⚠️ ML model encountered an issue: {str(e)}\n\nShowing basic analysis instead.',
                'bugs': [],
                'improvements': [{
                    'category': 'system',
                    'suggestion': 'ML model is initializing. Please try again in a moment.',
                    'example': ''
                }],
                'best_practices': [],
                'security': [],
                'metrics': {
                    'complexity': '7/10',
                    'readability': '7/10',
                    'maintainability': '7/10'
                }
            }
        
        # Run AI Analysis
        ai_result = None
        ai_fallback = False
        
        if config.GEMINI_API_KEY:
            try:
                ai_result = get_gemini_analysis(code, language)
                app.logger.info("AI Analysis completed successfully")
            except Exception as e:
                app.logger.error(f"Gemini AI Error: {e}", exc_info=True)
                ai_fallback = True
                ai_result = {
                    'error': 'AI analysis failed - showing ML fallback',
                    'overall_quality': ml_result.get('overall_quality', 'N/A'),
                    'summary': f'⚠️ AI Analysis Unavailable: {str(e)}\n\n📊 Showing ML Model Results as Fallback:\n{ml_result.get("summary", "Analysis completed using ML model only.")}',
                    'bugs': ml_result.get('bugs', []),
                    'improvements': ml_result.get('improvements', []),
                    'best_practices': ml_result.get('best_practices', []),
                    'security': ml_result.get('security', []),
                    'metrics': ml_result.get('metrics', {}),
                    'is_fallback': True
                }
        else:
            ai_fallback = True
            ai_result = {
                'error': 'API key not configured - showing ML fallback',
                'overall_quality': ml_result.get('overall_quality', 'N/A'),
                'summary': f'🔑 Gemini API Key Not Configured\n\n📊 Showing ML Model Results as Fallback:\n{ml_result.get("summary", "Please add your Gemini API key to enable AI analysis.")}',
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
            'detected_language': language_detector.get_language_display_name(language),
            'ai_fallback': ai_fallback,
            'cached': False,
            'analysis_time': f'{analysis_time:.2f}s'
        }
        
        # Cache the result
        cache.set(code_hash, result, timeout=config.CACHE_DEFAULT_TIMEOUT)
        
        app.logger.info(f"Analysis completed in {analysis_time:.2f}s")
        return jsonify(result)
    
    except Exception as e:
        app.logger.error(f"Unexpected error: {e}", exc_info=True)
        return jsonify({
            'error': 'An unexpected error occurred. Please try again.',
            'details': str(e) if app.debug else None
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'api_configured': bool(config.GEMINI_API_KEY),
        'ml_model_loaded': code_analyzer.loaded,
        'cache_enabled': config.CACHE_TYPE != 'null',
        'rate_limit_enabled': config.RATELIMIT_ENABLED,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get application statistics"""
    return jsonify({
        'supported_languages': list(language_detector.patterns.keys()),
        'max_code_length': config.MAX_CODE_LENGTH,
        'cache_timeout': config.CACHE_DEFAULT_TIMEOUT,
        'version': '2.0.0'
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
    app.run(
        debug=config.DEBUG,
        host='0.0.0.0',
        port=5000
    )
