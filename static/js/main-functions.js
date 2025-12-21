import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firebase App Config
const firebaseConfig = {
    apiKey: "AIzaSyC36NBZRx_94SLWszvvGN1CeLmOkzsFfko",
    authDomain: "code-analyzer-9d4e7.firebaseapp.com",
    projectId: "code-analyzer-9d4e7",
    storageBucket: "code-analyzer-9d4e7.firebasestorage.app",
    messagingSenderId: "482351514512",
    appId: "1:482351514512:web:22467addd5940df442a915",
    measurementId: "G-C2L66P6NDX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Auth State Check
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Not logged in, redirect to login page
        window.location.href = "/";
    } else {
        console.log("Logged in as:", user.email);
    }
});

// Logout Handler
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await signOut(auth);
            window.location.href = "/";
        } catch (error) {
            console.error("Logout failed", error);
        }
    });
}

// Global state
let currentRepo = null;

// Expose functions to global scope
window.analyzeCode = analyzeCode;
window.clearCode = clearCode;
window.analyzeGithubRepo = analyzeGithubRepo;
window.analyzePullRequest = analyzePullRequest;

// --- Code Analysis Logic ---

async function analyzeCode() {
    const codeInput = document.getElementById('codeInput');
    const analyzeBtn = document.querySelector('button[onclick="analyzeCode()"]');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const languageSelect = document.getElementById('languageSelect');

    const code = codeInput.value.trim();
    if (!code) {
        window.toast.warning('Please enter some code to analyze');
        return;
    }

    loadingOverlay.classList.remove('hidden');
    loadingOverlay.style.display = 'flex'; // Ensure flex

    try {
        const language = languageSelect.value;
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, language })
        });

        if (!response.ok) throw new Error("Analysis failed");

        const data = await response.json();

        displayResults(data);

        // Store data for PDF generation
        if (window.pdfGenerator) {
            window.pdfGenerator.storeAnalysisData(code, data.language, data);
        }

        // Show success toast
        window.toast.success(`Code analysis completed successfully in ${data.analysis_time ? data.analysis_time.toFixed(2) : '0'}s`, 'Analysis Complete');

        // Save to history using features.js if available
        if (window.features && window.features.saveToHistory) {
            window.features.saveToHistory(code, data.language, data);
        }

    } catch (error) {
        console.error(error);
        window.toast.error('Failed to analyze code. Please try again.', 'Analysis Error');
    } finally {
        loadingOverlay.classList.add('hidden');
        loadingOverlay.style.display = 'none';
    }
}

function clearCode() {
    document.getElementById('codeInput').value = '';
    document.getElementById('resultsContainer').innerHTML = `
        <div class="empty-state">
            <i class="fas fa-code-branch"></i>
            <h3>Ready to Analyze</h3>
            <p>Paste your code and click "Analyze Code" to get started</p>
        </div>
    `;
}

