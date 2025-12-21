// Advanced Features Implementation

// Sample Code Examples
const sampleCodes = {
    'python-good': `def calculate_fibonacci(n):
    """
    Calculate Fibonacci sequence up to n terms.
    
    Args:
        n (int): Number of terms to generate
        
    Returns:
        list: Fibonacci sequence
    """
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    
    sequence = [0, 1]
    for i in range(2, n):
        sequence.append(sequence[i-1] + sequence[i-2])
    
    return sequence

# Example usage
result = calculate_fibonacci(10)
print(f"Fibonacci sequence: {result}")`,

    'python-bad': `def calc(n):
    if n==0:
        return []
    a=0
    b=1
    l=[a,b]
    for i in range(n-2):
        c=a+b
        l.append(c)
        a=b
        b=c
    return l

print(calc(10))`,

    'javascript-good': `/**
 * Fetch user data from API
 * @param {number} userId - The user ID to fetch
 * @returns {Promise<Object>} User data object
 */
async function fetchUserData(userId) {
    try {
        const response = await fetch(\`https://api.example.com/users/\${userId}\`);
        
        if (!response.ok) {
            throw new Error(\`HTTP error! status: \${response.status}\`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
}

// Usage
fetchUserData(123)
    .then(user => console.log('User:', user))
    .catch(err => console.error('Failed:', err));`,

    'javascript-bad': `function getUser(id) {
    fetch('https://api.example.com/users/' + id)
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.log('Error:', error);
        });
}

getUser(123);`
};

// Initialize features when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    // File Upload Handler
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileInput');
    const codeInput = document.getElementById('codeInput');
    const sampleSelect = document.getElementById('sampleSelect');

    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    codeInput.value = event.target.result;
                    showNotification('File uploaded successfully!', 'success');
                };
                reader.readAsText(file);
            }
        });
    }

    // Drag and Drop Support
    if (codeInput) {
        codeInput.addEventListener('dragover', (e) => {
            e.preventDefault();
            codeInput.style.borderColor = 'var(--accent-primary)';
            codeInput.style.background = 'rgba(88, 166, 255, 0.05)';
        });

        codeInput.addEventListener('dragleave', (e) => {
            e.preventDefault();
            codeInput.style.borderColor = '';
            codeInput.style.background = '';
        });

        codeInput.addEventListener('drop', (e) => {
            e.preventDefault();
            codeInput.style.borderColor = '';
            codeInput.style.background = '';

            const file = e.dataTransfer.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    codeInput.value = event.target.result;
                    showNotification('File dropped successfully!', 'success');
                };
                reader.readAsText(file);
            }
        });
    }

    // Sample Code Selector
    if (sampleSelect) {
        sampleSelect.addEventListener('change', (e) => {
            const sample = e.target.value;
            if (sample && sampleCodes[sample]) {
                codeInput.value = sampleCodes[sample];
                showNotification('Sample code loaded!', 'success');
                e.target.value = '';
            }
        });
    }
});

// Theme removed - keeping dark theme only

// Analysis History
let analysisHistory = JSON.parse(localStorage.getItem('analysisHistory') || '[]');

// Dashboard Logic
function updateDashboard() {
    const history = JSON.parse(localStorage.getItem('analysisHistory') || '[]');

    // Stats elements
    const totalEl = document.getElementById('totalAnalyses');
    const avgScoreEl = document.getElementById('avgQualityScore');
    const issuesEl = document.getElementById('totalIssues');
    // const langEl = document.getElementById('topLanguage');

    if (!totalEl) return; // Not on dashboard page or elements missing

    // Calculate stats
    const total = history.length;
    let totalScore = 0;
    let totalIssuesCount = 0;

    history.forEach(h => {
        // Parse scores which might be strings like "8/10"
        const mlScore = typeof h.mlScore === 'string' ? parseInt(h.mlScore) : (h.mlScore || 0);
        const aiScore = typeof h.aiScore === 'string' ? parseInt(h.aiScore) : (h.aiScore || 0);

        // Use greater of the two or average? Let's use AI score if available, else ML
        const score = aiScore || mlScore;
        totalScore += score;

        // Issues (estimate since we don't store full issue count in history summary, need to check how we save it)
        // Current saveToHistory saves 'results' which is the full object but maybe we only want to store summary in LS to save space?
        // Actually saveToHistory implementation above stores full object?
        // Let's check saveToHistory implementation... 
        // It stores: id, timestamp, code(snippet), language, mlScore, aiScore. 
        // It DOES NOT store issue counts. We should update saveToHistory to store issue counts.
        // For now, we'll leave issues as 0 or estimated.
        if (h.stats) {
            totalIssuesCount += (h.stats.bugs || 0) + (h.stats.security || 0);
        }
    });

    const avg = total > 0 ? (totalScore / total).toFixed(1) : '-';

    // Update DOM
    if (totalEl) totalEl.textContent = total;
    if (avgScoreEl) avgScoreEl.textContent = avg;
    if (issuesEl) issuesEl.textContent = totalIssuesCount > 0 ? totalIssuesCount : '-'; // Placeholder until we fix storage

    // Recent Activity List
    const listEl = document.getElementById('dashboardRecentList');
    if (listEl) {
        if (history.length === 0) {
            listEl.innerHTML = '<p class="text-muted text-center p-4">No recent activity.</p>';
        } else {
            listEl.innerHTML = history.slice(0, 5).map(entry => `
                <div class="flex justify-between items-center p-3 border-b border-white-10">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-primary-10 flex items-center justify-center text-primary">
                            <i class="fas fa-code"></i>
                        </div>
                        <div>
                            <div class="font-medium">${entry.language} Analysis</div>
                            <div class="text-xs text-muted">${new Date(entry.timestamp).toLocaleDateString()}</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="font-bold ${entry.aiScore >= 7 ? 'text-success' : 'text-warning'}">Score: ${entry.aiScore}</div>
                        <div class="text-xs text-muted">Model: Gemini</div>
                    </div>
                </div>
            `).join('');
        }
    }
}

