// Advanced Metrics Dashboard with Charts
// Handles visualization of code quality trends and statistics

class MetricsDashboard {
    constructor() {
        this.charts = {};
        this.initializeCharts();
    }

    initializeCharts() {
        // Quality Trend Chart
        this.createQualityTrendChart();

        // Bug Count Chart
        this.createBugCountChart();

        // Language Usage Chart
        this.createLanguageUsageChart();

        // Complexity Trend Chart
        this.createComplexityTrendChart();
    }

    createQualityTrendChart() {
        const ctx = document.getElementById('qualityTrendChart');
        if (!ctx) return;

        const history = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
        const last10 = history.slice(0, 10).reverse();

        const labels = last10.map((_, idx) => `Analysis ${idx + 1}`);
        const data = last10.map(h => {
            const score = h.aiScore || h.mlScore;
            return typeof score === 'string' ? parseInt(score) : score;
        });

        this.charts.qualityTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Quality Score',
                    data: data,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: { color: '#fff' }
                    },
                    title: {
                        display: true,
                        text: 'Code Quality Trend',
                        color: '#fff',
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' }
                    }
                }
            }
        });
    }

    createBugCountChart() {
        const ctx = document.getElementById('bugCountChart');
        if (!ctx) return;

        const history = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
        const last10 = history.slice(0, 10).reverse();

        const labels = last10.map((_, idx) => `#${idx + 1}`);
        const bugData = last10.map(h => h.stats?.bugs || 0);
        const securityData = last10.map(h => h.stats?.security || 0);

        this.charts.bugCount = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Bugs',
                        data: bugData,
                        backgroundColor: 'rgba(239, 68, 68, 0.7)',
                        borderColor: 'rgb(239, 68, 68)',
                        borderWidth: 1
                    },
                    {
                        label: 'Security Issues',
                        data: securityData,
                        backgroundColor: 'rgba(245, 158, 11, 0.7)',
                        borderColor: 'rgb(245, 158, 11)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: { color: '#fff' }
                    },
                    title: {
                        display: true,
                        text: 'Issues Detected Over Time',
                        color: '#fff',
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#94a3b8', stepSize: 1 },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' }
                    }
                }
            }
        });
    }

    createLanguageUsageChart() {
        const ctx = document.getElementById('languageUsageChart');
        if (!ctx) return;

        const history = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
        const languageCounts = {};

        history.forEach(h => {
            languageCounts[h.language] = (languageCounts[h.language] || 0) + 1;
        });

        const labels = Object.keys(languageCounts);
        const data = Object.values(languageCounts);
        const colors = [
            'rgba(59, 130, 246, 0.7)',
            'rgba(139, 92, 246, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(239, 68, 68, 0.7)',
            'rgba(6, 182, 212, 0.7)'
        ];

        this.charts.languageUsage = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderColor: colors.slice(0, labels.length).map(c => c.replace('0.7', '1')),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: { color: '#fff', padding: 15 }
                    },
                    title: {
                        display: true,
                        text: 'Language Usage Distribution',
                        color: '#fff',
                        font: { size: 16, weight: 'bold' }
                    }
                }
            }
        });
    }

    createComplexityTrendChart() {
        const ctx = document.getElementById('complexityTrendChart');
        if (!ctx) return;

        const history = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
        const last10 = history.slice(0, 10).reverse();

        const labels = last10.map((_, idx) => `#${idx + 1}`);
        const data = last10.map(h => {
            // Complexity is inverse (10 is simple, 1 is complex)
            // Convert to 1-10 where 10 is most complex
            const complexity = h.metrics?.complexity || '5/10';
            const score = parseInt(complexity);
            return 11 - score; // Invert so higher = more complex
        });

        this.charts.complexityTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Complexity Level',
                    data: data,
                    borderColor: 'rgb(139, 92, 246)',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: { color: '#fff' }
                    },
                    title: {
                        display: true,
                        text: 'Code Complexity Trend',
                        color: '#fff',
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' }
                    }
                }
            }
        });
    }

    updateCharts() {
        // Destroy existing charts
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });

        // Recreate charts with new data
        this.initializeCharts();
    }
}

// Initialize dashboard when DOM is ready
let metricsDashboard = null;

document.addEventListener('DOMContentLoaded', () => {
    // Wait for Chart.js to load
    if (typeof Chart !== 'undefined') {
        metricsDashboard = new MetricsDashboard();
    }
});

// Export for use in other modules
window.metricsDashboard = metricsDashboard;