function displayResults(data) {
    console.log('displayResults called with data:', data);

    const container = document.getElementById('resultsContainer');
    if (!container) {
        console.error('Results container not found!');
        return;
    }

    const mlData = data.ml_analysis || {};
    const aiData = data.ai_analysis || {};

    console.log('ML Data:', mlData);
    console.log('AI Data:', aiData);

    // Update Detected Language Badge
    const languageBadge = document.getElementById('detectedLanguageBadge');
    if (languageBadge && data.language) {
        languageBadge.textContent = 'Detected: ' + data.language;
        languageBadge.classList.remove('hidden');
    }

    container.innerHTML = `
        <div class="analysis-grid">
            <!-- ML Column -->
            <div class="analysis-column">
                <div class="column-header">
                    <h3><i class="fas fa-robot"></i> ML Model (CodeBERT)</h3>
                    <span class="badge badge-primary">Fast Analysis</span>
                </div>
                
                <div class="quality-score-card">
                    <div class="quality-score-value">${mlData.overall_quality || 'N/A'}</div>
                    <div class="quality-score-label">Overall Quality Score</div>
                </div>

                <!-- ML Summary -->
                ${mlData.summary ? `
                    <div class="card bg-glass p-3 mb-3">
                        <h4><i class="fas fa-info-circle"></i> Analysis Summary</h4>
                        <p style="white-space: pre-line;">${mlData.summary}</p>
                    </div>
                ` : ''}

                <!-- ML Metrics -->
                ${mlData.metrics ? `
                    <div class="mb-4">
                        <h4><i class="fas fa-tachometer-alt"></i> Code Metrics</h4>
                        <div class="grid-3-col gap-2 mt-2">
                            <div class="p-3 bg-white-5 rounded text-center">
                                <div class="text-2xl font-bold text-primary">${mlData.metrics.complexity || 'N/A'}</div>
                                <div class="text-xs text-muted mt-1">Complexity</div>
                            </div>
                            <div class="p-3 bg-white-5 rounded text-center">
                                <div class="text-2xl font-bold text-success">${mlData.metrics.readability || 'N/A'}</div>
                                <div class="text-xs text-muted mt-1">Readability</div>
                            </div>
                            <div class="p-3 bg-white-5 rounded text-center">
                                <div class="text-2xl font-bold text-secondary">${mlData.metrics.maintainability || 'N/A'}</div>
                                <div class="text-xs text-muted mt-1">Maintainability</div>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- ML Bugs -->
                ${mlData.bugs && mlData.bugs.length > 0 ? `
                    <div class="mb-4">
                        <h4><i class="fas fa-bug text-danger"></i> Bugs Detected (${mlData.bugs.length})</h4>
                        ${mlData.bugs.map((bug, idx) => `
                            <div class="alert alert-danger mt-2">
                                <div class="flex justify-between items-start">
                                    <div class="flex-1">
                                        <div class="flex items-center gap-2 mb-1">
                                            <span class="badge badge-${bug.severity === 'high' ? 'danger' : bug.severity === 'medium' ? 'warning' : 'info'}">${bug.severity || 'medium'}</span>
                                            ${bug.line ? `<span class="text-xs text-muted">Line ${bug.line}</span>` : ''}
                                        </div>
                                        <strong>${bug.issue || 'Issue detected'}</strong>
                                        <p class="mt-2 text-sm">${bug.fix || 'No fix available'}</p>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<div class="alert alert-success mt-2"><i class="fas fa-check-circle"></i> No bugs detected</div>'}

                <!-- ML Security -->
                ${mlData.security && mlData.security.length > 0 ? `
                    <div class="mb-4">
                        <h4><i class="fas fa-shield-alt text-warning"></i> Security Issues (${mlData.security.length})</h4>
                        ${mlData.security.map(sec => `
                            <div class="alert alert-warning mt-2">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="badge badge-${sec.severity === 'high' ? 'danger' : 'warning'}">${sec.severity || 'medium'}</span>
                                </div>
                                <strong>${sec.risk || 'Security risk'}</strong>
                                <p class="mt-2 text-sm">${sec.mitigation || 'Review security practices'}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : '<div class="alert alert-success mt-2"><i class="fas fa-lock"></i> No security issues detected</div>'}
                
                <!-- ML Improvements -->
                ${mlData.improvements && mlData.improvements.length > 0 ? `
                    <div class="mb-4">
                        <h4><i class="fas fa-lightbulb text-warning"></i> Suggested Improvements (${mlData.improvements.length})</h4>
                        ${mlData.improvements.map(imp => `
                            <div class="alert alert-info mt-2">
                                <span class="badge badge-outline mb-2">${imp.category || 'General'}</span>
                                <p class="text-sm"><strong>Suggestion:</strong> ${imp.suggestion || ''}</p>
                                ${imp.example ? `<p class="text-xs text-muted mt-2"><strong>Example:</strong> ${imp.example}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- ML Best Practices -->
                ${mlData.best_practices && mlData.best_practices.length > 0 ? `
                    <div class="mb-4">
                        <h4><i class="fas fa-check-circle text-success"></i> Best Practices (${mlData.best_practices.length})</h4>
                        ${mlData.best_practices.map(bp => `
                            <div class="alert alert-success mt-2">
                                <strong>${bp.practice || 'Best Practice'}</strong>
                                <p class="text-sm mt-1"><span class="text-muted">Current:</span> ${bp.current || 'N/A'}</p>
                                <p class="text-sm"><span class="text-success">Recommended:</span> ${bp.recommended || 'N/A'}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>

            <!-- AI Column -->
            <div class="analysis-column">
                <div class="column-header">
                    <h3><i class="fas fa-brain"></i> Gemini AI Analysis</h3>
                    <span class="badge badge-success">Deep Insights</span>
                </div>

                <div class="quality-score-card" style="border-color: var(--secondary);">
                    <div class="quality-score-value" style="background: linear-gradient(135deg, var(--secondary), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                        ${aiData.overall_quality || 'N/A'}
                    </div>
                    <div class="quality-score-label">AI Quality Score</div>
                </div>


                <!-- AI Executive Summary Section -->
                <div class="executive-summary-container">
                    <h3 style="color: var(--primary); font-size: 1.3rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
                        <i class="fas fa-brain"></i> Executive Summary
                    </h3>
                    
                    <!-- Quality Score Card -->
                    <div class="summary-card quality-card">
                        <div class="card-icon">
                            <i class="fas fa-star"></i>
                        </div>
                        <div class="card-content">
                            <div class="card-label">Overall Quality Score</div>
                            <div class="card-value">${aiData.overall_quality || 'N/A'}</div>
                        </div>
                    </div>

                    <!-- Metrics Grid -->
                    ${aiData.metrics ? `
                        <div class="metrics-grid-summary">
                            <div class="summary-card metric-card-item">
                                <div class="card-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                                    <i class="fas fa-project-diagram"></i>
                                </div>
                                <div class="card-content">
                                    <div class="card-label">Complexity</div>
                                    <div class="card-value">${aiData.metrics.complexity || 'N/A'}</div>
                                </div>
                            </div>

                            <div class="summary-card metric-card-item">
                                <div class="card-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                                    <i class="fas fa-eye"></i>
                                </div>
                                <div class="card-content">
                                    <div class="card-label">Readability</div>
                                    <div class="card-value">${aiData.metrics.readability || 'N/A'}</div>
                                </div>
                            </div>

                            <div class="summary-card metric-card-item">
                                <div class="card-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
                                    <i class="fas fa-tools"></i>
                                </div>
                                <div class="card-content">
                                    <div class="card-label">Maintainability</div>
                                    <div class="card-value">${aiData.metrics.maintainability || 'N/A'}</div>
                                </div>
                            </div>

                            ${aiData.metrics.testability ? `
                                <div class="summary-card metric-card-item">
                                    <div class="card-icon" style="background: linear-gradient(135deg, #06b6d4, #0891b2);">
                                        <i class="fas fa-vial"></i>
                                    </div>
                                    <div class="card-content">
                                        <div class="card-label">Testability</div>
                                        <div class="card-value">${aiData.metrics.testability || 'N/A'}</div>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}

                    <!-- Summary Text Card -->
                    <div class="summary-card summary-text-card">
                        <div class="card-header">
                            <i class="fas fa-align-left"></i>
                            <span>Analysis Summary</span>
                        </div>
                        <div class="card-text">
                            <p style="white-space: pre-line; line-height: 1.8; margin: 0;">${aiData.summary ? aiData.summary.replace(/\\n/g, '\n') : 'No summary available.'}</p>
                        </div>
                    </div>
                </div>
                

                <!-- Complexity Analysis -->
                ${aiData.complexity_analysis ? `
                    <div class="analysis-section">
                        <h4><i class="fas fa-project-diagram"></i> Complexity Analysis</h4>
                        <div class="complexity-grid">
                            <div class="complexity-item">
                                <div class="label">Time Complexity</div>
                                <div class="value">${aiData.complexity_analysis.time_complexity || 'N/A'}</div>
                            </div>
                            <div class="complexity-item">
                                <div class="label">Space Complexity</div>
                                <div class="value">${aiData.complexity_analysis.space_complexity || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- AI Bugs -->
                ${aiData.bugs && aiData.bugs.length > 0 ? `
                    <div class="mb-4">
                        <h4><i class="fas fa-bug text-danger"></i> Critical Issues (${aiData.bugs.length})</h4>
                        ${aiData.bugs.map(bug => `
                            <div class="alert alert-danger mt-2">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="badge badge-${bug.severity === 'Critical' || bug.severity === 'High' ? 'danger' : 'warning'}">${bug.severity || 'Medium'}</span>
                                    ${bug.line ? `<span class="text-xs text-muted">Line ${bug.line}</span>` : ''}
                                </div>
                                <strong>${bug.issue || 'Issue detected'}</strong>
                                <p class="mt-2 text-sm">${bug.fix || 'Review and fix this issue'}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : '<div class="alert alert-success mt-2"><i class="fas fa-check-circle"></i> No critical issues found</div>'}

                <!-- AI Security -->
                ${aiData.security && aiData.security.length > 0 ? `
                    <div class="mb-4">
                        <h4><i class="fas fa-shield-alt text-danger"></i> Security Vulnerabilities (${aiData.security.length})</h4>
                        ${aiData.security.map(sec => `
                            <div class="alert alert-danger mt-2">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="badge badge-danger">${sec.severity || 'High'}</span>
                                </div>
                                <strong>${sec.risk || 'Security vulnerability'}</strong>
                                <p class="mt-2 text-sm"><strong>Mitigation:</strong> ${sec.mitigation || 'Apply security best practices'}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : '<div class="alert alert-success mt-2"><i class="fas fa-shield-check"></i> No security vulnerabilities detected</div>'}
                
                <!-- AI Improvements -->
                ${aiData.improvements && aiData.improvements.length > 0 ? `
                    <div class="mb-4">
                        <h4><i class="fas fa-magic text-secondary"></i> AI Recommendations (${aiData.improvements.length})</h4>
                        ${aiData.improvements.map(imp => `
                            <div class="alert alert-info mt-2">
                                <span class="badge badge-outline mb-2">${imp.category || 'General'}</span>
                                <p class="text-sm"><strong>Suggestion:</strong> ${imp.suggestion || ''}</p>
                                ${imp.example ? `<div class="mt-2 p-2 bg-black-20 rounded"><code class="text-xs">${imp.example}</code></div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- AI Best Practices -->
                ${aiData.best_practices && aiData.best_practices.length > 0 ? `
                    <div class="mb-4">
                        <h4><i class="fas fa-star text-warning"></i> Best Practices (${aiData.best_practices.length})</h4>
                        ${aiData.best_practices.map(bp => `
                            <div class="alert alert-success mt-2">
                                <strong>${bp.practice || 'Best Practice'}</strong>
                                <p class="text-sm mt-1"><span class="text-muted">Current:</span> ${bp.current || 'N/A'}</p>
                                <p class="text-sm"><span class="text-success">Recommended:</span> ${bp.recommended || 'N/A'}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        </div>

        <!-- Download PDF Button -->
        <div class="mt-4 text-center">
            <button onclick="window.pdfGenerator.generatePDF()" class="btn btn-primary" style="padding: 1rem 2rem; font-size: 1rem;">
                <i class="fas fa-download"></i> Download Analysis Report (PDF)
            </button>
        </div>

        <!-- Analysis Metadata -->
        <div class="mt-4 p-3 bg-white-5 rounded text-center text-sm text-muted">
            <i class="fas fa-clock"></i> Analysis completed in ${data.analysis_time ? data.analysis_time.toFixed(2) : '0'} seconds
            ${data.ai_fallback ? ' <span class="badge badge-warning ml-2">AI Fallback Mode</span>' : ''}
        </div>
    `;
}

function renderIssues(issues, icon, isImprovement = false) {
    if (!issues || issues.length === 0) return ''; // Don't show "No issues" for every subsection, cleaner UI

    return issues.map(issue => `
        <div class="alert ${isImprovement ? 'alert-success' : 'alert-info'} mt-2">
            <i class="fas fa-${icon}"></i>
            <div>
                <strong>${issue.issue || issue.risk || issue.practice || issue.category || 'Note'}</strong>
                <p>${issue.fix || issue.mitigation || issue.suggestion || issue.recommended || ''}</p>
                ${issue.current ? `<p class="text-muted text-xs mt-1">Current: ${issue.current}</p>` : ''}
            </div>
        </div>
    `).join('');
}


// --- GitHub Logic ---

async function analyzeGithubRepo() {
    const urlInput = document.getElementById('githubRepoUrl').value.trim();
    const token = document.getElementById('githubToken').value.trim();
    const resultsDiv = document.getElementById('githubResults');

    if (!urlInput) {
        window.toast.warning('Please enter a repository URL');
        return;
    }

    // Extract owner/repo
    let url = urlInput.trim();
    if (url.endsWith('.git')) url = url.slice(0, -4);
    if (url.endsWith('/')) url = url.slice(0, -1);

    let owner, repo;
    try {
        const urlObj = new URL(url);
        const parts = urlObj.pathname.split('/').filter(p => p);
        if (parts.length < 2) throw new Error("Invalid Repository URL");
        owner = parts[0];
        repo = parts[1];
    } catch (e) {
        // Fallback for non-URL inputs (e.g. "owner/repo")
        const parts = url.split('/');
        if (parts.length === 2) {
            owner = parts[0];
            repo = parts[1];
        } else {
            window.toast.error('Invalid GitHub URL or format. Use: https://github.com/owner/repo');
            return;
        }
    }

    resultsDiv.innerHTML = '<div class="loading-spinner"></div> Fetching repository info...';

    const headers = {};
    if (token) headers['Authorization'] = `token ${token}`;

    try {
        const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
        if (!repoRes.ok) {
            const errBody = await repoRes.json().catch(() => ({}));
            throw new Error(errBody.message || `Repository not found or private (Status: ${repoRes.status})`);
        }
        const repoData = await repoRes.json();

        // Show success toast
        window.toast.success(`Successfully loaded ${repoData.full_name}`, 'Repository Loaded');

        // Display Repo Info
        resultsDiv.innerHTML = `
            <div class="glass-card mb-3">
                <div class="flex justify-between items-center">
                    <div>
                        <h2><i class="fab fa-github"></i> ${repoData.full_name}</h2>
                        <p>${repoData.description || 'No description'}</p>
                    </div>
                    <div class="flex gap-2 text-center">
                        <div class="p-2">
                            <div class="stat-value" style="font-size: 1.5rem;">${repoData.stargazers_count}</div>
                            <div class="stat-label">Stars</div>
                        </div>
                        <div class="p-2">
                            <div class="stat-value" style="font-size: 1.5rem;">${repoData.forks_count}</div>
                            <div class="stat-label">Forks</div>
                        </div>
                    </div>
                </div>
                <div class="mt-3">
                    <span class="badge badge-primary">${repoData.language || 'Unknown'}</span>
                    <span class="badge badge-secondary">${repoData.open_issues_count} Issues</span>
                </div>
            </div>
            
            <div class="glass-card">
                <h3>Files (Root)</h3>
                <div id="fileList" class="mt-3">Loading files...</div>
            </div>
        `;

        // Fetch Contents
        const contentsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, { headers });
        const contents = await contentsRes.json();

        const fileListDiv = document.getElementById('fileList');
        if (Array.isArray(contents)) {
            fileListDiv.innerHTML = contents.map(item => `
                <div class="flex items-center gap-2 p-2 hover:bg-white/5 rounded cursor-pointer" 
                     onclick="fetchAndAnalyzeFile('${item.download_url}', '${item.name}')">
                    <i class="fas fa-${item.type === 'dir' ? 'folder' : 'file-code'} text-${item.type === 'dir' ? 'warning' : 'primary'}"></i>
                    <span>${item.name}</span>
                    ${item.type === 'file' ? `<span class="text-muted text-sm ml-auto">${(item.size / 1024).toFixed(1)} KB</span>` : ''}
                </div>
            `).join('');
        }

    } catch (error) {
        console.error('GitHub Analysis Error:', error);
        resultsDiv.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <strong>Error:</strong> ${error.message}
                    <p class="text-sm mt-2">
                        ${error.message.includes('not found') || error.message.includes('404') ?
                'Make sure the repository URL is correct and the repository is public, or provide a valid GitHub token for private repositories.' :
                'Please check your internet connection and try again.'}
                    </p>
                </div>
            </div>
        `;
    }
}

async function analyzePullRequest() {
    alert("Pull Request analysis coming soon!");
}

// Helper to fetch file content and switch tab to analyze it
window.fetchAndAnalyzeFile = async (url, filename) => {
    if (!url) return;

    // Switch to code tab
    document.querySelector('button[onclick="switchTab(\'code\')"]').click();

    const codeInput = document.getElementById('codeInput');
    codeInput.value = "Fetching file content...";

    try {
        const response = await fetch(url);
        const text = await response.text();
        codeInput.value = text;

        // Auto-trigger analysis
        analyzeCode();

    } catch (error) {
        codeInput.value = "Error fetching file: " + error.message;
    }
};

console.log('displayResults function completed successfully');
