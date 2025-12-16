"""
Language detection module for automatic programming language identification
"""

import re

class LanguageDetector:
    """Detect programming language from code snippets"""
    
    def __init__(self):
        # Language patterns with keywords and syntax
        self.patterns = {
            'python': {
                'keywords': ['def ', 'import ', 'from ', 'class ', 'if __name__', 'print(', 'elif ', 'lambda ', 'yield ', 'async ', 'await '],
                'syntax': [r':\s*$', r'^\s*#', r'"""', r"'''"],
                'extensions': ['.py', '.pyw']
            },
            'javascript': {
                'keywords': ['function ', 'const ', 'let ', 'var ', 'console.log', '=>', 'async ', 'await ', 'export ', 'import '],
                'syntax': [r'\{', r'\}', r';$', r'//'],
                'extensions': ['.js', '.jsx']
            },
            'typescript': {
                'keywords': ['interface ', 'type ', 'enum ', 'namespace ', 'const ', 'let ', ': string', ': number', ': boolean'],
                'syntax': [r':\s*\w+\s*[=;]', r'<.*>'],
                'extensions': ['.ts', '.tsx']
            },
            'java': {
                'keywords': ['public class', 'private ', 'protected ', 'void ', 'static ', 'extends ', 'implements ', 'package ', 'import java'],
                'syntax': [r'\{', r'\}', r';$', r'//'],
                'extensions': ['.java']
            },
            'cpp': {
                'keywords': ['#include', 'using namespace', 'std::', 'cout', 'cin', 'int main', 'class ', 'template'],
                'syntax': [r'\{', r'\}', r';$', r'//'],
                'extensions': ['.cpp', '.cc', '.cxx', '.hpp', '.h']
            },
            'csharp': {
                'keywords': ['using System', 'namespace ', 'public class', 'private ', 'protected ', 'void ', 'static ', 'async Task'],
                'syntax': [r'\{', r'\}', r';$', r'//'],
                'extensions': ['.cs']
            },
            'go': {
                'keywords': ['package ', 'import ', 'func ', 'type ', 'struct ', 'interface ', 'go ', 'defer ', 'chan '],
                'syntax': [r'\{', r'\}', r':=', r'//'],
                'extensions': ['.go']
            },
            'rust': {
                'keywords': ['fn ', 'let ', 'mut ', 'impl ', 'trait ', 'struct ', 'enum ', 'use ', 'pub ', 'match '],
                'syntax': [r'\{', r'\}', r';$', r'//'],
                'extensions': ['.rs']
            },
            'php': {
                'keywords': ['<?php', 'function ', 'class ', 'public ', 'private ', 'protected ', 'namespace ', 'use ', '$'],
                'syntax': [r'\$\w+', r';$', r'//'],
                'extensions': ['.php']
            },
            'ruby': {
                'keywords': ['def ', 'class ', 'module ', 'end', 'require ', 'puts ', 'attr_accessor', 'do ', 'yield '],
                'syntax': [r'^\s*#', r'end$'],
                'extensions': ['.rb']
            },
            'swift': {
                'keywords': ['func ', 'var ', 'let ', 'class ', 'struct ', 'enum ', 'protocol ', 'import ', 'extension '],
                'syntax': [r'\{', r'\}', r'//'],
                'extensions': ['.swift']
            },
            'kotlin': {
                'keywords': ['fun ', 'val ', 'var ', 'class ', 'object ', 'interface ', 'package ', 'import ', 'when '],
                'syntax': [r'\{', r'\}', r'//'],
                'extensions': ['.kt', '.kts']
            },
            'sql': {
                'keywords': ['SELECT ', 'FROM ', 'WHERE ', 'INSERT ', 'UPDATE ', 'DELETE ', 'CREATE TABLE', 'ALTER TABLE', 'JOIN '],
                'syntax': [r';$', r'--'],
                'extensions': ['.sql']
            },
            'html': {
                'keywords': ['<html', '<head', '<body', '<div', '<span', '<script', '<style', '<!DOCTYPE'],
                'syntax': [r'<\w+', r'</\w+>', r'<!--'],
                'extensions': ['.html', '.htm']
            },
            'css': {
                'keywords': ['{', '}', ':', ';', '@media', '@import', 'px', 'rem', 'em'],
                'syntax': [r'\{', r'\}', r':\s*\w+', r';$'],
                'extensions': ['.css', '.scss', '.sass']
            }
        }
    
    def detect(self, code):
        """
        Detect programming language from code
        Returns: language name (string)
        """
        if not code or not code.strip():
            return 'python'  # Default
        
        code_lower = code.lower()
        scores = {}
        
        # Score each language
        for lang, patterns in self.patterns.items():
            score = 0
            
            # Check keywords
            for keyword in patterns['keywords']:
                if keyword.lower() in code_lower:
                    score += 2
            
            # Check syntax patterns
            for pattern in patterns['syntax']:
                if re.search(pattern, code, re.MULTILINE):
                    score += 1
            
            scores[lang] = score
        
        # Get language with highest score
        if scores:
            detected_lang = max(scores, key=scores.get)
            if scores[detected_lang] > 0:
                return detected_lang
        
        # Fallback detection based on common patterns
        if '<?php' in code:
            return 'php'
        elif 'def ' in code and ':' in code:
            return 'python'
        elif 'function ' in code and '{' in code:
            return 'javascript'
        elif '#include' in code:
            return 'cpp'
        elif 'public class' in code and 'void ' in code:
            return 'java'
        elif '<html' in code_lower or '<!doctype' in code_lower:
            return 'html'
        
        return 'python'  # Default fallback
    
    def get_language_display_name(self, lang_code):
        """Get display name for language code"""
        display_names = {
            'python': 'Python',
            'javascript': 'JavaScript',
            'typescript': 'TypeScript',
            'java': 'Java',
            'cpp': 'C++',
            'csharp': 'C#',
            'go': 'Go',
            'rust': 'Rust',
            'php': 'PHP',
            'ruby': 'Ruby',
            'swift': 'Swift',
            'kotlin': 'Kotlin',
            'sql': 'SQL',
            'html': 'HTML',
            'css': 'CSS'
        }
        return display_names.get(lang_code, lang_code.title())

# Global instance
language_detector = LanguageDetector()
