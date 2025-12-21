// PDF Generation Module for Code Analysis Reports

class AnalysisPDFGenerator {
    constructor() {
        this.currentAnalysisData = null;
        this.currentCode = null;
        this.currentLanguage = null;
    }

    // Store analysis data for PDF generation
    storeAnalysisData(code, language, data) {
        this.currentCode = code;
        this.currentLanguage = language;
        this.currentAnalysisData = data;
    }

    // Generate and download PDF
    async generatePDF() {
        if (!this.currentAnalysisData) {
            window.toast.error('No analysis data available', 'PDF Generation Failed');
            return;
        }

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            const contentWidth = pageWidth - (margin * 2);
            let yPosition = margin;

            // Helper function to check if we need a new page
            const checkPageBreak = (requiredSpace = 20) => {
                if (yPosition + requiredSpace > pageHeight - margin) {
                    doc.addPage();
                    yPosition = margin;
                    return true;
                }
                return false;
            };

            // Helper function to add wrapped text
            const addWrappedText = (text, x, y, maxWidth, fontSize = 10, color = [0, 0, 0]) => {
                doc.setFontSize(fontSize);
                doc.setTextColor(...color);
                const lines = doc.splitTextToSize(text, maxWidth);
                doc.text(lines, x, y);
                return lines.length * (fontSize * 0.5); // Return height used
            };

            // === HEADER ===
            // Gradient-like header background
            doc.setFillColor(59, 130, 246); // Primary blue
            doc.rect(0, 0, pageWidth, 40, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont(undefined, 'bold');
            doc.text('Code Analysis Report', margin, 20);

            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text(`Generated on ${new Date().toLocaleString()}`, margin, 30);

            yPosition = 50;

            // === CODE INFORMATION ===
            doc.setFillColor(240, 240, 245);
            doc.rect(margin, yPosition, contentWidth, 25, 'F');

            doc.setTextColor(30, 41, 59);
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('Code Information', margin + 5, yPosition + 8);

            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text(`Language: ${this.currentLanguage || 'Unknown'}`, margin + 5, yPosition + 16);
            doc.text(`Analysis Time: ${this.currentAnalysisData.analysis_time?.toFixed(2) || '0'}s`, margin + 80, yPosition + 16);

            yPosition += 35;

            // === ML MODEL ANALYSIS ===
            checkPageBreak(30);
            doc.setFillColor(139, 92, 246); // Purple
            doc.rect(margin, yPosition, contentWidth, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('ML Model Analysis (CodeBERT)', margin + 5, yPosition + 6);
            yPosition += 12;

            const mlData = this.currentAnalysisData.ml_analysis || {};

            // ML Quality Score
            doc.setFontSize(11);
            doc.setTextColor(59, 130, 246);
            doc.setFont(undefined, 'bold');
            doc.text(`Overall Quality: ${mlData.overall_quality || 'N/A'}`, margin, yPosition);
            yPosition += 8;

            // ML Summary
            if (mlData.summary) {
                checkPageBreak(20);
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                doc.setFont(undefined, 'italic');
                const summaryHeight = addWrappedText(mlData.summary, margin, yPosition, contentWidth, 10, [100, 100, 100]);
                yPosition += summaryHeight + 5;
            }

            // ML Metrics
            if (mlData.metrics) {
                checkPageBreak(25);
                doc.setFontSize(11);
                doc.setTextColor(30, 41, 59);
                doc.setFont(undefined, 'bold');
                doc.text('Code Metrics:', margin, yPosition);
                yPosition += 6;

                doc.setFontSize(10);
                doc.setFont(undefined, 'normal');
                doc.text(`• Complexity: ${mlData.metrics.complexity || 'N/A'}`, margin + 5, yPosition);
                doc.text(`• Readability: ${mlData.metrics.readability || 'N/A'}`, margin + 70, yPosition);
                doc.text(`• Maintainability: ${mlData.metrics.maintainability || 'N/A'}`, margin + 135, yPosition);
                yPosition += 10;
            }

            // ML Bugs
            if (mlData.bugs && mlData.bugs.length > 0) {
                checkPageBreak(15);
                doc.setFontSize(11);
                doc.setTextColor(239, 68, 68); // Red
                doc.setFont(undefined, 'bold');
                doc.text(`Bugs Detected (${mlData.bugs.length}):`, margin, yPosition);
                yPosition += 6;

                mlData.bugs.forEach((bug, idx) => {
                    checkPageBreak(20);
                    doc.setFillColor(254, 242, 242);
                    doc.rect(margin, yPosition, contentWidth, 15, 'F');

                    doc.setFontSize(9);
                    doc.setTextColor(220, 38, 38);
                    doc.setFont(undefined, 'bold');
                    doc.text(`${idx + 1}. ${bug.issue || 'Issue detected'}`, margin + 2, yPosition + 5);

                    doc.setFont(undefined, 'normal');
                    doc.setTextColor(100, 100, 100);
                    const fixHeight = addWrappedText(bug.fix || 'No fix available', margin + 2, yPosition + 10, contentWidth - 4, 8, [100, 100, 100]);
                    yPosition += Math.max(15, fixHeight + 10);
                });
            }

            // ML Security Issues
            if (mlData.security && mlData.security.length > 0) {
                checkPageBreak(15);
                doc.setFontSize(11);
                doc.setTextColor(245, 158, 11); // Orange
                doc.setFont(undefined, 'bold');
                doc.text(`Security Issues (${mlData.security.length}):`, margin, yPosition);
                yPosition += 6;

                mlData.security.forEach((sec, idx) => {
                    checkPageBreak(20);
                    doc.setFillColor(255, 251, 235);
                    doc.rect(margin, yPosition, contentWidth, 15, 'F');

                    doc.setFontSize(9);
                    doc.setTextColor(217, 119, 6);
                    doc.setFont(undefined, 'bold');
                    doc.text(`${idx + 1}. ${sec.risk || 'Security risk'}`, margin + 2, yPosition + 5);

                    doc.setFont(undefined, 'normal');
                    doc.setTextColor(100, 100, 100);
                    const mitigationHeight = addWrappedText(sec.mitigation || 'Review security practices', margin + 2, yPosition + 10, contentWidth - 4, 8, [100, 100, 100]);
                    yPosition += Math.max(15, mitigationHeight + 10);
                });
            }

            yPosition += 10;

            // === GEMINI AI ANALYSIS ===
            checkPageBreak(30);
            doc.setFillColor(16, 185, 129); // Green
            doc.rect(margin, yPosition, contentWidth, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('Gemini AI Analysis', margin + 5, yPosition + 6);
            yPosition += 12;

            const aiData = this.currentAnalysisData.ai_analysis || {};

            // AI Quality Score
            doc.setFontSize(11);
            doc.setTextColor(16, 185, 129);
            doc.setFont(undefined, 'bold');
            doc.text(`Overall Quality: ${aiData.overall_quality || 'N/A'}`, margin, yPosition);
            yPosition += 8;

            // AI Summary
            if (aiData.summary) {
                checkPageBreak(25);
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                doc.setFont(undefined, 'italic');
                const aiSummaryHeight = addWrappedText(aiData.summary, margin, yPosition, contentWidth, 10, [100, 100, 100]);
                yPosition += aiSummaryHeight + 5;
            }

            // AI Complexity Analysis
            if (aiData.complexity_analysis) {
                checkPageBreak(20);
                doc.setFontSize(11);
                doc.setTextColor(30, 41, 59);
                doc.setFont(undefined, 'bold');
                doc.text('Complexity Analysis:', margin, yPosition);
                yPosition += 6;

                doc.setFontSize(10);
                doc.setFont(undefined, 'normal');
                doc.text(`• Time Complexity: ${aiData.complexity_analysis.time_complexity || 'N/A'}`, margin + 5, yPosition);
                yPosition += 5;
                doc.text(`• Space Complexity: ${aiData.complexity_analysis.space_complexity || 'N/A'}`, margin + 5, yPosition);
                yPosition += 10;
            }

            // === FOOTER ===
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFillColor(240, 240, 245);
                doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                doc.text(`AI Code Analyzer - Page ${i} of ${totalPages}`, margin, pageHeight - 8);
                doc.text(`© 2026 Alisha Shad`, pageWidth - margin - 30, pageHeight - 8);
            }

            // Save PDF
            const fileName = `code-analysis-${this.currentLanguage}-${Date.now()}.pdf`;
            doc.save(fileName);

            window.toast.success('PDF downloaded successfully!', 'Download Complete');
        } catch (error) {
            console.error('PDF generation error:', error);
            window.toast.error('Failed to generate PDF. Please try again.', 'PDF Generation Failed');
        }
    }
}

// Create global instance
window.pdfGenerator = new AnalysisPDFGenerator();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalysisPDFGenerator;
}
