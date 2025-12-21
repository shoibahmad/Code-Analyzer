// Firestore Integration for Dashboard and History

// Update dashboard from Firestore data
window.features = window.features || {};

window.features.updateDashboardWithFirestore = function (firestoreHistory) {
    const totalEl = document.getElementById('totalAnalyses');
    const avgScoreEl = document.getElementById('avgQualityScore');
    const issuesEl = document.getElementById('totalIssues');

    if (!totalEl) return;

    const total = firestoreHistory.length;
    let totalScore = 0;
    let totalIssuesCount = 0;

    firestoreHistory.forEach(h => {
        const mlScore = typeof h.mlQuality === 'string' ? parseInt(h.mlQuality) : (h.mlQuality || 0);
        const aiScore = typeof h.aiQuality === 'string' ? parseInt(h.aiQuality) : (h.aiQuality || 0);
        totalScore += (mlScore + aiScore) / 2;
        totalIssuesCount += (h.bugsCount || 0) + (h.securityCount || 0);
    });

    const avgScore = total > 0 ? (totalScore / total).toFixed(1) : 0;

    // Update UI
    totalEl.textContent = total;
    avgScoreEl.textContent = total > 0 ? `${avgScore}/10` : '-';
    issuesEl.textContent = totalIssuesCount;

    // Update recent activity
    const recentList = document.getElementById('recentActivityList');
    if (recentList) {
        if (firestoreHistory.length === 0) {
            recentList.innerHTML = '<p class="text-muted text-center py-4">No analysis history yet. Start by analyzing some code!</p>';
        } else {
            recentList.innerHTML = firestoreHistory.slice(0, 5).map(h => {
                const timestamp = h.timestamp ? (h.timestamp.toDate ? h.timestamp.toDate() : new Date(h.timestamp)) : new Date();
                return `
                <div class="activity-item p-3 mb-2 bg-white-5 rounded">
                    <div class="flex justify-between items-center">
                        <div>
                            <span class="badge badge-primary">${h.language || 'Unknown'}</span>
                            <span class="text-sm text-muted ml-2">${timestamp.toLocaleDateString()}</span>
                        </div>
                        <div class="text-sm">
                            <span class="text-primary">ML: ${h.mlQuality || 'N/A'}</span>
                            <span class="text-secondary ml-2">AI: ${h.aiQuality || 'N/A'}</span>
                        </div>
                    </div>
                    ${h.codeSnippet ? `<p class="text-xs text-muted mt-2 text-truncate">${h.codeSnippet.substring(0, 100)}...</p>` : ''}
                </div>
            `}).join('');
        }
    }
};

// Save analysis to history (both localStorage and Firestore)
window.features.saveToHistory = function (code, language, analysisData) {
    // Save to localStorage (for backward compatibility)
    const historyItem = {
        timestamp: Date.now(),
        language: language,
        mlScore: analysisData.ml_analysis?.overall_quality || 'N/A',
        aiScore: analysisData.ai_analysis?.overall_quality || 'N/A',
        totalBugs: (analysisData.ml_analysis?.bugs?.length || 0) + (analysisData.ai_analysis?.bugs?.length || 0),
        totalSecurity: (analysisData.ml_analysis?.security?.length || 0) + (analysisData.ai_analysis?.security?.length || 0)
    };

    let history = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
    history.unshift(historyItem);
    history = history.slice(0, 20); // Keep last 20
    localStorage.setItem('analysisHistory', JSON.stringify(history));

    // Save to Firestore if available
    if (window.saveAnalysisToFirestore) {
        window.saveAnalysisToFirestore(code, language, analysisData);
    }

    // Update dashboard
    if (window.features.updateDashboard) {
        window.features.updateDashboard();
    }
};

// Update dashboard (tries Firestore first, falls back to localStorage)
window.features.updateDashboard = function () {
    if (window.loadUserHistory) {
        window.loadUserHistory().then(firestoreHistory => {
            if (firestoreHistory && firestoreHistory.length > 0) {
                window.features.updateDashboardWithFirestore(firestoreHistory);
            } else {
                // Fallback to localStorage
                updateDashboardFromLocalStorage();
            }
        }).catch(() => {
            updateDashboardFromLocalStorage();
        });
    } else {
        updateDashboardFromLocalStorage();
    }
};

// Fallback: Update from localStorage
function updateDashboardFromLocalStorage() {
    const history = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
    const totalEl = document.getElementById('totalAnalyses');
    const avgScoreEl = document.getElementById('avgQualityScore');
    const issuesEl = document.getElementById('totalIssues');

    if (!totalEl) return;

    const total = history.length;
    let totalScore = 0;
    let totalIssuesCount = 0;

    history.forEach(h => {
        const mlScore = typeof h.mlScore === 'string' ? parseInt(h.mlScore) : (h.mlScore || 0);
        const aiScore = typeof h.aiScore === 'string' ? parseInt(h.aiScore) : (h.aiScore || 0);
        totalScore += (mlScore + aiScore) / 2;
        totalIssuesCount += (h.totalBugs || 0) + (h.totalSecurity || 0);
    });

    const avgScore = total > 0 ? (totalScore / total).toFixed(1) : 0;

    totalEl.textContent = total;
    avgScoreEl.textContent = total > 0 ? `${avgScore}/10` : '-';
    issuesEl.textContent = totalIssuesCount;

    const recentList = document.getElementById('recentActivityList');
    if (recentList) {
        if (history.length === 0) {
            recentList.innerHTML = '<p class="text-muted text-center py-4">No analysis history yet. Start by analyzing some code!</p>';
        } else {
            recentList.innerHTML = history.slice(0, 5).map(h => `
                <div class="activity-item p-3 mb-2 bg-white-5 rounded">
                    <div class="flex justify-between items-center">
                        <div>
                            <span class="badge badge-primary">${h.language || 'Unknown'}</span>
                            <span class="text-sm text-muted ml-2">${new Date(h.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div class="text-sm">
                            <span class="text-primary">ML: ${h.mlScore || 'N/A'}</span>
                            <span class="text-secondary ml-2">AI: ${h.aiScore || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
}

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', () => {
    if (window.features && window.features.updateDashboard) {
        window.features.updateDashboard();
    }
});
