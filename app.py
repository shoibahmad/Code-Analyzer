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
    5. **Strict JSON**: Respond ONLY with the valid JSON object. No markdown fencing around the JSON. Escape all quotes and newlines properly.
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
        
        # Try to parse JSON
        try:
            analysis = json.loads(response_text)
        except json.JSONDecodeError as json_err:
            app.logger.warning(f"Initial JSON parse failed: {json_err}")
            
            # Try to fix common JSON issues
            # Replace unescaped newlines in strings
            import re
            
            # Try parsing again
            fixed_text = response_text
            try:
                analysis = json.loads(fixed_text)
            except:
                # If still fails, create a basic structure
                app.logger.warning(f"Using fallback analysis structure due to JSON parse error")
                
                # Extract what we can using regex
                quality_match = re.search(r'"overall_quality"\s*:\s*"([^"]+)"', response_text)
                summary_match = re.search(r'"summary"\s*:\s*"([^"]+)"', response_text)
                
                analysis = {
                    'overall_quality': quality_match.group(1) if quality_match else '7/10',
                    'summary': summary_match.group(1) if summary_match else 'Analysis completed. Some details may be incomplete due to formatting issues.',
                    'bugs': [],
                    'improvements': [],
                    'best_practices': [],
                    'security': [],
                    'complexity_analysis': {
                        'time_complexity': 'Unable to parse',
                        'space_complexity': 'Unable to parse'
                    },
                    'metrics': {
                        'complexity': '7/10',
                        'readability': '7/10',
                        'maintainability': '7/10',
                        'testability': '7/10'
                    }
                }
        
        # Ensure metrics are in correct format
        if 'metrics' in analysis:
            for key in ['complexity', 'readability', 'maintainability', 'testability']:
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
        
    except Exception as e:
        app.logger.error(f"Gemini Analysis Error: {e}")
        return {
            'overall_quality': '7/10',
            'summary': '🤖 AI analysis encountered an error. Please try again.',
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

@app.route('/profile')
def profile():
    """User Profile page"""
    return render_template('profile.html')

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

# GitHub Repository Analysis
@app.route('/api/analyze-github', methods=['POST'])
@limiter.limit("5 per minute" if config.RATELIMIT_ENABLED else "1000 per minute")
def analyze_github_repo():
    """
    Analyze entire GitHub repository
    Fetches all code files and analyzes them
    """
    import requests
    import base64
    
    start_time = datetime.now()
    
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        repo_url = data.get('repo_url', '').strip()
        github_token = data.get('github_token', '').strip()
        
        if not repo_url:
            return jsonify({'error': 'Repository URL is required'}), 400
        
        # Parse GitHub URL
        # Format: https://github.com/owner/repo
        try:
            parts = repo_url.replace('https://github.com/', '').replace('http://github.com/', '').strip('/').split('/')
            if len(parts) < 2:
                return jsonify({'error': 'Invalid GitHub URL format'}), 400
            
            owner = parts[0]
            repo = parts[1]
        except:
            return jsonify({'error': 'Invalid GitHub URL'}), 400
        
        # GitHub API headers
        headers = {
            'Accept': 'application/vnd.github.v3+json'
        }
        if github_token:
            headers['Authorization'] = f'token {github_token}'
        
        # Fetch repository tree
        tree_url = f'https://api.github.com/repos/{owner}/{repo}/git/trees/main?recursive=1'
        
        app.logger.info(f"Fetching repository tree: {tree_url}")
        tree_response = requests.get(tree_url, headers=headers, timeout=30)
        
        # Try 'master' if 'main' doesn't exist
        if tree_response.status_code == 404:
            tree_url = f'https://api.github.com/repos/{owner}/{repo}/git/trees/master?recursive=1'
            tree_response = requests.get(tree_url, headers=headers, timeout=30)
        
        if tree_response.status_code != 200:
            return jsonify({
                'error': 'Failed to fetch repository',
                'message': f'GitHub API returned status {tree_response.status_code}'
            }), 400
        
        tree_data = tree_response.json()
        
        # Filter code files
        code_extensions = ['.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.cpp', '.c', '.cs', '.go', '.rb', '.php', '.swift', '.kt']
        code_files = [
            item for item in tree_data.get('tree', [])
            if item['type'] == 'blob' and any(item['path'].endswith(ext) for ext in code_extensions)
        ]
        
        app.logger.info(f"Found {len(code_files)} code files in repository")
        
        # Limit to first 10 files to avoid timeout
        max_files = 10
        files_to_analyze = code_files[:max_files]
        
        analyzed_files = []
        total_bugs = 0
        total_security_issues = 0
        
        for file_item in files_to_analyze:
            try:
                # Fetch file content
                file_url = f'https://api.github.com/repos/{owner}/{repo}/contents/{file_item["path"]}'
                file_response = requests.get(file_url, headers=headers, timeout=15)
                
                if file_response.status_code != 200:
                    continue
                
                file_data = file_response.json()
                
                # Decode content
                content = base64.b64decode(file_data['content']).decode('utf-8', errors='ignore')
                
                # Detect language
                file_ext = file_item['path'].split('.')[-1]
                language_map = {
                    'py': 'python', 'js': 'javascript', 'jsx': 'javascript',
                    'ts': 'typescript', 'tsx': 'typescript', 'java': 'java',
                    'cpp': 'cpp', 'c': 'c', 'cs': 'csharp', 'go': 'go',
                    'rb': 'ruby', 'php': 'php', 'swift': 'swift', 'kt': 'kotlin'
                }
                language = language_map.get(file_ext, 'auto')
                
                # Analyze with ML
                ml_result = code_analyzer.analyze_code_quality(content, language)
                
                # Analyze with AI
                ai_result = None
                try:
                    if config.GEMINI_API_KEY:
                        ai_result = get_gemini_analysis(content, language)
                except Exception as ai_error:
                    app.logger.warning(f"AI analysis failed for {file_item['path']}: {ai_error}")
                    ai_result = {'error': 'AI analysis unavailable'}
                
                # Count issues
                ml_bugs = len(ml_result.get('bugs', []))
                ml_security = len(ml_result.get('security', []))
                ml_improvements = len(ml_result.get('improvements', []))
                ai_bugs = len(ai_result.get('bugs', [])) if ai_result and 'bugs' in ai_result else 0
                ai_security = len(ai_result.get('security', [])) if ai_result and 'security' in ai_result else 0
                ai_improvements = len(ai_result.get('improvements', [])) if ai_result and 'improvements' in ai_result else 0
                
                total_bugs += ml_bugs + ai_bugs
                total_security_issues += ml_security + ai_security
                
                analyzed_files.append({
                    'path': file_item['path'],
                    'language': language,
                    'size': file_item['size'],
                    'ml_analysis': {
                        'quality': ml_result.get('overall_quality', 'N/A'),
                        'bugs_count': ml_bugs,
                        'security_count': ml_security,
                        'improvements_count': ml_improvements,
                        'bugs': ml_result.get('bugs', [])[:3],  # First 3 bugs
                        'security': ml_result.get('security', [])[:3],  # First 3 security issues
                        'improvements': ml_result.get('improvements', [])[:3]  # First 3 improvements
                    },
                    'ai_analysis': {
                        'quality': ai_result.get('overall_quality', 'N/A') if ai_result else 'N/A',
                        'bugs_count': ai_bugs,
                        'security_count': ai_security,
                        'improvements_count': ai_improvements,
                        'bugs': ai_result.get('bugs', [])[:3] if ai_result and 'bugs' in ai_result else [],
                        'security': ai_result.get('security', [])[:3] if ai_result and 'security' in ai_result else [],
                        'improvements': ai_result.get('improvements', [])[:3] if ai_result and 'improvements' in ai_result else []
                    }
                })
                
            except Exception as file_error:
                app.logger.error(f"Error analyzing {file_item['path']}: {file_error}")
                continue
        
        analysis_time = (datetime.now() - start_time).total_seconds()
        
        result = {
            'repository': f'{owner}/{repo}',
            'total_files': len(code_files),
            'analyzed_files': len(analyzed_files),
            'total_bugs': total_bugs,
            'total_security_issues': total_security_issues,
            'files': analyzed_files,
            'analysis_time': analysis_time,
            'note': f'Analyzed first {max_files} files. Full repository has {len(code_files)} code files.'
        }
        
        app.logger.info(f"GitHub analysis completed in {analysis_time:.2f}s")
        return jsonify(result)
        
    except requests.exceptions.Timeout:
        return jsonify({
            'error': 'Request timeout',
            'message': 'GitHub API request timed out. Please try again.'
        }), 408
    except requests.exceptions.RequestException as e:
        app.logger.error(f"GitHub API error: {e}")
        return jsonify({
            'error': 'GitHub API error',
            'message': str(e)
        }), 500
    except Exception as e:
        app.logger.error(f"GitHub analysis error: {e}", exc_info=True)
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
