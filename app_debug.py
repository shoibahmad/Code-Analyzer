"""
Debug version of the AI Code Review Assistant
Includes detailed logging, error tracking, and development features
"""

from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv
import os
import json
from ml_model import code_analyzer
from language_detector import language_detector
import threading
import logging
from datetime import datetime
import traceback

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('debug.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Debug mode
app.config['DEBUG'] = True
app.config['TESTING'] = True

# Configure Gemini AI
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY not found in environment variables")
else:
    genai.configure(api_key=GEMINI_API_KEY)
    logger.info("Gemini AI configured successfully")

# Load ML model in background
def load_ml_model():
    try:
        logger.info("Starting ML model loading...")
        code_analyzer.load_model()
        logger.info("ML model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load ML model: {e}")
        logger.error(traceback.format_exc())

threading.Thread(target=load_ml_model, daemon=True).start()

@app.route('/')
def index():
    logger.info("Index page accessed")
    return render_template('index.html')

@app.route('/api/analyze', methods=['POST'])
def analyze_code():
    start_time = datetime.now()
    logger.info("=" * 80)
    logger.info("NEW ANALYSIS REQUEST")
    logger.info("=" * 80)
    
    try:
        data = request.json
        code = data.get('code', '')
        logger.debug(f"Code length: {len(code)} characters")
        logger.debug(f"Code preview: {code[:100]}...")
        
        # Auto-detect language
        language = data.get('language', None)
        if not language or language == 'auto':
            language = language_detector.detect(code)
            logger.info(f"Auto-detected language: {language}")
        else:
            logger.info(f"Language provided: {language}")
        
        if not code.strip():
            logger.warning("Empty code provided")
            return jsonify({'error': 'No code provided'}), 400
        
        # ML Model Analysis
        ml_start = datetime.now()
        ml_result = None
        try:
            logger.info("Starting ML model analysis...")
            ml_result = code_analyzer.analyze_code_quality(code, language)
            ml_duration = (datetime.now() - ml_start).total_seconds()
            logger.info(f"ML analysis completed in {ml_duration:.2f}s")
            logger.debug(f"ML result: {json.dumps(ml_result, indent=2)}")
        except Exception as e:
            ml_duration = (datetime.now() - ml_start).total_seconds()
            logger.error(f"ML Model Error after {ml_duration:.2f}s: {e}")
            logger.error(traceback.format_exc())
            ml_result = {
                'error': 'ML model analysis failed',
                'overall_quality': 'N/A',
                'summary': f'Model-based analysis unavailable: {str(e)}',
                'bugs': [],
                'improvements': [],
                'best_practices': [],
                'security': [],
                'metrics': {}
            }
        
        # Gemini AI Analysis
        ai_start = datetime.now()
        ai_result = None
        if GEMINI_API_KEY:
            try:
                logger.info("Starting Gemini AI analysis...")
                ai_result = get_gemini_analysis(code, language)
                ai_duration = (datetime.now() - ai_start).total_seconds()
                logger.info(f"AI analysis completed in {ai_duration:.2f}s")
                logger.debug(f"AI result: {json.dumps(ai_result, indent=2)}")
            except Exception as e:
                ai_duration = (datetime.now() - ai_start).total_seconds()
                logger.error(f"Gemini AI Error after {ai_duration:.2f}s: {e}")
                logger.error(traceback.format_exc())
                ai_result = {
                    'error': 'AI analysis failed',
                    'overall_quality': 'N/A',
                    'summary': f'AI analysis failed: {str(e)}',
                    'bugs': [],
                    'improvements': [],
                    'best_practices': [],
                    'security': [],
                    'metrics': {}
                }
        else:
            logger.warning("Gemini API key not configured")
            ai_result = {
                'error': 'API key not configured',
                'overall_quality': 'N/A',
                'summary': 'Gemini API key not configured',
                'bugs': [],
                'improvements': [],
                'best_practices': [],
                'security': [],
                'metrics': {}
            }
        
        total_duration = (datetime.now() - start_time).total_seconds()
        logger.info(f"Total analysis completed in {total_duration:.2f}s")
        logger.info("=" * 80)
        
        return jsonify({
            'ml_analysis': ml_result,
            'ai_analysis': ai_result,
            'detected_language': language_detector.get_language_display_name(language),
            'debug_info': {
                'total_duration': f"{total_duration:.2f}s",
                'ml_duration': f"{ml_duration:.2f}s" if ml_result else 'N/A',
                'ai_duration': f"{ai_duration:.2f}s" if ai_result else 'N/A',
                'timestamp': datetime.now().isoformat()
            }
        })
    
    except Exception as e:
        total_duration = (datetime.now() - start_time).total_seconds()
        logger.error(f"Critical error after {total_duration:.2f}s: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

def get_gemini_analysis(code, language):
    """Get analysis from Gemini AI using Gemini 2.5 Flash"""
    logger.debug(f"Preparing Gemini prompt for {language}")
    
    prompt = f"""You are an expert code reviewer. Analyze the following {language} code and provide a comprehensive review.

Code to review:
```{language}
{code}
```

Provide your analysis in the following JSON format:
{{
    "overall_quality": "score from 1-10",
    "summary": "brief summary of code quality",
    "bugs": [
        {{"severity": "high/medium/low", "line": "line number or range", "issue": "description", "fix": "suggested fix"}}
    ],
    "improvements": [
        {{"category": "performance/readability/maintainability", "suggestion": "description", "example": "code example if applicable"}}
    ],
    "best_practices": [
        {{"practice": "description", "current": "what code does now", "recommended": "what it should do"}}
    ],
    "security": [
        {{"risk": "description", "severity": "high/medium/low", "mitigation": "how to fix"}}
    ],
    "metrics": {{
        "complexity": "assessment",
        "readability": "score 1-10",
        "maintainability": "score 1-10"
    }}
}}

Be specific, actionable, and constructive in your feedback."""

    logger.debug("Sending request to Gemini API...")
    model = genai.GenerativeModel('gemini-2.5-flash')
    response = model.generate_content(prompt)
    response_text = response.text
    logger.debug(f"Received response: {len(response_text)} characters")
    
    try:
        # Remove markdown code blocks if present
        if '```json' in response_text:
            response_text = response_text.split('```json')[1].split('```')[0]
            logger.debug("Extracted JSON from markdown code block")
        elif '```' in response_text:
            response_text = response_text.split('```')[1].split('```')[0]
            logger.debug("Extracted content from code block")
        
        analysis = json.loads(response_text.strip())
        logger.debug("Successfully parsed JSON response")
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing failed: {e}")
        logger.debug(f"Raw response: {response_text}")
        analysis = {
            'overall_quality': 'N/A',
            'summary': response_text,
            'bugs': [],
            'improvements': [],
            'best_practices': [],
            'security': [],
            'metrics': {}
        }
    
    return analysis

@app.route('/api/health', methods=['GET'])
def health_check():
    logger.info("Health check requested")
    health_status = {
        'status': 'healthy',
        'api_configured': bool(GEMINI_API_KEY),
        'ml_model_loaded': code_analyzer.loaded,
        'timestamp': datetime.now().isoformat(),
        'debug_mode': True
    }
    logger.debug(f"Health status: {health_status}")
    return jsonify(health_status)

@app.route('/api/logs', methods=['GET'])
def get_logs():
    """Get recent log entries"""
    try:
        with open('debug.log', 'r') as f:
            logs = f.readlines()[-100:]  # Last 100 lines
        return jsonify({'logs': logs})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(e):
    logger.warning(f"404 error: {request.url}")
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(e):
    logger.error(f"500 error: {str(e)}")
    logger.error(traceback.format_exc())
    return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

if __name__ == '__main__':
    logger.info("=" * 80)
    logger.info("STARTING DEBUG SERVER")
    logger.info("=" * 80)
    logger.info(f"Debug mode: {app.config['DEBUG']}")
    logger.info(f"API configured: {bool(GEMINI_API_KEY)}")
    logger.info(f"ML model status: {'Loading...' if not code_analyzer.loaded else 'Loaded'}")
    logger.info("=" * 80)
    
    app.run(debug=True, host='0.0.0.0', port=5002)
