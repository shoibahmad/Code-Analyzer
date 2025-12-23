// Browser Notification System
// Handles browser notifications for analysis completion and other events

class NotificationSystem {
    constructor() {
        this.permission = 'default';
        this.init();
    }

    async init() {
        // Check if browser supports notifications
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return;
        }

        // Request permission if not already granted
        this.permission = Notification.permission;

        if (this.permission === 'default') {
            await this.requestPermission();
        }
    }

    async requestPermission() {
        try {
            this.permission = await Notification.requestPermission();
            if (this.permission === 'granted') {
                this.showWelcomeNotification();
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        }
    }

    showWelcomeNotification() {
        this.show({
            title: '🎉 Notifications Enabled!',
            body: 'You\'ll now receive notifications when your code analysis is complete.',
            icon: '/static/images/logo.png',
            tag: 'welcome'
        });
    }

    show(options) {
        if (this.permission !== 'granted') {
            console.warn('Notification permission not granted');
            return null;
        }

        const defaultOptions = {
            icon: '/static/images/logo.png',
            badge: '/static/images/badge.png',
            vibrate: [200, 100, 200],
            requireInteraction: false,
            silent: false
        };

        const notification = new Notification(options.title, {
            ...defaultOptions,
            ...options
        });

        // Auto close after 5 seconds if not requiring interaction
        if (!options.requireInteraction) {
            setTimeout(() => notification.close(), 5000);
        }

        // Handle click event
        notification.onclick = () => {
            window.focus();
            notification.close();
            if (options.onClick) {
                options.onClick();
            }
        };

        return notification;
    }

    notifyAnalysisComplete(language, score) {
        const emoji = score >= 8 ? '🎉' : score >= 6 ? '👍' : '⚠️';
        const quality = score >= 8 ? 'Excellent' : score >= 6 ? 'Good' : 'Needs Improvement';

        this.show({
            title: `${emoji} Analysis Complete!`,
            body: `${language} code analyzed. Quality Score: ${score}/10 (${quality})`,
            tag: 'analysis-complete',
            onClick: () => {
                // Scroll to results
                document.getElementById('resultsSection')?.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    notifyBugsFound(bugCount) {
        if (bugCount === 0) {
            this.show({
                title: '✅ No Bugs Found!',
                body: 'Your code looks clean. Great job!',
                tag: 'bugs-found'
            });
        } else {
            this.show({
                title: `🐛 ${bugCount} Bug${bugCount > 1 ? 's' : ''} Detected`,
                body: `Found ${bugCount} potential issue${bugCount > 1 ? 's' : ''} in your code. Check the analysis for details.`,
                tag: 'bugs-found',
                requireInteraction: true
            });
        }
    }

    notifySecurityIssues(count) {
        if (count > 0) {
            this.show({
                title: `🔒 ${count} Security Issue${count > 1 ? 's' : ''} Found`,
                body: `Critical: Review security vulnerabilities immediately!`,
                tag: 'security-issues',
                requireInteraction: true,
                onClick: () => {
                    // Scroll to security section
                    const securitySection = document.querySelector('[data-section="security"]');
                    securitySection?.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }

    notifyPDFDownload(status) {
        if (status === 'success') {
            this.show({
                title: '📄 PDF Downloaded!',
                body: 'Your comprehensive analysis report has been downloaded successfully.',
                tag: 'pdf-download'
            });
        } else {
            this.show({
                title: '❌ PDF Download Failed',
                body: 'There was an error generating your PDF. Please try again.',
                tag: 'pdf-error'
            });
        }
    }

    notifyHistorySaved() {
        this.show({
            title: '💾 Analysis Saved',
            body: 'Your analysis has been saved to history.',
            tag: 'history-saved'
        });
    }

    notifyError(message) {
        this.show({
            title: '⚠️ Error',
            body: message || 'An error occurred. Please try again.',
            tag: 'error',
            requireInteraction: true
        });
    }

    notifySuccess(title, message) {
        this.show({
            title: `✅ ${title}`,
            body: message,
            tag: 'success'
        });
    }

    notifyInfo(title, message) {
        this.show({
            title: `ℹ️ ${title}`,
            body: message,
            tag: 'info'
        });
    }

    // Request permission with custom UI
    async requestPermissionWithUI() {
        if (this.permission === 'granted') {
            return true;
        }

        // Show custom modal/toast asking for permission
        const shouldRequest = confirm(
            'Enable notifications to get alerts when your code analysis is complete. Would you like to enable notifications?'
        );

        if (shouldRequest) {
            await this.requestPermission();
            return this.permission === 'granted';
        }

        return false;
    }

    // Check if notifications are supported and enabled
    isEnabled() {
        return 'Notification' in window && this.permission === 'granted';
    }

    // Get permission status
    getPermissionStatus() {
        return this.permission;
    }
}

// Create global instance
const notificationSystem = new NotificationSystem();

// Export for use in other modules
window.notificationSystem = notificationSystem;

// Auto-request permission after 3 seconds if not already set
setTimeout(() => {
    if (notificationSystem.permission === 'default') {
        // Show a friendly prompt
        const enableNotifications = document.createElement('div');
        enableNotifications.className = 'notification-prompt';
        enableNotifications.innerHTML = `
            <div style="position: fixed; bottom: 20px; right: 20px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 1rem 1.5rem; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); z-index: 10000; max-width: 350px;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <i class="fas fa-bell" style="font-size: 1.5rem;"></i>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; margin-bottom: 0.25rem;">Enable Notifications?</div>
                        <div style="font-size: 0.85rem; opacity: 0.9;">Get notified when analysis completes</div>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                    <button onclick="notificationSystem.requestPermission(); this.parentElement.parentElement.remove();" style="flex: 1; padding: 0.5rem; background: white; color: #3b82f6; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">Enable</button>
                    <button onclick="this.parentElement.parentElement.remove();" style="flex: 1; padding: 0.5rem; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">Later</button>
                </div>
            </div>
        `;
        document.body.appendChild(enableNotifications);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (enableNotifications.parentElement) {
                enableNotifications.remove();
            }
        }, 10000);
    }
}, 3000);
