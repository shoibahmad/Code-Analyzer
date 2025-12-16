// DOM Elements - Initialize after DOM loads
let codeInput, analyzeBtn, clearBtn, resultsSection, loadingSpinner, errorMessage, detectedLanguageSpan;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Main.js: DOM Content Loaded');
    
    codeInput = document.getElementById('codeInput');
    analyzeBtn = document.getElementById('analyzeBtn');
    clearBtn = document.getElementById('clearBtn');
    resultsSection = document.getElementById('resultsSection');
    loadingSpinner = document.getElementById('loadingSpinner');
    errorMessage = document.getElementById('errorMessage');
    detectedLanguageSpan = document.getElementById('detectedLanguage');

    console.log('📋 Elements found:', {
        codeInput: !!codeInput,
        analyzeBtn: !!analyzeBtn,
        clearBtn: !!clearBtn,
        resultsSection: !!resultsSection,
        loadingSpinner: !!loadingSpinner,
        errorMessage: !!errorMessage,
        detectedLanguageSpan: !!detectedLanguageSpan
    });

    // Event Listeners
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', analyzeCode);
        console.log('✅ Analyze button event listener attached');
    } else {
        console.error('❌ Analyze button not found!');
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearCode);
        console.log('✅ Clear button event listener attached');
    }

    // Update language indicator as user types
    if (codeInput) {
        codeInput.addEventListener('input', debounce(updateLanguageIndicator, 500));
    }
});

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Update language indicator
function updateLanguageIndicator() {
    const code = codeInput.value.trim();
    if (code) {
        detectedLanguageSpan.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Detecting...';
    } else {
        detectedLanguageSpan.textContent = 'Auto-detecting language...';
    }
}

// Clear code function
function clearCode() {
    codeInput.value = '';
    resultsSection.style.display = 'none';
    errorMessage.style.display = 'none';
    detectedLanguageSpan.textContent = 'Auto-detecting language...';
}

// Main analyze function
async function analyzeCode() {
    console.log('🔍 Analyze button clicked!');
    
    const code = codeInput.value.trim();
    console.log('📝 Code length:', code.length);
    
    if (!code) {
        console.warn('⚠️ No code provided');
        showError('Please enter some code to analyze');
        return;
    }
    
    console.log('✅ Starting analysis...');
    
    // Show loading
    loadingSpinner.style.display = 'block';
    resultsSection.style.display = 'none';
    errorMessage.style.display = 'none';
    analyzeBtn.disabled = true;
    
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code, language: 'auto' })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Analysis failed');
        }
        
        const data = await response.json();
        
        // Update detected language
        if (data.detected_language) {
            detectedLanguageSpan.innerHTML = `<i class="fas fa-check-circle" style="color: var(--accent-success);"></i> ${data.detected_language}`;
        }
        
        // Show fallback warning if AI analysis failed
        if (data.ai_fallback) {
            showFallbackWarning();
        }
        
        displayResults(data);
        
        // Save to history
        if (window.features) {
            window.features.saveToHistory(code, data.detected_language, data);
            window.features.createCharts(data.ml_analysis, data.ai_analysis);
            setTimeout(() => window.features.addCopyButtons(), 500);
        }
        
    } catch (error) {
        showError(error.message);
    } finally {
        loadingSpinner.style.display = 'none';
        analyzeBtn.disabled = false;
    }
}

