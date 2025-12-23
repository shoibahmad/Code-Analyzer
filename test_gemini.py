import google.generativeai as genai
import os
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

print("=" * 60)
print("🧪 GEMINI API TEST SCRIPT")
print("=" * 60)

# Get API key
api_key = os.getenv('GEMINI_API_KEY')

if not api_key:
    print("❌ GEMINI_API_KEY not found in .env file")
    print("\n📝 To fix:")
    print("1. Create/edit .env file")
    print("2. Add: GEMINI_API_KEY=your_key_here")
    print("3. Get key from: https://makersuite.google.com/app/apikey")
    exit(1)

print(f"✅ API Key found: {api_key[:20]}...")

# Configure Gemini
try:
    genai.configure(api_key=api_key)
    print("✅ Gemini configured successfully")
except Exception as e:
    print(f"❌ Configuration error: {e}")
    exit(1)

# Test different models
models_to_test = [
    'gemini-2.5-flash'
]

print("\n" + "=" * 60)
print("🧪 TESTING MODELS")
print("=" * 60)

working_model = None

for model_name in models_to_test:
    try:
        print(f"\n📡 Testing {model_name}...")
        model = genai.GenerativeModel(
            model_name,
            generation_config={
                'temperature': 0.7,
                'top_p': 0.95,
                'top_k': 40,
                'max_output_tokens': 1000,
            }
        )
        
        # Simple test
        response = model.generate_content(
            'Return a JSON object with a single field "status" set to "working"'
        )
        
        print(f"✅ {model_name} is WORKING!")
        print(f"   Response: {response.text[:100]}...")
        working_model = model_name
        break
        
    except Exception as e:
        print(f"❌ {model_name} failed: {str(e)[:100]}")
        continue

if not working_model:
    print("\n❌ No working model found!")
    print("\n📝 Possible issues:")
    print("1. Invalid API key")
    print("2. Quota exceeded")
    print("3. Network/firewall issues")
    print("4. Google AI services down")
    exit(1)

# Test code analysis
print("\n" + "=" * 60)
print("🧪 TESTING CODE ANALYSIS")
print("=" * 60)

test_code = """
def calculate_sum(a, b):
    return a + b

result = calculate_sum(5, 10)
print(result)
"""

try:
    print(f"\n📡 Analyzing sample Python code with {working_model}...")
    
    model = genai.GenerativeModel(
        working_model,
        generation_config={
            'temperature': 0.7,
            'top_p': 0.95,
            'top_k': 40,
            'max_output_tokens': 2000,
        }
    )
    
    prompt = f"""Analyze this Python code and return a JSON object with:
    - overall_quality: a score like "8/10"
    - summary: a brief summary
    - bugs: array of bugs found
    
    Code:
    ```python
    {test_code}
    ```
    
    Return ONLY valid JSON, no markdown."""
    
    response = model.generate_content(prompt)
    response_text = response.text.strip()
    
    # Try to parse JSON
    if '```json' in response_text:
        response_text = response_text.split('```json')[1].split('```')[0].strip()
    elif '```' in response_text:
        response_text = response_text.split('```')[1].split('```')[0].strip()
    
    try:
        analysis = json.loads(response_text)
        print("✅ Code analysis WORKING!")
        print(f"\n📊 Analysis Result:")
        print(json.dumps(analysis, indent=2)[:500])
    except json.JSONDecodeError:
        print("⚠️  Response received but not valid JSON")
        print(f"Response: {response_text[:300]}")
    
except Exception as e:
    print(f"❌ Code analysis failed: {e}")
    exit(1)

# Final summary
print("\n" + "=" * 60)
print("✅ GEMINI IS WORKING!")
print("=" * 60)
print(f"\n📌 Working Model: {working_model}")
print("\n📝 Next Steps:")
print(f"1. Make sure app.py uses: '{working_model}'")
print("2. Restart your Flask server")
print("3. Test code analysis in the web app")
print("\n🎉 You're all set!")
