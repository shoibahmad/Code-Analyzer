/**
 * Modern Toast Notification System
 * Beautiful, animated toast notifications with icons and auto-dismiss
 */

class ModernToast {
    constructor() {
        this.container = null;
        this.toasts = [];
        this.init();
    }

    init() {
        // Create container if it doesn't exist
        if (!document.querySelector('.toast-container')) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.toast-container');
        }
    }

    show(message, title = '', type = 'info', duration = 4000) {
        const toast = this.createToast(message, title, type, duration);
        this.container.appendChild(toast);
        this.toasts.push(toast);

        // Trigger animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Auto dismiss
        if (duration > 0) {
            const progressBar = toast.querySelector('.toast-progress');
            if (progressBar) {
                progressBar.style.width = '100%';
                progressBar.style.transition = `width ${duration}ms linear`;
                setTimeout(() => {
                    progressBar.style.width = '0%';
                }, 10);
            }

            setTimeout(() => {
                this.dismiss(toast);
            }, duration);
        }

        return toast;
    }

    createToast(message, title, type, duration) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle',
            loading: 'fa-spinner'
        };

        const icon = icons[type] || icons.info;

        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${this.escapeHtml(title)}</div>` : ''}
                <div class="toast-message">${this.escapeHtml(message)}</div>
            </div>
            <button class="toast-close" aria-label="Close">
                <i class="fas fa-times"></i>
            </button>
            ${duration > 0 ? '<div class="toast-progress"></div>' : ''}
        `;

        // Close button handler
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.dismiss(toast);
        });

        return toast;
    }

    dismiss(toast) {
        toast.classList.remove('show');
        toast.classList.add('hide');

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            const index = this.toasts.indexOf(toast);
            if (index > -1) {
                this.toasts.splice(index, 1);
            }
        }, 400);
    }

    success(message, title = 'Success') {
        return this.show(message, title, 'success');
    }

    error(message, title = 'Error') {
        return this.show(message, title, 'error');
    }

    warning(message, title = 'Warning') {
        return this.show(message, title, 'warning');
    }

    info(message, title = 'Info') {
        return this.show(message, title, 'info');
    }

    loading(message, title = 'Loading') {
        return this.show(message, title, 'loading', 0); // No auto-dismiss for loading
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    dismissAll() {
        this.toasts.forEach(toast => {
            this.dismiss(toast);
        });
    }
}

// Create global instance
window.toast = new ModernToast();

// Backward compatibility with old toast API
if (!window.showToast) {
    window.showToast = (message, type = 'info') => {
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Info'
        };
        window.toast.show(message, titles[type] || 'Info', type);
    };
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModernToast;
}
