// Enhanced Loading Progress Indicator
// Shows detailed step-by-step progress during code analysis

class AnalysisProgressTracker {
    constructor() {
        this.currentStep = 0;
        this.steps = [
            { id: 1, name: 'Validating Code', icon: '✓', duration: 500 },
            { id: 2, name: 'Detecting Language', icon: '🔍', duration: 800 },
            { id: 3, name: 'Running ML Analysis', icon: '📊', duration: 2000 },
            { id: 4, name: 'Running AI Analysis', icon: '🤖', duration: 15000 }
        ];
        this.overlay = null;
        this.progressInterval = null;
    }

    show() {
        // Create overlay if it doesn't exist
        if (!this.overlay) {
            this.createOverlay();
        }

        this.overlay.style.display = 'flex';
        this.currentStep = 0;
        this.startProgress();
    }

    hide() {
        if (this.overlay) {
            this.overlay.style.display = 'none';
        }
        this.stopProgress();
    }

    createOverlay() {
        // Create overlay element
        this.overlay = document.createElement('div');
        this.overlay.id = 'analysisProgressOverlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(10px);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        // Create content container
        const content = document.createElement('div');
        content.style.cssText = `
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 16px;
            padding: 3rem;
            max-width: 500px;
            width: 90%;
            text-align: center;
        `;

        // Title
        const title = document.createElement('h2');
        title.style.cssText = `
            color: #fff;
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
            font-weight: 700;
        `;
        title.innerHTML = '🔍 Analyzing Your Code';

        // Subtitle
        const subtitle = document.createElement('p');
        subtitle.style.cssText = `
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.9rem;
            margin-bottom: 2rem;
        `;
        subtitle.textContent = 'Please wait while we perform comprehensive analysis...';

        // Progress container
        const progressContainer = document.createElement('div');
        progressContainer.id = 'progressSteps';
        progressContainer.style.cssText = `
            margin: 2rem 0;
        `;

        // Create step elements
        this.steps.forEach((step, index) => {
            const stepEl = document.createElement('div');
            stepEl.id = `step-${step.id}`;
            stepEl.className = 'progress-step';
            stepEl.style.cssText = `
                display: flex;
                align-items: center;
                padding: 1rem;
                margin: 0.5rem 0;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                border-left: 3px solid transparent;
                transition: all 0.3s;
            `;

            const icon = document.createElement('span');
            icon.className = 'step-icon';
            icon.style.cssText = `
                font-size: 1.5rem;
                margin-right: 1rem;
                opacity: 0.3;
            `;
            icon.textContent = step.icon;

            const text = document.createElement('span');
            text.className = 'step-text';
            text.style.cssText = `
                color: rgba(255, 255, 255, 0.5);
                font-size: 0.95rem;
                flex: 1;
                text-align: left;
            `;
            text.textContent = step.name;

            const status = document.createElement('span');
            status.className = 'step-status';
            status.style.cssText = `
                font-size: 0.85rem;
                color: rgba(255, 255, 255, 0.3);
            `;
            status.textContent = 'Waiting...';

            stepEl.appendChild(icon);
            stepEl.appendChild(text);
            stepEl.appendChild(status);
            progressContainer.appendChild(stepEl);
        });

        // Progress bar
        const progressBarContainer = document.createElement('div');
        progressBarContainer.style.cssText = `
            width: 100%;
            height: 6px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
            overflow: hidden;
            margin-top: 2rem;
        `;

        const progressBar = document.createElement('div');
        progressBar.id = 'analysisProgressBar';
        progressBar.style.cssText = `
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6);
            transition: width 0.3s ease;
        `;

        progressBarContainer.appendChild(progressBar);

        // Assemble
        content.appendChild(title);
        content.appendChild(subtitle);
        content.appendChild(progressContainer);
        content.appendChild(progressBarContainer);
        this.overlay.appendChild(content);
        document.body.appendChild(this.overlay);
    }

    startProgress() {
        this.currentStep = 0;
        this.updateStep(0);

        // Simulate progress through steps
        let totalTime = 0;
        this.steps.forEach((step, index) => {
            setTimeout(() => {
                this.updateStep(index);
            }, totalTime);
            totalTime += step.duration;
        });
    }

    updateStep(stepIndex) {
        if (stepIndex >= this.steps.length) return;

        const step = this.steps[stepIndex];
        const stepEl = document.getElementById(`step-${step.id}`);

        if (!stepEl) return;

        // Mark previous steps as complete
        for (let i = 0; i < stepIndex; i++) {
            const prevStepEl = document.getElementById(`step-${this.steps[i].id}`);
            if (prevStepEl) {
                prevStepEl.style.borderLeftColor = '#10b981';
                prevStepEl.style.background = 'rgba(16, 185, 129, 0.1)';
                prevStepEl.querySelector('.step-icon').style.opacity = '1';
                prevStepEl.querySelector('.step-text').style.color = 'rgba(255, 255, 255, 0.9)';
                prevStepEl.querySelector('.step-status').textContent = '✓ Complete';
                prevStepEl.querySelector('.step-status').style.color = '#10b981';
            }
        }

        // Update current step
        stepEl.style.borderLeftColor = '#3b82f6';
        stepEl.style.background = 'rgba(59, 130, 246, 0.1)';
        stepEl.querySelector('.step-icon').style.opacity = '1';
        stepEl.querySelector('.step-text').style.color = '#fff';
        stepEl.querySelector('.step-status').textContent = '⏳ In Progress...';
        stepEl.querySelector('.step-status').style.color = '#3b82f6';

        // Update progress bar
        const progress = ((stepIndex + 1) / this.steps.length) * 100;
        const progressBar = document.getElementById('analysisProgressBar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        this.currentStep = stepIndex;
    }

    completeStep(stepIndex) {
        if (stepIndex >= this.steps.length) return;

        const step = this.steps[stepIndex];
        const stepEl = document.getElementById(`step-${step.id}`);

        if (!stepEl) return;

        stepEl.style.borderLeftColor = '#10b981';
        stepEl.style.background = 'rgba(16, 185, 129, 0.1)';
        stepEl.querySelector('.step-status').textContent = '✓ Complete';
        stepEl.querySelector('.step-status').style.color = '#10b981';
    }

    stopProgress() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }
}

// Create global instance
const analysisProgress = new AnalysisProgressTracker();

// Export for use in other modules
window.analysisProgress = analysisProgress;