// Update saveToHistory to include stats
function saveToHistory(code, language, results) {
    // Calculate stats
    const mlBugs = results.ml_analysis?.bugs?.length || 0;
    const mlSec = results.ml_analysis?.security?.length || 0;
    const aiBugs = results.ai_analysis?.bugs?.length || 0;
    const aiSec = results.ai_analysis?.security?.length || 0;

    const entry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        code: code.substring(0, 200) + '...',
        language: language,
        mlScore: results.ml_analysis?.overall_quality || 'N/A',
        aiScore: results.ai_analysis?.overall_quality || 'N/A',
        stats: {
            bugs: mlBugs + aiBugs,
            security: mlSec + aiSec
        }
    };

    let analysisHistory = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
    analysisHistory.unshift(entry);
    if (analysisHistory.length > 20) analysisHistory.pop(); // Increased limit
    localStorage.setItem('analysisHistory', JSON.stringify(analysisHistory));

    // Update dashboard immediately if visible
    updateDashboard();
}

// Initialize Dashboard on Load
document.addEventListener('DOMContentLoaded', function () {
    updateDashboard();
});

window.features = {
    saveToHistory,
    addCopyButtons,
    createCharts,
    showNotification,
    showHistoryModal,
    updateDashboard
};

// ... existing code ...




// Initialize Export PDF Button
document.addEventListener('DOMContentLoaded', function () {
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', async () => {
            showNotification('Generating PDF report...', 'info');

            try {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('p', 'mm', 'a4');

                // Title
                pdf.setFontSize(20);
                pdf.setTextColor(88, 166, 255);
                pdf.text('AI Code Review Report', 20, 20);

                // Date
                pdf.setFontSize(10);
                pdf.setTextColor(100, 100, 100);
                pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 28);

                // Language
                const detectedLang = document.getElementById('detectedLanguage').textContent;
                pdf.setFontSize(12);
                pdf.setTextColor(0, 0, 0);
                pdf.text(`Language: ${detectedLang}`, 20, 38);

                // ML Analysis
                pdf.setFontSize(14);
                pdf.setTextColor(63, 185, 80);
                pdf.text('ML Model Analysis (CodeBERT)', 20, 50);

                const mlScore = document.getElementById('mlQualityScore').textContent;
                const mlSummary = document.getElementById('mlQualitySummary').textContent;

                pdf.setFontSize(11);
                pdf.setTextColor(0, 0, 0);
                pdf.text(`Quality Score: ${mlScore}`, 20, 58);

                const mlSummaryLines = pdf.splitTextToSize(mlSummary, 170);
                pdf.text(mlSummaryLines, 20, 66);

                // AI Analysis
                let yPos = 66 + (mlSummaryLines.length * 5) + 10;
                pdf.setFontSize(14);
                pdf.setTextColor(88, 166, 255);
                pdf.text('AI Analysis (Gemini 2.5 Flash)', 20, yPos);

                const aiScore = document.getElementById('aiQualityScore').textContent;
                const aiSummary = document.getElementById('aiQualitySummary').textContent;

                pdf.setFontSize(11);
                pdf.setTextColor(0, 0, 0);
                pdf.text(`Quality Score: ${aiScore}`, 20, yPos + 8);

                const aiSummaryLines = pdf.splitTextToSize(aiSummary, 170);
                pdf.text(aiSummaryLines, 20, yPos + 16);

                // Save
                pdf.save(`code-review-${Date.now()}.pdf`);
                showNotification('PDF exported successfully!', 'success');
            } catch (error) {
                console.error('PDF export error:', error);
                showNotification('Failed to export PDF', 'error');
            }
        });
    }
});

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Copy to Clipboard
function addCopyButtons() {
    document.querySelectorAll('.issue-fix').forEach(element => {
        if (!element.querySelector('.copy-btn')) {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            copyBtn.title = 'Copy to clipboard';
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(element.textContent);
                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                showNotification('Copied to clipboard!', 'success');
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                }, 2000);
            };
            element.style.position = 'relative';
            element.appendChild(copyBtn);
        }
    });
}

