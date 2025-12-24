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

// Save analysis to history (Firestore only)
window.features.saveToHistory = function (code, language, analysisData) {
    console.log('💾 Saving analysis to Firestore...');

    // Save to Firestore
    if (window.saveAnalysisToFirestore) {
        window.saveAnalysisToFirestore(code, language, analysisData);
    } else {
        console.error('❌ Firestore save function not available');
    }

    // Update dashboard after save
    if (window.features.updateDashboard) {
        // Delay to allow Firestore to update
        setTimeout(() => {
            window.features.updateDashboard();
        }, 500);
    }
};

// Update dashboard (Firestore only)
window.features.updateDashboard = function () {
    if (window.loadUserHistory) {
        window.loadUserHistory().then(firestoreHistory => {
            if (firestoreHistory && firestoreHistory.length > 0) {
                window.features.updateDashboardWithFirestore(firestoreHistory);
            } else {
                console.log('📭 No analysis history found in Firestore');
                // Show empty state
                const totalEl = document.getElementById('totalAnalyses');
                if (totalEl) {
                    totalEl.textContent = '0';
                    document.getElementById('avgQualityScore').textContent = '-';
                    document.getElementById('totalIssues').textContent = '0';
                }
            }
        }).catch((error) => {
            console.error('❌ Error loading from Firestore:', error);
            // Show error state
            const totalEl = document.getElementById('totalAnalyses');
            if (totalEl) {
                totalEl.textContent = '-';
                document.getElementById('avgQualityScore').textContent = '-';
                document.getElementById('totalIssues').textContent = '-';
            }
        });
    } else {
        console.error('❌ Firestore loadUserHistory function not available');
    }
};


// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', () => {
    if (window.features && window.features.updateDashboard) {
        // Wait for Firebase to initialize
        setTimeout(() => {
            window.features.updateDashboard();
        }, 1000);
    }
});
