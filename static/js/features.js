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
document.addEventListener('DOMContentLoaded', function() {
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

function saveToHistory(code, language, results) {
    const entry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        code: code.substring(0, 200) + '...',
        language: language,
        mlScore: results.ml_analysis.overall_quality,
        aiScore: results.ai_analysis.overall_quality
    };
    
    analysisHistory.unshift(entry);
    if (analysisHistory.length > 10) analysisHistory.pop();
    localStorage.setItem('analysisHistory', JSON.stringify(analysisHistory));
}

// Initialize History Button
document.addEventListener('DOMContentLoaded', function() {
    const historyBtn = document.getElementById('historyBtn');
    if (historyBtn) {
        historyBtn.addEventListener('click', () => {
            showHistoryModal();
        });
    }
});

function showHistoryModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-history"></i> Analysis History</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${analysisHistory.length === 0 ? 
                    '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">No history yet. Analyze some code to see it here!</p>' :
                    analysisHistory.map(entry => `
                        <div class="history-item">
                            <div class="history-header">
                                <span class="history-lang">${entry.language}</span>
                                <span class="history-time">${new Date(entry.timestamp).toLocaleString()}</span>
                            </div>
                            <div class="history-code">${entry.code}</div>
                            <div class="history-scores">
                                <span>ML: ${entry.mlScore}</span>
                                <span>AI: ${entry.aiScore}</span>
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}




// Initialize Export PDF Button
document.addEventListener('DOMContentLoaded', function() {
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
document.addEventListener('DOMContentLoaded', function() {
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