// Charts
let metricsChart = null;
let issuesChart = null;

function createCharts(mlData, aiData) {
    // Metrics Comparison Chart
    const metricsCtx = document.getElementById('metricsChart');
    if (metricsChart) metricsChart.destroy();

    metricsChart = new Chart(metricsCtx, {
        type: 'radar',
        data: {
            labels: ['Complexity', 'Readability', 'Maintainability'],
            datasets: [{
                label: 'ML Model',
                data: [
                    parseScore(mlData.metrics.complexity),
                    parseScore(mlData.metrics.readability),
                    parseScore(mlData.metrics.maintainability)
                ],
                backgroundColor: 'rgba(63, 185, 80, 0.2)',
                borderColor: 'rgba(63, 185, 80, 1)',
                borderWidth: 2
            }, {
                label: 'AI Analysis',
                data: [
                    parseScore(aiData.metrics.complexity),
                    parseScore(aiData.metrics.readability),
                    parseScore(aiData.metrics.maintainability)
                ],
                backgroundColor: 'rgba(88, 166, 255, 0.2)',
                borderColor: 'rgba(88, 166, 255, 1)',
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                r: {
                    beginAtZero: true,
                    max: 10,
                    ticks: { color: '#8b949e' },
                    grid: { color: '#30363d' },
                    pointLabels: { color: '#c9d1d9' }
                }
            },
            plugins: {
                legend: { labels: { color: '#c9d1d9' } }
            }
        }
    });

    // Issues Distribution Chart
    const issuesCtx = document.getElementById('issuesChart');
    if (issuesChart) issuesChart.destroy();

    const mlBugs = mlData.bugs?.length || 0;
    const mlSecurity = mlData.security?.length || 0;
    const mlImprovements = mlData.improvements?.length || 0;
    const aiBugs = aiData.bugs?.length || 0;
    const aiSecurity = aiData.security?.length || 0;
    const aiImprovements = aiData.improvements?.length || 0;

    issuesChart = new Chart(issuesCtx, {
        type: 'doughnut',
        data: {
            labels: ['Bugs', 'Security', 'Improvements'],
            datasets: [{
                data: [mlBugs + aiBugs, mlSecurity + aiSecurity, mlImprovements + aiImprovements],
                backgroundColor: [
                    'rgba(248, 81, 73, 0.8)',
                    'rgba(210, 153, 34, 0.8)',
                    'rgba(88, 166, 255, 0.8)'
                ],
                borderColor: '#1c2128',
                borderWidth: 2
            }]
        },
        options: {
            plugins: {
                legend: { labels: { color: '#c9d1d9' } }
            }
        }
    });
}

function parseScore(score) {
    if (typeof score === 'string' && score.includes('/')) {
        return parseInt(score.split('/')[0]);
    }
    return 5; // default
}

// Export functions for use in main.js
window.features = {
    saveToHistory,
    addCopyButtons,
    createCharts,
    showNotification
};


// Footer Modal Handlers with Animations
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.remove('closing');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('closing');
        setTimeout(() => {
            modal.style.display = 'none';
            modal.classList.remove('closing');
            document.body.style.overflow = ''; // Restore scrolling
        }, 300);
    }
}

// Make closeModal available globally for onclick handlers
window.closeModal = closeModal;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Terms Link
    const termsLink = document.getElementById('termsLink');
    if (termsLink) {
        termsLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('termsModal');
        });
    }

    // Privacy Link
    const privacyLink = document.getElementById('privacyLink');
    if (privacyLink) {
        privacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('privacyModal');
        });
    }

    // About Link
    const aboutLink = document.getElementById('aboutLink');
    if (aboutLink) {
        aboutLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('aboutModal');
        });
    }

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            const modalId = e.target.id;
            closeModal(modalId);
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal[style*="display: flex"]');
            openModals.forEach(modal => {
                closeModal(modal.id);
            });
        }
    });
});
