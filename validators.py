"""
Input validation utilities for code analysis
"""
import re
from typing import Tuple

class ValidationError(Exception):
    """Custom validation error"""
    pass

class CodeValidator:
    """Validate code input before analysis"""
    
    def __init__(self, max_length: int = 50000):
        self.max_length = max_length
        self.dangerous_patterns = [
            r'rm\s+-rf',  # Dangerous shell commands
            r'eval\s*\(',  # Eval in various languages
            r'exec\s*\(',
            r'__import__',
            r'subprocess\.',
            r'os\.system',
        ]
    
    def validate(self, code: str, language: str = None) -> Tuple[bool, str]:
        """
        Validate code input
        Returns: (is_valid, error_message)
        """
        # Check if code is empty
        if not code or not code.strip():
            raise ValidationError("Code cannot be empty")
        
        # Check code length
        if len(code) > self.max_length:
            raise ValidationError(
                f"Code exceeds maximum length of {self.max_length:,} characters. "
                f"Current length: {len(code):,} characters"
            )
        
        # Check for minimum length
        if len(code.strip()) < 10:
            raise ValidationError("Code is too short. Please provide at least 10 characters")
        
        # Check for potentially dangerous patterns (informational only)
        dangerous_found = []
        for pattern in self.dangerous_patterns:
            if re.search(pattern, code, re.IGNORECASE):
                dangerous_found.append(pattern)
        
        if dangerous_found:
            # Log warning but don't block
            print(f"⚠️ Warning: Potentially dangerous patterns detected: {dangerous_found}")
        
        # Validate language if provided
        if language:
            valid_languages = [
                'python', 'javascript', 'typescript', 'java', 'cpp', 'csharp',
                'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'sql', 'html', 'css'
            ]
            if language.lower() not in valid_languages:
                raise ValidationError(f"Unsupported language: {language}")
        
        return True, "Validation passed"
    
    def sanitize_code(self, code: str) -> str:
        """
        Sanitize code input (remove null bytes, normalize line endings)
        """
        # Remove null bytes
        code = code.replace('\x00', '')
        
        # Normalize line endings to \n
        code = code.replace('\r\n', '\n').replace('\r', '\n')
        
        # Remove excessive whitespace at the end
        code = code.rstrip()
        
        return code

# Global validator instance
code_validator = CodeValidator()
