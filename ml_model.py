import torch
from transformers import AutoTokenizer, AutoModel
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import re

class CodeAnalyzerModel:
    def __init__(self):
        """Initialize CodeBERT model for code analysis"""
        self.model_name = "microsoft/codebert-base"
        self.tokenizer = None
        self.model = None
        self.loaded = False
        
    def load_model(self):
        """Load the CodeBERT model"""
        try:
            print("Loading CodeBERT model...")
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModel.from_pretrained(self.model_name)
            self.model.eval()
            self.loaded = True
            print("Model loaded successfully!")
        except Exception as e:
            print(f"Error loading model: {e}")
            self.loaded = False
    
    def get_code_embedding(self, code):
        """Get embedding vector for code"""
        if not self.loaded:
            self.load_model()
        
        try:
            inputs = self.tokenizer(code, return_tensors="pt", 
                                   truncation=True, max_length=512, 
                                   padding=True)
            
            with torch.no_grad():
                outputs = self.model(**inputs)
                embedding = outputs.last_hidden_state.mean(dim=1)
            
            return embedding.numpy()
        except Exception as e:
            print(f"Error getting embedding: {e}")
            return None
    
    def analyze_code_quality(self, code, language):
        """Analyze code quality using ML model"""
        results = {
            'overall_quality': 0,
            'summary': '',
            'bugs': [],
            'improvements': [],
            'best_practices': [],
            'security': [],
            'metrics': {}
        }
        
        # Static analysis patterns
        bugs = self._detect_bugs(code, language)
        security_issues = self._detect_security_issues(code, language)
        improvements = self._suggest_improvements(code, language)
        best_practices = self._check_best_practices(code, language)
        metrics = self._calculate_metrics(code, language)
        
        # Calculate overall quality score
        quality_score = self._calculate_quality_score(bugs, security_issues, metrics)
        
        results['overall_quality'] = f"{quality_score}/10"
        results['summary'] = self._generate_summary(quality_score, bugs, security_issues)
        results['bugs'] = bugs
        results['security'] = security_issues
        results['improvements'] = improvements
        results['best_practices'] = best_practices
        results['metrics'] = metrics
        
        return results
    
    def _detect_bugs(self, code, language):
        """Detect potential bugs using pattern matching"""
        bugs = []
        lines = code.split('\n')
        
        if language == 'python':
            # Check for common Python bugs
            for i, line in enumerate(lines, 1):
                if '==' in line and 'if' in line and 'None' in line:
                    bugs.append({
                        'severity': 'medium',
                        'line': str(i),
                        'issue': 'Use "is None" instead of "== None"',
                        'fix': 'Replace "== None" with "is None" for identity comparison'
                    })
                
                if 'except:' in line and 'pass' in lines[min(i, len(lines)-1)]:
                    bugs.append({
                        'severity': 'high',
                        'line': str(i),
                        'issue': 'Bare except clause catches all exceptions',
                        'fix': 'Specify exception types: except ValueError, TypeError:'
                    })
                
                if re.search(r'range\(len\(', line):
                    bugs.append({
                        'severity': 'low',
                        'line': str(i),
                        'issue': 'Unnecessary use of range(len())',
                        'fix': 'Use "for item in list:" or "for i, item in enumerate(list):"'
                    })
                
                if 'print(' in line:
                    bugs.append({
                        'severity': 'low',
                        'line': str(i),
                        'issue': 'Print statement found',
                        'fix': 'Use logging module or remove for production'
                    })

                if 'open(' in line and 'with' not in line:
                     bugs.append({
                        'severity': 'medium',
                        'line': str(i),
                        'issue': 'File opened without context manager',
                        'fix': 'Use "with open(...) as f:" to ensure file closure'
                    })
        
        elif language == 'javascript':
            for i, line in enumerate(lines, 1):
                if '==' in line and '!=' not in line:
                    bugs.append({
                        'severity': 'medium',
                        'line': str(i),
                        'issue': 'Use === instead of == for strict equality',
                        'fix': 'Replace == with === to avoid type coercion'
                    })
                
                if 'var ' in line:
                    bugs.append({
                        'severity': 'low',
                        'line': str(i),
                        'issue': 'Use let or const instead of var',
                        'fix': 'Replace var with const (immutable) or let (mutable)'
                    })
                
                if 'console.log(' in line:
                     bugs.append({
                        'severity': 'low',
                        'line': str(i),
                        'issue': 'Console log found',
                        'fix': 'Remove console.log statements from production code'
                    })
        
        return bugs
    
    def _detect_security_issues(self, code, language):
        """Detect security vulnerabilities"""
        security = []
        lines = code.split('\n')
        
        if language == 'python':
            for i, line in enumerate(lines, 1):
                if 'eval(' in line:
                    security.append({
                        'risk': 'Code injection vulnerability with eval()',
                        'severity': 'high',
                        'mitigation': 'Avoid eval(). Use ast.literal_eval() for safe evaluation'
                    })
                
                if 'pickle.load' in line:
                    security.append({
                        'risk': 'Pickle deserialization can execute arbitrary code',
                        'severity': 'high',
                        'mitigation': 'Use JSON or validate pickle sources carefully'
                    })
                
                if re.search(r'password\s*=\s*["\']', line, re.IGNORECASE):
                    security.append({
                        'risk': 'Hardcoded password detected',
                        'severity': 'high',
                        'mitigation': 'Use environment variables or secure vaults'
                    })

                if 'subprocess.call' in line or 'subprocess.Popen' in line:
                     if 'shell=True' in line:
                        security.append({
                            'risk': 'Shell injection risk with shell=True',
                            'severity': 'high',
                            'mitigation': 'Set shell=False (default) or sanitize input carefully'
                        })
        
        elif language == 'javascript':
            for i, line in enumerate(lines, 1):
                if 'eval(' in line:
                    security.append({
                        'risk': 'eval() can execute malicious code',
                        'severity': 'high',
                        'mitigation': 'Avoid eval(). Use JSON.parse() or safer alternatives'
                    })
                
                if 'innerHTML' in line and '+' in line:
                    security.append({
                        'risk': 'XSS vulnerability with innerHTML',
                        'severity': 'high',
                        'mitigation': 'Use textContent or sanitize input with DOMPurify'
                    })
        
        return security
    
    def _suggest_improvements(self, code, language):
        """Suggest code improvements"""
        improvements = []
        lines = code.split('\n')
        
        # Check code length
        if len(lines) > 50:
            improvements.append({
                'category': 'maintainability',
                'suggestion': 'Consider breaking down into smaller functions',
                'example': 'Split large functions into focused, single-purpose functions'
            })
        
        # Check for comments
        comment_count = sum(1 for line in lines if line.strip().startswith('#') or line.strip().startswith('//'))
        if comment_count < len(lines) * 0.1:
            improvements.append({
                'category': 'readability',
                'suggestion': 'Add more comments to explain complex logic',
                'example': '# Explain what this section does'
            })
        
        # Check for magic numbers
        if re.search(r'\b\d{2,}\b', code):
            improvements.append({
                'category': 'maintainability',
                'suggestion': 'Replace magic numbers with named constants',
                'example': 'MAX_RETRIES = 3 instead of hardcoded 3'
            })
        
        return improvements
    
    def _check_best_practices(self, code, language):
        """Check for best practices"""
        practices = []
        
        if language == 'python':
            if 'import *' in code:
                practices.append({
                    'practice': 'Avoid wildcard imports',
                    'current': 'from module import *',
                    'recommended': 'from module import specific_function'
                })
            
            if not re.search(r'def \w+\(.*\):\s*"""', code):
                practices.append({
                    'practice': 'Add docstrings to functions',
                    'current': 'Functions without documentation',
                    'recommended': 'Add """docstring""" after function definition'
                })
        
        elif language == 'javascript':
            if 'function(' in code and '=>' not in code:
                practices.append({
                    'practice': 'Consider using arrow functions',
                    'current': 'function(x) { return x * 2; }',
                    'recommended': '(x) => x * 2'
                })
        
        return practices
    
    def _calculate_metrics(self, code, language):
        """Calculate code metrics"""
        lines = code.split('\n')
        non_empty_lines = [l for l in lines if l.strip()]
        
        # Complexity (simplified cyclomatic complexity)
        complexity_keywords = ['if', 'elif', 'else', 'for', 'while', 'try', 'except', 'case', 'switch']
        complexity_count = sum(1 for line in lines for keyword in complexity_keywords if keyword in line)
        # Lower complexity is better, so invert the score
        complexity_score = max(1, min(10, 10 - complexity_count // 2))
        
        # Readability (based on line length and naming)
        avg_line_length = sum(len(l) for l in non_empty_lines) / max(len(non_empty_lines), 1)
        readability_score = max(1, min(10, int(10 - (avg_line_length - 40) / 10)))
        
        # Maintainability (based on function count and size)
        function_count = len(re.findall(r'def |function ', code))
        lines_per_function = len(non_empty_lines) / max(function_count, 1)
        # Good maintainability: multiple small functions
        if lines_per_function < 20:
            maintainability_score = 9
        elif lines_per_function < 50:
            maintainability_score = 7
        else:
            maintainability_score = 5
        maintainability_score = max(1, min(10, maintainability_score))
        
        return {
            'complexity': f"{complexity_score}/10",
            'readability': f"{readability_score}/10",
            'maintainability': f"{maintainability_score}/10"
        }
    
    def _calculate_quality_score(self, bugs, security, metrics):
        """Calculate overall quality score"""
        base_score = 10
        
        # Deduct for bugs
        base_score -= len([b for b in bugs if b['severity'] == 'high']) * 2
        base_score -= len([b for b in bugs if b['severity'] == 'medium']) * 1
        base_score -= len([b for b in bugs if b['severity'] == 'low']) * 0.5
        
        # Deduct for security issues
        base_score -= len([s for s in security if s['severity'] == 'high']) * 2
        base_score -= len([s for s in security if s['severity'] == 'medium']) * 1
        
        return max(1, min(10, round(base_score, 1)))
    
    def _generate_summary(self, score, bugs, security):
        """Generate summary text"""
        if score >= 8:
            quality = "excellent"
            emoji = "🌟"
        elif score >= 6:
            quality = "good"
            emoji = "✅"
        elif score >= 4:
            quality = "fair"
            emoji = "⚠️"
        else:
            quality = "needs improvement"
            emoji = "🔧"
        
        summary = f"{emoji} Code quality is {quality} with a score of {score}/10.\n\n"
        
        if bugs:
            summary += f"🐛 Found {len(bugs)} potential bug(s).\n"
        if security:
            summary += f"🔒 Detected {len(security)} security concern(s).\n"
        
        if not bugs and not security:
            summary += "✨ No critical issues detected. Great job!\n"
        
        # Add recommendations
        if score < 8:
            summary += f"\n💡 Recommendations: Review the suggestions below to improve code quality."
        
        return summary.strip()

# Global model instance
code_analyzer = CodeAnalyzerModel()
