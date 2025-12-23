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
                            
                            ${aiData.metrics.reusability ? `
                                <div class="summary-card metric-card-item">
                                    <div class="card-icon" style="background: linear-gradient(135deg, #ec4899, #db2777);">
                                        <i class="fas fa-recycle"></i>
                                    </div>
                                    <div class="card-content">
                                        <div class="card-label">Reusability</div>
                                        <div class="card-value">${aiData.metrics.reusability || 'N/A'}</div>
                                    </div>
                                </div>
                            ` : ''}
                            
                            ${aiData.metrics.reliability ? `
                                <div class="summary-card metric-card-item">
                                    <div class="card-icon" style="background: linear-gradient(135deg, #14b8a6, #0d9488);">
                                        <i class="fas fa-shield-alt"></i>
                                    </div>
                                    <div class="card-content">
                                        <div class="card-label">Reliability</div>
                                        <div class="card-value">${aiData.metrics.reliability || 'N/A'}</div>
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
                    <div class="analysis-section mb-4">
                        <h4><i class="fas fa-project-diagram"></i> 🧮 Complexity Analysis</h4>
                        <div class="complexity-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
                            <div class="complexity-item p-3 bg-white-5 rounded">
                                <div class="label text-muted text-xs mb-1">⏱️ Time Complexity</div>
                                <div class="value text-primary font-bold">${aiData.complexity_analysis.time_complexity || 'N/A'}</div>
                            </div>
                            <div class="complexity-item p-3 bg-white-5 rounded">
                                <div class="label text-muted text-xs mb-1">💾 Space Complexity</div>
                                <div class="value text-secondary font-bold">${aiData.complexity_analysis.space_complexity || 'N/A'}</div>
                            </div>
                            ${aiData.complexity_analysis.cyclomatic_complexity ? `
                                <div class="complexity-item p-3 bg-white-5 rounded">
                                    <div class="label text-muted text-xs mb-1">🔄 Cyclomatic Complexity</div>
                                    <div class="value text-warning font-bold">${aiData.complexity_analysis.cyclomatic_complexity}</div>
                                </div>
                            ` : ''}
                            ${aiData.complexity_analysis.cognitive_complexity ? `
                                <div class="complexity-item p-3 bg-white-5 rounded">
                                    <div class="label text-muted text-xs mb-1">🧠 Cognitive Complexity</div>
                                    <div class="value text-info font-bold">${aiData.complexity_analysis.cognitive_complexity}</div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}

                <!-- Architecture Analysis -->
                ${aiData.architecture_analysis ? `
                    <div class="analysis-section mb-4">
                        <h4><i class="fas fa-sitemap"></i> 🏗️ Architecture Analysis</h4>
                        <div class="alert alert-info mt-2">
                            <div class="grid gap-2">
                                ${aiData.architecture_analysis.design_patterns ? `
                                    <div><strong>🎨 Design Patterns:</strong> ${aiData.architecture_analysis.design_patterns}</div>
                                ` : ''}
                                ${aiData.architecture_analysis.separation_of_concerns ? `
                                    <div><strong>📦 Separation of Concerns:</strong> ${aiData.architecture_analysis.separation_of_concerns}</div>
                                ` : ''}
                                ${aiData.architecture_analysis.modularity ? `
                                    <div><strong>🧩 Modularity:</strong> ${aiData.architecture_analysis.modularity}</div>
                                ` : ''}
                                ${aiData.architecture_analysis.coupling ? `
                                    <div><strong>🔗 Coupling:</strong> ${aiData.architecture_analysis.coupling}</div>
                                ` : ''}
                                ${aiData.architecture_analysis.cohesion ? `
                                    <div><strong>🎯 Cohesion:</strong> ${aiData.architecture_analysis.cohesion}</div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- Code Smells -->
                ${aiData.code_smells && aiData.code_smells.length > 0 ? `
                    <div class="mb-4">
                        <h4><i class="fas fa-exclamation-triangle text-warning"></i> 👃 Code Smells Detected (${aiData.code_smells.length})</h4>
                        ${aiData.code_smells.map(smell => `
                            <div class="alert alert-warning mt-2">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="badge badge-${smell.severity === 'High' ? 'danger' : smell.severity === 'Medium' ? 'warning' : 'info'}">${smell.severity || 'Medium'}</span>
                                </div>
                                <strong>🔍 ${smell.smell || 'Code Smell Detected'}</strong>
                                ${smell.location ? `<p class="text-xs text-muted mt-1">📍 Location: ${smell.location}</p>` : ''}
                                <p class="mt-2 text-sm"><strong>🔧 Refactoring:</strong> ${smell.refactoring || 'Review and refactor'}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- Performance Optimization -->
                ${aiData.performance_optimization && aiData.performance_optimization.length > 0 ? `
                    <div class="mb-4">
                        <h4><i class="fas fa-tachometer-alt text-success"></i> ⚡ Performance Optimization (${aiData.performance_optimization.length})</h4>
                        ${aiData.performance_optimization.map(perf => `
                            <div class="alert alert-success mt-2">
                                <strong>🎯 ${perf.issue || 'Performance Issue'}</strong>
                                <p class="text-sm mt-2"><strong>Current:</strong> ${perf.current_approach || 'N/A'}</p>
                                <p class="text-sm mt-1"><strong>✨ Optimized:</strong> ${perf.optimized_approach || 'N/A'}</p>
                                ${perf.expected_improvement ? `<p class="text-xs text-success mt-1">📈 Expected Improvement: ${perf.expected_improvement}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- Error Handling -->
                ${aiData.error_handling ? `
                    <div class="analysis-section mb-4">
                        <h4><i class="fas fa-exclamation-circle"></i> ⚠️ Error Handling Assessment</h4>
                        <div class="alert alert-info mt-2">
                            <div class="mb-2"><strong>Rating:</strong> <span class="badge badge-primary">${aiData.error_handling.rating || 'N/A'}</span></div>
                            ${aiData.error_handling.issues && aiData.error_handling.issues.length > 0 ? `
                                <div class="mb-2">
                                    <strong>❌ Issues:</strong>
                                    <ul class="mt-1 ml-4">
                                        ${aiData.error_handling.issues.map(issue => `<li class="text-sm">${issue}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            ${aiData.error_handling.recommendations && aiData.error_handling.recommendations.length > 0 ? `
                                <div>
                                    <strong>✅ Recommendations:</strong>
                                    <ul class="mt-1 ml-4">
                                        ${aiData.error_handling.recommendations.map(rec => `<li class="text-sm">${rec}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}

                <!-- Documentation Quality -->
                ${aiData.documentation_quality ? `
                    <div class="analysis-section mb-4">
                        <h4><i class="fas fa-book"></i> 📚 Documentation Quality</h4>
                        <div class="alert alert-info mt-2">
                            <div class="mb-2"><strong>Rating:</strong> <span class="badge badge-primary">${aiData.documentation_quality.rating || 'N/A'}</span></div>
                            ${aiData.documentation_quality.missing && aiData.documentation_quality.missing.length > 0 ? `
                                <div class="mb-2">
                                    <strong>📝 Missing:</strong>
                                    <ul class="mt-1 ml-4">
                                        ${aiData.documentation_quality.missing.map(item => `<li class="text-sm">${item}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            ${aiData.documentation_quality.suggestions && aiData.documentation_quality.suggestions.length > 0 ? `
                                <div>
                                    <strong>💡 Suggestions:</strong>
                                    <ul class="mt-1 ml-4">
                                        ${aiData.documentation_quality.suggestions.map(sug => `<li class="text-sm">${sug}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}

                <!-- Testing Recommendations -->
                ${aiData.testing_recommendations && aiData.testing_recommendations.length > 0 ? `
                    <div class="mb-4">
                        <h4><i class="fas fa-vial text-info"></i> 🧪 Testing Recommendations (${aiData.testing_recommendations.length})</h4>
                        ${aiData.testing_recommendations.map(test => `
                            <div class="alert alert-info mt-2">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="badge badge-${test.priority === 'High' ? 'danger' : test.priority === 'Medium' ? 'warning' : 'info'}">${test.priority || 'Medium'}</span>
                                    <span class="badge badge-outline">${test.test_type || 'Test'}</span>
                                </div>
                                <strong>🎯 ${test.scenario || 'Test Scenario'}</strong>
                                ${test.example ? `<div class="mt-2 p-2 bg-black-20 rounded"><code class="text-xs">${test.example}</code></div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- Dependency Analysis -->
                ${aiData.dependency_analysis ? `
                    <div class="analysis-section mb-4">
                        <h4><i class="fas fa-cubes"></i> 📦 Dependency Analysis</h4>
                        <div class="alert alert-info mt-2">
                            ${aiData.dependency_analysis.external_dependencies ? `
                                <div class="mb-2"><strong>External Dependencies:</strong> ${aiData.dependency_analysis.external_dependencies}</div>
                            ` : ''}
                            ${aiData.dependency_analysis.recommendations ? `
                                <div class="mb-2"><strong>💡 Recommendations:</strong> ${aiData.dependency_analysis.recommendations}</div>
                            ` : ''}
                            ${aiData.dependency_analysis.security_concerns ? `
                                <div><strong>🔒 Security Concerns:</strong> ${aiData.dependency_analysis.security_concerns}</div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}

                <!-- Scalability Assessment -->
                ${aiData.scalability_assessment ? `
                    <div class="analysis-section mb-4">
                        <h4><i class="fas fa-chart-line"></i> 📈 Scalability Assessment</h4>
                        <div class="alert alert-info mt-2">
                            ${aiData.scalability_assessment.current_scalability ? `
                                <div class="mb-2"><strong>Current Scalability:</strong> ${aiData.scalability_assessment.current_scalability}</div>
                            ` : ''}
                            ${aiData.scalability_assessment.bottlenecks && aiData.scalability_assessment.bottlenecks.length > 0 ? `
                                <div class="mb-2">
                                    <strong>🚧 Bottlenecks:</strong>
                                    <ul class="mt-1 ml-4">
                                        ${aiData.scalability_assessment.bottlenecks.map(b => `<li class="text-sm">${b}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            ${aiData.scalability_assessment.recommendations && aiData.scalability_assessment.recommendations.length > 0 ? `
                                <div>
                                    <strong>✅ Recommendations:</strong>
                                    <ul class="mt-1 ml-4">
                                        ${aiData.scalability_assessment.recommendations.map(r => `<li class="text-sm">${r}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}

                <!-- Code Duplication -->
                ${aiData.code_duplication && aiData.code_duplication.detected !== 'No' ? `
                    <div class="analysis-section mb-4">
                        <h4><i class="fas fa-copy"></i> 🔄 Code Duplication</h4>
                        <div class="alert alert-warning mt-2">
                            <div class="mb-2"><strong>Detected:</strong> ${aiData.code_duplication.detected || 'Unknown'}</div>
                            ${aiData.code_duplication.instances && aiData.code_duplication.instances.length > 0 ? `
                                <div class="mb-2">
                                    <strong>📍 Instances:</strong>
                                    <ul class="mt-1 ml-4">
                                        ${aiData.code_duplication.instances.map(inst => `<li class="text-sm">${inst}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            ${aiData.code_duplication.refactoring_suggestion ? `
                                <div><strong>🔧 Refactoring Suggestion:</strong> ${aiData.code_duplication.refactoring_suggestion}</div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}

                <!-- Refactoring Opportunities -->
                ${aiData.refactoring_opportunities && aiData.refactoring_opportunities.length > 0 ? `
                    <div class="mb-4">
                        <h4><i class="fas fa-wrench text-primary"></i> 🔨 Refactoring Opportunities (${aiData.refactoring_opportunities.length})</h4>
                        ${aiData.refactoring_opportunities.map(refactor => `
                            <div class="alert alert-primary mt-2">
                                <strong>🎯 ${refactor.area || 'Refactoring Area'}</strong>
                                <p class="text-sm mt-2"><strong>Why:</strong> ${refactor.reason || 'N/A'}</p>
                                <p class="text-sm mt-1"><strong>How:</strong> ${refactor.approach || 'N/A'}</p>
                                ${refactor.benefit ? `<p class="text-xs text-success mt-1">✨ Benefit: ${refactor.benefit}</p>` : ''}
                            </div>
                        `).join('')}
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

    resultsDiv.innerHTML = `
        <div class="glass-card text-center p-4">
            <div class="loading-spinner mx-auto mb-3"></div>
            <h3>Analyzing Repository...</h3>
            <p class="text-muted">Fetching and analyzing all code files. This may take a minute.</p>
        </div>
    `;

    try {
        window.toast.info('Starting repository analysis...', 'GitHub Analyzer');

        // Call our backend endpoint
        const response = await fetch('/api/analyze-github', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                repo_url: urlInput,
                github_token: token
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || 'Analysis failed');
        }

        window.toast.success(`Analyzed ${data.analyzed_files} files!`, 'Analysis Complete');

        // Display results
        resultsDiv.innerHTML = `
            <!-- Repository Overview -->
            <div class="glass-card mb-3">
                <h2><i class="fab fa-github"></i> ${data.repository}</h2>
                <div class="grid-2-col gap-2 mt-3">
                    <div class="stat-card">
                        <i class="fas fa-file-code"></i>
                        <div class="stat-value">${data.total_files}</div>
                        <div class="stat-label">Total Code Files</div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-check-circle"></i>
                        <div class="stat-value">${data.analyzed_files}</div>
                        <div class="stat-label">Files Analyzed</div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-bug text-danger"></i>
                        <div class="stat-value">${data.total_bugs}</div>
                        <div class="stat-label">Total Bugs Found</div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-shield-alt text-warning"></i>
                        <div class="stat-value">${data.total_security_issues}</div>
                        <div class="stat-label">Security Issues</div>
                    </div>
                </div>
                ${data.note ? `<div class="alert alert-info mt-3"><i class="fas fa-info-circle"></i> ${data.note}</div>` : ''}
            </div>

            <!-- File Analysis Results -->
            <div class="glass-card">
                <h3><i class="fas fa-list"></i> File Analysis Details</h3>
                <div class="mt-3">
                    ${data.files.map((file, index) => `
                        <div class="analysis-section mb-4">
                            <h4 style="color: var(--primary); border-bottom: 2px solid var(--border); padding-bottom: 0.5rem;">
                                <i class="fas fa-file-code"></i> ${file.path}
                                <span class="badge badge-primary ml-2">${file.language}</span>
                                <span class="text-muted text-sm ml-2">${(file.size / 1024).toFixed(1)} KB</span>
                            </h4>

                            <!-- ML Analysis -->
                            <div class="mt-3">
                                <h5 style="color: var(--success);"><i class="fas fa-robot"></i> ML Analysis</h5>
                                <div class="grid-2-col gap-2 mt-2">
                                    <div class="metric-card">
                                        <div class="metric-label">Quality Score</div>
                                        <div class="metric-value">${file.ml_analysis.quality}</div>
                                    </div>
                                    <div class="metric-card">
                                        <div class="metric-label">Issues Found</div>
                                        <div class="metric-value">${file.ml_analysis.bugs_count + file.ml_analysis.security_count}</div>
                                    </div>
                                </div>

                                ${file.ml_analysis.bugs.length > 0 ? `
                                    <div class="mt-2">
                                        <strong class="text-danger"><i class="fas fa-bug"></i> Bugs:</strong>
                                        <ul class="mt-1">
                                            ${file.ml_analysis.bugs.map(bug => `
                                                <li class="text-secondary">${bug.description || bug.issue || bug}</li>
                                            `).join('')}
                                        </ul>
                                    </div>
                                ` : ''}

                                ${file.ml_analysis.security.length > 0 ? `
                                    <div class="mt-2">
                                        <strong class="text-warning"><i class="fas fa-shield-alt"></i> Security:</strong>
                                        <ul class="mt-1">
                                            ${file.ml_analysis.security.map(sec => `
                                                <li class="text-secondary">${sec.description || sec.issue || sec}</li>
                                            `).join('')}
                                        </ul>
                                    </div>
                                ` : ''}

                                ${file.ml_analysis.improvements && file.ml_analysis.improvements.length > 0 ? `
                                    <div class="mt-2">
                                        <strong style="color: var(--primary);"><i class="fas fa-lightbulb"></i> Suggestions:</strong>
                                        <ul class="mt-1">
                                            ${file.ml_analysis.improvements.map(imp => `
                                                <li class="text-secondary">${imp.suggestion || imp.description || imp}</li>
                                            `).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                            </div>

                            <!-- AI Analysis -->
                            <div class="mt-3">
                                <h5 style="color: var(--secondary);"><i class="fas fa-brain"></i> AI Analysis</h5>
                                <div class="grid-2-col gap-2 mt-2">
                                    <div class="metric-card">
                                        <div class="metric-label">Quality Score</div>
                                        <div class="metric-value">${file.ai_analysis.quality}</div>
                                    </div>
                                    <div class="metric-card">
                                        <div class="metric-label">Issues Found</div>
                                        <div class="metric-value">${file.ai_analysis.bugs_count + file.ai_analysis.security_count}</div>
                                    </div>
                                </div>

                                ${file.ai_analysis.bugs.length > 0 ? `
                                    <div class="mt-2">
                                        <strong class="text-danger"><i class="fas fa-bug"></i> Bugs:</strong>
                                        <ul class="mt-1">
                                            ${file.ai_analysis.bugs.map(bug => `
                                                <li class="text-secondary">${bug.description || bug.issue || bug}</li>
                                            `).join('')}
                                        </ul>
                                    </div>
                                ` : ''}

                                ${file.ai_analysis.security.length > 0 ? `
                                    <div class="mt-2">
                                        <strong class="text-warning"><i class="fas fa-shield-alt"></i> Security:</strong>
                                        <ul class="mt-1">
                                            ${file.ai_analysis.security.map(sec => `
                                                <li class="text-secondary">${sec.description || sec.issue || sec}</li>
                                            `).join('')}
                                        </ul>
                                    </div>
                                ` : ''}

                                ${file.ai_analysis.improvements && file.ai_analysis.improvements.length > 0 ? `
                                    <div class="mt-2">
                                        <strong style="color: var(--secondary);"><i class="fas fa-magic"></i> AI Recommendations:</strong>
                                        <ul class="mt-1">
                                            ${file.ai_analysis.improvements.map(imp => `
                                                <li class="text-secondary">${imp.suggestion || imp.description || imp}</li>
                                            `).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

    } catch (error) {
        console.error('GitHub Analysis Error:', error);
        resultsDiv.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <strong>Error:</strong> ${error.message}
                </div>
            </div>
        `;
        window.toast.error(error.message, 'Analysis Failed');
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

// Expose all functions to global scope (must be at the end after all definitions)
window.analyzeCode = analyzeCode;
window.clearCode = clearCode;
window.analyzeGithubRepo = analyzeGithubRepo;
window.analyzePullRequest = analyzePullRequest;
window.fetchAndAnalyzeFile = fetchAndAnalyzeFile;

console.log('main-functions.js loaded successfully');
console.log('analyzeGithubRepo:', typeof window.analyzeGithubRepo);