// Display results
function displayResults(data) {
    console.log('📊 Full API Response:', data);
    
    // ML Model Analysis
    const mlData = data.ml_analysis || {};
    console.log('🤖 ML Data:', mlData);
    displayAnalysis('ml', mlData);
    
    // AI Analysis
    const aiData = data.ai_analysis || {};
    console.log('🧠 AI Data:', aiData);
    displayAnalysis('ai', aiData);
    
    // Show results
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Display analysis for a specific column (ml or ai)
function displayAnalysis(prefix, data) {
    console.log(`🔍 Displaying ${prefix} analysis:`, data);
    
    // Check if this is fallback data for AI column
    if (prefix === 'ai' && data.is_fallback) {
        const aiHeader = document.querySelector('.ai-header');
        if (aiHeader) {
            aiHeader.classList.add('fallback-mode');
        }
    }
    
    // Overall Quality
    const qualityScore = data.overall_quality || '⏳ Analyzing';
    const qualityScoreEl = document.getElementById(`${prefix}QualityScore`);
    if (qualityScoreEl) {
        qualityScoreEl.textContent = qualityScore;
        console.log(`✅ Set ${prefix} quality score to:`, qualityScore);
    }
    
    // Add visual indicator for quality score
    const scoreElement = document.getElementById(`${prefix}QualityScore`);
    if (qualityScore.includes('/10')) {
        const score = parseInt(qualityScore);
        if (score >= 8) scoreElement.style.color = 'var(--accent-success)';
        else if (score >= 6) scoreElement.style.color = 'var(--accent-primary)';
        else if (score >= 4) scoreElement.style.color = 'var(--accent-warning)';
        else scoreElement.style.color = 'var(--accent-danger)';
    }
    
    // Display summary with proper line breaks
    const summaryElement = document.getElementById(`${prefix}QualitySummary`);
    let summary = data.summary || 'Analysis in progress...';
    
    // Check if summary looks like JSON and try to parse it
    if (typeof summary === 'string' && summary.trim().startsWith('{')) {
        try {
            const parsed = JSON.parse(summary);
            summary = parsed.summary || summary;
            console.warn(`⚠️ Summary was JSON, extracted text:`, summary);
        } catch (e) {
            // If parsing fails, use as is
            console.warn('Could not parse summary JSON:', e);
        }
    }
    
    if (summaryElement) {
        summaryElement.textContent = summary;
        summaryElement.style.whiteSpace = 'pre-line'; // Preserve line breaks
    }
    
    // Metrics
    const metrics = data.metrics || {};
    const complexityEl = document.getElementById(`${prefix}ComplexityScore`);
    const readabilityEl = document.getElementById(`${prefix}ReadabilityScore`);
    const maintainabilityEl = document.getElementById(`${prefix}MaintainabilityScore`);
    
    if (complexityEl) complexityEl.textContent = metrics.complexity || '⏳ Analyzing';
    if (readabilityEl) readabilityEl.textContent = metrics.readability || '⏳ Analyzing';
    if (maintainabilityEl) maintainabilityEl.textContent = metrics.maintainability || '⏳ Analyzing';
    
    console.log(`📊 ${prefix} Metrics:`, metrics);
    
    // Bugs
    displayIssues(`${prefix}Bugs`, data.bugs || []);
    
    // Security
    displayIssues(`${prefix}Security`, data.security || []);
    
    // Improvements
    displayImprovements(`${prefix}Improvements`, data.improvements || []);
    
    // Best Practices
    displayBestPractices(`${prefix}Practices`, data.best_practices || []);
}

// Display bugs/security issues
function displayIssues(prefix, issues) {
    const listElement = document.getElementById(`${prefix}List`);
    const countElement = document.getElementById(`${prefix}Count`);
    
    countElement.textContent = issues.length;
    
    if (issues.length === 0) {
        listElement.innerHTML = `
            <div style="text-align: center; padding: 30px; color: var(--text-secondary);">
                <i class="fas fa-check-circle" style="font-size: 48px; color: var(--accent-success); margin-bottom: 12px;"></i>
                <p style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">All Clear!</p>
                <p style="font-size: 14px;">No issues detected in this category.</p>
            </div>
        `;
        return;
    }
    
    listElement.innerHTML = issues.map(issue => {
        const severity = issue.severity || 'low';
        return `
            <div class="issue-item severity-${severity}">
                <div class="issue-header">
                    <span class="issue-title">${escapeHtml(issue.issue || issue.risk || 'Issue')}</span>
                    <span class="severity-badge severity-${severity}">${severity}</span>
                </div>
                ${issue.line ? `<p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 8px;">Line: ${escapeHtml(issue.line)}</p>` : ''}
                <p class="issue-description">${escapeHtml(issue.fix || issue.mitigation || 'No fix provided')}</p>
            </div>
        `;
    }).join('');
}

// Display improvements
function displayImprovements(prefix, improvements) {
    const listElement = document.getElementById(`${prefix}List`);
    const countElement = document.getElementById(`${prefix}Count`);
    
    countElement.textContent = improvements.length;
    
    if (improvements.length === 0) {
        listElement.innerHTML = `
            <div style="text-align: center; padding: 30px; color: var(--text-secondary);">
                <i class="fas fa-thumbs-up" style="font-size: 48px; color: var(--accent-success); margin-bottom: 12px;"></i>
                <p style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Looking Good!</p>
                <p style="font-size: 14px;">No improvements needed at this time.</p>
            </div>
        `;
        return;
    }
    
    listElement.innerHTML = improvements.map(item => `
        <div class="issue-item">
            <div class="issue-header">
                <span class="issue-title">${escapeHtml(item.category || 'Improvement')}</span>
            </div>
            <p class="issue-description">${escapeHtml(item.suggestion || '')}</p>
            ${item.example ? `<div class="issue-fix">${escapeHtml(item.example)}</div>` : ''}
        </div>
    `).join('');
}

// Display best practices
function displayBestPractices(prefix, practices) {
    const listElement = document.getElementById(`${prefix}List`);
    const countElement = document.getElementById(`${prefix}Count`);
    
    countElement.textContent = practices.length;
    
    if (practices.length === 0) {
        listElement.innerHTML = `
            <div style="text-align: center; padding: 30px; color: var(--text-secondary);">
                <i class="fas fa-award" style="font-size: 48px; color: var(--accent-success); margin-bottom: 12px;"></i>
                <p style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Excellent!</p>
                <p style="font-size: 14px;">Code follows best practices.</p>
            </div>
        `;
        return;
    }
    
    listElement.innerHTML = practices.map(item => `
        <div class="issue-item">
            <div class="issue-header">
                <span class="issue-title">${escapeHtml(item.practice || 'Best Practice')}</span>
            </div>
            ${item.current ? `<p class="issue-description"><strong>Current:</strong> ${escapeHtml(item.current)}</p>` : ''}
            ${item.recommended ? `<p class="issue-description"><strong>Recommended:</strong> ${escapeHtml(item.recommended)}</p>` : ''}
        </div>
    `).join('');
}

// Show error message
function showError(message) {
    errorMessage.innerHTML = `
        <div>
            <strong>Analysis Error</strong>
            <p style="margin: 0; font-size: 14px;">${escapeHtml(message)}</p>
        </div>
    `;
    errorMessage.style.display = 'flex';
    errorMessage.scrollIntoView({ behavior: 'smooth' });
}

// Show fallback warning
function showFallbackWarning() {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'fallback-warning';
    warningDiv.innerHTML = `
        <div class="fallback-content">
            <i class="fas fa-exclamation-triangle"></i>
            <div class="fallback-text">
                <strong>AI Analysis Unavailable</strong>
                <p>Gemini AI is currently unavailable. Showing ML Model results in both columns for comparison.</p>
            </div>
            <button class="fallback-close" onclick="this.closest('.fallback-warning').remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.insertBefore(warningDiv, resultsSection.firstChild);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Sample code examples (moved to features.js)
