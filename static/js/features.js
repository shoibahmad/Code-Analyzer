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

    'python-api': `from flask import Flask, jsonify, request
from functools import wraps
import jwt
import logging

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def token_required(f):
    """Decorator to protect routes with JWT authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

@app.route('/api/users/<int:user_id>', methods=['GET'])
@token_required
def get_user(current_user, user_id):
    """Get user information"""
    try:
        # Validate permissions
        if current_user != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Fetch user data (example)
        user_data = {
            'id': user_id,
            'name': 'John Doe',
            'email': 'john@example.com'
        }
        
        logger.info(f"User {user_id} data retrieved successfully")
        return jsonify(user_data), 200
        
    except Exception as e:
        logger.error(f"Error fetching user {user_id}: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500`,

    'python-security': `import os
import sqlite3

# SECURITY ISSUE: Hardcoded credentials
API_KEY = "sk-1234567890abcdef"
DATABASE_PASSWORD = "admin123"

def get_user_data(username):
    # SECURITY ISSUE: SQL Injection vulnerability
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    query = f"SELECT * FROM users WHERE username = '{username}'"
    cursor.execute(query)
    return cursor.fetchall()

def execute_command(cmd):
    # SECURITY ISSUE: Command injection vulnerability
    os.system(cmd)

# SECURITY ISSUE: Insecure random number generation
import random
session_token = random.randint(1000, 9999)

# SECURITY ISSUE: Eval usage
user_input = input("Enter calculation: ")
result = eval(user_input)`,

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

getUser(123);`,

    'javascript-react': `import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * UserProfile Component
 * Displays user information with loading and error states
 */
const UserProfile = ({ userId }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUser = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(\`/api/users/\${userId}\`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch user');
            }
            
            const data = await response.json();
            setUser(data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching user:', err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return (
            <div className="error">
                <p>Error: {error}</p>
                <button onClick={fetchUser}>Retry</button>
            </div>
        );
    }

    return (
        <div className="user-profile">
            <h2>{user.name}</h2>
            <p>Email: {user.email}</p>
            <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
    );
};

UserProfile.propTypes = {
    userId: PropTypes.number.isRequired
};

export default UserProfile;`,

    'javascript-bugs': `// BUG 1: Infinite loop
function processItems(items) {
    let i = 0;
    while (i < items.length) {
        console.log(items[i]);
        // Missing i++ - infinite loop!
    }
}

// BUG 2: Memory leak
let cache = {};
function addToCache(key, value) {
    cache[key] = value;
    // Cache never cleared - memory leak!
}

// BUG 3: Race condition
let counter = 0;
async function incrementCounter() {
    const current = counter;
    await new Promise(resolve => setTimeout(resolve, 100));
    counter = current + 1;
}

// BUG 4: Incorrect comparison
function checkValue(val) {
    if (val = 10) {  // Should be == or ===
        console.log("Value is 10");
    }
}

// BUG 5: Callback hell
getData(function(a) {
    getMoreData(a, function(b) {
        getMoreData(b, function(c) {
            getMoreData(c, function(d) {
                console.log(d);
            });
        });
    });
});`,

    'java-good': `import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * User management class with proper encapsulation and error handling
 */
public class UserManager {
    private final List<User> users;
    private static final int MAX_USERS = 1000;
    
    public UserManager() {
        this.users = new ArrayList<>();
    }
    
    /**
     * Add a new user with validation
     * @param user The user to add
     * @return true if user was added successfully
     * @throws IllegalArgumentException if user is null or invalid
     * @throws IllegalStateException if max users reached
     */
    public boolean addUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        
        if (users.size() >= MAX_USERS) {
            throw new IllegalStateException("Maximum user limit reached");
        }
        
        if (!isValidUser(user)) {
            throw new IllegalArgumentException("Invalid user data");
        }
        
        return users.add(user);
    }
    
    /**
     * Find user by ID
     * @param id The user ID to search for
     * @return Optional containing the user if found
     */
    public Optional<User> findUserById(int id) {
        return users.stream()
                   .filter(u -> u.getId() == id)
                   .findFirst();
    }
    
    private boolean isValidUser(User user) {
        return user.getName() != null && 
               !user.getName().trim().isEmpty() &&
               user.getEmail() != null &&
               user.getEmail().contains("@");
    }
}

class User {
    private final int id;
    private final String name;
    private final String email;
    
    public User(int id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }
    
    public int getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
}`,

    'java-bad': `import java.util.*;

public class UserMgr {
    public static List users = new ArrayList();
    
    public void add(Object u) {
        users.add(u);
    }
    
    public Object get(int i) {
        return users.get(i);
    }
    
    public void process() {
        for(int i=0;i<users.size();i++) {
            System.out.println(users.get(i));
        }
    }
}`,

    'cpp-good': `#include <iostream>
#include <memory>
#include <vector>
#include <string>

/**
 * Smart pointer-based resource management
 * Demonstrates RAII and modern C++ best practices
 */
class ResourceManager {
private:
    std::vector<std::unique_ptr<std::string>> resources;
    
public:
    ResourceManager() = default;
    
    // Delete copy constructor and assignment
    ResourceManager(const ResourceManager&) = delete;
    ResourceManager& operator=(const ResourceManager&) = delete;
    
    // Allow move operations
    ResourceManager(ResourceManager&&) = default;
    ResourceManager& operator=(ResourceManager&&) = default;
    
    ~ResourceManager() {
        std::cout << "Cleaning up resources..." << std::endl;
    }
    
    void addResource(const std::string& data) {
        resources.push_back(std::make_unique<std::string>(data));
    }
    
    const std::string* getResource(size_t index) const {
        if (index >= resources.size()) {
            return nullptr;
        }
        return resources[index].get();
    }
    
    size_t count() const {
        return resources.size();
    }
};

int main() {
    ResourceManager manager;
    manager.addResource("Resource 1");
    manager.addResource("Resource 2");
    
    std::cout << "Total resources: " << manager.count() << std::endl;
    
    // Resources automatically cleaned up when manager goes out of scope
    return 0;
}`,

    'cpp-bad': `#include <iostream>
using namespace std;

class Manager {
public:
    int* data;
    int size;
    
    Manager(int s) {
        size = s;
        data = new int[size];  // Memory allocated
    }
    
    // Missing destructor - memory leak!
    
    void process() {
        for(int i=0; i<=size; i++) {  // Buffer overflow!
            data[i] = i;
        }
    }
};

int main() {
    Manager* m = new Manager(10);
    m->process();
    // Memory never freed - leak!
    return 0;
}`
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

// Show History Modal Function
function showHistoryModal() {
    const history = JSON.parse(localStorage.getItem('analysisHistory') || '[]');

    if (history.length === 0) {
        if (window.toast) {
            window.toast.info('No analysis history yet. Start by analyzing some code!', 'History');
        } else {
            alert('No analysis history yet. Start by analyzing some code!');
        }
        return;
    }

    // For now, show a toast with history count
    // In the future, this could open a modal with full history
    if (window.toast) {
        window.toast.success(`You have ${history.length} analyses in your history`, 'Analysis History');
    } else {
        alert(`You have ${history.length} analyses in your history`);
    }

    console.log('Analysis History:', history);
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
