from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv
import os
import json
from ml_model import code_analyzer
from language_detector import language_detector
import threading

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini AI
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY not found in environment variables")
else:
    genai.configure(api_key=GEMINI_API_KEY)

# Load ML model in background
def load_ml_model():
    code_analyzer.load_model()

threading.Thread(target=load_ml_model, daemon=True).start()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/analyze', methods=['POST'])
def analyze_code():
    try:
        data = request.json
        code = data.get('code', '')
        
        # Auto-detect language if not provided
        language = data.get('language', None)
        if not language or language == 'auto':
            language = language_detector.detect(code)
            print(f"Auto-detected language: {language}")
        
        if not code.strip():
            return jsonify({'error': 'No code provided'}), 400
        
        # Run both analyses in parallel
        ml_result = None
        ai_result = None
        
        # ML Model Analysis
        try:
            ml_result = code_analyzer.analyze_code_quality(code, language)
            print(f"✅ ML Analysis completed: {ml_result.get('overall_quality')}")
        except Exception as e:
            print(f"❌ ML Model Error: {e}")
            import traceback
            traceback.print_exc()
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
        
        # Gemini AI Analysis
        ai_fallback = False
        if GEMINI_API_KEY:
            try:
                ai_result = get_gemini_analysis(code, language)
            except Exception as e:
                print(f"Gemini AI Error: {e}")
                ai_fallback = True
                # Use ML result as fallback for AI
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
            # Use ML result as fallback when no API key
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
        
        return jsonify({
            'ml_analysis': ml_result,
            'ai_analysis': ai_result,
            'detected_language': language_detector.get_language_display_name(language),
            'ai_fallback': ai_fallback
        })
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

def get_gemini_analysis(code, language):
    """Get analysis from Gemini AI using Gemini 2.5-Flash"""
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

    # Use Gemini 2.5 Flash for faster and more accurate analysis
    model = genai.GenerativeModel('gemini-2.5-flash')
    response = model.generate_content(prompt)
    response_text = response.text.strip()
    
    print(f"📥 Gemini Response (first 200 chars): {response_text[:200]}")
    
    try:
        # Remove markdown code blocks if present
        if '```json' in response_text:
            response_text = response_text.split('```json')[1].split('```')[0].strip()
            print("🔧 Removed ```json``` markers")
        elif '```' in response_text:
            response_text = response_text.split('```')[1].split('```')[0].strip()
            print("🔧 Removed ``` markers")
        
        analysis = json.loads(response_text)
        print(f"✅ Successfully parsed Gemini JSON")
        
        # Ensure metrics are in correct format
        if 'metrics' in analysis:
            for key in ['complexity', 'readability', 'maintainability']:
                if key in analysis['metrics']:
                    val = analysis['metrics'][key]
                    # Convert to X/10 format if needed
                    if isinstance(val, (int, float)):
                        analysis['metrics'][key] = f"{int(val)}/10"
                    elif not '/10' in str(val):
                        analysis['metrics'][key] = f"{val}/10"
        
        # Ensure overall_quality is in correct format
        if 'overall_quality' in analysis:
            val = analysis['overall_quality']
            if isinstance(val, (int, float)):
                analysis['overall_quality'] = f"{int(val)}/10"
            elif not '/10' in str(val):
                try:
                    analysis['overall_quality'] = f"{int(val)}/10"
                except:
                    pass
        
        return analysis
        
    except json.JSONDecodeError as e:
        print(f"❌ JSON Parse Error: {e}")
        print(f"📄 Response text: {response_text[:500]}")
        
        # Return formatted fallback
        analysis = {
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
        return analysis

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'api_configured': bool(GEMINI_API_KEY),
        'ml_model_loaded': code_analyzer.loaded
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
